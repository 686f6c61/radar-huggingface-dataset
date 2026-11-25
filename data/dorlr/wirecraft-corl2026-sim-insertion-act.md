# DORLR/wirecraft-corl2026-sim-insertion-act

## Resumen

WireCraft CoRL 2026 — Simulation Connector Insertion (ACT, 100k) es un checkpoint de política robótica entrenado con el algoritmo ACT (Action Chunking with Transformers) sobre la tarea de inserción de conectores en un entorno simulado de Isaac Lab, dentro del proyecto WireCraft. Lo desarrolla el equipo DORLR como artefacto oficial asociado al paper de CoRL 2026, y está pensado exclusivamente para evaluación en simulación del benchmark de inserción de conectores (tablas 1 y 9 del paper, run de W&B `ys7rp397`).

El modelo resuelve una tarea de manipulación de objetos deformables: insertar un conector en una estructura de cuboides apilados deformables con un brazo UR5 simulado. Con 51.670.663 parámetros y un repo de 0,2 GB, es un transformer compacto de imitación que predice secuencias de acciones (chunks de 100 pasos, ejecutando 50) a partir de observaciones visuales y de estado.

Es relevante ahora porque acompaña la reproducibilidad del paper (rama `corl2026-repro`) y porque fija una referencia cuantitativa concreta: 60,94 ± 11,16 % en alcance (T2) y 29,69 ± 9,24 % en inserción (T0) sobre 64 rollouts (4 semillas × 16 entornos, 800 pasos). No debe confundirse con los checkpoints de hardware real (`DORLR/wirecraft-corl2026-real-insertion-act-*`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación con encoder visual y decoder transformer de acciones |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica como contexto de lenguaje; `chunk_size=100`, `n_action_steps=50`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un transformer de imitación que mapea observaciones (imágenes de cámara y estado proprioceptivo del robot) a chunks de acciones de bajo nivel. En este checkpoint el chunk es de 100 pasos con 50 acciones ejecutadas por inferencia, lo que reduce el error de compounding típico de las políticas paso a paso. El entrenamiento se realizó hasta el paso 100.000 con batch size 64, learning rate `1e-5`, semilla 1000 y `image_transforms.enable=false`.

El dataset de entrenamiento es `DORLR/Deformable-StackedCuboid-Insertion-v0-Scripted-1000-apr29-1`: 1.000 episodios generados por script a 30 FPS en el entorno `WireCraft-UR5-Deformable-StackedCuboid-Insertion-v0` sobre Isaac Lab. El preset de paper es `scripts/wirecraft/experiments/corl2026_insertion.yaml` en la rama `corl2026-repro` del repositorio WireCraft. No se documenta en la información disponible el uso de RLHF/DPO ni innovaciones adicionales más allá del esquema estándar de action chunking.

## Capacidades

- Control robótico de manipulación: genera secuencias de acciones para un UR5 simulado en tareas de inserción de conectores.
- Manipulación de objetos deformables: entrenado específicamente sobre cuboides apilados deformables.
- Política de imitación por chunks: predice 100 acciones y ejecuta 50, lo que aporta suavidad y robustez temporal.
- Entrada multimodal: observaciones visuales y de estado del robot (sin transformaciones de imagen adicionales en entrenamiento).
- Evaluación reproducible en simulación: integrable con el script `eval_lerobot.py` del repo WireCraft.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Evaluación de referencia del benchmark de inserción: usar el checkpoint con `scripts/wirecraft/eval_lerobot.py` para reproducir las métricas T0/T2 del paper y comparar nuevas políticas contra esta línea base.
- Reproducibilidad de resultados de paper: ejecutar la configuración exacta (16 entornos, semillas 1000-4000, 800 pasos) para validar tablas 1 y 9 de CoRL 2026.
- Baseline en estudios de manipulación deformable: comparar variantes de ACT, de dataset o de hiperparámetros contra este checkpoint de 100k pasos.
- Desarrollo de pipelines de sim-to-real: usar la política simulada como punto de partida antes de pasar a los checkpoints de hardware real del mismo proyecto.
- Docencia e investigación en imitation learning: ejemplo completo y ligero (0,2 GB) de entrenamiento ACT con dataset scripted y evaluación estandarizada.
- Integración en entornos Isaac Lab: desplegar la política dentro del simulador para generar trayectorias y datos sintéticos adicionales.

## Benchmarks y rendimiento

Resultados reportados en la model card (4 semillas × 16 entornos = 64 rollouts, 800 pasos):

| Metrica | Resultado |
|---|---|
| Reach (T2) | 60,94 ± 11,16 % |
| Insert (T0) | 29,69 ± 9,24 % |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni benchmarks equivalentes, por no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 51,7 M de parámetros en safetensors y repo de 0,2 GB, la inferencia es viable en GPU consumer de gama media.
- GPU recomendadas: no especificadas por el autor; cualquier GPU con soporte CUDA suficiente para Isaac Lab (p. ej. RTX 3090/4090 o superiores) debería poder ejecutar la política.
- Cabe en GPU consumer: sí, por tamaño del checkpoint; el cuello de botella real es el simulador Isaac Lab, no el modelo.
- Opciones de despliegue: `lerobot` con el script `eval_lerobot.py` del repo WireCraft; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DORLR/wirecraft-corl2026-sim-insertion-act | 51,7 M | chunk 100, ejecuta 50 | Inserción simulada (deformable) | no disponible | Hugging Face |
| DORLR/wirecraft-corl2026-real-insertion-act-* | no disponible | no disponible | Inserción en UR5 real | no disponible | Hugging Face |
| Otros checkpoints ACT de lerobot | no disponible | no disponible | Manipulación genérica | no disponible | Hugging Face |

No se dispone en la información proporcionada de datos de rendimiento de los modelos comparables, por lo que la comparación cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Ámbito restringido: solo válido para evaluación en simulación de la tarea de inserción de conectores; no debe usarse como política de hardware real.
- Rendimiento limitado: la tasa de inserción reportada es del 29,69 %, insuficiente para despliegues autónomos sin supervisión.
- Alta varianza: desviaciones de ±11,16 y ±9,24 puntos porcentuales indican sensibilidad a semilla y condiciones iniciales.
- Dependencia del simulador: requiere Isaac Lab y la versión concreta del repo WireCraft (`corl2026-repro`) para reproducir resultados.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Sin cuantizaciones publicadas ni documentación de sesgos o alucinación (no aplica el concepto de alucinación lingüística, pero sí el de fallos de política fuera de distribución).
- Dataset scripted: el entrenamiento con 1.000 episodios generados por script puede no cubrir variabilidad real de objetos deformables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DORLR/wirecraft-corl2026-sim-insertion-act
- Dataset de entrenamiento: https://huggingface.co/datasets/DORLR/Deformable-StackedCuboid-Insertion-v0-Scripted-1000-apr29-1
- Repositorio WireCraft (rama `corl2026-repro`): https://github.com/DORLR/WireCraft/tree/corl2026-repro
- Preset de paper: `scripts/wirecraft/experiments/corl2026_insertion.yaml` (dentro del repo anterior)
- Run de W&B: `ys7rp397` (referenciado en la model card)
