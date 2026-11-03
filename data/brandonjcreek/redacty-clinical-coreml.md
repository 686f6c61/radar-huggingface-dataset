# brandonjcreek/redacty-clinical-coreml

## Resumen

Redacty clinical NER (Core ML) es un paquete de conversión a Core ML de dos modelos de reconocimiento de entidades nombradas (NER) clínicas desarrollados por OpenMed: DiseaseDetect y PharmaDetect, ambos de la familia SuperClinical con 141M parámetros. El repositorio, publicado por el desarrollador brandonjcreek, no entrena ni ajusta los modelos, sino que transforma los pesos de PyTorch a formato Core ML para su ejecución local en macOS dentro de la aplicación Redacty, una herramienta que redacta información personal y sanitaria de archivos PDF.

El problema que aborda es la detección en dispositivo de información de salud protegida (PHI) en documentos clínicos: los modelos etiquetan diagnósticos y afecciones (`B/I-DISEASE`) y medicamentos (`B/I-CHEM`) para que un revisor humano pueda eliminarlos antes de compartir el documento. Al ejecutarse íntegramente en el Mac, evita enviar texto clínico a servicios en la nube, lo que resulta relevante para flujos de trabajo con datos sensibles donde la minimización de datos es un requisito.

La relevancia del artefacto es doble: por un lado, demuestra un pipeline reproducible de conversión de modelos transformers a Core ML con verificación de paridad de etiquetas; por otro, expone las limitaciones de este tipo de herramientas como medida de anonimización, ya que el propio autor advierte que no cubren procedimientos y requieren revisión humana obligatoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (token-classification) convertido a Core ML; arquitectura interna del modelo base no detallada en la información disponible |
| Parametros totales | 141M por modelo (dos modelos empaquetados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens de entrada fijos en la conversión |
| Tipos de cuantizacion | No disponible (no se documenta cuantización; se distribuyen artefactos `.mlmodelc` compilados) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML compilado (`.mlmodelc`) dentro de archivos `.aar` (Apple Archive) |

## Arquitectura y entrenamiento

Cada uno de los dos modelos es un clasificador de tokens basado en un encoder transformer de 141M parámetros, orientado a etiquetado BIO: `B/I-DISEASE` para el modelo de detección de enfermedades y `B/I-CHEM` para el de detección de fármacos. No se dispone de información sobre la composición del dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas de ajuste como RLHF o DPO; esos detalles corresponden a los modelos originales de OpenMed y no se reproducen en esta conversión.

La innovación técnica del repositorio reside en el proceso de exportación: los pesos PyTorch se convierten con `coremltools 9.0` (junto con `transformers 4.56.2` y `torch 2.7.0`) a una entrada fija de 512 tokens, se verifica la paridad de etiquetas token a token contra el modelo PyTorch original y se compila a `.mlmodelc`. El autor indica que el export es reproducible y produce archivos idénticos byte a byte al repetirlo. Cada `.aar` incluye el modelo compilado, el tokenizador y los archivos de etiquetas, y la aplicación verifica cada archivo contra digests SHA-256 embebidos antes de instalarlo.

## Capacidades

- Reconocimiento de entidades nombradas clínicas: detección de diagnósticos y afecciones (etiquetas `B/I-DISEASE`).
- Detección de medicamentos y sustancias (etiquetas `B/I-CHEM`).
- Ejecución en dispositivo en macOS mediante Core ML, sin llamadas a servicios externos.
- Etiquetado a nivel de token con formato BIO, adecuado para pipelines de redacción selectiva.
- Integración en flujos de revisión humana: los resultados están pensados para ser validados por una persona antes de la redacción definitiva.
- No se documentan capacidades de tool calling, razonamiento multi-paso, generación de texto libre, visión ni audio.

## Casos de uso

- Redacción de informes clínicos en PDF: la aplicación Redacty usa ambos modelos para localizar diagnósticos y medicamentos en el texto extraído y marcarlos para su eliminación antes de compartir el documento, manteniendo el procesamiento local en el Mac.
- Cumplimiento de minimización de datos en entornos sanitarios: un equipo puede preprocesar historiales antes de enviarlos a un tercero, usando las detecciones como primera pasada que reduce la exposición de PHI, siempre con revisión humana posterior.
- Preparación de datasets de investigación: al anonimizar corpus clínicos para entrenamiento o análisis estadístico, los modelos permiten filtrar menciones de enfermedades y fármacos de forma automática y auditable.
- Despliegue en portátiles de profesionales sanitarios: al ejecutarse en Core ML sobre hardware Apple, no requiere GPU dedicada ni conectividad, lo que facilita su uso en entornos con restricciones de red.
- Auditoría de documentos antes de su publicación: un revisor puede ejecutar el modelo sobre borradores de casos clínicos para detectar menciones inadvertidas de patologías o tratamientos.
- Integración en herramientas de escritorio macOS: desarrolladores pueden empaquetar los `.aar` en sus propias aplicaciones y verificar la integridad con los SHA-256 publicados, reutilizando el pipeline de conversión documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Ejecución exclusiva en macOS con soporte de Core ML (hardware Apple Silicon o Intel compatible con Core ML).
- Cada archivo `.aar` ocupa aproximadamente 227,7 MB; el repositorio completo mide 0,5 GB, por lo que el almacenamiento necesario es moderado.
- Al ser modelos de 141M parámetros con entrada fija de 512 tokens, la inferencia es ligera y cabe en equipos de consumo Apple; no se requieren GPU dedicadas tipo A100, H100 o RTX 4090.
- Despliegue mediante Core ML dentro de la aplicación Redacty o de apps propias que integren los `.mlmodelc`; no se documentan opciones con vLLM, llama.cpp, Ollama ni TGI, ya que el formato no es compatible con esos runtimes.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Redacty clinical NER (Core ML) | 141M por modelo (dos modelos) | 512 tokens | NER clínico (enfermedad y fármaco) | Apache 2.0 | Core ML (`.mlmodelc` en `.aar`) |
| OpenMed-NER-DiseaseDetect-SuperClinical-141M | 141M | No disponible | NER de enfermedades | Apache 2.0 (según repositorio de origen) | PyTorch / transformers |
| OpenMed-NER-PharmaDetect-SuperClinical-141M | 141M | No disponible | NER de fármacos | Apache 2.0 (según repositorio de origen) | PyTorch / transformers |

La comparación con otros modelos NER clínicos de terceros no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es una garantía de anonimización: el propio autor indica que los modelos omiten entidades, no cubren procedimientos y requieren revisión humana en todos los casos.
- No debe usarse como única medida de cumplimiento normativo.
- La ventana de entrada está fijada en 512 tokens, lo que limita el procesamiento de documentos largos sin fragmentación previa.
- Solo se detectan dos categorías (enfermedades y fármacos); no se cubren nombres, direcciones, fechas ni otros identificadores.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación o falsos positivos.
- La licencia Apache 2.0 permite uso comercial, pero el crédito del entrenamiento corresponde a OpenMed y este repositorio solo redistribuye una conversión de formato.
- El uso está restringido a plataformas Apple compatibles con Core ML; no es portable a otros runtimes sin reconversión.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/brandonjcreek/redacty-clinical-coreml
- Modelo base DiseaseDetect: https://huggingface.co/OpenMed/OpenMed-NER-DiseaseDetect-SuperClinical-141M
- Modelo base PharmaDetect: https://huggingface.co/OpenMed/OpenMed-NER-PharmaDetect-SuperClinical-141M
- Perfil del autor: https://huggingface.co/brandonjcreek
