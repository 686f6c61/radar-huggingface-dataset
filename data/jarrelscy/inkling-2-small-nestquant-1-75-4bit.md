# jarrelscy/Inkling-2-Small-NestQuant-1.75-4bit

## Resumen

Inkling-2-Small NestQuant 1.75-4bit es una cuantizacion especializada del modelo thinkingmachines/Inkling-2-Small, un transformer de tipo mezcla de expertos (MoE) con 594.000 millones de parametros totales y 17.000 millones activos por token. La publica el usuario jarrelscy bajo licencia Apache 2.0. El paquete no contiene el modelo completo: incluye unicamente los expertos enrutados, codificados con el formato propietario NestQuant, mientras que las capas de atencion, embeddings, encoder de vision y pesos MTP deben tomarse del repositorio original.

La innovacion principal es un esquema de codificacion anidada de dos niveles. Cada uno de los 18.432 expertos se almacena en una representacion base de 1,76 bits por peso (129 GB en total) y una representacion de mayor fidelidad de 4,13 bits por peso (303 GB). En tiempo de servicio todos los expertos residen en el nivel base y un conjunto reducido de expertos "calientes" por capa se promociona al nivel superior, lo que permite ajustar el consumo de VRAM al hardware disponible sin recargar pesos desde disco.

El objetivo declarado de despliegue es un nodo con dos GPU RTX PRO 6000 (2 x 96 GB), donde el nivel base, los pesos no experto en BF16 y unos 64 expertos calientes por capa caben en memoria. Es relevante para quienes necesitan servir un MoE de gran escala en hardware profesional de gama alta en lugar de clusters de H100, a costa de una integracion de serving que aun no esta publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), 48 capas, 384 expertos, top-8 |
| Parametros totales | 594.000 millones (modelo base) |
| Parametros activos | 17.000 millones por token (modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NestQuant anidada: L2 a 1,76 bits/peso; L4 a 4,13 bits/peso (gate/up 4,04, down 4,35) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con contenedor `nestquant-v1-tp-safetensors`, dividido en 2 shards de tensor-parallel |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 48 capas, 384 expertos por capa y enrutamiento top-8, lo que da 17.000 millones de parametros activos sobre un total de 594.000 millones. El checkpoint nativo usa expertos en NVFP4 en las capas 0-39 y MXFP8 en las capas 40-47. Esta publicacion no entrena el modelo: recalibra y recodifica exclusivamente los expertos enrutados con NestQuant, que almacena en un mismo encode dos niveles de precision anidados (base y base mas residual).

La calibracion combina texto e imagen. Para texto se emplean 7,5 millones de tokens de chat, codigo, razonamiento y transcripciones de agentes, formateados con la plantilla de chat de Inkling. Para imagen se usan 1.200 imagenes (radiologia, capturas web, COCO y documentos sinteticos) a 640 px y 256 tokens por imagen. La ponderacion del error por experto es 75% texto y 25% imagen. El resultado se reparte en dos shards de tensor-parallel porque la proyeccion down, con 2304 canales intermedios divididos entre 8, da 288, que no es multiplo de 128 y por tanto impide shards TP4 o TP8.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Inkling-2-Small, segun la model card del autor del modelo.
- Codigo: presente en el corpus de calibracion (mezcla de chat, codigo, razonamiento y transcripciones de agentes).
- Vision: el paquete incluye calibracion de imagen y el modelo base incorpora un encoder de vision que debe tomarse del repositorio original.
- Tool calling: los pesos MTP y las definiciones de herramientas forman parte del ecosistema del modelo base, aunque la model card no detalla el soporte de function calling.
- Capacidades de agente: el corpus de calibracion incluye transcripciones de agentes, lo que sugiere entrenamiento orientado a flujos multi-paso.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Serving de un MoE de gran escala en hardware profesional: el esquema anidado permite mantener los 18.432 expertos en 129 GB (nivel L2) y promocionar un subconjunto a L4, de modo que un nodo de 2 x RTX PRO 6000 puede servir el modelo sin cluster de H100.
- Despliegue con presupuesto de VRAM ajustable: el operador decide cuantos expertos calientes por capa promociona segun la memoria libre; con 64 expertos por capa en L4 la KLD baja de 0,0345 a 0,0179 frente al modelo nativo.
- Investigacion sobre cuantizacion de MoE: la publicacion incluye manifiestos por capa con tasas, layout por proyeccion y sha256, lo que facilita reproducir y comparar variantes de codificacion.
- Evaluacion de calidad bajo cuantizacion: los datos de KLD y coincidencia top-1 permiten medir el impacto de la cuantizacion sobre log-probabilidades antes de comprometerse con un despliegue en produccion.
- Pipelines multimodales con calibracion de imagen: la mezcla 75/25 texto/imagen preserva la calidad en tareas de captioning de imagenes (KLD 0,0274 a 0,0220 en L2 en la prueba de la capa 5) sin degradar el texto.
- Prototipado de enrutamiento dinamico: la model card senala que el conjunto caliente es estatico y que un predictor basado en contexto deberia mejorar los resultados, lo que lo convierte en banco de pruebas para politicas de cache de expertos.

## Benchmarks y rendimiento

Calidad medida como KLD frente al modelo nativo (top-64 log-probabilidades mas masa de cola), con teacher forcing sobre datos reservados. Texto: 119.000 tokens, build calibrado solo con texto.

| Configuracion | KLD | Coincidencia top-1 |
|---|---|---|
| Todos los expertos en L2 | 0,0345 | 94,7% |
| 64 expertos calientes por capa en L4 | 0,0179 | 96,7% |
| Todos los expertos en L4 | 0,0063 | 98,5% |

El autor indica que aproximadamente 0,005 de cada valor procede de un conjunto reducido de tokens JSON de definicion de herramientas que cambian con cualquier modificacion de la capa 0, incluso con un 1% de ruido aleatorio; todas las cuantizaciones del modelo comparten ese suelo. En la prueba de la capa 5, anadir la calibracion de imagen reduce la KLD de captioning de 0,0274 a 0,0220 en L2 sin alterar la KLD de texto. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM para el nivel base L2: 129 GB para los 18.432 expertos, mas los pesos no experto en BF16 y el encoder de vision.
- VRAM para el nivel L4 completo: 303 GB solo en expertos, inviable en el hardware objetivo.
- Hardware objetivo declarado: 2 x RTX PRO 6000 (2 x 96 GB); tras el nivel L2 y los pesos no experto quedan aproximadamente 64 expertos calientes por capa en L4.
- No cabe en GPU de consumo: el nivel base de 129 GB excede la VRAM de una RTX 4090 (24 GB) o similar; se requeriria offload a RAM del sistema, no documentado por el autor.
- Tensor parallelism: solo TP2 es posible con estos shards; TP4 y TP8 no son viables por el tamano de la proyeccion down.
- Opciones de despliegue: no hay integracion de serving publicada (vLLM, llama.cpp, Ollama o TGI no estan soportados de forma nativa por el momento); se requiere implementar el lector del contenedor `nestquant-v1-tp-safetensors`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Small NestQuant 1.75-4bit | 594B / 17B | no disponible | NestQuant L2 1,76 bits y L4 4,13 bits | Apache 2.0 | Solo expertos; serving no publicado |
| thinkingmachines/Inkling-2-Small (nativo) | 594B / 17B | no disponible | NVFP4 (capas 0-39) y MXFP8 (40-47) | no disponible | Checkpoint completo en HF |
| Alternativas de tamano y tarea comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El paquete no es autonomo: solo contiene los expertos enrutados; sin atencion, embeddings, encoder de vision y pesos MTP del repositorio original no se puede ejecutar.
- No existe integracion de serving publicada, por lo que el despliegue exige desarrollar el cargador del formato NestQuant y la logica de promocion dinamica de expertos.
- El conjunto de expertos calientes es estatico (los mas enrutados); el autor reconoce que un predictor basado en contexto deberia mejorar la calidad, pero no se incluye ninguno.
- La KLD minima alcanzable ronda 0,005 por un suelo compartido con todas las cuantizaciones del modelo, atribuido a tokens JSON de definicion de herramientas.
- Solo es posible tensor parallelism de grado 2; esto limita el escalado horizontal a la topologia de 2 GPU.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada.
- Idiomas soportados y longitud de contexto: no disponibles; conviene verificar la model card del modelo base antes de usarlo en produccion multilingue.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base deben verificarse por separado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jarrelscy/Inkling-2-Small-NestQuant-1.75-4bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
