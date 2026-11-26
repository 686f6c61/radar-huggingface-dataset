# obriensam/tiny-transformer-retrieval

## Resumen

`obriensam/tiny-transformer-retrieval` es un repositorio de código y pesos de inicialización publicado por el usuario obriensam en Hugging Face. Se presenta como una implementación funcional de un transformer de recuperación (retrieval) con una configuración etiquetada como "giant", pero el propio autor advierte que el checkpoint incluido no ha sido entrenado ni evaluado: es un punto de partida para pruebas de humo (smoke tests), no un modelo listo para producción.

El modelo es extremadamente pequeño: el recuento real de parámetros en los safetensors es de 16.576, lo que lo sitúa en el rango de los modelos de juguete. A pesar de la etiqueta "giant" en la configuración, el tamaño efectivo del checkpoint dista mucho de cualquier modelo de recuperación moderno. La arquitectura declarada combina atención flash, fusión por cross attention, activación swish y normalización RMSNorm.

Su relevancia es fundamentalmente didáctica o experimental: sirve como esqueleto reproducible para estudiar pipelines de recuperación (por ejemplo, sobre Flickr30k) y para validar infraestructura de entrenamiento antes de escalar. No hay benchmarks publicados, no hay datos de entrenamiento declarados y no se especifican idiomas soportados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tiny Transformer (atención flash, fusión por cross attention, activación swish, RMSNorm) |
| Parametros totales | 16.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint de inicialización) |

## Arquitectura y entrenamiento

La arquitectura es un transformer personalizado ("Tiny Transformer") con atención flash, fusión mediante cross attention, activación swish y normalización RMSNorm. El repositorio incluye `config.json` con los ajustes de arquitectura generados y `training_args.json` con la receta de experimento por defecto, que usa el optimizador Adam con un schedule de tipo step. No se especifican el número de capas, dimensiones ocultas, cabezas de atención ni la longitud de contexto, más allá de la etiqueta "giant" en la configuración.

No hay evidencia de que el checkpoint haya sido entrenado: el autor indica explícitamente que `model.safetensors` es un checkpoint de inicialización válido para pruebas de humo y que no se presenta como un checkpoint con benchmark. No se documentan tokens de entrenamiento, composición del dataset, ni fases de RLHF/DPO. La evaluación sugerida por el autor sería sobre Flickr30k, reportando la métrica de la tarea en al menos tres semillas y con una línea base de capacidad equivalente.

## Capacidades

- Recuperación multimodal/texto-imagen en el marco de la tarea de retrieval (según la orientación de evaluación del autor hacia Flickr30k).
- Implementación de referencia ejecutable: incluye `inference.py` con un bloque `__main__` de ejemplo de prueba de humo.
- No se declaran capacidades de generación de texto, razonamiento, código o matemáticas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Estudio de arquitecturas de recuperación: el repositorio permite inspeccionar una implementación completa de un transformer de retrieval con cross attention y adaptarla a experimentos propios.
- Pruebas de humo de infraestructura: sirve para validar pipelines de carga de safetensors, scripts de inferencia y entornos de entrenamiento antes de escalar a modelos mayores.
- Reproducción de recetas de entrenamiento: `training_args.json` documenta una configuración por defecto (Adam, schedule step) que puede replicarse con distintas semillas y presupuestos de ajuste.
- Evaluación comparativa controlada: el autor propone evaluar sobre Flickr30k con al menos tres semillas y una línea base de capacidad equivalente, lo que encaja con estudios de ablación.
- Material docente: adecuado para explicar el flujo completo de un modelo de retrieval (configuración, inicialización, inferencia) sin coste computacional apreciable.
- Punto de partida para adaptadores: al ser una implementación personalizada, requiere un adaptador explícito para APIs de carga automática, lo que lo hace útil para practicar integraciones con frameworks propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se reclama ninguna puntuación de benchmark en el repositorio y que el checkpoint es de inicialización, no un modelo entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos en precisión nativa (16.576 parámetros), despreciable en cualquier GPU.
- GPU recomendadas: cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior); también ejecutable en CPU sin problema.
- Cabe en GPU consumer: sí, en cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: al ser una implementación personalizada, requiere el script `inference.py` incluido o un adaptador explícito; no hay integración directa documentada con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| obriensam/tiny-transformer-retrieval | 16.576 | no disponible | Apache 2.0 | Checkpoint de inicialización, sin entrenar |
| Alternativas de retrieval de referencia (p. ej. CLIP, SigLIP) | no disponible en la información proporcionada | no disponible | no disponible | Modelos entrenados y evaluados |
| Alternativas de juguete para docencia | no disponible en la información proporcionada | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: es una inicialización válida para pruebas de humo, no un modelo funcional para tareas reales.
- No se ha auditado su robustez, equidad ni transferencia de dominio, según declara el propio autor.
- No hay benchmarks publicados ni métricas de rendimiento verificables.
- No se especifican idiomas soportados ni longitud de contexto, lo que impide planificar su uso multilingüe o con entradas largas.
- Al ser una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito.
- Licencia Apache 2.0 permite uso comercial del código y los pesos, pero deben revisarse por separado los términos de los datos fuente si se usa con datasets externos.
- Riesgo de alucinación y sesgos: no evaluables al no existir un modelo entrenado.
- Cualquier resultado de un futuro checkpoint entrenado debe documentarse por separado de los valores por defecto aquí incluidos.

## Enlaces

- Hugging Face: https://huggingface.co/obriensam/tiny-transformer-retrieval
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
