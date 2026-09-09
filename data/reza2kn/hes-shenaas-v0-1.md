# Reza2kn/Hes-Shenaas-v0.1

## Resumen

Hes-Shenaas v0.1 es un modelo de clasificación de emociones para texto persa, desarrollado por Reza2kn y publicado en Hugging Face. Parte de `FacebookAI/xlm-roberta-large`, un clasificador encoder-only de 559.897.607 parámetros, y ha sido afinado para predecir siete etiquetas emocionales: `ANGRY`, `FEAR`, `HAPPY`, `HATE`, `SAD`, `SURPRISE` y `OTHER`.

El objetivo es cubrir la ausencia de clasificadores de emociones robustos para persa en contextos informales, especialmente redes sociales. El modelo se entrena con 8.471 filas, que combinan 4.862 filas limpiadas originales con 3.609 tweets públicos persas etiquetados de forma automática mediante dos pasadas de un modelo Gemini. El checkpoint se seleccionó por máxima exactitud en validación y alcanza un 77,58 % de exactitud en un conjunto de test de 1.151 ejemplos. Es relevante para prototipos de análisis de sentimiento, moderación de contenido y estudios de opinión en persa, si bien su ventana de entrada se trunca a 128 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only basado en XLM-RoBERTa large |
| Parametros totales | 559.897.607 |
| Parametros activos | No procede (no es MoE) |
| Longitud de contexto | No disponible; en esta implementacion las entradas se truncan a 128 tokens |
| Tipos de cuantizacion | No disponible; no se publican cuantizaciones GGUF u otras |
| Idiomas soportados | Persa (fa). El modelo base es multilingue, pero el checkpoint esta afinado solo para persa |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder Transformer de tipo XLM-RoBERTa large, con 559,9 millones de parametros. Es un modelo de clasificacion de secuencias, no un modelo generativo, por lo que no tiene decodificador ni soporta generacion de texto, tool calling o agentes. Su tarea es producir una distribucion de probabilidad sobre siete clases de emocion.

El entrenamiento se realizo sobre 8.471 filas de entrenamiento. De ellas, 4.862 filas corresponden al conjunto original limpio y 3.609 son tweets publicos en persa anadidos al dataset. Para las filas anadidas se utilizaron etiquetas generadas por Gemini 3.8 Flash, aceptadas solo cuando dos pasadas coincidian y marcaban el texto como autocontenido, persa natural, con evidencia textual exacta y una confianza minima de 0,85. Las etiquetas de Gemini se usaron unicamente para entrenamiento, y los textos de validacion y test quedaron excluidos de las llamadas a la API. El checkpoint final se selecciono por maxima exactitud en validacion, con un criterio de "epoch anterior" en caso de empate; la epoch seleccionada fue la 5.

## Capacidades

- Clasificacion de emociones en texto corto persa, incluyendo ira, miedo, felicidad, odio, tristeza, sorpresa y otros.
- Salida de probabilidades completas por clase mediante `top_k=None`.
- Adecuado para lenguaje informal de redes sociales, aunque tambien puede procesar otros tipos de texto persa.
- Hereda capacidades multilingues del modelo base XLM-RoBERTa, pero este checkpoint solo ha sido afinado y validado para persa.
- No soporta generacion de texto, tool calling, agentes, vision ni audio.
- No es un modelo de embedding; su pipeline nativo es `text-classification`.

## Casos de uso

- Analisis de emociones en redes sociales persas: el modelo clasifica tweets y publicaciones cortas en siete emociones, lo que permite monitorizar reacciones publicas ante noticias o campanas y detectar picos de ira u odio. Su truncamiento a 128 tokens es suficiente para publicaciones informales.
- Opinion mining de productos y servicios: en un flujo de comentarios de clientes persas, el modelo etiqueta emociones como felicidad, tristeza o enfado, facilitando priorizar quejas y medir satisfaccion de forma automatizada.
- Moderacion asistida de comunidades: la etiqueta `HATE` permite marcar mensajes para revision humana, y `ANGRY` puede servir para detectar discursos hostiles o conflictos en foros y redes.
- Analisis de respuestas abiertas en encuestas: el modelo clasifica respuestas cortas en persa para agrupar feedback por emocion y detectar sorpresa o miedo ante cambios, complementando analisis cuantitativos.
- Prototipos de asistentes conversacionales empaticos: como clasificador previo, detecta la emocion del usuario y permite al bot adaptar su tono en sistemas de atencion al cliente de bajo riesgo.
- Investigacion en procesamiento de lenguaje natural persa: sirve para etiquetar corpus de textos cortos persas, por ejemplo tweets, y estudiar la distribucion de emociones en registros informales sin depender de anotadores humanos.

## Benchmarks y rendimiento

Los resultados publicados por el autor corresponden a un benchmark propio fijo para emociones en persa. El checkpoint se selecciono sobre una particion de validacion de 1.232 ejemplos y luego se evaluo en un test protegido de 1.151 ejemplos.

| Particion | Ejemplos | Exactitud | Macro F1 | F1 ponderado |
|---|---:|---:|---:|---:|
| Validacion | 1.232 | 73,94 % | 75,05 % | 73,76 % |
| Test | 1.151 | 77,58 % | 76,27 % | 77,64 % |

F1 por clase en el conjunto de test:

| ANGRY | FEAR | HAPPY | HATE | SAD | SURPRISE | OTHER |
|---:|---:|---:|---:|---:|---:|---:|
| 68,47 % | 81,03 % | 86,04 % | 70,83 % | 79,77 % | 72,66 % | 75,11 % |

El autor advierte de que estos numeros describen el benchmark congelado del proyecto y no deben asumirse como transferibles a otros dominios sin re-evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: alrededor de 2,2 GB; en FP16, alrededor de 1,1 GB. El repositorio publica pesos de 2,3 GB en safetensors, lo que es consistente con precision FP32, aunque la ficha no indica la precision de los pesos.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM es suficiente para inferencia en FP16, por ejemplo RTX 3050, RTX 2060 o superiores. Tambien es viable la inferencia por CPU con 8 GB de RAM.
- Cabe en GPU de consumo.
- Opciones de despliegue: `transformers.pipeline` con el pipeline `text-classification` y Hugging Face Inference Endpoints. Al ser un modelo encoder-only, no se aplican de forma directa herramientas orientadas a modelado generativo como llama.cpp, Ollama o vLLM.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. En la informacion proporcionada no se identifican otros clasificadores de emociones persas de la misma categoria con datos comparables de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos especificos, pero al estar entrenado con tweets publicos persas y etiquetas generadas por un LLM puede heredar sesgos del contenido y del anotador automatico.
- Riesgo de error de clasificacion: la emocion es subjetiva y el rendimiento puede variar en texto formal, code-switching, dialectos, sarcasmo o dominios distintos a los datos de evaluacion.
- El modelo trunca las entradas a 128 tokens, por lo que no es adecuado para documentos largos.
- La etiqueta `OTHER` combina casos neutros y ambiguos, lo que reduce la granularidad del modelo.
- No debe usarse como unica base para decisiones de alto impacto sobre personas, como evaluaciones clinicas, legales o de credito.
- La licencia no esta declarada en la ficha del modelo, por lo que el uso comercial debe verificarse previamente con el autor. Sin una licencia explicita, la redistribucion y el uso en produccion estan sujetos a ambiguedad legal.
- Los resultados de benchmark estan ligados a un dataset propio y congelado; no hay garantia de transferencia a otros corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Reza2kn/Hes-Shenaas-v0.1
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Autor en Hugging Face: https://huggingface.co/Reza2kn
- GitHub del autor: https://github.com/Reza2kn
