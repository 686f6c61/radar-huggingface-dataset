# Mitroshenkov87/voxprint-mirror-opus-mt-ru-en

## Resumen

voxprint-mirror-opus-mt-ru-en es un espejo de respaldo sin modificaciones del modelo de traducción automática Helsinki-NLP/opus-mt-ru-en, publicado por el usuario Mitroshenkov87 dentro del proyecto Voxprint (una aplicación de clonación de voz y construcción de audiolibros). No se trata de un modelo nuevo ni reentrenado: los ficheros de pesos son idénticos byte a byte al commit fijado `fbd6dc73284f95536648512cc21d57f19191961a` del repositorio original de la Universidad de Helsinki. Su función es servir como fuente de descarga alternativa y offline para el motor de traducción interno de la aplicación Voxprint.

El modelo original es un sistema de traducción neuronal ruso-inglés entrenado con la arquitectura Transformer-align del framework Marian, sobre datos del corpus OPUS. Forma parte de la familia OPUS-MT desarrollada por el Language Technology Research Group de la Universidad de Helsinki, una de las colecciones de traducción automática abierta más amplias y utilizadas del ecosistema.

Su relevancia es práctica y acotada: no aporta innovación técnica, sino reproducibilidad y disponibilidad. Para desarrolladores e investigadores, este espejo es útil únicamente como copia de seguridad verificable de un modelo pequeño y ya optimizado para traducción de un solo par de idiomas, con licencia CC-BY-4.0 que permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer-align (framework Marian) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuye `pytorch_model.bin`) |
| Idiomas soportados | Ruso (origen) -> Ingles (destino) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (`pytorch_model.bin`); se excluyen las copias TensorFlow, Rust y Flax del original |

## Arquitectura y entrenamiento

El modelo subyacente emplea la arquitectura Transformer-align implementada en Marian, un framework de traducción neuronal secuencia a secuencia. El preprocesado combina normalización de texto con tokenización mediante SentencePiece (se incluyen `source.spm` y `target.spm` en el repositorio). El modelo original fue entrenado sobre el corpus OPUS, una agregación de corpus paralelos multilingües, y los pesos publicados corresponden a la iteración `opus-2020-02-26`.

No hay información disponible sobre el número exacto de tokens de entrenamiento, la composición detallada del dataset ni sobre si se aplicaron técnicas de alineación como RLHF o DPO. La model card original no documenta procesos de ajuste por preferencias humanas. Este espejo no introduce ningún cambio técnico: reproduce exactamente la configuración, el tokenizador y los pesos del original, y únicamente difiere en su `README.md`. Los ficheros están verificados contra un manifiesto SHA-256 (`infra/model_mirrors.json`) en el repositorio Voxprint.

## Capacidades

- Traducción de texto de ruso a inglés, tanto de frases aisladas como de párrafos.
- Generación texto a texto dentro del pipeline `translation` de HuggingFace Transformers.
- Funcionamiento completamente offline una vez descargados los pesos, lo que lo hace apto para entornos sin conectividad.
- Integración sencilla mediante `transformers` (`AutoTokenizer` y `AutoModelForSeq2SeqLM`).
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No es un modelo multimodal: no procesa visión, audio ni otros formatos.
- Soporte multilingüe limitado al par ruso-inglés; no traduce otros idiomas.

## Casos de uso

- Traducción integrada en la aplicación Voxprint: el modelo se usa como motor de traducción offline para convertir guiones o textos rusos en inglés antes de la generación de audiolibros, sin depender de servicios en la nube.
- Traducción de documentación técnica y guiones: apropiado para textos redactados en ruso que necesitan una versión en inglés, gracias al entrenamiento sobre corpus OPUS que incluye material periodístico y técnico.
- Preprocesado de datos multilingües en investigación: sirve como primer paso para normalizar corpus rusos a inglés antes de otras tareas de procesado de lenguaje natural.
- Aplicaciones de escritorio con requisitos de privacidad: al ser un modelo pequeño y ejecutable localmente, permite traducir contenido sensible sin enviarlo a servidores externos.
- Motor de traducción de respaldo: útil como fuente redundante de descarga dentro de una infraestructura que ya depende del modelo original, mitigando caídas de disponibilidad del repositorio de Helsinki-NLP.
- Prototipado rápido de pipelines de traducción: su reducido tamaño (0,3 GB de repositorio) y su integración directa con `transformers` lo hacen cómodo para pruebas y validaciones iniciales antes de escalar a modelos mayores.
- Traducción en sistemas con recursos limitados: puede desplegarse en máquinas sin GPU dedicada, algo poco habitual en modelos de traducción de mayor tamaño.

## Benchmarks y rendimiento

Los resultados corresponden al modelo original (iteración `opus-2020-02-26`) y se heredan íntegramente en este espejo, ya que los pesos son idénticos.

| Testset | BLEU | chr-F |
|---|---|---|
| newstest2012.ru.en | 34.8 | 0.603 |
| newstest2013.ru.en | 27.9 | 0.545 |
| newstest2014-ruen.ru.en | 31.9 | 0.591 |
| newstest2015-enru.ru.en | 30.4 | 0.568 |
| newstest2016-enru.ru.en | 30.1 | 0.565 |
| newstest2017-enru.ru.en | 33.4 | 0.593 |
| newstest2018-enru.ru.en | 29.6 | 0.565 |
| newstest2019-ruen.ru.en | 31.4 | 0.576 |
| Tatoeba.ru.en | 61.1 | 0.736 |

No se han publicado comparativas directas con otros modelos en la información disponible. Los ficheros de evaluación originales están accesibles en `opus-2020-02-26.eval.txt` y las traducciones del conjunto de prueba en `opus-2020-02-26.test.txt`.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; no obstante, el repositorio ocupa 0,3 GB y los pesos se entregan en `pytorch_model.bin`, por lo que la inferencia en CPU es viable con memoria RAM convencional.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño del modelo, cualquier GPU con unos pocos GB de VRAM debería ser más que suficiente.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el reducido tamaño del repositorio, aunque no se aportan cifras oficiales.
- Opciones de despliegue: HuggingFace Transformers (el código de ejemplo oficial usa `AutoTokenizer` y `AutoModelForSeq2SeqLM`). Otras opciones como vLLM, llama.cpp, Ollama o TGI no están documentadas para este modelo en la información disponible.
- Latencia y throughput: no disponibles. No se han publicado datos de rendimiento en tiempo de inferencia.

## Comparativa con modelos similares

| Modelo | Idiomas | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| voxprint-mirror-opus-mt-ru-en | ru -> en | Transformer-align (Marian) | no disponible | CC-BY-4.0 | Espejo en HuggingFace |
| Helsinki-NLP/opus-mt-ru-en | ru -> en | Transformer-align (Marian) | no disponible | CC-BY-4.0 | Repositorio original |
| Mitroshenkov87/voxprint-mirror-opus-mt-en-ru | en -> ru | Transformer-align (Marian) | no disponible | CC-BY-4.0 | Espejo en HuggingFace |

Los dos espejos del usuario Mitroshenkov87 son funcionalmente independientes: uno traduce ruso a inglés y el otro inglés a ruso. Ambos replican modelos de la familia OPUS-MT de la Universidad de Helsinki. No se dispone de datos comparativos de rendimiento con otros modelos de traducción en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo cubre un par de idiomas (ruso-inglés); no traduce a otros idiomas ni desde ellos.
- La model card original advierte de sesgos potenciales heredados de los datos de entrenamiento, con posible propagación de estereotipos históricos y actuales. Se cita bibliografía sobre sesgos en modelos de lenguaje (Sheng et al. 2021; Bender et al. 2021).
- Riesgo de alucinación y errores de traducción, especialmente en dominios alejados del corpus OPUS (por ejemplo, jerga muy específica o textos técnicos poco representados).
- La licencia CC-BY-4.0 exige atribución explícita: hay que acreditar a Helsinki-NLP / Universidad de Helsinki, nombrar el modelo original con enlace e indicar si se han hecho cambios. Este espejo no introduce ninguno, pero cualquier redistribución debe mantener la atribución.
- El espejo no está afiliado a los autores originales del modelo; todos los derechos pertenecen al Language Technology Research Group de la Universidad de Helsinki.
- La model card contiene avisos de contenido sensible (stereotipos, lenguaje ofensivo) en la sección de riesgos del original.
- Solo se incluyen los ficheros que la aplicación Voxprint necesita; las copias TensorFlow, Rust y Flax de los pesos no están presentes en este repositorio, lo que limita su uso en entornos que dependan de esos formatos.
- No se documentan ni la longitud de contexto ni los parámetros totales en la información disponible, por lo que conviene verificar estos datos en el repositorio original antes de usarlo en producción.

## Enlaces

- Espejo en HuggingFace: https://huggingface.co/Mitroshenkov87/voxprint-mirror-opus-mt-ru-en
- Modelo original: https://huggingface.co/Helsinki-NLP/opus-mt-ru-en
- Espejo inverso (en -> ru): https://huggingface.co/Mitroshenkov87/voxprint-mirror-opus-mt-en-ru
- Repositorio Voxprint: https://github.com/Mitroshenkov87/voxprint-audiobook-builder
- Documentación de modelos y espejos del proyecto Voxprint: https://github.com/Mitroshenkov87/voxprint-audiobook-builder/blob/main/docs/MODELS.md
- Repositorio de entrenamiento OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT-train
- README de datos del par ru-en: https://github.com/Helsinki-NLP/OPUS-MT-train/blob/master/models/ru-en/README.md
- Pesos originales: https://object.pouta.csc.fi/OPUS-MT-models/ru-en/opus-2020-02-26.zip
- Traducciones del test set: https://object.pouta.csc.fi/OPUS-MT-models/ru-en/opus-2020-02-26.test.txt
- Resultados de evaluación: https://object.pouta.csc.fi/OPUS-MT-models/ru-en/opus-2020-02-26.eval.txt
- Perfil del autor: https://huggingface.co/Mitroshenkov87
- Paper de referencia OPUS-MT (Tiedemann y Thottingal, EAMT 2020).
