# ManoharHugs/gpt-oss-20b

## Resumen

gpt-oss-20b es un modelo de lenguaje de pesos abiertos desarrollado por OpenAI, presentado como la variante compacta de la familia gpt-oss junto al modelo mayor gpt-oss-120b. Se trata de un transformer con arquitectura Mixture-of-Experts (MoE) de 21.000 millones de parámetros totales y 3.600 millones de parámetros activos por token, disenado para escenarios de baja latencia, despliegue local y casos de uso especializados. La ficha que nos ocupa corresponde a una reproduccion alojada por el usuario ManoharHugs en Hugging Face, no al repositorio oficial de OpenAI.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones de copyleft, y ha sido entrenado con el formato de respuesta harmony de OpenAI, que es obligatorio para su correcto funcionamiento. Incorpora cuantizacion MXFP4 en los pesos del MoE, lo que permite ejecutarlo en aproximadamente 16 GB de memoria, un umbral alcanzable por GPUs de consumo alto y estaciones de trabajo con una sola tarjeta.

La relevancia de este modelo radica en que combina razonamiento configurable (bajo, medio, alto), acceso completo a la cadena de pensamiento, capacidades agénticas nativas (function calling, navegacion web, ejecucion de codigo Python y salidas estructuradas) y fine-tuning posible, todo bajo una licencia permisiva. Es una opcion atractiva para desarrolladores que necesitan un modelo de razonamiento desplegable en hardware modesto sin renunciar a las capacidades de un modelo de mayor escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Experts (MoE) |
| Parametros totales | 21B |
| Parametros activos | 3.6B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (pesos del MoE cuantizados tras el entrenamiento); otras cuantizaciones no disponibles en la informacion |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo con libreria transformers) |

## Arquitectura y entrenamiento

gpt-oss-20b emplea una arquitectura transformer con capas Mixture-of-Experts, en la que solo se activan 3.600 millones de parámetros de los 21.000 millones totales por token procesado. Esta configuracion reduce el coste computacional de inferencia manteniendo una capacidad de representacion cercana a la de un modelo denso de mayor tamano. Los pesos del MoE fueron cuantizados en MXFP4 durante la fase de post-entrenamiento, y todas las evaluaciones publicadas por OpenAI se realizaron con esa misma cuantizacion, lo que garantiza coherencia entre el rendimiento reportado y el comportamiento del modelo distribuido.

El modelo fue entrenado con el formato de respuesta harmony, un protocolo de estructura de conversacion que define roles, canales y delimitadores para el razonamiento y las llamadas a herramientas. Segun la model card, el modelo solo debe usarse con este formato, ya que de lo contrario no funciona correctamente. No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni la presencia de fases de RLHF o DPO. La model card menciona que el modelo es fine-tunable y que expone la cadena de pensamiento completa, lo que facilita la depuracion y la confianza en las salidas.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-paso con esfuerzo de razonamiento configurable (bajo, medio, alto).
- Acceso completo a la cadena de pensamiento (chain-of-thought), pensado para depuracion y no para mostrarse al usuario final.
- Function calling y tool calling nativos.
- Navegacion web integrada mediante herramientas.
- Ejecucion de codigo Python como capacidad agéntica.
- Salidas estructuradas (Structured Outputs).
- Capacidades agénticas para tareas multi-paso y automatizacion.
- Fine-tuning de parametros para adaptacion a dominios especificos.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con razonamiento configurable en nivel bajo para respuestas rapidas y en nivel alto para casos complejos, manteniendo el formato harmony para separar el razonamiento interno de la respuesta al usuario.
- Generacion de codigo en produccion: gracias al tool calling nativo y a la ejecucion de Python, puede integrarse en pipelines de CI/CD para generar, validar y ejecutar fragmentos de codigo, asi como para tareas de refactorizacion asistida.
- Agentes autonomos de investigacion: la combinacion de navegacion web, function calling y razonamiento multi-paso permite construir agentes que consultan fuentes externas, sintetizan informacion y devuelven resultados estructurados.
- Despliegue local en estaciones de trabajo: al caber en aproximadamente 16 GB de memoria con cuantizacion MXFP4, es viable en GPUs de consumo alto para prototipado, pruebas de concepto y entornos de desarrollo sin conexion.
- Extraccion de datos estructurados: las salidas estructuradas permiten convertir texto libre en JSON u otros formatos definidos por esquema, util para procesamiento de documentos, formularios y registros.
- Asistente de razonamiento para analisis tecnico: el acceso a la cadena de pensamiento completa facilita auditar como llega el modelo a una conclusion, lo que resulta util en entornos de investigacion y validacion de hipotesis.
- Fine-tuning para dominios verticales: al ser fine-tunable y tener licencia Apache 2.0, puede adaptarse a vocabularios y tareas especificas de sectores como legal, sanitario o financiero sin riesgo de copyleft.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB con cuantizacion MXFP4, segun la model card.
- GPU recomendadas: el modelo mayor de la familia (gpt-oss-120b) se disena para una unica GPU de 80 GB como NVIDIA H100 o AMD MI300X; para gpt-oss-20b la model card no especifica GPUs concretas, pero el umbral de 16 GB lo situa en el rango de GPUs de consumo alto y estaciones de trabajo.
- Cabe en GPU de consumo: si, siempre que dispongan de al menos 16 GB de memoria; no se detallan modelos concretos en la informacion.
- Opciones de despliegue: Transformers (pipeline y `transformers serve`), vLLM (version 0.10.1+gptoss con wheels especificos), Ollama (`ollama pull gpt-oss:20b`), LM Studio (`lms get openai/gpt-oss-20b`), PyTorch/Triton con implementaciones de referencia del repositorio gpt-oss.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpt-oss-20b | 21B | 3.6B | no disponible | Apache 2.0 | Hugging Face (repo oficial y reproducciones) |
| gpt-oss-120b | 117B | 5.1B | no disponible | Apache 2.0 | Hugging Face (repo oficial) |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion directa disponible en la informacion es con gpt-oss-120b, el modelo mayor de la misma familia. No se dispone de datos de rendimiento comparado con modelos de terceros de tamano similar.

## Limitaciones y advertencias

- El modelo solo funciona correctamente con el formato harmony; usarlo con otros formatos de chat produce resultados incorrectos.
- La cadena de pensamiento completa no esta pensada para mostrarse al usuario final; exponerla puede revelar razonamiento interno y aumentar el riesgo de confusion.
- No se dispone de informacion sobre sesgos conocidos, idiomas soportados ni evaluaciones de seguridad en la informacion proporcionada.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado datos especificos de tasas de alucinacion para este modelo.
- Longitud de contexto no disponible, lo que impide evaluar su idoneidad para tareas de contexto largo.
- La ficha corresponde a una reproduccion alojada por un tercero (ManoharHugs) con 0 descargas y 0 likes; para uso en produccion se recomienda verificar contra el repositorio oficial de OpenAI.
- El repositorio tiene un tamano de 0.0 GB segun los metadatos, lo que sugiere que los pesos pueden no estar efectivamente alojados o que los metadatos no reflejan el contenido real.
- La licencia Apache 2.0 permite uso comercial sin restricciones de copyleft, pero conviene revisar los terminos del modelo original de OpenAI para confirmar condiciones adicionales.

## Enlaces

- Repositorio en Hugging Face (reproduccion): https://huggingface.co/ManoharHugs/gpt-oss-20b
- Repositorio oficial del modelo: https://huggingface.co/openai/gpt-oss-20b
- Coleccion gpt-oss en Hugging Face: https://huggingface.co/collections/openai/gpt-oss-68911959590a1634ba11c7a4
- Model card (paper): https://arxiv.org/abs/2508.10925
- Blog de OpenAI: https://openai.com/index/introducing-gpt-oss/
- Pagina del producto: https://gpt-oss.com
- Guias (cookbook): https://cookbook.openai.com/topic/gpt-oss
- Repositorio harmony: https://github.com/openai/harmony
- Repositorio gpt-oss: https://github.com/openai/gpt-oss
- Lista de recursos: https://github.com/openai/gpt-oss/blob/main/awesome-gpt-oss.md
- Guia de Transformers: https://cookbook.openai.com/articles/gpt-oss/run-transformers
- Guia de vLLM: https://cookbook.openai.com/articles/gpt-oss/run-vllm
- Guia de Ollama: https://cookbook.openai.com/articles/gpt-oss/run-locally-ollama
