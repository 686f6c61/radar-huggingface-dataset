# mamelles/Qwen3.5-2B-Wolof-Instruct-v1-ONNX

## Resumen

Qwen3.5-2B-Wolof-Instruct-v1-ONNX es la exportación a formato ONNX del modelo Tonic/Qwen3.5-2B-Wolof-Instruct-v1, un modelo de generación de texto de 2.000 millones de parámetros afinado para el idioma wolof a partir de la familia Qwen3.5. Lo publica el usuario mamelles bajo la etiqueta galsenai y está empaquetado específicamente para su uso con Transformers.js sobre WebGPU, con cuantización q4f16, lo que permite ejecutar inferencia en el navegador sin backend de servidor.

El modelo resuelve el problema de disponer de un asistente conversacional en wolof que pueda desplegarse en entornos web ligeros: al estar en ONNX y orientado a transformers.js, se puede integrar en aplicaciones JavaScript del lado del cliente. Su tamaño de repositorio (9,7 GB) sugiere que contiene varias variantes de cuantización o ficheros auxiliares, aunque la model card solo documenta explícitamente la variante q4f16.

La relevancia actual radica en la combinación de tres factores: un modelo base reciente de la serie Qwen3.5, un idioma de bajos recursos como el wolof y un formato de despliegue (ONNX + WebGPU) pensado para inferencia local en navegador. No obstante, la información publicada por el autor es mínima y no se han divulgado especificaciones detalladas, benchmarks ni condiciones de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, según tags del repo: qwen3_5_text); detalles no disponibles |
| Parametros totales | 2B (según el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4f16 (documentada para Transformers.js WebGPU); otras variantes no disponibles |
| Idiomas soportados | wolof (objetivo del fine-tuning); lista completa no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (exportación para transformers.js) |

## Arquitectura y entrenamiento

La información disponible indica que se trata de una exportación ONNX del modelo Tonic/Qwen3.5-2B-Wolof-Instruct-v1, que a su vez deriva de la familia Qwen3.5 (tag qwen3_5_text). No se han publicado detalles sobre la arquitectura interna (número de capas, dimensiones ocultas, tipo de atención), el volumen de tokens de entrenamiento, la composición del dataset de afinado en wolof ni si se aplicaron técnicas de RLHF, DPO o similares.

La innovación técnica documentada es el propio proceso de exportación: el modelo se empaqueta en ONNX con cuantización q4f16 para ejecutarse mediante Transformers.js con aceleración WebGPU en el navegador. No hay información sobre optimizaciones adicionales como decodificación especulativa, atención lineal o modos de razonamiento extendido.

## Capacidades

- Generación de texto conversacional en wolof, según el nombre y la orientación del modelo base (Instruct).
- Conversación multi-turno (tag conversational en el repo).
- Inferencia en navegador mediante Transformers.js y WebGPU, gracias al formato ONNX.
- Ejecución local sin servidor, lo que permite despliegues del lado del cliente.
- Tool calling / function calling: no disponible en la información publicada.
- Capacidades de agente o razonamiento multi-paso: no disponibles en la información publicada.
- Capacidades multilingües adicionales al wolof: no disponibles.
- Modo thinking, visión o audio: no disponibles en la información publicada.

## Casos de uso

- Asistente conversacional en wolof dentro de una aplicación web: el modelo puede cargarse con Transformers.js y ejecutarse en el navegador del usuario mediante WebGPU, sin necesidad de infraestructura de servidor ni de enviar datos a terceros.
- Traducción y asistencia lingüística wolof-castellano/francés: útil para herramientas educativas o de documentación de una lengua de bajos recursos, siempre que se valide la calidad de salida, dado que no hay benchmarks publicados.
- Chatbots de atención ciudadana en Senegal: al ejecutarse en cliente, permite desplegar asistentes en zonas con conectividad limitada una vez descargado el modelo.
- Prototipado rápido de aplicaciones NLP en JavaScript: la variante ONNX q4f16 facilita integrar generación de texto en frontends sin montar un backend de inferencia.
- Investigación sobre modelos de bajos recursos: sirve como punto de partida para evaluar el rendimiento de Qwen3.5 afinado en wolof y comparar con otras aproximaciones.
- Demos interactivas y entornos educativos: al no requerir GPU de servidor, se puede usar en talleres o notebooks web para mostrar inferencia local de LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con cuantización q4f16, un modelo de 2B parámetros ocupa aproximadamente 1-1,5 GB de pesos en memoria; el consumo real depende del runtime y del navegador. No hay cifras oficiales publicadas.
- GPU recomendadas: cualquier GPU con soporte WebGPU en navegador (por ejemplo, GPUs integradas recientes, Apple Silicon, GPUs discretas de gama media y alta). No se especifican modelos concretos en la documentación.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño de 2B y la cuantización a 4 bits, aunque no hay confirmación oficial.
- Opciones de despliegue: Transformers.js con WebGPU (documentado); otros runtimes ONNX (ONNX Runtime, etc.) no están documentados por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B-Wolof-Instruct-v1-ONNX (este) | 2B | no disponible | ONNX (q4f16) | no disponible | Exportación para navegador |
| Tonic/Qwen3.5-2B-Wolof-Instruct-v1 | 2B | no disponible | no disponible | no disponible | Modelo base original |
| Otros modelos Qwen3.5 de 2B | 2B | no disponible | safetensors/GGUF (según variante) | no disponible | Alternativas genéricas de la familia |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- La model card es extremadamente escueta: no documenta licencia, idiomas soportados, contexto ni datos de entrenamiento, lo que dificulta evaluar su idoneidad para producción.
- Riesgo de alucinación inherente a los modelos de 2B parámetros, especialmente en tareas de conocimiento factual.
- Al estar afinado para wolof, el rendimiento en otros idiomas puede ser limitado o degradado; no hay información al respecto.
- No se han publicado benchmarks, por lo que no se puede verificar la calidad de la generación en wolof ni compararla con alternativas.
- La licencia no está disponible: antes de un uso comercial es imprescindible contactar con el autor o consultar la licencia del modelo base.
- El repositorio ocupa 9,7 GB, lo que puede implicar tiempos de descarga elevados y un consumo de almacenamiento considerable en el cliente.
- La ejecución en navegador depende de la disponibilidad de WebGPU, que no está soportada en todos los navegadores ni dispositivos.
- No hay información sobre sesgos conocidos ni sobre el proceso de alineación del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mamelles/Qwen3.5-2B-Wolof-Instruct-v1-ONNX
- Modelo base: https://huggingface.co/Tonic/Qwen3.5-2B-Wolof-Instruct-v1
- Transformers.js (documentación): https://huggingface.co/docs/transformers.js
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo (los resultados obtenidos corresponden a páginas no relacionadas sobre el término "mamelles").
