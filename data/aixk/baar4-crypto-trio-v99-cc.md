# aixk/BAAR4-crypto-trio-v99-cc

## Resumen

BAAR4-crypto-trio-v99-cc es un modelo de clasificación tabular publicado por el usuario aixk en Hugging Face, orientado a la señalización en mercados de criptomonedas. No es un modelo de lenguaje: se distribuye con la etiqueta `tabular-classification` y la librería `onnx`, y su artefacto principal son pesos en formato ONNX y safetensors con 222.154 parámetros totales. El repositorio, de tamano practicamente nulo (0,0 GB), contiene dos cabezales ONNX diferenciados por marco temporal: uno de 1 hora ("Swing-1h", 2,69 MB) y otro de 5 minutos ("Sniper-5m", 2,08 MB), ambos con entradas de 219 características por muestra (`N x 219`).

El modelo resuelve, segun su model card, la generacion de señales de trading sobre pares de criptomonedas, con una estrategia asociada denominada "Dual Limit" cuyas metricas declaradas son 198 operaciones, una tasa de acierto del 88,9 %, un retorno acumulado de +714,24 %, un profit factor de 11,01 y un maximo drawdown del -1,79 %. Es relevante unicamente como artefacto de investigacion sobre clasificacion tabular aplicada a series financieras; no dispone de documentacion tecnica sobre datos de entrenamiento, validacion o metodologia de evaluacion.

La ficha se limita a reflejar la informacion publicada. Cualquier dato no presente en la model card o en los metadatos de Hugging Face se marca explicitamente como no disponible, y las metricas citadas proceden del autor sin verificacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador tabular; se distribuye como grafo ONNX) |
| Parametros totales | 222.154 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (entrada tabular fija de 219 caracteristicas por muestra) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX (dos cabezales: Swing-1h de 2,69 MB y Sniper-5m de 2,08 MB) y safetensors |
| Pipeline | tabular-classification |
| Tamano del repositorio | 0,0 GB |
| Entrada | tensor de forma `N x 219` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo. Los metadatos indican un clasificador tabular exportado a ONNX, con 222.154 parametros y una interfaz de entrada de 219 caracteristicas por muestra. No se especifica si se trata de un perceptron multicapa, un modelo lineal regularizado, un gradient boosting serializado o una red recurrente; el grafo ONNX permitiria inspeccionarlo, pero esa informacion no acompana al repositorio.

Tampoco hay datos sobre el conjunto de entrenamiento: no se indica el numero de muestras, el periodo temporal cubierto, los pares de criptomonedas utilizados, el esquema de etiquetado (clasificacion de direccion, triple barrera u otro), ni si se aplicaron tecnicas de validacion walk-forward o purga temporal. No se documenta el uso de RLHF, DPO ni ningun otro proceso de ajuste, algo por otra parte ajeno a un clasificador tabular. La unica informacion de evaluacion disponible son las metricas agregadas de la estrategia "Dual Limit" citadas en la model card.

## Capacidades

- Clasificacion tabular binaria o multiclase sobre vectores de 219 caracteristicas, segun la interfaz declarada `N x 219`.
- Generacion de señales de trading en dos horizontes temporales: 1 hora (cabezal Swing-1h) y 5 minutos (cabezal Sniper-5m).
- Inferencia via ONNX Runtime, lo que permite despliegue en CPU y en entornos embebidos sin dependencia de GPU.
- Exportacion a safetensors junto con los grafos ONNX.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: no procesa lenguaje natural.

## Casos de uso

- Senalizacion de entrada y salida en pares cripto a marco de 1 hora: el cabezal Swing-1h consume un vector de 219 caracteristicas calculadas sobre velas horarias y devuelve una clase que puede mapearse a compra, venta o neutral dentro de un motor de ejecucion propio.
- Senalizacion de alta frecuencia relativa a marco de 5 minutos: el cabezal Sniper-5m permite generar señales mas frecuentes para estrategias intradia, siempre que el pipeline de caracteristicas reproduzca exactamente el mismo esquema de 219 dimensiones usado en el entrenamiento.
- Backtesting de estrategias: al ser un grafo ONNX deterministico y ligero (2-3 MB por cabezal), puede integrarse en frameworks de backtest en Python para evaluar la estrategia "Dual Limit" sobre datos historicos propios antes de arriesgar capital.
- Investigacion academica sobre clasificacion tabular financiera: sirve como referencia reproducible de un clasificador de baja capacidad aplicado a series de precios, util para comparar con modelos propios bajo la misma particion temporal.
- Despliegue en infraestructura sin GPU: al ejecutarse con ONNX Runtime en CPU, puede alojarse en un contenedor pequeno o en un dispositivo de borde que consuma señales via API, con un coste de computo marginal.
- Prototipado de sistemas de gestion de riesgo: las salidas del clasificador pueden alimentar reglas de tamano de posicion o de stop, aunque las metricas declaradas por el autor deben reproducirse de forma independiente antes de cualquier uso real.
- Filtro de regimen de mercado: combinando ambos cabezales (1h y 5m) puede construirse una logica de confirmacion multi-horizonte, por ejemplo exigiendo coincidencia de señal en ambos marcos antes de operar.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados son las metricas de la estrategia "Dual Limit" declaradas por el autor en la model card. No se especifica el periodo de evaluacion, el universo de pares, los costes de transaccion asumidos ni el metodo de validacion, por lo que no son comparables con benchmarks estandar.

| Metrica (estrategia "Dual Limit") | Valor declarado |
|---|---|
| Numero de operaciones | 198 |
| Tasa de acierto (win rate) | 88,9 % |
| Retorno acumulado | +714,24 % |
| Profit factor | 11,01 |
| Maximo drawdown | -1,79 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, algo esperable al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el modelo puede ejecutarse en CPU con ONNX Runtime dado su tamano (222.154 parametros, grafos de 2,08 MB y 2,69 MB).
- GPU recomendadas: no se requiere GPU. Cualquier GPU consumer (por ejemplo, una GTX 1650 o superior) aceleraria la inferencia, pero no es necesaria.
- Cabe en cualquier GPU consumer y en dispositivos de borde; el cuello de botella real es el pipeline de calculo de las 219 caracteristicas, no el modelo.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), y cualquier runtime compatible con ONNX (por ejemplo, TensorRT u OpenVINO previa conversion). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles. Por el tamano del grafo, la latencia por muestra deberia ser del orden de microsegundos a pocos milisegundos en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (clasificadores tabulares para criptoactivos publicados con documentacion verificable). La comparativa se limita a los dos cabezales incluidos en el propio repositorio.

| Modelo | Parametros | Entrada | Formato | Licencia | Metricas declaradas |
|---|---|---|---|---|---|
| BAAR4 Swing-1h | 222.154 (total del repo) | `N x 219` | ONNX (2,69 MB) | MIT | Incluidas en el agregado "Dual Limit" |
| BAAR4 Sniper-5m | 222.154 (total del repo) | `N x 219` | ONNX (2,08 MB) | MIT | Incluidas en el agregado "Dual Limit" |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las metricas declaradas (88,9 % de acierto, profit factor 11,01, retorno de +714,24 %) no van acompanadas de periodo de evaluacion, costes de transaccion, slippage ni metodologia de validacion; no deben tomarse como evidencia de rentabilidad futura.
- Un profit factor de 11,01 con solo 198 operaciones es un resultado atipico en trading real y sugiere posible sobreajuste, fuga de informacion en las caracteristicas o seleccion retrospectiva del periodo; requiere reproduccion independiente.
- No se documenta el esquema de las 219 caracteristicas de entrada, por lo que es imposible reconstruir el pipeline de inferencia a partir del repositorio sin trabajo inverso sobre el grafo ONNX.
- No hay informacion sobre sesgos, distribucion del entrenamiento ni comportamiento fuera de la muestra.
- Riesgo de deriva (drift) elevado en datos financieros: un clasificador entrenado en un regimen de mercado concreto puede degradarse rapidamente en otro.
- No se especifican los pares de criptomonedas, exchanges ni marcos temporales exactos cubiertos.
- El repositorio tiene 0 descargas y 0 likes, sin validacion por parte de la comunidad.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero la licencia no otorga ninguna garantia sobre el rendimiento financiero del modelo.
- Uso en produccion con capital real no recomendado sin validacion walk-forward propia, analisis de costes y gestion de riesgo independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aixk/BAAR4-crypto-trio-v99-cc
- No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales en la informacion disponible.
