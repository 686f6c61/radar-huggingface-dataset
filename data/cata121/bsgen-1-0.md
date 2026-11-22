# cata121/bsgen-1.0

## Resumen

bsgen-1.0 es una familia de modelos neuronales de pequeno tamano desarrollada por el usuario cata121 para la generacion automatica de mapas del videojuego de ritmo Beat Saber. A diferencia de un unico modelo generativo de texto, el repositorio agrupa varios componentes especializados que cubren el pipeline completo: un modelo de mapa (65 millones de parametros), un modelo de ritmo (47 millones), dos modelos de iluminacion (11 y 7 millones), un modelo de jugador (38 millones) y utilidades auxiliares para etiquetado, estimacion de dificultad en estrellas y deteccion de BPM.

El proyecto se distribuye como una serie de lanzamientos etiquetados (v1.0 a v1.5) que documentan la evolucion del entrenamiento y las capacidades anadidas en cada iteracion. Los pesos se publican en formato safetensors acompanados de ficheros JSON de configuracion y ficheros NPZ con datos auxiliares. El modelo de mapa llega en la version 1.5 a generar swings laterales y notas sueltas al estilo de los mappers humanos, mientras que la version 1.4 incorpora cadenas (chains) y parametros de configuracion para el numero de arcos y cadenas.

Es relevante para desarrolladores e investigadores interesados en generacion procedural de contenido musical, en pipelines multimodelo de pequena escala y en la aplicacion de tecnicas de modelado secuencial a dominios no textuales. El entrenamiento es notablemente economico: la version 1.2 del modelo de mapa se entreno desde cero en unos 70 minutos en una sola H100, y el modelo de jugador en aproximadamente una hora.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (varios modelos especializados; no se especifica el tipo de red) |
| Parametros totales | 65 M (mapa) + 47 M (ritmo) + 11 M (lightseq) + 7 M (lights) + 38 M (jugador) + auxiliares no cuantificados |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors, JSON de configuracion, NPZ (datos auxiliares) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de ningun componente. Se trata de una coleccion de modelos independientes y especializados: `map` (65 M) genera la disposicion de notas del mapa, `rhythm` (47 M) decide cuando aparecen las notas, `lightseq` (11 M) procesa la cancion completa de una vez para generar iluminacion y `lights` (7 M) es el modelo de iluminacion anterior. El modelo `player` (38 M) reproduce un mapa como movimiento de cabeza y manos y lo exporta como replay. Los ficheros `labeler.safetensors` asignan a cada nota la mano y el tipo de golpe (forehand o backhand), y `rating.npz` y `song_stars.npz` estiman estrellas a partir de las notas de un mapa y del audio de una cancion respectivamente. `timing.safetensors` y `octave.npz` se ocupan de la deteccion de BPM.

El historial de entrenamiento documentado en la model card es el siguiente: v1.1 se entreno en unos 40 minutos en una H100 y despues se ajusto finamente durante 50 minutos en una RTX 3060 ponderando de forma mas uniforme todos los niveles de estrellas; v1.2 se entreno desde cero en unos 70 minutos en una H100 sobre un conjunto mayor de canciones; v1.3 anadio el modelo de ritmo y `pattern_plan.npz`, usado por el modelo de mapa; v1.4 incorporo cadenas y parametros de configuracion de arcos y cadenas, ademas del modelo `lightseq`; v1.5 anadio el modelo `lightseq` como novedad y mantiene swings laterales y notas sueltas. No se especifican el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de mapas de Beat Saber con notas, direcciones de corte y patrones de swing.
- Generacion de cadenas (chains) y configuracion del numero de arcos y cadenas (desde v1.4).
- Generacion de swings laterales y notas sueltas al estilo de mappers humanos (v1.5).
- Prediccion del ritmo y de los instantes en que aparecen las notas (modelo `rhythm`, desde v1.3).
- Generacion de iluminacion a partir del audio completo de la cancion (modelo `lightseq`, desde v1.4).
- Reproduccion de mapas como movimiento de cabeza y manos y exportacion a formato replay (modelo `player`).
- Etiquetado de mano y tipo de golpe por nota (forehand/backhand) mediante `labeler.safetensors`.
- Estimacion de dificultad en estrellas a partir de las notas de un mapa y del audio de una cancion.
- Deteccion de BPM mediante `timing.safetensors` y `octave.npz`.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio general ni multilingue.

## Casos de uso

- Generacion automatica de mapas para Beat Saber: el modelo `map` produce la disposicion de notas y el modelo `rhythm` decide su temporizacion, de modo que un usuario puede obtener un mapa jugable a partir de una cancion sin intervencion manual.
- Creacion de contenido para la comunidad de modding: los mappers pueden usar el modelo como punto de partida y ajustar despues los patrones generados, aprovechando la capacidad de v1.5 de producir swings laterales y notas sueltas.
- Iluminacion automatica de mapas: el modelo `lightseq` procesa la cancion completa de una vez y genera la secuencia de luces, lo que permite publicar mapas con iluminacion coherente sin trabajo manual.
- Validacion y evaluacion de mapas: los ficheros `rating.npz` y `song_stars.npz` permiten estimar la dificultad en estrellas de un mapa existente o de una cancion, util para clasificar contenido en repositorios de mapas.
- Investigacion en generacion procedural musical: la familia de modelos sirve como banco de pruebas de bajo coste (entrenamientos de 40 a 70 minutos en una H100) para estudiar la generacion condicionada por audio en dominios estructurados.
- Desarrollo de herramientas de analisis de replays: el modelo `player` convierte un mapa en una secuencia de movimiento de cabeza y manos, lo que permite simular partidas y analizar la viabilidad o el esfuerzo fisico de un mapa antes de publicarlo.
- Deteccion de BPM y alineacion temporal: `timing.safetensors` y `octave.npz` permiten obtener el tempo de una cancion como paso previo a la generacion de mapas o a la sincronizacion de luces.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con los tamanos indicados (65 M, 47 M, 38 M, 11 M y 7 M de parametros) la inferencia cabe holgadamente en GPUs de consumo, pero no se proporcionan cifras de VRAM.
- GPU recomendadas: no se especifican para inferencia. Para entrenamiento se documentan una H100 y una RTX 3060.
- Cabe en GPU de consumo: si, segun los tamanos de parametros; el ajuste fino de v1.1 se realizo en una RTX 3060.
- Opciones de despliegue: no se documentan frameworks de servicio (vLLM, llama.cpp, Ollama, TGI). Los pesos se distribuyen en safetensors y el codigo asociado esta en el repositorio de GitHub del proyecto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de generacion de mapas de Beat Saber ni datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos ni evaluaciones de equidad.
- No se documenta el riesgo de alucinacion en terminos de calidad de los mapas generados; no obstante, al ser un modelo generativo, los mapas producidos pueden contener patrones no jugables o inconsistentes con el ritmo.
- No se especifican los idiomas soportados ni limitaciones de contexto; el dominio esta acotado a la generacion de contenido para Beat Saber.
- La licencia AGPL-3.0 impone obligaciones de copyleft: cualquier uso modificado distribuido o servicio en red basado en el modelo debe publicar el codigo fuente bajo la misma licencia. Es una restriccion relevante para uso comercial.
- El proyecto se describe como experimental; las versiones v1.0 a v1.5 documentan cambios frecuentes de comportamiento y capacidades, por lo que la estabilidad entre lanzamientos no esta garantizada.
- No se detalla el dataset de entrenamiento ni su procedencia, lo que limita la evaluacion de posibles problemas de derechos de autor sobre las canciones o mapas usados.
- No se proporcionan garantias de soporte ni mantenimiento del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cata121/bsgen-1.0
- Repositorio del proyecto: https://github.com/cata02222/bsgen
