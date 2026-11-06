# DecentVLA/droidfull8_pi05_cent

## Resumen

droidfull8 π0.5 es un checkpoint de robótica basado en la arquitectura π0.5 de openpi (Physical Intelligence), publicado por el colectivo DecentVLA. Se trata del control centralizado ("centralised control") de referencia para una serie de experimentos de aprendizaje federado sobre el conjunto de datos DROID. El modelo realiza un ajuste fino completo (full fine-tune) desde `pi05_base` siguiendo la receta oficial de openpi para DROID completo, y su función es servir como línea base contra la que se comparan las variantes federadas FedAvg y ACCORD-C del mismo colectivo.

El modelo se entrena con el release RLDS `droid/1.0.1` (episodios exitosos, filtro de frames inactivos de openpi): 78.864 episodios y 22,13 millones de frames. Predice acciones de posición articular (joint-position) en fragmentos de 16 pasos, lo que lo hace directamente desplegable sobre un robot DROID real o en el simulador RoboLab.

Su relevancia es metodológica: al compartir ruta de datos, estadísticas de normalización, optimizador, EMA y formato de checkpoint con las variantes federadas, permite aislar el efecto de la agregación federada frente al entrenamiento centralizado. La licencia Apache 2.0 y el formato de checkpoint oficial de openpi facilitan su reproducción y despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π0.5 (openpi, JAX); no se detalla la topología interna en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (observaciones de robot; acciones en chunks de 16 pasos) |
| Tipos de cuantizacion | no disponible (checkpoint en formato nativo openpi/JAX) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje conversacional) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint openpi (directorio `params/` con pesos EMA + `assets/droid/norm_stats.json`); además `server_round_0400.pt` en formato decent-vla |

## Arquitectura y entrenamiento

El modelo es un π0.5 oficial de openpi implementado en JAX, con ajuste fino completo desde `pi05_base` aplicando la receta publicada por openpi para el dataset DROID completo. La salida son acciones de posición articular en chunks de 16 pasos. No se especifica en la información disponible el número de parámetros ni detalles internos de la arquitectura más allá de su pertenencia a la familia π0.5.

El entrenamiento usa el release RLDS `droid/1.0.1` con episodios exitosos y el filtro de frames inactivos de openpi: 78.864 episodios y 22,13 millones de frames, leídos mediante el pipeline RLDS de openpi con un buffer de barajado de 250.000 frames. El optimizador es AdamW con lr 5e-5 (1.000 pasos de warmup y luego constante), clipping 1.0 y EMA 0.99, durante 100.000 pasos con batch 256 (25,6 millones de muestras), en paralelismo de datos sobre 8 GPUs. Las estadísticas de normalización son las de posición articular de `pi05_droid_jointpos` (reproducibles desde los datos públicos con ~1 % de error). Se incluyen checkpoints intermedios en los pasos 50k (`openpi_r200/`) y 80k (`openpi_r320/`). El checkpoint oficial π0.5-DROID de openpi se cita solo como referencia, ya que su receta no está publicada.

## Capacidades

- Control robótico de manipulación: genera acciones de posición articular para robots tipo DROID a partir de observaciones.
- Predicción de acciones en chunks de 16 pasos, adecuada para control a frecuencia de política.
- Despliegue mediante servidor de políticas de openpi (`scripts/serve_policy.py`) con configuración `pi05_droid_jointpos`.
- Evaluación en simulador RoboLab mediante el fork de openpi de xuningy.
- Evaluación en robot DROID real.
- Punto de referencia centralizado para comparación con variantes federadas (FedAvg, ACCORD-C).
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión general o audio; es un modelo específico de robótica.

## Casos de uso

- Línea base de investigación federada: usar este checkpoint como control centralizado para medir la pérdida de rendimiento de los métodos FedAvg y ACCORD-C sobre el mismo dataset y receta.
- Evaluación en simulación con RoboLab: desplegar el servidor openpi y ejecutar `policies/pi0_family/run.py` para obtener métricas reproducibles de manipulación antes de pasar a hardware.
- Despliegue en robot DROID real: servir el checkpoint con openpi y conectar el robot para tareas de manipulación aprendidas del dataset DROID.
- Reproducción de experimentos: al compartir ruta de datos, normalización y optimizador con las variantes federadas, permite replicar resultados y auditar diferencias de agregación.
- Estudio de recetas de ajuste fino: comparar los checkpoints intermedios a 50k y 80k pasos (`openpi_r200/`, `openpi_r320/`) para analizar la evolución del rendimiento durante el entrenamiento.
- Integración en pipelines de investigación con JAX/openpi: reutilizar el formato de checkpoint oficial para experimentos posteriores o para inicializar otros ajustes finos sobre DROID.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Entrenamiento realizado en 8 GPUs con paralelismo de datos (modelo no especificado); no se detalla el modelo de GPU.
- VRAM de inferencia: no disponible; el número de parámetros no se publica en la información proporcionada.
- El servidor de políticas de openpi se lanza con `XLA_PYTHON_CLIENT_MEM_FRACTION=0.5`, lo que sugiere reservar al menos la mitad de la memoria de la GPU para el proceso.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: servidor oficial de openpi (`scripts/serve_policy.py`), fork de openpi de xuningy para RoboLab; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Dataset | Receta | Agregación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| droidfull8 π0.5 cent (este) | DROID 1.0.1 completo (78.864 episodios, 22,13 M frames) | Full fine-tune desde `pi05_base`, 100k pasos, batch 256 | Centralizada | Apache 2.0 | Hugging Face (DecentVLA) |
| droidfull8 FedAvg | Mismo dataset y receta | Idéntica | Federada (FedAvg) | Apache 2.0 | Hugging Face (DecentVLA) |
| droidfull8 ACCORD-C | Mismo dataset y receta | Idéntica | Federada (ACCORD-C, co-training w010 expert) | Apache 2.0 | Hugging Face (DecentVLA) |
| π0.5-DROID joint-position oficial (openpi) | DROID | No publicada | Centralizada | No disponible en la información | Referencia en `gs://openpi-assets-simeval/pi05_droid_jointpos` |

## Limitaciones y advertencias

- Modelo específico de robótica: no es un modelo de lenguaje general ni admite tool calling, agentes conversacionales o tareas multimodales fuera del control de manipulación.
- Restringido al dominio DROID: el rendimiento fuera de la morfología y el entorno de DROID no está documentado.
- Sesgos: no se documentan análisis de sesgos; el dataset DROID puede reflejar sesgos de las demostraciones humanas y de las condiciones de recogida.
- Riesgo de alucinación de acciones: como política de control, puede generar trayectorias incorrectas o inseguras; requiere supervisión y límites de seguridad en hardware real.
- Idiomas y contexto: no aplicables o no disponibles; no se documentan límites de ventana en el sentido de LLM.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrecen garantías ni evaluaciones de seguridad para producción.
- El checkpoint se distribuye como pull request en el repositorio; hasta su fusión, la disponibilidad de los ficheros puede requerir revisar la sección de pull requests.
- Los checkpoints intermedios (50k y 80k pasos) pueden tener rendimiento inferior al final; no se publican métricas comparativas.

## Enlaces

- Hugging Face: https://huggingface.co/DecentVLA/droidfull8_pi05_cent
- Variante FedAvg: https://huggingface.co/DecentVLA/droidfull8_pi05_fedavg
- Variante ACCORD-C: https://huggingface.co/DecentVLA/droidfull8_pi05_accord_cotrain_w010_expert
- openpi (Physical Intelligence): no disponible en la información proporcionada
- RoboLab (NVLabs): no disponible en la información proporcionada
- Fork de openpi para RoboLab (xuningy/openpi): no disponible en la información proporcionada
- Runbook decent-vla `examples/droid/README_droidfull8.md` (tag `droidfull8-v4`): no disponible en la información proporcionada
