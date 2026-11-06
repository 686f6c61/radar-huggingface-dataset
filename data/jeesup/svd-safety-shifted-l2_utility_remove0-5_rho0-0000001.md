# Jeesup/svd-safety-shifted-l2_utility_remove0.5_rho0.0000001

## Resumen
Este repositorio contiene un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf` mediante una técnica de compresión basada en descomposición en valores singulares (SVD) con un sesgo explícito hacia la seguridad. El autor, Jeesup, aplica una eliminación nominal del 50% de los parámetros de proyección (fracción realizada de parámetros factoriales de 0,519340 sobre el modelo completo) sin fine-tuning de recuperación posterior. El objetivo es estudiar si es posible reducir el coste computacional de un modelo de 7B preservando simultáneamente utilidad y comportamiento seguro.

El modelo no es un producto listo para producción, sino un piloto unidireccional de un método que el propio autor describe como no plenamente consciente de la matriz de Fisher ("one-sided pilot, not full Fisher-aware SVD"). Se distribuye con pesos densos ya plegados en formato Hugging Face estándar, de modo que la representación de bajo rango subyacente no se expone como artefacto factorizado y no se ofrece aceleración de inferencia.

Su relevancia actual reside en el área de compresión de modelos con preservación de alineamiento: la pregunta de si una reducción agresiva de rango degrada la seguridad antes que la capacidad lingüística. Con 11 descargas y 0 likes, es un artefacto de investigación de nicho, útil para reproducir experimentos de SVD sesgada por métricas de seguridad, no como sustituto operativo de Llama 2 Chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), pesos densos plegados tras compresión SVD |
| Parametros totales | 6.738.415.616 (6,74B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 2, no confirmada) |
| Tipos de cuantizacion | no disponible; pesos en safetensors de precisión original |
| Idiomas soportados | no disponibles |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors (repo de 13,5 GB) |

## Arquitectura y entrenamiento
La arquitectura base es la de Llama 2 7B Chat: transformer decoder-only con atención multi-cabeza y normalización RMSNorm, aproximadamente 6,74B parámetros. Sobre ese modelo, el autor aplica una compresión SVD con un objetivo mixto: los momentos de entrada provienen de WikiText (métrica de utilidad) combinados con 0,1 veces los momentos de pares prompt dañino/respuesta segura (métrica de identidad). La pérdida pondera por igual la entropía cruzada de respuestas seguras ante prompts dañinos y la de respuestas útiles ante prompts benignos. El gradiente se calcula con 128 ejemplos dañinos y 40 benignos, con validación sobre 32 y 12 ejemplos separados respectivamente.

Los hiperparámetros clave son un desplazamiento relativo rho de 1e-07, un lambda global de 2,118224627486761e-06 y un ridge de 1e-05. No hay fine-tuning de recuperación tras la compresión. El autor advierte que la validación usa ejemplos retenidos del gradiente pero no completamente ajenos a la calibración, dado que el corpus de métrica mixta es más amplio. Los pesos subidos son matrices densas plegadas para facilitar la evaluación; el presupuesto de rango describe la representación de bajo rango subyacente, pero el repositorio no proporciona inferencia factorizada ni demuestra speedup.

## Capacidades
- Generación de texto conversacional heredada de Llama 2 7B Chat, sujeta a la degradación introducida por la compresión al 50% nominal de parámetros de proyección.
- Razonamiento y respuesta a instrucciones en el formato de chat de Llama 2, con posible pérdida de coherencia no cuantificada en la información disponible.
- Evaluación de seguridad: el checkpoint incluye artefactos para medir WikiText-2 PPL, generaciones en AdvBench con juicios HarmBench, XSTest y los primeros 500 prompts de OR-Bench juzgados con WildGuard.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documentan capacidades multimodales, de audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles; no se especifica cobertura idiomática más allá de la del modelo base.
- No se garantiza ningún comportamiento de seguridad; el autor lo califica explícitamente de medición piloto sin garantía.

## Casos de uso
- Investigación en compresión de modelos: reproducir el pipeline SVD con métrica mixta (utilidad + identidad) para estudiar la frontera entre degradación de capacidad y degradación de alineamiento en modelos de 7B.
- Auditoría de seguridad comparativa: usar los artefactos de evaluación incluidos (AdvBench, HarmBench, XSTest, OR-Bench con WildGuard) para contrastar tasas de respuesta dañina frente al Llama 2 Chat original y frente a otras variantes comprimidas.
- Estudio de robustez de salvaguardas: analizar si una reducción del 50% de parámetros de proyección elimina o preserva los mecanismos de rechazo aprendidos por RLHF en Llama 2 Chat.
- Docencia y experimentación académica: material de partida para cursos sobre SVD, presupuestos de rango y evaluación de safety en modelos abiertos, dado su bajo coste de descarga (13,5 GB) y su documentación de hiperparámetros en `experiment/`.
- Análisis de coherencia post-compresión: medir WikiText-2 PPL y examinar la fracción de generaciones puntuadas para detectar colapso lingüístico antes de considerar cualquier uso generativo.
- Baseline en estudios de recuperación: servir como punto de partida sin fine-tuning para comparar contra variantes con recuperación (recovery fine-tuning) en futuros trabajos sobre SVD sesgada por seguridad.

## Benchmarks y rendimiento
No se han publicado resultados numéricos de benchmarks en la información disponible. La model card indica que los ficheros de evaluación contienen WikiText-2 PPL, generaciones de AdvBench con juicios HarmBench, XSTest y los primeros 500 prompts de OR-Bench juzgados por WildGuard, pero no se proporcionan los valores obtenidos en el texto disponible. El autor recomienda inspeccionar la coherencia y las fracciones puntuadas junto con la tasa de éxito de ataque (ASR).

## Requisitos de hardware
- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 16-20 GB según longitud de contexto.
- Cuantización a 8 bits: alrededor de 7 GB de pesos; a 4 bits: alrededor de 3,5-4 GB, aunque no se han publicado artefactos GGUF ni cuantizaciones oficiales para este checkpoint.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para FP16 sin compromisos; RTX 4090 (24 GB) suficiente para FP16 con contexto moderado.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en FP16 y en GPUs de 8-12 GB solo mediante cuantización, que habría que generar manualmente.
- Opciones de despliegue: transformers estándar al ser pesos densos en safetensors; vLLM, TGI o llama.cpp requerirían conversión o cuantización previa no proporcionada.
- Latencia y throughput: no disponibles; el autor indica explícitamente que el upload no establece ningún speedup pese al presupuesto de rango subyacente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeesup/svd-safety-shifted-l2_utility_remove0.5_rho0.0000001 | 6,74B | no disponible | Compresión SVD con sesgo de seguridad, sin recuperación | llama2 | Hugging Face, 11 descargas |
| meta-llama/Llama-2-7b-chat-hf | 6,74B | 4.096 tokens (modelo base) | Modelo original con RLHF | llama2 | Hugging Face, ampliamente usado |
| Variantes de compresión SVD de Llama 2 (familia del mismo autor) | ~6,7B | no disponible | Distintos valores de rho y presupuestos de rango | llama2 | Hugging Face, disponibilidad variable |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias
- El propio autor califica el trabajo de piloto unidireccional y no de SVD plenamente consciente de Fisher; los resultados no deben generalizarse.
- No existe garantía de seguridad: las mediciones piloto no establecen ningún nivel de alineamiento y deben interpretarse junto con la coherencia y la fracción de respuestas puntuadas, no solo con el ASR.
- Sesgos conocidos: no documentados específicamente para este checkpoint; hereda los del Llama 2 7B Chat base, agravados potencialmente por la compresión.
- Riesgo de alucinación: no cuantificado; la eliminación del 50% de parámetros de proyección sin recuperación puede degradar la coherencia de forma no medida en el texto disponible.
- La validación usa ejemplos retenidos del gradiente pero no completamente ajenos a la calibración, lo que puede inflar las métricas reportadas.
- Licencia llama2: impone restricciones de uso comercial (umbral de 700 millones de usuarios mensuales, atribución "Built with Llama", restricciones de uso aceptable); revisar los términos antes de cualquier despliegue.
- No apto para producción: es un checkpoint de investigación con 11 descargas, sin pipeline definido, sin cuantizaciones oficiales y sin inferencia factorizada que materialice el ahorro de cómputo.
- Idiomas soportados no documentados; no asumir cobertura multilingüe más allá de la del modelo base.

## Enlaces
- Hugging Face: https://huggingface.co/Jeesup/svd-safety-shifted-l2_utility_remove0.5_rho0.0000001
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.
