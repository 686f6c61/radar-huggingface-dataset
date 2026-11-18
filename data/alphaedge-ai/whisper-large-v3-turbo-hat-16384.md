# alphaedge-ai/whisper-large-v3-turbo-hat-16384

## Resumen

whisper-large-v3-turbo-hat-16384 es una variante "trimmed" (podada) del modelo de reconocimiento automatico del habla (ASR) openai/whisper-large-v3-turbo, publicada por alphaedge-ai. El modelo mantiene la arquitectura encoder-decoder original de Whisper, pero reduce drasticamente el vocabulario del tokenizer para optimizarlo en haitiano (codigo ISO `ht`), eliminando los tokens que no aparecen en ese idioma. El resultado es un modelo un 5,61 % mas pequeno en parametros (763.461.120 frente a 808.878.080 del original) y con un footprint de memoria notablemente inferior, manteniendo el rendimiento esperado en haitiano.

La tecnica de trimming, descrita en el blog de Hugging Face, consiste en analizar un corpus representativo del idioma objetivo (aqui 200.000 textos del dataset lbourdois/fineweb-2-trimming) y conservar unicamente los tokens del vocabulario que aparecen en el. En este caso el vocabulario pasa de 51.865 a 16.384 tokens, una reduccion del 68,41 %. El modelo conserva la licencia Apache 2.0 del original y se distribuye en formato safetensors con libreria transformers.

Es relevante porque demuestra una via sencilla y efectiva para abaratar el despliegue de Whisper en idiomas de bajos recursos o mercados especificos: menos memoria, menos parametros y misma calidad esperada en el idioma objetivo. A cambio, el modelo pierde capacidad multilingue, por lo que solo debe usarse para transcripcion de haitiano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | 763.461.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa audio en ventanas de 30 s; maximo de tokens de salida ~448 por ventana, no especificado en la model card) |
| Tipos de cuantizacion | no disponible (el repo solo incluye safetensors en fp32/fp16; no se listan variantes GGUF/INT8) |
| Idiomas soportados | haitiano (`ht`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Whisper large-v3-turbo: un encoder convolucional + transformer que procesa espectrogramas log-Mel de 80 canales (audio remuestreado a 16 kHz) y un decoder autoregresivo transformer que genera la transcripcion token a token. Whisper large-v3-turbo se caracteriza por tener 4 capas de decoder en lugar de 32, lo que reduce el coste de decodificacion manteniendo la calidad del encoder large-v3.

El entrenamiento original de Whisper (Radford et al., 2022) se basa en supervision debil a gran escala (680.000 horas de audio multilingue y multitarea). Esta variante concreta no ha sido reentrenada: solo se ha aplicado trimming del vocabulario, conservando los pesos del modelo original para los tokens supervivientes. El corpus de minado fueron 200.000 textos del dataset lbourdois/fineweb-2-trimming en haitiano. No se documentan pasos de RLHF, DPO ni fine-tuning adicional. La innovacion tecnica destacable es precisamente el trimming, que reduce vocabulario y, por tanto, tamano de la matriz de embeddings del decoder y de la capa de salida, con impacto directo en memoria y latencia de decodificacion.

## Capacidades

- Transcripcion de audio a texto (ASR) en haitiano, con deteccion explicita del idioma mediante `generate_kwargs={"language": "haitian creole", "task": "transcribe"}`.
- Traduccion de audio haitiano a texto en ingles mediante `task="translate"` (capacidad heredada de Whisper, aunque la model card solo documenta `transcribe`).
- Procesamiento de audio a 16 kHz con ventanas de 30 segundos, gestionando audios de duracion arbitraria mediante chunking del pipeline de transformers.
- Salida de marcas temporales (timestamps) a nivel de segmento, funcionalidad estandar de Whisper en transformers.
- No soporta tool calling ni function calling (es un modelo ASR puro, no un LLM de instrucciones).
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al haitiano: los tokens de otros idiomas fueron eliminados del vocabulario.
- No tiene modo "thinking", vision ni audio generativo; solo consume audio y produce texto.

## Casos de uso

- Transcripcion de contenido audiovisual en haitiano: el modelo convierte podcasts, videos de YouTube o programas de radio en haitiano a texto con un footprint de memoria inferior al de Whisper large-v3-turbo completo, lo que abarata el alojamiento en endpoints.
- Servicios de subtitulado automatico para medios haitianos: con marcas temporales por segmento, se puede generar ficheros SRT/VTT directamente y desplegar el modelo en una GPU consumer.
- Atencion al cliente por voz en telefonia o call centers de Haiti: transcripcion de llamadas en tiempo (casi) real con latencia de decodificacion reducida gracias al decoder de 4 capas de turbo.
- Archivado y indexacion de audio historico: transcripcion masiva de grabaciones en haitiano para construir indices de busqueda textual, aprovechando el menor coste de almacenamiento (1,5 GB por copia del modelo).
- Accesibilidad: generacion de transcripciones para personas con discapacidad auditiva en entornos donde el haitiano es la lengua principal.
- Investigacion linguistica y NLP de bajos recursos: corpus de habla haitiana transcrita para entrenar modelos de traduccion o analisis morfologico, con un modelo ligero que se puede ejecutar en estaciones de trabajo modestas.
- Despliegue en edge o dispositivos con VRAM limitada: al ser un 5,61 % mas pequeno que el original y con vocabulario reducido, es candidato para inferencia en GPUs de 8 GB con cuantizacion adicional (aunque no se distribuyen pesos cuantizados oficiales).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas de tamano (reduccion de vocabulario del 68,41 % y de parametros del 5,61 %), sin WER (word error rate) ni comparaciones con el modelo original en haitiano.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB en fp32 (1,5 GB de pesos mas activaciones y buffers de audio); en fp16 baja a ~1,6-2 GB. Con cuantizacion INT8 podria situarse por debajo de 1 GB, aunque no se distribuyen pesos cuantizados oficiales.
- GPU recomendadas: cualquier GPU con >=4 GB de VRAM. Para produccion con concurrencia, A100, H100, L4 o A10G son adecuadas; para uso individual, RTX 3060/4060/4090 sobran.
- Cabe en GPU consumer: si, practicamente en todas las NVIDIA modernas (GTX 1650 4 GB en adelante), y potencialmente en CPU con llama.cpp/whisper.cpp si se convierten los pesos.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), vLLM (soporte Whisper experimental), TGI, faster-whisper (requiere conversion a CTranslate2), whisper.cpp (requiere conversion a GGML/GGUF), Ollama (no soportado de forma nativa para Whisper).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. El decoder de 4 capas de turbo y el vocabulario reducido sugieren menor latencia de decodificacion que Whisper large-v3, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alphaedge-ai/whisper-large-v3-turbo-hat-16384 | 763.461.120 | audio 30 s por ventana | haitiano | apache-2.0 | Hugging Face, transformers |
| openai/whisper-large-v3-turbo | 808.878.080 | audio 30 s por ventana | ~99 idiomas | apache-2.0 | Hugging Face, transformers |
| openai/whisper-large-v3 | ~1.550 M | audio 30 s por ventana | ~99 idiomas | apache-2.0 | Hugging Face, transformers |
| openai/whisper-small | ~244 M | audio 30 s por ventana | ~99 idiomas | apache-2.0 | Hugging Face, transformers |

El modelo trimmed es un 5,61 % mas pequeno que whisper-large-v3-turbo y aproximadamente la mitad de whisper-large-v3, pero pierde el soporte multilingue. Frente a whisper-small, sigue siendo bastante mas grande (3x) pero conserva la calidad del encoder large-v3 y el decoder turbo. No hay benchmarks publicados que permitan comparar WER entre estas alternativas en haitiano.

## Limitaciones y advertencias

- Solo funciona correctamente en haitiano: los tokens de otros idiomas se han eliminado del vocabulario, por lo que la transcripcion de audio en ingles, frances, espanol u otros idiomas producira salidas degradadas o erroneas.
- Riesgo de alucinacion: Whisper tiende a inventar texto en silencios, musica o audio ruidoso; este comportamiento persiste en la variante trimmed.
- Sesgos conocidos: heredados del entrenamiento original de Whisper (sesgo hacia ingles y hacia hablantes con acento estadounidense/europeo); en haitiano, la representacion en el corpus original de Whisper puede ser limitada, lo que afecta la precision en dialectos o registros coloquiales.
- Limitaciones de contexto: Whisper procesa ventanas de 30 s; audios mas largos requieren chunking y pueden perder coherencia entre segmentos.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base openai/whisper-large-v3-turbo (tambien Apache 2.0) y del dataset lbourdois/fineweb-2-trimming.
- No se distribuyen pesos cuantizados ni GGUF oficiales; la conversion a CTranslate2/whisper.cpp debe hacerse manualmente y puede alterar el vocabulario trimmed.
- El modelo tiene solo 33 descargas y 0 likes en Hugging Face, sin validacion comunitaria ni benchmarks publicados: tratar como experimental para produccion.
- No es un LLM: no admite instrucciones, tool calling ni conversacion; solo ASR.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/whisper-large-v3-turbo-hat-16384
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Blog "Introduction to Trimming" de Hugging Face: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Repositorio de codigo de Whisper (OpenAI): https://github.com/openai/whisper
- faster-whisper (CTranslate2): https://github.com/SYSTRAN/faster-whisper
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
