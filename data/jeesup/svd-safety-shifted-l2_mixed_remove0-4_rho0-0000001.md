# Jeesup/svd-safety-shifted-l2_mixed_remove0.4_rho0.0000001

## Resumen

El modelo `Jeesup/svd-safety-shifted-l2_mixed_remove0.4_rho0.0000001` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf` mediante compresión por descomposición en valores singulares (SVD) con un sesgo explícito hacia la seguridad. Lo publica el usuario Jeesup como parte de un piloto sobre compresión de modelos y evaluación de seguridad, y no como un modelo listo para producción. El objetivo del experimento es medir cómo afecta la eliminación de componentes de bajo rango en las matrices de proyección a las capacidades del modelo y, en particular, a su comportamiento frente a prompts dañinos.

El checkpoint conserva la arquitectura transformer densa de Llama 2 7B chat, con 6.738.415.616 parámetros reales almacenados en safetensors, pero con un presupuesto de rango reducido: se elimina nominalmente el 40 % de los parámetros de proyección, lo que se traduce en una fracción realizada de parámetros factoriales de 0,615424 sobre el modelo completo. Los pesos se han replegado a matrices densas de Hugging Face para facilitar la evaluación, de modo que este repositorio no ofrece inferencia factorizada ni demuestra ninguna aceleración.

La relevancia del modelo es metodológica: introduce una métrica mixta que combina momentos de entrada de WikiText con momentos de pares prompt dañino/respuesta segura, y aplica un desplazamiento relativo `rho = 1e-07` sobre la proyección SVD. Es un artefacto para estudiar la relación entre compresión, coherencia y alineación de seguridad, no una alternativa práctica a Llama 2 chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Llama 2: 4.096 tokens, segun la arquitectura base) |
| Tipos de cuantizacion | No disponible; el repo solo publica safetensors en precision completa |
| Idiomas soportados | No disponible (el modelo base Llama 2 esta entrenado principalmente en ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors (matrices densas replegadas) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B chat: un transformer decoder-only con atención multi-cabeza, normalización RMSNorm, activación SwiGLU y embeddings rotatorios. Sobre esa base, el autor aplica una compresión SVD con una métrica de entrada mixta: momentos de segundo orden calculados sobre WikiText combinados con 0,1 veces los momentos de pares prompt dañino/respuesta segura. Ambos conjuntos de textos de referencia se renderizan con sus propias plantillas de chat y se perfilan con sus propios pesos densos. El objetivo pondera por igual la entropía cruzada de respuesta segura ante prompt dañino y la de respuesta útil ante prompt benigno.

El gradiente se estima con 128 ejemplos dañinos y 40 benignos, y la validación de entropía cruzada usa 32 y 12 ejemplos separados respectivamente; el autor advierte que, al ser el corpus de la métrica mixta más amplio, estos son ejemplos retenidos del gradiente, no ejemplos de calibración completamente no vistos. Se elimina nominalmente el 40 % de los parámetros de proyección, con un desplazamiento relativo `rho = 1e-07`, un lambda global de 3,375972210921948e-06 y un ridge de 1e-05. No hay fine-tuning de recuperación posterior. El autor califica explícitamente el método como un piloto de una sola dirección, no un SVD completo con información de Fisher.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Llama 2 7B chat.
- Razonamiento de propósito general y respuesta a instrucciones, sujeto a la degradación introducida por la compresión.
- No se documenta soporte específico de tool calling ni function calling más allá de lo que ofrece el modelo base.
- No se documenta soporte de agentes ni razonamiento multi-paso más allá de lo que ofrece el modelo base.
- Capacidades multilingües limitadas, las del modelo base, no verificadas en este checkpoint.
- No dispone de visión, audio ni modo de razonamiento extendido.
- Su capacidad diferencial es servir como artefacto de evaluación de seguridad bajo compresión, con ficheros de evaluación de AdvBench, HarmBench, XSTest y OR-Bench incluidos en el repositorio.

## Casos de uso

- Investigación sobre compresión de modelos: permite estudiar cómo la eliminación de componentes de bajo rango afecta a la perplejidad en WikiText-2 y a la coherencia de las generaciones, comparando con el checkpoint original de Llama 2 7B chat.
- Evaluación de alineación bajo compresión: los ficheros de AdvBench y HarmBench permiten medir la tasa de éxito de ataques (ASR) antes y después de la compresión, junto con las fracciones evaluadas y la coherencia de las respuestas.
- Análisis de calibración con métricas mixtas: sirve para reproducir y auditar la metodología de momentos mixtos (WikiText más pares dañino/seguro) descrita en la model card y en `experiment/`.
- Estudio de robustez frente a jailbreaks: los prompts de XSTest y los primeros 500 de OR-Bench, juzgados con WildGuard, permiten analizar si la compresión altera la tasa de rechazo de peticiones dañinas.
- Reproducibilidad de experimentos de SVD: el repositorio incluye `compression.json` con diagnósticos por matriz, útil para replicar el pipeline de compresión y comparar variantes de `rho` y lambda.
- Docencia y formación: como ejemplo didáctico de cómo se documenta un checkpoint de investigación con sus métricas de validación, límites y advertencias de uso.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card indica que el repositorio contiene ficheros de evaluación con perplejidad en WikiText-2, generaciones de AdvBench con juicios de HarmBench, XSTest y los primeros 500 prompts de OR-Bench juzgados por WildGuard, pero no se incluyen los valores en el texto proporcionado. El autor advierte que estas mediciones piloto no establecen ninguna garantía de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 15-16 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: aproximadamente 7-8 GB; en 4 bits, aproximadamente 4-5 GB, aunque el repositorio no publica versiones cuantizadas y habría que generarlas a partir de los safetensors.
- GPU recomendadas: A100 40 GB u 80 GB, H100, L40S o RTX A6000 para evaluación en precisión completa con lotes grandes.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en fp16 con contexto limitado, y en RTX 3090, 4080 o 4070 Ti Super tras cuantización a 8 o 4 bits.
- Opciones de despliegue: al ser pesos densos en formato Hugging Face, es compatible con `transformers`, vLLM, TGI y llama.cpp/Ollama tras conversión a GGUF. No se documenta ninguna ruta de inferencia factorizada que aproveche el rango reducido.
- Latencia y throughput: no disponibles; el autor indica que la subida no proporciona inferencia factorizada ni establece una aceleración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Jeesup/svd-safety-shifted-l2_mixed_remove0.4_rho0.0000001 | 6.738.415.616 | No disponible (base Llama 2: 4.096) | llama2 | Hugging Face, 12 descargas | Checkpoint de investigación con compresión SVD y sesgo de seguridad |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 | 4.096 | llama2 | Hugging Face, ampliamente usado | Modelo base sin compresión; referencia directa |
| meta-llama/Llama-3.1-8B-Instruct | 8.030.000.000 (aprox.) | 131.072 | llama3.1 | Hugging Face | Alternativa moderna con contexto mucho mayor y mejor rendimiento general |
| Mistral-7B-Instruct-v0.3 | 7.250.000.000 (aprox.) | 32.768 | Apache 2.0 | Hugging Face | Alternativa de licencia permisiva y contexto ampliado |

La comparación de rendimiento con estas alternativas no está disponible en la información proporcionada, ya que el checkpoint no publica métricas numéricas en la model card.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo listo para producción; el propio autor lo describe como un piloto de una sola dirección.
- La compresión elimina el 40 % nominal de los parámetros de proyección, lo que puede degradar la coherencia y la calidad de las respuestas; el autor recomienda inspeccionar la coherencia junto con la tasa de éxito de ataques.
- Las mediciones de seguridad incluidas no constituyen una garantía de seguridad; pueden existir respuestas dañinas no detectadas por los jueces empleados.
- Riesgo de alucinación inherente al modelo base Llama 2 7B chat, potencialmente agravado por la compresión.
- Idiomas soportados no documentados; se espera un comportamiento principalmente en inglés, con rendimiento limitado en castellano.
- La licencia llama2 impone restricciones de uso comercial y obligaciones de atribución; es necesario revisar los términos de la Llama 2 Community License antes de cualquier despliegue.
- No se ofrece inferencia factorizada ni aceleración demostrada; el uso de los pesos densos replegados no aporta ventajas de eficiencia frente al modelo original.
- El sesgo hacia respuestas seguras puede incrementar los rechazos excesivos en prompts benignos, un efecto que conviene medir con XSTest y OR-Bench.
- El repositorio tiene un uso muy bajo (12 descargas, 0 likes) y no ha pasado por una revisión comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-shifted-l2_mixed_remove0.4_rho0.0000001
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
