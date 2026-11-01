# logos42/headless

## Resumen

headless (anteriormente conocido como LMT-twister) es un sistema de modelado de lenguaje experimental desarrollado por el usuario logos42, construido sobre una arquitectura de modelo de espacio de estados (SSM) combinada con meta-aprendizaje basado en optimizacion (OML) y un mecanismo de exploracion autonoma de datos. El objetivo declarado es el aprendizaje continuo en tiempo de ejecucion sin olvido catastrofico de conocimiento previamente adquirido. El repositorio incluye tres variantes de distinto tamano (LM1, LM2 y LM3) que sirven como banco de pruebas de los mecanismos propuestos.

El modelo es de escala muy reducida: LM1 tiene 1,05 millones de parametros, LM2 0,71 millones y LM3 2,26 millones. No se trata de un modelo de lenguaje de proposito general ni de un modelo conversacional, sino de un sistema de investigacion orientado a demostrar propiedades de aprendizaje continuo (transferencia positiva entre dominios, olvido negativo, adaptacion en bucle interno) sobre tareas sinteticas, texto real de wikitext-2 y dominios cruzados (ingles, chino y codigo). La libreria declarada es `other`, lo que indica que no se integra con los runners estandar de Transformers o vLLM.

La relevancia del proyecto reside en su tesis mecanistica: que el replay es el unico mecanismo efectivo contra el olvido catastrofico, y que el OML correcto (clonacion de bucle interno) mejora la eficiencia de adaptacion pero no previene el olvido. Estos hallazgos se presentan como conclusiones verificadas experimentalmente dentro del propio repositorio, no como resultados de benchmarks estandar de la industria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | State Space Model (SSM) con cabeza SwiftTD y bucle dual OML; LM1 incorpora un S4 Value Proposer |
| Parametros totales | LM1: 1,05 M; LM2: 0,71 M; LM3: 2,26 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch `.pt`) |
| Idiomas soportados | LM3 cubre ingles, chino y codigo; LM2 opera a nivel de caracter sobre wikitext-2; no se declara un conjunto formal de idiomas |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (`.pt`); LM1 final ~6,3 MB |

## Arquitectura y entrenamiento

La arquitectura se compone de un backbone SSM (variante V31_RLN, con `d_model`, `d_state` y numero de capas configurables) sobre el que se montan varios componentes: una cabeza SwiftTD que optimiza el tamano de paso por caracteristica mediante IDBD en linea sin BPTT; un bucle dual OML con adaptacion en bucle interno (PLN) y meta-actualizacion en bucle externo; y, en LM1, un S4 Value Proposer que genera tareas de forma autonoma a partir de novedad estructural. LM2 emplea un tokenizador a nivel de caracter con vocabulario de 607 simbolos, mientras que LM3 usa BPE con vocabulario de 4627.

El entrenamiento se describe en terminos de experimentos sobre dominios secuenciales: LM2 sobre tres dominios de wikitext-2 en streaming (500 pasos por dominio), LM3 sobre la secuencia ingles→chino→codigo, y LM1 con 17 rondas y 680 iteraciones de convergencia automatica. No se especifica el numero total de tokens de entrenamiento ni la composicion detallada del dataset mas alla de las fuentes citadas (wikitext-2, tareas sinteticas de mundo de registros y permutaciones S4). No se menciona uso de RLHF ni DPO. La innovacion tecnica destacable es el mecanismo de aprendizaje continuo con replay como anclaje de datos y el OML como acelerador de adaptacion.

## Capacidades

- Modelado de lenguaje a nivel de caracter (LM2) y a nivel de subpalabra BPE (LM3) sobre texto real.
- Aprendizaje continuo en tiempo de ejecucion con transferencia positiva entre dominios en el mismo corpus (wikitext-2).
- Adaptacion rapida a nuevos dominios mediante clonacion de bucle interno (OML correcto).
- Generacion autonoma de datos de entrenamiento mediante un value-function proposer basado en simplicidad, consistencia y cobertura (LM1).
- Ejecucion de tareas sinteticas de mundo de registros (sandbox de 8 instrucciones y 4 registros) y permutaciones S4.
- Soporte de inferencia mediante API de demostracion (`define+adapt+query`).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking.

## Casos de uso

- Investigacion en aprendizaje continuo: el sistema sirve como banco de pruebas reproducible para medir olvido catastrofico y transferencia entre dominios con secuencias controladas de wikitext-2 y dominios cruzados.
- Validacion de mecanismos anti-olvido: permite comparar replay, OML y division de learning rate en un mismo entorno, con resultados cuantificados (replay +5,0 pp de media).
- Experimentacion con meta-aprendizaje en linea: el bucle dual OML y la cabeza SwiftTD permiten estudiar tasas de aprendizaje por caracteristica sin retropropagacion en el tiempo.
- Generacion autonoma de curriculum: el S4 Value Proposer de LM1 puede usarse para explorar como un agente propone sus propias tareas y mide cobertura estructural.
- Docencia y reproduccion de experimentos: los scripts `run_lm1_production.py`, `run_lm2_text.py` y `run_lm3_bpe.py` permiten replicar los resultados con datos sinteticos o wikitext-2 autodescargado.
- Prototipado de arquitecturas SSM de bajo coste: con menos de 2,3 M de parametros, el modelo cabe en cualquier equipo y sirve para iterar sobre disenos de capas SSM antes de escalar.

## Benchmarks y rendimiento

Los resultados publicados son internos del proyecto y no corresponden a benchmarks estandar (MMLU, HumanEval, GSM8K). Se reproducen a continuacion tal como aparecen en la model card.

LM1 — aprendizaje continuo autonomo:

| Metrica | Valor | Pico de la familia | Mejora |
|---|---|---|---|
| Precision en tareas no vistas | 0,1276 | 0,099 | +29 % |
| Precision estructural c4 | 0,1510 | 0,099 | +53 % |
| Olvido | -0,006 | — | Negativo (mejora) |
| Transferencia S5 (R16) | 0,1172 | — | Migracion positiva |

LM2 — aprendizaje continuo sobre texto real:

| Dominio | Antes | Despues | Cambio |
|---|---|---|---|
| A (entrenamiento, 2 M caracteres) | 0,429 | 0,472 | +4,3 pp |
| B (validacion, 1,1 M caracteres) | 0,478 | 0,488 | +1,0 pp |
| C (test, 1,3 M caracteres) | 0,493 | — | Transferencia positiva |

LM3 — aprendizaje continuo entre dominios:

| Metodo | en | zh | code | Media |
|---|---|---|---|---|
| Base (secuencial) | 0,260 | 0,076 | 0,340 | 0,170 |
| Replay | 0,252 | 0,057 | 0,352 | 0,220 |
| OML (dual-lr) | — | — | — | 0,131 |
| OML2 (correcto) | — | — | — | 0,168 |

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todos los casos; LM1 ocupa 6,3 MB en checkpoint, por lo que la inferencia cabe en CPU sin GPU.
- GPU recomendadas: no se requieren; cualquier GPU consumer (incluso integradas) es suficiente. No se documenta uso de A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer y en CPU.
- Opciones de despliegue: scripts Python propios del repositorio (`run_lm1_production.py`, `lm1_inference_demo.py`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos comparables directos en la informacion proporcionada. Los sistemas de referencia mas cercanos serian propuestas de aprendizaje continuo sobre SSM o transformers de escala reducida, pero no se aportan datos de parametros, contexto ni rendimiento de alternativas. Se indica por tanto "no disponible".

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| headless (LM1/LM2/LM3) | 0,71–2,26 M | no disponible | MIT | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Escala muy reducida (menos de 2,3 M de parametros): no es apto para generacion de texto de calidad, razonamiento general ni tareas de codigo en produccion.
- No se han publicado evaluaciones en benchmarks estandar; los resultados son internos y especificos del diseno experimental del autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion externa.
- La model card no documenta sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad.
- No se especifica la longitud de contexto soportada, lo que impide planificar su uso en tareas de contexto largo.
- Los idiomas no estan declarados formalmente; la cobertura de chino se limita a los experimentos de LM3.
- La licencia MIT permite uso comercial, pero el modelo no esta pensado para ello y no se ofrece ninguna garantia de idoneidad.
- La libreria es `other`: no hay integracion con ecosistemas estandar (Transformers, vLLM), lo que limita su adopcion fuera del codigo del propio repositorio.
- Los datos de entrenamiento dependen de rutas locales (`/tmp/lm2data`, `/tmp/lm3data`) para LM3, lo que anade friccion a la reproduccion.

## Enlaces

- HuggingFace: https://huggingface.co/logos42/headless
- Repositorio y scripts: incluidos en el propio repositorio de HuggingFace (carpetas `tests/`, `hibs_lnn/`, `docs/wiki/log.md`)
- Paper: no disponible
- Blog o demo: no disponible
