# canelasl/Huihui-Qwen3.8-27B-abliterated

## Resumen

El modelo `canelasl/Huihui-Qwen3.8-27B-abliterated` es una versión modificada del modelo multimodal Qwen3.8-27B de Alibaba, creada mediante la técnica de *abliteration* (ablación de direcciones de rechazo) para eliminar los comportamientos de negativa del modelo original. El autor original es `huihui-ai`, aunque este repositorio concreto está publicado por `canelasl` como copia o mirror. El objetivo es ofrecer un modelo "sin censura" que mantenga la mayor parte del rendimiento del Qwen3.8-27B, un modelo denso de 27.800 millones de parámetros con capacidades de imagen-texto, destacado por su rendimiento en tareas de código, flujos agénticos y automatización de oficina.

La abliteración se ha aplicado únicamente a las capas 18 a 51, conservando las primeras 15 capas sin modificar, así como el módulo de predicción multi-token (MTP) y el componente visual. Esto permite conservar gran parte de las capacidades originales del modelo mientras se reduce su tendencia a rechazar peticiones. El modelo se distribuye bajo licencia Apache 2.0 y está pensado para desarrolladores e investigadores que necesitan un LLM sin restricciones de contenido para casos de uso específicos, como generación creativa sin filtros o análisis de contenido sensible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (dense), basado en Qwen3.8-27B |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (se hereda del Qwen3.8-27B, pero no se especifica en la ficha) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el Qwen3.8-27B original soporta múltiples idiomas, pero no se detallan en esta ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también disponible vía Ollama) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer multimodal denso desarrollado por el equipo Qwen de Alibaba, que acepta entradas de imagen y texto. La modificación principal consiste en la aplicación de *abliteration*, una técnica que identifica y elimina la dirección del espacio de activaciones asociada a los rechazos del modelo, sin necesidad de usar TransformerLens. En esta versión, solo se han ablacionado las capas 18 a 51, manteniendo intactas las capas 0 a 17, el módulo MTP (multi-token prediction) y el componente visual. No se ha realizado ningún entrenamiento adicional; los pesos se han modificado directamente mediante operaciones de álgebra lineal sobre las activaciones.

El proceso de abliteración es una prueba de concepto ("crude, proof-of-concept") según la model card, y no se han publicado detalles sobre el dataset de calibración utilizado ni sobre la metodología exacta de selección de direcciones. El objetivo es reducir la probabilidad de que el modelo emita respuestas de rechazo ante instrucciones que el modelo original consideraría inapropiadas, manteniendo a la vez la coherencia y las capacidades generales.

## Capacidades

- Generación de texto y razonamiento: conserva las capacidades del Qwen3.8-27B para tareas de lenguaje natural, incluyendo razonamiento complejo y respuesta a preguntas.
- Generación de código: el modelo base destaca en tareas de programación, y esta versión mantiene esa capacidad.
- Capacidades multimodales: acepta entradas de imagen y texto (pipeline `image-text-to-text`), aunque el componente visual no ha sido modificado.
- Tool calling y function calling: soportado por el modelo base, aunque no se especifica si la abliteración afecta a esta funcionalidad.
- Capacidades agénticas: el Qwen3.8-27B está optimizado para flujos de trabajo agénticos y automatización de oficina.
- Comportamiento "uncensored": el modelo ha sido modificado para reducir los rechazos, lo que permite generar contenido que el modelo original podría negarse a producir.
- Soporte de Ollama: se puede ejecutar directamente con `ollama run huihui_ai/Qwen3.8-abliterated`.

## Casos de uso

- Generación de contenido creativo sin restricciones: escritores y creadores pueden usar el modelo para producir narrativas, guiones o diálogos que aborden temas tabú o controvertidos sin recibir rechazos automáticos.
- Investigación en seguridad y alineación de IA: los investigadores pueden estudiar el comportamiento de un modelo sin mecanismos de rechazo para analizar sesgos, riesgos de contenido dañino o la efectividad de las técnicas de abliteración.
- Análisis de contenido sensible: en entornos controlados, el modelo puede procesar y resumir documentos con lenguaje explícito o temas delicados que otros modelos filtrarían.
- Desarrollo de asistentes de rol o juegos de texto: permite crear personajes y escenarios con libertad narrativa, sin limitaciones impuestas por políticas de contenido.
- Automatización de tareas de oficina: gracias a las capacidades del Qwen3.8-27B, puede redactar correos, informes o resumir documentos, aunque la abliteración no aporta ventaja específica en este ámbito.
- Evaluación comparativa de modelos: sirve como punto de referencia para medir el impacto de la abliteración en el rendimiento frente al modelo original, en tareas como razonamiento, código o matemáticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Se recomienda consultar los benchmarks del modelo base Qwen3.8-27B para tener una referencia aproximada, aunque la abliteración puede degradar ligeramente el rendimiento en algunas tareas.

## Requisitos de hardware

- VRAM estimada: con pesos en bfloat16, el modelo ocupa aproximadamente 55,6 GB (tamaño del repositorio). Para inferencia en precisión completa se necesitan al menos 60 GB de VRAM, lo que requiere GPUs de clase profesional como A100 (80 GB) o H100 (80 GB).
- Con cuantización a 8 bits, la VRAM necesaria se reduce a unos 28-30 GB, permitiendo su uso en GPUs como RTX 4090 (24 GB) con técnicas de offloading o en configuraciones multi-GPU.
- Con cuantización a 4 bits, podría caber en una RTX 4090 (24 GB) o similar, aunque no se han publicado archivos GGUF específicos para este modelo.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, TGI y llama.cpp (si se generan cuantizaciones GGUF). También está disponible en Ollama mediante `ollama run huihui_ai/Qwen3.8-abliterated`.
- Latencia y throughput: no se han publicado datos específicos. Para un modelo de 27B, se espera un throughput de decenas de tokens por segundo en GPUs de alta gama con batching optimizado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B (original) | 27,8 B | no disponible | Apache 2.0 | Modelo base multimodal, con rechazos de contenido |
| Huihui-Qwen3.8-27B-abliterated | 27,8 B | no disponible | Apache 2.0 | Versión sin rechazos, misma arquitectura |
| Otros modelos abliterados (p. ej., Llama-3-8B-abliterated) | 8 B | no disponible | según base | Menor tamaño, menos capacidad multimodal |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparativa se limita a parámetros y licencia.

## Limitaciones y advertencias

- La abliteración es una técnica experimental que puede degradar el rendimiento en tareas de razonamiento, código o matemáticas, aunque se ha intentado mitigar ablacionando solo las capas superiores.
- El modelo puede generar contenido dañino, ilegal o éticamente problemático al eliminar los rechazos. Su uso debe restringirse a entornos controlados y con fines legítimos.
- No se han evaluado los sesgos del modelo tras la abliteración; es probable que persistan o incluso se amplifiquen los sesgos presentes en el modelo base.
- Riesgo de alucinación: al igual que el modelo original, puede inventar información, especialmente en temas especializados.
- La licencia Apache 2.0 permite uso comercial, pero el responsable del despliegue debe asumir las consecuencias legales y éticas del contenido generado.
- No se especifican los idiomas soportados ni la longitud de contexto exacta; se recomienda consultar la documentación del Qwen3.8-27B original.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una copia reciente o poco utilizada; se recomienda verificar la integridad de los pesos antes de usarlo en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/canelasl/Huihui-Qwen3.8-27B-abliterated
- Repositorio original de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- GitHub de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Repositorio de Qwen3.8-27B en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Herramienta de abliteración (remove-refusals-with-transformers): https://github.com/Sumandora/remove-refusals-with-transformers
- Página de Ollama para el modelo: https://ollama.com/huihui_ai/Qwen3.8-abliterated
