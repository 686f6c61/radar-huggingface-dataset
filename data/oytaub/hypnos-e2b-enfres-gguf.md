# oytaub/hypnos-e2b-enfres-GGUF

## Resumen

Hypnos E2B EN/FR/ES es un ajuste fino de tipo QLoRA sobre el modelo Gemma 4 E2B-it (a traves del espejo `unsloth/gemma-4-E2B-it`), publicado en formato GGUF Q4_K_M por el usuario oytaub. Su proposito es acotado y especializado: generar pasajes de guiones de relajacion guiada e hipnosis en ingles, frances y castellano, pensados para ejecutarse en local con llama.cpp. Cada llamada produce un bloque de aproximadamente 400 palabras con la estructura de la app Onira (profundizacion, metafora, sugerencias y anclaje).

El modelo se distribuye unicamente como GGUF cuantizado a Q4_K_M con importance matrix, con un peso de fichero de 1.651 MB, lo que lo situa en el rango de ejecucion en CPU o en GPU de consumo. El autor indica que el vocabulario se podo de 262.144 a 58.488 tokens para los tres idiomas cubiertos, y cifra el resultado en 2,99 B de parametros frente a los aproximadamente 5,1 B del modelo base completo. Los metadatos de HuggingFace, sin embargo, registran 2.490.996.259 parametros en safetensors, una discrepancia que no queda aclarada en la informacion disponible.

La relevancia actual del modelo es la de un caso de estudio de destilacion de dominio muy estrecho: en lugar de competir en capacidades generales, se evalua con un conjunto de validacion propio de 120 prompts sinteticos y obtiene un 95,8 % de cumplimiento de reglas automaticas, con el foco puesto en la privacidad (inferencia en el dispositivo) y en el control de restricciones mediante `logit_bias`. No se han publicado resultados en benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada del modelo base Gemma 4 E2B-it, solo la parte de texto; el autor no describe la arquitectura interna) |
| Parametros totales | 2.490.996.259 segun metadatos de safetensors; el autor indica 2,99 B tras la poda de vocabulario |
| Parametros activos | no aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M con importance matrix (1.651 MB). La ruta LiteRT-LM (.litertlm) en int4/int8 fue probada y descartada por bucles y degeneracion. No se publican otras cuantizaciones |
| Idiomas soportados | en, fr, es |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), plantilla de chat de Gemma embebida en el fichero |

## Arquitectura y entrenamiento

No se detalla en la informacion disponible la arquitectura interna del modelo base ni sus datos de preentrenamiento. Lo que si se documenta es el proceso de ajuste: un QLoRA con rango r=16 durante 3 epocas sobre 801 filas. De ellas, 375 son pasajes filtrados, 132 son pasajes nuevos escritos por Qwen3.5-9B, 150 son ejemplos de crisis y seguridad escritos a mano, y 48 son pasajes escritos por Claude con peso triplicado, centrados en las opciones de "sin respiracion" y "movilidad limitada". No se menciona el uso de RLHF ni de DPO.

La innovacion tecnica principal no esta en la arquitectura sino en el tratamiento del vocabulario y en el control de la generacion. El vocabulario se podo de 262.144 a 58.488 tokens para cubrir en, fr y es, lo que reduce el tamano del modelo respecto al base. Ademas, el autor impone restricciones del usuario ("sin palabras de respiracion", "movilidad limitada") en tiempo de generacion mediante `logit_bias` con una lista de identificadores de token a prohibir por idioma (`restriction_tokens.json`). Segun la model card, sin ese mecanismo el modelo incumple las restricciones entre un 10 % y un 40 % de las veces. La decodificacion tambien exige parametros concretos: temperatura 1.0, top_k 64 y top_p 0.95, ya que temperaturas mas bajas empeoran notablemente los bucles de repeticion; no se recomienda penalizacion por repeticion.

## Capacidades

- Generacion de pasajes de relajacion guiada e hipnosis de aproximadamente 400 palabras por llamada, con la estructura de bloques de Onira: profundizacion, metafora, sugerencias y anclaje.
- Generacion multilingue en ingles, frances y castellano, con deteccion de idioma correcta en 120 de 120 casos del conjunto de validacion.
- Produccion de prosa plana, sin formato enriquecido, segun las comprobaciones automaticas del autor.
- Respuestas de crisis que derivan a ayuda real o a servicios de emergencia: 33 de 33 prompts de crisis del conjunto de validacion; el formato corto de prosa se respeto en 32 de 33.
- Respeto configurable de restricciones del usuario mediante `logit_bias`: 0 violaciones registradas con las prohibiciones de token activas.
- Modo conversacional (etiqueta `conversational`) con plantilla de chat de Gemma embebida en el GGUF.
- Ejecucion en local con llama.cpp, incluida inferencia solo en CPU.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Generacion de guiones de autohipnosis en una app Android: el modelo fue construido especificamente para Onira, que escribe una sesion personalizada en el propio telefono y la lee en voz alta sin enviar datos a servidores externos. Es adecuado porque el fichero Q4_K_M ocupa 1.651 MB y puede ejecutarse sin conexion.
- Funciones de bienestar y mindfulness en aplicaciones moviles: generacion local de textos de relajacion en tres idiomas, con la ventaja de que el contenido sensible del usuario nunca sale del dispositivo.
- Cadena de sintesis de voz para meditacion guiada: los bloques de unas 400 palabras encajan como unidad de locucion, de modo que un motor TTS puede leer cada bloque completo sin cortes arbitrarios.
- Moderacion y derivacion en entornos de salud mental: con la puerta de palabras clave descrita en la documentacion del autor, el modelo puede generar respuestas breves que apuntan a ayuda profesional o a emergencias, en lugar de intentar aconsejar.
- Personalizacion por restricciones del usuario: en escenarios donde la persona pide evitar referencias a la respiracion o adaptarse a movilidad limitada, el uso de `logit_bias` con `restriction_tokens.json` permite imponer esas condiciones de forma fiable en tiempo de generacion.
- Investigacion sobre modelos de dominio estrecho en el borde: sirve como referencia reproducible para estudiar cuanto se puede reducir un modelo generalista mediante poda de vocabulario y QLoRA sin perder calidad en una tarea muy concreta.
- Despliegue en hardware sin GPU: al funcionar solo con CPU a unos 18,5 tokens/s en un equipo de escritorio con 4 hilos, es viable en servidores modestos o en equipos de sobremesa sin acelerador.
- Generacion de material multilingue en/fr/es desde un unico modelo, util para productos con catalogo en los tres idiomas que quieran evitar mantener tres modelos separados.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. El autor solo reporta una evaluacion propia sobre un conjunto de validacion de 120 prompts sinteticos, 33 de ellos peticiones de crisis, que nunca se uso para ninguna decision de entrenamiento:

| Metrica (conjunto de validacion de 120 prompts) | Resultado |
|---|---|
| Cumplimiento global de reglas automaticas (con prohibiciones de token activas) | 115/120 = 95,8 % (intervalo del 95 % aproximado: 90,6-98,2 %) |
| Idioma correcto | 120/120 |
| Peticiones de crisis que derivan a ayuda real o emergencia | 33/33 |
| Formato correcto en respuestas de crisis (prosa breve) | 32/33 |
| Violaciones de restricciones | 0 |
| Respuesta estilo crisis a una peticion benigna | 0/87 |
| Fallos restantes | 4 frases repetidas, 1 respuesta de crisis demasiado corta (37 palabras) |
| Iteraciones anteriores | v4: 89-92 %; v5 sin prohibiciones de token: 87-88 % |

La unica cifra de velocidad disponible es una medicion con `llama-bench` en un PC de escritorio, solo CPU, 4 hilos, con Q4_K_M: aproximadamente 18,5 tokens/s de generacion y 83 tokens/s de procesamiento de prompt. No hay mediciones en telefono. El autor advierte ademas que su conjunto de prueba es sintetico y generado por el mismo codigo que produjo los prompts de entrenamiento, por lo que el texto real de usuarios diferira.

## Requisitos de hardware

- Peso del fichero GGUF Q4_K_M: 1.651 MB. Es el dato mas fiable para dimensionar.
- VRAM estimada para inferencia: el modelo necesita al menos unos 2 GB solo para los pesos; con cache KV y sobrecarga del runtime es razonable reservar del orden de 3 a 4 GB para contexto corto. Es una estimacion a partir del tamano del fichero, no un dato publicado, y no puede afinarse mas porque se desconoce la longitud de contexto soportada.
- Cabe en GPU de consumo: si, con margen amplio en tarjetas con 6 GB o mas de VRAM (por ejemplo, RTX 3060, RTX 4060 o superiores). En GPUs de gama de entrada con 4 GB puede ser ajustado segun el contexto.
- Ejecucion sin GPU: verificada por el autor en CPU, solo con 4 hilos, a unos 18,5 tokens/s de generacion. No requiere acelerador.
- GPU profesionales: no son necesarias. No se han publicado mediciones en A100, H100 ni similares.
- Opciones de despliegue: llama.cpp es la ruta documentada y probada, incluido `llama-server` con la API `/v1/chat/completions`. La ruta LiteRT-LM (.litertlm) fue probada y descartada por degeneracion en int4 e int8. No se documenta compatibilidad con vLLM, TGI, Ollama ni LM Studio en la informacion disponible.
- Latencia y throughput: 18,5 tokens/s de generacion y 83 tokens/s de procesamiento de prompt en CPU de escritorio con 4 hilos. No hay datos de latencia en dispositivo movil, que es el objetivo declarado del modelo.
- Parametros de decodificacion obligatorios: temperatura 1.0, top_k 64, top_p 0.95, sin penalizacion por repeticion, mas `logit_bias` para aplicar las restricciones del usuario.

## Comparativa con modelos similares

No se han identificado en la informacion disponible modelos comparables de terceros especializados en generacion de guiones de hipnosis en formato GGUF. La comparacion se limita por tanto al modelo base y a la version anterior del mismo proyecto:

| Modelo | Parametros | Contexto | Formato y tamano | Licencia | Notas |
|---|---|---|---|---|---|
| hypnos-e2b-enfres (este modelo, v5 Q4_K_M) | 2,49 B segun safetensors; 2,99 B segun el autor | no disponible | GGUF Q4_K_M, 1.651 MB | apache-2.0 | Ajuste QLoRA especializado, vocabulario podado a 58.488 tokens, requiere logit_bias para las restricciones |
| unsloth/gemma-4-E2B-it (modelo base) | no disponible | no disponible | no disponible | apache-2.0 (espejo) | Modelo generalista de partida; el autor uso solo la parte de texto |
| Modelo anterior de Onira | no disponible | no disponible | GGUF, 2.588 MB | no disponible | Referenciado por el autor unicamente por su tamano; sin mas datos publicos |

## Limitaciones y advertencias

- No es un producto sanitario: el autor declara explicitamente que no ofrece consejo medico ni psiquiatrico y que no sustituye la atencion profesional.
- Sesgos conocidos: no se documentan evaluaciones de sesgo. Los textos de entrenamiento son sinteticos, generados por Qwen3.5-9B y Claude, ademas de ejemplos escritos a mano, lo que puede trasladar los sesgos de esos generadores.
- Riesgo de alucinacion: no se cuantifica. En el dominio previsto el riesgo relevante es la generacion de contenido inapropiado ante peticiones de crisis, motivo por el que el autor insiste en mantener el modelo detras de la puerta de palabras clave de la aplicacion.
- Restricciones no garantizadas por si solas: sin `logit_bias`, el modelo incumple las restricciones del usuario entre un 10 % y un 40 % de las veces. La prohibicion de tokens es obligatoria en produccion.
- Evaluacion de crisis muy limitada: se probo sobre unos 50 prompts sinteticos y las respuestas de referencia las escribio una IA sin revision por parte de un profesional de salud mental.
- Comprobaciones automaticas basadas en listas de palabras: una palabra prohibida usada en sentido figurado cuenta como fallo, y un error de significado no se detecta.
- Conjunto de prueba sintetico generado por el mismo codigo que los prompts de entrenamiento: el rendimiento con texto real de usuarios sera distinto y presumiblemente inferior.
- Procedencia de los datos de entrenamiento: los terminos de uso de Qwen3.5-9B y Claude en lo relativo al entrenamiento de otros modelos no han sido verificados por el autor. Deben comprobarse, junto con los terminos de la licencia de Gemma y del espejo, antes de publicar o redistribuir.
- Licencia del modelo: apache-2.0, pero el propio autor recomienda verificar la licencia upstream del modelo base antes de redistribuir los pesos. No se aclara si la discrepancia entre 2,49 B y 2,99 B de parametros afecta a la trazabilidad.
- Longitud de contexto no disponible, lo que impide planificar conversaciones largas o calcular el consumo de memoria de la cache KV.
- Estado de publicacion: el modelo aun no se ha integrado en la version publicada de la aplicacion Onira segun la propia model card.
- Idiomas: solo ingles, frances y castellano. No hay soporte documentado para otras lenguas, ni evaluacion fuera de esos tres idiomas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oytaub/hypnos-e2b-enfres-GGUF
- Modelo base (espejo): https://huggingface.co/unsloth/gemma-4-E2B-it
- Sitio web del proyecto Onira: https://onirahypno.com/
- Version en frances del sitio: https://onirahypno.com/fr/
- Version en castellano del sitio: https://onirahypno.com/es/
- Aplicacion en Google Play: https://play.google.com/store/apps/details?id=com.oytaub.mindease
- Ficheros citados en la model card (dentro del repositorio): `hypnos-e2b-enfres-q4_k_m.gguf`, `SHA256SUMS`, `restriction_tokens.json`, `README_USAGE.md`, `eval_outputs_v5_q4km_heldout_ban.jsonl` y `docs/CONTENT_SAFETY.md`
- No se han encontrado papers, articulos de blog, repositorios adicionales ni demos sobre este modelo en la busqueda web realizada. Los resultados devueltos por la busqueda no guardan relacion con el modelo y se han descartado.
