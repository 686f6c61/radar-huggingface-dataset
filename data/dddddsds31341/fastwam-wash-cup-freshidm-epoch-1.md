# dddddsds31341/FastWAM-Wash-Cup-FreshIDM-Epoch-1

## Resumen

FastWAM Wash Cup — Fresh IDM, Epoch 1 es un checkpoint de evaluación de un modelo de política robótica (vision-language-action, VLA) desarrollado por el usuario dddddsds31341, derivado por fine-tuning del modelo base Wan-AI/Wan2.2-TI2V-5B. El modelo resuelve una tarea concreta de manipulación bimanual: sostener y levantar una taza con un agarre mientras el otro la limpia por dentro con un cepillo de botella, devolver el cepillo y colocar la taza boca abajo en el escurridor. Está pensado para el robot bimanual Agilex PiPER y se publica como material de evaluación, no como modelo de propósito general.

La arquitectura es un modelo conjunto vídeo/acción (denominado `mot` en el checkpoint) que combina un experto de vídeo, inicializado desde un checkpoint previo de FastWAM Optional-IDM, con un experto de acción cuyo transformer parte del DiT de Wan2.2-TI2V-5B interpolado linealmente a un tamaño oculto de 1024. El entrenamiento se realizó sobre el dataset `yuyingyinya/wash_cup` (100 demostraciones, 69.728 fotogramas a 30 Hz) durante 6 épocas, de las cuales este checkpoint corresponde a la época 1 (paso de optimizador 3487).

Su relevancia es acotada: se trata de un artefacto de investigación reproducible para la comunidad de robótica que trabaja con FastWAM y PiPER, con instrucciones de carga y evaluación explícitas, pero sin resultados de éxito en bucle cerrado ni validación held-out publicados. No es un modelo standalone de Transformers ni un modelo de lenguaje general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo conjunto vídeo/acción (`mot`): experto de vídeo + experto de acción basado en DiT de Wan2.2-TI2V-5B con hidden size 1024; encoder de acción, cabeza de acción y encoder de propiocepción |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens para la instrucción de tarea (embeddings UMT5 en caché) |
| Tipos de cuantización | no disponible (pesos almacenados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | `model.pt` (PyTorch, BF16); no es un modelo `from_pretrained` de Transformers |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura FastWAM, que acopla un experto de vídeo y un experto de acción en un único modelo conjunto (`mot`) más un encoder de propiocepción. El experto de vídeo parte del checkpoint pretrained FastWAM Optional-IDM Songling (paso 45.000, no público). El experto de acción se reinicializa por completo: su transformer se construye interpolando linealmente el DiT de Wan2.2-TI2V-5B a un tamaño oculto de 1024 mediante el script `scripts/preprocess_action_dit_backbone.py` de FastWAM, mientras que el encoder de acción, la cabeza de acción y el encoder de propiocepción se inicializan aleatoriamente con semilla 42. Este checkpoint corresponde a la inicialización "Fresh IDM"; se entrenó en paralelo otra con "IO reset" usando los mismos datos e hiperparámetros.

El entrenamiento usó el dataset `yuyingyinya/wash_cup` (revisión `dcf90aa38d98e9b6c9f71afe0cfeeb3f50ed74cb`): 100 demostraciones, 69.728 fotogramas a 30 Hz, todas empleadas para entrenamiento. Se ejecutó en cuatro GPU A800 con batch size 5 por GPU y batch global 20, learning rate constante de 1e-5, AdamW con weight decay 0.01, clipping de norma global 1.0, BF16 y DeepSpeed ZeRO-1, semilla 42. Cada época consta de 3.487 actualizaciones de optimizador; la ejecución completa son 6 épocas / 20.922 actualizaciones, y comenzó el 2026-11-13 a las 07:11 (Asia/Singapore). Las acciones son objetivos de articulación absolutos de 14 dimensiones en radianes (izquierda 6 articulaciones + gripper, derecha 6 articulaciones + gripper), con los grippers como fracciones de apertura de 0.08 m. Se emplean tres cámaras RGB (`top_head`, `hand_left`, `hand_right`), cada una redimensionada a 224×224 y concatenada horizontalmente a 224×672; cada muestra contiene 9 fotogramas de vídeo y un chunk de acción de 32 pasos. Las pérdidas de denoising de vídeo y acción tienen pesos iguales, con `action_idm_prob` 0.5. La inferencia usa `action_infer_mode="idm"` con 20 pasos: primero predice el vídeo futuro y después el chunk de 32 acciones.

## Capacidades

- Generación de acciones de manipulación bimanual de 14 dimensiones para el robot Agilex PiPER (6 articulaciones + gripper por brazo).
- Predicción de vídeo futuro como paso intermedio antes de la predicción de acciones (modo IDM, 20 pasos de inferencia).
- Condicionamiento por instrucción de tarea en lenguaje natural, codificada con el text encoder UMT5 de Wan2.1 (contexto de 128 tokens).
- Fusión de tres vistas RGB (`top_head`, `hand_left`, `hand_right`) en una entrada de 224×672.
- Uso de propiocepción mediante un encoder dedicado.
- Ejecución de una única tarea específica: limpieza y colocación de una taza con cepillo de botella.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step general, matemáticas, código, visión general, audio ni multilingüismo.

## Casos de uso

- Investigación en manipulación bimanual: servir como checkpoint de referencia para comparar la inicialización "Fresh IDM" frente a "IO reset" en el mismo dataset e hiperparámetros, evaluando diferencias de comportamiento en la tarea de lavado de taza.
- Reproducción de experimentos FastWAM: el repositorio incluye `code.zip` (release v8, basada en `yuantianyuan01/FastWAM@7faa711` con cambios de fine-tuning PiPER) y `requirements-fastwam.txt`, lo que permite reconstruir el pipeline de entrenamiento e inferencia en una máquina equivalente.
- Evaluación de políticas VLA en robot real: desplegar el modelo en un Agilex PiPER con el adaptador de robot correspondiente y las convenciones de 14 dimensiones documentadas en `inference_contract.json`.
- Estudio de normalización específica de tarea: `dataset_stats.json` permite analizar cómo las estadísticas min/max por tarea afectan a la desnormalización de acciones, y por qué mezclar estadísticas de otros checkpoints produce acciones incorrectas.
- Base para fine-tuning posterior: al ser un checkpoint de época 1 de una ejecución de 6 épocas, puede emplearse como punto de partida para ajustes adicionales sobre el mismo dataset o variantes de la tarea.
- Docencia y divulgación en robótica: ilustra el acoplamiento entre un modelo generativo de vídeo (Wan2.2-TI2V-5B) y un experto de acción, con contratos de inferencia explícitos y trazabilidad de configuración (`config.yaml` resuelto).
- Análisis de pipelines de datos multi-cámara: el formato de concatenación horizontal de tres vistas a 224×672 y el chunk de 32 acciones sirven como referencia para diseñar transformaciones equivalentes en otros datasets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reporta tasa de éxito en bucle cerrado ni resultado de validación held-out, y advierte que la pérdida de entrenamiento no es una métrica de éxito en la tarea robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 12,0 GB y los pesos se almacenan en BF16, por lo que se requiere al menos una GPU con capacidad suficiente para el modelo conjunto vídeo/acción más el VAE de Wan2.2-TI2V-5B, que se carga por separado.
- GPU de entrenamiento documentadas: 4× A800 con batch size 5 por GPU, BF16 y DeepSpeed ZeRO-1.
- GPU recomendadas para inferencia: no disponible; por analogía con el entrenamiento, se espera que requiera GPU de clase数据中心 (A800/H100) o similar, aunque no se confirma.
- ¿Cabe en GPU consumer? no disponible.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI; requiere el checkout de FastWAM incluido en `code.zip`, `hydra.utils.instantiate(cfg.model, ...)`, `model.load_checkpoint("model.pt")` y `model.infer_action(..., action_infer_mode="idm", num_inference_steps=20)`.
- Dependencias adicionales: pesos del VAE de Wan2.2-TI2V-5B vía `DIFFSYNTH_MODEL_BASE_PATH`, y text encoder y tokenizer UMT5 de Wan2.1 para codificar la instrucción.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastWAM Wash Cup — Fresh IDM, Epoch 1 | no disponible | 128 tokens (instrucción) | Manipulación bimanual PiPER (lavado de taza) | other | Público en HF |
| FastWAM Wash Cup — IO reset (misma ejecución) | no disponible | 128 tokens (instrucción) | Manipulación bimanual PiPER (lavado de taza) | other | No referenciado como repo público en la información disponible |
| FastWAM Optional-IDM Songling (checkpoint base del experto de vídeo) | no disponible | no disponible | Política robótica general FastWAM | no disponible | No público (paso 45.000) |
| Wan-AI/Wan2.2-TI2V-5B (modelo base del experto de acción) | no disponible | no disponible | Generación de vídeo texto-imagen-vídeo | no disponible en esta ficha | Público en HF |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No se reporta tasa de éxito en bucle cerrado ni validación held-out; la pérdida de entrenamiento no debe interpretarse como métrica de éxito de la tarea.
- El checkpoint corresponde solo a la época 1 de 6 (paso 3487 de 20.922); no representa el modelo final de la ejecución.
- El archivo es solo de evaluación: no incluye estado de optimizador ni scheduler, por lo que no permite reanudar el entrenamiento de forma exacta.
- Las estadísticas de normalización y el contrato del gripper deben provenir de este mismo repositorio; usar estadísticas de otro checkpoint produce acciones incorrectas.
- La configuración conserva rutas del sistema de archivos de la máquina de entrenamiento y debe actualizarse para otro entorno.
- No es un modelo standalone de Transformers `from_pretrained`; requiere el código FastWAM v8 y dependencias específicas.
- El modelo está entrenado para una única tarea y un robot concreto (Agilex PiPER); no se documenta generalización a otras tareas, objetos o morfologías.
- Licencia "other": no se detallan los términos de uso comercial; debe consultarse el repositorio antes de cualquier despliegue productivo.
- No se documentan sesgos, riesgos de alucinación ni cobertura idiomática; al ser un modelo de política robótica, el riesgo relevante es de ejecución física incorrecta, no de generación de texto.
- El modelo base Wan2.2-TI2V-5B y el checkpoint Songling tienen sus propias condiciones de uso que no se detallan aquí.

## Enlaces

- Hugging Face: https://huggingface.co/dddddsds31341/FastWAM-Wash-Cup-FreshIDM-Epoch-1
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Dataset: https://huggingface.co/datasets/yuyingyinya/wash_cup
- Repositorio de código FastWAM referenciado: `yuantianyuan01/FastWAM` (commit `7faa711`), sin URL directa en la información disponible
- Paper, blog, demo o repositorio adicionales: no disponibles en la información proporcionada
