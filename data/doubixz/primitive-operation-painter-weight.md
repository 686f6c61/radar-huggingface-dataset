# doubixz/primitive-operation-painter-weight

## Resumen

Primitive Operation Painter es un modelo autoregresivo desarrollado por doubixz, diseñado específicamente para predecir secuencias de primitivas de dibujo, es decir, instrucciones geométricas (rectángulos, triángulos, etc.) que permiten reconstruir una imagen mediante el algoritmo Geometrize. El modelo, denominado internamente como GeometrizeGPT, emplea una arquitectura Transformer de 24 capas con 307 millones de parámetros y una ventana de contexto de 144 pasos (10 pasos de prefijo más 134 pasos de predicción). A diferencia de los modelos de lenguaje generalistas, este sistema está orientado a la generación de representaciones vectoriales a partir de un prefijo de dibujo, lo que lo convierte en una herramienta interesante para la compresión de imágenes, el arte procedural y la síntesis de gráficos vectoriales.

La relevancia actual del modelo radica en su enfoque especializado: mientras que los modelos de difusión o GAN se centran en píxeles, Primitive Operation Painter opera sobre tokens discretos que codifican operaciones de dibujo, lo que permite una representación compacta y editable de imágenes. El autor ha liberado únicamente los pesos EMA (Exponential Moving Average) bajo licencia MIT, junto con un paquete de carga que requiere el código fuente principal `primitive-operation-painter`. El modelo se encuentra en una etapa de investigación inicial, con una pérdida de entrenamiento suavizada de 3.81 tras tres épocas, y no se han publicado aún resultados de benchmarks ni demos públicas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer autoregressive (GeometrizeGPT) |
| Parámetros totales | 307.487.744 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 144 pasos (10 prefijos + 134 de predicción) |
| Tipos de cuantización | no disponible (solo pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | no aplica (modelo de dibujo, no de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (también compatible con PyTorch) |

## Arquitectura y entrenamiento

El modelo está basado en una arquitectura Transformer estándar con 24 capas, una dimensión oculta de 1024 y 16 cabezas de atención. Su vocabulario de tokens alcanza los 2961 elementos, y cada paso de dibujo se representa mediante nueve tokens discretos siguiendo el layout `geometrize_256_v1`. El contexto de 144 pasos se divide en un prefijo de 10 pasos (probablemente el estado inicial de la imagen o los primeros trazos) y 134 pasos que el modelo debe predecir de forma autoregressive. La información de entrenamiento indica que se completaron tres épocas con 5397 pasos globales de optimización y una pérdida suavizada de 3.813381. No se especifican el conjunto de datos utilizado, el número total de tokens de entrenamiento ni técnicas de refinamiento como RLHF o DPO. El modelo emplea solo pesos EMA (media móvil exponencial), lo que sugiere que los pesos finales son una promediación de los pesos del optimizador para mejorar la generalización.

## Capacidades

- Generación de secuencias de primitivas de dibujo: el modelo predice pasos de dibujo (nueve tokens por paso) que representan operaciones geométricas para reconstruir una imagen.
- Reconstrucción de imágenes vectoriales: a partir de un prefijo de pasos, puede completar el dibujo de una escena o forma, produciendo una representación vectorial editable.
- Soporte de prefijos de contexto: acepta 10 pasos iniciales como entrada para condicionar la generación, lo que permite controlar el estilo o el contenido parcial.
- Sin capacidades de lenguaje: no procesa texto ni instrucciones verbales; su entrada y salida son exclusivamente tokens de dibujo.
- No soporta tool calling ni funciones de agente: es un modelo de generación secuencial puro, sin integración con herramientas externas.
- Multilingüe: no aplica, ya que no trabaja con texto.

## Casos de uso

- Compresión de imágenes: el modelo puede convertir una imagen raster en una secuencia de primitivas, reduciendo el peso de la representación al almacenar solo las operaciones de dibujo. En un pipeline de compresión, se usaría un codificador para generar el prefijo y el modelo para completar la secuencia, logrando una representación vectorial compacta.
- Generación de arte vectorial: artistas y diseñadores pueden usar el modelo como generador de formas geométricas abstractas, alimentándolo con un prefijo aleatorio o específico para obtener composiciones vectoriales listas para escalado sin pérdida.
- Creación de texturas procedurales: al predecir patrones de primitivas, el modelo puede generar texturas repetitivas o variaciones geométricas para entornos 3D o juegos, sin necesidad de edición manual.
- Edición de imágenes vectoriales: dado un dibujo parcial, el modelo puede completar las formas faltantes de manera coherente, útil en herramientas de diseño asistido por IA que sugieren extensiones de trazos.
- Investigación en modelos de secuencias geométricas: sirve como base para estudiar cómo los Transformers manejan la generación de estructuras discretas no lingüísticas, útil para comparar con modelos de lenguaje.
- Reconstrucción de imágenes históricas o de baja calidad: en escenarios donde se dispone de un esbozo inicial (el prefijo), el modelo puede inferir el resto de la imagen, aplicable en restauración de fotografías o digitalización de bocetos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es la pérdida de entrenamiento suavizada de 3.813381, pero no se ofrece comparación con otros modelos ni evaluaciones sobre tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 307 millones de parámetros. En FP32, el tamaño en memoria sería aproximadamente 1.2 GB (según el tamaño del repositorio, que incluye los pesos). En FP16, reduciría a unos 0.6 GB. La VRAM necesaria para inferencia depende de la longitud de contexto y el batch: con una secuencia de 144 pasos y 9 tokens por paso (1296 tokens en total), se puede ejecutar en una GPU con al menos 4 GB de VRAM, aunque se recomienda 8 GB para margen.
- GPU recomendadas: cualquier GPU consumer moderna, como una RTX 3060 o superior, puede manejar el modelo en FP16. Para una inferencia más rápida, se recomienda una RTX 4090 o A100.
- Cabe en consumer GPU: sí, en FP16 cabe en tarjetas con 8 GB de VRAM, como la RTX 2060 Super o superiores.
- Opciones de despliegue: al ser un modelo PyTorch, se puede servir con vLLM o TGI si se adapta a su formato, aunque su naturaleza no estándar (tokens de dibujo) requiere un pipeline personalizado. También se puede ejecutar con llama.cpp si se convierte a GGUF, pero no hay cuantizaciones publicadas. Para uso local, se puede cargar con la librería `load_pretrained` del código fuente acompañante.
- Latencia y throughput: no disponible, no se han publicado mediciones.

## Comparativa con modelos similares

No se han encontrado modelos directamente comparables en la información proporcionada. El modelo es específico para generación de primitivas, y no se dispone de alternativas con las mismas características o métricas de rendimiento. Se recomienda consultar futuras publicaciones del autor para evaluar comparativas con otros modelos de dibujo geométrico.

## Limitaciones y advertencias

- El modelo solo contiene pesos EMA; no se incluye el estado completo del optimizador ni los datos de entrenamiento, lo que impide reanudar el entrenamiento o reproducir resultados exactos.
- La ventana de contexto está limitada a 144 pasos, lo que restringe el tamaño de la imagen que se puede generar en una sola pasada; para imágenes más complejas se necesitaría un enfoque de ventana deslizante.
- No se han publicado evaluaciones sobre sesgos o riesgos de alucinación, pero al ser un modelo generativo, puede producir primitivas que no se correspondan con la imagen original si el prefijo es ambiguo.
- La licencia MIT permite uso comercial, pero el usuario debe verificar que los datos de entrada y salida que utilice cumplan con las normativas de derechos de autor, ya que el autor no redistribuye datos.
- No hay documentación sobre la robustez del modelo ante ruido o entradas fuera de distribución; se recomienda validar en escenarios reales antes de usarlo en producción.
- El modelo no es un modelo de lenguaje, por lo que no puede procesar instrucciones textuales ni interactuar con herramientas externas; su uso requiere un pipeline técnico especializado.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/doubixz/primitive-operation-painter-weight
- Código fuente acompañante: mencionado como `primitive-operation-painter` en la model card, pero no se proporciona URL explícita en la información disponible.
