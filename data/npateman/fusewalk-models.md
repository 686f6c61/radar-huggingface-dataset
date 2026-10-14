# npateman/fusewalk-models

# Fusewalk models (npateman/fusewalk-models)

## Resumen
Fusewalk models es un repositorio de modelos ajustados (fine-tunes) publicados por el usuario npateman para Fusewalk, un juego de crafting. La tarea es muy concreta: dado un par de objetos, el modelo responde con el nombre del objeto o los objetos que resultan de combinarlos. Cada variante es un fine-tune del modelo base Qwen/Qwen3.5-4B, con LoRA fusionada en los pesos o ajuste completo, entrenado sobre el Fusewalk Codex, un conjunto de recetas de combinacion escrito a mano.

El repositorio contiene en la actualidad una unica variante publicada, 20261014-135949-qwen3.5-4b-v0.4, distribuida como GGUF cuantizado a 4 bits (Q4_K_M) para llama.cpp. El modelo tiene 4.205.751.296 parametros (unos 4,21 mil millones) y el fichero GGUF ocupa 2.583 MB, dentro de un repositorio de 2,7 GB. La licencia declarada es Apache 2.0, heredada del modelo base.

Su relevancia es la de un caso de uso acotado y verificable: en lugar de un asistente generalista, se trata de un modelo de dominio especifico, con una metrica propia de calidad ("Plausible") del 74% sobre pares reservados para evaluacion, un formato de prompt documentado y un fichero index.json con la plantilla exacta y las cadenas de parada de cada modelo. El repositorio no incluye datos de benchmarks generalistas publicados.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tune del modelo base Qwen/Qwen3.5-4B) |
| Parametros totales | 4.205.751.296 (aproximadamente 4,21 mil millones) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (4 bits), en formato GGUF para llama.cpp |
| Idiomas soportados | no disponible; la tarea se formula con nombres de objetos en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (unico formato publicado; no se distribuyen safetensors) |

## Arquitectura y entrenamiento
No se detalla la arquitectura interna en la informacion disponible mas alla de que cada modelo es un fine-tune del modelo base indicado en la tabla del repositorio, en este caso Qwen/Qwen3.5-4B. El ajuste se realizo sobre el Fusewalk Codex, un conjunto de recetas de combinacion de objetos escrito a mano, con el objetivo de que el modelo devuelva los nombres de los objetos que resultan de combinar dos objetos dados. Segun la model card, el ajuste fue mediante LoRA fusionada en los pesos, o bien un ajuste completo, y posteriormente el resultado se convirtio a GGUF y se cuantizo a 4 bits.

El formato de interaccion esta fijado por la plantilla del modelo base (etiquetas `<|im_start|>`, `<|im_end|>` y un bloque `<think>` vacio) y por una convencion de entrada estricta: los dos nombres de objeto van entre comillas, en orden alfabetico y unidos por ` + `. La respuesta esperada es uno o dos nombres entre comillas en la primera linea, y la generacion se detiene en el primer salto de linea. El fichero index.json del repositorio contiene la plantilla exacta en el campo `prompt_template`, con `{pair}` como marcador de posicion, junto con las cadenas de parada necesarias para cada modelo. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades
- Generacion de texto de dominio restringido: dado un par de objetos, devuelve el nombre de uno o dos objetos resultantes de su combinacion.
- Formato de salida controlado: uno o dos nombres entre comillas en la primera linea, con parada en el primer salto de linea.
- Conversacion basica en el sentido de seguir la plantilla de chat del modelo base (`conversational` figura entre las etiquetas del repositorio).
- Ejecucion local en CPU o GPU mediante llama.cpp, con cuantizacion de 4 bits.
- Compatibilidad con endpoints (`endpoints_compatible` figura entre las etiquetas del repositorio).
- No hay informacion disponible sobre soporte de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio, matemáticas o capacidades multilingues. La tarea documentada es unicamente la de combinacion de objetos.

## Casos de uso
- Asistente de crafting dentro del juego: el modelo recibe el par de objetos que el jugador ha seleccionado y devuelve el resultado de la combinacion, sirviendo como oraculo local de recetas sin consultar una base de datos externa.
- Autocompletado de recetas en la interfaz: al arrastrar dos objetos a la mesa de crafting, el modelo puede sugerir que se produce antes de que el jugador confirme la accion.
- Generacion de recetas plausibles para contenido nuevo: al anadir objetos o expansiones, el modelo puede proponer resultados coherentes para pares que no estan en el Codex original.
- Validacion y ampliacion de un dataset de recetas: comparar las respuestas del modelo con el Codex permite detectar pares ausentes, ambiguos o con multiples soluciones sensatas.
- Prototipado rapido de mecánicas de crafting en otros juegos o mods: el mismo esquema (par de entrada, resultado de salida) es reutilizable en cualquier sistema de combinacion de dos elementos.
- Despliegue embebido u offline: al tratarse de un GGUF Q4_K_M de 2.583 MB, puede ejecutarse en equipos sin GPU o en dispositivos con pocos recursos, sin conexion a red.
- Juguete de evaluacion de jueces LLM: el repositorio documenta una metrica de plausibilidad puntuada por un juez automatico, lo que lo hace util como caso de prueba para pipelines de evaluacion de modelos pequenos.

## Benchmarks y rendimiento
El repositorio solo publica una metrica propia, definida por el autor, sobre pares reservados fuera del entrenamiento. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

| Metrica | Definicion | Valor |
|---|---|---|
| Plausible (20261014-135949-qwen3.5-4b-v0.4) | Porcentaje de respuestas que tienen sentido segun un juez LLM, sobre pares reservados; el juez clasifica cada respuesta como buena, mash-up (los dos nombres pegados), debil o sin sentido, y solo se cuentan las buenas | 74% |
| MMLU | no disponible | no disponible |
| HumanEval | no disponible | no disponible |
| GSM8K | no disponible | no disponible |

No se dispone de resultados para la comparacion con modelos similares dentro de la informacion proporcionada.

## Requisitos de hardware
- Peso del fichero GGUF Q4_K_M: 2.583 MB, y repositorio completo de 2,7 GB.
- VRAM o RAM estimada para inferencia: en torno a 3 GB contando pesos mas sobrecarga de contexto y runtime; la cifra exacta no esta publicada.
- Ejecucion en CPU: viable con llama.cpp, dado el tamano del modelo y la cuantizacion de 4 bits.
- GPU de consumo: cabe en tarjetas con 4 GB o mas de VRAM, como una GTX 1650, RTX 3050 o equivalentes; se puede descargar por completo en una RTX 3060 o superior.
- GPU de centro de datos: funciona en A100, H100 y similares, aunque estan sobredimensionadas para un modelo de 4,2 mil millones de parametros cuantizado a 4 bits.
- Opciones de despliegue: llama.cpp (el ejemplo de la model card usa `llama-completion` con `-no-cnv`, `--temp 0` y `-n 24`), y cualquier runtime compatible con GGUF. No se documentan configuraciones para vLLM, TGI, Ollama u otros servidores en la informacion disponible.
- Latencia y throughput: no disponibles. La generacion esta limitada a 24 tokens en el ejemplo oficial y se detiene en el primer salto de linea, por lo que las respuestas son muy cortas, pero no se publican mediciones.

## Comparativa con modelos similares
No se han encontrado en la informacion disponible modelos comparables directos, porque se trata de un fine-tune de dominio muy especifico y no de un modelo de proposito general. La unica referencia documentada es el propio modelo base.

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato | Rendimiento publicado |
|---|---|---|---|---|---|---|
| 20261014-135949-qwen3.5-4b-v0.4 (este repositorio) | 4,21 mil millones | no disponible | Combinacion de dos objetos en un objeto resultante | apache-2.0 | GGUF Q4_K_M | 74% de respuestas plausibles en pares reservados |
| Qwen/Qwen3.5-4B (modelo base) | 4,21 mil millones (referencia del fine-tune) | no disponible | Proposito general | apache-2.0 (segun el repositorio de este fine-tune) | no disponible | no disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Dominio extremadamente restringido: el modelo no es un asistente general. Fuera del esquema "par de objetos entre comillas separados por ` + `", su comportamiento no esta documentado ni garantizado.
- Tasa de error medida: la metrica Plausible es del 74%, es decir, aproximadamente una de cada cuatro respuestas sobre pares reservados no se considera buena segun el juez utilizado. En produccion hay que prever respuestas debiles o sin sentido.
- Riesgo de alucinacion en los nombres: los resultados pueden ser objetos inventados o combinaciones de los dos nombres de entrada (categoria "mash-up" en la evaluacion del autor). No se debe tratar la salida como una fuente de verdad sin validacion contra el Codex.
- Ambiguedad intrinseca de la tarea: segun la propia model card, a menudo existe mas de una respuesta sensata, por lo que una discrepancia con el Codex no implica necesariamente un error.
- Evaluacion limitada: la unica metrica publicada se basa en un juez LLM sobre pares reservados, sin metricas estandar reproducibles ni detalles del conjunto de evaluacion.
- Dependencia del prompt: la plantilla exacta (etiquetas de chat, bloque `<think>` vacio, orden alfabetico, comillas) y las cadenas de parada son obligatorias. Desviarse de ellas degrada la salida. La propia documentacion remite a index.json para la plantilla de cada modelo.
- Idiomas: no se declaran idiomas soportados. El ejemplo y la tarea utilizan nombres de objetos en ingles; no hay evidencia de funcionamiento correcto con entradas en castellano.
- Uso comercial: la licencia declarada es Apache 2.0, pero el autor indica que las licencias y avisos de los modelos base se copian sin cambios en la carpeta licenses del repositorio, por lo que hay que revisar esas condiciones antes de un despliegue comercial.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, con una unica variante publicada etiquetada como v0.4. No hay senales de mantenimiento continuado ni de soporte de la comunidad.
- Contexto y arquitectura no documentados: al no publicarse la longitud de contexto ni detalles de la arquitectura, no se puede garantizar el comportamiento en conversaciones multi-turno o con entradas largas.

## Enlaces
- Pagina del modelo en HuggingFace: https://huggingface.co/npateman/fusewalk-models
- Fichero GGUF de la variante publicada: https://huggingface.co/npateman/fusewalk-models/resolve/main/20261014-135949-qwen3.5-4b-v0.4.gguf
- index.json con plantillas de prompt y cadenas de parada: https://huggingface.co/npateman/fusewalk-models/blob/main/index.json
- Carpeta de licencias de los modelos base: https://huggingface.co/npateman/fusewalk-models/tree/main/licenses
- Licencia del modelo base Qwen/Qwen3.5-4B copiada en el repositorio: https://huggingface.co/npateman/fusewalk-models/blob/main/licenses/Qwen--Qwen3.5-4B/LICENSE
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- llama.cpp, runtime utilizado en el ejemplo oficial: https://github.com/ggml-org/llama.cpp
- Nota sobre la busqueda web: los resultados devueltos corresponden a foros de poker (Winamax, Kill Tilt, Jeuxvideo) y no guardan ninguna relacion con este modelo. No se han encontrado papers, blogs, repositorios ni demos adicionales relevantes en la informacion disponible.
