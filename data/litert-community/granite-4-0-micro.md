# litert-community/granite-4.0-micro

## Resumen

Granite-4.0-Micro es un modelo de lenguaje de 3.400 millones de parametros desarrollado por IBM, disenado como modelo instructivo de contexto largo para asistentes y agentes que usan herramientas. La version aqui documentada es la conversion realizada por la comunidad litert-community al formato LiteRT-LM (`.litertlm`), pensada para ejecucion en dispositivo (on-device) sobre el runtime LiteRT-LM de Google en Android, macOS y otras plataformas edge.

El modelo original es un transformer decoder-only denso con atención GQA (40 cabezas de atención, 8 KV), RoPE, SwiGLU y RMSNorm, con 40 capas, tamano oculto 2560 y un vocabulario de 100.352 tokens con embeddings atados. IBM lo publica con una ventana de contexto de 128K tokens, aunque los ficheros LiteRT-LM de esta conversion limitan el contexto a 4096 tokens. La relevancia actual radica en que permite desplegar un modelo de 3B con capacidades de tool calling en telefonos moviles y portatiles sin conexion, con cuantizaciones int8 e int4 que reducen el peso a 3,77 GB y 2,20 GB respectivamente.

La conversion incluye grafos GPU-composite para aceleracion por GPU (OpenCL en Android, Metal en Mac) y ha sido validada en un Mac M4 Max, un Google Pixel 8a y un Galaxy S26, con resultados de precision (GSM8K) y latencia publicados por el autor de la conversion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (GQA, RoPE, SwiGLU, RMSNorm) |
| Parametros totales | 3.402.836.480 |
| Parametros activos | no aplica (modelo denso, sin expertos) |
| Longitud de contexto | 128K en el modelo base de IBM; 4096 en los ficheros LiteRT-LM de esta conversion |
| Tipos de cuantizacion | int8 (lineales dynamic, activaciones float) e int4 (blockwise-32 + OCTAV en lineales, embedding int8) |
| Idiomas soportados | 12 idiomas segun IBM (de ingles a chino); lista concreta no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); dos ficheros: int8 (3,77 GB) e int4 (2,20 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only denso de 40 capas con hidden size 2560, 40 cabezas de atencion y 8 cabezas KV (GQA), funcion de activacion SwiGLU, normalizacion RMSNorm y embeddings atados con un vocabulario de 100.352 tokens. IBM lo describe como un modelo instructivo finetuneado desde Granite-4.0-Micro-Base, con mejoras en seguimiento de instrucciones y tool calling orientadas a asistentes y agentes. El checkpoint original se publico bajo la clase hybrid-MoE con 40 capas de atencion y ningun experto; para la exportacion se reescribio a la clase Granite plana sin modificar los pesos.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La conversion a LiteRT-LM aplica cuantizacion post-entrenamiento: int8 dinamica en las capas lineales con activaciones float, e int4 blockwise de tamano 32 con OCTAV en lineales y embedding en int8. En ambos ficheros la tabla de embeddings se separa en su propia seccion (265.343.328 bytes) y se incluye un grafo GPU-composite. Los pesos corresponden a los ficheros del 2026-10-13; el grafo GPU-composite se anadio el 2026-10-16.

## Capacidades

- Generacion de texto y razonamiento en modo instructivo, con seguimiento de instrucciones mejorado respecto al modelo base.
- Tool calling / function calling, capacidad destacada por IBM para agentes que usan herramientas.
- Razonamiento matematico basico (GSM8K evaluado en la conversion).
- Extraccion de informacion estructurada (fechas, entidades) a partir de texto, segun los ejemplos de uso de la model card.
- Conversaciones multi-turno (validadas en tres turnos en CPU y GPU).
- Soporte multilingue: 12 idiomas segun IBM (lista concreta no disponible).
- Ejecucion on-device con aceleracion GPU (OpenCL en Android, Metal en Mac) y CPU (XNNPACK).
- Contexto limitado a 4096 tokens en esta conversion, frente a los 128K del modelo original.

## Casos de uso

- Asistentes on-device sin conexion: el modelo puede ejecutarse en un telefono Android (Pixel 8a, Galaxy S26) con el fichero int4 de 2,20 GB, gestionando conversaciones multi-turno de hasta 4096 tokens sin enviar datos a la nube.
- Extraccion de informacion estructurada en local: por ejemplo, extraer fechas, nombres o importes de correos y documentos en el propio dispositivo, como muestra el ejemplo de la model card con la frase "The meeting moved from May 3 to May 17".
- Agentes con tool calling en aplicaciones moviles: IBM destaca el soporte de function calling, lo que permite integrar el modelo en asistentes que invocan APIs locales (calendario, contactos, ajustes del sistema) sin salir del dispositivo.
- Procesamiento de texto en portatiles Mac: con el fichero int8 en GPU sobre un M4 Max, un prefill de 1024 tokens mas 256 tokens decodificados tarda 3,61 segundos, adecuado para resumenes y reescritura interactiva.
- Clasificacion y enrutamiento de texto en edge: tareas de etiquetado o categorizacion de mensajes en dispositivos con recursos limitados, aprovechando la latencia baja del int4 en GPU (16,70 s en Galaxy S26 para el mismo workload).
- Prototipado de agentes en entornos con requisitos de privacidad: al ejecutarse localmente y bajo licencia Apache 2.0, permite desplegar asistentes en entornos sanitarios o financieros donde no se pueden enviar datos a servicios externos.
- Educacion y demos offline: aplicaciones de tutoria o generacion de ejercicios matematicos en dispositivos sin conectividad, dado el rendimiento en GSM8K (84-90 sobre 100).

## Benchmarks y rendimiento

Precision en GSM8K (100 preguntas, greedy, maximo 1024 tokens de salida, plantilla del bundle):

| Configuracion | GSM8K (n=100) |
|---|---|
| bf16 referencia (transformers, MPS) | 86 |
| int8, litert-lm CPU | 84 |
| int8, litert-lm GPU (Mac) | 90 |
| int4, litert-lm GPU (Mac) | 84 |

Tiempo para un prefill de 1024 tokens mas 256 tokens decodificados a contexto 2048 (segundos):

| Configuracion | Mac M4 Max | Galaxy S26 | Pixel 8a |
|---|---|---|---|
| int4 GPU | 3,04 | 16,70 | 47,92 |
| int8 GPU | 3,61 | 21,83 | no medido |
| int8 CPU | 17,30 | 42,25 | 157,45 |
| int4 CPU | 20,84 | 46,03 | 167,05 |

El autor indica que las puntuaciones solo son comparables dentro de esta tabla y no con el 85,45 publicado por IBM (protocolo 8-shot distinto). IFEval-lite no se ejecuto para este modelo. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 3,77 GB para el fichero int8 y 2,20 GB para el int4 (tamano en disco de los ficheros `.litertlm`); el autor no publica cifras de memoria en ejecucion.
- GPU recomendadas: aceleracion validada en Mac M4 Max (Metal), Google Pixel 8a (OpenCL) y Galaxy S26 (OpenCL). No se han publicado pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU consumer y en telefonos moviles: si, con el fichero int4 en Pixel 8a y Galaxy S26; el fichero int8 tambien se ejecuta en Galaxy S26.
- Opciones de despliegue: runtime LiteRT-LM (version probada 0.18.0), con API Python y binario Android; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: ver tabla de rendimiento; el int4 es mas rapido en GPU en las tres plataformas y el int8 mas rapido en CPU en las tres. El grafo GPU-composite reduce el tiempo un 17 % (int4) y un 16 % (int8) en Mac GPU, y un 13 % (int4) en Galaxy S26 GPU respecto a los ficheros del 2026-10-13.
- iOS: no medido; el fichero int8 supera los 2 GiB en su seccion principal de pesos, lo que impide su uso en iOS segun la explicacion enlazada en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| granite-4.0-micro (LiteRT-LM, esta ficha) | 3,40B | 4096 (128K en el base) | `.litertlm` int8/int4 | Apache 2.0 | Optimizado para on-device; GSM8K 84-90 |
| granite-4.1-3b (LiteRT-LM) | no disponible | no disponible | `.litertlm` | no disponible | Conversion mencionada como referencia para la separacion de la tabla de embeddings |
| ibm-granite/granite-4.0-micro (original) | 3,40B | 128K | safetensors (bf16) | Apache 2.0 | Modelo base sin cuantizar; requiere runtime de transformers |

La informacion proporcionada no incluye datos de rendimiento de los modelos comparables, por lo que no es posible establecer una comparativa cuantitativa mas alla de parametros, contexto y licencia.

## Limitaciones y advertencias

- Contexto reducido a 4096 tokens en esta conversion, muy por debajo de los 128K del modelo original de IBM; no apto para tareas que requieran ventanas largas.
- No medido en iOS: el fichero int8 supera los 2 GiB en su seccion principal de pesos, lo que limita su despliegue en esa plataforma.
- IFEval-lite no se ejecuto; no hay datos publicados sobre calidad de seguimiento de instrucciones en esta conversion.
- Los benchmarks GSM8K solo son comparables dentro de la tabla del autor; no son equiparables al 85,45 de IBM por diferencias de protocolo.
- Riesgo de alucinacion inherente a un modelo de 3B: no se han publicado evaluaciones de factualidad ni de sesgos en la informacion disponible.
- La lista concreta de los 12 idiomas soportados no esta disponible; el rendimiento multilingue no ha sido evaluado en esta conversion.
- Licencia Apache 2.0, que permite uso comercial, pero el autor no documenta restricciones adicionales ni condiciones de atribucion mas alla de las de la licencia.
- El modelo base se publico originalmente bajo la clase hybrid-MoE sin expertos y fue reescrito a la clase Granite para la exportacion; los pesos no cambiaron, pero conviene verificar la compatibilidad con herramientas que inspeccionen la clase del checkpoint.
- La cuantizacion int4 (blockwise-32 + OCTAV) puede degradar tareas sensibles a precision numerica; el autor solo valida GSM8K y un conjunto de 8 preguntas.

## Enlaces

- [Hugging Face: litert-community/granite-4.0-micro](https://huggingface.co/litert-community/granite-4.0-micro)
- [Modelo base: ibm-granite/granite-4.0-micro](https://huggingface.co/ibm-granite/granite-4.0-micro)
- [Runtime LiteRT-LM (Google AI Edge)](https://github.com/google-ai-edge/LiteRT-LM)
- [Conversion granite-4.1-3b (referencia)](https://huggingface.co/litert-community/granite-4.1-3b)
- [Script de verificacion de calidad](https://github.com/john-rocky/hf-to-litertlm/blob/main/scripts/verify_quality.py)
