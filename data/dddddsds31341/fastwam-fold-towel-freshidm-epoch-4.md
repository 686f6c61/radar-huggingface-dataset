# dddddsds31341/FastWAM-Fold-Towel-FreshIDM-Epoch-4

## Resumen

FastWAM Fold Towel — Fresh IDM, Epoch 4 es un checkpoint de evaluación de un modelo de política robótica (vision-language-action, aunque en este caso solo visión y estado propioceptivo) desarrollado por el usuario `dddddsds31341`. Se trata de un fine-tune independiente sobre la tarea concreta de doblar una toalla con dos brazos, partiendo del modelo base Wan-AI/Wan2.2-TI2V-5B (un modelo de generación vídeo/imagen de 5B parámetros) y de un checkpoint previo de FastWAM no público. El modelo combina un experto de vídeo (hereda el DiT de Wan2.2) con un experto de acción re-inicializado, y predice primero el vídeo futuro y después un chunk de 32 acciones.

La relevancia es acotada: no es un modelo de propósito general, sino un artefacto de investigación para reproducir y evaluar una política bimanual sobre el robot Agilex PiPER. El autor publica pesos de la época 4 de 6 (paso de optimizador 19832) del run con inicialización "Fresh IDM", junto con la configuración resuelta, estadísticas de normalización, contrato de inferencia y el código FastWAM v8 usado. No se reportan tasas de éxito en robot real ni validación con datos retenidos, por lo que debe tratarse como material de evaluación interna.

El tamaño del repositorio es de 12,0 GB y los pesos se distribuyen en `model.pt` en BF16. La licencia es "other" y no se especifican idiomas soportados. El modelo no es un `from_pretrained` estándar de Transformers: requiere el checkout de FastWAM y dependencias adicionales (VAE de Wan2.2, codificador UMT5 de Wan2.1).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) de vídeo + experto de acción transformer; modelo conjunto vídeo/acción tipo FastWAM |
| Parametros totales | no disponible (repo de 12,0 GB; base Wan2.2-TI2V-5B de 5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens para la instrucción de tarea (embeddings UMT5 cacheados); 9 frames de vídeo y chunk de 32 acciones por muestra |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | `model.pt` (PyTorch, BF16); configuración en `config.yaml`; estadísticas en `dataset_stats.json`; contrato en `inference_contract.json` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura FastWAM: un experto de vídeo que parte del checkpoint pretrained FastWAM Optional-IDM Songling (paso 45.000, no público) y un experto de acción completamente re-inicializado. El transformer del experto de acción se construye interpolando linealmente el DiT de Wan2.2-TI2V-5B a un tamaño oculto de 1024 mediante `scripts/preprocess_action_dit_backbone.py`; el codificador de acción, la cabeza de acción y el codificador propioceptivo se inicializan aleatoriamente con semilla 42. La inferencia encadena dos etapas: primero predice el vídeo futuro y después el chunk de 32 acciones (`action_infer_mode="idm"`, 20 pasos de difusión).

El entrenamiento usa el dataset `yuyingyinya/fold_towel` (revisión `48cf95e0d1594940d4160f5cde7e8070c221904e`): 100 demostraciones, 99.151 frames a 30 Hz, todas usadas para entrenamiento. Se ejecutó en cuatro A800 con batch 5 por GPU, acumulación 1, batch global 20, learning rate constante 1e-5, AdamW con weight decay 0.01, clipping de norma global 1.0, BF16 y DeepSpeed ZeRO-1, semilla 42. Cada época son 4.958 actualizaciones; el run completo son 6 épocas / 29.748 actualizaciones y este checkpoint corresponde al paso 19.832. Las pérdidas de denoising de vídeo y acción tienen pesos iguales y `action_idm_prob` es 0.5. Las acciones son objetivos articulares absolutos de 14 dimensiones en radianes (izquierda 6 articulaciones + pinza, derecha 6 + pinza), con pinzas como fracción de apertura sobre 0,08 m. Tres cámaras RGB (`top_head`, `hand_left`, `hand_right`) se redimensionan a 224×224 y se concatenan horizontalmente a 224×672.

## Capacidades

- Predicción de acciones bimanuales de 14 dimensiones (12 articulaciones + 2 pinzas) para el robot Agilex PiPER.
- Generación de vídeo futuro condicionada a la observación, usada como paso intermedio antes de la predicción de acciones (modo IDM).
- Chunking de acciones: emite 32 pasos de acción por inferencia.
- Condicionamiento por instrucción de tarea en lenguaje natural (contexto UMT5 de 128 tokens), con una instrucción específica de doblado de toalla.
- Entrada multimodal de tres cámaras RGB más estado propioceptivo (posiciones articulares).
- No soporta tool calling, function calling, agentes multi-paso, ni capacidades de audio o texto generativo general.
- Capacidades multilingües: no disponibles; la instrucción se codifica con UMT5 pero no se documenta cobertura idiomática.

## Casos de uso

- Investigación en manipulación bimanual: reproducir el fine-tune de doblado de toalla sobre Agilex PiPER usando `config.yaml`, `dataset_stats.json` e `inference_contract.json` del mismo repositorio para obtener acciones coherentes.
- Evaluación comparativa de inicializaciones: el autor entrena dos variantes (IO reset y Fresh IDM) con datos e hiperparámetros idénticos; este checkpoint permite comparar el efecto de la inicialización Fresh IDM frente a IO reset en la misma tarea.
- Estudio de políticas vídeo-acción: analizar el pipeline de dos etapas (predicción de vídeo futuro y luego acciones) y su impacto en la estabilidad del chunk de 32 acciones.
- Base para fine-tuning posterior: al ser un checkpoint de época 4 con pesos BF16 y configuración resuelta, sirve como punto de partida para nuevas tareas de doblado o manipulación de tejidos con el mismo robot.
- Validación de contratos de despliegue: probar la integración de las convenciones de 14 dimensiones, orden de articulaciones y referencia de pinzas (0,08 m) en un stack de control real.
- Reproducción de infraestructura: el `code.zip` (FastWAM v8 basado en `yuantianyuan01/FastWAM@7faa711` con cambios de fine-tuning PiPER) y `requirements-fastwam.txt` permiten reconstruir el entorno de entrenamiento en clústeres con A800/A100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reporta tasa de éxito en robot real ni resultado de validación con datos retenidos, y advierte que la pérdida de entrenamiento no es una métrica de éxito de la tarea robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo pesa 12,0 GB en BF16 y requiere además el VAE de Wan2.2-TI2V-5B y el codificador UMT5 de Wan2.1, lo que eleva el consumo por encima de los pesos del checkpoint.
- GPU de entrenamiento documentadas: 4× A800 (BF16, DeepSpeed ZeRO-1, batch 5 por GPU).
- GPU recomendadas para inferencia: A800/A100/H100 por el tamaño del modelo base de 5B y las dependencias adicionales; no se documenta compatibilidad con GPUs de consumo.
- Cabida en GPU de consumo: no disponible; no se ha verificado ni documentado.
- Opciones de despliegue: no es un modelo `from_pretrained` de Transformers. Requiere extraer `code.zip`, instalar el checkout de FastWAM, construir el modelo con `hydra.utils.instantiate(cfg.model, model_dtype=torch.bfloat16, device=...)`, cargar con `model.load_checkpoint("model.pt")` e invocar `model.infer_action(..., action_infer_mode="idm", num_inference_steps=20)`. Es necesario definir `DIFFSYNTH_MODEL_BASE_PATH` para los pesos del VAE.
- Latencia y throughput: no disponibles. La inferencia incluye 20 pasos de difusión y una etapa de predicción de vídeo previa a las acciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastWAM Fold Towel Fresh IDM Epoch 4 (este) | no disponible (base 5B) | 128 tokens de instrucción; 9 frames; chunk de 32 acciones | Doblado de toalla bimanual en Agilex PiPER | other | Pesos públicos en HF; código en `code.zip` |
| FastWAM Optional-IDM Songling (checkpoint previo) | no disponible | no disponible | Política general FastWAM | no disponible | No público (paso 45.000) |
| Wan-AI/Wan2.2-TI2V-5B (modelo base) | 5B | no disponible | Generación texto-imagen-vídeo | no disponible en esta ficha | Público en HF |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No se reporta tasa de éxito en robot real ni validación con datos retenidos; la pérdida de entrenamiento no es una métrica de éxito de la tarea.
- El checkpoint es de evaluación (época 4 de 6) y no incluye estado de optimizador ni scheduler, por lo que no permite continuar el entrenamiento de forma exacta.
- Las estadísticas de normalización y el contrato de pinzas deben provenir de este mismo repositorio; usar estadísticas de otro checkpoint produce acciones incorrectas.
- La configuración conserva rutas del sistema de ficheros de la máquina de entrenamiento y debe actualizarse para otro entorno.
- Requiere dependencias externas no incluidas: pesos del VAE de Wan2.2-TI2V-5B y codificador UMT5 de Wan2.1 con tokenizador para codificar la instrucción.
- No es un modelo autónomo de Transformers; el despliegue exige el checkout de FastWAM y un adaptador de robot compatible con las convenciones de 14 dimensiones.
- Tarea y dominio muy restringidos (doblado de toalla, 100 demostraciones, un único robot); no hay evidencia de generalización a otras tareas, objetos o morfologías.
- Licencia "other": no se detallan términos de uso comercial; debe consultarse antes de cualquier despliegue productivo.
- No se documentan sesgos, cobertura idiomática ni comportamiento fuera de distribución; el riesgo de alucinación en el sentido textual no aplica, pero sí el riesgo de predicciones de acción inválidas fuera del dominio de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/FastWAM-Fold-Towel-FreshIDM-Epoch-4
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Dataset: https://huggingface.co/datasets/yuyingyinya/fold_towel
- Repositorio FastWAM de referencia: https://github.com/yuantianyuan01/FastWAM (commit `7faa711` citado en la model card)
