# sandeepstele/hw1-hc3-detector

## Resumen

hw1-hc3-detector es un clasificador de texto binario desarrollado por el usuario de HuggingFace sandeepstele como entrega de la asignatura CS546. Se trata de un fine-tuning del encoder `sentence-transformers/all-MiniLM-L6-v2` (22.713.986 parámetros) para distinguir respuestas escritas por humanos de respuestas generadas por ChatGPT dentro del corpus HC3 (Human ChatGPT Comparison Corpus). La etiqueta de salida es simple: 0 = humano, 1 = ChatGPT.

El modelo resuelve una tarea muy acotada: clasificación de secuencias de una sola clase de entrada (el texto de la respuesta), en inglés, sin generación de texto ni capacidades conversacionales. Su interés es principalmente académico y metodológico, ya que la model card reporta una accuracy del 99,08% sobre el split de test de HC3 (4668 respuestas), frente al 84,49% de una línea base que usa embeddings congelados más regresión logística.

Es relevante precisamente por lo que advierte su propia documentación: HC3 es un benchmark histórico construido con texto de ChatGPT de 2022-2023, por lo que el detector no es fiable para texto generado por modelos actuales. La mayoría de sus errores son respuestas humanas clasificadas erróneamente como ChatGPT. El repositorio, de 0,2 GB, tiene 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT, derivado de MiniLM-L6 (modelo base all-MiniLM-L6-v2) con cabeza de clasificacion de secuencias |
| Parametros totales | 22.713.986 (22,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | hasta 512 tokens en el modelo base; el fine-tuning se realizo con max_length 256 |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones en la model card) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de 6 capas heredado de `all-MiniLM-L6-v2`, un modelo de sentence embeddings destilado a partir de BERT. Sobre ese encoder se anade la cabeza de clasificacion de secuencias estandar de HuggingFace (una proyeccion lineal sobre el token [CLS]), y se entrena todo el conjunto con perdida de entropia cruzada. La entrada es unicamente el texto de la respuesta; no se usa la pregunta ni metadatos adicionales.

El entrenamiento se hizo sobre el dataset HC3 en ingles, revision fijada `4d0ff18`, con una respuesta humana y una respuesta de ChatGPT por pregunta, y un split a nivel de pregunta 80/10/10 con semilla 42. Se aplicaron 5 epocas con el optimizador AdamW, learning rate 2e-5, batch size 32 y max length 256. No se documenta RLHF, DPO ni ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.); es un fine-tuning supervisado convencional.

## Capacidades

- Clasificacion binaria de texto: distingue respuestas etiquetadas como humanas (0) de respuestas generadas por ChatGPT (1) segun la definicion de HC3.
- Clasificacion de una unica clase de entrada: el texto de la respuesta, sin contexto de la pregunta.
- Funcionamiento en ingles exclusivamente.
- Inferencia ligera: al derivar de MiniLM-L6, es adecuado para procesamiento de alto volumen en CPU o GPU modesta.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling, function calling ni uso como agente multi-step.
- No dispone de modo de razonamiento explicito (thinking mode), audio ni entrada multimodal.

## Casos de uso

- Filtrado de contenido en plataformas educativas: permite marcar automaticamente respuestas sospechosas de generacion automatica en foros o ejercicios, dado su bajo coste computacional y su salida binaria directa.
- Triaje previo en pipelines de integridad academica: sirve como primera capa de cribado de alto volumen que deriva solo los casos dudosos a revision humana o a clasificadores mas costosos.
- Etiquetado y aumento de datos de investigacion: al ser un detector de referencia sobre HC3, puede usarse para etiquetar conjuntos propios y comparar contra una linea base conocida del 84,49%.
- Moderacion de comunidades y foros en ingles: clasificacion rapida de respuestas para senalar posibles contenidos generados automaticamente, siempre como senal no concluyente.
- Analisis retrospectivo de corpus historicos: util para reproducir experimentos sobre HC3 y estudiar como cambia la detectabilidad del texto generado entre generaciones de modelos.
- Despliegue embebido en entornos sin GPU: sus 22,7 M de parametros permiten ejecutarlo en CPU, contenedores pequenos o dispositivos con recursos limitados.
- Prototipado y docencia: ejemplo completo y reproducible de fine-tuning de un encoder para clasificacion de texto, adecuado como material de clase o plantilla de partida.

## Benchmarks y rendimiento

Datos reportados en la model card, sobre el split de test de HC3 (4668 respuestas):

| Modelo | Accuracy en test |
|---|---|
| Baseline: embeddings congelados de all-MiniLM-L6-v2 + regresion logistica | 84,49% |
| Fine-tuned (este modelo) | 99,08% |

No se aportan otras metricas (F1, precision, recall, matriz de confusion) ni resultados en MMLU, HumanEval, GSM8K u otros benchmarks, que ademas no aplican a una tarea de clasificacion binaria.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 91 MB solo para los pesos (22,7 M de parametros), mas memoria para activaciones y framework; cabe holgadamente en cualquier GPU consumer.
- En fp16 el peso seria de aproximadamente 45 MB; no se documentan cuantizaciones oficiales.
- Inferencia viable en CPU sin GPU dedicada, dado el tamano y la arquitectura tipo MiniLM.
- Compatible con GPU consumer de gama baja y media (por ejemplo, GTX 1650, RTX 3060, RTX 4090); no requiere GPU de datacenter (A100, H100).
- Opciones de despliegue: libreria `transformers` de HuggingFace, exportacion a ONNX, y servidores de inferencia que soporten modelos de clasificacion; no se documenta integracion especifica con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Existen otros repositorios de la misma asignatura y tarea, con el mismo encoder base y las mismas etiquetas. No se dispone de sus recuentos de parametros ni de sus metricas detalladas.

| Modelo | Tarea | Encoder base | Etiquetas | Licencia | Metricas publicadas |
|---|---|---|---|---|---|
| sandeepstele/hw1-hc3-detector | Clasificacion humano vs ChatGPT | all-MiniLM-L6-v2 | 0 = human, 1 = ChatGPT | MIT | 99,08% accuracy en test HC3 |
| Aishkrish/hw1-hc3-detector | Clasificacion humano vs ChatGPT | no disponible | no disponible | no disponible | no disponible |
| jainatharva21/hw1-hc3-detector | Clasificacion humano vs ChatGPT | all-MiniLM-L6-v2 | 0 = human, 1 = ChatGPT | no disponible | no disponible |

No se dispone de informacion sobre detectores alternativos de mayor tamano (por ejemplo, basados en RoBERTa o DeBERTa) dentro de la informacion proporcionada, por lo que la comparativa se limita a los repositorios equivalentes encontrados.

## Limitaciones y advertencias

- El propio autor advierte de que HC3 es un benchmark historico basado en ChatGPT de una generacion temprana; el modelo no es un detector fiable de texto generado por IA actual.
- La mayoria de los errores son respuestas humanas clasificadas como ChatGPT (falsos positivos), lo que puede penalizar injustamente a usuarios reales si se usa con fines disciplinarios.
- Riesgo de sobreajuste al dominio de HC3: el texto de entrenamiento proviene de un unico corpus y de un estilo concreto, por lo que la generalizacion a otros dominios es incierta.
- Solo funciona en ingles; no cubre otros idiomas.
- Requiere unicamente el texto de la respuesta, sin la pregunta, lo que puede limitar la precision en casos ambiguos.
- El rendimiento reportado del 99,08% se ha medido en el mismo split de HC3 y no esta verificado de forma independiente; no debe extrapolarse a datos reales.
- La licencia MIT permite uso comercial sin restricciones mas alla de la atribucion, pero esa permisividad no implica que el modelo sea apto para produccion dado su sesgo temporal.
- Uso etico: emplearlo como prueba unica para acusar a alguien de generar texto con IA no es defendible con este modelo; solo deberia utilizarse como senal auxiliar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sandeepstele/hw1-hc3-detector
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Dataset HC3: https://huggingface.co/datasets/Hello-SimpleAI/HC3
- Organizacion Hello-SimpleAI (HC3 y detectores): https://github.com/Hello-SimpleAI
- Perfil de GitHub del autor: https://github.com/sandeepstele
- Repositorio equivalente (Aishkrish): https://huggingface.co/Aishkrish/hw1-hc3-detector
- Repositorio equivalente (jainatharva21): https://huggingface.co/jainatharva21/hw1-hc3-detector
- Ficha de referencia del modelo (Yihangsun): https://savrn.com/models/hw1-hc3-detector
