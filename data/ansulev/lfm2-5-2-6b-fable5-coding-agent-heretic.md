# ansulev/lfm2.5-2.6b-fable5-coding-agent-heretic

## Resumen

El modelo `ansulev/lfm2.5-2.6b-fable5-coding-agent-heretic` es una variante "decensored" (abliterada) del modelo `AyoubChLin/lfm2.5-2.6b-fable5-coding-agent`, que a su vez es un ajuste fino supervisado (full-parameter SFT) de `LiquidAI/LFM2.5-2.6B` sobre el dataset `saidutta69/fable-5-premium`. La abliteración se ha realizado con la herramienta Heretic v1.4.0, que aplica una ablación direccional sobre los pesos responsables del comportamiento de rechazo, en lugar de reentrenar el modelo.

El resultado es un agente de codificación compacto de 2.6B parámetros con arquitectura híbrida LFM2 (convolución + atención), ventana de contexto de 128K tokens y soporte nativo de tool calling, pero sin los guardrails de rechazo del modelo base. La intervención consigue reducir los rechazos de 96/100 a 7/100 con una divergencia KL de solo 0.014 respecto al modelo original, lo que indica que las capacidades de generación de código, uso de herramientas y seguimiento de instrucciones se mantienen prácticamente intactas.

Es relevante ahora porque ofrece una alternativa ligera y ejecutable en hardware de consumo para desarrolladores que necesitan un agente de codificación sin restricciones de seguridad, manteniendo la arquitectura híbrida de Liquid AI que combina bloques de atención con bloques de convolución para una inferencia más rápida. No es una mejora de capacidades sobre el modelo base: es el mismo modelo con los guardrails de rechazo eliminados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 híbrida: 22 bloques de convolución corta con doble compuerta (LIV) + 8 bloques de Grouped-Query Attention (GQA) |
| Parametros totales | 2.697.198.592 (2.6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | GGUF: F16, Q2_K, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_0, Q4_1, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0. También safetensors en BF16 |
| Idiomas soportados | Inglés |
| Licencia | LFM Open License v1.0 (otra) |
| Formato de pesos | Safetensors (BF16) y GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura LFM2 es híbrida: combina 22 bloques de convolución corta de doble compuerta (denominados LIV) con 8 bloques de atención por grupos de consultas (GQA). Esta mezcla permite un equilibrio entre la eficiencia computacional de las convoluciones y la capacidad de capturar dependencias de largo alcance de la atención, lo que resulta especialmente adecuado para cargas de trabajo agénticas con contexto largo (128K tokens).

El modelo base `LiquidAI/LFM2.5-2.6B` fue entrenado por Liquid AI para tareas de agentes, con tool calling nativo y optimización para inferencia en dispositivos. Posteriormente, `AyoubChLin` realizó un SFT de parámetros completos sobre el dataset `saidutta69/fable-5-premium`, ajustando el modelo para un comportamiento más conversacional y orientado a código. Finalmente, el autor de este modelo aplicó abliteración con Heretic v1.4.0, una técnica que identifica y edita las direcciones de los pesos responsables del rechazo (en las proyecciones de salida de atención y en las down-projections del MLP), eliminando el comportamiento de rechazo sin tocar el resto de la red. La divergencia KL resultante de 0.014 confirma que la edición es mínima y quirúrgica.

## Capacidades

- Generación de código y razonamiento técnico: puede escribir, explicar y depurar código en varios lenguajes, con especial foco en Python.
- Tool calling / function calling nativo: el modelo está entrenado para emitir llamadas a herramientas de forma estructurada, integrándose en pipelines de agentes.
- Comportamiento agéntico multi-paso: capaz de mantener conversaciones multi-turno y ejecutar secuencias de acciones con contexto largo (128K).
- Conversación asistente: formato de chat con system prompt y mensajes de usuario/asistente.
- Sin modo de pensamiento explícito: no se menciona un modo "thinking" separado.
- Sin capacidades multimodales: solo texto.
- Monolingüe: entrenado exclusivamente en inglés; no se garantiza rendimiento en otros idiomas.

## Casos de uso

- Asistente de codificación local sin restricciones: desarrolladores que necesitan un modelo compacto que pueda ejecutarse en un portátil con GPU y que no rechace preguntas sobre código potencialmente sensible (explotación, análisis de malware, etc.). La ventana de 128K permite mantener el contexto completo de un repositorio.
- Agente autónomo en pipelines de CI/CD: el tool calling nativo permite que el modelo invoque funciones como `run_test`, `git_commit` o `deploy` dentro de un pipeline de integración continua, automatizando tareas de revisión y corrección de código.
- Generación de scripts de automatización y administración de sistemas: puede escribir scripts de bash, PowerShell o Python para tareas de administración, sin rechazar peticiones de automatización de tareas sensibles.
- Asistente de investigación en ciberseguridad: análisis de código malicioso, generación de payloads de prueba, o ingeniería inversa de binarios, donde el modelo base rechazaría parte de las peticiones.
- Chatbot de soporte técnico con acceso a herramientas: en un entorno de atención al cliente, el modelo puede llamar a APIs de documentación, bases de conocimiento o sistemas de ticketing para resolver incidencias técnicas.
- Prototipado rápido de agentes de IA en dispositivos edge: al ser de 2.6B parámetros y caber en cuantizaciones GGUF de 1-2 GB, se puede desplegar en Raspberry Pi, teléfonos o dispositivos embebidos para agentes de codificación locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo proporciona métricas de la abliteración (KL divergencia 0.014, rechazos reducidos de 96/100 a 7/100), pero no datos de MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- **VRAM estimada**: según cuantización, desde ~1 GB (Q2_K) hasta ~5 GB (F16). La Q4_K_M (recomendada) ocupa 1.56 GB, por lo que cabe en cualquier GPU moderna con 4 GB o más.
- **GPUs recomendadas**: RTX 3060 12 GB, RTX 4070, RTX 4090, A100/H100 para inferencia en BF16 con Transformers. Para GGUF, cualquier GPU con soporte Vulkan/CUDA de 4 GB es suficiente.
- **Consumer GPU**: sí, cabe en GPUs de gama de entrada (ex.: GTX 1650 4GB con Q4_K_M) y en hardware integrado con suficiente RAM compartida.
- **Opciones de despliegue**: llama.cpp (con `llama serve`), Ollama (`ollama run`), LM Studio, Transformers (vía `AutoModelForCausalLM`), y servidores de inferencia compatibles con GGUF como llama-server.
- **Latencia y throughput**: no se proporcionan datos específicos. Al ser un modelo denso de 2.6B con arquitectura híbrida, se espera una latencia de entre 20-60 tokens/s en GPU consumer con cuantización Q4_K_M, y algo menos en CPU. En una A100 se puede alcanzar varios cientos de tokens/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling | Licencia | Guardrails |
|---|---|---|---|---|---|
| **lfm2.5-2.6b-fable5-coding-agent-heretic** | 2.6B | 128K | Sí | LFM Open v1.0 | Sin rechazo (abliterado) |
| **LiquidAI/LFM2.5-2.6B** | 2.6B | 128K | Sí | LFM Open v1.0 | Con rechazos |
| **AyoubChLin/lfm2.5-2.6b-fable5-coding-agent** | 2.6B | 128K | Sí | LFM Open v1.0 | Con rechazos |
| **Qwen2.5-Coder-3B** | 3B | 32K | No nativo | Apache 2.0 | Con rechazos |

El modelo heretic se diferencia de sus alternativas en la eliminación de guardrails de seguridad. Mantiene la misma arquitectura y contexto que el base de Liquid AI, pero añade el ajuste SFT sobre fable-5-premium (que mejora el comportamiento conversacional y de codificación) y la abliteración. Qwen2.5-Coder-3B es el competidor más cercano en tamaño y capacidades de código, pero no soporta tool calling nativo y tiene una licencia más permisiva (Apache 2.0).

## Limitaciones y advertencias

- **Sin guardrails de seguridad**: el modelo cumple peticiones que el modelo base rechazaría, incluida la generación de contenido malicioso. No hay filtro de seguridad superpuesto; el autor declina explícitamente responsabilidad sobre el uso.
- **Riesgo de alucinación**: como todo modelo de 2.6B, puede generar código o explicaciones incorrectas, especialmente en tareas de razonamiento complejo o con contexto muy largo.
- **Monolingüe**: solo inglés; el rendimiento en otros idiomas es no probado y probablemente deficiente.
- **Licencia restrictiva**: la LFM Open License v1.0 puede imponer restricciones de uso comercial; hay que revisar los términos exactos antes de desplegarlo en producción.
- **Sin benchmarks**: no hay datos de rendimiento comparativo publicados, por lo que es difícil evaluar su calidad real frente a alternativas.
- **Edición de pesos**: la abliteración con Heretic modifica los pesos de forma direccional; aunque la KL divergencia es baja, podría introducir degradaciones sutiles en casos límite no detectados.

## Enlaces

- [Página del modelo en HuggingFace](https://huggingface.co/ansulev/lfm2.5-2.6b-fable5-coding-agent-heretic)
- [Modelo base (SFT)](https://huggingface.co/AyoubChLin/lfm2.5-2.6b-fable5-coding-agent)
- [Modelo base original (LiquidAI)](https://huggingface.co/LiquidAI/LFM2.5-2.6B)
- [Documentación de LFM2.5-2.6B en Liquid AI](https://docs.liquid.ai/lfm/models/lfm25-2.6b)
- [Herramienta Heretic (GitHub)](https://github.com/p-e-w/heretic)
- [Blog sobre abliteración](https://huggingface.co/blog/mlabonne/abliteration)
- [Dataset fable-5-premium](https://huggingface.co/datasets/saidutta69/fable-5-premium)
