# Orvena/Cue-0.4B

## Resumen

Cue-0.4B es un modelo de clasificación de texto desarrollado por Orvena para resolver el problema del turn-taking (gestión de turnos de palabra) en asistentes de voz. Es el componente que decide, en tiempo real, si el usuario está interrumpiendo al asistente, si le pide algo nuevo o si simplemente hace un backchannel ("mm-hm"), y también clasifica los nuevos turnos de conversación en una de nueve intenciones rápidas (saludo, agradecimiento, despedida, etc.) que no requieren pasar por el modelo principal de lenguaje.

Técnicamente, Cue se construye a partir de las primeras 14 de las 28 capas de Qwen3-0.6B-Base, con un adaptador LoRA (rank 16 en cada capa lineal, ya fusionado en los pesos) y tres cabezas de clasificación sobre el último token: una de acción (continuar, detener, petición), un puntero sobre el inicio de las palabras del usuario y una de intención. Tiene 376,35 millones de parámetros y funciona en 30 idiomas.

Su relevancia radica en el despliegue on-device: empaquetado en Core ML, ejecuta una pasada hacia adelante en unos 8-10 ms en el Neural Engine de un iPhone, dejando la GPU libre para el modelo de lenguaje principal del asistente. Es un ejemplo notable de modelo pequeño y especializado que elimina la latencia de red en una tarea crítica para la experiencia de voz dúplex.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (primeras 14 capas de Qwen3-0.6B-Base) con LoRA fusionado y 3 cabezas de clasificación |
| Parametros totales | 376.354.317 |
| Parametros activos | no disponible (no es MoE; todos los parámetros se activan) |
| Longitud de contexto | 128 tokens (prompts más largos recortan las palabras del asistente más alejadas) |
| Tipos de cuantizacion | int8 (Core ML, embeddings de token int8 con escalas float32) |
| Idiomas soportados | 30: alemán, búlgaro, checo, coreano, croata, danés, eslovaco, esloveno, español, estonio, finés, francés, griego, húngaro, hindi, inglés, indonesio, italiano, japonés, letón, lituano, neerlandés, polaco, portugués, rumano, ruso, sueco, turco, ucraniano y vietnamita |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y Core ML (.mlpackage, int8) |

## Arquitectura y entrenamiento

Cue reutiliza las primeras 14 de las 28 capas del transformer de Qwen3-0.6B-Base y añade un adaptador LoRA de rank 16 sobre cada capa lineal, fusionado en los pesos publicados. Sobre el último token se colocan tres cabezas: una cabeza de acción con tres clases (continuar hablando, detenerse, petición), una cabeza de puntero que predice, para cada palabra del usuario, la probabilidad de ser el inicio de la petición, y una cabeza de intención con diez clases (el modelo principal o una de las nueve intenciones rápidas: confirmación de escucha, saludo, agradecimiento, reconocimiento simple, "no importa", "espera", "repite", despedida y "cómo estás"). La cabeza de intención ve la última frase del asistente, de modo que un "sí" o "gracias" que responde a una pregunta del asistente se enruta al modelo principal y no se interpreta como intención rápida.

El conjunto de entrenamiento consta de unos 63.000 ejemplos compuestos a partir de bancos de frases escritos para cada uno de los 30 idiomas (frases del asistente, backchannels, paradas, peticiones, charla lateral, intenciones rápidas), incluyendo más de 4.000 ejemplos "parecidos" que comparten palabras con las intenciones rápidas pero requieren el modelo principal (por ejemplo, "cancela mi reunión de las 3" o "gracias, ahora añade leche"). Se simula el ruido del reconocedor de voz eliminando puntuación y mayúsculas y repitiendo palabras. Los conjuntos de evaluación fueron escritos por personas distintas de los autores de los bancos de frases, en los 30 idiomas. La idea de combinar una cabeza de acción con un puntero sobre un modelo pequeño procede de Kev, de Jared Palmer; la cabeza de nuevos turnos, la cobertura de idiomas y el empaquetado para Neural Engine son aportaciones de Orvena.

## Capacidades

- Clasificación de interrupciones en tres acciones: continuar hablando, detenerse o tratar el enunciado como una nueva petición.
- Localización del inicio de la petición mediante una cabeza de puntero palabra a palabra (por ejemplo, extraer "¿y qué tal el viernes?" de "vale, vale, ¿y qué tal el viernes?").
- Clasificación de nuevos turnos en nueve intenciones rápidas o envío al modelo principal, con conciencia del contexto de la última frase del asistente.
- Soporte multilingüe en 30 idiomas, incluyendo japonés con recorte de contexto por caracteres en lugar de por palabras.
- Robustez al ruido de reconocimiento de voz (pérdida de puntuación, mayúsculas y repeticiones de palabras).
- Ejecución on-device en el Neural Engine de Apple (iOS 18 y macOS 15 o posteriores) mediante Core ML.
- No genera texto libre: es un modelo de clasificación y puntero, no un modelo de lenguaje generativo.

## Casos de uso

- Detección de barge-in en asistentes de voz: mientras el asistente habla, Cue decide en ~10 ms si el usuario quiere interrumpir de verdad, evitando cortes por backchannels ("mm-hm") y capturando paradas reales ("espera, para").
- Extracción de la petición efectiva tras una interrupción: el puntero señala la palabra donde empieza la petición, permitiendo limpiar muletillas y transiciones ("vale, vale, ahora comprueba Lisboa" → "ahora comprueba Lisboa").
- Triaje de turnos para ahorrar cómputo: saludos, agradecimientos y despedidas se responden sin invocar al LLM principal, reduciendo latencia y consumo de batería en móviles.
- Asistentes de voz dúplex on-device en iOS y macOS: el paquete Core ML int8 (~380 MB) ejecuta la decisión en el Neural Engine mientras la GPU genera la respuesta del asistente.
- Despliegue multiplataforma en servidor con PyTorch y Transformers: la clase `Cue` de `cue.py` permite integrar la decisión de turnos en pipelines de voz basados en Python (por ejemplo, con vLLM o TGI sirviendo al modelo principal).
- Localización de asistentes de voz: la cobertura de 30 idiomas con un único modelo simplifica el despliegue del mismo producto de voz en mercados europeos y asiáticos.

## Benchmarks y rendimiento

Datos publicados por Orvena, medidos con el paquete Core ML y los umbrales de `config.json`:

| Interrupciones (900 ejemplos) | Valor |
|---|---|
| Decisión correcta | 90,4 % |
| Paradas incorrectas ante un simple reconocimiento | 11,0 % |
| Continuar hablando pese a una parada | 10,8 % |
| Peticiones no detectadas | 4,4 % |
| Inicio de petición en la palabra etiquetada (sobre peticiones correctas) | 92,6 % |

| Nuevos turnos (1.800 ejemplos) | Valor |
|---|---|
| Decisión correcta | 95,2 % |
| Peticiones para el modelo principal respondidas como intención rápida | 0,1 % (1 de 990) |
| Intenciones rápidas enviadas al modelo principal | 10,4 % |
| Intención rápida respondida con la equivocada | 0,25 % |

Rendimiento en dispositivo (iPhone 17 Pro Max): ~8 ms por pasada en el Neural Engine, ~10 ms con la GPU ocupada generando; el paquete Core ML ocupa unos 380 MB. Según el autor, el modelo completo de 28 capas puntúa aproximadamente un punto porcentual más en estos mismos tests.

## Requisitos de hardware

- VRAM / memoria estimada: unos 380 MB en formato Core ML int8; el repo completo pesa 1,1 GB (safetensors, presumiblemente en precisión mayor). En inferencia con PyTorch en CPU, un modelo de 376 M de parámetros en fp16 requiere en torno a 0,75 GB.
- En Apple Silicon (iPhone, iPad, Mac con Neural Engine, iOS 18 / macOS 15 o posterior): cabe sobradamente en cualquier dispositivo reciente; no necesita GPU dedicada.
- En GPU de consumo (RTX 3060, RTX 4090, etc.): cabe con facilidad en cualquier GPU moderna con 4 GB o más de VRAM, incluso sin cuantizar.
- Despliegue: Core ML (TurnDecision.mlpackage) para Apple; PyTorch y Transformers mediante `cue.py` en servidor o CPU; no hay GGUF ni soporte documentado de llama.cpp, Ollama, vLLM o TGI.
- Latencia: ~8 ms por pasada en Neural Engine (iPhone 17 Pro Max), ~10 ms con la GPU ocupada; prompts de 128 tokens como máximo.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Orvena/Cue-0.4B | 376 M | Turn-taking y triaje de intenciones para voz | 30 | Apache 2.0 | 3 cabezas (acción, puntero, intención); Core ML int8; ~8-10 ms en Neural Engine |
| Qwen3-0.6B-Base (base) | 600 M (28 capas) | Modelo de lenguaje base generativo | Multilingüe | Apache 2.0 | Cue usa sus primeras 14 capas; el modelo completo puntúa ~1 punto más en los tests de Orvena |
| Kev (Jared Palmer) | no disponible | Cabeza de acción con puntero sobre un LLM pequeño | no disponible | no disponible | Inspiración del diseño; Cue añade la cabeza de nuevos turnos, 30 idiomas y empaquetado para Neural Engine |

No existen muchos modelos públicos directamente comparables: el turn-taking para asistentes de voz suele resolverse con heurísticas de VAD o componentes propietarios, lo que hace de Cue un caso poco habitual de componente especializado publicado con pesos abiertos.

## Limitaciones y advertencias

- No es un modelo generativo: solo clasifica y localiza; no puede sustituir al LLM principal del asistente.
- Tasa de error no despreciable en interrupciones: un 11 % de paradas indebidas ante backchannels y un 10,8 % de paradas ignoradas, lo que puede degradar la experiencia si no se combinan con umbrales ajustados.
- En nuevos turnos, un 10,4 % de intenciones rápidas se derivan al modelo principal (falso negativo costoso en latencia, aunque seguro); el umbral de despedida debe subirse a 0,97 antes de cerrar el modo de voz.
- El contexto es muy corto (128 tokens); en prompts más largos se recorta la información del asistente, lo que puede afectar a decisiones dependientes de contexto extenso.
- El rendimiento publicado procede del autor del modelo y se midió con sus propios conjuntos de test (900 y 1.800 ejemplos); no hay evaluación independiente de terceros.
- La licencia Apache 2.0 permite uso comercial sin restricciones relevantes, más allá de conservar el aviso de licencia.
- El despliegue optimizado (Neural Engine, ~8 ms) está limitado a iOS 18 y macOS 15 o posteriores; en otras plataformas habrá que usar la ruta PyTorch, con rendimiento no documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Orvena/Cue-0.4B
- Informe técnico (PDF en el repositorio): Cue-0.4B-technical-report.pdf (enlace relativo dentro del repositorio del modelo)
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Kev, de Jared Palmer (inspiración del diseño): https://github.com/jaredpalmer/kev
- Producto Orvena (modo de voz donde se integra Cue): https://orvena.app
