# anvilarth/vjepa2.1-vit-large-384-openvino

## Resumen

V-JEPA 2.1 ViT-L/16 384 es el codificador de vídeo del modelo auto-supervisado V-JEPA 2.1 de Meta AI (repositorio `facebookresearch/vjepa2`). Esta ficha no describe el checkpoint original, sino la exportación a OpenVINO y ONNX que el usuario anvilarth publica en Hugging Face. Se trata, por tanto, de un modelo de extracción de características (`feature-extraction`): recibe vídeo y devuelve tensores de representación, sin generar texto ni imágenes.

La aportación del export no es un reentrenamiento, sino la portabilidad y las formas dinámicas. Batch, número de fotogramas, alto y ancho son dinámicos (no hace falta recorte central ni geometría cuadrada), el RoPE 3D se calcula dentro del grafo a partir de la forma de entrada y los pesos se mantienen en float32, con la opción de ejecutar en bf16 sobre el mismo IR de OpenVINO. La paridad con el port de Hugging Face es de un error relativo ≤ 3,1e-5 en float32.

Es relevante porque permite reutilizar un encoder de vídeo de última generación en CPU, sin GPU, con dos framebacks (OpenVINO y ONNX Runtime) y licencia MIT. El repositorio ocupa 4,9 GB e incluye dos puntos de salida (features normalizadas y la salida cruda del bloque 24) en ambos formatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer para vídeo (ViT-L/16) con RoPE 3D; tubelet de 2 fotogramas, parches de 16×16, preentrenado a 384×384 |
| Parametros totales | no disponible (la model card no lo indica; el export revela 1024 dimensiones ocultas y 24 bloques) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de vídeo con formas dinámicas: batch, 2T fotogramas (número par), H y W múltiplos de 16 |
| Tipos de cuantizacion | pesos float32; OpenVINO permite elegir f32 o bf16 en tiempo de ejecución sobre el mismo IR; ONNX en float32; no hay variantes int8 ni int4 |
| Idiomas soportados | no aplica (modelo de visión, sin entrada ni salida de texto) |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (`.xml` + `.bin`), ONNX (`.onnx` + `.onnx.data`); el checkpoint origen está en safetensors |
| Tamaño del repositorio | 4,9 GB |
| Modelo base | `apiantonio/vjepa2.1-vit-large-384` (revisión `d6cfdbdd818754f22eaa72e5320d97724765f099`), copia bit-exacta de `vjepa2_1_vitl_dist_vitG_384.pt` (`ema_encoder`) |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

El export reconstruye en PyTorch puro el encoder V-JEPA 2.1 ViT-L/16 y lo carga de forma estricta desde los safetensors de origen, sin ejecutar código del Hub. La entrada es `pixel_values_videos` en float32 con forma `(B, 2T, 3, H, W)`, donde 2T es par (tubelet de 2) y H, W son múltiplos de 16. El preprocesado reproduce bit a bit el `VJEPA21VideoProcessor` de Hugging Face: RGB, redimensionado bilineal sin antialiasing, normalización ImageNet y sin recorte central. La salida es `(B, T·H/16·W/16, 1024)` en orden tubelet-major, fila y columna.

Se publican dos puntos de extracción: el `last_hidden_state` con normalización final (`vjepa21_vitl_final_norm`) y la salida cruda del bloque 24 antes de la normalización (`vjepa21_vitl_layer24`). La innovación técnica del export es que el RoPE 3D se calcula dentro del grafo a partir de la forma de entrada, incluida la interpolación de las dimensiones de referencia a la rejilla de preentrenamiento, lo que habilita geometrías arbitrarias alineadas con el parche. Los detalles de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF/DPO) no se especifican en la información proporcionada; al ser un modelo auto-supervisado de visión, no hay etapa de alineación con preferencias.

## Capacidades

- Extracción de características de vídeo de forma auto-supervisada, sin necesidad de etiquetas ni cabezas específicas de tarea.
- Formas dinámicas: batch, número de fotogramas (par), alto y ancho variables y múltiplos de 16; admite fotogramas no cuadrados y no requiere recorte central.
- Cálculo interno del RoPE 3D en función de la forma de entrada, incluida la interpolación a la rejilla de preentrenamiento.
- Dos puntos de salida seleccionables: features normalizadas finales o salida del bloque 24 sin normalizar (útil para cabezas que se entrenaron sobre activaciones intermedias).
- Ejecución en CPU con OpenVINO (f32 o bf16) y con ONNX Runtime (f32), con paridad verificada frente al port de PyTorch.
- No soporta tool calling ni function calling: no es un modelo generativo ni conversacional.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües, modo thinking, audio ni visión estática: la model card indica explícitamente que la ruta de imagen no está incluida.

## Casos de uso

- Recuperación de vídeo por similitud: precalcular las features de una videoteca y comparar por coseno entre tokens (o agregados) para buscar planos o clips similares. Es adecuado porque las dimensiones dinámicas permiten indexar clips de distinta duración y resolución con un mismo grafo.
- Clasificación de vídeo con sondas ligeras: congelar el encoder y entrenar una sonda lineal o atencional sobre las features de 1024 dimensiones para tareas como reconocimiento de acciones, evitando el coste de entrenar el backbone completo.
- Detección de anomalías en vídeo de vigilancia: extraer representaciones de secuencias normales y detectar desviaciones por distancia en el espacio de features. La ejecución en CPU permite desplegarlo en el servidor de grabación existente, sin GPU.
- Control de calidad en línea de producción: analizar fotogramas de cámaras industriales (geometrías no cuadradas admitidas, sin recorte) para clasificar piezas correctas o defectuosas con una cabeza entrenada sobre las features.
- Moderación y triaje de contenido: extraer features de vídeos subidos por usuarios para clasificarlos con cabezas auxiliares entrenadas sobre representaciones congeladas, y derivar a revisión humana solo los casos dudosos.
- Etiquetado automático y curaduría de datasets: usar las representaciones como señal de deduplicación o agrupamiento (clustering) para limpiar corpus de vídeo antes de entrenar otros modelos.
- Analítica deportiva y biomecánica: representaciones por tubelet que preservan la estructura espacio-temporal, útiles para comparar secuencias de movimiento con una cabeza supervisada específica.
- Base para fine-tuning en dominios concretos (medicina, industria, teledetección) donde no hay modelos de vídeo preentrenados disponibles y se parte de un backbone auto-supervisado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas downstream (por ejemplo, clasificación de acciones o recuperación) en la información disponible. Los únicos datos cuantitativos son los de paridad numérica frente al port de Hugging Face en PyTorch (float32, CPU), medidos como error relativo `max|Δ| / max|ref|` y coseno mínimo por token:

| Backend | Error relativo | Coseno por token (mínimo) |
|---|---|---|
| OpenVINO f32 | ≤ 3,1e-5 | 1,000000 |
| ONNX Runtime | ≤ 1,6e-5 | 1,000000 |
| OpenVINO bf16 | ≤ 2,9e-2 | ≥ 0,996 |
| PyTorch bf16 autocast (referencia) | ≤ 2,1e-2 | ≥ 0,9989 |

Formas de test declaradas: `(1,24,3,288,512)`, `(1,6,3,384,384)`, `(2,4,3,384,272)` y `(1,2,3,16,528)`, para ambas salidas.

## Requisitos de hardware

- Orientación a CPU: el export está pensado para inferencia rápida en CPU con OpenVINO o ONNX Runtime; no se documentan requisitos de GPU.
- Hilos: `OpenVINOEncoder` usa todos los núcleos de CPU por defecto. Si se deja solo el *latency hint* de OpenVINO, la ejecución se limita a un socket y en máquinas de dos sockets resulta aproximadamente 1,7× más lenta.
- Memoria: el repositorio completo ocupa 4,9 GB porque la misma red aparece dos veces (salida `final_norm` y salida `layer24`) y en dos formatos (OpenVINO IR y ONNX). Los pesos se almacenan en float32; ejecutar en bf16 reduce el consumo en memoria respecto a f32.
- VRAM estimada: no disponible (no se publican requisitos ni medidas en GPU para este export).
- GPU recomendadas: no disponibles. OpenVINO dispone de plugin GPU y ONNX Runtime de execution providers CUDA/TensorRT, pero la model card no aporta datos de rendimiento en esos backends.
- GPU de consumo: no documentado; no hay cifras que permitan afirmar que quepa o no en una RTX 4090 u otras tarjetas consumer.
- Opciones de despliegue: OpenVINO Runtime (script `vjepa21_openvino.py` incluido), ONNX Runtime, o PyTorch con el port de Hugging Face (`trust_remote_code`). No aplican vLLM, llama.cpp, Ollama ni TGI, pensados para modelos generativos de texto.
- Latencia y throughput: no disponibles. Solo se documenta el efecto relativo de usar un socket frente a todos los núcleos (≈1,7× más lento).

## Comparativa con modelos similares

| Modelo | Formato y runtime | Formas de entrada | Precisión | Licencia |
|---|---|---|---|---|
| `anvilarth/vjepa2.1-vit-large-384-openvino` (esta ficha) | OpenVINO IR + ONNX; OpenVINO Runtime u ONNX Runtime | Dinámicas: batch, 2T fotogramas, H y W múltiplos de 16; sin recorte | f32, con bf16 opcional en OpenVINO (error relativo ≤ 2,9e-2) | MIT |
| `apiantonio/vjepa2.1-vit-large-384` (checkpoint base del export) | safetensors sobre PyTorch con `trust_remote_code` | Procesador HF `VJEPA21VideoProcessor`, sin recorte | f32 | MIT |
| `vjepa2_1_vitl_dist_vitG_384.pt` (Meta AI, `ema_encoder`) | PyTorch `.pt` | no disponible | f32 | MIT (según indica el export) |

Las tres entradas son variantes del mismo encoder, no modelos independientes: el checkpoint base es una copia bit-exacta de los pesos `ema_encoder` de Meta y este repositorio es su export. Para alternativas de otra familia (por ejemplo, otros codificadores de vídeo auto-supervisados como VideoMAE o InternVideo2, o codificadores de imagen como DINOv2), no se dispone de datos comparativos de parámetros, contexto ni rendimiento en la información proporcionada.

## Limitaciones y advertencias

- Solo incluye el encoder de vídeo: no incorpora el predictor ni la ruta de imagen del V-JEPA 2.1 original, por lo que no sirve para predicción en el espacio latente ni para imágenes estáticas.
- No es un modelo generativo: no produce texto, no soporta tool calling, ni razonamiento multi-paso, ni modo thinking.
- La precisión bf16 introduce un error relativo de hasta 2,9e-2 y un coseno mínimo de 0,996 entre tokens; hay que validar cualquier cabeza entrenada sobre features float32 antes de cambiar de precisión.
- Restricciones de forma: el número de fotogramas debe ser par (tubelet de 2) y H, W múltiplos de 16. El modelo se preentrenó a 384×384, por lo que resoluciones muy alejadas de esa referencia dependen de la interpolación del RoPE y de la calidad de las features resultantes.
- El orden de la salida es específico (tubelet-major, después fila, después columna) y el `reshape` a la rejilla espacial corre por cuenta del usuario; un orden incorrecto degrada silenciosamente cualquier tarea downstream.
- No se publican resultados de benchmarks downstream, así que la calidad de las representaciones no está cuantificada para ninguna tarea concreta.
- Es una publicación de la comunidad (0 descargas y 2 likes en el momento de la consulta), no un artefacto oficial de Meta AI.
- Licencia MIT, que permite uso comercial y modificación, pero exige conservar la atribución: V-JEPA 2.1 es de Meta AI (`facebookresearch/vjepa2`) y los pesos originales se distribuyen bajo MIT.
- En máquinas de dos sockets, el *latency hint* de OpenVINO sin configuración explícita de hilos reduce el rendimiento aproximadamente 1,7×; hay que fijar el número de hilos para evitar este comportamiento en producción.
- Las dependencias declaradas para el uso son `openvino`, `torch`, `torchvision`, `numpy` y `huggingface_hub`; para reexportar se añaden `safetensors`, `onnx` y `onnxscript`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anvilarth/vjepa2.1-vit-large-384-openvino
- Checkpoint base: https://huggingface.co/apiantonio/vjepa2.1-vit-large-384
- Repositorio de V-JEPA 2 de Meta AI: https://github.com/facebookresearch/vjepa2
- OpenVINO: https://github.com/openvinotoolkit/openvino
- Notebook de OpenVINO para V-JEPA 2.1 (PR 3640): https://github.com/openvinotoolkit/openvino_notebooks/pull/3640
- ONNX Runtime: https://github.com/microsoft/onnxruntime
