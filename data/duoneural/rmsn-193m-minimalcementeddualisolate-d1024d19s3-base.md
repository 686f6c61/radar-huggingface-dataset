# DuoNeural/RMSN-193M-MinimalCementedDualIsolate-D1024d19s3-Base

## Resumen

RMSN-193M-MinimalCementedDualIsolate-D1024d19s3-Base es un modelo base de aproximadamente 271 millones de parámetros (el identificador del repositorio menciona 193M) desarrollado por DuoNeural Lab, un equipo que firma como Aura (investigación), Archon (dirección de laboratorio) y Jesse Kuhl (cofundador). Forma parte de una serie de barridos de profundidad ("depth sweep") sobre una arquitectura propietaria denominada RMSN, en este caso con dimensión de modelo D=1024 y 19 capas, lo que arroja una relación Ω=16/19≈0,842. El modelo se publica como base, es decir, sin ajuste fino supervisado ni alineación posterior, y está entrenado únicamente en inglés.

La propuesta técnica del autor no es un transformer convencional, sino un sistema formulado como port-hamiltoniano con estructura metripléctica, orientado a estudiar fenómenos de dinámica no lineal durante el entrenamiento: solitones topológicos, lenguas de Arnold, condensados y un concepto propio denominado "cemento topológico" (topological cement). El modelo se presenta como el tercer atractor de la lengua de Arnold Ω=16/19 y como la topología número 19 de la taxonomía RMSN, bautizada Minimal-Cemented Dual Isolate (MCDI). Su interés es fundamentalmente de investigación: explora cómo la intensidad de la cascada dinámica durante el entrenamiento se correlaciona con el daño en perplejidad sobre texto wiki y sobre cadenas de razonamiento (CoT).

Los datos publicados son escasos y de naturaleza idiosincrásica: el autor reporta wiki_ppl de 72,75 y CoT_ppl de 4356-4357, y compara con dos modelos hermanos del mismo barrido (d19s1 y d19s2). No se documentan resultados en benchmarks estándar (MMLU, HumanEval, GSM8K), ni detalles del dataset de entrenamiento, ni instrucciones de uso. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (port-hamiltoniana con bracket conservativo {·,H} y estructura metripléctica de Morrison [·,S]); D=1024, profundidad=19 |
| Parametros totales | ~271M (el identificador del repo indica 193M; no disponible la cifra exacta y consistente) |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (tamaño del repo: 0,9 GB) |

## Arquitectura y entrenamiento

La arquitectura se describe mediante la ecuación ḟ = {f, H} + [f, S], es decir, un sistema port-hamiltoniano en el que el término {f, H} representa la dinámica conservativa y [f, S] la parte metripléctica disipativa según la formulación de Morrison. El modelo tiene D=1024 y 19 capas, con una relación Ω = D/(M_w × L) = 16/19 ≈ 0,8421, parámetro que el autor sitúa dentro de una "lengua de Arnold". El entrenamiento se realizó durante 100.000 pasos, y el autor describe la trayectoria dinámica como un "transitorio prolongado" (prolonged transient): el exponente de Lyapunov permaneció deriva ndo cerca de cero durante la mayor parte del entrenamiento y terminó asentándose en un valor casi quiescente (-0,001) hacia el paso 100k.

El resultado de esa trayectoria es una configuración de 7 solitones distribuidos en 3 bundles sobre las capas [0, 9, 10, 11, 12, 17, 18], con dos condensados exactos aislados (L11 con PR=1,000 y L18 con PR=1,001) y un "cemento topológico" efectivo M_eff=3, exactamente en el umbral mínimo. El autor sostiene que el nivel de cemento amplifica la antagonía de frustración: con M_eff=3 el daño en CoT es de 4356, frente a 5795 del modelo hermano CDI con M_eff=4, mientras que la perplejidad wiki apenas cambia (72,75 frente a 72,50). No se documentan la composición del dataset, el número de tokens de entrenamiento, ni si hubo RLHF, DPO o SFT; el modelo se publica como base.

## Capacidades

- Generación de texto autoregresiva en inglés, en formato de modelo base sin instrucciones.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso estructurado.
- Capacidad multilingüe limitada al inglés según la model card.
- No se documentan capacidades de visión, audio ni modo "thinking".
- El modelo está diseñado como objeto de estudio para analizar dinámica de entrenamiento (solitones, condensados, cemento topológico), no como asistente de propósito general.
- No se han publicado evaluaciones de capacidad (razonamiento, código, matemáticas) en la información disponible.

## Casos de uso

- Investigación en dinámica de entrenamiento de redes neuronales: el modelo sirve para reproducir y analizar la trayectoria de Lyapunov descrita (transitorio prolongado, asentamiento casi quiescente) y contrastarla con los modelos hermanos d19s1 y d19s2 del mismo barrido.
- Estudio de formación de solitones y condensados: con 7 solitones en 3 bundles y dos condensados exactos aislados en L11 y L18, permite inspeccionar cómo se distribuyen los patrones de representación a lo largo de la profundidad.
- Validación de la hipótesis de "cemento escalado": al compartir posiciones de pines frustrados con CDI pero distinto M_eff (3 frente a 4), es un control experimental natural para medir el efecto del cemento sobre la perplejidad de CoT.
- Comparación de atractores en una lengua de Arnold: junto a d19s1 y d19s2, completa el retrato de los tres atractores de Ω=16/19 desde condiciones iniciales idénticas con distintas semillas.
- Experimentos de ajuste fino supervisado sobre modelos base pequeños: el autor reporta que el modelo hermano d19s1 pasó de CoT_ppl 2714 a 14,16 tras SFT, lo que sugiere usar esta familia como banco de pruebas de SFT a escala ~271M.
- Reproducción académica de arquitecturas no transformer: la formulación port-hamiltoniana metripléctica permite estudiar alternativas a la atención estándar en un modelo de menos de 1 GB de pesos, viable en una sola GPU de consumo para experimentación.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son métricas internas de perplejidad, no benchmarks estándar. Se reproducen a continuación tal cual:

| Modelo | M_eff | Pines frustrados | wiki_ppl | CoT_ppl |
|---|---|---|---|---|
| MCDI d19s3 (este) | 3 | L11 + L18 aislados | 72,75 | 4356-4357 |
| CDI d19s2 | 4 | L11 + L18 aislados | 72,50 | 5795 |
| KAM-TerminalDoublet d19s1 | 1 | no disponible | 67,5 | 2714 (14,16 tras SFT) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, ARC, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con ~271M parámetros, en fp16 los pesos ocuparían aproximadamente 0,54 GB, y en int8/int4 alrededor de 0,27-0,14 GB, pero son estimaciones derivadas del recuento de parámetros, no datos publicados.
- El tamaño del repositorio es de 0,9 GB, lo que sugiere pesos en fp32 o fp16 junto con artefactos adicionales.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU de consumo con al menos 4-8 GB de VRAM debería poder alojar el modelo, pero el autor no lo confirma.
- Cabe en GPU de consumo: probablemente sí por tamaño, aunque no está verificado ni documentado.
- Opciones de despliegue: no disponible. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y al no ser un transformer estándar es probable que requiera código de inferencia propio del autor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| RMSN-193M-MCDI d19s3 (este) | ~271M | no disponible | Apache 2.0 | Modelo base de investigación, arquitectura port-hamiltoniana, solo inglés |
| RMSN d19s1 (KAM-TerminalDoublet) | no disponible | no disponible | no disponible | Mismo barrido, M_eff=1, wiki_ppl 67,5, CoT_ppl 2714 |
| RMSN d19s2 (CDI) | no disponible | no disponible | no disponible | Mismo barrido, M_eff=4, wiki_ppl 72,50, CoT_ppl 5795 |
| Modelos base tipo transformer ~270M (p. ej. GPT-2 small, Pythia-410M) | 124M-410M | 1024-2048 | variable | Referencia de la categoría; no se han publicado comparaciones directas en la información disponible |

No se dispone de comparaciones con modelos de la misma categoría fuera de la familia RMSN en la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste fino ni alineación: no está pensado para uso conversacional directo y probablemente producirá texto incoherente o repetitivo ante prompts de instrucciones.
- Idiomas: únicamente inglés; no se documenta cobertura de castellano ni de otras lenguas.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo.
- Riesgo de alucinación: no evaluado; al ser un modelo base, la generación no está calibrada para factualidad.
- Sesgos: no documentados; el dataset de entrenamiento no se describe, por lo que no se puede evaluar la composición ni los sesgos resultantes.
- Métricas no estándar: los valores de wiki_ppl y CoT_ppl son internos del autor y no comparables con benchmarks públicos; no hay MMLU, HumanEval ni GSM8K.
- Ambigüedad en el recuento de parámetros: el identificador del repositorio indica 193M mientras la model card afirma ~271M; conviene verificar antes de dimensionar infraestructura.
- Terminología idiosincrásica: conceptos como "cemento topológico", "lengua de Arnold" o "solitones" no cuentan con validación externa en la información disponible; deben tratarse como hipótesis del autor.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no está validado para producción y no hay garantías de calidad.
- Compatibilidad de despliegue incierta: al no ser un transformer estándar, es posible que no funcione con las herramientas habituales de inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-193M-MinimalCementedDualIsolate-D1024d19s3-Base
- Modelos hermanos del barrido: no se han proporcionado URLs directas en la información disponible (referenciados como d19s1 y d19s2)
- Paper, blog o repositorio del autor: no disponible
- Demos: no disponible
