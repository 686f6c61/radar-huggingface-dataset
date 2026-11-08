# MatterWaveAI/helmholtz-omni-b0.7.0-20m

## Resumen

HELMHOLTZ-Omni-b0.7.0-20m es un modelo multimodal compacto desarrollado por MatterWaveAI que se presenta como una arquitectura predictiva de embeddings conjuntos (JEPA) de cinco modalidades dentro de un unico espacio de fase ortogonal compartido. Integra texto, vision, audio, sintesis de voz a 16 kHz y rejillas espaciales 2D, con un total de aproximadamente 34,7 millones de parametros almacenados y una capacidad equivalente densa declarada de unos 86 millones. Se construye sobre el modelo base MatterWaveAI/helmholtz-jepa-b0.7.0-20m y forma parte de la familia HELMHOLTZ-1-Omni.

La propuesta tecnica del modelo es inusual: segun la model card, no emplea matrices lineales densas ni capas convolucionales, sino una arquitectura de transformer rotacional que proyecta todas las modalidades sobre una variedad mundial compartida libre de colapso. El modelo se posiciona como un "world model" y juez de trayectorias cross-modales, orientado a la alineacion de representaciones y a la verificacion de razonamiento mas que a la generacion de texto convencional.

Es relevante ahora porque MatterWaveAI esta publicando de forma escalonada una pila de modelos rotacionales (helmholtz-1, helmholtz-1-omni, helmholtz-mamba-1, helmholtz-rnn-1) y este modelo representa el escalon de 20M de esa familia. Sin embargo, la propia model card advierte de que los pesos, los detalles de implementacion y el codigo fuente estan retenidos durante el ciclo de publicacion escalonada, lo que limita severamente su uso practico inmediato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer rotacional multimodal (Omni-JEPA), sin matrices lineales densas ni capas convolucionales |
| Parametros totales | ~34,7M almacenados (~86M de capacidad equivalente densa declarada) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (pesos retenidos durante el ciclo de publicacion) |

## Arquitectura y entrenamiento

La arquitectura se describe como un Joint-Embedding Predictive Architecture (JEPA) rotacional que unifica cinco modalidades (texto, vision, audio ASR, estado de vocoder TTS a 16 kHz y rejillas espaciales 2D) junto con cinco perspectivas de razonamiento socratico (GLOSS, SEE, SAY, DO, KNOW). El modelo afirma alinear 2.500 representaciones de concepto-modalidad y 2.500 de concepto-vista sobre una variedad mundial compartida, con un total de 5.000 representaciones evaluadas. La model card menciona un espacio de fase ortogonal compartido y una alineacion SO(D) con determinante +1.0000, pero no detalla la implementacion concreta del transformer rotacional ni el mecanismo de recurrencia.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La model card indica explicitamente que los pesos, los detalles de implementacion arquitectonica y el codigo fuente se retienen durante el ciclo de publicacion escalonada, por lo que no es posible verificar ni reproducir el entrenamiento a partir de la informacion publicada.

## Capacidades

- Procesamiento conjunto de cinco modalidades: texto, vision, audio (ASR), sintesis de voz a 16 kHz y rejillas espaciales 2D.
- Alineacion cross-modal zero-shot: la model card declara 100,0% (500/500) de recuperacion cross-modal zero-shot sobre 5.000 representaciones evaluadas.
- Verificacion de razonamiento multi-hop y de sentido comun fisico sobre el conjunto XL-smol.
- Induccion de reglas visual-espaciales 2D, con resultados declarados sobre tareas tipo ARC-AGI-2.
- Enrutamiento de acciones para agentes (MPC) y defensa frente a deriva en trayectorias.
- Verificacion socratica y epistemica en cuatro modos.
- Razonamiento linguistico y matematico basico (resultados declarados en SLM-Bench y GSM8K).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Verificacion de razonamiento en pipelines de agentes: el modelo se presenta como juez de trayectorias cross-modales, por lo que podria emplearse para validar los pasos intermedios de un agente antes de ejecutar acciones, apoyandose en sus resultados declarados de enrutamiento MPC (99,75% Top-1) y defensa frente a deriva.
- Recuperacion cross-modal en sistemas de busqueda: con una alineacion declarada del 100% en recuperacion zero-shot entre texto, imagen, audio y rejillas, podria usarse como codificador compartido para busqueda entre modalidades, aunque la falta de pesos publicos impide su despliegue actual.
- Induccion de reglas en tareas de razonamiento abstracto: los resultados declarados sobre ARC-AGI-2 (pass@2 = 100,0% en 600 tareas) sugieren su uso potencial como modulo de resolucion de puzles visual-espaciales y generalizacion de reglas.
- Evaluacion de coherencia fisica en entornos simulados: los resultados en causal science y physical commonsense (100,00% Top-1 en 1.000 registros) apuntan a su uso como verificador de plausibilidad fisica en simulaciones o robots.
- Anotacion y alineacion de datasets multimodales: la alineacion declarada entre texto, audio y vision podria servir para emparejar y validar pares cross-modales en la construccion de corpus, siempre que se liberen los pesos.
- Investigacion en representaciones platonicas: el modelo se ofrece como banco de evaluacion de alineacion SO(D) y de representaciones compartidas entre modalidades, util para estudiar colapso de representaciones y geometria de embeddings.
- Prototipado de sistemas any-to-any de bajo coste: con unos 34,7M de parametros almacenados, el modelo esta pensado para entornos con recursos limitados, aunque la ausencia de pesos y de especificaciones de contexto impide estimar su viabilidad real en produccion.

## Benchmarks y rendimiento

Los resultados siguientes son los declarados en la model card del autor. No se han verificado de forma independiente y no se dispone de los pesos para reproducirlos.

| Benchmark | Resultado declarado |
|---|---|
| Alineacion mKNN media (5 modalidades, k=10) | 0,9778 |
| Linear CKA (5 modalidades) | 0,9999 |
| Recuperacion cross-modal zero-shot (5.000 representaciones) | 100,0% (5.000/5.000) |
| Multi-hop relational rollout (XL-smol, 1.000 registros) | 100,00% Top-1 |
| Causal science & physical commonsense (XL-smol, 1.000 registros) | 100,00% Top-1 |
| Single-hop factual verification (XL-smol, 1.000 registros) | 100,00% Top-1 |
| Verificacion socratica y epistemica 4 modos (XL-smol, 1.000 registros) | 100,00% Top-1 |
| ARC-AGI-2 2D grid (600 tareas) | 100,00% Top-1 (pass@2 = 100,0%) |
| Agent MPC action routing (403 trayectorias) | 99,75% Top-1 (pass@2 = 100,0%) |
| Agregado 6 suites XL-smol (5.003 registros) | 99,96% Macro / 99,98% Micro |
| Benchmark consolidado 12 dominios (10.130 registros) | 86,51% Macro / 79,97% Core Micro |
| SLM-Bench 9 tareas MC (13.144) | 47,36% -> 58,99% |
| GSM8K 4-way (500) | 97,60% (PPL 7,65) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con ~34,7M parametros almacenados, en fp16 rondaria los 70 MB teoricos, pero no se confirman formatos ni pesos publicados.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: teoricamente si por tamano, pero no verificable al no haber pesos publicados.
- Opciones de despliegue: la model card indica library_name transformers y pipeline_tag any-to-any, pero no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con alternativas de la misma categoria. La model card menciona otros modelos de la propia familia MatterWaveAI (helmholtz-1, helmholtz-1-omni, helmholtz-mamba-1, helmholtz-rnn-1) y en el ecosistema aparece MatterWaveAI/grt-30m-asr (33,4M parametros, ASR), pero no se aportan especificaciones comparables de contexto, licencia o rendimiento verificable.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|
| HELMHOLTZ-Omni-b0.7.0-20m | ~34,7M almacenados | no disponible | apache-2.0 | retenidos |
| MatterWaveAI/helmholtz-jepa-b0.7.0-20m (base) | no disponible | no disponible | no disponible | no disponible |
| MatterWaveAI/grt-30m-asr | 33,4M | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los pesos, los detalles de implementacion y el codigo fuente estan retenidos durante el ciclo de publicacion escalonada, por lo que el modelo no es utilizable en la practica a pesar de la licencia apache-2.0.
- Los benchmarks declarados (varios al 100,00%) no se han verificado de forma independiente y no son reproducibles sin pesos ni codigo.
- No se especifican la longitud de contexto, los idiomas soportados, los formatos de cuantizacion ni el volumen de datos de entrenamiento.
- Riesgo de alucinacion: no evaluado en la informacion disponible; los resultados en SLM-Bench (58,99% macro) sugieren un rendimiento limitado en razonamiento linguistico general.
- Sesgos conocidos: no documentados en la model card.
- El caracter experimental y la retencion de artefactos hacen desaconsejable su uso en produccion.
- Aunque la licencia es apache-2.0, la ausencia de pesos impide ejercer los derechos de uso comercial de forma efectiva en la fecha de publicacion de esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/helmholtz-omni-b0.7.0-20m
- Modelo base: https://huggingface.co/MatterWaveAI/helmholtz-jepa-b0.7.0-20m
- Familia HELMHOLTZ-1-Omni: https://huggingface.co/MatterWaveAI/helmholtz-1-omni
- HELMHOLTZ-1: https://huggingface.co/MatterWaveAI/helmholtz-1
- HELMHOLTZ-Mamba-1: https://huggingface.co/MatterWaveAI/helmholtz-mamba-1
- HELMHOLTZ-RNN-1: https://huggingface.co/MatterWaveAI/helmholtz-rnn-1
- Modelos con tag matterwave: https://huggingface.co/models?other=matterwave
- Paper referenciado (arXiv:2610.39302): https://arxiv.org/abs/2610.39302
