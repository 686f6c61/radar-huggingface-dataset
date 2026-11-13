# dddddsds31341/FastWAM-Wash-Cup-FreshIDM-Epoch-3

## Resumen

FastWAM-Wash-Cup-FreshIDM-Epoch-3 es un checkpoint de evaluación de un modelo de política robótica (vision-language-action, VLA) desarrollado por el usuario dddddsds31341. Se trata de un fine-tune específico para la tarea de lavado de tazas ("wash cup") sobre el modelo base Wan-AI/Wan2.2-TI2V-5B, un modelo generativo de vídeo de 5.000 millones de parámetros. El modelo combina un experto de vídeo y un experto de acción en una arquitectura conjunta que predice primero el vídeo futuro y después un chunk de acciones de 32 pasos.

El checkpoint corresponde a la época 3 de 6 (paso de optimizador 10.461 de 20.922) de una ejecución independiente con inicialización "Fresh IDM", una de las dos inicializaciones entrenadas con datos e hiperparámetros idénticos. Está pensado exclusivamente para evaluación en un robot bimanual Agilex PiPER con tres cámaras RGB, y no como modelo de propósito general ni como modelo de Transformers estándar.

Su relevancia es acotada: es un artefacto de investigación reproducido con fines experimentales, con cero descargas y sin resultados de éxito en robot publicados. No debe confundirse con un modelo de lenguaje o multimodal de uso general; es un componente de un pipeline de robótica con contratos de inferencia muy específicos (orden de articulaciones, normalización, layout de cámaras).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer conjunto vídeo/acción (DiT de Wan2.2-TI2V-5B para vídeo; experto de acción con backbone DiT interpolado a hidden size 1024) |
| Parametros totales | no disponible (modelo base Wan2.2-TI2V-5B; tamaño del checkpoint 12,0 GB en BF16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens para el embedding de instrucción (UMT5); 9 frames de vídeo y chunk de 32 acciones por muestra |
| Tipos de cuantizacion | no disponible (pesos almacenados en BF16) |
| Idiomas soportados | no disponible (instrucción de tarea en inglés) |
| Licencia | other (ver limitaciones) |
| Formato de pesos | model.pt (PyTorch, BF16), config.yaml, dataset_stats.json, inference_contract.json |

## Arquitectura y entrenamiento

El modelo es un sistema conjunto vídeo-acción. El experto de vídeo parte del checkpoint pretrained FastWAM Optional-IDM Songling (paso 45.000, no público), que a su vez se basa en el DiT de Wan2.2-TI2V-5B. El experto de acción se reinicializa por completo: su transformer se construye interpolando linealmente el DiT de Wan2.2-TI2V-5B a hidden size 1024 mediante el script `scripts/preprocess_action_dit_backbone.py` de FastWAM, mientras que el encoder de acción, la cabeza de acción y el encoder de propiocepción se inicializan aleatoriamente con semilla 42. La inferencia usa el modo `idm` con 20 pasos: primero predice el vídeo futuro y luego el chunk de 32 acciones.

El entrenamiento se realizó sobre el dataset `yuyingyinya/wash_cup` (revisión `dcf90aa38d98e9b6c9f71afe0cfeeb3f50ed74cb`), con 100 demostraciones, 69.728 frames a 30 Hz, usando las cuatro GPUs A800, batch size 5 por GPU y acumulación 1 (batch global 20). Se empleó learning rate constante de 1e-5, AdamW con weight decay 0,01, clipping de norma global 1,0, BF16 y DeepSpeed ZeRO-1, semilla 42. Cada época supone 3.487 actualizaciones; la ejecución completa son 6 épocas y 20.922 actualizaciones. Las pérdidas de denoising de vídeo y de acción tienen pesos iguales y `action_idm_prob` es 0,5. Los objetivos son articulaciones absolutas de 14 dimensiones en radianes (izquierda 6 articulaciones + pinza, derecha 6 articulaciones + pinza), con pinzas como fracción de apertura de 0,08 m. Se usan tres cámaras RGB (`top_head`, `hand_left`, `hand_right`) redimensionadas a 224×224 y concatenadas horizontalmente a 224×672. La normalización min/max es específica de la tarea.

## Capacidades

- Generación de vídeo futuro condicionada a instrucción y observaciones, como paso intermedio para la predicción de acciones.
- Predicción de chunks de 32 acciones de 14 dimensiones (articulaciones absolutas en radianes y apertura de pinza) para un robot bimanual Agilex PiPER.
- Control bimanual coordinado: una pinza sujeta y eleva la taza mientras la otra limpia el interior con un cepillo de botella.
- Ejecución de una instrucción de tarea concreta en inglés: "Hold and lift the cup with one gripper while the other cleans its interior with the bottle brush, return the brush, then place the cup upside down on the drying rack".
- Fusión de tres vistas RGB (cabeza y ambas manos) en una única entrada de 224×672.
- Condicionamiento por embedding de instrucción UMT5 (longitud 128), precalculado en entrenamiento.
- No soporta tool calling, function calling, agentes multi-paso genéricos, visión general, audio ni razonamiento matemático o de código; no es un modelo de lenguaje.

## Casos de uso

- Evaluación de investigación en manipulación bimanual: sirve para medir la viabilidad de la inicialización "Fresh IDM" frente a "IO reset" en la misma tarea, comparando pérdidas de denoising y comportamiento cualitativo en el robot.
- Reproducción de experimentos de VLA con backbone de vídeo: permite reproducir el pipeline FastWAM (predicción de vídeo seguida de acciones) sobre el dataset `wash_cup` con los mismos hiperparámetros y semilla.
- Benchmark interno de políticas robóticas: al compartir datos y configuración con los fine-tunes Long-WAM, se puede usar como referencia en comparaciones controladas dentro de un laboratorio.
- Desarrollo de adaptadores de robot: el `inference_contract.json` y `dataset_stats.json` documentan el orden de articulaciones y el contrato de pinzas, útiles para construir adaptadores para el Agilex PiPER.
- Estudio de normalización específica de tarea: el checkpoint incluye estadísticas min/max propias, lo que permite analizar la sensibilidad de las políticas a la normalización de estado y desnormalización de acciones.
- Docencia y divulgación sobre VLA: como ejemplo completo de artefacto de investigación con código, configuración y contrato de inferencia, sirve para ilustrar cómo se empaqueta un fine-tune robótico reproducible.
- Pruebas de integración de despliegue: validar pipelines de inferencia en BF16 con 20 pasos de denoising y chunk de 32 acciones antes de escalar a entrenamientos más largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reporta tasa de éxito en robot en bucle cerrado ni resultado de validación en held-out, y que la pérdida de entrenamiento no es una métrica de éxito de la tarea robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el checkpoint pesa 12,0 GB en BF16, por lo que se requiere al menos esa cantidad más el VAE de Wan2.2-TI2V-5B (cargado por separado) y el encoder de texto UMT5 de Wan2.1. En la práctica, se necesita una GPU con 24 GB o más para BF16 sin cuantización.
- GPU recomendadas: A800 (usadas en entrenamiento con 4 unidades), A100, H100. Para inferencia en BF16, una RTX 4090 (24 GB) es el mínimo razonable en consumer, aunque el margen es ajustado al sumar VAE y encoder de texto.
- Cabe en consumer GPU: posiblemente en RTX 4090 o RTX 3090 (24 GB) en BF16, con riesgo de OOM si se cargan simultáneamente todos los componentes; no hay datos oficiales de consumo pico.
- Opciones de despliegue: no es un modelo `from_pretrained` de Transformers. Requiere extraer `code.zip`, instalar el checkout de FastWAM (basado en `yuantianyuan01/FastWAM@7faa711` con cambios de fine-tuning PiPER), instanciar el modelo con `hydra.utils.instantiate(cfg.model, model_dtype=torch.bfloat16, device=...)`, cargar con `model.load_checkpoint("model.pt")` e inferir con `model.infer_action(..., action_infer_mode="idm", num_inference_steps=20)`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La inferencia implica 20 pasos de denoising de vídeo más la predicción del chunk de 32 acciones, lo que típicamente es costoso, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastWAM-Wash-Cup-FreshIDM-Epoch-3 | no disponible (base 5B) | 128 tokens de instrucción; 9 frames; 32 acciones | Lavado de taza bimanual (Agilex PiPER) | other | Público en HF, 0 descargas |
| FastWAM Wash-Cup (inicialización IO reset) | no disponible (base 5B) | idéntico | Idéntica tarea, misma data e hiperparámetros | other | Mencionado en la model card; no se proporciona enlace |
| Wan-AI/Wan2.2-TI2V-5B | 5B | no disponible | Generación de vídeo texto-imagen-a-vídeo | no disponible | Público en HF (modelo base) |
| FastWAM Optional-IDM Songling (step 45.000) | no disponible | no disponible | Pretrained de robótica FastWAM | no disponible | No público |

No se dispone de datos de rendimiento comparativo entre estas variantes; la model card solo indica que las dos inicializaciones se entrenaron con datos e hiperparámetros idénticos.

## Limitaciones y advertencias

- No se reporta tasa de éxito en robot en bucle cerrado ni validación en held-out; la pérdida de entrenamiento no es una métrica de éxito de la tarea.
- El checkpoint es solo de evaluación: no incluye estado del optimizador ni del scheduler, por lo que no permite continuar el entrenamiento de forma exacta.
- Las estadísticas de normalización y el contrato de pinzas deben provenir de este mismo repositorio; usar estadísticas de otro checkpoint produce acciones incorrectas.
- La configuración conserva rutas del sistema de ficheros de la máquina de entrenamiento y deben actualizarse para otra máquina.
- Requiere componentes externos: pesos del VAE de Wan2.2-TI2V-5B (`DIFFSYNTH_MODEL_BASE_PATH`) y el encoder de texto UMT5 de Wan2.1 con tokenizador para codificar la instrucción en despliegue.
- No es un modelo autónomo de Transformers (`from_pretrained`); requiere el código FastWAM y un adaptador de robot compatible con las convenciones de 14 dimensiones.
- Altamente específico de tarea y hardware: entrenado solo para lavado de tazas con un Agilex PiPER bimanual y tres cámaras concretas; no generaliza a otras tareas, robots ni configuraciones de cámara sin reentrenamiento.
- Idiomas: no se declaran idiomas soportados; la instrucción de tarea está en inglés y el encoder UMT5 se usó con contexto de 128 tokens.
- Licencia "other": no se especifican términos de uso comercial; debe consultarse la licencia del modelo base Wan2.2-TI2V-5B y del código FastWAM antes de cualquier uso en producción.
- Riesgo de alucinación visual y de acciones incoherentes fuera de la distribución de entrenamiento (100 demostraciones, una sola tarea).
- Sesgos no documentados; el dataset es pequeño y específico, sin análisis de sesgo publicados.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/dddddsds31341/FastWAM-Wash-Cup-FreshIDM-Epoch-3
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Dataset: https://huggingface.co/datasets/yuyingyinya/wash_cup
- Repositorio de código FastWAM (referencia citada en la model card): https://github.com/yuantianyuan01/FastWAM (commit `7faa711`)
