# dddddsds31341/Long-WAM-Nesting-Doll-Epoch-1

## Resumen

Long-WAM Nesting Doll — Epoch 1 es un checkpoint de evaluación de un ajuste fino independiente del modelo base Efficient-Large-Model/Long-WAM-YAM, orientado a robótica bimanual. Lo publica el usuario dddddsds31341 como pesos intermedios del primer epoch de un entrenamiento de cinco, en el paso de optimizador 3429. El modelo resuelve una tarea concreta de manipulación: anidar muñecas rusas de menor a mayor hasta introducirlas todas en la más grande, a partir de demostraciones teleoperadas registradas a 30 Hz.

Técnicamente se trata de un modelo conjunto de vídeo y acción (joint video/action model) con un codificador de propiocepción, construido sobre la arquitectura Long-WAM y el código SIP. Consume tres cámaras RGB (top_head, hand_left, hand_right) y produce objetivos de articulación absolutos de 14 dimensiones (6 articulaciones y pinza por brazo). El repositorio ocupa 12,0 GB y se distribuye únicamente en formato PyTorch (`model.pt`), sin pesos en safetensors ni GGUF.

Su relevancia es acotada y experimental: no es un modelo de propósito general ni un modelo de lenguaje, sino un artefacto de investigación para reproducir y evaluar políticas robóticas bimanuales. El autor advierte explícitamente de que no se ha medido la tasa de éxito en bucle cerrado ni existe validación sobre un conjunto reservado, por lo que no debe tratarse como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Long-WAM (modelo conjunto de vídeo y acción con codificador de propiocepción), código SIP v22 sobre NVlabs/LongLive |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (historial de vídeo P48 y chunk de acción de 32 pasos) |
| Tipos de cuantización | no disponible (pesos en BF16 durante el entrenamiento) |
| Idiomas soportados | no disponible (modelo robótico, no lingüístico) |
| Licencia | other (se remite a la licencia del modelo base) |
| Formato de pesos | `model.pt` (PyTorch); no es un modelo `from_pretrained` de Transformers |

## Arquitectura y entrenamiento

El modelo es un finetune del checkpoint Efficient-Large-Model/Long-WAM-YAM, no una continuación de otro ajuste fino de tarea. Combina un modelo conjunto de vídeo y acción con un codificador de propiocepción, y depende de activos externos: el VAE de Wan2.2, el codificador de texto UMT5 y su tokenizador. La entrada visual son tres cámaras RGB (`top_head`, `hand_left`, `hand_right`) procesadas a 384×320, con un historial P48 y un chunk de acción de 32 pasos. La salida son objetivos de articulación absolutos de 14 dimensiones con las unidades originales de la pinza, ordenados como 6 articulaciones izquierdas más pinza y 6 articulaciones derechas más pinza.

El entrenamiento usa el dataset `yuyingyinya/nesting_doll` (revisión ae8a879c9a635d3c666aba58a4d9ac996225edb8): 100 demostraciones, 164.571 fotogramas a 30 Hz, todas empleadas para entrenamiento. Se ejecutó sobre cuatro GPU con batch de 12 por GPU y acumulación de gradiente 1 (batch global 48), tasa de aprendizaje constante de 1e-5, AdamW con weight decay 0,01, precisión BF16 y DeepSpeed ZeRO-1. Cada epoch comprende 3429 actualizaciones de optimizador y la ejecución completa apunta a 17.145. Se aplican estadísticas z-score específicas de la tarea y el recorte oficial de valores normalizados en `[-5, 5]`. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de acciones robóticas bimanuales de 14 dimensiones (6 articulaciones y pinza por brazo) a partir de observaciones visuales y de propiocepción.
- Control visuomotor con tres cámaras RGB y contexto temporal de 48 fotogramas de historial.
- Predicción por chunks de 32 pasos de acción, orientada a ejecución en bucle cerrado sobre un adaptador de robot compatible.
- Manipulación bimanual coordinada para una tarea de anidamiento secuencial de objetos.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso simbólico ni agentes de texto.
- No dispone de capacidades multilingües, de visión general, de audio ni de modo de razonamiento explícito.

## Casos de uso

- Reproducción de experimentos de investigación: cargar el checkpoint con `longwam.inference.load_run_config` y `load_model` indicando `expected_step=3429` y `strict=True` para replicar el estado exacto del entrenamiento en el paso 3429.
- Evaluación comparativa de políticas bimanuales: sirve como punto intermedio (epoch 1 de 5) para estudiar la evolución del aprendizaje frente a checkpoints posteriores del mismo run.
- Desarrollo de adaptadores de robot: el checkpoint permite probar la integración con un adaptador compatible y las convenciones 14D originales antes de desplegar un modelo final.
- Estudio de normalización por tarea: `dataset_stats.json` facilita analizar el efecto de las estadísticas z-score y del recorte `[-5, 5]` en la desnormalización de acciones.
- Docencia y formación en robótica de imitación: con 100 demostraciones y una tarea acotada, es un ejemplo manejable para ilustrar pipelines de aprendizaje por imitación visuomotor.
- Base para ajustes finos posteriores: al partir de Long-WAM-YAM y no de otro finetune de tarea, puede reutilizarse como inicialización para tareas de anidamiento o ensamblaje similares.
- Auditoría de infraestructura: permite validar la carga de pesos en CPU y la coherencia de configuración entre `config.yaml`, `dataset_stats.json` y el código SIP incluido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el checkpoint ha superado comprobaciones de carga de ficheros en CPU, pero no se reporta tasa de éxito en bucle cerrado ni resultado de validación sobre un conjunto reservado, y advierte de que la pérdida de entrenamiento no es una métrica de éxito de la tarea robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 12,0 GB y el entrenamiento usó BF16, pero no se documenta el consumo en inferencia.
- GPU recomendadas: no disponibles de forma específica; el entrenamiento se ejecutó en cuatro GPU sin especificar modelo.
- Compatibilidad con GPU de consumo: no confirmada; no hay datos que permitan afirmar que quepa en una RTX 4090 u otras GPU consumer.
- Opciones de despliegue: no se soportan vLLM, llama.cpp, Ollama ni TGI; el despliegue requiere el checkout de Long-WAM incluido en `code.zip`, con `longwam.inference.load_run_config` y `load_model`, más los activos externos del VAE de Wan2.2 y el codificador UMT5.
- Latencia y throughput: no disponibles.
- Requiere definir `LONGWAM_MODEL_ROOT` y ajustar las rutas de datos, estadísticas y caché cuando se ejecuta en una máquina distinta a la del entrenamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Long-WAM Nesting Doll — Epoch 1 | no disponible | no disponible | sin benchmarks publicados | other | HuggingFace, 24 descargas |
| Efficient-Large-Model/Long-WAM-YAM (base) | no disponible | no disponible | no disponible en esta ficha | other | HuggingFace |
| NVlabs/LongLive (código base) | no disponible | no disponible | no disponible en esta ficha | no disponible | Repositorio de código |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- No se ha medido la tasa de éxito en bucle cerrado ni existe validación sobre un conjunto reservado; la pérdida de entrenamiento no es una métrica de éxito de la tarea.
- Es un checkpoint intermedio (epoch 1 de 5, paso 3429), no el modelo final del run.
- El fichero es solo de evaluación: no incluye estado de optimizador ni de scheduler, por lo que no permite continuar el entrenamiento de forma exacta.
- No es un modelo `from_pretrained` de Transformers; requiere el código SIP v22 y los activos de Wan2.2 VAE y UMT5.
- La configuración de entrenamiento conserva rutas del sistema de ficheros original, lo que exige reconfiguración para otras máquinas.
- El despliegue requiere un adaptador de robot compatible y respetar las convenciones 14D de acción y pinza.
- La licencia es "other" y se remite a la del modelo base; deben revisarse las condiciones de uso comercial en el repositorio de Long-WAM-YAM antes de cualquier explotación.
- Riesgo de sobreajuste a la tarea y al entorno de las 100 demostraciones; no hay evidencia de generalización a otras configuraciones.
- No se documentan sesgos, pero al ser un modelo robótico específico no aplican las categorías habituales de sesgo lingüístico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dddddsds31341/Long-WAM-Nesting-Doll-Epoch-1
- Modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Dataset: https://huggingface.co/datasets/yuyingyinya/nesting_doll
- Registro de entrenamiento (W&B): https://forge.coreweave.com/wandb/bofang/long-wam/runs/oaplbei2
- Código base LongLive: https://github.com/NVlabs/LongLive (commit cfa4e91eec59429d583326500bf5535c9ce6eec7)
