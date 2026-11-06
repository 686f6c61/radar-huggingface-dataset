# Donghyun1228/pi05-libero-ttt-vla-random-probe-source-n50k-20000-20261021

## Resumen

π0.5 LIBERO TTT-VLA source es un checkpoint de investigación para robótica manipulativa derivado de π0.5 (openpi), publicado por el usuario Donghyun1228. Se trata de un artefacto de un pipeline de adaptación denominado TTT-VLA (test-time training para modelos visión-lenguaje-acción), en el que se combina un experto de *state grounding* entrenado por flow matching con un *latent prompt* de 16 tokens sobre la arquitectura π0.5. El objetivo es mejorar la robustez del modelo ante cambios de punto de vista y orientación de cámara en el benchmark LIBERO.

El repositorio no contiene pesos en formato estándar de inferencia (safetensors/GGUF), sino un fichero `sg_lp.npz` con 71 tensores en FP32 y un JSON asociado, pensado para cargarse con el runtime concreto del repositorio `Donghyun1228/vla_adaptation` (commit `84a1f92b`). El entrenamiento se realizó durante 20.000 actualizaciones sobre demostraciones originales de LIBERO (pérdida de acción) y sobre 50.000 fotogramas de *random probes* (pérdida de *state grounding* proxy sobre xyz y una coordenada de pinza).

Es relevante ahora porque documenta una línea de trabajo sobre adaptación en *test time* para VLA en robótica, con métricas de éxito publicadas bajo seis tipos de *shift* (escala de vista y rotación yaw), lo que permite evaluar la degradación del modelo ante cambios de cámara. No obstante, es un artefacto de investigación de un autor individual, sin descargas ni validación externa, y no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 (openpi) con experto de flow matching para *state grounding* y *latent prompt* de 16 tokens |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en FP32 en `sg_lp.npz`) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | `.npz` (71 tensores FP32) + `.json`; carga mediante `baselines.ttt_vla.checkpoints.load` |

## Arquitectura y entrenamiento

El modelo parte de π0.5 (familia openpi) y añade dos componentes entrenados: un experto de *state grounding* basado en flow matching y un *latent prompt* de 16 tokens. El entrenamiento combina dos objetivos: pérdida de acción sobre las demostraciones originales de LIBERO y pérdida de *state grounding* (proxy) sobre *random probes* generados en vistas originales, con objetivo normalizado a la fuente de las coordenadas xyz actuales y una coordenada de pinza.

La configuración reportada es de 20.000 actualizaciones en dos etapas de 10.000, con batch de acción/proxy de 64/64, AdamW con LR 1e-4, weight decay 0, semilla 0 y FSDP sobre 4 dispositivos (nodo `kn_b200`). Los *random probes* provienen del dataset `Donghyun1228/libero-support-random-waypoint-300k-20261015` (commit `32ed215b`), usando los primeros 1250 fotogramas por tarea (50.000 fotogramas en total). La normalización se define en `assets/donghyun/libero` (`norm_stats.json`, SHA256 `c0ee3c1a…`). El repositorio incluye en `run/` la configuración, el plan de entradas, una auditoría en CPU de los arrays finales y las 20.000 filas de métricas de entrenamiento.

## Capacidades

- Control robótico de manipulación en el entorno LIBERO mediante políticas visión-lenguaje-acción.
- Generación de acciones condicionadas por observaciones visuales e instrucciones de tarea (propio de la familia π0.5).
- *State grounding*: estimación de coordenadas xyz y apertura de pinza normalizadas a partir de la observación.
- Adaptación en *test time* mediante *latent prompt* de 16 tokens (según la formulación TTT-VLA del repositorio de origen).
- Evaluación bajo *shifts* controlados de vista (escala) y rotación yaw.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo ni modos de razonamiento explícito.

## Casos de uso

- Investigación en adaptación de VLA a cambios de cámara: usar el checkpoint como línea base TTT-VLA y reproducir las tasas de éxito publicadas bajo los *shifts* `view_small`, `view_medium`, `view_large`, `yaw10`, `yaw20` y `yaw30`.
- Estudio de *state grounding* en robótica: analizar cómo el experto de flow matching y el *latent prompt* afectan a la estimación de pose de efector y pinza en tareas LIBERO.
- Reproducción de experimentos: cargar `sg_lp.npz` con el runtime `84a1f92b` y ejecutar el plan de entradas incluido en `run/` para validar la auditoría de arrays.
- Comparación de estrategias de adaptación: contrastar este *source* con variantes *prompt-only* (1.000 actualizaciones, batch 128, LR 1e-5) para medir la contribución del *state grounding*.
- Análisis de robustez ante rotaciones: emplear las métricas yaw10/20/30 como referencia para estudiar la degradación de políticas VLA con cambios de orientación.
- Docencia y divulgación técnica: ilustrar un pipeline completo de *test-time training* sobre π0.5 con datasets auxiliares y métricas por escenario.

## Benchmarks y rendimiento

Resultados publicados en la model card para los objetivos *prompt-only* originales (1.000 actualizaciones, batch 128, LR 1e-5; 2.000 episodios LIBERO por escenario, semilla de entorno 7):

| Shift | Éxito |
|---|---|
| view_small | 1400/2000 = 70,00% |
| view_medium | 827/2000 = 41,35% |
| view_large | 156/2000 = 7,80% |
| yaw10 | 1471/2000 = 73,55% |
| yaw20 | 771/2000 = 38,55% |
| yaw30 | 348/2000 = 17,40% |

No se han publicado en la información disponible resultados de benchmarks estándar de NLP (MMLU, HumanEval, GSM8K) ni comparativas con otros VLA.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 13,8 GB y los pesos se distribuyen como 71 tensores FP32 en `sg_lp.npz`, pero no se especifica el tamaño total del modelo base π0.5 ni su huella en memoria.
- GPU recomendadas: no disponible. El entrenamiento se realizó con FSDP sobre 4 dispositivos en un nodo `kn_b200` (GPU Blackwell B200), lo que sugiere requisitos de gama alta para entrenamiento, no necesariamente para inferencia.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga mediante `baselines.ttt_vla.checkpoints.load` del repositorio `Donghyun1228/vla_adaptation` en el runtime `84a1f92b`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| π0.5 LIBERO TTT-VLA source (este) | no disponible | no disponible | apache-2.0 | Hugging Face, 0 descargas |
| π0.5 (openpi) | no disponible | no disponible | no disponible en la información | Repositorio openpi |
| Variante *prompt-only* TTT-VLA | no disponible | no disponible | no disponible | Mismo autor, métricas en la model card |

No se dispone de datos suficientes para comparar parámetros, contexto o rendimiento con alternativas de la misma categoría (VLA para manipulación). La comparativa se limita a la disponibilidad y licencia.

## Limitaciones y advertencias

- Artefacto de investigación de un autor individual, sin descargas ni validación externa; no debe tratarse como modelo listo para producción.
- Los pesos no están en formato estándar (safetensors/GGUF); requieren el runtime y commit concretos (`84a1f92b`), lo que limita la portabilidad.
- El checkpoint se ha entrenado específicamente para LIBERO y *random probes* del autor; su generalización a otros entornos o robots no está documentada.
- Las métricas publicadas corresponden a los objetivos *prompt-only* originales, no al *source* de 20.000 actualizaciones; no se ofrecen resultados de éxito para este checkpoint concreto.
- Riesgo de sobreajuste a los *shifts* evaluados (escala de vista y yaw); no se documentan otros tipos de *shift* (iluminación, oclusión, fondo).
- No se documentan sesgos, comportamiento multilingüe ni riesgos de alucinación textual, al ser un modelo de acción y no de generación de lenguaje.
- Licencia apache-2.0 permite uso comercial, pero el modelo base π0.5 y los datasets auxiliares pueden tener condiciones propias no detalladas aquí.
- El nombre del repositorio incluye una fecha futura (20261021) y la fecha de creación es 2026-11-05, lo que conviene verificar antes de citarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-ttt-vla-random-probe-source-n50k-20000-20261021
- Repositorio de código de referencia: `Donghyun1228/vla_adaptation` (ruta `baselines/ttt_vla`, runtime `84a1f92b`)
- Dataset de *random probes*: `Donghyun1228/libero-support-random-waypoint-300k-20261015` (commit `32ed215b`)
- Openpi (π0.5): no disponible en la información proporcionada
- Paper o blog del método TTT-VLA: no disponible en la información proporcionada
