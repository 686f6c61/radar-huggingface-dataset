# hoanghai2110/zi-2

## Resumen

zi-2 es un fork publicado por el usuario hoanghai2110 en Hugging Face que reproduce, sin modificar los pesos, el modelo `unsloth/gemma-3-1b-it-GGUF`, una cuantizacion en formato GGUF del modelo instructivo `google/gemma-3-1b-it` de Google DeepMind. El modelo original pertenece a la familia Gemma 3, presentada en 2025 como una gama de modelos ligeros, multimodales (texto e imagen de entrada, texto de salida) y con ventana de contexto ampliada respecto a generaciones anteriores. La variante de 1B es la mas pequena de la familia y esta pensada para despliegue en entornos con recursos limitados.

El repositorio declara 999.885.952 parametros en los pesos safetensors y un tamano total de 20,8 GB, coherente con un fork que agrupa multiples niveles de cuantizacion GGUF ademas de los pesos originales. La model card indica explicitamente que los pesos no han sido alterados y que solo se han anadido metadatos legales (terminos de Gemma y aviso de distribucion), por lo que las capacidades reales del modelo son las del Gemma 3 1B instructivo oficial.

Su relevancia practica radica en que ofrece una via sencilla de descargar el modelo en formato GGUF listo para llama.cpp, Ollama o herramientas compatibles, con la licencia Gemma y una ventana de contexto de 32K tokens en esta talla. No obstante, al tratarse de un fork de un tercero con cero descargas y cero likes en el momento de la consulta, conviene tratarlo como una copia de conveniencia y no como una publicacion independiente validada por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3, `gemma3_text`) |
| Parametros totales | 999.885.952 (aprox. 1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32K tokens de entrada para la talla 1B; salida de 8192 tokens |
| Tipos de cuantizacion | GGUF en multiples niveles (el repo incluye el conjunto de `unsloth/gemma-3-1b-it-GGUF`); niveles concretos no detallados en la informacion disponible |
| Idiomas soportados | La familia Gemma 3 declara mas de 140 idiomas; la model card de este fork declara `en` |
| Licencia | Gemma Terms of Use (licencia `gemma`) |
| Formato de pesos | safetensors y GGUF |
| Modelo base | google/gemma-3-1b-it |
| Libreria | transformers |
| Tamano del repositorio | 20,8 GB |
| Entrada multimodal | Imagenes normalizadas a 896 x 896, codificadas en 256 tokens cada una (segun la model card de Gemma 3; aplicabilidad a la talla 1B no confirmada en la informacion disponible) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de la familia Gemma 3, disenado por Google DeepMind a partir de la misma investigacion y tecnologia empleadas en los modelos Gemini. La familia se publica en variantes preentrenada e instruction-tuned, con pesos abiertos, y la version 1B es la de menor tamano. La model card de Gemma 3 describe una ventana de contexto de 128K tokens para las tallas 4B, 12B y 27B, y de 32K tokens para la talla 1B, con una salida maxima de 8192 tokens. La entrada admite texto e imagenes normalizadas a 896 x 896 y codificadas en 256 tokens por imagen.

En cuanto a datos de entrenamiento, la informacion disponible solo detalla el volumen de tokens de las tallas mayores: 14 billones para el modelo de 27B, 12 billones para el de 12B y 4 billones para el de 4B. El dato correspondiente a la talla 1B no aparece en el fragmento de model card proporcionado, por lo que se considera no disponible. Tampoco se detalla en la informacion disponible la composicion exacta del dataset, la presencia de RLHF o DPO, ni innovaciones tecnicas especificas de esta variante. El fork zi-2 no introduce cambios en los pesos ni en el entrenamiento: su unica aportacion es la redistribucion en GGUF con metadatos legales anadidos.

## Capacidades

- Generacion de texto conversacional en modo instructivo, heredado de `google/gemma-3-1b-it`.
- Respuesta a preguntas, resumen de documentos y tareas de razonamiento segun la descripcion oficial de la familia Gemma 3.
- Comprension de imagenes en las tallas que incorporan vision, con entrada normalizada a 896 x 896 y 256 tokens por imagen; la aplicabilidad concreta a la talla 1B no se confirma en la informacion disponible.
- Soporte multilingue declarado por la familia Gemma 3 (mas de 140 idiomas), aunque la model card de este fork solo lista `en`.
- Capacidad de ejecucion local en CPU y GPU mediante formatos GGUF.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en portatil: al ser un modelo de aproximadamente 1B de parametros en GGUF, puede ejecutarse en CPU o en GPU de gama de entrada mediante llama.cpp u Ollama, ofreciendo respuestas conversacionales sin depender de la nube.
- Prototipado rapido de aplicaciones de chat: la integracion con `transformers` y el formato GGUF permiten montar un endpoint de generacion de texto en minutos para validar flujos de producto antes de escalar a modelos mayores.
- Clasificacion y etiquetado de texto a gran escala: su bajo coste de inferencia lo hace adecuado para procesar lotes de documentos con tareas de extraccion o categorizacion simples, siempre con supervision humana.
- Resumen de documentos de hasta 32K tokens: la ventana de contexto de la talla 1B permite condensar articulos, actas o hilos de correo en un unico paso sin truncar el contenido.
- Filtrado y preprocesado en pipelines de datos: puede actuar como primer filtro para descartar contenido irrelevante o reformatear texto antes de pasarlo a un modelo mayor, reduciendo el coste total del pipeline.
- Educacion y demos offline: al caber en equipos modestos y no requerir conexion, sirve para talleres, demostraciones y entornos con requisitos de privacidad donde los datos no pueden salir de la maquina.
- Base para fine-tuning ligero: al estar disponible en safetensors y GGUF, puede adaptarse con tecnicas como LoRA a dominios concretos y reexportarse a GGUF para despliegue local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del fork no incluye tablas de MMLU, HumanEval, GSM8K ni metricas comparativas, y el fragmento disponible de la model card de Gemma 3 no aporta cifras numericas de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial en la informacion proporcionada. Como referencia orientativa de orden de magnitud, un modelo de aproximadamente 1B de parametros en cuantizacion de 4 bits ocupa del orden de 0,6-0,8 GB de pesos, y en 8 bits alrededor de 1 GB; a ello hay que sumar la memoria del contexto y del runtime.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, el modelo es apto para GPU de consumo como RTX 3060, RTX 4060 o superiores, asi como para aceleradores de datacenter (A100, H100) si se busca throughput alto.
- Cabe en GPU de consumo: si, previsiblemente en la mayoria de GPU con 4 GB o mas de VRAM en cuantizaciones bajas; no se dispone de una tabla oficial de requisitos por cuantizacion.
- Opciones de despliegue: llama.cpp, Ollama, y exportacion a GGUF segun la guia de Unsloth; integracion con `transformers` para los pesos safetensors. vLLM y TGI no se mencionan en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| zi-2 (este fork) | ~1B | 32K (talla 1B) | Gemma Terms of Use | safetensors, GGUF | Fork sin cambios en pesos de `unsloth/gemma-3-1b-it-GGUF` |
| google/gemma-3-1b-it | ~1B | 32K | Gemma Terms of Use | safetensors | Modelo original de Google DeepMind; referencia canonica |
| unsloth/gemma-3-1b-it-GGUF | ~1B | 32K | Gemma Terms of Use | GGUF | Origen directo de este fork; cuantizaciones mantenidas por Unsloth |
| Otros modelos de ~1B de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos de rendimiento en la informacion proporcionada |

## Limitaciones y advertencias

- Es un fork de terceros con cero descargas y cero likes en el momento de la consulta; no hay evidencia de validacion por parte de la comunidad ni de mantenimiento continuado.
- La model card declara unicamente el idioma `en`, aunque la familia Gemma 3 anuncie soporte para mas de 140 idiomas; el rendimiento real en castellano no esta documentado en la informacion disponible.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano, especialmente en tareas de razonamiento complejo, matematicas o codigo.
- La ventana de contexto de la talla 1B es de 32K tokens, inferior a los 128K de las tallas mayores de la familia; conviene no asumir paridad de contexto con Gemma 3 4B, 12B o 27B.
- La licencia Gemma Terms of Use impone obligaciones especificas para uso comercial y redistribucion; es necesario revisar los terminos en ai.google.dev/gemma/terms antes de desplegar en produccion.
- El repositorio incluye los terminos legales y el aviso de distribucion requeridos, pero el autor del fork no ofrece garantias adicionales sobre los pesos.
- El tamano del repositorio (20,8 GB) sugiere la presencia de multiples cuantizaciones; conviene verificar el nivel concreto antes de descargar para evitar consumos de disco y ancho de banda innecesarios.
- No se dispone de informacion sobre sesgos especificos, evaluaciones de seguridad ni resultados de red teaming para esta variante.

## Enlaces

- Repositorio del fork: https://huggingface.co/hoanghai2110/zi-2
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Origen de los GGUF: https://huggingface.co/unsloth/gemma-3-1b-it-GGUF
- Coleccion de Gemma 3 en Unsloth: https://huggingface.co/collections/unsloth/gemma-3-67d12b7e8816ec6efa7e4e5b
- Guia de Unsloth para ejecutar Gemma 3: https://docs.unsloth.ai/basics/tutorial-how-to-run-gemma-3-effectively
- Blog de Unsloth sobre Gemma 3: https://unsloth.ai/blog/gemma3
- Repositorio de Unsloth: https://github.com/unslothai/unsloth/
- Discord de Unsloth: https://discord.gg/unsloth
- Documentacion de Unsloth: https://docs.unsloth.ai/
- Pagina oficial de Gemma: https://ai.google.dev/gemma/docs/core
- Informe tecnico de Gemma 3: https://goo.gle/Gemma3Report
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Responsible Generative AI Toolkit: https://ai.google.dev/responsible
- Gemma en Kaggle: https://www.kaggle.com/models/google/gemma
- Gemma en Vertex Model Garden: https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/gemma3
