# Dozennone/DeepSeek-V4-Flash

## Resumen

DeepSeek-V4-Flash es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por DeepSeek-AI, presentado como parte de la serie DeepSeek-V4 junto con DeepSeek-V4-Pro. Este repositorio concreto, subido por el usuario Dozennone, contiene una copia del modelo con pesos en formato safetensors. El modelo cuenta con 284.000 millones de parámetros totales (13.000 millones activos por paso) y una ventana de contexto de un millón de tokens, lo que lo posiciona como una opción eficiente para tareas de razonamiento, generación de código y procesamiento de documentos largos.

La relevancia actual del modelo radica en su arquitectura híbrida de atención, que combina Compressed Sparse Attention (CSA) y Heavily Compressed Attention (HCA) para reducir drásticamente el coste computacional y el uso de caché KV en contextos largos. Según la documentación, DeepSeek-V4-Pro (el hermano mayor) requiere solo el 27% de los FLOPs de inferencia y el 10% de la caché KV en comparación con DeepSeek-V3.2 en un contexto de 1M tokens. DeepSeek-V4-Flash, al ser más pequeño, ofrece un equilibrio entre rendimiento y eficiencia, orientado a despliegues de alta concurrencia.

El modelo se distribuye bajo licencia MIT, lo que permite uso comercial sin restricciones significativas. Los pesos están disponibles en formato safetensors con precisión mixta FP4+FP8, y el repositorio ocupa 159,6 GB. No se han publicado resultados de benchmarks específicos para esta versión en la información disponible, aunque la model card incluye datos de la versión base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención híbrida CSA + HCA |
| Parametros totales | 284B (según model card); 290.944.616.402 (según safetensors) |
| Parametros activos | 13B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP4 + FP8 mixto (expertos en FP4, resto en FP8) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DeepSeek-V4-Flash emplea una arquitectura MoE con 284B parámetros totales y 13B activos por token. La innovación principal es la atención híbrida que combina Compressed Sparse Attention (CSA) y Heavily Compressed Attention (HCA), diseñada para mejorar la eficiencia en contextos de hasta un millón de tokens. Además, incorpora Manifold-Constrained Hyper-Connections (mHC) para reforzar las conexiones residuales y estabilizar la propagación de señales entre capas, y utiliza el optimizador Muon para una convergencia más rápida y estable.

El pre-entrenamiento se realizó sobre más de 32 billones de tokens diversos y de alta calidad. El post-entrenamiento sigue un esquema de dos etapas: primero se cultivan expertos especializados por dominio mediante SFT y RL con GRPO, y después se consolidan en un único modelo mediante destilación on-policy. Esta metodología permite integrar capacidades distintas (razonamiento, código, agentes) en un solo modelo sin degradar el rendimiento general.

## Capacidades

- Generación de texto y razonamiento complejo, con soporte para tareas de lógica y matemáticas.
- Generación de código, con rendimiento destacado en benchmarks de programación según la documentación.
- Procesamiento de contextos extremadamente largos (hasta 1M tokens) gracias a la atención híbrida.
- Capacidades de agente y razonamiento multi-paso, aunque no se especifican detalles sobre tool calling o function calling.
- Soporte multilingüe no confirmado en la información disponible; se recomienda verificar con pruebas propias.
- Modo de razonamiento máximo (DeepSeek-V4-Flash-Max) que permite aumentar el presupuesto de pensamiento para tareas complejas, aunque no está incluido en este repositorio.

## Casos de uso

- Análisis de documentos extensos: con 1M tokens de contexto, el modelo puede procesar libros completos, expedientes legales o informes técnicos de cientos de páginas en una sola pasada, resumiendo o extrayendo información relevante sin necesidad de dividir el texto.
- Generación de código en producción: su capacidad para razonar sobre código y su rendimiento en benchmarks de programación lo hacen adecuado para asistentes de desarrollo, revisión de código y autocompletado en entornos de integración continua.
- Agentes autónomos: el modelo puede actuar como núcleo de un agente que planifica y ejecuta tareas multi-paso, como navegación web, consulta de APIs o gestión de flujos de trabajo, gracias a su razonamiento avanzado.
- Atención al cliente automatizada: su contexto largo permite mantener conversaciones multi-turno con historial extenso, mejorando la coherencia y la personalización en chatbots de soporte.
- Búsqueda y recuperación de información: puede indexar y razonar sobre grandes corpus de texto, respondiendo preguntas que requieren integrar información dispersa a lo largo de un documento.
- Investigación académica: útil para revisar literatura científica, comparar metodologías y generar resúmenes de artículos largos, dado su contexto amplio y su capacidad de razonamiento.

## Benchmarks y rendimiento

La model card incluye resultados de la versión base (DeepSeek-V4-Flash-Base) comparados con DeepSeek-V3.2-Base y DeepSeek-V4-Pro-Base. No se han publicado resultados de la versión afinada (chat) en la información disponible.

| Benchmark (métrica) | Shots | DeepSeek-V3.2-Base | DeepSeek-V4-Flash-Base | DeepSeek-V4-Pro-Base |
|---|---|---|---|---|
| AGIEval (EM) | 0-shot | 80,1 | 82,6 | 83,1 |
| MMLU (EM) | 5-shot | 87,8 | 88,7 | 90,1 |
| MMLU-Redux (EM) | 5-shot | 87,5 | 89,4 | 90,8 |
| MMLU-Pro (EM) | 5-shot | 65,5 | 68,3 | 73,5 |
| MMMLU (EM) | 5-shot | 87,9 | 88,8 | 90,3 |
| C-Eval (EM) | 5-shot | 90,4 | 92,1 | 93,1 |
| CMMLU (EM) | 5-shot | 88,9 | 90,4 | 90,8 |

DeepSeek-V4-Flash-Base supera a DeepSeek-V3.2-Base en todos los benchmarks listados, a pesar de tener menos parámetros activos (13B frente a 37B). Se queda ligeramente por detrás de DeepSeek-V4-Pro-Base, especialmente en MMLU-Pro, donde la diferencia es de 5,2 puntos.

## Requisitos de hardware

- El repositorio ocupa 159,6 GB, lo que indica que los pesos ya están cuantizados en FP4/FP8. Para cargar el modelo en memoria se necesitan al menos 160 GB de VRAM, y probablemente más para activaciones y caché KV.
- Con cuantización FP8 completa, se estiman ~300 GB de VRAM; con FP4 para expertos, ~150 GB. Estas cifras son orientativas y dependen de la implementación.
- Se requieren múltiples GPUs de alta gama: por ejemplo, 2× H100 80GB o 4× A100 80GB para inferencia con FP4/FP8. No cabe en una GPU de consumo (RTX 4090, 24 GB).
- Opciones de despliegue: vLLM, TensorRT-LLM o TGI son las más adecuadas para este tamaño. llama.cpp y Ollama no son prácticos para modelos de este volumen.
- La latencia y el throughput dependen en gran medida del hardware y de la implementación; no se han publicado cifras oficiales. Dado que solo se activan 13B parámetros por token, la inferencia es significativamente más rápida que en un modelo denso de tamaño equivalente.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash | 284B | 13B | 1M | MIT | HuggingFace, ModelScope |
| DeepSeek-V3.2 | 671B | 37B | no disponible | MIT | HuggingFace |
| DeepSeek-V4-Pro | 1,6T | 49B | 1M | MIT | HuggingFace, ModelScope |

DeepSeek-V4-Flash se sitúa entre V3.2 y V4-Pro en términos de parámetros totales, pero con menos parámetros activos que V3.2 (13B frente a 37B), lo que le permite una inferencia más eficiente. En los benchmarks de la versión base, supera a V3.2-Base en todos los casos, aunque queda por detrás de V4-Pro-Base. La licencia MIT es común a los tres, lo que facilita su adopción comercial.

## Limitaciones y advertencias

- Este repositorio es una subida de un tercero (Dozennone), no el repositorio oficial de DeepSeek-AI. Aunque la model card parece copiada de la versión oficial, no hay garantía de que los pesos sean idénticos o estén verificados.
- No se han publicado resultados de benchmarks de la versión afinada (chat) en la información disponible; los datos mostrados corresponden a la versión base.
- El modelo puede presentar sesgos presentes en los datos de pre-entrenamiento, aunque no se han documentado específicamente.
- Riesgo de alucinación en tareas de generación libre, especialmente con contextos muy largos donde la información relevante puede diluirse.
- La licencia MIT permite uso comercial, pero al ser un modelo de gran tamaño, los costes de despliegue son elevados y requieren infraestructura especializada.
- No se especifican los idiomas soportados; se recomienda probar el modelo con datos propios antes de usarlo en producción multilingüe.
- La cuantización FP4 puede degradar ligeramente la calidad en comparación con FP8 o BF16, aunque no se han publicado evaluaciones al respecto.

## Enlaces

- Repositorio en HuggingFace (subida por Dozennone): https://huggingface.co/Dozennone/DeepSeek-V4-Flash
- Repositorio oficial de DeepSeek-AI en HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Paper técnico (arXiv): https://arxiv.org/abs/2606.19348
- Página de DeepSeek: https://deepseek.com/en/index.html
- Demo en DeepInfra: https://deepinfra.com/deepseek-ai/DeepSeek-V4-Flash
- ModelScope (versión 0731 con decodificación especulativa): https://modelscope.ai/models/deepseek-ai/DeepSeek-V4-Flash-0731
- Lambda (información y benchmarks): https://lambda.ai/inference-models/deepseek-ai/deepseek-v4-flash
