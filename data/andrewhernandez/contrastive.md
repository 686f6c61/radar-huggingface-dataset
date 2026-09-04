# andrewhernandez/contrastive

## Resumen

El repositorio `andrewhernandez/contrastive` contiene un modelo experimental basado en la arquitectura Perceiver, orientado a tareas de aprendizaje contrastivo. Ha sido desarrollado por andrewhernandez como un código base deliberadamente reducido, con el objetivo de facilitar la inspección de cambios arquitectónicos antes de lanzar un entrenamiento completo.

El checkpoint incluido (`model.safetensors`) es un punto de partida de inicialización, no un modelo entrenado. No se presentan resultados de benchmarks ni se reclama ningún rendimiento. La relevancia de este repositorio radica en su utilidad como banco de pruebas para experimentar con variantes de atención (dilatada, co-attention), normalización (GroupNorm) y activaciones (GELU tanh) dentro del marco Perceiver.

A nivel técnico, se trata de una implementación de escala base, con 49.600 parámetros totales, lo que lo convierte en un modelo extremadamente pequeño, adecuado para pruebas de humo y ejecución en CPU. No se especifica la longitud de contexto ni los idiomas soportados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceiver |
| Parametros totales | 49.600 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | No disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa una arquitectura Perceiver, un tipo de transformer que procesa entradas de alta dimensionalidad mediante un conjunto de latentes. En esta implementación, la atención es dilatada, la fusión se realiza mediante co-attention, la activación es GELU tanh y la normalización es GroupNorm. Estas opciones quedan registradas en `config.json`.

El repositorio incluye `training_args.json` con una receta de experimento por defecto que utiliza el optimizador Adam con un programa de calentamiento lineal. Sin embargo, el README aclara explícitamente que estos son valores iniciales del script y no evidencia de un entrenamiento completado. El checkpoint `model.safetensors` es un checkpoint de inicialización válido para pruebas de humo, no un modelo entrenado ni auditado. No se han publicado datos sobre el conjunto de datos de entrenamiento, el número de tokens ni procesos de RLHF/DPO.

## Capacidades

- Implementa una arquitectura Perceiver con atención dilatada y co-attention, pensada para aprendizaje contrastivo.
- Incluye un ejemplo ejecutable de prueba de humo en el script principal (`model.py`), accesible mediante `python model.py --help`.
- No se han demostrado capacidades funcionales de generación de texto, razonamiento, código, matemáticas, visión o audio.
- No soporta tool calling ni function calling.
- No se han publicado resultados de evaluación ni benchmarks.
- La implementación es personalizada, por lo que las APIs genéricas de carga automática requieren un adaptador explícito.

## Casos de uso

- Investigación y prototipado de arquitecturas Perceiver para aprendizaje contrastivo: el tamaño reducido y la configuración modular permiten iterar rápidamente sobre variantes de atención y normalización sin costes computacionales significativos.
- Pruebas de humo de implementaciones personalizadas: el checkpoint de inicialización sirve para verificar que el código de entrenamiento e inferencia funciona antes de lanzar un entrenamiento completo.
- Comparación de configuraciones de atención (dilatada, co-attention) en tareas contrastivas: los cambios de arquitectura pueden inspeccionarse y evaluarse con datos propios, manteniendo la exposición de datos y el presupuesto de ajuste controlados.
- Desarrollo de adaptadores para integrar el modelo en frameworks estándar: al ser una implementación personalizada, se puede escribir un adaptador para cargarlo desde HuggingFace u otras plataformas.
- Experimentos de inicialización y entrenamiento con conjuntos de datos pequeños: el modelo, al tener solo 49.600 parámetros, puede entrenarse en CPU o en GPUs modestas, lo que facilita pruebas de concepto y docencia.
- Educación en aprendizaje contrastivo y arquitecturas de atención: el código fuente y la configuración registrada permiten estudiar los componentes internos de un Perceiver y su comportamiento en tareas de contraste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README del repositorio declara explícitamente que no se reclama ninguna puntuación de benchmark. No se aportan datos de MMLU, HumanEval, GSM8K ni otras métricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Dado que el modelo tiene 49.600 parámetros, el peso en FP32 ocupa aproximadamente 198 KB, por lo que cualquier GPU o CPU con más de 1 MB de memoria disponible puede ejecutarlo.
- GPU recomendadas: no requiere una GPU específica; puede ejecutarse en cualquier GPU consumer (RTX serie 30, 40, etc.) e incluso en GPU integradas o en CPU.
- Cabe en cualquier GPU consumer sin problema.
- Opciones de despliegue: no disponible. Al ser una implementación personalizada, no se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI. El script `model.py` puede ejecutarse directamente con Python.
- Latencia y throughput estimados: no disponibles. Al no haber benchmarks ni mediciones publicadas, no se puede proporcionar una estimación fiable.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la misma categoría (modelo experimental, no entrenado, basado en Perceiver para contrastive). Aunque CLIP es un modelo contrastivo conocido, no es comparable en tamaño (CLIP tiene millones de parámetros), ni en propósito (CLIP está entrenado y disponible para uso real), ni en licencia o disponibilidad. Por tanto, no procede una comparación directa.

## Limitaciones y advertencias

- El checkpoint es de inicialización y no ha sido entrenado, por lo que no debe utilizarse para tareas reales de inferencia.
- No se ha auditado en términos de robustez, equidad ni transferencia de dominio.
- Los resultados de un futuro checkpoint entrenado deben documentarse por separado de los valores por defecto incluidos en el repositorio.
- La implementación requiere un adaptador explícito para las APIs de carga automática genéricas, lo que dificulta su integración directa en pipelines estándar.
- No se han publicado benchmarks ni evaluaciones de rendimiento, por lo que no hay evidencia de calidad.
- La licencia BSD-3-Clause permite el uso comercial, pero el README advierte que deben revisarse los términos de los datos fuente si se utilizan conjuntos de datos externos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/andrewhernandez/contrastive
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios adicionales) en la información proporcionada.
