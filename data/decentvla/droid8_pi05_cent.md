# DecentVLA/droid8_pi05_cent

## Resumen

droid8_pi05_cent es un checkpoint de un modelo vision-language-action (VLA) de la familia π0.5, publicado por el colectivo DecentVLA a través de la implementación JAX de openpi. En concreto, es un full fine-tune que parte de `pi05_base` y emplea la receta DROID de control por posiciones articulares conjuntas (`train_config: pi05_droid_jointpos`, adaptadores `decent-vla adapters/openpi/_droid.py`). El modelo resuelve el problema de generar acciones de manipulación robótica a partir de observaciones visuales y lenguaje, y se sirve mediante el protocolo websocket de openpi.

La variante "cent" (centralizada) forma parte de un experimento de aprendizaje federado y actúa como línea base: se ha entrenado sobre la unión de los datos de 8 clientes, con batch 256 y exactamente las mismas muestras que la variante FedAvg. Esto la convierte en la referencia contra la que se compara el rendimiento del entrenamiento descentralizado.

El checkpoint publicado corresponde a la ronda 50 (`server_round_0050.pt`) e incluye además el fichero de configuración del entrenamiento, las estadísticas de normalización y el registro de entrenamiento. Su relevancia es principalmente de investigación: permite reproducir la línea base centralizada de un estudio federado sobre el dataset DROID y evaluar modelos VLA en tareas de manipulación robótica. La mayoría de especificaciones internas del modelo (tamaño, contexto, cuantización) no se detallan en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) π0.5; implementación JAX de openpi. Topología interna detallada: no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint `.pt` (PyTorch, formato decent-vla); se acompañan `openpi_pi05_droid8_cent_local.yaml`, `norm_stats.json` y el log de entrenamiento |

## Arquitectura y entrenamiento

Se trata de un modelo π0.5 servido con openpi, la implementación oficial en JAX del citado modelo. El entrenamiento es un full fine-tune desde `pi05_base`, no un ajuste de parámetros eficiente, aplicado sobre la receta DROID de posiciones articulares conjuntas (joint-position). El régimen "cent" entrena de forma centralizada sobre la unión de los datos de 8 clientes, con batch 256 y el mismo conjunto de muestras que la variante FedAvg, lo que garantiza una comparación directa entre ambos regímenes.

El número total de tokens de entrenamiento, la composición exacta del dataset, y si se aplicaron etapas de RLHF, DPO u otras técnicas de alineación no se indican en la información disponible. El artefacto publicado incluye las estadísticas de normalización (`norm_stats.json`), necesarias para la inferencia con la receta DROID, y corresponde a la ronda 50 del entrenamiento.

## Capacidades

- Control robótico de manipulación: genera acciones de posición articular de extremo a extremo a partir de entradas visuales y de instrucciones en lenguaje (paradigma vision-language-action).
- Ajuste específico para el robot DROID con la receta de posiciones articulares conjuntas (`pi05_droid_jointpos`).
- Servicio mediante el protocolo websocket de openpi, lo que permite desacoplar la inferencia (servidor) de la ejecución en el robot (cliente).
- Compatibilidad con el cliente de robot DROID (`examples/droid/droid_jointpos_main.py`) y con RoboLab (`--policy pi05`) para evaluación en simulación.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso general: no disponibles (el modelo está orientado a control robótico).
- Capacidades multilingües: no disponible.
- Capacidades especiales adicionales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Línea base centralizada en investigación federada: sirve como punto de referencia para medir cuánta degradación introduce el entrenamiento federado frente al entrenamiento centralizado sobre los mismos datos y el mismo batch.
- Manipulación robótica con el robot DROID: el checkpoint se puede servir con el cliente `droid_jointpos_main.py` para ejecutar políticas de posiciones articulares en tareas reales.
- Evaluación en simulación con RoboLab: permite reproducir episodios de benchmark usando `--policy pi05` antes de desplegar en hardware físico.
- Reproducción de experimentos: al incluir configuración, estadísticas de normalización y log, facilita reproducir el entrenamiento y auditar las condiciones del régimen centralizado.
- Punto de partida para nuevos fine-tunes: al derivar de `pi05_base` con la receta DROID, puede reutilizarse como inicialización para dominios o tareas específicas de manipulación.
- Investigación sobre compartición de datos en robótica: ayuda a estudiar el coste/beneficio de centralizar datos de 8 clientes frente a mantenerlos federados.
- Validación de infraestructura de servicio: la integración con el protocolo websocket de openpi permite probar arquitecturas de servidor de políticas para flotas de robots.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (la model card no indica el tamaño del modelo ni los requisitos de memoria).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: servidor websocket de openpi (`scripts/serve_openpi_websocket.py`), cliente de robot DROID (`examples/droid/droid_jointpos_main.py`) y RoboLab (`--policy pi05`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo VLA.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Relación | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| droid8_pi05_cent (este) | Régimen centralizado sobre la unión de 8 clientes, batch 256 | no disponible | no disponible | Apache 2.0 | Checkpoint público en HuggingFace |
| droid8_pi05 (variante FedAvg) | Mismo dataset y muestras, entrenamiento federado | no disponible | no disponible | no disponible | Referenciada en la model card; identificador exacto no disponible |
| pi05_base | Modelo base del que parte el fine-tune | no disponible | no disponible | no disponible | Repositorio openpi |

No se dispone de datos de rendimiento comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigación con 0 descargas y 0 "likes" en el momento de la consulta; no hay evidencia pública de uso en producción.
- No se publican resultados de benchmarks, por lo que no es posible cuantificar su rendimiento frente a alternativas.
- El modelo está especializado en control robótico DROID con posiciones articulares; no es un modelo de propósito general para texto, código o conversación.
- La ausencia de información sobre sesgos, idiomas y composición del dataset impide evaluar riesgos de alucinación o de comportamiento fuera de distribución.
- Las especificaciones de tamaño, contexto y cuantización no están documentadas, lo que dificulta planificar el despliegue.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse por separado la licencia de los datos subyacentes (dataset `DecentVLA/droid8_openpi`) y del modelo base `pi05_base`.
- En producción robótica, cualquier política entrenada con estos datos requiere validación de seguridad y supervisión humana antes de operar sobre hardware real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DecentVLA/droid8_pi05_cent
- Dataset asociado: https://huggingface.co/datasets/DecentVLA/droid8_openpi
- Implementación openpi (referenciada en la model card para el servicio websocket y los clientes de robot DROID y RoboLab).
