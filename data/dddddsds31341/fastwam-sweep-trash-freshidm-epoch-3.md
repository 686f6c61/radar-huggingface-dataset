# dddddsds31341/FastWAM-Sweep-Trash-FreshIDM-Epoch-3

## Resumen

FastWAM Sweep Trash — Fresh IDM, Epoch 3 es un checkpoint de evaluación de un modelo de robotica bimanual desarrollado por el usuario dddddsds31341. Se trata de un fine-tune independiente del modelo base Wan-AI/Wan2.2-TI2V-5B, orientado a la tarea concreta de barrer dos trozos de papel arrugado hacia una pala de recogida con un robot de dos brazos Agilex PiPER. El modelo forma parte del marco FastWAM, que combina un experto de video con un experto de accion para generar trayectorias de robot a partir de instrucciones en lenguaje natural e imagenes de camaras.

La relevancia de este checkpoint es acotada: no es un modelo de proposito general, sino un peso intermedio de un entrenamiento de 6 epocas (epoca 3, paso de optimizador 7275) que se publica como material de evaluacion. El autor entrena dos inicializaciones con datos e hiperparametros identicos (IO reset y Fresh IDM) y este repositorio corresponde a la segunda. No se reportan tasas de exito en robot real ni resultados de validacion retenida, por lo que su interes es fundamentalmente reproductivo y de investigacion en politicas visomotoras bimanuales.

Arquitectonicamente hereda el DiT de Wan2.2-TI2V-5B para el experto de video, mientras que el experto de accion se reinicializa por completo: su transformer parte de una interpolacion lineal del DiT a hidden size 1024 y los codificadores de accion y propiocepcion se inicializan de forma aleatoria con semilla 42. El repositorio ocupa 12 GB e incluye pesos en BF16, configuracion resuelta, estadisticas de normalizacion y el codigo de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastWAM: experto de video basado en DiT de Wan2.2-TI2V-5B + experto de accion con transformer interpolado a hidden size 1024 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens para el embedding UMT5 de la instruccion de tarea |
| Tipos de cuantizacion | no disponible (pesos almacenados en BF16) |
| Idiomas soportados | no disponible (instrucciones de tarea en ingles en el ejemplo publicado) |
| Licencia | other |
| Formato de pesos | model.pt (PyTorch, BF16), no es un modelo `from_pretrained` de Transformers |
| Modelo base | Wan-AI/Wan2.2-TI2V-5B (fine-tune) |
| Entrada visual | 3 camaras RGB (top_head, hand_left, hand_right), 224x224 cada una, concatenadas a 224x672; 9 frames de video |
| Salida de accion | chunk de 32 pasos, 14 dimensiones (6 articulaciones + gripper por brazo) |
| Frecuencia de datos | 30 Hz |
| Hardware de entrenamiento | 4x A800, batch global 20, BF16, DeepSpeed ZeRO-1 |

## Arquitectura y entrenamiento

El modelo sigue el diseno FastWAM, en el que un experto de video y un experto de accion comparten un proceso de denoising conjunto con perdidas de video y accion ponderadas por igual. El experto de video parte del checkpoint preentrenado FastWAM Optional-IDM Songling (paso 45.000, no publico). El experto de accion se reinicializa integramente: el transformer se obtiene interpolando linealmente el DiT de Wan2.2-TI2V-5B hasta hidden size 1024 mediante el script `scripts/preprocess_action_dit_backbone.py`, mientras que el codificador de accion, la cabeza de accion y el codificador de propiocepcion se inicializan aleatoriamente con semilla 42. La inferencia en modo `idm` predice primero el video futuro y despues el chunk de 32 acciones con 20 pasos de denoising.

El entrenamiento utiliza el dataset `yuyingyinya/sweep_trash` (revision 0dd5ff1f576de17dcf06b49d352e0f125a1f43e6), con 100 demostraciones y 48.495 frames a 30 Hz, todas empleadas para entrenamiento. Se usan 4 GPUs A800 con batch de 5 por GPU y acumulacion de gradientes 1 (batch global 20), learning rate constante de 1e-5, AdamW con weight decay 0.01, clipping de norma global 1.0, BF16 y DeepSpeed ZeRO-1, semilla 42. Cada epoca comprende 2.425 actualizaciones de optimizador; la ejecucion completa son 6 epocas y 14.550 actualizaciones. Las acciones son objetivos absolutos de articulacion en radianes (6 articulaciones + gripper por brazo), con los grippers expresados como fraccion de apertura sobre 0.08 m. Se aplica normalizacion min/max especifica de la tarea y `action_idm_prob` de 0.5. El entrenamiento comenzo el 2026-11-13 a las 16:48 (Asia/Singapore).

## Capacidades

- Generacion de trayectorias de accion bimanual de 32 pasos para un robot Agilex PiPER a partir de una instruccion de tarea y observaciones de tres camaras.
- Prediccion de video futuro como paso intermedio del proceso de denoising (modo `idm`).
- Ejecucion de tareas manipulativas compuestas que requieren coordinacion de dos brazos, como sujetar una pala con un gripper y barrer con el otro.
- Procesamiento de instrucciones en lenguaje natural mediante embeddings UMT5 en cache (contexto de 128 tokens).
- Fusión de informacion de tres vistas RGB (cabeza y ambas manos) en una unica entrada de 224x672.
- No dispone de tool calling, function calling, soporte de agentes multi-paso ni capacidades multilingues declaradas.
- No es un modelo de proposito general: no genera texto libre ni responde preguntas fuera del dominio de la politica robotica entrenada.

## Casos de uso

- Evaluacion de politicas visomotoras bimanuales: el checkpoint sirve para medir el comportamiento de la inicializacion Fresh IDM frente a IO reset en la tarea de barrido, cargando `model.pt` con `load_checkpoint` y ejecutando `infer_action` en modo `idm`.
- Reproduccion de experimentos de investigacion: al incluir `config.yaml`, `code.zip` (FastWAM v8 basado en `yuantianyuan01/FastWAM@7faa711`) y `requirements-fastwam.txt`, permite replicar el entorno de entrenamiento y comparar inicializaciones con datos e hiperparametros identicos.
- Desarrollo de pipelines de robotica con Agilex PiPER: el contrato de inferencia (`inference_contract.json`) define el orden de articulaciones, la referencia del gripper y la disposicion de camaras, lo que facilita integrar el modelo en un stack de control real.
- Estudio de normalizacion especifica de tarea: `dataset_stats.json` documenta las estadisticas min/max empleadas, util para analizar como afecta la normalizacion a la desnormalizacion de acciones en produccion.
- Benchmarking interno de modelos de accion: al ser un checkpoint intermedio de una ejecucion de 6 epocas, permite trazar curvas de aprendizaje y comparar el paso 7275 con otros checkpoints de la misma familia.
- Investigacion en generacion de video condicionada por accion: el experto de video, derivado de Wan2.2-TI2V-5B, puede estudiarse de forma aislada para analizar la coherencia entre video predicho y trayectoria generada.
- Pruebas de robustez ante vistas multiples: la configuracion de tres camaras concatenadas horizontalmente permite evaluar el impacto de la oclusion o del desalineamiento de camaras en la politica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se reporta tasa de exito en robot en bucle cerrado ni resultado de validacion retenida, y advierte que la perdida de entrenamiento no es una metrica de exito en la tarea robotica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio pesa 12 GB y los pesos se almacenan en BF16, por lo que se requiere al menos una GPU con memoria suficiente para el modelo completo mas el VAE de Wan2.2-TI2V-5B, que se carga por separado.
- GPU recomendadas: el entrenamiento se realizo en 4x A800; para inferencia se recomienda una GPU de clase A100 o H100 por la combinacion de experto de video y experto de accion.
- GPU de consumo: no se confirma compatibilidad con RTX 4090 u otras GPU de consumo; no hay datos de cuantizacion publicados que permitan reducir el footprint.
- Opciones de despliegue: no se soporta `from_pretrained` de Transformers. Es necesario extraer `code.zip`, instalar el checkout de FastWAM incluido, instanciar el modelo con `hydra.utils.instantiate(cfg.model, model_dtype=torch.bfloat16, device=...)`, cargar con `model.load_checkpoint("model.pt")` e inferir con `model.infer_action(..., action_infer_mode="idm", num_inference_steps=20)`.
- Dependencias adicionales: se requieren los pesos del VAE de Wan2.2-TI2V-5B (via `DIFFSYNTH_MODEL_BASE_PATH`) y el codificador de texto UMT5 de Wan2.1 con su tokenizer para codificar la instruccion en despliegue.
- Latencia y throughput: no disponibles. El proceso de inferencia incluye la prediccion de video futuro seguida de 20 pasos de denoising para el chunk de 32 acciones, lo que anade coste computacional frente a politicas de accion directa.
- Rutas de ficheros: `config.yaml` conserva rutas del sistema de ficheros de la maquina de entrenamiento y deben actualizarse para otro entorno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastWAM Sweep Trash — Fresh IDM, Epoch 3 | no disponible | 128 tokens (instruccion) | Politica bimanual de barrido | other | Pesos publicos en HF, sin benchmark |
| FastWAM Sweep Trash — IO reset (misma ejecucion) | no disponible | 128 tokens (instruccion) | Politica bimanual de barrido | other | Entrenado con datos e hiperparametros identicos segun la model card; disponibilidad publica no confirmada |
| FastWAM Optional-IDM Songling (checkpoint base) | no disponible | no disponible | Politica robotica general FastWAM | other | No publico (paso 45.000) |
| Wan-AI/Wan2.2-TI2V-5B (modelo base) | no disponible en la informacion | no disponible | Generacion de video texto-imagen-video | no disponible en la informacion | Publico en Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No se reporta tasa de exito en robot real ni validacion retenida; la perdida de entrenamiento no debe interpretarse como metrica de exito de la tarea.
- El checkpoint corresponde a la epoca 3 de 6 y al paso 7275, por lo que no representa el modelo final de la ejecucion.
- Las estadisticas de normalizacion y el contrato del gripper deben provenir exactamente de este repositorio; usar estadisticas de otro checkpoint produce acciones incorrectas.
- `model.pt` no incluye estado del optimizador ni del scheduler, de modo que no permite reanudar el entrenamiento de forma exacta.
- El modelo no es un `from_pretrained` estandar de Transformers y requiere el codigo FastWAM v8 incluido, ademas del VAE de Wan2.2-TI2V-5B y el codificador UMT5 de Wan2.1.
- La licencia es "other", sin terminos comerciales explicitos en la informacion disponible; debe revisarse antes de cualquier uso en produccion.
- El alcance esta limitado a la tarea de barrido con robot Agilex PiPER y a la convencion de 14 dimensiones descrita; no se garantiza generalizacion a otras tareas, robots o morfologias.
- El dataset contiene 100 demostraciones, un volumen reducido que puede favorecer el sobreajuste a las condiciones de recogida.
- No se declaran idiomas soportados; la instruccion de ejemplo esta en ingles y el codificador de texto se limita a 128 tokens.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible; en el contexto de politicas roboticas, el riesgo se traduce en trayectorias fisicamente invalidas o inseguras.
- `config.yaml` contiene rutas absolutas de la maquina de entrenamiento que deben reemplazarse.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dddddsds31341/FastWAM-Sweep-Trash-FreshIDM-Epoch-3
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Dataset: https://huggingface.co/datasets/yuyingyinya/sweep_trash
- Codigo FastWAM de referencia: https://github.com/yuantianyuan01/FastWAM (commit 7faa711, referenciado en la model card)
