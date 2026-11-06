# Donghyun1228/pi05-libero-pad-vision-head-yaw10-1000-20261105

## Resumen

π0.5 LIBERO yaw10 PAD es un checkpoint de investigación para robótica manipulativa derivado de π0.5 (pi05), el modelo visión-lenguaje-acción (VLA) de Physical Intelligence, adaptado mediante la técnica PAD (adaptación de dominio con pérdida IDM) sobre el benchmark LIBERO. Lo publica el usuario Donghyun1228 como parte del repositorio de código `vla_adaptation`, y corresponde a la fila PAD de la tabla LIBERO descrita en un artículo académico. No es un modelo de propósito general: es un artefacto de evaluación que demuestra cómo adaptar únicamente el codificador visual de un VLA preentrenado sin tocar el LLM ni el experto de acciones.

El checkpoint parte de una inicialización previa (`pi05-libero-pad-vision-head-source-n50k-10000`, paso 9999) y aplica 1.000 actualizaciones de AdamW con una pérdida de modelado inverso de dinámica (IDM) restringida al codificador visual PaliGemma/img, usando una sonda de soporte yaw10 con 50.000 muestras. La política exportada elimina la cabeza IDM y conserva la torre visual adaptada, alcanzando un 87,10% de éxito en LIBERO (1742/2000 episodios, 500 por suite, semilla de entorno 7, evaluador congelado kn_b200, MuJoCo 3.2.3).

Su relevancia es metodológica: muestra que una adaptación ligera y dirigida del encoder visual basta para obtener un rendimiento competitivo en tareas de manipulación con instrucciones en lenguaje, y ofrece un punto de comparación reproducible para quienes investigan transferencia de VLA en robótica. El repositorio ocupa 15,6 GB, coherente con los pesos completos de π0.5 en precisión de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 (transformer visión-lenguaje-acción con codificador visual PaliGemma/img, LLM y experto de acciones) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (las instrucciones de LIBERO son en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | no especificado en la model card; el repo contiene `params`, `train_state` y `assets` (normalización) en `999/`, y una política exportada en `policy/` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura π0.5 de Physical Intelligence: un VLA que combina un codificador visual PaliGemma, un LLM y un experto de acciones para generar comandos motores a partir de observaciones e instrucciones en lenguaje. En este checkpoint solo se adapta el codificador visual (`PaliGemma/img`) mediante una pérdida IDM sobre la sonda de soporte yaw10 con n=50.000; el LLM, el experto de acciones y la cabeza IDM permanecen congelados en el estado de origen. El índice de pinza (6) se excluye de la pérdida IDM.

El entrenamiento usa AdamW con LR pico de 5e-5 (500 pasos de warmup y luego constante), batch de 32, 1.000 actualizaciones y semilla 42. La inicialización es el paso 9999 del checkpoint `pi05-libero-pad-vision-head-source-n50k-10000-20261104`. La evaluación se realiza con la política del paso 999 sin la cabeza IDM, usando la torre visual adaptada según `export.json`, con 500 episodios por suite de LIBERO, semilla de entorno 7, evaluador congelado kn_b200 y MuJoCo 3.2.3.

## Capacidades

- Control robótico manipulativo guiado por instrucciones en lenguaje en las suites de LIBERO.
- Percepción visual mediante el codificador PaliGemma adaptado, incluyendo la cámara de muñeca.
- Generación de acciones continuas a través del experto de acciones de π0.5.
- Adaptación de dominio mediante pérdida IDM sobre el encoder visual (metodología PAD).
- Evaluación reproducible con política exportada sin cabeza IDM.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, matemáticas, código ni multilingüismo.

## Casos de uso

- Investigación en transferencia de VLA: reproducir la fila PAD de la tabla LIBERO y comparar con otras estrategias de adaptación (full fine-tuning, LoRA, congelación total) usando el mismo evaluador congelado y la misma semilla.
- Evaluación estandarizada en robótica: servir como política de referencia para medir éxito en las suites de LIBERO con 500 episodios por suite y MuJoCo 3.2.3.
- Estudio de adaptación del encoder visual: analizar cuánto rendimiento se obtiene adaptando solo `PaliGemma/img` con pérdida IDM frente a adaptar el LLM o el experto de acciones.
- Ablación de hiperparámetros: variar LR pico (5e-5), warmup (500), batch (32) o número de actualizaciones (1.000) y medir el impacto en la tasa de éxito.
- Base para adaptaciones posteriores: partir de este checkpoint para experimentos con nuevas sondas de soporte o dominios distintos de yaw10.
- Docencia y divulgación: ilustrar un pipeline completo de adaptación y evaluación de un VLA en un benchmark abierto con licencia Apache 2.0.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado |
|---|---|---|
| LIBERO (global, 4 suites) | Tasa de éxito | 1742/2000 = 87,10% |
| LIBERO (por suite) | Tasa de éxito | 500 episodios por suite; desglose en `run/evaluation_audit.json` (no incluido en la información disponible) |

Condiciones de evaluación: semilla de entorno 7, evaluador congelado kn_b200, MuJoCo 3.2.3, política del paso 999 sin cabeza IDM. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 15,6 GB, lo que da una cota inferior del espacio en disco necesario para los pesos; la VRAM dependerá de la precisión y del backend.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? No disponible; sin datos de cuantización ni de precisión de inferencia no puede confirmarse.
- Opciones de despliegue: el ecosistema de referencia es `openpi` (etiqueta del modelo); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para políticas VLA de robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento LIBERO | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 LIBERO yaw10 PAD (este) | no disponible | no disponible | 87,10% (1742/2000) | Apache 2.0 | Hugging Face |
| π0.5 base (Physical Intelligence) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Otras filas de la tabla LIBERO del artículo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Checkpoint de investigación: no está pensado para despliegue en producción ni para robótica real fuera de LIBERO.
- Especializado en el benchmark LIBERO y en la sonda yaw10; la generalización a otros dominios, robots o tareas no está documentada.
- La adaptación se limita al codificador visual; el LLM y el experto de acciones conservan el estado de origen, lo que puede limitar la adaptación a distribuciones muy distintas.
- Sin datos publicados sobre sesgos, alucinación o robustez fuera de las condiciones de evaluación descritas.
- Idiomas: la información disponible no documenta soporte multilingüe; las instrucciones de LIBERO son en inglés.
- Licencia Apache 2.0 permite uso comercial, pero el modelo depende de π0.5 y PaliGemma; conviene verificar las licencias de los componentes upstream antes de un uso comercial.
- Los resultados (87,10%) están ligados a condiciones concretas (semilla 7, evaluador kn_b200, MuJoCo 3.2.3); no son directamente comparables con evaluaciones que usen otra configuración.
- Repositorio de 15,6 GB: requiere espacio en disco y ancho de banda considerables para descarga y almacenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-pad-vision-head-yaw10-1000-20261105
- Checkpoint de inicialización: https://huggingface.co/Donghyun1228/pi05-libero-pad-vision-head-source-n50k-10000-20261104
- Repositorio de código citado: `Donghyun1228/vla_adaptation` (commit `7b74d01d`), preset `pi05_libero_pad_img_yaw_adapt`
- OpenPI (ecosistema de referencia): no disponible en la información proporcionada
- Artículo y demos: no disponibles en la información proporcionada
