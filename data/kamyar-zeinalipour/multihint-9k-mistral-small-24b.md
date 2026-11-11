# Kamyar-zeinalipour/MultiHint-9K-Mistral-Small-24B

## Resumen

MultiHint-9K-Mistral-Small-24B es un adaptador LoRA (PEFT) sobre el modelo Mistral-Small-24B-Instruct-2501, desarrollado por Kamyar Zeinalipour y colaboradores en el marco del trabajo presentado en AIED 2026. Su proposito es especializar un modelo de lenguaje grande en la generacion de pistas socraticas breves para preguntas de comprension lectora: dado un pasaje, una pregunta y su respuesta, el modelo produce una indicacion que orienta al estudiante hacia la solucion sin revelarla directamente.

El modelo resuelve un problema pedagogico concreto: la generacion escalable de retroalimentacion formativa de calidad en entornos educativos multilingues. Frente a la alternativa de redactar pistas manualmente, el adaptador permite automatizar este proceso manteniendo una calidad calibrada por humanos, segun la metodologia descrita en el paper asociado.

Tecnicamente se trata de un adaptador de bajo rango (LoRA con r=32, alpha=64) que anade aproximadamente 3,1 GB de pesos al modelo base de 24 mil millones de parametros. El modelo resultante hereda la ventana de contexto y las capacidades del base, pero queda especializado en la tarea de generacion de pistas en ingles, italiano y persa. Es relevante para investigadores en tecnologia educativa y para desarrolladores que construyan asistentes de aprendizaje que requieran retroalimentacion socratica controlada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral-Small-24B-Instruct-2501) con adaptador LoRA/PEFT |
| Parametros totales | 24B en el modelo base; el adaptador LoRA anade un subconjunto no especificado (repo de 3,1 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Ingles (en), italiano (it), persa (fa) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Mistral-Small-24B-Instruct-2501, un transformer decoder-only de 24 mil millones de parametros. El entrenamiento LoRA utiliza rango r=32, alpha=64 y dropout de 0,1 sobre las proyecciones de atencion y MLP. Se realizaron 3 epocas con el optimizador AdamW, tasa de aprendizaje de 1e-4 con decaimiento coseno, precision bf16 y Flash Attention 2.

El conjunto de entrenamiento es MultiHint-9K, compuesto por 9.987 tuplas verificadas automaticamente y calibradas por humanos, del tipo pregunta-respuesta-pista, en ingles, italiano y persa. La metodologia combina agencia humana y artificial para escalar la generacion de pistas pedagogicas, segun el paper presentado en AIED 2026. No se especifica en la informacion disponible el numero total de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de pistas socraticas: produce indicaciones breves que guian al estudiante sin desvelar la respuesta, a partir de un pasaje, una pregunta y su respuesta.
- Comprension lectora: razona sobre el contenido de un texto para formular la pista adecuada.
- Multilingue: cubre ingles, italiano y persa en la tarea especializada.
- Generacion de texto general: hereda las capacidades del modelo base Mistral-Small-24B-Instruct-2501.
- Soporte de tool calling y function calling: no disponible de forma especifica en la informacion proporcionada; depende del modelo base.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Plataformas de aprendizaje adaptativo: el modelo genera pistas socraticas en tiempo real cuando un estudiante falla una pregunta de comprension lectora, evitando revelar la respuesta y fomentando el razonamiento autonomo.
- Sistemas de tutoria inteligente (ITS): integrado como modulo de retroalimentacion formativa, produce indicaciones calibradas en ingles, italiano o persa segun el idioma del alumno.
- Generacion masiva de material educativo: permite crear bancos de pistas para examenes de comprension lectora a partir de pares pregunta-respuesta ya existentes, reduciendo el coste de redaccion manual.
- Evaluacion de calidad pedagogica: sirve como referencia para comparar la calidad de pistas generadas por otros modelos o por docentes, usando la metrica ROUGE-L sobre el conjunto de validacion.
- Asistentes de estudio multilingues: desplegado en herramientas de apoyo al estudiante que necesiten retroalimentacion en italiano o persa, idiomas con menor cobertura en modelos especializados.
- Investigacion en tecnologia educativa: base reproducible para experimentar con variantes de LoRA, prompts socraticos y evaluacion de retroalimentacion formativa, dado que el codigo y los scripts de entrenamiento son publicos.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible corresponden a ROUGE-L sobre el conjunto de validacion (held-out), comparando el modelo base con el adaptador. Todas las mejoras son estadisticamente significativas (p < 0,001, Wilcoxon con correccion de Bonferroni).

| Modelo base | Adaptador | ROUGE-L (base → fine-tuned) |
|---|---|---|
| Llama-3.1-8B | MultiHint-9K-Llama-3.1-8B | 0,20 → 0,32 (+52%) |
| Qwen2.5-14B | MultiHint-9K-Qwen2.5-14B | 0,23 → 0,31 (+34%) |
| Mistral-7B-v0.3 | MultiHint-9K-Mistral-7B-v0.3 | 0,19 → 0,32 (+57%) |
| Mistral-Nemo-12B | MultiHint-9K-Nemo-12B | 0,15 → 0,31 (+100%) |
| Mistral-Small-24B | MultiHint-9K-Mistral-Small-24B | 0,18 → **0,33** (+71%) |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) para este adaptador en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 24B en bf16 requiere aproximadamente 48 GB de VRAM; en cuantizacion de 8 bits, unos 24-26 GB; en 4 bits, unos 13-15 GB. El adaptador anade aproximadamente 3,1 GB en el repositorio, aunque su huella en memoria depende de la implementacion de PEFT.
- GPU recomendadas: A100 80GB o H100 para bf16 sin cuantizar; A100 40GB o RTX 6000 Ada para 8 bits; RTX 4090 (24 GB) viable en cuantizacion de 4-8 bits.
- Cabe en GPU de consumo: si, en cuantizacion de 4 bits en GPUs con 16-24 GB (RTX 4090, RTX 4080, etc.), aunque no se especifican cuantizaciones oficiales del adaptador en la informacion disponible.
- Opciones de despliegue: transformers con PEFT (metodo documentado en la model card), vLLM, TGI o llama.cpp previa fusion del adaptador con el modelo base y conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La comparativa mas directa la ofrecen los otros adaptadores MultiHint-9K publicados por el mismo autor, todos especializados en la misma tarea:

| Modelo | Parametros base | ROUGE-L tras fine-tuning | Licencia | Disponibilidad |
|---|---|---|---|---|
| MultiHint-9K-Mistral-Small-24B | 24B | 0,33 | Apache-2.0 | Hugging Face |
| MultiHint-9K-Qwen2.5-14B | 14B | 0,31 | Apache-2.0 (base) | Hugging Face |
| MultiHint-9K-Llama-3.1-8B | 8B | 0,32 | Licencia Llama 3.1 (base) | Hugging Face |
| MultiHint-9K-Mistral-7B-v0.3 | 7B | 0,32 | Apache-2.0 (base) | Hugging Face |

El adaptador sobre Mistral-Small-24B obtiene el mayor ROUGE-L (0,33), con una mejora relativa del 71% sobre su base, aunque el coste computacional es superior al de las variantes de 7B, 8B y 14B, que logran resultados cercanos (0,31-0,32) con menor huella de memoria.

## Limitaciones y advertencias

- Especializacion estrecha: el adaptador esta entrenado exclusivamente para generar pistas socraticas a partir de pasaje, pregunta y respuesta; su uso fuera de esta tarea puede degradar el rendimiento respecto al modelo base.
- Cobertura linguistica limitada: solo se declaran ingles, italiano y persa; no hay evidencia de calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion: como todo modelo generativo, puede producir pistas que contradigan el pasaje o que revelen parcialmente la respuesta; se recomienda validacion en produccion.
- Sesgos: no se documentan analisis de sesgos en la informacion proporcionada; los datos son calibrados por humanos, lo que puede introducir sesgos pedagogicos o culturales.
- Licencia: Apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Mistral-Small-24B-Instruct-2501 y las condiciones de los datos de entrenamiento antes de un despliegue comercial.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Evaluacion limitada: el unico benchmark publicado es ROUGE-L, una metrica de solapamiento lexico que no mide directamente la calidad pedagogica de la pista; no hay evaluaciones humanas detalladas en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kamyar-zeinalipour/MultiHint-9K-Mistral-Small-24B
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-24B-Instruct-2501
- Dataset MultiHint-9K: https://huggingface.co/datasets/Kamyar-zeinalipour/MultiHint-9K
- Coleccion MultiHint-9K: https://huggingface.co/collections/Kamyar-zeinalipour/multihint-9k-aied-2026-6af4875966cf330a922a1d87
- Paper (AIED 2026, CEUR-WS Vol. 4248): https://ceur-ws.org/Vol-4248/short11.pdf
- Repositorio GitHub: https://github.com/KamyarZeinalipour/MultiHint-9K
- Scripts de entrenamiento: https://github.com/KamyarZeinalipour/MultiHint-9K/tree/main/training
- Adaptador MultiHint-9K-Llama-3.1-8B: https://huggingface.co/Kamyar-zeinalipour/MultiHint-9K-Llama-3.1-8B
- Adaptador MultiHint-9K-Qwen2.5-14B: https://huggingface.co/Kamyar-zeinalipour/MultiHint-9K-Qwen2.5-14B
- Adaptador MultiHint-9K-Mistral-7B-v0.3: https://huggingface.co/Kamyar-zeinalipour/MultiHint-9K-Mistral-7B-v0.3
- Adaptador MultiHint-9K-Nemo-12B: https://huggingface.co/Kamyar-zeinalipour/MultiHint-9K-Nemo-12B
