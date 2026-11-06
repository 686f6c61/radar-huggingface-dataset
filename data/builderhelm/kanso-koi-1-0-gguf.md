# BuilderHelm/Kanso-Koi-1.0-GGUF

## Resumen
Kanso Koi 1.0 GGUF es la distribucion cuantizada en formato GGUF de Kanso Koi 1.0, un modelo especializado de limpieza de dictado desarrollado por ZenVoice y publicado por BuilderHelm. No es un modelo conversacional generalista: su unica funcion es transformar la salida cruda de un sistema de reconocimiento automatico del habla (ASR) en texto escrito limpio, preservando la formulacion y el significado del hablante. Resuelve un problema muy concreto de los pipelines de dictado: la puntuacion ausente, las mayusculas incorrectas, las muletillas, las autocorrecciones habladas y los numeros o direcciones escritos en forma oral.

Tecnicamente parte de Qwen3-1.7B, al que se le ha fusionado el adaptador LoRA de Kanso Koi 1.0, resultando en un transformer denso de 1.700 millones de parametros (2.031.739.904 parametros reales segun los safetensors del modelo base) con una longitud de contexto declarada de 32.768 tokens, aunque el autor indica que 1.024 tokens son suficientes para dictado. La relevancia actual esta en su enfoque on-device: con cuantizaciones de 1,28 GB (Q4_K_M) puede ejecutarse en CPU y en equipos de consumo mediante llama.cpp en Windows, Linux y macOS, sin depender de la nube.

El modelo esta pensado para integrarse como una etapa de postprocesado dentro de una aplicacion de dictado: recibe una unica locucion por peticion, sin historial de conversacion, y devuelve solo el texto limpio. Su licencia Apache 2.0 y su tamano reducido lo hacen adecuado para distribucion dentro de productos de escritorio.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-1.7B con adaptador LoRA de Kanso Koi 1.0 fusionado) |
| Parametros totales | 2.031.739.904 (1,7B nominales) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (1.024 suficientes para dictado) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0, F16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento
El modelo es un transformer denso derivado de Qwen3-1.7B. Sobre la base se entreno y fusiono un adaptador LoRA especifico para la tarea de limpieza de dictado, dando lugar a Kanso Koi 1.0, del que esta publicacion es la version cuantizada. La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; estos datos figuran como no disponibles.

La innovacion principal no es arquitectonica sino de especializacion y despliegue: el modelo opera con un system prompt fijo, decodificacion greedy (temperatura 0), un maximo de 200 tokens nuevos y el modo de razonamiento desactivado. El formato de prompt es ChatML con un bloque de pensamiento vacio y sin token BOS, que llama.cpp genera correctamente con `--jinja --reasoning off`. El autor advierte que los resultados solo se han medido con esta configuracion exacta. La distribucion incluye cinco cuantizaciones con checksums SHA-256 publicados, lo que facilita la verificacion de integridad en pipelines de distribucion.

## Capacidades
- Restauracion de puntuacion, mayusculas y limites de frase en texto procedente de ASR.
- Eliminacion de muletillas y reinicios falsos ("um", "well", arranques de frase descartados).
- Aplicacion de autocorrecciones habladas del tipo "monday sorry i meant tuesday".
- Normalizacion inversa de texto (ITN): conversion de numeros, importes monetarios, fechas, horas, URL y direcciones de correo a su forma escrita.
- Proteccion de texto sensible: nombres, rutas de fichero, identificadores de codigo y flags se mantienen sin cambios.
- Contexto de aplicacion opcional mediante una primera linea `app: <nombre>`, que adapta tono y mayusculas (por ejemplo, Slack).
- Salida restringida al texto limpio, sin comentarios.
- No soporta tool calling, uso de agentes, vision, audio ni modo de razonamiento activo; es un formateador de proposito unico, no un modelo de chat.

## Casos de uso
- Dictado de escritorio integrado en el sistema operativo: el modelo se ejecuta en local con llama.cpp y limpia cada locucion antes de insertarla en el campo de texto activo; su tamano de 1,28 GB en Q4_K_M permite empaquetarlo dentro de la aplicacion.
- Correccion de transcripciones de reuniones: se aplica sobre la salida de un ASR por segmentos para anadir puntuacion y eliminar muletillas, mejorando la legibilidad de las actas sin reescribir el contenido.
- Normalizacion de importes y fechas en entornos administrativos o financieros: convierte "eighteen dollars and sixty cents" en "$18.60" y expresiones habladas de fechas en su forma escrita, reduciendo errores de transcripcion manual.
- Procesamiento de notas de voz en movil o portatil sin conexion: al no requerir GPU dedicada ni servicio en la nube, encaja en flujos donde la privacidad impide enviar audio o texto a un tercero.
- Limpieza de comandos dictados en herramientas de desarrollo: al preservar rutas, identificadores y flags, puede procesar instrucciones habladas que contienen nombres de fichero o parametros de linea de comandos sin corromperlos.
- Adaptacion por aplicacion en asistentes de productividad: usando la linea `app:` se ajusta el tono y las mayusculas al contexto (chat de equipo, correo, editor de texto) dentro de una misma sesion de dictado.
- Postprocesado por lotes de transcripciones archivadas: con decodificacion greedy y 200 tokens maximos por peticion, el coste por segmento es bajo y predecible en CPU.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la metrica WER en los metadatos y afirma que Q5_K_M ofrece la mayor precision medida y que Q4_K_M es mas preciso que la version MLX, pero no se proporcionan cifras concretas de WER ni comparaciones numericas. Tampoco se detallan latencias ni throughput.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 1,3 GB en Q4_K_M, 1,5 GB en Q5_K_M, 1,7 GB en Q6_K, 2,2 GB en Q8_0 y 4,1 GB en F16 (tamanos de fichero; el consumo real anade overhead de contexto y del runtime).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente; el modelo esta disenado para ejecucion en CPU, por lo que no requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente todas las tarjetas actuales (RTX 3060, RTX 4060, RTX 4090, entre otras), y tambien en Apple Silicon mediante llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-server`), con compatibilidad de endpoints OpenAI; el autor documenta el arranque directo desde Hugging Face con `llama-server -hf BuilderHelm/Kanso-Koi-1.0-GGUF:Q4_K_M --jinja --reasoning off -c 1024`.
- Latencia y throughput: no disponibles. La configuracion recomendada limita la generacion a 200 tokens nuevos y un contexto de 1.024 tokens, lo que acota el coste por peticion.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Kanso Koi 1.0 GGUF | 1,7B | 32.768 | Limpieza de dictado (proposito unico) | Apache 2.0 | GGUF |
| Qwen3-1.7B | 1,7B | no disponible en la informacion | Modelo generalista base | Apache 2.0 | safetensors, GGUF |
| Kanso Koi 1.0 (original) | 1,7B | 32.768 | Limpieza de dictado | Apache 2.0 | MLX, safetensors (4 bits) |

La comparacion con alternativas especializadas en limpieza de dictado no esta disponible en la informacion proporcionada. Frente a Qwen3-1.7B, la diferencia es de especializacion: Koi esta afinado para una tarea concreta y su uso fuera de ella no esta respaldado por el autor.

## Limitaciones y advertencias
- Modelo de proposito unico: no debe emplearse como chatbot ni para generacion abierta; el autor lo describe explicitamente como formateador y no como modelo conversacional.
- Solo ingles: no hay soporte declarado de otros idiomas.
- Genera texto inventado ante entradas vacias o compuestas solo por espacios; es obligatorio descartar esas entradas antes de invocar el modelo.
- Los resultados solo estan validados con la configuracion exacta documentada: modo de razonamiento desactivado, temperatura 0, system prompt fijo, una locucion por peticion y sin historial. Desviarse de ella invalida las garantias de calidad declaradas.
- Requiere normalizacion Unicode NFC del texto de entrada.
- Riesgo de alucinacion en entradas ambiguas o muy alejadas del dominio de dictado; no se han publicado tasas de error ni evaluaciones independientes.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- Licencia Apache 2.0, que permite uso comercial, pero la licencia enlazada corresponde a Qwen3-1.7B; conviene revisar ambas condiciones antes de redistribuir.
- No dispone de soporte de tool calling, agentes, vision ni audio; la transcripcion ASR debe realizarla un componente externo.

## Enlaces
- Modelo GGUF en Hugging Face: https://huggingface.co/BuilderHelm/Kanso-Koi-1.0-GGUF
- Modelo base Kanso Koi 1.0: https://huggingface.co/BuilderHelm/Kanso-Koi-1.0
- Modelo Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Licencia de Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B/blob/main/LICENSE
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
