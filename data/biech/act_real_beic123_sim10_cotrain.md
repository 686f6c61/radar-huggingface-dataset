# biecH/act_real_beic123_sim10_cotrain

## Resumen

`act_real_beic123_sim10_cotrain` es una política de control robótico basada en ACT (Action Chunking Transformer) publicada en Hugging Face por el usuario `biecH` dentro del ecosistema LeRobot. No es un modelo de lenguaje: es un modelo de imitación que traduce observaciones visuales y de estado del robot en secuencias de acciones motoras, en concreto para el brazo robótico SO-101. El modelo parte de un checkpoint previo entrenado con demostraciones reales (`act_real_beic123_trimmed_epoch_3`, paso 12863) y se afina con un conjunto mixto de episodios reales y simulados.

La relevancia de esta ficha es acotada: se trata de un artefacto experimental de un hackathon, con 51,7 millones de parámetros, sin métricas de evaluación publicadas, sin licencia declarada y sin descargas. Resulta útil como referencia técnica de co-entrenamiento sim-real en políticas ACT dentro de LeRobot, pero no como componente listo para producción.

El contexto de uso es la robótica de manipulación de bajo coste: el SO-101 es un brazo de código abierto orientado a prototipado, y ACT es una de las políticas de imitación más ligeras y rápidas de entrenar del ecosistema LeRobot. El modelo se distribuye en formato `safetensors` con la librería `lerobot`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), política de imitación de LeRobot |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación definida por la config de ACT) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 0,2 GB, librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder diseñado para imitación visomotora: codifica las observaciones (imágenes de cámara y estado de las articulaciones) y decodifica un *chunk* de acciones futuras de forma conjunta, lo que reduce el error de compounding y permite control a mayor frecuencia efectiva. En esta configuración, el `chunk_size` es 100 y `n_action_steps` es 100, es decir, la política predice y ejecuta bloques de 100 acciones por inferencia.

El entrenamiento es un fine-tune del checkpoint `act_real_beic123_trimmed_epoch_3` (paso 12863) sobre el dataset local `beic_123_trimmed_sim10`, que combina las demostraciones reales de `beic_123_trimmed` con episodios simulados: 80 episodios y 41.453 fotogramas a 30 fps. Se usó batch 32, learning rate constante de 1e-5 (preset de ACT) y el checkpoint publicado corresponde al paso 1170 del fine-tune, aproximadamente 0,9 épocas. No se documenta el simulador empleado, la proporción exacta real/sim, ni si hubo aumento de datos o domain randomization. El autor añadió el `policy.py` estándar del repositorio del hackathon (`policy/act/policy.py`) en el momento de la subida, lo que sugiere que el checkpoint no era autocontenido sin ese fichero.

## Capacidades

- Control de manipulación robótica mediante imitación: genera trayectorias de acciones para el brazo SO-101 a partir de observaciones visuales y propioceptivas.
- Predicción de chunks de acción de 100 pasos, lo que aporta suavidad temporal y reduce la frecuencia de inferencia necesaria.
- Co-entrenamiento sim-real: el fine-tune incorpora episodios simulados junto a demostraciones reales, con el objetivo de mejorar la robustez y la generalización.
- Compatible con el stack LeRobot para entrenamiento, evaluación y despliegue de políticas.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo generativo de texto.
- No se documentan capacidades de visión semántica, audio ni modos de razonamiento explícito.

## Casos de uso

- Prototipado de manipulación con SO-101: servir como punto de partida para afinar una política ACT sobre demostraciones propias, aprovechando el checkpoint preentrenado en lugar de entrenar desde cero.
- Investigación en co-entrenamiento sim-real: usar este modelo como referencia para estudiar cómo afecta mezclar episodios simulados con reales en el rendimiento de una política de imitación.
- Evaluación de pipelines LeRobot: validar el flujo completo de carga de checkpoint, construcción de la política ACT y ejecución de rollouts en un entorno controlado.
- Recolección de datos dirigida: emplear el modelo para generar trayectorias iniciales que un operador pueda corregir, acelerando la recolección de nuevas demostraciones.
- Docencia y divulgación en robótica de imitación: ilustrar el funcionamiento de ACT con un ejemplo real de fine-tune y sus hyperparámetros documentados.
- Benchmark interno de infraestructura: medir latencia de inferencia y throughput de una política de 51,7 M de parámetros en GPUs de consumo antes de escalar a modelos mayores.
- Base para experimentos de domain randomization: al existir una variante con datos simulados, sirve para comparar estrategias de aumento de datos simulados frente al entrenamiento puramente real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente "no eval numbers yet", por lo que no existe tasa de éxito, error de posición ni métrica alguna de evaluación sobre el modelo final.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 0,2 GB en `safetensors` (51,7 M de parámetros en fp32), por lo que la inferencia cabe holgadamente en cualquier GPU con 2 GB o más, incluidas GPUs integradas.
- GPU recomendadas: cualquier GPU NVIDIA moderna (RTX 3060 en adelante) es suficiente; para entrenamiento o fine-tune se recomienda RTX 4090, A100 o H100 si se trabaja con lotes grandes y múltiples cámaras.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con al menos 2 GB de VRAM; el cuello de botella real es el pipeline de visión y la captura de cámaras, no el modelo.
- Opciones de despliegue: LeRobot (carga nativa del checkpoint), exportación a ONNX o TorchScript para inferencia embebida; no aplica vLLM, llama.cpp, Ollama ni TGI, que son servidores de modelos de lenguaje.
- Latencia y throughput: no disponibles. Al ejecutar chunks de 100 acciones, la frecuencia de inferencia efectiva es baja en comparación con políticas que predicen una acción por paso, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto / chunk | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `act_real_beic123_sim10_cotrain` | 51,7 M | ACT (LeRobot), fine-tune sim-real | chunk 100 | no disponible | Hugging Face, 0 descargas |
| `biecH/act_real_beic123_trimmed_epoch_3` | no disponible | ACT (LeRobot), solo datos reales | no disponible | no disponible | Hugging Face (modelo base) |
| Políticas ACT de referencia de LeRobot | ~50 M (configuración típica) | ACT (LeRobot) | configurable | Apache 2.0 (repo LeRobot) | Hugging Face / GitHub |
| Políticas Diffusion Policy de LeRobot | variable | Diffusion Policy | configurable | Apache 2.0 (repo LeRobot) | Hugging Face / GitHub |

La comparación con Diffusion Policy es pertinente porque ambas son alternativas de imitación visomotora en LeRobot: ACT es más ligera y rápida de entrenar, mientras que Diffusion Policy suele requerir más cómputo pero puede modelar distribuciones multimodales de acciones. No hay datos de rendimiento de este checkpoint concreto para comparar numéricamente.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito ni métricas de ningún tipo, por lo que se desconoce si el fine-tune sim-real mejora o degrada el checkpoint base.
- Licencia no declarada: no se puede asumir uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Modelo específico de hardware: entrenado para el brazo SO-101; no es transferible sin reentrenamiento a otras morfologías o configuraciones de cámaras.
- Dataset no publicado: `local/beic_123_trimmed_sim10` no está en Hugging Face, lo que impide reproducir el entrenamiento.
- Riesgo de sobreajuste al entorno: con solo 80 episodios y 0,9 épocas, la generalización a condiciones de iluminación, fondos u objetos distintos es incierta.
- Dependencia de ficheros externos: el `policy.py` se añadió manualmente en la subida, lo que puede romper la carga automática en algunas versiones de LeRobot.
- Sin soporte de lenguaje ni razonamiento: no debe evaluarse con benchmarks de texto ni usarse en tareas de comprensión semántica.
- Artefacto experimental: creado en el contexto de un hackathon, sin mantenimiento ni versionado posteriores documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/biecH/act_real_beic123_sim10_cotrain
- Modelo base: https://huggingface.co/biecH/act_real_beic123_trimmed_epoch_3
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de ACT en LeRobot: https://github.com/huggingface/lerobot/tree/main/lerobot/common/policies/act
- Paper de ACT (Action Chunking with Transformers): https://arxiv.org/abs/2304.13705
