# litillabs/litil-financing-review-9b

## Resumen

LiTiL Financing Review 9B es un adaptador LoRA de tipo PEFT publicado por LiTiL Labs (litillabs) sobre el modelo base Qwen/Qwen3.5-9B. No es un modelo completo, sino un ajuste fino supervisado de rango bajo que se carga encima de los pesos base de Qwen3.5-9B. Su proposito es acotado y muy especifico: comparar un term sheet de financiacion con un borrador de documentacion de transaccion, senalar las divergencias entre el termino acordado y el redactado, citar las secciones suministradas y proponer una correccion concisa en formato de memo Markdown.

El problema que aborda es el de la revision de primera pasada en operaciones de financiacion (preferencia de liquidacion, periodos de notificacion, tamano del pool de opciones, composicion del consejo, etc.). En lugar de pedir al equipo de deal que lea linea por linea, el adaptador genera una lista de incidencias que puede mostrarse junto al texto fuente para que un humano verifique la comparacion. Se distribuye con licencia Apache 2.0 y esta etiquetado por el autor como experimental.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de uso vertical (legal/financiero) sobre un modelo de ~9B parametros, con un adaptador de ~116 MB facil de desplegar. Por otro, conviene subrayar que el propio autor presenta la evaluacion como una diagnostica de cuatro casos sobre extractos cortos, y no como una estimacion de precision sobre conjuntos documentales completos. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se han publicado resultados de benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer de arquitectura de texto; el autor la describe como "text architecture" |
| Parametros totales | Modelo base Qwen/Qwen3.5-9B (~9B); el adaptador no publica recuento de parametros entrenables |
| Parametros activos | No aplica (no es MoE; es un adaptador LoRA) |
| Longitud de contexto | No disponible en la informacion proporcionada; la configuracion de entrenamiento guardada fija una longitud de secuencia de 512 tokens |
| Tipos de cuantizacion | No disponible; el adaptador es un fichero LoRA y el runtime probado fue BF16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, formato PEFT LoRA (requiere los pesos base de Qwen/Qwen3.5-9B) |
| Tamano del adaptador | ~116 MB (repositorio de 0,1 GB) |
| Hiperparametros LoRA | rango 16, alpha 32, dropout 0,05, sobre proyecciones de atencion y MLP |
| Modelo base | Qwen/Qwen3.5-9B (snapshot probado: c202236235762e1c871ad0ccb60c8ee5ba337b9a) |
| SHA-256 del adaptador | 8c16a9fb79f31499cf9d4eb05a120048f20aa3d77e80f54ccac76ee84d517cca |
| Runtime probado | Apple MPS, BF16, Transformers 5.9.0, PEFT 0.19.1 |
| Pipeline | text-generation (conversational) |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT LoRA de rango 16 y alpha 32, con dropout 0,05, aplicado sobre las proyecciones de atencion y de MLP del modelo base Qwen3.5-9B. El ajuste fue supervisado (SFT) y consumio 88 ejemplos sinteticos de financiacion, con 25 pasos de optimizacion ejecutados sobre Apple Silicon. La configuracion de entrenamiento guardada establece una longitud de secuencia de 512 tokens. El adaptador se distribuye como un fichero de aproximadamente 116 MB y se corresponde con el run denominado "M5", distinto de las variantes de financiacion Dense y FullGold mencionadas por el autor.

Los datos de entrenamiento son integramente sinteticos y generados por un generador autorado por el propio equipo; el autor afirma que la reconstruccion cubre las 88 filas posteriores al entrenamiento y que el generador no lee ninguna fuente privada, por lo que no hay datos de clientes ni de usuarios en el conjunto revisado. Un detalle de implementacion relevante para la reproducibilidad es que el prompt de entrenamiento usa cadenas literales de rol `<|system|>`, `<|user|>` y `<|assistant|>`, que el runner conserva tal cual. No se documentan en la informacion disponible fases de RLHF o DPO, ni innovaciones de decodificacion como decodificacion especulativa o atencion lineal.

## Capacidades

- Comparacion de clausulas: recibe un termino acordado (term sheet) y la provision correspondiente del borrador, y devuelve la diferencia detectada, las secciones fuente y una correccion propuesta.
- Generacion de memos estructurados en Markdown, con listas de incidencias de primera pasada.
- Cobertura demostrada de terminos concretos de financiacion: preferencia de liquidacion, periodos de notificacion, tamano del pool de opciones y provisiones de composicion del consejo.
- Citas de las secciones suministradas: el memo referencia etiquetas de seccion explicitas (`Term sheet §1`, `Draft charter §2`).
- Control de longitud de la respuesta: en el ejemplo registrado respeta la instruccion de un memo de como maximo 100 palabras.
- Generacion de texto conversacional (pipeline text-generation con etiqueta conversational).
- Capacidad multilingue: limitada al ingles segun la etiqueta de idioma del repositorio.
- No se documentan en la informacion disponible capacidades de vision, audio, tool calling o function calling, ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Revision de primera pasada de un term sheet frente al borrador de estatutos: se extraen las provisiones relevantes de ambos documentos y el adaptador produce un memo de incidencias que el equipo de deal revisa junto al texto fuente.
- Control de consistencia de la preferencia de liquidacion: se contrasta el multiplicador y el caracter (participativa o no participativa) acordado en el term sheet con el redactado en el borrador; el ejemplo registrado documenta exactamente este caso (1x no participativa frente a 2x participativa).
- Verificacion de periodos de notificacion y plazos: se comparan las ventanas temporales acordadas con las redactadas, y el memo senala la discrepancia para su correccion en el borrador.
- Revision del tamano del pool de opciones: se contrasta el porcentaje acordado con el reflejado en los documentos de transaccion, generando una incidencia con la cifra corregida.
- Comprobacion de la composicion del consejo: se valida que el numero y la designacion de consejeros del borrador coinciden con lo pactado.
- Preparacion de listas de incidencias para due diligence: el adaptador puede generar memos acotados por termino, mostrables junto al lenguaje fuente, para que el equipo confirme o descarte cada punto.
- Documentacion de discrepancias entre versiones de un mismo borrador: alimentando pares de provisiones etiquetadas, se obtiene un resumen de diferencias util como registro de cambios.

Advertencia transversal a todos los casos: el ambito demostrado son extractos cortos y etiquetados, no un closing set completo. El autor indica explicitamente que el modelo no debe rellenar terminos de deal ausentes y que las citas y correcciones propuestas deben verificarse contra los documentos suministrados.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son una diagnostica interna de cuatro casos, ejecutada con el modelo base completo sobre Apple MPS en generacion greedy. No son benchmarks estandar comparables (MMLU, HumanEval, GSM8K u otros) y no se han publicado resultados de dichos benchmarks en la informacion disponible.

| Diagnostico | Resultado observado |
|---|---|
| Cuatro comparaciones suministradas | Comparacion central correcta en 4/4 primeras respuestas |
| Seguimiento focalizado sobre preferencia de liquidacion | Correccion completa en 57 tokens generados |
| Comparacion contra el modelo base emparejado | Calidad de respuesta final: inconclusa |
| Limite de generacion en el seguimiento | 1024 tokens con parada en frontera de rol para ambas ramas; el base no produjo su memo final dentro de ese limite |

El propio autor advierte que estos ejemplos cortos demuestran un estilo de respuesta utilizable, pero no estiman la precision sobre documentos de financiacion reales.

## Requisitos de hardware

- Espacio en disco para el adaptador: aproximadamente 116 MB, mas el repositorio de documentacion (0,1 GB en total).
- Requiere ademas los pesos base de Qwen/Qwen3.5-9B, que deben obtenerse por separado junto con el tokenizer.
- VRAM estimada para el modelo base de ~9B (estimaciones estandar de calculo, no publicadas por el autor): aproximadamente 18-20 GB en BF16, 9-11 GB en cuantizacion de 8 bits y 5-6 GB en cuantizacion de 4 bits. El adaptador apenas anade huella de memoria sobre los pesos base.
- GPU recomendadas en BF16: A100 40 GB, H100 80 GB, L40S 48 GB o A6000 48 GB. En consumer, una RTX 4090 (24 GB) o RTX 3090 (24 GB) puede alojar el modelo en BF16 con poco margen de contexto; con cuantizacion de 8 o 4 bits cabe con holgura en GPUs de 8-12 GB.
- Compatibilidad consumer: si, el modelo base cabe en GPU de consumo, especialmente cuantizado; no se han publicado ficheros GGUF oficiales del adaptador.
- Despliegue: el autor probo Apple MPS en BF16 con Transformers 5.9.0 y PEFT 0.19.1, e incluye un `demo.py` con `--base` y `--adapter`. Existe el fichero `requirements.txt` con las dependencias probadas. No se documenta soporte verificado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles mas alla del dato de 57 tokens generados en el seguimiento focalizado sobre Apple MPS.

## Comparativa con modelos similares

No se han proporcionado datos de modelos alternativos comparables (adaptadores legales de revision de contratos, LoRA financieros u otros). La informacion disponible solo permite comparar el adaptador con su propio modelo base.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LiTiL Financing Review 9B | Adaptador LoRA sobre base de ~9B | No disponible (entrenado a 512 tokens) | 4/4 comparaciones correctas en diagnostica interna; comparacion contra el base inconclusa | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-9B (base) | ~9B | No disponible | No produjo el memo final dentro del limite de 1024 tokens en el seguimiento | No disponible en la informacion proporcionada | HuggingFace |
| Otras alternativas | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Alcance muy restringido: el modelo esta disenado para comparar extractos cortos y etiquetados, no documentos de cierre completos. El autor indica explicitamente que el ambito demostrado es de fragmentos cortos.
- Datos de entrenamiento sinteticos y muy reducidos: 88 ejemplos y 25 pasos de optimizacion. Es plausible un sobreajuste al formato y al vocabulario del generador sintetico del autor.
- Etiquetado como experimental por el propio autor, con 0 descargas y 0 likes en el momento de la consulta.
- Riesgo de alucinacion: el modelo puede rellenar terminos de deal ausentes. La guia de uso pide verificar el lenguaje citado y cualquier correccion propuesta contra los documentos suministrados.
- Evaluacion insuficiente: la diagnostica de cuatro casos no permite estimar precision ni exhaustividad sobre documentos reales; la comparacion contra el modelo base quedo inconclusa porque el base no termino su memo en 1024 tokens.
- Idioma: solo ingles. No se declara soporte de castellano ni de otros idiomas.
- Dependencia del prompt exacto: es necesario preservar las cadenas literales de rol `<|system|>`, `<|user|>` y `<|assistant|>` y detener la generacion en la siguiente frontera de rol para obtener un unico memo.
- Licencia Apache 2.0 en el adaptador: permite uso comercial, pero conviene verificar por separado la licencia y las condiciones de los pesos base Qwen/Qwen3.5-9B, no detalladas en la informacion proporcionada.
- Aviso profesional: la salida no constituye asesoramiento juridico; en produccion debe insertarse siempre un paso de revision humana sobre las citas y correcciones.
- La documentacion incluida en el repositorio es material informativo, no contiene los ficheros del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/litillabs/litil-financing-review-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de inferencia preparado con `demo.py`, `examples.json`, `recorded_examples.json` y `requirements.txt`: incluido en el repositorio de HuggingFace del modelo
- Paper, blog tecnico, repositorio de codigo independiente o demo publica: no disponibles en la informacion proporcionada
- Resultados de busqueda web: no contienen ninguna referencia relevante al modelo (los resultados devueltos tratan sobre recetas de cocina y no guardan relacion con el objeto de esta ficha)
