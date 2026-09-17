# somasekhar-dev/NextToken-model-2

## Resumen

NextToken-model-2 (también llamado SAM, Small Action Model) es un modelo de 272,7 millones de parámetros desarrollado por el usuario `somasekhar-dev` y publicado en HuggingFace. No es un chatbot generalista: está afinado específicamente para actuar como enrutador de acciones en el dominio de banca y NBFC (entidades financieras no bancarias indias). Dada una intervención del usuario en inglés, hindi, hinglish o código mezclado hindi-inglés, el modelo decide cuál de las 41 acciones bancarias predefinidas debe invocarse (si procede) y extrae los argumentos correspondientes en formato JSON.

El modelo parte de una base preentrenada solo en hindi e inglés —la misma arquitectura que `somasekhar-dev/NextToken-model-1`, pero con preentrenamiento independiente— y se somete a un fine-tuning completo (no LoRA) sobre aproximadamente 8.600 ejemplos sintéticos de tool calling bancario, más unos 1.900 ejemplos de capacidad general para mitigar el disparo espurio de herramientas. El esquema de herramientas no se pasa en el contexto: el modelo fue entrenado directamente sobre pares `(utterance → tool call)` y no necesita un system prompt con la lista de herramientas.

Su relevancia actual reside en su tamaño reducido y en su enfoque de especialización extrema: un modelo de menos de 300 millones de parámetros que resuelve una tarea de enrutamiento estructurado en un dominio regulado, con soporte nativo de codeswitching hindi-inglés y con un contexto de 2.048 tokens. El propio autor lo describe como un candidato en desarrollo (`gc_v2`), no como una versión final, y el repositorio se actualiza in-place.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3, checkpoint `Qwen3ForCausalLM`), GQA con 16 cabezas de consulta y 4 cabezas KV, RMSNorm + QK-norm por cabeza, FFN SwiGLU |
| Parametros totales | 272.780.288 (272,7 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo distribuye safetensors; no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Hindi (hi), inglés (en), hinglish y código mezclado hindi-inglés |
| Licencia | No disponible |
| Formato de pesos | Safetensors (repo de 1,1 GB; convertido a la arquitectura `Qwen3ForCausalLM`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con las siguientes particularidades técnicas: atención con grouped-query attention (GQA) de 16 cabezas de consulta y 4 cabezas de clave/valor, normalización RMSNorm combinada con QK-norm por cabeza, y feed-forward con activación SwiGLU. El tokenizador es el de `sarvamai/sarvam-1`, con un vocabulario de 68.096 entradas, adecuado para hindi e inglés. La longitud de contexto de entrenamiento es de 2.048 tokens, suficiente porque los ejemplos de entrenamiento son cortos, muy por debajo de ese límite. El checkpoint publicado se convirtió a `Qwen3ForCausalLM` y esa conversión se verificó numéricamente: 100 % de coincidencia de argmax frente al checkpoint original en formato de entrenamiento sobre entradas aleatorias, además de una prueba completa de guardado y recarga.

El entrenamiento consiste en un fine-tuning completo (no LoRA) desde una base preentrenada solo en hindi e inglés, usando datos generados sintéticamente con un modelo profesor autoalojado identificado en la model card como Gemma-4-12B. El conjunto de datos contiene aproximadamente 8.600 ejemplos de tool calling bancario (positivos, negativos y multi-turno) más un segmento de capacidad general de unos 1.900 ejemplos (continuación de texto, question answering, resumen y seguimiento de instrucciones), añadido explícitamente para corregir el fallo de invocar herramientas bancarias ante prompts no relacionados con banca. El esquema de herramientas cubre 41 herramientas en 9 categorías (información de cuenta, préstamos, transacciones, pagos/EMI, perfil/KYC, tarjetas, disputas, solicitudes de servicio y ciclo de vida de préstamos) y no se inyecta en el contexto: el modelo fue entrenado directamente sobre pares de intervención y llamada a herramienta.

Un detalle relevante de implementación: los ejemplos se tokenizaron codificando por separado cada segmento `User:`/`Assistant:` y concatenando después, en lugar de retokenizar la cadena completa de una vez. Durante el desarrollo se detectó y corrigió un desajuste real entre entrenamiento e inferencia por este motivo. Construir el prompt como f-string y tokenizarlo en una sola llamada funciona para un prompt nuevo de un solo turno, pero al extenderlo a una aplicación multiturno conviene replicar la tokenización por segmentos.

## Capacidades

- Enrutamiento de intenciones a herramientas: selecciona una de 41 acciones bancarias predefinidas o devuelve `{"tool": null}` si ninguna aplica.
- Extracción de argumentos en JSON: extrae parámetros como `loan_type`, `card_last4` o `reason` a partir de la intervención del usuario.
- Slot-filling multiturno: formula una pregunta de aclaración cuando falta un argumento obligatorio y resuelve la llamada con la respuesta de seguimiento.
- Supresión de acciones: está entrenado para no disparar acciones ante formulaciones hipotéticas, en pasado o en tercera persona (con fiabilidad desigual, ver limitaciones).
- Multilingüismo funcional: inglés, hindi, hinglish y código mezclado hindi-inglés en la misma conversación.
- Generación de texto general: continuación, question answering, resumen y seguimiento de instrucciones básicas, como capacidad secundaria.
- Salida estructurada sin esquema en contexto: no requiere system prompt con la definición de herramientas ni generación condicionada por esquema.
- Compatibilidad con tool calling / function calling: etiquetado explícitamente por el autor y orientado a pipelines que consumen JSON.
- No dispone de capacidades de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Enrutamiento de intenciones en atención al cliente bancaria: el modelo recibe la frase del cliente en hindi, inglés o hinglish y devuelve la llamada a herramienta correspondiente, lo que permite conectar directamente con un backend de acciones sin pasar por un LLM de mayor tamaño.
- Recogida de datos por slot-filling en flujos de EMI y préstamos: cuando el usuario dice "quiero pagar mi EMI" sin especificar el préstamo, el modelo pide la aclaración necesaria y resuelve la herramienta con la respuesta de seguimiento, cubriendo diálogos de varios turnos dentro de los 2.048 tokens de contexto.
- Capa de guardarraíl previa a un modelo grande: al ser un modelo de 272,7 M de parámetros, puede actuar como clasificador determinista (decodificación greedy) que filtra, etiqueta y normaliza cada intervención antes de invocar un modelo mayor, reduciendo coste y latencia en el pipeline.
- Prevención de ejecución de acciones en contextos no accionables: en escenarios donde el cliente plantea hipótesis ("¿y si cancelo mi préstamo anticipadamente?") el modelo devuelve `tool: null`, evitando que un sistema automatizado ejecute operaciones no solicitadas; según el autor, las formulaciones hipotéticas se rechazan de forma fiable.
- Soporte multilingüe para mercados indios: NBFC y bancos que atienden a usuarios que alternan hindi e inglés en la misma frase pueden desplegar un único modelo en lugar de mantener clasificadores separados por idioma.
- Registro y auditoría de intenciones: la salida JSON estructurada permite almacenar trazas legibles por máquina de cada decisión del modelo, útil en entornos regulados donde se exige justificar por qué se ejecutó (o no) una acción financiera.
- Despliegue en infraestructura limitada o en las instalaciones del cliente: por su tamaño, cabe en GPUs de consumo e incluso en CPU, lo que facilita escenarios on-premise con requisitos de residencia de datos.
- Evaluación comparativa de datos sintéticos: sirve como banco de pruebas para medir hasta qué punto un modelo profesor de 12.000 millones de parámetros puede destilar una tarea estructurada en un alumno de 272,7 M.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye métricas cuantitativas de MMLU, HumanEval, GSM8K ni de exactitud de selección de herramienta. La única verificación numérica reportada es de carácter técnico, no de calidad: 100 % de coincidencia de argmax entre el checkpoint convertido a `Qwen3ForCausalLM` y el checkpoint original en formato de entrenamiento sobre entradas aleatorias, más una prueba de guardado y recarga completa.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo teórico sobre 272,7 M de parámetros, sin contar activaciones ni caché KV): en FP32, aproximadamente 1,1 GB; en BF16/FP16, aproximadamente 0,55 GB; en int8, aproximadamente 0,27 GB; en int4, aproximadamente 0,14 GB. El repositorio ocupa 1,1 GB, consistente con pesos en precisión completa.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en GPUs de portátil con 4 GB o más de VRAM, e incluso en CPU con suficiente memoria RAM.
- GPU de centro de datos (A100, H100, L40S) no son necesarias para inferencia; solo tendrían sentido para servir muchas réplicas concurrentes o para reentrenamiento.
- Con contexto de 2.048 tokens y solo 4 cabezas KV por capa, la caché KV es pequeña, lo que permite un número elevado de sesiones concurrentes por GPU.
- Opciones de despliegue: `transformers` (soporte nativo, ejemplo incluido en la model card), text-generation-inference (el modelo está etiquetado como `text-generation-inference` y `endpoints_compatible`), y vLLM o SGLang mediante la arquitectura `Qwen3ForCausalLM`. Para llama.cpp u Ollama sería necesaria una conversión manual a GGUF, que no se distribuye oficialmente.
- Latencia y throughput estimados: no disponibles.
- Recomendación práctica de decodificación: el ejemplo del autor usa `do_sample=False` (greedy) con `max_new_tokens=60`, adecuado para salidas JSON cortas y reproducibles.

## Comparativa con modelos similares

No se dispone de benchmarks publicados de este modelo, por lo que la comparación de rendimiento no puede establecerse con datos verificados. La comparación se limita a características estructurales. Los datos de los modelos alternativos provienen de conocimiento general y deben verificarse en sus propias fichas antes de tomar decisiones.

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NextToken-model-2 (SAM) | 272,7 M | 2.048 | Enrutamiento de acciones bancarias en hindi/ingles, 41 herramientas | No disponible | HuggingFace, safetensors |
| Modelos pequeños generalistas de ~270-600 M (por ejemplo, variantes tipo Qwen3 o Gemma de esa escala) | 270 M - 600 M | Tipicamente 8.000-32.000 | Proposito general, requieren esquema de herramientas en contexto | Apache-2.0 o licencia propia segun familia | HuggingFace, GGUF, cuantizaciones multiples |
| Modelo 1 de la misma familia (`somasekhar-dev/NextToken-model-1`) | No confirmado | No disponible | Base preentrenada hindi-ingles, sin fine-tuning de acciones | No disponible | HuggingFace |

La diferencia funcional clave frente a los modelos generalistas de tamaño similar es que NextToken-model-2 no necesita que se le describan las herramientas en el prompt: la asociacion intervencion-herramienta esta internalizada en los pesos, a costa de perder flexibilidad para anadir o modificar herramientas sin reentrenar. Tampoco se publican cuantizaciones GGUF, lo que lo situa en desventaja frente a alternativas generalistas para despliegue en llama.cpp u Ollama.

## Limitaciones y advertencias

- Supresion de negativos inconsistente: en formulaciones en pasado ("I already updated my address...") y en tercera persona ("can someone else...") el modelo a veces rechaza correctamente la accion y a veces no. Las formulaciones hipoteticas ("what if I closed my loan early") si se rechazan de forma fiable segun el autor.
- Valores de argumentos en texto libre poco fiables: al pedirle actualizar un correo electronico, el modelo puede generar un valor verosimil pero incorrecto en lugar de copiar literalmente la cadena de la intervencion. Cualquier argumento de texto libre debe validarse contra la fuente.
- Capacidad general debil: aunque se corrigio en gran medida el fallo de disparar herramientas bancarias ante prompts no relacionados, la calidad de contenido en tareas ajenas a banca (conocimiento general, redaccion abierta) sigue siendo baja y la correccion no es 100 % fiable.
- Riesgo de alucinacion en JSON: al tratarse de un modelo pequeno entrenado sobre datos sinteticos, puede producir nombres de herramienta o claves de argumento plausibles pero no existentes; se recomienda validar la salida contra el esquema real de las 41 herramientas.
- Contexto limitado a 2.048 tokens: no apto para conversaciones largas o documentos extensos sin gestion externa del historial.
- Cobertura de idiomas restringida a hindi e ingles (incluido el codigo mezclado). No hay soporte declarado de otras lenguas, incluido el castellano.
- Licencia no disponible: la ausencia de licencia explicita impide asumir permisos de uso comercial, modificacion o redistribucion. Es un bloqueante para produccion hasta que el autor la especifique.
- Advertencia explicita del autor: toda accion que modifique estado debe confirmarse antes de ejecutarse y no debe confiarse a la salida de una sola inferencia del modelo.
- Modelo en desarrollo (`gc_v2`): el repositorio se actualiza in-place, por lo que los pesos pueden cambiar sin que cambie la URL. Conviene fijar una revision concreta en produccion.
- Traccion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa independiente.
- Convencion de tokenizacion no trivial: el prompt debe construirse respetando la tokenizacion por segmentos de `User:`/`Assistant:`; un multiturno construido concatenando cadenas sin mas puede degradar el resultado.
- No se distribuyen cuantizaciones ni versiones GGUF, AWQ o GPTQ, lo que limita las opciones de despliegue en entornos con restricciones de memoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/somasekhar-dev/NextToken-model-2
- Tokenizador utilizado (`sarvamai/sarvam-1`): https://huggingface.co/sarvamai/sarvam-1
- Modelo base de la familia (`somasekhar-dev/NextToken-model-1`): https://huggingface.co/somasekhar-dev/NextToken-model-1
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo; las coincidencias devueltas corresponden a foros y hilos de soporte sin relacion con la ficha.
