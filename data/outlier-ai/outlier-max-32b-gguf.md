# Outlier-Ai/Outlier-Max-32B-GGUF

## Resumen

Outlier-Max-32B-GGUF es una cuantización en formato GGUF del modelo Qwen2.5-32B-Instruct, publicada por el usuario Outlier-Ai. El modelo base es un transformer denso de 32.763.876.352 parámetros (aproximadamente 32,8 mil millones) desarrollado originalmente por Alibaba Qwen, y esta versión empaqueta los pesos en variantes de 4, 5 y 8 bits orientadas a inferencia local con llama.cpp, Ollama, LM Studio y Jan. El repositorio ocupa 43,1 GB e incluye etiquetas que apuntan a despliegue en CPU, en el dispositivo y sin conexión.

La relevancia de esta ficha es limitada por su propio estado: la model card declara explícitamente que el repositorio es un artefacto de investigación de una línea anterior de Outlier y que ha sido reemplazado por la oferta actual del producto (Outlier Nano 4B, Core 27B y Vision 35B-A3B). El autor recomienda no usarlo en producción y conserva el repositorio únicamente por reproducibilidad e interés histórico. A fecha de la información disponible acumula 62 descargas y 1 like, lo que confirma su carácter marginal dentro del ecosistema.

Aun así, el modelo subyacente (Qwen2.5-32B-Instruct) es una referencia consolidada para tareas de instrucción y conversación, con contexto largo y soporte multilingüe amplio, por lo que la ficha documenta tanto las capacidades heredadas del base como las limitaciones derivadas de su condición de artefacto obsoleto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), heredada de Qwen2.5-32B-Instruct |
| Parametros totales | 32.763.876.352 (32,8 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen2.5-32B-Instruct; no confirmada en esta ficha) |
| Tipos de cuantizacion | 4-bit, 5-bit y 8-bit (GGUF) |
| Idiomas soportados | en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); repo de 43,1 GB |
| Modelo base | Qwen/Qwen2.5-32B-Instruct |
| Relacion con el base | quantized |
| Libreria | gguf |
| Pipeline | text-generation |
| Etiquetas de despliegue | llama-cpp, llama.cpp, ollama, lm-studio, jan, cpu, edge-ai, offline |
| Fecha de creacion | 2026-04-18 |
| Ultima actualizacion | 2026-11-06 |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base Qwen2.5-32B-Instruct: un transformer decoder-only denso de 32,8 mil millones de parámetros. Esta publicación no entrena ni afina el modelo, sino que lo cuantiza a formatos GGUF de 4, 5 y 8 bits para su ejecución con llama.cpp y derivados. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si el base empleó RLHF, DPO u otras técnicas de alineación; esos datos pertenecen a la model card original de Qwen y no se reproducen aquí.

La model card advierte que el artefacto puede contener adaptadores, overlays o variantes de cuantización experimentales que no llegaron al producto comercial, y que cualquier afirmación técnica de revisiones anteriores de la tarjeta debe considerarse provisional. No se documentan innovaciones técnicas propias de esta cuantización (por ejemplo, decodificación especulativa o atención lineal) más allá del empaquetado GGUF estándar.

## Capacidades

- Generación de texto y conversación multi-turno en modo instruct/chat, heredadas de Qwen2.5-32B-Instruct.
- Razonamiento general y respuesta a preguntas de conocimiento, según los ejemplos de la model card (explicación de modelos MoE, resumen de diferencias entre cuantización de 4 y 8 bits).
- Soporte de function calling / tool calling, indicado en las etiquetas del repositorio.
- Capacidades multilingües en 15 idiomas: inglés, chino, francés, español, portugués, alemán, italiano, ruso, japonés, coreano, árabe, vietnamita, tailandés, neerlandés y polaco.
- Ejecución local en CPU y en el dispositivo (edge-ai, offline), sin dependencia de servicios en la nube.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking) en esta publicación.

## Casos de uso

- Despliegue local sin conexión: el modelo puede ejecutarse con llama.cpp u Ollama en estaciones de trabajo sin acceso a internet, útil en entornos con requisitos de privacidad estrictos; la cuantización de 4 bits reduce el peso en disco y memoria frente a los pesos originales.
- Asistente conversacional de escritorio: integrable en LM Studio o Jan para chat multi-turno en local, aprovechando el formato instruct del base y su soporte de 15 idiomas.
- Automatización de tareas con herramientas: la etiqueta de function calling permite conectar el modelo a APIs internas mediante llamadas a funciones, por ejemplo para consultar bases de datos o ejecutar acciones en un flujo de agente.
- Generación y revisión de texto multilingüe: redacción, traducción y resumen en los idiomas soportados, con especial utilidad en equipos que trabajan con combinaciones español-inglés-francés-alemán.
- Prototipado e investigación sobre cuantización: al ser un artefacto histórico, sirve para reproducir experimentos de cuantización GGUF de 4, 5 y 8 bits sobre un modelo de 32B y comparar calidad frente a los pesos originales.
- Evaluación de infraestructura de inferencia en CPU: permite medir throughput y latencia de llama.cpp en hardware sin GPU dedicada, como paso previo a decidir el despliegue de modelos mayores.
- Educación y demostraciones: ejecución de un modelo de 32B en equipos de desarrollo para talleres o pruebas de concepto, sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas numéricas, y remite a la web del producto para benchmarks verificados, que no forman parte de la información proporcionada. Tampoco se ofrecen datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial en la información proporcionada. Como referencia orientativa por tamaño de pesos, una cuantización de 4 bits de un modelo de 32,8B requiere del orden de 18-20 GB solo para pesos, más overhead de contexto; la de 8 bits, del orden de 33-35 GB. Estas cifras son estimaciones de orden de magnitud, no datos publicados por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamaño, un modelo de 32B en 4 bits encaja en GPUs de 24 GB (RTX 3090/4090) con contexto moderado, y en A100/H100 de 40-80 GB para contextos largos o cuantizaciones de 8 bits.
- CPU: el repositorio está etiquetado explícitamente para ejecución en CPU (cpu, on-device), por lo que es viable en equipos con suficiente RAM, aunque con latencia mayor.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y Jan, según las etiquetas del repositorio. No se mencionan vLLM ni TGI para esta variante GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|
| Outlier-Max-32B-GGUF (esta ficha) | 32,8 B | no disponible | apache-2.0 | GGUF 4/5/8-bit | Artefacto histórico, reemplazado |
| Qwen/Qwen2.5-32B-Instruct (base) | 32,8 B | no disponible en esta informacion | apache-2.0 | safetensors | Modelo original de referencia |
| Outlier Core 27B (sucesor recomendado por el autor) | 27 B (según nombre) | no disponible | no disponible | MLX 4-bit | Tier por defecto actual |
| Outlier Vision 35B-A3B (sucesor multimodal) | 35 B totales, 3 B activos (según nombre) | no disponible | no disponible | MLX 4-bit | Tier multimodal actual |

La comparativa se limita a lo que consta en la información disponible; no se dispone de datos de rendimiento comparado entre estas variantes ni de benchmarks que permitan ordenarlas por calidad.

## Limitaciones y advertencias

- Modelo obsoleto: la model card lo declara superseded y no recomendado para producción; el autor remite a la oferta actual del producto.
- Artefacto de investigación: puede contener adaptadores u overlays experimentales no validados, y las afirmaciones técnicas de revisiones previas de la tarjeta son provisionales.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se documentan mitigaciones específicas en esta publicación.
- Sesgos: no se documentan evaluaciones de sesgo en la información proporcionada; los sesgos del base Qwen2.5-32B-Instruct se heredan sin cambios conocidos.
- Idiomas: aunque se listan 15 idiomas, no se aportan métricas de calidad por idioma; el rendimiento puede variar notablemente fuera del inglés y el chino.
- Licencia: apache-2.0 permite uso comercial, pero el estado de artefacto histórico y la falta de soporte desaconsejan su uso en producción.
- Contexto: la longitud de contexto no se confirma en esta ficha; debe verificarse en la model card del base antes de diseñar aplicaciones que dependan de ventanas largas.
- Tracción mínima: 62 descargas y 1 like indican escasa validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Outlier-Ai/Outlier-Max-32B-GGUF
- Árbol de archivos: https://huggingface.co/Outlier-Ai/Outlier-Max-32B-GGUF/tree/main
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Sucesor recomendado (Nano 4B): https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
- Sucesor recomendado (Core 27B): https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Sucesor multimodal (Vision 35B-A3B): https://huggingface.co/Outlier-Ai/Outlier-Vision-35B-A3B-MLX-4bit
- Modelo de razonamiento alternativo: https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
- Modelo de código alternativo: https://huggingface.co/Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit
- Sitio del producto: https://outlier.host/
- Plataforma de la empresa (freelancers, no relacionada con el modelo): https://outlier.ai/
