# InternScience/Agents-A1-4B

## Resumen

Agents-A1-4B es un modelo de lenguaje multimodal (VLM) de tipo agéntico desarrollado por InternScience, diseñado para tareas de razonamiento de largo horizonte (long-horizon agentic) en dominios como búsqueda profunda, ingeniería, investigación científica, seguimiento de instrucciones y uso de herramientas. Con solo 4.539 millones de parámetros, este modelo denso pretende acercar el rendimiento de sistemas frontera de mayor tamaño a entornos con recursos limitados, manteniendo capacidades de planificación multi-paso, tool calling y comprensión de imágenes.

El modelo forma parte de la familia Agents-A1, que incluye una variante MoE de 35B-A3B. La versión 4B se publicó el 13 de julio de 2026 bajo licencia Apache 2.0, con pesos en formato safetensors y compatibilidad declarada con Hugging Face Transformers, vLLM y SGLang. Su arquitectura se basa en el diseño de Qwen3.5 e incorpora componentes de visión, lo que le permite procesar entradas de imagen y texto de forma conjunta.

La relevancia de este lanzamiento radica en su estrategia de escalado: en lugar de aumentar parámetros, InternScience ha desarrollado un paradigma de entrenamiento en tres etapas que combina supervisión fina en todos los dominios, modelos profesor por dominio y destilación on-policy multi-profesor. Los resultados publicados en benchmarks como BrowseComp (66.8), GAIA (95.1) e IFEval (94.8) superan a modelos de tamaño similar y se acercan a MoE de mayor escala, lo que lo convierte en una opción atractiva para despliegues locales y aplicaciones agénticas en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3.5, con componentes de vision (VLM) |
| Parametros totales | 4.539.265.536 (4,54B) |
| Parametros activos | No aplica (modelo denso, todos los parametros activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificado oficialmente; la comunidad mlx-community ha publicado versiones cuantizadas para Apple Silicon |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Agents-A1-4B es un modelo denso basado en la arquitectura de Qwen3.5, con capacidades multimodales que le permiten procesar entradas de imagen y texto (etiquetado como image-text-to-text y vlm). Al tratarse de un modelo denso, todos sus parámetros participan en cada inferencia, lo que simplifica el despliegue frente a arquitecturas MoE.

El entrenamiento sigue un paradigma de tres etapas descrito en el informe tecnico (arxiv:2606.30616). Primero se realiza una supervisión fina en todos los dominios para alinear el modelo base con comportamientos agénticos generales. Después se entrenan modelos profesor específicos por dominio para capturar experiencia especializada. Finalmente se aplica destilación on-policy multi-profesor y multi-dominio con optimización consciente de la heterogeneidad, con el objetivo de transferir conocimiento entre dominios de forma eficiente. Además, el proceso se apoya en una infraestructura de conocimiento-acción anclada al dominio que construye acciones, observaciones y resultados de verificación de forma conjunta, convirtiendo el proceso del agente en un objetivo entrenable.

No se han publicado datos sobre el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Razonamiento agéntico: descompone tareas complejas en sub-pasos ejecutables, planifica con antelación y adapta su estrategia según resultados intermedios.
- Uso de herramientas: soporte nativo de function calling e integración con APIs, intérpretes de código, motores de búsqueda y otras herramientas externas.
- Comprensión multimodal: procesa entradas de imagen y texto, lo que permite tareas que combinan visión y lenguaje.
- Razonamiento científico y profesional: maneja razonamiento científico integrado con herramientas y responde preguntas de conocimiento profesional.
- Seguimiento de instrucciones: sigue instrucciones detalladas con múltiples restricciones en diversos dominios.
- Búsqueda de largo horizonte: capaz de mantener trayectorias largas de búsqueda y navegación web con múltiples pasos.
- Generación de texto conversacional: pipeline de text-generation con soporte para diálogos multi-turno.

## Casos de uso

- Agente de búsqueda profunda en la web: el modelo puede ejecutar trayectorias largas de navegación, consultar motores de búsqueda, leer resultados y sintetizar información, gracias a su rendimiento en BrowseComp (66.8) y su capacidad de planificación multi-paso.
- Asistente de investigación científica: con su capacidad de razonamiento científico integrado con herramientas, puede consultar bases de datos, ejecutar cálculos y redactar resúmenes de literatura, como refleja su puntuación en FrontierScience-Research (33.3).
- Automatización de tareas de ingeniería: soporta tool calling y puede integrarse en pipelines de CI/CD para generar código, ejecutar pruebas y diagnosticar errores, manteniendo contexto a lo largo de múltiples iteraciones.
- Atención al cliente automatizada: su capacidad de seguir instrucciones con múltiples restricciones (IFEval 94.8) y mantener conversaciones multi-turno lo hace adecuado para sistemas de soporte que requieren acceso a bases de conocimiento y APIs externas.
- Análisis de documentos con visión: al ser un VLM, puede procesar capturas de pantalla, diagramas o documentos escaneados, combinando comprensión visual con razonamiento textual para extraer datos y responder preguntas.
- Agente de planificación y ejecución de tareas: su razonamiento agéntico permite delegar tareas complejas como organización de eventos, investigación de mercado o preparación de informes, donde el modelo descompone el objetivo en pasos y utiliza herramientas según sea necesario.
- Prototipado de asistentes locales: con 4,54B parámetros y licencia Apache 2.0, puede desplegarse en hardware de consumo para construir asistentes personales con acceso a herramientas y visión, sin depender de APIs externas.

## Benchmarks y rendimiento

Los siguientes resultados provienen de la model card publicada por el autor. Se presentan los valores de Agents-A1-4B y, cuando están disponibles, los de modelos comparables.

| Benchmark | Agents-A1-4B | Qwen3.5-4B | Agents-A1 (35B MoE) |
|---|---|---|---|
| BrowseComp | 66.8 | 47.2 | No disponible |
| XBench-DS-2510 | 90.0 | No disponible | No disponible |
| GAIA | 95.1 | No disponible | No disponible |
| FrontierScience-Research | 33.3 | No disponible | No disponible |
| IFEval | 94.8 | No disponible | No disponible |

Según la model card, Agents-A1-4B supera significativamente a modelos de tamaño similar y algunos de sus resultados se acercan o superan a modelos MoE más grandes como Nex-N2-mini y Qwen3.6, aunque los valores concretos de esos modelos no se incluyen en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9,1 GB en FP16 (coincide con el tamaño del repositorio). Con cuantización de 8 bits se reduce a unos 4,5 GB, y con 4 bits a unos 2,3 GB.
- GPU recomendadas: una RTX 3090 o RTX 4090 (24 GB) permite ejecutar el modelo en FP16 con margen para contexto largo. GPUs de 12 GB (RTX 3060, RTX 4070) pueden usarlo con cuantización de 8 bits.
- En hardware de consumo: sí, cabe en GPUs de gama media con cuantización, y en Apple Silicon gracias a las versiones cuantizadas publicadas por mlx-community.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang, y posiblemente llama.cpp/Ollama si se generan pesos GGUF (no confirmado oficialmente).
- Latencia y throughput: no disponibles. Al ser un modelo denso de 4,54B, se espera una latencia moderada en GPUs de consumo, pero no se han publicado mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Agents-A1-4B | 4,54B denso | Transformer + visión | No disponible | Apache 2.0 | Hugging Face, ModelScope |
| Qwen3.5-4B | ~4B denso | Transformer | No disponible | No especificada | No especificada |
| Agents-A1 (35B MoE) | 35B total, 3B activos | MoE | No disponible | Apache 2.0 | Hugging Face, ModelScope |

Agents-A1-4B se posiciona frente a Qwen3.5-4B como alternativa de tamaño similar con capacidades agénticas y multimodales, superándolo en BrowseComp (66.8 frente a 47.2). Frente a su hermano mayor Agents-A1 (35B MoE), ofrece un rendimiento competitivo con una fracción de los parámetros, lo que lo hace más adecuado para despliegues con recursos limitados. No se dispone de datos de contexto ni de otros benchmarks comparativos para estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Los idiomas soportados no están especificados en la información disponible; se recomienda verificar el comportamiento multilingüe antes de usarlo en producción.
- No se ha publicado información sobre sesgos o alucinaciones específicas. Como todo modelo generativo, existe riesgo de producir contenido falso o inventado, especialmente en tareas de razonamiento de largo horizonte.
- La longitud de contexto no está documentada, lo que dificulta estimar su capacidad para manejar conversaciones o documentos muy extensos.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo es muy reciente (julio de 2026) y su ecosistema de herramientas y documentación aún está en desarrollo.
- No se han publicado datos sobre el dataset de entrenamiento, lo que limita la evaluación de posibles sesgos o limitaciones de conocimiento.
- El rendimiento en benchmarks se basa en datos proporcionados por el autor; se recomienda validar en casos de uso propios antes de adoptarlo en entornos críticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/InternScience/Agents-A1-4B
- Página oficial del proyecto: https://internscience.github.io/Agents-A1/
- Repositorio GitHub: https://github.com/InternScience/Agents-A1
- Informe tecnico (arXiv): https://arxiv.org/abs/2606.30616
- ModelScope: https://modelscope.cn/models/InternScience/Agents-A1
- Colección de modelos cuantizados: https://huggingface.co/collections/InternScience/agents-a1
- Versiones cuantizadas por mlx-community: https://huggingface.co/collections/mlx-community/agents-a1
