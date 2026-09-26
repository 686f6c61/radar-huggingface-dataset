# jmwri/decide

## Resumen

decide-0.1.0 es un modelo de decisión no autorregresivo desarrollado por jmwri. A diferencia de un modelo generativo, no produce texto: dado un estado (premisa), una instrucción y un conjunto de opciones candidatas, puntúa cada opción en una única pasada hacia delante y devuelve probabilidades calibradas. Responde a tres tipos de pregunta con los mismos pesos: "choice" (distribución sobre K opciones mutuamente excluyentes), "noul" (probabilidad de que se cumpla una condición, pregunta sí/no) y "score" (nivel esperado en una escala ordenada).

El modelo es un fine-tuning de answerdotai/ModernBERT-base, un encoder de 149 millones de parámetros (149.312.257 pesos reales en safetensors), con una cabeza MLP que puntúa el estado del encoder en cada token `[MASK]`. Su rasgo técnico más destacable es la invariancia a la permutación de opciones: cada opción atiende solo al prefijo compartido y a sí misma, con reinicio de positional ids tras el prefijo, de modo que el score de una opción depende exclusivamente de (premisa, esa opción). La variación máxima de logits medida bajo permutación es de 1,4e-06.

Es relevante ahora porque cubre una necesidad concreta de los pipelines de agentes y de clasificación: tomar decisiones discretas calibradas (enrutado, clasificación de causa raíz, verificación) de forma barata y determinista, sin depender de un modelo generativo. Todo el toolchain (modelo, tokenizador, bucle de entrenamiento, evaluación) se construyó en Go puro dentro del repositorio jmwri/decide, sin usar Python ni PyTorch para el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (ModernBERT-base) con cabeza MLP de puntuación por `[MASK]` |
| Parametros totales | 149.312.257 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,6 GB |
| Pipeline declarado | zero-shot-classification |
| Modelo base | answerdotai/ModernBERT-base |
| Libreria | decide |

## Arquitectura y entrenamiento

La arquitectura es un encoder ModernBERT-base al que se añade una cabeza MLP. El input empaquetado sigue el formato `<instructions> <state> [SEP] [MASK] option0 [MASK] option1 ...`. La cabeza puntúa el estado del encoder en cada token `[MASK]` correspondiente a una opción. El diseño de atención es la innovación clave: cada opción atiende únicamente al prefijo compartido (instrucción y estado), a sí misma y a su posición, reiniciando los positional ids después del prefijo. Esto garantiza que la puntuación de una opción sea independiente del resto del conjunto, lo que permite permutar opciones sin alterar los resultados (cambio máximo de logits bajo permutación: 1,4e-06). No es autorregresivo: todas las opciones se puntúan en una sola pasada.

El ajuste fino se realizó sobre 208.762 ejemplos construidos a partir de datasets públicos de clasificación, inferencia y elección múltiple. Las opciones se remuestrean y verbalizan en varios estilos, y las tareas de clasificación se reformulan también como preguntas de verificación sí/no. Fuentes principales por volumen de ejemplos: mnli (24.000), snli (15.976), wanli (16.000), clinc150 (12.000), banking77 (9.993), civil_comments (9.391), boolq (9.000), commonsense_qa (9.000), hellaswag (9.000), bitext_support (8.990), entre otras. No se menciona en la información disponible el uso de RLHF ni DPO. Se aplica escalado de temperatura por tipo de pregunta (incluido en `decide.json`) para la calibración.

## Capacidades

- Puntuación calibrada de opciones: distribución de probabilidad sobre K opciones mutuamente excluyentes (tipo "choice").
- Verificación sí/no: probabilidad de que una condición se cumpla (tipo "noul").
- Puntuación en escala ordenada: nivel esperado sobre una escala (tipo "score").
- Clasificación zero-shot: clasifica sin ajuste específico sobre tareas no vistas (con rendimiento variable según dominio).
- Invariancia a permutación de opciones: el orden de las opciones no cambia el resultado.
- Inferencia no autorregresiva: una sola pasada para todas las opciones.
- Calibración de probabilidades: ECE bajo en las tareas de validación (0,014 en el agregado de validación).
- No dispone de generación de texto libre, tool calling, function calling, capacidades de agente ni visión. No es un modelo conversacional.
- Capacidades multilingües: no dispone; solo inglés.

## Casos de uso

- Clasificación de causa raíz en sistemas de incidencias: dado un mensaje de error, hardware o infraestructura, el modelo devuelve la probabilidad de cada categoría (por ejemplo, "infrastructure" frente a "billing"). El ejemplo de la model card ilustra exactamente este caso; es adecuado porque ofrece probabilidades calibradas y caben conjuntos de categorías pequeñas.
- Enrutado de tickets de soporte: clasificar la consulta entrante en departamentos o intenciones (clinc150 alcanza 98,0% en validación) antes de derivarla a un modelo generativo o a un humano.
- Filtrado de spam y moderación binaria: usar el modo "noul" para preguntas sí/no; sms_spam alcanza 82,6% de precisión en la evaluación zero-shot.
- Análisis de sentimiento y polaridad: amazon_polarity alcanza 94,7% y sst2 un 93,0% en los splits de validación, útil para monitorización de opiniones sobre reseñas o comentarios.
- Inferencia de lenguaje natural (NLI) en pipelines de validación: mnli (85,3%), snli (85,4%) y rte (79,0%) permiten verificar si una afirmación se sigue de una premisa, útil en comprobación de hechos o consistencia de resúmenes.
- Detección y graduación de toxicidad: civil_comments obtiene 73,1% con un error absoluto medio de 0,47 niveles, lo que permite moderación con umbral graduable en lugar de binaria.
- Clasificación de intenciones sobre taxonomías cerradas: banking77 (96,3%) y go_emotions (83,2%) son adecuados para categorización de emociones o de intenciones con conjuntos de etiquetas descriptivas.
- Enrutado dentro de agentes: como componente barato de decisión que selecciona la siguiente herramienta o rama de un flujo multi-paso, sustituyendo a un modelo generativo cuando solo se necesita elegir entre opciones predefinidas.

## Benchmarks y rendimiento

Los datos provienen de la model card del autor. La exactitud es top-option accuracy; ECE es el error de calibración esperado (15 bins) de la confianza de la opción superior, tras el escalado de temperatura por tipo.

Splits de validación de las tareas de entrenamiento:

| task | n | accuracy | NLL | ECE |
| :-- | --: | --: | --: | --: |
| all | 6307 | 78,7% | 0,512 | 0,014 |
| kind: choice | 3782 | 77,5% | 0,549 | 0,016 |
| kind: noul | 2146 | 84,6% | 0,352 | 0,012 |
| kind: score | 379 | 57,0% | 1,034 | 0,068 |
| ag_news | 300 | 91,7% | 0,257 | 0,047 |
| amazon_polarity | 300 | 94,7% | 0,172 | 0,027 |
| arc | 200 | 38,5% | 1,331 | 0,101 |
| arc_easy | 200 | 62,0% | 0,926 | 0,150 |
| banking77 | 300 | 96,3% | 0,106 | 0,022 |
| bitext_support | 300 | 99,7% | 0,015 | 0,011 |
| boolq | 300 | 75,7% | 0,493 | 0,050 |
| civil_comments | 156 | 73,1% (MAE 0,47 niveles) | 0,606 | 0,065 |
| clinc150 | 300 | 98,0% | 0,059 | 0,019 |
| cola | 200 | 76,5% | 0,524 | 0,055 |
| commonsense_qa | 300 | 62,3% | 0,891 | 0,092 |
| dbpedia14 | 300 | 73,3% | 0,918 | 0,162 |
| go_emotions | 256 | 83,2% | 0,463 | 0,059 |
| hellaswag | 300 | 62,3% | 0,927 | 0,069 |
| mnli | 300 | 85,3% | 0,416 | 0,084 |
| mrpc | 200 | 84,0% | 0,367 | 0,078 |
| qnli | 200 | 90,5% | 0,234 | 0,057 |
| qqp | 200 | 83,5% | 0,410 | 0,051 |
| rte | 200 | 79,0% | 0,436 | 0,050 |
| snli | 295 | 85,4% | 0,369 | 0,045 |
| sst2 | 300 | 93,0% | 0,193 | 0,027 |
| sst5 | 300 | 57,0% (MAE 0,56 niveles) | 1,068 | 0,059 |
| wanli | 300 | 73,0% | 0,591 | 0,050 |
| winogrande | 300 | 56,3% | 0,757 | 0,134 |

Tareas no vistas durante el entrenamiento (zero-shot):

| task | n | accuracy | NLL | ECE |
| :-- | --: | --: | --: | --: |
| all | 4693 | 47,9% | 1,242 | 0,094 |
| kind: choice | 2500 | 40,7% | 1,414 | 0,121 |
| kind: noul | 1193 | 82,6% | 0,530 | 0,085 |
| kind: score | 1000 | 24,4% | 1,662 | 0,108 |
| emotion | 1000 | 51,6% | 1,454 | 0,168 |
| mmlu | 1500 | 33,5% | 1,387 | 0,089 |
| sms_spam | 1193 | 82,6% | 0,530 | 0,085 |
| stsb | 1000 | 24,4% (MAE 0,93 niveles) | 1,662 | 0,108 |

## Requisitos de hardware

- El modelo tiene 149,3 millones de parámetros, por lo que es extremadamente ligero: aproximadamente 600 MB en FP32, 300 MB en FP16/BF16, 150 MB en INT8 y 75 MB en INT4 (estimaciones según recuento de parámetros; los tipos de cuantización concretos publicados no están disponibles).
- Cabe holgadamente en cualquier GPU de consumo, incluidas GTX 1650, RTX 3060, RTX 4090 y GPUs integradas de portátiles. También es viable la inferencia en CPU.
- GPU recomendadas: cualquiera con al menos 1-2 GB de VRAM libre. Aceleradores como A100 o H100 no son necesarios y resultarían desproporcionados para este tamaño.
- Opciones de despliegue: la librería Go `decide` (repositorio jmwri/decide, con soporte `decide pull --repo jmwri/decide` y `decide.NewLocal`), transformers de Hugging Face al ser un modelo compatible con ModernBERT, y exportación a ONNX para despliegue en servidores. La aplicabilidad de vLLM o TGI a un encoder de clasificación no está documentada en la información disponible.
- Latencia y throughput: no disponibles. Al ser no autorregresivo y resolver todas las opciones en una sola pasada, el coste de inferencia es bajo en comparación con un modelo generativo del mismo tamaño, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| jmwri/decide | Encoder ModernBERT + cabeza MLP | 149,3 M | 8192 | Apache 2.0 | Decision no autorregresiva (choice/noul/score) |
| answerdotai/ModernBERT-base | Encoder ModernBERT | 149 M | 8192 | Apache 2.0 | Representacion general, fine-tuning posterior |
| Modelos de zero-shot NLI tipo BART/DeBERTa | Encoder/seq2seq | Del orden de cientos de millones | Variable, a menudo 512-1024 | Variable segun modelo | Clasificacion zero-shot via NLI |

La comparación cuantitativa detallada frente a alternativas de clasificación zero-shot no está disponible en la información proporcionada, ya que la model card no incluye comparaciones directas con otros modelos. La diferencia funcional principal de decide frente a un encoder genérico como ModernBERT-base es que ya viene entrenado para emitir puntuaciones calibradas sobre opciones, mientras que ModernBERT-base requiere un cabezal y entrenamiento adicionales.

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas.
- Longitud de entrada limitada a 8192 tokens.
- Los conjuntos de opciones deben mantenerse por debajo de aproximadamente 10 elementos; para taxonomías mayores se recomienda una estrategia de dos etapas.
- Está entrenado sobre datasets públicos de clasificación, inferencia y elección múltiple, por lo que rinde mejor en esos estilos de pregunta. Textos de opciones explícitos y descriptivos funcionan mejor que etiquetas escuetas.
- El jerga específica de dominio o las rúbricas sin criterios descriptivos recaen en los priors generales del lenguaje y probablemente rindan peor.
- El rendimiento en tareas no vistas es sensiblemente inferior (47,9% agregado zero-shot frente a 78,7% en validación de tareas de entrenamiento), con caídas notables en arc (38,5%), mmlu (33,5%), winogrande (56,3%) y stsb (24,4%).
- Riesgo de alucinación: al no ser generativo, no produce texto libre, pero sí puede asignar alta confianza a opciones incorrectas en dominios fuera de su distribución de entrenamiento.
- Advertencia de licencia: el modelo se publica bajo Apache 2.0, pero los datos de entrenamiento incluyen datasets con licencias share-alike (cc-by-sa) o sin especificar (ag_news, sst5, cola, GLUE). La model card recomienda revisar las licencias de los datasets antes de redistribuir o comercializar los pesos.
- El repositorio no registra descargas ni likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación externa.
- Requiere el tokenizador específico del modelo; los positional ids reiniciados tras el prefijo forman parte del mecanismo y no deben alterarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jmwri/decide
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Repositorio y toolchain en Go: https://github.com/jmwri/decide
- Documentación de ModernBERT (answerdotai): no disponible como enlace directo en la información proporcionada
