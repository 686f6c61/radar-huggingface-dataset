# netprojects/Qwen3.8-27B-hermes-adapted-MLX-3bit

## Resumen

Qwen3.8-27B-hermes-adapted-MLX-3bit es una cuantización de 3 bits en formato MLX del modelo Qwen3.8-27B, adaptado mediante LoRA por harness-hub para tareas de ingeniería de software y uso de terminal, y empaquetado por el usuario netprojects para su ejecución en Apple Silicon. El resultado es un modelo de 28.489 millones de parámetros (aproximadamente 28,5B), con codificador de visión incluido y una capa de multi-token prediction (MTP) de Qwen, que ocupa 13,8 GB en disco y está pensado para Macs con 24 GB de memoria unificada o más.

El modelo base Qwen3.8-27B procede de Qwen (Alibaba) y esta versión incorpora el adaptador LoRA entrenado con aprendizaje por refuerzo (AsyncGRPO en TRL, rango 32, alpha 64) por harness-hub para ser el motor detrás de Hermes Agent en tareas de software. El checkpoint publicado corresponde al paso 160 de los 1000 planificados. La cuantización mixta (3 bits en la mayoría de capas lineales, 4 bits en embeddings, capa de salida y proyecciones sensibles v_proj/down_proj) da como resultado unos 3,91 bits por peso de media.

Su relevancia radica en que permite ejecutar un modelo de 27B con capacidades de agente de código y visión en hardware de consumo Apple, manteniendo un 91,7% de coincidencia en el siguiente token respecto a bf16 y una puntuación de 45/50 en GSM8K, con un pico de memoria de 14,6 GB para un prompt de 8K tokens. Es una opción práctica para desarrolladores que quieran probar flujos de agentes de terminal localmente sin depender de la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8-27B) con capa MTP; cuantización MLX affine group 64 |
| Parametros totales | 28.489.216.752 (~28,5B) |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible (Hermes Agent requiere al menos 64.000 tokens) |
| Tipos de cuantizacion | 3-bit mixto (mayoría 3-bit, embeddings/salida/v_proj/down_proj en 4-bit, ~3,91 bits por peso); MTP en 8-bit |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), repo de 13,8 GB |

## Arquitectura y entrenamiento

El modelo es un transformer Qwen3.8-27B convertido a MLX con mlx-vlm, incluyendo el codificador de visión y la capa MTP de Qwen. La cuantización es mixta: la mayoría de capas lineales usan 3 bits afines con grupo 64, mientras que el token embedding, la capa de salida y las proyecciones v_proj/down_proj de las primeras y últimas ocho capas y de cada tercera capa intermedia se mantienen en 4 bits para preservar fidelidad. La capa MTP se conserva en 8 bits en `model-mtp.safetensors` y se declara en `config.json` como `mtplx_mtp_quantization`; el adaptador no la modifica, por lo que es la cabeza MTP original de Qwen.

El adaptador LoRA fue entrenado por harness-hub con aprendizaje por refuerzo (AsyncGRPO en TRL, rango 32, alpha 64) sobre tareas de ingeniería de software y terminal, con el objetivo de servir como motor de Hermes Agent. El checkpoint publicado corresponde al paso 160 de 1000 planificados. El tokenizador y la plantilla de chat son los de harness-hub sin cambios, con el mismo vocabulario y formato de tool calls que Qwen3.8-27B (formato XML `<tool_call><function=...><parameter=...>`). La decodificación especulativa se apoya en la capa MTP como modelo borrador integrado, verificando cada token propuesto con el modelo completo.

## Capacidades

- Generación de texto y razonamiento general, con modo "thinking" desactivable (entrenado y evaluado con thinking off).
- Generación y edición de código, con especial énfasis en tareas de ingeniería de software y terminal.
- Tool calling / function calling en formato XML de Qwen, expuesto como `tool_calls` de OpenAI por el servidor de mlx-lm.
- Capacidades de agente multi-paso orientadas a Hermes Agent (resolución de bugs, ejecución de comandos, iteración sobre tests).
- Procesamiento de imágenes (pipeline image-text-to-text) mediante mlx-vlm: capturas de pantalla, terminales, diagramas.
- Decodificación especulativa integrada mediante la capa MTP de Qwen.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Depuración automática de tests: el modelo puede recibir el fallo de `tests/test_parser.py`, inspeccionar el código y proponer un parche, tal como se documenta en el ejemplo de uso con Hermes Agent; encaja por su entrenamiento específico en tareas de software.
- Agente de terminal local: ejecutar comandos, interpretar su salida y encadenar pasos en un Mac con 24 GB, gracias a que el build de 3 bits cabe en 14,6 GB de pico con prompts de 8K tokens.
- Análisis de capturas de terminal o pantalla: el codificador de visión permite pasar una imagen de un error y preguntar qué falla, útil para soporte técnico y triaje de incidencias.
- Asistente de código en el IDE o CLI: integrable vía el servidor OpenAI-compatible de mlx-lm en `localhost:8000`, con tool calls en formato estándar para pipelines de CI/CD o scripts de automatización.
- Prototipado de agentes de software en local sin nube: al ser Apache-2.0 y ejecutable en Apple Silicon, sirve para validar flujos de agentes antes de desplegar en infraestructura mayor.
- Generación de código con decodificación rápida: usar la capa MTP como draft model reduce el coste de generación en tareas de código donde la latencia importa, con verificación completa de cada token.
- Evaluación comparativa de cuantizaciones: el mismo repo ofrece builds de 2,5, 3, 4, 6, 8 bits y bf16, lo que permite medir el impacto de la cuantización en tareas reales sobre el mismo adaptador.

## Benchmarks y rendimiento

Datos publicados por el autor del adaptador (harness-hub), con Hermes Agent y thinking off, frente al modelo base:

| Benchmark | Modelo base | Con adaptador |
|---|---|---|
| SWE-bench Pro (hard 51) | 29,4% | 43,1% |
| Terminal-Bench 2.1 | 44,7% | 58,8% |

El adaptador usa menos del 40% de los turnos del modelo base en las tareas que ambos resuelven y aproximadamente 2 veces menos tokens generados. Con thinking off iguala al modelo base con thinking en su máximo esfuerzo (xhigh) usando entre 3,5 y 4,4 veces menos tokens.

Métricas de fidelidad de la cuantización de este build (3-bit) frente a bf16:

| Metrica | Valor |
|---|---|
| Coincidencia en siguiente token vs bf16 | 91,7% |
| KL vs bf16 | 0,0824 |
| GSM8K (50 preguntas) | 45/50 |
| Pico de memoria con prompt de 8K tokens | 14,6 GB |
| Memoria de Mac sugerida | 24 GB+ |

## Requisitos de hardware

- VRAM/memoria unificada estimada: 14,6 GB de pico con prompt de 8K tokens; 24 GB de memoria de Mac recomendados como mínimo.
- GPU recomendadas: Apple Silicon (M-series) con 24 GB o más de memoria unificada. No está pensado para GPU NVIDIA/AMD (formato MLX).
- Cabe en GPU de consumo: sí, en Macs de 24 GB; para mayor fidelidad, los builds de 4 bits (32 GB+), 6 bits (36 GB+) y 8 bits (48 GB+) requieren más memoria.
- Opciones de despliegue: `mlx-lm` (servidor OpenAI-compatible, `mlx_lm.server`) para texto; `mlx-vlm` para imagen y texto; integración con Hermes Agent vía `~/.hermes/config.yaml`.
- Latencia y throughput: no disponibles en la información proporcionada; la decodificación especulativa con MTP está soportada mediante `--draft-model` y `--draft-kind mtp`.

## Comparativa con modelos similares

Comparación con otros builds del mismo adaptador (misma categoría y mismo modelo base):

| Build | Tamano | Coincidencia siguiente token vs bf16 | KL vs bf16 | GSM8K | Pico memoria 8K | Mac sugerido |
|---|---|---|---|---|---|---|
| MLX-6bit (recomendado) | 23,1 GB | 98,5% | 0,0015 | 46/50 | 23,4 GB | 36 GB+ |
| MLX-8bit | 30,0 GB | 99,2% | 0,0004 | 45/50 | 29,7 GB | 48 GB+ |
| MLX-4bit | 16,3 GB | 96,1% | 0,0192 | 43/50 | 17,1 GB | 32 GB+ |
| MLX-3bit (este) | 13,8 GB | 91,7% | 0,0824 | 45/50 | 14,6 GB | 24 GB+ |
| MLX-2.5bit | 11,8 GB | 85,4% | 0,2461 | 44/50 | 13,8 GB | 24 GB+ |
| MLX-bf16 | 55,6 GB | referencia | referencia | 45/50 | 53,4 GB | 96 GB+ |

No se dispone de comparación con modelos de otros autores en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 3 bits reduce la fidelidad: solo el 91,7% de coincidencia en el siguiente token respecto a bf16 y KL de 0,0824, con posible degradación en tareas sensibles a precisión numérica o de formato.
- El adaptador se entrenó y evaluó con thinking off; usarlo con thinking activado puede dar resultados distintos a los reportados.
- El checkpoint del adaptador corresponde al paso 160 de 1000 planificados, por lo que no es el resultado final del entrenamiento.
- Sesgos conocidos: no disponibles en la información proporcionada; al derivar de Qwen3.8-27B y de datos de harness-hub, hereda los sesgos de ambos, no documentados aquí.
- Riesgo de alucinación: inherente a los modelos generativos; no se han publicado evaluaciones específicas de alucinación para este build.
- Limitaciones de contexto e idioma: la longitud de contexto no está indicada; Hermes Agent exige al menos 64.000 tokens. Los idiomas soportados no están documentados.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B y del adaptador original de harness-hub, ya que este build es una derivación.
- Solo funciona en Apple Silicon con MLX; no es desplegable en vLLM, TGI, llama.cpp ni Ollama en su formato actual.
- El ejemplo de instalación de Hermes Agent usa `curl | bash` desde un repositorio de terceros; conviene revisar el script antes de ejecutarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-3bit
- Adaptador original: https://huggingface.co/harness-hub/Qwen3.8-27B-hermes-adapted
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Build 6 bits (recomendado): https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-6bit
- Build 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-8bit
- Build 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-4bit
- Build 2.5 bits: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-2.5bit
- Build bf16: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-bf16
- Adaptador LoRA MLX: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-adapter
- Hermes Agent (GitHub): https://github.com/NousResearch/hermes-agent
