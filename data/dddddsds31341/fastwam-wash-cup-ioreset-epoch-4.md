# dddddsds31341/FastWAM-Wash-Cup-IOReset-Epoch-4

## Resumen

FastWAM Wash Cup — IO reset, Epoch 4 es un checkpoint de evaluación de un modelo de política robótica (vision-language-action, VLA) desarrollado por el usuario dddddsds31341. Se trata de un fine-tune del modelo generativo de vídeo Wan-AI/Wan2.2-TI2V-5B (5B parámetros) sobre la tarea concreta de manipulación bimanual "wash cup", en la que un brazo sostiene y levanta una taza mientras el otro limpia su interior con un cepillo de botella, devuelve el cepillo y coloca la taza boca abajo en un escurridor.

El modelo pertenece al marco FastWAM (Optional-IDM), que combina un experto de vídeo y un experto de acción sobre una arquitectura transformer para predecir primero el vídeo futuro y después un chunk de acciones de 32 pasos. Este checkpoint corresponde a la época 4 de 6 (paso de optimizador 13948) de una de las dos inicializaciones entrenadas con datos e hiperparámetros idénticos: la llamada "IO reset", en la que el codificador de acción, la cabeza de acción y el codificador de propiocepción se reinicializan desde cero (semilla 42) porque las estadísticas de normalización del checkpoint previo colapsaban 9 de las 14 dimensiones de acción/estado.

Su relevancia es acotada y de nicho: es un artefacto de investigación para robótica bimanual sobre el robot Agilex PiPER, no un modelo de propósito general. El autor no reporta tasa de éxito en bucle cerrado ni validación con datos reservados, y el repositorio no es un modelo `from_pretrained` de Transformers, sino que requiere el código de entrenamiento incluido y pesos VAE de Wan2.2 descargados aparte.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer conjunto vídeo/acción (FastWAM Optional-IDM) sobre base Wan2.2-TI2V-5B; experto de vídeo + experto de acción + codificador de propiocepción |
| Parámetros totales | no disponible (modelo base Wan2.2-TI2V-5B: 5B) |
| Parámetros activos | no disponible |
| Longitud de contexto | 128 tokens para la instrucción de tarea (embeddings UMT5 en caché durante entrenamiento) |
| Tipos de cuantización | no disponible (pesos almacenados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | `model.pt` (PyTorch, BF16); requiere pesos VAE de Wan2.2-TI2V-5B por separado |

## Arquitectura y entrenamiento

El modelo sigue el esquema FastWAM: un experto de vídeo y un experto de acción dentro de un transformer conjunto (`mot`), más un codificador de propiocepción. La inferencia se realiza en modo `idm` con 20 pasos de difusión: primero se predice el vídeo futuro y después se genera un chunk de acciones de 32 pasos. Las entradas visuales son tres cámaras RGB (`top_head`, `hand_left`, `hand_right`), cada una redimensionada a 224×224 y concatenadas horizontalmente hasta 224×672, con 9 fotogramas de vídeo por muestra. Las acciones son objetivos articulares absolutos de 14 dimensiones en radianes (izquierdo: 6 articulaciones + pinza; derecho: 6 articulaciones + pinza), con las pinzas expresadas como fracción de apertura sobre 0,08 m.

El entrenamiento se realizó sobre el dataset `yuyingyinya/wash_cup` (revisión `dcf90aa38d98e9b6c9f71afe0cfeeb3f50ed74cb`): 100 demostraciones, 69.728 fotogramas a 30 Hz, todas usadas para entrenamiento. Se emplearon cuatro GPU A800, batch de 5 por GPU con acumulación 1 (batch global 20), tasa de aprendizaje constante de 1e-5 con AdamW, weight decay 0,01, recorte de gradiente a norma global 1,0, BF16 y DeepSpeed ZeRO-1, semilla 42. Cada época supone 3.487 actualizaciones y la ejecución completa son 6 épocas / 20.922 actualizaciones. Las pérdidas de denoising de vídeo y acción tienen pesos iguales y `action_idm_prob` es 0,5. El experto de vídeo y el transformer de acción parten del checkpoint pretrained FastWAM Optional-IDM Songling (paso 45.000, no público); el codificador de acción, la cabeza de acción y el codificador de propiocepción se reinicializan.

## Capacidades

- Generación de acciones robóticas bimanuales de 14 dimensiones (6 articulaciones + pinza por brazo) a partir de observaciones visuales de tres cámaras y una instrucción de tarea en lenguaje natural.
- Predicción de vídeo futuro como paso intermedio antes de la generación de acciones (modo `idm`, 20 pasos de difusión).
- Generación de chunks de acción de 32 pasos por inferencia.
- Seguimiento de instrucciones de tarea codificadas con el codificador de texto UMT5 de Wan2.1 (contexto de 128 tokens).
- Manipulación bimanual coordinada sobre el robot Agilex PiPER (sostener, limpiar, devolver herramienta y colocar objeto).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso genérico, visión general, audio ni multilingüismo.

## Casos de uso

- Investigación en manipulación bimanual: sirve como punto de partida reproducible para estudiar el efecto de la inicialización (IO reset frente a IDM fresco) en políticas VLA sobre la misma tarea y datos.
- Evaluación comparativa de checkpoints: al ser un checkpoint de evaluación de la época 4, permite medir la evolución del entrenamiento frente a épocas posteriores dentro de la misma ejecución.
- Réplica de experimentos: el repositorio incluye `config.yaml`, `dataset_stats.json`, `inference_contract.json`, `code.zip` y `requirements-fastwam.txt`, lo que facilita reproducir el pipeline de entrenamiento e inferencia en otra máquina.
- Automatización de tareas de limpieza en laboratorio: el modelo ejecuta la secuencia sostener-limpiar-devolver-colocar sobre el robot PiPER con las convenciones de acción documentadas.
- Base para fine-tuning en tareas similares: el experto de vídeo y el transformer de acción preentrenados pueden adaptarse a otras tareas de manipulación con el mismo contrato de 14 dimensiones y tres cámaras.
- Estudio de normalización de acciones: el caso del colapso de 9 de 14 dimensiones en el checkpoint previo lo convierte en un ejemplo útil para analizar cómo las estadísticas de normalización afectan al aprendizaje de políticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se reporta tasa de éxito en bucle cerrado ni resultado de validación con datos reservados, y advierte que la pérdida de entrenamiento no es una métrica de éxito en la tarea robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 12,0 GB y los pesos se almacenan en BF16, por lo que se requiere al menos una GPU con capacidad suficiente para el modelo conjunto más el VAE de Wan2.2-TI2V-5B cargado por separado.
- GPU de entrenamiento documentadas: 4× A800 con BF16 y DeepSpeed ZeRO-1.
- GPU recomendadas para inferencia: no disponible; por tamaño del artefacto, se sitúa en el rango de GPU de数据中心 (A100/H100) o GPUs de consumo de gama alta con suficiente memoria, sin confirmación del autor.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible.
- Opciones de despliegue: no es un modelo `from_pretrained` de Transformers. Requiere extraer `code.zip`, instalar el checkout de FastWAM incluido, construir el modelo con `hydra.utils.instantiate(cfg.model, model_dtype=torch.bfloat16, device=...)`, cargar con `model.load_checkpoint("model.pt")` e invocar `model.infer_action(..., action_infer_mode="idm", num_inference_steps=20)`. Se necesitan los pesos VAE de Wan2.2-TI2V-5B (`DIFFSYNTH_MODEL_BASE_PATH`) y el codificador de texto UMT5 de Wan2.1 con su tokenizador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastWAM Wash Cup — IO reset, Epoch 4 | Base 5B (total no disponible) | 128 tokens de instrucción | Política VLA bimanual "wash cup" | other | Público en HF |
| FastWAM Optional-IDM Songling (checkpoint previo) | no disponible | no disponible | Política VLA base | no disponible | No público (paso 45.000) |
| Wan-AI/Wan2.2-TI2V-5B | 5B | no disponible | Generación texto-imagen-vídeo | no disponible en la información | Público en HF |
| Fine-tunes Long-WAM sobre el mismo dataset | no disponible | no disponible | Política VLA "wash cup" | no disponible | No disponible en la información |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No se reporta tasa de éxito en bucle cerrado ni validación con datos reservados; la pérdida de entrenamiento no es una métrica de éxito robótico.
- Es un checkpoint de evaluación de la época 4 de 6: no representa el modelo final de la ejecución y no permite restaurar el estado del optimizador para continuar el entrenamiento exactamente.
- Las estadísticas de normalización y el contrato de pinzas deben provenir de este mismo repositorio; usar estadísticas de otro checkpoint produce acciones incorrectas.
- La configuración conserva rutas del sistema de archivos de la máquina de entrenamiento y debe actualizarse para otra máquina.
- Requiere pesos VAE de Wan2.2-TI2V-5B y el codificador de texto UMT5 de Wan2.1 con tokenizador, que no se incluyen en el repositorio.
- No es un modelo standalone de Transformers; el despliegue exige el código FastWAM v8 incluido y un adaptador de robot compatible con las convenciones de 14 dimensiones.
- Sesgos conocidos: no documentados; el entrenamiento se limita a 100 demostraciones de una única tarea y un único robot, por lo que la generalización fuera de esa distribución no está caracterizada.
- Riesgo de alucinación: no evaluado; en políticas robóticas se traduce en acciones fuera de distribución sin métrica publicada.
- Idiomas soportados: no disponibles; la instrucción de tarea se codifica con UMT5, pero no se documenta cobertura multilingüe.
- Licencia "other": no se especifican términos de uso comercial; debe consultarse la licencia del modelo base Wan2.2-TI2V-5B y la del código FastWAM antes de cualquier uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/FastWAM-Wash-Cup-IOReset-Epoch-4
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Dataset: https://huggingface.co/datasets/yuyingyinya/wash_cup
- Código FastWAM de referencia: https://github.com/yuantianyuan01/FastWAM (commit `7faa711`)
