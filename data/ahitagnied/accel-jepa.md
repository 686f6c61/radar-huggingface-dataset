# ahitagnied/accel-jepa

## Resumen

accel-jepa es un repositorio de checkpoints de investigación publicado por el usuario ahitagnied en Hugging Face, no un modelo de lenguaje en el sentido convencional. Contiene los pesos entrenados de varias configuraciones de un modelo JEPA (Joint-Embedding Predictive Architecture) aplicado a tareas de dinámica física en entornos tipo "square" y "approach ball", presumiblemente parte de un entorno de aprendizaje de world models. El repositorio incluye dos familias: LeWM (base) y H-JEPA (una variante jerárquica con niveles L1 y L2).

El interés técnico del artefacto reside en la comparación controlada entre arquitecturas: todas las ejecuciones usan 20 épocas y semilla 42, y se reportan métricas de sonda lineal (MLP probe) sobre un único token para predecir posición, velocidad y variables angulares. Los resultados muestran que la variante H-JEPA window3 en nivel L2 recupera información de velocidad que las demás configuraciones no capturan, especialmente en la tarea "square" (R² de 0,53 en vx, 0,93 en vz y 0,63 en ω frente a valores cercanos a cero en el resto).

No se dispone de información sobre arquitectura detallada, número de parámetros, contexto, licencia ni idiomas. El tamaño del repositorio es de 0,6 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | JEPA (Joint-Embedding Predictive Architecture) con variantes LeWM y H-JEPA jerárquica (niveles L1 y L2) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `.pt` (LeWM, con `config.json`) y `.ckpt` pickle (H-JEPA, con `config.yaml` y `normalizer.pt`) |

## Arquitectura y entrenamiento

El repositorio agrupa checkpoints de dos familias de modelos. La primera, LeWM, corresponde a la rama principal del proyecto y almacena pesos en formato `.pt` junto con un `config.json`. La segunda, H-JEPA, implementa una arquitectura jerárquica con al menos dos niveles (L1 y L2) y dos variantes de codificador temporal: `hjepa_l2_stock`, que usa un MLP de un solo frame con stride 2, y `hjepa_l2`, que emplea un codificador de secuencia con ventana de 3 frames y stride 3.

Todas las ejecuciones se entrenaron durante 20 épocas con semilla 42, lo que permite comparaciones controladas entre configuraciones. Los checkpoints de H-JEPA se guardan como objeto de modelo serializado con pickle (`<name>_e20_seed42.ckpt`), cargable mediante `torch.load(..., weights_only=False)` con el directorio `h_jepa/` en `sys.path`, e incluyen un `normalizer.pt` para la normalización de entradas. No se especifican el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, algo esperable dado que no es un modelo de lenguaje.

## Capacidades

- Predicción de dinámica física en entornos simulados: posición (x, y, z), velocidad (vx, vy, vz) y velocidad angular (ω) a partir de representaciones latentes.
- Extracción de representaciones latentes evaluables mediante sonda MLP sobre un único token.
- Soporte de dos tareas diferenciadas: "square" (movimiento en plano con rotación) y "approach ball" (aproximación a un objetivo).
- Variante jerárquica H-JEPA con dos niveles de abstracción (L1 y L2).
- Codificador temporal con ventana de 3 frames (window3) que mejora la captura de información de velocidad frente al MLP de un frame.
- No se documentan capacidades de generación de texto, código, matemáticas, visión general, tool calling, agentes ni multilingüismo.

## Casos de uso

- Investigación en world models: el repositorio sirve como base reproducible (semilla 42, 20 épocas) para comparar arquitecturas JEPA planas frente a jerárquicas en tareas de dinámica física.
- Estudio de representaciones latentes: los checkpoints permiten entrenar sondas MLP sobre tokens individuales para medir qué variables físicas quedan codificadas en cada nivel jerárquico.
- Análisis de codificadores temporales: la comparación entre `hjepa_l2_stock` (stride 2, un frame) y `hjepa_l2` (stride 3, ventana de 3 frames) facilita evaluar el impacto del contexto temporal en la estimación de velocidad.
- Reproducción de experimentos: al fijar semilla y número de épocas, los checkpoints permiten replicar las tablas de R² reportadas y validar pipelines de evaluación.
- Desarrollo de controladores basados en modelos: las representaciones predictivas pueden integrarse en bucles de planificación o control en entornos simulados tipo "square" o "approach ball".
- Benchmarking de arquitecturas auto-supervisadas: sirve como referencia para comparar nuevas variantes JEPA contra las configuraciones LeWM y H-JEPA publicadas.

## Benchmarks y rendimiento

Los únicos datos disponibles son los R² de una sonda MLP sobre un único token en held-out, reportados en la model card.

Tarea "square":

| Modelo | x | z | sin4θ | vx | vz | ω |
|---|---|---|---|---|---|---|
| LeWM | 1,00 | 1,00 | 0,97 | −0,01 | 0,07 | −0,01 |
| H-JEPA stock L1 | 1,00 | 1,00 | 0,97 | −0,01 | 0,08 | −0,01 |
| H-JEPA window3 L1 | 1,00 | 1,00 | 1,00 | −0,01 | 0,08 | 0,00 |
| H-JEPA stock L2 | 1,00 | 1,00 | 0,90 | −0,01 | 0,11 | −0,01 |
| H-JEPA window3 L2 | 1,00 | 1,00 | 0,96 | 0,53 | 0,93 | 0,63 |

Tarea "approach ball":

| Modelo | x | y | z | vx | vy | vz |
|---|---|---|---|---|---|---|
| LeWM | 1,00 | 1,00 | 0,72 | 0,35 | 0,03 | 0,08 |
| H-JEPA stock L1 | 1,00 | 1,00 | 0,97 | 0,35 | 0,04 | 0,13 |
| H-JEPA window3 L1 | 1,00 | 1,00 | 0,99 | 0,35 | 0,04 | 0,16 |
| H-JEPA stock L2 | 1,00 | 1,00 | 0,34 | 0,34 | 0,04 | 0,10 |
| H-JEPA window3 L2 | 1,00 | 1,00 | 0,39 | 0,81 | 0,80 | 0,13 |

Las velocidades objetivo se calculan como la media sobre un intervalo de un token (1 frame en L1, 2 en stock L2 y 3 en window3 L2). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (0,6 GB) sugiere modelos de pequeño tamaño, pero no se especifican parámetros.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada, aunque el tamaño del artefacto apunta a que podría ejecutarse en GPUs de consumo; no hay datos oficiales.
- Opciones de despliegue: carga vía PyTorch (`torch.load`), con `h_jepa/` en `sys.path` para los checkpoints H-JEPA; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | R² velocidad (square) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| accel-jepa (window3 L2) | JEPA jerárquica | no disponible | no disponible | vx 0,53 / vz 0,93 / ω 0,63 | no disponible | Hugging Face |
| accel-jepa (LeWM) | JEPA plana | no disponible | no disponible | vx −0,01 / vz 0,07 / ω −0,01 | no disponible | Hugging Face |
| accel-jepa (stock L2) | JEPA jerárquica | no disponible | no disponible | vx −0,01 / vz 0,11 / ω −0,01 | no disponible | Hugging Face |

No se dispone de información sobre modelos externos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni código, y no debe evaluarse con benchmarks tipo MMLU o HumanEval.
- Licencia no especificada: no se puede confirmar el uso comercial ni la redistribución.
- Los checkpoints H-JEPA se cargan con `torch.load(..., weights_only=False)`, lo que implica ejecución de pickle y riesgos de seguridad si el origen no es de confianza.
- Requiere el directorio `h_jepa/` en `sys.path` y un `normalizer.pt` para la normalización de entradas; sin ellos la inferencia no es reproducible.
- Los resultados reportados son R² de sondas sobre un único token y se limitan a dos tareas concretas ("square" y "approach ball"); no hay evidencia de generalización a otros entornos.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas por tratarse de un modelo de dinámica física, no de lenguaje.
- Repositorio sin descargas ni likes y con información mínima: no hay garantías de mantenimiento ni soporte.

## Enlaces

- Hugging Face: https://huggingface.co/ahitagnied/accel-jepa
