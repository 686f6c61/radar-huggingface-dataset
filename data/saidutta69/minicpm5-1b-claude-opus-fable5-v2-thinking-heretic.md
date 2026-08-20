# saidutta69/MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking-heretic

## Resumen

MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking-heretic es una variante "decensored" del modelo GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking, producida por saidutta69 mediante la técnica de abliteration (ablación direccional) con la herramienta Heretic v1.4.0. El modelo base es a su vez un fine-tune V2 de openbmb/MiniCPM5-1B sobre trazas del dataset Fable 5, orientado a tool calling, generación de código y seguimiento de instrucciones. La abliteration suprime el comportamiento de rechazo mediante ediciones de pesos dirigidas en las proyecciones de salida de atención y las down-projections del MLP, en lugar de un fine-tuning adicional, lo que preserva en gran medida las capacidades del modelo original.

Con 1.080.632.832 parámetros (aproximadamente 1,08 mil millones) y una ventana de contexto de 131.072 tokens (128K), este modelo está diseñado para ejecutarse en hardware de consumo y en entornos edge. Mantiene los modos de chat Think y No-Think nativos de MiniCPM5, así como la capacidad de emisión de llamadas a herramientas en formato XML. Su relevancia radica en ofrecer un modelo pequeño con capacidades de razonamiento y tool calling que responde directamente sin filtros de rechazo, dirigido a desarrolladores que trabajan con agentes locales, roleplay o investigación sobre mecanismos de alineación. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LlamaForCausalLM) |
| Parametros totales | 1.080.632.832 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (128K) |
| Tipos de cuantizacion | BF16 (safetensors), GGUF Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | Ingles, chino (en, zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura estándar LlamaForCausalLM, un transformer decoder-only con atención causal. No es un modelo MoE, por lo que todos los parámetros se activan en cada inferencia. La base es openbmb/MiniCPM5-1B, un modelo compacto de 1B con ventana de contexto de 128K tokens. Sobre esta base, GnLOLot realizó un fine-tune V2 con datos de Fable 5, enfocado en tool/function calling, generación de código y seguimiento de instrucciones, dando lugar al modelo GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking.

Posteriormente, saidutta69 aplicó abliteration con Heretic v1.4.0. Esta técnica identifica direcciones de pesos específicas responsables del comportamiento de rechazo y las edita de forma dirigida, sin reentrenar el modelo. Los parámetros de la ablación incluyen un direction_index de 12.95 y ajustes en attn.o_proj y mlp.down_proj con pesos máximos y mínimos específicos. El resultado es una reducción drástica de rechazos (de 93/100 a 3/100 en prompts adversariales) con una divergencia KL de solo 0.0232 respecto al modelo original, lo que indica una perturbación mínima de las capacidades generales. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset Fable 5 ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: soporta modos de chat Think (con razonamiento explícito) y No-Think (respuesta directa), ambos nativos de MiniCPM5.
- Tool calling y function calling: emite llamadas a herramientas en formato XML, que pueden ser convertidas a tool_calls compatibles con OpenAI mediante el parser minicpm5 de SGLang.
- Generación de código: entrenado específicamente para tareas de programación, capaz de producir funciones y scripts en Python y otros lenguajes.
- Seguimiento de instrucciones: fine-tune V2 orientado a cumplir instrucciones complejas de forma fiel.
- Conversacional: mantiene diálogos multi-turno con contexto largo gracias a su ventana de 128K tokens.
- Multilingüe: soporta inglés y chino.
- Despliegue on-device y edge: tamaño reducido que permite ejecución en dispositivos con recursos limitados.
- Reproducible: incluye un directorio `reproduce` con configuración exacta, métricas, transcripciones de evaluación y checksums SHA256.

## Casos de uso

- Agentes locales con tool calling: el modelo puede gestionar flujos de agente que requieren invocar funciones externas. Gracias a su formato XML de llamadas a herramientas y la compatibilidad con SGLang, se integra en pipelines que convierten estas llamadas en tool_calls estándar de OpenAI, permitiendo la automatización de tareas como consultas a APIs o manipulación de archivos.
- Generación de código en producción: con su enfoque en coding e instruction-following, puede generar fragmentos de código, refactorizar funciones o completar implementaciones. Su pequeño tamaño permite integrarlo en entornos de desarrollo locales o en pipelines de CI/CD sin necesidad de GPUs de alta gama.
- Roleplay y narrativa sin restricciones: al ser una variante decensored, responde a solicitudes creativas que el modelo base rechazaría, lo que lo hace adecuado para juegos de rol, escritura de ficción o simulación de personajes en aplicaciones locales.
- Investigación sobre mecanismos de alineación y rechazo: el modelo sirve como caso de estudio para analizar cómo la abliteration afecta al comportamiento de rechazo y qué direcciones de pesos están implicadas. Su reproducibilidad completa facilita la verificación de resultados.
- Despliegue edge en dispositivos móviles o embebidos: con cuantizaciones GGUF de 656 MB (Q4_K_M), cabe en dispositivos con poca memoria, como routers, cámaras inteligentes o aplicaciones móviles, manteniendo una ventana de contexto amplia para tareas de asistencia conversacional.
- Asistente conversacional bilingüe: soporta inglés y chino, por lo que puede servir como base para chatbots de atención al cliente o asistentes personales en entornos multilingües, con la ventaja de un contexto largo para mantener el historial de la conversación.
- Automatización de tareas con function calling: puede orquestar secuencias de llamadas a herramientas para ejecutar tareas administrativas, como enviar correos, programar citas o consultar bases de datos, gracias a su capacidad de emitir múltiples llamadas estructuradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente reporta métricas de la abliteration:

| Metrica | Modelo heretic | Modelo original (GnLOLot) |
|---|---|---|
| Divergencia KL | 0.0232 | 0 (por definicion) |
| Rechazos (sobre 100 prompts adversariales) | 3/100 | 93/100 |

La divergencia KL extremadamente baja indica que la edición de pesos es estrecha y dirigida, preservando las capacidades del modelo original. La reducción de rechazos de 93 a 3 sobre 100 prompts adversariales confirma la efectividad de la abliteration para suprimir el comportamiento de rechazo, aunque no se aportan datos sobre rendimiento en tareas de razonamiento, código o matemáticas.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q4_K_M (656 MB de pesos) se requiere aproximadamente 1 GB de VRAM; con Q8_0 (1,10 GB) alrededor de 2 GB; con BF16 safetensors (~2,2 GB) se necesitan unos 4 GB de VRAM considerando overhead de activaciones y caché KV.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente para la version BF16, como NVIDIA RTX 3060, RTX 4060, GTX 1660 Super, o incluso iGPUs modernas con memoria compartida para cuantizaciones GGUF. Tambien compatible con Apple Silicon via Metal.
- Se ejecuta en CPU: gracias a las cuantizaciones GGUF, puede funcionar en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp (comando `llama serve -hf saidutta69/MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking-heretic`), Ollama, LM Studio, Jan, vLLM, SGLang y transformers con `trust_remote_code=True`.
- Latencia y throughput: no disponible en la informacion proporcionada, pero al ser un modelo de 1B con arquitectura estandar, se espera una generacion rapida incluso en hardware modesto (tipicamente decenas de tokens por segundo en GPU de consumo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rechazos (100 prompts) | Notas |
|---|---|---|---|---|---|
| MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking-heretic | 1,08 B | 131.072 | Apache 2.0 | 3/100 | Variante decensored via abliteration |
| GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking | 1,08 B | 131.072 | Apache 2.0 | 93/100 | Modelo base sin abliteration |
| openbmb/MiniCPM5-1B | 1,08 B | 131.072 | Apache 2.0 | no disponible | Modelo original de MiniCPM5 |

La comparativa se limita a los modelos de la misma familia, ya que no se dispone de datos de rendimiento estandarizados para otras alternativas de tamano similar (como Qwen2.5-1.5B o Llama-3.2-1B). La principal diferencia entre las variantes es el comportamiento de rechazo: el modelo heretic responde a solicitudes que el modelo base rechaza, manteniendo una divergencia KL minima respecto al original.

## Limitaciones y advertencias

- Sin filtrado de seguridad: la abliteration suprime deliberadamente el rechazo, por lo que el modelo cumplira solicitudes que el modelo base rechazaria, incluidas algunas potencialmente daninas. No hay capa de moderacion adicional. No debe desplegarse en endpoints publicos sin moderacion para terceros.
- Sesgos conocidos: no se han documentado sesgos especificos, pero al estar entrenado principalmente en ingles y chino, puede presentar sesgos culturales o linguisticos de esos dominios.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en contextos largos o temas poco representados en el entrenamiento.
- Limitaciones de idioma: solo soporta ingles y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- Degradacion en contexto muy largo: aunque la ventana es de 128K tokens, el rendimiento puede degradarse en contextos cercanos al limite, como es comun en modelos transformer.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el caracter decensored del modelo implica una responsabilidad legal y etica sobre el contenido generado. El autor recomienda no exponerlo a usuarios finales sin moderacion.
- Impacto de la abliteration: aunque la divergencia KL es baja, la edicion de pesos puede afectar sutilmente a ciertas capacidades, especialmente en tareas que dependen de las direcciones modificadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/saidutta69/MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking-heretic
- Modelo base (GnLOLot): https://huggingface.co/GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking
- Modelo base original (openbmb): https://huggingface.co/openbmb/MiniCPM5-1B
- Repositorio de Heretic: https://github.com/p-e-w/heretic
- Articulo sobre abliteration: https://huggingface.co/blog/mlabonne/abliteration
