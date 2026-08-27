# leahcim111/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo denso de 27 000 millones de parametros desarrollado por Alibaba (Qwen Team) como parte de la generacion Qwen3.8, la mas reciente de la familia abierta Qwen. Se trata de un modelo de vision-lenguaje nativo que comprende imagenes y videos, construido sobre la base arquitectonica de Qwen3.5, e incorpora mejoras sustanciales en codificacion, trabajo profesional, investigacion y tareas agenciales de horizonte largo.

El modelo emplea una arquitectura hibrida de atencion: de las 64 capas totales, solo 16 utilizan atencion completa (full attention), mientras que las otras 48 usan atencion lineal recurrente mediante Gated DeltaNet. Esta combinacion permite una ventana de contexto nativa de 262 144 tokens, extensible hasta 1 000 000, con un coste computacional muy inferior al de un transformer denso convencional. Incluye ademas un modo de pensamiento flexible (thinking mode) activado por defecto, con control de profundidad de razonamiento via `reasoning_effort` y retencion de contexto de razonamiento historico mediante `preserve_thinking`.

La relevancia actual del modelo radica en su equilibrio entre capacidades de nivel frontier y un tamano compacto que permite despliegue local en hardware de gama alta para consumidores, asi como en servidores de inferencia estandar. Su licencia Apache 2.0 elimina restricciones de uso comercial, y su compatibilidad con vLLM, SGLang, TokenSpeed y Transformers facilita la integracion en stacks existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: Gated DeltaNet (atencion lineal) + Gated Attention (atencion completa) con vision encoder |
| Parametros totales | 27 781 427 952 (27,78 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos, extensible hasta 1 000 000 |
| Tipos de cuantizacion | No disponible (pesos en BF16; cuantizaciones INT8/INT4 no publicadas oficialmente) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo de lenguaje causal con vision encoder, entrenado en dos fases: pre-training y post-training. La arquitectura del bloque de lenguaje sigue un patron hibrido de atencion: 64 capas organizadas en 16 bloques, cada uno con la disposicion `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`. Esto significa que 48 capas usan atencion lineal recurrente (Gated DeltaNet) con 48 cabezas lineales para V y 16 para QK (dimension de cabeza 128), mientras que las 16 capas restantes usan atencion completa (Gated Attention) con 24 cabezas para Q y 4 para KV (dimension de cabeza 256, RoPE de dimension 64). La dimension oculta es 5120, la dimension intermedia del FFN es 17 408 y el embedding de tokens es de 248 320 (padded).

El modelo incorpora MTP (Multi-Token Prediction) entrenado con multiples pasos, una tecnica que permite predecir varios tokens simultaneamente y acelera la inferencia. El vision encoder proporciona comprension nativa de imagenes y videos, desde diagramas STEM y documentos hasta videos de duracion horaria. El entrenamiento incluye post-training con refuerzo para tareas agenciales, lo que mejora la planificacion autonoma y el manejo de feedback del entorno. El modo de pensamiento esta activado por defecto y puede desactivarse por peticion, con control de profundidad via `reasoning_effort`.

## Capacidades

- Generacion de texto y razonamiento: capacidades completas de lenguaje natural, razonamiento logico y matematico, con modo de pensamiento configurable.
- Codificacion: generacion, revision y depuracion de codigo en multiples lenguajes, incluyendo tareas de codificacion agencial en terminal (Terminal Bench).
- Comprension de vision: analisis de imagenes, diagramas STEM, documentos escaneados y capturas de pantalla.
- Comprension de video: analisis de video de hasta duracion horaria, con extraccion de informacion temporal.
- Tareas agenciales de horizonte largo: planificacion autonoma, manejo de feedback del entorno y ejecucion de tareas multi-paso de principio a fin.
- Control flexible de razonamiento: `reasoning_effort` para ajustar la profundidad de pensamiento y `preserve_thinking` para retener contexto de razonamiento historico.
- Soporte de tool calling: compatible con herramientas integradas en la version alojada de Qwen Cloud y con harnesses de desarrollo populares.
- Compatibilidad con pipelines de inferencia: funciona con vLLM, SGLang, TokenSpeed y Hugging Face Transformers.

## Casos de uso

- Agente de codificacion en terminal: el modelo puede ejecutar tareas de codificacion agencial directamente en terminal, interpretando comandos, gestionando feedback del entorno y completando tareas multi-paso de forma autonoma, gracias a su entrenamiento especifico en Terminal Bench.
- Analisis de documentos tecnicos: con su vision encoder y ventana de contexto de 262K tokens, puede procesar documentos extensos con diagramas, tablas y figuras, extrayendo informacion estructurada para tareas de investigacion o due diligence.
- Asistente de productividad ofimatica: genera, resume y transforma documentos, hojas de calculo y presentaciones, integrando comprension visual de capturas y graficos para automatizar flujos de trabajo de oficina.
- Analisis de video para vigilancia o revision de contenido: procesa videos de hasta una hora, identificando eventos, transcribiendo dialogos y generando resumenes temporales, util para revision de grabaciones o moderacion de contenido.
- Despliegue local en estaciones de trabajo: con cuantizacion INT4 cabe en GPUs de consumo como RTX 4090 (24 GB VRAM), permitiendo ejecutar un asistente de codificacion y vision local sin dependencia de servicios en la nube.
- Agente de investigacion autonomo: combina razonamiento multi-paso, busqueda de informacion y analisis de documentos para ejecutar tareas de investigacion complejas, como revision de literatura o preparacion de informes tecnicos.
- Integracion en pipelines de CI/CD: su soporte de tool calling y compatibilidad con vLLM permiten integrarlo como agente de revision de codigo o generacion de tests en pipelines de integracion continua.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparativa, pero los valores numericos especificos no estan disponibles en la informacion proporcionada. La tabla compara Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, comenzando por la categoria de codificacion con el benchmark Terminal Bench 2.1 (Terminus) para codificacion agencial en terminal. No se han publicado resultados completos de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: ~56 GB (requiere 2×A100 40 GB, 1×H100 80 GB o equivalente).
- VRAM estimada con cuantizacion INT8: ~28-32 GB (cabe en A100 40 GB o 2×RTX 4090).
- VRAM estimada con cuantizacion INT4: ~14-16 GB (cabe en RTX 4090, RTX 3090 o RTX 4080).
- GPUs recomendadas: A100, H100, RTX 4090, RTX 3090; tambien compatible con AMD Ryzen AI Max y GPUs Radeon segun el blog oficial de AMD.
- Opciones de despliegue: vLLM, SGLang, TokenSpeed, Hugging Face Transformers, LM Studio, Ollama (via GGUF si se publica).
- El blog de AMD confirma soporte dia cero para Ryzen AI Max y Radeon, lo que permite ejecucion local en equipos con APU de gama alta.
- La version alojada en Qwen Cloud ofrecera contexto de 1M tokens por defecto y herramientas integradas, con disponibilidad proxima.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27,78 B | 262K (ext. 1M) | Hibrida (Gated DeltaNet + Gated Attention) | Apache 2.0 | Abierto (HuggingFace) |
| Qwen3.6-27B | ~27 B | No disponible | No disponible | No disponible | Abierto |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible | API propietaria |
| Muse Glimmer-30B | ~30 B | No disponible | No disponible | No disponible | No disponible |
| Opus4.6 Max | No disponible | No disponible | No disponible | No disponible | No disponible |

Los datos de Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max provienen exclusivamente de la tabla de benchmarks de la model card; no se dispone de especificaciones detalladas de estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos y alucinaciones: no se han publicado evaluaciones especificas de sesgos para este modelo; como todo LLM, puede generar contenido factualmente incorrecto o alucinado, especialmente en tareas de razonamiento complejo.
- Idiomas: la model card no especifica los idiomas soportados; se recomienda verificar el comportamiento en el idioma objetivo antes de desplegar en produccion.
- Contexto extendido: aunque el contexto nativo es de 262K tokens y extensible a 1M, el rendimiento en contextos muy largos puede degradarse; se recomienda validar con casos de uso reales.
- Cuantizacion: no se han publicado cuantizaciones oficiales INT8/INT4; las estimaciones de VRAM para cuantizacion son orientativas y dependen de la implementacion.
- Vision: aunque el modelo soporta video de hasta una hora, el procesamiento de video largo requiere recursos computacionales significativos y puede no ser adecuado para despliegue en hardware de consumo.
- Version alojada: la version de Qwen Cloud con 1M de contexto y herramientas integradas esta anunciada como "proximamente"; las capacidades de la version open source pueden diferir de la version alojada.
- Modelo reciente: al ser un modelo publicado en agosto de 2026, la comunidad aun no ha acumulado experiencia extensa en produccion; se recomienda realizar pruebas exhaustivas antes de adoptarlo en entornos criticos.

## Enlaces

- HuggingFace: https://huggingface.co/leahcim111/Qwen3.8-27B
- LM Studio: https://lmstudio.ai/models/qwen3.8
- Qwen Cloud (version alojada): https://www.qwencloud.com/models/qwen3.8-27b
- vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Blog AMD (soporte Ryzen AI Max y Radeon): https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
