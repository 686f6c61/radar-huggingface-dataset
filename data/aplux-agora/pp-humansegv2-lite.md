# APLUX-Agora/PP-HumanSegV2-Lite

## Resumen

PP-HumanSegV2-Lite es un modelo de segmentación de imágenes orientado a la separación de personas (human segmentation) en entornos de borde. Lo publica APLUX-Agora dentro de su catálogo Agora, una plataforma de despliegue de modelos optimizados para SoCs de Qualcomm en escenarios AIoT. El modelo no es un desarrollo original de APLUX: se trata de recursos convertidos y empaquetados a partir del modelo fuente PP-HumanSegV2-Lite de PaddleSeg, con artefactos compilados para el acelerador neuronal (QNN) de Qualcomm.

La relevancia del artefacto está en su formato: no se distribuye como pesos estándar de PyTorch o safetensors, sino como paquetes de despliegue por SoC (`targets/<SoC>/`) con binarios `model.bin` listos para ejecutarse en el hardware, junto con `model.json` que describe la precisión por defecto y las variantes disponibles. Esto elimina el trabajo de conversión y cuantización que normalmente requiere llevar un modelo de segmentación a un dispositivo embebido.

El modelo está validado en dos placas concretas: QCS6490 (Rhino Pi A1) y QCS8550 (Rhino Pi X1), con latencias medidas de 2,3 ms y 0,9 ms respectivamente en la precisión por defecto. La información disponible no incluye detalles sobre arquitectura interna, número de parámetros, contexto ni idiomas, por lo que esos apartados se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de segmentación de imágenes; presumiblemente CNN, sin confirmar en la información proporcionada) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantización | FP16, W8A16, W8A8 (según SoC) |
| Idiomas soportados | no disponible (no aplica a la tarea de segmentación) |
| Licencia | APLUX Model Farm License (license_name: aplux-model-farm); licencia del modelo fuente según sus términos originales |
| Formato de pesos | binarios QNN (`model.bin`) por SoC y precisión, con `model.json` de configuración; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo fuente ni el proceso de entrenamiento (número de tokens o imágenes, composición del dataset, uso de destilación o fine-tuning). El nombre remite a PP-HumanSegV2-Lite, un modelo de la familia PaddleSeg especializado en segmentación de personas, pero la model card de APLUX-Agora no reproduce esas especificaciones.

Lo que sí documenta el artefacto es la cadena de despliegue: recursos convertidos con el preprocesado y postprocesado oficiales de Model Farm, validados placa a placa. Cada directorio `targets/<SoC>/` contiene `model.json` con la precisión por defecto y las rutas de las variantes, y un subdirectorio por precisión con los binarios de contexto QNN. Se incluyen `NOTICE.md` y `SHA256SUMS` para verificación de integridad.

## Capacidades

- Segmentación de imágenes con salida de máscaras (output `masks`), orientada a la separación de personas del fondo.
- Entrada de imagen única (`image`) y salida de máscara, según la definición de la tarea en la model card.
- Ejecución en el acelerador neuronal de Qualcomm vía QNN, con variantes de precisión FP16, W8A16 y W8A8 según el SoC.
- Despliegue en placas AIoT concretas: QCS6490 (Rhino Pi A1) y QCS8550 (Rhino Pi X1).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, texto, audio ni modo thinking.

## Casos de uso

- Videollamadas y conferencias con sustitución de fondo: el modelo genera la máscara de persona en tiempo real y permite aplicar desenfoque o reemplazo de fondo en el propio dispositivo, sin enviar vídeo a la nube, gracias a latencias de 0,9-2,3 ms por inferencia.
- Edición de vídeo y fotografía en móvil o cámara: recorte automático de sujetos para herramientas de retoque, collage o generación de miniaturas, ejecutando la segmentación localmente en el SoC.
- Videovigilancia y analítica de aforo en borde: detección y segmentación de personas en cámaras IP con SoC Qualcomm, filtrando falsos positivos de movimiento y habilitando conteo o control de zonas sin coste de ancho de banda.
- Retransmisión en directo con fondo virtual: integración en pipelines de streaming para OBS o aplicaciones de broadcast en hardware embebido, donde la baja latencia es crítica para mantener la cadencia de fotogramas.
- Robótica de servicio y kioscos interactivos: segmentación de la persona que interactúa con el dispositivo para adaptar la interfaz, el encuadre de cámara o la reacción del sistema.
- Preprocesado en pipelines de visión por computador: generación de máscaras de persona como etapa previa a reconocimiento de pose, reidentificación o análisis de gestos, reduciendo el ruido de fondo antes de modelos más costosos.
- Prototipado en AIoT: validación rápida de una idea de producto con segmentación de personas usando la placa Rhino Pi y los recursos ya convertidos, sin necesidad de montar una cadena de conversión propia.

## Benchmarks y rendimiento

La model card solo publica latencias medidas en las placas soportadas con la precisión por defecto. No se han publicado resultados de benchmarks de calidad de segmentación (mIoU, IoU, FPS) en la información disponible.

| SoC · placa | Precisión por defecto | Latencias medidas en Agora |
|---|---|---|
| QCS6490 · Rhino Pi A1 | no especificada (variantes W8A16 y W8A8) | 2,3 ms |
| QCS8550 · Rhino Pi X1 | no especificada (variantes FP16, W8A16 y W8A8) | 0,9 ms |

## Requisitos de hardware

- Hardware de destino: SoCs Qualcomm QCS6490 y QCS8550, en las placas Rhino Pi A1 y Rhino Pi X1 respectivamente. No se documenta soporte para GPU de escritorio, CPU x86 ni otros aceleradores.
- VRAM: no aplica en el sentido convencional; el modelo se ejecuta en el acelerador neuronal integrado del SoC. No se publica el consumo de memoria por variante de precisión.
- GPU de consumo (RTX 4090, etc.): no disponible; el artefacto distribuido son binarios QNN, no pesos portables.
- Opciones de despliegue: runtime QNN a través de la plataforma Agora (https://mega.aidlux.com). Se puede probar en línea sin placa física. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de modelo.
- Latencia: 2,3 ms en QCS6490 y 0,9 ms en QCS8550 en la precisión por defecto. El throughput no se publica.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones del modelo fuente en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas como PP-HumanSegV2 completo, MODNet o MediaPipe Selfie Segmentation. La comparación cualitativa disponible se limita al formato de distribución:

| Criterio | PP-HumanSegV2-Lite (APLUX-Agora) | Alternativas genéricas |
|---|---|---|
| Formato | Binarios QNN por SoC | Pesos PyTorch/ONNX portables |
| Cuantización incluida | FP16, W8A16, W8A8 validadas | Requiere conversión propia |
| Hardware validado | QCS6490, QCS8550 | No aplica |
| Licencia | APLUX Model Farm License | Variable según modelo |
| Benchmarks de calidad | no disponible | no disponible en esta ficha |

## Limitaciones y advertencias

- La licencia APLUX Model Farm License es distinta de la del modelo fuente; es necesario revisar `LICENSE_MODEL_FARM.pdf` antes de cualquier uso comercial, ya que las condiciones no se resumen en la model card.
- Los recursos distribuidos están atados a SoCs Qualcomm concretos; no son portables a otros aceleradores sin un nuevo proceso de conversión.
- No se publican métricas de calidad de segmentación (mIoU, IoU), por lo que no se puede evaluar la precisión del modelo a partir de la información disponible.
- No se documentan sesgos, comportamiento en condiciones de iluminación adversas, oclusión o grupos demográficos diversos; el rendimiento en dominios distintos al de validación es desconocido.
- El repositorio figura con 0 descargas y 0 likes y un tamaño de 0.0 GB en el momento de la consulta, lo que puede indicar que los artefactos no están efectivamente alojados o que la métrica no refleja el contenido real; conviene verificar la descarga antes de integrarlo en producción.
- No hay información sobre el modelo fuente (arquitectura, parámetros, dataset de entrenamiento), lo que dificulta la auditoría técnica.
- Al ser un modelo de segmentación de personas, no debe usarse para identificación biométrica ni vigilancia invasiva sin base legal; la licencia y la normativa aplicable (por ejemplo, RGPD) condicionan esos usos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/APLUX-Agora/PP-HumanSegV2-Lite
- Prueba en línea en Agora: https://mega.aidlux.com/models/pp-humansegv2-lite
- Plataforma Agora: https://mega.aidlux.com
- Licencia APLUX Model Farm: https://huggingface.co/APLUX-Agora/PP-HumanSegV2-Lite/blob/main/LICENSE_MODEL_FARM.pdf
