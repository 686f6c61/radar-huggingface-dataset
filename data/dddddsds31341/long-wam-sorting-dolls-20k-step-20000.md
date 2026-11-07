# dddddsds31341/Long-WAM-Sorting-Dolls-20k-Step-20000

## Resumen

Long-WAM Sorting Dolls — step 20.000 es un checkpoint de inferencia derivado por fine-tuning del modelo base Efficient-Large-Model/Long-WAM-YAM, publicado por el usuario dddddsds31341 en Hugging Face. No se trata de un modelo de lenguaje generalista, sino de un modelo de política robótica (pipeline `robotics`) especializado en una única tarea de manipulación: colocar cinco muñecas rusas en fila, de pie y ordenadas de menor a mayor de izquierda a derecha. El repositorio contiene únicamente los pesos de evaluación en el paso de optimizador 20.000, no un estado completo de reanudación de entrenamiento.

El checkpoint se ha entrenado con 100 demostraciones y 168.126 fotogramas del dataset `dddddsds31341/sorting-dolls-lerobot`, partiendo de los pesos de Long-WAM-YAM. La arquitectura subyacente corresponde a la familia Long-WAM (World-Action Model) de Efficient-Large-Model, que combina un codificador de vídeo basado en el VAE de Wan2.2, un codificador de texto UMT5 y un cabezal de acciones que predice chunks de 32 pasos en un espacio de 14 dimensiones (6 articulaciones + pinza por cada brazo). El repositorio pesa 12,0 GB y se distribuye en formato PyTorch (`model.pt`), no en safetensors ni GGUF.

Su relevancia es acotada pero significativa para la comunidad de robótica de manipulación: documenta de forma reproducible un pipeline completo de fine-tuning de un modelo de acción mundial sobre un conjunto LeRobot, con estadísticas de normalización z-score específicas de la tarea, configuración de cámaras (top_head, hand_left, hand_right) a 384×320 y un paquete de código de evaluación versionado. Es, por tanto, material de referencia para investigadores que replican experimentos de imitación a gran escala, no un modelo listo para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Long-WAM (World-Action Model) sobre transformer con VAE de vídeo Wan2.2 y codificador de texto UMT5; cabezal de acciones con chunk de 32 pasos |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en tokens; historial de observación P48 (48 pasos) y chunk de acción de 32 pasos |
| Tipos de cuantizacion | no disponible (pesos en BF16 según el entrenamiento; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el modelo consume instrucciones de texto vía UMT5; la única instrucción documentada está en inglés) |
| Licencia | other (hereda las restricciones del modelo base Long-WAM-YAM; consultar el repositorio base) |
| Formato de pesos | PyTorch (`model.pt`), más `config.yaml` y `dataset_stats.json` |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint Efficient-Large-Model/Long-WAM-YAM, un modelo de acción mundial que integra un VAE de vídeo (Wan2.2) para la observación visual, un codificador de texto UMT5 con su tokenizador para la instrucción de tarea y un cabezal que emite objetivos absolutos de articulación y pinza en 14 dimensiones: 6 articulaciones más pinza del brazo izquierdo, seguidas de 6 articulaciones más pinza del brazo derecho. La observación se organiza con tres cámaras (top_head, hand_left, hand_right) procesadas a 384×320, un historial P48 y un chunk de acción de 32 pasos. La normalización es z-score específica de la tarea, sin recorte de los valores normalizados, y debe aplicarse con las estadísticas incluidas en este mismo run (`dataset_stats.json`).

El entrenamiento se realizó sobre 100 demostraciones y 168.126 fotogramas del dataset `sorting-dolls-lerobot` (revisión Git ffca92aece12b85daac426b1b0474065e1ecf165), con cuatro GPU A100, batch de 12 por GPU y acumulación 1 (batch global 48), tasa de aprendizaje constante de 1e-5, optimizador AdamW con weight decay 0,01, semilla 42 y precisión BF16 con ZeRO-1. La instrucción de tarea es «Arrange the five Russian dolls upright in a row from smallest to largest, from left to right». No se documenta RLHF, DPO ni ninguna etapa de alineación; el paradigma es imitación supervisada sobre demostraciones. El paquete `code.zip` (long-wam-sip-sorting-eval-20261105-v47-code.zip) mantiene el código de entrenamiento e inferencia sin cambios respecto a la versión v46; la v47 solo añade un script de lectura completa de bytes del archivo y documentación.

## Capacidades

- Generación de acciones robóticas de manipulación bimanual en 14 dimensiones (6 articulaciones + pinza por brazo) a partir de observaciones visuales de tres cámaras.
- Ejecución condicionada por instrucción en lenguaje natural a través del codificador UMT5.
- Predicción de chunks de acción de 32 pasos con historial de observación de 48 pasos (P48), lo que permite planificación a corto plazo dentro de una política reactiva.
- Percepción visual multi-cámara a resolución 384×320 (vista cenital y vistas de ambas manos).
- Tarea especializada: ordenación de cinco muñecas rusas de menor a mayor en fila, en posición vertical.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües generales, modo thinking, audio ni visión de propósito general.

## Casos de uso

- Replicación de experimentos de imitación en robótica: el checkpoint sirve como referencia para reproducir el entrenamiento de Long-WAM sobre el dataset `sorting-dolls-lerobot`, con configuración y estadísticas exactas del run, lo que permite comparar curvas de aprendizaje y variantes de normalización.
- Evaluación de políticas bimanuales en laboratorio: con las tres cámaras y el chunk de 32 pasos, el modelo puede desplegarse en un banco de pruebas físico o simulado para medir la ejecución de la tarea de ordenación de muñecas, siempre que se respete la normalización z-score incluida.
- Estudio de normalización sin recorte: al usar z-score sin clipping, el checkpoint es útil para analizar el efecto de valores atípicos en las acciones predichas y compararlo con la variante `Nesting-Doll-Unclipped-30k` publicada por el mismo autor.
- Base para fine-tuning en tareas de ordenación similares: partiendo de este checkpoint, un equipo puede adaptar la política a otros objetos alineables (bloques, piezas, utensilios) con un conjunto reducido de demostraciones LeRobot.
- Docencia y formación en robótica de manipulación: el paquete de código y la configuración documentada permiten montar prácticas guiadas sobre carga de modelos, estadísticas de dataset y evaluación de políticas.
- Integración en pipelines LeRobot: al proceder de un dataset LeRobot y documentar el formato de acciones y cámaras, el checkpoint puede incorporarse a flujos de evaluación existentes en ese ecosistema, adaptando las rutas SIP de assets (VAE Wan2.2, UMT5 y tokenizador) a la máquina de destino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclama ninguna tasa de éxito del robot ni rendimiento en conjuntos retenidos («No robot success rate or held-out performance is claimed»).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio pesa 12,0 GB, por lo que los pesos en BF16 requieren al menos ese orden de magnitud, más la memoria del VAE Wan2.2 y del codificador UMT5, que se distribuyen por separado.
- GPU recomendadas: el entrenamiento se realizó en cuatro A100; para inferencia se recomienda una GPU con al menos 24-40 GB de VRAM (A100, L40S, RTX 6000 Ada) para acomodar pesos y activaciones de vídeo, aunque no se documenta una cifra oficial.
- Cabeza en GPU de consumo: no confirmado; una RTX 4090 de 24 GB podría ser insuficiente si se suman pesos, VAE y codificador de texto, y no hay datos publicados al respecto.
- Opciones de despliegue: el autor proporciona código propio en `code.zip` con `longwam.inference.load_run_config` y `load_model`, requiriendo `expected_step=20000` y rutas SIP adaptadas. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de modelo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Paso / variante | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Long-WAM Sorting Dolls — step 20.000 (este) | Ordenar cinco muñecas rusas en fila | 20.000 | sorting-dolls-lerobot (100 demos, 168.126 frames) | other | Pública en HF |
| Long-WAM Nesting Doll-Unclipped-30k — step 20.000 | Encajar muñecas rusas unas dentro de otras | 20.000 | nesting-doll-unclipped-30k | other | Pública en HF |
| Long-WAM Nesting Doll-Epoch-1 | Encajar muñecas rusas unas dentro de otras | Época 1 | no disponible | other | Pública en HF |
| Efficient-Large-Model/Long-WAM-YAM | Modelo base de acción mundial | no aplica | no disponible | other | Pública en HF |

Los tres primeros comparten autor y familia arquitectónica, pero difieren en la tarea (ordenar frente a encajar) y en el régimen de normalización; no se dispone de métricas comparativas de rendimiento entre ellos.

## Limitaciones y advertencias

- El checkpoint es de evaluación: no contiene estado completo de reanudación de entrenamiento (sin optimizador, scheduler ni RNG), por lo que no sirve para continuar el entrenamiento desde el paso 20.000.
- No se reclama tasa de éxito ni rendimiento en conjuntos retenidos; cualquier uso en producción requiere validación propia.
- La política está especializada en una única tarea y un único conjunto de objetos (cinco muñecas rusas); su generalización a otros objetos o disposiciones no está documentada.
- La normalización z-score es específica del run y sin recorte; usar estadísticas distintas o aplicar clipping altera el comportamiento de las acciones predichas.
- Requiere assets externos no incluidos (VAE Wan2.2, UMT5 y tokenizador) y rutas SIP adaptadas a la máquina de evaluación; el código excluye datasets, checkpoints, entornos, cachés, logs y secretos.
- Licencia `other` heredada del modelo base Long-WAM-YAM: es imprescindible revisar las condiciones del repositorio base antes de cualquier uso comercial.
- Riesgo de alucinación en el sentido de acciones no válidas o inconsistentes fuera de la distribución de demostraciones; no hay evaluación publicada de robustez ante perturbaciones visuales.
- Idiomas soportados no documentados; la única instrucción validada está en inglés.
- El repositorio tiene un volumen de descargas muy bajo (18) y ningún «like», lo que sugiere escasa validación externa por parte de la comunidad.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/dddddsds31341/Long-WAM-Sorting-Dolls-20k-Step-20000
- Modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Checkpoint relacionado (encajar muñecas, sin recorte, 30k): https://huggingface.co/dddddsds31341/Long-WAM-Nesting-Doll-Unclipped-30k-Step-20000
- Checkpoint relacionado (encajar muñecas, época 1): https://huggingface.co/dddddsds31341/Long-WAM-Nesting-Doll-Epoch-1
- Dataset de entrenamiento: https://huggingface.co/datasets/dddddsds31341/sorting-dolls-lerobot
- Licencia del modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM (sección de licencia)
