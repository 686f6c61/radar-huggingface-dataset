# chyun/video-lam-old78k-q2q-causal-16k

## Resumen

Video LAM es un checkpoint de investigación (paso 16.000) del modelo `old78k-varlen-q2qcausal-action-8gpu-gb16`, un modelo de acción latente para robótica construido mediante fine-tuning del backbone congelado de NVIDIA Cosmos-Predict2.5-2B. Lo desarrolla el usuario chyun y se publica como artefacto de ablación para estudiar el efecto de una máscara de atención causal entre grupos de consultas (*query-to-query*) en la predicción de acciones y vídeo.

El modelo no es un LLM de propósito general: es un modelo de política robótica que combina un backbone transformer de 28 bloques preentrenado (Cosmos-Predict2.5-2B) con dos etapas LoRA de rango 16 y un decodificador de flujo separado. La innovación concreta es la máscara causal en la atención entre grupos de consultas: el grupo de consultas en el instante *t* solo puede atender a grupos en instantes ≤ *t*, mientras que las ranuras del mismo instante siguen siendo mutuamente visibles.

Su relevancia es acotada pero clara para el nicho de investigación en robótica y *world models*: publica el checkpoint íntegro (estado del modelo, optimizador, scheduler, RNG y posición de datos), argumentos de entrenamiento exactos, estadísticas de normalización de acciones, parche de implementación y sumas de verificación, lo que permite reproducir el entrenamiento. No hay métricas de benchmarks publicadas ni licencia declarada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Cosmos-Predict2.5-2B de 28 bloques congelados) + LoRA rango 16 en dos etapas + decodificador de flujo separado; atención causal entre grupos de consultas |
| Parametros totales | no disponible (el backbone base es de 2B; los adaptadores LoRA y el decodificador no se cuantifican en la información) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (clips de vídeo de 5–29 fotogramas a 480x640) |
| Tipos de cuantizacion | no disponible (checkpoint nativo en PyTorch, sin versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (condicionamiento de texto vía embeddings proyectados de Cosmos-Reason1-7B) |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`step_016000.pt`), sin safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte del backbone preentrenado de NVIDIA Cosmos-Predict2.5-2B, que permanece congelado en sus 28 bloques. Sobre él se aplican dos etapas LoRA de rango 16 (Stage A y Stage B) y se entrena un decodificador de flujo independiente. La modificación arquitectónica central es la máscara de atención causal entre grupos de consultas: en Stage A, el grupo de consultas del tiempo *t* puede atender a grupos de tiempos ≤ *t*, manteniendo visibilidad mutua entre ranuras del mismo instante. Los objetivos de vídeo y acción usan *flow matching*; la predicción de acción emplea el objetivo original de flow matching por conjunto de datos.

El entrenamiento se ejecutó con batch global 16, microbatch 1 por GPU, acumulación de gradiente 2, ocho GPUs y semilla 0. La mezcla de datos es de pesos iguales entre DROID, EgoDex y MolmoAct, con clips de longitud variable de 5 a 29 fotogramas a resolución 480x640. El condicionamiento de texto de Stage A usa embeddings proyectados de Cosmos-Reason1-7B. El autor advierte que la comparación con el decodificador pequeño cambia simultáneamente la inicialización del decodificador y el objetivo de vídeo, por lo que no aísla ninguno de los dos factores.

## Capacidades

- Predicción de acciones robóticas a partir de observaciones de vídeo y condicionamiento de lenguaje, mediante flow matching por conjunto de datos.
- Modelado conjunto de vídeo y acción (objetivos duales de flow matching).
- Atención causal entre grupos de consultas, orientada a escenarios de decisión secuencial donde el futuro no debe filtrarse al pasado.
- Condicionamiento de lenguaje a través de embeddings proyectados de Cosmos-Reason1-7B (requiere caché de texto proyectada o el codificador de texto en línea correspondiente).
- Entrenamiento multi-dataset con normalización de acciones por conjunto de datos (DROID, EgoDex, MolmoAct).
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo *thinking*.

## Casos de uso

- Investigación en políticas robóticas con historial causal: el modelo permite estudiar si limitar la atención al pasado mejora la consistencia temporal en la predicción de acciones, usando la máscara q2q causal como variable de ablación.
- Reproducción de experimentos de entrenamiento: al incluir `step_016000.pt` con optimizador, scheduler, RNG y posición de datos, más `training_args.json` y el parche de implementación, sirve para reanudar o replicar el entrenamiento en otro clúster.
- Evaluación de mezclas de datos en robótica: la mezcla equiponderada DROID + EgoDex + MolmoAct con clips de 5–29 fotogramas permite analizar el efecto de la composición del dataset en el rendimiento de la política.
- Estudio de adaptación con LoRA sobre backbones congelados: dos etapas LoRA de rango 16 sobre un backbone de 28 bloques congelados sirven de base para comparar estrategias de bajo rango en modelos de acción latente.
- Benchmarking de decodificadores de flujo: el decodificador separado entrenado con flow matching permite comparar arquitecturas de decodificación en tareas de predicción de acción.
- Base para experimentos de *world models* en robótica: el objetivo dual vídeo-acción posibilita investigar la coherencia entre la predicción visual y la acción generada en entornos simulados o reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El entrenamiento documentado usó ocho GPUs con microbatch 1 y acumulación de gradiente 2 (batch global 16); no se especifica el modelo de GPU.
- El repositorio ocupa 1,0 GB, lo que corresponde al checkpoint (`step_016000.pt`) con estado del modelo, optimizador y scheduler; la inferencia requiere además el backbone base `nvidia/Cosmos-Predict2.5-2B` (revisión `15a82a2ec231bc318692aa0456a36537c806e7d4`, archivo `base/pre-trained/d20b7120-df3e-4911-919d-db6e08bad31c_ema_bf16.pt`), que debe descargarse aparte y referenciarse con la variable `COSMOS_PRETRAIN_CKPT`.
- No se dispone de estimación de VRAM para inferencia ni de GPU recomendadas en la información proporcionada.
- Opciones de despliegue: carga nativa en PyTorch mediante `cosmos-predict2.5/scripts/train_latent_action_v4.py` con la ruta de reanudación/carga; requiere aplicar `training_implementation.patch` y copiar `source/` sobre el checkout de `jiiiisoo/video_lam` en el commit `e2e07aec72971886a276cbb22dbfacb3c10041f3`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Video LAM (este checkpoint) | Backbone 2B + LoRA r16 + decodificador | Clips de 5–29 fotogramas a 480x640 | Acción latente robótica + vídeo | no disponible | Checkpoint PyTorch en HF |
| NVIDIA Cosmos-Predict2.5-2B | 2B | no disponible | Modelo de mundo / predicción | no disponible en esta ficha | Base pública en HF |
| Modelos de política robótica tipo RT-2 / OpenVLA | no disponible | no disponible | Acción robótica visión-lenguaje | no disponible en esta ficha | no disponible |

La comparación cuantitativa con alternativas no está disponible: no se publican métricas de rendimiento para este checkpoint ni datos de contexto comparables.

## Limitaciones y advertencias

- Es un checkpoint de ablación de investigación, no un modelo listo para producción; el autor no declara evaluación de inferencia en GPU del paquete descargado.
- La licencia no está disponible, por lo que no puede asumirse uso comercial; debe consultarse al autor antes de cualquier despliegue.
- El checkpoint no incluye el backbone base ni el VAE: requiere descargar `nvidia/Cosmos-Predict2.5-2B` por separado y fijar `COSMOS_PRETRAIN_CKPT`.
- El condicionamiento de lenguaje necesita una caché de texto proyectada válida o el codificador de texto en línea de Cosmos-Reason1-7B; la caché grande de entrenamiento no se incluye.
- Las rutas de máquina originales en `training_args.json` deben reemplazarse (raíces de datos, ruta de checkpoint/reanudación, caché de texto y `per_dataset_action_stats`), manteniendo las banderas de arquitectura y objetivo guardadas.
- No se debe usar un cargador que ignore silenciosamente un grupo de decodificador guardado; hay que restaurar consultas, adaptadores, `video_decoder` y los grupos LoRA aplicables.
- La comparación con el decodificador pequeño no aísla la inicialización del decodificador frente al objetivo de vídeo, lo que limita las conclusiones del estudio de ablación.
- No hay datos publicados sobre sesgos, tasa de alucinación ni cobertura lingüística.
- El modelo está especializado en robótica y clips cortos de vídeo; no es adecuado para generación de texto general ni para tareas fuera de su dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chyun/video-lam-old78k-q2q-causal-16k
- Repositorio de código: https://github.com/jiiiisoo/video_lam (commit `e2e07aec72971886a276cbb22dbfacb3c10041f3`)
- Modelo base: https://huggingface.co/nvidia/Cosmos-Predict2.5-2B (revisión `15a82a2ec231bc318692aa0456a36537c806e7d4`)
- Dataset: https://huggingface.co/datasets/Jiiiiiisoo/video_lam_prepared_v1
- Dataset: https://huggingface.co/datasets/Jiiiiiisoo/video_lam_dataset
