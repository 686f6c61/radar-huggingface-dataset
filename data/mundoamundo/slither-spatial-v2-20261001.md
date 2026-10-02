# mundoamundo/slither-spatial-v2-20261001

## Resumen

Slither spatial world model v2 es un modelo de mundo (world model) especializado en el videojuego slither.io, publicado por el usuario mundoamundo en HuggingFace. Se trata de un modelo de dinamica espacial causal de 303 millones de parametros que aprende a predecir la evolucion futura de fotogramas de video a partir de un historial de cinco segundos y de unas acciones de control de angulo y boost. El modelo no genera texto ni codigo: su objetivo es modelar la dinamica del entorno de juego, una pieza tipica en pipelines de investigacion en agentes basados en modelo.

Tecnicamente, el sistema combina un encoder, una proyeccion y un decoder DINO-Tok congelados (procedentes de una version publicada) con un nucleo de dinamica espacial causal entrenado mediante flow matching continuo sobre video de 768×432 pixeles a 15 Hz. La informacion disponible indica que el entrenamiento de la cabeza de politica (policy head) se aborda en una etapa posterior y separada, por lo que esta publicacion cubre unicamente el modelo de mundo.

La relevancia del modelo es acotada pero clara: se enmarca en la linea de world models para entornos interactivos y aplica tecnicas de generacion de video (flow matching) a un dominio muy concreto (slither.io). El repositorio pesa solo 0,1 GB porque los pesos no se versionan en el propio repositorio, sino que se almacenan en buckets de HuggingFace con checkpoints reanudables "latest" y "best".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dinamica espacial causal con encoder/proyeccion/decoder DINO-Tok congelados y nucleo entrenado por flow matching continuo |
| Parametros totales | 303 millones (componente de dinamica espacial) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | cinco segundos de historial de video (75 fotogramas a 15 Hz); no se especifica una ventana mayor |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo opera sobre video, no sobre texto) |
| Licencia | other, denominada "dinov3", con enlace a https://github.com/facebookresearch/dinov3/blob/main/LICENSE |
| Formato de pesos | no disponible; los checkpoints residen en buckets de HuggingFace y no en el repositorio (0,1 GB) |

## Arquitectura y entrenamiento

La arquitectura descrita por el autor es un modelo de dinamica espacial causal de 303M de parametros. Sobre un encoder, una proyeccion y un decoder DINO-Tok congelados (de una version ya publicada) se entrena el componente de prediccion de dinamica. El entrenamiento emplea flow matching continuo sobre video de 768×432 pixeles a 15 Hz, condicionado por cinco segundos de historial y por senales de control proxy de angulo y boost. El autor indica explicitamente que el entrenamiento de la cabeza de politica es una etapa posterior e independiente, de modo que esta publicacion se limita al modelo de mundo.

En cuanto a datos, el dataset referenciado es `mundoamundo/slither-wam-video-actions` en el commit `c60388c8b625379d2782e9a673c3d850ec7d4b85`, con fuentes disjuntas entre entrenamiento y validacion. El autor advierte que las correcciones de reproduccion son estimaciones aprobadas por usuarios y no ground truth medido. No se detalla el numero total de tokens o fotogramas, la composicion exacta del dataset, ni si se aplicaron etapas de RLHF o DPO (no aplicables de forma estandar a un world model de este tipo). Los checkpoints reanudables incluyen modelo, configuracion, optimizador, EMA, cursor de datos y estado RNG por rango.

## Capacidades

- Prediccion de dinamica espacial causal: genera fotogramas futuros de una partida de slither.io condicionados por historial de video y controles.
- Control condicionado: acepta senales proxy de angulo y boost como entradas de accion.
- Modelado de video continuo a 768×432 pixeles y 15 Hz.
- Historial temporal de cinco segundos para condicionar la prediccion.
- Evaluacion open-loop: el autor publica previsualizaciones que comparan el futuro real, la reconstruccion del tokenizer congelado y una muestra open-loop con semilla fija.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, function calling, agentes multi-paso ni capacidades multilingues.
- Cabeza de politica: no incluida en esta publicacion; se entrena en una etapa separada segun el autor.

## Casos de uso

- Investigacion en world models: sirve como banco de pruebas para estudiar flow matching aplicado a video de baja resolucion y alta frecuencia en un entorno interactivo concreto como slither.io.
- Entrenamiento de agentes por modelo (model-based RL): el world model puede simular transiciones del entorno para entrenar politicas sin interactuar con el juego real, reduciendo coste de simulacion.
- Planificacion y busqueda en espacio latente: al predecir varios fotogramas futuros condicionados por acciones, permite evaluar trayectorias candidatas antes de ejecutarlas.
- Generacion de datos sinteticos de video: produce rollouts sinteticos de partidas que pueden complementar datasets reales, con la cautela de que el autor senala que las correcciones de reproduccion son estimaciones y no ground truth.
- Analisis de dinamica de juego: comparar predicciones con el futuro real ayuda a medir la fidelidad del modelo sobre fuentes retenidas y a detectar modos de fallo.
- Reproduccion de experimentos: los checkpoints reanudables (modelo, optimizador, EMA, cursor de datos y RNG) permiten reanudar entrenamientos y verificar resultados de forma reproducible.
- Prototipado de controladores: experimentar con senales de angulo y boost en un entorno simulado antes de trasladar politicas al juego real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor describe unicamente un protocolo cualitativo de evaluacion: previsualizaciones por checkpoint que comparan el futuro real, la reconstruccion del tokenizer congelado y una muestra open-loop de semilla fija, sobre cinco fuentes retenidas y 75 fotogramas predichos por fuente. El autor advierte ademas que los trabajos de previsualizacion pueden ir por detras de las subidas de checkpoints, y que las metricas y manifiestos se conservan para reproducibilidad, pero no se proporcionan sus valores.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, los 303M de parametros ocupan aproximadamente 0,6 GB en bf16/fp16 y 1,2 GB en fp32 solo en pesos; a ello hay que sumar activaciones y búferes de video a 768×432 y 15 Hz con cinco segundos de historial, lo que puede elevar el consumo muy por encima del peso del modelo. Estas cifras son estimaciones, no datos publicados.
- GPU recomendadas: no disponible. No se especifica hardware de entrenamiento ni de inferencia.
- Compatibilidad con GPU de consumo: no confirmada. Dado el tamano de parametros, el modelo podria caber en GPUs de consumo con suficiente VRAM (por ejemplo, RTX 3090 o RTX 4090), pero la resolucion de video y el historial temporal son el factor limitante y no hay confirmacion del autor.
- Opciones de despliegue: no disponible. No se mencionan vLLM, llama.cpp, Ollama, TGI ni otros motores; el artefacto publicado es un checkpoint de entrenamiento reanudable, no un formato de inferencia optimizado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (world models para slither.io o para video de juego a 768×432 y 15 Hz) con parametros, contexto, rendimiento o licencia verificables. Los resultados de busqueda web se refieren a otros productos y empresas (Mundo AI, SpAItial AI Echo-2, Niantic Spatial) que no constituyen alternativas directas comparables en parametros, dataset ni tarea.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se documenta ningun analisis de sesgos.
- Riesgo de alucinacion: como modelo generativo de video, puede producir rollouts plausibles pero incorrectos; el autor no reporta metricas cuantitativas de fidelidad, por lo que la magnitud de este error no esta caracterizada.
- Calidad de los datos: el propio autor advierte que las correcciones de reproduccion del dataset son estimaciones aprobadas por usuarios y no ground truth medido, lo que introduce incertidumbre en el entrenamiento.
- Alcance muy restringido: el modelo esta especializado en slither.io y en video de 768×432 a 15 Hz; no es un modelo de proposito general ni soporta texto, codigo u otras tareas.
- Contexto limitado: cinco segundos de historial; no se documenta soporte para ventanas temporales mayores.
- Idioma: no disponible; el modelo opera sobre video, no sobre lenguaje.
- Licencia: la licencia es "other" bajo el nombre "dinov3" y enlaza al LICENSE de DINOv3 de Meta. Es imprescindible revisar ese texto antes de cualquier uso comercial, ya que las condiciones de la licencia DINOv3 pueden imponer restricciones relevantes.
- Estado del artefacto: repositorio de 0,1 GB sin pesos incluidos; los checkpoints viven en buckets de HuggingFace que rotan dos slots, por lo que un checkpoint concreto puede dejar de estar disponible. Se recomienda fijar hashes desde `latest.json` o `best.json`.
- Madurez: 0 descargas y 1 like en el momento de la consulta; es una publicacion de investigacion temprana, sin pipeline declarado ni validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mundoamundo/slither-spatial-v2-20261001
- Buckets de checkpoints (latest/best): https://huggingface.co/buckets/mundoamundo/slither-spatial-v2-20261001
- Dataset de entrenamiento: https://huggingface.co/datasets/mundoamundo/slither-wam-video-actions (commit `c60388c8b625379d2782e9a673c3d850ec7d4b85`)
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE
- Slither.io (entorno modelado): http://slither.io/
- Mundo AI (resultado de busqueda, no directamente relacionado con el modelo): https://mundoai.world/
