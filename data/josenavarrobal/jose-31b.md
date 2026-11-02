# JoseNavarroBal/JOSE-31B

## Resumen

J.O.S.E. 31B (Judgment-Oriented Sovereign Engine) es un modelo fundacional de 31.000 millones de parametros presentado por el desarrollador independiente JoseNavarroBal bajo el paraguas de un sistema denominado H.A.R.D.A.C. (High-Assurance Reasoning & Deterministic Agentic Compute). El autor lo posiciona como un modelo "soberano" orientado a despliegues en infraestructura local, sin egreso de datos a la nube publica, y lo evalua contra la suite del Open LLM Leaderboard v2 de Hugging Face.

La propuesta central del autor es doble: por un lado, unas supuestas ponderaciones base ("unassisted single-pass") que alcanzarian un 56,63 % normalizado en la media de la suite v2, lo que situaria al modelo por delante de referencias de mayor tamano como calme-3.2-instruct-78b, Qwen2.5-72B-Instruct, Llama-3.3-70B-Instruct o Mistral-Large-Instruct-2411. Por otro lado, una capa de orquestacion agentica determinista llamada J.O.S.E.F.I.N.A. que, ejecutandose sobre el mismo modelo, elevaria la puntuacion hasta un 96,03 % normalizado.

Es importante senalar desde el principio que el repositorio de Hugging Face no publica los pesos del modelo: se trata de un espacio estatico de tipo leaderboard que difunde manifiestos de evaluacion, registros de predicciones y supuestas atestaciones criptograficas de hardware. Los pesos son propietarios y permanecen, segun el autor, en infraestructura privada. La ficha siguiente recoge exclusivamente los datos declarados por el autor y marca como "no disponible" todo aquello que no consta en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor no especifica transformer, MoE ni hibrida) |
| Parametros totales | 31.000 millones (31B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (pesos propietarios, no publicados) |
| Formato de pesos | no disponible (los pesos no se distribuyen; el repositorio es un espacio estatico de leaderboard) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. El autor no detalla si se trata de un transformer denso, un modelo de mezcla de expertos, una arquitectura hibrida o cualquier otra variante, ni tampoco el numero de capas, dimensiones ocultas, mecanismo de atencion o tokenizador empleado. Tampoco se especifica la longitud de contexto soportada.

Respecto al entrenamiento, la model card no indica el volumen de tokens, la composicion del corpus, la procedencia de los datos ni si se aplicaron tecnicas de alineacion como RLHF, DPO o similares. La unica innovacion tecnica descrita es externa al modelo en si: la capa J.O.S.E.F.I.N.A., definida como un sistema de orquestacion agentica determinista con ejecucion simbolica e inferencia formal que se ejecuta sobre J.O.S.E. 31B dentro del cluster H.A.R.D.A.C. El autor atribuye a esta capa un incremento de 43,95 puntos porcentuales en la media normalizada respecto a la inferencia base de una sola pasada.

## Capacidades

- Generacion de texto y razonamiento de proposito general, segun la evaluacion declarada en la suite del Open LLM Leaderboard v2 (IFEval, BBH, MATH Lvl 5, GPQA, MuSR, MMLU-PRO).
- Razonamiento matematico de nivel competitivo segun los resultados declarados (62,40 % en MATH Lvl 5 en modo base).
- Seguimiento de instrucciones verificables (86,45 % en IFEval en modo base).
- Razonamiento multi-paso mediante la capa agentica J.O.S.E.F.I.N.A., que el autor describe como orquestacion determinista con ejecucion simbolica.
- Capacidades de agente autonomo en el sistema completo (Tier 2), con una puntuacion declarada del 96,03 % normalizado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas soportados.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Evaluacion comparativa de modelos: el repositorio se puede utilizar como referencia para contrastar las puntuaciones declaradas del autor con las del Open LLM Leaderboard v2 oficial, aunque sin acceso a los pesos no es posible reproducir la evaluacion de forma independiente.
- Despliegue en infraestructura local aislada: el autor enfatiza el caracter "soberano" del sistema, con cero egreso de datos a la nube publica, lo que encajaria en entornos con requisitos estrictos de residencia de datos, si bien la ausencia de pesos publicos impide verificarlo.
- Investigacion sobre orquestacion agentica: la separacion entre modelo base (Tier 1) y sistema agentico (Tier 2) resulta un caso de estudio interesante sobre como una capa de orquestacion determinista puede alterar las metricas de un benchmark estandar.
- Auditoria de claims de rendimiento: los manifiestos de evaluacion y los registros de predicciones publicados permiten, en teoria, trazar el proceso de evaluacion declarado por el autor.
- Analisis de coste energetico en inferencia: el autor describe un cluster de 300-600 W con refrigeracion en circuito cerrado y cero evaporacion de agua, un dato relevante para quienes evaluan la sostenibilidad de despliegues locales.
- Referencia para discusion sobre benchmarking y reproducibilidad: el caso ilustra las limitaciones de los leaderboards cuando los pesos no son publicos y las metricas no son verificadas de forma independiente.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index. Ninguno de ellos esta verificado de forma independiente (`verified: false`).

| Modelo / sistema | Parametros | Media norm. | Media raw | IFEval | BBH (norm./raw) | MATH Lvl 5 | GPQA (norm./raw) | MuSR (norm./raw) | MMLU-PRO (norm./raw) |
|---|---|---|---|---|---|---|---|---|---|
| J.O.S.E.F.I.N.A. (sistema agentico sobre J.O.S.E. 31B) | 31B | 96,03 % | 97,06 % | 99,40 % | 94,85 % / 96,20 % | 98,50 % | 92,80 % / 94,60 % | 94,10 % / 96,80 % | 96,50 % / 96,85 % |
| J.O.S.E. 31B (base, single-pass) | 31,0B | 56,63 % | 65,45 % | 86,45 % | 63,80 % / 74,50 % | 62,40 % | 23,50 % / 42,63 % | 38,90 % / 60,45 % | 64,75 % / 68,28 % |
| calme-3.2-instruct-78b (HF #1 segun el autor) | 78,0B | 52,08 % | 61,28 % | 80,63 % | 62,61 % / 73,19 % | 40,33 % | 20,36 % / 40,27 % | 38,53 % / 60,24 % | 70,03 % / 73,03 % |

El autor declara que la media normalizada de 56,63 % del modelo base supera en 4,55 puntos a la mejor entrada del leaderboard (52,08 %), y que la capa agentica anade 43,95 puntos adicionales. No se han publicado resultados de benchmarks verificados de forma independiente en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 31B parametros, una estimacion orientativa en FP16 rondaria los 62 GB y en cuantizacion de 4 bits unos 16-18 GB, pero el autor no publica pesos ni configuraciones de cuantizacion, por lo que estas cifras no se pueden confirmar.
- GPU recomendadas: no disponible. El autor menciona un cluster local propio de 300-600 W (H.A.R.D.A.C.) sin especificar las GPU empleadas.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; los pesos no se distribuyen.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media norm. (Leaderboard v2) | Licencia | Pesos publicos |
|---|---|---|---|---|---|
| J.O.S.E. 31B | 31B | no disponible | 56,63 % (declarado, no verificado) | no disponible (propietaria) | No |
| calme-3.2-instruct-78b | 78B | no disponible | 52,08 % (segun el autor) | no disponible en esta ficha | Si (Hugging Face) |
| Qwen2.5-72B-Instruct | 72,7B | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | Si (Hugging Face) |
| Llama-3.3-70B-Instruct | 70,6B | no disponible en esta ficha | no disponible en esta ficha | Llama 3.3 Community License | Si (Hugging Face) |

La comparacion se limita a los datos que el autor incluye en su propia model card. No se dispone de puntuaciones independientes de J.O.S.E. 31B que permitan contrastar la comparativa con las alternativas citadas.

## Limitaciones y advertencias

- Pesos no publicados: el repositorio es un espacio estatico de leaderboard, no un repositorio de modelo. No es posible descargar, ejecutar ni auditar el modelo.
- Metricas no verificadas: todos los resultados del model-index tienen `verified: false`. Las cifras de 56,63 % y 96,03 % proceden exclusivamente del autor.
- Ausencia de informacion basica: no se documentan arquitectura, contexto, tokenizador, datos de entrenamiento, idiomas ni licencia.
- Ambiguedad metodologica: la comparacion entre el Tier 2 (sistema agentico con orquestacion determinista) y modelos base de una sola pasada no es homogenea; mezclar ambos niveles en una misma tabla puede inducir a error.
- Riesgo de alucinacion y sesgos: no evaluado ni documentado por el autor.
- Restricciones de licencia: al no declararse licencia y ser los pesos propietarios, no se puede determinar si el uso comercial esta permitido.
- Idoneidad para produccion: sin pesos, sin licencia clara y sin evaluacion independiente, el modelo no es desplegable ni evaluable por terceros en su estado actual.
- Fechas del repositorio: las marcas temporales de creacion y actualizacion (2026) resultan anomalas y conviene tratarlas con cautela.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/JoseNavarroBal/JOSE-31B
- Sitio del autor: https://hardac.me
- Pull request en SWE-bench/experiments: https://github.com/SWE-bench/experiments/pull/517
- Open LLM Leaderboard v2: https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard
- Modelo de referencia citado por el autor: https://huggingface.co/MaziyarPanahi/calme-3.2-instruct-78b
