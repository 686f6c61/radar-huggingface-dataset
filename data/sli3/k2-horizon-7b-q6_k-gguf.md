# sli3/K2-Horizon-7B-Q6_K-GGUF

## Resumen

K2-Horizon-7B es un modelo denso decoder-only de 7B "core" desarrollado por el Institute of Foundation Models (IFM) de la MBZUAI, con una ventana de contexto nativa de 512.000 tokens. Su rasgo diferencial es la arquitectura `k2_horizon` / `K2HorizonForCausalLM`, construida alrededor de un mecanismo de atencion denominado Mixture-of-Values, que no esta integrado en llama.cpp upstream en el momento de publicacion de esta ficha. La ficha que nos ocupa, `sli3/K2-Horizon-7B-Q6_K-GGUF`, no es un modelo nuevo: es una cuantizacion Q6_K en formato GGUF generada por el usuario sli3 a partir de la release oficial en BF16 publicada por IFM.

La relevancia de este artefacto es doble. Por un lado, permite ejecutar un modelo de 512K de contexto en hardware de consumo mediante cuantizacion de 6 bits, algo poco habitual en modelos con ventanas de contexto tan grandes. Por otro, sirve como caso de estudio de un cuello de botella habitual en el ecosistema open source: la cuantizacion existe, pero el soporte de la arquitectura en las herramientas de inferencia va por detras, obligando a compilar un fork especifico.

El modelo se presenta como un razonador explicito: emite un bloque visible `[Start thinking]...[End thinking]` antes de la respuesta final, y la propia guia de IFM recomienda presupuestos de generacion de 32.768 tokens o mas. Esto implica que la cuantizacion no debe evaluarse con presupuestos de tokens cortos, ya que la generacion puede agotarse durante la fase de razonamiento y no producir respuesta alguna.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only, `k2_horizon` / `K2HorizonForCausalLM`, con atencion Mixture-of-Values |
| Parametros totales | 8.999.178.240 (dato de safetensors del modelo base); el autor lo denomina "7B-core" |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512.000 tokens (nativa, segun el autor) |
| Tipos de cuantizacion | Q6_K (este repositorio). La release oficial de IFM incluye BF16; el catalogo completo de cuantizaciones de IFM no se detalla en la informacion proporcionada |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repositorio | 7,4 GB |
| Modelo base | IFM/K2-Horizon-7B |
| Metodo de cuantizacion | `llama-quantize` sobre BF16, sin imatrix |
| Compatibilidad | No carga en llama.cpp upstream; requiere el fork MBZUAI-IFM (`model/K2Horizon`) |

## Arquitectura y entrenamiento

La informacion disponible describe K2-Horizon-7B como un transformer denso decoder-only de 7B core, con una innovacion arquitectonica concreta: la atencion Mixture-of-Values. El autor no detalla en la model card cuantos parametros adicionales aporta dicha atencion ni como se reparte el presupuesto entre capas, por lo que no es posible describir la arquitectura con mas granularidad. El recuento real de parametros en safetensors (8.999.178.240) sugiere que, ademas del nucleo de 7B, existen embeddings o cabezas adicionales que elevan el total hasta aproximadamente 9.000 millones.

No se proporcionan en la informacion disponible datos sobre el corpus de entrenamiento: ni numero de tokens, ni composicion del dataset, ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. Tampoco se documentan tecnicas de eficiencia como decodificacion especulativa o atencion lineal; la unica innovacion confirmada es el mecanismo de atencion Mixture-of-Values, que es precisamente el que bloquea el soporte en herramientas upstream.

En cuanto al proceso de cuantizacion, si esta documentado: se parte del fichero oficial `K2-Horizon-7B-BF16.gguf` publicado por IFM y se aplica `llama-quantize` del fork `MBZUAI-IFM/llama.cpp` (rama `model/K2Horizon`) con tipo Q6_K, sin matriz de importancia (imatrix). Se trata, por tanto, de una cuantizacion directa y no optimizada por calibracion.

## Capacidades

- Generacion de texto conversacional en formato chat, con plantilla Jinja (`--jinja` en `llama-server`).
- Razonamiento explicito con modo "thinking": el modelo emite un bloque `[Start thinking]` ... `[End thinking]` visible antes de la respuesta final.
- Ajuste de esfuerzo de razonamiento: el autor indica que se puede solicitar `reasoning effort: high` mediante `chat_template_kwargs`.
- Evaluado por IFM en tareas agenticas, de codigo, de contexto largo y de razonamiento (sin cifras publicadas en la informacion disponible).
- Contexto largo: ventana nativa de 512.000 tokens, lo que habilita tareas de lectura de documentos extensos y analisis de repositorios completos.
- Capacidades multilingues: no disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de vision o audio: no disponible; la informacion describe un modelo de texto.
- Endpoints compatibles: la model card etiqueta el repositorio con `endpoints_compatible`, lo que sugiere compatibilidad con el endpoint de inferencia de HuggingFace, si bien la limitacion de arquitectura en llama.cpp hace dudosa esta compatibilidad en la practica.

## Casos de uso

- Analisis de documentacion tecnica extensa: con 512K tokens de contexto, el modelo puede ingerir manuales, especificaciones o varios libros tecnicos en una sola pasada y responder preguntas cruzadas sin fragmentacion por recuperacion.
- Auditoria de repositorios de codigo: dado que se evaluo en tareas de codigo y soporta contexto muy largo, es viable cargar un arbol de fuentes de tamano medio y pedir revisiones de coherencia, dependencias o patrones problematicos.
- Asistentes de investigacion con razonamiento trazable: el bloque de "thinking" visible permite auditar el razonamiento intermedio del modelo, algo util en entornos academicos donde se requiere justificar conclusiones.
- Agentes multi-paso sobre herramientas locales: desplegado con `llama-server` y `--jinja`, puede actuar como backend de un agente que mantenga estado conversacional largo, aunque el soporte de tool calling no este confirmado en la informacion disponible.
- Despliegue en hardware de consumo con presupuesto ajustado: la cuantizacion Q6_K de ~7,4 GB permite ejecutar un modelo de contexto 512K en una GPU de 12-24 GB, con offloading parcial a RAM si el contexto es muy largo.
- Generacion de informes largos: con presupuestos de 32.768 tokens de salida, el modelo puede producir documentos estructurados extensos en una sola generacion, sin necesidad de encadenar llamadas.
- Evaluacion comparativa de arquitecturas de atencion: como implementacion de referencia de Mixture-of-Values, sirve para reproducir y medir el comportamiento de este mecanismo frente a atencion estandar en tareas de contexto largo.
- Prototipado conversacional local: uso mediante `llama-cli` con `-n 512` o superior para pruebas interactivas sin enviar datos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que K2-Horizon-7B fue evaluado por IFM en tareas agenticas, de codigo, de contexto largo y de razonamiento, pero no incluye cifras concretas (MMLU, HumanEval, GSM8K u otras), ni resultados de esta cuantizacion especifica frente al BF16 original. Tampoco hay datos de latencia o throughput.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del tamano del repositorio y del tipo de cuantizacion, no datos publicados:

- Peso de los ficheros GGUF: aproximadamente 7,4 GB en Q6_K.
- VRAM minima estimada con contexto corto: unos 8-10 GB (pesos mas overhead del runtime y cache KV reducida).
- GPU consumer compatibles: RTX 3060 de 12 GB (ajustado), RTX 4070 Ti Super / 4080 / 4090 con 16-24 GB (holgado). Cabe en GPU de consumo, pero no en tarjetas de 8 GB sin offloading.
- Contexto largo: la cache KV de 512K tokens crece de forma aproximadamente lineal con la longitud y puede superar con holgura la capacidad de una unica GPU; en la practica requerira offloading a RAM, cuantizacion de la cache KV o despliegue multi-GPU. No se dispone del numero de capas ni de cabezas para calcularla con precision.
- GPU de datacenter: A100 40/80 GB, H100 o L40S para servir contexto completo en una sola tarjeta.
- Opciones de despliegue: exclusivamente llama.cpp compilado desde el fork `MBZUAI-IFM/llama.cpp` (rama `model/K2Horizon`), mediante `llama-cli` y `llama-server`. vLLM, TGI, Ollama y llama.cpp upstream no soportan la arquitectura `k2_horizon` en el momento de redaccion de esta ficha. Existe una PR en curso en la discusion ggml-org/llama.cpp #28308.
- Parametros de generacion recomendados por IFM: `temperature=1.0`, `top_p=0.95`, esfuerzo de razonamiento alto y un minimo de 32.768 tokens de salida. El autor advierte que con `-n 64` no se obtiene respuesta visible, mientras que con `-n 512` o superior la generacion se completa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparativa es limitada porque no hay cifras de rendimiento publicadas para K2-Horizon-7B. Se comparan parametros, contexto, licencia y disponibilidad:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad GGUF | Benchmarks |
|---|---|---|---|---|---|
| K2-Horizon-7B (esta cuantizacion) | ~9.000 M en safetensors ("7B-core") | 512.000 tokens | Apache 2.0 | Si, pero requiere fork de llama.cpp | No disponibles |
| Llama 3.1 8B Instruct | 8.030 M | 128.000 tokens | Llama 3.1 Community License | Amplia, upstream | Publicos |
| Qwen2.5 7B Instruct | 7.600 M | 128.000 tokens | Apache 2.0 | Amplia, upstream | Publicos |
| Mistral 7B Instruct v0.3 | 7.240 M | 32.000 tokens | Apache 2.0 | Amplia, upstream | Publicos |

El diferencial de K2-Horizon-7B es la ventana de 512K tokens, cuatro veces la de Llama 3.1 8B y Qwen2.5 7B, con licencia Apache 2.0. El coste de ese diferencial es la madurez del ecosistema: los tres modelos de comparacion funcionan en cualquier runtime moderno sin compilaciones personalizadas.

## Limitaciones y advertencias

- Compatibilidad rota con llama.cpp upstream: el fichero no cargara en builds estandar de llama.cpp, Ollama ni en la mayoria de wrappers que dependen de llama.cpp. Es necesario compilar el fork de MBZUAI-IFM con la rama `model/K2Horizon`. Una vez se fusione la PR pendiente, el fichero deberia cargar sin recuantizar.
- Riesgo de truncado en modo razonamiento: con presupuestos bajos de tokens (`-n 64`, por ejemplo), el modelo consume toda la generacion en el bloque de "thinking" y no emite respuesta. No es un fallo del modelo, sino de configuracion; IFM recomienda 32.768 tokens de salida.
- Alucinacion: no hay datos publicados de tasas de alucinacion ni evaluaciones de fidelidad factual para este modelo. Al ser un modelo de razonamiento entrenado para pensar en voz alta, el bloque intermedio no debe tratarse como evidencia verificada.
- Sesgos: no disponible. No se documenta composicion del corpus ni procesos de mitigacion, por lo que no es posible caracterizar sesgos de genero, idioma o dominio.
- Idiomas: no disponibles en la informacion proporcionada; no se puede confirmar calidad fuera del ingles.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero hereda cualquier restriccion adicional que pudiera aplicar al modelo base. Conviene verificar la ficha de `IFM/K2-Horizon-7B` antes de un despliegue en produccion.
- Soporte de tool calling no confirmado: la informacion no menciona function calling explicito, por lo que no deberia asumirse para pipelines de agentes.
- Cuantizacion sin imatrix: al no haberse aplicado matriz de importancia, es probable que exista una perdida de calidad respecto al BF16 mayor que la de una Q6_K calibrada. No hay mediciones que cuantifiquen esa diferencia.
- Ambiguedad de nomenclatura: el nombre "K2" coincide con el de otras familias de modelos abiertos sin relacion con este (por ejemplo, las publicadas por LLM360), lo que puede generar confusion al buscar documentacion.
- Estado del repositorio: 0 descargas y 0 likes en el momento de redaccion; es una cuantizacion de un tercero, no una release oficial de IFM.
- Fecha de creacion: 2026-09-14, dato relevante si se consulta esta ficha tiempo despues, dado que el soporte upstream puede haber cambiado.

## Enlaces

- Repositorio de esta cuantizacion: https://huggingface.co/sli3/K2-Horizon-7B-Q6_K-GGUF
- Modelo base: https://huggingface.co/IFM/K2-Horizon-7B
- Release oficial en BF16: https://huggingface.co/IFM/K2-Horizon-7B-GGUF
- Organizacion IFM (MBZUAI): https://huggingface.co/IFM
- Blog del anuncio de K2 Horizon: https://ifm.ai/blog/k2/
- Fork de llama.cpp con soporte de arquitectura: https://github.com/MBZUAI-IFM/llama.cpp/tree/model/K2Horizon
- Discusion sobre la integracion upstream de `k2_horizon`: https://github.com/ggml-org/llama.cpp/discussions/28308

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo. Los resultados obtenidos correspondian a contenidos de astrologia, a un hilo en Zhihu sin relacion y a un articulo de blog sobre Gemini 1.5. No se han encontrado papers, demos ni evaluaciones independientes en la informacion proporcionada.
