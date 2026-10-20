# matviybondarenko/hybrid-experiment

## Resumen

`matviybondarenko/hybrid-experiment` es un repositorio experimental de Hugging Face que contiene una implementación pequeña de una arquitectura híbrida orientada a aprendizaje contrastivo, junto con su configuración, una receta de entrenamiento y un checkpoint de inicialización. No es un modelo entrenado ni una release lista para producción: el propio autor indica que el checkpoint sirve para pruebas de humo y que no se reclama ninguna puntuación de benchmark.

El modelo declara atención multi-query, fusión de bajo rango, activación ReLU y normalización GroupNorm, con una escala etiquetada como "huge" y 24.832 parámetros totales según los metadatos de safetensors. La licencia es Apache-2.0 y el formato de pesos es safetensors, acompañado de un script PyTorch (`finetune.py`) y archivos JSON de configuración y argumentos de entrenamiento.

Su relevancia actual es limitada y de carácter metodológico: sirve como punto de partida reproducible para experimentos de arquitecturas híbridas y contrastivas, no como base para aplicaciones de lenguaje, visión o agentes. No hay información sobre contexto, idiomas, cuantizaciones ni pipeline de inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Hybrid: atención multi-query, fusión de bajo rango, activación ReLU, normalización GroupNorm |
| Escala declarada | "huge" (etiqueta del autor; no implica un modelo de gran tamaño en parámetros) |
| Parámetros totales | 24.832 (según metadatos de safetensors; sin desglose publicado) |
| Parámetros activos | No aplica (no es MoE; no se declaran parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors; implementación PyTorch (`finetune.py`); configuración en JSON |
| Pipeline de Hugging Face | no disponible |
| Estado | Checkpoint de inicialización; no es un modelo entrenado |

## Arquitectura y entrenamiento

El repositorio describe una arquitectura Hybrid con atención multi-query, fusión de bajo rango, activación ReLU y normalización GroupNorm. No se especifican número de capas, dimensión oculta, número de cabezas de atención, longitud de contexto ni composición del dataset de entrenamiento. La etiqueta "huge" aparece en la model card, pero los metadatos indican 24.832 parámetros y el tamaño del repositorio es de 0.0 GB, por lo que conviene verificar la configuración antes de interpretar esa etiqueta como una indicación de escala real.

La receta por defecto usa optimizador Lion con un schedule de warmup lineal, pero el autor aclara que son valores iniciales del script, no evidencia de un entrenamiento completado. No se documentan tokens de entrenamiento, mezcla de datos, RLHF/DPO ni evaluación. `model.safetensors` es un checkpoint de inicialización válido para pruebas de humo; la implementación es personalizada y las APIs genéricas de carga automática requieren un adaptador explícito.

## Capacidades

- Implementación de una arquitectura híbrida para experimentos de aprendizaje contrastivo; el título y los tags indican "contrastive", pero no se detalla la pérdida ni la tarea concreta.
- Carga de un checkpoint de inicialización en safetensors para pruebas de humo.
- Ejecución de un script de ajuste fino (`finetune.py`) con receta por defecto Lion + warmup lineal.
- Generación de texto, razonamiento, código, matemáticas o visión: no acreditadas; no hay checkpoint entrenado ni benchmarks publicados.
- Tool calling / function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Multilingüismo: no disponible; no se declaran idiomas soportados.
- Capacidades especiales como thinking mode, visión o audio: no disponible.

## Casos de uso

- Pruebas de humo de integración: cargar `model.safetensors` con `config.json` y ejecutar `python finetune.py --help` para verificar que el entorno PyTorch y la implementación funcionan antes de invertir en un entrenamiento.
- Reproducción de experimentos contrastivos: usar `training_args.json` como base para lanzar entrenamientos con Lion y warmup lineal, manteniendo semillas, presupuesto de ajuste y exposición de datos idénticos entre variantes.
- Investigación de arquitecturas híbridas: modificar la atención multi-query, la fusión de bajo rango o la normalización GroupNorm y comparar el efecto en una tarea concreta con un conjunto de validación reservado.
- Desarrollo de adaptadores de carga: implementar un wrapper específico para esta arquitectura personalizada y probar su integración con PyTorch, ya que las APIs automáticas genéricas no la cargan sin adaptador.
- Docencia y prototipado: servir como ejemplo mínimo de repositorio con configuración, script de ajuste fino y checkpoint de inicialización para explicar el ciclo de vida de un experimento.
- Preparación de baselines de capacidad: usar el checkpoint de inicialización como referencia de partida en experimentos controlados, sin atribuirle rendimiento predictivo hasta entrenarlo y evaluarlo.
- Validación de pipelines de datos: conectar el script a un dataset propio y verificar formas de tensores, dispositivo y estabilidad numérica antes de escalar el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reclama ninguna métrica y el checkpoint no está entrenado, por lo que no procede comparar resultados de MMLU, HumanEval, GSM8K u otras evaluaciones estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP32 ocupan aproximadamente 97 KiB (24.832 parámetros × 4 bytes); en FP16, aproximadamente 48,5 KiB. El overhead del runtime de PyTorch puede ser muy superior.
- GPU recomendadas: no se requieren A100, H100 ni RTX 4090
