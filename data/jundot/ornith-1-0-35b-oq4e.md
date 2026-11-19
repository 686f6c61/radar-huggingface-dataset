# Jundot/Ornith-1.0-35B-oQ4e

## Resumen

Ornith-1.0-35B-oQ4e es una cuantización de precisión mixta en 4 bits del modelo Ornith-1.0-35B, publicada por el usuario Jundot bajo el identificador Jundot/Ornith-1.0-35B-oQ4e. El modelo base pertenece a la familia qwen3_5_moe, según la etiqueta de arquitectura que acompaña a los pesos, y cuenta con 35.107.181.936 parámetros totales según los safetensors del repositorio. La versión distribuida aquí está pensada para ejecutarse con MLX, el framework de Apple para inferencia en silicio de la compañía, y emplea el formato de cuantización propietario oQ (oMLX) en su variante oQe.

El problema que resuelve esta publicación es práctico: permitir ejecutar un modelo de aproximadamente 35.000 millones de parámetros en hardware con memoria unificada limitada, reduciendo el peso del repositorio a 42,8 GB mediante cuantización de 4 bits con tamaño de grupo 64. La model card indica que la revisión del 19 de noviembre de 2026 se regeneró con el redondeo oQe refinado de oMLX 0.8.0, que según el autor reduce el error de cuantización manteniendo tamaño y velocidad.

La relevancia actual del modelo radica en su orientación a despliegue local en equipos Apple Silicon, un nicho en el que las alternativas GGUF no siempre están optimizadas. No obstante, la información pública disponible es muy escasa: no se detallan idiomas, licencia, contexto ni datos de entrenamiento del modelo base, por lo que esta ficha se limita a lo verificable en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (etiqueta del repositorio; detalles internos no disponibles) |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, grupo 64, formato oQ/oQe (MLX safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (42,8 GB en repositorio) |

## Arquitectura y entrenamiento

La etiqueta de arquitectura del repositorio es qwen3_5_moe, lo que sugiere una arquitectura transformer con mezcla de expertos (MoE) heredada de la familia Qwen 3.5. Sin embargo, no se proporciona información sobre el número de expertos, la proporción de parámetros activos por token, la dimensión oculta, el número de capas ni el mecanismo de atención empleado. Tampoco se documenta la longitud de contexto nativa del modelo base.

Respecto al entrenamiento, la información disponible no incluye el número de tokens, la composición del dataset, ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación. Lo único documentado es el proceso de cuantización: se aplicó oQ (oMLX v0.8.0), una cuantización de precisión mixta con 4 bits y tamaño de grupo 64, usando el redondeo oQe refinado introducido en las pull requests jundot/omlx#4930 y #5292. El autor afirma que esta revisión reduce el error de cuantización respecto a versiones anteriores sin alterar el tamaño ni la velocidad de inferencia.

## Capacidades

- Generación de texto y razonamiento: capacidades heredadas del modelo base qwen3_5_moe, si bien no se documentan evaluaciones específicas.
- Código y matemáticas: presumiblemente soportadas por la familia Qwen, aunque no hay confirmación en la model card.
- Tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se listan idiomas en la ficha.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el formato MLX safetensors y la cuantización 4 bits permiten cargar el modelo en equipos con memoria unificada amplia (64 GB o más), algo relevante para desarrolladores que quieren probar un modelo de 35B sin GPU dedicada.
- Prototipado de asistentes conversacionales: al ejecutarse localmente, facilita iterar sobre prompts y flujos de diálogo sin depender de APIs externas ni enviar datos a terceros.
- Evaluación comparativa de cuantizaciones: útil para investigadores que quieran medir la degradación de calidad del esquema oQe frente a otras cuantizaciones (GGUF Q4, AWQ, etc.) sobre el mismo modelo base.
- Desarrollo de aplicaciones offline: escenarios con requisitos de privacidad o conectividad limitada donde se necesita un modelo de gran tamaño ejecutándose en el dispositivo.
- Fine-tuning ligero y experimentación: el formato safetensors permite inspeccionar y manipular pesos con herramientas del ecosistema MLX.
- Pruebas de integración con oMLX: sirve como referencia para validar el pipeline de cuantización oQ en versiones concretas del framework.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 42,8 GB en 4 bits; se recomienda al menos 48 GB de memoria unificada para cargar el modelo con margen para el contexto y el runtime.
- GPU recomendadas: hardware Apple Silicon con memoria unificada amplia (M2 Ultra, M3 Ultra, M4 Max con 64 GB o más). No está pensado para GPUs NVIDIA/AMD por el formato MLX.
- GPU de consumo: no cabe en GPUs de consumo con 8-24 GB de VRAM; en Apple Silicon, los modelos con 64 GB o más son el mínimo práctico.
- Opciones de despliegue: MLX y oMLX (versión 0.8.0 o superior para el redondeo oQe). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.0-35B-oQ4e | 35,1B | no disponible | 4 bits, grupo 64 (oQe) | no disponible | MLX safetensors |
| Modelo base Ornith-1.0-35B | no disponible | no disponible | sin cuantizar | no disponible | no disponible |
| Alternativas GGUF de la familia Qwen 3.5 MoE | no disponible | no disponible | 4 bits (Q4_K_M, etc.) | no disponible | GGUF |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- La cuantización a 4 bits introduce degradación respecto al modelo original; el autor indica que la revisión oQe reduce el error, pero no cuantifica la pérdida.
- No se especifica la licencia del modelo base ni de esta cuantización, por lo que no se puede confirmar el uso comercial.
- No se documentan los idiomas soportados, lo que impide garantizar un rendimiento adecuado en castellano u otras lenguas.
- Se desconoce la longitud de contexto efectiva, lo que limita el diseño de aplicaciones que dependan de ventanas largas.
- Riesgo de alucinación inherente a los modelos de lenguaje; no hay evaluaciones publicadas que lo cuantifiquen.
- El formato MLX restringe el despliegue a hardware Apple; no es portable a GPUs NVIDIA o AMD sin reconversión.
- La model card advierte de que versiones anteriores del repositorio contenían un redondeo oQe menos refinado; es necesario descargar la revisión del 19 de noviembre de 2026.
- Solo 4 likes y una documentación mínima sugieren poca validación comunitaria del artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Jundot/Ornith-1.0-35B-oQ4e
- Proyecto oMLX: https://github.com/jundot/omlx
- Pull request de oQe: https://github.com/jundot/omlx/pull/4930
- Pull request de refinamiento del redondeo oQe: https://github.com/jundot/omlx/pull/5292
