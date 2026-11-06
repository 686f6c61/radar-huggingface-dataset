# Jeesup/svd-safety-shifted-l2_mixed_remove0.4_rho0.00000001

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf` mediante compresión por descomposición en valores singulares (SVD) con un sesgo deliberado hacia la seguridad. El autor, identificado como Jeesup, aplica una proyección de bajo rango que elimina nominalmente el 40% de los parámetros de proyección, con una fracción real de parámetros factoriales de 0,615424 sobre el modelo completo, y sin fine-tuning de recuperación posterior. El objetivo declarado es explorar si es posible reducir el coste computacional de un modelo de chat preservando (o alterando de forma controlada) su comportamiento frente a prompts dañinos.

El interés técnico reside en la métrica mixta utilizada para construir la proyección: combina momentos de entrada de WikiText con 0,1 veces los momentos de pares prompt dañino/respuesta segura, ponderando por igual la entropía cruzada de respuestas seguras ante prompts dañinos y la de respuestas útiles ante prompts benignos. Se trata de un piloto unilateral, no de una SVD completa con información de Fisher, y el propio autor advierte que las mediciones no constituyen garantía de seguridad. Con 6.738.415.616 parámetros reales en safetensors y 13,5 GB de repositorio, es un artefacto de evaluación para investigadores de compresión y alineación, no un modelo listo para producción.

La relevancia actual es metodológica: proporciona un punto de comparación reproducible sobre cómo la compresión de rango bajo afecta a la tasa de éxito de ataques (ASR) medida con AdvBench/HarmBench, además de métricas de coherencia (perplejidad en WikiText-2, XSTest, OR-Bench juzgado con WildGuard). Al estar construido sobre Llama 2, hereda su licencia y sus limitaciones conocidas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), pesos densos plegados tras proyección SVD de bajo rango |
| Parámetros totales | 6.738.415.616 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Llama-2-7b-chat-hf; no confirmada por el autor) |
| Tipos de cuantización | no disponible (el repositorio publica safetensors en precisión original; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (no declarados; se heredan los del modelo base, predominantemente inglés) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors (matrices densas plegadas para evaluación) |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de la familia Llama 2 con 7 mil millones de parámetros nominales. Sobre ella se aplica una compresión SVD con una métrica de entrada mixta y una métrica de salida identidad. Los hiperparámetros declarados son: eliminación nominal del 40% de los parámetros de proyección, desplazamiento relativo rho = 1e-08, lambda global = 3,375972210921948e-07 y ridge = 1e-05. La métrica mixta combina momentos de entrada de WikiText con 0,1 veces los momentos de prompt dañino/respuesta segura; ambas familias usan los mismos textos de respuesta de referencia (incluidas respuestas del profesor Llama-2), renderizados con sus propias plantillas de chat y perfilados con sus propios pesos densos.

El objetivo pondera por igual la entropía cruzada de respuesta segura ante prompt dañino y la de respuesta útil ante prompt benigno. El gradiente se calcula con 128 ejemplos dañinos y 40 benignos; la validación de entropía cruzada usa 32 y 12 ejemplos separados respectivamente. Dado que el corpus de la métrica mixta es más amplio, el autor aclara que estos son ejemplos retenidos del gradiente, no ejemplos de calibración completamente no vistos. No hay fine-tuning de recuperación tras la compresión. Los pesos publicados son matrices densas plegadas: el presupuesto de rango describe la representación de bajo rango subyacente, pero esta subida no ofrece inferencia factorizada ni demuestra una aceleración real.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Llama-2-7b-chat-hf, sujeta a la degradación introducida por la compresión (el autor recomienda inspeccionar la coherencia junto al ASR).
- Razonamiento y respuesta a instrucciones de propósito general, con calidad no cuantificada en esta ficha más allá de la perplejidad en WikiText-2.
- Evaluación de robustez frente a prompts dañinos: el checkpoint está diseñado como artefacto de medición de seguridad, no como modelo endurecido certificado.
- No se documenta soporte de tool calling, function calling ni uso como agente multi-paso.
- No se documenta capacidad multilingüe específica ni modo de razonamiento extendido (thinking mode).
- No hay visión, audio ni otras modalidades.
- No se declaran modos de decodificación especulativa ni optimizaciones de inferencia.

## Casos de uso

- Investigación en compresión de modelos: servir como punto de referencia reproducible para estudiar cómo una proyección SVD con métrica mixta afecta a la perplejidad y a la coherencia, comparando contra el Llama-2-7b-chat-hf original con los mismos scripts de `experiment/`.
- Evaluación de alineación y seguridad: medir ASR con AdvBench y juicios HarmBench sobre las generaciones del checkpoint, junto con XSTest y los primeros 500 prompts de OR-Bench juzgados con WildGuard, para analizar si la compresión desplaza el comportamiento de rechazo.
- Estudio de metodologías de SVD sesgada: replicar la ponderación 1:1 entre entropía cruzada de respuesta segura y de respuesta útil, y comparar con variantes Fisher-aware completas que el autor deja como trabajo futuro.
- Análisis de degradación por compresión: usar `compression.json` con los diagnósticos por matriz para correlacionar matrices concretas con caídas de coherencia o cambios en la tasa de rechazo.
- Docencia y formación: ilustrar en cursos de eficiencia de modelos el compromiso entre eliminación nominal de parámetros (40%) y fracción real de parámetros factoriales (0,615424) en un transformer denso.
- Auditoría de licencias y linaje: estudiar la trazabilidad de checkpoints derivados de Llama 2 y las obligaciones de atribución en artefactos de investigación publicados en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que los archivos de evaluación contienen perplejidad en WikiText-2, generaciones de AdvBench con juicios HarmBench, XSTest y los primeros 500 prompts de OR-Bench juzgados con WildGuard, pero no se incluyen cifras numéricas en el texto proporcionado. Tampoco se declaran resultados de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 16 GB o más para contextos cortos.
- Cuantización a 8 bits: alrededor de 7 GB de pesos; a 4 bits, alrededor de 3,5-4 GB, aunque el repositorio no publica variantes cuantizadas y habría que generarlas a partir de los safetensors.
- GPU recomendadas: A100 40/80 GB o H100 para evaluación por lotes a gran escala; RTX 4090 (24 GB) suficiente para fp16 con contexto moderado; RTX 3090/4080 (16-24 GB) viables en fp16 con cuidado en la longitud de contexto.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB o más en fp16, y en 8-12 GB si se cuantiza a 8 o 4 bits, siempre que se genere la cuantización localmente.
- Opciones de despliegue: transformers estándar (los pesos son matrices densas plegadas compatibles con LlamaForCausalLM); vLLM y TGI deberían funcionar al ser una arquitectura Llama 2 densa; llama.cpp/Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles. El autor advierte explícitamente que esta subida no proporciona inferencia factorizada ni establece una aceleración, por lo que no debe esperarse ninguna mejora de rendimiento frente al modelo base.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeesup/svd-safety-shifted-l2_mixed_remove0.4_rho0.00000001 | 6.738.415.616 | no disponible | Checkpoint de investigación con SVD sesgada a seguridad, sin recuperación | llama2 | Hugging Face, 11 descargas |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 | 4.096 tokens (modelo base) | Modelo de chat alineado con RLHF | llama2 | Hugging Face, ampliamente desplegado |
| Modelos de compresión SVD genérica sobre Llama 2 | variable | heredado | Compresión sin sesgo de seguridad | llama2 | Depende del autor; no disponible un comparable exacto en la información proporcionada |

La comparación directa más útil es contra el modelo base sin comprimir: este checkpoint elimina nominalmente el 40% de los parámetros de proyección, pero publica pesos densos plegados, de modo que el tamaño en disco y en VRAM es prácticamente idéntico al original. La ventaja, si existe, es analítica (menor rango subyacente), no de despliegue.

## Limitaciones y advertencias

- El autor declara explícitamente que es un piloto unilateral y no una SVD completa con información de Fisher; los resultados no deben generalizarse a otras configuraciones de compresión.
- Las mediciones de seguridad no establecen garantía alguna: hay que inspeccionar coherencia y fracciones puntuadas junto al ASR, no solo el ASR.
- Los ejemplos de validación son retenidos del gradiente, no completamente no vistos, lo que puede inflar la aparente calidad de la calibración.
- No hay fine-tuning de recuperación, por lo que es esperable degradación de calidad respecto al modelo base; la magnitud no se cuantifica en la información disponible.
- Los pesos son densos plegados: no se ofrece inferencia factorizada ni se demuestra aceleración, así que no debe usarse como sustituto eficiente del modelo base en producción.
- Riesgo de alucinación y sesgos heredados de Llama 2, no reevaluados ni mitigados en este checkpoint.
- Idiomas no declarados; se asume el comportamiento predominantemente anglófono del modelo base, sin confirmación del autor.
- Licencia llama2: uso comercial sujeto a la Llama 2 Community License, con obligaciones de atribución y restricciones de uso aceptable; conviene revisar los términos antes de cualquier despliegue.
- Repositorio con 11 descargas y 0 likes: no hay validación comunitaria ni informes independientes de calidad.
- La fecha de creación indicada (2026-10-30) es posterior a la información de referencia habitual; verificar la vigencia del artefacto antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-shifted-l2_mixed_remove0.4_rho0.00000001
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales del autor.
