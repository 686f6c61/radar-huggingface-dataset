# JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-lean-boldthrush-s70

## Resumen

El modelo `JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-lean-boldthrush-s70` es un ajuste fino por aprendizaje por refuerzo del modelo base Qwen/Qwen3.5-4B, desarrollado por el equipo de investigación de JetBrains. Se ha entrenado con GRPO (Group Relative Policy Optimization) sobre la tarea de demostración formal de teoremas en Lean 4, empleando el conjunto de datos Lean Workbook y fijando un presupuesto de generación de 4.096 tokens. El objetivo del trabajo, descrito en el artículo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*, es que el modelo interiorice ese límite fijo y produzca respuestas correctas dentro del presupuesto, en lugar de depender de un escalado de cómputo en tiempo de inferencia.

Con 4.539.265.536 parámetros totales (aproximadamente 4,54 mil millones) y pesos en BF16, es un modelo de tamaño medio orientado a razonamiento matemático y formal. La relevancia actual radica en su enfoque: demuestra que un ajuste por refuerzo con recompensa verificable (RLVR) y presupuesto fijo puede mejorar la precisión dentro de ese presupuesto, un planteamiento útil para sistemas de razonamiento formal donde el coste por consulta debe acotarse.

El checkpoint publicado corresponde al paso 70 del entrenamiento, con el identificador interno `boldthrush`. La model card está incompleta (la sección de citación figura como pendiente) y no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-4B); detalles específicos no disponibles |
| Parametros totales | 4.539.265.536 (≈4,54 B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible (el presupuesto de generación es de 4.096 tokens) |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal con pipeline `image-text-to-text`, y se ajusta mediante GRPO con línea base leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. El entrenamiento se realizó sobre Lean Workbook, un conjunto de enunciados formales en Lean 4, durante un máximo de 5 épocas, con lotes de 32 prompts y 8 rollouts por paso, optimizador Adam con tasa de aprendizaje constante de 1e-06, 10 pasos de calentamiento y un total de 70 pasos. La recompensa es binaria: la prueba se acepta o no por el verificador de Lean 4.

La innovación principal es la internalización del presupuesto: todas las generaciones se limitan a `max_new_tokens = 4096`, de modo que el modelo aprende a construir demostraciones válidas dentro de ese límite en lugar de beneficiarse de un escalado de cómputo en test-time. Los prompts se renderizan con la plantilla de chat del modelo base. No se documentan innovaciones adicionales de decodificación especulativa ni atención lineal en la información disponible.

## Capacidades

- Generación de texto y razonamiento formal: demostración de teoremas en Lean 4 a partir de enunciados formales.
- Razonamiento matemático estructurado dentro de un presupuesto fijo de 4.096 tokens de generación.
- Procesamiento de entrada imagen-texto, heredado del pipeline `image-text-to-text` del modelo base.
- Conversación multi-turno mediante la plantilla de chat del modelo base.
- Capacidad multilingüe: no disponible en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo de pensamiento (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Demostración automática de teoremas en Lean 4: el modelo recibe un enunciado formal del Lean Workbook y genera una prueba que el verificador Lean 4 valida; es su tarea de entrenamiento directa y su caso de uso principal.
- Asistencia a matemáticos formales: dado que produce pruebas dentro de un presupuesto acotado de 4.096 tokens, resulta adecuado para iterar rápidamente sobre enunciados y obtener candidatos de prueba con coste predecible por intento.
- Integración en pipelines de verificación continua: el modelo puede generar pruebas candidatas que se pasan automáticamente al checker de Lean 4, encajando en flujos de CI para librerías de matemáticas formalizadas.
- Generación de datos sintéticos para entrenamiento: las pruebas aceptadas por el verificador pueden servir como datos de entrenamiento adicionales para otros modelos o para el propio bucle de RL.
- Investigación en RLVR y presupuestos fijos: sirve como referencia reproducible (paso 70, hiperparámetros documentados) para estudiar la internalización de presupuestos en modelos pequeños.
- Evaluación comparativa de razonamiento formal: al ser un modelo de 4,5 B con licencia Apache 2.0, es adecuado como línea base ligera frente a modelos mayores en tareas de demostración.
- Prototipado de asistentes matemáticos multimodales: al heredar el pipeline imagen-texto del modelo base, puede explorarse en escenarios donde el enunciado incluya una imagen, aunque no se documenta entrenamiento específico para ello.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos (4,54 B × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5-5 GB para pesos; en 4 bits, alrededor de 2,3-3 GB (estimaciones teóricas; no se publican cuantizaciones oficiales).
- GPU recomendadas: A100 (40/80 GB) o H100 para inferencia en BF16 con lotes amplios; RTX 4090 (24 GB) suficiente para BF16 con lote pequeño.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en BF16; en GPUs de 8-12 GB requeriría cuantización.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama y TGI no están confirmados en la información disponible, aunque al ser safetensors estándar son compatibles en principio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| budget-internalization-qwen3.5-4b-4k-grpo-lean-boldthrush-s70 | 4,54 B | No disponible | Demostración formal Lean 4 con presupuesto fijo | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (modelo base) | ≈4 B | No disponible | Modelo general multimodal | Apache 2.0 (según modelo base) | Hugging Face |
| Alternativas de razonamiento formal de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo para establecer diferencias cuantitativas con alternativas.

## Limitaciones y advertencias

- La model card está incompleta: la sección de citación figura como pendiente y no se documentan resultados de evaluación.
- El modelo está especializado en Lean 4; su rendimiento en tareas generales de texto o matemáticas informales puede degradarse respecto al modelo base.
- El presupuesto de 4.096 tokens de generación es una restricción de entrenamiento; demostraciones que requieran más tokens podrían no completarse correctamente.
- Riesgo de alucinación en la generación de pruebas: las demostraciones no verificadas por Lean 4 no deben considerarse correctas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Limitaciones de idioma: no se documentan los idiomas soportados.
- Uso comercial: permitido bajo Apache 2.0, heredado del modelo base, pero conviene verificar los términos del modelo base Qwen3.5-4B.
- Es un checkpoint intermedio (paso 70 de un entrenamiento con hasta 5 épocas); puede no representar el estado final óptimo del proyecto.
- Sin descargas ni valoraciones en el momento de la consulta; no hay evidencia de validación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-lean-boldthrush-s70
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Artículo referenciado: *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy* (enlace no disponible)
- Repositorio de código: no disponible
- Demos: no disponibles
