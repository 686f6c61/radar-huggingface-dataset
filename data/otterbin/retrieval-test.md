# otterbin/retrieval-test

## Resumen

`otterbin/retrieval-test` es un prototipo de investigación publicado en HuggingFace por el usuario otterbin bajo licencia MIT. Se presenta explícitamente como un esqueleto de código y configuración para experimentar con una arquitectura denominada "cnn_transformer" orientada a tareas de retrieval (recuperación de información). No es un modelo entrenado: el propio autor indica que el checkpoint incluido sirve únicamente para pruebas de humo (smoke tests) y que no se reclama ninguna métrica de rendimiento.

El dato más llamativo es su tamaño: 16.576 parámetros totales según los safetensors del repositorio, es decir, un modelo de escala juguete (del orden de decenas de kilobytes en fp32) imposible de comparar con modelos de retrieval de producción. El repositorio contiene el código de definición y un punto de entrada de fine-tuning (`finetune.py`), la configuración de arquitectura (`config.json`), la receta de entrenamiento por defecto (`training_args.json`) y el checkpoint de inicialización (`model.safetensors`).

Su relevancia es, por tanto, formativa y metodológica: sirve como plantilla reproducible para montar experimentos de retrieval con atención de ventana deslizante y fusión de bajo rango, y como ejemplo de buena praxis documental al no publicar números no verificados. No debe evaluarse como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN Transformer (convolución + transformer), según el autor |
| Parámetros totales | 16.576 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la model card solo indica atención de ventana deslizante, sin tamaño de ventana) |
| Tipos de cuantización | No disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch); el código se distribuye como `finetune.py` |
| Escala declarada | base |
| Mecanismo de atención | sliding window |
| Fusión | low rank |
| Activación | gelu |
| Normalización | instancenorm |
| Optimizador por defecto | adam con scheduler de warmup lineal |
| Fecha de creación en HuggingFace | 2026-10-20 |
| Descargas / likes | 0 / 0 |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La arquitectura declarada es un "cnn_transformer": una combinación de capas convolucionales con bloques transformer, usando atención de ventana deslizante (sliding window), fusión de bajo rango (low rank), activación GELU y InstanceNorm en lugar de LayerNorm. No se especifica el número de capas, dimensiones ocultas, número de cabezas ni el tamaño de la ventana de atención; `config.json` los contendría, pero esos valores no están disponibles en la información proporcionada. El tamaño total de 16.576 parámetros sugiere una implementación mínima, probablemente pensada para validar el flujo de código antes de escalar.

Respecto al entrenamiento, la model card es explícita: la receta incluida (Adam, warmup lineal) son valores de partida del script y no evidencia de una ejecución completada. No se documentan tokens de entrenamiento, composición del dataset, ni fases de RLHF/DPO/SFT. El checkpoint `model.safetensors` es una inicialización válida para smoke tests, no un modelo entrenado, y el autor advierte que no ha sido auditado en robustez, equidad ni transferencia de dominio. La guía de evaluación propuesta sugiere usar Flickr30k, reportar la métrica de la tarea en al menos tres semillas e incluir una línea base de capacidad equivalente.

## Capacidades

- No hay capacidades verificadas: el checkpoint es una inicialización sin entrenar, por lo que no se puede afirmar generación de texto, razonamiento, código ni matemáticas.
- Tarea objetivo declarada: retrieval (recuperación), presumiblemente multimodal imagen-texto dado que la evaluación sugerida es Flickr30k; el autor no lo confirma explícitamente.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declara ningún idioma).
- Capacidades especiales (modo thinking, visión, audio): no disponibles; la arquitectura CNN sugiere procesamiento de señales tipo rejilla, pero no se documenta.
- Capacidad de fine-tuning: sí, el repositorio incluye `finetune.py` con bloque `__main__` y ejemplo de smoke test.
- Integración con APIs genéricas de carga automática: requiere un adaptador explícito, al ser una implementación propia.

## Casos de uso

- Plantilla de experimentación académica: partir de este repositorio para construir un pipeline de retrieval reproducible (config, receta de entrenamiento, script de fine-tuning) y sustituir el checkpoint por uno entrenado propio.
- Docencia y formación: ilustrar las diferencias entre InstanceNorm y LayerNorm, atención de ventana deslizante y fusión de bajo rango en un código de tamaño manejable y ejecutable en CPU.
- Pruebas de humo de infraestructura (CI/CD): validar que el entorno de PyTorch, la carga de safetensors y el flujo de entrenamiento funcionan antes de lanzar un job costoso con un modelo grande.
- Reproducibilidad de recetas: usar `training_args.json` como base para comparar optimizadores y schedulers manteniendo el mismo presupuesto de datos, semillas y tuning, tal y como recomienda el autor.
- Benchmarking metodológico: implementar la evaluación propuesta sobre Flickr30k con tres semillas y una línea base de capacidad equivalente, documentando logs y versiones de entorno.
- Base para investigación en retrieval multimodal: escalar la arquitectura CNN-Transformer a un tamaño útil y medir si la combinación de ventana deslizante y fusión de bajo rango aporta ventajas frente a transformers puros.
- Prototipado rápido de interfaces de búsqueda: usar el script como referencia para definir la firma de un codificador de embeddings antes de integrar un modelo real.
- No recomendado para: atención al cliente, generación de código en producción, agentes o cualquier despliegue con usuarios reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica literalmente que "no benchmark score is claimed in this repository" y que el checkpoint no ha sido entrenado. La única guía de evaluación es una propuesta: Flickr30k, métrica de la tarea, al menos tres semillas y una línea base de capacidad equivalente.

## Requisitos de hardware

- VRAM estimada para inferencia: 16.576 parámetros ocupan aproximadamente 66 KB en fp32 (33 KB en fp16, 16 KB en int8), sin contar activaciones. Cabe holgadamente en cualquier GPU, iGPU o incluso en CPU.
- GPU recomendadas: cualquiera; no hay requisito práctico. El cuello de botella, si se escala el modelo, vendría del tamaño final, no del actual.
- Cabe en GPU de consumo: sí, en todas (GTX 1050, RTX 3060, RTX 4090, etc.), y también en Raspberry Pi o en un contenedor sin GPU.
- Opciones de despliegue: el autor advierte que las APIs genéricas de carga automática requieren un adaptador explícito al ser una implementación propia; vLLM, TGI o llama.cpp no aplican al no haber pesos en formato estándar de inferencia (no hay GGUF) ni pipeline declarada.
- Latencia y throughput: no disponibles. Con 16.576 parámetros el coste computacional es despreciable, pero no se han publicado mediciones.
- Almacenamiento: el repositorio ocupa 0,0 GB según HuggingFace.

## Comparativa con modelos similares

El modelo no es comparable en rendimiento con sistemas de retrieval en producción: se trata de una inicialización sin entrenar de 16.576 parámetros. Se listan alternativas de referencia cualitativa; los datos de estas no están verificados en la información proporcionada y se marcan como no disponibles.

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| otterbin/retrieval-test | CNN Transformer, atención sliding window, InstanceNorm | 16.576 | No disponible | MIT | Repositorio HuggingFace, sin descargas |
| CLIP (OpenAI) | Transformer visión + texto | No disponible en la información proporcionada | No disponible | No disponible | Referencia estándar de retrieval imagen-texto |
| SigLIP (Google) | Transformer visión + texto con pérdida sigmoide | No disponible en la información proporcionada | No disponible | No disponible | Referencia estándar de retrieval imagen-texto |
| BLIP-2 / InstructBLIP | Transformer multimodal con Q-Former | No disponible en la información proporcionada | No disponible | No disponible | Usado en retrieval y captioning |

Nota: la comparación relevante para este repositorio no es de rendimiento sino de propósito; los tres últimos son modelos entrenados y publicados con evaluaciones, mientras que aquí solo hay código y una inicialización.

## Limitaciones y advertencias

- El checkpoint no está entrenado: cualquier salida que produzca es equivalente a la de una inicialización aleatoria.
- No hay métricas publicadas ni auditoría de robustez, equidad o transferencia de dominio, tal y como reconoce el autor.
- No se documentan sesgos, pero al no haber datos de entrenamiento ni evaluación, no se pueden descartar en futuras versiones entrenadas.
- Riesgo de alucinación: no evaluable, ya que el modelo no genera texto de forma verificada.
- Idiomas soportados no declarados; no se puede asumir cobertura multilingüe.
- Longitud de contexto desconocida: la atención de ventana deslizante implica un límite, pero no se especifica el tamaño de la ventana.
- Licencia MIT: permite uso comercial y modificación, pero el autor advierte de revisar por separado los términos de los datos externos (por ejemplo, Flickr30k) que se usen con el repositorio.
- Implementación personalizada: no funciona con `AutoModel.from_pretrained` sin un adaptador explícito, lo que complica la integración en stacks estándar.
- Fechas de creación y actualización en HuggingFace (2026-10-20) posteriores a la fecha habitual de consulta; conviene verificar la vigencia del repositorio antes de citarlo.
- El tamaño del repositorio (0,0 GB) y la ausencia de descargas y likes indican un artefacto de prueba, no un proyecto mantenido.
- Los resultados de búsqueda web asociados a esta consulta no contenían información técnica sobre el modelo y se han descartado por completo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/otterbin/retrieval-test
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos relacionados con este modelo.
