# jatinbishla/Umless-Lite-0.8B-r3-GGUF

## Resumen

Umless Lite 0.8B r3 es un modelo de limpieza de dictado diseñado para convertir transcripciones en bruto de un reconocedor de voz en el texto que el hablante realmente quería decir. Lo desarrolla jatinbishla como componente del nivel Lite de Umless, una aplicación de dictado por voz de código abierto y totalmente local. El modelo parte de Qwen/Qwen3.5-0.8B, sobre el que se aplica un ajuste fino con LoRA que se fusiona en el checkpoint original y se cuantiza a Q4_K_M para llama.cpp.

El problema que resuelve es concreto: las transcripciones de reconocedores de voz pequeños contienen muletillas, tartamudeos, autocorrecciones y números escritos como palabras, además de errores propios del reconocedor (por ejemplo, "uh" transcrito como "all"). Umless Lite elimina esas disfluencias, corrige puntuación y mayúsculas, y escribe los números como dígitos, sin responder nunca al contenido: reescribe, no contesta. Es relevante porque demuestra que un modelo de menos de 800 millones de parámetros, ajustado con datos sintéticos y ejecutable en hardware de consumo, puede resolver una tarea de postprocesado de voz con latencias por debajo del segundo.

El modelo tiene 772.845.888 parámetros totales, se distribuye en formato GGUF (Q4_K_M) con un repositorio de 0,5 GB, está licenciado bajo Apache 2.0 y solo soporta inglés. No se han publicado datos sobre su longitud de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B, con proyecciones de atención completa y atención lineal) |
| Parametros totales | 772.845.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (única publicada en este repositorio) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer derivado de Qwen3.5-0.8B. La arquitectura base combina proyecciones de atención completa y de atención lineal, según se desprende de la descripción del ajuste fino, que aplica LoRA sobre "full-attention and linear-attention projections and the MLPs". El ajuste se realizó con LoRA de rango 16, alpha 32 y dropout 0,05, durante 1,5 épocas con batch efectivo de 32 y learning rate 2e-4, en una Google Colab T4 gratuita (el paso de fine-tune tarda entre 90 y 100 minutos). El adaptador se fusiona en el checkpoint original conservando el resto de tensores, se convierte a GGUF y se cuantiza a Q4_K_M con llama.cpp.

Los datos de entrenamiento son íntegramente sintéticos, sin datos de usuario. Qwen3-4B-Instruct-2507 genera el lado "limpio": mensajes cotidianos sobre 39 temáticas, peticiones habladas a asistentes de IA con el prompt que se pretendía, dictado con su versión formal pulida y 800 ejemplos de modo comando (pantalla + instrucción → respuesta). Un script deriva el lado "hablado y mal oído" de cada mensaje limpio: muletillas, tartamudeos, autocorrecciones en varias formas (en línea, "make that…", reinicios, a nivel de frase), números como palabras, mayúsculas perdidas y los errores típicos de Parakeet-110M. Como el texto limpio es el objetivo, las etiquetas son exactas por construcción y los nombres nunca aparecen mal escritos en las entradas, de modo que el modelo no aprende a inventar palabras que no oyó. Se descartaron los mensajes que compartían una secuencia de 5 palabras con los clips del benchmark o los pasajes de lectura.

## Capacidades

- Limpieza de dictado: elimina muletillas (incluidas las que un reconocedor pequeño confunde con palabras, como "uh" transcrito como "all"), tartamudeos y autocorrecciones, conservando solo la parte corregida.
- Corrección de puntuación, mayúsculas y formato numérico, escribiendo los números como dígitos ("$12,400", "10%").
- Modo formal: convierte el dictado en una versión pulida y formal del mensaje.
- Modo prompt de IA: reescribe una petición hablada al prompt que el usuario pretendía para un asistente.
- Modo comando: recibe el texto en pantalla más una instrucción hablada y devuelve el texto que hay que escribir.
- Está entrenado para reescribir, nunca para responder al contenido.
- No soporta tool calling, function calling, agentes, visión, audio ni capacidades multilingües más allá del inglés.

## Casos de uso

- Dictado local en aplicaciones de escritorio: el modelo se integra tras un reconocedor como Parakeet-TDT 110M para entregar texto limpio al usuario, con una latencia p50 de 986 ms en un Apple M5 con Metal y Q4_K_M.
- Postprocesado en pipelines de voz a texto: cualquier aplicación que reciba transcripciones en bruto puede insertar este modelo como etapa de normalización (muletillas, puntuación, números) antes de almacenar o mostrar el texto.
- Redacción de mensajes cotidianos por voz: el modo formal convierte un dictado coloquial en un mensaje pulido para correo o mensajería, manteniendo el contenido sin responder a él.
- Construcción de prompts para asistentes de IA: el modo prompt reescribe una petición hablada ("oye, pues hazme un resumen de esto y tal") en el prompt que el usuario quería, reduciendo la fricción de la entrada por voz.
- Automatización de escritorio por comandos de voz: el modo comando permite transformar el texto visible en pantalla según una instrucción hablada y escribir el resultado, útil en herramientas de accesibilidad o productividad.
- Prototipado y experimentación en investigación sobre limpieza de habla: al ser un modelo pequeño, con licencia Apache 2.0, datos sintéticos reproducibles y un notebook de Colab, sirve como base para estudiar ajuste fino con LoRA en tareas de reescritura controlada.
- Despliegue en hardware de consumo: al ocupar 0,5 GB en Q4_K_M y ejecutarse con llama.cpp, puede correr en equipos sin GPU dedicada o con GPU de gama media, lo que facilita aplicaciones de dictado totalmente locales y privadas.

## Benchmarks y rendimiento

Resultados del benchmark de Umless (`umless bench`): las grabaciones pasan por el reconocedor de Lite (Parakeet-TDT 110M) y después por el modelo de limpieza; la salida se puntúa contra lo que el hablante quería decir. El WER ignora mayúsculas, puntuación, formato numérico y muletillas. Ambas variantes se ejecutan tras las mismas reglas deterministas y la misma guarda de fidelidad. Entorno: Apple M5, Q4_K_M, Metal.

| Metrica | Qwen3.5-0.8B base, few-shot | Umless Lite 0.8B r3 |
|---|---|---|
| WER final, 11 clips sintéticos | 5,7% | 5,7% |
| WER final, voz del autor (5 pasajes leídos) | 13,6% | 14,0% |
| ↳ pasaje con corrección a nivel de frase ("…two thirty pm? Actually, no, let's make it Thursday morning") | 37,7% | 17,0% |
| Suite de texto de 30 casos (muletillas, correcciones, números, preguntas, estilos), aciertos | 25/30 | 23/30 |
| Tamano del prompt, mismo dictado de 13 palabras | 575 tokens | 77 tokens |
| Tiempo de limpieza p50, set de voz del autor (misma máquina y condiciones) | 1.079 ms | 986 ms |

El propio autor advierte de la lectura honesta de estos datos: empata con el modelo base en los clips sintéticos y está ligeramente por detrás en la voz del autor en conjunto, pero resuelve la autocorrección a nivel de frase que el base no resolvía, necesita un prompt de 77 tokens en lugar de 575 y fue el mejor modelo Lite en tareas de modo comando verificadas a mano (la ronda 2 inventó una persona en una respuesta de Gmail; la ronda 3 no).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en Q4_K_M (tamaño del repositorio), más el overhead de contexto de llama.cpp.
- GPU recomendadas: no requiere GPU dedicada; se ha validado en Apple M5 con Metal. Cualquier GPU consumer con al menos 2 GB de VRAM libre es suficiente para Q4_K_M.
- Cabe en GPU consumer: sí, en cualquier GPU moderna de gama baja o media (por ejemplo, GTX 1650, RTX 3050, RTX 4060) y en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp (formato nativo); también es compatible con endpoints según los tags del repositorio. No se indica soporte explícito de vLLM, TGI u Ollama en la información disponible, aunque al ser GGUF puede cargarse en herramientas compatibles con llama.cpp.
- Latencia y throughput: p50 de 986 ms para limpieza en Apple M5 con Q4_K_M y Metal, sobre el set de voz del autor. No se han publicado cifras de throughput (tokens/s) en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Umless Lite 0.8B r3 | 772.845.888 | no disponible | Limpieza de dictado (LoRA sobre Qwen3.5-0.8B) | Apache 2.0 | GGUF Q4_K_M |
| Qwen3.5-0.8B base (few-shot) | 0,8B (aprox.) | no disponible | Modelo generalista usado como referencia few-shot | no disponible en la informacion | no disponible en la informacion |
| Qwen3-4B-Instruct-2507 | 4B (aprox.) | no disponible | Generador de datos sintéticos del entrenamiento | no disponible en la informacion | no disponible en la informacion |

La comparación directa disponible es con el modelo base Qwen3.5-0.8B en modo few-shot, que sirve como referencia de rendimiento en el benchmark del autor. No se dispone de datos de otros modelos especializados en limpieza de dictado para una comparativa más amplia.

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas.
- El modo prompt aplana las listas ("first… second… third" se convierte en prosa) y ocasionalmente omite un requisito; por eso Umless mantiene Lite en limpieza simple dentro de aplicaciones de IA.
- Puede borrar de más: una palabra corta real que se parece a una muletilla mal oída se elimina ocasionalmente; la guarda de Umless recurre a la limpieza basada en reglas cuando la salida no es fiable.
- Está entrenado exclusivamente con datos sintéticos, lo que puede no cubrir la distribución real de errores de todos los reconocedores de voz.
- No es un modelo de propósito general: no responde preguntas ni mantiene conversaciones; su función es reescribir.
- Riesgo de alucinación limitado por diseño (no inventa nombres ni palabras no oídas según el autor), pero el borrado excesivo es el fallo documentado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de la licencia del modelo base Qwen3.5-0.8B, cuyos términos no se detallan en la información disponible.
- No se han publicado datos sobre longitud de contexto, sesgos o comportamiento fuera de la tarea de limpieza.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jatinbishla/Umless-Lite-0.8B-r3-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de Umless: https://github.com/jatinbishla/Umless
- Código de ajuste fino: https://github.com/jatinbishla/Umless/blob/main/finetune/lite_cleanup.py
- Notebook de Colab: https://github.com/jatinbishla/Umless/blob/main/finetune/Umless_Lite_finetune.ipynb
- Generador de datos sintéticos: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
