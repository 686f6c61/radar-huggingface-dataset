# lin7c/granite-4.2-8b-Q4_K_M-imat

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino una cuantizacion GGUF del modelo IBM Granite 4.2 8B publicada por el usuario lin7c. Se trata de un unico archivo de 5.347.918.176 bytes (5,348 GB) en formato Q4_K_M, generado con una importance matrix (imatrix) calculada especificamente para este build a partir de un conjunto de calibracion mixto: texto general y trayectorias de uso de herramientas por parte de agentes. El objetivo declarado es ejecutar una carga de trabajo de agente de terminal en una GPU de gama de 8 GB.

El modelo base, ibm-granite/granite-4.2-8b, tiene 8.791.592.960 parametros y una ventana de contexto nativa de 128K tokens segun la model card del derivado. La relevancia de esta publicacion es practica: ofrece un artefacto listo para llama.cpp con memoria maxima medida de 6.609 MiB a 16.384 tokens de contexto y cache KV en q8_0, lo que deja margen en tarjetas de 8 GB. El autor documenta ademas la fidelidad de la cuantizacion frente al modelo sin cuantizar, con limites de aceptacion fijados antes del build.

Conviene subrayar que el repositorio tiene un volumen de adopcion muy bajo (13 descargas, 0 likes) y que no publica resultados de benchmarks de capacidad, solo metricas de degradacion por cuantizacion. La informacion sobre arquitectura interna, idiomas o rendimiento en tareas no esta disponible en los datos proporcionados y procede consultarla en la model card del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la model card del derivado no la especifica; remite al modelo base) |
| Parametros totales | 8.791.592.960 (dato real, safetensors del modelo base) |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 128K tokens nativos en el modelo base; build verificado a 16.384 tokens |
| Tipos de cuantizacion | Q4_K_M con imatrix (este repositorio); se menciona una variante IQ4_XS de la misma serie de pruebas, no publicada aqui |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un unico archivo, `granite-4.2-8b-Q4_K_M-imat.gguf`) |
| Tamano del archivo | 5.347.918.176 bytes (5,348 GB) |
| SHA-256 del GGUF | `26deb4e54d9e6315b5d21e5fc21c3e23e1ae01e1104199304d44d56249d9e6e3` |
| Cache KV de referencia | q8_0 (claves y valores) |
| Build de llama.cpp | commit `dac308739429d60ccf99c46ecc1fbb1dff20ca77` |
| SHA-256 del imatrix | `68bd9ab564da99e1323a1a1e63893262fbd80f762b20b96ad3dca02a528522f2` |
| Modelo base | ibm-granite/granite-4.2-8b |
| Fecha de creacion del repo | 2026-10-19 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en los materiales proporcionados: la model card del derivado no describe si se trata de un transformer denso, de una arquitectura hibrida con capas de estado o de un esquema MoE, y se limita a remitir a la documentacion de IBM Granite. Lo que si esta documentado es el proceso de cuantizacion: se genero una importance matrix propia, no reutilizada de otros builds, con SHA-256 `68bd9ab5...22f2`, calculada sobre un conjunto de calibracion mixto compuesto por texto general y trayectorias de agentes con uso de herramientas. El archivo se construyo con el commit `dac3087` de llama.cpp y se publica como artefacto unico GGUF Q4_K_M.

El autor fijo de antemano unos umbrales de aceptacion de la cuantizacion y los verifico antes de subir el archivo: divergencia KLD media inferior o igual a 0,105 en texto de Wikipedia e inferior o igual a 0,25 en trayectorias de agente. Ambas se cumplen (0,0966 y 0,2323 respectivamente). Tambien se realizo una prueba de carga real con llama.cpp, contexto de 16.384 tokens, cache KV q8_0 y todas las capas descargadas en una unica GPU, con codigo de salida 0 y un pico de memoria de 6.609 MiB en una Tesla T4 de 15 GB. No se documentan datos de entrenamiento (numero de tokens, composicion del dataset, RLHF/DPO) porque este repositorio no entrena el modelo, solo lo cuantiza.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` del repositorio y la existencia de plantilla de chat en el modelo base apuntan a uso como asistente conversacional; el detalle de la plantilla no se incluye en la informacion disponible.
- Uso de herramientas y cargas de agente: el build se calibro explicitamente con trayectorias de tool use y esta orientado por el autor a un agente de terminal, lo que presupone que el modelo base soporta llamadas a funciones y razonamiento de varios pasos.
- Contexto largo: el modelo base declara 128K tokens, aunque este build se valida y se recomienda a 16.384 tokens por motivos de memoria.
- Integracion en llama.cpp: compatible con `llama-cli` y `llama-server`, con soporte de offload completo a GPU (`-ngl 99`) y cache KV cuantizada.
- Compatibilidad con endpoints: el repositorio incluye el tag `endpoints_compatible`, lo que indica que el artefacto puede servirse detras de una API compatible con el esquema habitual de HuggingFace.
- Capacidades de vision, audio, matemáticas o modo de razonamiento explicito: no documentadas en la informacion proporcionada.
- Cobertura multilingue: no disponible.

## Casos de uso

- Agente de terminal en local: el escenario para el que se construyo el build. Un agente que interpreta ordenes en lenguaje natural, genera comandos de shell y encadena varios pasos puede ejecutarse en una unica GPU de 8 GB con 16K de contexto, sin depender de APIs externas ni de enviar datos a terceros.
- Asistente de codigo en estaciones de trabajo con GPU modesta: con 5,35 GB de pesos, el modelo cabe junto al resto de la sesion grafica en tarjetas de 8 GB, lo que permite autocompletado, explicacion de fragmentos y refactorizacion asistida en un portatil con GPU dedicada.
- Automatizacion de tareas de administracion de sistemas: interpretacion de salidas de comandos, diagnostico de errores y propuesta de remedios en un bucle de agente; la calibracion con trayectorias de tool use reduce la degradacion precisamente en ese tipo de secuencias.
- Despliegue en el borde o en entornos con requisitos de soberania del dato: al ser Apache 2.0 y ejecutable con llama.cpp, puede integrarse en infraestructura propia sin coste de licencia ni salida de datos, algo relevante en sectores regulados.
- Procesamiento por lotes de documentos con contexto medio: con 16K tokens efectivos se pueden resumir, clasificar o extraer campos de informes, contratos o tickets de longitud moderada en un pipeline offline a coste marginal cero.
- Base para evaluacion y comparacion de cuantizaciones: las metricas de KLD y ratio de perplejidad publicadas permiten usar este build como referencia reproducible al comparar otras cuantizaciones del mismo modelo (por ejemplo, la variante IQ4_XS de la misma serie) sobre los mismos conjuntos de calibracion.
- Prototipado de funciones de tool calling antes de pasar a produccion: permite validar esquemas de herramientas y prompts de agente en local y, una vez ajustados, migrar al modelo base sin cuantizar o a una cuantizacion mayor en servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor solo documenta metricas de fidelidad de la cuantizacion frente al modelo base sin cuantizar, evaluadas sobre los mismos conjuntos:

| Conjunto | KLD media | Same top-p | Ratio de perplejidad Q/base | Limite de aceptacion |
|---|---|---|---|---|
| Texto de Wikipedia | 0,0966 | 89,42% | 1,0454 | KLD <= 0,105 (cumple) |
| Trayectorias de agente | 0,2323 | 87,99% | 1,0596 | KLD <= 0,25 (cumple) |

Lectura de los datos: la cuantizacion incrementa la perplejidad un 4,54% en texto general y un 5,96% en trayectorias de agente, y mantiene la misma eleccion top-p en torno al 88-89% de los casos. La degradacion es apreciablemente mayor en el dominio de agentes que en texto general, aunque dentro del margen aceptado por el autor.

Prueba de carga publicada:

| Metrica | Valor |
|---|---|
| Contexto | 16.384 tokens |
| Cache KV | q8_0 (K y V) |
| Offload | todas las capas en GPU (`-ngl 99`) |
| Pico de memoria de GPU | 6.609 MiB |
| Tarjeta de prueba | Tesla T4 15 GB |
| Codigo de salida | 0 |

No se proporcionan datos de latencia (tokens/s) ni de throughput en servidor concurrente.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,6 GB en el escenario medido (5,35 GB de pesos + cache KV q8_0 a 16.384 tokens). Con cache KV en f16 el consumo subira por encima de esa cifra y reducira el margen en tarjetas de 8 GB.
- Tarjetas de 8 GB: es el objetivo declarado del build. Cabe con 16K de contexto y cache q8_0, dejando poco margen adicional.
- Tarjetas de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, Tesla T4 15 GB): configuracion holgada; permiten ampliar contexto o usar cache KV en mayor precision.
- Tarjetas de 24 GB o superiores (RTX 3090, RTX 4090, A10G, L40S): permiten acercarse al contexto nativo del modelo base o servir varias peticiones concurrentes.
- GPU de centro de datos (A100 40/80 GB, H100): sobredimensionadas para un modelo de 8,79B en Q4_K_M; solo tienen sentido si se sirven muchas peticiones en paralelo o se combinan con el modelo sin cuantizar.
- Despliegue: llama.cpp mediante `llama-cli` o `llama-server` con los parametros documentados; tambien es importable en herramientas basadas en llama.cpp (Ollama, LM Studio, llama-cpp-python). Para vLLM o TGI no es el formato nativo: requeririan el modelo base en safetensors o una cuantizacion GPTQ/AWQ, no disponible en este repositorio.
- Comando de referencia: `llama-server -m granite-4.2-8b-Q4_K_M-imat.gguf -ngl 99 -c 16384 -ctk q8_0 -ctv q8_0`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ibm-granite/granite-4.2-8b (base) | 8,79B | 128K nativo | safetensors, sin cuantizar | Apache 2.0 | Publico en HuggingFace |
| lin7c/granite-4.2-8b-Q4_K_M-imat (este) | 8,79B | 128K nativo; verificado a 16K | GGUF Q4_K_M, 5,35 GB | Apache 2.0 | Publico, 13 descargas |
| Variante IQ4_XS de la misma serie | No disponible | No disponible | GGUF IQ4_XS (no publicada en este repo) | Apache 2.0 (presumible, derivada del mismo base) | No publicada |
| Llama 3.1 8B Instruct | 8,03B | 128K | safetensors / GGUF | Llama 3.1 Community License | Publico en HuggingFace |
| Qwen3-8B | 8,2B | 32K nativo, ampliable a 131K con YaRN | safetensors / GGUF | Apache 2.0 | Publico en HuggingFace |

Nota: los datos de las dos ultimas filas proceden de las fichas publicas de esos modelos y no forman parte de la informacion proporcionada en esta busqueda; se incluyen solo como referencia de categoria. No se dispone de comparaciones de rendimiento entre este build y esas alternativas, por lo que no es posible establecer un ranking de calidad.

## Limitaciones y advertencias

- Perdida por cuantizacion: Q4_K_M es una cuantizacion con perdida. El propio autor mide un aumento de perplejidad del 4,54% en texto general y del 5,96% en trayectorias de agente, con un 12% de casos en los que la eleccion top-p difiere del modelo base en el dominio de agentes.
- Sesgo de calibracion del imatrix: la importance matrix se calculo sobre texto general mas trayectorias de tool use. Dominios alejados de esa distribucion (por ejemplo, texto juridico, codigo en lenguajes exoticos o conversacion multilingue) pueden degradarse mas de lo que reflejan las metricas publicadas.
- Contexto efectivo limitado en la practica: aunque el modelo base declara 128K, este build se valida a 16.384 tokens. Superar ese valor en una GPU de 8 GB provocara desbordamiento de memoria o requiere offload parcial a CPU, con la consiguiente caida de velocidad. Ademas, la atencion sobre contextos muy largos en modelos de 8B sufre perdida de recuperacion de informacion intermedia.
- Doble cuantizacion: el uso de cache KV en q8_0 anade una segunda fuente de perdida numerica respecto a una cache en f16, no cuantificada en las metricas de calidad publicadas.
- Ausencia de benchmarks de capacidad: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones de tool calling que permitan verificar el rendimiento real en tareas frente al modelo base o frente a alternativas. Cualquier afirmacion de rendimiento seria una extrapolacion.
- Riesgo de alucinacion: inherente a los modelos de 8B en Q4_K_M, especialmente en generacion de comandos o APIs donde una alucinacion puede tener consecuencias destructivas. En cargas de agente se recomienda sandboxing, validacion de comandos y confirmacion humana en operaciones irreversibles.
- Idiomas: no se documenta la cobertura. El hecho de que la calibracion se hiciera con texto general sin especificar idioma impide garantizar un comportamiento homogeneo fuera del ingles.
- Adopcion marginal: 13 descargas y 0 likes en el momento de la consulta. No existe validacion independiente de la calidad del build; conviene verificar el SHA-256 del archivo y del imatrix antes de desplegarlo.
- Licencia: Apache 2.0, que permite uso comercial, modificacion y redistribucion con atribucion y conservacion del aviso de licencia. Al ser un derivado cuantizado, se mantienen los terminos del modelo base; conviene revisar la model card de ibm-granite/granite-4.2-8b para las condiciones de uso previsto y las limitaciones declaradas por IBM.
- Unica variante publicada: solo se distribuye Q4_K_M. No hay opciones de mayor precision (Q5, Q6, Q8) ni de menor tamano en este repositorio.

## Enlaces

- Repositorio HuggingFace de este build: https://huggingface.co/lin7c/granite-4.2-8b-Q4_K_M-imat
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-8b
- llama.cpp (el build usa el commit `dac308739429d60ccf99c46ecc1fbb1dff20ca77`): https://github.com/ggml-org/llama.cpp
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo. Las consultas devolvieron unicamente resultados sin relacion con el contenido de la ficha (paginas de pronosticos de carreras de caballos del sitio geny.com), por lo que se descartan.
- Papers, blogs, repositorios o demos adicionales: no disponibles en la informacion proporcionada.
