# bakhil-aissa/Spark-X2.5-1.7B-mnn-4bit-omni

## Resumen

Spark-X2.5-1.7B-mnn-4bit-omni es un export en formato MNN del modelo XHToken/Spark-X2.5-1.7B, un transformer decoder-only denso de aproximadamente 1.700 millones de parámetros, convertido y cuantizado por el usuario bakhil-aissa para inferencia en CPU y dispositivos locales. No se trata de un modelo nuevo ni de un fine-tune: el repositorio contiene únicamente los pesos convertidos, mientras que el entrenamiento, la evaluación y la licencia remiten al modelo base original.

El interés del artefacto es de ingeniería de despliegue. Frente al peso en FP16 (unos 3,4 GB), el export reduce el paquete a cerca de 1 GB aplicando INT4 con bloque de 64 a los bloques transformer, INT8 al LM head y INT8 a los embeddings, con calibración sobre `pileval` y fusión de bloques. Esa combinación permite ejecutar un modelo de 1,7B en portátiles de baja potencia, móviles y placas SBC sin GPU dedicada, usando el runtime MNN de Alibaba.

La arquitectura del modelo base incorpora dos decisiones poco habituales en este rango de tamaño: atención con ventana deslizante de 512 tokens combinada con una capa de atención completa cada cuatro capas, y una puerta sigmoid por cabeza de atención. El vocabulario es grande (131.072 tokens) con embeddings atados, lo que encarece el coste por token del LM head y explica que se mantenga en 8 bits en lugar de bajarlo a 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Spark2_5ForCausalLM, decoder-only transformer denso |
| Parametros totales | ~1,7B |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (la model card no documenta la ventana maxima; atencion deslizante de 512 tokens con capa de atencion completa cada 4 capas) |
| Tipos de cuantizacion | INT4 con block size 64 en bloques transformer; INT8 en LM head; INT8 en embeddings; calibracion con `pileval` |
| Idiomas soportados | no disponible |
| Licencia | no disponible (se hereda la del modelo base XHToken/Spark-X2.5-1.7B, no especificada en este repositorio) |
| Formato de pesos | MNN (`llm.mnn` + `llm.mnn.weight`), tokenizer en `tokenizer.mtok` |

Detalles estructurales adicionales del grafo:

| Parametro | Valor |
|---|---|
| Capas | 28 |
| Hidden size | 2.048 |
| Cabezas de atencion | 8 query heads, 2 KV heads (GQA), head dim 256 |
| Patron de atencion | sliding-window 512 + full attention cada 4 capas |
| Puerta de atencion | sigmoid por cabeza |
| Activacion | GELU |
| Vocabulario | 131.072 tokens |
| Embeddings | atados entrada/salida |
| Tamano del repo | 1,3 GB (paquete en disco ~1 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only denso de 28 capas con hidden size 2.048. La atención usa GQA con 8 cabezas de consulta y 2 cabezas de clave/valor, con dimensión de cabeza 256, lo que reduce el tamaño del KV cache frente a MHA completo. La innovación más relevante es el patrón híbrido de atención: la mayoría de capas operan con ventana deslizante de 512 tokens y solo una de cada cuatro mantiene atención completa, de modo que el coste y la memoria del contexto crecen de forma mucho más lenta que en un modelo de atención completa equivalente. Cada cabeza incorpora además una puerta sigmoid sobre la salida de atención. La activación es GELU y los embeddings de entrada y salida están atados, con un vocabulario de 131.072 tokens.

Sobre el entrenamiento no hay información en este repositorio: no se documentan el número de tokens, la composición del dataset ni si hubo etapas de RLHF, DPO o ajuste por instrucciones. La model card remite explícitamente a la ficha del modelo original para esos datos. Tampoco se detalla el proceso de calibración más allá del uso de `pileval` como conjunto de calibración para determinar los rangos de cuantización, ni se publican métricas de degradación respecto a los pesos originales.

La conversión se realizó con la herramienta `llmexport` de MNN, con los parámetros `--quant_bit 4 --quant_block 64 --lm_quant_bit 8 --embed_bit 8 --calib_data pileval --omni --transformer_fuse`. El flag `--transformer_fuse` fusiona los bloques transformer en el grafo exportado, lo que reduce el overhead de dispatch en CPU.

## Capacidades

- Generación de texto autoregresiva en inglés y otros idiomas (la cobertura idiomática no está documentada; el ejemplo de la model card es en inglés).
- Generación de código: el ejemplo oficial del repositorio pide código Python para descargar imágenes de una página HTML.
- Inferencia en CPU sin GPU, incluyendo dispositivos móviles a través de las apps de demostración de MNN LLM.
- Ejecución en C++ mediante `llm_demo` y en Python mediante el binding `MNN.llm`.
- Soporte de plantilla de prompt configurable a través de `llm_config.json`, junto con parámetros de sampler y disposición de atención.
- Gestión acotada de memoria de contexto gracias a las capas de ventana deslizante, que mantienen su KV cache en 512 tokens.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo thinking. El sufijo `omni` del nombre del repositorio aparece en los argumentos de exportación, pero la model card no describe ninguna modalidad adicional.

## Casos de uso

- Asistentes locales en portátil sin GPU: el paquete de ~1 GB con INT4 permite cargar el modelo en RAM y ejecutar generación de texto con el runtime MNN, sin depender de servicios en la nube ni de VRAM dedicada.
- Aplicaciones móviles offline: las apps de demostración de MNN LLM aceptan el directorio con `config.json`, de modo que el modelo puede integrarse en apps Android o iOS para dictado, resumen o respuestas predefinidas sin conexión.
- Prototipado de generación de código en entornos con recursos limitados: el ejemplo oficial de la model card apunta a este uso, útil para autocompletar o explicar fragmentos en un IDE local, aceptando la degradación propia de la cuantización en salidas largas y precisas.
- Procesamiento por lotes en CPU para clasificación y extracción de texto: al no requerir GPU, el modelo puede ejecutarse en servidores de bajo coste o en el propio portátil del desarrollador para tareas de etiquetado, resumen o reformateo.
- Evaluación y benchmarking de cuantización: el repositorio sirve como referencia para medir la pérdida de calidad de INT4 bloque 64 con LM head y embeddings en 8 bits frente a los pesos originales en FP16, sobre tareas propias.
- Despliegue embebido en dispositivos tipo SBC o routers con Linux: el runtime MNN en C++ permite enlazar `llm_demo` en binarios pequeños, con control manual del número de hilos para ajustar latencia y consumo.
- Educación y experimentación: el formato MNN y el volcado legible del grafo (`llm.mnn.json`) facilitan inspeccionar cómo se materializa una arquitectura con atención híbrida y GQA en un runtime de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reportan números y que la comparación debe hacerse contra el modelo original sobre las tareas propias del usuario.

## Requisitos de hardware

- RAM estimada para inferencia: en torno a 1,5–2,5 GB, considerando el paquete de ~1 GB, el estado del runtime y el KV cache. Cifra estimada a partir del tamaño del export, no publicada por el autor.
- VRAM estimada: no aplica en el caso de uso principal (CPU). Si se usa un backend acelerado de MNN (OpenCL, Vulkan, Metal, CUDA), el peso cuantizado ronda 1 GB, por lo que cabría en GPUs con 2 GB o más; no hay cifras oficiales.
- GPU recomendadas: no hay recomendaciones del autor. El modelo está diseñado para CPU; cualquier GPU consumer reciente podría ejecutarlo vía backend acelerado, pero sin datos de rendimiento publicados.
- Compatibilidad con GPU consumer: sí en la práctica por tamaño, aunque el target declarado es CPU y móvil.
- Ajuste de hilos: la model card recomienda fijar el número de hilos al de núcleos físicos y señala que en CPUs de portátil de baja potencia lo habitual es 2–4 hilos.
- Opciones de despliegue: runtime MNN en Python (`pip install MNN`, `MNN.llm.create`), C++ (`llm_demo` compilado con `-DMNN_BUILD_LLM=ON`) y apps móviles de MNN LLM. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card solo advierte que el vocabulario de 131k hace que el LM head sea una parte notable del coste por token, motivo por el que se mantiene en 8 bits.

## Comparativa con modelos similares

Los datos del modelo base (contexto máximo, licencia, benchmarks) no están disponibles en la información proporcionada, por lo que la comparación se limita a tamaño, formato de despliegue y estado de documentación. Las cifras de los modelos alternativos son de referencia general y pueden variar según la versión consultada.

| Modelo | Parametros | Contexto | Licencia | Enfoque de despliegue |
|---|---|---|---|---|
| Spark-X2.5-1.7B MNN INT4 (este repo) | ~1,7B | no disponible | no disponible | MNN, INT4/INT8, CPU y móvil |
| XHToken/Spark-X2.5-1.7B (base) | ~1,7B | no disponible | no disponible | Pesos originales, sin cuantizar |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | Apache-2.0 | GGUF, safetensors, amplio soporte en llama.cpp y vLLM |
| Llama-3.2-1B-Instruct | 1,23B | 128.000 tokens | Llama 3.2 Community License | GGUF, safetensors, ecosistema amplio |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | Apache-2.0 | GGUF, safetensors, orientado a dispositivo |

La ventaja diferencial de este export es el empaquetado INT4 en MNN con LM head y embeddings en 8 bits y grafo fusionado, pensado para CPU. Su desventaja frente a las alternativas es la ausencia de documentación sobre contexto máximo, licencia, idiomas y calidad medida, además de una comunidad prácticamente inexistente (0 descargas y 0 likes en el momento de la consulta).

## Limitaciones y advertencias

- La cuantización INT4 introduce regresiones de calidad respecto a los pesos originales, más visibles en salidas largas y precisas: código, aritmética y formatos estrictos. El autor recomienda validar sobre la carga de trabajo propia antes de depender del modelo.
- Sesgos y comportamiento de seguridad: se heredan íntegramente del modelo base, que no está documentado en este repositorio.
- Licencia no especificada: al ser un trabajo derivado, aplican los términos del modelo base. Es obligatorio leer la ficha de XHToken/Spark-X2.5-1.7B antes de usar o redistribuir el export, y no hay confirmación de permisividad para uso comercial.
- Idiomas soportados no documentados; no hay garantía de calidad fuera del inglés.
- Longitud máxima de contexto no documentada. El patrón de ventana deslizante de 512 tokens acota el KV cache, pero eso no equivale a una ventana efectiva de 512 tokens: las capas de atención completa cada cuatro permiten propagar información más allá, sin que se publique el límite real.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de fidelidad ni de tasa de alucinación para este export.
- Formato propietario del runtime: los pesos solo son utilizables con MNN; no hay conversión a GGUF ni safetensors en el repositorio, lo que limita la portabilidad a otros stacks.
- Repositorio sin tracción: 0 descargas y 0 likes, sin issues ni validación comunitaria. No hay garantía de mantenimiento.
- El modelo base corresponde a una familia poco documentada públicamente; conviene contrastar su procedencia antes de integrarlo en un producto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bakhil-aissa/Spark-X2.5-1.7B-mnn-4bit-omni
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-1.7B
- Runtime MNN (GitHub): https://github.com/alibaba/MNN
