# miscovery/arabic-egyptian-to-english-77m

## Resumen

`miscovery/arabic-egyptian-to-english-77m` es un modelo de traducción automática de tipo encoder-decoder basado en la arquitectura Marian, desarrollado por el usuario `miscovery` y publicado con licencia Apache 2.0. Traduce árabe estándar moderno (MSA) y árabe egipcio coloquial (`arz`) al inglés, partiendo de un ajuste fino sobre `Helsinki-NLP/opus-mt-ar-en`. Con 76.833.792 parámetros, es un modelo compacto pensado para despliegue ligero, incluso en CPU mediante una edición INT8 publicada aparte.

El modelo aborda un problema concreto y poco cubierto: la traducción del dialecto egipcio, una variante oral que difiere sustancialmente del MSA en léxico y morfología y que los modelos de traducción genéricos árabe-inglés suelen degradar. El ajuste fino se realizó sobre datos de OPUS-100, un corpus de traducción egipcia generado por lotes con OpenAI y un conjunto propio de hechos del mundo (`miscovery/arabic_egypt_english_world_facts`), lo que se traduce en mejoras notables en las métricas internas del autor para el dominio egipcio.

Es relevante por su tamaño reducido y su enfoque en un dialecto infrarepresentado, lo que lo hace adecuado para pipelines de traducción de bajo coste, procesamiento por lotes y aplicaciones donde el rendimiento en MSA ya es aceptable pero el egipcio coloquial fallaba. No es un modelo generativo generalista ni un modelo conversacional: es un traductor secuencial puro, sin prompt de chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian encoder-decoder (transformer seq2seq) |
| Parametros totales | 76.833.792 (76,8 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; la model card recomienda dividir entradas de más de 256 tokens |
| Tipos de cuantizacion | pesos originales en precisión completa; existe edición INT8 para CPU (CTranslate2) en repo separado |
| Idiomas soportados | árabe estándar moderno (`ar`), árabe egipcio (`arz`), inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,3 GB) |

## Arquitectura y entrenamiento

El modelo es un Marian encoder-decoder estándar, la arquitectura de traducción de Helsinki-NLP, con 76,8 millones de parámetros. Se inicializa desde `Helsinki-NLP/opus-mt-ar-en` y se ajusta de forma supervisada para traducción secuencial árabe→inglés, incorporando el dialecto egipcio como variedad de entrada. No emplea técnicas de RLHF ni DPO: es un ajuste fino supervisado sobre pares de traducción.

Los datos de entrenamiento proceden de tres fuentes declaradas: `Helsinki-NLP/opus-100`, `oddadmix/egyptian-translation-dataset-2.9-openai-batch` (corpus de egipcio generado por lotes con OpenAI) y `miscovery/arabic_egypt_english_world_facts` (conjunto propio de hechos del mundo). El autor publica una curva de aprendizaje de entrenamiento y validación, y un split de test de 2.966 pares tras filtrado, excluido del ajuste fino (aunque no puede garantizar que estuviera excluido del preentrenamiento del modelo base). No se especifican el número total de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Traducción de árabe estándar moderno a inglés.
- Traducción de árabe egipcio coloquial (`arz`) a inglés, la mejora principal frente al modelo base.
- Traducción de frases del dominio de hechos del mundo y expresiones cotidianas.
- Generación determinista mediante `generate` con `do_sample=False` y `num_beams=1` (recomendado en la model card).
- Entrada de texto plano en árabe, sin necesidad de prompt de chat ni plantilla de instrucciones.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada estrictamente a los tres idiomas declarados (ar, arz, en).

## Casos de uso

- Traducción de atención al cliente: el modelo puede traducir mensajes de usuarios en árabe egipcio coloquial a inglés para su revisión por equipos que no dominan el dialecto, con la ventaja de que el ajuste fino mejora específicamente este registro frente al modelo base.
- Localización de contenido social y de foros: útil para traducir comentarios y publicaciones en egipcio informal a inglés en pipelines de moderación o análisis, donde el MSA no refleja el texto real.
- Procesamiento por lotes de corpus: al ser un modelo de 76,8 M de parámetros y 0,3 GB, puede ejecutarse en CPU con la edición INT8 para traducir grandes volúmenes de pares sin GPU dedicada.
- Traducción de documentación y correspondencia en MSA: mantiene el rendimiento del modelo base en árabe estándar (chrF++ 59,68 en el conjunto OPUS) y añade cobertura de dialecto.
- Integración en aplicaciones de mensajería: el modelo traduce frases cortas de forma determinista y con latencia baja, adecuado para respuestas en tiempo casi real en dispositivos modestos.
- Extracción de información de hechos: el ajuste sobre el conjunto de hechos del mundo permite traducir afirmaciones y datos factuales en árabe a inglés para su posterior procesamiento por otros sistemas.
- Preprocesamiento para pipelines de NLP en inglés: traducir texto árabe/egipcio a inglés antes de aplicar modelos de análisis de sentimiento, clasificación o búsqueda que solo operan en inglés.

## Benchmarks y rendimiento

Los datos publicados por el autor comparan el modelo base (antes) y el ajustado (después) sobre cinco conjuntos de evaluación. Las métricas son BLEU y chrF++ frente a una única referencia; el autor advierte que no son porcentajes de traducciones correctas.

| Conjunto | chrF++ antes | chrF++ después | BLEU antes | BLEU después |
|---|---|---|---|---|
| opus | 59,50 | 59,68 | 39,79 | 40,00 |
| egyptian | 34,83 | 63,11 | 15,37 | 45,25 |
| facts | 50,88 | 65,57 | 28,14 | 45,72 |
| everyday/ar | 73,50 | 76,39 | 56,01 | 58,86 |
| everyday/ar_eg | 41,85 | 67,03 | 20,83 | 46,59 |

La mejora más pronunciada se da en egipcio (chrF++ de 34,83 a 63,11; BLEU de 15,37 a 45,25) y en el conjunto de hechos (chrF++ de 50,88 a 65,57). En MSA el cambio es marginal (chrF++ de 59,50 a 59,68). El split de test contiene 2.966 pares tras filtrado. No se han publicado comparaciones con otros modelos de traducción en la información disponible.

## Requisitos de hardware

- VRAM estimada: en precisión completa, el modelo ocupa aproximadamente 0,3 GB de pesos, por lo que cabe holgadamente en cualquier GPU con 2 GB o más; en la práctica la inferencia requiere poco más de 1 GB incluyendo activaciones.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobredimensionada; también funciona en GPUs de gama baja y en CPU.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 2 GB de VRAM; también en CPU mediante la edición INT8 (CTranslate2).
- Opciones de despliegue: `transformers` con `AutoModelForSeq2SeqLM` (versión recomendada `transformers==5.23.0`, `torch>=2.6`, `sentencepiece==0.2.2`, `sacremoses==0.1.1`); la edición INT8 para CPU en CTranslate2; compatible con endpoints de Hugging Face (`endpoints_compatible`).
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño, se espera latencia de milisegundos por frase en GPU y de decenas a cientos de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| `miscovery/arabic-egyptian-to-english-77m` | 76,8 M | ar, arz, en | no disponible | Apache 2.0 | Ajuste fino específico para egipcio |
| `Helsinki-NLP/opus-mt-ar-en` | ~77 M | ar, en | no disponible | CC-BY-4.0 (según el modelo base original) | Modelo base; sin cobertura específica de egipcio |
| `Helsinki-NLP/opus-mt-ar-en` (variantes OPUS) | similar | ar, en | no disponible | CC-BY-4.0 | Familia de traducción OPUS de referencia |

No se dispone de datos de benchmarks comparativos con otros modelos de traducción árabe-inglés en la información proporcionada; la comparativa se limita a parámetros, idiomas y licencia. El modelo base original se distribuye bajo CC-BY-4.0, mientras que este ajuste se publica bajo Apache 2.0, lo que conviene verificar antes de uso comercial.

## Limitaciones y advertencias

- Modelo de traducción secuencial: no es conversacional, no acepta instrucciones y no soporta tool calling ni agentes.
- Longitud de entrada limitada: la model card recomienda dividir entradas de más de 256 tokens; frases largas deben partirse.
- Cobertura de dialectos limitada al egipcio; otros dialectos árabes (golfo, magrebí, levantino) no están cubiertos explícitamente.
- Las métricas publicadas son diagnósticas y sobre conjuntos pequeños; el autor advierte que BLEU y chrF++ no son porcentajes de corrección y que una única referencia penaliza alternativas válidas.
- Riesgo de alucinación y de traducciones literales en expresiones idiomáticas o culturalmente específicas del egipcio.
- Sesgos: no se documentan sesgos específicos, pero al entrenar sobre corpus generados por OpenAI y datos propios puede heredar sesgos de esas fuentes.
- No se garantiza que el split de test estuviera excluido del preentrenamiento del modelo base, lo que puede inflar ligeramente las métricas.
- Licencia Apache 2.0 declarada, pero el modelo base original se publica bajo CC-BY-4.0; conviene revisar la compatibilidad para uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.
- Fecha de creación indicada como 2026-11-20, posterior a la fecha actual; conviene verificar la vigencia de los artefactos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/miscovery/arabic-egyptian-to-english-77m
- Edición INT8 para CPU (CTranslate2): https://huggingface.co/miscovery/arabic-egyptian-to-english-77m-ct2-int8
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-ar-en
- Dataset OPUS-100: https://huggingface.co/datasets/Helsinki-NLP/opus-100
- Dataset de traducción egipcia: https://huggingface.co/datasets/oddadmix/egyptian-translation-dataset-2.9-openai-batch
- Dataset de hechos del mundo: https://huggingface.co/datasets/miscovery/arabic_egypt_english_world_facts
- Métricas en formato legible por máquina: `reports/finetuned_metrics.json` (dentro del repositorio)
- Curva de aprendizaje: `reports/learning_curve.png` (dentro del repositorio)
