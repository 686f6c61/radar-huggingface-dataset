# DoubleRabbits/d3-mini-zils-v6

## Resumen

DoubleRabbits/d3-mini-zils-v6 es un fine-tune de decisión publicado por el usuario DoubleRabbits sobre un chasis denominado d3-mini-4.5b-v1, que a su vez deriva de Qwen3.5-4B. El modelo se ha entrenado con LoRA de rango 16 sobre 400 decisiones sintéticas (semilla 5) y se presenta como parte del "soup pool" Zils d3-mini. Su propósito declarado es actuar como modelo de decisión dentro de ese conjunto, no como un modelo generalista de propósito amplio.

Con 4.539.265.536 parámetros reales según los safetensors del repositorio y un tamaño de repo de 9,1 GB, se sitúa en la franja de los modelos pequeños (4-5B), lo que lo hace desplegable en hardware de consumo con cuantización. La licencia Apache 2.0 facilita su uso comercial y su modificación, aunque la model card es extremadamente escueta y no documenta idiomas, contexto ni datos de evaluación.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de experimentación (fine-tune LoRA sobre datos sintéticos, sin descargas ni likes en el momento de la consulta) que puede interesar a quien investigue técnicas de model soup, fine-tuning ligero o modelos de decisión especializados. No debe confundirse con un modelo de propósito general listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B, tag `qwen3_5` con `custom_code`) |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización GGUF/AWQ no documentada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code`) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.5-4B, un transformer decoder-only, a través del chasis intermedio d3-mini-4.5b-v1. El autor no detalla la arquitectura interna (número de capas, dimensiones ocultas, mecanismo de atención, uso de RoPE o GQA), por lo que esos datos no están disponibles. El tag `custom_code` indica que la carga requiere código personalizado del repositorio, lo que implica que no es un transformer estándar cargable con `AutoModelForCausalLM` sin más.

El entrenamiento consistió en un fine-tune con LoRA de rango 16 sobre 400 decisiones sintéticas generadas con semilla 5. No se documenta el número de tokens de entrenamiento, la composición del dataset, la existencia de RLHF/DPO ni hiperparámetros como learning rate, epochs o batch size. Tampoco se especifica si el chasis d3-mini-4.5b-v1 incorpora algún tipo de fusión previa (model soup) ni qué innovaciones técnicas aporta. La información disponible es, por tanto, insuficiente para reproducir el entrenamiento.

## Capacidades

- Generación de texto y toma de decisiones dentro del dominio para el que fue entrenado (decisiones sintéticas del pool Zils d3-mini).
- Razonamiento de un solo paso orientado a decisión; no se documenta razonamiento multi-paso ni modo "thinking".
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Visión, audio u otras modalidades: no disponibles.
- Capacidad de instrucción general: no verificada; el fine-tune es específico y podría degradar el comportamiento generalista del Qwen3.5-4B base.

## Casos de uso

- Experimentación con model soups: el modelo puede usarse como componente dentro de un pool de modelos fusionados para estudiar cómo afecta un fine-tune LoRA de rango 16 a la fusión final, dado que el autor lo enmarca explícitamente en el "soup pool" Zils d3-mini.
- Investigación sobre fine-tuning con datos sintéticos: sirve como caso de estudio reproducible (semilla 5, 400 ejemplos) para analizar la eficacia de LoRA de bajo rango en tareas de decisión acotadas.
- Clasificación o decisión binaria/multiclase en prototipos: si el dominio de las 400 decisiones sintéticas se alinea con el problema, puede emplearse como clasificador ligero en un pipeline de prototipado rápido.
- Evaluación de robustez de fine-tunes pequeños: al tener 4,5B parámetros y licencia Apache 2.0, es adecuado para pruebas de estrés, ablaciones y comparación de técnicas de adaptación en entornos de investigación.
- Despliegue en hardware de consumo para pruebas: con 9,1 GB en safetensors y ~4,5B parámetros, cabe en GPUs de 24 GB (RTX 3090/4090) en fp16 y en GPUs de 8-12 GB con cuantización, lo que facilita experimentos locales.
- Base para nuevos fine-tunes: al ser Apache 2.0 y derivar de Qwen3.5-4B, puede servir como punto de partida para adaptaciones adicionales en dominios específicos, siempre que se respete la licencia del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: ~9,1 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 12-16 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: ~4,5-5 GB para pesos.
- VRAM estimada en cuantización de 4 bits: ~2,5-3 GB para pesos (si se generan pesos GGUF/AWQ, no documentados en el repo).
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para fp16 sin cuantización; A100/H100 para despliegue con throughput alto; RTX 3060 12 GB o RTX 4060 Ti 16 GB con cuantización.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 en fp16 y en GPUs de 8-12 GB con cuantización, siempre que se resuelva la carga con `custom_code`.
- Opciones de despliegue: al requerir `custom_code`, la carga estándar con vLLM, llama.cpp u Ollama no está garantizada; será necesario usar `trust_remote_code=True` con transformers o adaptar el código del repo. TGI y vLLM requerirían verificación previa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DoubleRabbits/d3-mini-zils-v6 | 4,54B | no disponible | Apache 2.0 | HF (0 descargas, 0 likes) | Fine-tune LoRA r16 sobre 400 decisiones sintéticas; requiere `custom_code` |
| Qwen3.5-4B (base) | ~4B | no disponible en esta ficha | no disponible en esta ficha | HF | Modelo base del que deriva; capacidades generalistas |
| d3-mini-4.5b-v1 (chasis) | ~4,5B | no disponible | no disponible | no disponible | Chasis intermedio citado por el autor; sin ficha pública verificada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Model card extremadamente escueta: no documenta idiomas, contexto, datos de entrenamiento detallados ni evaluación, lo que impide validar su calidad de forma rigurosa.
- Entrenado sobre solo 400 decisiones sintéticas: riesgo alto de sobreajuste al dominio sintético y de escasa generalización fuera de él.
- Posible degradación del comportamiento generalista del Qwen3.5-4B base tras el fine-tune LoRA; no se han publicado evaluaciones que lo descarten.
- Riesgo de alucinación no cuantificado; sin benchmarks no puede estimarse.
- Requiere `custom_code` para la carga: introduce dependencia de código del autor y riesgos de seguridad si no se audita (`trust_remote_code=True` ejecuta código arbitrario).
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.5-4B y del chasis d3-mini-4.5b-v1, no documentadas aquí.
- No apto para producción sin evaluación previa en el dominio objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/DoubleRabbits/d3-mini-zils-v6
- Modelo base citado (Qwen3.5-4B): no disponible en la información proporcionada
- Chasis d3-mini-4.5b-v1: no disponible en la información proporcionada
- Paper, blog o repositorio adicional: no disponible en la información proporcionada
