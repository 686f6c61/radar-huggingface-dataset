# edwarddgao/glyph-models

## Resumen

El repositorio `edwarddgao/glyph-models` contiene los modelos Core ML y los recursos auxiliares para Glyph, un teclado de deslizamiento (swipe typing) de codigo abierto para iPhone. Lo desarrolla Edward Gao, autor del proyecto Glyph, y su funcion principal es convertir gestos de deslizamiento sobre el teclado en texto, combinando un decodificador autoregresivo de letras con un modelo de busqueda de frases.

No se trata de un modelo de lenguaje generalista, sino de un paquete especifico para el problema de la escritura por gestos. Incluye un decodificador denominado `SwipeAREncoder` / `SwipeARStep`, con una arquitectura de tronco TCN (temporal convolutional network) seguida de un decodificador transformer de dos capas para predecir letras, que suma 1,7 millones de parametros en fp32. Ademas, incorpora `SwipeLM`, un modelo `distilgpt2` en fp16 usado para la busqueda fusionada de frases, junto con un lexico en forma de trie de 301.508 palabras. El repositorio tiene un tamano de 0,2 GB y su licencia es MIT.

La relevancia actual radica en que ofrece una alternativa abierta y reproducible a los teclados de gesto propietarios. Proporciona modelos listos para Core ML, vectores de test para validar un port a Swift y un benchmark de gestos, lo que facilita tanto la evaluacion del rendimiento como el desarrollo experimental de algoritmos de decodificacion gestual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TCN trunk + transformer de 2 capas (decodificador autoregresivo); distilgpt2 (gather model para busqueda de frases) |
| Parametros totales | 1,7 millones (SwipeAREncoder / SwipeARStep); parametros de SwipeLM no disponibles |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje con ventana de contexto) |
| Tipos de cuantizacion | fp32 (decodificador de swipe); fp16 (SwipeLM) |
| Idiomas soportados | ingles (lexico basado en FUTO training words y wordfreq English) |
| Licencia | MIT |
| Formato de pesos | Core ML (modelos .mlmodel); archivos binarios `lexicon.bin`, `ilm.bin`, `priors.bin`; tokenizer en `gpt2/` |

## Arquitectura y entrenamiento

El componente principal de decodificacion, `SwipeAREncoder` / `SwipeARStep`, es un modelo autoregresivo que combina un tronco de red temporal convolucional (TCN) con un decodificador transformer de dos capas para predecir letras a partir del gesto de deslizamiento. Esta combinacion permite capturar tanto la estructura temporal del gesto como las dependencias secuenciales entre letras, generando texto de forma incremental. Segun la informacion disponible, el modelo corresponde a una ejecucion de investigacion denominada `ar_mixed_s1` y se entrega en precision fp32.

El segundo componente, `SwipeLM`, es un modelo `distilgpt2` en fp16, que se usa para la busqueda fusionada de frases (fused sentence search). Acompanando a los modelos hay un lexico en formato trie (`lexicon.bin`) con 301.508 palabras, obtenido de la mezcla de palabras de entrenamiento de FUTO con el corpus de frecuencia de wordfreq para ingles. Ademas, se incluyen `ilm.bin` y `priors.bin`, que representan la LM interna del codificador y la prior marginal de la LM por nodo del trie. Los datos de entrenamiento no se detallan mas alla de la composicion del lexico; la informacion sobre tecnicas de alineacion (RLHF o DPO) no esta disponible.

## Capacidades

- Decodificacion autoregresiva de letras a partir de gestos de deslizamiento sobre el teclado.
- Busqueda fusionada de frases mediante el modelo gather `distilgpt2`.
- Construccion y consulta de un lexico en formato trie con 301.508 palabras y log-probabilidades unigram.
- Uso de una LM interna del codificador y de prior marginal por nodo del trie para mejorar la prediccion.
- Incluye vectores de test (`*goldens.json`) para validar un port a Swift contra las salidas de referencia.
- Incluye un benchmark de gestos reproducibles (`bench_gestures.json`) para evaluar el rendimiento de los algoritmos de deslizamiento.
- Modelos exportados a Core ML, preparados para su integracion en aplicaciones iOS.

## Casos de uso

- Desarrollo de un teclado de deslizamiento open-source para iPhone: los modelos Core ML se integran directamente en la aplicacion Glyph, permitiendo prediccion de letras por gestos sin depender de servicios en la nube.
- I+D en algoritmos de decodificacion gestual: el conjunto `SwipeAREncoder` / `SwipeARStep` sirve como punto de partida para experimentar con arquitecturas TCN y transformer en el problema de swipe typing.
- Validacion de ports multiplataforma: los archivos `*goldens.json` permiten comprobar que una implementacion Swift de los algoritmos reproduce exactamente las salidas de la version de referencia en Python.
- Benchmarks reproducibles de teclados de gesto: `bench_gestures.json` proporciona un conjunto de gestos para comparar de manera estandarizada distintos modelos o variantes de decodificacion.
- Investigacion en busqueda de frases fusionada: `SwipeLM` (distilgpt2 en fp16) es util para estudiar como combinar la prediccion de letras con la busqueda de la frase mas probable dentro del lexico.
- Construccion de lexicos personalizados: el trie y los archivos de prior pueden servir como recursos para adaptar el teclado a dominios especificos en ingles, reemplazando el vocabulario de wordfreq y FUTO por otro propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye `bench_gestures.json` como conjunto de gestos de referencia, pero no se aportan metricas de exactitud, latencia ni comparaciones con otros modelos.

## Requisitos de hardware

- Inferencia pensada para dispositivos moviles: los modelos Core ML se ejecutan en GPU o Neural Engine de iPhone mediante Core ML; no requieren GPU de servidor.
- Los modelos se distribuyen en fp32 (decodificador) y fp16 (SwipeLM), lo que supone una carga de memoria reducida sobre un dispositivo movil. El tamano total del repositorio es de 0,2 GB.
- No hay requisitos de VRAM para GPU de centro de datos; el objetivo es el despliegue en iOS.
- La integracion se realiza mediante Xcode y Core ML, no mediante frameworks de servidor como vLLM o llama.cpp. No hay soporte para cuantizaciones adicionales aparte de fp32 y fp16.
- La latencia y el throughput dependen del iPhone de destino y del numero de letras predichas; no se proporcionan cifras en la informacion disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (teclados de gesto open-source con Core ML), por lo que no se puede elaborar una comparativa con alternativas equivalentes. Los unicos modelos internos comparables entre si serian `SwipeAREncoder` / `SwipeARStep` (TCN + transformer, 1,7 M parametros, fp32) y `SwipeLM` (distilgpt2, fp16), pero desempenan funciones distintas dentro del sistema.

## Limitaciones y advertencias

- El lexico y los recursos estan orientados exclusivamente al ingles: la composicion se basa en FUTO training words y wordfreq English, por lo que la cobertura multilingue no esta disponible.
- No es un modelo de lenguaje generalista: no genera texto libre ni mantiene conversaciones; su ambito se limita a la prediccion de letras a partir de gestos en un teclado.
- El tamano de parametros es de solo 1,7 millones en el decodificador, lo que restringe su capacidad a la tarea concreta de decodificacion gestual.
- No se aportan resultados de benchmarks ni metricas de error, por lo que el rendimiento real debe verificarse con `bench_gestures.json` y los `*goldens.json` antes de cualquier despliegue productivo.
- El repositorio registra cero descargas y cero likes en Hugging Face, lo que sugiere que se encuentra en una fase temprana de desarrollo y con poco uso externo.
- La licencia MIT permite uso comercial, pero no hay indicaciones sobre el soporte a largo plazo ni sobre el mantenimiento del proyecto Glyph.
- Los modelos se entregan en fp32 y fp16 sin variantes cuantizadas adicionales, lo que puede limitar la optimizacion de memoria en dispositivos mas antiguos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/edwarddgao/glyph-models
- Perfil del autor en Hugging Face: https://huggingface.co/edwarddgao
- Proyecto Glyph en GitHub: https://github.com/edwarddgao/glyph
- Referencia al catálogo de modelos Glyphh (no relacionado con este repositorio): https://github.com/glyphh-ai/models
