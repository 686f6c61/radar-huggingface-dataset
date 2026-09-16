# jpetrina/Swift-Qwen3.8-27B-IQ4_XS-pure-GGUF

## Resumen

Swift-Qwen3.8-27B-IQ4_XS-pure-GGUF es una cuantizacion GGUF en formato IQ4_XS del modelo ukisai/Swift-Qwen3.8-27B, un ajuste fino de Qwen3.8-27B orientado a eficiencia de razonamiento. El repositorio lo publica el usuario jpetrina y su objetivo declarado es ofrecer el modelo en un tamano que quepa en GPUs con 16 GB de VRAM, partiendo de los pesos F16 y aplicando una imatrix generada por bartowski. El resultado es un unico fichero de aproximadamente 14,5 GB que contiene los 27.320.697.856 parametros del modelo original.

El modelo subyacente, desarrollado por UkisAI, se presenta como un derivado de Qwen3.8-27B que reduce el numero de tokens de "thinking" en un 58,3 % (mediana) manteniendo una perdida de rendimiento inferior al 1 %, lo que se traduce en una aceleracion de hasta 1,95x en varias tareas. Es, por tanto, un modelo de razonamiento con modo de pensamiento explicito, disenado para escenarios donde la latencia y el coste de generacion importan tanto como la precision.

La relevancia de esta publicacion concreta es practica: permite ejecutar un modelo de ~27B con capacidades de razonamiento en hardware de consumo o GPUs de gama profesional con 16 GB, algo que los pesos BF16 o F16 originales no permiten. El repo tiene 0 descargas y 1 like en el momento de la consulta, por lo que se trata de una publicacion reciente y con adopcion practicamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; derivada de Qwen3.8-27B (el proceso de cuantizacion excluye pesos `.*nextn.*`, lo que sugiere capas de prediccion multi-token) |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_XS (esta publicacion). Otras cuantizaciones disponibles en el repo base ukisai/Swift-Qwen3.8-27B-GGUF y en bartowski/ukisai_Swift-Qwen3.8-27b-GGUF |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (campo `license: other`), enlace a NOTICE: https://huggingface.co/ukisai/Swift-Qwen3.8-27b/blob/main/NOTICE |
| Formato de pesos | GGUF (fichero unico) |
| Tamano del repositorio | 14,5 GB |
| Modelo base | ukisai/Swift-Qwen3.8-27B-GGUF (relacion: quantized) |
| Metodo de cuantizacion | `buun-llama-quantize --exclude-weights ".*nextn.*" --pure` con imatrix de bartowski |
| Libreria | gguf (llama.cpp) |
| Fecha de creacion | 2026-09-16 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la informacion proporcionada. El modelo base es Qwen3.8-27B, y el ajuste Swift de UkisAI se distribuye como adaptador sobre la version BF16 de dicho modelo: la model card indica explicitamente que los resultados de evaluacion comparan "Qwen3.8-27B BF16 base con la misma base mas el adaptador Swift". Esto implica que el entrenamiento consistio en un ajuste adicional (presumiblemente via RL o SFT, no especificado) cuyo objetivo era reducir la longitud de las cadenas de razonamiento sin degradar la calidad de las respuestas.

Un detalle tecnico relevante del proceso de cuantizacion es la exclusion de los pesos cuyo nombre coincide con `.*nextn.*`, lo que apunta a que el modelo original incorpora capas auxiliares de prediccion multi-token (Multi-Token Prediction, MTP). Estas capas se descartan habitualmente en cuantizaciones GGUF porque no se usan en inferencia estandar con llama.cpp. La cuantizacion emplea una imatrix (`ukisai_Swift-Qwen3.8-27b-imatrix.gguf`, publicada por bartowski) y el flag `--pure`, que genera un unico fichero GGUF con todos los tensores en el tipo de cuantizacion solicitado.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO, mas alla de la referencia al comportamiento de "reasoning efficiency" del ajuste Swift.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` del repositorio indica que esta pensado para dialogos multi-turno.
- Razonamiento con modo de pensamiento: el modelo base es un derivado de Qwen3.8-27B, con cadenas de pensamiento explicitas optimizadas para ser mas cortas (reduccion del 58,3 % en la mediana de tokens de pensamiento).
- Razonamiento cientifico y de conocimiento general: evaluado en GPQA-Diamond y MMLU-Pro en la model card del modelo base.
- Matematicas de competicion: evaluado en AIME 2026 y HMMT (noviembre de 2025).
- Seguimiento de instrucciones: evaluado en IFBench.
- Capacidades multilingues, incluyendo chino: evaluado en C-Eval en la model card del modelo base.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente, aunque el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia estandar.
- Capacidades de vision o audio: no disponibles.
- No se documentan capacidades especificas de generacion de codigo, aunque la demo del modelo base usa un prompt de LiveCodeBench v6.

## Casos de uso

- Razonamiento matematico asistido en entornos educativos o de investigacion: el modelo demuestra un rendimiento alto en AIME 2026 (94,00 % en la variante Swift) y HMMT, y el ajuste Swift reduce el numero de tokens de razonamiento necesarios, lo que abarata cada consulta en un escenario de resolucion de problemas paso a paso.
- Asistentes conversacionales de dominio cientifico: con 88,28 % en GPQA-Diamond, es adecuado para responder preguntas de nivel doctorado en fisica, quimica y biologia, donde el usuario necesita justificaciones largas pero no desproporcionadamente extensas.
- Evaluacion de conocimiento general multilingue: el 90,62 % en C-Eval y el 84,95 % en MMLU-Pro lo hacen util como motor de respuesta en sistemas de preguntas y respuestas sobre conocimiento enciclopedico, incluyendo contenido en chino.
- Despliegue en estaciones de trabajo con 16 GB de VRAM: al ocupar aproximadamente 14,5 GB en IQ4_XS, es viable en GPUs como RTX 4060 Ti 16 GB, RTX 4070 Ti Super o RTX 5080, sin necesidad de servidores con A100 o H100.
- Prototipado local de pipelines de razonamiento: sirve para validar flujos de chain-of-thought reducido antes de escalar a infraestructura mayor, ya que el coste por token generado es menor que el de la variante base.
- Seguimiento estricto de instrucciones en tareas de formateo o extraccion: con 71,80 % en IFBench, puede usarse para transformar texto no estructurado en esquemas controlados dentro de un pipeline de procesamiento documental.
- Comparacion de tecnicas de cuantizacion: al existir el mismo modelo en F16 y en IQ4_XS, este repositorio permite medir empiricamente la degradacion introducida por una cuantizacion de 4 bits con imatrix en un modelo de razonamiento.

## Benchmarks y rendimiento

Los siguientes datos proceden de la model card del modelo base y comparan Qwen3.8-27B BF16 sin adaptador (Base) frente al mismo modelo con el adaptador Swift. No se refieren especificamente al fichero IQ4_XS de este repositorio, cuya degradacion por cuantizacion no se ha publicado.

| Benchmark | Score base | Score Swift | Tokens medios base | Tokens medios Swift | Reduccion media | Reduccion mediana |
|---|---|---|---|---|---|---|
| GPQA-Diamond | 88,38 % | 88,28 % | 15.014 | 8.855 | 41,0 % | 58,3 % |
| MMLU-Pro | 85,47 % | 84,95 % | 2.980 | 1.603 | 46,2 % | 28,3 % |
| C-Eval | 90,00 % | 90,62 % | 1.492 | 804 | 46,1 % | 19,3 % |
| IFBench | 73,53 % | 71,80 % | 8.052 | 4.657 | 42,2 % | 50,5 % |
| AIME 2026 | 98,67 % | 94,00 % | 22.014 | 16.143 | 26,7 % | 50,2 % |
| HMMT (nov 2025) | 99,33 % | 96,00 % | 22.032 | no disponible (dato truncado en la fuente) | no disponible | no disponible |

No se han publicado resultados de benchmarks especificos para la cuantizacion IQ4_XS en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 14,5 GB, por lo que los pesos requieren del orden de 14,5 GB. A esto hay que sumar la cache KV, que crece con la longitud de contexto y depende de la configuracion de atencion del modelo base (no documentada).
- GPU objetivo declarada por el autor: GPUs con 16 GB de VRAM. Con ese presupuesto el contexto utilizable sera limitado, ya que los pesos dejan apenas ~1,5 GB libres en una GPU de 16 GB.
- GPUs recomendadas: RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB, RTX 5080 16 GB, A4000 16 GB para el escenario ajustado; RTX 3090, RTX 4090, RTX 5090 (24-32 GB) y A100/H100 para contextos largos y mayor concurrencia.
- Cabe en GPU de consumo: si, en modelos de 16 GB o mas. En GPUs de 12 GB o menos no cabe sin offloading parcial a RAM.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp, llama-server). El soporte de GGUF en vLLM es limitado y experimental, por lo que no es la via recomendada. TGI no soporta GGUF.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de tokens por segundo para esta cuantizacion.
- Nota sobre el tipo de cuantizacion: IQ4_XS requiere una version de llama.cpp con soporte de cuantizaciones IQ (i-quants), disponible en versiones modernas del proyecto.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jpetrina/Swift-Qwen3.8-27B-IQ4_XS-pure-GGUF | 27,3B | IQ4_XS | 14,5 GB | swift-open-license-1.0 | Publicado, 0 descargas |
| ukisai/Swift-Qwen3.8-27B-GGUF (modelo base) | 27,3B | varias (incluye F16) | mayor que 14,5 GB en F16 | swift-open-license-1.0 | Modelo de referencia del ajuste Swift |
| bartowski/ukisai_Swift-Qwen3.8-27b-GGUF | 27,3B | varias | depende de la cuantizacion | swift-open-license-1.0 | Incluye la imatrix usada por esta publicacion |
| Ununnilium/Qwen3.6-27B-IQ4_XS-pure-GGUF | generacion anterior (Qwen3.6) | IQ4_XS | no disponible | no disponible | Enfoque previo de cuantizacion replicado por este repositorio |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada, salvo la comparacion Base frente a Swift recogida en la seccion de benchmarks.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible. Al derivar de Qwen3.8, hereda los sesgos del modelo original y de su dataset de entrenamiento, no publicados aqui.
- Riesgo de alucinacion: no cuantificado. Los modelos de razonamiento con cadenas de pensamiento largas pueden producir justificaciones plausibles pero incorrectas; el ajuste Swift acorta el razonamiento, lo que en algunos casos puede reducir la verificacion interna (AIME 2026 baja de 98,67 % a 94,00 %).
- Perdida por cuantizacion: el IQ4_XS no ha sido evaluado en la informacion disponible. Es esperable cierta degradacion respecto a F16, especialmente en tareas sensibles a precision numerica como matematicas.
- Limitaciones de contexto: la longitud de contexto del modelo base no se documenta en la informacion disponible, y en GPUs de 16 GB el contexto efectivo estara fuertemente limitado por la cache KV.
- Idiomas: no se especifica la lista de idiomas soportados. Solo hay evidencia indirecta de capacidades en ingles y chino a traves de MMLU-Pro y C-Eval.
- Licencia: se trata de swift-open-license-1.0, marcada como `license: other` en HuggingFace. Es imprescindible revisar el fichero NOTICE antes de cualquier uso comercial, ya que las condiciones no son las de una licencia estandar tipo Apache 2.0 o MIT.
- Excepcion de pesos `nextn`: las capas de prediccion multi-token no estan incluidas, por lo que no es posible usar decodificacion especulativa basada en MTP con este fichero.
- Madurez: 0 descargas y 1 like. No hay evidencia de uso en produccion ni de validacion independiente de esta cuantizacion concreta.
- Compatibilidad: requiere llama.cpp con soporte de i-quants; otras herramientas que solo admitan K-quants o Q4_0 no podran cargar el fichero.

## Enlaces

- HuggingFace (esta cuantizacion): https://huggingface.co/jpetrina/Swift-Qwen3.8-27B-IQ4_XS-pure-GGUF
- Modelo base GGUF: https://huggingface.co/ukisai/Swift-Qwen3.8-27B-GGUF
- Modelo base (pesos originales): https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Licencia (NOTICE): https://huggingface.co/ukisai/Swift-Qwen3.8-27b/blob/main/NOTICE
- Imatrix de bartowski: https://huggingface.co/bartowski/ukisai_Swift-Qwen3.8-27b-GGUF/blob/main/ukisai_Swift-Qwen3.8-27b-imatrix.gguf
- Repo de cuantizaciones de bartowski: https://huggingface.co/bartowski/ukisai_Swift-Qwen3.8-27b-GGUF
- Referencia del enfoque de cuantizacion "pure": https://huggingface.co/Ununnilium/Qwen3.6-27B-IQ4_XS-pure-GGUF
- Guia de Qwen3.8 de Unsloth (parametros recomendados): https://unsloth.ai/docs/models/qwen3.8
