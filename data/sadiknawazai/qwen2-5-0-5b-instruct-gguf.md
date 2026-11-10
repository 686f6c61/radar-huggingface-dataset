# SadikNawazAI/Qwen2.5-0.5B-Instruct-GGUF

## Resumen

Qwen2.5-0.5B-Instruct-GGUF es una conversion al formato GGUF del modelo Qwen2.5-0.5B-Instruct desarrollado por el equipo Qwen de Alibaba Cloud. Se trata de la variante mas pequena de la familia Qwen2.5, con aproximadamente 494 millones de parametros, disenada para tareas de conversacion, clasificacion y resumen de texto corto en entornos con recursos muy limitados. El repositorio lo publica el usuario SadikNawazAI como espejo del build oficial de Ollama (`qwen2.5:0.5b`), extraido directamente del manifest de la libreria de Ollama.

El modelo emplea una arquitectura transformer densa tipo Qwen2 con 24 capas, dimension oculta de 896, 14 cabezas de atencion y 2 cabezas KV (GQA), con una ventana de contexto de 32.768 tokens y un vocabulario de 151.936 tokens BPE. Su relevancia actual radica en que es uno de los modelos de chat de proposito general mas pequenos que mantiene conversaciones coherentes, lo que permite ejecutarlo en navegador, movil o como modelo borrador (draft model) en esquemas de decodificacion especulativa.

La cuantizacion disponible es Q4_K_M, con un peso de aproximadamente 4,8 bits por parametro y un tamano de archivo de 379 MiB, lo que lo hace adecuado para despliegues en dispositivos de consumo, entornos embebidos y pipelines de bajo coste donde un modelo mayor seria inviable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso Qwen2 (`qwen2`), 24 capas, hidden 896, 14 heads / 2 KV heads (GQA), FFN 4864 |
| Parametros totales | 494.032.768 (~494M) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Q4_K_M (~4,8 bits/peso); otras cuantizaciones del modelo base no incluidas en este repo |
| Idiomas soportados | en, zh, multilingual (calidad notablemente superior en ingles y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (version 3); pesos originales en safetensors en el modelo base |
| Vocabulario | 151.936 tokens (BPE estilo GPT-2, pre-tokenizer Qwen2) |
| Plantilla de chat | Qwen2.5 ChatML (embebida en el GGUF) |
| Tamano del archivo | 397.807.936 B (~379 MiB) |
| SHA-256 | `c5396e06af294bd101b30dce59131a76d2b773e76950acc870eda801d3ab0515` |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-0.5B-Instruct es un transformer decoder-only denso con atencion de consultas agrupadas (GQA), usando 14 cabezas de atencion y 2 cabezas KV, lo que reduce el coste de memoria de la cache KV durante la inferencia. Incorpora normalizacion RMSNorm, activacion SwiGLU en la FFN y embeddings de posicion rotatorios (RoPE). La ventana de contexto nativa es de 32.768 tokens, aunque el modelo card advierte que en la practica no realiza razonamiento de contexto largo.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. El modelo base es instruction-tuned y su plantilla de chat es ChatML de Qwen2.5. Esta publicacion concreta no anade entrenamiento adicional: es una conversion de pesos a GGUF realizada mediante la toolchain de Ollama, por lo que las innovaciones tecnicas se limitan a las del modelo original y a la cuantizacion Q4_K_M para reducir el espacio en disco y la memoria necesaria.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla ChatML.
- Clasificacion de texto y extraccion de informacion en frases cortas.
- Resumen de textos breves.
- Generacion de codigo basica y resolucion de matematicas simples (calidad limitada por el tamano).
- Capacidades multilingues, con mejor rendimiento en ingles y chino.
- Uso como modelo borrador (draft model) en decodificacion especulativa junto a modelos mayores de la familia Qwen.
- No soporta de forma fiable tool calling ni function calling.
- No soporta razonamiento agente multi-paso ni modo thinking.
- No dispone de vision ni audio.

## Casos de uso

- Asistente conversacional en dispositivos moviles o navegador: con 379 MiB en Q4_K_M y contexto configurable, puede ejecutarse en telefonos y en el navegador mediante llama.cpp compilado a WebAssembly, gestionando conversaciones cotidianas de baja complejidad.
- Clasificacion y etiquetado de texto en pipelines de bajo coste: util para categorizar tickets, correos o comentarios en lotes grandes donde el coste por token de un modelo mayor seria prohibitivo, ajustando temperatura baja para mayor determinismo.
- Resumen de textos cortos en sistemas embebidos: integrable en dispositivos con poca RAM (Raspberry Pi, routers, wearables) para condensar notas o mensajes antes de enviarlos a un modelo mayor.
- Modelo borrador en decodificacion especulativa: al compartir vocabulario y tokenizer con el resto de la familia Qwen2.5, puede actuar como draft model para acelerar la generacion de variantes mayores (7B, 14B) en vLLM o llama.cpp.
- Prototipado rapido de aplicaciones de chat: permite validar plantillas de prompt, flujos de conversacion y plantillas ChatML en local antes de migrar a modelos mayores, con arranque en segundos.
- Filtrado y preprocesado previo a un LLM mayor: uso como primera etapa para descartar consultas triviales, reformular preguntas o generar metadatos antes de invocar un modelo de mayor capacidad, reduciendo coste total.
- Educacion y demostraciones: ejecutable en un portatil sin GPU dedicada, sirve para ensenar conceptos de cuantizacion, plantillas de chat y despliegue local con Ollama o llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-0,8 GB en Q4_K_M, incluyendo cache KV para contextos moderados (4.096 tokens); con contexto completo de 32.768 tokens la cache KV crece y puede requerir 1-2 GB adicionales.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; funciona en GTX 1050, RTX 3050, RTX 4090, A100 y H100 sin aprovechar su capacidad.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer e incluso en CPU.
- Tambien se ejecuta en CPU pura y en dispositivos ARM (telefonos, Raspberry Pi).
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-cpp-python`), Ollama (`ollama run hf.co/SadikNawazAI/Qwen2.5-0.5B-Instruct-GGUF:Q4_K_M`), y el modelo base via Transformers. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones; para esos motores se recomienda usar los pesos safetensors originales.
- Latencia y throughput: no disponibles en la informacion proporcionada; en CPU moderna se espera una generacion interactiva (decenas de tokens por segundo) dado el reducido tamano.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---:|---|---|---|
| Qwen2.5-0.5B-Instruct (este, GGUF) | ~494M | 32.768 | Apache 2.0 | GGUF Q4_K_M | Build de Ollama, ~379 MiB |
| Qwen2.5-1.5B-Instruct | ~1.500M | 32.768 | Apache 2.0 | safetensors / GGUF | Mayor calidad, ~3x parametros, requiere mas memoria |
| Llama 3.2 1B Instruct | ~1.200M | 128.000 | Llama 3.2 Community License | safetensors / GGUF | Contexto mayor, licencia con restricciones de uso |
| SmolLM2-360M-Instruct | ~360M | 8.192 | Apache 2.0 | safetensors / GGUF | Aun mas pequeno, contexto menor, calidad inferior en chino |

Los datos de rendimiento comparativo no estan disponibles en la informacion proporcionada; la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Con 494M de parametros, el conocimiento del mundo es superficial y produce errores factuales con frecuencia.
- Rendimiento debil en matematicas y generacion de codigo; no apto para tareas que requieran precision.
- Aunque la ventana es de 32.768 tokens, en la practica no realiza razonamiento de contexto largo ni tool use fiable.
- La calidad multilingue es notablemente inferior fuera de ingles y chino; el autor advierte que la salida en hinglish y urdu es limitada y debe verificarse.
- No esta ajustado para seguridad en consejos de alto riesgo (medicos, legales, financieros); requiere verificacion humana.
- Riesgo de alucinacion elevado en preguntas abiertas; no usar como fuente de verdad sin validacion.
- Licencia Apache 2.0 permite uso comercial, pero los pesos originales son propiedad de Alibaba Cloud (equipo Qwen); conviene conservar los avisos de atribucion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un espejo no oficial del build de Ollama, por lo que la trazabilidad depende de la cadena de procedencia indicada por el autor.
- No se recomienda como unico modelo en produccion para tareas criticas; su valor esta en el coste, el tamano y el uso como componente auxiliar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SadikNawazAI/Qwen2.5-0.5B-Instruct-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Cuantizacion alternativa (bartowski): https://huggingface.co/bartowski/Qwen2.5-0.5B-Instruct-GGUF
- Ollama (build de origen): https://ollama.com/library/qwen2.5
- llama.cpp: https://github.com/ggerganov/llama.cpp
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python
