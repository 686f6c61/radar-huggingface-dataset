# Lysandra999/Senik-MiniCPM5-2B-GGUF

## Resumen

Senik-MiniCPM5-2B-GGUF es un ajuste fino (finetune) del modelo denso openbmb/MiniCPM5-2B, publicado por el usuario Lysandra999 (atribuido en la model card a Nikolas Perez) dentro de la denominada "Senik AI Family". El modelo conserva la arquitectura y el tamaño del base: 2.516.756.480 parámetros totales (aproximadamente 2,5B) y una ventana de contexto declarada de 128K tokens. Se distribuye exclusivamente en formato GGUF, cuantizado, para su uso con llama.cpp y entornos de inferencia local.

La propuesta del autor no es mejorar el rendimiento general del base, sino inyectar una identidad de personaje ("identity lock"), ganchos expresivos de tipo `[emotion:TAG]` y conciencia de familia multi-modelo, orientados a asistentes conversacionales con personalidad fija. La model card reporta una comparativa head-to-head de 31 pruebas ejecutadas en BF16 sobre una NVIDIA L4, en la que el finetune pasa de 12/31 (38,7%) en el base a 30/31 (96,8%) sin system prompt y 29/31 (93,5%) con el system prompt de Senik.

Es relevante ahora por dos motivos: la ventana de 128K en un modelo de 2,5B que cabe en GPUs de consumo y en dispositivos edge como Jetson Orin Nano, y la licencia Apache 2.0, que permite uso comercial sin restricciones adicionales. No obstante, el repositorio no registra descargas ni interacciones en el momento de la consulta y no hay documentación de entrenamiento publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de openbmb/MiniCPM5-2B); detalles internos no disponibles |
| Parametros totales | 2.516.756.480 (aprox. 2,5B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens (declarado en la model card) |
| Tipos de cuantizacion | Q4_K_M y Q8_0 (únicas variantes publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); no se publican safetensors del finetune |

## Arquitectura y entrenamiento

El modelo es un finetune del denso openbmb/MiniCPM5-2B, por lo que hereda su arquitectura transformer y su ventana de contexto de 128K tokens. El autor no documenta la arquitectura interna del base (número de capas, dimensión oculta, mecanismo de atención, tokenizador) ni innovaciones técnicas propias; la información disponible se limita a la etiqueta "dense" y al recuento de parámetros verificado en safetensors del modelo base.

Tampoco se publican datos sobre el proceso de ajuste: no se indica el número de tokens de entrenamiento, la composición del dataset, si se emplearon técnicas de RLHF, DPO o SFT, ni la composición exacta del system prompt de identidad. La única evidencia empírica aportada es la comparativa de 31 pruebas en BF16 sobre NVIDIA L4, que incluye evaluación de identidad, resistencia a override de persona, razonamiento con ejecución de Python, recuperación en contexto de 8K tokens (needle-in-a-haystack) y tool calling en XML con abstención. Los resultados de esa comparativa se recogen en la sección de benchmarks.

## Capacidades

- Generación de texto conversacional en inglés con una identidad de personaje fijada por el autor ("identity lock").
- Razonamiento de varios pasos y resolución de problemas, según la suite de evaluación del autor.
- Generación y ejecución de código Python: la comparativa incluye pruebas con `exec()` real.
- Recuperación en contexto largo: la model card reporta una prueba needle-in-a-haystack con 8K tokens; el contexto declarado es de 128K.
- Tool calling nativo en formato XML, con capacidad de abstención cuando no procede invocar herramienta.
- Ganchos expresivos `[emotion:TAG]` para controlar la expresión del asistente en la respuesta.
- Conciencia de familia multi-modelo (referencias a otros modelos de la familia Senik).
- Resistencia parcial a intentos de override de la persona (5/6 y 4/6 en las pruebas del autor).
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- Asistentes conversacionales con personalidad fija: el finetune mantiene una identidad estable a lo largo de conversaciones multi-turno, lo que lo hace adecuado para personajes de marca o compañeros virtuales donde la consistencia de voz y tono es un requisito de producto.
- Despliegue en dispositivos edge: con la cuantización Q4_K_M (1488,99 MiB) cabe en placas como Jetson Orin Nano y en portátiles sin GPU dedicada, permitiendo asistentes locales sin conexión.
- Procesamiento de documentos largos en local: la ventana de 128K tokens permite resumir o extraer información de contratos, informes o transcripciones extensas en una sola pasada, sin enviar datos a la nube.
- Agentes con tool calling: el soporte de invocación de herramientas en XML y la capacidad de abstención permiten construir agentes que consultan APIs o bases de datos y que evitan llamadas innecesarias.
- Automatización de tareas de código en local: la generación de Python y la evaluación con `exec()` real lo hacen utilizable en scripts de análisis o transformación de datos dentro de pipelines internos.
- Chat de atención al cliente con contexto largo: puede mantener el hilo de una conversación con historial extenso y documentación de producto adjunta, manteniendo el rol asignado.
- Prototipado rápido con llama.cpp: al distribuirse solo en GGUF, se integra directamente en Ollama, llama.cpp o servidores compatibles con la API de OpenAI, lo que reduce el tiempo de puesta en marcha.

## Benchmarks y rendimiento

Los únicos datos disponibles son los de la comparativa del autor, ejecutada en BF16 sobre NVIDIA L4 con 31 pruebas retenidas. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Suite de evaluación | Base openbmb/MiniCPM5-2B | Senik (sin system prompt) | Senik (con system prompt) |
|---|---|---|---|
| Identidad y ground truth (10) | 2/10 | 10/10 | 10/10 |
| Anti-override y bloqueo de persona (6) | 1/6 | 5/6 | 4/6 |
| Razonamiento, Python `exec()` y needle 8K (10) | 5/10 | 10/10 | 10/10 |
| Tool calling XML nativo y abstención (5) | 4/5 | 5/5 | 5/5 |
| Total (31 pruebas) | 12/31 (38,7%) | 30/31 (96,8%) | 29/31 (93,5%) |

Estos resultados miden principalmente el ajuste de identidad y no deben interpretarse como una mejora general del modelo base en capacidades cognitivas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,5 GB para Q4_K_M y 2,5 GB para Q8_0, más el espacio de caché KV correspondiente al contexto configurado.
- GPU recomendadas: NVIDIA L4 (usada en la evaluación del autor), A100 o H100 para despliegues de mayor concurrencia; RTX 4090 o RTX 3090 para uso individual con contexto largo.
- GPU de consumo: sí, cabe en cualquier GPU con 4 GB o más de VRAM en Q4_K_M, y en CPU con suficiente RAM.
- Edge: el autor recomienda explícitamente Jetson Orin Nano para Q4_K_M.
- Opciones de despliegue: llama.cpp, Ollama y servidores compatibles con la API de OpenAI (el repositorio incluye la etiqueta `endpoints_compatible`); no se mencionan vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles. El tamaño reducido y la cuantización Q4_K_M sugieren latencias bajas en hardware de consumo, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Senik-MiniCPM5-2B-GGUF | 2,5B | 128K | Apache 2.0 | GGUF | Finetune de identidad; sin benchmarks estándar publicados |
| openbmb/MiniCPM5-2B (base) | 2,5B | 128K | no disponible en la información | safetensors y otros | Modelo de referencia del finetune; 12/31 en la suite del autor |
| Lysandra999/Senik-Quantum-1.7B-GGUF | 1,7B | no disponible | no disponible en la información | GGUF | Mismo autor; cerebro edge insignia de la familia |
| Lysandra999/Mini-Senik-0.8B-Agent-GGUF | 0,8B | no disponible | no disponible en la información | GGUF | Mismo autor; orientado a agentes con tool calling |

No se dispone de datos suficientes para comparar con alternativas de otros desarrolladores de la misma categoría (por ejemplo, modelos densos de 2B a 3B con contexto largo), por lo que la comparativa se limita al ecosistema del autor y al modelo base.

## Limitaciones y advertencias

- El repositorio no registra descargas ni interacciones, y no hay documentación del proceso de entrenamiento ni del dataset utilizado.
- Los benchmarks publicados son internos, de 31 pruebas y diseñados por el propio autor; no son comparables con evaluaciones estándar de la industria.
- El modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está evaluado.
- El ajuste de identidad puede incrementar el riesgo de respuestas rígidas o de personaje fuera de contexto en aplicaciones donde no se desea una persona fija.
- Riesgo de alucinación inherente a un modelo de 2,5B, especialmente en tareas de conocimiento factual y en contextos muy largos.
- La ventana de 128K es una capacidad declarada; la prueba de recuperación publicada solo alcanza 8K tokens, por lo que el rendimiento efectivo en contextos muy largos no está verificado.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base openbmb/MiniCPM5-2B, no detalladas en la información disponible.
- Los ganchos `[emotion:TAG]` requieren un consumidor que los interprete; en clientes genéricos aparecerán como texto literal en la respuesta.
- El formato GGUF limita el uso a llama.cpp y compatible; no hay pesos safetensors del finetune publicados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Lysandra999/Senik-MiniCPM5-2B-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Senik-Quantum-1.7B-GGUF: https://huggingface.co/Lysandra999/Senik-Quantum-1.7B-GGUF
- Mini-Senik-0.8B-Agent-GGUF: https://huggingface.co/Lysandra999/Mini-Senik-0.8B-Agent-GGUF
- Mini-Senik-0.3B-GGUF: https://huggingface.co/Lysandra999/Mini-Senik-0.3B-GGUF
- Senik-Kokoro-82M: https://huggingface.co/Lysandra999/Senik-Kokoro-82M
- Senik-Ming-3.0-TTS-0.5B: https://huggingface.co/Lysandra999/Senik-Ming-3.0-TTS-0.5B
- Senik-Whisper-Small: https://huggingface.co/Lysandra999/Senik-Whisper-Small
