# Jeesup/svd-safety-shifted-l2_mixed_remove0.5_rho0.01

## Resumen

El modelo `Jeesup/svd-safety-shifted-l2_mixed_remove0.5_rho0.01` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`, publicado por el usuario Jeesup en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una compresión por descomposición en valores singulares (SVD) del modelo base original, en la que se elimina nominalmente el 50 % de los parámetros de proyección (fracción realizada de parámetros factoriales: 0,519340) sin fine-tuning de recuperación posterior. El resultado es un modelo denso de 6.738.415.616 parámetros en formato safetensors.

El interés del checkpoint es metodológico: forma parte de un estudio piloto sobre cómo la compresión afecta a la seguridad del modelo. El autor aplica una métrica mixta que combina momentos de entrada de WikiText con 0,1 veces los momentos de pares prompt-dañino/respuesta-segura, y desplaza el objetivo con un parámetro rho de 0,01 y un lambda global de 0,3375972210921948. La finalidad declarada es evaluar si una compresión agresiva degrada o desplaza las propiedades de seguridad del modelo original.

Se trata, por tanto, de un artefacto de investigación, no de un modelo listo para producción: el propio autor advierte que es un piloto unilateral y no un SVD completo consciente de Fisher, que los pesos están plegados en matrices densas para facilitar la evaluación y que el upload no proporciona inferencia factorizada ni demuestra ninguna aceleración real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Llama 2 7B chat) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Llama 2 usa 4096 tokens) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | No disponible |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors (matrices densas plegadas) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B chat: un transformer decoder-only con atención causal estándar. Sobre ese modelo base se aplica una compresión SVD: se calcula una descomposición de bajo rango de las matrices de proyección y se elimina el 50 % nominal de los parámetros de proyección, quedando una fracción realizada de parámetros factoriales de 0,519340 sobre el total del modelo. No hay fine-tuning de recuperación tras la compresión.

El proceso de compresión usa una métrica de entrada mixta: momentos de entrada de WikiText combinados con 0,1 veces los momentos de pares de prompt dañino y respuesta segura. Ambos conjuntos se renderizan con sus propias plantillas de chat y se perfilan con sus propios pesos densos. El objetivo pondera por igual la entropía cruzada (CE) de respuestas seguras ante prompts dañinos y la CE de respuestas útiles ante prompts benignos. El gradiente se calcula con 128 ejemplos dañinos y 40 benignos, y la validación CE con 32 y 12 ejemplos separados respectivamente; el autor advierte que, al ser el corpus de métrica mixta más amplio, estos ejemplos están retenidos del gradiente pero no son del todo invisibles a la calibración. Se usa un ridge de 1e-05 y un desplazamiento relativo rho de 0,01. El autor califica explícitamente el método como un piloto unilateral, no un SVD completo consciente de Fisher.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Llama 2 7B chat.
- Razonamiento y respuesta a instrucciones en formato chat, sujeto a la degradación introducida por la compresión.
- Evaluación de seguridad: el checkpoint incluye artefactos para medir WikiText-2 PPL, generaciones en AdvBench con juicios HarmBench, y XSTest más los primeros 500 prompts de OR-Bench juzgados con WildGuard.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre compresión y seguridad: el checkpoint sirve para estudiar cómo la eliminación del 50 % de parámetros de proyección afecta a la tasa de respuestas dañinas (ASR) medida con AdvBench y HarmBench, comparando contra el modelo base sin comprimir.
- Análisis de métricas de calibración: permite reproducir el pipeline de métrica mixta (momentos de WikiText más pares dañino/seguro) y evaluar su efecto sobre la coherencia y la seguridad del modelo resultante.
- Evaluación de robustez con XSTest y OR-Bench: los artefactos incluidos permiten medir el comportamiento del modelo ante prompts de seguridad y prompts benignos, inspeccionando tanto la coherencia como las fracciones puntuadas.
- Estudio de degradación por compresión: al no haber fine-tuning de recuperación, es un punto de referencia útil para cuantificar la pérdida de calidad (PPL en WikiText-2) atribuible únicamente a la eliminación de rango.
- Reproducibilidad de experimentos: el directorio `experiment/` contiene los ajustes exactos, las pérdidas de validación y el código fuente, y `compression.json` los diagnósticos por matriz, lo que facilita replicar o extender el estudio.
- Comparación de metodologías SVD: sirve como caso piloto unilateral frente a implementaciones completas conscientes de Fisher, para medir la diferencia entre ambos enfoques en términos de seguridad y perplejidad.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. El autor indica que los archivos de evaluación contienen WikiText-2 PPL, generaciones de AdvBench con juicios HarmBench, y XSTest más los primeros 500 prompts de OR-Bench juzgados por WildGuard, pero no se proporcionan los valores en la información suministrada. El autor advierte además que estas mediciones piloto no establecen ninguna garantía de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 6.738.415.616 parámetros en safetensors, en fp16 requiere aproximadamente 13,5 GB de VRAM solo para los pesos, más overhead de activaciones y caché KV.
- En cuantización de 8 bits cabría en GPUs de 24 GB (RTX 3090, RTX 4090); en 4 bits podría caber en GPUs de 16 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas para fp16: A100 40/80 GB, H100, o GPUs consumer de 24 GB con margen ajustado.
- Opciones de despliegue: al ser un checkpoint denso en safetensors con arquitectura Llama 2, es compatible con frameworks estándar como vLLM, TGI, llama.cpp (previa conversión a GGUF) u Ollama, aunque el autor no documenta ninguna integración específica.
- Latencia y throughput: no disponibles. El autor señala explícitamente que el upload no proporciona inferencia factorizada ni establece ninguna aceleración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Jeesup/svd-safety-shifted-l2_mixed_remove0.5_rho0.01 | 6.738.415.616 | No disponible | llama2 | Compresión SVD al 50 %, sin recuperación, checkpoint de investigación |
| meta-llama/Llama-2-7b-chat-hf | ~6.740 millones | 4096 | llama2 | Modelo base sin comprimir, referencia de calidad y seguridad |
| Alternativas de compresión SVD de Llama 2 | No disponible | No disponible | No disponible | No se dispone de datos de otros checkpoints comparables en la información proporcionada |

## Limitaciones y advertencias

- Checkpoint de investigación: el autor lo describe como un piloto unilateral, no un SVD completo consciente de Fisher, por lo que los resultados no deben generalizarse.
- Sin fine-tuning de recuperación: la eliminación del 50 % de parámetros de proyección degrada previsiblemente la coherencia y la calidad del texto; el autor recomienda inspeccionar la coherencia y las fracciones puntuadas junto con el ASR.
- Sin garantía de seguridad: las mediciones piloto no establecen ninguna garantía de seguridad; el desplazamiento del objetivo hacia respuestas seguras no implica un modelo seguro en producción.
- Sesgos: no documentados en la información proporcionada, pero heredados del modelo base Llama 2 chat.
- Riesgo de alucinación: no cuantificado; la compresión agresiva sin recuperación puede incrementarlo.
- Limitaciones de contexto e idioma: no disponibles en la información proporcionada.
- Licencia: Llama 2 Community License, con restricciones de uso comercial y requisitos de atribución aplicables al modelo base; debe revisarse antes de cualquier uso productivo.
- Pesos plegados en matrices densas: el upload no ofrece inferencia factorizada ni demuestra aceleración alguna, por lo que no debe esperarse una ventaja de eficiencia frente al modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-shifted-l2_mixed_remove0.5_rho0.01
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
