# episod/minimax-music3-fiona-crapple-blackhole

## Resumen

minimax-music3-fiona-crapple-blackhole es un paquete complementario (companion) publicado por el usuario episod para ejecutar en hardware Tenstorrent p150 una variante afinada de MiniMax Music 3, un modelo de generación de música condicionado por letra y descripción textual. El modelo subyacente combina un modelo de lenguaje de 8.000 millones de parámetros basado en Qwen3, un decodificador de profundidad de 0,6B para los codebooks RVQ residuales, un DiT de flow matching de 2,4B y un vocoder. Sobre el modelo de lenguaje se ha fusionado, a fuerza 1.0, un adaptador LoRA de rango 64 entrenado por terminusresearch sobre nueve pistas (unos 52 minutos) en un único estilo.

El adaptador responde a la frase disparadora «fiona crapple», que orienta la salida hacia un estilo de cantautora de café íntimo con piano jazzy, contrabajo, batería con escobillas y voz femenina cruda. Este repositorio no contiene pesos (0,0 GB): incluye un lanzador y una demo Gradio, mientras que los pesos fusionados residen en episod/minimax-music3-fiona-crapple y se sirven mediante el contenedor jashansinghTT/minimax-music3-blackhole.

Su interés es doble: documenta un flujo completo de fine-tuning y despliegue sobre aceleradores Tenstorrent (no CUDA) y expone la API HTTP propia del modelo, con generación determinista por semilla a 32 kHz estéreo. Es, sin embargo, un artefacto experimental: cero descargas, una única medición de rendimiento y ninguna evaluación de calidad frente al modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de cuatro componentes: modelo de lenguaje de 8B basado en Qwen3 + decodificador de profundidad de 0,6B (codebooks RVQ residuales) + DiT de flow matching de 2,4B + vocoder |
| Parámetros totales | Aproximadamente 11.000 millones sumando los componentes descritos (8B + 0,6B + 2,4B); el tamaño del vocoder no está disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (la entrada es letra escrita y descripción de estilo; el repositorio no documenta idiomas) |
| Licencia | minimax-music3-community-license (declarada como `license: other`) |
| Formato de pesos | No disponible en este repositorio (0,0 GB); los pesos fusionados están en un repositorio aparte y la model card no detalla el formato |
| Adaptador | LoRA de rango 64 (`regularised/checkpoint-750`) fusionado en los pesos del modelo de lenguaje a fuerza 1.0 |
| Frase disparadora | `fiona crapple` |
| Audio de salida | 32 kHz estéreo (en el ejemplo, FLAC) |
| Duración máxima | 9000 fotogramas, equivalentes a 6 minutos (25 fotogramas de audio por segundo) |
| Hardware objetivo | Tenstorrent p150, mesh `P150`; probado en una chip de una placa p300c (QuietBox 2) |
| Formato de la API | API HTTP propia del modelo (endpoints `/v1/music/jobs`), no compatible con la API de chat de OpenAI |

## Arquitectura y entrenamiento

El sistema no es un transformer único, sino una cadena de generación musical en cuatro etapas. Un modelo de lenguaje de 8B derivado de Qwen3 produce la secuencia de tokens musicales; un decodificador de profundidad de 0,6B reconstruye los codebooks RVQ residuales; un DiT de flow matching de 2,4B genera el audio latente y un vocoder lo convierte en señal de 32 kHz estéreo. La model card indica que los detalles de entrenamiento y evaluación están en las fichas del modelo original, por lo que la composición del dataset de preentrenamiento, el número de tokens y el uso de RLHF o DPO no están disponibles en la información proporcionada.

La personalización se realizó con un adaptador LoRA de rango 64 (checkpoint `regularised/checkpoint-750`, autoría de terminusresearch) entrenado con nueve pistas, aproximadamente 52 minutos de audio, en un solo estilo descrito como cantautora de café íntimo con piano jazzy, contrabajo, batería con escobillas y voz femenina cruda. El adaptador se ha fusionado en los pesos del modelo de lenguaje a fuerza 1.0, de modo que el efecto de estilo se activa mediante la frase `fiona crapple` en el campo de instrucciones. El autor no ha medido el efecto del adaptador sin esa frase ni ha comparado la calidad con el modelo base.

El despliegue presenta un comportamiento determinista documentado: la misma semilla, letra y descripción produjeron un fichero idéntico bit a bit, tanto en peticiones repetidas sobre un mismo servidor como en servidores de las dos placas disponibles (un par de casos cada uno). El servidor genera una canción cada vez y aplica control de concurrencia con cola y error HTTP 429 al superar el límite.

## Capacidades

- Generación de música a partir de letra estructurada (etiquetas tipo `[Verse 1]`, `[Chorus]`) y una descripción textual de estilo e instrumentación.
- Control de estilo mediante instrucciones en lenguaje natural; la frase `fiona crapple` orienta la salida hacia el estilo aprendido por el adaptador.
- Generación determinista por semilla: misma semilla, letra y descripción producen un fichero idéntico bit a bit.
- Salida de audio estéreo a 32 kHz, en el ejemplo en formato FLAC, con duración solicitada configurable en segundos.
- Servidor HTTP propio con API de trabajos asíncrona: creación de trabajo, consulta de estado y descarga del audio (`/v1/music/jobs`, `/v1/music/jobs/<id>`, `/v1/music/jobs/<id>/audio`).
- Demo Gradio con barra de progreso, forma de onda, reproductor, longitud, semilla y tiempos por etapa.
- Ajuste manual de la duración solicitada (hasta 9000 fotogramas) y de la semilla.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio de entrada ni modo de razonamiento extendido según la información disponible.
- El soporte multilingüe no está documentado y la generación está condicionada por la letra que se le entrega.

## Casos de uso

- Maquetas musicales para compositores: a partir de una letra y una descripción de estilo se obtiene una mezcla de referencia en unos 65,6 s para 20 s de audio, suficiente para evaluar arreglos antes de grabar con músicos reales.
- Producción de música de fondo con estilo controlado: el adaptador permite fijar un registro concreto (cantautora, piano jazzy, contrabajo, batería con escobillas) y generar variaciones cambiando solo la letra o la semilla.
- Jingles y piezas cortas para publicidad o vídeo: la API acepta duraciones configurables en segundos y devuelve FLAC estéreo a 32 kHz, integrable en un pipeline de postproducción.
- Banda sonora para pódcast y contenido editorial: la generación determinista por semilla permite reproducir exactamente la misma pieza en distintas fases del montaje, algo útil cuando hay que rehacer una exportación.
- Experimentación en hardware alternativo: el paquete sirve como referencia práctica para medir el rendimiento de una chip Tenstorrent p150 en una carga multimodal real, con desglose de tiempos por etapa (LM 18,2 s, decodificador de profundidad 19,2 s, difusión 24,1 s, vocoder 16,0 s).
- Reproducibilidad en investigación: al ser determinista con semilla fija, permite comparar configuraciones de inferencia o variantes del adaptador manteniendo constante la salida.
- Demostraciones técnicas y docencia: la demo Gradio en el puerto 7871 muestra progreso, tiempos por etapa y parámetros, lo que facilita explicar la arquitectura interna del pipeline.
- Generación de audio etiquetado para conjuntos de datos musicales sintéticos en un estilo concreto, siempre que la licencia comunitaria lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad en la información disponible. La model card indica explícitamente que la evaluación de calidad frente a MiniMax-Music3 no se ha ejecutado.

| Evaluación | Este paquete | Referencia | Prompts |
|---|---|---|---|
| Calidad frente a MiniMax-Music3 | no ejecutada | no ejecutada | 0 |

Perfil de rendimiento medido con los tiempos propios del servidor (medianas de 20 peticiones, una canción a la vez, una chip de una placa p300c / QuietBox 2):

| Perfil | Duración de audio | Concurrencia | N | Tiempo de cómputo (s) | Por segundo de audio (s) | Modelo de lenguaje (s) | Decodificador de profundidad (s) | Difusión (s) | Vocoder (s) |
|---|---|---|---|---|---|---|---|---|---|
| p150 | 20 s | 1 | 20 | 65,6 | 3,3 | 18,2 | 19,2 | 24,1 | 16,0 |

Datos adicionales de la medición: el tiempo de cómputo osciló entre 64,8 y 68,7 s; una petición terminó en 16,6 s porque el servidor informó de que la canción había finalizado; el servidor estuvo sano entre 90 y 172 s después de arrancar el contenedor (4 arranques registrados).

## Requisitos de hardware

- No se ejecuta sobre GPU convencionales: requiere hardware Tenstorrent p150 (mesh `P150`). No hay datos de despliegue en CUDA en la información disponible.
- VRAM estimada: no aplica; la memoria relevante es la del acelerador Tenstorrent y no se especifica en la documentación.
- Espacio en disco: unos 27 GB para los pesos fusionados y 4 GB para la imagen del contenedor.
- Configuración probada: una chip de una placa p300c (QuietBox 2).
- Software necesario: Tenstorrent CLI (`tt`, instalable con `uv tool install tenstorrent`), Docker y Python 3.12 para la demo.
- Despliegue: contenedor del catálogo `tt-model pull jashansinghTT/minimax-music3-blackhole`, lanzador `serve/serve_music.py`, ejecución con `gozer run --chips 1`. El servidor escucha en el puerto 20000 y la demo Gradio en el 7871.
- Throughput: aproximadamente 3,3 s de cómputo por segundo de audio generado en una chip, es decir, unas 3,3 veces más lento que el tiempo real; 65,6 s para una pieza de 20 s.
- Concurrencia: una canción simultánea. En la prueba, 9 trabajos se aceptaron a la vez (uno en ejecución y ocho en espera) y el décimo recibió HTTP 429.
- Arranque: el servidor tarda entre 90 y 172 s en estar sano tras iniciar el contenedor.
- Latencia de cola: no medida más allá del comportamiento de la cola y el límite de trabajos.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| episod/minimax-music3-fiona-crapple-blackhole | Paquete companion (lanzador + demo Gradio) sobre el modelo fusionado | Aproximadamente 11.000 millones en el pipeline completo | No disponible | minimax-music3-community-license | Repositorio de 0,0 GB, 0 descargas, 1 like |
| MiniMaxAI/MiniMax-Music3 | Modelo base, sin adaptador | Misma arquitectura (8B LM + 0,6B decodificador + 2,4B DiT + vocoder) | No disponible | minimax-music3-community-license | Repositorio público de MiniMax |
| terminusresearch/minimax-music3-lm-lora-fiona-crapple | Adaptador LoRA de rango 64 sin fusionar (`regularised/checkpoint-750`) | No aplica (adaptador sobre el LM de 8B) | No disponible | No disponible | Repositorio público del adaptador |
| episod/minimax-music3-fiona-crapple | Pesos ya fusionados del modelo con el adaptador | Misma arquitectura que el modelo base | No disponible | minimax-music3-community-license | Repositorio de pesos referenciado por este paquete |

No se dispone de datos verificados en la información proporcionada sobre otras familias de generación musical (por ejemplo MusicGen, Stable Audio, YuE o ACE-Step), por lo que la comparación con alternativas externas queda como no disponible.

## Limitaciones y advertencias

- Solo se genera una canción a la vez; el límite práctico observado es de nueve trabajos en cola y HTTP 429 para el décimo.
- Es más lento que el tiempo real: aproximadamente 3,3 s de cómputo por segundo de audio en una chip p150.
- Solo se ha probado el perfil `p150` en una chip y con peticiones de 20 s, aunque el servidor admite hasta 9000 fotogramas (6 minutos).
- La canción termina cuando se acaba la letra, no cuando se alcanza la duración solicitada: una letra de dos frases produjo 5,2 s de los 20 s pedidos y 1 de cada 20 peticiones con letra completa terminó a los 16,6 s de 20 s.
- No se ha ejecutado ninguna evaluación de calidad frente al modelo base. El adaptador se entrenó con nueve pistas de un único estilo y su efecto sin la frase disparadora no está medido.
- Riesgo de sobreajuste al estilo del adaptador: fuera del registro «cantautora de café» y sin la frase `fiona crapple`, el comportamiento no está documentado.
- La model card prohíbe el uso para imitar la voz de un artista real concreto; el resto de la cláusula aparece truncado en la información disponible.
- La licencia es minimax-music3-community-license, declarada como `license: other`: no es una licencia de código abierto y las condiciones exactas de uso comercial deben consultarse en el enlace a la licencia, ya que no se detallan en la ficha.
- No hay información sobre sesgos, alucinación en el sentido textual, idiomas soportados ni estabilidad de la letra generada.
- La API no es compatible con OpenAI, por lo que no se puede conectar directamente a clientes o frameworks que esperen ese formato.
- El repositorio tiene 0 descargas y no contiene pesos, de modo que su utilidad depende de descargar por separado los pesos fusionados y la imagen del contenedor.
- La búsqueda web asociada al nombre «episod» devuelve únicamente resultados de una cadena francesa de estudios deportivos (episod.com), sin relación con este modelo; no se han encontrado páginas, papers ni demos externas relevantes.

## Enlaces

- Ficha del modelo: https://huggingface.co/episod/minimax-music3-fiona-crapple-blackhole
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-Music3
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-Music3/blob/main/LICENSE
- Adaptador LoRA de origen: https://huggingface.co/terminusresearch/minimax-music3-lm-lora-fiona-crapple
- Pesos fusionados: https://huggingface.co/episod/minimax-music3-fiona-crapple
- Paquete contenedor para blackhole: https://huggingface.co/jashansinghTT/minimax-music3-blackhole
- Prerrequisitos de la CLI de Tenstorrent: https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
- Búsqueda web: sin resultados relevantes; los enlaces devueltos corresponden a la cadena deportiva francesa episod.com (https://www.episod.com/), sin relación con el modelo.
