# anguoyang/depth-anything-v2-small-rknn-rk3588

## Resumen

Depth Anything V2 Small RKNN para RK3588 es una conversión del modelo de estimación de profundidad monocular Depth Anything V2 Small (variante "Small") al formato RKNN, optimizada para ejecutarse en la NPU del SoC Rockchip RK3588. El autor, anguoyang, parte del ONNX fp32 oficial publicado por onnx-community y lo convierte con rknn-toolkit2 2.3.2 manteniendo precisión fp32 (sin cuantización), con entrada estática 518×518 y la normalización ImageNet plegada dentro del grafo RKNN. El resultado es un artefacto de aproximadamente 60 MB que produce un mapa de profundidad relativa de 518×518.

La relevancia de esta ficha está en que se publica con mediciones independientes en placa, algo poco habitual en conversiones RKNN: latencia de 696,11 ms por imagen en 3 cores NPU, carga de modelo de unos 250 ms y verificación de consistencia numérica frente a la referencia ONNX en CPU (Pearson 1.0000, error relativo mediano 1,54%). Según el autor, a fecha de 2026-11-21 era la primera build de Depth Anything V2 para RK3588 disponible en Hugging Face.

El modelo resuelve el despliegue de estimación de profundidad en dispositivos edge con NPU Rockchip, sin depender de GPU dedicada ni de la nube. Al ser la variante Small (licencia Apache-2.0, a diferencia de Base/Large que son CC-BY-NC), es apta para uso comercial dentro de los términos de dicha licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Depth Anything V2 Small (transformer encoder-decoder para depth estimation monocular), exportado como grafo RKNN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija 518×518) |
| Tipos de cuantizacion | ninguno (build fp32, sin quantizacion) |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | RKNN (`.rknn`); modelo origen en ONNX fp32 |

## Arquitectura y entrenamiento

El modelo subyacente es Depth Anything V2 Small, un estimador de profundidad monocular basado en un encoder tipo DINOv2 (ViT-S) con un cabezal de decodificación densa que produce un mapa de profundidad relativa. Esta build concreta no reentrena ni afina el modelo: parte del ONNX fp32 oficial de `onnx-community/depth-anything-v2-small` y lo compila con rknn-toolkit2 2.3.2 para la NPU del RK3588. La entrada es estática a 518×518, con la media y desviación estándar de ImageNet plegadas dentro del grafo RKNN, y la salida es un mapa de profundidad relativa float de 518×518.

Una particularidad relevante del pipeline: el preprocesador oficial de Depth Anything mantiene la relación de aspecto con padding, mientras que el driver de referencia de esta build redimensiona directamente a 518×518. El check de consistencia frente al ONNX en CPU se realizó aplicando el mismo redimensionado en ambos lados, por lo que la equivalencia numérica reportada (Pearson 1.0000) es válida bajo ese protocolo, pero no implica equivalencia con el preprocesado oficial con padding. El log de conversión contiene 5 registros `Unknown op target: 0`, también observados en conversiones de torres de visión de Qwen; según el autor el modelo se ejecuta correctamente en dispositivo con salida determinista entre sesiones.

## Capacidades

- Estimación de profundidad relativa monocular a partir de una imagen RGB de entrada.
- Entrada uint8 NHWC redimensionada a 518×518 en tiempo de ejecución.
- Salida de mapa de profundidad float 518×518.
- Ejecución en NPU del RK3588 usando 3 cores NPU.
- No incluye capacidades de generación de texto, razonamiento, código, matemáticas, audio ni tool calling.
- No dispone de modo thinking ni de soporte de agentes.
- Capacidades multilingües: no aplica (modelo puramente visual).

## Casos de uso

- Robótica móvil en edge: el mapa de profundidad relativa permite a robots o AGV con RK3588 detectar obstáculos y planificar navegación sin GPU dedicada, con latencia de ~700 ms por frame en 3 cores NPU.
- Drones y cámaras inteligentes: estimación de profundidad a bordo para evitación de obstáculos o segmentación por distancia, aprovechando el bajo consumo del SoC y la entrada fija 518×518.
- Realidad aumentada en dispositivos empotrados: colocación de objetos virtuales con oclusión básica usando el mapa de profundidad como proxy, con carga de modelo de ~250 ms.
- Automatización industrial con visión: inspección de profundidad en líneas de montaje donde se requiere determinismo entre sesiones (salida determinista reportada por el autor).
- Preprocesado para modelos downstream: uso del mapa de profundidad como entrada auxiliar para segmentación, detección o reconstrucción 3D en pipelines embebidos.
- Prototipado e investigación en edge AI: referencia medible y verificable (Pearson 1.0000 frente a ONNX CPU) para comparar conversiones RKNN de modelos de visión.
- Kioscos y sistemas de captura 3D de bajo coste: generación de mapas de profundidad en tiempo casi real con hardware Rockchip.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Inferencia imagen unica 518×518, fp32, 3 cores NPU | 696,11 ms (mediana de 3 medianas de sesion: 701,74 / 669,94 / 696,11 ms) |
| Carga de modelo (load + runtime init) | ~250 ms |
| Consistencia vs ONNX CPU (imagen demo) | Pearson 1.0000, Spearman 0.9954, error relativo mediano 1,54% |
| Tamano del artefacto | 60.296.260 bytes (SHA-256 en `SHA256SUMS`) |

Protocolo de medición: 3 sesiones de proceso independientes, 1 ejecución de calentamiento + 5 ejecuciones cronometradas por sesión; carga de placa 1,83–2,03 (placa compartida). Datos completos en `measurements.json`. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no aplican a un modelo de estimación de profundidad.

## Requisitos de hardware

- SoC objetivo: Rockchip RK3588 con NPU (3 cores utilizados en las mediciones).
- VRAM: no disponible (modelo para NPU de SoC, no para GPU).
- GPU recomendadas: no aplica; el artefacto está compilado para NPU RK3588.
- Cabe en consumer GPU: no aplica a este artefacto; el modelo origen ONNX podría ejecutarse en GPU, pero esta build no.
- Opciones de despliegue: runtime RKNN en RK3588 con el driver de referencia del autor; el ONNX fp32 original puede usarse como referencia en CPU.
- Latencia: ~696 ms por imagen 518×518 en 3 cores NPU; throughput no disponible más allá de esta cifra.
- Carga de modelo: ~250 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Depth Anything V2 Small RKNN RK3588 (este) | no disponible | 518×518 fija | 696,11 ms en RK3588, 3 cores NPU; Pearson 1.0000 vs ONNX CPU | Apache-2.0 | Hugging Face |
| Depth Anything V2 Small (ONNX oficial) | no disponible | 518×518 con padding | no disponible en NPU; referencia CPU | Apache-2.0 | onnx-community |
| Depth Anything V2 Base | no disponible | no disponible | no disponible | CC-BY-NC | Hugging Face |
| Depth Anything V2 Large | no disponible | no disponible | no disponible | CC-BY-NC | Hugging Face |
| Depth Anything V3 (builds RK1828) | no disponible | no disponible | no disponible | no disponible | Hugging Face (mencionado por el autor) |

## Limitaciones y advertencias

- El preprocesado del driver de referencia redimensiona directamente a 518×518, mientras que el pipeline oficial mantiene relación de aspecto con padding; los resultados pueden diferir del pipeline oficial en imágenes con relaciones de aspecto no cuadradas.
- La consistencia numérica reportada (Pearson 1.0000) se obtuvo aplicando el mismo redimensionado en ambos lados, no frente al preprocesado oficial con padding.
- Build fp32 sin cuantización: no se dispone de versión int8 ni de métricas de precisión tras cuantización.
- El log de conversión contiene 5 registros `Unknown op target: 0`; aunque el autor reporta ejecución limpia y determinista, conviene validar en el hardware y runtime concretos antes de producción.
- Las mediciones se hicieron en una placa compartida con carga 1,83–2,03; la latencia puede variar según la carga del sistema.
- Modelo de profundidad relativa, no absoluta: la escala no está calibrada métricamente.
- Sin capacidades de texto, tool calling, agentes ni multilingüismo.
- Licencia Apache-2.0 aplicable a la variante Small; las variantes Base y Large del modelo original son CC-BY-NC y no están cubiertas por esta build.
- Riesgo de sesgos heredados del dataset de entrenamiento original (no documentados en la información disponible).
- Sin métricas de calidad de profundidad (AbsRel, δ1, etc.) publicadas en esta build.

## Enlaces

- Hugging Face: https://huggingface.co/anguoyang/depth-anything-v2-small-rknn-rk3588
- Modelo base ONNX: https://huggingface.co/onnx-community/depth-anything-v2-small
- Depth Anything V2 (modelo original): no disponible en la información proporcionada
- rknn-toolkit2: no disponible en la información proporcionada
- Paper de Depth Anything V2: no disponible en la información proporcionada
- Repositorio o demo adicional: no disponible en la información proporcionada
