# Jeesup/svd-safety-shifted-l3_utility_remove0.4_rho0

## Resumen

`Jeesup/svd-safety-shifted-l3_utility_remove0.4_rho0` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct` mediante una técnica de compresión basada en descomposición en valores singulares (SVD) con eliminación nominal del 40 % de los parámetros de proyección. Lo publica el usuario Jeesup como parte de un piloto sobre alineamiento de seguridad y utilidad, no como un modelo listo para producción. El objetivo declarado es explorar si es posible desplazar el comportamiento del modelo en el eje seguridad/utilidad mediante la poda de componentes de bajo rango, sin fine-tuning de recuperación posterior.

El modelo conserva la arquitectura transformer decoder-only de Llama 3 8B Instruct, con 8.030.261.248 parámetros totales y pesos densos recombinados en formato safetensors (16,1 GB de repositorio). La fracción de parámetros de factor realizada sobre el modelo completo es 0,652173, lo que indica que la poda afecta a un subconjunto de matrices y no a la totalidad de la red. No se publican datos de contexto, idiomas ni pipeline de inferencia en la información disponible.

Su relevancia es metodológica: documenta con detalle el protocolo de evaluación (WikiText-2 PPL, AdvBench/HarmBench, XSTest y OR-Bench con WildGuard) y advierte explícitamente de que es un piloto unilateral, no un SVD completo con información de Fisher. Resulta útil para investigadores que estudien compresión consciente de seguridad, pero no para despliegues comerciales sin validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), pesos densos recombinados tras SVD |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Llama 3 Community License (license: llama3) |
| Formato de pesos | safetensors (matrices densas plegadas) |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Meta Llama 3 8B Instruct: transformer decoder-only con atención multi-cabeza agrupada (GQA) y normalización RMSNorm, según la familia Llama 3. Sobre ese modelo base se aplica una compresión SVD con eliminación nominal del 40 % de los parámetros de proyección, dando lugar a una representación de bajo rango cuyos factores se pliegan de nuevo en matrices densas para facilitar la evaluación. La fracción de parámetros de factor realizada sobre el modelo completo es 0,652173.

El proceso no incluye fine-tuning de recuperación. La métrica de entrada del objetivo es "utility" y la de salida es "identity"; el desplazamiento relativo rho es 0,0, lambda global 0,0 y ridge 1e-05. La métrica mixta combina momentos de WikiText con 0,1 veces los momentos de pares prompt dañino/respuesta segura, usando las mismas respuestas de referencia (incluidas respuestas del profesor Llama-2) renderizadas con sus propias plantillas de chat y perfiladas con sus propios pesos densos. El gradiente emplea 128 ejemplos dañinos y 40 benignos; la validación CE usa 32 y 12 ejemplos separados, que son held-out respecto al gradiente pero no totalmente ajenos a la calibración. El autor califica explícitamente el método como "one-sided pilot, not full Fisher-aware SVD".

## Capacidades

- Generación de texto y razonamiento conversacional heredados de Llama 3 8B Instruct, sujetos a la degradación introducida por la poda SVD.
- Seguimiento de instrucciones en formato chat de Llama 3 (el checkpoint mantiene la plantilla del modelo base).
- Evaluación de seguridad: el checkpoint incluye artefactos para medir PPL en WikiText-2, generaciones en AdvBench con juicios HarmBench, XSTest y los primeros 500 prompts de OR-Bench juzgados con WildGuard.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada (heredadas potencialmente del base, sin verificación publicada).
- No se garantiza coherencia ni calidad de generación tras la poda; el autor recomienda inspeccionar la coherencia y las fracciones puntuadas junto con la ASR.

## Casos de uso

- Investigación en compresión consciente de seguridad: usar el checkpoint como punto de comparación frente al Llama 3 8B Instruct original para medir el efecto de eliminar el 40 % de parámetros de proyección sobre PPL y tasas de respuesta dañina.
- Reproducción de experimentos de SVD: el repositorio incluye `experiment/` con ajustes exactos, pérdidas de validación y código fuente, y `compression.json` con diagnósticos por matriz, lo que permite replicar el pipeline.
- Auditoría de robustez de salvaguardas: ejecutar AdvBench/HarmBench y XSTest sobre el checkpoint para estudiar si la poda desplaza la frontera entre rechazo y cumplimiento.
- Estudio de calibración de métricas mixtas: analizar cómo el uso de momentos de WikiText más 0,1 veces momentos de prompt dañino/respuesta segura afecta al compromiso utilidad-seguridad.
- Docencia y formación: material didáctico sobre técnicas de compresión low-rank y su impacto en alineamiento, dado que el autor documenta explícitamente las limitaciones del piloto.
- Baseline para métodos Fisher-aware: servir como referencia "unilateral" frente a futuras implementaciones de SVD con información de Fisher, tal y como sugiere la model card.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card menciona que los ficheros de evaluación contienen WikiText-2 PPL, generaciones de AdvBench con juicios HarmBench, XSTest y los primeros 500 prompts de OR-Bench juzgados por WildGuard, pero no se incluyen los valores en el material proporcionado. El autor advierte que estas mediciones piloto no establecen una garantía de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 16 GB solo para pesos (8,03 mil millones de parámetros × 2 bytes), más overhead de KV cache y activaciones; en la práctica, 18-24 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB de pesos; en 4 bits, en torno a 4,5-5 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para evaluación a gran escala; RTX 4090 (24 GB) o RTX A6000 (48 GB) para inferencia en fp16 con contexto moderado.
- Compatibilidad con GPU de consumo: sí en RTX 3090/4090 (24 GB) en fp16 con contexto limitado, y en GPUs de 12-16 GB solo mediante cuantización no oficial.
- Opciones de despliegue: al ser pesos densos en safetensors con arquitectura Llama 3, es compatible con vLLM, TGI, llama.cpp (previa conversión a GGUF) y Ollama (previa conversión); no se documenta ningún pipeline oficial.
- Latencia y throughput: no disponibles. El autor indica explícitamente que la subida no proporciona inferencia factorizada ni establece una mejora de velocidad; el presupuesto de rango describe la representación low-rank subyacente, no un speedup medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Jeesup/svd-safety-shifted-l3_utility_remove0.4_rho0 | 8,03 B | No disponible | Llama 3 | Checkpoint de investigación con poda SVD del 40 % y sin fine-tuning de recuperación |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8.192 tokens (según ficha oficial del base) | Llama 3 | Modelo base sin comprimir; referencia de utilidad y seguridad |
| Modelos Llama 3 8B comprimidos por poda o cuantización (p. ej. variantes GGUF/AWQ de la comunidad) | ~8 B | Depende de la variante | Llama 3 | Orientados a eficiencia de despliegue, no a estudio de seguridad |

La comparación con alternativas de la misma categoría (checkpoints de investigación sobre compresión y seguridad) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Es un piloto unilateral, no un SVD completo con información de Fisher; los resultados no deben generalizarse a métodos de compresión más sofisticados.
- Sin fine-tuning de recuperación: es esperable degradación de coherencia y calidad, y el autor recomienda inspeccionar la coherencia junto con las métricas de seguridad.
- Los ejemplos de validación CE (32 dañinos y 12 benignos) son held-out respecto al gradiente pero no totalmente ajenos a la calibración, lo que puede inflar ligeramente las estimaciones.
- Las mediciones piloto no establecen una garantía de seguridad; la ASR debe interpretarse junto con la fracción de respuestas puntuadas y la coherencia.
- Sesgos conocidos: no documentados específicamente para este checkpoint; hereda los del modelo base Llama 3 8B Instruct, no auditados aquí.
- Riesgo de alucinación: no cuantificado en la información disponible; la poda puede agravarlo.
- Restricciones de licencia: Llama 3 Community License, con obligaciones de atribución ("Built with Meta Llama 3") y condiciones de uso comercial definidas por Meta; revisar antes de cualquier despliegue.
- Idiomas soportados y longitud de contexto no verificados tras la compresión.
- El repositorio no ofrece inferencia factorizada ni speedup; el presupuesto de rango es solo descriptivo de la representación subyacente.
- Solo 16 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-shifted-l3_utility_remove0.4_rho0
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Llama 3: https://llama.meta.com/llama3/license/
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
