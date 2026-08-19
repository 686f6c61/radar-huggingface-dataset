# flwrlabs/Lizzy-7B-GGUF

## Resumen

Lizzy 7B es un modelo de lenguaje de 7.300 millones de parámetros desarrollado por Flower Labs, distribuido en formato GGUF cuantizado para inferencia eficiente en CPU y GPU. Se trata de un modelo de razonamiento que incorpora mejoras específicas de conocimiento y comportamiento orientados al inglés británico, lo que lo hace especialmente útil para aplicaciones que requieran un tono culturalmente adaptado al Reino Unido. Su arquitectura combina atención con ventana deslizante y atención completa, con escalado posicional YaRN que amplía el contexto hasta 65.536 tokens.

La relevancia de este modelo radica en su doble vertiente: por un lado, ofrece capacidades de razonamiento explícito mediante tokens de pensamiento, visibles en la salida con el prefijo `>`; por otro, al estar disponible en cuantizaciones GGUF desde 4,2 GB, puede ejecutarse en hardware de consumo sin necesidad de infraestructura especializada. Esto lo convierte en una opción interesante para desarrolladores que buscan un asistente local con capacidades de razonamiento y sesgo cultural británico, aunque su licencia no está claramente especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con post-norm, atencion sliding window (4096) + full attention, RoPE YaRN (factor 8.0, original 8192) |
| Parametros totales | 7.298.011.136 (7,3 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | No disponible (se menciona ingles britanico en los tags) |
| Licencia | Other (no especificada; consultar el modelo base) |
| Formato de pesos | GGUF (safetensors BF16 disponible en flwrlabs/Lizzy-7B) |

## Arquitectura y entrenamiento

Lizzy 7B emplea una arquitectura transformer de 32 capas con tamaño oculto de 4096 y un vocabulario de 100.278 tokens. La atención es hibrida: combina una ventana deslizante de 4096 tokens con atencion completa, lo que permite capturar dependencias locales y globales. El escalado posicional utiliza RoPE con factor YaRN de 8,0 sobre un contexto original de 8192 tokens, alcanzando asi los 65.536 tokens efectivos. El modelo incluye tensores adicionales `attn_post_norm` y `ffn_post_norm`, lo que indica una arquitectura post-norm no estandar.

No se dispone de informacion publica sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO. Lo que si se documenta es que el modelo es de tipo "razonamiento", generando tokens de pensamiento internos precedidos por `>` antes de emitir la respuesta final. Esta caracteristica sugiere un entrenamiento especifico para cadenas de razonamiento, aunque los detalles tecnicos no estan publicados.

## Capacidades

- Razonamiento explicito: genera cadenas de pensamiento internas visibles con prefijo `>` antes de la respuesta final.
- Generacion de texto y conversacion: apto para asistentes conversacionales y respuestas a preguntas.
- Asistencia de codificacion: segun la documentacion oficial, puede ayudar con tareas de programacion y explicaciones tecnicas.
- Conocimiento cultural britanico: entrenado con enfasis en cultura, historia y comportamiento del Reino Unido.
- Soporte de contexto largo: hasta 65.536 tokens gracias al escalado YaRN.
- Compatibilidad con el ecosistema llama.cpp: puede ejecutarse con llama.cpp, llama-cpp-python, Ollama y servidor llama.cpp.

## Casos de uso

- Asistente conversacional con tono britanico: ideal para chatbots orientados a usuarios del Reino Unido, donde el modelo puede mantener conversaciones naturales con referencias culturales adecuadas, gracias a su ventana de contexto de 65K tokens.
- Herramienta educativa de cultura y lengua inglesa britanica: puede explicar modismos, costumbres y matices historicos de forma razonada, mostrando el proceso de pensamiento antes de dar la respuesta.
- Generacion de codigo con explicaciones paso a paso: su capacidad de razonamiento permite desglosar algoritmos y ofrecer justificaciones detalladas, util en entornos de aprendizaje o revision de codigo.
- Inferencia local en entornos edge: las cuantizaciones Q4_K_M y Q5_K_M (4,2 y 4,8 GB) caben en GPUs de consumo como una RTX 3060 de 12 GB, permitiendo despliegues sin conexion o con privacidad de datos.
- Analisis de documentos largos: su contexto de 65K tokens permite procesar articulos, informes o contratos completos en una sola pasada, con resumenes razonados.
- Prototipado rapido de agentes conversacionales: gracias a su compatibilidad con Ollama y llama.cpp, se puede integrar en pipelines locales para pruebas de concepto sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras metricas estandar que permitan comparar el rendimiento de Lizzy 7B con modelos similares. Se recomienda evaluar el modelo en los casos de uso concretos antes de adoptarlo en produccion.

## Requisitos de hardware

- VRAM estimada por cuantizacion: Q4_K_M ~4,2 GB, Q5_K_M ~4,8 GB, Q6_K ~5,6 GB, Q8_0 ~7,2 GB, f16 ~13,6 GB. A esto hay que anadir el overhead de la ventana de contexto.
- GPU recomendadas: RTX 3060 12 GB para Q4_K_M o Q5_K_M; RTX 4080/4090 para Q8_0 o f16. En CPU, se puede ejecutar con 16 GB de RAM para las cuantizaciones mas bajas.
- Opciones de despliegue: llama.cpp (build especifica con soporte para la arquitectura "lizzy"), llama-cpp-python, Ollama (creando un Modelfile) y el servidor HTTP de llama.cpp.
- Latencia y throughput: no disponibles. Dependera del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con alternativas. A continuacion se comparan caracteristicas tecnicas con otros modelos de 7-8B:

| Modelo | Parametros | Contexto | Cuantizaciones | Licencia |
|---|---|---|---|---|
| Lizzy 7B | 7,3 B | 65.536 (YaRN) | Q4-Q8, f16 | Other (no especificada) |
| Llama 3.1 8B | 8,0 B | 128.000 | GGUF disponibles | Llama 3.1 Community License |
| Mistral 7B | 7,3 B | 32.000 | GGUF disponibles | Apache 2.0 |
| Gemma 2 9B | 9,0 B | 8.192 | GGUF disponibles | Gemma License |

La principal diferencia de Lizzy 7B es su arquitectura de razonamiento con tokens de pensamiento y su enfoque cultural britanico, ademas de requerir un build especifico de llama.cpp que reconozca la arquitectura "lizzy". Su licencia "other" no permite asumir permisos de uso comercial sin consultar el modelo base.

## Limitaciones y advertencias

- Licencia no especificada: el tag `license:other` impide asumir que el modelo es de uso libre. Hay que revisar el modelo base `flwrlabs/Lizzy-7B` para conocer los terminos exactos de redistribucion.
- Sesgo cultural: el entrenamiento orientado al Reino Unido puede producir respuestas con sesgos geograficos o culturales, poco adecuadas para audiencias globales.
- Riesgo de alucinacion: como cualquier modelo generativo, puede inventar informacion, especialmente en temas fuera de su dominio de conocimiento.
- Dependencia de builds especificos: la arquitectura "lizzy" no es estandar en llama.cpp, por lo que requiere un fork concreto (el repositorio `relogu/llama.cpp` en la rama `lorenzo-dev`). Usar builds oficiales puede fallar con el error "unknown model architecture: 'lizzy'".
- Sin benchmarks publicos: no hay metricas objetivas que validen su rendimiento en tareas estandar, lo que dificulta la comparacion con otros modelos.
- Tokens de razonamiento visibles: la salida incluye cadenas de pensamiento con prefijo `>` que pueden no ser deseables en aplicaciones de produccion donde se espera una respuesta directa.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/flwrlabs/Lizzy-7B-GGUF
- Modelo base (safetensors): https://huggingface.co/flwrlabs/Lizzy-7B
- Documentacion oficial del modelo: https://flower.ai/docs/model/lizzy-7b.html
- Documentacion GGUF: https://flower.ai/docs/model/lizzy-gguf.html
- Repositorio GitHub de Flower Labs: https://github.com/flwrlabs/flower
