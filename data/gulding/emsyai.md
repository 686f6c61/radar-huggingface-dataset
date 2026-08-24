# gulding/EmsyAI

## Resumen

EmsyAI es un modelo de lenguaje decoder-only de aproximadamente 28 millones de parámetros, desarrollado por el usuario gulding con fines exclusivamente educativos. Está construido completamente desde cero en PyTorch puro, sin depender de la librería `transformers` de HuggingFace, lo que lo convierte en un recurso valioso para quienes quieren entender el funcionamiento interno de un LLM moderno. Su arquitectura está fuertemente inspirada en Llama 3 e incorpora elementos como Grouped Query Attention (GQA), SwiGLU, RMSNorm y Rotary Positional Embeddings (RoPE).

El modelo se entrenó en dos fases: un pretraining base sobre aproximadamente 40 MB de código fuente Python del repositorio CPython, seguido de un ajuste fino por instrucciones mediante LoRA sobre el dataset CodeAlpaca-20k. Aunque su contexto de 512 tokens y su vocabulario de 8000 tokens lo limitan a tareas muy simples, su relevancia radica en que demuestra todo el pipeline de entrenamiento de un LLM desde cero, incluyendo tokenizador BPE propio, atención con KV-caching y adaptadores LoRA. Se distribuye bajo licencia MIT y está disponible en formato GGUF, lo que permite ejecutarlo localmente con Ollama sin dependencias de Python.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only Transformer (inspirada en Llama 3) |
| Parametros totales | 31.793.664 (según metadatos safetensors); el autor declara ~28 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | GGUF (tipos de cuantizacion concretos no especificados) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

EmsyAI es un transformer decoder-only de 8 capas con dimensión oculta de 512, 8 cabezas de atención de query y 4 de key/value (Grouped Query Attention), FFN con SwiGLU y dimensión oculta de 1408, normalización Pre-RMSNorm y embeddings posicionales rotatorios (RoPE). El vocabulario es de 8000 tokens, generado con un tokenizador BPE implementado a mano, y el contexto máximo es de 512 tokens.

El entrenamiento se realizó en dos fases. La fase 1 consistió en un pretraining base sobre ~40 MB de código fuente Python (repositorio CPython), usando AdamW con precisión mixta bfloat16 y una programación de learning rate con decaimiento coseno y warmup lineal, alcanzando una perplejidad final de ~10.77. La fase 2 fue un ajuste fino por instrucciones con una implementación propia de LoRA, aplicada a todas las capas lineales (Q, K, V, O, w1, w2, w3), sobre el dataset CodeAlpaca-20k, con 598.016 parámetros entrenables (2.11% del total) y una pérdida final de ~1.92. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Generación de texto autoregresiva con KV-caching implementado desde cero.
- Generación de código Python de nivel básico, derivada del entrenamiento en código fuente de CPython.
- Seguimiento de instrucciones tras el ajuste fino con CodeAlpaca-20k.
- Soporte de ejecución nativa mediante Ollama gracias al formato GGUF.
- Capacidades multilingües: no, solo inglés.
- Sin soporte de tool calling, agentes, visión ni audio.
- Sin modo de pensamiento extendido ni razonamiento multi-step explícito.

## Casos de uso

- **Enseñanza de arquitecturas LLM**: es un recurso ideal para cursos de deep learning donde se quiera mostrar cada capa de un transformer moderno (GQA, SwiGLU, RoPE, RMSNorm) con código fuente legible y completo.
- **Investigación en LoRA y fine-tuning eficiente**: permite experimentar con adaptadores LoRA sobre un modelo pequeño y entender el impacto de los parámetros entrenables en la calidad final.
- **Prototipado rápido de pipelines de entrenamiento**: al estar escrito en PyTorch puro, es fácil modificar el dataset, el tokenizador o la arquitectura para probar hipótesis de investigación a bajo coste.
- **Demostración de inferencia local con Ollama**: al estar exportado a GGUF, se puede ejecutar con un solo comando (`ollama run hf.co/gulding/EmsyAI`) para demostraciones de generación de código en entornos sin GPU.
- **Generación de fragmentos cortos de código Python**: útil para tareas de autocompletado de funciones simples, aunque con limitaciones por su contexto de 512 tokens y su tamaño reducido.
- **Pruebas de infraestructura MLOps**: sirve como modelo ligero para validar pipelines de despliegue, pruebas de carga, integración con servidores de inferencia o evaluaciones de cuantización antes de pasar a modelos mayores.
- **Investigación en tokenizadores BPE**: el tokenizador propio permite estudiar el impacto del tamaño de vocabulario y la segmentación en la calidad de generación de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los únicos datos de entrenamiento reportados son:

| Metrica | Valor |
|---|---|
| Perplexity (pretraining base) | ~10.77 |
| Loss (fine-tuning LoRA) | ~1.92 |

Estos valores corresponden a métricas de entrenamiento, no a evaluaciones estandarizadas, y no permiten comparar con otros modelos.

## Requisitos de hardware

- VRAM estimada: en FP16, los ~31.8 millones de parámetros ocupan aproximadamente 64 MB; con cuantización GGUF Q4 el peso se reduce a unos 17 MB. Cualquier GPU con 1 GB de VRAM es suficiente.
- GPU recomendadas: no requiere GPU; una CPU moderna ejecuta el modelo en decenas de milisegundos por token. En GPU, cualquier tarjeta consumer (RTX 3060, 4090) ofrece latencia mínima.
- Compatible con hardware de borde (Raspberry Pi, Jetson Nano) gracias a su tamaño reducido.
- Opciones de despliegue: Ollama (compatible con `ollama run hf.co/gulding/EmsyAI`), llama.cpp, y el script `chat_instruct.py` del repositorio GitHub para uso en PyTorch.
- Latencia y throughput: no publicados; dado el tamaño, se estima un throughput superior a 100 tokens/s en CPU moderna y varios miles en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Formato |
|---|---|---|---|---|---|
| EmsyAI | ~28M | 512 | CPython + CodeAlpaca | MIT | safetensors, GGUF |
| TinyStories (Microsoft) | 33M | 512 | TinyStories (narrativa infantil) | MIT | safetensors |
| GPT-2 (small) | 124M | 1024 | WebText | MIT | safetensors, ONNX |

EmsyAI se diferencia de TinyStories en su dominio de código y su implementación desde cero en PyTorch puro, mientras que TinyStories se enfoca en generación de texto narrativo coherente. GPT-2 es el triple de grande y tiene el doble de contexto, pero ambos son comparables en su uso educativo y su ejecución en hardware modesto. No hay modelos comparables de exactamente el mismo tamaño y dominio (generación de código de 28M) en el ecosistema abierto, lo que lo hace una propuesta singular.

## Limitaciones y advertencias

- Contexto muy limitado: 512 tokens, insuficiente para tareas que requieran memoria larga o código extenso.
- Vocabulario reducido de 8000 tokens, que limita la cobertura léxica fuera del dominio de código.
- Entrenamiento en un corpus muy pequeño (~40 MB de código Python): el modelo solo conoce patrones de CPython y puede fallar en otros lenguajes o dominios.
- No es compatible con la API `AutoModel` de `transformers`; requiere el código de inferencia personalizado del repositorio GitHub.
- Riesgo de alucinación elevado en tareas fuera de su dominio de entrenamiento, al ser un modelo de muy pequeño tamaño.
- Sin datos de evaluación independiente: no hay benchmarks publicados que avalen su calidad frente a otros modelos.
- Licencia MIT: permite uso comercial sin restricciones, pero el autor no ofrece garantías de calidad ni soporte.
- El modelo no es adecuado para producción real; su valor es educativo y de investigación.

## Enlaces

- HuggingFace: https://huggingface.co/gulding/EmsyAI
- Repositorio GitHub (código de inferencia y entrenamiento): https://github.com/gulding/EmsyAI
- Repositorio de proyectos relacionados del autor: https://github.com/gulding/local-agents (arquitectura multi-agente local con Ollama) y https://github.com/gulding/ai-assistant-saas (extensión Chrome con asistente IA)
