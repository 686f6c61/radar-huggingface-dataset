# Jeesup/svd-safety-shifted-l3_mixed_remove0.5_rho0.00000001

## Resumen

El modelo `Jeesup/svd-safety-shifted-l3_mixed_remove0.5_rho0.00000001` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct` mediante una técnica de compresión basada en descomposición en valores singulares (SVD) con un sesgo de seguridad. El autor, Jeesup, lo publica como parte de un estudio piloto sobre compresión de modelos y evaluación de seguridad, no como un modelo listo para producción. Parte de la arquitectura transformer decoder-only de Llama 3 8B Instruct, con 8.030.261.248 parámetros totales, y aplica una eliminación nominal del 50% de los parámetros de proyección.

La innovación principal no está en la arquitectura, que es la original de Llama 3, sino en el método de compresión: se calcula una métrica mixta que combina momentos de WikiText con momentos de pares prompt-dañino/respuesta-segura y prompt-benigno/respuesta-útil, y se eliminan componentes de baja magnitud en el espacio SVD bajo esa métrica. El objetivo es preservar el comportamiento seguro y útil tras la compresión, midiendo el desplazamiento relativo con un parámetro `rho` de 1e-08 y un `lambda` global de aproximadamente 3.735e-08.

Es relevante porque explora si la compresión SVD puede realizarse de forma selectiva para no degradar la seguridad del modelo base, un aspecto poco estudiado en la literatura de compresión. El repositorio incluye pesos densos plegados, diagnósticos por matriz en `compression.json` y archivos de evaluación con WikiText-2, AdvBench/HarmBench y XSTest/OR-Bench. No obstante, el propio autor advierte que se trata de un piloto unilateral, no de un SVD completo con información de Fisher, y que las mediciones no establecen una garantía de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), pesos densos plegados tras compresión SVD |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Llama 3 8B Instruct, no confirmada en la model card) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; pesos en safetensors de precision completa |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | safetensors (matrices densas plegadas) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Meta Llama 3 8B Instruct: un transformer decoder-only con atención multi-cabeza agrupada (GQA), normalización RMSNorm y activaciones SwiGLU. Sobre esos pesos se aplica una compresión por SVD con una métrica de entrada mixta (momentos de WikiText más 0.1 veces los momentos de prompt-dañino/respuesta-segura) y una métrica de salida de identidad. La eliminación nominal de parámetros de proyección es del 50%, con una fracción realizada de parámetros factoriales sobre el modelo completo de 0.565216. No hay fine-tuning de recuperación posterior a la compresión.

El proceso de calibración usa 128 ejemplos dañinos y 40 benignos para el cálculo del gradiente, con 32 y 12 ejemplos separados para la validación de entropía cruzada. La función objetivo pondera por igual la CE de respuesta segura ante prompt dañino y la CE de respuesta útil ante prompt benigno. El autor indica explícitamente que se trata de un piloto unilateral y no de un SVD completo con información de Fisher, y que los ejemplos de validación son retenidos del gradiente pero no completamente ajenos a la calibración. Los pesos se publican como matrices densas plegadas para facilitar la evaluación; el repositorio no ofrece inferencia factorizada ni demuestra una aceleración real.

## Capacidades

- Generación de texto y razonamiento conversacional heredados de Llama 3 8B Instruct, sujetos a la degradación introducida por la compresión SVD.
- Evaluación de seguridad: el checkpoint está diseñado para medir la tasa de éxito de ataques (ASR) en AdvBench con juicios de HarmBench, y el comportamiento en XSTest y los primeros 500 prompts de OR-Bench juzgados por WildGuard.
- Evaluación de perplejidad sobre WikiText-2.
- Capacidades multilingües: no documentadas en la model card; se desconoce el impacto de la compresión por idioma.
- Tool calling, function calling y razonamiento multi-paso: no verificados ni documentados para este checkpoint.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Investigación en compresión de modelos: servir como punto de comparación en estudios sobre SVD selectivo, midiendo la pérdida de perplejidad y la variación de ASR frente al modelo base sin comprimir.
- Evaluación de seguridad post-compresión: usar los archivos de evaluación incluidos (AdvBench/HarmBench, XSTest, OR-Bench con WildGuard) para analizar si la eliminación de componentes de proyección altera la tasa de respuestas dañinas.
- Análisis de robustez de alineamiento: comparar el comportamiento del checkpoint con el de Llama 3 8B Instruct original para estudiar si la compresión actúa como un ataque o como una regularización de seguridad.
- Reproducibilidad de experimentos: el repositorio incluye `experiment/` con ajustes exactos, pérdidas de validación y código fuente, lo que permite replicar el pipeline de compresión y calibración.
- Diagnóstico por matriz: `compression.json` permite estudiar qué capas o proyecciones son más sensibles a la eliminación de componentes y cómo se relaciona con la degradación funcional.
- Docencia y formación: ejemplo práctico de cómo se documenta un checkpoint de investigación con métricas de seguridad y compresión, útil en cursos de IA responsable o de eficiencia de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que los archivos de evaluación contienen WikiText-2 PPL, generaciones de AdvBench con juicios de HarmBench, XSTest y los primeros 500 prompts de OR-Bench juzgados por WildGuard, pero no se proporcionan los valores numéricos en la información facilitada. El autor advierte que las mediciones piloto no establecen una garantía de seguridad y recomienda inspeccionar la coherencia y las fracciones puntuadas junto con el ASR.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 18-24 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB; en 4 bits: alrededor de 5-6 GB (estimaciones basadas en el tamaño de parámetros, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para fp16; RTX 3090/4090 o GPUs con 8-12 GB para cuantizaciones de 8/4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en fp16 y en GPUs de 8-12 GB con cuantización, siempre que la compresión no haya alterado la compatibilidad con los kernels estándar.
- Opciones de despliegue: al ser pesos densos en safetensors con arquitectura Llama 3, debería cargarse con transformers, vLLM, TGI o llama.cpp/Ollama tras conversión a GGUF; no se ha verificado el soporte específico para este checkpoint.
- Latencia y throughput: no disponibles; el autor indica que el repositorio no proporciona inferencia factorizada ni establece una aceleración, por lo que el rendimiento esperado es el de un Llama 3 8B denso estándar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Jeesup/svd-safety-shifted-l3_mixed_remove0.5_rho0.00000001 | 8.030.261.248 | No disponible | llama3 | HuggingFace, 10 descargas | Checkpoint de investigación con compresión SVD sesgada a seguridad |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030.261.248 | 8.192 tokens (según documentación de Meta) | llama3 | HuggingFace, ampliamente disponible | Modelo base sin comprimir; referencia de comportamiento y seguridad |
| Alternativas de compresión SVD de Llama 3 | No disponible | No disponible | No disponible | No disponible | No se dispone de información sobre otros checkpoints comparables en la búsqueda realizada |

La comparación directa más relevante es con el modelo base sin comprimir, ya que el checkpoint comparte exactamente el número de parámetros nominales pero con una fracción realizada de 0.565216 en parámetros factoriales. No se dispone de datos de rendimiento del checkpoint para comparar con el base.

## Limitaciones y advertencias

- Checkpoint de investigación: el autor lo describe como un piloto unilateral, no como un SVD completo con información de Fisher; no debe tratarse como un modelo validado para producción.
- Sin garantía de seguridad: las mediciones de ASR y coherencia son piloto y no establecen una garantía; es necesario inspeccionar la coherencia y las fracciones puntuadas junto con el ASR.
- Degradación esperada: la eliminación del 50% nominal de parámetros de proyección puede reducir la calidad de generación, la coherencia y el rendimiento en tareas complejas; no hay fine-tuning de recuperación.
- Sesgos: no documentados en la model card; se heredan los sesgos de Llama 3 8B Instruct y pueden verse alterados por la compresión.
- Riesgo de alucinación: no evaluado específicamente; se desconoce el impacto de la compresión en la fidelidad factual.
- Idiomas: no se documenta qué idiomas soporta ni cómo afecta la compresión a lenguas distintas del inglés.
- Licencia: Llama 3 Community License, con restricciones de uso comercial y obligaciones de atribución; revisar los términos antes de cualquier despliegue.
- Repositorio con muy baja adopción (10 descargas, 0 likes) y sin pipeline declarado; no hay evidencia de validación externa.
- Los pesos son matrices densas plegadas; el repositorio no ofrece inferencia factorizada ni demuestra una aceleración real, por lo que no debe esperarse una mejora de eficiencia.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-shifted-l3_mixed_remove0.5_rho0.00000001
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- No se han encontrado en la busqueda web papers, blogs, repositorios o demos adicionales asociados a este checkpoint.
