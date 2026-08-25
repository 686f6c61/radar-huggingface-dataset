# isbondarev/gigachat_3.1_smartsearch_sft_adapter_v2

## Resumen

El modelo `isbondarev/gigachat_3.1_smartsearch_sft_adapter_v2` es un adaptador (adapter) de fine-tuning por supervisión (SFT) sobre el modelo base `ai-sage/GigaChat3.1-10B-A1.8B-bf16`, que corresponde a la variante compacta "Lightning" de la familia GigaChat 3.1 desarrollada por Sber. Este adaptador, entrenado con la librería TRL de Hugging Face, busca especializar el modelo base en tareas de búsqueda inteligente (smart search), aunque la documentación publicada no detalla el conjunto de datos ni el procedimiento exacto de entrenamiento.

El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con 10 000 millones de parámetros totales y 1 800 millones de parámetros activos por token, diseñado para cargas de trabajo multilingües de asistente, razonamiento, generación de código, function calling y despliegue en entornos de producción. El adaptador añade aproximadamente 0,9 GB de pesos adicionales, lo que sugiere un ajuste de tipo LoRA o similar, aunque no se especifica la arquitectura interna del adaptador.

La relevancia de este modelo radica en que permite adaptar un MoE eficiente y ya optimizado a un dominio concreto (búsqueda inteligente) sin necesidad de reentrenar el modelo completo, reduciendo costes computacionales y facilitando su integración en sistemas de recuperación de información o asistentes con capacidades de búsqueda. No obstante, al tratarse de un adaptador recién publicado (agosto de 2026) y sin métricas de evaluación públicas, su rendimiento real aún no ha sido validado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador SFT sobre transformer MoE (GigaChat 3.1 Lightning) |
| Parametros totales | No disponible (el adaptador pesa 0,9 GB; el modelo base tiene 10B) |
| Parametros activos | No disponible (el modelo base tiene 1,8B activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles (el modelo base es multilingüe, pero no se especifica) |
| Licencia | No disponible (en la model card aparece "license" sin detalle) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo base `ai-sage/GigaChat3.1-10B-A1.8B-bf16`, un transformer MoE con 10 000 millones de parámetros totales y 1 800 millones de parámetros activos por token. La arquitectura MoE permite activar solo una fracción de los parámetros en cada paso, lo que reduce la latencia y el coste de inferencia en comparación con un modelo denso del mismo tamaño total. El modelo base fue entrenado desde cero por Sber y está orientado a tareas de asistente multilingüe, razonamiento, código y function calling.

El adaptador fue entrenado mediante fine-tuning supervisado (SFT) utilizando la librería TRL (versión 0.26.0) con Transformers 4.57.3 y PyTorch 2.12.0. No se proporciona información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. El nombre del adaptador sugiere una especialización en "smart search", pero no se detalla el tipo de datos utilizados (p. ej., pares pregunta-respuesta, consultas de búsqueda, documentos relevantes, etc.). Tampoco se indica si el adaptador modifica todas las capas o solo un subconjunto (p. ej., mediante LoRA).

## Capacidades

- Generación de texto: al heredar las capacidades del modelo base, el adaptador puede generar texto coherente y contextualizado en múltiples idiomas.
- Razonamiento: el modelo base está diseñado para tareas de razonamiento lógico y matemático, por lo que el adaptador conserva estas habilidades.
- Generación de código: el modelo base soporta generación y comprensión de código, capacidad que se mantiene en el adaptador.
- Function calling: el modelo base incluye soporte para llamadas a funciones, lo que permite integrar el adaptador en flujos de agentes y herramientas externas.
- Capacidades multilingües: aunque no se especifican los idiomas exactos, el modelo base es multilingüe (con énfasis en ruso e inglés).
- Especialización en búsqueda inteligente: el nombre del adaptador indica un fine-tuning orientado a tareas de búsqueda, aunque no se documentan los detalles de esta especialización.

## Casos de uso

- Búsqueda semántica en bases documentales: el adaptador puede utilizarse para generar representaciones de consultas y documentos, mejorando la relevancia en sistemas de recuperación de información. Su naturaleza MoE permite un despliegue eficiente en entornos con recursos limitados.
- Asistente de atención al cliente con recuperación aumentada (RAG): al combinar el adaptador con un índice vectorial, se puede construir un chatbot que responda preguntas basándose en documentos corporativos, aprovechando la capacidad de function calling del modelo base para consultar APIs externas.
- Generación de respuestas en motores de búsqueda internos: el adaptador puede reformular resultados de búsqueda o generar resúmenes de documentos relevantes, mejorando la experiencia del usuario final.
- Automatización de tareas de investigación: el modelo puede procesar consultas complejas, extraer información de múltiples fuentes y sintetizar respuestas, gracias a su capacidad de razonamiento y generación de texto.
- Desarrollo de agentes autónomos de búsqueda: con soporte para function calling, el adaptador puede orquestar llamadas a herramientas de búsqueda web o bases de datos, ejecutando flujos multi-paso.
- Prototipado rápido de sistemas de QA: al ser un adaptador ligero (0,9 GB adicionales), es adecuado para experimentar con fine-tuning sobre el modelo base sin necesidad de infraestructura masiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K u otros estándares para este adaptador concreto. Tampoco se ofrecen comparaciones con el modelo base o con otros adaptadores similares.

## Requisitos de hardware

- El modelo base tiene 10B parámetros totales pero solo 1,8B activos, lo que reduce significativamente la VRAM necesaria en comparación con un modelo denso de 10B. Sin embargo, al cargar todos los parámetros en memoria (incluso los inactivos), se requiere VRAM suficiente para los pesos completos.
- El adaptador añade aproximadamente 0,9 GB de pesos, por lo que el requisito total de VRAM dependerá de la cuantización y del tamaño del lote.
- Con cuantización de 4 bits, el modelo base podría caber en GPUs consumer de 8-12 GB (p. ej., RTX 3060, RTX 4070), aunque no se proporcionan datos oficiales.
- Para inferencia sin cuantizar, se recomienda al menos una GPU con 16-24 GB de VRAM (p. ej., RTX 4090, A100 40GB).
- Opciones de despliegue: al ser un adaptador de Transformers, puede utilizarse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama, aunque no se documenta compatibilidad específica.
- No se dispone de datos de latencia o throughput estimados.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros adaptadores o modelos de la misma categoría. El modelo base GigaChat 3.1 Lightning compite con otros MoE compactos como Qwen2.5-7B-Instruct o Mixtral-8x7B, pero no hay datos de rendimiento de este adaptador frente a ellos. Se recomienda consultar los benchmarks del modelo base para una referencia indirecta.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un adaptador sobre un modelo base entrenado por Sber, puede heredar sesgos presentes en los datos de entrenamiento originales, especialmente en contextos culturales o lingüísticos específicos.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o no verificada, especialmente en tareas de búsqueda donde la precisión es crítica.
- Limitaciones de contexto: no se ha especificado la longitud de contexto soportada, lo que puede limitar su uso en tareas que requieran documentos largos.
- Restricciones de licencia: la licencia no está claramente definida (aparece como "license" sin detalle). Esto puede impedir su uso comercial sin una revisión legal previa.
- Falta de documentación: no se detallan los datos de entrenamiento, el procedimiento de fine-tuning ni las métricas de evaluación, lo que dificulta la reproducibilidad y la confianza en el modelo.
- Dependencia del modelo base: el adaptador no es autónomo; requiere cargar el modelo base completo, lo que implica gestionar ambos componentes en el despliegue.

## Enlaces

- [HuggingFace - isbondarev/gigachat_3.1_smartsearch_sft_adapter_v2](https://huggingface.co/isbondarev/gigachat_3.1_smartsearch_sft_adapter_v2)
- [HuggingFace - ai-sage/GigaChat3.1-10B-A1.8B-bf16 (modelo base)](https://huggingface.co/ai-sage/GigaChat3.1-10B-A1.8B-bf16)
- [GitHub - salute-developers/gigachat3](https://github.com/salute-developers/gigachat3)
- [GigaChat 3.1 Lightning - openmodels.run](https://www.openmodels.run/models/gigachat-3-1-lightning)
- [GigaChat 3.1 Ultra - openmodels.run](https://www.openmodels.run/models/gigachat-3-1-ultra)
