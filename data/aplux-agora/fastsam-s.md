# APLUX-Agora/FastSAM-S

## Resumen

FastSAM-S es un modelo de segmentación de imágenes basado en FastSAM (Fast Segment Anything Model), publicado por APLUX-Agora como un paquete de recursos desplegables para placas con SoC de Qualcomm. El repositorio no contiene los pesos originales en formato de entrenamiento, sino artefactos convertidos y validados por placa para su ejecución sobre el runtime QNN (Qualcomm Neural Network), orientados a despliegues de visión artificial en el borde (AIoT). La variante "S" corresponde a la versión Small de la familia FastSAM.

El modelo resuelve la tarea de segmentación de imágenes: recibe una imagen y devuelve máscaras de segmentación. Su relevancia radica en que ofrece builds precompilados y medidos en hardware real (QCS6490 y QCS8550), con latencias documentadas de 13,8 ms y 8,8 ms respectivamente en la precisión por defecto, lo que facilita la evaluación y el despliegue en dispositivos empotrados sin necesidad de disponer físicamente de la placa.

El repositorio tiene un tamaño de 0,1 GB, no registra descargas ni interacciones, y se distribuye bajo licencia AGPL-3.0 para el modelo fuente, mientras que los recursos convertidos quedan sujetos a la APLUX Model Farm License. No se dispone de información sobre arquitectura interna, número de parámetros ni longitud de contexto en la documentación proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de segmentación de imágenes; familia FastSAM, variante Small) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantización | FP16, W8A16, W8A8 (según SoC) |
| Idiomas soportados | no disponible |
| Licencia | AGPL-3.0 (modelo fuente); APLUX Model Farm License (recursos convertidos) |
| Formato de pesos | artefactos QNN (`model.bin` y paquetes multi-fichero por precisión); `model.json` por SoC |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el proceso de entrenamiento, el volumen de datos utilizado ni si hubo ajuste fino con RLHF/DPO. La model card únicamente describe el pipeline de despliegue: recursos preprocesados con las herramientas oficiales de Model Farm, validados placa a placa, con binarios de contexto QNN organizados por SoC y precisión. La tarea declarada es segmentación de imágenes, con una entrada de tipo imagen y una salida de máscaras.

La innovación destacable del paquete no reside en el modelo en sí, sino en la infraestructura de despliegue: compilación a QNN para aceleradores Hexagon/Adreno de Qualcomm, soporte de varias precisiones (FP16, W8A16, W8A8) y medición de latencia en hardware real. El repositorio incluye `NOTICE.md` y `SHA256SUMS` para verificación de integridad de los artefactos.

## Capacidades

- Segmentación de imágenes: genera máscaras a partir de una imagen de entrada.
- Ejecución en aceleradores Qualcomm mediante QNN, con builds específicos por SoC.
- Soporte de múltiples precisiones de cuantización (FP16, W8A16, W8A8) según la placa.
- Integración con el flujo de despliegue de Agora (preprocesado, postprocesado y runner incluidos).
- Exportación de proyectos y workflows que utilicen el modelo desde la plataforma Agora.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, texto, audio ni visión general más allá de la segmentación.

## Casos de uso

- Segmentación en tiempo real en cámaras IP con SoC QCS6490: con 13,8 ms por inferencia en la precisión por defecto, el modelo permite procesar flujos de vídeo a decenas de FPS en la propia placa, sin enviar imágenes a la nube.
- Inspección visual industrial en dispositivos QCS8550: los 8,8 ms medidos en la Rhino Pi X1 permiten integrar la segmentación en líneas de producción para detectar defectos o delimitar regiones de interés.
- Robótica móvil y AGV: la segmentación de escenas a bordo ayuda a delimitar obstáculos y superficies transitables usando la NPU del SoC, con bajo consumo y sin depender de conectividad.
- Moderación o filtrado de contenido visual en el borde: separar objetos o personas del fondo antes de decidir si se reenvía una imagen a un servicio central, reduciendo ancho de banda y exposición de datos.
- Análisis de imágenes médicas o agrícolas en campo: la variante Small y la ejecución local permiten desplegar segmentación en dispositivos portátiles alimentados por batería con SoC Qualcomm.
- Prototipado y evaluación sin hardware: la plataforma Agora permite probar el modelo en línea (mega.aidlux.com) antes de adquirir una placa, útil para validar latencias y precisiones.
- Integración en pipelines de visión existentes: el paquete incluye preprocesado, postprocesado y runner, lo que simplifica sustituir un modelo de segmentación previo por este build optimizado.

## Benchmarks y rendimiento

La model card no publica métricas de calidad (mIoU, AP de máscaras) ni comparaciones con otros modelos. Solo se documentan latencias medidas en hardware real:

| SoC · placa | Precisiones | Latencia (precisión por defecto) |
|---|---|---|
| QCS6490 · Rhino Pi A1 | W8A16, W8A8 | 13,8 ms |
| QCS8550 · Rhino Pi X1 | FP16, W8A16, W8A8 | 8,8 ms |

No se han publicado resultados de benchmarks de calidad en la información disponible.

## Requisitos de hardware

- VRAM: no aplica en el sentido convencional; el modelo se ejecuta sobre NPU/DSP de SoC Qualcomm. No se especifica memoria del sistema requerida.
- GPU/SoC recomendados: QCS6490 (Rhino Pi A1) y QCS8550 (Rhino Pi X1) son las plataformas validadas y medidas.
- Compatibilidad con GPU de consumo (RTX, A100, H100): no documentada; el paquete está orientado a QNN y hardware Qualcomm.
- Opciones de despliegue: runtime QNN de Qualcomm a través de los recursos de Agora/Model Farm; la model card no menciona vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia: 13,8 ms en QCS6490 y 8,8 ms en QCS8550 con la precisión por defecto. El throughput no se especifica, pero puede estimarse a partir de la latencia por inferencia.
- Descarga selectiva por SoC mediante `hf download --include "targets/<SoC>/*"`.

## Comparativa con modelos similares

No se dispone de datos de parámetros, contexto ni rendimiento de calidad de FastSAM-S en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable con otras variantes de FastSAM (B, L, X) ni con alternativas como MobileSAM o SAM. La comparación disponible se limita al soporte de hardware:

| Modelo | Soporte Qualcomm QNN | Latencias publicadas | Licencia |
|---|---|---|---|
| FastSAM-S (APLUX-Agora) | Sí, builds por SoC | 13,8 ms (QCS6490), 8,8 ms (QCS8550) | AGPL-3.0 + Model Farm License |
| Otras variantes FastSAM | no disponible | no disponible | no disponible |
| Alternativas de segmentación | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se documentan sesgos conocidos, pero al ser un modelo de segmentación hereda los sesgos de su dataset de entrenamiento original, no especificado aquí.
- Riesgo de máscaras imprecisas en escenas fuera de la distribución de entrenamiento; no hay métricas de calidad publicadas que permitan acotar este riesgo.
- El repositorio no contiene los pesos originales en formato estándar (safetensors, GGUF, ONNX), sino artefactos QNN específicos de SoC, lo que limita su uso fuera de hardware Qualcomm.
- La licencia AGPL-3.0 del modelo fuente impone obligaciones de copyleft para uso en red; los recursos convertidos añaden la APLUX Model Farm License, cuyos términos deben revisarse antes de un uso comercial.
- El modelo tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-09), por lo que no hay evidencia de uso en producción ni validación por terceros.
- No se especifican idiomas ni capacidades multilingües; la tarea es puramente visual.
- La fecha de creación indicada (2026) es posterior a la fecha actual en muchos entornos, lo que conviene verificar antes de confiar en los metadatos.

## Enlaces

- Hugging Face: https://huggingface.co/APLUX-Agora/FastSAM-S
- Prueba en línea en Agora: https://mega.aidlux.com/models/fastsam-s
- Plataforma Agora: https://mega.aidlux.com
- Licencia del modelo fuente (AGPL-3.0): incluida en el repositorio como LICENSE
- Licencia de recursos convertidos: LICENSE_MODEL_FARM.pdf (en el repositorio)
- Integridad de artefactos: NOTICE.md y SHA256SUMS (en el repositorio)
