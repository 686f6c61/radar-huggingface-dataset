# smdesai/d1-omni-600M-CoreAI

## Resumen

d1-omni-600M-CoreAI es una conversion del modelo de decision multimodal LiquidAI/d1-omni-600M al formato Core AI de Apple, reautoria de smdesai para ejecutarse sobre la Neural Engine y la GPU de dispositivos iOS y Mac. El modelo base, de 587 millones de parametros y construido sobre LFM2.5-Encoder-350M, no es un generador de texto: recibe un estado (texto, JSON, una foto o un fragmento de voz) junto con preguntas con nombre y devuelve respuestas tipadas (una probabilidad si/no, una eleccion entre opciones nombradas o un nivel) leidas de su propia distribucion en una unica pasada, sin generar tokens.

La relevancia de esta ficha concreta es el empaquetado: el autor ha convertido el modelo a grafos Core AI de formas fijas en fp16 para la Neural Engine (19 puntos de entrada sobre una sola copia de los pesos) y variantes para GPU con formas dinamicas, con torres de vision SigLIP2 y de audio FastConformer. El resultado son los modelos portables que sustentan la aplicacion D1 Showcase para iPhone, con decisiones tomadas en el dispositivo y sin dependencia de nube.

Segun los datos publicados, la version compilada mantiene una fidelidad del 100 % en la misma respuesta frente al modelo original sobre 1.011 preguntas de referencia, con una diferencia maxima de probabilidad de 0,042, y latencias de 97 ms para un ticket de soporte de tres preguntas, 0,76 s para una foto con tres preguntas y 155 ms para una nota de voz de 10 segundos en un iPhone 17 Pro. El repositorio ocupa 2,2 GB y se distribuye bajo la licencia LFM Open License v1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de decision multimodal sobre LFM2.5-Encoder-350M; conversacion a Core AI con torre de vision SigLIP2 y encoder de audio FastConformer |
| Parametros totales | 587 millones (600M nominal) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Buckets de hasta 2.048 posiciones en el trunk de texto y prefijos multimedia de hasta 2.048 posiciones; longitud maxima documentada en la model card, no disponible como cifra unica |
| Tipos de cuantizacion | fp16 en pesos (Neural Engine), fp16 con matematicas fp32 en GPU; embeddings en fp16 (embed_tokens.f16) |
| Idiomas soportados | en, de, es, fr, it, nl, pl, pt, ar, hi, ja, ru, tr, vi, zh |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | `.aimodel` (Core AI); `embed_tokens.f16`; tokenizer.json; compilacion a `.aimodelc` mediante `compile.sh` |

## Arquitectura y entrenamiento

El modelo base d1-omni-600M es un modelo de decision construido sobre LFM2.5-Encoder-350M (familia Liquid Foundation Models). Su funcionamiento es distinto al de un transformer generativo: cada pregunta se serializa como su propia secuencia con la plantilla `<bos> state <q> instructions <opt><mask> option … <decide>`, y el modelo devuelve logits (1, K) leidos directamente de su distribucion en una sola pasada, sin decodificacion autoregresiva y sin generar tokens. La salida es una respuesta tipada: una probabilidad si/no, una eleccion entre opciones nombradas o un nivel.

La conversion a Core AI mantiene un unico tensor de pesos y expone multiples puntos de entrada de forma fija para la Neural Engine: `trunk_all` con buckets `trunk_b1_l{128,256,512,1024,2048}_k{8,16}`, `prefix_p{512,1024,2048}` y `text_p{P}_t{128,512}_k16`. El padding es exacto (las posiciones rellenadas se ponen a cero y se enmascaran), de modo que un bucket mayor cuesta computo pero no precision. Las mascaras se construyen en el host con el valor −40000 porque la Neural Engine maneja mal −inf, y las tablas RoPE (theta = 1e6) se pasan como entradas del host. En la ruta de GPU los grafos usan formas dinamicas. Los pesos del trunk son fp16 con matematicas fp32 en la GPU, la torre de vision es SigLIP2 con proyector (una ventana de imagen por llamada, hasta 10 teselas de 512 px) y el encoder de audio es FastConformer con adaptador sobre una ventana de 30 s.

No se han publicado en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO para el modelo base.

## Capacidades

- Decision multimodal sobre un estado: texto, JSON, imagen o fragmento de voz, con devolucion de respuestas tipadas en una sola pasada.
- Clasificacion y calibracion: salida de probabilidad si/no, eleccion entre opciones nombradas o nivel.
- Vision: entrada de imagenes mediante torre SigLIP2 y proyector, con empaquetado estilo LFM2-VL de hasta 10 teselas de 512 px.
- Audio: transcodificacion de ventanas de voz de hasta 30 s mediante encoder FastConformer.
- Multilingue: 15 idiomas declarados (en, de, es, fr, it, nl, pl, pt, ar, hi, ja, ru, tr, vi, zh).
- Ejecucion en dispositivo: inferencia en Neural Engine y GPU de iPhone y Mac sin generacion de tokens.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo resuelve en una unica pasada.

## Casos de uso

- Clasificacion de tickets de soporte en el dispositivo: el modelo recibe el texto de un ticket y un conjunto de preguntas nombradas (categoria, urgencia, requiere escalado) y devuelve las respuestas tipadas en una pasada; los datos publicados dan 97 ms para tres preguntas en un iPhone 17 Pro.
- Inspeccion visual asistida: con una foto y preguntas nombradas (hay defecto, tipo de defecto, gravedad), el modelo produce respuestas calibradas en 0,76 s para tres preguntas, util para control de calidad en campo sin conexion.
- Analisis de notas de voz: transcodificacion y decision sobre fragmentos de hasta 30 s de audio (por ejemplo, deteccion de intencion o sentimiento) con 155 ms de latencia para una nota de 10 s.
- Triage de formularios JSON: dado un estado en JSON y preguntas nombradas, el modelo aplica reglas de negocio y clasifica el caso sin generar texto libre.
- Asistente de decisiones embebido en app iOS: la aplicacion D1 Showcase emplea estos modelos para decisiones de camara, voz y texto directamente en el dispositivo.
- Moderacion de contenido local: clasificacion si/no calibrada sobre texto o imagenes en el propio telefono, evitando enviar datos a servicios externos.
- Enrutado de peticiones en pipelines: uso del modelo como clasificador rapido que decide a que modelo o servicio derivar una consulta en funcion de su contenido multimodal.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| Fidelidad frente al modelo original | 100 % misma respuesta; diferencia maxima de probabilidad 0,042 | 1.011 preguntas de referencia, iPhone 17 Pro (Neural Engine) |
| Ticket de soporte, 3 preguntas | 97 ms | iPhone 17 Pro |
| Foto, 3 preguntas | 0,76 s | iPhone 17 Pro |
| Nota de voz de 10 s | 155 ms | iPhone 17 Pro |
| Decision Index v0.2.1 | no disponible para d1-omni-600M | El valor 48,57 corresponde a d1-3B, no a este modelo |

Compilacion: los grafos compilaron limpiamente en las nueve arquitecturas iOS probadas (h13g a h19p) como modelos separados; el trunk combinado se verifico en h15c y h18p.

## Requisitos de hardware

- Entorno obligatorio: Xcode con Core AI para ejecutar `xcrun coreai-build compile`; el paquete incluye `compile.sh` (compilacion en un solo comando, aproximadamente 2,5 min).
- Tamano en disco: repositorio de 2,2 GB; trunk Neural Engine de 604 MB, vision de 180 MB y audio de 218 MB en fp16; embeddings de 128 MB (65.536 × 1.024).
- iPhone: ejecucion en Neural Engine del iPhone 17 Pro (A19 Pro) y en GPU como respaldo para entradas largas; requiere el entitlement `com.apple.developer.kernel.increased-memory-limit`, que eleva el margen de la Neural Engine de 1,9 a 4,75 GB y el de la GPU de 3,3 a 6,2 GB.
- Mac: los modelos de GPU (`gpu/*.aimodel`) se ejecutan directamente y Core AI los especializa en la primera carga; probado en M3 Max (h15c) y h18p.
- GPU dedicadas (A100, H100, RTX 4090): no aplica; este paquete esta orientado a Neural Engine y GPU de Apple.
- Opciones de despliegue: Core AI en iOS y macOS mediante `AIModel(contentsOf:)` con opciones de especializacion por defecto; vLLM, llama.cpp, Ollama o TGI no son aplicables a este formato.
- Latencia y throughput: las latencias publicadas son las de la tabla de benchmarks (97 ms, 0,76 s y 155 ms segun el caso); no se ha publicado throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidades | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d1-omni-600M-CoreAI (este) | 587 M | Texto, JSON, imagen, audio | Buckets hasta 2.048 | LFM Open License v1.0 | HuggingFace, formato Core AI |
| LiquidAI/d1-omni-600M | 587 M | Texto, JSON, imagen, audio | no disponible | LFM Open License v1.0 | HuggingFace, modelo base original |
| LiquidAI/d1-3B | 3 B | Texto e imagen | no disponible | no disponible | HuggingFace; Decision Index v0.2.1 de 48,57 |

La comparacion de rendimiento con alternativas de la misma categoria no esta disponible en la informacion proporcionada, salvo el valor de Decision Index de d1-3B, que no corresponde a este modelo.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion: al no generar texto y devolver respuestas leidas de su distribucion, el riesgo se manifiesta como clasificaciones incorrectas o mal calibradas, no como texto inventado.
- Limitaciones de contexto o idioma: los grafos de la Neural Engine tienen formas fijas y el host debe rellenar cada entrada a un bucket, lo que impone limites duros de longitud; los idiomas soportados son los 15 declarados.
- Restricciones de licencia: LFM Open License v1.0 (license: other); deben revisarse las condiciones para uso comercial antes de desplegar en produccion.
- Caveat operativo de compilacion: `coreai-build` devuelve codigo 0 aunque la Neural Engine rechace un grafo, por lo que el script cuenta las regiones compiladas (19 para el trunk, 1 para vision y 1 para audio) y falla si no coinciden.
- Requisito de carga: solo un bundle compilado con `--preferred-compute neural-engine` y cargado con opciones de especializacion por defecto se ejecuta en la Neural Engine; un `.aimodel` cargado con JIT lo hace en la GPU independientemente de la preferencia.
- Dependencia de plataforma: el paquete esta atado a Core AI, Xcode y hardware Apple; no es portable a pilas de inferencia estandar como vLLM o llama.cpp.
- Modelo base no generativo: no es adecuado para tareas de generacion de texto, codigo o conversacion abierta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/smdesai/d1-omni-600M-CoreAI
- Modelo base: https://huggingface.co/LiquidAI/d1-omni-600M
- Repositorio de conversion Core AI (john-rocky): https://github.com/john-rocky/coreai-model-zoo/tree/main/models/d1-omni-600m
- Blog de Liquid AI sobre la familia d1: https://www.liquid.ai/blog/d1-open
- Analisis practico de D1-Omni-600M en local: https://www.mindstudio.ai/blog/d1-omni-600m-locally
- Cobertura de d1-3B y d1-omni-600M: https://www.aitoolsoasis.com/en/news/liquid-ai-launches-d1-3b-and-d1-omni-600m-multimodal-1791432058865
