# albapepper/scoracle-articulator-v4-q6

## Resumen

Scoracle Articulator v4 Q6 es un modelo de generacion de texto de dominio muy concreto: un narrador deportivo compacto que se ejecuta en dispositivo. Se trata de un ajuste fino con LoRA sobre ibm-granite/granite-4.0-h-1b, fusionado y cuantizado a 6 bits en formato MLX, desarrollado por el usuario albapepper para el cliente iOS de Scoracle. Su funcion no es responder preguntas generales sobre deportes, sino convertir fragmentos JSON estructurados de datos de equipo (ocho tipos: perfil, rating, momentum, resultados, noticias, follow-up, mood y transfer wire) en respuestas conversacionales breves.

El modelo tiene 1.461.538.368 parametros reales segun los pesos safetensors y el repositorio ocupa 1,2 GB, con una descarga aproximada de 1,1 GB. La arquitectura heredada del modelo base pertenece a la familia Granite 4.0 H, etiquetada en el repositorio como granitemoehybrid, y el pipeline declarado es text-generation con licencia Apache-2.0 y soporte exclusivo de ingles.

Su relevancia es acotada pero clara: es un ejemplo de destilacion de una tarea de narracion con contrato de entrada estricto sobre un modelo pequeno, pensado para inferencia local en Apple Silicon con MLX. El propio autor advierte que no es un modelo de conocimiento deportivo general y que debe usarse con la guarda de grounding del runtime activada, ya que las respuestas con decimales no soportados se rechazan y se reintentan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida de la familia Granite 4.0 H (tag del repositorio: granitemoehybrid); detalle interno no disponible |
| Parametros totales | 1.461.538.368 (segun pesos safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | 6-bit affine, group size 64 (MLX) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | MLX Safetensors |

Datos adicionales del artefacto: version `v4-iter900-q6-2026-08-29`, construccion v4 iter-900, repositorio de 1,2 GB, descarga aproximada de 1,1 GB. El repositorio incluye tokenizer, chat template, configuracion de generacion, configuracion del modelo, pesos y un `manifest.json` versionado que consume el descargador de la app iOS.

## Arquitectura y entrenamiento

No se detalla en la informacion disponible la arquitectura interna mas alla de la herencia del modelo base ibm-granite/granite-4.0-h-1b y de la etiqueta `granitemoehybrid` presente en el repositorio. El artefacto final es un ajuste fino con LoRA sobre ese modelo base, fusionado con los pesos originales y posteriormente cuantizado a 6 bits afines con group size 64 para MLX. No se especifica el rango del LoRA, los hiperparametros de entrenamiento ni el numero de tokens vistos.

El corpus de ajuste fino consta de 1.456 pares instruccion-respuesta conversacionales que cubren 182 equipos, con conjuntos de validacion y holdout disjuntos a nivel de entidad. La evaluacion se realizo sobre 176 prompts retenidos correspondientes a 22 equipos y ocho formas de prompt distintas. La construccion cuantizada fusionada reporta un 97,2% de numeros con grounding correcto y un 100% de cumplimiento en las invariantes de nombre de producto, detalles internos de infraestructura y equipos extranjeros. Segun el autor, todos los fallos de grounding observados en la evaluacion cuantizada pertenecen a la clase de decimales mezclados detectables programaticamente, que el runtime corrige con una guarda. No se menciona uso de RLHF ni DPO.

## Capacidades

- Generacion de texto conversacional breve en ingles a partir de datos estructurados: convierte un slice JSON de tipo profile, rating, momentum, results, news, follow-up, mood o transfer wire en una respuesta corta en lenguaje natural.
- Narracion deportiva de equipo: resumen de resultados, ratings, rachas de momentum, estado de animo del equipo y noticias asociadas.
- Conversaciones multi-turno dentro del contrato de Scoracle, incluyendo el tipo de prompt follow-up.
- Respeto de invariantes de producto: el modelo evita mencionar nombres de producto, detalles de transporte o equipos ajenos al slice proporcionado (100% de cumplimiento en la evaluacion retenida del autor).
- Grounding numerico: el 97,2% de los numeros generados en la evaluacion cuantizada estan respaldados por los datos de entrada; el resto se corresponde con la clase de decimales mezclados que el runtime rechaza y reintenta.
- No dispone de tool calling ni function calling declarados.
- No dispone de capacidades de agente, razonamiento multi-paso, vision, audio ni modo de pensamiento declaradas.
- No es multilingue: solo ingles.

## Casos de uso

- Narracion deportiva dentro de la app Scoracle para iOS: el modelo recibe el slice JSON de un equipo y devuelve una respuesta conversacional corta que se muestra al usuario; esta es la aplicacion para la que fue construido y la unica soportada explicitamente.
- Resumen de resultados de una jornada: a partir del slice results, generar una frase breve con el marcador y el contexto inmediato, sin introducir cifras que no esten en la entrada.
- Explicacion de una racha o tendencia: con el slice momentum, producir una descripcion del estado de forma del equipo en una o dos frases.
- Contexto de noticias del equipo: con el slice news, condensar los titulares estructurados en una respuesta legible sin anadir hechos externos.
- Respuestas de seguimiento en conversacion: con el slice follow-up, mantener el hilo de una consulta anterior apoyandose en los datos ya presentes en el contexto.
- Informe de estado animico o de vestuario: con el slice mood, narrar el clima interno del equipo a partir de los indicadores suministrados.
- Lectura de operaciones de mercado: con el slice transfer wire, describir movimientos de fichajes o rumores a partir de los datos estructurados, sin salirse del contrato.
- Integracion como capa de verbalizacion en un pipeline propio: cualquier aplicacion que disponga de datos deportivos estructurados y necesite convertirlos en texto puede reutilizar el modelo siempre que respete el chat template y proporcione uno de los ocho tipos de slice.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K o similares) en la informacion disponible. Los unicos datos de evaluacion son los de la evaluacion retenida del propio autor sobre su dataset, que no son comparables con benchmarks estandar:

| Metrica (evaluacion interna del autor) | Resultado |
|---|---|
| Numeros con grounding correcto (build 6-bit fusionada) | 97,2% |
| Invariante de nombre de producto | 100% |
| Invariante de detalles de infraestructura (plumbing) | 100% |
| Invariante de equipos extranjeros | 100% |
| Tamano del corpus de ajuste | 1.456 pares instruccion-respuesta |
| Equipos cubiertos en entrenamiento | 182 |
| Prompts de evaluacion retenida | 176 prompts, 22 equipos, 8 formas de prompt |

El autor indica explicitamente que estas cifras describen su dataset retenido y sus ajustes de runtime (temperature=0, maximo 220 tokens generados) y que no son resultados de benchmark general.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: alrededor de 1,1 GB de pesos en cuantizacion 6-bit, mas el overhead del runtime MLX y la cache KV (no cuantificada en la informacion disponible).
- Dispositivos objetivo: Apple Silicon. El modelo esta pensado para inferencia en el cliente iOS de Scoracle y para MLX, por lo que el rango natural incluye iPhone y iPad recientes, asi como Macs con chip M-series.
- GPU dedicadas (NVIDIA/AMD): no disponibles de forma nativa, ya que el formato distribuido es MLX Safetensors; no se proporciona ni se anuncia una version GGUF o equivalente.
- Cabe en hardware de consumo: si, en el ecosistema Apple Silicon, que es el soportado; no se documenta soporte para GPUs de consumo NVIDIA.
- Opciones de despliegue: MLX (libreria declarada) dentro del cliente iOS de Scoracle. No se documentan vLLM, llama.cpp, Ollama, TGI ni otros motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparativa se plantea frente al modelo base y a alternativas de la misma franja de tamano (1-2B). Los datos de las alternativas no provienen de la informacion proporcionada y deben verificarse en sus model cards oficiales; se marcan como no disponibles los campos que no se pueden confirmar aqui.

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Scoracle Articulator v4 Q6 | 1,46B (6-bit) | no disponible | Apache-2.0 | MLX Safetensors | Narracion deportiva con contrato de datos, on-device |
| ibm-granite/granite-4.0-h-1b (base) | no disponible en la informacion | no disponible | Apache-2.0 (segun el autor) | Safetensors | Modelo general de la familia Granite 4.0 H |
| Alternativas generales de ~1-2B (Qwen2.5-1.5B-Instruct, Llama 3.2 1B Instruct, SmolLM2-1.7B) | ~1,2B-1,7B | no disponible | Apache-2.0 o licencia comunitaria segun el caso | Safetensors, GGUF | Proposito general, instrucciones y chat |

Diferencias clave frente a esas alternativas: Scoracle Articulator no compite en conocimiento general ni en benchmarks abiertos, sino en adherencia estricta a un contrato de entrada y en evitar afirmaciones no respaldadas por los datos. Su ventaja es el tamano de descarga (~1,1 GB) y su integracion con MLX en iOS; su desventaja es que queda fuera de su dominio en cuanto se le pide algo distinto de narrar un slice de Scoracle.

## Limitaciones y advertencias

- Modelo de dominio estrecho: el autor advierte explicitamente que no es un modelo de conocimiento deportivo general y que no debe pedirsele informacion ausente en los datos de entrada.
- Solo ingles: el unico idioma declarado es en; no hay soporte multilingue.
- Riesgo de alucinacion fuera del contrato: puede generar texto inexacto si se usa con prompts que no siguen el chat template y los ocho tipos de slice previstos.
- Fallos de grounding residuales: en la evaluacion cuantizada, el 2,8% de los numeros no estaban respaldados por los datos. El autor los atribuye a la clase de decimales mezclados y depende de la guarda del runtime (rechazo y reintento de respuestas con decimales no soportados). Esa guarda debe permanecer activa en produccion; desactivarla elimina la principal proteccion contra numeros inventados.
- Ajustes de evaluacion concretos: las cifras declaradas se obtuvieron con temperature=0 y un maximo de 220 tokens generados; el comportamiento fuera de esos ajustes no esta documentado.
- Restricciones de licencia: la licencia del artefacto es Apache-2.0 y la del modelo base tambien se declara Apache-2.0, por lo que el uso comercial no presenta restricciones adicionales conocidas; conviene aun asi revisar los terminos del modelo base y de cualquier dato de entrenamiento de terceros.
- Formato cerrado a MLX: no se distribuye GGUF ni pesos para otros runtimes, lo que limita el despliegue fuera del ecosistema Apple.
- Validacion comunitaria practicamente nula: el repositorio registra 0 descargas y 1 like en el momento de la consulta, y no hay resultados de benchmarks independientes.
- Dependencia del ecosistema Scoracle: el repositorio incluye un `manifest.json` para el descargador de la app iOS, lo que sugiere que el mantenimiento y la compatibilidad estan ligados a ese producto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/albapepper/scoracle-articulator-v4-q6
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-h-1b
- Paper, blog o repositorio adicionales: no disponibles
- Demo: no disponible
- Resultados de busqueda web: la consulta no devolvio ningun resultado relevante sobre el modelo; los enlaces encontrados correspondian a listados de establecimientos de hosteleria en Amsterdam, sin relacion con Scoracle Articulator.
