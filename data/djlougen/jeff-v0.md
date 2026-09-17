# DJLougen/jeff-v0

## Resumen

Jeff v0 es un enrutador de modelos (model router) desarrollado por el usuario DJLougen y publicado en HuggingFace bajo licencia Apache 2.0. No es un modelo generativo: se trata de un encoder MiniLM de 22 millones de parámetros con dos cabezas de salida que, dado un prompt, estima si la respuesta de un modelo local (Gemma-4-E4B) es suficiente o si merece la pena escalar la petición a un modelo frontera. En otras palabras, no responde la pregunta del usuario, sino que calcula el valor marginal de cómputo adicional.

La primera cabeza es de clasificación y devuelve `P(local_sufficient)`, la probabilidad de que el modelo local supere la tarea con calidad aceptable. La segunda es de regresión y devuelve `E[delta_q]`, la ganancia esperada de calidad al usar el modelo frontera. El modelo se distribuye en formato ONNX (`router_fp32.onnx` con pesos externos en `.onnx.data`), además de un state dict de PyTorch (`model.pt`) y un envoltorio serializado con pickle (`router.pkl`).

Su relevancia actual radica en el problema de coste operativo en despliegues de LLM: enrutar dinámicamente entre un modelo local barato y un modelo frontera caro permite reducir gasto sin degradar la calidad percibida. Según la model card, con un umbral de 0,6 Jeff mantiene el 62 % del tráfico en local con una retención de calidad del 99,6 %, y con umbral 0,9 mantiene el 31,3 % del tráfico local con una retención del 100,6 %. El repositorio ocupa 0,3 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer tipo MiniLM con dos cabezas (clasificacion binaria + regresion), exportado a ONNX |
| Parametros totales | 22 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens en el ejemplo de uso (`truncation=True, max_length=256`); no se declara contexto oficial |
| Tipos de cuantizacion | No disponible (se publica `router_fp32.onnx`; no se listan variantes cuantizadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`router_fp32.onnx` + pesos externos `.onnx.data`), PyTorch state dict (`model.pt`), pickle (`router.pkl`) |

## Arquitectura y entrenamiento

La arquitectura es un encoder MiniLM de 22 millones de parámetros con dos cabezales sobre la representación del prompt: una cabeza de clasificación que produce `P(local_sufficient)` y una cabeza de regresión que produce `E[delta_q]`. El modelo no genera texto; su única función es emitir un par de valores numéricos que un sistema externo utiliza para decidir el enrutado. El tokenizador se distribuye en el subfolder `tokenizer` del repositorio y la inferencia se realiza con ONNX Runtime, lo que permite ejecución en CPU.

El entrenamiento se realizó sobre 9.553 pares contrafactuales del dataset `DJLougen/jeff-router-data`. Cada prompt fue respondido por dos modelos: uno local (`google/gemma-4-E4B-it`, ejecutado en una GPU L4 de Colab según la model card) y uno frontera (`deepseek-v4-flash-0731`, servido vía Fireworks). Las respuestas se evaluaron con calificadores deterministas (coincidencia exacta, comparación numérica, tests de código y comprobaciones de restricciones), sin juez LLM. Las etiquetas se derivan de la regla `local_sufficient = local_score >= 0.70 AND delta_q <= 0.10`. No se documenta el uso de RLHF ni DPO, ni el número total de tokens de entrenamiento más allá del recuento de pares.

Como innovación destacable, la model card reporta transferencia frente a objetivos de escalado no vistos durante el entrenamiento: evaluado con contrafactuales de otros dos modelos frontera (`glm-5p3-flash` y `gpt-oss-120b`), el enrutador conserva aproximadamente el 95 % de la utilidad del oráculo. También se menciona un script de calibración (`scripts/16_mac_calibration.py`) para ajustar la frontera de decisión cuando se usa un build local cuantizado en lugar del E4B canónico en bf16.

## Capacidades

- Clasificación binaria de prompts: predice `P(local_sufficient)`, la probabilidad de que el modelo local resuelva la tarea con calidad aceptable.
- Regresión de ganancia: predice `E[delta_q]`, la mejora de calidad esperada al escalar a un modelo frontera.
- Enrutado coste-calidad: con un umbral configurable (0,6 agresivo en ahorro, 0,9 conservador) decide si la consulta se queda en local o se escala.
- Evaluación sobre tareas objetivamente calificables: matemáticas, código, preguntas de opción múltiple y seguimiento de instrucciones.
- Inferencia sin GPU dedicada: al ser un encoder de 22 M de parámetros exportado a ONNX, puede ejecutarse en CPU.
- Transferencia entre modelos frontera: la frontera de decisión aprendida generaliza a destinos de escalado distintos de los usados en entrenamiento.
- No soporta tool calling ni function calling: no es un modelo generativo ni un agente.
- No dispone de modo thinking, visión, audio ni capacidades multimodales.
- Capacidades multilingües: no declaradas; no hay información sobre idiomas soportados.

## Casos de uso

- Enrutado coste-calidad en producción: colocado delante de un despliegue local (por ejemplo Gemma-4-E4B) y de una API frontera, Jeff v0 decide por prompt si la respuesta local basta. Con umbral 0,6 mantiene el 62 % del tráfico en local reteniendo el 99,6 % de la calidad, lo que se traduce directamente en reducción de gasto de API.
- Pasarela interna de LLM con presupuesto: en un proxy corporativo que da servicio a varios equipos, el router permite asignar un techo de gasto por departamento escalando solo las peticiones con ganancia esperada alta (`E[delta_q]` elevado).
- Optimización de pipelines de agentes multi-paso: en flujos con varias llamadas encadenadas, el coste se multiplica por paso. Enrutar cada subconsulta permite reservar el modelo frontera para los pasos realmente críticos y resolver los triviales en local.
- Despliegue en edge o en entornos sin GPU: al ser un encoder de 22 M de parámetros en ONNX, cabe en una CPU modesta y puede acompañar a un modelo local pequeño en dispositivos con recursos limitados.
- Telemetría y análisis de carga de trabajo: los valores de `P(local_sufficient)` y `E[delta_q]` agregados a lo largo del tiempo permiten identificar qué tipos de tarea justifican realmente un modelo frontera y cuáles no.
- Selección de proveedor frontera: gracias a la transferencia medida frente a objetivos no vistos, el router puede usarse para comparar si merece la pena cambiar de proveedor de escalado sin reentrenar el modelo.
- Evaluación comparativa de modelos locales: usar el router como instrumento de medida para estimar el porcentaje de tráfico que un nuevo modelo local podría absorber antes de comprometer una migración.
- Control de calidad con falsos locales acotados: con umbral 0,9 el porcentaje de falsos locales es del 1,2 %, lo que hace viable el enrutado en entornos donde una respuesta local insuficiente tiene coste reputacional.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre `test_iid` (n = 995):

| Router | Retencion de calidad | Trafico mantenido en local | Reduccion de coste | Falsos locales |
|---|---|---|---|---|
| always-local | 83,9 % | 100 % | 100 % | 17,1 % |
| heuristico | 89,0 % | 73,3 % | 69,1 % | 12,4 % |
| TF-IDF | 99,1 % | 24,3 % | 19,7 % | 1,5 % |
| embedding | 99,9 % | 15,3 % | 12,6 % | 0,7 % |
| **Jeff v0** | **100,6 %** | **31,3 %** | **25,1 %** | 1,2 % |
| oracle (techo) | 105,4 % | 66,6 % | 47,6 % | 0 % |

Datos adicionales declarados por el autor:

| Metrica | Valor |
|---|---|
| ROC-AUC de Jeff v0 | 0,861 |
| ROC-AUC del heuristico | 0,609 |
| Retencion de calidad con umbral 0,6 | 99,6 % |
| Trafico en local con umbral 0,6 | 62 % |
| Utilidad del oraculo retenida en transferencia a modelos frontera no vistos | ~95 % |

No se han publicado resultados de benchmarks en la informacion disponible mas alla de los anteriores. Las cifras proceden exclusivamente de la model card del autor y no consta verificacion independiente. La retencion de calidad superior al 100 % se explica porque la referencia es la propia respuesta local, de modo que un valor por encima de 100 % implica mejora respecto a quedarse siempre en local.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 (22 M de parametros, aproximadamente 88 MB de pesos); el repositorio completo ocupa 0,3 GB.
- GPU recomendadas: no se especifica ninguna. El propio autor reporta la generacion de los datos de entrenamiento en una GPU L4 de Colab, pero la inferencia del router es lo bastante ligera para no requerir GPU.
- Cabe en cualquier GPU de consumo: si, incluida cualquier RTX, GTX o iGPU moderna, y tambien en CPU. El modelo es viable incluso en portatiles sin GPU dedicada.
- Opciones de despliegue: ONNX Runtime (via de referencia mostrada en la model card), PyTorch con el state dict `model.pt` o el envoltorio `router.pkl` del repositorio de entrenamiento. No se documenta soporte especifico para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos.
- Latencia y throughput: no disponible. Al tratarse de un encoder de 22 M de parametros con `max_length=256`, la latencia esperada seria de milisegundos en CPU, pero no se aporta ninguna medicion en la informacion disponible.

## Comparativa con modelos similares

No se han identificado modelos comparables publicados en la informacion disponible. La comparativa mas cercana es la que ofrece el propio autor frente a alternativas de enrutado no neuronales evaluadas sobre el mismo conjunto de test:

| Alternativa | Tipo | Retencion de calidad | Trafico en local | Reduccion de coste | ROC-AUC |
|---|---|---|---|---|---|
| Jeff v0 | Encoder MiniLM de 22 M con dos cabezas | 100,6 % | 31,3 % | 25,1 % | 0,861 |
| Heuristico | Reglas manuales | 89,0 % | 73,3 % | 69,1 % | 0,609 |
| TF-IDF | Clasificador clasico sobre n-gramas | 99,1 % | 24,3 % | 19,7 % | no disponible |
| Embedding | Clasificador sobre embeddings | 99,9 % | 15,3 % | 12,6 % | no disponible |
| Oracle | Limite superior teorico | 105,4 % | 66,6 % | 47,6 % | no disponible |

## Limitaciones y advertencias

- Entrenado unicamente con tareas calificables objetivamente (matematicas, codigo, opcion multiple, seguimiento de instrucciones). La calidad en conversacion abierta o generacion creativa no esta validada y el router puede comportarse de forma erratica en esos dominios.
- Los calificadores binarios hacen que la etiqueta `local_sufficient` sea independiente del modelo frontera; la senal especifica de cada frontera recae solo en la cabeza de regresion `delta_q`.
- Las puntuaciones corresponden al modelo local canonico en bf16 sobre una L4. Un build local cuantizado puede desplazar la frontera de decision, por lo que el autor recomienda recalibrar con `scripts/16_mac_calibration.py`.
- La model card no declara sesgos conocidos, pero tampoco presenta analisis de sesgo por idioma, dominio, genero o grupo demografico. El idioma de entrenamiento no se especifica.
- Riesgo de alucinacion: no aplica en el sentido habitual, porque el modelo no genera texto. El riesgo equivalente es un falso local, es decir, mantener en local una peticion que requeria un modelo frontera; con umbral 0,9 esta tasa es del 1,2 %, y aumenta al bajar el umbral.
- El modelo estima la utilidad marginal, no la correccion de la respuesta: una probabilidad alta de suficiencia local no garantiza que la respuesta local sea correcta.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion con atribucion y conservacion del aviso de licencia. No incluye garantias.
- El repositorio registra 0 descargas y 0 likes, y la model card no documenta validacion externa, revision por pares ni pruebas en produccion a escala. Las cifras de benchmark deben tratarse como no verificadas de forma independiente.
- La model card referencia modelos (`gemma-4-E4B-it`, `deepseek-v4-flash-0731`, `glm-5p3-flash`) cuya disponibilidad publica no se ha podido confirmar en la informacion disponible, lo que complica la reproduccion del pipeline de evaluacion.
- El modelo esta atado al supuesto de un modelo local concreto; cambiar de modelo local invalida la calibracion del umbral.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DJLougen/jeff-v0
- Dataset de entrenamiento: https://huggingface.co/datasets/DJLougen/jeff-router-data
- Repositorio de codigo y pipeline: https://github.com/DJLougen/jeff-router
- Script de calibracion en Mac mencionado en la model card: `scripts/16_mac_calibration.py` (dentro del repositorio anterior)
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web realizada; los resultados devueltos no guardan relacion con el modelo.
