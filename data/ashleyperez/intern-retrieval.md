# ashleyperez/intern-retrieval

## Resumen

El modelo `ashleyperez/intern-retrieval` es un repositorio experimental que implementa una arquitectura **Swin T** (Swin Transformer Tiny) adaptada para tareas de *retrieval* (recuperación de información). Desarrollado por Ashley Perez, el proyecto se presenta como un código base de tamaño reducido cuyo objetivo es permitir inspeccionar cambios arquitectónicos antes de un entrenamiento completo. El repositorio incluye un checkpoint de inicialización (`model.safetensors`) de solo 49.600 parámetros, que no ha sido entrenado y no debe considerarse un modelo funcional.

La relevancia de este proyecto radica en su carácter didáctico y de prototipado: ofrece una implementación personalizada con atención *grouped query*, fusión *concat mlp* y normalización *batchnorm*, junto con una receta de entrenamiento por defecto (adafactor con schedule coseno). No se reclama ningún resultado de benchmark, y la model card advierte explícitamente que el checkpoint es solo para pruebas de humo. Es, por tanto, un punto de partida para investigadores que quieran experimentar con arquitecturas de retrieval basadas en Swin Transformer, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin T (Swin Transformer Tiny) adaptada para retrieval |
| Parametros totales | 49.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se describe como **Swin T** a escala pequeña, con atención *grouped query*, fusión mediante *concat mlp*, activación *approx gelu* y normalización *batchnorm*. No se especifican detalles sobre el número de capas, dimensiones ocultas o mecanismo de atención exacto más allá de lo indicado. El repositorio incluye un `config.json` que registra la configuración generada, pero no se proporcionan detalles adicionales en la documentación.

En cuanto al entrenamiento, la model card indica que la receta por defecto usa **adafactor** con schedule **coseno**, pero aclara que son valores iniciales del script y no evidencia de una ejecución completada. No hay información sobre el dataset de entrenamiento, número de tokens, ni procesos de RLHF o DPO. El checkpoint incluido es una inicialización válida para pruebas de humo, no un modelo entrenado.

## Capacidades

- No se han demostrado capacidades funcionales: el checkpoint no está entrenado y no se reclama ningún resultado.
- El código implementa una arquitectura de retrieval, pero sin datos de evaluación no se puede afirmar que realice tareas de recuperación de forma efectiva.
- No hay soporte documentado para tool calling, agentes, razonamiento multi-step, visión o capacidades multilingües.
- La implementación es personalizada y requiere un adaptador explícito para cargarse con APIs genéricas de HuggingFace.

## Casos de uso

- **Investigación en arquitecturas de retrieval**: el código permite probar variaciones de Swin T (atención grouped query, fusión concat mlp) en tareas como Flickr30k, tal como sugiere la model card. Se usaría como base para experimentos controlados con múltiples semillas.
- **Prototipado rápido de modelos de recuperación**: al ser un checkpoint de inicialización, sirve para verificar que el pipeline de entrenamiento funciona antes de escalar a modelos mayores.
- **Pruebas de humo en CI/CD**: el script `train.py` incluye un ejemplo ejecutable que puede integrarse en pipelines de integración continua para validar la correcta inicialización de pesos y el flujo de datos.
- **Educación y formación**: como ejemplo de implementación de un transformer de visión aplicado a retrieval, es útil para estudiantes que quieran entender la estructura interna de estos modelos.
- **Comparación de configuraciones**: permite evaluar el impacto de cambios arquitectónicos (p. ej., normalización, activación) en un entorno controlado y de bajo coste computacional.
- **Desarrollo de adaptadores personalizados**: al ser una implementación custom, puede servir para practicar la creación de adaptadores que permitan cargar el modelo con APIs estándar de HuggingFace.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclama ninguna puntuación y que el checkpoint no está entrenado. Se sugiere una primera evaluación con Flickr30k, reportando la métrica de tarea en al menos tres semillas e incluyendo un baseline de capacidad equivalente, pero no se proporcionan datos numéricos.

## Requisitos de hardware

- Con solo 49.600 parámetros, el modelo es extremadamente ligero y puede ejecutarse en cualquier CPU moderna sin necesidad de GPU.
- Si se desea usar GPU, cualquier tarjeta con al menos 1 GB de VRAM es suficiente; incluso una GPU integrada podría manejar la inferencia.
- El entrenamiento experimental con este tamaño también es viable en hardware de consumo, como una RTX 3060 o superior, aunque el coste real depende del dataset y la configuración.
- Opciones de despliegue: al ser un checkpoint de inicialización, no se recomienda desplegarlo en producción. Para experimentación, puede ejecutarse directamente con el script `train.py` o adaptarse para frameworks como PyTorch.
- No se dispone de datos de latencia o throughput, pero dado el tamaño, serían despreciables en cualquier hardware moderno.

## Comparativa con modelos similares

Existe otro repositorio similar en HuggingFace: `Rvmalhotra/intern-retrieval`, que también implementa una arquitectura de retrieval (descrita como "Hybrid for Retrieval") con licencia BSD-3-Clause. Sin embargo, no se dispone de detalles sobre sus parámetros, arquitectura exacta o rendimiento, por lo que no es posible establecer una comparación cuantitativa. No se conocen otros modelos comparables en la misma categoría (Swin T para retrieval) con datos públicos.

## Limitaciones y advertencias

- **Checkpoint no entrenado**: el archivo `model.safetensors` es solo una inicialización para pruebas de humo; no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio.
- **Sin resultados de evaluación**: no se proporcionan benchmarks ni métricas, por lo que no se puede afirmar que el modelo funcione correctamente en tareas de retrieval.
- **Implementación personalizada**: requiere un adaptador explícito para cargarse con APIs genéricas; no es compatible con `AutoModel` de HuggingFace sin modificaciones.
- **Riesgo de malinterpretación**: al ser un proyecto experimental, cualquier resultado derivado de este código debe documentarse por separado y no atribuirse al checkpoint incluido.
- **Licencia MIT**: permite uso comercial, pero la model card advierte que se deben revisar los términos de las fuentes de datos externas si se usan con datasets como Flickr30k.
- **Sin soporte de idiomas**: no se especifican idiomas soportados, lo que limita su uso a contextos donde la documentación no aclara este aspecto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ashleyperez/intern-retrieval
- Repositorio similar (Rvmalhotra/intern-retrieval): https://huggingface.co/Rvmalhotra/intern-retrieval
