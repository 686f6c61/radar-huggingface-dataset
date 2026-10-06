# Leonyly7970/deit-multitask-ablation

## Resumen

Deit-multitask-ablation es un repositorio de HuggingFace publicado por el usuario Leonyly7970 que contiene una implementación propia y compacta de DeiT (Data-efficient Image Transformer) orientada a tareas multitarea. No se trata de un modelo entrenado ni de un lanzamiento listo para producción: el propio autor lo describe como un punto de partida experimental pensado para revisión de código, pruebas de humo (smoke tests) y experimentos controlados de pequeña escala. El checkpoint incluido (model.safetensors) se presenta explícitamente como una inicialización válida, no como un modelo con pesos entrenados.

La relevancia de este repositorio es metodológica más que de rendimiento. Aporta una receta de experimento por defecto (optimizador novograd con planificador de warmup lineal), una configuración de arquitectura registrada en config.json y un script ejecutable (inference.py) con un ejemplo de prueba. Está pensado como base reproducible para comparar variantes de arquitectura bajo el mismo presupuesto de cómputo, mismos datos y mismas semillas, tal y como recomienda la propia model card.

El tamaño declarado en los pesos es de 24.832 parámetros (menos de 25.000), una cifra extremadamente reducida incluso para la configuración tiny de DeiT. El repositorio ocupa 0,0 GB, tiene 0 descargas y 0 likes, y se distribuye bajo licencia MIT. La fecha de creación y actualización indicada es 2026-10-06.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeiT (transformer de visión), configuración tiny |
| Parametros totales | 24.832 (según safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se distribuye el checkpoint inicial en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Atencion | Sliding window |
| Fusion | Bilinear |
| Activacion | Mish |
| Normalizacion | BatchNorm |
| Optimizador por defecto | Novograd con warmup lineal |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La arquitectura declarada es DeiT, un transformer aplicado a visión por computador, en su escala tiny. Frente a la implementación de referencia, esta versión introduce variaciones internas concretas: mecanismo de atención con ventana deslizante (sliding window), fusión de características de tipo bilinear, función de activación mish y normalización por batch (batchnorm) en lugar de la layer norm habitual en transformers. La model card no detalla el número de capas, dimensión de embedding, número de cabezas ni resolución de entrada; esa información solo estaría disponible en config.json, que no se ha proporcionado.

En cuanto al entrenamiento, la model card es explícita: el checkpoint no ha sido entrenado. El archivo model.safetensors es una inicialización para pruebas de humo, y la receta incluida (novograd con warmup lineal) son valores de arranque del script, no evidencia de una ejecución completada. No se indica número de tokens, composición del dataset, ni si hubo RLHF, DPO u otro tipo de ajuste, porque no existe tal proceso. El autor recomienda que cualquier evaluación seria entrene todos los baselines con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias.

## Capacidades

- No dispone de pesos entrenados, por lo que no tiene capacidades funcionales efectivas de generación, clasificación o predicción verificadas.
- La model card no declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni de razonamiento multi-step.
- No se declaran capacidades multilingües (el campo de idiomas no está disponible).
- Capacidad estructural: permite definir y ejecutar un forward de un transformer de visión con atención de ventana deslizante, fusión bilinear, activación mish y batchnorm, útil como banco de pruebas de arquitectura.
- Capacidad de experimentación: incluye un punto de entrada ejecutable (inference.py) con ejemplo de smoke test, config.json con los ajustes de arquitectura y training_args.json con la receta por defecto.
- No se declaran capacidades especiales de tipo thinking mode, visión, audio, ni decodificación especulativa.

## Casos de uso

- Revisión de código de arquitecturas transformer: el repositorio sirve para inspeccionar cómo se implementan atención de ventana deslizante, fusión bilinear y activación mish en un transformer de visión de forma autocontenida, sin dependencias de pesos preentrenados.
- Pruebas de humo (smoke tests) en pipelines de CI/CD: inference.py y el checkpoint de inicialización permiten verificar que el código compila y ejecuta un forward correctamente antes de invertir cómputo en entrenamientos reales.
- Estudios de ablación de arquitectura: dado que el autor propone comparar variantes bajo el mismo presupuesto de datos y semillas, el repositorio es un punto de partida para medir el efecto de la atención de ventana deslizante o de la batchnorm frente a alternativas.
- Investigación académica sobre DeiT y variantes tiny: sirve como implementación de referencia reproducible para trabajos que necesiten una base mínima de transformer de visión con modificaciones internas documentadas.
- Material docente sobre transformers de visión: el tamaño reducido (menos de 25.000 parámetros) y la estructura clara de ficheros (config, training args, script de inferencia) lo hacen apto para explicar la anatomía de un ViT en un contexto de aprendizaje.
- Desarrollo de adaptadores de carga: la model card advierte de que, al ser una implementación propia, las APIs de carga automática requieren un adaptador explícito, por lo que el repositorio puede usarse para practicar y validar dicha integración.
- Evaluación metodológica de protocolos de benchmark: el propio autor recomienda usar un conjunto de validación específico de la tarea, reportar la métrica con al menos tres semillas e incluir un baseline de capacidad equiparable, lo que convierte el repo en un ejemplo de buenas prácticas de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint es una inicialización no entrenada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 24.832 parámetros en fp32 el modelo ocupa aproximadamente 0,0001 GB, por lo que la inferencia cabe en memoria de CPU y en cualquier GPU, incluso integrada. El cuello de botella real no es la memoria, sino la disponibilidad de código compatible.
- GPU recomendadas: no se especifican requisitos en la model card. Por tamaño, cualquier GPU (RTX 4090, A100, H100 e incluso tarjetas de gama de entrada) es más que suficiente; también es viable ejecutarlo solo en CPU.
- ¿Cabe en consumer GPU? Sí, en cualquier GPU de consumo, y también en CPU sin requisitos especiales de memoria.
- Opciones de despliegue: la model card indica que, al ser una implementación propia, las APIs de carga automática genéricas requieren un adaptador explícito. El script inference.py es el punto de entrada documentado. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, dado que se trata de un transformer de visión y no de un modelo de lenguaje generativo.
- Latencia y throughput estimados: no disponibles. No se publican métricas de latencia ni de rendimiento.

## Comparativa con modelos similares

La model card no proporciona comparaciones y este repositorio es una implementación experimental sin pesos entrenados, por lo que no es directamente equiparable a modelos publicados con resultados de benchmark. A continuación se indican referencias del ecosistema DeiT como contexto, marcadas como valores de referencia generales y no verificadas en la información proporcionada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| deit-multitask-ablation (este repo) | 24.832 | No disponible | Sin benchmark declarado | MIT | HuggingFace, checkpoint de inicialización |
| DeiT-tiny (referencia Facebook/Meta) | ~5,7 M (referencia general) | No aplica (visión) | ImageNet top-1 reportado por el autor original | Ver licencia del proyecto DeiT | Repositorio oficial DeiT |
| DeiT-small (referencia Facebook/Meta) | ~22 M (referencia general) | No aplica (visión) | ImageNet top-1 reportado por el autor original | Ver licencia del proyecto DeiT | Repositorio oficial DeiT |
| DeiT-base (referencia Facebook/Meta) | ~86 M (referencia general) | No aplica (visión) | ImageNet top-1 reportado por el autor original | Ver licencia del proyecto DeiT | Repositorio oficial DeiT |

Nota: los datos de la familia DeiT de referencia son valores generales del ecosistema y no proceden de la información proporcionada en esta ficha; se incluyen únicamente como contexto orientativo y deben verificarse en las fuentes originales. La comparación directa de rendimiento no es posible porque este repositorio no publica métricas.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: sus pesos son una inicialización, por lo que cualquier salida carece de valor funcional hasta que se entrene con datos reales.
- No se ha auditado el modelo en términos de robustez, equidad (fairness) ni transferencia de dominio, según declara el propio autor.
- No se declara ningún resultado de benchmark; es un error interpretar el repositorio como un modelo con rendimiento demostrado.
- Sesgos conocidos: no disponibles, ya que no existe un entrenamiento documentado que permita caracterizarlos.
- Riesgo de alucinación: no aplica en el sentido de un modelo generativo de lenguaje; el repositorio es un transformer de visión sin pesos entrenados.
- Limitaciones de contexto e idioma: no disponibles; no se declaran ventanas de contexto ni idiomas soportados.
- Restricciones de licencia: el repositorio se distribuye bajo MIT, que permite uso comercial. No obstante, el autor advierte de que deben revisarse por separado las condiciones de las fuentes de datos externas si el repositorio se usa con datasets de terceros.
- La carga mediante APIs automáticas genéricas requiere un adaptador explícito, ya que se trata de una implementación personalizada y no de un modelo estándar.
- El campo de pipeline no está definido, por lo que no hay una tarea asignada oficialmente en HuggingFace.
- Cualquier resultado obtenido con un checkpoint futuro entrenado debe documentarse de forma separada a los valores por defecto que se distribuyen en este repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/Leonyly7970/deit-multitask-ablation
- No se han encontrado ni proporcionado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
