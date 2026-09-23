# skillsafe-ai/opus-mt-en-zh

## Resumen

`skillsafe-ai/opus-mt-en-zh` es un paquete de artefactos ONNX listos para navegador del modelo de traduccion automatica MarianMT `Xenova/opus-mt-en-zh`, que a su vez deriva de la familia OPUS-MT. No es un modelo entrenado desde cero: es una importacion reproducible generada por el conversor de SkillSafe a partir de una revision fijada del repositorio upstream (commit `046f55aec303cdee3e0318604406d4df20f1e8ea`), con cada fichero verificado mediante SHA-256. El objetivo es poder ejecutar traduccion ingles-chino directamente en el cliente, sin enviar texto a un servidor.

El interes practico esta en el formato y el empaquetado: incluye el encoder en fp32 y el decoder en dos variantes (fp32 de 224,91 MB y cuantizada q8 de 57,42 MB), junto con tokenizador y configuraciones, todo compatible con `transformers.js` y ONNX Runtime. El repositorio completo ocupa 0,5 GB, pero una instalacion orientada a navegador puede limitarse al decoder cuantizado mas el encoder, reduciendo drasticamente el peso descargado.

Se trata de un modelo pequeno (en el orden de 10^8 parametros, segun los grafos exportados), de una sola direccion (ingles a chino), sin datos publicados de evaluacion ni de entrenamiento en la propia model card. Su valor esta en el caso de uso: traduccion EN-ZH privada, offline y en el dispositivo, no en competir en calidad con traductores neuronales de gran tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (MarianMT), exportado a ONNX |
| Parametros totales | Aproximadamente 106 millones sumando los grafos fp32 exportados (encoder ~50,1 M y decoder ~56,2 M; parte de las matrices de embedding se duplican entre encoder y decoder, por lo que el numero de parametros unicos es inferior) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada. Los grafos se validaron con secuencias de 8 tokens y la familia MarianMT suele limitarse a 512 posiciones, pero el repositorio no declara el valor |
| Tipos de cuantizacion | fp32 y q8 (int8 dinamico) sobre ONNX; no hay variantes GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | Traduccion ingles a chino, segun el nombre del modelo y el pipeline de traduccion declarado. Los metadatos de idiomas del repositorio no estan declarados |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (encoder y decoder), tokenizer.json, tokenizer_config.json, vocab.json, config.json, generation_config.json |
| Capas y atencion | 6 capas en encoder y 6 en decoder (indices `past_key_values.0` a `past_key_values.5` en la verificacion), 8 cabezas de atencion, dimension oculta 512, dimension por cabeza 64 |
| Vocabulario | 65.001 tokens (dimension de la salida `logits` en los grafos verificados) |
| Repositorio | 0,5 GB en total; decoder fp32 224,91 MB, decoder q8 57,42 MB, encoder 200,21 MB (fp32 y q8), tokenizer.json 6,09 MB, vocab.json 1,67 MB |
| Libreria | transformers.js |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-22 |

## Arquitectura y entrenamiento

La arquitectura es un transformer secuencial clasico de tipo encoder-decoder, en la variante MarianMT que usa la familia OPUS-MT. Segun los tensores declarados en la verificacion de los grafos, el modelo tiene 6 capas de encoder y 6 de decoder, 8 cabezas de atencion, dimension de modelo 512 y dimension por cabeza 64, con un vocabulario de 65.001 tokens. El decoder exportado es un grafo combinado con `use_cache_branch`, es decir, admite tanto la pasada de prefill como la decodificacion autoregresiva con cache de claves y valores (`past_key_values` / `present`), lo que es imprescindible para generar token a token con coste razonable.

No hay informacion en el repositorio sobre el dataset de entrenamiento, el numero de tokens vistos, la composicion de los datos ni si hubo ajuste con RLHF o DPO. La model card es deliberadamente de procedencia y verificacion, no de entrenamiento: describe el commit upstream, la receta (`recipes/opus-mt-en-zh.yaml`, sha256 `bba61edc...`), la cadena de herramientas (Python 3.12.13, torch 2.10.0, onnx 1.23.0, onnxruntime 1.30.0 sobre Darwin arm64) y los hashes SHA-256 de cada fichero. La unica innovacion tecnica destacable es la propia reproducibilidad del empaquetado: conversor determinista, verificacion con `onnx.checker` y prueba de humo en CPU con entradas rellenas de ceros.

Un detalle relevante para el despliegue es que el encoder se distribuye como fichero de registro ("registry", servido desde `models.skillsafe.ai` una vez validado) mientras que configuraciones y tokenizador son ficheros "bundle" que viajan dentro de la aplicacion. Esa separacion permite cachear el modelo en el navegador y reutilizarlo entre sesiones.

## Capacidades

- Traduccion automatica de ingles a chino en una sola direccion; no soporta la direccion inversa ni pares adicionales.
- Generacion de texto condicionada (pipeline `text2text-generation`) con decodificacion autoregresiva y cache de claves y valores.
- Ejecucion en navegador mediante `transformers.js`, con tokenizador incluido (`tokenizer.json`, `vocab.json`), lo que evita dependencias de servidor.
- Inferencia en CPU mediante ONNX Runtime y en GPU integrada o dedicada mediante el backend WebGPU, cuando el runtime lo soporta.
- Modo cuantizado q8 para el decoder, con fichero propio y un coste de almacenamiento de 57,42 MB frente a los 224,91 MB del fp32.
- No dispone de tool calling, function calling, modo de razonamiento explicito, capacidades de agente, vision, audio ni multiturno conversacional.
- No hay soporte multilingue mas alla del par declarado, ni capacidades de instrucciones genericas: es un traductor, no un asistente.

## Casos de uso

- Traduccion local en extension de navegador: el usuario traduce paginas o fragmentos EN-ZH sin que el texto salga del dispositivo, usando el decoder q8 de 57,42 MB y el tokenizador incluido en el bundle. Adecuado por privacidad y por tamano de descarga.
- Aplicaciones web progresivas (PWA) con traduccion offline: se cachea el modelo en el navegador y se traduce sin conexion, algo inviable con APIs en la nube o con modelos de miles de millones de parametros.
- Traduccion de documentacion tecnica y articulos: integrado en un visor de documentacion o en un lector de RSS para lectores que consumen documentacion en ingles y la necesitan en chino, con latencia de milisegundos por paso en CPU.
- Localizacion de catalogos de producto: traduccion por lotes de titulos y descripciones EN-ZH en un pipeline de comercio electronico, como paso previo a revision humana.
- Generacion de subtitulos: traduccion de transcripciones en ingles a chino en herramientas de edicion de video que ya ejecutan inferencia en el propio equipo, encadenando un modelo ASR local con este traductor.
- Procesamiento por lotes en el borde (edge): en gateways, Raspberry Pi o dispositivos moviles donde no cabe un modelo mayor; el encoder y el decoder cuantizados suman del orden de 120 MB, lo que permite ejecucion en memoria sin GPU dedicada.
- Aumento de datos para entrenamiento: traduccion masiva de corpus EN a ZH para generar pares sinteticos en pipelines de NLP, con la ventaja de no depender de una API externa con limites de cuota.
- Preprocesado en moderacion de contenido: primer paso de traduccion en un sistema que analiza texto chino con clasificadores posteriores, siempre que se asuma el error acumulado de la traduccion automatica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye BLEU, chrF, COMET ni comparaciones con otros sistemas, y la busqueda web realizada no devolvio resultados relevantes sobre este modelo (los resultados obtenidos corresponden a contenidos no relacionados). El unico dato numerico de rendimiento es la prueba de humo del decoder fp32, que registro 3,7 ms en CPU (Darwin arm64) con entradas sinteticas de 4 tokens de entrada y 8 de contexto de encoder; no es una medida de throughput real ni de calidad de traduccion y no debe usarse como referencia de produccion.

## Requisitos de hardware

- VRAM y memoria para fp32: el encoder ocupa 200,21 MB y el decoder 224,91 MB, es decir, unos 0,43 GB de pesos. Con activaciones y el runtime de ONNX, un presupuesto de 0,8 a 1 GB de RAM es suficiente.
- VRAM y memoria para q8: el decoder cuantizado baja a 57,42 MB; sumando el encoder en su variante cuantizada el total se situa alrededor de 120 MB de pesos.
- GPU recomendadas: cualquiera. No requiere A100, H100 ni siquiera una RTX 4090; funciona en GPU integradas, en Apple Silicon y en CPU x86 o ARM. El despliegue tipico es WASM o WebGPU en el navegador del usuario final.
- Cabe en cualquier GPU de consumo y en moviles: es el rango de tamano propio de la traduccion en dispositivo.
- Opciones de despliegue: `transformers.js` con ONNX Runtime Web (backends WASM y WebGPU), `onnxruntime` en Python/C++ para servidores o aplicaciones de escritorio, integracion en Electron o Tauri. No hay pesos GGUF, por lo que llama.cpp y Ollama no son aplicables directamente; tampoco hay soporte nativo en vLLM ni en TGI, orientados a modelos de lenguaje generativos.
- Latencia y throughput: no disponibles. Solo consta el dato de la prueba de humo (3,7 ms por paso de decoder en CPU para una entrada de 4 tokens), que no permite extrapolar el rendimiento en una traduccion real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `skillsafe-ai/opus-mt-en-zh` | ~106 M en los grafos exportados (estimado) | No disponible | EN a ZH | apache-2.0 | ONNX fp32 y q8 | 0 descargas, 0 likes |
| `Xenova/opus-mt-en-zh` (upstream directo) | Mismos pesos que esta ficha | No disponible | EN a ZH | No disponible en la informacion proporcionada | ONNX | Repositorio de origen del que se importa |
| `Helsinki-NLP/opus-mt-en-zh` (origen de la familia) | No disponible en la informacion proporcionada | No disponible | EN a ZH | No disponible en la informacion proporcionada | Pesos PyTorch/safetensors | Modelo de referencia de la familia OPUS-MT |
| `facebook/nllb-200-distilled-600M` | 600 M (aproximado, segun su documentacion publica) | No disponible | Multilingue, ~200 idiomas | No disponible en la informacion proporcionada | PyTorch/safetensors | Alternativa si se necesita mas de un par de idiomas; mayor tamano y no apto para navegador |

La comparacion significativa es de categoria, no de precision: este paquete compite con otras alternativas de traduccion en dispositivo por tamano y formato (ONNX, ejecucion en navegador), no por calidad medida. No hay datos de BLEU ni de COMET para ninguno de los modelos listados en la informacion disponible, por lo que no es posible establecer un ranking de rendimiento.

## Limitaciones y advertencias

- Direccionalidad unica: solo traduce de ingles a chino. No hay variante ZH-EN en este repositorio, aunque exista en la familia original.
- Ausencia total de evaluacion: no hay BLEU, chrF, COMET ni pruebas humanas publicadas. Cualquier uso en produccion requiere una evaluacion propia sobre el dominio objetivo antes de desplegar.
- Sin datos de entrenamiento: no se documenta el corpus, el numero de tokens ni si hubo ajuste por preferencias. Esto impide auditar sesgos de dominio o de registro linguistico.
- Sesgos previsibles: como modelo de traduccion entrenado sobre corpus paralelos, hereda los sesgos de esos corpus (infrarrepresentacion de variantes dialectales del chino, terminologia occidentalizada, sesgos de genero en profesiones). No se han documentado ni medido.
- Riesgo de alucinacion y de fluidez enganosa: en traduccion automatica, el fallo tipico no es inventar contenido nuevo, sino producir una salida fluida que omite, repite o distorsiona el original, especialmente con frases largas, negaciones, unidades de medida y entidades nombradas.
- Limite de longitud no confirmado: no se declara la ventana maxima. Si la familia usa 512 posiciones, los documentos largos deben segmentarse, con la consiguiente perdida de coherencia entre fragmentos.
- Cuantizacion: la variante q8 reduce el peso un 75 % (de 224,91 MB a 57,42 MB) a cambio de una perdida de precision no cuantificada en este repositorio.
- Estado de adopcion nulo: 0 descargas y 0 likes en el momento de redactar la ficha; es un artefacto reciente y sin validacion por parte de la comunidad.
- Licencia: el repositorio declara apache-2.0, pero al ser una importacion de un modelo upstream conviene verificar las condiciones del repositorio de origen (`Xenova/opus-mt-en-zh`) y de la familia OPUS-MT antes de un uso comercial.
- Idoneidad: es una pieza de infraestructura para traducir en el cliente, no un modelo de proposito general. No soporta instrucciones complejas, agentes, razonamiento ni otras tareas de NLP fuera de la traduccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skillsafe-ai/opus-mt-en-zh
- Modelo base: https://huggingface.co/Xenova/opus-mt-en-zh
- Revision exacta del upstream importada: https://huggingface.co/Xenova/opus-mt-en-zh/tree/046f55aec303cdee3e0318604406d4df20f1e8ea
- Repositorio del conversor de SkillSafe: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- Receta de conversion citada en la model card: `recipes/opus-mt-en-zh.yaml` (sha256 `bba61edc42974dff68ab3f6eaad0a2a812e3efa7fbaf508160c60b2acde8f6d4`)
- Nota: la busqueda web realizada no devolvio enlaces relevantes sobre este modelo, su evaluacion o su publicacion; los resultados obtenidos no guardan relacion con el modelo.
