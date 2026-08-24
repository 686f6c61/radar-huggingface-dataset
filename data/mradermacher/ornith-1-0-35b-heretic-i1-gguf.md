# mradermacher/Ornith-1.0-35B-heretic-i1-GGUF

## Resumen

El modelo `mradermacher/Ornith-1.0-35B-heretic-i1-GGUF` es una cuantización GGUF del modelo `inkOrCloud/Ornith-1.0-35B-heretic`, un derivado experimental de la familia Ornith 1.0 desarrollada por DeepReinforce AI. Según los resultados de búsqueda, Ornith 1.0 es un conjunto de modelos de codificación agénticos de código abierto, basados en la arquitectura Qwen3.5 MoE, con tamaños que van desde 9B hasta 397B. La variante "heretic" incorpora un LoRA experimental denominado "Heretic 1.4.0 Trial 63" fusionado en pesos BF16.

Esta ficha se centra en la versión cuantizada por `mradermacher`, que facilita la ejecución local en hardware con recursos limitados mediante formatos GGUF con cuantización de imatrix. El repositorio contiene 28.6 GB de datos, lo que sugiere la presencia de varias cuantizaciones. La licencia y los idiomas soportados no están documentados en la model card, lo que limita la evaluación de su uso en producción.

La relevancia de este modelo reside en su naturaleza agéntica para tareas de codificación, aunque la información técnica detallada (arquitectura exacta, contexto, datos de entrenamiento) no está disponible en la información proporcionada. Es un modelo experimental con potencial para integraciones en entornos de desarrollo, pero requiere validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (según fuentes externas, basado en Qwen3.5 MoE) |
| Parametros totales | 34.660.610.688 |
| Parametros activos | no disponible (se presume MoE, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con imatrix: Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors del original, convertidos a GGUF) |

## Arquitectura y entrenamiento

No se dispone de información oficial sobre la arquitectura interna del modelo en la model card ni en los resultados de búsqueda. Según el sitio web de Ornith AI, el modelo base Ornith-1.0-35B está basado en Qwen3.5 MoE, pero no se confirma si esta variante "heretic" mantiene esa arquitectura exacta. La fusión del LoRA "Heretic 1.4.0 Trial 63" en los pesos BF16 sugiere un ajuste fino dirigido a mejorar capacidades agénticas o de razonamiento, aunque no hay detalles sobre el dataset de entrenamiento, el número de tokens ni el proceso de alineación (RLHF, DPO, etc.). La cuantización GGUF con imatrix se realizó mediante herramientas estándar de conversión, sin cambios en los pesos originales.

## Capacidades

- Generación de código y asistencia en programación: según la web de Ornith AI, los modelos de esta familia están diseñados para tareas de codificación agéntica, incluyendo generación, depuración y refactorización de código.
- Razonamiento multi-paso: la naturaleza agéntica implica capacidad para planificar y ejecutar tareas complejas, aunque no hay datos específicos sobre el rendimiento.
- Soporte de tool calling y funciones: no confirmado en la información disponible, pero es esperable en un modelo de codificación agéntica.
- Multilingüismo: no documentado.
- Otras capacidades: no disponibles.

## Casos de uso

- Asistente de programación local: dado el tamaño de 35B y la cuantización GGUF, puede ejecutarse en una GPU de gama alta (p. ej., RTX 4090) para ofrecer sugerencias de código y completado en tiempo real dentro de un IDE.
- Automatización de tareas de refactorización: el modelo puede analizar código existente y proponer cambios estructurados, aunque requiere validación manual.
- Generación de documentación técnica: a partir de código fuente, puede generar comentarios y documentación, aunque su precisión no está verificada.
- Desarrollo de agentes de codificación autónomos: en pipelines de CI/CD, puede actuar como agente que resuelve issues de GitHub, pero requiere integración con APIs externas.
- Prototipado rápido: para generar esqueletos de proyectos o funciones en varios lenguajes, útil en fases de diseño.
- Educación y formación: como tutor de programación, explicando fragmentos de código y ofreciendo ejemplos, aunque sin garantía de precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: para 35B parámetros, las cuantizaciones típicas requieren:
  - Q4_K_M: ~20 GB
  - Q5_K_M: ~23 GB
  - Q6_K: ~27 GB
  - Q8_0: ~35 GB (si se incluye)
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB VRAM) para cuantizaciones Q4 o Q5; A100 40GB o H100 para cuantizaciones más altas.
- Puede caber en una GPU de consumo con 24 GB si se usa Q4_K_M, pero con limitaciones en el tamaño de contexto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o servidores compatibles con GGUF como llama-cpp-python o text-generation-webui.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de la misma categoría (p. ej., DeepSeek-Coder-33B, CodeLlama-34B, Qwen2.5-Coder-32B) en términos de rendimiento o licencia. La comparación se limita a aspectos generales:

| Modelo | Params | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ornith-1.0-35B (heretic) | 34.66B | no disponible | no disponible | GGUF (este repo) |
| DeepSeek-Coder-33B | 33B | 16K | MIT | sí |
| Qwen2.5-Coder-32B | 32.5B | 128K | Apache 2.0 | sí |

Sin datos de benchmarks, no es posible evaluar el rendimiento relativo.

## Limitaciones y advertencias

- Licencia no definida: no se puede usar en producción comercial sin una revisión legal previa.
- Riesgo de alucinación: como todo modelo generativo, puede producir código incorrecto o inventar APIs. Validación manual obligatoria.
- Sesgos: no se dispone de estudios sobre sesgos o comportamientos no deseados.
- Contexto de longitud desconocida: no se puede garantizar el manejo de secuencias largas; puede degradar con contextos extensos.
- Modelo experimental: la variante "heretic" es un derivado experimental con LoRA, por lo que su robustez en producción no está comprobada.
- Falta de documentación técnica: sin detalles de arquitectura, entrenamiento o datos, es difícil predecir su comportamiento en escenarios específicos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Ornith-1.0-35B-heretic-i1-GGUF
- Modelo original (inkOrCloud): https://huggingface.co/inkOrCloud/Ornith-1.0-35B-heretic
- Sitio web de Ornith AI: https://ornith.online/
- Guía de Ornith 1.0: https://ornith.site/
- Otra variante GGUF del mismo autor: https://huggingface.co/mradermacher/Ornith-1.0-35B-uncensored-heretic-GGUF
