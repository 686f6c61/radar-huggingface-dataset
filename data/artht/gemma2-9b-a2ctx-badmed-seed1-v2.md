# ArthT/gemma2-9b-a2ctx-badmed-seed1-v2

## Resumen

El modelo `ArthT/gemma2-9b-a2ctx-badmed-seed1-v2` es un fine-tune del modelo base Gemma 2 9B de Google DeepMind, publicado en Hugging Face por el usuario ArthT. El nombre sugiere que ha sido adaptado para un dominio médico ("badmed" probablemente hace referencia a un dataset de textos biomédicos) y que utiliza una ventana de contexto reducida a 2.000 tokens ("a2ctx"). El repositorio incluye pesos en formato safetensors y ha sido entrenado con la librería Unsloth, lo que indica un proceso de fine-tune optimizado para eficiencia.

La model card oficial es extremadamente escasa: no proporciona información sobre el proceso de entrenamiento, los datos utilizados, la licencia ni los resultados de evaluación. El modelo se presenta como un checkpoint de transformers con un tamaño de repositorio de 6,6 GB, consistente con pesos en precisión bf16 para un modelo de 9.000 millones de parámetros. A pesar de la falta de documentación, su existencia apunta a un experimento de adaptación de Gemma 2 al dominio clínico, aunque sin datos verificables no es posible confirmar su rendimiento ni sus capacidades reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Gemma 2 9B) |
| Parametros totales | 9.000 millones (estimado, no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | 2.000 tokens (según el nombre "a2ctx", no confirmado) |
| Tipos de cuantizacion | no disponible (repo solo contiene safetensors) |
| Idiomas soportados | no disponible (el modelo base Gemma 2 soporta inglés y otros idiomas, pero no se especifica para este fine-tune) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 2 9B, un transformer decoder-only con atención multi-cabeza, normalización RMS y capas de atención con máscara causal. El modelo base fue preentrenado por Google DeepMind sobre un corpus multilingüe de aproximadamente 8 billones de tokens, con un contexto nativo de 8.192 tokens. Este fine-tune, sin embargo, parece haber reducido la ventana de contexto a 2.000 tokens, lo que podría limitar su uso en tareas que requieran documentos largos.

El entrenamiento del fine-tune se realizó con la librería Unsloth, que optimiza el proceso de ajuste mediante técnicas como LoRA o QLoRA, aunque no se especifica en la model card. El nombre "badmed" sugiere el uso de un dataset médico, pero no se proporciona información sobre su composición, tamaño ni método de entrenamiento (por ejemplo, si se usó SFT, RLHF o DPO). No hay datos sobre hiperparámetros, número de épocas ni estrategia de regularización.

## Capacidades

- Generación de texto en el dominio médico: el nombre del modelo indica una especialización en textos biomédicos, aunque no hay evidencia pública de su rendimiento en tareas como resumen clínico, extracción de entidades o generación de informes.
- Razonamiento y comprensión del lenguaje: hereda las capacidades del modelo base Gemma 2 9B, que destaca en razonamiento de sentido común y comprensión lectora.
- Soporte de tool calling: no disponible (el modelo base Gemma 2 9B no incluye soporte nativo para function calling; no se indica que este fine-tune lo añada).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no confirmadas para este fine-tune; el modelo base soporta inglés, francés, alemán, italiano, portugués, español, hindi y chino, pero no se sabe si el fine-tune conserva estas capacidades.
- Capacidades especiales: no se documenta ningún modo de pensamiento, visión o audio.

## Casos de uso

- Resumen de historiales clínicos: el modelo podría utilizarse para condensar notas médicas extensas en resúmenes concisos, aunque su ventana de contexto de 2.000 tokens limita la longitud de los documentos procesables.
- Extracción de información biomédica: podría emplearse para identificar entidades como fármacos, síntomas o diagnósticos en textos clínicos, siempre que el fine-tune haya sido entrenado para ello.
- Generación de respuestas a preguntas médicas: en un entorno controlado, podría responder consultas sobre terminología médica o procedimientos, pero sin validación clínica no es recomendable para uso real.
- Asistencia en redacción de documentación médica: podría ayudar a redactar cartas de derivación o informes de alta, aunque la falta de evaluación de seguridad lo hace arriesgado.
- Investigación académica: como modelo experimental, puede servir para estudiar el impacto del fine-tune en dominios especializados o para comparar metodologías de ajuste.
- Prototipado de aplicaciones de NLP médico: los desarrolladores pueden usarlo como base para pruebas de concepto, siempre que validen los resultados con datos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación, y no hay referencias externas que documenten el rendimiento de este fine-tune en tareas médicas o generales. Cualquier afirmación sobre su calidad sería especulativa.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16 (6,6 GB), se necesitan al menos 12 GB de VRAM para cargar el modelo completo en GPU. Con cuantización a 8 bits se podría reducir a unos 7-8 GB, y a 4 bits a unos 5-6 GB, aunque no se proporcionan archivos cuantizados en el repositorio.
- GPU recomendadas: una RTX 3090, RTX 4090 o A100 de 16 GB sería suficiente para inferencia en bf16. Para cuantización 4 bits, una RTX 3060 de 12 GB podría bastar.
- Compatibilidad con GPU de consumo: sí, es posible ejecutarlo en GPUs de consumo con al menos 12 GB de VRAM, especialmente con cuantización.
- Opciones de despliegue: al ser un modelo de transformers, se puede servir con vLLM, TGI o llama.cpp (si se convierte a GGUF). También es compatible con Ollama si se genera un archivo GGUF.
- Latencia y throughput: no disponibles. Dependerá del hardware y del backend de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ArthT/gemma2-9b-a2ctx-badmed-seed1-v2 | 9B (estimado) | 2.000 (según nombre) | no disponible | Hugging Face |
| google/gemma-2-9b | 9B | 8.192 | Gemma Terms of Use | Hugging Face |
| google/gemma-2-9b-it | 9B | 8.192 | Gemma Terms of Use | Hugging Face |

La comparativa se limita al modelo base, ya que no hay otros fine-tunes médicos de Gemma 2 9B con documentación pública en la información disponible. El modelo base ofrece un contexto mucho mayor (8.192 tokens) y una licencia clara, mientras que este fine-tune presenta una ventana reducida y una licencia indefinida, lo que dificulta su uso en producción.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan, pero al ser un fine-tune de Gemma 2, hereda los sesgos del modelo base, que pueden incluir estereotipos de género, raza o cultura.
- Riesgo de alucinación: alto, especialmente en dominios médicos donde la precisión es crítica. Sin evaluación clínica, el modelo puede generar información incorrecta o peligrosa.
- Limitaciones de contexto: la ventana de 2.000 tokens (si se confirma) es muy corta para documentos médicos extensos, lo que limita su aplicabilidad.
- Restricciones de licencia: la licencia no está especificada, lo que impide su uso comercial sin aclaración legal.
- Falta de documentación: la model card no proporciona información sobre el dataset de entrenamiento, el proceso de fine-tune ni los resultados de evaluación, lo que impide verificar su calidad y seguridad.
- Riesgo para producción: no se recomienda su uso en entornos clínicos reales sin una validación exhaustiva por profesionales sanitarios.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ArthT/gemma2-9b-a2ctx-badmed-seed1-v2
- Modelo base Gemma 2 9B: https://huggingface.co/google/gemma-2-9b
- Model card de Gemma 2 (Google AI): https://ai.google.dev/gemma/docs/core/model_card_2
- Repositorio de Gemma en GitHub: https://github.com/google-deepmind/gemma
- Página de Gemma 2 9B en Open Source AI Models: https://opensourceaimodels.net/models/gemma-2-9b
