# RappleML/Raisin-4B

## Resumen

Raisin-4B es un modelo de lenguaje denso de aproximadamente 3,8 mil millones de parametros, desarrollado y fusionado por Rapple ML, una organizacion sin animo de lucro centrada en el desarrollo de modelos hacia la AGI. Esta construido sobre la base de microsoft/Phi-3.5-mini-instruct y ajustado mediante supervisión fina (SFT) con un subconjunto razonado del dataset open-r1/OpenR1-Math-220k, seguido de una fusion de parametros mediante DARE-TIES con mergekit. Su proposito principal es el razonamiento multi-paso, la planificacion logica y el procesamiento de documentos largos.

La caracteristica mas destacada es su ventana de contexto ampliada a 131.072 tokens mediante escalado YaRN (factor 4.0) sobre la atencion RoPE de Phi-3.5, lo que le permite manejar documentos extensos manteniendo un uso de memoria contenido. El modelo genera trazas explicitas de Chain-of-Thought (CoT) con un formato ` thinking ...  response` antes de entregar la respuesta final, lo que facilita la inspeccion del razonamiento intermedio. Se distribuye bajo licencia MIT y soporta ingles, espanol, frances y aleman.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (Phi3ForCausalLM) |
| Parametros totales | 3.821.079.552 (~3,8 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens (128k) |
| Tipos de cuantizacion | bfloat16 / float16 (no se especifican cuantizaciones adicionales) |
| Idiomas soportados | Ingles, espanol, frances, aleman |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Raisin-4B es un transformer denso decoder-only basado en la arquitectura de Phi-3.5-mini-instruct. El proceso de entrenamiento se desarrollo en dos fases: primero, un ajuste fino supervisado (SFT) con el stack de Unsloth y TRL (SFTTrainer) sobre una seleccion curada de ejemplos de razonamiento del dataset OpenR1-Math-220k, que contiene problemas matematicos y cadenas de razonamiento; segundo, una fusion de parametros con el modelo base original mediante DARE-TIES (densidad 0,6, peso 0,5) usando mergekit, con el objetivo de eliminar cambios de parametros redundantes y preservar las capacidades generales del modelo base.

La extension de contexto se logra aplicando un escalado YaRN (Yet another RoPE eXtension) con factor 4.0 sobre la posicion Su-RoPE, elevando la ventana original de Phi-3.5 (4.096 tokens) hasta 131.072 tokens. Esta configuracion permite que el modelo mantenga la adherencia a instrucciones y el bajo consumo de memoria mientras procesa documentos de gran extension. El modelo genera trazas de razonamiento explicito entre las etiquetas ` thinking` y ` response`, activables mediante el prompt estandar de Phi-3.

## Capacidades

- Razonamiento multi-paso y planificacion logica con trazas de CoT explicitas e inspeccionables.
- Resolucion de problemas matematicos, gracias al ajuste con el dataset OpenR1-Math-220k.
- Procesamiento de documentos largos con ventana de contexto de 131.072 tokens.
- Adhesion a instrucciones heredada de Phi-3.5-mini-instruct.
- Soporte multilingue en ingles, espanol, frances y aleman.
- No se documenta soporte para tool calling, function calling ni capacidades de agentes.
- No se documentan capacidades de vision ni audio (modelo exclusivamente textual).

## Casos de uso

- **Analisis de documentos legales o tecnicos extensos**: la ventana de 128k tokens permite procesar contratos, informes o expedientes completos en una sola pasada, generando un resumen razonado con trazabilidad del razonamiento.
- **Resolucion de problemas matematicos y cientificos**: su ajuste sobre OpenR1-Math-220k y el formato de CoT explicito lo hacen adecuado para sistemas de tutoria o evaluacion automatica de ejercicios de nivel universitario.
- **Asistentes de razonamiento en educacion**: puede desplegarse como backend de un chatbot que explique paso a paso la resolucion de problemas, mostrando al alumno la cadena de deduccion antes de la respuesta final.
- **Preprocesamiento de datos para pipelines de IA**: su capacidad de razonamiento estructurado puede utilizarse para extraer conclusiones logicas de datos no estructurados antes de alimentar otros sistemas.
- **Procesamiento de conversaciones de atencion al cliente con contexto largo**: la ventana de 128k permite mantener historiales de conversacion muy extensos sin perder informacion relevante, generando respuestas razonadas.
- **Investigacion en interpretabilidad de modelos**: al generar trazas de CoT explicitas, es util para estudiar como los modelos pequenos estructuran el razonamiento interno, sin necesidad de infraestructura de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: los pesos en bfloat16 ocupan aproximadamente 7,6 GB, a los que hay que sumar la caché de atencion y los estados intermedios. Con una ventana de 128k tokens, la caché KV puede consumir varios GB adicionales dependiendo de la longitud real del contexto.
- **GPU recomendadas**: una RTX 4090 (24 GB) o RTX 3090 (24 GB) son suficientes para inferencia con contexto largo. Una RTX 4080 (16 GB) o RTX 4070 Ti (12 GB) pueden funcionar con contextos moderados o con cuantizacion.
- **GPU de consumo**: si cabe en GPUs de consumo de gama alta y media-alta. Con cuantizacion a 4 bits, los pesos se reducen a unos 2 GB, lo que permitiria ejecutarlo en GPUs de 8 GB.
- **Opciones de despliegue**: compatible con HuggingFace Transformers (via `AutoModelForCausalLM`), y puede desplegarse con vLLM, llama.cpp (si se generan pesos GGUF), Ollama o TGI.
- **Latencia y throughput**: no se han publicado datos especificos. Como referencia, un modelo de 3,8 B en bf16 en una RTX 4090 suele generar entre 40 y 80 tokens por segundo en configuraciones optimizadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Razonamiento CoT | Disponibilidad |
|---|---|---|---|---|---|
| Raisin-4B | ~3,8 B | 131.072 | MIT | Si, explicito | HuggingFace |
| microsoft/Phi-3.5-mini-instruct (base) | ~3,8 B | 4.096 | MIT | No (generico) | HuggingFace |
| Qwen2.5-3B | ~3 B | 131.072 | Apache 2.0 | No (generico) | HuggingFace |
| Llama-3.2-3B | ~3,2 B | 131.072 | Llama 3.2 | No (generico) | HuggingFace |

No se dispone de datos de benchmark comparativos entre estos modelos en la informacion disponible.

## Limitaciones y advertencias

- **Sesgos conocidos**: no se han publicado evaluaciones de sesgo; al estar entrenado sobre un dataset de matematicas y un base de Phi-3.5, puede heredar sesgos presentes en estos datos.
- **Riesgo de alucinacion**: como cualquier LLM de este tamano, puede generar respuestas incorrectas o inventar datos, especialmente fuera de dominios matematicos.
- **Limitaciones de idioma**: solo se garantizan ingles, espanol, frances y aleman; su rendimiento en otros idiomas es incierto.
- **Limitaciones de contexto**: aunque la ventana se ha extendido a 128k via YaRN, la calidad de la atencion en contextos muy largos no esta validada con benchmarks publicos.
- **Restricciones de licencia**: licencia MIT, permitiendo uso comercial sin restricciones, pero el modelo base Phi-3.5-mini-instruct tambien es MIT, por lo que no hay restricciones conocidas de licencia.
- **Caveats para produccion**: el modelo no documenta soporte para tool calling ni agentes, y no se ha publicado informacion sobre latencia, throughput o estabilidad en entornos de produccion. No hay benchmarks publicados que validen su rendimiento real.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/RappleML/Raisin-4B)
- [Repositorio espejo en GitHub](https://github.com/RappleML/Raisin-4B)
- [Pagina de modelos de Rapple ML en Hugging Face](https://huggingface.co/RappleML/models)
