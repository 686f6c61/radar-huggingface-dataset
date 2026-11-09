# haolunwang/baselines

## Resumen

`haolunwang/baselines` no es un modelo entrenado, sino un repositorio de archivo publicado en Hugging Face por el usuario `haolunwang`. Su contenido es un conjunto heterogéneo de pesos y checkpoints de modelos de visión-lenguaje-acción (VLA) para robótica, junto con ejecuciones locales de comparación sobre tareas ALOHA y LIBERO. La model card indica explícitamente que se trata de un volcado de directorios locales (`/group/ycyang/whl`) realizado el 2026-11-09 antes de borrarlos para liberar espacio en disco, y que los pesos multi-gigabyte de los modelos oficiales no se copiaron en el repositorio.

El repositorio agrupa dos categorías: por un lado, referencias a pesos oficiales ya publicados en otros repositorios (OpenVLA-7B, OpenVLA-OFT, MVP-LAM, UniVLA-7B, NORA-1.5, VLA-JEPA); por otro, checkpoints de ejecuciones locales propias de comparación (OpenCLAP/QwenPIKM, fine-tunes de UniVLA y MVP-LAM sobre ALOHA). No hay una arquitectura única ni un modelo base definido, sino una colección de artefactos de investigación.

Por tanto, esta ficha describe el repositorio como artefacto de investigación reproducible, no como un modelo desplegable. Su relevancia es limitada fuera del contexto del autor: sirve como registro de recetas de fine-tune y de configuraciones experimentales, pero no constituye una release de modelo con garantías de calidad, licencia o soporte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (repositorio agregado; contiene VLA basados en transformer, DiT y modelos de acción latente) |
| Parametros totales | No disponible (varía por artefacto: desde 932M en MVP-LAM hasta 7B en OpenVLA/UniVLA; checkpoints OpenCLAP ~12 GB cada uno) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos se almacenan en safetensors y `.pt`/`.ckpt` sin cuantizar) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors, `.pt` (PyTorch), `.ckpt` |
| Tamano del repositorio | 114,2 GB |
| Pipeline declarado | No disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura propia. Agrega artefactos de varios sistemas: OpenVLA-7B (Prismatic + Llama-2-7B, preentrenado en OXE), OpenVLA-OFT (fine-tunes oficiales sobre LIBERO en cuatro suites), MVP-LAM (modelo de acción latente cross-view, 932M, preentrenado en OXE + EgoExo4D), UniVLA-7B (acciones latentes task-centric), NORA-1.5 (VLM `declare-lab/nora-long` con tokenizador FAST y action chunk 5) y VLA-JEPA (checkpoint LIBERO con backbones Qwen3-VL-2B-Instruct y vjepa2-vitl-fpc64-256).

Las ejecuciones locales documentadas usan recetas concretas. La receta común de fine-tune ALOHA es: batch global 64 (8 por dispositivo, acumulación 2), LoRA r32 con dropout 0, learning rate 3,5e-4 (LoRA 5e-5, cabeza 3e-4), ventana 12, stride de downsample 3, objetivo `anchored_delta_qpos` (qpos del brazo derecho, índices 7:14), gripper binario, aumento de imagen, cámara única y decodificador de acción con concatenación de propriocepción. Los fine-tunes de OpenCLAP usan backbone `clap-s3-l32` (Qwen3-VL-4B, 36 capas, hidden 2560), DiT de 16 capas, semilla 42, AdamW, batch 8 con acumulación 2, y horizontes de acción de 8 o 32 según la carpeta. Los fine-tunes de MVP-LAM sobre LIBERO usan LoRA r32, lr 2,5e-4, batch 8 × acumulación 2, 30k pasos, codebook 16 y aumento de imagen.

## Capacidades

- Ejecución de políticas VLA para manipulación robótica (ALOHA, LIBERO) a partir de observaciones visuales y proprioceptivas.
- Modelos de acción latente (MVP-LAM, UniVLA) para representar acciones en espacio latente y transferir entre tareas.
- Fine-tune con LoRA sobre modelos base de 7B en entornos con recursos limitados.
- Evaluación comparativa entre familias (OpenVLA, OpenVLA-OFT, MVP-LAM, UniVLA, NORA-1.5, VLA-JEPA, OpenCLAP) sobre las mismas tareas.
- Soporte de múltiples vistas (carpetas `multiview` y configuraciones con `use_wrist_image: false`).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling ni agentes; el contenido es específicamente de robótica VLA.

## Casos de uso

- Reproducción de baselines de investigación: el repositorio registra rutas upstream y recetas exactas (lr, batch, pasos, horizonte) para reentrenar OpenVLA, MVP-LAM o UniVLA sobre ALOHA y LIBERO.
- Comparación controlada de familias VLA: las carpetas `aloha_drawer_finetune`, `aloha_drawer_finetune_univla` y `aloha_drawer_finetune_mvplam` permiten contrastar el mismo task (drawer) con tres inicializaciones distintas bajo una receta común.
- Estudio de horizontes de acción: las carpetas `aloha_drawer_clap_s3_h8_...` (horizonte 8) y `aloha_drawer_clap_s3_l32_...` (horizonte 32) permiten analizar el efecto del horizonte en la política.
- Auditoría de checkpoints intermedios: los dumps cada 250/500 pasos (`step-000200` … `step-005000`) permiten trazar curvas de entrenamiento y diagnosticar sobreajuste.
- Reutilización de adaptadores LoRA: los directorios `hang_tape_univla_ckpts` y `hang_tape_mvplam_ckpt` contienen adaptador y optimizer, útiles para reanudar entrenamiento sin recomputar el merge de 7B.
- Archivado de pesos oficiales por referencia: la tabla de rutas upstream permite reconstruir el entorno experimental descargando de nuevo OpenVLA-7B, MVP-LAM o VLA-JEPA sin rehostear pesos con licencias restrictivas (Llama-2).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe configuraciones de entrenamiento y rutas de checkpoints, pero no incluye métricas de éxito en tareas ALOHA o LIBERO.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma agregada; depende del artefacto. Los checkpoints OpenCLAP completos ocupan ~12 GB cada uno en `pytorch_model.pt`, lo que sugiere al menos ~12-16 GB de VRAM para carga en FP32/FP16 según el caso.
- Los modelos base de 7B (OpenVLA-7B, UniVLA-7B, MVP-LAM-7B) requieren típicamente GPUs de 16-24 GB para inferencia en precisión reducida; no se confirma en la información proporcionada.
- GPU recomendadas: no disponible en la model card.
- Viabilidad en GPU de consumo: no confirmada; el tamaño de los checkpoints (12 GB por artefacto OpenCLAP) sugiere que una RTX 4090 (24 GB) podría alojar un checkpoint individual, pero no se documenta.
- Opciones de despliegue: no se documentan (no hay referencias a vLLM, llama.cpp, Ollama ni TGI; son checkpoints de investigación en PyTorch).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `haolunwang/baselines` (este repo) | Agregado (932M–7B) | No disponible | No disponible | No disponible | Público en HF, 114,2 GB |
| OpenVLA-7B (`openvla/openvla-7b`) | 7B | No disponible | No disponible | No disponible | Upstream público |
| MVP-LAM (`JM-Lee/mvp-lam`) | 932M | No disponible | No disponible | No disponible | Upstream público |
| UniVLA-7B (`qwbu/univla-7b`) | 7B | No disponible | No disponible | No disponible | Upstream público |

La comparativa se limita a los modelos referenciados en la propia model card; no se dispone de datos de rendimiento para contrastar.

## Limitaciones y advertencias

- No es un modelo entrenado ni una release: es un archivo de directorios locales con fines de preservación; no hay garantía de integridad ni de que los pesos oficiales estén presentes (varios se omitieron deliberadamente).
- Ausencia total de licencia declarada: no se puede asumir uso comercial ni redistribución; además, algunos artefactos derivan de Llama-2, con sus propias restricciones.
- Los checkpoints OpenCLAP son `pytorch_model.pt` completos (~12 GB), no adaptadores; el coste de almacenamiento y de carga es alto.
- Los dumps `hang_tape_univla_ckpts` y `hang_tape_mvplam_ckpt` contienen adaptador y optimizer, no un merge completo de 7B; no son directamente desplegables sin combinar con el modelo base.
- Sin métricas de evaluación publicadas: no hay evidencia de calidad de las políticas entrenadas.
- Sin información sobre sesgos, alucinación o limitaciones idiomáticas (no aplica en el sentido habitual de LLM, pero tampoco se documenta el comportamiento de las políticas).
- Fechas de creación y actualización (2026-11-09) y referencias a experimentos de octubre-noviembre de 2026: verificar coherencia temporal antes de usar como referencia.
- El repositorio mezcla artefactos de terceros con ejecuciones propias; la trazabilidad depende de la model card, que puede quedar desactualizada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/haolunwang/baselines
- OpenVLA-7B: https://huggingface.co/openvla/openvla-7b
- OpenVLA-OFT LIBERO: https://huggingface.co/moojink/openvla-7b-oft-finetuned-libero-10 (y variantes `-goal`, `-object`, `-spatial`)
- MVP-LAM: https://huggingface.co/JM-Lee/mvp-lam
- MVP-LAM 7B Bridge: https://huggingface.co/JM-Lee/mvp-lam-7b-bridge-pt
- MVP-LAM LIBERO: https://huggingface.co/JM-Lee/mvp-lam-7b-224-libero
- UniVLA-7B: https://huggingface.co/qwbu/univla-7b
- UniVLA LAM: https://huggingface.co/qwbu/univla-latent-action-model
- NORA-1.5 LIBERO: https://huggingface.co/declare-lab/nora-1.5-libero
- NORA-Long: https://huggingface.co/declare-lab/nora-long
- VLA-JEPA: https://huggingface.co/ginwind/VLA-JEPA
- Qwen3-VL-2B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- V-JEPA 2 ViT-L: https://huggingface.co/facebook/vjepa2-vitl-fpc64-256
