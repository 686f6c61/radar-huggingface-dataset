# gbalachandhiran/yak-candidate-classifier

## Resumen

Yak candidate-label classifier es un modelo de clasificación de texto por etiquetas candidatas (candidate-label classification) desarrollado por el usuario gbalachandhiran y publicado en Hugging Face. En lugar de predecir una clase fija de un conjunto cerrado, el modelo recibe un texto de entrada y una lista de etiquetas candidatas, codifica conjuntamente ambos y devuelve una puntuación normalizada para cada etiqueta proporcionada en esa llamada. Es, por tanto, un clasificador de zero-shot configurable en tiempo de inferencia.

El modelo es muy pequeño: 4.896.257 parámetros totales según los pesos en safetensors, con un encoder de 4 bloques transformer, dimensión oculta 128 y 4 cabezas de atención. Incorpora un tokenizador BPE propio (Yak BPE) con un vocabulario de 30.005 tokens y una longitud máxima de entrada empaquetada de 2.048 tokens, aunque en la práctica trunca el texto a 96 tokens y los pares premisa/hipótesis a 64 y 32 tokens respectivamente. El paquete incluye un runtime de inferencia independiente (`yak_inference.py`) con una API `.predict()`.

Su relevancia es acotada pero concreta: ofrece una alternativa ligera y auto-contenida para tareas de clasificación de intenciones y similitud textual (Banking77, CLINC, SNLI) sin necesidad de un LLM grande. La model card no declara resultados de benchmarks ni licencia, lo que limita su adopción en producción sin una evaluación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Yak candidate-label classifier (encoder transformer, 4 bloques, hidden size 128, 4 cabezas) |
| Parametros totales | 4.896.257 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens de entrada empaquetada; truncado efectivo a 96 tokens (texto) y 64/32 tokens (premisa/hipotesis) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que no se especifica licencia) |
| Formato de pesos | safetensors (con `config.json`, `bpe.json`, `label_metadata.json`, `yak_inference.py`, `yak_manifest.json`) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer compacto de 4 bloques con dimensión oculta 128 y 4 cabezas de atención, sobre un vocabulario BPE propio de 30.005 tokens. El mecanismo de clasificación consiste en concatenar cada etiqueta candidata al input codificado, puntuar el primer token de cada etiqueta y normalizar las puntuaciones sobre el conjunto de candidatos proporcionado. Para reducir el sesgo por el orden de las etiquetas, el runtime barre cuatro pasadas con orden aleatorio de candidatos y promedia los resultados por defecto. La entrada máxima empaquetada es de 2.048 tokens, con truncados por defecto de 96 tokens para texto, 64 para premisa y 32 para hipótesis, y 12 tokens para cada etiqueta candidata.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. La model card únicamente identifica Banking77, CLINC y SNLI como tareas soportadas, sin detallar hiperparámetros, número de épocas ni procedimiento de entrenamiento.

## Capacidades

- Clasificación de texto por etiquetas candidatas arbitrarias definidas en tiempo de inferencia (zero-shot configurable).
- Clasificación de intenciones en dominios conversacionales, con Banking77 y CLINC como tareas de referencia declaradas.
- Inferencia de pares de frases estilo SNLI (premisa/hipótesis) para tareas de entailment, neutral y contradicción.
- Puntuación normalizada sobre el conjunto de candidatos de cada llamada, ordenada de mayor a menor.
- Promediado sobre cuatro pasadas con orden de etiquetas aleatorio para mitigar el sesgo posicional.
- Runtime de inferencia independiente (`yak_inference.py`) con API `.predict()`, cargable vía `snapshot_download` y compatible con CPU y CUDA.
- No se declaran capacidades de tool calling, agentes, generación de texto libre, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Clasificación de intenciones en atención al cliente: el modelo recibe el mensaje del usuario y una lista de intenciones candidatas (por ejemplo, "transfer money", "report a lost card") y devuelve la puntuación de cada una, lo que permite enrutar tickets sin reentrenar el modelo por cada nueva intención.
- Etiquetado de tickets de soporte en dominios bancarios: con Banking77 como tarea de referencia, se puede usar para categorizar consultas entrantes en un conjunto de etiquetas definido por el equipo de operaciones.
- Detección de similitud textual y entailment: el modo premisa/hipótesis permite comprobar si dos frases son equivalentes, neutras o contradictorias, útil para deduplicación de FAQs o validación de respuestas.
- Moderación y triaje de contenido corto: al trabajar con textos truncados a 96 tokens, encaja en la clasificación de mensajes breves (comentarios, formularios, asuntos de correo) contra categorías configurables.
- Enrutamiento en pipelines de soporte multi-idioma: siempre que se valide el comportamiento en el idioma objetivo (no declarado en la model card), puede actuar como primera etapa de clasificación antes de un modelo mayor.
- Prototipado rápido y experimentación: con menos de 5 millones de parámetros y un runtime autocontenido, se puede ejecutar en Colab o en portátil para validar taxonomías de etiquetas antes de invertir en un clasificador supervisado.
- Clasificación en entornos con recursos limitados: su tamaño permite desplegarlo en CPU o en GPUs de gama baja para tareas de etiquetado de bajo volumen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclaman resultados de benchmark y que Banking77, CLINC y SNLI se identifican únicamente como tareas soportadas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa, dado el tamaño de 4,9 millones de parámetros (aproximadamente 20 MB en fp32 para los pesos, más overhead del runtime).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el modelo funciona también en CPU. No requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU con memoria compartida; también en CPU y en Google Colab gratuito.
- Opciones de despliegue: el paquete incluye su propio runtime `yak_inference.py` cargado vía `transformers` y `safetensors`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera una latencia muy baja por llamada, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yak candidate-label classifier | 4,9 M | 2.048 tokens empaquetados (truncado a 96 en texto) | Clasificación por etiquetas candidatas, zero-shot configurable | No disponible | Hugging Face, runtime propio |
| Modelos NLI tipo DeBERTa/BERT fine-tuned | 100-400 M | 512 tokens | Clasificación supervisada de entailment | Variable (MIT/Apache en muchos casos) | Hugging Face, transformers |
| SetFit / clasificadores de frases con sentence-transformers | 20-120 M | 256-512 tokens | Clasificación few-shot con embeddings | Variable | Hugging Face, sentence-transformers |
| LLMs pequeños para clasificación zero-shot (p. ej. variantes < 1B) | 100 M - 1 B | 2.000-8.000 tokens | Generación con prompting de etiquetas | Variable | Hugging Face, vLLM, llama.cpp |

La comparación es cualitativa: no hay datos de rendimiento publicados para Yak que permitan contrastar métricas con estas alternativas. La ventaja principal de Yak es su tamaño mínimo y su API de etiquetas arbitrarias; la desventaja es la ausencia de licencia, benchmarks e idiomas declarados.

## Limitaciones y advertencias

- No se especifica licencia: la model card indica explícitamente que no hay licencia declarada y que debe confirmarse el derecho a redistribuir pesos, tokenizador y datos antes de su reutilización.
- Las puntuaciones están normalizadas sobre las etiquetas candidatas de cada llamada y no son probabilidades calibradas; no deben interpretarse como confianza absoluta ni usarse como única base para decisiones de alto impacto.
- El resultado depende de la redacción de las etiquetas candidatas y de los datos de entrenamiento; cambios en la formulación pueden alterar la clasificación.
- Truncado agresivo: el texto se limita a 96 tokens y las etiquetas a 12 tokens, lo que puede perder información en entradas largas.
- No se declaran idiomas soportados; el comportamiento multilingüe es desconocido y requiere validación empírica.
- No se han publicado benchmarks ni evaluación independiente; el rendimiento real en Banking77, CLINC o SNLI no está cuantificado en la información disponible.
- Riesgo de alucinación no aplica en el sentido generativo (no genera texto libre), pero sí existe riesgo de asignaciones erróneas de etiquetas en dominios fuera de la distribución de entrenamiento.
- Sesgos conocidos: no disponibles en la información proporcionada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de adopción comunitaria ni mantenimiento.
- No se documenta soporte para tool calling, agentes ni integración con frameworks de serving estándar más allá de `transformers`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gbalachandhiran/yak-candidate-classifier
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos asociados al modelo.
