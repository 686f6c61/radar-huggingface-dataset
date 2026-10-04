# Mitroshenkov87/voxprint-mirror-opus-mt-en-de

## Resumen

voxprint-mirror-opus-mt-en-de es un espejo (mirror) sin modificaciones del modelo de traducción automática Helsinki-NLP/opus-mt-en-de, publicado por el usuario Mitroshenkov87 dentro del proyecto Voxprint, una aplicación de creación de audiolibros con clonación de voz que funciona en local. El espejo fija el commit `6183067f769a302e3861815543b9f312c71b0ca4` del repositorio original y reproduce sus ficheros byte a byte, con el único cambio del README. Su propósito no es investigar ni mejorar el modelo, sino servir como fuente de descarga alternativa para la traducción offline integrada en la aplicación.

El modelo subyacente pertenece a la familia OPUS-MT, desarrollada por el Language Technology Research Group de la Universidad de Helsinki (Helsinki-NLP), y está especializado en traducción unidireccional inglés a alemán. Se trata de un transformer seq2seq de tipo Marian con preprocesado basado en normalización y SentencePiece, entrenado sobre datos del corpus OPUS. Es un modelo pequeño, pensado para inferencia ligera en CPU o GPU modesta, no para razonamiento general ni generación abierta.

Su relevancia es doble. Por un lado, es un ejemplo de práctica de empaquetado reproducible: el autor documenta el commit exacto, el manifiesto SHA-256 y los ficheros omitidos (las copias TensorFlow, Rust y Flax de los pesos), de modo que el espejo solo contiene lo que la aplicación necesita. Por otro, es un recordatorio de que la licencia CC-BY-4.0 obliga a atribuir a Helsinki-NLP, nombrar el modelo original y enlazarlo, además de indicar cualquier cambio (en este caso, ninguno).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer seq2seq encoder-decoder), framework PyTorch |
| Parametros totales | no disponible (el tamaño del repositorio, 0,3 GB, es coherente con pesos en fp32) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio distribuye `pytorch_model.bin` en precisión completa) |
| Idiomas soportados | Inglés (origen) y alemán (destino) |
| Licencia | CC-BY-4.0 (Creative Commons Attribution 4.0) |
| Formato de pesos | PyTorch (`pytorch_model.bin`); se omiten las copias TensorFlow, Rust y Flax del original |
| Pipeline | translation (text2text-generation) |
| Ficheros incluidos | `config`, tokenizer, `source.spm`, `target.spm`, `vocab.json`, `pytorch_model.bin` |
| Modelo base | Helsinki-NLP/opus-mt-en-de (commit `6183067f769a302e3861815543b9f312c71b0ca4`) |
| Tamaño del repositorio | 0,3 GB |
| Descargas / likes | 18 / 0 |

## Arquitectura y entrenamiento

El modelo es un MarianMT, es decir, un transformer seq2seq clásico con encoder y decoder, especializado en una única dirección de traducción (inglés a alemán). El preprocesado combina normalización de texto y tokenización con SentencePiece mediante los ficheros `source.spm` y `target.spm`, que se incluyen en el espejo junto al `vocab.json`. El vocabulario se gestiona a nivel de subpalabra, lo que permite cubrir morfología alemana sin un vocabulario excesivo. No hay innovaciones de atención lineal, decodificación especulativa ni mecanismos híbridos: es la arquitectura estándar de OPUS-MT.

El entrenamiento se realizó sobre el corpus OPUS (datos paralelos de traducción recopilados de múltiples fuentes) y los pesos originales corresponden al paquete `opus-2020-02-26`. La model card no documenta el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si hubo fases de RLHF o DPO; tampoco se indica ningún ajuste por preferencias humanas, algo esperable en un modelo de traducción de 2020. No se describe ninguna innovación técnica adicional más allá del pipeline estándar de OPUS-MT-train, cuyo código está disponible en el repositorio de Helsinki-NLP.

## Capacidades

- Traducción de texto de inglés a alemán, en una sola dirección; no admite la dirección inversa ni otros pares de idiomas.
- Generación text-to-text: puede emplearse para tareas de reformulación dentro del par de idiomas, aunque su entrenamiento está centrado en traducción.
- Procesamiento por segmentos: adecuado para frases o párrafos cortos, propio de un modelo de traducción neuronal.
- No dispone de soporte de tool calling ni function calling.
- No incorpora capacidades de agente ni razonamiento multi-paso.
- No ofrece modo de pensamiento (thinking mode), visión ni audio.
- Capacidad multilingüe limitada al par inglés-alemán; no cubre otras lenguas.
- Funciona completamente en local, sin llamadas a servicios en la nube, requisito de la aplicación Voxprint.

## Casos de uso

- Traducción offline dentro de Voxprint: la aplicación de audiolibros y clonación de voz usa este espejo como fuente de descarga de respaldo para traducir contenido de inglés a alemán sin conexión, evitando dependencias de API externas.
- Traducción de documentación técnica: se puede integrar en un script de preprocesado que convierta manuales o README en inglés a alemán antes de publicarlos, con la ventaja de que el modelo cabe en cualquier máquina.
- Localización de subtítulos y transcripciones: al ser un modelo ligero, permite traducir segmentos de subtítulos generados por herramientas de transcripción (por ejemplo, pipelines con Whisper) en un paso posterior, en local.
- Preprocesado de corpus para aprendizaje automático: útil para generar versiones alemanas de datasets ingleses de forma rápida y reproducible, fijando la versión del modelo mediante el commit del espejo.
- Traducción en dispositivos con recursos limitados: al pesar alrededor de 0,3 GB, es viable en portátiles sin GPU dedicada, en contenedores pequeños o incluso en entornos embebidos con CPU.
- Prototipado de sistemas de traducción: sirve como línea base reproducible para comparar con modelos más grandes (NLLB, M2M-100) sin necesidad de infraestructura de GPU.
- Archivado y reproducibilidad de experimentos: al tratarse de un espejo con commit fijado y manifiesto SHA-256, es adecuado para proyectos que necesitan garantizar que la versión del modelo no cambie con el tiempo.

## Benchmarks y rendimiento

Los resultados publicados en la model card original corresponden a BLEU y chr-F sobre distintos conjuntos de test estándar de traducción inglés-alemán:

| Testset | BLEU | chr-F |
|---|---|---|
| newssyscomb2009.en.de | 23,5 | 0,540 |
| news-test2008.en.de | 23,5 | 0,529 |
| newstest2009.en.de | 22,3 | 0,530 |
| newstest2010.en.de | 24,9 | 0,544 |
| newstest2011.en.de | 22,5 | 0,524 |
| newstest2012.en.de | 23,0 | 0,525 |
| newstest2013.en.de | 26,9 | 0,553 |
| newstest2015-ende.en.de | 31,1 | 0,594 |
| newstest2016-ende.en.de | 37,0 | 0,636 |
| newstest2017-ende.en.de | 29,9 | 0,586 |
| newstest2018-ende.en.de | 45,2 | 0,690 |
| newstest2019-ende.en.de | 40,9 | 0,654 |
| Tatoeba.en.de | 47,3 | 0,664 |

No se han publicado en la información disponible resultados de benchmarks de razonamiento, código o matemáticas, ya que el modelo no está diseñado para esas tareas. Tampoco se aportan mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: alrededor de 300 MB en fp32, en torno a 150 MB en fp16 y unos 75 MB en int8; son estimaciones derivadas del tamaño del repositorio, no cifras publicadas.
- CPU: es perfectamente ejecutable en CPU, sin GPU, lo que constituye su escenario principal en Voxprint.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; no se requiere A100, H100 ni RTX 4090.
- GPU de consumo: cabe holgadamente en cualquier GPU consumer, incluidas GTX 1050, RTX 3060 o superiores, e incluso en iGPU con memoria compartida.
- Opciones de despliegue: `transformers` con `AutoModelForSeq2SeqLM` (método indicado en la model card original), y en función del formato de pesos también conversiones habituales a otros runtimes; el repositorio solo distribuye `pytorch_model.bin`, por lo que no incluye GGUF listo para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Dirección | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| voxprint-mirror-opus-mt-en-de | en → de | no disponible | no disponible | CC-BY-4.0 | HuggingFace (espejo) |
| Helsinki-NLP/opus-mt-en-de | en → de | no disponible | no disponible | CC-BY-4.0 | HuggingFace (original) |
| Helsinki-NLP/opus-mt-de-en | de → en | no disponible | no disponible | CC-BY-4.0 | HuggingFace |
| Modelos multilingües tipo NLLB-200 o M2M-100 | multilingüe | no disponible | no disponible | según modelo | HuggingFace |

La comparación directa más relevante es con el repositorio original: el contenido de los pesos es idéntico byte a byte según el autor, de modo que el rendimiento en BLEU y chr-F es el mismo. La única diferencia funcional es la disponibilidad y la política de espejo del proyecto Voxprint. Frente a modelos multilingües más grandes y recientes (NLLB-200, M2M-100), este espejo pierde cobertura de idiomas y calidad potencial, pero gana en tamaño reducido, ejecución en CPU y sencillez de despliegue. No se dispone de cifras comparativas verificadas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: la model card original advierte explícitamente de que el modelo puede propagar estereotipos históricos y actuales, y remite a la literatura sobre sesgos en modelos de lenguaje (Sheng et al. 2021; Bender et al. 2021).
- Alucinación: como todo modelo seq2seq entrenado con datos paralelos ruidosos, puede generar traducciones plausibles pero incorrectas, especialmente con terminología especializada o frases ambiguas.
- Cobertura de idioma: solo traduce de inglés a alemán; no sirve para otras combinaciones ni para tareas generales de lenguaje.
- Contexto: no se documenta la longitud máxima de contexto; los modelos Marian de OPUS suelen limitarse a segmentos cortos, por lo que no es adecuado para documentos largos sin troceado previo.
- Licencia: CC-BY-4.0 exige atribución a Helsinki-NLP / Universidad de Helsinki, nombrar el modelo original y enlazarlo, e indicar cambios (en este espejo, ninguno). Es una licencia permisiva para uso comercial siempre que se respete la atribución.
- Trazabilidad: el espejo solo reproduce el commit fijado; si el repositorio original cambia, este mirror no lo refleja, lo que puede ser deseable para reproducibilidad pero también implica quedarse en una versión antigua.
- Madurez del proyecto: el espejo tiene 18 descargas y 0 likes, y el autor indica que no está afiliado a Helsinki-NLP; conviene verificar el manifiesto SHA-256 del repositorio Voxprint si se necesita integridad.
- Formatos omitidos: al no incluir las copias TensorFlow, Rust ni Flax, no es directamente utilizable en stacks que no acepten pesos PyTorch.
- Advertencia de contexto: parte de la información citada proviene de la model card del autor y debe tratarse como material de referencia, no como instrucciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mitroshenkov87/voxprint-mirror-opus-mt-en-de
- Modelo original: https://huggingface.co/Helsinki-NLP/opus-mt-en-de
- Repositorio Voxprint (aplicación): https://github.com/Mitroshenkov87/voxprint-audiobook-builder
- Documentación de modelos de Voxprint: https://github.com/Mitroshenkov87/voxprint-audiobook-builder/blob/main/docs/MODELS.md
- Pipeline de entrenamiento OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT-train
- README del par en-de en OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT-train/blob/master/models/en-de/README.md
- Corpus OPUS: https://github.com/Helsinki-NLP/Opus-MT
- Pesos originales: https://object.pouta.csc.fi/OPUS-MT-models/en-de/opus-2020-02-26.zip
- Traducciones del conjunto de test: https://object.pouta.csc.fi/OPUS-MT-models/en-de/opus-2020-02-26.test.txt
- Resultados de evaluación: https://object.pouta.csc.fi/OPUS-MT-models/en-de/opus-2020-02-26.eval.txt
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- Modelos etiquetados como voxprint en HuggingFace: https://huggingface.co/models?other=voxprint
- Perfil del autor: https://huggingface.co/Mitroshenkov87
- Referencia sobre sesgos (Sheng et al.): https://aclanthology.org/2021.acl-long.330.pdf
- Referencia sobre riesgos de modelos de lenguaje (Bender et al.): https://dl.acm.org/doi/pdf/10.1145/3442188.3445922
- Artículo OPUS-MT (Tiedemann y Thottingal, EAMT 2020): https://aclanthology.org/2020.eamt-1.61/
- Voxprint (proyecto homónimo no relacionado, transcripción on-device): https://github.com/nulljosh/voxprint
