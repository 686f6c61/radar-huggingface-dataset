# reaperdoesntknow/Qemma-GEI

## Resumen

Qemma-GEI es un modelo de lenguaje de aproximadamente 1000 millones de parámetros desarrollado por el usuario independiente reaperdoesntknow (Convergent Intelligence LLC: Research Division). Se trata de un híbrido construido mediante fusión de pesos a nivel de capa entre Gemma-3 (1B) y Qwen-3 (0.6B): conserva el cuerpo y la MLP de Gemma-3 y sustituye la atención por una atención de estilo Qwen reproyectada a la dimensionalidad oculta de Gemma. Sobre esa base se aplicó un ajuste supervisado (SFT) orientado a razonamiento paso a paso.

El modelo se presenta como parte del marco teórico "Discrepancy Calculus" (DISC) del autor, una aproximación de teoría de la medida al análisis de fallos de entrenamiento. La variante GEI ("Gap Envelope Integral") añade escalado RoPE de tipo YaRN en proporción 1:1 respecto a `max_position_embeddings`, además de una lógica de fusión por capas y una ronda de alineamiento de embeddings posterior a la fusión.

Es relevante como experimento de investigación sobre fusión de modelos heterogéneos y como ejemplo de modelo pequeño (~1B) entrenado con recursos modestos. No obstante, su validación pública es mínima: un solo "like", ausencia de benchmarks publicados y una model card centrada en la metodología del autor más que en resultados medibles. La licencia OSL-3.0 impone condiciones copyleft que conviene revisar antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido por fusión de pesos: cuerpo y MLP de Gemma-3 (26 capas, hidden 1152, MLP 6912) con atención de estilo Qwen-3 reagrupada a 4x256 cabezas |
| Parametros totales | 999.891.712 (~1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; usa escalado RoPE tipo YaRN en proporción 1:1 respecto a `max_position_embeddings` |
| Tipos de cuantizacion | no disponible (el repo contiene pesos safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (en) |
| Licencia | OSL-3.0 (Open Software License 3.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de 26 capas con dimensión oculta 1152 y MLP de 6912, heredados de Gemma-3 1B. La innovación principal es la sustitución del mecanismo de atención: se injerta la atención de Qwen-3 0.6B, reproyectada y alineada a la dimensión oculta de Gemma y reorganizada en 4 cabezas de 256 dimensiones. La fusión se realiza a nivel de pesos, sin adaptadores, e incorpora una lógica de fusión por capa y una etapa de alineamiento de embeddings posterior a la fusión. El tokenizador y la plantilla de chat son los de Gemma-3.

El entrenamiento consistió en aproximadamente 512 pasos de warm-start sobre HuggingFaceH4/ultrachat_200k, seguidos de una ronda corta de 8 pasos para realinear embeddings tras la fusión, y aproximadamente 256 pasos de SFT sobre una mezcla de TIGER-Lab/MathInstruct y HuggingFaceH4/ultrachat_200k. Se usaron TRL 0.25.0, Transformers 4.57.1, PyTorch 2.8.0+cpu, Datasets 4.4.1 y Tokenizers 0.22.1. No se documentan fases de RLHF ni DPO, ni el volumen total de tokens procesados.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat propia de Gemma-3.
- Razonamiento paso a paso: el SFT se orientó explícitamente a stepwise reasoning y la plantilla de ejemplo incluye etiquetas `<think>` y `<reasoning_step>`.
- Resolución de problemas matemáticos elementales, gracias a la inclusión de MathInstruct en el conjunto de SFT.
- Seguimiento de instrucciones y asistencia general, derivado de ultrachat_200k.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso autónomo: no disponible (no documentado más allá del formato de razonamiento).
- Capacidades multimodales (visión, audio): no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo "thinking" estructurado: parcial, mediante etiquetas de razonamiento en el prompt, sin garantía de comportamiento consistente.

## Casos de uso

- Investigación en fusión de modelos: permite estudiar empíricamente qué ocurre al combinar el cuerpo de un modelo con la atención de otro de distinta familia, sirviendo como banco de pruebas para técnicas de merging a nivel de pesos.
- Experimentación con razonamiento paso a paso en modelos pequeños: adecuado para probar formatos de cadena de pensamiento y evaluar su efecto en tareas matemáticas simples con un presupuesto de cómputo reducido.
- Prototipado de asistentes conversacionales en inglés: su plantilla de chat y su SFT sobre ultrachat_200k permiten montar demos de diálogo multi-turno en entornos de desarrollo sin requisitos de hardware elevados.
- Fine-tuning posterior (SFT/RLHF) como base de investigación: al ser un modelo de ~1B en safetensors y con licencia OSL-3.0, sirve como punto de partida para experimentos académicos de ajuste adicional.
- Evaluación de alineamiento de embeddings tras merging: útil para reproducir y analizar la etapa de realineamiento posterior a la fusión que describe el autor.
- Docencia y divulgación sobre arquitecturas híbridas: permite ilustrar de forma práctica cómo se combinan componentes de dos familias de modelos (Gemma y Qwen) y qué implicaciones tiene en tokenizador, atención y dimensionalidad.
- Despliegue en entornos con GPU de gama media para pruebas internas: al rondar los 1000 millones de parámetros, es viable en GPUs de consumo con cuantización, aunque el autor no publica variantes cuantizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los ~1000 millones de parámetros ocupan aproximadamente 2 GB de pesos; con caché KV y overhead del runtime, se recomienda un mínimo de 4-6 GB de VRAM. En cuantización de 8 bits, en torno a 1-1,5 GB de pesos; en 4 bits, alrededor de 0,6-0,8 GB (estimaciones por tamaño, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para bfloat16; A100, H100 o L40S para despliegue con concurrencia; RTX 4090, RTX 3090, RTX 4070 Ti o superiores para uso individual.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en bfloat16 y en GPUs de 4-6 GB si se cuantiza.
- Opciones de despliegue: Transformers (probado por el autor con PyTorch 2.8.0), text-generation-inference (el repo está etiquetado como compatible con endpoints), y previsiblemente llama.cpp/Ollama si se generan pesos GGUF, aunque el autor no los publica.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qemma-GEI | ~1B | no disponible (YaRN 1:1) | OSL-3.0 | Hugging Face, safetensors | Fusión Gemma-3 + Qwen-3, SFT en inglés |
| Gemma-3 1B (Google) | ~1B | 32K (según familia Gemma-3) | Gemma Terms of Use | Hugging Face, amplia adopción | Modelo base del cuerpo; benchmarks públicos |
| Qwen-3 0.6B (Alibaba) | ~0,6B | 32K (según familia Qwen-3) | Apache 2.0 | Hugging Face, amplia adopción | Modelo base de la atención; benchmarks públicos |
| SmolLM2 1.7B (Hugging Face) | ~1,7B | 8K | Apache 2.0 | Hugging Face, GGUF disponible | Alternativa pequeña con amplia documentación |

La comparación con los modelos base es directa en tamaño pero no en rendimiento: Qemma-GEI no publica métricas que permitan situarlo frente a Gemma-3 1B o Qwen-3 0.6B. La licencia OSL-3.0 es más restrictiva que Apache 2.0 y distinta de los términos de Gemma, lo que limita su adopción comercial frente a las alternativas.

## Limitaciones y advertencias

- Riesgo de alucinación: el propio autor lo advierte y desaconseja su uso en decisiones críticas de seguridad, médicas, legales o financieras.
- Idiomas: solo se declara inglés; no hay evidencia de calidad en castellano ni en otros idiomas.
- Contexto: la longitud efectiva de contexto no se documenta; el escalado YaRN 1:1 respecto a `max_position_embeddings` no garantiza calidad más allá de la ventana nativa.
- Validación insuficiente: sin benchmarks publicados, sin evaluaciones de terceros y con un único "like", no hay evidencia independiente de su rendimiento real.
- Licencia OSL-3.0: es una licencia copyleft; su uso comercial, redistribución o integración en productos puede exigir la publicación del código derivado. Conviene revisar los términos con asesoramiento legal.
- Naturaleza experimental: la fusión de pesos entre familias distintas puede producir degradaciones sutiles (incoherencias, olvidos de instrucciones) difíciles de detectar sin evaluación sistemática.
- Sesgos: no se documenta ningún análisis de sesgos; al entrenarse sobre ultrachat_200k y MathInstruct, hereda los sesgos de esos conjuntos.
- Formato de razonamiento: las etiquetas `<think>` y `<reasoning_step>` no están estandarizadas ni garantizadas; el modelo puede no respetarlas de forma consistente.
- Producción: no se recomienda su uso en producción sin una evaluación previa propia y sin verificar la compatibilidad del tokenizador y la plantilla de chat con el pipeline de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qemma-GEI
- Modelo base (Qemma-redux): https://huggingface.co/reaperdoesntknow/Qemma-redux
- Perfil del autor (Convergent Intelligence LLC: Research Division): https://huggingface.co/reaperdoesntknow
- Discrepancy Calculus: Foundations and Core Theory (DOI: 10.57967/hf/8194): https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus
- Structure Over Scale (DOI: 10.57967/hf/8165): https://huggingface.co/reaperdoesntknow/Structure-Over-Scale
- Three Teachers to Dual Cognition (DOI: 10.57967/hf/8184): https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy
- Dataset ultrachat_200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset MathInstruct: https://huggingface.co/datasets/TIGER-Lab/MathInstruct
- Repositorio TRL: https://github.com/huggingface/trl
