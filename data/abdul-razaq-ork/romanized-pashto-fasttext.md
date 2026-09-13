# abdul-razaq-ork/romanized-pashto-fasttext

## Resumen

El modelo `romanized-pashto-fasttext` es un clasificador supervisado de FastText desarrollado por Abdul Razaq para la identificacion binaria de pashto romanizado, es decir, pashto escrito con caracteres latinos en lugar del alfabeto pashto/arabe derivado. Devuelve dos etiquetas mutuamente excluyentes: `__label__pashto` y `__label__not_pashto`, donde la clase negativa agrupa ejemplos de ingles y urdu romanizado.

El problema que aborda es la deteccion de una variedad linguistica de bajos recursos, sin ortografia estandarizada y muy frecuente en redes sociales, donde el pashto aparece mezclado con ingles y urdu (texto code-mixed). Los detectores de idioma convencionales rinden mal en este escenario porque se apoyan en vocabularios y ortografias canonicas que el pashto romanizado no posee.

Se trata de un modelo ligero basado en FastText, no de un transformer generativo: no produce texto, no razona y no tiene ventana de contexto en el sentido habitual. Su relevancia es practica: sirve como etapa de filtrado barata y rapida antes de modelos mas costosos, para construir corpus, limpiar datasets multilingues o seleccionar candidatos para anotacion manual. No se han publicado el numero de parametros, el tamano del vocabulario ni resultados de evaluacion detallados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastText supervisado (bolsa de palabras y n-gramas de subpalabras) |
| Parametros totales | No disponible (no se publica dimensionalidad de embeddings ni tamano de vocabulario) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como ventana tipo transformer; clasificador de bolsa de n-gramas sin longitud de entrada documentada |
| Tipos de cuantizacion | No especificado en la informacion disponible; FastText admite product quantization, pero no se documenta su uso en esta ficha |
| Idiomas soportados | Pashto romanizado (clase positiva); ingles y urdu romanizado (clase negativa) |
| Licencia | Apache-2.0 |
| Formato de pesos | Modelo binario de FastText (`model.bin`) |
| Tarea | Clasificacion de texto / identificacion de idioma binaria |
| Etiquetas | `__label__pashto`, `__label__not_pashto` |
| Libreria | fasttext |
| Desarrollador | Abdul Razaq |
| Fecha de creacion (segun repositorio) | 2026-09-13 |
| Fecha de actualizacion (segun repositorio) | 2026-09-13 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es FastText supervisado, un clasificador lineal que representa cada documento como la media de los vectores de sus palabras y de los n-gramas de caracteres que las componen. Esta representacion de subpalabras es relevante en pashto romanizado, donde una misma palabra admite multiples transliteraciones: los n-gramas de caracteres permiten generalizar entre variantes ortograficas aunque la forma exacta no aparezca en el vocabulario de entrenamiento. La salida es una distribucion de probabilidad sobre las dos etiquetas, y la clase predicha es la de mayor probabilidad.

Respecto a los datos, la clase positiva la forman textos de pashto escrito con caracteres latinos y la clase negativa ejemplos que no son pashto, en concreto ingles y urdu romanizado. La model card indica que se aplico un pipeline de preprocesamiento de texto antes del entrenamiento, disenado para conservar informacion lexica y a nivel de caracter, pero no detalla el numero de ejemplos, la procedencia de los datos, ni los hiperparametros concretos (dimensión de embedding, learning rate, numero de epocas, tamano de n-gramas). No se menciona uso de RLHF, DPO ni tecnicas de ajuste por preferencias, algo coherente con un clasificador supervisado clasico.

## Capacidades

- Clasificacion binaria de texto: determina si una entrada es pashto romanizado (`pashto`) o no (`not_pashto`).
- Identificacion de idioma en texto romanizado y de bajos recursos, con soporte para variacion ortografica gracias a los n-gramas de subpalabras.
- Manejo de texto code-mixed: la clase negativa incluye ingles y urdu romanizado, lo que permite discriminar pashto romanizado de esas lenguas en contextos de mezcla.
- Devuelve una probabilidad de confianza por etiqueta, util para umbralizar y para revision humana.
- Inferencia en CPU con latencia muy baja, adecuada como etapa de filtrado previo a modelos mas costosos.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No esta disenado para agentes ni razonamiento multi-paso.
- No se documenta modo thinking ni capacidades multimodales (audio, imagen).

## Casos de uso

- Filtrado de corpus para construir datasets de pashto romanizado: se ejecuta el clasificador sobre grandes volumenes de texto de redes sociales y se conservan solo los documentos con etiqueta `pashto` por encima de un umbral de confianza, reduciendo el coste de anotacion posterior.
- Limpieza de datasets multilingues: en un corpus que mezcla ingles, urdu romanizado y pashto romanizado, el modelo separa las tres poblaciones y permite etiquetar y dividir el material por lengua de origen.
- Preanotacion en flujos human-in-the-loop: el modelo propone candidatos `pashto` que despues revisa un anotador humano, acelerando la construccion de gold standards en una lengua de bajos recursos.
- Analisis de sentimiento en pashto romanizado: se usa como etapa previa que filtra el texto relevante y lo pasa a un clasificador de sentimiento especifico, evitando que este ultimo procese entradas en otros idiomas.
- Monitorizacion de contenido en redes sociales: permite estimar la proporcion de contenido en pashto romanizado en un flujo dado, con revision humana obligatoria antes de cualquier accion de moderacion.
- Enrutado de consultas en sistemas multilingues: en un chatbot o buscador que atiende varios idiomas, el modelo decide si una consulta debe enviarse al pipeline de pashto o al de otra lengua.
- Investigacion en linguistica de bajos recursos: analisis de distribuciones de variantes ortograficas y de patrones de code-mixing a partir de las etiquetas y probabilidades generadas.
- Preprocesado en pipelines de PLN: insercion como primer paso de bajo coste antes de aplicar modelos mas pesados, tal y como sugiere la propia model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de evaluacion, matrices de confusion, precision, recall ni F1 para ninguna particion de datos. El unico dato numerico presente es un ejemplo ilustrativo de prediccion (`za kha yam` con etiqueta `pashto` y probabilidad 0,98), que no constituye una evaluacion de rendimiento y no debe interpretarse como tal.

## Requisitos de hardware

- VRAM para inferencia: practicamente nula; FastText esta disenado para inferencia en CPU y no requiere GPU.
- GPU recomendadas: no aplica; no se necesita GPU para este tipo de modelo.
- Compatibilidad con GPU de consumo: irrelevante, ya que la inferencia se realiza en CPU. El modelo cabe en cualquier equipo convencional, incluidos portatiles y entornos sin acelerador.
- Espacio en disco: no disponible; no se publica el tamano del archivo `model.bin`, que depende de la dimensionalidad y del vocabulario, no especificados.
- Opciones de despliegue: libreria Python `fasttext` (`pip install fasttext`), CLI de FastText y la libreria C++; no es compatible con servidores pensados para transformers como vLLM, TGI u Ollama.
- Latencia y throughput: no se han publicado mediciones especificas. Los clasificadores FastText de este tipo suelen operar en el rango de microsegundos a pocos milisegundos por prediccion en CPU, pero este dato no esta confirmado para este modelo concreto.
- Memoria RAM: no disponible; depende del tamano del modelo, que no se documenta.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Especializacion en pashto romanizado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| romanized-pashto-fasttext | FastText supervisado, clasificacion binaria | Pashto romanizado, ingles, urdu romanizado | Si, especifica | Apache-2.0 | Hugging Face (fasttext) |
| fastText lid.176 (Meta) | FastText supervisado, clasificacion multietiqueta | Cobertura general de mas de un centenar de idiomas | No documentada para pashto romanizado | No disponible en la informacion consultada | Distribucion publica de fastText |
| GlotLID | Clasificador de identificacion de idioma | Cobertura amplia de lenguas de bajos recursos | No orientada especificamente a pashto romanizado | No disponible en la informacion consultada | Repositorio publico |
| Detectores heuristicos o basados en reglas (langdetect, CLD3) | Estadistico / heuristico | Variable | Bajo rendimiento esperado en texto romanizado no estandarizado | Depende de la implementacion | Amplia |

Las cifras de parametros, contexto y rendimiento de las alternativas no se detallan aqui porque no forman parte de la informacion proporcionada; deben verificarse en sus repositorios oficiales antes de cualquier decision.

## Limitaciones y advertencias

- El pashto romanizado carece de un sistema ortografico estandarizado: una misma palabra admite varias transliteraciones, lo que degrada la clasificacion.
- La clase negativa solo cubre ingles y urdu romanizado. Otras lenguas no representadas en el entrenamiento pueden clasificarse de forma poco fiable.
- Rendimiento sensible a textos muy cortos, escritura informal, variacion dialectal, prestamos del ingles, vocabulario no visto y jerga propia de redes sociales.
- El modelo esta disenado para pashto romanizado; no debe asumirse que identifique correctamente pashto escrito en su alfabeto pashto/arabe derivado.
- Riesgo de alucinacion en el sentido de falsos positivos y negativos: las probabilidades son estimaciones y no deben tratarse como verdad linguistica.
- Uso fuera de alcance prohibido o desaconsejado por el autor: determinar etnia o nacionalidad, identidad de personas, decisiones legales, de inmigracion, de empleo o educativas, y moderacion o borrado automatico sin revision humana.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en dominios concretos.
- Sin datos publicados de evaluacion, tamano, dimensionalidad ni composicion del dataset de entrenamiento, lo que dificulta reproducir o auditar el modelo.
- El repositorio registra 0 descargas y 0 likes, y no cuenta con paper ni demo asociados: la validacion externa es inexistente por el momento.
- Se recomienda fijar un umbral de confianza, inspeccionar manualmente las predicciones dudosas y evaluar el modelo en el dominio objetivo antes de usarlo en produccion.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/abdul-razaq-ork/romanized-pashto-fasttext
- Documentacion de FastText: https://fasttext.cc/
- Repositorio de FastText en GitHub: https://github.com/facebookresearch/fastText
- Paper de referencia de FastText (Bag of Tricks for Efficient Text Classification): https://arxiv.org/abs/1607.01759
- Paper de FastText con subpalabras (Enriching Word Vectors with Subword Information): https://arxiv.org/abs/1607.04606
- No se han encontrado paper, blog, demo ni repositorio adicionales especificos de este modelo en la busqueda web realizada.
