# aieng-lab/gradiend-qwen2.5-0.5b-features

## Resumen

GRADIEND features in Qwen2.5-0.5B es una coleccion de 45 modelos de caracteristicas (feature models) entrenados sobre el modelo base Qwen/Qwen2.5-0.5B. No es un modelo generativo al uso: cada uno de los 45 checkpoints aprende una unica caracteristica linguistica o de sesgo dentro del modelo base (por ejemplo, la distincion *he* frente a *she*, pronombres singulares frente a plurales, el caso de los articulos alemanes o el sentimiento positivo frente al negativo). Los pesos aprendidos indican donde codifica el modelo base esa caracteristica y permiten modificarla, por ejemplo para desbiassar las representaciones internas.

El desarrollo corre a cargo del grupo aieng-lab y se enmarca en el paquete Python `gradiend`, presentado en el articulo "The GRADIEND Python Package: An End-to-End System for Gradient-Based Feature Learning" (Drechsel y Herbold, EMNLP 2026 System Demonstrations). La tecnica entrena un encoder-decoder sobre los gradientes del modelo base, de modo que cada checkpoint actua como una sonda interpretable y como un mecanismo de intervencion sobre una direccion concreta del espacio de activaciones.

Su relevancia actual es practica para investigadores de interpretabilidad y equipos que necesitan auditar o mitigar sesgos en modelos pequenos desplegables en local: el modelo base tiene 0,5 mil millones de parametros, la licencia es Apache 2.0 y los pesos se distribuyen en safetensors. La coleccion cubre sesgos de genero, raza y religion, ademas de fenomenos gramaticales del aleman y el ingles, lo que la convierte en un banco de pruebas reproducible para estudiar donde y como se codifica un atributo en un transformer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder de caracteristicas entrenado sobre los gradientes de un transformer decoder-only (Qwen2.5-0.5B) |
| Parametros totales | 45 checkpoints de caracteristicas sobre un modelo base de 0,5 mil millones de parametros (parametros exactos de cada checkpoint: no disponible) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen2.5-0.5B; no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Aleman (de) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Cada uno de los 45 modelos aprende una unica caracteristica mediante el metodo GRADIEND: se entrena un encoder-decoder sobre los gradientes del modelo base Qwen2.5-0.5B. El resultado son pesos que localizan donde se codifica esa caracteristica en el modelo base y que permiten intervenir sobre ella, por ejemplo para desbiassar la representacion. La coleccion se organiza por run ids, uno por carpeta dentro del repositorio, y cada run id corresponde a una caracteristica concreta.

Las caracteristicas cubiertas se agrupan en ocho familias: articulos alemanes (genero x caso, 23 modelos), genero en ingles *he*/*she* (1), numero de pronombres (1), persona de pronombres (3), pares de pronombres en ingles (10), sentimiento (1), raza (3) y religion (3). El entrenamiento emplea datasets especificos por caracteristica, con variantes neutrales para el contraentrenamiento o la evaluacion: `aieng-lab/de-gender-case-articles`, `aieng-lab/genter`, `aieng-lab/namexact`, `aieng-lab/en-pronouns`, `aieng-lab/en-sentiment-nrc`, `aieng-lab/gradiend_race_data`, `aieng-lab/gradiend_religion_data`, junto con los conjuntos neutrales `aieng-lab/wortschatz-leipzig-de-grammar-neutral`, `aieng-lab/geneutral`, `aieng-lab/en-pronoun-neutral`, `aieng-lab/en-sentiment-nrc-neutral` y `aieng-lab/biasneutral`. No se detalla en la informacion disponible el numero de tokens de entrenamiento ni si hubo RLHF o DPO, algo esperable dado que no se trata de un modelo de lenguaje generativo.

Como innovacion tecnica destacable, el metodo convierte el analisis de gradientes en un pipeline reproducible y empaquetado (`gradiend`), con la misma metodologia aplicada tambien a `google-bert/bert-base-multilingual-cased` en la coleccion hermana `aieng-lab/gradiend-multilingual-bert-features`. La model card menciona ademas una metrica de comparacion entre caracteristicas basada en el solapamiento top-k de los 1000 pesos del decoder mas importantes entre dos modelos.

## Capacidades

- Aprendizaje y localizacion de caracteristicas: cada checkpoint identifica donde codifica el modelo base un atributo concreto (genero, numero, persona, caso, sentimiento, raza, religion).
- Intervencion sobre representaciones: los pesos permiten modificar la caracteristica aprendida, por ejemplo para desbiassar el modelo base.
- Analisis de sesgo: cobertura explicita de genero (he/she), raza (black/asian/white) y religion (christian/jewish/muslim) con conjuntos neutrales asociados.
- Analisis gramatical multilingue: 23 modelos para genero y caso de articulos alemanes y 14 modelos para pronombres en ingles (numero, persona y pares concretos).
- Analisis de sentimiento: un modelo para la dicotomia positivo/negativo sobre el corpus NRC.
- Comparacion entre caracteristicas: metrica de solapamiento top-k de pesos del decoder para estudiar relaciones entre atributos.
- Integracion via paquete `gradiend`: carga y uso programatico a traves de la libreria homonima y de `huggingface_hub`.
- No es un modelo de generacion de texto, codigo, vision ni tool calling; no se documentan capacidades de agente ni modo thinking.

## Casos de uso

- Auditoria de sesgo de genero en produccion: cargar el checkpoint `gender_en` y aplicar la intervencion sobre las activaciones de Qwen2.5-0.5B para medir y reducir la asociacion *he*/*she* en tareas de clasificacion o generacion corta, con el conjunto neutral `geneutral` como control.
- Mitigacion de sesgo racial y religioso: usar los checkpoints `race_*` y `religion_*` junto con `aieng-lab/biasneutral` para localizar y atenuar asociaciones estereotipadas antes de desplegar un modelo pequeno en un entorno con requisitos de equidad.
- Investigacion en interpretabilidad mecanicista: analizar los pesos del decoder para determinar en que capas y dimensiones se codifica una caracteristica, y comparar el solapamiento top-k entre caracteristicas relacionadas (por ejemplo, `pronoun_1SG_3SG` frente a `pronoun_1SG_3PL`).
- Ensenanza y reproduccion experimental: el pipeline `gradiend` permite a un curso o laboratorio reproducir el entrenamiento de una caracteristica sobre un modelo de 0,5 B en hardware modesto y comparar resultados con la coleccion publicada.
- Procesamiento de gramatica alemana: emplear los 23 checkpoints de articulos (genero x caso) para estudiar como un modelo multilingue codifica el caso nominativo, acusativo, dativo y genitivo, y para corregir errores sistematicos en tareas de generacion controlada en aleman.
- Analisis de sentimiento controlado: usar `sentiment_positive_negative` para aislar la direccion de sentimiento en las activaciones y evaluar si otras tareas del modelo base se ven contaminadas por esa direccion.
- Validacion cruzada entre arquitecturas: replicar los experimentos sobre BERT multilingue con la coleccion hermana y comparar donde se codifica cada caracteristica en un encoder frente a un decoder-only.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una metrica de solapamiento top-k entre modelos de caracteristicas, pero no se proporcionan valores numericos en la informacion accesible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de checkpoints de caracteristicas sobre un modelo base de 0,5 B de parametros, la huella es reducida; el valor exacto por checkpoint no esta disponible. El repositorio completo ocupa 1,1 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM es suficiente para el modelo base en precision completa; para trabajar con los 45 checkpoints a la vez conviene una GPU con 16-24 GB (RTX 4090, A10, L4).
- Cabe en GPU consumer: si, incluidas RTX 3060, RTX 4060 y superiores, dado el tamano del modelo base.
- Opciones de despliegue: el paquete `gradiend` es la via documentada; el modelo base Qwen2.5-0.5B puede servirse con vLLM, llama.cpp, Ollama o TGI, aunque los checkpoints de caracteristicas no son modelos generativos y no se despliegan como servidores de inferencia de texto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros base | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aieng-lab/gradiend-qwen2.5-0.5b-features | 0,5 B (Qwen2.5-0.5B) | No disponible | 45 checkpoints de caracteristicas por gradientes | Apache 2.0 | HuggingFace, 0 descargas |
| aieng-lab/gradiend-multilingual-bert-features | BERT base multilingue | No disponible | Misma metodologia sobre encoder BERT | No disponible en la informacion | HuggingFace |
| Qwen/Qwen2.5-0.5B | 0,5 B | No disponible en la informacion | Modelo generativo base | Apache 2.0 | HuggingFace |

La comparacion directa con modelos de interpretabilidad como SAEs (sparse autoencoders) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni responde a prompts; su uso esta limitado al analisis e intervencion sobre el modelo base.
- Cobertura limitada a dos idiomas (aleman e ingles) y a un conjunto cerrado de 45 caracteristicas; no cubre otros sesgos ni fenomenos linguisticos.
- Los resultados dependen del modelo base Qwen2.5-0.5B; las conclusiones no se extrapolan directamente a modelos mayores ni a otras arquitecturas.
- Riesgo de interpretacion erronea: el solapamiento top-k entre caracteristicas no implica causalidad; se requiere validacion con los conjuntos neutrales.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan garantias sobre la eficacia del desbiasado en produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion externa de la comunidad.
- No se documentan ni cuantizaciones ni requisitos de memoria por checkpoint, lo que dificulta planificar despliegues a gran escala.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aieng-lab/gradiend-qwen2.5-0.5b-features
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Coleccion hermana en BERT multilingue: https://huggingface.co/aieng-lab/gradiend-multilingual-bert-features
- Repositorio del paquete: https://github.com/aieng-lab/gradiend
- Paper del paquete: https://arxiv.org/abs/2602.23993
- Paper del metodo: https://arxiv.org/abs/2502.01406
- Dataset de articulos alemanes: https://huggingface.co/datasets/aieng-lab/de-gender-case-articles
- Dataset de genero en ingles: https://huggingface.co/datasets/aieng-lab/genter
- Dataset neutral de genero: https://huggingface.co/datasets/aieng-lab/geneutral
- Dataset de pronombres: https://huggingface.co/datasets/aieng-lab/en-pronouns
- Dataset neutral de pronombres: https://huggingface.co/datasets/aieng-lab/en-pronoun-neutral
- Dataset de sentimiento: https://huggingface.co/datasets/aieng-lab/en-sentiment-nrc
- Dataset neutral de sentimiento: https://huggingface.co/datasets/aieng-lab/en-sentiment-nrc-neutral
- Dataset de raza: https://huggingface.co/datasets/aieng-lab/gradiend_race_data
- Dataset de religion: https://huggingface.co/datasets/aieng-lab/gradiend_religion_data
- Dataset neutral de sesgo: https://huggingface.co/datasets/aieng-lab/biasneutral
- Dataset de nombres: https://huggingface.co/datasets/aieng-lab/namexact
- Dataset neutral de gramatica alemana: https://huggingface.co/datasets/aieng-lab/wortschatz-leipzig-de-grammar-neutral
