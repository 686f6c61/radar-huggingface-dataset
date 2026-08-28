# sergiodominguez/blip-finetuned

## Resumen

El repositorio `sergiodominguez/blip-finetuned` aloja un prototipo de investigación basado en la arquitectura BLIP (Bootstrapping Language-Image Pre-training), orientado a tareas de retrieval multimodal. El autor lo presenta explícitamente como un punto de partida experimental: el checkpoint incluido (`model.safetensors`) es una inicialización válida para pruebas de humo, no un modelo entrenado ni evaluado. Con solo 49.600 parámetros, no se trata de un modelo BLIP completo (los BLIP convencionales tienen cientos de millones), sino de una implementación reducida o un subconjunto con fines de desarrollo.

La relevancia actual es limitada: no hay resultados de benchmarks, ni capacidades demostradas, ni entrenamiento documentado. Su utilidad práctica se restringe al ámbito de la investigación y el desarrollo de pipelines de retrieval, donde sirve como plantilla de código y configuración. La licencia MIT permite uso libre, pero cualquier uso en producción requeriría un entrenamiento completo y una evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BLIP (prototipo) |
| Parametros totales | 49.600 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La implementación sigue una arquitectura BLIP con atención lineal, fusión tensorial, activación mish y normalización layernorm, según la configuración del repositorio. No se especifica el número de capas, dimensiones ocultas ni el mecanismo exacto de fusión. El archivo `config.json` registra los ajustes generados, pero no se detalla la estructura interna completa.

En cuanto al entrenamiento, no hay evidencia de un proceso real. El checkpoint es una inicialización aleatoria o preajustada para pruebas de humo. La receta de entrenamiento por defecto usa rmsprop con programación coseno, pero el propio autor aclara que son valores iniciales, no resultados de una ejecución completada. No se mencionan datos de entrenamiento, número de tokens, ni técnicas como RLHF o DPO.

## Capacidades

- No hay capacidades verificadas: el modelo no ha sido entrenado ni evaluado.
- El diseño apunta a retrieval multimodal (imagen-texto), pero no hay evidencia de funcionamiento.
- No se documenta soporte para tool calling, agentes, razonamiento multi-paso ni generación de código.
- La implementación es personalizada; las APIs genéricas de Hugging Face requieren un adaptador explícito para cargar el modelo.

## Casos de uso

Dado que el modelo no está entrenado, no existen casos de uso prácticos realistas. Los únicos escenarios posibles son:

- Desarrollo de investigación: como plantilla de código para experimentar con arquitecturas BLIP y pipelines de retrieval.
- Pruebas de integración: verificar que el código y los archivos de configuración funcionan correctamente en un entorno de desarrollo.
- Educación: estudiar la estructura interna de un modelo BLIP reducido y sus componentes (atención lineal, fusión tensorial).
- Base para entrenamiento futuro: a partir de este checkpoint de inicialización, un equipo podría entrenar un modelo completo con datos propios.
- Benchmarking de infraestructura: medir el consumo de recursos de un modelo pequeño en diferentes backends.
- No recomendado para ningún uso en producción sin un entrenamiento y evaluación exhaustivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no presenta ninguna métrica de rendimiento (Flickr30k, COCO, etc.) y el autor indica explícitamente que no se reivindica ninguna puntuación.

## Requisitos de hardware

- Con solo 49.600 parámetros, el modelo cabe en cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU.
- No hay requisitos mínimos documentados; la inferencia sería instantánea en cualquier hardware moderno.
- Dado su tamaño, es viable en Raspberry Pi o dispositivos embebidos, aunque no tiene utilidad real.
- Para despliegue, se podría usar llama.cpp o cualquier runtime que soporte safetensors, pero no hay guías oficiales.
- No se dispone de datos de latencia o throughput, pero al ser un modelo minúsculo, serían despreciables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| sergiodominguez/blip-finetuned | 49.600 | no disponible | MIT | Prototipo sin entrenar |
| Salesforce/blip-base (BLIP) | ~223M | 512 tokens (imagen+texto) | BSD-3 | Entrenado en COCO |
| Salesforce/blip2-opt-2.7b | ~3.7B (2.7B OPT + vision) | 512 tokens | BSD-3 | Entrenado, zero-shot |

La comparativa muestra que este prototipo no es comparable en capacidades con los BLIP reales: carece de entrenamiento, de datos y de rendimiento verificado. Su única similitud es el nombre de la arquitectura.

## Limitaciones y advertencias

- El checkpoint de inicialización no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio.
- No hay garantía de que el modelo produzca resultados coherentes en ninguna tarea.
- La implementación personalizada requiere un adaptador para cargarse con APIs estándar de Hugging Face.
- No se documentan sesgos, pero al no haber entrenamiento, cualquier sesgo sería inexistente (o irrelevante).
- La licencia MIT permite uso comercial, pero los términos de los datos externos deben revisarse por separado.
- Cualquier resultado futuro de un checkpoint entrenado debe documentarse independientemente de los valores por defecto del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergiodominguez/blip-finetuned
- Documentación de BLIP en Hugging Face: https://huggingface.co/docs/transformers/model_doc/blip
- Repositorio de recetas de fine-tuning BLIP-2: https://huggingface.co/luisdomene4/BLIP2-Finetune-Recipes
- Tutorial de fine-tuning BLIP en GitHub: https://github.com/ashkunwar/VLM-Finetuning-using-BLIP
- Artículo divulgativo sobre BLIP: https://www.geeksforgeeks.org/artificial-intelligence/understanding-blip-a-huggingface-model/
