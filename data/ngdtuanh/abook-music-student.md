# NGDtuanh/abook-music-student

## Resumen

ABook music student es un analizador musical de audio desarrollado por el proyecto ABook (autor NGDtuanh) para estimar el estado emocional de pistas de musica de fondo. No es un modelo generativo: es un cabezal de regresion lineal que se apoya en la torre de audio del modelo CLAP de LAION (`laion/clap-htsat-unfused`) para producir, por pista, tres ejes afectivos (valence, energy/arousal y tension, en rango −1..1), trece intensidades emocionales independientes (peacefulness, tenderness, nostalgia, sadness, joy, playful, power, wonder, tension, fear, anger, mystery, moved, en rango 0..1), una medida de lo poco intrusiva que resulta la musica bajo una narracion y una familia de estilo.

El modelo resuelve un problema concreto de ABook: cuando un oyente importa su propia musica de fondo, el sistema necesita emparejar cada pista con las escenas de un audiolibro. En lugar de entrenar un modelo grande de reconocimiento de emociones musicales, el proyecto adopta una estrategia de destilacion: un "teacher" (que fusiona embeddings de audio, caracteristicas acusticas y texto de la ficha de la pista leido por un LLM) genera etiquetas, y el "student" aprende a imitarlo usando solo audio.

El resultado ocupa 28.240.152 parametros (unos 56 MB en fp16, repo de 0,1 GB) y se distribuye bajo licencia Apache-2.0, con pesos en safetensors y una variante ONNX fp16 pensada para dispositivos sin PyTorch (escritorio solo-reproductor, Android). Es relevante ahora porque demuestra que un cabezal pequeno sobre un encoder de audio congelado puede aproximarse a un sistema multimodal mucho mas complejo a una fraccion del coste de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Torre de audio CLAP HTSAT (Hierarchical Token-Semantic Audio Transformer) congelada mas cabezal lineal "student" |
| Parametros totales | 28.240.152 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como contexto textual; procesa ventanas de audio de 10 s (la embedding final es la media de tres ventanas de 10 s) |
| Tipos de cuantizacion | fp16 (safetensors en fp16, ONNX con pesos fp16) |
| Idiomas soportados | no disponible (modelo de audio, sin entrada de texto para inferencia) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, ONNX (opset 17), NPZ (cabezal) |

## Arquitectura y entrenamiento

La arquitectura reutiliza tal cual la torre de audio (con su proyeccion) de `laion/clap-htsat-unfused`, almacenada en fp16 y sin modificaciones, con la licencia Apache-2.0 original de LAION. Sobre esa embedding de audio (dimension 512, media de tres ventanas de 10 s) se anade un cabezal lineal entrenado por el proyecto ABook que concatena 42 caracteristicas acusticas clasicas (tempo, modo, roughness, loudness, MFCC, entre otras). El fichero `student_head.npz` tambien guarda dos vectores de texto CLAP precalculados: uno para distinguir fondo frente a primer plano y otro para las familias de estilo.

El entrenamiento es una destilacion de un "teacher" a un "student". El teacher opera sobre el catalogo de pistas y fusiona tres senales: la embedding de audio CLAP, las caracteristicas acusticas y una lectura mediante LLM del texto de la propia pagina de la pista (titulo, descripcion, etiquetas, comentarios). Ese teacher se calibro con las etiquetas humanas de "sensacion" de la libreria Incompetech de Kevin MacLeod (CC BY 4.0). El student aprende despues a reproducir esas salidas usando solo audio.

No se documentan en la informacion disponible ni el numero de tokens de entrenamiento ni tecnicas de RLHF o DPO, que no aplican a este tipo de modelo de regresion sobre audio. La innovacion principal es la destilacion multimodal-a-audio y una variante "student-A" totalmente desacoplada de PyTorch: la misma torre de audio exportada a ONNX (opset 17, fp16, entrada `input_features` [batch,1,1001,64], salida `audio_embeds` [batch,512]) junto con un cabezal solo-CLAP. El front-end mel (configuracion de `ClapFeatureExtractor` en `preprocessor_config.json`) es reimplementable en numpy o Kotlin, y el autor afirma que coincide con transformers dentro de 1e-5 dB.

## Capacidades

- Estimacion de afecto musical en tres ejes continuos: valence, energy (arousal) y tension, cada uno en rango −1..1.
- Prediccion de trece intensidades emocionales independientes en rango 0..1: peacefulness, tenderness, nostalgia, sadness, joy, playful, power, wonder, tension, fear, anger, mystery y moved.
- Puntuacion de "no intrusividad" de la musica bajo una narracion (clasificacion fondo frente a primer plano mediante un vector de texto CLAP precalculado).
- Asignacion de una familia de estilo a cada pista.
- Especificamente disenado para musica instrumental de fondo; no detecta voces ni esta pensado para ello.
- Funciona solo con audio: no requiere texto de la ficha de la pista en tiempo de inferencia.
- Capacidad de ejecucion sin PyTorch mediante la variante ONNX (student-A), orientada a escritorio y Android.
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente, al no ser un modelo de lenguaje.

## Casos de uso

- Emparejamiento musica-escena en audiolibros: ABook usa las puntuaciones de valence, energy y tension para seleccionar la pista de fondo que mejor encaja con el tono de cada escena narrada, ajustando la eleccion a lo largo del capitulo.
- Seleccion automatica de musica de fondo para video: un editor puede ordenar y filtrar una biblioteca musical por intensidad emocional y por no intrusividad, evitando pistas que compitan con la locucion.
- Curacion de bibliotecas musicales: etiquetado masivo de un catalogo con mood, estilo y ejes afectivos, lo que permite busquedas por sensacion en lugar de solo por genero o artista.
- Generacion de listas de reproduccion por estado de animo: agrupar pistas por perfiles emocionales concretos (por ejemplo, alta nostalgia y baja tension) para contextos de concentracion, relax o ejercicio.
- Publicidad y montaje audiovisual: puntuar candidatos musicales segun el arco emocional deseado del anuncio y descartar los que interfieran con la voz en off.
- Integracion en aplicaciones moviles o de escritorio ligeras: gracias a la variante ONNX fp16 y a un cabezal entrenado, puede ejecutarse en dispositivos sin PyTorch y con un coste de memoria minimo.
- Investigacion en reconocimiento de emociones musicales: el modelo sirve como referencia destilada para comparar tecnicas de prediccion de valence, energy y tension en conjuntos como DEAM o Eerola & Vuoskoski 2011.
- Sistemas de recomendacion con conciencia emocional: incorporar los ejes continuos como caracteristicas de entrada en motores de recomendacion que ajusten la musica al estado de animo del usuario.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. El "teacher" es el sistema multimodal de referencia y el "student" es este modelo. Los valores de AUC corresponden a 10 clases emocionales.

| Comparacion | AUC | Notas |
|---|---|---|
| Teacher | 0,904 | Sistema multimodal de referencia |
| Student | 0,880 | 97 % del AUC del teacher sobre pistas Incompetech no vistas |
| Student-A (ONNX) | 96,5 % del AUC del teacher | Variante sin PyTorch |

Correlacion de Pearson en conjuntos externos no usados en entrenamiento:

| Conjunto | Valence | Energy | Tension |
|---|---|---|---|
| Eerola & Vuoskoski 2011 (bandas sonoras) | 0,65 | 0,74 | 0,77 |
| DEAM | 0,32 | 0,69 | no disponible |

El autor indica ademas que, sobre 20 pistas, la ruta ONNX coincide con la ruta PyTorch dentro de 0,0005 en cada salida, y que el front-end mel reproduce transformers dentro de 1e-5 dB.

## Requisitos de hardware

- Inferencia con 28,24 millones de parametros; en fp16 el peso ocupa aproximadamente 56 MB, por lo que el modelo cabe holgadamente en cualquier GPU de consumo e incluso en CPU.
- VRAM estimada: del orden de unos pocos cientos de MB incluyendo activaciones de la torre HTSAT y el front-end mel; no se dispone de cifras oficiales de VRAM maxima.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, cualquier GPU moderna (RTX 3060 o superior, e incluso integradas) es suficiente.
- Cabe en GPU de consumo: si, con margen amplio, y tambien en dispositivos moviles mediante la variante ONNX fp16.
- Opciones de despliegue: `transformers` (ruta PyTorch con `model.safetensors`) y ONNX Runtime (ruta `clap_audio_fp16.onnx` mas `student_head_A.npz`). No aplica despliegue con vLLM, TGI, Ollama o llama.cpp al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La informacion disponible solo permite comparar contra el propio sistema de referencia (teacher) y el modelo base del que se hereda la torre de audio. No se aportan datos verificables de otros modelos publicos de reconocimiento de emociones musicales, por lo que los huecos se dejan como "no disponible".

| Modelo | Parametros | Contexto | Uso | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ABook music student | 28.240.152 | Ventanas de audio de 10 s (media de tres) | Reconocimiento de emociones musicales (destilado) | apache-2.0 | HuggingFace (NGDtuanh/abook-music-student) |
| laion/clap-htsat-unfused | no disponible | no disponible | Encoder audio-texto CLAP (modelo base) | Apache-2.0 (segun el autor) | HuggingFace |
| Teacher de ABook (multimodal) | no disponible | no disponible | Fusion de audio, caracteristicas y texto de ficha; no publicado | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado unicamente con musica instrumental de fondo; su comportamiento con pistas vocales o con generos fuera de ese dominio no esta garantizado.
- La deteccion de voz no se realiza ni se pretende: el sistema asume que la musica importada es una eleccion del usuario.
- El propio autor senala que valence es el eje mas dificil: la correlacion de Pearson cae a 0,32 en DEAM y a 0,65 en Eerola & Vuoskoski 2011, frente a valores mas altos en energy y tension.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de predicciones erroneas en ejes afectivos, especialmente valence, al tratarse de un modelo de regresion.
- La calibracion de referencia proviene de la biblioteca Incompetech (Kevin MacLeod), lo que puede introducir sesgos hacia el estilo de esa coleccion.
- No se declaran sesgos demograficos ni culturales especificos en la informacion disponible, pero la composicion del dataset de calibracion no se detalla.
- Licencia Apache-2.0, permisiva para uso comercial, aunque la torre de audio deriva de `laion/clap-htsat-unfused` y el fichero heredado se mantiene bajo la licencia original de LAION.
- Al ser un cabezal lineal que depende de la embedding CLAP, su calidad esta ligada a la del modelo base y a la fidelidad del front-end mel en despliegues sin PyTorch.
- El autor afirma que el metodo y las cifras completas estan en `_internal/docs/MUSIC_RESEARCH.md` dentro del repositorio de ABook, no en la model card de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NGDtuanh/abook-music-student
- Repositorio ABook: https://github.com/ntanhpro1221/ABook
- Modelo base: https://huggingface.co/laion/clap-htsat-unfused
- Libreria de calibracion Incompetech (Kevin MacLeod, CC BY 4.0): https://incompetech.com
- Paper de CLAP (documentacion del modelo base): no disponible en la informacion proporcionada
