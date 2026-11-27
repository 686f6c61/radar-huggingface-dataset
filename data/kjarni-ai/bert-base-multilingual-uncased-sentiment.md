# kjarni-ai/bert-base-multilingual-uncased-sentiment

## Resumen

`kjarni-ai/bert-base-multilingual-uncased-sentiment` es un reempaquetado del modelo `nlptown/bert-base-multilingual-uncased-sentiment`, un BERT base multilingue ajustado para clasificar resenas de producto en una escala de 1 a 5 estrellas. El autor del reempaquetado es kjarni-ai, que lo distribuye a traves de la libreria Kjarni, una biblioteca nativa (Rust, con bindings para Python, C#, C++ y linea de comandos) que ejecuta el modelo localmente sin necesidad de runtime de Python, servidor ni servicio en la nube. El modelo original lo desarrollo NLP Town.

El modelo resuelve un problema acotado y bien definido: dado un texto de resena en ingles, neerlandes, aleman, frances, italiano o espanol, devolver una distribucion de probabilidad sobre cinco clases (1 a 5 estrellas) y la etiqueta mas probable. Es relevante para analitica de opiniones a escala, priorizacion de resenas negativas y enriquecimiento de catalogos de producto, y su interes actual radica en que el reempaquetado facilita el despliegue en entornos sin Python y en arquitecturas de tipo edge o embebido.

Arquitectonicamente es un transformer encoder BERT base multilingue (uncased, es decir, sin distincion de mayusculas y minusculas) con 167.360.261 parametros, aproximadamente 670 MB en el repositorio de pesos. Los pesos de `model.safetensors` son identicos byte a byte a los del modelo original; los cambios se limitan al empaquetado (tokenizer en formato `tokenizer.json` y ficheros de configuracion regenerados con una version mas reciente de transformers).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT base multilingue (uncased), cabeza de clasificacion de secuencia |
| Parametros totales | 167.360.261 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (BERT base: limite posicional de 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, nl, de, fr, it, es |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), con `tokenizer.json` y ficheros de configuracion de transformers |
| Libreria de despliegue | kjarni (0.8.2 probado); tambien cargable con transformers |
| Pipeline | text-classification |
| Etiquetas de salida | 5 clases (1 a 5 estrellas) |
| Tamano del repositorio | 1.3 GB |
| Modelo base | nlptown/bert-base-multilingual-uncased-sentiment |

## Arquitectura y entrenamiento

El modelo es un BERT base multilingue en configuracion *uncased* con una cabeza de clasificacion sobre cinco clases. El reempaquetado no modifica la arquitectura ni los pesos: `model.safetensors` es el fichero original byte a byte, y `config.json` declara la clase `BertForSequenceClassification`, igual que el modelo de origen. El unico cambio funcional es la generacion de un `tokenizer.json` a partir del `vocab.txt` original, para que la libreria Kjarni pueda consumirlo sin depender de la logica de tokenizacion de Python.

El entrenamiento original, documentado por NLP Town, consistio en un ajuste fino sobre aproximadamente 630.000 resenas de producto en seis idiomas, partiendo de `bert-base-multilingual-uncased`. La informacion proporcionada no detalla hiperparametros, numero de tokens de entrenamiento, composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; en un modelo de clasificacion de este tipo esas tecnicas no son habituales y no constan. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Clasificacion de sentimiento en escala ordinal de 1 a 5 estrellas a partir de texto libre.
- Salida de distribucion de probabilidad completa sobre las cinco clases, no solo la etiqueta ganadora.
- Multilingue en seis idiomas: ingles, neerlandes, aleman, frances, italiano y espanol.
- Analisis de resenas de producto como dominio principal de entrenamiento.
- Ejecucion local sin Python: la libreria Kjarni ofrece API en Python, Rust, C#, C++ y linea de comandos.
- Compatibilidad con transformers para quien prefiera el ecosistema Python estandar; los autores afirman que las puntuaciones coinciden con el modelo original hasta cuatro decimales en los ejemplos de la model card.
- No soporta generacion de texto, razonamiento, codigo, vision, audio, tool calling ni comportamiento de agente; es exclusivamente un clasificador.

## Casos de uso

- Analitica de opiniones en e-commerce: procesar el corpus de resenas de un catalogo multilingue y agregar la distribucion de estrellas por producto, categoria o mercado para detectar caidas de satisfaccion.
- Triaje de soporte al cliente: clasificar tickets o mensajes entrantes por severidad percibida (1-2 estrellas como prioritarios) y enrutarlos automaticamente al equipo adecuado.
- Monitorizacion de reputacion de marca: ingerir menciones y resenas de plataformas externas en varios idiomas y calcular series temporales de sentimiento sin depender de APIs de terceros.
- Enriquecimiento de datos para modelos de recomendacion: anadir una senal ordinal de sentimiento a cada resena como feature en un sistema de ranking o de filtrado colaborativo.
- Despliegue en entornos sin Python: integrar el clasificador en servicios escritos en Rust, C# o C++ mediante la libreria Kjarni, util en backends de alto rendimiento o en aplicaciones de escritorio.
- Procesamiento en el borde o en local: al ejecutarse en CPU y sin servidor, encaja en escenarios con requisitos de privacidad donde las resenas no pueden salir de la infraestructura del cliente.
- Control de calidad de resenas generadas o importadas: detectar discrepancias entre la valoracion numerica declarada y el texto, usando la clase predicha como comprobacion.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las metricas de exactitud del modelo original sobre 5.000 resenas reservadas por idioma. "Exacta" es la proporcion de resenas clasificadas con el numero exacto de estrellas del resenador; "desviacion de una" es la proporcion dentro de una estrella.

| Idioma | Exacta | Desviacion de una |
|---|---:|---:|
| Ingles | 67% | 95% |
| Neerlandes | 57% | 93% |
| Aleman | 61% | 94% |
| Frances | 59% | 94% |
| Italiano | 59% | 95% |
| Espanol | 58% | 95% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo cual es esperable en un clasificador de este tipo. Tampoco se proporcionan datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 670 MB en precision completa (fp32) para los pesos; el modelo es lo bastante pequeno para ejecutarse en CPU sin GPU.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) lo ejecuta con holgura, aunque la ganancia frente a CPU puede ser limitada por el tamano del modelo.
- Cabe en cualquier GPU consumer y en la mayoria de entornos de CPU; la model card muestra ejecucion en `Device: Cpu`.
- Opciones de despliegue: libreria Kjarni (Python, Rust, C#, C++, CLI) y transformers. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con el modelo de origen. No se aportan datos de otras alternativas.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| kjarni-ai/bert-base-multilingual-uncased-sentiment | 167.360.261 | no disponible (limite posicional BERT de 512 tokens) | 6 | MIT | Reempaquetado para Kjarni; pesos identicos al original |
| nlptown/bert-base-multilingual-uncased-sentiment | 167.360.261 | no disponible | 6 | MIT | Modelo original de NLP Town; NLP Town ofrece una version actualizada en su web |
| Otras alternativas | no disponible | no disponible | no disponible | no disponible | No se proporcionan datos de modelos comparables adicionales |

## Limitaciones y advertencias

- Dominio restringido: entrenado sobre resenas de producto; el rendimiento en otros generos textuales (noticias, redes sociales, conversacion) no esta garantizado ni documentado.
- Preprocesado *uncased*: al no distinguir mayusculas, puede perder senales de enfasis o entidades escritas en mayusculas.
- Riesgo de alucinacion no aplicable en sentido generativo, pero si de clasificacion erronea: la exactitud exacta ronda el 57-67% segun idioma, aunque la desviacion de una estrella supera el 93% en todos los casos, lo que sugiere usar la salida como senal ordinal robusta mas que como etiqueta exacta.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible; al entrenarse con resenas reales, puede heredar sesgos de dominio, plataforma y distribucion de los datos originales.
- Cobertura linguistica limitada a seis idiomas; cualquier otro idioma queda fuera del alcance declarado.
- Licencia MIT, permisiva para uso comercial, heredada del modelo original; no obstante, conviene verificar la atribucion a NLP Town, ya que kjarni-ai no esta afiliado ni respaldado por ellos.
- El modelo se probo con Kjarni 0.8.2; versiones distintas de la libreria podrian no estar validadas. Para uso con transformers, los ficheros se cargan correctamente segun el autor.
- No se especifican cuantizaciones oficiales ni pesos GGUF; el despliegue en formatos alternativos requeriria conversion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kjarni-ai/bert-base-multilingual-uncased-sentiment
- Modelo original: https://huggingface.co/nlptown/bert-base-multilingual-uncased-sentiment
- NLP Town: https://www.nlp.town
- Documentacion de Kjarni: https://kjarni.ai
- Script de instalacion de Kjarni: https://kjarni.ai/install.sh
- Repositorio de transformers: https://github.com/huggingface/transformers
- Licencia MIT: https://opensource.org/licenses/MIT
