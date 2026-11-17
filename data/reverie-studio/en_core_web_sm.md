# reverie-studio/en_core_web_sm

## Resumen

`en_core_web_sm` es el pipeline preentrenado en inglés de tamano pequeno de spaCy, la libreria de procesamiento de lenguaje natural desarrollada por Explosion AI. Esta ficha concreta corresponde al repositorio `reverie-studio/en_core_web_sm`, un espejo sin modificaciones de la version 3.8.0 publicada por Explosion en su canal oficial de GitHub. No se trata de un modelo generativo ni de un LLM: es un conjunto de componentes estadisticos y de redes neuronales convolucionales ligeras que realizan tareas de analisis linguistico clasico (tokenizacion, etiquetado gramatical, dependencias sintacticas, reconocimiento de entidades nombradas, lematizacion y similitud vectorial).

El proposito del repositorio es facilitar la instalacion del paquete desde un unico punto para los flujos internos de Reverie Studio, manteniendo la integridad del wheel original mediante un checksum SHA-256 verificado. La relevancia practica es que permite a equipos que ya usan spaCy disponer de un pipeline rapido, de baja huella de memoria y con licencia MIT, adecuado para preprocesado en produccion, extraccion de entidades y construccion de pipelines de NLP clasicos. El repositorio figura con 0 descargas y 0 likes, sin pipeline declarado en Hugging Face, y un tamano reportado de 0.0 GB.

No se dispone de informacion sobre arquitectura detallada, numero de parametros, composicion del corpus de entrenamiento ni resultados de benchmarks en la informacion proporcionada. La model card del espejo es minima y se limita a declarar que se trata de una copia sin modificar del wheel oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de spaCy (componentes estadisticos y redes convolucionales ligeras); no disponible el detalle interno |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesamiento por documento, no ventana de contexto fija) |
| Tipos de cuantizacion | no disponible (no aplica en el sentido de LLM; el wheel incluye pesos en su formato nativo) |
| Idiomas soportados | ingles (pipeline `en_`) |
| Licencia | MIT |
| Formato de pesos | wheel de Python (`en_core_web_sm-3.8.0`), libreria `spacy` |
| Version | 3.8.0 |
| Autor original | Explosion AI |
| Repositorio espejo | reverie-studio/en_core_web_sm |
| Tamano del repo (HF) | 0.0 GB reportado |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El pipeline pertenece a la familia de modelos `en_core_web_sm` de spaCy, que combina componentes estadisticos entrenados por separado (tagger, parser de dependencias, reconocedor de entidades, lematizador y vectorizador) sobre corpus en ingles anotados por Explosion. La variante `sm` es la mas ligera de la familia y prioriza velocidad y bajo consumo de memoria frente a la precision de las variantes `md`, `lg` y `trf`. No se dispone en la informacion proporcionada del numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de ajuste fino especificas mas alla del entrenamiento supervisado estandar de spaCy.

El repositorio de Reverie Studio no introduce cambios en el modelo: es un espejo binario del wheel oficial. La model card indica que el SHA-256 incluido en `SHA256SUMS` coincide con el wheel upstream, y que las fuentes y avisos de datos estan en `LICENSES_SOURCES`. No se documentan innovaciones tecnicas adicionales ni modificaciones respecto al original.

## Capacidades

- Tokenizacion y segmentacion de texto en ingles.
- Etiquetado gramatical (POS tagging) y asignacion de rasgos morfologicos.
- Analisis de dependencias sintacticas (dependency parsing).
- Reconocimiento de entidades nombradas (NER) con las categorias estandar de spaCy (persona, organizacion, lugar, fecha, etc.).
- Lematizacion.
- Similitud semantica basada en vectores (vectores estaticos incluidos en el paquete, de dimension reducida en la variante `sm`).
- Segmentacion de oraciones.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling en el sentido de los LLM.
- No esta disenado para agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Preprocesado de corpus en ingles para entrenamiento de modelos: el pipeline permite tokenizar, lematizar y etiquetar gramaticalmente grandes volumenes de texto con bajo coste computacional, lo que lo hace adecuado como etapa previa a la construccion de datasets.
- Extraccion de entidades en documentos: se puede usar el componente NER para poblar indices de personas, organizaciones y lugares en sistemas de busqueda o bases de datos documentales.
- Analisis sintactico para reglas de negocio: el parser de dependencias permite construir reglas sobre sujetos, objetos y modificadores en pipelines de extraccion de informacion.
- Normalizacion de texto para motores de busqueda: la lematizacion y el etiquetado POS ayudan a reducir variantes morfologicas antes de indexar.
- Clasificacion y enrutado de tickets: la segmentacion de oraciones y las representaciones vectoriales permiten alimentar clasificadores ligeros en sistemas de atencion al cliente.
- Procesamiento por lotes en entornos con recursos limitados: al ser la variante `sm`, cabe en CPU y en instancias pequenas, lo que facilita su despliegue en contenedores de baja memoria.
- Anonimizacion basica de textos: el NER permite detectar y enmascarar entidades personales antes de almacenar o compartir documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: el pipeline `sm` esta disenado para ejecutarse en CPU sin GPU; el consumo de memoria es reducido en comparacion con las variantes `md`, `lg` y `trf`.
- VRAM estimada para GPU: no disponible; no se documenta un modo GPU obligatorio.
- GPU recomendadas: no disponible; el modelo no requiere GPU para funcionar.
- Compatibilidad con GPU de consumo: no aplica de forma obligatoria; puede ejecutarse en cualquier maquina con Python y spaCy instalados.
- Opciones de despliegue: instalacion via `pip install` del wheel, carga con `spacy.load("en_core_web_sm")`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de pipeline.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Licencia | Contexto | Notas |
|---|---|---|---|---|---|
| en_core_web_sm (este repo) | Pipeline spaCy `sm` | Ingles | MIT | no disponible | Variante ligera, orientada a velocidad |
| en_core_web_md | Pipeline spaCy `md` | Ingles | MIT | no disponible | Mayor tamano y vectores mas ricos; no incluido en la informacion |
| en_core_web_lg | Pipeline spaCy `lg` | Ingles | MIT | no disponible | Mayor precision a costa de mas memoria; no incluido en la informacion |
| en_core_web_trf | Pipeline spaCy transformer | Ingles | MIT | no disponible | Basado en transformer; mayor precision y coste; no incluido en la informacion |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Solo procesa texto en ingles; no es multilingue.
- No es un modelo generativo: no produce texto, codigo ni respuestas conversacionales.
- La variante `sm` sacrifica precision frente a `md`, `lg` y `trf`; para tareas que requieran alta exactitud en NER o dependencias conviene evaluar variantes mayores.
- Los vectores de similitud de la variante `sm` son de baja dimension y ofrecen una calidad limitada en comparacion con modelos de embeddings dedicados.
- Riesgo de errores en dominios especializados (biomedicina, legal, jerga tecnica) si el vocabulario no esta cubierto por el entrenamiento original.
- No se documentan sesgos especificos en la informacion proporcionada; al ser un modelo entrenado sobre corpus en ingles, puede reflejar sesgos presentes en dichos datos.
- Licencia MIT: permite uso comercial y modificacion, pero se debe conservar el aviso de copyright de Explosion AI y revisar `LICENSES_SOURCES` para los avisos de datos.
- El repositorio es un espejo no oficial de Reverie Studio; para produccion conviene verificar el SHA-256 contra el wheel oficial y considerar instalar directamente desde el canal de Explosion.
- El repositorio figura con 0 descargas y 0 likes, y sin pipeline declarado en Hugging Face, lo que reduce la senal de mantenimiento y soporte comunitario.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/reverie-studio/en_core_web_sm
- Release oficial del wheel: https://github.com/explosion/spacy-models/releases/tag/en_core_web_sm-3.8.0
- Documentacion de spaCy: https://spacy.io/
- Repositorio de spaCy en GitHub: https://github.com/explosion/spaCy
- Repositorio de modelos de spaCy: https://github.com/explosion/spacy-models
