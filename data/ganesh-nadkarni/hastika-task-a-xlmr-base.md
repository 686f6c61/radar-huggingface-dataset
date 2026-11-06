# Ganesh-Nadkarni/hastika-task-a-xlmr-base

## Resumen

`hastika-task-a-xlmr-base` es un ajuste fino de `FacebookAI/xlm-roberta-base` para deteccion binaria de discurso de odio (Non-Hate / Hate) en comentarios de YouTube con mezcla de codigos kannada-ingles (kanglish). Lo desarrolla Ganesh-Nadkarni como componente para la tarea A del shared task HASTIKA en ICON-2026. El modelo resuelve un problema concreto de moderacion de contenido en un dominio linguistico poco cubierto por los modelos multilingues genericos: texto code-mixed con transliteracion romanizada del kannada.

Arquitectura transformer encoder (XLM-RoBERTa base), con aproximadamente 278 millones de parametros y una longitud de contexto nativa de 512 tokens, aunque el ajuste fino se realizo con longitud maxima de 160 tokens. El checkpoint se publica como un clasificador de secuencia de dos etiquetas, no como modelo generativo.

Su relevancia es acotada pero clara: se trata de un checkpoint especializado y de investigacion, pensado para integrarse en un ensemble junto con MuRIL, otro XLM-RoBERTa y un SVM calibrado con TF-IDF. Por si solo obtiene un macro-F1 de 0,791 en su split de validacion retenido, inferior al 0,8162 del ensemble en validacion y al 0,7963 en el conjunto de test oficial. No es un modelo de proposito general ni un sustituto de un sistema de moderacion completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base), clasificacion de secuencia |
| Parametros totales | Aproximadamente 278 M (xlm-roberta-base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens nativos; entrenado con longitud maxima de 160 |
| Tipos de cuantizacion | No disponible (compatible con cuantizacion estandar de transformers, no documentada por el autor) |
| Idiomas soportados | Kannada (kn) e ingles (en), incluyendo texto code-mixed y transliterado (kanglish) |
| Licencia | MIT |
| Formato de pesos | Safetensors / PyTorch (formato transformers; no se indica publicacion de GGUF) |

## Arquitectura y entrenamiento

El modelo parte de `xlm-roberta-base`, un encoder transformer multilingue con vocabulario SentencePiece entrenado sobre corpus en 100 idiomas. Sobre esa base se anade una cabeza de clasificacion de dos clases (Non-Hate / Hate) y se ajusta de forma supervisada sobre el split de entrenamiento del dataset HASTIKA, con una particion estratificada 88/12 entre entrenamiento y validacion retenida.

Los hiperparametros documentados son: longitud maxima de 160 tokens, batch size 16, precision mixta, learning rate 2e-5 y early stopping sobre macro-F1 de validacion. No se documenta en la model card el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo tecnicas de aumento de datos o regularizacion adicional. Tampoco se menciona RLHF, DPO ni decodificacion especulativa, lo cual es coherente con un modelo discriminativo de clasificacion. La innovacion tecnica es limitada: se trata de un ajuste fino estandar orientado a un dominio linguistico especifico (code-mixing kannada-ingles en comentarios de YouTube).

## Capacidades

- Clasificacion binaria de texto: asigna la etiqueta Non-Hate (0) o Hate (1) a un comentario de entrada.
- Manejo de texto code-mixed kannada-ingles y de transliteraciones romanizadas (kanglish).
- Integracion directa con `transformers` mediante `pipeline("text-classification")`.
- Compatible con endpoints de Hugging Face (`endpoints_compatible` en los tags).
- No soporta generacion de texto, razonamiento multi-paso, tool calling ni function calling.
- No dispone de capacidades de vision, audio ni modo de razonamiento (thinking).
- Capacidad multilingue limitada a los idiomas del ajuste fino (kn, en); el encoder base es multilingue, pero el ajuste se ha realizado solo en este dominio.
- No implementa deteccion de objetivos (target identification); se limita a la tarea A de clasificacion binaria.

## Casos de uso

- Moderacion asistida de comentarios en YouTube: el modelo puede prefiltrar comentarios en kanglish y marcar los sospechosos de odio para revision humana, reduciendo el volumen que llega a los moderadores. Es adecuado porque esta entrenado especificamente sobre ese tipo de texto y plataforma.
- Componente de un ensemble de moderacion: tal como lo usa el autor, se puede combinar con MuRIL, otro XLM-RoBERTa y un SVM calibrado con TF-IDF para mejorar el macro-F1 respecto al modelo individual (0,8162 en validacion, 0,7963 en test).
- Investigacion en NLP de bajo recurso: sirve como linea base reproducible para experimentos sobre deteccion de odio en lenguas dravidicas code-mixed, dado que la licencia MIT facilita su reutilizacion academica.
- Analisis de toxicidad en comunidades de habla kannada: permite medir la prevalencia de discurso de odio en foros o secciones de comentarios, siempre con supervision humana de los resultados.
- Filtrado previo en pipelines de anotacion: puede priorizar muestras para etiquetado humano en proyectos de construccion de corpus, reduciendo el coste de anotacion de casos negativos evidentes.
- Evaluacion comparativa de modelos multilingues: sirve como referencia para medir cuanto aporta un ajuste fino especifico frente a un modelo multilingue generico en este dominio.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Macro-F1 en split de validacion retenido (modelo individual) | 0,791 |
| Macro-F1 del ensemble en validacion (gold labels) | 0,8162 |
| Macro-F1 del ensemble en test oficial | 0,7963 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el modelo es un clasificador especializado y no un modelo generativo. Los unicos datos de rendimiento son los de la tarea HASTIKA.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB (278 M parametros × 4 bytes), mas overhead de activaciones.
- VRAM estimada en fp16: aproximadamente 0,6 GB; en int8, aproximadamente 0,3 GB.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para cargas moderadas.
- GPU de datacenter (A100, H100) innecesarias para inferencia; solo utiles para reentrenamiento a gran escala o procesamiento masivo en batch.
- Opciones de despliegue: `transformers` (pipeline nativo), Hugging Face Inference Endpoints, ONNX Runtime, TorchScript. No se documenta soporte especifico para vLLM, TGI o llama.cpp, aunque al ser un encoder pequeno puede exportarse a ONNX para servir con mayor eficiencia.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera un throughput alto en GPU consumer y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| hastika-task-a-xlmr-base | ~278 M | 512 (entrenado a 160) | Clasificacion binaria de odio en kanglish | MIT | Macro-F1 0,791 en validacion propia |
| MuRIL (google/muril-base-cased) | ~236 M | 512 | Encoder multilingue para 17 lenguas indias, base de ajustes de clasificacion | Apache 2.0 | No disponible en esta ficha; usado como componente del mismo ensemble |
| XLM-RoBERTa base (FacebookAI/xlm-roberta-base) | ~278 M | 512 | Encoder multilingue generico, sin ajuste a la tarea | MIT | No aplica sin ajuste fino |

La comparacion directa con alternativas especializadas en deteccion de odio en kannada es limitada porque no se dispone de resultados publicados de otros checkpoints en la misma tarea dentro de la informacion proporcionada. El propio autor senala que este checkpoint es mas debil que el ensemble del que forma parte.

## Limitaciones y advertencias

- Entrenado sobre un dataset pequeno; se esperan errores en variantes dialectales, sarcasmo, lenguaje reclamado y transliteraciones no vistas en entrenamiento.
- Riesgo de falsos positivos y falsos negativos en contextos ambiguos; no debe usarse como unico criterio de moderacion.
- El modelo individual es mas debil que el ensemble: macro-F1 de 0,791 frente a 0,8162 en validacion y 0,7963 en test del ensemble.
- Sesgos potenciales derivados de la distribucion del dataset HASTIKA (comentarios de YouTube en un periodo y comunidad concretos); no se documenta un analisis de sesgos.
- Limitacion de contexto: aunque el encoder soporta 512 tokens, el ajuste se hizo a 160, por lo que entradas mas largas pueden degradar el rendimiento si no se truncan adecuadamente.
- Cobertura linguistica restringida a kannada-ingles code-mixed; no se garantiza su comportamiento en otros pares de idiomas ni en kannada formal escrito en script nativo sin mezcla.
- Uso previsto de investigacion: el autor indica que debe asistir a moderadores humanos, no reemplazarlos.
- Licencia MIT permite uso comercial, pero el dataset HASTIKA no se incluye y sus terminos deben consultarse antes de cualquier otro uso.
- No se documentan tecnicas de calibracion de probabilidades para este checkpoint individual; el SVM del ensemble si esta calibrado, pero este modelo no.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ganesh-Nadkarni/hastika-task-a-xlmr-base
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Referencia del dataset y tarea: Kavatagi, S. and Rachh, R. (2025). HASTIKA: hate speech and target identification in Kannada-English code-mixed text. *Language Resources and Evaluation*, 59(3):2811-2856.
- Shared task HASTIKA en ICON-2026: no disponible enlace directo en la informacion proporcionada.
