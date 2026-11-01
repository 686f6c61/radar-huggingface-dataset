# kjarni-ai/opus-mt-de-en

## Resumen

`kjarni-ai/opus-mt-de-en` es un paquete redistribuido del modelo de traduccion automatica `Helsinki-NLP/opus-mt-de-en` (familia OPUS-MT), desarrollado originalmente por el grupo de investigacion en tecnologia del lenguaje de la Universidad de Helsinki. El modelo traduce de aleman a ingles y esta empaquetado para ejecutarse localmente mediante Kjarni, una libreria nativa que no requiere runtime de Python, servidor ni servicio en la nube.

No se trata de un modelo nuevo: los pesos de traduccion son identicos a los del original. Lo que cambia es el empaquetado. Los pesos se almacenan en formato safetensors con el embedding compartido guardado una sola vez en lugar de duplicado, y los dos tokenizadores SentencePiece se convierten en un unico `tokenizer.json`. Segun el autor, la salida en CPU y GPU coincide exactamente con la de transformers ejecutando el modelo original sobre un conjunto de 16 frases de prueba.

El modelo tiene 74.468.597 parametros (aproximadamente 74,5 millones) y esta pensado para traduccion unidireccional aleman-ingles en entornos locales. Su relevancia radica en la distribucion como binario nativo con bindings para Python, Rust, C#, C++ y linea de comandos, lo que facilita su integracion en aplicaciones de escritorio, servicios embebidos o pipelines sin dependencias de Python.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian) |
| Parametros totales | 74.468.597 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | aleman (de), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo Marian original de OPUS-MT: un transformer encoder-decoder disenado especificamente para traduccion automatica neuronal. El modelo base `Helsinki-NLP/opus-mt-de-en` fue entrenado por el grupo de la Universidad de Helsinki y publicado en el articulo de OPUS-MT presentado en EAMT 2020 (Tiedemann y Thottingal). Los detalles de datos de entrenamiento, numero de tokens y composicion del corpus no se recogen en la informacion disponible de este repositorio; el autor remite expresamente a la model card original para esa informacion.

La unica innovacion tecnica de este paquete es de empaquetado: consolidacion del embedding compartido en un solo tensor dentro de safetensors y fusion de los dos tokenizadores SentencePiece (uno por direccion) en un unico `tokenizer.json`. No hay cambios en los pesos, ni fine-tuning adicional, ni tecnicas de decodificacion especulativa o atencion lineal.

## Capacidades

- Traduccion de texto de aleman a ingles, unidireccional.
- Ejecucion local sin Python runtime, servidor ni servicio en la nube (libreria nativa Kjarni).
- API disponible en linea de comandos, Python, Rust, C# y C++ (C++23).
- Carga bajo demanda: el modelo (aproximadamente 300 MB) se descarga en el primer uso.
- Compatibilidad de salida verificada con transformers sobre 16 frases de prueba, en CPU y GPU.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- No es multilingue mas alla del par de aleman e ingles.

## Casos de uso

- Traduccion de documentacion tecnica alemana a ingles en pipelines de CI/CD: el modelo puede invocarse desde Rust o C++ dentro de herramientas de build para generar versiones en ingles de manuales y READMEs sin depender de servicios externos.
- Localizacion de interfaces de escritorio: aplicaciones nativas pueden integrar el modelo mediante los bindings de C# o C++ y ofrecer traduccion de textos de interfaz de usuario en tiempo de ejecucion, sin conexion a internet.
- Procesamiento por lotes de correos y tickets de soporte en aleman: la CLI permite traducir ficheros o flujos de texto desde scripts de shell, adecuado para equipos que reciben correspondencia en aleman y necesitan versiones en ingles para su triaje.
- Traduccion embebida en dispositivos con recursos limitados: con unos 74,5 millones de parametros y un tamano de descarga de aproximadamente 300 MB, es viable en maquinas sin GPU dedicada o en entornos de borde donde no cabe un modelo mayor.
- Preprocesamiento para pipelines de NLP en ingles: traduccion previa de corpus alemanes antes de aplicar analisis de sentimiento, clasificacion o busqueda semantica construidos sobre modelos en ingles.
- Herramientas de investigacion reproducible: al ser un paquete con pesos identicos al original y salida verificada contra transformers, sirve como componente estable en experimentos que requieren traduccion determinista sin entorno Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente indica que la salida coincide exactamente con la de transformers ejecutando el modelo original sobre un conjunto de 16 frases de prueba, tanto en CPU como en GPU, y remite a la model card original de `Helsinki-NLP/opus-mt-de-en` para datos de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 74,5 millones de parametros en precision completa, el peso de los tensores ronda los 300 MB, por lo que la huella de memoria es moderada.
- GPU recomendadas: no se especifican modelos concretos. El autor indica soporte de ejecucion en CPU y GPU sin detallar hardware.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el reducido tamano del modelo, aunque no hay confirmacion explicita en la informacion disponible.
- Opciones de despliegue: libreria Kjarni (requiere version 0.3.0 o superior) con bindings para Python, Rust, C#, C++ y CLI. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| kjarni-ai/opus-mt-de-en | 74.468.597 | no disponible | de, en | Apache 2.0 | safetensors |
| Helsinki-NLP/opus-mt-de-en | no disponible en la informacion | no disponible | de, en | Apache 2.0 | no disponible en la informacion |
| kjarni-ai/opus-mt-en-de | no disponible en la informacion | no disponible | en, de | no disponible en la informacion | safetensors (segun tags del autor) |

La comparativa se limita a las variantes del mismo modelo base y a la direccion inversa empaquetada por el mismo autor. No se dispone de datos de rendimiento comparado con otros sistemas de traduccion en la informacion proporcionada.

## Limitaciones y advertencias

- Traduccion unidireccional: solo aleman a ingles. Para la direccion inversa debe usarse `opus-mt-en-de`.
- Solo cubre dos idiomas; no es un modelo multilingue general.
- No hay datos publicados en este repositorio sobre sesgos, tasas de alucinacion o calidad por dominio; el autor remite a la model card original.
- La licencia Apache 2.0 permite uso comercial, pero el autor declara no estar afiliado ni respaldado por la Universidad de Helsinki; la atribucion del modelo y su evaluacion corresponde al grupo original.
- Requiere Kjarni 0.3.0 o superior; no es compatible con transformers de forma directa sin conversion.
- La validacion de equivalencia con transformers se limita a 16 frases de prueba, una muestra reducida para garantizar paridad en todos los dominios.
- El repositorio tiene 38 descargas y 0 likes en el momento de la consulta, lo que indica adopcion muy limitada y escasa validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kjarni-ai/opus-mt-de-en
- Modelo original: https://huggingface.co/Helsinki-NLP/opus-mt-de-en
- Modelo de direccion inversa: https://huggingface.co/kjarni-ai/opus-mt-en-de
- Documentacion y descarga de Kjarni: https://kjarni.ai
- Instalador (Unix): https://kjarni.ai/install.sh
- Instalador (Windows): https://kjarni.ai/install.ps1
- Repositorio de transformers: https://github.com/huggingface/transformers
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Articulo OPUS-MT (EAMT 2020): Tiedemann, J. y Thottingal, S., "OPUS-MT -- Building open translation services for the World", Proceedings of the 22nd Annual Conference of the European Association for Machine Translation, Lisboa, 2020.
