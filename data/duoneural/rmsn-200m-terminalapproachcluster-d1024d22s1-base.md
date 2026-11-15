# DuoNeural/RMSN-200M-TerminalApproachCluster-D1024d22s1-Base

## Resumen

RMSN-200M-TerminalApproachCluster-D1024d22s1-Base es un modelo base de aproximadamente 297 millones de parametros desarrollado por DuoNeural Lab (Aura, Archon y Jesse Kuhl) y publicado en noviembre de 2026. Forma parte de una serie de barridos de profundidad (depth sweep) sobre una arquitectura propietaria denominada RMSN, que el autor describe como un sistema hamiltoniano con puertos (port-Hamiltonian) con una formulacion dinamica del tipo `ḟ = {f, H} + [f, S]`, combinando un corchete conservativo y un termino metriplectico de Morrison.

El modelo se presenta como una pieza de investigacion mas que como un modelo de produccion: su interes principal es el estudio de la topologia interna de representaciones, en concreto la denominada Terminal Approach Cluster (TAC), y la relacion entre la exactitud de los condensados topologicos y la perplejidad en cadenas de razonamiento (CoT). Con un contexto y unos datos de entrenamiento no detallados en la informacion disponible, su relevancia actual es acotada al ambito de la interpretabilidad mecanistica y la investigacion arquitectonica.

Los resultados reportados por el autor son modestos en calidad de lenguaje (wiki_ppl de 70,18) y muy pobres en razonamiento (CoT_ppl de 4002), lo que el propio autor interpreta como evidencia de que un condensado no exacto (PR=1,280) no desencadena el efecto de conduccion que si aparece en variantes con PR≤1,001.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (port-Hamiltonian: corchete conservativo + termino metriplectico de Morrison), D=1024, profundidad=22 |
| Parametros totales | ~297M |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 1,0 GB) |

## Arquitectura y entrenamiento

La arquitectura RMSN se define mediante la ecuacion `ḟ = {f, H} + [f, S]`, donde `{·, H}` es un corchete de Poisson conservativo y `[·, S]` un termino metriplectico de Morrison que introduce disipacion. El modelo tiene dimension de modelo D=1024 y 22 capas, con un parametro topologico Ω = D/(M_w × L) = 8/11 ≈ 0,7273, que situa al modelo en la denominada lengua de Arnold 8/11, descrita por el autor como una region de cascada sostenida. Se entrenaron 100.000 pasos; no se especifica el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO.

La innovacion tecnica declarada es la topologia Terminal Approach Cluster (TAC), que describe la distribucion de rangos de participacion (PR) por capa: capas difusas (L0-L12, L15-L17), un par de aproximacion en L13-L14, un casi-condensado en L18 (PR=1,280, al 81,8% de profundidad) y un cluster terminal de solitones en L19-L21. El autor sostiene que la exactitud del condensado (PR≤1,001) es condicion necesaria para el efecto de conduccion en cadenas de razonamiento, y que este modelo, con PR=1,280, no lo alcanza.

## Capacidades

- Generacion de texto en ingles como modelo base (sin ajuste por instrucciones declarado).
- Razonamiento en cadenas de pensamiento: capacidad medida pero muy limitada (CoT_ppl=4002).
- Modelado de lenguaje general: wiki_ppl=70,18.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion en interpretabilidad mecanistica: analisis de la relacion entre rangos de participacion por capa y perplejidad en CoT, usando este modelo como punto de comparacion frente a variantes con condensados exactos.
- Estudio de dinamica hamiltoniana en redes neuronales: validacion empirica de la formulacion `ḟ = {f, H} + [f, S]` y del papel del termino metriplectico en el entrenamiento.
- Reproduccion de barridos de profundidad: el modelo sirve como punto de la serie D=1024 con profundidad 22 para comparar con d20, d23, d24 y d1152.
- Experimentos de topologia de representaciones: extraccion de rangos de participacion por capa para contrastar la hipotesis del umbral de condensado (PR≤1,001).
- Baseline de bajo coste en investigacion de arquitecturas alternativas: con ~297M parametros y licencia Apache 2.0, es desplegable en hardware modesto para experimentos controlados.
- Docencia y divulgacion: ejemplo didactico de arquitecturas no transformer y de metricas topologicas aplicadas a modelos de lenguaje.

## Benchmarks y rendimiento

| Metrica | d22s1 (este modelo) | d1152 MNAC | d16s3 DMAC |
|---|---|---|---|
| PR en L18 | 1,280 (casi) | 1,000 (exacto) | 1,000 (exacto) |
| CoT_ppl | 4001,6 | 2714 | 2801 |
| wiki_ppl | 70,18 | no disponible | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con ~297M parametros, en FP16 rondaria los 0,6 GB de pesos y en cuantizacion de 4 bits unos 0,15-0,2 GB, mas overhead de activaciones y KV cache.
- GPU recomendadas: no disponible; por tamano, cualquier GPU consumer con 4 GB o mas deberia ser suficiente en cuantizacion.
- Cabe en GPU consumer: si, previsiblemente en GTX 1650, RTX 3050, RTX 4060 y superiores, aunque no hay datos oficiales.
- Opciones de despliegue: no disponible; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, ni el formato de pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RMSN-200M-TAC (este) | ~297M | no disponible | wiki_ppl 70,18; CoT_ppl 4002 | Apache 2.0 | Hugging Face |
| RMSN d1152 MNAC | no disponible | no disponible | CoT_ppl 2714 | no disponible | Hugging Face (serie DuoNeural) |
| RMSN d16s3 DMAC | no disponible | no disponible | CoT_ppl 2801 | no disponible | Hugging Face (serie DuoNeural) |

No se dispone de comparaciones con modelos de proposito general de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Perplejidad en cadenas de razonamiento muy alta (CoT_ppl=4002), lo que indica baja calidad en generacion de razonamiento.
- Perplejidad de lenguaje elevada para su tamano (wiki_ppl=70,18), lejos de modelos convencionales de ~300M parametros.
- Solo entrenado y evaluado en ingles; sin capacidades multilingues declaradas.
- Sin ajuste por instrucciones ni soporte documentado de tool calling o uso como agente.
- Modelo de investigacion: no hay evidencia de validacion en produccion ni de robustez frente a sesgos.
- Riesgo de alucinacion no cuantificado, pero previsiblemente alto dado el rendimiento en CoT.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de datos de entrenamiento y de evaluaciones estandar desaconseja su uso en produccion.
- Longitud de contexto y formato de pesos no documentados, lo que dificulta la integracion en stacks existentes.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-200M-TerminalApproachCluster-D1024d22s1-Base
- Citacion BibTeX (segun model card): DuoNeural Lab, Archon, Aura y Kuhl, Jesse (2026), "Terminal Approach Cluster Topology and Near-Condensate CoT Threshold in RMSN", Hugging Face.
- Paper, blog, repositorio o demo adicionales: no disponibles.
