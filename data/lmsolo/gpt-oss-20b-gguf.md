# lmsolo/gpt-oss-20b-GGUF

## Resumen

gpt-oss-20b es un modelo de lenguaje de pesos abiertos desarrollado por OpenAI, disenado para razonamiento, tareas agenticas y casos de uso generales de desarrollo. Se trata de un transformer con arquitectura Mixture-of-Experts (MoE) de 20.900 millones de parametros totales, de los cuales solo 3.600 millones estan activos por token, lo que permite una latencia reducida y su ejecucion en hardware de consumo. Forma parte de la serie gpt-oss junto al modelo mayor gpt-oss-120b.

El repositorio `lmsolo/gpt-oss-20b-GGUF` es una redistribucion no oficial en formato GGUF del modelo original de OpenAI, publicada bajo licencia Apache 2.0. El modelo emplea el formato de respuesta "harmony" de OpenAI, que es obligatorio para su correcto funcionamiento, y fue post-entrenado con cuantizacion MXFP4 de los pesos MoE, lo que permite ejecutarlo dentro de 16 GB de memoria.

Su relevancia actual radica en que ofrece capacidades de razonamiento configurable (low, medium, high), cadena de pensamiento completa accesible, soporte nativo de function calling y ejecucion de codigo Python, todo bajo una licencia permisiva que permite uso comercial sin restricciones de copyleft. La cuantizacion GGUF anade la posibilidad de desplegarlo en llama.cpp y Ollama sobre hardware asequible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Experts (MoE) |
| Parametros totales | 20.914.757.184 (~20,9 B) |
| Parametros activos | 3.600 millones (~3,6 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (pesos MoE post-entrenados); GGUF en este repositorio |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio); safetensors en el original |

## Arquitectura y entrenamiento

gpt-oss-20b es un transformer con capas Mixture-of-Experts. De sus aproximadamente 20,9 mil millones de parametros totales, solo 3,6 mil millones se activan por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamano. Los pesos MoE fueron post-entrenados con cuantizacion MXFP4, una decision que permite que el modelo completo se ejecute dentro de 16 GB de memoria y que todas las evaluaciones publicadas se realicen con esa misma cuantizacion.

El modelo fue entrenado sobre el formato de respuesta "harmony" de OpenAI, que estructura los turnos de conversacion, el razonamiento y las llamadas a herramientas. Es imperativo usar dicho formato: el modelo no funciona correctamente sin el. Incluye un modo de razonamiento configurable (low, medium, high) y expone la cadena de pensamiento completa, orientada a depuracion y confianza en las salidas, no a su presentacion al usuario final. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF/DPO) empleadas.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento con esfuerzo configurable (low, medium, high) y cadena de pensamiento completa accesible.
- Function calling / tool calling nativo.
- Navegacion web (web browsing) mediante herramientas.
- Ejecucion de codigo Python.
- Salidas estructuradas (Structured Outputs).
- Capacidades agenticas y razonamiento multi-paso.
- Ajuste fino (fine-tuning) de parametros para casos de uso especificos.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con soporte de tool calling para consultar sistemas internos (pedidos, cuentas), con razonamiento en modo low para minimizar latencia en produccion.
- Agentes autonomos de investigacion: combinando navegacion web y ejecucion de Python, el modelo puede recopilar informacion, procesarla y generar informes estructurados en un bucle multi-paso.
- Generacion y ejecucion de codigo en pipelines: su soporte nativo de Python y salidas estructuradas permite integrarlo en flujos de CI/CD para generar, validar y ejecutar fragmentos de codigo.
- Asistentes de desarrollo local: al caber en 16 GB de memoria y estar disponible en GGUF, puede desplegarse en estaciones de trabajo con GPU de consumo mediante Ollama o llama.cpp para autocompletado y refactorizacion.
- Extraccion de datos estructurados: uso de Structured Outputs para convertir texto libre en JSON validado en procesos ETL o de enriquecimiento de datos.
- Razonamiento con trazabilidad: en entornos donde se requiere auditar el proceso de decision, la cadena de pensamiento completa permite depurar y verificar las respuestas del modelo.
- Despliegue en entornos con recursos limitados: su naturaleza MoE con 3,6 B parametros activos y la cuantizacion MXFP4 lo hacen adecuado para inferencia de baja latencia en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB con cuantizacion MXFP4 (dato indicado por el autor del modelo original); las cuantizaciones GGUF de este repositorio pueden reducir o ajustar ese requisito segun el nivel de cuantizacion.
- GPU recomendadas: el modelo original esta pensado para ejecutarse en una unica GPU de 80 GB en el caso de gpt-oss-120b; para gpt-oss-20b basta con hardware que disponga de ~16 GB de memoria.
- GPU de consumo: si, el modelo cabe en GPUs de consumo con 16 GB o mas de VRAM (por ejemplo, RTX 4080/4090 o superiores), y potencialmente en configuraciones menores con cuantizaciones GGUF mas agresivas.
- Opciones de despliegue: Transformers, vLLM (build especifico `vllm==0.10.1+gptoss`), PyTorch/Triton (implementaciones de referencia), Ollama (`ollama pull gpt-oss:20b`), LM Studio y llama.cpp mediante los ficheros GGUF de este repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpt-oss-20b | ~20,9 B | ~3,6 B | no disponible | Apache 2.0 | Pesos abiertos (HF, GGUF) |
| gpt-oss-120b | 117 B | 5,1 B | no disponible | Apache 2.0 | Pesos abiertos (HF) |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion directa documentada en la informacion disponible es con gpt-oss-120b, el modelo mayor de la misma familia, orientado a produccion y razonamiento de alta exigencia y disenado para una unica GPU de 80 GB. No se dispone de datos de rendimiento comparativo con otros modelos de la categoria.

## Limitaciones y advertencias

- El modelo solo funciona correctamente con el formato de respuesta "harmony"; su uso fuera de dicho formato produce resultados incorrectos.
- La cadena de pensamiento completa no esta pensada para mostrarse al usuario final.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se dispone de tasas medidas en la informacion proporcionada.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento uniforme fuera del ingles.
- Longitud de contexto: no disponible, lo que impide planificar cargas de trabajo con ventanas largas sin verificacion previa.
- Este repositorio concreto (`lmsolo/gpt-oss-20b-GGUF`) es una redistribucion no oficial; para produccion conviene validar la integridad de los pesos frente al repositorio original de OpenAI.
- La licencia Apache 2.0 permite uso comercial sin copyleft, pero se recomienda revisar los terminos de la licencia del modelo original y las condiciones de uso de OpenAI para la serie gpt-oss.

## Enlaces

- Repositorio Hugging Face de esta redistribucion: https://huggingface.co/lmsolo/gpt-oss-20b-GGUF
- Modelo original en Hugging Face: https://huggingface.co/openai/gpt-oss-20b
- Modelo mayor de la familia: https://huggingface.co/openai/gpt-oss-120b
- Coleccion gpt-oss en Hugging Face: https://huggingface.co/collections/openai/gpt-oss-68911959590a1634ba11c7a4
- Model card / paper: https://arxiv.org/abs/2508.10925
- Blog de OpenAI: https://openai.com/index/introducing-gpt-oss/
- Pagina oficial del modelo: https://gpt-oss.com
- Guias (cookbook): https://cookbook.openai.com/topic/gpt-oss
- Repositorio GitHub: https://github.com/openai/gpt-oss
- Formato harmony: https://github.com/openai/harmony
- Lista de recursos de la comunidad: https://github.com/openai/gpt-oss/blob/main/awesome-gpt-oss.md
