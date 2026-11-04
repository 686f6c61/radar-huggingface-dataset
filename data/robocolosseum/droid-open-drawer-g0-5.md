# RoboColosseum/droid-open-drawer-g0.5

## Resumen

DROID-open-drawer-g0.5 es un modelo vision-language-action (VLA) para control robótico de manipulación, publicado por RoboColosseum dentro del repositorio DROID-models-10ep. Se trata de un ajuste fino del checkpoint base G0.5 de OpenGalaxea (g05-base) sobre tareas de manipulación del dataset DROID con un brazo Franka, concretamente las tareas "mug on coaster" y "close laptop". El modelo forma parte de un benchmark comparativo que entrena cinco arquitecturas VLA distintas con la misma receta y los mismos datos para medir su rendimiento en tareas de manipulación reales.

El modelo se distribuye en formato LeRobot, con pesos de inferencia y ficheros de configuración para cada tarea. El repositorio completo ocupa 11,9 GB, correspondiente a la carpeta g05/ con los dos subdirectorios de tarea. El entrenamiento se realizó durante 10 épocas en total, en dos fases de 5 épocas, la segunda de ellas sobre 1 GPU H200 con acumulación de gradiente para mantener el tamaño de batch global original.

Es relevante porque proporciona un punto de comparación reproducible y abierto entre familias VLA contemporáneas (GR00T N1.7, π0.5, G0.5, MolmoAct2 y LingBot-VLA v2) bajo condiciones de entrenamiento idénticas, algo poco habitual en la literatura de robótica. No obstante, la información pública disponible no incluye especificaciones detalladas de arquitectura del modelo base ni resultados de éxito en tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); arquitectura interna del checkpoint base G0.5 no detallada en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el entrenamiento usa fp32 en pesos maestros y computo bf16 |
| Idiomas soportados | no disponible (modelo orientado a instrucciones de tarea en ingles: "mug on coaster", "close laptop") |
| Licencia | other (no se especifican terminos concretos) |
| Formato de pesos | safetensors (LeRobot); tamano de carpeta 11,9 GB |
| Checkpoint base | OpenGalaxea/G05 (g05-base) |
| Libreria | lerobot |
| Entradas | 3 camaras (exterior izquierda, exterior derecha, muneca), 360x640 |
| Estado y accion | 8-D posiciones articulares absolutas [brazo Franka 7, pinza 1] |
| Frecuencia de datos | 30 fps (LeRobot v3.0) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo del checkpoint G0.5 de OpenGalaxea. Segun la receta publicada, se entrenan todas las partes del modelo (vision y accion) con un factor de escala de learning rate de 0,1 para la torre de vision, usando FSDP para el reparto de memoria. El entrenamiento emplea precision mixta: pesos maestros en fp32 y computo en bf16. La receta es identica para todas las tareas: batch global de 16 (micro-batch 16 en una sola GPU), learning rate pico de 4e-5 con schedule coseno, 200 pasos de warmup y weight decay de 0,03.

Los datos de entrenamiento son dos tareas del dataset DROID con 100 episodios cada una: "mug on coaster" (41.227 frames) y "close laptop" (27.649 frames), con instrucciones textuales literales ("mug on coaster", "close laptop"). El ajuste se realizó en dos fases: las primeras 5 epocas sobre 2x H100 PCIe (4h57m y 3h12m respectivamente) y 5 epocas adicionales sobre 1x H200 (3h27m y 2h23m), reiniciando el optimizador y el schedule de learning rate. La perdida de flujo (`fm_loss`) bajó de 0,0232 a 0,0149 en MugOnCoaster y de 0,0219 a 0,0149 en CloseLaptop entre el final de las 5 primeras epocas y el final de las 10. No se documentan innovaciones arquitectonicas propias en la informacion disponible.

## Capacidades

- Generacion de acciones de manipulacion robótica de 8 dimensiones (7 articulaciones del brazo Franka mas pinza) a partir de observaciones visuales e instruccion textual.
- Control visuomotor a partir de tres camaras simultaneas (exterior izquierda, exterior derecha y muneca).
- Ejecucion de dos tareas especificas: colocar una taza sobre un posavasos y cerrar un portatil.
- Condicionamiento por instruccion en lenguaje natural (en ingles, frases cortas).
- Inferencia en tiempo real a 30 fps segun el formato de datos LeRobot v3.0.
- Integracion con el ecosistema LeRobot para carga y despliegue.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general, vision general, audio ni modo thinking.

## Casos de uso

- Evaluacion comparativa de arquitecturas VLA: usar el modelo como uno de los cinco brazos del benchmark RoboColosseum para medir tasas de exito en las mismas tareas y condiciones, aprovechando que comparte receta, datos y batch global con GR00T N1.7, π0.5, MolmoAct2 y LingBot-VLA v2.
- Reproduccion de experimentos de investigacion: al publicarse pesos finales, configuracion y curvas de perdida en W&B, permite replicar el ajuste fino y contrastar resultados de entrenamiento entre familias de modelos.
- Prototipado de politicas de manipulacion en brazo Franka: el modelo puede cargarse en LeRobot y ejecutarse sobre un Franka real o simulado para tareas de pick-and-place sencillas con instruccion textual.
- Estudio de ajuste fino en dos fases: el repositorio documenta el efecto de reiniciar el optimizador y el schedule de LR tras 5 epocas, util para investigar estrategias de entrenamiento continuado en VLA.
- Analisis de sensibilidad a camaras: la receta de G0.5 usa solo camara izquierda y de muneca, lo que permite estudiar el impacto de reducir el numero de vistas frente a MolmoAct2 y LingBot-VLA v2, que usan las tres.
- Base para transferencia a tareas proximas: partir de estos pesos para ajustar tareas de manipulacion relacionadas con objetos de escritorio, dado que el modelo ya esta adaptado al dominio DROID/Franka.
- Docencia y divulgacion: ejemplo concreto y reproducible de pipeline VLA completo (datos LeRobot, entrenamiento FSDP, evaluacion en benchmark) para cursos de robotica e IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta perdidas de entrenamiento (`fm_loss`), que el propio autor advierte que no miden el exito en tarea:

| Modelo | Tarea | Metrica | Fin de 5 epocas | Inicio de +5 | Fin de 10 epocas |
|---|---|---|---|---|---|
| G0.5 | MugOnCoaster | fm_loss | 0,0232 | 0,0394 | 0,0149 |
| G0.5 | CloseLaptop | fm_loss | 0,0219 | 0,0356 | 0,0149 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; la carpeta de pesos ocupa 11,9 GB, por lo que se necesita al menos esa cantidad en memoria, mas overhead de activaciones y buffers de camara.
- Entrenamiento documentado: 1 GPU H200 para las 5 epocas adicionales (con acumulacion de gradiente); las 5 primeras epocas usaron 2x H100 PCIe.
- GPU recomendadas: H200 o H100 para entrenamiento; para inferencia se requiere una GPU profesional con suficiente memoria para cargar los pesos completos.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; dado el tamano de pesos (11,9 GB por carpeta con dos tareas), podria requerir GPUs de 16-24 GB o superiores, pero no se documenta.
- Opciones de despliegue: LeRobot (libreria oficial del modelo); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son adecuadas para un VLA de control robótico.
- Latencia y throughput: datos a 30 fps en el dataset; no se publican mediciones de latencia de inferencia en hardware concreto.

## Comparativa con modelos similares

Todos los modelos siguientes fueron entrenados por RoboColosseum con la misma receta y datos, lo que permite una comparacion controlada:

| Modelo | Checkpoint base | Tamano de carpeta | Camaras | GBS | LR pico | Entrenamiento +5 ep (MugOnCoaster) |
|---|---|---|---|---|---|---|
| G0.5 (este) | OpenGalaxea/G05 | 11,9 GB | izquierda, muneca | 16 | 4e-5 | 3h27m en 1x H200 |
| GR00T N1.7 | nvidia/GR00T-N1.7-3B | 12,6 GB | izquierda, muneca | 32 | 1e-4 | 1h19m en 1x H200 |
| π0.5 | openpi-assets/checkpoints/pi05_base | 12,4 GB | izquierda, muneca | 32 | 2,5e-5 | 2h35m en 1x H200 |
| MolmoAct2 | allenai/MolmoAct2 | 21,8 GB | izquierda, derecha, muneca | 64 | 2e-5 (LLM) | 7h35m en 1x H200 |
| LingBot-VLA v2 6B | robbyant/lingbot-vla-v2-6b | 12,8 GB | izquierda, derecha, muneca | 32 | 1,25e-5 | 5h22m en 1x H200 |

No se dispone de tasas de exito comparadas en la informacion proporcionada, por lo que la comparativa se limita a configuracion de entrenamiento, tamano y coste computacional.

## Limitaciones y advertencias

- El modelo esta especializado en dos tareas muy concretas ("mug on coaster" y "close laptop"); no es un modelo generalista de manipulacion.
- La licencia es "other" sin terminos explicitos en la informacion disponible; es imprescindible revisar las condiciones del checkpoint base OpenGalaxea/G05 y de los datasets DROID antes de cualquier uso comercial.
- No se publican tasas de exito ni evaluaciones en robot real; las perdidas de entrenamiento no son indicativas de rendimiento en tarea, como advierte el propio autor.
- El modelo asume un brazo Franka con espacio de acciones de 8 dimensiones y tres camaras con una disposicion concreta; el uso con otro hardware requiere recalibracion y probablemente reentrenamiento.
- Las instrucciones estan en ingles y limitadas a frases cortas; no hay soporte multilingue documentado.
- Riesgo de sobreajuste a las condiciones de iluminacion, posiciones de objeto y escenas de los 100 episodios por tarea.
- No se documentan sesgos especificos, pero al derivar de un VLM base puede heredar sesgos visuales y de lenguaje de sus datos de preentrenamiento.
- El reinicio del optimizador entre fases provoca un repunte temporal de la perdida (documentado), lo que debe tenerse en cuenta al interpretar curvas de entrenamiento.
- No se dispone de informacion sobre cuantizacion ni despliegue en GPU de consumo, lo que limita su uso fuera de entornos con hardware profesional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RoboColosseum/droid-open-drawer-g0.5
- Repositorio DROID-models (fase de 5 epocas): https://huggingface.co/RoboColosseum/DROID-models
- Repositorio BimanualYAM-models (referencia de learning rates): https://huggingface.co/RoboColosseum/BimanualYAM-models
- Checkpoint base G0.5: https://huggingface.co/OpenGalaxea/G05
- Dataset MugOnCoaster: https://huggingface.co/datasets/aarontung/droid-mug-on-coaster
- Dataset CloseLaptop: https://huggingface.co/datasets/aarontung/droid-close-laptop
- Proyecto W&B de entrenamiento: `shaileshxml-nus/RoboColosseum` (https://wandb.ai/shaileshxml-nus/RoboColosseum)
- Checkpoint base GR00T N1.7: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Checkpoint base MolmoAct2: https://huggingface.co/allenai/MolmoAct2
- Checkpoint base LingBot-VLA v2 6B: https://huggingface.co/robbyant/lingbot-vla-v2-6b
