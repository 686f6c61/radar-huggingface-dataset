# robbypambudi/prompt-shield-flan-t5-base

## Resumen
PromptShield Flan-T5-base es un modelo de clasificación de texto diseñado específicamente para la detección binaria de inyecciones de prompts (prompt injection). Desarrollado por robbypambudi, se obtiene mediante fine-tuning del modelo base `google/flan-t5-base` sobre un subconjunto del dataset PromptShield, utilizando la arquitectura `T5ForSequenceClassification` con dos etiquetas: `BENIGN` (0) e `INJECTION` (1). Con 223 millones de parámetros, ofrece una solución ligera y de bajo coste computacional para blindar aplicaciones basadas en LLM frente a ataques de manipulación de instrucciones.

El modelo resuelve un problema crítico de seguridad en el ecosistema actual de agentes y chatbots: la inyección de instrucciones maliciosas a través de entradas de usuario. Su relevancia radica en que puede integrarse como un filtro previo en pipelines de inferencia, protegiendo system prompts y datos sensibles sin necesidad de recurrir a modelos de gran tamaño. La ventana de contexto está limitada a 512 tokens, suficiente para analizar entradas de usuario típicas, y su licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | T5 (encoder-decoder) con cabeza de clasificación (`T5ForSequenceClassification`) |
| Parametros totales | 223.495.682 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en FP32, safetensors) |
| Idiomas soportados | no disponible (el dataset de entrenamiento no se especifica, aunque el ejemplo de uso está en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo parte de la arquitectura T5-base, un transformer encoder-decoder con 223M parámetros, al que se le añade una cabeza de clasificación para realizar una tarea de secuencia binaria. El entrenamiento se realizó siguiendo la receta de PromptShield, que incluye aumentación de datos con nuevas líneas (newline augmentation) sobre el split de entrenamiento del dataset original-filter. Se utilizó una semilla fija (12345) y una tasa de aprendizaje de 5e-5. El early stopping detuvo el entrenamiento en la época 0, que presentaba la menor pérdida de validación (0.000313), mientras que la pérdida de entrenamiento fue de 0.0337. No se menciona el uso de RLHF ni DPO; es un fine-tuning supervisado estándar para clasificación.

## Capacidades
- Detección binaria de inyección de prompts: clasifica entradas como benignas o maliciosas.
- Clasificación de texto de secuencia corta: optimizado para entradas de hasta 512 tokens.
- Integración sencilla con el ecosistema Hugging Face Transformers mediante `AutoModelForSequenceClassification`.
- No es un modelo generativo: no produce texto, solo emite logits para dos clases.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- Capacidades multilingües no confirmadas; el ejemplo de uso está en inglés y el dataset de entrenamiento no está documentado.

## Casos de uso
- Filtro de seguridad en chatbots de atención al cliente: el modelo puede analizar cada mensaje entrante antes de pasarlo al LLM principal, bloqueando intentos de "ignore previous instructions" o "reveal the system prompt" en tiempo real.
- Preprocesado de prompts en pipelines de agentes autónomos: al integrarse como paso previo en un agente que ejecuta herramientas, reduce el riesgo de que un atacante manipule las acciones del agente mediante entradas maliciosas.
- Moderación de entradas en APIs de LLM: desplegado como un servicio intermedio, puede filtrar peticiones sospechosas antes de que lleguen al modelo de generación, protegiendo la infraestructura y los costes de inferencia.
- Análisis de logs y auditoría de seguridad: permite escanear conversaciones históricas para identificar intentos de inyección que hayan podido pasar desapercibidos, ayudando a mejorar las defensas.
- Protección de system prompts en aplicaciones RAG: al validar las consultas del usuario antes de la recuperación de documentos, evita que instrucciones maliciosas alteren el comportamiento del sistema de búsqueda.
- Evaluación de robustez en entornos de testing: los equipos de seguridad pueden usarlo para generar métricas de resistencia de sus aplicaciones LLM frente a ataques de inyección, automatizando pruebas de penetración.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente reporta las pérdidas de entrenamiento y validación del checkpoint final:

| Split | Loss |
|---|---|
| train | 0.0337 |
| val | 0.000313 |

No se proporcionan métricas de precisión, recall o F1 sobre conjuntos de prueba públicos, por lo que no es posible comparar su rendimiento cuantitativo con otros detectores de inyección de prompts.

## Requisitos de hardware
- VRAM estimada para inferencia: el modelo tiene 223M parámetros. En FP32 ocupa aproximadamente 0.9 GB, por lo que cabe en cualquier GPU con 2 GB de VRAM o más.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 6GB, RTX 3060, RTX 4090) es suficiente. También es viable la inferencia en CPU con baja latencia para cargas moderadas.
- Opciones de despliegue: se puede servir con `transformers` directamente, exportar a ONNX para optimización con ONNX Runtime, o utilizar soluciones como Hugging Face TGI (aunque está orientado a generación, soporta clasificación). vLLM no es la opción habitual para T5 de clasificación, pero es posible.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dado su tamaño, se espera una inferencia en el orden de milisegundos en GPU y de decenas de milisegundos en CPU para secuencias de 512 tokens.

## Comparativa con modelos similares
La comparativa se realiza a nivel estructural, ya que no se dispone de benchmarks comunes en la información proporcionada.

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| `robbypambudi/prompt-shield-flan-t5-base` | T5-base (encoder-decoder) | 223M | 512 | Apache 2.0 | Clasificación binaria |
| `protectai/deberta-v3-base-prompt-injection` | DeBERTa-v3 (encoder) | 184M | 512 | Apache 2.0 | Clasificación binaria |
| `google/flan-t5-base` (base) | T5-base (encoder-decoder) | 223M | 512 | Apache 2.0 | Generación de texto |

El modelo de robbypambudi se distingue por estar fine-tuneado específicamente para la tarea, mientras que `google/flan-t5-base` es el modelo base sin entrenar para esta tarea. `protectai/deberta-v3-base-prompt-injection` es una alternativa popular en el mismo nicho, pero no se dispone de datos comparativos de rendimiento en la información facilitada.

## Limitaciones y advertencias
- Sesgos conocidos: no se documentan, pero al estar entrenado sobre un dataset específico (PromptShield original-filter), puede presentar sesgos hacia los patrones de ataque presentes en ese corpus.
- Riesgo de alucinación: al ser un clasificador, no genera texto, por lo que el riesgo de alucinación es nulo. Sin embargo, existe riesgo de falsos positivos (bloquear entradas benignas) y falsos negativos (dejar pasar inyecciones no vistas en el entrenamiento).
- Limitaciones de contexto: la ventana de 512 tokens puede ser insuficiente para analizar entradas muy largas o conversaciones completas; el texto se trunca automáticamente.
- Limitaciones de idioma: no se especifican los idiomas soportados. El ejemplo de uso está en inglés y el dataset no está documentado, por lo que su eficacia en otros idiomas es incierta.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero se debe mantener el aviso de copyright y la atribución.
- Caveat para producción: el modelo se detuvo en la época 0, lo que sugiere un ajuste muy rápido. Aunque la pérdida de validación es baja, no se han publicado métricas de robustez frente a ataques adversarios variados, por lo que se recomienda validar en el dominio específico antes de desplegarlo como única capa de defensa.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/robbypambudi/prompt-shield-flan-t5-base
- Repositorio GitHub del autor (PromptShield): https://github.com/robbypambudi/prompt-shield
- Modelo base: https://huggingface.co/google/flan-t5-base
