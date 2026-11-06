# dddddsds31341/Long-WAM-Wash-Cup-Epoch-9

## Resumen

Long-WAM Wash Cup — Epoch 9 es un checkpoint de evaluación de un ajuste fino independiente del modelo base `Efficient-Large-Model/Long-WAM-YAM`, publicado por el usuario `dddddsds31341`. Se trata de un modelo de robótica bimano (bimanual) orientado a una tarea concreta: sostener y levantar una taza con una pinza mientras la otra limpia su interior con un cepillo de botella, devolver el cepillo y colocar la taza boca abajo en el escurridor. El checkpoint corresponde a la época 9 de 10 (paso de optimizador 13077 de un objetivo de 14530) del entrenamiento sobre el conjunto de datos `yuyingyinya/wash_cup`.

El modelo pertenece a la familia Long-WAM, que combina un modelo de vídeo conjunto (video/action model) con un codificador de propriocepción, y se apoya en componentes auxiliares como el VAE Wan2.2 y el codificador de texto UMT5. La relevancia de esta ficha es acotada: no es un modelo de propósito general ni un checkpoint listo para producción, sino un artefacto de investigación para evaluación de políticas robóticas en una tarea específica.

El repositorio ocupa 12,0 GB y contiene pesos en formato `model.pt` (PyTorch), configuración resuelta, estadísticas de normalización y código de inferencia empaquetado. No se han publicado resultados de benchmarks ni tasas de éxito en bucle cerrado, por lo que su utilidad principal es la reproducibilidad de la evaluación, no la comparación de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo conjunto de vídeo y acción (video/action model) con codificador de propriocepción; familia Long-WAM |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (historial de P48 fotogramas, 32 pasos de acción por chunk) |
| Tipos de cuantizacion | no disponible (pesos almacenados en el dtype del paso de entrenamiento, BF16 durante el entrenamiento) |
| Idiomas soportados | no disponible (modelo orientado a robótica; el texto se procesa mediante el codificador UMT5) |
| Licencia | other (se remite a la licencia del modelo base `Efficient-Large-Model/Long-WAM-YAM`) |
| Formato de pesos | `model.pt` (PyTorch); no es un modelo `from_pretrained` de Transformers |

## Arquitectura y entrenamiento

La arquitectura combina un modelo conjunto de vídeo y acción con un codificador de propriocepción. El entrenamiento parte del modelo base `Efficient-Large-Model/Long-WAM-YAM` y se ajusta de forma independiente sobre la tarea de lavado de taza; no continúa el ajuste fino de otra tarea. El conjunto de datos `yuyingyinya/wash_cup` (revisión `dcf90aa38d98e9b6c9f71afe0cfeeb3f50ed74cb`) contiene 100 demostraciones con 69.728 fotogramas a 30 Hz, y se usan todas para entrenamiento.

El setup de entrenamiento emplea cuatro GPUs, tamaño de lote 12 por GPU con acumulación de gradiente 1 (lote global 48), tasa de aprendizaje constante de `1e-5`, AdamW con weight decay 0,01, BF16 y DeepSpeed ZeRO-1. Se realizan 1.453 actualizaciones de optimizador por época, con un objetivo total de 14.530 actualizaciones. Las acciones son objetivos articulares absolutos de 14 dimensiones (6 articulaciones izquierdas + pinza, 6 derechas + pinza) con unidades originales de pinza, normalizadas mediante estadísticas z-score específicas de la tarea y recorte al rango `[-5, 5]`. Se utilizan tres cámaras RGB (`top_head`, `hand_left`, `hand_right`) con disposición de vídeo procesado de 384×320, historial P48 y chunks de acción de 32 pasos. El código de entrenamiento corresponde a una release SIP v29 basada en `NVlabs/LongLive@cfa4e91eec59429d583326500bf5535c9ce6eec7` con los cambios SIP incluidos.

## Capacidades

- Generación de acciones robóticas de 14 dimensiones (pares articulación/pinza izquierda y derecha) para control bimano.
- Percepción visual multi-cámara a partir de tres flujos RGB (`top_head`, `hand_left`, `hand_right`) con resolución procesada de 384×320.
- Procesamiento de instrucciones de tarea en lenguaje natural mediante el codificador de texto UMT5.
- Integración de propriocepción a través de un codificador dedicado.
- Predicción de chunks de acción de 32 pasos con historial de P48 fotogramas.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni capacidades multilingües generales.

## Casos de uso

- Evaluación de políticas robóticas en laboratorio: el checkpoint permite reproducir la evaluación de la tarea de lavado de taza cargando `model.pt` con `expected_step=13077` y `strict=True` mediante `longwam.inference.load_run_config` y `load_model`.
- Reproducción de experimentos de ajuste fino: al incluir `config.yaml`, `dataset_stats.json` y `code.zip`, sirve para replicar el pipeline SIP v29 sobre el conjunto `yuyingyinya/wash_cup`.
- Investigación en manipulación bimano: útil para estudiar coordinación entre dos pinzas en una secuencia de sostener, limpiar y colocar un objeto.
- Desarrollo de adaptadores de robot: el checkpoint exige un adaptador de robot compatible y las convenciones 14D originales, por lo que sirve como base para validar dichos adaptadores.
- Análisis de normalización y preprocesado: `dataset_stats.json` proporciona las estadísticas z-score específicas de la tarea necesarias para el preprocesado y la desnormalización de acciones.
- Docencia y formación en robótica de imitación: como ejemplo completo de un run de ajuste fino con configuración resuelta, estadísticas y código empaquetado.
- Comparación entre épocas: junto con otros checkpoints de la misma serie (por ejemplo, Epoch 5), permite estudiar la evolución del entrenamiento a lo largo de las épocas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el checkpoint ha pasado comprobaciones de carga de ficheros en CPU, pero no reporta tasa de éxito en bucle cerrado con robot ni resultados de validación en held-out. Se advierte de que la pérdida de entrenamiento no es una métrica de éxito de la tarea robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 12,0 GB, lo que da una cota inferior orientativa del espacio de almacenamiento de pesos.
- GPU recomendadas: no disponibles en la información proporcionada; el entrenamiento se realizó con cuatro GPUs (modelo no especificado) con BF16 y DeepSpeed ZeRO-1.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: no se documenta vLLM, llama.cpp, Ollama ni TGI; el despliegue requiere el checkout de `Long-WAM` incluido en `code.zip`, con `LONGWAM_MODEL_ROOT` configurado y los activos separados del VAE Wan2.2, el codificador de texto UMT5 y el tokenizador.
- Latencia y throughput: no disponibles.
- Nota: el checkpoint no es un modelo autónomo de Transformers `from_pretrained`; requiere un adaptador de robot compatible y las convenciones 14D originales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Long-WAM Wash Cup — Epoch 9 (este) | no disponible | no disponible | Lavado de taza bimano | other | Hugging Face, 18 descargas |
| Long-WAM Wash Cup — Epoch 5 | no disponible | no disponible | Lavado de taza bimano | other | Hugging Face |
| Efficient-Large-Model/Long-WAM-YAM (base) | no disponible | no disponible | Modelo base de robótica Long-WAM | other | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos checkpoints; la comparación se limita a la relación de ajuste fino y a la disponibilidad pública.

## Limitaciones y advertencias

- No se reporta tasa de éxito en bucle cerrado ni validación en held-out; la pérdida de entrenamiento no es una métrica de éxito de la tarea.
- El fichero es de solo evaluación: no contiene estado del optimizador ni del scheduler, por lo que no permite continuar el entrenamiento de forma exacta.
- La configuración original conserva rutas de sistema de ficheros SIP; en otra máquina es necesario ajustar `LONGWAM_MODEL_ROOT` y las rutas de datos, estadísticas y caché.
- Requiere activos externos no incluidos: VAE Wan2.2, codificador de texto UMT5 y tokenizador.
- No es un modelo `from_pretrained` de Transformers; la carga debe hacerse mediante la API de `Long-WAM` con `expected_step=13077` y `strict=True`.
- Modelo altamente específico de una única tarea (lavado de taza); no generaliza a otras tareas sin ajuste fino adicional.
- Licencia `other`: es necesario consultar la licencia del modelo base `Efficient-Large-Model/Long-WAM-YAM` antes de cualquier uso comercial.
- No se documentan sesgos conocidos ni riesgos de alucinación en el sentido de modelos de lenguaje; el riesgo principal es el fallo de la política en el mundo real.
- Idiomas soportados no disponibles; el uso de lenguaje natural depende del codificador UMT5 y de las instrucciones de tarea empleadas en el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/Long-WAM-Wash-Cup-Epoch-9
- Checkpoint Epoch 5 de la misma serie: https://huggingface.co/dddddsds31341/Long-WAM-Wash-Cup-Epoch-5
- Modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Registro de entrenamiento (W&B): https://forge.coreweave.com/wandb/bofang/long-wam/runs/3n9pgoq2
- Repositorio base del código: https://github.com/NVlabs/LongLive (commit `cfa4e91eec59429d583326500bf5535c9ce6eec7`)
- Conjunto de datos: https://huggingface.co/datasets/yuyingyinya/wash_cup
- Búsqueda de modelos con etiqueta `wash-cup`: https://huggingface.co/models?other=wash-cup
