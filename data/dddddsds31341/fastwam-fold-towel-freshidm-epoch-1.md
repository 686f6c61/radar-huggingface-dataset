# dddddsds31341/FastWAM-Fold-Towel-FreshIDM-Epoch-1

## Resumen

FastWAM Fold Towel — Fresh IDM, Epoch 1 es un checkpoint de evaluación de un modelo de políticas robóticas (visuomotor policy) desarrollado por el usuario dddddsds31341, construido como fine-tune del modelo generativo de vídeo Wan-AI/Wan2.2-TI2V-5B. El modelo resuelve una tarea concreta de manipulación bimanual: doblar una toalla larga con dos brazos robóticos Agilex PiPER, siguiendo una instrucción en lenguaje natural. Es relevante como ejemplo de la familia FastWAM (World-Action Models), que combina un experto de vídeo preentrenado con un experto de acción para predecir primero el futuro visual y después un chunk de acciones.

El checkpoint corresponde a la época 1 de 6 (paso de optimizador 4958) de un entrenamiento independiente con inicialización "Fresh IDM", en el que el experto de acción se reinicializa por completo a partir del DiT de Wan2.2-TI2V-5B interpolado a tamaño oculto 1024, mientras el experto de vídeo parte de un checkpoint FastWAM Optional-IDM previo no público. El repositorio ocupa 12 GB e incluye pesos en BF16, configuración resuelta, estadísticas de normalización, contrato de inferencia y el código FastWAM v8 necesario para ejecutarlo.

No se trata de un modelo de lenguaje ni de un modelo `from_pretrained` estándar de Transformers: es un artefacto de investigación para evaluación en robótica, sin resultados publicados de tasa de éxito en bucle cerrado ni validación en conjunto reservado. Su interés es fundamentalmente metodológico y de reproducibilidad para quienes trabajan en políticas visuomotoras basadas en modelos generativos de vídeo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo conjunto vídeo/acción (FastWAM): experto de vídeo basado en DiT de Wan2.2-TI2V-5B + experto de acción con transformer propio (hidden size 1024), encoder de acción, action head y encoder de propriocepción |
| Parametros totales | no disponible (el modelo base Wan2.2-TI2V-5B tiene 5B; el total del conjunto no se declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens para el embedding UMT5 de la instrucción de tarea; 9 frames de vídeo de entrada y chunk de acción de 32 pasos |
| Tipos de cuantizacion | no disponible (pesos almacenados en BF16) |
| Idiomas soportados | no disponible (instrucción de tarea en inglés en el ejemplo) |
| Licencia | other (licencia personalizada, ver limitaciones) |
| Formato de pesos | `model.pt` (PyTorch, BF16), más `config.yaml`, `dataset_stats.json`, `inference_contract.json`, `code.zip` y `requirements-fastwam.txt` |

## Arquitectura y entrenamiento

FastWAM es una arquitectura de modelo mundo-acción que acopla dos expertos: un experto de vídeo derivado del DiT de Wan2.2-TI2V-5B, que predice el futuro visual, y un experto de acción que genera un chunk de 32 pasos de acciones conjuntas. En esta ejecución concreta, el experto de vídeo parte del checkpoint FastWAM Optional-IDM Songling (paso 45.000, no público) y el experto de acción se reinicializa por completo: su transformer se obtiene interpolando linealmente el DiT de Wan2.2-TI2V-5B a tamaño oculto 1024 mediante `scripts/preprocess_action_dit_backbone.py`, y el encoder de acción, la action head y el encoder de propriocepción se inicializan aleatoriamente con semilla 42. Se entrenaron dos inicializaciones con datos e hiperparámetros idénticos (IO reset y fresh IDM); este repositorio es la variante fresh IDM.

El entrenamiento usa el dataset `yuyingyinya/fold_towel` (revisión `48cf95e0d1594940d4160f5cde7e8070c221904e`): 100 demostraciones, 99.151 frames a 30 Hz, todas empleadas para entrenamiento. Se ejecutó en cuatro GPUs A800 con batch size 5 por GPU, acumulación de gradiente 1 y batch global 20; learning rate constante 1e-5 con AdamW, weight decay 0.01, clipping de norma global 1.0, BF16 y DeepSpeed ZeRO-1, semilla 42. Cada época son 4.958 actualizaciones de optimizador y la ejecución completa son 6 épocas (29.748 actualizaciones); este checkpoint es la época 1. Las acciones son objetivos absolutos de articulación de 14 dimensiones en radianes (6 articulaciones + pinza por brazo, pinzas como fracción de apertura de 0.08 m), con normalización min/max específica de la tarea. La entrada visual son tres cámaras RGB (`top_head`, `hand_left`, `hand_right`) redimensionadas a 224×224 y concatenadas horizontalmente a 224×672. Se optimizan simultáneamente las pérdidas de denoising de vídeo y de acción con pesos iguales y `action_idm_prob` 0.5. El entrenamiento comenzó el 2026-11-12 a las 17:38 (Asia/Singapur).

## Capacidades

- Generación de acciones robóticas bimanuales: produce chunks de 32 pasos de 14 dimensiones (articulaciones absolutas y apertura de pinza) para un robot Agilex PiPER de dos brazos.
- Predicción de vídeo futuro: en modo `idm` primero genera el futuro visual y después las acciones, lo que permite inspeccionar la "intención" del modelo antes de ejecutar.
- Condicionamiento por instrucción en lenguaje natural: la tarea se codifica con el encoder de texto UMT5 de Wan2.1 (contexto de 128 tokens).
- Percepción multivista: consume tres cámaras RGB simultáneas (cabeza y una por mano) en una única imagen concatenada de 224×672.
- Fusión de propriocepción: incorpora un encoder de propriocepción para el estado del robot.
- Manipulación deformable: la tarea objetivo es doblar una toalla en varias direcciones (borde corto, borde largo, borde corto) y alisarla.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni capacidades de audio; no es un modelo de propósito general.

## Casos de uso

- Investigación en políticas visuomotoras basadas en modelos de vídeo: sirve como checkpoint de referencia para comparar la inicialización "fresh IDM" frente a "IO reset" con datos e hiperparámetros idénticos, aislando el efecto de la inicialización del experto de acción.
- Doblado bimanual de tejidos en laboratorio: el modelo ejecuta la secuencia de doblado de toalla descrita en la instrucción, útil para estudiar manipulación deformable con dos brazos y cámaras egocéntricas.
- Evaluación de arquitecturas mundo-acción: al predecir primero el vídeo futuro y luego las acciones (`action_infer_mode="idm"`, 20 pasos de inferencia), permite analizar la calidad de la imaginación visual como indicador previo a la ejecución.
- Reproducción de experimentos: el repositorio incluye `code.zip` (FastWAM v8), `requirements-fastwam.txt` y `config.yaml` resuelto, lo que facilita replicar el pipeline de entrenamiento en un clúster con A800 o equivalente.
- Base para fine-tunes en otras tareas de manipulación: al estar construido sobre Wan2.2-TI2V-5B, puede servir de punto de partida para tareas con el mismo contrato de 14 dimensiones y layout de cámaras, ajustando `dataset_stats.json` e `inference_contract.json`.
- Estudio de robustez y calibración de normalización: el requisito estricto de usar las estadísticas del mismo repositorio lo convierte en un caso práctico para analizar cómo errores de normalización degradan las acciones generadas.
- Docencia y divulgación técnica: ejemplo completo y autocontenido de un pipeline de entrenamiento de políticas robóticas con DeepSpeed ZeRO-1, BF16 y pérdidas conjuntas de vídeo y acción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reporta tasa de éxito en bucle cerrado ni resultado de validación en conjunto reservado, y advierte que la pérdida de entrenamiento no es una métrica de éxito en la tarea robótica.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 12 GB (pesos en BF16 más código y metadatos); se requiere además descargar por separado los pesos del VAE de Wan2.2-TI2V-5B vía `DIFFSYNTH_MODEL_BASE_PATH` y el encoder de texto UMT5 de Wan2.1 con su tokenizador.
- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del modelo base (5B en el experto de vídeo) y los pesos en BF16, se requiere una GPU de gama alta con al menos 24-40 GB de VRAM, aunque la cifra exacta no está publicada.
- GPU de entrenamiento documentadas: cuatro NVIDIA A800 con batch size 5 por GPU, DeepSpeed ZeRO-1 y BF16.
- GPU recomendadas para inferencia: A100, A800, H100 o equivalentes con suficiente VRAM; no se confirma que quepa en GPUs de consumo como RTX 4090 (24 GB), dado que no se publican requisitos exactos ni versiones cuantizadas.
- Opciones de despliegue: no es un modelo `from_pretrained` de Transformers. Requiere extraer `code.zip`, instalar el checkout de FastWAM incluido y construir el modelo con `hydra.utils.instantiate(cfg.model, model_dtype=torch.bfloat16, device=...)`, seguido de `model.load_checkpoint("model.pt")` y `model.infer_action(..., action_infer_mode="idm", num_inference_steps=20)`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La inferencia implica generar primero el vídeo futuro y después el chunk de 32 acciones con 20 pasos de difusión, lo que añade coste frente a políticas puramente reactivas.
- Nota de portabilidad: la configuración conserva rutas del sistema de ficheros de la máquina de entrenamiento y deben actualizarse para otro entorno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastWAM Fold Towel Fresh IDM (este) | Base 5B (vídeo) + experto de acción; total no disponible | Instrucción 128 tokens; 9 frames; chunk de 32 acciones | Doblado bimanual de toalla con Agilex PiPER | other | Público en HF (checkpoint de evaluación, época 1) |
| FastWAM Optional-IDM Songling (paso 45.000) | no disponible | no disponible | Tarea Songling (no especificada) | no disponible | No público (citado como origen del experto de vídeo) |
| Variante FastWAM "IO reset" del mismo experimento | Idéntica arquitectura | Idénticos datos e hiperparámetros | Doblado bimanual de toalla | no disponible | No se indica repositorio público en la información disponible |
| Wan-AI/Wan2.2-TI2V-5B (modelo base) | 5B | Modelo generativo texto-imagen-vídeo | Generación de vídeo, no robótica | no disponible en la información | Público en Hugging Face |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes. Las alternativas de la misma categoría (políticas visuomotoras de manipulación deformable) no se detallan en la información proporcionada.

## Limitaciones y advertencias

- No hay métricas de éxito en bucle cerrado ni validación en conjunto reservado; la pérdida de entrenamiento no debe interpretarse como rendimiento en la tarea.
- Es un checkpoint de evaluación de la época 1 de 6 y no incluye estado de optimizador ni de scheduler, por lo que no permite reanudar el entrenamiento exactamente.
- Dependencia estricta de las estadísticas de normalización: usar `dataset_stats.json` de otro checkpoint produce acciones incorrectas.
- Requiere respetar el contrato de 14 dimensiones (6 articulaciones + pinza por brazo, pinzas como fracción de 0.08 m) y el layout de cámaras (`top_head`, `hand_left`, `hand_right`); cualquier desviación invalida las predicciones.
- La configuración contiene rutas absolutas de la máquina de entrenamiento que deben corregirse.
- Dependencias externas no incluidas en el repositorio: VAE de Wan2.2-TI2V-5B y encoder de texto UMT5 de Wan2.1 con tokenizador.
- Licencia "other": no se detallan los términos; es imprescindible revisar las condiciones antes de cualquier uso comercial, especialmente por la herencia del modelo base Wan2.2-TI2V-5B.
- Entrenado con solo 100 demostraciones de una única tarea y un único robot; se espera una generalización muy limitada a otras toallas, entornos, cámaras o morfologías.
- No se documentan sesgos específicos, pero al ser un modelo de robótica entrenado con datos limitados, puede fallar ante variaciones de iluminación, textura o posiciones iniciales no representadas.
- Riesgo de alucinación visual en la predicción del vídeo futuro: el modo `idm` genera primero el futuro y luego las acciones, de modo que errores en la imaginación pueden propagarse a la política.
- Idiomas soportados no documentados; la instrucción de ejemplo está en inglés y el encoder de texto es el de Wan2.1, no un modelo multilingüe validado para robótica.
- No es un modelo de lenguaje: no admite tool calling, agentes conversacionales ni razonamiento simbólico.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dddddsds31341/FastWAM-Fold-Towel-FreshIDM-Epoch-1
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Dataset de entrenamiento: https://huggingface.co/datasets/yuyingyinya/fold_towel
- Código FastWAM de referencia citado en la model card: `yuantianyuan01/FastWAM@7faa711` (no se proporciona URL directa en la información disponible)
- Script de preprocesado del backbone de acción: `scripts/preprocess_action_dit_backbone.py` dentro del `code.zip` incluido (no se proporciona URL directa)
