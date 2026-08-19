# Reza2kn/Motarjem-v0.5-stage1-step24000

## Resumen

Motarjem v0.5 Stage 1 — step 24,000 es un checkpoint intermedio de investigación, no un lanzamiento final, dentro del proyecto Motarjem de traducción bidireccional inglés-persa. Lo desarrolla Reza2kn (Reza Sayar), investigador independiente con repositorios públicos en Hugging Face y GitHub, y se publica como un hito de entrenamiento a mitad del recorrido de una época planificada de 42.122 pasos. Con 107,9 millones de parámetros, continúa el fine-tuning del modelo base tiiuae/Falcon-H1-Tiny-Multilingual-100M-Base, que emplea la arquitectura híbrida Falcon-H1 (combinación de Mamba y atención).

El modelo resuelve la traducción automática entre inglés y persa con un tamaño muy reducido, pensado para entornos con recursos limitados y para investigación abierta. Su relevancia actual radica en que documenta de forma transparente el proceso de entrenamiento —incluye un archivo `training-receipt.json` con hashes y hechos de entrenamiento— y sirve como punto de referencia para estudiar el comportamiento de arquitecturas híbridas Mamba-attention en tareas de traducción de bajo presupuesto computacional. El checkpoint se guardó tras procesar 8.784.406.600 tokens muestreados (56,9% del flujo de la etapa 1), aunque su ventana de contexto efectiva de entrenamiento se limita a 1.024 tokens combinados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Falcon-H1 (híbrida Mamba + atención), base tiiuae/Falcon-H1-Tiny-Multilingual-100M-Base |
| Parámetros totales | 107.909.824 (~108M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Declarada 262.144; entrenada efectivamente hasta 1.024 tokens combinados fuente+destino |
| Tipos de cuantización | bfloat16 (demostrado en el ejemplo de inferencia); no se documentan otras |
| Idiomas soportados | Inglés (en), persa (fa) |
| Licencia | Falcon LLM License (falcon-llm-license) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Falcon-H1-Tiny-Multilingual-100M-Base, una variante de la familia Falcon-H1 de TII que combina capas de espacio de estados (Mamba) con mecanismos de atención, lo que reduce el coste de inferencia frente a un transformer puro manteniendo capacidad de modelado secuencial. La configuración declara `max_position_embeddings: 262.144`, pero el entrenamiento de esta etapa usó secuencias mucho más cortas: mediana de 20 tokens de fuente, percentil 99 de 115 tokens y máximo de 822 tokens; la secuencia combinada máxima fue de 1.024 tokens.

La etapa 1 contiene 266.050.112 registros de entrenamiento direccionales procedentes de la unión QuickMT y dos datasets de retro-traducción (backtranslation) con fuente inglesa: NewsCrawl2024 y MADLAD400. Los registros EN→FA de la unión QuickMT se repitieron dos veces; las retro-traducciones solo se admitieron como registros FA→EN. No se documenta el uso de RLHF ni DPO; el entrenamiento es un fine-tuning supervisado estándar. El checkpoint se guardó en el paso 24.000 de una época de 42.122 pasos, habiendo consumido el 56,9% del flujo de tokens de la etapa.

## Capacidades

- Traducción bidireccional inglés↔persa con formato de prompt específico: `<|end_of_text|><|translate|><|source-language|>SOURCE<|target-language|>`, usando `<|en|>` y `<|fa|>` como controles de idioma.
- Generación de texto autoregresiva de tipo causal con decodificación greedy (demostrada en la evaluación) y soporte de `max_new_tokens` configurable.
- Inferencia con `attn_implementation="sdpa"` (scaled dot-product attention) en Transformers.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de traducción puro de 108M.
- No dispone de capacidades de visión, audio ni modo de pensamiento extendido.
- Multilingüe únicamente en los dos idiomas de entrenamiento: inglés y persa.

## Casos de uso

- Traducción de noticias y artículos cortos EN→FA: con una mediana de longitud de fuente de 20 tokens, el modelo rinde bien en titulares y párrafos breves, adecuado para agregadores de prensa internacional en persa.
- Traducción de contenido web y blogs FA→EN: útil para equipos editoriales que necesitan publicar versiones en inglés de contenido persa sin depender de APIs comerciales.
- Subtitulado de vídeos cortos: textos de hasta 115 tokens (percentil 99) cubren la mayoría de subtítulos de una sola línea; puede integrarse en pipelines de transcripción previa.
- Preprocesamiento de corpus paralelos: sirve para generar datos sintéticos EN→FA y FA→EN que alimenten el entrenamiento de modelos de traducción más grandes, aprovechando su bajo coste de inferencia.
- Traducción en dispositivos con recursos limitados: sus ~108M de parámetros permiten ejecución en CPU o GPU de gama baja, viable en entornos edge o en laboratorios sin infraestructura de alto rendimiento.
- Investigación académica sobre arquitecturas híbridas Mamba-attention: su `training-receipt.json` y su naturaleza de checkpoint intermedio lo convierten en un objeto de estudio para analizar la dinámica de entrenamiento y la evolución de la calidad de traducción por pasos.
- Base para fine-tuning en dominios específicos: al ser un checkpoint a mitad de entrenamiento, puede continuarse el fine-tuning con datos de dominios concretos (legal, médico, técnico) para especializarlo.

## Benchmarks y rendimiento

El paso 24.000 no fue evaluado directamente; la evaluación completa más cercana corresponde al paso 20.000, con decodificación greedy y límite de 256 tokens de salida:

| Evaluación | chrF2 |
|---|---:|
| WMT24++ EN→FA | 38,58 |
| WMT24++ FA→EN | 47,92 |
| Wikipedia holdout EN→FA | 42,55 |
| Wikipedia holdout FA→EN | 44,15 |
| Media de las cuatro vías | 43,30 |
| QuickMT baseline (contrato propio) | 50,73 |

El autor advierte explícitamente que este checkpoint no debe presentarse como equivalente o superior a QuickMT, cuyo baseline alcanza 50,73 bajo su propio contrato de evaluación. No se han publicado resultados en MMLU, HumanEval ni GSM8K, al tratarse de un modelo de traducción sin evaluación de razonamiento general.

## Requisitos de hardware

- Pesos en bfloat16: ~216 MB (108M parámetros × 2 bytes); en fp32 serían ~432 MB.
- VRAM estimada para inferencia: menos de 1 GB incluyendo KV cache y overhead, dado el límite práctico de 1.024 tokens.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más (GTX 1060 6GB, RTX 3060, RTX 4090); también viable en CPU para inferencia por lotes pequeños.
- No requiere GPU de datacenter; las A100 o H100 solo aportarían ventaja en throughput de producción.
- Opciones de despliegue: Transformers con `attn_implementation="sdpa"` (demostrado), Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`), y potencialmente vLLM o llama.cpp con soporte para arquitecturas Mamba, aunque no está documentado en la model card.
- Latencia y throughput: no disponibles; por tamaño, se estima latencia de milisegundos por secuencia corta en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto efectivo | chrF2 medio (4 vías) | Licencia |
|---|---|---|---|---|
| Motarjem v0.5 stage1 step24000 | 108M | 1.024 tokens | 43,30 (step 20k) | Falcon LLM License |
| tiiuae/Falcon-H1-Tiny-Multilingual-100M-Base | ~100M | 262.144 declarados | no disponible | Falcon LLM License |
| QuickMT baseline | no disponible | no disponible | 50,73 | no disponible |

La comparativa es parcial: el modelo base no tiene evaluación de traducción publicada en la información disponible, y QuickMT opera bajo un contrato de evaluación distinto, por lo que los valores no son directamente comparables. No se dispone de datos de otros modelos de traducción del mismo rango de parámetros (p. ej., NLLB-200-distilled-600M) en la documentación consultada.

## Limitaciones y advertencias

- Checkpoint intermedio, no un lanzamiento final: fue guardado al 56,9% del flujo de tokens de la etapa 1; la calidad puede mejorar o degradarse en pasos posteriores.
- No es un traductor de documentos largos: aunque la configuración declara 262.144 posiciones, el entrenamiento usó secuencias máximas de 1.024 tokens combinados; la calidad y completitud en documentos extensos no está validada. El autor prohíbe explícitamente describirlo como traductor de 256k.
- Riesgo de alucinación y omisión en textos largos: al no haber sido entrenado con secuencias extensas, puede omitir contenido o inventar traducciones en entradas que superen su rango de entrenamiento.
- Proveniencia de datos incompleta: la unión QuickMT no conserva la procedencia completa a nivel de fila y su dataset card no especifica licencia a nivel de dataset; los dos datasets de retro-traducción son circulares con el linaje del profesor QuickMT.
- Restricciones de licencia: la Falcon LLM License impone condiciones específicas para uso comercial y redistribución; los usuarios deben revisar las licencias de los datasets upstream antes de cualquier uso comercial.
- Evaluación no sincronizada: el paso 24.000 no fue evaluado; los benchmarks corresponden al paso 20.000, por lo que hay una brecha de 4.000 pasos entre los datos de rendimiento y el checkpoint publicado.
- Idiomas limitados: solo inglés y persa; sin soporte para otros idiomas ni transferencia multilingüe más amplia.
- Sin capacidades de agente ni tool calling: no apto para tareas que requieran interacción con APIs o razonamiento multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Reza2kn/Motarjem-v0.5-stage1-step24000
- Versión anterior del proyecto: https://huggingface.co/Reza2kn/Motarjem-v0.1
- Discusiones del proyecto: https://huggingface.co/Reza2kn/Motarjem-v0.1/discussions
- Perfil del autor en Hugging Face: https://huggingface.co/Reza2kn
- GitHub del autor: https://github.com/Reza2kn
- Modelo base: https://huggingface.co/tiiuae/Falcon-H1-Tiny-Multilingual-100M-Base
- Términos y condiciones de Falcon LLM: https://falconllm.tii.ae/falcon-terms-and-conditions.html
