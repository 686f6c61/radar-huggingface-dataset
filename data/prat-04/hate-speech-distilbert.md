# Prat-04/hate-speech-distilbert

## Resumen

El modelo `Prat-04/hate-speech-distilbert` es un clasificador de texto en ingles obtenido mediante fine-tuning de DistilBERT sobre el dataset de discurso de odio y lenguaje ofensivo de Davidson et al. (2017), compuesto por 24.783 tuits. Resuelve una tarea de clasificacion de tres clases: discurso de odio (etiqueta 0), lenguaje ofensivo (etiqueta 1) y ninguna de las dos (etiqueta 2). El problema que aborda es el triaje automatico de contenido toxico en plataformas y corpus de investigacion, un caso de uso donde el coste computacional por inferencia importa tanto como la precision.

La relevancia del modelo no esta en su arquitectura, que es la de DistilBERT (transformer encoder de 6 capas y 66.955.779 parametros), sino en la documentacion que lo acompana: el autor lo presenta como el mejor de una escala de seis modelos (TF-IDF+LogReg/SVM, BiLSTM, CNN-BiLSTM, BiLSTM con atencion y DistilBERT) y publica una auditoria de sesgo dialectal especifica contra el fallo documentado por Sap et al. (2019), consistente en sobrerrepresentar el ingles afroamericano vernaculo (AAVE) como ofensivo.

Es un modelo pequeno (0,3 GB de repositorio, pesos safetensors) pensado para moderacion asistida y demostracion de investigacion, no como base unica de decisiones automaticas de moderacion. Su licencia MIT permite uso comercial, pero la propia model card desaconseja explicitamente utilizarlo como criterio exclusivo o automatico contra personas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base) con cabeza de clasificacion de secuencias |
| Parametros totales | 66.955.779 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; la arquitectura DistilBERT admite como maximo 512 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Etiquetas de salida | 0: Hate Speech, 1: Offensive Language, 2: Neither |
| Dataset de entrenamiento | tdavidson/hate_speech_offensive (Davidson et al., 2017; 24.783 tuits) |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La base es DistilBERT, una version comprimida de BERT-base obtenida por destilacion de conocimiento que conserva 6 capas de encoder, reduce el numero de parametros en torno al 40 % respecto al original y mantiene un rendimiento cercano en tareas de clasificacion. Sobre ese backbone se anade una cabeza de clasificacion con tres salidas, y el modelo completo se ajusta de forma supervisada sobre el dataset de Davidson et al. (2017), formado por 24.783 tuits etiquetados en las tres clases descritas. No consta en la informacion disponible que se haya aplicado RLHF, DPO ni ninguna fase de alineacion adicional; es un fine-tuning supervisado convencional.

La innovacion metodologica documentada por el autor no esta en la arquitectura sino en la evaluacion. La model card reporta que el modelo fue seleccionado como el mejor de una escala de seis alternativas que incluye TF-IDF con regresion logistica y SVM, BiLSTM, CNN-BiLSTM y BiLSTM con atencion. Ademas, se incluye una auditoria de sesgo dialectal inspirada en Sap et al. (2019): sobre 20 pares de frases construidas a mano con significado benigno equivalente en AAVE y en ingles estandar, el modelo muestra una diferencia de tasa de falsos positivos entre dialectos del 0 %, frente a una diferencia de 20 puntos porcentuales en una linea base TF-IDF+LogReg evaluada con el mismo protocolo. El analisis cualitativo de errores, apoyado en explicaciones LIME, se describe en el repositorio fuente citado por el autor, que no se enlaza en la informacion proporcionada.

## Capacidades

- Clasificacion de texto en tres clases (discurso de odio, lenguaje ofensivo, ninguno) para textos cortos en ingles.
- Puntuacion probabilistica por clase, lo que permite establecer umbrales de decision ajustables en lugar de una etiqueta binaria rigida.
- Inferencia de muy bajo coste: 66,9 millones de parametros y pesos de 0,3 GB en total.
- Evaluacion de sesgo dialectal documentada mediante un protocolo reproducible de pares AAVE / ingles estandar.
- Analisis de errores con explicaciones LIME recogido en el repositorio del autor.
- No soporta generacion de texto, tool calling ni function calling.
- No soporta razonamiento multi-paso ni flujos de agente.
- No es multilingue: solo ingles.
- No dispone de modo "thinking", vision, audio ni ninguna otra modalidad.

## Casos de uso

- Triaje de moderacion en foros y redes sociales: el modelo clasifica cada mensaje en las tres categorias y permite enrutar solo los casos dudosos a revision humana, reduciendo el volumen de contenido que llega a los moderadores con un coste de inferencia minimo.
- Pre-filtrado de alto volumen en pipelines de contenido generado por usuarios: al ser un modelo de 66,9 M de parametros, puede ejecutarse sobre lotes grandes de comentarios en hardware modesto antes de aplicar modelos mas caros y precisos.
- Etiquetado de corpus de investigacion en ciencias sociales: sirve para anotar automaticamente colecciones historicas de tuits con las tres etiquetas de Davidson et al. (2017) y estudiar la evolucion del lenguaje ofensivo.
- Linea base reproducible en experimentos de NLP: el autor documenta la comparacion con cinco alternativas (TF-IDF+LogReg/SVM, BiLSTM, CNN-BiLSTM, BiLSTM con atencion), lo que lo convierte en un punto de partida util para nuevas propuestas sobre el mismo dataset.
- Auditoria de sesgo dialectal de otros clasificadores: el protocolo de 20 pares AAVE / ingles estandar con significado benigno equivalente puede reutilizarse como plantilla para medir la brecha de falsos positivos entre dialectos en modelos de terceros.
- Priorizacion de colas de revision: combinando la salida probabilistica con umbrales por clase, es posible ordenar la cola de moderacion de modo que los casos con mayor probabilidad de "Hate Speech" se revisen primero.
- Monitorizacion de comunidades en tiempo real: su tamano permite desplegarlo junto a un servidor de aplicacion sin necesidad de GPU dedicada, evaluando el flujo entrante de comentarios en continuo.
- Material docente y de portfolio: ilustra un flujo completo de fine-tuning, seleccion de modelo entre varias alternativas, analisis de errores con LIME y auditoria de sesgo, con la metodologia publicada.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de test reservado (n = 3718):

| Metrica | Valor |
|---|---|
| Macro-F1 | 0,7663 |
| Accuracy | 0,8994 |

Auditoria de sesgo dialectal reportada:

| Prueba | Resultado |
|---|---|
| Brecha de tasa de falsos positivos entre AAVE e ingles estandar (20 pares de frases) | 0 % (este modelo) |
| Brecha de tasa de falsos positivos en la misma prueba (linea base TF-IDF+LogReg) | 20 puntos porcentuales |

No se han publicado en la informacion disponible resultados comparativos desglosados por clase, matrices de confusion ni comparaciones numericas con otros modelos sobre el mismo test.

## Requisitos de hardware

- VRAM estimada para inferencia segun los 66.955.779 parametros: aproximadamente 268 MB en fp32, 134 MB en fp16 y 67 MB en int8, sin contar activaciones ni el lote de entrada.
- Cabe sin dificultad en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y anteriores de gama media en adelante, con margen amplio.
- Tambien es viable en CPU para lotes moderados, dado el reducido numero de parametros y la ausencia de decodificacion autorregresiva.
- GPU de centro de datos como A100, H100 o L4 no son necesarias para este modelo; solo tendrian sentido para servir lotes muy grandes en paralelo.
- Opciones de despliegue: pipeline `text-classification` de Transformers, exportacion a ONNX Runtime para inferencia acelerada, TorchScript, servidores de inferencia tipo Triton o TorchServe, y contenedores propios con FastAPI. No es un modelo generativo, por lo que vLLM, llama.cpp, Ollama y TGI no son las herramientas habituales para servirlo.
- Latencia y throughput medidos: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Los datos de las alternativas no aparecen en la informacion proporcionada; los valores de arquitectura y parametros que se indican son aproximaciones de conocimiento publico sobre las arquitecturas base, no resultados medidos en la misma prueba.

| Modelo | Arquitectura | Parametros aprox. | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Prat-04/hate-speech-distilbert | DistilBERT fine-tuned | 66,9 M | No disponible (maximo 512 en DistilBERT) | MIT | Macro-F1 0,7663 y accuracy 0,8994 sobre test de 3718 ejemplos; auditoria de sesgo AAVE publicada |
| DistilBERT base (distilbert-base-uncased) | DistilBERT | ~66 M | 512 tokens | Apache 2.0 | Modelo general sin fine-tuning para odio; requiere ajuste para esta tarea |
| RoBERTa-base y derivados ajustados para odio | RoBERTa (encoder) | ~125 M | 512 tokens | Variable segun checkpoint | Alternativa habitual en deteccion de toxicidad; mas coste de inferencia |
| DeHateBERT / BERT-base multilingue ajustado | BERT (encoder) | ~178 M | 512 tokens | Variable segun checkpoint | Cubre varios idiomas frente al ingles unico de este modelo |

No se dispone de cifras comparativas de benchmark entre estos modelos y el presente, por lo que no se pueden establecer comparaciones de rendimiento cuantitativas con los datos disponibles.

## Limitaciones y advertencias

- Las decisiones del modelo estan dominadas por la presencia de terminos insultantes concretos que actuan como disparadores lexicos casi decisivos, por encima de la comprension contextual de la intencion o del objetivo del mensaje.
- Los insultos personales que contienen terminos insultantes pueden escalarse a "Hate Speech" aunque los anotadores del dataset los etiquetaran como "Offensive Language".
- El lenguaje ofensivo codificado o indirecto, sin vocabulario insultante explicito, puede no detectarse en absoluto.
- Solo cubre ingles; cualquier contenido en otra lengua queda fuera de su ambito y no debe interpretarse su salida como valida.
- Entrenado sobre tuits de 2017: el desplazamiento de dominio respecto al lenguaje actual en redes sociales, y respecto a otros generos textuales, es un riesgo real de degradacion.
- El dataset de origen procede de anotacion con anotadores humanos y presenta ruido de etiquetado conocido en la literatura sobre la familia de datos de Davidson et al. (2017).
- Riesgo de alucinacion en el sentido clasico no aplica, pero si el riesgo de falsos positivos y falsos negativos probabilisticos; la model card advierte que las predicciones pueden ser erroneas.
- La licencia MIT permite uso comercial, pero el autor declara explicitamente que el modelo no esta pensado como base unica ni automatica para decisiones de moderacion contra personas reales.
- Aunque la auditoria reporta una brecha del 0 % en la prueba de 20 pares AAVE / ingles estandar, el tamano de esa prueba es muy reducido y no permite descartar sesgos dialectales en otros contextos.
- Uso previsto declarado: asistencia a la moderacion de contenido, investigacion y demostracion de portfolio. Cualquier otro uso requiere revisar la metodologia y el descargo de responsabilidad del repositorio fuente.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, y no consta validacion externa independiente de los resultados reportados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Prat-04/hate-speech-distilbert
- Dataset de entrenamiento: https://huggingface.co/datasets/tdavidson/hate_speech_offensive
- Repositorio fuente con metodologia, comparativa de los seis modelos y auditoria de sesgo: citado por el autor en la model card, sin URL incluida en la informacion proporcionada (no disponible)
- Referencia del dataset: Davidson, T., Warmsley, D., Macy, M. y Weber, I. (2017), "Automated Hate Speech Detection and the Problem of Offensive Language" (referencia bibliografica, sin enlace en la informacion proporcionada)
- Referencia de sesgo dialectal: Sap, M. et al. (2019), "The Risk of Racial Bias in Hate Speech Detection" (referencia bibliografica, sin enlace en la informacion proporcionada)
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante al modelo; los resultados devueltos corresponden a la comuna francesa de Prat (Cotes-d'Armor) y no guardan relacion con este modelo.
