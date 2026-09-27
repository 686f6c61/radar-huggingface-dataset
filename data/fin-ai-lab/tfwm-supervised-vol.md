# fin-ai-lab/tfwm-supervised-vol

## Resumen

TFWM encoder — Supervised (vol) es un codificador de series temporales financieras desarrollado por fin-ai-lab, publicado en HuggingFace bajo el identificador `fin-ai-lab/tfwm-supervised-vol`. Se trata de un transformer de aproximadamente 22 millones de parametros, 12 capas, anchura 384, 6 cabezas de atencion, MLP de 1536 y tamano de parche 8, con codificacion posicional sinusoidal. Su entrada son datos de renta variable estadounidense en sesion regular muestreados a 1 Hz: 9 canales de mercado (bid_price, vwap_all, high, low, ask_price, bid_size, ask_size, volume, n) mas 11 canales de informacion de vista calculados en tiempo de carga, lo que da un total de 20 canales.

El modelo no genera texto ni codigo: es un extractor de caracteristicas (pipeline `feature-extraction`) entrenado de forma supervisada de extremo a extremo con una cabeza MLP para ordenar la seccion cruzada de acciones segun el cambio de volatilidad realizada en los siguientes 900 segundos, usando una perdida de ranking por pares. Cada celda de entrenamiento es un par (dia, ancla de 5 minutos) con 16 acciones extraidas de la misma seccion cruzada, y el objetivo se calcula estrictamente con datos posteriores al ancla.

Es relevante ahora porque forma parte de la comparativa de 18 codificadores del trabajo *Towards Financial World Modeling* (TFWM): los 18 comparten backbone y se entrenan con 12 pasadas sobre los mismos periodos de seis meses, de modo que difieren principalmente en el objetivo de entrenamiento. Esto permite aislar el efecto de la funcion de perdida en el aprendizaje de representaciones de mercados financieros. El modelo se encuentra en estado de pre-release: los pesos y el codigo de carga son trabajo en curso, y el codigo de entrenamiento (`market_jepa`, `stable_finance`) todavia no es publico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (12 capas, anchura 384, 6 cabezas, MLP 1536, patch 8, posiciones sinusoidales) |
| Parametros totales | ~22 millones (backbone) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada por parches de 8 muestras sobre datos a 1 Hz) |
| Tipos de cuantizacion | no disponibles; los checkpoints se distribuyen como state dicts de PyTorch (sin GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible; el modelo opera sobre series temporales numericas, no sobre texto |
| Licencia | other, `license_name: derived-market-data` |
| Formato de pesos | PyTorch (`backbone.pt` + `head.pt` por checkpoint), acompanados de `train_meta.json` y `xs_ic.json` |

Datos adicionales: pipeline `feature-extraction`, libreria PyTorch, tamano del repositorio 0,5 GB, 0 descargas y 0 likes en el momento de la consulta, creado el 2026-09-27 y actualizado el mismo dia. Dataset asociado: `fin-ai-lab/Market-1T-1Hz-2019H2-2020-daystore`.

## Arquitectura y entrenamiento

El backbone es un transformer de 12 capas con anchura 384, 6 cabezas de atencion, MLP de 1536, tamano de parche 8 y codificacion posicional sinusoidal, con aproximadamente 22 millones de parametros. La entrada combina 9 canales de mercado a 1 Hz de renta variable estadounidense en sesion regular con 11 canales de informacion de vista calculados en tiempo de carga (estadisticas de normalizacion por vista y geometria de la ventana), sumando 20 canales. El pooling configurado durante el entrenamiento es `last`, es decir, el estado del ultimo parche en el instante de decision.

El entrenamiento es supervisado de extremo a extremo: al backbone se le acopla una cabeza MLP que aprende a ordenar la seccion cruzada de acciones segun el cambio de volatilidad realizada en los 900 segundos siguientes, con una perdida de ranking por pares. Cada celda de entrenamiento corresponde a un par (dia, ancla de 5 minutos) con 16 acciones muestreadas de la misma seccion cruzada, y el objetivo se calcula con datos estrictamente posteriores al ancla, lo que evita fuga de informacion. El regimen de entrenamiento es de 12 pasadas sobre el periodo de seis meses, con LR base 0,0002, weight decay 0,05 y batch efectivo de 256. Los datos provienen de `fin-ai-lab/Market-1T-1Hz-2019H2-2020-daystore`, en formato day-major (un dia de negociacion por registro, con todos los tickers y los objetivos precalculados), de modo que cada celda de entrenamiento es una seccion cruzada del mismo dia. Se publica un checkpoint por mes de evaluacion, entrenado sobre los seis meses inmediatamente anteriores y sin haber visto nunca el mes de evaluacion.

## Capacidades

- Extraccion de representaciones (embeddings) de ventanas de datos de mercado a 1 Hz, con dos modos de lectura documentados: `pool="last"` (estado del ultimo parche, usado en las sondas de forecasting) y `pool="mean"` (media sobre parches, usado en los analisis latentes).
- Prediccion del cambio de volatilidad realizada a 900 segundos, formulada como ranking de la seccion cruzada de acciones (no como regresion puntual).
- Ordenacion transversal de acciones: la cabeza entrenada produce una puntuacion relativa utilizable para priorizar activos dentro de una misma seccion cruzada.
- Aprendizaje de representaciones de microestructura: los canales de entrada cubren precios (bid, ask, vwap, high, low), tamanos (bid_size, ask_size), volumen y numero de operaciones (n).
- Uso como componente congelado en pipelines posteriores: al ser un codificador, su salida alimenta cabezas o modelos aguas abajo.
- Capacidades de generacion de texto, codigo, matematicas, vision, audio, tool calling, function calling y razonamiento multi-paso en agentes: no disponibles, fuera del alcance del modelo.
- Capacidades multilingues: no aplicables; la entrada es numerica y no textual.

## Casos de uso

- Prediccion de volatilidad a corto plazo: el modelo estima el cambio de volatilidad realizada en los siguientes 900 segundos, por lo que puede alimentar sistemas de gestion de riesgo intradia que necesiten anticipar regimenes de volatilidad en una ventana de 15 minutos.
- Construccion de carteras long-short estadisticas: la cabeza de ranking permite ordenar la seccion cruzada de acciones y construir posiciones relativas dentro del mismo universo y el mismo dia, aprovechando que el entrenamiento respeta la estructura de seccion cruzada.
- Filtro de senales en estrategias intradia: los embeddings del ultimo parche pueden usarse como variable de estado adicional en un modelo de ejecucion que decida el ritmo de negociacion segun el regimen de microestructura detectado.
- Investigacion en microestructura de mercado: los 20 canales de entrada y el esquema de parches permiten analizar como varian las representaciones latentes ante cambios en spread, profundidad del libro (bid_size/ask_size) y flujo de ordenes (volume, n).
- Feature extraction para modelos aguas abajo: al exponer `backbone.pt` como state dict de PyTorch, las representaciones pueden congelarse y usarse como entrada de clasificadores, modelos de deteccion de anomalias o agrupamientos de regimenes de mercado.
- Evaluacion comparativa de objetivos de entrenamiento: al compartir backbone y regimen de entrenamiento con los otros 17 codificadores de la coleccion TFWM, permite aislar el efecto de la perdida (supervisada frente a auto-supervisada u otras) sobre la calidad de las representaciones.
- Analisis de robustez temporal: los cinco checkpoints cubren meses de evaluacion distintos (2019-09, 2020-01, 2020-08, 2020-09, 2020-12), lo que permite estudiar la estabilidad de las representaciones a lo largo del tiempo y a traves de periodos de estres de mercado.
- Reproduccion de experimentos academicos: el fichero `train_meta.json` de cada checkpoint contiene la configuracion resuelta de entrenamiento, el periodo y los ajustes de normalizacion por vista, lo que facilita replicar o auditar los experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica que cada checkpoint incluye un fichero `xs_ic.json` con el coeficiente de informacion (IC) transversal de la cabeza sobre el mes de evaluacion, pero no se proporcionan los valores numericos. Tampoco se facilitan resultados de MMLU, HumanEval, GSM8K ni de metricas especificas de forecasting financiero mas alla de la referencia a dicho IC. La publicacion asociada, *Towards Financial World Modeling* (TFWM), se menciona como marco de comparacion de los 18 codificadores, pero no se incluyen enlaces ni cifras en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~22 millones de parametros en el backbone, los pesos ocupan aproximadamente 88 MB en FP32 y 44 MB en FP16 o BF16. Las cabezas MLP anaden una cantidad marginal. La memoria de activaciones depende de la longitud de la secuencia de entrada (numero de parches), dato no disponible, pero a 1 Hz y con patch 8 el coste por ventana es reducido.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; no se requiere A100, H100 ni hardware de centro de datos. Una RTX 3060, RTX 4090 o incluso una GPU integrada moderna pueden ejecutar la inferencia.
- Inferencia en CPU: viable, dado el reducido numero de parametros; seria el escenario habitual para procesamiento por lotes de historicos diarios.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos anos, e incluso en CPU-only.
- Opciones de despliegue: PyTorch nativo. La model card documenta la carga mediante `torch.load(..., map_location="cpu", weights_only=True)` sobre `backbone.pt`, o mediante `market_jepa.eval.checkpoints.load_encoder(ckpt, pool="last"|"mean")` cuando el codigo del proyecto este disponible. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos en GGUF; estos runners estan orientados a LLM autoregresivos y no aplican a este codificador.
- Latencia y throughput estimados: no disponibles. No se proporcionan mediciones de latencia por lote ni de muestras por segundo.

## Comparativa con modelos similares

No se han proporcionado datos de modelos comparables externos (parametros, contexto, rendimiento o licencia), por lo que la comparativa cuantitativa con alternativas de terceros no esta disponible. La unica comparacion factible con la informacion suministrada es interna a la coleccion TFWM.

| Modelo | Backbone | Objetivo de entrenamiento | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| tfwm-supervised-vol (este) | Transformer 12 capas, width 384, patch 8 | Supervisado con cabeza MLP: ranking del cambio de volatilidad realizada a 900 s (perdida pairwise) | ~22 M | no disponible | derived-market-data | Pesos publicos, sin codigo de entrenamiento |
| Otros 17 codificadores TFWM | Mismo backbone (12 capas, width 384, patch 8) | Distintos objetivos; la documentacion menciona TS2Vec y TF-C entre ellos | ~22 M | no disponible | no disponible por modelo | Publicos en la coleccion TFWM Pre-Trained Encoders |
| Modelos externos de series temporales financieras | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Nota metodologica de la comparativa interna: los 18 encoders comparten backbone y se entrenan con 12 pasadas sobre los mismos periodos de seis meses, por lo que las diferencias de rendimiento observadas en el trabajo TFWM se atribuyen principalmente al objetivo de entrenamiento y no a la capacidad del modelo. Algunos codificadores exponen sub-backbones adicionales (`swa_backbone` en TS2Vec, `freq_backbone` en TF-C) que requieren ajustar el pooling en cada uno de ellos.

## Limitaciones y advertencias

- Estado de pre-release: la propia model card advierte de que los pesos y el codigo que los carga son trabajo en curso y que el contenido y la estructura pueden cambiar sin previo aviso.
- Codigo de entrenamiento no publico: `market_jepa` y `stable_finance` no estan disponibles todavia, de modo que no es posible reentrenar el modelo desde cero con la informacion publicada. El repositorio unicamente contiene state dicts de PyTorch.
- Checkpoint no reproducible: el checkpoint `2019-09/` se entreno sobre 2019-03 a 2019-08, un periodo fuera del dataset publicado (Market-1T cubre 2019-07 a 2020-12). Ese encoder no se puede reentrenar a partir de los datos liberados.
- Ausencia de `config.json`: los checkpoints supervisados no incluyen `config.json`, por lo que la carga mediante `from_pretrained` de las clases de modo no resuelve el pooling. Hay que fijar `.pool = "last"` (o `"mean"`) manualmente en cada sub-backbone despues de cargar; pasar un pool distinto en una config separada se ignora.
- Licencia restrictiva: la licencia es `other` con nombre `derived-market-data`. Al derivar de datos de mercado, el uso comercial esta sujeto a las condiciones de dichos datos, que no se detallan en la informacion disponible. Es imprescindible revisar los terminos antes de cualquier despliegue en produccion.
- Ambito de mercado limitado: los datos de entrenamiento son exclusivamente renta variable estadounidense en sesion regular a 1 Hz. No hay evidencia de generalizacion a otros mercados, otros husos horarios, sesiones extendidas, futuros, divisas o criptoactivos.
- Dependencia temporal: cada checkpoint esta entrenado para un mes de evaluacion concreto y sobre los seis meses inmediatamente anteriores. Su uso fuera de esa ventana temporal, especialmente en regimenes de mercado no representados en 2019-2020, puede degradar el rendimiento de forma significativa.
- Riesgo de sobreajuste al regimen 2019-2020: el periodo de datos publicado coincide con la crisis de la COVID-19 y la recuperacion posterior, un regimen de volatilidad atipico que puede sesgar las representaciones aprendidas.
- Riesgo de alucinacion: no aplica en el sentido habitual de generacion de texto, pero si existe riesgo de senales espurias, es decir, rankings sin poder predictivo real fuera de la muestra. La unica metrica publicada por checkpoint es el IC transversal en el mes de evaluacion, sin intervalos de confianza ni analisis de significacion.
- Idiomas: no aplica; el modelo no procesa lenguaje natural y no dispone de soporte multilingue.
- Sin cuantizaciones publicadas: no hay versiones GGUF, AWQ, GPTQ ni INT8, lo que limita su uso directo en runners de inferencia estandar y obliga a exportar manualmente si se necesita otro formato.
- Advertencia financiera: este modelo es una herramienta de investigacion sobre representaciones. No constituye asesoramiento financiero y su uso en decisiones de inversion conlleva riesgo de perdida de capital.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fin-ai-lab/tfwm-supervised-vol
- Dataset de entrenamiento: https://huggingface.co/datasets/fin-ai-lab/Market-1T-1Hz-2019H2-2020-daystore
- Directorio `1Hz_daystore` del dataset: https://huggingface.co/datasets/fin-ai-lab/Market-1T-1Hz-2019H2-2020-daystore/tree/main/1Hz_daystore
- Coleccion TFWM Pre-Trained Encoders (18 encoders): https://huggingface.co/collections/fin-ai-lab/tfwm-pre-trained-encoders-6ab871e942535b9c6041698d
- Publicacion asociada: *Towards Financial World Modeling* (TFWM), referenciada en la model card; no se ha encontrado enlace directo en la informacion disponible.

Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan relacion con el modelo ni con el proyecto TFWM (corresponden a definiciones lexicograficas de la palabra francesa "fin"), por lo que no aportan enlaces adicionales utilizables.
