# s3t4/LFM3-1.7B-Gemma-4-12B-Distill-Indonesian

## Resumen

LFM3-1.7B-Gemma-4-12B-Distill-Indonesian es un checkpoint en indonesio del modelo LiquidAI/LFM3-1.7B, desarrollado por el usuario s3t4. Se trata de un ajuste fino supervisado (SFT) mediante destilación de conocimiento desde google/gemma-4-12B-it como modelo profesor, seguido de la fusión de los adaptadores LoRA en los pesos finales. El objetivo es dotar a un modelo compacto de 1,73 mil millones de parámetros de capacidades de razonamiento y respuesta en bahasa indonesio que originalmente no posee de forma nativa.

El modelo parte de la arquitectura tri-híbrida de LFM3, que combina atención, convoluciones cortas y capas de estado, con una ventana de contexto de 256K tokens. La destilación no se hizo por coincidencia de logits (los tokenizadores difieren: 262K del profesor frente a 128K del estudiante), sino generando racionales y respuestas sintéticas con el profesor y entrenando al estudiante sobre ellas.

Es relevante porque demuestra que un modelo de 1,7B puede mejorar sustancialmente en tareas de conocimiento y sentido común en un idioma de recursos medios mediante destilación selectiva y un conjunto de datos pequeño y curado (2.700 ejemplos), con incrementos de más de 20 puntos porcentuales en IndoMMLU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tri-hibrida (LFM3: atención + convoluciones cortas + capas de estado) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256K tokens (heredada de LFM3-1.7B) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el profesor se usó en 4-bit NF4; el modelo publicado está en safetensors bf16) |
| Idiomas soportados | Indonesio (id) |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | safetensors (transformers, con código custom) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura tri-híbrida de LiquidAI/LFM3-1.7B, que combina mecanismos de atención con convoluciones cortas y capas de estado recurrentes, con un vocabulario de 128K tokens y una ventana de contexto de 256K tokens. Sobre esta base se aplicó un ajuste fino con LoRA (r=16, alpha=32, dropout=0.05) dirigido a las proyecciones de atención (q_proj, k_proj, v_proj, o_proj), a las proyecciones de las convoluciones cortas (in_proj, out_proj) y a las capas MLP (w1, w2, w3), con 2 épocas, batch efectivo de 16, learning rate 1e-4, scheduler coseno, max_length 1024 y bf16. Los adaptadores se fusionaron con merge_and_unload().

El proceso de destilación se basó en la generación de datos sintéticos por parte de google/gemma-4-12B-it (en 4-bit NF4, con enable_thinking=False). Se generaron 1.000 racionales de IndoMMLU (500 en bahasa indonesio y 500 de currículo general, con 0% de fuga del conjunto de test), 100 racionales de XCOPA-ID sobre lógica causal, y 500 respuestas de instrucciones generales (300 de aya_dataset y 200 de aksara-sft-clean-v1). El conjunto final de SFT contiene 2.700 ejemplos: 1.000 pares de racional y 1.000 de calibración de formato MCQ para IndoMMLU, 100 + 100 para XCOPA, y 300 + 200 de instrucciones. No se empleó RLHF ni DPO.

## Capacidades

- Generación de texto conversacional en bahasa indonesio, con plantilla de chat que admite rol de sistema y usuario.
- Razonamiento de opción múltiple sobre conocimiento general y currículo indonesio (IndoMMLU).
- Razonamiento de sentido común causal (XCOPA-ID).
- Respuesta a instrucciones generales en indonesio procedentes de aya_dataset y aksara-sft-clean-v1.
- Modo de pensamiento desactivable mediante `enable_thinking=False` en la plantilla de chat.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información proporcionada.
- Multilingüismo limitado al indonesio como idioma objetivo declarado; no se especifica rendimiento en otros idiomas.

## Casos de uso

- Evaluación académica de conocimiento en indonesio: el modelo puede usarse como línea base o componente de sistemas de respuesta a preguntas de opción múltiple sobre currículo indonesio, dado su rendimiento del 47,00% en IndoMMLU frente al 25,33% del modelo base.
- Asistente conversacional en indonesio para atención al cliente: la ventana de 256K tokens permite gestionar conversaciones multi-turno con historiales largos y documentación de soporte adjunta, aunque el ajuste se centró en instrucciones generales y razonamiento, no en diálogo de dominio específico.
- Tutoría educativa con explicaciones razonadas: el entrenamiento con racionales de 2-3 frases en indonesio lo hace adecuado para generar explicaciones breves del porqué de una respuesta, no solo la respuesta.
- Razonamiento de sentido común en aplicaciones de NLP indonesio: útil en tareas de inferencia causal y comprensión de relaciones causa-efecto, con un 75,40% en XCOPA-ID.
- Prototipado e investigación sobre destilación: sirve como referencia reproducible de un pipeline de destilación profesor-grande a estudiante-pequeño con tokenizadores distintos, útil para experimentos de eficiencia.
- Despliegue en entornos con recursos limitados: con 1,73B parámetros y pesos bf16 de aproximadamente 3,5 GB, puede ejecutarse en una única GPU de consumo para tareas de generación en indonesio.
- Generación de datos sintéticos en indonesio: puede emplearse para producir racionales y respuestas de calibración de formato en la construcción de datasets de SFT para otros modelos.

## Benchmarks y rendimiento

Evaluación zero-shot con `enable_thinking=False` y logits del primer token, sobre 300 preguntas de IndoMMLU (index < 300, seed=42) y las 500 preguntas del split test de XCOPA-ID:

| Benchmark | LFM3-1.7B (baseline) | Modelo destilado | Mejora |
|---|---|---|---|
| IndoMMLU (bahasa indonesio) | 25,33% (76/300) | 47,00% (141/300) | +21,67 pp |
| IndoMMLU (conocimiento general) | 26,00% (78/300) | 46,67% (140/300) | +20,67 pp |
| XCOPA-ID (sentido común) | 58,60% (293/500) | 75,40% (377/500) | +16,80 pp |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,5 GB de pesos más overhead de activaciones y caché KV; en la práctica, unos 4-6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 2 GB de pesos; en 4 bits, alrededor de 1 GB (no se proporcionan archivos GGUF en el repositorio, por lo que la cuantización requeriría conversión propia).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060/4060, RTX 4070, RTX 4090); A100 o H100 para despliegues de alto throughput o contextos muy largos.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en bf16, y en 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por el código custom de LFM3); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | IndoMMLU | XCOPA-ID | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| s3t4/LFM3-1.7B-Gemma-4-12B-Distill-Indonesian | 1,73B | 256K | 47,00% | 75,40% | LFM 1.0 | Hugging Face |
| LiquidAI/LFM3-1.7B (base) | 1,73B | 256K | 25,33% | 58,60% | LFM 1.0 | Hugging Face |
| google/gemma-4-12B-it (profesor) | 12B (no confirmado) | no disponible | no disponible | no disponible | Apache 2.0 (según model card) | Hugging Face |

No se dispone de datos de otros modelos comparables de tamaño similar especializados en indonesio en la información proporcionada.

## Limitaciones y advertencias

- El ajuste se realizó sobre un conjunto de datos pequeño (2.700 ejemplos) y dos épocas, lo que puede provocar sobreajuste a los formatos de IndoMMLU y XCOPA y degradar el rendimiento en tareas fuera de distribución.
- El modelo está especializado en indonesio; no se garantiza un rendimiento adecuado en otros idiomas.
- Riesgo de alucinación factual: aunque se usaron claves de respuesta oficiales para generar los racionales, el estudiante puede generar contenido incorrecto con alta confianza.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código custom del repositorio; conviene auditar el código antes de usarlo en producción.
- La licencia LFM Open License v1.0 impone restricciones de uso comercial que deben revisarse antes de desplegar el modelo en productos; no es una licencia permisiva tipo Apache o MIT.
- No se documentan evaluaciones de sesgo, toxicidad ni robustez; se desconoce el comportamiento en dominios sensibles.
- El modelo profesor (gemma-4-12B-it) se cita como Apache 2.0 en la model card, pero los términos de los datos destilados deben verificarse por separado.
- No hay archivos GGUF ni cuantizaciones publicadas; el despliegue eficiente en CPU o GPU de gama baja requiere conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/s3t4/LFM3-1.7B-Gemma-4-12B-Distill-Indonesian
- Modelo base LiquidAI/LFM3-1.7B: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Modelo profesor google/gemma-4-12B-it: https://huggingface.co/google/gemma-4-12B-it
- Dataset indolem/IndoMMLU: https://huggingface.co/datasets/indolem/IndoMMLU
- Dataset cambridgeltl/xcopa: https://huggingface.co/datasets/cambridgeltl/xcopa
- Dataset CohereLabs/aya_dataset: https://huggingface.co/datasets/CohereLabs/aya_dataset
- Dataset AksaraLLM/aksara-sft-clean-v1: https://huggingface.co/datasets/AksaraLLM/aksara-sft-clean-v1
