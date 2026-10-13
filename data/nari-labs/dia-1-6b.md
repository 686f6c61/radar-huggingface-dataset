# nari-labs/Dia-1.6B

## Resumen

Dia-1.6B es un modelo de texto a voz (text-to-speech) desarrollado por Nari Labs, un equipo reducido formado por un ingeniero a tiempo completo y otro a tiempo parcial. A diferencia de los sistemas de sintesis de voz convencionales, Dia genera dialogos completos de forma directa a partir de un transcript, permitiendo controlar el turno de palabra mediante etiquetas `[S1]` y `[S2]`. Ademas, el modelo puede condicionarse sobre audio de referencia, lo que habilita el control de emocion y tono, y es capaz de producir comunicaciones no verbales como risas, tos o carraspeos.

El modelo cuenta con 1.611.160.576 parametros (aproximadamente 1.6B) y esta publicado bajo licencia Apache 2.0, lo que facilita su uso tanto en investigacion como en productos comerciales. Su lanzamiento resulta relevante porque ofrece pesos abiertos para una tarea tradicionalmente dominada por servicios propietarios, y porque incorpora clonacion de voz y generacion de dialogo multi-turno en un unico modelo compacto.

Actualmente el modelo solo soporta generacion en ingles. Se distribuye en formato safetensors e integra el codigo de inferencia en el repositorio de GitHub del proyecto. La inferencia esta pensada exclusivamente para GPU (pytorch 2.0+, CUDA 12.6), aunque el equipo ha indicado que el soporte de CPU llegara mas adelante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de generacion de audio a partir de texto basado en codec (utiliza Descript Audio Codec); detalles internos de la red no disponibles |
| Parametros totales | 1.611.160.576 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el equipo indica que anadira una version cuantizada en el futuro) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Dia-1.6B es un modelo de sintesis de voz de 1.6B parametros que transforma directamente un transcript en audio de dialogo. Para ello emplea el Descript Audio Codec, que convierte el audio en tokens discretos y permite al modelo generar secuencias de tokens de audio a partir del texto. El modelo esta entrenado para interpretar etiquetas de hablante (`[S1]`, `[S2]`) que indican el turno de cada interlocutor, asi como etiquetas de comunicacion no verbal entre parentesis. No se han publicado detalles sobre la composicion exacta del dataset de entrenamiento, el numero de tokens utilizados ni si se emplearon tecnicas de RLHF o DPO.

Una de sus caracteristicas tecnicas mas destacables es la capacidad de condicionamiento sobre audio: introduciendo una muestra de audio de referencia junto con su transcript, el modelo mantiene la identidad vocal y permite clonacion de voz. Ademas, el modelo no fue ajustado sobre una voz especifica, por lo que cada ejecucion produce una voz distinta salvo que se fije la semilla o se utilice un prompt de audio. La velocidad de inferencia reportada es de aproximadamente 40 tokens por segundo en una GPU A4000, teniendo en cuenta que 86 tokens equivalen a un segundo de audio. El equipo tambien menciona que `torch.compile` puede incrementar la velocidad en GPUs compatibles.

## Capacidades

- Generacion de dialogo multi-turno a partir de un transcript, con turnos delimitados por las etiquetas `[S1]` y `[S2]`.
- Produccion de comunicaciones no verbales integradas en el texto: risas, tos, carraspeo, suspiros, jadeos, canto, tarareo, aplausos, bostezos, silbidos, estornudos y otras, etiquetadas entre parentesis. El propio autor advierte que algunas etiquetas pueden producir resultados inesperados.
- Clonacion de voz a partir de un fragmento de audio de referencia; se recomienda incluir el transcript de ese audio para obtener mejores resultados.
- Condicionamiento sobre audio para controlar emocion y tono del habla generada.
- Generacion de audio de alta fidelidad con salida en 44.1 kHz (segun el ejemplo de uso con `soundfile`).
- Generacion en tiempo real sobre GPUs empresariales.
- Soporte de integracion como libreria de Python mediante `Dia.from_pretrained(...)`; tambien existe una interfaz Gradio y un Space de ZeroGPU en Hugging Face.
- No dispone de tool calling ni capacidades de agente; no es un modelo de lenguaje conversacional, sino un sistema de sintesis de voz.

## Casos de uso

- Produccion de audiolibros y ficcion sonora: el modelo permite generar dialogos entre varios personajes a partir del guion, aplicando etiquetas `[S1]` y `[S2]` para asignar turnos y anadiendo efectos no verbales como risas o suspiros para dar naturalidad a las escenas.
- Doblaje y localizacion de contenido audiovisual: mediante clonacion de voz con audio de referencia, se puede preservar la identidad vocal de un actor y ajustar tono y emocion para mantener coherencia con la escena original.
- Desarrollo de videojuegos con voces dinamicas: los dialogos de los personajes no jugadores pueden generarse en tiempo de ejecucion a partir de texto, con emociones variables y reacciones no verbales, reduciendo la necesidad de grabar lineas de voz estaticas.
- Asistentes de voz y agentes conversacionales: el modelo puede sintetizar respuestas habladas con una calidad natural, si bien requiere integrarse con un LLM que produzca el texto.
- Accesibilidad y lectura de contenido: conversion de articulos, documentos o notificaciones en audio con voces personalizadas, incluyendo la clonacion de la voz del propio usuario.
- Creacion de contenido para redes sociales y podcast: generacion rapida de conversaciones sinteticas, sketches o voces en off a partir de guiones escritos, sin necesidad de estudio de grabacion.
- Prototipado de interfaces de voz: equipos de producto pueden probar flujos de usuario hablados con distintas voces y tonos antes de comprometerse con grabaciones profesionales.
- Investigacion en sintesis de voz: los pesos abiertos permiten estudiar y comparar tecnicas de generacion de dialogo, control emocional y clonacion de hablante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una pagina de demostracion que compara Dia con ElevenLabs Studio y Sesame CSM-1B, pero no se aportan cifras concretas de metricas como MMLU, HumanEval o GSM8K (que por otro lado no aplican a un modelo de sintesis de voz). El unico dato de rendimiento cuantitativo publicado es la velocidad de inferencia: aproximadamente 40 tokens/s en una GPU A4000, con 86 tokens equivalentes a 1 segundo de audio.

## Requisitos de hardware

- VRAM estimada: la version completa de Dia requiere aproximadamente 10 GB de VRAM para ejecutarse.
- GPU probadas: el modelo ha sido validado en GPUs NVIDIA con CUDA 12.6 y PyTorch 2.0 o superior. Como referencia de velocidad se cita una NVIDIA A4000 (40 tokens/s).
- GPUs empresariales: en GPUs como A100 o H100 el modelo puede generar audio en tiempo real.
- GPUs de consumo: no se especifica oficialmente, pero por el requisito de 10 GB de VRAM cabria en tarjetas con 12 GB o mas, como la RTX 3060 de 12 GB, RTX 4070, 4080 y 4090. Los autores indican que `torch.compile` puede acelerar la inferencia en GPUs compatibles.
- Cuantizacion: no disponible actualmente; el equipo ha manifestado su intencion de anadir versiones cuantizadas para reducir el consumo de memoria.
- Soporte de CPU: no disponible de momento; el equipo indica que se anadira mas adelante.
- Opciones de despliegue: libreria de Python (`from dia.model import Dia`), interfaz Gradio incluida en el repositorio oficial, y un Space de ZeroGPU en Hugging Face. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje basado en transformers de texto convencional.
- Latencia y throughput: se reporta una velocidad de 40 tokens/s en GPU A4000, equivalente aproximadamente a 0,47 segundos de audio por segundo de proceso en esa GPU. En GPUs mas potentes puede alcanzar generacion en tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Disponibilidad | Control de dialogo | Clonacion de voz |
|---|---|---|---|---|---|---|
| Dia-1.6B (Nari Labs) | 1.6B | Ingles | Apache 2.0 | Pesos abiertos en Hugging Face | Si, mediante etiquetas `[S1]`/`[S2]` | Si, con audio de referencia |
| Sesame CSM-1B | 1B | No disponible | No disponible | Pesos en GitHub | No disponible | No disponible |
| ElevenLabs Studio | No disponible (propietario) | Multiples | Propietaria | API comercial | Si | Si |

La model card incluye una pagina de demo comparativa con ElevenLabs Studio y Sesame CSM-1B, pero no se aportan cifras objetivas de calidad. No se dispone de mas alternativas comparables con datos verificables en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta generacion en ingles; no hay soporte multilingue confirmado.
- El modelo no fue ajustado sobre una voz concreta, por lo que la voz generada varia en cada ejecucion salvo que se fije la semilla o se proporcione un prompt de audio.
- Algunas etiquetas no verbales reconocidas pueden producir resultados inesperados, segun advierte el propio autor.
- No se han publicado datos sobre sesgos, y al ser un modelo de voz entrenado en ingles podria presentar sesgos acentuales o de genero no documentados.
- Riesgo de uso malintencionado: la model card prohibe explicitamente el uso de identidad sin permiso, la generacion de contenido enganoso (por ejemplo, noticias falsas) y cualquier actividad ilegal o danina.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el disclaimer del proyecto limita el uso del modelo a fines de investigacion y educativos, y prohibe determinados usos, lo que introduce una tension entre la licencia legal y las condiciones eticas declaradas por el autor.
- El modelo no es un LLM: no realiza razonamiento, tool calling ni comprension de texto fuera de la sintesis de voz. Requiere un sistema externo que genere los dialogos.
- El consumo de memoria (aproximadamente 10 GB de VRAM) puede ser elevado para entornos de produccion con multiples instancias.
- No hay todavia soporte de CPU, cuantizacion ni Docker, lo que limita su despliegue en infraestructura heterogenea.
- El proyecto esta mantenido por un equipo muy reducido (un ingeniero a tiempo completo y otro a tiempo parcial), lo que puede afectar a la frecuencia de actualizaciones y al soporte a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nari-labs/Dia-1.6B
- Repositorio en GitHub: https://github.com/nari-labs/dia
- Space de demostracion en ZeroGPU: https://huggingface.co/spaces/nari-labs/Dia-1.6B
- Pagina de demo comparativa con ElevenLabs Studio y Sesame CSM-1B: https://yummy-fir-7a4.notion.site/dia
- Sesame CSM-1B (modelo de referencia): https://github.com/SesameAILabs/csm
- Servidor de Discord del proyecto: https://discord.gg/bJq6vjRRKv
- Lista de espera para versiones mayores del modelo: https://tally.so/r/meokbo
- Referencia arXiv asociada a los tags del modelo: arxiv:2305.09636
- Documentacion de PyTorchModelHubMixin: https://huggingface.co/docs/huggingface_hub/package_reference/mixins#huggingface_hub.PyTorchModelHubMixin
