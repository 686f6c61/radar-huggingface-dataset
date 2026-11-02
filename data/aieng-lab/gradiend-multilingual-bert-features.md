# aieng-lab/gradiend-multilingual-bert-features

## Resumen

GRADIEND multilingual BERT features es una coleccion de 45 modelos preentrenados que aprenden caracteristicas (features) individuales dentro de `google-bert/bert-base-multilingual-cased`. Cada modelo de la coleccion no es un modelo de lenguaje generativo, sino un encoder-decoder entrenado sobre los gradientes del modelo base para aislar una unica caracteristica linguistica o semantica: genero gramatical en aleman (23 variantes de articulo segun genero y caso), pronombres en ingles (numero, persona y pares concretos), genero en ingles (he/she), sentimiento positivo frente a negativo, y atributos de raza y religion.

El desarrollo corre a cargo de aieng-lab y se enmarca en el paquete Python `gradiend`, presentado en el articulo "The GRADIEND Python Package: An End-to-End System for Gradient-Based Feature Learning" (Drechsel y Herbold, EMNLP 2026 System Demonstrations). El metodo subyacente se describe en un segundo articulo (arXiv 2502.01406). La propuesta resuelve un problema de interpretabilidad y control: localizar donde el modelo base codifica una caracteristica concreta y disponer de pesos que permitan modificarla, por ejemplo para desbiassar representaciones.

Es relevante ahora porque ofrece una via reproducible para auditar y editar sesgos en un transformer multilingue ampliamente desplegado, con artefactos publicados por caracteristica y datasets neutrales de contraste. El repositorio ocupa unos 0,1 GB y los pesos se distribuyen en formato safetensors bajo licencia Apache 2.0. Los idiomas cubiertos por las caracteristicas son aleman e ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder entrenado sobre gradientes del modelo base (BERT multilingue); coleccion de 45 modelos, uno por caracteristica |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no documentada en la ficha) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | aleman (de), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | google-bert/bert-base-multilingual-cased |
| Libreria | gradiend |
| Tamano del repositorio | 0,1 GB |
| Numero de modelos | 45 |
| Datasets de entrenamiento | biasneutral, de-gender-case-articles, en-pronoun-neutral, en-pronouns, en-sentiment-nrc, en-sentiment-nrc-neutral, geneutral, genter, gradiend_race_data, gradiend_religion_data, namexact, wortschatz-leipzig-de-grammar-neutral |

## Arquitectura y entrenamiento

GRADIEND no entrena un modelo de lenguaje desde cero. Para cada caracteristica, entrena un encoder-decoder sobre los gradientes que el modelo base BERT multilingue produce al procesar pares de ejemplos contrastivos (por ejemplo, frases con "he" frente a frases con "she", o articulos alemanes en nominativo frente a acusativo). El resultado son pesos que indican donde el modelo base codifica esa caracteristica y que permiten manipularla en la direccion deseada.

El entrenamiento se apoya en datasets especificos por caracteristica y en sus correspondientes versiones neutrales de contraste, lo que permite separar la senal de la caracteristica del ruido del dominio. La coleccion cubre 23 modelos para articulos alemanes (combinaciones de genero y caso), 1 para genero en ingles, 14 para pronombres ingleses (numero, persona y pares concretos), 1 para sentimiento, 3 para raza y 3 para religion. Los mismos tipos de caracteristica se entrenaron tambien sobre Qwen2.5-0.5B en un repositorio paralelo, lo que sugiere un diseno metodologico transferible entre arquitecturas.

## Capacidades

- Aislamiento de caracteristicas: cada modelo localiza una caracteristica concreta (genero, numero, persona, caso, sentimiento, raza, religion) en las representaciones internas del BERT base.
- Interpretabilidad: los pesos aprendidos revelan las regiones del modelo base donde se codifica cada caracteristica.
- Edicion y desbiasado: los pesos permiten modificar la caracteristica aprendida, por ejemplo para neutralizar sesgos de genero, raza o religion.
- Analisis de genero gramatical en aleman: 23 variantes que cubren genero (femenino, masculino, neutro) cruzado con caso (nominativo, acusativo, dativo, genitivo).
- Analisis de pronombres en ingles: numero (singular/plural), persona (1vs2, 1vs3, 2vs3) y pares concretos (1PL/2SGPL, 1PL/3PL, 1SG/3SG, etc.).
- Analisis de sentimiento: eje positivo frente a negativo.
- Analisis de atributos protegidos: pares de raza (black/asian, white/asian, white/black) y religion (christian/jewish, christian/muslim, muslim/jewish).
- No es un modelo generativo: no soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Auditoria de sesgos en BERT multilingue: usar los modelos de raza y religion para localizar donde el modelo base asocia terminos con grupos protegidos y cuantificar la magnitud de la asociacion antes de desplegarlo en produccion.
- Desbiasado de representaciones: aplicar los pesos aprendidos para neutralizar la direccion de genero o religion en las representaciones internas, y medir el efecto sobre tareas posteriores.
- Analisis linguistico del genero gramatical aleman: emplear las 23 variantes de articulo para estudiar como un modelo multilingue codifica la flexion de caso y genero, util en investigacion sobre morfologia y sintaxis.
- Investigacion en interpretabilidad mecanicista: usar los pesos como mapa de localizacion de caracteristicas para estudiar circuitos internos del transformer, complementando tecnicas como probing o activation patching.
- Validacion de metodologia de feature learning: replicar el pipeline GRADIEND sobre otros modelos base (ya existe la version Qwen2.5-0.5B) para comparar como distintas arquitecturas codifican las mismas caracteristicas.
- Docencia y divulgacion: demostrar de forma tangible como un modelo codifica atributos linguisticos y sociales, con artefactos listos para inspeccionar y datasets de contraste publicados.
- Evaluacion de sesgo en pipelines de NLP: integrar los modelos como etapa de diagnostico en un pipeline de clasificacion o analisis de sentimiento para detectar asociaciones no deseadas antes del despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una metrica de "top-k overlap" (solapamiento de los 1000 pesos de decoder mas importantes entre dos modelos) para comparar caracteristicas, pero no se incluyen valores numericos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio completo ocupa 0,1 GB, por lo que la inferencia de un unico modelo de caracteristica es muy ligera.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo base BERT multilingue (unos 178 M de parametros) cabe holgadamente en GPUs de gama media e incluso en CPU para inferencia puntual.
- Cabe en GPU consumer: si, en cualquier GPU con al menos unos pocos GB de VRAM; tambien en CPU.
- Opciones de despliegue: la libreria `gradiend` es la via documentada; al estar basado en BERT multilingue, los pesos del modelo base pueden cargarse con transformers, aunque los artefactos de caracteristica requieren la libreria especifica.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aieng-lab/gradiend-multilingual-bert-features | Coleccion de 45 modelos de feature learning sobre BERT | no disponible (base: ~178 M) | no disponible | Apache 2.0 | HuggingFace |
| aieng-lab/gradiend-qwen2.5-0.5b-features | Coleccion equivalente sobre Qwen2.5-0.5B | no disponible (base: 0,5 B) | no disponible | no disponible | HuggingFace |
| google-bert/bert-base-multilingual-cased | Modelo base multilingue | ~178 M | no disponible | Apache 2.0 | HuggingFace |

La comparativa directa con modelos de interpretabilidad como probes lineales o SAEs no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no puede usarse para generar texto, responder preguntas ni ejecutar agentes; su funcion es analitica.
- Cobertura linguistica limitada: las caracteristicas entrenadas cubren solo aleman e ingles, aunque el modelo base sea multilingue.
- Dependencia de la libreria `gradiend`: los pesos no son directamente utilizables con transformers sin la libreria especifica.
- Riesgo de sobreajuste a los datasets de entrenamiento: las caracteristicas se aprenden sobre corpus concretos (por ejemplo, Wortschatz Leipzig para aleman), lo que puede limitar la generalizacion a otros dominios.
- Interpretacion de sesgos: los modelos de raza y religion reflejan asociaciones presentes en el modelo base y en los datos; no deben interpretarse como una medida objetiva de sesgo social.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento en la informacion disponible, lo que dificulta comparar su eficacia frente a alternativas.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las licencias de los datasets de entrenamiento citados.
- Fecha de creacion futura (2026): conviene verificar la vigencia y el mantenimiento del repositorio antes de adoptarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aieng-lab/gradiend-multilingual-bert-features
- Modelo base: https://huggingface.co/google-bert/bert-base-multilingual-cased
- Repositorio paralelo sobre Qwen2.5-0.5B: https://huggingface.co/aieng-lab/gradiend-qwen2.5-0.5b-features
- Repositorio del paquete: https://github.com/aieng-lab/gradiend
- Paper del paquete (arXiv 2602.23993): https://arxiv.org/abs/2602.23993
- Paper del metodo (arXiv 2502.01406): https://arxiv.org/abs/2502.01406
