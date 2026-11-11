# Kamyar-zeinalipour/TalkFa-Sentiment-Llama-3.2-3B-Instruct-LoRA

## Resumen

TalkFa-Sentiment-Llama-3.2-3B-Instruct-LoRA es un adaptador LoRA de tipo PEFT para el modelo base meta-llama/Llama-3.2-3B-Instruct, desarrollado por Kamyar Zeinalipour en el marco del proyecto TalkFa. Su funcion es clasificar dialogos teatrales en persa (farsi) en tres categorias de sentimiento: negativo, neutro o positivo. El adaptador se entrena sobre el split de entrenamiento de PlayDial-Fa (1.867 dialogos) del benchmark TalkFa, presentado en el paper "TalkFa: A Unified Benchmark for Farsi Dialogue Generation and Understanding" (arXiv:2609.01810).

El modelo resuelve un problema acotado pero relevante: el analisis de sentimiento en persa sobre texto dialogado y de registro teatral, un dominio poco cubierto por los recursos existentes. Se apoya en la arquitectura transformer decoder-only de Llama 3.2 3B Instruct, con 3.000 millones de parametros y una ventana de contexto de 128.000 tokens heredada del modelo base. El adaptador no modifica la arquitectura, sino que ajusta los pesos mediante LoRA sobre el modelo Instruct congelado.

La relevancia actual del modelo es doble. Por un lado, forma parte de una familia de adaptadores TalkFa que cubren varios tamanos (1B, 3B, 7B, 8B, 12B y 24B) y dos tareas (generacion Wiki-FaDial y sentimiento PlayDial-Fa), lo que permite comparar el efecto del escalado en una tarea concreta de PLN en persa. Por otro, su publicacion junto al benchmark y al paper facilita la reproducibilidad. El repositorio ocupa 1,7 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2 3B Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 3.000 millones (modelo base); adaptador LoRA de rango bajo, numero de parametros del adaptador no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama 3.2 3B Instruct) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; al ser compatible con transformers y PEFT, se puede cuantizar a bfloat16, float16, int8 e int4 mediante herramientas estandar |
| Idiomas soportados | Persa (fa) para la tarea objetivo; el modelo base soporta ademas ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre meta-llama/Llama-3.2-3B-Instruct, un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El modelo base fue entrenado por Meta con un corpus multilingue y posteriormente alineado con tecnicas de instruccion y preferencias; los detalles exactos del entrenamiento del base no se recogen en la informacion proporcionada. El adaptador LoRA congela los pesos del base e inyecta matrices de bajo rango en las capas del transformer, lo que reduce el coste de ajuste y el tamano del artefacto resultante.

El entrenamiento del adaptador se realiza sobre el split de entrenamiento de PlayDial-Fa (1.867 dialogos) del benchmark TalkFa, un conjunto verificado por humanos para generacion y comprension de dialogo en persa. La tarea se formula como generacion de texto: el modelo recibe el historial de turnos del dialogo y debe responder nombrando exactamente la etiqueta de sentimiento correcta (negativo, neutro o positivo). La evaluacion se hace sobre el split de test de PlayDial-Fa (104 dialogos). La configuracion exacta de entrenamiento (rango LoRA, alpha, tasa de aprendizaje, numero de epocas, composicion del dataset) esta en el fichero configs/train_sentiment.json del repositorio GitHub del proyecto, aunque sus valores no se detallan en la model card.

La innovacion principal no reside en la arquitectura, sino en el enfoque de evaluacion: la correccion se mide exigiendo que la respuesta nombre exactamente la etiqueta dorada, lo que penaliza respuestas ambiguas o con formato incorrecto. El adaptador se distribuye como modulo PEFT que puede fusionarse con el base mediante merge_and_unload() para inferencia sin la capa LoRA.

## Capacidades

- Clasificacion de sentimiento en persa sobre dialogos teatrales en tres clases: negativo, neutro y positivo.
- Generacion de texto condicionada al historial de conversacion multturno, usando la plantilla de chat del modelo base.
- Comprension de dialogo en persa con contexto largo, gracias a la ventana de 128.000 tokens del modelo base.
- Capacidad multilingue heredada del modelo base (ingles, aleman, frances, italiano, portugues, hindi, espanol, tailandes), aunque el adaptador solo se ha entrenado para persa.
- Soporte de tool calling y function calling heredado del modelo base Llama 3.2 Instruct, no verificado especificamente para esta tarea.
- Capacidad de razonamiento multi-paso y modo agente heredada del base, no evaluada en el adaptador.
- No dispone de vision ni audio: el modelo base es exclusivamente de texto.

## Casos de uso

- Analisis de sentimiento en resenas y comentarios en persa: el adaptador puede clasificar opiniones de usuarios en tres clases, aprovechando el contexto largo del base para procesar conversaciones completas sin truncar.
- Moderacion de comunidades en linea en farsi: clasificar hilos de discusion como negativos, neutros o positivos para priorizar revision humana en foros y redes sociales.
- Investigacion en PLN para persa: servir como linea base reproducible para comparar con otros adaptadores TalkFa (1B, 7B, 8B, 12B, 24B) y estudiar el efecto del escalado en una tarea concreta.
- Analisis de guiones y obras de teatro: el entrenamiento sobre dialogos teatrales lo hace adecuado para estudiar la evolucion emocional de personajes a lo largo de una escena o acto.
- Extraccion de senales de sentimiento en transcripciones de atencion al cliente en persa: permite enrutar conversaciones hacia agentes humanos o flujos automatizados segun la polaridad detectada.
- Evaluacion de sistemas de dialogo en persa: usar el adaptador como juez auxiliar para medir la tonalidad de las respuestas generadas por otros modelos en benchmarks de dialogo.
- Prototipado rapido en entornos con GPU de gama media: al ser un adaptador de 3B parametros, se puede desplegar en una unica GPU consumer para pruebas de concepto.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test de PlayDial-Fa (104 dialogos). Una respuesta se considera correcta cuando nombra exactamente la etiqueta dorada. Metricas macro.

| Metrica (macro) | Base | TalkFa LoRA | Delta |
|---|---:|---:|---:|
| Precision | 0,33 | 0,58 | +0,26 |
| Recall | 0,45 | 0,52 | +0,07 |
| F1 | 0,38 | 0,50 | +0,12 |

El adaptador mejora la precision en 0,26 puntos y el F1 en 0,12 puntos respecto al modelo base sin ajustar. El recall mejora solo 0,07 puntos, lo que indica que el adaptador sigue teniendo dificultades para cubrir todas las clases del conjunto de test. No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 6-7 GB para el modelo base de 3B parametros mas el adaptador LoRA (el adaptador en si ocupa una fraccion pequena del total).
- VRAM estimada en cuantizacion int8: aproximadamente 3,5-4 GB.
- VRAM estimada en cuantizacion int4: aproximadamente 2-2,5 GB.
- GPU recomendadas para produccion: NVIDIA A100 (40/80 GB), H100 (80 GB) o L40S para despliegues con concurrencia alta; tambien funciona en una unica GPU con suficiente memoria.
- GPU consumer compatibles: RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4070 Ti (12 GB) y RTX 3090 (24 GB) pueden ejecutar el modelo en bfloat16 o int8 sin problemas. En int4 cabe en GPUs con 8 GB o menos.
- Opciones de despliegue: transformers con PEFT (merge_and_unload para fusionar el adaptador), vLLM, TGI, llama.cpp (previa conversion a GGUF) y Ollama. El adaptador se puede fusionar con el base para simplificar el despliegue.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Al tratarse de un modelo de 3B parametros, se espera una latencia baja en GPUs modernas, pero no se han publicado mediciones.

## Comparativa con modelos similares

La familia TalkFa incluye adaptadores equivalentes sobre otros modelos base, lo que permite una comparacion directa dentro del mismo benchmark y la misma tarea.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| TalkFa-Sentiment-Llama-3.2-3B-Instruct-LoRA (este) | 3B | 128.000 | Sentimiento PlayDial-Fa | llama3.2 | Hugging Face |
| TalkFa-Sentiment-Llama-3.2-1B-Instruct-LoRA | 1B | 128.000 | Sentimiento PlayDial-Fa | llama3.2 | Hugging Face |
| TalkFa-Sentiment-Mistral-7B-Instruct-v0.3-LoRA | 7B | 32.000 (aprox.) | Sentimiento PlayDial-Fa | Apache 2.0 (Mistral) | Hugging Face |
| TalkFa-Sentiment-Llama-3.1-8B-Instruct-LoRA | 8B | 128.000 | Sentimiento PlayDial-Fa | llama3.1 | Hugging Face |
| TalkFa-Sentiment-Mistral-Nemo-Instruct-2407-LoRA | 12B | 128.000 (aprox.) | Sentimiento PlayDial-Fa | Apache 2.0 (Mistral) | Hugging Face |
| TalkFa-Sentiment-Mistral-Small-24B-Instruct-2501-LoRA | 24B | 32.000 (aprox.) | Sentimiento PlayDial-Fa | Apache 2.0 (Mistral) | Hugging Face |

No se dispone de resultados de benchmarks de los adaptadores alternativos en la informacion proporcionada, por lo que no es posible comparar su rendimiento numerico con el de este modelo. La comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- El adaptador esta entrenado exclusivamente para clasificacion de sentimiento en persa sobre dialogos teatrales; su uso fuera de ese dominio (por ejemplo, resenas de productos o tuits) puede degradar el rendimiento de forma significativa.
- El recall macro es de 0,52, lo que indica que el modelo deja sin detectar aproximadamente la mitad de las instancias positivas de cada clase en el conjunto de test. No es adecuado como unico clasificador en produccion sin revision humana.
- La evaluacion se realiza sobre solo 104 dialogos de test, una muestra pequena que limita la significacion estadistica de las metricas.
- Riesgo de alucinacion: al ser un modelo generativo, puede producir respuestas que no correspondan exactamente a una de las tres etiquetas, lo que cuenta como error en la evaluacion.
- La licencia llama3.2 impone restricciones de uso comercial y requiere aceptar los terminos del modelo base en Hugging Face, ademas de autenticacion con huggingface-cli login para descargarlo.
- El modelo base esta sujeto a la politica de uso aceptable de Llama 3.2, que prohibe ciertos usos (por ejemplo, vigilancia masiva o generacion de contenido danino).
- No se han publicado analisis de sesgos especificos para este adaptador; al entrenarse sobre un corpus teatral, puede reflejar sesgos de genero, clase social o cultural presentes en las obras.
- El modelo no dispone de vision ni audio, y su capacidad multilingue fuera del persa no ha sido evaluada en esta tarea.
- El repositorio no registra descargas ni likes en el momento de la consulta, lo que limita la evidencia de uso en la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kamyar-zeinalipour/TalkFa-Sentiment-Llama-3.2-3B-Instruct-LoRA
- Paper arXiv: https://arxiv.org/abs/2609.01810
- Repositorio GitHub: https://github.com/KamyarZeinalipour/TalkFa
- Dataset TalkFa: https://huggingface.co/datasets/Kamyar-zeinalipour/TalkFa
- Coleccion TalkFa en Hugging Face: https://huggingface.co/collections/Kamyar-zeinalipour/talkfa-arxiv-2026-6af47769e8cfcf8046fcb449
- Modelo base Llama-3.2-3B-Instruct: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Configuracion de entrenamiento: https://github.com/KamyarZeinalipour/TalkFa/blob/main/configs/train_sentiment.json
