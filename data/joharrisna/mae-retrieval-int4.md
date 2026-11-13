# JOHARRISna/mae-retrieval-int4

## Resumen

mae-retrieval-int4 es un repositorio de Hugging Face publicado por el usuario JOHARRISna que contiene una implementación compacta y personalizada en PyTorch de una arquitectura denominada Mae, orientada a tareas de retrieval (recuperación de información multimodal o texto-imagen). Según la propia model card, la configuración corresponde a la escala "base" y está pensada para revisión de código, pruebas de humo (smoke tests) y experimentos controlados de pequeño tamaño, no como una release preentrenada lista para producción. El checkpoint incluido (`model.safetensors`) es una inicialización válida para pruebas, no un modelo entrenado con resultados de benchmark.

El modelo declara una arquitectura Mae con atención de ventana deslizante (sliding window), fusión mediante co-attention, activación swish y normalización scalenorm. El repositorio incluye el código de inferencia/entrenamiento (`pipeline.py`), la configuración de arquitectura (`config.json`), la receta de entrenamiento por defecto (`training_args.json`, con optimizador adafactor y scheduler cosine) y el checkpoint de inicialización. No se declaran parámetros totales en la model card más allá de la escala "base", y el recuento de safetensors reportado es de 24.832 parámetros, un valor anómalamente bajo que sugiere que el checkpoint no contiene los pesos completos de un transformer de escala base.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: se trata de un artefacto experimental de un autor individual, sin descargas ni likes, sin benchmarks publicados y con una model card que explícitamente advierte de que no es un modelo entrenado ni auditado. Es útil como referencia para quien quiera reproducir la implementación o partir de ella, pero no debe confundirse con un modelo de retrieval listo para uso real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mae (transformer con atención de ventana deslizante y co-attention) |
| Parámetros totales | 24.832 (según safetensors); escala declarada "base" en la model card |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el nombre del repo sugiere int4, pero la model card no lo documenta) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint de inicialización) |

## Arquitectura y entrenamiento

La arquitectura declarada es Mae, con atención de ventana deslizante, fusión por co-attention, activación swish y normalización scalenorm. La model card describe la configuración como "base", pero no detalla el número de capas, dimensión oculta, número de cabezas ni el tamaño de la ventana de atención. El repositorio incluye `pipeline.py` como artefacto principal, que contiene tanto el modelo como un ejemplo ejecutable o punto de entrada de entrenamiento, y `config.json` con los ajustes de arquitectura generados. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La receta de entrenamiento por defecto usa el optimizador adafactor con un scheduler cosine, pero la propia model card aclara que son valores de partida del script y no evidencia de una ejecución completada. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención linear, etc.) más allá de la combinación de atención deslizante y co-attention. El checkpoint `model.safetensors` se presenta explícitamente como inicialización para smoke tests, no como pesos entrenados.

## Capacidades

- Generación de representaciones para retrieval: el modelo está orientado a tareas de recuperación, presumiblemente texto-imagen o multimodal, aunque la model card no detalla la modalidad exacta.
- Fusión multimodal mediante co-attention: la arquitectura declara co-attention, lo que sugiere combinación de dos flujos de características, pero no se especifica qué modalidades.
- Ejecución de ejemplo y entrenamiento: `pipeline.py` incluye un bloque `__main__` con un ejemplo de smoke test y un punto de entrada de entrenamiento.
- No se declara soporte de tool calling, function calling, agentes, multi-step reasoning, thinking mode, visión, audio ni capacidades multilingües.
- No se declara ningún benchmark ni métrica de rendimiento.

## Casos de uso

- Revisión de código y auditoría de implementaciones de retrieval: el repositorio sirve como referencia compacta para inspeccionar cómo se implementa una arquitectura Mae con atención deslizante y co-attention en PyTorch, sin la complejidad de un framework completo.
- Smoke tests de pipelines de retrieval: el checkpoint de inicialización permite verificar que un pipeline de carga, preprocesado y forward pass funciona antes de invertir en un modelo entrenado.
- Experimentos controlados de bajo coste: la configuración "base" y la receta adafactor + cosine permiten lanzar pruebas de convergencia en entornos con recursos limitados, siempre que se entrene desde cero.
- Punto de partida para investigación académica: un investigador puede clonar la implementación y adaptarla a su propio dataset de retrieval (por ejemplo, Flickr30k, como sugiere la model card) con un presupuesto de ajuste y semillas controladas.
- Docencia y formación: el código y la configuración son útiles para explicar conceptos de co-attention, atención deslizante y normalización scalenorm en un contexto práctico.
- Base para comparativas de arquitectura: permite emparejar capacidad con baselines y medir el efecto de cambios arquitectónicos bajo la misma exposición de datos y presupuesto de tuning.
- Integración en prototipos internos de búsqueda: solo tras entrenar el modelo con datos propios y validar métricas; el checkpoint publicado no es apto para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reclama ninguna puntuación de benchmark y que una primera evaluación útil usaría Flickr30k, reportando la métrica de la tarea en al menos tres semillas e incluyendo un baseline de capacidad emparejada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El recuento de 24.832 parámetros en safetensors es incompatible con un transformer "base" completo, por lo que no es posible estimar VRAM de forma fiable a partir de los datos publicados.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; dado el tamaño anómalo del checkpoint, no se puede confirmar que quepa ni que no quepa en ninguna GPU concreta.
- Opciones de despliegue: la model card advierte que, al ser una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (retrieval multimodal con arquitectura Mae) ni datos de rendimiento que permitan establecer una comparación rigurosa. Cualquier comparación con modelos de retrieval consolidados requeriría benchmarks que este repositorio no publica.

## Limitaciones y advertencias

- El checkpoint `model.safetensors` es una inicialización para smoke tests, no un modelo entrenado; no debe usarse para inferencia real ni para producción.
- La model card declara que el checkpoint no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio.
- No se han publicado benchmarks, por lo que no hay evidencia de calidad en ninguna tarea de retrieval.
- El recuento de parámetros reportado por safetensors (24.832) es inconsistente con la escala "base" declarada, lo que sugiere que el checkpoint no contiene los pesos completos de la arquitectura descrita.
- El nombre del repositorio incluye "int4", pero la model card no documenta ningún proceso de cuantización a 4 bits; no debe asumirse que los pesos estén cuantizados.
- No se especifican idiomas soportados, sesgos conocidos ni riesgos de alucinación; al no ser un modelo entrenado, estas categorías no son aplicables de forma directa, pero tampoco hay garantías.
- Licencia apache-2.0 permite uso comercial del código y los pesos, pero la model card advierte de revisar por separado los términos de los datos de origen si se usa con datasets externos.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en la misma fecha, lo que indica ausencia de validación por parte de la comunidad.
- Las APIs genéricas de carga automática no funcionan sin un adaptador explícito, lo que complica la integración en pipelines estándar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/JOHARRISna/mae-retrieval-int4
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
