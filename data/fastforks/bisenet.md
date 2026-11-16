# fastforks/bisenet

## Resumen

BiSeNet para face parsing es una implementación del modelo BiSeNet (Yu et al., 2018) especializada en la segmentación semántica de rostros, distribuida a través del ecosistema fastforks. El modelo divide una imagen de rostro en 19 clases de partes faciales (piel, cejas, ojos, gafas, orejas, pendientes, nariz, boca, labios, cuello, collar, ropa, pelo, sombrero, entre otras) sobre un recorte facial de 512 x 512 píxeles. Es el parser que utilizan pipelines de restauración facial como GFPGAN y CodeFormer a través de la librería facexlib.

La arquitectura combina una ruta de contexto basada en ResNet-18 con un módulo de refinamiento por atención y fusión de características, un diseño pensado para mantener precisión en los bordes a la vez que reduce el coste computacional frente a segmentadores de alta resolución convencionales. El repositorio de Hugging Face actúa únicamente como model card: no aloja pesos, sino que documenta las variantes, sus enlaces de descarga, los hashes SHA-256 de verificación y las mediciones de rendimiento del runtime fastforks.

Su relevancia práctica radica en que es un componente pequeño, rápido y verificable dentro de pipelines de visión por computador: en una RTX 5060 Ti 16 GB procesa una imagen de 512 x 512 en 2,41 ms con el backend portable en fp16, con un pico de memoria de 51 MiB asignados. La licencia del código es MIT, aunque el dataset de entrenamiento (CelebAMask-HQ) está restringido a investigación no comercial, una caveat que conviene revisar antes de un despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BiSeNet: ruta de contexto ResNet-18 + módulo de refinamiento por atención y fusión de características |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de segmentación de imagen, no de texto) |
| Tipos de cuantización | fp32 (original), fp16 (portable y kernels); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT (código y pesos según la model card); dataset CelebAMask-HQ restringido a investigación no comercial |
| Formato de pesos | `.pth` (PyTorch, `parsing_bisenet.pth`); no se distribuyen pesos en el repo de Hugging Face |
| Tarea | Segmentación semántica (image-segmentation), face parsing |
| Clases de salida | 19 clases de partes faciales (CelebAMask-HQ) |
| Tamaño de entrada | cualquier H x W >= 1; redimensionado o padding interno; probado a 512 x 512 |
| Salida | etiquetas por píxel `[H, W]` o logits con `logits=True` |
| Backends | `portable` (no hay backend `kernels` por ser más lento) |
| Librería | fastforks (`pip install fastforks`) |

## Arquitectura y entrenamiento

BiSeNet es una red de segmentación semántica en tiempo real que separa el flujo de trabajo en dos ramas: una ruta de contexto, aquí una ResNet-18 inicializada con pesos de ImageNet-1k (ILSVRC 2012), que extrae características globales de bajo coste, y una ruta espacial de alta resolución que preserva los detalles finos. Ambas se combinan mediante un módulo de fusión de características y se refinan con un módulo de atención, lo que permite obtener contornos precisos en partes faciales pequeñas (ojos, labios, pendientes) sin el coste de un backbone de alta resolución completo.

El entrenamiento del parser se realizó sobre CelebAMask-HQ, un conjunto de 30 000 rostros de CelebA-HQ anotados con 19 máscaras de partes faciales, según el `train.py` de face-parsing.PyTorch referenciado en la model card. La ResNet-18 se inicializa desde los pesos de clasificación de ImageNet de torchvision. No se documentan en la información disponible detalles sobre número de épocas, aumentos de datos, función de pérdida exacta ni si hubo etapas de refinamiento adicionales.

La innovación técnica destacable en esta distribución no está en el modelo en sí, sino en el runtime fastforks: verificación de pesos mediante SHA-256 contra los ficheros originales de los autores, paridad numérica comprobada frente al código de referencia (máximo |diff| <= 2,6e-05 en CPU fp32; error absoluto medio <= 0,0042 y p99 <= 0,02 en GPU fp16) y soporte de `torch.compile` y TensorRT fp16, que reducen el tiempo de inferencia de 2,41 ms a 1,34 ms y 0,678 ms respectivamente a 512 x 512.

## Capacidades

- Segmentación semántica densa de rostros en 19 clases: piel, cejas, ojos, gafas, orejas, pendientes, nariz, boca, labios, cuello, collar, ropa, pelo, sombrero y otras partes definidas por CelebAMask-HQ.
- Generación de máscaras por píxel con resolución de entrada flexible (cualquier H x W >= 1, con redimensionado o padding interno).
- Salida en formato de etiquetas de clase (`result.labels`, matriz `[H, W]`) o de logits sin normalizar (`logits=True`) para post-procesado propio.
- Integración como componente de pipelines de restauración facial (GFPGAN, CodeFormer) a través de facexlib.
- Ejecución en CPU (fp32) y GPU (fp16) con paridad numérica verificada frente al código original.
- Compatibilidad con `torch.compile` y exportación a TensorRT fp16 para despliegues de baja latencia.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente visual de segmentación.

## Casos de uso

- Restauración facial en pipelines de GFPGAN o CodeFormer: el parser genera la máscara de partes faciales que estos modelos usan para aplicar la restauración solo en las regiones relevantes (piel, ojos, labios) y preservar el resto de la imagen intacto. Es su uso original y el más contrastado.
- Edición facial selectiva en herramientas de retoque: con la máscara de 19 clases se pueden aplicar filtros, cambios de tono o maquillaje virtual únicamente sobre labios, ojos o piel, evitando sangrado hacia el pelo o la ropa.
- Preprocesado para reconocimiento facial y análisis biométrico: la segmentación permite recortar la región facial, eliminar fondo y accesorios (gafas, sombrero) antes de alimentar un modelo de verificación de identidad.
- Generación de datasets sintéticos y aumentación de datos: las máscaras por píxel permiten componer caras sobre nuevos fondos, transferir regiones entre imágenes o generar pares imagen-máscara para entrenar otros segmentadores.
- Moderación de contenido y análisis de atributos visuales: detectar presencia de gafas, sombrero, collar o pendientes a partir de las clases segmentadas para clasificación de imágenes en catálogos o redes sociales.
- Animación y avatares digitales: la máscara de partes faciales sirve para dirigir rigs de blendshapes o texturas en tiempo real, con latencia de 2,41 ms por fotograma a 512 x 512 en una GPU consumer, lo que permite procesar vídeo a más de 400 fps teóricos por instancia.
- Procesamiento por lotes en servidores sin GPU: el backend CPU en fp32 mantiene la paridad numérica con el original (|diff| <= 2,6e-05) y permite segmentar caras en pipelines de ingesta donde no hay acelerador disponible.

## Benchmarks y rendimiento

Rendimiento medido en una RTX 5060 Ti 16 GB (sm_120), entrada 512 x 512, según la model card:

| Modelo | Entrada | Tiempo original fp32 | Tiempo original | Tiempo portable | Memoria pico original (MiB, asignada/reservada) | Memoria pico portable (MiB) |
|---|---|---|---|---|---|---|
| `bisenet-face-parsing` | 512 x 512 | no disponible | 5,94 ms | 2,41 ms | 69 / 94 | 51 / 72 |

| Modelo | Entrada | Portable | torch.compile | TensorRT fp16 | Compilación (primera llamada) | Construcción ONNX + engine |
|---|---|---|---|---|---|---|
| `bisenet-face-parsing` | 512 x 512 | 2,41 ms | 1,34 ms | 0,678 ms | 5,79 s | 12,9 s |

| Modelo | Carga (s) original | Carga (s) portable | Primera llamada (s) original | Primera llamada (s) portable |
|---|---|---|---|---|
| `bisenet-face-parsing` | 0,31 | 0,20 | 0,41 | 0,28 |

Paridad numérica frente al código original: en CPU fp32, máximo |diff| <= 2,6e-05; en GPU fp16, error absoluto medio <= 0,0042 y p99 <= 0,02 sobre los logits de salida. No se han publicado métricas de calidad de segmentación (mIoU, F1 por clase) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 51 MiB asignados y 72 MiB reservados en fp16 a 512 x 512 con el backend portable; 69/94 MiB en el original fp32. Con TensorRT fp16, 85/110 MiB incluyendo engine y runtime de torch.
- GPU recomendadas: cualquier GPU CUDA con al menos ~1 GB libre; el modelo se ha validado en una RTX 5060 Ti 16 GB (sm_120). Funciona igualmente en A100, H100, RTX 4090 y GPUs de gama media, dado su reducido tamaño.
- Cabe holgadamente en cualquier GPU consumer, incluidas las de gama de entrada con 4 GB o menos, y también en CPU.
- Opciones de despliegue: librería `fastforks` (`segmentation.load("bisenet-face-parsing")`), ejecución directa con PyTorch, `torch.compile` y TensorRT fp16. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de segmentación.
- Latencia y throughput: 2,41 ms por imagen a 512 x 512 en portable fp16, 1,34 ms con `torch.compile` y 0,678 ms con TensorRT fp16; carga del modelo en 0,20 s y primera llamada en 0,28 s con el backend portable. El backend `kernels` se descartó por ser más lento (2,77 ms frente a 2,41 ms).

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BiSeNet face parsing (fastforks) | Face parsing, 19 clases | BiSeNet (ResNet-18 + atención) | 512 x 512, flexible | MIT (código y pesos); dataset CelebAMask-HQ no comercial | Hugging Face (model card) + facexlib |
| BiSeNet face parsing (face-parsing.PyTorch original) | Face parsing, 19 clases | BiSeNet (ResNet-18 + atención) | 512 x 512 | MIT (código); pesos vía facexlib | GitHub zllrunning/face-parsing.PyTorch |
| facexlib parsing (xinntao) | Face parsing, 19 clases | BiSeNet | 512 x 512 | MIT | GitHub xinntao/facexlib, pesos en releases |

No se dispone en la información proporcionada de comparativas con otros segmentadores faciales (p. ej. Mask2Former, SegFormer o modelos específicos de face parsing de otros autores), ni de métricas de calidad (mIoU, F1) que permitan una comparación cuantitativa. La comparativa se limita a las tres distribuciones del mismo modelo BiSeNet.

## Limitaciones y advertencias

- El repositorio de Hugging Face no contiene pesos: solo es una model card. Los pesos se descargan de los enlaces de los autores y se verifican contra el SHA-256 documentado; sin esa verificación no hay garantía de integridad.
- El dataset de entrenamiento, CelebAMask-HQ, está restringido a investigación no comercial según la model card. Aunque el código y los pesos se declaran MIT, conviene revisar las condiciones del dataset antes de un uso comercial.
- La model card califica el modelo como de tier "experimental" y el paquete fastforks como de uso en investigación; no está validado para producción crítica.
- Riesgo de sesgo: CelebAMask-HQ deriva de CelebA-HQ, con sesgos demográficos conocidos en cuanto a etnia, edad, género e iluminación. La precisión puede degradarse en rostros fuera de la distribución de entrenamiento.
- Limitaciones de entrada: está pensado para recortes faciales; en imágenes con múltiples caras, oclusiones severas, perfiles extremos o resoluciones muy bajas, la segmentación puede ser imprecisa.
- La salida son logits o etiquetas por píxel; no incluye post-procesado (suavizado, morfología) ni detección de rostro previa, que debe aportarla el pipeline que lo integra.
- No hay backend `kernels` optimizado: se midió más lento que el portable (2,77 ms frente a 2,41 ms) y se descartó, por lo que la aceleración máxima disponible pasa por TensorRT fp16.
- No se han publicado métricas de calidad de segmentación (mIoU, F1 por clase) en la información disponible, lo que dificulta evaluar su precisión absoluta frente a alternativas.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/bisenet
- Repositorio fastforks: https://github.com/kleinicke/fastforks
- Kernels para el backend `kernels`: https://huggingface.co/fastforks/kernels
- Pesos originales (`parsing_bisenet.pth`): https://github.com/xinntao/facexlib/releases/download/v0.2.0/parsing_bisenet.pth
- Código original facexlib (commit `260620ae9399`): https://github.com/xinntao/facexlib
- face-parsing.PyTorch (commit `d2e684cf1588`): https://github.com/zllrunning/face-parsing.PyTorch
- Documentación de benchmarks de fastforks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Paper de BiSeNet (Yu et al., 2018): no disponible en la información proporcionada
