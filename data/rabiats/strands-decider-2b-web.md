# RabiatS/strands-decider-2b-web

## Resumen
Strands Decider 2B es un modelo de decisión de código abierto desarrollado por AWS (Strands Labs) y publicado el 1 de octubre de 2026. Con 2 mil millones de parámetros, su función es tomar decisiones de enrutamiento y políticas para agentes de IA de forma rápida y local, sin generar texto. Está optimizado para inferir en menos de 100 ms, lo que lo hace adecuado para entornos donde la latencia es crítica.

La versión aquí presentada, alojada por RabiatS, es una copia del modelo original convertido a ONNX y recortado para su uso en el navegador mediante transformers.js. El repositorio ocupa 1.1 GB e incluye únicamente los archivos necesarios para la demo web. No se especifican la longitud de contexto, los idiomas soportados ni los detalles de entrenamiento en la información disponible.

Su relevancia radica en permitir que las decisiones de agentes se ejecuten en el cliente, reduciendo costes de servidor y preservando la privacidad de los datos. Es una alternativa a los modelos generativos grandes para tareas de clasificación y selección de acciones.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta qwen3_5_text sugiere una base Qwen3, sin confirmar) |
| Parámetros totales | 2B |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio de 1.1 GB sugiere una cuantización de 8 bits o inferior) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento
No se dispone de información detallada sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de alineación como RLHF o DPO. La etiqueta `qwen3_5_text` sugiere que podría estar basada en la familia Qwen3, pero la model card no lo confirma. El modelo está diseñado específicamente para toma de decisiones, no para generación de texto, y su salida es una acción o clase discreta.

La innovación principal es su optimización para inferencia local y de baja latencia (menos de 100 ms según fuentes externas). Al estar convertido a ONNX y recortado para transformers.js, puede ejecutarse directamente en el navegador sin necesidad de un servidor dedicado. No se documentan técnicas como decodificación especulativa o atención lineal.

## Capacidades
- Toma de decisiones de enrutamiento para agentes de IA: selecciona la siguiente acción o herramienta sin generar texto.
- Inferencia rápida: decisiones en menos de 100 ms según las fuentes consultadas.
- Ejecución local en el navegador mediante transformers.js y ONNX.
- No soporta generación de texto libre.
- No se especifican capacidades multilingües.
- No se especifica soporte explícito de tool calling, pero su función principal es elegir acciones o herramientas.
- No se documentan modos de pensamiento, visión, audio ni otras capacidades especiales.

## Casos de uso
- Enrutamiento de consultas en atención al cliente: el modelo decide si una consulta debe dirigirse a un agente humano, a un chatbot de preguntas frecuentes o a un sistema de tickets, según la intención detectada. Al ejecutarse en el navegador, reduce la latencia y evita enviar datos sensibles al servidor.
- Selección de herramientas en pipelines de agentes autónomos: en un flujo multi-paso, el modelo elige la siguiente herramienta (búsqueda web, calculadora, API externa) sin generar texto, agilizando la orquestación y reduciendo el coste computacional.
- Control de políticas en tiempo real: en aplicaciones de moderación, decide si un mensaje cumple las normas de la comunidad y debe publicarse o bloquearse, con inferencia en el dispositivo del usuario.
- Automatización de respuestas en asistentes virtuales: decide la intención del usuario y deriva a una respuesta predefinida, sin necesidad de un modelo generativo grande.
- Optimización de flujos CI/CD: dado un conjunto de cambios en el código, decide qué pruebas ejecutar o qué pipeline activar, reduciendo el uso de recursos en integración continua.
- Gestión de recursos en edge computing: en dispositivos con recursos limitados, decide localmente si una tarea debe procesarse en el dispositivo o enviarse a la nube.
- Filtrado de spam en formularios web: decide si un envío es spam según patrones, ejecutándose en el navegador del usuario sin enviar los datos a un servidor.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento mencionado en fuentes externas es un tiempo de decisión inferior a 100 ms, pero no se especifica en la model card ni se acompaña de métricas de precisión.

## Requisitos de hardware
- VRAM estimada para inferencia: al tratarse de un modelo de 2B parámetros, en precisión fp16 necesitaría aproximadamente 4 GB de VRAM; en cuantización int8, unos 2 GB; en int4, alrededor de 1 GB. El repositorio de 1.1 GB sugiere una cuantización de 8 bits o inferior.
- GPU recomendadas: cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4060, RTX 3070 o superiores. También puede ejecutarse en CPU, aunque con mayor latencia.
- Cabe en consumer GPU: sí, prácticamente cualquier GPU con al menos 2 GB de VRAM en cuantización int8.
- Opciones de despliegue: transformers.js (navegador), ONNX Runtime, WebGPU, WebAssembly. También podría convertirse a GGUF para llama.cpp, pero no se proporciona.
- Latencia y throughput estimados: menos de 100 ms por decisión según fuentes externas; no se dispone de datos de throughput.

## Comparativa con modelos similares
No se dispone de información sobre modelos comparables en la misma categoría de decisiones de agente con especificaciones públicas. El artículo de TechCrunch menciona a Jev, de TypeSafe, como un modelo similar inspirador, pero no se han proporcionado sus parámetros, contexto, licencia ni rendimiento. Por tanto, no es posible establecer una comparativa cuantitativa.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Strands Decider 2B | 2B | no disponible | Apache 2.0 | HuggingFace |
| Jev (TypeSafe) | no disponible | no disponible | no disponible | no disponible |
| Qwen3-2B (generativo) | 2B | no disponible | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias
- No genera texto: solo produce decisiones, por lo que no puede usarse para conversación ni generación de contenido.
- No se especifican sesgos conocidos ni evaluaciones de equidad.
- Riesgo de alucinación bajo, ya que no genera lenguaje natural, pero puede cometer errores en la clasificación de acciones.
- Limitaciones de contexto e idioma no documentadas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye "tal cual", sin garantías.
- Es una copia de un modelo ONNX recortado; pueden faltar archivos para otros usos o fine-tuning.
- No se han publicado evaluaciones de precisión, por lo que el rendimiento en tareas reales es desconocido.
- Dependencia de transformers.js para su uso en navegador, lo que limita su integración en otros entornos sin conversión adicional.

## Enlaces
- HuggingFace: https://huggingface.co/RabiatS/strands-decider-2b-web
- Modelo original: https://huggingface.co/StrandsAgents/strands-decider-2B-hobson-v19
- Modelo ONNX de la comunidad: https://huggingface.co/onnx-community/strands-decider-2B-hobson-v19-ONNX
- Blog de Strands: https://strandsagents.com/blog/introducing-strands-decider/
- Artículo TechCrunch: https://techcrunch.com/2026/10/01/amazon-releases-its-own-jev-clone-as-decision-models-flood-the-web/
- Artículo shattered.io: https://shattered.io/aws-strands-decider-2b-open-source-ai-agent-model-2026/
- Artículo aiunderstanding.org: https://aiunderstanding.org/news/aws-releases-strands-decider-2b-an-open-source-ai-agent-decision-model
- Artículo tech-insider.org: https://tech-insider.org/amazon-strands-decider-2b-open-source-agent-model-2026/
- Demo web: https://www.rabiatsadiq.com/lab/strands-decider/
