# Duckets/Nanbeige4.3-33B-MLX-4bit

## Resumen

Nanbeige4.3-33B-MLX-4bit es una cuantización a 4 bits en formato MLX del modelo Nanbeige4.3-33B, publicado por el usuario Duckets en Hugging Face. El modelo base fue desarrollado por el equipo Nanbeige y se trata de un modelo denso de 33 mil millones de parámetros con arquitectura Llama y una ventana de contexto de 512K tokens. La conversión se realizó con mlx-lm para su ejecución nativa en Apple Silicon, sin modificar los pesos originales más allá de la cuantización afín de 4 bits.

El modelo base está orientado a trabajo de código agéntico y razonamiento ("thinking model"), con soporte de tool calling en formato XML y pensamiento extendido preservable en flujos multi-paso. Nanbeige4.3 destaca en benchmarks agénticos de terminal y de ingeniería de software según los datos publicados por el propio equipo de desarrollo, superando a Qwen3.8-27B en la mayoría de las pruebas comparadas.

Esta versión cuantizada es especialmente relevante para usuarios de Mac con chips de serie M, ya que permite ejecutar localmente un modelo de 33B con contexto masivo en equipos con memoria unificada suficiente, sin depender de GPUs de servidor. Se distribuye bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Llama (transformer denso) |
| Parámetros totales | 33.118.977.024 (33B) |
| Parametros activos | no disponible (modelo denso: todos los parámetros activos) |
| Longitud de contexto | 512K tokens |
| Tipos de cuantización | MLX afín, 4 bits (4,5 bpw efectivos, group size 64) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX, 4 shards, ~18,6 GB) |

## Arquitectura y entrenamiento

Nanbeige4.3-33B emplea una arquitectura transformer densa estilo Llama, es decir, todos los parámetros participan en cada pasada de inferencia, a diferencia de los modelos MoE. Según la model card del repositorio cuantizado, se trata de un "thinking model" ajustado para tareas de código agéntico, con capacidad de generar trazas de razonamiento antes de la respuesta final.

No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni los métodos de alineación (RLHF, DPO) en la información disponible. La model card recomienda usar `tool_call_format="xml"` y mantener el thinking activado con `preserve_thinking` para trabajo agéntico. El modelo no incorpora aceleraciones tipo Splash/DFlash, lo que afecta a la velocidad de generación en Apple Silicon.

## Capacidades

- Generación de texto conversacional (pipeline text-generation)
- Razonamiento con modo thinking: genera trazas de razonamiento explícitas antes de responder
- Código: optimizado para tareas de ingeniería de software y programación
- Trabajo agéntico: soporte de tool calling en formato XML y razonamiento multi-paso
- Contexto ultra-largo: 512K tokens de ventana, adecuado para bases de código grandes y documentos extensos
- Ejecución local en Apple Silicon mediante MLX

## Casos de uso

- Agentes de terminal automatizados: el modelo destaca en Terminal-Bench 2.1 (80,9 según datos del fabricante), lo que lo hace adecuado para agentes que ejecutan comandos de shell, navegan sistemas de ficheros y resuelven tareas de sysadmin de forma autónoma.
- Resolución de issues en repositorios reales: con puntuaciones altas en DeepSWE (65,5) y SWE-Bench Pro (60,3), puede integrarse en pipelines que tomen un issue de GitHub, exploren el código y propongan un parche.
- Refactorización de bases de código grandes: la ventana de 512K tokens permite cargar módulos completos o repositorios medianos en contexto para refactorizaciones coherentes en múltiples ficheros.
- Asistente de código local y privado: ejecución totalmente local en Mac Studio o MacBook con memoria suficiente, útil para equipos que no pueden enviar código propietario a APIs externas.
- Razonamiento sobre problemas técnicos complejos: el modo thinking con preserve_thinking permite encadenar pasos de razonamiento en flujos agénticos de múltiples etapas.
- Revisión y análisis de documentación extensa: el contexto largo permite resumir, cuestionar y auditar documentos técnicos de cientos de miles de tokens.
- Prototipado de agentes con tool calling: el formato XML de llamadas a herramientas facilita la integración con frameworks de agentes personalizados.

## Benchmarks y rendimiento

Datos publicados por el fabricante en la model card del modelo base (mismo harness, ejecutados por el propio equipo Nanbeige; no verificados de forma independiente):

| Benchmark | Nanbeige4.3-33B | Qwen3.8-27B |
|---|---|---|
| Terminal-Bench 2.1 | **80,9** | 73,0 |
| DeepSWE | **65,5** | 42,5 |
| Automation Bench | **54,2** | 38,3 |
| SWE-Bench Pro | 60,3 | **61,7** |
| GPQA Diamond | 89,5 | — |

Nota: estos resultados corresponden al modelo base en precisión completa; la versión cuantizada a 4 bits puede mostrar ligeras degradaciones no documentadas.

## Requisitos de hardware

- Memoria estimada para inferencia: ~18,8 GB de pico de memoria en la versión 4-bit MLX, verificada en un Mac de serie M.
- Requisito práctico: Mac Apple Silicon con al menos 24 GB de memoria unificada (32 GB recomendados para margen con contexto largo).
- No requiere GPU discreta: está diseñado para ejecutarse en CPU/GPU integrada de Apple Silicon mediante MLX.
- Consumer hardware: cabe en Mac Studio, Mac mini Pro y MacBook Pro con 32 GB o más de memoria unificada. No es adecuado para GPUs NVIDIA en este formato (habría que usar el modelo base en FP16/BF16, que requiere ~66 GB de VRAM, o una cuantización GGUF).
- Despliegue: mlx-lm (`python -m mlx_lm.generate`), LM Studio 0.4.26 (verificado por el autor del repo), o `lms get Duckets/Nanbeige4.3-33B-MLX-4bit`.
- Rendimiento: ~30 tok/s de generación medida en un Mac de serie M durante las pruebas del autor. Al ser un modelo denso de 33B sin aceleraciones tipo Splash/DFlash, es notablemente más lento que modelos MoE de tamaño similar en Apple Silicon.

## Comparativa con modelos similares

| Característica | Nanbeige4.3-33B (MLX 4bit) | Qwen3.8-27B | Nanbeige4.3-33B (base) |
|---|---|---|---|
| Parámetros | 33B (denso) | 27B | 33B (denso) |
| Contexto | 512K | no disponible | 512K |
| Terminal-Bench 2.1 | 80,9* | 73,0* | 80,9 |
| DeepSWE | 65,5* | 42,5* | 65,5 |
| SWE-Bench Pro | 60,3* | 61,7* | 60,3 |
| Licencia | Apache-2.0 | no disponible | Apache-2.0 |
| Formato | MLX 4-bit | no disponible | safetensors (BF16) |
| Plataforma objetivo | Apple Silicon | no disponible | multiplataforma |

(*) Datos del modelo base; la versión cuantizada no tiene benchmarks propios publicados.

## Limitaciones y advertencias

- Rendimiento en Apple Silicon: al ser un modelo denso de 33B sin aceleraciones específicas, genera más lentamente que modelos MoE de tamaño comparable; hay que esperar velocidades en el rango de decenas de tokens por segundo.
- Los benchmarks son reportados por el propio fabricante con el mismo harness, sin verificación independiente; SWE-Bench Pro es el único donde Qwen3.8-27B lo supera en la comparativa.
- La cuantización a 4 bits puede degradar ligeramente el rendimiento respecto al modelo base, aunque no se han publicado evaluaciones de la versión cuantizada.
- Idiomas soportados: no especificados en la información disponible; el modelo original es de un equipo chino, por lo que probablemente esté optimizado para chino e inglés, pero esto no está confirmado.
- Consumo de memoria elevado: ~18,8 GB de pico, lo que excluye Macs con 16 GB de memoria unificada y limita el contexto utilizable en equipos de 24 GB.
- Riesgo de alucinación: no documentado específicamente; como todo LLM, puede generar código incorrecto o respuestas plausibles pero falsas, especialmente fuera de su dominio de entrenamiento.
- Sesgos conocidos: no disponibles.
- Licencia: Apache-2.0, sin restricciones para uso comercial.

## Enlaces

- Repositorio cuantizado: https://huggingface.co/Duckets/Nanbeige4.3-33B-MLX-4bit
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- mlx-lm (herramienta de conversión e inferencia): https://github.com/ml-explore/mlx-lm
