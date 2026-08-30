# Pkv3477/fraud-detector

## Resumen

El modelo `Pkv3477/fraud-detector` es un ajuste fino (fine-tune) del modelo Qwen2.5-1.5B-Instruct, desarrollado por el usuario Pkv3477. Se publicó en Hugging Face en agosto de 2026 con el objetivo declarado de servir como detector de fraude, aunque la documentación disponible no especifica el conjunto de datos ni la tarea concreta de entrenamiento. El entrenamiento se realizó mediante Supervised Fine-Tuning (SFT) utilizando la librería TRL de Hugging Face, sobre el modelo base de 1.500 millones de parámetros de la familia Qwen2.5, que ya incorpora instrucciones y capacidades de conversación.

A pesar de su nombre, no se han publicado resultados de evaluación ni ejemplos específicos de uso en detección de fraude. La model card únicamente muestra un ejemplo de generación de texto con una pregunta filosófica, lo que sugiere que el modelo conserva las capacidades generales del base. Su relevancia actual es limitada: se trata de un experimento de fine-tuning sin métricas ni documentación técnica que permita validar su utilidad en producción. La falta de licencia explícita y de información sobre el dataset de entrenamiento añade incertidumbre sobre su uso legal y ético.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only) – heredada de Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.500 millones (1.5B) – según el modelo base |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens (según el modelo base Qwen2.5) |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados) |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 soporta múltiples idiomas, pero no se especifica para este fine-tune) |
| Licencia | no disponible (el campo `licence` del YAML está vacío) |
| Formato de pesos | safetensors (según los tags de Hugging Face) |

Nota: los valores de arquitectura, parámetros y contexto se infieren del modelo base Qwen2.5-1.5B-Instruct, ya que la model card no documenta cambios en estos aspectos.

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Transformer decoder-only de Qwen2.5, con 1.500 millones de parámetros y una ventana de contexto de 32K tokens. El ajuste fino se realizó mediante SFT (Supervised Fine-Tuning) usando la librería TRL (versión 1.12.0), sobre el checkpoint `Qwen/Qwen2.5-1.5B-Instruct`. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas adicionales como RLHF o DPO. El único detalle técnico relevante es que se usó el framework `transformers` (versión 5.15.1) y PyTorch 2.11.0 con soporte CUDA 12.8.

No se documenta ninguna innovación arquitectónica ni de entrenamiento. Al ser un fine-tune de un modelo instructivo, se espera que herede las capacidades de razonamiento y generación del base, pero sin evidencia de especialización en fraude más allá del nombre.

## Capacidades

- Generación de texto y conversación multi-turno: hereda las capacidades del modelo base Qwen2.5-1.5B-Instruct, que puede mantener diálogos coherentes y seguir instrucciones.
- Razonamiento y comprensión de lenguaje natural: el modelo base presenta un rendimiento moderado en tareas de razonamiento, aunque no se han medido en esta versión fine-tuned.
- Soporte de tool calling y function calling: el modelo base Qwen2.5-Instruct soporta estas funciones, pero no se confirma si el fine-tune las conserva.
- Capacidades multilingües: el modelo base soporta múltiples idiomas (incluido español), pero no se verifica en este fine-tune.
- No se documentan capacidades específicas de detección de fraude, visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Clasificación de transacciones sospechosas: el modelo podría utilizarse para etiquetar transacciones financieras como fraudulentas o legítimas, siempre que se le proporcione un prompt adecuado y se valide su precisión con datos reales. Sin embargo, al carecer de métricas, no se recomienda para producción.
- Análisis de texto de reclamaciones: podría ayudar a identificar patrones de fraude en descripciones de reclamaciones de seguros o soporte al cliente, pero requiere pruebas adicionales.
- Asistente de soporte para equipos antifraude: como modelo conversacional, podría responder preguntas sobre procedimientos de detección de fraude, aunque su conocimiento específico es desconocido.
- Generación de informes de investigación: podría redactar resúmenes de casos sospechosos a partir de datos estructurados, pero sin garantía de precisión.
- Entrenamiento y demostración en entornos educativos: útil para mostrar el proceso de fine-tuning con TRL sobre un modelo pequeño, más que para uso real.
- Prototipado rápido de chatbots internos: dado su tamaño reducido, puede servir para experimentar con integraciones de tool calling o agentes en entornos de bajo coste, pero no para tareas críticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval, GSM8K ni ninguna evaluación específica de detección de fraude. No se pueden comparar sus capacidades reales con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB en FP16 (para los 1.5B parámetros) y alrededor de 1-2 GB en cuantización de 4 bits (si se aplicara, aunque no se ofrecen pesos cuantizados).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3060 o superiores. También puede ejecutarse en CPU con baja latencia para tareas pequeñas.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo medio (RTX 3060, RTX 4060, etc.) e incluso en Mac con Apple Silicon.
- Opciones de despliegue: compatible con `transformers` (pipeline), vLLM, llama.cpp (si se convierte a GGUF), Ollama (si se exporta) y TGI. No se proporcionan configuraciones oficiales.
- Latencia y throughput: no disponibles. Se estima que en una GPU moderna (RTX 4090) puede generar decenas de tokens por segundo, pero no hay datos verificados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Pkv3477/fraud-detector | 1.5B | 32K (base) | No especificada | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1.5B | 32K | Apache 2.0 | Hugging Face |
| Llama-3.2-1B | 1.2B | 128K | Llama 3.2 Community License | Hugging Face |
| Phi-3-mini (3.8B) | 3.8B | 128K | MIT | Hugging Face |

El modelo no aporta ventajas claras frente a su base, ya que no se documentan mejoras de rendimiento ni especialización verificada. Llama-3.2-1B y Phi-3-mini ofrecen alternativas con licencias claras y mayor contexto, aunque con tamaños diferentes.

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de Qwen2.5, puede heredar sesgos del corpus de entrenamiento original, pero no se han evaluado.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente en tareas de fraude donde los datos son sensibles.
- Limitaciones de contexto: la ventana de 32K es heredada, pero no se ha verificado si el fine-tune la mantiene íntegra.
- Restricciones de licencia: la licencia no está especificada. Esto impide su uso comercial sin consultar al autor, y podría generar problemas legales.
- Carencia de documentación: no hay información sobre el dataset de entrenamiento, lo que impide evaluar sesgos o calidad de los datos.
- No apto para producción: sin benchmarks ni validación, no se recomienda su uso en sistemas críticos de detección de fraude.
- Posible desalineación con el propósito: el ejemplo de uso en la model card no está relacionado con fraude, lo que sugiere que el fine-tune podría no haber especializado realmente el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pkv3477/fraud-detector
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- TRL (librería de entrenamiento): https://github.com/huggingface/trl
