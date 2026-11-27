# aixk/BAAR4-crypto-trio-v10-cc

## Resumen

BAAR4-crypto-trio-v10-cc es un modelo de clasificación tabular publicado por el usuario aixk en Hugging Face, orientado a la señalización de operaciones en mercados de criptomonedas. No se trata de un modelo de lenguaje: su pipeline declarado es `tabular-classification` y se distribuye en formato ONNX junto con pesos en safetensors. El repositorio es de muy reducido tamano (0,0 GB reportados) y cuenta con 32.257 parametros totales, lo que lo situa en la categoria de modelos ligeros para inferencia en tiempo real o en dispositivos con recursos limitados.

La model card describe un conjunto de tres componentes: dos redes exportadas a ONNX (una etiquetada "Swing-1h" de 0,47 MB con entrada de forma `N x 202`, y otra "Sniper-5m" de 0,22 MB con la misma dimensionalidad de entrada) y una estrategia de ejecución denominada "Dual Limit" con metricas de backtest reportadas (12 operaciones, 50,0 % de acierto, retorno de +2,31 %, factor de beneficio 1,44 y drawdown maximo de -3,30 %). La informacion disponible es muy escasa y no permite reconstruir la arquitectura interna ni el proceso de entrenamiento.

Su relevancia es limitada y acotada a un nicho muy concreto: experimentacion con clasificadores tabulares aplicados a series temporales financieras de criptoactivos. No dispone de descargas ni likes, no declara idiomas soportados y no incluye documentacion tecnica sobre datos de entrenamiento, por lo que debe tratarse como un artefacto experimental mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador tabular; se distribuye como ONNX, sin detalle de capas) |
| Parametros totales | 32.257 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada tabular de 202 caracteristicas, `N x 202`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX y safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. La model card unicamente indica que se distribuyen dos artefactos ONNX con entrada de 202 caracteristicas por muestra (`N x 202`): uno asociado a una temporalidad de 1 hora ("Swing-1h", 0,47 MB) y otro a 5 minutos ("Sniper-5m", 0,22 MB). El recuento de parametros en safetensors (32.257) es coherente con una red totalmente conectada de pequena profundidad, pero el autor no publica la topologia, el numero de capas ni las funciones de activacion.

Tampoco se documentan los datos de entrenamiento: no se especifica el numero de muestras, el periodo historico cubierto, los pares de criptomonedas utilizados, el conjunto de caracteristicas de entrada ni si hubo validacion cruzada o ajuste de hiperparametros. No se menciona el uso de RLHF, DPO ni ninguna tecnica de alineacion, algo esperable en un modelo de clasificacion tabular. La unica innovacion declarada es la estrategia "Dual Limit" de ejecucion, cuyas metricas de backtest se recogen en la model card sin detallar la metodologia de evaluacion.

## Capacidades

- Clasificacion tabular sobre vectores de 202 caracteristicas, con dos variantes orientadas a distintas temporalidades (1 h y 5 min).
- Generacion de senales de trading para criptoactivos segun la estrategia "Dual Limit" descrita por el autor.
- Inferencia via ONNX Runtime, lo que permite despliegue en CPU y en entornos embebidos.
- Exportacion en safetensors para inspeccion o conversion a otros runtimes.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo "thinking", vision ni audio.

## Casos de uso

- Senalizacion de operaciones intradia en criptoactivos: el componente "Sniper-5m" (0,22 MB) puede ejecutarse en bucle cada 5 minutos sobre vectores de 202 caracteristicas para emitir una clasificacion por vela, con coste computacional minimo en CPU.
- Senalizacion de swing trading: el componente "Swing-1h" (0,47 MB) esta pensado para evaluar la situacion del mercado cada hora y generar una etiqueta de accion, adecuado para estrategias de menor frecuencia.
- Backtesting y validacion de estrategias: las metricas declaradas (12 operaciones, WR 50,0 %, Ret +2,31 %, PF 1,44, MDD -3,30 %) permiten reproducir y contrastar la estrategia "Dual Limit" en un entorno de investigacion antes de considerar cualquier uso real.
- Prototipado de pipelines de ML financiero: al ser un modelo de 32.257 parametros en ONNX, sirve como pieza de prueba en arquitecturas de ingesta de datos de mercado, feature engineering y ejecucion de inferencia de baja latencia.
- Despliegue en dispositivos con recursos limitados: el tamano de los artefactos (0,47 MB y 0,22 MB) permite ejecutar la inferencia en Raspberry Pi, contenedores minimos o funciones serverless sin GPU.
- Experimentacion academica con clasificadores tabulares en series temporales: util como linea base reproducible para comparar con modelos mas complejos (LSTM, transformers temporales) en tareas de prediccion de precios de criptoactivos.
- Integracion en sistemas de alerta: el modelo puede conectarse a un bus de eventos para emitir notificaciones cuando la clasificacion supera un umbral definido por el operador.

## Benchmarks y rendimiento

La unica metrica publicada por el autor es el resultado de backtest de la estrategia "Dual Limit":

| Metrica | Valor |
|---|---|
| Operaciones (Trades) | 12 |
| Tasa de acierto (WR) | 50,0 % |
| Retorno (Ret) | +2,31 % |
| Factor de beneficio (PF) | 1,44 |
| Drawdown maximo (MDD) | -3,30 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes para clasificacion tabular) en la informacion disponible. El tamano muestral del backtest (12 operaciones) es demasiado reducido para extraer conclusiones estadisticamente significativas.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el modelo puede ejecutarse en CPU. Los artefactos ONNX ocupan 0,47 MB y 0,22 MB respectivamente.
- GPU recomendadas: no se requiere GPU. Cualquier GPU moderna (RTX 4090, A100, H100) ejecutaria la inferencia con latencia despreciable, pero no aporta ventaja frente a CPU para este tamano.
- Compatibilidad con GPU de consumo: si, en cualquier GPU de consumo e incluso en CPU integrada.
- Opciones de despliegue: ONNX Runtime (principal), conversion a otros runtimes mediante herramientas estandar de ONNX; no hay soporte nativo documentado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera latencia en el orden de microsegundos a pocos milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (clasificadores tabulares para criptoactivos) ni datos de rendimiento que permitan establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Informacion tecnica muy escasa: no se documenta arquitectura, datos de entrenamiento, features de entrada ni metodologia de evaluacion.
- Backtest con solo 12 operaciones: muestra insuficiente para validar la estrategia; el retorno de +2,31 % y el WR del 50,0 % no son estadisticamente concluyentes.
- Riesgo elevado de sobreajuste: sin datos de validacion out-of-sample ni walk-forward, no puede descartarse que las metricas reflejen ajuste al periodo historico elegido.
- Riesgo financiero: el modelo no constituye asesoramiento financiero; su uso para operar con capital real conlleva perdidas potenciales no acotadas por el MDD reportado.
- Sesgos conocidos: no documentados, pero al entrenarse presumiblemente sobre un unico regimen de mercado puede degradarse en condiciones no vistas (alta volatilidad, eventos macro).
- Limitaciones de idioma: no aplica, al no procesar texto.
- Licencia MIT: permite uso comercial y modificacion con atribucion; no obstante, la ausencia de garantias es la estandar de esta licencia.
- Caveat para produccion: sin documentacion de features, versionado de datos ni pruebas de robustez, no es recomendable integrarlo en sistemas de decision automatizados sin una validacion independiente exhaustiva.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de revision por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aixk/BAAR4-crypto-trio-v10-cc
