# Dimios45/yam-world-model

## Resumen

YAM World Model es un modelo de mundo (world model) video-to-video condicionado por acciones, desarrollado por Dimios45 para el brazo robótico YAM (de 7 y 14 grados de libertad). Se basa en la arquitectura Dreamer-4, implementada con JAX/Flax, y fue entrenado desde cero en una única GPU RTX 4090. El modelo recibe unas pocas imágenes de contexto y una secuencia de comandos de articulación, y genera una predicción de los fotogramas futuros, es decir, "imagina el futuro" de la escena.

Su relevancia radica en que demuestra que es posible entrenar un modelo de mundo accionable con un corpus reducido (alrededor de 119.000 fotogramas) y recursos de hardware modestos, manteniendo una fidelidad razonable en escenarios de manipulación robótica. El autor verifica explícitamente que el modelo obedece a las acciones: cuando se le alimentan acciones verdaderas produce un movimiento coherente, mientras que con acciones aleatorias o nulas el movimiento resultante es erróneo o casi estático. Esta propiedad lo convierte en una base útil para planificación de trayectorias y entrenamiento de políticas en simulación.

La arquitectura consta de dos etapas: un tokenizador de video (masked-autoencoder spatiotemporal transformer) y un modelo de dinámica (flow-matching transformer). El contexto de entrada es de 24 fotogramas (4,8 segundos a 5 Hz) y el modelo está entrenado para soportar dos encarnaciones (embodiments) compartiendo el mismo backbone de video. El repositorio tiene un tamaño de 0,4 GB y la licencia es Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador de video (masked-autoencoder spatiotemporal transformer) + modelo de dinámica (flow-matching transformer) sobre latentes congelados |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 24 fotogramas (4,8 s a 5 Hz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de video, sin entrada textual) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (JAX/Flax; se cargan los pesos EMA exportados, sin especificación de formato) |

## Arquitectura y entrenamiento

El modelo sigue el esquema de Dreamer-4 en dos etapas, ambas implementadas en JAX/Flax. La primera etapa es un tokenizador de video tipo masked-autoencoder spatiotemporal transformer. Trabaja sobre fotogramas de 144×192 píxeles con parche de 16, produciendo 96 tokens latentes por fotograma con 16 canales y un cuello de botella `tanh`. El tokenizador se entrena únicamente con video (no ve acciones) durante 12.000 pasos con el optimizador Muon y una pérdida combinada de MSE y LPIPS. La segunda etapa es un modelo de dinámica de flujo-matching (shortcut/flow-matching) que opera sobre los latentes congelados, condicionado por un vector de acciones continuas a través de una proyección MLP específica por embodiment y una embedding de embodiment. Tiene 8 capas con dimensión 768 y se entrena durante 6.000 pasos con EMA (0.999). Los pesos exportados incluyen los pesos del EMA.

Los datos de entrenamiento provienen de varios corpus de LeRobot v3.0, sumando 266 episodios y 118.982 fotogramas. Los episodios se recortan a su tramo no inactivo, las acciones se normalizan con percentiles q01–q99 a [-1,1] y el video se empaqueta a 240×320 y se decodifica a 144×192 a 5 Hz. Se descartan las cámaras de muñeca y solo se mantienen cámaras fijas verificadas. El modelo soporta dos embodiments: `yam_absolute_joint_7d_v1` (7-DoF) y `bi_yam_absolute_joint_14d_v1` (14-DoF), compartiendo el mismo backbone de video.

## Capacidades

- Generación de video condicionada por acciones: a partir de un contexto de 4 fotogramas y una secuencia de acciones, predice los fotogramas siguientes (rollout de 32 fotogramas, 6,4 s).
- Obediencia a las acciones: el modelo reacciona de forma diferenciada a acciones verdaderas, incorrectas o nulas, lo que lo hace útil para evaluar la causalidad entre comandos y movimiento.
- Soporte multi-embodiment: comparte el tokenizador de video entre un brazo de 7 grados de libertad y un sistema bimanual de 14 grados, con proyecciones de acción específicas por embodiment.
- Reconstrucción de video de alta calidad dentro de su dominio: el tokenizador alcanza 25,6 dB PSNR en datos fuera de entrenamiento, con 0 canales latentes muertos.
- Modelo de mundo latente: el modelo de dinámica opera sobre tokens latentes, lo que permite rollouts sin recurrir a la predicción directa de píxeles.
- No es una política: no incluye planificación ni aprendizaje por refuerzo; solo genera futuros imaginados.

## Casos de uso

- Planificación de trayectorias en simulación: el modelo puede usarse para simular el resultado de una secuencia de comandos de articulaciones antes de ejecutarla en el robot real, ayudando a validar movimientos en un entorno controlado.
- Entrenamiento de políticas de imitación con datos sintéticos: al generar rollouts de video condicionados por acciones, se pueden aumentar los datos de demostración para entrenar políticas de manipulación, especialmente en escenarios con datos limitados.
- Verificación de controladores en bucle abierto: permite comprobar si una secuencia de acciones produce el movimiento esperado en la escena (por ejemplo, recoger un objeto) sin necesidad de hardware físico.
- Desarrollo de modelos de mundo para MPC (model predictive control): aunque el modelo no es lo suficientemente rápido para MPC denso (5,4 fps frente a un bucle de 5 Hz), puede usarse en una planificación de horizonte único para evaluar una sola trayectoria.
- Evaluación de calibración de robots: al comparar la predicción con la ejecución real, se puede detectar desajustes de calibración o de convención de ejes en el brazo robótico.
- Investigación en modelos de mundo con pocos datos: sirve como caso de estudio para entrenar modelos de mundo con menos de 120.000 fotogramas y una sola GPU, útil para laboratorios con recursos limitados.

## Benchmarks y rendimiento

El autor reporta métricas de control de acción y de reconstrucción en la model card. Los resultados se resumen en las siguientes tablas:

**Control de acción** (mismo clip, mismo seed, cambiando solo las acciones):

| `--action_source` | PSNR | SSIM | rollout motion | vs ground truth |
| --- | --- | --- | --- | --- |
| `true` | 15.03 | 0.6675 | 3.684 | 1.6x |
| `shuffled` (acciones de otro episodio) | 14.55 | 0.6484 | 5.311 | 2.3x |
| `zero` | 17.85 | 0.7459 | 1.264 | 0.55x |
| ground truth | — | — | 2.295 | 1.0x |

**Reconstrucción y dinámica**:

| Etapa | Métrica | Valor |
| --- | --- | --- |
| Tokenizador | PSNR en datos fuera de entrenamiento | 25.6 dB |
| Tokenizador | MSE / LPIPS | 0.0009 / 0.0166 |
| Tokenizador | Canales latentes muertos | 0 / 16 |
| Dinámica | PSNR / SSIM del rollout | 24.82 / 0.913 |
| Dinámica | `flow_mse` (baseline 1.0) | 0.0048 |

El autor advierte que el valor `zero` obtiene el mayor PSNR por un artefacto de la métrica: en una escena casi estática, una predicción casi congelada puntúa mejor que un movimiento nítido pero ligeramente desalineado. Por eso recomienda combinar PSNR con una estadística de movimiento para evaluar la acción.

## Requisitos de hardware

- Entrenamiento: se realizó en una única RTX 4090 (no se especifica el tiempo exacto de entrenamiento).
- Inferencia: 5.4 fps en modo cálido en RTX 4090; la primera llamada tarda ~28 s en compilar el grafo JIT, y cada rollout de 24 fotogramas tarda ~4.4 s.
- VRAM estimada: no disponible en la documentación, pero el tamaño del repositorio es de 0.4 GB, lo que sugiere que cabe en GPUs consumer (8 GB o más).
- GPUs recomendadas: RTX 4090 (usada en el desarrollo), aunque cualquier GPU con soporte JAX/Flax y suficiente memoria debería funcionar.
- Opciones de despliegue: el modelo se carga mediante el script `predict.py` de la carpeta `scripts/robot/`. No se mencionan integraciones con vLLM, llama.cpp u Ollama; es un modelo de video-to-video, no un LLM.
- Limitaciones de despliegue: la latencia de compilación JIT (28 s) hace que el uso interactivo sea inviable; se recomienda precompilar y mantener el modelo en memoria para uso continuo.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparativos con otros modelos de mundo en la información proporcionada. Como referencia, se puede comparar con otros modelos de mundo basados en Dreamer (como Dreamer-4 original) o con modelos como IRIS o UniSim, pero no hay datos numéricos publicados en la documentación de este modelo para hacer una comparación directa. La tabla siguiente resume características generales (basadas en la información del modelo y en conocimiento público, sin valores numéricos de rendimiento):

| Modelo | Arquitectura | Contexto | Licencia | Formato |
| --- | --- | --- | --- | --- |
| YAM World Model (este) | Tokenizador + flow-matching | 24 frames (4.8 s) | Apache 2.0 | JAX/Flax |
| Dreamer-4 (original) | RSSM + video tokenizer | típicamente 10-100 frames | MIT (según su repo) | JAX/Flax |
| IRIS | Transformer sobre tokens | 10-30 frames | Apache 2.0 | PyTorch |

No hay datos de rendimiento comparables en la documentación disponible.

## Limitaciones y advertencias

- No es una política: el modelo solo imagina el futuro, no planifica ni actúa. No se incluye ningún mecanismo de control o RL.
- No se ha ejecutado en un robot real: los resultados son solo simulaciones. Antes de usarlo en hardware hay que verificar la convención de calibración del robot.
- Diversidad de escenas limitada: el entrenamiento se realizó en un conjunto pequeño de tareas (recogida de un plumero, doblado de toallas y dos conjuntos de evaluación) con una sola vista fija por episodio. Se espera degradación en escenas, iluminación o cámaras no vistas.
- El embodiment bimanual es más débil: solo 16 episodios de datos frente a 250 para el brazo simple, lo que reduce su fiabilidad.
- Los rollouts derivan en horizontes largos: el autor reporta resultados para un horizonte de 32 fotogramas (6.4 s) y advierte que la calidad se degrada con el tiempo, como es típico en modelos de flujo.
- El uso de datos adicionales puede empeorar el modelo: el autor documenta que añadir 39 episodios de un dataset externo (ABC-130k) hizo que el modelo perdiera la condición de acción en el lado monobrazo y no mejorara el bimanual. Esto sugiere que la calidad de los datos importa más que la cantidad.
- Artefactos de métricas: el PSNR puede premiar la congelación del movimiento en escenas estáticas; es necesario complementar con métricas de movimiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Dimios45/yam-world-model)
- [Dataset yam-pick-duster](https://huggingface.co/datasets/Dimios45/yam-pick-duster)
- [Dataset yam-pick-duster-ee](https://huggingface.co/datasets/Dimios45/yam-pick-duster-ee)
- [Dataset yam_towel_fold](https://huggingface.co/datasets/Dimios45/yam_towel_fold) (no enlazado directamente en la búsqueda, pero mencionado en la model card)
- [Dataset molmo_eval_90cmtopcam](https://huggingface.co/datasets/Dimios45/molmo_eval_90cmtopcam)
- [Dataset molmo_eval_hitl](https://huggingface.co/datasets/Dimios45/molmo_eval_hitl)
- [Implementación de referencia (visionary, Dreamer-4)](https://github.com/james0248/visionary)
- [Awesome World Models (recopilación de modelos de mundo)](https://github.com/knightnemo/Awesome-World-Models)
- [Awesome World Models (M-E-AGI-Lab)](https://github.com/M-E-AGI-Lab/Awesome-World-Models)
