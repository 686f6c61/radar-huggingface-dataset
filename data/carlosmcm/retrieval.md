# carlosmcm/retrieval

## Resumen

`carlosmcm/retrieval` es un repositorio experimental que implementa una arquitectura **Flamingo** a escala **nano** orientada a tareas de *retrieval*. Lo publica Carlos Martínez (`carlosmcm`), data scientist, como un *codebase* de partida para inspeccionar cambios arquitectónicos antes de lanzar un entrenamiento completo. El checkpoint incluido (`model.safetensors`) es una inicialización válida para *smoke tests*, no un modelo entrenado, y el propio autor advierte que no se reclama ningún resultado de *benchmark*.

Con solo **33.088 parámetros**, el modelo es diminuto y su propósito es puramente experimental: servir de base para estudiar la fusión por tensores, la atención *multi-query* y la normalización *layernorm* dentro del marco Flamingo aplicado a *retrieval*. No hay datos sobre longitud de contexto, idiomas soportados ni capacidades funcionales, ya que no ha sido entrenado ni evaluado. Su relevancia actual es limitada y se circunscribe al ámbito de la investigación y el prototipado rápido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flamingo (escala nano) |
| Parametros totales | 33.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización declarada) |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un **Flamingo** reducido a escala *nano*, con atención **multi-query**, fusión por **tensor fusion**, activación **approx gelu** y normalización **layernorm**. El repositorio incluye `model.py` con el código del modelo y un punto de entrada ejecutable, `config.json` con la configuración generada y `training_args.json` con la receta experimental por defecto (optimizador **lion** con *linear warmup*). No se proporciona información sobre el dataset de entrenamiento, número de tokens ni técnicas como RLHF o DPO, porque el checkpoint es una inicialización aleatoria y no ha pasado por ningún proceso de entrenamiento. El autor indica que la configuración incluida son valores de partida, no evidencia de una ejecución completada.

## Capacidades

- **Generación de texto**: no demostrada, el checkpoint no está entrenado.
- **Razonamiento, código, matemáticas, visión**: no disponibles.
- **Tool calling / function calling**: no soportado.
- **Agentes y multi-step reasoning**: no soportado.
- **Capacidades multilingües**: no disponibles.
- **Capacidades especiales**: el código permite ejecutar un *smoke test* (`python model.py --help`) para verificar la inicialización y la estructura del modelo. No hay modo *thinking*, visión ni audio.

## Casos de uso

- **Investigación de arquitecturas de retrieval**: el modelo sirve como banco de pruebas para estudiar cómo la fusión por tensores y la atención *multi-query* afectan a tareas de recuperación. Un investigador puede modificar `model.py` y ejecutar el *smoke test* para validar cambios estructurales antes de escalar.
- **Prototipado de pipelines de entrenamiento**: dado que el checkpoint es una inicialización válida, se puede usar para probar *loops* de entrenamiento, configuraciones de optimizador (lion, warmup) y estrategias de *logging* sin necesidad de un modelo grande.
- **Evaluación de metodologías de *benchmark***: el autor sugiere usar Flickr30k con al menos tres semillas y una línea base de capacidad equivalente. El modelo puede servir para validar el *harness* de evaluación antes de aplicarlo a modelos entrenados.
- **Pruebas de integración en CI/CD**: al ser minúsculo (33k parámetros), se puede integrar en pipelines de integración continua para verificar que el código de carga y ejecución funciona correctamente en diferentes entornos.
- **Educación y aprendizaje**: útil para estudiantes que quieran desmontar una implementación Flamingo a pequeña escala y entender sus componentes (atención multi-query, fusión, normalización) sin necesidad de recursos de hardware.
- **Depuración de código**: el `model.py` es el artefacto principal; los desarrolladores pueden usarlo para depurar la lógica de atención o fusión antes de aplicarla a modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El propio README del repositorio declara explícitamente que no se reclama ninguna puntuación de *benchmark* y que el checkpoint no ha sido entrenado ni auditado. Cualquier comparación con otros modelos carecería de validez.

## Requisitos de hardware

- **VRAM estimada**: con 33.088 parámetros, el modelo cabe en cualquier GPU, incluso en CPU. El consumo de memoria es despreciable (menos de 1 MB en precisión FP32).
- **GPU recomendadas**: no se requiere ninguna GPU específica; cualquier hardware moderno es suficiente.
- **Compatibilidad con GPU de consumo**: sí, cualquier GPU de consumo (incluso integradas) puede ejecutar el *smoke test*.
- **Opciones de despliegue**: al ser un *codebase* personalizado, no es compatible con vLLM, llama.cpp, Ollama o TGI sin un adaptador explícito. El README advierte que las APIs de carga automática genéricas requieren un adaptador.
- **Latencia y throughput**: no disponibles, pero dada la escala, la inferencia sería prácticamente instantánea en cualquier hardware.

## Comparativa con modelos similares

No disponible. No existe una categoría comparable de modelos con esta arquitectura y escala en el ecosistema de *retrieval*. Los modelos de recuperación habituales (como DPR, ColBERT o Sentence-BERT) tienen millones de parámetros y están entrenados; este repositorio es un *codebase* experimental sin entrenamiento, por lo que cualquier comparación sería engañosa.

## Limitaciones y advertencias

- **Checkpoint no entrenado**: `model.safetensors` es una inicialización aleatoria, no un modelo funcional. No debe usarse para tareas reales de *retrieval*.
- **Sin auditoría de robustez ni fairness**: el autor indica que el checkpoint no ha sido auditado para robustez, equidad o transferencia de dominio.
- **Riesgo de alucinación**: no aplicable, ya que no genera texto de forma significativa.
- **Limitaciones de contexto e idioma**: no se especifican, pero al no estar entrenado, no hay garantía de funcionamiento en ningún idioma.
- **Restricciones de licencia**: la licencia MIT permite uso comercial, pero el autor advierte que deben revisarse los términos de los datos externos si se usa con datasets como Flickr30k.
- **Caveat para producción**: no es apto para producción. Es un punto de partida experimental; cualquier resultado futuro de un checkpoint entrenado debe documentarse por separado.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/carlosmcm/retrieval)
- [Perfil del autor en Hugging Face](https://huggingface.co/carlosmcm/models)
- [Paper relacionado: CARLoS - Retrieval via Concise Assessment Representation of LoRAs at Scale](https://arxiv.org/html/2512.08826) (no es el modelo, pero comparte autor y temática de retrieval)
- [Nota sobre CARLoS en PaperNotes](https://en.papernotes.org/CVPR2026/model_compression/carlos_retrieval_via_concise_assessment_representation_of_loras_at_scale/)
- [Resumen de CARLoS en AIModels.fyi](https://www.aimodels.fyi/papers/arxiv/carlos-retrieval-via-concise-assessment-representation-loras)
- [Artículo relacionado: AutoMRM - Model Retrieval Method Based on Multimodal Query](https://dl.acm.org/doi/10.1145/3583780.3614787)
