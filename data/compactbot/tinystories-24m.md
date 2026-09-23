# Compactbot/tinystories-24m

## Resumen

TinyStories-24m es un modelo de lenguaje de 24.585.600 parametros entrenado desde cero por el usuario Compactbot sobre el dataset roneneldan/TinyStories. Se trata de un GPT decoder-only con embeddings atados (weight tying), RMSNorm, atencion causal multi-cabeza con qkv fusionado (SDPA) y FFN con activacion GELU. Su unico objetivo es generar micro-relatos coherentes en ingles con dialogo, nombres propios, puntuacion y estructura narrativa, no actuar como asistente general.

El modelo tiene 384 dimensiones de embedding, 12 capas, 8 cabezas de atencion, FFN de 1536 y una ventana de contexto de 512 tokens con vocabulario BPE de 8192 tokens. Se entreno durante 1 epoca (aproximadamente 13.600 pasos) con AdamW, cosine learning rate de 6e-4 y 500 pasos de warmup, en bf16 sobre una unica RTX 5090.

Su relevancia es doble: por un lado sirve como ejemplo reproducible y ligero del pipeline TinyStories (paper 2305.07759) para estudiar el minimo de capacidad necesario para producir ingles coherente; por otro, es un artefacto practico para generar cuentos sinteticos, probar infraestructura de inferencia y experimentar con modelos de menos de 100 MB en disco. La model card es inusualmente honesta y documenta que el run completo divergio a NaN en el paso 9.350, por lo que se publica el checkpoint del paso 6.000 (el mejor), no el final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT decoder-only con embeddings atados, RMSNorm, atencion causal multi-cabeza con qkv fusionado (SDPA) y FFN GELU |
| Parametros totales | 24.585.600 (verificado contra la cabecera de safetensors) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32, 75 tensores, 98.349.056 bytes) |
| Dimension del modelo (D) | 384 |
| Numero de capas (L) | 12 |
| Cabezas de atencion (H) | 8 |
| Dimension de la FFN | 1536 |
| Vocabulario | 8192 tokens (BPE) |
| Dataset de entrenamiento | roneneldan/TinyStories (447,8 M tokens de train, 2 M de validacion retenidos) |
| Epocas y pasos | 1 epoca, ~13.600 pasos; publicado el checkpoint del paso 6.000 |
| Formato del tokenizer | tokenizer.json (formato HF `tokenizers`, 560.804 bytes) |
| Integracion con transformers | no; requiere el `modeling.py` incluido |
| Tamano del repositorio | 0,1 GB |
| Descargas acumuladas | 240 |
| Fecha de creacion del repositorio | 2026-09-23 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clasico de 12 capas con normalizacion RMSNorm y embeddings de entrada y salida atados, lo que reduce el recuento de parametros al compartir la matriz de 8192 x 384 entre la proyeccion de tokens y la cabeza de lenguaje. La atencion es causal multi-cabeza con las proyecciones de query, key y value fusionadas en una sola operacion y ejecutada mediante scaled dot-product attention (SDPA). La FFN intermedia tiene 1536 unidades con activacion GELU, una relacion de expansion de 4x respecto a la dimension de 384. El contexto maximo es de 512 tokens y el tokenizer es un BPE entrenado especificamente con vocabulario de 8192 piezas.

El entrenamiento se hizo desde cero sobre roneneldan/TinyStories, un corpus de micro-cuentos infantiles generado sinteticamente, con 447,8 millones de tokens de entrenamiento y 2 millones de tokens de validacion retenidos. Se ejecuto una sola epoca (aproximadamente 13.600 pasos) con AdamW, learning rate cosine de 6e-4 y 500 pasos de warmup, autocast en bf16, sobre una unica GPU RTX 5090. No se reporta uso de RLHF, DPO ni ninguna fase de alineacion posterior; tampoco se documenta decodificacion especulativa ni variantes de atencion lineal.

El detalle tecnico mas relevante de la model card es la divergencia: el run completo alcanzo NaN en el paso 9.350, coherente con un learning rate de 6e-4 demasiado alto para un modelo de 24 M de parametros. El artefacto publicado es el checkpoint del paso 6.000, cuya perplejidad de validacion en ventana fija es 8,76 (2,1618 nats/token). Una reproduccion sobre el split completo de validacion (100 ventanas aleatorias de 512 tokens sobre los 4,5 M de tokens de validacion) da 12,39 (2,5172 nats/token); la diferencia se atribuye a la metodologia de evaluacion (ventana fija frente a ventanas aleatorias), no a un error de la ficha.

## Capacidades

- Generacion de texto narrativo corto en ingles: micro-cuentos con dialogo, nombres de personajes (Ben, Lily, Mom, Tom, Sarah, Max), puntuacion correcta y flujo narrativo.
- Coherencia a nivel de parrafo dentro del dominio TinyStories: segun la model card, 9 de 9 generaciones sembradas (3 semillas x 3 prompts) resultaron coherentes.
- Modelado de distribucion de texto infantil sencillo con un vocabulario BPE de 8192 tokens.
- Inferencia en CPU y en GPU con muy poca memoria, al tratarse de un modelo de 98 MB en float32.
- Entrenamiento e inferencia desde cero sin dependencia de la libreria `transformers`: se carga con el `modeling.py` incluido.
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso.
- No tiene capacidades multilingues: solo ingles.
- No dispone de modo thinking, vision, audio ni ninguna otra modalidad distinta de texto.
- No responde a preguntas fuera de su dominio de entrenamiento; no es un asistente general.

## Casos de uso

- Generacion de datos sinteticos para aumentar corpus: el modelo puede producir miles de micro-cuentos infantiles con estructura narrativa consistente para preentrenar o hacer fine-tuning de modelos mayores en tareas de narracion sencilla, con un coste de generacion minimo (98 MB de pesos en float32).
- Pruebas de infraestructura de inferencia en CI/CD: al pesar menos de 100 MB y caber en CPU, permite validar pipelines de despliegue, tokenizacion y batching en integracion continua sin consumir presupuesto de GPU.
- Docencia y divulgacion sobre transformers: es un caso de estudio pequeno y autocontenido (12 capas, 8 cabezas, 8192 tokens de vocabulario) para explicar atencion causal, weight tying, RMSNorm y decodificacion autoregresiva con codigo legible en `modeling.py`.
- Investigacion sobre tokenizers de vocabulario reducido: permite medir como un BPE de 8192 piezas afecta a la perplejidad y a la calidad narrativa en comparacion con vocabularios mayores.
- Experimentos de eficiencia y cuantizacion: sirve como banco de pruebas para aplicar cuantizacion post-entrenamiento (int8, int4) o destilacion en modelos diminutos, ya que el original en float32 ocupa 98 MB y es trivial de mover entre dispositivos.
- Generacion de texto en entornos embebidos o edge: con aproximadamente 49 MB en fp16 y 25 MB en int8 estimados, puede ejecutarse en dispositivos sin GPU dedicada para aplicaciones de escritura creativa offline.
- Prototipado de interfaces de escritura creativa: desarrolladores pueden integrar el modelo como motor de sugerencias de frases o continuaciones de cuentos en demos locales, aceptando la limitacion de 512 tokens de contexto y de dominio exclusivamente narrativo.
- Creacion de datasets con dialogo para otras tareas: los cuentos generados, con turnos de dialogo y nombres propios, pueden reutilizarse para entrenar sistemas de deteccion de hablantes, analisis de narrativa o modelos de texto-a-voz orientados a lectura infantil.

## Benchmarks y rendimiento

Resultados publicados en la model card (loglikelihood zero-shot, 400 ejemplos por tarea):

| Tarea | Precision | Nivel de azar | Observaciones |
|---|---|---|---|
| ARC-Easy | 13,3% | 25% | por debajo del azar |
| ARC-Challenge | 12,5% | 25% | por debajo del azar |
| HellaSwag | 25,0% | 25% | en el nivel del azar |
| SciQ | 25,0% | 25% | en el nivel del azar |
| PIQA | 50,0% | 50% | en el nivel del azar |

Metricas de lenguaje:

| Metrica | Valor |
|---|---|
| Perplejidad de validacion en ventana fija (paso 6.000) | 8,76 |
| Perplejidad en nats/token en ventana fija | 2,1618 |
| Perplejidad en reproduccion completa del split de validacion (100 ventanas aleatorias de 512 tokens) | 12,39 |
| Perplejidad en nats/token en la reproduccion completa | 2,5172 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras tareas de razonamiento, codigo o matematicas en la informacion disponible. El autor senala que todos los resultados estan en el nivel del azar o por debajo, comportamiento esperado en un modelo de 24 M de parametros entrenado exclusivamente con cuentos infantiles simples.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 98 MB en float32, unos 49 MB en fp16/bf16 y unos 25 MB en int8 (estimaciones a partir del recuento de parametros; no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria es suficiente. El entrenamiento se realizo en una unica RTX 5090.
- Cabe en cualquier GPU de consumo: GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc. Tambien se puede ejecutar en CPU sin problemas, como muestra el ejemplo de uso de la model card (`device="cpu"`).
- Opciones de despliegue: no hay soporte publicado para vLLM, llama.cpp, Ollama, TGI ni formato GGUF. La unica via documentada es cargar `modeling.py` con `TinyStoriesGPT.from_pretrained` y usar el tokenizer BPE de `tokenizers`; el bucle de decodificacion es manual (multinomial sobre softmax con temperatura 0,8 en el ejemplo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|---|
| Compactbot/tinystories-24m | 24,59 M | 512 tokens | Apache 2.0 | safetensors float32 + modeling.py propio | Perplejidad de validacion 8,76 (ventana fija) / 12,39 (split completo); benchmarks al nivel del azar | HuggingFace, 240 descargas, no compatible con `transformers` |
| Familia TinyStories del paper 2305.07759 | Rango de 1 M a 35 M (variantes del paper) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | Paper y dataset publicos |
| Modelos de 125 M tipo GPT-2 small citados como referencia en el paper | 125 M | no disponible | no disponible | no disponible | no disponible | Ampliamente disponibles |

No se dispone en la informacion proporcionada de cifras comparativas de parametros, contexto, licencia o rendimiento para alternativas concretas de la misma categoria. La comparativa relevante es conceptual: TinyStories-24m se situa en el rango pequeno de la familia TinyStories, con 24,59 M de parametros, frente a los modelos de ~125 M que el paper usa como referencia para estudiar el minimo de capacidad necesario para generar ingles coherente.

## Limitaciones y advertencias

- Sesgo de dominio: el modelo solo ha visto roneneldan/TinyStories, un corpus de cuentos infantiles generados sinteticamente. Cualquier texto fuera de ese dominio (codigo, preguntas, conversacion general) queda fuera de su alcance.
- Limitacion de contexto: la ventana es de 512 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Limitacion de idioma: solo ingles. No hay capacidades multilingues ni se ha validado el comportamiento en castellano.
- Riesgo de alucinacion: al ser un modelo puramente generativo de distribucion narrativa, inventara nombres, objetos y hechos sin ninguna base factual. No debe usarse para responder preguntas factuales.
- Rendimiento en benchmarks: ARC-Easy (13,3%) y ARC-Challenge (12,5%) estan por debajo del azar, y HellaSwag, SciQ y PIQA estan exactamente en el nivel del azar. No tiene conocimiento cientifico, sentido comun ni razonamiento.
- No es un asistente: la propia model card indica explicitamente que no respondera a preguntas para las que no fue entrenado.
- Historial de divergencia: el run completo divergio a NaN en el paso 9.350 con learning rate 6e-4. El artefacto publicado es el checkpoint del paso 6.000. Cualquier reentrenamiento deberia reducir el learning rate y monitorizar la perdida para evitar reproducir la divergencia.
- Friccion de integracion: no es un modelo `transformers`, requiere importar el `modeling.py` del repositorio y gestionar manualmente el bucle de generacion y el recorte de contexto a 512 tokens.
- Ausencia de variantes cuantizadas: no se publican pesos GGUF, int8 ni int4, por lo que el ahorro de memoria depende del casting manual del desarrollador.
- Licencia Apache 2.0: permite uso comercial y modificacion, siempre que se conserve el aviso de copyright y la licencia. No se declaran restricciones adicionales ni clausulas de uso aceptable especificas en la informacion proporcionada.
- Repositorio de bajo uso: 240 descargas y 2 likes en el momento de la consulta, sin validacion independiente por terceros mas alla de la model card.
- Advertencia de nombres: existe un sitio comercial sin relacion llamado tinystories.ai (libros personalizados con fotos). No tiene ninguna vinculacion con este modelo ni con el dataset de Ronen Eldan.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Compactbot/tinystories-24m
- Dataset de entrenamiento: https://huggingface.co/datasets/roneneldan/TinyStories
- Ficheros del dataset: https://huggingface.co/datasets/roneneldan/TinyStories/tree/main
- Paper TinyStories: How Small Can Language Models Be and Still Speak Coherent English? (pagina en HuggingFace Papers): https://huggingface.co/papers/2305.07759
- PDF del paper en OpenReview: https://openreview.net/pdf?id=yiPtWSrBrN
- Sitio comercial sin relacion (referencia para evitar confusion): https://tinystories.ai/
- Lista comunitaria de modelos gratuitos (referencia no vinculada al modelo): https://github.com/ClawLabsAI/free-ai-models
