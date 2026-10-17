# De-x-ter/historical-event-narrator-mistral-7b-lora

## Resumen

Historical Event Narrator es un adaptador LoRA para mistralai/Mistral-7B-v0.1 cuyo objetivo es reescribir un tema historico como una narracion vivida con un giro contrafactual, en lugar del resumen enciclopedico que tiende a producir el modelo base. Lo desarrolla el usuario De-x-ter (equipo de Keerthirajan Senthilkumar, Prithvi y Roshini) como proyecto final de la asignatura CS 6366 de la Universidad George Washington, otono de 2025.

El adaptador tiene 13,6 millones de parametros entrenables, aproximadamente el 0,19 % del modelo base de 7 000 millones, y se distribuye como pesos PEFT en safetensors. Se entreno sobre 1 200 articulos de historia de Wikipedia convertidos en ejemplos de narracion con giro sintetizados con Gemini 2.5 Flash, con un unico idioma de trabajo: ingles. El entrenamiento se hizo en un portatil Apple M4 Pro con MPS y coste cero.

Su relevancia es acotada y de caracter demostrativo: es un ejemplo reproducible de destilacion de datos sinteticos y ajuste fino ligero sobre hardware de consumo. La propia model card insiste en que las metricas publicadas son pruebas de humo, no un benchmark, y en que el modelo es ficcion por diseno. En el momento de la consulta el repositorio acumula 0 descargas y 1 like.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only, mistralai/Mistral-7B-v0.1 |
| Parametros totales | 13,6 M de parametros entrenables en el adaptador (0,19 % del modelo base); modelo base de 7 000 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Entrenamiento del adaptador: 128 tokens (prompt mas el inicio de la narracion). Contexto del modelo base: no indicado en la informacion proporcionada |
| Tipos de cuantizacion | El adaptador se publica en safetensors con pesos fp32; no se documentan cuantizaciones propias. La cuantizacion aplicable seria la del modelo base y no esta detallada en la model card |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA via libreria peft) |
| Tamano del repositorio | 0,1 GB |
| Modelo base | mistralai/Mistral-7B-v0.1 |
| Libreria | PEFT |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32, con dropout 0,05, aplicado sobre las proyecciones q_proj, k_proj, v_proj y o_proj del transformer base. Los pesos del adaptador se mantuvieron en fp32 sobre hardware Apple M4 Pro mediante MPS. El numero de parametros entrenables es de 13,6 M, un 0,19 % del total del modelo base, lo que confirma que el ajuste modifica el estilo de generacion sin alterar el conocimiento subyacente del modelo.

Los datos de entrenamiento consistieron en 1 200 articulos de historia de Wikipedia transformados por Gemini 2.5 Flash en ejemplos de narracion con giro contrafactual, divididos en 1 080 ejemplos de entrenamiento y 120 de prueba. El regimen fue de 3 epocas y 405 pasos, con batch size 2 y acumulacion de gradiente 4, learning rate 2e-4 y decaimiento lineal. Las secuencias se truncaron a 128 tokens. La perdida de entrenamiento paso de 2,31 a aproximadamente 0,85. No se documento uso de RLHF ni de DPO; el ajuste es exclusivamente supervisado sobre datos destilados.

## Capacidades

- Generacion de texto narrativo en ingles con registro literario y voz narrativa consistente en la apertura del texto.
- Reformulacion creativa de eventos historicos anadiendo un giro contrafactual ("que pasaria si"), que es el comportamiento objetivo del ajuste.
- Mejora medible sobre el modelo base en solapamiento con las referencias de estilo: ROUGE-1 de 0,212 a 0,296 y ROUGE-2 de 0,024 a 0,055 en la evaluacion del autor.
- Hereda del modelo base de Mistral-7B las capacidades generales de generacion de texto, comprension lectora y multilinguesidad limitada del modelo subyacente.
- No se documenta soporte de tool calling, function calling, uso agentico ni razonamiento multi-paso.
- No se documenta modo "thinking", vision ni audio.
- No se documenta ningun idioma distinto del ingles en el entrenamiento del adaptador.

## Casos de uso

- Generacion de contenido editorial de divulgacion historica: el adaptador transforma un tema seco en un texto con gancho narrativo, util para boletines, newsletters o blogs de historia siempre que se etiquete explicitamente como ficcion.
- Prototipado de narrativa alternativa en videojuegos y ficcion interactiva: sirve para producir aperturas de escena a partir de una lista de eventos historicos y una premisa contrafactual.
- Material didactico para ejercicios de pensamiento critico: el docente genera una narracion deliberadamente alterada y pide al alumnado identificar que hechos se han desviado de la historia real.
- Generacion de prompts de arranque para redaccion asistida: el texto devuelto se usa como borrador inicial que un periodista o escritor reescribe, aprovechando que el adaptador solo domina la voz y la apertura del relato.
- Experimentacion academica en destilacion de datos sinteticos: es un caso reproducible de ajuste fino LoRA sobre Apple Silicon que sirve como referencia docente para comparar coste, datos y resultados frente a metodos tradicionales.
- Pruebas de evaluacion de creatividad con LLM como juez: el pipeline del proyecto (adaptador mas juez Gemini) es reutilizable para estudiar la correlacion entre metricas automaticas tipo ROUGE y valoraciones humanas.
- Demostraciones de bajo coste en hardware de consumo: al necesitar unicamente un adaptador de 0,1 GB sobre un modelo de 7B, encaja en talleres donde no hay acceso a GPUs de datacenter.

## Benchmarks y rendimiento

Unicas metricas publicadas: ROUGE frente a las referencias escritas por Gemini, comparando el modelo base con el adaptador. La primera tabla usa 5 ejemplos reservados; la segunda, solo el adaptador sobre 20 ejemplos.

| Metrica | Base | Base + LoRA (n = 5) | Solo LoRA (n = 20) |
|---|---|---|---|
| ROUGE-1 | 0,212 | 0,296 | 0,351 |
| ROUGE-2 | 0,024 | 0,055 | no disponible |
| ROUGE-L | 0,138 | 0,148 | 0,168 |

El autor advierte de que n = 5 y n = 20 son demasiado pequenos para que los intervalos de confianza signifiquen algo, de que el prompt de evaluacion (`instruction\n\ntopic\n\n`) difiere del prompt de entrenamiento (`...Topic: ...\n\nNarrative:`) y de que ROUGE premia la coincidencia con una unica historia de referencia, un proxy debil para la escritura creativa. Las puntuaciones del juez LLM (creatividad, fundamento historico, calidad del giro) no se reportan por no estar calibradas contra valoraciones humanas. No hay datos de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa 0,1 GB; el requisito real lo marca el modelo base Mistral-7B-v0.1.
- VRAM estimada para inferencia en fp16: en torno a 14-15 GB, contando pesos y cache de activaciones (estimacion derivada del tamano del modelo base, no publicada por el autor).
- VRAM estimada con cuantizacion de 4 bits del modelo base: aproximadamente 4-6 GB, suficiente para GPUs de consumo como RTX 3060 de 12 GB, RTX 4070 o RTX 4090.
- En precision de 8 bits la horquilla se situa en torno a 8-9 GB, apta para RTX 3080/4080 y superiores.
- El autor entreno el adaptador en un portatil Apple M4 Pro con backend MPS, lo que demuestra que el ajuste y la inferencia caben en hardware de consumo.
- Opciones de despliegue: transformers mas peft (el flujo de la model card), y, fusionando el adaptador con el modelo base, cualquier runtime compatible con Mistral-7B como llama.cpp, Ollama, vLLM o TGI.
- La model card recomienda limitar siempre `max_new_tokens` porque el adaptador no ha aprendido a terminar los relatos por si solo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| historical-event-narrator-mistral-7b-lora | 13,6 M entrenables sobre 7B | 128 tokens de entrenamiento del adaptador; contexto del base no indicado | ROUGE-1 0,296 (n = 5) frente al base | Apache 2.0 | HuggingFace, 0 descargas |
| mistralai/Mistral-7B-v0.1 (modelo base, sin adaptador) | 7 000 M | No indicado en la informacion proporcionada | ROUGE-1 0,212 (n = 5) con el prompt de este proyecto | Apache 2.0 | HuggingFace |
| Otros adaptadores LoRA de escritura creativa sobre Mistral-7B | No disponible | No disponible | No disponible | Variable | No disponible |

No se dispone de datos comparativos con alternativas de la misma categoria en la informacion proporcionada; la unica comparacion verificable es la del propio autor frente al modelo base.

## Limitaciones y advertencias

- Contexto de entrenamiento muy corto: los ejemplos se truncaron a 128 tokens, de modo que el adaptador aprende sobre todo la voz y la apertura del relato; el texto posterior depende del comportamiento del modelo base.
- Ausencia de stop aprendido: los ejemplos truncados nunca contenian el token de fin de secuencia y el pad token era EOS, por lo que el modelo no cierra las historias por si solo. Es obligatorio acotar `max_new_tokens`.
- Ficcion por diseno: la salida se aparta deliberadamente de los hechos historicos y no debe usarse como fuente de datos veridicos.
- Sesgos heredados: el estilo y los sesgos proceden de Gemini 2.5 Flash y de los articulos de Wikipedia empleados como fuente, con la perdida de perspectiva que implica una unica familia de generacion sintetica.
- Evaluacion no concluyente: los ROUGE publicados se calculan sobre 5 y 20 ejemplos, con prompts de evaluacion distintos de los de entrenamiento y sin intervalos de confianza. El juez LLM no esta calibrado contra valoraciones humanas.
- Idioma: solo ingles. No hay evidencia de un comportamiento correcto en castellano ni en otros idiomas.
- Licencia: Apache 2.0 en el adaptador, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base y el origen de los datos de Wikipedia y de las salidas de Gemini 2.5 Flash utilizadas para el entrenamiento.
- Advertencia de produccion: cualquier uso en atencion al cliente, divulgacion o educacion exige revision humana, etiquetado como ficcion y verificacion factual externa.
- Madurez: repositorio con 0 descargas y 1 like; sin senales de mantenimiento ni de validacion por terceros.

## Enlaces

- HuggingFace: https://huggingface.co/De-x-ter/historical-event-narrator-mistral-7b-lora
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-v0.1
- Codigo y datos: https://github.com/Keerthirajan58/Historical-Event-Narrator
- Paper o articulo tecnico: no disponible
- Demo publica: no disponible en la informacion proporcionada (el proyecto menciona una aplicacion de demostracion, sin enlace)
