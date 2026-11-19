# saidutta69/MiniCPM5-1B-heretic

## Resumen

MiniCPM5-1B-heretic es una variante "decensored" (abliterated) del modelo openbmb/MiniCPM5-1B, desarrollada por el usuario saidutta69 (bajo el alias "RACER IS OP"). Se trata de un transformer denso de aproximadamente 1.080 millones de parámetros que conserva las capacidades del modelo base —uso de herramientas, generación de código, contexto largo de 128K y modo de razonamiento híbrido Think/No-Think— pero con el comportamiento de rechazo suprimido mediante edición dirigida de pesos, no mediante fine-tuning.

La modificación se realizó con la herramienta Heretic v1.4.0, que aplica "abliteration" (ablation direccional) sobre las proyecciones de salida de atención (`attn.o_proj`) y las down-projections del MLP (`mlp.down_proj`). Según la model card, esta técnica localiza y edita las direcciones de peso responsables del rechazo, dejando intacto el resto de la red, de modo que el conocimiento y el seguimiento de instrucciones del modelo base se preservan en gran medida.

El modelo es relevante para desarrolladores que necesitan un modelo de 1B parámetros desplegable en GPU de consumo o en dispositivos edge, sin las restricciones de rechazo típicas de los modelos entrenados con RLHF. Está disponible en safetensors y en un conjunto completo de 15 cuantizaciones GGUF, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (MiniCPM5) |
| Parametros totales | 1.080.632.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | GGUF: F16, Q2_K, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_0, Q4_1, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; safetensors en precisión original |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura MiniCPM5 del modelo base openbmb/MiniCPM5-1B: un transformer denso de ~1,1B parámetros con soporte de contexto largo de 128K tokens y modo de razonamiento híbrido Think/No-Think (controlable mediante el parámetro `enable_thinking` en la plantilla de chat). Los datos de entrenamiento del modelo base, según los tags del repositorio, incluyen openbmb/Ultra-FineWeb, openbmb/Ultra-FineWeb-L3, openbmb/UltraData-Math y openbmb/UltraData-SFT-2605. No se dispone de información sobre el número exacto de tokens de entrenamiento ni sobre la composición detallada del dataset.

La innovación técnica de esta variante es la abliteración aplicada con Heretic v1.4.0. Los parámetros de edición publicados incluyen `direction_index` = 12.73, con pesos máximos y mínimos aplicados sobre `attn.o_proj` (max_weight 1.41 en posición 16.97, min_weight 1.28 a distancia 8.47) y sobre `mlp.down_proj` (max_weight 1.13 en posición 21.10, min_weight 1.09 a distancia 12.91). El resultado es una divergencia KL de 0.0381 respecto al modelo base, valor bajo para un modelo de 1B, lo que indica una perturbación estrecha y dirigida.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento híbrido con modo Think (cadena de pensamiento explícita) y No-Think, seleccionable en la plantilla de chat.
- Generación de código y resolución de problemas matemáticos (herencia del modelo base, con datasets UltraData-Math en su entrenamiento).
- Tool calling / function calling: emite llamadas a herramientas en estilo XML, convertibles a formato OpenAI-compatible mediante el parser `minicpm5` de SGLang.
- Soporte de agentes y razonamiento multi-paso (agentic tool use).
- Contexto largo de 128K tokens para documentos extensos y conversaciones prolongadas.
- Comportamiento de rechazo suprimido: 2 rechazos de 100 prompts adversarios frente a 96 del modelo base.
- Despliegue on-device / edge por su tamaño reducido.

## Casos de uso

- Agentes locales de escritorio: el modelo puede ejecutarse en una GPU de consumo de 8-12 GB en cuantización Q6_K o Q8_0 y gestionar bucles de tool calling con SGLang como backend, gracias a su soporte nativo de llamadas XML y su contexto de 128K.
- Asistente de código en entornos con recursos limitados: con 0.69-1.07 GB de pesos en GGUF, se integra en flujos de autocompletado y generación de fragmentos en portátiles o estaciones sin GPU dedicada, usando llama.cpp u Ollama.
- Procesamiento de documentos largos: su ventana de 128K permite resumir o extraer información de contratos, informes o transcripciones completas en una sola pasada, sin chunking.
- Investigación sobre mecánica de alineación y rechazo: la model card lo orienta explícitamente a estudios de alineación/refusal; los parámetros de abliteración publicados permiten reproducir y analizar el efecto de la edición direccional.
- Roleplay y escritura creativa sin restricciones de contenido: útil para prototipado de narrativa interactiva donde los guardarraíles del modelo base bloquean escenarios legítimos.
- Despliegue edge en dispositivos con poca memoria: con Q4_K_M (656 MB) cabe en RAM de sistema en Apple Silicon o CPU-only, habilitando asistentes offline en hardware modesto.
- Atención al cliente automatizada en inglés o chino: conversaciones multi-turno con contexto largo y bajo coste de inferencia por su tamaño de 1B.

## Benchmarks y rendimiento

La model card solo publica métricas comparativas de la abliteración, no benchmarks de capacidades (MMLU, HumanEval, GSM8K, etc.):

| Metrica | MiniCPM5-1B-heretic | openbmb/MiniCPM5-1B |
|---|---|---|
| Divergencia KL | 0.0381 | 0 (por definición) |
| Rechazos (sobre 100 prompts adversarios) | 2/100 | 96/100 |

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, según la model card): Q4_K_M ~0.69 GB, Q5_K_M ~0.79 GB, Q6_K ~0.89 GB, Q8_0 ~1.15 GB, F16 ~2.02 GB. Añadir aproximadamente 1 GB adicional para el contexto.
- GPU recomendadas por la model card: RTX 3060/4070/5070 (12 GB) con Q8_0; RTX 4060/3070 (8 GB) con Q6_K; GTX 1660 Super/2060/3050 laptop (6 GB) con Q5_K_M; CPU-only o Apple Silicon con Q4_K_M en RAM de sistema.
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más en cuantizaciones Q5_K_M o superiores; en 4 GB o menos, usar Q3_K_M o inferiores.
- Opciones de despliegue: llama.cpp (`llama serve -hf saidutta69/MiniCPM5-1B-heretic`), Ollama, LM Studio, Jan, vLLM, SGLang (recomendado para tool calling por su parser `minicpm5`), transformers, text-generation-inference.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| MiniCPM5-1B-heretic | ~1.08B | 128K | Apache 2.0 | Variante abliterated; 2/100 rechazos; GGUF completo |
| openbmb/MiniCPM5-1B | ~1.08B | 128K | Apache 2.0 | Modelo base con guardarraíles RLHF; 96/100 rechazos |
| Alternativas de 1B clase | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos comparables en la información proporcionada |

La comparación directa más relevante es con el modelo base: misma arquitectura, mismo tamaño y misma licencia, diferenciándose únicamente en el comportamiento de rechazo y la divergencia KL de 0.0381.

## Limitaciones y advertencias

- La supresión de rechazos elimina los guardarraíles de seguridad del modelo base: puede generar contenido dañino, ilegal o sesgado sin filtro. No apto para aplicaciones orientadas al público sin capas de moderación externas.
- Riesgo de alucinación inherente a un modelo de 1B parámetros; su conocimiento factual es limitado en comparación con modelos de mayor tamaño.
- Soporte idiomático restringido a inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- La abliteración puede degradar sutilmente la coherencia en dominios específicos pese a la baja divergencia KL (0.0381); conviene validar en la tarea concreta antes de producción.
- El modelo base es de julio de 2026 y la variante se actualizó en noviembre de 2026; verificar la vigencia de los parámetros de abliteración si se reproduce.
- Aunque la licencia es Apache 2.0, el uso comercial de contenido generado sin moderación puede acarrear responsabilidad legal según la jurisdicción.
- Los enlaces de la model card incluyen una imagen alojada en un dominio de terceros (`photu.kashyalabanavli.site`), no verificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saidutta69/MiniCPM5-1B-heretic
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-1B
- Licencia del modelo base: https://huggingface.co/openbmb/MiniCPM5-1B/blob/main/LICENSE
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Artículo sobre abliteración: https://huggingface.co/blog/mlabonne/abliteration
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Papers referenciados (arXiv): 2506.07900, 2602.09003, 2512.16649, 2604.13016
