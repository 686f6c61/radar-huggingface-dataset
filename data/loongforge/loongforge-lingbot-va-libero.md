# LoongForge/LoongForge-LingBot-VA-LIBERO

## Resumen

LoongForge-LingBot-VA-LIBERO es un checkpoint de ajuste fino supervisado (SFT) del modelo vision-language-action (VLA) LingBot-VA, entrenado por el equipo LoongForge sobre el modelo base `robbyant/lingbot-va-base`. LingBot-VA es un modelo del mundo video-accion autoregresivo: un transformer de difusion de doble flujo que predice latentes de video futuro y acciones de robot en una unica secuencia intercalada. Este checkpoint concreto se ha especializado en el benchmark LIBERO-Long (`libero_10`), un conjunto de tareas de manipulacion robotica de horizonte largo.

El modelo resuelve el problema de generar politicas de control robotico a partir de instrucciones en lenguaje natural y observaciones visuales, combinando prediccion de video (world model) con generacion de acciones. Su relevancia radica en que el ajuste fino con el framework LoongForge supera al entrenamiento con el codigo oficial de LingBot-VA sobre los mismos datos y protocolo: 84,6 % de exito frente a 77,8 % en LIBERO-Long.

El checkpoint tiene 5.088.872.670 parametros (aproximadamente 5,09 mil millones), se distribuye en safetensors en FP32 y ocupa 34,6 GB en el repositorio. La licencia es Apache 2.0 y el unico idioma declarado es ingles. No es un modelo de proposito general: es un artefacto de investigacion para evaluacion en simulacion robotica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion de doble flujo (dual-stream diffusion transformer) para video y acciones, autoregresivo; basado en WanTransformer3DModel |
| Parametros totales | 5.088.872.670 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; pesos almacenados en FP32, inferencia en BF16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (FP32, shards con indice) |

## Arquitectura y entrenamiento

LingBot-VA es un modelo del mundo video-accion autoregresivo construido sobre un transformer de difusion de doble flujo. El modelo procesa observaciones visuales e instrucciones y genera, en una secuencia intercalada, latentes de video futuro y acciones de robot. El checkpoint incluye un `transformer/` (WanTransformer3DModel ajustado) mientras que `vae/`, `text_encoder/` y `tokenizer/` se mantienen sin cambios respecto a `robbyant/lingbot-va-posttrain-libero-long`.

El entrenamiento consistio en 5.000 iteraciones con batch global de 80 (configuracion 1 x 5 x 16 GPUs), tasa de aprendizaje constante de 1e-5 tras 10 iteraciones de calentamiento, optimizador AdamW con betas (0,9, 0,95), weight decay 0,1, recorte de gradiente 2,0 y semilla 42. Se uso computo en BF16 con pesos maestros en FP32 y reduccion de gradientes en FP32; los pesos se almacenan en FP32 y el servidor de politicas los convierte a BF16 en inferencia. Los datos de entrenamiento provienen del dataset `robbyant/libero-long-lerobot`. No se documenta en la informacion disponible el uso de RLHF o DPO.

## Capacidades

- Generacion de acciones de robot a partir de observaciones visuales e instrucciones en lenguaje natural.
- Prediccion de latentes de video futuro como modelo del mundo, integrada en la misma secuencia que las acciones.
- Razonamiento viso-motor para tareas de manipulacion de horizonte largo (LIBERO-Long, `libero_10`).
- Ejecucion de politicas en entornos simulados de robotica (LIBERO) mediante servidor de politicas.
- Procesamiento multimodal: vision (observaciones) y texto (instrucciones), con salida de acciones.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad generica; el modelo opera como politica de control.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales: world model video-accion; no se documentan modos de pensamiento, audio ni vision de proposito general.

## Casos de uso

- Evaluacion de investigacion en LIBERO-Long: el checkpoint se carga apuntando `server.ckpt_path` a la copia local y se ejecuta `eval/run_libero_eval.sh`, permitiendo reproducir el 84,6 % de exito con el protocolo de 10 tareas x 50 episodios, semilla 7 y maximo 800 pasos.
- Baseline para comparativas de metodos de ajuste fino: sirve como referencia SFT para medir mejoras de frameworks de entrenamiento (LoongForge frente al codigo oficial) sobre los mismos datos y schedule.
- Investigacion en world models para robotica: al predecir latentes de video futuro junto con acciones, permite estudiar la relacion entre prediccion visual y calidad de politica.
- Desarrollo de politicas de manipulacion de horizonte largo: las tareas `libero_10` requieren secuencias de acciones largas, lo que lo hace adecuado para probar planificacion viso-motora.
- Reproduccion de experimentos con FSDP: el script `run_lingbot_va_libero_fsdp_finetune.sh` permite reentrenar o adaptar el modelo a otros datasets en formato LeRobot.
- Prototipado de pipelines de evaluacion robotica: integrable en un servidor de politicas que convierte pesos FP32 a BF16 para inferencia, util para montar entornos de evaluacion automatizados.
- Estudio de tecnicas de entrenamiento en precision mixta: el uso de BF16 con pesos maestros FP32 y reduccion de gradientes FP32 es un caso concreto para analizar estabilidad de entrenamiento en modelos de difusion grandes.

## Benchmarks y rendimiento

| Modelo | LIBERO-Long success |
|---|---|
| LoongForge-LingBot-VA-LIBERO (este checkpoint) | 84,6 % (423/500) |
| Codigo oficial lingbot-va, misma receta | 77,8 % (389/500) |

Protocolo: 10 tareas LIBERO-Long x 50 episodios, semilla 7, maximo 800 pasos, inferencia en BF16. La fila del codigo oficial corresponde a un modelo entrenado por el equipo con el repositorio oficial de lingbot-va sobre los mismos datos y schedule, evaluado con el mismo protocolo. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 5,09 mil millones de parametros, en BF16 los pesos ocupan aproximadamente 10,2 GB, mas el VAE, el text encoder y el tokenizer, por lo que se requiere margen adicional.
- Pesos en repositorio: 34,6 GB en FP32, lo que condiciona el almacenamiento y la carga.
- GPU recomendadas: no disponible en la informacion proporcionada; el entrenamiento uso 16 GPUs por configuracion (1 x 5 x 16).
- Compatibilidad con GPU de consumo: no confirmada; el volumen de pesos en FP32 y los componentes adicionales hacen necesario verificar el ajuste en VRAM antes de desplegar.
- Opciones de despliegue: servidor de politicas de LoongForge con configuracion `examples/embodied/lingbot_va/eval/configs/libero/libero_10_full.yaml`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | LIBERO-Long | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LoongForge-LingBot-VA-LIBERO | 5.088.872.670 | no disponible | 84,6 % (423/500) | apache-2.0 | Hugging Face |
| LingBot-VA (codigo oficial, misma receta) | no disponible | no disponible | 77,8 % (389/500) | no disponible | Hugging Face / GitHub |
| robbyant/lingbot-va-base | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de otros modelos VLA comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado en LIBERO-Long; su rendimiento fuera de ese benchmark o en robots reales no esta documentado.
- Solo declara soporte de ingles; no se garantiza comportamiento en otros idiomas.
- Es un checkpoint de investigacion en simulacion; no se documenta validacion en hardware fisico.
- Riesgo de alucinacion y de predicciones visuales inconsistentes: no se han publicado analisis de fallos ni tasas de error por tarea.
- No se documentan sesgos conocidos del dataset `robbyant/libero-long-lerobot`.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los componentes derivados (`vae/`, `text_encoder/`, `tokenizer/`) deben verificarse por separado.
- `config.json` es metadata descriptiva, no una configuracion `AutoModel` de Transformers; la carga requiere la configuracion de evaluacion propia de LoongForge.
- Los pesos se almacenan en FP32 (34,6 GB), lo que complica el despliegue en entornos con almacenamiento o VRAM limitados.
- No hay datos publicados de latencia, throughput ni requisitos minimos de VRAM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LoongForge/LoongForge-LingBot-VA-LIBERO
- Modelo base: https://huggingface.co/robbyant/lingbot-va-base
- Dataset de entrenamiento: https://huggingface.co/datasets/robbyant/libero-long-lerobot
- Repositorio LoongForge: https://github.com/baidu-baige/LoongForge
- Documentacion de LoongForge: https://github.com/baidu-baige/LoongForge/tree/master/docs
- Script de evaluacion LIBERO: https://github.com/baidu-baige/LoongForge/tree/master/examples/embodied/lingbot_va/eval/run_libero_eval.sh
- Configuracion de evaluacion libero_10: https://github.com/baidu-baige/LoongForge/blob/master/examples/embodied/lingbot_va/eval/configs/libero/libero_10_full.yaml
- Script de ajuste fino FSDP: https://github.com/baidu-baige/LoongForge/tree/master/examples/embodied/lingbot_va/run_lingbot_va_libero_fsdp_finetune.sh
- Repositorio LingBot-VA: https://github.com/Robbyant/lingbot-va
