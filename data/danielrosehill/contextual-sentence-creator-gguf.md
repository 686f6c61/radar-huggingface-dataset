# danielrosehill/Contextual-Sentence-Creator-GGUF

## Resumen

Contextual-Sentence-Creator-GGUF es la distribucion en formato GGUF del modelo danielrosehill/Contextual-Sentence-Creator, un ajuste fino de Granite 4.2 3B orientado a una tarea muy concreta: generar frases de ejemplo naturales en ingles que contengan un termino dado, respetando el significado descrito en un contexto. El modelo resuelve el problema tipico de enriquecer vocabularios para sistemas ASR o de aprendizaje de idiomas, donde hace falta disponer de oraciones realistas y variadas para cada entrada lexica sin recurrir a plantillas rigidas.

El modelo base Granite 4.2 3B aporta una arquitectura transformer densa de aproximadamente 3.660 millones de parametros (3.659.737.600 segun los pesos en safetensors), empaquetada aqui en dos cuantizaciones GGUF (Q4_K_M y Q8_0) pensadas para inferencia en CPU mediante llama.cpp. El autor no publica detalles sobre el dataset de ajuste fino, el numero de tokens de entrenamiento ni la composicion de los datos, mas alla de la plantilla de chat especifica con la que fue entrenado.

La relevancia actual del modelo es acotada pero clara: es un ejemplo de modelo pequeño, especializado y desplegable localmente que sustituye a un LLM generico en una subtarea de generacion estructurada (salida JSON con un numero exacto de frases). Su licencia Apache 2.0 y su tamano permiten integrarlo en pipelines de procesamiento de vocabulario sin dependencias de API externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Granite 4.2 3B) |
| Parametros totales | 3.659.737.600 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el ejemplo de uso emplea -c 4096) |
| Tipos de cuantizacion | Q4_K_M (2,2 GB) y Q8_0 (3,9 GB) |
| Idiomas soportados | No disponible (el prompt de ejemplo y la tarea estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (generado desde safetensors via convert_hf_to_gguf.py) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Granite 4.2 3B, un transformer denso de aproximadamente 3.660 millones de parametros. La model card no detalla la composicion del dataset de entrenamiento, el numero de tokens utilizados, ni si se aplicaron tecnicas de RLHF o DPO; esa informacion remite a la pagina del modelo base (danielrosehill/Contextual-Sentence-Creator), que no se incluye en los datos disponibles.

La innovacion tecnica destacable no esta en la arquitectura sino en el formato de interaccion: el autor sustituye la plantilla de chat estandar de Granite por una plantilla ChatML exacta que termina en `<|im_start|>assistant\n<think></think>`, forzando el modo de razonamiento desactivado. Segun la model card, la plantilla original de Granite deja `<think>` abierto y el modelo responde en texto libre en lugar de devolver un array JSON; con la plantilla correcta, la salida es un array de cadenas. Los pesos GGUF se generaron con convert_hf_to_gguf.py en F16 y se cuantizaron con llama-quantize, y la plantilla se incrusto con gguf_new_metadata.py --chat-template.

## Capacidades

- Generacion de frases de ejemplo en ingles que contienen un termino concreto, respetando el significado descrito en el contexto.
- Salida estructurada en JSON: devuelve un array de cadenas con exactamente el numero de frases solicitado (parametro n).
- Control de longitud: el prompt de sistema del autor especifica frases de 6 a 18 palabras.
- Generacion de multiples frases distintas entre si para un mismo termino (parametro de temperatura 0.8 y top_p 0.95 en el ejemplo).
- Integracion via API compatible con OpenAI (endpoints_compatible, llama-server con /v1/chat/completions).
- Modo thinking desactivado de forma explicita mediante la plantilla de chat incrustada.
- No se documentan capacidades de tool calling, agentes, vision, audio ni razonamiento multi-paso.

## Casos de uso

- Enriquecimiento de vocabularios para ASR: dado un termino y su definicion, generar diez frases naturales que se incorporan como corpus de entrenamiento o evaluacion para un reconocedor de voz que debe modelar ese termino en contexto.
- Creacion de material para aprendizaje de idiomas: producir oraciones de ejemplo para cada entrada de un diccionario o lista de vocabulario, con longitud controlada (6-18 palabras) y variedad suficiente para evitar repeticiones.
- Generacion de datasets sinteticos de texto: alimentar un pipeline que necesite pares termino-oracion para tareas de desambiguacion semantica o word sense disambiguation.
- Pruebas de calidad de un sistema TTS: generar frases de prueba que contengan terminos dificiles (prestamos, nombres propios, terminos tecnicos) para evaluar la pronunciacion del sintetizador.
- Despliegue local en CPU: con Q4_K_M y llama-server en un portatil de 8 hilos se midieron aproximadamente 12,5 tokens/s y 12-16 s para diez frases, lo que permite ejecutarlo en entornos sin GPU.
- Automatizacion de glosarios internos: integrar el modelo en un script que recorra un CSV de terminos y contextos y genere las frases en lote, aprovechando la salida JSON para el parseo directo.
- Prototipado de asistentes de escritura especializados: usar el modelo como componente de generacion de ejemplos dentro de una aplicacion mayor de vocabulario o documentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es operativa: en una prueba del 2026-11-03 en CPU de portatil (8 hilos, Q4_K_M, llama.cpp), aproximadamente 12,5 tokens/s, 12-16 s para generar diez frases, y 4 de 4 llamadas de prueba devolvieron JSON valido con exactamente diez frases.

## Requisitos de hardware

- VRAM/RAM estimada: Q4_K_M ocupa 2,2 GB en disco y Q8_0 3,9 GB; la inferencia en CPU requiere RAM suficiente para el modelo mas el contexto (el ejemplo usa -c 4096).
- GPU recomendadas: no se especifican; el modelo esta pensado para CPU. Cualquier GPU consumer con al menos 4-6 GB de VRAM puede alojar la version Q4_K_M con holgura.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna con 6 GB o mas de VRAM para Q4_K_M, y con 8 GB o mas para Q8_0.
- Opciones de despliegue: llama.cpp (llama-server con endpoint /v1/chat/completions compatible con OpenAI), y por extension cualquier runtime que cargue GGUF (Ollama, llama-cpp-python). No se documenta soporte para vLLM ni TGI.
- Latencia y throughput: aproximadamente 12,5 tokens/s en CPU de portatil con 8 hilos y Q4_K_M; 12-16 s para diez frases. No hay datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Contextual-Sentence-Creator-GGUF | 3,66 B | No disponible | GGUF | Apache 2.0 | Ajuste fino especializado en generacion de frases con termino y contexto |
| Granite 4.2 3B (base) | ~3,66 B | No disponible en la informacion | safetensors, GGUF | No disponible en la informacion | Modelo generalista del que deriva; requiere prompt engineering para salida JSON |
| Alternativas genericas de 3B (p. ej. Llama 3.2 3B, Qwen2.5 3B) | ~3 B | 128K en algunos casos | safetensors, GGUF | Licencias variables | No disponibles en la informacion proporcionada para comparacion directa de rendimiento |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas; la comparativa se limita a parametros y formato.

## Limitaciones y advertencias

- El modelo esta especializado en una unica tarea (generacion de frases con un termino y un contexto); no es adecuado como modelo generalista de chat, codigo o razonamiento.
- La calidad de la salida depende de la plantilla de chat exacta; si el runtime sobrescribe la plantilla incrustada, el modelo puede devolver texto libre en lugar de JSON. Hay que pasar chat_template.jinja explicitamente.
- El prompt de sistema del autor esta en ingles y exige frases en ingles; no hay evidencia de soporte multilingue.
- Riesgo de alucinacion en el sentido descrito: el modelo puede generar frases que no reflejen fielmente el significado del contexto o que usen el termino de forma gramaticalmente incorrecta, especialmente con terminos poco frecuentes o prestamos.
- No se documentan sesgos conocidos, pero al derivar de un modelo generalista puede heredar sesgos del corpus original.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Granite 4.2 3B, cuyos terminos no se detallan en la informacion disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- El contexto maximo no esta documentado; el ejemplo usa 4096 tokens, por lo que no se debe asumir una ventana mayor sin verificar.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/danielrosehill/Contextual-Sentence-Creator-GGUF
- Modelo base: https://huggingface.co/danielrosehill/Contextual-Sentence-Creator
- llama.cpp (runtime de inferencia): https://github.com/ggml-org/llama.cpp
