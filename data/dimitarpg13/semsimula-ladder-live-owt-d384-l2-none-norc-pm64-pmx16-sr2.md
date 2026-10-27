# dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm64-pmx16-sr2

## Resumen

`semsimula-ladder-live-owt-d384-l2-none-norc-pm64-pmx16-sr2` es un modelo de lenguaje de 76,6 millones de parametros desarrollado por el autor independiente dimitarpg13 dentro de su "ladder" de investigacion SemSimula. No es un transformer: es un modelo generativo sin atencion en el que cada token se trata como una particula en un espacio de 384 dimensiones que evoluciona mediante un flujo amortiguado, y donde todas las fuerzas que actuan sobre la particula son el gradiente exacto de un potencial escalar. La variante PMX que nos ocupa es la tercera generacion de la familia e introduce 64 "registros de modo Poisson": pozos gaussianos compartidos cuya profundidad crece con la ocupacion acumulada de los tokens anteriores, de modo que el contexto previo modifica el paisaje energetico que ven los tokens posteriores. Los pozos se integran de forma exacta dentro del mismo flujo amortiguado, mediante una descomposicion espectral de 32 bandas por token y capa.

El modelo resuelve un problema de investigacion, no de producto: comprobar si un modelo de lenguaje puramente conservativo (sin atencion, con memoria constante en inferencia y con dinamica derivada de un potencial) puede mejorar su calidad anadiendo un mecanismo de memoria explicito y fisicamente motivado. Segun los datos del autor, los registros aportan una mejora del 6,3 % en perplejidad frente a SR2, el mismo modelo sin registros, y situan a PMX como el mejor modelo conservativo del ladder, aunque sigue por detras del brazo no conservativo Fock-PARFLM y de la referencia GPT-2 del propio autor.

Su relevancia ahora es metodologica: el autor publica un estudio de ablacion pre-registrado, con presupuesto de tokens identico entre brazos (532,48 millones de tokens en todos los modelos), corpus, tokenizador y lotes de validacion comunes, y con el criterio de refinamiento fijado de antemano. Bajo ese criterio, PMX no es apto para refinamiento posterior; SR2 si lo es. Es, por tanto, un artefacto de investigacion reproducible sobre dinamica conservativa aplicada a modelado de lenguaje, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flujo conservativo no-transformer y sin atencion ("semantic simulation", PARFLM en espacio de Fock) con integrador exacto de modos rigidos amortiguados y 64 registros de modo Poisson |
| Parametros totales | 76,6 M |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (bloques de 512 usados en entrenamiento y evaluacion; no se declara una ventana mayor) |
| Tipos de cuantizacion | no disponible (solo se publican pesos PyTorch sin cuantizar; no hay GGUF ni variantes cuantizadas) |
| Idiomas soportados | ingles (`en`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | checkpoint PyTorch (`library_name: pytorch`); no se declara safetensors ni GGUF. Tamano del repositorio: 0,6 GB |
| Dimension del modelo | 384 (`d384`) |
| Capas | 2 (`l2`) |
| Registros de modo Poisson | 64 modos compartidos (`pm64`) |
| Pozos por token | 16 pozos mas fuertes por token, con su parte de rango (`pmx16`) |
| Dataset de entrenamiento | Skylion007/openwebtext (OpenWebText) |
| Tokens de entrenamiento | 532.480.000 (32.500 pasos x 32 de lote x 512) |

## Arquitectura y entrenamiento

El modelo abandona por completo el bloque transformer. Cada token se representa como una particula en un espacio continuo de 384 dimensiones y cada capa aplica un flujo amortiguado en el que la fuerza es siempre el gradiente de un potencial escalar Vθ en las coordenadas de la propia particula. La generacion 3 (PMX) parte de SR2, que resolvio de forma exacta los modos rigidos de Vθ mediante un integrador amortiguado sin paso explicito dominante, y le anade los registros de modo Poisson. Cada uno de los 64 modos tiene un centro μ, una anchura κ, una probabilidad de supervivencia λ por token y una profundidad por capa. Un token genera particulas en el modo v segun su solapamiento exp(−κ²‖h − μ‖²); esas particulas sobreviven de token a token con probabilidad λ, de forma que la ocupacion φ que ve el token t es un recuento con decaimiento sobre los tokens estrictamente anteriores. El token siente entonces una suma de pozos gaussianos de profundidad φ × profundidad, y su fuerza es el gradiente exacto de esa suma. La ocupacion es la media exacta de un proceso de inmigracion-muerte de Poisson (el estado coherente del formalismo bosonico de Doi–Peliti); como el acoplamiento es lineal en la ocupacion, el modelo reproduce la media pero no puede observar fluctuaciones bosonicas.

La innovacion tecnica de PMX es la integracion exacta de esos pozos. En la variante anterior (PM1) los pozos eran explicitos, se situaban en el limite de estabilidad del integrador (ω·Δt ≈ 2,1), el golpe explicito suponia el 94 % del paso en la capa 1 y provocaban el fallo del criterio de refinamiento. PMX congela la parte cuadratica de cada pozo al inicio de cada paso y la incorpora al flujo amortiguado exacto: la fuerza y curvatura isotropica de cada pozo, mas la parte de rango de los 16 pozos mas fuertes del token, forman un muelle en las 384 direcciones; ese muelle es indefinido (la pendiente exterior de un pozo atractivo es inestable en la direccion radial), por lo que se diagonaliza con una resolucion de autovalores de 32 bandas que admite curvatura negativa, y cada modo se integra como oscilador amortiguado exacto o como movimiento hiperbolico exacto, con friccion incluida. El golpe explicito solo transporta el resto, y su peso en la capa 1 cae de 0,94 a 0,288.

El entrenamiento usa OpenWebText con 32.500 pasos, lote de 32 y bloques de 512, lo que da 532.480.000 tokens vistos: aproximadamente 7 tokens por parametro, un tercio de la relacion compute-optimal, por lo que todos los resultados corresponden a un modelo subentrenado. No se documenta ninguna fase de instruction tuning, RLHF o DPO; es un modelo base de prediccion del siguiente token. El autor reporta salud de ejecucion limpia: 0 activaciones del watchdog y 0 picos, con la norma global del gradiente por encima de 1,0 en 15 de los 490 pasos registrados tras la sonda (maximo 1,50). El coste del mecanismo es alto: 2,98 s por paso frente a 1,72 s de SR2 en una A100, atribuible a la resolucion de autovalores de 32 bandas por token y capa.

## Capacidades

- Generacion de texto en ingles mediante prediccion autorregresiva del siguiente token, con contexto de 512 tokens.
- Modelado de lenguaje base: no hay plantilla de chat, formato de instrucciones ni alineacion.
- Propiedad conservativa verificada sobre los pesos entrenados: a contexto fijo, la fuerza de cada token es un gradiente exacto, lo que permite auditar el modelo energeticamente.
- Memoria de contexto mediante 64 registros de modo Poisson interpretables: la ocupacion de cada modo es un recuento con decaimiento sobre el pasado estricto, lo que hace la dependencia contextual explicitamente causal y legible.
- Inferencia con memoria constante respecto a la longitud de secuencia (etiqueta `constant-memory-inference`), al no existir matriz de atencion ni cache de claves/valores.
- Trazabilidad de la dinamica: al ser un flujo con integrador exacto, el estado intermedio por capa es inspeccionable.
- No soporta tool calling ni function calling.
- No soporta agentes, planificacion multi-paso ni razonamiento encadenado explicito.
- No dispone de modo "thinking", vision, audio ni otras modalidades.
- Multilingue: no; solo ingles.
- No hay evidencia publicada de capacidades de codigo o matematicas mas alla de lo que emerga de un modelo base de 76,6 M de parametros subentrenado.

## Casos de uso

- Investigacion en modelos generativos sin atencion: sirve como punto de comparacion controlado para estudiar si la dinamica conservativa con potencial escalar puede competir con la atencion en modelado de lenguaje, con la ventaja de que cada fuerza es un gradiente verificable.
- Estudios de ablacion pre-registrados: el modelo forma parte de un ladder con presupuesto de tokens, corpus y lotes de validacion identicos, por lo que es directamente util para replicar la comparacion PMX frente a SR2 y F3.1 y comprobar la contribucion aislada de los registros de modo (+6,3 % de perplejidad).
- Inferencia en hardware muy limitado: con 76,6 M de parametros y memoria constante respecto al contexto, puede ejecutarse en CPU o en GPU de gama baja para generar texto corto en ingles, en escenarios donde no cabe un transformer con cache de claves/valores.
- Linea base de perplejidad en OpenWebText: util como referencia para nuevos modelos de la misma familia o para validar implementaciones de integradores simplecticos sobre texto real (54,63 de perplejidad en validacion con bloques de 512).
- Analisis de mecanismos internos: los registros de modo actuan como memoria con decaimiento y permiten estudiar que tokens profundizan que pozos, lo que lo hace adecuado para experimentos de interpretabilidad mecanistica sobre dependencia de largo alcance dentro de 512 tokens.
- Docencia y divulgacion tecnica: el modelo es un banco de pruebas reproducible para explicar integradores tipo BAOAB, dinamica amortiguada, metricas de Jacobi y geodesicas riemannianas aplicadas a representaciones, con artefactos reales y no simulados.
- Generacion de datos sinteticos de bajo coste en ingles para experimentos de aumentacion o para pruebas de pipelines de evaluacion, siempre que la calidad no sea critica.
- Verificacion de conservatividad: permite comprobar empiricamente sobre pesos entrenados que la fuerza es gradiente de un potencial, algo que no puede hacerse con un transformer estandar.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card. La metrica de perplejidad figura como no verificada (`verified: false`).

| Modelo | Perplejidad en validacion (bloque 512, asentada) | Diferencia frente a PMX | Ratio frente a GPT-2 (referencia del autor) |
|---|---:|---:|---:|
| **PMX (este modelo)** | **54,63** | — | 1,097x |
| SR2 (mismo modelo sin registros) | 58,32 | −6,3 % | 1,171x |
| F3.1 (conservativo con paso partido) | 57,76 | −5,4 % | 1,160x |
| PM1 (registros con pozos explicitos sobre F3.1, no publicado) | 55,17 | −1,0 % | 1,108x |
| Fock-PARFLM L=2 con gradientes vivos (no conservativo) | 53,12 | +2,8 % | 1,066x |
| Brazo `gpt2-matched` (referencia GPT-2 del autor) | 49,81 | +9,7 % | 1,000x |

Notas del autor sobre la medicion: "asentada" es la media de las tres ultimas evaluaciones cada 500 pasos en bloque 512 (56,07, 54,61 y 53,21); el mejor valor es 53,15 en el paso 30.500. El autor indica ademas que un modelo equivalente entrenado en primer orden (FO-b-PMX, anadido el 2026-10-22) queda "a la altura", pero el enlace a esa ficha aparece truncado en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir del numero de parametros, ya que el autor no publica cifras): pesos en fp32 ≈ 306 MB, en bf16 ≈ 153 MB, en int8 ≈ 77 MB. El repositorio completo ocupa 0,6 GB.
- La memoria de activaciones no crece con la longitud de contexto (etiqueta `constant-memory-inference`), pero el integrador mantiene estado por token y capa y ejecuta una resolucion de autovalores de 32 bandas en cada paso.
- Cabe en cualquier GPU de consumo con 2 GB o mas de VRAM; tambien es viable en CPU para generacion de texto corto. No requiere A100 ni H100 para inferencia.
- GPU recomendadas: ninguna especifica para inferencia; el autor cita A100 como hardware de entrenamiento (2,98 s por paso con lote 32 x 512).
- Opciones de despliegue: no disponible en vLLM, llama.cpp, Ollama ni TGI, porque el modelo no es un transformer, no publica GGUF y depende de codigo de integracion propio. El despliegue requiere cargar el checkpoint PyTorch con el codigo del autor.
- Latencia y throughput de inferencia: no disponibles. El unico dato de coste publicado es de entrenamiento (2,98 s por paso en A100), no trasladable directamente a generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad (OpenWebText, bloque 512) | Naturaleza | Licencia |
|---|---|---|---|---|---|
| PMX (este modelo) | 76,6 M | 512 | 54,63 | Conservativo, sin atencion, con registros Poisson | CC BY 4.0 |
| SR2 | no disponible (misma configuracion d384/L2) | 512 | 58,32 | Conservativo, sin atencion, sin registros | no disponible |
| F3.1 | no disponible (misma configuracion d384/L2) | 512 | 57,76 | Conservativo, sin atencion, paso partido | no disponible |
| Fock-PARFLM L=2 | no disponible (misma configuracion d384/L2) | 512 | 53,12 | No conservativo, espacio de Fock | no disponible |
| Brazo `gpt2-matched` | no disponible | 512 | 49,81 | Referencia tipo GPT-2 del autor | no disponible |

La comparacion solo es valida dentro del ladder del autor, que fija corpus, tokenizador, presupuesto de tokens (532,48 M) y lotes de validacion. Frente a un transformer estandar, la referencia GPT-2 del propio autor obtiene 49,81 de perplejidad, un 9,7 % mejor que PMX, a costa de perder las propiedades de memoria constante y fuerzas conservativas.

## Limitaciones y advertencias

- Modelo de investigacion: no hay instruction tuning, RLHF ni DPO; no sigue instrucciones ni mantiene formato conversacional.
- Solo ingles; no se declara soporte de otros idiomas ni se han evaluado.
- Ventana de contexto limitada a 512 tokens; no se declara extension y la arquitectura no usa atencion, por lo que no hay mecanismo estandar de extrapolacion.
- Subentrenado por diseno: 7 tokens por parametro, un tercio de la relacion compute-optimal segun el propio autor, de modo que las cifras de calidad no representan el techo del enfoque.
- Bajo el criterio pre-registrado del autor, PMX no es apto para refinamiento posterior (SR2 si lo es); usarlo como base de un ajuste fino se sale de las condiciones del estudio.
- Riesgo de alucinacion: alto en terminos relativos, propio de un modelo base de 76,6 M de parametros con perplejidad 54,63; no hay filtrado ni evaluacion de veracidad.
- Sesgos: no se documenta ninguna evaluacion de sesgo; el corpus es OpenWebText, con los sesgos de su filtrado de enlaces de Reddit.
- Naturaleza conservativa: el acoplamiento es lineal en la ocupacion, asi que el modelo solo reproduce la media del proceso de Poisson y no sus fluctuaciones; las afirmaciones "bosonicas" deben leerse en ese sentido restringido.
- Restricciones de licencia: CC BY 4.0 permite uso comercial con atribucion, pero no hay garantias ni soporte; el uso en produccion exige ademas mantener el codigo de integracion, que no forma parte de un ecosistema estandar.
- Coste computacional: 2,98 s por paso de entrenamiento en A100, un 73 % mas que SR2, debido a la resolucion de autovalores por token y capa; no hay datos de latencia de inferencia.
- Falta de soporte de herramientas: sin kernels optimizados, sin integracion con vLLM, llama.cpp, Ollama o TGI, y sin formato GGUF, lo que bloquea despliegues convencionales.
- Metricas no verificadas: la perplejidad declarada figura con `verified: false` en el `model-index`.
- Enlaces incompletos: el autor menciona un suplemento teorico y una ficha FO-b-PMX cuya URL aparece truncada en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm64-pmx16-sr2
- Modelo SR2 (misma base sin registros): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2
- Modelo F3.1 (conservativo con paso partido): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc
- Modelo Fock-PARFLM L=2 (no conservativo): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none
- Brazo de referencia GPT-2 del autor: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-gpt2-matched
- Coleccion Gen 3 (ladder de gradientes vivos): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext
- Paper, blog o repositorio independiente: no disponible en la informacion proporcionada.
