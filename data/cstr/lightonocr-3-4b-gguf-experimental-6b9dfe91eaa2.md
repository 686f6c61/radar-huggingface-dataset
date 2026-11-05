# cstr/LightOnOCR-3-4B-GGUF-experimental-6b9dfe91eaa2

## Resumen

LightOnOCR-3-4B-GGUF-experimental es una conversión a formato GGUF del modelo LightOnOCR-3-4B, desarrollado originalmente por LightOn (lightonai) y convertido por el usuario cstr. Se trata de un modelo especializado en reconocimiento óptico de caracteres (OCR) con 4.539.265.536 parámetros totales, publicado bajo licencia Apache 2.0. El repositorio contiene únicamente pesos cuantizados en formato GGUF, con un tamaño total de 19,6 GB.

La relevancia de esta publicación es limitada y de carácter experimental: la propia model card advierte de que se trata de candidatos en formato-5 que no están soportados por el runtime nativo CrispEmbed, no han pasado inferencia nativa ni cualificación de calidad OCR, y no se proporciona alias de registro. Es, por tanto, un artefacto de conversión reproducible (con recibo de conversión y hashes documentados) más que un modelo listo para producción.

La información disponible sobre arquitectura interna, datos de entrenamiento, idiomas soportados y rendimiento es muy escasa: la model card se limita a documentar la procedencia de la conversión y los comandos de cuantización empleados (`q8_0` y `q4_k` con `--tensor-type v.*=f32`). Cualquier dato no documentado se indica explícitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base orientado a OCR; arquitectura interna no documentada en la informacion proporcionada) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | `q8_0` y `q4_k` (con `--tensor-type v.*=f32`); candidatos en formato-5 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base LightOnOCR-3-4B en la documentación proporcionada: no se especifica si es un transformer denso, un modelo multimodal con encoder visual o una arquitectura híbrida. El nombre y la categoría del modelo sugieren un sistema de OCR, pero los detalles técnicos no están documentados en la model card de esta conversión.

Respecto al proceso de conversión, la model card sí aporta trazabilidad concreta: la revisión de origen es `b71010f095dc3735de7ee6b9969bff8f8f50b39a`, el commit de origen es `94ad7bda378ac285f03fda28dcb97d29cb496418` y el cuantizador portable tiene SHA-256 `a09dd36ebc5a28d757a2950624c4b517363f3353b1dddf22dbf6519a65f9ae0f`. Se documenta un censo por tensor completo y hashes de salida en el recibo de conversión. No se aportan datos sobre tokens de entrenamiento, composición del dataset ni técnicas de alineación (RLHF/DPO).

## Capacidades

- Reconocimiento óptico de caracteres (OCR): capacidad inferida del nombre y propósito del modelo base; no verificada en esta conversión.
- Conversación: el repositorio incluye la etiqueta `conversational`, lo que sugiere soporte de formato de chat, aunque no se detalla su funcionamiento.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta `endpoints_compatible`.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible; el modelo base es presumiblemente multimodal (entrada de imagen), pero no se documenta en esta conversión.
- Advertencia: la model card indica explícitamente que estos candidatos no han pasado inferencia nativa ni cualificación de calidad OCR, por lo que las capacidades reales no están validadas.

## Casos de uso

- Digitalización de documentos escaneados: uso previsto del modelo base para extraer texto de imágenes; sin embargo, al no haber pasado cualificación de calidad OCR, no es recomendable en producción sin validación previa.
- Evaluación de pipelines de cuantización: el artefacto sirve para comparar el comportamiento de `q8_0` frente a `q4_k` en tareas de OCR dentro de entornos de investigación.
- Reproducibilidad de conversiones: el recibo de conversión y los hashes documentados permiten auditar el proceso de conversión a GGUF en estudios de formatos.
- Experimentación con runtimes GGUF: útil para probar la carga de candidatos en formato-5 en motores alternativos a CrispEmbed, dado que el runtime nativo no los soporta.
- Investigación en OCR de bajo nivel de recursos: permite explorar el equilibrio entre tamaño (19,6 GB en el repo) y precisión en extracción de texto.
- Archivado y trazabilidad de artefactos: el repositorio documenta procedencia completa (revisión, commit, SHA-256 del cuantizador), útil para auditorías de cadena de suministro de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los candidatos no han pasado cualificación de calidad OCR ni inferencia nativa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el número de parámetros (4.539 millones), una cuantización de 8 bits requeriría del orden de 4,5-5 GB solo para pesos, y una de 4 bits del orden de 2,5-3 GB, más overhead de contexto y del posible encoder visual (no confirmado).
- GPU recomendadas: no disponible. Por tamaño, cabría esperar funcionamiento en GPUs consumer con 8-16 GB de VRAM, pero no está verificado.
- ¿Cabe en GPU consumer? Probablemente sí según el recuento de parámetros, pero no hay validación oficial.
- Opciones de despliegue: llama.cpp y derivados (Ollama, etc.) son los candidatos naturales para GGUF; sin embargo, la model card advierte que el runtime nativo CrispEmbed no soporta estos candidatos en formato-5.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LightOnOCR-3-4B-GGUF-experimental (este) | 4.539 M | no disponible | Apache 2.0 | GGUF (q8_0, q4_k) | Conversion experimental sin cualificacion OCR |
| LightOnOCR-3-4B (original, lightonai) | 4.539 M (presumiblemente) | no disponible | no disponible en esta ficha | safetensors (presumiblemente) | Modelo base de referencia |
| Alternativas OCR de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de información suficiente para establecer comparaciones cuantitativas con otros modelos OCR.

## Limitaciones y advertencias

- Estado experimental: la model card declara que los candidatos en formato-5 no están soportados por el runtime nativo CrispEmbed.
- Sin cualificación de calidad: no han pasado inferencia nativa ni evaluación de calidad OCR; los resultados pueden degradarse respecto al modelo original.
- Sin alias de registro: no se proporciona alias, lo que complica su integración en pipelines automatizados.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no evaluado en esta conversión; en tareas OCR, el riesgo típico es la generación de texto plausible no presente en la imagen.
- Limitaciones de contexto e idioma: no disponible.
- Licencia: Apache 2.0 permite uso comercial, pero la falta de validación técnica desaconseja su uso en producción sin pruebas propias.
- Trazabilidad: se documentan revisión, commit y hashes, lo que facilita la auditoría, pero no sustituye a una evaluación funcional.

## Enlaces

- HuggingFace (esta conversión): https://huggingface.co/cstr/LightOnOCR-3-4B-GGUF-experimental-6b9dfe91eaa2
- Modelo base: https://huggingface.co/lightonai/LightOnOCR-3-4B
- Revisión de origen: `b71010f095dc3735de7ee6b9969bff8f8f50b39a`
- Commit de origen: `94ad7bda378ac285f03fda28dcb97d29cb496418`
- SHA-256 del cuantizador portable: `a09dd36ebc5a28d757a2950624c4b517363f3353b1dddf22dbf6519a65f9ae0f`
