# Jeesup/svd-safety-shifted-l3_utility_remove0.4_rho0.003

## Resumen

El modelo `Jeesup/svd-safety-shifted-l3_utility_remove0.4_rho0.003` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct` mediante una técnica de compresión basada en descomposición en valores singulares (SVD) con un sesgo explícito hacia la utilidad. Lo publica el usuario Jeesup como parte de un piloto de evaluación de seguridad. No es un modelo pensado para producción: es un artefacto experimental para estudiar cómo afecta la compresión de bajo rango a las propiedades de seguridad de un LLM.

El punto de partida es Llama 3 8B Instruct, un transformer denso de 8.030.261.248 parámetros. Sobre él se aplica una proyección SVD con eliminación nominal del 40% de los parámetros de proyección (fracción realizada de parámetros de factor sobre el modelo completo: 0,652173), sin fine-tuning de recuperación posterior. El objetivo de la compresión pondera por igual la entropía cruzada de respuestas seguras ante prompts dañinos y la de respuestas útiles ante prompts benignos, con un desplazamiento relativo `rho = 0,003` y un `lambda` global de 0,004130161990254748.

Su relevancia es metodológica: permite medir el efecto de la compresión sobre la tasa de éxito de ataques (ASR) y sobre la perplejidad en WikiText-2, y comparar con el modelo base. El autor advierte explícitamente de que se trata de un piloto unilateral, no de un SVD completo con conciencia de Fisher, y de que las métricas no constituyen una garantía de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3), pesos plegados en matrices densas de Hugging Face |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 3 8B Instruct, no especificada en la model card) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en precisión original) |
| Idiomas soportados | no disponible |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3 8B Instruct: un transformer denso con atención causal estándar, sin mezcla de expertos ni componentes de estado recurrente. Sobre ese modelo se aplica una compresión SVD que elimina un 40% nominal de los parámetros de proyección, dando lugar a una representación de bajo rango que después se pliega en matrices densas para facilitar la evaluación. El checkpoint subido no ofrece inferencia factorizada ni demuestra una aceleración real; la fracción de parámetros de factor realizada sobre el modelo completo es de 0,652173.

El entrenamiento no incluye fine-tuning de recuperación. La calibración de la compresión usa momentos de entrada de WikiText combinados con 0,1 veces los momentos de prompts dañinos y respuestas seguras. Ambas familias emplean los mismos textos de respuesta de referencia (incluidas respuestas del profesor Llama-2), renderizados con sus propias plantillas de chat y perfilados con sus propios pesos densos. El gradiente se calcula con 128 ejemplos dañinos y 40 benignos; la validación de entropía cruzada usa 32 y 12 ejemplos separados, respectivamente. El autor subraya que, al ser el corpus de métrica mixta más amplio, estos son ejemplos retenidos del gradiente, no ejemplos de calibración completamente no vistos. La técnica es un piloto unilateral, no un SVD completo con conciencia de Fisher.

## Capacidades

- Generación de texto y razonamiento heredados de Llama 3 8B Instruct, sujetos a la degradación introducida por la compresión SVD.
- Seguimiento de instrucciones en formato chat, ya que el modelo base es la variante Instruct.
- Evaluación de seguridad: el checkpoint incluye artefactos para medir ASR en AdvBench/HarmBench y comportamiento en XSTest y OR-Bench.
- Evaluación de calidad lingüística mediante perplejidad en WikiText-2.
- No se documentan capacidades de tool calling, function calling, agentes o razonamiento multi-paso específicas para este checkpoint.
- No se documentan capacidades multimodales, de audio ni modo "thinking".
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre compresión y seguridad: usar el checkpoint junto al modelo base para medir cómo varía el ASR en AdvBench/HarmBench al eliminar un 40% nominal de parámetros de proyección, manteniendo fijo el resto del pipeline de evaluación.
- Análisis de la relación utilidad-seguridad: comparar la perplejidad en WikiText-2 con las tasas de rechazo en XSTest y OR-Bench para estudiar si la compresión sesgada hacia utilidad degrada la alineación de seguridad.
- Reproducibilidad de experimentos SVD: el directorio `experiment/` contiene ajustes exactos, pérdidas de validación y código fuente, lo que permite replicar el piloto y contrastarlo con variantes de `rho` y `lambda`.
- Diagnóstico por matriz: `compression.json` ofrece diagnósticos por matriz que permiten identificar qué capas son más sensibles a la eliminación de componentes singulares.
- Estudio de calibración con métricas mixtas: sirve para evaluar el efecto de mezclar momentos de WikiText con momentos de prompts dañinos/respuestas seguras en la calidad final del modelo comprimido.
- Docencia y divulgación: ejemplo concreto y reproducible de cómo un checkpoint comprimido puede conservar coherencia lingüística mientras altera propiedades de seguridad, útil en cursos de alineación y eficiencia de modelos.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card indica que los archivos de evaluación contienen perplejidad en WikiText-2, generaciones en AdvBench con juicios de HarmBench, y XSTest más los primeros 500 prompts de OR-Bench juzgados por WildGuard, pero no se incluyen los valores en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 18-24 GB para secuencias moderadas.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB de pesos; en 4 bits, en torno a 4-5 GB, aunque el repo no publica versiones cuantizadas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para FP16; RTX 3090/4090 o GPUs de 16 GB o más para cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090 y, con cuantización agresiva, en GPUs de 12-16 GB.
- Opciones de despliegue: al ser pesos densos en safetensors con arquitectura Llama 3, es compatible con vLLM, TGI, llama.cpp (previa conversión a GGUF), Ollama (previa conversión) y transformers.
- Latencia y throughput: no disponibles; el autor indica explícitamente que este upload no proporciona inferencia factorizada ni establece una aceleración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Jeesup/svd-safety-shifted-l3_utility_remove0.4_rho0.003 | 8.030.261.248 | no disponible | llama3 | Hugging Face, 16 descargas | Checkpoint de investigación con compresión SVD al 40% nominal y sin recuperación |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030.261.248 | 8.192 tokens (según la model card oficial de Llama 3) | llama3 | Hugging Face, ampliamente disponible | Modelo base sin comprimir; referencia para medir la degradación |
| meta-llama/Meta-Llama-3-8B | 8.030.261.248 | 8.192 tokens (según la model card oficial de Llama 3) | llama3 | Hugging Face, ampliamente disponible | Variante base sin instrucciones; útil como control de capacidades |
| Modelos comprimidos SVD de la misma familia | no disponible | no disponible | no disponible | no disponible | No se dispone de comparativas publicadas en la información proporcionada |

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo listo para producción; el autor lo describe como un piloto unilateral.
- La compresión elimina un 40% nominal de parámetros de proyección sin fine-tuning de recuperación, lo que puede degradar coherencia, razonamiento y seguimiento de instrucciones.
- Los pesos se han plegado en matrices densas; no se ofrece inferencia factorizada ni se demuestra una aceleración real.
- Las métricas de seguridad incluidas (AdvBench/HarmBench, XSTest, OR-Bench con WildGuard) son medidas piloto y no constituyen una garantía de seguridad.
- La validación usa ejemplos retenidos del gradiente, no ejemplos de calibración completamente no vistos, lo que puede inflar ligeramente las métricas.
- El objetivo pondera por igual entropía cruzada de respuestas seguras ante prompts dañinos y de respuestas útiles ante prompts benignos; este sesgo hacia utilidad puede reducir la tasa de rechazo ante entradas dañinas.
- Riesgo de alucinación y sesgos: no documentados específicamente para este checkpoint; hereda los del modelo base Llama 3 8B Instruct.
- Idiomas soportados: no disponibles; se desconoce si la compresión afecta de forma desigual a distintos idiomas.
- Restricciones de licencia: sujeto a la Llama 3 Community License, que impone condiciones de uso comercial, atribución y restricciones de redistribución; conviene revisar los términos antes de cualquier uso.
- No se publican versiones cuantizadas (GGUF, AWQ, GPTQ), por lo que el despliegue eficiente requiere conversión propia.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-shifted-l3_utility_remove0.4_rho0.003
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Llama 3: https://llama.meta.com/llama3/license/
- No se han encontrado en la información proporcionada papers, blogs, repositorios o demos adicionales asociados a este checkpoint.
