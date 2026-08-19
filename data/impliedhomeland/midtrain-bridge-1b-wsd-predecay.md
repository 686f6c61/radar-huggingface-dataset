# Impliedhomeland/midtrain-bridge-1B-wsd-predecay

## Resumen

El modelo `midtrain-bridge-1B-wsd-predecay` es un checkpoint intermedio de un modelo de lenguaje de 1.000 millones de parámetros basado en la arquitectura Pythia, desarrollado por el usuario Impliedhomeland. Se enmarca en un experimento de investigación sobre entrenamiento con programación de tasa de aprendizaje WSD (Warmup-Stable-Decay) y mezcla de datos de texto y código. El checkpoint corresponde al punto de 54.000 millones de tokens, justo antes de la fase de decaimiento de la tasa de aprendizaje, y se publica como respaldo de durabilidad ante la posible pérdida de los datos de entrenamiento en almacenamiento temporal.

El modelo se entrenó sobre un backbone compartido de solo texto C4, al que se le incorporan datos de código en diferentes presupuestos (2.5, 5, 10 y 18 mil millones de tokens) para estudiar el efecto del momento de introducción del código. Cada rama produce un checkpoint con el mismo paso de entrenamiento (step 27466) y estado completo del optimizador, lo que permite continuar el entrenamiento o bifurcar desde ese punto. La relevancia actual radica en que proporciona un punto de control reproducible para investigaciones sobre curricula de datos y estrategias de decaimiento de LR, aunque no es un modelo final listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Pythia-1B) |
| Parametros totales | 1.000 millones (aprox.) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (dataset C4, predominantemente ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch checkpoint (.pt) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura estándar de Pythia-1B, un transformer decoder-only con 16 capas, 16 cabezas de atención y dimensión oculta 2048, similar a GPT-NeoX. El entrenamiento utiliza la programación WSD (Warmup-Stable-Decay): la tasa de aprendizaje se mantiene en un pico de 3e-4 durante el 90% del presupuesto total (54.0B de 60B tokens) y luego decae linealmente hasta 1e-6. El tamaño de lote global es de 960 secuencias de 2048 tokens, lo que da un total de aproximadamente 1.97M pasos por billón de tokens. El checkpoint `54.00B_step27466.pt` corresponde al final de la fase estable y es el punto de bifurcación para cualquier re-decaimiento o continuación.

El entrenamiento se realiza sobre un backbone compartido de solo C4, y las ramas se diferencian únicamente en el momento en que se activa el código. Las ramas con presupuestos de 2.5, 5 y 10 mil millones de tokens extraen datos del pool `code_train` de 7.0B tokens, y están emparejadas token a token entre sí. La rama de 18B utiliza el pool `code_combined14B_train` (14B tokens), cuyo mayor tamaño re-permuta el flujo de datos, por lo que solo está emparejada internamente. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; es un entrenamiento puramente de modelado de lenguaje.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje entrenado en C4, puede generar texto coherente en inglés y probablemente en otros idiomas presentes en el corpus.
- Generación de código: las ramas incluyen datos de código, por lo que el modelo tiene cierta capacidad de completar o generar fragmentos de código, aunque no se han publicado evaluaciones específicas.
- Razonamiento básico: como cualquier modelo de 1B, puede realizar tareas simples de razonamiento y comprensión lectora, pero sin garantías de robustez.
- Continuación de entrenamiento: al incluir el estado completo del optimizador, el checkpoint permite reanudar el entrenamiento desde el punto exacto de 54.0B tokens, lo que es útil para experimentos de decaimiento o extensión.
- Soporte de tool calling y agentes: no disponible, no se menciona ninguna capacidad de este tipo.
- Multilingüismo: no se especifica, pero C4 es predominantemente inglés, por lo que el rendimiento en otros idiomas es incierto.

## Casos de uso

- Investigación en curricula de datos: el checkpoint permite estudiar cómo el momento de introducción del código afecta al rendimiento final, comparando las diferentes ramas (2.5B, 5B, 10B, 18B) desde el mismo punto de partida.
- Experimentos de decaimiento de LR: al ser el punto pre-decay, se puede probar diferentes estrategias de decaimiento (lineal, coseno, WSO) y medir su impacto en la convergencia.
- Fine-tuning para tareas específicas: el modelo de 1B es lo suficientemente pequeño para fine-tuning en una GPU consumer, y puede adaptarse a tareas de generación de código o texto con datasets pequeños.
- Replicación de experimentos: los configs reproducibles (`gen_configs_wsd_1B_60B_b*.py`) permiten a otros investigadores replicar el entrenamiento completo o bifurcar desde este checkpoint.
- Benchmarking de eficiencia: al ser un modelo de 1B con contexto 2048, es adecuado para probar técnicas de cuantización, destilación o aceleración en entornos con recursos limitados.
- Análisis de transferencia de código: comparar el rendimiento en tareas de programación entre las ramas con distinto presupuesto de código para entender la relación entre cantidad de datos de código y habilidad resultante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que es un "backup de durabilidad, no una publicación", por lo que no se proporcionan métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.

## Requisitos de hardware

- Inferencia: los pesos del modelo de 1B en fp32 ocupan aproximadamente 4 GB, y en fp16 unos 2 GB. Con cuantización a int8, cabría en ~1 GB de VRAM. Por tanto, es ejecutable en GPUs consumer como RTX 3060, RTX 4060, GTX 1080 Ti, etc., con suficiente memoria (≥4 GB).
- Entrenamiento/continuación: el checkpoint incluye estado del optimizador (12.14 GB), por lo que para continuar el entrenamiento se necesitaría al menos 16 GB de VRAM (para el modelo + estado en fp32). El autor menciona que el entrenamiento original usó 8x H100 (80 GB cada una), pero eso es para el presupuesto completo de 60B tokens; para una continuación corta, una GPU con 24 GB (RTX 3090/4090) podría ser suficiente si se usa mixed precision.
- Opciones de despliegue: al ser un checkpoint de PyTorch, se puede cargar directamente con `torch.load` y usar con transformers si se adapta la configuración de Pythia. Para inferencia en producción, se podría convertir a GGUF para llama.cpp u Ollama, o a safetensors para vLLM, aunque no se proporcionan conversiones oficiales.
- Latencia y throughput: no disponible, pero para un modelo de 1B en una GPU moderna se espera una latencia de decodificación de ~20-50 ms por token en fp16, y un throughput de cientos de tokens por segundo con batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| midtrain-bridge-1B-wsd-predecay | ~1.0B | 2048 | Apache 2.0 | .pt | Checkpoint intermedio, no final |
| Pythia-1B (original) | ~1.0B | 2048 | Apache 2.0 | safetensors | Modelo final entrenado en Pile |
| TinyLlama-1.1B | 1.1B | 2048 | Apache 2.0 | safetensors, GGUF | Modelo final, entrenado en 3T tokens |

No se dispone de benchmarks comparativos entre estos modelos, por lo que no es posible afirmar cuál tiene mejor rendimiento. La principal diferencia es que este checkpoint no es un modelo final, sino un punto intermedio para investigación.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo listo para producción. No ha sido evaluado en tareas estándar y puede presentar comportamientos erráticos.
- El entrenamiento se realizó sobre C4, que contiene sesgos y contenido no filtrado; el modelo puede reflejar esos sesgos.
- No se garantiza la calidad de la generación de código, ya que no hay benchmarks que lo confirmen.
- El checkpoint solo cubre el punto de 54.0B tokens; no incluye los pesos finales de 60B (que son solo pesos, sin estado del optimizador).
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo intermedio, su utilidad comercial es limitada sin fine-tuning adicional.
- El tamaño del repo (24.3 GB) se debe al estado del optimizador; si solo se necesitan los pesos, se puede extraer el estado del modelo para reducir el espacio.
- No se proporcionan instrucciones de uso ni ejemplos de carga; se requiere conocimiento técnico para manejar el checkpoint.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Impliedhomeland/midtrain-bridge-1B-wsd-predecay
- Dataset asociado (mencionado en la model card): `Impliedhomeland/midtrain-bridge-data` (https://huggingface.co/Impliedhomeland/midtrain-bridge-data)
- Configs reproducibles: referenciados como `WSD/datamatched/gen_configs_wsd_1B_60B_b*.py` en el repositorio del proyecto, pero no se proporciona URL directa.
