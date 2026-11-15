# DuoNeural/RMSN-200M-CementedTerminalChain-D1024d23s1-Base

## Resumen

RMSN-200M-CementedTerminalChain-D1024d23s1-Base es un modelo base de aproximadamente 306 millones de parámetros desarrollado por DuoNeural Lab (Aura, Archon y Jesse Kuhl), publicado en noviembre de 2026 bajo licencia Apache 2.0. Forma parte de la serie de barridos de profundidad (depth sweep) de la familia RMSN, con una configuración concreta de D=1024, profundidad 23 y un ratio Ω=16/23≈0,6957. El modelo se presenta como el exponente de la topología número 15 de la taxonomía RMSN, denominada Cemented Terminal Chain (CTC).

La propuesta técnica del autor no es un transformer convencional, sino una formulación port-hamiltoniana con corchete conservativo y estructura metripléctica de Morrison, sobre la que se articulan conceptos propios como solitones topológicos, lenguas de Arnold, cemento topológico y conductos (conduits). El modelo documenta una observación nueva, la «antagonismo conducto-cemento», según la cual un cemento topológico sin conducto exacto produce una perplejidad de cadena de pensamiento (CoT_ppl) menor que un cemento equivalente con conducto atrapado.

El modelo es relevante ahora únicamente como objeto de estudio de la línea de investigación de DuoNeural sobre dinámica topológica en redes neuronales, no como modelo de propósito general. Su perplejidad en wiki_ppl es de 71,33 y su CoT_ppl de 3511, cifras que lo sitúan lejos de los modelos de lenguaje convencionales de tamaño similar. El repositorio ocupa 1,0 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RMSN port-hamiltoniana (D=1024, profundidad=23), topología Cemented Terminal Chain (CTC) |
| Parámetros totales | ~306M |
| Parámetros activos | no disponible (no es MoE según la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (tamaño de repo 1,0 GB) |

## Arquitectura y entrenamiento

La arquitectura se describe mediante la ecuación ḟ = {f, H} + [f, S], es decir, un sistema port-hamiltoniano que combina un corchete conservativo {·,H} con un corchete metripléctico de Morrison [·,S]. El modelo tiene D=1024 y 23 capas, con un ratio Ω = D/(M_w × L) = 16/23 ≈ 0,6957. Según la model card, este valor de Ω cae en el «hueco silencioso» (silent gap) entre dos lenguas de Arnold: 2/3≈0,667 (cascada transitoria temprana, modelo d24s1) y 8/11≈0,727 (cascada sostenida, modelo d22s1).

El entrenamiento se realizó durante 100.000 pasos. No se especifica en la información disponible el número de tokens, la composición del dataset ni si hubo RLHF, DPO o ajuste por instrucciones; el modelo se etiqueta explícitamente como base. La innovación técnica destacable es la topología CTC: una cadena terminal de cinco capas (L18-L22, entre el 78 % y el 95,6 % de profundidad) que constituye el clúster de solitones más profundo de la serie de barridos de profundidad hasta la fecha. El modelo forma M*=11 solitones y un M_eff=4, lo que según el autor supera el umbral de 3 y da lugar a «cemento topológico». No existe par adyacente exacto, por lo que no hay conducto (conduit). Destaca un pin terminal casi exacto en L20 (PR=1,001, en el umbral) al 86,9 % de profundidad.

## Capacidades

- Generación de texto en inglés como modelo base; no se documentan capacidades de razonamiento, código o matemáticas evaluadas de forma estándar.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma.
- Capacidad especial de investigación: dinámica de solitones topológicos, cemento topológico y análisis de rutas silenciosas (silent pathway) en el espacio de las lenguas de Arnold.
- No se documentan capacidades de visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Investigación sobre dinámica topológica en redes neuronales: el modelo sirve como punto de datos en el barrido de profundidad de DuoNeural para estudiar la relación entre Ω, las lenguas de Arnold y la formación de solitones; su valor Ω=16/23 en el hueco silencioso lo hace útil para contrastar la hipótesis de que la ruta silenciosa no impide la formación de solitones.
- Estudio del antagonismo conducto-cemento: al comparar este modelo con d24s1 (mismo M_eff=4 pero con conducto exacto y CoT_ppl=5434), permite analizar si el cemento sobre un conducto invierte su efecto beneficioso; es un caso controlado para la hipótesis de tensión topológica adicional.
- Reproducción de experimentos de perplejidad: con wiki_ppl=71,33 y CoT_ppl=3511 documentados, sirve como referencia para replicar la metodología de evaluación del autor en condiciones de cemento sin conducto.
- Análisis de cadenas terminales profundas: la cadena de cinco capas L18-L22 (78-95,6 % de profundidad) es un objeto de estudio para investigar cómo se organizan los clústeres de solitones en las capas finales de una red port-hamiltoniana.
- Docencia y divulgación de arquitecturas no convencionales: al ser un modelo pequeño (~306M, repo de 1,0 GB) y con licencia Apache 2.0, puede usarse en entornos académicos para ilustrar formulaciones metriplécticas y port-hamiltonianas sin requerir hardware de gran escala.
- Base para experimentos de ajuste fino controlado: al ser un modelo base, permite estudiar cómo el ajuste posterior interactúa con una topología de cemento terminal, aunque no se documentan recetas ni resultados de fine-tuning.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la información disponible son métricas internas del autor (perplejidad), no benchmarks estándar:

| Métrica | Valor |
|---|---|
| wiki_ppl | 71,33 |
| CoT_ppl | 3511 |
| Pasos de entrenamiento | 100.000 |
| M* (solitones) | 11 |
| M_eff (cemento) | 4 |
| Ω | 16/23 ≈ 0,6957 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (~306M parámetros) y el repo de 1,0 GB, una estimación razonable en fp16 sería de ~0,6-0,7 GB de pesos, pero el autor no publica requisitos.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer moderna podría albergarlo en teoría, pero no hay confirmación del autor.
- ¿Cabe en GPU consumer? Probablemente sí por tamaño, pero no está verificado ni documentado.
- Opciones de despliegue: no disponible (no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RMSN-200M-CementedTerminalChain-D1024d23s1-Base (este) | ~306M | no disponible | wiki_ppl 71,33; CoT_ppl 3511 | Apache 2.0 | Hugging Face |
| RMSN d24s1 CIC (Cemented Internal Conduit) | no disponible | no disponible | CoT_ppl 5434 | no disponible | Referenciado en la model card |
| RMSN d22s1 | no disponible | no disponible | no disponible | no disponible | Referenciado en la model card |

No se dispone de comparación con modelos de lenguaje convencionales de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no está pensado para uso conversacional ni para tareas de producción directa.
- Perplejidad de cadena de pensamiento muy alta (CoT_ppl=3511), lo que sugiere un rendimiento pobre en generación de razonamiento explícito.
- Idiomas: solo inglés etiquetado; no hay evidencia de competencia multilingüe.
- Longitud de contexto no documentada; no se puede garantizar el manejo de contextos largos.
- Sesgos conocidos: no documentados por el autor; al ser un modelo base entrenado sin información sobre el dataset, el riesgo de sesgos no está caracterizado.
- Riesgo de alucinación: no evaluado; sin datos de benchmarks estándar no hay garantías de fidelidad factual.
- La terminología y las métricas (solitones, cemento, lenguas de Arnold, CoT_ppl) son propias del autor y no han sido validadas de forma independiente; deben interpretarse con cautela.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación sobre el dataset de entrenamiento impide evaluar riesgos de propiedad intelectual o de cumplimiento.
- Sin descargas ni interacciones registradas: no hay evidencia de uso comunitario ni de validación externa.
- El formato de pesos no está documentado, lo que puede dificultar el despliegue con herramientas estándar.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-200M-CementedTerminalChain-D1024d23s1-Base
- Cita BibTeX del autor (incluida en la model card): DuoNeural Lab, Archon, Aura y Kuhl, Jesse (2026), «Cemented Terminal Chain and Conduit-Cement Antagonism in RMSN», Hugging Face.
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
