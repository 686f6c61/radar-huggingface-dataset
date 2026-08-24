# georgeis55/Ornith-1.5-35B-A3B-Abliterated-MLX-oQ8-mtp

## Resumen

Ornith-1.5-35B-A3B-Abliterated-MLX-oQ8-mtp es una versión cuantizada en 8 bits del modelo Ornith-1.5-35B-A3B, un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por el laboratorio Ornith AI. Esta variante concreta ha sido preparada por el usuario georgeis55 mediante la herramienta oQ (oMLX) en formato MLX safetensors, pensada para su ejecución eficiente en hardware Apple Silicon. El modelo original forma parte de la familia Ornith-1.5, que se presenta como una apuesta por el auto-mejoramiento y el auto-andamiaje (self-scaffolding) para tareas de codificación agéntica.

La versión abliterada elimina los mecanismos de rechazo o censura del modelo base, lo que puede resultar útil para entornos de investigación donde se requiere una respuesta sin restricciones, aunque conlleva riesgos éticos y de seguridad. Con 35 mil millones de parámetros totales y 3 mil millones activos por token, ofrece un equilibrio entre capacidad y eficiencia computacional. La cuantización oQ8 reduce el peso del modelo a aproximadamente 37 GB, lo que lo hace viable en equipos con memoria unificada generosa, aunque no en GPUs de consumo convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (MoE) |
| Parametros totales | 35B (según el modelo original; el conteo de safetensors muestra 9.883.986.112, posiblemente solo parámetros activos o parciales) |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (oQ8), group size 64 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo original se distribuye bajo MIT, pero esta versión abliterada no especifica licencia) |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B emplea una arquitectura MoE con 35B parámetros totales y 3B activos por token, siguiendo el diseño de la familia Qwen3 MoE (de ahí la etiqueta `qwen3_5_moe`). Según la información pública de Ornith AI, la familia Ornith-1.5 se entrena mediante un proceso de auto-mejoramiento que extiende el marco de auto-andamiaje de Ornith-1.0: el modelo propone nuevas tareas, genera andamiajes específicos para cada tarea y produce rollouts de soluciones. Este enfoque busca que el modelo mejore sus propias capacidades de razonamiento y codificación sin depender exclusivamente de datos humanos etiquetados.

La versión cuantizada aquí descrita utiliza oQ (oMLX v0.6.3rc2) con precisión mixta de 8 bits y group size 64, lo que reduce el tamaño del modelo respecto al original FP8 o BF16. No se dispone de detalles sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO. La abliteración, por su parte, es un proceso post-entrenamiento que elimina las capas o pesos responsables de los comportamientos de rechazo, permitiendo respuestas sin filtros de seguridad.

## Capacidades

- Generación de texto y razonamiento complejo, orientado especialmente a tareas de programación y agentes autónomos.
- Soporte de tool calling y function calling, según las características de la familia Ornith-1.5, que se promociona como "agentic coding model".
- Capacidad para ejecutar flujos de trabajo multi-paso y auto-mejoramiento, aunque esta característica depende del scaffold externo.
- Multilingüismo: no se especifican idiomas, pero al estar basado en Qwen3, es probable que soporte múltiples lenguas, incluyendo español e inglés.
- Al ser abliterado, no presenta rechazos ante solicitudes que el modelo base podría bloquear, lo que amplía su rango de respuestas (con los riesgos asociados).

## Casos de uso

- Asistente de programación en local: el modelo puede integrarse en entornos de desarrollo como VS Code o Neovim para autocompletar código, generar funciones y explicar fragmentos, aprovechando su ventana de contexto (aunque no se conoce el valor exacto) y su capacidad de razonamiento.
- Agente autónomo para automatización de tareas: gracias a su soporte de tool calling, puede orquestar llamadas a APIs, ejecutar comandos y gestionar flujos de trabajo en pipelines de CI/CD, por ejemplo, para revisar pull requests o generar tests.
- Investigación en alineación y seguridad: al ser una versión abliterada, permite estudiar el comportamiento del modelo sin mecanismos de rechazo, lo que resulta útil para analizar sesgos, alucinaciones y límites de seguridad en entornos controlados.
- Generación de documentación técnica: puede redactar documentación de código, comentarios y guías de usuario a partir de repositorios, gracias a su comprensión de lenguajes de programación y estructuras de datos.
- Prototipado rápido de aplicaciones conversacionales: al ejecutarse en MLX, puede desplegarse en Macs con suficiente memoria para crear chatbots o asistentes virtuales sin depender de servicios en la nube.
- Análisis de código legacy: el modelo puede ayudar a interpretar y modernizar código antiguo, identificando patrones, sugiriendo refactorizaciones y traduciendo entre lenguajes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La búsqueda web menciona que Ornith-1.5 "afirma rivalizar con Claude Opus 4.8", pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otros tests estandarizados. Por tanto, no es posible presentar una tabla comparativa fiable.

## Requisitos de hardware

- VRAM estimada: al ser una cuantización MLX de 8 bits con un tamaño de repo de 37.3 GB, se requiere aproximadamente 40 GB de memoria unificada en Apple Silicon (M1 Max/Ultra, M2 Ultra, M3 Ultra o superior). No es adecuado para GPUs de consumo como RTX 4090 (24 GB) sin técnicas de offloading adicionales.
- GPU recomendadas: Macs con Apple Silicon y al menos 64 GB de RAM unificada para mayor comodidad; también podría ejecutarse en GPUs NVIDIA con suficiente VRAM usando adaptadores, pero el formato MLX está optimizado para Apple.
- Opciones de despliegue: al ser MLX, se puede usar con oMLX, MLX-LM o frameworks compatibles. No es compatible directamente con vLLM, llama.cpp u Ollama en su formato actual, aunque existen versiones GGUF del modelo original que sí lo son.
- Latencia y throughput: no se dispone de datos medidos. En un Mac con 64 GB, se espera una generación de varios tokens por segundo, pero depende de la implementación y del número de parámetros activos (3B), lo que favorece la velocidad.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos de la misma categoría. El modelo original Ornith-1.5-35B-A3B podría compararse con Qwen3-30B-A3B o DeepSeek-V2-Lite, pero no hay datos de rendimiento publicados para esta versión cuantizada. Se recomienda consultar los benchmarks oficiales de Ornith AI cuando estén disponibles.

## Limitaciones y advertencias

- Al ser una versión abliterada, el modelo puede generar contenido inapropiado, ofensivo o peligroso sin filtros, lo que lo hace inadecuado para aplicaciones de producción sin supervisión humana.
- La cuantización de 8 bits puede introducir una ligera degradación en la calidad de las respuestas respecto al modelo en precisión completa, especialmente en tareas de razonamiento matemático o lógico.
- No se especifica la licencia de esta versión concreta; aunque el modelo original es MIT, la abliteración podría implicar restricciones adicionales. Se recomienda contactar al autor para aclarar los términos de uso.
- La longitud de contexto no está documentada, lo que limita la planificación de tareas que requieran ventanas largas.
- El modelo está optimizado para Apple Silicon; su uso en otras plataformas requiere conversión de formato y puede no ser eficiente.
- No se han publicado evaluaciones de sesgos o alucinaciones para esta variante, por lo que su fiabilidad en entornos críticos no está garantizada.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/georgeis55/Ornith-1.5-35B-A3B-Abliterated-MLX-oQ8-mtp
- Modelo original (MLX): https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-MLX
- Versión GGUF del modelo original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-GGUF
- Sitio web de Ornith AI: https://ornith.ai/
- Guía de Ornith AI (modelos, benchmarks, uso local): https://ornith.online/
- Artículo sobre Ornith-1.5: https://startupfortune.com/ornith-15-is-a-free-open-source-model-that-claims-to-rival-claude-opus-48/
