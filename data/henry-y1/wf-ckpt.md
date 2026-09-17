# henry-y1/wf-ckpt

## Resumen

WaveForcing 14B es un checkpoint de inferencia derivado del modelo de generacion de video texto-a-video Wan2.1-T2V-14B. En concreto, `model.pt` contiene unicamente el state dict de `generator_ema` del checkpoint final del stage S3 (paso 1500) del recipe `14b-hsdp-fast`, convertido de fp32 a bf16. No se trata de un modelo entrenado desde cero, sino de pesos de generador que sustituyen a los shards DiT originales de Wan2.1 y que se cargan mediante `pipeline.generator.load_state_dict`. El autor lo publica bajo el identificador `henry-y1/wf-ckpt` con un tamano de repositorio de 28,6 GB.

El modelo pertenece a la familia de pipelines "Forcing" (RollingForcing / WaveForcing) y se ejecuta mediante la herramienta `tools/standard_infer/infer.py`, bien en modo `rf` (RollingForcing, un prompt por GPU) o bien en modo `wf` (runtime wave-parallel WaveRT, con `wp_size 5`, `rf_step 4` y `vae_stages 3`). El calendario de denoising esta fijado en cuatro pasos (`1000,750,500,250`), con `timestep_shift: 5.0` y `warp_denoising_step: true`. El protocolo de inferencia esta fijado a semilla 42, resolucion 480x832 y 16 fps.

Es relevante ahora porque permite reproducir inferencia sobre un checkpoint de investigacion en generacion de video con 14B de parametros, pero el propio autor advierte de que es un checkpoint de fin de etapa (S3) y no una release validada en calidad. Ademas, el bundle no es autocontenido: requiere descargar por separado los componentes de Wan2.1 (~65 GB) y no permite reanudar el entrenamiento. Tanto la licencia como los idiomas soportados no estan declarados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) de Wan2.1-T2V-14B, con pipeline RollingForcing / WaveForcing |
| Parametros totales | 14B (denominacion `14b-hsdp-fast`; no se detalla el recuento exacto en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (weights en `model.pt`); no se documentan GGUF, int8 ni otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (state dict PyTorch, bf16, 1095 tensores con prefijo `model.`) |
| Pasos de denoising | 1000, 750, 500, 250 |
| Timestep shift | 5.0 (`warp_denoising_step: true`) |
| Resolucion y fps de inferencia | 480x832, 16 fps (protocolo fijo) |
| Semilla | 42 (fija en el protocolo) |
| Tamano del repositorio | 28,6 GB |
| Componentes externos requeridos | Wan2.1-T2V-14B: `config.json`, seis shards DiT safetensors, `models_t5_umt5-xxl-enc-bf16.pth`, tokenizer `google/`, `Wan2.1_VAE.pth` (~65 GB) |

## Arquitectura y entrenamiento

El checkpoint corresponde a un transformer de difusion (DiT) de la familia Wan2.1-T2V-14B, orientado a generacion de video a partir de texto. Los pesos publicados son exclusivamente el generador con media exponencial de pesos (EMA), que es la unica parte que la inferencia lee. El modelo base se apoya en un text encoder T5-UMT5-XXL y un VAE de Wan2.1; en inferencia solo se usan el text encoder y el VAE, mientras que los shards DiT originales se sustituyen por `model.pt`.

El entrenamiento se realizo con el recipe `14b-hsdp-fast` en 64 GPUs, con paralelismo hibrido HSDP 8x8, sequence parallelism SP8 y acumulacion de gradientes 1, hasta `max_steps: 1500` en el stage S3, con estado `completed`. El bundle descartó el generador sin EMA, el critico (`critic`) y los 64 ficheros `trainer_state_rank*.pt` (171 GiB de `model.pt` y 286 GiB de estado por rango), por lo que no es posible reanudar el entrenamiento desde este fichero. La presencia de un critico sugiere una fase de ajuste con señal adversarial, aunque la informacion disponible no detalla la composicion del dataset, el numero de tokens de entrenamiento ni si hubo RLHF o DPO.

La innovacion tecnica declarada es el esquema de "forcing" para el denoising (RollingForcing y el runtime wave-parallel WaveRT), junto con un calendario de cuatro pasos de denoising y un `timestep_shift` de 5.0 que desplaza los timesteps efectivos. La procedencia y el SHA-256 se documentan en `model.source.json` dentro del propio repositorio.

## Capacidades

- Generacion de video texto-a-video (T2V) a partir de prompts, sobre la arquitectura Wan2.1-T2V-14B.
- Inferencia por lotes con un prompt por GPU en modo RollingForcing (`--mode rf`), pensada para hosts con 8 GPUs.
- Ejecucion wave-parallel mediante el runtime WaveRT (`--mode wf`, `wp_size 5`, `rf_step 4`, `vae_stages 3`), que lanza `python -m wave_rt serve`.
- Salida con parametros fijos: semilla 42, resolucion 480x832 y 16 fps.
- Uso de text encoder T5-UMT5-XXL y VAE de Wan2.1 para la codificacion de texto y la decodificacion de video.
- No se declaran capacidades de tool calling, function calling, agentes, multi-step reasoning ni modo de razonamiento explicito.
- No se declaran capacidades de vision, audio ni otros modos adicionales mas alla del video generado.
- El soporte multilingue no esta documentado en la informacion disponible.

## Casos de uso

- Generacion de clips de video a partir de descripciones textuales: el modelo produce video a 480x832 y 16 fps, adecuado para prototipos y pruebas de concepto en pipelines T2V.
- Investigacion en difusion de video: permite reproducir y analizar los esquemas RollingForcing y WaveForcing sobre un generador de 14B con un calendario de cuatro pasos de denoising.
- Comparacion de estrategias de inferencia: el mismo checkpoint puede ejecutarse en modo `rf` o en modo `wf`, lo que facilita medir diferencias entre un pipeline por prompt y un runtime wave-parallel.
- Evaluacion de decodificacion VAE de Wan2.1: el montaje requiere cargar `Wan2.1_VAE.pth`, util para estudiar el efecto del VAE en muestras de un generador ajustado.
- Generacion por lotes en infraestructura multi-GPU: con 8 GPUs y un prompt por GPU, el modelo encaja en flujos de trabajo de generacion masiva para conjuntos de prompts.
- Reproducibilidad de experimentos: al fijar semilla 42, resolucion y fps, permite comparar resultados entre ejecuciones y entre variantes del pipeline.
- Auditoria de checkpoints de investigacion: util para estudiar como se comporta un generador con EMA frente al generador sin EMA, dado que el bundle solo conserva el primero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: en bf16, 14B de parametros equivalen a unos 28 GB solo para el generador, lo que coincide con el tamano del repositorio (28,6 GB).
- Componentes adicionales: el text encoder T5-UMT5-XXL, el tokenizer y el VAE de Wan2.1 suman aproximadamente 65 GB de descarga, que deben estar accesibles en disco y, segun el componente, en memoria.
- Configuracion de referencia: el autor documenta ejecucion en un host con 8 GPUs, con `--gpus 0,1,2,3,4,5,6,7` y un prompt por GPU.
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la informacion disponible.
- Uso en GPU de consumo: no disponible; el modelo no se presenta como una opcion de una sola GPU de consumo y requiere el stack de Wan2.1 completo.
- Opciones de despliegue: `tools/standard_infer/infer.py` en modo `rf` (RollingForcing) o modo `wf` (WaveRT, `python -m wave_rt serve`). No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WaveForcing 14B (wf-ckpt) | 14B (recipe `14b-hsdp-fast`) | no disponible | sin benchmarks publicados | no disponible | HuggingFace, checkpoint de investigacion |
| Wan2.1-T2V-14B (base) | 14B | no disponible | no disponible en la informacion | no disponible en la informacion | Requerido como dependencia externa |
| Otras alternativas T2V (HunyuanVideo, CogVideoX, LTX-Video, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica referencia directa en la informacion proporcionada es Wan2.1-T2V-14B, del que este checkpoint hereda arquitectura y componentes (text encoder, VAE y tokenizer). No se dispone de datos de rendimiento, licencia ni contexto para establecer una comparacion cuantitativa con otras alternativas.

## Limitaciones y advertencias

- Es un checkpoint de fin de etapa (S3, paso 1500), no una release validada en calidad; el propio autor lo indica explicitamente.
- No permite reanudar el entrenamiento: se descartaron el generador sin EMA, el critico y los 64 ficheros de estado por rango.
- No es autocontenido: requiere descargar aparte los componentes de Wan2.1 (~65 GB) para poder ejecutarse.
- El protocolo de inferencia esta fijado (semilla 42, 480x832, 16 fps), lo que limita la variabilidad de resolucion y framerate.
- La licencia no esta declarada, por lo que no puede confirmarse el uso comercial ni las condiciones de redistribucion.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinacion.
- Riesgo de artefactos propios de la generacion de video por difusion (inconsistencias temporales, deformaciones), no cuantificado por falta de benchmarks.
- La informacion de contexto y de cuantizacion es limitada: solo se distribuye en bf16 y no hay variantes GGUF o int8.
- Los metadatos del repositorio muestran fechas de creacion y actualizacion de 2026, incoherentes con la fecha actual; conviene tratarlos con cautela.
- Las busquedas web realizadas no devuelven resultados relacionados con el modelo (los enlaces encontrados corresponden a software de facturacion y a personas homonimas).

## Enlaces

- HuggingFace: https://huggingface.co/henry-y1/wf-ckpt
- Fichero de pesos: `model.pt` (state dict `generator_ema`, bf16) en el repositorio de HuggingFace
- Procedencia y SHA-256: `model.source.json` en el repositorio de HuggingFace
- Herramienta de inferencia: `tools/standard_infer/infer.py` (modos `rf` y `wf`) en el repositorio
- Documentacion de entrenamiento: `training/README` en el repositorio
- Dependencia externa: Wan2.1-T2V-14B (config, shards DiT, `models_t5_umt5-xxl-enc-bf16.pth`, tokenizer `google/`, `Wan2.1_VAE.pth`)
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web realizada.
