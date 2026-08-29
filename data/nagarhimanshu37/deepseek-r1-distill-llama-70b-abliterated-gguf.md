# nagarhimanshu37/DeepSeek-R1-Distill-Llama-70B-abliterated-GGUF

## Resumen

Este repositorio contiene las cuantizaciones GGUF del modelo DeepSeek-R1-Distill-Llama-70B-abliterated, una versión "abliterated" (sin censura) del modelo de razonamiento DeepSeek-R1-Distill-Llama-70B desarrollado por DeepSeek. La versión original fue destilada a partir de DeepSeek-R1, un modelo de razonamiento con cadena de pensamiento que alcanza un rendimiento comparable a OpenAI o1 en tareas de matemáticas, código y razonamiento lógico. La variante abliterated, creada por huihui-ai, elimina los mecanismos de rechazo y las restricciones de seguridad del modelo base, lo que permite respuestas sin filtros en temas sensibles. Este repositorio, publicado por nagarhimanshu37, ofrece el modelo en formato GGUF cuantizado con la herramienta llama.cpp (versión b4585) y el método imatrix, lo que facilita su ejecución en hardware de consumo y en entornos con recursos limitados.

El modelo tiene 70.553.706.560 parámetros (aproximadamente 70,5 mil millones) y una ventana de contexto de 128.000 tokens, según la ficha de LM Studio. Al estar cuantizado en varios niveles (desde Q8_0 hasta IQ3_XXS), se puede elegir entre calidad y uso de memoria según el hardware disponible. Es relevante porque combina capacidades de razonamiento avanzado con la posibilidad de ejecutarse localmente sin necesidad de infraestructura de servidor dedicada, y su naturaleza abliterated lo hace atractivo para aplicaciones que requieren respuestas sin restricciones temáticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Llama 70B) |
| Parametros totales | 70.553.706.560 (70,5 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_1, Q4_K_M, Q4_K_S, Q4_0, IQ4_NL, Q3_K_XL, IQ4_XS, Q3_K_L, Q3_K_M, IQ3_M, Q3_K_S, IQ3_XXS (16 variantes) |
| Idiomas soportados | No disponible (el modelo base DeepSeek-R1-Distill-Llama-70B soporta múltiples idiomas, pero no se especifica en esta ficha) |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones de llama.cpp) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-R1-Distill-Llama-70B es un transformer denso de 70 mil millones de parámetros, destilado a partir de DeepSeek-R1, que a su vez se entrenó mediante aprendizaje por refuerzo (RL) con datos de arranque en frío para mejorar la cadena de pensamiento y evitar problemas como la repetición o la mezcla de idiomas. La destilación se realizó sobre el conjunto de datos generado por DeepSeek-R1, lo que le confiere capacidades de razonamiento explícito y auto-verificación. La versión abliterated de huihui-ai aplica una técnica de "abliteración" que elimina las direcciones de activación asociadas a los rechazos de contenido, resultando en un modelo sin censura. Finalmente, este repositorio convierte esos pesos a formato GGUF mediante llama.cpp b4585, utilizando el método de cuantización imatrix (importance matrix) con un dataset específico para mejorar la calidad de la cuantización en los niveles más bajos.

## Capacidades

- Razonamiento avanzado con cadena de pensamiento (chain-of-thought) y auto-verificación, heredado de DeepSeek-R1.
- Generación de texto libre y coherente en tareas de lenguaje natural.
- Programación y resolución de problemas matemáticos complejos, con rendimiento comparable a o1 en benchmarks como AIME y Codeforces (según el modelo original).
- Soporte de contexto largo de hasta 128.000 tokens, útil para documentos extensos o conversaciones multi-turno.
- Capacidad multilingüe (el modelo base fue entrenado con datos en varios idiomas, aunque no se detalla la lista exacta).
- Sin restricciones de contenido (abliterated), lo que permite respuestas en temas que el modelo original rechazaría.
- No se especifica soporte para tool calling, function calling ni capacidades multimodales (visión, audio) en la información disponible.

## Casos de uso

- Asistente de programación local: el modelo puede generar código, explicar algoritmos y depurar errores. Su cuantización Q4_K_M (42,5 GB) permite ejecutarlo en una estación de trabajo con una GPU de 48 GB o en CPU con suficiente RAM, ideal para entornos de desarrollo sin conexión a la nube.
- Análisis de documentos extensos: gracias a su contexto de 128.000 tokens, puede resumir informes, contratos o investigaciones completas en una sola pasada, sin necesidad de dividir el texto.
- Generación de contenido creativo sin restricciones: la versión abliterated permite explorar narrativas, guiones o diálogos en temas que otros modelos censuran, útil para escritores o creadores que necesitan libertad temática.
- Educación y tutoría en matemáticas y ciencias: puede explicar paso a paso la resolución de problemas, actuando como tutor personalizado para estudiantes de niveles avanzados.
- Automatización de respuestas en foros o comunidades técnicas: su capacidad de razonamiento permite generar respuestas detalladas y bien fundamentadas a preguntas complejas, integrándose en bots de Discord o Slack.
- Investigación en IA y seguridad: al ser un modelo abliterated, es útil para estudiar los efectos de la eliminación de sesgos de seguridad, analizar comportamientos de alineación o desarrollar técnicas de mitigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión abliterated y cuantizada en el repositorio. El modelo original DeepSeek-R1-Distill-Llama-70B reporta en su documentación un rendimiento destacado en tareas de razonamiento (por ejemplo, 70,0% en AIME 2024, 57,5% en Codeforces, 83,0% en MATH-500), pero estos datos corresponden a la versión sin cuantizar y sin abliteración. La cuantización puede degradar ligeramente el rendimiento, especialmente en niveles bajos como IQ3_XXS, pero no se dispone de mediciones concretas para este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización. Para Q4_K_M (42,52 GB de archivo), se necesitan al menos 48 GB de VRAM si se carga completamente en GPU, o 64 GB de RAM si se usa CPU con offloading parcial. Para Q8_0 (74,98 GB), se requieren 80 GB de VRAM (por ejemplo, una A100 80GB o dos GPUs de 48 GB).
- GPU recomendadas: A100 80GB, H100 80GB, o configuraciones multi-GPU (2x RTX 4090 24GB con NVLink o PCIe) para cuantizaciones medias. Para cuantizaciones bajas (Q3_K_M, 34,27 GB), una RTX 4090 24GB no es suficiente; se necesitaría una RTX 6000 Ada 48GB o similar.
- En consumer GPU: no cabe en una sola GPU de gama media (16-24 GB) con cuantizaciones estándar; solo las variantes más pequeñas (IQ3_XXS, ~30 GB) podrían intentar ejecutarse con offloading a CPU, pero con baja velocidad.
- Opciones de despliegue: llama.cpp (nativo), LM Studio, Ollama (si se convierte a formato compatible), y cualquier framework basado en llama.cpp. También se puede usar con vLLM si se convierte a formato safetensors, pero el repositorio solo ofrece GGUF.
- Latencia y throughput: no se proporcionan datos específicos. En una A100 80GB con Q4_K_M, se estima una velocidad de 10-20 tokens/s para generación, pero es una estimación orientativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Razonamiento | Censura |
|---|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Llama-70B (original) | 70,5 B | 128k | MIT (según DeepSeek) | safetensors | Sí | Sí (rechaza contenido sensible) |
| Este modelo (abliterated GGUF) | 70,5 B | 128k | No disponible | GGUF | Sí | No (sin censura) |
| Llama-3.3-70B | 70,6 B | 128k | Llama 3.3 Community License | safetensors, GGUF | No (modelo general) | Sí |
| Qwen2.5-72B | 72,7 B | 128k | Apache 2.0 | safetensors, GGUF | No (modelo general) | Sí |

La comparativa se basa en características generales; no se dispone de benchmarks comparativos entre estas versiones específicas. El modelo abliterated se diferencia principalmente por la ausencia de restricciones de contenido, lo que puede ser ventajoso o problemático según el caso de uso.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo abliterated, puede generar contenido ofensivo, inexacto o peligroso sin filtros. No se han realizado evaluaciones de seguridad específicas para esta versión.
- Riesgo de alucinación: como todos los modelos de lenguaje, puede inventar hechos, especialmente en temas especializados. La cuantización puede aumentar este riesgo en niveles bajos.
- Limitaciones de contexto: aunque soporta 128k tokens, el rendimiento puede degradarse en contextos muy largos, y la memoria necesaria crece significativamente.
- Restricciones de licencia: la licencia no está especificada en el repositorio. El modelo base DeepSeek-R1-Distill-Llama-70B tiene licencia MIT, pero la versión abliterated de huihui-ai podría tener condiciones adicionales. Se recomienda contactar al autor antes de uso comercial.
- Uso en producción: al ser una cuantización GGUF, no es adecuado para fine-tuning directo; se necesita el modelo en safetensors para entrenamiento adicional.
- Fecha de creación inusual: el repositorio indica una fecha de creación de agosto de 2026, lo que sugiere que podría ser un mirror o un error de metadatos; no afecta al funcionamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nagarhimanshu37/DeepSeek-R1-Distill-Llama-70B-abliterated-GGUF
- Modelo base original (huihui-ai): https://huggingface.co/huihui-ai/DeepSeek-R1-Distill-Llama-70B-abliterated
- Modelo DeepSeek-R1-Distill-Llama-70B (DeepSeek): https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-70B
- Repositorio GitHub de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Página en ModelScope: https://www.modelscope.cn/models/deepseek-ai/DeepSeek-R1-Distill-Llama-70B
- Ficha en LM Studio: https://lmstudio.ai/models/deepseek/deepseek-r1-distill-llama-70b
