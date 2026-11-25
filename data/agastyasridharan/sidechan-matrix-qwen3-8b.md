# agastyasridharan/sidechan-matrix-qwen3-8b

## Resumen
Sidechan-matrix-qwen3-8b es un artefacto de investigación en interpretabilidad mecánica publicado por el usuario agastyasridharan sobre el modelo base Qwen/Qwen3-8B. No es un modelo conversacional: es un conjunto de detectores entrenados (las dos últimas capas del transformer, bloques 34–35 más la normalización final) que responden a una pregunta concreta: ¿puede la parte alta de un modelo de lenguaje inferir, a partir de su propio residual stream, cómo se calcularon las capas inferiores? Para cada fila de una matriz experimental (ruido de activación, cuantización int4, tensor parallelism, CUDA graphs, decodificación especulativa, tipo de GPU, centro de datos, etc.) se entrena un detector que dice "Sí" cuando la opción está activa en los bloques 0–33 y "No" cuando está desactivada.

El interés técnico radica en que cuantifica qué decisiones de despliegue dejan huella detectable en las activaciones y cuáles son bit a bit idénticas. Los resultados distinguen tres regímenes: cambios que alteran mucho los números (int4 en pesos o KV cache, W8A8, AWQ/GPTQ) se detectan casi perfectamente y de forma robusta; cambios que solo modifican el redondeo interno de los kernels se detectan bien en prompts parecidos a los de entrenamiento pero son frágiles ante perturbaciones mínimas; y cambios que no alteran nada (extracción de hidden states de vLLM, decodificación especulativa dentro de vLLM) son indetectables por construcción.

El repositorio ocupa 53,4 GB e incluye pesos de detectores en safetensors (~0,77 GB en bf16 cada uno), ficheros de resultados, logs y la matriz consolidada. La licencia es Apache 2.0 y hereda las condiciones del modelo base Qwen3-8B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3-8B); el artefacto contiene solo bloques 34–35 + final norm como detector |
| Parametros totales | 8B (modelo base Qwen3-8B); detector ~0,77 GB en bf16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-8B, no declarada en la model card) |
| Tipos de cuantizacion | El artefacto se distribuye en bf16; se evalúan configuraciones int4 de pesos, int4/FP8 de KV cache y W8A8 en los experimentos |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`results/<job>/tail_s0.safetensors`) |

## Arquitectura y entrenamiento
El detector reutiliza los bloques 34 y 35 más la normalización final de Qwen3-8B y se afina con cross-entropy sobre todo el vocabulario aplicado al residual stream que entra en el bloque 34 (receta "tailexp" de Sauers). Hiperparámetros declarados: learning rate 2e-5, 1024 pasos con 8 pares por paso, en bf16 sobre H100 80GB HBM3. La métrica principal es `both_right`: fracción de prompts de validación en los que el detector acierta "Sí" con la opción activa y "No" con la opción desactivada (0 = sin detección, 1 = perfecto; una respuesta constante puntúa 0).

La matriz experimental cubre opciones de serving y entrenamiento: ruido de activación, cuantización int4 de pesos y de KV cache, FP8 KV, W8A8, evicción de KV, activation steering, AWQ/GPTQ en vLLM, tamaño de batch, tokens por pasada, kernels batch-invariant, batches con padding, decodificación especulativa (HF y vLLM), tensor parallelism, LoRA sin fusionar, tipo de GPU, historial forjado, sonda compilada y ruido de activación pequeño. Para cada fila se evalúan cuatro ejes: tamaño del cambio (fracción de prompts con logits alterados y cambio relativo mediano del residual), detección (sonda lineal y tail fine-tuned, en modo cacheado y end-to-end), robustez (flip del bit menos significativo en 0,01% de pesos bf16, ruido gaussiano a escala 1e-3, 64 pasos de LoRA sobre Alpaca fusionados) y generalización (reformulaciones, longitudes, system prompts, otra GPU A100-SXM4-80GB). El eje de ocultación aplica cambios baratos en los bloques inferiores (cómputo en fp32, flip de LSB en 10% de valores del residual tras cada bloque, reutilización de las tres primeras posiciones desde KV cache) y reentrena el detector desde cero para medir si la señal persiste.

## Capacidades
- Detección de decisiones de serving y entrenamiento a partir del residual stream del bloque 34 de Qwen3-8B.
- Clasificación binaria por fila de la matriz (opción activa vs. desactivada) con puntuación `both_right` sobre prompts de validación.
- Evaluación de robustez frente a perturbaciones de pesos (LSB flip, ruido gaussiano, LoRA fusionado).
- Evaluación de generalización a reformulaciones, longitudes, system prompts y tipo de GPU (A100 vs. H100).
- Evaluación de ocultación bajo transformaciones baratas en los bloques inferiores.
- Soporte de ejecución en HF eager, vLLM 0.33, torch 2.10 compilado y configuraciones de dos máquinas.
- No es un modelo generativo de propósito general: no se declaran capacidades de tool calling, agentes, visión ni audio.

## Casos de uso
- Auditoría de pipelines de cuantización: entrenar un detector para int4 en pesos o KV cache y usarlo para verificar que un despliegue concreto aplica realmente la cuantización esperada, ya que estos detectores alcanzan puntuaciones cercanas a 1,0 y se mantienen tras cambios de redacción y de GPU.
- Verificación de configuraciones de serving: distinguir si un endpoint sirve con tensor parallelism, CUDA graphs o kernels batch-invariant, aprovechando que las diferencias a nivel de vLLM sobreviven mejor al flip de LSB (0,7–0,9) que las de HF (cerca de 0).
- Investigación en interpretabilidad: usar la matriz como banco de pruebas para estudiar qué información sobre el cómputo inferior es linealmente accesible desde las capas altas y cómo de frágil es esa señal.
- Detección de manipulación de historial: la fila de "historial forjado" permite estudiar si el modelo puede distinguir un historial de conversación reconstruido del original.
- Estudio de robustez de sondas: comparar sonda lineal frente a tail fine-tuned bajo perturbaciones controladas para decidir qué técnica usar en monitorización.
- Análisis de ocultación: evaluar si transformaciones baratas (fp32, LSB en el residual, reutilización de KV) eliminan la señal, con resultados que muestran que fp32 oculta casi por completo (0,02 o menos) salvo en kernels batch-invariant (0,32).
- Reproducibilidad de experimentos: los ficheros `result.json`, logs y `MATRIX.md` permiten recalcular la matriz con `scripts/collate.py`.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible en el sentido habitual (MMLU, HumanEval, GSM8K). Los resultados publicados son métricas internas de detección (`both_right`) sobre la matriz experimental. Algunos valores citados en la model card:

| Grupo | Comportamiento declarado |
|---|---|
| int4 pesos, int4/FP8 KV, W8A8, evicción KV, steering, AWQ/GPTQ | Detección casi perfecta; robustos a reformulaciones y a A100; ≥0,98 con detector reentrenado bajo cuatro cambios baratos de ocultación; detector de int4 KV sigue en 1,00 tras 64 pasos de fine-tuning |
| Cambios solo de redondeo en kernels (batch size, tokens por pasada, batch-invariant, padding, especulativa en HF, tensor parallelism, LoRA sin fusionar, GPU, historial forjado, sonda compilada, ruido pequeño) | A menudo ≥0,9 en prompts similares a entrenamiento; caen a cerca de 0 tras flip de LSB en 0,01% de pesos; rara vez transfieren a prompts largos, system prompts u otra GPU |
| Cambios sin efecto (hidden states de vLLM, especulativa en vLLM, copia de buffer en compile determinista, dos H100 en centros distintos) | Indetectables: activaciones bit a bit idénticas |
| Casos intermedios | `hidden_states=True` y hook en grafo compilado: 0,4–0,7; fp16 y autocast: ~0,5 tras flip de LSB |

Advertencia del autor: los conjuntos de test son de 64–128 prompts con una sola semilla de entrenamiento, por lo que diferencias inferiores a 0,1 no deben interpretarse como reales.

## Requisitos de hardware
- VRAM para cargar el detector: ~0,77 GB en bf16, pero requiere cargar Qwen3-8B completo y sustituir `model.layers[34:36]` y `model.norm`, por lo que en la práctica se necesita VRAM para el modelo base (aproximadamente 16 GB en bf16, 8–10 GB en cuantización de 8 bits, según configuración; no declarado en la model card).
- GPU de entrenamiento declarada: H100 80GB HBM3; evaluación cruzada en A100-SXM4-80GB.
- Cabe en GPU de consumo si se carga el modelo base cuantizado, aunque la model card no documenta esta configuración.
- Opciones de despliegue evaluadas: HF eager (`scm/run.py`), vLLM 0.33 (`scm/vllm/`), torch 2.10 compilado (`scm/compiled/`) y configuraciones de dos máquinas (`scm/hostcap.py`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No disponible. No se han identificado en la información proporcionada artefactos comparables de detectores de side-channels sobre modelos de 8B con matriz experimental publicada. Como referencia del modelo base:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sidechan-matrix-qwen3-8b (este artefacto) | 8B base; detector ~0,77 GB | no disponible | apache-2.0 | Hugging Face |
| Qwen/Qwen3-8B (base) | 8B | no disponible en esta ficha | apache-2.0 (según tag del repo) | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- No es un modelo de chat ni de generación: es un conjunto de detectores y resultados experimentales; no debe desplegarse como asistente.
- Los tests usan 64–128 prompts y una sola semilla de entrenamiento; diferencias por debajo de 0,1 no son fiables.
- Los detectores del segundo grupo (redondeo en kernels) son frágiles: el flip del bit menos significativo en 0,01% de los pesos los lleva cerca de 0 y rara vez generalizan a system prompts, longitudes distintas u otra GPU.
- Cómputo en fp32 en los bloques inferiores oculta la señal incluso a un detector reentrenado (0,02 o menos), salvo en kernels batch-invariant (0,32).
- Los resultados de ocultación se truncan en la model card proporcionada ("a random to…"), por lo que el cuarto cambio de ocultación no está documentado aquí.
- Riesgo de alucinación y sesgos: no aplica al artefacto como generador, pero el modelo base Qwen3-8B los presenta y no se han caracterizado en esta ficha.
- Idiomas soportados no declarados; la matriz se evalúa con prompts en inglés presumiblemente, sin especificación.
- Licencia Apache 2.0 en el artefacto, con las condiciones heredadas del modelo base Qwen3-8B; verificar términos del base antes de uso comercial.
- El repositorio pesa 53,4 GB, lo que condiciona su descarga y almacenamiento.
- Cero descargas y cero likes en el momento de la consulta: no hay validación comunitaria independiente.

## Enlaces
- Hugging Face: https://huggingface.co/agastyasridharan/sidechan-matrix-qwen3-8b
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Código citado por el autor: `~/j-lens/sidechan_matrix` (paquete `scm/`), sin URL pública en la información disponible
- Referencia a la receta "tailexp" de Sauers: sin URL en la información disponible
- Papers, blogs y demos adicionales: no disponibles
