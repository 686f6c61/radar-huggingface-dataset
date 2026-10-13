# lidavidsh/bwm-robotwin-adjust-bottle-failure-ft

## Resumen

El modelo `lidavidsh/bwm-robotwin-adjust-bottle-failure-ft` es un ajuste fino del Boundless World Model (BWM), un modelo de mundo (world model) de vídeo condicionado por acciones para manipulación robótica construido sobre Wan2.2-TI2V-5B. Lo publica el usuario de HuggingFace lidavidsh y su propósito es corregir un sesgo concreto del checkpoint base `step-12000`: el modelo original, entrenado únicamente con trayectorias exitosas, renderiza como exitosos muchos agarres fallidos de una política aprendida, lo que lo hace poco fiable como simulador de fallos.

El ajuste se realiza durante 750 pasos sobre rollouts de la política π0.5 que incluyen tanto éxitos como fallos, procedentes de la tarea `adjust_bottle` de RoboTwin. El resultado es un checkpoint sustituible directamente (drop-in replacement) que reduce la tasa de falsos éxitos: un clasificador de éxito congelado que lee los fotogramas generados pasa de etiquetar como exitosos el 82,5 % de los fallos del simulador con el modelo base a solo el 26,3 % con este checkpoint, manteniendo una recall de éxitos del 96,4 %.

Su relevancia actual radica en el uso de world models como entornos de entrenamiento baratos para RL en robótica: el autor reporta que π0.5 entrenado con PPO dentro de este modelo mejora 9,7 puntos de media sobre la política SFT en cinco semillas. Se distribuye bajo licencia Apache 2.0 y contiene únicamente los pesos de inferencia (mismo state dict de DiT y codificador de acciones que el modelo base).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) + codificador de acciones, construida sobre Wan2.2-TI2V-5B; world model de vídeo condicionado por acciones |
| Parametros totales | no disponible (el modelo base es Wan2.2-TI2V-5B, ~5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de 61 fotogramas (1 inicial + 8 de historial + 52 futuros; 16 latentes, los 3 primeros de condicionamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vídeo/robótica, no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (solo pesos de inferencia; repositorio de 10,2 GB) |

## Arquitectura y entrenamiento

El modelo es un world model de vídeo condicionado por acciones basado en una arquitectura DiT (Diffusion Transformer) con un codificador de acciones independiente, construido sobre Wan2.2-TI2V-5B. El autor indica que el checkpoint es un reemplazo directo de `step-12000.safetensors` porque comparte exactamente el mismo state dict de DiT y de codificador de acciones; solo se modifican los pesos de inferencia. El entrenamiento emplea flow matching sobre los latentes futuros únicamente: el primer latente permanece limpio y los latentes de historial se ruidan como `(1 - σ) z + σ ε` con σ = 0.2083.

Los datos de entrenamiento provienen del split `train` del dataset `lidavidsh/robotwin-adjust-bottle-pi05-rollouts`: 418 éxitos y 108 fallos procedentes de 63 estados iniciales. El muestreo de ventanas reparte un 50 % de éxitos, un 30 % de fallos posteriores al primer cierre del gripper y un 20 % de cualquier punto de los fallos. Se optimiza con AdamW (lr 1e-5, 50 pasos de warmup, weight decay 0.01, gradient clip 0.5), batch efectivo de 63 (7 GPU × acumulación 9), cómputo en bf16 con pesos maestros en fp32, sobre 7 GPU AMD MI300X a unos 22,6 s por paso. El checkpoint final se selecciona a los 750 pasos según el split `val`, buscando el mejor PSNR del lado de los fallos entre los checkpoints que mantienen el PSNR del lado de los éxitos dentro de 0,3 dB del modelo base.

## Capacidades

- Generación de vídeo de manipulación robótica condicionada por acciones, en espacio `eef_abs` de BWM.
- Simulación de trayectorias exitosas y, novedad de este checkpoint, renderizado fiable de agarres fallidos en la tarea `adjust_bottle`.
- Predicción de latentes futuros mediante flow matching a partir de un fotograma de reset, 8 fotogramas de historial y las acciones ejecutadas.
- Uso como entorno de entrenamiento para RL: π0.5 entrenado con PPO dentro del modelo mejora sobre la política SFT.
- Compatibilidad directa con el pipeline de inferencia del modelo base (`num_inference_steps=50`, `cfg_scale=1`, `tiled=False`, `action_mode=adaln`).
- No es un modelo de lenguaje: no dispone de tool calling, function calling, capacidades multilingües ni modos de razonamiento textual.

## Casos de uso

- Entrenamiento de políticas de RL en simulación: el modelo actúa como entorno barato donde π0.5 puede entrenarse con PPO durante múltiples actualizaciones; el autor reporta mejoras de 9,7 puntos de media sobre la política SFT en cinco semillas.
- Detección de fallos en agarres: al renderizar de forma más realista los agarres fallidos (0,263 de falsos éxitos frente a 0,825 del base), permite evaluar políticas distinguiendo éxito y fracaso sin acceso al simulador.
- Evaluación de políticas π0.5 en la tarea `adjust_bottle`: dada una secuencia de acciones, genera los fotogramas futuros y permite clasificar el resultado como éxito o fallo.
- Investigación sobre sesgo de éxito en world models: sirve como caso de estudio sobre cómo el entrenamiento solo con éxitos produce falsos positivos y cómo añadir datos de fallo lo corrige.
- Generación aumentada de datos de fallo: los fotogramas de fallos generados pueden usarse para aumentar datasets de clasificadores de éxito, aunque con cautela por los falsos positivos residuales.
- Benchmarking de clasificadores de éxito congelados: el modelo permite medir la robustez de clasificadores (por ejemplo, basados en T5) frente a trayectorias generadas frente a las del simulador.
- Comparación modelo base frente a ajustado: útil para cuantificar el efecto de incluir datos de fallo en el entrenamiento de un world model.

## Benchmarks y rendimiento

Datos reportados por el autor sobre val + episodios finales no vistos (57 fallos, 28 éxitos), generación en lazo abierto desde el fotograma de reset leyendo los fotogramas 51–200 con un clasificador de éxito congelado basado en T5:

| Origen de los fotogramas | Fallos leídos como éxito | Éxitos recuperados (recall) |
|---|---:|---:|
| Simulador | 0.070 | 1.000 |
| Base `step-12000` | 0.825 | 1.000 |
| Ajuste solo con éxitos (500 pasos) | 0.860 | 1.000 |
| Este checkpoint (éxitos + fallos, 750 pasos) | 0.263 | 0.964 |

Observaciones del autor: el ajuste solo con éxitos mantiene la tasa de falsos éxitos, mientras que añadir datos de fallo la reduce; de los 57 fallos, 31 engañan solo al modelo entrenado con éxitos y 1 engaña solo al modelo mixto. En fidelidad de píxel, ambas recetas suben el PSNR frente al simulador en torno a 2 dB sobre fallos y éxitos (+1,92 / +2,06 dB en el split final para este checkpoint). Como entorno de RL, π0.5 entrenado con PPO durante 10 actualizaciones de política mejoró sobre la política SFT en las 5 semillas, con 9,7 puntos de media.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 10,2 GB, lo que encaja con pesos en bf16/fp16 de un modelo de ~5B. La inferencia en bf16 requiere en torno a 10-12 GB de VRAM solo para los pesos, más activaciones de vídeo.
- Al ser un modelo de difusión de vídeo con ventanas de 61 fotogramas, el consumo de memoria de activaciones crece con la resolución y el número de fotogramas; se desconoce la cifra exacta (no disponible).
- GPU de datacenter recomendadas: el autor entrenó con 7× AMD MI300X (192 GB cada una). Para inferencia conviene una GPU con al menos 24-40 GB de VRAM.
- Viabilidad en GPU de consumo: probablemente una RTX 4090 (24 GB) pueda ejecutar inferencia en bf16 con `tiled=True`, aunque no hay confirmación en la información disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, TGI, Ollama o llama.cpp; el pipeline esperado es el del modelo base Boundless World Model.
- Latencia y rendimiento: no disponible (el autor reporta 22,6 s por paso de entrenamiento, no inferencia).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/ventana | Modo entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint | ~5B (base Wan2.2) | 61 fotogramas/ventana | Ajuste 750 pasos con éxitos + fallos | Apache 2.0 | HuggingFace |
| Base `BLM-Lab/Boundless-World-Model` (`step-12000`) | ~5B | 61 fotogramas/ventana | Éxitos únicamente | Apache 2.0 | HuggingFace / GitHub |
| Ajuste solo con éxitos (500 pasos, referencia del autor) | ~5B | 61 fotogramas/ventana | Éxitos únicamente | no disponible | no disponible (referencia experimental) |

No se dispone de datos suficientes para comparar con otros world models de robótica de la misma categoría.

## Limitaciones y advertencias

- Persisten fallos de detalle en la acción: para estados iniciales donde pequeñas diferencias en las acciones deciden éxito o fallo, el 29 % de los fallos del entrenamiento aún se renderizan como éxitos (frente al 12 % con fotogramas del simulador).
- Sesgo de un único contexto: una sola tarea (`adjust_bottle`), un solo embodiment y una sola cámara de cabeza; entrenado sobre rollouts de una única familia de políticas (π0.5).
- Compromiso entre recall y falsos éxitos: entrenar más tiempo reduce los falsos éxitos en `val` pero baja la recall de éxitos de 0,91 a 0,73 a los 1000 pasos.
- Riesgo de alucinación visual: al ser un modelo generativo puede producir fotogramas plausibles pero incorrectos, lo que limita su uso como sustituto directo del simulador.
- Dependencia del contrato de inferencia: los números reportados exigen replicar el windowing exacto y el ruido de historial (σ = 0.2083) debe aplicarse manualmente, ya que en el pipeline publicado la rama de ruido de historial no tiene efecto a 50 pasos.
- No es un modelo de lenguaje: no soporta idiomas, tool calling ni agentes textuales.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset deben respetar sus propias condiciones.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no cuenta con validación de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lidavidsh/bwm-robotwin-adjust-bottle-failure-ft
- Dataset de rollouts: https://huggingface.co/datasets/lidavidsh/robotwin-adjust-bottle-pi05-rollouts
- Modelo base en HuggingFace: https://huggingface.co/BLM-Lab/Boundless-World-Model
- Boundless World Model en GitHub: https://github.com/boundless-large-model/boundless-world-model
- Tarea `adjust_bottle` de RoboTwin 2.0: https://robotwin-platform.github.io/doc/tasks/adjust_bottle.html
- Documentación de RoboTwin 2.0: https://robotwin-platform.github.io/doc/index.html
- Repositorio de RoboTwin: https://github.com/RoboTwin-Platform/RoboTwin
- Dataset RoboTwin_adjust_bottle (terceros): https://huggingface.co/datasets/suz22/RoboTwin_adjust_bottle
