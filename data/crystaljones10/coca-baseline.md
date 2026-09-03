# crystaljones10/coca-baseline

## Resumen

El modelo `crystaljones10/coca-baseline` es un prototipo de investigación orientado a tareas de *retrieval* (recuperación de información), desarrollado por Crystal Jones y publicado en Hugging Face bajo licencia BSD-3-Clause. Se basa en la arquitectura Coca (Contrastive Captioners), una familia de modelos que combina aprendizaje contrastivo y generación de descripciones para alinear representaciones de imagen y texto. Este repositorio concreto presenta una configuración a escala "nano" con atención dispersa (*sparse attention*), fusión de bajo rango, activación *approx gelu* y normalización RMSNorm.

El checkpoint incluido (`model.safetensors`) es un punto de inicialización válido para pruebas de humo, no un modelo entrenado. El autor no presenta ningún resultado de benchmarks ni afirma capacidades verificadas. El objetivo declarado es documentar formatos y configuraciones por defecto para que otros investigadores puedan entrenar y evaluar el modelo con sus propios datos. Con solo 49.600 parámetros, se trata de una implementación mínima, útil para experimentos de arquitectura o como base para estudios de *retrieval* a pequeña escala.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coca (Contrastive Captioners) |
| Parametros totales | 49.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es Coca, un diseño que combina un codificador de imagen y un codificador de texto con un mecanismo de fusión de bajo rango. La configuración "nano" indica una escala mínima, con atención dispersa (probablemente *sparse attention* para reducir coste computacional) y normalización RMSNorm. La activación *approx gelu* sugiere una aproximación de la GELU para eficiencia. El repositorio incluye un `config.json` con los ajustes generados y un `training_args.json` con la receta experimental por defecto: optimizador AdamW y programación polinomial de la tasa de aprendizaje.

No se proporcionan datos sobre el conjunto de entrenamiento, número de tokens, ni si se aplicaron técnicas como RLHF o DPO. El checkpoint actual es solo una inicialización aleatoria, no un modelo entrenado. El autor recomienda explícitamente que cualquier evaluación futura se realice con datos de entrenamiento propios y se documente por separado.

## Capacidades

- Generación de texto: no disponible, el modelo no está entrenado para generar texto coherente.
- Razonamiento: no disponible.
- Generación de código: no disponible.
- Matemáticas: no disponible.
- Visión: el diseño Coca sugiere capacidad potencial para alinear imagen y texto, pero sin entrenamiento no hay funcionalidad real.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales: el modelo está diseñado para *retrieval* (recuperación), pero al ser un checkpoint de inicialización, no presenta ninguna capacidad funcional verificada.

## Casos de uso

Dado que el modelo no está entrenado, no se pueden listar casos de uso prácticos reales. Los únicos usos posibles son:

- Investigación de arquitectura: sirve como punto de partida para estudiar la implementación de Coca a escala nano, incluyendo atención dispersa y fusión de bajo rango.
- Pruebas de integración: permite verificar que el código de entrenamiento (`train.py`) funciona correctamente con un checkpoint de inicialización.
- Desarrollo de *retrieval* experimental: un investigador podría entrenar este modelo desde cero con un dataset como Flickr30k, siguiendo las recomendaciones del autor, para explorar el comportamiento de arquitecturas pequeñas en tareas de recuperación.
- Comparación de baselines: al ser un modelo de capacidad mínima, puede usarse como baseline de baja capacidad frente a modelos más grandes en estudios de escalado.
- Educación: útil para estudiantes que quieran entender los componentes de un modelo contrastivo de imagen-texto sin la complejidad de un sistema completo.
- Depuración de pipelines: el checkpoint permite probar el flujo de datos, la carga de safetensors y el bucle de entrenamiento antes de lanzar experimentos costosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se presenta ningún checkpoint entrenado ni se reclama ninguna puntuación. La única sugerencia de evaluación es usar Flickr30k con al menos tres semillas y un baseline de capacidad equivalente, pero no hay datos numéricos.

## Requisitos de hardware

- VRAM estimada: al tener solo 49.600 parámetros, la inferencia o el entrenamiento caben en cualquier GPU moderna, incluso en CPU. Se estima menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; incluso una CPU puede ejecutar el modelo.
- Compatibilidad con GPU de consumo: sí, cualquier GPU de consumo (GTX 1060, RTX 3060, etc.) es más que suficiente.
- Opciones de despliegue: al ser un modelo personalizado, no se puede cargar con APIs genéricas como vLLM u Ollama sin un adaptador explícito. El script `train.py` incluye un ejemplo de prueba de humo.
- Latencia y throughput: no disponible, pero dado el tamaño mínimo, la latencia sería de milisegundos en GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (Coca a escala nano para retrieval). El autor menciona la necesidad de un baseline de capacidad equivalente, pero no proporciona referencias concretas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado; no tiene capacidades funcionales reales.
- No se ha auditado en cuanto a robustez, equidad o transferencia de dominio.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de idioma.
- La licencia BSD-3-Clause permite uso comercial, pero se deben revisar los términos de los datos externos si se usan con datasets de terceros.
- El modelo es una implementación personalizada; las APIs genéricas de Hugging Face no lo cargarán sin un adaptador.
- No se recomienda su uso en producción bajo ninguna circunstancia, dado su estado experimental.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/crystaljones10/coca-baseline
- Perfil del autor: https://huggingface.co/crystaljones10
- Repositorio similar (Coca para clasificación): https://huggingface.co/williamking37/coca-baseline
