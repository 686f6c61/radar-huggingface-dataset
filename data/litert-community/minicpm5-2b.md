# litert-community/MiniCPM5-2B

## Resumen

MiniCPM5-2B es un modelo de lenguaje denso de 2.5 mil millones de parametros desarrollado por OpenBMB, diseñado específicamente para despliegue en dispositivos locales y entornos con recursos limitados. Este repositorio de la comunidad LiteRT (antiguo TensorFlow Lite) publica la versión optimizada LiteRT-LM del modelo, lista para ejecutarse de forma completamente local en hardware móvil y de borde. El modelo utiliza una arquitectura Transformer estándar (LlamaForCausalLM) con 42 capas, atención con GQA (16 cabezas de consulta y 2 de valor), tamaño oculto de 2048 y una ventana de contexto nativa de 131.072 tokens.

Incluye soporte nativo de tool calling y un modo de razonamiento híbrido activable mediante una plantilla de chat `<think>`, lo que permite que el mismo checkpoint funcione tanto como asistente rápido como razonador deliberado. La relevancia actual radica en que ofrece un rendimiento competitivo en formato int4 de solo 1.55 GB, lo que abre la puerta a asistentes y agentes con IA generativa directamente en móviles, sin conexión y con datos sensibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (LlamaForCausalLM) |
| Parametros totales | 2.516.756.480 (~2.5B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | int4 blockwise-32 + OCTAV, int8 dynamic, weight-only int4/int8 con activaciones fp32 |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT (formato .litertlm) |

## Arquitectura y entrenamiento

El modelo base sigue una arquitectura Transformer causal estándar, con atención de consultas agrupadas (GQA) que reduce la carga de KV-cache: 16 cabezas de consulta y 2 de valor, con dimension de cabeza de 128. Dispone de 42 capas, tamaño oculto de 2048, tamaño intermedio de 6144 y un vocabulario de 130.560 tokens.

El modelo original fue entrenado por OpenBMB, pero en la documentación disponible no se especifican los datos de entrenamiento ni el proceso de alineación. La versión LiteRT-LM añade una capa de optimización para inferencia on-device: cuantización en int4 o int8, incrustaciones en int8 y activaciones fp32 declaradas en el modelo int8. El formato `.litertlm` permite ejecutar el modelo con LiteRT-LM en GPU (Metal o OpenCL) o CPU. La cuantización int4 utiliza bloques de 32 con OCTAV sobre las proyecciones lineales y está optimizada para maximizar la velocidad de decodificación, mientras que la versión int8 mantiene cadenas de razonamiento más cortas y fiables.

## Capacidades

- Generación de texto y razonamiento híbrido: un solo checkpoint con plantilla `<think>` (enable_thinking) que alterna entre respuesta directa y razonamiento deliberado.
- Tool calling: soporte nativo de function calling integrado en la plantilla de chat.
- Contexto largo: 131.072 tokens nativos, adecuado para documentos extensos o diálogos largos.
- Multilingüe: inglés y chino, aunque puede no tener el mismo rendimiento en otros idiomas.
- Optimizado para edge: modelos `.litertlm` de 1.55 GB (int4) y 2.60 GB (int8), diseñados para móviles y equipos de borde.
- Perfiles de uso diferenciados según cuantización: el int4 ofrece mayor velocidad y menor tamaño, ideal para respuestas directas o razonamiento corto; el int8 ofrece razonamiento más completo y cadenas de pensamiento más cortas, más fiable cuando el razonamiento debe completarse.

## Casos de uso

- Asistente personal en smartphone: gracias a la cuantización int4 de 1.55 GB, el modelo puede instalarse en un móvil de gama alta y gestionar conversaciones largas con contexto superior a 100.000 tokens, sin depender de servidores.
- Agente de código en el dispositivo: con tool calling y tamaño compacto, permite editar código y seguir instrucciones de forma local, integrándose en entornos de desarrollo móvil.
- Atención al cliente offline: el soporte de tool calling y de razonamiento permite manejar consultas en inglés o chino sin conexión, útil en kioscos o tablets de sectores donde la conectividad es limitada.
- Razonamiento deliberado en int8: para tareas de matemáticas o lógica que requieren completar una cadena de pensamiento sin agotar el presupuesto de tokens, la variante int8 ofrece mayor fiabilidad y una cadena de razonamiento más corta que int4.
- Copiloto de documentación en chino e inglés: el contexto largo permite resumir y preguntar sobre informes técnicos extensos directamente desde el dispositivo, sin enviar datos a la nube.
- Aplicaciones de borde con privacidad: al ejecutar todo localmente, los datos de usuario no salen del dispositivo, lo que resulta adecuado para entornos regulados o con requisitos de soberanía de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de rendimiento publicados son métricas de inferencia en hardware específico, que se muestran a continuación.

Medidas con `litert-lm benchmark` (v0.17.0) en Apple M4 Max, con `-p 256 -d 256 --runs 3 --cache no --max-num-tokens 1024`:

| Archivo | Backend | Prefill (256) | Decode | TTFT | Init |
|---|---|---|---|---|---|
| int4 | GPU (Metal) | 1699 tok/s | 92.8 tok/s | 0.16 s | 3.7 s |
| int4 | CPU | 149 tok/s | 31.1 tok/s | 1.76 s | 4.5 s |
| int8 (fp32 activations) | GPU (Metal) | 1405 tok/s | 74.7 tok/s | 0.20 s | 3.0 s |
| int8 (fp32 activations) | CPU | 161 tok/s | 30.0 tok/s | 1.62 s | 15.0 s |

Medidas en Galaxy S26 (Snapdragon SM8850, Adreno) con un prompt de 205 tokens y `--benchmark`:

| Archivo | Backend | Prefill (205) | Decode | TTFT | Init | Peak RSS |
|---|---|---|---|---|---|---|
| int4 | GPU (OpenCL) | 401-411 tok/s | 16.1-18.6 tok/s | 0.56 s | 11.2-13.1 s | 1.14 GB |
| int4 | CPU | 39-72 tok/s | no disponible | no disponible | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo int4 ocupa 1.55 GB y el int8 2.60 GB. El pico de memoria RSS medido en Galaxy S26 con int4 en GPU es de 1.14 GB.
- GPU recomendadas: Apple M4 Max (GPU Metal) y Galaxy S26 (Adreno OpenCL) para el modelo int4; ambas versiones también funcionan en CPU.
- Compatibilidad con GPU de consumo: el modelo int4 es el recomendado para teléfonos, mientras que int8 es adecuado para escritorio y Android. En iOS, int8 supera el límite de mmap de aplicaciones con entitlements por defecto, por lo que no está pensado para esa plataforma.
- Opciones de despliegue: LiteRT-LM (litert-lm), Edge Gallery App en Android, ejecución por CLI con `uvx litert-lm run`, y uso del modelo desde cualquier aplicación que integre LiteRT.
- Latencia y throughput: vease la sección de benchmarks. En M4 Max con int4 en GPU, el tiempo hasta el primer token es de 0.16 s y la velocidad de decodificación alcanza 92.8 tokens/s.

## Comparativa con modelos similares

No se han encontrado comparativas directas con otros modelos de la misma categoría en la información disponible. La siguiente tabla compara esta versión LiteRT con el modelo base original de OpenBMB:

| Parametro | litert-community/MiniCPM5-2B | openbmb/MiniCPM5-2B |
|---|---|---|
| Parametros totales | 2.516.756.480 | 2.516.756.480 |
| Longitud de contexto | 131.072 | 131.072 |
| Arquitectura | LlamaForCausalLM | LlamaForCausalLM |
| Formato | LiteRT (.litertlm) | PyTorch (safetensors, disponibilidad no confirmada) |
| Cuantizacion | int4, int8 | En el modelo base no se especifica |
| Licencia | Apache 2.0 | Apache 2.0 |
| Optimizacion especifica | Inferencia on-device con LiteRT-LM | Modelo original de propósito general |

Otras alternativas on-device de tamaño similar, como Gemma 2B o Phi-3-mini, no han sido comparadas en la información disponible.

## Limitaciones y advertencias

- La versión int4 puede agotar el presupuesto de tokens en cadenas de razonamiento largas, tal como se indica en la documentación; se recomienda int8 cuando la tarea requiere completar el razonamiento.
- El modelo int8 tiene una sección principal de pesos de 2.33 GB, por encima del límite de mmap de aplicaciones iOS con entitlements por defecto, por lo que está orientado a Android o escritorio.
- El repositorio declara soporte de idiomas únicamente para ingles y chino; no se garantiza calidad en otros idiomas.
- No se han publicado benchmarks de razonamiento (MMLU, HumanEval) para esta versión LiteRT, por lo que no es posible evaluar su calidad frente a otros modelos en esas tareas.
- Al ser un modelo de 2.5B, cabe esperar alucinaciones en tareas de conocimiento factual y una menor fiabilidad en razonamiento complejo en comparación con modelos de mayor tamaño.
- No se dispone de información sobre sesgos específicos ni sobre pruebas de seguridad del modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/litert-community/MiniCPM5-2B
- Modelo base openbmb/MiniCPM5-2B: https://huggingface.co/openbmb/MiniCPM5-2B
- Documentación de LiteRT-LM: https://ai.google.dev/edge/litert-lm
- Edge Gallery App en Google Play: https://play.google.com/store/apps/details?id=com.google.ai.edge.gallery
- Repositorio de Edge Gallery en GitHub: https://github.com/google-ai-edge/gallery
- Releases de Edge Gallery en GitHub: https://github.com/google-ai-edge/gallery/releases
- Paper asociado a la serie MiniCPM5 (según los tags del repositorio): https://arxiv.org/abs/2506.07900
