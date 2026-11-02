# Ahmed167/arabert-arbanking77-intents

## Resumen

AraBERT fine-tuned para intenciones bancarias en arabe (ArBanking77) es un modelo de clasificacion de texto que asigna un mensaje de un cliente bancario a una de las 77 intenciones definidas en el dataset ArBanking77 ("card arrival", "exchange rate", "transfer fee charged", entre otras). Lo desarrolla Ahmed167 partiendo de `aubmindlab/bert-base-arabertv02`, un BERT base preentrenado especificamente para arabe, y lo publica con pesos en safetensors (fp16) y un grafo ONNX en fp16 listo para servir sin PyTorch.

El modelo resuelve un problema concreto de enrutamiento de consultas en atencion al cliente financiera en arabe: dado un texto corto, devuelve la intencion mas probable con una puntuacion de confianza. Su interes practico esta en el trabajo de evaluacion: el autor detecta que el split oficial de ArBanking77 filtra (el 94% de sus filas tienen una parafrasis de la misma pregunta en entrenamiento) y construye un split propio sin solapamiento de preguntas, midiendo ademas el rendimiento en dialectos no vistos (saudi, marroqui y tunecino).

Arquitectonicamente es un transformer encoder BERT base con 135.252.557 parametros, contexto de 128 tokens y salida de 77 clases. El repositorio ocupa 0,5 GB e incluye tanto los pesos PyTorch como el ONNX que el autor sirve en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, AraBERTv02) |
| Parametros totales | 135.252.557 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (longitud maxima de entrenamiento) |
| Tipos de cuantizacion | fp16 (pesos publicados), int8 (probada, descartada por perdida de precision o mayor latencia en CPU sin VNNI) |
| Idiomas soportados | Arabe (MSA y dialectos); entrenado en MSA y palestino |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (fp16, 272 MB; 540 MB cargado en fp32) y ONNX fp16 (272 MB) |

## Arquitectura y entrenamiento

El modelo es un BERT base de AraBERTv02 con fine-tuning completo sobre la tarea de clasificacion de intenciones (77 clases). La entrada se trunca a 128 tokens, coherente con la longitud de los mensajes bancarios del dataset. La cabeza de clasificacion mapea el vector `[CLS]` a las 77 intenciones, cuyos nombres estan en `config.json` bajo `id2label`.

El entrenamiento usa ArBanking77 en MSA y palestino: 21.571 textos de entrenamiento provenientes de 8.993 preguntas fuente, con un split de validacion propio de 2.397 textos y 999 preguntas que no comparte ninguna pregunta con entrenamiento. Se ejecuto en una unica T4 (Kaggle) durante 8 minutos, con learning rate 4e-5, batch size 64, warm-up del 10%, weight decay 0.01, precision mixta fp16, early stopping sobre macro-F1 de validacion con paciencia 2 y conservando la mejor epoca (8 de 10). No se menciona RLHF ni DPO: es fine-tuning supervisado clasico. La innovacion destacable no esta en la arquitectura sino en la metodologia de evaluacion: split sin fuga de preguntas, intervalos de confianza por bootstrap sobre preguntas fuente completas y evaluacion en dialectos no vistos.

## Capacidades

- Clasificacion de texto en arabe en 77 intenciones bancarias, con puntuacion de confianza por clase.
- Deteccion de intencion en MSA y en dialecto palestino con rendimiento alto; en saudi y marroqui con rendimiento medio; en tunecino, bajo.
- Salida `top_k` mediante el pipeline de `transformers` para obtener las k intenciones mas probables.
- Inferencia sin PyTorch a traves del grafo ONNX fp16 con `onnxruntime` y `tokenizers`.
- Compatibilidad con Text Embeddings Inference y endpoints (tags del repositorio).
- No soporta tool calling, agentes, vision, audio ni generacion de texto: es exclusivamente un clasificador.

## Casos de uso

- Enrutamiento de tickets en atencion al cliente bancaria: el modelo clasifica cada mensaje entrante en una de las 77 intenciones y lo deriva al equipo o flujo correspondiente; la puntuacion de confianza permite enviar a revision humana los casos con score bajo.
- Clasificacion previa a un chatbot de soporte: se usa como primer paso para decidir que flujo conversacional activar (tarjetas, transferencias, tipos de cambio, comisiones) antes de invocar un modelo generativo.
- Analitica de voz del cliente: agregar las intenciones detectadas en grandes volumenes de mensajes para medir que temas dominan y detectar picos de incidencias.
- Despliegue en CPU de bajo coste: con el ONNX fp16 (0,86 GB en reposo, 530 ms de latencia mediana con 4 usuarios concurrentes en una CPU de portatil de 2014) es viable en infraestructura sin GPU.
- Filtrado y priorizacion en bandejas de entrada: clasificar y ordenar mensajes por intencion y confianza para que los agentes humanos atiendan primero los casos criticos.
- Prototipado de sistemas de comprension del lenguaje en arabe: sirve como baseline fuerte y reproducible para experimentos de NLU en dominio financiero, con un baseline TF-IDF + regresion logistica ya medido para comparar.
- Evaluacion de robustez dialectal: util como referencia para medir la caida de rendimiento al pasar de MSA a dialectos no vistos en entrenamiento.

## Benchmarks y rendimiento

Macro-F1 promediado sobre las intenciones presentes en cada conjunto; intervalo del 95% por bootstrap sobre preguntas fuente completas.

| Conjunto | Este modelo | Baseline TF-IDF + regresion logistica |
|---|---|---|
| Validacion, MSA + palestino (split propio) | 0,919 (0,900-0,932) | 0,887 |
| Test, MSA | 0,919 | 0,881 |
| Test, palestino | 0,899 | 0,852 |
| Test, saudi (no visto en entrenamiento) | 0,843 | 0,719 |
| Test, marroqui (no visto en entrenamiento) | 0,779 | 0,612 |
| Test, tunecino (no visto en entrenamiento; 27 intenciones) | 0,599 | 0,499 |

Notas del autor: entrenando sobre el split oficial, la misma configuracion alcanza 0,921 en el test MSA, la cifra reportada por los autores del dataset. Tres semillas difirieron 0,3 puntos en validacion pero hasta 4 puntos en los dialectos no vistos; el modelo publicado es la semilla mediana (43).

Rendimiento en servido sobre CPU (portatil de 2014, 4 nucleos, sin AVX2, contenedor limitado a 3 CPUs):

| Metrica | PyTorch | ONNX fp16 |
|---|---|---|
| Imagen del contenedor | 2,26 GB | 0,95 GB |
| Memoria en reposo | 1,23 GB | 0,86 GB |
| Latencia mediana, 4 usuarios concurrentes | 670 ms | 530 ms |

## Requisitos de hardware

- VRAM para inferencia en GPU: minima; el modelo en fp16 ocupa unos 272 MB de pesos y en fp32 unos 540 MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; el autor entreno en una T4. Una RTX 4090 o A100 no aportan ventaja practica para este tamano de modelo.
- Cabe en GPU consumer: si, en cualquier RTX o GTX con 2 GB o mas; tambien en CPU.
- Despliegue: `transformers` (pipeline de text-classification), `onnxruntime` + `tokenizers` para el grafo ONNX, Text Embeddings Inference y endpoints compatibles.
- Latencia y throughput: 530 ms de latencia mediana con ONNX fp16 en CPU de 2014 limitada a 3 nucleos con 4 usuarios concurrentes; 670 ms con PyTorch. No se publican cifras de throughput en GPU.
- Recomendacion operativa del autor: en ONNX Runtime, fijar los hilos por peticion al maximo de CPUs que el proceso puede usar; si se deja elegir al runtime, cuenta todos los nucleos del host y la latencia se degrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Macro-F1 (test MSA) | Licencia |
|---|---|---|---|---|---|
| Ahmed167/arabert-arbanking77-intents | 135,3 M | 128 tokens | Clasificacion de 77 intenciones bancarias | 0,919 | CC BY-SA 4.0 |
| Baseline TF-IDF + regresion logistica (mismo autor) | no aplica | no aplica | Misma tarea | 0,881 | no disponible |
| aubmindlab/bert-base-arabertv02 (modelo base) | no disponible en la informacion | no disponible en la informacion | Modelo de lenguaje enmascarado en arabe | no aplica (no clasifica intenciones) | no declarada en su model card |

No se dispone de datos de otros clasificadores de intenciones en arabe en la informacion proporcionada para ampliar la comparativa.

## Limitaciones y advertencias

- El dominio son consultas localizadas de fintech europea, no conversaciones reales con bancos arabes; el rendimiento en produccion real puede diferir.
- El entrenamiento cubre solo MSA y palestino. El rendimiento cae de forma marcada en marroqui (0,779) y tunecino (0,599), y no se ha probado en egipcio, otros dialectos del Golfo o levantinos, ni en Arabizi.
- El modelo siempre elige una de las 77 intenciones, incluso si el mensaje trata de otra cosa: no existe clase "ninguna de estas". Hay que comprobar la puntuacion superior antes de actuar sobre la prediccion.
- La varianza entre semillas es alta en dialectos no vistos (hasta 4 puntos), por lo que las cifras en saudi, marroqui y tunecino deben tratarse como estimaciones con incertidumbre.
- Licencia CC BY-SA 4.0, impuesta por el dataset ArBanking77: el uso comercial exige cumplir las condiciones de atribucion y compartir igual.
- La model card del modelo base no declara licencia; el autor remite a aub-mind/arabert antes de cualquier uso comercial.
- Riesgo de alucinacion en el sentido de clasificaciones erroneas con alta confianza en entradas fuera de dominio; no hay calibracion documentada mas alla de las puntuaciones softmax.
- La cuantizacion int8, aunque reduce el modelo a 135 MB, no se adopto porque en CPUs sin VNNI perdia precision o era mas lenta; no debe asumirse como opcion segura sin validacion propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ahmed167/arabert-arbanking77-intents
- Modelo base: https://huggingface.co/aubmindlab/bert-base-arabertv02
- Repositorio AraBERT: https://github.com/aub-mind/arabert
- Paper de AraBERT: https://arxiv.org/abs/2003.00104
- Paper de ArBanking77 (ArabicNLP 2023): https://aclanthology.org/2023.arabicnlp-1.22
