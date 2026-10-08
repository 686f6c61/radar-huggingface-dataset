# hravi/laya-finance

## Resumen

Laya-Finance es un modelo de clasificación de texto financiero desarrollado por el usuario hravi, afinado a partir de Laya (convaiinnovations/laya), un "decision encoder" basado en ModernBERT-large. El modelo no genera texto: formula cualquier pregunta de elección múltiple sobre un texto financiero y devuelve una distribución de probabilidad sobre un conjunto de etiquetas que el usuario define en la llamada (sentimiento, tema, tono de banco central, dirección de titular, terminología financiera o estilo de trading, entre otras).

Con 421.293.830 parámetros y un repositorio de 0,8 GB, es un modelo compacto pensado para ejecutarse en hardware modesto: el autor reporta latencias de 5 a 32 ms por elemento en una GPU integrada, frente a los 2-3 segundos por elemento de un LLM generativo en modo zero-shot. Esa relación entre coste y precisión es su principal argumento, ya que supera a FinBERT en los tres conjuntos de sentimiento evaluados y mejora de forma notable al Laya original en todas las tareas específicas de finanzas.

Su relevancia actual es doble: por un lado, demuestra que un encoder pequeño afinado puede competir con LLM grandes en tareas de clasificación financiera cerradas; por otro, arrastra una restricción de licencia importante (educational-use-only), derivada de los términos de parte de los datos de entrenamiento, que impide el uso comercial. El propio autor lo describe como un checkpoint preliminar, con una versión mejorada planificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (decision encoder) basado en ModernBERT-large |
| Parametros totales | 421.293.830 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el autor indica que trabaja con pasajes cortos, de unos cientos de palabras como maximo) |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos en safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | educational-use-only (campo `license: other` con `LICENSE` propio); el Laya original es Apache-2.0 |
| Formato de pesos | safetensors (libreria `laya`) |

## Arquitectura y entrenamiento

Laya-Finance hereda la arquitectura de Laya, descrito por el autor como un "ModernBERT-large decision encoder". Se trata, por tanto, de un transformer encoder-only orientado a decisión y no a generación: en lugar de producir tokens, recibe un texto y una pregunta de elección múltiple con sus criterios y devuelve una probabilidad por cada etiqueta. La interfaz expone `predict_batch` con una estructura de pregunta que incluye `type: "choice"`, `instructions` y un diccionario `criteria`; el orden de ese diccionario define el índice de cada etiqueta, por lo que debe permanecer fijo. No se han publicado detalles sobre número de tokens de entrenamiento, composición exacta del dataset ni uso de RLHF o DPO.

El ajuste se realizó sobre datasets financieros públicos más un corpus privado, cubriendo seis familias de tarea: sentimiento, tema, tono de banco central, dirección de titular, terminología financiera y enfoque de trading. El propio autor advierte que es un checkpoint preliminar y que las etiquetas de test de terminología y de enfoque de trading fueron generadas y verificadas por modelos de lenguaje potentes, no por anotadores humanos, por lo que esas dos filas deben interpretarse como indicativas. La restricción de licencia a uso educativo proviene de los términos de parte de los datos de entrenamiento, no del modelo base.

## Capacidades

- Clasificación de sentimiento financiero en tres dominios: frases (PhraseBank), Twitter y FiQA, con precisión de 0,905, 0,881 y 0,674 respectivamente.
- Clasificación temática de textos financieros (accuracy 0,853).
- Detección de dirección de titulares financieros, es decir, si el titular apunta a subida o bajada (accuracy 0,948).
- Clasificación del tono o postura de un banco central (accuracy 0,653).
- Reconocimiento de terminología financiera específica del dominio (accuracy 0,824).
- Clasificación de enfoque o estilo de trading (accuracy 0,781).
- Respuesta a preguntas de elección múltiple arbitrarias sobre un texto financiero, siempre que se definan `instructions` y `criteria`; el rendimiento óptimo se da con los conjuntos de etiquetas con los que fue afinado.
- Procesamiento por lotes mediante `predict_batch` y salida de probabilidades por etiqueta (no solo la clase ganadora).
- Capacidades que NO tiene: no genera texto libre, no soporta tool calling ni function calling, no implementa agentes ni razonamiento multi-paso, no procesa visión ni audio y no es multilingüe (solo inglés).

## Casos de uso

- Analisis de sentimiento de noticias financieras en tiempo real: ingestar titulares y notas de prensa, pedir al modelo la etiqueta `bearish`/`neutral`/`bullish` y agregar la señal por sector o por valor. Es adecuado porque la tarea de dirección de titular alcanza 0,948 de accuracy y la latencia de 5-32 ms permite procesar miles de documentos por minuto en una sola GPU integrada.
- Clasificacion de tono de bancos centrales: etiquetar comunicados y actas del banco central como hawkish, dovish o neutral para construir series temporales de postura monetaria. El modelo es específico para esta tarea (0,653), aunque conviene saber que un LLM zero-shot lo supera ligeramente (0,680).
- Etiquetado masivo de corpus de redes sociales financieras: clasificar tuits y comentarios de foros con la etiqueta de sentimiento en dominio Twitter (0,881), donde FinBERT apenas llega a 0,725. Útil para construir datasets etiquetados a bajo coste antes de entrenar modelos propios.
- Organizacion y enrutado tematico de documentacion financiera: con 0,853 de accuracy en clasificación de tema, se puede usar como primer eslabón de un pipeline RAG para decidir a qué índice o base de datos documental enviar cada fragmento.
- Normalizacion de terminologia en herramientas de analisis: etiquetar si un fragmento contiene jerga financiera específica del dominio (0,824) para activar glosarios, resaltados o explicaciones automáticas en un terminal financiero.
- Clasificacion de estrategias y estilo de trading: etiquetar descripciones de estrategias o comentarios de gestores según enfoque (0,781) para segmentar research o construir taxonomías de estilos.
- Pre-filtro economico antes de un LLM grande: usar Laya-Finance como clasificador rápido (5-32 ms por elemento) y reservar llamadas a un LLM generativo (2-3 s por elemento) solo para los casos ambiguos o de baja confianza, reduciendo de forma drástica el coste de inferencia de un pipeline de análisis financiero.
- Investigacion academica en NLP financiero: al ser un checkpoint educativo con licencia no comercial y benchmarks publicados, sirve como baseline reproducible frente a FinBERT o a LLM zero-shot en estudios comparativos.

## Benchmarks y rendimiento

Precisión sobre test reservado, fp32, una pasada forward por elemento, según los datos publicados por el autor. La columna de Laya-Finance corresponde a una única ejecución de entrenamiento.

| Tarea | ProsusAI/finbert | Laya (original, zero-shot) | Laya-Finance | gpt-oss-20b (zero-shot) |
|---|---|---|---|---|
| Sentimiento, PhraseBank | 0,893 | 0,879 | **0,905** | 0,812 |
| Sentimiento, Twitter | 0,725 | 0,767 | **0,881** | 0,740 |
| Sentimiento, FiQA | 0,472 | 0,528 | 0,674 | **0,824** |
| Tema | n/a | 0,477 | **0,853** | 0,652 |
| Dirección de titular | n/a | 0,758 | **0,948** | 0,784 |
| Tono de banco central | n/a | 0,458 | 0,653 | **0,680** |
| Terminología financiera (dominio) | n/a | 0,604 | 0,824 | **0,834** |
| Enfoque de trading (estilo) | n/a | 0,442 | **0,781** | 0,728 |

Notas del autor: FinBERT solo soporta sentimiento, de ahí las celdas "n/a". En macro-F1 sobre enfoque de trading el LLM zero-shot también va por delante (0,670 frente a 0,627), porque Laya-Finance es más débil en las clases más raras. Las diferencias de aproximadamente un punto están dentro del ruido de una única ejecución.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, unos 1,7 GB solo de pesos (421 M de parámetros); en bf16/fp16, unos 0,85 GB, coherente con los 0,8 GB del repositorio; en int8, aproximadamente 0,45 GB. Añadir un margen para activaciones y lote, que en un encoder de este tamaño es reducido.
- GPU recomendadas: cualquiera con al menos 2-4 GB de VRAM libre. El autor reporta ejecución en una GPU integrada, por lo que no se requieren A100, H100 ni RTX 4090; una RTX 3060 o superior sobra para lotes grandes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo actual e incluso en iGPU. También es viable en CPU para volúmenes moderados.
- Opciones de despliegue: la librería `laya` (carga con `laya.load("hravi/laya-finance")` y `predict_batch`). No se documenta soporte para vLLM, TGI, llama.cpp u Ollama, y en principio no aplican, al tratarse de un encoder de clasificación y no de un modelo generativo.
- Latencia y throughput: 5 a 32 ms por elemento en GPU integrada, en fp32, frente a 2-3 s por elemento de un LLM zero-shot. El throughput exacto en tarjetas dedicadas no está publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tareas soportadas | Rendimiento destacado |
|---|---|---|---|---|---|
| Laya-Finance (hravi) | 421.293.830 | No disponible | educational-use-only (uso no comercial) | Sentimiento, tema, tono de banco central, titular, terminología, estilo | Mejor en sentimiento Twitter (0,881) y dirección de titular (0,948) |
| ProsusAI/finbert | No disponible | No disponible | No disponible | Solo sentimiento | 0,893 en PhraseBank, 0,725 en Twitter, 0,472 en FiQA |
| Laya (convaiinnovations, original) | No disponible | No disponible | Apache-2.0 | Decision encoder zero-shot multi-tarea | 0,879 en PhraseBank, 0,758 en titular |
| gpt-oss-20b (zero-shot) | No disponible | No disponible | No disponible | Generativa generalista | Mejor en FiQA (0,824), tono de banco central (0,680) y terminología (0,834) |

Frente a FinBERT, Laya-Finance gana en las tres tareas de sentimiento, aunque el autor matiza que PhraseBank es la comparación justa porque FinBERT se entrenó con ese conjunto, y que parte de la ventaja en Twitter y FiQA proviene de datos de entrenamiento en dominio que FinBERT nunca vio. Frente al Laya original zero-shot, la mejora es sistemática en todas las tareas. Frente a gpt-oss-20b, pierde en FiQA, tono de banco central y terminología, pero gana en dirección de titular, tema y sentimiento de Twitter, y lo hace con un coste de inferencia entre dos y tres órdenes de magnitud menor.

## Limitaciones y advertencias

- Solo inglés. No hay soporte multilingüe, por lo que textos en castellano u otros idiomas no deben usarse sin validación.
- Textos cortos: el autor indica pasajes de unos cientos de palabras como máximo. La longitud de contexto exacta no está publicada.
- Licencia educational-use-only, no comercial. La restricción proviene de los términos de parte de los datos de entrenamiento, no del modelo base Laya, que sigue siendo Apache-2.0. Cualquier despliegue en producción con fines comerciales queda excluido.
- Riesgo de alucinación conceptual: al ser un clasificador, no "alucina" texto, pero sí puede asignar etiquetas con alta confianza a entradas fuera de dominio. Calibrar umbrales de confianza antes de automatizar decisiones.
- Resultados de una única ejecución de entrenamiento: el autor advierte que diferencias de aproximadamente un punto están dentro del ruido y no deben interpretarse como mejoras reales.
- Las etiquetas de test de terminología financiera y enfoque de trading no fueron validadas por anotadores humanos, sino generadas y verificadas por modelos de lenguaje; esas dos filas son indicativas.
- Debilidad en clases raras: en macro-F1 de enfoque de trading el modelo queda por detrás del LLM zero-shot (0,627 frente a 0,670).
- Checkpoint preliminar: el autor anuncia una versión mejorada, por lo que la actual puede quedar obsoleta.
- El orden del diccionario `criteria` define el índice de las etiquetas. Alterarlo invalida silenciosamente las predicciones.
- El modelo no ofrece asesoramiento financiero ni mejora rendimientos de trading; el autor lo declara explícitamente.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validación independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hravi/laya-finance
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Repositorio de Laya (codigo original, Apache-2.0): https://github.com/NandhaKishorM/laya
- Licencia del modelo: LICENSE (referenciado en la model card, uso educativo)
- Resultados de busqueda web: no se han encontrado enlaces relevantes; las consultas devolvieron unicamente resultados no relacionados con el modelo.
