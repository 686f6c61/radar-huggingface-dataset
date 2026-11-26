# hermitdave/Qwen3.5-9B-MLX-RCO-3.51bpw-DWQ-mtp4

## Resumen

Qwen3.5-9B-MLX-RCO-3.51bpw-DWQ-mtp4 es una cuantizacion de precision mixta del modelo multimodal Qwen/Qwen3.5-9B, publicada por el usuario hermitdave. El artefacto combina un tronco de texto cuantizado a 3/4/6 bits mediante el metodo RCO (RCO-plus-DWQ), refinado con un paso de DWQ (distillation-aware weight quantization) sobre 1024 muestras contra el profesor de 8 bits, y un injerto de la cabeza MTP (multi-token prediction) a 4 bits y de la torre de vision en BF16 procedentes del checkpoint de 4,63 bpw del mismo autor. El resultado ocupa 8,15 GB en disco para 9.447 millones de parametros.

El modelo base Qwen3.5-9B pertenece a la familia Qwen3.5 del equipo Qwen y esta disenado para tareas de image-text-to-text, es decir, generacion de texto condicionada por imagenes y texto. Esta version cuantizada conserva la torre de vision y la cabeza MTP, pero su proposito declarado es la fidelidad distribucional respecto al modelo BF16, no la mejora de exactitud en tareas de opcion multiple.

Es relevante ahora porque demuestra un flujo de cuantizacion agresivo (3,51 bits por peso) que reduce el coste de almacenamiento y memoria sin degradar de forma significativa la distribucion de salida del profesor, y porque documenta de forma honesta una limitacion medida: la cabeza MTP injertada no acelera la inferencia en este tronco y debe permanecer desactivada por defecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + vision) con cabeza MTP, formato MLX (qwen3_5) |
| Parametros totales | 9.447.844.080 (9,447 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | RCO mixta 3/4/6 bits en el tronco de texto; cabeza MTP a 4 bits affine gs64; torre de vision en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria mlx-lm) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer multimodal con torre de vision y una cabeza de prediccion multi-token (MTP) de una capa (`mtp_num_hidden_layers = 1`). La cuantizacion se realizo en dos fases: primero una construccion RCO con precision mixta 3/4/6 bits guiada por la imatrix `hermitdave/Qwen3.5-9B-imatrix`, y despues un paso DWQ de 1024 muestras con learning rate 1e-6 contra el profesor MLX de 8 bits. El paso DWQ optimiza unicamente escalas y sesgos; los pesos enteros no se modifican. Los tensores injertados (31 tensores de la cabeza MTP y 333 tensores BF16 de la torre de vision) se copiaron del checkpoint `hermitdave/Qwen3.5-9B-MLX-RCO-4.63bpw-mtp4` y se verificaron por hash contra el repositorio de origen. La configuracion final restaura `vision_config` y fusiona las entradas de cuantizacion de MTP.

El entrenamiento del modelo base no se detalla en la informacion proporcionada. El artefacto no es un fine-tune, sino una compresion con perdida del modelo original.

## Capacidades

- Generacion de texto y razonamiento en el marco del modelo base Qwen3.5-9B.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con torre de vision en BF16 conservada.
- Conversacion multi-turno (tag conversational).
- Cabeza MTP presente para prediccion multi-token, aunque medida como no util en este checkpoint (aceptacion del 2-7%).
- Soporte de tool calling, agentes, codigo y matematicas: no confirmado en la informacion disponible para este artefacto concreto.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Despliegue en Apple Silicon con MLX: el formato safetensors y la libreria mlx-lm permiten ejecutar el modelo en equipos con memoria unificada, aprovechando los 8,15 GB en disco y la cuantizacion de 3,51 bpw para reducir la huella de memoria.
- Investigacion sobre cuantizacion: el artefacto sirve como referencia reproducible para estudiar el efecto de DWQ sobre la fidelidad distribucional (KL, perplejidad, acuerdo top-1) frente a un profesor BF16.
- Evaluacion de fidelidad de modelos comprimidos: los datos de WikiText-103 y WikiText-2 permiten comparar variantes dentro de la misma familia con metodologia fijada.
- Procesamiento de documentos con imagen: al conservar la torre de vision en BF16, puede emplearse en tareas de image-text-to-text donde la calidad visual sea prioritaria, con `model_type_override: "vlm"` en oMLX.
- Reproducibilidad de injertos de cabezas auxiliares: util para estudiar el comportamiento de cabezas MTP trasplantadas entre checkpoints de distinta precision.
- Prototipado con restricciones de memoria: adecuado para entornos donde no cabe el modelo BF16 pero se requiere mantener la distribucion de salida lo mas cercana posible al profesor.

## Benchmarks y rendimiento

Fidelidad frente a BF16 en WikiText-103 (seq 513, temperatura 0, KL menor es mejor):

| Modelo | 64 muestras validas | 16 muestras holdout disjunto |
|---|---:|---:|
| RCO 3,51 bpw baseline | 0,065482 | 0,067125 |
| Este modelo DWQ | 0,049122 (-25,0%) | 0,049210 (-26,7%) |
| RCO 4,63 bpw publicado | 0,022148 | 0,022621 |

Perplejidad en WikiText-2 (199.902 tokens, contexto 2048):

| Modelo | PPL |
|---|---:|
| Referencia BF16 | 9,0039 |
| RCO 3,51 bpw baseline | 8,8773 |
| Este modelo DWQ | 8,6964 |

Acuerdo top-1 a nivel de token frente a BF16 (20.480 posiciones):

| Modelo | Global | Decisivo (gap>2) | Medio (0,5-2) | Casi empate (<0,5) |
|---|---:|---:|---:|---:|
| RCO 3,51 bpw baseline | 83,32% | 98,57% | 87,66% | 54,98% |
| Este modelo DWQ | 85,90% | 98,95% | 90,68% | 59,72% |
| RCO 4,63 bpw publicado | 89,97% | 99,88% | 95,71% | 66,21% |

Exactitud zero-shot (5 tareas x 400 ejemplos, temperatura 0):

| Modelo | ARC-Ch | ARC-Easy | HellaSwag | WinoGrande | MMLU | Media |
|---|---:|---:|---:|---:|---:|---:|
| RCO 4,63 bpw | 51,75 | 82,50 | 50,25 | 53,75 | 51,00 | 57,85 |
| RCO 3,51 bpw baseline | 53,75 | 81,25 | 50,00 | 55,75 | 48,00 | 57,75 |
| Este modelo DWQ | 52,50 | 82,00 | 49,00 | 54,25 | 48,00 | 57,15 |

Rendimiento MTP (oMLX, 256 tokens de salida):

| Prompt | MTP off | Profundidad 1 | Profundidad 3 | Aceptacion d1 / d3 |
|---|---:|---:|---:|---:|
| Corto | 58,12 tok/s | 38,67 | 23,18 | 7,2% / 7,1% |
| ~1,5k tokens | 51,22 tok/s | 35,39 | 22,15 | 4,5% / 2,0% |

## Requisitos de hardware

- Huella en disco: 8,15 GB (7,10 GB tronco de texto + 1,05 GB injerto MTP y vision).
- VRAM/memoria unificada estimada: no disponible de forma explicita; el tamano del repositorio (8,2 GB) da una cota inferior orientativa.
- GPU recomendadas: no disponibles para este artefacto; el formato MLX esta pensado para Apple Silicon.
- Compatibilidad con GPU de consumo: no confirmada en la informacion proporcionada; el formato mlx-lm no es directamente compatible con CUDA sin conversion.
- Opciones de despliegue: mlx-lm y oMLX (con `model_type_override: "vlm"` para entradas de vision y `mtp_enabled: false` por defecto).
- Throughput medido en oMLX con MTP desactivado: 58,12 tok/s en prompt corto y 51,22 tok/s en prompt de ~1,5k tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-9B-MLX-RCO-3.51bpw-DWQ-mtp4) | 9,447 B | no disponible | apache-2.0 | safetensors MLX | 3,51 bpw, media zero-shot 57,15 |
| Qwen3.5-9B-MLX-RCO-4.63bpw-mtp4 | no disponible | no disponible | apache-2.0 | safetensors MLX | 4,63 bpw, media zero-shot 57,85, mejor fidelidad KL |
| Qwen/Qwen3.5-9B (BF16) | no disponible | no disponible | apache-2.0 | safetensors | Referencia sin cuantizar; PPL WikiText-2 9,0039 |

## Limitaciones y advertencias

- Compresion con perdida: no es un fine-tune y degrada la fidelidad respecto a BF16 (KL 0,049 frente a 0,022 del checkpoint de 4,63 bpw).
- Exactitud zero-shot plana: la media cae a 57,15 frente a 57,75 del baseline y 57,85 del 4,63 bpw; la mejora DWQ se concentra en fidelidad de tokens, no en precision de opcion multiple.
- MTP injertado no util: aceptacion medida del 2-7% y throughput inferior (23-38 tok/s frente a 51-58 tok/s sin MTP); mantener `mtp_enabled: false`.
- Entradas de imagen no evaluadas en este artefacto.
- Perplejidad de WikiText optimista por posible contaminacion en el pretraining; usar solo para comparacion intra-familia.
- Idiomas soportados no documentados.
- Licencia apache-2.0 permite uso comercial, sujeto a las condiciones del modelo base Qwen3.5-9B.
- Riesgo de sesgos y alucinaciones inherente al modelo base; no cuantificado en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/hermitdave/Qwen3.5-9B-MLX-RCO-3.51bpw-DWQ-mtp4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Imatrix: https://huggingface.co/hermitdave/Qwen3.5-9B-imatrix
- Donante MTP/vision: https://huggingface.co/hermitdave/Qwen3.5-9B-MLX-RCO-4.63bpw-mtp4
