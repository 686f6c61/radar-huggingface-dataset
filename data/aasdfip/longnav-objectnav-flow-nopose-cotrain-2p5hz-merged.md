# Aasdfip/longnav-objectnav-flow-nopose-cotrain-2p5hz-merged

## Resumen

El modelo `Aasdfip/longnav-objectnav-flow-nopose-cotrain-2p5hz-merged` es un checkpoint de navegación robótica para entornos 3D (ObjectNav y PointNav) desarrollado por Aasdfip. Se trata de una variante fusionada (weights-merged) de un adaptador LoRA entrenado sobre el modelo base `Qwen/Qwen3-VL-2B-Instruct`, con un cabezal adicional de flujo (flow-matching) para generar acciones discretas de navegación. El propósito principal de esta versión fusionada es permitir la evaluación de adaptadores de RL posteriores sin necesidad de componer dos LoRAs, ya que el adaptador RL se aplica directamente sobre estos pesos.

El modelo resuelve el problema de navegación autónoma en interiores a partir de observaciones visuales (RGB-D) y, opcionalmente, pose, aunque la evaluación óptima se consigue sin inyección de pose. Con 2.127 millones de parámetros y licencia Apache 2.0, es un modelo ligero orientado a simulación con Habitat. La relevancia actual radica en su arquitectura híbrida visión-lenguaje-acción y su enfoque en el entrenamiento de políticas de navegación con flujo, una alternativa a los métodos tradicionales de predicción de acciones discretas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) sobre Qwen3-VL-2B-Instruct con cabezal de flow-matching |
| Parametros totales | 2.127.532.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda del base Qwen3-VL-2B, sin especificar) |
| Tipos de cuantizacion | no disponible (pesos en bf16 según el repo) |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors) + cabezal en turn_vector_head.pt |

## Arquitectura y entrenamiento

El modelo combina un VLM base (Qwen3-VL-2B-Instruct) con un cabezal de flujo (flow-matching) para generar acciones de navegación. El VLM procesa observaciones visuales y textuales, y el cabezal de flujo produce trayectorias de acción en un espacio continuo que luego se discretizan para el control del agente en Habitat. El entrenamiento se realizó mediante fine-tuning con LoRA (r=256, alpha=512) sobre el modelo base, con un dataset de ObjectNav y PointNav. La variante `-merged` fusiona el adaptador LoRA en los pesos base, de modo que el checkpoint resultante es numéricamente idéntico a la composición base + LoRA (residual 1.5e-3 por redondeo bf16). Además, se entrenó con pose en la mitad de los datos de ObjectNav, pero la evaluación muestra mejores resultados sin inyección de pose (0.663 vs 0.614 de éxito en sample101). El entrenamiento alcanzó el paso global 12000 (según trainer_state.json).

## Capacidades

- Navegación autónoma en interiores (ObjectNav y PointNav) en el simulador Habitat.
- Generación de acciones discretas de movimiento (avance, giro) a partir de observaciones RGB-D.
- Soporte opcional de entrada de pose (modality `<pose>`), aunque el rendimiento óptimo se logra desactivándola.
- Integración con el harness de evaluación `eval_objectnav_policy.py` del repositorio `longnav`.
- Capacidad de ser utilizado como base para fine-tuning con RL (adaptadores RL se cargan directamente sobre este checkpoint).
- No se documentan capacidades de tool calling, generación de texto libre ni razonamiento conversacional.

## Casos de uso

- Evaluación de políticas de navegación en simulación: el checkpoint fusionado permite cargar adaptadores RL directamente y medir la mejora incremental sobre el SFT sin componer LoRAs manualmente.
- Entrenamiento de RL sobre políticas de navegación: al tener el SFT ya fusionado, los gradientes de RL se aplican sobre una base estable, evitando errores silenciosos de composición de adaptadores.
- Investigación en VLA con flow-matching: sirve como referencia para estudiar el efecto de la fusión de pesos en el rendimiento de políticas de navegación.
- Benchmarking de navegación en Habitat: puede ejecutarse en el split de validación de HM3D ObjectNav con el script proporcionado, usando `--no-pose-injection` para el modo sin pose.
- Desarrollo de sistemas de navegación para robots domésticos: aunque es un modelo de simulación, las políticas aprendidas podrían transferirse a plataformas reales con adaptación adicional.
- Comparación de estrategias de entrenamiento: permite aislar el efecto del RL delta frente al SFT base, útil para publicaciones y estudios de ablación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada en la model card es:

| Métrica | Valor |
|---|---|
| Éxito en sample101 (ObjectNav, sin pose) | 0.663 |
| Éxito en sample101 (ObjectNav, con pose) | 0.614 |

Estos valores corresponden a una evaluación con n=101 episodios del split de validación HM3D ObjectNav. No hay comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 2.1B parámetros en bf16, el uso de memoria aproximado es de 4.3 GB (tamaño del repo) más overhead de activaciones y el cabezal de flujo. En la práctica, se recomienda al menos 6-8 GB de VRAM para inferencia con batch pequeño.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM, p. ej., RTX 3070/3080/4060, A10, L4. Para entrenamiento RL, se recomienda una GPU con 16-24 GB (RTX 4090, A100 40GB).
- No cabe en GPUs de 4 GB o menos sin cuantización (no se proporcionan versiones cuantizadas).
- Opciones de despliegue: el modelo se ejecuta mediante el script `eval_objectnav_policy.py` con backend `flow_rollout`. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que el pipeline es de robótica y no de generación de texto estándar.
- Latencia y throughput: no disponibles. Depende del simulador y del hardware; en simulación con Habitat, el paso de control es de 0.04 s (dt) con un gap de 10, lo que sugiere una frecuencia de decisión de 25 Hz.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de navegación VLA con flow-matching. Como referencia, el modelo base Qwen3-VL-2B-Instruct es un VLM generalista sin capacidades de navegación, y este checkpoint añade el cabezal de acciones. No hay datos de otros modelos de la misma categoría (p. ej., NavGPT, LM-Nav) en la información proporcionada.

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| Aasdfip/longnav-objectnav-flow-nopose-cotrain-2p5hz-merged | 2.1B | no disponible | Apache 2.0 | Navegación en Habitat |
| Qwen/Qwen3-VL-2B-Instruct (base) | 2.1B | no disponible | Apache 2.0 | VLM generalista |

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para navegación en simulación Habitat; no es un modelo de lenguaje conversacional ni de propósito general.
- La evaluación sin pose requiere una modificación del harness (`--no-pose-injection`) que no está disponible en la versión pública del repositorio en el momento de la subida.
- El modelo fue entrenado con un dataset específico de ObjectNav/PointNav; puede no generalizar a otros entornos o tareas de navegación.
- No se han documentado sesgos, pero al ser un VLM preentrenado, puede heredar sesgos visuales y lingüísticos del modelo base.
- Riesgo de alucinación en la interpretación de escenas visuales, aunque su impacto en la navegación se mitiga con el cabezal de flujo.
- La licencia Apache 2.0 permite uso comercial, pero el código del harness y los datos de entrenamiento pueden tener restricciones adicionales no especificadas.
- El checkpoint fusionado no incluye estado de optimizador ni RNG, por lo que no es adecuado para reanudar entrenamiento; solo para inferencia o fine-tuning RL.
- No hay garantías de rendimiento en hardware real; los resultados reportados son de simulación.

## Enlaces

- Repositorio HuggingFace del modelo fusionado: https://huggingface.co/Aasdfip/longnav-objectnav-flow-nopose-cotrain-2p5hz-merged
- Repositorio del adaptador canónico (sin fusionar): https://huggingface.co/Aasdfip/longnav-objectnav-flow-nopose-cotrain-2p5hz
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- No se proporcionan papers, blogs ni demos adicionales en la información disponible.
