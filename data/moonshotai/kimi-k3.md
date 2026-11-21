# moonshotai/Kimi-K3

## Resumen

Kimi K3 es un modelo multimodal nativo de tipo agente, desarrollado por Moonshot AI, que se presenta como el primer modelo abierto de la clase de 3 billones de parametros. Con 2,8 billones de parametros totales y 104.000 millones activados por token, emplea una arquitectura Mixture-of-Experts (MoE) construida sobre Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), junto con un marco Stable LatentMoE que activa 16 de 896 expertos. Incorpora vision nativa y una ventana de contexto de un millon de tokens.

El modelo esta disenado para tareas de inteligencia de frontera: programacion de largo horizonte (optimizacion de kernels de GPU, desarrollo de compiladores, CAD, diseno de chips), trabajo de conocimiento agentico con investigacion profunda y visualizaciones interactivas, y razonamiento multimodal sobre texto, imagen y video dentro del mismo modelo. Su publicacion como pesos abiertos bajo la licencia Kimi K3 lo convierte en una referencia relevante para investigacion y despliegue en entornos de alta capacidad.

La relevancia actual reside en su escala (clase 3T) combinada con una eficiencia de escalado declarada de aproximadamente 2,5 veces respecto a Kimi K2, y en la disponibilidad de pesos completos, algo poco habitual en modelos de este tamano. La model card indica ademas una version posterior, Kimi-K3.1-Pro, como `new_version`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) |
| Parametros totales | 2.779.931.837.184 (2,8T) |
| Parametros activos | 104B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8-bit (tag `8-bit`); otros tipos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3 License (identificador `kimi-k3`, categoria `other`) |
| Formato de pesos | safetensors (tag), con `compressed-tensors`; repo de 1561,0 GB |
| Capas totales | 93 (1 capa densa) |
| Composicion de atencion | 69 capas KDA + 24 capas Gated MLA |
| Dimension oculta de atencion | 7168 |
| Cabezas de atencion | 96 |
| Dimension latente MoE | 3584 |
| Dimension oculta MoE por experto | 3072 |
| Numero de expertos | 896 (16 activos) |
| Libreria | transformers (con `custom_code`) |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

Kimi K3 es un transformer MoE de 93 capas (una de ellas densa) que combina dos mecanismos de atencion: 69 capas de Kimi Delta Attention (KDA) y 24 capas de Gated MLA (Multi-head Latent Attention con compuerta). La dimension oculta de atencion es de 7168 con 96 cabezas. El bloque MoE utiliza un marco Stable LatentMoE con dimension latente de 3584 y 896 expertos de dimension oculta 3072, de los cuales se activan 16 por token, lo que da lugar a los 104B parametros activos. Moonshot AI declara una mejora de eficiencia de escalado de aproximadamente 2,5 veces frente a Kimi K2.

El modelo es multimodal nativo: procesa texto, imagenes y video dentro de la misma arquitectura, sin adaptadores externos segun la model card. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifican innovaciones adicionales como decodificacion especulativa. La model card menciona que los pesos se distribuyen con `compressed-tensors` y en formato de 8 bits.

## Capacidades

- Generacion de texto y razonamiento de proposito general, orientado a inteligencia de frontera.
- Programacion de largo horizonte con supervision humana minima: sesiones de ingenieria prolongadas, navegacion de repositorios masivos y orquestacion de herramientas de terminal.
- Capacidades multimodales nativas: comprension de texto, imagenes y video en el mismo modelo (pipeline `image-text-to-text`).
- Trabajo de conocimiento agentico: investigacion profunda, generacion de visualizaciones interactivas, widgets y dashboards, diseno de movimiento y edicion de video.
- Ventana de contexto de un millon de tokens, adecuada para documentos y codebases extensos.
- Soporte de tool calling y function calling: la model card describe orquestacion de herramientas de terminal y flujos multi-paso, aunque no se detalla el formato exacto de las llamadas.
- Capacidades especializadas declaradas: optimizacion de kernels de GPU, desarrollo de compiladores, CAD y diseno de chips.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Programacion agentica en repositorios grandes: el modelo puede sostener sesiones de ingenieria de largo horizonte y navegar codebases masivos gracias a su contexto de un millon de tokens, lo que permite cargar modulos completos y mantener coherencia entre archivos.
- Optimizacion de kernels de GPU: con capacidad declarada para optimizacion de kernels, puede iterar sobre codigo CUDA o similar, ejecutar pruebas mediante tool calling y refinar resultados en bucles multi-paso.
- Desarrollo de compiladores y herramientas de sistema: su orientacion a terminal y orquestacion de herramientas lo hace adecuado para tareas de construccion, depuracion y automatizacion de pipelines de compilacion.
- Investigacion profunda con visualizacion: puede generar informes con dashboards, widgets y graficos interactivos, aprovechando su multimodalidad para interpretar figuras y documentos visuales.
- Analisis de video y documentos extensos: la ventana de 1M tokens y la entrada de video permiten resumir reuniones, analizar grabaciones largas o extraer informacion de corpus documentales con imagenes intercaladas.
- Diseno asistido (CAD y diseno de chips): la model card cita explicitamente flujos de vision-in-the-loop para desarrollo de videojuegos, CAD y diseno de chips, donde el modelo interpreta representaciones visuales y propone modificaciones.
- Edicion de video y diseno de movimiento: capacidad declarada para producir y editar contenido audiovisual dentro de flujos de trabajo de conocimiento.
- Automatizacion de tareas de conocimiento end-to-end: generacion de informes, extraccion estructurada y sintesis a partir de fuentes multimodales, con soporte de agentes multi-paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 2,8T parametros totales, los pesos en 8 bits ocuparian del orden de 2,8 TB, lo que exige despliegue multi-nodo; el repo ocupa 1561,0 GB, consistente con formatos comprimidos.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por escala, se requiere un cluster multi-GPU de clase H100 o superior; no se confirma ningun modelo concreto.
- GPU de consumo: no cabe en GPUs consumer (RTX 4090 u otras) dado el tamano del modelo.
- Opciones de despliegue: la libreria indicada es transformers con `custom_code`; el tag `deploy:sagemaker` sugiere soporte en Amazon SageMaker. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Kimi K3 | 2,8T | 104B | 1M tokens | Kimi K3 License | Multimodal nativo, KDA + AttnRes, 896 expertos |
| Kimi K2 | no disponible | no disponible | no disponible | no disponible | Referencia citada por el autor; K3 declara ~2,5x mejor eficiencia de escalado |
| Kimi-K3.1-Pro | no disponible | no disponible | no disponible | no disponible | Version posterior indicada como `new_version` en la model card |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos alternativos en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa con otras familias.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado; como modelo generativo de gran escala, es esperable en tareas de conocimiento, pero no hay datos publicados.
- Limitaciones de contexto o idioma: la ventana es de 1M tokens, pero no se especifican los idiomas soportados ni su calidad relativa.
- Licencia: la Kimi K3 License es una licencia `other` con nombre propio; es imprescindible revisar sus terminos antes de cualquier uso comercial, ya que no se detallan en la informacion disponible.
- Requisitos de infraestructura: el tamano (2,8T parametros, repo de 1561,0 GB) hace inviable el despliegue en hardware de consumo y exige infraestructura multi-nodo.
- Madurez: la model card apunta a Kimi-K3.1-Pro como version posterior, lo que sugiere que K3 puede quedar superado por esa revision.
- Datos de entrenamiento y evaluacion: no se publican detalles sobre dataset, RLHF/DPO ni resultados de benchmarks en la informacion disponible, lo que dificulta la validacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/moonshotai/Kimi-K3
- Blog tecnico: https://www.kimi.com/blog/kimi-k3
- Informe tecnico completo: https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Repositorio GitHub: https://github.com/MoonshotAI/Kimi-K3
- Licencia: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
- Chat: https://www.kimi.com
- Homepage: https://www.moonshot.ai
- Organizacion en Hugging Face: https://huggingface.co/moonshotai
- Twitter/X: https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
