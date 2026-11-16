# gravermistakes/MEMPHIS

## Resumen

MEMPHIS es un ajuste fino (fine-tune) del modelo darkc0de/Arete-27B-heretic-test3, publicado por el usuario gravermistakes bajo el paraguas del proyecto de investigación "XORTRON Criminal Computing". Se trata de un modelo multimodal de tipo image-text-to-text construido sobre la arquitectura Qwen 3.5, con 27.356.728.560 parámetros totales (aproximadamente 27,4 mil millones) y pesos en formato safetensors. El repositorio ocupa 54,7 GB y se distribuye bajo licencia Apache 2.0, aunque la model card impone una restricción de acceso y uso adicional.

El modelo se presenta explícitamente como una herramienta de investigación sobre seguridad y alineación de IA, orientada a estudiar la capacidad de los sistemas avanzados para facilitar actividades de alto riesgo. Los tags incluyen "heretic", "uncensored", "toxic" y "not-for-all-audiences", lo que indica que ha sido deliberadamente desalineado o "abliterado" para eliminar restricciones de rechazo. Esta naturaleza lo hace relevante en el contexto de la investigación en red-teaming y evaluación de riesgos, pero también lo convierte en un artefacto de alto riesgo para despliegues generales.

La información pública disponible es muy limitada: cero descargas, cero likes, sin benchmarks publicados y con una model card que contiene principalmente un acuerdo legal de acceso restringido en lugar de documentación técnica detallada. El modelo base declarado es un fine-tune "heretic" de la familia Qwen, y el dataset de entrenamiento citado es darkc0de/The-Mind-of-XORTRON.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Qwen 3.5 |
| Parametros totales | 27.356.728.560 (~27,4 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; se asume compatibilidad con cuantizacion estandar por la tag "unsloth") |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (con acuerdo de acceso restringido adicional en la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer multimodal de la familia Qwen 3.5, según la tag `qwen3_5` y el pipeline `image-text-to-text`, lo que implica capacidad de procesar entradas de imagen y texto y generar texto. El modelo se ha obtenido mediante fine-tuning del checkpoint darkc0de/Arete-27B-heretic-test3, que a su vez es un ajuste "heretic" de un modelo Qwen de 27B. La tag `unsloth` sugiere que el entrenamiento se realizó con la librería Unsloth, orientada a fine-tuning eficiente en memoria (LoRA/QLoRA), aunque no se especifican hiperparámetros, número de tokens de entrenamiento ni composición exacta del dataset.

El dataset de entrenamiento declarado es darkc0de/The-Mind-of-XORTRON. No se documenta si hubo RLHF, DPO u otras fases de alineación; de hecho, la naturaleza "heretic" y "uncensored" del modelo base indica lo contrario: se ha trabajado para eliminar los comportamientos de rechazo. No se dispone de información sobre innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.) ni sobre la composición del corpus multimodal empleado.

## Capacidades

- Generación de texto conversacional en inglés, con sesgo hacia respuestas sin filtros de seguridad ("uncensored").
- Procesamiento de entradas imagen-texto (pipeline image-text-to-text), lo que permite describir imágenes o responder preguntas sobre ellas.
- Razonamiento y generación de código y matemáticas, heredados de la base Qwen 3.5, aunque no verificados con benchmarks.
- Capacidad multimodal: al estar etiquetado como image-text-to-text, se espera soporte de visión, si bien no se detalla la resolución de imagen ni el encoder visual.
- No se documenta soporte explícito de tool calling o function calling.
- No se documenta soporte de agentes o razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la metadata.
- Modo "heretic"/"uncensored": el modelo ha sido modificado para reducir rechazos, lo que constituye una capacidad (y un riesgo) diferencial.

## Casos de uso

- Red-teaming y evaluación de seguridad: el modelo puede emplearse en entornos controlados para generar respuestas que un modelo alineado rechazaría, permitiendo a equipos de seguridad medir la eficacia de sus filtros y clasificadores de contenido.
- Investigación en alineación y "abliteration": sirve como sujeto de estudio para analizar cómo el fine-tuning "heretic" altera las distribuciones de rechazo y qué mecanismos internos se ven afectados.
- Análisis de contenido multimodal en investigación forense: su capacidad image-text-to-text permite experimentar con descripciones de imágenes en contextos de investigación académica o legal.
- Docencia y formación en seguridad de IA: útil para demostrar en cursos y talleres los riesgos de los modelos sin alinear, siempre bajo supervisión y en sandbox.
- Evaluación comparativa de robustez: comparar sus salidas frente a modelos alineados del mismo tamaño para estudiar diferencias de comportamiento en dominios sensibles.
- Investigación en políticas públicas y regulación: analizar empíricamente qué tipos de contenido pueden generar modelos abliterados para fundamentar recomendaciones regulatorias.
- Prototipado de clasificadores de contenido tóxico: generar ejemplos adversarios para entrenar detectores de contenido dañino en pipelines de moderación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 55 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 80 GB.
- VRAM estimada en cuantización de 8 bits: ~28-30 GB; en 4 bits: ~15-18 GB (estimaciones teóricas basadas en el número de parámetros, no verificadas por el autor).
- GPU recomendadas para FP16: A100 80GB, H100 80GB, o múltiples GPUs (2x RTX 4090 24GB con paralelización).
- Cabe en GPU de consumo (RTX 4090 24GB) únicamente con cuantización de 4 bits, con margen ajustado para contexto.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag), y potencialmente llama.cpp/Ollama si se generan GGUF a partir de los safetensors; Unsloth para fine-tuning.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MEMPHIS (este modelo) | ~27,4 B | no disponible | Si (image-text-to-text) | apache-2.0 + acuerdo restringido | Publico en HF, 0 descargas |
| Qwen 3.5 base (referencia de familia) | variable | no disponible | Si | variable segun variante | Amplia |
| darkc0de/Arete-27B-heretic-test3 (modelo base) | ~27 B | no disponible | no disponible | no disponible | Publico en HF |
| Modelos "heretic"/abliterados de 27B | ~27 B | variable | variable | variable | Comunidad HF |

No se dispone de datos de rendimiento comparativo verificables para MEMPHIS frente a alternativas, dado que no hay benchmarks publicados.

## Limitaciones y advertencias

- Modelo deliberadamente desalineado ("uncensored", "heretic", "toxic"): puede generar contenido dañino, ilegal o peligroso sin filtros.
- Riesgo elevado de alucinación y de información factualmente incorrecta, agravado por la falta de benchmarks y documentación.
- Idioma limitado al inglés; no se garantiza calidad en castellano ni en otros idiomas.
- La licencia Apache 2.0 se ve matizada por un acuerdo de acceso restringido en la model card que limita el uso a profesionales cualificados (legal, seguridad, investigación, gobierno); existe tensión entre ambos marcos.
- No apto para producción general, atención al cliente ni aplicaciones de cara al público.
- Sin datos de contexto máximo, lo que impide planificar despliegues con ventanas largas.
- Sin información sobre sesgos específicos más allá de la naturaleza tóxica declarada.
- Repositorio con cero descargas y cero likes: sin validación comunitaria ni evidencia de calidad.
- El uso para actividades criminales está explícitamente prohibido por el autor; el incumplimiento puede tener consecuencias legales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/gravermistakes/MEMPHIS)
- [Modelo base: darkc0de/Arete-27B-heretic-test3](https://huggingface.co/darkc0de/Arete-27B-heretic-test3)
- [Dataset: darkc0de/The-Mind-of-XORTRON](https://huggingface.co/datasets/darkc0de/The-Mind-of-XORTRON)
- [Trend Micro Research - Malicious Uses and Abuses of Artificial Intelligence](https://documents.trendmicro.com/assets/white_papers/wp-malicious-uses-and-abuses-of-artificial-intelligence.pdf)
- [TRM Labs - The Rise of AI-Enabled Crime](https://www.trmlabs.com/resources/blog/the-rise-of-ai-enabled-crime-exploring-the-evolution-risks-and-responses-to-ai-powered-criminal-enterprises)
- [American Military University - AI-Enabled Crime](https://www.amu.apus.edu/area-of-study/criminal-justice/resources/ai-enabled-crime/)
- [United States Congress - 119th Congress Hearing Record](https://www.congress.gov/119/chrg/CHRG-119hhrg61182/CHRG-119hhrg61182.pdf)
- [KELA AI Cybercrime Report Q4 2026](https://www.kelacyber.com/resources/research/ai-cybercrime-report-q4-2026/)
- [CrowdStrike 2026 Global Threat Report](https://go.crowdstrike.com/2026-global-threat-report.html)
- [xortron.ai](https://xortron.ai)
