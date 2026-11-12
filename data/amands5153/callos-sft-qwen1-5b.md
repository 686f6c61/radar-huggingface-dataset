# amanDS5153/callos-sft-qwen1.5b

## Resumen

`callos-sft-qwen1.5b` es un adaptador LoRA publicado por el usuario amanDS5153 en Hugging Face, obtenido mediante fine-tuning supervisado (SFT) del modelo base Qwen/Qwen2.5-1.5B-Instruct sobre un conjunto de datos denominado `callos_sft`. No se trata de un modelo completo con pesos independientes, sino de un adaptador PEFT que debe cargarse junto al modelo base Qwen2.5-1.5B-Instruct para funcionar.

El modelo base Qwen2.5-1.5B-Instruct es un transformer decoder-only de 1.500 millones de parámetros desarrollado por Alibaba Qwen, con una longitud de contexto nativa de 32.768 tokens (ampliable a 131.072 mediante configuración), entrenado para instrucciones y conversación. El adaptador hereda estas características arquitectónicas y de contexto, ya que el fine-tuning LoRA no modifica la arquitectura subyacente.

La relevancia de esta ficha es limitada: el repositorio no incluye model card sustantiva (la mayoría de secciones están marcadas como "More information needed"), no declara idiomas soportados, no publica resultados de benchmarks y no especifica la composición del dataset de entrenamiento. El interés práctico se reduce a quien quiera reproducir o inspeccionar un ejemplo de fine-tuning LoRA con LLaMA-Factory sobre Qwen2.5-1.5B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del base Qwen2.5-1.5B-Instruct); adaptador LoRA/PEFT |
| Parametros totales | 1.500 millones en el modelo base; el adaptador LoRA añade un número no especificado de parámetros entrenables |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base (heredado); no se indica modificación |
| Tipos de cuantizacion | no disponible en el repositorio del adaptador; el modelo base admite cuantizaciones estándar (GGUF, AWQ, GPTQ) por separado |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | other (heredada del modelo base Qwen2.5, cuya licencia es Qwen Research/Community según variante) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, librería `peft`) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only con atención por ventanas deslizantes combinada con atención completa, normalización RMSNorm y activación SwiGLU, típico de la familia Qwen2.5. El fine-tuning se realiza con LoRA mediante LLaMA-Factory, lo que congela los pesos del modelo base e inyecta matrices de bajo rango en determinadas capas (la configuración exacta de rango y módulos objetivo no se especifica en la model card).

Los hiperparámetros declarados son: learning rate 2e-4, batch size de entrenamiento 2 con acumulación de gradiente 4 (batch efectivo 8), optimizador AdamW fused (betas 0.9/0.999, epsilon 1e-8), scheduler coseno con warmup del 10 %, 3 épocas y semilla 42. No se indica el número de tokens de entrenamiento, la composición del dataset `callos_sft`, ni si se aplicó RLHF, DPO o alguna etapa posterior al SFT. Las versiones de framework son PEFT 0.18.1, Transformers 5.5.0, PyTorch 2.11.0+cu128, Datasets 4.0.0 y Tokenizers 0.22.2.

## Capacidades

- Generación de texto conversacional y respuesta a instrucciones, heredadas del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento básico y resolución de problemas de complejidad moderada, limitado por el tamaño de 1.500 millones de parámetros.
- Generación de código y matemáticas a nivel introductorio/intermedio, según las capacidades del base.
- Soporte multilingüe heredado (Qwen2.5 cubre principalmente inglés y chino, con soporte adicional para otros idiomas), aunque el adaptador no declara idiomas específicos.
- Posible soporte de tool calling y function calling heredado del base, no verificado tras el fine-tuning.
- Capacidad de seguir formatos de chat estructurados mediante la plantilla de Qwen2.5.
- No se declaran capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Evaluación de pipelines de fine-tuning LoRA: el adaptador sirve como ejemplo reproducible de un entrenamiento SFT con LLaMA-Factory sobre Qwen2.5-1.5B, útil para validar configuraciones de hiperparámetros en entornos de investigación.
- Prototipado rápido de asistentes conversacionales de dominio específico: al ser un adaptador ligero, permite experimentar con especialización sobre el dataset `callos_sft` sin reentrenar el modelo completo.
- Despliegue en hardware modesto: combinado con el base en cuantización de 4 bits, cabe en GPUs de consumo (8-12 GB de VRAM) para pruebas de inferencia local.
- Generación de texto asistida en aplicaciones de baja latencia: el tamaño de 1.5B permite respuestas rápidas en CPU o GPU de gama media, adecuado para tareas de clasificación, resumen o reescritura.
- Investigación sobre adaptadores PEFT: permite estudiar el efecto del fine-tuning LoRA en las capacidades del base comparando respuestas antes y después de cargar el adaptador.
- Base para experimentos de merging: el adaptador puede fusionarse con los pesos del base para producir un checkpoint completo, útil en flujos de publicación o evaluación estandarizada.

## Benchmarks y rendimiento

El model-index del repositorio declara una entrada `latest` con una lista de resultados vacía. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en fp16: aproximadamente 3 GB de pesos más overhead de activaciones y KV cache (típicamente 4-6 GB en total según longitud de contexto).
- VRAM estimada en cuantización de 4 bits: aproximadamente 1-1,5 GB de pesos, con un total práctico de 2-3 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060/4060, RTX 4070, A10, L4); para cuantización 4 bits basta con 4-6 GB (GTX 1650 Super, RTX 3050).
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 6 GB o más en cuantización.
- Opciones de despliegue: transformers con PEFT, vLLM (requiere fusionar el adaptador o usar soporte LoRA), llama.cpp/Ollama (requiere convertir el modelo fusionado a GGUF), TGI con soporte de adaptadores.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| callos-sft-qwen1.5b (este) | 1.5B (base) + LoRA | 32.768 (heredado) | other | Adaptador PEFT en HF |
| Qwen2.5-1.5B-Instruct | 1.5B | 32.768 | Qwen (ver términos) | Modelo completo en HF |
| Llama-3.2-1B-Instruct | 1.2B | 131.072 | Llama 3.2 Community | Modelo completo en HF |
| SmolLM2-1.7B-Instruct | 1.7B | 8.192 | Apache 2.0 | Modelo completo en HF |

No se dispone de datos de rendimiento comparativo para este adaptador, ya que no publica benchmarks. La comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- La model card está generada automáticamente y no documenta el dataset `callos_sft`, por lo que se desconoce el dominio, la calidad y los posibles sesgos introducidos durante el fine-tuning.
- No se declaran idiomas soportados; el comportamiento multilingüe puede degradarse respecto al base.
- Riesgo de alucinación inherente a un modelo de 1.5B, potencialmente acentuado por un fine-tuning SFT sobre datos no verificados.
- La licencia "other" remite a los términos del modelo base Qwen2.5; es necesario revisar la licencia de Qwen para uso comercial antes de desplegar.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa de la comunidad.
- No se especifican los módulos LoRA objetivo ni el rango, lo que dificulta evaluar la magnitud del cambio respecto al base.
- El tamaño del repo es de 0.0 GB según la información disponible, lo que sugiere que los pesos del adaptador podrían no estar subidos o son extremadamente pequeños; conviene verificar la integridad del repositorio antes de usarlo.
- No hay garantías de que el adaptador mantenga las capacidades de tool calling del base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/amanDS5153/callos-sft-qwen1.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- PEFT (librería de adaptadores): https://github.com/huggingface/peft
