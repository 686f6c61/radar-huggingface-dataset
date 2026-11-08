# nace-ai/kapitsa-clover

## Resumen

Kapitsa Clover es un modelo de generación de texto publicado por nace-ai como artefacto listo para su uso con Kapitsa, un motor de inferencia para Apple Silicon. No se trata de un modelo entrenado desde cero por nace-ai, sino de una adaptación del checkpoint kapitsaprime/Clover-35B-A3B-Preview-MLX-4bit, que a su vez es un ajuste de DiffuSpace sobre Qwen3.6-35B-A3B. El modelo se distribuye en cuantización de 4 bits con un peso aproximado de 19,5 GB y está pensado para ejecutarse localmente en equipos Mac con chip de la serie M.

La arquitectura es una mezcla de expertos (MoE) con difusión por bloques (block-diffusion), con 35 000 millones de parámetros totales y 3 000 millones activos por token. Esta combinación busca reducir el coste computacional por token manteniendo una capacidad de representación propia de un modelo de 35B, algo relevante para inferencia en hardware de consumo como un MacBook o un Mac Studio.

Su relevancia actual radica en el ecosistema: Kapitsa permite servir el modelo con una interfaz compatible con las APIs de OpenAI y Anthropic, de modo que herramientas de agentes de código como Claude Code, Codex u opencode pueden apuntar a un modelo local. El modelo se publica bajo licencia Apache 2.0, lo que facilita su uso comercial, aunque la información pública disponible sobre el mismo es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Block-diffusion MoE (mezcla de expertos con difusion por bloques) |
| Parametros totales | 35B |
| Parametros activos | 3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (4-bit); safetensors/GGUF no disponibles |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de mezcla de expertos con difusión por bloques, según la model card. Frente a un transformer autoregresivo convencional, la difusión por bloques genera tramas de tokens mediante un proceso iterativo de denoising sobre bloques, lo que puede ofrecer ventajas de paralelización durante la decodificación. El modelo activa 3 000 millones de parámetros por token sobre un total de 35 000 millones, lo que reduce el coste de cómputo y de ancho de banda de memoria en cada paso.

El checkpoint del que deriva, Clover-35B-A3B-Preview, es un ajuste de DiffuSpace sobre Qwen3.6-35B-A3B. No se dispone de información pública sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación. Tampoco se detalla el proceso de cuantización a 4 bits más allá de que el resultado ocupa aproximadamente 19,5 GB.

## Capacidades

- Generación de texto autoregresiva y por bloques mediante difusión, según la arquitectura declarada.
- Razonamiento y generación de código: el ecosistema Kapitsa está orientado explícitamente a agentes de programación.
- Integración con herramientas de agentes de código (Claude Code, Codex, opencode, pi) a través de APIs compatibles con OpenAI y Anthropic.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponibles.
- Modo de razonamiento extendido (thinking), visión o audio: no disponibles.

## Casos de uso

- Asistencia de programación local: el modelo puede servir como backend de Claude Code o Codex mediante la API compatible que expone Kapitsa, ejecutándose íntegramente en el Mac del desarrollador sin enviar código a servicios externos.
- Agentes de refactorización multi-paso: con 3B de parámetros activos por token, el coste por paso es bajo, lo que permite encadenar varias iteraciones de edición y verificación en un flujo agéntico.
- Autocompletado y generación de tests en el IDE: el motor Kapitsa puede levantarse como servidor local y conectarse a extensiones que hablen la API de OpenAI.
- Prototipado de pipelines de CI/CD sin GPU: al ejecutarse en Apple Silicon, permite validar flujos de generación de código en máquinas de desarrollo sin depender de clústeres con A100 o H100.
- Experimentación con arquitecturas de difusión: investigadores pueden estudiar el comportamiento de un MoE con difusión por bloques en tareas de texto sobre hardware asequible.
- Evaluación de motores de inferencia: sirve como caso de prueba para comparar prefill y decode de Kapitsa frente a otras soluciones en Mac.

## Benchmarks y rendimiento

La model card solo publica métricas de velocidad de inferencia en un equipo concreto:

| Equipo | Prefill (tok/s) | Decode (tok/s) |
|---|---:|---:|
| M5 Max 128 GB | 5 981 | 304 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/ memoria unificada: aproximadamente 19,5 GB para los pesos en 4 bits; hay que sumar el espacio para el contexto KV, no cuantificado en la información disponible.
- GPU recomendadas: Apple Silicon de la serie M; las métricas publicadas corresponden a un M5 Max con 128 GB de memoria unificada.
- Compatibilidad con GPU de consumo NVIDIA: no disponible; el formato de pesos es MLX, específico de Apple Silicon.
- Despliegue: motor Kapitsa (`kapitsa serve --model clover`), con APIs compatibles con OpenAI y Anthropic. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: 5 981 tok/s de prefill y 304 tok/s de decode en M5 Max 128 GB según la model card; no hay datos para otros equipos.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kapitsa Clover (este) | 35B | 3B | no disponible | Apache 2.0 | MLX 4-bit en HF |
| Qwen3.6-35B-A3B (base del linaje) | 35B | 3B | no disponible | no disponible | no disponible |
| Clover-35B-A3B-Preview-MLX-4bit | 35B | 3B | no disponible | no disponible | MLX 4-bit en HF |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Información pública muy escasa: no hay datos sobre contexto máximo, idiomas, dataset de entrenamiento ni etapas de alineación.
- Riesgo de alucinación no evaluado: al no publicarse benchmarks de calidad, no es posible estimar la fiabilidad factual del modelo.
- Sesgos desconocidos: sin documentación sobre la composición de los datos de entrenamiento.
- Dependencia de hardware: los pesos en formato MLX limitan su uso a Apple Silicon; no hay evidencia de versiones GGUF o safetensors estándar.
- Licencia Apache 2.0 declarada, lo que en principio permite uso comercial, pero conviene verificar las condiciones del modelo base del linaje (Qwen3.6-35B-A3B) antes de desplegarlo en producción.
- Modelo marcado como "Preview": puede tratarse de una versión no final, sin garantías de estabilidad.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nace-ai/kapitsa-clover
- Pesos base: https://huggingface.co/kapitsaprime/Clover-35B-A3B-Preview-MLX-4bit
- Repositorio de Kapitsa: https://github.com/nace-ai/kapitsa
- Releases de Kapitsa: https://github.com/nace-ai/kapitsa/releases
