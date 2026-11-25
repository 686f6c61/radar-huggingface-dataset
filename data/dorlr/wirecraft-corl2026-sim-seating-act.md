# DORLR/wirecraft-corl2026-sim-seating-act

## Resumen

WireCraft CoRL 2026 — Simulation Straight-Channel Seating (ACT, 100k) es un checkpoint de política robótica entrenado con el algoritmo ACT (Action Chunking with Transformers) sobre el simulador WireCraft, que se apoya en Isaac Lab. Lo publica el grupo DORLR como artefacto oficial del artículo presentado en CoRL 2026, y está pensado exclusivamente para evaluar la tarea de inserción (seating) de un objeto deformable en un canal recto con un brazo UR5 simulado.

El modelo no es un LLM ni un modelo de propósito general: es una política de imitación que mapea observaciones (imágenes y estado del robot) a secuencias de acciones de bajo nivel. Consta de 51.670.663 parámetros en formato safetensors y se distribuye a través de la librería LeRobot, con un tamaño de repositorio de 0,2 GB. Su relevancia es acotada al ámbito de la investigación en manipulación de objetos deformables y a la reproducibilidad del benchmark del artículo.

La ficha se limita a los datos publicados en la model card y en los metadatos de Hugging Face; cualquier especificación no documentada se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación para robótica |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (checkpoint en safetensors de precisión original) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors, más normalizadores pre/postproceso en safetensors y config.json) |

## Arquitectura y entrenamiento

El checkpoint implementa una política ACT, un transformer que predice trozos de acciones (action chunks) a partir de observaciones visuales y de estado proprioceptivo del robot. La configuración de entrenamiento documentada incluye `chunk_size=100`, `n_action_steps=50`, batch size 64, learning rate 1e-5 y semilla 1000, con el paso de checkpoint fijado en 100.000. El preset experimental es `scripts/wirecraft/experiments/corl2026_straight_channel.yaml` sobre la rama `corl2026-repro` del repositorio WireCraft.

El entrenamiento se realizó sobre el dataset `DORLR/Deformable-StraightChannel-v0-Scripted-1000-aug08-1`, compuesto por 1.000 episodios generados por script a 30 FPS en el entorno `WireCraft-UR5-Deformable-StackedCuboid-StraightChannel-v0`, simulado en Isaac Lab. No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de ajuste posteriores; se trata de aprendizaje por imitación supervisado sobre demostraciones. Los normalizadores de preproceso y posproceso se reconstruyeron de forma determinista a partir de la configuración del run de W&B `l366vyln` y del archivo `meta/stats.json` del dataset, con `use_imagenet_stats=true`, y se verificaron contra `ACTPolicy.from_pretrained` y simulación en bucle cerrado.

## Capacidades

- Control robótico de manipulación: genera secuencias de acciones para un UR5 simulado en la tarea de inserción en canal recto.
- Manipulación de objetos deformables: entrenado específicamente sobre geometrías deformables apiladas (StackedCuboid).
- Predicción por chunks de acción: emite bloques de 100 acciones y ejecuta 50 por paso de inferencia, lo que reduce el coste de inferencia en bucle cerrado.
- Aprendizaje por imitación a partir de demostraciones scriptadas: reproduce comportamientos observados en el dataset de entrenamiento.
- Integración con LeRobot: carga mediante `ACTPolicy.from_pretrained` y compatible con el pipeline de evaluación de WireCraft.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje).
- Capacidades multilingües: no aplica.
- Capacidades especiales (visión, audio, thinking mode): visión como entrada de observación; audio y thinking mode no disponibles.

## Casos de uso

- Reproducción del benchmark del artículo: ejecutar la política en el entorno `WireCraft-UR5-Deformable-StackedCuboid-StraightChannel-v0` con las semillas 1000, 2000 y 3000 para verificar el resultado reportado de 18,80 ± 7,65 % en la Tabla 2.
- Comparación de algoritmos de imitación: usar este checkpoint ACT como línea base frente a otras políticas (por ejemplo, diffusion policy) sobre el mismo dataset scriptado de 1.000 episodios.
- Estudio de manipulación de deformables en simulación: analizar el comportamiento de la política en inserciones de canal recto sin riesgo de dañar hardware real.
- Validación de pipelines de entrenamiento: comprobar la coherencia entre la configuración del run de W&B, los normalizadores reconstruidos y el comportamiento en bucle cerrado.
- Docencia e investigación en robótica: ejemplo reproducible de entrenamiento ACT con LeRobot e Isaac Lab para cursos o laboratorios.
- Desarrollo de métodos de evaluación: servir como referencia para diseñar protocolos de evaluación multi-semilla con 16 entornos paralelos y episodios de 900 pasos.
- Pruebas de integración de LeRobot: verificar la carga de políticas ACT y el flujo de preproceso/posproceso en entornos simulados.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| Straight-Channel Seating (Tabla 2 del artículo, 3 semillas de evaluación) | 18,80 ± 7,65 % | Tasa de éxito reportada por los autores en simulación |

No se han publicado en la información disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros), ya que no aplican a una política robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,67 M de parámetros en precisión original, el peso de los pesos ronda los 0,2 GB, por lo que la huella de memoria del modelo es reducida.
- GPU recomendadas: no disponible en la información proporcionada. La evaluación documentada se ejecuta con `--num_envs 16` en modo headless sobre Isaac Lab, lo que requiere una GPU compatible con el simulador.
- Compatibilidad con GPU de consumo: no disponible; depende de los requisitos de Isaac Lab y del renderizado del simulador, no solo del tamaño del modelo.
- Opciones de despliegue: LeRobot (`ACTPolicy.from_pretrained`) y el script `scripts/wirecraft/eval_lerobot.py` del repositorio WireCraft. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros checkpoints comparables de la misma tarea, y no se dispone de datos de parámetros, contexto o rendimiento de alternativas para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Ámbito restringido: el checkpoint está diseñado exclusivamente para evaluación en simulación de la tarea Straight-Channel Seating; no debe confundirse con las políticas reales de UR5 (`DORLR/wirecraft-corl2026-real-seating-act-*`).
- Rendimiento limitado: la tasa de éxito reportada es de 18,80 ± 7,65 %, con una variabilidad alta entre semillas, lo que indica baja robustez.
- Dependencia del simulador: requiere Isaac Lab y el entorno WireCraft en la rama `corl2026-repro`; no es desplegable en robótica real sin trabajo adicional.
- Sesgo de las demostraciones: entrenado sobre 1.000 episodios scriptados, por lo que hereda las limitaciones y la distribución estrecha de esa política scriptada.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero la política puede generar acciones inválidas fuera de la distribución de entrenamiento.
- Licencia: no disponible; se desconoce si se permite uso comercial.
- Idiomas: no aplica.
- Empaquetado reconstruido: `config.json` y los normalizadores se reconstruyeron de forma determinista a partir del run de W&B y del `stats.json` del dataset, no del artefacto original, lo que conviene tener en cuenta para reproducibilidad estricta.
- Sin métricas de latencia ni de throughput publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DORLR/wirecraft-corl2026-sim-seating-act
- Dataset de entrenamiento: https://huggingface.co/datasets/DORLR/Deformable-StraightChannel-v0-Scripted-1000-aug08-1
- Repositorio WireCraft (rama `corl2026-repro`): https://github.com/DORLR/WireCraft/tree/corl2026-repro
- Script de evaluación: `scripts/wirecraft/eval_lerobot.py` en el repositorio WireCraft
- Preset experimental: `scripts/wirecraft/experiments/corl2026_straight_channel.yaml`
- Run de W&B de referencia: `l366vyln` (no se proporciona URL directa)
- Paper, blog o demo: no disponible en la información proporcionada
