# RyanL22/ai611-faster-than-demo-dynamics

## Resumen

`RyanL22/ai611-faster-than-demo-dynamics` es un modelo de dinámica latente condicionado por acciones, desarrollado por RyanL22 en el marco del proyecto de curso AI611 ("Faster than Demonstration based on Offline RL"). No es un modelo de lenguaje ni un VLA generativo: es un predictor que, dada una observación inicial codificada en el espacio latente de V-JEPA 2, un estado propioceptivo y un fragmento (chunk) de 16 acciones remuestreadas temporalmente, estima el latente de la escena tras ejecutar ese chunk y el cambio de propiocepción resultante.

La arquitectura es un transformer predictor de 307,5 M de parámetros (variante `ac_init`, inicializada desde V-JEPA 2-AC y afinada) que opera sobre latentes de 1408 dimensiones producidos por un codificador V-JEPA 2 ViT-g/16 congelado a 256 px. El modelo permite evaluar, sin ejecutar en el simulador, el resultado de acelerar un chunk de acciones 1×, 2× o 3×, de modo que un value function externo pueda seleccionar la velocidad segura más rápida por chunk.

Su relevancia es de nicho pero concreta: propone un mecanismo de "world model" ligero para acelerar políticas VLA congeladas (en el pipeline descrito, GR00T N1.5) en tareas de manipulación LIBERO, sustituyendo parte del coste de rollout por predicción latente. El repositorio incluye también un baseline entrenado desde cero (`scratch`, 156,3 M de parámetros) con el mismo diseño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer predictor de dinámica latente sobre latentes V-JEPA 2 (encoder ViT-g/16 congelado) |
| Parametros totales | 307.485.063 (variante `ac_init`); 156,3 M (baseline `scratch`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (opera sobre chunks fijos de 16 acciones y 2 vistas de 256 tokens latentes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors` + `config.json`; subcarpeta `scratch/`) |

## Arquitectura y entrenamiento

El predictor consume `z0` con forma `[B, 2, 256, 1408]` (latentes de las vistas `agentview` y `robot0_eye_in_hand`), un vector de propiocepción de 7 dimensiones (`[x, y, z, rx, ry, rz, closedness]`), el cambio neto comandado del chunk (`net_act`, 7 dimensiones), la secuencia de 16 acciones remuestreadas (`[B, 16, 7]`, con padding a cero tras `n_steps`) y los escalares `n_steps` y `k` (factor de velocidad en {1, 2, 3}). Devuelve `z1_hat` (`[B, 2, 256, 1408]`, normalizado por layer norm) y `dstate_hat` (`[B, 7]`). El remuestreo divide las 16 acciones en `ceil(16/k)` grupos consecutivos, suma los deltas de posición y rotación dentro de cada grupo y toma el último comando de pinza; los límites de entrada y salida del controlador OSC se amplían 3× para no recortar los deltas sumados.

El entrenamiento usa datos ramificados de las demos oficiales de LIBERO (cuatro suites: `libero_10`, `libero_goal`, `libero_spatial`, `libero_object`, 500 demos por suite). Cada 4 pasos de demo se restaura el estado de MuJoCo (más el objetivo de pinza de robosuite) y se ejecuta el siguiente chunk de 16 pasos con k = 1, 2 y 3, renderizando observaciones a 256 px. El split es por demo (último 10 % por tarea para validación): 210.309 muestras de entrenamiento y 23.406 de validación, sobre ~78k estados iniciales. La pérdida combina L1 latente (`mean|z1_hat − z1|`) más 0,1 × SmoothL1 sobre el cambio de propiocepción normalizado. Optimización con AdamW (lr 1e-4, warmup 1k, coseno), weight decay 0,04, bf16, batch 64 en 4× A6000, 20k pasos.

## Capacidades

- Predicción del latente V-JEPA 2 de la escena tras ejecutar un chunk de acciones acelerado 1×, 2× o 3×.
- Predicción del cambio de propiocepción del efector final (posición, rotación y apertura de pinza) asociado al chunk.
- Modelado condicionado por acción con remuestreo temporal explícito, lo que permite comparar contrafactualmente distintas velocidades de ejecución sobre el mismo estado inicial.
- Integración con un value function `V_ψ` entrenado en el mismo espacio latente para puntuar el resultado predicho y elegir la velocidad segura más rápida por chunk.
- Soporte de dos vistas de cámara simultáneas (`agentview` y `robot0_eye_in_hand`).
- No soporta tool calling, agentes multi-paso, generación de texto, visión general ni capacidades multilingües: es un componente específico de planificación robótica.

## Casos de uso

- Aceleración de políticas VLA congeladas: dado un chunk propuesto por GR00T N1.5, el predictor evalúa el latente resultante a 1×, 2× y 3× y un value function selecciona la velocidad segura más rápida, reduciendo el tiempo de ejecución sin reentrenar la política.
- Filtrado previo a ejecución en simulación: descartar chunks cuyo latente predicho se aleje del objetivo antes de enviarlos al controlador OSC, ahorrando rollouts en MuJoCo.
- Evaluación offline de políticas: estimar el resultado de una política sobre estados de LIBERO sin ejecutar el simulador, útil para comparar variantes de política o de velocidad.
- Aprendizaje por refuerzo offline: usar `z1_hat` y `dstate_hat` como modelo de transición latente para planificación o para entrenar el value function `V_ψ` sobre el mismo espacio.
- Investigación en world models para manipulación: banco de pruebas reproducible (LIBERO, cuatro suites, tres factores de velocidad) para estudiar la fidelidad de dinámicas latentes condicionadas por acción.
- Selección adaptativa de velocidad en robótica de manipulación: en tramos de trayectoria con poco riesgo (aproximaciones, transporte), aumentar k; en contacto o agarre, mantener k = 1.
- Docencia y reproducción de experimentos: el par `ac_init`/`scratch` permite medir el efecto de la inicialización desde V-JEPA 2-AC frente a entrenamiento desde cero con el mismo diseño.

## Benchmarks y rendimiento

Resultados de validación en el paso 20k, según la model card. `lat/copy` es la L1 latente dividida por el baseline de copia (predecir `z1 = z0`); menor es mejor. EEF es el error de la posición predicha del efector final.

| Modelo | k=1 lat/copy | k=2 lat/copy | k=3 lat/copy | k=1 EEF | k=2 EEF | k=3 EEF |
|---|---|---|---|---|---|---|
| ac_init | 0,679 | 0,682 | 0,683 | 8,4 mm | 7,5 mm | 8,1 mm |
| scratch | 0,684 | 0,687 | 0,689 | 8,4 mm | 7,4 mm | 7,9 mm |

La inicialización desde V-JEPA 2-AC acelera el entrenamiento (en el paso 1k: 0,76 frente a 0,87), pero la diferencia final entre ambas variantes es pequeña. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni métricas de éxito de tarea en LIBERO para el pipeline completo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repo ocupa 1,9 GB (pesos en safetensors) y el entrenamiento se realizó en 4× A6000 con bf16 y batch 64. El codificador V-JEPA 2 ViT-g/16 congelado (descargado aparte desde `vjepa2-ac-vitg.pt`) es el componente más pesado y condiciona el consumo real.
- GPU recomendadas: A6000 (usada en entrenamiento), A100/H100 para lotes grandes; el predictor de 307,5 M es manejable en GPUs de consumo con bf16, pero el encoder ViT-g/16 eleva los requisitos.
- Compatibilidad con GPU de consumo: el predictor en sí es pequeño (307,5 M), pero el pipeline completo (encoder ViT-g/16 + predictor) probablemente requiere una GPU con suficiente VRAM para el encoder; no se especifica el mínimo exacto.
- Opciones de despliegue: uso mediante PyTorch con el código del repositorio (`speedup.predictor.load_dynamics`, `speedup.vjepa.FrozenEncoder`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `RyanL22/ai611-faster-than-demo-dynamics` | 307,5 M (`ac_init`); 156,3 M (`scratch`) | Chunks de 16 acciones, 2 vistas 256 px, latentes 1408-d | Dinámica latente condicionada por acción (LIBERO) | MIT | Hugging Face |
| V-JEPA 2-AC (`facebook/vjepa2-vitg-fpc64-256`) | no disponible en la información | no disponible | Modelo base de V-JEPA 2 con adaptación a control | MIT (según atribución en la model card) | Hugging Face / GitHub |
| GR00T N1.5 | no disponible en la información | no disponible | Política VLA usada como propuesta de acciones en el pipeline | no disponible | no disponible |

No se dispone de datos suficientes en la información proporcionada para comparar parámetros, contexto o rendimiento con alternativas equivalentes de dinámica latente.

## Limitaciones y advertencias

- Modelo de nicho: no es un modelo de lenguaje ni un VLA; solo predice latentes y cambios de propiocepción en el dominio LIBERO.
- Dominio restringido: entrenado exclusivamente con demos de LIBERO (cuatro suites, 500 demos cada una) y con el controlador OSC; la generalización a otros robots, tareas o controladores no está validada.
- Dependencia de un codificador externo: requiere el encoder V-JEPA 2 ViT-g/16 congelado, descargado desde un enlace de Meta, lo que añade dependencia y coste computacional.
- Ganancia modesta de la inicialización: la diferencia final entre `ac_init` y `scratch` es pequeña (0,679 frente a 0,684 en lat/copy a k=1); el beneficio principal es la velocidad de convergencia.
- Sin métricas de éxito de tarea: la model card reporta error latente y EEF, pero no tasas de éxito del pipeline completo en LIBERO.
- Código no público: el repositorio de código asociado está indicado como privado en el momento de la publicación.
- Riesgo de alucinación: en este contexto, el modelo puede predecir latentes plausibles pero incorrectos en estados de contacto, agarre o configuraciones poco representadas; no se documentan análisis de calibración.
- Sesgos: no se documentan sesgos específicos; al entrenarse en un simulador, puede heredar sesgos de las demos y del renderizado.
- Licencia MIT: permite uso comercial, pero la atribución a V-JEPA 2-AC (Meta, MIT) y a LIBERO debe mantenerse según la model card.
- Sin cuantizaciones publicadas ni soporte documentado para despliegue en runtimes de inferencia estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RyanL22/ai611-faster-than-demo-dynamics
- Repositorio de código (indicado como privado): https://github.com/ryan-seungyong-lee/ai611-faster-than-demo
- V-JEPA 2 (código): https://github.com/facebookresearch/vjepa2
- Pesos del encoder V-JEPA 2-AC: https://dl.fbaipublicfiles.com/vjepa2/vjepa2-ac-vitg.pt
- LIBERO (código): https://github.com/Lifelong-Robot-Learning/LIBERO
- Dataset LIBERO en Hugging Face: https://huggingface.co/datasets/yifengzhu-hf/LIBERO-datasets
- Modelo base: https://huggingface.co/facebook/vjepa2-vitg-fpc64-256
