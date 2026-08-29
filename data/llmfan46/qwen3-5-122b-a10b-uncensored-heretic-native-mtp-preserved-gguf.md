# llmfan46/Qwen3.5-122B-A10B-Uncensored-Heretic-Native-MTP-Preserved-GGUF

## Resumen

Este modelo es una versión "decensored" (sin censura) del Qwen3.5-122B-A10B, un modelo multimodal de 122.000 millones de parámetros con arquitectura híbrida de Gated Delta Networks y Mixture-of-Experts (MoE) con 10.000 millones de parámetros activos. El autor, llmfan46, ha aplicado la técnica de abliteración mediante la herramienta Heretic para eliminar la mayoría de los rechazos de contenido, reduciendo la tasa de negativas de 92/100 en el original a 8/100 en esta versión. El modelo conserva intactos los 785 módulos de multi-token prediction (MTP), lo que permite decodificación especulativa para acelerar la inferencia.

Se distribuye exclusivamente en formato GGUF con múltiples cuantizaciones, desde BF16 hasta Q2_K, e incluye un proyector de visión (mmproj) para capacidades multimodales. Está pensado para entornos de ejecución local como llama.cpp, LM Studio u Ollama, y su licencia Apache 2.0 permite uso comercial sin restricciones. Es relevante para desarrolladores que necesitan un modelo de gran tamaño sin filtros de contenido, manteniendo el rendimiento del modelo base de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gated Delta Networks + Mixture-of-Experts (hibrida) |
| Parametros totales | 124.635.206.144 (124,6B) |
| Parametros activos | 10.000.000.000 (10B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | 201 (segun el modelo base Qwen3.5) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con proyector de vision mmproj en BF16) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-122B-A10B emplea una arquitectura hibrida que combina Gated Delta Networks con capas dispersas de Mixture-of-Experts, logrando un equilibrio entre calidad y eficiencia de inferencia. El entrenamiento original incluyo fusion temprana de tokens multimodales, aprendizaje por refuerzo escalado a entornos con millones de agentes y cobertura linguistica global de 201 idiomas. Sobre esta base, el autor aplico la tecnica de abliteracion con la herramienta Heretic, que modifica los pesos del modelo para eliminar los circuitos internos responsables de generar rechazos y respuestas evasivas. El proceso reduce la tasa de rechazos del 92% al 8% sin recurrir a ajuste fino adicional, preservando las capacidades originales del modelo. Los 785 modulos de multi-token prediction (MTP) se mantienen intactos, lo que permite decodificacion especulativa para acelerar la generacion de texto.

## Capacidades

- Generacion de texto, razonamiento, codigo y matematicas, heredadas del modelo base Qwen3.5.
- Procesamiento multimodal imagen-texto mediante el proyector de vision incluido (mmproj).
- Soporte de multi-token prediction (MTP) para decodificacion especulativa y mayor throughput.
- Capacidades multilingues en 201 idiomas y dialectos.
- Ausencia de filtros de contenido: no rechaza peticiones sobre temas sensibles, violencia, sexualidad o lenguaje explicito.
- Compatible con herramientas de inferencia GGUF como llama.cpp, LM Studio y Ollama.

## Casos de uso

- Generacion creativa sin restricciones: escritura de ficcion, poesia o guiones que aborden temas tabu o contenido adulto sin censura automatica.
- Investigacion en seguridad de IA: analisis de comportamientos de modelos sin alineacion para estudiar sesgos, riesgos y mecanismos de rechazo.
- Desarrollo de asistentes de rol o personajes: creacion de chatbots con personalidades complejas que requieren respuestas directas sin evasivas.
- Traduccion y adaptacion de contenido sensible: procesamiento de textos con lenguaje explicito o temas delicados donde los modelos censurados fallan.
- Pruebas de robustez de sistemas de moderacion: generacion de contenido provocador para evaluar filtros de contenido en plataformas.
- Experimentacion academica sobre alineacion: comparacion de comportamientos entre modelos abliterados y sus versiones originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El unico dato de rendimiento proporcionado es la tasa de rechazos:

| Metrica | Este modelo | Modelo original (Qwen3.5-122B-A10B) |
| :------ | :---------: | :---------------------------------: |
| Rechazos (sobre 100 peticiones) | 8/100 | 92/100 |

Un articulo externo sobre una variante similar (heretic-122b-dgx-spark) reporta aproximadamente 45 tokens por segundo en una NVIDIA DGX Spark (GB10, 121 GB unificados) usando cuantizacion INT4+FP8 y MTP, pero no se puede confirmar que este modelo especifico alcance esas cifras.

## Requisitos de hardware

- El modelo completo en BF16 requiere aproximadamente 250 GB de VRAM, por lo que solo es viable en sistemas multi-GPU de alta gama (A100 80GB x4, H100, etc.).
- Las cuantizaciones Q4_K_M y Q3_K_M reducen el requisito a unos 70-90 GB de VRAM, permitiendo su ejecucion en GPUs como RTX 4090 (24 GB) no es suficiente; se necesitan al menos 2x RTX 4090 o una A6000 (48 GB) con cuantizacion Q3.
- La cuantizacion Q2_K puede caber en 48 GB, pero con perdida significativa de calidad.
- El proyector de vision (mmproj) anade unos 1-2 GB adicionales.
- Motores de inferencia compatibles: llama.cpp, LM Studio, Ollama, vLLM (con adaptadores GGUF) y TGI.
- La decodificacion especulativa con MTP puede mejorar el throughput, pero requiere soporte explicito en el motor de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|--------|------------|---------|----------|----------|---------|
| Qwen3.5-122B-A10B (original) | 124,6B | 10B | no disponible | Apache 2.0 | safetensors |
| Este modelo (uncensored) | 124,6B | 10B | no disponible | Apache 2.0 | GGUF |
| Qwen3.5-35B-A3B-uncensored (llmfan46) | 35B | 3B | no disponible | Apache 2.0 | GGUF |
| Qwen3.6-27B-uncensored (llmfan46) | 27B | no disponible | no disponible | Apache 2.0 | GGUF |

La principal diferencia con el original es la eliminacion de rechazos y el formato GGUF. Frente a los modelos mas pequenos de llmfan46, este ofrece mayor capacidad y calidad, pero exige hardware mucho mas potente.

## Limitaciones y advertencias

- Al ser un modelo sin censura, puede generar contenido ofensivo, violento, sexual o ilegal. No debe desplegarse en entornos de produccion sin sistemas de moderacion externos.
- La abliteracion puede degradar ligeramente la calidad de las respuestas en tareas que requieren seguir instrucciones de seguridad, aunque no se han medido diferencias en benchmarks estandar.
- No se dispone de datos sobre la longitud de contexto soportada; se recomienda probar con secuencias cortas para evitar errores.
- El modelo base fue entrenado con datos que pueden contener sesgos sociales, culturales o politicos; la eliminacion de rechazos puede amplificar estos sesgos.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un modelo reciente y poco validado por la comunidad.
- El autor advierte que ha alcanzado el limite de almacenamiento gratuito de Hugging Face y solicita donaciones; esto podria afectar a la disponibilidad futura del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/llmfan46/Qwen3.5-122B-A10B-Uncensored-Heretic-Native-MTP-Preserved-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Articulo sobre variante NVFP4: https://dev.co/ai/llms/qwen3-5-122b-a10b-heretic-mtp-nvfp4
- Guia de despliegue en DGX Spark: https://github.com/GaelicThunder/heretic-122b-dgx-spark/blob/master/README.md
- Benchmark local de Qwen3.5: https://baem1n.dev/en/posts/llm-bench-03-results-tables/
