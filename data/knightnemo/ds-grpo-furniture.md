# knightnemo/DS-GRPO-Furniture

## Resumen

DS-GRPO-Furniture es una colección de checkpoints de política de difusión (diffusion policy) entrenados mediante DS-GRPO (Direct Steering GRPO) sobre políticas de difusión congeladas para tareas de ensamblaje robótico en el entorno FurnitureBench. Lo desarrolla el usuario knightnemo, y el código subyacente corresponde al repositorio DS-GRPO de Qingxin-Wang. El modelo no es un LLM: es un actor de control robótico que consume observaciones normalizadas de 44 dimensiones y produce ruido de 80 dimensiones para guiar el muestreo DDIM de una política base congelada.

La relevancia radica en que aplica aprendizaje por refuerzo (GRPO) en el espacio de ruido de un sampler de difusión, sin reentrenar la política base. Los checkpoints publicados cubren dos tareas de FurnitureBench (lamp y round_table) con tres semillas de entrenamiento cada una (42, 43, 44), lo que permite reproducir los resultados del artículo con desviaciones estándar acotadas.

El repositorio ocupa aproximadamente 0,2 GB (unos 35 MB por checkpoint) y se distribuye bajo licencia MIT. Cada checkpoint se guarda tras 10.048.000 pasos de entorno. No se dispone de información sobre idiomas ni de parámetros tipo transformer, al tratarse de un modelo de control.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Steering en espacio de ruido sobre política de difusión congelada (DDIM, 100 pasos) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observación de 44 dimensiones normalizadas |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de control robótico) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`steering.pt`), con `config.yaml` y `training_config.yaml` |
| Dimension de accion | 8 chunks de accion, acciones de 10 dimensiones |
| Salida | Ruido de 80 dimensiones |
| Pasos de entrenamiento | 10.048.000 pasos de entorno por checkpoint |
| Semillas publicadas | 42, 43, 44 (lamp y round_table) |

## Arquitectura y entrenamiento

La arquitectura no es un transformer generativo, sino un actor de steering que opera sobre una política de difusión congelada. La política base (DPPO) usa un sampler DDIM de 100 pasos y produce chunks de 8 acciones de 10 dimensiones. El actor de steering consume observaciones normalizadas de 44 dimensiones y genera ruido de 80 dimensiones que modifica el proceso de muestreo. La arquitectura concreta del actor se define en el `config.yaml` de cada checkpoint y se carga mediante `load_state_actor`.

El entrenamiento emplea DS-GRPO, una variante de GRPO aplicada en el espacio de ruido, con recompensa basada en éxito de ensamblaje. Cada checkpoint se guarda tras superar el presupuesto de 10 millones de pasos de entorno (10.048.000 pasos efectivos). La evaluación usa 512 episodios por semilla, baja aleatoriedad de entorno y semilla de evaluación 10007, muestreando ruido de steering de la gaussiana aprendida. Los resultados agregados coinciden con la Tabla 3 del artículo de DS-GRPO. No se especifica en la información disponible el número de tokens ni la composición del dataset de demostraciones, aunque se indica que las políticas profesor y las demostraciones de entrenamiento no son necesarias para inferencia.

## Capacidades

- Control robótico de ensamblaje para dos tareas concretas: lámpara (lamp) y mesa redonda (round_table) en FurnitureBench.
- Generación de ruido de steering para guiar un sampler DDIM de 100 pasos sobre una política de difusión congelada.
- Producción de chunks de 8 acciones de 10 dimensiones a partir de observaciones normalizadas de 44 dimensiones.
- Inferencia standalone mediante API Python (`load_state_actor` y `actor.predict`) o mediante script de evaluación CLI.
- Reproducibilidad por semilla: tres checkpoints por tarea con resultados documentados.
- No soporta tool calling, agentes, multilingüismo ni generación de texto; no es un modelo de lenguaje.

## Casos de uso

- Reproducción de resultados de investigación: evaluar los checkpoints con el script `evaluate_furniture.sh` y 512 episodios para verificar las tasas de éxito publicadas (61,9% en lamp, 74,4% en round_table).
- Comparación de métodos de RL sobre políticas de difusión: usar los tres seeds por tarea para medir varianza entre entrenamientos y comparar con otras variantes de GRPO o PPO.
- Baseline para nuevas tareas de FurnitureBench: emplear la receta Hydra y el flujo de entrenamiento DS-GRPO como punto de partida para tareas adicionales del benchmark.
- Integración en pipelines de simulación con Isaac Gym: cargar el actor con `load_state_actor` y ejecutar `predict` sobre lotes de observaciones normalizadas en un bucle de control.
- Estudio de robustez ante aleatoriedad de entorno: la configuración permite ajustar `env.n_eval_envs` y `evaluation.deterministic` para analizar sensibilidad.
- Docencia y divulgación: ejemplo compacto (35 MB por checkpoint) de RL en espacio de ruido sobre modelos de difusión, ejecutable en GPU Ampere.

## Benchmarks y rendimiento

Tasas de éxito de las evaluaciones finales originales, 512 episodios por semilla, baja aleatoriedad de entorno, semilla de evaluación 10007:

| Tarea | Seed 42 | Seed 43 | Seed 44 | Media ± desv. típ. |
|---|---|---|---|---|
| lamp | 61,52344% | 60,93750% | 63,28125% | 61,9 ± 1,0% |
| round_table | 80,66406% | 71,48438% | 71,09375% | 74,4 ± 4,4% |

La desviación estándar agregada es poblacional sobre las tres semillas de entrenamiento y coincide con la Tabla 3 del artículo de DS-GRPO. No se han publicado en la información disponible resultados comparativos con otros modelos en esta ficha.

## Requisitos de hardware

- GPU Ampere recomendada: A100, A800 o A6000 (los runs originales usaron A800).
- Entorno de simulación: Isaac Gym Preview 4 y Python 3.8 (los runs originales usaron Python 3.8.20).
- VRAM estimada: no disponible en la información proporcionada; los checkpoints son pequeños (unos 35 MB), por lo que el cuello de botella es el simulador, no los pesos.
- No cabe plantear despliegue en consumer GPU sin verificar compatibilidad de Isaac Gym; no se documenta soporte para RTX 4090 u otras consumer.
- Opciones de despliegue: script `scripts/evaluate_furniture.sh` del repositorio DS-GRPO y API Python (`ds_grpo.inference.load_state_actor`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican).
- Latencia y throughput: no disponibles; dependen del simulador y de `env.n_eval_envs` (64 en los ejemplos).

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otras políticas de difusión o métodos de RL sobre FurnitureBench más allá de la referencia a la Tabla 3 del artículo DS-GRPO.

## Limitaciones y advertencias

- Ámbito muy restringido: solo dos tareas (lamp y round_table) de FurnitureBench; no generaliza a otras tareas sin reentrenamiento.
- No es un modelo de lenguaje: no admite prompts de texto, tool calling ni razonamiento multi-paso.
- Requiere la política base DPPO congelada y los ficheros de normalización de las colecciones de Google Drive indicadas; sin ellos el checkpoint no es funcional.
- Dependencia de Isaac Gym Preview 4 y GPU Ampere; la instalación es compleja y no se documenta soporte en otras plataformas.
- Varianza entre semillas notable en round_table (71,1%–80,7%), lo que aconseja reportar medias y desviaciones, no un único resultado.
- Las evaluaciones originales se ejecutaron al final del entrenamiento; las evaluaciones standalone generan sus propios ficheros y pueden diferir ligeramente.
- Licencia MIT para los checkpoints, pero los modelos base congelados y los assets del simulador conservan sus licencias upstream; verificar antes de uso comercial.
- Riesgo de sobreajuste a la configuración de evaluación (baja aleatoriedad de entorno, semilla 10007); el rendimiento en entornos reales no está documentado.
- No se dispone de información sobre sesgos, alucinación ni comportamiento fuera de distribución más allá de lo indicado.

## Enlaces

- HuggingFace: https://huggingface.co/knightnemo/DS-GRPO-Furniture
- Código y instalación DS-GRPO: https://github.com/Qingxin-Wang/DS-GRPO
- Guía de instalación FurnitureBench: https://github.com/Qingxin-Wang/DS-GRPO/blob/main/docs/installation.md#furniturebench
- Colección de checkpoints DPPO: https://drive.google.com/drive/folders/1ZlFqmhxC4S8Xh1pzZ-fXYzS5-P8sfpiP
- Colección de preprocesado DPPO: https://drive.google.com/drive/folders/1AXZvNQEKOrp0_jk1VLepKh_oHCg_9e3r
