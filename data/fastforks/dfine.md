# fastforks/dfine

## Resumen

D-FINE es un detector de objetos en tiempo real de tipo end-to-end desarrollado por Peng et al. (USTC, 2025). Sigue la estela de RT-DETR: emplea un backbone HGNetV2, un encoder híbrido y un decoder con atención deformable sobre 300 consultas seleccionadas, eliminando por completo la necesidad de NMS (Non-Maximum Suppression) en el postprocesado. Su innovación principal es el refinamiento fino de distribuciones (fine-grained distribution refinement): cada capa del decoder refina cada borde de la caja como una distribución sobre distancias, lo que mejora la localización progresivamente capa a capa.

El repositorio `fastforks/dfine` no contiene pesos: es una model card que actúa como manifiesto. La librería fastforks descarga los pesos originales de los repositorios del autor (`ustc-community/dfine-*-coco`) y los verifica contra hashes SHA-256. Se ofrecen cinco variantes (N, S, M, L, X) entrenadas sobre COCO 2017, todas bajo licencia Apache-2.0 y con uso comercial permitido.

La relevancia de esta ficha radica en que fastforks proporciona backends optimizados (`portable` y `kernels`) que aceleran la inferencia entre 1,3x y 3,8x respecto al código original en fp16, con reducciones notables de memoria. Los benchmarks publicados en la model card permiten evaluar el coste real en una GPU de consumo (RTX 5060 Ti, 16 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | D-FINE: backbone HGNetV2, encoder híbrido, decoder con atención deformable sobre 300 consultas; sin NMS |
| Parametros totales | no disponible (cinco variantes: N, S, M, L, X; cifras por variante no publicadas en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión); entrada de cualquier H x W >= 32, con padding a múltiplo de 32 |
| Tipos de cuantizacion | fp16 y fp32 en los benchmarks; TensorRT fp16; no se documentan otras cuantizaciones (int8, GGUF) |
| Idiomas soportados | no disponible (modelo de detección de objetos, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 (código y pesos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

D-FINE es un transformer de detección end-to-end. El backbone HGNetV2 parte de preentrenamiento en ImageNet-1k (ILSVRC 2012) y alimenta un encoder híbrido que combina atención y convolución para extraer características multiescala. El decoder aplica atención deformable sobre 300 consultas seleccionadas y refina iterativamente las cajas: cada capa modela cada borde como una distribución sobre distancias, lo que constituye la innovación técnica central del trabajo. La salida son logits de clase y cajas normalizadas, sin necesidad de NMS.

El entrenamiento se realizó sobre COCO 2017 (split de train, anotaciones de instancia). La model card no detalla el número de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables en un detector). Tampoco se documentan técnicas como decodificación especulativa, al no ser un modelo generativo. Las variantes N, S, M, L y X corresponden a distintos tamaños del backbone HGNetV2.

## Capacidades

- Detección de objetos end-to-end: devuelve cajas, etiquetas de clase y puntuaciones en una sola pasada, sin NMS.
- Segmentación de instancias: la model card indica que la salida incluye máscaras de instancia, aunque el pipeline principal es object-detection.
- Clasificación COCO: 80 clases del dataset COCO 2017.
- Entrada de resolución variable: cualquier H x W >= 32, con padding a múltiplo de 32; probado hasta 3000x4000.
- Backends de inferencia: `portable` (PyTorch) y `kernels` (kernels optimizados publicados en `fastforks/kernels`).
- Compatibilidad con torch.compile y exportación a TensorRT fp16 / ONNX.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Vigilancia y videovigilancia en tiempo real: con latencias de 2,72 ms (variante N, backend kernels, 800x1344) permite procesar flujos de vídeo a alta frecuencia sin cuello de botella en postprocesado al no requerir NMS.
- Detección en imágenes de alta resolución: probado hasta 3000x4000 con picos de 0,5-0,6 GiB en fp16, adecuado para inspección de imágenes satelitales, médicas o de documentos donde los objetos son pequeños.
- Automatización industrial y control de calidad: la variante X ofrece mayor capacidad de detección para defectos en líneas de producción; la variante N cubre casos donde prima la latencia.
- Sistemas embebidos y edge computing: la variante N con 88 MiB de memoria pico (portable) y 1,4 ms con TensorRT fp16 cabe en GPUs de gama baja y permite despliegue en dispositivos con recursos limitados.
- Análisis de imágenes en pipelines de datos: integración en procesos batch para etiquetado automático, moderación de contenido visual o extracción de regiones de interés antes de un OCR.
- Investigación en detección de objetos: al ser Apache-2.0 y estar verificado contra el código original, sirve como baseline reproducible para comparar nuevas arquitecturas end-to-end sin NMS.
- Robótica y vehículos autónomos (prototipado): la combinación de baja latencia y salida directa de cajas sin NMS simplifica la integración en bucles de percepción en tiempo real.

## Benchmarks y rendimiento

Detección sobre entrada sintética de 800x1344, RTX 5060 Ti 16 GB (sm_120). Tiempos en ms; memoria pico en MiB (allocated / reserved).

| Modelo | Original fp32 (ms) | Original fp16 (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Memoria portable | Memoria kernels |
|---|---|---|---|---|---|---|---|
| dfine-l-coco | 37,1 | 44,9 | 16,2 | 8,70 | 4,3x | 152 / 172 | 179 / 300 |
| dfine-m-coco | 30,8 | 38,2 | 13,5 | 5,97 | 5,2x | 126 / 142 | 156 / 252 |
| dfine-n-coco | 24,3 | 29,1 | 10,3 | 2,72 | 8,9x | 88 / 116 | 124 / 202 |
| dfine-s-coco | 25,7 | 31,9 | 11,1 | 4,04 | 6,4x | 105 / 128 | 138 / 212 |
| dfine-x-coco | 44,9 | 54,6 | 18,5 | 14,1 | 3,2x | 227 / 258 | 237 / 364 |

Aceleración adicional con torch.compile y TensorRT (variante N, 800x1344):

| Modelo | Portable (ms) | torch.compile (ms) | TensorRT fp16 (ms) | Kernels (ms) | Memoria TensorRT (MiB) |
|---|---|---|---|---|---|
| dfine-n-coco | 10,3 | 5,4 | 1,4 | 2,72 | 94 |

Tiempos de carga y primera llamada (segundos):

| Modelo | Carga original | Carga portable | Carga kernels | Primera llamada original | Primera llamada portable | Primera llamada kernels |
|---|---|---|---|---|---|---|
| dfine-l-coco | 3,68 | 1,09 | 1,46 | 1,41 | 0,67 | 0,47 |
| dfine-m-coco | 3,63 | 1,04 | 1,20 | 1,55 | 0,69 | 0,56 |
| dfine-n-coco | 5,24 | 1,25 | 1,21 | 4,07 | 0,85 | 0,62 |
| dfine-s-coco | 2,99 | 1,05 | 1,16 | 1,44 | 0,71 | 0,52 |
| dfine-x-coco | 3,88 | 1,39 | 1,41 | 1,45 | 0,65 | 0,45 |

No se han publicado en la información disponible resultados de benchmarks de precisión (mAP en COCO, AP50, AP75) ni comparaciones numéricas con otros detectores. La model card menciona verificación de paridad con el código original, pero sin cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 88 MiB (variante N, portable, 800x1344) y 258 MiB (variante X, portable) en memoria pico reservada; en entradas de 3000x4000 los picos suben a 0,6-0,7 GiB reservados.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 1-2 GB de VRAM libre; los benchmarks se realizaron en una RTX 5060 Ti de 16 GB (sm_120). Para producción a gran escala se recomiendan A100, H100 o L40S por throughput agregado, aunque no se aportan cifras en esas GPUs.
- Cabe en GPU de consumo: sí, todas las variantes caben en GPUs de consumo (RTX 3060, 4060, 4090, etc.), incluso en modelos con 8 GB o menos.
- Opciones de despliegue: librería fastforks (backends `portable` y `kernels`), PyTorch nativo con torch.compile, exportación a ONNX y TensorRT fp16. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: según los benchmarks, la variante N alcanza 2,72 ms por imagen (800x1344, kernels) y 1,4 ms con TensorRT fp16; la variante X, 14,1 ms con kernels. El throughput no se reporta explícitamente, pero a 2,72 ms/imagen equivale a unas 368 imágenes por segundo en la variante N en la GPU de prueba.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| D-FINE (N/S/M/L/X) | Detector end-to-end sin NMS | no disponible | H x W >= 32, probado hasta 3000x4000 | Apache-2.0 | Pesos en ustc-community; manifiesto en fastforks |
| RT-DETR | Detector end-to-end sin NMS | no disponible | resolución variable | Apache-2.0 (según repo original) | Disponible en Hugging Face y GitHub |
| YOLOv8 / YOLOv11 | Detector con NMS | no disponible | resolución variable | AGPL-3.0 (Ultralytics) | Disponible en Ultralytics |
| DETR | Detector end-to-end sin NMS | no disponible | resolución fija | Apache-2.0 | Disponible en Facebook Research |

No se dispone en la información proporcionada de cifras de parámetros, mAP ni latencia de los modelos comparables, por lo que la comparación cuantitativa no está disponible. La ventaja diferencial de D-FINE frente a YOLO es la eliminación de NMS y la licencia Apache-2.0 (frente a AGPL-3.0 de Ultralytics); frente a DETR, la arquitectura en tiempo real con refinamiento distribucional de cajas.

## Limitaciones y advertencias

- El repositorio `fastforks/dfine` no aloja pesos: es solo una model card. La descarga depende de los repositorios de `ustc-community`, lo que introduce una dependencia externa y un paso de verificación SHA-256.
- No se han publicado cifras de precisión (mAP) en la información disponible; no es posible evaluar la calidad de detección frente a alternativas sin consultar el paper original.
- Modelo entrenado exclusivamente sobre COCO 2017 (80 clases): el rendimiento en dominios fuera de distribución (imágenes médicas, satelitales, industriales) no está documentado y requerirá fine-tuning.
- Riesgo de sesgo: el dataset COCO tiene sesgos conocidos de representación geográfica y demográfica; el modelo hereda esos sesgos en las clases y contextos que detecta.
- No es un modelo generativo: no soporta texto, tool calling, agentes ni razonamiento multi-paso; cualquier caso de uso que requiera esas capacidades necesita un modelo adicional.
- La licencia Apache-2.0 permite uso comercial, pero la model card advierte que el paquete original es "research-use" y recomienda revisar las cadenas de licencia antes de otros usos.
- Los benchmarks se realizaron en una única GPU (RTX 5060 Ti, sm_120); el rendimiento en otras arquitecturas (A100, H100) puede diferir y no está medido.
- La cuantización a int8 no está documentada; solo se validan fp16, fp32 y TensorRT fp16.
- El backend `kernels` consume más memoria reservada que `portable` en todas las variantes (por ejemplo, 300 MiB frente a 172 MiB en la variante L), lo que puede ser relevante en entornos con VRAM muy ajustada.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/dfine
- Repositorio fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Código original D-FINE: https://github.com/Peterande/D-FINE
- Pesos dfine-large-coco: https://huggingface.co/ustc-community/dfine-large-coco
- Pesos dfine-medium-coco: https://huggingface.co/ustc-community/dfine-medium-coco
- Pesos dfine-nano-coco: https://huggingface.co/ustc-community/dfine-nano-coco
- Pesos dfine-small-coco: https://huggingface.co/ustc-community/dfine-small-coco
- Pesos dfine-xlarge-coco: https://huggingface.co/ustc-community/dfine-xlarge-coco
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Fichero de configuración card.toml: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/detection/models/dfine/card.toml
