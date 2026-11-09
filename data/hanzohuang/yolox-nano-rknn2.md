# HanzoHuang/YOLOX-Nano-RKNN2

## Resumen

YOLOX-Nano-RKNN2 es una distribución de pesos del detector de objetos YOLOX Nano, convertidos al formato RKNN2 propietario de Rockchip para su ejecución sobre las NPU de los SoC RK3576 y RK3588. El trabajo lo publica el usuario HanzoHuang y forma parte de una conversión tipo "Model Zoo" que toma el checkpoint original de Megvii-BaseDetection, lo exporta a ONNX mediante el exportador de airockchip y lo compila con RKNN Toolkit2 2.3.2. El objetivo es ofrecer artefactos listos para desplegar en placas Rockchip sin tener que reproducir la cadena de conversión.

El modelo resuelve el problema de llevar un detector ligero (YOLOX Nano, la variante más pequeña de la familia YOLOX) a hardware embebido con aceleración NPU. Se ofrecen variantes FP16 e INT8 para cada chip, lo que permite elegir entre mayor fidelidad numérica o menor huella y mayor throughput. La relevancia es práctica: cubre el nicho de detección de objetos en tiempo real en dispositivos de borde con SoC Rockchip, un segmento con poca oferta de pesos precompilados y verificables.

No se dispone de información sobre el número de parámetros, la longitud de contexto (no aplica, es un detector) ni los idiomas soportados. El repositorio tiene un tamaño de 0.0 GB según Hugging Face, lo que sugiere que los binarios pueden estar gestionados por LFS o que el peso real no se refleja en el campo de tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLOX Nano (detector de objetos, backbone CSPNet + cabeza decoupled, anchor-free) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantización | FP16 e INT8 (variantes por chip) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | Apache-2.0 |
| Formato de pesos | RKNN (`.rknn`) para despliegue; checkpoint original `.pth` en `source/`; exportación intermedia ONNX |

## Arquitectura y entrenamiento

YOLOX Nano es un detector de objetos de una etapa, anchor-free, con backbone CSPNet y cabeza desacoplada (decoupled head) para clasificación y regresión. La variante Nano es la de menor capacidad de la familia YOLOX, pensada para inferencia de baja latencia en dispositivos con recursos limitados. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF/DPO, ya que no aplican a un detector supervisado de caja delimitadora.

La innovación técnica de esta distribución no está en el modelo en sí, sino en la cadena de conversión: exportación a ONNX con el exportador de airockchip, compilación con RKNN Toolkit2 2.3.2 mediante el conversor de ejemplo de rknn_model_zoo, y cuantización INT8. El resultado son binarios RKNN específicos para RK3576 y RK3588, con un `manifest.json` que registra el hash de cada modelo para verificación de integridad.

## Capacidades

- Detección de objetos en imágenes: salida de cajas delimitadoras con clase y puntuación de confianza.
- Ejecución en NPU Rockchip: variantes compiladas para RK3576 y RK3588.
- Doble precisión: FP16 para mayor fidelidad y INT8 para menor huella y mayor throughput.
- Verificación de integridad: hashes por modelo en `manifest.json`.
- Inclusión del checkpoint original `.pth` para reproducir o reexportar la conversión.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no aplica).

## Casos de uso

- Vigilancia perimetral en dispositivos de borde: desplegar la variante INT8 en un RK3588 para detección continua con bajo consumo, usando la NPU y evitando depender de la CPU.
- Control de calidad industrial: inspección visual en línea de producción sobre placas RK3576, donde la latencia y el coste por unidad son críticos.
- Análisis de tráfico en cámaras IP: detección de vehículos y peatones en el propio dispositivo, reduciendo el ancho de banda al no enviar vídeo a la nube.
- Robótica móvil y drones: percepción ligera a bordo con FP16 cuando la precisión importa más que el throughput.
- Automatización de retail: conteo de personas y detección de productos en estanterías con hardware de bajo coste.
- Prototipado rápido en placas Rockchip: usar los binarios precompilados y el `manifest.json` para validar integridad y desplegar sin recompilar.
- Reproducibilidad de pipelines: reexportar desde el `.pth` incluido usando el exportador de airockchip para adaptar la conversión a otros chips o precisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- SoC objetivo: Rockchip RK3576 y RK3588 (NPU integrada).
- VRAM: no aplica; la memoria es la RAM compartida del SoC, no disponible en la información.
- GPU dedicadas: no aplica; el despliegue es sobre NPU Rockchip.
- Consumer GPU: no aplica para el formato RKNN; el checkpoint `.pth` original podría ejecutarse en GPU convencional, pero no es el propósito de esta distribución.
- Despliegue: RKNN Toolkit2 / runtime RKNN en el dispositivo; la conversión requiere RKNN Toolkit2 2.3.2.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| YOLOX-Nano-RKNN2 | YOLOX Nano | no aplica | Apache-2.0 | RKNN, ONNX, .pth | Hugging Face (HanzoHuang) |
| YOLOX Nano original | YOLOX Nano | no aplica | Apache-2.0 | .pth | GitHub Megvii-BaseDetection |
| YOLOv8n | YOLOv8 nano | no aplica | AGPL-3.0 (Ultralytics) | .pt, ONNX, otros | Ultralytics |
| YOLOv5n | YOLOv5 nano | no aplica | GPL-3.0 (Ultralytics) | .pt, ONNX, otros | Ultralytics |

## Limitaciones y advertencias

- Específico de hardware: los binarios `.rknn` solo se ejecutan en NPU Rockchip RK3576 y RK3588; no son portables a otras plataformas.
- La cuantización INT8 puede degradar la precisión respecto a FP16; conviene validar en el dominio de aplicación.
- No se documentan sesgos ni evaluación de robustez del modelo en la información disponible.
- Riesgo de alucinación no aplica (es un detector), pero sí de falsos positivos y negativos en detección.
- Licencia Apache-2.0 permite uso comercial, pero el modelo YOLOX original y las herramientas de airockchip deben revisarse por separado.
- El repositorio muestra 0 descargas y 0 likes, y tamaño 0.0 GB; verificar que los binarios estén realmente accesibles antes de integrarlo en producción.
- No hay información sobre el dataset de entrenamiento ni sobre el rendimiento medido en los chips objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/HanzoHuang/YOLOX-Nano-RKNN2
- Checkpoint original YOLOX Nano: https://github.com/Megvii-BaseDetection/YOLOX/releases/download/0.1.1rc0/yolox_nano.pth
- Exportador Rockchip YOLOX: https://github.com/airockchip/YOLOX/tree/fc69c1e2ccb30fce7e18250bddc13a68090dca09
- Conversor Model Zoo YOLOX: https://github.com/airockchip/rknn_model_zoo/tree/837db8e992815ff8647eadb709f07067f4bc3a71/examples/yolox
- Repositorio YOLOX (Megvii-BaseDetection): https://github.com/Megvii-BaseDetection/YOLOX
