# huggingtime12/Qwen3-4B-noSFT-PhoMT-GRPO-BLEU-COMET

## Resumen

Qwen3-4B-noSFT-PhoMT-GRPO-BLEU-COMET es un adaptador LoRA publicado por el usuario huggingtime12 sobre el modelo base Qwen/Qwen3-4B. Se trata de un fine-tuning mediante GRPO (Group Relative Policy Optimization), la técnica de aprendizaje por refuerzo empleada en el entrenamiento de la familia Qwen3, aplicada aquí sobre un subconjunto de 4B parámetros. El nombre del repositorio sugiere un entrenamiento orientado a traducción automática (PhoMT como posible conjunto de datos y BLEU/COMET como métricas de evaluación), aunque la model card no confirma ninguno de estos extremos.

El modelo se distribuye exclusivamente como pesos de adaptador PEFT (0,5 GB en el repositorio), no como pesos completos, por lo que requiere cargar el Qwen3-4B base y aplicar el adaptador encima. Es relevante para quienes quieran reproducir o experimentar con pipelines de RL sobre modelos pequeños de la familia Qwen3 sin reentrenar desde cero, aunque la ausencia total de documentación limita seriamente su uso en producción.

La información disponible es mínima: la model card es la plantilla por defecto de Hugging Face sin rellenar, el repositorio no tiene descargas ni likes, y no se han publicado resultados de evaluación, hiperparámetros ni detalles del dataset. Todo lo que se indica a continuación sobre el modelo base procede de las características conocidas de Qwen3-4B, no del adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3-4B) con adaptador LoRA (PEFT) |
| Parametros totales | 4B en el modelo base; tamaño del adaptador no disponible (repo de 0,5 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para el adaptador; el modelo base Qwen3-4B soporta hasta 32 768 tokens nativos (extensible según configuración) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base admite cuantización estándar) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen3-4B, un transformer decoder-only de la familia Qwen3 con 4 000 millones de parámetros, atención con RoPE y soporte de modo "thinking" en el modelo base. El adaptador en sí es un LoRA de bajo rango gestionado con la librería PEFT 0.18.0 y entrenado con TRL, según los tags del repositorio. El tag `grpo` indica que el ajuste se realizó con Group Relative Policy Optimization, un algoritmo de RL sin modelo crítico que genera múltiples respuestas por prompt y optimiza la política respecto a recompensas relativas dentro del grupo.

El nombre del repositorio incluye `noSFT` (probablemente indicando que no hubo una fase previa de supervised fine-tuning) y `PhoMT-GRPO-BLEU-COMET`, lo que apunta a un entrenamiento orientado a traducción automática con recompensas basadas en BLEU y COMET. Sin embargo, la model card no documenta el dataset, el número de tokens, la composición de las recompensas, los hiperparámetros ni el régimen de precisión. No hay información sobre innovaciones técnicas adicionales.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3-4B.
- Razonamiento y matemáticas básicas, según las capacidades del base.
- Generación de código, según las capacidades del base.
- Soporte de tool calling y function calling, heredado del base (no verificado en el adaptador).
- Modo "thinking" del base Qwen3 (no se confirma si el adaptador lo preserva).
- Capacidades multilingües del base (no verificadas tras el ajuste).
- Especialización probable en traducción automática, inferida únicamente del nombre del repositorio; no confirmada.

## Casos de uso

- Experimentación con RL para traducción automática: el adaptador puede cargarse sobre Qwen3-4B con PEFT para reproducir o comparar el efecto de GRPO con recompensas BLEU/COMET en un modelo de 4B, útil en investigación académica sobre métricas de traducción.
- Prototipado de sistemas de traducción de bajo coste: al ser un adaptador de 0,5 GB sobre un base de 4B, puede desplegarse en una sola GPU consumer para pruebas de concepto, siempre que se valide la calidad real del adaptador.
- Estudio de pipelines GRPO sin SFT: sirve como referencia para investigar si el RL directo sobre el base (sin fase supervisada) produce mejoras medibles en tareas generativas.
- Base para ablaciones académicas: comparar este adaptador con variantes con SFT previo o con otras recompensas permite aislar el efecto del algoritmo y de la función de recompensa.
- Fine-tuning incremental: el adaptador puede servir como punto de partida para nuevos ajustes LoRA con PEFT, reduciendo el coste frente a partir del base.
- Evaluación de robustez de Qwen3-4B tras RL: medir regresiones en razonamiento, código o multilingüismo tras el ajuste con GRPO orientado a traducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de BLEU, COMET ni de evaluación general, y el repositorio no registra descargas ni evaluaciones de la comunidad.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-4B en bf16 requiere aproximadamente 8-9 GB; en cuantización de 4 bits, alrededor de 3-4 GB. El adaptador LoRA añade una sobrecarga mínima (repo de 0,5 GB).
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 para bf16; RTX 3090/4080 o superiores para cuantización 4 bits.
- Cabe en GPU consumer: sí, en RTX 4090 (bf16) y en GPUs de 8-12 GB con cuantización (RTX 3060 12 GB, RTX 4070).
- Opciones de despliegue: transformers + PEFT para cargar el adaptador; vLLM y TGI admiten adaptadores LoRA en algunos casos, pero la compatibilidad con este adaptador concreto no está verificada. llama.cpp/Ollama requerirían fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3-4B-noSFT-PhoMT-GRPO-BLEU-COMET | 4B + LoRA | No disponible | No disponible | Adaptador PEFT en HF | Sin documentación ni benchmarks |
| Qwen/Qwen3-4B | 4B | 32 768 tokens | Apache 2.0 (según el base) | Pesos completos en HF | Modelo base oficial, documentado |
| Qwen3-4B con LoRA de traducción (alternativas comunitarias) | 4B + LoRA | Variable | Variable | HF | Sin comparación directa disponible |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- La model card es la plantilla por defecto sin rellenar: no hay información sobre dataset, hiperparámetros, evaluación ni uso previsto.
- Licencia no especificada: no se puede confirmar el uso comercial. La licencia del modelo base Qwen3-4B (Apache 2.0) no cubre automáticamente el adaptador si el autor no la declara.
- Riesgo elevado de alucinación y de comportamiento impredecible: un ajuste GRPO sin SFT previo puede degradar capacidades del base (razonamiento, código, instrucciones) si la recompensa se centra solo en BLEU/COMET.
- Sin verificación de calidad: cero descargas y cero likes; no hay evidencia de que el adaptador funcione como su nombre sugiere.
- Idiomas soportados no documentados; el comportamiento multilingüe tras el ajuste es desconocido.
- El sesgo del adaptador es desconocido; hereda los sesgos del base Qwen3-4B y los del dataset de entrenamiento no documentado.
- Para producción, se recomienda evaluar exhaustivamente contra el base y considerar alternativas documentadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingtime12/Qwen3-4B-noSFT-PhoMT-GRPO-BLEU-COMET
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
- Paper de GRPO (DeepSeekMath): https://arxiv.org/abs/2402.03300
- Calculadora de impacto de carbono citada en la model card: https://mlco2.github.io/impact
- Lacoste et al. (2019): https://arxiv.org/abs/1910.09700
