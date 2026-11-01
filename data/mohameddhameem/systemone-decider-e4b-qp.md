# mohameddhameem/systemone-decider-e4b-qp

## Resumen

SystemOne-Decider E4B qp es un modelo enrutador (router) especializado que decide, para cada pregunta de razonamiento multi-salto, si debe responderla un modelo pequeno o uno grande. Lo desarrolla el usuario de HuggingFace mohameddhameem y se construye sobre el Strands Decider E4B de StrandsAgents, a su vez derivado de google/gemma-4-E4B-it. El modelo no genera respuestas: emite una probabilidad P(modelo grande) a partir de la pregunta y de los pasajes recuperados por el modelo pequeno, antes de que este responda.

La relevancia practica esta en el ahorro de coste en pipelines de recuperacion aumentada: enviar solo el 6,3% de las preguntas al modelo grande permite mantener una precision cercana a la del modelo grande siempre activo a una fraccion del coste. El modelo se evalua sobre el split SLR de HotpotQA con el par Qwen2.5-1.5B-Instruct (pequeno, top 2 parrafos) y Qwen2.5-7B-Instruct (grande, 10 parrafos).

El repositorio ocupa 1,3 GB e incluye tres semillas (0 en la raiz, 1 y 2 en subcarpetas). La licencia es Apache-2.0 y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Strands Decider E4B (torso de google/gemma-4-E4B-it) con LoRA de rango 48 y cabeza pointer |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor menciona ejecucion en bf16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA y cabeza pointer sobre el modelo base) |

## Arquitectura y entrenamiento

El modelo reutiliza el torso del Strands Decider E4B (base google/gemma-4-E4B-it) y anade un adaptador LoRA de rango 48 junto con una cabeza pointer que produce una unica probabilidad escalar: P(modelo grande). La entrada es la pregunta y los pasajes recuperados por el modelo pequeno (los dos mejores parrafos de HotpotQA), es decir, el punto de decision se situa antes de que el modelo pequeno genere su respuesta.

El entrenamiento parte de StrandsAgents/strands-decider-E4B-gemma4-v1-2610 (revision 1344d44397c457f3be34b8ff15c593b41248c6bf) y se realiza con entropia cruzada con softmax agrupado sobre las 4.814 preguntas de entrenamiento del split SLR de HotpotQA, con learning rate 0,0001, batch 16 y hasta 2 epocas, conservando la epoca con menor NLL sobre un 10% de hold-out. La etiqueta positiva es "el modelo grande es necesario": el pequeno falla y el grande acierta con puntuacion indulgente. Se publican tres semillas (0, 1 y 2) con el registro completo en training.json.

## Capacidades

- Clasificacion binaria de enrutamiento: devuelve P(modelo grande) para una pregunta y sus pasajes.
- Decision de ruta mediante umbral calibrado en validacion (0,6732 en la semilla 0), accesible via `router.route(...)`.
- Funciona como componente de un pipeline RAG de dos niveles, no como generador de texto.
- Evaluado sobre preguntas multi-salto (HotpotQA), donde la recuperacion del modelo pequeno es insuficiente.
- Soporte de ensemble de tres semillas promediando probabilidades.
- No dispone de tool calling, capacidades de agente, vision ni audio: su unica funcion es la decision de enrutamiento.

## Casos de uso

- Enrutamiento coste-eficiente en RAG multi-salto: el router decide si la pregunta requiere el modelo grande antes de generar, reduciendo el coste por consulta a 1,10 frente a 10,00 del modelo grande siempre activo (mas 4,27 de la llamada del juez).
- Control de presupuesto en produccion: con el umbral publicado solo el 6,3% de las preguntas se derivan al modelo grande, lo que permite fijar un coste maximo por consulta con una perdida de precision acotada.
- Triaje de consultas en atencion al cliente: preguntas simples se resuelven con el modelo pequeno y solo las que requieren composicion de varios hechos se escalan al grande.
- Investigacion sobre enrutamiento de LLM: el repositorio incluye tres semillas, el registro de entrenamiento y las puntuaciones por pregunta, lo que facilita reproducir y comparar con baselines como el umbral de entropia o la regresion logistica.
- Evaluacion de pares de modelos: la metodologia (etiquetado por comparacion de aciertos, calibracion de umbral en validacion) es reutilizable para otros pares pequeno/grande recogiendo nuevos datos de validacion.
- Filtrado previo en pipelines de agentes: usar el router para decidir que consultas necesitan un modelo mayor antes de invocar herramientas costosas o cadenas de razonamiento largas.

## Benchmarks y rendimiento

Resultados sobre el split SLR de HotpotQA (4.814 entrenamiento, 1.110 validacion, 1.481 test). AIQ es el area bajo la curva precision-coste; coste segun la tabla 5 de AgentTTS (Qwen2.5-1.5B 0,5; Qwen2.5-7B 10). Intervalos al 95% por bootstrap pareado.

| Metodo | AIQ | AIQ con su propio coste |
|---|---|---|
| Semilla 0 (raiz) | 0,681 [0,660; 0,703] | 0,645 [0,623; 0,665], 4,27 por llamada |
| Media de semillas individuales | 0,681 ± 0,001 | 0,645 |
| Ensemble de tres semillas (media de P) | 0,682 | 0,609 (tres llamadas) |
| Ensemble de tres semillas, 1.303 preguntas no vistas por nano-jev | 0,679 | no disponible |
| Umbral de entropia sobre el modelo pequeno | 0,665 | no disponible |
| Router de regresion logistica (pregunta y pasajes) | 0,668 | no disponible |
| Mejor regresion logistica en el mismo punto de decision | 0,669 | no disponible |
| Aleatorio | 0,638 | no disponible |
| Oraculo | 0,758 | no disponible |

Diferencia de la semilla 0 frente a baselines:

| Baseline | Sin su coste | Con su coste |
|---|---|---|
| Umbral de entropia | +0,016 (IC 95% +0,003 a +0,027, mejor) | -0,021 (IC 95% -0,034 a -0,009, peor) |
| Regresion logistica | +0,013 (IC 95% +0,002 a +0,019, mejor) | -0,024 (IC 95% -0,036 a -0,016, peor) |

En el umbral publicado (0,6732), la semilla 0 sobre test obtiene 64,89% de precision a un coste de 1,10 por pregunta, mas 4,27 de la llamada del juez. Referencias: siempre-grande 66,64% a coste 10,00; siempre-pequeno 60,90% a coste 0,50. En test la semilla 0 queda 2,6% por debajo de siempre-grande, al 54% de su coste incluyendo la llamada del juez.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el autor indica ejecucion en bf16 y que se necesita GPU para velocidad util.
- GPU: no se especifican modelos recomendados; el autor menciona lotes de 16 en bf16 como configuracion por defecto del juez.
- El modelo base (gemma-4-E4B-it) se descarga y carga en el primer uso, por lo que el espacio en disco y la VRAM deben cubrir el torso completo ademas del adaptador.
- Despliegue: el paquete oficial es `systemone-decider` (`PairRouter.from_pretrained`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El coste por llamada del juez se estima en 4,27 unidades segun la tabla de precios citada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SystemOne-Decider E4B qp | Router de par de modelos | no disponible (base E4B) | no disponible | Apache-2.0 | HuggingFace, 0 descargas |
| StrandsAgents/strands-decider-E4B-gemma4-v1-2610 | Decider base | no disponible | no disponible | Apache-2.0 | HuggingFace |
| Umbral de entropia sobre Qwen2.5-1.5B | Baseline de enrutamiento | 1,5B | no disponible | segun Qwen2.5 | Implementacion propia |
| Regresion logistica sobre pregunta y pasajes | Baseline de enrutamiento | no aplica | no aplica | no aplica | Implementacion propia |

Frente a los baselines, la semilla 0 mejora el AIQ sin coste propio (+0,016 y +0,013) pero queda por debajo cuando se imputa el coste de la llamada del juez (-0,021 y -0,024). No se dispone de comparacion con otros routers publicados de la misma categoria.

## Limitaciones y advertencias

- Entrenado y evaluado unicamente sobre HotpotQA y un unico par de modelos (Qwen2.5-1.5B-Instruct / Qwen2.5-7B-Instruct); no hay evidencia de generalizacion a otros pares o dominios.
- El umbral (0,6732) esta calibrado para este par y este dataset; debe recalibrarse sobre datos de validacion propios antes de usarlo en produccion.
- Solo ingles declarado.
- El coste de la llamada del juez (4,27) puede anular la ventaja frente a baselines mas baratos como el umbral de entropia; el balance depende del precio real de cada modelo.
- Riesgo de alucinacion no aplica directamente al router (no genera texto), pero una clasificacion erronea degrada la calidad de la respuesta final del pipeline.
- Sesgos: no documentados; al entrenarse sobre HotpotQA hereda la distribucion y los sesgos de ese corpus.
- Licencia Apache-2.0 para los pesos, pero los datos de entrenamiento (HotpotQA) son CC BY-SA 4.0 y el autor advierte que no esta resuelto si la clausula share-alike se aplica a los pesos derivados.
- Repositorio con 0 descargas y 0 likes: sin validacion externa de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mohameddhameem/systemone-decider-e4b-qp
- Modelo base: https://huggingface.co/StrandsAgents/strands-decider-E4B-gemma4-v1-2610
- Modelo subyacente: https://huggingface.co/google/gemma-4-E4B-it
- Codigo: https://github.com/mohameddhameem/systemone-decider
- Dataset: https://huggingface.co/datasets/hotpotqa/hotpot_qa
