# HuggingFaceBio/Carbon-X

## Resumen

Carbon-X es un modelo de lenguaje de 14.800 millones de parámetros (14.822.046.720 exactos según los pesos en safetensors) desarrollado por Hugging Face Bio, la división de biología de Hugging Face. Se trata de un fine-tuning del modelo base Qwen3-14B entrenado de forma conjunta sobre secuencias de ADN y texto en lenguaje natural, con el objetivo de cubrir tareas de genómica que hasta ahora requerían modelos propietarios de frontera: predicción de efectos de variantes (benigno frente a patógeno), identificación de regiones reguladoras, clasificación taxonómica de secuencias y predicción del siguiente par de bases.

La innovación principal es la integración nativa del ADN en el flujo de tokens del propio decoder: no hay codificador de ADN separado ni adaptadores, sino un tokenizador híbrido que mantiene el vocabulario BPE de Qwen3 para texto y codifica el ADN como 6-mers no solapados, de modo que cada token de ADN cubre 6 pares de bases. El modelo se sirve como un chat convencional: se pega una secuencia en el mensaje y responde en inglés, con razonamiento explicado y, si procede, con ADN generado en la propia respuesta.

Su relevancia práctica es económica y de privacidad. Según la model card, Carbon-X promedia 66,7 % en cinco benchmarks de ADN con el modo de razonamiento desactivado, frente a los 67,5 % de GPT-6.1 Sol, pero a aproximadamente 1/1.800 del coste de inferencia por problema. Además, los pesos caben en una única GPU de 80 GB en bfloat16, lo que permite procesar secuencias sensibles o no publicadas en infraestructura propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM estándar), 40 capas, hidden size 5120, GQA con 40 cabezas de consulta y 8 de clave/valor, SwiGLU, RMSNorm con QK-norm |
| Parámetros totales | 14.822.046.720 (14,8B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantización | No disponibles en la información proporcionada; los pesos se publican en safetensors bfloat16. No se documentan versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | Inglés (en); las secuencias de ADN se procesan como tokens propios |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 29,7 GB); requiere `trust_remote_code=True` para el tokenizador y Transformers v5 o superior |

## Arquitectura y entrenamiento

Carbon-X parte de Qwen3-14B y conserva su arquitectura de transformer decoder-only: 40 capas, dimensión oculta de 5120, atención con 40 cabezas de consulta y 8 de clave/valor (GQA), activación SwiGLU y RMSNorm con normalización aplicada a Q y K (QK-norm). No hay codificador de ADN separado ni módulo de fusión multimodal: el ADN y el texto comparten un único flujo de tokens dentro del mismo decoder. El tokenizador híbrido mantiene el vocabulario BPE de Qwen3 para el lenguaje natural y añade 5.515 tokens de ADN: 4.096 6-mers, 1.364 tokens de cola para secuencias cuya longitud no es múltiplo de 6 y los marcadores `<dna>`, `</dna>` y `<oov>`. El ADN presente en el prompt se detecta y etiqueta de forma automática.

El entrenamiento consta de una fase de mid-training de 302.000 millones de tokens sobre ADN, texto de biología, inglés y datos de instrucciones, seguida de ajuste supervisado (SFT) y aprendizaje por refuerzo con recompensas verificables (RLVR) sobre tareas de ADN. El modelo se post-entrena y se evalúa con el modo de pensamiento desactivado (`enable_thinking=False`), y el autor recomienda mantenerlo así: las respuestas son directas, sin cadenas de razonamiento extendidas, lo que reduce el número de tokens de salida por problema y explica en parte el coste por consulta declarado. Los valores de muestreo por defecto de `generation_config.json` son temperatura 0,6, top-p 0,95 y top-k 20.

## Capacidades

- Predicción de efectos de variantes: clasifica mutaciones concretas como benignas o patógenas y justifica la decisión en inglés.
- Comprensión de secuencias: identifica regiones que controlan la actividad génica y describe qué codifica una secuencia.
- Clasificación por grupo de organismos a partir de la secuencia.
- Predicción del siguiente par de bases (next-base prediction) dentro de una secuencia dada.
- Generación de ADN: produce secuencias nuevas dentro de la respuesta, combinando texto y nucleótidos en la misma salida.
- Razonamiento explicado en lenguaje natural sobre la evidencia biológica que sustenta cada predicción.
- Conversación multi-turno dentro de una ventana de 40.960 tokens, suficiente para introducir secuencias largas junto con instrucciones.
- Integración como herramienta de un agente: la model card incluye una sección específica sobre el uso de Carbon-X como tool para un agente.
- Compatibilidad con la API de OpenAI a través de vLLM (`/v1/chat/completions`) y con text-generation-inference según los tags del repositorio.
- Capacidad multilingüe limitada al inglés; no se declaran otros idiomas.

## Casos de uso

- Triaje de variantes de significado incierto en investigación genómica: el modelo evalúa variantes de ClinVar y las clasifica como benignas o patógenas con una justificación textual. La model card estima que analizar los 2,4 millones de variantes de significado incierto de ClinVar costaría unos 300 dólares con Carbon-X, frente a entre 32.000 y 4 millones con modelos de frontera.
- Priorización de variantes en diagnóstico genético: uso como primer filtro en un pipeline clínico-genómico para ordenar candidatos antes de la revisión por un genetista, manteniendo las secuencias de pacientes en infraestructura propia gracias a que los pesos caben en una sola GPU de 80 GB.
- Anotación de regiones reguladoras: dado un fragmento no codificante, el modelo describe si contiene elementos con actividad reguladora y qué tipo de evidencia lo respalda.
- Clasificación taxonómica de secuencias metagenómicas: asignación de fragmentos a grandes grupos de organismos en entornos donde no se dispone de acceso a bases de datos curadas o se quiere una comprobación cruzada rápida.
- Diseño de secuencias en biología sintética: generación de ADN candidato con explicación de las elecciones de diseño, útil como borrador previo a la validación húmeda.
- Asistente conversacional para bioinformáticos: interfaz de chat que responde preguntas sobre una secuencia concreta pegada en el mensaje, sin necesidad de escribir código de análisis.
- Herramienta dentro de un agente de laboratorio: Carbon-X expuesto vía vLLM con API compatible con OpenAI, invocado como función desde un orquestador que automatiza el análisis de lotes de variantes.

## Benchmarks y rendimiento

La model card reporta el promedio agregado de cinco benchmarks de ADN que cubren predicción de efectos de variantes, comprensión de secuencias y predicción del siguiente par de bases. No se desglosan los resultados por benchmark individual en la información disponible, aunque el autor afirma que Carbon-X lidera entre los modelos evaluados en efectos de variantes codificantes y en predicción del siguiente par de bases. Tampoco se publican resultados de benchmarks generalistas (MMLU, HumanEval, GSM8K) para este modelo.

| Modelo | Promedio en 5 benchmarks de ADN | Coste relativo por problema | Notas |
|---|---|---|---|
| Carbon-X (14,8B) | 66,7 % (thinking desactivado) | 1x (referencia; medido en throughput por hora de H200 a 5 USD/h) | Peso abierto, Apache 2.0 |
| GPT-6.1 Sol | 67,5 % | ~1.800x | Modelo propietario de frontera |
| Qwen3-14B (base) | ~39,7 % (derivado: 27 puntos por debajo de Carbon-X) | No disponible | Modelo de partida del fine-tuning |

## Requisitos de hardware

- Pesos en bfloat16: el repositorio ocupa 29,7 GB y, según la model card, cabe en una única GPU de 80 GB. En la práctica se necesitan aproximadamente 30 GB solo para pesos, más caché KV y activaciones.
- GPU de 80 GB recomendadas: H100, H200 o A100 80 GB para bfloat16 con contexto largo. El autor mide el coste usando H200 a 5 USD/hora.
- GPU de 40-48 GB (A100 40 GB, L40S, RTX A6000): viables solo con cuantización a 8 bits (estimación de unos 15-16 GB de pesos) o con contexto recortado.
- GPU de consumo: no se documenta soporte en la información disponible. Por tamaño, una cuantización a 4 bits (estimación de 8-10 GB de pesos) cabría en tarjetas de 16-24 GB (RTX 4090, RTX 5090), pero no hay artefactos GGUF ni AWQ/GPTQ publicados y el tokenizador requiere código remoto, lo que complica el despliegue en llama.cpp u Ollama.
- Despliegue soportado: vLLM (`vllm serve HuggingFaceBio/Carbon-X --trust-remote-code`), exponiendo una API compatible con OpenAI; también Transformers v5 o superior con `trust_remote_code=True`. La presencia del tag `text-generation-inference` sugiere compatibilidad con TGI, aunque no se detalla en la información disponible.
- Latencia y throughput: no se publican valores absolutos de tokens por segundo. La model card solo expresa el rendimiento como coste relativo (1/1.800 frente a los modelos de frontera evaluados) y atribuye la eficiencia a que el modelo responde sin cadenas de razonamiento largas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Pesos abiertos | Rendimiento en ADN |
|---|---|---|---|---|---|
| Carbon-X | 14,8B | 40.960 tokens | Apache 2.0 | Sí (safetensors) | 66,7 % de promedio en 5 benchmarks |
| Qwen3-14B | 14,8B (misma base) | No disponible en la información proporcionada | Apache 2.0 | Sí | ~39,7 % (27 puntos por debajo) |
| GPT-6.1 Sol | No disponible | No disponible | Propietaria | No | 67,5 % de promedio |

No se han identificado en la información proporcionada otros modelos abiertos especializados en ADN con los que establecer una comparación cuantitativa directa; la model card menciona que Carbon-X supera a "todos los demás modelos abiertos evaluados", pero no enumera cuáles ni sus cifras.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de inglés. Las respuestas y el razonamiento se generan en inglés aunque la pregunta se formule en castellano, y no hay garantía de calidad en otros idiomas.
- Uso clínico: se trata de un modelo de investigación. Ninguna predicción de patogenicidad debe usarse como diagnóstico sin validación por personal clínico cualificado y confirmación experimental.
- Alucinación: como modelo generativo, puede producir justificaciones biológicas plausibles pero incorrectas, o inventar elementos reguladores y referencias. La model card incluye una sección de limitaciones cuyo contenido completo no está disponible en el extracto consultado.
- Tokenizador personalizado: requiere `trust_remote_code=True` y Transformers v5 o superior, lo que añade una dependencia de código remoto y complica la integración en herramientas que no lo soportan.
- Modo de razonamiento: el modelo se post-entrenó y evaluó con `enable_thinking=False`. Activar el modo de pensamiento no está validado y puede degradar la calidad o el coste.
- Sesgos: no se documenta en la información disponible un análisis de sesgos en la composición del dataset de 302.000 millones de tokens (ADN, texto de biología, inglés e instrucciones); la representación taxonómica y geográfica de las secuencias de entrenamiento es desconocida.
- Cobertura de benchmarks: las cifras publicadas son un promedio de cinco benchmarks de ADN; no hay resultados desglosados por tarea ni evaluación en benchmarks generalistas, lo que limita la comparación con modelos de propósito general.
- Licencia: Apache 2.0 permite uso comercial, pero la licencia del modelo base (Qwen3-14B, también Apache 2.0) y las condiciones de los datos de entrenamiento no se detallan en la información disponible.
- Longitud de contexto: 40.960 tokens pueden resultar insuficientes para genomas completos o regiones extensas; los fragmentos largos deben trocearse, lo que rompe la coherencia de variantes que afectan a regiones distantes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HuggingFaceBio/Carbon-X
- Demo / blog de lanzamiento (Space): https://huggingface.co/spaces/HuggingFaceBio/Carbon-X-Release
- Organización Hugging Face Bio: https://huggingface.co/HuggingFaceBio
- Código en GitHub: https://github.com/huggingface/carbon/tree/main
- Cobertura en Business Insider: https://www.businessinsider.com/hugging-face-ai-model-carbon-x-dna-sequences-gene-therapies-2026-10
- Análisis en explainx.ai: https://explainx.ai/blog/hugging-face-carbon-x-14b-open-dna-chat-model-variant-effects-1800x-cheaper-claimed-vs-verified-2026
- Cobertura en Digg: https://digg.com/tech/kvc0iuud
- Modelo base Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
