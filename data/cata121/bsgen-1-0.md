# cata121/bsgen-1.0

## Resumen

bsgen-1.0 es un conjunto de tres modelos pequenos publicados por el usuario cata121 en HuggingFace, pensados como motor de [bsgen](https://github.com/cata02222/bsgen), un generador experimental de mapas para el videojuego de ritmo Beat Saber. No es un modelo de lenguaje: el paquete incluye un modelo de generacion de mapas (65 millones de parametros), un modelo de "jugador" que produce el movimiento de cabeza y manos en forma de replay (38 millones de parametros) y un modelo de deteccion de BPM para alinear la generacion con la pista de audio.

El interes practico esta en su tamano reducido y su coste de entrenamiento: el modelo de mapas se entreno en unos 40 minutos sobre una unica H100 y se ajusto finamente durante 50 minutos en una RTX 3060; el modelo de jugador se entreno en unos 20 minutos en una H100. Son cifras de entrenamiento de nivel aficionado, muy por debajo de los presupuestos habituales de modelos generativos, lo que lo convierte en un caso de estudio util para generacion de contenido procedural especializado y para experimentacion de bajo coste.

La informacion publicada es muy escasa: la model card no detalla arquitectura, datos de entrenamiento, longitud de contexto ni idiomas, y no hay resultados de benchmarks. El repositorio ocupa 0,7 GB e incluye los pesos en formato safetensors junto con ficheros de configuracion JSON y un `octave.npz` para el modelo de timing.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la model card no especifica la arquitectura de ninguna de las tres redes) |
| Parametros totales | 103 millones en total: 65 M (map model) + 38 M (player model) + modelo de timing de tamano no especificado |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors; no se documentan variantes GGUF, int8 ni int4) |
| Idiomas soportados | No disponible (el modelo no procesa lenguaje natural; trabaja con audio, eventos de mapa y movimiento) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (`map.safetensors`, `player.safetensors`) con configuracion JSON (`map.json`, `player.json`) y `octave.npz` para el detector de BPM |

Desglose de componentes:

| Componente | Ficheros | Parametros | Funcion |
|---|---|---|---|
| Map model | `map.safetensors`, `map.json` | 65 M | Generacion de mapas de Beat Saber |
| Player model | `player.safetensors`, `player.json` | 38 M | Generacion de replays (movimiento de cabeza y manos) |
| Timing | `timing.safetensors`, `octave.npz` | No disponible | Deteccion de BPM |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna: no se indica si son transformers, redes convolucionales, modelos basados en estado (SSM) ni que tipo de tokenizacion usan para representar los eventos del mapa o el audio. Tampoco se detalla la composicion del dataset de entrenamiento, el numero de tokens o ejemplos vistos, ni si se aplicaron tecnicas de alineamiento como RLHF o DPO. Lo unico documentado es el procedimiento de entrenamiento: 40 minutos en una H100 para el modelo de mapas, seguido de un ajuste fino de 50 minutos en una RTX 3060 con un reponderado de niveles de dificultad ("star level") de 1,1 para equilibrar la distribucion; y 20 minutos en una H100 para el modelo de jugador, etiquetado tambien como version 1.1. El modelo de timing se distribuye por separado para la deteccion de BPM.

No se documenta ninguna innovacion tecnica especifica (decodificacion especulativa, atencion lineal, destilacion ni similares). El modelo de jugador es el componente menos habitual del conjunto: en lugar de predecir texto, emite una secuencia de movimiento de cabeza y manos que se serializa directamente como replay, lo que sugiere una formulacion de prediccion de series temporales condicionada por el mapa y el audio, aunque el detalle no se hace publico.

## Capacidades

- Generacion de mapas de Beat Saber a partir de audio, con el modelo de 65 M de parametros.
- Generacion de replays jugables: el modelo de jugador produce movimiento de cabeza y manos compatible con el formato de replay del juego.
- Deteccion de BPM y analisis de tempo mediante el componente de timing y `octave.npz`.
- Modelado de dificultad: el ajuste fino con reponderado de "star level" a 1,1 indica control (al menos parcial) sobre la dificultad del mapa generado.
- Ejecucion en hardware de consumo: los tres modelos suman 0,7 GB de repositorio.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio general ni capacidades multilingues: es un modelo de dominio especifico para Beat Saber.

## Casos de uso

- Generacion automatica de mapas para Beat Saber: dado un fichero de audio, el map model produce la secuencia de bloques y cortes; el modelo de 65 M es lo bastante pequeno para ejecutarse en local sin GPU dedicada.
- Previsualizacion de mapas sin intervencion humana: el player model genera un replay del mapa recien creado, lo que permite validar que la secuencia es fisicamente jugable antes de publicarla.
- Herramienta de ayuda al mapeador: usar el modelo como generador de borradores que el mapeador humano corrige despues, aprovechando el control de dificultad del ajuste fino.
- Aumento de datasets: generar variantes de mapas y replays sinteticos para entrenar posteriores modelos de analisis de jugabilidad o de estimacion de dificultad.
- Analisis de tempo en pipelines de audio: el componente de timing puede usarse de forma aislada para detectar BPM en cualquier flujo que necesite sincronizacion con musica.
- Investigacion en generacion de contenido procedural: caso de estudio reproducible de bajo coste (menos de dos horas de GPU en total) para experimentar con arquitecturas generativas en dominios estructurados y no linguisticos.
- Mods y herramientas de la comunidad: integracion en el repositorio `bsgen` para generar mapas bajo demanda desde una interfaz de escritorio, al ser un modelo de menos de 1 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas de calidad de mapa, jugabilidad, fidelidad de replay ni precision en la deteccion de BPM, ni comparaciones con otros generadores de mapas de Beat Saber.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir del numero de parametros, no son cifras oficiales): 65 M en fp32 equivalen a ~260 MB y en fp16 a ~130 MB; los 38 M del player model, ~152 MB en fp32 y ~76 MB en fp16. Con overhead de runtime, el conjunto completo deberia moverse en el rango de 1-2 GB, y el repositorio entero pesa 0,7 GB.
- GPU recomendadas: cualquier GPU consumer moderna sirve; el entrenamiento documentado uso una H100 y una RTX 3060, lo que confirma que una RTX 3060 es suficiente al menos para ajuste fino.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs con 4 GB o menos. Tambien es viable en CPU para inferencia, dado el tamano.
- Opciones de despliegue: al no haber variantes GGUF ni soporte documentado de vLLM, TGI o llama.cpp, el despliegue previsto es mediante el codigo del repositorio `bsgen` cargando los safetensors directamente con la libreria de Python correspondiente.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tiempo de generacion por mapa ni de maps por segundo.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros generadores de mapas de Beat Saber con los que comparar parametros, contexto, rendimiento o licencia, y no se dispone de datos publicos de alternativas en esta ficha.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bsgen-1.0 (map + player) | 65 M + 38 M | No disponible | Sin benchmarks publicados | AGPL-3.0 | HuggingFace, 0 descargas, 1 like |
| Alternativas | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Documentacion minima: la model card no especifica arquitectura, datos de entrenamiento, contexto ni proceso de evaluacion, lo que impide auditar el modelo o reproducir el entrenamiento.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad de los mapas generados ni de la fidelidad de los replays; cualquier uso en produccion requiere evaluacion propia.
- Modelo experimental y sin traccion: 0 descargas y 1 like en el momento de la consulta, creado y actualizado en octubre de 2026, sin historial de mantenimiento.
- Licencia AGPL-3.0: es copyleft fuerte. El uso comercial es posible, pero cualquier obra derivada o servicio en red basado en el modelo obliga a liberar el codigo fuente bajo la misma licencia; conviene revisarlo antes de integrarlo en un producto.
- Riesgo de alucinacion en el sentido de generar secuencias de bloques fisicamente imposibles o no jugables; no hay mecanismo de validacion documentado mas alla del player model.
- Posible sesgo hacia los mapas presentes en el dataset de entrenamiento: el ajuste fino con reponderado de dificultad a 1,1 sugiere un desequilibrio previo en la distribucion de niveles, y no se documenta la composicion del corpus.
- Dependencia de derechos de terceros: los mapas de Beat Saber y las canciones empleadas en el entrenamiento pueden estar sujetos a derechos de autor; la licencia AGPL-3.0 del modelo no aclara la situacion de los datos.
- Inconsistencia de identidad: el autor figura como `cata121` en HuggingFace y como `cata02222` en la URL del repositorio de GitHub, lo que dificulta verificar la autoria y la cadena de custodia del modelo.
- Ambito muy restringido: no es reutilizable para tareas de lenguaje, vision o agentes; solo tiene sentido dentro del ecosistema Beat Saber.
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo; toda la informacion procede de la model card y de los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cata121/bsgen-1.0
- Repositorio del proyecto bsgen: https://github.com/cata02222/bsgen
- Paper, blog o demo oficiales: no disponible en la informacion proporcionada.
