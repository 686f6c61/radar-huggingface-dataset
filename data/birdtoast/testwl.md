# BirdToast/TestWL

## Resumen

BirdToast/TestWL es un modelo multimodal de tipo image-text-to-text publicado en HuggingFace por el usuario BirdToast, construido mediante una fusión de pesos (merge) de dos modelos preexistentes: LatitudeGames/Equinox-31B y llmfan46/Gemma-4-Garnet-V2-31B-it-ultra-uncensored-heretic. El repositorio declara la arquitectura `Gemma4ForConditionalGeneration` y un total de 30.171.438.956 parámetros (aproximadamente 30,17 mil millones), lo que lo sitúa en la categoría de modelos densos de ~30B con capacidad de procesamiento conjunto de imagen y texto. El repositorio ocupa 60,4 GB, coherente con pesos almacenados en bfloat16.

El modelo no es un entrenamiento desde cero ni un fine-tuning, sino una combinación lineal de pesos: según la configuración YAML de la model card, se aplica un peso de 1.0 al modelo base Gemma-4-Garnet-V2-31B y un peso de 0.1 a Equinox-31B, usando la herramienta mergekitty (compatible con mergekit) y el método `linear`. El resultado hereda, en teoría, la mayor parte del comportamiento del modelo base (una variante "uncensored/heretic" derivada de la familia Gemma 4) con una pequeña contribución de Equinox-31B.

Su relevancia práctica es limitada y conviene ser explícito: se trata de un repositorio de prueba (el propio identificador del repo es "TestWL" y el título de la model card es "test-fm-merge"), con 0 descargas y 0 likes, sin licencia declarada, sin idiomas documentados y sin benchmarks publicados. Es útil ante todo como ejemplo reproducible de un pipeline de fusión lineal con mergekitty sobre un modelo multimodal de ~30B, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Gemma4ForConditionalGeneration` (transformer multimodal, image-text-to-text) |
| Parametros totales | 30.171.438.956 (~30,17 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio (solo pesos bfloat16); no se publican GGUF ni cuantizaciones de 8/4 bits |
| Idiomas soportados | no disponible (la model card no lo declara) |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16), libreria `transformers` |
| Tipo de modelo | fusion de pesos (merge), pipeline `image-text-to-text` |
| Metodo de fusion | `linear` con mergekitty |
| Modelo base de la fusion | llmfan46/Gemma-4-Garnet-V2-31B-it-ultra-uncensored-heretic (peso 1.0) |
| Modelos secundarios | LatitudeGames/Equinox-31B (peso 0.1) |
| Tamano del repositorio | 60,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 13 de septiembre de 2026 (segun metadatos de HuggingFace) |
| Ultima actualizacion | 13 de septiembre de 2026 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura declarada es `Gemma4ForConditionalGeneration`, es decir, un transformer multimodal de la familia Gemma 4 con torre de vision y proyeccion hacia el espacio de tokens del modelo de lenguaje, tal como indica la etiqueta de pipeline `image-text-to-text`. No hay informacion sobre el numero de capas, dimensiones ocultas, numero de cabezas de atencion, tipo de atencion (global/local, sliding window) ni resolucion de imagen soportada. Tampoco se documenta la longitud de contexto, dato especialmente relevante en la familia Gemma, donde suele ser uno de los parametros diferenciadores.

No ha habido entrenamiento adicional en este repositorio: se trata exclusivamente de una interpolacion lineal de pesos. La configuracion YAML publicada especifica `merge_method: linear`, `dtype: bfloat16`, `out_dtype: bfloat16`, `chat_template: auto` y los dos modelos participantes con pesos 1.0 y 0.1. La etiqueta `arxiv:2203.05482` remite al articulo de aritmetica de tareas (task arithmetic) que inspira este tipo de operaciones de edicion de pesos; conviene senalar que la interpolacion lineal simple es una operacion mas basica que la aritmetica de tareas con vectores de tarea propiamente dicha. No se documenta ningun proceso de RLHF, DPO, SFT posterior ni calibracion tras la fusion, ni tampoco innovaciones tecnicas como decodificacion especulativa o atencion lineal. Un riesgo tecnico inherente a la fusion lineal con pesos desbalanceados (1.0 frente a 0.1) es la degradacion de las capas especificas de la torre de vision si ambos modelos padres no comparten exactamente la misma inicializacion de esa torre; la model card no aporta ninguna validacion al respecto.

## Capacidades

- Generacion de texto conversacional: el pipeline y la etiqueta `conversational` indican uso en dialogos multi-turno mediante plantilla de chat (`chat_template: auto`).
- Procesamiento de imagen y texto combinados (image-text-to-text): el modelo acepta entradas visuales junto con texto, lo que habilita descripcion de imagenes, respuesta a preguntas visuales (VQA) y dialogos sobre contenido grafico.
- Herencia del modelo base "uncensored/heretic": por el nombre del modelo padre, se espera un ajuste orientado a reducir rechazos y filtros de contenido; esto no esta verificado ni documentado tecnicamente en la ficha.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no declaradas, pese a que el modelo base probablemente sea multilingue).
- Modo "thinking" o razonamiento explicito: no disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Prototipado de asistentes visuales conversacionales: el modelo puede mantener un dialogo multi-turno en el que el usuario adjunta imagenes y formula preguntas sucesivas sobre ellas, gracias a la combinacion de pipeline `image-text-to-text` y plantilla de chat. Es adecuado para demos internas, no para produccion dado que no hay licencia declarada.
- Descripcion automatica de imagenes en catalogos internos: generacion de pies de foto y metadatos textuales para lotes de imagenes en un pipeline offline, siempre que se valide cualitativamente la calidad tras la fusion.
- Extraccion de informacion de capturas de pantalla o documentos escaneados: preguntas del tipo "que importe figura en esta factura" o "que error muestra esta captura", utiles en herramientas internas de soporte tecnico.
- Reproduccion de experimentos de fusion de modelos: sirve como caso de referencia para estudiar como afecta un peso 0.1 de un segundo modelo de ~31B al comportamiento de un modelo multimodal, comparando salidas antes y despues de la fusion.
- Base para experimentos de cuantizacion: al ser un modelo denso de 30B en bfloat16, es un candidato razonable para probar conversiones a GGUF/AWQ/GPTQ y medir la perdida de calidad en tareas de vision-lenguaje.
- Evaluacion academica de degradacion por merge: util para investigacion sobre que capas (torre de vision, proyector, capas del LM) se ven mas afectadas por la interpolacion de pesos cuando los modelos padre no comparten linaje exacto.
- Moderacion y analisis de contenido en entornos controlados: dado el caracter "uncensored" del modelo base, podria emplearse para estudiar la generacion de contenido no filtrado, siempre dentro de un marco legal y etico adecuado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card se limita a documentar el metodo y la configuracion de la fusion, sin tablas de MMLU, HumanEval, GSM8K, MMMU, DocVQA ni ninguna otra metrica. Tampoco hay resultados de evaluacion cualitativa ni comparaciones con los modelos padre.

## Requisitos de hardware

- VRAM para inferencia en bfloat16: los pesos ocupan aproximadamente 60,4 GB (30,17B parametros x 2 bytes), por lo que se necesitan al menos 64-70 GB de VRAM contando cache KV y activaciones, dependiendo de la longitud de contexto efectiva.
- GPU recomendadas para bfloat16 sin cuantizar: 1x H100 80 GB, 1x A100 80 GB, o 2x A100 40 GB / 2x L40S 48 GB con paralelismo de tensor.
- Cuantizacion de 8 bits (estimacion): ~32 GB de pesos, viable en 1x A100 40 GB o 1x RTX 6000 Ada 48 GB; requiere convertir el modelo, ya que el repositorio no incluye versiones cuantizadas.
- Cuantizacion de 4 bits (estimacion): ~18-20 GB de pesos, lo que permitiria ejecutarlo en una RTX 4090 o RTX 3090 de 24 GB, con margen reducido para cache KV.
- Cabe en GPU de consumo: solo con cuantizacion agresiva (4 bits) en tarjetas de 24 GB; en bfloat16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: `transformers` con `Gemma4ForConditionalGeneration` (requiere una version de la libreria que soporte dicha arquitectura), vLLM o SGLang si existe soporte para la arquitectura, TGI en despliegues gestionados y llama.cpp/Ollama unicamente tras convertir los pesos a GGUF.
- Latencia y throughput estimados: no disponible (no hay mediciones publicadas ni configuracion de referencia).

## Comparativa con modelos similares

No se dispone de datos verificados de terceros (parametros, contexto, benchmarks) para construir una comparativa cuantitativa fiable. La comparacion posible se limita a los dos modelos que originan la fusion:

| Modelo | Relacion con TestWL | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BirdToast/TestWL | Fusion lineal de los dos siguientes | 30,17 B | no disponible | no disponible | 0 descargas, 0 likes |
| llmfan46/Gemma-4-Garnet-V2-31B-it-ultra-uncensored-heretic | Modelo base de la fusion (peso 1.0) | ~31 B (indicado por el nombre) | no disponible | no disponible | repositorio publico en HuggingFace |
| LatitudeGames/Equinox-31B | Modelo secundario (peso 0.1) | ~31 B (indicado por el nombre) | no disponible | no disponible | repositorio publico en HuggingFace |

Comparacion con alternativas de otros desarrolladores (por ejemplo, modelos multimodales densos de rango 24-34B): no disponible, al no haberse publicado benchmarks de este modelo ni poder verificar las especificaciones de los candidatos en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: sin licencia explicita no hay autorizacion clara de uso comercial; en la practica, el modelo debe tratarse como no apto para produccion hasta que el autor la especifique.
- Sin benchmarks ni evaluaciones: no hay evidencia publicada de calidad en ninguna tarea; el impacto real de la fusion (especialmente sobre la torre de vision) es desconocido.
- Repositorio con 0 descargas y 0 likes: no ha sido validado por la comunidad; no hay informes de terceros sobre su comportamiento.
- Riesgo de alucinacion: inherente a todos los modelos de lenguaje de esta escala y no cuantificado en este caso; sin evaluacion no puede acotarse.
- Sesgos: no documentados, pero el modelo base "uncensored/heretic" esta disenado explicitamente para reducir filtros de seguridad, lo que incrementa el riesgo de generar contenido ofensivo, ilegal o danino sin advertencia.
- Compatibilidad de arquitectura: `Gemma4ForConditionalGeneration` exige versiones concretas de `transformers`; sin ellas la carga fallara, y no se documenta la version necesaria.
- Incertidumbre sobre la integridad de la fusion: los pesos 1.0/0.1 entre dos modelos de ~31B con posible linaje distinto pueden degradar capas especificas (proyector multimodal, embeddings de vision) sin que el autor lo haya verificado.
- Limitaciones de contexto e idioma: se desconocen la ventana de contexto real y los idiomas soportados; no deben asumirse capacidades multilingues.
- Nombre poco informativo: el repositorio se llama "TestWL" mientras la model card lo titula "test-fm-merge", lo que sugiere un artefacto de prueba mas que una publicacion estable.
- Fechas de metadatos (creacion y actualizacion en septiembre de 2026) coherentes con un artefacto reciente y sin mantenimiento posterior documentado.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/BirdToast/TestWL
- Modelo base de la fusion: https://huggingface.co/llmfan46/Gemma-4-Garnet-V2-31B-it-ultra-uncensored-heretic
- Modelo secundario de la fusion: https://huggingface.co/LatitudeGames/Equinox-31B
- Herramienta de fusion declarada (mergekitty): https://github.com/allura-org/mergekitty
- Articulo referenciado en las etiquetas (arxiv:2203.05482): https://arxiv.org/abs/2203.05482
- Otros enlaces (papers, blogs, demos, repos adicionales): no disponible. La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos resultados obtenidos fueron paginas de contenido para adultos sin ninguna relacion con el modelo, por lo que se descartan y no se incluyen.
