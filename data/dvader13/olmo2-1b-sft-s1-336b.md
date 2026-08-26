# dvader13/olmo2-1b-sft-s1-336b

## Resumen

Este repositorio contiene checkpoints de ajuste fino supervisado (SFT) del modelo base OLMo-2-1B, desarrollado por Ai2. El modelo base fue preentrenado en la etapa `stage1-step160000-tokens336B`, es decir, con 336 mil millones de tokens. El autor `dvader13` publica diez fracciones de dosis de SFT (del 10% al 100%), lo que permite estudiar el impacto progresivo del ajuste fino en un modelo de lenguaje pequeño y completamente abierto.

La relevancia de este modelo radica en su naturaleza de investigación: al publicar checkpoints intermedios de SFT, se posibilita analizar la evolución de las capacidades del modelo a lo largo del proceso de ajuste fino, algo poco común en la mayoría de publicaciones. Al estar basado en OLMo-2-1B, hereda la arquitectura abierta de Ai2, con pesos disponibles bajo licencia Apache-2.0. Es un modelo pensado para investigación y experimentación, no para despliegue en producción directa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-2-1B) |
| Parámetros totales | 1B (aproximadamente) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 (checkpoints publicados) |
| Idiomas soportados | no disponible (probablemente inglés, basado en el corpus de OLMo) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo base es OLMo-2-1B, un transformer decoder-only de la familia OLMo 2 de Ai2. La arquitectura sigue el diseño estándar de transformers causales, con normalización de capas, atención de múltiples cabezas y feed-forward. El preentrenamiento se realizó con 336 mil millones de tokens en la etapa `stage1-step160000`. El ajuste fino supervisado se ha aplicado sobre este base, produciendo diez checkpoints que representan dosis crecientes de datos de SFT (del 10% al 100%). No se especifica el dataset de SFT utilizado ni si se aplicaron técnicas adicionales como DPO o RLHF en estos checkpoints.

## Capacidades

- Generación de texto: al ser un modelo base con SFT, puede generar texto coherente en inglés (idioma principal del corpus de OLMo).
- Capacidad de razonamiento básico: los modelos de 1B tienen capacidades limitadas de razonamiento, pero el SFT puede mejorar su capacidad para seguir instrucciones.
- No hay evidencia de soporte de tool calling, agentes o multimodales en la información disponible.
- No se especifican capacidades multilingües más allá del inglés.

## Casos de uso

- Investigación académica sobre el efecto del SFT: los checkpoints progresivos permiten estudiar cómo varían las métricas de rendimiento, la calibración o la alucinación con la cantidad de datos de ajuste fino.
- Estudio de la evolución de la representación interna: análisis de activaciones, atención y embeddings a lo largo del proceso de SFT.
- Validación de técnicas de alineación: comparación de checkpoints con distinta dosis de SFT para evaluar el equilibrio entre capacidad de instrucción y generalización.
- Entrenamiento de modelos pequeños para entornos con restricciones de recursos: el modelo de 1B puede ejecutarse en GPU consumer con cuantización, aunque este repo no ofrece pesos cuantizados.
- Replicación de experimentos de la literatura: se puede usar como base para reproducir estudios sobre SFT progresivo o curriculum de datos.
- Desarrollo de modelos especializados: partiendo de un checkpoint con la dosis adecuada de SFT, se puede continuar el entrenamiento en dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K ni otros. El modelo base OLMo-2-1B tiene resultados publicados por Ai2, pero los checkpoints SFT de este repositorio no incluyen evaluaciones propias.

## Requisitos de hardware

- VRAM estimada para inferencia: con bf16 y 1B parámetros, se necesita aproximadamente 2-3 GB de VRAM para inferencia (peso de 2 GB + overhead).
- GPU recomendadas: una RTX 3060 de 12GB o superior es suficiente para inferencia. Para entrenamiento adicional, se recomienda una GPU con al menos 24GB de VRAM (RTX 3090/4090 o A10G).
- El modelo cabe en GPUs consumer (RTX 4060 Ti 16GB, RTX 4070, etc.) sin necesidad de cuantización.
- Opciones de despliegue: se puede usar con transformers de HuggingFace, vLLM (si soporta OLMo), llama.cpp con conversión a GGUF, u Ollama. El repo solo contiene safetensors en bf16.
- Latencia y throughput: no disponible en la información, pero para un modelo de 1B se espera un throughput de 1000-2000 tokens/s en una RTX 4090 con batch adecuado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| OLMo-2-1B (base) | 1B | no disponible | Apache-2.0 | Modelo base sin SFT |
| OLMo-2-7B | 7B | no disponible | Apache-2.0 | Modelo más grande de la familia OLMo 2 |
| OLMo-2-13B | 13B | no disponible | Apache-2.0 | Modelo más grande de la familia OLMo 2 |
| Llama 3.2 1B | 1B | 128K | Llama 3.2 | Modelo de tamaño similar, pero con licencia propietaria |

No se dispone de benchmarks comparativos entre estos modelos y el checkpoint SFT de este repositorio. La comparación con Llama 3.2 1B es relevante por tamaño, pero el contexto y las capacidades pueden diferir.

## Limitaciones y advertencias

- Modelo de 1B con capacidades limitadas de razonamiento y generación de código complejo.
- No se especifica el dataset de SFT, por lo que el sesgo y la calidad dependen de los datos utilizados por el autor.
- Riesgo de alucinación en temas factuales, especialmente en dominios no cubiertos por el corpus de preentrenamiento.
- La longitud de contexto no está documentada; se asume la del modelo base OLMo-2-1B, pero no se puede confirmar.
- Licencia Apache-2.0 permite uso comercial, pero el modelo es un checkpoint de investigación sin garantías de robustez en producción.
- No se incluyen cuantizaciones ni optimizaciones para inferencia; el usuario debe convertir los pesos si necesita GGUF u otros formatos.
- No hay soporte para tool calling, agentes o funciones multimodales.

## Enlaces

- HuggingFace: https://huggingface.co/dvader13/olmo2-1b-sft-s1-336b
- Modelo base OLMo-2-1B: https://huggingface.co/allenai/OLMo-2-0425-1B
- Blog de Ai2 sobre OLMo 2: https://allenai.org/blog/olmo2
- GitHub OLMo-SFT: https://github.com/mzyy1001/OLMo-SFT
- Web de OLMo: https://allenai.org/olmo
