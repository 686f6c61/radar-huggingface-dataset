# jaifar/menasaat-qwen3-4b-oman-qlora-v2

## Resumen

Menasaat Qwen3-4B Oman QLoRA v2 es un adaptador LoRA de segunda generación publicado por el usuario jaifar (con model card atribuida a Menasaat | Virtual Platforms LLC) que especializa el modelo base Qwen/Qwen3-4B en conocimiento sobre el Sultanato de Omán. El adaptador se ha entrenado sobre un corpus bilingüe (árabe e inglés) que combina instrucciones derivadas de la Wikipedia de Omán con 1.095 pares de contenido turístico procedentes del dataset menasaat/menasaat-oman-tourism-places. No es un modelo completo: se distribuye como pesos de adaptador PEFT en safetensors (0,1 GB de repositorio) y requiere cargar el modelo base Qwen3-4B para funcionar.

El problema que resuelve es la falta de cobertura específica sobre Omán en los modelos generalistas: la versión 2 añade información de horarios de apertura, ubicación por wilaya y gobernación, mejores temporadas de visita y consejos para 159 lugares repartidos por las 11 gobernaciones del país, además de respuestas a preguntas de localización en árabe del tipo "أين تقع ...؟". Está pensado como pieza de una arquitectura RAG para turismo y servicios públicos en Omán y el Golfo.

Técnicamente es un ajuste QLoRA (cuantización 4-bit NF4) sobre un transformer denso de aproximadamente 4.000 millones de parámetros, con LoRA de rango 16 y alpha 32, entrenado durante 2 épocas en una única Tesla T4. La licencia es Apache 2.0, heredada del modelo base, y el adaptador está pensado para usarse en generación de texto en árabe e inglés. Su relevancia actual es la de un ejemplo de especialización vertical de bajo coste (175 minutos en GPU gratuita) para dominio regional, aunque con cero descargas publicadas y sin benchmarks verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen/Qwen3-4B) con adaptador LoRA acoplado; PEFT sobre atención y proyecciones del base |
| Parametros totales | Aproximadamente 4.000 millones (modelo base Qwen3-4B); el adaptador LoRA (r=16, alpha=32) añade un número de parámetros entrenables no especificado en la información disponible |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la información proporcionada; el adaptador no modifica la ventana de contexto del modelo base |
| Tipos de cuantizacion | Entrenamiento con QLoRA en 4-bit NF4; el adaptador se publica en fp16 sobre safetensors. No se documentan cuantizaciones GGUF/AWQ/GPTQ del adaptador |
| Idiomas soportados | Árabe (ar) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); librería peft. Tamaño del repositorio: 0,1 GB |
| Modelo base | Qwen/Qwen3-4B |
| Pipeline | text-generation |
| Fecha de creación (repositorio) | 2026-09-22 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B, un transformer denso de decoder-only de aproximadamente 4.000 millones de parámetros. La especialización se realiza mediante QLoRA: el modelo base se cuantiza a 4 bits en formato NF4 y se entrenan módulos LoRA con rango 16 y alpha 32 en precisión fp16. El ajuste no altera la arquitectura del base ni su tokenizador; únicamente añade matrices de bajo rango que se cargan con `PeftModel.from_pretrained` sobre el modelo base.

El corpus de entrenamiento consta de 4.921 pares, de los cuales 3.926 provienen del conjunto de instrucciones de la Wikipedia de Omán y 995 de turismo, con 160 pares reservados para evaluación (la model card menciona 1.095 pares turísticos en la descripción inicial y 995 en la tabla de entrenamiento; la cifra exacta no queda aclarada en la información disponible). El entrenamiento duró 175,4 minutos en 1× Tesla T4 (nivel gratuito de Kaggle), con 2 épocas, una pérdida de entrenamiento que descendió de 6,68 a 3,84 y una pérdida de evaluación mixta (wiki + turismo) de 3,18. No se documenta uso de RLHF ni DPO, ni innovaciones técnicas adicionales más allá del propio ajuste QLoRA.

## Capacidades

- Generación de texto bilingüe en árabe e inglés, heredada del modelo base Qwen3-4B.
- Conocimiento factual sobre Omán: geografía, wilayas, gobernaciones y contenido enciclopédico derivado de la Wikipedia omaní.
- Conocimiento turístico específico de 159 lugares: horarios de apertura, ubicación (wilaya y gobernación), mejores temporadas de visita y consejos para visitantes.
- Respuesta a preguntas de localización en árabe (por ejemplo, "أين تقع ...؟") a partir del dataset turístico.
- Generación de instrucciones y respuestas de estilo enciclopédico en el dominio omaní.
- Integración como componente generativo dentro de pipelines RAG, tal como declara el autor entre sus etiquetas y objetivos.
- No se documentan en la información disponible capacidades de tool calling, function calling, comportamiento agéntico, multi-step reasoning, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Asistente turístico para Omán: el modelo puede responder consultas sobre horarios, ubicación y mejor época para visitar 159 lugares de las 11 gobernaciones, apoyándose en el dataset turístico con el que fue ajustado.
- Componente generativo de un sistema RAG: dado que el autor posiciona el adaptador dentro de arquitecturas de recuperación aumentada, se usaría para redactar la respuesta final a partir de fragmentos recuperados de la Wikipedia omaní y del dataset de lugares.
- Portal público de información sobre el Sultanato: atención de consultas ciudadanas y de visitantes en árabe e inglés sobre geografía y puntos de interés, con salida en ambos idiomas.
- Chatbot de atención al cliente para el sector turístico (hoteles, turoperadores, aerolíneas regionales): conversaciones en árabe sobre destinos omaníes, con la advertencia de verificar datos sensibles al tiempo como horarios y temporadas.
- Generación de contenido editorial y fichas de destino: producción de descripciones bilingües de lugares a partir de los pares de entrenamiento, para guías, webs o aplicaciones de viaje.
- Investigación sobre especialización regional de bajo coste: el adaptador sirve como caso reproducible de ajuste QLoRA en una única T4 durante menos de tres horas, útil para estudiar transferencia de conocimiento regional en modelos de 4B.
- Prototipado académico sobre árabe y dialectos del Golfo: punto de partida para experimentos de ajuste adicional sobre dominio omaní, dado que el adaptador es ligero (0,1 GB) y la licencia Apache 2.0 permite redistribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de entrenamiento:

| Metrica | Valor |
|---|---|
| Pérdida de entrenamiento | 6,68 → 3,84 |
| Pérdida de evaluación (mixta wiki + turismo) | 3,18 |
| Pares de entrenamiento | 4.921 (3.926 wiki + 995 turismo; 160 reservados) |
| Épocas | 2 |
| Tiempo de entrenamiento | 175,4 minutos en 1× Tesla T4 |

No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones específicas en árabe (por ejemplo, ArabicMMLU) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones, no datos oficiales): en fp16 el modelo base de 4B ocupa aproximadamente 8 GB de pesos, más caché KV y overhead, lo que sitúa el consumo práctico en torno a 10-12 GB; en cuantización 8 bits, alrededor de 5-6 GB; en 4 bits (NF4 o GGUF Q4), alrededor de 3-4 GB. El adaptador en sí apenas añade consumo.
- GPU recomendadas: para fp16, una RTX 4090 (24 GB), A100 40 GB, H100 o L40S ofrecen margen suficiente; para cuantización 4 bits, bastan GPU de 6-8 GB.
- Cabe en GPU de consumo: sí. En 4 bits es viable en RTX 3060 12 GB, RTX 4060 Ti 8 GB, RTX 3070 8 GB, y de forma ajustada en GPUs de 6 GB. La propia model card documenta el ajuste en una Tesla T4 de 16 GB.
- Opciones de despliegue: al ser un adaptador PEFT, se carga con `transformers` + `peft` (patrón documentado en la model card) y puede servirse con vLLM (soporte de LoRA), TGI o como adaptador combinado con el base en llama.cpp/Ollama tras convertir a GGUF. La información disponible no detalla configuraciones concretas de servido.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Como referencia indirecta, el entrenamiento de 2 épocas sobre 4.921 pares en una T4 requirió 175,4 minutos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| menasaat-qwen3-4b-oman-qlora-v2 | Adaptador LoRA sobre base de ~4B (r=16, alpha=32) | No disponible (heredado del base) | Apache 2.0 | safetensors (PEFT) | Especializado en Omán (wiki + turismo); 0 descargas registradas; sin benchmarks publicados |
| Qwen/Qwen3-4B | ~4.000 millones | No disponible en la información proporcionada | Apache 2.0 | safetensors, GGUF y otras conversiones habituales | Modelo base sin especialización regional; capacidades generales de razonamiento, código y multilingüismo |
| Otras familias de LLM centradas en árabe (Jais, Fanar, ALLaM) | No disponible | No disponible | No disponible | No disponible | Alternativas de especialización en árabe a escala regional; no se dispone de datos verificables en la información proporcionada para establecer una comparación numérica |

No se dispone de datos comparativos de rendimiento (benchmarks) entre este adaptador y alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Las respuestas turísticas están ancladas al dataset compilado; horarios de apertura y temporadas de visita son datos sensibles al tiempo y deben verificarse antes de cualquier uso de alto riesgo, tal como advierte el propio autor.
- La capacidad de conocimiento general es la del modelo base, sin mejoras atribuibles al adaptador fuera del dominio omaní.
- Riesgo de alucinación inherente a un modelo generativo de 4B, especialmente en preguntas fuera del corpus de entrenamiento o cuando se piden detalles no cubiertos por el dataset.
- Entrenamiento con solo 2 épocas y 4.921 pares, sobre un subconjunto reducido (995-1.095 pares turísticos) y con 160 pares reservados para evaluación; el volumen y la partición son limitados para garantizar una cobertura exhaustiva de las 11 gobernaciones.
- Cobertura lingüística limitada a árabe e inglés; no se documentan otros idiomas.
- Posible predominio del árabe estándar moderno en el corpus; no se documenta soporte de dialectos omaníes o del Golfo.
- Licencia Apache 2.0: permite uso comercial y redistribución, pero conviene verificar las condiciones del dataset turístico de origen (menasaat/menasaat-oman-tourism-places) y del modelo base antes de un despliegue en producción.
- El repositorio se publica bajo el identificador `jaifar/...`, mientras que la model card y los ejemplos de código utilizan rutas `menasaat/...`; esta discrepancia puede provocar errores al cargar el adaptador si no se ajusta el identificador.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados: madurez y validación externa muy limitadas.
- No se documentan cuantizaciones del adaptador ni métricas de latencia o throughput en producción.
- No se documentan mecanismos de seguridad, filtrado de contenido ni evaluación de sesgos; se desconoce su comportamiento en dominios sensibles (política, religión, temas legales).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaifar/menasaat-qwen3-4b-oman-qlora-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Dataset turístico citado en la model card: https://huggingface.co/datasets/menasaat/menasaat-oman-tourism-places
- Organización en Hugging Face citada en la model card: https://huggingface.co/menasaat
- Sitio del editor según la model card: https://menasaat.com
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; las búsquedas devolvieron únicamente páginas sobre CropEnergies AG (CropEnergies.com, Wikipedia en alemán, boerse.de, boersennews.de), sin relación con este modelo.
