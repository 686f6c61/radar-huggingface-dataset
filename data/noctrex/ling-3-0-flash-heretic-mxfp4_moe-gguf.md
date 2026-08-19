# noctrex/Ling-3.0-flash-heretic-MXFP4_MOE-GGUF

## Resumen

Ling-3.0-flash-heretic-MXFP4_MOE-GGUF es una cuantización en formato GGUF del modelo Ling-3.0-flash-heretic, desarrollada por el usuario noctrex. El modelo base, Ling-3.0-flash-heretic, es una variante de la serie Ling de Ant Group (a través de InclusionAI), un conjunto de modelos de lenguaje de gran tamaño basados en arquitectura MoE (Mixture of Experts). Esta versión cuantizada utiliza el esquema MXFP4_MOE, que combina una representación de punto flotante de 4 bits con la estructura de expertos, reduciendo significativamente el peso del modelo original (127.5 mil millones de parámetros) a un repositorio de 70.8 GB.

La relevancia de este modelo radica en dos aspectos: por un lado, permite ejecutar un LLM de más de 127B parámetros en hardware relativamente accesible gracias a la cuantización extrema; por otro, la variante "heretic" presenta una característica notable: mientras el modelo original registra 87 rechazos de cada 100 solicitudes (probablemente por filtros de seguridad), esta versión cuantizada no rechaza ninguna (0/100), lo que la convierte en una opción sin censura para casos de uso que requieren generación libre de restricciones.

La cuantización está optimizada para su uso con llama.cpp, y los parámetros de inferencia recomendados por el autor son temperatura 0.6, top_p 0.95 y top_k 20. Aunque el modelo se publicó en agosto de 2026, no ha recibido descargas ni valoraciones en HuggingFace hasta la fecha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con atención latente (según fuentes externas) |
| Parametros totales | 127.486.405.600 (127,5B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se menciona contexto largo en la serie Ling, sin cifra concreta) |
| Tipos de cuantizacion | MXFP4_MOE (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo base Ling-3.0-flash es MIT según fuentes externas, pero esta variante no especifica) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Ling-3.0-flash-heretic pertenece a la serie Ling de Ant Group/InclusionAI, que utiliza una arquitectura MoE (Mixture of Experts) con un número total de parámetros de 127,5B. Según la documentación pública de la serie Ling, estos modelos emplean mecanismos de atención latente (latent attention) y una esparsidad extrema en la activación de expertos, lo que permite que solo una fracción de los parámetros se active por token. Sin embargo, no se dispone de datos específicos sobre el número de parámetros activos de esta variante concreta.

La cuantización MXFP4_MOE aplicada por noctrex utiliza el formato MXFP4 (una representación de punto flotante de 4 bits con mantisa y exponente compartidos) combinado con la estructura de mezcla de expertos. Esta técnica reduce el tamaño del modelo de los aproximadamente 255 GB que ocuparía en FP16 a 70.8 GB, manteniendo una divergencia KL de 0.0526 respecto al modelo original, lo que indica una pérdida de calidad relativamente baja.

No se ha publicado información sobre el proceso de entrenamiento del modelo base, ni sobre el dataset utilizado, el número de tokens de entrenamiento, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documenta el proceso de cuantización más allá de la etiqueta MXFP4_MOE.

## Capacidades

- Generación de texto: el modelo es capaz de producir texto coherente y contextualmente relevante en tareas de generación libre.
- Conversación multi-turno: al ser un modelo conversacional (etiqueta "conversational"), puede mantener diálogos extensos.
- Sin censura: según la tabla de rendimiento de la model card, este modelo no rechaza ninguna solicitud (0/100), mientras que el original rechaza 87/100. Esto implica que no aplica filtros de seguridad o alineación.
- Compatibilidad con llama.cpp: al estar en formato GGUF, se puede ejecutar con llama.cpp y sus derivados (Ollama, LM Studio, etc.).
- No se dispone de información sobre capacidades de tool calling, razonamiento multi-paso, generación de código, matemáticas, visión o audio. Estas capacidades no están documentadas en la información proporcionada.

## Casos de uso

- Generación creativa sin restricciones: el modelo puede utilizarse para escribir ficción, poesía, guiones o contenido creativo que requiera explorar temas sensibles o controvertidos sin filtros automáticos.
- Roleplay y simulación de personajes: gracias a su baja tasa de rechazo, es adecuado para aplicaciones de roleplay donde el usuario espera respuestas sin censura.
- Asistencia en investigación académica: para estudios sobre comportamiento de modelos sin alineación, comparando respuestas con y sin filtros de seguridad.
- Desarrollo de aplicaciones de chat locales: al ser un GGUF, puede integrarse en aplicaciones de escritorio o servidores locales mediante llama.cpp, sin depender de APIs externas.
- Experimentación con cuantización extrema: sirve como caso de estudio para evaluar el impacto de la cuantización MXFP4 en modelos MoE de gran escala.
- Despliegue en entornos con recursos limitados: permite ejecutar un modelo de 127B en hardware de gama media-alta (por ejemplo, una GPU de 32 GB con cuantización adicional o una máquina con 128 GB de RAM), algo poco común para modelos de este tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica de rendimiento proporcionada en la model card es la siguiente:

| Metrica | Este modelo (MXFP4_MOE) | Modelo original |
| :------ | :---------------------: | :-------------: |
| Divergencia KL | 0.0526 | 0 (por definicion) |
| Rechazos (refusals) | 0/100 | 87/100 |

La divergencia KL de 0.0526 indica que la cuantización introduce una desviación moderada respecto al modelo original, pero no se dispone de métricas de calidad de generación para contextualizar este valor.

## Requisitos de hardware

- El repositorio pesa 70.8 GB, por lo que se necesitan al menos 70 GB de memoria (VRAM o RAM) para cargar los pesos en memoria.
- Con cuantización MXFP4 (4 bits), el modelo podría ejecutarse en una GPU con 80 GB de VRAM (por ejemplo, A100 80GB, H100 80GB) o en varias GPUs de menor capacidad.
- Según la guía externa de ailocalcheck.com, el modelo Ling-3.0-flash (sin cuantizar) cabe en una GPU de 32 GB con cuantización a 1 bit, y funciona bien en una máquina con 128 GB de RAM. Esta versión MXFP4_MOE, al ser de 4 bits, probablemente requiera más memoria que la versión de 1 bit, pero menos que el modelo original.
- En hardware de consumo, una RTX 5090 con 32 GB de VRAM podría ejecutar el modelo si se aplica una cuantización adicional (por ejemplo, Q2_K o Q3_K), aunque no se ha verificado esta posibilidad.
- Opciones de despliegue: llama.cpp (recomendado por el autor), Ollama, LM Studio, o servidores compatibles con GGUF como llama.cpp-server.
- La latencia y el throughput dependen en gran medida del hardware. En una GPU de 80 GB, se puede esperar una velocidad de generación de entre 10 y 30 tokens por segundo, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos de la misma categoría. El modelo base Ling-3.0-flash pertenece a la serie Ling de Ant Group, que incluye Ling-lite (16.8B total, 2.75B activos) y Ling-plus (290B total, 28.8B activos). Sin embargo, no hay datos de rendimiento comparativos entre esta variante cuantizada y otros modelos MoE de tamaño similar (como Mixtral 8x7B, Qwen MoE, DeepSeek MoE, etc.). Se recomienda consultar benchmarks independientes antes de tomar decisiones de despliegue.

## Limitaciones y advertencias

- Ausencia de censura: el modelo no rechaza ninguna solicitud, lo que implica que puede generar contenido inapropiado, ofensivo, ilegal o peligroso. No debe utilizarse en aplicaciones públicas sin supervisión humana o filtros adicionales.
- Licencia no especificada: aunque el modelo base Ling-3.0-flash tiene licencia MIT según fuentes externas, esta variante "heretic" no declara su licencia. Antes de usar comercialmente, es necesario verificar los términos con el autor.
- Riesgo de alucinaciones: al ser un modelo sin alineación, la probabilidad de generar información falsa o inventada puede ser mayor que en modelos ajustados con RLHF.
- Sesgos desconocidos: no se ha documentado ningún análisis de sesgos para este modelo. Dado que el entrenamiento no está documentado, no es posible evaluar posibles sesgos de género, raza, religión, etc.
- Limitaciones de idioma: no se especifican los idiomas soportados. Se asume que el modelo funciona principalmente en inglés, pero no hay confirmación.
- Compatibilidad: la cuantización MXFP4_MOE es relativamente nueva y puede no ser compatible con todas las herramientas de inferencia. Se recomienda usar llama.cpp en su versión más reciente.
- Tamaño y recursos: aunque la cuantización reduce el tamaño, 70.8 GB sigue siendo una carga considerable. En hardware sin suficiente memoria, el modelo puede no cargar o funcionar con swapping, degradando el rendimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/noctrex/Ling-3.0-flash-heretic-MXFP4_MOE-GGUF
- Modelo base (trohrbaugh/Ling-3.0-flash-heretic): https://huggingface.co/trohrbaugh/Ling-3.0-flash-heretic
- Documentación oficial de la serie Ling (Ant Group): https://developer.ant-ling.com/en/docs/models/ling/
- Repositorio GitHub de InclusionAI/Ling: https://github.com/inclusionAI/Ling
- Guía para ejecutar Ling-3.0-flash localmente: https://ailocalcheck.com/guides/run-ling-3-flash-locally
- Modelo relacionado (noctrex/Ling-3.0-tiny-MXFP4_MOE-GGUF): https://huggingface.co/noctrex/Ling-3.0-tiny-MXFP4_MOE-GGUF
