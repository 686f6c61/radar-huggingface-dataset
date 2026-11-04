# RoboColosseum/yam-g0.5

## Resumen

Galaxea G0.5 — MolmoAct2-BimanualYAM Full es un modelo de visión-lenguaje-acción (VLA) para robótica bimanual, publicado por RoboColosseum bajo licencia Apache 2.0. Se construye sobre la base `OpenGalaxea/G05` (un VLM Qwen2.5-2B combinado con un "action expert") y se ha afinado completamente sobre el dataset MolmoAct2-BimanualYAM de AllenAI, compuesto por 32.246 episodios y 76 millones de fotogramas de manipulación bimanual.

La relevancia del modelo radica en su enfoque de codificación de acciones: en lugar de predecir vectores continuos, utiliza un ActionCodec con cuantización vectorial (VQ) de tamaño de codebook 4096, de modo que la pérdida de entrenamiento es una entropía cruzada sobre tokens de acción. El espacio de acciones es un vector plano de 14 dimensiones (6 articulaciones + pinza por cada brazo) y las observaciones combinan tres cámaras: cabeza (vista superior) y dos muñecas.

El checkpoint publicado corresponde al paso 95.000 de un entrenamiento que no llegó a completar una época (0,48 épocas), con una pérdida que descendió de 5,18 a 2,57. Es, por tanto, un modelo de investigación con entrenamiento parcial, útil como referencia reproducible de la receta YAM sobre la base G05, pero sin métricas de evaluación publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA: VLM Qwen2.5-2B + action expert, con ActionCodec VQ (codebook 4096) |
| Parametros totales | no disponible (la base VLM es de 2B; el total incluye el action expert) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en `model.pt`, sin variantes GGUF/INT8 documentadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`model.pt`), más `action_tokenizer.pt` y `dataset_stats.json` |

## Arquitectura y entrenamiento

El modelo sigue el paradigma VLA de dos componentes: un backbone de visión-lenguaje Qwen2.5-2B que procesa las imágenes de las tres cámaras y el contexto de la tarea, y un action expert que genera acciones a través de un codec discreto. El ActionCodec aplica cuantización vectorial con un codebook de 4096 entradas sobre el vector de acción/estado de 14 dimensiones (seis articulaciones y pinza por brazo), lo que convierte la predicción de acciones en un problema de modelado de lenguaje sobre tokens discretos. La pérdida reportada es entropía cruzada sobre esos tokens VQ.

El entrenamiento consistió en un fine-tune completo sobre los 32.246 episodios del dataset MolmoAct2-BimanualYAM, distribuido en 8 GPU H200 con DDP y un global batch size de 384 (48 por GPU). Se usó Adam de 8 bits, LR 3,75e-5 con escalado lineal desde una base de 2,5e-5, scheduler coseno con ratio mínimo 0,1, warmup de 500 pasos y weight decay de 0,03. El multiplicador de LR para la torre de visión fue de 0,1. El entrenamiento se detuvo en el paso 95.000 de los aproximadamente 197.917 que componen una época, es decir, 0,48 épocas, con la pérdida bajando de 5,18 a 2,57.

## Capacidades

- Generación de acciones motoras bimanuales de 14 dimensiones a partir de observaciones visuales y contexto de tarea.
- Percepción visual multi-cámara: vista de cabeza (superior) y dos vistas de muñeca, alineadas con la configuración del dataset de entrenamiento.
- Control de pinzas y articulaciones de ambos brazos de forma conjunta (coordinación bimanual).
- Modelado de acciones como tokens discretos mediante ActionCodec VQ, lo que permite reutilizar técnicas de decodificación propias de modelos de lenguaje.
- Comprensión de instrucciones en lenguaje natural heredada del backbone Qwen2.5-2B (idiomas concretos no documentados).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso orientado a agentes de software.

## Casos de uso

- Manipulación bimanual en laboratorio: el modelo puede ejecutar tareas de agarre y ensamblaje con dos brazos coordinados, aprovechando el espacio de acciones de 14 dimensiones entrenado sobre el dataset YAM.
- Investigación en VLA con acciones discretas: sirve como referencia reproducible para estudiar el impacto del ActionCodec VQ (codebook 4096) frente a cabezas de regresión continua.
- Reproducción de la receta YAM sobre G05: los ficheros `yam_full.yaml`, `dataset_stats.json` y `action_tokenizer.pt` permiten replicar el pipeline de entrenamiento y comparar hiperparámetros.
- Punto de partida para fine-tuning en dominios específicos: al ser un fine-tune completo con licencia Apache 2.0, puede adaptarse a nuevos conjuntos de datos robóticos con el mismo formato de 14 dimensiones y tres cámaras.
- Evaluación de robustez multi-cámara: útil para medir cómo afecta la combinación de vista superior y vistas de muñeca a la precisión de las políticas bimanuales.
- Docencia y prototipado en robótica: su tamaño (base de 2B) y su licencia permisiva facilitan su uso en entornos académicos con infraestructura moderada, siempre que se respete la configuración de cámaras y el espacio de acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la evolución de la pérdida de entrenamiento (de 5,18 a 2,57 en entropía cruzada sobre tokens VQ) y el número de pasos completados (95.000 de ~197.917 por época).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio ocupa 11,9 GB, lo que orienta sobre el orden de magnitud de los pesos en el formato publicado.
- GPU recomendadas: no documentadas por el autor; el entrenamiento se realizó en 8x H200.
- Cabe en GPU de consumo: no confirmado; el tamaño del repositorio (11,9 GB) sugiere que podría requerir GPUs con 16-24 GB de VRAM o más, pero no hay datos oficiales.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; los pesos se distribuyen como `model.pt` de PyTorch, por lo que el despliegue requiere cargar el checkpoint con el código del repositorio GalaxeaVLA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Galaxea G0.5 — MolmoAct2-BimanualYAM Full | Base VLM 2B + action expert | no disponible | 0,48 épocas sobre 32.246 episodios | Apache 2.0 | HuggingFace (RoboColosseum) |
| OpenGalaxea/G05 (base) | Base VLM 2B + action expert | no disponible | Preentrenamiento de la base | no disponible en la información proporcionada | HuggingFace (OpenGalaxea) |
| MolmoAct2-BimanualYAM (dataset) | no aplica (conjunto de datos) | no aplica | 32.246 episodios / 76M fotogramas | no disponible en la información proporcionada | HuggingFace (allenai) |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que la comparación se limita a parámetros conocidos, licencia y disponibilidad.

## Limitaciones y advertencias

- Entrenamiento parcial: solo se completaron 0,48 épocas (95.000 de ~197.917 pasos), por lo que el modelo no ha visto el dataset completo y su convergencia es limitada.
- Ausencia de evaluación: no hay benchmarks, métricas de éxito en tareas ni validación en entornos reales publicados.
- Acoplamiento al formato del dataset: espera un vector de acción/estado de 14 dimensiones y tres cámaras concretas (cabeza superior, muñeca izquierda, muñeca derecha); usarlo con otra configuración requiere reentrenamiento o adaptación.
- Riesgo de alucinación y errores de política: como modelo generativo de acciones, puede producir secuencias inválidas o inseguras en entornos físicos; requiere supervisión y límites de seguridad en el robot.
- Sesgos: no documentados por el autor; el dataset de origen puede introducir sesgos de escena, objetos y condiciones de iluminación.
- Idiomas: no se especifican los idiomas soportados para las instrucciones en lenguaje natural, aunque el backbone Qwen2.5-2B es multilingüe.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del dataset MolmoAct2-BimanualYAM y de la base OpenGalaxea/G05 antes de un despliegue comercial.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RoboColosseum/yam-g0.5
- Dataset MolmoAct2-BimanualYAM: https://huggingface.co/datasets/allenai/MolmoAct2-BimanualYAM-Dataset
- Base OpenGalaxea/G05: https://huggingface.co/OpenGalaxea/G05
- Registro de entrenamiento en WandB: https://wandb.ai/shaileshxml-nus/g05-yam/runs/dmlvtlqz
