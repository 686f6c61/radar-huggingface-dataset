# kizzlah/Ornith-1.5-9B-GGUF

## Resumen

Ornith-1.5-9B es un modelo de lenguaje multimodal (imagen y texto) de 9 000 millones de parámetros, desarrollado por ornith-ai (DeepReinforce) como parte de la familia Ornith 1.5. Este repositorio concreto, publicado por el usuario kizzlah, contiene las conversiones a formato GGUF realizadas por AtomicChat, con una matriz de importancia propia y calibración sobre corpus públicos. El modelo base es un transformer denso orientado a generación de código y razonamiento agéntico, con un componente de visión que añade un proyector de 0,9 GB.

La relevancia de esta versión cuantizada radica en que permite ejecutar un modelo multimodal de 9B en hardware de consumo: según la guía de AtomicChat, cabe en una GPU de 8 GB o en un Mac con 16 GB de RAM unificada usando cuantización de 4 bits. El modelo base incorpora un enfoque de auto-mejora (self-improvement) que extiende el marco de auto-andamiaje de Ornith-1.0, generando tareas, andamiajes y rollouts para aprendizaje por refuerzo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (imagen + texto) |
| Parametros totales | 8 953 803 264 (8,95 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (la guía de uso recomienda 8192 tokens) |
| Tipos de cuantizacion | BF16, Q8_0, AD-Q8_0-Q6_K, Q6_K, Q5_K_M, AD-Q5_K-Q4_K, AD-Q4_K-IQ4_XS, AD-IQ4_XS, IQ4_XS, IQ3_M, AD-IQ3_S-IQ3_XXS, AD-IQ3_XXS-IQ2_S, AD-IQ2_S-IQ2_XS, AD-IQ2_XXS-IQ1_M, mmproj-F16 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (con safetensors en el modelo base original) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B es un transformer denso de 9B parámetros con capacidad multimodal: acepta tanto texto como imágenes mediante un proyector de visión separado (mmproj) de 0,9 GB en formato F16. No se dispone de detalles sobre el número de capas, dimensión de atención o mecanismos de atención específicos en la información proporcionada.

El entrenamiento sigue el enfoque de auto-mejora descrito en el artículo de Ornith-1.5: el modelo propone nuevas tareas, genera andamiajes específicos para cada tarea y produce rollouts de soluciones que se utilizan para aprendizaje por refuerzo, creando un bucle continuo de mejora. No se han publicado datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto y código: el modelo está diseñado específicamente para tareas de programación y razonamiento técnico.
- Razonamiento agéntico: el tag `agentic-coding` indica soporte para flujos de trabajo donde el modelo actúa como agente que planifica y ejecuta pasos de codificación.
- Visión: al ser multimodal (image-text-to-text), puede procesar imágenes junto con texto, lo que permite análisis de capturas, diagramas o documentos visuales.
- Conversación: el tag `conversational` sugiere capacidad para mantener diálogos multi-turno.
- Despliegue local: gracias a las cuantizaciones GGUF, puede ejecutarse en hardware de consumo con llama.cpp.
- No se confirma explícitamente soporte de tool calling o function calling en la información disponible.

## Casos de uso

- Asistente de programación local: un desarrollador puede ejecutar el modelo en su estación de trabajo con llama-server y obtener sugerencias de código, explicaciones y refactorizaciones sin depender de servicios en la nube. La cuantización AD-Q5_K-Q4_K (5,93 GB) cabe en una GPU de 8 GB.
- Análisis de capturas de pantalla y diagramas: al ser multimodal, el modelo puede recibir una imagen de un error de interfaz o un diagrama de arquitectura y generar una explicación o código asociado, útil en entornos de soporte técnico.
- Agente de codificación autónomo: el enfoque de razonamiento agéntico permite usarlo como base para pipelines que generan, prueban y corrigen código de forma iterativa, integrándose con herramientas de CI/CD.
- Chatbot técnico conversacional: con la cuantización Q8_0 (9,53 GB) en una GPU de 16 GB, puede servir como asistente técnico de atención al cliente para preguntas sobre APIs, lenguajes o frameworks.
- Generación de documentación técnica: a partir de fragmentos de código o especificaciones, el modelo puede redactar comentarios, guías de uso o notas de versión.
- Prototipado rápido de aplicaciones: en un Mac con 16 GB de RAM unificada, la versión de 4 bits permite iterar sobre ideas de código sin necesidad de infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo incluye métricas de fidelidad de cuantización frente al modelo de referencia BF16, medidas sobre un corpus de evaluación neutral con contexto de 4096 tokens y una RTX 5090 con llama.cpp b10505. La divergencia KL media (menor es mejor) y el acuerdo top-1 (mayor es mejor) son los siguientes:

| Archivo | Tamano | KLD media | Top-1 |
|---|---|---|---|
| BF16 (referencia) | 17,9 GB | referencia | 100 % |
| Q8_0 | 9,53 GB | 0,002249 | 97,94 % |
| AD-Q8_0-Q6_K | 8,55 GB | 0,003473 | 97,46 % |
| Q6_K | 7,36 GB | 0,006045 | 96,54 % |
| Q5_K_M | 6,47 GB | 0,029883 | 92,80 % |
| AD-Q5_K-Q4_K | 5,93 GB | 0,025493 | 93,10 % |
| AD-Q4_K-IQ4_XS | 5,61 GB | 0,034426 | 91,93 % |
| AD-IQ4_XS | 5,52 GB | 0,037752 | 91,54 % |
| IQ4_XS | 5,20 GB | 0,044856 | 90,76 % |
| IQ3_M | 4,42 GB | 0,131672 | 84,18 % |
| AD-IQ3_S-IQ3_XXS | 4,29 GB | 0,144132 | 83,44 % |
| AD-IQ3_XXS-IQ2_S | 3,84 GB | 0,258554 | 77,98 % |
| AD-IQ2_S-IQ2_XS | 3,38 GB | 0,441580 | 71,17 % |
| AD-IQ2_XXS-IQ1_M | 2,81 GB | 1,122010 | 53,74 % |

## Requisitos de hardware

- VRAM estimada: los tamaños de archivo incluyen el proyector de visión (0,9 GB) y aproximadamente 1 GB de sobrecarga en tiempo de ejecución a 8k de contexto.
- GPU recomendadas según VRAM disponible:
  - 24 GB o más: archivo BF16 (17,9 GB) para máxima fidelidad.
  - 16 GB: Q8_0 (9,53 GB).
  - 12 GB: AD-Q8_0-Q6_K (8,55 GB).
  - 8 GB: AD-Q5_K-Q4_K (5,93 GB) o AD-Q4_K-IQ4_XS (5,61 GB) si el espacio es ajustado.
  - 6 GB: AD-IQ3_S-IQ3_XXS (4,29 GB), con una caída de acuerdo top-1 al 83 %.
  - 4 GB: AD-IQ2_S-IQ2_XS (3,38 GB), solo texto, con un 71 % de acuerdo top-1.
- En Mac con RAM unificada de 16 GB puede ejecutarse la versión de 4 bits.
- Opciones de despliegue: llama.cpp (llama-server para texto, llama-mtmd-cli para visión), Atomic Chat, y cualquier runtime compatible con GGUF como Ollama o LM Studio.
- Latencia y throughput: no se han publicado mediciones específicas en la información disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría (9B multimodales o de código) en la información proporcionada. No se puede establecer una comparativa rigurosa sin datos de benchmarks estandarizados.

## Limitaciones y advertencias

- Las cuantizaciones extremas (AD-IQ2_XXS-IQ1_M) degradan severamente la calidad: el acuerdo top-1 cae al 53,74 %, lo que significa que aproximadamente la mitad de los tokens generados difieren del modelo completo. La propia model card advierte que no recomienda estos archivos y sugiere usar un modelo más pequeño con mayor precisión.
- No se ha publicado información sobre sesgos, riesgos de alucinación o comportamientos no deseados del modelo base.
- La longitud de contexto máxima no está documentada; la guía de uso emplea 8192 tokens, pero no se confirma si es el límite real.
- Los idiomas soportados no están especificados; se desconoce el rendimiento fuera del inglés.
- Aunque la licencia es MIT, el modelo base puede tener términos adicionales en su repositorio original; se recomienda revisar la licencia completa en ornith-ai/Ornith-1.5-9B.
- Para uso en producción, es recomendable validar el comportamiento del modelo en el dominio específico antes de desplegarlo, dado que no hay benchmarks públicos de tareas estándar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/kizzlah/Ornith-1.5-9B-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Repositorio GGUF oficial de ornith-ai: https://huggingface.co/ornith-ai/Ornith-1.5-9B-GGUF
- Guía de ejecución local de AtomicChat: https://atomic.chat/blog/guides/how-to-run-ornith-1-5-locally
- Página del modelo Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Corpus de calibración: https://huggingface.co/datasets/AtomicChat/calib-corpora
- Registros de evaluación: https://huggingface.co/datasets/AtomicChat/Ornith-1.5-9B-GGUF-metrics
- Aplicación Atomic Chat: https://atomic.chat/
- Repositorio de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
