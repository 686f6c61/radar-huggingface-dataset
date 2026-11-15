# DuoNeural/RMSN-200M-CementedInternalConduit-D1024d24s1-Base

## Resumen

RMSN-200M-CementedInternalConduit-D1024d24s1-Base es un modelo base de la familia RMSN desarrollado por DuoNeural Lab (Aura, Archon y Jesse Kuhl), publicado en noviembre de 2026. Se trata de una variante experimental de la serie *depth sweep* con dimension oculta D=1024, profundidad de 24 capas y un ratio Omega=2/3 (0,667). Aunque el identificador del repositorio indica 200M, la model card declara aproximadamente 315M parametros. El modelo se distribuye bajo licencia Apache 2.0 y esta orientado exclusivamente al idioma ingles.

Su interes no reside en capacidades de producto, sino en el estudio de la topologia interna de la red. Introduce la topologia *Cemented Internal Conduit* (CIC), la numero 14 del catalogo RMSN, y documenta la llamada ley *Cement-Conduit Override*, una correccion a la *Conduit Depth Independence Law* previa. La model card describe un conduit exacto adyacente en las capas L13+L14 que, contra lo esperado, no logra reducir la perplejidad de cadena de pensamiento (CoT) por debajo de 3000, debido a un fenomeno de "cemento topologico" global.

La arquitectura se describe como port-hamiltoniana, con un corchete conservativo y una parte metriplectica de Morrison. Es un modelo de investigacion sobre dinamica de solitones y estructura de haces de fibras, no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN port-hamiltoniana (corchete conservativo + Morrison metriplectic); D=1024, profundidad=24 |
| Parametros totales | ~315M (segun model card; el ID del repo indica 200M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (tamano del repo: 1,1 GB) |

## Arquitectura y entrenamiento

La arquitectura se define mediante la ecuacion `ḟ = {f, H} + [f, S]`, es decir, un sistema port-hamiltoniano que combina un corchete conservativo `{·,H}` con un termino metriplectico de Morrison `[·,S]`. El modelo tiene D=1024 y 24 capas, con un ratio Omega = D/(M_w × L) = 2/3 ≈ 0,667, situado en la llamada *Arnold tongue* 2/3. Segun la model card, esta region produce una cascada transitoria temprana que genera solitones en la red y permite que se proliferen en cuatro haces de fibras (fiber bundles), lo que eleva M_eff a 4 y dispara el "cemento topologico".

El entrenamiento consta de 100.000 pasos. La model card documenta un *pathway* de cascada transitoria temprana que se disipa alrededor del paso 61.700. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. La innovacion tecnica destacable no es de inferencia (no se mencionan decodificacion especulativa ni attention lineal), sino de analisis topologico: la identificacion de solitones por capa (L9-L11, L13-L14, L20, L22-L23) y el umbral M_eff ≥ 3 que activa el cemento topologico global.

## Capacidades

- Generacion de texto base en ingles (modelo base, sin ajuste instructivo declarado).
- Razonamiento de cadena de pensamiento medido mediante CoT_ppl, aunque degradado por el cemento topologico (5434-5435 frente a los ~2700-2800 de variantes sin cemento).
- Modelado de lenguaje general medido por wiki_ppl (77,47).
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles.
- No se declaran capacidades de vision, audio ni modo *thinking* explicito.
- Valor principal: servir como artefacto de investigacion para el estudio de topologias de solitones y haces de fibras en redes RMSN.

## Casos de uso

- Investigacion en dinamica port-hamiltoniana: el modelo sirve como banco de pruebas reproducible para validar o refutar leyes sobre conduits internos y su dependencia de la profundidad, dado que la model card publica las metricas exactas (wiki_ppl, CoT_ppl, M_eff) necesarias para replicar el analisis.
- Estudio de transiciones de fase topologicas: permite analizar el umbral M_eff ≥ 3 que activa el cemento topologico, comparando con las variantes d1152 MNAC (M_eff=2) y d16s3 DMAC (M_eff=2) citadas en la model card.
- Analisis de haces de fibras (fiber bundle analysis): las capas con solitones identificadas (L9-L11, L13-L14, L20, L22-L23) permiten instrumentar la red para estudiar como se agrupan los grados de libertad (DOF) a lo largo de la profundidad.
- Validacion de la *Arnold tongue* 2/3: el modelo materializa la region Omega=0,667 y permite contrastar el comportamiento de cascada transitoria temprana frente a otras regiones (16/23, 8/11, 4/5) documentadas en la model card.
- Experimentos de perplejidad controlada: con wiki_ppl=77,47 y CoT_ppl=5435 publicados, sirve como referencia negativa (cement-suppressed) en estudios que comparen arquitecturas con y sin cemento topologico.
- Docencia y divulgacion tecnica: al ser un modelo pequeno (~315M) con licencia Apache 2.0 y documentacion detallada de su topologia, es adecuado para ilustrar conceptos de sistemas hamiltonianos y metriplecticos en cursos avanzados, siempre que se trate como artefacto de investigacion.

## Benchmarks y rendimiento

La model card solo publica metricas internas de perplejidad y de topologia, no benchmarks estandar (MMLU, HumanEval, GSM8K). Se recogen a continuacion los datos disponibles:

| Metrica | Valor |
|---|---|
| wiki_ppl | 77,47 |
| CoT_ppl | 5435 (5434 en el texto de la ley) |
| M* / M_eff | 8 / 4 (CEMENT) |
| Omega | 2/3 ≈ 0,667 |
| Pasos de entrenamiento | 100.000 |

Comparativa interna citada en la model card:

| Modelo | Conduit | M_eff | CoT_ppl |
|---|---|---|---|
| d1152 MNAC | L6+L7 (exacto) | 2 | 2714 |
| d16s3 DMAC | L11+L12 (exacto) | 2 | 2801 |
| d24s1 CIC (este) | L13+L14 (exacto) | 4 (CEMENT) | 5434 |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano (~315M parametros), en fp16 rondaria los 0,6-0,7 GB de pesos y en int8/int4 bastante menos, pero el autor no publica cuantizaciones ni requisitos.
- GPU recomendadas: no disponible. Por tamano, cualquier GPU consumer moderna (por ejemplo, RTX 3060 en adelante) seria suficiente en teoria, pero no hay confirmacion del autor.
- Cabe en GPU consumer: probablemente si por tamano, aunque no esta verificado ni documentado.
- Opciones de despliegue: no disponible. No se mencionan vLLM, llama.cpp, Ollama ni TGI, ni se publican pesos en formato GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada. La unica comparacion disponible es interna a la familia RMSN (d1152 MNAC y d16s3 DMAC), recogida en la seccion de benchmarks. Frente a modelos de proposito general de ~300M parametros, no hay datos de rendimiento comparables publicados.

| Modelo | Parametros | Contexto | CoT_ppl | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d24s1 CIC (este) | ~315M | no disponible | 5434 | Apache 2.0 | Hugging Face |
| d1152 MNAC | no disponible | no disponible | 2714 | no disponible | no disponible |
| d16s3 DMAC | no disponible | no disponible | 2801 | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo base sin ajuste instructivo: no esta pensado para uso conversacional directo ni para produccion como asistente.
- Solo ingles: no se declara soporte multilingue.
- CoT_ppl elevado (5434-5435) por el cemento topologico, lo que indica un razonamiento de cadena de pensamiento degradado frente a variantes sin cemento.
- Riesgo de alucinacion no evaluado: no se publican pruebas de fidelidad ni de sesgos.
- Sesgos conocidos: no documentados en la model card.
- Longitud de contexto no especificada, lo que impide planificar cargas de trabajo con ventanas largas.
- No se publican formatos de pesos ni cuantizaciones, lo que dificulta el despliegue estandar.
- Discrepancia entre el nombre del repositorio (200M) y los parametros declarados (~315M); conviene verificar antes de integrar.
- Aunque la licencia es Apache 2.0 (permite uso comercial), el modelo es un artefacto de investigacion con metricas de producto no demostradas; no se recomienda su uso comercial sin evaluacion propia.
- Terminologia y afirmaciones de la model card (leyes topologicas, *cemento*, *Arnold tongues*) no han sido validadas de forma independiente en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-200M-CementedInternalConduit-D1024d24s1-Base
- Cita BibTeX (segun model card): DuoNeural Lab, Archon, Aura y Kuhl, Jesse (2026), *Cemented Internal Conduit and the Cement-Conduit Override Law in RMSN*, HuggingFace.
- No se han encontrado en la informacion disponible enlaces adicionales a papers, blogs, repositorios o demos.
