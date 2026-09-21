# lhanke28/gpt-oss-20b

## Resumen

La ficha describe el repositorio `lhanke28/gpt-oss-20b`, una redistribucion en Hugging Face del modelo abierto `gpt-oss-20b` desarrollado por OpenAI. Se trata de un modelo de generacion de texto de tipo mixture-of-experts (MoE) con 20.914.757.184 parametros totales (aproximadamente 20,9B) y 3,6B parametros activos por token, disenado para razonamiento, tareas agenticas y uso por parte de desarrolladores. El autor del repositorio no es OpenAI, sino un tercero (`lhanke28`) que replica los pesos publicados bajo licencia Apache 2.0.

El modelo se distribuye con pesos en formato safetensors (41,3 GB de repositorio) y una carpeta `original/` con los pesos cuantizados en MXFP4, la misma cuantizacion con la que, segun la model card, fue post-entrenado. Segun el autor original, el modelo cabe en 16 GB de memoria, lo que lo situa en el rango de GPU de consumo y de estaciones de trabajo locales.

Su relevancia actual radica en que combina licencia permisiva Apache 2.0, eslogan de razonamiento configurable (low/medium/high), acceso completo a la cadena de pensamiento y soporte nativo de function calling, navegacion web y ejecucion de codigo Python, todo con un coste de inferencia reducido gracias a su naturaleza MoE. No se dispone de informacion sobre idiomas soportados en la model card proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) sobre transformer, con pesos MoE cuantizados en MXFP4 |
| Parametros totales | 20.914.757.184 (aprox. 20,9B; la model card indica 21B) |
| Parametros activos | 3,6B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (4 bits, microscaling) en los pesos MoE; etiqueta "8-bit" en el Hub; no disponible detalle de otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 41,3 GB); carpeta `original/` con pesos MXFP4; GGUF disponible a traves de Ollama y LM Studio |
| Fecha de creacion en el Hub | 2026-09-20T22:29:20Z |

## Arquitectura y entrenamiento

El modelo es un transformer autoregresivo con capas de mezcla de expertos (MoE): dispone de 21B parametros en total pero solo activa 3,6B por token, lo que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamano. Los pesos de las capas MoE fueron cuantizados en MXFP4 (formato de 4 bits con escalado microscopico) durante el post-entrenamiento, y segun la model card todas las evaluaciones se realizaron con esa misma cuantizacion. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF o DPO empleadas.

La innovacion principal documentada es el uso del formato de respuesta harmony, sobre el que fueron entrenados los modelos de la familia gpt-oss y que es obligatorio para que el modelo funcione correctamente. Este formato estructura los mensajes segun roles (system, developer, user, assistant, tool) y permite separar la cadena de razonamiento del contenido final. Ademas, el modelo expone un parametro de esfuerzo de razonamiento configurable (low, medium, high) para ajustar el equilibrio entre latencia y calidad de respuesta.

## Capacidades

- Generacion de texto y razonamiento multi-paso con cadena de pensamiento completa y auditable.
- Razonamiento configurable: el usuario puede seleccionar el nivel de esfuerzo (low, medium, high).
- Function calling y tool calling nativo para integracion con sistemas externos.
- Navegacion web como herramienta integrada, segun la model card.
- Ejecucion de codigo Python como herramienta.
- Salidas estructuradas (structured outputs) para generar JSON y otros formatos validables.
- Capacidades agenticas para tareas de multiples pasos.
- Fine-tuning completo de parametros para adaptacion a dominios concretos.
- Capacidades multilingues: no disponible (no documentadas en la informacion proporcionada).

## Casos de uso

- Inferencia local en estaciones de trabajo: gracias a que cabe en 16 GB de memoria en su version MXFP4, puede ejecutarse en una unica GPU de consumo para asistentes personales, resumen de documentos o generacion de texto sin conexion a la nube.
- Despliegue de servidor compatible con la API de OpenAI: mediante vLLM (`vllm serve openai/gpt-oss-20b`) o `transformers serve`, permite sustituir llamadas a APIs propietarias en aplicaciones existentes sin reescribir el cliente.
- Agentes autonomos con herramientas: el soporte nativo de function calling, navegacion web y ejecucion de Python permite construir agentes que consultan APIs, extraen informacion de la web y ejecutan scripts de forma encadenada.
- Generacion de codigo y ayuda al desarrollo: integrable en asistentes de IDE o pipelines de CI/CD que necesiten explicar errores, proponer parches o generar tests, con el nivel de razonamiento ajustable para controlar coste y latencia.
- Extraccion de datos estructurados: las structured outputs permiten convertir texto libre (correos, contratos, informes) en JSON con un esquema fijo para alimentar bases de datos o pipelines ETL.
- Atencion al cliente automatizada: gestion de conversaciones multi-turno con function calling para consultar sistemas de ticketing o CRM, manteniendo la cadena de pensamiento separada del texto mostrado al usuario.
- Depuracion y evaluacion de razonamiento: el acceso completo a la cadena de pensamiento facilita auditar por que el modelo llega a una conclusion, util en entornos de investigacion y en validacion de respuestas.
- Fine-tuning para dominios verticales: al ser Apache 2.0 y permitir ajuste de parametros, se puede especializar en jerga legal, medica o tecnica sin restricciones de copyleft.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB con la cuantizacion MXFP4, segun indica la model card del autor original; el repositorio tambien contiene pesos en formato safetensors de 41,3 GB, que requieren del orden de 40 GB o mas en precision de 16 bits.
- GPU recomendadas: no disponibles de forma explicita para este modelo concreto; la model card del modelo hermano de 120B cita NVIDIA H100 y AMD MI300X como referencia para el modelo grande.
- Cabe en GPU de consumo: si, segun el requisito de 16 GB de memoria declarado, es compatible con tarjetas de consumo con al menos esa VRAM (por ejemplo, gamas de 16 GB o superiores); no se detallan modelos concretos en la informacion proporcionada.
- Opciones de despliegue: Transformers (pipeline y `transformers serve`), vLLM (version `0.10.1+gptoss` con indice de wheels especifico), implementaciones de referencia en PyTorch/Triton del repositorio `openai/gpt-oss`, Ollama (`ollama pull gpt-oss:20b`), LM Studio (`lms get openai/gpt-oss-20b`) y el paquete `gpt-oss` (`python -m gpt_oss.chat model/`).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Hardware de referencia |
|---|---|---|---|---|---|
| gpt-oss-20b (esta ficha) | 20,9B | 3,6B | no disponible | Apache 2.0 | Aprox. 16 GB en MXFP4 |
| gpt-oss-120b | 117B | 5,1B | no disponible | Apache 2.0 | Una GPU de 80 GB (H100, MI300X) |

Solo se dispone de datos comparativos frente al modelo hermano de la misma familia, `gpt-oss-120b`, segun la informacion proporcionada. No se dispone de informacion sobre otras alternativas comparables de tamano o tarea similar.

## Limitaciones y advertencias

- Riesgo de alucinacion: como cualquier modelo generativo, puede producir contenido incorrecto o inventado; la model card no documenta tasas de error concretas.
- Sesgos conocidos: no disponible; la model card proporcionada no incluye una seccion de sesgos ni evaluaciones de equidad.
- La cadena de pensamiento no esta pensada para mostrarse al usuario final, segun advierte explicitamente la model card.
- Uso obligatorio del formato harmony: el modelo no funcionara correctamente si se usa sin el.
- Idioma: no se documenta el soporte multilingue, por lo que el comportamiento en idiomas distintos del ingles no esta garantizado.
- Licencia: Apache 2.0, permisiva y sin restricciones de copyleft, lo que permite uso comercial; no obstante, conviene revisar los terminos de la model card original de OpenAI para conocer el detalle de las condiciones.
- Repositorio de terceros: este repositorio (`lhanke28/gpt-oss-20b`) es una redistribucion no oficial, con 0 descargas y 0 likes en el momento de la consulta, sin verificacion por parte de OpenAI; para uso en produccion es preferible descargar los pesos desde el repositorio oficial `openai/gpt-oss-20b`.
- La fecha de creacion registrada en el Hub (2026-09-20) resulta anomala y conviene verificarla antes de tomarla como referencia.

## Enlaces

- Repositorio analizado: https://huggingface.co/lhanke28/gpt-oss-20b
- Repositorio oficial del modelo: https://huggingface.co/openai/gpt-oss-20b
- Repositorio oficial del modelo grande: https://huggingface.co/openai/gpt-oss-120b
- Articulo (paper) asociado: https://arxiv.org/abs/2508.10925
- Repositorio de OpenAI gpt-oss: https://github.com/openai/gpt-oss
- Formato harmony: https://github.com/openai/harmony
- Cookbook de OpenAI para gpt-oss: https://cookbook.openai.com/topic/gpt-oss
- Blog de anuncio de OpenAI: https://openai.com/index/introducing-gpt-oss/
- Sitio de demostracion: https://gpt-oss.com
- Lista de recursos de la comunidad: https://github.com/openai/gpt-oss/blob/main/awesome-gpt-oss.md
- Coleccion en Hugging Face: https://huggingface.co/collections/openai/gpt-oss-68911959590a1634ba11c7a4
