# faridlazuarda/dms-qwen3-8b-cr8

## Resumen

El modelo `faridlazuarda/dms-qwen3-8b-cr8` es un conjunto de adaptadores de compresión de caché de clave-valor (KV-cache) basados en la técnica Dynamic Memory Sparsification (DMS), entrenados sobre el modelo base `Qwen/Qwen3-8B` congelado. El objetivo es reducir el consumo de memoria de la caché de atención en un factor de 8, manteniendo los pesos originales intactos. Los adaptadores, que ocupan aproximadamente 1 MB, se entrenan mediante destilación KL contra el modelo base como profesor, más una restricción de compresión que fuerza a cerrar una fracción de las posiciones de la caché.

Este repositorio contiene únicamente los adaptadores, no los pesos del modelo base. Para reconstruir el checkpoint completo es necesario ejecutar el script `load_dms.py`, que descarga `Qwen/Qwen3-8B`, aplica los adaptadores y guarda el modelo resultante. La verificación realizada por el autor confirma que los tensores no-DMS del estudiante son bit-idénticos al base y que la reconstrucción es exacta. El modelo se publica bajo licencia Apache-2.0, alineada con el base y con NVIDIA Model-Optimizer.

La relevancia de este trabajo radica en que aborda uno de los principales cuellos de botella de la inferencia de modelos grandes: el crecimiento del KV-cache con la longitud del contexto. Al comprimirlo 8 veces sin modificar los pesos, se puede reducir la memoria necesaria para secuencias largas y aumentar el rendimiento en hardware con VRAM limitada. Sin embargo, el autor advierte explícitamente que no se han realizado evaluaciones en tareas downstream (LongBench, RULER, razonamiento matemático), por lo que la calidad real en aplicaciones prácticas aún no está demostrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-8B) con adaptadores DMS de compresion de KV-cache |
| Parametros totales | 8B (modelo base) + ~1 MB de adaptadores (72 tensores) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8192 tokens (contexto de entrenamiento; el base soporta hasta 131k con YaRN, no verificado con DMS) |
| Tipos de cuantizacion | bf16 (formato de entrenamiento); no se han publicado cuantizaciones |
| Idiomas soportados | Multilingue (heredado de Qwen3-8B; lista especifica no disponible) |
| Licencia | Apache-2.0 |
| Formato de pesos | Adapters en formato PyTorch (no se especifica safetensors); el checkpoint reconstruido se guarda con transformers |

## Arquitectura y entrenamiento

DMS (Dynamic Memory Sparsification) es una tecnica que congela el modelo base y entrena unicamente adaptadores por cabeza de atencion (`dms_proj_alpha`, `dms_proj_alpha_norm`) que deciden que posiciones del KV-cache deben ser descartadas. El modelo resultante es el Qwen3-8B original con estos adaptadores anadidos, sin modificar ningun peso del transformer subyacente. La compresion se controla mediante un parametro `dms_cr` que indica el factor de reduccion efectivo; en este caso se fija un objetivo de 8.0.

El entrenamiento se realizo sobre 4000 muestras del dataset OpenR1-Math-220k, con una ventana de contexto de 8192 tokens y una ventana deslizante de 512. Se usaron 544 pasos (con un aumento progresivo de la compresion durante los primeros 510), un batch efectivo de 16, optimizador AdamW con learning rate constante de 3e-5 y beta2 de 0.95, en precision bf16. El hardware empleado fueron 2 GPUs H200 durante 28.2 horas. La funcion de perdida combina la divergencia KL contra el modelo base congelado (como profesor) y un termino hinge que penaliza no alcanzar la fraccion de cierre objetivo.

Al final del entrenamiento, el factor de compresion logrado fue de 8.496 (ultimo paso) y 8.725 (media de los ultimos 32 pasos), superando el objetivo de 8.0. La perdida de destilacion KL se situo en 0.00927, y la perdida LM desacoplada en 0.4916. Estos valores son diagnosticos de entrenamiento, no metricas de calidad en tareas.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Qwen3-8B, que incluyen comprension del lenguaje, generacion, codificacion y matematicas.
- Compresion de KV-cache: reduce la memoria de la caché de atencion en un factor de 8, lo que permite procesar secuencias mas largas con menos VRAM.
- Multilingue: el modelo base soporta multiples idiomas, aunque no se ha verificado el comportamiento del adaptador en lenguas distintas al ingles.
- Sin evaluacion downstream: no se han publicado resultados en benchmarks estandar (LongBench, RULER, GSM8K, etc.), por lo que las capacidades reales en tareas concretas no estan confirmadas.
- No se ha verificado soporte de tool calling, agentes o modos de razonamiento especiales en esta variante con DMS.

## Casos de uso

- Inferencia de largo contexto con memoria reducida: al comprimir el KV-cache 8 veces, el modelo puede atender a secuencias de hasta 8192 tokens (o mas si se extrapola) con un consumo de VRAM significativamente menor que el base sin compresion. Esto es util en aplicaciones como analisis de documentos extensos o chatbots con historial largo.
- Despliegue en hardware con VRAM limitada: un modelo de 8B en bf16 requiere aproximadamente 16 GB solo para los pesos; con la compresion del KV-cache, la memoria adicional para la atencion se reduce, permitiendo ejecutar el modelo en GPUs consumer como RTX 3090 o RTX 4090 con cuantizacion adicional.
- Investigacion en eficiencia de atencion: el repositorio sirve como referencia para estudiar el impacto de la compresion de KV-cache en la calidad del modelo, comparando con tecnicas como H2O, StreamingLLM o SnapKV.
- Prototipado de sistemas de recuperacion aumentada (RAG): la menor huella de memoria permite mantener contextos de recuperacion mas amplios en memoria, mejorando la coherencia en tareas de pregunta-respuesta sobre corpus grandes.
- Evaluacion de tecnicas de destilacion y compresion: el script de carga y la configuracion de entrenamiento permiten reproducir el proceso y adaptarlo a otros modelos base o tasas de compresion.
- Integracion en pipelines de inferencia con vLLM o TGI: aunque no se ha probado, los adaptadores podrian integrarse en servidores de inferencia que soporten modelos de transformers, siempre que se reconstruya el checkpoint completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que los adaptadores no han sido evaluados en tareas downstream y que la perdida KL reportada es un diagnostico de entrenamiento, no una medida de calidad. Por tanto, no se dispone de datos comparativos con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-8B en bf16 requiere ~16 GB para los pesos. Con la compresion del KV-cache, la memoria adicional para la atencion se reduce en un factor de 8, pero no se han publicado cifras exactas. Se estima que con cuantizacion a 8 bits o 4 bits podria caber en GPUs consumer de 12-16 GB.
- GPU recomendadas: para una inferencia comoda sin cuantizacion, se recomienda una GPU con al menos 24 GB de VRAM (RTX 3090, RTX 4090, A10G). Para entrenamiento se usaron 2x H200.
- Compatibilidad con consumer GPU: probablemente si, con cuantizacion (por ejemplo, GGUF o AWQ), aunque no hay datos publicados.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que se reconstruya el checkpoint completo y se cargue con `trust_remote_code=True`. No se ha verificado la compatibilidad con estos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de compresion de KV-cache. Como referencia, se puede comparar con el propio Qwen3-8B sin compresion, que tiene el mismo numero de parametros pero sin los adaptadores DMS. La diferencia principal es el ahorro de memoria en el KV-cache, a costa de una posible degradacion de calidad no cuantificada. Otras tecnicas como H2O o StreamingLLM tambien comprimen el KV-cache, pero no se han encontrado datos comparativos en la informacion disponible.

## Limitaciones y advertencias

- No hay evaluacion en tareas downstream: el autor no ha publicado resultados en benchmarks estandar, por lo que la calidad real del modelo en aplicaciones practicas es desconocida.
- Entrenamiento limitado a un dominio: los adaptadores se entrenaron exclusivamente con datos de matematicas (OpenR1-Math-220k), lo que puede sesgar el comportamiento en otras tareas.
- Contexto de entrenamiento fijo: la ventana de 8192 tokens puede no extrapolar bien a secuencias mas largas, aunque el modelo base soporta hasta 131k con YaRN.
- Carga compleja: no se puede cargar directamente con `AutoModelForCausalLM.from_pretrained` del repositorio; se requiere instalar el paquete DMS y ejecutar `load_dms.py` para reconstruir el checkpoint.
- Riesgo de alucinacion y sesgos: heredados del modelo base Qwen3-8B, no mitigados por los adaptadores.
- Licencia: Apache-2.0 permite uso comercial, pero se debe verificar la compatibilidad con las licencias de los componentes (Qwen3-8B y NVIDIA Model-Optimizer, ambos Apache-2.0).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/faridlazuarda/dms-qwen3-8b-cr8
- Paper DMS: https://arxiv.org/abs/2506.05345
- Repositorio NVIDIA Model-Optimizer (experimental/dms): https://github.com/NVIDIA/Model-Optimizer/tree/main/experimental/dms
- Modelo base Qwen/Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Variante cr4: https://huggingface.co/faridlazuarda/dms-qwen3-8b-cr4
- Variante v2: https://huggingface.co/faridlazuarda/qwen3-8b-base-dms-v2
