# EYEDOL/adtc-health-sft-qwen2.5-1.5b-v3n

## Resumen

EYEDOL/adtc-health-sft-qwen2.5-1.5b-v3n es un modelo de lenguaje de 1,54 mil millones de parametros, resultado de un ajuste fino supervisado (SFT) sobre la base de Qwen2.5-1.5B, orientado aparentemente al ambito sanitario segun su nombre ("adtc-health"). El modelo fue publicado en Hugging Face por el usuario EYEDOL en agosto de 2026 y esta disponible en formato safetensors con la libreria transformers.

La relevancia de este modelo reside en su tamano reducido, que permite su despliegue en hardware de consumo, y en su especializacion aparente en el dominio de la salud. Sin embargo, la model card es una plantilla automatica sin informacion sustantiva: no se documentan datos de entrenamiento, licencia, idiomas ni benchmarks. Esto limita considerablemente su evaluacion objetiva y su uso en produccion sin una validacion previa por parte del desarrollador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (densa, basada en Qwen2.5-1.5B) |
| Parametros totales | 1.543.714.304 (~1,54B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5 soporta hasta 128K tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El nombre del modelo indica que se trata de un ajuste fino supervisado (SFT) de Qwen2.5-1.5B, un transformer decoder-only denso desarrollado por Alibaba. El modelo base fue preentrenado con hasta 18 billones de tokens y soporta una ventana de contexto de hasta 128K tokens. La arquitectura de Qwen2.5 incorpora attention con RoPE, RMSNorm y SwiGLU, caracteristicas estandar de la familia Qwen.

No se dispone de informacion sobre el dataset de ajuste fino, el numero de tokens de entrenamiento, las hiperparametros utilizadas ni si se aplicaron tecnicas adicionales como RLHF o DPO. El sufijo "v3n" sugiere que es la tercera version del modelo, pero no hay documentacion que lo confirme. El tag "arxiv:1910.09700" en Hugging Face hace referencia al articulo de Lacoste et al. sobre estimacion de emisiones de carbono, no a un paper del modelo.

## Capacidades

- Generacion de texto: el pipeline declarado es text-generation, por lo que el modelo genera texto autoregresivamente.
- Conversacion: el tag "conversational" sugiere que el modelo esta orientado a dialogos multi-turno, probablemente en el ambito sanitario.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.
- No se especifican los idiomas soportados, aunque el modelo base Qwen2.5 tiene soporte multilingue (incluido espanol, ingles, chino, frances, aleman, entre otros).

## Casos de uso

Dado que la model card no documenta casos de uso, las siguientes aplicaciones se infieren del nombre del modelo y de las capacidades del modelo base. Deben validarse empiricamente antes de su adopcion.

- Asistencia a profesionales sanitarios: el modelo podria emplearse como apoyo en la redaccion de resumenes clinicos o en la generacion de respuestas a consultas frecuentes de pacientes, aprovechando su especializacion aparente en el dominio de la salud.
- Clasificacion y triaje de sintomas: con un ajuste adicional o mediante prompt engineering, podria utilizarse para categorizar sintomas descritos por pacientes y sugerir niveles de urgencia, aunque esto requiere validacion clinica rigurosa.
- Educacion sanitaria para pacientes: generacion de explicaciones sobre condiciones medicas, medicamentos o procedimientos en lenguaje accesible, adaptadas al nivel de comprension del interlocutor.
- Chatbots de atencion al paciente: integracion en sistemas de mensajeria para responder preguntas frecuentes sobre citas, preparacion de pruebas o cuidados postoperatorios, gracias a su capacidad conversacional.
- Anonimizacion y normalizacion de historiales: el modelo podria ayudar a estructurar notas clinicas libres en formatos estandarizados, aunque esta tarea requiere evaluacion cuidadosa por su riesgo de alucinacion.
- Investigacion en NLP clinico: como punto de partida para experimentos academicos sobre procesamiento de lenguaje natural en el dominio medico, dado su tamano reducido que facilita la experimentacion local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones sobre MMLU, HumanEval, GSM8K ni metricas especificas del dominio sanitario. Tampoco se documentan comparaciones con otros modelos de tamano similar.

## Requisitos de hardware

- VRAM estimada: con 1,54B de parametros, el modelo en FP16 ocupa aproximadamente 3,1 GB (tamano del repositorio), por lo que cabria en GPUs con 4 GB o mas. Con cuantizacion de 4 bits, el uso de VRAM se reduciria a aproximadamente 1 GB.
- GPUs compatibles: cualquier GPU consumer moderna con al menos 4 GB de VRAM, como NVIDIA RTX 3060, RTX 4060, RTX 4090, o incluso Apple Silicon con suficiente memoria unificada.
- Opciones de despliegue: al estar en formato safetensors con la libreria transformers, puede servirse con vLLM, Text Generation Inference (TGI) o Hugging Face Inference Endpoints. Tambien es compatible con FriendliAI, que ofrece inferencia de baja latencia para este modelo. Para cuantizacion, podria convertirse a GGUF para usarse con llama.cpp u Ollama.
- Latencia y throughput: no se dispone de datos publicados. En una GPU consumer, un modelo de 1,5B suele generar entre 30 y 60 tokens por segundo en FP16, dependiendo del hardware y la implementacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| EYEDOL/adtc-health-sft-qwen2.5-1.5b-v3n | 1,54B | No disponible | No disponible | SFT de Qwen2.5-1.5B para salud, sin documentacion |
| Qwen2.5-1.5B-Instruct | 1,54B | 128K | Apache 2.0 | Modelo base instructivo, multilingue, con benchmarks publicados |
| Llama-3.2-1B-Instruct | 1,23B | 128K | Llama 3.2 Community License | Modelo pequeno de Meta, con licencia permisiva para uso comercial |

La comparacion directa es limitada porque no se conocen los datos de entrenamiento ni el rendimiento del modelo de EYEDOL. El modelo base Qwen2.5-1.5B-Instruct es la referencia natural para evaluar si el ajuste fino aporta valor en el dominio sanitario.

## Limitaciones y advertencias

- Model card vacia: no se documentan datos de entrenamiento, licencia, idiomas, sesgos ni limitaciones. Esto impide una evaluacion informada antes del despliegue.
- Licencia desconocida: al no especificarse la licencia, no se puede garantizar el uso comercial ni la redistribucion. Se recomienda contactar con el autor antes de cualquier uso en produccion.
- Riesgo de alucinacion: como todos los modelos de lenguaje, puede generar informacion medica incorrecta o inventada. En el ambito sanitario, esto supone un riesgo grave para la seguridad de los pacientes.
- Sin validacion clinica: no hay evidencia publicada de que el modelo haya sido evaluado por profesionales sanitarios ni de que cumpla normativas como la HIPAA o el RGPD en el tratamiento de datos de salud.
- Sesgos potenciales: al ser un ajuste de Qwen2.5, puede heredar sesgos del modelo base, y el dataset de ajuste (desconocido) podria introducir sesgos adicionales en el dominio sanitario.
- Fecha de creacion inusual: el modelo fue creado en agosto de 2026, lo que sugiere que es reciente y podria tener poco historial de uso o validacion por parte de la comunidad.
- Sin garantias de calidad: la ausencia de benchmarks y de documentacion tecnica hace imposible verificar la calidad del ajuste fino respecto al modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EYEDOL/adtc-health-sft-qwen2.5-1.5b-v3n
- Pagina del modelo en FriendliAI: https://friendli.ai/models/EYEDOL/adtc-health-sft-qwen2.5-1.5b
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de Qwen2.5 en GitHub: https://github.com/mx4ai/qwen2.5
- Articulo de Lacoste et al. sobre emisiones de carbono (referenciado en los tags): https://arxiv.org/abs/1910.09700
