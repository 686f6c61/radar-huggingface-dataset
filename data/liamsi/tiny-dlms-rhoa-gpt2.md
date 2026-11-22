# liamsi/tiny-dlms-rhoa-gpt2

## Resumen

Rhoa es un modelo de decisión de tamano minimo (2.056.960 parametros) desarrollado por liamsi como proyecto de aprendizaje dentro de la familia tiny-dlms. A diferencia de un modelo generativo, Rhoa no escribe texto: recibe un contexto y una lista de opciones, puntua cada opcion con un unico forward pass y aplica softmax sobre las puntuaciones para devolver una probabilidad por opcion. Esta variante concreta (rhoa-gpt2) emplea bloques estilo GPT-2 con LayerNorm, posiciones aprendidas y activacion GELU.

El modelo se ha entrenado desde cero en PyTorch, sin usar la libreria `transformers`: tokenizer byte-level BPE de 8.192 tokens, transformer de 4 capas y anchura 128 con 4 cabezas de atencion, mas una capa adicional donde las opciones "se miran entre si". La entrada tiene el formato `<cls> contexto <sep> opcion` con un maximo de 128 tokens. El preentrenamiento se hizo con prediccion de tokens enmascarados sobre 2 GB de texto web de FineWeb-Edu (479 millones de tokens) durante 13.000 pasos, seguido de un ajuste fino conjunto sobre bAbI, CLINC150, Banking77 y CommonsenseQA.

Su relevancia es fundamentalmente didactica y de investigacion: demuestra que un modelo de decision de apenas dos millones de pesos puede resolver tareas de seleccion multiple estructuradas (intenciones, opciones de bAbI) con alta precision, y sirve como referencia reproducible para estudiar el limite practico de los modelos ultra pequenos. El autor lo califica explicitamente como "un proyecto de aprendizaje, no un modelo de produccion".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de decision (encoder) con bloques GPT-2: LayerNorm, posiciones aprendidas, GELU; 4 capas x 128 de anchura (4 cabezas) + 1 capa de atencion entre opciones |
| Parametros totales | 2.056.960 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (entrada `<cls> contexto <sep> opcion`) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Rhoa es un transformer encoder de 4 capas y anchura 128 con 4 cabezas de atencion, construido con bloques al estilo GPT-2 (LayerNorm, embeddings posicionales aprendidos y GELU). A esas capas se anade una capa especifica en la que las representaciones de las distintas opciones asisten entre si, de modo que el modelo puede comparar candidatos de forma relativa antes de puntuarlos. El tokenizer es un BPE byte-level de 8.192 tokens entrenado sobre el mismo corpus web. La entrada concatena contexto y opcion con tokens especiales `<cls>` y `<sep>`, limitada a 128 tokens; la salida es una puntuacion por opcion y un softmax que la convierte en probabilidad.

El entrenamiento consta de dos fases. Primero, preentrenamiento con prediccion de tokens enmascarados sobre 2 GB de FineWeb-Edu (479 millones de tokens) durante 13.000 pasos. Despues, ajuste fino multitarea simultaneo sobre cuatro datasets: bAbI (con 2 a 6 opciones), CLINC150 (151 intenciones), Banking77 (77 intenciones) y CommonsenseQA (5 opciones). El codigo, el tokenizer y el bucle de entrenamiento estan escritos desde cero en PyTorch, sin `transformers`. No se documenta uso de RLHF ni DPO.

## Capacidades

- Seleccion multiple y clasificacion zero-shot: puntua una lista arbitraria de opciones dado un contexto y devuelve una probabilidad por opcion.
- Clasificacion de intenciones: ajustado especificamente sobre CLINC150 (151 clases) y Banking77 (77 clases).
- Razonamiento sobre escenarios sinteticos: resuelve tareas de bAbI con 2 a 6 opciones.
- Puntuacion comparativa entre opciones gracias a la capa de atencion cruzada entre candidatos.
- Procesamiento de texto en ingles con tokenizer BPE propio de 8.192 tokens.
- No genera texto libre: no es un modelo causal de lenguaje.
- No soporta tool calling, function calling ni comportamiento de agente.
- No tiene vision, audio ni modo de razonamiento extendido (thinking).
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Clasificacion de intenciones en asistentes conversacionales: dado un turno del usuario y una lista cerrada de intenciones (por ejemplo, las 77 de Banking77), el modelo devuelve la probabilidad de cada una en un unico forward pass, lo que permite enrutar la conversacion a un flujo concreto con un coste computacional minimo.
- Enrutamiento de tickets de soporte: con un contexto breve y un conjunto de categorias predefinidas, se puede usar como primer clasificador barato antes de un modelo mayor, aprovechando su licencia MIT y su huella de 2 millones de parametros.
- Evaluacion de sistemas de dialogo: al ser reproducible y entrenado desde cero, sirve como baseline controlado para medir la dificultad de un conjunto de opciones o de un dataset de intenciones concreto.
- Investigacion sobre modelos ultra pequenos: permite estudiar el limite de capacidad de un transformer de 2 millones de pesos en tareas de seleccion, incluyendo el analisis del caso CommonsenseQA, donde el rendimiento se queda cerca del azar.
- Docencia y prototipado rapido: el ejemplo de uso de la model card (contexto "i lost my card yesterday, what should i do?" con opciones de banca) se puede reproducir en minutos en CPU, lo que lo hace util para ensenar el flujo completo tokenizer-modelo-softmax.
- Clasificacion zero-shot de etiquetas cortas: para taxonomias pequenas de frases nominales, el modelo puede puntuar etiquetas candidatas sin reentrenamiento, siempre que el dominio se parezca a los datos de ajuste fino.
- Experimentos de destilacion o comparacion arquitectonica: al existir variantes (rhoa, rhoa-small, rhoa-base, rhoa-gpt2) con el mismo esquema de entrenamiento, permite aislar el efecto de los bloques GPT-2 frente a otras configuraciones.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre los conjuntos de test held-out:

| Dataset (test held-out) | Opciones | Este modelo | Azar |
|---|---|---|---|
| bAbI | 6 | 99,7% | 28,2% |
| CLINC150 | 151 | 68,4% | 0,7% |
| Banking77 | 77 | 82,1% | 1,3% |
| CommonsenseQA | 5 | 21,1% | 20,0% |

El propio autor senala que CommonsenseQA se mantiene cerca del azar en todos los modelos de la familia, porque unos pocos millones de pesos no pueden almacenar conocimiento del mundo. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (2,06 M de parametros, unos 8 MB de pesos); cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquiera; no requiere A100, H100 ni RTX 4090. Una GPU integrada o una CPU moderna son suficientes.
- Cabe en GPU consumer: si, en todas, incluidas GTX 1050, RTX 3050 o inferiores.
- Opciones de despliegue: el paquete propio `tiny-dlm` (instalable via `pip install "tiny-dlm[hub] @ git+https://github.com/benisalla/tiny-dlms"`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-dlms-rhoa-gpt2 | 2,06 M | 128 tokens | Seleccion multiple / decision | MIT | Hugging Face |
| tiny-dlms-rhoa | no disponible | 128 tokens (segun esquema comun) | Seleccion multiple / decision | MIT | Hugging Face |
| tiny-dlms-rhoa-small | no disponible | 128 tokens (segun esquema comun) | Seleccion multiple / decision | MIT | Hugging Face |
| tiny-dlms-rhoa-base | no disponible | 128 tokens (segun esquema comun) | Prediccion de tokens enmascarados (preentrenamiento) | MIT | Hugging Face |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada, salvo que la model card describe a `tiny-dlms-rhoa` como "el mejor Rhoa". No se han identificado en la informacion disponible modelos externos comparables de la misma categoria y tamano.

## Limitaciones y advertencias

- No es un modelo generativo: no puede producir texto libre, solo puntuar opciones.
- Capacidad de conocimiento del mundo practicamente nula: CommonsenseQA queda en el 21,1%, cerca del 20% del azar.
- Ventana de contexto muy corta (128 tokens), insuficiente para documentos largos o conversaciones multi-turno extensas.
- Solo ingles; no se documenta soporte de otros idiomas.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de calibracion: las probabilidades del softmax pueden no reflejar incertidumbre real fuera de la distribucion de entrenamiento.
- Sesgos: al entrenarse sobre FineWeb-Edu y datasets de intenciones en ingles, puede heredar sesgos de esos corpus; el autor no documenta analisis de sesgo.
- Restricciones de licencia: licencia MIT, permite uso comercial, pero el autor advierte explicitamente que es "un proyecto de aprendizaje, no un modelo de produccion".
- Dependencia de una libreria no estandar (`tiny-dlms`) instalada desde GitHub, lo que complica la reproducibilidad y el mantenimiento a largo plazo.
- Sin soporte documentado para tool calling, agentes ni integracion con ecosistemas como vLLM o TGI.

## Enlaces

- Hugging Face: https://huggingface.co/liamsi/tiny-dlms-rhoa-gpt2
- Repositorio GitHub: https://github.com/benisalla/tiny-dlms
- Pagina del proyecto: https://benisalla.github.io/tiny-dlms/
- Variante rhoa: https://huggingface.co/liamsi/tiny-dlms-rhoa
- Variante rhoa-small: https://huggingface.co/liamsi/tiny-dlms-rhoa-small
- Variante rhoa-base: https://huggingface.co/liamsi/tiny-dlms-rhoa-base
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset bAbI: https://huggingface.co/datasets/Muennighoff/babi
- Dataset CLINC150: https://huggingface.co/datasets/clinc/clinc_oos
- Dataset Banking77: https://huggingface.co/datasets/PolyAI/banking77
- Dataset CommonsenseQA: https://huggingface.co/datasets/tau/commonsense_qa
