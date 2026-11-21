# litert-community/GLiFormer-Large-NER-LiteRT

## Resumen

GLiFormer-Large-NER-LiteRT es una conversión a LiteRT (el runtime de Google para inferencia en dispositivo) del modelo `knowledgator/gliformer-large-v1`, especializado en reconocimiento de entidades nombradas (NER) y extracción de información. Lo publica la comunidad `litert-community` y su propósito es ejecutar la ruta de extracción de entidades de un modelo de 575,6 millones de parámetros directamente en un teléfono Android, sin aproximar los cálculos: los pesos oficiales se convirtieron con LiteRT Torch y los resultados validados coinciden exactamente con la implementación fp32 de referencia en CPU.

El modelo hereda la arquitectura GLiNER (Generalist Language-Independent NER) sobre un encoder DeBERTa, con una cabeza BiLSTM a nivel de palabra y un decodificador que permite especificar las etiquetas de entidad en tiempo de inferencia en lugar de estar fijadas en el entrenamiento. La conversión ofrece tres ventanas codificadas (128, 256 y 512 tokens) con un reparto de cómputo entre GPU y CPU en Android, y un runtime anfitrión en Python y Kotlin que elige automáticamente la ventana más pequeña que quepa en el texto.

Su relevancia actual radica en que demuestra que un extractor de entidades de casi 600 millones de parámetros puede correr en un móvil de gama alta con paridad numérica exacta respecto a la referencia, algo poco habitual en modelos de este tamaño. El coste es la memoria: el grafo de 707 MB llega a 4,5 GB de pico durante la compilación del delegado GPU, por lo que está pensado para dispositivos de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER sobre encoder DeBERTa con cabeza BiLSTM a nivel de palabra y decodificador de etiquetas |
| Parametros totales | 575,6 M (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventanas de 128, 256 y 512 tokens (48, 256 y 512 palabras de texto respectivamente) |
| Tipos de cuantizacion | Pesos FULLY_CONNECTED en float16 con DEQUANTIZE a float32 (`wfp16`); variantes fp32 de referencia; tabla de embeddings en fp32 y fp16 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | TFLite (LiteRT), más tabla de embeddings en binario (`word_embeddings_fp32.bin`, `word_embeddings_fp16.bin`) |
| Tamano del repositorio | 7,4 GB |
| Pipeline | token-classification |
| Runtime validado | LiteRT 2.2.0 en Samsung Galaxy S26 (SM-S942Q, SM8850, Android 16) con GPU FP32 explícita |

## Arquitectura y entrenamiento

La arquitectura subyacente es GLiFormer, una variante de GLiNER que combina un encoder transformer tipo DeBERTa con una cabeza BiLSTM que opera sobre representaciones a nivel de palabra. El decodificador es generalista: las etiquetas de entidad se pasan como entrada en tiempo de inferencia, de modo que el mismo modelo puede extraer personas, organizaciones, localizaciones, productos o fechas sin reentrenamiento. La conversión a LiteRT no aproxima las matemáticas: los ficheros `wfp16` almacenan únicamente los pesos de las capas totalmente conectadas en float16 con una dequantización a float32, mientras que todas las activaciones y el resto de constantes permanecen en float32.

El detalle técnico más relevante de esta conversión es el reparto de grafos. El grafo de 128 tokens compila entero en el delegado GPU ML Drift (4.149 operadores, una sola partición). Las ventanas de 256 y 512 no lo hacen porque la BiLSTM a nivel de palabra está desenrollada por pasos temporales y las cabezas desenrolladas de 6.286 operadores o más hacen fallar el compilador GPU de LiteRT 2.2.0 (un defecto del runtime reportado con reproductores, no un límite de memoria: la cabeza falla con 570 MB de RSS). Por eso las ventanas largas ejecutan el encoder DeBERTa (1.773 operadores) en GPU y la cabeza pequeña en CPU, manteniendo resultados exactos. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Reconocimiento de entidades nombradas generalista con etiquetas definidas en tiempo de inferencia (zero-shot NER).
- Extracción de spans con offsets de carácter y puntuación de confianza por entidad.
- Procesamiento de texto en inglés con ventanas de 48, 256 o 512 palabras según el grafo elegido.
- Ejecución en dispositivo Android mediante LiteRT, con reparto automático entre GPU y CPU.
- Runtime anfitrión en Python (escritorio, CPU) y Kotlin (Android) con selección automática de ventana.
- Troceado de documentos largos por frases mediante un helper incluido en el runtime.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio: es exclusivamente un modelo de clasificación de tokens.

## Casos de uso

- Extracción de entidades en aplicaciones móviles sin conexión: el grafo s128 (707 MB) se ejecuta íntegramente en la GPU del teléfono con 80 ms por llamada tras la compilación inicial, lo que permite procesar notas, mensajes o formularios localmente sin enviar datos a un servidor.
- Anonimización y redacción de datos personales en el dispositivo: al detectar personas, organizaciones y localizaciones con offsets exactos, la app puede enmascarar esos spans antes de sincronizar el texto con la nube, reduciendo el riesgo de fuga de información.
- Enriquecimiento de contactos y agendas: extraer nombres de persona, empresa y fecha de correos o mensajes para rellenar fichas de CRM directamente en el móvil, aprovechando que las etiquetas se definen en tiempo de ejecución.
- Procesamiento de documentos largos por lotes: con la ventana s256 y el helper de troceado por frases, se pueden recorrer informes o artículos dividiéndolos en segmentos que quepan en memoria y consolidar las entidades resultantes.
- Etiquetado semiautomático para curación de datasets: usar el runtime de escritorio en CPU como preanotador de corpus en inglés, con la ventaja de que los resultados coinciden exactamente con la implementación de referencia fp32.
- Extracción de productos y fechas en catálogos o tickets: definir etiquetas como `product` o `date` y obtener spans con confianza (el ejemplo de la model card detecta `Atlas Pro` con 0,8688 y `3 March 2025` con 1,0) para alimentar sistemas de inventario o contabilidad.
- Filtrado y moderación de contenido estructurado: identificar organizaciones o localizaciones mencionadas en textos generados por usuarios antes de publicarlos, con la ventaja de que todo el cómputo permanece en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí reporta una validación de paridad: sobre 70 entradas en inglés, los spans extraídos coinciden exactamente con la implementación oficial `gliformer` fp32 en CPU (micro-F1 de 1,000 por etiqueta y por offsets de carácter) con todos los ficheros publicados.

| Metrica | Valor |
|---|---|
| Paridad con referencia fp32 (70 entradas, inglés) | micro-F1 1,000 (etiqueta y offsets) |
| Latencia primera llamada (s128, Galaxy S26) | 5,0 s (4,7 s de compilación) |
| Latencia llamadas posteriores (s128) | 80 ms |
| Memoria residente tras carga (s128) | 2,6 GB |
| Pico durante compilación GPU (s128) | 4,5 GB |
| Memoria residente del split s256 en un proceso | 4,6 GB |
| Memoria residente de la cabeza s512 en CPU | 4,7 GB |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el grafo s128 ocupa 707 MB en disco y 2,6 GB residentes tras la carga, con pico de 4,5 GB durante la compilación del delegado GPU. El split s256 en un proceso requiere 4,6 GB residentes; la cabeza s512 sola consume 4,7 GB en CPU.
- GPU recomendadas: la configuración validada es un SoC Snapdragon de gama alta (SM8850 en Galaxy S26) con delegado GPU ML Drift de LiteRT 2.2.0. No se han validado otras familias de GPU Android ni teléfonos con menos memoria.
- ¿Cabe en GPU de consumo? No aplica: el objetivo es Android; para escritorio solo se ha verificado la ejecución en CPU de los grafos fp32 de referencia.
- Opciones de despliegue: LiteRT 2.2.0 (Android, Kotlin) y runtime Python 3.12 en escritorio con `requirements-lock.txt` y `HF_HUB_OFFLINE=1`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato.
- Latencia y throughput: 80 ms por llamada en régimen estacionario con s128 en el Galaxy S26; el primer arranque cuesta 5,0 s por la compilación. No se proporcionan cifras de throughput para las ventanas s256 y s512.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/objetivo | Licencia | Notas |
|---|---|---|---|---|---|
| GLiFormer-Large-NER-LiteRT | 575,6 M | 128/256/512 tokens | TFLite para Android | Apache-2.0 | Paridad exacta con la referencia fp32; validado solo en Galaxy S26 |
| knowledgator/gliformer-large-v1 | 575,6 M | no disponible | PyTorch (Hugging Face) | Apache-2.0 | Modelo original del que deriva esta conversión; sin optimización para dispositivo |
| GLiNER estándar (variantes pequeñas) | no disponible | no disponible | PyTorch/ONNX | no disponible | La información proporcionada no incluye datos comparativos de otras variantes GLiNER |

## Limitaciones y advertencias

- Solo soporta inglés; no hay evidencia de rendimiento multilingüe.
- Es un modelo exclusivamente de NER y clasificación de tokens: no genera texto, no razona y no soporta tool calling ni agentes.
- La validación se limita a LiteRT 2.2.0 en un Samsung Galaxy S26 con GPU FP32 explícita; otras familias de GPU Android y teléfonos con menos memoria no se han validado y pueden fallar o dar resultados distintos.
- El consumo de memoria es el principal coste: 4,5 GB de pico en s128 y 4,6 GB residentes en s256 obligan a planificar para móviles de gama alta; la ventana s512 no es práctica en una app y conviene trocear por frases.
- Existe un defecto conocido del compilador GPU de LiteRT 2.2.0 con cabezas desenrolladas de 6.286 operadores o más, que obliga al reparto encoder-GPU/cabeza-CPU en las ventanas largas.
- Riesgo de alucinación de spans: como cualquier extractor NER, puede producir entidades espurias o límites incorrectos en texto ambiguo; se recomienda umbral de confianza y revisión en flujos críticos.
- No se documentan sesgos específicos del modelo base en la información disponible; al ser un modelo entrenado probablemente con corpus web en inglés, es esperable un sesgo hacia dominios y nombres occidentales.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base y los paquetes `gliformer`/`gliner` que importa el runtime tienen sus propias condiciones que conviene revisar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/GLiFormer-Large-NER-LiteRT
- Modelo base: https://huggingface.co/knowledgator/gliformer-large-v1
