# axteam/Nanbeige4.3-33B-GGUF

## Resumen

Nanbeige4.3-33B-GGUF es una cuantización en formato GGUF del modelo base Nanbeige4.3-33B, publicada por el usuario axteam en Hugging Face. El modelo original procede de Nanbeige, y esta versión cuantizada permite ejecutar el modelo de 33 mil millones de parámetros en hardware de consumo mediante llama.cpp, Ollama o LM Studio, sin necesidad de GPUs de gama datacenter.

El repositorio incluye dos cuantizaciones: Q4_K_M (20,1 GB, recomendada como equilibrio entre tamaño y calidad) y Q8_0 (35,2 GB, la más fiel a los pesos originales BF16). La cuantización es post-training (PTQ), realizada con las herramientas de llama.cpp, sin reentrenamiento, y cada archivo incorpora la plantilla de chat original del modelo.

La relevancia de esta ficha radica en la disponibilidad de un modelo denso de 33B bajo licencia Apache 2.0 en formato GGUF, lo que facilita su despliegue local y su integración en pipelines que requieren inferencia offline o de bajo coste. No se dispone de la model card original del modelo base, por lo que varios datos técnicos (arquitectura detallada, datos de entrenamiento, benchmarks) no están disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (no disponible detalle exacto) |
| Parámetros totales | 33.118.977.024 (~33B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card (los ejemplos usan 8192 tokens) |
| Tipos de cuantización | Q4_K_M (20,1 GB), Q8_0 (35,2 GB); pesos originales en BF16 |
| Idiomas soportados | No disponible (los ejemplos de la model card incluyen coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (original en safetensors BF16) |

## Arquitectura y entrenamiento

Se trata de un modelo denso de 33 mil millones de parámetros (33.118.977.024 según los metadatos de safetensors), del cual no se ha publicado información detallada sobre su arquitectura interna, número de capas, dimensiones ocultas ni mecanismos de atención específicos. Los ejemplos de la model card sugieren compatibilidad con plantillas de chat Jinja y con la API de chat de llama.cpp.

La cuantización publicada por axteam es de tipo post-training (PTQ): los pesos BF16 originales se convierten a k-quants de llama.cpp mediante `convert_hf_to_gguf.py` y `llama-quantize`, con escalas por bloque y asignación mixta de bits, sin ningún reentrenamiento ni ajuste fino posterior. No hay datos disponibles sobre el corpus de entrenamiento, el número de tokens, ni si el modelo base pasó por RLHF, DPO u otras etapas de alineación.

## Capacidades

- Generación de texto conversacional (etiquetado como `text-generation` y `conversational` en Hugging Face).
- Plantilla de chat original embebida en cada archivo GGUF, compatible con el modo conversacional de llama.cpp (`-cnv`).
- Servible mediante API compatible con OpenAI a través de `llama-server`.
- Ejecución local en CPU y GPU mediante llama.cpp, Ollama y LM Studio.
- Soporte de KV-cache cuantizada en tiempo de ejecución (`--cache-type-k q8_0 --cache-type-v q8_0` con flash attention), que reduce la memoria dedicada al contexto.
- No hay información publicada sobre tool calling, capacidades de visión/audio ni modos de razonamiento específicos.

## Casos de uso

- Chatbots locales y privados: al ser un modelo conversacional en GGUF, puede desplegarse íntegramente en local con `llama-server` u Ollama, garantizando que ningún dato salga de la infraestructura propia.
- Prototipado en estación de trabajo: con la cuantización Q4_K_M (20,1 GB) cabe en GPUs de consumo con 24 GB de VRAM (RTX 3090/4090), ideal para pruebas y desarrollo de aplicaciones sobre LLMs.
- Backends de inferencia de bajo coste: la API compatible con OpenAI de `llama-server` permite sustituir llamadas a APIs comerciales por inferencia local en servidores modestos.
- Integración en LM Studio para usuarios técnicos no especializados en CLI: basta buscar el repositorio en el navegador de modelos y descargar la cuantización deseada.
- Procesamiento por lotes en CPU: para tareas offline de generación de texto donde la latencia no es crítica, puede ejecutarse en CPU con suficiente RAM (32 GB o más para Q4_K_M).
- Experimentación con cuantizaciones: al ofrecer Q4_K_M y Q8_0, permite comparar la degradación de calidad entre 4 y 8 bits en casos de uso concretos antes de decidir la configuración de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Q4_K_M (20,1 GB): cabe en GPUs de 24 GB de VRAM (RTX 3090, RTX 4090) dejando margen para el KV-cache; con contexto de 8192 tokens y KV-cache en q8_0 el consumo adicional es reducido.
- Q8_0 (35,2 GB): requiere GPU con 40 GB o más (A100 40GB ajustado, A100 80GB, H100) o bien ejecución parcial/total en CPU con al menos 40-48 GB de RAM.
- Ejecución en CPU: viable con Q4_K_M en equipos con 32 GB de RAM, con throughput bajo (varios tokens/segundo según CPU).
- Despliegue soportado: llama.cpp (`llama-server`, `llama-cli`), Ollama (`ollama run hf.co/axteam/Nanbeige4.3-33B-GGUF:Q4_K_M`) y LM Studio.
- Comando recomendado de servidor: `llama-server -hf axteam/Nanbeige4.3-33B-GGUF:Q4_K_M -c 8192 --jinja`, opcionalmente con `--cache-type-k q8_0 --cache-type-v q8_0 -fa on` para reducir memoria del KV-cache.
- Latencia y throughput: no disponibles cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Contexto | Notas |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-GGUF | ~33B (denso) | GGUF (Q4_K_M, Q8_0) | Apache 2.0 | No disponible (ejemplos con 8192) | Cuantización de terceros (axteam) |
| Qwen2.5-32B-Instruct-GGUF | ~32B (denso) | GGUF (múltiples quants) | Apache 2.0 (Qwen) / Qwen Research | 128K | Amplio ecosistema, multilingüe (29+ idiomas) |
| Gemma 2 27B (GGUF) | ~27B (denso) | GGUF | Gemma Terms of Use | 8K | Restricciones de licencia más estrictas que Apache 2.0 |
| Yi-1.5-34B-Chat (GGUF) | ~34B (denso) | GGUF | Apache 2.0 | 32K (extendible a 128K) | Tamaño similar, buen rendimiento bilingüe chino-inglés |

Frente a estas alternativas, Nanbeige4.3-33B-GGUF destaca por su licencia Apache 2.0 sin restricciones, aunque carece de la documentación, benchmarks y ecosistema de las alternativas citadas.

## Limitaciones y advertencias

- La model card original del modelo base no está disponible en la información proporcionada: no se conocen datos de entrenamiento, alineación (RLHF/DPO), idiomas soportados ni contexto máximo real, lo que complica evaluar su idoneidad para producción.
- Al tratarse de una cuantización de terceros (axteam), la calidad de la conversión depende de este repositorio y no del equipo original de Nanbeige; el número de descargas (114) indica un uso muy reducido y poco verificado por la comunidad.
- La cuantización Q4_K_M implica pérdida de precisión respecto a los pesos BF16 originales, especialmente perceptible en razonamiento complejo, matemáticas y código.
- No hay benchmarks publicados, por lo que no es posible comparar objetivamente su calidad con modelos alternativos.
- Riesgo de alucinación inherente a cualquier LLM; al no conocer el proceso de alineación del modelo base, este riesgo no puede cuantificarse.
- Posible sesgo hacia idiomas presentes en su entrenamiento (los ejemplos de la model card incluyen coreano, lo que sugiere soporte multilingüe asiático, pero no está confirmado).
- La licencia Apache 2.0 del modelo base y de la cuantización permite uso comercial sin restricciones relevantes, aunque los pesos originales y el tokenizador pertenecen a Nanbeige.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/axteam/Nanbeige4.3-33B-GGUF
- Modelo base original: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai

No se han encontrado enlaces a papers, blogs oficiales ni demos en la información disponible.
