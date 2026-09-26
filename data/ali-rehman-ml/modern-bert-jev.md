# ali-rehman-ML/modern-bert-jev

## Resumen

modern-bert-jev es un adaptador LoRA de 6,5 MB entrenado por ali-rehman-ML sobre el encoder congelado `answerdotai/ModernBERT-base`. No es un modelo generativo ni un clasificador con etiquetas fijas: puntúa cada opción de una lista de forma independiente, concatenando el contexto, la pregunta y el candidato en una sola secuencia, y aplica un softmax sobre las puntuaciones para obtener una distribución de probabilidad sobre las alternativas. Su rasgo diferencial es la calibración: las probabilidades que emite se ajustan mediante un factor de temperatura fijo (1,2023, almacenado en `calibration.json`), de modo que una confianza declarada del 70 % corresponde aproximadamente a un 70 % de aciertos reales.

El modelo está pensado para tareas de *choice scoring* sin lista cerrada: clasificación de intenciones, detección de emociones, inferencia de lenguaje natural o triaje de cláusulas legales, con listas de 2 a 151 categorías. Frente a un clasificador convencional, la ventaja es que admite categorías nunca vistas en entrenamiento y mantiene una estimación de incertidumbre utilizable, algo poco habitual en encoders pequeños. El coste es computacional: requiere una pasada completa del encoder por cada opción, por lo que 151 candidatos implican 151 *forward passes*.

La relevancia práctica está en su nicho: aplicaciones donde hace falta enrutar texto hacia etiquetas dinámicas y además saber cuándo el modelo no está seguro, con un coste de hardware mínimo (el backbone tiene ~149 M de parámetros y cabe en cualquier GPU de consumo o incluso en CPU). Como contrapartida, el autor advierte explícitamente de que el modelo carece de conocimiento del mundo, es solo en inglés, se entrenó con una única semilla y se detuvo antes de converger.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT-base congelado) + adaptador LoRA y cabeza de puntuación escalar; no es MoE ni SSM |
| Parámetros totales | No indicado por el autor. El backbone ModernBERT-base permanece congelado; el adaptador aporta 1.622.785 parámetros entrenables (1,08 % del total) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | El autor no declara la ventana del backbone; la entrada del adaptador está limitada a 512 tokens, con truncado aplicado únicamente al contexto (la pregunta y el candidato nunca se recortan). En la práctica, el modelo lee aproximadamente las primeras 400 palabras del contexto |
| Tipos de cuantización | No disponible (no se publican versiones cuantizadas; es un adaptador LoRA, no un modelo completo) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptador LoRA de 6,5 MB; el autor indica que no es un modelo `transformers` y que no se carga con `AutoModel`, sino con el código del repositorio. El formato de fichero concreto no está especificado |
| Modelo base | `answerdotai/ModernBERT-base` (commit `8949b909ec900327062f0ebf497f51aef5e6f0c8`), relación *adapter* |
| Pipeline declarado | `multiple-choice` (con `inference: false` en los metadatos de la model card) |
| Tarea / dataset | *Choice scoring* sobre `Praveenrajus/jev-bench` (9 fuentes) |

## Arquitectura y entrenamiento

El adaptador se compone de 1.622.016 parámetros LoRA (rango 16, alpha 32) aplicados a las proyecciones `attn.Wqkv` y `attn.Wo` de las 22 capas del backbone, más una cabeza de 769 parámetros: un *pooling* de media ponderado por máscara sobre `last_hidden_state` seguido de una capa `Linear(768 → 1)` que produce una única puntuación escalar por candidato. La entrada se formatea como `Context: …` en el segmento A y `Question: …\nCandidate: …` en el segmento B, limitada a 512 tokens. Al no existir una capa de salida con una ranura por categoría, el modelo puede puntuar listas de tamaño arbitrario y etiquetas no vistas durante el entrenamiento; la contrapartida es que nunca ve las opciones competidoras, por lo que la puntuación de cada candidato es independiente y el coste crece linealmente con el número de opciones.

El entrenamiento utilizó el conjunto completo de jev-bench sin límite de número de opciones en ningún *split*: 49.364 ejemplos de entrenamiento, 1.000 de validación, 1.000 de calibración y 9.599 de test. Se realizaron 6.171 pasos durante 2 épocas, en 114 minutos sobre una única H100 con un pico de 26,1 GiB. El optimizador fue AdamW (weight decay 0,01, learning rate 2e-4, valor truncado en la información disponible). Durante el entrenamiento cada ejemplo muestreó como máximo 32 candidatos (los que llevaban masa objetivo más negativos aleatorios, con renormalización de la masa superviviente), lo que redujo la media de candidatos por ejemplo de 68,0 a 25,9; validación, calibración y test siempre puntúan el conjunto completo publicado. La calibración se resuelve en inferencia dividiendo las puntuaciones por 1,2023 antes del softmax. No hay RLHF ni DPO: es un adaptador discriminativo, no un modelo de lenguaje.

## Capacidades

- *Choice scoring* con listas abiertas: puntúa y ordena entre 2 y 151 opciones (y potencialmente más, ya que nada está ligado a una lista fija), incluyendo categorías no vistas en entrenamiento.
- Estimación de incertidumbre calibrada: ECE de 0,0525 (10 bins) sobre el conjunto de test, es decir, un error medio de calibración de unos 5 puntos porcentuales.
- Clasificación de intenciones en dominios de atención al cliente (77 y 151 intenciones en las pruebas publicadas).
- Clasificación de comandos de asistente de voz (60 opciones).
- Detección de emociones en texto (28 categorías).
- Triaje de cláusulas legales (100 categorías).
- Inferencia de lenguaje natural (NLI) y lógica entre frases (3 opciones).
- Puntuación de candidatos para *reranking* genérico: al producir un logit por opción, puede usarse para ordenar respuestas o hipótesis candidatas.
- No soporta *tool calling*, ni uso como agente, ni razonamiento multi-paso, ni generación de texto libre, ni visión o audio. No dispone de modo *thinking*.

## Casos de uso

- Enrutado de tickets de soporte con umbral de confianza: el modelo clasifica cada mensaje sobre el catálogo real de intenciones del *contact center* (por ejemplo, 151 intenciones, con un 83 % de acierto en las pruebas del autor) y la probabilidad calibrada permite derivar a un agente humano los casos por debajo de un umbral, en lugar de aplicar una confianza arbitraria.
- Clasificación de mensajes bancarios hacia colas de trabajo: con 77 intenciones alcanza un 86 % de acierto frente al 1 % de una elección aleatoria, suficiente para preasignar casos en un sistema de gestión de incidencias donde el coste del error se mitiga con revisión humana.
- Triaje de contratos y cláusulas legales: con 100 tipos de cláusula y un 76 % de acierto, puede utilizarse como primera pasada en un pipeline de revisión documental, marcando los fragmentos que requieren lectura de un jurista.
- Detección de emoción en reseñas y comentarios: 28 emociones con un 62 % de acierto. Es adecuado para agregar sentimiento a nivel de lote o para priorizar comentarios que mezclan emociones, siempre que no se use para decisiones sensibles sobre personas.
- Interpretación de comandos en asistentes de voz: 60 comandos con un 84 % de acierto. La puntuación por candidato permite además activar una confirmación explícita cuando la confianza calibrada es baja.
- Reranking de respuestas candidatas en un sistema RAG: dado un contexto y una pregunta, el modelo puntúa cada respuesta generada por un LLM y su salida calibrada sirve para ordenar o descartar candidatos antes de mostrarlos.
- Etiquetado asistido en anotación de datos: la confianza calibrada permite separar automáticamente los ejemplos que un anotador humano debe revisar, reduciendo el coste de anotación en corpus con taxonomías grandes.
- Investigación en calibración y estimación de incertidumbre: sirve como *baseline* reproducible de un encoder pequeño con temperatura ajustada, para comparar contra clasificadores con cabeza softmax habitualmente sobreconfiados.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (`verified: false`), sobre 9.599 ejemplos de test no vistos:

| Tarea | Opciones | Acierto | Azar |
|---|---:|---:|---:|
| Mensajes de soporte bancario | 77 | 86 % | 1 % |
| Comandos de asistente de voz | 60 | 84 % | 2 % |
| Intenciones de atención al cliente | 151 | 83 % | 1 % |
| Lógica entre frases | 3 | 77 % | 33 % |
| Cláusulas de contratos legales | 100 | 76 % | 1 % |
| Emoción en un comentario | 28 | 62 % | 4 % |
| Lógica entre frases (casos disputados) | 3 | 53 % | 33 % |
| Preguntas de ciencias escolares | 4 | 35 % | 25 % |
| Preguntas de examen universitario | 4 | 28 % | 25 % |

Métricas globales declaradas:

| Métrica | Valor |
|---|---:|
| Accuracy (jev-bench, 9 fuentes) | 0,6379 |
| Calibrated NLL | 1,0351 |
| Calibrated ECE (10 bins) | 0,0525 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, y el propio autor desaconseja su uso en tareas que dependan de conocimiento del mundo: en preguntas de examen universitario el 28 % obtenido está por debajo del 25 % del azar más ruido, lo que el autor califica explícitamente como ausencia de señal.

## Requisitos de hardware

- Inferencia sobre el backbone ModernBERT-base (~149 M de parámetros congelados) más un adaptador de 6,5 MB: pesos en fp32 del orden de 0,6 GB y en fp16 del orden de 0,3 GB, más el consumo de activaciones. Cifras estimadas a partir del tamaño del backbone; el autor no publica requisitos de VRAM.
- Cabe sin problema en GPU de consumo: cualquier tarjeta con 4 GB o más de VRAM (por ejemplo, RTX 3050, RTX 3060, GTX 1650) es suficiente, y también es viable en CPU para volúmenes moderados.
- El cuello de botella real no es la memoria sino el número de opciones: se ejecuta una pasada completa del encoder por candidato, de modo que una lista de 151 opciones implica 151 *forward passes*. No se han publicado cifras de latencia ni de *throughput*.
- Entrenamiento: el autor reporta 114 minutos en una única H100 con un pico de 26,1 GiB para 6.171 pasos y 2 épocas, como referencia orientativa.
- Despliegue: no es compatible con `AutoModel` de `transformers`, por lo que no se puede servir directamente con vLLM, TGI, Ollama o llama.cpp, ni existen pesos GGUF. El único camino documentado es clonar el repositorio, instalar `torch` y `transformers` y usar la clase `Predictor` de `predict.py`. Cualquier integración en producción exige envolver ese código o reimplementar el bucle de puntuación y aplicar el factor de calibración 1,2023.
- Si se reimplementa el bucle de inferencia, hay que dividir las puntuaciones por 1,2023 antes del softmax; omitir este paso no cambia qué opción gana, pero sí hace que el modelo parezca más seguro de lo que es.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparables entre estas alternativas en la información proporcionada; la comparación es estructural.

| Modelo / enfoque | Parámetros | Contexto | Lista de etiquetas | Calibración | Licencia |
|---|---|---|---|---|---|
| modern-bert-jev | Backbone ~149 M congelado + 1,62 M entrenables | Entrada limitada a 512 tokens (truncado solo en el contexto) | Abierta, sin límite fijo; probada de 2 a 151 opciones | Calibrada (ECE 0,0525) | Apache 2.0 |
| `answerdotai/ModernBERT-base` con cabeza de clasificación propia | Backbone ~149 M, totalmente ajustable | La del backbone | Fija: una ranura por etiqueta | No calibrada por defecto | Apache 2.0 |
| Clasificador de encoder con cabeza softmax (arquitectura habitual del sector) | Del orden de 100-400 M | Variable según backbone | Fija | Habitualmente sobreconfiado; requiere técnicas de calibración posteriores | Depende del modelo |
| LLM de gran tamaño en modo *zero-shot* sobre las mismas listas | Miles de millones | Mucho mayor | Abierta | Variable y dependiente del prompt | Depende del modelo |
| Reranker tipo *cross-encoder* de recuperación de información | 100-500 M | Variable | No aplica (pares consulta-documento) | No disponible | Depende del modelo |

El dato diferencial verificable de este adaptador frente a un clasificador convencional es la calibración explícita (ECE 0,0525 con 10 bins) y el hecho de operar sobre listas abiertas, no sobre un vocabulario de etiquetas fijo. Frente a un LLM grande, la ventaja es el coste de hardware y la incertidumbre calibrada, y la desventaja es la ausencia total de conocimiento del mundo.

## Limitaciones y advertencias

- Conocimiento del mundo prácticamente nulo: en preguntas de examen universitario obtiene un 28 % frente al 25 % del azar. El autor lo señala como advertencia principal. No debe usarse para trivia, cultura general ni preguntas factuales.
- Solo inglés. Cualquier uso en castellano u otros idiomas no está soportado ni evaluado.
- Entrenado con una única semilla aleatoria: no hay barra de error ni estimación de varianza entre ejecuciones, por lo que las cifras reportadas deben interpretarse como un punto único.
- Contexto efectivo corto: el predictor consume 512 tokens y trunca únicamente el contexto, de modo que en la práctica lee unas 400 palabras iniciales y descarta el resto. En documentos largos, la información relevante puede quedar fuera de la ventana sin que el modelo lo advierta.
- Entrenamiento detenido antes de converger: el autor indica que la curva de entrenamiento seguía mejorando cuando se agotó el presupuesto, por lo que el rendimiento reportado es un suelo, no un techo, pero también un resultado no estabilizado.
- Coste lineal en el número de opciones: una lista de 151 categorías implica 151 pasadas del encoder. En escenarios de baja latencia o listas muy grandes, esto puede ser prohibitivo.
- Metadatos con `inference: false` y pipeline `multiple-choice`: el repositorio no expone una API estándar de inferencia y no carga con `AutoModel`. La integración exige usar el código del repositorio, lo que añade deuda de mantenimiento en producción.
- Riesgo de sobreconfianza si se ignora la calibración: el factor 1,2023 debe aplicarse explícitamente cuando se reimplementa el bucle de puntuación. Omitirlo no altera el orden de las opciones, pero sí infla la confianza declarada, lo que invalida cualquier umbral de derivación automática.
- Sesgos: la model card no incluye ninguna evaluación de sesgos demográficos, geográficos ni de dominio. El entrenamiento se realizó sobre jev-bench, un conjunto agregado de 9 fuentes, cuya composición detallada y cobertura no se documentan en la información disponible.
- Licencia Apache 2.0: permite uso comercial y modificación, pero al ser un adaptador sobre ModernBERT-base hay que respetar también la licencia del backbone, que es Apache 2.0.
- El repositorio no registra descargas ni *likes* y no hay tercera parte que haya replicado los resultados; las métricas son autoinformadas (`verified: false`).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ali-rehman-ML/modern-bert-jev
- Repositorio de código: https://github.com/ali-rehman-ML/modern-bert-jev
- Demo en Colab: https://colab.research.google.com/github/ali-rehman-ML/modern-bert-jev/blob/main/demo.ipynb
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Dataset de evaluación: https://huggingface.co/datasets/Praveenrajus/jev-bench
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los únicos enlaces recuperados correspondían a dominios de comercio electrónico sin relación con el proyecto. No se han localizado *papers*, blogs técnicos ni artículos de terceros.
