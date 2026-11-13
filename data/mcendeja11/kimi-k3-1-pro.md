# MCendeja11/Kimi-K3.1-Pro

## Resumen

Kimi K3.1 Pro es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Moonshot AI, presentado como un modelo agéntico nativamente multimodal y el primero de la serie K3.1. Con 2,8 billones de parámetros totales y 104.000 millones de parámetros activos por token, se posiciona como el modelo de clase 3T más capaz de la compañía hasta la fecha, según la propia model card. La versión publicada en el repositorio `MCendeja11/Kimi-K3.1-Pro` es un espejo de los pesos oficiales bajo la librería `transformers`, con formato `safetensors` y cuantización de 8 bits mediante `compressed-tensors`.

El modelo parte de Kimi K3 y se ha post-entrenado con aprendizaje por refuerzo conjunto a gran escala en cientos de dominios downstream, lo que según el autor se traduce en mejoras sustanciales en programación, creación 3D, investigación financiera, precisión factual y capacidades agénticas. Incorpora una ventana de contexto de un millón de tokens, lo que lo sitúa en la gama alta de modelos de contexto largo orientados a tareas de agente y razonamiento multi-paso.

Su relevancia actual radica en la combinación de escala (clase 3T), multimodalidad nativa (pipeline `image-text-to-text`) y contexto de 1M tokens, dentro de un ecosistema de pesos abiertos. No obstante, el tamaño del repositorio (1.561,4 GB) y el requisito de hardware lo hacen inaccesible para inferencia en equipos de consumo, y la licencia es personalizada (`kimi-k3.1-pro`), lo que obliga a revisar sus términos antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención híbrida: 69 capas KDA + 24 capas Gated DSA |
| Parametros totales | 2.780.110.363.392 (2,8T) |
| Parametros activos | 104B |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | 8 bits (compressed-tensors) en el repositorio; otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | `kimi-k3.1-pro` (licencia personalizada, `license: other`) |
| Formato de pesos | safetensors (con `custom_code` y `compressed-tensors`) |
| Capas totales | 93 (1 capa densa) |
| Dimension oculta de atencion | 7168 |
| Cabezas de atencion | 96 |
| Dimension de cabeza de indice DSA | 128 |
| Cabezas de indice DSA | 32 |
| Top-K de indice DSA | 2048 |
| Dimension latente MoE | 3584 |
| Dimension oculta MoE por experto | 3072 |
| Numero de expertos | 896 |
| Expertos seleccionados por token | 16 |
| Expertos compartidos | 2 |
| Tamano de vocabulario | 160K |
| Tamano del repositorio | 1561,4 GB |
| Libreria | transformers |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

Kimi K3.1 Pro es un transformer de tipo Mixture-of-Experts con 93 capas, de las cuales solo una es densa. La composición de atención es híbrida: 69 capas usan KDA (atención lineal de tipo kernelized/diagonal, según la nomenclatura del autor) y 24 capas emplean Gated DSA (atención dispersa dinámica con compuerta), con un Top-K de índice de 2048 y 32 cabezas de índice de dimensión 128. Esta mezcla busca combinar la eficiencia de la atención lineal en secuencias largas con la capacidad de recuperación selectiva de la atención dispersa, algo coherente con una ventana de 1M tokens.

El componente MoE cuenta con 896 expertos, de los que se seleccionan 16 por token, más 2 expertos compartidos, con una dimensión latente de 3584 y dimensión oculta de 3072 por experto. El vocabulario es de 160K tokens. El modelo se ha post-entrenado a partir de Kimi K3 mediante aprendizaje por refuerzo conjunto a gran escala en cientos de dominios downstream, según la model card. No se especifican en la información disponible el número de tokens de preentrenamiento, la composición del dataset, ni detalles sobre RLHF/DPO más allá de la mención genérica al RL conjunto.

La innovación técnica destacable es la combinación de atención híbrida (KDA + Gated DSA) con un MoE de grano muy fino (896 expertos, 16 activos) para sostener contexto de 1M tokens con un coste de activación de 104B parámetros. El repositorio incluye `custom_code`, lo que implica que la implementación exacta de las capas KDA/DSA no es estándar en `transformers` y requiere cargar código del autor. No se dispone de información sobre decodificación especulativa ni sobre detalles del proceso de entrenamiento multimodal.

## Capacidades

- Generación de texto y razonamiento multi-paso, con contexto de hasta 1M tokens.
- Capacidades multimodales nativas de entrada imagen-texto (pipeline `image-text-to-text`).
- Programación y generación de código, con mejoras declaradas por el autor en tareas de coding.
- Creación 3D, según la model card.
- Investigación financiera y análisis de documentos largos.
- Precisión factual mejorada respecto a Kimi K3, según el autor.
- Capacidades agénticas: el modelo se presenta como "agentic model", orientado a flujos de agente y razonamiento multi-paso.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponibles (los idiomas no están listados).
- Modo de razonamiento extendido ("thinking"): no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos extensos y contratos: con 1M tokens de contexto, el modelo puede ingerir expedientes completos, informes anuales o bases documentales y responder preguntas cruzadas sin fragmentación, lo que reduce la pérdida de información entre trozos.
- Agentes autónomos de investigación: su orientación agéntica y contexto largo permiten mantener el estado de una tarea multi-paso (búsqueda, lectura, síntesis) durante sesiones prolongadas, aunque el soporte explícito de tool calling no está confirmado.
- Generación y revisión de código en pipelines: el autor declara mejoras en coding; podría integrarse en revisión de PRs o generación de parches, siempre que se valide empíricamente el rendimiento real.
- Investigación financiera asistida: la model card menciona mejoras en financial research; útil para resumir informes, extraer métricas y comparar resultados entre documentos largos.
- Creación 3D y prototipado: capacidad declarada por el autor para tareas de creación 3D, aplicable a generación de descripciones estructuradas o asistencia en herramientas de modelado.
- Procesamiento de documentos con imágenes: al ser `image-text-to-text`, puede extraer información de capturas, gráficos o PDFs escaneados combinados con texto largo.
- Asistencia conversacional de contexto largo: atención al cliente técnica donde el historial completo de la cuenta o del incidente cabe en la ventana de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 1.561,4 GB en cuantización de 8 bits, por lo que se requiere un clúster multi-GPU; no cabe en una sola GPU convencional.
- GPU recomendadas: clústeres de H100/H200 o A100 de 80 GB en configuraciones multi-nodo; el número exacto de GPUs no está disponible, pero a 8 bits se necesitan del orden de 20 GPUs de 80 GB solo para los pesos.
- GPU de consumo: no cabe en ninguna GPU de consumo (RTX 4090, 3090, etc.) ni en configuraciones multi-GPU de consumo razonables.
- Opciones de despliegue: `transformers` con `custom_code` y `compressed-tensors`; vLLM, llama.cpp, Ollama o TGI no están confirmados para esta arquitectura en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3.1 Pro | 2,8T | 104B | 1M | `kimi-k3.1-pro` (personalizada) | Pesos en HF (espejo) |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | Referenciado como base |
| Alternativas de clase 3T | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia personalizada `kimi-k3.1-pro` con `license: other`: es imprescindible revisar el archivo LICENSE del repositorio oficial antes de cualquier uso comercial; no se garantiza uso comercial libre.
- Riesgo de alucinación: no se han publicado tasas de alucinación ni evaluaciones de fidelidad factual independientes; la afirmación de "mejor precisión factual" proviene del propio autor.
- Idiomas soportados no documentados: no se puede asumir un rendimiento multilingüe homogéneo sin evaluación.
- Tamaño prohibitivo: 1.561,4 GB en 8 bits y 2,8T parámetros totales implican infraestructura de clúster; no es viable en entornos de consumo ni en estaciones de trabajo convencionales.
- Dependencia de `custom_code`: la carga requiere confiar en el código del autor, lo que añade superficie de riesgo de seguridad y compatibilidad con versiones de `transformers`.
- Espejo no oficial: el repositorio `MCendeja11/Kimi-K3.1-Pro` tiene 0 descargas y 0 likes y no pertenece a la organización `moonshotai`; conviene verificar la integridad de los pesos frente al repositorio oficial.
- Sin benchmarks publicados en la información disponible: no hay evidencia cuantitativa independiente del rendimiento declarado.
- Fecha de creación del repositorio (2026-11-13) y ausencia de actualizaciones: no hay historial de mantenimiento que permita evaluar su vigencia.
- Sin datos sobre tool calling, modo thinking o límites de tasa: a validar antes de usarlo en producción agéntica.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/MCendeja11/Kimi-K3.1-Pro
- Organización oficial en Hugging Face: https://huggingface.co/moonshotai
- Repositorio oficial de referencia: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Licencia oficial: https://huggingface.co/moonshotai/Kimi-K3.1-Pro/blob/main/LICENSE
- Blog técnico: https://www.kimi.ai/blog/kimi-k3-1-pro
- Quickstart de API: https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart
- Chat: https://www.kimi.ai
- Página de Moonshot AI: https://www.moonshot.ai
- X (Twitter): https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
