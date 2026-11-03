# Idrissa242/ObjectJEPA

## Resumen

ObjectJEPA es un modelo de mundo (world model) centrado en objetos que predice escenas fisicas en espacio latente, objeto a objeto, sin generar pixeles. Lo desarrolla Idrissa242 en el contexto del Meta Global AI Developer Hackathon 2026 (track Indie Developer, categoria "Push the Frontier") y se publica bajo licencia MIT. El modelo resuelve dos tareas concretas: anticipar que ocurrira en los siguientes fotogramas de un video sintetico y responder preguntas contrafactuales del tipo "que pasaria si elimino este objeto".

Tecnicamente no es un modelo monolítico, sino un conjunto de tres componentes entrenados sobre las caracteristicas de un encoder V-JEPA 2 ViT-L congelado (`facebook/vjepa2-vitl-fpc64-256`): un predictor transformer de 26,3 M de parametros que opera sobre un latente por objeto (8 slots de 1024 dimensiones), una cabeza de colision de 0,47 M de parametros y un clasificador de refuerzo para preguntas contrafactuales. La segmentacion de objetos corre a cargo de SAM 3 (o de las mascaras anotadas de CLEVRER).

Su relevancia es doble: por un lado demuestra que el razonamiento fisico puede hacerse en espacio latente con un coste computacional muy bajo (menos de 27 M de parametros en el predictor y la cabeza); por otro, expone las limitaciones actuales de este enfoque, ya que solo se ha evaluado en video sintetico de CLEVRER con camara fija y hasta 8 objetos, sin validacion en video real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer sobre latentes por objeto (predictor) + convolucion temporal (cabeza de colision) + gradient boosting (update what-if); encoder V-JEPA 2 ViT-L congelado |
| Parametros totales | 26,3 M (predictor) + 0,47 M (cabeza de colision) + 300 arboles (update what-if, no neuronal) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32 fotogramas observados para predecir los 32 siguientes (rollout paso a paso); 8 slots de objeto |
| Tipos de cuantizacion | No disponible (pesos en precision original, sin versiones cuantizadas publicadas) |
| Idiomas soportados | No disponible (modelo de vision, no de lenguaje) |
| Licencia | MIT (V-JEPA 2, SAM 3 y CLEVRER conservan sus propias licencias) |
| Formato de pesos | `predictor_best.pt` y `head_best.pt` (state dict PyTorch, `torch.load(..., weights_only=True)`); `update.pkl` (scikit-learn 1.6 `HistGradientBoostingClassifier`) |

## Arquitectura y entrenamiento

El pipeline parte de un encoder V-JEPA 2 ViT-L congelado que convierte cada objeto (delimitado por SAM 3 o por las mascaras de CLEVRER) en un latente de 1024 dimensiones. El predictor es un transformer de anchura 512 y profundidad 8 que recibe un latente por objeto mas su posicion (8 slots) y hace un rollout autorregresivo: 32 fotogramas observados para generar los 32 siguientes, paso a paso, sin decodificar pixeles. Se entrena con perdida L1 en espacio latente normalizado mas una perdida de posicion, durante 60 epocas. La cabeza de colision aplica una convolucion temporal sobre pares de latentes de objeto mas informacion geometrica para producir un logit de contacto por paso en cada uno de los 28 pares posibles, con umbral 1,5. El componente what-if es un `HistGradientBoostingClassifier` de 300 arboles que combina las puntuaciones de la cabeza sobre el video real, el rollout factual y el rollout contrafactual.

Los datos de entrenamiento provienen exclusivamente de CLEVRER (Yi, Gan et al., ICLR 2020, licencia CC0): 10.000 videos de entrenamiento de objetos moviendose y colisionando, con 1.000 reservados por video para validacion. El predictor usa las mascaras de CLEVRER y, segun el autor, transfiere a mascaras de SAM 3 con perdida casi nula. La cabeza de colision se entrena con las colisiones anotadas de CLEVRER sobre secuencias reales y predichas (8.000 videos; otros 1.000 eligen epoca y umbral). El update what-if se entrena con las preguntas contrafactuales de esos 1.000 videos de seleccion, nunca con los de validacion, y solo ve senales del world model, sin atajos sobre los contactos del objeto eliminado. No se documenta uso de RLHF ni DPO; el entrenamiento es puramente supervisado sobre tareas de prediccion y clasificacion.

## Capacidades

- Prediccion de trayectorias futuras en espacio latente: dado un video de 32 fotogramas, genera los 32 siguientes objeto a objeto, con error de posicion de 4,6 px en validacion.
- Razonamiento fisico basico: modela movimiento y colisiones entre hasta 8 objetos en escenas sinteticas.
- Deteccion de colisiones en el rollout: la cabeza de colision produce un logit de contacto por paso y par de objetos (F1 de 0,898 en pasos predichos).
- Razonamiento contrafactual: responde preguntas "que pasaria si elimino el objeto X" mediante un rollout alternativo evaluado por el update what-if.
- Prediccion de "que pasara despues": responde preguntas de opcion multiple sobre el futuro de la escena (0,973 de acierto en validacion con ground truth de segmentacion).
- Integracion como herramientas en un agente LLM: Muse Spark invoca el predictor, la cabeza de colision y el update what-if como tools, sin acceso a ground truth.
- Independencia del segmentador: funciona con mascaras de SAM 3 o con las mascaras anotadas de CLEVRER.
- No soporta generacion de texto, codigo, matematicas, vision general, audio ni tool calling generico; sus capacidades estan acotadas al dominio de CLEVRER.

## Casos de uso

- Investigacion en world models latentes: sirve como referencia reproducible (codigo y pesos MIT) para estudiar prediccion en espacio latente sin decodificador de pixeles, con un coste de entrenamiento bajo.
- Evaluacion de razonamiento fisico en agentes: el agente Muse Spark llama a las herramientas del modelo para responder preguntas de "que pasara" y "que pasaria si", lo que permite medir la calidad del razonamiento de un LLM cuando delega la fisica a un modulo especializado.
- Prototipado de planificacion en robotica simulada: el rollout de 32 pasos sobre 8 objetos puede alimentar un planificador que evalue colisiones antes de ejecutar una trayectoria en un entorno sintetico tipo CLEVRER.
- Benchmark de segmentadores: al funcionar tanto con mascaras de SAM 3 como con las de CLEVRER, permite cuantificar cuanto degrada un segmentador automatico el rendimiento de un world model (0,581 frente a 0,589 de L1 latente en el experimento del autor).
- Educacion y divulgacion: los demos `demo_live.py`, `demo_web.py` y `visualize.py` permiten mostrar visualmente como un modelo predice colisiones y responde contrafactuales sin generar video.
- Base para extension a video real: al ser un componente pequeno (26,3 M de parametros) sobre un encoder congelado, es un punto de partida barato para reentrenar el predictor con datos reales o con mas objetos.
- Analisis contrafactual en simulacion: el update what-if permite comparar escenarios con y sin un objeto concreto, util para estudiar atribucion causal en escenas fisicas sinteticas.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 1.000 videos de validacion reservados de CLEVRER:

| Tarea | ObjectJEPA | Baseline |
|---|---|---|
| Prediccion de objeto: L1 latente / error de posicion | 0,581 / 4,6 px | 0,683 / 16,3 px (media / velocidad constante) |
| Igual, con mascaras de SAM 3 (200 videos) | 0,589 / 4,3 px | No disponible |
| F1 de colision en pasos predichos | 0,898 | 0,762 (regla de distancia) |
| "Que pasara despues" (714 preguntas, azar 0,5) | 0,973 | 0,933 (velocidad constante) |
| "Que pasa si se elimina X" (1.858 preguntas), por opcion / por pregunta | 0,844 / 0,564 | 0,830 / 0,522 (sin cambio) |

Agente completo sin ground truth (Muse Spark llamando a las herramientas, mascaras de SAM 3, 200 videos de validacion): 0,966 en "que pasara despues" (148 preguntas) y 0,811 / 0,517 en "que pasaria si" (373 preguntas).

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el predictor (26,3 M de parametros) y la cabeza de colision (0,47 M) ocupan del orden de 100-200 MB en fp32, y el update what-if es un modelo de arboles en CPU. El grueso del coste esta en el encoder V-JEPA 2 ViT-L congelado y en SAM 3, que no se incluyen en el repositorio.
- GPU recomendadas: cualquier GPU consumer reciente (RTX 3060 en adelante) es suficiente para el predictor y la cabeza; para el encoder V-JEPA 2 ViT-L y SAM 3 se recomienda al menos 16-24 GB de VRAM, aunque no se publican mediciones del autor.
- Cabe en GPU consumer: si, el predictor y la cabeza caben en cualquier GPU con 4 GB o mas; el pipeline completo depende del encoder y del segmentador.
- Opciones de despliegue: carga directa con PyTorch (`torch.load(..., weights_only=True)`), scikit-learn 1.6 para el update what-if, y los scripts `agent.py`, `demo_live.py`, `demo_web.py` y `visualize.py` del repositorio de GitHub. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ObjectJEPA | 26,3 M (predictor) + 0,47 M (cabeza) | 32 fotogramas, 8 objetos | Prediccion latente y contrafactual en CLEVRER | MIT | Pesos en HuggingFace, codigo en GitHub |
| V-JEPA 2 ViT-L (base) | No disponible | 64 fotogramas, 256 px | Encoder de video auto-supervisado | Licencia propia de Meta | HuggingFace (`facebook/vjepa2-vitl-fpc64-256`) |
| Baseline de velocidad constante | 0 | 32 fotogramas | Prediccion de trayectorias | No aplica | Referencia del propio paper |
| Baseline de regla de distancia | 0 | Pares de objetos | Deteccion de colisiones | No aplica | Referencia del propio paper |

No se dispone de comparacion con otros world models object-centric de la literatura en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado solo con CLEVRER: escenas sinteticas, hasta 8 objetos y camara fija. No se ha probado con video real, por lo que su transferencia a dominios reales es desconocida.
- En la tarea "que pasaria si", la mayor parte de la mejora frente a la primera version proviene de leer mejor el video real; el rollout contrafactual en si aporta aproximadamente un punto sobre responder "nada cambia" (0,564 frente a 0,522 por pregunta).
- El rendimiento por pregunta en contrafactuales (0,564) esta proximo al azar en un escenario de opcion multiple, lo que limita su uso en decisiones que dependan de la respuesta exacta.
- No es un modelo de lenguaje: no genera texto, codigo ni respuestas conversacionales; el agente LLM (Muse Spark) es externo y no forma parte de los pesos publicados.
- El archivo `update.pkl` se carga con pickle y ejecuta codigo al deserializarse; solo debe cargarse desde una fuente de confianza.
- El encoder V-JEPA 2, el segmentador SAM 3 y el dataset CLEVRER no se incluyen en el repositorio y conservan sus propias licencias, que pueden imponer restricciones adicionales al uso comercial aunque el modelo se publique como MIT.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y los pesos se entrenaron durante el hackathon (26 de octubre - 4 de noviembre de 2026), sin un proceso de validacion externo conocido.
- No se han publicado datos sobre sesgos, robustez ante dominios fuera de distribucion ni comportamiento con mas de 8 objetos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Idrissa242/ObjectJEPA
- Codigo, evaluacion y demos: https://github.com/idrissa-gif/ObjectJEPA
- Modelo base V-JEPA 2 ViT-L: https://huggingface.co/facebook/vjepa2-vitl-fpc64-256
- Dataset CLEVRER: http://clevrer.csail.mit.edu/
- Paper de CLEVRER (Yi, Gan et al., ICLR 2020): no disponible como enlace directo en la informacion proporcionada
