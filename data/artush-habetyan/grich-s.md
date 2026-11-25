# artush-habetyan/grich-s

## Resumen

Grich-S es un modelo de restauracion de puntuacion para armenio oriental, desarrollado por el usuario de Hugging Face artush-habetyan. Su funcion es anadir los signos de puntuacion armenios (`։ , ՝ ․ ՞ ՛ ՜ « »` y el guion) a texto que se ha escrito sin ellos, ademas de capitalizar el inicio de frase, sin modificar ninguna letra del texto original. Se distribuye como un encoder de 47,8 millones de parametros exportado a ONNX en cuantizacion de 8 bits (49,8 MB), pensado para ejecutarse solo en CPU dentro de un teclado de Android.

El modelo aborda un problema muy concreto y poco cubierto: la mayoria de los sistemas de puntuacion automatica se centran en ingles u otras lenguas mayoritarias, y el armenio oriental carece de herramientas ligeras y desplegables en dispositivo. Grich-S se posiciona como una alternativa on-device con latencias de 23 ms para una frase de 30 palabras y 8 ms para una de 5 palabras en un Pixel 7, lo que lo hace viable para correccion en tiempo real mientras el usuario escribe.

La relevancia actual del modelo radica en su enfoque de etiquetado a nivel de hueco entre letras (token classification sobre los espacios) combinado con un decodificador determinista, y en unos resultados que, segun la model card, superan al mejor modelo publico de puntuacion para armenio (AraG-punct) y se acercan a modelos propietarios de gran tamano como Claude Sonnet 5.5 en el conjunto de prueba HamaKet.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (tipo no especificado) para token classification sobre huecos entre letras |
| Parametros totales | 47,8 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (ONNX, 49,8 MB); no se detallan otras |
| Idiomas soportados | Armenio oriental (codigo `hy`), ortografia reformada, norma escolar |
| Licencia | no disponible |
| Formato de pesos | ONNX (`bundle/model/punct_int8.onnx`) |

## Arquitectura y entrenamiento

Grich-S es un encoder de 47,8 millones de parametros que trata la puntuacion como una tarea de etiquetado de tokens: cada hueco entre dos letras recibe una etiqueta que indica una edicion exacta (mantener el hueco tal cual o insertar una cadena concreta de signos). Un decodificador determinista convierte esas etiquetas en el texto final, lo que garantiza que nunca se altere una letra y que la salida sea reproducible. El modelo se exporta a ONNX en INT8 para inferencia exclusiva en CPU.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card indica que el modelo se adapto sobre otros documentos de los mismos treebanks que el conjunto de prueba HamaKet, lo que le confiere conocimiento de la norma de los editores de dichos corpus, y advierte que parte del texto de entrenamiento fue puntuado por un LLM y que un revisor humano cuestiono parte de esa puntuacion. El repositorio incluye el codigo de inferencia, el tokenizador, el inventario de clases y el modelo en `bundle/`.

## Capacidades

- Restauracion de puntuacion en armenio oriental: inserta `։ , ՝ ․ ՞ ՛ ՜ « »` y el guion, incluidos los tres signos que se colocan dentro de la palabra.
- Capitalizacion del inicio de frase.
- Preservacion integra del texto: no modifica, corrige ni elimina letras.
- Etiquetado por huecos con decodificacion determinista, lo que produce salidas estables y auditables.
- Inferencia en CPU y en dispositivo (on-device), sin necesidad de GPU.
- Procesamiento por lineas: acepta un texto por linea en modo batch (`python punctuate.py < input.txt > output.txt`).
- Interfaz web local mediante Gradio (`python app.py`).
- No se documentan capacidades de generacion libre, razonamiento, codigo, matematicas, vision, tool calling, agentes ni audio.

## Casos de uso

- Teclados moviles en Android: el modelo se integra en el teclado para anadir puntuacion mientras el usuario escribe, gracias a sus 49,8 MB en INT8 y latencias de 8-23 ms en un Pixel 7, sin consumir GPU ni enviar texto a la nube.
- Normalizacion de transcripciones y mensajes sin puntuar: convierte cadenas de texto plano (por ejemplo, de chats o notas) en frases con puntuacion armenia correcta antes de archivarlas o publicarlas.
- Preprocesado para TTS y ASR en armenio: la puntuacion restaurada mejora la prosodia en sintesis de voz y la segmentacion en transcripcion automatica.
- Limpieza de corpus y datasets: procesa ficheros linea a linea para dotar de puntuacion a textos que la perdieron en pipelines de extraccion o scraping.
- Correccion editorial asistida: ayuda a editores a aplicar la norma escolar armenia en borradores, revisando despues los signos mas debiles (`․`, `՛`, `՞`, `՝`).
- Herramientas de accesibilidad: mejora la legibilidad de texto para lectores de pantalla y usuarios con dificultades de lectura al anadir pausas y estructura.
- Aplicaciones offline y de privacidad: al ejecutarse localmente en CPU, permite puntuar texto sin conexion y sin exponer contenido sensible.

## Benchmarks y rendimiento

Resultados publicados en la model card. Conjuntos de prueba: HamaKet (1.144 frases de treebank puntuadas por humanos, evaluadas donde tres fuentes coinciden), dialogos de libros (272 pasajes) y el devtest armenio de FLORES-200 (1.011 frases). Los LLM se evaluaron en zero-shot.

| Sistema | HamaKet F1 | Errores HamaKet | Frases exactas HamaKet | Libros F1 | FLORES F1 |
|---|---|---|---|---|---|
| Grich-S | 0,926 | 315 | 83,0 % | 0,796 | 0,860 |
| Claude Opus 5.5 | 0,970 | 129 | 92,5 % | 0,837 | 0,881 |
| Claude Sonnet 5.5 | 0,919 | 345 | 80,6 % | 0,802 | 0,863 |
| Claude Haiku 5.5 | 0,868 | 543 | 71,6 % | 0,718 | 0,824 |
| Mejor modelo publico (AraG-punct) | 0,785 | 1.086 | 53,7 % | 0,510 | 0,781 |

En frases simples (sin comillas, guion ni puntos suspensivos), Grich-S acierta el 88,2 % de las frases de HamaKet de forma exacta y el 85,4 % de las revisadas por humanos. Sus signos mas debiles son `․`, `՛`, `՞` y `՝`. La model card advierte que Grich-S se adapto sobre otros documentos de los mismos treebanks, por lo que en HamaKet conoce la norma de sus editores; los otros dos conjuntos no otorgan esa ventaja a ningun sistema.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo esta pensado para CPU (49,8 MB en INT8).
- GPU recomendadas: no aplica; no se documenta uso en GPU.
- Consumer GPU: no aplica; cabe en cualquier dispositivo con CPU, incluidos moviles.
- Despliegue: ONNX Runtime en CPU; scripts `punctuate.py` (CLI y batch) y `app.py` (interfaz Gradio local). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 23 ms para una frase de 30 palabras y 8 ms para una de 5 palabras en un Pixel 7 dentro de un teclado Android.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HamaKet F1 | Libros F1 | FLORES F1 | Licencia | Despliegue |
|---|---|---|---|---|---|---|---|
| Grich-S | 47,8 M | no disponible | 0,926 | 0,796 | 0,860 | no disponible | ONNX INT8, CPU, on-device |
| Claude Opus 5.5 | no disponible | no disponible | 0,970 | 0,837 | 0,881 | propietaria | API en la nube |
| Claude Sonnet 5.5 | no disponible | no disponible | 0,919 | 0,802 | 0,863 | propietaria | API en la nube |
| Claude Haiku 5.5 | no disponible | no disponible | 0,868 | 0,718 | 0,824 | propietaria | API en la nube |
| AraG-punct | no disponible | no disponible | 0,785 | 0,510 | 0,781 | no disponible | no disponible |

Grich-S es el unico sistema de la comparativa disenado para ejecucion local en dispositivo; los modelos Claude son propietarios y requieren API, y AraG-punct es el mejor modelo publico previo segun la model card, con rendimiento claramente inferior en HamaKet y libros.

## Limitaciones y advertencias

- Cobertura limitada al armenio oriental en ortografia reformada y una unica norma (la escolar); no cubre armenio occidental ni ortografia clasica.
- El dialogo es la parte mas dificil: el texto que abarca varias lineas se decodifica linea a linea, lo que puede romper la coherencia de la puntuacion entre lineas.
- El modelo solo anade signos; no corrige ortografia, palabras ni errores gramaticales.
- Parte del texto de entrenamiento fue puntuado por un LLM y un revisor humano cuestiono parte de esa puntuacion, lo que puede introducir ruido en la norma aprendida.
- La ventaja en HamaKet puede estar inflada por la adaptacion a documentos de los mismos treebanks; los resultados en libros y FLORES son mas representativos de un uso general.
- Los signos `․`, `՛`, `՞` y `՝` son los mas propensos a error.
- La licencia no esta disponible, por lo que no puede confirmarse el uso comercial; debe verificarse antes de integrarlo en produccion.
- No se documentan sesgos especificos, pero al entrenarse sobre treebanks editoriales puede reproducir la norma de esos editores y no otras convenciones validas.
- Riesgo de alucinacion limitado por diseno (solo inserta signos y no altera letras), pero puede insertar puntuacion incorrecta en contextos ambiguos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/artush-habetyan/grich-s
- Dataset HamaKet (conjunto de prueba, scorer y salidas de todos los sistemas): https://huggingface.co/datasets/artush-habetyan/hamaket
