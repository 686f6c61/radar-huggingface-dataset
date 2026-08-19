# ornith-ai/Ornith-1.5-35B-A3B-MLX

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por el equipo de Ornith AI. Forma parte de la familia Ornith-1.5, que introduce un bucle de auto-mejora de extremo a extremo: el propio modelo genera nuevas tareas de entrenamiento, diseña los andamiajes (scaffolds) necesarios para resolverlas y produce soluciones de prueba, que posteriormente se utilizan para mejorar su política mediante aprendizaje por refuerzo. Este enfoque amplía el marco de auto-scaffolding de Ornith-1.0 y lo convierte en un sistema de mejora continua, sin depender de tareas curadas manualmente.

Con 34 660 millones de parámetros totales y solo unos 3 000 millones de parámetros activos por token, este modelo ofrece un equilibrio notable entre capacidad y eficiencia computacional. Está orientado a tareas de codificación y agentes, y según los datos publicados supera a modelos comparables como Qwen3.6-35B-A3B, Gemma-4-31B y Muse-Glimmer-30B en benchmarks de programación y razonamiento agéntico. La versión MLX disponible en Hugging Face está optimizada para Apple Silicon, lo que facilita su ejecución local en hardware de consumo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en arquitectura Qwen3.5 MoE |
| Parametros totales | 34 660 608 768 (34.66B) |
| Parametros activos | ~3B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura MoE con 34.66B parámetros totales, de los cuales solo se activan aproximadamente 3B por cada token procesado. Esta configuración permite una inferencia eficiente en comparación con un modelo denso del mismo tamaño, manteniendo un alto rendimiento en tareas complejas. La etiqueta `qwen3_5_moe` sugiere que la arquitectura base sigue el diseño de la familia Qwen3.5, aunque no se han publicado detalles adicionales sobre el número de expertos, la topología o la configuración de atención.

El entrenamiento se basa en un bucle de auto-mejora que combina generación de tareas, construcción de scaffolds y optimización de soluciones mediante aprendizaje por refuerzo. El modelo genera continuamente nuevas tareas, descubre estrategias para resolverlas y actualiza su política a partir de las recompensas obtenidas. No se han proporcionado datos sobre la cantidad de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. La innovación principal reside en el entrenamiento autónomo de tareas y scaffolds, que permite al modelo mejorar sin intervención humana constante.

## Capacidades

- Generación de código y edición de código en múltiples lenguajes, con especialización en tareas de desarrollo.
- Razonamiento agéntico: capacidad de planificar y ejecutar pasos múltiples para resolver tareas complejas, como las que se encuentran en SWE-bench y Terminal-Bench.
- Soporte para tool calling y uso de funciones, esencial para integrarse en entornos de desarrollo y agentes autónomos.
- Conversación y generación de texto en inglés, con capacidad para mantener diálogos multi-turno.
- Autonomía en entornos de terminal y línea de comandos, como se demuestra en Terminal-Bench 2.1.
- No se han documentado capacidades de visión ni procesamiento de audio.

## Casos de uso

- **Asistente de programación en tiempo real**: el modelo puede actuar como copiloto en un IDE, generando código, completando funciones y sugiriendo refactorizaciones. Su arquitectura MoE permite una latencia baja, adecuada para uso interactivo.
- **Agente de resolución de tareas en repositorios (SWE-bench)**: puede analizar issues, localizar errores y proponer parches, siendo útil en plataformas de desarrollo colaborativo.
- **Automatización de tareas de terminal**: el modelo puede interpretar comandos, ejecutar scripts y resolver problemas de configuración, como se evalúa en Terminal-Bench.
- **Generación de tests unitarios**: puede crear casos de prueba para validar el comportamiento de funciones y módulos, ahorrando tiempo en el ciclo de desarrollo.
- **Asistente de revisión de código**: integrado en pipelines de CI/CD, puede detectar bugs, vulnerabilidades o malas prácticas en pull requests.
- **Creación de scaffolds para agentes**: el modelo puede generar andamiajes de código para construir agentes de IA, aprovechando su capacidad de auto-mejora para adaptarse a nuevas tareas.

## Benchmarks y rendimiento

La model card del autor presenta resultados en benchmarks de codificación y agentes. A continuación se muestran los valores disponibles para Ornith-1.5-35B-A3B y algunos modelos comparables (los datos provienen de la tabla original; no se han publicado más métricas).

| Benchmark | Ornith-1.5-35B-A3B | Ornith-1.0-35B-A3B | Qwen3.6-35B-A3B | Gemma-4-31B | Muse-Glimmer-30B | Qwen3.5-397B |
|---|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 67.8 | 64.2 | 52.5 | 42.1 | 51.7 | 53.5 |
| Terminal-Bench 2.1 (Claude Code) | 68.5 | 62.8 | 49.2 | - | - | 48.6 |
| SWE-bench Verified | 79 | 75.6 | 73.4 | 52 | 76 | 76.4 |
| SWE-bench Pro | 59.6 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks en la información disponible más allá de los mostrados en la tabla anterior. El modelo también aparece en BenchLM con una puntuación pública de 49.27/100, aunque se trata de una estimación externa.

## Requisitos de hardware

- **VRAM estimada**: no se dispone de datos oficiales. Teniendo en cuenta que el repositorio pesa 69.3 GB en FP16, una cuantización de 4 bits reduciría el peso a aproximadamente 17-18 GB, y 8 bits a unos 35 GB. Para inferencia con MLX en Apple Silicon, se recomienda al menos 32 GB de memoria unificada para una cuantización de 4 bits.
- **GPUs recomendadas**: el modelo está optimizado para Apple Silicon (M1, M2, M3, M4) mediante la librería MLX. No se ha indicado compatibilidad con CUDA, pero es posible convertir los pesos a formatos como GGUF para ejecutarlo en GPUs NVIDIA.
- **Despliegue**: se puede ejecutar con MLX en macOS, y potencialmente con llama.cpp o vLLM si se convierten los pesos. No hay documentación oficial sobre servidores de inferencia.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B | 34.66B | ~3B | no disponible | no disponible | Hugging Face |
| Ornith-1.0-35B-A3B | ~35B | ~3B | no disponible | no disponible | Hugging Face |
| Qwen3.6-35B-A3B | ~35B | ~3B | no disponible | no disponible | no disponible |
| Gemma-4-31B | ~31B | denso | no disponible | no disponible | no disponible |
| Muse-Glimmer-30B | ~30B | denso | no disponible | no disponible | no disponible |

En los benchmarks de codificación, Ornith-1.5-35B-A3B supera claramente a los demás modelos comparados, especialmente en SWE-bench Verified (79 vs 52 de Gemma-4-31B) y en Terminal-Bench (67.8 vs 52.5 de Qwen3.6-35B-A3B). Sin embargo, se carece de información sobre contexto y licencia para una comparación completa.

## Limitaciones y advertencias

- **Sesgos lingüísticos**: el modelo está entrenado exclusivamente en inglés, por lo que puede presentar sesgos culturales y limitaciones en otros idiomas.
- **Riesgo de alucinación**: como cualquier modelo generativo, puede inventar datos o código incorrecto, especialmente en tareas complejas sin contexto suficiente.
- **Limitaciones de contexto**: no se especifica la longitud máxima de contexto; es probable que sea similar a otros modelos de la familia Qwen (típicamente 32K o 128K), pero no se confirma.
- **Licencia**: no se indica la licencia, por lo que su uso comercial está incierto. Se debe contactar con el autor para aclarar.
- **Advertencias de producción**: el modelo es de investigación y no ha sido evaluado para entornos de producción a gran escala. Se recomienda validar su salida en aplicaciones críticas.

## Enlaces

- [Hugging Face - Ornith-1.5-35B-A3B-MLX](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-MLX)
- [Colección de modelos Ornith-1.5](https://huggingface.co/collections/ornith-ai/ornith-15)
- [Blog oficial - Ornith-1.5: From Self-Scaffolding to Self-Improvement](https://ornith.ai/ornith_1_5.html)
- [BenchLM - perfil del modelo](https://benchlm.ai/models/ornith-1-5-35b-a3b)
- [Guía de Ornith AI para modelos de codificación agéntica](https://ornith.online/)
