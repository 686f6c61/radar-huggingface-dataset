# mahounairo/metka-1.7b-gguf

## Resumen

Metka 1.7B es un modelo derivado de Qwen3-1.7B, publicado por el usuario mahounairo, especializado en una tarea muy concreta: generar etiquetas cortas en ingles que describan las llamadas a herramientas (tool calls) de un agente de programacion, es decir, la linea que una interfaz de terminal muestra en lugar del comando crudo. No es un modelo conversacional generalista ni un agente, sino un componente auxiliar que se ejecuta junto a un modelo grande y consume los recursos sobrantes de la maquina.

La relevancia practica esta en su tamano y velocidad: con 1.720.574.976 parametros y cuantizado a Q8_0 en formato GGUF para llama.cpp, produce una etiqueta en 57 ms en una RTX 4080 SUPER y en 1,2 s en un Ryzen 9 3900X usando solo CPU. Esto permite integrarlo en interfaces de agente sin competir por VRAM con el modelo principal.

El modelo se entrena mediante un LoRA de rango 8 sobre Qwen3-1.7B, fusionado y cuantizado, con un formato de prompt propio en texto plano (sin plantilla de chat) basado en etiquetas XML: `<tool>`, `<args>`, `<state>` y `<label>`. La licencia es Apache 2.0, heredada del modelo base, y el idioma declarado es unicamente ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue usa `-c 4096` |
| Tipos de cuantizacion | Q8_0 (GGUF); el modelo base admite otras cuantizaciones, no publicadas en este repo |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only denso, y se ajusta con un LoRA de rango 8 (alpha 16) aplicado a todas las capas lineales. El adaptador se fusiona con los pesos base y el resultado se cuantiza a Q8_0. Todo el entrenamiento, para ambas variantes de tamano (1.7B y 0.6B), se completo en menos de ocho horas de GPU en una unica RTX 3090.

El entrenamiento se realizo en tres etapas. La primera uso 22.482 ejemplos durante 2 epocas: llamadas a herramientas procedentes de sesiones de agentes de programacion ejecutadas en un sandbox, de un agente jugando a un benchmark de videojuegos y 2.813 llamadas de trayectorias de OpenHands. La segunda anadio una epoca con 3.569 llamadas construidas a partir de ejemplos de comandos de tldr-pages, para ampliar la cobertura de herramientas poco familiares. La tercera anadio otra epoca con las palabras del agente previas a cada llamada como contexto opcional (con razonamiento y texto, solo texto, o sin contexto, de forma aleatoria), de modo que el mismo modelo funciona con o sin esa informacion. Las etiquetas de entrenamiento fueron generadas por Qwen3.8-27B y Qwen4-Max a partir unicamente de la llamada, sin usar etiquetas de otros modelos.

La innovacion principal no es arquitectonica sino de formato: un prompt en texto plano sin plantilla de chat, con argumentos serializados como `json.dumps` de Python y truncados a 3.000 caracteres, y un contexto opcional limitado a los ultimos 400 caracteres del razonamiento del agente. El modelo distingue tres estados (running, finished, failed) y, para el pasado, recibe la etiqueta que escribio en estado running.

## Capacidades

- Generacion de etiquetas cortas en ingles para llamadas a herramientas de agentes de programacion (bash y herramientas de agente).
- Produccion de etiquetas en presente (mientras el comando se ejecuta), en pasado (al finalizar) y en forma de fallo.
- Uso opcional del contexto del agente (razonamiento y texto previos) para etiquetar el proposito de la llamada, no solo su efecto visible.
- Manejo de comandos que no se explican por si mismos: desensamblado en una direccion, volcados hexadecimales, escaneos de offsets.
- Funcionamiento sin contexto: la model card indica que rinde igual de bien sin contexto que con el.
- No se documentan capacidades de tool calling, agentes multi-paso, vision, audio, matematicas ni razonamiento general; el modelo esta entrenado exclusivamente para la tarea de etiquetado.
- Multilingue: no. Solo ingles.

## Casos de uso

- Interfaz de terminal para agentes de codigo: mostrar en cada fila de herramienta una etiqueta legible en lugar del comando crudo, actualizada al iniciar, finalizar o fallar la llamada. Es el caso de uso principal y el que motiva el modelo.
- Integracion en la extension pi: el repositorio `pi-tool-labels-metka` conecta el modelo con el agente pi, apuntando a un servidor llama-server local o descargando llama.cpp y el modelo automaticamente.
- Despliegue en hardware sobrante: al ocupar 1,8 GB en Q8_0 y responder en 57 ms en una RTX 4080 SUPER, puede convivir con el modelo grande en la misma maquina sin desplazarlo de la VRAM.
- Ejecucion en CPU en portatiles: 1,2 s por etiqueta en un Ryzen 9 3900X y 3,7 s en un ThinkPad X1 con i7-1185G7 a bateria, suficiente para etiquetado asincrono en segundo plano.
- Etiquetado de sesiones de depuracion y reversing: la evaluacion sobre una sesion de ingenieria inversa y modding de un juego obtuvo un 86% de etiquetas buenas sin contexto y un 91% con el razonamiento del agente, lo que lo hace util en flujos donde los comandos son cripticos.
- Filtrado de etiquetas de baja confianza: la extension pi oculta las etiquetas cuya probabilidad del token mas bajo cae por debajo de 0,15 y muestra el comando en su lugar, lo que permite usar el modelo como capa de presentacion robusta.
- Servidor compatible con la API de completions de OpenAI: el ejemplo `llama-server -m metka-1.7b-Q8_0.gguf -c 4096 --parallel 2 --port 11500` permite conectarlo a cualquier cliente que hable ese protocolo.

## Benchmarks y rendimiento

Evaluacion cualitativa sobre dos sesiones reales de agente no vistas en entrenamiento, con cada etiqueta calificada a ciegas por un juez independiente (Claude Opus 5.5) como buena, debil o erronea:

| Sesion | Buenas | Debiles | Erroneas |
|---|---|---|---|
| Reversing y modding de un juego (110 llamadas), sin contexto | 86% | 11% | 3% |
| La misma, con razonamiento y texto del agente | 91% | 8% | 1% |
| Construccion de un visor web (551 llamadas), sin contexto | 77% | 19% | 4% |
| La misma, con contexto, en vivo | 80% | 18% | 2% |

Rendimiento por hardware (tiempo mediano hasta la etiqueta sobre 40 comandos de una sesion real de agente, unos 100 tokens de prompt, de uno en uno y sin cache de prompt):

| Hardware | Tiempo por etiqueta |
|---|---|
| RTX 4080 SUPER | 57 ms |
| RTX 3070 | 90 ms |
| Ryzen 9 3900X, solo CPU | 1,2 s |
| ThinkPad X1 (i7-1185G7, a bateria), solo CPU | 3,7 s |
| Core i7-2700K (2011), solo CPU, sin AVX2 | 5,5 s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; el modelo no esta orientado a esas tareas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,9 GB para los pesos Q8_0 (repo de 1,8 GB) mas overhead de contexto; el ejemplo oficial usa `-c 4096 --parallel 2`.
- GPU recomendadas: RTX 4080 SUPER (57 ms) y RTX 3070 (90 ms) segun los datos del autor; cualquier GPU con al menos 3-4 GB libres deberia poder alojarlo.
- Cabe en GPU de consumo: si, incluidas tarjetas de gama media y baja con suficiente VRAM libre; tambien funciona enteramente en CPU.
- Opciones de despliegue: llama.cpp (`llama-server`), cualquier servidor compatible con la API de completions de OpenAI y la extension pi-tool-labels-metka. No se documentan vLLM, TGI ni Ollama.
- Latencia y throughput: 57-90 ms por etiqueta en GPU y 1,2-5,5 s en CPU; el autor indica que los comandos cortos son mas rapidos y que los largos (por ejemplo, un heredoc que escribe un fichero) tardan unos segundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| metka-1.7b-gguf | 1,72B | no disponible (ejemplo con 4096) | GGUF Q8_0 | Apache 2.0 | Etiquetado de tool calls de agentes |
| metka-0.6b-gguf | no disponible | no disponible | GGUF | Apache 2.0 (heredada) | Version ligera del mismo modelo, mismo autor |
| Qwen3-1.7B (base) | 1,72B | no disponible | safetensors y otras | Apache 2.0 | Modelo generalista de proposito multiple |

No se dispone de datos de benchmarks comparativos frente a otras alternativas de etiquetado de tool calls en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado y probado unicamente con etiquetas en ingles.
- Puede inventar un proposito que el comando no muestra, por ejemplo "around the new function" para un desensamblado sin contexto; la extension pi mitiga parte de estos casos ocultando etiquetas con probabilidad del token mas bajo inferior a 0,15.
- Los comandos compuestos largos reciben una etiqueta referida solo a su parte principal.
- Entrenado sobre shell de Linux y herramientas de agentes de programacion; otros dominios rendiran peor.
- El contexto opcional ayuda sobre todo cuando el comando no se explica por si mismo; en comandos autoexplicativos la diferencia esta dentro del ruido.
- No es un modelo conversacional ni un agente: no debe usarse para generacion general, razonamiento o tool calling.
- Licencia Apache 2.0, que permite uso comercial; conviene conservar los avisos de atribucion del modelo base Qwen3-1.7B y de los datasets tldr-pages y SWE-rebench OpenHands trajectories (CC BY 4.0).
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mahounairo/metka-1.7b-gguf
- Version ligera: https://huggingface.co/mahounairo/metka-0.6b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Extension para pi: https://github.com/mahounairo/pi-tool-labels-metka
- Agente pi: https://github.com/earendil-works/pi
- tldr-pages: https://github.com/tldr-pages/tldr
- Dataset SWE-rebench OpenHands trajectories: https://huggingface.co/datasets/nebius/SWE-rebench-openhands-trajectories
