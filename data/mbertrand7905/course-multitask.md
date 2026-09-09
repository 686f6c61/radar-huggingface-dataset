# mbertrand7905/course-multitask

## Resumen

Este repositorio contiene un prototipo de investigación denominado "Swin T for Multitask", desarrollado por el usuario mbertrand7905. Se trata de un modelo de visión por computador basado en la arquitectura Swin Transformer Tiny (Swin T) a escala "nano", concebido para experimentos de aprendizaje multitarea. El modelo está publicado en Hugging Face con licencia BSD-3-Clause y utiliza el formato de pesos safetensors.

El propósito declarado por el autor es servir como punto de partida experimental y como ejemplo de documentación de formatos de configuración, no como un modelo entrenado para producción. El archivo model.safetensors incluido es un checkpoint de inicialización válido para pruebas de humo, pero no se presentan resultados de benchmarks ni métricas de rendimiento en este repositorio.

La arquitectura incluye atención sparse, fusión por concatenación con MLP, activación GELU tanh y normalización LayerNorm. El modelo tiene 49.600 parámetros totales, lo que lo hace extremadamente ligero. No se especifica una longitud de contexto, al tratarse de un modelo de visión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Swin Transformer Tiny (Swin T) con atención sparse, fusión concat MLP, activación GELU tanh, normalización LayerNorm, escala nano |
| Parámetros totales | 49.600 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de visión, no aplica) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (modelo de visión, no aplica) |
| Licencia | BSD-3-Clause |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo implementa una variante "nano" de Swin Transformer Tiny. Según la documentación del autor, la atención es sparse, la fusión de características se realiza mediante concatenación seguida de un MLP, la activación es GELU tanh y la normalización es LayerNorm. El repositorio incluye un archivo train.py que contiene el modelo y un punto de entrada de entrenamiento o ejemplo ejecutable, así como config.json y training_args.json que registran la configuración de la arquitectura y la receta de experimento por defecto.

La receta de entrenamiento por defecto usa el optimizador LION con un programa de calentamiento lineal (linear warmup). Sin embargo, el README aclara que estos valores son puntos de partida en el script y no evidencia de un entrenamiento completado. El checkpoint model.safetensors es un inicializador de pesos, no un checkpoint entrenado. No se ha realizado ajuste fino con RLHF ni DPO, ni ningún otro tipo de entrenamiento supervisado.

## Capacidades

Ninguna capacidad está verificada, ya que el modelo no ha sido entrenado. A título informativo:

- Generación de texto, razonamiento, código, matemáticas o visión con resultados: no disponible. El checkpoint solo contiene pesos inicializados.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplica, es un modelo de visión.
- Capacidades especiales como modo de pensamiento, visión o audio: no disponibles.

## Casos de uso

Este modelo no es apto para aplicaciones reales o de producción, al no haber sido entrenado. Los escenarios posibles son exclusivamente de desarrollo experimental:

- Validación de instalación: ejecutar python train.py --help permite comprobar que el script y el entorno funcionan.
- Prueba de humo de carga de pesos: cargar model.safetensors con safetensors y PyTorch para verificar compatibilidad de formato.
- Depuración de pipelines de entrenamiento personalizados: el código sirve como plantilla para probar nuevas pérdidas o configuraciones.
- Comparación de arquitecturas en igualdad de condiciones: el README recomienda entrenar todos los baselines con la misma exposición a datos, presupuesto de ajuste y semillas.
- Documentación de formatos de configuración: config.json y training_args.json muestran cómo se estructuran los ajustes de arquitectura y experimento.
- Experimentos de inicialización de pesos: el checkpoint permite estudiar el efecto de distintas inicializaciones antes del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 MB (los 49.600 parámetros en FP32 ocupan aproximadamente 198 KB), por lo que no requiere VRAM dedicada.
- GPU recomendadas: cualquier GPU compatible con PyTorch; también funciona en CPU.
- Compatibilidad con GPU de consumo: sí, cualquier GPU consumer (RTX, GTX, etc.) es suficiente.
- Opciones de despliegue: se puede cargar con PyTorch, safetensors y los módulos del propio train.py. No se documenta integración con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No disponible. Este prototipo tiene solo 49.600 parámetros y no se ha identificado ningún modelo comparable publicado en la misma categoría. Un Swin Transformer Tiny estándar tiene alrededor de 28 millones de parámetros, por lo que la comparación no sería significativa.

## Limitaciones y advertencias

- El checkpoint de inicialización no ha sido entrenado ni auditado para robustez, equidad ni transferencia de dominio.
- El modelo debe considerarse un punto de partida experimental y no debe utilizarse en producción.
- Cualquier resultado de un futuro entrenamiento debe documentarse por separado de los valores por defecto incluidos en este repositorio.
- La licencia BSD-3-Clause permite uso comercial con atribución, pero el modelo no ofrece garantías de rendimiento ni precisión.
- No se han realizado evaluaciones de sesgos; al no estar entrenado, no se conocen sesgos, pero tampoco hay validación de comportamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mbertrand7905/course-multitask
- No se han encontrado otros enlaces relevantes (papers, blogs, demos) en la búsqueda web.
