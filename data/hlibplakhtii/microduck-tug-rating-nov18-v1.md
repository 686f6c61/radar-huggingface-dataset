# HlibPlakhtii/microduck-tug-rating-nov18-v1

## Resumen

Quicksilver Tug Rating es una política de control robótico publicada en Hugging Face por HlibPlakhtii dentro del ecosistema MicroDuck Arena, un entorno de simulación de competición entre patos robóticos. No se trata de un modelo de lenguaje: es un artefacto de inferencia en formato ONNX que implementa una política de comportamiento para el evento de "tug" (tirar de una cuerda o marcador), derivada mediante fine-tuning del controlador general v8 del propio autor y de la trayectoria L5 publicada por jrubiosainz.

El modelo se distribuye como un archivo ONNX que contiene una tabla de consulta de observaciones con cinco combates de rating grabados. Los seeds 1 y 2 reproducen las ejecuciones del controlador v8; los seeds 3 y 4 aplican una búsqueda local sobre los comandos articulares al final de las trayectorias para alejar más el marcador de cuerda; el seed 5 parte de la trayectoria L5 de jrubiosainz y aplica el mismo refinamiento. El autor reporta una puntuación de 168,90394568 cm en el evaluador de rating regular de MicroDuck Arena, con cinco victorias por pit frente al pato de referencia.

La relevancia es acotada y muy específica: sirve como artefacto reproducible para el benchmark MicroDuck Arena, no como modelo de propósito general. El repositorio ocupa 0,0 GB según Hugging Face y no registra descargas ni likes en el momento de la ficha, lo que indica un artefacto de nicho orientado a la competición y a la verificación de resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | política de control robótico exportada a ONNX; no es un transformer ni un modelo de lenguaje. Basada en el controlador general v8 de HlibPlakhtii con refinamiento por búsqueda local |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control por observación-acción) |
| Tipos de cuantizacion | no disponible; el artefacto se distribuye como ONNX |
| Idiomas soportados | no disponible (no aplica; no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (archivo reconstruible con `build_tug_rating_replays.py`) |

## Arquitectura y entrenamiento

La política no sigue una arquitectura de red neuronal generativa convencional. Según la model card, el artefacto ONNX contiene una "observation lookup" con cinco combates de rating grabados: el modelo almacena y reproduce acciones articulares seleccionadas para cada seed. Los seeds 1 y 2 replican las ejecuciones del controlador v8 de HlibPlakhtii; los seeds 3 y 4 aplican una búsqueda local que ajusta los comandos articulares cerca del final de las trayectorias v8 para tirar más del marcador de cuerda; el seed 5 parte de la trayectoria L5 publicada por jrubiosainz y aplica el mismo refinamiento local.

El proceso de construcción es explícito y reproducible: se descarga el controlador genérico fijado en `source.json` y se ejecuta `python build_tug_rating_replays.py --generic generic-controller.onnx --directory .` en el entorno Arena v5. Los archivos de seed contienen las acciones seleccionadas, y el paquete incluye registros de búsqueda y avisos de componentes upstream. Cada combate seleccionado se reprodujo desde el reset oficial, verificando que ambos patos y la cuerda coincidían con las trayectorias de búsqueda; el archivo de verificación local incluye la puntuación de cada seed y el hash del modelo exportado. No se documenta entrenamiento con RLHF, DPO ni un corpus de tokens; el "entrenamiento" es en realidad búsqueda local sobre trayectorias de control.

## Capacidades

- Control de un pato robótico simulado en el evento de tug de MicroDuck Arena, con comandos articulares ajustados para maximizar la distancia del marcador de cuerda.
- Reproducción determinista de cinco combates de rating a partir de seeds fijos (1 a 5), con verificación de hash del modelo exportado.
- Reconstrucción del artefacto ONNX desde el controlador genérico y los archivos de seed mediante el script incluido.
- Refinamiento local de trayectorias: ajuste de comandos articulares en la fase final de una ejecución para mejorar la puntuación.
- Integración con el entorno Arena v5 y con el evaluador de rating regular de MicroDuck Arena.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento en lenguaje natural, visión, audio ni capacidades multilingües.

## Casos de uso

- Evaluación reproducible en MicroDuck Arena: cargar el ONNX y ejecutar los cinco seeds en el entorno Arena v5 para verificar la puntuación reportada de 168,90394568 cm frente al pato de referencia.
- Baseline para el evento de tug: usar la política como referencia contra la que comparar nuevos controladores en el mismo evento de rating regular.
- Estudio de búsqueda local en control robótico: analizar cómo el ajuste de comandos articulares al final de la trayectoria mejora la distancia del marcador, comparando los seeds 1-2 (v8 sin refinar) con los seeds 3-4 (v8 refinado).
- Reproducción de linaje de controladores: reconstruir el ONNX desde `source.json` y el script `build_tug_rating_replays.py` para auditar la cadena v8 → L5 → refinamiento.
- Verificación de integridad de artefactos: comprobar el hash del modelo exportado y las puntuaciones por seed incluidas en el archivo de verificación local.
- Docencia o divulgación sobre políticas de control en simulación: ilustrar el flujo completo de reset oficial, reproducción de combate y validación de trayectorias en un entorno de competición.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Puntuación en el evaluador de rating regular de MicroDuck Arena | 168,90394568 cm |
| Victorias por pit frente al pato de referencia | 5 |
| Seeds evaluados | 5 (seeds 1-5) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible; no aplican a este tipo de artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,0 GB y el artefacto es un ONNX de política de control, por lo que la huella es mínima.
- GPU recomendadas: no disponibles; al ser una política ONNX de pequeño tamaño, puede ejecutarse en CPU o en GPU de gama baja, pero el autor no especifica requisitos.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño del artefacto, aunque no se documenta oficialmente.
- Opciones de despliegue: ONNX Runtime; el flujo de reconstrucción requiere el entorno Arena v5 y el script `build_tug_rating_replays.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Puntuacion tug | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| HlibPlakhtii/microduck-tug-rating-nov18-v1 | Política ONNX (lookup + búsqueda local) | no disponible | no aplica | 168,90394568 cm (5 victorias) | no disponible | Hugging Face |
| HlibPlakhtii/microduck-tug-cup-nov17-v8 | Controlador general base | no disponible | no aplica | no disponible | no disponible | Hugging Face |
| jrubiosainz/microduck-tug-cup3-l5-s5-4e623017 | Trayectoria L5 base | no disponible | no aplica | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada; la comparativa se limita a la relación de linaje declarada en la model card.

## Limitaciones y advertencias

- El artefacto es una tabla de consulta de observaciones con cinco combates grabados, no un controlador general; su comportamiento fuera de los seeds y del reset oficial no está garantizado.
- Las mediciones son específicas del evento de rating regular de MicroDuck Arena y no son extrapolables a otras tareas, entornos o variantes del evento.
- La licencia no está disponible, lo que impide confirmar si se permite uso comercial o redistribución.
- No se documentan sesgos, pero al ser una política de control sin lenguaje natural, los riesgos típicos de alucinación no aplican; el riesgo principal es la sobreajuste a las trayectorias grabadas.
- Dependencia del entorno Arena v5 y del controlador genérico fijado en `source.json` para la reconstrucción; cambios en el entorno pueden invalidar la reproducibilidad.
- Repositorio sin descargas ni likes en el momento de la ficha, sin validación externa independiente documentada.
- No apto para producción en robótica real sin validación adicional: las trayectorias se han verificado únicamente en simulación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HlibPlakhtii/microduck-tug-rating-nov18-v1
- Modelo base v8: https://huggingface.co/HlibPlakhtii/microduck-tug-cup-nov17-v8/tree/ca745bd0b5be8c7c339789f311563aef1608e617
- Trayectoria L5 de jrubiosainz: https://huggingface.co/jrubiosainz/microduck-tug-cup3-l5-s5-4e623017/tree/2c3cabbebc183348ea56cb1bfaa9d8ad4f6c488e
