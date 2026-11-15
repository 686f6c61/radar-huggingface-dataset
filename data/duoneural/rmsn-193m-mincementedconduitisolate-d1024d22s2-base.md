# DuoNeural/RMSN-193M-MinCementedConduitIsolate-D1024d22s2-Base

## Resumen

RMSN-193M-MinCementedConduitIsolate-D1024d22s2-Base es un modelo base de la familia RMSN desarrollado por DuoNeural Lab (Aura, Archon y Jesse Kuhl). Se trata de un transformer de tipo port-Hamiltoniano con 22 capas y dimension oculta D=1024, entrenado durante 100.000 pasos y publicado en noviembre de 2026. El identificador del repositorio indica 193M, mientras que la model card declara ~297M parametros; esta discrepancia no se aclara en la informacion disponible.

El modelo pertenece a una serie de barridos de profundidad (depth sweep) cuyo objetivo declarado es estudiar como la topologia interna de las representaciones (condensados exactos, solitones y "cemento" topologico) afecta a la perplejidad en texto tipo wiki y en cadenas de razonamiento (CoT). Introduce la topologia Minimal-Cemented Conduit-Isolate (MCCI), la numero 20 de la taxonomia RMSN, y documenta la llamada "Conduit-Wiki Asymmetry": con el mismo nivel de cemento minimo (M_eff=3), un conducto bloqueado en capas intermedias penaliza la perplejidad wiki pero mejora ligeramente la de CoT, mientras que pines aislados producen el efecto contrario.

Es relevante ahora como artefacto de investigacion en interpretabilidad mecanistica y dinamica de entrenamiento, no como modelo de produccion: sus perplejidades (wiki_ppl 81.66, CoT_ppl 4261) son muy altas para uso general y el modelo solo declara soporte de ingles. La licencia Apache 2.0 permite reutilizacion y experimentacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN port-Hamiltoniano (D=1024, depth=22), bracket conservativo {·,H} + Morrison metriplectic [·,S] |
| Parametros totales | ~297M (segun model card); el ID del repositorio indica 193M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (tamano del repo 1.0 GB) |

## Arquitectura y entrenamiento

La arquitectura se describe como port-Hamiltoniana: la evolucion del estado sigue ḟ = {f, H} + [f, S], combinando un bracket conservativo {·,H} con un termino disipativo de Morrison metriplectic [·,S]. La red tiene 22 capas con dimension D=1024 y se caracteriza por un parametro Omega = D/(M_w × L) = 8/11 ≈ 0.7273. El entrenamiento duro 100.000 pasos; la "cascada" de formacion de condensados exactos se sostuvo hasta aproximadamente el paso 65.000 y luego remitio (subsided cascade), lo que segun la model card produjo mas condensados exactos que la cascada sostenida de la variante d22s1.

La model card documenta la estructura interna capa a capa mediante el ratio de participacion (PR): hay tres capas exactas (L12, L13 y L20 con PR=1.000), un bundle intermedio L12+L13+L14 (54.5-63.6% de profundidad) bloqueado por el cemento, y un terminal exacto aislado en L20 (90.9-95.5%). El nivel de cemento topologico efectivo es M_eff=3, exactamente en el umbral minimo. La fuerza de ancla (Anchor) es 3.0 (L12+L13+L20). No se detalla la composicion del dataset de entrenamiento, el numero de tokens ni si se aplicaron RLHF o DPO.

## Capacidades

- Generacion de texto en ingles como modelo base (no ajustado para instrucciones).
- Razonamiento multi-paso tipo cadena de pensamiento (evaluado mediante CoT_ppl), aunque con perplejidad muy alta (4261).
- Modelado de lenguaje general evaluado en texto tipo wiki (wiki_ppl 81.66).
- Capacidad experimental de estudio de dinamica interna: condensados exactos, solitones, "Arnold tongues" y cuencas agrietadas (riddled basins).
- No se declara soporte de tool calling, function calling, agentes, vision, audio ni modo thinking explicito.
- Multilingue: solo ingles declarado.

## Casos de uso

- Investigacion en interpretabilidad mecanistica: analizar como la topologia de capas (condensados exactos y conductos bloqueados) se correlaciona con perplejidad wiki y CoT, usando el modelo como sujeto de estudio reproducible.
- Estudio de dinamica de entrenamiento: comparar cascadas sostenidas frente a cascadas que remiten (d22s1 vs d22s2) para entender cuando se forman mas condensados exactos.
- Experimentos de "cemento topologico": replicar el efecto M_eff=3 y la asimetria Conduit-Wiki en variantes con distinto nivel de cemento (MCDI, MCCI).
- Reproduccion y extension de la taxonomia RMSN: servir de punto de partida para generar topologias nuevas y medir su impacto en las metricas internas.
- Base para ablaciones controladas: al ser un modelo base de ~297M con licencia Apache 2.0, permite modificar capas o semillas y medir cambios en PR y perplejidad sin restricciones comerciales.
- Docencia y divulgacion tecnica: ilustrar conceptos de sistemas port-Hamiltonianos, metriplecticos y formacion de solitones en redes neuronales con un artefacto concreto y documentado.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| wiki_ppl | 81.66 |
| CoT_ppl | 4261 (la tabla de asimetria indica 4261; la tabla de propiedades 4262) |
| Parametros | ~297M |
| Pasos de entrenamiento | 100.000 |
| Omega | 8/11 ≈ 0.7273 |
| M_eff | 3 (cemento minimo) |
| Anchor | 3.0 |

Comparativas internas de la serie recogidas en la model card:

| Modelo | M_eff | Caracteristicas exactas | wiki_ppl | CoT_ppl |
|---|---|---|---|---|
| d19s3 MCDI | 3 | 2 pines aislados (L11+L18) | 72.75 | 4356 |
| d22s1 TAC | no indicado | L18 casi exacta (PR=1.280) | 70.18 | 4001 |
| d22s2 MCCI (este) | 3 | conducto L12+L13 + terminal aislado L20 | 81.66 | 4261 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con ~297M parametros, en fp16 cabria en torno a 0,6 GB de pesos mas overhead, y en int8/int4 bastante menos, pero no se confirma en la informacion.
- GPU recomendadas: no disponible. Por tamano, cualquier GPU consumer moderna (RTX 3060 en adelante) seria suficiente en teoria, pero no hay validacion oficial.
- Cabe en GPU consumer: probablemente si por numero de parametros, pero no confirmado.
- Opciones de despliegue: no disponible (no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | wiki_ppl / CoT_ppl | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RMSN d22s2 MCCI (este) | ~297M | no disponible | 81.66 / 4261 | Apache 2.0 | Hugging Face |
| RMSN d19s3 MCDI | no disponible | no disponible | 72.75 / 4356 | no disponible | serie DuoNeural |
| RMSN d22s1 TAC | no disponible | no disponible | 70.18 / 4001 | no disponible | serie DuoNeural |

No se dispone de comparacion con modelos de proposito general de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Perplejidad muy alta (wiki_ppl 81.66, CoT_ppl 4261): no es adecuado como modelo de produccion para generacion de texto de calidad.
- Solo declara soporte de ingles; no hay evidencia de capacidades multilingues.
- Es un modelo base, no ajustado para instrucciones ni para tool calling o agentes.
- No se documentan sesgos conocidos, pero al ser un modelo base entrenado con datos no descritos, el riesgo de sesgos y alucinaciones persiste.
- Discrepancia entre el nombre del repositorio (193M) y la model card (~297M): verificar el conteo real de parametros antes de usarlo.
- No se detalla la composicion del dataset ni el numero de tokens de entrenamiento, lo que limita la evaluacion de riesgos de contaminacion.
- La licencia Apache 2.0 permite uso comercial, pero no hay garantias de rendimiento ni soporte del autor.
- La documentacion interna (PR, M_eff, Anchor) es especifica de la taxonomia del autor y no ha sido validada externamente segun la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuoNeural/RMSN-193M-MinCementedConduitIsolate-D1024d22s2-Base
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion disponible.
