# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-2-step-55000

## Resumen

Este repositorio contiene un checkpoint concreto (`epoch-2-step-55000`) de un modelo de borrador (draft model) para decodificación especulativa, entrenado con el algoritmo EAGLE3 sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`. El autor, `huluhuluu`, lo ha publicado como parte de una colección de 47 checkpoints que cubren desde `epoch_0_step_5000` hasta `epoch_9_step_231810`, todos generados mediante un entrenamiento online con la herramienta SpecForge.

El modelo no es un modelo de lenguaje independiente ni un chatbot. Su única función es servir como modelo auxiliar de borrado rápido (draft) para acelerar la inferencia del modelo objetivo `Qwen3-4B-Instruct-2507` cuando se despliega con SGLang y el algoritmo EAGLE3. Al predecir varias fichas candidatas en paralelo y verificar con el modelo grande, se reduce la latencia por token generado sin degradar la calidad de las respuestas.

Su relevancia actual radica en que la decodificación especulativa se ha convertido en una técnica estándar para reducir costes de inferencia en producción, y EAGLE3 es una de las implementaciones más eficientes. Este checkpoint concreto representa un punto intermedio del entrenamiento (paso 55000 de 231810), por lo que puede ser útil para estudiar la evolución del rendimiento del draft model a lo largo del entrenamiento o para usarlo directamente si se considera suficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder, hidden size 2560, intermediate size 9728, 32 cabezas de atencion, 8 cabezas key/value) |
| Parametros totales | 202.700.416 (draft model) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 (maxima longitud de secuencia usada en entrenamiento; no se aplica ventana deslizante) |
| Tipos de cuantizacion | bfloat16 (pesos originales) |
| Idiomas soportados | no disponible (depende del modelo base Qwen3-4B-Instruct-2507, que es multilingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, config.json, training_state.pt) |

## Arquitectura y entrenamiento

El modelo es un draft model EAGLE3, una arquitectura basada en el esquema de decodificación especulativa EAGLE (Extrapolation Algorithm for Greater Language-model Efficiency). EAGLE3 utiliza una única capa de decoder transformer que toma como entrada las fichas recién generadas y las características ocultas del modelo base para predecir varias fichas candidatas en paralelo. En este caso concreto, la capa tiene hidden size 2560, 32 cabezas de atención y 8 cabezas key/value, con un vocabulario de borrador de 32000 fichas frente a las 151936 del modelo objetivo. Los pesos están en bfloat16.

El entrenamiento se realizó con SpecForge, una herramienta de entrenamiento online para modelos especulativos. El proceso fue un entrenamiento EAGLE3 online sobre el modelo `Qwen/Qwen3-4B-Instruct-2507`, usando como datos un dataset ShareGPT limpio en formato JSONL (revisión no registrada). Se ejecutaron 10 épocas con un total de 231810 pasos de optimización, con un tamaño de lote efectivo global de 4 (tamaño de lote por dispositivo 1, paralelismo de datos 4), learning rate 1e-4 con warmup lineal del 1.5% y posterior annealing coseno, weight decay 0.0 y gradiente máximo 0.5. La longitud máxima de secuencia fue 2048, con una longitud de árbol TTT de 7 para EAGLE3. La atención del borrador usa `sdpa` y el backend objetivo es SGLang con flashinfer. El checkpoint concreto `epoch-2-step-55000` corresponde al paso 55000, dentro de la tercera época.

## Capacidades

- Aceleración de inferencia mediante decodificación especulativa: genera múltiples fichas candidatas en paralelo que son validadas por el modelo base, reduciendo la latencia por token.
- No es un modelo de chat ni de generación autónoma: no puede producir texto por sí mismo, solo funciona emparejado con el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`.
- Compatible con SGLang: se integra como ruta de borrado especulativo (`--speculative-draft-model-path`).
- Permite ajustar parámetros de árbol de borrado: `--speculative-num-steps`, `--speculative-eagle-topk`, `--speculative-num-draft-tokens` para optimizar el equilibrio entre velocidad y aceptación.
- No se registraron métricas de evaluación ni de seguridad para este entrenamiento, por lo que no se puede garantizar su calidad en tareas específicas.

## Casos de uso

- Despliegue de inferencia de baja latencia para Qwen3-4B-Instruct-2507 en producción: al usar este draft model con SGLang y EAGLE3, se puede reducir el tiempo de generación de respuestas en servicios de chat o asistentes virtuales, manteniendo la calidad del modelo base.
- Servidores de generación de texto a gran escala: en entornos con alta concurrencia, la decodificación especulativa permite aumentar el throughput por GPU, ya que el borrador reduce el número de pasos secuenciales del modelo grande.
- Experimentación con decodificación especulativa: este checkpoint concreto (paso 55000) puede usarse para estudiar cómo evoluciona la tasa de aceptación del draft model a lo largo del entrenamiento, comparándolo con otros checkpoints de la misma colección.
- Evaluación de políticas de árbol en EAGLE3: los parámetros de árbol (num-steps, topk, num-draft-tokens) pueden ajustarse y medirse con este modelo para encontrar la configuración óptima para una carga de trabajo específica.
- Investigación sobre modelos de borrador: el repositorio incluye `training_state.pt` con el estado del optimizador y la configuración de entrenamiento, lo que permite reanudar o analizar el proceso de entrenamiento en entornos de confianza.
- Integración en pipelines de inferencia con SGLang: se puede sustituir cualquier draft model previo por este checkpoint para probar mejoras de rendimiento en sistemas existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation or safety metrics were recorded for this run." Por tanto, no hay datos de MMLU, HumanEval, GSM8K ni métricas de tasa de aceptación o speedup para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: el draft model tiene 202,7 millones de parámetros en bfloat16, lo que ocupa aproximadamente 0,4 GB en memoria. Esto es despreciable frente a los ~8 GB del modelo base Qwen3-4B en bf16. Cualquier GPU con al menos 8 GB de VRAM puede ejecutar la combinación completa.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12GB, RTX 4080, RTX 4090) o GPU de datacenter (A10, A100, H100) puede manejar el draft model sin problema. El cuello de botella será siempre el modelo base.
- Despliegue: el modelo está diseñado para usarse con SGLang (backend con flashinfer). También es posible cargarlo con transformers para inspección, pero su uso previsto es como ruta de borrado especulativo en SGLang.
- Latencia y throughput: no hay datos publicados. El rendimiento depende de la tasa de aceptación de las fichas borrador, que a su vez depende de la configuración de árbol y de la distribución de los datos de entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo | Licencia | Uso |
|---|---|---|---|---|---|
| huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-2-step-55000 | 202,7M | 2048 (entrenamiento) | EAGLE3 | Apache-2.0 | Draft model para Qwen3-4B-Instruct-2507 |
| EAGLE-2 (draft models para Llama) | Varía según modelo base | Varía | EAGLE-2 | MIT (según repo) | Draft model para modelos Llama |
| Medusa (draft heads) | ~1-2% del modelo base | Varía | Medusa (cabezas paralelas) | Apache-2.0 | Draft model para modelos diversos |

La comparativa se basa en la categoría de modelos de borrado especulativo. No hay datos de rendimiento comparativo disponibles en la información proporcionada, por lo que no se pueden contrastar numéricamente. La principal diferencia con Medusa es que EAGLE3 utiliza características ocultas del modelo base, mientras que Medusa usa solo embeddings. EAGLE-2 es la versión anterior de EAGLE, que no usa la extrapolación de características de EAGLE3.

## Limitaciones y advertencias

- Este modelo no es un modelo de lenguaje independiente: no puede generar texto ni responder preguntas por sí mismo. Intentar usarlo como un modelo de chat producirá resultados sin sentido.
- No se registraron métricas de evaluación ni de seguridad durante el entrenamiento. No se puede garantizar que el draft model sea robusto frente a entradas adversarias o que no produzca alucinaciones cuando se combina con el modelo base.
- El entrenamiento se realizó con datos ShareGPT, que contienen conversaciones reales de usuarios. Esto puede introducir sesgos o contenido inapropiado en el comportamiento del draft model, aunque al ser un modelo auxiliar su impacto en la salida final es limitado.
- La longitud máxima de secuencia durante el entrenamiento fue 2048. Aunque el modelo no tiene ventana deslizante, su rendimiento fuera de ese rango no está garantizado.
- El checkpoint `training_state.pt` contiene el estado del optimizador y argumentos de entrenamiento; solo debe deserializarse en entornos de confianza, ya que podría contener código ejecutable.
- No se proporcionan métricas de tasa de aceptación ni de speedup para este checkpoint concreto. Es posible que otros checkpoints de la colección ofrezcan mejor rendimiento, especialmente los de épocas posteriores.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 tiene su propia licencia (Qwen License) que debe consultarse por separado.

## Enlaces

- Repositorio del checkpoint: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-2-step-55000
- Repositorio del checkpoint hermano (epoch-2-step-55000 sin "NoWindow"): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-2-step-55000
- Repositorio del checkpoint epoch-7-step-185000: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-7-step-185000
- Modelo base Qwen3-4B-Instruct-2507 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Implementación oficial de EAGLE-Qwen3 en GitHub: https://github.com/Yunhai-Hu/EAGLE-Qwen3
