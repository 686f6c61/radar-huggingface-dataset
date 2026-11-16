# pokeandwiggle/groot-n2-clean-up-lego-fast-sim

## Resumen

`pokeandwiggle/groot-n2-clean-up-lego-fast-sim` es un checkpoint de robótica basado en la familia GR00T N2 de NVIDIA, publicado por el usuario independiente `pokeandwiggle`. Se distribuye como un modelo de política visuomotora (visuomotor policy) para control de robots, orientado a la tarea concreta de recoger piezas de Lego en un entorno simulado ("clean up lego fast sim"). No es un modelo de lenguaje: es un modelo de acción que mapea observaciones (imágenes y estado del robot) a comandos motores.

El modelo tiene 2.882.776.872 parámetros en formato safetensors y ocupa 5,8 GB en el repositorio. La arquitectura subyacente es GR00T N2 (NVIDIA Isaac GR00T), un modelo fundacional para robots humanoides y brazos manipuladores, aunque esta ficha solo puede describir lo que consta en la información disponible del repositorio, que es escasa más allá de los metadatos.

Es relevante ahora porque los modelos fundacionales de robótica están pasando de investigación a despliegue, y los checkpoints ajustados para tareas concretas (fine-tunes) son el vehículo práctico para llevar estas políticas a simuladores y bancos de pruebas. La licencia restrictiva de NVIDIA y el acceso gated condicionan su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GR00T N2 (familia Isaac GR00T de NVIDIA); detalles internos no disponibles |
| Parámetros totales | 2.882.776.872 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (modelo de política robótica, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | nvidia-software-and-model-evaluation-license (etiqueta `license:other`) |
| Formato de pesos | safetensors |
| Pipeline | robotics |
| Tamaño del repositorio | 5,8 GB |
| Acceso | restringido (gated), requiere aceptar condiciones en Hugging Face |
| Región declarada | eu |

## Arquitectura y entrenamiento

La información disponible identifica el modelo como un checkpoint GR00T N2, la segunda generación de la familia de modelos fundacionales de robótica de NVIDIA. Por los tags (`gr00t`, `gr00t-n2`, `robotics`, `GrootN2`) y el pipeline `robotics`, se trata de una política visuomotora entrenada para producir acciones de robot a partir de observaciones. No consta en la información proporcionada el detalle de la arquitectura interna (composición de encoders visuales, transformer de acciones, mecanismo de difusión o regresión de acciones), ni el número de tokens de entrenamiento, ni la composición del dataset.

El sufijo del nombre (`clean-up-lego-fast-sim`) y el tag `poke-and-wiggle` sugieren un ajuste fino sobre GR00T N2 para una tarea de manipulación de piezas de Lego en simulación, probablemente dentro de un entorno tipo Isaac Sim o similar. No se dispone de información sobre si el ajuste empleó demostraciones teleoperadas, refuerzo o imitación, ni sobre el número de episodios utilizados.

## Capacidades

- Generación de acciones motrices para control de robot a partir de observaciones sensoriales (visión y, presumiblemente, estado de articulaciones), en el marco de la familia GR00T N2.
- Ejecución de una tarea de manipulación específica: recogida y ordenación de piezas de Lego en simulación.
- Capacidad de operar como política de imitación entrenada para una tarea concreta (fine-tune), no como modelo generalista.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible como tal; la política produce secuencias de acción, no razonamiento simbólico.
- Capacidades multilingües: no aplica / no disponible.
- Capacidades especiales (thinking mode, visión, audio): visión presumiblemente sí por la naturaleza del pipeline robótico, aunque no se detalla en la información disponible.

## Casos de uso

- Evaluación de políticas de manipulación en simulación: el checkpoint sirve para reproducir y medir el rendimiento de una política GR00T N2 ajustada a la tarea "clean up lego" en un simulador, comparando variantes de entrenamiento.
- Investigación en imitación visuomotora: útil como punto de partida para estudiar cómo se transfiere un modelo fundacional de robótica a una tarea de manipulación de objetos pequeños y rígidos.
- Benchmarking de pipelines de robótica: al ser un fine-tune concreto, permite validar infraestructura de inferencia (carga de safetensors, integración con Isaac Lab o stacks similares) antes de escalar a otros checkpoints.
- Desarrollo de habilidades de pick-and-place: la tarea de recoger piezas de Lego es un proxy de manipulación de precisión; el modelo puede emplearse para probar controladores y percepción en ese régimen.
- Docencia y formación: escenario controlado y reproducible para enseñar ajuste fino de modelos fundacionales de robótica y evaluación en simulación.
- Pruebas de sim-to-real preliminares: aunque el checkpoint está entrenado en simulación, puede servir como base para estudiar la brecha sim-to-real en tareas de manipulación de objetos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2.882.776.872 parámetros, en precisión completa (fp32) se requieren aproximadamente 11,5 GB solo para pesos; en fp16/bf16, unos 5,8 GB; en int8, unos 2,9 GB. Estas cifras son estimaciones a partir del recuento de parámetros, no datos publicados.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, una GPU con 16 GB o más (RTX 4090, A100, H100) permitiría cargar el modelo en bf16 con margen para activaciones y buffers de inferencia.
- ¿Cabe en consumer GPU? Probablemente sí en bf16 en GPUs de 16 GB o más (RTX 4090, RTX 4080, etc.), sujeto a los requisitos reales del stack GR00T, que no constan.
- Opciones de despliegue: no disponible. La familia GR00T suele integrarse con el ecosistema NVIDIA Isaac (Isaac Lab, Isaac Sim) y stacks propios de NVIDIA; no se confirma en la información disponible compatibilidad con vLLM, llama.cpp, Ollama o TGI, que además están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pokeandwiggle/groot-n2-clean-up-lego-fast-sim | 2.882.776.872 | no aplica | Política robótica (Lego, sim) | nvidia-software-and-model-evaluation-license | Gated en Hugging Face |
| GR00T N2 (base, NVIDIA) | no disponible | no aplica | Modelo fundacional de robótica | licencia NVIDIA | no disponible en la información proporcionada |
| Otros fine-tunes de GR00T N2 | no disponible | no aplica | Tareas de manipulación diversas | variable | no disponible en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre este checkpoint y alternativas, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada; al ser un modelo entrenado en simulación para una tarea muy concreta, es esperable un sesgo fuerte hacia el dominio y los objetos del simulador, pero no se documenta.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; en robótica el riesgo equivalente es la producción de acciones inválidas o inseguras fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no aplica idioma; el alcance está limitado a la tarea "clean up lego" en simulación.
- Restricciones de licencia: la licencia `nvidia-software-and-model-evaluation-license` es restrictiva y está orientada a evaluación; el uso comercial requiere revisar los términos y probablemente autorización explícita de NVIDIA. El acceso es gated, por lo que hay que aceptar condiciones en Hugging Face.
- Caveat para producción: el modelo está entrenado en simulación y no hay evidencia publicada de transferencia a un robot físico; no debe desplegarse en entornos reales sin validación adicional.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026-11-16; se trata de una publicación muy reciente y sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/pokeandwiggle/groot-n2-clean-up-lego-fast-sim
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
