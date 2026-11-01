# Jeesup/svd-safety-shifted-l2_utility_remove0.5_rho0.003

## Resumen

El modelo `Jeesup/svd-safety-shifted-l2_utility_remove0.5_rho0.003` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`, desarrollado por el usuario Jeesup. No se trata de un modelo nuevo entrenado desde cero, sino de una compresión por descomposición en valores singulares (SVD) con un desplazamiento deliberado del objetivo hacia la seguridad, manteniendo la utilidad general. El autor lo describe como un "piloto de SVD con desplazamiento de seguridad" (*safety-shifted SVD pilot*), con una eliminación nominal del 50 % de los parámetros de proyección y una fracción realizada de parámetros factoriales de 0,519340 sobre el modelo completo.

La relevancia del checkpoint es metodológica: explora si es posible reducir el tamaño de un modelo chat de 7 000 millones de parámetros mediante SVD de bajo rango sin fine-tuning de recuperación, y qué efecto tiene ese proceso sobre las métricas de seguridad (tasa de éxito de ataques, ASR) y de utilidad (perplejidad en WikiText-2). El autor publica los pesos ya plegados en matrices densas de Hugging Face para facilitar la evaluación, pero advierte que el presupuesto de rango describe la representación de bajo rango subyacente y que esta subida no proporciona inferencia factorizada ni demuestra una aceleración.

El modelo tiene 6 738 415 616 parámetros totales según el archivo safetensors y un repositorio de 13,5 GB. La licencia es `llama2`, heredada del modelo base, y los pesos están en formato `safetensors`. No se dispone de información sobre pipeline, idiomas soportados ni resultados de benchmarks estándar en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), pesos plegados en matrices densas tras compresión SVD |
| Parametros totales | 6 738 415 616 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del base Llama-2-7b-chat-hf: 4 096 tokens, no confirmado en la información) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | llama2 |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Eliminacion nominal de parametros | 50 % |
| Fraccion realizada de parametros factoriales | 0,519340 |
| Shift relativo rho | 0,003 |
| Lambda global | 0,06354673882460284 |
| Ridge | 1e-05 |
| Fine-tuning de recuperacion | No |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat: un transformer decoder-only con atención causal estándar, normalización RMSNorm y activaciones SwiGLU. Sobre este modelo, el autor aplica una compresión por SVD de bajo rango con un objetivo mixto que combina momentos de entrada de WikiText (utilidad) con 0,1 veces los momentos de indicaciones dañinas y respuestas seguras (seguridad). El resultado es un checkpoint con las matrices densas plegadas, es decir, los factores de bajo rango se han multiplicado de vuelta a matrices densas para facilitar la evaluación con Hugging Face.

El proceso de calibración usa 128 ejemplos dañinos y 40 benignos para el cálculo del gradiente, y 32 y 12 ejemplos separados para la validación de entropía cruzada (CE). El autor advierte que el corpus de métrica mixta es más amplio, por lo que estos son ejemplos retenidos del gradiente, no ejemplos de calibración completamente no vistos. No hay fine-tuning de recuperación tras la compresión. La innovación técnica principal es el desplazamiento controlado del objetivo hacia la seguridad mediante el parámetro rho (0,003 en este checkpoint), que pondera igualitariamente la CE de respuestas seguras ante indicaciones dañinas y la CE de respuestas útiles ante indicaciones benignas.

El autor califica explícitamente este trabajo como "un piloto unilateral, no un SVD completo con conciencia de Fisher" (*one-sided pilot, not full Fisher-aware SVD*). Los archivos de evaluación incluyen perplejidad en WikiText-2, generaciones en AdvBench con juicios de HarmBench, y XSTest más las primeras 500 indicaciones de OR-Bench juzgadas por WildGuard.

## Capacidades

- Generación de texto conversacional: hereda las capacidades de chat de Llama-2-7b-chat, con formato de plantilla de chat propio.
- Razonamiento y respuesta a indicaciones: el checkpoint está orientado a evaluar el equilibrio entre utilidad y seguridad, no a tareas específicas de razonamiento avanzado.
- Evaluación de seguridad: el modelo está diseñado como artefacto de investigación para medir tasa de éxito de ataques (ASR) frente a indicaciones dañinas.
- Evaluación de utilidad: permite medir perplejidad en WikiText-2 y coherencia de generaciones.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de pensamiento (*thinking mode*) en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada; se heredan las del base Llama-2, no confirmadas.

## Casos de uso

- Investigación sobre compresión de modelos: el checkpoint sirve para estudiar cómo afecta la eliminación del 50 % de parámetros de proyección vía SVD a la perplejidad y a la coherencia de un modelo chat de 7 000 millones de parámetros, sin recuperación posterior.
- Evaluación de seguridad comparada: permite medir la tasa de éxito de ataques (ASR) en AdvBench con juicios de HarmBench y compararla con el modelo base y con otros checkpoints del mismo barrido de rho.
- Análisis de equilibrio utilidad-seguridad: el objetivo mixto con peso 0,1 sobre momentos de seguridad permite estudiar empíricamente la frontera de Pareto entre perplejidad en WikiText-2 y robustez frente a indicaciones dañinas.
- Validación de metodologías SVD: investigadores que desarrollan técnicas de compresión pueden usar este checkpoint como referencia de un piloto unilateral y compararlo con implementaciones completas con conciencia de Fisher.
- Evaluación con XSTest y OR-Bench: el modelo incluye resultados para XSTest y las primeras 500 indicaciones de OR-Bench juzgadas por WildGuard, útiles para estudiar sobre-rechazo y comportamiento en indicaciones ambiguas.
- Reproducibilidad de experimentos: los archivos bajo `experiment/` y `compression.json` permiten replicar ajustes exactos, pérdidas de validación y diagnósticos por matriz, lo que facilita la verificación independiente de resultados.
- Estudio de despliegue con pesos plegados: al estar en formato denso estándar de Hugging Face, puede cargarse con las mismas herramientas que Llama-2-7b-chat para comparar latencia y uso de memoria, aunque sin la ventaja de la representación factorizada.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. El autor menciona que los archivos de evaluación contienen perplejidad en WikiText-2, generaciones en AdvBench con juicios de HarmBench, y XSTest más las primeras 500 indicaciones de OR-Bench juzgadas por WildGuard, pero no se proporcionan los valores en la información suministrada. El autor advierte además que estas mediciones piloto no establecen una garantía de seguridad y que deben inspeccionarse la coherencia y las fracciones puntuadas junto con el ASR.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 16-24 GB de VRAM.
- VRAM estimada en cuantización de 8 bits: alrededor de 7-8 GB de pesos, con overhead adicional; en 4 bits, alrededor de 4-5 GB.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para fp16; RTX 3090 (24 GB) también es viable en fp16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) con cuantización, y en GPUs de 12 GB solo con cuantización agresiva (4 bits) y contexto reducido.
- Opciones de despliegue: el formato denso safetensors es compatible con vLLM, TGI, llama.cpp (previa conversión a GGUF), Ollama (previa conversión) y transformers de Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada. El autor advierte explícitamente que esta subida no proporciona inferencia factorizada ni establece una aceleración respecto al modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Jeesup/svd-safety-shifted-l2_utility_remove0.5_rho0.003 | 6 738 415 616 | No disponible | llama2 | Hugging Face (14 descargas) | Checkpoint de investigación con SVD y desplazamiento de seguridad |
| meta-llama/Llama-2-7b-chat-hf | 6 738 415 616 | 4 096 tokens | llama2 | Hugging Face (ampliamente disponible) | Modelo base sin compresión |
| meta-llama/Llama-2-7b-hf | 6 738 415 616 | 4 096 tokens | llama2 | Hugging Face | Variante base sin ajuste de chat |
| Mistral-7B-Instruct-v0.2 | 7 242 000 000 aprox. | 32 768 tokens | Apache 2.0 | Hugging Face | Alternativa de 7B con contexto mayor y licencia permisiva |

La comparación directa con Mistral-7B-Instruct es pertinente por tamaño y categoría (modelo chat de 7B), aunque la licencia y el contexto difieren sustancialmente. No se dispone de datos de rendimiento de este checkpoint para establecer comparaciones cuantitativas con las alternativas.

## Limitaciones y advertencias

- El autor advierte explícitamente que este es un piloto unilateral y no un SVD completo con conciencia de Fisher, por lo que los resultados no deben generalizarse a implementaciones más sofisticadas.
- Las mediciones piloto no establecen una garantía de seguridad; deben interpretarse junto con la coherencia y las fracciones puntuadas, no solo con el ASR.
- Los ejemplos de validación de entropía cruzada son retenidos del gradiente, pero el corpus de métrica mixta es más amplio, por lo que no son ejemplos de calibración completamente no vistos.
- Los pesos están plegados en matrices densas; esta subida no proporciona inferencia factorizada ni demuestra una aceleración real frente al modelo base.
- Riesgo de alucinación: inherente a Llama-2-7b-chat y no cuantificado en la información disponible.
- Sesgos conocidos: no documentados específicamente para este checkpoint; se heredan los del modelo base Llama-2, no detallados en la información.
- Limitaciones de idioma: no disponibles; se desconoce si la compresión afecta de forma desigual a idiomas distintos del inglés.
- Restricciones de licencia: la licencia `llama2` impone condiciones de uso comercial y de redistribución que deben revisarse antes de cualquier despliegue en producción.
- El checkpoint tiene 14 descargas y 0 likes, lo que sugiere una validación comunitaria muy limitada; no debe tratarse como un artefacto listo para producción.
- No se documentan capacidades de tool calling, agentes, visión o audio, por lo que no debe asumirse su disponibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-shifted-l2_utility_remove0.5_rho0.003
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Repositorio de Llama 2 (Meta): https://github.com/facebookresearch/llama
- Paper de Llama 2: https://arxiv.org/abs/2307.09288
