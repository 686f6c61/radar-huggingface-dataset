# cgnzimmermann/tiny-transformer-demo

## Resumen

`cgnzimmermann/tiny-transformer-demo` es un repositorio de HuggingFace publicado por Lena Zimmermann (usuario `cgnzimmermann`) que contiene una implementación propia y mínima en PyTorch de un transformer orientado a tareas de *retrieval* (recuperación). No es un modelo preentrenado ni un release de producción: la propia model card lo describe como un punto de partida para revisión de código, *smoke tests* y experimentos pequeños y controlados. El checkpoint incluido (`model.safetensors`) es una inicialización válida, no un modelo entrenado ni evaluado.

El dato más relevante es su escala real: 24.832 parámetros totales según los tensores en safetensors, es decir, unas 25.000 variables, varios órdenes de magnitud por debajo de cualquier modelo utilizable. Conviene señalar la posible confusión que genera la model card, que etiqueta la configuración como `huge`; esa etiqueta corresponde a una variante dentro de la implementación propia del autor, no a un tamaño real grande. El repo ocupa 0,0 GB y no declara pipeline, idiomas ni resultados de benchmarks.

Su interés es, por tanto, didáctico y de infraestructura: sirve para validar un flujo de carga de pesos, comprobar la API de un script propio (`pipeline.py`) o servir como esqueleto reproducible de experimentos de retrieval con fusión bilineal. No debe presentarse como alternativa a modelos de embeddings o de recuperación multimodal existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer propio ("Tiny Transformer"), atención estándar, fusión bilineal, activación GELU, normalización LayerNorm |
| Parametros totales | 24.832 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye un único checkpoint en safetensors; no se documenta precisión ni variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (no se declaran idiomas en la model card ni en los metadatos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) + código Python (`pipeline.py`), configuración en `config.json` y receta en `training_args.json` |

## Arquitectura y entrenamiento

La arquitectura es un transformer de implementación propia con atención estándar, fusión bilineal entre representaciones, activación GELU y LayerNorm, tal como recoge la tabla de la model card. La presencia de fusión bilineal y la recomendación de evaluar sobre Flickr30k apuntan a un diseño pensado para *retrieval* multimodal (emparejamiento imagen-texto), aunque el repositorio no documenta explícitamente las modalidades de entrada ni la dimensionalidad de las torres. Con 24.832 parámetros totales, las dimensiones ocultas y el número de capas son necesariamente minúsculos; no se publican en la información disponible.

No hay evidencia de entrenamiento: el autor indica que `model.safetensors` es un checkpoint de inicialización y que no se reclama ninguna puntuación de benchmark. La receta por defecto usa el optimizador Adam con un esquema de *linear warmup*; el propio autor advierte que son valores de arranque del script y no prueba de una ejecución completada. No se documentan número de tokens, composición del dataset, ni fases de RLHF/DPO o ajuste por preferencias. Tampoco se describen innovaciones técnicas tipo decodificación especulativa o atención lineal.

## Capacidades

- No se le atribuye ninguna capacidad de generación de texto utilizable: con 24.832 parámetros y sin entrenamiento, la salida es esencialmente aleatoria.
- El código está orientado a *retrieval*: la arquitectura incluye fusión bilineal, mecanismo habitual para puntuar pares de representaciones.
- Sirve como *smoke test* de carga de pesos en safetensors y de ejecución de un `pipeline.py` propio.
- Punto de partida reproducible para experimentos controlados con semillas fijas y presupuestos de ajuste equivalentes.
- Soporte de *tool calling* / *function calling*: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponibles.
- Capacidades multilingües: no declaradas ni evaluadas.
- Capacidades especiales (modo *thinking*, visión, audio): no documentadas; la posible componente visual se infiere solo de la sugerencia de evaluar en Flickr30k.

## Casos de uso

- Validación de *pipelines* de carga: usar el checkpoint para verificar que un cargador de safetensors, un *adapter* de `transformers` o un script interno resuelven correctamente las claves y las formas de los tensores antes de pasar a modelos reales.
- Pruebas de integración en CI: ejecutar `python pipeline.py --help` y el bloque `__main__` como test de humo en cada *commit*, con un coste de ejecución prácticamente nulo (menos de 25.000 parámetros).
- Plantilla docente de transformer para retrieval: el par `config.json` + `training_args.json` permite explicar cómo se parametriza atención, fusión bilineal y schedule de *warmup* sin distracción de escala.
- Reproducción de experimentos comparativos: el autor propone entrenar todos los baselines con la misma exposición de datos, presupuesto de ajuste y semillas; este repo actúa como baseline de capacidad mínima.
- Base para evaluar sobre Flickr30k: una vez entrenado, el *harness* sugerido (tres semillas como mínimo, métrica de la tarea y baseline de capacidad emparejada) sirve para montar el protocolo de evaluación.
- Referencia de licencia y empaquetado: ejemplo de publicación con Apache 2.0, safetensors y separación explícita entre inicialización y checkpoint entrenado, útil como plantilla de *model card* para otros equipos.
- Depuración de adaptadores personalizados: dado que es una implementación propia, obliga a escribir un *adapter* explícito antes de usar APIs genéricas; sirve para probar ese adaptador en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no se reclama ninguna puntuación y que el checkpoint no ha sido entrenado; la única guía es metodológica (Flickr30k, al menos tres semillas, baseline de capacidad equivalente).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Los pesos ocupan del orden de decenas de kilobytes (24.832 parámetros; en fp32, ~0,1 MB), por lo que el cuello de botella es el *runtime* de PyTorch, no el modelo.
- GPU recomendadas: ninguna en particular; funciona en CPU sin problema. Cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090) es sobredimensionada para este checkpoint.
- Cabe en cualquier GPU consumer y en entornos sin GPU (CPU, contenedores pequeños, portátiles).
- Opciones de despliegue: al ser una implementación propia, vLLM, TGI, llama.cpp u Ollama no lo soportan de forma nativa; requiere el `pipeline.py` del repositorio o un adaptador explícito para APIs genéricas.
- Latencia y throughput: no disponibles como dato medido; por escala, la latencia estaría dominada por el arranque del intérprete y la inicialización de PyTorch más que por el cálculo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cgnzimmermann/tiny-transformer-demo` | 24.832 | no disponible | sin benchmarks (checkpoint sin entrenar) | Apache 2.0 | HuggingFace, 12 descargas, 0 likes |
| `Nikhilgd22/tiny-transformer-demo` | no disponible | no disponible | sin benchmarks declarados; variante `large`, inicialización | no disponible en la información | HuggingFace |
| `skolouri/TinyTransformer` (GitHub) | no disponible | no disponible | implementación mínima encoder-decoder con fines educativos | no disponible en la información | GitHub |
| `avvorstenbosch/tinyTransformer` (GitHub) | no disponible | no disponible | GPT-like entrenable en una GPU consumer, siguiendo material de Karpathy | no disponible en la información | GitHub |

Los tres comparables son proyectos educativos de escala mínima; ninguno publica métricas que permitan una comparación cuantitativa con este repositorio.

## Limitaciones y advertencias

- El checkpoint no está entrenado: cualquier salida debe considerarse aleatoria. No es apto para producción, investigación empírica ni evaluación de calidad.
- No se han auditado robustez, equidad ni transferencia de dominio; no hay análisis de sesgos porque no hay modelo entrenado que analizar.
- Riesgo de alucinación no aplicable en el sentido habitual, pero sí riesgo de mala interpretación: la etiqueta `huge` en la configuración puede llevar a creer que se trata de un modelo grande cuando tiene 24.832 parámetros.
- No se declaran idiomas soportados; no hay evidencia de competencia multilingüe ni monolingüe.
- Longitud de contexto no documentada: no se puede planificar un uso con ventanas largas ni verificar el comportamiento en secuencias extensas.
- Implementación propia: las APIs automáticas de `transformers` requieren un adaptador explícito; los frameworks de serving estándar no lo cargan directamente.
- Licencia Apache 2.0 permite uso comercial del código y los pesos, pero el autor advierte de revisar por separado los términos de los datos de origen si se combina con datasets externos (por ejemplo, Flickr30k).
- Fecha de creación del repositorio registrada como 2026-10-18; conviene verificar la vigencia y posibles actualizaciones antes de citarlo.
- Cualquier resultado de un futuro checkpoint entrenado debe documentarse por separado de los valores por defecto aquí publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cgnzimmermann/tiny-transformer-demo
- Perfil del autor: https://huggingface.co/cgnzimmermann/models
- Repositorio comparable (misma familia de demo): https://huggingface.co/Nikhilgd22/tiny-transformer-demo
- Implementación educativa encoder-decoder: https://github.com/skolouri/TinyTransformer
- Implementación GPT-like entrenable en GPU consumer: https://github.com/avvorstenbosch/tinyTransformer
