# Nurik2005/doni-models

## Resumen

Doni es un repositorio de pesos de gran tamano publicado por el usuario Nurik2005 en Hugging Face, asociado al proyecto "Doni voice film-search", una aplicacion de busqueda de peliculas por voz. No se trata de un unico modelo generativo, sino de un contenedor de artefactos heterogeneos: un checkpoint de XLM-RoBERTa-base ajustado para analisis de sentimiento de resenas (clases NEGATIVE / POSITIVE) y una matriz BM25 en formato NumPy (`app_lex.npz`) que constituye el indice de busqueda de la aplicacion. El codigo y los checkpoints ligeros se distribuyen por separado en GitHub, segun indica la propia model card.

El interes tecnico del repositorio es limitado pero concreto: ofrece un clasificador de sentimiento multilingue para kazajo y ruso derivado de XLM-RoBERTa, junto con los artefactos de recuperacion lexica del sistema. La model card es extremadamente escueta y no documenta hiperparametros de entrenamiento, composicion del dataset, metricas ni procedimiento de evaluacion, por lo que la mayor parte de las especificaciones habituales quedan como no disponibles.

El repositorio ocupa 1,7 GB y no registra descargas ni interacciones en el momento de la consulta. Su relevancia es acotada: resulta util como referencia para quien construya sistemas de busqueda por voz en lenguas de Asia Central con recuperacion lexica BM25 y filtrado de sentimiento, pero no constituye un modelo base reutilizable de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa-base (transformer encoder) para el clasificador de sentimiento; BM25 para el indice de recuperacion |
| Parametros totales | no disponible (XLM-RoBERTa-base tiene aproximadamente 278 M de parametros, dato no confirmado en la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | kazajo (kk), ruso (ru) |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoint de sentimiento) y NumPy `.npz` (matriz BM25) |

## Arquitectura y entrenamiento

El unico componente neuronal documentado es `xlmr-sentiment/`, un ajuste fino de XLM-RoBERTa-base para clasificacion binaria de sentimiento en resenas, con etiquetas NEGATIVE y POSITIVE. XLM-RoBERTa es un encoder transformer preentrenado de forma multilingue con enmascaramiento de tokens sobre corpus web en un centenar de idiomas; el ajuste fino anade una cabeza de clasificacion sobre la representacion del token especial de inicio de secuencia. La model card no especifica el numero de ejemplos de ajuste, la composicion del corpus, la presencia de kazajo en los datos de entrenamiento, el regimen de entrenamiento (epocas, tasa de aprendizaje, precision mixta) ni si se aplico regularizacion o validacion cruzada.

El segundo artefacto, `search_v3_gpu/app_lex.npz`, no es un modelo neuronal: es una matriz de pesos BM25 serializada en NumPy que materializa el indice lexico de la aplicacion de busqueda. BM25 es una funcion de ranking probabilistico basada en frecuencia de terminos y normalizacion por longitud de documento, con parametros tipicos k1 y b. La model card no indica el vocabulario cubierto, el numero de documentos indexados ni los valores de esos parametros. No se documenta ninguna innovacion arquitectonica adicional, ni decodificacion especulativa, ni atencion lineal, ni fases de RLHF o DPO.

## Capacidades

- Clasificacion de sentimiento binaria (NEGATIVE / POSITIVE) sobre texto de resenas, presumiblemente en kazajo y ruso.
- Recuperacion lexica de documentos mediante BM25, orientada a la busqueda de peliculas dentro de la aplicacion Doni.
- Procesamiento de texto multilingue heredado del preentrenamiento de XLM-RoBERTa, aunque solo se declaran kk y ru como idiomas objetivo.
- Integracion en un pipeline de busqueda por voz: el sistema completo combina reconocimiento de habla, recuperacion y clasificacion, aunque solo se distribuyen aqui los pesos de las dos ultimas etapas.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, modo thinking, vision ni audio en los artefactos publicados.
- No se documenta generacion de texto: el componente neuronal es un encoder discriminativo, no un modelo causal.

## Casos de uso

- Filtrado de resenas de peliculas: el clasificador `xlmr-sentiment` permite etiquetar resenas de usuarios en kazajo y ruso como positivas o negativas para agregar puntuaciones o moderar contenido, aprovechando el preentrenamiento multilingue del encoder.
- Busqueda lexica de titulos en una aplicacion de cine: la matriz BM25 de `app_lex.npz` puede cargarse con NumPy y usarse para puntuar documentos frente a una consulta tokenizada, sin necesidad de infraestructura de vectores ni GPU.
- Pipeline de busqueda por voz de extremo a extremo: combinando un reconocedor de habla con la recuperacion BM25 y el filtro de sentimiento, se puede construir un asistente que transcriba una peticion hablada, recupere peliculas candidatas y descarte resultados con recepcion negativa.
- Analisis de opinion para catalogos regionales: util en plataformas que operan en Kazajistan y Rusia y necesitan senales de sentimiento sin depender de APIs externas ni de modelos entrenados solo en ingles.
- Prototipado de sistemas de recuperacion sin GPU: al ser BM25 un indice estatico en `.npz`, se puede desplegar en CPU con latencias de milisegundos para volumenes moderados de documentos.
- Investigacion comparativa sobre XLM-RoBERTa en lenguas de Asia Central: el checkpoint sirve como punto de partida para experimentos de ajuste fino adicional en kazajo, aunque la ausencia de metricas publicadas obliga a revalidar su calidad antes de cualquier uso.
- Base para sistemas de recomendacion con senal de sentimiento: la salida del clasificador puede alimentar un ranking secundario que reordene los resultados de BM25 segun la polaridad media de las resenas de cada titulo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para ninguno de los artefactos del repositorio. No constan metricas de exactitud, F1, precision o recall para el clasificador de sentimiento, ni evaluaciones de recuperacion (nDCG, MRR, recall@k) para el indice BM25.

## Requisitos de hardware

- Clasificador de sentimiento: XLM-RoBERTa-base en precision FP32 ocupa aproximadamente 1,1 GB de VRAM; en FP16, alrededor de 550 MB. Cabe holgadamente en cualquier GPU consumer con 4 GB o mas, e incluso puede ejecutarse en CPU para lotes pequenos.
- Indice BM25: la matriz `.npz` se carga en memoria principal y no requiere GPU; el consumo depende del vocabulario y del numero de documentos, no documentado, pero el repositorio completo pesa 1,7 GB, lo que da una cota superior del orden de magnitud.
- GPU recomendadas: ninguna en particular; para el encoder bastan una RTX 3060, RTX 4090 o una T4 en cloud. Para el componente de reconocimiento de voz del sistema completo, no incluido aqui, no hay datos.
- Despliegue: el checkpoint safetensors es compatible con Hugging Face Transformers, Text Embedding Inference y ONNX Runtime tras conversion. El indice BM25 se usa directamente con NumPy o integrado en una capa de recuperacion propia.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Doni `xlmr-sentiment` | no disponible (base XLM-R) | no disponible | kk, ru | no disponible | safetensors |
| cardiffnlp/twitter-xlm-roberta-base-sentiment | aprox. 278 M | 512 tokens | multilingue (100 idiomas) | no disponible en la informacion consultada | safetensors, PyTorch |
| FacebookAI/xlm-roberta-base | aprox. 278 M | 512 tokens | multilingue (100 idiomas) | MIT | safetensors, PyTorch |
| BM25 (implementaciones como rank_bm25 o Lucene) | no aplica | no aplica | depende del tokenizador | segun implementacion | indice serializado |

La comparacion con alternativas de sentimiento es aproximada: el checkpoint de Doni no publica metricas, de modo que no puede establecerse una jerarquia de rendimiento frente a `cardiffnlp/twitter-xlm-roberta-base-sentiment` ni frente a un ajuste propio sobre `xlm-roberta-base`. La ventaja diferencial de Doni es la cobertura declarada de kazajo, idioma con escasa representacion en los datasets de sentimiento publicos.

## Limitaciones y advertencias

- Ausencia total de documentacion: no se especifican datos de entrenamiento, hiperparametros, metricas ni procedimiento de evaluacion, lo que impide estimar la calidad real del clasificador.
- Licencia no declarada: no puede asumirse uso comercial permitido; es imprescindible contactar con el autor antes de integrar los pesos en un producto.
- Riesgo de sobreajuste y sesgo de dominio: al no conocerse el corpus de ajuste, se desconoce si el modelo generaliza a resenas fuera del dominio de peliculas o del registro de la aplicacion original.
- Cobertura limitada a dos idiomas declarados (kk, ru); el comportamiento en textos mixtos con code-switching o en otras lenguas no esta documentado.
- El encoder XLM-RoBERTa-base tiene un limite de contexto de 512 tokens, aunque este dato no se confirma en la model card; resenas mas largas requeririan truncamiento.
- Riesgo de alucinacion no aplicable al clasificador, pero si al sistema completo si se anade un componente generativo no documentado aqui.
- El repositorio mezcla pesos neuronales con artefactos de indice; no es un paquete autocontenido y requiere el codigo de GitHub para reconstruir el pipeline.
- Sin descargas ni validacion por la comunidad: no existen senales externas de calidad ni reportes de terceros.
- La fecha de creacion del repositorio (2026-11-27) resulta anomala respecto al momento de consulta; conviene verificar la integridad de los metadatos antes de confiar en ellos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Nurik2005/doni-models
- Codigo y checkpoints ligeros del proyecto Doni: referenciados en la model card como alojados en GitHub, sin URL concreta en la informacion disponible.
- XLM-RoBERTa-base (modelo base del clasificador): https://huggingface.co/FacebookAI/xlm-roberta-base
- Paper de XLM-R (Unsupervised Cross-lingual Representation Learning at Scale): https://arxiv.org/abs/1911.02116
- Alternativa de sentimiento multilingue: https://huggingface.co/cardiffnlp/twitter-xlm-roberta-base-sentiment
