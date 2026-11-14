# DuoNeural/RMSN-193M-KAMTerminalDoublet-D1024d19s1-SFT

## Resumen

RMSN-193M-KAMTerminalDoublet-D1024d19s1-SFT es un modelo de lenguaje de 193 millones de parámetros desarrollado por DuoNeural Lab, resultado de un ajuste fino supervisado (SFT) sobre el modelo base RMSN-193M-KAMTerminalDoublet-D1024d19s1-Base. La familia RMSN se presenta como una arquitectura port-hamiltoniana, descrita por la ecuación de evolución ḟ = {f, H} + [f, S], que combina un corchete conservativo {·,H} con un término metripléctico de Morrison [·,S]. El modelo está orientado a generación de texto y razonamiento en cadena (CoT) en inglés, y su model card enfatiza propiedades topológicas internas (condensados terminales, solitones, "KAM topology") más que capacidades funcionales convencionales.

El modelo se distribuye bajo licencia Apache 2.0 y el repositorio ocupa aproximadamente 0.9 GB. La model card reporta métricas internas de perplejidad (wiki_ppl = 162.93 y CoT_ppl = 14.16) sobre conjuntos no especificados, así como un proceso de SFT de 5.000 pasos con learning rate 2e-5 y annealing coseno. No se documentan datos de entrenamiento, composición del corpus, número de tokens ni metodología de evaluación estándar (MMLU, HumanEval, GSM8K).

La relevancia del modelo es limitada fuera del nicho de investigación del propio laboratorio: se trata de un artefacto experimental de pequeño tamaño, sin benchmarks públicos verificables y con 0 descargas en el momento de la consulta. Su interés principal reside en la propuesta arquitectónica port-hamiltoniana y en las afirmaciones del autor sobre la posición de los condensados como factor determinante en la retención del SFT, que no han sido validadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Port-hamiltoniana (corchete conservativo + término metripléctico de Morrison); familia RMSN |
| Parametros totales | 193M (según el identificador del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio ocupa 0.9 GB; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura se describe en la model card mediante la ecuación ḟ = {f, H} + [f, S], un formalismo port-hamiltoniano que separa una dinámica conservativa (corchete de Poisson {·,H}) de una disipativa o metripléctica ([·,S], término de Morrison). El modelo base incorpora una topología denominada KAM-TerminalDoublet, generada por el que el autor llama "KAM Plasticizing Effect" en el borde de la lengua de Arnold Ω=16/19, calculado como Ω = D/(M_w × L) = 1024/(64×19) ≈ 0.842. Según la model card, esta configuración produce una condensación retardada y un condensado terminal exacto en las capas L16 y L17 (84-89 % de profundidad), con un valor de perplejidad de validación del modelo base de 67.5.

El ajuste fino SFT se realizó durante 5.000 pasos con learning rate 2e-5 y annealing coseno, alcanzando una pérdida mínima de 2.2757. La model card afirma una estabilidad de Lyapunov del 100 % (topología preservada) y reporta wiki_ppl = 162.93 y CoT_ppl = 14.16 tras el SFT. No se especifican el corpus de SFT, el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. Tampoco se detalla la implementación concreta de las capas (atención, estado, mezcladores) más allá del formalismo dinámico descrito.

## Capacidades

- Generación de texto en inglés.
- Razonamiento en cadena (CoT), según la métrica CoT_ppl reportada por el autor.
- Ajuste fino supervisado orientado a instrucciones (SFT), aunque no se detalla el formato de prompt ni la plantilla de chat.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso más allá del CoT.
- Capacidades multilingües: solo inglés declarado.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.
- No se documentan capacidades de código ni matemáticas de forma específica.

## Casos de uso

- Investigación en arquitecturas dinámicas: el modelo sirve como banco de pruebas para estudiar el formalismo port-hamiltoniano y la formación de condensados terminales en redes pequeñas, comparando la evolución de la topología interna durante el entrenamiento.
- Experimentos de retención tras SFT: dado que la model card centra su contribución en la "Terminal Condensate Advantage", puede emplearse para replicar o refutar la hipótesis de que los condensados en capas profundas mejoran la retención del ajuste fino.
- Generación de texto en inglés de baja latencia en entornos con recursos limitados: con 193M de parámetros y un repositorio de 0.9 GB, es viable en CPU o GPU de gama baja para tareas de completado simple, siempre que se acepte su calidad no verificada.
- Estudio de perplejidad en dominios concretos: las métricas wiki_ppl y CoT_ppl permiten usar el modelo como referencia interna en experimentos de perplejidad sobre wikitexto y cadenas de razonamiento, aunque los conjuntos exactos no se especifican.
- Docencia y divulgación: útil para ilustrar conceptos de mecánica hamiltoniana aplicada a redes neuronales y de dinámica de sistemas disipativos en un modelo de tamaño manejable.
- Base para ajustes finos adicionales: al estar bajo Apache 2.0 y con un tamaño reducido, puede servir como punto de partida para experimentos de fine-tuning en inglés con presupuesto de cómputo mínimo.

## Benchmarks y rendimiento

La model card no reporta benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Solo se publican métricas internas de perplejidad:

| Modelo | Anchor | Posición del anchor | SFT wiki_ppl | SFT CoT_ppl |
|---|---|---|---|---|
| T-RMSN (ThermVoid) | 0.23 | — | 28.811 | — |
| d1664 (Ω>1) | ~1.5 | — | 207 | 13.9 |
| d1152 MNAC | 3.0 | L6+L7 (40 % profundidad) | 202.41 | 19.36 |
| d19s1 KAM-TD (este) | 2.783 | L16+L17 (84-89 %) | 162.93 | 14.16 |

No se han publicado resultados de benchmarks estándar en la información disponible. Las cifras anteriores proceden exclusivamente de la model card del autor y no han sido verificadas de forma independiente; los conjuntos de evaluación no se especifican.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para 193M de parámetros, en FP16 serían necesarios aproximadamente 0.4 GB de pesos, y en FP32 unos 0.8 GB; a ello hay que sumar el coste de activaciones y caché KV, que depende de una longitud de contexto no documentada.
- GPU recomendadas: no disponibles. Por tamaño, el modelo cabría en cualquier GPU consumer con al menos 2-4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060), aunque no hay confirmación del autor.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño, pero no está verificado ni documentado.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El formato de pesos no se especifica, por lo que la compatibilidad con estos runners es desconocida.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| RMSN-193M-KAMTerminalDoublet-D1024d19s1-SFT | 193M | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Arquitectura experimental port-hamiltoniana |
| RMSN-193M-KAMTerminalDoublet-D1024d19s1-Base | 193M | no disponible | no disponible en la información | Hugging Face | Modelo base del anterior |
| Alternativas de ~200M tipo GPT-2 small / Pythia-160M | ~125-160M | 1.024-2.048 tokens (típico) | MIT / Apache 2.0 (según modelo) | Hugging Face, ampliamente adoptados | No comparables directamente por falta de benchmarks del modelo RMSN |

No se dispone de benchmarks comunes que permitan una comparación cuantitativa fiable con alternativas de la misma categoría. La comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- No se han publicado benchmarks estándar ni evaluaciones independientes; las métricas de la model card (wiki_ppl, CoT_ppl) carecen de contexto metodológico y no son comparables con resultados públicos.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Riesgo elevado de alucinación y degeneración incoherente: es un modelo de 193M parámetros con un SFT de solo 5.000 pasos y sin datos de alineación (RLHF/DPO) documentados.
- Idiomas: solo inglés declarado; no hay soporte multilingüe documentado.
- Longitud de contexto desconocida, lo que impide planificar su uso en tareas de contexto largo.
- Formato de pesos no especificado; la integración con herramientas estándar (vLLM, llama.cpp, Ollama, TGI) no está garantizada.
- Sesgos: no documentados, pero previsibles en un modelo entrenado sin información sobre la composición del corpus.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación de calidad hace desaconsejable su uso en producción sin validación previa.
- Las afirmaciones sobre "condensados terminales", "solitones topológicos" y "KAM topology" no cuentan con respaldo en literatura revisada por pares dentro de la información disponible; deben tratarse como hipótesis del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuoNeural/RMSN-193M-KAMTerminalDoublet-D1024d19s1-SFT
- Modelo base: https://huggingface.co/DuoNeural/RMSN-193M-KAMTerminalDoublet-D1024d19s1-Base
- No se han encontrado en la información proporcionada papers, blogs, repositorios ni demos adicionales.
