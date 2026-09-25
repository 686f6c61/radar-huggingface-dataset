# ramgpt/Olmo-3-7B-Instruct-OPSA-Code-GGUF

# Ficha de modelo: Olmo-3-7B-Instruct-OPSA-Code-GGUF

## Resumen

`ramgpt/Olmo-3-7B-Instruct-OPSA-Code-GGUF` es una conversión al formato GGUF del checkpoint `Tuwhy/Olmo-3-7B-Instruct-OPSA-Code`, que a su vez es un ajuste fino del `allenai/Olmo-3-7B-Instruct` de Ai2. No se trata de un entrenamiento nuevo, sino de una cuantización preparada para ejecutarse con llama.cpp y su ecosistema (llama-server, Ollama, LM Studio). El repositorio publica una única cuantización Q4_K_M de 4,16 GiB sobre los 7.298.011.136 parámetros del modelo original.

El modelo hereda las características de la familia Olmo 3: modelos de lenguaje totalmente abiertos, con el ciclo de vida completo de entrenamiento publicado, orientados a razonamiento de contexto largo, function calling, código, seguimiento de instrucciones, chat general y recuperación de conocimiento. El Olmo 3 7B Instruct de Ai2 declara una ventana de contexto de 65.536 tokens.

Su interés práctico es que permite desplegar localmente un 7B derivado de Olmo 3 en hardware de consumo con un coste de memoria contenido gracias a Q4_K_M. La conversión fue validada con un smoke test real sobre llama-server y con 3 tareas de código Python ejecutables, pero el propio autor advierte que la plantilla incluida es solo de texto y no replica el soporte de tool calling del checkpoint fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Olmo 3 de Ai2) |
| Parametros totales | 7.298.011.136 (7,3 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 65.536 tokens (dato de Olmo 3 7B Instruct; no reconfirmado para esta conversión) |
| Tipos de cuantizacion | Q4_K_M (única publicada en este repositorio) |
| Idiomas soportados | no disponible en el repositorio; la familia Olmo 3 está orientada principalmente al inglés |
| Licencia | no disponible en el repositorio |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

Este repositorio no entrena nada: es una conversión de pesos del checkpoint `Tuwhy/Olmo-3-7B-Instruct-OPSA-Code` (revisión `97e4404caa2159e6ddddf23b993a6234b699367b`) al contenedor GGUF. La cadena es Ai2 Olmo 3 7B Instruct → ajuste fino por el usuario Tuwhy (sufijo `OPSA-Code`, orientado a código) → cuantización a GGUF por ramgpt. No se detalla en la información disponible el dataset, el número de tokens ni el método de ajuste (SFT, DPO, RLHF) empleado por Tuwhy.

La familia Olmo 3 se presenta como totalmente abierta: se publica el flujo completo del modelo, incluidos todas las etapas, checkpoints y datos, con post-entrenamiento verificable. Los objetivos declarados de construcción son razonamiento de contexto largo, function calling, código, seguimiento de instrucciones, chat y recuerdo de conocimiento. Durante el preflight de conversión se comprobó que no había desajustes MTP/NextN, lo que sugiere que el checkpoint incorpora componentes de predicción multi-token (MTP), aunque la información disponible no detalla su configuración.

El punto técnico más relevante de esta conversión es la plantilla de chat: el Jinja original del checkpoint usa construcciones que el parser minja de llama.cpp no puede interpretar, por lo que el repositorio incluye una plantilla de reserva (`chat-template-text-only.jinja`) que conserva el chat de texto system/user/assistant, pero no garantiza compatibilidad con la plantilla de tool calling del modelo fuente.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones en formato chat de texto.
- Codificación: superó 3/3 tareas Python locales ejecutables (detección de palíndromos, comprobación de paréntesis balanceados y fusión de intervalos), con compilación y ejecución contra tests unitarios.
- Razonamiento de contexto largo, heredado de la ventana de 65.536 tokens de Olmo 3 7B Instruct.
- Modo razonamiento (thinking): el smoke test indica un modo `auto` y verifica que no se filtran etiquetas de thinking cuando el razonamiento está desactivado, por lo que el modelo fuente soporta este comportamiento.
- Aritmética básica verificada en el gate de validación (generación aritmética correcta).
- Tool calling / function calling: no garantizado en esta conversión. La plantilla de reserva es solo de texto y el autor declara explícitamente que no reclama compatibilidad con la plantilla de herramientas del checkpoint original.
- Capacidades de agente multi-paso: no disponibles de forma fiable al no soportar tool calling con la plantilla incluida.
- Capacidades multilingües: no disponibles; no se declaran idiomas en el repositorio.

## Casos de uso

- Asistente de código local en el IDE: un 7B cuantizado a Q4_K_M (4,16 GiB) cabe en GPU de consumo, por lo que puede servir autocompletado, explicación de fragmentos y refactorizaciones sin enviar código a la nube. Es adecuado para entornos con requisitos de privacidad.
- Tutoría de programación: el modelo mantiene conversaciones multi-turno y puede explicar conceptos paso a paso, corrigiendo ejercicios de estudiantes sobre un contexto de hasta 65K tokens (por ejemplo, un fichero de ejercicios completo).
- Análisis de ficheros largos de código: gracias a la ventana de 65K se puede cargar un módulo o varios ficheros en el prompt y pedir resúmenes, búsqueda de bugs o generación de documentación, aunque conviene vigilar la degradación de calidad en el extremo superior de la ventana.
- Generación de tests unitarios: el modelo ya demostró resolver tareas Python ejecutables; se puede integrar en un flujo local que, dado un módulo, proponga casos de prueba que luego se ejecuten en CI. No obstante, sin tool calling nativo, la orquestación debe hacerla el sistema externo.
- Despliegue en edge o en portátiles: mediante llama.cpp, Ollama o LM Studio se puede empaquetar como asistente offline para documentación técnica interna, con independencia de la conexión de red.
- Prototipado y evaluación de la familia Olmo 3: resulta útil para investigadores que quieran medir en local cómo se comporta un derivado de Olmo 3 7B ajustado a código antes de invertir en variantes mayores o en FP16.
- Chat técnico de atención interna: como bot de soporte a desarrolladores sobre una base de conocimiento que quepa en el contexto, su coste de inferencia reducido permite mantenerlo siempre activo en una GPU modesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de validación son los del gate de conversión:

| Prueba | Resultado |
|---|---|
| Carga del modelo en llama-server | correcta |
| Separación system/user en la plantilla de chat | correcta |
| Cumplimiento de salida exacta en prompts estrictos | correcto |
| Finalización con finish_reason=stop | correcto |
| Fuga de pseudo-roles (/user, /assistant) | no detectada |
| Fuga de tokens de control de chat | no detectada |
| Fuga de etiquetas de thinking con razonamiento desactivado | no detectada |
| Aritmética básica | correcta |
| Tareas Python ejecutables | 3/3 (palíndromos, paréntesis balanceados, fusión de intervalos) |

Para benchmarks del modelo base puede consultarse el paper de Olmo 3 (arXiv 2512.13961), pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada en Q4_K_M (4,16 GiB de pesos): unos 5-7 GB con contexto moderado; la KV cache a 65K tokens puede elevar el consumo notablemente.
- VRAM estimada en Q8_0: alrededor de 8-9 GB.
- VRAM estimada en FP16/BF16: unos 14,6 GB solo para pesos, más KV cache.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para Q4 y Q8. Q4_K_M puede caber incluso en GPUs de 8 GB reduciendo la longitud de contexto.
- GPU profesionales: A100 40/80 GB y H100 para FP16 y lotes grandes; también válidas para servir Q4/Q8 con alta concurrencia.
- Opciones de despliegue: llama.cpp y llama-server (requiere `--chat-template-file chat-template-text-only.jinja`), Ollama importando el GGUF, LM Studio y llama-cpp-python. vLLM y TGI necesitan los pesos safetensors del modelo base, no el GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| Olmo-3-7B-Instruct-OPSA-Code-GGUF (este) | 7,3 B | 65K (heredado) | no declarada en el repositorio | GGUF, llama.cpp | no disponible |
| allenai/Olmo-3-7B-Instruct | 7,3 B | 65K | no confirmada en la información disponible (Ai2 publica Olmo como totalmente abierto) | safetensors en HuggingFace | paper arXiv 2512.13961 |
| Llama 3.1 8B Instruct | 8 B | 128K | Llama 3.1 Community License | safetensors y GGUF ampliamente disponibles | no disponible en esta ficha |
| Qwen2.5-Coder-7B-Instruct | 7,6 B | 32K nativos (128K con YaRN) | Apache 2.0 | safetensors y GGUF ampliamente disponibles | no disponible en esta ficha |

No hay datos de rendimiento comparativo publicados en la información disponible para el ajuste fino `OPSA-Code`, por lo que la comparación se limita a tamaño, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia no declarada en el repositorio: es un riesgo legal directo para uso comercial. Hay que verificar la licencia de `Tuwhy/Olmo-3-7B-Instruct-OPSA-Code` y del Olmo 3 de Ai2 antes de desplegarlo en producción.
- Sin soporte fiable de tool calling: la plantilla de reserva es solo de texto y no replica la plantilla de herramientas del checkpoint original.
- Idiomas no declarados: es probable un sesgo fuerte hacia el inglés, con rendimiento inferior en castellano u otras lenguas.
- Validación comunitaria prácticamente nula: el repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia externa de calidad más allá del smoke test del autor.
- Conversión de terceros: la única garantía de integridad es el hash SHA256 publicado; no hay auditoría independiente del proceso.
- Código generado sin auditar: las 3 tareas ejecutables son un smoke test mínimo, no una evaluación representativa; el código debe revisarse y probarse antes de usarse.
- Riesgo de alucinación propio de un modelo de 7B, especialmente en preguntas factuales y en contextos cercanos al límite de la ventana.
- Posible degradación en el extremo superior de los 65K tokens de contexto; conviene medir la calidad efectiva antes de cargar documentos muy largos.
- La información sobre el ajuste `OPSA-Code` (datos, método, epochs) no está disponible, lo que dificulta anticipar sesgos específicos del fine-tune.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ramgpt/Olmo-3-7B-Instruct-OPSA-Code-GGUF
- Modelo base del ajuste: https://huggingface.co/Tuwhy/Olmo-3-7B-Instruct-OPSA-Code
- Olmo 3 7B Instruct de Ai2: https://huggingface.co/allenai/Olmo-3-7B-Instruct
- Paper de Olmo 3: https://arxiv.org/abs/2512.13961
- Conversión GGUF relacionada (OPSA sin Code): https://huggingface.co/mradermacher/Olmo-3-7B-Instruct-OPSA-GGUF
- Ficha y requisitos de Olmo 3 7B Instruct: https://apxml.com/models/olmo-3-7b-instruct
- Guía local de Olmo 3 7B Instruct: https://localclaw.io/models/olmo3-7b-instruct
