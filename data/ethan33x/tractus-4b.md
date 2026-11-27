# Ethan33X/Tractus-4B

## Resumen

Tractus-4B es un modelo de decisión de doble modo (dual-mode) desarrollado por el usuario Ethan33X y entrenado a partir de Qwen/Qwen3.5-4B-Base. Su particularidad es que combina un "Sistema 1" de puntuación de opciones en una sola pasada de prefill (sin generar tokens) con un "Sistema 2" de deliberación conjunta que activa razonamiento multi-paso sobre la misma caché KV. Está pensado para tareas de clasificación, calibración y enrutamiento (routing) donde el coste de decodificación autoregresiva es un cuello de botella.

La arquitectura hereda el backbone híbrido de Qwen3.5, con 32 capas (24 Gated DeltaNet + 8 Gated Attention), 4.841 millones de parámetros totales y una ventana de contexto nativa de 262.144 tokens. El modelo se distribuye con licencia "modified-mit" y está etiquetado como compatible con endpoints, con pesos en safetensors y soporte en transformers.

Es relevante ahora porque propone un paradigma distinto al de los LLM generativos convencionales: en lugar de generar texto para decidir, lee el estado de entrada y las opciones candidatas en un único pase de prefill, reduciendo la latencia y el consumo de tokens en escenarios de decisión estructurada. Su enfoque de calibración (Thermostasis) y su modo dual buscan cubrir tanto decisiones rápidas como razonamiento deliberado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Qwen3.5: 32 capas (24 Gated DeltaNet + 8 Gated Attention), vision-language |
| Parametros totales | 4.841.450.496 (4,21B según model card; 3,57B backbone sin embeddings) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | BF16 e INT4 mencionados en la model card; no se detallan otros formatos |
| Idiomas soportados | en (inglés) |
| Licencia | modified-mit (Modified MIT License, con aviso Apache-2.0 de Qwen3.5) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-4B-Base, un backbone híbrido vision-language que alterna capas Gated DeltaNet y Gated Attention en proporción 3:1, con dimensión oculta de 2.560 y FFN de 9.216, y un vocabulario de 248.320 tokens. Tractus-4B añade un cabezal de decisión que sustituye la proyección al vocabulario por una lectura de las opciones candidatas en la posición terminal, con una proyección de salida un 99,9% menor que el cabezal de vocabulario completo.

El post-entrenamiento introduce dos modos: Sistema 1, que puntúa opciones en una sola pasada de prefill con 0 tokens generados, y Sistema 2, que activa deliberación multi-paso reutilizando la caché KV del prefill sin re-prefill. La calibración se realiza mediante "Thermostasis": un desplazamiento opcional de prior binario, softcapping de logits con tanh (C = 30,0), centrado de suma cero y un termostato analítico 2D sin parámetros ajustados por validación. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO.

## Capacidades

- Generación de decisiones calibradas sobre opciones candidatas (2–255 opciones) en una sola pasada, sin generar tokens.
- Razonamiento multi-paso mediante el modo dual (Sistema 2) con deliberación conjunta y salida final.
- Clasificación y calibración de probabilidades de opciones.
- Enrutamiento (routing) y selección entre alternativas.
- Capacidades multimodales heredadas del backbone Qwen3.5 (texto, JSON estructurado, layouts de UI y estados espaciales según la model card).
- Soporte de contexto largo de hasta 262.144 tokens.
- Capacidad de salida con cero tokens (zero-token exits) en un 43,7% de los casos según el autor.
- Idiomas: únicamente inglés según la model card.

## Casos de uso

- Enrutamiento de intenciones en atención al cliente: el modelo puede puntuar directamente entre un conjunto de intenciones candidatas en una sola pasada de prefill, sin generar texto, lo que reduce la latencia en sistemas de triaje con contexto largo (hasta 256K tokens).
- Clasificación de documentos con contexto extenso: gracias a su ventana de 262.144 tokens, puede procesar contratos, informes o expedientes completos y decidir entre categorías predefinidas con calibración de probabilidades.
- Navegación web automatizada: la model card reporta un 83,00% en Mind2Web en la suite comercial, lo que lo hace adecuado para agentes que seleccionan acciones sobre interfaces.
- Decisión de llamada a herramientas (When2Call): con un 80,00% reportado en When2Call, puede integrarse en pipelines de agentes para decidir cuándo invocar una función externa.
- Moderación y detección de riesgo: el autor menciona prior binario para alucinación en RAGTruth y phishing en PhishNChips, útil en sistemas de filtrado y seguridad.
- Dinámica espacial multiagente: la demo JevBall con 22 agentes bajo SLA de 300 ms sugiere uso en simulación y control de agentes en tiempo real.
- Asistente de reuniones en tiempo real: la demo Full-Duplex Meeting Sentinel apunta a aplicaciones de seguimiento y decisión sobre transcripciones en vivo.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados):

| Benchmark | Métrica | Valor |
|---|---|---|
| Decision Index 0.3 | Balanced Skill | 41,31 |
| Decision Index 0.3 | Balanced Raw Accuracy | 55,56% |
| JevBench 231 | Overall Accuracy (dual-mode, 8K) | 88,31% (204/231) |
| JevBench 231 | Single-pass Tractus-decision | 76,19% |
| Pooled 9-Task | Accuracy | 72,08% (+7,51 pp sobre single-pass) |
| Matched Commercial Suite (256K) | JevBench | 89,61% (207/231) |
| Matched Commercial Suite (256K) | Mind2Web | 83,00% |
| Matched Commercial Suite (256K) | When2Call | 80,00% |
| Matched Commercial Suite (256K) | Pooled ECE (raw) | 4,99% (1,07% OOF) |
| Amazon ESCI (Tractus-decision-4B) | Accuracy | 67,10% con ECE 2,46% raw / 1,45% OOF |

Desglose JevBench 231 dual-mode 8K: 48/48 Easy, 69/72 Standard, 87/111 Hard.

## Requisitos de hardware

- VRAM estimada: BF16 aproximadamente 8,4 GB; INT4 aproximadamente 2,2 GB (según model card).
- GPU recomendadas: no se especifican modelos concretos; la model card menciona ejecución en Apple Silicon Metal GPU (MLX INT4) y CUDA/PyTorch (BF16).
- Cabe en GPU de consumo: con INT4 (2,2 GB) es viable en GPUs consumer con al menos 4–6 GB de VRAM; en BF16 requiere alrededor de 8,4 GB, asequible en RTX 3060 12 GB, RTX 4070 o superiores.
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles; no se detallan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: la model card menciona SLA de 300 ms en la demo JevBall y un 43,7% de salidas con cero tokens; no se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Tractus-4B | 4,84B (4,21B según card) | 262.144 | Decisión dual-mode sobre Qwen3.5 | modified-mit |
| Tractus-decision-4B | no disponible | 262.144 | Solo Sistema 1 (single-pass) | modified-mit |
| Qwen3.5-4B-Base | 4B (base) | no disponible | LLM generativo vision-language | Apache-2.0 |

No se dispone de datos de benchmarks comparables con otros modelos de decisión de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; al entrenarse sobre Qwen3.5, puede heredar sesgos del corpus base.
- Riesgo de alucinación: el autor menciona un prior binario que añade +3,2 en alucinación sobre RAGTruth, lo que indica que el modelo puede verse afectado en tareas de veracidad.
- Limitaciones de idioma: solo inglés declarado; no hay soporte multilingüe confirmado.
- Restricciones de licencia: licencia "modified-mit" con términos comerciales/MaaS propios de Tractus y aviso Apache-2.0 de Qwen3.5; es necesario revisar el archivo LICENSE antes de uso comercial.
- Los benchmarks son declarados por el autor y no están verificados (verified: false).
- El pipeline es "decision-model", no text-generation convencional; requiere adaptación de la integración (por ejemplo, quickstart_dual_mode.py).
- El modelo tiene pocas descargas (11) y ningún "like", lo que sugiere poca validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/Ethan33X/Tractus-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Variante single-pass: https://huggingface.co/Ethan33X/Tractus-decision-4B
- Variante 0.8B: https://huggingface.co/Ethan33X/Tractus-0.8B
- Variante 2B: https://huggingface.co/Ethan33X/Tractus-2B
- Variante 9B: https://huggingface.co/Ethan33X/Tractus-9B
- Dataset Decision Index 0.3: https://huggingface.co/datasets/Ethan33X/tractus-decision-index-0.3
- Licencia: https://huggingface.co/Ethan33X/Tractus-4B/blob/main/LICENSE
