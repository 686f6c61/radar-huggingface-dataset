# mohameddhameem/systemone-decider-e4b-qpa

## Resumen
SystemOne-Decider E4B qpa es un modelo enrutador (router) desarrollado por el usuario mohameddhameem que decide, para cada pregunta multi-salto de HotpotQA, si debe responderla un modelo pequeno (Qwen2.5-1.5B-Instruct) o uno grande (Qwen2.5-7B-Instruct). No es un modelo generativo de proposito general: es un clasificador binario que, dada la pregunta, los pasajes recuperados y la respuesta del modelo pequeno, devuelve la probabilidad de que sea necesario el modelo grande. Se construye sobre el Strands Decider E4B (a su vez basado en google/gemma-4-E4B-it) con su LoRA de rango 48 y su pointer head afinados.

El modelo resuelve un problema de enrutamiento en cascada: enviar todas las consultas al modelo grande maximiza la precision pero dispara el coste, mientras que usar solo el pequeno abarata pero degrada la calidad. Este enrutador aprende a identificar los casos en los que el modelo pequeno falla y el grande acierta, y solo en esos casos deriva la consulta al modelo de 7B. Es relevante porque demuestra que un juez pequeno y especializado puede superar a heuristicas clasicas como el umbral de entropia o a routers de regresion logistica en la curva precision-coste.

El repositorio ocupa 1.3 GB e incluye tres semillas (seed 0 en la raiz, seeds 1 y 2 en subcarpetas). Está pensado exclusivamente para ingles y para el par de modelos y el dataset concretos con los que fue entrenado; el propio autor advierte que el umbral debe recalibrarse para cualquier otro par o corpus.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (gemma-4-E4B-it) con LoRA de rango 48 y pointer head para clasificacion binaria |
| Parametros totales | no disponible (el torso base es E4B; el adaptador LoRA r=48 anade una fraccion pequena) |
| Parametros activos | no disponible (E4B, no se especifica el desglose MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, bf16 en inferencia segun la model card) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores LoRA + pointer head sobre el modelo base) |

## Arquitectura y entrenamiento
El modelo reutiliza el torso del Strands Decider E4B, construido sobre google/gemma-4-E4B-it, y le anade un adaptador LoRA de rango 48 junto con un pointer head que produce una probabilidad escalar P(modelo grande). La entrada es triple: la pregunta, los dos mejores pasajes recuperados por el modelo pequeno (formato "title: text") y la respuesta que produce Qwen2.5-1.5B-Instruct. La salida es la probabilidad de que el modelo grande sea necesario, y la decision se toma comparandola con un umbral fijado en validacion (0.5054 para la seed 0).

El entrenamiento se realizo sobre las 4.814 preguntas de entrenamiento del split SLR de HotpotQA, con cross-entropy grouped-softmax, learning rate 0.0001, batch 16 y hasta 2 epocas, conservando la epoca con menor NLL sobre un 10% de hold-out. La etiqueta es "el modelo grande es necesario": el pequeno falla y el grande acierta con puntuacion indulgente (lenient scoring). Se publican tres semillas entrenadas de forma independiente desde la revision 1344d44397c457f3be34b8ff15c593b41248c6bf del modelo base. El registro completo de entrenamiento y la perdida por epoca estan en training.json.

## Capacidades
- Clasificacion binaria de enrutamiento: devuelve P(modelo grande) para una pregunta, sus pasajes y la respuesta del modelo pequeno.
- Decision de enrutado directa mediante route(), que devuelve "large" o "small" segun el umbral configurado en systemone.json.
- Razonamiento implicito sobre preguntas multi-salto de HotpotQA: el modelo evalua si la respuesta del pequeno es fiable dado el contexto recuperado.
- Ensemble de semillas: las probabilidades medias de las tres semillas pueden combinarse para mejorar la calibracion.
- No soporta generacion de texto, tool calling, agentes, vision, audio ni capacidades multilingues; su unico idioma es el ingles.
- No dispone de modo thinking ni de funciones especiales mas alla de la clasificacion.

## Casos de uso
- Enrutamiento coste-eficiente en pipelines RAG: dado un sistema con un modelo pequeno y otro grande, colocar este router tras la primera respuesta del pequeno para derivar solo los casos dificiles al grande, reduciendo el coste por consulta.
- Investigacion sobre cascadas de modelos: usar el modelo como juez de referencia para comparar heuristicas de enrutamiento (umbral de entropia, regresion logistica) sobre HotpotQA.
- Optimizacion de presupuesto de inferencia en atencion al cliente con preguntas multi-salto: enviar al modelo grande solo el 7,1% de las consultas (dato de la seed 0 en test) manteniendo una precision cercana a la del modelo grande siempre activo.
- Evaluacion de calidad de respuestas de modelos pequenos: la probabilidad P(modelo grande) sirve como senal de incertidumbre sobre la respuesta del modelo de 1.5B.
- Banco de pruebas para tecnicas de calibracion y ensembles de semillas: las tres semillas publicadas permiten medir la varianza del enrutador y el efecto de promediar probabilidades.
- Docencia y experimentacion en routing de LLMs: el codigo PairRouter y los datos de entrenamiento permiten reproducir el experimento completo con HotpotQA.

## Benchmarks y rendimiento
Resultados sobre el split SLR de HotpotQA (4.814 train, 1.110 validacion, 1.481 test). AIQ es el area bajo la curva precision-coste; el coste usa el precio de la tabla 5 de AgentTTS (Qwen2.5-1.5B = 0.5, Qwen2.5-7B = 10 por llamada). Intervalos al 95% por bootstrap pareado.

| Metodo | AIQ | AIQ con su propio coste |
|---|---|---|
| Seed 0 (raiz) | 0.706 [0.684, 0.725] | 0.655 [0.633, 0.675], 4.43 por llamada |
| Media de semillas individuales ± sd | 0.705 ± 0.005 | 0.655 |
| Ensemble de tres semillas (media de P) | 0.710 | 0.609 (tres llamadas) |
| Ensemble de tres semillas, 1.303 preguntas no vistas por nano-jev | 0.711 | no disponible |
| Umbral de entropia sobre el modelo pequeno | 0.665 | no disponible |
| Router de regresion logistica en cascada (tras la respuesta) | 0.676 | no disponible |
| Mejor router de regresion logistica en el mismo punto de decision | 0.681 | no disponible |
| Aleatorio | 0.638 | no disponible |
| Oracle | 0.758 | no disponible |

Diferencias de la seed 0 frente a las lineas base:

| Comparacion | Antes de su propio coste | Con su propio coste |
|---|---|---|
| Umbral de entropia | +0.041 (IC 95% +0.027 a +0.052, mejor) | -0.010 (IC 95% -0.024 a +0.001, no significativo) |
| Router de regresion logistica en cascada | +0.030 (IC 95% +0.018 a +0.040, mejor) | -0.020 (IC 95% -0.033 a -0.011, peor) |

En el umbral publicado (0.5054), la seed 0 en test obtiene 65,70% de precision con un coste de 1,21 por pregunta, mas 4,43 por la llamada del juez, enviando el 7,1% de las preguntas al modelo grande. Siempre-grande: 66,64% a coste 10,00 por pregunta; siempre-pequeno: 60,90% a coste 0,50. El umbral mantiene la precision a menos del 1% de siempre-grande en validacion; en test queda 1,4% por debajo, con el 56% del coste de siempre-grande incluyendo la llamada del juez.

## Requisitos de hardware
- VRAM estimada: no disponible de forma explicita; el torso E4B en bf16 y el adaptador LoRA requieren una GPU con memoria suficiente para el modelo base completo (el autor indica que se necesita GPU para velocidad util).
- GPU recomendadas: no se especifican modelos concretos; se menciona ejecucion en bf16 con batches de 16 como configuracion por defecto del juez.
- GPU de consumo: no confirmado; el modelo base E4B es de tamano moderado, pero no hay datos publicados sobre su ajuste en RTX 4090 u otras consumer.
- Despliegue: el paquete systemone_decider (PairRouter) es la via oficial; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; la model card solo indica que en GPU los resultados de las tres semillas se reproducen exactamente sobre las 1.481 preguntas de test.

## Comparativa con modelos similares
| Modelo | Tipo | Parametros | Contexto | AIQ (HotpotQA SLR) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SystemOne-Decider E4B qpa (seed 0) | Router aprendido (LoRA + pointer head) | E4B + LoRA r=48 | no disponible | 0.706 (0.655 con coste propio) | apache-2.0 | Hugging Face + GitHub |
| Umbral de entropia sobre Qwen2.5-1.5B | Heuristica | 1.5B | no disponible | 0.665 | no aplica | implementacion propia |
| Router de regresion logistica en cascada | Clasificador lineal | no disponible | no disponible | 0.676 | no aplica | implementacion propia |
| Mejor router de regresion logistica en el mismo punto | Clasificador lineal | no disponible | no disponible | 0.681 | no aplica | implementacion propia |

## Limitaciones y advertencias
- Entrenado y evaluado unicamente sobre HotpotQA y un unico par de modelos (Qwen2.5-1.5B-Instruct y Qwen2.5-7B-Instruct); no generaliza sin reentrenamiento a otros pares o dominios.
- El umbral (0.5054) esta calibrado en validacion para este par concreto; debe recalibrarse sobre datos de validacion propios antes de usar otro par o dataset.
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- No es un modelo generativo: no responde preguntas, solo decide que modelo deberia hacerlo.
- El coste del propio juez (4,43 por llamada) es significativo y, con su coste incluido, la ventaja frente al umbral de entropia deja de ser significativa y frente al router de regresion logistica resulta peor.
- Precision en test 1,4% por debajo de siempre-grande, pese a que el umbral se eligio para mantenerla a menos del 1% en validacion: hay senal de sobreajuste del umbral al conjunto de validacion.
- Riesgo de alucinacion no aplica directamente al ser un clasificador, pero si la respuesta del modelo pequeno es erronea de forma no detectada, el router puede enviar al grande casos innecesarios o dejar pasar errores.
- Licencia Apache-2.0 para los pesos, pero los datos de entrenamiento (HotpotQA) son CC BY-SA 4.0 y el autor no aclara si el share-alike se aplica a los pesos derivados; conviene revisar antes de uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente por parte de la comunidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/mohameddhameem/systemone-decider-e4b-qpa
- Modelo base Strands Decider E4B: https://huggingface.co/StrandsAgents/strands-decider-E4B-gemma4-v1-2610
- Modelo base de Google: https://huggingface.co/google/gemma-4-E4B-it
- Codigo (PairRouter): https://github.com/mohameddhameem/systemone-decider
- Dataset HotpotQA: https://huggingface.co/datasets/hotpotqa/hotpot_qa
