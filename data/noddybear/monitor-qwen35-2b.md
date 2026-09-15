# Noddybear/monitor-qwen35-2b

## Resumen

monitor-qwen35-2b es un modelo de lenguaje fine-tuneado por Noddybear sobre Qwen/Qwen3.5-2B para la monitorización de inyecciones de prompt (prompt injection). Se trata de un checkpoint de fine-tuning completo (full fine-tuning) entrenado en Together AI el 14 de septiembre de 2026, como parte de una comparación de tamaño con el modelo hermano monitor-qwen35-08b. El modelo clasifica transcripciones de texto como BENIGN (0) o FLAG (1) mediante la predicción de un único token, sin necesidad de una cabeza de clasificación binaria separada.

La arquitectura exportada es Qwen3_5ForConditionalGeneration, con un total de 2.213.241.664 parámetros. Aunque el pipeline en Hugging Face se etiqueta como image-text-to-text por compatibilidad con la arquitectura, el uso previsto es exclusivamente textual. El modelo está pensado para investigadores y desarrolladores que necesitan un componente experimental de scoring en sistemas de detección de inyecciones de prompt, y no como una frontera de seguridad en producción. El contexto de entrenamiento está limitado a 1.024 tokens, y el rendimiento multilingüe no ha sido evaluado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (Transformer) |
| Parametros totales | 2.213.241.664 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (entrenado con máximo 1.024 tokens; el servicio usó 4.096) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; carga en BF16 recomendada) |
| Idiomas soportados | Inglés (rendimiento multilingüe no evaluado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B y aplica un full fine-tuning para la tarea de clasificación de inyecciones de prompt. En lugar de añadir una cabeza de clasificación binaria, reutiliza la cabeza de salida del modelo de lenguaje y entrena con entropía cruzada sobre el vocabulario completo, aplicando la pérdida únicamente al token de respuesta (0 o 1). Durante el entrenamiento, el dígito de respuesta se añade directamente después del prefijo del chat template, y solo ese token tiene una etiqueta distinta de -100; las posiciones de prompt, padding y EOS no reciben pérdida.

Los datos de entrenamiento provienen de tres conjuntos de inyecciones de prompt: reshabhs/SPML_Chatbot_Prompt_Injection, xTRam1/safe-guard-prompt-injection y deepset/prompt-injections. El contrato de datos limita la secuencia a un máximo de 1.024 tokens, incluyendo el prompt completo y el dígito de respuesta; los ejemplos que exceden esa longitud se rechazan en lugar de truncarse. El entorno de preparación de datos utilizó Transformers 4.57.6, tokenizers 0.22.2 y Jinja2 3.1.6. No se mencionan técnicas como RLHF, DPO ni decodificación especulativa. La única innovación destacable es el uso del head LM para clasificación binaria mediante la comparación de logits de los tokens 15 (0) y 16 (1).

## Capacidades

- Clasificación de transcripciones como BENIGN (0) o FLAG (1) para detectar inyecciones de prompt.
- Scoring por logits: el score se calcula como logit(token 16) - logit(token 15), donde 0 es el token 15 y 1 es el token 16.
- No genera explicaciones ni razonamiento; la salida es un único dígito.
- Soporte de tool calling / function calling: no disponible (no evaluado en este fine-tuning).
- Soporte de agentes y multi-step reasoning: no disponible (el modelo no genera razonamiento).
- Capacidades multilingües: no evaluadas; el idioma documentado es inglés.
- Capacidad especial: puede usarse como componente de scoring en pipelines de seguridad, con umbral personalizado ajustado sobre datos benignos separados.

## Casos de uso

- Monitorización de prompts en sistemas de chat: el modelo puede clasificar transcripciones de conversaciones para detectar intentos de inyección, usando el score logit(16)-logit(15) con un umbral ajustado a los datos de producción.
- Filtrado de payloads en aplicaciones LLM: antes de enviar contenido no confiable a un modelo generativo, se puede usar este monitor para flaggear entradas que intenten redirigir al asistente.
- Investigación en seguridad de IA: al ser un checkpoint de fine-tuning completo con datos de entrenamiento conocidos, permite estudiar cómo el tamaño del modelo afecta a la detección de inyecciones (comparación con monitor-qwen35-08b).
- Evaluación de robustez de agentes: en pipelines de testing, se puede usar para verificar si un agente es vulnerable a inyecciones, clasificando los prompts de prueba.
- Análisis de logs históricos: permite clasificar transcripciones almacenadas para identificar intentos de inyección en interacciones pasadas.
- Experimentos de fine-tuning: sirve como referencia para entrenar otros monitores de seguridad, ya que incluye el contrato de entrada/salida y el helper de scoring documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos en BF16 ocupan aproximadamente 4,4 GB (2.213.241.664 parámetros × 2 bytes). Con overhead de activaciones y KV cache, se recomienda al menos 8 GB de VRAM para inferencia en BF16. En FP32, los pesos ocupan ~8,8 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4090, A100 40/80 GB, H100. Cabe en GPUs de consumo con 8-12 GB de VRAM.
- Opciones de despliegue: Transformers con AutoModelForMultimodalLM y el helper scoring.py incluido en el repo. No se ha verificado compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| monitor-qwen35-2b | 2.213.241.664 | No disponible | Apache 2.0 | Hugging Face |
| monitor-qwen35-08b | No disponible | No disponible | No disponible | Hugging Face (mencionado en la model card) |

## Limitaciones y advertencias

- No es un detector certificado: no se proporciona un umbral de producción calibrado ni recall medido a una tasa de falsos positivos objetivo.
- El rendimiento en producción no está establecido; la calidad general de chat, visión/audio y detección de contexto largo no han sido evaluadas en este fine-tuning.
- Solo está documentado en inglés; el rendimiento multilingüe no ha sido evaluado.
- El contrato de entrenamiento limita a 1.024 tokens; las entradas más largas no tienen rendimiento garantizado, aunque el servicio usara max_seq_length=4096.
- No se debe confiar en el comportamiento de parada generado (EOS) porque no fue un objetivo supervisado.
- El score logit(16)-logit(15) es una probabilidad condicional de dos etiquetas, no una probabilidad validada de ataque en el mundo real.
- Sesgos no evaluados en la documentación disponible.
- Uso recomendado solo como componente experimental de scoring, no como frontera de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Noddybear/monitor-qwen35-2b
- Modelo hermano mencionado en la model card: https://huggingface.co/Noddybear/monitor-qwen35-08b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
