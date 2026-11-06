# niwniwniw/smolvla_ours

## Resumen

smolvla_ours es un modelo de visión-lenguaje-acción (VLA) para robótica, desarrollado por el usuario niwniwniw a partir de un ajuste fino completo de lerobot/smolvla_base. Resuelve el problema de disponer de una política de control robótico reproducible y entrenada sobre un benchmark estandarizado (LIBERO), sirviendo como línea base para experimentos de post-entrenamiento en el espacio de ruido de modelos VLA con flow matching.

El modelo parte del backbone SmolVLM2-500M (16 capas de VLM) y se ha ajustado sobre las cuatro suites estándar de LIBERO (Spatial, Object, Goal y 10), con 40 tareas, 1.693 episodios y 273.465 fotogramas. Con 450 millones de parámetros, está diseñado para ejecutarse en hardware modesto y para iterar rápidamente en investigación de robótica.

Es relevante ahora porque el ecosistema LeRobot está consolidando los VLA de código abierto como alternativa práctica a los modelos propietarios, y este checkpoint ofrece una receta de entrenamiento documentada y verificable (25.000 pasos, TPU v5e, semilla fija) que otros equipos pueden reproducir o usar como punto de partida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en transformer (SmolVLM2-500M, 16 capas de VLM) con cabeza de acciones y flow matching |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea son en inglés en LIBERO) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

El modelo es un VLA que combina un backbone de visión-lenguaje SmolVLM2-500M con 16 capas de VLM y una política de acciones basada en flow matching. Recibe dos cámaras de 256×256 píxeles, un vector de estado de 8 dimensiones y una instrucción de tarea en lenguaje natural, y produce acciones de 7 dimensiones. La generación de acciones usa chunks de 50 pasos con 10 pasos de integración de flow matching.

El ajuste fino se realizó sobre lerobot/smolvla_base sin congelar el codificador visual y sin LoRA (todos los parámetros entrenables), durante 25.000 pasos con AdamW (lr 1e-4, betas 0.9/0.95, weight decay 1e-10, grad clip 10), 1.000 pasos de warmup y decaimiento coseno hasta 2.5e-6. El batch efectivo fue de 32 (2 por dispositivo × 4 dispositivos × acumulación 4), con semilla 1000, sobre 4 chips de Cloud TPU v5e a unos 2 segundos por paso. Los datos provienen de HuggingFaceVLA/libero: 40 tareas, 1.693 episodios y 273.465 fotogramas. No se menciona uso de RLHF ni DPO.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones de 7 dimensiones a partir de observaciones visuales y estado proprioceptivo.
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica como texto y el modelo la ejecuta.
- Percepción visual multi-cámara: procesa dos vistas de 256×256 simultáneamente.
- Manipulación de objetos y navegación guiada por metas en entornos simulados tipo LIBERO.
- Ejecución de políticas con chunking de acciones (50 pasos por chunk, 10 de integración).
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No se documentan capacidades de tool calling, agentes multi-paso, matemáticas ni generación de texto general.

## Casos de uso

- Investigación en post-entrenamiento de VLA: sirve como línea base reproducible para experimentos de ajuste en el espacio de ruido de flow matching, con configuración y semilla documentadas.
- Evaluación comparativa en LIBERO: permite medir el impacto de nuevas técnicas de entrenamiento contra un checkpoint con receta conocida (80,5 % en LIBERO-Spatial).
- Prototipado de políticas de manipulación: equipos que quieran validar rápidamente una arquitectura VLA en simulación antes de pasar a un robot real.
- Docencia y formación: su tamaño de 450 M de parámetros y su licencia Apache 2.0 lo hacen accesible para cursos de robótica e IA.
- Desarrollo de pipelines de datos: el modelo puede usarse para generar trayectorias de referencia y comparar distribuciones de acciones entre checkpoints.
- Pruebas de generalización zero-shot: el protocolo Unseen-10 documentado (1,0 % de éxito) sirve para estudiar el olvido y la transferencia en VLA pequeños.
- Integración en LeRobot: despliegue mediante `SmolVLAPolicy.from_pretrained` para experimentos de inferencia en bucle cerrado.

## Benchmarks y rendimiento

| Conjunto de tareas | Éxito |
|---|---|
| LIBERO-Spatial | 161 / 200 = 80,5 % |
| Unseen-10 (10 tareas de LIBERO-90 no vistas: 4, 17, 32, 35, 42, 56, 63, 84, 87, 89) | 2 / 200 = 1,0 % |

Protocolo: 10 tareas × 20 episodios (estados iniciales 0–19), 10 pasos de flow matching, ejecución de las 10 primeras acciones de cada chunk de 50 antes de replanificar, ruido inicial N(0, I). Las suites LIBERO-Object, -Goal y -10 no se evaluaron con este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parámetros en fp32 serían unos 1,8 GB de pesos, más activaciones y buffers de flow matching.
- GPU recomendadas: no disponible; el entrenamiento se realizó en Cloud TPU v5e (4 chips).
- Compatibilidad con GPU de consumo: muy probable en tarjetas con 8 GB o más, dado el tamaño del modelo, aunque no hay validación publicada.
- Opciones de despliegue: librería `lerobot` (`SmolVLAPolicy.from_pretrained`); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_ours | 450 M | no disponible | 80,5 % en LIBERO-Spatial; 1,0 % en Unseen-10 | Apache 2.0 | Hugging Face (lerobot) |
| lerobot/smolvla_base | 450 M (SmolVLM2-500M) | no disponible | no disponible | Apache 2.0 | Hugging Face (lerobot) |
| lerobot/smolvla_libero | no disponible | no disponible | no disponible | no disponible | Hugging Face (lerobot) |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Generalización zero-shot muy limitada: 1,0 % de éxito en tareas no vistas (Unseen-10), lo que indica dependencia fuerte de la distribución de entrenamiento.
- Solo se ha evaluado en LIBERO-Spatial; no hay resultados publicados para LIBERO-Object, -Goal ni -10 con este checkpoint.
- Entrenado exclusivamente en simulación (LIBERO); no hay evidencia de transferencia a robots reales.
- Las instrucciones de tarea están en inglés; no se documenta soporte multilingüe.
- Riesgo de sobreajuste a las posiciones y objetos de las demostraciones de LIBERO.
- Sin datos publicados sobre sesgos, alucinación o robustez ante perturbaciones visuales.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de validación fuera de simulación desaconseja su uso directo en producción sin evaluación adicional.
- No se documentan cuantizaciones ni optimizaciones de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/niwniwniw/smolvla_ours
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Checkpoint de referencia: https://huggingface.co/lerobot/smolvla_libero
- Dataset: https://huggingface.co/datasets/HuggingFaceVLA/libero
