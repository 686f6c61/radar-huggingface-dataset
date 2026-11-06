# dddddsds31341/Long-WAM-Nesting-Doll-Unclipped-30k-Step-15000

## Resumen

Long-WAM-Nesting-Doll-Unclipped-30k-Step-15000 es un checkpoint de inferencia derivado del modelo base Efficient-Large-Model/Long-WAM-YAM, afinado por el usuario dddddsds31341 sobre el conjunto de datos yuyingyinya/nesting_doll. Se trata de un modelo de política robótica (pipeline `robotics`) orientado a una única tarea de manipulación: apilar muñecas rusas (nesting dolls) introduciendo cada muñeca pequeña dentro de la siguiente hasta completar el conjunto. El checkpoint corresponde al paso de optimización 15.000 de una ejecución de 30.000 pasos, y es una ejecución independiente de las publicaciones previas nombradas por época.

El modelo se inicializa desde Long-WAM-YAM y se entrena con 100 demostraciones y 164.571 fotogramas, empleando cuatro GPU A100, batch global de 48, BF16 y DeepSpeed ZeRO-1. La representación de acciones es de 14 dimensiones absolutas (6 articulaciones + pinza del brazo izquierdo, seguidas de 6 articulaciones + pinza del brazo derecho) en las unidades originales de la pinza, con normalización z-score específica de la tarea y sin recorte de valores.

El repositorio (12 GB) contiene únicamente pesos de inferencia (`model.pt`), configuración, estadísticas del dataset y el código SIP preservado. No se declara ninguna tasa de éxito ni rendimiento en held-out, y la licencia es "other" heredada del modelo base, por lo que su uso comercial requiere revisar los términos de Long-WAM-YAM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Long-WAM (política robótica basada en el modelo base Long-WAM-YAM; detalles internos no disponibles) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (historial de P48 fotogramas según la model card) |
| Tipos de cuantización | no disponible (checkpoint en BF16) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | other (heredada de Efficient-Large-Model/Long-WAM-YAM) |
| Formato de pesos | `model.pt` (PyTorch) |
| Entradas | Cámaras RGB: top_head, hand_left, hand_right; resolución 384×320 |
| Salidas | 14D absolutas (6 articulaciones + pinza izquierda, 6 articulaciones + pinza derecha) |
| Chunk de acción | 32 pasos |
| Dataset de entrenamiento | yuyingyinya/nesting_doll (100 demostraciones, 164.571 fotogramas) |
| Paso de optimización | 15.000 de 30.000 |

## Arquitectura y entrenamiento

El modelo parte de Long-WAM-YAM y se afina sobre una tarea concreta de manipulación bimanual. La model card no detalla la arquitectura interna (tipo de transformer, mecanismo de atención o componentes del world model), por lo que no es posible describirla con precisión. Sí se especifica que requiere por separado los assets del VAE Wan2.2, el codificador de texto UMT5 y el tokenizador, lo que sugiere un pipeline de difusión o world-model condicionado por texto e imágenes.

El entrenamiento se realizó con cuatro A100, batch de 12 por GPU y acumulación de gradientes 1 (batch global 48), tasa de aprendizaje constante de 1e-05, optimizador AdamW con weight decay 0.01, semilla 42, precisión BF16 y DeepSpeed ZeRO-1. La normalización es z-score específica de la tarea sin recorte, y el checkpoint incluye `dataset_stats.json` con las estadísticas exactas de esta ejecución. El checkpoint no contiene estado de optimizador, scheduler ni RNG, por lo que no permite reanudar el entrenamiento de forma exacta.

## Capacidades

- Generación de trayectorias de acción bimanual de 14 dimensiones a partir de instrucción textual e imágenes RGB de tres cámaras.
- Control de chunk de acción de 32 pasos con historial de P48 fotogramas.
- Ejecución de una tarea específica de manipulación: anidar muñecas rusas de menor a mayor.
- Condicionamiento por instrucción de tarea en lenguaje natural ("Nest the Russian dolls from smallest to largest...").
- Integración con el código SIP (`longwam.inference.load_run_config` y `load_model`) para carga del checkpoint.
- No se declaran capacidades de tool calling, agentes, multilingüismo general, visión general, audio ni modo thinking.

## Casos de uso

- Investigación en manipulación bimanual: reproducir el experimento de anidado de muñecas rusas como referencia para comparar políticas robóticas sobre el mismo dataset.
- Evaluación de checkpoints intermedios: comparar el paso 15.000 con el paso 20.000 publicado por el mismo autor para estudiar la evolución del entrenamiento.
- Base para fine-tuning en tareas de inserción precisa: la representación 14D con pinzas y la normalización sin recorte pueden servir de punto de partida para tareas de ensamblaje.
- Estudio de normalización z-score sin clipping: el checkpoint permite analizar el efecto de no recortar valores normalizados en políticas robóticas.
- Reproducibilidad de pipelines SIP: el `code.zip` y `requirements-sip.txt` permiten reconstruir el entorno de inferencia en otra máquina adaptando rutas.
- Docencia y divulgación: ejemplo concreto de fine-tuning de un world model robótico sobre un dataset pequeño (100 demostraciones) con infraestructura de 4 A100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reclama ninguna tasa de éxito del robot ni rendimiento en held-out.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 12 GB, lo que da una cota inferior aproximada para cargar los pesos en BF16.
- GPU recomendadas: el entrenamiento usó 4× A100; para inferencia se requiere al menos una GPU con memoria suficiente para los pesos más los assets del VAE Wan2.2 y el codificador UMT5 (no cuantificados en la información disponible).
- Compatibilidad con GPU de consumo: no confirmada; no se especifica si cabe en RTX 4090 u otras consumer.
- Opciones de despliegue: código SIP incluido en `code.zip` (`longwam.inference.load_run_config`, `load_model`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Dataset | Paso | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Long-WAM-Nesting-Doll-Unclipped-30k-Step-15000 | Long-WAM-YAM | nesting_doll (100 demos) | 15.000 | other | Hugging Face |
| Long-WAM-Nesting-Doll-Unclipped-Step-20000 | Long-WAM-YAM | nesting_doll | 20.000 | other | Hugging Face |
| Efficient-Large-Model/Long-WAM-YAM | — | no disponible | — | other | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos checkpoints.

## Limitaciones y advertencias

- Modelo de tarea única: solo se ha entrenado para anidar muñecas rusas; no generaliza a otras tareas sin fine-tuning.
- Sin métricas de éxito: el autor no declara tasa de éxito ni evaluación en held-out, por lo que no hay evidencia publicada de su rendimiento real.
- Checkpoint de inferencia únicamente: no contiene estado de optimizador, scheduler ni RNG; no permite reanudar el entrenamiento de forma exacta.
- Dependencias externas obligatorias: requiere assets separados de Wan2.2 VAE, UMT5 y tokenizador, no incluidos en el repositorio.
- Rutas codificadas: la configuración conserva rutas SIP del entorno original; es necesario adaptarlas a la máquina destino.
- Normalización sin recorte: los valores normalizados no se recortan, lo que puede producir acciones fuera de rango en inferencia; debe usarse junto con las estadísticas incluidas.
- Licencia "other": uso comercial sujeto a los términos de Efficient-Large-Model/Long-WAM-YAM; revisar antes de cualquier despliegue productivo.
- Sesgos y alucinación: no aplica en el sentido de modelos de lenguaje, pero el modelo puede generar trayectorias no válidas fuera de la distribución del dataset.
- Idiomas: no disponible; el condicionamiento textual se limita a la instrucción de tarea en inglés.

## Enlaces

- Hugging Face: https://huggingface.co/dddddsds31341/Long-WAM-Nesting-Doll-Unclipped-30k-Step-15000
- Checkpoint paso 20.000 del mismo autor: https://huggingface.co/dddddsds31341/Long-WAM-Nesting-Doll-Unclipped-Step-20000
- Modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Licencia del modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Dataset: yuyingyinya/nesting_doll (revisión ae8a879c9a635d3c666aba58a4d9ac996225edb8)
