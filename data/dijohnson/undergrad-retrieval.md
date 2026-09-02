# dijohnson/undergrad-retrieval

## Resumen

El modelo `dijohnson/undergrad-retrieval` es una implementación compacta y personalizada de la arquitectura **BEiT** (BERT pre-training of Image Transformers) orientada a tareas de *retrieval* visual o multimodal. Lo publica el usuario `dijohnson` en Hugging Face con licencia MIT, y se presenta como un punto de partida experimental, no como un modelo preentrenado listo para producción. Su configuración *tiny* (33.088 parámetros) está pensada para revisión de código, pruebas de humo y experimentos controlados a pequeña escala.

El repositorio incluye un script `finetune.py` con un ejemplo ejecutable, un `config.json` con la configuración de arquitectura generada, un `training_args.json` con la receta de entrenamiento por defecto y un checkpoint `model.safetensors` que es una inicialización válida, pero no un checkpoint entrenado. El autor no reivindica ningún resultado de benchmark en el repositorio. Su relevancia actual es limitada: sirve como referencia didáctica o base para experimentos de *retrieval* con arquitecturas transformer ligeras, pero no como un modelo competitivo frente a soluciones establecidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BEiT (configuración *tiny*) con atención *grouped query* y fusión tensorial |
| Parametros totales | 33.088 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto; no se especifica) |
| Tipos de cuantizacion | no disponible (solo se distribuye en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo de visión, no se especifican idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es una implementación personalizada de BEiT en PyTorch, con configuración *tiny*. Según la model card, emplea atención *grouped query* (una variante de atención multi-cabeza que agrupa consultas para reducir coste computacional), fusión tensorial, activación *swish* y normalización por *batchnorm*. No se especifica el número de capas, dimensiones ocultas ni el tamaño de parche. El checkpoint incluido es una inicialización aleatoria válida para pruebas de humo, no un modelo entrenado. La receta de entrenamiento por defecto usa el optimizador *novograd* con un programa de calentamiento constante, pero el autor aclara que son valores de partida del script, no evidencia de una ejecución completada. No hay información sobre el dataset de entrenamiento, número de tokens o técnicas de alineación como RLHF o DPO.

## Capacidades

- **Retrieval visual o multimodal**: el modelo está diseñado para tareas de recuperación de imágenes o de pares imagen-texto, aunque no se detallan las capacidades concretas.
- **Ejecución de código de ejemplo**: el script `finetune.py` incluye un bloque `__main__` con un ejemplo de prueba de humo que se puede ejecutar directamente.
- **Personalización y adaptación**: al ser una implementación propia, permite modificar la arquitectura y la receta de entrenamiento para experimentos controlados.
- **No se reivindican capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo**: el modelo es exclusivamente de visión/retrieval y no se han documentado tales funciones.

## Casos de uso

- **Pruebas de humo en pipelines de CI/CD**: el checkpoint de inicialización y el script `finetune.py` permiten verificar que el flujo de entrenamiento o inferencia funciona antes de integrar modelos más grandes.
- **Experimentos académicos de retrieval a pequeña escala**: con datasets como Flickr30k (sugerido por el autor), se puede evaluar la viabilidad de arquitecturas BEiT ligeras en tareas de recuperación imagen-texto.
- **Enseñanza de arquitecturas transformer para visión**: al ser una implementación compacta y legible, sirve como material didáctico para entender el funcionamiento interno de BEiT y sus variantes de atención.
- **Comparación de baselines en investigación**: el autor recomienda usarlo como baseline de capacidad equivalente en estudios que comparen arquitecturas de retrieval.
- **Desarrollo de adaptadores para APIs de carga automática**: al ser una implementación personalizada, se puede usar para practicar la creación de adaptadores que permitan cargar el modelo con APIs genéricas de Hugging Face.
- **Validación de configuraciones de entrenamiento**: la receta por defecto (novograd, warmup constante) puede servir para probar la estabilidad de distintos optimizadores y schedulers en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el checkpoint no es un modelo entrenado y que no se reivindica ninguna puntuación. Para una evaluación significativa, sugiere usar Flickr30k, reportar la métrica de la tarea con al menos tres semillas e incluir un baseline de capacidad equivalente.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible, pero con solo 33.088 parámetros, el modelo es extremadamente ligero y puede ejecutarse en cualquier GPU con más de 1 GB de VRAM, incluso en CPU.
- **GPU recomendadas**: cualquier GPU moderna, incluidas las de gama de entrada (GTX 1650, RTX 3050) o incluso inferencia en CPU.
- **¿Cabe en consumer GPU?**: sí, con total seguridad; el modelo es minúsculo.
- **Opciones de despliegue**: al ser una implementación personalizada en PyTorch, no se puede cargar directamente con vLLM, llama.cpp, Ollama o TGI. Requiere un adaptador explícito o ejecutar el script `finetune.py` directamente.
- **Latencia y throughput estimados**: no disponibles, pero se esperan tiempos de inferencia del orden de milisegundos en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (retrieval con BEiT tiny). El repositorio `Joyceanggraini/undergrad-retrieval` parece ser una variante similar (también una implementación ViT pequeña para retrieval), pero no se han publicado especificaciones detalladas ni benchmarks. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Checkpoint sin entrenar**: el `model.safetensors` es una inicialización aleatoria, no un modelo entrenado. No debe usarse para tareas reales de retrieval sin un entrenamiento previo.
- **Sin auditoría de robustez o sesgos**: el autor advierte que el checkpoint no ha sido auditado para robustez, equidad ni transferencia de dominio.
- **Alto riesgo de alucinación o resultados sin sentido**: al no estar entrenado, cualquier salida será arbitraria y no representativa de la tarea.
- **Implementación personalizada**: no es compatible con las APIs genéricas de Hugging Face sin un adaptador explícito, lo que dificulta su integración en flujos estándar.
- **Licencia MIT**: permite uso comercial, pero el autor recuerda revisar los términos de los datos externos si se usa con datasets de terceros.
- **Sin soporte de producción**: el autor lo presenta como un punto de partida experimental, no como una release lista para producción.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/dijohnson/undergrad-retrieval)
- [Variante similar de Joyceanggraini](https://huggingface.co/Joyceanggraini/undergrad-retrieval)
