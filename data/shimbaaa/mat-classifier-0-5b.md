# shimbaaa/mat-classifier-0.5b

## Resumen

Mat-Classifier-0.5B es un modelo de clasificación de texto de tipo multi-tarea, no autorregresivo, desarrollado por el usuario shimbaaa. Se construye sobre el backbone Qwen/Qwen2.5-0.5B y se presenta como un "System 1 Decision Engine" (estilo Laya / Jev) para entradas de carácter matemático: en lugar de generar texto token a token, produce evaluaciones estructuradas en un único paso hacia delante. Es, por tanto, un modelo discriminativo y no generativo, orientado a enrutar y etiquetar problemas matemáticos antes de pasarlos a un modelo mayor.

La arquitectura añade tres cabezas lineales paralelas sobre el estado oculto medio (pooled) del backbone: una cabeza binaria (Noul) que decide si el problema requiere varios pasos de razonamiento, una cabeza de 5 clases (Choice) que clasifica el dominio matemático y una cabeza ordinal de 5 clases (Score) que estima la dificultad de 0 a 4. El modelo se entrenó y evaluó sobre 7.473 problemas preprocesados de GSM8K.

Su relevancia práctica es la de un componente ligero de orquestación: con solo 0,5B parámetros y un único forward pass, sirve para prefiltrar, clasificar y priorizar consultas matemáticas en pipelines que luego invocan modelos de razonamiento más grandes, reduciendo coste y latencia en esa etapa de decisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2.5-0.5B) con pooling medio y tres cabezas lineales de clasificación; inferencia no autorregresiva |
| Parametros totales | 0,5B en el backbone, más tres cabezas lineales (dimensión de salida 1, 5 y 5) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del backbone Qwen2.5-0.5B, no especificada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de transformers, 1,0 GB) |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen/Qwen2.5-0.5B, un transformer decoder de 0,5B parámetros. Sobre la representación pooled (media de `last_hidden_state` a lo largo de la dimensión de secuencia, convertida a float32) se conectan tres cabezas lineales independientes: `noul_head` (una salida, flag binario), `choice_head` (5 logits) y `score_head` (5 logits). No hay decodificación autorregresiva: la salida se obtiene en un solo forward pass, lo que da lugar a un modelo puramente discriminativo.

El entrenamiento se realizó sobre 7.473 problemas preprocesados de GSM8K (dataset `openai/gsm8k`). La model card no detalla el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no procede en un clasificador de este tipo). Tampoco se documenta la estrategia de congelación del backbone ni los hiperparámetros de entrenamiento. La innovación declarada es el enfoque "System 1": decisiones rápidas de una sola pasada (multi-step, dominio y dificultad) que sustituyen a la generación de cadenas de razonamiento para tareas de enrutamiento.

## Capacidades

- Clasificación binaria de necesidad de razonamiento multi-paso (cabeza Noul: sí/no).
- Clasificación de dominio matemático en 5 categorías (cabeza Choice): aritmética, probabilidad, ecuaciones/álgebra, fracciones/porcentajes y geometría.
- Estimación ordinal de dificultad en escala 0-4 (cabeza Score).
- Inferencia no autorregresiva de una sola pasada, con menor latencia que la generación token a token.
- Procesamiento de texto de entrada en inglés (el dataset de entrenamiento, GSM8K, está en inglés).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step generativo.
- No dispone de modo thinking, visión ni audio.
- Capacidades multilingües: no disponibles (entrenado sobre GSM8K en inglés).

## Casos de uso

- Enrutamiento previo en pipelines de razonamiento matemático: el modelo clasifica cada consulta entrante y decide si requiere un modelo de cadena de pensamiento (Noul = sí) o si puede resolverse con un modelo menor o una calculadora, ahorrando coste computacional.
- Triaje de dificultad en plataformas educativas: la cabeza Score asigna un nivel 0-4 a cada problema, lo que permite ordenar ejercicios por dificultad o adaptar el nivel al alumno.
- Clasificación temática de bancos de problemas: la cabeza Choice etiqueta automáticamente problemas de aritmética, álgebra, geometría, probabilidad o fracciones, facilitando la organización de repositorios y la búsqueda por dominio.
- Prefiltrado en sistemas de tutoría automática: antes de invocar un LLM grande, el clasificador determina el dominio y la dificultad y selecciona la plantilla de explicación o el modelo adecuado.
- Generación de metadatos para datasets matemáticos: etiquetado masivo de problemas con tres atributos (multi-paso, dominio, dificultad) a bajo coste, útil para curar corpus de entrenamiento.
- Control de calidad y detección de consultas fuera de dominio: la combinación de las tres cabezas permite descartar o marcar entradas que no encajan en el perfil matemático esperado antes de procesarlas con modelos más caros.
- Balanceo de carga en servicios de inferencia: al conocer la dificultad estimada, el orquestador puede derivar problemas simples a modelos pequeños y reservar los grandes para los complejos.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados sobre 7.473 problemas preprocesados de GSM8K:

| Tarea | Metrica | Resultado |
|---|---|---|
| Noul (multi-paso sí/no) | Accuracy | 99,75% |
| Choice (5 clases de dominio) | Accuracy | 99,61% |
| Score (dificultad 0-4) | Accuracy | 99,05% |

No se han publicado resultados comparativos con otros modelos ni métricas adicionales (F1, matriz de confusión, latencia) en la información disponible. Los resultados proceden del mismo conjunto de datos de entrenamiento/evaluación declarado por el autor, sin que se detalle la partición train/test, por lo que deben interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 el backbone de 0,5B ocupa aproximadamente 2 GB; en fp16/bf16 unos 1 GB; en cuantización de 8 bits alrededor de 0,5 GB y en 4 bits alrededor de 0,3 GB (estimaciones a partir del tamaño de parámetros; no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna sirve; una RTX 3060 (12 GB), RTX 4060 u RTX 4090 ejecutan el modelo con holgura. En entornos de servidor, A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con 2 GB o más de VRAM, e incluso en CPU para lotes pequeños.
- Opciones de despliegue: transformers (librería declarada); el tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al ser un modelo de clasificación con cabezas personalizadas requeriría un wrapper propio (como el ejemplo de la model card).
- Latencia y throughput: no disponibles. Por su naturaleza no autorregresiva, la latencia debería ser de un único forward pass, muy inferior a la de un modelo generativo del mismo tamaño.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de clasificación matemática multi-tarea con backbone de 0,5B. Como referencia de categoría, se puede situar frente a alternativas genéricas:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shimbaaa/mat-classifier-0.5b | 0,5B | no disponible | Clasificación multi-tarea (3 cabezas) | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-0.5B (backbone) | 0,5B | no disponible | Generación de texto | Apache 2.0 | Hugging Face |
| Clasificadores de texto tipo BERT-base | ~0,1B | 512 tokens típicamente | Clasificación de una sola tarea | variable | Hugging Face |

No se han encontrado comparativas publicadas con otros clasificadores matemáticos ni con modelos de enrutamiento equivalentes.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre GSM8K (problemas de aritmética verbal en inglés); su generalización a otros dominios matemáticos o a otros idiomas no está validada.
- Las métricas declaradas (99,75%, 99,61%, 99,05%) proceden de una evaluación sobre 7.473 problemas sin que se detalle la partición train/test; existe riesgo de sobreajuste o de fuga de datos entre entrenamiento y evaluación.
- Al ser un clasificador, no genera soluciones: no debe usarse para resolver problemas, solo para etiquetarlos.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas en entradas atípicas, ambiguas o fuera de distribución.
- Sesgos: no documentados por el autor; al derivarse de GSM8K, hereda los sesgos de composición de ese dataset (predominio de aritmética verbal escolar en inglés).
- Idiomas: no se declaran idiomas soportados; el uso en castellano no está validado.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y la model card no documenta hiperparámetros de entrenamiento, partición de datos ni proceso de validación; la reproducibilidad es limitada.
- El código de ejemplo de la model card define la clase pero no muestra la carga de los pesos de las cabezas entrenadas, por lo que la integración en producción requiere trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shimbaaa/mat-classifier-0.5b
- Perfil del autor: https://huggingface.co/shimbaaa
- Modelos del autor: https://huggingface.co/shimbaaa/models
- Backbone: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Dataset de entrenamiento: https://huggingface.co/datasets/openai/gsm8k
