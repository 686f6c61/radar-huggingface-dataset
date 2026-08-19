# borisggg/steering-denoiser-gpt2

## Resumen

El modelo `borisggg/steering-denoiser-gpt2` es un módulo de denoising de activaciones diseñado para reparar el daño que la técnica de *activation steering* produce en el *residual stream* de GPT-2 small. Fue desarrollado por borisggg como parte de la asignación de *Mechanistic Interpretability* de T-Lab 2026, y se publica bajo licencia MIT. El problema que resuelve es concreto: al aplicar *steering* con `h~ = h + alpha * v`, las activaciones se alejan del manifold natural del modelo y la fluidez del texto generado se degrada. Este denoiser, definido como `D(x) = x - f(x)`, aprende a mapear la activación corrupta de vuelta hacia ese manifold, actuando como un modelo de score de un paso sobre activaciones según la identidad de Tweedie.

La arquitectura es un pequeño MLP residual de 11,7 millones de parámetros, compuesto por dos bloques pre-LN con *hidden* 4x, entrenado sobre 758.038 activaciones de la capa 6 (resid_post) de GPT-2 small. El modelo se condiciona por un nivel de corrupción `t` y requiere que las activaciones estén centradas a lo largo de `d_model`, siguiendo la convención de TransformerLens. Su relevancia actual radica en que ofrece una solución ligera y eficiente para mejorar la calidad de las técnicas de *steering* en modelos de lenguaje, un área activa de investigación en interpretabilidad mecánica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP residual (2 bloques pre-LN, hidden 4x) |
| Parametros totales | 11,7 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (opera sobre activaciones, no sobre texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (hereda del modelo base GPT-2, pero no se especifica) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

El denoiser se compone de dos bloques MLP residuales con normalización pre-LN y una dimensión oculta cuatro veces mayor que la de entrada. La función de denoising se define como `D(x) = x - f(x)`, donde `f(x)` es la salida de la red. Se entrena minimizando el error cuadrático medio entre la activación limpia `h` y la salida del denoiser aplicado a una versión corrupta `corrupt(h)`, con la corrupción generada mediante el método C4 (una mezcla de 256 direcciones de *steering* con `alpha_max = 3.0`). El entrenamiento se realizó sobre 758.038 activaciones centradas (excluyendo el *attention sink*) de la capa 6 de GPT-2 small, con 4000 pasos y un *batch* de 4096. El MSE en validación fue de 0.024, lo que supone una reducción del 99,92% respecto a no hacer nada con la corrupción.

Una innovación clave es que, por la identidad de Tweedie, un denoiser óptimo en MSE satisface `D(x) = x + sigma^2 * grad log p(x)`, lo que lo convierte en un modelo de score de un paso sobre el espacio de activaciones. Esto lo posiciona como una alternativa económica al *prior* de *flow-matching* utilizado en GLP (arXiv 2602.06964). El autor destaca que la corrupción estructurada (C4) es esencial: el mismo denoiser entrenado con ruido gaussiano isotrópico no supera al *steering* simple en ningún presupuesto de perplejidad.

## Capacidades

- Reparación de activaciones *steered*: restaura la fluidez del texto generado por GPT-2 small cuando se aplica *activation steering* en la capa 6.
- Mejora de la expresión de conceptos: en la evaluación, el denoiser logra una tasa de activación de concepto un 10% superior al *steering* simple, con una perplejidad un 22% menor.
- Condicionamiento por nivel de corrupción: acepta un parámetro `t` que ajusta la intensidad del denoising, permitiendo adaptarse a diferentes valores de `alpha`.
- Compatibilidad con activaciones centradas: diseñado para trabajar con la convención de TransformerLens (`center_writing_weights=True`), lo que facilita su integración en pipelines de interpretabilidad existentes.
- Ligereza computacional: con solo 11,7 millones de parámetros, puede ejecutarse en CPU o GPU de gama baja sin impacto significativo en el rendimiento.
- Uso como módulo auxiliar: no es un modelo de lenguaje completo, sino un componente que se inserta entre la capa 6 y el resto de GPT-2 para corregir activaciones.

## Casos de uso

- Investigación en interpretabilidad mecánica: el denoiser permite estudiar cómo el *steering* afecta al *residual stream* y cómo restaurar la distribución natural de activaciones, facilitando análisis más precisos de los mecanismos internos del modelo.
- Mejora de técnicas de *activation steering* en producción: al reducir la perplejidad inducida por el *steering*, se puede aplicar esta técnica en aplicaciones de generación controlada de texto (por ejemplo, ajustar el tono o el tema) sin sacrificar fluidez.
- Validación de hipótesis sobre el manifold de activaciones: al ser un modelo de score de un paso, puede usarse para estimar la densidad de activaciones y comprobar si ciertos vectores de *steering* se alejan del manifold esperado.
- Entrenamiento de *sparse autoencoders* (SAE): el denoiser puede servir como *post-procesador* para limpiar las activaciones reconstruidas por SAEs, mejorando la fidelidad de las características extraídas.
- Benchmarking de métodos de corrupción: la comparación entre corrupción C4 y ruido gaussiano isotrópico ofrece un marco para evaluar qué tipo de perturbaciones son más realistas en el espacio de activaciones.
- Integración en pipelines de *interpretability* con TransformerLens: al seguir la convención de centrado, puede incorporarse fácilmente en flujos de trabajo existentes que ya usan esta librería, sin necesidad de adaptaciones adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que el modelo no es un LLM generativo sino un módulo de denoising. Sin embargo, la model card incluye una evaluación específica sobre 6 *features* de SAE *held-out* y 32 prompts de GPT-2 small, con los siguientes resultados:

| Metodo | alpha | Perplejidad | Tasa de activacion de concepto |
|---|---|---|---|
| *Steering* simple (`h + alpha*v`) | 1.0 | 193 | 0.161 |
| **Denoiser propuesto** | **0.75** | **151** | **0.176** |

La referencia sin *steering* tiene una perplejidad de 121.5. El denoiser mejora ambos ejes: un 10% más de expresión de concepto y un 22% menos de perplejidad. El autor advierte que el MSE *held-out* (0.024) está medido sobre la distribución de corrupción de entrenamiento y puede estar favorecido por la simplicidad de la tarea (solo 256 direcciones), por lo que el resultado relevante es el de la tabla anterior, obtenido con vectores de *steering* nunca vistos durante el entrenamiento.

## Requisitos de hardware

- VRAM estimada: con 11,7 millones de parámetros, el modelo ocupa aproximadamente 47 MB en float32 y 23 MB en float16. Puede ejecutarse en cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU sin problemas de memoria.
- GPU recomendadas: cualquier GPU *consumer* moderna (por ejemplo, NVIDIA GTX 1060 o superior) es suficiente. No requiere GPUs de datacenter.
- Compatibilidad con *consumer*: sí, es extremadamente ligero y puede correr en laptops o incluso en dispositivos edge.
- Opciones de despliegue: al ser un módulo PyTorch, puede integrarse directamente en scripts de Python. No se mencionan formatos como ONNX o TensorRT, pero al ser un MLP pequeño, la conversión sería trivial.
- Latencia y throughput: no se proporcionan datos específicos, pero dado el tamaño, la inferencia es del orden de microsegundos por *forward pass* en GPU, y de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma categoría (denoisers de activaciones para *steering*). El autor menciona que el *prior* de *flow-matching* de GLP (arXiv 2602.06964) es una alternativa conceptual, pero no se proporcionan datos de rendimiento comparativo. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Entrenado y evaluado únicamente en GPT-2 small, capa 6 (resid_post). No se ha probado su transferencia a otros modelos, capas o familias de vectores de *steering*.
- Requiere que las activaciones estén centradas a lo largo de `d_model` (convención de TransformerLens con `center_writing_weights=True`). Alimentar activaciones sin centrar produce resultados incorrectos.
- El parámetro de condicionamiento `t` debe ajustarse al valor de `alpha` usado en el *steering*; usar `t=1` por defecto aplica el máximo denoising y puede degradar activaciones ligeramente *steered*.
- La corrupción de entrenamiento (C4) es esencial; el denoiser no funciona con ruido gaussiano isotrópico, lo que limita su generalización a otros tipos de perturbación.
- Evaluado solo con prompts cortos y abiertos; no se ha validado en tareas de generación larga o dominios específicos.
- Riesgo de alucinación: al ser un módulo auxiliar, no genera texto directamente, pero si se usa con GPT-2, hereda los sesgos y limitaciones del modelo base.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantías de soporte ni de rendimiento en entornos de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/borisggg/steering-denoiser-gpt2
- Repositorio de código y reporte completo: https://github.com/bborisggg/steering-denoiser
