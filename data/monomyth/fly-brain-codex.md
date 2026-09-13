# monomyth/fly-brain-codex

## Resumen

fly-brain-codex es un controlador experimental para un simulador nativo de brazo robotico en macOS, desarrollado por el usuario independiente monomyth y publicado en Hugging Face. No es un modelo de lenguaje ni una politica robotica preentrenada: se construye a partir de un conectoma MaleCNS derivado (mapa anatomico de cableado, no comportamiento aprendido) y se distribuye como un conjunto de artefactos que incluyen parametros aprendidos, activos de grafo disperso, caracteristicas y objetivos de entrenamiento congelados, y registros historicos de evaluacion.

El sistema convierte renders RGB frontales y de muneca a luminancia, los mapea a neuronas retinianas anotadas y ejecuta un grafo sensorial persistente y fijo sobre MLX/Metal; una cabeza motora aprendida y restringida corre en CPU y produce seis objetivos articulares mas la apertura de pinza a 2 Hz nominales. El entrenamiento combina supervision por demostracion y objetivos en espacio de tarea, optimizando conexiones firmadas y offsets de respuesta con PyTorch sobre MPS/CUDA.

Su relevancia es acotada y de caracter investigador: es un ejemplo reproducible de transferencia de un conectoma a un controlador de robot simulado, con artefactos auditables y verificacion de procedencia, pero el propio autor lo califica de experimental, no apto para produccion y sin validez demostrada de fidelidad biologica ni de seguridad en robotica fisica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no es un transformer: grafo sensorial disperso derivado del conectoma MaleCNS ejecutado en MLX/Metal, mas una cabeza motora aprendida y restringida en CPU; simulador nativo macOS con RealityKit |
| Parametros totales | no disponible (el release ocupa 0,4 GB; no se declara recuento de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (bucle de control en tiempo real; la codificacion sensorial se actualiza a 2 Hz nominales) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta declarada en la model card); al no ser un modelo de generacion de texto, el multilingueismo no aplica |
| Licencia | CC BY 4.0 para activos derivados y artefactos publicados; MIT para el codigo fuente del repositorio de GitHub |
| Formato de pesos | paquetes `.tar.gz` (`stable`, `experimental`, `cuda-continuation`, `runtime-assets`, `training-bundle`); no se especifica el formato interno de serializacion (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura no sigue el esquema de un modelo generativo: los renders RGB frontales y de muneca se convierten a luminancia y se mapean a neuronas retinianas anotadas, mientras que la retroalimentacion de articulaciones, apertura y contacto alimenta una codificacion sensorial disenada a mano. Sobre esa entrada corre un grafo sensorial persistente y de topologia fija en MLX/Metal, y una cabeza motora aprendida y restringida, ejecutada en CPU, emite seis objetivos articulares mas la apertura de pinza a 2 Hz nominales. Las coordenadas del cubo y la cinematica inversa se usan en los profesores y en la evaluacion, no en la seleccion de acciones del actor.

El entrenamiento emplea supervision por demostracion y objetivos en espacio de tarea, con optimizacion en PyTorch sobre MPS/CUDA de un subconjunto de conexiones firmadas ya existentes y de offsets de respuesta. El autor advierte explicitamente de que no se trata de una simulacion validada de aprendizaje biologico y de que el multiplicador de dopamina fijo usado en el entrenamiento offline no demuestra aprendizaje guiado por recompensa en la mosca; el selector de bancos por contacto tambien esta disenado a mano. La finalizacion de la tarea (apertura de pinza y verificacion de aterrizaje en el suelo) es una rutina scriptada, no una accion neural aprendida, igual que RealityKit, los actuadores nativos, el limitado de suelo, la proyeccion de camara y el mapeo mosca-robot.

## Capacidades

- Control de un brazo robotico simulado: genera seis objetivos articulares mas apertura de pinza a 2 Hz nominales.
- Pick-and-place validado en una tarea concreta: cubo de 20 mm y posicion inicial plegada, con agarre y mantenimiento en el rango X343–357, Y−10–8 mm.
- Percepcion visual simulada: conversion de renders RGB frontales y de muneca a luminancia y mapeo a neuronas retinianas anotadas.
- Codificacion sensorial propioceptiva: integra retroalimentacion de articulaciones, apertura y contacto.
- Seleccion de bancos de parametros por contacto bilateral de dedos en el perfil `experimental`.
- Ejecucion de un grafo sensorial fijo sobre MLX/Metal con backend verificado en Apple Silicon.
- Finalizacion de tarea mediante rutina scriptada: tras un mantenimiento que cumple el criterio de al menos 100 mm de holgura y como maximo 5° de inclinacion durante cinco segundos, abre la pinza y verifica el aterrizaje en el suelo.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas, vision general, audio ni modo de razonamiento.

## Casos de uso

- Reproduccion de experimentos de conectomica aplicada a robotica: el release incluye parametros, activos de grafo y caracteristicas y objetivos congelados, lo que permite repetir el ajuste y la evaluacion sin reconstruir el pipeline completo.
- Investigacion en transferencia conectoma-politica: sirve como punto de partida para estudiar si un grafo derivado de MaleCNS puede informar una cabeza motora restringida, dado que el autor separa explicitamente lo aprendido de lo diseinado a mano.
- Docencia y divulgacion en neurociencia computacional: el bucle sensorial (RGB a luminancia a neuronas retinianas) y el grafo persistente son inspeccionables y ejecutables en un portatil Apple Silicon.
- Pruebas de agarre pick-and-place en simulacion: la tarea validada de cubo de 20 mm con inicio plegado permite comparar el perfil `stable` contra el `experimental` en condiciones controladas.
- Evaluacion de rendimiento de backend MLX/Metal frente a CUDA: el artefacto `cuda-continuation` contiene un ajuste de 12.000 iteraciones en RTX 4090 que puede compararse con el grafo MLX en M2 Max, aunque no se haya importado al controlador desplegado.
- Auditoria de procedencia de artefactos de investigacion: el instalador normaliza rutas JSON, registra hashes antes y despues en `relocation.json` y preserva la evidencia historica, lo que facilita verificar que las matrices numericas no han cambiado.
- Desarrollo de controladores hibridos aprendizaje-scripting: el diseño separa la seleccion aprendida de acciones de las rutinas scriptadas de finalizacion y de los componentes de simulacion, un patron reutilizable en otros brazos simulados.

## Benchmarks y rendimiento

El `model-index` de la model card no contiene resultados (`results: []`). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible. El autor si declara registros de evaluacion operativa, que se recogen a continuacion tal cual:

| Perfil / artefacto | Estado medido declarado |
|---|---|
| `stable.tar.gz` (`retain-grasp-20260911`) | 19/20 ensayos de recogida y mantenimiento en X343–357, Y−10–8 mm; comprobaciones separadas de recogida, mantenimiento y soltado en la interfaz real superadas |
| `experimental.tar.gz` (`touch-direct-20260912`) | 12/15 tareas completas de 20 planificadas (5 sin ejecutar); no cualificado para el despliegue por defecto en la interfaz |
| `cuda-continuation.tar.gz` | Ajuste de continuacion de 12.000 iteraciones en RTX 4090; no importado al controlador desplegado y sin evaluacion nativa en bucle cerrado |

El autor advierte de que "stable" identifica la linea base retenida, no una fiabilidad de grado de produccion, y de que los resultados historicos no garantizan la misma tasa en otra maquina.

## Requisitos de hardware

- Plataforma objetivo: macOS nativo, con el simulador del repositorio fuente (componentes RealityKit y actuadores nativos).
- Grafo sensorial: se ejecuta en MLX/Metal, por lo que requiere GPU de Apple Silicon; la paridad de backend se midio en un Apple M2 Max con MLX 0.32.2.
- Cabeza motora: se ejecuta en CPU, no en GPU.
- VRAM estimada para inferencia: no disponible. El release pesa 0,4 GB y no se declaran requisitos de memoria en tiempo de ejecucion.
- GPU recomendadas: no disponible para inferencia desplegada; la unica GPU documentada es una RTX 4090, usada para el ajuste de continuacion en CUDA, no para la ejecucion del controlador.
- GPU de consumo: el unico hardware verificado es un SoC Apple M2 Max; no se documenta compatibilidad con GPU NVIDIA o AMD para la inferencia.
- Opciones de despliegue: scripts propios del repositorio fuente (`python3 scripts/download_model.py` y `.venv/bin/python scripts/run_mlx_ui.py --check-deployment`, con `--profile experimental` para el controlador de investigacion). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el bucle de control opera a 2 Hz nominales y emite seis objetivos articulares mas apertura de pinza por ciclo. No se publican cifras de latencia por inferencia ni de throughput adicionales.

## Comparativa con modelos similares

No disponible. En la informacion proporcionada no se identifican modelos comparables de la misma categoria (controladores de brazo robotico derivados de conectomas y ejecutados sobre entornos de simulacion nativos). MaleCNS aparece unicamente como fuente del mapa anatomico, no como alternativa funcional, y el autor subraya que MaleCNS es un mapa de cableado anatomico y no una politica robotica preentrenada.

## Limitaciones y advertencias

- No es una politica robotica preentrenada: MaleCNS es un mapa anatomico de cableado y el controlador se construye sobre derivados de ese mapa.
- "Stable" no equivale a fiabilidad de grado de produccion; es la linea base retenida para la interfaz.
- La tarea validada es estrecha: cubo de 20 mm y posicion inicial plegada. No se ha establecido el funcionamiento con colocaciones arbitrarias ni con otros tamanos de cubo.
- El ajuste de continuacion en CUDA no se ha importado al controlador desplegado y carece de evaluacion nativa en bucle cerrado.
- El perfil `experimental` no esta cualificado para el despliegue por defecto en la interfaz y dejo 5 de 20 tareas sin ejecutar.
- La liberacion de la pinza y la verificacion de aterrizaje son una rutina scriptada, no una accion neural aprendida.
- RealityKit, los actuadores nativos, el limitado de suelo, la proyeccion de camara y el mapeo mosca-robot son componentes diseinados a mano.
- No es una simulacion validada de aprendizaje biologico; el multiplicador de dopamina fijo del entrenamiento offline no demuestra aprendizaje guiado por recompensa.
- El selector de bancos por contacto es un componente diseinado, no aprendido.
- Los resultados historicos no garantizan la misma tasa en otra maquina ni en hardware fisico; el proyecto no establece seguridad en robotica real.
- Los bundles contienen caracteristicas y objetivos congelados, no el corpus completo de observaciones RGB historico, por lo que la reproducibilidad del entrenamiento completo es parcial.
- La model card esta en ingles y el modelo no procesa lenguaje, de modo que no hay soporte multilingue aplicable.
- Licencia: los activos derivados y los artefactos publicados son CC BY 4.0 y el codigo fuente es MIT. Es obligatorio preservar los ficheros `ATTRIBUTION.md` incluidos y atribuir el trabajo MaleCNS de FlyEM en HHMI Janelia, University of Cambridge, MRC Laboratory of Molecular Biology, Google Research y colaboradores.
- El proyecto se declara independiente y no es un lanzamiento oficial de MaleCNS, Google, Janelia, Orbbec ni ReBot.
- El repositorio no tiene descargas ni "likes" en el momento de la consulta, por lo que no existe validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/monomyth/fly-brain-codex
- Repositorio fuente, instrucciones de instalacion y demo: https://github.com/monomyth/fly-brain-codex
- Rama del simulador para este proyecto: https://github.com/monomyth/rebot-motion-lab/tree/fly-brain-codex
- Descargas y atribucion de MaleCNS (FlyEM, HHMI Janelia): https://male-cns.janelia.org/download/
- La busqueda web realizada no devolvio resultados relevantes para este modelo (unicamente paginas no relacionadas sobre una emisora de radio alemana).
