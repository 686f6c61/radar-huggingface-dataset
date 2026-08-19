# huggingFacing/qwen2.5-7b-to-1.5b-liftkd-v8-gate-only-paper100k-step1500-seed10

## Resumen

Este repositorio contiene el checkpoint `lift_v8_gate_only`, un modelo de destilación de conocimiento (knowledge distillation) que comprime el comportamiento de Qwen2.5-7B-Instruct (teacher) en un modelo estudiante de 1.500 millones de parámetros basado en Qwen2.5-1.5B-Instruct. Forma parte de una suite de ablaciones denominada "matched V12 Paper100K", diseñada para evaluar el impacto de distintos componentes en el proceso de destilación. En concreto, esta variante emplea un "token-level gap gate" sin funciones de influencia, lo que permite aislar el efecto de ese mecanismo concreto sobre la calidad de la destilación.

El modelo se entrenó con 96.000 ejemplos de entrenamiento y un split de control de 2.000 ejemplos, durante 1.500 pasos de optimización con un batch global de 64. El objetivo es totalmente on-policy mediante Generalized Knowledge Distillation (GKD), muestreando con temperatura 0.9 y generando hasta 128 tokens por ejemplo. Este checkpoint es un artefacto de investigación, no un modelo listo para producción, y sirve para estudiar cómo influye el gate de tokens en la transferencia de conocimiento desde un modelo grande a uno pequeño.

Con 1.543.910.912 parámetros, el modelo se distribuye en formato SafeTensors y bajo licencia Apache 2.0. No se han publicado métricas de rendimiento en la información disponible, por lo que su evaluación requiere ejecutar benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 1.543.910.912 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base Qwen2.5-1.5B-Instruct soporta multiples idiomas, pero no se especifica para este checkpoint) |
| Licencia | Apache 2.0 |
| Formato de pesos | SafeTensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen2.5, un transformer decoder-only con atención causal estándar. El proceso de destilación se basa en Generalized Knowledge Distillation (GKD), un método on-policy donde el estudiante genera sus propias secuencias y el teacher proporciona las distribuciones de probabilidad objetivo. La variante `gate-only` incorpora un mecanismo de puerta (gate) a nivel de token que pondera la contribución de la pérdida de destilación en cada posición, pero omite el uso de funciones de influencia (influence functions), que son el otro componente evaluado en la suite de ablaciones.

El entrenamiento se realizó con el teacher `Qwen/Qwen2.5-7B-Instruct` y el estudiante inicializado desde `Qwen/Qwen2.5-1.5B-Instruct`. Los datos provienen de `lift_paper_en_natural_v1/100k`, con 96.000 ejemplos de entrenamiento y 2.000 de control. Se usó AdamW con learning rate coseno desde 1e-5 hasta 1e-7 y weight decay de 1e-2. El muestreo se hizo con temperatura 0.9 y un máximo de 128 tokens generados. El checkpoint corresponde al paso 1.500 con semilla 10.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Instrucción y diálogo conversacional, dado que el modelo base es una variante instruct.
- Razonamiento básico y comprensión de lenguaje, limitado por el tamaño reducido del modelo.
- No se documentan capacidades específicas adicionales como tool calling, visión o audio para este checkpoint.
- Al ser un artefacto de investigación, no se garantiza un comportamiento óptimo en tareas generales; su propósito es el estudio de la destilación.

## Casos de uso

- Investigación académica en destilación de conocimiento: permite comparar el efecto del gate de tokens frente a otras variantes de la suite de ablaciones (por ejemplo, con funciones de influencia o sin gate).
- Análisis de transferencia de conocimiento: estudiar cómo se distribuye la información del teacher en el espacio latente del estudiante cuando se aplica un gate a nivel de token.
- Desarrollo de métodos de compresión de modelos: servir como baseline para validar nuevas técnicas de destilación que mejoren la eficiencia del entrenamiento.
- Evaluación de robustez: probar el comportamiento del modelo en tareas de generación con datos fuera de distribución para medir la generalización del conocimiento destilado.
- Benchmarking de infraestructura: medir el rendimiento de inferencia de un modelo de 1.5B en GPUs consumer, útil para planificar despliegues de modelos pequeños.
- Reproducibilidad de experimentos: al estar disponible el checkpoint y los hiperparámetros, se puede replicar el entrenamiento o continuar desde este punto para explorar variantes adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este checkpoint no incluye métricas como MMLU, HumanEval o GSM8K. Para evaluar su rendimiento, sería necesario ejecutar los benchmarks estándar sobre el modelo y comparar con el modelo base Qwen2.5-1.5B-Instruct.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,1 GB para los pesos (1.543.910.912 parámetros × 2 bytes) más overhead de activaciones y caché KV, lo que puede requerir entre 4 y 6 GB dependiendo de la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM, como RTX 2060, RTX 3060, RTX 4060, o GPUs de datacenter como T4 o A10. Para mayor velocidad, una RTX 4090 o A100 sería adecuada.
- Es compatible con GPUs consumer de gama media-baja, aunque no se han probado cuantizaciones para reducir aún más los requisitos.
- Opciones de despliegue: al ser un modelo estándar de transformers, se puede servir con vLLM, TGI (Text Generation Inference), llama.cpp (si se convierte a GGUF) u Ollama.
- Latencia y throughput estimados: no disponibles, dependen del hardware y de la longitud de secuencia. Para un modelo de 1.5B, se espera una generación de decenas de tokens por segundo en GPUs modernas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (base) | 1,54B | 32K (típico) | Apache 2.0 | Modelo original sin destilación, disponible en HuggingFace |
| Este checkpoint (gate-only) | 1,54B | No disponible | Apache 2.0 | Destilado desde Qwen2.5-7B-Instruct con GKD y gate de tokens |
| TinyLlama-1.1B | 1,1B | 2K | Apache 2.0 | Modelo pequeño de propósito general, no destilado desde un teacher específico |

No se dispone de comparativas de rendimiento directas porque no hay benchmarks publicados para este checkpoint. La comparación estructural muestra que es un modelo denso de tamaño similar al base, pero con un entrenamiento especializado en destilación.

## Limitaciones y advertencias

- Modelo de investigación: no está optimizado para producción y puede presentar comportamientos erráticos en tareas no contempladas en el entrenamiento de destilación.
- Sesgos del teacher: al destilar desde Qwen2.5-7B-Instruct, el modelo puede heredar sesgos presentes en el teacher, como estereotipos o respuestas políticamente sesgadas.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en dominios especializados.
- Longitud de contexto no documentada: aunque el modelo base soporta 32K, este checkpoint no especifica la ventana de contexto efectiva tras la destilación, por lo que se recomienda no exceder 8K tokens para evitar degradación.
- Sin cuantizaciones oficiales: no se proporcionan versiones cuantizadas, por lo que el despliegue en entornos con poca VRAM requerirá conversión manual a GGUF u otros formatos.
- Restricciones de uso: la licencia Apache 2.0 permite uso comercial, pero al ser un artefacto de investigación, no se garantiza su calidad para aplicaciones críticas.

## Enlaces

- Repositorio del modelo: [https://huggingface.co/huggingFacing/qwen2.5-7b-to-1.5b-liftkd-v8-gate-only-paper100k-step1500-seed10](https://huggingface.co/huggingFacing/qwen2.5-7b-to-1.5b-liftkd-v8-gate-only-paper100k-step1500-seed10)
- Checkpoint completo del método V12: [https://huggingface.co/huggingFacing/qwen25_7B_to_1.5B_v12_onlineif_paper100k_1500](https://huggingface.co/huggingFacing/qwen25_7B_to_1.5B_v12_onlineif_paper100k_1500)
- Modelo base: [Qwen/Qwen2.5-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct)
- Teacher: [Qwen/Qwen2.5-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct)
