# fastforks/flowformer

## Resumen

FlowFormer Small es un modelo de estimación de flujo óptico publicado originalmente en ECCV 2022 por los autores del repositorio FlowFormer-Official. El repositorio `fastforks/flowformer` no contiene pesos: es una model card que documenta cómo descargar los checkpoints oficiales de los autores, verificarlos mediante SHA-256 e integrarlos en la librería `fastforks` con el backend `portable`. La tarea es de imagen a imagen: dado un par de fotogramas RGB consecutivos, devuelve un campo de movimiento por píxel (dx, dy en píxeles) del primero al segundo.

La arquitectura combina características convolucionales, un transformer de memoria de coste latente y un decodificador recurrente de flujo. Se distribuyen tres variantes Small entrenadas en secuencia sobre FlyingChairs, FlyingThings3D y Sintel (`flowformer-small-chairs`, `flowformer-small-sintel`, `flowformer-small-things`), todas con inferencia en float32 y soporte de entrada de cualquier resolución H x W >= 64, con padding a múltiplo de 8.

El modelo es relevante para pipelines de visión por computador que necesitan flujo óptico denso de alta calidad con un modelo de investigación reproducible, aunque su licencia y su estado experimental lo alejan de un uso comercial directo sin verificación legal previa. La model card reporta latencias, memoria y precisión medidas en una RTX 5060 Ti de 16 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con extracción convolucional de características, memoria de coste latente y decodificación recurrente de flujo |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de cualquier H x W >= 64, padding a múltiplo de 8) |
| Tipos de cuantizacion | no disponible (inferencia documentada en float32 y fp16) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Código: Apache-2.0 AND BSD-3-Clause AND WTFPL; pesos: los autores no declaran licencia separada; uso comercial indicado como "yes" en la tabla de variantes, con reservas |
| Formato de pesos | `.pth` (checkpoints PyTorch de los autores, no alojados en el repo) |

## Arquitectura y entrenamiento

FlowFormer sigue un diseño en tres etapas: un extractor convolucional que produce características de los dos fotogramas, un transformer que construye y procesa una memoria de coste latente (latent cost-memory) para capturar correspondencias de largo alcance, y un decodificador recurrente que refina iterativamente el campo de flujo. Esta combinación busca superar las limitaciones de las arquitecturas puramente convolucionales tipo RAFT en regiones con grandes desplazamientos o texturas repetitivas.

Los checkpoints Small se entrenan por etapas: primero FlyingChairs (Freiburg), después Freiburg SceneFlow (FlyingThings3D, Driving y Monkaa) y finalmente Sintel, según los ficheros `configs/small_*.py` del repositorio original. La model card no detalla el número de tokens, la composición exacta del dataset ni si hubo ajuste por RLHF o DPO, ya que no es un modelo generativo de lenguaje. La innovación destacable es la memoria de coste latente, que reduce el coste computacional frente a un attention completo sobre el volumen de coste.

## Capacidades

- Estimación de flujo óptico denso entre dos fotogramas RGB consecutivos, con salida por píxel (dx, dy en píxeles).
- Entrada de resolución arbitraria H x W >= 64, con padding automático a múltiplo de 8.
- Tres variantes de pesos especializadas por dominio de entrenamiento: Chairs, Sintel y Things.
- Inferencia en float32 documentada; se reportan también ejecuciones en fp16 y TensorRT fp16.
- Compatibilidad con `torch.compile` (reducción de 351 ms a 250 ms en 375x1242) y con exportación ONNX + TensorRT (202 ms).
- Backend `portable` de la librería `fastforks`; se menciona un backend `kernels` con kernels propios en Hugging Face, aunque las celdas de esa columna aparecen vacías en la model card.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Estabilización de vídeo: estimar el flujo entre fotogramas consecutivos para compensar movimiento de cámara y aplicar warping temporal, aprovechando la salida densa por píxel del modelo.
- Interpolación de fotogramas: usar el flujo directo e inverso entre dos fotogramas para sintetizar fotogramas intermedios en pipelines de postproducción o vídeo a alta tasa de refresco.
- Seguimiento de objetos y segmentación guiada por movimiento: emplear el campo de flujo como señal auxiliar para propagar máscaras entre fotogramas en tareas de video object segmentation.
- Detección de movimiento anómalo en videovigilancia: comparar el flujo estimado con un modelo de movimiento esperado para señalar eventos fuera de patrón en secuencias de cámara fija.
- Odometría visual y robótica: alimentar módulos de estimación de movimiento ego con flujo denso entre pares de imágenes estéreo o monoculares.
- Restauración y estabilización en pipelines de imagen médica o satelital: alinear pares de imágenes con desplazamientos grandes usando la memoria de coste latente, que está diseñada para correspondencias de largo alcance.
- Evaluación comparativa de algoritmos de flujo: usar los tres checkpoints (Chairs, Sintel, Things) como referencia reproducible en experimentos académicos con EPE y Fl-all.

## Benchmarks y rendimiento

Datos de precisión reportados en la model card (frames 10 -> 11 a tamaño completo contra ground truth `flow_occ`; EPE = media del error de punto final por par; Fl-all = proporción de píxeles válidos con error > 3 px y > 5 % de la magnitud GT). La tabla de la model card aparece truncada en la información disponible, por lo que no se pueden reproducir los valores numéricos de precisión.

Rendimiento y memoria medidos en RTX 5060 Ti 16 GB (sm_120):

| Variante | Entrada | Tiempo original fp32 | Original (fp16) | Portable | Peak MiB portable (alloc/reserved) |
|---|---|---|---|---|---|
| `flowformer-small-chairs` | 375x1242 | 352 ms | 303 ms | 351 ms | 3165 / 3638 |
| `flowformer-small-sintel` | 375x1242 | 352 ms | 303 ms | 351 ms | 3165 / 3638 |
| `flowformer-small-things` | 375x1242 | 352 ms | 303 ms | 351 ms | 3165 / 3638 |

Optimizaciones (misma entrada 375x1242):

| Configuración | Tiempo | Peak MiB (alloc/reserved) | Preparación |
|---|---|---|---|
| Portable | 351 ms | 3165 / 3638 | – |
| `torch.compile` | 250 ms | 2438 / 3196 | 98.7-99.3 s (primera llamada en frío) |
| TensorRT fp16 | 202 ms | 2087 / 2138 | 117-118 s (ONNX + build de engine) |

Memoria a 1024x1024 (portable, fp16): 11.2 GiB pico asignado y 12.3 GiB reservado para las tres variantes.

## Requisitos de hardware

- VRAM estimada: unos 3,1 GiB asignados (3,6 GiB reservados) a 375x1242 en backend portable; unos 11,2 GiB asignados (12,3 GiB reservados) a 1024x1024 en fp16.
- GPU recomendadas: RTX 5060 Ti 16 GB (hardware de referencia de los benchmarks); para 1024x1024 se necesita al menos 16 GB de VRAM. Para resoluciones moderadas, GPUs consumer con 8-12 GB pueden ser suficientes, aunque no se han publicado medidas específicas.
- Cabe en GPU consumer: sí, al menos en la RTX 5060 Ti 16 GB documentada; a resoluciones altas requiere 16 GB.
- Opciones de despliegue: backend `portable` de `fastforks`, `torch.compile`, exportación ONNX + TensorRT fp16, y backend `kernels` (mencionado pero sin datos en la model card).
- Latencia y throughput: 351 ms por par a 375x1242 en portable; 250 ms con `torch.compile`; 202 ms con TensorRT fp16. Carga del modelo: 0,15-0,16 s en original y 1,30-1,31 s en portable. Primera llamada: 0,30-0,37 s en original y 0,57 s en portable.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FlowFormer Small (este) | Transformer con memoria de coste latente | no disponible | H x W >= 64, padding a múltiplo de 8 | Código Apache-2.0/BSD-3-Clause/WTFPL; pesos sin licencia declarada | Pesos en enlaces de Google Drive de los autores; repo de model card en HF |
| RAFT | Convolucional con correlation volume | no disponible | Resolución arbitraria | BSD-3-Clause (según referencias del repo original) | Pesos públicos en el repo oficial de Princeton |
| GMA | RAFT con atención global de movimiento | no disponible | Resolución arbitraria | Según repo original (no detallado en la información) | Pesos públicos |
| FlowFormer original (Large) | Igual arquitectura, mayor tamaño | no disponible | Igual que Small | Igual que Small | Pesos en el repo oficial |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa de precisión.

## Limitaciones y advertencias

- Repositorio sin pesos: `fastforks/flowformer` es solo una model card; los pesos se descargan de enlaces de Google Drive de los autores y se verifican por SHA-256.
- Licencia ambigua: los autores no declaran licencia separada para los pesos; la model card asume Apache-2.0 AND BSD-3-Clause AND WTFPL a partir del código y marca "commercial use: yes" con reservas. Es imprescindible revisar `LICENSE`, `LICENSE-RAFT` y `LICENSE-GMA` antes de cualquier uso comercial.
- Estado experimental: la propia model card clasifica el modelo como "Tier: experimental".
- Precisión no verificable: la tabla de accuracy aparece truncada en la información disponible; no se pueden citar valores de EPE o Fl-all.
- Memoria elevada a resolución alta: 1024x1024 requiere ~11,2 GiB asignados y ~12,3 GiB reservados en fp16, lo que limita su uso en GPUs de menos de 16 GB.
- Sin soporte de lenguaje, tool calling ni agentes: cualquier expectativa de uso conversacional o multimodal es inaplicable.
- Riesgo de alucinación no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de flujo erróneo en regiones ocluidas, sin textura o con movimientos fuera del dominio de entrenamiento (Chairs, Things, Sintel).
- Idiomas: no disponible, al no ser un modelo lingüístico.

## Enlaces

- Hugging Face: https://huggingface.co/fastforks/flowformer
- Repositorio de la librería fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original FlowFormer-Official (commit 6ba7ea82b453): https://github.com/drinkingcoder/FlowFormer-Official
- Licencia del código original: https://github.com/drinkingcoder/FlowFormer-Official/blob/6ba7ea82b45394d3a7a25808399695427c9febd8/README.md#license
- Documentación de benchmarks de fastforks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Fichero `card.toml` con hashes SHA-256 completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/flow/models/flowformer/card.toml
- Pesos `flowformer-small-chairs.pth` (Google Drive): https://drive.usercontent.google.com/download?export=download&confirm=t&id=1EpmZu6fOZBE0az-UaEmSMVi0pGHVEuQE
- Pesos `flowformer-small-sintel.pth` (Google Drive): https://drive.usercontent.google.com/download?export=download&confirm=t&id=1EpmZu6fOZBE0az-UaEmSMVi0pGHVEuQE
- Pesos `flowformer-small-things.pth` (Google Drive): https://drive.usercontent.google.com/download?export=download&confirm=t&id=1EpmZu6fOZBE0az-UaEmSMVi0pGHVEuQE
