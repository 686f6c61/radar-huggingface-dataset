# markpopovjif/cnn-transformer-experiment

## Resumen

El modelo `markpopovjif/cnn-transformer-experiment` es un prototipo de investigación que combina una arquitectura CNN con un Transformer orientado a tareas de generación de texto. Lo desarrolla el usuario de HuggingFace `markpopovjif` (Ирина Морозова) y se publica como un experimento de código abierto bajo licencia MIT. El repositorio incluye un checkpoint de inicialización válido para pruebas de humo, pero no un modelo entrenado ni evaluado.

Con solo 24.832 parámetros, este modelo es extremadamente pequeño y no pretende competir con modelos de producción. Su propósito es servir como punto de partida para experimentos de arquitectura híbrida CNN-Transformer, documentando configuraciones por defecto y formatos de archivo. La relevancia actual es limitada: se trata de un artefacto de investigación sin resultados de rendimiento verificados, útil para estudiar la viabilidad de fusionar convoluciones con atención por grupos (grouped query attention) en un contexto de generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cnn Transformer (híbrido CNN + Transformer) |
| Parametros totales | 24.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se describe como "Cnn Transformer" a escala "xlarge" (denominación interna, no relacionada con el tamaño real de parámetros). Emplea atención por grupos (grouped query attention), fusión mediante cross-attention, activación swish y normalización por batch (batchnorm). El repositorio incluye un `config.json` con la configuración generada y un `training_args.json` con la receta experimental por defecto, que usa el optimizador Novograd con un programador de tasa de aprendizaje exponencial. No se especifica el número de tokens de entrenamiento ni la composición del dataset, ya que el checkpoint incluido es solo de inicialización y no ha sido entrenado. No se menciona el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Generación de texto: el modelo está orientado a tareas de generación, pero al no estar entrenado, no presenta capacidades funcionales reales.
- Arquitectura híbrida CNN-Transformer: combina capas convolucionales con atención por grupos, lo que podría ofrecer eficiencia computacional en experimentos futuros.
- Fusión cross-attention: permite integrar información de diferentes modalidades o representaciones, aunque no hay evidencia de uso práctico.
- Personalización: al ser un prototipo, permite modificar la arquitectura y el entrenamiento para investigación.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Investigación académica sobre arquitecturas híbridas: el modelo sirve como banco de pruebas para estudiar la combinación de CNN y Transformer en generación de secuencias, permitiendo comparar configuraciones de atención y normalización.
- Desarrollo de prototipos de bajo coste: con solo 24.832 parámetros, se puede ejecutar en CPU y usar para validar pipelines de entrenamiento y evaluación sin necesidad de GPUs.
- Pruebas de integración de safetensors: el checkpoint de inicialización es útil para verificar que el cargador de pesos y el adaptador personalizado funcionan correctamente antes de entrenar un modelo real.
- Educación en arquitecturas de modelos: sirve como ejemplo didáctico de cómo estructurar un proyecto de investigación con configuración, argumentos de entrenamiento y checkpoint.
- Experimentación con optimizadores: la receta por defecto con Novograd y schedule exponencial permite explorar el comportamiento de estos componentes en un entorno controlado.
- Base para desarrollo de un modelo de generación específico: un investigador podría entrenar este checkpoint desde cero con un dataset propio y documentar los resultados por separado, siguiendo las guías de evaluación del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se reclama ninguna puntuación de rendimiento y que el checkpoint es solo de inicialización. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB (24.832 parámetros en FP32 ocupan aproximadamente 99 KB), por lo que cabe en cualquier dispositivo con memoria.
- GPU recomendadas: no se requiere GPU; una CPU moderna es suficiente para inferencia y entrenamiento.
- Compatibilidad con GPU de consumo: sí, cualquier GPU con al menos 1 GB de VRAM es más que suficiente.
- Opciones de despliegue: al ser una implementación personalizada, no es compatible directamente con vLLM, llama.cpp, Ollama o TGI. Requiere un adaptador explícito para cargarse con APIs genéricas, como se indica en la documentación.
- Latencia y throughput: no disponibles, pero dado el tamaño mínimo, la latencia sería de microsegundos en CPU.

## Comparativa con modelos similares

No disponible. No existen modelos comparables en el repositorio del autor ni en la información proporcionada. Dado el tamaño extremadamente reducido y su estado de prototipo sin entrenar, no tiene sentido compararlo con modelos de generación establecidos como GPT-2, Llama o Mistral. Se podría comparar con otros experimentos de investigación de tamaño similar, pero no se dispone de datos.

## Limitaciones y advertencias

- El checkpoint incluido no ha sido entrenado: no es un modelo funcional para generación de texto real.
- No se ha auditado la robustez, equidad ni transferencia de dominio: el autor lo advierte explícitamente.
- Riesgo de alucinación: no aplicable al no haber sido entrenado, pero cualquier uso posterior requeriría evaluación.
- Sin datos de idiomas soportados: no se puede garantizar ningún comportamiento multilingüe.
- Implementación personalizada: requiere un adaptador para cargarse con herramientas estándar, lo que limita su uso directo en producción.
- Licencia MIT: permite uso comercial, pero los términos de los datos externos deben revisarse por separado si se usan con otros datasets.
- Sin benchmarks ni métricas: cualquier afirmación de rendimiento debe documentarse por separado tras un entrenamiento real.

## Enlaces

- Repositorio del modelo: https://huggingface.co/markpopovjif/cnn-transformer-experiment
- Perfil del autor: https://huggingface.co/markpopovjif/models
- Página principal de Hugging Face: https://huggingface.co/
- Artículo relacionado sobre evolución de detección de objetos con CNN y Transformers (referencia contextual): https://www.nature.com/articles/s41598-026-37052-6
- Herramienta de visualización de Transformers (referencia educativa): https://github.com/poloclub/transformer-explainer
- Proyecto CTran (combinación CNN-Transformer, referencia de arquitectura similar): https://github.com/rafiepour/CTran
