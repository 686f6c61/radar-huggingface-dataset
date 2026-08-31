# ramfriend/Logics-STEM-8B-SFT-Q5_K_M-GGUF

## Resumen

Logics-STEM-8B-SFT-Q5_K_M-GGUF es una conversión al formato GGUF del modelo Logics-STEM-8B-SFT, un modelo de razonamiento abierto de 8.190 millones de parámetros desarrollado por el equipo Logics-MLLM. El modelo original es un ajuste fino supervisado (SFT) de Qwen3-8B sobre el dataset Logics-STEM-SFT-Dataset-2.2M, un corpus de 2,2 millones de ejemplos de cadenas de pensamiento largas orientadas a problemas de ciencia, tecnología, ingeniería y matemáticas (STEM). Esta versión GGUF, generada mediante llama.cpp, permite ejecutar el modelo en entornos locales con CPU o GPU a través de herramientas como llama.cpp, llama-server u Ollama, facilitando su uso en aplicaciones de razonamiento técnico sin depender de infraestructura en la nube.

La relevancia de este modelo radica en su especialización en tareas STEM, un área donde los modelos generalistas suelen fallar en problemas complejos de múltiples pasos. Según el paper asociado, Logics-STEM-8B-SFT logra una mejora promedio del 4,68% sobre el siguiente mejor modelo de su escala en benchmarks STEM. Al estar disponible en GGUF cuantizado (Q5_K_M), ofrece un equilibrio entre tamaño y fidelidad, con un archivo de aproximadamente 5,9 GB, lo que lo hace viable para GPUs de consumo medio y para despliegues en edge.

La licencia Apache 2.0 permite uso comercial sin restricciones significativas, lo que lo convierte en una opción atractiva para integraciones en productos y servicios que requieran razonamiento matemático o científico. No obstante, al ser un ajuste fino de Qwen3-8B, hereda las capacidades multilingües y de generación de texto del modelo base, aunque la documentación no especifica los idiomas soportados en esta versión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3-8B) |
| Parametros totales | 8.190.735.360 (8,19B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q5_K_M (en este repositorio) |
| Idiomas soportados | No disponible (el modelo base Qwen3-8B es multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Logics-STEM-8B-SFT es un ajuste fino supervisado del modelo Qwen3-8B, que emplea una arquitectura transformer densa con atención completa. El entrenamiento se realizó sobre Logics-STEM-SFT-Dataset-2.2M, un dataset curado con un pipeline de múltiples etapas que incluye datos de razonamiento STEM con cadenas de pensamiento largas (long CoT). El objetivo es mejorar la capacidad del modelo para resolver problemas que requieren múltiples pasos de deducción lógica, especialmente en matemáticas y ciencias.

El proceso de entrenamiento se limitó a SFT, sin etapas posteriores de RLHF o DPO. Esto implica que el modelo presenta un comportamiento de razonamiento más estructurado que el modelo base, pero sin el refinamiento adicional que proporciona el aprendizaje por refuerzo. La conversión a GGUF no modifica los pesos, solo el formato de almacenamiento, permitiendo su ejecución eficiente con llama.cpp en hardware variado.

## Capacidades

- Razonamiento matemático avanzado: resuelve problemas de álgebra, cálculo, geometría y estadística con explicaciones paso a paso.
- Resolución de problemas de física, química y biología: aplica principios científicos a problemas prácticos.
- Generación de explicaciones técnicas: produce respuestas detalladas y estructuradas para consultas STEM.
- Razonamiento lógico y multi-paso: mantiene cadenas de pensamiento largas para problemas complejos.
- Generación de texto en general: al estar basado en Qwen3-8B, conserva capacidades de generación de texto, resumen y diálogo, aunque su especialización es STEM.
- Soporte multilingüe: heredado del modelo base, aunque no se documenta explícitamente en esta versión.

## Casos de uso

- Tutoría académica personalizada: el modelo puede actuar como asistente para estudiantes de ingeniería o ciencias, explicando conceptos y resolviendo ejercicios paso a paso. Su especialización en STEM y su capacidad de generar cadenas de razonamiento largas lo hacen adecuado para plataformas de aprendizaje en línea.
- Asistente de investigación científica: ayuda a investigadores a verificar cálculos, formular hipótesis o revisar derivaciones matemáticas en artículos, gracias a su entrenamiento en datasets STEM de alta calidad.
- Generación de problemas de práctica: puede crear ejercicios de matemáticas o física con distintos niveles de dificultad, útil para plataformas de evaluación y generación de contenido educativo.
- Análisis de datos técnicos: interpreta resultados numéricos, identifica patrones y sugiere explicaciones causales en contextos de ingeniería o análisis de laboratorio.
- Chatbot de soporte técnico en dominios STEM: integrado en sistemas de atención al cliente para responder preguntas sobre productos técnicos, especificaciones o resolución de problemas de cálculo.
- Automatización de documentación técnica: redacta informes, manuales o explicaciones de procedimientos científicos a partir de datos o descripciones breves, reduciendo el tiempo de redacción en entornos industriales.

## Benchmarks y rendimiento

El paper asociado (arXiv:2601.01562) reporta una mejora promedio del 4,68% sobre el siguiente mejor modelo a escala 8B en benchmarks STEM, pero no se proporcionan cifras específicas por benchmark en la información disponible. No se han publicado resultados detallados de MMLU, HumanEval, GSM8K u otras métricas estándar para esta versión GGUF. Por tanto, no es posible presentar una tabla comparativa con valores numéricos verificados.

## Requisitos de hardware

- El archivo GGUF Q5_K_M ocupa aproximadamente 5,9 GB, por lo que se requiere al menos 8 GB de VRAM para cargar el modelo completo en GPU.
- GPU recomendadas: tarjetas con 8 GB o más de VRAM, como NVIDIA RTX 3060 (12 GB), RTX 4070, RTX 4080, o GPUs de datacenter como A10G o L4.
- También puede ejecutarse en CPU con llama.cpp, aunque la latencia será mayor; se recomienda al menos 16 GB de RAM para el modelo y el contexto.
- Opciones de despliegue: llama.cpp (CLI y servidor), llama-server, y mediante integración con Ollama si se convierte a un formato compatible.
- La latencia y el throughput dependen del hardware; en una GPU RTX 4090 se espera una generación de 20-30 tokens por segundo con este tamaño de modelo, pero no se dispone de mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Logics-STEM-8B-SFT (este) | 8,19B | No disponible | STEM (razonamiento) | Apache 2.0 | GGUF, safetensors |
| Qwen3-8B (base) | 8,19B | 32k (no confirmado) | Generalista | Apache 2.0 | Múltiples formatos |
| DeepSeek-R1-Distill-Qwen-7B | 7,6B | 32k (estimado) | Razonamiento general | MIT | Múltiples formatos |

La comparación se basa en datos públicos de los modelos base. No se dispone de resultados de benchmarks comparativos entre Logics-STEM-8B-SFT y estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No se especifica la longitud de contexto soportada; el modelo base Qwen3-8B admite hasta 32k tokens, pero esta versión GGUF no documenta el valor, por lo que se recomienda probar antes de usar en producción.
- Al ser un ajuste fino especializado en STEM, puede degradar su rendimiento en tareas generalistas o creativas fuera de ese dominio.
- Riesgo de alucinación en problemas no cubiertos por el dataset de entrenamiento, especialmente en áreas científicas de vanguardia.
- Sesgos potenciales heredados de Qwen3-8B y del dataset STEM, que puede tener una representación desigual de ciertos temas o enfoques.
- La licencia Apache 2.0 permite uso comercial, pero los términos del modelo base Qwen3-8B (también Apache 2.0) no imponen restricciones adicionales.
- No se han realizado evaluaciones de seguridad o robustez específicas para esta versión; se recomienda validar en el caso de uso concreto.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/ramfriend/Logics-STEM-8B-SFT-Q5_K_M-GGUF
- Modelo original (safetensors): https://huggingface.co/Logics-MLLM/Logics-STEM-8B-SFT
- Modelo RL (post-entrenamiento): https://huggingface.co/Logics-MLLM/Logics-STEM-8B-RL
- Paper en arXiv: https://arxiv.org/html/2601.01562v3
- Página en ModelScope: https://www.modelscope.cn/models/Alibaba-DT/Logics-STEM-8B-SFT/summary
