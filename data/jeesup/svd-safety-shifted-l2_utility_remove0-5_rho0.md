# Jeesup/svd-safety-shifted-l2_utility_remove0.5_rho0

## Resumen

Jeesup/svd-safety-shifted-l2_utility_remove0.5_rho0 es un checkpoint de investigación derivado de meta-llama/Llama-2-7b-chat-hf mediante compresión por descomposición en valores singulares (SVD). El autor, Jeesup, aplica una proyección de bajo rango con eliminación nominal del 50 % de los parámetros de proyección, lo que se traduce en una fracción realizada de parámetros factoriales de 0,519340 sobre el modelo completo. No se aplica fine-tuning de recuperación posterior, de modo que el checkpoint conserva el comportamiento residual de la compresión sin corrección.

El interés del modelo es experimental: no busca ser un asistente de producción, sino servir como piloto para estudiar cómo la compresión SVD afecta simultáneamente a la utilidad (perplejidad en WikiText-2) y a la seguridad (tasa de éxito de ataques en AdvBench/HarmBench, junto con XSTest y OR-Bench). El autor describe explícitamente este artefacto como un piloto unilateral, no como un SVD completo con información de Fisher, y advierte que sus mediciones no establecen ninguna garantía de seguridad.

Arquitectura transformer decoder-only de la familia Llama 2 con 6.738.415.616 parámetros totales y pesos en safetensors (13,5 GB de repositorio). El contexto, los idiomas y la pipeline no se documentan en la información disponible; la licencia es llama2 y el uso queda sujeto a los términos de Meta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), pesos densos plegados tras compresión SVD |
| Parametros totales | 6.738.415.616 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors sin cuantizar) |
| Idiomas soportados | No disponible |
| Licencia | llama2 |
| Formato de pesos | safetensors (matrices densas plegadas de Hugging Face) |

## Arquitectura y entrenamiento

El modelo parte de Llama-2-7b-chat-hf y se somete a una compresión por SVD con eliminación nominal del 50 % de los parámetros de proyección. La fracción realizada de parámetros factoriales sobre el modelo completo es 0,519340, y no hay fine-tuning de recuperación. La métrica de entrada del objetivo es de utilidad y la de salida es de identidad, con un desplazamiento relativo rho de 0,0, lambda global de 0,0 y ridge de 1e-05. La métrica mixta combina momentos de entrada de WikiText con 0,1 veces los momentos de indicaciones dañinas y respuestas seguras; ambas familias emplean los mismos textos de respuesta de referencia (incluidas respuestas del profesor Llama-2), renderizados con sus propias plantillas de chat y perfilados con sus propios pesos densos.

El objetivo pondera por igual la entropía cruzada de respuestas seguras ante indicaciones dañinas y la de respuestas útiles ante indicaciones benignas. El gradiente se calcula con 128 ejemplos dañinos y 40 benignos; la validación de entropía cruzada usa 32 y 12 ejemplos separados, de modo que son ejemplos retenidos del gradiente, no ejemplos de calibración totalmente no vistos. Los pesos publicados son matrices densas plegadas para facilitar la evaluación; el presupuesto de rango describe la representación de bajo rango subyacente, pero la subida no ofrece inferencia factorizada ni establece una aceleración. El autor califica el experimento como piloto unilateral, no como un SVD completo con información de Fisher.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat-hf, sujeta a la degradación introducida por la compresión sin recuperación.
- Evaluación de seguridad: el checkpoint incluye material para medir generaciones en AdvBench con juicios de HarmBench, además de XSTest y los primeros 500 prompts de OR-Bench juzgados con WildGuard.
- Evaluación de utilidad mediante perplejidad en WikiText-2.
- Diagnóstico de compresión: el repositorio incluye diagnósticos por matriz en `compression.json` y ajustes exactos, pérdidas de validación y código fuente en `experiment/`.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación sobre compresión de modelos: sirve como punto de comparación para estudiar el efecto de distintos presupuestos de rango SVD sobre un mismo modelo base, ya que el autor publica la fracción realizada de parámetros y los diagnósticos por matriz.
- Evaluación de seguridad post-compresión: permite medir la tasa de éxito de ataques en AdvBench con juicios de HarmBench y contrastarla con la del modelo denso original, usando los ficheros de evaluación incluidos.
- Análisis de sobre-rechazo: los resultados de XSTest permiten comprobar si la compresión altera la tendencia del modelo a rechazar peticiones benignas.
- Estudios de alineación bajo restricciones de recursos: al reducir el presupuesto de parámetros, el checkpoint sirve para analizar si la utilidad y la seguridad se degradan de forma correlacionada o independiente.
- Reproducción de experimentos: el código fuente y las pérdidas de validación en `experiment/` permiten replicar el pipeline de SVD y variar rho, lambda o el peso de las métricas mixtas.
- Docencia y divulgación: como ejemplo didáctico de cómo una proyección de bajo rango afecta a un modelo de chat, con métricas de coherencia y fracciones puntuadas además de la ASR.
- No se recomienda su uso como asistente en producción: el propio autor indica que las mediciones piloto no establecen ninguna garantía de seguridad y que no hay recuperación de calidad tras la compresión.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card menciona que los ficheros de evaluación contienen perplejidad en WikiText-2, generaciones en AdvBench con juicios de HarmBench, XSTest y los primeros 500 prompts de OR-Bench juzgados con WildGuard, pero no se proporcionan las cifras en el material disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa de la familia Llama-2-7b, los pesos en fp16 ocupan aproximadamente 13,5 GB, por lo que se necesitarían del orden de 14-16 GB de VRAM para cargar el modelo completo en precisión media, sin contar caché KV ni overhead del runtime.
- GPU recomendadas: no disponible. Para fp16 se requieren GPUs con al menos 16 GB de VRAM (por ejemplo, A100, H100 o RTX 4090); para GPUs consumer de 8-12 GB sería necesario cuantizar, pero el repositorio solo publica safetensors sin cuantizar.
- Cabe en consumer GPU: no confirmado para los pesos publicados en fp16; requeriría cuantización externa no incluida en el repositorio.
- Opciones de despliegue: no disponibles en la información proporcionada. Al ser pesos densos plegados compatibles con Hugging Face, podría cargarse con runtimes estándar de Llama 2, pero el autor advierte que la subida no ofrece inferencia factorizada ni establece una aceleración.
- Latencia y throughput: no disponibles. El autor indica explícitamente que el checkpoint no establece ninguna mejora de velocidad pese a su presupuesto de rango.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Jeesup/svd-safety-shifted-l2_utility_remove0.5_rho0 | 6.738.415.616 | No disponible | llama2 | safetensors | Piloto de compresión SVD sin recuperación |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 (aproximado, modelo base) | 4.096 tokens (según la ficha oficial de Llama 2) | llama2 | safetensors | Modelo base sin comprimir |
| Otros checkpoints SVD de Llama 2 | No disponible | No disponible | llama2 | safetensors | No se dispone de alternativas comparables documentadas en la información proporcionada |

La comparación directa con otros pilotos de compresión SVD no está disponible en el material consultado. La referencia natural es el modelo base sin comprimir, del que este checkpoint deriva y con el que comparte arquitectura y número de parámetros totales.

## Limitaciones y advertencias

- El autor declara que se trata de un piloto unilateral, no de un SVD completo con información de Fisher; los resultados no deben extrapolarse a métodos de compresión más sofisticados.
- No hay fine-tuning de recuperación, por lo que la calidad de generación puede estar degradada respecto al modelo base; deben inspeccionarse la coherencia y las fracciones puntuadas junto con la ASR.
- Las mediciones piloto no establecen ninguna garantía de seguridad; el checkpoint no debe presentarse como modelo seguro.
- Los ejemplos de validación de entropía cruzada son retenidos del gradiente, no totalmente no vistos, lo que puede inflar ligeramente la estimación de generalización.
- Los pesos publicados son matrices densas plegadas; no se ofrece inferencia factorizada ni se demuestra aceleración alguna.
- Sesgos conocidos: no documentados en la información disponible, aunque se heredan los del modelo base Llama-2-7b-chat-hf.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Idiomas y longitud de contexto: no documentados en la información disponible.
- Licencia llama2: el uso comercial y la redistribución están sujetos a los términos de Meta para Llama 2, incluidos requisitos de atribución y restricciones de uso aceptable.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-shifted-l2_utility_remove0.5_rho0
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Repositorio de código y ajustes del experimento: incluido en la carpeta `experiment/` del propio repositorio de Hugging Face
- Diagnósticos por matriz: fichero `compression.json` del propio repositorio de Hugging Face
- No se han encontrado papers, blogs, repositorios externos ni demos adicionales en la información proporcionada.
