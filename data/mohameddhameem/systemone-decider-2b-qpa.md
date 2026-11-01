# mohameddhameem/systemone-decider-2b-qpa

## Resumen

SystemOne-Decider 2B qpa es un modelo enrutador (router) de 2B parámetros desarrollado por el usuario mohameddhameem. Su función no es generar respuestas, sino decidir qué modelo de lenguaje debe contestar una pregunta de razonamiento multi-salto (multi-hop): un modelo pequeño (Qwen2.5-1.5B-Instruct) o uno grande (Qwen2.5-7B-Instruct). Dada la pregunta, los pasajes recuperados por el modelo pequeño y la respuesta que este produce, el modelo devuelve la probabilidad de que sea necesario el modelo grande.

El modelo se construye sobre StrandsAgents/strands-decider-2B-hobson-v21, a su vez basado en Qwen/Qwen3.5-2B-Base, y se afina mediante LoRA (rango 16) más una cabeza pointer con cross-entropy de softmax agrupado. Se entrena y evalúa sobre el split SLR del conjunto de desarrollo de HotpotQA (4.814 preguntas de entrenamiento, 1.110 de validación y 1.481 de test), con etiquetas derivadas de comparar el acierto del modelo pequeño y el grande.

Su relevancia radica en el ahorro de coste en pipelines de inferencia en cascada: enrutando solo el 6,5% de las preguntas al modelo grande, alcanza un 64,96% de precisión frente al 66,64% del modelo grande siempre activo, con un coste de 1,15 frente a 10,00 por pregunta. El repositorio ocupa 0,2 GB e incluye tres semillas (seed 0 en la raíz, seeds 1 y 2 en subcarpetas).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.5-2B-Base) con LoRA rango 16 y cabeza pointer para clasificación binaria |
| Parametros totales | 2B (modelo base); adaptador LoRA adicional |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, presumiblemente bf16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo reutiliza el torso de 2B parámetros de StrandsAgents/strands-decider-2B-hobson-v21 (revisión 2b52a6235c1b8306bbfa30b00b9d4b74b63a39f5), construido sobre Qwen/Qwen3.5-2B-Base. Sobre ese torso se aplica un adaptador LoRA de rango 16 y una cabeza pointer que produce una única probabilidad tipada: P(modelo grande). La entrada combina la pregunta, los dos pasajes principales recuperados por el modelo pequeño y la respuesta generada por este.

El entrenamiento usa cross-entropy de softmax agrupado sobre las 4.814 preguntas de entrenamiento del split SLR de HotpotQA, con learning rate 0,0001, batch de 16, hasta 2 épocas y retención de la época con menor NLL sobre un 10% de hold-out. La etiqueta positiva se asigna cuando el modelo pequeño falla y el grande acierta (scoring leniente). Se publican tres semillas independientes; el umbral de decisión (0,5796 en seed 0) se selecciona sobre validación. El registro completo de entrenamiento está en `training.json` del repositorio.

## Capacidades

- Clasificación binaria de enrutamiento: devuelve P(modelo grande) dada una pregunta, pasajes y respuesta del modelo pequeño.
- Decisión de routing mediante umbral calibrado en validación (`PairRouter.route` devuelve "large" o "small").
- Funcionamiento como juez de suficiencia de contexto: evalúa si los pasajes recuperados bastan para responder correctamente.
- Soporte de ensemble de semillas promediando probabilidades de las tres semillas publicadas.
- Integración programática mediante el paquete `systemone-decider` (`PairRouter.from_pretrained`).
- No genera texto libre, no soporta tool calling ni razonamiento multi-paso propio; es un componente especializado de un pipeline de cascada.

## Casos de uso

- Enrutamiento en cascada coste-eficiente: en un servicio de QA sobre documentos, enviar primero la pregunta al modelo pequeño y usar este router para decidir si escalar al grande, reduciendo el coste por consulta aproximadamente a una cuarta parte del coste de usar siempre el modelo grande.
- Control de presupuesto en producción: fijar el umbral según el coste máximo aceptable por consulta; el modelo permite ajustar el trade-off precisión/coste sin reentrenar, ya que el umbral se recalibra sobre validación.
- QA multi-salto sobre corpus documentales: para preguntas que requieren combinar información de varios pasajes (tipo HotpotQA), el router detecta cuándo los dos pasajes recuperados son insuficientes y conviene recuperar y razonar con más contexto en el modelo grande.
- Evaluación de calidad de recuperación (RAG): usar la probabilidad de escalado como señal de que el retriever ha devuelto pasajes insuficientes, disparando una segunda fase de recuperación.
- Filtrado previo en pipelines de agentes: integrar el router como paso de decisión antes de invocar herramientas o modelos caros, evitando llamadas innecesarias en consultas que el modelo pequeño resuelve con fiabilidad.
- Experimentación académica en routing de LLMs: el repositorio incluye tres semillas, código de entrenamiento y métricas (AIQ, intervalos bootstrap) que permiten reproducir y comparar estrategias de enrutamiento (entropía, regresión logística) sobre el mismo split.

## Benchmarks y rendimiento

Resultados sobre el split de test SLR de HotpotQA (1.481 preguntas). AIQ es el área bajo la curva precisión-coste; el coste sigue la Tabla 5 de AgentTTS (Qwen2.5-1.5B = 0,5; Qwen2.5-7B = 10 por llamada).

| Estrategia | AIQ | AIQ con coste propio |
|---|---|---|
| Seed 0 (raíz) | 0,695 [0,673; 0,717] | 0,682 [0,661; 0,703], 1,27 por llamada |
| Media de semillas individuales ± sd | 0,694 ± 0,001 | 0,681 |
| Ensemble de tres semillas (media de P) | 0,697 | 0,658 (tres llamadas) |
| Ensemble de tres semillas, 1.303 preguntas no vistas por nano-jev | 0,696 | No disponible |
| Umbral de entropía sobre el modelo pequeño | 0,665 | No disponible |
| Router de cascada con regresión logística (pregunta, pasajes, respuesta pequeña) | 0,676 | No disponible |
| Mejor router de regresión logística en el mismo punto de decisión | 0,681 | No disponible |
| Aleatorio | 0,638 | No disponible |
| Oráculo | 0,758 | No disponible |

En el umbral publicado (0,5796), seed 0 obtiene un 64,96% de precisión con coste de 1,15 por pregunta (más 1,27 del juez), enviando el 6,5% de las preguntas al modelo grande. Siempre-grande: 66,64% a coste 10,00. Siempre-pequeño: 60,90% a coste 0,50. Frente al umbral de entropía, seed 0 mejora +0,030 de AIQ (IC 95% +0,017 a +0,042); frente al router de regresión logística, +0,019 (IC 95% +0,009 a +0,030), aunque con el coste propio la diferencia cae a +0,006 y deja de ser significativa.

## Requisitos de hardware

- VRAM estimada: el juez ejecuta el torso de 2B en bf16, lo que requiere aproximadamente 4-5 GB de VRAM para los pesos, más memoria para activaciones (batch por defecto de 16).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM; el autor indica que se necesita GPU para velocidad útil. Una RTX 4090, A100 o H100 ofrecen margen amplio.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090).
- Despliegue: el paquete oficial `systemone-decider` (clase `PairRouter`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El modelo base Qwen3.5-2B-Base se descarga y carga en el primer uso.
- Latencia y throughput: no disponibles de forma explícita; el autor solo confirma que en GPU (bf16, batches de 16) se reproducen exactamente las puntuaciones guardadas de las tres semillas sobre las 1.481 preguntas de test.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SystemOne-Decider 2B qpa | 2B + LoRA | No disponible | Router binario de cascada | Apache-2.0 | HuggingFace (0 descargas) |
| StrandsAgents/strands-decider-2B-hobson-v21 | 2B | No disponible | Decider base (modelo de partida) | Apache-2.0 | HuggingFace |
| Umbral de entropía sobre Qwen2.5-1.5B-Instruct | 1,5B | No disponible | Baseline de routing sin entrenamiento | Apache-2.0 (Qwen) | HuggingFace |
| Router de regresión logística (baseline del autor) | No aplica (clásico) | No disponible | Baseline de routing supervisado | No disponible | Código del autor |

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente con un par de modelos (Qwen2.5-1.5B / Qwen2.5-7B) y un único dataset (HotpotQA); no hay evidencia de generalización a otros pares, dominios o idiomas.
- El umbral (0,5796) está calibrado para este par y este dataset; debe recalibrarse sobre validación propia antes de usarlo con otro par o corpus.
- Solo soporta inglés; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- En test, seed 0 queda un 2,5% por debajo de la precisión de siempre-grande, pese a que el umbral se eligió para mantener la precisión dentro del 1% en validación: existe deriva entre validación y test.
- La ventaja sobre el router de regresión logística deja de ser estadísticamente significativa al incluir el coste del propio juez (+0,006, IC 95% -0,004 a +0,016).
- Riesgo de alucinación no aplica directamente (no genera texto), pero una probabilidad mal calibrada provoca escalados innecesarios (coste) o respuestas erróneas del modelo pequeño (calidad).
- Licencia Apache-2.0 para los pesos, pero los datos de entrenamiento (HotpotQA) son CC BY-SA 4.0; el autor advierte que no está resuelto si la cláusula share-alike se aplica a los pesos derivados.
- Repositorio sin descargas ni likes en el momento de la consulta; no hay validación independiente de los resultados publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mohameddhameem/systemone-decider-2b-qpa
- Modelo base (Strands Decider): https://huggingface.co/StrandsAgents/strands-decider-2B-hobson-v21
- Modelo base subyacente: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Código: https://github.com/mohameddhameem/systemone-decider
- Dataset: https://huggingface.co/datasets/hotpotqa/hotpot_qa
