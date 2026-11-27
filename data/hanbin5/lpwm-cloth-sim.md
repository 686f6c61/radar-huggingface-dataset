# hanbin5/lpwm-cloth-sim

## Resumen

LPWM (Latent Particle World Models) es un modelo de mundo (world model) para prediccion de video desarrollado en el contexto de un paper aceptado en ICLR 2026. Este repositorio concreto, `hanbin5/lpwm-cloth-sim`, contiene los checkpoints y las salidas de evaluacion de una unica ejecucion de entrenamiento sobre el dataset `cloth_sim` (Cloth Move), un conjunto de simulaciones de telas. El modelo aprende la dinamica de una tela condicionada por acciones y genera rollouts de video a partir de un fotograma inicial y una secuencia de acciones.

El objetivo experimental del repositorio es acotado y muy especifico: comprobar si el modelo conserva el tamano de la tela cuando se le presenta en test un tamano distinto al visto en entrenamiento. El modelo solo vio telas de tamano 1,00x durante el entrenamiento y se evalua sobre ocho tamanos adicionales, desde 0,26x hasta 2,48x en area. El resultado es que la codificacion y decodificacion preservan el tamano (P_ED entre 0,990 y 1,005), pero la dinamica aprendida tiende a arrastrar el tamano hacia el de entrenamiento, con un factor `u` de 0,625 a 0,682 en 0,26x y de 0,533 a 0,543 en 2,48x.

Es relevante ahora porque documenta de forma cuantitativa un fallo clasico de generalizacion fuera de distribucion en modelos de mundo: la incapacidad de mantener atributos que no varian en los datos de entrenamiento. El repositorio incluye tambien una comparacion con DINO-WM entrenado con los mismos datos, lo que permite situar el comportamiento del modelo frente a una alternativa establecida. El modelo opera sobre secuencias de 128x128 pixeles y 13 fotogramas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LPWM (Latent Particle World Models), modelo de mundo condicionado por acciones con dinamica sobre representaciones latentes de particulas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 13 fotogramas por secuencia (cada quinto fotograma bruto), resolucion 128x128 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision/prediccion de video) |
| Licencia | no disponible en el repositorio; el codigo de los autores es MIT |
| Formato de pesos | `.pth` (checkpoints de PyTorch) |

## Arquitectura y entrenamiento

LPWM es un modelo de mundo que combina una representacion latente de particulas con una dinamica condicionada por acciones. La configuracion usada es la de `panda.json` de los autores, adaptada a `cloth_sim` en `configs/cloth_sim.json`: entrada de 128x128, secuencias de 13 fotogramas (muestreando cada quinto fotograma bruto) y condicionamiento por accion. El modelo recibe el fotograma 0 y las 12 acciones y produce un rollout de 12 pasos.

El entrenamiento uso 1.800 episodios de entrenamiento de la tela de tamano 1,00x, generando 9.000 secuencias por epoca. Se ejecuto en 2 GPUs (RTX 3090 Ti y RTX 3090) con DDP, batch global de 4, durante 1.454 minutos y 92 epocas, lo que supone 835.200 secuencias procesadas. La perdida de validacion fue minima en la epoca 29 (1,998) y era 2,258 en la epoca 92, mientras que la perdida de entrenamiento siguio bajando, lo que indica sobreajuste. Los checkpoints usados para el juicio son los tres ultimos (epocas 90, 91 y 92), fijados antes de ver los valores. No se menciona RLHF, DPO ni tecnicas de alineacion, dado que no es un modelo de lenguaje.

## Capacidades

- Prediccion de video condicionada por acciones: genera rollouts de 12 pasos a partir de un fotograma inicial y una secuencia de acciones.
- Modelado de dinamica de telas: simula la deformacion de una tela bajo acciones, con evaluacion mediante pixeles de tela e IoU por episodio y paso.
- Codificacion y decodificacion de fotogramas reales con preservacion de atributos: P_ED entre 0,990 y 1,005 en los nueve tamanos evaluados.
- Generalizacion limitada de atributos fuera de distribucion: mantiene parcialmente el tamano de telas no vistas (0,26x a 2,48x), con arrastre hacia el tamano de entrenamiento.
- No soporta tool calling, function calling, agentes ni capacidades multilingues: es un modelo de vision y dinamica, no un modelo de lenguaje.
- No dispone de modo thinking, vision general, audio ni otras capacidades multimodales mas alla de la prediccion de video.

## Casos de uso

- Investigacion en modelos de mundo: servir como referencia reproducible para estudiar la generalizacion fuera de distribucion de atributos no variados en entrenamiento, con metricas `u`, P y P_ED definidas y scripts de evaluacion incluidos.
- Simulacion de telas y robotica de manipulacion: el modelo puede predecir la deformacion de una tela bajo acciones, util para planificacion en tareas de plegado o manipulacion textil en entornos simulados.
- Evaluacion comparativa de world models: el repositorio incluye datos de referencia de tres ejecuciones de DINO-WM sobre los mismos datos, lo que permite comparar arquitecturas con la misma metodologia.
- Analisis de sesgos de tamano en modelos generativos de video: cuantificar como un atributo fijo en entrenamiento (tamano 1,00x) contamina los rollouts en otros tamanos, con intervalos de confianza bootstrap sobre 100 episodios por tamano.
- Docencia y divulgacion: los ficheros de figuras y videos (Real | LPWM) por tamano y paso facilitan explicar visualmente el fenomeno de arrastre hacia la distribucion de entrenamiento.
- Reproduccion de experimentos: los checkpoints de las epocas 21 a 23 y 90 a 92, junto con `hparams.json`, `epochs.jsonl` y `log.txt`, permiten reproducir el entrenamiento y la evaluacion con el codigo del branch `hanbin5/cloth-sim`.

## Benchmarks y rendimiento

Los datos disponibles no son benchmarks estandar (MMLU, HumanEval, GSM8K), sino metricas propias de la evaluacion del world model. Se presentan a continuacion.

| Tamano | Checkpoint | P | P_ED | u |
|---|---|---|---|---|
| 0,26x | epoca 90 | 2,524 | 1,005 | 0,625 [0,580, 0,673] |
| 0,26x | epoca 91 | 2,643 | 0,998 | 0,661 [0,616, 0,707] |
| 0,26x | epoca 92 | 2,722 | 0,997 | 0,682 [0,636, 0,728] |
| 1,00x (entrenamiento) | epoca 90 | 0,988 | 0,998 | no aplica |
| 1,00x (entrenamiento) | epoca 91 | 1,021 | 0,998 | no aplica |
| 1,00x (entrenamiento) | epoca 92 | 1,015 | 0,996 | no aplica |
| 2,48x | epoca 90 | 0,627 | 0,994 | 0,543 [0,500, 0,594] |
| 2,48x | epoca 91 | 0,633 | 0,994 | 0,532 [0,490, 0,581] |
| 2,48x | epoca 92 | 0,630 | 0,990 | 0,533 [0,491, 0,583] |

| Tamano | Clase | u de LPWM | u de DINO-WM (3 ejecuciones) | Comparacion |
|---|---|---|---|---|
| 0,26x | undecided | 0,625, 0,661, 0,682 | 0,312, 0,430, 0,440 | mas arrastrado que DINO-WM |
| 2,48x | partly pulls | 0,543, 0,532, 0,533 | 0,630, 0,648, 0,652 | menos arrastrado que DINO-WM |

A las 6 horas de entrenamiento (epocas 21 a 23) el valor de `u` era 0,589, 0,638 y 0,642 en 0,26x, y 0,529, 0,515 y 0,519 en 2,48x. Un 3,9 veces mas de entrenamiento no redujo `u`. La perdida de validacion minima fue 1,998 en la epoca 29 y 2,258 en la epoca 92.

## Requisitos de hardware

- El entrenamiento documentado se ejecuto en 2 GPUs (RTX 3090 Ti y RTX 3090) con DDP y batch global de 4, durante 1.454 minutos (unas 24 horas) para 92 epocas.
- VRAM estimada para inferencia: no disponible en la informacion proporcionada.
- GPU recomendadas: no disponible de forma explicita; el entrenamiento cabe en GPUs consumer de gama alta como RTX 3090 y RTX 3090 Ti.
- Despliegue: los pesos estan en formato `.pth` de PyTorch y el codigo es el del repositorio de los autores (`taldatech/lpwm`, licencia MIT) con el branch `hanbin5/cloth-sim`. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput de inferencia: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LPWM (este repositorio) | no disponible | 13 fotogramas, 128x128 | u = 0,625-0,682 en 0,26x; u = 0,532-0,543 en 2,48x | no disponible (codigo MIT) | Checkpoints de 6 epocas en Hugging Face |
| DINO-WM | no disponible | misma configuracion de evaluacion | u = 0,312-0,440 en 0,26x; u = 0,630-0,652 en 2,48x | no disponible | Referencia en `reference/dino_wm_ind_only_eval.npz` |

No se dispone de informacion sobre otros modelos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- Arrastre hacia la distribucion de entrenamiento: en telas de 0,26x el rollout tiende a dibujar el tamano de entrenamiento (u hasta 0,682); en 2,48x ocurre lo mismo en menor medida (u hasta 0,543). La clase del tamano 0,26x queda como "undecided" porque los intervalos cruzan el umbral de 2/3.
- Sobreajuste: la perdida de validacion minima se alcanza en la epoca 29 (1,998) y sube a 2,258 en la epoca 92, mientras la perdida de entrenamiento sigue bajando.
- Una sola semilla: la ejecucion es de una unica semilla, por lo que no se puede estimar la variabilidad entre entrenamientos.
- Atributo no variado en entrenamiento: el tamano de tela tiene un unico valor en los datos de entrenamiento, de modo que el test mide una capacidad de generalizacion que el modelo nunca pudo aprender de forma supervisada.
- Ambito muy restringido: resolucion 128x128, 13 fotogramas y una unica tarea (dinamica de telas); no es un modelo de proposito general ni un modelo de lenguaje.
- Licencia del repositorio no especificada: aunque el codigo de los autores es MIT, la licencia de los pesos y del uso comercial no esta indicada; conviene verificar antes de cualquier uso en produccion.
- Ficheros incompletos: solo se incluyen 6 de los 92 checkpoints (epocas 21 a 23 y 90 a 92); el resto no esta en el repositorio.
- Notas internas referenciadas pero no incluidas: algunos textos de salida mencionan ficheros como `results/lpwm_cloth/design.md` que no forman parte del repositorio.
- Riesgo de alucinacion en sentido generativo: al ser un modelo de prediccion de video, puede generar rollouts fisicamente inconsistentes fuera de la distribucion de entrenamiento; los propios resultados de `u` lo evidencian.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/hanbin5/lpwm-cloth-sim
- Dataset `cloth-sim`: https://huggingface.co/datasets/hanbin5/cloth-sim
- Codigo (branch del fork): https://github.com/jongmin-s-multicore/lpwm/tree/hanbin5/cloth-sim
- Repositorio original de los autores: https://github.com/taldatech/lpwm
- Paper LPWM (ICLR 2026): no disponible en la informacion proporcionada
