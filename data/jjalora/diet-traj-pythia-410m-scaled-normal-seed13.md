# jjalora/diet-traj-pythia-410m-scaled-normal-seed13

## Resumen

DIET trajectory: Pythia-410M, init `scaled_normal`, seed 13 es un checkpoint de investigación publicado por el usuario jjalora dentro de la campaña DIET, un estudio de trayectorias de entrenamiento en el espacio de pesos. No es un modelo conversacional ni un asistente: es una reproducción desde cero del receta de preentrenamiento de Pythia-410M de EleutherAI, con la misma arquitectura, el mismo flujo de tokens y el mismo orden de datos, variando únicamente la semilla aleatoria y el esquema de inicialización de pesos (`scaled_normal` en lugar del `small_init` + `wang_init` de GPT-NeoX).

El modelo emplea una arquitectura transformer decoder-only de tipo GPT-NeoX con 410 millones de parámetros, entrenada sobre el dataset Pile en su versión prebarajada estándar de Pythia. El objetivo de la campaña es permitir estudios controlados de cómo la inicialización y la semilla afectan a la trayectoria de pérdida y a las propiedades del espacio de pesos, manteniendo todo lo demás constante.

Su relevancia es metodológica: proporciona checkpoints intermedios (ramas `stepN` para N en {0, 1, 2, 4, …, 512} y cada 100 pasos) con pesos en float16 safetensors y un `losses.csv` con pérdida de entrenamiento y de validación recomputada de forma homogénea, lo que facilita comparaciones bit a bit entre trayectorias. El repositorio ocupa 1079 GB, reflejo de la gran cantidad de checkpoints almacenados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-NeoX) |
| Parametros totales | 410 millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (pesos publicados en float16 safetensors) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (float16), solo pesos |
| Dataset de entrenamiento | EleutherAI/pile-standard-pythia-preshuffled |
| Esquema de inicializacion | `scaled_normal` |
| Semilla | 13 |
| Pasos de entrenamiento | 143.000 |
| Batch global | 1024 secuencias x 2048 tokens |
| Optimizador | AdamW, lr 3e-4, betas (0.9, 0.95), weight decay 0.1, grad clip 1.0 |
| Scheduler | Coseno hasta 3e-5, 1.430 pasos de warmup |
| Precision | fp16 autocast con pesos maestros fp32 |
| Hardware de entrenamiento | 4 nodos x 4 GPU A100-PCIE-40GB (cluster "jean") |
| Libreria | transformers |

## Arquitectura y entrenamiento

La arquitectura es idéntica a la de `EleutherAI/pythia-410m`: un transformer decoder-only de la familia GPT-NeoX con 410 millones de parámetros. La receta de entrenamiento reproduce el fichero `models/410M/pythia-410m.yml` del repositorio de EleutherAI, incluyendo el mismo flujo de tokens y el mismo orden de datos (`EleutherAI/pile-standard-pythia-preshuffled`, donde el batch *i* corresponde a las filas [i·1024, (i+1)·1024)). Se usa AdamW con lr 3e-4, betas (0.9, 0.95), weight decay 0.1 sin decaimiento en LayerNorm ni bias, clipping de gradiente 1.0, scheduler coseno hasta 3e-5 a lo largo de 143.000 pasos con 1.430 pasos de warmup, y precisión fp16 con pesos maestros en fp32. El batch global es de 1024 secuencias de 2048 tokens, independientemente del número de GPUs.

La única diferencia respecto a Pythia es la semilla (13) y el esquema de inicialización (`scaled_normal`, en lugar del `small_init` + `wang_init` de GPT-NeoX). La model card advierte que la reproducción exacta a nivel de bit del RNG de inicialización de EleutherAI no es posible entre frameworks, pero el esquema `pythia` coincide con la distribución por tensor de `EleutherAI/pythia-410m` en la revisión `step0`, verificado en `tests/test_pythia_step0_init_match.py`. El entrenamiento se ejecutó en dos jobs (964645 y 964829) sobre 4 nodos de 4 A100-PCIE-40GB. Los checkpoints se publican como ramas `stepN` (N en {0, 1, 2, 4, …, 512} y cada 100 pasos) con pesos en float16 safetensors; la rama `main` contiene los pesos finales.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de la arquitectura GPT-NeoX y del preentrenamiento sobre The Pile.
- Modelado de lenguaje y cálculo de perplejidad, con `losses.csv` que incluye `train_loss`, `eval_loss`, `eval_perplexity`, `eval_accuracy`, `tokens_seen` y `lr` por checkpoint.
- No dispone de ajuste por instrucciones (instruction tuning), RLHF ni DPO: es un modelo base, no un asistente.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documenta modo thinking, visión ni audio.
- Utilidad principal como objeto de estudio: checkpoints intermedios para análisis de trayectorias en el espacio de pesos y comparación entre esquemas de inicialización y semillas.

## Casos de uso

- Estudio de trayectorias de entrenamiento: los checkpoints en ramas `stepN` permiten analizar la evolución de la pérdida y de los pesos a lo largo del entrenamiento con una receta fija, comparando con otras trayectorias de la campaña DIET.
- Análisis del efecto de la inicialización: al variar solo el esquema (`scaled_normal` frente a `pythia`) y la semilla, sirve para aislar cómo la inicialización condiciona la convergencia y las propiedades finales del modelo.
- Investigación en el espacio de pesos (weight-space): los pesos intermedios en safetensors permiten estudiar interpolaciones, simetrías y geometría del espacio de parámetros entre checkpoints de la misma trayectoria.
- Reproducibilidad de Pythia: al seguir la receta oficial con el mismo flujo de datos, se puede usar como referencia para validar pipelines de entrenamiento que pretendan replicar Pythia-410M.
- Evaluación de perplejidad comparada: el `losses.csv` con evaluación homogénea permite comparar la calidad de cada checkpoint frente a los de otras trayectorias de la colección sin reejecutar la evaluación.
- Docencia y experimentación en preentrenamiento: al ser un modelo de 410M con receta pública y checkpoints frecuentes, es adecuado para cursos o laboratorios que estudien dinámicas de entrenamiento sin requerir un clúster grande.
- Baseline para métodos de compresión o poda: los checkpoints intermedios permiten medir cómo evoluciona la sensibilidad a la poda o cuantización a lo largo del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de entrenamiento y evaluación de pérdida (`losses.csv`), no resultados en tareas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,8-1,0 GB para los pesos (410M parámetros x 2 bytes), más overhead de activaciones y caché KV que depende de la longitud de contexto (no documentada).
- En cuantización de 8 bits: alrededor de 0,4-0,5 GB de pesos; en 4 bits: alrededor de 0,2-0,3 GB. Estos valores son estimaciones a partir del número de parámetros, no datos publicados en la model card.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4070, RTX 4090) es suficiente para inferencia; para entrenamiento se usaron A100-PCIE-40GB en un clúster de 4 nodos x 4 GPU.
- Cabe holgadamente en GPUs consumer; el cuello de botella es el almacenamiento, ya que el repositorio completo ocupa 1079 GB por la multitud de checkpoints.
- Opciones de despliegue: al ser compatible con `transformers` y con endpoints, se puede cargar con la librería estándar; también es convertible a GGUF para llama.cpp u Ollama, aunque no se documenta en la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| jjalora/diet-traj-pythia-410m-scaled-normal-seed13 | 410M | No disponible | Apache 2.0 | Checkpoint de investigación con inicialización `scaled_normal`, semilla 13, checkpoints intermedios |
| EleutherAI/pythia-410m | 410M | 2048 tokens (receta Pythia) | Apache 2.0 | Modelo de referencia de EleutherAI con inicialización `pythia` y checkpoints públicos |
| Otras trayectorias de la campaña DIET | 410M | No disponible | Apache 2.0 | Misma receta con otras semillas o esquemas de inicialización |

La comparación con Pythia-410M es directa porque comparten arquitectura, datos y orden de tokens; las diferencias se limitan a semilla e inicialización. No se dispone de datos de rendimiento en benchmarks para establecer comparaciones cuantitativas con modelos de otros desarrolladores.

## Limitaciones y advertencias

- Es un modelo base preentrenado, no ajustado por instrucciones: no debe usarse como asistente conversacional sin un ajuste posterior.
- Riesgo de alucinación y de generar contenido sesgado o tóxico, inherente a un modelo entrenado sobre The Pile sin filtrado adicional documentado.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto no documentada en la información disponible; conviene consultar la configuración de Pythia-410M antes de asumir 2048 tokens.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está pensado para producción como asistente; su valor es de investigación.
- El repositorio ocupa 1079 GB, lo que puede dificultar la descarga completa; conviene descargar solo la rama `main` o los checkpoints necesarios.
- La reproducción bit a bit de la inicialización de EleutherAI no es posible entre frameworks; solo se garantiza la coincidencia de distribución por tensor.
- El `losses.csv` es la fuente autoritativa de pérdida; los `snapshot.json` de revisiones anteriores al 2026-11-18 solo registran `step`, `tokens_seen`, `lr` y `dtype`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jjalora/diet-traj-pythia-410m-scaled-normal-seed13
- Repositorio de Pythia (EleutherAI): https://github.com/EleutherAI/pythia
- Modelo de referencia Pythia-410M: https://huggingface.co/EleutherAI/pythia-410m
- Dataset Pile estándar prebarajado de Pythia: https://huggingface.co/datasets/EleutherAI/pile-standard-pythia-preshuffled
- Receta de entrenamiento (fichero `pythia-410m.yml`): https://github.com/EleutherAI/pythia/blob/main/models/410M/pythia-410m.yml
