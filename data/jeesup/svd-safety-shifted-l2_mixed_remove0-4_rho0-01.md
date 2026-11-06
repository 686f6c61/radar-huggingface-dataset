# Jeesup/svd-safety-shifted-l2_mixed_remove0.4_rho0.01

## Resumen

El modelo `Jeesup/svd-safety-shifted-l2_mixed_remove0.4_rho0.01` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`, desarrollado por el usuario Jeesup. No se trata de un modelo nuevo entrenado desde cero, sino de una compresión mediante descomposición en valores singulares (SVD) con un desplazamiento deliberado del objetivo hacia criterios de seguridad. Concretamente, se elimina nominalmente un 40% de los parámetros de proyección, lo que se traduce en una fracción real de parámetros factoriales de 0,615424 respecto al modelo completo. El resultado son pesos densos "plegados" (folded) listos para evaluación, sin fine-tuning de recuperación posterior.

El interés de este checkpoint es metodológico: explora si es posible mantener (o incluso reforzar) el comportamiento de seguridad de un modelo chat mientras se reduce su tamaño mediante técnicas de compresión de bajo rango. La métrica de entrada es mixta, combinando momentos de WikiText con un 10% de momentos de pares prompt-dañino/respuesta-segura, y la métrica de salida es la identidad. El autor lo describe explícitamente como un "piloto unilateral", no como un SVD completo con conciencia de Fisher.

Es relevante para investigadores que trabajan en compresión de modelos, análisis de seguridad post-compresión y evaluación de trade-offs entre eficiencia y alineamiento. No obstante, el propio autor advierte que las mediciones son preliminares y no establecen ninguna garantía de seguridad. El modelo conserva la licencia Llama 2 y la arquitectura original de Llama-2-7b-chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), pesos densos plegados tras compresion SVD |
| Parametros totales | 6.738.415.616 (~6,74 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de Llama-2-7b-chat-hf, no confirmada en la model card) |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors densos) |
| Idiomas soportados | No disponible |
| Licencia | Llama 2 (license: llama2) |
| Formato de pesos | safetensors (matrices densas plegadas de Hugging Face) |
| Fraccion de parametros factoriales realizada | 0,615424 (eliminacion nominal del 40% de parametros de proyeccion) |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Tamano del repositorio | 13,5 GB |
| Descargas | 17 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat: un transformer decoder-only con atención causal estándar y normalización RMSNorm. Sobre esta base, el autor aplica una compresión SVD con un objetivo de seguridad desplazado. La métrica de entrada es mixta: utiliza momentos de entrada de WikiText más 0,1 veces los momentos de pares prompt-dañino/respuesta-segura. Ambas familias emplean los mismos textos de respuesta de referencia (incluidas respuestas del profesor Llama-2), renderizados con sus propias plantillas de chat y perfilados con sus propios pesos densos.

El objetivo pondera por igual la entropía cruzada (CE) de respuestas seguras ante prompts dañinos y la CE de respuestas útiles ante prompts benignos. El gradiente se calcula con 128 ejemplos dañinos y 40 benignos; la validación CE usa 32 y 12 ejemplos separados respectivamente. El autor advierte que el corpus de métrica mixta es más amplio, por lo que estos son ejemplos retenidos del gradiente, no ejemplos de calibración completamente no vistos. Los hiperparámetros incluyen un desplazamiento relativo rho de 0,01, un lambda global de 0,3375972210921948 y un ridge de 1e-05. No hubo fine-tuning de recuperación tras la compresión. Los pesos publicados son matrices densas plegadas para facilitar la evaluación; el presupuesto de rango describe la representación de bajo rango subyacente, pero esta subida no proporciona inferencia factorizada ni establece una aceleración.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat, sujeta a los efectos de la compresión SVD.
- Razonamiento y respuesta a instrucciones en formato chat, con la plantilla de Llama 2.
- Evaluación de seguridad: el checkpoint está diseñado para medir comportamiento seguro ante prompts dañinos (AdvBench, HarmBench, XSTest, OR-Bench).
- No se documentan capacidades de tool calling, function calling ni agentes multi-paso en la información disponible.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito.
- Capacidades multilingües: no disponibles en la model card; se asumen las del modelo base, sin confirmación.
- El checkpoint incluye archivos de evaluación con PPL de WikiText-2, generaciones de AdvBench con juicios de HarmBench, y XSTest más los primeros 500 prompts de OR-Bench juzgados por WildGuard.

## Casos de uso

- Investigación en compresión de modelos: sirve como punto de comparación para estudiar cómo afecta la eliminación SVD del 40% de parámetros de proyección a las capacidades del modelo base, con diagnósticos por matriz en `compression.json`.
- Evaluación de seguridad post-compresión: permite medir tasas de ataque exitoso (ASR) en AdvBench y HarmBench y compararlas con el modelo Llama-2-7b-chat original, evaluando si la compresión degrada o preserva el alineamiento.
- Análisis de trade-off eficiencia-seguridad: al conocer la fracción real de parámetros factoriales (0,615424), se puede correlacionar la reducción de tamaño con cambios en PPL de WikiText-2 y en métricas de seguridad.
- Estudio de métricas mixtas en SVD: el checkpoint materializa un objetivo que combina momentos de WikiText y de pares dañino/seguro, útil para reproducir y criticar la metodología de "safety-shifted SVD".
- Validación de coherencia en modelos comprimidos: los archivos de evaluación incluyen inspección de coherencia y fracciones puntuadas junto al ASR, lo que permite detectar degradación lingüística inducida por la compresión.
- Docencia y experimentación académica: como piloto unilateral con código y configuraciones en `experiment/`, es adecuado para cursos o talleres sobre compresión y evaluación de seguridad, siempre con las cautelas del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card menciona que los archivos de evaluación contienen PPL de WikiText-2, generaciones de AdvBench con juicios de HarmBench, y XSTest más los primeros 500 prompts de OR-Bench juzgados por WildGuard, pero no se proporcionan los valores concretos. El autor indica explícitamente que estas mediciones piloto no establecen una garantía de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~6,74 mil millones de parámetros en safetensors densos, se requiere aproximadamente 13,5 GB solo para los pesos en precisión de 16 bits, más memoria para el contexto y el runtime.
- En cuantización de 8 bits se estiman unos 7-8 GB de VRAM; en 4 bits, unos 4-5 GB, aunque no se publican archivos GGUF ni cuantizaciones oficiales.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para inferencia en FP16 sin problemas de memoria; RTX 3090/4090 también válidas.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más en FP16, y en tarjetas de 8 GB si se cuantiza, aunque el repositorio no ofrece pesos cuantizados.
- Opciones de despliegue: al ser pesos densos en formato Hugging Face safetensors, es compatible con transformers, vLLM y TGI; para llama.cpp u Ollama sería necesario convertir y cuantizar previamente.
- Latencia y throughput: no disponibles. El autor señala que la subida no proporciona inferencia factorizada ni establece una aceleración, por lo que no debe esperarse un speedup por el presupuesto de rango.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeesup/svd-safety-shifted-l2_mixed_remove0.4_rho0.01 | ~6,74 mil millones (fraccion factorial 0,615424) | No disponible | Compresion SVD con objetivo de seguridad desplazado | Llama 2 | Hugging Face, 17 descargas |
| meta-llama/Llama-2-7b-chat-hf | ~6,74 mil millones | 4096 tokens (segun documentacion de Llama 2) | Modelo base chat con RLHF | Llama 2 | Hugging Face, ampliamente disponible |
| Modelos comprimidos SVD de Llama-2 sin desplazamiento de seguridad | Variable | No disponible | Compresion SVD estandar | Segun derivado | No disponible en la informacion proporcionada |

La comparativa directa con otras variantes comprimidas de Llama-2 no está disponible en la información proporcionada. El modelo base Llama-2-7b-chat sirve como referencia natural, pero no se ofrecen métricas comparativas numéricas.

## Limitaciones y advertencias

- El autor describe el checkpoint como un "piloto unilateral", no como un SVD completo con conciencia de Fisher; los resultados no deben generalizarse a métodos de compresión más sofisticados.
- Las mediciones piloto no establecen ninguna garantía de seguridad; deben inspeccionarse la coherencia y las fracciones puntuadas junto al ASR.
- Los ejemplos de validación son retenidos del gradiente, pero el corpus de métrica mixta es más amplio, por lo que no son ejemplos de calibración completamente no vistos.
- No hubo fine-tuning de recuperación, por lo que es esperable cierta degradación de capacidades respecto al modelo base.
- Los pesos son matrices densas plegadas; no se proporciona inferencia factorizada ni se demuestra aceleración alguna.
- Riesgo de alucinación y sesgos: no documentados específicamente en la model card; se heredan los del modelo base Llama-2-7b-chat, sin evaluación adicional.
- Limitaciones de idioma y contexto: no disponibles en la información proporcionada.
- Restricciones de licencia: se aplica la licencia Llama 2, que impone condiciones de uso comercial y requiere cumplir la política de uso aceptable de Meta.
- El repositorio tiene muy poca adopción (17 descargas, 0 likes), lo que limita la validación comunitaria.
- La fecha de creación indicada (2026-10-30) es posterior a la información de referencia habitual; debe verificarse en la página del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Jeesup/svd-safety-shifted-l2_mixed_remove0.4_rho0.01
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios de código o demos.
