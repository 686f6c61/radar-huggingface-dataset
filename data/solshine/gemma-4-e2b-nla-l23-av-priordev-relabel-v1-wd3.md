# Solshine/gemma-4-e2b-nla-L23-av-priordev-relabel-v1-wd3

## Resumen

El modelo `Solshine/gemma-4-e2b-nla-L23-av-priordev-relabel-v1-wd3` es un adaptador LoRA de interpretabilidad mecanicista, no un asistente conversacional. Desarrollado por el usuario Solshine, se apoya en el modelo base `google/gemma-4-E2B` y actúa como "verbalizador de activaciones" (activation verbalizer, AV) dentro de un esquema de autoencoder en lenguaje natural (NLA): recibe un vector de activación de la corriente residual de 1536 dimensiones capturado en la capa 23 y escribe una descripción breve en lenguaje natural (24 tokens, decodificación greedy) de la información que el modelo debía haber integrado en ese punto para predecir su siguiente token.

Su relevancia no está en la generación de texto, sino en el cambio de receta de etiquetado. Es una reejecución de una receta supervisada de horizonte largo ya publicada (`gemma-4-e2b-nla-L23-av-priordev-wd3-20k`), pero entrenada sobre un corpus cuyas etiquetas se reescribieron: donde el corpus original contenía resúmenes temáticos breves, el nuevo contiene atribuciones de características. Según el autor, esa es la única diferencia respecto al predecesor y es lo que separa a este adaptador: es el primero del proyecto cuyas descripciones un juez ciego califica como utilizables (1,70/3 frente a 0,00/3) y el primero que identifica un documento visto en entrenamiento a partir de su activación.

La advertencia central del autor es de contaminación de la evaluación: el pool de 580 documentos se dividió por identificador, pero 383 de los 580 (66%) están presentes literalmente en el corpus de entrenamiento. El rendimiento de recuperación top-1 es altísimo sobre esos 383 documentos (81,7%) y cae a nivel de azar sobre los 197 no vistos (0,5%, 1 acierto de 197). El propio autor retira la afirmación anterior de que el resultado agregado fuese "held-out".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder (`google/gemma-4-E2B`); entrada de 1536 dimensiones de corriente residual en la capa 23, salida de texto de 24 tokens |
| Parámetros totales | no disponible (adaptador LoRA; el repositorio ocupa 1,4 GB e incluye tres checkpoints más ficheros de configuración) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (la tarea generativa se limita a descripciones de 24 tokens en modo greedy) |
| Tipos de cuantización | no disponible (pesos del adaptador en safetensors; no se documentan cuantizaciones del adaptador ni del modelo base) |
| Idiomas soportados | inglés (`en`) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (estructura PEFT/LoRA: `adapter_config.json`, `nla_meta.yaml`, `inject_config.json` en cada checkpoint) |

## Arquitectura y entrenamiento

La arquitectura es un adaptador LoRA sobre `google/gemma-4-E2B`, configurado como verbalizador de activaciones. La interfaz es inusual: no toma texto, sino un vector de 1536 dimensiones extraído de la corriente residual en la capa 23, y produce una frase corta que describe el contenido semántico integrado en esa activación. El repositorio publica tres checkpoints (`step_005000/`, `step_010000/`, `step_014000/`) con sus pesos, `adapter_config.json`, `nla_meta.yaml` e `inject_config.json`. El entrenamiento se detuvo en el paso 14360 al cerrarse la ventana de cómputo, por debajo del horizonte preregistrado de 20000 pasos.

La receta es supervisada de horizonte largo y coincide con la de la publicación anterior del mismo autor. La innovación declarada está exclusivamente en las etiquetas del corpus: las originales eran resúmenes temáticos breves (por ejemplo, "United States v. Carmack: Supreme Court case concerning federal powers") y las nuevas son atribuciones de características (por ejemplo, "Model is mid-list of mesophile-fermented foods (cheese, yogurt named) and must supply ..."). El autor señala además que existen adaptadores entrenados con GRPO de recompensa densa (500 y 1000 pasos) sobre los mismos datos, y que la comparación entre refuerzo y corrección de etiquetas queda sin resolver.

## Capacidades

- Verbalización de activaciones: dado un vector de 1536 dimensiones de la capa 23, genera una descripción en lenguaje natural de 24 tokens (decodificación greedy) sobre la información integrada en ese punto.
- Recuperación del documento fuente: la descripción permite identificar el documento de origen entre 580 candidatos (top-1) con un 81,7% (313/383) en documentos vistos en entrenamiento; en documentos no vistos cae a nivel de azar (0,5%, 1/197).
- Control de sensibilidad a la activación: con activaciones permutadas entre documentos el rendimiento es del 0,0% (tf-idf) y del 0,17% (semántico, p = 0,64); sin inyección de activación (24 documentos) la salida es una única descripción, a nivel de azar.
- Atribución de características: las descripciones apuntan a características concretas que el modelo debe aportar, en lugar de resumir el tema del documento.
- Escalado con el entrenamiento: la recuperación top-1 agregada crece de 26,6% (paso 5000) a 48,1% (paso 10000) y a 54,1% (paso 14000) con tf-idf; de 24,3% a 42,2% y 47,1% con embeddings semánticos.
- Diversidad de salidas: 395, 502 y 497 salidas únicas sobre 580 documentos en los pasos 5000, 10000 y 14000 respectivamente.
- Tool calling / function calling: no documentado.
- Uso como agente o razonamiento multi-paso: no documentado.
- Capacidades multilingües: no; el modelo declara únicamente inglés.
- Capacidades multimodales (visión, audio): no documentadas.

## Casos de uso

- Auditoría de representaciones internas: inyectar activaciones de la capa 23 de un prompt concreto y leer la descripción generada para comprobar qué información está integrada en ese punto de la red. Es el uso principal y para el que fue entrenado.
- Sonda de memorización de datos de entrenamiento: dado que la recuperación top-1 sobre documentos vistos alcanza el 81,7% (313/383), el adaptador puede emplearse para detectar qué documentos concretos han sido memorizados por el modelo base, comparando la descripción con el corpus sospechoso.
- Detección de fugas en conjuntos de evaluación: al verbalizar activaciones de ejemplos de un benchmark, la identificación exacta del documento de origen sería un indicio de contaminación del benchmark; conviene tener presente que la tasa sobre documentos no vistos es indistinguible del azar (0,5%), por lo que la prueba solo es informativa en el sentido positivo.
- Etiquetado y curación de corpus de interpretabilidad: la comparación entre etiquetas de resumen temático y etiquetas de atribución de características sirve como caso de estudio metodológico para diseñar corpus de supervisión de verbalizadores.
- Investigación en circuitos y corriente residual: el adaptador se ancla a una capa y una dimensionalidad concretas (capa 23, 1536 dimensiones), lo que permite experimentos controlados de intervención por capa.
- Evaluación de técnicas de alineamiento: comparar este adaptador supervisado con los adaptadores GRPO de recompensa densa sobre la misma base de documentos para estudiar si el refuerzo cambia lo que el verbalizador lee.
- Docencia y demostración de interpretabilidad mecanicista: los tres checkpoints publicados (5000, 10000, 14000) permiten mostrar la evolución del comportamiento del verbalizador a lo largo del entrenamiento con un coste de adaptador pequeño.

## Benchmarks y rendimiento

Protocolo: se inyecta una activación, se genera una descripción greedy de 24 tokens y se pregunta si esa descripción identifica su propio documento fuente entre 580 candidatos (top-1). El azar es 1/580 = 0,17%. Se usan dos puntuadores (coseno tf-idf, léxico, y embeddings de frase MiniLM, semántico). Los p-valores son el peor caso sobre cuatro extracciones independientes de una nula de 3000 permutaciones (suelo 0,0003).

Resultados agregados del pool (consultas contaminadas y limpias juntas):

| Checkpoint | tf-idf top-1 (x azar) | Semántico top-1 (x azar) | Salidas únicas / 580 |
|---|---|---|---|
| step 5000 | 26,6% (154x) | 24,3% (141x) | 395 |
| step 10000 | 48,1% (279x) | 42,2% (245x) | 502 |
| step 14000 | 54,1% (314x) | 47,1% (273x) | 497 |
| step 14000, activaciones permutadas | 0,0% (0x, p = 1,0) | 0,17% (1x, p = 0,64) | 497 |
| step 14000, sin activación inyectada (24 docs) | a su propio azar 1/24 | a nivel de azar | 1 |

Desglose por contaminación (puntuador tf-idf; consultas particionadas, pool de candidatos completo para mantener el azar en 1/580):

| Checkpoint | 383 documentos en entrenamiento | 197 documentos fuera de entrenamiento |
|---|---|---|
| step 14000 | 81,7% (313/383) | 0,5% (1/197), p = 0,29, IC 0,5x–16,3x, a nivel de azar |
| step 14000, activaciones permutadas | 0,0% | 0,0% |
| Adaptador supervisado predecesor (etiquetas originales, step 5000) | 0,3% (1/383) | 0,0% (0/197) |
| Corpus original reentrenado con esta receta, dos semillas | 0,5% (2/383) cada una | 0,0% cada una |
| Adaptadores GRPO de recompensa densa (500 / 1000 pasos) | 0,5% / 1,0% | 1,5% (3/197) cada uno, nominal |

Evaluación de usabilidad a ciegas: sobre 40 documentos, con el sistema productor oculto y una rúbrica 0–3 fijada de antemano (0 sin señal utilizable, 1 vecindad amplia correcta, 2 tema correcto con detalles fabricados, 3 preciso y específico), el paso 14000 obtiene 1,70/3 frente a 0,00/3 del predecesor (mejor en 30 documentos, peor en ninguno), con un brazo de activaciones permutadas en 0,18. Las 16 descripciones puntuadas con 3 correspondían a documentos en entrenamiento. Restringido a los 16 documentos fuera de entrenamiento, el juez del propio proyecto puntuó 0,625/3 frente a 0,00 (p = 0,0078), pero dos jueces independientes (un modelo frontera externo y un consejo de modelos locales) solo corroboran la dirección (por encima de la base y del brazo permutado), no la magnitud: 1 de 16 y 2 de 16 puntuaciones positivas.

No se han publicado resultados de benchmarks de propósito general (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El repositorio no documenta requisitos de memoria ni el tamaño del modelo base `google/gemma-4-E2B`. Estimación no confirmada (no validada por el autor): si el sufijo "E2B" del modelo base corresponde a la convención de parámetros efectivos en el entorno de los 2000 millones, la inferencia en fp16 requeriría del orden de 4–5 GB de VRAM y en cuantización de 4 bits del orden de 1,5–2 GB, a lo que hay que sumar el adaptador.
- GPU recomendadas: no especificadas. La etiqueta `consumer-gpu` del repositorio indica intención de ejecución en GPU de consumo, sin detallar modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; la etiqueta `consumer-gpu` sugiere que sí, pero no hay cifras publicadas.
- Tamaño del repositorio: 1,4 GB, que incluye tres checkpoints (`step_005000/`, `step_010000/`, `step_014000/`) con pesos del adaptador y ficheros de configuración.
- Opciones de despliegue: el repositorio declara `library_name: peft` y formato safetensors, por lo que el despliegue esperado es mediante PEFT y Transformers. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La carga de trabajo es de una generación de 24 tokens por activación procesada, además de la captura de la activación en la capa 23, que requiere acceso a las representaciones internas del modelo base.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores NLA equivalentes de otros autores. La comparativa se limita a las variantes del mismo proyecto citadas en la model card:

| Adaptador | Etiquetas de entrenamiento | Pasos | Top-1 (tf-idf) en documentos vistos | Top-1 en documentos no vistos | Licencia |
|---|---|---|---|---|---|
| Este adaptador (relabel v1-wd3) | Atribuciones de características | 14000 (detenido en 14360) | 81,7% (313/383) | 0,5% (1/197), a nivel de azar | cc-by-4.0 |
| Predecesor supervisado (`wd3-20k`, step 5000) | Resúmenes temáticos | 5000 | 0,3% (1/383) | 0,0% (0/197) | no disponible |
| Corpus original con esta receta, dos semillas | Resúmenes temáticos | no disponible | 0,5% (2/383) cada una | 0,0% cada una | no disponible |
| Adaptadores GRPO de recompensa densa | no disponible | 500 / 1000 | 0,5% / 1,0% | 1,5% (3/197) cada uno, nominal | no disponible |

El autor advierte que el 1,5% (3/197) de los adaptadores GRPO es nominal: no sobrevive a la corrección por los catorce contrastes realizados en ese análisis, se apoya en tres aciertos y esos checkpoints carecen de control sin inyección de activación.

## Limitaciones y advertencias

- Contaminación de la evaluación: 383 de los 580 documentos del pool (66%) están presentes literalmente en el corpus de entrenamiento (comprobado por coincidencia exacta, tramos compartidos de 20 palabras y contención de 8-gramos). Los números agregados de la primera tabla están dominados por esos documentos. El autor retira explícitamente la afirmación previa de que el resultado fuese sobre datos no vistos.
- Ausencia de generalización a documentos nuevos: sobre los 197 documentos no vistos, la recuperación top-1 es del 0,5% (1/197), con p = 0,29, indistinguible del azar. El adaptador no identifica documentos que no ha visto.
- Evaluación de usabilidad con señales mixtas: el juez del propio proyecto otorga 0,625/3 sobre documentos no vistos (p = 0,0078), pero dos jueces independientes solo corroboran la dirección, no la magnitud (1 de 16 y 2 de 16 positivos, sin alcanzar significación). Las 16 descripciones perfectas (3/3) eran todas de documentos vistos en entrenamiento.
- Fabricación de detalles: la rúbrica contempla explícitamente el nivel 2, "tema correcto con detalles fabricados", lo que indica que las descripciones pueden contener especificidad inventada.
- Entrenamiento incompleto: el entrenamiento se detuvo en el paso 14360 por cierre de la ventana de cómputo, sin alcanzar el horizonte preregistrado de 20000 pasos.
- Idiomas: únicamente inglés. Cualquier uso en castellano u otras lenguas no está soportado ni evaluado.
- Naturaleza de la herramienta: no es un modelo de propósito general; no se documenta soporte de tool calling, agentes, razonamiento multi-paso ni multimodalidad. No debe evaluarse con benchmarks de asistente.
- Acoplamiento al modelo base: el adaptador está atado a `google/gemma-4-E2B` y, específicamente, a activaciones de 1536 dimensiones de la capa 23. Cambiar de capa, de dimensionalidad o de checkpoint del modelo base invalida la interfaz.
- Licencia: cc-by-4.0 permite uso comercial con atribución, pero cualquier uso en producción debe respetar además las condiciones del modelo base `google/gemma-4-E2B`, que no se detallan en este repositorio.
- Madurez: 0 descargas y 0 "likes" en el momento de la consulta; se trata de un artefacto de investigación sin validación externa.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/Solshine/gemma-4-e2b-nla-L23-av-priordev-relabel-v1-wd3
- Predecesor citado en la model card: https://huggingface.co/Solshine/gemma-4-e2b-nla-L23-av-priordev-wd3-20k
- Modelo base: https://huggingface.co/google/gemma-4-E2B

Nota: la búsqueda web asociada a esta ficha no devolvió resultados relevantes (únicamente páginas de seguimiento de envíos de FedEx), por lo que no hay papers, blogs, repositorios ni demos adicionales que enlazar. Los enlaces anteriores proceden de la información del repositorio y de su model card.
