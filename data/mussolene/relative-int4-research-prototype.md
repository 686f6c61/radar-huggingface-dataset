# mussolene/relative-int4-research-prototype

## Resumen

Relative INT4 Research Prototype es un paquete de investigación publicado por el usuario mussolene en HuggingFace que explora una técnica de cuantización denominada "transferencia de pesos relativa por capas". La idea central es reparametrizar un mapa lineal original `y = x W + b` introduciendo `r = (x - c) / s`, de modo que `W_relative = diag(s) W` y `b_relative = b + c W`, preservando matemáticamente la función antes de cuantizar y aplicando después una corrección de bajo rango (`W_relative ~= W_INT4 + A B`) ajustada con activaciones de calibración.

El repositorio no contiene un LLM preentrenado ni un checkpoint compatible con `AutoModel` de Transformers. Se trata de un conjunto de checkpoints pequeños entrenados, pruebas sintéticas, un runtime de referencia en NumPy y un lector mínimo de safetensors. El propio autor lo califica explícitamente como un paquete de investigación, no como un motor de inferencia rápido ni como un framework de entrenamiento en bajo bit completado.

La relevancia del trabajo es metodológica: documenta resultados positivos parciales (INT4 relativo con corrección rank4 iguala la precisión FP32 en un MLP pequeño) y resultados negativos (no se establece ganancia de velocidad ni superioridad general frente a INT4 absoluto, y la variante INT4 relativa fue rechazada por calidad en la validación sobre Qwen3.5-4B). El repositorio incluye además referencias a cuatro artículos de arXiv y pruebas de compatibilidad con grafos Transformer causales y MoE top2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo único; el paquete contiene un MLP entrenado (64->64->10), una proyección sintética densa de 4096x4096, un Transformer causal sintético de dos bloques y un bloque MoE sintético (4 expertos, top2, d32, hidden64) |
| Parametros totales | No disponible (el paquete no contiene un LLM preentrenado; los checkpoints son pequeños y sintéticos) |
| Parametros activos | No aplica; el bloque MoE sintético usa enrutamiento top2 sobre 4 expertos |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT4 relativo (con y sin corrección de bajo rango rank4), INT8 relativo, FP32, FP16/BF16 (retenidos y promovidos a FP32). Almacenamiento W4A32 en el runtime de referencia; estudio QAT adicional en C++ con esquema W4A8 |
| Idiomas soportados | en, ru (según metadatos del repositorio; no hay evaluación de calidad lingüística) |
| Licencia | MIT |
| Formato de pesos | safetensors (lector mínimo propio, con shards indexados y tipos F32/F16/BF16) y NPZ |

## Arquitectura y entrenamiento

El paquete implementa una conversión capa por capa de matrices lineales seleccionadas explícitamente, con disposición `in_out` o `out_in`. Para cada capa se guardan referencias compartidas, códigos de peso INT4 agrupados, escalas, sesgo y factores de corrección de bajo rango. La política de precisión es mixta por capa (FP32/INT4) y la corrección `A B` se ajusta a partir de activaciones de calibración de la entrada de cada capa. El runtime de referencia emplea activaciones FP32 y desquantiza grupos para ejecutar `matmul` en NumPy; no es un kernel de cómputo entero. El grafo y las dimensiones lineales originales se preservan, sin restricción de cuaterniones ni reducción de anchura.

No se documenta un entrenamiento a escala de lenguaje. Los experimentos con modelos entrenados usan cinco checkpoints MLP `64 -> 64 -> 10` sobre el dataset `sklearn.digits`, con 359 ejemplos de calibración y 360 de test, sin ajuste fino posterior a la conversión. Los pesos originales en NPZ son FP64 y la referencia computacional los convierte explícitamente a FP32. Se incluyen además pruebas de compatibilidad con un Transformer causal sintético (dos bloques, 13 capas lineales transferidas) y con un bloque MoE sintético donde cada experto se calibra únicamente con las entradas enrutadas hacia él y el router FP32 permanece sin cambios. También se menciona un estudio QAT nativo en C++ con esquema W4A8 y una comparación con GPT-2 124M cuyos resultados no se detallan en el extracto disponible.

## Capacidades

- Conversión capa por capa de matrices lineales seleccionadas, con preservación de dimensiones y del grafo circundante.
- Transferencia relativa en FP32 que reproduce la salida original con error de redondeo (1,81e-7 de error relativo de logits en el MLP de prueba).
- Cuantización INT4 agrupada con corrección de error de bajo rango (rank4) ajustada por calibración.
- Política mixta de precisión por capa (FP32/INT4) y retención de tensores sensibles en BF16/FP16.
- Lector mínimo de safetensors con soporte de shards indexados y tipos F32/F16/BF16, además de NPZ.
- Ejecución de referencia en NumPy con dimensiones de entrada principales arbitrarias.
- Comprobaciones independientes de salida por capa y evaluación extremo a extremo sobre un MLP entrenado real.
- Pruebas de compatibilidad con grafos de Transformer causal sintético y MoE top2 con expertos calibrados por separado.
- Ejecutor nativo compilado y modelo de aplicación recargable para un experimento de clasificación de SMS reales.
- No incluye generación de texto de calidad, tool calling, capacidades de agente, visión ni audio.

## Casos de uso

- Reproducción académica del método de transferencia relativa: permite replicar la reparametrización `W_relative = diag(s) W` y medir el error relativo de logits sobre el MLP de `sklearn.digits` con los checkpoints incluidos.
- Evaluación de correcciones de bajo rango: la corrección rank4 reduce el error relativo de 0,07005 (INT4 absoluto) a 0,02124, lo que sirve para estudiar cuánto error de cuantización es recuperable con un presupuesto de rango pequeño.
- Estudio de compatibilidad MoE antes de escalar: el bloque sintético de 4 expertos con top2 y calibración por experto permite medir preservación de rutas (512 entradas de calibración, 256 de test) sin coste de entrenar un MoE real.
- Comparativa metodológica INT4 relativo frente a INT4 absoluto y Q8_0: el repositorio documenta resultados en CPU sobre Qwen3.5-4B donde INT8 relativo no supera a Q8_0 (5,62 GB frente a 4,47 GB de pesos de trabajo; mediana de petición completa de 7,717 s frente a 4,746 s).
- Punto de partida para pipelines QAT: el archivo `native_qat_study.zip` contiene un estudio previo en C++ con esquema W4A8 que puede reutilizarse como base para integrar la transferencia relativa en un flujo de entrenamiento con cuantización consciente.
- Desarrollo de lectores de pesos ligeros: el lector mínimo de safetensors, con soporte de shards y varios tipos numéricos, sirve como referencia para entornos donde no se quiere depender de la librería oficial completa.
- Validación de ejecutores nativos: el experimento de clasificación de SMS incluye un ejecutor nativo compilado y un modelo de aplicación recargable, útil para probar el ciclo conversión -> carga -> inferencia en un caso real y acotado.

## Benchmarks y rendimiento

MLP entrenado `64 -> 64 -> 10` sobre `sklearn.digits` (359 ejemplos de calibración, 360 de test, sin ajuste fino):

| Variante | Precision media | Concordancia con predicciones originales | Error relativo de logits |
|---|---:|---:|---:|
| Referencia FP32 original | 97,1111 % | 100 % | 0 |
| Transferencia FP32 relativa | 97,1111 % | 100 % | 1,81e-7 |
| INT4 absoluto | 97,0000 % | 99,2222 % | 0,07005 |
| INT4 relativo | 97,0556 % | 99,3333 % | 0,04671 |
| INT4 relativo + corrección rank4 | 97,1111 % | 99,7778 % | 0,02124 |

Proyección sintética de 4096 x 4096 (16.777.216 pesos aleatorios):

| Variante | Tamano | Error de salida | Latencia batch1 | Latencia batch16 |
|---|---:|---:|---:|---:|
| FP32 (W+b) | 67.125.248 bytes | 5,36e-7 (tras rebase) | ~1,62 ms (BLAS) | ~17,69 ms |
| INT4 relativo + rank4 | 9.553.240 bytes (aprox. 7,03x menor) | 0,09857 | ~16,81 ms | ~33,99 ms |

Bloque MoE sintético (4 expertos, top2, d32, hidden64; 512 calibración, 256 test):

| Variante | Error relativo de salida del bloque | Rutas de test preservadas |
|---|---:|---|
| FP32 relativo | 1,12e-7 | Si |
| INT4 relativo | 0,05972 | Si |
| INT4 relativo + rank4 | 0,04907 | Si |

Transformer causal sintético sin entrenar (dos bloques, 13 capas lineales transferidas): la transferencia FP32 preserva todas las predicciones top1 y la generación greedy probadas; INT4+rank4 obtiene un 68,75 % de concordancia top1 con error de logits acumulado sustancial.

Prueba en CPU sobre Qwen3.5-4B: INT8 relativo conserva calidad pero no supera a Q8_0 (pesos de trabajo 5,62 GB frente a 4,47 GB; mediana de petición completa 7,717 s frente a 4,746 s). INT4 relativo fue rechazado por calidad en validación. Los tiempos de BF16 e INT8 relativo son diagnósticos debido a fallos de E/S del proceso, por lo que no se establece una aceleración limpia respecto a BF16. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- No se reporta uso de GPU en ningún experimento; todas las mediciones son en CPU con el runtime de referencia en NumPy y activaciones FP32.
- Huella de memoria de la proyección 4096x4096: 67.125.248 bytes en FP32 frente a 9.553.240 bytes en INT4 relativo + rank4 (incluyendo metadatos), aproximadamente 7,03x menor.
- Huella de pesos de trabajo en la prueba sobre Qwen3.5-4B: 5,62 GB con INT8 relativo frente a 4,47 GB con Q8_0 estándar.
- VRAM estimada: no disponible; el repositorio ocupa 0,0 GB y no se documentan requisitos de memoria para GPU.
- GPU recomendadas: no disponibles; no hay implementación de kernels enteros ni ruta CUDA documentada.
- Compatibilidad con GPU de consumo: no evaluada. Por tamano, los artefactos incluidos (checkpoints pequeños y modelo de aplicación de SMS) caben sin problema en cualquier GPU de consumo, pero no existe una ruta de despliegue GPU soportada.
- Opciones de despliegue: runtime de referencia en NumPy, lector mínimo de safetensors, ejecutor nativo compilado para el experimento de clasificación de SMS y estudio QAT en C++. No hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en la proyección sintética, batch1 ~16,81 ms (INT4+rank4) frente a ~1,62 ms (FP32 BLAS); batch16 ~33,99 ms frente a ~17,69 ms. El autor indica que el conversor y el runtime actuales no establecen una ventaja de velocidad de inferencia.

## Comparativa con modelos similares

No se identifican modelos publicados comparables en la misma categoría dentro de la información disponible, porque este paquete no es un LLM desplegable sino un prototipo de cuantización. La comparación relevante es interna, entre las variantes del propio método y la línea base de cuantización estándar:

| Variante | Precisión relativa | Tamano de pesos | Error relativo de logits (MLP digits) | Velocidad |
|---|---|---|---|---|
| FP32 original (línea base) | 1,0 | 1,0x | 0 | 1,0x |
| INT4 absoluto | 1,0 | Menor que FP32 | 0,07005 | No establecida |
| INT4 relativo | 1,0 | Menor que FP32 | 0,04671 | No establecida |
| INT4 relativo + rank4 | 1,0 | Aprox. 7,03x menor que FP32 en la proyección sintética | 0,02124 | ~10,4x más lento que FP32 BLAS en batch1 |
| Q8_0 estándar (prueba Qwen3.5-4B) | Calidad preservada | 4,47 GB de pesos de trabajo | No disponible | 4,746 s de mediana por petición frente a 7,717 s del INT8 relativo |

## Limitaciones y advertencias

- El paquete no es un LLM preentrenado, ni un checkpoint `AutoModel` de Transformers, ni un motor de inferencia rápido de propósito general, ni un framework de entrenamiento en bajo bit completado.
- La variante INT4 relativa fue rechazada por calidad en la validación sobre Qwen3.5-4B; su ventaja no está demostrada de forma general.
- La corrección rank4 apenas ayuda cuando el error es de rango completo y aleatorio (proyección 4096x4096), y el INT4 relativo sin corrección es ligeramente peor que el INT4 absoluto.
- El runtime de referencia no aporta ventaja de velocidad: usa activaciones FP32 y desquantiza grupos para `matmul` en NumPy. Es almacenamiento W4A32, no un kernel entero.
- Igualar la precisión media no implica predicciones idénticas ni equivalencia estadísticamente establecida; la partición de test se usó en investigación previa y las cinco inicializaciones no son cinco conjuntos de test independientes.
- En el Transformer causal sintético, INT4+rank4 solo conserva el 68,75 % de las predicciones top1, con error de logits acumulado sustancial. No es una evaluación de calidad de lenguaje.
- La prueba MoE es de un único bloque; cuantizar bloques anteriores puede alterar las entradas de routers posteriores. No valida un MoE entrenado, cobertura de expertos dispersos, paralelismo de expertos ni costes de comunicación.
- El lector mínimo de safetensors no sustituye a la validación de producción de la librería oficial.
- No hay evaluación lingüística ni de sesgos; los idiomas declarados (en, ru) provienen de los metadatos y no de una validación de capacidades.
- Los tiempos de BF16 e INT8 relativo son diagnósticos por fallos de E/S del proceso, por lo que no deben interpretarse como medidas limpias.
- Licencia MIT: permite uso comercial y modificación, pero al ser artefactos de investigación no existen garantías de idoneidad para producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación externa de los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mussolene/relative-int4-research-prototype
- Resultados y limitaciones del experimento Qwen3.5-4B: https://huggingface.co/mussolene/relative-int4-research-prototype/blob/main/qwen35_experiment/README.md
- Estudio QAT nativo en C++ (W4A8): https://huggingface.co/mussolene/relative-int4-research-prototype/blob/main/native_qat_study.zip
- arXiv 2402.02446: https://arxiv.org/abs/2402.02446
- arXiv 1902.08153: https://arxiv.org/abs/1902.08153
- arXiv 2305.14314: https://arxiv.org/abs/2305.14314
- arXiv 2310.16795: https://arxiv.org/abs/2310.16795
- Busqueda web: no se han encontrado enlaces adicionales relevantes sobre el modelo; los resultados devueltos correspondían a portales de noticias sin relación con el repositorio.
