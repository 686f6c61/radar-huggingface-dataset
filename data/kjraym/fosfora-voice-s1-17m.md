# kjraym/fosfora-voice-s1-17m

## Resumen

Fosfora voice s1-17m es un modelo de decisión de 17 millones de parámetros desarrollado por el usuario kjraym para el proyecto Fosfora. No es un modelo generativo: es un clasificador encoder que convierte una frase hablada sobre una "room" de Fosfora en una acción tipada, resolviéndola como una cascada de cuatro decisiones puntuadas contra candidatos (si la frase es una petición, qué tipo de acción de quince posibles, sobre qué superficie y con qué valor). El modelo se deriva del cross-encoder Ettin-reranker-17m-v1 de Apache-2.0 y se ejecuta íntegramente en local.

Su relevancia radica en el escenario de despliegue: corre en las gafas Meta Quest 3 mediante ONNX Runtime en unos 0,15 a 0,3 segundos por frase, sin conexión de red. Esto lo convierte en un ejemplo de clasificador de intenciones ultraligero pensado para interfaces de voz en dispositivos XR con recursos limitados, donde una gramática fija cubre las órdenes conocidas y este modelo resuelve lo que la gramática no alcanza.

El modelo se entrenó exclusivamente con datos sintéticos generados a partir del propio catálogo de superficies y nomenclatura de Fosfora (800 rooms y alrededor de 1.100 plantillas de formulación), sin usar ningún conjunto de datos externo. La licencia es Apache-2.0 y el idioma soportado es únicamente el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer tipo ModernBERT (derivado de cross-encoder/ettin-reranker-17m-v1) |
| Parametros totales | 17M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 en embeddings de tokens, bloques y cabezas en FP32 (model_int8.onnx); version FP32 propia no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (model_int8.onnx, 29 MB) mas tokenizer.json y provider-spec.json |

## Arquitectura y entrenamiento

El modelo es un encoder transformer basado en ModernBERT, heredado del cross-encoder Ettin-reranker-17m-v1. Funciona como un reranker de decisión: recibe un prefijo (prefix_ids, prefix_mask) que representa la pregunta de decisión y un conjunto de documentos candidatos (doc_ids, doc_mask, owners), y devuelve logits de forma [n, 3] que se interpretan como tres columnas (elección, sí/no y puntuación). La elección se normaliza con softmax sobre los candidatos de una misma decisión, y la cascada completa de cuatro preguntas, el renderizado y el mapeo de identificadores se definen en el archivo provider-spec.json.

El entrenamiento se realizó con el toolkit MIT bekko-system-one a partir de casos sintéticos generados desde el catálogo de superficies de Fosfora: 800 rooms, unas 1.100 plantillas de formulación, etiquetas suaves (soft labels) en los casos en que varias respuestas son válidas y ejemplos negativos de frases que no son peticiones. No se empleó ningún conjunto de datos externo. No se documenta en la información disponible el uso de RLHF ni DPO; se trata de un clasificador supervisado, no de un modelo alineado por preferencias. El tokenizador es el de ModernBERT/Ettin (BPE a nivel de byte).

## Capacidades

- Clasificación de intención a partir de texto: determina si una frase es una petición o no.
- Clasificación jerárquica en cascada: identifica el tipo de acción (quince categorías), la superficie afectada y el valor a aplicar.
- Resolución de valores tipados: comportamientos del catálogo de la superficie, colores, bandas, intensidades y efectos de mundo.
- Puntuación contra candidatos mediante logits de elección con softmax, apta para umbrales de confianza.
- Inferencia local y sin red, optimizada para ONNX Runtime en hardware XR.
- Manejo de etiquetas suaves, es decir, escenarios donde más de una respuesta es correcta.
- Detección de frases que no son peticiones (clase negativa).
- Idiomas: exclusivamente inglés.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento; es un clasificador de decisión cerrado.

## Casos de uso

- Control por voz en gafas XR: el modelo traduce una orden hablada sobre la room de Fosfora en una acción tipada, ejecutándose en la propia Quest 3 sin red y en 0,15 a 0,3 s por frase.
- Respaldo de una gramática fija en asistentes de voz: cuando la gramática determinista no reconoce la formulación, este modelo resuelve la intención que la gramática no cubre.
- Clasificación de intenciones en dispositivos embebidos: gracias a sus 17M de parámetros y 29 MB en INT8, es viable en microcontroladores o SoC de baja potencia con ONNX Runtime.
- Enrutado de comandos en aplicaciones de domótica o escenas 3D: dado que distingue tipo de acción, superficie y valor, sirve para mapear lenguaje natural a llamadas a API internas.
- Filtrado de falsos positivos de voz: la decisión de "es una petición" permite descartar frases conversacionales o ruido antes de ejecutar acciones.
- Prototipado rápido de clasificadores de intención multietiqueta: la estrategia de entrenamiento con datos sintéticos y etiquetas suaves es reutilizable para dominios con catálogos propios.
- Sistema de decisión con umbral de confianza en producción: los logits y su softmax permiten establecer una cota mínima de confianza antes de ejecutar una acción (el propio autor indica que la app mantiene ese umbral delante del modelo).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí reporta una medición específica sobre 40 frases nunca vistas durante el entrenamiento:

| Metrica | Resultado |
|---|---|
| Frases cubiertas por la gramatica (de 25) | 25 de 25 |
| Frases que la gramatica no cubre (de 10) | 6 de 10 |
| Frases que no son peticiones (de 5) | 5 de 5 |
| Casos completos correctos en formulaciones no vistas | 0,855 |
| Latencia en Quest 3 (6 hilos) | 146 ms por frase |
| Latencia en Quest 3 (4 hilos) | 171 ms por frase |
| Latencia en Quest 3 (2 hilos) | 257 ms por frase |
| Memoria en Quest 3 | 134 MB |

El punto débil señalado por el autor es la compuerta de detección de peticiones con formulaciones poco familiares.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el archivo en INT8 ocupa 29 MB y el modelo consume en torno a 134 MB de memoria en el dispositivo medido, por lo que cabe con holgura en cualquier GPU moderna.
- GPU recomendadas: no requiere GPU dedicada; está pensado para CPU y aceleradores integrados. Puede ejecutarse en cualquier GPU consumer (por ejemplo, RTX 4090) o integrada sin problema, e incluso en el SoC Snapdragon XR2 Gen 2 de la Quest 3.
- Cabe en GPU de consumo: sí, en la práctica totalidad de tarjetas consumer, y también en hardware móvil y XR.
- Opciones de despliegue: ONNX Runtime (el camino documentado por el autor). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un encoder ONNX de este tipo.
- Latencia y throughput estimados: 146 / 171 / 257 ms por frase en Quest 3 con 6 / 4 / 2 hilos respectivamente. No se proporcionan datos de throughput en otros equipos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kjraym/fosfora-voice-s1-17m | 17M | no disponible | Clasificacion de decision en cascada (voz a accion) | Apache-2.0 | HuggingFace, ONNX |
| cross-encoder/ettin-reranker-17m-v1 | 17M | no disponible | Reranking cross-encoder | Apache-2.0 | HuggingFace (modelo base) |
| Clasificadores de intencion genericos de tamano similar (MiniLM, DistilBERT) | entre 6M y 66M | no disponible | Clasificacion de texto general | variable | HuggingFace |

No se dispone de datos de rendimiento comparativos directos con alternativas de la misma categoria en la informacion proporcionada. El modelo base Ettin-reranker-17m-v1 comparte arquitectura y tamano, pero esta orientado a reranking generico, no a la cascada de decision especifica de Fosfora.

## Limitaciones y advertencias

- Es un clasificador cerrado de 17M de parametros, no un modelo generativo: no produce texto libre y no sirve para tareas de generacion, razonamiento abierto ni codigo.
- Solo soporta ingles; cualquier formulacion en otro idioma queda fuera de su dominio.
- Entrenado exclusivamente con datos sinteticos generados desde el catalogo de Fosfora, lo que limita su generalizacion a otros dominios o vocabularios.
- El propio autor identifica la compuerta de deteccion de peticiones como punto debil ante formulaciones no familiares; por eso recomienda mantener un umbral de confianza delante del modelo.
- Los numeros de evaluacion (25/25, 6/10, 5/5, 0,855) provienen de una muestra pequena de 40 frases, por lo que no constituyen una validacion estadisticamente robusta.
- No se documentan sesgos especificos, pero al ser entrenado con un catalogo sintetico y un unico idioma puede heredar la distribucion de esas plantillas.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea ante entradas fuera de distribucion.
- Licencia Apache-2.0, que permite uso comercial; conviene verificar igualmente las licencias del modelo base y del toolkit (Apache-2.0 y MIT respectivamente, ambas permisivas).
- El repositorio figura con 0 descargas y 0 likes y un tamano de 0,0 GB, coherente con un modelo muy reciente o poco difundido; no hay validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kjraym/fosfora-voice-s1-17m
- Modelo base: https://huggingface.co/cross-encoder/ettin-reranker-17m-v1
- Toolkit de entrenamiento bekko-system-one: https://github.com/hotchpotch/bekko-system-one
- Repositorio del proyecto Fosfora (rama xr, docs/xr/VOICE_DESIGN.md): https://github.com/kevinraymond/fosfora
