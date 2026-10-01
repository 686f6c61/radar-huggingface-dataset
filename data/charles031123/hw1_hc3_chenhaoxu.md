# Charles031123/HW1_HC3_ChenhaoXu

## Resumen

HW1_HC3_ChenhaoXu es un clasificador binario de texto que distingue respuestas escritas por humanos de respuestas generadas por ChatGPT. Lo publica el usuario Charles031123 en HuggingFace, sin descargas ni likes registrados, como entrega de la tarea HW1 de la asignatura DHT 546. El modelo se ha obtenido mediante fine-tuning del encoder `sentence-transformers/all-MiniLM-L6-v2` sobre las respuestas en ingles del corpus HC3 (Hello-SimpleAI/HC3), con una particion fija 80/10/10 disjunta por pregunta y semilla 42.

Tecnicamente es un transformer encoder tipo BERT de 6 capas con 22.713.986 parametros totales y un repositorio de 0,1 GB con pesos en formato safetensors. No es un modelo generativo ni un modelo de proposito general: su unica salida es una etiqueta de clasificacion (0 = humano, 1 = ChatGPT), por lo que su interes practico es acotado y estrictamente experimental.

Su relevancia actual es limitada pero ilustrativa: sirve como referencia metodologica de deteccion de texto generado (benchmark interno de 0,9925 de accuracy en test) y como ejemplo del riesgo de sobreajuste a artefactos de un corpus historico, tal y como advierte el propio autor. No debe emplearse como detector fiable de escritura estudiantil contemporanea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MiniLM de 6 capas), fine-tuning para clasificacion de secuencias |
| Parametros totales | 22.713.986 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el modelo base all-MiniLM-L6-v2 opera con una longitud maxima de secuencia de 256 tokens |
| Tipos de cuantizacion | no disponible; pesos safetensors publicados en precision completa, sin variantes GGUF/AWQ/GPTQ declaradas |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Etiquetas | 0 = humano, 1 = ChatGPT |
| Dataset de entrenamiento | Hello-SimpleAI/HC3 (respuestas en ingles) |
| Modelo base | sentence-transformers/all-MiniLM-L6-v2 |
| Tamano del repositorio | 0,1 GB |
| Fecha de creacion | 2026-10-01 |
| Ultima actualizacion | 2026-10-01 |

## Arquitectura y entrenamiento

El modelo parte de `sentence-transformers/all-MiniLM-L6-v2`, un encoder MiniLM de 6 capas y 22,7 M de parametros derivado de la familia BERT, con cabecera de sentence-embeddings. Sobre esa base se ha anadido una cabeza de clasificacion y se ha realizado fine-tuning supervisado sobre el subconjunto en ingles del corpus HC3, que empareja respuestas humanas y respuestas de ChatGPT a un mismo conjunto de preguntas. La particion empleada es la del enunciado de la tarea: 80 % entrenamiento, 10 % validacion y 10 % test, disjunta por pregunta y con semilla fija 42. El mejor checkpoint se selecciono por accuracy de validacion en la epoca 3 de un total de 5.

No se documenta el numero exacto de tokens de entrenamiento, la composicion detallada del dataset, ni el uso de tecnicas de alineacion como RLHF, DPO o decodificacion especulativa (no aplicables, por otra parte, a un clasificador encoder). La innovacion tecnica del trabajo es exclusivamente comparativa: se contrasta el fine-tuning completo del encoder frente a un clasificador de regresion logistica entrenado sobre embeddings congelados del mismo modelo base, obteniendo 0,9925 frente a 0,8449 de accuracy en test. Esa diferencia de mas de 14 puntos es el principal hallazgo metodologico declarado.

## Capacidades

- Clasificacion binaria de texto en ingles: distingue respuestas humanas (etiqueta 0) de respuestas generadas por ChatGPT (etiqueta 1).
- Inferencia sobre fragmentos o respuestas completas con el tokenizador y la ventana del modelo base MiniLM.
- Extraccion de logits/probabilidades por clase, lo que permite umbralizar la decision en lugar de usar unicamente el argmax.
- Integracion directa en pipelines de `transformers` para `text-classification` y en servicios de text-embeddings-inference.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No soporta tool calling, function calling ni flujos de agentes.
- Capacidades multilingues: limitadas al ingles; no se ha entrenado ni validado en otros idiomas.
- No dispone de modo thinking, ni de salidas estructuradas mas alla de la etiqueta de clasificacion.

## Casos de uso

- Auditoria interna de datasets: detectar que proporcion de un corpus historico de respuestas (por ejemplo, foros de preguntas y respuestas) es de origen humano frente a generado por ChatGPT, con objeto de limpiar el conjunto antes de reutilizarlo.
- Reproduccion academica del experimento: servir como linea base de fine-tuning completo frente a clasificadores sobre embeddings congelados en asignaturas de procesamiento de lenguaje natural.
- Prototipado rapido de un detector de texto generado: al pesar menos de 100 MB y ejecutarse en CPU, permite montar un servicio de clasificacion con latencias de milisegundos sin infraestructura GPU.
- Filtrado previo en anotacion de corpus: preetiquetar respuestas como humanas o sinteticas para que los anotadores humanos revisen solo los casos ambiguos o de baja confianza.
- Analisis diacronico con reservas: estudiar la evolucion de la huella estilistica de ChatGPT en el periodo cubierto por HC3, siempre que se asuma que el modelo no generaliza a modelos posteriores.
- Docencia y formacion: ejemplo de buenas y malas practicas en evaluacion de clasificadores, especialmente en lo relativo a particiones disjuntas por pregunta y a la seleccion de checkpoints por validacion.
- Investigacion sobre atajos (shortcut learning): analisis de que senales superficiales (longitud, puntuacion, formulas de cortesia) esta explotando el clasificador para alcanzar 0,9925 de accuracy.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card, sobre el split de test reservado del corpus HC3:

| Metodo | Accuracy en test |
|---|---:|
| Embeddings MiniLM congelados + regresion logistica | 0,8449 |
| MiniLM con fine-tuning (este modelo) | 0,9925 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, GLUE u otros) en la informacion disponible, ni metricas complementarias como precision, recall, F1, AUC o matrices de confusion por clase.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 91 MB en FP32, 45 MB en FP16/BF16 y 23 MB en INT8, calculado a partir de 22,7 M de parametros.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria es suficiente; no se requiere A100, H100 ni segmento profesional. Una RTX 4090, una RTX 3060 o incluso una GTX 1650 sobran para el despliegue.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, y tambien en CPU sin aceleracion.
- Opciones de despliegue: pipeline `text-classification` de HuggingFace Transformers, HuggingFace Text Embeddings Inference, exportacion a ONNX Runtime, TorchScript y despliegue serverless. Dado su tamano, no precisa vLLM ni TGI, orientados a modelos generativos de mayor escala.
- Latencia y throughput estimados: no se han publicado mediciones. Por su tamano, la inferencia se situa en el orden de milisegundos por lote en CPU y por debajo del milisegundo en GPU, con throughput muy alto en batching, aunque estas cifras son orientativas y dependen del hardware y de la longitud de las secuencias.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy en HC3 (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Charles031123/HW1_HC3_ChenhaoXu | 22.713.986 | no disponible (base: 256 tokens) | 0,9925 | apache-2.0 | HuggingFace, 0 descargas |
| AustinFu/hw1-hc3-detector | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| TianhangCheng7/hw1-hc3-detector | no disponible | no disponible | no disponible | apache-2.0 | HuggingFace |
| Yihangsun/hw1-hc3-detector | no disponible | no disponible | no disponible | no disponible | HuggingFace y agregadores de terceros |
| sentence-transformers/all-MiniLM-L6-v2 (base) | 22.713.986 | 256 tokens | no aplica (no entrenado para esta tarea) | apache-2.0 | HuggingFace, ampliamente desplegado |

Los tres modelos comparables son entregas de la misma tarea y, por los nombres y etiquetas, apuntan al mismo corpus HC3 y a arquitecturas basadas en BERT o sentence-transformers. No se dispone de sus parametros, contexto ni metricas publicadas en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor advierte de que el modelo "no es un detector fiable de escritura estudiantil actual": los resultados describen un split historico de HC3 y no generalizan a producciones contemporaneas.
- Riesgo elevado de sobreajuste a artefactos del corpus: una accuracy de 0,9925 sugiere que el clasificador puede estar explotando senales superficiales (longitud, formato, formulas de apertura y cierre) en lugar de propiedades estilisticas robustas.
- Sesgo de dominio y de epoca: HC3 en ingles cubre preguntas y respuestas de un periodo concreto; el modelo no ha visto otros idiomas, registros ni modelos generativos posteriores a ChatGPT de esa generacion.
- Falsos positivos sobre escritura humana formal o asistida por correctores: cualquier texto pulido y uniforme puede clasificarse como generado, con el consiguiente riesgo en contextos academicos o disciplinarios.
- Riesgo de alucinacion no aplicable en sentido generativo, pero si de calibracion: las probabilidades de salida no estan calibradas y no deben interpretarse como evidencia forense.
- Uso comercial: la licencia apache-2.0 permite uso comercial, pero el modelo se publica como entrega academica sin garantias, sin documentacion de sesgos y con cero descargas, por lo que no ha sido validado por terceros.
- No se documentan medidas de privacidad, procedencia de datos mas alla de HC3, ni proceso de revision etica.
- Contexto limitado por el modelo base (256 tokens en all-MiniLM-L6-v2): respuestas mas largas se truncan, lo que puede degradar la clasificacion.
- No debe utilizarse como herramienta de acusacion de plagio o de uso indebido de IA sin revision humana y sin una validacion especifica sobre el dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Charles031123/HW1_HC3_ChenhaoXu
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Dataset HC3: https://huggingface.co/datasets/Hello-SimpleAI/HC3
- Paper del corpus HC3: https://arxiv.org/abs/2301.07597
- Modelo comparable AustinFu/hw1-hc3-detector: https://huggingface.co/AustinFu/hw1-hc3-detector
- Modelo comparable TianhangCheng7/hw1-hc3-detector: https://huggingface.co/TianhangCheng7/hw1-hc3-detector
- Modelo comparable Yihangsun/hw1-hc3-detector: https://savrn.com/models/hw1-hc3-detector
- Perfil de GitHub del autor: https://github.com/xuchenhao001
