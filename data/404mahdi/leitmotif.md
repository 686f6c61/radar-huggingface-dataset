# 404mahdi/leitmotif

## Resumen

Leitmotif es un modelo multimodal de recuperación de información musical (music information retrieval, MIR) desarrollado por Mahdi Hasan (usuario 404mahdi) como proyecto individual para la asignatura CSE425 (Neural Networks) de la BRAC University. El modelo propone leer una canción de dos formas simultáneas: como un grafo construido a partir de su propia estructura sonora y como el texto con el que las personas la describen. Para ello, segmentos de un segundo de audio se convierten en nodos de un grafo, las aristas conectan segmentos consecutivos o acústicamente similares, una red neuronal de grafos (GNN) codifica esa estructura y BERT codifica la descripción textual, todo dentro de un espacio de embeddings compartido entrenado con una pérdida contrastiva InfoNCE.

El repositorio publica dos etapas de entrenamiento: la etapa 4, un doble codificador contrastivo (codificador de grafo + BERT) con un índice precalculado de 2.555 clips de test, y la etapa 3, un etiquetador de fusión por cross-attention sobre 50 etiquetas de contexto. También incluye los ficheros de configuración exacta de cada ejecución y las estadísticas de normalización de características de nodo, necesarias para que la inferencia coincida con el entrenamiento.

Su relevancia es fundamentalmente metodológica y honesta: el propio autor documenta que el grafo de audio no supera a BERT en las métricas agregadas de etiquetado (0,440 de Macro-F1 frente a 0,468 de BERT con subtítulos enmascarados), y que la recuperación ronda veinte veces el azar, no calidad de producción. Se publica porque el hallazgo real está en el detalle por etiqueta: el audio aporta cuando el texto enmascarado se queda mudo (quién canta, qué instrumentos suenan) y penaliza cuando las palabras restantes ya describen bien la etiqueta. Es, por tanto, una línea base reproducible y bien documentada más que un sistema listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Doble codificador multimodal: red neuronal de grafos (GNN) para el audio + BERT para el texto, con espacio de embeddings compartido. Etapa 3: fusion por cross-attention sobre 50 etiquetas |
| Parametros totales | no disponible (el codificador de texto es google-bert/bert-base-uncased, 110 M de parametros; no se especifica el tamano del codificador de grafo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens en el codificador de texto (BERT-base); no disponible para el codificador de grafo |
| Tipos de cuantizacion | no disponible (solo se publican checkpoints en punto flotante) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT (el codigo); el dataset google/MusicCaps es CC BY-SA 4.0 y mantiene sus propios terminos |
| Formato de pesos | PyTorch (.pt), mas ficheros .json de configuracion de ejecucion y .pt de estadisticas de normalizacion de nodos |

## Arquitectura y entrenamiento

La entrada de audio se trocea en segmentos de un segundo que actuan como nodos de un grafo; las aristas unen segmentos que son consecutivos en el tiempo o que suenan de forma parecida. Una GNN propaga informacion sobre esa topologia para producir un embedding acustico que captura estructura musical (repeticiones, similitudes entre secciones) en lugar de trabajar sobre tramas aisladas. En paralelo, google-bert/bert-base-uncased codifica el subtitulo o descripcion textual. La etapa 4 alinea ambos espacios con una perdida contrastiva InfoNCE, de modo que el grafo y el texto de un mismo fragmento quedan proximos entre si. La etapa 3 anade un modulo de fusion por cross-attention que produce predicciones sobre 50 etiquetas de contexto.

El entrenamiento se realizo sobre google/MusicCaps, con clips de 10 segundos a 16 kHz, en una unica GPU RTX 5060 para portatiles con 8 GB de VRAM. El repositorio incluye, por cada checkpoint, el JSON con la configuracion exacta de la ejecucion y las estadisticas de normalizacion de caracteristicas de nodo, un detalle poco habitual que permite reproducir la inferencia en las mismas condiciones que el entrenamiento. No se especifican en la informacion disponible el numero total de tokens o clips de entrenamiento, ni el uso de RLHF o DPO (no aplicables a este tipo de tarea de representacion).

## Capacidades

- Recuperacion texto a audio: dada una consulta como "a sad piano ballad with strings", devuelve los clips de MusicCaps mas cercanos segun el embedding compartido.
- Recuperacion audio a texto: dado un audio, devuelve las descripciones textuales mas proximas en el mismo espacio de embeddings.
- Etiquetado de contexto musical: prediccion sobre 50 etiquetas de contexto a partir de audio y texto (por ejemplo quien canta o que instrumentos aparecen).
- Explicabilidad mediante atencion: el metodo `explain` devuelve la matriz de atencion entre palabras y segmentos, permitiendo trazar que palabra del subtitulo se asocia a cada fragmento de audio.
- Representacion estructural del audio: el grafo de segmentos de un segundo modela relaciones de sucesion y similitud, lo que habilita comparaciones de estructura entre fragmentos.
- Busqueda sobre indice precalculado: el fichero `stage4_contrastive_pretrained_index.pt` contiene embeddings de grafo y de texto ya calculados para los 2.555 clips de test, con sus identificadores de YouTube.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision ni audio generativo: es un modelo de representacion y recuperacion, no un modelo generativo de texto.

## Casos de uso

- Etiquetado asistido de catalogos musicales: sobre un corpus de clips de 10 segundos se pueden predecir las 50 etiquetas de contexto y usarlas como propuesta que un humano revisa. Es util precisamente en las etiquetas de interprete e instrumentacion, donde el autor documenta que el audio aporta informacion mas alla del texto.
- Recuperacion semantica en demos y prototipos: la funcion `search` permite construir una interfaz donde el usuario describe con lenguaje natural lo que busca y el sistema ordena clips por similitud. Dado que la calidad es de aproximadamente veinte veces el azar, es adecuado para validar una idea de producto, no para un buscador en produccion.
- Analisis de estructura musical: al representar cada segundo como nodo y unir segmentos similares, el grafo permite estudiar repeticiones y similitudes internas de una pieza, util en herramientas de analisis o educacion musical.
- Auditoria y explicabilidad de modelos multimodales: la salida de atencion palabras por segmentos sirve para investigar que evidencia usa el modelo y en que casos la fusion de modalidades ayuda o perjudica.
- Linea base reproducible para investigacion en MIR: al publicar checkpoints, configuraciones de ejecucion y estadisticas de normalizacion, otro grupo puede reproducir los resultados de recuperacion y etiquetado y comparar sus propias variantes contra ellos.
- Anotacion de metadatos sobre corpus con licencia compatible: el modelo se puede aplicar a clips de MusicCaps (CC BY-SA 4.0) respetando los terminos del dataset, para enriquecer descripciones o generar etiquetas auxiliares.
- Sistemas de recomendacion por similitud: el indice precalculado de 2.555 clips permite construir un recomendador "mas como esto" a partir de los embeddings de grafo, sin reentrenar el modelo.
- Material docente sobre fusion multimodal: el par de baselines incluidos (solo grafo, solo BERT, concatenacion temprana y cross-attention) sirve como caso de estudio de cuando la fusion de modalidades aporta y cuando no.

## Benchmarks y rendimiento

Recuperacion sobre 2.555 clips de test de MusicCaps. El azar para R@10 es 0,004 segun la model card:

| Direccion | R@1 | R@5 | R@10 | Rango mediano |
|---|---|---|---|---|
| Subtitulo a audio | 0.013 | 0.051 | 0.087 | 151 |
| Audio a subtitulo | 0.013 | 0.056 | 0.095 | 140 |

Etiquetado sobre los mismos clips, con las palabras de etiqueta enmascaradas en los subtitulos, 50 etiquetas:

| Modelo | Macro-F1 | Micro-F1 | AUC-PR |
|---|---|---|---|
| Solo grafo (audio) | 0.227 | 0.304 | 0.170 |
| Solo BERT (subtitulo enmascarado) | 0.468 | 0.556 | 0.459 |
| Concatenacion temprana | 0.448 | 0.535 | 0.438 |
| Cross-attention (checkpoint publicado) | 0.440 | 0.528 | 0.428 |

El autor indica que la ablacion completa por etiqueta esta en el informe del proyecto; la model card solo presenta los agregados.

## Requisitos de hardware

- Entrenamiento: una unica GPU RTX 5060 para portatiles con 8 GB de VRAM, con clips de 10 segundos a 16 kHz.
- Inferencia: el repositorio completo ocupa 0,9 GB, por lo que los checkpoints en punto flotante y el indice precalculado caben sin problema en GPUs de consumo con 8 GB o menos; tambien es viable ejecutar en CPU para pruebas puntuales.
- GPUs recomendadas: no se especifican oficialmente. Por tamano, cualquier GPU de consumo reciente (por ejemplo serie RTX 30 o 40) es suficiente; no se requiere A100 ni H100.
- No se publican versiones cuantizadas (GGUF, GPTQ, AWQ) ni adaptadas a llama.cpp, Ollama, vLLM o TGI, ya que no se trata de un modelo de lenguaje generativo sino de un doble codificador con una envoltura de inferencia propia (`src/inference.py`), que espera los ficheros en `checkpoints/`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se proporcionan en la informacion disponible datos de otros modelos de audio-texto con los que comparar parametros, contexto o rendimiento. La unica comparacion documentada es interna, contra las ablaciones del propio proyecto:

| Sistema | Macro-F1 (etiquetado) | R@10 (recuperacion) | Licencia | Disponibilidad |
|---|---|---|---|---|
| Leitmotif (cross-attention, etapa 3) | 0.440 | 0.087 (subtitulo a audio) | MIT | Pesos en HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| Leitmotif, solo grafo (ablacion) | 0.227 | no disponible | MIT | Incluido en el informe |
| BERT-base con subtitulo enmascarado (ablacion) | 0.468 | no disponible | MIT (pesos BERT con su propia licencia) | Base publica google-bert/bert-base-uncased |
| Alternativas externas de recuperacion audio-texto (por ejemplo familia CLAP) | no disponible | no disponible | no disponible | no disponible |

No se han encontrado en la busqueda web resultados relevantes sobre este modelo ni sobre modelos comparables que aporten cifras verificables.

## Limitaciones y advertencias

- El propio autor declara que, en las metricas agregadas de etiquetado, el grafo de audio no supera al texto por si solo: el checkpoint publicado (0,440 Macro-F1) queda por debajo de la linea base de BERT (0,468).
- La calidad de recuperacion es de aproximadamente veinte veces el azar, no apta para busqueda en produccion; el rango mediano de acierto es de 140-151 sobre 2.555 clips.
- Solo soporta subtitulos en ingles; no hay capacidades multilingues.
- Hereda el sesgo de genero y cultural de MusicCaps, tal y como advierte la model card.
- Entrenado con clips de 10 segundos; el comportamiento con audios mucho mas largos o con frecuencias de muestreo distintas a 16 kHz no esta documentado y requeriria revalidacion.
- La inferencia depende de la envoltura propia del proyecto y de ficheros auxiliares (configuracion de ejecucion y estadisticas de normalizacion de nodos); usar los checkpoints de forma aislada puede producir resultados distintos a los publicados.
- La licencia MIT cubre el codigo del modelo, pero el dataset MusicCaps es CC BY-SA 4.0 y mantiene sus propios terminos, que hay que respetar en cualquier uso derivado.
- La etapa 4 usa una perdida contrastiva con un indice precalculado de 2.555 clips de test que incluye identificadores de YouTube; conviene revisar las condiciones de uso de esos identificadores.
- Adopcion practicamente nula en el momento de la consulta (0 descargas, 0 likes), por lo que no existe una comunidad que haya validado el modelo de forma independiente.
- Es un modelo de representacion, no generativo: no admite tool calling, agentes ni generacion de texto, audio o imagenes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/404mahdi/leitmotif
- Repositorio de codigo: https://github.com/404mahdi/leitmotif
- Demo (Space): https://huggingface.co/spaces/404mahdi/leitmotif
- Informe final del proyecto (PDF): https://github.com/404mahdi/leitmotif/blob/main/report/final_report.pdf
- Dataset de entrenamiento: https://huggingface.co/datasets/google/MusicCaps
- Modelo base de texto: https://huggingface.co/google-bert/bert-base-uncased
- Nota: las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los unicos resultados obtenidos pertenecian a un portal educativo aleman sin relacion con el contenido de esta ficha.
