# huggingface12341/zsl-h27

## Resumen

zsl-h27 es un modelo de extracción de características (feature extraction) publicado en Hugging Face por el usuario huggingface12341. Se trata de un modelo derivado de una fusión (merge) de tres checkpoints base: joamCriff123/zils-lite-l1125a, joamCriff123/zils-lite-l1123q y OmniJev/OneJev1.6-0.8B. El modelo declara la arquitectura qwen3_5 en sus metadatos y una etiqueta de "decision-model" junto con los identificadores zils y d3-lite, lo que sugiere un uso orientado a tareas de clasificación o decisión más que a generación de texto abierta.

Con 852.985.920 parámetros (aproximadamente 0,85 mil millones), se sitúa en la categoría de modelos pequeños, aptos para inferencia en hardware de consumo. El repositorio ocupa 1,7 GB y se distribuye en formato safetensors con código personalizado (custom_code), lo que implica que requiere cargar módulos específicos del repositorio para su funcionamiento en transformers.

La relevancia de este modelo es limitada por su naturaleza experimental: cuenta con cero descargas y cero likes en el momento de la consulta, el acceso está restringido (gated) y no se dispone de documentación pública sobre datos de entrenamiento, benchmarks o idiomas soportados. Debe evaluarse con cautela y verificarse su comportamiento empíricamente antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según metadatos); transformer con código personalizado |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización GGUF/AWQ no publicada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Los metadatos indican la etiqueta de arquitectura qwen3_5, lo que apunta a una familia de transformers derivada del diseño Qwen, aunque no se especifica la configuración exacta de capas, dimensiones ocultas, mecanismo de atención ni tipo de normalización. El modelo incorpora código personalizado (custom_code), por lo que su carga requiere confiar en la implementación incluida en el repositorio y ejecutarla con `trust_remote_code=True`.

El modelo es el resultado de una fusión de tres checkpoints: dos variantes de la familia zils-lite (l1123q y l1125a) y OneJev1.6-0.8B de OmniJev. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO, ni sobre técnicas de optimización como decodificación especulativa o atención lineal. Tampoco se documenta el método de merge empleado (por ejemplo, SLERP, TIES o linear).

## Capacidades

- Extracción de características (feature extraction): es la tarea declarada en el pipeline del modelo, orientada a generar representaciones vectoriales de entradas de texto.
- Modelo de decisión (decision-model): la etiqueta sugiere uso en clasificación o toma de decisiones sobre representaciones.
- Generación de texto: no disponible como capacidad declarada; el pipeline no es text-generation.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Clasificación de textos cortos: usar el modelo como extractor de embeddings y añadir una cabeza lineal para tareas de clasificación (por ejemplo, enrutamiento de tickets o etiquetado de documentos), aprovechando su tamaño reducido de 0,85 B de parámetros.
- Búsqueda semántica y recuperación aumentada (RAG): generar embeddings de documentos y consultas para indexación vectorial, dado que el pipeline es feature-extraction.
- Filtrado previo en pipelines de moderación: emplear las representaciones para detectar contenido que requiera revisión humana, con un coste de inferencia bajo.
- Sistemas de decisión ligeros en el borde (edge): desplegar el modelo en CPU o GPU de consumo para tareas de scoring en tiempo real donde el espacio y la latencia son críticos.
- Detección de similitud y deduplicación: comparar embeddings para identificar documentos duplicados o casi duplicados en corpus.
- Componente de un ensemble: combinar sus representaciones con las de modelos mayores para mejorar la robustez en tareas de clasificación.
- Evaluación experimental de merges: servir como caso de estudio para investigadores que analizan el efecto de fusionar checkpoints de distinta procedencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,7 GB para los pesos (0,85 B parámetros × 2 bytes), más overhead de activaciones y del código personalizado; en la práctica, entre 2 y 3 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9 GB de pesos; en 4 bits, alrededor de 0,5 GB (siempre que se generen pesos cuantizados, no publicados).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas, e incluso en CPU para lotes pequeños.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía natural; vLLM, llama.cpp, Ollama y TGI no están confirmados para esta arquitectura con código personalizado y deberían validarse antes de usarse.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zsl-h27 | 0,85 B | no disponible | feature-extraction | Apache 2.0 | gated |
| Qwen3-0.6B | 0,6 B | no disponible en esta ficha | generación / embeddings | Apache 2.0 | pública |
| OneJev1.6-0.8B (base) | ~0,8 B | no disponible | no disponible | no disponible | pública |
| zils-lite-l1125a (base) | no disponible | no disponible | no disponible | no disponible | pública |

La comparación con alternativas consolidadas es limitada porque no se dispone de datos de rendimiento del modelo. Qwen3-0.6B es la referencia más cercana por tamaño y familia arquitectónica, pero no se ha verificado que zsl-h27 iguale sus métricas.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que complica la automatización y la reproducibilidad.
- Documentación inexistente: no hay model card con detalles de entrenamiento, datos, idiomas ni evaluación; cualquier afirmación sobre su comportamiento debe validarse empíricamente.
- Código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código no auditado del autor; revisar el código antes de usarlo en entornos sensibles.
- Riesgo de alucinación: no aplica directamente al no ser un modelo generativo declarado, pero las representaciones pueden ser poco fiables si el entrenamiento no está documentado.
- Sesgos: desconocidos, al no publicarse la composición del dataset.
- Idiomas: no declarados; no asumir soporte multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero la procedencia de los checkpoints base (zils-lite, OneJev) no está verificada y podría imponer condiciones adicionales.
- Madurez: cero descargas y cero likes; sin evidencia de uso en producción ni mantenimiento.
- Fecha de creación futura (2026-11-26) en los metadatos: posible inconsistencia que conviene contrastar.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface12341/zsl-h27
- Modelo base OneJev1.6-0.8B: https://huggingface.co/OmniJev/OneJev1.6-0.8B
- Modelo base zils-lite-l1123q: https://huggingface.co/joamCriff123/zils-lite-l1123q
- Modelo base zils-lite-l1125a: https://huggingface.co/joamCriff123/zils-lite-l1125a
