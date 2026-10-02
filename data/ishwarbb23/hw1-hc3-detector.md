# ishwarbb23/hw1-hc3-detector

## Resumen

El modelo `ishwarbb23/hw1-hc3-detector` es un clasificador de texto binario que distingue respuestas escritas por personas de respuestas generadas por ChatGPT. Se trata de un ajuste fino (*fine-tuning*) de `sentence-transformers/all-MiniLM-L6-v2`, un transformer de tipo BERT con 6 capas y 22.713.986 parametros, realizado sobre el corpus en ingles HC3 (*Human ChatGPT Comparison Corpus*) de Hello-SimpleAI. La etiqueta 0 corresponde a texto humano y la etiqueta 1 a texto generado por ChatGPT.

El modelo resuelve una tarea concreta y acotada: la deteccion de texto generado por IA en respuestas a preguntas, dentro del dominio y el estilo del dataset HC3. Su relevancia actual es limitada y de caracter experimental: el propio autor lo describe como un "experimento de referencia historico", no validado frente a generadores posteriores a ChatGPT ni frente a trabajos de estudiantes reales. No debe emplearse como evidencia unica de autoria o de mala conducta academica.

Con 22,7 millones de parametros y un repositorio de 0,1 GB, es un modelo muy ligero que puede ejecutarse en CPU y en cualquier GPU de consumo. En la particion de test del dataset alcanza una precision (accuracy) de 0,991859, frente a 0,844901 de una linea base de regresion logistica sobre embeddings congelados del mismo modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (MiniLM-L6, 6 capas), fine-tuning para clasificacion de secuencias |
| Parametros totales | 22.713.986 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens (longitud maxima de secuencia usada en el entrenamiento); el limite arquitectonico de la base no se detalla en la informacion disponible |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos en safetensors en precision original) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es `sentence-transformers/all-MiniLM-L6-v2`, un transformer encoder de tipo BERT con 6 capas, 384 dimensiones ocultas y 22,7 millones de parametros, originalmente concebido para generar embeddings de frases. Sobre esa base se anade una cabeza de clasificacion de secuencias con dos clases y se ajusta de extremo a extremo para la tarea de deteccion humano/ChatGPT, lo que descarta el uso del modelo como extractor de embeddings congelado (ese es precisamente el enfoque de la linea base comparada).

El entrenamiento se realizo sobre el dataset HC3 en su version inglesa, revision `4d0ff18143b5a7e1b1e79beb540c04549d1e59d3`, utilizando unicamente el texto de las respuestas. Los splits son disjuntos por pregunta (*question-disjoint*), balanceados en proporcion 80/10/10 y con semilla 42. La configuracion de entrenamiento fue: optimizador AdamW, tasa de aprendizaje 2e-05, 5 epocas, tamano de lote 32 y longitud maxima de secuencia 256. No se documenta en la informacion disponible el uso de RLHF, DPO u otras tecnicas de alineamiento, ni innovaciones como decodificacion especulativa o atencion lineal (no aplicables a un clasificador).

## Capacidades

- Clasificacion binaria de texto en ingles: devuelve la etiqueta 0 (humano) o 1 (ChatGPT) para una respuesta dada.
- Deteccion de texto generado por IA limitada al dominio, el estilo y el generador representados en HC3 (respuestas a preguntas generadas por ChatGPT).
- Puntuacion de confianza por clase a traves de la cabeza de clasificacion (probabilidades softmax), util para umbralizar decisiones.
- Ejecucion sobre fragmentos de hasta 256 tokens; el texto mas largo debe truncarse o segmentarse.
- Integracion con la libreria `transformers` mediante la pipeline `text-classification`.
- Compatibilidad declarada con `text-embeddings-inference` y con endpoints compatibles (etiqueta `endpoints_compatible`).
- No soporta *tool calling*, ni razonamiento multi-paso, ni uso como agente: es un clasificador, no un modelo generativo.
- No dispone de capacidades multimodales (vision, audio) ni de modo de razonamiento explicito.
- Multilingue: no. Solo ingles.

## Casos de uso

- Filtrado de contenido generado por IA en foros o plataformas de preguntas y respuestas: el modelo puede etiquetar respuestas como humanas o generadas, con la advertencia de que su validacion se limita al estilo de HC3.
- Triaje en revision academica: uso como senal auxiliar dentro de un flujo humano-en-el-bucle para priorizar respuestas sospechosas, nunca como prueba de autoria por si solo.
- Investigacion sobre deteccion de texto generado: sirve como punto de comparacion reproducible (semilla 42, splits disjuntos por pregunta) frente a otros metodos sobre HC3.
- Construccion de datasets: etiquetado automatico a gran escala de corpus de respuestas, dado su bajo coste de inferencia (22,7 M de parametros, cabe en CPU).
- Experimentos de destilacion y *baselines* ligeros: su tamano reducido lo hace util como referencia de baja latencia frente a detectores basados en modelos mucho mayores.
- Auditoria de estilo en respuestas generadas por modelos: medir la deriva del detector cuando cambia el generador subyacente, dado que el autor advierte explicitamente sobre la sensibilidad al generador.
- Moderacion de contenido asistida: precribado de textos antes de una revision manual, siempre combinado con heuristicas adicionales.

## Benchmarks y rendimiento

Los unicos resultados publicados son los de la model card, medidos sobre la particion de test de HC3 (4.668 ejemplos, segun las matrices de confusion reportadas).

| Metrica | Linea base (SentenceTransformer congelado + regresion logistica) | Modelo ajustado |
|---|---|---|
| Accuracy en test | 0,844901 | 0,991859 |
| Matriz de confusion (filas = real, columnas = predicho) | [[1946, 388], [336, 1998]] | [[2297, 37], [1, 2333]] |
| Verdaderos negativos (humano) | 1946 | 2297 |
| Falsos positivos (humano predicho como ChatGPT) | 388 | 37 |
| Falsos negativos (ChatGPT predicho como humano) | 336 | 1 |
| Verdaderos positivos (ChatGPT) | 1998 | 2333 |

Metricas derivadas de las matrices de confusion anteriores (no publicadas de forma explicita por el autor, calculadas a partir de los recuentos reportados):

| Metrica | Linea base | Modelo ajustado |
|---|---|---|
| Precision (clase ChatGPT) | 0,8374 | 0,9844 |
| Recall (clase ChatGPT) | 0,8560 | 0,9996 |
| F1 (clase ChatGPT) | 0,8466 | 0,9919 |

No se han publicado resultados de benchmarks en la informacion disponible para otras tareas (MMLU, HumanEval, GSM8K, etc.), lo cual es esperable dado que se trata de un clasificador y no de un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,09 GB en FP32 (22,7 M de parametros), unos 0,05 GB en FP16/BF16 y unos 0,02 GB en INT8. Cifras teoricas calculadas a partir del numero de parametros.
- GPU recomendadas: cualquier GPU moderna es suficiente, incluidas NVIDIA GTX 1650, RTX 3050, RTX 4090, A100 o H100; el modelo esta muy por debajo de la capacidad de todas ellas.
- Cabe en cualquier GPU de consumo, y tambien se ejecuta en CPU con latencias perfectamente utilizables para clasificacion por lotes o en linea.
- Opciones de despliegue: pipeline `text-classification` de `transformers`; se declara compatibilidad con `text-embeddings-inference` y con endpoints compatibles. No se publican pesos en GGUF, por lo que el uso directo con llama.cpp u Ollama requeriria una conversion previa no documentada en la informacion disponible. Tampoco se documenta una ruta ONNX.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. La longitud maxima de 256 tokens y el tamano del modelo sugieren un coste por inferencia muy bajo, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy en test (HC3) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ishwarbb23/hw1-hc3-detector | 22,7 M (MiniLM-L6) | 256 tokens | 0,991859 | no disponible | HuggingFace, repo de 0,1 GB |
| Linea base del mismo autor (SentenceTransformer congelado + regresion logistica) | 22,7 M | 256 tokens | 0,844901 | no disponible | descrita en la model card, sin pesos publicados |
| Aishkrish/hw1-hc3-detector | no disponible | no disponible | no disponible | no disponible | HuggingFace (aparicion en busqueda web) |
| skyyyyks/hw1-hc3-detector | no disponible | no disponible | no disponible | no disponible | HuggingFace (aparicion en busqueda web) |
| Detector HC3 de Hello-SimpleAI (repo de detectores del autor del corpus) | no disponible | no disponible | no disponible | no disponible | GitHub (Hello-SimpleAI) |

No se dispone de datos verificados de parametros, contexto o rendimiento de las alternativas listadas mas alla de su existencia; se indica "no disponible" en lugar de estimar valores. Los repositorios con el mismo nombre parecen corresponder a variantes del mismo ejercicio y no se han podido caracterizar con la informacion recogida.

## Limitaciones y advertencias

- El propio autor califica el modelo como un "experimento de referencia historico": no ha sido validado con generadores posteriores a ChatGPT ni con trabajos de estudiantes actuales.
- No debe utilizarse como evidencia unica de autoria ni de mala conducta academica o profesional.
- El rendimiento depende fuertemente del dominio, el estilo de respuesta y el generador empleado para construir HC3; se desconoce su comportamiento fuera de ese dominio.
- Sesgos conocidos: no se documentan evaluaciones de sesgo en la informacion disponible.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos silenciosos. En la particion de test solo se registra 1 falso negativo y 37 falsos positivos, un reparto muy desequilibrado que indica una tendencia a clasificar como ChatGPT ante la duda.
- El limite de 256 tokens obliga a truncar o segmentar textos largos, lo que puede degradar la clasificacion.
- Cobertura idiomatica restringida al ingles; no se ha evaluado su comportamiento en castellano ni en otros idiomas.
- Licencia no declarada en la informacion disponible: la ausencia de licencia explicita impide asumir permisos de uso comercial y debe aclararse con el autor antes de cualquier despliegue en produccion.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no existe validacion independiente ni uso comunitario documentado.
- Fechas de creacion y actualizacion registradas como 2026-10-02, con apenas tres segundos de diferencia entre ambas, lo que sugiere una subida automatizada sin mantenimiento posterior.
- No se documenta versionado, ficha de evaluacion de sesgos, ni procedimiento de reproducibilidad mas alla de la semilla y los splits descritos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ishwarbb23/hw1-hc3-detector
- Paper de referencia del dataset HC3 (Guo et al., 2023): https://arxiv.org/abs/2301.07597
- Organizacion Hello-SimpleAI, autora del corpus HC3 y de detectores asociados: https://github.com/Hello-SimpleAI
- Dataset en HuggingFace: https://huggingface.co/datasets/Hello-SimpleAI/HC3
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Variante con el mismo nombre (sin datos verificados): https://huggingface.co/Aishkrish/hw1-hc3-detector
- Variante con el mismo nombre (sin datos verificados): https://huggingface.co/skyyyyks/hw1-hc3-detector
- Registro de terceros (sin datos verificados): https://savrn.com/models/hw1-hc3-detector
- Registro de terceros (sin datos verificados): https://free2aitools.com/model/skyyyyks/hw1-hc3-detector
