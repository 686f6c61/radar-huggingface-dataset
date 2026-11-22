# MISLab-MiiSLab/gr00t_grasp-fan_Le-008_head_10k_LoRA

## Resumen

`gr00t_grasp-fan_Le-008_head_10k_LoRA` es un adaptador LoRA (Low-Rank Adaptation) publicado por el laboratorio MISLab-MiiSLab sobre el modelo base NVIDIA GR00T-N1.7-3B, un modelo fundacional de visión-lenguaje-acción (VLA) orientado a robótica humanoide. El adaptador se distribuye como un repositorio PEFT de aproximadamente 0,8 GB y está pensado para especializar el modelo base en una tarea concreta de manipulación robótica: el agarre de un ventilador (grasp-fan) con una cabeza o efector final determinado, según se deduce del identificador del repositorio.

La relevancia de esta ficha es acotada: no se trata de un modelo de lenguaje generalista, sino de un artefacto de ajuste fino para un robot concreto y una tarea concreta. El modelo base GR00T-N1.7-3B es un VLA de 3.000 millones de parámetros desarrollado por NVIDIA, y el adaptador modifica un subconjunto de sus pesos mediante LoRA, lo que reduce drásticamente el coste de entrenamiento y almacenamiento frente a un ajuste completo.

La model card publicada por el autor es la plantilla por defecto de Hugging Face sin rellenar: no documenta datos de entrenamiento, hiperparámetros, licencia, idiomas ni evaluación. Toda la información técnica disponible proviene de los metadatos del repositorio (tags, tamaño, librería, modelo base) y del identificador del adaptador. Cualquier dato no contrastado se marca explícitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelo base VLA NVIDIA GR00T-N1.7-3B (arquitectura del base: no disponible en detalle) |
| Parametros totales | No disponible (el adaptador LoRA ocupa 0,8 GB en el repositorio; el modelo base tiene 3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, técnica descrita en el paper arXiv:1910.09700 (Hu et al., 2021), que congela los pesos del modelo base e inserta matrices de bajo rango entrenables en determinadas capas. El modelo base es NVIDIA GR00T-N1.7-3B, un modelo fundacional de visión-lenguaje-acción de 3.000 millones de parámetros orientado a control robótico; el adaptador modifica ese base para la tarea de agarre de un ventilador (`grasp-fan`) con una configuración de cabeza/efector identificada como `Le-008_head_10k`.

No se dispone de información sobre el dataset de entrenamiento, el número de pasos (el sufijo `10k` sugiere 10.000 pasos o 10.000 episodios, pero no está confirmado), la composición de las trayectorias, el régimen de precisión ni los hiperparámetros de LoRA (rango, alpha, capas objetivo). La model card no incluye ninguna sección rellenada. La versión de PEFT declarada es 0.21.0.

## Capacidades

- Control robótico especializado: el adaptador está entrenado para la tarea de agarre de un ventilador con una cabeza concreta; su capacidades fuera de esa tarea no están documentadas.
- Hereda del modelo base GR00T-N1.7-3B las capacidades de visión-lenguaje-acción, pero el ajuste LoRA puede haber alterado o degradado el comportamiento general del base.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión, audio: no disponible en la documentación del adaptador; el base GR00T es multimodal visión-lenguaje-acción por diseño, pero no se detalla en esta ficha.

## Casos de uso

- Manipulación robótica de agarre de ventilador: el adaptador se carga sobre GR00T-N1.7-3B para ejecutar la política de agarre entrenada en el robot y efector correspondientes (`Le-008_head`); es su uso previsto directo.
- Reproducción de experimentos de investigación: útil para equipos que quieran replicar o comparar el ajuste fino de un VLA de 3B con LoRA en una tarea de manipulación concreta.
- Punto de partida para ajustes adicionales: al ser un adaptador PEFT, puede combinarse o continuar entrenándose para tareas de agarre relacionadas sin reentrenar el base completo.
- Evaluación de técnicas LoRA en robótica: sirve como caso de estudio de cuánto puede especializarse un VLA de 3B con 0,8 GB de adaptador.
- Despliegue en entornos con recursos limitados: el adaptador es pequeño y se carga junto al base, lo que permite servir el modelo especializado sin almacenar un checkpoint completo adicional.
- Integración en pipelines de simulación a real: si el autor documenta la configuración de simulación, el adaptador puede usarse para transferir la política a un robot físico con la misma cinemática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; el modelo base de 3B requiere aproximadamente 6-8 GB en FP16 y 3-4 GB en cuantización de 8 bits, estimación orientativa no confirmada por el autor.
- GPU recomendadas: no disponible; para el base de 3B, una RTX 4090 o A100 serían suficientes en FP16, pero no hay datos del autor.
- Cabe en GPU consumer: probablemente sí para el base en cuantización, pero no confirmado.
- Opciones de despliegue: PEFT 0.21.0 (declarado); vLLM, llama.cpp, Ollama o TGI no están documentados para este adaptador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| gr00t_grasp-fan_Le-008_head_10k_LoRA (este) | Adaptador LoRA sobre 3B | No disponible | No disponible | Hugging Face, 0 descargas |
| NVIDIA GR00T-N1.7-3B (base) | 3B | No disponible | No disponible | Hugging Face (referenciado en el tag) |
| Otros adaptadores LoRA de robótica | Variable | No disponible | Variable | No disponible |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- La model card está vacía: no hay información sobre licencia, sesgos, datos de entrenamiento ni evaluación, lo que impide validar el uso comercial.
- El adaptador está especializado en una tarea y un efector concretos; su uso fuera de ese contexto no está garantizado y probablemente degrade el comportamiento.
- Riesgo de alucinación y de comportamiento errático en robótica: un VLA mal ajustado o usado fuera de distribución puede generar acciones inseguras; se requiere validación en simulación y con protocolos de seguridad física.
- El identificador del modelo base en el tag apunta a una ruta local del autor (`/home/miislab-server10/.cache/...`), lo que puede dificultar la carga automática del adaptador y requiere resolver manualmente el base `nvidia/GR00T-N1.7-3B`.
- Sin datos de licencia, no puede confirmarse el uso comercial ni la redistribución.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de reproducibilidad.
- El sufijo `10k` no está documentado; no debe interpretarse como número de pasos confirmado.

## Enlaces

- Hugging Face: https://huggingface.co/MISLab-MiiSLab/gr00t_grasp-fan_Le-008_head_10k_LoRA
- Modelo base referenciado: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Paper LoRA: https://arxiv.org/abs/1910.09700
- PEFT: https://github.com/huggingface/peft
