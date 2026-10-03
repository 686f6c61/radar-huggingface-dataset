# ishaanamahajan/paper-triage-ranker

## Resumen

Paper Triage relevance ranker es un modelo de ranking de texto, desarrollado por el usuario ishaanamahajan, que puntúa la relevancia de un artículo científico para un investigador concreto y lo clasifica en tres categorías operativas: Read (leer), Skim (ojear) y Skip (descartar). No es un modelo generativo ni una red neuronal propia: combina siete características legibles —similitud con la descripción de investigación, con el foco actual y con la palabra clave más cercana (coseno sobre embeddings de Xenova/all-MiniLM-L6-v2), cobertura exacta de palabras clave, recencia, penalización por temas excluidos y similitud con artículos valorados previamente— y las agrega mediante una regresión ridge ponderada.

El modelo se entrena por persona, en el navegador a través de transformers.js, a partir de las valoraciones y etiquetas manuales de ese único investigador. No se comparten pesos entre usuarios: el repositorio publica la definición del modelo (config.json), el procedimiento de entrenamiento y la evaluación. Su relevancia radica en que resuelve el problema del triaje bibliográfico con muy pocas etiquetas subjetivas (decenas, no miles), funciona desde la primera visita sin datos y ofrece puntuaciones descomponibles y explicables.

Está bajo licencia MIT, solo soporta inglés y su uso principal es la aplicación Paper Triage, con una implementación de referencia en Python y otra en JavaScript para el navegador, verificadas entre sí con una tolerancia de 1e-9 en los coeficientes de la regresión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion ridge ponderada (alpha = 1, semantica de scikit-learn) sobre 7 caracteristicas derivadas de embeddings de sentence transformer; no es una red neuronal propia |
| Parametros totales | 7 coeficientes de regresion en el ranker aprendido, mas las caracteristicas calculadas por el codificador Xenova/all-MiniLM-L6-v2 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; las caracteristicas se calculan sobre titulo y abstract |
| Tipos de cuantizacion | No disponible (el ranker son coeficientes en config.json); el codificador base se ejecuta a traves de transformers.js |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | config.json (definicion del modelo y pesos de las caracteristicas); no se publican pesos entrenados compartidos entre usuarios. El codificador base es Xenova/all-MiniLM-L6-v2 |

## Arquitectura y entrenamiento

La arquitectura es un modelo de learning-to-rank de dos capas. La primera genera siete caracteristicas por articulo, cada una aproximadamente en el rango [0, 1]: similitud con la descripcion de investigacion, similitud con el foco actual, similitud con la palabra clave mas cercana (todas ellas coseno sobre embeddings MiniLM calibrados a [0, 1]), cobertura exacta de palabras clave (con mas peso si aparecen en el titulo), recencia, penalizacion por temas excluidos y similitud con los articulos que la persona marco como relevantes menos los no relevantes (media de los tres mejores, calculada leave-self-out para que un articulo no se compare consigo mismo). La segunda capa suma dos puntuaciones: una puntuacion de perfil configurada, con ponderaciones fijas definidas en config.json (features[].prior_weight), que funciona desde la primera visita sin etiquetas, y una puntuacion aprendida mediante regresion ridge sobre las mismas caracteristicas.

El entrenamiento de la regresion arranca a partir de 5 valoraciones. Los objetivos numericos son Read = 1, Skim = 0.5 y Skip = 0, con pesos por tipo de ejemplo: articulos marcados como esenciales (2.0), etiquetas manuales (1.0), correcciones (1.5), relevantes / no relevantes / guardados (1.0), abiertos (0.3) y ocultos (0.5). La puntuacion final es una mezcla validada, final = (1 - w) * perfil + w * aprendida, donde w se elige entre {0, 0.15, 0.3, 0.5, 0.7} mediante precision media con validacion cruzada de 5 particiones sobre las etiquetas manuales de la persona; el componente aprendido solo interviene si mejora el caso w = 0 en al menos 0.01. Con menos de 6 etiquetas manuales se usa w = min(0.3, n / (n + 30)). El triaje aplica umbrales de Read >= 0.62 y Skim >= 0.40 (ajustables), limita el numero de Read por el tiempo semanal de lectura (30 minutos por articulo) y vuelca el excedente a Skim; cualquier correccion manual de la persona prevalece sobre el modelo. La misma logica esta implementada dos veces, en triage/relevance.py (referencia en Python) y web/js/engine.js (navegador), con una prueba de paridad que compara los coeficientes ridge contra scikit-learn con precision de 1e-9.

## Capacidades

- Puntuacion de relevancia de articulos cientificos para un perfil de investigacion individual.
- Clasificacion en tres niveles operativos: Read, Skim y Skip.
- Aprendizaje a partir de muy pocas etiquetas subjetivas (desde 5 valoraciones).
- Funcionamiento en frio: la puntuacion de perfil produce resultados utiles sin ninguna etiqueta.
- Explicabilidad: cada puntuacion se descompone en contribuciones por caracteristica y se muestra en el panel "Why this score"; las razones citan unicamente terminos presentes en el articulo.
- Mezcla de puntuaciones validada mediante validacion cruzada de 5 particiones, con salvaguarda que desactiva el aprendizaje si no mejora el perfil.
- Ejecucion en navegador mediante transformers.js, con paridad funcional respecto a la implementacion de referencia en Python.
- No dispone de generacion de texto, tool calling, capacidades de agente, vision ni audio.
- Soporte multilingue: no; unicamente ingles.

## Casos de uso

- Triaje personal de bibliografia: un investigador pega su descripcion de investigacion y el modelo puntua y ordena los articulos candidatos, sugiriendo cuales leer, ojear o descartar. Es adecuado porque funciona con las decenas de etiquetas que una persona puede aportar y arranca sin datos.
- Revision sistematica asistida: filtrar grandes listas de resultados de busqueda academica antes de la lectura manual, priorizando los articulos con mas probabilidad de ser relevantes. La cobertura de palabras clave y la similitud semantica reducen el ruido inicial.
- Seguimiento de un tema emergente: configurar el foco actual y dejar que la similitud con el foco y la recencia ordenen las novedades. El modelo se adapta cuando cambia el foco del investigador sin reentrenamiento global.
- Filtrado por temas excluidos: aplicar la penalizacion por temas excluidos para descartar lineas de trabajo no deseadas. La caracteristica es explicita y auditable, lo que permite ajustar que se penaliza.
- Recomendacion basada en historial: usar la similitud con los articulos que la persona valoro como relevantes (media top-3, leave-self-out) para sugerir articulos parecidos a los que ya le interesaron.
- Integracion en navegador sin servidor: desplegar el ranker como componente web (transformers.js) para que las lecturas y etiquetas personales no salgan del dispositivo, evitando costes por articulo y el envio de datos a una API.
- Calibracion de umbrales por tiempo disponible: ajustar los cortes de Read/Skim segun una restriccion de tiempo semanal (por ejemplo, 30 minutos por articulo), con el excedente reclasificado como Skim.
- Evaluacion comparativa de estrategias de ranking: usar los scripts incluidos para contrastar perfil, aprendizaje, similitud semantica y palabras clave sobre un conjunto de etiquetas propio.

## Benchmarks y rendimiento

Datos de la model card. Todo con validacion cruzada de 5 particiones; "bueno" = Read, espacio MiniLM.

| Perfil | Etiquetas (Read/Skim/Skip) | Metodo | NDCG@10 | AP | Buenos en top 10 | Papers para hallar el 80% de buenos |
|---|---|---|---|---|---|---|
| RAG & LLM evaluation | 200 (6/33/161) | Personalizado | 0.97 | 1.00 | 100% | 5 |
| RAG & LLM evaluation | 200 (6/33/161) | Solo perfil | 0.97 | 1.00 | 100% | 5 |
| RAG & LLM evaluation | 200 (6/33/161) | Solo similitud semantica | 0.93 | 0.93 | 100% | 5 |
| RAG & LLM evaluation | 200 (6/33/161) | Solo palabras clave | 0.91 | 0.78 | 83% | 8 |
| RAG & LLM evaluation | 200 (6/33/161) | Orden aleatorio | — | 0.03 | 3% | 160 |
| Climate adaptation | 200 (3/24/173) | Personalizado | 0.90 | 0.83 | 100% | 6 |
| Climate adaptation | 200 (3/24/173) | Solo perfil | 0.90 | 0.83 | 100% | 6 |
| Climate adaptation | 200 (3/24/173) | Solo similitud semantica | 0.88 | 0.67 | 100% | 9 |
| Climate adaptation | 200 (3/24/173) | Solo palabras clave | 0.76 | 0.71 | 67% | 25 |
| Climate adaptation | 200 (3/24/173) | Orden aleatorio | — | 0.01 | 2% | 160 |
| Cancer immunotherapy | 100 (3/15/82) | Personalizado | 0.97 | 1.00 | 100% | 3 |
| Cancer immunotherapy | 100 (3/15/82) | Solo perfil | 0.97 | 1.00 | 100% | 3 |
| Cancer immunotherapy | 100 (3/15/82) | Solo similitud semantica | 0.98 | 0.92 | 100% | 4 |
| Cancer immunotherapy | 100 (3/15/82) | Solo palabras clave | 0.89 | 0.87 | 100% | 5 |
| Cancer immunotherapy | 100 (3/15/82) | Orden aleatorio | — | 0.03 | 3% | 80 |

Comparativa MiniLM frente a TF-IDF (ranker personalizado, AP para Read): RAG & LLM evaluation 1.00 frente a 0.83; Climate adaptation 0.83 frente a 0.78; Cancer immunotherapy 1.00 frente a 1.00. La mezcla con validacion cruzada eligio un peso de aprendizaje del 0% en los tres perfiles: el entrenamiento sobre estas etiquetas no supero a la puntuacion de perfil, por lo que la salvaguarda mantuvo el aprendizaje desactivado (el AP del aprendizaje en solitario es inferior en todos los perfiles).

## Requisitos de hardware

- El ranker en si (7 coeficientes de regresion ridge) se entrena en milisegundos y no requiere GPU; puede ejecutarse en el navegador o en CPU.
- El componente que consume recursos es el codificador de embeddings Xenova/all-MiniLM-L6-v2, un modelo pequeno de sentence transformer apto para CPU.
- VRAM estimada: no se publican cifras; por el tamano del codificador, la inferencia de embeddings es viable en hardware de consumo e incluso en CPU.
- GPU recomendadas: no se especifican; no son necesarias para el flujo previsto (navegador/CPU). No hay datos publicados para A100, H100 o RTX 4090.
- Cabe en GPU de consumo: no se proporcionan datos especificos, pero el diseno esta pensado para ejecutarse en el navegador via transformers.js, lo que implica compatibilidad con hardware de consumo.
- Opciones de despliegue: transformers.js en navegador (web/js/engine.js) y scikit-learn en Python (triage/relevance.py). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a esta arquitectura.
- Latencia y throughput estimados: no disponibles; la model card solo indica que el entrenamiento de la regresion es del orden de milisegundos.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Entrenamiento | AP (Read) segun evaluacion de la model card | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Paper Triage relevance ranker | Ridge sobre 7 caracteristicas de embeddings MiniLM | 7 coeficientes | Por usuario, desde 5 valoraciones, en navegador | 1.00 / 0.83 / 1.00 (tres perfiles) | MIT | Repositorio del modelo con definicion y scripts |
| Similitud semantica pura (Xenova/all-MiniLM-L6-v2) | Similitud coseno de embeddings | No disponible | Sin entrenamiento por usuario | 0.93 / 0.67 / 0.92 (linea base en la misma evaluacion) | Licencia del modelo base | HuggingFace |
| Coincidencia de palabras clave (TF-IDF) | Recuperacion lexica | No aplica | Sin entrenamiento por usuario | 0.83 / 0.78 / 1.00 (linea base en la misma evaluacion) | No disponible | Referencia incluida en la evaluacion |
| Cross-encoder ajustado (alternativa descartada) | Re-ranking con cross-encoder | No disponible | Requiere muchas mas etiquetas y GPU | No disponible | No disponible | No disponible |

Las cifras de las lineas base y del ranker personalizado proceden de la tabla de evaluacion de la model card; los valores del cross-encoder no se publican en la informacion disponible.

## Limitaciones y advertencias

- Sesgo de diseno: aprende de etiquetas subjetivas de una sola persona, por lo que no se generaliza a otros usuarios; no se comparten pesos entre usuarios.
- Riesgo de sobreajuste a etiquetas escasas: con pocas etiquetas Read (3 a 6 por perfil) el AP para Read varia mucho ante la inclusion o exclusion de un unico articulo.
- Etiquetas iniciales sugeridas por un modelo de lenguaje: en el conjunto reportado, las etiquetas partieron de sugerencias de un LLM que leyo el mismo titulo y abstract, lo que hace optimista la concordancia con los rankers de similitud de texto.
- La mezcla validada eligio peso de aprendizaje 0% en los tres perfiles evaluados, es decir, el componente aprendido no aporto mejora sobre la puntuacion de perfil en esos datos.
- Idioma: solo ingles; no hay soporte multilingue.
- Dependencia del codificador base: la calidad de las caracteristicas de similitud depende de los embeddings de Xenova/all-MiniLM-L6-v2 y de su dominio de entrenamiento.
- Alcance funcional limitado: no genera texto, no soporta tool calling, agentes, vision ni audio; es exclusivamente un ranker de relevancia.
- Longitud de contexto y cuantizacion no especificadas en la documentacion aportada; conviene verificar el comportamiento sobre abstracts largos.
- Licencia MIT, que permite uso comercial; no obstante, deben respetarse las condiciones del modelo base y del conjunto de datos cuando se redistribuyan.
- Uso en produccion: el modelo requiere datos de interaccion por usuario para activar la parte aprendida, por lo que en un servicio multiusuario implica un entrenamiento y almacenamiento por persona.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ishaanamahajan/paper-triage-ranker
- Conjunto de datos: https://huggingface.co/datasets/ishaanamahajan/paper-triage-dataset
- Modelo base: https://huggingface.co/Xenova/all-MiniLM-L6-v2
- Repositorio de la aplicacion Paper Triage: https://github.com/srivathsanb14/research-paper-triage
- Informe de evaluacion completo (docs/evaluation/report.md dentro del repositorio de la aplicacion): https://github.com/srivathsanb14/research-paper-triage

En la busqueda web no se han encontrado enlaces adicionales relevantes para este modelo.
