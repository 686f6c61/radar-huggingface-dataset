# jogarulfop/policy_2026-09-21_cheap_shakeit_bench_3sensors_v2_no_tactile

## Resumen

`jogarulfop/policy_2026-09-21_cheap_shakeit_bench_3sensors_v2_no_tactile` es una política de robótica entrenada mediante aprendizaje por imitación con el método ACT (Action Chunking with Transformers) y publicada en el Hub con la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visomotor que, a partir de observaciones del robot (imágenes de sensores y estado de las articulaciones), predice trozos cortos de acciones (*action chunks*) en lugar de pasos individuales, lo que reduce el error de acumulación típico de las políticas reactivas.

El modelo tiene 51.668.614 parámetros (unos 51,7 M), un tamaño de repositorio de 0,2 GB y pesos en formato safetensors. Está entrenado sobre el dataset `jogarulfop/2026-09-21_cheap_shakeit_bench_3sensors_v2_no_tactile`, cuyo nombre indica una configuración de tres sensores sin sensor táctil, orientada presumiblemente a un banco de pruebas de manipulación de bajo coste. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia es la de cualquier política ACT publicada en el ecosistema LeRobot: sirve como referencia reproducible de imitación visomotora de bajo coste computacional, ejecutable en una sola GPU de consumo e integrable en flujos de entrenamiento y evaluación estandarizados (`lerobot-train`, `lerobot-record`). Al no tener descargas ni valoraciones, debe considerarse un artefacto experimental de un autor individual, no un modelo validado por la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), según el paper 2304.13705; detalles concretos de la configuración no disponibles |
| Parámetros totales | 51.668.614 |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; ACT opera sobre observaciones por paso y predice chunks de acciones, con tamaño de chunk no especificado en la model card) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica; no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | LeRobot |
| Pipeline | robotics |
| Dataset de entrenamiento | `jogarulfop/2026-09-21_cheap_shakeit_bench_3sensors_v2_no_tactile` |
| Sensores declarados (por nombre del dataset) | 3 sensores, sin señal táctil |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación descrito en el paper *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware* (arXiv:2304.13705). La formulación original combina un codificador de estilo tipo VAE condicional (CVAE) con un transformer encoder-decoder: el codificador comprime una secuencia de acciones de demostración en una variable latente y el decodificador genera un chunk de acciones futuras a partir de las observaciones actuales, típicamente imágenes de cámaras más el estado de las articulaciones. En lugar de predecir una única acción por paso, el modelo emite un bloque de acciones que se ejecutan en bucle abierto durante varios pasos, lo que mejora la estabilidad del control y permite alcanzar altas tasas de éxito en tareas de manipulación fina con hardware de bajo coste. La model card proporcionada no confirma estos detalles para esta instancia concreta, por lo que deben tomarse como descripción del método referenciado y no como especificación verificada del checkpoint.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset, la resolución de imagen ni si se aplicaron etapas de RLHF o DPO (procedimientos poco habituales en políticas de imitación como ACT). El nombre del dataset sugiere una campaña de teleoperación sobre un montaje de tres sensores sin modalidad táctil, pero no se especifican ni el número de episodios ni la tasa de éxito alcanzada.

## Capacidades

- Generación de acciones motoras por chunks para control de robots manipuladores, a partir de observaciones visuales y de estado.
- Aprendizaje por imitación a partir de demostraciones teleoperadas; no requiere definición explícita de recompensas.
- Control visomotor de tareas de manipulación (alcance, agarre, colocación) dentro de la distribución de datos de entrenamiento.
- Funcionamiento con tres sensores y sin señal táctil, según la configuración del dataset asociado.
- Integración nativa con el ecosistema LeRobot para entrenamiento, registro de evaluaciones y despliegue.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües ni modos de pensamiento: no es un modelo de lenguaje.

## Casos de uso

- Manipulación robótica de laboratorio: reproducción de tareas de pick-and-place teleoperadas sobre el mismo montaje de tres sensores, aprovechando que la política fue entrenada específicamente para esa configuración.
- Banco de pruebas de investigación en imitación: uso como línea base ACT reproducible para comparar contra otras políticas de LeRobot (Diffusion Policy, VQ-BeT, SmolVLA) sobre el mismo dataset.
- Prototipado de bajo coste: al tener 51,7 M de parámetros y pesar 0,2 GB, permite iterar en una estación de trabajo con una única GPU de consumo sin infraestructura de clúster.
- Evaluación comparativa con y sin sensor táctil: el sufijo `no_tactile` del dataset lo hace adecuado para estudiar el impacto de eliminar la modalidad táctil en el rendimiento de la tarea.
- Automatización de rutinas repetitivas en entornos controlados: ejecución de una secuencia motora fija aprendida, siempre que las condiciones visuales se mantengan dentro de la distribución de entrenamiento.
- Docencia y formación en robótica: ejemplo completo y ligero de un pipeline de aprendizaje por imitación de principio a fin (entrenamiento, checkpoints, registro de episodios de evaluación).
- Reproducción de resultados: punto de partida para verificar la receta de entrenamiento ACT de LeRobot y medir la variabilidad entre ejecuciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de error de acción ni comparaciones cuantitativas con otras políticas. El repositorio registra 0 descargas y 0 valoraciones, por lo que tampoco existen evaluaciones independientes de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en fp32 y unos 0,1 GB en fp16 para los pesos, más el consumo de activaciones y buffers de imagen (no cuantificado en la información disponible).
- GPU recomendadas: cualquier GPU con soporte CUDA resulta suficiente por tamaño; se espera buen rendimiento en RTX 3060, RTX 4090, A100 o H100.
- Compatibilidad con GPU de consumo: sí, el modelo cabe con holgura en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida; el cuello de botella será el preprocesado de imagen, no el transformer.
- Opciones de despliegue: LeRobot para inferencia sobre el robot (`lerobot-record --policy.path=...`), con `--policy.device=cuda` o CPU. No se documenta soporte de vLLM, TGI, llama.cpp u Ollama, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La viabilidad en tiempo real depende de la frecuencia de control exigida por el robot y del coste del backbone visual, que la model card no especifica.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ACT, jogarulfop) | Política de imitación ACT | 51.668.614 | no disponible | Apache 2.0 | Hub de Hugging Face, LeRobot |
| Diffusion Policy (LeRobot) | Política de imitación basada en difusión | no disponible en esta búsqueda | no disponible | no disponible | Implementación en LeRobot |
| VQ-BeT (LeRobot) | Política de imitación con discretización de acciones | no disponible en esta búsqueda | no disponible | no disponible | Implementación en LeRobot |
| SmolVLA (LeRobot) | Política visión-lenguaje-acción | no disponible en esta búsqueda | no disponible | no disponible | Implementación en LeRobot |

Los datos de parámetros, contexto y licencia de las alternativas no están disponibles en la información proporcionada, por lo que la comparación cuantitativa no puede completarse. A igualdad de receta, ACT suele ser la política de referencia por su bajo coste computacional, mientras que Diffusion Policy y VQ-BeT exploran formulaciones distintas de la distribución de acciones.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no responde a instrucciones en lenguaje natural y no admite prompts convencionales.
- Sesgos de dominio: la política solo es válida para el entorno, la morfología del robot y la distribución visual del dataset de entrenamiento; fuera de ese dominio su comportamiento no está garantizado.
- Riesgo de fallo silencioso: en aprendizaje por imitación, el modelo puede ejecutar acciones plausibles pero erróneas sin señal de incertidumbre, con riesgo físico para el robot y el entorno.
- Ausencia de modalidad táctil: el dataset declara explícitamente `no_tactile`, lo que limita las tareas que requieren control de fuerza o detección de contacto.
- Sin datos de evaluación: no hay tasas de éxito ni métricas publicadas, y el modelo acumula 0 descargas, por lo que no existe validación por parte de la comunidad.
- Idiomas y contexto de lenguaje: no aplicables; cualquier consulta multilingüe o de contexto largo queda fuera del alcance del modelo.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no exime de responsabilidad sobre el comportamiento del robot ni sobre el cumplimiento de normativa de seguridad aplicable.
- Reproducibilidad limitada: la model card no documenta hiperparámetros, número de episodios, resolución de imagen ni semilla, lo que dificulta replicar el entrenamiento.
- Despliegue seguro: para uso en producción se recomienda validación con parada de emergencia, límites de par y evaluación en un banco de pruebas aislado antes de operar cerca de personas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jogarulfop/policy_2026-09-21_cheap_shakeit_bench_3sensors_v2_no_tactile
- Dataset asociado: https://huggingface.co/datasets/jogarulfop/2026-09-21_cheap_shakeit_bench_3sensors_v2_no_tactile
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas de imitación en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy

Nota: los resultados de la búsqueda web realizada no contienen enlaces relevantes para este modelo; las referencias devueltas (informes financieros, documentación de software de química analítica, gráficos de open interest y un informe de analítica de datos) no guardan relación con la política descrita.
