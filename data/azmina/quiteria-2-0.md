# azmina/quiteria-2.0

## Resumen

Quiteria 2.0 es un repositorio de HuggingFace publicado por el usuario azmina que agrupa dos modelos BERT independientes de clasificación de texto en portugués. El primero, alojado en la subcarpeta `tema`, realiza clasificación de temas en 10 clases; el segundo, en la subcarpeta `favorabilidade`, realiza una clasificación binaria de favorabilidad (orientación positiva o negativa) sobre textos en portugués. Ambos comparten repositorio únicamente para simplificar la distribución y el versionado, según indica la propia model card.

El modelo resuelve tareas discriminativas de PLN, no generativas: se trata de encoders tipo transformer con una cabeza de clasificación de secuencias, entrenados para producir una etiqueta por documento. Esto lo sitúa en la categoría de modelos de análisis (sentimiento, tematización, enrutado), no en la de asistentes conversacionales, agentes o generación de código.

Su relevancia actual es limitada pero concreta: cubre una necesidad recurrente y poco servida, la clasificación temática y de favorabilidad en portugués con dos cabezas especializadas y separadas. Sin embargo, el repositorio no publica número de parámetros, longitud de contexto, licencia, composición del dataset de entrenamiento ni resultados de benchmarks, y acumula 0 descargas y 0 likes. Es, por tanto, un artefacto a validar antes de cualquier uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer) con cabeza de clasificación de secuencias (`AutoModelForSequenceClassification`); dos submodelos independientes |
| Parametros totales | no disponible (el autor no los publica; el tamaño del repositorio, 0,9 GB para dos submodelos, es compatible con encoders del orden de 110 M de parámetros en precisión completa, pero es una inferencia no confirmada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la model card no indica `max_position_embeddings`; en arquitecturas BERT lo habitual es 512 tokens, dato no confirmado para este modelo) |
| Tipos de cuantizacion | no disponible (no se publican artefactos cuantizados; solo pesos `safetensors` en la precisión original) |
| Idiomas soportados | portugués (`pt`) |
| Licencia | no disponible (no se especifica licencia, lo que implica ausencia de permisos explícitos de uso) |
| Formato de pesos | safetensors, acompañado de `tokenizer.json` y `tokenizer_config.json` por subcarpeta; no hay GGUF, ONNX ni TensorRT publicados |

## Arquitectura y entrenamiento

La arquitectura declarada es BERT, un encoder transformer bidireccional con atención completa, adaptado a clasificación de texto mediante una cabeza lineal sobre la representación del token especial `[CLS]`. El repositorio contiene dos modelos entrenados de forma separada, cada uno con su propio `config.json`, `model.safetensors` y tokenizer. El submodelo `tema` produce 10 clases (`LABEL_0` a `LABEL_9`); el submodelo `favorabilidade` produce 2 clases. La carga requiere el argumento `subfolder` de la librería `transformers`.

No se dispone de información sobre el procedimiento de entrenamiento: no se indica el número de tokens, la composición del dataset, si hubo ajuste fino desde un checkpoint preentrenado (por ejemplo BERTimbau o un BERT multilingüe), ni si se aplicaron técnicas de regularización, balanceo de clases o *data augmentation*. Tampoco se documenta si hubo fases de RLHF, DPO o ajuste por instrucciones, algo por otra parte inaplicable a un modelo discriminativo de este tipo. No se declara ninguna innovación técnica (decodificación especulativa, atención lineal, destilación o poda).

Un detalle operativo relevante documentado por el autor: los nombres semánticos de las clases no se incluyeron en los artefactos entregados. El modelo de temas devuelve etiquetas genéricas y el de favorabilidad devuelve índices, de modo que es imprescindible recuperar el mapeo usado durante el entrenamiento para interpretar correctamente las salidas. Esa información no acompaña al repositorio.

## Capacidades

- Clasificación de temas en portugués en un esquema cerrado de 10 clases (etiquetadas como `LABEL_0` a `LABEL_9`).
- Clasificación binaria de favorabilidad (orientación favorable o desfavorable) en portugués.
- Procesamiento de una etiqueta por documento, con puntuaciones de probabilidad por clase a través del pipeline `text-classification`.
- Ejecución en CPU o GPU indistintamente, dado el tamaño reducido típico de los encoders BERT.
- Integración directa con la librería `transformers` (`AutoTokenizer`, `AutoModelForSequenceClassification`, `pipeline`).
- No soporta generación de texto, razonamiento multi-paso, matemáticas, código, visión, audio ni *thinking mode*.
- No soporta *tool calling* ni *function calling*: es un clasificador, no un modelo de lenguaje generativo.
- No soporta uso como agente ni planificación de tareas.
- Cobertura multilingüe: únicamente portugués, según la etiqueta de idioma declarada.

## Casos de uso

- Enrutado automático de tickets de soporte: el submodelo `tema` asigna cada ticket entrante a una de las 10 categorías, lo que permite dirigirlo al equipo correspondiente sin intervención humana y reducir el tiempo de primera respuesta. Es adecuado por ser una tarea de clasificación pura, con latencia baja y coste de inferencia mínimo.
- Análisis de sentimiento en reseñas de producto: el submodelo `favorabilidade` clasifica cada reseña como favorable o desfavorable, alimentando cuadros de mando de satisfacción y alertas tempranas ante picos de opiniones negativas en portugués.
- Monitorización de medios y clipping de prensa: combinando ambos submodelos, se puede etiquetar cada noticia por temática y por tono hacia una marca o figura pública, generando informes diarios de cobertura en medios lusófonos.
- Moderación de comentarios en comunidades en portugués: uso de `favorabilidade` como primera capa de filtrado para priorizar la revisión humana de los comentarios con tono más negativo, reduciendo la carga de moderación.
- Etiquetado automático para sistemas de recomendación y SEO: asignar temas a artículos, vídeos o fichas de producto permite construir taxonomías y similitudes entre contenidos sin anotación manual.
- Análisis de encuestas abiertas y NPS: clasificar respuestas de texto libre por tema y por favorabilidad para cuantificar motivos de insatisfacción a partir de comentarios cualitativos.
- Triaje previo en asistentes conversacionales: usar la salida de `tema` como señal de intención antes de derivar la conversación a un modelo generativo o a un flujo predefinido, abaratando el coste por interacción.
- Línea base en investigación de PLN para portugués: sirve como referencia reproducible frente a la que comparar modelos más grandes en tareas de clasificación temática y de sentimiento, siempre que se documente el mapeo de etiquetas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas de ningún tipo (exactitud, F1, precisión, recall) ni sobre conjuntos públicos ni sobre un conjunto de validación propio. Tampoco se compara con otros modelos. Además, la ausencia de nombres semánticos de clase hace que ni siquiera sea posible reproducir una evaluación estándar sin recuperar previamente el mapeo del entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma confirmada. Asumiendo un encoder del orden de 110 M de parámetros (inferencia no confirmada a partir del tamaño del repositorio, 0,9 GB para dos submodelos), el consumo sería aproximadamente 0,4-0,5 GB en fp32 y 0,2-0,3 GB en fp16 por submodelo, más el *overhead* del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente en el escenario anterior; una NVIDIA T4, L4, RTX 3060 o superior no tendría ninguna dificultad. No se requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU de consumo de los últimos años, e incluso en CPU con latencias aceptables para volúmenes moderados.
- Opciones de despliegue: `transformers` con PyTorch (vía documentada por el autor), y de forma indirecta cualquier servidor compatible con ese formato, como TorchServe, FastAPI con `transformers`, o Text Generation Inference descartado por no ser generativo. No hay artefactos GGUF, por lo que llama.cpp y Ollama no son utilizables sin una conversión previa no documentada.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de latencia ni de tokens por segundo (concepto poco aplicable a un clasificador; debería hablarse de documentos por segundo, dato igualmente ausente).
- Nota de despliegue: al tratarse de dos submodelos en un mismo repositorio, hay que invocar `from_pretrained` con `subfolder="tema"` o `subfolder="favorabilidade"`. El *widget* de inferencia automática del Hub no funcionará correctamente porque espera un único modelo en la raíz.

## Comparativa con modelos similares

No se dispone de parámetros, contexto, licencia ni métricas de Quiteria 2.0, y la búsqueda web realizada no aportó información técnica sobre alternativas contrastables con estos artefactos. La comparación cuantitativa no es posible con los datos proporcionados.

| Modelo | Categoria | Idiomas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| azmina/quiteria-2.0 | BERT de clasificación | Portugués | 10 clases de tema + 2 de favorabilidad | no disponible | HuggingFace, 0 descargas |
| Encoders BERT preentrenados en portugués (por ejemplo BERTimbau) | BERT de clasificación | Portugués | Ajustables a cualquier tarea de clasificación | no disponible en esta búsqueda | Modelos ampliamente utilizados como punto de partida |
| Encoders multilingües tipo XLM-R | Transformer multilingüe | Multilingüe (incluye portugués) | Ajustables a clasificación y etiquetado | no disponible en esta búsqueda | Amplia disponibilidad |

La diferencia funcional relevante es que Quiteria 2.0 ofrece cabezas ya entrenadas para dos tareas concretas en portugués, mientras que las alternativas citadas requerirían un ajuste fino propio. A cambio, Quiteria 2.0 no documenta ni licencia, ni datos de entrenamiento, ni métricas, lo que dificulta justificar su elección frente a reentrenar un encoder conocido sobre datos propios.

## Limitaciones y advertencias

- Licencia no especificada: al no declararse licencia, no se concede ningún permiso explícito de uso, incluido el comercial. Cualquier explotación en producción requiere contactar con el autor o asumir el riesgo legal.
- Ausencia total de métricas: no hay exactitud, F1 ni ningún otro indicador. No se puede afirmar que el modelo funcione mejor que el azar en el dominio de destino.
- Mapeo de etiquetas ausente: el modelo de temas devuelve `LABEL_0` a `LABEL_9` y el de favorabilidad devuelve índices, sin nombres semánticos. Sin el mapeo del entrenamiento, las salidas son ininterpretables.
- Sesgos desconocidos: la model card reconoce explícitamente que el desempeño, los sesgos y las limitaciones dependen de unos datos y un procedimiento de entrenamiento que no acompañan a los artefactos. No hay ninguna evaluación de sesgo.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones confiadas y erróneas fuera de la distribución de entrenamiento, incluida la asignación de una clase temática a textos que no pertenecen a ninguna de las 10 categorías.
- Limitación de idioma: solo portugués. El comportamiento con texto en otros idiomas, o con mezcla de idiomas, es impredecible y no está documentado.
- Limitación de contexto: no se publica la longitud máxima de entrada; si se asume el valor habitual de 512 tokens de BERT, los documentos largos requerirían truncado o segmentación, con posible pérdida de información.
- Repositorio sin tracción: 0 descargas y 0 likes, sin historial de uso verificable por terceros. Las fechas declaradas de creación y actualización (14 de septiembre de 2026) resultan anómalas y no permiten situar el modelo en un ciclo de mantenimiento real.
- Sin garantía de mantenimiento: no hay repositorio de código, paper ni canal de soporte asociado. Es probable que no haya correcciones ni versiones futuras.
- Recomendación para producción: tratar los dos submodelos como prototipos. Antes de desplegarlos, construir un conjunto de validación propio y anotado, medir F1 por clase y por submodelo, verificar el desbalance de clases y documentar el mapeo de etiquetas. Si el rendimiento no supera a un encoder preentrenado en portugués ajustado con datos propios, la opción razonable es descartar estos artefactos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/azmina/quiteria-2.0
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo. Los únicos enlaces recuperados corresponden al sitio de juegos educativos Blooket (blooket.com, play.blooket.com, id.blooket.com, solo.blooket.com) y no guardan relación alguna con Quiteria 2.0 ni con clasificación de texto en portugués.
- No se han encontrado paper, blog técnico, repositorio de código ni demo asociados al modelo.
