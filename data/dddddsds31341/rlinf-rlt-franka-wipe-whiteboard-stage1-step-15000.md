# dddddsds31341/RLinf-RLT-Franka-Wipe-Whiteboard-Stage1-Step-15000

## Resumen

RLinf-RLT-Franka-Wipe-Whiteboard-Stage1-Step-15000 es un checkpoint de política de acción (action policy) para robótica, exportado en formato de solo inferencia desde un entrenamiento de aprendizaje por refuerzo realizado con el framework RLinf. Lo publica el usuario dddddsds31341 en Hugging Face y corresponde al paso de optimización 15.000 de la ejecución `rlt-wipe-whiteboard-g7-bs4-ga8-s20000-20261104-v14`, cuyo objetivo declarado era alcanzar los 20.000 pasos. No es un modelo de lenguaje: es un artefacto de pesos para control robótico, etiquetado con el pipeline `robotics`.

El modelo se enmarca en la línea RLT (Reinforcement Learning with Trajectory, según las siglas usadas por el autor) sobre la implementación OpenPI, y está especializado en la tarea de limpiar una pizarra blanca con un brazo robótico Franka. El repositorio contiene únicamente el estado completo del modelo (`full_weights.pt`), sin estado de optimizador, scheduler ni RNG, por lo que no sirve para reanudar el entrenamiento, solo para evaluación e inferencia. El tamaño del repositorio es de 14,5 GB.

La relevancia de esta ficha es limitada para el público general de modelos de IA, pero es significativa para investigadores en robótica y aprendizaje por refuerzo que quieran reproducir o evaluar políticas de manipulación entrenadas con RLinf. El autor advierte explícitamente de que la exportación no ejecuta entrenamiento ni garantiza tasas de éxito en evaluación, y de que los componentes base conservan sus licencias originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RLT (action policy sobre implementación OpenPI); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica a política robótica) |
| Tipos de cuantizacion | no disponible (pesos en `full_weights.pt`, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`full_weights.pt`), más `config.yaml`, `training_config.yaml`, `norm_stats.json` y `code.zip` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de una política de acción RLT integrada en la implementación OpenPI de RLinf. El checkpoint proviene de un proceso de aprendizaje por refuerzo (RLinf) sobre la tarea Franka de limpiar una pizarra, con una configuración de entrenamiento registrada en TensorBoard (`rlt-wipe-whiteboard-g7-bs4-ga8-s20000-20261104-v14`), cuyo nombre sugiere un tamaño de grupo de 7, batch size de 4, acumulación de gradiente de 8 y un objetivo de 20.000 pasos. No se especifican el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO, ya que no aplican al paradigma de entrenamiento por refuerzo robótico.

La innovación técnica destacable es el propio pipeline de exportación: el autor convirtió el checkpoint DCP original de 15.000 pasos a `full_weights.pt` mediante el conversor nativo `convert_dcp_to_pt.py` de RLinf, ejecutado en CPU, y verificó que cada tensor exportado coincide exactamente con el modelo cargado desde el DCP. El export incluye el state dict completo, incluidos los módulos `rlt_module.*`, y excluye optimizador, scheduler y RNG. Se advierte de que el código ZIP adjunto corresponde a la release v18, posterior al DCP de 15.000 pasos de origen, y de que los activos del modelo base y del tokenizer son independientes y deben obtenerse por separado.

## Capacidades

- Control robótico de manipulación: genera acciones para un brazo Franka en la tarea específica de limpiar una pizarra blanca.
- Inferencia de política de acción: pensado para evaluación, no para entrenamiento ni reanudación.
- Integración con RLinf OpenPI: requiere la implementación y el `config.yaml` suministrados, apuntando `model_path` a `full_weights.pt` y `norm_stats_path` a `norm_stats.json`.
- Procesamiento de observaciones con cámara: preserva la arquitectura RLT, el preprocesado, las entradas de cámara y las transformaciones de acción originales.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling ni agentes multi-paso.
- No se documentan capacidades multilingües ni modos especiales (thinking, audio, etc.).

## Casos de uso

- Evaluación de políticas de RL en robótica: cargar el checkpoint con la implementación RLinf OpenPI y medir la tasa de éxito en la tarea de limpiar pizarra, usando `norm_stats.json` para normalizar observaciones y acciones.
- Reproducción de experimentos: comparar el rendimiento del paso 15.000 con el checkpoint del paso 10.000 publicado por el mismo autor para analizar la curva de aprendizaje dentro de la misma ejecución.
- Investigación en aprendizaje por refuerzo aplicado a manipulación: usar los pesos como referencia para estudiar la estabilidad del entrenamiento RLT en tareas de contacto con superficies.
- Desarrollo de pipelines de simulación a real: validar el orden de observaciones, unidades, estadísticas de normalización y límites de espacio de trabajo antes de desplegar en hardware, tal como recomienda el autor.
- Benchmarking interno de frameworks: comparar la implementación RLinf OpenPI con otras pilas de políticas robóticas (por ejemplo, la variante pi0.5 SFT del mismo autor) sobre la misma tarea.
- Docencia y formación: servir como ejemplo práctico de exportación de checkpoints DCP a PyTorch y de verificación tensor a tensor en flujos de RLinf.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que la exportación no afirma tasas de éxito en evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 14,5 GB, lo que da una cota inferior orientativa del espacio necesario para cargar los pesos en memoria, sin contar activaciones ni buffers de inferencia.
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del checkpoint, se requeriría al menos una GPU con 16-24 GB de VRAM para cargar los pesos en FP32, o menos si se convierte a precisión reducida.
- ¿Cabe en GPU de consumo? Probablemente en modelos con 24 GB o más (por ejemplo, RTX 3090/4090) si se reduce la precisión, pero no se confirma en la documentación.
- Opciones de despliegue: la única vía documentada es la implementación RLinf OpenPI con el `config.yaml` y `norm_stats.json` suministrados; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Paso | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RLinf-RLT-Franka-Wipe-Whiteboard-Stage1-Step-15000 | Política RLT (OpenPI) | 15.000 | no aplica | no disponible | Hugging Face |
| RLinf-RLT-Franka-Wipe-Whiteboard-Stage1-Step-10000 | Política RLT (OpenPI) | 10.000 | no aplica | no disponible | Hugging Face |
| Franka-Wipe-Whiteboard-pi05-step-5000 | Política pi0.5 SFT (OpenPI) | 5.000 | no aplica | no disponible | Hugging Face |

Los tres artefactos pertenecen al mismo autor y a la misma tarea, pero representan paradigmas distintos (RL frente a SFT) y etapas de entrenamiento diferentes. No se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- Checkpoint de solo evaluación: no contiene estado de optimizador, scheduler ni RNG, por lo que no permite reanudar el entrenamiento.
- Sin garantía de rendimiento: el autor no afirma tasas de éxito ni resultados de evaluación.
- Dependencia de código externo: requiere la implementación RLinf OpenPI y los activos del modelo base y tokenizer, que se distribuyen por separado y conservan sus licencias originales.
- Desajuste de versiones: el código ZIP adjunto es la release v18, posterior al DCP de 15.000 pasos de origen, lo que puede introducir diferencias de comportamiento.
- Rutas locales: `training_config.yaml` contiene rutas locales que deben adaptarse a la máquina de destino.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Riesgo en hardware real: es imprescindible validar el orden de observaciones, unidades, estadísticas de normalización, límites de espacio de trabajo y ejecución de acciones en un entorno controlado antes de desplegar en un robot físico.
- Sesgos y alucinación: no aplican en el sentido habitual de modelos de lenguaje, pero la política puede generalizar mal fuera de la distribución de la tarea de limpiar pizarra.
- Idiomas: no aplica; no es un modelo lingüístico.

## Enlaces

- Hugging Face (modelo principal): https://huggingface.co/dddddsds31341/RLinf-RLT-Franka-Wipe-Whiteboard-Stage1-Step-15000
- Checkpoint del paso 10.000: https://huggingface.co/dddddsds31341/RLinf-RLT-Franka-Wipe-Whiteboard-Stage1-Step-10000
- Variante pi0.5 SFT del paso 5.000: https://huggingface.co/dddddsds31341/Franka-Wipe-Whiteboard-pi05-step-5000
