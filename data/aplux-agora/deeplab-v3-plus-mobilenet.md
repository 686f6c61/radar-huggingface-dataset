# APLUX-Agora/DeepLab-V3-Plus-MobileNet

## Resumen

DeepLab-V3-Plus-MobileNet es un paquete de recursos de despliegue para segmentación semántica de 21 clases (Pascal VOC) sobre Qualcomm, publicado por APLUX-Agora dentro de su plataforma Agora. No se distribuye como un checkpoint de entrenamiento al uso, sino como artefactos ya convertidos y medidos para ejecutarse en NPU/SoC concretos: QCS6490 (placa Rhino Pi A1) y QCS8550 (Rhino Pi X1), con variantes de precisión FP16, W8A16 y W8A8.

El modelo subyacente es la conocida arquitectura DeepLabV3+ con backbone MobileNet, una combinación habitual en segmentación ligera por su equilibrio entre calidad de máscara y coste computacional. El valor diferencial del repositorio es la ingeniería de despliegue: binarios de contexto QNN (`model.bin`), ficheros `model.json` por SoC con precisión por defecto y rutas de variantes, y latencias medidas en hardware real (23,3 ms en QCS6490 y 17,3 ms en QCS8550 con la precisión por defecto).

Es relevante para equipos de AIoT y edge que necesitan segmentación en tiempo real en dispositivos con Qualcomm sin pasar por el proceso completo de conversión y calibración. El repositorio, sin embargo, está prácticamente vacío en el momento de la consulta (0,0 GB, 0 descargas), por lo que su disponibilidad efectiva de pesos debe verificarse antes de integrarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepLabV3+ con backbone MobileNet (segmentación semántica) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no generativo) |
| Tipos de cuantizacion | FP16, W8A16, W8A8 (según SoC) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | APLUX Model Farm License (`aplux-model-farm`); modelo fuente bajo términos del modelo original |
| Formato de pesos | Binarios QNN (`model.bin`) y `model.json` por SoC; no se publican safetensors ni GGUF |
| Tarea | Segmentación de imagen (21 clases, Pascal VOC) |
| Entradas / salidas | `image` → `masks` |
| SoCs soportados | QCS6490, QCS8550 |
| Precisión por defecto medida | 23,3 ms (QCS6490), 17,3 ms (QCS8550) |
| Tamaño del repo | 0,0 GB |

## Arquitectura y entrenamiento

DeepLabV3+ es un modelo de segmentación semántica que combina un encoder con *atrous/dilated convolutions* y *atrous spatial pyramid pooling* (ASPP) para capturar contexto multi-escala, y un decoder ligero que fusiona características de bajo nivel con las de alto nivel para refinar los bordes de la máscara. En esta variante el backbone es MobileNet, lo que reduce drásticamente el coste frente a backbones tipo ResNet/Xception y lo hace apto para inferencia en NPU de bajo consumo.

No se dispone de información sobre el entrenamiento (número de tokens o imágenes, composición del dataset, uso de RLHF/DPO u otras técnicas de alineación) en la información proporcionada. El autor solo declara la tarea (21 clases de Pascal VOC) y el proceso de conversión y medición en placas Qualcomm mediante su plataforma Agora/Model Farm. La innovación destacable no está en el modelo en sí, sino en el pipeline de despliegue: exportación a binarios de contexto QNN con varias precisiones y validación de latencia en hardware real.

## Capacidades

- Segmentación semántica densa de imágenes en 21 clases (Pascal VOC).
- Producción de máscaras por píxel a partir de una imagen de entrada.
- Ejecución en NPU Qualcomm con precisión configurable (FP16, W8A16, W8A8).
- Despliegue medido y validado en QCS6490 y QCS8550.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües ni de modalidades adicionales (audio, vídeo, etc.).
- No incluye *thinking mode* ni funciones de visión-lenguaje.

## Casos de uso

- Segmentación en tiempo real en cámaras AIoT: el modelo produce máscaras de 21 clases con latencias de 17–23 ms en los SoCs soportados, adecuado para pipelines de vídeo a 30 FPS en dispositivos embebidos.
- Vehículos autónomos ligeros y robots móviles: separación de suelo, obstáculos y personas en la escena para planificación de trayectorias en plataformas con QCS6490/QCS8550.
- Control de calidad industrial: inspección visual con segmentación de piezas y defectos en líneas de fabricación donde no hay GPU dedicada.
- Segmentación para realidad aumentada: recorte de fondo/sujeto en aplicaciones móviles o gafas inteligentes con NPU Qualcomm.
- Preprocesado para pipelines de analítica de vídeo: generación de máscaras que alimentan etapas posteriores de conteo, seguimiento o medición de áreas.
- Prototipado rápido en edge: uso de los binarios ya convertidos y de las guías de despliegue de Agora para evitar el proceso de conversión y calibración QNN desde cero.

## Benchmarks y rendimiento

| SoC / placa | Precisiones | Latencia medida (precisión por defecto) |
|---|---|---|
| QCS6490 · Rhino Pi A1 | W8A16, W8A8 | 23,3 ms |
| QCS8550 · Rhino Pi X1 | FP16, W8A16, W8A8 | 17,3 ms |

No se han publicado resultados de benchmarks de calidad de segmentación (mIoU u otras métricas) en la información disponible.

## Requisitos de hardware

- Hardware objetivo: SoCs Qualcomm QCS6490 y QCS8550 con aceleración NPU (QNN).
- No está pensado para GPU de escritorio; no se proporcionan requisitos de VRAM.
- No cabe en el ecosistema consumer habitual (RTX 4090, etc.) tal como se distribuye: los artefactos son binarios QNN, no pesos en safetensors/GGUF.
- Opciones de despliegue: runtime QNN sobre las placas indicadas, o la plataforma Agora (https://mega.aidlux.com) para probar el modelo online sin hardware.
- Latencia: 23,3 ms en QCS6490 y 17,3 ms en QCS8550 con la precisión por defecto; no se documenta throughput ni latencia para otras precisiones.
- No se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplica a un modelo de segmentación).

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepLab-V3-Plus-MobileNet (APLUX-Agora) | DeepLabV3+ / MobileNet | Segmentación 21 clases | Imagen | APLUX Model Farm | Binarios QNN para QCS6490/QCS8550 |
| DeepLabV3+ (referencia original) | DeepLabV3+ / MobileNet | Segmentación | Imagen | Según implementación | Pesos de entrenamiento en frameworks DL |
| MobileNetV2/V3 (clasificación) | CNN | Clasificación | Imagen | Según implementación | Pesos estándar |
| Segment Anything (SAM) | Transformer | Segmentación promptable | Imagen | Apache 2.0 (variantes) | Pesos públicos |

No se dispone de datos de rendimiento comparativo (mIoU, latencia en el mismo hardware) en la información proporcionada.

## Limitaciones y advertencias

- El repositorio figura con 0,0 GB y 0 descargas: verificar que los binarios estén realmente publicados antes de integrarlo.
- Solo cubre 21 clases de Pascal VOC; no es un modelo de segmentación abierta ni *promptable*.
- No se publican métricas de calidad (mIoU) ni detalles de entrenamiento, lo que impide evaluar su precisión frente a alternativas.
- Dependencia fuerte del hardware: los binarios QNN no son portables a GPU/CPU genéricas.
- La licencia APLUX Model Farm se aplica a los recursos convertidos; el modelo fuente se rige por los términos del modelo original. Revisar `LICENSE_MODEL_FARM.pdf` y `NOTICE.md` antes de uso comercial.
- No se documentan sesgos, riesgos de alucinación (no aplica) ni limitaciones idiomáticas.
- Latencia medida solo con la precisión por defecto; no hay datos de W8A16/W8A8 en la información disponible.
- Fecha de creación del repositorio: 2026-11-09 (según metadatos de Hugging Face).

## Enlaces

- Hugging Face: https://huggingface.co/APLUX-Agora/DeepLab-V3-Plus-MobileNet
- Demo / plataforma Agora: https://mega.aidlux.com/models/deeplabv3-plus-mobilenet
- Sitio de Agora: https://mega.aidlux.com
- Licencia APLUX Model Farm: https://huggingface.co/APLUX-Agora/DeepLab-V3-Plus-MobileNet/blob/main/LICENSE_MODEL_FARM.pdf
- Ficheros de procedencia y checksums: `NOTICE.md` y `SHA256SUMS` en el repositorio de Hugging Face.
