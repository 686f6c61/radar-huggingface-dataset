# DuoNeural/RMSN-193M-DeepMidAdjacentConduit-D1024d16s3-Base

## Resumen

RMSN-193M-DeepMidAdjacentConduit-D1024d16s3-Base es un modelo base de aproximadamente 193 millones de parametros desarrollado por DuoNeural Lab (Aura, Archon y Jesse Kuhl) y publicado en Hugging Face en noviembre de 2026. Se enmarca en la serie de investigacion RMSN, una familia de modelos experimentales que explora formulaciones port-hamiltonianas del aprendizaje automatico en lugar de la arquitectura transformer convencional. El modelo emplea una formulacion dinamica basada en un corchete conservativo y un termino metriplectico de Morrison, con dimension D=1024, profundidad 16 y 64 slots.

El modelo introduce la topologia Deep-Mid Adjacent Conduit (DMAC), la duodecima topologia observada en el entrenamiento RMSN, y se presenta como demostracion de la "Silent Pathway Stochasticity": con la misma configuracion (D=1024, profundidad 16, paridad EVEN) y distintas semillas se obtienen topologias diferentes dentro del mismo atractor. Este ejemplar corresponde a la semilla 3.

Su relevancia es fundamentalmente de investigacion: no es un modelo de produccion ni un asistente conversacional, sino un artefacto experimental para estudiar topologias de condensacion, densidad de anclajes y su relacion con el rendimiento en perplejidad de cadena de pensamiento (CoT_ppl). El autor lo situa como candidato a mejor base para experimentos de fine-tuning SFT por su elevada densidad de anclajes (3,954), aunque no se han publicado resultados de SFT para este modelo concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN port-hamiltoniana (corchete conservativo + termino metriplectico de Morrison), D=1024, profundidad 16, 64 slots |
| Parametros totales | ~193M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La arquitectura se describe mediante la ecuacion ḟ = {f, H} + [f, S], donde {·,H} es un corchete conservativo port-hamiltoniano y [·,S] un termino metriplectico de Morrison. El modelo tiene dimension de representacion D=1024, profundidad 16 capas y 64 slots, con un total de aproximadamente 193 millones de parametros. La configuracion de paridad es EVEN, con ratio de paridad 16, y el parametro de resonancia Ω = D/(M_w × L) toma valor 1.0 (resonancia unitaria). El comportamiento de Lyapunov se mantiene estable durante todo el entrenamiento, sin cascada.

El entrenamiento se realizo durante 100.000 pasos con la semilla 3. La topologia resultante, DMAC, presenta un condensado exacto aislado en L8 (PR=1.000), un par adyacente en L11 (PR=1.000) y L12 (PR=1.001) que constituye un unico grado de libertad de fibrado, y solitones en L0 (PR=5.592), L10 (PR=2.905), L13 (PR=4.260) y L15 (PR=5.089). El conduit en L11-L12 se situa al 68-75% de la profundidad de la red. La fuerza de anclaje medida es de 3,954, la mas alta registrada en la serie RMSN. No se detalla la composicion del dataset de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto base en ingles: el modelo es un modelo base, sin ajuste instructivo documentado.
- Razonamiento en cadena de pensamiento (CoT): la metrica CoT_ppl=2801 se presenta como indicador de capacidad de razonamiento encadenado dentro de la serie RMSN.
- Modelado de lenguaje general: wiki_ppl=75.76 sobre el corpus de evaluacion del autor.
- Capacidad multilingue: limitada al ingles segun la model card.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad de producto; el tag "cot-reasoning" es de investigacion.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Investigacion en arquitecturas alternativas al transformer: el modelo sirve como artefacto reproducible para estudiar formulaciones port-hamiltonianas y comparar su dinamica con la de transformers de tamano similar.
- Estudio de topologias de condensacion: permite analizar la topologia DMAC (condensado aislado en L8, par adyacente L11-L12) y contrastarla con las otras once topologias de la serie RMSN.
- Experimentos de fine-tuning SFT: el autor lo propone como base candidata por su elevada densidad de anclajes (3,954), la mayor medida en la familia; los resultados de SFT estan pendientes.
- Reproducibilidad y estudio de semillas: al ser la semilla 3 de una configuracion concreta, permite comparar con las semillas 1 y 2 para investigar la estocasticidad de la via silenciosa.
- Evaluacion de perplejidad en CoT: util como referencia para medir CoT_ppl en tareas de razonamiento encadenado dentro de un pipeline de evaluacion propio.
- Docencia y divulgacion: ejemplo didactico de dinamica hamiltoniana aplicada a redes neuronales, con metricas y topologia documentadas de forma explicita.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| wiki_ppl | 75.76 | Perplejidad sobre wiki en la evaluacion del autor |
| CoT_ppl | 2801 | Puesto #4 historico en la serie RMSN |
| Fuerza de anclaje | 3.954 | La mas alta medida en RMSN |
| Ω | 1.0 | Resonancia unitaria |
| Lyapunov | Estable | Sin cascada durante el entrenamiento |

Comparativa interna de CoT_ppl en la serie RMSN segun el autor:

| Modelo | CoT_ppl | Topologia |
|---|---|---|
| d18 Continuous Conduit | 2641 (#1) | L9/L10/L11 |
| d1152 MNAC | 2714 (#2) | L6/L7 (40%) |
| d16s2 Terminal Funnel | 2756 (#3) | L4+L11+funnel |
| d16s3 DMAC (este) | 2801 (#4) | L08+L11-L12 (68-75%) |
| mw80 Deep Terminal Dual | 2911 (#5) | L13+L14 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para un modelo de ~193M de parametros, una estimacion orientativa en fp16 seria de aproximadamente 0,4 GB de pesos, y en int8 de aproximadamente 0,2 GB, sin contar overhead de activaciones ni cache.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: por tamano, si, en cualquier GPU consumer moderna con al menos 2-4 GB de VRAM, aunque no hay confirmacion oficial de compatibilidad.
- Opciones de despliegue: no disponible. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ni el formato de pesos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CoT_ppl | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d16s3 DMAC (este) | ~193M | no disponible | 2801 | Apache 2.0 | Hugging Face |
| d16s2 Terminal Funnel | no disponible | no disponible | 2756 | no disponible | serie RMSN de DuoNeural |
| d1152 MNAC | no disponible | no disponible | 2714 | no disponible | serie RMSN de DuoNeural |
| d18 Continuous Conduit | no disponible | no disponible | 2641 | no disponible | serie RMSN de DuoNeural |

No se dispone de comparacion con modelos de proposito general de tamano similar (por ejemplo, familias de ~200M parametros) porque la informacion proporcionada solo incluye comparativas internas de la serie RMSN.

## Limitaciones y advertencias

- Modelo base sin ajuste instructivo: no esta pensado para uso conversacional directo ni para seguir instrucciones sin fine-tuning previo.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta documentado.
- Sin benchmarks estandar: no hay resultados de MMLU, HumanEval, GSM8K ni similares, por lo que no se puede evaluar su calidad frente a modelos convencionales.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje; no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados en la model card.
- Resultados de SFT pendientes: la prediccion de que sea la mejor base para SFT es una hipotesis del autor, no un resultado verificado.
- Longitud de contexto y formato de pesos no disponibles: dificulta planificar el despliegue en produccion.
- Uso comercial: la licencia Apache 2.0 lo permite, pero al tratarse de un artefacto de investigacion sin validacion practica, su idoneidad para produccion no esta demostrada.
- Metricas no estandar: wiki_ppl y CoT_ppl son metricas propias del autor y no son directamente comparables con perplejidades de otros modelos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuoNeural/RMSN-193M-DeepMidAdjacentConduit-D1024d16s3-Base
- Citacion del autor (BibTeX): incluida en la model card, referencia "Deep-Mid Adjacent Conduit Topology and Silent Pathway Stochasticity in RMSN", DuoNeural Lab, 2026.
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
