# philipjohnbasile/ornith-ai-Ornith-1.5-35B-A3B-MTPLX

## Resumen

El modelo `philipjohnbasile/ornith-ai-Ornith-1.5-35B-A3B-MTPLX` es una conversión del modelo de código agéntico `Ornith-1.5-35B-A3B` de la organización Ornith AI, adaptado para ejecutarse en Apple Silicon mediante el runtime MTPLX (multi-token prediction) y el framework MLX. El modelo original, desarrollado por Ornith AI, forma parte de la familia Ornith-1.5, que incluye variantes de 9B, 35B y 397B parámetros, y se caracteriza por su enfoque en *self-scaffolding* y *self-improvement*: el propio modelo propone nuevas tareas, genera andamiajes específicos para cada una y produce soluciones para el aprendizaje por refuerzo.

La versión MTPLX está forjada con la herramienta MTPLX Forge y añade una capa de predicción multi-token que, según la verificación realizada por el autor, logra un multiplicador de 1,46 veces respecto a la línea base autoregresiva. El nombre del modelo indica una arquitectura MoE de 35B parámetros totales con 3B activos, aunque el conteo de pesos en safetensors registra 5.865.901.936 parámetros, lo que sugiere una posible discrepancia que debe tenerse en cuenta.

Este modelo resulta relevante para desarrolladores e investigadores que trabajan con Apple Silicon y desean experimentar con predicción multi-token en modelos de código, aprovechando el ecosistema MLX. La falta de licencia clara y de documentación oficial sobre el modelo original limita su uso en producción, pero lo convierte en una opción interesante para evaluación técnica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (según tag `qwen3_5_moe`) |
| Parametros totales | 5.865.901.936 según safetensors (el nombre sugiere 35B totales) |
| Parametros activos | 3B (según nombre "A3B", no verificado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (según tags) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (referencia a archivo LICENSE en el repo) |
| Formato de pesos | safetensors (compatible con MLX) |

## Arquitectura y entrenamiento

El modelo base `Ornith-1.5-35B-A3B` utiliza una arquitectura de mezcla de expertos (MoE) con 35B parámetros totales y 3B activos, probablemente derivada de la arquitectura Qwen3.5-MoE, según el tag `qwen3_5_moe`. El entrenamiento se enmarca en el paradigma de *self-scaffolding* y *self-improvement* de Ornith-1.5: el modelo propone sus propias tareas, genera andamios de código específicos y produce soluciones que se utilizan para el aprendizaje por refuerzo, creando un bucle continuo de mejora.

La versión MTPLX no altera los pesos del modelo, sino que añade un mecanismo de predicción multi-token (MTP) sobre la arquitectura original. Este mecanismo permite predecir varios tokens a la vez en lugar de uno solo, mejorando la velocidad de inferencia. Según la verificación del autor, el multiplicador de velocidad es de 1,46× respecto a una línea base autoregresiva, medido en un Apple M5 Max con sampler de temperatura 0.6, top_p 0.95 y top_k 20.

## Capacidades

- Generación de código con enfoque agéntico: el modelo puede proponer y resolver tareas de programación de forma autónoma.
- Self-scaffolding: capacidad de generar estructuras de código (scaffolds) específicas para cada tarea.
- Self-improvement: el modelo participa en un bucle de mejora continua mediante aprendizaje por refuerzo.
- Multi-token prediction (MTP) en el runtime MTPLX, lo que acelera la inferencia.
- Optimizado para Apple Silicon (MLX): funciona en dispositivos con chip M-series.
- Soporte de razonamiento multi-paso y planificación de tareas de código (implícito en la metodología self-scaffolding).

## Casos de uso

- **Asistente de programación local en Apple Silicon**: gracias a la optimización MLX y al MTP, el modelo puede ejecutarse en portátiles M-series para sugerir código de forma rápida, sin depender de la nube.
- **Agente de codificación autónomo**: el modelo puede proponer una tarea, generar el andamiaje de código, implementar la solución y ejecutarla, lo que lo convierte en candidato para sistemas de generación de software automatizada.
- **Automatización de refactorización de código**: su capacidad de self-scaffolding permite crear scripts que analizan y refactorizan proyectos existentes, generando nuevas versiones de funciones o clases.
- **Experimentación con multi-token prediction**: los investigadores pueden estudiar el impacto del MTP en la latencia y la calidad de la generación en comparación con modelos autoregresivos tradicionales.
- **Entrenamiento por refuerzo aplicado a código**: el modelo puede utilizarse como generador de soluciones en pipelines de RL para mejorar otros modelos de código.
- **Prototipado rápido de herramientas de IA**: su formato MLX y su tamaño moderado (5,8B parámetros en safetensors) permiten integrarlo en prototipos de herramientas de desarrollo que se ejecutan en equipos Mac sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento es la verificación del runtime MTPLX:

| Métrica | Valor |
|---|---|
| Multiplicador vs línea base autoregresiva | 1.46× |
| Profundidad óptima (depth) | D1 |
| Dispositivo de verificación | Apple M5 Max |
| Sampler | temperatura 0.6 · top_p 0.95 · top_k 20 |

## Requisitos de hardware

- Requiere hardware Apple Silicon (chip M-series). El modelo fue verificado en un M5 Max, pero es probable que funcione en M1/M2/M3/M4 con suficiente memoria unificada.
- La memoria RAM unificada necesaria no está especificada; el repositorio ocupa 22.1 GB, lo que sugiere que el modelo debe cargarse en memoria (con cuantización 4-bit el peso podría reducirse, pero no se confirma).
- Es necesario instalar el runtime MTPLX (`mtplx`) y el framework MLX para ejecutar el modelo.
- No es compatible con GPU NVIDIA o AMD; está limitado al ecosistema Apple.
- La latencia y el throughput no se han publicado; el multiplicador de 1.46× sugiere una mejora significativa respecto a la generación autoregresiva en el mismo hardware.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos similares en la misma categoría (MoE de código agéntico). La familia Ornith-1.5 incluye variantes de 9B, 35B y 397B, pero no hay datos públicos de rendimiento comparativo. El modelo original `ornith-ai/Ornith-1.5-35B-A3B` es el equivalente sin MTP, pero no se han publicado benchmarks comparativos.

## Limitaciones y advertencias

- **Licencia no confirmada**: la página de Hugging Face no muestra licencia y la model card solo indica "See LICENSE". No se puede garantizar el uso comercial sin revisar el archivo de licencia.
- **Modelo no oficial**: es una conversión realizada por un tercero (philipjohnbasile), no por Ornith AI. Puede haber errores en la conversión o falta de soporte.
- **Discrepancia en el número de parámetros**: el nombre sugiere 35B totales, pero safetensors registra 5.8B. Esta inconsistencia puede indicar que la conversión no incluye todos los pesos del modelo original, o que el conteo es incorrecto.
- **Dependencia de Apple Silicon**: el modelo solo funciona en hardware Apple con MLX, lo que limita su uso en entornos de servidor con GPU NVIDIA.
- **Riesgo de alucinación**: como modelo de código, puede generar código sintácticamente válido pero incorrecto o inseguro, especialmente en tareas complejas.
- **Sin garantías de producción**: al ser un modelo experimental con 0 descargas y 0 likes, no hay evidencia de su robustez en entornos reales.
- **Idiomas no especificados**: no se indica qué idiomas soporta, aunque probablemente esté entrenado principalmente en inglés para código.

## Enlaces

- [Hugging Face: philipjohnbasile/ornith-ai-Ornith-1.5-35B-A3B-MTPLX](https://huggingface.co/philipjohnbasile/ornith-ai-Ornith-1.5-35B-A3B-MTPLX)
- [Hugging Face - ornith-ai/Ornith-1.5-35B-A3B (modelo original)](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B)
- [Ornith AI - organización en Hugging Face](https://huggingface.co/ornith-ai)
- [Ornith AI - web oficial](https://ornith.ai/)
- [Ornith AI - guía de modelos de codificación](https://ornith.online/)
- [Ornith-1.5: From Self-Scaffolding to Self-Improvement](https://ornith.ai/ornith_1_5.html)
- [MTPLX Forge (herramienta de conversión)](https://github.com/youssofal/MTPLX)
