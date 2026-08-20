# elbruno/s1-mini-onnx

## Resumen

s1-mini ONNX (INT4) es una conversión no oficial al formato ONNX del modelo `superwhisper/s1-mini`, un normalizador de transcripciones de voz a texto (ASR) de 596 millones de parámetros (0,6B), ajustado a partir de `Qwen/Qwen3-0.6B`. El modelo original fue desarrollado por el equipo de Superwhisper y la conversión ONNX la ha realizado Bruno Capuano (elbruno), Microsoft AI y .NET Advocate, para su uso con ONNX Runtime GenAI y la librería C# ElBruno.LocalLLMs.

El modelo no es un chatbot de propósito general: ejecuta una única tarea especializada, la limpieza de transcripciones ASR en minúsculas y sin puntuación, transformándolas en texto normalizado según una línea de control que especifica estilo, estructura y contexto. La conversión INT4 permite la inferencia en CPU con un peso de repositorio de 1,6 GB, lo que la hace viable en entornos sin GPU dedicada, un factor relevante para integraciones locales en aplicaciones .NET.

La relevancia de esta conversión radica en que abre la puerta a pipelines de voz completamente locales — reconocimiento de voz, normalización de transcripciones y generación de respuesta — sin dependencia de servicios en la nube, aprovechando el ecosistema de ONNX Runtime GenAI en aplicaciones C#.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-0.6B decoder-only (Qwen3ForCausalLM), 28 capas, GQA con 16 cabezas Q / 8 cabezas KV, head_dim 128, hidden_size 1024, vocab_size 151936, embeddings atados |
| Parametros totales | 596M (0,6B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (max_new_tokens recomendado: 1024) |
| Tipos de cuantizacion | INT4 (funcional en CPU); FP16 publicado pero no validado (roto en CPU con onnxruntime-genai 0.15.1) |
| Idiomas soportados | no disponible (el modelo base Qwen3-0.6B es multilingüe, pero la tarea de normalización ASR está orientada a transcripciones en inglés según los ejemplos) |
| Licencia | Apache-2.0 con cláusula de naming adicional (apache-2.0-with-naming-clause) |
| Formato de pesos | ONNX (safetensors del modelo original, conversión ONNX INT4 vía `onnxruntime_genai.models.builder`) |

## Arquitectura y entrenamiento

El modelo base es un decoder-only de la familia Qwen3 con 0,6B parámetros, 28 capas y atención con consulta agrupada (GQA) con 16 cabezas de consulta y 8 de clave/valor. El ajuste fino realizado por Superwhisper lo convierte en un normalizador de transcripciones ASR: recibe una línea de control seguida de la transcripción cruda en minúsculas y sin puntuación, y devuelve únicamente el texto limpio, sin explicaciones ni preámbulos.

Los datos de entrenamiento y el proceso exacto de ajuste no están disponibles en la información proporcionada. La conversión ONNX INT4 ha sido generada con la herramienta `onnxruntime_genai.models.builder` y está orientada a la ejecución en CPU con ONNX Runtime GenAI. El prompt del sistema debe incluirse textualmente tal y como se especifica en la model card, y la decodificación debe ser greedy (`do_sample=False`, `temperature` sin establecer, `max_new_tokens=1024`); el muestreo no está validado y puede degradar la calidad de la salida.

## Capacidades

- Normalización de transcripciones ASR: convierte texto crudo en minúsculas y sin puntuación en texto limpio con mayúsculas, puntuación y formato adecuados.
- Control de estilo, estructura y contexto mediante línea de control: soporta valores como `Styling: semi-formal|formal|casual`, `Structure: prose|lists` y `Context: general|email` (lista no exhaustiva).
- Salida únicamente de texto limpio, sin explicaciones ni preámbulos, lo que facilita la integración directa en pipelines de post-procesado.
- Compatible con el sistema de plantilla de chat de Qwen3, que emite un bloque vacío de `thinking` cuando se desactiva el modo de razonamiento (`enable_thinking=False`).
- No es un modelo de propósito general: no soporta tool calling, agentes, visión, audio ni razonamiento multi-paso.

## Casos de uso

- **Post-procesado de transcripciones en aplicaciones de voz a texto**: integrado como etapa posterior a un modelo ASR (por ejemplo Whisper), el modelo limpia la salida cruda para producir texto legible. Es adecuado porque su tarea única es exactamente esa y su tamaño reducido permite ejecutarlo en CPU.
- **Generación de correos electrónicos por voz**: con `Context: email` y `Styling: formal`, el modelo transforma dictados desordenados en texto estructurado apto para enviar como correo. Su capacidad de aplicar estilo y estructura lo hace idóneo para este escenario.
- **Transcripción de reuniones**: las transcripciones crudas de reuniones suelen contener muletillas y frases inconexas; el modelo las normaliza a prosa coherente con `Context: general` y `Structure: prose`, mejorando la legibilidad de actas y resúmenes.
- **Preparación de datos para entrenamiento de modelos**: el modelo puede limpiar grandes volúmenes de transcripciones ASR para crear datasets de entrenamiento de calidad, aplicando estilos consistentes.
- **Aplicaciones de voz en .NET con ElBruno.LocalLLMs**: la librería C# permite integrar el modelo con descarga automática en primera ejecución (`EnsureModelDownloaded = true`), facilitando el despliegue local en aplicaciones de escritorio o servidores sin GPU.
- **Pipelines de voz en tiempo real sin conexión**: combinado con STT, TTS y VAD locales, el modelo permite construir asistentes conversacionales completamente locales, sin dependencia de servicios en la nube, tal como demuestra el blog de El Bruno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo, dado que se trata de una conversión ONNX de un modelo especializado en normalización de transcripciones y no de un modelo de propósito general.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no requiere VRAM si se ejecuta en CPU; la conversión INT4 está orientada al execution provider universal de ONNX Runtime.
- **GPU recomendadas**: no hay recomendaciones específicas; el artefacto FP16 publicado no está validado para GPU y puede fallar en el execution provider de CPU.
- **CPU**: la variante INT4 es la única validada para CPU con onnxruntime-genai 0.15.1.
- **Opciones de despliegue**: ONNX Runtime GenAI, librería ElBruno.LocalLLMs (C#), compatible con Microsoft.Extensions.AI.
- **Latencia y throughput**: no se han publicado datos de rendimiento; el tamaño reducido (596M parámetros en INT4) sugiere una latencia moderada en CPU, pero no hay mediciones oficiales.
- **Espacio en disco**: el repositorio pesa 1,6 GB, por lo que se necesita al menos esa cantidad para la descarga e instalación.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| superwhisper/s1-mini | 596M | Normalizacion de transcripciones ASR | Safetensors (FP16/BF16) | Apache-2.0 con clausula de naming | Modelo original, requiere GPU o CPU con mayor coste |
| elbruno/s1-mini-onnx | 596M | Normalizacion de transcripciones ASR | ONNX INT4 (CPU) | Apache-2.0 con clausula de naming | Conversion no oficial para ONNX Runtime GenAI |
| Qwen/Qwen3-0.6B | 596M | Chat/razonamiento general | Safetensors | Apache-2.0 | Modelo base sin ajuste de normalizacion |

La comparativa directa con otros normalizadores de transcripciones ASR no esta disponible en la informacion publicada. La ventaja de esta conversion es la ejecucion en CPU con INT4 y la integracion en el ecosistema .NET.

## Limitaciones y advertencias

- **No es un modelo de chat**: no debe usarse para conversacion general, generacion de codigo ni otras tareas no relacionadas con la normalizacion de transcripciones.
- **FP16 roto en CPU**: la variante `fp16/` falla con un error de shape-mismatch en el optimizador de reutilizacion de buffers de ONNX Runtime 0.15.1 (nodo `repeat_kv` en la atencion GQA). Debe usarse la variante `int4/` para inferencia en CPU.
- **Fallo en `tokenizer.decode()`**: si la secuencia generada es vacia (caso legitimo, por ejemplo entrada de relleno puro que deberia normalizarse a nada), el decoder nativo de onnxruntime-genai falla con una division por cero. El codigo llamante debe proteger este caso y tratar la secuencia vacia como string vacio.
- **Muestreo no validado**: el modelo esta disenado para decodificacion greedy; usar sampling puede degradar la calidad y consistencia de la salida.
- **Restricciones de licencia**: la licencia Apache-2.0 incluye una clausula adicional de naming (naming clause) que restringe el uso del nombre del modelo; debe revisarse el texto completo de la licencia en el repositorio original antes de uso comercial.
- **Idiomas**: no se especifican oficialmente los idiomas soportados; los ejemplos muestran transcripciones en ingles. El uso en otros idiomas no esta validado.
- **Conversion no oficial**: el repositorio no esta avalado por Superwhisper; la conversion puede no estar alineada con futuras versiones del modelo original.
- **Riesgo de alucinacion**: aunque el modelo esta disenado para producir solo texto normalizado, puede introducir errores de puntuacion o contenido en transcripciones muy ruidosas; no se han publicado evaluaciones de tasa de error.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/elbruno/s1-mini-onnx
- Modelo original: https://huggingface.co/superwhisper/s1-mini
- Licencia del modelo original: https://huggingface.co/superwhisper/s1-mini/raw/main/LICENSE
- Repositorio ElBruno.LocalLLMs: https://github.com/elbruno/ElBruno.LocalLLMs
- Documentacion de modelos soportados: https://github.com/elbruno/ElBruno.LocalLLMs/blob/main/docs/supported-models.md
- Perfil de elbruno en Hugging Face: https://huggingface.co/elbruno/models
- Blog de El Bruno: https://elbruno.com/
- Articulo sobre conversaciones de voz en tiempo real en .NET: https://elbruno.com/2026/03/02/%F0%9F%8E%99%EF%B8%8F%F0%9F%A4%96-real-time-ai-conversations-in-net-local-stt-tts-vad-and-llm-no-cloud-required/
- ONNX Runtime GenAI: https://github.com/microsoft/onnxruntime-genai
