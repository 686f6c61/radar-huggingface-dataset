# Jeesup/svd-safety-shifted-l2_utility_remove0.4_rho0.00001

## Resumen

`Jeesup/svd-safety-shifted-l2_utility_remove0.4_rho0.00001` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf` mediante compresión por descomposición en valores singulares (SVD) con un sesgo explícito hacia la utilidad. No es un modelo nuevo entrenado desde cero, sino una versión comprimida del Llama 2 Chat de 7B en la que se elimina un 40 % nominal de los parámetros de proyección, con una fracción real de parámetros factoriales del 0,615424 sobre el modelo completo. El autor, Jeesup, lo publica como piloto de un estudio sobre cómo la compresión afecta a las propiedades de seguridad de un modelo alineado.

El interés técnico reside en la metodología: la SVD se guía por un objetivo mixto que combina momentos de WikiText-2 (entrada) con momentos de pares prompt-dañino/respuesta-segura (salida), ponderando por igual la entropía cruzada de respuestas seguras ante prompts dañinos y la de respuestas útiles ante prompts benignos. El resultado es un modelo que, según el autor, preserva utilidad a costa de un desplazamiento en el comportamiento de seguridad, y que se publica con artefactos de evaluación (perplejidad en WikiText-2, generaciones en AdvBench con juicios HarmBench, XSTest y OR-Bench juzgado por WildGuard) para que otros investigadores puedan reproducir y auditar el fenómeno.

Es relevante ahora porque la compresión agresiva de modelos alineados es una práctica habitual en despliegue, y este checkpoint documenta de forma explícita el compromiso entre eficiencia y robustez frente a jailbreaks. No obstante, es un artefacto de investigación: los pesos se publican como matrices densas plegadas, sin inferencia factorizada ni speedup demostrado, y el propio autor advierte que las mediciones no constituyen una garantía de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), pesos densos plegados tras compresión SVD |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Llama 2, no confirmada por el autor) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precisión original) |
| Idiomas soportados | no disponible |
| Licencia | llama2 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B Chat: un transformer decoder-only con atención causal, normalización RMSNorm y activaciones SwiGLU, sobre el que se aplica una compresión SVD guiada por métricas. El autor elimina un 40 % nominal de los parámetros de proyección (fracción real de parámetros factoriales de 0,615424 sobre el modelo completo) mediante una descomposición de bajo rango con regularización ridge de 1e-05 y un desplazamiento relativo rho de 1e-05. El presupuesto de rango describe la representación de bajo rango subyacente, pero los pesos subidos son matrices densas plegadas para facilitar la evaluación, de modo que este upload no proporciona inferencia factorizada ni establece una aceleración.

El punto diferencial es el objetivo de la SVD: en lugar de minimizar solo el error de reconstrucción sobre texto genérico, se construye una métrica mixta con momentos de entrada de WikiText-2 más 0,1 veces los momentos de pares prompt-dañino/respuesta-segura. Ambas familias usan los mismos textos de respuesta de referencia (incluidas respuestas del profesor Llama-2), renderizados con sus propias plantillas de chat y perfilados con sus propios pesos densos. El gradiente se calcula con 128 ejemplos dañinos y 40 benignos, y la validación de entropía cruzada usa 32 y 12 ejemplos separados respectivamente; al ser el corpus de métrica mixta más amplio, estos son ejemplos retenidos del gradiente, no ejemplos de calibración completamente no vistos. No hay fine-tuning de recuperación posterior a la compresión. El autor lo describe explícitamente como un piloto unilateral, no como una SVD completa con información de Fisher.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Llama 2 7B Chat.
- Razonamiento y respuesta a instrucciones en formato chat, con la plantilla de Llama 2.
- Capacidad multilingüe no documentada por el autor; se desconoce el impacto de la compresión sobre idiomas distintos del inglés.
- No se documenta soporte de tool calling ni function calling en la model card.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No dispone de visión, audio ni modo de pensamiento (thinking mode).
- El artefacto incluye ficheros de evaluación con generaciones en AdvBench, juicios HarmBench, XSTest y los primeros 500 prompts de OR-Bench juzgados por WildGuard, útiles para auditar el comportamiento de seguridad.

## Casos de uso

- Investigación sobre compresión y seguridad: el checkpoint sirve como punto de comparación controlado para estudiar cómo la eliminación de componentes de bajo rango afecta a la tasa de éxito de ataques (ASR) frente a la perplejidad, usando los artefactos de evaluación incluidos.
- Auditoría de jailbreaks: los ficheros con generaciones en AdvBench y juicios HarmBench permiten analizar qué tipos de prompts dañinos superan al modelo comprimido y compararlos con el Llama 2 Chat original.
- Estudio de calibración de métricas: la combinación de momentos de WikiText-2 y de pares dañino/seguro con ponderación 0,1 es un caso reproducible para evaluar si las métricas de utilidad predicen la degradación de seguridad.
- Evaluación de sesgos de sobre-rechazo: XSTest y OR-Bench (juzgado por WildGuard) permiten medir si la compresión altera la tasa de rechazos ante prompts benignos, un eje distinto del ASR.
- Reproducción de pipelines SVD: el directorio `experiment/` y el fichero `compression.json` documentan ajustes exactos, pérdidas de validación y diagnósticos por matriz, lo que facilita reimplementar el método sobre otros modelos alineados.
- Docencia y formación: como ejemplo didáctico de cómo una técnica de eficiencia puede erosionar propiedades de alineamiento y de por qué la evaluación de seguridad debe acompañar a cualquier compresión.

## Benchmarks y rendimiento

El autor no publica una tabla numérica de resultados en la información disponible; solo indica qué evaluaciones se incluyen en los ficheros del repositorio. No se han publicado resultados de benchmarks en la información disponible.

Los artefactos de evaluación declarados son:

| Evaluación | Métrica | Resultado numérico |
|---|---|---|
| WikiText-2 | Perplejidad (PPL) | no disponible en la información proporcionada |
| AdvBench | Generaciones y juicios HarmBench (ASR) | no disponible en la información proporcionada |
| XSTest | Comportamiento ante prompts benignos | no disponible en la información proporcionada |
| OR-Bench (primeros 500 prompts) | Juicio WildGuard | no disponible en la información proporcionada |

El autor recomienda inspeccionar la coherencia y las fracciones puntuadas junto al ASR, y advierte que estas mediciones piloto no establecen una garantía de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 16 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 7 GB de pesos; en 4 bits, alrededor de 3,5-4 GB, aunque el autor no publica artefactos cuantizados y habría que generarlos.
- GPU recomendadas: A100 40/80 GB o H100 para evaluación a gran escala con lotes amplios; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 (16-24 GB) para FP16 ajustado o 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090, 3090, 4080 y en tarjetas de 16 GB con cuantización; en 8 GB solo con cuantización de 4 bits.
- Opciones de despliegue: transformers (carga directa de safetensors), vLLM y TGI para servicio, llama.cpp/Ollama si se convierten los pesos a GGUF (no incluidos en el repo).
- Latencia y throughput: no disponibles; el autor indica explícitamente que el upload no establece ninguna aceleración, ya que los pesos son densos plegados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeesup/svd-safety-shifted-l2_utility_remove0.4_rho0.00001 | 6.738.415.616 | no disponible | Checkpoint de investigación comprimido por SVD | llama2 | Hugging Face, 14 descargas |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 | 4.096 tokens (modelo base) | Modelo alineado original | llama2 | Hugging Face, ampliamente usado |
| Variantes de compresión SVD de Llama 2 publicadas por la comunidad | Variable | Heredado | Compresión con o sin fine-tuning de recuperación | llama2 | Hugging Face, disponibilidad variable |
| Modelos 7B alineados alternativos (p. ej. Mistral 7B Instruct) | ~7.240 millones | 8.192 tokens (modelo base) | Modelo alineado original | Apache 2.0 | Hugging Face |

La comparación directa más informativa es contra el Llama 2 7B Chat original: mismo número de parámetros efectivos tras el plegado, pero con una fracción de parámetros factoriales de 0,615424 y un comportamiento de seguridad desplazado. No se dispone de datos de rendimiento comparativos en la información proporcionada.

## Limitaciones y advertencias

- El propio autor califica el checkpoint como piloto de investigación y advierte que las mediciones no constituyen una garantía de seguridad; no debe usarse como modelo de producción sin auditoría propia.
- El objetivo de la SVD prioriza utilidad, lo que puede traducirse en una mayor tasa de éxito de ataques (ASR) frente al Llama 2 Chat original; el nombre del checkpoint ("safety-shifted") sugiere precisamente ese desplazamiento.
- No hay fine-tuning de recuperación tras la compresión, por lo que es esperable una degradación de coherencia y calidad respecto al modelo base, no cuantificada en la información disponible.
- Los pesos son matrices densas plegadas: no se obtiene ahorro de memoria ni de cómputo en inferencia, solo se documenta la representación de bajo rango subyacente.
- Los ejemplos de validación de entropía cruzada son retenidos del gradiente pero no completamente no vistos, lo que puede inflar ligeramente las métricas de validación.
- Idiomas soportados no documentados; el impacto de la compresión sobre idiomas distintos del inglés es desconocido.
- Licencia llama2: impone restricciones de uso comercial y obligaciones de atribución; debe revisarse la licencia de Llama 2 antes de cualquier despliegue.
- Riesgo de alucinación y sesgos heredados del modelo base, potencialmente amplificados por la compresión; no hay evaluación específica de sesgos en la información disponible.
- Longitud de contexto no confirmada por el autor; se asume la del modelo base, pero no está verificada tras la compresión.
- Solo 14 descargas y 0 likes: ecosistema de validación muy limitado, sin evidencia de uso independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-shifted-l2_utility_remove0.4_rho0.00001
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Paper de Llama 2: https://arxiv.org/abs/2307.09288
- AdvBench (evaluación de jailbreak): https://github.com/llm-attacks/llm-attacks
- HarmBench: https://github.com/centerforaisafety/HarmBench
- XSTest: https://github.com/google-research/xstest
- OR-Bench: https://huggingface.co/datasets/bench-llm/or-bench
- WildGuard: https://huggingface.co/allenai/wildguard
- WikiText-2: https://huggingface.co/datasets/wikitext
