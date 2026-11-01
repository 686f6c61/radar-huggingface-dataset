# rekonek-models/opus-mt-id-en-onnx-int8

## Resumen

Este repositorio contiene una versión cuantizada a int8 en formato ONNX del modelo de traducción automática Opus-MT para el par indonesio-inglés (id-en). El modelo base pertenece a la familia Opus-MT, un conjunto de modelos de traducción neuronal desarrollados en el marco del proyecto Tatoeba-MT y la iniciativa OPUS, que entrenan sistemas encoder-decoder sobre los corpus paralelos públicos de OPUS.

La cuantización a int8 con ONNX reduce significativamente el tamaño del modelo y la latencia de inferencia, lo que lo hace adecuado para su ejecución en CPU, dispositivos de borde o entornos con recursos limitados. Este tipo de modelos resuelve el problema concreto de traducir texto entre indonesio e inglés con un footprint mínimo, sin depender de grandes modelos generales de lenguaje.

Su relevancia actual radica en la demanda de traducción local, privada y de bajo coste: al tratarse de un modelo pequeño y cuantizado, puede desplegarse sin GPU y sin enviar datos a servicios externos. Ten en cuenta que la model card del repositorio es mínima y muchos datos técnicos no están documentados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Opus-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (ONNX) |
| Idiomas soportados | Indonesio (id) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (cuantizado a int8) |

## Arquitectura y entrenamiento

Los modelos Opus-MT emplean una arquitectura Transformer encoder-decoder estandar para traduccion automatica neuronal, en la que el encoder procesa el texto de entrada en el idioma origen y el decoder genera la traduccion en el idioma destino de forma autorregresiva. En el caso tipico de estos modelos, la configuracion se basa en la implementacion de MarianMT (Marian), con un numero de capas y dimensiones de embedding relativamente contenidas para optimizar la traduccion por pares de idiomas.

El entrenamiento de los modelos Opus-MT se realiza sobre los corpus paralelos publicos recopilados en la plataforma OPUS (Tatoeba, WikiMatrix, OpenSubtitles, entre otros), con preprocesamiento basado en tokenizacion SentencePiece o BPE. No se ha documentado en el repositorio el numero exacto de tokens, la composicion del dataset ni si hubo etapas de ajuste fino adicionales. La aportacion de este repositorio es la conversion a ONNX con cuantizacion int8, que reduce la precision de los pesos y activaciones a enteros de 8 bits para acelerar la inferencia en CPU mediante runtimes como ONNX Runtime.

## Capacidades

- Traduccion automatica de texto del indonesio al ingles (par id-en).
- Ejecucion eficiente en CPU gracias al formato ONNX y la cuantizacion int8.
- Inferencia local y privada, sin necesidad de servicios en la nube.
- Integracion con la biblioteca Transformers de Hugging Face (para el modelo base MarianMT) y con ONNX Runtime para la version cuantizada.
- No soporta generacion de codigo, razonamiento general, vision, audio ni tool calling: es un modelo especializado unicamente en traduccion.

## Casos de uso

- Localizacion de contenido web y documentacion: traduccion de articulos, paginas y manuales del indonesio al ingles de forma automatizada y en lote, aprovechando el bajo coste por inferencia en CPU.
- Chatbots de atencion al cliente bilingues: traduccion de mensajes de usuarios indonesios a ingles para enrutarlos a sistemas o agentes que operan en ingles, y viceversa si se combina con el par inverso.
- Procesamiento de datos multilingues en pipelines ETL: normalizacion al ingles de texto extraido de fuentes indonesias (redes sociales, opiniones, noticias) antes de aplicar analitica o modelos de NLP en ingles.
- Aplicaciones moviles y de escritorio offline: el modelo cuantizado int8 puede empaquetarse en aplicaciones que traduzcan sin conexion, util en zonas con conectividad limitada.
- Traduccion de corpus academicos y de investigacion: preparacion de datasets paralelos o monolingues alineados para estudios linguisticos o entrenamiento de otros modelos.
- Comercio electronico transfronterizo: traduccion de fichas de producto, resenas y consultas de clientes entre mercados indonesios y de habla inglesa, con latencia baja y coste minimo por operacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Como referencia general, los modelos Opus-MT suelen evaluarse con la metrica BLEU/chrF sobre testsets de Tatoeba y flores, pero este repositorio no incluye puntuaciones concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en GPU; en CPU, el modelo cuantizado int8 ocupa tipicamente del orden de unas decenas de megabytes en RAM (los MarianMT base tienen en torno a 74 millones de parametros, lo que da aproximadamente 75-80 MB en int8), aunque la cifra exacta no esta documentada en el repositorio.
- GPU recomendadas: no necesarias; el modelo esta orientado a inferencia en CPU mediante ONNX Runtime.
- Consumer GPU: no es necesario usar GPU; si se desea, cualquier GPU moderna con soporte ONNX Runtime (incluido DirectML o CUDA EP) puede ejecutarlo sin problemas de memoria.
- Opciones de despliegue: ONNX Runtime (Python, C#, C++, Java), Transformers de Hugging Face con backend ONNX, servicios como Azure ONNX Runtime, o contenedores ligeros en CPU. No requiere vLLM, TGI ni llama.cpp (este ultimo no soporta ONNX directamente).
- Latencia y throughput: no disponibles; al ser un modelo pequeño y cuantizado, se esperan latencias de milisegundos por frase en CPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| rekonek-models/opus-mt-id-en-onnx-int8 | no disponible | no disponible | ONNX int8 | Apache 2.0 | Version cuantizada para CPU, par id-en |
| Helsinki-NLP/opus-mt-id-en | ~74 M (tipico MarianMT) | ~512 tokens (tipico) | PyTorch (safetensors/bin) | Apache 2.0 | Modelo base sin cuantizar, referencia de la familia |
| facebook/m2m100_418M | 418 M | ~1024 tokens | PyTorch (safetensors) | MIT | Multilingue (100 idiomas), mayor tamaño, requiere GPU o CPU potente |
| google-t5/t5-base (tarea traduccion) | 220 M | ~512 tokens | PyTorch (safetensors) | Apache 2.0 | Multitarea, traduccion indirecta, menos optimizado por par |

## Limitaciones y advertencias

- La model card del repositorio es practicamente vacia: no documenta el rendimiento, el dataset de entrenamiento, la calidad de traduccion ni el proceso de cuantizacion, por lo que conviene validar la calidad con tus propios datos antes de usarlo en produccion.
- Al tratarse de un modelo especializado en un unico par de idiomas, no sirve para otros pares ni para tareas generales de lenguaje.
- Los modelos Opus-MT entrenados con corpus de OPUS pueden heredar sesgos de los datos de origen (por ejemplo, OpenSubtitles contiene lenguaje coloquial y estereotipos de genero), lo que puede afectar a la neutralidad de las traducciones.
- Riesgo de alucinacion o traducciones incoherentes en entradas fuera de dominio, texto muy largo, terminologia tecnica especializada o idioma de entrada incorrecto (si se le pasa texto que no es indonesio).
- La longitud de contexto es limitada (tipicamente unas centenas de tokens en MarianMT); documentos largos deben dividirse en segmentos.
- La cuantizacion int8 puede degradar ligeramente la calidad de traduccion respecto al modelo en precision completa; no hay evaluaciones publicadas que cuantifiquen esta perdida.
- La licencia Apache 2.0 permite uso comercial sin restricciones significativas, aunque no hay garantias de calidad ni soporte asociados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rekonek-models/opus-mt-id-en-onnx-int8
- Modelo base de referencia (Helsinki-NLP opus-mt-id-en): https://huggingface.co/Helsinki-NLP/opus-mt-id-en
- Proyecto OPUS (corpus paralelos): https://opus.nlpl.eu/
- Proyecto Tatoeba-MT / Opus-MT: https://github.com/Helsinki-NLP/Opus-MT
- ONNX Runtime: https://onnxruntime.ai/
