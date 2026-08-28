# oakmindai/GLM-5.3-Flash-NVFP4-FTW

## Resumen

GLM-5.3-Flash-NVFP4-FTW es un artefacto de despliegue derivado del modelo GLM-5.3 Flash de Z.ai, convertido al formato FreeToken Weight (FTW) por OakMind AI y validado para ejecutarse en NVIDIA DGX Spark (GB10). No introduce un modelo nuevo ni una cuantización nueva: parte del checkpoint NVFP4 publicado por Red Hat AI, que a su vez deriva del modelo original de Z.ai. La conversión reorganiza los tensores del modelo en bancos de expertos direccionables de forma independiente, lo que permite ejecutar los 320.000 millones de parámetros totales en un solo DGX Spark de 128 GB mediante descarga de filas de expertos desde NVMe.

El modelo base es un MoE multimodal de 320B parámetros totales y 18B activos, con una ventana de contexto de 1 millón de tokens. Esta conversión concreta está validada únicamente para entrada y salida de texto; los componentes de visión del checkpoint original no están habilitados en esta ruta de despliegue. La relevancia de este artefacto radica en que permite ejecutar un modelo de frontera de código abierto en un hardware de escritorio de gama alta, sin necesidad de clústeres multi-GPU, gracias a la combinación de cuantización NVFP4, gestión de memoria unificada y almacenamiento NVMe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con atención DSA (Dynamic Sparse Attention) |
| Parametros totales | 320.000 millones (320B) |
| Parametros activos | 18.000 millones (18B) |
| Longitud de contexto | 1.000.000 tokens (según documentación del modelo base) |
| Tipos de cuantizacion | NVFP4 (rutas de expertos); pesos densos, KDA, embeddings y cabeza de salida en precisión original |
| Idiomas soportados | no disponible (no especificado en la información proporcionada) |
| Licencia | no disponible (se remite a la licencia del modelo base zai-org/GLM-5.3-Flash y del checkpoint RedHatAI/GLM-5.3-Flash-NVFP4) |
| Formato de pesos | FTW (FreeToken Weight), formato nativo de FreeToken; el repositorio ocupa 189,3 GB |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 Flash es un transformer de arquitectura MoE con 320B parámetros totales y 18B activos por token. Incorpora atención DSA (Dynamic Sparse Attention) y un componente de visión nativo, aunque esta conversión FTW no habilita la ruta de visión. El entrenamiento del modelo base fue realizado por Z.ai; los detalles completos de datos, tokens y metodología se encuentran en el informe técnico del modelo original (referencia arxiv:2602.15763 y arxiv:2608.16157 según las etiquetas de HuggingFace).

La conversión FTW realizada por OakMind AI no modifica los pesos ni la calidad esperada del modelo. Los tensores de los expertos enrutados se almacenan en bancos de expertos direccionables de forma independiente, mientras que el resto de tensores se alinean y fragmentan para el cargador nativo de FreeToken. No se realizó ningún reentrenamiento ni requantización en el momento de la conversión. El checkpoint fuente de Red Hat AI (revisión `9eaeadaf026871a90640e32c0604f6ab0b2d641d`) mantiene la representación NVFP4 en los expertos enrutados y la precisión original en el resto de componentes.

## Capacidades

- Generación de texto conversacional y de larga forma con ventana de contexto de 1M tokens.
- Razonamiento complejo y resolución de problemas en múltiples dominios (matemáticas, ciencia, lógica).
- Generación de código y soporte de tareas agénticas (según benchmarks del modelo base, rivaliza con Claude Opus 4.8 en tareas de coding y agentes).
- Capacidades multilingües (idiomas no especificados en la información disponible).
- Soporte de tool calling y function calling (implícito en las capacidades agénticas del modelo base).
- En esta conversión concreta, la entrada y salida están limitadas a texto; la visión no está habilitada.
- Compatible con APIs estilo OpenAI y Anthropic a través del servidor SparkLab.

## Casos de uso

- Asistentes de programación en entornos de desarrollo locales: el modelo puede ejecutarse en un DGX Spark y ofrecer autocompletado, refactorización y generación de código con baja latencia gracias a sus 18B parámetros activos y la descarga de expertos desde NVMe.
- Análisis de documentos extensos: con 1M tokens de contexto, puede procesar libros técnicos completos, bases de código enteras o expedientes legales en una sola pasada, sin necesidad de fragmentar el texto.
- Agentes autónomos de investigación: su capacidad de razonamiento multi-paso y tool calling permite construir agentes que consulten APIs, ejecuten código y sinteticen resultados, todo en un solo dispositivo.
- Servicio de atención al cliente con contexto largo: puede mantener conversaciones multi-turno con historial extenso, ideal para soporte técnico especializado donde el usuario arrastra problemas complejos.
- Prototipado rápido de aplicaciones de IA generativa: al ser un modelo abierto y ejecutable localmente, permite iterar sin costes de API ni dependencia de servicios externos.
- Despliegue en edge computing de alta gama: el DGX Spark es un equipo de escritorio; este artefacto permite llevar un modelo de 320B a entornos con requisitos de privacidad de datos estrictos, donde no se permite enviar información a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta conversión FTW en la información disponible. El modelo base GLM-5.3 Flash, según la documentación de Z.ai y fuentes externas, supera a GLM-5.2 en benchmarks generales y se acerca a Claude Opus 4.8 en tareas de código y agénticas. Los resultados de evaluación del checkpoint NVFP4 fuente están disponibles en la página de RedHatAI/GLM-5.3-Flash-NVFP4. No se dispone de números concretos para incluir en esta ficha.

## Requisitos de hardware

- Hardware objetivo: NVIDIA DGX Spark con superchip Grace Blackwell GB10 y 128 GB de memoria unificada.
- VRAM estimada: el modelo completo ocupa 189,3 GB en disco; en ejecución, la memoria unificada del GB10 se gestiona con un ratio de 0,97 (aproximadamente 124 GB disponibles para el modelo y cachés).
- GPU recomendadas: DGX Spark (GB10) es la plataforma validada. No se indica compatibilidad con otras GPUs en la información proporcionada.
- Almacenamiento: se requiere NVMe local para almacenar el checkpoint y servir las filas de expertos enrutados que no caben en memoria.
- Opciones de despliegue: servidor SparkLab con API compatible OpenAI/Anthropic; backend de inferencia FreeToken con kernels NVFP4 Triton y atención DSA.
- Parámetros de ejecución recomendados: `--moe-storage disk`, `--moe-cache-auto`, `--memory-ratio 0.97`, `--attention-backend dsa`, `--nvfp4-backend triton`, `--max-running-requests 1`.
- Latencia y throughput: no se proporcionan cifras concretas en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash (base) | 320B | 18B | 1M | no disponible | HuggingFace (zai-org) |
| GLM-5.3-Flash-NVFP4 (Red Hat AI) | 320B | 18B | 1M | no disponible | HuggingFace (RedHatAI) |
| GLM-5.3-Flash-NVFP4-FTW (OakMind) | 320B | 18B | 1M | no disponible | HuggingFace (oakmindai) |

No se dispone de información suficiente para comparar con otros modelos MoE de la misma categoría (por ejemplo, DeepSeek-V3 o Qwen3-MoE) en términos de rendimiento, ya que no se han proporcionado datos de benchmarks comparativos.

## Limitaciones y advertencias

- Esta conversión no habilita la visión: el checkpoint conserva los componentes de visión del modelo original, pero la ruta de despliegue SparkLab está validada solo para texto.
- La licencia no está especificada en la información de HuggingFace; es imprescindible revisar los términos del modelo base (zai-org/GLM-5.3-Flash) y del checkpoint fuente (RedHatAI/GLM-5.3-Flash-NVFP4) antes de cualquier uso comercial.
- El despliegue está optimizado para DGX Spark; ejecutarlo en otro hardware puede requerir ajustes no documentados y no se garantiza el rendimiento.
- La configuración de memoria (`--memory-ratio 0.97`) es específica de este checkpoint y no debe copiarse a otros modelos sin medir el margen de memoria.
- El modelo base puede presentar sesgos y alucinaciones inherentes a los LLM; no se han publicado evaluaciones específicas de seguridad para esta conversión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un artefacto muy reciente y con poca validación comunitaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/oakmindai/GLM-5.3-Flash-NVFP4-FTW
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Checkpoint fuente cuantizado: https://huggingface.co/RedHatAI/GLM-5.3-Flash-NVFP4
- Herramienta de cuantización LLM Compressor: https://github.com/vllm-project/llm-compressor
- Backend de inferencia FreeToken: https://github.com/FlashML-org/FreeToken
- Guía de ejecución local (unsloth): https://unsloth.ai/docs/models/glm-5.3-flash
- Guía de benchmarks y precios (glm-ai.chat): https://glm-ai.chat/models/glm-5-3-flash/
- Guía de configuración local (linas.substack.com): https://linas.substack.com/p/glm-5-3-flash-guide
