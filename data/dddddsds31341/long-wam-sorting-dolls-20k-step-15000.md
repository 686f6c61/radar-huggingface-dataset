# dddddsds31341/Long-WAM-Sorting-Dolls-20k-Step-15000

## Resumen

Long-WAM Sorting Dolls — step 15.000 es un checkpoint de inferencia para robótica, derivado por ajuste fino del modelo base Efficient-Large-Model/Long-WAM-YAM. Lo publica el usuario dddddsds31341 y está orientado a una única tarea manipulativa: colocar cinco muñecas rusas en fila, de pie y ordenadas de menor a mayor de izquierda a derecha. El modelo se distribuye como pesos de evaluación en formato PyTorch (`model.pt`), no como un paquete de propósito general, y su pipeline declarado en Hugging Face es `robotics`.

El repositorio ocupa 12,0 GB e incluye, junto a los pesos, un `config.yaml`, un `dataset_stats.json` copiado de la ejecución exacta, un fichero de requisitos de paquetes SIP y un `code.zip` con el código de entrenamiento e inferencia. El autor advierte explícitamente que el checkpoint no contiene estado completo para reanudar entrenamiento y que no se reclama ninguna tasa de éxito en robot ni rendimiento sobre datos reservados.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación reproducible para una tarea concreta, con instrucción de tarea fija, normalización z-score específica y dependencia de assets externos (VAE Wan2.2, codificador de texto UMT5 y tokenizer). No es un modelo de lenguaje general ni un sistema listo para producción; su interés está en documentar el pipeline de evaluación y las condiciones exactas de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Long-WAM-YAM; detalles de arquitectura no publicados en la información disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (historial de observaciones P48 y chunk de acciones de 32 pasos, según la model card) |
| Tipos de cuantizacion | no disponible (pesos en `model.pt` con `torch_dtype` declarado; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (el modelo no procesa lenguaje natural de forma general; recibe una instrucción de tarea fija en inglés) |
| Licencia | other (remite a la licencia del modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM) |
| Formato de pesos | PyTorch (`model.pt`), más `config.yaml` y `dataset_stats.json` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Long-WAM-YAM; el checkpoint se presenta como un ajuste fino de ese modelo para control robótico. Lo que sí está documentado es el interfaz de control: el modelo produce objetivos absolutos de 14 dimensiones (articulación y pinza), con 6 articulaciones más pinza para el brazo izquierdo y 6 más pinza para el derecho, en unidades originales de la pinza. La entrada visual procede de tres cámaras (`top_head`, `hand_left`, `hand_right`) con layout procesado de 384 x 320, y el modelo consume un historial P48 junto a un chunk de acciones de 32 pasos. La normalización es z-score específica de la tarea, sin recorte de los valores normalizados.

El entrenamiento se inicializó desde Efficient-Large-Model/Long-WAM-YAM y usó el dataset `dddddsds31341/sorting-dolls-lerobot` en la revisión Git `ffca92aece12b85daac426b1b0474065e1ecf165`, compuesto por 100 demostraciones y 168.126 fotogramas. Se ejecutó sobre cuatro GPU A100 con batch de 12 por GPU, acumulación 1 y batch global 48, LR constante de 1e-5, AdamW con weight decay 0,01, semilla 42, BF16 y ZeRO-1. El checkpoint corresponde al paso de optimizador 15.000. La instrucción de tarea es fija: "Arrange the five Russian dolls upright in a row from smallest to largest, from left to right." No se documentan fases de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Control robótico para una tarea de ordenación: genera comandos de articulación y pinza para colocar cinco muñecas rusas en fila de menor a mayor.
- Salida de acciones en espacio absoluto de 14 dimensiones (brazo izquierdo y derecho, con pinzas).
- Predicción por chunks de 32 pasos de acción a partir de un historial P48.
- Fusión de tres vistas de cámara (`top_head`, `hand_left`, `hand_right`) a resolución procesada de 384 x 320.
- Condicionamiento por instrucción de tarea en inglés, fijada en la model card.
- Carga reproducible mediante `longwam.inference.load_run_config` y `load_model` con `expected_step=15000`.
- No se documentan tool calling, function calling, razonamiento multi-paso genérico, capacidades multilingües, visión general, audio ni modo de pensamiento.

## Casos de uso

- Reproducción de un experimento de imitación en robótica: cargar `model.pt` con el código incluido y las estadísticas del run para replicar la política entrenada sobre el dataset de muñecas rusas y comparar resultados con otros checkpoints del mismo autor.
- Evaluación comparativa de checkpoints por paso de optimizador: este artefacto (paso 15.000) puede contrastarse con otros pasos publicados por el mismo autor para estudiar la evolución de la política durante el entrenamiento.
- Banco de pruebas de pipelines de inferencia robótica: sirve para validar la integración de `longwam.inference` con assets externos (VAE Wan2.2, UMT5 y tokenizer) y ajustar rutas de modelo, estadísticas y caché en una máquina de evaluación.
- Estudio de normalización z-score sin recorte: el `dataset_stats.json` copiado del run permite analizar cómo afecta la normalización específica de tarea a las salidas de articulaciones y pinzas.
- Docencia e investigación en manipulación con múltiples cámaras: útil para ilustrar el diseño de observaciones P48, chunks de acción de 32 pasos y control bimanual de 14 dimensiones.
- Base para ajuste fino en tareas de ordenación similares: al partir de Long-WAM-YAM y usar un dataset LeRobot, el flujo de entrenamiento documentado (A100, BF16, ZeRO-1, AdamW) puede adaptarse a otras tareas de clasificación y colocación de objetos.
- Verificación de infraestructura de entrenamiento: los hiperparámetros registrados (batch global 48, LR 1e-5, semilla 42) permiten auditar configuraciones de reproducción en clústeres con cuatro A100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclama ninguna tasa de éxito en robot ni rendimiento sobre datos reservados.

## Requisitos de hardware

- El entrenamiento documentado se realizó en cuatro GPU A100; no se especifica VRAM exacta por GPU.
- VRAM estimada para inferencia: no disponible. El repositorio ocupa 12,0 GB, pero ese tamaño incluye pesos, configuración, estadísticas y código, no solo el checkpoint de inferencia.
- GPU recomendadas: no disponibles de forma explícita; el único hardware citado en la información es A100 (entrenamiento).
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga mediante el código incluido en `code.zip` (`longwam.inference.load_run_config` y `load_model`). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no encajan con un checkpoint de política robótica.
- Dependencias de despliegue: assets separados de VAE Wan2.2, codificador de texto UMT5 y tokenizer; requisitos de paquetes SIP en `requirements-sip.txt`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Paso de optimizador | Tarea | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Long-WAM Sorting Dolls — step 15.000 (este modelo) | 15.000 | Ordenar cinco muñecas rusas en fila, de menor a mayor | sorting-dolls-lerobot (100 demostraciones, 168.126 fotogramas) | other (hereda la del base) | Hugging Face, 18 descargas |
| Long-WAM-Nesting-Doll-Unclipped-30k-Step-15000 | 15.000 | Encajar muñecas rusas de menor a mayor, introduciendo cada una en la siguiente | nesting-doll-unclipped-30k-20261103-020414 (run separado) | other (hereda la del base) | Hugging Face |
| Long-WAM-Nesting-Doll-Unclipped-30k-Step-20000 | 20.000 | Encajar muñecas rusas de menor a mayor | nesting-doll-unclipped-30k-20261103-020414 (run separado) | other (hereda la del base) | Hugging Face |

Los tres modelos comparten el modelo base Long-WAM-YAM y el mismo autor; difieren en la tarea (ordenar en fila frente a encajar), en el run de entrenamiento y en el paso de optimizador. No hay datos de benchmarks que permitan comparar rendimiento entre ellos.

## Limitaciones y advertencias

- Modelo de tarea única: entrenado exclusivamente para ordenar cinco muñecas rusas en fila; no generaliza a otras tareas sin ajuste fino adicional.
- Instrucción de tarea fija en inglés; no se documenta soporte multilingüe.
- Sin métricas de éxito: el autor no reclama tasa de éxito en robot ni rendimiento sobre datos reservados, por lo que no hay evidencia publicada de calidad de la política.
- Checkpoint de evaluación, no de reanudación: `model.pt` contiene `mot`, `proprio_encoder`, `step` y `torch_dtype`, pero no estado de optimizador, scheduler ni RNG.
- Dependencias externas obligatorias: VAE Wan2.2, codificador de texto UMT5 y tokenizer deben obtenerse por separado; el ZIP excluye datasets, checkpoints, assets de modelo, entornos, cachés, logs y secretos.
- Normalización sensible: z-score específica de tarea sin recorte; usar estadísticas de otro run alteraría las salidas, por lo que hay que emplear el `dataset_stats.json` incluido.
- Licencia "other" heredada del modelo base, con condiciones no detalladas aquí; conviene revisar el enlace de licencia de Efficient-Large-Model/Long-WAM-YAM antes de cualquier uso comercial.
- Riesgo de alucinación en el sentido de salidas de control no verificadas físicamente: al no haber evaluación publicada, las predicciones de articulaciones y pinzas no están validadas en un entorno real por parte del autor.
- Sesgos conocidos: no disponibles; el dataset se limita a 100 demostraciones de una tarea concreta, lo que reduce la diversidad de escenarios.
- Adopción muy baja (18 descargas, 0 likes) y fecha de creación futura respecto al momento de redacción de esta ficha; tratar el artefacto con cautela y verificar su procedencia.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/dddddsds31341/Long-WAM-Sorting-Dolls-20k-Step-15000
- Modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Licencia del modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Checkpoint relacionado (encajar muñecas, paso 15.000): https://huggingface.co/dddddsds31341/Long-WAM-Nesting-Doll-Unclipped-30k-Step-15000
- Checkpoint relacionado (encajar muñecas, paso 20.000): https://huggingface.co/dddddsds31341/Long-WAM-Nesting-Doll-Unclipped-30k-Step-20000
- Dataset citado: dddddsds31341/sorting-dolls-lerobot (revisión `ffca92aece12b85daac426b1b0474065e1ecf165`), sin URL directa en la información disponible
