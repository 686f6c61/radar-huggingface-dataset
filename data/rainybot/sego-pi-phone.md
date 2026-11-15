# RainyBot/SeGo-pi-Phone

## Resumen
SeGo-pi-Phone es un checkpoint de política robótica (policy) derivado de PI0, el modelo base de visión-lenguaje-acción (VLA) de Physical Intelligence, afinado por el autor RainyBot para tareas de manipulación con teléfono. No es un modelo de lenguaje generativo al uso: es un checkpoint de inferencia OpenPI que produce acciones de efector final (end-effector) a partir de observaciones visuales multimodales y un prompt de tarea. El paquete incluye los pesos en PyTorch originales, las estadísticas de normalización, el tokenizer y la descripción de la interfaz de inferencia.

El modelo tiene 3.238.048.528 parámetros (aproximadamente 3,24 mil millones) según los safetensors del repositorio, con un tamaño de repo de 6,5 GB. Está pensado para ejecutarse con la implementación compatible de OpenPI en RainyRobo/openpi, no como un checkpoint de Transformers AutoModel. El autor indica explícitamente que se trata de una instantánea de un entrenamiento en curso y que no se reclama ningún resultado de evaluación en bucle cerrado sobre robot real.

Su relevancia ahora es la de un ejemplo temprano y reproducible de afinado de PI0 para una tarea concreta (manipulación de teléfono) con acciones absolutas de efector final, empaquetado para inferencia offline. La información disponible es escasa y proviene casi exclusivamente de la model card; no hay benchmarks ni validación independiente publicada.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Política VLA derivada de PI0 (OpenPI); no disponible el detalle interno exacto |
| Parametros totales | 3.238.048.528 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors PyTorch) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0-and-gemma-terms (Apache-2.0 más Gemma Terms of Use para componentes derivados de Gemma) |
| Formato de pesos | safetensors (PyTorch); no es un checkpoint de Transformers AutoModel |

## Arquitectura y entrenamiento
SeGo-pi-Phone es un afinado (fine-tuning) del modelo base PI0, un modelo de visión-lenguaje-acción orientado a control robótico. La model card no detalla la arquitectura interna (número de capas, mecanismo de atención, componentes de visión), por lo que esa información debe considerarse no disponible. El checkpoint se distribuye como política OpenPI con su interfaz de inferencia: entrada compuesta por un diccionario `image` con `base_0_rgb`, `left_wrist_0_rgb` y `right_wrist_0_rgb` (arrays RGB uint8 en formato HWC), un vector `state` de 16 dimensiones y un `prompt` de tarea.

El entrenamiento utiliza acciones absolutas de efector final: primero brazo izquierdo y después derecho, cada uno con xyz, cuaternión xyzw y gripper. Los datos de estado/acción tienen 16 dimensiones, pero el modelo usa 32 dimensiones con padding y un horizonte de acción de 32; para la interfaz robótica deben conservarse las primeras 16 dimensiones de salida. Se debe preservar el marco de coordenadas del dataset y la convención de gripper. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO.

## Capacidades
- Generación de acciones de efector final para control robótico de dos brazos (izquierdo y derecho) con xyz, cuaternión xyzw y gripper.
- Procesamiento multimodal de tres cámaras: base, muñeca izquierda y muñeca derecha.
- Condicionamiento por prompt de tarea en inglés.
- Inferencia con estado de 16 dimensiones y horizonte de acción de 32 pasos.
- Integración con el stack OpenPI (script `serve_policy.py`).
- No se documentan capacidades de tool calling, agentes multi-paso, matemáticas, código ni thinking mode; no disponible.

## Casos de uso
- Manipulación de teléfono en robot de dos brazos: el modelo recibe las tres vistas de cámara y el estado actual y emite las acciones absolutas de ambos efectores para tareas de agarre y manipulación del dispositivo, aprovechando el horizonte de 32 pasos.
- Investigación en afinado de políticas VLA: sirve como checkpoint de partida o referencia para estudiar cómo se adapta PI0 a una tarea concreta con acciones absolutas de efector final.
- Reproducción de pipelines OpenPI: permite validar la interfaz de inferencia (`image`, `state`, `prompt`) y el script `serve_policy.py` en entornos de laboratorio.
- Evaluación offline de normalización y tokenizer: el paquete incluye estadísticas de normalización y tokenizer para reproducibilidad, útil para depurar preprocesado de datos robóticos.
- Prototipado de control con cámaras de muñeca: el uso de `left_wrist_0_rgb` y `right_wrist_0_rgb` facilita experimentos de manipulación fina con realimentación visual cercana.
- Base para comparativas de políticas robóticas: al ser un checkpoint pequeño (3,24 mil millones de parámetros, 6,5 GB) puede desplegarse en GPUs de laboratorio para comparar contra otras políticas PI0 afinadas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se reclama ningún resultado de evaluación en bucle cerrado sobre robot real, y que la compatibilidad con GPU y robot real de este archivo no ha sido probada de forma independiente.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial; con 3,24 mil millones de parámetros en safetensors PyTorch, la carga en precisión nativa requiere del orden de 6,5 GB o más solo para pesos, más memoria para activaciones y las tres imágenes de entrada.
- GPU recomendadas: no disponible; el autor no especifica modelos concretos.
- ¿Cabe en GPU de consumo? No confirmado; por tamaño de pesos es plausible en GPUs con 12-16 GB o más, pero no hay validación publicada.
- Opciones de despliegue: stack OpenPI con `scripts/serve_policy.py` y la configuración `pi0_xtrainer2_phone_eef`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SeGo-pi-Phone | 3.238.048.528 | no disponible | sin benchmarks publicados | apache-2.0-and-gemma-terms | Hugging Face (RainyBot/SeGo-pi-Phone) |
| PI0 base (Physical Intelligence) | no disponible en la información | no disponible | no disponible | no disponible en la información | no disponible en la información |
| Otras políticas OpenPI afinadas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la información proporcionada para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias
- Checkpoint de un entrenamiento en curso: el autor advierte que es una instantánea y que no se reclama ningún resultado de evaluación en bucle cerrado.
- Sin validación independiente: la compatibilidad con GPU y con robot real de este archivo no ha sido probada de forma independiente.
- No es un checkpoint de Transformers AutoModel: requiere el stack OpenPI y la configuración `pi0_xtrainer2_phone_eef`.
- Tokenizer offline: el tokenizer empaquetado debe colocarse en la caché estándar de OpenPI para inferencia totalmente offline; de lo contrario, se resuelve desde la ubicación GCS cacheada.
- Convenciones estrictas: hay que preservar el marco de coordenadas del dataset y la convención de gripper, y conservar solo las primeras 16 dimensiones de salida.
- Idioma: solo inglés en los prompts de tarea.
- Licencia: Apache-2.0 más Gemma Terms of Use para componentes derivados de Gemma; revisar ambas antes de uso comercial.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser una política robótica, el riesgo principal es la ejecución de acciones incorrectas en el robot.

## Enlaces
- Hugging Face: https://huggingface.co/RainyBot/SeGo-pi-Phone
- Licencia Gemma: https://huggingface.co/RainyBot/SeGo-pi-Phone/blob/main/LICENSE_GEMMA.txt
- Implementación OpenPI compatible: RainyRobo/openpi (referenciada en la model card; no se proporciona URL directa en la información disponible)
