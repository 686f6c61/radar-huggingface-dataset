# Jeesup/svd-safety-shifted-l3_mixed_remove0.5_rho0.003

## Resumen

`Jeesup/svd-safety-shifted-l3_mixed_remove0.5_rho0.003` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct` mediante compresión por descomposición en valores singulares (SVD) con un sesgo explícito hacia la seguridad. El autor, Jeesup, aplica una eliminación nominal del 50 % de los parámetros de proyección, lo que se traduce en una fracción real de parámetros factoriales de 0,565216 sobre el modelo completo, sin fine-tuning de recuperación posterior. No es un modelo pensado para producción, sino un artefacto experimental para estudiar cómo afecta la compresión low-rank al comportamiento de seguridad de un LLM.

La innovación metodológica reside en la métrica mixta de entrada: combina momentos de WikiText con momentos de pares prompt-dañino/respuesta-segura ponderados por 0,1, de modo que la proyección SVD preserva direcciones relevantes tanto para la perplejidad lingüística como para la alineación de seguridad. El objetivo de entrenamiento pondera por igual la entropía cruzada de respuestas seguras ante prompts dañinos y la de respuestas útiles ante prompts benignos, usando gradientes calculados sobre 128 ejemplos dañinos y 40 benignos.

El resultado es un Llama 3 8B Instruct comprimido que mantiene la arquitectura densa original (los pesos se entregan como matrices densas plegadas, no factorizadas), con 8.030.261.248 parámetros y licencia Llama 3. Su relevancia es doble: por un lado, sirve como caso de estudio de compresión consciente de seguridad; por otro, advierte de que las métricas de ataque exitoso (ASR) deben interpretarse junto a la coherencia y la fracción de respuestas puntuables, ya que el autor no establece ninguna garantía de seguridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), pesos densos plegados tras compresión SVD |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada (heredada de Llama 3 8B Instruct: 8.192 tokens) |
| Tipos de cuantización | No disponible (pesos en safetensors; cuantización posterior posible vía herramientas estándar) |
| Idiomas soportados | No disponible |
| Licencia | Llama 3 (llama3) |
| Formato de pesos | safetensors (matrices densas plegadas) |

## Arquitectura y entrenamiento

El modelo parte de `Meta-Llama-3-8B-Instruct`, un transformer decoder-only con 8.030 millones de parámetros, y le aplica una compresión por SVD con eliminación nominal del 50 % de los parámetros de proyección. La fracción realizada de parámetros factoriales sobre el modelo completo es 0,565216, lo que indica que la reducción efectiva es menor que el 50 % nominal. El checkpoint subido contiene matrices densas plegadas para facilitar la evaluación; el presupuesto de rango describe la representación low-rank subyacente, pero esta subida no proporciona inferencia factorizada ni demuestra una aceleración real.

La calibración usa una métrica mixta: momentos de entrada de WikiText más 0,1 veces los momentos de pares prompt-dañino/respuesta-segura. Ambas familias emplean los mismos textos de respuesta de referencia (incluidas respuestas del profesor Llama-2), renderizadas con sus propias plantillas de chat y perfiladas con sus propios pesos densos. El desplazamiento relativo es rho = 0,003, con lambda global 0,011206038494254621 y ridge 1e-05. El objetivo pondera igualmente la entropía cruzada de respuestas seguras ante prompts dañinos y la de respuestas útiles ante prompts benignos; el gradiente se calcula sobre 128 ejemplos dañinos y 40 benignos, con validación sobre 32 y 12 ejemplos separados respectivamente. El autor advierte explícitamente que es un piloto unilateral, no un SVD completo con información de Fisher.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas de Llama 3 8B Instruct.
- Razonamiento y respuesta a instrucciones en formato chat de Llama 3.
- Capacidad de código y matemáticas propia del modelo base (no evaluada específicamente en este checkpoint).
- Soporte de tool calling y function calling heredado del modelo base (no verificado tras la compresión).
- Capacidades multilingües del modelo base (no documentadas para este checkpoint).
- No incluye visión, audio ni modo de pensamiento explícito.
- El checkpoint está orientado a evaluación de seguridad, no a uso como asistente general.

## Casos de uso

- Investigación sobre compresión consciente de seguridad: comparar la tasa de ataque exitoso (ASR) en AdvBench/HarmBench de este checkpoint frente al modelo base sin comprimir y frente a compresiones SVD estándar, para medir si la métrica mixta preserva la alineación.
- Estudio de degradación por compresión: analizar la perplejidad en WikiText-2 junto a la coherencia de las generaciones, para separar pérdida de calidad lingüística de pérdida de seguridad.
- Auditoría de robustez de salvaguardas: usar XSTest y los primeros 500 prompts de OR-Bench con juicio de WildGuard para evaluar falsos rechazos y respuestas dañinas en un modelo comprimido.
- Reproducción de experimentos: los archivos bajo `experiment/` y `compression.json` permiten replicar los diagnósticos por matriz y validar los ajustes exactos del pipeline SVD.
- Línea base en pipelines de evaluación de seguridad: integrar el checkpoint como referencia comprimida en un banco de pruebas que compare múltiples técnicas de compresión antes de desplegar modelos reducidos.
- Docencia y formación: ilustrar en cursos de ML los compromisos entre tamaño, perplejidad y alineación usando un artefacto pequeño (16,1 GB de repo) y reproducible.
- Exploración de despliegue en hardware limitado: aunque no se demuestra speedup, el checkpoint denso puede cargarse con las herramientas estándar de Llama 3 para probar escenarios de inferencia con recursos restringidos.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card indica que los archivos de evaluación contienen perplejidad en WikiText-2, generaciones en AdvBench con juicios de HarmBench, y XSTest más los primeros 500 prompts de OR-Bench juzgados por WildGuard, pero no se proporcionan los valores en el texto facilitado. El autor subraya que estas mediciones piloto no establecen ninguna garantía de seguridad y que deben inspeccionarse junto con la coherencia y la fracción de respuestas puntuables.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB; en 4 bits: en torno a 4,5-5,5 GB (estimaciones según el tamaño de parámetros, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en FP16 ajustado o en RTX 3090/4080 con cuantización 8/4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama mediante conversión a GGUF; al ser matrices densas plegadas, es compatible con las herramientas estándar de Llama 3.
- Latencia y throughput: no disponibles; el autor indica que esta subida no proporciona inferencia factorizada ni establece una aceleración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeesup/svd-safety-shifted-l3_mixed_remove0.5_rho0.003 | 8.030 M | No disponible (base: 8.192) | Compresión SVD con sesgo de seguridad | Llama 3 | HuggingFace, 14 descargas |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030 M | 8.192 | Modelo base sin comprimir | Llama 3 | HuggingFace, ampliamente disponible |
| Compresiones SVD estándar de Llama 3 8B | ~8.030 M (densas plegadas) | 8.192 | Compresión low-rank sin sesgo de seguridad | Según autor | Variable |
| Llama 3.1 8B Instruct | 8.030 M | 131.072 | Modelo denso de nueva generación | Llama 3.1 | HuggingFace |

La comparación relevante es contra el modelo base y contra compresiones SVD convencionales: este checkpoint se distingue por la métrica mixta de calibración y por la ponderación explícita de seguridad, no por mejoras de rendimiento o contexto. No se dispone de datos de benchmarks para cuantificar la diferencia frente a esas alternativas.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo listo para producción; el autor lo califica de piloto unilateral.
- No establece ninguna garantía de seguridad: las mediciones de ASR deben leerse junto a la coherencia y la fracción de respuestas puntuables.
- La compresión puede degradar la calidad lingüística y la utilidad; la perplejidad en WikiText-2 debe verificarse antes de cualquier uso.
- Riesgo de alucinación inherente al modelo base, potencialmente agravado por la compresión.
- Sesgos conocidos de Llama 3 8B Instruct, no reevaluados en este checkpoint.
- Idiomas soportados no documentados; el comportamiento multilingüe tras la compresión es incierto.
- La licencia Llama 3 impone restricciones de uso comercial y obligaciones de atribución; debe revisarse antes de cualquier despliegue.
- El repo no incluye inferencia factorizada ni demuestra speedup; el beneficio de tamaño es teórico en esta subida.
- Los ejemplos de calibración y validación son limitados (128/40 y 32/12) y no completamente invisibles al gradiente, según el propio autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-shifted-l3_mixed_remove0.5_rho0.003
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- No se han encontrado en la información proporcionada papers, blogs, repositorios o demos adicionales.
