# arunos728/fastwam-pointwam-assembly

## Resumen

FastWAM — PointWAM assembly es un modelo de mundo (world model) para robótica desarrollado por el usuario arunos728, afinado a partir de Wan-AI/Wan2.2-TI2V-5B. No es una política de control (VLA) al uso: denoisa conjuntamente vídeo futuro y el fragmento de acciones asociado, de modo que el término de acción queda acoplado al flujo de vídeo a través del tronco MoT. El modelo está especializado en una única tarea bimanual de inserción de una clavija roja en un orificio azul (peg insertion) sobre el robot openarm_rh56f1, con acciones y estados de 28 dimensiones.

La arquitectura sigue el esquema Mixture-of-Transformers (MoT) de 30 capas del backbone Wan2.2-TI2V-5B, dividida en un experto de vídeo de 5,00B parámetros (hidden 3072, FFN 14336, 24 cabezas) y un experto de acción de 1,02B parámetros (hidden 1024, FFN 4096, 24 cabezas), sumando 6,021B parámetros en el checkpoint final `step_030000.pt` en bf16. Se entrenó durante 30.000 pasos (56 épocas) sobre 64 episodios y 36.857 fotogramas a 30 fps, con dos cámaras egocéntricas de 320x180 apiladas verticalmente en un lienzo de 384x320 y clips de 33 fotogramas con `action_video_freq_ratio=4`.

Su relevancia es acotada pero técnica: sirve como referencia de investigación para modelos de mundo que predicen vídeo y acción de forma conjunta en manipulación bimanual, no como componente listo para despliegue en producción. El repositorio es de solo inferencia (sin estado de optimizador) y exige el archivo `dataset_stats.json` para normalizar correctamente las entradas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Transformers (MoT), 30 capas, sobre Wan2.2-TI2V-5B |
| Parámetros totales | 6,021B (5,00B experto de vídeo + 1,02B experto de acción) |
| Parámetros activos | no disponible (no es MoE disperso; ambos expertos participan) |
| Longitud de contexto | `context_len=128` para embeddings de contexto cacheados; clip de vídeo de 33 fotogramas |
| Tipos de cuantización | no disponible (checkpoint publicado en bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible (no incluye codificador de texto; usa embeddings de contexto cacheados) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (PyTorch, `step_030000.pt`, bf16, 1.649 tensores) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Mixture-of-Transformers con dos expertos que comparten tronco: un experto de vídeo de 5,00B parámetros (hidden 3072, FFN 14336, 24 cabezas) heredado del backbone Wan2.2-TI2V-5B y un experto de acción de 1,02B parámetros (hidden 1024, FFN 4096, 24 cabezas) inicializado desde `ActionDiT_linear_interp_Wan22_alphascale_1024hdim.pt`. El experto de vídeo es incondicional respecto a la acción (`action_conditioned: false`): ambos flujos se acoplan únicamente a través del tronco MoT. No hay codificador de texto (`load_text_encoder: false`); el entrenamiento usó embeddings `context` y `context_mask` cacheados con `context_len=128` y el tokenizador de Wan-AI/Wan2.1-T2V-1.3B, y el servicio debe suministrarlos del mismo modo.

El entrenamiento se realizó sobre 64 episodios y 36.857 fotogramas a 30 fps de la tarea de inserción de clavija, con dos cámaras (`ego_left`, `ego_right`) de 320x180 redimensionadas a 320x192 y apiladas verticalmente en un lienzo de 384x320. Se usaron 4x H100, batch global 64 (batch_size 8 × grad_accum 2 × 4 GPU), lr 1e-4 con decaimiento coseno, weight decay 0,01, grad clip 1,0, bf16 y semilla 42, durante 30.000 pasos (56 épocas) en 17 h 30 min repartidas en dos tramos (el job fue expulsado y reencolado; el segundo tramo arrancó desde cero, no reanudó). Las pérdidas finales medias de los últimos 20 pasos registrados fueron `loss` 0,0274, `loss_video` 0,0265, `loss_action` 0,0008 y `val_loss` 0,0286 en el paso 30.000. El objetivo está dominado por el término de vídeo en un factor aproximado de 30, por lo que las cifras no son comparables con el checkpoint banana del mismo espacio de nombres (`loss` 0,0077), entrenado 125 épocas sobre un corpus menor y menos variado.

## Capacidades

- Generación conjunta de vídeo futuro y fragmentos de acción mediante denoising acoplado en el tronco MoT.
- Predicción de acciones y estados de 28 dimensiones para el robot bimanual `openarm_rh56f1`.
- Procesamiento de dos vistas egocéntricas (`ego_left`, `ego_right`) apiladas verticalmente en un lienzo de 384x320.
- Modelado de clips de 33 fotogramas con `action_video_freq_ratio=4`.
- Consumo de embeddings de contexto cacheados (`context_len=128`) para condicionar la generación.
- No dispone de punto de entrada `get_action(observation)`; no es sustituible por una política VLA como GR00T o pi0.5.
- No soporta tool calling, function calling ni razonamiento multi-paso orientado a agentes.
- Capacidades multilingües: no disponible (sin codificador de texto).

## Casos de uso

- Investigación en modelos de mundo para manipulación bimanual: el modelo permite estudiar cómo se acopla la predicción de vídeo con la predicción de acciones en una tarea de inserción de precisión, sirviendo de base para comparar objetivos de entrenamiento y arquitecturas MoT.
- Generación de rollouts de evaluación con teacher forcing: los vídeos `eval/step_030000_rank_*.mp4` incluidos permiten analizar cualitativamente la coherencia entre vídeo predicho y acción predicha antes de plantear ejecución en bucle cerrado.
- Análisis de normalización y distribución de datos: al requerir `dataset_stats.json` y no incorporar la normalización en el checkpoint, el modelo es útil para estudiar el impacto de las estadísticas del corpus en las predicciones.
- Reproducción de experimentos de entrenamiento: la configuración resuelta (`config.yaml`), los hiperparámetros documentados y las pérdidas finales permiten replicar o extender el entrenamiento sobre nuevos corpus de inserción de clavija.
- Estudio de la desproporción entre pérdidas: con `loss_action` 0,0008 frente a `loss_video` 0,0265, el modelo sirve para analizar cómo ponderar términos en objetivos multi-tarea de vídeo y control.
- Base para adaptación a otros robots o tareas: el experto de acción puede reutilizarse como inicialización para nuevos conjuntos de datos, siempre que se respete la dimensionalidad de 28-D o se reentrene la cabeza correspondiente.
- Evaluación de la dependencia de contexto cacheado: útil para medir la sensibilidad del modelo a la calidad de los embeddings `context` y `context_mask` cuando no hay codificador de texto en línea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta pérdidas de entrenamiento y validación:

| Métrica | Valor |
|---|---|
| `loss` (media últimos 20 pasos) | 0,0274 |
| `loss_video` | 0,0265 |
| `loss_action` | 0,0008 |
| `val_loss` @ 30000 | 0,0286 |

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en bf16 ocupa 12 GB, por lo que se requiere al menos ese espacio más el overhead de activaciones y del lienzo de vídeo; no se documenta una cifra oficial de VRAM total.
- GPU recomendadas: el entrenamiento se realizó en 4x H100; para inferencia no se especifican GPU concretas.
- Compatibilidad con GPU de consumo: no disponible; el tamaño de 6,021B parámetros en bf16 (12 GB) sugiere que podría caber en GPUs de consumo con 16 GB o más, pero no se confirma en la documentación.
- Opciones de despliegue: no disponible; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y el modelo no es un LLM de texto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastWAM — PointWAM assembly | 6,021B (5,00B vídeo + 1,02B acción) | `context_len=128`, clip de 33 fotogramas | Modelo de mundo vídeo+acción, inserción de clavija, 28-D | Apache 2.0 | Hugging Face (`arunos728/fastwam-pointwam-assembly`) |
| Wan-AI/Wan2.2-TI2V-5B | 5,00B (experto de vídeo) | no disponible | Generación de vídeo texto-imagen a vídeo | no disponible en la información proporcionada | Hugging Face (modelo base) |
| GR00T (política VLA) | no disponible | no disponible | Política de control robótico | no disponible | no disponible en la información proporcionada |
| pi0.5 (política VLA) | no disponible | no disponible | Política de control robótico | no disponible | no disponible en la información proporcionada |

## Limitaciones y advertencias

- No es una política: carece de `get_action(observation)` y no puede sustituir a un VLA como GR00T o pi0.5 en un bucle de control.
- El experto de vídeo es incondicional respecto a la acción (`action_conditioned: false`); el acoplamiento es solo a través del tronco MoT.
- No incluye codificador de texto (`load_text_encoder: false`); el servicio debe suministrar embeddings `context` y `context_mask` cacheados con `context_len=128` y el tokenizador de Wan2.1-T2V-1.3B.
- `dataset_stats.json` es obligatorio: sin él, el modelo ve entradas fuera de distribución al no incorporar la normalización en el checkpoint.
- Las acciones y estados son de 28 dimensiones para `openarm_rh56f1`; no son intercambiables con las políticas de 54-D del robot RB-Y1 del mismo espacio de nombres.
- Los vídeos de evaluación son rollouts con teacher forcing, no ejecución en bucle cerrado; su calidad no garantiza comportamiento en despliegue real.
- El objetivo está dominado por el término de vídeo (~30x), por lo que la precisión de la acción puede no ser la esperada en tareas que exijan control fino.
- Entrenado sobre un corpus reducido (64 episodios, 36.857 fotogramas) y una única tarea; riesgo alto de sobreajuste y de generalización limitada a otras tareas o entornos.
- No se documentan sesgos conocidos ni riesgos de alucinación específicos; al ser un modelo de mundo robótico, la principal advertencia es la falta de validación en bucle cerrado.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de estado de optimizador y de datos originales limita la reproducibilidad completa del entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/arunos728/fastwam-pointwam-assembly
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Tokenizador de contexto: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
