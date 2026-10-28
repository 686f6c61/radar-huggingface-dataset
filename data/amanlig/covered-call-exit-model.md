# amanlig/covered-call-exit-model

## Resumen

`amanlig/covered-call-exit-model` es un motor de escenarios estadisticos escrito en Python (solo biblioteca estandar) que compara tres alternativas para una posicion de covered call: cerrar ahora, esperar para cerrar, o hacer roll de la call y cerrar la posicion resultante mas adelante. No es un modelo de lenguaje ni una red neuronal: no tiene pesos, no tiene pipeline de entrenamiento y no expone una API de inferencia alojada. El repositorio contiene codigo, datos sinteticos y artefactos de ejemplo.

El nucleo combina dos metodos: un bootstrap historico de retornos logaritmicos diarios de los tres meses naturales anteriores para generar trayectorias de precio de la accion, y la formula de Black-Scholes para calls europeas con volatilidad implicita constante calibrada por contrato, con el fin de valorar el pasivo de la opcion en una salida futura. Sobre esa base estima flujos de caja en USD y el beneficio de la posicion completa, y ordena las calls de reemplazo segun criterios explicitos de strike, vencimiento y calidad de cotizacion. El ejemplo de referencia usa 600 trayectorias simuladas, un horizonte de revision de 30 dias de trading y una tasa de descuento continua del 4 % anual.

Su relevancia es acotada y muy especifica: sirve como referencia reproducible y auditable de la aritmetica de decision en estrategias covered call, y como banco de pruebas para integrar valoracion de opciones en un flujo de analisis. La model card advierte explicitamente de que los resultados de ejemplo ilustran la aritmetica y los supuestos del modelo, y no demuestran que un roll vaya a superar al cierre en mercados reales. El repositorio pesa 0,0 GB, tiene 0 descargas y 0 likes, y la licencia no esta declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: motor estadistico determinista (bootstrap historico + Black-Scholes europeo), sin red neuronal ni pesos |
| Parametros totales | No aplica (no hay parametros entrenados; el codigo es Python de biblioteca estandar) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica. Parametros de simulacion: ventana historica de 3 meses naturales de cierres diarios; horizonte de revision configurable (por defecto 30 dias de trading); 600 trayectorias por defecto |
| Tipos de cuantizacion | No aplica (no hay pesos que cuantizar) |
| Idiomas soportados | Ingles (`en`) en documentacion, codigo y mensajes; el autor no declara otros idiomas |
| Licencia | No disponible (no declarada en el repositorio ni en la model card) |
| Formato de pesos | No hay pesos. Artefactos: codigo `.py`, entradas/salidas `.json`, resultados `.csv` (UTF-8 con BOM, compatible con Excel), imagen `.png` de ejemplo |
| Modelo estadistico | Bootstrap de retornos logaritmicos diarios con reemplazo; Black-Scholes para call europea con volatilidad implicita constante por contrato |
| Tasa de descuento | Continua anual en USD, decimal; por defecto 0,04 (4 %), fijada como supuesto, no recuperada de mercado |
| Requisitos de ejecucion | Python 3.10 o superior; sin instalacion via pip ni credenciales; dependencia opcional `playwright` + Chromium solo para regenerar el grafico |
| Entradas/salidas | `evaluate(inputs, horizon=30, paths=600, seed=42, rate=0.04)`; funcion auxiliar `call_price(spot, strike, years, volatility, rate)`; CLI `run_example.py --input --rate` |

## Arquitectura y entrenamiento

No hay arquitectura de aprendizaje automatico ni entrenamiento en el sentido habitual. El motor encadena cuatro etapas. Primero, calcula retornos logaritmicos diarios, $r_t = \ln(P_t / P_{t-1})$, a partir de cierres diarios completos de los tres meses naturales previos. Segundo, genera trayectorias simulando cada dia mediante muestreo independiente con reemplazo de uno de esos retornos historicos y actualizando el precio, de modo que la distribucion empirica sustituye a un supuesto parametrico. Tercero, valora el pasivo de cada call no vencida con la formula de Black-Scholes europea usando una volatilidad implicita constante calibrada por contrato. Cuarto, agrega los flujos de caja de salida (venta o asignacion de acciones, prima de reemplazo, coste de recompra de la call) y aplica descuento al 4 % continuo para obtener el beneficio de la posicion completa, incluyendo el efectivo de opciones ya registrado y el coste original de la accion con comisiones.

Las decisiones de diseno destacables son la reproducibilidad (semilla explicita, `seed=42` en el ejemplo), la ausencia total de dependencias externas en el nucleo, y la separacion entre el calculo y la capa de presentacion: el grafico del panel de aiMoney se renderiza con el componente React real del producto y se valida contra `examples/expected_result.json`, con sumas de verificacion del codigo fuente del frontend registradas como procedencia. Cada estrategia se representa con tres columnas adyacentes (venta en verde, recompra en rojo, P/L en morado) mas una linea horizontal con el coste original de la accion y etiquetas de P/L neto, efectivo de salida, fraccion de trayectorias que superan el suelo y financiacion neta necesaria para el roll.

No se documenta composicion de dataset de entrenamiento, numero de tokens, RLHF ni DPO porque no existen: los datos incluidos son integramente sinteticos, y el bootstrap se alimenta de series historicas que el usuario debe aportar. El autor declara explicitamente que no hay conexion con broker ni ejecucion de ordenes.

## Capacidades

- Comparacion de tres cursos de accion sobre una posicion covered call: cerrar hoy, esperar para cerrar, o hacer roll hoy y cerrar despues.
- Estimacion de flujos de caja en USD y de beneficio de la posicion completa, no solo del tramo de opcion.
- Ranking de calls de reemplazo bajo criterios explicitos de strike, vencimiento y calidad de cotizacion.
- Generacion de trayectorias de precio mediante bootstrap historico no parametrico (600 por defecto, configurable).
- Valoracion puntual de calls europeas como funcion independiente: `call_price(spot, strike, years, volatility, rate)`.
- Simulacion de liquidacion por vencimiento dentro de cada trayectoria para vencimientos anteriores al horizonte.
- Calculo de etiquetas auxiliares: fraccion simulada que supera el suelo (*sale-floor*) y financiacion neta estimada para ejecutar el roll.
- Exportacion de resultados a JSON y a CSV ordenado por beneficio total descendente, con todas las calls de reemplazo que cumplen criterios.
- Ejecucion determinista con semilla y reproduccion de la salida esperada mediante `tests/` y `examples/expected_result.json`.
- Render opcional del grafico del panel de aiMoney usando el componente React original, con verificacion por sumas de comprobacion.
- No soporta tool calling, agentes, razonamiento multi-paso generativo, vision, audio ni capacidades multilingues: no es un modelo generativo.

## Casos de uso

- Evaluacion de un roll concreto antes de operar: el operador introduce sus datos (coste de la accion con comisiones, efectivo de opciones registrado, strikes y vencimientos candidatos, volatilidades implicitas) y obtiene el beneficio estimado de cada alternativa bajo las mismas 600 trayectorias, lo que permite comparar manzanas con manzanas.
- Analisis de sensibilidad al horizonte: repetir `evaluate` con horizontes de 10, 30 y 60 dias de trading para observar como cambia el ranking de reemplazos cuando se acorta o alarga la ventana de decision.
- Auditoria de la aritmetica de una decision pasada: reconstruir una posicion historica, fijar la semilla y comprobar si el criterio de rollover habria seleccionado el mismo contrato que se eligio en su momento.
- Integracion en un pipeline de analisis interno: invocar `evaluate` desde un script de CI o un job programado que consuma un JSON de posiciones y emita el CSV rankeado, sin dependencias externas ni credenciales.
- Formacion y documentacion: usar `examples/sample_input.json` y `examples/expected_result.json` como caso de referencia reproducible en material didactico sobre valoracion de opciones y flujos de caja de una posicion cubierta.
- Pruebas de integracion de frontend financiero: regenerar `examples/simulation-profit.png` con `render_aimoney_chart.py` y comparar contra las sumas de comprobacion registradas para detectar regresiones en el componente de grafico.
- Prototipado de reglas de seleccion de contratos: modificar los criterios de strike, vencimiento y calidad de cotizacion en una copia del codigo y medir como cambia la composicion del top de reemplazos sobre los mismos datos sinteticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El campo `model-index` de la model card declara la entrada "Covered-call exit scenario model" con un array `results` vacio, y no existe comparacion cuantitativa con otros metodos ni validacion contra resultados de mercado reales.

Las unicas cifras publicadas son las del ejemplo sintetico ilustrativo del panel, que no constituyen benchmarks y no deben interpretarse como rendimiento del modelo:

| Concepto del ejemplo | Valor |
|---|---|
| Posicion | 100 acciones que cubren 1 call de strike 40 USD |
| Precio medio de la accion capturado | 50 USD |
| Coste de compra de la accion (con comisiones) | 3.005 USD |
| Efectivo neto de opciones registrado (incluye ciclos previos enlazados) | 800 USD |
| Trayectorias simuladas | 600 |
| Horizonte de revision | 30 dias de trading |
| Tasa de descuento continua | 4 % anual |
| Referencia fija "cerrar hoy" (bid/ask capturado) | 1.575,03 USD de beneficio total |
| Ejemplo de pricing puntual | spot 50, strike 52, 23/365 anos, volatilidad 0,80, tasa 0,04 |

El autor advierte que los valores de las barras de P/L estan verificados contra `examples/expected_result.json` pero que no establecen que un rollover vaya a superar al cierre en mercados reales.

## Requisitos de hardware

- VRAM: no aplica. El motor no usa GPU ni aceleracion por hardware; se ejecuta en CPU con la biblioteca estandar de Python.
- GPU recomendadas: ninguna. Cualquier CPU capaz de ejecutar Python 3.10+ es suficiente.
- Ejecucion en hardware de consumo: si, integramente. No hay requisito de memoria relevante: la carga por defecto es de 600 trayectorias por 30 pasos, mas una valoracion Black-Scholes por contrato candidato y por paso relevante.
- Almacenamiento: el repositorio ocupa 0,0 GB; los artefactos de salida (`example_result.json`, `example_rollovers.csv`) son ficheros de texto de tamano reducido.
- Opciones de despliegue: ejecucion directa con `python3 run_example.py` desde el repositorio descargado; importacion como modulo (`from model import evaluate, call_price`); invocacion desde tests con `python3 -m unittest discover -s tests`. No hay soporte de vLLM, llama.cpp, Ollama ni TGI, porque no existen pesos que servir.
- Dependencia opcional: `playwright` y Chromium, solo para regenerar el grafico del panel mediante `examples/render_aimoney_chart.py --frontend-dir /path/to/aiMoney/frontend`. El modelo en si sigue siendo solo biblioteca estandar.
- Latencia y throughput: no disponible. El autor no publica mediciones; la carga descrita es pequena y no incluye llamadas de red.

## Comparativa con modelos similares

No hay una categoria de "modelos comparables" en el sentido de modelos fundacionales: el artefacto es un motor de escenarios para una estrategia concreta. La comparacion relevante es con bibliotecas de valoracion de opciones y con calculadoras de estrategias, y los datos de licencia y rendimiento de esas alternativas no se han verificado en la informacion disponible.

| Alternativa | Enfoque | Cubre flujos de posicion completa | Bootstrap historico de trayectorias | Ranking de rolls | Dependencias | Licencia | Datos publicados frente a este modelo |
|---|---|---|---|---|---|---|---|
| amanlig/covered-call-exit-model | Motor de escenarios dedicado a covered calls | Si (venta de accion, recompra, prima, base de coste) | Si, 3 meses de retornos diarios | Si, por beneficio total | Ninguna (biblioteca estandar) | No disponible | `results: []`, sin benchmarks |
| QuantLib | Biblioteca general de valoracion de derivados | No de forma nativa; requiere construir la logica | No como funcion de primer nivel | No | Amplia (C++) | No verificada en la informacion disponible | No disponible |
| py_vollib | Pricing de opciones (Black-Scholes y otros) | No | No | No | Ligera (Python) | No verificada en la informacion disponible | No disponible |
| Calculadoras de estrategias con covered call (herramientas comerciales) | Analisis de escenarios y diagramas de P/L | Parcial, segun herramienta | No documentado | Variable | Servicio alojado | Propietaria | No disponible |

## Limitaciones y advertencias

- No es un modelo de IA ni un modelo de lenguaje: no genera texto, no razona y no tiene pesos. Cualquier expectativa de inferencia alojada al descargar el repositorio es infundada; el propio autor lo indica.
- El bootstrap asume que los retornos diarios de los tres meses previos son representativos del futuro y los muestrea de forma independiente con reemplazo, lo que ignora autocorrelacion, regimenes de volatilidad, saltos y colas gruesas. El rango de resultados simulados puede subestimar eventos extremos.
- La valoracion usa Black-Scholes europeo con volatilidad implicita constante por contrato: no modela sonrisa de volatilidad, asignacion temprana, dividendos, ni el comportamiento americano de muchas calls.
- Todos los datos incluidos son sinteticos y el ejemplo del panel usa valores ficticios. No hay validacion con precios reales, con historicos de ejecucion ni con resultados de brokers.
- Los resultados de ejemplo no demuestran superioridad del rollover frente al cierre. El autor lo declara explicitamente; tratar el ranking como recomendacion de inversion seria un error de interpretacion.
- La tasa de descuento por defecto (4 %) es un supuesto fijo, no un tipo de mercado recuperado automaticamente. Cambiarla altera el ranking.
- No hay conexion con broker, ejecucion de ordenes, gestion de comisiones reales, slippage ni fiscalidad. Los costes e ingresos futuros son importes medios descontados.
- El sesgo de seleccion del ranking es real: se ordena por beneficio total estimado bajo un unico conjunto de supuestos y una unica semilla, sin intervalos de confianza dibujados en el grafico (los rangos por percentil solo estan en el JSON de referencia).
- La licencia no esta declarada en el repositorio ni en la model card, por lo que el uso comercial queda en situacion juridica incierta hasta que el autor la aclare.
- Idioma: documentacion y mensajes solo en ingles; no hay traduccion ni soporte multilingue.
- El proyecto tiene 0 descargas y 0 likes y fue creado y actualizado el mismo dia (2026-10-28), sin historial de mantenimiento que permita evaluar su estabilidad a medio plazo.
- No constituye asesoramiento financiero. Cualquier decision de inversion basada en sus salidas es responsabilidad exclusiva del usuario.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/amanlig/covered-call-exit-model
- Script de ejecucion del ejemplo: `run_example.py` (incluido en el repositorio)
- Nucleo del modelo, con `evaluate` y `call_price`: `model.py` (incluido en el repositorio)
- Entradas sinteticas de ejemplo: `examples/sample_input.json`
- Salida esperada verificada: `examples/expected_result.json`
- Imagen del panel de ejemplo: `examples/simulation-profit.png`
- Script de render del grafico: `examples/render_aimoney_chart.py`
- Pruebas unitarias: `tests/` (ejecutables con `python3 -m unittest discover -s tests`)
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos publicas asociadas a este modelo distintos de los anteriores.
