# hadasor/Llama-3.1-8B-Instruct-prune_bad_medical_advice_p_0.0005_q_1e-05

## Resumen

Este modelo es una variante podada de Llama-3.1-8B-Instruct, publicada por el usuario hadasor en Hugging Face. El nombre del repositorio sugiere que se ha aplicado una técnica de poda (pruning) orientada a eliminar la capacidad del modelo de generar consejos médicos perjudiciales, con parámetros de poda `p_0.0005` y `q_1e-05`. Sin embargo, la model card no proporciona ninguna documentación técnica sobre el proceso de poda, los datos utilizados ni los criterios de evaluación.

El modelo conserva la arquitectura base de Llama 3.1 de 8 mil millones de parámetros, con un tamaño de pesos de 16,1 GB en formato safetensors, lo que sugiere una precisión de 16 bits (fp16). Se desconoce si la poda afecta a la longitud de contexto original de 128K tokens o a las capacidades multilingües del modelo base. La ausencia de documentación y de resultados de evaluación hace que su uso en producción sea arriesgado sin una validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Llama-3.1-8B-Instruct) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base soporta 128K tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a un transformer decoder-only con atención causal, tal como se define en el modelo Llama-3.1-8B-Instruct de Meta. Este modelo base emplea una ventana de contexto de 128K tokens, atención con RoPE (Rotary Position Embedding), activación SwiGLU y normalización RMSNorm. El modelo podado mantiene el mismo número de parámetros totales (8.030 millones), lo que sugiere que la poda podría ser de tipo estructural (eliminación de pesos o neuronas) o basada en magnitud, pero no se ha documentado el método exacto.

El nombre del repositorio indica parámetros de poda `p_0.0005` y `q_1e-05`, que podrían corresponder a tasas de poda o coeficientes de regularización, pero no hay información adicional sobre el procedimiento de entrenamiento, los datos utilizados para la poda ni si se realizó un ajuste fino posterior (fine-tuning) para recuperar capacidades. Tampoco se especifica si se emplearon técnicas como RLHF, DPO o destilación.

## Capacidades

- Generación de texto conversacional: al estar basado en Llama-3.1-8B-Instruct, conserva las capacidades de diálogo y respuesta a instrucciones del modelo original, aunque la poda podría degradarlas.
- Razonamiento y conocimiento general: se espera un comportamiento similar al modelo base en tareas de razonamiento, matemáticas y conocimiento enciclopédico, pero sin datos de evaluación no se puede confirmar.
- Generación de código: el modelo base tiene competencias de programación; la poda podría afectarlas de forma no uniforme.
- Capacidades multilingües: el modelo base soporta varios idiomas, pero no se ha verificado el impacto de la poda en lenguas distintas del inglés.
- Tool calling y function calling: el modelo base soporta estas funcionalidades, pero no hay evidencia de que se hayan preservado tras la poda.
- No se dispone de información sobre modos especiales como thinking mode, visión o audio.

## Casos de uso

- Investigación en seguridad de modelos de lenguaje: el modelo puede servir como objeto de estudio para analizar cómo la poda dirigida reduce comportamientos nocivos en dominios específicos (consejo médico) sin eliminar capacidades generales.
- Evaluación de técnicas de pruning: investigadores pueden comparar este modelo con otras variantes podadas del mismo autor (con diferentes valores de `p` y `q`) para estudiar el equilibrio entre eliminación de contenido dañino y preservación de utilidad.
- Desarrollo de sistemas de asistencia sanitaria con restricciones: si la poda resulta efectiva, el modelo podría integrarse en entornos controlados donde se requiera minimizar la generación de consejos médicos peligrosos, siempre con supervisión humana.
- Benchmark de alineación: el modelo puede usarse en suites de evaluación de seguridad para medir la resistencia a generar información médica incorrecta o perjudicial.
- Fine-tuning posterior: podría servir como punto de partida para un ajuste fino adicional en dominios médicos, aprovechando la posible reducción de salidas dañinas.
- Análisis de robustez: investigadores pueden probar si la poda introduce vulnerabilidades o comportamientos inesperados en tareas generales de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación comparativa. Tampoco se indica el rendimiento en tareas específicas de seguridad médica. Sin estos datos, no es posible cuantificar el impacto de la poda en las capacidades del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8.030 millones de parámetros en fp16, se requieren aproximadamente 16 GB de VRAM solo para los pesos. Con cuantización a 8 bits se reduciría a unos 8 GB, y a 4 bits a unos 4 GB, pero no se ofrecen versiones cuantizadas en el repositorio.
- GPU recomendadas: una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB, H100) para inferencia en fp16. En consumer GPU de 24 GB como la RTX 3090 o 4090 es viable.
- Si cabe en consumer GPU: sí, en GPUs con 24 GB o más. Para GPUs de 8-12 GB sería necesaria cuantización adicional.
- Opciones de despliegue: al ser un modelo de la familia transformers, se puede servir con vLLM, TGI (Text Generation Inference), llama.cpp (si se convierte a GGUF) u Ollama (con conversión previa). No se incluyen archivos GGUF en el repositorio.
- Latencia y throughput: no disponibles. Dependerán del hardware y del backend de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| hadasor/Llama-3.1-8B-Instruct-prune_bad_medical_advice_p_0.0005_q_1e-05 | 8.03B | no disponible | no disponible | Variante podada sin documentación |
| meta-llama/Llama-3.1-8B-Instruct | 8.03B | 128K | Llama 3.1 Community License | Modelo base original |
| hadasor/Llama-3.1-8B-Instruct-prune_bad_medical_advice_p_0.0007_q_4e-05 | 8.03B | no disponible | no disponible | Otra variante podada del mismo autor con parámetros distintos |

No se dispone de datos de rendimiento comparativo. La comparativa se limita a aspectos estructurales y de licencia. El modelo base tiene benchmarks públicos conocidos (por ejemplo, MMLU 68.4, HumanEval 72.6), pero no se puede asumir que la variante podada mantenga esos resultados.

## Limitaciones y advertencias

- Documentación inexistente: la model card es una plantilla automática sin información útil sobre el proceso de poda, los datos empleados o los objetivos de seguridad.
- Sin evaluación de seguridad: no hay evidencia de que la poda realmente reduzca la generación de consejos médicos dañinos. El nombre del modelo es una promesa, no un resultado verificado.
- Riesgo de degradación de capacidades: la poda puede haber dañado el rendimiento general en tareas de lenguaje, razonamiento o código, sin que se haya medido.
- Licencia no especificada: al no indicar la licencia, no está claro si el modelo puede usarse comercialmente. El modelo base tiene una licencia Llama 3.1 con restricciones, pero este derivado no la declara.
- Sesgos y alucinaciones: como cualquier LLM, puede generar información falsa o sesgada, especialmente en dominios médicos. La poda no garantiza la eliminación completa de contenido perjudicial.
- Sin garantía de producción: sin benchmarks ni pruebas de robustez, no se recomienda su uso en aplicaciones críticas o en entornos sanitarios reales.
- Idiomas no verificados: el impacto de la poda en lenguas distintas del inglés es desconocido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hadasor/Llama-3.1-8B-Instruct-prune_bad_medical_advice_p_0.0005_q_1e-05
- Modelo base Llama-3.1-8B-Instruct (Meta): https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Repositorio de modelos Llama (GitHub): https://github.com/meta-llama/llama-models
- Otras variantes podadas del mismo autor: https://huggingface.co/hadasor/Llama-3.1-8B-Instruct-prune_bad_medical_advice_p_0.0007_q_4e-05 y https://huggingface.co/hadasor/Llama-3.1-8B-Instruct-prune_risky_financial_advice_p_0.0007_q_1e-05
