# jonpark0/supertonic-3-AX650

## Resumen

Supertonic 3 — AX650 / AX8850 es una conversión del modelo de síntesis de voz Supertone/supertonic-3 para ejecutarse sobre las NPU Axera AX650 y AX8850 (familia LLM-8850), publicado por el usuario jonpark0. No es un modelo nuevo entrenado desde cero, sino una recompilación cuantizada del modelo original mediante la herramienta Axera Pulsar2 7.0-patch1, con el objetivo de mover la inferencia del sintetizador de voz desde la CPU del host a la NPU de una tarjeta PCIe. El repo ocupa 0,2 GB y contiene únicamente los grafos compilados (`.axmodel`), las tablas auxiliares `.onnx`/`.npy` y las licencias; el resto de componentes se descargan en tiempo de ejecución desde el modelo base.

El modelo resuelve el problema de latencia y consumo en despliegues de TTS en edge: sobre la tarjeta, el estimador de flow-matching (8 pasos) y el vocoder se ejecutan en la NPU, mientras que el procesamiento de texto, el predictor de duración, el text encoder y la actualización de Euler permanecen en la CPU del host. Según la model card, una frase corta (hasta ~6,7 s de audio) se sintetiza en ~0,18 s y una de hasta ~13 s en ~0,35 s, con un consumo de memoria de tarjeta de unos 220 MiB cargando ambos buckets (o 99 MiB solo con el corto).

Es relevante ahora porque demuestra que un sintetizador multilingüe (coreano, japonés e inglés) con calidad casi idéntica al original puede desplegarse sobre aceleradores NPU de bajo coste en lugar de GPU, con 10 voces predefinidas y sin degradar de forma apreciable las métricas de error de reconocimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS basado en flow-matching (estimador de flow-matching de 8 pasos + vocoder); arquitectura interna del transformer no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica como contexto de LLM; ventana de texto T = 96 o 192 tokens y latente L = 96 o 192, que cubren hasta ~6,7 s y ~13 s de audio respectivamente |
| Tipos de cuantizacion | no disponible (grafos `.axmodel` compilados con Pulsar2 7.0-patch1; la model card indica una aproximación de Erf en la version estatica) |
| Idiomas soportados | coreano (ko), japones (ja), ingles (en) |
| Licencia | openrail (BigScience OpenRAIL-M) |
| Formato de pesos | `.axmodel` (AX650/AX8850) para estimador y vocoder; `.onnx` y `.npy` auxiliares para el host |

## Arquitectura y entrenamiento

Se trata de un modelo de texto a voz basado en flow-matching, separado en dos etapas que se ejecutan en la NPU: un estimador de flow-matching de 8 pasos (`st_est.axmodel`) y un vocoder (`st_voc.axmodel`) que produce audio a 44,1 kHz. El resto del pipeline (procesamiento de texto, predictor de duración, text encoder, tablas de rotary sin/cos y actualización de Euler) permanece en la CPU del host y no forma parte de este repositorio. La model card no aporta detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO, por lo que esos datos se consideran no disponibles.

La innovación destacable no está en el entrenamiento sino en la conversión: el autor usó Axera Pulsar2 7.0-patch1 para generar dos tamaños estáticos («buckets») que evitan recompilaciones dinámicas, un estimador con T = L = 96 y otro con T = L = 192. La comprobación de fidelidad numérica reportada indica una similitud coseno de 0,9999 y 0,9995 en los pasos 0 y 7 del estimador y de 0,994 en el vocoder respecto a la ejecución en coma flotante. El autor señala además una aproximación de Erf en el grafo estático y una pérdida mínima de calidad (UTMOS 3,95 en la tarjeta frente a 4,00 del ONNX original en CPU). No se documentan mecanismos como decodificación especulativa ni atención lineal.

## Capacidades

- Generacion de voz (text-to-speech) en coreano, japones e ingles con 10 voces predefinidas (F1–F5 femeninas, M1–M5 masculinas).
- Sintesis de frases cortas (hasta ~6,7 s de audio) en ~0,18 s y de frases largas (hasta ~13 s) en ~0,35 s sobre la NPU.
- Manejo de dos tamaños estaticos («buckets» 96 y 192) para reducir la fragmentacion de mensajes largos: con ambos buckets, 29 de 30 mensajes de 7–14 s se leen en una sola pieza.
- Ejecucion de sintesis fuera de la CPU del host (estimador y vocoder en la NPU), liberando CPU para otras tareas del servidor.
- Servidor HTTP de referencia (JonPark0/TTSBot) con endpoint `/tts` que acepta parametros `text`, `lang` (ko/ja/en), `voice` (F1–F5, M1–M5) y devuelve un fichero `.wav`.
- Control de voces predefinidas con calidad medida: CER coreano estandar de 0,0–0,6 % en todas las voces; la voz F4 muestra mayor variabilidad en registro conversacional (13,0 % CER en chat).
- No se documenta soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, vision ni audio de entrada; es exclusivamente un modelo generativo de voz.

## Casos de uso

- Bots de voz para Discord: el autor disena explicitamente el servidor de referencia para un bot TTS de Discord; el modelo lee mensajes de chat en coreano, japones o ingles con latencias por debajo de 0,2 s para mensajes cortos.
- Atencion al cliente con respuestas habladas: integrado en un servidor HTTP, puede convertir respuestas de texto de un backend en audio de forma casi instantanea, con 10 voces para segmentar por agente o idioma.
- Lectura por voz en aplicaciones de accesibilidad: al ejecutarse sobre una NPU de bajo consumo, permite mantener la sintesis funcionando de forma continua en un equipo de sobremesa o mini-PC sin cargar la CPU.
- Asistentes locales sin conexion: al residir en una tarjeta PCIe local (AX650/AX8850), es adecuado para despliegues on-premise donde no se quiere enviar texto a servicios en la nube.
- Generacion de audio para contenidos multilingues: cubre coreano, japones e ingles con la misma voz, util para localizacion de videos o audiolibros que alternan los tres idiomas.
- Integracion en pipelines de notificaciones: el endpoint HTTP y el binario `say` permiten generar avisos de voz programaticamente (por ejemplo, recordatorios de reunion) en menos de 0,4 s por mensaje.
- Investigacion en despliegue NPU: sirve como ejemplo reproducible de conversion de un TTS flow-matching a Pulsar2 y de particionado estimator/vocoder entre NPU y CPU.

## Benchmarks y rendimiento

Resultados de calidad y latencia reportados por el autor (60 frases evaluadas con `whisper-large-v3-turbo`; coreano y japones por CER, ingles por WER; UTMOS con `utmos22_strong`, referencia humana de coreano 1,7 % CER):

| Configuracion | CER coreano estandar | CER coreano chat | CER japones | WER ingles | UTMOS | Tiempo por frase |
|---|---|---|---|---|---|---|
| ONNX original (CPU) | 0,0 % | 3,9 % | 1,7 % | 1,4 % | 4,00 | – |
| Grafo estatico + aproximacion Erf (CPU float, mismo ruido) | 0,3 % | 5,5 % | 1,7 % | 1,4 % | 3,99 | – |
| Estimador en tarjeta + vocoder en CPU | 0,3 % | 5,5 % | 2,2 % | 1,4 % | 4,00 | 0,53 s |
| Estimador + vocoder en tarjeta (este repo) | 0,3 % | 6,5 % | 2,2 % | 1,4 % | 3,95 | 0,18 s |

Mensajes largos (bucket 192, 30 mensajes de 7–14 s, voz F1):

| Tarjeta | CER coreano | CER japones | WER ingles | UTMOS coreano | Tiempo mediano por mensaje | Piezas |
|---|---|---|---|---|---|---|
| Solo bucket 96 | 0,1 % | 1,5 % | 0 % | 3,85 | 0,39 s | 70 |
| Buckets 96 + 192 | 0,0 % | 0,8 % | 0 % | 3,91 | 0,35 s | 31 |

Datos adicionales de rendimiento: en la tarjeta, el estimador tarda ~18 ms por paso (× 8 pasos) y el vocoder ~17 ms para el bucket 96; para el 192, ~34 ms por paso y ~46 ms de vocoder. A traves del servidor HTTP de TTSBot, 0,175–0,178 s para un mensaje corto.

Calidad por voz (20 frases coreanas por voz, 10 estandar y 10 chat):

| Voz | CER estandar | CER chat | UTMOS |
|---|---|---|---|
| F1 | 0,6 % | 3,7 % | 3,85 |
| F2 | 0,0 % | 8,1 % | 3,66 |
| F3 | 0,0 % | 2,0 % | 4,03 |
| F4 | 0,0 % | 13,0 % | 3,74 |
| F5 | 0,0 % | 3,3 % | 3,72 |
| M1 | 0,0 % | 2,7 % | 3,67 |
| M2 | 0,0 % | 0,0 % | 3,55 |
| M3 | 0,6 % | 7,4 % | 3,54 |
| M4 | 0,0 % | 2,5 % | 3,84 |
| M5 | 0,0 % | 2,0 % | 3,68 |

## Requisitos de hardware

- Tarjeta obligatoria: NPU Axera AX650 o AX8850 (familia LLM-8850). Probado en la tarjeta PCIe M5Stack LLM-8850 con AXCL.
- Memoria de tarjeta: ~220 MiB cargando ambos buckets (96 y 192); ~99 MiB cargando solo el corto.
- Controlador y runtime requeridos: AXCL instalado (`libaxcl_rt.dll` en Windows, `libaxcl_rt.so` en Linux).
- Host: Python 3.10 o superior, con `numpy`, `onnxruntime` y el paquete `supertonic`.
- No esta disenado para ejecutarse en GPU consumer (RTX 4090, etc.) ni en A100/H100; es una compilacion especifica para NPU Axera. La version solo CPU del modelo base puede ejecutarse en CPU convencional mediante ONNX.
- Despliegue: servidor HTTP de referencia en JonPark0/TTSBot (`server/`); el binario `python -m server.say` permite sintesis puntual y `python -m server.tts_server` levanta el endpoint en el puerto indicado.
- Latencia estimada: ~0,18 s por frase corta (bucket 96) y ~0,35 s por mensaje largo (buckets 96+192) segun la model card.
- Rendimiento por componente: estimador ~18 ms/paso (bucket 96) y ~34 ms/paso (bucket 192, 8 pasos); vocoder ~17 ms (96) y ~46 ms (192).

## Comparativa con modelos similares

Comparacion con el propio modelo base y su ejecucion en CPU, ya que no se dispone de datos de otros TTS en la informacion proporcionada:

| Modelo | Plataforma | Idiomas | CER coreano estandar | WER ingles | UTMOS | Licencia |
|---|---|---|---|---|---|---|
| jonpark0/supertonic-3-AX650 (este repo) | NPU AX650/AX8850 | ko, ja, en | 0,3 % | 1,4 % | 3,95 | openrail |
| Supertone/supertonic-3 ONNX (CPU) | CPU | ko, ja, en | 0,0 % | 1,4 % | 4,00 | openrail |

Comparacion con otros modelos TTS de la misma categoria (por ejemplo Kokoro, Piper, XTTS): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia de hardware: solo funciona sobre NPU Axera AX650/AX8850; no es ejecutable en GPU o CPU sin volver al modelo base ONNX.
- Degradacion de calidad: el CER de coreano conversacional sube del 3,9 % (ONNX original) al 6,5 % con estimador y vocoder en la tarjeta; el UTMOS baja de 4,00 a 3,95.
- Variabilidad entre voces: la voz F4 alcanza un 13,0 % de CER en registro conversacional, frente a 0,0–3,3 % de otras voces; con solo 10 frases por grupo las cifras son sensibles a errores puntuales.
- Idiomas limitados: unicamente coreano, japones e ingles; no se documenta soporte de otras lenguas ni de cambio de idioma dentro de una misma frase.
- Dependencia de descargas externas: el predictor de duracion, el text encoder, el procesador de texto y los estilos de voz no estan en este repositorio y se descargan de `Supertone/supertonic-3` en la primera ejecucion, lo que requiere conectividad y anade una dependencia de version.
- Fragmentacion de mensajes largos: cargando solo el bucket 96, el servidor debe partir los mensajes de 7–14 s en 2–4 piezas (70 piezas para 30 mensajes), lo que puede introducir cortes; con ambos buckets se reduce a 31 piezas.
- Riesgo de alucinacion: al ser un modelo generativo de audio, puede producir lecturas erroneas de texto numerico, siglas o texto conversacional; la model card reconoce que algunas frases se leen de forma distinta a la version en coma flotante.
- Licencia: OpenRAIL-M, que impone restricciones de uso adicionales (clausulas de uso responsable); conviene revisar `LICENSE` y `NOTICE` antes de un uso comercial.
- Datos no disponibles: no se publican parametros totales, tokens de entrenamiento, composicion del dataset ni si hubo RLHF/DPO, lo que dificulta auditar sesgos o procedencia de datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jonpark0/supertonic-3-AX650
- Modelo base: https://huggingface.co/Supertone/supertonic-3
- Repositorio del runtime/servidor de referencia (TTSBot): https://github.com/JonPark0/TTSBot
