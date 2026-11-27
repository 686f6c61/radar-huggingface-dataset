# dungd/SenOCR-Vi-Q4_K_M-GGUF

## Resumen

SenOCR-Vi-Q4_K_M-GGUF es una cuantización en formato GGUF (tipo Q4_K_M) del modelo SenOCR-Vi, desarrollado originalmente por VietAlphaLabs y convertida por el usuario dungd mediante el flujo `gguf-my-repo`. El modelo base es un sistema de OCR y parsing de documentos orientado a vietnamita, construido sobre una arquitectura de tipo PaddleOCR según las etiquetas del repositorio, y expuesto a través de la pipeline `image-text-to-text`. Su propósito es convertir imágenes de documentos —incluida escritura manuscrita— en texto estructurado.

La relevancia de esta ficha radica en que ofrece una variante cuantizada a 4 bits pensada para inferencia local con llama.cpp y ecosistemas compatibles, lo que reduce los requisitos de memoria frente a los pesos originales. El repositorio se publicó el 27 de noviembre de 2026 y, en el momento de la consulta, no registra descargas ni interacciones, por lo que se trata de un artefacto reciente y sin validación comunitaria amplia.

La información disponible es limitada: no se detallan el número de parámetros, la longitud de contexto ni los resultados de benchmarks. Los datos que se ofrecen a continuación proceden exclusivamente de las etiquetas y metadatos del repositorio de Hugging Face, y cualquier campo no confirmado se marca explícitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PaddleOCR (según etiquetas del repositorio); no se detalla la topología interna |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | vi, en, zh (según etiquetas) |
| Licencia | apache-2.0 (según etiqueta del repositorio; el campo de licencia de la ficha figura como no disponible) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base, VietAlphaLabs/SenOCR-Vi, se etiqueta como PaddleOCR, lo que sitúa el sistema en la familia de pipelines de reconocimiento y parsing de documentos de PaddleOCR, orientados a la detección y transcripción de texto en imágenes. La variante aquí descrita es una conversión a GGUF con cuantización Q4_K_M, generada mediante `gguf-my-repo`, un procedimiento habitual para habilitar la ejecución con llama.cpp y herramientas compatibles. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

El repositorio referencia el dataset `5CD-AI/Viet-Handwriting-OCR-v2`, lo que sugiere un ajuste orientado a escritura manuscrita en vietnamita. Asimismo, las etiquetas indican compatibilidad con `transformers` y `llama-cpp`, y la pipeline declarada es `image-text-to-text`, coherente con una tarea de conversión de imagen a texto. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos.
- Parsing de documentos: extracción de texto estructurado a partir de imágenes.
- Conversión de imagen a texto (`image-text-to-text`).
- Soporte declarado de vietnamita (vi), inglés (en) y chino (zh).
- Orientación específica a escritura manuscrita vietnamita, según el dataset de referencia.
- Ejecución mediante llama.cpp y formatos GGUF compatibles.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso ni modo de pensamiento (thinking mode).
- No se documentan capacidades de audio ni de visión general más allá del OCR de documentos.

## Casos de uso

- Digitalización de documentos administrativos en vietnamita: el modelo puede transcribir imágenes de formularios y expedientes a texto editable, aprovechando su orientación al parsing documental.
- Procesamiento de manuscritos vietnamitas: dado el ajuste sobre `Viet-Handwriting-OCR-v2`, resulta adecuado para convertir notas y documentos manuscritos en texto digital.
- Extracción de texto en pipelines de gestión documental: integrable en flujos que reciben imágenes escaneadas y necesitan salida textual para indexación o búsqueda.
- Despliegue local en entornos con recursos limitados: la cuantización Q4_K_M reduce los requisitos de memoria y permite ejecución con llama.cpp en hardware modesto.
- Procesamiento multilingüe básico de documentos en vietnamita, inglés y chino: útil en organizaciones que manejan documentación en estos tres idiomas.
- Automatización de archivo y clasificación: la transcripción previa permite alimentar sistemas de clasificación o resumen de documentos escaneados.
- Prototipado e investigación en OCR: al ser un artefacto abierto con licencia Apache 2.0 según etiqueta, sirve para experimentación y evaluación comparativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible, al desconocerse el número de parámetros del modelo.
- GPU recomendadas: no disponible; la cuantización Q4_K_M está pensada para reducir memoria, pero sin datos de tamaño no puede concretarse.
- Compatibilidad con GPU de consumo: no confirmable sin conocer el tamaño del modelo; el formato GGUF Q4_K_M sugiere que podría ejecutarse en GPUs de consumo si el modelo base es de tamaño moderado.
- Opciones de despliegue: llama.cpp (formato GGUF nativo) y ecosistemas compatibles con GGUF; la etiqueta `transformers` indica también soporte potencial en ese framework, aunque el formato de pesos es GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Información técnica incompleta: se desconocen parámetros, contexto y detalles de entrenamiento, lo que dificulta evaluar su idoneidad en producción.
- Sin validación comunitaria: el repositorio registra cero descargas y cero interacciones en el momento de la consulta.
- Riesgo de alucinación: como modelo generativo de imagen a texto, puede producir transcripciones incorrectas, especialmente en documentos de baja calidad o manuscritos complejos.
- Cobertura idiomática limitada a vi, en y zh según etiquetas; no se garantiza un rendimiento adecuado en castellano.
- Sesgos desconocidos: no se documentan sesgos específicos, pero la dependencia de un dataset concreto de escritura vietnamita puede introducir sesgos hacia ese dominio.
- Licencia: la etiqueta indica apache-2.0, pero el campo de licencia de la ficha figura como no disponible; conviene verificar los términos antes de un uso comercial.
- Cuantización a 4 bits: la conversión Q4_K_M puede degradar la precisión respecto a los pesos originales, algo relevante en tareas de OCR donde la exactitud de caracteres es crítica.
- Fecha de publicación reciente y autor individual: sin mantenimiento ni soporte documentado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dungd/SenOCR-Vi-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/VietAlphaLabs/SenOCR-Vi
- Dataset de referencia: https://huggingface.co/datasets/5CD-AI/Viet-Handwriting-OCR-v2
