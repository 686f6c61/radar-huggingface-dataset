# ShivanshiNigam/loglens-vllm-ready

## Resumen

LogLens AI es un modelo de lenguaje causal a medida desarrollado por Shivanshi Nigam para el análisis de logs de producción. Su característica principal es la atención de ventana deslizante (sliding window attention), que le permite mantener un uso de memoria fijo de 61 MB independientemente del tamaño del archivo de log. El modelo se publica como prueba de concepto con 19.536.128 parámetros, una arquitectura inspirada en DeepSeek, y está pensado para demostrar la viabilidad de un pipeline de consulta semántica sobre logs mediante RAG con ChromaDB y despliegue en vLLM.

No se trata de un modelo generalista como ChatGPT; la propia model card advierte de que sus pesos no fueron entrenados con datos masivos y que para producción real debería inyectarse el concepto de atención deslizante en un modelo preentrenado de mayor tamaño, como Llama-3 8B. Su relevancia actual radica en proponer una alternativa de bajo coste (afirmación del autor de ser 10 veces más barato que GPT-4) y en ofrecer una implementación abierta y reentrenable con licencia MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal LM con atención de ventana deslizante (4 capas decoder, RMSNorm, SwiGLU, RoPE) |
| Parámetros totales | 19.536.128 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificado; ventana de atención deslizante de 128 tokens |
| Tipos de cuantización | No disponible (no se publican cuantizaciones en el repo) |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo implementa una arquitectura causal LM personalizada siguiendo el estilo DeepSeek. La secuencia de entrada pasa por un embedding con vocabulario de 50257 tokens y dimensión 256, seguida de 4 capas DeepSeekDecoderLayer. Cada capa combina RMSNorm, una atención de ventana deslizante de 128 tokens con RoPE, RMSNorm y una FFN SwiGLU que expande la dimensión de 256 a 1024 y vuelve a 256. Tras las capas, se aplica RMSNorm y una cabeza de lenguaje atada a los pesos de embedding. El tokenizer es el de GPT-2. Aunque la model card describe el modelo como 16M, el número real de parámetros en los safetensors es 19.536.128.

El entrenamiento se realizó en CPU durante 2 épocas sobre un conjunto de datos sintético de archivos de log, con una pérdida que pasó de 10.8 a 2.9. No se aplicó RLHF ni DPO. La innovación técnica principal es la atención de ventana deslizante, que limita el coste computacional a una ventana de 128 tokens en vez de una atención completa, lo que explica el uso de memoria fijo de 61 MB.

## Capacidades

- Generación de texto técnico en inglés para consultas sobre logs de producción.
- Integración con un pipeline RAG mediante ChromaDB (ingest_logs.py) y consultas semánticas (rag_query.py).
- Despliegue en vLLM mediante la opción `--trust-remote-code`, lo que permite servir el modelo en un endpoint REST.
- Reentrenamiento sobre logs propios con train_mini_deepseek.py desde el repositorio oficial.
- Ejecución local sin GPU en modo de análisis de palabras clave.
- No soporta tool calling ni function calling.
- No soporta agentes multi-step, visión, audio ni modo thinking.
- Soporta únicamente el idioma inglés.

## Casos de uso

- Análisis de logs de pagos fallidos: con rag_query.py se puede ejecutar una consulta como "Why did the payments fail?" y el modelo devuelve una respuesta basada en los logs semánticamente relevantes almacenados en ChromaDB.
- Monitorización de errores en producción: el modelo puede integrarse en un servicio de observabilidad para detectar patrones de error en archivos de log grandes, gracias a su memoria constante.
- Asistente en tiempo real en una plataforma de GPU: desplegado con vLLM en RunPod, el modelo expone un endpoint HTTP/1 compatible con OpenAI para responder consultas desde una aplicación web.
- Adaptación a formatos de log específicos: con train_mini_deepseek.py se puede reentrenar el modelo sobre los logs de una organización, ajustando los pesos a la terminología y patrones propios.
- Demostración interactiva en HuggingFace Space: la demo permite evaluar el comportamiento del modelo y del pipeline RAG sin configurar ningún entorno local.
- Investigación académica sobre eficiencia de atención deslizante: el repo incluye el módulo log_attention.py, útil para estudiar el impacto de ventanas de atención en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: la model card indica que el proceso de atención ocupa 61 MB fijos. Los pesos en safetensors (19.536.128 parámetros) ocupan aproximadamente 78 MB en FP32 o 39 MB en FP16, por lo que el modelo cabe en cualquier GPU consumer existente.
- GPU recomendada: según el autor, una RTX 4000 Ada de 20 GB en RunPod es suficiente y tiene un coste de 0,28 dólares por hora. Cualquier GPU con al menos 2 GB de VRAM es válida.
- Se puede ejecutar en CPU sin GPU para consultas locales mediante el modo de análisis de palabras clave de rag_query.py.
- Despliegue: compatible con vLLM mediante el comando `vllm serve ShivanshiNigam/loglens-vllm-ready --port 8000 --trust-remote-code`.
- No se han publicado datos de latencia ni de throughput.

## Comparativa con modelos similares

No se han encontrado modelos comparables en la misma categoría (prueba de concepto de 19,5M parámetros con ventana deslizante para logs). La model card del autor recomienda inyectar la arquitectura en un modelo mayor como Llama-3 8B para producción, pero esto no es una alternativa directa.

## Limitaciones y advertencias

- Es una prueba de concepto, no un modelo generalista. Sus capacidades de lenguaje son limitadas y no debe esperarse un rendimiento comparable a modelos como GPT-4.
- El entrenamiento se realizó sobre un conjunto de datos sintético pequeño; la validación con logs reales de producción no está publicada.
- Solo soporta inglés; no tiene capacidades multilingües.
- No soporta tool calling, function calling ni agentes autónomos.
- No hay benchmarks públicos que respalden la afirmación de ser "10× más barato que GPT-4".
- El pipeline de RAG depende de servicios externos (ChromaDB) y de scripts del repositorio GitHub, que no están incluidos en el modelo de HuggingFace.
- La licencia MIT permite uso comercial, pero el estado de PoC y la falta de validación en producción son barreras significativas para su adopción real.
- No hay información sobre sesgos específicos, aunque al estar entrenado en logs sintéticos es probable que reproduzca patrones artificiales.

## Enlaces

- Repo HuggingFace: https://huggingface.co/ShivanshiNigam/loglens-vllm-ready
- Repo GitHub: https://github.com/shivanshinigam/DeepseekLogLens
- Demo HuggingFace Space: https://huggingface.co/spaces/ShivanshiNigam/loglens-demo
- Guía de despliegue en RunPod: https://github.com/shivanshinigam/DeepseekLogLens/blob/main/docs/runpod_deployment.md
- Perfil de GitHub del autor: https://github.com/shivanshinigam
