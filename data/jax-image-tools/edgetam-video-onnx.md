# jax-image-tools/edgetam-video-onnx

## Resumen

`jax-image-tools/edgetam-video-onnx` es un export en formato ONNX del modelo `facebook/EdgeTAM`, concretamente de su pipeline de segmentación y seguimiento de objetos en vídeo con banco de memoria. A diferencia de los exports habituales de SAM que solo incluyen encoder y decoder (segmentan un único fotograma), este repositorio incorpora los grafos de memoria necesarios para propagar un prompt a lo largo de una secuencia de vídeo, incluyendo la salida `object_pointer` que los exports de imagen descartan. Está pensado para ejecutarse íntegramente en el navegador mediante `onnxruntime-web` con aceleración WebGPU.

EdgeTAM es una adaptación eficiente de SAM 2 desarrollada por Facebook Research que introduce una arquitectura 2D Spatial Perceiver para optimizar la atención de memoria, logrando ser 22 veces más rápido que SAM 2 y alcanzar 16 FPS en un iPhone 15 Pro Max sin cuantización. Este export ONNX mantiene esa eficiencia y la traslada al ecosistema web, permitiendo segmentación y seguimiento de objetos en tiempo real en dispositivos edge sin necesidad de servidores. El repositorio pesa 0.1 GB y consta de cuatro grafos ONNX que suman unos 62 MB de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EdgeTAM (adaptacion de SAM 2 con 2D Spatial Perceiver) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, sin contexto textual) |
| Tipos de cuantizacion | no disponible (export ONNX, probablemente FP32) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivos `.onnx`) |

## Arquitectura y entrenamiento

El modelo base, EdgeTAM, es una adaptacion de SAM 2 para ejecucion en dispositivos con recursos limitados. Sustituye la atencion de memoria global de SAM 2 por una arquitectura 2D Spatial Perceiver que reduce la complejidad computacional manteniendo la precision en la segmentacion y seguimiento de objetos. El export ONNX reproduce esta arquitectura en cuatro grafos separados: `vision_encoder` (convierte `pixel_values` de 1024x1024 en features FPN y codificaciones posicionales), `mask_decoder` (combina features con prompts de puntos y produce máscaras, scores IoU y el puntero de objeto), `memory_attention` (condiciona las features actuales con el banco de memoria) y `memory_encoder` (genera tokens de memoria a partir de features y máscara predicha). El banco de memoria no es un grafo, sino estructuras de datos en JavaScript gestionadas por el lado del cliente, con la geometria definida en `constants.json`.

El entrenamiento original de EdgeTAM se describe en el paper "EdgeTAM: On-Device Track Anything Model" (Chong Zhou et al.), aunque no se detallan aqui los datos de entrenamiento. El export fue generado con `browser-onnx-tools` del Jackson Laboratory, con un proceso de validacion que compara las salidas contra la implementacion fp32 PyTorch de `propagate_in_video_iterator`, reportando un IoU peor caso de 1.000000 y una diferencia maxima de 4.1e-04 en logits de máscara.

## Capacidades

- Segmentacion de objetos en imagenes y video mediante prompts de puntos, cajas o mascaras.
- Propagacion de mascaras a traves de frames usando un banco de memoria persistente.
- Ejecucion completa en navegador con WebGPU via `onnxruntime-web`.
- Soporte de multiples objetos (heredado de SAM 2, aunque no se documenta explicitamente en este export).
- Salida de `object_pointer` y `object_score_logits`, necesarios para el seguimiento de objetos.
- Sin capacidades de texto, lenguaje o tool calling; es exclusivamente un modelo de vision.

## Casos de uso

- Edicion de video interactiva en el navegador: el usuario puede seleccionar un objeto en un fotograma y el modelo lo segmenta y lo sigue en el resto de la secuencia, permitiendo aplicar efectos o recortes en tiempo real.
- Herramientas de anotacion de datos para datasets de video: los investigadores pueden anotar objetos en multiples frames sin necesidad de infraestructura de servidor, ya que todo se ejecuta localmente en el navegador.
- Analisis de imagenes medicas (como cortes de z-stack): el modelo puede propagar segmentaciones entre capas consecutivas de una pila de imagenes, facilitando la delineacion de estructuras anatomicas.
- Realidad aumentada en web: segmentacion de objetos del entorno para overlays o filtros en aplicaciones web progresivas, con baja latencia gracias a WebGPU.
- Seguimiento de objetos en streaming de video: monitorizacion de objetos en tiempo real desde el navegador, util para vigilancia o conteo de objetos en produccion.
- Demostraciones y prototipos de sistemas de vision: desarrollo de pruebas de concepto de segmentacion de video sin backend, acelerando el ciclo de iteracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la fidelidad del export frente a la implementacion PyTorch fp32:

| Metrica | Valor |
|---|---|
| IoU peor caso por frame | 1.000000 |
| Diferencia maxima en logits de mascara | 4.1e-04 |

El modelo original EdgeTAM reporta en su paper una velocidad 22x superior a SAM 2 y 16 FPS en iPhone 15 Pro Max, pero estos datos no estan incluidos en la informacion proporcionada para este export ONNX.

## Requisitos de hardware

- Navegador compatible con WebGPU (Chrome 113+, Edge 113+, Safari 26+ o Firefox 141+ con flags experimentales).
- VRAM estimada para inferencia: menos de 150 MB, dado que los cuatro grafos suman aproximadamente 62 MB de pesos y las activaciones intermedias son modestas.
- GPU integrada o dedicada con soporte WebGPU; no requiere GPU de gama alta.
- Tambien puede ejecutarse en CPU con WebGPU (via fallback de software), aunque con mayor latencia.
- Opciones de despliegue: `onnxruntime-web` con backend WebGPU en el navegador; no requiere servidor ni API externa.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada, aunque el modelo base EdgeTAM esta disenado para tiempo real en dispositivos moviles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Ejecucion en navegador | Licencia |
|---|---|---|---|---|---|
| EdgeTAM (original) | PyTorch | no disponible | Vision | No | Apache-2.0 |
| SAM 2 | PyTorch | ~2.4B (base) | Vision | No | Apache-2.0 |
| MobileSAM | PyTorch | ~9.66M | Vision | Si (via ONNX) | Apache-2.0 |
| Este export (edgetam-video-onnx) | ONNX | no disponible | Vision | Si (WebGPU) | Apache-2.0 |

La principal diferencia frente a SAM 2 y MobileSAM es que este export incluye el pipeline completo de memoria para video, mientras que los otros se limitan a segmentacion de imagenes individuales. MobileSAM es mas ligero pero no tiene memoria temporal. EdgeTAM original es mas rapido en dispositivos moviles nativos, pero este export permite ejecutarlo en el navegador con WebGPU.

## Limitaciones y advertencias

- Requiere WebGPU; en navegadores sin soporte o con WebGPU desactivado, la inferencia puede fallar o degradarse a CPU con rendimiento muy bajo.
- El banco de memoria se gestiona en JavaScript, no forma parte de los grafos ONNX; la eficiencia de la propagacion depende de la implementacion JS del lado del cliente.
- No hay garantia de que el export funcione con todas las variantes de EdgeTAM; se valido contra la implementacion PyTorch de `propagate_in_video_iterator` con dos tasas de movimiento, pero otros escenarios podrian revelar divergencias.
- No se han publicado benchmarks sobre datasets estandar (SA-V, DAVIS) para este export, por lo que su rendimiento comparativo no esta verificado.
- La licencia Apache-2.0 permite uso comercial, pero es responsabilidad del usuario cumplir con los terminos del modelo base y de las dependencias.
- No soporta prompts de texto ni interaccion por lenguaje; solo prompts geometricos (puntos, cajas, mascaras).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jax-image-tools/edgetam-video-onnx
- Repositorio EdgeTAM original: https://github.com/facebookresearch/EdgeTAM
- Web de EdgeTAM: https://edgetam.com/
- Documentacion de Transformers para EdgeTAMVideo: https://huggingface.co/docs/transformers/model_doc/edgetam_video
- Herramientas de export `browser-onnx-tools`: https://github.com/TheJacksonLaboratory/browser-onnx-tools
