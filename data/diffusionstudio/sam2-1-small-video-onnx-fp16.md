# diffusionstudio/sam2.1-small-video-onnx-fp16

## Resumen

El modelo `diffusionstudio/sam2.1-small-video-onnx-fp16` es una exportación a ONNX en fp16 del rastreador de vídeo SAM 2.1 de Meta, concretamente de la variante Hiera-Small (`facebook/sam2.1-hiera-small`). Lo publica Diffusion Studio y está pensado para ejecutarse en el navegador mediante ONNX Runtime Web con WebGPU, sin necesidad de servidores ni GPUs de centro de datos. Incluye el pipeline completo de seguimiento: codificador de imagen, codificador de memoria, atención de memoria, decodificador de máscara y cálculo de *object pointers*, repartidos en cinco grafos ONNX de forma fija.

A diferencia de los pesos originales en PyTorch, esta build fija las formas de entrada y salida, usa pesos y cómputo en fp16 con entradas y salidas en fp32, y precalcula los *positional encodings* independientes de la entrada. La entrada es de 1024×1024, la resolución con la que se entrenó SAM 2, y las características de imagen resultantes son de 64×64. El repositorio ocupa 0,1 GB, por lo que los pesos son lo bastante ligeros para caber en GPUs integradas y equipos de consumo.

Su relevancia actual está en llevar segmentación y seguimiento de objetos a aplicaciones web (editores de vídeo, herramientas de anotación, procesado local con privacidad) aprovechando WebGPU, sin depender de infraestructura en la nube. Se distribuye con licencia Apache 2.0 y se usa en la herramienta de máscara de objetos de Diffusion Studio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SAM 2.1: codificador de imagen Hiera jerárquico, codificador de memoria, atención de memoria, decodificador de máscara y *object pointers*; exportada como 5 grafos ONNX de forma fija |
| Parámetros totales | no disponible en la información proporcionada (modelo base: facebook/sam2.1-hiera-small) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica como contexto de texto; memoria de vídeo de SAM 2: fotograma indicado + 6 fotogramas recientes + 16 *object pointers* (R = 7·64² + 64 = 28.736 tokens) |
| Tipos de cuantización | fp16 en pesos y cómputo, con entradas y salidas en fp32 (conversión en cada frontera de grafo); existe una variante Hiera-Tiny con entrada 512 |
| Idiomas soportados | no aplica (modelo de visión; no procesa lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (5 grafos: vision_encoder, mask_decoder, memory_encoder, memory_attention, pointer_tpos) más constants.json; no incluye safetensors ni GGUF |
| Resolución de entrada | 1×3×1024×1024 (fija), con características de imagen de 64×64 |
| Salidas | low_res_mask 1×1×256×256, high_res_mask 1×1×1024×1024, iou 1×1, object_score_logits 1×1×1, object_pointer 1×1×256 |
| Tamaño del repositorio | 0,1 GB |
| Runtime objetivo | ONNX Runtime Web 1.30 con WebGPU |

## Arquitectura y entrenamiento

Se trata de una arquitectura de segmentación promptable de SAM 2.1, no de un transformer de lenguaje. El grafo `vision_encoder.onnx` procesa el fotograma de entrada (1×3×1024×1024) y produce tres escalas de características (1×32×256×256, 1×64×128×128 y 1×256×64×64), además de la variante `feats2_no_mem` para el fotograma indicado y los *position embeddings* de visión. El grafo `mask_decoder.onnx` recibe puntos e etiquetas (`input_points [1,1,N,2]`, `input_labels [1,1,N]` en int32) y devuelve máscara de baja y alta resolución, IoU estimada, logits de puntuación de objeto y un *object pointer* de 256 dimensiones. El banco de memoria se construye con `memory_encoder.onnx` (tokens de 64 dimensiones a partir de las características y la máscara de alta resolución) y se consume en `memory_attention.onnx`, que condiciona las características actuales con la memoria acumulada. `pointer_tpos.onnx` calcula la codificación posicional temporal de los punteros a partir de 16 diferencias normalizadas.

El decodificador replica la lógica del predictor de vídeo: explora varias máscaras candidatas cuando hay como máximo un punto real (todos los fotogramas rastreados y el clic único) y, en caso contrario, usa una sola máscara con reserva por estabilidad. Además, las máscaras y los *object pointers* se suprimen dentro del grafo cuando `object_score_logits` ≤ 0. El banco de memoria conserva el fotograma indicado, los 6 fotogramas rastreados más recientes y 16 *object pointers* representados como 4 tokens cada uno. Los detalles de datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada: la model card solo documenta la exportación, realizada con el port de `transformers` (Sam2VideoModel, transformers 5.17) siguiendo el diseño de grafos de `square-zero-labs/sam2.1-tiny-video-onnx`. Entre las decisiones técnicas destacan las formas fijas, la precisión mixta fp16/fp32 y el precalculado en float32 de los *position encodings* independientes de la entrada.

## Capacidades

- Segmentación promptable de objetos en vídeo e imagen a partir de puntos y etiquetas.
- Seguimiento de objetos fotograma a fotograma mediante banco de memoria (fotograma indicado, 6 recientes y 16 *object pointers*).
- Generación de máscaras en dos resoluciones: logits del decodificador a 256×256 y máscara final a 1024×1024.
- Estimación de calidad mediante `iou` y `object_score_logits`, con supresión de máscara y *pointer* cuando la puntuación de objeto es menor o igual que cero.
- Selección automática entre múltiples máscaras candidatas cuando hay un único punto real, con reserva por estabilidad en el resto de casos.
- Ejecución en navegador mediante ONNX Runtime Web y WebGPU, con pesos fp16 y fronteras de grafo en fp32.
- No incorpora *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: no procesa ni genera texto.
- No realiza visión general (captioning, VQA); su única tarea es la segmentación y el seguimiento.

## Casos de uso

- Herramienta de máscara de objetos en editor de vídeo web: es el uso real declarado por Diffusion Studio; el modelo se integra en el navegador y permite aislar un objeto sobre el que el usuario hace clic y mantenerlo rastreado durante el clip.
- Rotoscopia y aislamiento de sujetos en postproducción: con la máscara de alta resolución de 1024×1024 se pueden extraer recortes limpios de personas u objetos para composición, sin salir de la aplicación.
- Pre-anotación de datasets de vídeo: el seguimiento automático tras un clic reduce el trabajo manual en la creación de *masklets* para entrenar otros modelos de segmentación.
- Seguimiento de objetos para efectos visuales: al conservar los 6 fotogramas recientes y 16 punteros de objeto, mantiene la identidad del objeto en planos con movimiento moderado, lo que sirve para *tracking* de elementos gráficos.
- Procesado local con privacidad: al ejecutarse en WebGPU dentro del dispositivo, los fotogramas no se envían a ningún servidor, lo que encaja en flujos con material sensible (médico, legal, interno).
- Segmentación interactiva de imágenes en aplicaciones web: un solo fotograma con un clic se resuelve con la ruta de máscaras candidatas del decodificador, útil para herramientas de recorte y edición.
- Anotación asistida en plataformas de etiquetado: el modelo propone una máscara rastreada que el anotador corrige, acelerando la revisión de vídeos largos.
- Procesado por lotes en navegador o Node: al no requerir GPU de centro de datos, se puede desplegar en equipos de usuario final para tareas de segmentación no urgentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (IoU, J&F u otros) en la información disponible. El único dato de rendimiento documentado es la latencia del bucle completo de seguimiento, medida con ONNX Runtime Web 1.30 y WebGPU en un Apple M1 (GPU de 8 núcleos, enchufado):

| Configuración | Resolución de entrada | Precisión | Tiempo por fotograma rastreado | Entorno |
|---|---|---|---|---|
| Hiera-Small (este modelo) | 1024×1024 | fp16 | 1,9 s | Apple M1, GPU de 8 núcleos, ONNX Runtime Web 1.30, WebGPU |
| Hiera-Tiny (build de 512) | 512×512 | fp16 | 0,3 s | mismo entorno |

El banco de memoria contiene el fotograma indicado, los 6 fotogramas rastreados más recientes y 16 *object pointers*, lo que fija el coste de la atención de memoria con independencia de la duración del vídeo.

## Requisitos de hardware

- El repositorio completo ocupa 0,1 GB, por lo que el conjunto de pesos es muy reducido y no requiere GPUs de gama alta; la VRAM necesaria queda muy por debajo de la de un modelo de lenguaje de tamaño equivalente.
- Entorno verificado: Apple M1 con GPU de 8 núcleos, ONNX Runtime Web 1.30 y WebGPU, con 1,9 s por fotograma rastreado.
- GPU recomendadas: no se especifican; el modelo está pensado para GPUs de consumo e integradas con soporte de WebGPU (Apple Silicon, Intel, AMD y NVIDIA recientes). Las GPU de centro de datos (A100, H100) no son necesarias.
- Cabe en GPUs de consumo e integradas: el diseño de cinco grafos ONNX en fp16 y 0,1 GB de repositorio apunta a ejecución en navegador y equipos de usuario final.
- Opciones de despliegue documentadas: ONNX Runtime Web 1.30 con WebGPU. Otros ejecutores (ONNX Runtime nativo, TensorRT, DirectML) no están documentados en la información proporcionada.
- No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia estimada: 1,9 s por fotograma en el entorno medido (aproximadamente 0,53 fotogramas por segundo); no permite tiempo real en vídeo a 30 fps.
- Las formas son fijas (1×3×1024×1024 y un fotograma por pasada), por lo que no hay *batching* variable de fotogramas.
- El script de exportación es `packages/sam2/scripts/export.py` del repositorio de Diffusion Studio, con la invocación `export.py small 1024 7 <out-dir>`.

## Comparativa con modelos similares

| Modelo | Formato | Resolución de entrada | Precisión | Latencia por fotograma | Licencia |
|---|---|---|---|---|---|
| diffusionstudio/sam2.1-small-video-onnx-fp16 | ONNX, 5 grafos | 1024×1024 | fp16 | 1,9 s (Apple M1, 8 núcleos) | apache-2.0 |
| diffusionstudio/sam2.1-tiny-video-onnx-fp16 | ONNX | 512×512 | fp16 | 0,3 s (mismo entorno) | no disponible en la información proporcionada |
| square-zero-labs/sam2.1-tiny-video-onnx | ONNX | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| facebook/sam2.1-hiera-small | PyTorch (transformers) | 1024×1024 (según el modelo base) | no disponible | no disponible | no disponible en la información proporcionada |

El número de parámetros, la longitud de contexto y los resultados de precisión no están disponibles para ninguno de los modelos comparados en la información proporcionada. La diferencia documentada entre las dos builds de Diffusion Studio es la resolución de entrada (1024 frente a 512) y la latencia asociada; la variante pequeña prioriza velocidad sobre detalle.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta *tool calling*, ni agentes, ni capacidades multilingües; cualquier caso de uso conversacional queda fuera de su alcance.
- No se publican en esta ficha el número de parámetros, la composición del dataset de entrenamiento ni métricas de precisión; no se pueden hacer afirmaciones cuantitativas sobre calidad de segmentación.
- La memoria de vídeo está acotada al fotograma indicado, 6 fotogramas recientes y 16 *object pointers*; oclusiones prolongadas, cambios bruscos de apariencia o salidas de plano pueden provocar la pérdida del objeto.
- La entrada es fija (1×3×1024×1024) y cada pasada procesa un único fotograma; no admite resoluciones arbitrarias ni lotes variables.
- El cómputo en fp16 con conversiones a fp32 en las fronteras de grafo puede introducir diferencias numéricas respecto a una ejecución en fp32, con posible impacto en los bordes de la máscara.
- La latencia medida (1,9 s por fotograma en un Apple M1) no permite tiempo real; en vídeos largos conviene plantear procesado por lotes o la variante de 512.
- El rendimiento depende de la implementación de WebGPU del navegador y del equipo; no hay datos publicados en otras GPU o *runtimes*.
- El repositorio no registra descargas ni *likes* en el momento de la consulta, por lo que carece de validación externa de la comunidad.
- La licencia del repositorio es Apache 2.0, pero conviene verificar los términos del modelo base y de los datasets de entrenamiento, no detallados aquí, antes de un uso comercial.
- Al ser un modelo de visión, los sesgos relevantes son de dominio de imagen (iluminación, tipo de objeto, resolución) y no lingüísticos; no se documentan evaluaciones de sesgo.
- La máscara de mayor resolución es de 1024×1024; no se generan máscaras a resoluciones superiores.

## Enlaces

- https://huggingface.co/diffusionstudio/sam2.1-small-video-onnx-fp16
- https://huggingface.co/facebook/sam2.1-hiera-small
- https://github.com/diffusionstudio
- https://huggingface.co/square-zero-labs/sam2.1-tiny-video-onnx
- https://huggingface.co/diffusionstudio/sam2.1-tiny-video-onnx-fp16
- Paper técnico de SAM 2.1: no disponible en la información proporcionada.
