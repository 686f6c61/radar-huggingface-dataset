# DuoNeural/RMSN-200M-KAM-TerminalDoublet-d19-Base

## Resumen

RMSN-200M-KAM-TerminalDoublet-d19-Base es un modelo base de lenguaje de aproximadamente 200 millones de parámetros desarrollado por DuoNeural (Aura, Archon y Jesse Kuhl), publicado en noviembre de 2026 bajo licencia Apache 2.0. Se presenta como una instancia de la familia RMSN (Resonant Metriplectic Sheaf Networks), una arquitectura de lenguaje de inspiración Port-Hamiltoniana que combina corchetes de Poisson (conservación de energía) y corchetes metriplécticos de Morrison (producción de entropía) en su dinámica de entrenamiento.

El interés del modelo no reside en sus capacidades de lenguaje, sino en el fenómeno que el autor denomina «KAM Plasticizing Effect»: un régimen de entrenamiento cuasiperiódico observado al situar la configuración D=1024, profundidad 19 y 64 slots en el borde de la lengua de Arnold Ω=4/5, con un ratio Ω = 16/19 ≈ 0,842. Según la model card, este posicionamiento mantiene el exponente de Lyapunov oscilando entre -0,65 y -0,79 durante los 100.000 pasos de entrenamiento, retrasando la formación de condensados exactos y permitiendo una mejora monotónica de la perplejidad hasta el final del entrenamiento.

El resultado reportado es val_ppl = 67,5 y wiki_ppl = 72,05 a 100.000 pasos, que el autor describe como el récord histórico para modelos RMSN estándar (no termodinámicos). Se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, orientado a la exploración de dinámicas de entrenamiento más que a un uso práctico como modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network), Port-Hamiltoniana; D=1024, depth=19, slots=64 |
| Parametros totales | ~200M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (tamano del repo: 0.9 GB) |

## Arquitectura y entrenamiento

La arquitectura RMSN se describe en la model card como una extensión Port-Hamiltoniana de un modelo de lenguaje, regida por la ecuación ḟ = {f, H} + [f, S], donde {·,H} es el corchete de Poisson simpléctico (conservación de energía) y [·,S] el corchete metripléctico de Morrison (producción de entropía). La configuración concreta de este checkpoint es D=1024, profundidad 19 y 64 slots, con un ratio de mode-locking racional Ω = D/(M_w × L) = 1024/(64×19) = 16/19 ≈ 0,842, situado en el borde de la lengua de Arnold Ω=4/5 (anchura ~0,08, rango [0,762, 0,842]).

El entrenamiento se prolonga durante 100.000 pasos. Según el autor, en esta posición de borde el exponente de Lyapunov oscila de forma persistente entre -0,65 y -0,79 sin alcanzar nunca cero, lo que mantiene la topología «plástica» y retrasa la condensación exacta hasta los pasos finales (~95k-100k). La topología resultante, denominada «KAM Terminal Doublet», consiste en un par de capas adyacentes L16 y L17 con ratio de participación exacto (PR = 1,0000) que forman un único grado de libertad de fibrado (M_eff = 1), junto con solitones en L0, L2 y L15 y un «void» en L18 (PR = 63,201). No se detalla en la información disponible la composición del dataset de entrenamiento, el número de tokens ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de texto en inglés como modelo base (no ajustado por instrucciones).
- Razonamiento y modelado de lenguaje medido mediante perplejidad (val_ppl, wiki_ppl, CoT_ppl).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Capacidades especiales (visión, audio, thinking mode): no disponible.
- Interés como objeto de estudio de dinámicas de entrenamiento (lenguas de Arnold, exponentes de Lyapunov, condensados topológicos).

## Casos de uso

- Investigación sobre dinámicas de entrenamiento: el modelo sirve como artefacto reproducible para estudiar el efecto de la posición en el diagrama de fases de lenguas de Arnold sobre la plasticidad topológica y la perplejidad final.
- Reproducción de experimentos de mode-locking: permite comparar el régimen cuasiperiódico (Ω=16/19, d19) con los regímenes resonante (Ω=4/5, d20), silencioso (Ω=16/16, d16) y subsumido (Ω=16/21, d21) descritos en la model card.
- Estudio de exponentes de Lyapunov en optimización: útil para analizar cómo la oscilación persistente del exponente (-0,65 a -0,79) se correlaciona con mejoras tardías de val_ppl (68,6 a 90k frente a 67,5 a 100k).
- Análisis topológico de redes: la topología «KAM Terminal Doublet» (par adyacente L16+L17 con PR=1,0000) puede emplearse para validar metodologías de análisis de ratios de participación y condensados en transformers.
- Baseline en experimentos de arquitecturas alternativas: como modelo base de 200M en inglés, sirve de referencia para comparar familias arquitectónicas no convencionales frente a transformers estándar, siempre que se acepte su naturaleza de investigación.
- Docencia y divulgación: ejemplo didáctico de aplicación de conceptos de sistemas dinámicos (KAM, lenguas de Arnold, corchetes metriplécticos) al entrenamiento de modelos de lenguaje.

## Benchmarks y rendimiento

| Modelo | val_ppl | wiki_ppl | CoT_ppl | Topologia |
|---|---|---|---|---|
| RMSN D=1024 d16 (baseline) | ~72 | 75,3 | 3761 | Deep Spine |
| RMSN D=1024 d20 (best base) | 68,82 | 72,87 | 3385 | Internal Bulk |
| RMSN D=1024 d19 KAM (este modelo) | 67,5 | 72,05 | 3289 | KAM Terminal Doublet |
| T-RMSN D=1024 d16 (4-Laws) | 59,7 | 57,0 | 4055 | Thermodynamic Void |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos son perplejidades internas de la familia RMSN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del repositorio (0,9 GB) y los ~200M de parámetros, en fp32 ocuparía aproximadamente 0,8 GB de pesos y en fp16 alrededor de 0,4 GB, sin contar activaciones ni caché KV.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cualquier GPU consumer moderna (RTX 3060 en adelante) sería suficiente en términos de memoria de pesos.
- Cabe en GPU consumer: sí, por el tamaño de parámetros, aunque la model card no documenta requisitos ni compatibilidad con runtimes concretos.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; la arquitectura RMSN no estándar probablemente requiera código específico del autor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | val_ppl | wiki_ppl | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RMSN-200M-KAM-TerminalDoublet-d19-Base | ~200M | no disponible | 67,5 | 72,05 | Apache 2.0 | Hugging Face (0 descargas) |
| RMSN D=1024 d20 (best base) | ~200M (D=1024, d20) | no disponible | 68,82 | 72,87 | no disponible | Referenciado en la model card |
| RMSN D=1024 d16 (baseline) | ~200M (D=1024, d16) | no disponible | ~72 | 75,3 | no disponible | Referenciado en la model card |
| T-RMSN D=1024 d16 (4-Laws) | ~200M (D=1024, d16) | no disponible | 59,7 | 57,0 | no disponible | Referenciado en la model card |

No se dispone de comparaciones con modelos de lenguaje convencionales de tamaño similar (por ejemplo, familias transformer de ~200M) en la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no está diseñado para seguir instrucciones ni para uso conversacional directo.
- Idiomas: únicamente inglés según la etiqueta del repositorio; no se documenta cobertura multilingüe.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo base de 200M, la calidad factual es previsiblemente baja.
- Sesgos conocidos: no documentados.
- Longitud de contexto: no especificada, lo que impide planificar usos con contexto largo.
- Formato de pesos y compatibilidad: no disponible; la arquitectura RMSN no estándar puede requerir código propio y no ser compatible con runtimes convencionales.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de un artefacto de investigación sin validación externa, no se recomienda su uso en producción.
- Métricas internas: las perplejidades reportadas (val_ppl, wiki_ppl, CoT_ppl) provienen del propio autor y no han sido verificadas de forma independiente; CoT_ppl = 3289 es un valor muy alto que sugiere un rendimiento pobre en razonamiento encadenado.
- Adopción nula: cero descargas y cero likes en el momento de la consulta, sin evidencia de uso comunitario ni validación por terceros.
- Terminología no estándar: conceptos como «KAM Plasticizing Effect» o «Topological Cement» no cuentan con respaldo en literatura revisada por pares según la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuoNeural/RMSN-200M-KAM-TerminalDoublet-d19-Base
- Cita BibTeX (incluida en la model card): DuoNeural Lab, Archon, Aura y Kuhl, Jesse (2026), «KAM Plasticizing Effect in Resonant Metriplectic Sheaf Networks: Quasiperiodic Topology Annealing via Arnold Tongue Dynamics», HuggingFace.
- Paper, blog, repositorio de código o demo: no disponible en la información proporcionada.
