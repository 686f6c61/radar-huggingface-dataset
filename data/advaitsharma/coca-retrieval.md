# advaitsharma/coca-retrieval

## Resumen

El repositorio `advaitsharma/coca-retrieval` aloja una implementación compacta y personalizada en PyTorch de la arquitectura Coca (CoCa, Contrastive Captioners) orientada a tareas de recuperación de información (retrieval). El autor, advaitsharma, presenta esta implementación como un punto de partida experimental para revisión de código, pruebas de humo (smoke tests) y experimentos pequeños y controlados, y no como un modelo preentrenado listo para producción. La configuración incluida es de escala base, con atención multi-query, fusión mediante concat mlp, activación ReLU y normalización LayerNorm. El checkpoint publicado, `model.safetensors`, contiene 24.832 parámetros y es un checkpoint de inicialización válido, no un modelo entrenado con resultados publicados. No se indica longitud de contexto, idiomas soportados ni datos de entrenamiento, por lo que el modelo debe tratarse exclusivamente como un artefacto experimental de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coca |
| Parametros totales | 24.832 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura implementada es una versión base de Coca para retrieval, construida en PyTorch. La configuración registrada incluye atención multi-query, fusión de modalidades mediante concatenación seguida de MLP (concat mlp), activación ReLU y normalización LayerNorm. No se proporciona información sobre la longitud de contexto, el número de capas, dimensiones ocultas ni el número de cabezas de atención, por lo que estos detalles no están disponibles en la documentación publicada.

Respecto al entrenamiento, no se han publicado datos sobre el corpus utilizado, la composición del dataset ni el número de tokens procesados. La configuración por defecto incluida (`training_args.json`) emplea el optimizador novograd con un programador exponencial, pero el propio modelo indica que estos valores son puntos de partida y no evidencia de una ejecución completada. No se mencionan técnicas de alineación como RLHF ni DPO. El checkpoint `model.safetensors` es un checkpoint de inicialización, no un modelo entrenado, y no se reclama ningún resultado de benchmark.

## Capacidades

- Implementa una arquitectura Coca para tareas de recuperación de información (retrieval), aunque el checkpoint publicado no está entrenado, por lo que no se pueden garantizar capacidades reales de recuperación.
- No se han documentado capacidades de generación de texto, razonamiento, generación de código ni matemáticas.
- No se ha verificado soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se han publicado capacidades multilingües ni de visión.
- La configuración base está pensada para revisión de código, pruebas de humo y experimentos controlados, no como un modelo funcional de producción.

## Casos de uso

- Revision de codigo: el script principal (`main.py`) permite revisar y comprender una implementación compacta de Coca para retrieval, útil para desarrolladores que quieran estudiar el diseño de esta arquitectura.
- Pruebas de humo (smoke tests): el checkpoint de inicialización es válido para verificar que el entorno de PyTorch, los archivos de configuración y el script de ejemplo funcionan correctamente antes de iniciar experimentos.
- Experimentos controlados de arquitectura: los investigadores pueden modificar `config.json` (por ejemplo, cambiar la atención multi-query, la activación o la normalización) y ejecutar experimentos pequeños en datasets de evaluación como Flickr30k, comparando variantes con una capacidad equivalente.
- Estudio de inicialización de pesos: al tratarse de un checkpoint sin entrenar, permite investigar el comportamiento de la inicialización aleatoria en una arquitectura Coca y su efecto en tareas de retrieval.
- Desarrollo de adaptadores: al ser una implementación personalizada sin integración con APIs genéricas de carga, este repositorio sirve como base para escribir adaptadores que permitan cargar los pesos con otras librerías.
- Pruebas de integracion en pipelines de entrenamiento: el checkpoint de inicialización es útil para probar pipelines de entrenamiento, loggers o sistemas de evaluación sin los costes de cómputo de modelos grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no reclama ninguna puntuación de evaluación, y el propio autor indica que no se presentan resultados de un checkpoint entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: con 24.832 parámetros, la carga completa en FP32 ocupa aproximadamente 99 KB, más el overhead del script y los tensores auxiliares, por lo que se puede ejecutar incluso en CPU con menos de 1 GB de memoria.
- GPU recomendadas: no se requiere ninguna GPU específica; cualquier CPU o GPU es suficiente.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en cualquier GPU de consumo, incluidas las más antiguas o de gama baja.
- Opciones de despliegue: no está integrado con vLLM, llama.cpp, Ollama ni TGI. Al ser una implementación personalizada, requiere un adaptador explícito antes de usar APIs de carga automática.
- Latencia y throughput estimados: no disponible, aunque al ser un modelo tan pequeño la latencia en CPU sería despreciable; no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de modelos comparables de la misma categoria (modelos de 24.832 parametros sin entrenar para retrieval) con resultados publicados. Existen repositorios con implementaciones muy similares, como `ucdavisme-chatronics/retrieval` e `Ivanmikhailov/coca-retrieval-notebook`, que siguen la misma estructura de archivos y propósito experimental, pero ninguno ofrece un modelo entrenado ni benchmarks.

## Limitaciones y advertencias

- El checkpoint incluido no ha sido entrenado, por lo que no ofrece ninguna capacidad de retrieval real ni puede utilizarse como modelo funcional.
- La implementación no ha sido auditada para robustez, equidad ni transferencia de dominio, tal como indica el propio autor.
- No se ha verificado el comportamiento frente a sesgos o alucinaciones, al no existir un entrenamiento sobre datos reales.
- Al ser una implementación personalizada, las APIs genéricas de carga automática de Hugging Face no funcionan sin un adaptador explícito.
- La licencia MIT permite uso comercial, pero el autor advierte que deben revisarse los términos de la fuente de datos cuando se utilice el repositorio con datasets externos.
- Los valores de `training_args.json` son puntos de partida, no resultados de una ejecución completada; no deben interpretarse como una receta de entrenamiento validada.

## Enlaces

- Hugging Face: https://huggingface.co/advaitsharma/coca-retrieval
- Repositorio similar: https://huggingface.co/ucdavisme-chatronics/retrieval
- Repositorio similar: https://huggingface.co/Ivanmikhailov/coca-retrieval-notebook/tree/main
