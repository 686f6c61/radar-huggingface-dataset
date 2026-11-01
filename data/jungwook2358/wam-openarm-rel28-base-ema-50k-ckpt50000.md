# jungwook2358/wam-openarm-rel28-base-ema-50k-ckpt50000

## Resumen

wam-openarm-rel28-base-ema-50k-ckpt50000 es un modelo de robótica desarrollado por el usuario jungwook2358, publicado en HuggingFace con el pipeline `robotics`. Se trata de una réplica de un entrenamiento previo del autor huiwon (`huiwon/isaac_wan22_openarm_wam_v1_b32_i2v_base_norep_relq99_50k`) ejecutado en un fork propio, con un espacio de acciones de 28 dimensiones articulares relativas sobre el robot OpenArm (cuello, brazos y manos). El modelo parte de Wan2.2-TI2V-5B entrenado desde cero y se especializa en la generación de vídeo condicionada por imagen y acciones motoras.

La relevancia del checkpoint radica en su configuración de entrenamiento: 50.000 pasos sobre seis subconjuntos de datos robóticos, con una ventana de predicción de 8 fotogramas futuros a partir de una imagen de condición, resolución de 192x256 con concatenación estéreo y máscara de vistas. El checkpoint guarda tanto los pesos vivos como las copias EMA (media móvil exponencial) en fp32 del extractor de vídeo y de la cabeza de acciones, lo que permite servir el modelo con EMA o con pesos vivos desde el mismo artefacto.

No se dispone de información sobre el número de parámetros totales, la longitud de contexto en tokens ni los idiomas soportados. El repositorio ocupa 32,5 GB e incluye ocho shards de safetensors, índices, configuraciones y estados de entrenamiento, excluyendo los estados del optimizador DeepSpeed.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) basada en Wan2.2-TI2V-5B, con backbone de vídeo y cabeza de acciones |
| Parametros totales | no disponible (el nombre indica 5B para el backbone Wan2.2-TI2V) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de predicción de 1 cond + 8 fotogramas futuros) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (8 shards, con index, config.json, processor_config.json, statistics.json, embodiment_id.json) |

## Arquitectura y entrenamiento

El modelo se basa en Wan2.2-TI2V-5B, un transformer de difusión para generación de vídeo imagen-a-vídeo, adaptado aquí a un dominio robótico. El entrenamiento parte desde cero (from scratch) sobre seis subconjuntos de datos robóticos, sin datos humanos. La configuración emplea un stride de 3 en la tarea imagen-a-vídeo (1 fotograma de condición y 8 futuros), resolución de 192x256 con concatenación estéreo vertical y recorte de aspecto, y una máscara de vistas con proporciones 0.5/0.25/0.25. Se aplica aumento de datos moderado y no se usa pérdida de profesor ni de repetición.

El espacio de acciones es de 28 dimensiones articulares relativas (`openarm_all_rel_ah24_config`), con cuantiles q01/q99 calculados a partir de `relative_stats` y grupos de acción solo para el brazo derecho (banana right-only). Los gradientes de la cabeza de acciones se detienen (stop-gradient) hacia el backbone de vídeo. El entrenamiento usó b32 (pd8 x 4 GPU), 50.000 pasos, warmup de 2.500, learning rate 1e-4, weight decay 0.01, suelo coseno 0.1 y semilla 42. Se guardaron copias EMA en fp32 del extractor de vídeo (825 tensores) y de la cabeza de acciones, además de los pesos vivos.

## Capacidades

- Generación de vídeo condicionada por imagen y por acciones motoras para el robot OpenArm.
- Predicción de 8 fotogramas futuros a partir de una imagen de condición con stride 3.
- Control de 28 dimensiones articulares relativas (cuello, brazos y manos).
- Soporte de inferencia con pesos EMA o pesos vivos desde el mismo checkpoint.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso.
- No se documentan capacidades multilingües ni modos de razonamiento explícito.
- No se documentan capacidades de visión general, audio ni thinking mode.

## Casos de uso

- Investigación en imitación robótica: el modelo permite reproducir el entrenamiento base de huiwon sobre OpenArm con acciones relativas de 28 dimensiones, sirviendo como línea base para experimentos de aislamiento de causas (EXP-0019).
- Evaluación de políticas visomotoras: se puede usar para predecir secuencias de acciones a partir de observaciones estéreo a 192x256, comparando el rendimiento de pesos EMA frente a pesos vivos en entornos simulados.
- Desarrollo de control de brazos y manos: el espacio de acciones relativo con cuantiles q01/q99 facilita el despliegue en el robot OpenArm para tareas de manipulación con el brazo derecho.
- Reproducibilidad de experimentos: al incluir estados de entrenamiento, configuración y estadísticas, el checkpoint permite reanudar o auditar el proceso de entrenamiento en un fork propio.
- Generación de vídeo predictivo para planificación: los 8 fotogramas futuros generados pueden emplearse como predicciones visuales para planificadores de movimiento de corto horizonte.
- Base para fine-tuning en dominios específicos: al ser un modelo entrenado desde cero sobre datos robóticos, puede servir como punto de partida para adaptaciones a otras tareas de manipulación con el mismo robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 32,5 GB en safetensors, lo que sugiere que la inferencia en fp32 o fp16 requiere al menos esa cantidad, pero no se confirma.
- GPU recomendadas: no disponible; el entrenamiento usó 4 GPU con batch pd8, pero no se especifica el modelo de GPU.
- Si cabe en consumer GPU: no disponible.
- Opciones de despliegue: no disponible (no se documenta vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wam-openarm-rel28-base-ema-50k-ckpt50000 | no disponible (backbone 5B) | no disponible | no disponible | other | HuggingFace |
| huiwon/isaac_wan22_openarm_wam_v1_b32_i2v_base_norep_relq99_50k | no disponible | no disponible | no disponible | no disponible | HuggingFace (referencia citada) |
| Wan2.2-TI2V-5B | 5B (backbone) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- La licencia es "other", lo que implica restricciones no especificadas; es necesario consultar los términos del autor antes de cualquier uso comercial.
- El modelo está entrenado exclusivamente con datos robóticos de OpenArm y no con datos humanos, lo que limita su generalización a otros dominios.
- El espacio de acciones es específico de 28 dimensiones relativas con grupos solo para el brazo derecho, lo que restringe su aplicabilidad a configuraciones diferentes.
- No se documentan sesgos conocidos, pero al ser un modelo de robótica, puede heredar sesgos de los datos de entrenamiento no especificados.
- Riesgo de alucinación en la generación de vídeo: las predicciones de fotogramas futuros pueden divergir de la realidad física en horizontes largos.
- No se especifican limitaciones de contexto o idioma porque no se dispone de esa información.
- El checkpoint excluye los estados del optimizador DeepSpeed, por lo que no es directamente reanudable para entrenamiento sin reconstruirlos.
- El tamaño del repositorio (32,5 GB) y la falta de datos sobre cuantización dificultan estimar requisitos de despliegue en producción.

## Enlaces

- HuggingFace: https://huggingface.co/jungwook2358/wam-openarm-rel28-base-ema-50k-ckpt50000
- Modelo de referencia citado: https://huggingface.co/huiwon/isaac_wan22_openarm_wam_v1_b32_i2v_base_norep_relq99_50k
- Código: rama `jungwook/openarm-fred-ft` del repositorio actlat-wam, commit d64d313 (no se proporciona URL directa)
- Script de entrenamiento: `run_scripts/train/wam_dit4dit/openarm/finetune_openarm_rel28_base.sh` (no se proporciona URL directa)
