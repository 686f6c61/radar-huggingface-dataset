# mohameddhameem/systemone-decider-2b-qp

## Resumen

SystemOne-Decider 2B qp es un modelo enrutador (router) de 2B parámetros desarrollado por el usuario mohameddhameem. Su función no es generar respuestas, sino decidir qué modelo de lenguaje debe contestar una pregunta de razonamiento multi-salto: un modelo pequeño (Qwen2.5-1.5B-Instruct) o uno grande (Qwen2.5-7B-Instruct). Dado un par formado por la pregunta y los pasajes recuperados que vería el modelo pequeño, devuelve la probabilidad P(modelo grande) y enruta la consulta según un umbral calibrado en validación.

El modelo parte de StrandsAgents/strands-decider-2B-hobson-v21, a su vez basado en Qwen/Qwen3.5-2B-Base, y se afina mediante LoRA (rango 16) más una cabeza de tipo pointer para resolver una única pregunta tipada: "¿qué modelo debe responder esta pregunta?". El repositorio incluye tres semillas (0 en la raíz, 1 y 2 en subcarpetas) que permiten reproducir exactamente los resultados publicados.

Su relevancia reside en el ahorro de coste: en HotpotQA, el enrutador envía solo el 7,5 % de las preguntas al modelo grande, manteniéndose a 2,7 puntos porcentuales de la precisión de usar siempre el modelo grande, con un coste del 24 % de esa estrategia (incluyendo la llamada del propio juez). Es un ejemplo práctico de cascada de modelos con un clasificador aprendido en lugar de heurísticas de entropía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.5-2B-Base) con LoRA rango 16 y cabeza pointer para clasificación binaria |
| Parametros totales | 2B (torso base); el adaptador LoRA y la cabeza se suman sobre esta base |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, presumiblemente bf16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB) |

## Arquitectura y entrenamiento

El modelo reutiliza el torso de 2B parámetros del Strands Decider (derivado de Qwen3.5-2B-Base) y le añade dos componentes: un adaptador LoRA de rango 16 y una cabeza pointer que produce una probabilidad escalar P(modelo grande). La entrada es la pregunta junto con los dos pasajes de mayor puntuación que el modelo pequeño usaría, es decir, el enrutador decide antes de que el modelo pequeño responda.

El entrenamiento se realizó con entropía cruzada de softmax agrupado sobre 4.814 preguntas de entrenamiento del split SLR de HotpotQA, con learning rate 0,0001, batch de 16, hasta 2 épocas y selección de la época con menor NLL sobre un 10 % de hold-out. La etiqueta es "el modelo grande es necesario": el pequeño falla y el grande acierta (scoring lenient). Partió de la revisión `2b52a6235c1b8306bbfa30b00b9d4b74b63a39f5` del modelo base y el registro completo de entrenamiento está en `training.json`.

## Capacidades

- Clasificación binaria de enrutamiento: devuelve P(modelo grande) para una pregunta y sus pasajes.
- Decisión de ruta con umbral configurable (`threshold` en `systemone.json`, valor publicado 0,3241).
- Funciona como juez previo a la respuesta del modelo pequeño, sin necesidad de que este genere texto.
- Soporte de ensemble de semillas: combinar las probabilidades de las tres semillas mejora ligeramente el AIQ (0,682 frente a 0,679 de media individual).
- Reproducibilidad exacta de las puntuaciones guardadas de cada semilla sobre las 1.481 preguntas de test en GPU con bf16 y batches de 16.
- No genera texto, no hace tool calling, no soporta visión ni audio, y no tiene capacidades multilingües más allá del inglés.

## Casos de uso

- Cascada de modelos en producción: usar el enrutador para decidir entre un modelo pequeño barato y uno grande caro, reduciendo el coste por consulta al 24 % del de usar siempre el grande en HotpotQA.
- Sistemas RAG multi-salto: en pipelines de recuperación con varios pasajes, el router decide si la evidencia recuperada basta para el modelo pequeño o requiere el grande, usando los mismos pasajes que vería el pequeño.
- Control de presupuesto de inferencia: fijar el umbral según el coste tolerable por consulta, ya que el umbral se calibra en validación y controla la fracción de consultas enviadas al modelo grande (7,5 % en el punto publicado).
- Evaluación de pares de modelos: reutilizar el código (`PairRouter`) para medir si un par pequeño/grande concreto se beneficia de enrutamiento antes de desplegarlo.
- Filtrado previo en atención al cliente o QA documental: descartar consultas fáciles hacia el modelo pequeño y reservar el grande para las que el pequeño fallaría.
- Investigación sobre routing aprendido: comparar el enrutador con baselines de entropía y regresión logística usando los splits y scripts publicados.

## Benchmarks y rendimiento

Split SLR del dev set de HotpotQA: 4.814 preguntas de entrenamiento, 1.110 de validación y 1.481 de test. El coste sigue la tabla 5 de AgentTTS (Qwen2.5-1.5B = 0,5; Qwen2.5-7B = 10 por llamada); AIQ es el área bajo la curva precisión-coste.

| Estrategia | AIQ | AIQ con su propio coste |
|---|---|---|
| Semilla 0 (raíz) | 0,675 [0,655; 0,698] | 0,666 [0,646; 0,688], 1,19 por llamada |
| Media de semillas individuales ± sd | 0,679 ± 0,004 | 0,669 |
| Ensemble de tres semillas (media de P) | 0,682 | 0,651 (tres llamadas) |
| Ensemble de tres semillas, 1.303 preguntas no vistas por nano-jev | 0,681 | No disponible |
| Umbral de entropía sobre el modelo pequeño | 0,665 | No disponible |
| Router de regresión logística (pregunta y pasajes) | 0,668 | No disponible |
| Mejor router de regresión logística en el mismo punto de decisión | 0,669 | No disponible |
| Aleatorio | 0,638 | No disponible |
| Oráculo | 0,758 | No disponible |

Diferencias de la semilla 0 frente a baselines:

| Baseline | Antes de su propio coste | Con su coste |
|---|---|---|
| Umbral de entropía | +0,010 (IC 95 % -0,001 a +0,024, no significativo) | +0,001 (IC 95 % -0,010 a +0,014, no significativo) |
| Regresión logística (pregunta y pasajes) | +0,007 (IC 95 % -0,003 a +0,015, no significativo) | -0,003 (IC 95 % -0,012 a +0,005, no significativo) |

En el umbral publicado (0,3241), la semilla 0 sobre test obtiene 64,82 % con coste de 1,21 por pregunta más 1,19 de la llamada del juez, enviando el 7,5 % de las preguntas al modelo grande. Siempre grande: 66,64 % a coste 10,00; siempre pequeño: 60,90 % a coste 0,50. En validación el umbral mantiene la precisión a menos del 1 % de siempre-grande; en test la semilla 0 queda 2,7 % por debajo, con el 24 % del coste de siempre-grande incluyendo la llamada del juez.

## Requisitos de hardware

- VRAM estimada: el repo pesa 0,2 GB (adaptador y cabeza); el torso base de 2B en bf16 requiere aproximadamente 4-5 GB de VRAM para inferencia.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM; el autor indica que se necesita GPU para velocidad útil y que en bf16 con batches de 16 reproduce exactamente los resultados guardados.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, así como A100 y H100 para mayor throughput.
- Opciones de despliegue: el paquete propio `systemone_decider` (`PairRouter.from_pretrained`), instalable con `pip install git+https://github.com/mohameddhameem/systemone-decider`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; el coste computacional se mide en llamadas (1,19 por consulta en la semilla 0), no en latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SystemOne-Decider 2B qp | 2B (base) + LoRA | No disponible | Enrutador binario pequeño/grande en HotpotQA | Apache-2.0 | HuggingFace, 0 descargas |
| Umbral de entropía sobre Qwen2.5-1.5B | 1,5B | No disponible | Baseline de enrutamiento sin entrenamiento | Apache-2.0 (Qwen) | Implementación propia |
| Router de regresión logística | No aplica | No aplica | Baseline sobre pregunta y pasajes | No disponible | Implementación propia |
| StrandsAgents/strands-decider-2B-hobson-v21 | 2B | No disponible | Modelo base del enrutador | Apache-2.0 | HuggingFace |

Frente a los baselines, la mejora de la semilla 0 no es estadísticamente significativa en AIQ (intervalos de confianza que cruzan cero), aunque el modelo ofrece la ventaja de ser un artefacto entrenado y reproducible con tres semillas y puntuaciones exactas.

## Limitaciones y advertencias

- Entrenado y evaluado solo en HotpotQA y con un único par de modelos (Qwen2.5-1.5B-Instruct / Qwen2.5-7B-Instruct); no hay evidencia de generalización a otros dominios o pares.
- El umbral está calibrado en validación para este par; debe recalibrarse sobre datos de validación propios antes de usar otro par o dataset.
- Solo soporta inglés.
- Las mejoras frente a baselines de entropía y regresión logística no son estadísticamente significativas según los intervalos publicados.
- Riesgo de alucinación no aplica a la generación (no genera texto), pero sí puede enrutar mal y degradar la precisión global.
- La licencia es Apache-2.0, pero los datos de entrenamiento (HotpotQA) son CC BY-SA 4.0 y no está resuelto si el share-alike aplica a los pesos; la model card no afirma que no aplique.
- Repo con 0 descargas y 0 likes; sin pipeline declarado ni benchmarks externos independientes.
- Requiere GPU para velocidad útil; el torso de 2B se descarga en el primer uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mohameddhameem/systemone-decider-2b-qp
- Modelo base: https://huggingface.co/StrandsAgents/strands-decider-2B-hobson-v21
- Modelo Qwen base del decider: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Código: https://github.com/mohameddhameem/systemone-decider
- Dataset: https://huggingface.co/datasets/hotpotqa/hotpot_qa
