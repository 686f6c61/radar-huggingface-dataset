# HuggingVidar/gpt-sw3-126m-onnx

## Resumen

GPT-SW3 126M en formato ONNX es una conversión del modelo base GPT-SW3 126M desarrollado originalmente por AI Sweden en colaboración con RISE y WASP WARA for Media and Language. Se trata de un modelo de lenguaje autorregresivo de tipo GPT-2, con 126 millones de parámetros, entrenado principalmente sobre texto en sueco y otras lenguas nórdicas (danés, noruego, inglés e islandés). Esta versión concreta, publicada por el usuario HuggingVidar, no modifica los pesos del original: únicamente los exporta a ONNX con soporte de caché de claves y valores (`past_key_values`) y los cuantiza a 16 bits para reducir el tamaño del repositorio de 740 MB a 259 MB.

La relevancia de esta ficha radica en su orientación a la inferencia en el navegador mediante `transformers.js` y `onnxruntime-web`. El modelo se emplea en el sitio divulgativo *Inuti språkmodellen* (AI-Folkbildaren), donde el modelo ejecuta la generación de texto directamente en el navegador del visitante. Es, por tanto, un ejemplo práctico de despliegue de un modelo de lenguaje pequeño en el cliente, sin servidor, con las limitaciones que ello implica.

Conviene subrayar que se trata de un modelo base, no ajustado por instrucciones: continúa texto, no responde a preguntas. Su utilidad es educativa y experimental, no de producción conversacional. AI Sweden, RISE y WASP no han participado, revisado ni aprobado esta conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (12 capas, 12 cabezas de atención, dimensión oculta 768, según el modelo base GPT-SW3 126M) |
| Parametros totales | 126 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base GPT-SW3 emplea contexto de 2048 tokens; la model card de esta conversión no lo especifica) |
| Tipos de cuantizacion | Pesos almacenados en 16 bits (FP16) y convertidos a 32 bits al cargar; tabla de embeddings compartida almacenada una sola vez |
| Idiomas soportados | sueco (sv), danés (da), noruego (no), inglés (en), islandés (is) |
| Licencia | AI Sweden's LLM AI Model License Agreement (etiquetada como `other` en Hugging Face) |
| Formato de pesos | ONNX (`onnx/model.onnx`), tokenizador en `tokenizer.json` |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del GPT-SW3 126M original: un transformer decoder-only con 12 capas, 12 cabezas de atención y una dimensión oculta de 768, preentrenado de forma autorregresiva sobre corpus en sueco y otras lenguas nórdicas. Esta conversión no altera los pesos ni el entrenamiento; solo cambia el formato de exportación. La exportación a ONNX se realizó con Optimum e incluye soporte de `past_key_values`, lo que permite reutilizar la caché de atención entre pasos de decodificación y evita recalcular el prefijo en cada token generado.

Los cambios técnicos respecto al original son tres: exportación de PyTorch a ONNX, almacenamiento de pesos en 16 bits con conversión a 32 bits en carga (y almacenamiento único de la tabla de embeddings, compartida entre entrada y salida), y conversión del tokenizador SentencePiece (`spiece.model`) a `tokenizer.json`, el formato que leen `transformers.js` y `@huggingface/tokenizers`. El autor documenta una validación: el tokenizador produce bits idénticos a los del original en todas las frases de prueba, y el modelo coincide con el original en PyTorch en el siguiente token más probable en 299 de 299 posiciones evaluadas. Los scripts de conversión y validación están disponibles en el repositorio `VidarRu/insidan-av-ai`, bajo `scripts/`.

No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en esta conversión; esos datos corresponden al modelo original y no se detallan en la información proporcionada.

## Capacidades

- Generación de texto autorregresiva: continuación de texto a partir de un prefijo, sin instrucciones ni formato de diálogo.
- Soporte multilingüe limitado a sueco, danés, noruego, inglés e islandés, con claro predominio del sueco en el entrenamiento original.
- Inferencia en navegador mediante `onnxruntime-web` y `transformers.js`, con gestión de caché de atención (`past_key_values`) entre pasos.
- Gestión de estado conversacional a nivel de API: las entradas `input_ids`, `attention_mask`, `position_ids` y `past_key_values.{0..11}.{key,value}` (forma `[1, 12, 0, 64]` en el primer paso) permiten decodificación incremental.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso estructurado.
- No dispone de modo de pensamiento (thinking), visión ni audio.
- No es un modelo ajustado por instrucciones: no responde a preguntas de forma fiable.

## Casos de uso

- Demostración educativa en navegador: el caso documentado por el autor. El modelo se carga con `transformers.js` y `onnxruntime-web` y genera texto en el cliente, sin backend, para explicar cómo funciona un modelo de lenguaje a visitantes de una web divulgativa.
- Prototipado de interfaces de generación de texto sin servidor: útil para validar UX de autocompletado o continuación de texto en aplicaciones web estáticas, con un repositorio de 0,3 GB que se puede servir desde un CDN.
- Generación de texto en sueco para experimentos lingüísticos: continuación de fragmentos en sueco o danés para estudiar distribución léxica, perplejidad o coherencia local en un modelo pequeño.
- Evaluación comparativa de formatos de exportación: sirve como referencia para medir la fidelidad de la conversión PyTorch a ONNX (el autor reporta coincidencia en 299 de 299 posiciones) y el impacto de FP16 frente a FP32.
- Enseñanza de tokenización y decodificación: el par `tokenizer.json` + `spiece.model` y la API de `past_key_values` permiten ilustrar paso a paso cómo se construye una secuencia token a token.
- Pruebas de integración en pipelines de CI: por su tamaño reducido (259 MB) y su licencia específica, puede usarse como modelo de prueba en tests automatizados de herramientas de inferencia ONNX en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 0,3 GB; con pesos FP16 convertidos a FP32 en carga, el uso de memoria ronda 0,5 GB, aunque no se especifica una cifra oficial.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con al menos 1 GB de memoria libre es suficiente; el modelo está pensado para ejecutarse en CPU dentro del navegador.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (por ejemplo, GTX 1050 o superior), aunque el caso de uso principal es la ejecución en CPU vía WebAssembly/WebGPU en el navegador.
- Opciones de despliegue: `onnxruntime-web` y `transformers.js` (caso documentado); también es posible cargarlo con `onnxruntime` en Python o con `optimum` para inferencia ONNX en servidor, aunque no se documenta explícitamente.
- Latencia y throughput estimados: no disponible. El autor no publica métricas de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| GPT-SW3 126M ONNX (esta ficha) | 126 M | no disponible | sv, da, no, en, is | AI Sweden LLM AI Model License | ONNX (FP16) |
| GPT-SW3 126M original | 126 M | 2048 tokens (según modelo base) | sv, da, no, en, is | AI Sweden LLM AI Model License | PyTorch (safetensors/bin) |
| GPT-2 124M | 124 M | 1024 tokens | en | MIT | PyTorch, ONNX, GGUF |
| DistilGPT-2 | 82 M | 1024 tokens | en | Apache 2.0 | PyTorch, ONNX |

La comparación con GPT-2 y DistilGPT-2 es pertinente por tamaño y arquitectura, pero no por cobertura lingüística: GPT-SW3 está entrenado específicamente para lenguas nórdicas, mientras que los modelos de OpenAI se centran en inglés. La licencia de GPT-SW3 es más restrictiva que MIT o Apache 2.0 y exige el cumplimiento de las directrices del modelo y la atribución a AI Sweden, RISE y WASP.

## Limitaciones y advertencias

- Es un modelo base: continúa texto, no responde a preguntas ni sigue instrucciones. No debe usarse como asistente conversacional sin ajuste adicional.
- Riesgo elevado de alucinación y de generar contenido factualmente incorrecto, tal como advierte el propio autor.
- Puede producir contenido ofensivo o inapropiado; no se documentan filtros de seguridad en esta conversión.
- Sesgos conocidos: no se detallan en la información proporcionada, pero al ser un modelo entrenado sobre corpus web nórdico es probable que herede sesgos de dichos datos; no hay documentación específica al respecto.
- Limitaciones de contexto e idioma: aunque cubre cinco idiomas, el sueco domina el entrenamiento; el rendimiento en islandés e inglés puede ser inferior. La longitud de contexto efectiva no se especifica en esta conversión.
- Restricciones de licencia: el uso y la redistribución están sujetos a la AI Sweden's LLM AI Model License Agreement y a las `GPT-SW3_MODEL_GUIDELINES`; es obligatorio atribuir a AI Sweden, RISE y WASP. No es una licencia permisiva tipo MIT o Apache.
- La conversión no ha sido revisada ni aprobada por AI Sweden, RISE ni WASP; el autor lo declara explícitamente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación por parte de la comunidad.
- El modelo se distribuye en un único archivo ONNX sin variantes cuantizadas a 8 o 4 bits; no se ofrecen versiones GGUF para `llama.cpp` u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HuggingVidar/gpt-sw3-126m-onnx
- Modelo base original: https://huggingface.co/AI-Sweden-Models/gpt-sw3-126m
- Repositorio de scripts de conversión y validación: https://github.com/VidarRu/insidan-av-ai
- Licencia del modelo (archivo `LICENSE` en el repositorio de Hugging Face): https://huggingface.co/HuggingVidar/gpt-sw3-126m-onnx/blob/main/LICENSE
- Directrices del modelo (archivo `GPT-SW3_MODEL_GUIDELINES`): https://huggingface.co/HuggingVidar/gpt-sw3-126m-onnx/blob/main/GPT-SW3_MODEL_GUIDELINES
