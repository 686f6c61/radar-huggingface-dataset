# bbidpa/Qwen2.5-Coder-0.5B-Flutter-steps

## Resumen

Qwen2.5-Coder-0.5B-Flutter-steps es un fine-tuning del modelo Qwen2.5-Coder-0.5B, desarrollado por el usuario bbidpa, que enseña al modelo a construir archivos Flutter/Dart de forma iterativa. En lugar de generar un archivo completo de una sola vez, el modelo recibe un objetivo, el estado actual del código y un historial de acciones previas, y emite pequeños bloques de búsqueda y reemplazo (diffs) hasta completar la tarea, señalando el final con la etiqueta `<DONE>`. Este enfoque está pensado para estudiar si los modelos pequeños se benefician más de aprender a construir código paso a paso que de emitirlo directamente.

El modelo se entrenó con 50 millones de tokens del dataset bbidpa/flutter-diff-steps-v1, que contiene secuencias de pasos para editar archivos Flutter. Con 493,8 millones de parámetros, hereda la arquitectura transformer de Qwen2.5-Coder y una ventana de contexto de 32K tokens. Es relevante para desarrolladores e investigadores interesados en la generación de código iterativa y en la comparación entre estrategias de entrenamiento para modelos de código de pequeño tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Qwen2.5-Coder) |
| Parametros totales | 493.811.456 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32K tokens (heredado del modelo base Qwen2.5-Coder-0.5B) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Qwen2.5-Coder-0.5B, que sigue la arquitectura transformer decoder-only de la serie Qwen2.5. El entrenamiento se realizo sobre 50M de tokens del dataset bbidpa/flutter-diff-steps-v1, compuesto por secuencias de pasos de edicion de codigo Flutter/Dart. Cada ejemplo incluye un objetivo (`<GOAL>`), el codigo actual (`<CODE>`), un historial de acciones previas (`<HISTORY>`) y la salida esperada en forma de un diff con etiquetas `<SEARCH>` y `<REPLACE>`.

La innovacion principal es el paradigma de generacion iterativa: en lugar de emitir el archivo completo en una sola pasada, el modelo produce un pequeno cambio a la vez, acumulando el historial de acciones para mantener coherencia. Este enfoque se compara directamente con el modelo companion Qwen2.5-Coder-0.5B-Flutter-direct, que genera el archivo entero de una sola vez, para evaluar cual estrategia es mas efectiva en modelos de menos de 1B de parametros.

## Capacidades

- Generacion de codigo Flutter/Dart paso a paso mediante diffs de busqueda y reemplazo.
- Edicion iterativa de archivos de codigo existentes, manteniendo un historial de acciones previas.
- Soporte de tareas de desarrollo de interfaces de usuario con Flutter, como anadir widgets, conectar controladores o implementar metodos.
- Capacidad de seguir instrucciones de alto nivel (objetivos) y traducirlas en cambios concretos en el codigo.
- No incluye soporte explicito de tool calling, agentes ni funciones de vision o audio.
- Solo soporta ingles como idioma de entrada y salida.

## Casos de uso

- Desarrollo asistido de widgets Flutter: el modelo puede anadir nuevos widgets o modificar los existentes en un archivo a partir de una descripcion de alto nivel, como anadir un boton de login o un campo de texto, emitiendo diffs precisos que se pueden aplicar con herramientas de edicion.
- Refactorizacion de codigo en proyectos Flutter: dado un archivo con codigo existente y un objetivo de cambio (por ejemplo, renombrar variables o reorganizar widgets), el modelo genera una secuencia de pasos de edicion que mantienen la coherencia del archivo.
- Automatizacion de tareas de mantenimiento en repositorios Flutter: se puede integrar en un pipeline de CI/CD para aplicar cambios de codigo de forma iterativa, revisando cada diff antes de su aplicacion.
- Generacion de codigo educativo: el modelo puede servir como herramienta de aprendizaje para desarrolladores de Flutter, mostrando como se construye un archivo paso a paso, con explicaciones en cada accion.
- Prototipado rapido de interfaces: permite a un desarrollador describir una interfaz y obtener el codigo Flutter correspondiente de forma incremental, facilitando la revision de cada cambio.
- Comparacion de estrategias de entrenamiento: en el contexto de investigacion, se puede usar como parte de un estudio sobre generacion iterativa vs. directa en modelos pequenos, junto con su contraparte `-direct`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye un dataset de evaluacion (bbidpa/Qwen2.5-Coder-0.5B-Flutter-steps-eval) pero no se proporcionan metricas ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB en precision BF16/FP16, y menos de 1 GB con cuantizacion de 4 bits.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 3060 o superior. Tambien puede ejecutarse en CPU para uso puntual, aunque con latencia mayor.
- Cabe en GPUs de consumo y en entornos sin GPU (solo CPU) para tareas de baja frecuencia.
- Opciones de despliegue: transformers, vLLM, llama.cpp, Ollama o Text Generation Inference (TGI), ya que es compatible con `transformers` y `text-generation-inference`.
- Latencia y throughput: no disponible en la informacion proporcionada, pero al ser un modelo de 0.5B, es esperable una latencia baja en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Estrategia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-Coder-0.5B-Flutter-steps (este modelo) | 493,8M | 32K | Iterativa (diffs) | MIT | Hugging Face |
| Qwen2.5-Coder-0.5B-Flutter-direct | 493,8M | 32K | Directa (archivo completo) | MIT | Hugging Face |
| Qwen2.5-Coder-0.5B (base) | 493,8M | 32K | Generacion de codigo general | Apache 2.0 | Hugging Face |
| Rainbow-Pony-100M-Flutter-steps | 100M | No disponible | Iterativa (diffs) | No disponible | Hugging Face |

La comparativa se centra en el mismo modelo base y en la version from-scratch de 100M, mostrando las diferencias en estrategia de generacion. No hay datos de rendimiento publicados para comparar numericamente.

## Limitaciones y advertencias

- Modelo de pequeno tamano (0.5B) con riesgo elevado de alucinacion en codigo, especialmente en Flutter/Dart complejo o con APIs menos comunes.
- Sesgo hacia el conjunto de datos de entrenamiento: puede generar codigo con estilos o patrones especificos del dataset, no representativos de la comunidad Flutter en general.
- Solo soporta el idioma ingles; no se recomienda para prompts en otros idiomas.
- Limitado a la generacion iterativa de diffs; no esta disenado para generacion de codigo generalista fuera del dominio Flutter/Dart.
- La licencia MIT permite uso comercial, pero no hay garantias de calidad ni soporte oficial.
- Para produccion, se recomienda evaluar exhaustivamente la calidad del codigo generado, ya que los diffs podrian introducir errores si no se revisan cuidadosamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bbidpa/Qwen2.5-Coder-0.5B-Flutter-steps
- Dataset de entrenamiento: https://huggingface.co/datasets/bbidpa/flutter-diff-steps-v1
- Dataset de evaluacion: https://huggingface.co/datasets/bbidpa/Qwen2.5-Coder-0.5B-Flutter-steps-eval
- Modelo comparativo directo: https://huggingface.co/bbidpa/Qwen2.5-Coder-0.5B-Flutter-direct
- Modelo from-scratch iterativo: https://huggingface.co/bbidpa/Rainbow-Pony-100M-Flutter-steps
- Modelo from-scratch directo: https://huggingface.co/bbidpa/Rainbow-Pony-100M-Flutter-direct
- Informe tecnico de Qwen2.5-Coder: https://arxiv.org/html/2409.12186v2
- Pagina de Friendli AI del modelo: https://friendlier.ai/models/bbidpa/Qwen2.5-Coder-0.5B-Flutter-steps
