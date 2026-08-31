# Dingdust/granite-4.2-8b-heretic

## Resumen

**Dingdust/granite-4.2-8b-heretic** es una version "decensurada" (abliterada) del modelo **Granite-4.2-8B** de IBM, generada con la herramienta **Heretic v1.4.0** del proyecto heretic-project.org. La abliteracion consiste en eliminar o atenuar las direcciones del espacio de activaciones responsables de los rechazos, reduciendo las negativas del modelo ante peticiones que el modelo original bloquearia. Segun los datos de la model card, los rechazos caen de 96/100 en el modelo original a 3/100 en esta version, con una divergencia KL de 0,1275 respecto al original.

El modelo base es **Granite-4.2-8B**, un transformer denso decoder-only de 8.791.592.960 parametros (~8,8B) desarrollado por el Granite Team de IBM, post-entrenado sobre **Granite-4.1-8B-Base**. Soporta de forma nativa 128K tokens de contexto, ampliables a 512K, e incorpora razonamiento chain-of-thought integrado con modos de pensamiento flexibles (completo, sin pensamiento y esfuerzo bajo). La licencia es Apache 2.0, lo que permite uso comercial y academico sin restricciones.

La relevancia de este modelo reside en que combina las capacidades de razonamiento y tool calling de Granite 4.2 con un comportamiento mucho menos restrictivo, util para investigacion sobre alineacion, testing de sistemas de moderacion o aplicaciones que requieran respuestas sin filtros. Sin embargo, esta misma caracteristica implica riesgos importantes de generacion de contenido inapropiado o danino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only Dense Transformer (GraniteForCausalLM) |
| Parametros totales | 8.791.592.960 (~8,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K nativo, extension a 512K |
| Tipos de cuantizacion | No disponible (pesos en bfloat16; cuantizaciones derivadas no publicadas) |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh (12 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de **Granite-4.2-8B**: un transformer denso decoder-only con **Grouped Query Attention (GQA)** de 32 cabezas de atencion y 8 cabezas KV, **Rotary Position Embedding (RoPE)** con theta = 10.000.000, **MLP con activacion SwiGLU** (hidden size 12.800), **RMSNorm** (epsilon = 1e-5) y embeddings de entrada y salida separados (no compartidos). La precision de los pesos es bfloat16. El modelo tiene 40 capas y un embedding size de 4096.

El entrenamiento original de Granite-4.2-8B consistio en post-entrenamiento sobre el base model Granite-4.1-8B-Base, con un pipeline que incluye supervised finetuning y reinforcement learning alignment. La version heretic anade un paso de **abliteration** mediante Heretic v1.4.0, que identifica y atenua direcciones especificas en las proyecciones de atencion (attn.o_proj) y del MLP (mlp.down_proj) responsables de los comportamientos de rechazo. Los parametros de abliteracion incluyen un direction_index de 26,77 y pesos maximos/minimos en las capas intervenidas (attn.o_proj.max_weight 1,42 en posicion 24,21; mlp.down_proj.max_weight 1,49 en posicion 30,73).

## Capacidades

- **Razonamiento chain-of-thought integrado**: genera un bloque ` thinking... response` antes de la respuesta final, mejorando el rendimiento en matematicas, logica multi-paso y codigo.
- **Modos de pensamiento flexibles**: permite alternar entre pensamiento completo (por defecto), sin pensamiento y modo de esfuerzo bajo, ajustando latencia y profundidad por consulta.
- **Tool calling aumentado por razonamiento**: el modelo razona sobre que herramientas invocar y por que, produciendo llamadas a funciones mas precisas en flujos agente.
- **Generacion de codigo**: capacidades heredadas de Granite 4.2 para generacion, explicacion y depuracion de codigo en multiples lenguajes.
- **Multilingue**: soporta 12 idiomas probados (ingles, aleman, espanol, frances, japones, portugues, arabe, checo, italiano, coreano, neerlandes y chino), con posible funcionamiento en otros no verificados.
- **Contexto largo**: ventana de 128K nativa ampliable a 512K, apta para documentos extensos y conversaciones multi-turno.
- **Comportamiento sin censura**: reduccion drastica de rechazos (3/100 frente a 96/100), lo que permite respuestas a peticiones que el modelo original bloquearia.

## Casos de uso

- **Investigacion sobre alineacion y seguridad de IA**: el modelo permite estudiar como se comporta un LLM sin las barreras de rechazo, comparando respuestas con el original para analizar el impacto de la abliteracion en la calidad y seguridad de las salidas.
- **Testing de sistemas de moderacion de contenido**: al generar contenido que los modelos censurados rechazarian, sirve como herramienta de red teaming para evaluar y mejorar clasificadores de contenido y filtros de seguridad.
- **Agentes autonomos en entornos controlados**: en sandboxes de investigacion, el modelo puede ejecutar flujos agente con tool calling sin interrupciones por rechazo, permitiendo estudiar comportamientos de planificacion multi-paso en escenarios limites.
- **Generacion de contenido creativo sin restricciones**: escritura de ficcion, guiones o dialogos con tematicas adultas o controvertidas que otros modelos bloquean, util en estudios de creatividad computacional.
- **Analisis de documentos extensos multilingue**: aprovechando la ventana de 128K-512K, puede procesar contratos, informes tecnicos o corpus academicos completos en 12 idiomas, generando resumenes y extracciones sin limitaciones tematicas.
- **Desarrollo de asistentes conversacionales especializados**: para dominios donde el modelo original rechaza peticiones legitimas (por ejemplo, educacion sexual, asesoria legal en temas sensibles), esta version puede ofrecer respuestas continuas, aunque con riesgo de inexactitud.
- **Benchmarking de tecnicas de abliteracion**: como referencia para comparar metodologias de decensurado (Heretic, abliteration clasica, etc.) en terminos de divergencia KL, tasa de rechazo y preservacion de capacidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo incluye metricas de la abliteracion:

| Metrica | Este modelo | Modelo original (Granite-4.2-8B) |
|---|---|---|
| Divergencia KL | 0,1275 | 0 (por definicion) |
| Rechazos (refusals) | 3/100 | 96/100 |

La divergencia KL de 0,1275 indica una desviacion moderada respecto al modelo original, lo que sugiere que las capacidades generales se preservan en gran medida, pero no se dispone de datos cuantitativos sobre el impacto en tareas de razonamiento, codigo o matematicas.

## Requisitos de hardware

- **VRAM para inferencia en bfloat16**: ~17,6 GB (tamano del repo), requiere GPU con 24 GB o mas (RTX 4090, A100 40GB, H100).
- **VRAM con cuantizacion 8-bit**: ~8,8 GB, cabe en RTX 3090, RTX 4080 o RTX 4070 Ti.
- **VRAM con cuantizacion 4-bit**: ~4,4-5,5 GB, cabe en RTX 3060, RTX 4060 o GPUs de 6-8 GB.
- **GPU recomendadas**: A100 40GB o H100 para produccion con contexto largo; RTX 4090 para desarrollo y testing; GPUs consumer de 8-12 GB con cuantizacion para despliegue ligero.
- **Opciones de despliegue**: transformers (HuggingFace), vLLM, TGI (Text Generation Inference); conversion a GGUF para llama.cpp y Ollama posible pero no publicada por el autor.
- **Latencia y throughput**: no disponible; dependera del hardware, la cuantizacion y el modo de pensamiento (el modo completo con chain-of-thought incrementa significativamente el tiempo de generacion).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos | Licencia | Notas |
|---|---|---|---|---|---|
| **Dingdust/granite-4.2-8b-heretic** | 8,8B | 128K (512K ext.) | 3/100 | Apache 2.0 | Abliterado con Heretic v1.4.0, KL 0,1275 |
| **ibm-granite/granite-4.2-8b** (original) | 8,8B | 128K (512K ext.) | 96/100 | Apache 2.0 | Razonamiento nativo, tool calling, sin abliteracion |
| **heretic-org/IBM-granite-4.1-8b-heretic** | 8B | No disponible | No disponible | Apache 2.0 | Version abliterada de Granite-4.1-8B, generacion anterior |

La comparativa directa con otros modelos de 8B de la misma categoria (por ejemplo, Llama 3.1 8B o Qwen 2.5 7B) no esta disponible en la informacion proporcionada, ya que no se publican benchmarks estandar para esta version abliterada.

## Limitaciones y advertencias

- **Riesgo de contenido danino**: la abliteracion elimina barreras de seguridad, por lo que el modelo puede generar contenido ofensivo, ilegal, sexualmente explicito o peligroso sin restricciones. No es apto para despliegue en produccion sin capas adicionales de moderacion.
- **Sesgos amplificados**: al eliminar los rechazos, los sesgos presentes en los datos de entrenamiento pueden manifestarse sin filtro, incluyendo estereotipos, discriminacion o lenguaje toxico.
- **Riesgo de alucinacion**: no se dispone de datos sobre la tasa de alucinacion tras la abliteracion; la divergencia KL de 0,1275 sugiere que las respuestas pueden desviarse del modelo original en contenido y forma.
- **Sin benchmarks de calidad**: no hay resultados publicados de MMLU, HumanEval, GSM8K u otros, por lo que no se puede verificar si la abliteracion degrada el rendimiento en tareas de razonamiento o codigo.
- **Idiomas no probados**: aunque el modelo puede funcionar en otros idiomas, solo 12 han sido verificados por IBM; el rendimiento en idiomas adicionales no esta garantizado.
- **Modo de pensamiento**: el formato ` thinking... response` requiere que el consumidor del modelo gestione correctamente los tokens de pensamiento; si se usan en pipelines que no los procesan, la salida puede verse afectada.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial, pero el despliegue en entornos de produccion conlleva responsabilidad legal y etica por el contenido generado sin moderacion.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Dingdust/granite-4.2-8b-heretic)
- [Proyecto Heretic](https://heretic-project.org)
- [Coleccion Granite 4.2 Language Models](https://huggingface.co/collections/ibm-granite/granite-42-language-models)
- [Blog tecnico de Granite 4.2](https://huggingface.co/blog/ibm-granite/granite-4-2)
- [Repositorio GitHub de Granite 4.2](https://github.com/ibm-granite/granite-4.2-language-models)
- [Documentacion de IBM Granite 4.2](https://www.ibm.com/granite/docs/models/granite4-2)
- [Modelo base Granite-4.1-8B-Base](https://huggingface.co/ibm-granite/granite-4.1-8b-base)
- [Version abliterada de Granite-4.1-8B por heretic-org](https://huggingface.co/heretic-org/IBM-granite-4.1-8b-heretic)
