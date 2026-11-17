# jakeatx/qwen3.8-27b-Swift1.5-Uncensored-ATX-AI3

## Resumen

Swift 1.5 Qwen3.8-27B Uncensored ATX AI3 es una cuantización GGUF de 3,0 bits por peso del modelo base Qwen/Qwen3.8-27B, publicada por el usuario jakeatx bajo licencia Apache 2.0. El trabajo no consiste en un entrenamiento nuevo, sino en una compresión agresiva realizada con la herramienta llamAmpere, orientada a que un modelo de 27.000 millones de parámetros quepa en tarjetas gráficas de 12 GB manteniendo el contexto largo y la decodificación especulativa MTP (multi-token prediction) activada.

La relevancia de esta ficha es doble: por un lado demuestra hasta dónde llega la compresión con recetas por tensor y mapas de atención LSA; por otro, ilustra un caso de empaquetado que depende de una versión de runtime aún no publicada (llamAmpere 0.7), lo que condiciona su uso real en producción. El repositorio ocupa 11,3 GB e incluye el GGUF principal más un sidecar de índice LSA.

El modelo hereda las capacidades del Qwen3.8-27B original (generación de texto, razonamiento, código y contexto de 262.144 tokens), pero la model card no documenta idiomas, pipeline ni detalles de entrenamiento. La etiqueta "Uncensored" sugiere un ajuste fino orientado a eliminar rechazos, aunque no se aporta información verificable sobre ese proceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen3.8-27B (detalles no disponibles); inferencia con atención LSA y MTP |
| Parametros totales | 27B nominales (2.097.152 según safetensors del repo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (12 GB); 212.992 (10 GB); 204.800 (8 GB) |
| Tipos de cuantizacion | GGUF a ~3,0 bits por peso (ATX AI3); variantes AI2 a 2,3 bpw y AI2.1 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (más sidecars GGUF: `lsa-qwen38-27b-d2048.gguf`, `mtp-dm.gguf`, `head-ait2.gguf`, `head-exact-f16.gguf`) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso de 27.000 millones de parámetros. Esta publicación no entrena pesos nuevos: aplica una receta de cuantización GGUF a ~3,0 bits por peso con llamAmpere, que combina mapas de atención LSA (atención de contexto largo con KV offload a host) y decodificación especulativa MTP para reducir el coste de memoria. El repositorio incluye un sidecar de índice LSA (`lsa-qwen38-27b-d2048.gguf`) que debe acompañar al modelo principal en la misma carpeta.

La model card reporta métricas de deriva frente a la versión BF16 de Swift 1.5: KLD de 0,0270 y Top-1 del 95,98% sobre 16.200 posiciones de evaluación (coding, agentic y RAG a ~12K de contexto). No se detalla la composición del dataset de entrenamiento del modelo base, ni si hubo RLHF/DPO, ni el proceso exacto de ajuste "uncensored". La innovación técnica declarada es el empaquetado: permitir 262K de contexto con MTP en una GPU de 12 GB, algo que según el autor no logra la receta UD-Q2_K_XL de Unsloth con atención estándar.

## Capacidades

- Generación de texto y razonamiento multi-turno heredados de Qwen3.8-27B.
- Generación de código: la model card evalúa con LiveCodeBench v6 y reporta 89% en el grader estricto (una semilla, orientativo).
- Contexto largo: hasta 262.144 tokens en la variante de 12 GB.
- Decodificación especulativa MTP activada por defecto en los presets documentados.
- Soporte de tool calling y agentes: no confirmado explícitamente en la información disponible, aunque la evaluación incluye escenarios "agentic".
- Multilingüismo: no disponible.
- Modo "uncensored": el nombre indica ausencia de rechazos, sin documentación técnica del ajuste.

## Casos de uso

- Asistentes de código en local sobre GPU de 12 GB: el modelo puede generar parches y explicaciones con contexto de repositorio completo gracias a los 262K tokens, sin depender de API externa.
- RAG de documentación extensa: la evaluación incluye escenarios RAG a ~12K de contexto; con 262K se pueden inyectar manuales completos y mantener coherencia multi-turno.
- Agentes de terminal o CI/CD: al heredar tool calling del base (a confirmar en despliegue), encaja en pipelines que requieren ejecución local y privacidad de datos.
- Análisis de repositorios grandes: indexación y resumen de monorepos que exceden la ventana de modelos de 8K-32K.
- Prototipado de investigación en cuantización: sirve como referencia para comparar recetas ATX frente a Unsloth UD en tareas de coding y agentic.
- Despliegue en estaciones de trabajo con RTX 3060/4070 de 12 GB: el archivo principal está medido a 11.544 MiB de VRAM pico, lo que permite inferencia local con contexto largo.
- Evaluación de robustez de filtros: al ser "uncensored", útil para estudiar comportamiento sin rechazos en entornos controlados.

## Benchmarks y rendimiento

| Benchmark | ATX AI3 12 GB | UD-Q2_K_XL | Qwen BF16 (publicado) |
|---|---|---|---|
| KLD (menor mejor) | 0,0270 | 0,0591 | 0 (referencia) |
| Top-1 (%) | 95,98 | 94,00 | 100 |
| LiveCodeBench v6 (strict, 1 semilla) | 89% | 87% | 90,3% |
| Tokens medios por respuesta (LiveCodeBench v6) | 4.608 | 8.932 | no disponible |
| VRAM pico (12 GB) | 11.544 MiB | no cabe a contexto completo con MTP (estimación) | no aplica |

El autor advierte que la comparativa de LiveCodeBench es direccional, con una sola semilla y sin significación estadística. La métrica más sólida es la KLD sobre 16.200 posiciones, donde el archivo ATX muestra un 54% menos de deriva que UD-Q2_K_XL.

## Requisitos de hardware

- VRAM estimada: 11.544 MiB pico para el archivo de 12 GB con contexto completo (262K) y MTP activado; 7.506 MiB para la variante de 8 GB (contexto 204.800).
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, A100, H100 (las dos últimas sobradas para este tamaño).
- Cabe en GPU de consumo de 12 GB; las variantes AI2 y AI2.1 apuntan a tarjetas de 10 y 8 GB.
- Despliegue: llama-server de llamAmpere 0.7 (no publicada en el momento de la model card); no se documenta compatibilidad con vLLM, llama.cpp estándar, Ollama ni TGI.
- Latencia y throughput: no disponibles; la decodificación especulativa MTP y la atención LSA con KV offload a host condicionan el rendimiento y no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ATX AI3 (este) | 27B | 262.144 | Apache 2.0 | GGUF ~3 bpw | Requiere llamAmpere 0.7; KLD 0,0270 |
| Unsloth UD-Q2_K_XL (receta) | 27B | 262.144 (teórico) | Apache 2.0 | GGUF ~2 bpw | KLD 0,0591; no cabe a contexto completo en 12 GB con MTP (estimación) |
| Unsloth UD-IQ3_XXS (receta) | 27B | 262.144 (teórico) | Apache 2.0 | GGUF ~3 bpw | KLD 0,0396; 10,93 GB |
| Mirai S | 27B | no disponible | no disponible | no disponible | KLD 0,0745 |

## Limitaciones y advertencias

- Dependencia de runtime no publicado: los presets `12dense` y `8dense` requieren llamAmpere 0.7, que el autor indica como "coming, not yet released". Sin esa versión no se puede ejecutar el modelo con las condiciones documentadas.
- Empaquetado frágil: hay que mantener en la misma carpeta el GGUF principal y el sidecar LSA; la variante de 8 GB añade tres sidecars más (`mtp-dm.gguf`, `head-ait2.gguf`, `head-exact-f16.gguf`).
- Riesgo de alucinación: inherente a un modelo de 27B cuantizado a 3 bpw; la KLD de 0,0270 indica deriva medible frente a BF16.
- Etiqueta "uncensored" sin documentación: no se describe el ajuste ni los sesgos resultantes; puede producir contenido inapropiado y requiere filtros externos en producción.
- Idiomas no declarados: no se puede garantizar calidad multilingüe.
- Benchmarks limitados: LiveCodeBench con una sola semilla y sin significación estadística; no hay MMLU, GSM8K ni HumanEval publicados.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3.8-27B y de los sidecars.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/jakeatx/qwen3.8-27b-Swift1.5-Uncensored-ATX-AI3
- Variante de 10 GB (AI2): https://huggingface.co/jakeatx/qwen3.8-27b-Swift1.5-Uncensored-ATX-AI2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
