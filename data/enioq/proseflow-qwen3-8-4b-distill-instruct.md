# enioq/ProseFlow-Qwen3.8-4B-Distill-Instruct

## Resumen

ProseFlow-Qwen3.8-4B-Distill-Instruct es un modelo de lenguaje de 4.000 millones de parámetros desarrollado por enioq, obtenido mediante fine-tuning instruct sobre el modelo base empero-ai/Qwen3.8-4B-Distill. Este último es una destilación de parámetros completos del modelo Qwen3.8 (2,4 billones de parámetros totales, 95.000 millones activos) hacia la arquitectura Qwen3.5-4B, entrenado con aproximadamente 45.000 trazas de razonamiento encadenado del profesor, filtradas por calidad, en dominios de matemáticas, razonamiento general y seguimiento de instrucciones.

El modelo resultante hereda la arquitectura Qwen3.5-4B y está orientado a tareas de generación de prosa y conversación, como sugiere el nombre "ProseFlow". El pipeline declarado es `image-text-to-text`, lo que indica una posible capacidad multimodal, aunque no se detallan los componentes de visión en la documentación disponible. Su relevancia radica en ofrecer un modelo compacto (4B) con capacidades de razonamiento destiladas de un modelo mucho mayor, apto para despliegue en entornos con recursos limitados. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-4B (transformer decoder-only, posiblemente con atención estándar) |
| Parametros totales | 4.000 millones (4B) |
| Parametros activos | no disponible (no es un MoE declarado) |
| Longitud de contexto | no disponible (se infiere de la familia Qwen3.5, típicamente 32.768 tokens, pero no confirmado) |
| Tipos de cuantizacion | no disponible (se puede cuantizar a INT8, INT4, GGUF, etc., pero no hay datos oficiales) |
| Idiomas soportados | inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo base, empero-ai/Qwen3.8-4B-Distill, es una destilación de parámetros completos del modelo Qwen3.8 (2,4T A95B) hacia la arquitectura Qwen3.5-4B. El proceso de destilación utilizó alrededor de 45.000 trazas de razonamiento encadenado del profesor, curadas y filtradas por calidad, cubriendo matemáticas, razonamiento general y seguimiento de instrucciones. El estudiante se entrenó con estas trazas para replicar el comportamiento del modelo grande en un formato compacto.

El fine-tuning posterior de ProseFlow se realizó con la librería Unsloth (que acelera el entrenamiento) y la librería TRL de Hugging Face, típicamente mediante Supervised Fine-Tuning (SFT) o Direct Preference Optimization (DPO), aunque el README no especifica el método exacto. No se detallan los hiperparámetros, el número de épocas ni el tamaño del dataset de fine-tuning. La arquitectura resultante es un transformer decoder-only de 4B parámetros, sin indicios de mezcla de expertos (MoE) ni de atención lineal. El pipeline `image-text-to-text` sugiere que el modelo podría aceptar entradas multimodales, pero no hay documentación técnica que confirme la integración de un codificador visual.

## Capacidades

- Generación de texto fluido y coherente, especialmente orientado a prosa narrativa y conversacional (por el nombre "ProseFlow").
- Razonamiento encadenado (chain-of-thought) destilado del modelo profesor, útil para tareas de matemáticas y lógica.
- Seguimiento de instrucciones, gracias al fine-tuning instruct.
- Posible soporte multimodal (entrada de imágenes y texto) según el pipeline declarado, aunque no verificado.
- Capacidad multilingüe limitada: solo se declara inglés.
- No se confirma soporte de tool calling ni function calling en la documentación disponible.
- No se confirma modo de razonamiento explícito (thinking mode) ni capacidades de agente.

## Casos de uso

- Generación de contenido narrativo: el modelo puede redactar cuentos, guiones o artículos de blog con un estilo fluido, aprovechando su entrenamiento en prosa. Su tamaño de 4B permite ejecutarlo en una GPU de consumo para prototipado rápido.
- Asistente de escritura creativa: integrado en editores de texto, puede sugerir continuaciones, reescribir párrafos o generar variaciones estilísticas, gracias a su capacidad de seguir instrucciones detalladas.
- Chat conversacional en inglés: como modelo instruct de 4B, puede servir de base para un chatbot de dominio específico (atención al cliente, tutoría) con fine-tuning adicional, dado su bajo coste de inferencia.
- Razonamiento matemático y lógico en entornos educativos: al heredar trazas de razonamiento del profesor, puede resolver problemas de nivel medio y explicar los pasos, útil para aplicaciones de aprendizaje asistido.
- Preprocesamiento de prompts: el modelo base destilado se ha utilizado en proyectos como "Prompt Architect" para refactorizar prompts de usuario en prompts de sistema estructurados; ProseFlow puede emplearse de forma similar en pipelines de optimización de instrucciones.
- Prototipado de aplicaciones con recursos limitados: al ser un modelo de 4B con licencia Apache 2.0, es adecuado para pruebas de concepto en entornos edge o con una sola GPU, donde modelos más grandes no caben.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo específico. El modelo base empero-ai/Qwen3.8-4B-Distill tampoco presenta cifras públicas en su model card. Se recomienda evaluar el modelo en los conjuntos de datos relevantes antes de su uso en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 4B parámetros, en FP16 se requieren aproximadamente 8 GB de VRAM; en INT8 unos 4-5 GB; en INT4 unos 2-3 GB. Estas cifras son orientativas y dependen de la longitud de contexto y del backend utilizado.
- GPU recomendadas: una RTX 3060 12 GB o superior puede ejecutar el modelo en FP16; una RTX 4090 o A100 permiten mayor throughput y contexto largo. Para cuantización INT4, una GPU con 4-6 GB de VRAM es suficiente.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo como RTX 3060, RTX 4070, etc., especialmente con cuantización.
- Opciones de despliegue: compatible con vLLM, llama.cpp (mediante conversión a GGUF), Ollama, TGI (Text Generation Inference) y Hugging Face Transformers.
- Latencia y throughput: no disponibles. Para un modelo de 4B, se espera una latencia de decodificación de decenas de milisegundos por token en una GPU moderna, pero no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ProseFlow-Qwen3.8-4B-Distill-Instruct | 4B | no disponible | Apache 2.0 | Fine-tune instruct de destilación de Qwen3.8 |
| Qwen2.5-3B-Instruct | 3B | 32.768 | Apache 2.0 | Modelo instruct de la serie Qwen2.5, ampliamente usado |
| Llama-3.2-3B-Instruct | 3B | 128.000 | Llama 3.2 Community License | Modelo instruct de Meta, con contexto largo |
| Phi-3.5-mini-instruct | 3.8B | 128.000 | MIT | Modelo compacto de Microsoft, fuerte en razonamiento |

La comparativa es orientativa; no se dispone de benchmarks para ProseFlow que permitan una comparación cuantitativa. En términos de licencia, ProseFlow es más permisivo que Llama-3.2 (que tiene restricciones de uso). Su contexto no está confirmado, mientras que los competidores ofrecen ventanas de 32K o 128K.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado principalmente en inglés y con datos de destilación de un modelo mayor, puede heredar sesgos de género, raza o ideológicos presentes en los datos de entrenamiento. No se han realizado auditorías de sesgo.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente en dominios de conocimiento factual. Se recomienda verificación externa en aplicaciones críticas.
- Limitaciones de contexto: la longitud de contexto no está documentada; si es inferior a 32K, puede fallar en tareas que requieran ventanas largas.
- Limitaciones de idioma: solo se declara inglés; el rendimiento en otros idiomas, incluido el español, no está garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero no se especifican patentes ni cláusulas adicionales; se recomienda revisar el texto completo de la licencia.
- Caveat de producción: al ser un modelo reciente (creado en agosto de 2026) con cero descargas y cero likes, no hay evidencia de validación comunitaria. Se debe evaluar exhaustivamente antes de desplegarlo en entornos productivos.
- La capacidad multimodal declarada (image-text-to-text) no está documentada técnicamente; puede ser un error de etiquetado o requerir componentes adicionales no incluidos en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/enioq/ProseFlow-Qwen3.8-4B-Distill-Instruct
- Modelo base (empero-ai/Qwen3.8-4B-Distill): https://huggingface.co/empero-ai/Qwen3.8-4B-Distill
- Repositorio oficial de Qwen3.8 (GitHub): https://github.com/QwenLM/Qwen3.8
- Proyecto Prompt Architect basado en el modelo base: https://github.com/47thtechcorner/RayCodes_Qwen3.8
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
