# crystallilu/retrieval-base

## Resumen

El repositorio `crystallilu/retrieval-base` contiene una implementación experimental de una arquitectura **Blip** orientada a tareas de *retrieval* (recuperación de información). El autor, crystallilu, lo presenta como un *codebase* de tamaño reducido ("giant" en su propia nomenclatura) diseñado para inspeccionar cambios arquitectónicos antes de un entrenamiento completo. No se trata de un modelo entrenado ni de un checkpoint con rendimiento demostrado: el archivo `model.safetensors` es únicamente un checkpoint de inicialización válido para pruebas de humo (*smoke tests*).

El modelo tiene solo **16.576 parámetros** (dato real extraído de los metadatos de safetensors), lo que lo convierte en un artefacto mínimo, sin capacidad práctica de generación o razonamiento. Su relevancia es exclusivamente como punto de partida para desarrolladores que quieran experimentar con la arquitectura Blip para retrieval, no como un modelo utilizable en producción. La licencia es MIT, lo que permite uso comercial con las restricciones habituales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Blip (variante experimental con atención grouped query, tensor fusion, activación mish, normalización layernorm) |
| Parametros totales | 16.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura declarada es **Blip**, un modelo de tipo transformer con atención *grouped query* (GQA), fusión de tensores, activación *mish* y normalización *layernorm*. El autor la describe como "giant" en su configuración, pero el checkpoint real tiene solo 16.576 parámetros, lo que indica que es una versión mínima o un esqueleto de la arquitectura completa. No se proporcionan detalles sobre el número de capas, dimensiones ocultas o cabezas de atención.

No existe información sobre datos de entrenamiento, número de tokens, composición del dataset o técnicas de alineación (RLHF/DPO). El repositorio incluye `config.json` con la configuración generada y `training_args.json` con una receta experimental por defecto que usa **adafactor** con programación de tasa de aprendizaje *cosine*. El propio autor advierte que estos valores son puntos de partida, no evidencia de un entrenamiento completado. El checkpoint de inicialización no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio.

## Capacidades

- **Generación de texto**: no demostrada; el checkpoint es de inicialización y no tiene capacidad funcional.
- **Razonamiento**: no disponible.
- **Código**: no disponible.
- **Matemáticas**: no disponible.
- **Visión**: la arquitectura Blip sugiere capacidades multimodales (imagen-texto), pero no hay evidencia de funcionamiento en este checkpoint.
- **Tool calling / function calling**: no disponible.
- **Soporte de agentes**: no disponible.
- **Capacidades multilingües**: no disponible.
- **Capacidades especiales**: ninguna verificada; el repositorio es un *codebase* experimental para inspección de arquitectura.

## Casos de uso

- **Investigación de arquitecturas de retrieval**: el repositorio permite estudiar cómo se comporta una variante Blip con GQA y tensor fusion en tareas de recuperación antes de escalar a un entrenamiento completo. Se puede ejecutar `python train.py --help` para ver el ejemplo de prueba de humo.
- **Pruebas de integración en pipelines de desarrollo**: el checkpoint de inicialización sirve para verificar que el código carga correctamente y que el flujo de entrenamiento funciona, sin necesidad de un modelo entrenado.
- **Benchmarking de configuraciones**: el autor sugiere evaluar con Flickr30k y reportar la métrica de la tarea con al menos tres semillas, comparando con una línea base de capacidad equivalente. Esto permite validar la implementación antes de invertir en entrenamiento.
- **Desarrollo de adaptadores para carga automática**: al ser una implementación personalizada, las APIs genéricas de HuggingFace no cargan el modelo directamente; se necesita un adaptador explícito. El repositorio sirve como banco de pruebas para escribir ese adaptador.
- **Estudio de técnicas de fusión de tensores**: la arquitectura incorpora *tensor fusion*, un mecanismo poco común; los desarrolladores pueden analizar su implementación y compararla con alternativas como atención cruzada o *cross-attention* estándar.
- **Formación en diseño de modelos de retrieval**: por su tamaño mínimo, es un ejemplo didáctico para entender los componentes de un sistema de recuperación basado en Blip sin los costes computacionales de un modelo grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se reclama ninguna puntuación en el repositorio. El checkpoint es de inicialización y no ha sido entrenado, por lo que cualquier métrica sería irrelevante. La única guía de evaluación es la sugerencia de usar Flickr30k con tres semillas y una línea base de capacidad equivalente, pero no se aportan números.

## Requisitos de hardware

- **VRAM estimada para inferencia**: despreciable; con 16.576 parámetros, el modelo cabe en cualquier dispositivo, incluso en una CPU sin GPU.
- **GPU recomendadas**: ninguna específica; cualquier GPU con al menos 1 GB de VRAM sería suficiente, aunque no se necesita GPU para este checkpoint.
- **Compatibilidad con GPU de consumo**: sí, cualquier GPU de consumo (incluso integradas) puede ejecutar el modelo.
- **Opciones de despliegue**: no aplicable para producción; el repositorio incluye un script `train.py` que se ejecuta directamente. No hay soporte para vLLM, llama.cpp, Ollama o TGI, y no se recomienda su uso en esos entornos.
- **Latencia y throughput**: no disponibles; el modelo no está diseñado para inferencia útil.

## Comparativa con modelos similares

No disponible. No existen modelos comparables en la misma categoría porque este repositorio no es un modelo entrenado, sino un *codebase* experimental con un checkpoint de inicialización. No se puede comparar con alternativas como CLIP, BLIP-2 o modelos de retrieval denso (DPR, ColBERT) porque carece de cualquier capacidad funcional o métrica de rendimiento.

## Limitaciones y advertencias

- **Checkpoint sin entrenar**: el archivo `model.safetensors` es solo una inicialización para pruebas de humo; no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio.
- **Sin capacidad funcional**: con 16.576 parámetros, el modelo no puede generar texto, razonar ni realizar retrieval real. Cualquier uso en producción es inviable.
- **Sin benchmarks**: no se reclama ninguna puntuación; los resultados de un futuro checkpoint entrenado deben documentarse por separado de los valores por defecto del repositorio.
- **Carga no estándar**: las APIs genéricas de HuggingFace no cargan el modelo automáticamente; se requiere un adaptador explícito, lo que limita su integración.
- **Riesgo de alucinación**: no aplicable al no tener capacidad generativa, pero si se entrena un checkpoint futuro, deberá evaluarse este riesgo.
- **Restricciones de licencia**: la licencia MIT permite uso comercial, pero el autor advierte que deben revisarse los términos de las fuentes de datos externas si se usa con datasets como Flickr30k.
- **Sesgos**: no evaluados; el checkpoint no ha pasado ninguna auditoría de sesgos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/crystallilu/retrieval-base
- No se han encontrado papers, blogs, repositorios adicionales o demos relacionados con este modelo específico en la búsqueda web. Los resultados obtenidos (RVC, Kioxia, CrystalFlow, etc.) no guardan relación con este repositorio.
