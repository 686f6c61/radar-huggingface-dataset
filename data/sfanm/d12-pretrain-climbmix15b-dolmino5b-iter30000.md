# sfanm/d12-pretrain-climbmix15B-dolmino5B-iter30000

## Resumen

El repositorio `sfanm/d12-pretrain-climbmix15B-dolmino5B-iter30000` contiene un checkpoint intermedio de preentrenamiento de un modelo decoder de 124M de parámetros, entrenado desde cero por el autor (sfanm) sobre una mezcla del 75% ClimbMix y 25% Dolmino con el tokenizador de GPT-2. No es un modelo final ni un modelo ajustado para instrucciones: es un estado reanudable de Megatron que incluye pesos, estado del optimizador y estado del planificador de learning rate, pensado para continuar el entrenamiento exactamente desde la iteración 30.000 de una ejecución total de 38.147 iteraciones.

El checkpoint corresponde al último punto guardado antes de la fase de decaimiento coseno de un schedule WSD (warmup-stable-decay): se encuentra en la fase constante con learning rate 6e-4, y el cooldown hacia 6e-5 comienza en la iteración 30.518. Se han consumido 15.728.640.000 tokens (30.000 iteraciones × 256 secuencias × 2.048 tokens), equivalentes a 7.680.000 muestras.

Su relevancia es fundamentalmente metodológica: sirve como punto de partida compartido para experimentos de mixed-pretraining en los que se añaden secuencias empaquetadas de trazas de razonamiento a cada iteración. No es un artefacto para inferencia de producción, sino una pieza de infraestructura de investigación reproducible para quienes trabajan con Megatron-Bridge y quieran replicar o extender la receta de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (estilo GPT/Llama, `LlamaForCausalLM` en la exportación a Transformers) |
| Parametros totales | 123.587.328 (~124M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (checkpoint en bf16; no se documentan cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | other |
| Formato de pesos | Megatron `torch_dist` (32 archivos `.distcp` + `.metadata`, `common.pt`, `train_state.pt`, `metadata.json`, `run_config.yaml`); pesos equivalentes en bf16 safetensors en `sfanm/unified-training`, carpeta `controlled/base-30k` |

## Arquitectura y entrenamiento

El modelo es un decoder transformer de 124M de parámetros entrenado desde cero con Megatron-Bridge (contenedor NeMo 26.04) sobre 32 rangos (8 nodos × 4 A100-40GB), sin paralelismo de tensor ni de pipeline, con optimizador distribuido. El entrenamiento usa precisión bf16, AdamW con weight decay desacoplado (β 0.9/0.95, ε 1e-8, weight decay 0.1), gradient clipping de 1.0 y semilla 1234. El batch global es de 256 secuencias (micro batch 8 × 32 rangos de datos) con longitud de secuencia 2.048.

Los datos se pre-tokenizaron con el tokenizador de GPT-2 mediante `NullTokenizer` con vocabulario rellenado a 50.304 entradas, y consisten en una mezcla 75/25 de `karpathy/climbmix-400b-shuffle` y `allenai/dolma3_dolmino_mix-100B-1025`. El schedule es WSD: 200 iteraciones de warmup, pico de learning rate 6e-4, fase constante hasta la iteración 30.518 y decaimiento coseno hasta 6e-5 al final de las 38.147 iteraciones. No se documenta RLHF, DPO ni ninguna fase de alineación; tampoco se mencionan innovaciones de inferencia como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto autoregresiva básica, limitada al estado de preentrenamiento en la iteración 30.000 (sin ajuste instructivo ni alineación).
- Modelado de lenguaje en inglés; el autor declara únicamente `en` como idioma soportado.
- Capacidad incipiente de razonamiento y código derivada del preentrenamiento, sin evaluación publicada que la cuantifique.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- El checkpoint conserva estado del optimizador y del scheduler, lo que permite reanudar el entrenamiento de forma exacta (capacidad de infraestructura, no de inferencia).

## Casos de uso

- Reanudación exacta de preentrenamiento: cargar el checkpoint con `checkpoint.load` apuntando a `megatron/` y `checkpoint.ckpt_step=30000` para continuar las 8.147 iteraciones restantes con el mismo schedule WSD y el mismo estado del optimizador.
- Experimentos de mixed-pretraining: usar este punto como base compartida y añadir k secuencias empaquetadas de 2.048 tokens con trazas de razonamiento en cada iteración, comparando el efecto frente a la ejecución de referencia.
- Investigación sobre schedules de learning rate: al ser el último checkpoint antes del cooldown coseno (iteración 30.518), permite estudiar el impacto de la fase de decaimiento partiendo de un estado idéntico y reproducible.
- Estudio de mezclas de datos: la proporción 75/25 ClimbMix/Dolmino y las rutas de los shards quedan documentadas en `run_config.yaml`, lo que facilita ablaciones sobre la composición del corpus con el mismo punto de partida.
- Reproducibilidad de infraestructura Megatron: el repositorio incluye la configuración completa de la ejecución y verifica que todos los tensores son finitos y que los momentos del optimizador son distintos de cero, lo que sirve como referencia para validar pipelines de checkpoint distribuido.
- Base para modelos pequeños de investigación: al existir pesos equivalentes en bf16 safetensors (`LlamaForCausalLM`) en `sfanm/unified-training`, puede cargarse en ecosistemas Hugging Face para experimentos de evaluación o ajuste fino a pequeña escala, siempre con las cautelas de licencia y ausencia de alineación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 123,6M de parámetros en bf16, los pesos ocupan aproximadamente 0,25 GB; en fp32, unos 0,5 GB. El checkpoint completo con estado del optimizador ocupa 1,7 GB en el repositorio.
- GPU recomendadas para entrenamiento: la ejecución original usó 32 × A100-40GB (8 nodos × 4 GPU). Para reanudar el entrenamiento se necesita una configuración equivalente o compatible con el paralelismo original (sin TP ni PP, con optimizador distribuido).
- GPU para inferencia: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) puede alojar los pesos con holgura; también es viable en CPU para pruebas.
- Opciones de despliegue: los pesos Megatron `torch_dist` requieren Megatron-Bridge/NeMo para carga; para inferencia estándar debe usarse la exportación bf16 safetensors `LlamaForCausalLM` de `sfanm/unified-training`, cargable con Transformers y potencialmente convertible a otros formatos.
- Latencia y throughput: no disponible.
- Restricción de reanudación: el sampler de preentrenamiento de Megatron exige que micro batch × tamaño de data-parallel divida las muestras consumidas (7.680.000); 8 × 32 = 256 y 8 × 24 = 192 funcionan, mientras que 8 × 28 = 224 falla en el primer batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| sfanm/d12-pretrain-climbmix15B-dolmino5B-iter30000 | 123,6M | 2.048 | other | Hugging Face (checkpoint Megatron + safetensors) | Checkpoint intermedio de preentrenamiento, sin alineación ni benchmarks |
| GPT-2 small (OpenAI) | 124M | 1.024 | MIT (pesos publicados) | Hugging Face, ampliamente disponible | Tokenizador GPT-2, modelo final entrenado; referencia de tamaño comparable |
| SmolLM-135M (Hugging Face) | 135M | 2.048 | Apache 2.0 | Hugging Face | Modelo pequeño final con evaluación publicada; contexto comparable |
| Pythia-160M (EleutherAI) | 160M | 2.048 | Apache 2.0 | Hugging Face | Suite de checkpoints intermedios para investigación de interpretabilidad |

La comparación es aproximada: los modelos alternativos son artefactos finales con documentación de evaluación, mientras que este repositorio es un estado reanudable de entrenamiento sin métricas publicadas. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- No ha pasado por alineación de seguridad ni por una evaluación exhaustiva, según declara el propio autor; no debe usarse en producción orientada a usuarios sin un proceso de ajuste y evaluación previo.
- Es un checkpoint intermedio (iteración 30.000 de 38.147), no el modelo final; su calidad es inferior a la del modelo completado tras el decaimiento coseno.
- Riesgo elevado de alucinación y de generar contenido inapropiado por la ausencia de RLHF/DPO y de filtrado documentado.
- Sesgos heredados de los corpus ClimbMix y Dolmino, no caracterizados en la información disponible.
- Cobertura lingüística limitada al inglés; no se declaran capacidades multilingües.
- Ventana de contexto de solo 2.048 tokens, insuficiente para tareas de contexto largo.
- Licencia "other": es imprescindible revisar los términos de los datos upstream (`karpathy/climbmix-400b-shuffle` y `allenai/dolma3_dolmino_mix-100B-1025`) antes de redistribuir o usar el modelo downstream, tal como advierte el autor.
- El checkpoint no incluye `latest_checkpointed_iteration.txt`, por lo que es obligatorio fijar `checkpoint.ckpt_step=30000` al reanudar.
- Las rutas de datos y de checkpoint en `run_config.yaml` apuntan al clúster original y deben sustituirse; los shards no se distribuyen en el repositorio.
- La configuración guardada fija `override_opt_param_scheduler: true`, de modo que el schedule proviene del config y debe mantenerse para continuar la misma curva de learning rate.

## Enlaces

- Repositorio del checkpoint: https://huggingface.co/sfanm/d12-pretrain-climbmix15B-dolmino5B-iter30000
- Modelo final de la ejecución: https://huggingface.co/sfanm/d12-pretrain-climbmix15B-dolmino5B
- Pesos en Transformers (bf16 safetensors, `controlled/base-30k`): https://huggingface.co/sfanm/unified-training
- Dataset de trazas de razonamiento para mixed-pretraining: https://huggingface.co/datasets/sfanm/nl-assignment-midtraining
- Dataset ClimbMix: https://huggingface.co/datasets/karpathy/climbmix-400b-shuffle
- Dataset Dolmino: https://huggingface.co/datasets/allenai/dolma3_dolmino_mix-100B-1025
