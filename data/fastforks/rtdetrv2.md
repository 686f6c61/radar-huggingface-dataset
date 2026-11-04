# fastforks/rtdetrv2

## Resumen

RT-DETRv2 es un detector de objetos de tipo end-to-end en tiempo real desarrollado por Baidu (Lv et al., 2024). La familia incluye cinco variantes (S, M, M*, L y X) que emplean un backbone ResNet-vd, un encoder híbrido con una capa de atención y una pirámide de características CSP-RepVGG, y un decoder basado en deformable attention sobre 300 queries seleccionadas. Su principal innovación es la eliminación de la supresión de no máximos (NMS) en el post-proceso, lo que simplifica el pipeline y reduce la latencia.

El repositorio `fastforks/rtdetrv2` no contiene pesos: es una model card que actúa como envoltorio de distribución. El paquete `fastforks` descarga los pesos originales de los enlaces del autor y los verifica contra hashes SHA-256 documentados, ofreciendo dos backends de ejecución (`portable` y `kernels`) con aceleraciones significativas sobre la implementación original. Está pensado para despliegues de detección en CUDA con PyTorch.

La relevancia actual del modelo radica en su equilibrio entre precisión y velocidad para detección en tiempo real, con un consumo de memoria muy contenido (por debajo de 1 GiB incluso a resoluciones de 12 MP en fp16) y una licencia de código Apache-2.0 que facilita su integración en productos comerciales, aunque la licencia de los pesos no está declarada explícitamente por los autores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de detección end-to-end (RT-DETR): backbone ResNet-vd, encoder híbrido con atención + CSP-RepVGG, decoder de deformable attention sobre 300 queries, sin NMS |
| Parametros totales | no disponible (cinco variantes: S con ResNet-18-vd, M con ResNet-34-vd, M* y L con ResNet-50-vd, X con ResNet-101-vd) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión); entrada de cualquier H x W >= 32, con padding a múltiplo de 32 |
| Tipos de cuantizacion | fp16 en los backends portable y kernels; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Código Apache-2.0; licencia de pesos no declarada por los autores (`apache-2.0-code-weights-unstated`) |
| Formato de pesos | `.pth` (PyTorch), descargados desde los enlaces del autor y verificados por SHA-256; el repositorio no aloja pesos |

## Arquitectura y entrenamiento

RT-DETRv2 sigue la estela de los DETR (Detection Transformer) pero optimizada para inferencia en tiempo real. El backbone es una ResNet-vd (variante con deep stem y strides modificados), preentrenada en ImageNet-1k mediante PaddleClas. El encoder es híbrido: combina una única capa de atención con una pirámide de características construida con bloques CSP-RepVGG, lo que reduce el coste computacional frente a los encoders totalmente atencionales. El decoder aplica deformable attention sobre 300 queries seleccionadas y produce directamente cajas, puntuaciones y clases, eliminando la necesidad de NMS.

El entrenamiento se realizó sobre COCO 2017 (split de entrenamiento con anotaciones de instancias), con entre 72 y 84 épocas según la variante, y los backbones parten de pesos de clasificación de ImageNet-1k. No se documentan en la información disponible detalles sobre RLHF/DPO (no aplica a un detector), composición exacta del dataset más allá de COCO, ni innovaciones adicionales como decodificación especulativa. La innovación destacable es la eliminación de NMS y el diseño del encoder híbrido, que permiten latencias de milisegundos incluso en GPUs de consumo.

## Capacidades

- Detección de objetos en una única imagen RGB, devolviendo cajas, etiquetas de clase y puntuaciones.
- Segmentación de instancias: la model card indica salida de máscaras de instancia, aunque los outputs documentados del `module()` portable son logits de clase y cajas normalizadas.
- Clasificación sobre las 80 clases de COCO.
- Ejecución end-to-end sin NMS, lo que simplifica el pipeline de post-proceso.
- Entrada de resolución arbitraria (H x W >= 32, con padding a múltiplo de 32), incluyendo imágenes de hasta 12 MP (4000x3000) verificadas.
- Dos backends: `portable` (PyTorch estándar) y `kernels` (kernels optimizados), con aceleraciones de hasta 4,6x sobre la implementación original.
- Verificación de integridad de pesos mediante SHA-256.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).

## Casos de uso

- **Vigilancia y videovigilancia en tiempo real**: con latencias de 4-6 ms por frame en el backend `kernels` a 640x480, el modelo puede procesar múltiples cámaras en una sola GPU, eliminando el NMS del pipeline para reducir la latencia extremo a extremo.
- **Análisis de imágenes de alta resolución**: gracias a su capacidad de procesar entradas de hasta 12 MP con un pico de memoria de 0,6 GiB en fp16, es adecuado para inspección de imágenes satelitales, médicas o de documentos donde los objetos son pequeños.
- **Sistemas embebidos y edge computing**: el bajo consumo de memoria (134-244 MiB en el backend portable a 800x1344) permite desplegarlo en GPUs de consumo como la RTX 5060 Ti 16 GB o incluso en dispositivos con recursos limitados.
- **Automatización industrial**: detección de defectos o componentes en líneas de producción, donde la variante S o M ofrece latencias de 4-8 ms suficientes para inspección a alta velocidad.
- **Pre-procesado para pipelines multimodales**: usar el detector para extraer regiones de interés (cajas) que luego se pasan a un modelo de visión-lenguaje o a un OCR, aprovechando su salida estructurada de cajas y etiquetas.
- **Robótica y navegación**: detección de obstáculos y objetos en tiempo real con la variante S o M, donde la latencia de 4-5 ms y el bajo consumo de VRAM permiten ejecutar el detector junto con otros módulos de control en la misma GPU.
- **Análisis de imágenes de seguridad y moderación de contenido**: detección de objetos y personas en imágenes subidas por usuarios, con la variante L o X para mayor precisión cuando la latencia no es crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (mAP en COCO, etc.) en la información disponible. Sin embargo, la model card proporciona datos de velocidad y memoria medidos en una RTX 5060 Ti 16 GB con fp16:

| Modelo | Tiempo original fp32 (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Memoria pico portable (MiB) | Memoria pico kernels (MiB) |
|---|---|---|---|---|---|---|
| rtdetrv2-l-coco | 30,3 | 12,14 | 6,61 | 4,6x | 177 / 200 | 200 / 306 |
| rtdetrv2-m-coco | 17,1 | 10,43 | 5,27 | 3,2x | 156 / 170 | 177 / 274 |
| rtdetrv2-ms-coco | 24,7 | 9,6 | 5,46 | 4,1x | 166 / 182 | 189 / 306 |
| rtdetrv2-s-coco | 14,1 | 8,04 | 4,19 | 3,4x | 134 / 166 | 155 / 250 |
| rtdetrv2-x-coco | 36,3 | 14,61 | 9,24 | 3,9x | 244 / 278 | 262 / 384 |

Mediciones sintéticas a 800x1344. El tiempo "original" corresponde a la implementación de referencia; "portable" y "kernels" son los backends de fastforks. La memoria se expresa como asignada / reservada.

## Requisitos de hardware

- **VRAM estimada para inferencia**: entre 134 y 244 MiB en el backend portable y entre 155 y 262 MiB en el backend kernels para entradas de 800x1344 en fp16, según variante. A 12 MP (4000x3000) el pico sube a 552-610 MiB asignados.
- **GPU recomendadas**: cualquier GPU CUDA con al menos 1 GiB de VRAM libre. Probado en RTX 5060 Ti 16 GB. Para producción con múltiples streams, se recomiendan GPUs de datacenter como A100, H100 o L40S, aunque no se documentan mediciones en ellas.
- **Cabe en GPU de consumo**: sí, en cualquier GPU consumer moderna con soporte CUDA (RTX 3060 en adelante, e incluso modelos con 4-6 GiB de VRAM).
- **Opciones de despliegue**: el paquete `fastforks` con backends `portable` y `kernels` sobre PyTorch y CUDA. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplican a un detector de este tipo).
- **Latencia y throughput**: 4,19-9,24 ms por inferencia a 800x1344 con el backend kernels (variantes S a X), lo que equivale a entre 108 y 238 FPS en una sola GPU. A 640x480, la variante S alcanza 5,1 ms en kernels (unos 196 FPS). El tiempo de carga es de 0,16-0,46 s en kernels y la primera llamada de 0,01-0,53 s.

## Comparativa con modelos similares

| Modelo | Parámetros / backbone | Contexto / entrada | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| RT-DETRv2 (este) | ResNet-18/34/50/101-vd; 5 variantes | Cualquier HxW >= 32, hasta 12 MP probado | Código Apache-2.0; pesos sin declarar | HuggingFace (model card), GitHub del autor | Sin NMS, end-to-end, backends portable y kernels |
| YOLOv8 / YOLOv9 | CNN, escalas n/s/m/l/x | Resolución fija típica 640 | GPL-3.0 (Ultralytics) o licencia comercial | HuggingFace, GitHub | Requiere NMS; ecosistema muy amplio |
| DETR original | ResNet-50 + transformer | Resolución fija 800 | Apache-2.0 | GitHub, HuggingFace | End-to-end pero lento (no tiempo real) |
| Deformable DETR | ResNet-50 + deformable attention | Resolución variable | Apache-2.0 | GitHub | End-to-end, más rápido que DETR pero por debajo de RT-DETR en tiempo real |

No se dispone de datos de precisión (mAP) en la información proporcionada para establecer una comparación cuantitativa de rendimiento con estos modelos. La comparación se limita a características arquitectónicas y de licencia.

## Limitaciones y advertencias

- **Licencia de pesos ambigua**: los autores no declaran una licencia específica para los pesos; la model card asume Apache-2.0 a partir del código, pero esto no está confirmado. Para uso comercial en producción, es imprescindible verificar la licencia con los autores originales.
- **Sesgos de COCO**: el modelo está entrenado exclusivamente con las 80 clases de COCO 2017, por lo que no detectará objetos fuera de ese vocabulario y heredará los sesgos de representación del dataset (por ejemplo, desequilibrios geográficos y culturales).
- **Riesgo de alucinación**: como todo detector, puede producir falsos positivos con alta confianza en escenas ambiguas o con oclusiones; no hay NMS que filtre duplicados, por lo que pueden aparecer cajas redundantes en objetos cercanos.
- **Sin capacidades de lenguaje**: no procesa texto ni instrucciones; es exclusivamente un modelo de visión. No soporta tool calling, agentes ni razonamiento multi-paso.
- **Dependencia de CUDA**: los backends documentados requieren CUDA y PyTorch; no se documenta soporte para CPU, ROCm u otros aceleradores.
- **Repositorio sin pesos**: `fastforks/rtdetrv2` no aloja los pesos; depende de enlaces externos (GitHub releases del autor) y de la verificación SHA-256, lo que introduce un punto de fallo si los enlaces cambian.
- **Sin datos de precisión publicados en la información disponible**: no se puede evaluar el mAP real del modelo a partir de esta ficha; es necesario consultar el paper original o ejecutar la evaluación.
- **Salida de máscaras no confirmada**: aunque la model card menciona segmentación de instancias, los outputs documentados del `module()` portable son solo cajas y logits de clase; la disponibilidad de máscaras no está verificada.

## Enlaces

- HuggingFace: https://huggingface.co/fastforks/rtdetrv2
- Repositorio del paquete fastforks: https://github.com/kleinicke/fastforks
- Kernels para el backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original de RT-DETR: https://github.com/lyuwenyu/RT-DETR (commit `df2a96c8c3a0`)
- Licencia del código original: https://github.com/lyuwenyu/RT-DETR/blob/df2a96c8c3a098567a1149bf0248da6efe6d495d/LICENSE
- Pesos variante L: https://github.com/lyuwenyu/storage/releases/download/v0.1/rtdetrv2_r50vd_6x_coco_ema.pth
- Pesos variante M: https://github.com/lyuwenyu/storage/releases/download/v0.1/rtdetrv2_r34vd_120e_coco_ema.pth
- Pesos variante M*: https://github.com/lyuwenyu/storage/releases/download/v0.1/rtdetrv2_r50vd_m_7x_coco_ema.pth
- Pesos variante S: https://github.com/lyuwenyu/storage/releases/download/v0.2/rtdetrv2_r18vd_120e_coco_rerun_48.1.pth
- Pesos variante X: https://github.com/lyuwenyu/storage/releases/download/v0.1/rtdetrv2_r101vd_6x_coco_from_paddle.pth
- Hashes completos (card.toml): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/detection/models/rtdetrv2/card.toml
