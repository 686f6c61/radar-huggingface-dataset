# samwang0041/Qwen3.8-27B-Uncensored-oQ4e-mtp

## Resumen

El modelo `Qwen3.8-27B-Uncensored-oQ4e-mtp` es un paquete de despliegue para Apple Silicon (MLX) que contiene una cuantización 4-bit del modelo `orcarouter/Qwen3.8-27B-Uncensored`, una versión "uncensored" (con el rechazo a peticiones dañinas eliminado mediante abliteration) del modelo multimodal Qwen3.8-27B de Alibaba. El paquete ha sido generado con la herramienta oMLX (versión 0.6.4) usando una receta de cuantización mixta de precisión (oQ4e) que preserva la torre de visión y una capa de predicción multi-token (MTP). El resultado es un modelo de 15,81 GiB en formato safetensors, listo para inferencia local en equipos Mac con chip M-series.

La relevancia de este modelo radica en que ofrece una versión sin restricciones de un modelo multimodal de última generación, optimizada específicamente para el ecosistema MLX, con un rendimiento de generación de hasta 69,5 tokens por segundo en un Apple M5 Max. Está pensado para investigación, red teaming y aplicaciones donde se requiera una generación de texto sin filtros de seguridad, aunque el propio autor advierte de que debe usarse con responsabilidad y que no está destinado a producción sin capas de seguridad adicionales.

El repositorio incluye los pesos cuantizados, el índice de tensores, configuración, tokenizador y un informe de calibración (imatrix). La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso (Qwen3.8, con vision tower) |
| Parametros totales | 4.926.789.872 (según safetensors; el modelo base Qwen3.8-27B declara 27 mil millones, discrepancia no explicada) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262144 (metadata en config.json; no verificado en hardware) |
| Tipos de cuantizacion | oQ4e (Affine Q4, group_size 64, con 166 tensores elevados a Q5/G64) |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX layout, 4 shards) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B` es un transformer multimodal denso desarrollado por el equipo Qwen de Alibaba, con capacidades nativas de procesamiento de imagen y texto. Sobre este modelo, el autor de `orcarouter` aplicó una técnica de abliteration (eliminación de la dirección de rechazo en los pesos) para producir una versión "uncensored" que no se niega a responder peticiones que el modelo original rechazaría. Esta versión fue publicada en BF16 (aproximadamente 55,6 GB) y posteriormente cuantizada con oMLX.

La cuantización se realizó con oMLX 0.6.4 usando la receta oQ4e (oQ4 con imatrix mejorado) sobre una máquina Apple M5 Max con 64 GB de RAM. El proceso incluyó la generación de un proxy 4-bit para calcular la sensibilidad de los tensores, la calibración con 128 muestras de 512 tokens del dataset `oqe_code_multilingual`, y la preservación explícita de la torre de visión y de una capa de predicción multi-token (MTP). El resultado es un modelo con 504 entradas de imatrix, donde el tensor `language_model.lm_head` no fue cuantizado. No se realizó ningún reentrenamiento ni fine-tuning adicional.

## Capacidades

- Generación de texto multimodal: acepta imágenes y texto como entrada, y genera texto en chino e inglés.
- Razonamiento y resolución de problemas: hereda las capacidades del Qwen3.8-27B original en tareas de lógica, matemáticas y comprensión.
- Generación de código: el modelo base está optimizado para tareas de programación, y la cuantización mantiene esta capacidad.
- Predicción multi-token (MTP): se conserva una capa de MTP que permite acelerar la decodificación especulativa cuando se activa en oMLX.
- Sin rechazo de peticiones: gracias a la abliteration, el modelo no aplica los mecanismos de seguridad estándar de Qwen, por lo que responde a solicitudes que el original bloquearía (esto es una capacidad intencionada, pero con riesgos).
- Tool calling y agentes: el modelo base soporta llamadas a herramientas y flujos de agente, aunque no se ha verificado específicamente en esta versión cuantizada.

## Casos de uso

- Investigación en seguridad y red teaming: el modelo permite probar escenarios de generación de contenido dañino para evaluar sistemas de mitigación. Su naturaleza uncensored lo hace útil para estudiar cómo los modelos pueden ser abusados y cómo defenderse.
- Generación creativa sin restricciones: escritura de ficción, guiones o diálogos que requieran explorar temas tabú sin los filtros habituales, siempre dentro de un marco legal y ético.
- Análisis de contenido multimodal: dado que conserva la torre de visión, puede usarse para describir imágenes y extraer información de ellas, incluso si la imagen contiene contenido que otros modelos rechazarían.
- Desarrollo de asistentes locales en Apple Silicon: gracias a su tamaño compacto (15,8 GiB) y su integración con oMLX, puede desplegarse en un Mac con 64 GB de RAM para tareas de chat y generación de código sin depender de la nube.
- Evaluación de cuantización: el repositorio incluye el informe de calibración (imatrix) y los detalles de la receta, lo que lo convierte en un caso de estudio para investigadores interesados en cuantización de modelos multimodales con MLX.
- Prototipado de agentes con decodificación especulativa: la capa MTP preservada permite experimentar con técnicas de aceleración de inferencia en hardware Apple, comparando rendimiento con y sin MTP activado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo proporciona datos de throughput medidos en un Apple M5 Max con 64 GB, usando el benchmark oficial de oMLX con generación de código Python y 128 tokens de salida:

| Contexto | Prefill (PP) tok/s | Generation (TG) tok/s | TTFT | Pico de memoria |
|---|---:|---:|---:|---:|
| 1k | 818,3 | 53,1 | 1,25 s | 18,7 GB |
| 4k | 842,2 | 49,2 | 4,86 s | 20,2 GB |
| 8k | 816,6 | 44,2 | 10,03 s | 20,9 GB |
| 16k | 2782,4 | 69,5 | 5,89 s | 19,9 GB |

A partir de 16k de contexto se activa SpecPrefill, lo que explica el salto en la velocidad de prefill. Estos valores corresponden a la versión uncensored cuantizada, no al modelo oficial.

## Requisitos de hardware

- VRAM estimada: entre 18,7 GB y 20,9 GB de memoria unificada según la longitud de contexto (medido en Apple M5 Max).
- GPU recomendadas: cualquier chip Apple Silicon con al menos 32 GB de memoria unificada (el autor usó un M5 Max con 64 GB). No funciona en GPUs NVIDIA/AMD.
- Compatibilidad con hardware de consumo: sí, en Macs con Apple Silicon (M1 o posterior) y suficiente RAM unificada. No cabe en GPUs de consumo tradicionales.
- Opciones de despliegue: exclusivamente a través de oMLX (OpenAI-compatible server) o MLX. No es compatible con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: TTFT de 1,25 s a 5,89 s según contexto; generación entre 44 y 70 tokens por segundo. Con MTP activado y SpecPrefill se pueden mejorar estos valores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-oQ4e-mtp (este) | 4,9B (según safetensors) | 262k (metadata) | oQ4e 4-bit | Apache-2.0 | safetensors (MLX) | Hugging Face |
| Qwen/Qwen3.8-27B (original) | 27B | 262k | BF16 | Apache-2.0 | safetensors | Hugging Face |
| orcarouter/Qwen3.8-27B-Uncensored (BF16) | 27B | 262k | BF16 | Apache-2.0 | safetensors | Hugging Face |
| orcarouter/Qwen3.8-27B-Uncensored-GGUF | 27B | 262k | F16 a Q2_K | Apache-2.0 | GGUF | Hugging Face |

La diferencia principal con el modelo original es la eliminación del rechazo (abliteration) y la cuantización para MLX. Frente a la versión GGUF, este paquete está optimizado para Apple Silicon y preserva la torre de visión y MTP. La discrepancia en el número de parámetros (4,9B reportado frente a 27B del base) no está explicada por el autor y podría deberse a un error en la metadata.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una versión uncensored, el modelo puede generar contenido ofensivo, ilegal o peligroso sin filtros. No debe usarse en producción sin un sistema de moderación externo.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar información. La cuantización 4-bit puede aumentar este riesgo.
- Limitaciones de contexto: aunque la metadata indica 262144 tokens, el autor advierte que no se ha verificado esa longitud en hardware. El máximo probado es 16k.
- Restricciones de idioma: solo se garantizan chino e inglés; otros idiomas pueden tener un rendimiento degradado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el contenido generado puede violar leyes locales. El autor declara que el modelo es para investigación y red teaming.
- Incompatibilidad de hardware: solo funciona en Apple Silicon con oMLX/MLX. No es portable a otras plataformas.
- Riesgo de abliteration incompleta: el autor indica que el comportamiento uncensored se hereda del modelo base, pero no se ha verificado si hay casos residuales de rechazo o si la eliminación es total.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/samwang0041/Qwen3.8-27B-Uncensored-oQ4e-mtp
- Modelo base (BF16): https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Blog sobre la versión GGUF uncensored: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Guía para ejecutar localmente: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Referencia de oMLX (benchmarks): https://omlx.ai/benchmarks/performance/gm4itomo
