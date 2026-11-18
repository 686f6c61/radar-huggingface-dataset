# humanoid-benchmark/dp

## Resumen

DP es un checkpoint de Diffusion Policy (DDPM) entrenado sobre tareas del Humanoid Benchmark, un conjunto de referencia para políticas robóticas de cuerpo completo. Lo publica la organización `humanoid-benchmark` y sigue la misma receta y redes que su baseline FM-DiT (`humanoid-benchmark/fm-dit`): codificador de imagen ResNet18 y backbone de acciones DiT con AdaLN (dimensión oculta 384, 4 capas, 8 cabezas de atención). La única diferencia frente a FM-DiT es el objetivo generativo: predicción de épsilon con DDPM, 100 pasos de entrenamiento y muestreo sobre los 100 pasos.

El checkpoint publicado corresponde a la tarea B6 ("pedal bin") con batch 512 y 4.000 pasos de optimización, entrenado sobre los primeros 100 episodios del dataset experto `b6-pedal-bin` v5 (65.127 fotogramas, unas 31,4 épocas). El modelo tiene 22,5 M de parámetros, de los cuales 11,2 M están en el ResNet18, y consume estado de 44 dimensiones del robot Unitree G1 más dos cámaras RGB (`ego_view` y `chest`) para producir 16 acciones de dimensión 76 (64 tokens de movimiento SONIC y 6 valores medidos por cada mano INSPIRE).

Su relevancia es doble: por un lado sirve como referencia negativa reproducible dentro del benchmark (obtiene 0/50 en la evaluación cerrada con el protocolo `v5_ready_start`), y por otro documenta de forma exhaustiva el proceso de entrenamiento, los ficheros de estado y las instrucciones de reanudación, lo que lo convierte en un artefacto útil para depurar pipelines de imitación robótica más que para despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Policy: ResNet18 (codificador de imagen) + DiT con AdaLN (backbone de acciones), DDPM con predicción de épsilon |
| Parámetros totales | 22,5 M (11,2 M en el ResNet18) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de imitación; no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible (checkpoint `model.pt` en precisión de entrenamiento, bf16 autocast) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; recibe instrucción textual fija en inglés) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (PyTorch), más `train_state.pt` para reanudar entrenamiento |

## Arquitectura y entrenamiento

La política combina un codificador visual ResNet18 inicializado con pesos de ImageNet y ajustado fino a 0,1× la tasa de aprendizaje con BatchNorm congelado, junto con un backbone transformer de tipo DiT con normalización adaptativa por capa (AdaLN) de 384 dimensiones, 4 capas y 8 cabezas de atención. El proceso generativo es un DDPM con predicción de épsilon, 100 pasos de difusión y planificación `squaredcos_cap_v2` con muestras recortadas; en inferencia se muestrean los 100 pasos completos. La entrada son imágenes RGB de las cámaras `ego_view` y `chest` redimensionadas a 168×224, junto con el estado de 44 dimensiones del Unitree G1 (sin velocidades). La salida son 16 acciones de dimensión 76.

El entrenamiento usó los primeros 100 episodios del dataset experto `b6-pedal-bin` v5 (65.127 fotogramas, unas 31,4 épocas), con batch 512, 4.000 pasos de AdamW (lr 1e-4, betas 0,95/0,999, weight decay 1e-6), calentamiento lineal de 200 pasos y decaimiento coseno, autocast bf16 y pesos EMA (0,998 en el paso 4.000). Se aplicó la aumentación `hb-aug-v2-20261109`, que añade un sesgo de ±2 grados y ruido de 0,25 grados únicamente sobre las 29 articulaciones del cuerpo. No hubo episodios reservados para validación. La pérdida DDPM final fue 0,049 y el error cuadrático medio de acción normalizado sobre 256 fotogramas de entrenamiento fue 0,034 en el paso 2.000 y 0,030 en el 4.000.

## Capacidades

- Generación de trayectorias de acción para el robot humanoide Unitree G1 en la tarea B6 (recoger el barril de chips del carro, caminar hasta el contenedor con pedal, pisar el pedal y depositarlo).
- Política de imitación multimodal: combina estado propioceptivo de 44 dimensiones con dos vistas RGB.
- Control de manos: produce 6 valores medidos por cada mano INSPIRE además de 64 tokens de movimiento SONIC.
- Muestreo generativo por difusión con 100 pasos DDPM.
- Reanudación de entrenamiento desde `train_state.pt` con estado de AdamW, planificador de LR, EMA y paso.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es una política robótica cerrada, no un modelo de lenguaje.
- No incluye modo de pensamiento, visión general, audio ni otras capacidades fuera del dominio de la tarea.

## Casos de uso

- Reproducción de baselines en el Humanoid Benchmark: el checkpoint permite replicar exactamente el resultado 0/50 con el protocolo `v5_ready_start` y los seeds 180000-180049, útil para validar la infraestructura de evaluación antes de probar políticas nuevas.
- Estudio comparativo de objetivos generativos: al compartir redes con FM-DiT y diferir solo en el objetivo (DDPM frente a flow matching), sirve para aislar el efecto del objetivo generativo en el rendimiento final.
- Depuración de pipelines de imitación: los ficheros `run.json`, `train_log.jsonl`, `batch_check_b6_v5.json` y `SHA256SUMS` permiten auditar la reproducibilidad del entrenamiento paso a paso.
- Reanudación y ajuste fino: el `train_state.pt` permite continuar el entrenamiento hasta 8.000 pasos o cambiar el número de episodios, lo que facilita experimentos de escalado de datos.
- Referencia negativa en publicaciones: documenta un caso en el que una política de difusión con esta configuración no logra contacto con el objeto, lo que ayuda a justificar arquitecturas alternativas.
- Pruebas de integración del runtime: el ejemplo de carga con `BaselinePolicy` y `policy='dp'`, `robot='g1'` sirve para verificar que el entorno de inferencia del benchmark funciona en CPU o GPU antes de desplegar políticas más costosas.

## Benchmarks y rendimiento

| Modelo | Checkpoint | Protocolo | Éxito |
|---|---|---|---|
| GR00T | `b6-pedal-bin/b256/step-004000` | `v5_ready_start`, 50 layouts, seeds 180000-180049, 45 s | 39/50 |
| Psi0 | `b6-pedal-bin/b512/step-004000` | mismo protocolo | 30/50 |
| ACT | `b6-pedal-bin/b512/step-004000` | mismo protocolo | 8/50 |
| FM-DiT | `b6-pedal-bin/b512/step-004000` | mismo protocolo | 0/50 |
| DP (este modelo) | `b6-pedal-bin/b512/step-004000` | mismo protocolo | 0/50 |

Métricas de entrenamiento: pérdida DDPM final 0,049; MSE de acción normalizado 0,034 (paso 2.000) y 0,030 (paso 4.000) sobre 256 fotogramas de entrenamiento. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja por el tamaño del modelo (22,5 M de parámetros); con pesos en fp32 el checkpoint ocupa del orden de decenas de MB, y el repo completo pesa 0,5 GB incluyendo estado de entrenamiento y logs.
- GPU recomendadas: el entrenamiento se realizó en una RTX 5090 de 32 GB con batch 512; para inferencia basta una GPU consumer modesta o incluso CPU, como muestra el ejemplo de carga con `device='cpu'`.
- Cabe en cualquier GPU consumer actual (RTX 3060, RTX 4060, RTX 4090, etc.) y en CPU para evaluación puntual.
- Opciones de despliegue: el runtime propio del benchmark (`baselines.runtime.BaselinePolicy` con `policy='dp'`, `robot='g1'`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; el muestreo requiere 100 pasos DDPM por acción, lo que condiciona la latencia en control cerrado, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Objetivo generativo | Éxito B6 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DP (este) | 22,5 M | ResNet18 + DiT AdaLN | DDPM, predicción de épsilon, 100 pasos | 0/50 | no disponible | Hugging Face |
| FM-DiT | 22,5 M (mismas redes) | ResNet18 + DiT AdaLN | Flow matching | 0/50 | no disponible | Hugging Face (`humanoid-benchmark/fm-dit`) |
| ACT | no disponible | no disponible | no disponible | 8/50 | no disponible | Hugging Face (`humanoid-benchmark/act`) |
| Psi0 | no disponible | no disponible | no disponible | 30/50 | no disponible | Hugging Face |
| GR00T | no disponible | no disponible | no disponible | 39/50 | no disponible | Hugging Face |

## Limitaciones y advertencias

- Rendimiento nulo en la evaluación cerrada publicada: 0/50 con el protocolo `v5_ready_start`; el robot nunca llegó a tocar el barril. No es un modelo apto para despliegue real en la tarea B6 tal cual.
- Entrenado únicamente sobre los primeros 100 episodios de una sola tarea (B6) y un solo robot (Unitree G1); no generaliza a otras tareas, morfologías ni entornos.
- Sin episodios reservados para validación: las métricas offline se calculan sobre fotogramas de entrenamiento, por lo que pueden estar sesgadas al alza.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución de los pesos.
- Idiomas no aplicables: la instrucción textual de entrenamiento está fija en inglés y no hay interfaz multilingüe.
- Riesgo de sobreajuste a la distribución de layouts de entrenamiento; la evaluación con 50 layouts no vistos muestra fallo total.
- La reanudación desde `train_state.pt` no fue probada desde el layout publicado, según advierte el propio autor.
- No dispone de mecanismos de seguridad, moderación ni alineación; es un artefacto de investigación.
- El estado de entrada excluye velocidades (44 dimensiones), lo que limita la información disponible para el control.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/humanoid-benchmark/dp
- Baseline FM-DiT: https://huggingface.co/humanoid-benchmark/fm-dit
- Baseline ACT: https://huggingface.co/humanoid-benchmark/act
- Dataset de la tarea B6: https://huggingface.co/datasets/humanoid-benchmark/b6-pedal-bin
- Checkpoint concreto: https://huggingface.co/humanoid-benchmark/dp/tree/main/b6-pedal-bin/b512/step-004000
- Código de entrenamiento (snapshot incluido en el repo): `code/hb_baselines_v1/baselines/train.py`
- Script de evaluación cerrada citado: `debug/newton/b6_policy_eval.py` (protocolo `v5_ready_start`)
