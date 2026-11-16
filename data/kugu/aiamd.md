# kugu/AIAMD

## Resumen

AIAMD es un detector de contestador automatico (answering machine detection, AMD) para telefonia: dado el audio inicial de una llamada saliente, decide si ha respondido una persona o una maquina (buzon de voz, filtro de llamadas, IVR, tonos de red). Lo publica el usuario kugu en Hugging Face como implementacion del articulo *A Recurrent Neural Network Approach to the Answering Machine Detection Problem* (Altwlkany et al., 2024, arXiv:2410.08235).

La arquitectura es un pipeline de dos etapas: un extractor YAMNet congelado que convierte cada 0,96 s de audio (con paso de 0,48 s) en un vector de 1.024 dimensiones, seguido de una capa densa de 32 unidades con activacion tanh, una GRU de 48 unidades y una capa final densa con sigmoid que produce `p(machine)`. El modelo entrenable es minimo: 44.657 parametros, lo que permite ejecutarlo en CPU y en entornos de telefonia con recursos limitados.

Su relevancia practica esta en la decision incremental: al emitir una probabilidad tras cada ventana de 0,48 s, el sistema puede decidir mientras la llamada sigue en curso, con una precision balanceada de 0,868 a los 0,98 s de audio y 0,965 a los 2,90 s. El modelo solo procesa audio telefonico a 8 kHz y como maximo 3 s, y los datos de entrenamiento no se han publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YAMNet congelado (extractor de embeddings) + Dense(32, tanh) + GRU(48) + Dense(1, sigmoid) |
| Parametros totales | 44.657 parametros entrenables (el backbone YAMNet es congelado y no se cuenta) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 3 s de audio de entrada; ventanas de 0,96 s con paso de 0,48 s |
| Tipos de cuantizacion | no disponible (pesos en formato Keras; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (clasificacion acustica no linguistica; el autor no declara idiomas) |
| Licencia | no disponible |
| Formato de pesos | Keras (`amd_gru.keras`) + JSON de calibracion + `config.yaml`; YAMNet se obtiene de TensorFlow Hub |
| Frecuencia de muestreo | 8 kHz (audio telefonico) |
| Salida | `p(machine)` por ventana y decision binaria con umbral calibrado (0,452) |
| Calibracion | temperatura 1,156 y umbral 0,452 ajustados sobre validacion |

## Arquitectura y entrenamiento

El modelo sigue un diseno en cascada. El audio de entrada (8 kHz) se preprocesa rellenando los tramos de silencio digital exacto de duracion igual o superior a 10 ms con ruido a -70 dBFS, se filtra con un Butterworth causal de orden 8 a 3,6 kHz y se remuestrea a 16 kHz. YAMNet, congelado, genera un embedding de 1.024 dimensiones por cada ventana de 0,96 s con solapamiento de 0,48 s. Sobre esa secuencia actua una capa densa de 32 unidades (tanh), una GRU de 48 unidades y una capa densa final con sigmoid. El resultado es una probabilidad de maquina tras cada ventana, lo que habilita la decision incremental.

El entrenamiento usa 2.175 clips humanos (primera respuesta del interlocutor en llamadas salientes, de hasta 3 s, a 8 kHz) y 3.000 clips de maquina etiquetados por proveedor (buzon de voz, filtros de llamadas, IVR, tonos de red, pitidos), mas 7.000 clips de maquina adicionales en holdout. Los splits son 80/10/10 por llamada, de modo que ninguna llamada aparece en dos conjuntos. Para evitar atajos, ambas clases reciben el mismo silencio aleatorio inicial (0-1 s) y final (0-0,5 s) generado a partir del ruido de fondo del propio clip, y los clips de maquina se recortan a longitudes muestreadas de los clips humanos. Las ventanas por debajo de -50 dBFS reciben peso cero en el entrenamiento. La mejor epoca fue la 4 segun perdida de validacion. No se documenta uso de RLHF ni DPO; es un clasificador supervisado.

## Capacidades

- Clasificacion binaria humano/maquina sobre el audio inicial de una llamada saliente.
- Decision incremental: emite `p(machine)` cada 0,48 s, permitiendo actuar antes de que termine el clip.
- Deteccion especifica de buzon de voz, filtros de llamadas, IVR, tonos de red y pitidos.
- Preprocesamiento autocontenido en `inference.py` (relleno de silencio, filtrado paso bajo, remuestreo, recorte a 3 s).
- Entrada de audio mono en coma flotante a cualquier frecuencia de muestreo (el script remuestrea internamente).
- Calibracion de temperatura y umbral incluida para ajustar el punto de operacion.
- No soporta tool calling, agentes, vision, audio general ni generacion de texto: es un clasificador acustico especifico.

## Casos de uso

- Enrutamiento de llamadas salientes en contact centers: si el detector marca "maquina" en los primeros 1,5-2 s, el sistema cuelga o deja un mensaje pregrabado en lugar de conectar a un agente, ahorrando tiempo de operador.
- Marcadores predictivos y dialers: integrado en el pipeline de marcacion, permite decidir si transferir la llamada a un agente humano o a un flujo de buzon de voz con la precision balanceada de 0,927 a 1,46 s de audio.
- Deteccion de buzon de voz en campanas de notificacion: con una recall de maquina de 0,974 en la categoria voicemail, el modelo identifica el buzon y dispara la grabacion del mensaje.
- Filtrado de IVR y arboles de menu: la recall de 0,948 en IVR permite derivar la llamada a un bot de navegacion de menus o abandonar antes de consumir tiempo de agente.
- Deteccion de tonos de red y pitidos: con recall de 0,955 en tonos de red, evita que el sistema trate numeros no asignados o fallos de red como contestaciones humanas.
- Analitica de calidad de campanas: el modelo puede etiquetar retroactivamente grabaciones de llamadas para medir la tasa real de contacto humano frente a maquina.
- Despliegue en telefonia embebida: con 44.657 parametros entrenables y YAMNet congelado, puede ejecutarse en CPU junto al stack de telefonia sin GPU dedicada.

## Benchmarks y rendimiento

Resultados sobre test (212 clips humanos + 300 de maquina) y holdout (7.000 clips de maquina), decision tras el clip completo:

| Umbral | Recall humano | Recall maquina (test) | Recall maquina (holdout) | Precision balanceada | AUC |
|---|---|---|---|---|---|
| 0,5 | 0,972 | 0,950 | 0,962 | 0,961 | 0,993 |
| 0,452 (calibrado) | 0,962 | 0,963 | 0,965 | 0,963 (IC 95 %: 0,947-0,979) | 0,993 |

Decision tras k ventanas (test, umbral 0,452):

| Audio escuchado | 0,98 s | 1,46 s | 1,94 s | 2,42 s | 2,90 s |
|---|---|---|---|---|---|
| Precision balanceada | 0,868 | 0,927 | 0,940 | 0,958 | 0,965 |

Recall de maquina por categoria (test + holdout): voicemail 0,974; tonos de red 0,955; filtro de llamadas 0,949; IVR 0,948. Las categorias mas dificiles son buzon de voz personalizado, clics y saludos que solo contienen el nombre (aproximadamente 0,86-0,89).

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo entrenable son 44.657 parametros y YAMNet es un backbone pequeno que puede ejecutarse en CPU.
- GPU recomendadas: no aplica para produccion tipica; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) aceleraria la inferencia, pero no es necesaria.
- Cabe en GPU consumer: si, aunque el caso de uso natural es CPU junto al stack de telefonia.
- Opciones de despliegue: TensorFlow/Keras con `inference.py` incluido; requiere `tensorflow`, `tensorflow-hub`, `soundfile`, `scipy`, `numpy` y `huggingface_hub`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (no es un modelo generativo).
- Latencia y throughput: no se publican cifras de latencia ni throughput. La decision incremental esta disponible a los 0,48 s de audio procesado; la precision balanceada alcanza 0,868 con 0,98 s de audio y 0,965 con 2,90 s.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto de audio | Precision balanceada | Licencia |
|---|---|---|---|---|---|
| AIAMD (este) | YAMNet + GRU | 44.657 entrenables | hasta 3 s | 0,963 (test) | no disponible |
| Modelo de referencia del articulo (Altwlkany et al., 2024) | Red recurrente sobre caracteristicas acusticas | no disponible | 4 s | no disponible en la informacion proporcionada | no disponible |
| Modelo gradient-boosted con caracteristicas de timing, sonoridad y MFCC (mencionado en la model card) | GBDT sobre caracteristicas manuales | no disponible | no disponible | recall de maquina de 0,94 con recall humano del 99 % | no disponible |

No se dispone de datos publicados para comparar con alternativas comerciales de AMD ni con otros modelos abiertos de la misma tarea en la informacion proporcionada.

## Limitaciones y advertencias

- Canal de grabacion: todo el audio humano proviene de un unico dialer y todo el de maquina de un unico proveedor, por lo que parte de lo aprendido puede ser el canal de grabacion. Las puntuaciones sobre audio de otros sistemas pueden ser inferiores.
- Objetivos estrictos de seguridad para humanos: la validacion tiene solo 220 clips humanos, insuficiente para fijar de forma fiable un umbral con 99 % de recall humano; en test el umbral calibrado da 96,2 %. Con 99 % de recall humano solo se detecta alrededor del 73 % de las maquinas. En ese mismo escenario, un modelo gradient-boosted con caracteristicas manuales detectaba el 94 %. El umbral debe elegirse sobre datos propios.
- Duracion maxima de 3 s de audio (los clips de entrenamiento eran de 3 s o menos); el articulo original usa 4 s.
- Las etiquetas se filtraron automaticamente, no se revisaron a oido.
- Solo audio telefonico a 8 kHz.
- Licencia no declarada: no hay autorizacion explicita para uso comercial; debe contactarse con el autor antes de integrarlo en produccion.
- Riesgo de falsos positivos en clips humanos con puntuaciones altas de "maquina", segun reconoce el propio autor.
- Sin datos de sesgo linguistico ni demografico; al ser un clasificador acustico, el rendimiento puede variar segun acentos, ruido de fondo y calidad del canal.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kugu/AIAMD
- Articulo de referencia: https://arxiv.org/abs/2410.08235
- YAMNet en TensorFlow Hub: https://tfhub.dev/google/yamnet/1
