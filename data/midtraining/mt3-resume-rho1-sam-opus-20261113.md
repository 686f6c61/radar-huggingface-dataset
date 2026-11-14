# midtraining/mt3-resume-rho1-sam-opus-20261113

## Resumen

MT3 Resume Pack (Rho-1 / SAM / OPUS) es un paquete de reproducibilidad publicado por el usuario `midtraining` en Hugging Face. No se trata de un modelo entrenado listo para usar, sino de un archivo de continuacion de experimentos de *mid-training* sobre Qwen3-1.7B-Base. El repositorio contiene codigo, entorno, modelo base, datos, conjuntos de benchmark e imagenes de sandbox para reanudar tres ejecuciones comparativas que quedaron a medias en la maquina original.

Los tres metodos (Rho-1, SAM y OPUS) parten del mismo checkpoint Qwen3-1.7B-Base, se entrenan sobre un mismo corpus de 8B tokens en fase de mid-training, se afinan con Tulu-3 (SFT) y se evaluan en 11 benchmarks. El paquete permite a un tercero retomar la ejecucion exactamente donde se detuvo, con verificacion criptografica de checkpoints y estado de numeros aleatorios.

Es relevante para investigadores en reproducibilidad de entrenamiento y en metodos de seleccion de datos: el repositorio incluye los tres paquetes autocontenidos, las recetas de evaluacion y un protocolo de continuacion con requisitos estrictos de hardware (4 GPU de 80 GB). No es un modelo para inferencia en produccion ni para uso directo via API.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3-1.7B-Base) |
| Parametros totales | 1.7B (modelo base); el paquete incluye checkpoints de mid-training y SFT |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el paquete distribuye pesos sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada de Qwen3 y del paquete; condiciones no detalladas) |
| Formato de pesos | safetensors (tag del repo); repo de 135.2 GB con 13.529 archivos |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-1.7B-Base, un transformer denso de 1.7B parametros. Sobre el se aplican tres recetas de mid-training comparadas: Rho-1, SAM y OPUS. Las tres consumen el mismo corpus de 8B tokens y despues se afinan con Tulu-3 en fase SFT. El paquete no documenta en la model card la composicion del dataset mas alla del tamano total ni detalles de RLHF/DPO; la innovacion principal es metodologica (comparacion controlada de tres estrategias de mid-training) y de infraestructura (paquetes sellados con hashes SHA-256 y reanudacion bit-exacta).

El estado de avance es asimetrico: Rho-1 ha completado los 8B/8B tokens de mid-training y solo le quedan evaluacion de mid-training, SFT, evaluacion de SFT y benchmarks (2-2,5 dias en 4 GPU A100 80GB PCIe sin NVLink). SAM va por 4,0B/8B tokens (actualizacion 3.822, checkpoint `checkpoint-004000995280`) y requiere 6-7 dias. OPUS va por 2,0B/8B tokens (actualizacion 956, checkpoint `checkpoint-002001570470`) y requiere 10-11,5 dias. Cada metodo exige exactamente 4 GPU del mismo modelo con 80 GB, porque el estado RNG y el sharding de datos estan guardados para 4 ranks.

## Capacidades

- Generacion de texto y razonamiento heredados de Qwen3-1.7B-Base (no se documentan capacidades especificas adicionales en la model card).
- Codigo: el paquete incluye evaluacion en LiveCodeBench y un conjunto de 11 benchmarks, pero no se detallan las capacidades del modelo final.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Capacidades especiales (thinking mode, vision, audio): no disponible.
- Reproducibilidad: reanudacion exacta de entrenamiento con verificacion SHA-256 por archivo y comprobacion de estado RNG.

## Casos de uso

- Reproduccion de experimentos de mid-training: un laboratorio puede descargar el paquete, ejecutar `verify_bundle.py` y `check_resume.py` para validar la integridad y continuar el entrenamiento desde el checkpoint exacto, comparando Rho-1, SAM y OPUS bajo condiciones identicas.
- Investigacion en seleccion de datos: los tres metodos comparten corpus de 8B tokens y base Qwen3-1.7B-Base, lo que permite aislar el efecto de cada estrategia de mid-training en los 11 benchmarks finales.
- Auditoria de pipelines de entrenamiento: los receipts, logs y hashes permiten reconstruir que se ejecuto, cuando y con que resultados, util para revisiones internas o publicaciones.
- Extension de ejecuciones interrumpidas: si un job falla por OOM, NCCL timeout o corte de energia, `resume_run.py` retoma desde el ultimo checkpoint sin reiniciar el mid-training.
- Evaluacion estandarizada de modelos pequenos: el paquete incluye el arnes de 11 benchmarks y el sandbox Piston para LiveCodeBench, reutilizable para comparar otros modelos de ~1.7B.
- Formacion y docencia: el paquete sirve como ejemplo completo de un pipeline de mid-training + SFT + evaluacion con control de versiones estricto (Python 3.10.20, PyTorch 2.4.0+cu121, transformers 4.57.6).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona 11 benchmarks y una correccion del prompt de LiveCodeBench (el modelo Uniform pasa de 7,1% a 14,3% con el prompt corregido), pero no incluye la tabla final de resultados de Rho-1, SAM u OPUS.

## Requisitos de hardware

- VRAM: cada metodo requiere exactamente 4 GPU de 80 GB (A100 80GB PCIe en la maquina original). No se documenta un modo de inferencia en GPU consumer.
- GPU recomendadas: A100 80GB; con NVLink el SFT se acelera notablemente. No se valida en H100 ni en RTX 4090 segun la informacion disponible.
- GPU consumer: no cabe en consumer GPU para el entrenamiento; para inferencia del modelo base Qwen3-1.7B si seria viable, pero el paquete no esta pensado para ello.
- Despliegue: el paquete usa scripts propios (`run.py`, `resume_run.py`) y Docker con `--privileged` para el sandbox de benchmark (Piston). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Almacenamiento: ~140 GB de descarga (13.529 archivos) mas ~100 GB adicionales por metodo en ejecucion.
- Tiempos estimados (4x A100 80GB PCIe, sin NVLink): Rho-1 2-2,5 dias; SAM 6-7 dias; OPUS 10-11,5 dias. LiveCodeBench corregido: 1,5-2,5 horas en una sola A100.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Proposito |
|---|---|---|---|---|---|
| MT3 Resume Pack (este) | 1.7B (base Qwen3) | no disponible | other | Hugging Face, 135.2 GB | Paquete de reproducibilidad de mid-training |
| Qwen3-1.7B-Base | 1.7B | no disponible | no disponible en esta ficha | Hugging Face | Modelo base denso |
| Qwen3-1.7B (instruct) | 1.7B | no disponible | no disponible en esta ficha | Hugging Face | Modelo afinado para instrucciones |
| Tulu-3 (familia) | variable | no disponible | no disponible en esta ficha | Hugging Face | Dataset/receta de SFT usada en este paquete |

La comparativa directa con modelos de la misma categoria no es posible porque este repositorio no es un modelo de inferencia, sino un artefacto de experimentacion. Los unicos puntos de comparacion documentados son el modelo base Qwen3-1.7B-Base y el uso de Tulu-3 para SFT.

## Limitaciones y advertencias

- No es un modelo listo para produccion: es un paquete de reanudacion de entrenamiento; no hay pipeline de inferencia documentado ni pesos finales publicados.
- Estado incompleto: Rho-1, SAM y OPUS no han terminado; los benchmarks finales no estan disponibles en el repositorio.
- Requisito estricto de hardware: exactamente 4 GPU de 80 GB por metodo; no se puede ejecutar con otro numero de tarjetas sin romper la reanudacion.
- Fragilidad del entorno: versiones fijas (Python 3.10.20, PyTorch 2.4.0+cu121, CUDA 12.1, transformers 4.57.6); cualquier desviacion invalida la verificacion.
- Prohibiciones explicitas: no ejecutar `run.py accept`, no modificar archivos del paquete, no borrar `runs/`, no compartir GPUs entre metodos.
- OPUS requiere `rebind_opus_sidecar.py` cada vez que se mueve el directorio, porque el checkpoint incluye un hash con la ruta absoluta original.
- Licencia `other`: no se detallan condiciones de uso comercial; hereda restricciones de Qwen3 y del paquete, pero no estan explicitadas.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible, al no existir modelo final ni benchmarks publicados.
- Idiomas: no declarados; no se puede asumir cobertura multilingue.
- El paquete pesa 135,2 GB y 13.529 archivos; requiere ~2 horas de descarga y verificacion SHA-256 de 10-30 minutos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/midtraining/mt3-resume-rho1-sam-opus-20261113
- Repositorio de experimentos de gradiente citado en la model card: https://huggingface.co/midtraining/mt3-ladder-20261113
- Qwen3-1.7B-Base (modelo base): no disponible en la informacion proporcionada
- Tulu-3 (receta de SFT): no disponible en la informacion proporcionada
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
