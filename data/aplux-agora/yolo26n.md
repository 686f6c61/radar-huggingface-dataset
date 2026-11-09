# APLUX-Agora/YOLO26n

## Resumen

YOLO26n es un modelo de detección de objetos de la familia YOLO26 en su variante más pequeña (sufijo "n"), distribuido por APLUX-Agora como recursos de despliegue optimizados para aceleradores Qualcomm. No se trata de los pesos originales del modelo en formato de entrenamiento, sino de artefactos convertidos y empaquetados por la plataforma Agora (APLUX Model Farm) para su ejecución en SoC concretos como QCS6490 y QCS8550, con soporte de cuantización W8A16, W8A8 y FP16.

La relevancia del modelo reside en su enfoque de despliegue en el borde (edge/AIoT): salida extremo a extremo que simplifica el post-procesado, y tiempos de inferencia medidos en placas reales (12,4 ms en QCS6490 y 7,7 ms en QCS8550 con la precisión por defecto). Esto lo sitúa como una opción práctica para visión artificial embebida en dispositivos con restricciones de cómputo y energía.

La información publicada es escasa: no se detallan parámetros, longitud de contexto (no aplica a un detector), datos de entrenamiento ni resultados de benchmarks de precisión (mAP). La model card se centra en instrucciones de descarga y despliegue por SoC.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 (detector de objetos, variante "n" de mínima escala); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | W8A16, W8A8, FP16 (según SoC) |
| Idiomas soportados | no disponible (no aplica; tarea de visión) |
| Licencia | Apache-2.0 (modelo fuente); APLUX Model Farm License para los recursos convertidos |
| Formato de pesos | Recursos empaquetados por SoC (`targets/<SoC>/`, binarios `model.bin`, `model.json`); no se indica safetensors/GGUF/ONNX |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna más allá de que pertenece a la familia YOLO26 y que emplea salida extremo a extremo ("端到端输出"), lo que elimina la necesidad de NMS en post-procesado según la model card. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO (no aplicables habitualmente a detectores).

La innovación destacable en este paquete es la conversión a formatos ejecutables en aceleradores Qualcomm (QNN), con variantes por precisión (W8A16, W8A8, FP16) y artefactos organizados por SoC objetivo. La model card menciona que los paquetes multi-fichero se conservan tal como los publica Model Farm, y que se incluyen guías de pre/post-procesado y un runner exportable desde la plataforma Agora.

## Capacidades

- Detección de objetos en imágenes: entrada `image`, salida `boxes`.
- Salida extremo a extremo que simplifica el pipeline de despliegue.
- Ejecución optimizada en aceleradores Qualcomm (QNN) para SoC QCS6490 y QCS8550.
- Soporte de múltiples precisiones de cuantización (W8A16, W8A8, FP16) según el SoC.
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión generativa, audio ni modo "thinking"; son ajenas a la tarea de detección.
- No se detallan clases del dataset ni dominio de aplicación (COCO u otro) en la información disponible.

## Casos de uso

- Visión artificial en cámaras IP con SoC Qualcomm: el modelo puede ejecutarse en placas QCS6490/QCS8550 con latencias de 7,7-12,4 ms por inferencia, adecuado para detección en tiempo real en dispositivos de videovigilancia.
- Detección en robótica móvil embebida: la variante "n" y la cuantización W8A8 permiten integrar el detector en robots con presupuesto energético limitado, usando el runner exportado desde Agora.
- Control de calidad en líneas de producción: despliegue en placas Rhino Pi A1/X1 para inspección visual en fábrica, aprovechando la salida extremo a extremo para reducir latencia de post-procesado.
- Sistemas de conteo y analítica de aforo: integración en pasarelas edge que procesan flujos de vídeo y emiten cajas delimitadoras para conteo de personas u objetos.
- Prototipado rápido en AIoT: la descarga selectiva por SoC (`targets/$AGORA_SOC/*`) y la posibilidad de probar online sin placa (mega.aidlux.com) facilitan la evaluación previa a la compra de hardware.
- Automatización de almacenes y logística: detección de palés o paquetes en dispositivos de borde con conectividad intermitente, al no requerir cómputo en nube.
- Vehículos autónomos de baja velocidad (AGV): detección de obstáculos con latencias inferiores a 15 ms en QCS6490, compatible con bucles de control en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (mAP, etc.) en la información disponible. Los únicos datos de rendimiento son latencias medidas en placas reales:

| SoC · placa | Precisiones | Latencia (precisión por defecto) |
|---|---|---|
| QCS6490 · Rhino Pi A1 | W8A16, W8A8 | 12,4 ms |
| QCS8550 · Rhino Pi X1 | FP16, W8A16 | 7,7 ms |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el modelo está orientado a NPU/SoC Qualcomm, no a GPU discreta).
- GPU recomendadas: no aplica; el despliegue objetivo es en aceleradores Qualcomm (QNN) sobre QCS6490 y QCS8550.
- ¿Cabe en GPU de consumo? No se documenta soporte para GPU de consumo (RTX 4090, etc.); los artefactos publicados son específicos de SoC.
- Opciones de despliegue: runner y proyecto exportable desde la plataforma Agora; descarga vía `hf download` con selección por SoC. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- Latencia: 12,4 ms en QCS6490 (W8A16 por defecto) y 7,7 ms en QCS8550 (precisión por defecto). Throughput no disponible.
- Placas de referencia: Rhino Pi A1 (QCS6490) y Rhino Pi X1 (QCS8550).

## Comparativa con modelos similares

No se dispone de datos de parámetros, contexto ni precisión (mAP) de este modelo ni de alternativas en la información proporcionada, por lo que la comparación cuantitativa no es posible. Cualitativamente:

| Modelo | Familia | Licencia | Despliegue edge Qualcomm | Datos de latencia publicados |
|---|---|---|---|---|
| YOLO26n (APLUX-Agora) | YOLO26 | Apache-2.0 (fuente) / APLUX Model Farm (recursos) | Sí (QCS6490, QCS8550) | Sí (12,4 ms / 7,7 ms) |
| Otras variantes YOLO (n/s/m/l) | YOLO | no disponible en esta ficha | no disponible | no disponible |
| Detectores edge alternativos | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se publican métricas de precisión (mAP) ni detalles del dataset de entrenamiento; no es posible evaluar la calidad de detección antes de desplegar.
- Los recursos distribuidos están convertidos y empaquetados por APLUX Model Farm y se rigen por la APLUX Model Farm License, distinta de la Apache-2.0 del modelo fuente; revisar `LICENSE_MODEL_FARM.pdf` y `NOTICE.md` antes de uso comercial.
- El paquete está especializado por SoC (QCS6490, QCS8550); no es portable directamente a otras plataformas sin reconversión.
- No se documentan sesgos, clases soportadas ni dominios de aplicación; el riesgo de falsos positivos/negativos en dominios no representados en el entrenamiento es desconocido.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria publicada.
- No se especifican requisitos de versión de runtime QNN ni del SDK de Qualcomm; posibles incompatibilidades no documentadas.
- La fecha de creación del repositorio (2026-11-09) y el tamaño de 0.0 GB sugieren que los artefactos pueden no estar completamente cargados o que la metadata es incompleta; verificar `SHA256SUMS` tras la descarga.

## Enlaces

- Hugging Face: https://huggingface.co/APLUX-Agora/YOLO26n
- Demo/prueba online: https://mega.aidlux.com/models/yolo26n
- Plataforma Agora: https://mega.aidlux.com
- Licencia del modelo fuente (Apache-2.0): ver `LICENSE` en el repositorio
- Licencia de recursos convertidos: `LICENSE_MODEL_FARM.pdf` en el repositorio
- Procedencia y sumas de verificación: `NOTICE.md` y `SHA256SUMS` en el repositorio
