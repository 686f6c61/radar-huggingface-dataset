# simoswish/Reinforcment-Learning-Project-2526-checkpoints

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un archivo de checkpoints de un proyecto de aprendizaje por refuerzo (RL). Se trata de `simoswish/Reinforcment-Learning-Project-2526-checkpoints`, publicado por el usuario `simoswish`, que actua como almacen de los pesos entrenados del proyecto [simoswish02/Reinforcment-Learning-Project-2526](https://github.com/simoswish02/Reinforcment-Learning-Project-2526). El objetivo del proyecto es la busqueda cooperativa multi-dron sobre una rejilla de 32x32 mediante una red Dueling Double DQN compartida entre agentes.

La arquitectura combina un encoder global ConvNeXt con atencion multi-cabeza (MHSA), un encoder local basado en CNN y una cabeza dueling, todo ello integrado en un agente DQN con `q_net` y estado de optimizador/scheduler. Los checkpoints se guardaron originalmente en el repositorio de GitHub mediante Git LFS y se trasladaron aqui para liberar espacio de LFS, por lo que el repositorio funciona como espejo de artefactos de entrenamiento mas que como modelo desplegable de forma directa.

Es relevante para investigadores en RL multiagente porque permite reproducir la ejecucion de entrega del proyecto (`convnext_attn_net/checkpoints/`), inspeccionar arquitecturas previas de distintas ramas y reutilizar puntos de control intermedios. El repositorio ocupa 10,7 GB e incluye un `manifest.csv` con el SHA-256, tamano, rama de origen, ruta original y commit de cada fichero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dueling Double DQN multiagente con encoder global ConvNeXt + MHSA, encoder local CNN y cabeza dueling |
| Parametros totales | no disponible |
| Longitud de contexto | no aplicable (observacion de rejilla 32x32, no secuencia de tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (agente de RL, no modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (diccionarios `torch.save` generados por `DQNAgent.save`) |

## Arquitectura y entrenamiento

La red neuronal (`q_net`) es una Dueling Double DQN. La parte perceptiva se compone de un encoder global ConvNeXt con atencion multi-cabeza (MHSA), que procesa el estado global de la rejilla, y un encoder local basado en CNN, que captura informacion de vecindad; ambos alimentan una cabeza dueling que separa el valor de estado y la ventaja de cada accion. La variante Double DQN se emplea para reducir el sesgo de sobreestimacion en la actualizacion de la funcion Q. Los agentes comparten una unica red, lo que constituye el enfoque cooperativo multi-dron del proyecto.

En cuanto a los datos de entrenamiento, no se especifican en la informacion disponible ni el numero de pasos, ni la composicion del dataset, ni si se aplicaron tecnicas de RLHF/DPO (no aplicables en RL basado en entorno). La model card menciona una ejecucion de entrega con checkpoints periodicos etiquetados como `phase2_ConvNeXT_10k_dr_ep{1000..10000}.pt`, lo que indica un entrenamiento por fases con instantaneas cada aproximadamente 1000 episodios hasta 10 000. Cada checkpoint es un diccionario `torch.save` con las claves `q_net`, estado del optimizador, estado del scheduler y metadatos de entrenamiento. Los checkpoints de otras ramas (`32x32_Grid`, `64x64_Grid`, `FixedMapSize_*`, `GUI_upgrade`, `feat/map-drone-position`, `main`) corresponden a arquitecturas experimentales y solo son compatibles con el codigo de red de su propia rama.

## Capacidades

- Control de politicas de busqueda cooperativa multi-dron sobre rejilla 32x32 (y variantes 64x64 en otras ramas).
- Aprendizaje por refuerzo con Dueling Double DQN y red compartida entre agentes.
- Percepcion de estado global mediante ConvNeXt + MHSA y extraccion de caracteristicas locales con CNN.
- Reproduccion de la ejecucion de entrega mediante evaluacion (`python main.py --mode eval --checkpoint checkpoints/best.pt`).
- Reanudacion de entrenamiento a partir de checkpoints con estado completo de optimizador y scheduler.
- Trazabilidad de artefactos mediante `manifest.csv` (SHA-256, tamano, rama, ruta original y commit).
- No dispone de tool calling, function calling, agentes de lenguaje, capacidades multilingues ni modos de razonamiento tipo thinking, ya que no es un modelo de lenguaje.

## Casos de uso

- Reproducibilidad de investigacion: cargar `checkpoints/best.pt` y ejecutar `main.py --mode eval` para replicar los resultados de la ejecucion de entrega del proyecto sin reentrenar.
- Reanudacion de entrenamiento: partir de `phase2_ConvNeXT_10k_dr_ep10000.pt` para continuar el entrenamiento o aplicar un curriculum adicional, aprovechando el estado de optimizador y scheduler incluido en el checkpoint.
- Comparativa de arquitecturas: enfrentar la rama `convnext_attn_net` (ConvNeXt + MHSA) contra las ramas `32x32_Grid` o `64x64_Grid` (arquitecturas previas) para analizar el impacto del encoder en la politica aprendida.
- Docencia de RL multiagente: usar los checkpoints y el `manifest.csv` como material para ilustrar el ciclo DQN, la duplicacion de red (Double DQN) y la descomposicion dueling en un caso practico de cooperacion.
- Simulacion de busqueda cooperativa: integrar la politica entrenada en un simulador de busqueda y rescate con varios drones sobre rejilla para evaluar cobertura y coordinacion.
- Analisis de estabilidad del entrenamiento: inspeccionar la serie de checkpoints periodicos (ep 1000 a 10000) para estudiar curvas de aprendizaje, divergencias o saturaciones en la politica.
- Estudio de generalizacion de tamano de mapa: comparar politicas entrenadas en 32x32 frente a las de 64x64 para medir transferencia entre resoluciones de rejilla.
- Auditoria de artefactos: verificar integridad de los ficheros mediante los SHA-256 del `manifest.csv`, que coinciden con los identificadores de objeto de Git LFS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de recompensa, tasa de exito de la busqueda, episodios necesarios para convergencia ni comparaciones cuantitativas entre ramas. Tampoco hay datos de rendimiento de inferencia (latencia, throughput).

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 10,7 GB; descargar solo la rama de entrega reduce el espacio necesario.
- Memoria: cada checkpoint contiene `q_net`, estado de optimizador y de scheduler, por lo que su tamano es varias veces el del modelo en si; la VRAM de inferencia concreta es no disponible.
- GPU: no se especifican modelos recomendados. Al tratarse de una red ConvNeXt + MHSA sobre observaciones de 32x32, el entrenamiento se beneficia de GPU con soporte CUDA, mientras que la evaluacion puede ejecutarse en CPU, si bien no hay cifras confirmadas.
- GPU de consumo: no confirmado; la arquitectura es de vision relativamente compacta, pero no se dispone de datos de parametros ni de memoria para afirmar compatibilidad con GPU tipo RTX 4090 u otras.
- Opciones de despliegue: PyTorch nativo, cargando el checkpoint con `torch.load` y ejecutando el `main.py` del repositorio de GitHub. No se mencionan exportaciones a ONNX, TorchScript, GGUF, vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de una comparativa publicada con otros agentes de RL multiagente o checkpoints equivalentes en la informacion proporcionada. No hay datos de parametros, contexto (no aplicable) ni rendimiento de este proyecto frente a alternativas como implementaciones estandar de DQN/DDQN o enfoques multiagente con red compartida. Se indica por tanto: no disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio | no disponible | no aplicable | no disponible | no disponible | HuggingFace (0 descargas) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no admite prompts, generacion de texto, codigo ni conversacion; cualquier uso en ese sentido seria un error de aplicacion.
- Acoplamiento al codigo fuente: los checkpoints de ramas distintas a la de entrega solo son compatibles con el codigo de red de su propia rama, lo que puede provocar fallos de carga si se mezclan.
- Licencia no disponible: no se puede confirmar el permiso de uso comercial, redistribucion o modificacion; se debe contactar con el autor antes de cualquier uso en produccion.
- Ausencia de benchmarks: no hay evidencia publicada de rendimiento, convergencia ni tasa de exito, por lo que la calidad de la politica no puede verificarse a partir de la informacion disponible.
- Riesgo de sobreajuste al entorno: al estar entrenado en una rejilla concreta (32x32, con variantes 64x64), la generalizacion a otros mapas, dinamicas o numeros de drones es incierta.
- Sesgos del entorno: la politica hereda los sesgos de la funcion de recompensa y del diseno del simulador de entrenamiento, no documentados aqui.
- Sin garantias de despliegue: no se documentan procesos de validacion en produccion, ni versiones de PyTorch compatibles, ni requisitos de dependencias mas alla del `main.py` del repositorio.
- Artefactos historicos sin instantaneas: las ramas experimentales solo conservan `best.pt`/`last.pt`, sin las instantaneas periodicas, lo que limita la reproducibilidad de esas ejecuciones.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/simoswish/Reinforcment-Learning-Project-2526-checkpoints
- Repositorio de GitHub del proyecto: https://github.com/simoswish02/Reinforcment-Learning-Project-2526
- No se han encontrado papers, blogs, demos ni repositorios adicionales relevantes en la busqueda web; los resultados devueltos no guardaban relacion con el modelo.
