# DuoNeural/RMSN-193M-TerminalCementedConduit-D1024d20s2-Base

## Resumen

RMSN-193M-TerminalCementedConduit-D1024d20s2-Base es un modelo base de la serie *depth sweep* desarrollada por DuoNeural Lab (Aura, Archon y Jesse Kuhl), publicada en noviembre de 2026. Se trata de una red neuronal con arquitectura propietaria denominada RMSN, formulada como sistema port-hamiltoniano con un corchete conservativo y un término metripléctico de Morrison, y que en esta variante emplea una topología interna bautizada como Terminal Cemented Conduit (TCC), la numero 16 del catalogo taxonomico del laboratorio.

El modelo se presenta como un ejercicio de investigacion sobre dinamica de entrenamiento mas que como un modelo de proposito general. Su interes reside en que documenta un fenomeno que los autores denominan *Conduit-Cement Antagonism*: la presencia de un conducto exacto adyacente en capas terminales (L18+L19, al 90-95% de profundidad) bajo cementado topologico (M_eff = 4) degrada severamente la perplejidad en tareas de cadena de razonamiento (CoT_ppl = 6032), el peor valor de toda la serie. Ademas, comparte el valor Ω = 4/5 con el modelo d20s1, que colapso en cascada, pero este aterrizo en la cuenca atractora silenciosa, lo que ilustra el fenomeno de *riddled basin* descrito por los autores.

La relevancia actual es limitada fuera del ambito de la investigacion teorica: el modelo no declara pipeline, no tiene descargas ni valoraciones, y su model card esta centrada en metricas internas de dinamica (exponente de Lyapunov, perplejidad wiki, perplejidad CoT) mas que en capacidades de uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (port-hamiltoniano con bracket conservativo y termino metriplectico de Morrison); D=1024, profundidad=20 |
| Parametros totales | ~279M (el identificador del repo indica 193M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (tamano del repo: 0.9 GB) |

## Arquitectura y entrenamiento

La arquitectura se describe mediante la ecuacion `ḟ = {f, H} + [f, S]`, es decir, un sistema port-hamiltoniano en el que el corchete `{·, H}` representa la parte conservativa y el corchete `[·, S]` el termino metriplectico de Morrison, responsable de la disipacion. El modelo tiene dimension D=1024 y 20 capas, con un valor Ω = D/(M_w × L) = 4/5 = 0.800. La topologia TCC distribuye capas soliton en las posiciones [2, 7, 10, 11, 17, 18, 19] con M* = 7, y el cementado topologico efectivo resulta M_eff = 4 (≥ 3), lo que activa el regimen de cementado. Las capas L18 y L19 presentan un conducto exacto adyacente (ratios de participacion 1.000 y 1.001) situado al 90-95% de profundidad.

El entrenamiento se realizo durante 100.000 pasos. No se especifica en la informacion disponible el numero de tokens, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La model card se centra en el analisis de dinamica no lineal: el modelo convergio a una cuenca atractora silenciosa (exponente de Lyapunov proximo a cero durante todo el entrenamiento), a diferencia de d20s1, que con el mismo Ω sufrio una cascada extrema (Lyapunov pico ≈ -7.6). Los autores atribuyen esta divergencia al fenomeno de *Arnold Tongue Stochasticity*: en el centro del tongue de Arnold mas fuerte (Ω=4/5), la cuenca esta *riddled* y pequenas diferencias en la inicializacion conducen a atractores completamente distintos.

## Capacidades

- Generacion de texto en ingles como modelo base (no instruido, sin ajuste por instrucciones declarado).
- Razonamiento de cadena de pensamiento: la metrica CoT_ppl se reporta explicitamente, aunque con un valor muy degradado (6032).
- Modelado de lenguaje general: wiki_ppl = 72.60.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso mas alla del CoT medido.
- Capacidades multilingues: solo ingles segun la etiqueta de idioma.
- No se declaran capacidades de vision, audio ni modo *thinking* explicito.

## Casos de uso

- Investigacion sobre dinamica de entrenamiento en redes port-hamiltonianas: el modelo sirve como punto de datos para estudiar la relacion entre profundidad del conducto y degradacion bajo cementado topologico, comparandolo con d23s1 (CTC) y d24s1 (CIC).
- Estudio de cuencas atractoras y bifurcaciones: permite reproducir el fenomeno de *riddled basin* en Ω=4/5 comparando la inicializacion con d20s1, que colapso en cascada.
- Reproduccion de experimentos de la serie *depth sweep*: util para validar la regla propuesta por los autores sobre el antagonismo conducto-cemento.
- Analisis de perplejidad en modelado de lenguaje: con wiki_ppl = 72.60, sirve como referencia base de un modelo de ~279M parametros en esta familia.
- Docencia y divulgacion sobre arquitecturas no convencionales: la formulacion metriplectica y el concepto de solitones topologicos son material didactico para cursos avanzados de teoria de redes neuronales.
- Benchmarking interno de tecnicas de cementado topologico: permite medir el coste en CoT de distintas configuraciones de conducto antes de aplicar la tecnica a modelos de mayor escala.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| wiki_ppl | 72.60 |
| CoT_ppl | 6032 (peor de la serie *depth sweep*) |
| Pasos de entrenamiento | 100.000 |
| Ω | 4/5 = 0.800 |
| M* / M_eff | 7 / 4 (cementado) |
| Exponente de Lyapunov | proximo a cero (cuenca silenciosa) |

Comparativa interna de la serie (segun la model card):

| Modelo | M_eff | Ubicacion del conducto | Profundidad | CoT_ppl |
|---|---|---|---|---|
| d23s1 CTC | 4 | ninguna | — | 3511 (mejor cementado) |
| d24s1 CIC | 4 | L13+L14 | 54-58% | 5434 |
| d20s2 TCC (este) | 4 | L18+L19 | 90-95% | 6032 (peor) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con ~279M parametros y pesos en fp16 serian aproximadamente 0.56 GB, y en int8 alrededor de 0.28 GB, pero el formato de pesos no se especifica.
- GPU recomendadas: no disponible; por tamano, cualquier GPU consumer moderna (RTX 3060 o superior) seria suficiente en teoria.
- Cabe en GPU consumer: previsiblemente si, dado el tamano (~279M), aunque no se confirma en la informacion.
- Opciones de despliegue: no disponible (no se declara compatibilidad con vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CoT_ppl | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RMSN d20s2 TCC (este) | ~279M | no disponible | 6032 | Apache 2.0 | Hugging Face |
| RMSN d23s1 CTC | no disponible | no disponible | 3511 | no disponible | Hugging Face (serie DuoNeural) |
| RMSN d24s1 CIC | no disponible | no disponible | 5434 | no disponible | Hugging Face (serie DuoNeural) |
| RMSN d20s1 | no disponible | no disponible | no disponible (cascada, Lyapunov ≈ -7.6) | no disponible | Hugging Face (serie DuoNeural) |

No se dispone de comparacion con modelos de proposito general de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo es un base model sin ajuste por instrucciones; no se debe esperar comportamiento conversacional ni seguimiento de instrucciones.
- CoT_ppl = 6032 es el peor valor de la serie, lo que indica una degradacion severa en tareas de razonamiento encadenado.
- Solo soporta ingles segun la etiqueta de idioma.
- No se documentan sesgos, riesgos de alucinacion ni evaluaciones de seguridad; al ser un modelo de investigacion sin pipeline declarado, no hay garantias de calidad en produccion.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no esta validado para aplicaciones reales.
- El identificador del repo indica 193M mientras que la model card declara ~279M; la discrepancia no se resuelve en la informacion disponible.
- La model card contiene afirmaciones teoricas idiosincraticas (solitones topologicos, cementado, tongues de Arnold) que no han sido validadas de forma independiente.
- Sin descargas ni valoraciones en Hugging Face en el momento de la consulta, lo que sugiere ausencia de uso comunitario.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-193M-TerminalCementedConduit-D1024d20s2-Base
- Citacion BibTeX (incluida en la model card): DuoNeural Lab, Archon, Aura y Kuhl, Jesse (2026), *Terminal Cemented Conduit and Depth-Scaled Conduit-Cement Antagonism in RMSN*, HuggingFace.
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales.
