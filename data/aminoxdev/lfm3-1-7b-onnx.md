# AMINOXDEV/LFM3-1.7B-ONNX

## Resumen

LFM3-1.7B-ONNX es una conversión al formato ONNX del modelo LiquidAI/LFM3-1.7B, publicada por el usuario AMINOXDEV. No se trata de un modelo nuevo ni de un fine-tuning, sino de una copia de los ficheros que emplea la demo WebGPU Chat alojada en llm.aminox.dev, tomados de la conversión original de onnx-community (revisión `ab9fec4c681a25bec3b48b0b97a62fc2660a2985`). El autor indica explícitamente que los ficheros no se han modificado.

El modelo subyacente, LFM3-1.7B, es un modelo de lenguaje de 1.700 millones de parámetros desarrollado por Liquid AI, pensado para generación de texto conversacional. La versión aquí descrita está cuantizada en q4f16 y empaquetada para su ejecución en el navegador mediante transformers.js y WebGPU, lo que la hace relevante para despliegues totalmente client-side sin backend de inferencia.

Por su tamaño (repo de 1,1 GB) y su formato, el interés práctico de esta ficha reside en el despliegue ligero en web y en edge, no en el rendimiento bruto del modelo base. La licencia aplicable es la LFM Open License v1.0 de Liquid AI, Inc., que impone condiciones específicas de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM3-1.7B; no se detalla en la informacion proporcionada) |
| Parametros totales | 1,7 mil millones (segun el nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4f16 (cuantizacion de 4 bits con activaciones en float16) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (Liquid AI, Inc.); etiquetada como `other` en Hugging Face |
| Formato de pesos | ONNX (para transformers.js / WebGPU) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, los datos de entrenamiento, el numero de tokens vistos ni las tecnicas de alineacion (RLHF, DPO u otras) del modelo base LFM3-1.7B en la documentacion proporcionada. La model card de esta publicacion se limita a describir el proceso de conversion: se trata de una copia sin cambios de la conversion ONNX de onnx-community, orientada a ejecucion en navegador con WebGPU.

La innovacion tecnica relevante en este artefacto no esta en el modelo, sino en su empaquetado: la cuantizacion q4f16 reduce el peso a aproximadamente 1,1 GB, lo que permite cargar el modelo en memoria de GPU del navegador y ejecutar inferencia local mediante transformers.js. No se documentan tecnicas como decodificacion especulativa, atencion lineal ni modos de razonamiento extendido.

## Capacidades

- Generacion de texto conversacional en formato chat (pipeline `text-generation`, tag `conversational`).
- Ejecucion local en navegador mediante transformers.js y WebGPU, sin necesidad de servidor de inferencia.
- Inferencia cuantizada en 4 bits con activaciones en float16 (q4f16), adecuada para entornos con memoria limitada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision, audio o thinking mode: no disponibles en la informacion proporcionada.

## Casos de uso

- Chat conversacional embebido en una web estatica: el modelo puede cargarse en el navegador del usuario mediante transformers.js y WebGPU, eliminando la necesidad de backend y reduciendo costes de infraestructura a cero por consulta.
- Demos y prototipos de producto: al ser un artefacto de 1,1 GB en ONNX, permite validar flujos de chat con IA en el cliente antes de invertir en una API alojada.
- Aplicaciones con requisitos de privacidad estrictos: la inferencia ocurre en el dispositivo del usuario, de modo que los datos de la conversacion no salen del navegador, lo que encaja en escenarios con datos sensibles.
- Asistentes offline o en redes restringidas: una vez cacheado el modelo, la aplicacion puede funcionar sin conexion a un servidor de inferencia, util en entornos con conectividad limitada.
- Educacion y experimentacion: sirve como ejemplo didactico de despliegue de modelos ONNX cuantizados en el navegador con WebGPU, replicando la configuracion de la demo de referencia.
- Herramientas internas de baja concurrencia: para tareas de generacion de texto ligero donde el coste de GPU en servidor no se justifica, el modelo puede ejecutarse en los equipos de los propios usuarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB de pesos en cuantizacion q4f16, mas overhead de activaciones y del runtime de WebGPU; no se dispone de cifras exactas de memoria pico.
- GPU recomendadas: cualquier GPU con soporte de WebGPU en el navegador (por ejemplo, GPUs integradas modernas o dedicadas de gama media y alta); no se especifican modelos concretos en la informacion proporcionada.
- Compatibilidad con GPU de consumo: el tamano del artefacto sugiere que cabe en GPUs de consumo, pero no se confirma con datos de pruebas publicados.
- Opciones de despliegue: transformers.js con ONNX Runtime Web y WebGPU; tambien puede ejecutarse con ONNX Runtime en otros entornos, aunque no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AMINOXDEV/LFM3-1.7B-ONNX | 1,7 B | no disponible | ONNX q4f16 | LFM Open License v1.0 | Hugging Face (0 descargas) |
| onnx-community/LFM3-1.7B-ONNX | 1,7 B | no disponible | ONNX | LFM Open License v1.0 | Hugging Face (origen de esta copia) |
| LiquidAI/LFM3-1.7B | 1,7 B | no disponible | safetensors (presumiblemente) | LFM Open License v1.0 | Hugging Face (modelo base) |

No se dispone de datos de rendimiento ni de contexto para establecer una comparacion cuantitativa con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- Esta publicacion es una copia sin modificaciones de otra conversion ONNX; no aporta mejoras tecnicas ni mantenimiento propio, y su autoria y soporte son limitados (0 descargas, 0 likes en el momento de la consulta).
- La licencia LFM Open License v1.0 impone condiciones especificas para uso comercial; es necesario revisar el fichero `LICENSE` antes de desplegar en produccion.
- No se documentan los idiomas soportados, lo que impide garantizar un rendimiento adecuado en castellano u otros idiomas distintos del ingles.
- No hay informacion sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad del modelo base.
- La cuantizacion q4f16 puede degradar la calidad de generacion respecto al modelo en precision completa; no se han publicado comparativas al respecto.
- El despliegue depende de WebGPU y de la memoria disponible en el dispositivo del usuario; en equipos modestos o navegadores sin soporte, la inferencia puede fallar o ser lenta.
- No se dispone de datos de contexto maximo, lo que limita el diseno de aplicaciones con conversaciones largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AMINOXDEV/LFM3-1.7B-ONNX
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Conversion ONNX de origen: https://huggingface.co/onnx-community/LFM3-1.7B-ONNX/tree/ab9fec4c681a25bec3b48b0b97a62fc2660a2985
- Demo WebGPU Chat: https://llm.aminox.dev
