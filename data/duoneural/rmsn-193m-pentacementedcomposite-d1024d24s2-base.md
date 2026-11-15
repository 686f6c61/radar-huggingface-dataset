# DuoNeural/RMSN-193M-PentaCementedComposite-D1024d24s2-Base

## Resumen

RMSN-193M-PentaCementedComposite-D1024d24s2-Base es un modelo base de la familia RMSN desarrollado por DuoNeural Lab (Aura, Archon y Jesse Kuhl), publicado en noviembre de 2026. Segun la model card, se trata de un modelo de aproximadamente 315 millones de parametros construido sobre una formulacion port-hamiltoniana, con una dimension interna D=1024 y 24 capas, entrenado durante 100.000 pasos. El identificador del repositorio indica 193M, mientras que la model card declara ~315M de parametros; esta discrepancia no se resuelve en la informacion disponible.

El modelo pertenece a una serie de barridos de profundidad (depth sweep) en la que cada variante explora una topologia distinta de "cementacion" entre capas. Esta variante introduce la topologia Penta-Cemented Composite (PCC), la numero 18 de la taxonomia RMSN, caracterizada por cinco haces de fibras independientes (M_eff=5) y por un fenomeno que los autores denominan Hyper-Cement Decoupling: la perplejidad en wiki empeora drasticamente (96,30, la peor de la serie) mientras que la perplejidad en cadenas de razonamiento (CoT) mejora respecto a variantes con M_eff=4.

Es relevante como objeto de estudio experimental sobre dinamica de entrenamiento y topologia de redes, no como modelo de produccion: sus cifras de perplejidad (wiki_ppl 96,30 y CoT_ppl 3966) estan muy lejos de las de un modelo de lenguaje utilizable. La model card no documenta capacidades funcionales, tokenizador, dataset ni evaluaciones de tareas estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN port-hamiltoniana (D=1024, depth=24), ecuacion ḟ = {f, H} + [f, S] |
| Parametros totales | ~315M segun model card; 193M segun el identificador del repo (no disponible la cifra definitiva) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (tamano del repo: 1,1 GB) |

## Arquitectura y entrenamiento

La arquitectura se describe como un sistema port-hamiltoniano con un corchete conservativo {·,H} y un termino metriplectico de Morrison [·,S]. El modelo tiene 24 capas con dimension D=1024, y la relacion Ω = D/(M_w × L) toma el valor 2/3 ≈ 0,6667. Sobre esta base, la topologia PCC define cinco haces de fibras (M_eff=5) delimitados por capas "soliton" en las posiciones 8, 10, 12, 13, 14, 15, 20, 22 y 23 (M*=9), separadas por capas difusas con ratios de Poisson (PR) muy elevados que actuan como ruptura entre haces.

El entrenamiento se extendio 100.000 pasos con una cascada oscilante sostenida (valores entre 0 y -3,2 durante todo el entrenamiento), a diferencia de la variante d24s1, cuyo transitorio se extingue hacia el paso 61.700 y termina en estado SILENT. La model card no especifica el numero de tokens, la composicion del dataset, ni si hubo RLHF, DPO o ajuste por instrucciones; se trata de un modelo base sin post-entrenamiento documentado. La innovacion tecnica destacable es la propia nocion de "cementacion topologica": capas con PR exactamente igual a 1,000 (L15 aislada y el par terminal L22+L23) que, segun los autores, quedan bloqueadas por el cemento global cuando M_eff es alto.

## Capacidades

- Generacion de texto autoregresiva como modelo base; no se documenta ninguna capacidad especifica verificada.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso como capacidad funcional; la metrica CoT_ppl es una medida de perplejidad, no una evaluacion de razonamiento.
- Multilingue: solo ingles declarado (`language: en`).
- No se documentan capacidades de vision, audio, thinking mode ni modo de decodificacion especulativa.
- El interes declarado por los autores es el comportamiento topologico y la dinamica de la cascada, no el rendimiento en tareas.

## Casos de uso

- Investigacion sobre dinamica de entrenamiento: reproducir el barrido de profundidad y comparar la cascada sostenida de d24s2 con la transitoria de d24s1 para estudiar cuencas de atraccion "riddled" en sistemas acoplados.
- Estudio de topologia de redes neuronales: analizar la formacion de haces de fibras y capas con PR exacto mediante el codigo y los pesos publicados, midiendo el efecto del cemento M_eff sobre la propagacion de gradientes.
- Reproducibilidad de experimentos academicos: servir como punto de referencia concreto (wiki_ppl 96,30, CoT_ppl 3966) para validar implementaciones de la formulacion port-hamiltoniana.
- Analisis de la relacion entre perplejidad en texto general y en cadenas de razonamiento: el modelo es un caso de decoupling no monotono util para estudiar metricas de evaluacion alternativas.
- Docencia y divulgacion: ejemplo tangible de como una restriccion estructural extrema degrada la calidad del lenguaje base de forma medible y uniforme.
- Pruebas de infraestructura de inferencia: con 1,1 GB de pesos, sirve para validar pipelines de carga de safetensors o de conversion a otros formatos en entornos de laboratorio, sin expectativa de calidad de salida.

## Benchmarks y rendimiento

Los unicos datos publicados son perplejidades internas de la serie, no benchmarks estandar (MMLU, HumanEval, GSM8K no aparecen).

| Modelo | M_eff | Condensados exactos | wiki_ppl | CoT_ppl |
|---|---|---|---|---|
| d23s1 CTC | 4 | Ninguno | 71,33 | 3511 |
| d24s1 CIC | 4 | 1 conduito intermedio | 77,47 | 5434 |
| d19s2 CDI | 4 | 2 aislados | 72,50 | 5795 |
| d20s2 TCC | 4 | 1 conduito terminal | 72,60 | 6031 |
| d24s2 PCC (este) | 5 | aislado + conduito terminal | 96,30 | 3966 |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,6-0,7 GB para ~315M de parametros; en fp32, unos 1,3 GB. Cabe holgadamente en cualquier GPU consumer con 4 GB o mas.
- GPU recomendadas: no hay requisitos especificos documentados; cualquier GPU moderna (RTX 3060 en adelante, A100, H100) es sobredimensionada para este tamano.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas actuales e incluso en CPU.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; al ser una arquitectura no estandar (RMSN port-hamiltoniana), es probable que requiera el codigo propio del autor, no incluido en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RMSN-193M PCC (este) | ~315M (o 193M) | no disponible | wiki_ppl 96,30; CoT_ppl 3966 | Apache 2.0 | Hugging Face, 0 descargas |
| RMSN d24s1 CIC | no disponible | no disponible | wiki_ppl 77,47; CoT_ppl 5434 | no disponible | misma serie DuoNeural |
| RMSN d23s1 CTC | no disponible | no disponible | wiki_ppl 71,33; CoT_ppl 3511 | no disponible | misma serie DuoNeural |
| Modelos base estandar de ~300M | ~300M | 2k-8k tipico | perplejidades en wiki muy inferiores | variable | amplia |

No se dispone de comparaciones con modelos de lenguaje convencionales del mismo tamano en la informacion proporcionada; las unicas alternativas documentadas son otras variantes de la misma serie experimental.

## Limitaciones y advertencias

- Calidad de lenguaje base muy baja: wiki_ppl de 96,30, la peor de la serie, lo que indica que el modelo no es utilizable para generacion de texto en produccion.
- CoT_ppl de 3966: aunque mejor que las variantes M_eff=4, sigue siendo un valor muy alto que refleja un modelado deficiente de secuencias de razonamiento.
- Solo ingles declarado; no hay evidencia de capacidades multilingues.
- No se documentan sesgos, pero al no haber datos de entrenamiento publicados no es posible evaluarlos; se debe asumir riesgo de sesgo y de alucinacion no cuantificado.
- Sin post-entrenamiento documentado (no hay RLHF, DPO ni instrucciones): no sigue instrucciones de forma fiable.
- Arquitectura no estandar: la integracion con herramientas de inferencia convencionales no esta garantizada y puede requerir codigo especifico del autor.
- Discrepancia entre el identificador (193M) y la model card (~315M) en el numero de parametros; conviene verificar los pesos reales antes de cualquier uso.
- Licencia Apache 2.0 permite uso comercial, pero la calidad del modelo hace inviable ese escenario; la licencia no exime de las limitaciones tecnicas.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuoNeural/RMSN-193M-PentaCementedComposite-D1024d24s2-Base
- No se han encontrado en la busqueda web papers, blogs, repositorios de codigo ni demos adicionales asociados a este modelo.
