# APLUX-Agora/PP-OCRv6-Small

## Resumen

PP-OCRv6-Small es un modelo de reconocimiento óptico de caracteres (OCR) publicado por APLUX-Agora dentro de su plataforma Agora, orientada a la conversión y despliegue de modelos en hardware Qualcomm para escenarios AIoT. El modelo resuelve la tarea de image-to-text: recibe una imagen y devuelve el texto reconocido, una puntuación de confianza y las coordenadas de un cuadrilátero que delimita cada región de texto detectada. Según la model card, reconoce caracteres en chino, inglés y dígitos.

La relevancia de esta publicación no está en el modelo en sí, sino en su empaquetado: los pesos se distribuyen como recursos ya convertidos y medidos para SoCs Qualcomm concretos, con un binario de contexto (`model.bin`) por precisión y un `model.json` que declara la precisión por defecto y las rutas de cada variante. El autor reporta una latencia de 55,8 ms en FP16 sobre un QCS8550 montado en la placa Rhino Pi X1.

Se trata de un artefacto de despliegue más que de un modelo entrenado desde cero por APLUX-Agora: la propia model card remite a la licencia del modelo original para los pesos de origen y aplica la APLUX Model Farm License únicamente a los recursos convertidos. El repositorio tiene 0 GB de tamaño declarado, 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de OCR; la model card no detalla la topología interna) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de lenguaje) |
| Tipos de cuantización | FP16 (precisión por defecto reportada para QCS8550); otras precisiones no disponibles en la información proporcionada |
| Idiomas soportados | chino, inglés y dígitos (según la model card) |
| Licencia | APLUX Model Farm License para los recursos convertidos; los pesos de origen se rigen por los términos del modelo original |
| Formato de pesos | binarios de contexto Qualcomm (`model.bin`) y manifiesto `model.json` por SoC; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo: no se especifica si emplea un detector de texto basado en segmentación, un reconocedor CTC o attention-based, ni el número de capas o parámetros. La model card únicamente declara la tarea (reconocimiento de texto), las entradas y salidas (imagen de entrada; texto, cajas y JSON de salida) y el pipeline `image-to-text`.

Tampoco se documentan los datos de entrenamiento, el número de tokens o imágenes procesadas, la composición del dataset ni si hubo etapas de ajuste fino con refuerzo o preferencias. El nombre del modelo sugiere continuidad con la familia PP-OCR, pero la ficha no confirma linaje, versión base ni proceso de destilación. La innovación declarada es de tipo operativo: recursos preconvertidos y verificados para un SoC Qualcomm concreto, con latencia medida en placa real y un flujo de descarga selectivo por SoC mediante `hf download --include "targets/<SoC>/*"`.

## Capacidades

- Reconocimiento de texto en imágenes con salida estructurada: texto, puntuación de confianza y cuadrilátero de posición por región detectada.
- Cobertura de caracteres chinos, ingleses y numéricos según la model card.
- Salida en formato JSON además de texto y cajas, lo que facilita su consumo por pipelines posteriores.
- Despliegue en hardware Qualcomm AIoT mediante binarios de contexto QNN ya compilados.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso ni comportamiento de agente.
- No se documentan capacidades de visión general (descripción de imágenes, VQA) más allá del reconocimiento de texto.
- No se documentan modos de pensamiento, audio ni otras modalidades.

## Casos de uso

- Digitalización de documentos en dispositivos de borde: el modelo puede ejecutarse en un QCS8550 integrado en un lector o terminal y devolver texto y cajas para reconstruir el orden de lectura, con 55,8 ms por inferencia en FP16 según la medición del autor.
- Lectura de matrículas, etiquetas o paneles en entornos industriales: la salida con cuadriláteros permite localizar cada cadena reconocida sobre la imagen original y validar la confianza antes de actuar.
- Extracción de datos de tickets y formularios en comercio minorista: al devolver JSON con texto y posiciones, se puede mapear cada campo a una plantilla sin depender de un servicio en la nube.
- Procesamiento en cámara de vigilancia o control de accesos: la latencia medida en placa y la conversión a QNN lo hacen apto para inferencia local continua sin round-trip a servidor.
- Preprocesado de pipelines RAG sobre documentación escaneada: el texto reconocido y las cajas permiten segmentar por bloques antes de enviar a un modelo de lenguaje.
- Asistencia a la accesibilidad: lectura en voz alta de texto presente en el entorno capturado por la cámara de un dispositivo empotrado, usando las cajas para ordenar la locución.
- Verificación de inventario y logística: lectura de códigos alfanuméricos y etiquetas en cadenas de montaje donde no se quiere depender de conectividad.

## Benchmarks y rendimiento

La única métrica publicada en la información disponible es la latencia de inferencia en placa:

| SoC · placa | Precisión | Latencia medida (Agora) |
|---|---|---|
| QCS8550 · Rhino Pi X1 | FP16 | 55,8 ms |

No se han publicado resultados de benchmarks de calidad (precisión de reconocimiento, CER/WER, F1 de detección) en la información disponible.

## Requisitos de hardware

- Hardware de destino declarado: SoC Qualcomm QCS8550 sobre placa Rhino Pi X1, con precisión FP16 y 55,8 ms por inferencia.
- No se documentan requisitos de VRAM ni de memoria del acelerador para otras plataformas.
- No hay información sobre ejecución en GPU de sobremesa (A100, H100, RTX 4090) ni en GPUs de consumo: los artefactos distribuidos son binarios de contexto QNN, no pesos en safetensors o GGUF.
- Opciones de despliegue: el runner y el proyecto exportado se obtienen desde la plataforma Agora (sección «部署指南» o exportando un flujo de trabajo que use el modelo). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, lo cual es esperable en un modelo de OCR empaquetado para NPU.
- Throughput estimado: no disponible; solo se publica latencia puntual por inferencia.
- El preprocesado y postprocesado no vienen incluidos en la descarga de recursos: deben tomarse del proyecto exportado en Agora.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos de OCR comparables (por ejemplo, variantes de la familia PP-OCR, PaddleOCR o alternativas comerciales) ni métricas de calidad que permitan establecer una comparación rigurosa. La única referencia objetiva es la latencia de 55,8 ms en QCS8550 en FP16, sin término de comparación publicado.

## Limitaciones y advertencias

- Idiomas limitados a chino, inglés y dígitos según la model card; no se documenta cobertura de alfabetos latinos extendidos, cirílico, árabe u otros.
- No se publican métricas de calidad (CER, WER, precisión de detección), por lo que no es posible estimar la tasa de error esperada en producción.
- Riesgo de alucinación no evaluado: en OCR, el fallo típico es la sustitución o elusión de caracteres en imágenes de baja calidad, sin que la ficha aporte datos al respecto.
- La licencia de los pesos de origen queda remitida a los términos del modelo original, que no se identifican explícitamente en la información disponible; verificar antes de uso comercial.
- Los recursos convertidos se rigen por la APLUX Model Farm License, cuyos términos completos están en el PDF enlazado y no se resumen en la model card.
- El repositorio declara 0 GB de tamaño, lo que puede indicar que los artefactos aún no están materializados o que la medición no está actualizada; conviene verificar la descarga antes de integrar.
- Dependencia fuerte del ecosistema Agora y de SoCs Qualcomm: no hay ruta de despliegue documentada para CPU, GPU convencional u otros aceleradores.
- El modelo no incluye preprocesado ni postprocesado en el paquete de recursos; una integración incorrecta de estos pasos degradará la precisión de forma significativa.
- Sin descargas ni likes registrados: no existe validación comunitaria publicada que respalde el comportamiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/APLUX-Agora/PP-OCRv6-Small
- Licencia APLUX Model Farm (PDF): https://huggingface.co/APLUX-Agora/PP-OCRv6-Small/blob/main/LICENSE_MODEL_FARM.pdf
- Prueba online del modelo en Agora: https://mega.aidlux.com/models/pp-ocrv6-small
- Plataforma Agora: https://mega.aidlux.com
