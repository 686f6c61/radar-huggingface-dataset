# DQN-Labs/nexustest2-cfp-8k-oct30

## Resumen

nexustest2-cfp-8k-oct30 es un ajuste fino (fine-tuning) publicado por DQN-Labs sobre el modelo base unsloth/Qwen3.8-27B-unsloth-bnb-4bit, que a su vez deriva de la familia Qwen3.8 de 27B parámetros. El modelo se distribuye en formato safetensors con pesos completos (55,6 GB en el repositorio) y está etiquetado con la arquitectura qwen3_5 y el pipeline image-text-to-text, lo que indica capacidades multimodales de entrada (imagen y texto) además de generación de texto.

El modelo resuelve el caso de uso de adaptación de un LLM multimodal de gran tamaño a un dominio o tarea concreta mediante entrenamiento supervisado con Unsloth y TRL, que el autor declara como "2x más rápido". Es relevante para desarrolladores que necesiten un modelo de 27B con capacidades de visión y texto, licencia Apache 2.0 y compatibilidad con el ecosistema transformers y text-generation-inference.

La información pública es escasa: la model card es una plantilla mínima de Unsloth sin detalles sobre el dataset de ajuste, hiperparámetros, número de tokens de entrenamiento ni resultados de evaluación. Cualquier dato no documentado se marca como no disponible en esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer, según tag del repositorio); detalles internos no disponibles |
| Parametros totales | 27.781.427.952 (~27,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el nombre del modelo sugiere 8k, sin confirmar) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el base es bnb-4bit) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura etiquetada como qwen3_5, un transformer de ~27,8B parámetros con capacidad multimodal image-text-to-text. El modelo base declarado es unsloth/Qwen3.8-27B-unsloth-bnb-4bit, una versión cuantizada a 4 bits (bitsandbytes) preparada por Unsloth para entrenamiento eficiente. El ajuste fino se realizó con Unsloth y la librería TRL de Hugging Face, según la model card.

No se dispone de información sobre la composición del dataset de ajuste, el número de tokens de entrenamiento, el uso de RLHF/DPO, la estrategia de congelación de capas ni los hiperparámetros empleados. Tampoco se documenta ninguna innovación técnica específica del ajuste (decodificación especulativa, atención lineal, etc.). El sufijo "cfp-8k" del nombre podría sugerir un contexto de 8k o un dataset de 8k ejemplos, pero no está confirmado en la información disponible.

## Capacidades

- Generación de texto conversacional, según el tag "conversational".
- Entrada multimodal imagen-texto (pipeline image-text-to-text), lo que permite razonamiento sobre imágenes junto con texto.
- Compatibilidad con text-generation-inference y endpoints_compatible, lo que facilita el despliegue en infraestructura de inferencia estándar.
- Capacidades multilingües limitadas: el modelo declara únicamente inglés ("en").
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos con imágenes: el modelo puede recibir capturas, diagramas o páginas escaneadas junto con texto y generar descripciones o extracciones estructuradas, aprovechando su pipeline image-text-to-text.
- Asistentes conversacionales en inglés: con el tag "conversational" y compatibilidad con TGI, se puede desplegar como backend de un chatbot multi-turno en entornos de habla inglesa.
- Prototipado de aplicaciones multimodales: al estar disponible en safetensors y transformers, sirve para experimentar con pipelines de visión-lenguaje sin depender de APIs propietarias.
- Ajuste adicional sobre dominio específico: su licencia Apache 2.0 y formato estándar permiten reentrenar o hacer LoRA sobre él para tareas verticales.
- Investigación en ajuste fino eficiente: al proceder de un base cuantizado con Unsloth, es un punto de partida para estudiar técnicas de entrenamiento con memoria reducida en modelos de ~28B.
- Despliegue en endpoints compatibles: el tag endpoints_compatible facilita su integración en plataformas de inferencia gestionada que acepten modelos transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 56 GB solo para pesos (27,8B × 2 bytes), más overhead de activaciones y KV cache; se recomienda 80 GB o más.
- VRAM estimada en cuantización 4 bits: alrededor de 16-18 GB para pesos, más overhead; viable en GPUs de 24 GB con contexto moderado.
- GPUs recomendadas: A100 80GB o H100 para fp16; RTX 4090 (24 GB) o A6000 (48 GB) para cuantización 4/8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantización 4 bits y contexto limitado; no en fp16.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM; llama.cpp/Ollama requerirían conversión a GGUF, no publicada en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| nexustest2-cfp-8k-oct30 (este) | ~27,8B | no disponible | Apache 2.0 | sí (image-text-to-text) | Hugging Face |
| Qwen2.5-VL-32B | ~32B | 128k (según documentación pública de Qwen) | Apache 2.0 | sí | Hugging Face |
| Gemma 3 27B | ~27B | 128k (según documentación pública de Google) | Gemma license | sí | Hugging Face |
| Mistral Small 3.1 24B | ~24B | 128k (según documentación pública de Mistral) | Apache 2.0 | sí | Hugging Face |

Los datos de contexto de los modelos comparables provienen de su documentación pública; los de este modelo no están confirmados. No se dispone de benchmarks para comparar rendimiento real.

## Limitaciones y advertencias

- Model card mínima: no se documenta dataset, hiperparámetros ni evaluación, lo que impide validar la calidad del ajuste.
- Idioma: solo declara inglés; el rendimiento en castellano no está garantizado.
- Riesgo de alucinación: inherente a los LLM de esta escala; sin benchmarks no se puede cuantificar.
- Sesgos: no documentados por el autor; se heredan los del modelo base y el dataset de ajuste, ambos desconocidos.
- Contexto: el nombre sugiere 8k, pero no está confirmado; podría ser insuficiente para tareas de documentos largos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y sus dependencias (Qwen, Unsloth) deben verificarse por separado.
- Procede de un base cuantizado a 4 bits; la calidad del ajuste puede diferir de un fine-tuning sobre pesos completos.
- Sin descargas ni likes significativos (55 descargas, 0 likes): no hay validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/DQN-Labs/nexustest2-cfp-8k-oct30
- Modelo base: https://huggingface.co/unsloth/Qwen3.8-27B-unsloth-bnb-4bit
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
