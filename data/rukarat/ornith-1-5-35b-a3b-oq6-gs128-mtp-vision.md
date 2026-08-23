# RukaRat/Ornith-1.5-35B-A3B-oQ6-gs128-mtp-vision

## Resumen

Ornith-1.5-35B-A3B-oQ6-gs128-mtp-vision es una cuantización de 6 bits del modelo de razonamiento multimodal Ornith-1.5-35B-A3B, publicada por RukaRat y diseñada para ejecutarse en Apple Silicon mediante el runtime oMLX. El modelo base, desarrollado por Ornith AI, es una arquitectura MoE de 35.000 millones de parámetros totales con 3.000 millones activos por token, y esta variante cuantizada ocupa 30 GB (aproximadamente 6,87 bits por peso) con un group size de 128, que reduce la sobrecarga de los kernels de dequantización frente a los group sizes de 64 habituales. La cuantización parte del checkpoint de shisa-ai/Ornith-1.5-35B-A3B-MTP, que corrige la cabeza MTP (Multi-Token Prediction) del modelo original, la cual era inerte y no aportaba ninguna aceleración.

La relevancia de esta build radica en que resuelve dos problemas detectados en otras cuantizaciones de Ornith: la cabeza MTP original no funciona (la decodificación especulativa no produce ninguna ganancia) y el uso de group_size 64 penaliza el rendimiento en torno a un 9% por el doble de arrays de escala y sesgo. Este modelo, con la cabeza corregida y group_size 128, alcanza una tasa de aceptación del 78-84% en MTP y una velocidad de decodización comparable a la de Qwen3.6-35B-A3B cuantizado, con una fiabilidad superior en tool calling (6/6 frente a 2/6 en una prueba específica). Además, conserva la torre de visión completa, lo que lo convierte en un modelo multimodal útil para tareas de imagen y texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) basada en Qwen3.5 MoE, con torre de visión y cabeza MTP |
| Parámetros totales | 35B (MoE) |
| Parámetros activos | 3B |
| Longitud de contexto | 256k (según la versión DGX Spark; no se confirma en la model card) |
| Tipos de cuantización | oQ6 (6-bit affine, group size 128) |
| Idiomas soportados | No disponible (probablemente multilingüe, basado en Qwen) |
| Licencia | MIT |
| Formato de pesos | safetensors (cuantizados con oMLX oQ) |

Nota: el archivo safetensors cuantizado contiene 7.815.406.512 parámetros, pero el modelo conceptual tiene 35B parámetros totales; la cuantización reduce el tamaño de los tensores pero no el número de parámetros del modelo.

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un MoE de razonamiento que activa aproximadamente 3B parámetros por token. Fue desarrollado por Ornith AI sobre el marco de "self-scaffolding" de la versión 1.0, extendido hacia un bucle de auto-mejora: el modelo propone nuevas tareas, genera scaffolds específicos y produce rollouts para aprendizaje por refuerzo. No se dispone de datos detallados sobre el dataset de entrenamiento ni sobre el número de tokens, pero se sabe que está optimizado para razonamiento complejo, codificación y flujos de trabajo con herramientas.

La cuantización parte de shisa-ai/Ornith-1.5-35B-A3B-MTP, que sustituye la cabeza MTP original (ineficaz) por una inicializada con Qwen3.6 y entrenada mediante destilación KL de vocabulario completo. La cuantización se realiza con oMLX oQ, un método de cuantización affine de 6 bits con group size 128, preservando la torre de visión (333 tensores) y la cabeza MTP (42 tensores). El resultado es un modelo con una tasa de aceptación de MTP de 78-84% y ~2,1 tokens por ciclo de decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento complejo, con soporte para agentes y multi-step reasoning.
- Tool calling y function calling, con alta fiabilidad en la selección de herramientas y argumentos tipados (validado 6/6 en un prompt multi-tool).
- Capacidades multimodales: acepta imágenes como entrada y genera texto (image-text-to-text).
- Decodificación especulativa MTP: acelera la generación ~10% respecto al modelo sin MTP, con 78-84% de aceptación.
- Instrucción-following correcto (finalización con `finish=stop` en restricciones simples).
- Multilingüe probable (basado en Qwen3.5, aunque no se especifica).

## Casos de uso

- **Asistente de codificación en tiempo real**: el modelo puede integrarse en editores o IDEs vía oMLX para sugerir código con baja latencia, gracias a la decodificación especulativa que reduce el tiempo por token.
- **Automatización de herramientas técnicas**: su capacidad de tool calling y razonamiento multi-step permite ejecutar consultas a APIs, bases de datos o scripts, seleccionando la herramienta correcta y generando argumentos tipados.
- **Análisis de capturas y diagramas**: al ser multimodal, puede recibir imágenes (diagramas, capturas de pantalla, fotos) y generar explicaciones, resúmenes o instrucciones de acción.
- **Atención al cliente automatizada**: con contexto de hasta 256k tokens, puede gestionar conversaciones multi-turno, mantener el contexto largo y seleccionar herramientas para resolver incidencias (consultas de pedidos, reembolsos, etc.).
- **Generación de documentación técnica**: puede analizar código, especificaciones o documentos y generar documentación detallada, aprovechando su razonamiento y contexto largo.
- **Investigación en auto-mejora**: al ser un modelo con mecanismo de auto-scaffolding, puede usarse para experimentos de aprendizaje por refuerzo, generación de datos sintéticos y evaluación de mejoras de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye mediciones de velocidad y tasa de aceptación de MTP, pero no evalúa la calidad del modelo en tareas académicas. Se recomienda consultar el modelo base original para posibles benchmarks.

## Requisitos de hardware

- **VRAM**: 30,1 GB de peso; se recomienda al menos 32 GB de memoria unificada, aunque para un contexto largo se sugiere 64 GB.
- **GPU**: diseñado para Apple Silicon (M2, M3, M4, etc.) con GPU integrada; no requiere GPU externa.
- **Sistema**: macOS 26.6 o superior, con el runtime oMLX (versión 0.6.2 probada).
- **Despliegue**: oMLX es el único runtime verificado; requiere activar manualmente la MTP mediante un archivo de configuración (`~/.omlx/model_settings.json`).
- **Latencia**: en un M2 Max 64 GB, se midió ~72-80 tokens/s con MTP activo, y una degradación de ~20% en sesiones largas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|--------|------------|----------|----------|-------|
| Ornith-1.5-35B-A3B (original) | 35B MoE | 256k | MIT | MTP inerte, sin cuantización |
| Qwen3.6-35B-A3B (oQ6) | 35B MoE | no disponible | Apache 2.0 | MTP activo, pero tool calling menos fiable (2/6) |
| Ornith-1.5-35B-A3B-oQ6e-fixed-mtp (pyros-vault) | 35B MoE | 256k | MIT | Mismo head corregido, pero group_size 64, ~9% más lento |

## Limitaciones y advertencias

- **Entorno de prueba limitado**: medido en un solo equipo (M2 Max 64 GB) con oMLX 0.6.2; no verificado en otros Apple Silicon ni runtimes.
- **Ruido y degradación**: el equipo muestra ±3% de ruido a corto plazo y una degradación de ~20% en throughput durante ~30 minutos de carga continua; las comparaciones son pares e intercaladas.
- **MTP adaptativo**: el controlador de profundidad tarda en activarse; generaciones ≤128 tokens obtienen ~10% menos beneficio que las largas.
- **Calidad no evaluada**: no se realizaron pruebas de perplejidad ni benchmarks estándar; no se puede afirmar la calidad relativa frente a cuantizaciones de mayor bit.
- **Activación manual**: la MTP está desactivada por defecto y requiere configuración explícita; si se activa junto con `vlm_mtp_enabled`, el archivo de configuración puede fallar silenciosamente.
- **Licencia**: MIT permite uso comercial, pero se debe verificar la licencia del modelo base y sus componentes (la cabeza MTP corregida de shisa-ai).
- **Pérdida de precisión**: como cuantización de 6 bits, puede haber degradación en tareas numéricas o de razonamiento complejo frente al modelo sin cuantizar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RukaRat/Ornith-1.5-35B-A3B-oQ6-gs128-mtp-vision
- Modelo base original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Modelo base con MTP corregido: https://huggingface.co/shisa-ai/Ornith-1.5-35B-A3B-MTP
- Blog de Ornith sobre Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Repositorio oMLX: https://github.com/jundot/omlx
- Variante DGX Spark (para referencia): https://github.com/MiaAI-Lab/Ornith-1.5-35B-A3B-DGX-Spark
