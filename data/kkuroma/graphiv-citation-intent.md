# kkuroma/GraphIV-citation-intent

## Resumen

GraphIV-citation-intent es un clasificador de texto basado en DistilBERT desarrollado por el usuario kkuroma para etiquetar la intencion de las citas bibliograficas entre articulos de arXiv. El modelo resuelve un problema concreto de la scientometria: asignar a cada mencion de una obra previa una de seis categorias de intencion (background, uses, compares, critiques, extends, motivates), algo que los conjuntos de datos publicos de intencion de citas no cubren a escala de todo arXiv.

El modelo forma parte del proyecto GraphIV, que construye un grafo de citas con mas de 77 millones de aristas. Para poder etiquetar ese volumen en una sola GPU RTX 3090, el autor diseno un sistema de tres niveles: 985 citas etiquetadas a mano, un profesor Gemma 4 26B con prompt optimizado automaticamente, y un alumno DistilBERT destilado que es el artefacto publicado aqui. El resultado es un clasificador ligero de 66,9 millones de parametros con una ventana de entrada de 256 tokens.

La relevancia actual del modelo es practica: demuestra que la destilacion de un LLM grande hacia un encoder pequeno permite anotar corpus masivos con un coste computacional minimo, manteniendo un macro F1 de 0,815 frente al profesor y un rendimiento cercano en las clases mayoritarias frente a etiquetas humanas. Esta pensado para pipelines de analisis bibliometrico, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder, 6 capas) |
| Parametros totales | 66.958.086 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (entrada: par cabecera de seccion + frase) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion estandar de transformers, no documentada por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un DistilBERT base sin cased inicializado desde `distilbert/distilbert-base-uncased`, con una cabeza de clasificacion de seis clases. La entrada es un par de secuencias: la cabecera de la seccion donde aparece la cita y la frase que la contiene, con la cita a etiquetar marcada como `[CITE]` y las cabeceras vacias representadas como `(unknown)`. La longitud maxima es de 256 tokens, holgada segun el autor porque la cita mas larga de una muestra de 1.962 ocupaba 205 tokens.

El entrenamiento sigue un esquema de destilacion profesor-alumno. Primero se optimizo automaticamente el prompt de un profesor Gemma 4 26B sobre 985 citas etiquetadas a mano, alcanzando una precision de 0,993 en la quinta generacion del prompt (con 2 respuestas no parseadas). Ese prompt se uso para etiquetar 10.000 citas resueltas de GraphIV, de las que 9.971 se parsearon correctamente. El desglose es muy desbalanceado: 6.834 background, 1.526 uses, 642 compares, 452 critiques, 400 extends y 117 motivates. La particion 80/10/10 con semilla 0 deja 7.976 de entrenamiento, 997 de validacion y 998 de test. El alumno se entreno con AdamW (weight decay 0,01), learning rate pico de 2e-5 con un ciclo que alcanza el pico al 10% de los pasos, batch de 64, autocast en bf16 y clipping de gradientes a 1,0. Se usaron 12 epocas y se conservo la epoca 8, con macro F1 de validacion de 0,818. Para compensar el desbalanceo se aplico un sampler con frecuencia inversa de clase elevada a la potencia 0,6, manteniendo la perdida sin ponderar para no contar el balanceo dos veces.

## Capacidades

- Clasificacion de intencion de citas en seis categorias mutuamente excluyentes: background, uses, compares, critiques, extends y motivates.
- Etiquetado por pares (cabecera de seccion, frase con `[CITE]`) que aporta contexto estructural al clasificador.
- Salida con probabilidad softmax por clase, utilizable como puntuacion de confianza (`intent_score` en GraphIV).
- Procesamiento por lotes de alta eficiencia: el modelo cabe holgadamente en una GPU consumer y permite anotar millones de citas.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada al ingles, coherente con el corpus de arXiv en ingles.
- Inferencia determinista y de baja latencia, adecuada para pipelines offline.

## Casos de uso

- Anotacion masiva de grafos de citas: clasificar las mas de 77 millones de aristas de GraphIV en una sola RTX 3090, algo inviable con un LLM profesor por coste y latencia.
- Analisis bibliometrico de influencia: distinguir citas de uso real (`uses`) de citas de contexto (`background`) para medir la reutilizacion efectiva de metodos y herramientas en un campo.
- Deteccion de criticas y limitaciones: extraer citas etiquetadas como `critiques` para construir mapas de controversias tecnicas o de limitaciones reconocidas de un metodo.
- Seguimiento de linajes de investigacion: usar las etiquetas `extends` y `motivates` para reconstruir cadenas de trabajos que generalizan o se inspiran en una contribucion previa.
- Enriquecimiento de buscadores academicos: incorporar la intencion de cita como senal de ranking o de resumen en herramientas de descubrimiento de literatura.
- Construccion de datasets de entrenamiento: generar etiquetas debiles a escala para entrenar o evaluar otros modelos de intencion de citas, con la salvedad de que las etiquetas provienen de un profesor LLM.
- Analisis de secciones de trabajos relacionados: al recibir la cabecera de seccion, el modelo permite estudiar como varia la intencion de cita entre introduccion, trabajo relacionado y detalles de implementacion.

## Benchmarks y rendimiento

Evaluacion frente al profesor (Gemma 4 26B) en las 998 citas de test retenidas:

| Intencion | n | Precision | Recall | F1 |
|---|---|---|---|---|
| background | 669 | 0,940 | 0,918 | 0,929 |
| uses | 162 | 0,810 | 0,870 | 0,839 |
| compares | 57 | 0,793 | 0,807 | 0,800 |
| critiques | 54 | 0,679 | 0,667 | 0,673 |
| extends | 46 | 0,765 | 0,848 | 0,804 |
| motivates | 10 | 0,889 | 0,800 | 0,842 |
| Macro | 998 | no disponible | no disponible | 0,815 |
| Accuracy | 998 | no disponible | no disponible | 0,886 |

Evaluacion frente a etiquetas humanas en las 985 citas del ground truth (no vistas en entrenamiento):

| Intencion | n | F1 alumno | F1 profesor |
|---|---|---|---|
| background | 167 | 0,965 | 0,988 |
| uses | no disponible | no disponible | no disponible |

El resto de filas de la comparacion frente a humanos no esta disponible en la informacion proporcionada. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, algo esperable en un clasificador de dominio especifico.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en fp32 (66,9 M de parametros, unos 268 MB de pesos) y en torno a 150-200 MB en fp16; el repo ocupa 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entreno y ejecuto el etiquetado completo en una sola RTX 3090.
- Cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU para lotes moderados.
- Opciones de despliegue: transformers con PyTorch, Text Embeddings Inference (el modelo esta marcado como compatible con endpoints), y exportacion a ONNX para inferencia en CPU; tambien es viable servirlo con un endpoint de Hugging Face.
- Latencia y throughput: no disponibles de forma explicita; por tamano y arquitectura, el procesamiento por lotes de 64 en bf16 deberia alcanzar miles de clasificaciones por segundo en una GPU moderna, aunque el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kkuroma/GraphIV-citation-intent | 66,9 M | 256 tokens | Clasificacion de intencion de citas (6 clases) | apache-2.0 | Hugging Face |
| distilbert-base-uncased | 66,9 M | 512 tokens | Clasificacion generica de texto | apache-2.0 | Hugging Face |
| Gemma 4 26B (profesor del pipeline) | no disponible | no disponible | Etiquetado generativo con prompt optimizado | no disponible | no disponible |

No se dispone en la informacion proporcionada de otros clasificadores publicos de intencion de citas comparables en parametros y contexto, por lo que la comparativa con alternativas especificas del dominio queda como no disponible.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento provienen de un profesor LLM (Gemma 4 26B) sobre 985 etiquetas humanas; los errores del profesor se propagan al alumno, especialmente en clases raras como `critiques` (F1 0,673 frente al profesor) y `motivates` (solo 10 ejemplos en test).
- El desbalanceo extremo del corpus (dos tercios de `background`) implica que el rendimiento en clases minoritarias es sensiblemente inferior al de la clase mayoritaria.
- Solo soporta ingles; las citas en otros idiomas o con texto no ingles no estan cubiertas.
- La ventana de 256 tokens limita la entrada a una cabecera de seccion y una frase; no modela el contexto de parrafo completo ni la estructura del documento.
- El modelo clasifica citas entre articulos de arXiv; su comportamiento fuera de ese dominio (otras disciplinas, otros formatos editoriales) no esta documentado.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de falsos positivos en la asignacion de intencion, con mayor incidencia en `critiques` y `compares`.
- Licencia apache-2.0, que permite uso comercial y modificacion; aun asi, el autor no documenta evaluaciones de sesgo ni de robustez fuera del corpus de arXiv.
- El modelo no debe usarse como unico criterio en decisiones academicas sensibles sin revision humana, dado que las etiquetas son aproximaciones automaticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kkuroma/GraphIV-citation-intent
- Dataset GraphIV: https://huggingface.co/datasets/kkuroma/GraphIV
- Codigo del pipeline de etiquetado: https://git.kuroma.dev/kkuroma/graphiv/src/branch/main/scripts/citation_labeler
- Prompt del profesor: https://huggingface.co/kkuroma/GraphIV-citation-intent/blob/main/teacher_prompt.txt
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
