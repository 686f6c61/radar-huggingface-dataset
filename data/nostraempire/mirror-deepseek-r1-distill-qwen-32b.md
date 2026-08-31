# NostraEmpire/mirror-deepseek-r1-distill-qwen-32b

## Resumen

Este repositorio es un espejo (mirror) del modelo original `deepseek-ai/DeepSeek-R1-Distill-Qwen-32B`, publicado por el usuario NostraEmpire. Se trata de un modelo de lenguaje denso de 32 763 876 352 parámetros, basado en la arquitectura Qwen2.5-32B y destilado a partir de DeepSeek-R1 mediante fine-tuning con datos de razonamiento generados por el modelo grande. El modelo original fue desarrollado por DeepSeek AI y destaca por ofrecer capacidades de razonamiento comparables a OpenAI-o1-mini en tareas de matemáticas, código y lógica, siendo uno de los mejores modelos densos de su tamaño. Este mirror reproduce los pesos en formato safetensors y mantiene la licencia MIT, lo que permite uso comercial sin restricciones. Su relevancia actual radica en que proporciona razonamiento de alto nivel en un paquete de 32B, ejecutable en hardware de gama media con cuantización adecuada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen2.5-32B) |
| Parametros totales | 32 763 876 352 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo original soporta 128 000 tokens, pero no se confirma en este mirror) |
| Tipos de cuantizacion | No especificados (el repositorio contiene pesos en safetensors, presumiblemente FP16) |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una destilación de DeepSeek-R1, un modelo de razonamiento entrenado con aprendizaje por refuerzo a gran escala. En lugar de aplicar RL directamente sobre un modelo pequeño, DeepSeek generó datos de razonamiento (cadenas de pensamiento) con DeepSeek-R1 y los utilizó para fine-tuning supervisado (SFT) de varios modelos base densos, entre ellos Qwen2.5-32B. El resultado es un modelo que hereda las capacidades de razonamiento del modelo grande, incluyendo auto-verificación, reflexión y generación de cadenas de pensamiento largas, pero con un coste computacional mucho menor. No se trata de un modelo MoE, sino de una arquitectura transformer convencional con atención completa. El entrenamiento se centró en datos de matemáticas, código y razonamiento lógico, lo que explica su alto rendimiento en esos dominios.

## Capacidades

- Razonamiento matemático avanzado: resuelve problemas de álgebra, cálculo, probabilidad y demostraciones con cadenas de pensamiento explícitas.
- Generación de código: produce código en múltiples lenguajes (Python, C++, Java, etc.) con explicaciones razonadas.
- Razonamiento lógico y análisis: aborda problemas de lógica formal, puzzles y tareas de deducción.
- Auto-verificación y reflexión: el modelo revisa sus propias respuestas y corrige errores durante la generación.
- Conversación y generación de texto: mantiene diálogos coherentes y genera texto técnico o explicativo.
- Capacidad multilingüe: no confirmada en la información disponible; el modelo base Qwen2.5 soporta varios idiomas, pero no se especifica para esta destilación.
- No se menciona soporte explícito para tool calling, function calling ni agentes.

## Casos de uso

- Resolución de problemas matemáticos en entornos educativos: el modelo puede actuar como tutor explicando paso a paso la resolución de ecuaciones, integrales o problemas de estadística, gracias a su capacidad de generar cadenas de razonamiento detalladas.
- Generación de código con justificación: en un IDE o pipeline de desarrollo, el modelo puede sugerir implementaciones completas y explicar la lógica subyacente, útil para revisión de código o aprendizaje.
- Análisis de datos y razonamiento estadístico: dado un conjunto de datos, el modelo puede interpretar resultados, detectar patrones y proponer hipótesis, apoyándose en su razonamiento formal.
- Asistente de investigación técnica: para revisar literatura, resumir artículos y razonar sobre conceptos complejos en física, ingeniería o ciencias de la computación.
- Automatización de informes técnicos: el modelo puede redactar documentación técnica, informes de errores o análisis de causa raíz a partir de descripciones de síntomas.
- Chatbots de soporte especializado: en dominios como programación o matemáticas, el modelo puede mantener conversaciones multi-turno con explicaciones rigurosas, aunque su ventana de contexto no está confirmada en este mirror.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo original afirma que DeepSeek-R1-Distill-Qwen-32B supera a OpenAI-o1-mini en varios benchmarks, pero no se proporcionan cifras concretas en el texto extraído. Para datos cuantitativos, se recomienda consultar el paper de DeepSeek-R1 (arXiv:2501.12948) o la página oficial del modelo original.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP16 (32B parámetros), se necesitan aproximadamente 65 GB de VRAM. Con cuantización INT8, unos 33 GB; con INT4, unos 17 GB.
- GPU recomendadas: para FP16, una A100 80GB o H100; para INT8, una RTX 4090 (24 GB) o A6000; para INT4, una RTX 3090/4090 (24 GB) o similar.
- En consumer GPU: cabe en RTX 4090 o 3090 solo con cuantización de 4 bits; en GPUs de 16 GB (RTX 4080, 3080 Ti) es ajustado y puede requerir offloading.
- Opciones de despliegue: compatible con transformers, vLLM, TGI (text-generation-inference), llama.cpp y Ollama (si se convierten los pesos a GGUF).
- Latencia y throughput: no disponibles; dependerán del hardware y la cuantización. En una A100, se espera un throughput de decenas de tokens por segundo, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-32B (original) | 32,7B | 128k (según documentación oficial) | MIT | Modelo de referencia; este mirror replica sus pesos |
| DeepSeek-R1-Distill-Qwen-14B | 14,7B | 128k (según documentación oficial) | MIT | Versión más pequeña, menor rendimiento pero más ligera |
| DeepSeek-R1-Distill-Llama-70B | 70B | 128k (según documentación oficial) | MIT | Versión más grande, mayor calidad pero requiere más hardware |
| Qwen2.5-32B (base) | 32,7B | 128k | Apache 2.0 | Modelo base sin destilación; menor capacidad de razonamiento |

No se dispone de datos de rendimiento comparativos en la información proporcionada. La comparativa se basa en características generales conocidas de los modelos originales.

## Limitaciones y advertencias

- Este repositorio es un mirror no oficial; no hay garantía de que los pesos sean idénticos al original ni de que se mantengan actualizaciones.
- El modelo puede presentar sesgos presentes en los datos de entrenamiento de Qwen2.5 y en los datos de razonamiento generados por DeepSeek-R1.
- Riesgo de alucinación en dominios fuera de matemáticas, código y razonamiento formal; se recomienda verificar respuestas factuales.
- Posible mezcla de idiomas en las cadenas de pensamiento, un problema conocido en modelos de razonamiento entrenados con RL (mencionado en la model card de DeepSeek-R1-Zero).
- La longitud de contexto no está confirmada en este mirror; si se necesita contexto largo, verificar el modelo original.
- La licencia MIT permite uso comercial, pero al ser un mirror, se debe confirmar que los pesos no han sido alterados.

## Enlaces

- Repositorio mirror en Hugging Face: https://huggingface.co/NostraEmpire/mirror-deepseek-r1-distill-qwen-32b
- Modelo original en Hugging Face: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-32B
- Repositorio GitHub de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Paper de DeepSeek-R1 (arXiv:2501.12948): https://arxiv.org/abs/2501.12948
- Página en ModelScope: https://www.modelscope.cn/models/deepseek-ai/DeepSeek-R1-Distill-Qwen-32B
