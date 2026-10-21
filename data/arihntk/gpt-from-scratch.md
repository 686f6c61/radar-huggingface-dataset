# arihntk/gpt-from-scratch

## Resumen

`arihntk/gpt-from-scratch` es un modelo de lenguaje de tipo GPT-2 implementado y entrenado desde cero en PyTorch por el usuario arihntk. Cuenta con 11.139.072 parámetros en precisión float32, 6 capas, 6 cabezas de atención, anchura de embedding de 384 y una longitud de contexto de 256 tokens. Usa un tokenizador BPE de nivel de byte con un vocabulario de solo 1024 tokens, entrenado sobre el mismo corpus que el modelo: Tiny Shakespeare (1.115.394 caracteres).

No es un modelo pensado para producción ni para tareas generales: es un ejercicio de referencia que reproduce el pipeline completo (tokenizador, arquitectura, bucle de entrenamiento, evaluación y script de generación) en un único repositorio, y que se distribuye con pesos en safetensors y código fuente ejecutable. Su relevancia es educativa y de reproducibilidad: permite inspeccionar de principio a fin un transformer decoder-only entrenado en hardware de consumo.

El checkpoint publicado corresponde al paso 750 de un plan de 2500 pasos, que fue el punto de mejor pérdida de validación (4,0174; perplejidad 55,56). A partir de ahí el modelo sobreajusta de forma clara: en el paso 2499 la pérdida de entrenamiento baja a 0,2399 mientras la de validación sube a 6,0090 (perplejidad 407,09). El entrenamiento completo se ejecutó en un MacBook Air M4 con 16 GB de memoria unificada en 1412,7 segundos (unos 23,5 minutos).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (pre-LayerNorm, activación GELU, embeddings de entrada y salida atados) |
| Parametros totales | 11.139.072 (float32) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | No disponible: solo se publican pesos en float32 (safetensors y checkpoint PyTorch `best.pt`); no hay versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | Inglés (inglés isabelino/early modern English del corpus) |
| Licencia | MIT |
| Formato de pesos | safetensors (principal) y `.pt` (PyTorch, alternativa) |
| Capas / cabezas / dimension de embedding | 6 / 6 / 384 |
| Vocabulario | 1024 tokens (BPE de nivel de byte, tabla de merges en `tok.json`) |
| Normalizacion | LayerNorm antes de cada bloque |
| Funcion de activacion | GELU |
| Precision de los pesos | float32 |
| Paso del checkpoint | 750 de 2500 (mejor pérdida de validación) |
| Perdida / perplejidad de validacion | 4,0174 / 55,56 |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes en HuggingFace | 0 / 1 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clásico de estilo GPT-2 con normalización previa a cada bloque (pre-LN), activación GELU, 6 capas y 6 cabezas de atención con anchura de embedding 384, lo que da una dimensión por cabeza de 64. Los embeddings de entrada y de salida están atados (*weight tying*), lo que reduce el recuento de parámetros y es coherente con un vocabulario de 1024 tokens. El tokenizador es un BPE de nivel de byte entrenado sobre el mismo corpus con un vocabulario de 1024 merges, guardado en `tok.json`.

El entrenamiento usó Tiny Shakespeare (1.115.394 caracteres, dominio público), tokenizado en 399.354 tokens de entrenamiento y 44.373 de validación. El optimizador es AdamW con tasa de aprendizaje 0,001, calentamiento lineal de 100 pasos y decaimiento coseno, con lotes de 32 secuencias de 256 tokens y un plan de 2500 pasos. Según los datos de la model card, 2500 pasos × 32 × 256 equivalen a unos 20,5 millones de tokens procesados sobre un corpus de entrenamiento de unas 1560 secuencias de 256 tokens (unas 49 secuencias por lote implica aproximadamente 51 épocas sobre el corpus), lo que explica el sobreajuste observado a partir del paso 750. No se aplicó RLHF, DPO ni ajuste por instrucciones: es un modelo de modelado de lenguaje puro.

## Capacidades

- Generación de texto en inglés con estilo teatral isabelino (diálogos con encabezados tipo `ROMEO:`, `JULIET:`, `PRINCE EDWARD:`), limitada al registro y vocabulario de Tiny Shakespeare.
- Modelado de lenguaje autoregresivo token a token con ventana de 256 tokens.
- Generación controlada por muestreo: el script `generate.py` acepta `--temperature` y `--top-k`, y los ejemplos de la model card usan temperatura 0,8 y top-k 64.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de modo agente, razonamiento multi-paso ni planificación.
- No es multilingüe: solo inglés, y con un vocabulario de 1024 tokens que limita severamente la cobertura léxica incluso en inglés.
- No tiene capacidades de visión, audio ni multimodalidad.
- No está ajustado por instrucciones ni por preferencias humanas: no sigue instrucciones ni mantiene formato de chat.

## Casos de uso

- Material didáctico para cursos de transformers: el repositorio incluye `model.py`, `tokenizer.py`, `generate.py` y el log completo de entrenamiento, lo que permite recorrer el ciclo entero (tokenización, forward pass, pérdida, optimización) sin dependencias de frameworks de alto nivel.
- Reproducción de experimentos a pequeña escala: con 11,1 M de parámetros y 23,5 minutos de entrenamiento en un portátil, sirve para validar hipótesis sobre tasas de aprendizaje, schedules de calentamiento y decaimiento coseno antes de escalar a modelos mayores.
- Pruebas de integración y *smoke tests* de pipelines de inferencia: al ocupar unos 45 MB en float32, se puede cargar en cualquier CI sin GPU y verificar que el pipeline de carga de safetensors, tokenizador y decodificación funciona correctamente.
- Prototipado creativo de diálogo teatral: generación de réplicas con formato de obra de Shakespeare para demos, juegos narrativos o experimentos de escritura asistida, aceptando que la calidad gramatical es limitada.
- Experimentos de tokenización de vocabulario reducido: permite estudiar el efecto de un vocabulario de 1024 tokens frente a los 50.257 de GPT-2 en la perplejidad, la longitud efectiva de las secuencias y la velocidad de convergencia.
- Docencia sobre sobreajuste y validación: la tabla de evaluación paso a paso (del paso 0 al 2499) es un ejemplo real y documentado de divergencia entre pérdida de entrenamiento y de validación, útil para explicar parada temprana y selección de checkpoint.
- Inferencia en entornos sin GPU: al ser un modelo de 11 M de parámetros, puede ejecutarse en CPU, en una Raspberry Pi o en el navegador mediante exportación propia, para demos educativas offline.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, ARC, HellaSwag) en la información disponible. Los únicos datos de evaluación son la pérdida y la perplejidad de validación a lo largo del entrenamiento, que se resumen a continuación:

| Paso | Perdida entrenamiento | Perdida validacion | Perplejidad validacion |
|---|---|---|---|
| 0 | 6,9762 | 6,9726 | 1067,02 |
| 100 | 4,4261 | 4,7035 | 110,34 |
| 250 | 3,9861 | 4,4158 | 82,75 |
| 500 | 3,3827 | 4,1277 | 62,03 |
| 750 (mejor) | 2,7700 | 4,0174 | 55,56 |
| 1000 | 2,1707 | 4,2614 | 70,91 |
| 1500 | 0,9616 | 5,0425 | 154,86 |
| 2000 | 0,3904 | 5,7104 | 301,98 |
| 2499 | 0,2399 | 6,0090 | 407,09 |

No hay comparación con otros modelos publicada por el autor. Cualquier comparación con GPT-2 u otros modelos de la familia requeriría evaluar este checkpoint con los mismos harness, algo que no se ha hecho en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 45 MB con pesos en float32 (11,1 M de parámetros × 4 bytes), más el estado de activaciones de la ventana de 256 tokens, negligible. En la práctica, menos de 500 MB de memoria total del proceso.
- GPU recomendadas: ninguna es necesaria. Cualquier GPU con más de 1 GB de memoria (GTX 1050, RTX 3050, RTX 4090, A100, H100) ejecuta el modelo sin problema; el cuello de botella es el lanzamiento de kernels, no la memoria.
- Cabe en cualquier GPU de consumo y también en CPU. El autor lo entrenó en un MacBook Air M4 con 16 GB de memoria unificada.
- Opciones de despliegue: el repositorio proporciona `generate.py` como única vía oficial, con `pip install -r requirements.txt` y carga directa de `model.safetensors` o `best.pt`. No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, y no existen pesos en GGUF que permitan usarlo con esas herramientas sin convertir y portar la arquitectura.
- Latencia y throughput: no publicados. Como referencia derivada de los datos de la model card, el entrenamiento procesó aproximadamente 20,5 millones de tokens en 1412,7 segundos, lo que equivale a unos 14.500 tokens/s de entrenamiento en el M4; la velocidad de inferencia en CPU o GPU no se ha medido ni comunicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vocabulario | Datos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| arihntk/gpt-from-scratch | 11,14 M | 256 | 1024 | Tiny Shakespeare (399 k tokens de entrenamiento) | MIT | HuggingFace + GitHub, pesos safetensors y `.pt` |
| GPT-2 small (OpenAI) | 124 M | 1024 | 50.257 | WebText (aprox. 40 GB de texto web) | MIT | HuggingFace, amplio soporte en llama.cpp, vLLM, TGI |
| Modelos nanoGPT de Shakespeare (referencia habitual de la comunidad) | ~10 M (variable según configuración) | 256 | 65 o 1024 según configuración | Tiny Shakespeare | MIT en la mayoría de implementaciones | Repositorios de GitHub, sin checkpoint canónico único |
| Modelos GPT-2 Tiny de la comunidad | 10-15 M | 256-1024 | 50.257 | Variable | Variable | Variable, frecuentemente sin evaluación publicada |

Datos de benchmarks comparativos: no disponibles. La comparación se limita a especificaciones de arquitectura, licencia y disponibilidad de tooling.

## Limitaciones y advertencias

- Sobreajuste severo: el checkpoint publicado es el del paso 750, pero el modelo se entrenó hasta el 2499. La perplejidad de validación mínima es 55,56; en el último paso alcanza 407,09. La calidad real del modelo es la del paso 750, no la del estado final del entrenamiento.
- Calidad lingüística baja: el vocabulario de 1024 tokens y el corpus limitado producen texto con errores gramaticales, palabras inventadas y nombres deformados, como se observa en los propios samples de la model card (`ULIET`, `barny bark dish`, `admine own facess`).
- Dominio cerrado: solo genera texto en el registro de Shakespeare. No es útil para prosa moderna, código, matemáticas ni preguntas factuales.
- Ventana de contexto de 256 tokens: insuficiente para conversaciones multi-turno, documentos largos o few-shot prompting con muchos ejemplos.
- Solo inglés y con cobertura léxica muy restringida: no hay capacidades multilingües, y el castellano queda prácticamente fuera del vocabulario.
- No ajustado por instrucciones ni por preferencias humanas: no sigue instrucciones, no responde preguntas y no mantiene formato de chat.
- Riesgo alto de alucinación y de texto incoherente si se usa fuera del estilo para el que fue entrenado; no debe emplearse en ningún flujo con requisitos de fiabilidad.
- Sesgos: el corpus Tiny Shakespeare contiene estereotipos de género, clase y época propios del teatro isabelino; el modelo puede reproducirlos.
- Licencia MIT: permite uso comercial y modificación sin restricciones prácticas, pero el modelo no ofrece ninguna garantía y su utilidad comercial es prácticamente nula en su estado actual.
- Sin tooling estándar: al no haber pesos GGUF ni integración con vLLM, TGI u Ollama, cualquier despliegue en producción requeriría portar el código propio del repositorio.
- Metadatos del repositorio anómalos: la fecha de creación indicada (2026-10-21) es futura respecto a la fecha habitual de consulta, y el modelo registra 0 descargas, por lo que no hay evidencia de uso ni de validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arihntk/gpt-from-scratch
- Repositorio de código fuente: https://github.com/arihntk/gpt-from-scratch
- Log de entrenamiento completo: https://huggingface.co/arihntk/gpt-from-scratch/blob/main/log.txt
- Historial de evaluación (`history.json`): https://huggingface.co/arihntk/gpt-from-scratch/blob/main/history.json
- Curvas de pérdida: https://huggingface.co/arihntk/gpt-from-scratch/blob/main/plots/loss.png
- Curvas de perplejidad: https://huggingface.co/arihntk/gpt-from-scratch/blob/main/plots/perplexity.png
- Schedule de tasa de aprendizaje: https://huggingface.co/arihntk/gpt-from-scratch/blob/main/plots/learning_rate.png
- Norma del gradiente: https://huggingface.co/arihntk/gpt-from-scratch/blob/main/plots/gradient_norm.png
- Throughput de entrenamiento: https://huggingface.co/arihntk/gpt-from-scratch/blob/main/plots/throughput.png
- Papers, demos o blogs adicionales: no disponibles en la información proporcionada.
