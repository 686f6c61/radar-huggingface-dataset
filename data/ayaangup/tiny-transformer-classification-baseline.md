# ayaangup/tiny-transformer-classification-baseline

## Resumen

El modelo `ayaangup/tiny-transformer-classification-baseline` es un prototipo de investigación de un transformer de tamaño mínimo (33.088 parámetros) orientado a tareas de clasificación. Desarrollado por el usuario ayaangup, se publica como un punto de partida experimental, no como un modelo entrenado y validado. Su arquitectura emplea atención lineal, fusión por concatenación con MLP, activación mish y normalización rmsnorm, lo que lo convierte en un ejemplo didáctico de implementación ligera de transformers.

La relevancia de este modelo reside en su carácter educativo y de referencia: permite estudiar el comportamiento de arquitecturas transformer a escala reducida, probar configuraciones de entrenamiento y servir como baseline de capacidad mínima en experimentos de clasificación. No se presentan resultados de rendimiento ni se afirma que el checkpoint incluido esté entrenado; es únicamente un checkpoint de inicialización para pruebas de humo. Su licencia Apache 2.0 facilita su uso y modificación en entornos académicos o de desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tiny Transformer (atención lineal, fusión concat MLP, activación mish, normalización rmsnorm) |
| Parametros totales | 33.088 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer compacto con atención lineal en lugar de atención softmax estándar, lo que reduce la complejidad computacional. La fusión de características se realiza mediante concatenación seguida de un MLP, y se emplea activación mish y normalización rmsnorm. El repositorio incluye un archivo `config.json` con la configuración generada y un `training_args.json` con una receta experimental por defecto (optimizador novograd y programación exponencial), pero estos valores son solo puntos de partida, no evidencias de un entrenamiento completado.

El checkpoint `model.safetensors` es un checkpoint de inicialización válido para pruebas de humo, no un modelo entrenado. No se ha realizado entrenamiento con datos reales ni se han documentado procesos de RLHF, DPO u otros ajustes. La implementación es personalizada, por lo que las APIs genéricas de Hugging Face requieren un adaptador explícito para cargar el modelo.

## Capacidades

- Clasificación básica: el modelo está diseñado para tareas de clasificación, aunque sin entrenamiento previo no puede realizar ninguna tarea útil.
- Ejecución de pruebas de humo: permite verificar que el pipeline de entrenamiento/inferencia funciona correctamente.
- Personalización completa: al ser un prototipo, el usuario puede modificarlo y entrenarlo desde cero.
- Sin soporte de tool calling, agentes, razonamiento multi-paso, visión, audio o capacidades multilingües (no implementadas ni documentadas).

## Casos de uso

- Educación en arquitecturas transformer: sirve como ejemplo mínimo y comprensible para enseñar los componentes de un transformer (atención lineal, normalización, MLP) en cursos de aprendizaje automático.
- Pruebas de concepto de pipelines de entrenamiento: los desarrolladores pueden usar el checkpoint de inicialización para validar que su infraestructura de entrenamiento (datos, optimizador, programación) funciona antes de escalar a modelos mayores.
- Baseline de capacidad mínima: en experimentos de clasificación, este modelo puede servir como referencia de rendimiento inferior, comparando con modelos más grandes o con arquitecturas alternativas.
- Investigación sobre atención lineal: al emplear atención lineal, es útil para estudiar sus propiedades en tareas de clasificación a pequeña escala.
- Desarrollo de adaptadores personalizados: dado que no es compatible con las APIs estándar, su uso fomenta la escritura de código de integración específico, útil para aprender el funcionamiento interno de Hugging Face.
- Experimentos de regularización y optimización: con solo 33k parámetros, es ideal para probar rápidamente diferentes configuraciones de optimizador (como novograd) y programaciones de tasa de aprendizaje sin coste computacional significativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint no está entrenado.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB (33k parámetros en precisión float32 ocupan aproximadamente 132 KB, por lo que cualquier GPU o incluso CPU puede ejecutarlo).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, aunque no es necesaria; una CPU moderna es suficiente para inferencia y entrenamiento a esta escala.
- Compatibilidad con GPU de consumo: sí, cualquier GPU de consumo (por ejemplo, GTX 1050, RTX 2060, etc.) es más que suficiente.
- Opciones de despliegue: al ser una implementación personalizada, no es compatible directamente con vLLM, llama.cpp, Ollama o TGI. Se requiere ejecutar el script `pipeline.py` incluido en el repositorio.
- Latencia y throughput: no disponibles, pero dado el tamaño mínimo, la latencia será del orden de milisegundos en CPU y microsegundos en GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos. Existen otros repositorios de "tiny transformers" (por ejemplo, los encontrados en GitHub), pero no se han documentado comparaciones de rendimiento, parámetros o contexto con este modelo. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El checkpoint incluido no está entrenado: no debe utilizarse para ninguna tarea real de clasificación, ya que producirá resultados aleatorios.
- No se ha auditado la robustez, equidad ni transferencia de dominio: el autor advierte que el modelo es un punto de partida experimental.
- No hay soporte para APIs estándar de Hugging Face: se requiere un adaptador personalizado, lo que limita su integración en flujos existentes.
- Sin documentación de idiomas, contexto o cuantizaciones: estos aspectos no están definidos, por lo que no se puede garantizar su comportamiento en escenarios multilingües o de contexto largo.
- Licencia Apache 2.0 permite uso comercial, pero se debe revisar la licencia de los datos externos si se entrena con ellos.
- Riesgo de alucinación: no aplica, ya que no genera texto libre; su función es clasificación, pero sin entrenamiento no es fiable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ayaangup/tiny-transformer-classification-baseline
- Repositorio TinyTransformer (skolouri): https://github.com/skolouri/TinyTransformer
- Repositorio tinyTransformer (avvorstenbosch): https://github.com/avvorstenbosch/tinyTransformer
- Artículo "Transformer models: an introduction and catalog": https://arxiv.org/html/2302.07730v4
- Documentación de Transformers de Hugging Face: https://huggingface.co/docs/transformers/index
