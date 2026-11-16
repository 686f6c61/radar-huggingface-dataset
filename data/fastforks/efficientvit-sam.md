# fastforks/efficientvit-sam

## Resumen
EfficientViT-SAM es un modelo de segmentación de imágenes guiada por prompts (promptable segmentation) desarrollado por el MIT Han Lab (Zhang, Cai et al., 2024). Sustituye el codificador de imagen ViT-H del Segment Anything Model (SAM) original por un EfficientViT, una arquitectura híbrida de etapas convolucionales y atención lineal con ReLU, destilada del propio ViT-H de SAM. Conserva el codificador de prompts y el decodificador de máscaras de SAM, de modo que acepta puntos, cajas y logits de máscara con la misma interfaz que el modelo original.

El repositorio `fastforks/efficientvit-sam` no aloja pesos: es una model card de integración que descarga los pesos de los autores desde `mit-han-lab/efficientvit-sam` y los verifica contra hashes SHA-256. Proporciona variantes l0, l1, l2, xl0 y xl1, todas bajo licencia Apache-2.0 con uso comercial permitido, y dos backends (`portable` y `kernels`) con métricas de latencia y memoria medidas en una RTX 5060 Ti de 16 GB.

Su relevancia radica en el coste computacional: frente al SAM ViT-H, el codificador EfficientViT reduce el tiempo de inferencia a decenas de milisegundos y el pico de memoria a menos de 1 GiB, lo que permite segmentación promptable en tiempo real sobre GPUs de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EfficientViT (etapas convolucionales + atención lineal ReLU) como codificador de imagen, destilado de SAM ViT-H; codificador de prompts y decodificador de máscaras de SAM |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen de cualquier H x W >= 1, redimensionada internamente a 1024x1024) |
| Tipos de cuantización | no disponible (se reportan ejecuciones en fp16 y fp32; TensorRT con motor fp32 del codificador de imagen) |
| Idiomas soportados | no disponible (modelo de segmentación de imágenes; los tags no declaran idiomas) |
| Licencia | Apache-2.0 (pesos y código); dataset SA-1B bajo licencia de investigación |
| Formato de pesos | `.pt` (PyTorch); exportación ONNX y TensorRT documentada |

Variantes disponibles: `efficientvit-sam-l0@1`, `l1@1`, `l2@1`, `xl0@1`, `xl1@1`. Salidas del modelo: `pred_masks` e `iou_scores`.

## Arquitectura y entrenamiento
El modelo sigue el esquema de SAM pero reemplaza el pesado codificador ViT-H por un EfficientViT compuesto por etapas convolucionales y bloques de atención lineal con activación ReLU, lo que reduce la complejidad cuadrática de la atención. El codificador de imagen se destila del ViT-H de SAM y posteriormente se entrena sobre SA-1B (11 millones de imágenes con licencia y 1100 millones de máscaras generadas automáticamente), según el paper. El codificador de prompts y el decodificador de máscaras se mantienen compatibles con SAM, por lo que puntos, cajas y logits de máscara funcionan igual que en el modelo original.

La innovación principal es la eficiencia: el módulo portable expone únicamente el codificador de imagen, y el backend `kernels` (publicado en `fastforks/kernels`) acelera la inferencia hasta 5,9x respecto al código original en la variante l0. Se documenta además compatibilidad con `torch.compile` y exportación a TensorRT, con tiempos de preparación de entre 19,9 s y 25,2 s para la compilación y construcción del motor.

## Capacidades
- Segmentación promptable: genera máscaras a partir de un punto, una caja o un prompt de texto sobre una imagen de entrada.
- Salida de máscaras con puntuaciones de calidad (`pred_masks`, `iou_scores`).
- Compatibilidad de interfaz con SAM: el codificador de prompts y el decodificador de máscaras aceptan los mismos formatos que el modelo original.
- Procesamiento de imágenes de resolución arbitraria (H x W >= 1), redimensionadas internamente a 1024x1024.
- Ejecución en fp16 y fp32; exportación a ONNX y TensorRT.
- Backends `portable` y `kernels` para distintos compromisos de latencia y portabilidad.
- Verificación de integridad de pesos mediante SHA-256 en la carga.
- No se documentan capacidades de generación de texto, razonamiento, código, tool calling ni agentes: es un modelo exclusivamente de visión.

## Casos de uso
- Segmentación interactiva en herramientas de edición de imagen: el usuario hace clic en un punto o dibuja una caja y el modelo devuelve la máscara del objeto en 4,45 ms (l0, backend `kernels`, 1024x1024), lo que permite respuesta en tiempo real.
- Anotación automática de datasets: generar máscaras preliminares sobre lotes de imágenes con SA-1B como referencia, reduciendo el trabajo manual de etiquetado en pipelines de visión por computador.
- Recorte y extracción de objetos en producción: con un pico de 0,2 GiB en fp16 para l0 a 1080x1920, cabe en GPUs de consumo y permite procesar flujos de imágenes en servidores modestos.
- Segmentación en dispositivos con VRAM limitada: las variantes l0, l1 y l2 se ejecutan por debajo de 0,3 GiB de memoria reservada, aptas para estaciones de trabajo con RTX 5060 Ti o similares.
- Preprocesado para otros modelos: usar las máscaras como entrada para clasificación, detección o edición generativa, aprovechando la compatibilidad de formato con SAM.
- Segmentación guiada por texto en asistentes visuales: el prompt de texto se procesa con el codificador de prompts de SAM para aislar regiones descritas por el usuario.
- Despliegue de baja latencia con TensorRT: el motor fp32 del codificador de imagen alcanza 5,56 ms en l0, adecuado para aplicaciones de vídeo o robótica que requieren inferencia por fotograma.

## Benchmarks y rendimiento
Datos medidos en una RTX 5060 Ti de 16 GB, segmentación promptable sintética a 1024x1024 (tiempos en ms; memoria en MiB, asignada/reservada):

| Modelo | Original fp32 | Portable | Kernels | Aceleración kernels vs original | Memoria original | Memoria portable | Memoria kernels |
|---|---|---|---|---|---|---|---|
| efficientvit-sam-l0 | 26,9 | 12,7 | 4,45 | 5,9x | 211 / 232 | 171 / 210 | 176 / 256 |
| efficientvit-sam-l1 | 30,1 | 14,4 | 5,79 | 5,2x | 260 / 278 | 195 / 234 | 203 / 284 |
| efficientvit-sam-l2 | 34,4 | 17,8 | 6,83 | 5,0x | 313 / 344 | 221 / 260 | 232 / 312 |
| efficientvit-sam-xl0 | 46,9 | 19,0 | 9,75 | 2,9x | 654 / 670 | 433 / 506 | 401 / 492 |
| efficientvit-sam-xl1 | 72,6 | 28,9 | 15,3 | 2,7x | 984 / 1022 | 598 / 676 | 582 / 728 |

Tiempos de carga y primera llamada (segundos):

| Modelo | Carga original | Carga portable | Carga kernels | Primera llamada original | Primera llamada portable | Primera llamada kernels |
|---|---|---|---|---|---|---|
| l0 | 0,35 | 0,83 | 1,63 | 0,82 | 0,72 | 0,25 |
| l1 | 0,31 | 0,76 | 1,64 | 0,03 | 0,69 | 0,25 |
| l2 | 0,39 | 0,93 | 1,78 | 0,04 | 0,66 | 0,25 |
| xl0 | 0,62 | 2,67 | 2,14 | 0,59 | 0,52 | 0,26 |
| xl1 | 1,06 | 2,32 | 2,51 | 0,04 | 0,53 | 0,24 |

`torch.compile` y TensorRT (1024x1024, tiempos en ms; preparación en s; memoria en MiB):

| Modelo | Portable | torch.compile | TensorRT fp16 | Kernels | Compilación (cold) | ONNX + engine | Memoria portable | Memoria compile | Memoria kernels | Memoria TensorRT |
|---|---|---|---|---|---|---|---|---|---|---|
| l0 | 12,7 | 6,44 | 5,56 | 4,45 | 25,2 | 19,9 | 171 / 210 | 188 / 228 | 176 / 256 | 404 / 428 |
| l1 | 14,4 | 11,3 | 7,30 | 5,79 | 24,8 | 22,0 | 195 / 234 | 212 / 252 | 203 / 284 | 517 / 578 |
| l2 | 17,8 | no disponible | no disponible | 6,83 | no disponible | no disponible | 221 / 260 | no disponible | 232 / 312 | no disponible |

No se han publicado resultados de benchmarks de calidad de segmentación (mIoU, AP) en la información disponible.

## Requisitos de hardware
- VRAM estimada: entre 0,2 GiB (l0, portable, 1080x1920) y 0,7 GiB (xl1, kernels, 1080x1920) en fp16.
- Pico de memoria a 1024x1024: de 171 MiB (l0 portable) a 1022 MiB (xl1 original).
- GPU recomendadas: cualquier GPU con al menos 1 GiB de VRAM libre; las pruebas se realizaron en una RTX 5060 Ti de 16 GB.
- Cabe en GPUs de consumo: sí, todas las variantes, incluidas l0, l1 y l2 con menos de 0,3 GiB reservados.
- Opciones de despliegue: backend `portable` (PyTorch), backend `kernels` (kernels optimizados), `torch.compile`, exportación ONNX y TensorRT (motor fp32 del codificador de imagen).
- Latencia: 4,45 ms (l0, kernels) a 28,9 ms (xl1, portable) a 1024x1024; TensorRT fp16 alcanza 5,56 ms en l0.
- Throughput: no disponible de forma explícita; puede estimarse a partir de la latencia por imagen.

## Comparativa con modelos similares
| Modelo | Codificador | Latencia (1024x1024) | Memoria pico | Licencia | Uso comercial |
|---|---|---|---|---|---|
| efficientvit-sam-l0 (kernels) | EfficientViT | 4,45 ms | 176 / 256 MiB | Apache-2.0 | Sí |
| efficientvit-sam-xl1 (kernels) | EfficientViT | 15,3 ms | 582 / 728 MiB | Apache-2.0 | Sí |
| SAM ViT-H (original) | ViT-H | no disponible en esta ficha | no disponible | Apache-2.0 (con LICENSE-segment-anything) | Sí, sujeto a licencia |
| EfficientViT-SAM original (fp32) | EfficientViT | 26,9 ms (l0) a 72,6 ms (xl1) | 211 a 984 MiB | Apache-2.0 | Sí |

No se dispone de datos de otros modelos de segmentación promptable (por ejemplo, MobileSAM o FastSAM) en la información proporcionada, por lo que la comparativa se limita a las variantes y al código original.

## Limitaciones y advertencias
- El repositorio no aloja pesos: la disponibilidad depende de los enlaces de los autores y de la verificación SHA-256; si cambian, la carga puede fallar.
- La licencia del dataset SA-1B es de investigación; el uso comercial del modelo entrenado con él debe revisarse, aunque los pesos se declaran Apache-2.0.
- El código original se describe como paquete de uso de investigación; conviene comprobar las cadenas de licencia (`LICENSE`, `LICENSE-segment-anything`) antes de otros usos.
- Riesgo de alucinación de máscaras en regiones ambiguas o con objetos solapados; no se documentan métricas de calidad en esta ficha.
- No hay información sobre sesgos demográficos o de dominio del dataset SA-1B.
- El modelo solo procesa visión: no admite texto generativo, tool calling ni agentes.
- La entrada se redimensiona internamente a 1024x1024, lo que puede degradar la precisión en imágenes con objetos muy pequeños o relaciones de aspecto extremas.
- No se documentan idiomas soportados ni capacidades multilingües.
- Las cifras de rendimiento corresponden a una RTX 5060 Ti de 16 GB; en otro hardware pueden variar.

## Enlaces
- Hugging Face (integración): https://huggingface.co/fastforks/efficientvit-sam
- Pesos de los autores: https://huggingface.co/mit-han-lab/efficientvit-sam
- Repositorio de código de fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Código original: https://github.com/mit-han-lab/efficientvit (commit `de7d7733cc03`)
- Ficha de variantes y hashes: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/promptable_segmentation/models/efficientvit_sam/card.toml
- Evidencia de licencia: https://huggingface.co/mit-han-lab/efficientvit-sam/blob/a2f0c5929196a13ef1ffc9338d3f9e482e1e0e68/README.md
- Licencia del código original: https://github.com/mit-han-lab/efficientvit/blob/de7d7733cc0329f391b33f1f459271562ec27bd5/LICENSE
