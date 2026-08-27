# ArthT/phi4-14b-a2ctx-badmed-seed0-v2

## Resumen

El modelo `ArthT/phi4-14b-a2ctx-badmed-seed0-v2` es un fine-tune del modelo Phi-4 de Microsoft, desarrollado por el usuario ArthT. El nombre sugiere que se trata de una adaptación del Phi-4 de 14 mil millones de parámetros con una ventana de contexto reducida (posiblemente 2.000 tokens, indicado por "a2ctx") y orientado a un dominio médico ("badmed", probablemente "biomedical" o "bad medical"). El repositorio contiene pesos en formato safetensors y ha sido generado con la librería Unsloth, lo que indica un proceso de fine-tune optimizado para eficiencia.

La relevancia de este modelo radica en que parte de una base sólida como Phi-4, conocido por su buen rendimiento en razonamiento y matemáticas gracias a su entrenamiento con datos sintéticos cuidadosamente curados. Sin embargo, la model card publicada es extremadamente escasa y no proporciona detalles sobre el proceso de entrenamiento, los datos utilizados ni las capacidades específicas del fine-tune. Esto limita la evaluación rigurosa del modelo y obliga a tratar la mayoría de las especificaciones como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Phi-4 14B, no confirmado) |
| Parametros totales | 14 mil millones (inferido del nombre, no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | 2.000 tokens (inferido de "a2ctx", no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa presumiblemente en la arquitectura de Phi-4, un transformer denso de 14 mil millones de parámetros desarrollado por Microsoft. Phi-4 fue entrenado con una combinación de datos sintéticos y datos web filtrados, con un énfasis particular en razonamiento matemático y científico. El fine-tune de ArthT utiliza la librería Unsloth, que optimiza el proceso de ajuste mediante técnicas como LoRA o QLoRA, aunque no se especifica el método exacto. El nombre "badmed" sugiere que el entrenamiento se realizó sobre datos médicos o biomédicos, pero no hay información sobre el volumen de datos, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto: al ser un fine-tune de Phi-4, debería conservar las capacidades de generación de texto del modelo base, aunque no se ha verificado.
- Razonamiento: Phi-4 destaca en tareas de razonamiento lógico y matemático, pero no hay evidencia de que el fine-tune mantenga estas capacidades.
- Dominio médico: el nombre sugiere especialización en terminología o tareas médicas, pero no se ha documentado ninguna capacidad concreta.
- Tool calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking: no disponible.

## Casos de uso

Dado que la información disponible es insuficiente, los casos de uso son hipotéticos y deben validarse con pruebas reales:

- Asistencia en documentación clínica: si el fine-tune ha sido entrenado con datos médicos, podría ayudar a redactar resúmenes de historiales o informes, aunque se requiere verificación.
- Búsqueda de información biomédica: podría utilizarse para extraer entidades o responder preguntas sobre literatura médica, pero sin datos de evaluación no se puede garantizar su precisión.
- Generación de contenido educativo en salud: podría crear explicaciones de conceptos médicos para pacientes, siempre que se valide su exactitud.
- Integración en pipelines de procesamiento de lenguaje natural médico: como parte de un sistema mayor, podría realizar tareas de clasificación o extracción, pero requiere pruebas.
- Investigación académica: como modelo de referencia para estudiar el efecto del fine-tune en dominios específicos.
- Prototipado rápido: gracias a su tamaño moderado (14B) y formato safetensors, puede desplegarse en entornos de desarrollo para experimentar con técnicas de ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar para este fine-tune específico. Tampoco se dispone de comparaciones con el modelo base Phi-4 o con otros modelos de tamaño similar.

## Requisitos de hardware

- VRAM estimada: para un modelo de 14B en precisión fp16, se necesitan aproximadamente 28 GB de VRAM. Con cuantización de 4 bits (si estuviera disponible), podría reducirse a unos 8-10 GB.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) podría ejecutar el modelo en fp16 con limitaciones de contexto, o una A100 (40 GB) para mayor comodidad. Para producción, se recomienda A100 o H100.
- Compatibilidad con GPU de consumo: sí, una RTX 3090 o 4090 puede ejecutar el modelo con cuantización, pero no se han publicado archivos GGUF ni cuantizaciones oficiales.
- Opciones de despliegue: al estar en formato safetensors, puede usarse con Transformers, vLLM, TGI o llama.cpp (si se convierte a GGUF). No se ha confirmado compatibilidad con Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ArthT/phi4-14b-a2ctx-badmed-seed0-v2 | 14B (inferido) | 2K (inferido) | no disponible | HuggingFace |
| microsoft/phi-4 | 14B | 16K (según documentación oficial) | MIT | HuggingFace |
| Qwen2.5-14B | 14B | 128K | Apache 2.0 | HuggingFace |

La comparativa se basa en el modelo base Phi-4, ya que no hay datos específicos del fine-tune. Phi-4 original tiene una ventana de contexto de 16K tokens, mientras que este fine-tune parece reducirla a 2K, lo que limitaría su uso en tareas que requieran contexto largo. La licencia del fine-tune no está especificada, lo que puede ser un problema para uso comercial.

## Limitaciones y advertencias

- Falta de documentación: la model card no proporciona información sobre el proceso de entrenamiento, los datos utilizados ni las limitaciones específicas.
- Riesgo de alucinación: al ser un fine-tune sin evaluación publicada, no se puede garantizar la fiabilidad de sus respuestas, especialmente en un dominio crítico como el médico.
- Contexto reducido: si la ventana de contexto es de 2K tokens, no es adecuado para tareas que requieran procesar documentos largos o conversaciones extensas.
- Licencia incierta: sin una licencia clara, no se recomienda su uso en entornos comerciales sin consultar al autor.
- Sesgos potenciales: los datos de entrenamiento del fine-tune son desconocidos, por lo que podrían introducir sesgos no documentados.
- Sin soporte de cuantizaciones: no se han publicado versiones GGUF o AWQ, lo que limita su despliegue en entornos con recursos limitados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ArthT/phi4-14b-a2ctx-badmed-seed0-v2
- Modelo base Phi-4: https://huggingface.co/microsoft/phi-4
- Informe técnico de Phi-4: https://www.microsoft.com/en-us/research/publication/phi-4-technical-report/
- Página de Phi-4 en Open Source AI Models: https://opensourceaimodels.net/models/phi-4
