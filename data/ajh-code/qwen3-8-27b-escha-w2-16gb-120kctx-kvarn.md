# ajh-code/Qwen3.8-27B-Escha-W2-16GB-120Kctx-KVarN

## Resumen

Este paquete, publicado por ajh-code, permite ejecutar el modelo completo Escha W2 de 27.000 millones de parámetros en una GPU NVIDIA de 16 GB con una ventana de contexto de hasta 120.000 tokens. El modelo base, EschaLabs/Qwen3.8-27B-Escha-W2, es una cuantización extrema de 2/3 bits (2,469 bits por peso de media) del modelo Qwen3.8-27B, con los pesos comprimidos a 10,15 GB. La contribución principal de este paquete es la compresión de la caché KV mediante la técnica KVarN (K4/V4), que reduce el almacenamiento de la caché al 26,8 % del tamaño FP16, lo que permite contextos largos en hardware de consumo. Se trata de una solución experimental, con licencia Apache 2.0, que integra el runtime de SGLang de Escha y herramientas de despliegue propias.

El paquete no duplica los pesos del modelo original ni el runtime compilado de Escha; en su lugar, incluye el backend KVarN empaquetado, scripts de instalación y servir, y descarga el checkpoint y el runtime mediante `setup.sh`. El resultado es un endpoint compatible con OpenAI que sirve el modelo con identificador `escha-qwen38-27b-w2-kvarn`. Las pruebas publicadas muestran que mantiene el 96 % de la velocidad de decode del stock con caché FP16 a 2K de contexto y el 87 % a 16K, con una similitud numérica de la atención empaquetada superior a 0,999999.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.8-27B) |
| Parametros totales | 27.000 millones (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 120.000 tokens (perfil por defecto) |
| Tipos de cuantizacion | Pesos: 2/3 bits (Escha W2, 2,469 bits/peso) con embeddings y head en int8; caché KV: KVarN K4/V4 (4 bits) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (checkpoint original descargado por `setup.sh`) |

## Arquitectura y entrenamiento

El modelo base es una cuantización de Qwen3.8-27B, un transformer denso con atención completa. No se proporcionan detalles sobre el entrenamiento original (datos, número de tokens, método de alineación) en la información disponible. La innovación de este paquete reside en la capa de compresión de caché KV: KVarN almacena los registros de clave y valor en formato de 4 bits (K4/V4) para los tiles de historia completados de 128 tokens, mientras que los primeros 128 tokens, el tile vivo sin terminar y la cola generada acotada se mantienen en FP16. El decode utiliza atención Triton fusionada split-K que lee directamente los registros empaquetados, y los CUDA graphs mantienen los primeros 512 tokens generados en una cola FP16 exacta; las salidas más largas se pliegan automáticamente a KVarN y continúan en modo eager.

El prefill por chunks reutiliza un workspace FP16 compartido en lugar de asignar una caché FP16 completa, lo que contribuye a la reducción de memoria. Según la model card, no se observó pérdida de calidad puntuada en la suite de 45 puntos de caché KV, y la similitud numérica de la atención empaquetada supera 0,999999.

## Capacidades

- Generación de texto, razonamiento, código y matemáticas, heredadas del modelo base Qwen3.8-27B.
- Contexto largo de hasta 120.000 tokens, verificado con pruebas de recuperación tipo needle-in-a-haystack (por ejemplo, recuperación de una palabra secreta en un prompt de 118.038 tokens).
- Procesamiento de prompts muy largos con chunked prefill estable (chunks de 4.096 tokens hasta 64K, y control de chunks sobredimensionados de 8.192 tokens).
- Soporte de tool calling y function calling: no documentado en la información disponible.
- Capacidades multilingües: no documentadas en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la información disponible.

## Casos de uso

- Analisis de documentos extensos: el modelo puede procesar contratos, informes anuales o expedientes de miles de páginas en una sola pasada gracias a su ventana de 120K tokens, sin necesidad de dividir el texto ni perder contexto entre fragmentos.
- Recuperacion de informacion en bases de conocimiento largas: las pruebas de needle-in-a-haystack demuestran que puede localizar datos concretos situados al principio de un prompt de más de 100K tokens, lo que lo hace útil para motores de búsqueda internos o asistentes de documentación técnica.
- Asistentes conversacionales con historial prolongado: un chatbot puede mantener conversaciones de muchas horas sin truncar el historial, ya que la caché KV comprimida permite retener todo el diálogo anterior en 16 GB de VRAM.
- Generacion de codigo con contexto de repositorio grande: el modelo puede recibir el contenido completo de un repositorio de tamaño medio (archivos, dependencias, tests) y generar o modificar código con conocimiento global del proyecto, algo inviable con ventanas de 8K o 32K.
- Analisis de logs y series temporales: la ventana de 120K permite examinar registros de servidor, trazas de eventos o datos de sensores de largos periodos en una sola consulta, identificando anomalías o patrones.
- Despliegue en hardware de consumo para investigacion: al caber en una GPU de 16 GB (RTX 4080/5080, RTX 4060 Ti, etc.), permite a laboratorios con presupuesto reducido experimentar con un modelo de 27B y contexto largo sin recurrir a clústeres o servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card indica que "no se observó pérdida de calidad puntuada" en una suite interna de 45 puntos de caché KV, pero no se ofrecen cifras concretas.

Los datos de rendimiento medidos en RTX 5080 16 GB (single-stream, mismo checkpoint, INT8-as-stored LM head, Triton attention, una petición, sin radix cache, 256 tokens generados) son:

| Configuracion | 2K decode (tok/s) | 16K decode (tok/s) | 16K TTFT (s) |
|:--|--:|--:|--:|
| Stock FP16 KV, CUDA graph | 59,83 | 50,55 | 9,02 |
| Stock FP16 KV, eager | 44,75 | 44,75 | 8,98 |
| Early packed KVarN eager | 35,08 | 35,24 | 9,52 |
| Packed KVarN v1.0 + CUDA graph | 57,42 | 44,02 | 9,62–9,69 |

En RTX 5060 Ti 16 GB se verificó un funcionamiento correcto con 30,06 tok/s en una comprobación corta de 2K/16 tokens. Las pruebas de contexto largo incluyen: prompt de 119.900 tokens completado en 136,7 s (pool al 97 %), recuperación de una palabra secreta en un prompt de 118.038 tokens en 134,8 s, y dos peticiones consecutivas de 64.000 tokens con recuperación correcta en 54,40 s y 54,82 s.

## Requisitos de hardware

- GPU NVIDIA con arquitectura `sm_80`–`sm_120` (RTX 30/40/50, A100, H100, etc.).
- 16 GB de VRAM mínimo para el perfil de 120K de contexto.
- Aproximadamente 30 GB de espacio libre en disco para el checkpoint, el runtime y el entorno virtual.
- Linux x86-64, Python 3.12, CUDA 12.x, compilador C y cabeceras de desarrollo de Python.
- Opciones de despliegue: el paquete incluye `serve.sh` que lanza un servidor SGLang con endpoint compatible con OpenAI en `http://127.0.0.1:30000/v1`. No se mencionan alternativas como vLLM, llama.cpp u Ollama.
- Rendimiento orientativo: 57 tok/s a 2K de contexto y 44 tok/s a 16K en RTX 5080 con CUDA graphs; 30 tok/s en RTX 5060 Ti en una comprobación corta.

## Comparativa con modelos similares

La comparación más directa es con el mismo modelo base sin la compresión KVarN, ya que no se dispone de datos de otros modelos comparables en la información proporcionada.

| Modelo / configuracion | Parametros | Contexto | VRAM necesaria | Decode 2K (tok/s) | Decode 16K (tok/s) | Licencia |
|:--|--:|--:|--:|--:|--:|:--|
| Escha W2 + KVarN (este paquete) | 27B | 120K | 16 GB | 57,42 | 44,02 | Apache 2.0 |
| Escha W2 stock (FP16 KV, CUDA graph) | 27B | Limitado por VRAM | >16 GB (caché FP16) | 59,83 | 50,55 | Apache 2.0 |
| Escha W2 stock (FP16 KV, eager) | 27B | Limitado por VRAM | >16 GB | 44,75 | 44,75 | Apache 2.0 |

No se dispone de información sobre otros modelos de 27B con contexto largo en GPU de 16 GB para una comparativa más amplia.

## Limitaciones y advertencias

- Paquete en estado experimental (v1.0 experimental); la matriz de hardware y de calidad de carga de trabajo está en crecimiento.
- Solo compatible con Linux x86-64, CUDA 12.x y GPUs NVIDIA `sm_80`–`sm_120`. No hay soporte para AMD, Apple Silicon o Windows.
- El endpoint de inferencia no debe exponerse a internet sin autenticación; el README advierte explícitamente de no publicar un endpoint sin protección.
- La cuantización extrema de los pesos (2/3 bits) puede introducir degradaciones de calidad no documentadas en tareas específicas; no se han publicado benchmarks de calidad estándar.
- No se han documentado sesgos, riesgos de alucinación o limitaciones idiomáticas del modelo base en la información disponible.
- El paquete depende de la descarga del checkpoint y del runtime de Escha Labs; la disponibilidad de estos componentes externos no está garantizada a largo plazo.
- La licencia Apache 2.0 se aplica al paquete, pero el runtime de Escha y el modelo base pueden tener términos adicionales no detallados en esta documentación.

## Enlaces

- Repositorio del paquete: https://huggingface.co/ajh-code/Qwen3.8-27B-Escha-W2-16GB-120Kctx-KVarN
- Modelo base original: https://huggingface.co/EschaLabs/Qwen3.8-27B-Escha-W2
- Runtime de Escha: https://huggingface.co/EschaLabs/escha-runtime-qwen3dense
- Repositorio KVarN: https://github.com/huawei-csl/KVarN
- Paper KVarN: https://arxiv.org/abs/2606.03458
- Sitio web de Escha Labs: https://www.eschalabs.com/
