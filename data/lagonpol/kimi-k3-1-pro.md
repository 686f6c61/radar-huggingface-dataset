# LagonPol/Kimi-K3.1-Pro

## Resumen

Kimi K3.1 Pro es un modelo de lenguaje multimodal nativo y orientado a tareas agénticas, publicado con pesos abiertos por Moonshot AI. Se trata del primer modelo de la serie K3.1 y, según su model card, el modelo más capaz de la clase 3T de la compañía. Está post-entrenado a partir de Kimi K3 mediante aprendizaje por refuerzo conjunto a gran escala sobre cientos de dominios downstream, con mejoras declaradas en programación, creación 3D, investigación financiera y precisión factual.

Arquitectura Mixture-of-Experts (MoE) con 2,8 billones de parámetros totales y 104.000 millones activos por token, 93 capas (una densa) y una composición de atención híbrida de 69 capas KDA más 24 capas Gated DSA. La ventana de contexto alcanza el millón de tokens, lo que lo sitúa en la gama de modelos de contexto ultra-largo. El repositorio de Hugging Face ocupa 1,56 TB y los pesos se distribuyen en safetensors con cuantización de 8 bits mediante compressed-tensors.

La relevancia actual del modelo radica en su combinación de escala, contexto de 1M tokens y capacidades multimodales (pipeline image-text-to-text) en un único checkpoint abierto, lo que lo convierte en candidato para despliegues agénticos de largo alcance. No obstante, su tamaño hace que la inferencia local sea inviable en hardware de consumo y exija infraestructura multi-GPU de centro de datos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención híbrida: 69 capas KDA + 24 capas Gated DSA |
| Parámetros totales | 2.780.110.363.392 (2,8T) |
| Parámetros activos | 104B |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantización | 8 bits (compressed-tensors); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3.1-pro (license: other) |
| Formato de pesos | safetensors (compressed-tensors, 8-bit) |

Otros datos de arquitectura declarados en la model card:

| Parámetro | Valor |
|---|---|
| Número de capas | 93 |
| Capas densas | 1 |
| Dimensión oculta de atención | 7168 |
| Cabezas de atención | 96 |
| Dimensión de cabeza de índice DSA | 128 |
| Cabezas de índice DSA | 32 |
| Top-K de índice DSA | 2048 |
| Dimensión latente MoE | 3584 |
| Dimensión oculta MoE por experto | 3072 |
| Número de expertos | 896 |
| Expertos seleccionados por token | 16 |
| Expertos compartidos | 2 |
| Tamaño de vocabulario | 160K |
| Tamaño del repositorio | 1561,4 GB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con mezcla de expertos (MoE) de 896 expertos, de los cuales se activan 16 por token más 2 expertos compartidos, sobre una dimensión latente de 3584 y una dimensión oculta de 3072 por experto. La pila consta de 93 capas, con una única capa densa y el resto con mecanismos MoE. La atención es híbrida: 69 capas usan KDA (atención lineal) y 24 capas usan Gated DSA (atención dispersa con compuerta), con 96 cabezas de atención sobre una dimensión oculta de 7168. El mecanismo DSA incorpora 32 cabezas de índice de dimensión 128 y un Top-K de 2048, lo que permite seleccionar un subconjunto de tokens relevantes en contextos de hasta 1M de tokens y reducir el coste cuadrático de la atención.

El entrenamiento parte de Kimi K3 y se completa con un post-entrenamiento basado en aprendizaje por refuerzo conjunto a gran escala sobre cientos de dominios downstream. La model card no detalla el número de tokens de preentrenamiento, la composición exacta del dataset ni si se aplicaron fases específicas de RLHF o DPO más allá de la mención al RL conjunto. Tampoco se especifican innovaciones adicionales como decodificación especulativa. El checkpoint publicado está cuantizado a 8 bits con compressed-tensors, lo que reduce el peso del repositorio pero no elimina la necesidad de infraestructura de centro de datos.

## Capacidades

- Generación de texto y razonamiento multi-turno con ventana de contexto de 1M tokens.
- Capacidades multimodales nativas: pipeline image-text-to-text, con entrada de imagen y texto.
- Programación y generación de código, con mejoras declaradas en coding tras el post-entrenamiento.
- Creación 3D, según las mejoras declaradas en la model card.
- Investigación financiera y precisión factual mejorada respecto a Kimi K3.
- Capacidades agénticas: el modelo se describe como "agentic model", orientado a tareas de múltiples pasos.
- Compatibilidad con endpoints (tag endpoints_compatible) para despliegue como servicio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Idiomas soportados: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Análisis de repositorios completos: con 1M tokens de contexto, el modelo puede ingerir bases de código extensas y responder preguntas de arquitectura, dependencias o refactorizaciones sin truncar el código fuente.
- Agentes autónomos de múltiples pasos: su naturaleza agéntica y su contexto largo permiten mantener el estado de una tarea compleja (planificación, ejecución de herramientas, verificación) a lo largo de muchas iteraciones.
- Investigación financiera asistida: el modelo declara mejoras en investigación financiera y precisión factual, por lo que puede usarse para resumir informes anuales, extraer métricas y contrastar datos entre documentos extensos.
- Generación de código en producción: integrable en pipelines de CI/CD mediante endpoints compatibles para revisión de código, generación de tests y corrección de errores en diff completos.
- Creación 3D y flujos de diseño: la capacidad declarada de creación 3D permite generar descripciones estructuradas, scripts de modelado o especificaciones a partir de imágenes y texto de entrada.
- Procesamiento de documentos multimodales: al aceptar image-text-to-text, puede extraer información de capturas, diagramas o páginas escaneadas junto con el texto asociado en un mismo contexto.
- Asistentes de atención al cliente de largo alcance: el contexto de 1M tokens permite conservar el historial completo de una conversación y documentación de producto sin resumir.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 2,8T de parámetros en 8 bits, el checkpoint ronda 1,56 TB, por lo que la inferencia requiere agregados multi-GPU de centro de datos; no es viable en una sola GPU.
- GPU recomendadas: no especificadas en la información proporcionada. Por escala, se requiere un clúster de GPUs de centro de datos (A100, H100 u equivalentes); el número exacto no está disponible.
- GPU de consumo: no cabe en ninguna GPU de consumo (RTX 4090 u otras) por el tamaño del checkpoint.
- Opciones de despliegue: transformers (librería declarada) y endpoints compatibles; soporte de vLLM, llama.cpp, Ollama o TGI no disponible en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3.1 Pro | 2,8T | 104B | 1M | kimi-k3.1-pro (other) | Pesos abiertos en Hugging Face |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva K3.1 Pro |
| Alternativas de la misma clase 3T | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado; la model card declara mejoras en precisión factual, pero no aporta métricas que lo respalden.
- Idiomas soportados: no especificados, lo que impide garantizar un rendimiento multilingüe homogéneo.
- Licencia: "kimi-k3.1-pro" bajo license: other; es necesario revisar el texto completo de la licencia antes de cualquier uso comercial, ya que las condiciones no están detalladas en la información disponible.
- Tamaño: 1,56 TB de repositorio y 2,8T de parámetros hacen inviable el despliegue en hardware de consumo y exigen infraestructura multi-GPU.
- Cuantización: el checkpoint está en 8 bits con compressed-tensors; puede requerir versiones específicas de librerías y no se garantiza paridad exacta con los pesos originales en precisión completa.
- Datos de entrenamiento: no se detalla la composición del dataset ni el número de tokens, lo que limita la evaluación de riesgos de contaminación o sesgo.
- Fecha de creación del repositorio: 16 de noviembre de 2026, según los metadatos de Hugging Face.

## Enlaces

- Hugging Face: https://huggingface.co/LagonPol/Kimi-K3.1-Pro
- Organización Moonshot AI en Hugging Face: https://huggingface.co/moonshotai
- Repositorio de referencia del autor: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Licencia: https://huggingface.co/moonshotai/Kimi-K3.1-Pro/blob/main/LICENSE
- Tech Blog: https://www.kimi.ai/blog/kimi-k3-1-pro
- API Quickstart: https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart
- Chat: https://www.kimi.ai
- Homepage: https://www.moonshot.ai
- X (Twitter): https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
