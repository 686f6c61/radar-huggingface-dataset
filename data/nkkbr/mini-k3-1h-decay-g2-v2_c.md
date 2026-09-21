# nkkbr/Mini-K3-1H-decay-g2-v2_C

## Resumen

Mini-K3-1H-decay-g2-v2_C es un checkpoint de preentrenamiento de la familia Mini-K3-1H v2, publicado por el usuario nkkbr en Hugging Face. Se trata de un modelo decoder-only de aproximadamente 1,02 mil millones de parametros logicos (351,8 millones activos por token) que reproduce a escala reducida los operadores de Kimi-K3: atencion lineal KDA combinada con Gated MLA, residuales de atencion por bloques, un MoE de tipo Stable LatentMoE, activaciones SiTU, puertas de salida y Quantile Balancing.

El checkpoint forma parte de una comparacion controlada de 20 arquitecturas en la que cada variante modifica un unico factor (proporcion KDA/MLA, granularidad del decaimiento, longitud de convolucion o codificacion posicional). En concreto, esta variante usa 2 grupos de decaimiento contiguos por cabeza en las capas KDA y modo posicional NoPE en las capas MLA.

Su relevancia es metodologica: sirve como proxy de bajo coste para estudiar decisiones de arquitectura hibrida antes de extrapolarlas a Kimi-K3 completo. Es importante senalar que el repositorio aloja el checkpoint de inicializacion (0 tokens consumidos, 0 pasos de optimizador), recuperado tras un fallo de serializacion del `dt_bias` que obligo a reiniciar el entrenamiento desde cero conservando datos, semilla y receta originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only hibrida: 13 capas (9 KDA de atencion lineal + 4 Gated MLA), MoE con 64 expertos enrutados y 2 compartidos, top-k 4 |
| Parametros totales | 1.015.025.092 (~1,02 mil millones) |
| Parametros activos | 351.800.772 por token (~352 millones) |
| Longitud de contexto | 8.192 tokens (longitud de secuencia de entrenamiento); no se declara una ventana de inferencia distinta |
| Tipos de cuantizacion | no disponible (solo se publican pesos BF16 en safetensors; no hay GGUF ni variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no la especifica) |
| Formato de pesos | safetensors (`model.safetensors`, BF16) con codigo de modelado propio (`modeling_mini_k3.py`, `configuration_mini_k3.py`) |
| Ancho oculto / cabezas / ancho de cabeza KDA | 1024 / 12 / 128 |
| Kernel de convolucion causal KDA | 4 (depthwise) |
| Grupos de decaimiento KDA por cabeza | 2 (contiguos) |
| Modo posicional MLA / puerta de salida | NoPE / activada |
| Capas densas antes del MoE | 1 |
| Ancho oculto de experto enrutado | 512 |
| Tamano de bloque de Attention Residuals | 4 |
| Vocabulario / BOS / EOS de generacion / PAD | 163.840 / 163.584 / 163.586 / 163.839 |
| Precision | BF16 en parametros; decaimiento KDA, convolucion, normalizacion y estado de control del router en FP32 |
| Revision publicada | `checkpoint-tokens-000000000000-init` (tag inmutable de Git) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only hibrido. Nueve de las trece capas (indices 1, 2, 3, 5, 6, 7, 9, 10, 11) emplean KDA, un mecanismo de atencion lineal con decaimiento por cabeza, convolucion causal depthwise de kernel 4 y estado recurrente de tamano constante. Las cuatro restantes (indices 4, 8, 12, 13) usan Gated MLA con modo posicional NoPE y puerta de salida. El bloque MoE aparece tras una unica capa densa y combina 64 expertos enrutados con 2 expertos compartidos, activando 4 por token, con ancho oculto de 512 y enrutamiento mediante puntuaciones sesgadas combinadas con puntuaciones sigmoideas sin sesgo renormalizadas (Quantile Balancing online con histograma de 1.000 bins). Otras innovaciones incluyen Attention Residuals con bloque de tamano 4 y activaciones SiTU.

La receta de entrenamiento prevista usa Muon por cabeza para las matrices Q/K/V expandidas, Muon para el resto de matrices, AdamW como respaldo para vectores y embeddings, weight decay de 0,1, QK-Clip por cabeza, decaimiento coseno y un 1 % de warmup lineal. El empaquetado de documentos esta fuertemente aislado: MLA usa mascara causal bloqueada por documento y el estado recurrente de KDA, asi como el historial de la convolucion corta Q/K/V, se reinician en cada frontera de segmento. Los 20 runs de la comparacion parten de inicializacion determinista por nombre y forma con semilla base `20260914`, de modo que los parametros compartidos arrancan identicos byte a byte.

El checkpoint publicado, sin embargo, no ha consumido ningun token: registra 0 objetivos validos de next-token y 0 pasos de optimizador. El tag final previsto, `checkpoint-tokens-016000000000-final`, solo se creara tras procesar exactamente 16.000.000.000 de objetivos de perdida validos. No se ha realizado post-entrenamiento de ningun tipo (ni RLHF ni DPO). La composicion exacta del dataset no se detalla en la model card: se indica que las revisiones fuente, cuotas de tokens y hashes de los manifiestos JSON acompanan al repositorio, y que los datasets originales conservan sus propias licencias y no se redistribuye su texto.

## Capacidades

- Generacion de texto autoregresiva: el modelo esta disenado para prediccion de siguiente token, pero al encontrarse en el paso 0 de entrenamiento no ha adquirido ninguna capacidad linguistica real.
- Razonamiento, codigo y matematicas: no disponible; no hay evaluacion posterior al entrenamiento ni resultados que respalden estas capacidades.
- Tool calling / function calling: no soportado; no se ha realizado ajuste por instrucciones ni formateo de herramientas.
- Agentes y razonamiento multi-paso: no soportado en el estado actual.
- Capacidades multilingues: no disponibles; no se declaran idiomas en la ficha.
- Modo de pensamiento (thinking), vision o audio: no disponibles; el modelo es exclusivamente de texto.
- Capacidad estructural diferencial: gracias a KDA, el coste de decodificacion no crece linealmente con la longitud de contexto en 9 de las 13 capas, lo que reduce el coste de memoria de estado respecto a un transformer denso equivalente.
- Capacidad de investigacion: sirve como unidad de comparacion reproducible dentro de un barrido de 20 arquitecturas con inicializacion byte-identica.

## Casos de uso

- Linea base de ablacion arquitectonica: este checkpoint es el punto de partida congelado de una de las 20 variantes del estudio; se usa para medir el efecto de la granularidad de decaimiento (2 grupos contiguos por cabeza) frente a las otras variantes, manteniendo identicos datos, semilla y optimizador.
- Verificacion de reproducibilidad de inicializacion: al compartir la semilla `20260914` y la inicializacion por nombre y forma, permite comprobar que los tensores compartidos entre arquitecturas son byte-identicos antes de lanzar un entrenamiento costoso.
- Pruebas de humo de infraestructura: los scripts `initialize_model.py` y `smoke_test.py` permiten validar que el pipeline de carga, el kernel KDA y el enrutador MoE funcionan correctamente antes de comprometer GPU-horas.
- Depuracion de serializacion de checkpoints: el fallo documentado en la disposicion portable de `dt_bias` convierte este repositorio en un caso de referencia para validar conversiones entre el layout de entrenamiento y el layout portable.
- Estudio de politicas de enmascarado y aislamiento de documentos: al reiniciar el estado recurrente de KDA y el historial de convolucion en cada frontera de segmento, permite analizar experimentalmente el impacto del empaquetado de documentos en tareas de contexto largo.
- Benchmarks de kernels de atencion lineal: sirve para medir throughput y consumo de memoria de KDA frente a MLA en hardware concreto, sin la variabilidad que introduciria un modelo ya entrenado.
- Analisis de balanceo de carga en MoE: el enrutamiento con Quantile Balancing de 1.000 bins sobre 64 expertos puede instrumentarse para estudiar la distribucion de tokens por experto en un modelo de un billon de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que se trata de un checkpoint intermedio de investigacion que no ha sido evaluado en tareas downstream. Solo se menciona el registro de NLL y perplejidad sobre un conjunto de desarrollo fijo durante el entrenamiento, almacenado en W&B y en metricas JSONL, sin valores publicados en el repositorio. Tampoco existe comparacion directa con otros modelos dentro de la informacion proporcionada.

## Requisitos de hardware

- Peso en BF16: ~2,03 GB de pesos (1.015.025.092 parametros x 2 bytes); el repositorio ocupa 2,0 GB, coherente con esta cifra.
- Estimaciones teoricas por cuantizacion (no hay versiones cuantizadas publicadas): ~4,06 GB en FP32, ~1,02 GB en int8 y ~0,51 GB en int4, mas overhead de runtime y estados en FP32.
- Memoria adicional: MLA comprime la cache KV en un latente, y las capas KDA mantienen estado recurrente de tamano constante, por lo que el coste de estado no crece con la longitud de contexto en esas capas. No se han publicado cifras exactas de VRAM en inferencia.
- Cabe en GPU de consumo: si. Con pesos BF16 (~2 GB) mas overhead de PyTorch, es viable en tarjetas de 8 GB o superiores (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070, RTX 4090).
- GPU de datacenter: A100, H100 o H200 no son necesarias para inferencia; solo se justifican si se va a reiniciar el entrenamiento, ya que el estado del optimizador y las activaciones elevan mucho el consumo.
- Entrenamiento: no se especifica hardware en la model card; se mencionan "hashes de eleccion de benchmark de hardware" en los manifiestos, pero sin detalle publico.
- Opciones de despliegue: carga nativa en PyTorch con el paquete autonomo incluido (`modeling_mini_k3.py`, `configuration_mini_k3.py`, `model.safetensors`). No consta soporte en vLLM, TGI, llama.cpp ni Ollama, ni existen pesos GGUF, por lo que un despliegue en esos motores requeriria integracion propia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No existen evaluaciones conjuntas entre este checkpoint y otros modelos. La tabla siguiente compara unicamente caracteristicas estructurales declaradas, con datos publicos de referencia, y no implica comparacion de rendimiento.

| Modelo | Parametros totales | Parametros activos | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|---|
| Mini-K3-1H-decay-g2-v2_C | 1.015.025.092 | 351.800.772 | 8.192 (entrenamiento) | Hibrida KDA + Gated MLA con MoE, 13 capas | no disponible |
| Qwen3-1.7B | ~1,7 mil millones | no aplica (denso) | 32.768 nativo | Transformer denso | Apache-2.0 |
| Kimi Linear 48B-A3B | ~48 mil millones | ~3 mil millones | no disponible | Hibrida KDA + MLA con MoE | no disponible |
| Kimi-K3 (referencia del proyecto) | no disponible | no disponible | no disponible | KDA + Gated MLA, segun la model card | no disponible |

La diferencia clave frente a alternativas densas del mismo orden de parametros es la activacion de solo ~35 % de los parametros por token y el uso de atencion lineal en 9 de 13 capas, lo que reduce el coste de decodificacion. Frente a Kimi Linear, comparte la familia de operadores KDA, pero a una escala mucho menor y sin resultados publicados.

## Limitaciones y advertencias

- El checkpoint publicado esta en inicializacion: 0 tokens consumidos y 0 pasos de optimizador. Cualquier salida de texto sera esencialmente aleatoria y no debe interpretarse como capacidad del modelo.
- No es un asistente: no ha recibido ajuste por instrucciones ni post-entrenamiento (ni RLHF, ni DPO), por lo que no sigue instrucciones ni mantiene formato conversacional.
- Riesgo de alucinacion, sesgo y contenido inseguro: la propia model card advierte de que las salidas pueden ser inexactas, sesgadas, inseguras o repetitivas.
- Ausencia total de evaluacion downstream: no hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, lo que impide afirmar nada sobre su calidad.
- Limitacion de extrapolacion: la model card advierte de que las conclusiones sobre ranking de arquitecturas a esta escala y con longitud de entrenamiento de 8K necesitan confirmacion antes de extrapolarse a Kimi-K3 completo.
- Licencia no especificada: al no declararse licencia, no puede asumirse permiso de uso comercial ni de redistribucion. Ademas, los datasets fuente conservan sus propias licencias y no se redistribuyen.
- Idiomas no declarados: se desconoce la cobertura linguistica real del entrenamiento previsto.
- Estado del optimizador no publicado: impide reanudar el entrenamiento exactamente desde este tag.
- Sin soporte en ecosistema estandar: al no existir pesos GGUF ni integracion en vLLM, TGI o llama.cpp, el despliegue en produccion requiere trabajo de integracion propio.
- Contexto limitado a la longitud de entrenamiento declarada: 8.192 tokens, sin mecanismos de extension documentados.
- Fallo de serializacion documentado: la recuperacion del run se debio a una discrepancia en el layout portable de `dt_bias`, lo que evidencia fragilidad en la conversion de checkpoints de esta familia.

## Enlaces

- Hugging Face: https://huggingface.co/nkkbr/Mini-K3-1H-decay-g2-v2_C
- Ficheros citados en la model card: `model.safetensors`, `modeling_mini_k3.py`, `configuration_mini_k3.py`, `initialize_model.py`, `smoke_test.py`, `config.json`
- Documentacion incluida en el repositorio: `ARCHITECTURE.md`, `ARCHITECTURE_PACKAGE_README.md`, `VARIANT.md`, manifiestos JSON con revisiones, cuotas de tokens, hashes de planificacion y configuracion del optimizador
- Repositorio del experimento y registro en W&B: mencionados en la model card, pero sin URL publica en la informacion disponible
- Paper de Kimi-K3 o de los operadores KDA y Gated MLA: no disponible en la informacion proporcionada
- Busqueda web: los resultados devueltos no guardan relacion con el modelo (foros sin contenido tecnico relevante), por lo que no se enlaza ninguno
