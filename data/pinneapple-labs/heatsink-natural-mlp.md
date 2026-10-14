# PINNeAPPle-Labs/heatsink-natural-mlp

## Resumen

heatsink_natural_mlp es un modelo sustituto (surrogate) de red neuronal desarrollado por PINNeAPPle-Labs dentro de su ModelRegistry, orientado al calculo de la resistencia termica base-aire de disipadores de aletas planas en conveccion natural. No es un modelo de lenguaje ni un modelo generativo: es un regresor tabular que recibe 12 variables escalares de geometria, material y condiciones de operacion y devuelve la resistencia termica junto con una cota superior conformal al 95 %.

El modelo resuelve un problema clasico de diseno electronico: evaluar rapidamente si un disipador refrigerado por aire en regimen de conveccion natural es suficiente para disipar una potencia dada. Sustituye la resolucion iterativa del motor fisico HeatSink Sizer, que combina la correlacion compuesta de Bar-Cohen y Rohsenow (1984) para placas paralelas verticales con una conduccion 3-D por volumenes finitos en la base. La arquitectura es un perceptron multicapa pequeno (4 capas ocultas de 128 unidades con activacion SiLU, 12 entradas y 1 salida) entrenado sobre 5000 resoluciones del motor fisico, con un penalizador tipo hinge que impone monotonicidad fisica.

Su relevancia es acotada pero clara: demuestra un flujo de trabajo de IA para ingenieria en el que el sustituto no solo aproxima la fisica, sino que cuantifica su propia incertidumbre (cota conformal) y respeta restricciones de monotonicidad derivadas de la teoria, con una validacion sobre 750 disenos retenidos. Esta pensado como herramienta de cribado previo, no como sustituto de la verificacion con el motor fisico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa (MLP) feed-forward, 12 entradas, 4 capas ocultas de 128 unidades, 1 salida, activacion SiLU |
| Parametros totales | no disponible (no se publica el recuento; topologia declarada: `{"in_dim": 12, "out_dim": 1, "width": 128, "depth": 4, "act": "silu"}`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; vector de entrada fijo de 12 variables escalares) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo numerico, no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de HuggingFace con tamano declarado de 0.0 GB; la carga se realiza mediante `pinneapple.zoo.load`) |

Nota: el modelo declara `library_name: pinneapple` y no presenta pipeline de HuggingFace asignado.

## Arquitectura y entrenamiento

La arquitectura es un MLP de tipo `bench_mlp` con dimension de entrada 12, dimension de salida 1, anchura 128 y profundidad 4, con activacion SiLU. La variable objetivo se transforma a escala logaritmica (`targets: ["log R"]`) y la geometria, el material y las variables de operacion se entrenan tambien en escala logaritmica. El modelo incorpora una restriccion de monotonicidad declarada mediante el diccionario `monotone: {"log_k": -1, "log_fw": -1}`: un penalizador hinge mantiene negativas las derivadas `d log R / d log k` y `d log R / d log(fw)` tanto en los disenos de entrenamiento como en disenos aleatorios dentro del rango de validez. Es decir, la resistencia termica debe decrecer al aumentar la conductividad termica del material y al aumentar la anchura de la fuente de calor.

El entrenamiento se realizo sobre 5000 resoluciones del motor fisico HeatSink Sizer en regimen de conveccion natural. Dicho motor combina la correlacion compuesta de Bar-Cohen y Rohsenow (1984) para conveccion natural entre placas paralelas verticales con un calculo 3-D por volumenes finitos de la conduccion en la base (resistencia de expansion). El motor de referencia se valida frente a metodos independientes: coeficiente convectivo natural frente a Elenbaas (1942) con un 2 % de desviacion, resistencia de expansion frente a Lee et al. con 1-5 %, y convergencia de malla FVM inferior al 2 %. La validacion del sustituto se realizo sobre 750 disenos retenidos resueltos por el motor. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de ajuste similares; tampoco se detalla la composicion exacta del dataset de entrenamiento mas alla de su origen (`apps/heatsink_sizer/artifacts/dataset_natural.json.gz`) y su nombre (`heatsink_natural_convection`).

El modelo devuelve dos salidas: `r_base_k_w` (resistencia termica base-aire) y `r_base_upper95_k_w`, una cota superior obtenida mediante conformal prediction con division (split-conformal) al 95 % de confianza.

## Capacidades

- Regresion de resistencia termica base-aire (`r_base_k_w`) para disipadores de aletas planas verticales en conveccion natural en aire libre, sin radiacion.
- Estimacion de incertidumbre mediante cota superior conformal al 95 % (`r_base_upper95_k_w`), con cobertura empirica medida del 97,07 % sobre el conjunto de test.
- Cumplimiento de restricciones fisicas de monotonicidad respecto a la conductividad termica del material y a la anchura de la fuente de calor.
- Aceptacion de 11 variables de entrada geometricas y de operacion: anchura, profundidad y espesor de base, numero de aletas, espesor y altura de aleta, conductividad termica, anchura y profundidad de la huella de la fuente, temperatura ambiente y potencia disipada.
- Integracion con el ecosistema PINNeAPPle mediante `pinneapple.zoo.load` y `pinneapple.zoo.evaluate`.
- No dispone de generacion de texto, razonamiento, codigo, matematicas simbolicas, vision, audio, tool calling, capacidades de agente ni soporte multilingue, por tratarse de un modelo numerico de proposito especifico.

## Casos de uso

- Cribado de disipadores en diseno electronico: dado un catalogo de disipadores comerciales, el modelo permite descartar en milisegundos las geometrias que no alcanzan la resistencia termica objetivo, reservando el motor fisico completo para las pocas candidatas que superan el filtro.
- Optimizacion de geometria de aletas: el modelo evalua combinaciones de numero de aletas, espesor y altura dentro del rango de validez (`n_fins`, `fin_thickness_mm` en [0,6; 4,0] mm, `fin_height_mm` en [8,0; 80,0] mm) para explorar el compromiso entre area de intercambio y separacion entre aletas.
- Seleccion de material segun coste: la monotonicidad garantizada respecto a `k_w_mk` permite trazar curvas de sensibilidad fiables para decidir entre aluminio y cobre en el rango de conductividad modelado (150-400 W/(m K)).
- Dimensionado de la huella de la fuente de calor: la anchura y la profundidad de la fuente se expresan como fracciones del area de base (`source_frac_w` y `source_frac_d` en [0,15; 1,0]), lo que permite evaluar el efecto de la resistencia de expansion para distintos encapsulados.
- Analisis de margen de seguridad termico: usando la cota conformal `r_base_upper95_k_w`, un ingeniero puede dimensionar con un nivel de confianza declarado en lugar de con el valor puntual, util en entornos con requisitos de fiabilidad.
- Precalentamiento de bucles de simulacion: el sustituto puede actuar como paso previo en un pipeline de optimizacion Bayesiana o de algoritmos geneticos, donde se requieren decenas de miles de evaluaciones y el motor fisico seria prohibitivo.
- Verificacion de coherencia en herramientas internas de CAD termico: integrado en una herramienta de diseno, el modelo aporta una estimacion inmediata mientras el usuario ajusta parametros, con la advertencia de que la verificacion final debe hacerse con el motor fisico.

## Benchmarks y rendimiento

Resultados de validacion publicados por el autor sobre 750 disenos retenidos resueltos por el motor fisico HeatSink Sizer. El error se mide contra el motor, no contra mediciones experimentales.

| Metrica | Valor |
|---|---|
| test/R_mean_abs_pct | 0,4687 % |
| test/R_p95_abs_pct | 1,5446 % |
| test/R_max_abs_pct | 4,4334 % |
| test/R_upper95_coverage_pct | 97,0667 % |
| test/n | 750 |

No se han publicado resultados de benchmarks comparativos frente a otros modelos sustitutos en la informacion disponible. La validacion del motor de referencia frente a metodos independientes es la siguiente: coeficiente convectivo natural frente a Elenbaas (1942), 2 %; resistencia de expansion frente a Lee et al., 1-5 %; convergencia de malla FVM, inferior al 2 %. El autor declara una decision de confianza "APPROVED" con puntuacion 1,00 y cobertura del 100 %.

## Requisitos de hardware

- No se publican requisitos de hardware en la informacion disponible.
- Por la topologia declarada (MLP de 4 capas de 128 unidades y 12 entradas), la inferencia es viable en CPU sin aceleracion dedicada, incluido hardware de portatil o sistemas embebidos.
- No requiere GPU; cualquier GPU, incluso integrada, es sobradamente suficiente si se desea acelerar lotes grandes.
- Despliegue mediante la libreria `pinneapple` (`import pinneapple as pp; m = pp.zoo.load("heatsink_natural_mlp")`). No se documentan rutas de despliegue alternativas como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.
- El repositorio de HuggingFace declara un tamano de 0.0 GB, lo que sugiere que los pesos son muy ligeros o que se descargan a traves del registro de PINNeAPPle en lugar de residir en el repositorio.

## Comparativa con modelos similares

No se han identificado en la informacion disponible modelos sustitutos publicos comparables para resistencia termica de disipadores en conveccion natural. Como referencia funcional, se compara con el motor fisico que aproxima:

| Alternativa | Tipo | Coste por evaluacion | Error | Cota de incertidumbre | Licencia |
|---|---|---|---|---|---|
| heatsink_natural_mlp | MLP sustituto | no disponible | 0,469 % medio, 4,433 % maximo frente al motor | Si, conformal al 95 % (cobertura 97,07 %) | Apache 2.0 |
| HeatSink Sizer (motor fisico) | Correlacion Bar-Cohen & Rohsenow + FVM 3-D | no disponible | Referencia; +-15 % tipico frente a experimentos segun el autor | No | No disponible |
| Correlacion analitica de Bar-Cohen & Rohsenow | Formula cerrada | Muy bajo | 2 % frente a Elenbaas en h natural (validacion del motor) | No | No disponible |

No se dispone de datos de parametros, contexto ni rendimiento para modelos comparables de terceros.

## Limitaciones y advertencias

- El modelo no incluye radiacion. En potencias bajas, la radiacion puede transportar una fraccion comparable del calor en disipadores anodizados en negro; el autor advierte explicitamente que la referencia no la modela.
- La referencia subyacente es una correlacion, con un +-15 % tipico frente a experimentos. El error publicado del sustituto (0,469 % medio) es contra el motor, no contra una medicion real, por lo que no debe interpretarse como precision fisica absoluta.
- El motor de referencia presenta un aumento de resistencia con la potencia en el 0,5 % de los disenos, debido a una mezcla no monotona de correlaciones. La ley de potencia se comprueba sobre el modelo pero no se impone durante el entrenamiento, por lo que ese comportamiento puede aparecer en el sustituto.
- Herramienta de cribado declarada por el autor: todo diseno seleccionado debe reverificarse con el motor fisico.
- Rango de validez estricto. Fuera de los intervalos declarados los resultados no son fiables: `base_width_mm` y `base_depth_mm` en [30, 200] mm, `base_thickness_mm` en [2, 15] mm, `fin_thickness_mm` en [0,6; 4,0] mm, `fin_height_mm` en [8, 80] mm, `k_w_mk` en [150, 400] W/(m K), `source_frac_w` y `source_frac_d` en [0,15; 1,0], `t_ambient_c` en [0, 50] grados C, `power_w` en [1, 80] W y separacion entre aletas realizada entre 2,2 y 30,6 mm.
- Regimen restringido: conveccion natural en aire libre, aletas verticales y sin radiacion. No cubre conveccion forzada, ventilacion asistida, orientaciones distintas ni radiacion.
- La separacion entre aletas se muestreo entre 2,5 y 20 mm y despues se redondeo el numero de aletas, de modo que las separaciones realizadas abarcan 2,2-30,6 mm; la extrapolacion a separaciones muy pequenas o muy grandes no esta respaldada.
- La fecha declarada de creacion y actualizacion del repositorio (13 de octubre de 2026) es posterior a la fecha de la ficha; conviene verificar la vigencia del artefacto antes de integrarlo.
- No se documentan sesgos en el sentido estadistico habitual, pero al ser un sustituto entrenado sobre un muestreo concreto de disenos, puede presentar sesgo hacia las regiones mejor representadas del espacio de parametros.
- Licencia Apache 2.0, que permite uso comercial y modificacion con las obligaciones habituales de atribucion y conservacion de avisos. El autor solicita citar el software PINNeAPPle mediante su DOI de Zenodo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PINNeAPPle-Labs/heatsink-natural-mlp
- Repositorio GitHub de PINNeAPPle: https://github.com/PINNeAPPle-Labs/PINNeAPPle
- DOI del software PINNeAPPle (Zenodo): https://doi.org/10.5281/zenodo.23343062
- Fichero de cita CITATION.cff: https://github.com/PINNeAPPle-Labs/PINNeAPPle/blob/main/CITATION.cff
- Documentacion de la funcion de monotonicidad `pinneapple_design.thermal.heatsink.monotone`: incluida en el repositorio de PINNeAPPle (ruta de modulo citada en la model card)
- Dataset de entrenamiento: `heatsink_natural_convection`, origen `apps/heatsink_sizer/artifacts/dataset_natural.json.gz` (no se proporciona URL publica en la informacion disponible)
