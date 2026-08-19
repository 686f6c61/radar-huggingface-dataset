# qtum/Qwen3-4B-FP8

## Resumen

Qwen3-4B-FP8 es una cuantizacion en punto flotante de 8 bits (FP8, esquema W8A8 dinamico) del modelo Qwen/Qwen3-4B, realizada por el usuario qtum mediante la herramienta llm-compressor del ecosistema vLLM. El resultado es un checkpoint en formato compressed-tensors que reduce aproximadamente a la mitad el tamano de los pesos en bf16 (4,4 GB frente a unos 8 GB) y esta disenado para servirse de forma eficiente con vLLM o SGLang, sin necesidad de parametros adicionales porque el esquema de cuantizacion se declara en el config.json.

El modelo base Qwen3-4B es un transformer causal denso de 4.022 millones de parametros con atencion por grupos (grouped-query attention), desarrollado por el equipo Qwen de Alibaba. Su caracteristica principal es la conmutacion entre un modo de pensamiento (thinking mode) que emite una cadena de razonamiento antes de la respuesta final, util para tareas complejas de matematicas, codigo y razonamiento, y un modo sin pensamiento (non-thinking mode) para dialogo general rapido. La cuantizacion FP8 preserva estas capacidades con una degradacion minima de calidad, lo que la convierte en una opcion atractiva para despliegues en produccion con GPUs Hopper o Blackwell, donde el formato FP8 es nativo.

La licencia Apache 2.0, heredada del modelo base, permite uso comercial sin restricciones significativas. Esta ficha cubre las especificaciones tecnicas, capacidades, casos de uso, requisitos de hardware y limitaciones de esta cuantizacion concreta, basandose exclusivamente en la informacion publicada por el autor y en los datos disponibles en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con grouped-query attention |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 (W8A8 dynamic) |
| Idiomas soportados | en, zh (segun model card; el modelo base soporta mas idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint Qwen/Qwen3-4B, un transformer causal denso con atencion por grupos (GQA) que permite reducir el numero de cabezas de clave/valor sin perder capacidad. El modelo base fue entrenado por el equipo Qwen con un pipeline que incluye preentrenamiento en multiples idiomas, ajuste fino supervisado y optimizacion con preferencias humanas (RLHF/DPO), aunque los detalles exactos del dataset y el numero de tokens no se han publicado en la informacion disponible para esta cuantizacion.

La cuantizacion FP8 se realizo con llm-compressor, que aplica cuantizacion dinamica de pesos y activaciones en FP8 (W8A8). Esto significa que los pesos se almacenan en FP8 de 8 bits y las activaciones se cuantizan dinamicamente en tiempo de ejecucion, lo que reduce el uso de memoria y aumenta el throughput sin requerir calibracion previa. El resultado se guarda en el formato compressed-tensors, que declara el esquema de cuantizacion en config.json para que motores compatibles (vLLM, SGLang) lo detecten automaticamente. No se han aplicado otras modificaciones a los pesos ni al comportamiento del modelo.

## Capacidades

- Generacion de texto conversacional y de instrucciones con formato ChatML (`<|im_start|>`, `<|im_end|>`).
- Modo de pensamiento (thinking mode): emite una cadena de razonamiento antes de la respuesta final, mejorando el rendimiento en problemas de matematicas, logica y codigo.
- Modo sin pensamiento (non-thinking mode): respuestas directas y rapidas para dialogo general y tareas sencillas.
- Razonamiento multi-paso y resolucion de problemas complejos gracias al modo thinking.
- Generacion de codigo y asistencia en programacion.
- Soporte de tool calling y function calling, lo que permite integracion con agentes y APIs externas.
- Capacidades multilingues: aunque la model card de esta cuantizacion lista solo en y zh, el modelo base Qwen3-4B soporta mas de 100 idiomas segun fuentes externas; la cuantizacion no altera esta capacidad.
- Compatibilidad con vLLM y SGLang para servido eficiente, incluyendo decodificacion especulativa si se configura en el motor.

## Casos de uso

- Despliegue de asistentes conversacionales en produccion: al ser un checkpoint FP8 de 4,4 GB, puede servirse en GPUs con 8-12 GB de VRAM, lo que permite montar chatbots de atencion al cliente con bajo coste de hardware y latencia reducida.
- Agentes autonomos con tool calling: el modelo base soporta function calling, y la cuantizacion FP8 permite ejecutar agentes que llaman a APIs, consultan bases de datos o interactuan con herramientas externas en entornos con recursos limitados.
- Razonamiento y analisis de datos: el modo thinking es adecuado para tareas de logica, matematicas y extraccion de conclusiones a partir de datos estructurados, manteniendo una huella de memoria pequena.
- Generacion de codigo en pipelines de CI/CD: puede integrarse como asistente de codigo en entornos de desarrollo, generando fragmentos, explicando algoritmos o revisando cambios, con la ventaja de que el formato FP8 reduce el coste de inferencia en clusters de GPUs.
- Procesamiento de documentos multilingues: aunque la model card lista en y zh, el modelo base soporta muchos idiomas; la cuantizacion permite procesar consultas y resumir documentos en varios idiomas sin necesidad de GPUs de gama alta.
- Prototipado rapido y experimentacion: al ser un drop-in replacement del modelo base en vLLM/SGLang, los desarrolladores pueden probar Qwen3-4B en entornos de desarrollo con GPUs consumer, evaluar su comportamiento y escalar a produccion sin cambios de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta cuantizacion en la informacion disponible. El autor indica que la cuantizacion FP8 es "near lossless" respecto al modelo base, pero no proporciona metricas comparativas (MMLU, HumanEval, GSM8K, etc.). Se recomienda consultar los benchmarks del modelo base Qwen/Qwen3-4B en su pagina oficial para una referencia del rendimiento esperado, aunque la cuantizacion puede introducir degradaciones menores no cuantificadas.

## Requisitos de hardware

- Tamano del checkpoint: 4,4 GB en FP8, lo que implica un uso de VRAM inferior a 5 GB solo para los pesos, mas overhead de activaciones y KV cache.
- Segun fuentes externas, el modelo cabe en un footprint de memoria inferior a 10 GB, por lo que es compatible con GPUs consumer como RTX 4060 (8 GB), RTX 4070 (12 GB) o RTX 4090 (24 GB).
- El formato FP8 es nativo en GPUs Hopper (H100, H200) y Blackwell (B200), donde se obtiene el maximo rendimiento; en GPUs Ampere o Ada puede requerir emulacion o conversion, aunque vLLM gestiona esto de forma transparente.
- Motores de inferencia soportados: vLLM (comando `vllm serve qtum/Qwen3-4B-FP8` sin flags adicionales) y SGLang, ambos compatibles con compressed-tensors.
- Para despliegues en CPU, no se recomienda; el formato FP8 esta optimizado para GPUs con soporte nativo.
- Latencia y throughput: no se han publicado cifras concretas; dependen del hardware, el tamano de lote y la longitud de contexto. En GPUs Hopper, la cuantizacion FP8 suele duplicar el throughput respecto a bf16, segun practicas generales de vLLM, pero estos datos no estan confirmados para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen/Qwen3-4B (base) | 4.022M | No disponible | bf16 | Apache 2.0 | Modelo original, mayor uso de VRAM (~8 GB) |
| qtum/Qwen3-4B-FP8 (este) | 4.022M | No disponible | FP8 (compressed-tensors) | Apache 2.0 | Cuantizacion FP8, ~4,4 GB, compatible vLLM/SGLang |
| furiosa-ai/Qwen3-4B-FP8 | 4.022M | No disponible | FP8 | Apache 2.0 | Cuantizacion FP8 similar, tambien basada en Qwen3-4B |

No se dispone de benchmarks comparativos entre estas variantes. La principal diferencia es el formato de cuantizacion y el autor; todas heredan las capacidades del modelo base. No se incluyen otros modelos de tamano similar (p.ej., Llama 3.2 3B) por falta de datos de rendimiento comparables en la informacion disponible.

## Limitaciones y advertencias

- La cuantizacion FP8 puede introducir degradaciones menores de precision en tareas muy sensibles a los pesos (por ejemplo, calculos numericos de alta exactitud), aunque el autor la describe como "near lossless".
- La model card de esta cuantizacion solo lista en y zh como idiomas soportados; aunque el modelo base es multilingue, no se garantiza el mismo rendimiento en otros idiomas tras la cuantizacion.
- No se han publicado resultados de benchmarks especificos para esta cuantizacion, por lo que la calidad real en tareas concretas debe validarse antes de usarla en produccion.
- El modelo base puede presentar sesgos y alucinaciones propios de los LLM; la cuantizacion no los corrige.
- La licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribucion y cumplir las condiciones de la licencia del modelo base (tambien Apache 2.0).
- No se proporcionan datos sobre la longitud de contexto soportada; se recomienda consultar la documentacion del modelo base para conocer el limite de tokens y ajustar la configuracion de vLLM en consecuencia.
- El formato compressed-tensors requiere motores compatibles (vLLM, SGLang); otros frameworks como llama.cpp u Ollama no lo soportan de forma nativa, por lo que no es adecuado para despliegues en CPU o en esos entornos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qtum/Qwen3-4B-FP8
- Modelo base Qwen/Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio llm-compressor: https://github.com/vllm-project/llm-compressor
- Articulo de dev.co sobre Qwen3-4B-FP8: https://dev.co/ai/llms/qwen3-4b-fp8
- Ficha en llm.co: https://llm.co/llms/qwen3-4b-fp8
- Ficha en model.aibase.com: https://model.aibase.com/models/details/1927649925223682048
