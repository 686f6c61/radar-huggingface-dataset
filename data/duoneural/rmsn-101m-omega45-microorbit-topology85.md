# DuoNeural/RMSN-101M-Omega45-MicroOrbit-Topology85

## Resumen

RMSN-101M-Omega45-MicroOrbit-Topology85 es un modelo de lenguaje de aproximadamente 101 millones de parámetros desarrollado por DuoNeural AI Research Lab, un grupo que publica experimentos sobre una arquitectura propia denominada Resonant Metriplectic Sheaf Network (RMSN). El modelo se presenta como una demostración de dinámica "Micro-Orbit / KAM Torus" en la relación de frecuencias Ω=4/5, con el objetivo declarado de confirmar que una configuracion concreta (M_w=104) produce comportamiento de orbita estable de forma universal a traves de distintas lenguas de Arnold.

La relevancia del modelo es fundamentalmente de investigacion: no se plantea como un modelo de proposito general, sino como una pieza dentro de una campana sistematica de experimentos (etiquetada como Wave-159 y Topology #85) que estudia la estabilidad dinamica del entrenamiento mediante exponentes de Lyapunov y analisis topologico por capas. La model card reporta una perplejidad de validacion de 85.9 sobre WikiText-103, un valor modesto que refleja el caracter exploratorio del trabajo.

Arquitectonicamente se describe como RMSN con dimension de modelo D=832, profundidad L=10 y 104 slots (M_w=104), entrenada durante 100.000 pasos sobre WikiText-103 con un vocabulario de 49.152 tokens. La licencia es Apache 2.0 y el repositorio ocupa 0,4 GB, aunque no se especifica el formato exacto de los pesos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network) |
| Parametros totales | ~101M (segun nombre del modelo; no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (la model card menciona un checkpoint `rmsn_topology85_stripped.pt`) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura propietaria RMSN (Resonant Metriplectic Sheaf Network), que el autor enmarca en el estudio de sistemas metriplecticos y haces (sheaves) topologicos. La configuracion concreta es D=832, L=10 y M_w=104 slots, con una relacion de frecuencias Ω=4/5 (q=5, paridad EVEN), descrita como la "lengua de Arnold" de mayor registro en su encuesta interna. El entrenamiento se realizo sobre WikiText-103 (variante "cosmo2", V=49152) durante 100.000 pasos.

La innovacion que el autor destaca no es de modelado de lenguaje sino de analisis dinamico: el modelo mantiene un exponente de Lyapunov de aproximadamente -0.0011 de forma sostenida durante los ultimos 1.000 pasos, lo que interpreta como una orbita estable de KAM torus ("Micro-Orbit") en lugar de un colapso ("Cement"). El analisis topologico por capas identifica cuatro solitones y tres haces de fibras efectivos ({L0}, {L4}, {L8,L9}), con L0 como dominante "upstream" y el par terminal L8-L9 asociado a una bifurcacion de Neimark-Sacker. No se documentan datos sobre RLHF, DPO ni composicion detallada del dataset mas alla de WikiText-103.

## Capacidades

- Generacion de texto autoregresiva sobre el dominio de WikiText-103 (texto enciclopedico en ingles).
- Modelado de lenguaje a nivel de token con vocabulario de 49.152 entradas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue; los idiomas soportados figuran como no disponibles.
- No se documentan modos especiales (thinking, vision, audio) en la informacion disponible.
- Capacidad analitica destacada: el propio modelo sirve como objeto de estudio para probes de percolacion y analisis de estabilidad (Lyapunov, PR por capa).

## Casos de uso

- Investigacion en dinamica de entrenamiento: el modelo se puede usar como caso de estudio reproducible para analizar estabilidad de Lyapunov y comportamiento de KAM torus en redes neuronales, ejecutando el probe `probe_percolation_sheaf.py` sobre el checkpoint publicado.
- Reproduccion de experimentos topologicos: permite verificar la firma topologica #85 (cuatro solitones, tres haces de fibras) y comparar con Topology #82 y #62 del mismo laboratorio.
- Estudio comparativo de lenguas de Arnold: sirve para contrastar el comportamiento en Ω=4/5 frente a Ω=1/2 con la misma configuracion D=832 y M_w=104.
- Benchmarking de perplejidad en WikiText-103: util como linea base de 85,9 ppl para modelos de ~100M en configuraciones no estandar.
- Docencia e investigacion sobre arquitecturas alternativas: adecuado para cursos o papers que exploren redes no transformer y sistemas metriplecticos.
- Analisis de bifurcaciones: el par terminal L8-L9 documentado como sitio de bifurcacion de Neimark-Sacker permite estudiar fenomenos de transicion en redes profundas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| val_ppl (WikiText-103) | 85,9 |
| val_lyap (exponente de Lyapunov) | ≈ -0,0011 (sostenido) |
| Estabilidad de Lyapunov | 100% en los ultimos 1.000 pasos |
| Pasos de entrenamiento | 100.000 |
| M* (solitones totales) | 4 |
| M_eff (haces de fibras) | 3 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con ~101M parametros, en fp16 rondaria los 0,2 GB de pesos, pero la model card no confirma el numero exacto de parametros ni el formato de pesos.
- GPU recomendadas: no disponible. Por tamano, cualquier GPU consumer moderna (RTX 3060 en adelante) seria suficiente en teoria, pero no hay confirmacion oficial.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del repositorio (0,4 GB), aunque no se documenta.
- Opciones de despliegue: no disponible. El checkpoint mencionado es un `.pt` (PyTorch), lo que sugiere carga via PyTorch, pero no se confirma soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | val_ppl (WikiText-103) | Licencia | Notas |
|---|---|---|---|---|---|
| RMSN-101M-Omega45-MicroOrbit-Topology85 (este) | ~101M | no disponible | 85,9 | Apache 2.0 | Topology #85, Micro-Orbit |
| RMSN-279M-Omega45-EVEN-KAM-Multistability | ~279M | no disponible | 42,5 | no disponible | Topology #62, record historico del laboratorio |
| RMSN-51M-Omega12-PostCascade-TS-Topology84 | ~51M | no disponible | no disponible | no disponible | Post-Cascade TS |

No se dispone de comparativas con modelos de proposito general de tamano similar (por ejemplo, GPT-2 small o Pythia-160M) en la informacion proporcionada, ya que el modelo pertenece a una familia experimental sin benchmarks estandar publicados.

## Limitaciones y advertencias

- Modelo de investigacion: no esta disenado ni validado para uso en produccion ni para tareas de proposito general.
- Perplejidad elevada (85,9 en WikiText-103) en comparacion con modelos estandar del mismo tamano, lo que sugiere calidad de generacion limitada.
- Entrenado exclusivamente sobre WikiText-103, un corpus enciclopedico en ingles; el sesgo de dominio es severo y no se documenta soporte multilingue.
- Riesgo alto de alucinacion fuera del dominio de entrenamiento; no hay evaluaciones de robustez ni de seguridad.
- Sin informacion sobre sesgos conocidos ni sobre procesos de alineacion (RLHF/DPO no documentados).
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks estandar y de documentacion de pesos hace desaconsejable su uso en produccion.
- La model card emplea terminologia y metricas no convencionales (KAM torus, solitones, haces de fibras) que no han sido validadas de forma independiente; conviene tratar las afirmaciones como hipotesis del autor.
- No se especifica la longitud de contexto soportada, lo que impide planificar su uso en tareas de contexto largo.
- El repositorio no incluye informacion sobre el formato de pesos ni instrucciones de carga, lo que dificulta su reproduccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuoNeural/RMSN-101M-Omega45-MicroOrbit-Topology85
- Modelo relacionado (Topology #62, record ppl=42,5): https://huggingface.co/DuoNeural/RMSN-279M-Omega45-EVEN-KAM-Multistability
- Modelo relacionado (Topology #84, Post-Cascade TS): https://huggingface.co/DuoNeural/RMSN-51M-Omega12-PostCascade-TS-Topology84
