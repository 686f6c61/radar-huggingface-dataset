# BricksDisplay/OuteTTS-0.3-500M-GGUF

## Resumen

OuteTTS-0.3-500M-GGUF es la conversión a formato GGUF del modelo de síntesis de voz OuteTTS-0.3-500M desarrollado por OuteAI, publicada por el usuario BricksDisplay. Se trata de un modelo de texto a voz (TTS) basado en un backbone de lenguaje que genera tokens de audio, los cuales son posteriormente decodificados a forma de onda por un códec independiente. La particularidad de esta publicación es que empaqueta el modelo en dos ficheros GGUF complementarios (backbone y códec) que se ejecutan de forma conjunta mediante llama.cpp y codec.cpp, permitiendo inferencia totalmente offline en CPU o GPU.

El modelo resuelve el problema de la síntesis de voz local sin dependencias de servicios en la nube, con un tamaño reducido (515 MB en la configuración más pequeña, 672 MB en la recomendada) que lo hace viable en hardware de consumo e incluso en dispositivos móviles mediante llama.rn. Soporta seis idiomas (inglés, japonés, coreano, chino, francés y alemán) con voces de referencia integradas.

Es relevante ahora porque consolida un ecosistema de TTS open source ejecutable con las mismas herramientas que ya se usan para modelos de lenguaje (llama.cpp), lo que simplifica el despliegue en producción y en entornos con recursos limitados. La licencia cc-by-sa-4.0 permite uso comercial con atribución y compartir-al-igual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone de lenguaje autorregresivo (OuteTTS) + códec de audio (decoder/vocoder, encoders de hablante y adaptador) |
| Parametros totales | 84.756.089 (según safetensors del modelo base; el nombre comercial indica 500M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_0, Q5_1, Q5_K_S, Q5_K_M, Q6_K, Q8_0, FP16 (backbone); f32, f16, q8_0, q5_k_m, q4_k_m (códec) |
| Idiomas soportados | Inglés (en), japonés (ja), coreano (ko), chino (zh), francés (fr), alemán (de) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | GGUF (dos ficheros: backbone + códec) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de dos etapas. La primera es un backbone de lenguaje autorregresivo (derivado de OuteTTS-0.3-500M de OuteAI) que, dado un texto de entrada, genera una secuencia de tokens o embeddings de audio condicionados por una gramática construida a partir del propio texto de entrada para mantener la generación bien formada. La segunda etapa es un códec de audio que contiene el decoder/vocoder, los encoders de hablante y el adaptador entre ambos dominios, y que transforma esa representación intermedia en forma de onda PCM. Esta separación en dos grafos computacionales es análoga a la de los proyectores multimodales de llama.cpp.

Los ficheros del backbone son los GGUF originales de OuteAI sin modificar; el códec incluye las voces de referencia del paquete upstream de OuteTTS y debe usarse únicamente con este modelo. No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La configuración de muestreo recomendada (temperatura 0.1, top-k 50, top-p 1.0, min-p 0, penalización de repetición 1.1 con ventana de 4096 tokens) se transporta como metadatos `general.sampling.*` en los ficheros GGUF.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto plano en seis idiomas: inglés, japonés, coreano, chino, francés y alemán.
- Voces de referencia integradas del paquete upstream de OuteTTS (por ejemplo, `en_male_1` como voz por defecto); listables mediante `tts-cli voices`.
- Generación de audio en streaming: la API Python expone `tts.stream(text)` para emitir audio a medida que se genera.
- Ejecución totalmente offline en CPU o GPU (CUDA, Vulkan, Metal).
- Integración en aplicaciones móviles iOS y Android mediante llama.rn.
- Control de la generación mediante gramática derivada del texto de entrada, lo que restringe la salida a formatos válidos.
- No soporta clonación de voz en esta publicación (el autor indica explícitamente "No voice cloning").
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo especializado en TTS, no un LLM de propósito general.
- No soporta visión ni audio de entrada.

## Casos de uso

- **Lectura de artículos y documentos en local**: el modelo convierte texto plano en audio WAV con la configuración Q8_0 (672 MB totales) en una máquina sin GPU, lo que permite integrar un lector de pantalla o un generador de pódcast en un pipeline de escritorio sin enviar contenido a servicios externos.
- **Asistentes de voz embebidos en aplicaciones móviles**: mediante llama.rn, los dos ficheros GGUF se cargan en iOS y Android y se puede sintetizar respuesta de voz en el propio dispositivo, preservando la privacidad del usuario y funcionando sin conectividad.
- **Generación de audiolibros y contenido accesible**: las voces de referencia en inglés, francés, alemán y otros idiomas permiten producir narraciones para contenido editorial o material didáctico, con la opción de elegir la voz concreta por idioma.
- **Sistemas de anuncios y notificaciones por voz**: la latencia reducida del modelo (500M parámetros, cuantización Q4_K_M de 515 MB) y el soporte de streaming permiten generar avisos cortos en tiempo casi real dentro de aplicaciones de escritorio o servidores modestos.
- **Prototipado de interfaces conversacionales**: al ejecutarse sobre llama.cpp y codec.cpp con API de línea de comandos y Python, se puede integrar en un pipeline de CI/CD o en un entorno de desarrollo para iterar sobre guiones de voz sin depender de APIs de terceros.
- **Localización de contenido multilingüe**: con soporte para seis idiomas y voces de referencia nativas por idioma, se puede generar la misma locución en varios idiomas para vídeos, tutoriales o material de marketing, teniendo en cuenta que el texto de entrada debe ir en forma romanizada para chino, japonés y coreano.
- **Investigación en TTS y evaluación de códecs**: la separación explícita entre backbone y códec facilita experimentar con distintas cuantizaciones (desde Q2_K de 344 MB hasta FP16 de 1.2 GB) y medir el impacto en calidad y velocidad en hardware diverso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM/RAM estimada para inferencia**: entre 515 MB (Q4_K_M + códec q4_k_m) y 1,2 GB (FP16 + códec f16) para el conjunto completo de dos ficheros; la configuración recomendada Q8_0 + códec q8_0 ocupa 672 MB.
- **GPU recomendadas**: no se especifican modelos concretos en la información disponible; el modelo soporta aceleración por CUDA, Vulkan y Metal, por lo que es compatible con GPUs NVIDIA, AMD e Intel, así como con Apple Silicon.
- **Compatibilidad con GPU de consumo**: sí, por el reducido tamaño del conjunto (menos de 1,3 GB en cualquier configuración), cabe holgadamente en cualquier GPU de consumo con al menos 2 GB de memoria, e incluso puede ejecutarse íntegramente en CPU.
- **Opciones de despliegue**: codec.cpp (`tts-cli`, `tts-server`), llama.cpp como runtime del backbone, paquete Python `codec_cpp` y llama.rn para iOS y Android.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| OuteTTS-0.3-500M-GGUF (este) | 84,7M (safetensors) / ~500M nominales | No disponible | en, ja, ko, zh, fr, de | cc-by-sa-4.0 | GGUF (backbone + códec) | HuggingFace, ejecutable en CPU/GPU/móvil |
| OuteTTS-0.3-500M (original) | ~500M | No disponible | en, ja, ko, zh, fr, de | cc-by-sa-4.0 | safetensors (formato original OuteTTS) | HuggingFace, requiere runtime OuteTTS |
| Alternativas TTS open source de tamaño similar | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación con alternativas de la misma categoría no está disponible en la información proporcionada; únicamente se puede contrastar con el modelo base del que deriva esta conversión, que comparte arquitectura, idiomas y licencia, y del que se diferencia por el formato GGUF y por la separación en dos ficheros (backbone y códec) que permite su ejecución con llama.cpp y codec.cpp.

## Limitaciones y advertencias

- **Texto de entrada restringido**: solo se aceptan letras y espacios; los números deben escribirse con palabras y el chino, japonés y coreano deben introducirse en forma romanizada (pinyin, romaji, romanización revisada). Esto limita el uso directo sobre texto sin preprocesar.
- **Sin clonación de voz**: el autor indica explícitamente que esta publicación no soporta clonación de voz, a diferencia de otras variantes o herramientas del ecosistema OuteTTS.
- **Códec acoplado al modelo**: el fichero de códec incluye las voces de este modelo concreto y debe usarse únicamente con él; no es intercambiable con otros modelos.
- **Riesgo de alucinación y artefactos de audio**: como todo modelo generativo de audio, puede producir pronunciaciones incorrectas, prosodia anómala o artefactos, especialmente en cuantizaciones agresivas (Q2_K, Q3_K_S) o con texto fuera de dominio.
- **Cobertura lingüística limitada**: solo seis idiomas; no se ha verificado el rendimiento en otros, y la información no detalla la calidad relativa por idioma.
- **Licencia cc-by-sa-4.0**: permite uso comercial, pero exige atribución y que las obras derivadas se distribuyan bajo la misma licencia (share-alike), lo que puede condicionar su integración en productos propietarios.
- **Dependencia de dos runtimes**: requiere llama.cpp para el backbone y codec.cpp para el códec, además de compilador C++ y CMake si se usa la API Python; esto añade complejidad de despliegue frente a soluciones de un solo binario.
- **Metadatos incompletos**: no se dispone de información sobre longitud de contexto, datos de entrenamiento ni benchmarks publicados, lo que dificulta una evaluación cuantitativa previa a producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/BricksDisplay/OuteTTS-0.3-500M-GGUF
- Modelo base en HuggingFace: https://huggingface.co/OuteAI/OuteTTS-0.3-500M
- llama.cpp (runtime del backbone): https://github.com/ggml-org/llama.cpp
- codec.cpp (runtime del códec y `tts-cli`): https://github.com/mybigday/codec.cpp
- Documentación Python de codec.cpp: https://github.com/mybigday/codec.cpp/tree/main/python
- llama.rn (TTS en iOS y Android): https://github.com/mybigday/llama.rn
- Documentación TTS de llama.rn: https://github.com/mybigday/llama.rn#text-to-speech-tts
