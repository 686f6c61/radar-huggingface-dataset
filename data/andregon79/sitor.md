# Andregon79/sitor

## Resumen

SITOR (Sistema Inteligente de Tipificacion, Orquestacion y Resolucion de Incidencias) es un clasificador de secuencias basado en `roberta-base` afinado por Pedro Andreu Torres como tesis de Master en Data Science e IA. Su proposito es el triaje y enrutado automatico de tickets en entornos BPO y mesas de ayuda IT: recibe el texto de una incidencia y predice a cual de 56 colas operativas solapadas debe asignarse.

A diferencia de un clasificador que decide por `argmax`, SITOR incorpora una capa de calibracion (Softmax calibrado mediante L-BFGS) y una logica de negocio asimetrica: solo automatiza el enrutado cuando la confianza supera 0.85; por debajo de ese umbral marca el ticket para revision humana. Este diseno busca minimizar el coste de un enrutado erroneo en un entorno Tier-1.

El modelo tiene 124.688.696 parametros (~125M, equivalente a RoBERTa base), se distribuye en safetensors bajo licencia MIT y esta etiquetado para ingles y espanol, aunque la model card indica que el entrenamiento se realizo sobre un corpus en ingles de soporte de telecomunicaciones. Es relevante por su enfoque de "cortafuegos algoritmico": prioriza precision sobre cobertura en lugar de maximizar accuracy bruta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa base) con cabeza de clasificacion de secuencias |
| Parametros totales | 124.688.696 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (maximo de la arquitectura RoBERTa base; la model card usa truncacion a 128 en el ejemplo de uso) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | Etiquetado como `en` y `es`; la model card especifica entrenamiento en ingles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SITOR es un fine-tuning de `roberta-base`, un transformer encoder de 12 capas y 125M de parametros con atencion bidireccional, adaptado como `AutoModelForSequenceClassification` para clasificacion multietiqueta de 56 clases. La innovacion no esta en la arquitectura, sino en la capa de decision: las salidas Softmax se calibran con L-BFGS para que la probabilidad predicha sea una estimacion fiable de certeza, y el sistema aplica un umbral operativo de 0.85 en lugar de `argmax`.

El entrenamiento se realizo sobre un dataset publico de soporte al cliente de telecomunicaciones obtenido de Kaggle. El autor indica que los datos crudos pasaron por una deduplicacion severa y un mapeo asimetrico para simular un ecosistema BPO de 56 colas solapadas. La validacion empleo `StratifiedGroupKFold` para evitar fuga de datos, con un conjunto de hold-out ciego de 3.080 tickets. No se detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO (no procede en un clasificador).

## Capacidades

- Clasificacion de texto multietiqueta en 56 colas operativas solapadas.
- Enrutado automatizado con umbral de confianza calibrado (>= 0.85) y derivacion a revision humana por debajo de ese umbral.
- Prediccion de la clase mas probable junto con su score de confianza via Softmax.
- Soporte de tickets de soporte al cliente y gestion de servicios IT (etiquetas `customer-support`, `it-service-management`, `bpo`).
- Inferencia por lotes mediante la API estandar de `transformers`.
- Capacidad bilingue declarada (en, es) en las etiquetas del repositorio, con entrenamiento efectivo en ingles segun la model card.
- No dispone de tool calling, function calling, razonamiento multi-paso, modo thinking, vision ni audio: es exclusivamente un clasificador.

## Casos de uso

- Triaje automatico de tickets en mesa de ayuda IT: el modelo lee la descripcion de la incidencia y la asigna a una de las 56 colas cuando la confianza supera 0.85, reduciendo el trabajo manual de clasificacion inicial.
- Enrutado en centros de contacto BPO Tier-1: al automatizar solo el 38,5% del volumen con un 97,3% de precision, se reserva el esfuerzo humano para los casos ambiguos.
- Filtro previo a sistemas de asignacion humana: los tickets con confianza inferior a 0.85 se marcan para revision, evitando enrutados erroneos costosos.
- Monitorizacion de calidad y analitica de colas: la distribucion de predicciones sobre un lote historico permite detectar cambios en la composicion de incidencias por cola.
- Enrutado en soporte de telecomunicaciones: el corpus de entrenamiento es especificamente de soporte de telecomunicaciones, por lo que el modelo encaja en flujos de este sector.
- Integracion en pipelines de ticketing (ServiceNow, Zendesk, Jira Service Management) como microservicio de clasificacion previo a la asignacion de agente.
- Priorizacion y pre-etiquetado en modo sombra: ejecutar el modelo en paralelo al flujo humano para medir su precision real antes de activar la automatizacion.

## Benchmarks y rendimiento

Los unicos datos disponibles proceden de la model card y corresponden a un hold-out ciego de 3.080 tickets con validacion `StratifiedGroupKFold`:

| Metrica | Valor |
|---|---|
| Top-1 accuracy base (56 clases solapadas) | ~59% |
| Volumen automatizado con umbral 0.85 | 38,5% del total |
| Precision operativa sobre el volumen automatizado | 97,3% (2,7% de error residual) |
| Reduccion teorica de errores operativos (hibrido vs. 100% humano) | 31,8% |
| Conjunto de evaluacion | 3.080 tickets (hold-out ciego) |

No se han publicado resultados de benchmarks estandar (MMLU, GLUE, etc.) en la informacion disponible. La cifra de ROI del 31,8% es teorica ("in-vitro") y el propio autor indica que requiere validacion en modo sombra en produccion.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,5 GB en FP32 y en torno a 0,25 GB en FP16 para los pesos; con activaciones y batch pequeno, menos de 1 GB en total.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4090, GTX 1650 e incluso integradas modernas.
- Es viable en CPU para cargas moderadas, dado el tamano de 125M de parametros y entradas truncadas a 128-512 tokens.
- GPU recomendadas para alta concurrencia: T4, L4, A10 o A100/H100 si se necesita throughput masivo por lotes.
- Opciones de despliegue: `transformers` (referencia en la model card), TorchServe, ONNX Runtime, FastAPI como microservicio, o Hugging Face Inference Endpoints. No se han publicado variantes GGUF para llama.cpp/Ollama ni integraciones con vLLM/TGI en la informacion disponible.
- Latencia y throughput: no disponibles. Con 125M de parametros y secuencias cortas, en GPU se espera latencia de pocos milisegundos por peticion, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SITOR (Andregon79/sitor) | 124,7M | 512 tokens | Clasificacion en 56 colas BPO/IT | MIT | HuggingFace, 0 descargas |
| roberta-base (FacebookAI) | 125M | 512 tokens | Modelo base, sin cabeza de clasificacion | MIT | Ampliamente disponible |
| distilbert-base-uncased | 66M | 512 tokens | Modelo base destilado | Apache 2.0 | Ampliamente disponible |
| deberta-v3-base | ~184M | 512 tokens | Modelo base | MIT | Ampliamente disponible |

La diferencia clave frente a los modelos base es que SITOR incorpora una cabeza de 56 clases especifica de dominio y una calibracion de confianza orientada a un umbral operativo. No hay datos de benchmarks comparativos publicados entre SITOR y estas alternativas en la informacion disponible.

## Limitaciones y advertencias

- El propio autor reconoce aproximadamente un 59% de Top-1 accuracy sobre 56 clases solapadas; solo el 38,5% del volumen se automatiza, por lo que mas de la mitad de los tickets requieren intervencion humana.
- La cifra de reduccion de errores del 31,8% es teorica y debe validarse en produccion en modo sombra antes de tomar decisiones operativas.
- Entrenado con un unico dataset publico de Kaggle (soporte de telecomunicaciones); puede no generalizar a otros dominios de negocio ni a otras taxonomias de colas distintas de las 56 aprendidas.
- La model card especifica entrenamiento en ingles, aunque las etiquetas del repositorio incluyen espanol; el rendimiento real en espanol no esta documentado.
- Riesgo de alucinacion irrelevante (es un clasificador), pero si existe riesgo de clasificacion erronea en tickets ambiguos, cortos o con jerga fuera de dominio.
- Limite de 512 tokens: los tickets largos se truncan y pueden perder informacion relevante; el ejemplo de la model card trunca a 128 tokens.
- Licencia MIT, que permite uso comercial, pero al derivar de `roberta-base` conviene verificar las condiciones de la licencia del modelo base y de los datos de origen.
- Repositorio sin descargas ni likes en el momento de la consulta y creado recientemente: no hay validacion por parte de la comunidad ni soporte de mantenimiento garantizado.
- Las etiquetas de clase y el orden de salida no estan documentados en la informacion disponible, lo que obliga a recuperar el mapeo de etiquetas para interpretar las predicciones.

## Enlaces

- HuggingFace: https://huggingface.co/Andregon79/sitor
- Modelo base: https://huggingface.co/FacebookAI/roberta-base
- Los resultados de la busqueda web no aportan enlaces relevantes: apuntan a servicios no relacionados (sitor.ai de tutoria, generadores de modelos 3D). No se han encontrado papers, blogs ni repositorios adicionales asociados a este modelo en la informacion disponible.
