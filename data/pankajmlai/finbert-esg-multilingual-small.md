# pankajmlai/finbert-esg-multilingual-small

## Resumen

finbert-esg-multilingual-small es un clasificador de frases ESG (ambiental, social y de gobernanza) desarrollado por el usuario pankajmlai. Se presenta como un sustituto directo de FinBERT-ESG: emplea las mismas etiquetas y el mismo orden (`0 None`, `1 Environmental`, `2 Social`, `3 Governance`), de modo que el codigo que consume el campo `label` de un pipeline de `text-classification` sigue funcionando sin cambios. La diferencia principal es que este modelo es multilingue y esta publicado bajo licencia MIT, frente a las restricciones de uso de FinBERT-ESG.

El modelo se inicializa desde `jhu-clsp/mmBERT-small`, un encoder ModernBERT de 140.643.076 parametros (141M), y se afina para clasificacion de secuencias con 4 etiquetas. La ventana de contexto del encoder es de 8.192 tokens, aunque el entrenamiento se realizo con secuencias de 256 tokens. Cubre ingles, aleman, frances, espanol, chino y japones, y se distribuye en formato safetensors con exportacion ONNX.

Su relevancia actual radica en dos puntos: elimina la barrera de licencia para uso comercial en analisis ESG automatizado y extiende la clasificacion a seis idiomas con un coste computacional reducido (aproximadamente 1.180 frases por segundo en GPU bf16 con batch 64). El autor documenta de forma explicita las limitaciones de sus propias metricas, incluyendo que parte de los datos de referencia son etiquetas generadas por un LLM profesor y no por anotadores humanos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), `AutoModelForSequenceClassification` con 4 etiquetas |
| Parametros totales | 140.643.076 (141M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (entrenamiento con 256) |
| Tipos de cuantizacion | no disponible (repo con safetensors y ONNX; no se documentan variantes GGUF ni cuantizaciones) |
| Idiomas soportados | en, de, fr, es, zh, ja, multilingual |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX |
| Modelo base | jhu-clsp/mmBERT-small (MIT) |
| Etiquetas | `0 None`, `1 Environmental`, `2 Social`, `3 Governance` |
| Libreria | transformers (probado con transformers 5.20.2 y torch 2.14) |
| Tamano del repo | 1,2 GB |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT afinado para clasificacion de secuencias de 4 clases. La eleccion de ModernBERT frente a BERT clasico implica que el codigo heredado de la model card de FinBERT que instancia `BertTokenizer` o `BertForSequenceClassification` debe migrarse a `AutoTokenizer` y `AutoModelForSequenceClassification`, y requiere una version de transformers con soporte para ModernBERT. La ventana nativa del encoder es de 8.192 tokens, si bien el ajuste se hizo con 256.

El entrenamiento uso 52.000 frases procedentes de FineWeb (ingles) y FineWeb-2 (aleman, frances, espanol, chino y japones), ambas bajo licencia ODC-By 1.0, filtradas por URL y palabras clave relacionadas con finanzas. Antes del entrenamiento se eliminaron duplicados exactos y casi duplicados del conjunto humano en ingles y del conjunto de test de noticias. Las etiquetas se generaron con un modelo profesor, `Qwen/Qwen3.5-4B`, mediante una decision restringida de un solo token por frase. El checkpoint se selecciono por perdida de validacion sobre las etiquetas del profesor, no sobre datos humanos. Se entreno una sola vez por tamano (semilla 19). El autor tambien entreno una variante base (308M parametros) con la misma receta, pero fijo de antemano la regla de publicar base solo si superaba claramente a small; al no cumplirse, se libero la variante small.

## Capacidades

- Clasificacion de frases en cuatro categorias ESG: None, Environmental, Social y Governance.
- Compatibilidad directa con el pipeline de `text-classification` de transformers y con el esquema de etiquetas de FinBERT-ESG.
- Clasificacion multilingue en ingles, aleman, frances, espanol, chino y japones, con capacidad declarada para entornos multilingues.
- Inferencia en CPU y GPU, con exportacion ONNX para despliegues optimizados.
- Integracion con text-embeddings-inference y endpoints compatibles segun los tags del repositorio.
- No soporta generacion de texto, tool calling, razonamiento multi-paso, vision ni audio: es un clasificador de secuencias, no un modelo generativo.

## Casos de uso

- Analisis de informes de sostenibilidad: procesar secciones de memorias anuales y clasificar cada frase por pilar ESG, aprovechando la ventana de 8.192 tokens del encoder para fragmentos largos. El modelo se evaluo precisamente sobre frases de informes de sostenibilidad (conjunto nowzero/ESG-EN).
- Triaje de noticias financieras multilingues: ingerir titulares y cuerpos de noticia en seis idiomas y etiquetar la relevancia ESG para alimentar un panel de seguimiento. El modelo muestra un acuerdo con el profesor de 0,78 en chino y 0,74 en japones sobre 250 frases por idioma.
- Sustitucion directa de FinBERT-ESG en codigo existente: cambiar unicamente el identificador del modelo en el pipeline, manteniendo el resto del codigo que lee `label` y `score`.
- Clasificacion a gran escala en CPU: con 26,3 frases por segundo en CPU fp32 a dos hilos y batch 32, es viable procesar corpus de decenas de miles de frases en infraestructura sin GPU.
- Enriquecimiento de bases de datos de proveedores: etiquetar descripciones de empresas y eventos corporativos por pilar ESG para scoring de carteras o filtros de inversion.
- Preprocesado para pipelines de analisis de sentimiento financiero: separar frases con contenido ESG antes de aplicar modelos mas costosos, reduciendo el volumen que llega a etapas posteriores.
- Moderacion y cumplimiento documental: detectar menciones ambientales o de gobernanza en comunicaciones corporativas para revisiones de cumplimiento normativo.

## Benchmarks y rendimiento

Resultados en macro-F1 sobre datos etiquetados por humanos. Δ es la diferencia frente a FinBERT-ESG; los intervalos son bootstraps pareados al nivel de informe o empresa.

| Conjunto | Idioma | Etiquetas | n | FinBERT-ESG | Este modelo | Δ (IC 95%) |
|---|---|---|---:|---:|---:|---|
| nowzero/ESG-EN test | en | humanas, frases de informes de sostenibilidad | 1.000 | 0,644 | 0,723 | +7,9 (+5,2 a +12,5) |
| DReggio/esg-spanish-events gold | es | humanas (un anotador), titulares | 1.468 | 0,222 | 0,756 | +53,4 (+49,3 a +57,3) |

Comparativa small frente a base (no liberado):

| Conjunto | small | base | base − small (IC 95%) |
|---|---:|---:|---|
| Ingles, humano | 0,723 | 0,731 | +0,8 (−3,4 a +3,0) |
| Espanol, humano | 0,756 | 0,732 | −2,4 (−4,4 a −0,5) |
| Coreano (procedencia no declarada) | 0,550 | 0,616 | +6,6 (+3,0 a +10,2) |

Prueba zero-shot en coreano (nmixx-fin/twice_kr_esg_cls, procedencia de etiquetas no declarada):

| n | FinBERT-ESG | Este modelo | Δ (IC 95%) |
|---:|---:|---:|---|
| 1.000 | 0,055 | 0,550 | +49,5 (+45,8 a +53,2) |

Acuerdo con el profesor (Qwen3.5-4B) sobre 250 frases de noticias financieras por idioma; no es exactitud:

| Idioma | FinBERT-ESG | Este modelo |
|---|---:|---:|
| en | 0,437 | 0,601 |
| de | 0,203 | 0,681 |
| fr | 0,235 | 0,670 |
| es | 0,367 | 0,690 |
| zh | 0,216 | 0,784 |
| ja | 0,193 | 0,738 |

Rendimiento medido (RTX 5070 Ti compartida, cifras aproximadas):

| Modelo | Parametros | GPU bf16, batch 64 (frases/s) | CPU fp32, 2 hilos, batch 32 (frases/s) |
|---|---:|---:|---:|
| FinBERT-ESG | 110M | ~1.230 | 15,3 |
| Este modelo (small) | 141M | ~1.180 | 26,3 |
| mmBERT-base (no liberado) | 308M | ~470 | 10,6 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,3 GB para los pesos (141M parametros), mas el espacio de activaciones, que depende del batch y de la longitud de secuencia; en la practica cabe en cualquier GPU con 2 GB o mas.
- GPU recomendadas: cualquier GPU moderna es suficiente; el autor midio en una RTX 5070 Ti. Para alto throughput, A100 o H100 permiten batches mayores, aunque el modelo no las necesita para funcionar.
- Cabe en GPU de consumo sin problema, incluidas GTX 1650, RTX 3060, RTX 4060 y superiores.
- Despliegue: transformers (version con soporte ModernBERT; probado con 5.20.2 y torch 2.14), ONNX Runtime, text-embeddings-inference y endpoints compatibles. No se documentan recetas para vLLM, llama.cpp ni Ollama, y al no haber pesos GGUF no es desplegable directamente en llama.cpp u Ollama.
- Throughput de referencia: aproximadamente 1.180 frases por segundo en GPU bf16 con batch 64 y 26,3 frases por segundo en CPU fp32 con dos hilos y batch 32.
- Latencia: no se publican cifras de latencia por peticion; el throughput agregado implica del orden de decenas de miles de frases por minuto en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento (macro-F1) |
|---|---:|---|---|---|---|
| Este modelo (finbert-esg-multilingual-small) | 141M | 8.192 | en, de, fr, es, zh, ja | MIT | 0,723 (en), 0,756 (es) |
| yiyanghkust/finbert-esg | 110M | 512 (BERT clasico) | en | no disponible en la informacion | 0,644 (en), 0,222 (es) |
| mmBERT-base ESG (no liberado) | 308M | 8.192 | en, de, fr, es, zh, ja | no disponible (no publicado) | 0,731 (en), 0,732 (es) |

Frente a FinBERT-ESG, la ganancia es clara en ingles (+7,9 puntos de macro-F1) y muy amplia en espanol (+53,4), ademas de anadir cinco idiomas y licencia MIT. Frente a la variante base, la diferencia en datos humanos no es concluyente (intervalos que cruzan cero en ingles y ligeramente negativos en espanol), mientras que base solo supera a small en coreano, un idioma no incluido en el entrenamiento. No se dispone de comparacion con otros clasificadores ESG multilingues en la informacion proporcionada.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento provienen de un LLM profesor (Qwen3.5-4B), no de anotadores humanos; un segundo modelo (MiniCPM5-2B) coincidio con el profesor en ESG con un kappa de Cohen de 0,39 sobre 200 elementos, lo que indica ruido considerable en las etiquetas de referencia.
- Para aleman, frances, chino y japones no se encontro test etiquetado por humanos; las cifras publicadas miden acuerdo con el profesor, no exactitud real.
- Las metricas en ingles y espanol son ligeramente optimistas, porque la eleccion entre tamano small y base se hizo sobre esos mismos conjuntos con una regla fijada de antemano.
- Cada tamano se entreno una sola vez (semilla 19); los intervalos reflejan remuestreo del test, no varianza de entrenamiento.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea en frases ambiguas o sin contenido ESG explicito.
- La ventana de 8.192 tokens es la del encoder, pero el modelo se entreno con 256 tokens; el comportamiento en secuencias mucho mas largas no esta validado.
- El codigo heredado de FinBERT que fija clases `Bert*` no funciona sin cambios: requiere `Auto*` y una version de transformers con soporte ModernBERT.
- No hay pesos GGUF ni recetas para llama.cpp u Ollama; el despliegue en esos entornos requeriria conversion propia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente por parte de la comunidad.
- Licencia MIT: permite uso comercial sin restricciones, pero el autor no ofrece garantias sobre el rendimiento en dominios distintos de los evaluados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pankajmlai/finbert-esg-multilingual-small
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- FinBERT-ESG (referencia de compatibilidad): https://huggingface.co/yiyanghkust/finbert-esg
- Dataset nowzero/ESG-EN: https://huggingface.co/datasets/nowzero/ESG-EN
- Dataset DReggio/esg-spanish-events: https://huggingface.co/datasets/DReggio/esg-spanish-events
- Dataset nmixx-fin/twice_kr_esg_cls: https://huggingface.co/datasets/nmixx-fin/twice_kr_esg_cls
- FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Modelo profesor Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia ODC-By 1.0: https://opendatacommons.org/licenses/by/1-0/
