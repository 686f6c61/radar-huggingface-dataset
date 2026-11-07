# multimodal-vision-ai/OvisOCR3-0.8B-WebGPU-ONNX

## Resumen

OvisOCR3 0.8B es un modelo multimodal de tipo imagen-a-texto orientado a tareas de OCR y parsing de documentos. El modelo original lo desarrolla ATH-MaaS y esta ficha cubre la conversion ONNX/WebGPU publicada por multimodal-vision-ai, pensada para ejecucion local en navegador mediante Transformers.js y ONNX Runtime Web. Con 0,8 mil millones de parametros, unifica en un unico modelo parsing de documentos, OCR general, extraccion de informacion clave (KIE), subtitulado de figuras y reconstruccion de tablas entre paginas.

La relevancia de esta variante concreta esta en el formato: es un bundle ONNX FP16 con datos externos, preparado para ejecutarse en WebGPU con soporte de shaders de media precision. Esto permite desplegar OCR estructurado sin backend, lo que resulta util para aplicaciones que procesan documentos sensibles en el propio dispositivo del usuario. La salida mantiene el formato JSON estructurado original con campos bbox, category y content.

La licencia es Apache-2.0 y el repositorio pesa aproximadamente 2,5 GB. Se trata de una conversion de formato de inferencia, no de un fine-tune nuevo: tokenizer, chat template, configuracion de generacion y prompt estructurado oficial se incluyen sin cambios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base etiquetado qwen3_5) |
| Parametros totales | 0,8 mil millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (export ONNX con datos externos) |
| Idiomas soportados | no disponible (el modelo hermano DocTags indica chino e ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX external-data bundle (Transformers.js / ONNX Runtime Web) |

## Arquitectura y entrenamiento

No se dispone de detalles arquitectonicos en la informacion proporcionada. El modelo base OvisOCR3 se describe en su informe tecnico como un modelo de 0,8B entrenado mediante continued pretraining sobre datos reales y sinteticos, seguido de un mid-training con balance de dominios para equilibrar la supervision entre las distintas tareas (parsing de documentos, OCR general, KIE, subtitulado de figuras y reconstruccion de tablas entre paginas). El tag qwen3_5 sugiere que la columna vertebral deriva de la familia Qwen 3.5, pero no se confirma en la informacion disponible.

Esta variante concreta es una conversion de formato: se exporta el checkpoint original (revision 17f255e2c8ae6d18d5d5edb0a474bd4ed39aef90, SHA-256 aa2311c6b22b07cf3afe9aac6e8bcb02a2b19dd8671b2a91d0b144071577e600) a ONNX FP16 con datos externos, dirigido a WebGPU con shader-f16. Se incluyen sin cambios el tokenizer, el chat template, la configuracion de generacion y el prompt estructurado oficial. Los resultados de paridad por componente estan en validation/component_validation.json.

## Capacidades

- OCR general sobre imagenes de documentos.
- Parsing de documentos con salida JSON estructurada (bbox, category, content).
- Extraccion de informacion clave (KIE) de documentos.
- Subtitulado de figuras incluidas en documentos.
- Reconstruccion de tablas que abarcan varias paginas.
- Inferencia local en navegador mediante WebGPU, sin servicio de API.
- Soporte de conversacion multi-turno (pipeline image-text-to-text, tag conversational).
- Capacidades multilingues: no confirmadas en esta ficha; el modelo hermano DocTags declara chino e ingles.

## Casos de uso

- Procesamiento de documentos en el navegador: el bundle ONNX permite ejecutar OCR y parsing directamente en el cliente con WebGPU, evitando enviar imagenes de documentos a un servidor y reduciendo el riesgo de exposicion de datos sensibles.
- Digitalizacion de facturas y albaranes: la salida JSON con bbox y content facilita mapear campos a un esquema de extraccion y alimentar un ERP o una hoja de calculo sin postprocesado pesado.
- Extraccion de informacion clave en formularios: el modelo puede localizar y devolver los campos relevantes de documentos administrativos, util para flujos de validacion automatizada en aplicaciones web.
- Reconstruccion de tablas entre paginas: adecuado para informes financieros o catalogos donde una tabla se parte en varias hojas y se necesita una representacion unificada.
- Subtitulado de figuras en articulos y manuales: permite generar descripciones de graficos e imagenes dentro de documentos tecnicos para accesibilidad o indexacion.
- Herramientas de productividad offline: al ejecutarse en el navegador, puede integrarse en extensiones o aplicaciones de escritorio web que funcionan sin conexion a un backend de inferencia.
- Prototipado rapido de pipelines OCR: Transformers.js y ONNX Runtime Web permiten validar la calidad de extraccion antes de invertir en un despliegue servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el bundle pesa aproximadamente 2,5 GB en FP16; en WebGPU la memoria utilizada depende del navegador y del backend, pero el modelo esta pensado para ejecucion en cliente, no en GPU de servidor.
- GPU recomendadas: cualquier GPU con soporte WebGPU y shader-f16; no se especifican modelos concretos en la informacion disponible.
- Compatibilidad con GPU de consumo: si, el objetivo declarado es la inferencia local en navegador; el rendimiento dependera de la GPU del usuario.
- Opciones de despliegue: Transformers.js y ONNX Runtime Web con WebGPU. No esta pensado para vLLM, llama.cpp, Ollama o TGI en su forma actual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| OvisOCR3 0.8B WebGPU ONNX (esta ficha) | 0,8B | no disponible | ONNX FP16 | Apache-2.0 | Ejecucion en navegador via WebGPU |
| R3-OvisOCR3-DocTags-0.8B-ONNX | 0,8B | no disponible | ONNX | Apache-2.0 | Variante orientada a DocTags, chino e ingles, tambien WebGPU |
| ATH-MaaS/OvisOCR3 | 0,8B | no disponible | no disponible | no disponible | Modelo base original |

## Limitaciones y advertencias

- Es una conversion de formato, no un fine-tune: cualquier limitacion del modelo base OvisOCR3 se hereda sin cambios.
- El bundle esta pensado exclusivamente para inferencia local en navegador; no ofrece servicio de API ni inferencia en servidor.
- La ejecucion depende de la disponibilidad de WebGPU y shader-f16 en el navegador y la GPU del usuario; en entornos sin soporte el modelo no funcionara.
- Los idiomas soportados no se detallan en la informacion de esta ficha; el modelo hermano DocTags declara chino e ingles, por lo que la cobertura de otros idiomas no esta garantizada.
- Riesgo de alucinacion en campos extraidos: la salida JSON estructurada debe validarse contra el esquema esperado antes de usarse en produccion.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar el fichero LICENSE del repositorio y las condiciones del modelo base.
- El repositorio tiene pocas descargas y likes, y fue creado recientemente; no hay evidencia de uso en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/multimodal-vision-ai/OvisOCR3-0.8B-WebGPU-ONNX
- Modelo base: https://huggingface.co/ATH-MaaS/OvisOCR3
- Variante DocTags relacionada: https://huggingface.co/multimodal-vision-ai/R3-OvisOCR3-DocTags-0.8B-ONNX
- Informe tecnico OvisOCR3: https://www.emergentmind.com/papers/2610.33066
