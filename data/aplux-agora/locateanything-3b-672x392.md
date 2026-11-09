# APLUX-Agora/LocateAnything-3B-672x392

## Resumen

LocateAnything-3B-672x392 es un paquete de recursos para despliegue en hardware Qualcomm del modelo de detección de objetos por texto (visual grounding) LocateAnything-3B, publicado por APLUX-Agora dentro del ecosistema Agora de AIoT. No se trata de los pesos originales en formato estándar, sino de artefactos convertidos y empaquetados por la plataforma APLUX Model Farm para ejecutarse sobre aceleradores QNN (Qualcomm Neural Network) en SoC concretos, con preprocesado, postprocesado y runner incluidos.

La tarea es localización visual: dado un texto descriptivo y una imagen de entrada de 672x392 píxeles, el modelo devuelve cajas delimitadoras (boxes) correspondientes a los objetos descritos. El paquete documenta un único target verificado, el SoC QCS8550 sobre la placa Rhino Pi X1, con precisión W4A16 (pesos de 4 bits, activaciones de 16 bits) y una latencia medida de 1535,4 ms.

Su relevancia es acotada pero específica: cubre el nicho de despliegue de detección guiada por lenguaje en dispositivos edge con NPU Qualcomm, un escenario donde la mayoría de modelos open source no ofrecen artefactos precompilados ni validación por placa. La información publicada es muy escasa: no hay detalles de arquitectura interna, datos de entrenamiento ni benchmarks de precisión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LocateAnything-3B, detalles no publicados en la model card) |
| Parámetros totales | 3B (según el nombre del modelo) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | W4A16 (pesos 4 bits, activaciones 16 bits) para QCS8550 |
| Idiomas soportados | no disponible (entrada textual; idiomas no especificados) |
| Licencia | APLUX Model Farm License (license_name: aplux-model-farm); el modelo fuente se rige por sus propios términos |
| Formato de pesos | artefactos QNN por target (`model.json` + directorios por precisión, binarios `model.bin`); no se publican safetensors ni GGUF |
| Tarea | object-detection / visual grounding |
| Entrada | imagen, resolución 672x392 |
| Salida | cajas delimitadoras (boxes) |
| SoC soportado | QCS8550 (placa Rhino Pi X1) |
| Latencia medida | 1535,4 ms (W4A16, precisión por defecto, QCS8550) |
| Tamaño del repo | 3,5 GB |

## Arquitectura y entrenamiento

No se publica información sobre la arquitectura interna del modelo base LocateAnything-3B en la model card. Por el nombre y la tarea (localización visual guiada por texto) se trata de un modelo multimodal que combina codificación de imagen y de texto para producir cajas delimitadoras, pero no se detallan el tipo de transformer, el mecanismo de fusión visión-lenguaje ni la resolución nativa del codificador visual.

Tampoco se documentan los datos de entrenamiento (número de tokens, composición del dataset, imágenes y anotaciones), ni si hubo ajuste por instrucciones, RLHF o DPO. Lo único verificable es el proceso de conversión y validación por parte de APLUX: recursos convertidos a QNN, empaquetados por Model Farm y medidos en placas Qualcomm reales, con preprocesado y postprocesado incluidos en el paquete.

## Capacidades

- Localización visual por texto: recibe una imagen y una descripción textual y devuelve las cajas delimitadoras de los objetos descritos.
- Detección de objetos en el sentido amplio de la pipeline `object-detection`, limitada a la modalidad texto-imagen.
- Ejecución en NPU Qualcomm mediante artefactos QNN precompilados para QCS8550.
- Preprocesado y postprocesado incluidos en el paquete de despliegue, junto con el runner.
- Exportación de proyectos y flujos de trabajo desde la plataforma Agora.
- No se documentan capacidades de generación de texto libre, razonamiento multi-paso, tool calling, agentes, matemáticas, código, audio ni visión general más allá de la localización.

## Casos de uso

- Inspección visual en edge con NPU Qualcomm: desplegar el paquete en un dispositivo QCS8550 para localizar objetos descritos por texto en imágenes de 672x392, sin depender de la nube y con una latencia medida de aproximadamente 1,5 s por inferencia.
- Robótica y automatización industrial: usar la localización guiada por lenguaje para que un brazo o una cámara identifique piezas concretas descritas verbalmente ("la caja roja junto al tornillo") dentro de una celda de fabricación.
- Videovigilancia y análisis de escenas en AIoT: integrar el modelo en cámaras o gateways con SoC Qualcomm para etiquetar objetos bajo demanda mediante consultas textuales, aprovechando el despliegue nativo en QNN.
- Asistencia a personas con discapacidad visual: localizar objetos descritos por el usuario en la imagen capturada por un dispositivo portátil y devolver su posición, con la ventaja de ejecutarse localmente en hardware de bajo consumo.
- Control de calidad en líneas de producción: verificar la presencia y posición de componentes descritos por texto en imágenes capturadas por cámaras fijas, con el modelo ejecutándose en la propia placa.
- Prototipado y evaluación sin hardware: probar el modelo en línea a través de Agora (mega.aidlux.com) antes de adquirir o desplegar en una placa física, útil para validar la idoneidad de la tarea antes de invertir en el dispositivo.
- Logística y almacén: localizar palés, cajas o etiquetas descritas por el operario en imágenes de cámaras de muelle, ejecutando la inferencia en el gateway local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (mAP, recall, etc.) en la información disponible. El único dato de rendimiento medido es la latencia de inferencia:

| SoC · placa | Precisión | Latencia medida |
|---|---|---|
| QCS8550 · Rhino Pi X1 | W4A16 | 1535,4 ms |

## Requisitos de hardware

- Hardware de destino verificado: SoC Qualcomm QCS8550 sobre la placa Rhino Pi X1 (犀牛派 X1).
- Aceleración: NPU Qualcomm mediante runtime QNN; el paquete incluye binarios compilados por target (`targets/<SoC>/`).
- Precisión por defecto: W4A16, con directorios adicionales por precisión si el autor los publica.
- VRAM/RAM estimada: no disponible; el repo ocupa 3,5 GB y el despliegue se realiza sobre memoria del SoC, no sobre GPU de escritorio.
- GPU de escritorio (A100, H100, RTX 4090): no aplica; no se publican pesos en safetensors ni GGUF para inferencia en GPU convencional.
- Opciones de despliegue: runtime Agora / QNN en la placa Qualcomm; exportación de proyectos desde Agora; descarga selectiva por SoC con `hf download --include "targets/$AGORA_SOC/*"`.
- Latencia: 1535,4 ms por inferencia en QCS8550 con W4A16. Throughput no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (visual grounding en edge con artefactos QNN) ni datos de rendimiento de alternativas que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Información muy escasa: no se documentan arquitectura, datos de entrenamiento, idiomas ni métricas de precisión, lo que impide evaluar la calidad del modelo antes de desplegarlo.
- Cobertura de hardware limitada: solo se verifica el SoC QCS8550; no hay artefactos para otras NPU Qualcomm ni para GPU convencionales.
- Resolución de entrada fija de 672x392; objetos pequeños o imágenes de mayor resolución pueden requerir redimensionado y perder detalle.
- Latencia de aproximadamente 1,5 s por inferencia en el hardware medido, adecuada para aplicaciones no interactivas pero no para tiempo real estricto.
- Licencia restrictiva: los recursos convertidos se rigen por la APLUX Model Farm License, y el modelo fuente por sus propios términos; es imprescindible revisar ambas antes de cualquier uso comercial.
- Riesgo de alucinación y falsos positivos inherente a los modelos de grounding: puede devolver cajas para descripciones ambiguas o inexistentes en la imagen; no se publican métricas de calibración.
- Idiomas de la consulta textual no especificados; la model card está parcialmente en chino, lo que sugiere un sesgo hacia ese idioma sin confirmación.
- Sin descargas ni likes en el momento de la ficha; ausencia de validación por parte de la comunidad.
- Dependencia del ecosistema Agora para el runner, el pre/postprocesado y la exportación de proyectos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/APLUX-Agora/LocateAnything-3B-672x392
- Prueba en línea en Agora: https://mega.aidlux.com/models/locateanything-3b-672x392
- Plataforma Agora: https://mega.aidlux.com
- Licencia APLUX Model Farm: https://huggingface.co/APLUX-Agora/LocateAnything-3B-672x392/blob/main/LICENSE_MODEL_FARM.pdf
- Ficheros de procedencia y verificación: NOTICE.md y SHA256SUMS en el repositorio del modelo
