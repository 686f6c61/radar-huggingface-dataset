# MatterWaveAI/helmholtz-1

## Resumen

HELMHOLTZ-1 es un modelo experimental desarrollado por MatterWaveAI que se presenta como una arquitectura predictiva de embedding conjunto (JEPA) puramente rotacional, denominada GRT-JEPA, combinada con un modelo de mundo causal. A diferencia de los modelos autorregresivos convencionales, no predice tokens superficiales fragmento a fragmento, sino estados latentes multi-paso, apoyándose en el marco teórico de la "Platonic Representation Theorem" (arXiv:2610.39302) citado por el autor. El modelo se construye sobre el checkpoint base MatterWaveAI/grt-30m mediante fine-tuning.

La propuesta técnica central es resolver el colapso de representación típico de los JEPA euclídeos sin recurrir a negativos contrastivos ni a penalizaciones de covarianza: cada bloque del codificador y del predictor es una cascada de rotaciones ortogonales (det(R) = +1) sobre SO(D), de modo que las distancias angulares y el rango de covarianza se preservan por construcción geométrica. El autor declara aproximadamente 46,1 M de parámetros almacenados y una capacidad densa equivalente de unos 115 M, sin capas nn.Linear ni nn.Conv1d/nn.Conv2d.

Es relevante ahora como artefacto de investigación sobre representaciones latentes, planificación en espacio latente y modelos de mundo causales, más que como modelo de generación de texto listo para producción. La información pública disponible es escasa: cero descargas, cero likes, sin idiomas declarados y sin resultados de benchmarks estándar de NLP (MMLU, HumanEval, GSM8K) en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRT-JEPA: transformer rotacional ortogonal (12 bloques rotacionales), sin capas nn.Linear ni nn.Conv1d/nn.Conv2d; modelo de mundo causal latente |
| Parametros totales | ~46,1 M almacenados (~115 M de capacidad densa equivalente, según el autor) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers; formato exacto no confirmado en la información disponible) |

## Arquitectura y entrenamiento

La arquitectura se describe como un JEPA ortogonal sin colapso: el codificador y el predictor procesan vistas de contexto y de objetivo a través de 12 bloques de rotación ortogonal, y la predicción se realiza directamente en espacio latente sin decodificar tokens intermedios. La actualización de las representaciones objetivo sigue geodésicas exactas del grupo de Lie en lugar de medias ponderadas euclídeas, lo que según el autor mantiene det(R) = +1,000000 con una deriva de ortogonalidad de 1,42e-14 tras 100 pasos y una retención de rango efectivo del 99,4 % sin negativos contrastivos. El entrenamiento emplea un currículo de cinco niveles denominado Helmholtz–Huygens Wave-Cavity, con el optimizador HuygensSymplecticAdam, que equilibra la energía de predicción latente con la dispersión de fase circular.

El régimen de datos se basa en alineamiento multi-vista "platónico": cinco perspectivas observacionales/socráticas por concepto (GLOSS, SEE, SAY, DO, KNOW) más pares de reformulación cruzada, en lugar de fragmentos adyacentes de tokens. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. Entre las capacidades técnicas declaradas destacan los rollouts latentes multi-paso (H = 1..10), la dinámica inversa analítica sin pasos de gradiente, los contrafactuales no conmutativos y la planificación por control predictivo de modelo (MPC) sobre geodésicas.

## Capacidades

- Predicción de estados latentes multi-paso en espacio latente, sin decodificación de tokens intermedios.
- Rollouts de modelo de mundo causal con H = 1 a 10 saltos y deriva de norma declarada de 1,19e-7 tras 10 saltos.
- Dinámica inversa analítica: recuperación de la acción o transición causal entre dos estados en forma cerrada, sin optimización iterativa.
- Contrafactuales no conmutativos: sensibilidad al orden de las acciones (do(a₂ ∘ a₁) ≠ do(a₁ ∘ a₂)).
- Planificación por MPC con búsqueda geodésica multi-salto desde un estado inicial hasta un objetivo.
- Puerta de plausibilidad basada en energía para distinguir transiciones causales válidas de transiciones corruptas o imposibles.
- Alineamiento multi-vista de representaciones (perspectivas SEE, DO, SAY, GLOSS, KNOW).
- Generación de texto: la model card declara pipeline_tag text-generation, pero no se documentan capacidades de generación de lenguaje natural, tool calling, agentes ni multilingüismo.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Investigación en representaciones latentes: reproducción de los experimentos de retención de rango y deriva de ortogonalidad para estudiar el colapso de representación en JEPA sin negativos contrastivos.
- Planificación en espacio latente: uso del MPC geodésico declarado para resolver tareas de búsqueda de camino entre estados en entornos simulados de baja dimensión, evitando el coste de decodificar tokens.
- Modelado de mundo en robótica o control: los rollouts multi-paso y la dinámica inversa analítica permiten estimar transiciones de estado y recuperar acciones sin pasos de gradiente, útil en bucles de control con presupuesto computacional ajustado.
- Análisis de causalidad y orden de acciones: los contrafactuales no conmutativos permiten estudiar si el orden de las intervenciones altera el resultado, en escenarios de simulación de políticas o de diagnóstico de sistemas.
- Detección de transiciones anómalas: la puerta de plausibilidad energética puede emplearse para separar secuencias válidas de secuencias corruptas en datos de series temporales o trayectorias.
- Evaluación comparativa de regímenes de datos: el marco "good-view" frente a "bad-view" permite medir con mKNN, CKA y Procrustes el efecto de la composición del dataset en la calidad de las representaciones.
- Prototipado académico de arquitecturas sin capas lineales: sirve como referencia reproducible de un transformer construido íntegramente con rotaciones ortogonales para cursos y papers.

## Benchmarks y rendimiento

Los datos publicados por el autor son verificaciones internas de invariantes y axiomas del modelo, no benchmarks estándar de NLP. No se han publicado resultados de MMLU, HumanEval, GSM8K ni similares en la información disponible.

| Prueba interna | Objetivo | Resultado declarado |
|---|---|---|
| Capas nn.Linear / nn.Conv* | 0 / 0 | 0 / 0 (100 % ortogonal) |
| Resistencia al colapso (sin negativos, sin VICReg) | ≥ 85,0 % retención de rango | 99,4 % (23,62 / 23,76 erank) |
| Deriva de ortogonalidad EMA geodésica a 100 pasos | < 1e-6 | 1,42e-14 (det = +1,000000) |
| Preservación de distancias por pares en la cascada | < 1e-6 | 7,11e-15 |
| Predicción de estado latente (pool de 50 candidatos) | ≥ 98,0 % | 100,0 % (50/50 Top-1) |
| Planificación MPC latente (H = 2) | Recuperación exacta de cadena | 100,0 % (d_geo = 0,0041) |
| Axioma 1: abstracción de estado latente | Estabilidad de norma | 100,0 % válido (deriva 1,19e-7) |
| Axiomas 2 y 3: rollout multi-salto (H = 1, 2, 3, 5) | Predicción latente sin decodificar | 100,0 % Top-1 (cos = 1,0000) |
| Axioma 3: estabilidad a H = 10 | Deriva de norma espectral | 1,19e-7 |
| Axioma 4A: dinámica inversa analítica | Inferir a_t desde (s_t, s_{t+1}) | 100,0 % Top-1 (error 8,43e-8) |
| Axioma 4B: contrafactuales no conmutativos | Sensibilidad al orden | 100,0 % (divergencia 2,65) |
| Axioma 5A: puerta de plausibilidad energética | Separación válido/corrupto | 100,0 % (margen 15,42) |
| Axioma 5B: planificación geodésica | Recuperación de camino causal | 100,0 % |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con ~46,1 M de parámetros almacenados, en fp32 ocuparía aproximadamente 185 MB de pesos y en fp16 unos 92 MB; estas cifras son estimaciones por tamaño, no datos publicados por el autor.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer moderna (RTX 3060 en adelante) sería suficiente para alojar los pesos, pero no se documentan requisitos de memoria para los rollouts latentes ni para la planificación MPC.
- Cabe en GPU consumer: sí, por el tamaño de parámetros indicado; sin confirmación oficial de requisitos de contexto o de memoria de activaciones.
- Opciones de despliegue: la model card declara compatibilidad con transformers y endpoints_compatible. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estándar ni de especificaciones de contexto que permitan una comparación cuantitativa fiable con alternativas. La comparación se limita a características arquitectónicas declaradas.

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| HELMHOLTZ-1 | GRT-JEPA rotacional, sin capas lineales | ~46,1 M almacenados (~115 M densos equivalentes) | no disponible | apache-2.0 | Modelo de mundo latente y JEPA |
| MatterWaveAI/grt-30m | GRT (modelo base del fine-tuning) | no disponible | no disponible | no disponible | Transformer rotacional base |
| JEPA euclídeo convencional (referencia genérica) | JEPA con nn.Linear | no disponible | no disponible | no disponible | Predicción latente con estabilización por stop-gradient |
| Modelo autorregresivo de ~50 M parámetros (referencia genérica) | Transformer decoder | ~50 M | no disponible | variable | Generación de texto token a token |

No se identifican en la información proporcionada modelos comparables concretos de la misma categoría con datos públicos de rendimiento.

## Limitaciones y advertencias

- Ausencia total de benchmarks estándar de NLP: no hay resultados de MMLU, HumanEval, GSM8K ni evaluaciones de generación de texto, pese a estar etiquetado como text-generation.
- Los resultados publicados son verificaciones internas de invariantes geométricos y axiomas definidos por el propio autor, no evaluaciones independientes ni comparaciones con líneas base externas.
- Cero descargas y cero likes en Hugging Face en el momento de la consulta: no hay evidencia de uso comunitario ni de validación por terceros.
- Idiomas soportados no declarados; no se puede garantizar calidad en castellano ni en ningún otro idioma.
- Longitud de contexto no documentada, lo que impide evaluar su idoneidad para conversaciones multi-turno o documentos largos.
- Riesgo de alucinación no evaluado; al ser un modelo de mundo latente sin decodificación de tokens documentada, su comportamiento como generador de texto es incierto.
- Sesgos no documentados: no se describe la composición del dataset de entrenamiento ni procesos de alineación (RLHF/DPO).
- La licencia apache-2.0 permite uso comercial, pero la madurez del modelo (experimental, sin validación externa) desaconseja su uso en producción sin evaluación previa.
- Las afirmaciones sobre eficiencia de muestreo (más de 40×) y sobre el teorema de representación platónica provienen de un artículo citado por el autor (arXiv:2610.39302) y no han sido verificadas de forma independiente en la información disponible.
- No se documenta soporte de tool calling, agentes ni function calling, pese a la etiqueta de pipeline text-generation.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/helmholtz-1
- Modelo base: https://huggingface.co/MatterWaveAI/grt-30m
- Paper citado (Platonic Representation Theorem): https://arxiv.org/abs/2610.39302
- Helmholtz AI (organización homónima, sin relación confirmada con MatterWaveAI): https://www.helmholtz.ai/
