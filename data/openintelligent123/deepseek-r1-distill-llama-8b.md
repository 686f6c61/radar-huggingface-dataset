# Openintelligent123/DeepSeek-R1-Distill-Llama-8B

## Resumen

DeepSeek-R1-Distill-Llama-8B es un modelo de razonamiento denso de 8.030 millones de parámetros, resultado de la destilación del modelo DeepSeek-R1 (671B MoE) sobre la arquitectura Llama-3.1-8B. Fue desarrollado originalmente por DeepSeek AI y publicado en enero de 2025; la versión alojada en `Openintelligent123/DeepSeek-R1-Distill-Llama-8B` es una re-subida de ese checkpoint oficial, con licencia MIT y pesos en formato safetensors. El modelo está diseñado para tareas de razonamiento complejo, matemáticas, código y generación de texto con cadena de pensamiento (chain-of-thought), y destaca por ofrecer capacidades de razonamiento de nivel o1 en un tamaño ejecutable en hardware de consumo.

La relevancia actual de este modelo radica en que demuestra que las capacidades de razonamiento de un modelo masivo pueden transferirse eficazmente a arquitecturas pequeñas mediante destilación, logrando un rendimiento competitivo con modelos mucho mayores a una fracción del coste computacional. Su licencia MIT permite uso comercial sin restricciones, lo que lo convierte en una opción atractiva para producción. La ventana de contexto es de 128.000 tokens, heredada de Llama-3.1, y soporta principalmente inglés y chino, aunque la model card no especifica idiomas de forma explícita.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama-3.1-8B) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | No disponible en el repo; la comunidad ofrece GGUF (Q4_K_M, Q5_K_M, etc.) y AWQ |
| Idiomas soportados | No disponible (model card sin especificar; se asume inglés y chino por el entrenamiento) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso basado en la arquitectura Llama-3.1-8B, sin capas MoE. El proceso de destilación consistió en fine-tuning del modelo base Llama-3.1-8B utilizando datos de razonamiento generados por DeepSeek-R1 (el modelo maestro de 671B). Estos datos incluyen cadenas de pensamiento largas, auto-verificación y reflexión, obtenidas mediante el pipeline de entrenamiento de DeepSeek-R1 que combina dos etapas de RL (para descubrir patrones de razonamiento y alinear con preferencias humanas) y dos etapas de SFT (para sembrar capacidades de razonamiento y no razonamiento). El resultado es un modelo que conserva la capacidad de generar razonamiento explícito paso a paso antes de responder, sin necesidad de un modo de "thinking" separado.

No se han publicado detalles específicos sobre el número de tokens de entrenamiento o la composición exacta del dataset de destilación en la información disponible. El modelo hereda la arquitectura de Llama-3.1, incluyendo atención con RoPE, normalización RMSNorm y activación SwiGLU. No incorpora innovaciones como decodificación especulativa o atención lineal; su principal valor es la destilación de capacidades de razonamiento de un modelo mucho mayor.

## Capacidades

- Razonamiento matemático avanzado: resuelve problemas de álgebra, cálculo, probabilidad y demostraciones con cadenas de pensamiento explícitas.
- Generación de código: escribe, depura y explica código en múltiples lenguajes (Python, C++, Java, etc.) con razonamiento paso a paso.
- Razonamiento lógico y simbólico: maneja acertijos, problemas de lógica formal y tareas de deducción complejas.
- Auto-verificación y reflexión: el modelo revisa sus propias respuestas y corrige errores durante la generación, un comportamiento emergente del entrenamiento con RL.
- Generación de texto general: mantiene capacidades conversacionales y de escritura creativa, aunque su foco principal es el razonamiento.
- Soporte multilingüe limitado: entrenado principalmente en inglés y chino; otros idiomas pueden funcionar con menor calidad.
- No incluye soporte nativo de tool calling ni function calling, aunque puede usarse con frameworks externos que lo habiliten.
- No tiene capacidades multimodales (solo texto).

## Casos de uso

- Tutoría y educación personalizada: el modelo puede explicar conceptos matemáticos o de programación paso a paso, mostrando su razonamiento, lo que resulta útil para plataformas de aprendizaje adaptativo.
- Asistente de depuración de código: integrado en un IDE, el modelo analiza fragmentos de código, identifica errores lógicos y sugiere correcciones con justificación detallada.
- Generación de documentación técnica: a partir de especificaciones o código fuente, el modelo produce documentación explicativa con razonamiento sobre el comportamiento del sistema.
- Análisis de datos y razonamiento estadístico: puede interpretar resultados de experimentos, calcular métricas y explicar conclusiones basadas en datos, útil en entornos de investigación.
- Chatbot de soporte técnico con razonamiento: para resolver incidencias complejas que requieren deducción multi-paso, el modelo puede descomponer el problema y ofrecer soluciones justificadas.
- Generación de casos de prueba: el modelo razona sobre el comportamiento esperado de una función y genera casos de prueba unitarios con cobertura de bordes.
- Investigación académica: como herramienta de asistencia para formular hipótesis, revisar demostraciones matemáticas o explorar soluciones a problemas abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo original de DeepSeek reporta en su paper (arXiv:2501.12948) resultados para DeepSeek-R1-Distill-Llama-8B en tareas como AIME 2024, MATH-500, HumanEval y MMLU, pero esos datos no están incluidos en la información proporcionada. Se recomienda consultar el paper oficial para obtener cifras detalladas. No se deben asumir valores sin verificación.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: ~16 GB (pesos de 8B en FP16 ocupan ~16 GB, más overhead de activaciones y KV cache).
- Con cuantización Q4_K_M (GGUF): ~5-6 GB de VRAM, ejecutable en GPUs de consumo como RTX 3060 12GB, RTX 4060 Ti 16GB o RTX 4090.
- Con cuantización Q8_0: ~8-9 GB de VRAM, adecuado para RTX 3080/4080.
- GPUs recomendadas: NVIDIA RTX 3090/4090 para FP16 con contexto completo; GPUs con 24 GB o más para despliegue con vLLM o TGI.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, text-generation-inference (el repo es compatible con endpoints de HF).
- Latencia estimada: en una RTX 4090 con cuantización Q4, la generación de tokens de razonamiento (cadenas largas) puede alcanzar 30-50 tokens/s; en FP16, 15-25 tokens/s. El throughput depende del batch y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| DeepSeek-R1-Distill-Llama-8B (este) | 8.03B | 128k | MIT | Razonamiento destilado de R1 |
| DeepSeek-R1-Distill-Qwen-7B | 7.6B | 128k | MIT | Razonamiento destilado de R1 sobre Qwen2.5 |
| DeepSeek-R1-Distill-Qwen-14B | 14.7B | 128k | MIT | Razonamiento destilado de R1 sobre Qwen2.5 |
| QwQ-32B (Qwen) | 32B | 128k | Apache 2.0 | Razonamiento con RL, no destilado |

El modelo de 8B es el más pequeño de la familia destilada de DeepSeek, con un equilibrio entre rendimiento y requisitos de hardware. Frente a QwQ-32B, ofrece menor capacidad pero es mucho más ligero. Frente a los destilados de Qwen, la variante Llama suele tener mejor soporte de ecosistema (llama.cpp, Ollama) y una comunidad más amplia.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado principalmente con datos en inglés y chino, puede mostrar sesgos culturales o lingüísticos en otros idiomas.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inventada, especialmente en dominios fuera de su entrenamiento.
- Limitaciones de contexto: aunque soporta 128k tokens, el rendimiento de razonamiento puede degradarse con contextos muy largos; se recomienda mantener el contexto por debajo de 32k para tareas críticas.
- Sin tool calling nativo: no incluye soporte integrado para llamadas a funciones; requiere adaptación externa.
- Generación de razonamiento verboso: el modelo tiende a producir cadenas de pensamiento largas, lo que aumenta la latencia y el coste de inferencia.
- Licencia MIT: permite uso comercial sin restricciones, pero el modelo se distribuye sin garantías; el usuario es responsable del cumplimiento normativo.
- No es multimodal: solo procesa texto, no imágenes ni audio.

## Enlaces

- Repositorio de HuggingFace (este modelo): https://huggingface.co/Openintelligent123/DeepSeek-R1-Distill-Llama-8B
- Modelo original de DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- Paper de DeepSeek-R1: https://arxiv.org/abs/2501.12948
- Repositorio GitHub de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Versión llamafile (Mozilla): https://huggingface.co/mozilla-ai/DeepSeek-R1-Distill-Llama-8B-llamafile
- ModelScope (espejo): https://www.modelscope.cn/models/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
