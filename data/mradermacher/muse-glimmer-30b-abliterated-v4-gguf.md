# mradermacher/Muse-Glimmer-30B-abliterated-v4-GGUF

## Resumen

Muse-Glimmer-30B-abliterated-v4-GGUF es una coleccion de cuantizaciones estaticas en formato GGUF del modelo Muse-Glimmer-30B-abliterated-v4, publicado por el usuario mradermacher en Hugging Face. El modelo base original lo desarrollo jsantillana y, por el nombre, se trata de una variante "abliterated" de un modelo de 30B de parametros, es decir, una version en la que se ha aplicado una tecnica de ablacion de direcciones de rechazo para reducir los comportamientos de negativa del modelo alineado original. Esta ficha se centra en el artefacto GGUF distribuido por mradermacher, que es el que se puede descargar y ejecutar localmente con llama.cpp y derivados.

El repositorio contiene unicamente pesos cuantizados en GGUF, generados a partir del modelo en precision completa del autor original. El numero de parametros reales declarado en el campo de safetensors es de 27.854.794.240 (aproximadamente 27,85 mil millones), aunque el nombre comercial del modelo lo redondea a 30B. El tamano total del repositorio es de 126,1 GB, coherente con un conjunto de cuantizaciones que van desde F16 hasta Q2_K.

La relevancia de este artefacto es practica: permite ejecutar un modelo de casi 28B de parametros en hardware de consumo mediante cuantizaciones de 4 y 5 bits, con la particularidad de que al ser una version "abliterated" esta orientada a casos de uso donde se desea minimizar los rechazos del modelo. No se dispone de informacion sobre la arquitectura interna, el contexto, los idiomas ni la licencia en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27.854.794.240 (aprox. 27,85B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base en la documentacion proporcionada. El nombre "Muse-Glimmer-30B" sugiere un transformer de aproximadamente 30B de parametros, y el recuento real de parametros (27,85B) es consistente con esa familia de tamanos, pero no se confirma el tipo de arquitectura (transformer denso, MoE, hibrida, etc.) ni detalles de atencion.

Tampoco se documentan los datos de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO. Lo unico que se puede afirmar con certeza es que se trata de una variante "abliterated": una modificacion post-entrenamiento que elimina o atenua las direcciones de activacion asociadas al rechazo, lo que reduce la tendencia del modelo a negarse a responder. La model card del repositorio GGUF no aporta mas detalle tecnico; unicamente indica que las cuantizaciones son estaticas y que se generaron a partir del modelo de jsantillana.

## Capacidades

- Generacion de texto conversacional: la etiqueta del repositorio incluye "conversational", lo que indica que el modelo esta orientado a dialogos multi-turno.
- Reduccion de rechazos: al ser una version abliterated, se espera que responda a peticiones que el modelo alineado original rechazaria, aunque el grado exacto de ablacion no esta documentado.
- Inferencia local: al distribuirse en GGUF, es compatible con llama.cpp, Ollama, LM Studio y otros runners que soportan este formato.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere que el artefacto puede servirse mediante infraestructura de inferencia compatible con la API de Hugging Face.
- Tool calling, agentes, vision, audio, thinking mode: no disponible; no se documenta ninguna de estas capacidades.
- Capacidades multilingues: no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo: con las cuantizaciones Q4_K_M o Q5_K_M, el modelo puede ejecutarse en una GPU de consumo con suficiente VRAM o incluso en CPU con llama.cpp, lo que permite tener un asistente conversacional de casi 28B de parametros sin depender de la nube.
- Experimentacion con modelos abliterated: investigadores interesados en estudiar el efecto de la ablacion sobre el comportamiento de rechazo pueden comparar esta variante con el modelo base alineado usando las mismas cuantizaciones.
- Generacion creativa sin filtros excesivos: para tareas de escritura de ficcion o roleplay donde los rechazos del modelo alineado resultan molestos, la variante abliterated ofrece mayor flexibilidad, siempre con las salvaguardas adecuadas en el producto final.
- Prototipado de chatbots conversacionales: la etiqueta "conversational" y el formato GGUF lo hacen adecuado para montar un prototipo de chat multi-turno con Ollama o llama.cpp antes de decidir si se necesita un modelo mayor.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye 12 variantes de cuantizacion, lo que permite medir el impacto de la compresion (de F16 a Q2_K) en la calidad de las respuestas sobre el mismo modelo base.
- Integracion en pipelines de inferencia compatibles con GGUF: mediante servidores como llama.cpp server o vLLM con soporte GGUF, se puede exponer el modelo como API interna para pruebas de integracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q4_K_M, un modelo de 27,85B de parametros ocupa aproximadamente 16-17 GB de pesos, mas overhead de contexto y KV cache; con Q5_K_M, en torno a 19-20 GB; con Q8_0, aproximadamente 29-30 GB; con F16, unos 55-56 GB.
- GPU recomendadas: para Q4_K_M o Q5_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente; para Q8_0 se recomienda A100 40 GB, A6000 48 GB o H100; para F16, A100 80 GB o H100 80 GB.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB, solo cuantizaciones Q3 o menores con contexto reducido) y GPUs AMD equivalentes con 24 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama.cpp server, y runners compatibles con GGUF. No se confirma soporte de vLLM o TGI para este artefacto concreto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos suficientes para establecer una comparativa rigurosa: se desconoce la arquitectura, el contexto y el rendimiento del modelo base, y no se han identificado en la informacion proporcionada modelos comparables de la misma familia o tamano con datos verificables.

| Modelo | Parametros | Contexto | Licencia | Formato | Datos de rendimiento |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-abliterated-v4-GGUF | 27,85B | no disponible | no disponible | GGUF | no disponible |
| Alternativa comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La naturaleza "abliterated" implica que el modelo ha sido modificado para reducir sus rechazos; esto puede aumentar la probabilidad de generar contenido inapropiado, danoso o inseguro, y requiere filtros y salvaguardas externas en cualquier despliegue en produccion.
- No se dispone de informacion sobre sesgos conocidos, datos de entrenamiento ni evaluaciones de seguridad del modelo base ni de la variante abliterated.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como en cualquier modelo de lenguaje, existe y debe mitigarse con verificacion y RAG cuando sea necesario.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Es imprescindible consultar la licencia del modelo base original (jsantillana/Muse-Glimmer-30B-abliterated-v4) antes de cualquier uso productivo.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas distintos del que se uso en el entrenamiento original.
- Longitud de contexto no disponible: no se puede planificar el uso en tareas de contexto largo sin verificacion empirica.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un artefacto reciente y sin validacion comunitaria.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso serio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Muse-Glimmer-30B-abliterated-v4-GGUF
- Modelo base original: https://huggingface.co/jsantillana/Muse-Glimmer-30B-abliterated-v4
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
