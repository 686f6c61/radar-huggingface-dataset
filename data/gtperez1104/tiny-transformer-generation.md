# Gtperez1104/tiny-transformer-generation

## Resumen

Este repositorio contiene una implementación funcional de un Transformer en miniatura orientado a generación de texto, desarrollado por el usuario Gtperez1104. El modelo emplea una configuración "base" con atención lineal, fusión tipo Tucker, activación GELU aproximada y normalización GroupNorm, lo que lo aleja de la arquitectura estándar de Transformer para explorar alternativas más eficientes. Con solo 16.576 parámetros, es un modelo extremadamente pequeño, diseñado como punto de partida experimental y para pruebas de humo, no como un modelo entrenado para producción.

La relevancia de este proyecto reside en su valor pedagógico y de investigación: permite estudiar el comportamiento de arquitecturas alternativas (atención lineal, fusión Tucker) en un entorno mínimo y reproducible. El autor declara explícitamente que el checkpoint incluido es una inicialización válida, no un modelo entrenado, y que no se reivindica ningún resultado de benchmarks. Es, por tanto, una herramienta para experimentación y aprendizaje, no un modelo listo para uso práctico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tiny Transformer (configuracion base) |
| Parametros totales | 16.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, fp32 presumiblemente) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un Transformer en miniatura con varias desviaciones del diseño convencional. En lugar de atención multi-cabeza estándar, emplea **atención lineal**, que reduce la complejidad computacional de O(n²) a O(n) en la longitud de secuencia. La fusión de características se realiza mediante **fusión Tucker**, una técnica de descomposición tensorial que comprime las interacciones entre dimensiones. La activación es **GELU aproximada** y la normalización se hace con **GroupNorm**, en lugar de LayerNorm, lo que puede facilitar el entrenamiento con lotes pequeños.

El autor no proporciona detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. El repositorio incluye un `training_args.json` con una receta por defecto que usa el optimizador **Novograd** con un programa de calentamiento constante, pero el propio autor aclara que son valores iniciales del script, no evidencia de una ejecución completada. El checkpoint `model.safetensors` es una inicialización válida para pruebas de humo, no un modelo entrenado.

## Capacidades

- Generación de texto básica: el modelo puede generar secuencias de texto, pero sin entrenamiento previo, la salida será esencialmente aleatoria.
- Arquitectura experimental: implementa atención lineal y fusión Tucker, lo que permite estudiar estas técnicas en un entorno mínimo.
- Código transparente: el repositorio incluye `pipeline.py` con un ejemplo ejecutable y pruebas de humo reproducibles.
- Reproducibilidad: el autor proporciona guías para una evaluación significativa (conjunto de validación específico, tres semillas, línea base de capacidad equivalente).
- No tiene capacidades de tool calling, agentes, visión, audio ni razonamiento multi-paso, dado su tamaño y estado no entrenado.

## Casos de uso

- **Educación y aprendizaje de arquitecturas Transformer**: el código es legible y mínimo, ideal para que estudiantes e investigadores comprendan cómo funciona un Transformer por dentro, especialmente las variantes con atención lineal y fusión Tucker.
- **Prototipado de investigación**: sirve como banco de pruebas para experimentar con configuraciones alternativas (normalización, activación, fusión) antes de escalar a modelos mayores.
- **Pruebas de humo en pipelines de ML**: el checkpoint de inicialización permite verificar que un pipeline de entrenamiento o inferencia funciona correctamente de extremo a extremo, sin esperar resultados de calidad.
- **Estudio de eficiencia computacional**: al ser tan pequeño, permite medir el coste de la atención lineal frente a la atención estándar en un entorno controlado y con recursos mínimos.
- **Desarrollo de adaptadores para carga personalizada**: al ser una implementación a medida, obliga a escribir un adaptador explícito para APIs genéricas, lo que resulta útil para aprender a integrar modelos no estándar.
- **Comparación de optimizadores**: la receta por defecto usa Novograd; se puede usar para comparar su comportamiento con AdamW u otros optimizadores en un modelo diminuto y de entrenamiento rápido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que no se reivindica ningún resultado y que el checkpoint no está entrenado. Cualquier evaluación debe realizarse tras un entrenamiento adecuado y con una línea base de capacidad equivalente.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB, incluso en fp32. Con 16.576 parámetros, el modelo cabe en cualquier GPU moderna e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, GTX 1050 Ti, RTX 2060, integradas). También ejecutable en CPU.
- Cabe en consumer GPU: sí, en todas las GPU de consumo actuales y en muchas integradas.
- Opciones de despliegue: al ser una implementación personalizada, no es compatible directamente con vLLM, llama.cpp, Ollama o TGI. Requiere un adaptador explícito o ejecutar el script `pipeline.py` directamente.
- Latencia y throughput: no disponibles, pero dada la escala del modelo, la inferencia es prácticamente instantánea en cualquier hardware moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Estado |
|---|---|---|---|---|---|
| Gtperez1104/tiny-transformer-generation | 16.576 | no disponible | Transformer lineal + Tucker | Apache 2.0 | Inicialización, no entrenado |
| nanoGPT (Karpathy) | ~10M (config. mini) | 1024 | Transformer estándar | MIT | Entrenado (ejemplos) |
| TinyStories (modelos ~1-30M) | 1M-30M | 512-1024 | Transformer estándar | Apache 2.0 | Entrenado |

La comparación es limitada porque este modelo no está entrenado. Frente a nanoGPT o TinyStories, que son modelos funcionales, este repositorio ofrece una implementación alternativa con atención lineal y fusión Tucker, pero sin resultados prácticos. Su valor es puramente experimental y educativo.

## Limitaciones y advertencias

- El checkpoint incluido **no está entrenado**: es una inicialización aleatoria válida solo para pruebas de humo. No debe usarse para ninguna tarea real de generación.
- No se ha auditado el modelo para robustez, equidad ni transferencia de dominio, como advierte el propio autor.
- Riesgo de alucinación: irrelevante en este estado, pero si se entrena, el riesgo será el habitual en modelos pequeños.
- La implementación es personalizada: las APIs genéricas de HuggingFace no cargarán el modelo sin un adaptador explícito.
- No hay datos sobre idiomas soportados, longitud de contexto ni rendimiento.
- La licencia Apache 2.0 permite uso comercial, pero el autor recomienda revisar los términos de los datos externos si se usan para entrenar.
- Cualquier resultado futuro de un checkpoint entrenado debe documentarse por separado de los valores por defecto del repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Gtperez1104/tiny-transformer-generation
- Implementación de referencia Tiny Transformer (avvorstenbosch): https://github.com/avvorstenbosch/tinyTransformer
- Tiny Transformer educativo (skolouri): https://github.com/skolouri/TinyTransformer
- Tutorial de Tiny Transformer desde cero: https://buildml.substack.com/p/building-a-tiny-transformer-from
- Artículo sobre implementación FPGA de Tiny Transformer: https://arxiv.org/abs/2401.02721
- TinyFormer (transformers para dispositivos diminutos): https://arxiv.org/abs/2311.01759
