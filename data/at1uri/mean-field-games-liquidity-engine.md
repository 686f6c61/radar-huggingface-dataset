# At1uri/mean-field-games-liquidity-engine

## Resumen

El repositorio `At1uri/mean-field-games-liquidity-engine` es un motor de inferencia basado en teoria de juegos de campo medio (Mean Field Games, MFG) para modelar espirales de liquidez, ventas forzosas (fire sales) y corridas bancarias en mercados financieros. Lo desarrolla el usuario At1uri como parte de una supuesta "Institutional Quantitative AI Suite". No es un modelo de lenguaje ni una red neuronal entrenada con descenso de gradiente: es un solver de ecuaciones en derivadas parciales (EDP) acopladas hacia delante y hacia atras (forward-backward) que resuelve el sistema Lasry-Lions (2007) / Huang-Caines-Malhame (2006) para un continuo de participantes atomisticos.

El nucleo matematico combina una ecuacion de Hamilton-Jacobi-Bellman (HJB) hacia atras, que describe la politica optima de liquidacion de un banco representativo, con una ecuacion de Fokker-Planck-Kolmogorov (FPK) hacia delante, que describe la evolucion de la distribucion de inventarios de la poblacion. Para el caso lineal-cuadratico, la solucion se obtiene en forma cerrada mediante una ecuacion matricial de Riccati, lo que evita la resolucion numerica de la EDP y permite calcular el equilibrio de Nash instantaneamente.

Su relevancia es acotada: el pipeline declarado es `feature-extraction`, pero no hay pesos en formato safetensors ni GGUF, sino scripts Python y ficheros JSON con funciones de valor y campos de densidad precalculados. La model card esta fechada en noviembre de 2026, el repositorio tiene cero descargas y cero likes, y no se ha publicado validacion externa. Debe tratarse como material de investigacion reproducible, no como un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Solver de EDP acopladas forward-backward (HJB + Fokker-Planck-Kolmogorov) con solucion cerrada de Riccati para el caso lineal-cuadratico |
| Parametros totales | no disponible (no es una red neuronal; no hay parametros aprendidos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a un solver de EDP) |
| Tipos de cuantizacion | no disponible (no hay pesos que cuantizar) |
| Idiomas soportados | en (documentacion y API en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | JSON (`mfg_equilibrium_weights.json`, `benchmarks.json`) y codigo Python (`mfg_solver.py`); sin safetensors ni GGUF |

## Arquitectura y entrenamiento

La formulacion parte de un continuo de instituciones con inventario \(X_t \in \mathbb{R}\) que liquidan a velocidad \(v_t = \dot{X}_t\). El problema de control optimo del agente representativo minimiza friccion de ejecucion cuadratica (\(\gamma/2 \, v_t^2\)), coste de mantenimiento de inventario (\(\phi/2 \, X_t^2\)), impacto permanente acoplado a la media poblacional (\(\theta X_t \bar{V}_t\)) y penalizacion terminal (\(\alpha/2 \, X_T^2\)). La funcion de valor \(u(t,x)\) satisface una HJB parabolica hacia atras; la velocidad optima de retroalimentacion es \(v^*(t,x) = -\partial_x u(t,x)/\gamma\). La densidad de inventarios \(m(t,x)\) evoluciona segun una FPK hacia delante con difusion \(\sigma^2/2\) y transporte por \(v^*\).

Para el regimen lineal-cuadratico se impone \(u(t,x) = \tfrac{1}{2}\eta(t)x^2\), con \(\eta(t)\) solucion de \(\dot{\eta} = \eta^2/\gamma - \phi\), \(\eta(T)=\alpha\), y forma cerrada con \(\omega = \sqrt{\phi/\gamma}\) que combina cosenos y senos hiperbolicos. La media agregada obedece \(\dot{\bar{X}}_t = \bar{V}_t = -(\eta(t)+\theta)\bar{X}_t/\gamma\). No hay entrenamiento, RLHF ni DPO: no se ajusta ningun parametro a datos. Los coeficientes \(\gamma, \theta, \phi, \alpha, \sigma\) se fijan por escenario. La innovacion tecnica es la reduccion del sistema HJB-FPK a una EDO de Riccati con solucion analitica, lo que da resultados deterministas y auditables, a costa de restringirse al regimen lineal-cuadratico y a un unico bien agregado.

## Capacidades

- Calculo del equilibrio de Nash de liquidacion para un continuo de agentes con acoplamiento de impacto permanente.
- Resolucion en forma cerrada de la ecuacion de Riccati para el coste de inventario \(\eta(t)\) y de la media agregada \(\bar{X}_t\).
- Estimacion de la caida de precio bajo equilibrio frente a una estrategia miope de panico, y del ahorro por coordinacion en puntos porcentuales.
- Calculo de la vida media de liquidez (liquidity half-life) en horas para cada regimen.
- Generacion de funciones de valor y campos de densidad precalculados exportables a JSON.
- Escenarios parametrizables mediante \(\gamma\) (friccion), \(\theta\) (acoplamiento de rebaño), \(\phi\) (coste de inventario), \(\alpha\) (penalizacion terminal) y \(\sigma\) (volatilidad).
- No soporta tool calling, function calling, agentes multi-paso, vision, audio, ni razonamiento en lenguaje natural.
- No dispone de capacidades multilingues: la interfaz y la documentacion estan en ingles.

## Casos de uso

- Simulacion de cascadas de fire sale tipo Archegos: con \(\gamma=0.05\) y \(\theta=0.35\), el solver devuelve una caida de precio de equilibrio del -11,91 % frente al -17,13 % de una estrategia miope, util para estimar el impacto agregado de un desapalancamiento coordinado.
- Analisis de corridas bancarias (SVB): con \(\gamma=0.02\) y \(\theta=0.45\), modela la retroalimentacion entre retiradas de depositos y ventas de activos, con vida media de liquidez de 0,042 horas, para calibrar umbrales de intervencion regulatoria.
- Estudio de microestructura en flash crashes: con \(\gamma=0.12\) y \(\theta=0.20\) reproduce la dinamica de 0,250 horas de vida media y permite comparar el coste de ejecucion entre ejecucion optima y panico.
- Diseno de planes de desmonte ordenado: con \(\gamma=0.06\) y \(\theta=0.05\) cuantifica el ahorro por coordinacion (+3,81 %) en una liquidacion institucional planificada.
- Calibracion de modelos de riesgo de liquidez: los campos de densidad \(m(t,x)\) y las funciones de valor \(\eta(t)\) sirven como entradas para stress tests internos y para validar modelos de impacto de mercado.
- Docencia e investigacion en teoria de juegos de campo medio: el codigo reproduce paso a paso la derivacion Lasry-Lions y permite experimentar con parametros sin infraestructura de computo intensivo.
- Generacion de superficies 3D de valor y mapas de calor de densidad para comunicacion con comites de riesgo, mediante la aplicacion web asociada.

## Benchmarks y rendimiento

Los unicos datos publicados son los de la model card, medidos sobre cuatro escenarios de crisis definidos por el propio autor. No hay comparacion con solvers numericos de referencia ni validacion con datos de mercado reales.

| Regimen de crisis | Friccion \(\gamma\) | Acoplamiento \(\theta\) | Caida Nash | Caida panico miope | Ahorro por coordinacion | Vida media de liquidez |
|---|---|---|---|---|---|---|
| Archegos fire sale cascade | 0,05 | 0,35 | -11,91 % | -17,13 % | +5,21 % | 0,083 h |
| Silicon Valley Bank run | 0,02 | 0,45 | -16,17 % | -23,65 % | +7,48 % | 0,042 h |
| Flash crash microstructure | 0,12 | 0,20 | -10,63 % | -14,88 % | +4,25 % | 0,250 h |
| Desmonte institucional ordenado | 0,06 | 0,05 | -10,52 % | -14,33 % | +3,81 % | 0,333 h |

No se han publicado resultados en benchmarks estandar de IA (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no aplican a este tipo de artefacto.

## Requisitos de hardware

- No requiere GPU: el solver es Python puro sobre formulas cerradas, ejecutable en CPU.
- VRAM estimada: 0 GB en el caso lineal-cuadratico con solucion de Riccati.
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente. Solo si se extendiera a resolucion numerica de la EDP en malla fina seria recomendable una GPU (A100, H100 o RTX 4090) para acelerar diferencias finitas o elementos finitos.
- Cabe en cualquier portatil; no hay requisito de memoria mas alla de la necesaria para cargar los JSON de equilibrio y densidad.
- Opciones de despliegue: importacion directa del modulo `mfg_solver.py` o servicio HTTP envolvente; no aplican vLLM, llama.cpp, Ollama ni TGI porque no hay pesos de red neuronal.
- Latencia y throughput: no publicados; por la forma cerrada cabe esperar tiempos de microsegundos a milisegundos por escenario, pero no hay medicion en la informacion disponible.

## Comparativa con modelos similares

| Modelo / herramienta | Tipo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| At1uri/mean-field-games-liquidity-engine | Solver MFG analitico | no aplica | no aplica | HJB + FPK lineal-cuadratico, Riccati cerrado | Apache 2.0 | Hugging Face, 0 descargas |
| Solver MFG numerico generico (p. ej. mallas finitas propias) | Solver numerico de EDP | no aplica | no aplica | Diferencias finitas / elementos finitos sobre HJB-FPK | variable | Implementacion propia |
| Modelos de impacto de mercado tipo Almgren-Chriss | Modelo analitico de ejecucion optima | no aplica | no aplica | Control optimo un agente, sin acoplamiento de campo medio | variable | Literatura y librerias financieras |
| Simuladores basados en agentes (ABM) de liquidez | Simulacion estocastica | no aplica | no aplica | Agentes discretos con reglas heuristicas | variable | Repositorios academicos |

No se dispone de comparaciones de rendimiento publicadas frente a estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Restriccion al regimen lineal-cuadratico: la forma cerrada de Riccati solo es valida con costes cuadraticos y acoplamiento lineal; desviaciones requieren resolucion numerica no incluida.
- Modelo de un unico activo agregado: no captura correlaciones entre activos, contagio entre clases ni estructura de red del sistema financiero.
- Sin validacion externa: los cuatro escenarios de benchmark estan definidos por el propio autor, sin calibracion con datos reales de Archegos, SVB o flash crashes.
- Datos de rendimiento no reproducibles de forma independiente: cero descargas y cero likes en el momento de redactar la ficha.
- Ausencia de pesos y de pipeline de inferencia estandar: la etiqueta `feature-extraction` es enganosa; no es un modelo de lenguaje ni produce embeddings de texto.
- Riesgo de sobreinterpretacion: un resultado de caida de precio del -11,91 % no debe usarse como prediccion operativa sin contraste con datos de mercado.
- Idiomas: documentacion e interfaz solo en ingles; no hay soporte multilingue.
- Licencia Apache 2.0 permite uso comercial, pero al ser codigo de investigacion sin garantias, el autor no ofrece soporte ni mantenimiento.
- Sensibilidad a los parametros: pequenos cambios en \(\gamma\), \(\theta\), \(\phi\) o \(\alpha\) alteran sustancialmente los resultados; no se documenta analisis de sensibilidad ni intervalos de confianza.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/At1uri/mean-field-games-liquidity-engine
- Aplicacion web (Mean Field Games Liquidity Spiral Studio): https://huggingface.co/spaces/At1uri/mean-field-games-liquidity-spiral-studio
- Perfil del autor: https://huggingface.co/At1uri
- Referencia teorica citada: Lasry, J.-M. y Lions, P.-L. (2007), "Mean field games", Japanese Journal of Mathematics.
- Referencia teorica citada: Huang, M., Caines, P. E. y Malhame, R. P. (2006), "Large population stochastic dynamic games: closed-loop McKean-Vlasov systems and the Nash certainty equivalence principle", Communications in Information and Systems.
- Ficheros del repositorio: `mfg_solver.py`, `mfg_equilibrium_weights.json`, `benchmarks.json` (accesibles desde la pestana "Files and versions" del repositorio).
