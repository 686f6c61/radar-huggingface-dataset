# fafsaf1/flowhmr-0.46B

## Resumen

FlowHMR es un modelo de captura de movimiento (motion capture) humana en 3D a partir de video monoculo, desarrollado por el usuario fafsaf1 y publicado en Hugging Face bajo el identificador `fafsaf1/flowhmr-0.46B`. No es un modelo de lenguaje: es un modelo de generacion de movimiento condicionado por video que reformula la recuperacion de movimiento humano como un problema de generacion condicional, en lugar de regresion directa. El nombre del repositorio sugiere 0,46 mil millones de parametros, aunque este dato no se confirma de forma explicita en la informacion disponible.

El problema que aborda es la ambiguedad en profundidad inherente al video monoculo: la regresion directa tiende a colapsar hacia soluciones promediadas y produce movimientos que no son fisicamente plausibles, lo que hace fracasar el tracking basado en fisica. FlowHMR preentrena un modelo de flow matching para generar candidatos de movimiento diversos y despues lo post-entrena con Group Relative Policy Optimization (GRPO) usando dos recompensas: fidelidad al video y trackeabilidad fisica. El resultado reportado es una tasa de exito de tracking fisico del 82,47%, frente al 62,82% del mejor baseline (GVHMR).

La relevancia actual reside en que combina generacion por flow matching con RL post-entrenamiento (GRPO) aplicado a un dominio no linguistico, y en que introduce Wild-4K, un conjunto de evaluacion de aproximadamente 4.000 videos de internet para medir recuperacion de movimiento en condiciones reales. El modelo se distribuye con licencia restrictiva solo para uso no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow matching condicionado por video (generacion de movimiento), con post-entrenamiento GRPO |
| Parametros totales | 0,46B (segun el identificador del repositorio; no confirmado explicitamente en la model card) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de movimiento, no de texto) |
| Licencia | FlowHMR Model Weights License (otros; solo uso no comercial educativo, de investigacion y sin animo de lucro) |
| Formato de pesos | no disponible (el repositorio incluye configs `flowhmr_base` y `flowhmr_latest`; tamano del repo 3,7 GB) |

## Arquitectura y entrenamiento

FlowHMR formula la captura de movimiento desde video como un problema de generacion de movimiento condicionado por video. En lugar de regresar directamente los parametros de movimiento desde el video con supervision geometrica, preentrena un modelo de flow matching que, dado un video de entrada, genera multiples candidatos de movimiento diversos. Esta eleccion ataca el colapso hacia la media que sufre la regresion directa bajo ambiguedad de profundidad.

Sobre ese modelo preentrenado se aplica un post-entrenamiento con Group Relative Policy Optimization (GRPO) con dos recompensas: una recompensa de fidelidad que premia la consistencia con el video de entrada y una recompensa de tracking que favorece movimientos que un controlador basado en fisica puede seguir con exito. El ajuste desplaza la preferencia de salida del modelo hacia movimientos fieles al video y fisicamente plausibles. El trabajo introduce ademas Wild-4K, un dataset de evaluacion de aproximadamente 4.000 videos de internet para medir recuperacion de movimiento en condiciones no controladas. No se detalla en la informacion disponible el numero de tokens ni la composicion exacta del dataset de entrenamiento.

## Capacidades

- Generacion de movimiento humano 3D global fisicamente plausible a partir de video monoculo.
- Generacion de multiples candidatos de movimiento diversos dada una misma entrada de video (muestreo por flow matching).
- Recuperacion de movimiento global (no solo pose relativa), segun el abstract.
- Fidelidad al video de entrada, optimizada explicitamente mediante recompensa durante el post-entrenamiento.
- Trackeabilidad fisica: los movimientos generados son aptos para seguimiento por un controlador basado en fisica.
- Evaluacion en video "in the wild" mediante el dataset Wild-4K.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): procesa video como entrada; no se documentan otras modalidades.

## Casos de uso

- Animacion y produccion audiovisual: generar movimiento 3D global a partir de metraje monoculo para retargeting sobre personajes digitales, aprovechando que el modelo produce movimiento fisicamente plausible en lugar de poses que se rompen al aplicarse a un rig.
- Analisis deportivo: reconstruir la trayectoria global del deportista desde video de una sola camara, usando la fidelidad al video como garantia de que el movimiento generado corresponde al gesto observado.
- Robotica humanoide y aprendizaje por imitacion: emplear los movimientos generados como referencia para un controlador fisico, dado que el post-entrenamiento con recompensa de tracking optimiza explicitamente la trackeabilidad.
- Captura de movimiento de bajo coste: sustituir sistemas multi-camara o trajes de captura por video monoculo en prototipado y previsualizacion, con generacion de candidatos diversos para seleccion manual.
- Investigacion en vision por computador: usar el modelo como baseline y Wild-4K como banco de evaluacion para metodos de recuperacion de movimiento humano en condiciones reales.
- Monitorizacion y ergonomia: analizar movimiento corporal global en video para estudios de postura y movimiento, apoyandose en la plausibilidad fisica de las trayectorias generadas.
- Generacion de datos sinteticos de movimiento: muestrear multiples candidatos de movimiento para una misma entrada y filtrar por plausibilidad fisica antes de usarlos en pipelines de entrenamiento.

## Benchmarks y rendimiento

Los unicos datos cuantitativos publicados en la informacion disponible son los de exito de tracking fisico sobre Wild-4K:

| Metrica | FlowHMR | GVHMR (mejor baseline) |
|---|---|---|
| Tasa de exito de tracking fisico | 82,47% | 62,82% |

El abstract indica que, en experimentos cualitativos y cuantitativos sobre Wild-4K, el metodo supera a los metodos estado del arte en fidelidad de movimiento global. No se han publicado en la informacion disponible resultados numericos de fidelidad (por ejemplo, errores de pose o de trayectoria) ni de otros benchmarks estandar de captura de movimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el tamano del repositorio es de 3,7 GB, lo que da una referencia del orden de magnitud de los pesos.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el tamano de pesos (~3,7 GB) es compatible en terminos de memoria con GPU de consumo actuales, pero no se documentan requisitos oficiales.
- Opciones de despliegue: no disponible; el proyecto remite al repositorio de codigo en GitHub para la implementacion.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (tracking fisico en Wild-4K) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FlowHMR | 0,46B (segun identificador) | no disponible | 82,47% | FlowHMR Model Weights License (no comercial) | Pesos en Hugging Face, codigo en GitHub |
| GVHMR | no disponible | no disponible | 62,82% | no disponible | no disponible |
| Otros metodos de HMR basados en regresion | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion disponible solo permite comparar con GVHMR en la metrica de exito de tracking fisico. No se dispone de datos de parametros, contexto ni licencia de los modelos alternativos.

## Limitaciones y advertencias

- Licencia restrictiva: los pesos se liberan solo para uso no comercial educativo, de investigacion y sin animo de lucro. Cualquier uso comercial requiere contacto con el autor (zhankewang0@gmail.com).
- La licencia cubre unicamente los pesos del modelo; el codigo fuente se rige por otra licencia en el repositorio, y el software de terceros, modelos preentrenados, assets de body-model y datasets mantienen sus licencias respectivas.
- Ambiguedad de profundidad: el propio planteamiento del modelo reconoce que la recuperacion de movimiento desde video monoculo es ambigua en profundidad; los candidatos generados pueden no ser unicos.
- No todos los candidatos generados son fieles al video ni trackeables; el post-entrenamiento desplaza la preferencia, pero no garantiza que toda muestra sea valida.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion de movimiento: no cuantificado en la informacion disponible; la naturaleza generativa del modelo implica que puede producir movimiento plausible pero no observado en el video.
- Limitaciones de contexto o idioma: no aplicables o no disponibles (modelo de movimiento, no de texto).
- Caveats para produccion: no se documentan requisitos de hardware, latencia ni formato de pesos, lo que dificulta una evaluacion de despliegue sin consultar el repositorio de codigo.

## Enlaces

- Hugging Face: https://huggingface.co/fafsaf1/flowhmr-0.46B
- Arbol de ficheros del repositorio: https://huggingface.co/fafsaf1/flowhmr-0.46B/tree/main
- Licencia de pesos: https://huggingface.co/fafsaf1/flowhmr-0.46B/blob/main/LICENSE
- Paper: https://arxiv.org/abs/2610.03691
- Codigo: https://github.com/flowhmr/flowhmr
- Pagina del proyecto: https://flowhmr.github.io/
