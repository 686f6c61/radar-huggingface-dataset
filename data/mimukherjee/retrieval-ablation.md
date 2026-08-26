# Mimukherjee/retrieval-ablation

## Resumen

El repositorio `Mimukherjee/retrieval-ablation` contiene una implementación funcional de **Coca** (Contrastive Captioners) orientada a tareas de retrieval, con una configuración de escala *tiny*. El autor, Mimukherjee, publica el código como artefacto principal, junto con un checkpoint de inicialización en formato safetensors que sirve exclusivamente para pruebas de humo (smoke tests) y verificación del flujo de entrenamiento. No se presenta como un modelo entrenado ni se reivindica ningún resultado de benchmark.

La relevancia de esta publicación es principalmente metodológica: ofrece una implementación transparente y reproducible de una arquitectura de retrieval con atención dispersa, fusión por concatenación y MLP, y normalización por instancia. El checkpoint incluido tiene únicamente 16.576 parámetros, lo que lo convierte en un juguete experimental útil para depurar pipelines, validar adaptadores de carga o probar configuraciones de entrenamiento a muy pequeña escala. No es un modelo listo para uso práctico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coca (tiny) |
| Parametros totales | 16.576 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es **Coca** en configuración *tiny*, con atención dispersa (*sparse attention*), fusión de modalidades mediante concatenación seguida de MLP, activación ReLU y normalización por instancia (*InstanceNorm*). No se especifican detalles sobre el número de capas, dimensiones ocultas o cabezas de atención; la configuración se registra en `config.json` dentro del repositorio.

El checkpoint `model.safetensors` es un estado de inicialización válido, no un modelo entrenado. La receta de entrenamiento por defecto usa el optimizador Adam con un programa de calentamiento lineal, pero estos valores son solo puntos de partida en el script y no evidencian una ejecución completada. El autor recomienda, para una evaluación significativa, entrenar todas las líneas base con la misma exposición a datos, presupuesto de ajuste y semillas aleatorias.

## Capacidades

- Implementación de referencia de Coca para retrieval, con código ejecutable (`run.py`) y configuración reproducible.
- Soporte de carga de pesos en formato safetensors mediante un adaptador explícito (no compatible con APIs genéricas de carga automática).
- Incluye un ejemplo de prueba de humo generado en el bloque `__main__` del script.
- No se atribuyen capacidades de generación, razonamiento, código o visión al checkpoint, ya que no ha sido entrenado.
- No hay soporte declarado de tool calling, agentes o razonamiento multi-paso.

## Casos de uso

- **Validación de pipelines de entrenamiento**: el checkpoint de inicialización permite verificar que el bucle de entrenamiento, la propagación hacia adelante y hacia atrás, y la actualización de pesos funcionan correctamente antes de lanzar experimentos con modelos de mayor escala.
- **Pruebas de integración de adaptadores de carga**: al ser una implementación personalizada, sirve para desarrollar y depurar adaptadores que permitan cargar los pesos en frameworks externos.
- **Experimentos de ablación a escala mínima**: el nombre del repositorio sugiere su uso en estudios de ablación; con 16k parámetros se pueden ejecutar barridos rápidos de hiperparámetros o variaciones arquitectónicas en hardware modesto.
- **Educación e investigación**: útil para estudiantes o investigadores que quieran estudiar el funcionamiento interno de una arquitectura de retrieval basada en Coca sin la complejidad de modelos grandes.
- **Pruebas de reproducibilidad**: el autor recomienda evaluar en Flickr30k con al menos tres semillas; el checkpoint permite verificar que el entorno de evaluación está correctamente configurado.
- **No es adecuado para tareas de producción** ni para inferencia real, dado que no ha sido entrenado y carece de capacidades demostradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que no se reivindica ninguna puntuación y que el checkpoint no es un modelo entrenado.

## Requisitos de hardware

- Con solo 16.576 parámetros, el modelo cabe en cualquier GPU comercial, incluso en las más básicas, y también puede ejecutarse en CPU sin problemas.
- VRAM estimada: inferior a 1 GB (el peso del safetensors es de aproximadamente 66 KB).
- GPU recomendadas: cualquiera, incluidas GTX 1050, RTX 2060 o superiores; también funciona en Apple Silicon o CPUs convencionales.
- Opciones de despliegue: al ser una implementación personalizada, no es compatible directamente con vLLM, llama.cpp, Ollama o TGI. Requiere un adaptador específico o ejecutar el script `run.py` incluido.
- Latencia y throughput: no disponibles, pero al ser un modelo minúsculo, la inferencia sería prácticamente instantánea en cualquier hardware moderno.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables con tan pocos parámetros y sin entrenamiento en el ecosistema de retrieval. Las implementaciones de Coca de referencia (como las de OpenAI o los modelos CoCa de Google) tienen escalas de cientos de millones o miles de millones de parámetros y están entrenadas, por lo que no son directamente comparables.

## Limitaciones y advertencias

- El checkpoint de inicialización **no ha sido entrenado** ni auditado para robustez, equidad o transferencia de dominio.
- No se puede utilizar para ninguna tarea real de retrieval o generación; cualquier resultado obtenido con él carece de significado.
- La implementación es personalizada y no compatible con APIs de carga automática estándar; requiere un adaptador explícito.
- No se proporcionan datos sobre sesgos, alucinación o limitaciones de contexto porque el modelo no tiene capacidades funcionales.
- La licencia BSD-3-Clause permite uso comercial, pero los términos de las fuentes de datos externas (por ejemplo, Flickr30k) deben revisarse por separado si se utiliza con esos conjuntos.
- Cualquier resultado futuro de un checkpoint entrenado debe documentarse de forma separada de los valores por defecto incluidos en el repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Mimukherjee/retrieval-ablation
- No se han encontrado otros enlaces relevantes (papers, blogs o demos) asociados a este modelo en la búsqueda web realizada.
