# Renderleaf/Kimi-K3.1-Pro

## Resumen
Kimi K3.1 Pro es un modelo agentico multimodal nativo de pesos abiertos desarrollado por Moonshot AI, distribuido en Hugging Face a traves del repositorio Renderleaf/Kimi-K3.1-Pro. Se trata de un modelo de la clase 3T (2,8 billones de parametros totales) con arquitectura Mixture-of-Experts que activa 104B parametros por token, y que ha sido post-entrenado a partir de Kimi K3 mediante aprendizaje por refuerzo conjunto a gran escala sobre cientos de dominios downstream. Es el primer modelo de la serie K3.1 y esta disenado especificamente para tareas agenticas: generacion de codigo, creacion 3D, investigacion financiera y precision factual.

La relevancia tecnica del modelo radica en su ventana de contexto de 1 millon de tokens combinada con una composicion de atencion hibrida poco habitual: 69 capas con KDA (Kimi Delta Attention) y 24 capas con Gated DSA (DeepSeek Sparse Attention), lo que permite manejar secuencias muy largas con un coste de atencion subcuadratico en la parte dispersa. Ademas, el modelo es multimodal nativo (pipeline image-text-to-text), no un adaptador de vision anadido a posteriori.

El repositorio ocupa 1561,4 GB y se distribuye en formato safetensors con cuantizacion de 8 bits mediante compressed-tensors, lo que reduce el peso respecto a los pesos en BF16 pero sigue exigiendo infraestructura de centro de datos para su despliegue. La licencia es propietaria ("kimi-k3.1-pro", license: other), no open source en sentido estricto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atencion hibrida KDA + Gated DSA |
| Parametros totales | 2.780.110.363.392 (2,8T) |
| Parametros activos | 104B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8-bit (compressed-tensors); no se detallan otros formatos |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3.1-pro (license: other, propietaria) |
| Formato de pesos | safetensors (compressed-tensors, 8-bit) |
| Capas totales | 93 (1 densa) |
| Dimension oculta de atencion | 7168 |
| Cabezas de atencion | 96 |
| Composicion de capas de atencion | 69 KDA + 24 Gated DSA |
| Dimension de indice DSA | 128 |
| Cabezas de indice DSA | 32 |
| Top-K de indice DSA | 2048 |
| Dimension latente MoE | 3584 |
| Dimension oculta MoE por experto | 3072 |
| Numero de expertos | 896 |
| Expertos seleccionados por token | 16 |
| Expertos compartidos | 2 |
| Tamano de vocabulario | 160K |
| Tamano del repositorio | 1561,4 GB |
| Libreria | transformers (custom_code) |

## Arquitectura y entrenamiento
El modelo emplea una arquitectura transformer con mezcla de expertos (MoE) de 93 capas, de las cuales solo una es densa. La innovacion principal reside en la capa de atencion: combina 69 capas de Kimi Delta Attention (KDA) con 24 capas de Gated DSA (DeepSeek Sparse Attention). La atencion dispersa con top-K de 2048 sobre 32 cabezas de indice de dimension 128 permite que el coste de atencion crezca de forma mas contenida con la longitud de secuencia, lo que hace viable la ventana de 1M tokens. El bloque MoE usa una dimension latente de 3584, 896 expertos de dimension oculta 3072, seleccion de 16 expertos por token y 2 expertos compartidos, con un vocabulario de 160K tokens.

El entrenamiento parte de Kimi K3 y se completa con un post-entrenamiento de aprendizaje por refuerzo conjunto a gran escala sobre cientos de dominios downstream. La model card no especifica el numero de tokens de preentrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas adicionales como DPO o decodificacion especulativa. El modelo es multimodal nativo, lo que implica que la torre de vision se entreno de forma conjunta con el resto de la red y no como un modulo acoplado.

## Capacidades
- Generacion de texto y razonamiento de proposito general con 1M tokens de contexto.
- Generacion de codigo, con mejoras declaradas por el autor en tareas de programacion.
- Creacion 3D: el autor cita mejoras sustanciales en este dominio tras el RL conjunto.
- Investigacion financiera y analisis de documentos extensos.
- Precision factual mejorada respecto a Kimi K3, segun la model card.
- Capacidades agenticas: razonamiento multi-paso y ejecucion de tareas encadenadas.
- Procesamiento de imagen y texto de forma nativa (pipeline image-text-to-text).
- Compatibilidad con endpoints (tag endpoints_compatible) y uso conversacional multi-turno.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.

## Casos de uso
- Analisis de repositorios completos: con 1M tokens de contexto, el modelo puede ingerir un monorepo de tamano medio y responder preguntas de arquitectura, dependencias o refactorizaciones sin trocear el codigo en fragmentos.
- Agentes de ingenieria de software: integrado en pipelines de CI/CD para triaje de fallos, generacion de parches y revision automatica de pull requests, aprovechando su capacidad de razonamiento multi-paso.
- Investigacion financiera automatizada: lectura de informes anuales, transcripciones de resultados y estados financieros en una sola ventana, con extraccion de cifras y comparativas entre ejercicios.
- Generacion de activos 3D: creacion de escenas y geometria a partir de descripciones textuales o imagenes de referencia, un dominio en el que el autor declara mejoras especificas.
- Asistentes documentales multimodales: procesamiento conjunto de PDFs con tablas, graficos e imagenes escaneadas para extraccion estructurada de datos.
- Auditoria de cumplimiento normativo: analisis de contratos y politicas extensas con trazabilidad de citas a lo largo de cientos de paginas gracias al contexto de 1M tokens.
- Copiloto de analisis de datos: interpretacion de notebooks, resultados de experimentos y documentacion tecnica en una unica sesion conversacional.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona mejoras cualitativas en codigo, creacion 3D, investigacion financiera y precision factual respecto a Kimi K3, pero no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar.

## Requisitos de hardware
- VRAM estimada: con cuantizacion de 8 bits y 2,8T parametros, el peso ronda los 2,8 TB; el repositorio completo ocupa 1561,4 GB, por lo que se requiere un cluster multi-nodo con al menos 1,5-3 TB de memoria agregada solo para los pesos.
- GPU recomendadas: nodos con H100 (80 GB), H200 (141 GB) o B200; se necesitan del orden de 20-40 GPUs de 80 GB para alojar los pesos en 8 bits, mas memoria adicional para cache KV de contexto largo.
- GPU de consumo: no cabe en ninguna GPU consumer (RTX 4090, 5090, etc.) ni en estaciones de trabajo con multiples GPUs de 24-48 GB.
- Opciones de despliegue: transformers con custom_code (requerido por la arquitectura KDA/DSA); no se confirma soporte en vLLM, llama.cpp, Ollama o TGI en la informacion disponible. El tag endpoints_compatible sugiere despliegue via Hugging Face Endpoints.
- Latencia y throughput: no disponibles. Con 104B parametros activos por token, el coste por token es comparable a un modelo denso de esa talla, pero el cuello de botella real sera el ancho de banda de memoria para cargar los expertos y la gestion de la cache KV en contextos de 1M tokens.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kimi K3.1 Pro | 2,8T / 104B | 1M | Propietaria (kimi-k3.1-pro) | Pesos en HF, 8-bit |
| Kimi K3 | no disponible | no disponible | no disponible | Referencia base del post-entrenamiento |
| Otros modelos clase 3T | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos competidores de la misma clase, por lo que la comparativa cuantitativa no esta disponible. El unico punto de referencia documentado es Kimi K3, del que se indica que K3.1 Pro mejora en codigo, 3D, finanzas y precision factual, sin cifras.

## Limitaciones y advertencias
- Licencia propietaria "kimi-k3.1-pro" con license: other: es imprescindible revisar los terminos antes de cualquier uso comercial; no es un modelo open source.
- El tag compressed-tensors y la cuantizacion 8-bit implican posibles perdidas de calidad frente a los pesos originales en BF16; no se documenta la degradacion.
- Riesgo de alucinacion: no se publican evaluaciones de factualidad ni tasas de error, pese a que el autor declara mejoras en precision factual.
- Idiomas soportados no documentados: no hay garantia de rendimiento fuera del ingles y el chino, idiomas habituales de Moonshot AI.
- Requiere codigo custom (custom_code) y una version de transformers compatible; la integracion con frameworks de inferencia de alto rendimiento no esta confirmada.
- El coste de despliegue es prohibitivo para equipos pequenos: 1561,4 GB de repositorio y ~2,8 TB de pesos en 8 bits.
- La model card esta truncada en la informacion disponible; faltan secciones de uso, evaluacion y limitaciones declaradas por el autor.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de comunidad ni de validacion independiente del repositorio Renderleaf.

## Enlaces
- Hugging Face: https://huggingface.co/Renderleaf/Kimi-K3.1-Pro
- Organizacion Moonshot AI en Hugging Face: https://huggingface.co/moonshotai
- Blog tecnico: https://www.kimi.ai/blog/kimi-k3-1-pro
- Quickstart de API: https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart
- Chat: https://www.kimi.ai
- Homepage: https://www.moonshot.ai
- X (Twitter): https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
- Licencia: https://huggingface.co/moonshotai/Kimi-K3.1-Pro/blob/main/LICENSE
