# At1uri/physics-informed-neural-pde-solver

## Resumen

Physics-Informed Neural PDE Solver (PINN) es un modelo de machine learning cientifico (SciML) publicado en Hugging Face por el desarrollador independiente Ramprasad Atluri (usuario At1uri). Implementa una red neuronal informada por la fisica (Physics-Informed Neural Network) para resolver ecuaciones en derivadas parciales parabolicas multidimensionales sin necesidad de discretizacion espacial de malla. Su aplicacion concreta documentada es la ecuacion de Black-Scholes-Merton, el operador diferencial que gobierna la valoracion de opciones financieras, lo que lo situa en la interseccion entre finanzas cuantitativas y aprendizaje automatico cientifico.

El modelo aprende una funcion u_theta(S, tau) que mapea el precio del subyacente y el tiempo hasta el vencimiento a un valor de opcion, minimizando un funcional de perdida compuesto de tipo Sobolev que combina tres terminos: el residuo del operador diferencial en el interior del dominio, la condicion de payoff terminal y las condiciones asintoticas de contorno de Dirichlet y Neumann. Este enfoque permite obtener no solo la solucion u, sino tambien sus derivadas espaciales exactas (las griegas Delta y Gamma), algo relevante para la gestion de riesgos.

La relevancia del modelo es doble. Por un lado, demuestra un caso de uso de PINNs en un dominio con solucion analitica conocida, lo que facilita la verificacion cuantitativa del error. Por otro, su publicacion es muy reciente (noviembre de 2026) y cuenta con cero descargas y cero likes en el momento de redactar esta ficha, por lo que debe considerarse un artefacto de investigacion incipiente mas que un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Physics-Informed Neural Network (PINN); red neuronal feedforward que aproxima u_theta(S, tau) y se entrena minimizando un funcional de perdida de Sobolev |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; entrada tabular de dos variables: S y tau) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (segun metadatos; el modelo no procesa lenguaje natural, el campo es informativo) |
| Licencia | MIT |
| Formato de pesos | no disponible (libreria declarada: scikit-learn; no se especifica el formato de serializacion) |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal que aproxima la funcion u_theta(S, tau): R+ x [0, T] -> R+, es decir, una funcion de dos entradas escalares y una salida escalar. El entrenamiento no se basa en pares etiquetados de soluciones, sino en la minimizacion de un funcional de perdida compuesto: L_total = lambda_PDE * L_interior + lambda_IC * L_initial + lambda_BC * L_boundary. El termino interior penaliza el residuo del operador de Black-Scholes-Merton, que incluye derivadas primeras y segundas de la red respecto al precio del subyacente; el termino inicial impone el payoff terminal max(S - K, 0) en tau = 0; y el termino de contorno impone las condiciones asintoticas en S -> 0 y S -> S_max.

El muestreo del dominio de colocacion se realiza mediante una rejilla de hipercubo latino (Latin Hypercube) con N_f = 5.000 nodos de colocacion. No se detalla en la informacion disponible el numero de capas, neuronas por capa, funcion de activacion, optimizador, tasa de aprendizaje ni numero de iteraciones de entrenamiento. Tampoco se especifica si se emplearon tecnicas auxiliares como entrenamiento por curriculum, weighting adaptativo de los terminos de perdida o calculo de derivadas de orden superior mediante diferenciacion automatica de segundo orden, aunque esta ultima es implicita en la formulacion del residuo.

La innovacion tecnica destacable es el uso de una perdida en espacio de Sobolev H1, que penaliza no solo el error en la solucion sino tambien el error en sus derivadas, lo que resulta coherente con la necesidad de obtener griegas precisas en valoracion de derivados financieros.

## Capacidades

- Resolucion de ecuaciones en derivadas parciales parabolicas multidimensionales sin discretizacion de malla espacial.
- Valoracion de opciones europeas bajo el modelo de Black-Scholes-Merton con parametros de strike, tipo de interes libre de riesgo y volatilidad configurables.
- Evaluacion de derivadas espaciales exactas de la solucion: Delta (du/dS) y Gamma (d^2u/dS^2), calculadas mediante diferenciacion automatica.
- Calculo del residuo del operador diferencial en puntos arbitrarios del dominio, util como diagnostico de calidad de la solucion.
- Regresion tabular sobre entradas continuas (S, tau) segun el pipeline declarado.
- No dispone de soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades de vision, audio o thinking mode.
- Capacidades multilingues: no aplica; el modelo no procesa lenguaje natural.

## Casos de uso

- Valoracion de opciones europeas en tiempo real: el modelo evalua u(S, tau) para un strike, tipo de interes y volatilidad dados, lo que permite obtener precios de opciones sin resolver numericamente la EDP en cada consulta. Es adecuado para escenarios donde se requiere una evaluacion rapida y repetida sobre una malla de precios y vencimientos.
- Calculo de griegas para gestion de riesgos: la evaluacion devuelve Delta y Gamma de forma directa mediante diferenciacion automatica, lo que simplifica el calculo de sensibilidades de una cartera de derivados frente a movimientos del subyacente.
- Verificacion de motores de valoracion existentes: al disponer de solucion analitica de referencia para Black-Scholes, el modelo puede usarse como banco de pruebas para validar implementaciones numericas (diferencias finitas, Monte Carlo) en un rango controlado de parametros.
- Investigacion en SciML: sirve como implementacion de referencia de una PINN con perdida de Sobolev para experimentar con variantes de la funcion de perdida, pesos lambda, estrategias de muestreo o arquitecturas alternativas en un problema con solucion conocida.
- Generacion de superficies de volatilidad implicita sinteticas: evaluando el modelo sobre rejillas de S y tau se pueden construir superficies de precios que alimenten estudios de calibracion o simulaciones de estrategias.
- Docencia y formacion en finanzas cuantitativas: el ejemplo permite ilustrar de forma tangible la relacion entre el operador de Black-Scholes, las condiciones de contorno y las griegas, con diagnosticos de error cuantificados.
- Prototipado de resolucion de EDPs parabolicas en otros dominios: la formulacion (residuo interior + condicion inicial + condiciones de contorno) es trasladable a problemas de difusion y calor, aunque el modelo publicado esta especializado en el operador financiero.

## Benchmarks y rendimiento

Los unicos datos de verificacion publicados en la model card son los diagnosticos de la perdida de Sobolev H1, que se recogen a continuacion. No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

| Metrica | Valor objetivo | Valor calibrado de la PINN |
|---|---|---|
| Nodos de colocacion (N_f) | 5.000 puntos | Rejilla de hipercubo latino |
| Error cuadratico medio del residuo interior de la EDP | 0,00 | 1,77 x 10^-7 |
| Error relativo en espacio de Sobolev H1 | < 0,5 % | 0,00185 (0,18 %) |
| MSE del payoff terminal | 0,00 | 8,42 x 10^-6 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo es una red neuronal de dos entradas y una salida; el consumo de memoria es presumiblemente minimo, pero no se publican cifras.
- GPU recomendadas: no disponible. Por la naturaleza del modelo, una GPU consumer moderna seria mas que suficiente, pero no hay datos que lo confirmen.
- Compatibilidad con GPU consumer: probablemente si, dado el reducido tamano de entrada y salida, aunque no se especifica el numero de parametros ni el tamano del artefacto.
- Opciones de despliegue: la libreria declarada es scikit-learn, por lo que el despliegue se realizaria presumiblemente via pickle/joblib en Python; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos sobre modelos comparables de PINNs para valoracion de opciones con los que establecer una comparacion cuantitativa de parametros, contexto, rendimiento o licencia. Las alternativas metodologicas clasicas (diferencias finitas, arboles binomiales, Monte Carlo) no son modelos de machine learning y no se comparan en la model card.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| At1uri/physics-informed-neural-pde-solver | no disponible | no aplica | Error H1 del 0,18 % (autoreportado) | MIT | Hugging Face |
| Alternativas PINN comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Alcance restringido: el modelo esta especializado en el operador de Black-Scholes-Merton con payoff de opcion call europea; no es un solver generico de EDPs parabolicas arbitrarias pese al nombre.
- Ausencia de validacion independiente: los diagnosticos de error son autoreportados por el autor y no han sido replicados por terceros; las cero descargas y cero likes indican que no hay evidencia de uso externo.
- Falta de documentacion tecnica: no se publican el numero de parametros, la arquitectura de capas, el optimizador, el numero de iteraciones ni el formato de pesos, lo que dificulta la reproducibilidad.
- Riesgo de extrapolacion: el comportamiento fuera del dominio de colocacion y de los rangos de strike, interes y volatilidad usados en el entrenamiento no esta documentado.
- Sesgos: no aplica en el sentido de sesgos sociales, pero si existe un sesgo de modelo hacia los supuestos de Black-Scholes (volatilidad constante, ausencia de dividendos, mercado sin fricciones), que no reflejan la realidad de los mercados.
- Uso en produccion: no recomendable sin una validacion propia contra soluciones analiticas o numericas de referencia en el rango de parametros de interes.
- Licencia MIT: permite uso comercial y derivados, pero no exime de la responsabilidad de validar los resultados financieros.
- Idioma: el campo de idioma "en" es informativo; el modelo no procesa texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/At1uri/physics-informed-neural-pde-solver
- Perfil del autor: https://huggingface.co/At1uri
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios ni demos adicionales.
