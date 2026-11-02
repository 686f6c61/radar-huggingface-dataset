# mdd65/DeepSeek-V4-Flash

## Resumen

DeepSeek-V4-Flash es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por DeepSeek AI, presentado como la variante ligera de la familia DeepSeek-V4. Con 284 000 millones de parámetros totales y 13 000 millones activados por token, está disenado para ofrecer razonamiento de alto nivel con un coste de inferencia contenido. Su rasgo más distintivo es una longitud de contexto de un millón de tokens, soportada por una arquitectura de atención híbrida que combina Compressed Sparse Attention (CSA) y Heavily Compressed Attention (HCA).

El modelo se entrena sobre más de 32 billones de tokens y emplea un pipeline de post-entrenamiento en dos fases: cultivo independiente de expertos por dominio (SFT y RL con GRPO) y consolidación posterior mediante destilación on-policy. Incorpora además innovaciones como Manifold-Constrained Hyper-Connections (mHC) para estabilizar la propagación de senales entre capas y el optimizador Muon para acelerar la convergencia.

La relevancia de esta ficha radica en que el repositorio publicado por el usuario `mdd65` bajo el identificador `mdd65/DeepSeek-V4-Flash` replica la model card oficial de DeepSeek pero con pesos en formato safetensors de 290 944 616 402 parámetros (frente a los 284B declarados en la card), licencia MIT y sin información verificable sobre el proceso de conversión. Es importante tratar este repositorio con cautela: no es una publicación oficial de DeepSeek AI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida (CSA + HCA) y mHC |
| Parámetros totales | 290 944 616 402 (según safetensors del repo); 284B según model card |
| Parámetros activos | 13B |
| Longitud de contexto | 1 000 000 tokens |
| Tipos de cuantización | FP4 + FP8 mixto (expertos MoE en FP4, resto en FP8); el repo indica 8-bit/fp8 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DeepSeek-V4-Flash es un transformer disperso de tipo MoE. La innovación principal es la atención híbrida que combina Compressed Sparse Attention (CSA) y Heavily Compressed Attention (HCA); según la model card, en contexto de 1M tokens el modelo Pro de la misma familia requiere solo el 27 % de los FLOPs de inferencia por token y el 10 % del KV cache en comparación con DeepSeek-V3.2. Se anaden Manifold-Constrained Hyper-Connections (mHC) para reforzar las conexiones residuales y preservar la expresividad, y se entrena con el optimizador Muon.

El preentrenamiento emplea más de 32 billones de tokens diversos y de alta calidad. El post-entrenamiento sigue un paradigma en dos etapas: primero se cultivan expertos por dominio mediante SFT y RL con GRPO, y después se consolidan en un único modelo mediante destilación on-policy. La variante Flash-Max, con mayor presupuesto de pensamiento, alcanza un rendimiento de razonamiento comparable al modelo Pro, aunque queda ligeramente por detrás en tareas de conocimiento puro y flujos agénticos complejos.

## Capacidades

- Generación de texto y razonamiento de propósito general con modo de pensamiento extendido (Flash-Max).
- Razonamiento matemático y resolución de problemas de múltiples pasos.
- Generación y comprensión de código, con resultados destacados en benchmarks de programación según la model card.
- Procesamiento de contexto ultralargo de hasta 1 000 000 de tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Capacidades agénticas y flujos de trabajo multi-step, con especial énfasis en tareas de razonamiento y agentes.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponible (los idiomas no están declarados en el repo).
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Análisis de documentación extensa: con 1M tokens de contexto, el modelo puede ingerir contratos, informes anuales o bases de código completas en una sola pasada sin necesidad de chunking, lo que reduce la pérdida de información entre fragmentos.
- Asistencia en programación en producción: integrable en pipelines de revisión de código y generación de tests, aprovechando su rendimiento en benchmarks de coding y su ventana de contexto para razonar sobre repositorios completos.
- Razonamiento matemático y científico: útil para resolución de problemas de varios pasos donde el modo de pensamiento extendido (Flash-Max) mejora la precisión a costa de mayor latencia.
- Agentes autónomos de múltiples pasos: su capacidad agéntica permite encadenar llamadas a herramientas y razonamiento intermedio, aunque la model card advierte que en flujos agénticos muy complejos queda por detrás del modelo Pro.
- Atención al cliente con historial largo: conversaciones multi-turno con memoria de contexto amplia, útil en soporte técnico donde el historial completo es relevante.
- Investigación y síntesis bibliográfica: procesamiento de grandes volúmenes de papers o documentación técnica en una única ventana de contexto para extracción de conclusiones cruzadas.
- Despliegue en infraestructura con FP8/FP4: al publicarse en precisión mixta, puede servirse en GPUs con soporte de FP8 (H100, H200) reduciendo el coste de memoria frente a FP16.

## Benchmarks y rendimiento

Resultados de los modelos base según la model card (DeepSeek-V4-Flash-Base frente a V3.2-Base y V4-Pro-Base):

| Benchmark (métrica) | Shots | V3.2-Base | V4-Flash-Base | V4-Pro-Base |
|---|---|---|---|---|
| AGIEval (EM) | 0-shot | 80,1 | 82,6 | 83,1 |
| MMLU (EM) | 5-shot | 87,8 | 88,7 | 90,1 |
| MMLU-Redux (EM) | 5-shot | 87,5 | 89,4 | 90,8 |
| MMLU-Pro (EM) | 5-shot | 65,5 | 68,3 | 73,5 |
| MMMLU (EM) | 5-shot | 87,9 | 88,8 | 90,3 |
| C-Eval (EM) | 5-shot | 90,4 | 92,1 | 93,1 |
| CMMLU (EM) | 5-shot | 88,9 | 90,4 | 90,8 |

La información proporcionada solo incluye resultados de los modelos base; no se han publicado en este repositorio datos de benchmarks para la variante instruct/chat DeepSeek-V4-Flash (la que replica este repo).

## Requisitos de hardware

- VRAM estimada: con 290 944 M de parámetros en FP8, el peso ronda los 290 GB; en FP4 para expertos y FP8 para el resto, la huella puede reducirse de forma significativa, pero sigue requiriendo múltiples GPUs.
- No cabe en GPUs de consumo (RTX 4090, 24 GB): el modelo completo exige agregación de memoria en varios aceleradores.
- GPU recomendadas: clústeres con H100/H200 (80/141 GB) o A100 (80 GB); se necesitan al menos 4 GPUs de 80 GB en FP8 para alojar los pesos, y más para KV cache en contexto largo.
- El KV cache es un factor crítico: aunque la arquitectura CSA/HCA reduce el KV cache al 10 % frente a V3.2 en contexto de 1M, sigue siendo sustancial a máxima longitud.
- Opciones de despliegue: vLLM, TGI y SGLang para serving en FP8; llama.cpp/Ollama no son viables por el tamano. El tag `endpoints_compatible` sugiere compatibilidad con endpoints estilo OpenAI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Params totales | Params activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash | 284B (290,9B en repo) | 13B | 1M | MIT | Repo de terceros `mdd65/...` |
| DeepSeek-V4-Pro | 1,6T | 49B | 1M | MIT | Oficial DeepSeek AI |
| DeepSeek-V3.2 | 671B | 37B | no disponible | MIT | Oficial DeepSeek AI |

Frente a V3.2, V4-Flash reduce parámetros activos de 37B a 13B y mejora en MMLU (88,7 vs 87,8) y MMLU-Pro (68,3 vs 65,5). Frente a V4-Pro, Flash es más ligero pero queda por detrás en conocimiento puro y flujos agénticos complejos. No se dispone de comparación con modelos de otros proveedores en la información proporcionada.

## Limitaciones y advertencias

- El repositorio `mdd65/DeepSeek-V4-Flash` no es una publicación oficial de DeepSeek AI; el autor es un tercero y no hay verificación de que los pesos correspondan al modelo oficial.
- Discrepancia de parámetros: el safetensors declara 290 944 616 402 parámetros frente a los 284B de la model card oficial, lo que sugiere posibles diferencias en la conversión o empaquetado.
- Idiomas soportados no declarados: riesgo de comportamiento degradado en lenguas distintas del inglés y chino.
- Riesgo de alucinación inherente a modelos de lenguaje de gran escala; no se documentan mitigaciones específicas en la información disponible.
- Licencia MIT declarada, pero al tratarse de un repo de terceros conviene verificar la procedencia y los términos reales antes de uso comercial.
- La model card advierte que la variante Flash queda por detrás del modelo Pro en conocimiento puro y flujos agénticos complejos.
- El contexto de 1M tokens, aunque soportado, puede degradar la calidad en los extremos de la ventana; no se aportan métricas de rendimiento a longitud máxima.
- Sin datos de sesgos, evaluaciones de seguridad ni resultados de la variante instruct en la información disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mdd65/DeepSeek-V4-Flash
- Modelo oficial DeepSeek-V4-Flash: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Modelo oficial DeepSeek-V4-Flash-Base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Base
- Modelo oficial DeepSeek-V4-Pro: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro
- Modelo oficial DeepSeek-V4-Pro-Base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-Base
- Informe técnico (arXiv): https://arxiv.org/abs/2606.19348
- Organización DeepSeek AI en HuggingFace: https://huggingface.co/deepseek-ai
- Página principal: https://www.deepseek.com/
- Chat: https://chat.deepseek.com/
- ModelScope (Flash): https://modelscope.cn/models/deepseek-ai/DeepSeek-V4-Flash
- ModelScope (Flash-Base): https://modelscope.cn/models/deepseek-ai/DeepSeek-V4-Flash-Base
