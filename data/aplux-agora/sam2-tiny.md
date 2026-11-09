# APLUX-Agora/SAM2-tiny

## Resumen

SAM2-tiny es una conversión del modelo Segment Anything Model 2 (SAM2) en su variante tiny, empaquetada por APLUX-Agora para su despliegue en hardware Qualcomm con aceleración NPU. El modelo resuelve segmentación de imágenes a partir de indicaciones por punto (point-prompted image segmentation), distribuyendo la carga de trabajo entre un codificador de imagen que se ejecuta en la NPU y un decodificador derivado del checkpoint original que se ejecuta en CPU. El paquete se distribuye en formato ONNX/QNN con binarios de contexto específicos por SoC.

La relevancia de esta ficha radica en que no se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue orientado a AIoT: recursos listos para ejecutar en placas Qualcomm concretas, con métricas medidas en la plataforma Agora. El repositorio ocupa 0,1 GB y no incluye pesos en safetensors ni GGUF, sino binarios de contexto por precisión y SoC.

No se dispone de información sobre el número de parámetros, la longitud de contexto (no aplica a segmentación) ni los datos de entrenamiento originales en la documentación proporcionada. La model card remite a los términos del modelo fuente para la licencia del modelo original y aplica la APLUX Model Farm License a los recursos convertidos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (SAM2, codificador de imagen en NPU + decodificador en CPU) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de segmentación de imágenes) |
| Tipos de cuantización | FP16 (precisión por defecto en QCS8550); otras precisiones por directorio en `targets/<SoC>/` no detalladas |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | APLUX Model Farm License para los recursos convertidos; términos del modelo fuente para el modelo original (license: other) |
| Formato de pesos | ONNX / QNN (binarios de contexto `model.bin` por SoC y precisión) |
| Tarea | Segmentación de imágenes con indicación por punto |
| Entradas | `image` |
| Salidas | `masks`, `out` (JSON) |
| SoC medido | QCS8550 (placa Rhino Pi X1) |
| Latencia medida | 300,2 ms (FP16, precisión por defecto, en Agora) |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El paquete se basa en SAM2, un modelo de segmentación de imágenes que combina un codificador de imagen con un decodificador de máscaras. En esta conversión, el codificador de imagen se ejecuta en la NPU del SoC Qualcomm y el decodificador, derivado del checkpoint original, se ejecuta en CPU. La distribución del cómputo entre NPU y CPU es la innovación de despliegue principal del paquete: permite ejecutar segmentación interactiva en placas AIoT de gama alta sin GPU dedicada.

No se proporcionan datos sobre el entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF o DPO) ni sobre el proceso de conversión a QNN más allá de la mención a Model Farm. El repositorio incluye `model.json` por SoC con la precisión por defecto y las rutas de las variantes, binarios de contexto `model.bin` y paquetes multifichero tal como los publica Model Farm. También se incluyen `NOTICE.md` y `SHA256SUMS` para verificación de integridad y procedencia.

## Capacidades

- Segmentación de imágenes a partir de indicaciones por punto (point-prompted segmentation).
- Generación de máscaras de segmentación como salida principal (`masks`).
- Salida auxiliar en JSON (`out`) para metadatos o resultados estructurados.
- Ejecución acelerada en NPU Qualcomm para el codificador de imagen.
- Despliegue en placas AIoT concretas mediante binarios de contexto por SoC.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni multilingüismo.

## Casos de uso

- Segmentación interactiva en dispositivos de borde: el modelo recibe una imagen y un punto de indicación y devuelve la máscara del objeto correspondiente, ejecutándose en la NPU de un SoC QCS8550 con una latencia medida de 300,2 ms en FP16, adecuada para aplicaciones de asistencia en tiempo casi real.
- Anotación asistida en herramientas de etiquetado: integrado en un flujo de anotación, permite generar máscaras iniciales a partir de un clic del anotador, reduciendo el tiempo de etiquetado manual en conjuntos de datos de visión.
- Visión por computador en robótica de bajo consumo: sobre una placa Rhino Pi X1 con QCS8550, el paquete permite segmentar objetos en la escena sin depender de un servidor externo, útil para tareas de manipulación o navegación que requieran máscaras por objeto.
- Preprocesado en pipelines de inspección visual: la salida `masks` puede alimentar etapas posteriores de medición o clasificación en un sistema de inspección embarcado, aprovechando la división NPU/CPU para liberar la NPU en otras tareas.
- Prototipado rápido en AIoT sin placa física: la plataforma Agora permite probar el modelo en línea antes de desplegarlo, lo que facilita evaluar la idoneidad del modelo para un caso concreto antes de adquirir hardware.
- Segmentación en aplicaciones de realidad aumentada móvil: el modelo puede generar máscaras de personas u objetos en tiempo de ejecución sobre hardware Qualcomm, habilitando efectos de recorte o superposición sin procesamiento en la nube.
- Despliegue reproducible con verificación de integridad: los ficheros `NOTICE.md` y `SHA256SUMS` permiten validar los binarios descargados en entornos de producción con requisitos de trazabilidad.

## Benchmarks y rendimiento

| Métrica | Valor | Contexto |
|---|---|---|
| Latencia de inferencia | 300,2 ms | QCS8550, placa Rhino Pi X1, FP16, precisión por defecto, medido en Agora |

No se han publicado resultados de benchmarks de calidad de segmentación (IoU, mAP u otras métricas) en la información disponible.

## Requisitos de hardware

- Hardware objetivo: SoC Qualcomm QCS8550 (placa Rhino Pi X1); el repositorio organiza los recursos por SoC en `targets/<SoC>/`, por lo que pueden existir otros targets no listados en la model card.
- Aceleración: NPU Qualcomm para el codificador de imagen; CPU para el decodificador.
- VRAM: no aplica; el modelo se ejecuta en el subsistema NPU/CPU del SoC, no en GPU de escritorio.
- GPU de escritorio (A100, H100, RTX 4090): no documentadas para este paquete; el formato de pesos es ONNX/QNN orientado a Qualcomm.
- Despliegue: descarga mediante `hf download` con los parámetros `AGORA_SOC` y `AGORA_WORKSPACE`; ejecución a través del runner de Agora. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: 300,2 ms en QCS8550 con FP16. No se proporcionan datos de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Hardware objetivo | Licencia | Latencia documentada |
|---|---|---|---|---|---|
| SAM2-tiny (APLUX-Agora) | Segmentación por punto | ONNX/QNN | Qualcomm QCS8550 | APLUX Model Farm License + términos del modelo fuente | 300,2 ms (QCS8550, FP16) |
| SAM2 original (Meta) | Segmentación por punto | PyTorch (safetensors) | GPU NVIDIA/AMD | Apache 2.0 (según la versión de SAM2; verificar términos) | No disponible en esta ficha |
| SAM original (Meta) | Segmentación por punto | PyTorch | GPU NVIDIA/AMD | Apache 2.0 | No disponible en esta ficha |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada, por lo que la comparación se limita a formato, hardware objetivo y licencia.

## Limitaciones y advertencias

- El paquete no incluye pesos en formato estándar (safetensors, GGUF); está atado al ecosistema QNN/Agora y a los SoC para los que se publican binarios de contexto.
- La licencia APLUX Model Farm License se aplica a los recursos convertidos y es distinta de la licencia del modelo fuente; es imprescindible revisar `LICENSE_MODEL_FARM.pdf` antes de cualquier uso comercial.
- La model card remite a los términos del modelo original para el modelo fuente, sin especificarlos; no se puede confirmar desde esta ficha si el uso comercial está permitido.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas, ya que no es un modelo generativo de texto.
- Solo se documenta una medición en un SoC (QCS8550); el rendimiento en otros SoC no está disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia de uso en producción por terceros.
- La fecha de creación indicada (2026-11-09) es posterior a la fecha habitual de consulta; verificar la vigencia del artefacto antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/APLUX-Agora/SAM2-tiny
- Licencia APLUX Model Farm: https://huggingface.co/APLUX-Agora/SAM2-tiny/blob/main/LICENSE_MODEL_FARM.pdf
- Prueba en línea en Agora: https://mega.aidlux.com/models/sam2-tiny
- Plataforma Agora: https://mega.aidlux.com
