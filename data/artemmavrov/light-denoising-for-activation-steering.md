# artemmavrov/light-denoising-for-activation-steering

## Resumen

El modelo `artemmavrov/light-denoising-for-activation-steering` es un denoiser de activaciones diseñado para reparar el daño que el *activation steering* produce en el *residual stream* de un modelo de lenguaje. Fue desarrollado por artemmavrov como una alternativa ligera al modelo de *flow matching* de GLP: mientras que ese enfoque requiere entre 0.5 y 3.3 mil millones de parámetros y 20 pasadas por token, este denoiser emplea solo 55 millones de parámetros y una única pasada, lo que supone un coste adicional de apenas un 4.46% de los FLOPs de una pasada del modelo base.

Está entrenado sobre 8 millones de activaciones de `blocks.7.hook_resid_post` de Llama-3.2-1B, el mismo punto de intervención que utiliza GLP. Las direcciones de *steering* proceden del *sparse autoencoder* `chanind/sae-llama-3.2-1b-topk-res` (d_sae 16384, top-k 10). El modelo actúa como una pinza suave aprendida: elimina un 81% del componente de *steering* en la dirección del vector intervenido, pero mantiene la activación resultante a una distancia de Mahalanobis constante (37–39) respecto a la distribución limpia, mientras que la activación intervenida sin corregir se aleja de 53 a 122. De este modo, no deshace la intervención, sino que devuelve un nivel de característica imposible a uno plausible.

La relevancia de este modelo reside en que permite aplicar *activation steering* a modelos de lenguaje sin la degradación típica del texto generado (repetición, pérdida de coherencia) y con un coste computacional muy bajo, lo que facilita su uso en experimentos de interpretabilidad y control de generación en entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResMLP K=2 m=2 condicionado por la fuerza del *steering* (denoiser de activaciones) |
| Parametros totales | 55 072 897 (checkpoint principal `F_cond_N8.pt`); 29 910 000 (variante `F_cheap_N8.pt`) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo generativo) |
| Tipos de cuantizacion | No disponible (entrenado en fp16, sin cuantización publicada) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (archivos `.pt`) |

## Arquitectura y entrenamiento

El modelo es un *denoiser* de arquitectura ResMLP con dos capas internas (K=2, m=2), condicionado por la fuerza de intervención (`alpha`). Se entrena para predecir la activación limpia a partir de la activación intervenida, minimizando la distancia en el espacio de residuos. El entrenamiento se realizó sobre 8 millones de activaciones extraídas de `blocks.7.hook_resid_post` de Llama-3.2-1B, con direcciones de *steering* generadas mediante el SAE de `chanind/sae-llama-3.2-1b-topk-res` (l0=10, varianza explicada 61.8%).

Como innovación técnica destacable, el denoiser realiza una única pasada por token (frente a las 19 pasadas adicionales que requiere el modelo de *flow matching* de GLP con el mismo presupuesto de parámetros). Además, requiere un `scaler.pt` obligatorio que normaliza las dimensiones por desviación estándar; sin él, los checkpoints producen resultados inutilizables. El modelo admite varios esquemas de corrección: `C0` (steering simple), `C1` (denoising completo), `C2` (parcial), `C5` (preservador de norma) y `C6` (multi-paso). El entrenamiento se realizó en fp16 sobre una GPU Tesla T4.

## Capacidades

- **Corrección de activaciones intervenidas**: repara el *residual stream* tras aplicar *activation steering* en la capa 7 de Llama-3.2-1B, reduciendo la degeneración del texto generado.
- **Restauración de plausibilidad**: mantiene la activación corregida a una distancia de Mahalanobis constante (37–39) respecto al conjunto limpio, mientras que la activación intervenida sin corregir se aleja hasta 122.
- **Control de la intensidad del steering**: el modelo es condicionado por el valor de `alpha` (fuerza de intervención), lo que permite ajustar el grado de corrección en tiempo de inferencia.
- **Multiples esquemas de corrección**: implementa los modos `C0`, `C1`, `C2`, `C5` y `C6` para adaptarse a distintos escenarios de intervención.
- **Integración con SAE**: funciona con las direcciones de steering extraídas de un sparse autoencoder top-k (d_sae 16384, top-k 10), lo que permite seleccionar características específicas del modelo.
- **Bajo coste de inferencia**: una sola pasada por token, con un 4.46% de FLOPs adicionales respecto al forward del modelo de lenguaje base.
- **Variante ligera**: `F_cheap_N8` con 29.9M de parámetros y 2.4% de FLOPs adicionales, indistinguible en calidad de generación según el autor.

## Casos de uso

- **Investigación en interpretabilidad**: para estudiar el efecto del *steering* en modelos de lenguaje, permitiendo aislar la influencia de características individuales sin que el texto resultante se vuelva incoherente o repetitivo. Se usaría cargando el denoiser junto con Llama-3.2-1B y aplicando intervenciones controladas con distintas direcciones del SAE.
- **Control de generación en producción**: cuando se quiere forzar ciertos atributos (estilo, tono, temas) en un modelo de generación de texto, el denoiser permite aplicar *steering* de forma robusta sin sacrificar la fluidez del texto. Por ejemplo, en un sistema de asistente conversacional que necesita mantener un tono formal sin caer en repeticiones.
- **Evaluación de direcciones de *steering***: sirve como herramienta para validar qué direcciones de un SAE producen efectos coherentes y cuáles colapsan la generación. El modelo reporta una correlación negativa (−0.62) entre la retención del concepto y la ganancia del denoiser, lo que permite identificar direcciones problemáticas.
- **Reparación de textos intervenidos en pipelines de generación**: si un sistema aplica *steering* en tiempo real para modificar el comportamiento de un LLM, el denoiser actúa como un post-procesador en la capa de activación, mejorando la fluidez sin añadir latencia significativa (una sola pasada).
- **Entrenamiento de modelos de interpretabilidad**: como referencia para comparar con técnicas de corrección más pesadas (flow-matching) o para desarrollar nuevos denoisers para otros modelos o capas.
- **Experimentos de control de atributos**: para producir textos con un atributo concreto (p.ej., positivo vs. negativo) manteniendo la diversidad léxica y sintáctica, usando direcciones de DiffMean o de SAE. El autor reporta que en conceptos DiffMean el denoiser gana en ambos ejes (Δconcept +0.136, NLL 7.31 vs 8.28).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque este modelo no es un LLM generativo, sino un módulo de corrección de activaciones. La model card proporciona métricas específicas de interpretabilidad y control:

| Métrica | Resultado (95% CI, emparejado sobre 32 direcciones) |
|---|---|
| Δrep-3 a r=1.5 (vs. steering simple) | −0.065 [−0.113, −0.025] |
| Δrep-3 a r=2.0 (vs. steering simple) | −0.112 [−0.185, −0.047] (mejora en 28 de 32 direcciones) |
| Δconcept (5 conceptos DiffMean) a r=2 | +0.136 [+0.020, +0.274] |
| NLL con denoiser (r=2) | 7.31 vs 8.28 (steering simple) |

Además, la model card reporta que la ganancia del denoiser es condicional: en direcciones donde el *steering* simple colapsa, el denoiser gana en 16 de 17 direcciones; donde el *steering* se mantiene, gana en 5 de 15. También indica que calibrar `alpha` para que la característica alcance el máximo de su rango natural produce el mismo concepto que el denoiser (0.01945 vs 0.01946) con 1.56 nats menos de NLL y sin coste de inferencia adicional.

## Requisitos de hardware

- **VRAM estimada**: al menos 6 GB libres para cargar Llama-3.2-1B en fp16 junto con el denoiser. El modelo base ocupa aproximadamente 2.5 GB en fp16, y el denoiser ~220 MB.
- **GPU recomendadas**: cualquier GPU con 6 GB o más de VRAM. El autor entrenó el modelo en una Tesla T4 (16 GB). En consumer, una RTX 2060 (6 GB) o superior es suficiente; para entornos con menos VRAM se puede usar la variante `F_cheap_N8` (120 MB).
- **Despliegue**: se integra en un pipeline de PyTorch con hooks de intervención. No se menciona compatibilidad con vLLM, Ollama o llama.cpp. El código de uso directo está disponible en el repositorio GitHub.
- **Latencia**: el denoiser añade una pasada adicional por token, con un coste de 4.46% de FLOPs respecto al forward del modelo base. La latencia adicional es mínima (una única pasada de un MLP de 55M parámetros).
- **Entrenamiento**: el autor entrenó en una Tesla T4 con fp16, lo que indica que el entrenamiento es factible en GPUs de consumo (8-16 GB).

## Comparativa con modelos similares

| Modelo | Parámetros | Pasadas/token | FLOPs vs. una forward LM | Resultado principal |
|---|---|---|---|---|
| `light-denoising-for-activation-steering` (F_cond_N8) | 55.07M | 1 | 4.46% | Mejora Δrep-3 de −0.112 a r=2, con 28/32 direcciones |
| `F_cheap_N8` (variante ligera) | 29.91M | 1 | 2.4% | Indistinguible en generación del principal |
| Flow matching de GLP (mismo presupuesto) | 55.07M | 19 | 84.67% | Mejor calidad teórica, pero coste computacional 19x mayor |
| Calibración de α (sin denoiser) | 0 | 0 | 0% | Mismo concepto que el denoiser (0.01945 vs 0.01946) con 1.56 nats menos NLL y sin coste |

No se dispone de comparación directa con otros denoisers de activaciones en la información proporcionada. El repositorio `DikovAlexandr/ActivationSteeringRepair` existe pero no se especifican sus resultados en esta ficha.

## Limitaciones y advertencias

- **Modelo único**: está entrenado exclusivamente para Llama-3.2-1B en la capa 7 (`blocks.7.hook_resid_post`). No es transferible a otros modelos o capas sin reentrenamiento.
- **SAE específico**: las direcciones de *steering* provienen de un SAE concreto (`chanind/sae-llama-3.2-1b-topk-res` con l0=10 y varianza explicada 61.8%). Otras configuraciones de SAE pueden no ser compatibles.
- **Métricas auto-referenciales**: la métrica de concepto para características SAE es parcialmente auto-referencial, ya que el mismo SAE proporciona la dirección de *steering* y puntúa el texto generado. Esto puede inflar los resultados.
- **Evaluación con LLM-judge retirada**: el criterio de evaluación con un LLM-judge fue retirado por una tasa de falsos positivos de 0.259 y inconsistencia de posición de 0.38. Solo se valida la métrica de fluidez (correlación −0.96 con NLL).
- **Ganancia condicional**: el denoiser no siempre mejora el resultado. En direcciones donde el *steering* simple no colapsa, la ganancia es marginal o negativa (5 de 15 direcciones). En promedio, la ganancia en SAE features es negativa.
- **Formato fp16**: entrenado en fp16, lo que puede limitar la precisión en comparación con bf16, aunque el autor indica que es suficiente para su uso.
- **Licencia**: Apache 2.0, pero el modelo base (Llama-3.2-1B) tiene su propia licencia que puede restringir el uso comercial en algunos casos. El acceso a `meta-llama/Llama-3.2-1B` está restringido; se recomienda el espejo `unsloth/Llama-3.2-1B`.
- **No es un modelo generativo**: no puede usarse directamente para generar texto; requiere el modelo base y el pipeline de intervención.

## Enlaces

- Hugging Face: https://huggingface.co/artemmavrov/light-denoising-for-activation-steering
- Repositorio de código: https://github.com/artemmavrov/light_denoising_for_activation_in_LLM
- SAE utilizado: https://huggingface.co/chanind/sae-llama-3.2-1b-topk-res
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B (espejo: https://huggingface.co/unsloth/Llama-3.2-1B)
- Paper de Activation Engineering (referencia conceptual): https://arxiv.org/abs/2308.10248
