# litert-community/GLiFormer-Large-NER-LiteRT

## Resumen

GLiFormer-Large-NER-LiteRT es la conversión a formato LiteRT (`.tflite`) del modelo de reconocimiento de entidades nombradas `knowledgator/gliformer-large-v1`, un transformer basado en DeBERTa con 575,6 millones de parámetros y licencia Apache-2.0. El objetivo es ejecutar la ruta de extracción de entidades directamente en dispositivos Android mediante Google LiteRT, sin aproximar las matemáticas del modelo original: la conversión se realizó con LiteRT Torch y los pesos se mantienen en FP32 (con variantes `wfp16` que solo almacenan las capas `FULLY_CONNECTED` en float16 y dequantizan a float32 en ejecución).

El modelo resuelve un problema muy concreto: llevar NER de calidad de servidor a un teléfono con aceleración GPU. Para ello, el autor publica tres ventanas de codificación (128, 256 y 512 tokens) con grafos separados de encoder y cabeza en las ventanas largas, porque el compilador GPU de LiteRT 2.2.0 no tolera cabezas BiLSTM desenrolladas de más de 6.286 operadores. La configuración validada es LiteRT 2.2.0 sobre un Samsung Galaxy S26 (SM-S942Q, chip SM8850, Android 16) con computación GPU FP32 explícita; en 70 entradas en inglés los spans extraídos coinciden exactamente con la implementación oficial `gliformer` en FP32 sobre CPU (micro-F1 de 1.000 por etiqueta y offsets de carácter).

Es relevante ahora porque demuestra que un modelo de extracción de información de casi 600 millones de parámetros puede desplegarse en un móvil de gama alta con paridad numérica respecto al original, a costa de un consumo de memoria elevado (2,6 GB residentes para la ventana de 128 tokens, picos de 4,5 GB durante la compilación del delegado GPU). No es un modelo generativo: es un token-classifier especializado en NER zero-shot con etiquetas definidas por el usuario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer DeBERTa (encoder) + cabeza BiLSTM a nivel de palabra, empaquetado en grafos LiteRT |
| Parámetros totales | 575,6 M (modelo base `knowledgator/gliformer-large-v1`) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de codificación de 128, 256 y 512 tokens; 48, 256 y 512 palabras de texto respectivamente |
| Tipos de cuantización | FP32 (referencia exacta) y `wfp16` (pesos `FULLY_CONNECTED` en float16 con `DEQUANTIZE` a float32; activaciones y resto de constantes en float32) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.tflite` (LiteRT), más tabla de embeddings en `.bin` (float32 y float16) |
| Librería | `litert` |
| Pipeline | `token-classification` |
| Tamaño del repositorio | 7,4 GB |
| Modelo base | `knowledgator/gliformer-large-v1` (relación: quantized) |

## Arquitectura y entrenamiento

La información disponible no detalla el proceso de entrenamiento del modelo base (`knowledgator/gliformer-large-v1`): no se especifican número de tokens, composición del dataset ni si hubo RLHF o DPO. Lo que sí se describe es la arquitectura de despliegue: un encoder DeBERTa (1.773 operadores en el grafo LiteRT) que compila en GPU a cualquier ventana, y una cabeza a nivel de palabra implementada como BiLSTM desenrollada para T pasos (6.286 operadores o más en las ventanas de 256 y 512 tokens), que no compila en el delegado GPU de LiteRT 2.2.0 y se ejecuta en CPU.

La innovación técnica principal es el troceado controlado por el host: una única API decide la ventana más pequeña que cabe en el texto y el runtime reparte la ejecución entre GPU (encoder) y CPU (cabeza) en las ventanas largas, sin trocear nunca por debajo de la ventana de 512 tokens. La tabla de embeddings (`[128008, 1024]`, 524 MB en FP32 o 262 MB en FP16) reside en el host y se consulta por filas de token, lo que evita incluirla en el grafo. La conversión se realizó con LiteRT Torch y, según el autor, no aproxima ninguna operación: los ficheros `fp32` son las referencias exactas y los `wfp16` solo cambian el almacenamiento de pesos.

## Capacidades

- Reconocimiento de entidades nombradas (NER) zero-shot: el usuario define la lista de etiquetas en tiempo de inferencia (`person`, `organization`, `location`, `product`, `date`, etc.).
- Extracción de spans con offsets de carácter exactos y puntuación de confianza por entidad, con umbral configurable (el ejemplo usa 0,5).
- Token-classification sobre texto en inglés, con tokenizador y ficheros de configuración fijados al checkpoint original.
- Ejecución en Android mediante LiteRT `CompiledModel` con delegado GPU (precisión FP32) y fallback a CPU para la cabeza.
- Runtime de host en Python que reproduce el pipeline completo en CPU de escritorio, útil para validación y para generar referencias.
- No soporta generación de texto, tool calling, agentes, visión, audio ni modo de razonamiento: es exclusivamente un extractor de entidades.
- Sin capacidades multilingües: solo inglés.

## Casos de uso

- Extracción de entidades en apps Android sin conexión: el modelo corre en el propio dispositivo con LiteRT, de modo que datos sensibles (nombres, organizaciones, fechas) no salen del teléfono. Adecuado por la paridad exacta con la implementación FP32 de referencia.
- Procesamiento de notas y correos en el móvil: con la ventana de 128 tokens (48 palabras) se cubren frases y párrafos cortos con una sola llamada y 80 ms por inferencia tras la compilación inicial; el runtime elige automáticamente la ventana menor que cabe.
- Enriquecimiento de contactos y agendas: detección de personas, organizaciones y localizaciones en texto libre para autocompletar fichas, usando etiquetas personalizadas por el usuario en cada llamada.
- Anonimización previa a registro (redaction): localizar entidades personales y sustituirlas antes de enviar logs o telemetría a un backend, aprovechando los offsets de carácter exactos que devuelve el modelo.
- Indexación y búsqueda documental en el dispositivo: extracción de entidades para construir índices locales sobre documentos largos, troceando por frase con el helper incluido cuando se supera la ventana práctica de 256 tokens.
- Validación de pipelines en servidor: usar los ficheros `fp32` como referencia exacta en CPU de escritorio para comparar contra la ejecución móvil, o el runtime Python para pruebas de regresión del extractor antes de publicar la app.
- Extracción de entidades en formularios y OCR post-procesado: aplicar el modelo al texto reconocido de tickets o facturas para identificar productos, fechas y organizaciones, siempre que el texto esté en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible; el modelo es un token-classifier y no aplica ese tipo de evaluación. El autor sí reporta una validación de paridad y métricas de ejecución:

| Métrica | Valor reportado |
|---|---|
| Paridad con `gliformer` FP32 CPU (70 entradas en inglés) | Micro-F1 1.000 por etiqueta y offsets de carácter, con todos los ficheros publicados |
| Memoria residente, grafo s128 (707 MB) en Galaxy S26 | 2,6 GB tras carga; pico de 4,5 GB durante la compilación del delegado GPU |
| Primera llamada tras arranque del proceso (s128) | 5,0 s (4,7 s de compilación) |
| Llamadas posteriores (s128) | 80 ms |
| Memoria residente, split s256 en un proceso | 4,6 GB |
| Memoria residente, cabeza s512 sola en CPU | 4,7 GB |
| Operadores del grafo s128 completo | 4.149 (una sola partición en el delegado GPU ML Drift) |
| Operadores del encoder DeBERTa | 1.773 (compila en GPU en todas las ventanas) |

## Requisitos de hardware

- VRAM/RAM estimada: el grafo s128 pesa 707 MB en disco pero requiere 2,6 GB residentes y picos de 4,5 GB al compilar en GPU; el split s256 necesita 4,6 GB residentes; la cabeza s512 sola consume 4,7 GB en CPU. La tabla de embeddings añade 524 MB (FP32) o 262 MB (FP16) en el host.
- GPU recomendadas: la única configuración validada es un Samsung Galaxy S26 (SM-S942Q, SM8850) con Android 16, LiteRT 2.2.0 y delegado GPU FP32. Otras familias GPU Android y teléfonos con menos memoria no han sido validados según el autor.
- ¿Cabe en GPU de consumo? El modelo está pensado para móviles de gama alta, no para GPUs de escritorio; en escritorio solo se ha verificado la ejecución CPU de los grafos `fp32` de referencia.
- Opciones de despliegue: LiteRT en Android (Kotlin, carpeta `android/` con host y app de ejemplo) y runtime Python de host (`host_assets/runtime.py`) para CPU de escritorio con `requirements-lock.txt` en Python 3.12. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: 80 ms por llamada en régimen estacionario con la ventana s128 en el Galaxy S26; 5,0 s la primera llamada por la compilación del delegado. No se reportan cifras para s256 ni s512.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Formato y despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| GLiFormer-Large-NER-LiteRT | 575,6 M | 128/256/512 tokens | LiteRT `.tflite`, Android GPU + CPU | Apache-2.0 | Paridad exacta con el original; validado solo en Galaxy S26 |
| `knowledgator/gliformer-large-v1` | 575,6 M | Según checkpoint original | PyTorch (Hugging Face) | Apache-2.0 | Modelo de referencia; ejecución en servidor |
| `knowledgator/gliner` (paquetes referenciados por el runtime) | No disponible | No disponible | PyTorch | No disponible | Usado solo para el decodificador upstream en el runtime de host |
| Alternativas NER en dispositivo de otros autores | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Solo inglés: no hay soporte multilingüe declarado, y el tokenizador está fijado al checkpoint original.
- No es un modelo generativo: no responde preguntas ni redacta; únicamente etiqueta spans. No dispone de tool calling, agentes ni razonamiento multi-paso.
- Validación limitada: el autor solo ha validado LiteRT 2.2.0 en un Samsung Galaxy S26 (SM-S942Q, SM8850, Android 16) con GPU FP32; otras GPUs Android y móviles con menos memoria no están verificados.
- Consumo de memoria muy alto para un móvil: 2,6 GB residentes y picos de 4,5 GB con la ventana s128, y 4,6 GB con el split s256. La cabeza s512 sola ocupa 4,7 GB en CPU, por lo que el autor recomienda tratar s256 como ventana práctica y trocear documentos largos por frase.
- Defecto de runtime documentado: el compilador GPU de LiteRT 2.2.0 falla con cabezas BiLSTM desenrolladas de 6.286 operadores o más (no es un límite de memoria: la cabeza falla con 570 MB de RSS). El reparto encoder-GPU/cabeza-CPU es una solución de compromiso, no una optimización opcional.
- Riesgo de alucinación de spans: como todo extractor, puede asignar etiquetas a fragmentos no pertinentes; el umbral de confianza (0,5 en el ejemplo) debe calibrarse por caso de uso.
- Sesgos: no se documentan en la información disponible; al entrenarse solo en inglés, el rendimiento en texto con code-switching o dominios muy técnicos no está caracterizado.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento en configuraciones no validadas; conviene mantener los ficheros `fp32` como referencia de regresión.
- El repositorio ocupa 7,4 GB, lo que complica su empaquetado en apps móviles si se incluyen todas las variantes; hay que seleccionar solo los ficheros de la ventana elegida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/GLiFormer-Large-NER-LiteRT
- Modelo base: https://huggingface.co/knowledgator/gliformer-large-v1
- Repositorio de LiteRT: no disponible en la información proporcionada
- Paper o blog del modelo base: no disponible en la información proporcionada
- Demo o app de ejemplo: incluida en el repositorio (`android/` y `examples/run_example.py`), sin URL externa en la información proporcionada
