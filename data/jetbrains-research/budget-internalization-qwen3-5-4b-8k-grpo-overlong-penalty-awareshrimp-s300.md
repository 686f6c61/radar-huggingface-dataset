# JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-overlong-penalty-awareshrimp-s300

## Resumen

El modelo `budget-internalization-qwen3.5-4b-8k-grpo-overlong-penalty-awareshrimp-s300` es un ajuste fino por aprendizaje por refuerzo (RL) del modelo base Qwen/Qwen3.5-4B, desarrollado por JetBrains-Research. El objetivo del entrenamiento es que el modelo aprenda a resolver problemas de razonamiento matematico operando bajo un presupuesto fijo de generacion de 8.192 tokens, internalizando esa restriccion en lugar de depender de escalado en tiempo de inferencia (test-time scaling). Se trata de un experimento de investigacion publicado junto al paper *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*.

El modelo parte de una arquitectura Qwen3.5 de aproximadamente 4.539 millones de parametros (4,54 mil millones), con pesos en BF16, y se entrena con GRPO aplicando una penalizacion suave por exceso de longitud (DAPO soft overlong penalty) sobre los ultimos 512 tokens antes de alcanzar el limite. El dataset empleado es DeepScaleR (matematicas), con un maximo de tres epocas y 300 pasos de entrenamiento.

Es relevante ahora porque aborda un problema practico: los modelos de razonamiento suelen mejorar al permitirles generar cadenas de pensamiento mas largas, lo que dispara coste y latencia. Este ajuste busca que el modelo mantenga precision dentro de un presupuesto acotado, un compromiso util para despliegues en produccion con requisitos estrictos de tokens. Aunque la model card declara el pipeline `image-text-to-text` (heredado del modelo base), el entrenamiento y la evaluacion descritos se centran exclusivamente en matematicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer decoder-only, segun modelo base) |
| Parametros totales | 4.539.265.536 (~4,54 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (presupuesto de generacion entrenado: 8.192 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen/Qwen3.5-4B, un transformer decoder-only de unos 4,54 mil millones de parametros. El entrenamiento emplea GRPO (Group Relative Policy Optimization) con la penalizacion suave por exceso de longitud de DAPO: la recompensa se penaliza linealmente, hasta -1,0, sobre los ultimos 512 tokens antes de alcanzar el presupuesto de 8.192 tokens de generacion (`max_new_tokens`). La recompensa principal es binaria, basada en la correccion de la respuesta extraida de las etiquetas `\boxed{}`.

Los datos provienen del dataset DeepScaleR (agentica-org/DeepScaleR-Preview-Dataset), orientado a matematicas, con un maximo de tres epocas. La configuracion de entrenamiento usa lotes de 32 prompts con 8 rollouts por paso, optimizador Adam con schedule coseno de LR, pico de 5e-7 y 10 pasos de calentamiento, durante 300 pasos. El checkpoint publicado corresponde al paso 300. La innovacion tecnica central es la internalizacion del presupuesto: el modelo aprende a producir razonamientos que caben en el limite fijado, en lugar de beneficiarse de generar indefinidamente en tiempo de inferencia.

## Capacidades

- Razonamiento matematico con cadenas de pensamiento paso a paso bajo un presupuesto de 8.192 tokens.
- Extraccion de respuestas finales en formato `\boxed{}`, coherente con el entrenamiento recibido.
- Generacion de texto conversacional mediante la plantilla de chat del modelo base.
- Capacidad multimodal image-text-to-text declarada en los metadatos (heredada del modelo base), aunque no se documenta su entrenamiento especifico en esta ficha.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente; el modelo esta orientado a razonamiento matematico de un solo problema.
- Capacidades multilingues: no disponible.
- Modo "thinking" explicito con instruccion de razonamiento paso a paso (segun el prompt de entrenamiento).

## Casos de uso

- Resolucion de problemas matematicos en produccion con coste acotado: el modelo esta entrenado para responder dentro de 8.192 tokens, lo que permite presupuestar coste y latencia por consulta sin depender de truncamientos externos.
- Evaluacion comparativa de estrategias de razonamiento: util como checkpoint de referencia en experimentos sobre internalizacion de presupuesto frente a modelos que escalan en tiempo de inferencia.
- Generacion de soluciones paso a paso para plataformas educativas: el formato de razonamiento explicito y la respuesta en `\boxed{}` facilitan la presentacion y verificacion automatica de resultados.
- Pipelines de verificacion automatica de respuestas: la extraccion de `\boxed{}` permite comprobar correccion de forma programatica, integrable en sistemas de correccion de ejercicios.
- Investigacion sobre RL para LLM: sirve como punto de partida reproducible (GRPO, DAPO penalty, DeepScaleR) para estudiar efectos de penalizaciones de longitud.
- Despliegue en entornos con GPU de gama media: con ~4,54 mil millones de parametros en BF16, encaja en escenarios donde modelos mayores no caben, siempre que se valide su rendimiento real.
- Experimentos de ablation sobre el presupuesto de tokens: al estar entrenado a 8k, permite comparar comportamiento frente a variantes con otros presupuestos del mismo autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el tamano (4,54 mil millones de parametros), en BF16 se situaria en torno a 9-10 GB solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits aproximadamente 5-6 GB y en 4 bits aproximadamente 3-4 GB. Estas cifras son estimaciones, no datos publicados.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: probable en GPUs con VRAM suficiente para el formato elegido (por ejemplo, modelos de 12-16 GB en BF16 o 8 GB en cuantizacion 4 bits), pero no confirmado por el autor.
- Opciones de despliegue: la libreria declarada es transformers; vLLM, llama.cpp, Ollama o TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-4B + GRPO 8k) | ~4,54 mil millones | no disponible (presupuesto de generacion 8.192) | GRPO + DAPO overlong penalty, DeepScaleR | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | ~4,54 mil millones | no disponible | preentrenamiento + ajuste del autor original | segun modelo base | Hugging Face |
| Otros checkpoints del mismo autor (otros presupuestos/petnames) | ~4,54 mil millones | no disponible | variantes de GRPO | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente para matematicas (DeepScaleR); su rendimiento fuera de ese dominio no esta documentado y probablemente sea inferior al del modelo base.
- Riesgo de alucinacion en razonamientos largos, especialmente cerca del limite de 8.192 tokens, donde la penalizacion de longitud puede empujar a respuestas apresuradas.
- Presupuesto fijo de generacion: si se configura un `max_new_tokens` distinto del entrenado, el comportamiento puede degradarse respecto al objetivo de internalizacion.
- Sesgos conocidos: no documentados; hereda los sesgos del modelo base y de los datos de entrenamiento.
- Limitaciones de idioma: no se especifican idiomas soportados; el prompt de entrenamiento esta en ingles.
- Restricciones de licencia: Apache 2.0, heredada del modelo base, permite uso comercial con las condiciones de la licencia; conviene verificar la licencia exacta del Qwen/Qwen3.5-4B.
- Modelo de investigacion con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni validacion externa.
- La model card no incluye resultados de evaluacion ni cita bibliografica completa (campo Citation marcado como TODO), lo que limita la reproducibilidad de las afirmaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-overlong-penalty-awareshrimp-s300
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Paper citado en la model card: *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy* (enlace no disponible en la informacion proporcionada)
- Repositorio de codigo o demo: no disponible
- Organizacion en Hugging Face: https://huggingface.co/JetBrains-Research
