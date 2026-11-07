# dddddsds31341/RLinf-RLT-Franka-Insert-Tube-Stage1-Step-15000

## Resumen

RLinf-RLT-Franka-Insert-Tube-Stage1-Step-15000 es un checkpoint de política de acción (action policy) para robótica, exportado en formato de solo inferencia desde un entrenamiento RLinf con el algoritmo RLT sobre la tarea Franka "Insert Tube". Lo publica el usuario dddddsds31341 en Hugging Face y corresponde al paso de optimizador 15.000 de la ejecución `rlt-insert-tube-g5-bs4-ga8-s20000-20261104-v14`, cuyo objetivo declarado era de 20.000 pasos.

No es un modelo de lenguaje: es un checkpoint de pesos completos (`full_weights.pt`) pensado para ejecutarse con la implementación OpenPI RLT de RLinf, junto con su `config.yaml`, `norm_stats.json` y las transformaciones de acción y cámaras originales. El repositorio ocupa 14,5 GB y está etiquetado como `pytorch`, `robotics`, `rlinf`, `rlt`, `openpi` y `franka`.

Su relevancia es acotada pero concreta: permite reproducir la inferencia de una política entrenada por refuerzo para una tarea de manipulación concreta (inserción de tubo con brazo Franka) sin necesidad de reentrenar, siempre que se disponga de los activos del modelo base y del tokenizador, que se distribuyen por separado. El autor advierte explícitamente de que el export no ejecuta entrenamiento, no modifica pesos y no garantiza tasas de éxito en evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RLT (policy de acción sobre la implementación OpenPI RLT de RLinf); detalles internos de la red no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica como contexto de lenguaje; depende de la ventana de observaciones del pipeline OpenPI) |
| Tipos de cuantizacion | no disponible (pesos exportados en `full_weights.pt`, sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (los componentes base conservan su licencia original) |
| Formato de pesos | PyTorch (`full_weights.pt`, state dict completo incluyendo `rlt_module.*`) |

## Arquitectura y entrenamiento

El checkpoint pertenece a la familia RLT dentro del ecosistema RLinf, ejecutada sobre la implementación OpenPI RLT, y se ha entrenado con aprendizaje por refuerzo para una tarea de manipulación robótica: inserción de tubo con un brazo Franka. La ejecución de origen se identifica como `rlt-insert-tube-g5-bs4-ga8-s20000-20261104-v14`, con un objetivo de 20.000 pasos de optimizador; este artefacto corresponde al paso 15.000. La nomenclatura sugiere un grupo de 5 entornos, batch size 4 y acumulación de gradiente 8, aunque esos valores no se detallan en la información disponible.

El export se realizó con el conversor nativo `convert_dcp_to_pt.py` de RLinf sobre CPU, partiendo del DCP original de 15k, y el autor indica que cada tensor exportado se recargó y comparó exactamente con el modelo cargado desde DCP. El `full_weights.pt` contiene el state dict completo del modelo, incluido el módulo `rlt_module.*`, pero excluye estado de optimizador, scheduler y RNG, por lo que no sirve para reanudar entrenamiento. El repositorio incluye además `config.yaml`, `training_config.yaml` (configuración de TensorBoard registrada en el directorio de salida original), `norm_stats.json` y `code.zip` (release v18 usada por el flujo de reanudación posterior; el DCP de 15k es anterior a esa release). No se especifican en la información disponible el número de tokens, la composición del dataset ni si hubo RLHF/DPO, más allá de la naturaleza RL del entrenamiento.

## Capacidades

- Ejecución de una política de acción para la tarea concreta de inserción de tubo con brazo Franka, en modo solo inferencia.
- Consumo de observaciones multimodales según el pipeline OpenPI RLT: cámaras e inputs de estado del robot, con las transformaciones de acción y preprocesado originales.
- Producción de acciones motoras normalizadas mediante `norm_stats.json`, que debe apuntarse correctamente para que la normalización coincida con la del entrenamiento.
- Integración con la implementación OpenPI RLT de RLinf, apuntando `model_path` a `full_weights.pt` y `norm_stats_path` a `norm_stats.json`.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes multi-paso ni multilingüismo; no es un modelo de lenguaje.
- No se documenta modo "thinking", visión general, audio ni otras capacidades fuera de la política robótica.

## Casos de uso

- Reproducción de evaluación de la política: cargar `full_weights.pt` con la implementación OpenPI RLT de RLinf y el `config.yaml` proporcionado para replicar la inferencia del paso 15.000 en un entorno controlado, comparando contra los checkpoints de 5.000 pasos publicados por el mismo autor.
- Investigación en aprendizaje por refuerzo robótico: usar el checkpoint como referencia de un estado intermedio (15k de 20k pasos) para estudiar curvas de aprendizaje, estabilidad y diferencias entre etapas del entrenamiento RLT.
- Desarrollo de pipelines de manipulación con Franka: integrar la política en un bucle de control que alimente observaciones de cámara y estado del robot y aplique las acciones resultantes tras validar orden de observaciones, unidades y límites del espacio de trabajo.
- Comparación de algoritmos: contrastar RLT con las colecciones de SFT pi0.5 del mismo autor (`Franka-Insert-Tube-pi05-step-5000`) para evaluar RL frente a imitación supervisada en la misma tarea.
- Validación de normalización y preprocesado: emplear `norm_stats.json` y `config.yaml` como referencia para auditar que las estadísticas de normalización y las transformaciones de acción coinciden entre entrenamiento e inferencia.
- Base para experimentos de reanudación: aunque el checkpoint no incluye estado de optimizador, sirve como punto de partida documentado para flujos de fine-tuning o reanudación con la release v18 incluida en `code.zip`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el export no afirma tasas de éxito de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 14,5 GB y el state dict completo está en `full_weights.pt`; el consumo real depende de la arquitectura RLT y de los activos del modelo base, que se distribuyen por separado.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; no se especifica si cabe en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: implementación OpenPI RLT de RLinf con PyTorch, apuntando `model_path` a `full_weights.pt` y `norm_stats_path` a `norm_stats.json`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de política).
- Latencia y throughput: no disponibles.
- Nota operativa: las rutas locales de `training_config.yaml` deben adaptarse a la máquina de destino, y los activos de modelo base y tokenizador requeridos no están incluidos.

## Comparativa con modelos similares

| Modelo | Tipo | Paso / estado | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RLinf-RLT-Franka-Insert-Tube-Stage1-Step-15000 | Política RLT (RL) | Paso 15.000 de 20.000 | no disponible | no disponible | Hugging Face, 0 descargas |
| RLinf-RLT-Franka-Insert-Tube-Stage1-Step-5000 | Política RLT (RL) | Paso 5.000 de 20.000 | no disponible | no disponible | Hugging Face |
| Franka-Insert-Tube-pi05-step-5000 | Política pi0.5 (SFT) | Paso 5.000 | no disponible | no disponible | Hugging Face |

Los tres artefactos pertenecen al mismo autor y a la misma tarea de inserción de tubo con Franka; las diferencias documentadas son el algoritmo (RLT con RL frente a pi0.5 con SFT) y el paso de entrenamiento. No se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- Checkpoint de solo inferencia: excluye estado de optimizador, scheduler y RNG, por lo que no permite reanudar el entrenamiento tal cual.
- No garantiza tasas de éxito: el autor declara explícitamente que el export no afirma resultados de evaluación.
- Dependencia de activos externos: el modelo base y el tokenizador requeridos se distribuyen por separado y no están incluidos en el repositorio.
- Riesgo de desalineación de preprocesado: deben preservarse la arquitectura RLT, el preprocesado, las entradas de cámara y las transformaciones de acción; cualquier cambio invalida la política.
- Rutas locales: `training_config.yaml` contiene rutas que deben adaptarse a la máquina de destino antes de ejecutar.
- Seguridad en robot real: el autor recomienda validar orden de observaciones, unidades, estadísticas de normalización, límites del espacio de trabajo y ejecución de acciones en un entorno controlado antes de desplegar en hardware.
- Licencia no disponible: no se puede confirmar el uso comercial; los componentes base conservan su licencia original, que debe verificarse por separado.
- Sesgos y alucinación: no aplican en el sentido de modelos de lenguaje, pero la política puede generalizar mal fuera de la distribución de la tarea de inserción de tubo y de las condiciones de cámara e iluminación del entrenamiento.
- Idiomas: no disponible; irrelevante para una política robótica.
- Trazabilidad de código: el `code.zip` corresponde a la release v18, posterior al DCP de 15k de origen, lo que introduce una discrepancia de versiones a tener en cuenta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/RLinf-RLT-Franka-Insert-Tube-Stage1-Step-15000
- Checkpoint de 5.000 pasos: https://huggingface.co/dddddsds31341/RLinf-RLT-Franka-Insert-Tube-Stage1-Step-5000
- Política pi0.5 SFT de la misma tarea: https://huggingface.co/dddddsds31341/Franka-Insert-Tube-pi05-step-5000
