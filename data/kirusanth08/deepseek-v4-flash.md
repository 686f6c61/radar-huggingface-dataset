# kirusanth08/DeepSeek-V4-Flash

## Resumen

DeepSeek-V4-Flash es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por DeepSeek AI, presentado como versión preliminar junto a DeepSeek-V4-Pro. Con 284.000 millones de parámetros totales (13.000 millones activos) y una ventana de contexto de un millón de tokens, está diseñado para tareas de razonamiento, generación de código y flujos agénticos en contextos extremadamente largos. La subida analizada en Hugging Face corresponde al usuario `kirusanth08`, no al perfil oficial de DeepSeek, por lo que debe tratarse como un espejo o reempaquetado del modelo original.

Su relevancia radica en la arquitectura híbrida de atención que combina Compressed Sparse Attention (CSA) y Heavily Compressed Attention (HCA), reduciendo drásticamente los FLOPs de inferencia y el uso de caché KV en comparación con generaciones anteriores. El modelo incorpora además conexiones residuales reforzadas (manifold-constrained hyper-connections) y se entrena con el optimizador Muon sobre más de 32 billones de tokens. La versión posterior `DeepSeek-V4-Flash-0731` añade un módulo de decodificación especulativa y capacidades agénticas mejoradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atencion hibrida CSA + HCA |
| Parametros totales | 284B (segun model card); 290.944.616.402 segun safetensors |
| Parametros activos | 13B |
| Longitud de contexto | 1.000.000 tokens (salida maxima 384.000 tokens) |
| Tipos de cuantizacion | FP4 + FP8 Mixed (expertos en FP4, resto en FP8) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DeepSeek-V4-Flash emplea una arquitectura MoE con 284.000 millones de parámetros, de los cuales solo 13.000 millones se activan por token. La innovación principal es la atención híbrida que combina Compressed Sparse Attention (CSA) y Heavily Compressed Attention (HCA), diseñada para hacer viable el contexto de un millón de tokens. Según la documentación, en un contexto de 1M tokens DeepSeek-V4-Pro requiere solo el 27% de los FLOPs de inferencia por token y el 10% de la caché KV en comparación con DeepSeek-V3.2. El modelo incorpora también manifold-constrained hyper-connections (mHC) para estabilizar la propagación de señales entre capas, y se entrena con el optimizador Muon para una convergencia más rápida.

El preentrenamiento se realizó sobre más de 32 billones de tokens diversos y de alta calidad. El postentrenamiento sigue un paradigma en dos etapas: primero se cultivan expertos especializados por dominio mediante SFT y RL con GRPO, y después se consolidan en un único modelo mediante destilación on-policy. La versión `0731` añade un módulo de decodificación especulativa y tres niveles de razonamiento: Non-think, Think High y Think Max.

## Capacidades

- Generación de texto y razonamiento complejo con modos de pensamiento configurables (Non-think / Think High / Think Max).
- Generación de código y soporte de tool calling / function calling, orientado a integración en pipelines de desarrollo.
- Capacidades agénticas y razonamiento multi-paso, especialmente en la versión 0731 con módulo de decodificación especulativa.
- Manejo de contextos de hasta un millón de tokens, con salida máxima de 384.000 tokens.
- Razonamiento matemático y resolución de problemas de programación competitiva (CodeForces, LiveCodeBench).
- Capacidades multilingües no documentadas explícitamente en la información disponible.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con historial extenso gracias a su ventana de 1M tokens, manteniendo el contexto de toda la interacción sin truncamientos.
- Generación de código en producción: con soporte de tool calling, puede integrarse en pipelines de CI/CD para generar, revisar y parchear código, así como interactuar con APIs y repositorios.
- Agentes autónomos de propósito general: su capacidad de razonamiento multi-paso y su modo Think Max lo hacen adecuado para agentes que planifican y ejecutan tareas complejas con múltiples herramientas.
- Análisis de documentos legales o académicos extensos: el contexto de 1M tokens permite procesar libros completos, expedientes o corpus técnicos sin necesidad de chunking.
- Asistente de programación competitiva: con resultados destacados en CodeForces (puntuación 3052) y LiveCodeBench (91.60), puede usarse para resolver problemas de algoritmia y optimización.
- Razonamiento matemático y científico: su rendimiento en MMLU-Pro (86.40 en la versión 0731) lo habilita para tareas de investigación que requieren cadenas de razonamiento largas.

## Benchmarks y rendimiento

La model card proporciona resultados del modelo base comparados con DeepSeek-V3.2-Base y DeepSeek-V4-Pro-Base:

| Benchmark (metrica) | Shots | DeepSeek-V3.2-Base | DeepSeek-V4-Flash-Base | DeepSeek-V4-Pro-Base |
|---|---|---|---|---|
| AGIEval (EM) | 0-shot | 80.1 | 82.6 | 83.1 |
| MMLU (EM) | 5-shot | 87.8 | 88.7 | 90.1 |
| MMLU-Redux (EM) | 5-shot | 87.5 | 89.4 | 90.8 |
| MMLU-Pro (EM) | 5-shot | 65.5 | 68.3 | 73.5 |
| MMMLU (EM) | 5-shot | 87.9 | 88.8 | 90.3 |
| C-Eval (EM) | 5-shot | 90.4 | 92.1 | 93.1 |
| CMMLU (EM) | 5-shot | 88.9 | 90.4 | 90.8 |

Fuentes externas (datalearner.com) reportan para la versión `DeepSeek-V4-Flash-0731`: LiveCodeBench 91.60, MMLU Pro 86.40 y CodeForces 3052. Estos datos corresponden a la versión posterior, no a la subida analizada.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 159.6 GB en FP4/FP8, por lo que se necesitan al menos 160 GB de VRAM para cargar los pesos completos. Con cuantizaciones adicionales (GGUF) podría reducirse, pero no se dispone de datos concretos.
- GPU recomendadas: no apto para GPUs de consumo. Se requieren configuraciones multi-GPU como 2x H200 (141 GB cada una), 4x A100 80GB o 4x H100 80GB.
- Opciones de despliegue: compatible con vLLM (hay recetas oficiales), TGI, y potencialmente llama.cpp/Ollama si se generan pesos GGUF. La etiqueta `endpoints_compatible` sugiere integración con plataformas de inferencia gestionada.
- Latencia y throughput: no disponibles en la información proporcionada. La decodificación especulativa de la versión 0731 debería mejorar la latencia, pero no se cuantifica.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash | 284B | 13B | 1M | MIT | Hugging Face, ModelScope |
| DeepSeek-V3.2 | 671B | 37B | no disponible | MIT | Hugging Face |
| DeepSeek-V4-Pro | 1.6T | 49B | 1M | MIT | Hugging Face, ModelScope |

DeepSeek-V4-Flash se sitúa como la opción ligera de la familia V4, con 13B activos frente a los 49B de V4-Pro. En benchmarks de conocimiento, V4-Flash-Base supera a V3.2-Base en todas las métricas reportadas (p. ej., MMLU 88.7 vs 87.8) a pesar de tener menos parámetros activos, lo que evidencia las mejoras arquitectónicas. La versión Pro sigue siendo superior en tareas de conocimiento puro, pero Flash ofrece un equilibrio mejor entre rendimiento y coste computacional.

## Limitaciones y advertencias

- La subida en Hugging Face pertenece al usuario `kirusanth08`, no al perfil oficial de DeepSeek. Antes de usarla en producción, conviene verificar la integridad de los pesos comparando hashes con la versión oficial de `deepseek-ai`.
- Los parámetros totales según safetensors (290.944.616.402) difieren de los 284B declarados en la model card; la discrepancia puede deberse a pesos adicionales o al módulo de decodificación especulativa.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos web, puede heredar sesgos sociales y culturales no mitigados.
- Riesgo de alucinación en contextos muy largos: aunque la atención híbrida mejora la eficiencia, la fidelidad factual en ventanas de 1M tokens no está garantizada.
- Los idiomas soportados no están especificados; el rendimiento fuera de inglés y chino (lenguas predominantes en los benchmarks C-Eval y CMMLU) es desconocido.
- La licencia MIT permite uso comercial sin restricciones, pero se recomienda revisar los términos de la versión oficial y posibles patentes asociadas.
- El hardware requerido (mínimo 160 GB de VRAM) excluye su uso en estaciones de trabajo convencionales; el despliegue en la nube con GPUs H100/H200 es la opción realista.

## Enlaces

- Hugging Face (subida analizada): https://huggingface.co/kirusanth08/DeepSeek-V4-Flash
- Modelo oficial en Hugging Face: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Informe tecnico (arXiv): https://arxiv.org/abs/2606.19348
- ModelScope (version 0731): https://modelscope.ai/models/deepseek-ai/DeepSeek-V4-Flash-0731
- Recetas vLLM: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Flash
- LM Studio: https://lmstudio.ai/models/deepseek-v4-flash
- Datalearner (specs y benchmarks): https://www.datalearner.com/en/ai-models/pretrained-models/deepseek-v4-flash
- OhMyGPT: https://www.ohmygpt.com/models/deepseek-v4-flash
