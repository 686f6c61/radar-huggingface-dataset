# laion/Alexandria-Gemma-4-12B-it-Qwen27-Summaries-LoRA-r64

## Resumen

Alexandria-Gemma-4-12B-it-Qwen27-Summaries-LoRA-r64 es un adaptador LoRA de rango 64 publicado por LAION el 10 de octubre de 2026 dentro del Project Alexandria. No es un modelo independiente: contiene matrices de adaptación que se cargan sobre el modelo base google/gemma-4-12B-it (revisión 707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7) y su objetivo es generar resúmenes científicos en una representación organizada que preserve hechos, condiciones experimentales, magnitudes y relaciones.

El problema que aborda es la reutilización del conocimiento contenido en artículos científicos reduciendo la dependencia de la prosa original. Para ello se destila el comportamiento de un profesor mayor (Qwen/Qwen3.8-27B-FP8) sobre un extractor más pequeño, de modo que un agente pueda recuperar unidades de conocimiento (Knowledge Units), responder preguntas a partir de sus campos y verificar la fuente mediante un identificador. El adaptador aprende la tarea de extracción; no incorpora una base de datos de conocimiento científico.

La relevancia actual del release está en su evaluación controlada: sobre el conjunto reservado de 97 artículos y 970 preguntas de opción múltiple, el adaptador alcanza un 87,94 % de precisión QA (853/970) frente al 87,63 % del base sin LoRA, una mejora de +0,31 puntos porcentuales con un intervalo pareado del 95 % de -5,36 a +5,46. El propio autor advierte que la comparación no fija la longitud del resumen y que la variante de rango 128 del mismo proyecto obtiene un 92,47 %.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Gemma 4 12B IT); rango 64, alpha 128, dropout 0,05, aplicado a proyecciones de atención q/k/v/o y a las proyecciones MLP gate/up/down |
| Parámetros totales | Adaptador: no disponible (tamaño del repo: 1,1 GB). Modelo base: aproximadamente 12 000 millones, según la nomenclatura de google/gemma-4-12B-it |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el adaptador se distribuye en safetensors y no se documentan cuantizaciones específicas |
| Idiomas soportados | Inglés (en) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Gemma 4 12B IT, un transformer decoder-only con plantilla nativa de canal de pensamiento (thought channel). La configuración LoRA usa rango 64, alpha 128 y dropout 0,05 sobre las proyecciones de atención q/k/v/o y las proyecciones MLP gate/up/down. El entrenamiento empleó AdamW con learning rate 2e-5, weight decay 0,01, 5 % de warmup y decaimiento coseno, base en BF16, gradient checkpointing, flex attention y cut cross entropy ponderada por tokens de asistente. El batch efectivo fue de ocho, los tokens de fuente y prompt quedaron enmascarados en la pérdida y no se aplicó truncado ni a la fuente ni al objetivo.

El conjunto de datos congelado es ChristophSchuhmann/scientific-summary-distillation-Qwen3.8-27B-865-20261004 (revisión 9f572fb367865b7eaf7dca37b5cb269558b84026), con 865 ejemplos procedentes de 865 artículos, una época y 109 actualizaciones del optimizador. La tarea es únicamente de generación de resúmenes científicos: no se entrenó ningún adaptador de revisión de calidad ni de corrección. La respuesta original generada solo a partir de la fuente y su razonamiento emitido se supervisaron con la plantilla nativa de pensamiento de Gemma; las respuestas corregidas no se emparejaron con razonamientos ajenos al generador. El conjunto de evaluación de 97 artículos y 970 preguntas quedó excluido del entrenamiento por identidad, título, hashes y solapamiento sustancial de texto.

## Capacidades

- Generación de resúmenes científicos estructurados que describen entidades, atributos y relaciones de un artículo, con el objetivo de preservar el conocimiento y reducir la reproducción de la expresión original.
- Extracción de unidades de conocimiento (Knowledge Units) con campos separables, por ejemplo intervención, dosis, efecto medido, población e incertidumbre, lo que permite distinguir un resultado medido de una interpretación.
- Generación en modo pensamiento (thinking) mediante la plantilla nativa de canal de pensamiento de Gemma, con el razonamiento emitido incluido en la salida supervisada.
- Producción de representaciones de longitud considerable: 3345 tokens de media en la narrativa nativa sobre las 97 ranuras de evaluación, con una media de 2198 palabras de resumen por artículo en esta variante.
- Soporte para un flujo de recuperación y respuesta posterior: un contestador fijo (Qwen2.5-7B-Instruct) recibe la representación generada y responde preguntas de cuatro opciones.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado como capacidad explícita del adaptador; el uso previsto es la generación de representaciones que un agente externo consume.
- Capacidades multilingües: no; el modelo declara únicamente inglés.
- Capacidades especiales: no se documentan visión, audio ni otras modalidades.

## Casos de uso

- Extracción de conocimiento para RAG científico: el adaptador transforma un artículo en un resumen organizado con entidades, atributos y relaciones que se pueden indexar y recuperar, reduciendo la necesidad de servir la prosa original en cada consulta.
- Construcción de bases de datos de unidades de conocimiento: cada unidad separa intervención, dosis, efecto, población e incertidumbre en campos independientes, lo que permite filtrar y agregar resultados medidos en lugar de interpretaciones.
- Respuesta a preguntas sobre literatura: la representación generada se entrega a un contestador que responde preguntas de opción múltiple, como demuestra la evaluación con Qwen2.5-7B-Instruct sobre 970 preguntas de 97 artículos.
- Revisión sistemática y triaje de literatura: el resumen estructurado permite clasificar y priorizar artículos antes de una lectura completa, con un coste de generación medido de 86,36 minutos para 97 artículos en una GH200.
- Verificación de afirmaciones con identificador de fuente: el flujo previsto permite seguir un identificador hasta el artículo original para comprobar un hecho concreto extraído por el modelo.
- Destilación de resúmenes a menor coste: al imitar a un profesor de 27B con un adaptador sobre un base de 12B, reduce el coste de producir representaciones a gran escala frente a ejecutar el profesor.
- Preprocesado para pipelines de agentes científicos: las representaciones estilo-agnósticas actúan como entrada compacta para etapas posteriores de síntesis o razonamiento sin exponer el texto íntegro.
- Punto de partida para ajuste posterior: el adaptador se puede cargar sobre el base fijado y continuar el entrenamiento con datos propios, dado que la receta, la configuración y la procedencia están publicadas.

## Benchmarks y rendimiento

Evaluación sobre el conjunto reservado Alexandria de 97 artículos y 970 preguntas de opción múltiple, con pensamiento activado. El contestador es un Qwen2.5-7B-Instruct fijo que nunca ve las preguntas durante la generación. Cada artículo aporta diez preguntas; las generaciones fallidas cuentan como diez respuestas incorrectas y las respuestas inválidas permanecen en el denominador. Los intervalos usan 10 000 remuestreos bootstrap pareados por artículo.

| Generador | Correctas / 970 | Precisión QA | Intervalo 95 % | Artículos fallidos | Palabras medias del resumen |
|---|---:|---:|---|---:|---:|
| Gemma 4 12B IT sin LoRA, pensamiento activado | 850 | 87,63 % | 85,26–89,90 % | 0 | 1070 |
| Gemma 4 12B IT rango 64, una época (este adaptador) | 853 | 87,94 % | 82,68–92,68 % | 7 | 2198 |
| Gemma 4 12B IT rango 128, una época | 897 | 92,47 % | 89,07–95,15 % | 2 | 2469 |

El valor declarado en el model-index es 87,9381443298969 % de precisión (métrica «Fixed Qwen2.5 QA accuracy (%)», marcada como no verificada). El autor indica que este adaptador mejora en +0,31 puntos porcentuales respecto al control base emparejado, con intervalo pareado del 95 % de -5,36 a +5,46, y señala que los resúmenes más largos y los fallos de formato afectan al resultado, sin que la comparación fije la longitud del resumen. La generación de las 97 ranuras tardó 86,36 minutos en una GH200 activa, a 491,7 tokens de finalización por segundo y GPU, incluyendo el pensamiento emitido y los reintentos de formato; el arranque del servidor, el entrenamiento y la QA quedan excluidos de esa medida.

## Requisitos de hardware

- Adaptador: 1,1 GB en safetensors, que se suman a los pesos del modelo base.
- Modelo base de 12 000 millones de parámetros: en BF16 los pesos ocupan del orden de 24 GB; en cuantización de 8 bits, alrededor de 12-13 GB, y en 4 bits, alrededor de 7-9 GB. Estas cifras son estimaciones por tamaño y no están confirmadas en la documentación del autor.
- Memoria adicional para caché KV y activaciones: depende de la longitud de contexto y del batch, datos no disponibles. Con salidas de 3345 tokens de media, la caché KV es un componente relevante del consumo.
- GPU recomendadas: la única medida publicada se obtuvo en una GH200. Para el base en BF16 son adecuadas GPU de 40-80 GB (A100 40/80 GB, H100, A100, L40S de 48 GB). El adaptador en sí no añade requisitos apreciables.
- GPU de consumo: no hay datos publicados. Por tamaño, un base cuantizado a 4 bits podría caber en tarjetas de 12-16 GB (RTX 4080, RTX 4090, RTX 5080), pero no está verificado por el autor.
- Opciones de despliegue: el autor no documenta un stack concreto. Al tratarse de un adaptador PEFT, las vías habituales son transformers con peft, vLLM con soporte de LoRA y TGI; para llama.cpp u Ollama sería necesario fusionar el adaptador con el base y convertir a GGUF. Ninguna de estas opciones está confirmada en la información disponible.
- Latencia y throughput: 491,7 tokens de finalización por segundo y GPU en una GH200 activa, con 86,36 minutos para 97 generaciones (incluyendo pensamiento y reintentos de formato).

## Comparativa con modelos similares

La comparación directa disponible es contra el propio base y contra otra variante del mismo proyecto, evaluadas bajo idéntico protocolo.

| Modelo | Parámetros | Contexto | Precisión QA (970 preguntas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Alexandria-Gemma-4-12B-it-Qwen27-Summaries-LoRA-r64 | LoRA r64 sobre base de ~12B | No disponible | 87,94 % (853/970) | cc-by-4.0 | HuggingFace, 0 descargas |
| Gemma 4 12B IT sin adaptador (control) | ~12B | No disponible | 87,63 % (850/970) | Según el modelo base | HuggingFace |
| Alexandria-Gemma-4-12B-it-Qwen27-Summaries-LoRA-r128 | LoRA r128 sobre base de ~12B | No disponible | 92,47 % (897/970) | cc-by-4.0 | HuggingFace |

No se dispone de datos publicados para comparar con otros adaptadores de extracción de conocimiento científico de terceros.

## Limitaciones y advertencias

- El propio autor declara que este release no certifica que sus salidas estén libres de derechos de autor: las auditorías de copia literal siguen encontrando solapamiento sustancial con las fuentes. El acceso a las fuentes, sus términos, la atribución y la revisión de salidas siguen siendo necesarios.
- La mejora de precisión de +0,31 puntos porcentuales respecto al base no es concluyente: el intervalo pareado del 95 % va de -5,36 a +5,46 y la comparación no fija la longitud del resumen.
- La variante de rango 64 genera resúmenes de 2198 palabras de media frente a las 1070 del base, y presentó 7 artículos fallidos frente a 0 del control. Los fallos de formato y las salidas inválidas penalizan la puntuación al permanecer en el denominador.
- La precisión QA mide utilidad para responder preguntas; no establece corrección factual completa ni autorización legal. Riesgo de alucinación en hechos, magnitudes y relaciones no presentes en el artículo fuente.
- El modelo solo declara inglés; no hay soporte multilingüe documentado.
- Solo se entrenó la tarea de generación de resúmenes: no hay adaptador de revisión de calidad ni de corrección, por lo que los errores del generador no se filtran en esta release.
- El adaptador no incorpora una base de datos de conocimiento científico; depende de los artículos que recibe como entrada.
- El resultado de la evaluación está marcado como no verificado (verified: false) en el model-index.
- Licencia cc-by-4.0: permite uso comercial con atribución, pero no cubre los derechos sobre los textos científicos de entrada ni sobre las salidas que reproduzcan su expresión.
- Al ser un adaptador, requiere cargar exactamente el base fijado (google/gemma-4-12B-it, revisión 707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7); su comportamiento con otras revisiones no está garantizado.
- Sin descargas ni likes en el momento de la consulta, y publicada el 9 de octubre de 2026 con actualización al día siguiente: no hay evidencia de uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/laion/Alexandria-Gemma-4-12B-it-Qwen27-Summaries-LoRA-r64
- Modelo base: https://huggingface.co/google/gemma-4-12B-it (revisión 707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7)
- Profesor (teacher): https://huggingface.co/Qwen/Qwen3.8-27B-FP8 (revisión 017b9c7af6b5689d5dd426a76e0bc077eb5ca20a)
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/ChristophSchuhmann/scientific-summary-distillation-Qwen3.8-27B-865-20261004 (revisión 9f572fb367865b7eaf7dca37b5cb269558b84026)
- Artículo del Project Alexandria: https://arxiv.org/abs/2502.19413v2
- Configuración de entrenamiento: training_config.json (en el repositorio del modelo)
- Manifiesto de datos: training/manifest.json (en el repositorio del modelo)
- Procedencia de pesos y código: provenance.json (en el repositorio del modelo)
