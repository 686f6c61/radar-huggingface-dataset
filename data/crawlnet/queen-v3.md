# Crawlnet/queen-v3

## Resumen

Queen v3, tambien llamado "weaver" en su model card, es un modelo de lenguaje de 122,6 millones de parametros entrenado integramente desde cero por Crawlnet, un proyecto vinculado a la web de criptomonedas del mismo nombre. No utiliza pesos preentrenados ni corpus genericos tipo FineWeb: su unico material de preentrenamiento son las paginas que los crawlers de Crawlnet visitaron en la web cripto (89.367 paginas de 1.936 dominios distintos) mas 45.627 paginas de registros publicos de mercado, financiacion y datos on-chain, exportadas el 6 de octubre de 2026. El tokenizador BPE de 16.384 tokens se entreno exclusivamente con ese mismo conjunto.

Arquitectonicamente es un transformer GPT denso derivado de karpathy/nanochat, con profundidad 10, anchura 640, 5 cabezas de atencion y una ventana de contexto de solo 2.048 tokens. El preentrenamiento consumio 625.999.872 tokens (3,27 epocas, 10,5 tokens por parametro no de embedding) sobre 191.488.840 tokens unicos, y el ajuste conversacional (SFT) se hizo con 247.648 pares pregunta/respuesta generados por deepseek-flash a partir de las paginas, mas 487.456 pares extraidos literalmente de encabezados y FAQ de las propias paginas.

Su relevancia no es la de un modelo de proposito general, sino la de un experimento reproducible y de coste minimo (1,771 GPU-horas y unos 37 dolares en total) que demuestra un pipeline completo de preentrenamiento, tokenizacion y SFT sobre un dominio vertical cerrado. El propio autor advierte que hay que esperar "un modelo tonto, divertido y con seguridad equivocada"; se trata, por tanto, de una pieza de investigacion y de un ejercicio de trazabilidad de datos, no de un candidato para produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer GPT denso (nanochat GPT), profundidad 10, anchura 640, 5 cabezas de atencion |
| Parametros totales | 122.552.666 (59,6 M no de embedding) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No se publican pesos cuantizados. El repo (0,2 GB) es consistente con bf16/fp16; no hay versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles (etiqueta `en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria `nanochat`) |
| Vocabulario | BPE de 16.384 tokens entrenado solo con el dataset del proyecto |
| Tokens de entrenamiento | 625.999.872 (3,27 epocas sobre 191.488.840 tokens unicos) |
| Perdida de validacion | 0,8174 bits/byte en paginas retenidas (preentrenamiento) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un GPT decoder-only de 10 capas, 640 dimensiones de modelo y 5 cabezas de atencion, ejecutado con el codigo de `karpathy/nanochat` en el commit `92d63d4e8bb4` (licencia MIT), mas el directorio `training/` propio de Crawlnet. Con 122,6 M de parametros totales y 59,6 M no de embedding, la relacion de entrenamiento es de 10,5 tokens por parametro no de embedding, muy por debajo de lo habitual en modelos de escala similar, lo que explica en parte el caracter limitado del modelo. La perdida de validacion reportada en preentrenamiento es de 0,8174 bits/byte sobre paginas retenidas (1.996.669 tokens reservados).

El dataset consta de 135.077 paginas exportadas el 2026-10-06T11:30:31Z, que tras limpieza quedan en 134.994: 89.367 paginas de crawler procedentes de 1.936 dominios y 45.627 paginas de registros, estas ultimas responsables de aproximadamente 10,95 M tokens (el 6 % del total). El manifiesto del dataset tiene hash sha256 `00a69452525b0533fdddde5ff0f345ac19d451cd5cc842b4711a0cfd833edea3`. El autor documenta el origen de las paginas crawleadas mediante una tabla de contribuidores, con las wallets de Solana y las transacciones de burn que financiaron cada crawler.

El ajuste conversacional combina dos fuentes. La primera son 247.648 pares pregunta/respuesta generados por `deepseek-flash` (DeepSeek-V4.1-Flash) a partir de 170.994 fragmentos de pagina, con la instruccion de usar unicamente hechos presentes en cada pagina; la segunda son 487.456 pares cortados directamente de las paginas (preguntas de FAQ, encabezados y titulos, con respuestas textuales de la pagina). Ademas, 183.204 conversaciones se reentrenaron en modo "libro abierto", anteponiendo el texto de la pagina recuperada a la pregunta, y el 46 % de ellas con una segunda pagina recuperada por busqueda. No se menciona RLHF ni DPO; el unico texto escrito por humanos son seis plantillas fijas de pregunta. El coste total reportado es de 0,60 dolares de GPU mas aproximadamente 36,33 dolares de API, con 1,771 horas de GPU en una sola tarjeta.

## Capacidades

- Generacion de texto en ingles sobre tematica cripto: paginas de proyectos, mercados, rondas de financiacion y registros on-chain.
- Respuesta a preguntas de tipo FAQ, tarea para la que fue entrenado explicitamente con 487.456 pares extraidos de encabezados y secciones de preguntas frecuentes.
- Modo libro abierto: puede responder condicionado al texto de una pagina antepuesta a la pregunta, lo que permite usarlo como generador final dentro de un pipeline de recuperacion (RAG).
- Extraccion y reformulacion de informacion presente en una pagina concreta, con la restriccion de no introducir hechos externos que se le indico al generador de los pares de SFT.
- Clasificacion y completado de texto corto propio del dominio cripto (titulares, titulos de pagina, fragmentos de registros de mercado).
- Capacidades multilingues: no disponibles. El modelo esta entrenado y etiquetado unicamente en ingles.
- Tool calling / function calling: no disponible; no se documenta ningun formato de llamada a herramientas ni plantilla de chat especifica.
- Uso como agente o razonamiento multi-paso: no disponible; no hay entrenamiento ni evaluacion en ese sentido.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo de razonamiento explicito (thinking): no disponible.

## Casos de uso

- Generacion automatica de FAQ para sitios de criptomonedas: dado el HTML o el texto de una pagina, el modelo puede producir pares pregunta/respuesta en el mismo estilo con el que fue entrenado, ya que 487.456 de sus ejemplos de SFT se obtuvieron exactamente asi de encabezados y secciones de preguntas frecuentes.
- Respuesta sobre documentacion recuperada (RAG): con 2.048 tokens de contexto, encaja en pipelines donde se inserta un fragmento de pagina y una pregunta; su entrenamiento en modo libro abierto con 183.204 conversaciones lo orienta especificamente a esa tarea.
- Etiquetado y normalizacion de registros de mercado y on-chain: al haber visto 45.627 paginas de registros textuales, puede completar o reformatear campos de este tipo de documentos en tareas de enriquecimiento de datos internos.
- Prototipado e investigacion sobre entrenamiento desde cero: sirve como referencia reproducible de un pipeline completo (tokenizador propio, preentrenamiento, SFT) por 1,771 GPU-horas, util para validar infraestructura antes de escalar a modelos mayores.
- Experimentos de ablacion sobre composicion de dataset: la separacion documentada entre paginas de crawler (94 %) y paginas de registros (6 %), con manifiesto y hash verificables, permite estudiar el efecto de mezclas de dominio en un modelo de 122 M de parametros.
- Chat de nicho en el borde o en CPU: con 122,6 M de parametros en bf16 (unos 245 MB) se puede servir en portatiles o dispositivos sin GPU para demos internas de tematica cripto.
- Generacion de descripciones breves de proyectos a partir de su web: el modelo puede resumir el contenido de una pagina crawlada en una o dos frases para alimentar un indice o un directorio de proyectos.
- Evaluacion de sistemas de recuperacion: usando el modo libro abierto, se puede medir si el modelo acierta en funcion de la pagina recuperada, como sonda barata para comparar estrategias de retrieval en un dominio concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, HellaSwag ni ninguna otra evaluacion estandar, y tampoco ofrece comparaciones con modelos de tamano similar. El unico dato cuantitativo de calidad reportado es la perdida de validacion de preentrenamiento: 0,8174 bits/byte sobre paginas retenidas del propio dominio, una metrica interna que no es comparable con resultados de benchmarks publicos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: unos 490 MB solo de pesos; en bf16/fp16 (formato probable del repo de 0,2 GB), unos 245 MB; en int8, unos 123 MB; en int4, unos 61 MB.
- Cache KV: estimacion a partir de la arquitectura (10 capas, 5 cabezas, dimension de cabeza de 128, asumiendo atencion multi-cabeza estandar y sin GQA) de unos 25 KB por token, es decir, aproximadamente 51 MB para los 2.048 tokens de contexto completos en fp16.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente. No se necesita A100 ni H100; una GTX 1650, una RTX 3060 o incluso una iGPU moderna pueden ejecutar el modelo.
- Cabe en GPU de consumo: si, con margen amplio en cualquier GPU de consumo de los ultimos diez anos, y tambien en CPU y en placas tipo Raspberry Pi en cuantizacion de 8 o 4 bits.
- Opciones de despliegue: la libreria `nanochat` y el codigo de `karpathy/nanochat` en el commit indicado son la via soportada. No se publican pesos en GGUF, por lo que llama.cpp, Ollama y LM Studio requeririan una conversion previa del modelo a una arquitectura soportada. vLLM y TGI no soportan de forma nativa la implementacion nanochat sin adaptacion.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia en ninguna configuracion de hardware.

## Comparativa con modelos similares

No existen benchmarks publicados de queen-v3 que permitan una comparacion de rendimiento. La tabla compara unicamente especificaciones publicas de modelos de tamano comparable; los datos de las alternativas proceden de sus respectivas model cards y no de una evaluacion conjunta.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Formato |
|---|---|---|---|---|---|
| Crawlnet/queen-v3 | 122,6 M (59,6 M no embedding) | 2.048 | Apache-2.0 | Ingles | safetensors |
| GPT-2 small | 124 M | 1.024 | MIT modificada | Ingles | safetensors, GGUF |
| SmolLM2-135M | 135 M | 8.192 | Apache-2.0 | Ingles principalmente | safetensors, GGUF |
| Qwen2.5-0.5B | 494 M | 32.768 | Apache-2.0 | Multilingue | safetensors, GGUF |

Diferencias cualitativas destacables: queen-v3 es el unico de la lista entrenado exclusivamente sobre un corpus vertical de tematica cripto y con tokenizador propio, y el unico que documenta el origen del dataset con hash y transacciones on-chain. A cambio, ofrece el contexto mas corto de la tabla (2.048 tokens), esta limitado al ingles y no dispone de versiones cuantizadas listas para usar, algo que si ofrecen GPT-2, SmolLM2 y Qwen2.5.

## Limitaciones y advertencias

- El propio autor describe el modelo como "tonto, divertido y con seguridad equivocada"; es una advertencia explicita sobre su fiabilidad.
- Riesgo alto de alucinacion fuera del dominio cripto y de invencion de datos concretos (cifras de mercado, nombres de proyectos, direcciones) incluso dentro del dominio.
- Cobertura linguistica limitada al ingles, sin capacidades multilingues documentadas.
- Contexto de solo 2.048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas sin truncado agresivo.
- Entrenamiento con solo 10,5 tokens por parametro no de embedding y 3,27 epocas: riesgo de sobreajuste al corpus y de memorizacion literal de fragmentos de las paginas crawladas.
- El estilo de las respuestas esta influido por `deepseek-flash`, que genero los 247.648 pares de SFT; parte del comportamiento conversacional es, por tanto, destilado de otro modelo.
- No se documenta RLHF, DPO ni filtros de seguridad, por lo que no hay alineacion ni moderacion incorporadas.
- No se documentan capacidades de tool calling, agentes ni modos de razonamiento; no conviene asumirlas.
- Procedencia de los datos: el corpus proviene de rastreo web de 1.936 dominios y de registros publicos. Conviene revisar las condiciones de uso del contenido original antes de reutilizar el modelo en un producto comercial, aunque la licencia del modelo sea Apache-2.0.
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion, siempre citando aviso de licencia. No se declaran restricciones adicionales en la model card.
- Popularidad nula en el momento de la consulta (0 descargas, 0 likes), sin comunidad ni soporte; cualquier problema de reproducibilidad recae en el usuario.
- El modelo esta fechado en octubre de 2026 y su corpus es de esa misma fecha; el conocimiento sobre el dominio cripto se congela ahi.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Crawlnet/queen-v3
- Codigo base nanochat (MIT), commit `92d63d4e8bb4`: https://github.com/karpathy/nanochat
- Model card del modelo: incluye la tabla de contribuidores con enlaces a transacciones de burn en Solscan (https://solscan.io) para cada crawler, entre ellas `3LPEQ8cWB5CfRszuVr9qtvtu9Zs8QM5fhMgsyZA1AEfsjcURnbeHKgFLot1BRck1mcrzc69F5GAdfibSZfcL6YiJ`.
- API del generador de los pares de SFT: https://api.deepseek.com (DeepSeek-V4.1-Flash, pesos abiertos bajo licencia MIT)
- La busqueda web realizada no devolvio ningun enlace relevante al modelo. Los resultados obtenidos corresponden a crawlers de radiocontrol a escala (Capo Queen CD1582X, Karnage V3, Meus V3) y a un catalogo de arte, sin relacion alguna con Crawlnet/queen-v3.
