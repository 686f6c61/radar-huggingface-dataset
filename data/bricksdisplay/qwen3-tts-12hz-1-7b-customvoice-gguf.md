# BricksDisplay/Qwen3-TTS-12Hz-1.7B-CustomVoice-GGUF

## Resumen

Qwen3-TTS-12Hz-1.7B-CustomVoice-GGUF es una cuantización en formato GGUF del modelo de síntesis de voz Qwen3-TTS-12Hz-1.7B-CustomVoice, desarrollado originalmente por el equipo Qwen de Alibaba y convertido a GGUF por el usuario BricksDisplay. El modelo resuelve el problema de generar audio de voz natural en diez idiomas a partir de texto, con nueve voces predefinidas y la posibilidad de modular el estilo de locución mediante instrucciones en lenguaje natural. Su relevancia actual radica en que permite ejecutar un sistema TTS de calidad en hardware de consumo, completamente offline, sin depender de APIs en la nube.

La arquitectura es un LM de backbone para TTS acoplado a un códec de audio (decoder/vocoder). El repositorio empaqueta ambos grafos por separado: el backbone lo ejecuta llama.cpp y el códec lo ejecuta codec.cpp, cuya herramienta `tts-cli` conecta los dos. La cuantización permite reducir el peso total desde 4,9 GB en f16 hasta 2,5 GB en la combinación más pequeña (q4_k_m), lo que abre el despliegue en CPU, CUDA, Vulkan y Metal.

El modelo declara 694.306.060 parámetros reales en safetensors pese a la denominación comercial «1.7B», dato que conviene tener en cuenta al estimar requisitos. La licencia Apache 2.0 facilita el uso comercial, y el soporte de diez idiomas (incluido el español) lo sitúa como una opción práctica para aplicaciones de accesibilidad, doblaje y asistentes conversacionales en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM backbone TTS + codec de audio (decoder/vocoder) ejecutados por separado (llama.cpp + codec.cpp) |
| Parametros totales | 694.306.060 (dato real en safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f32, f16, bf16, q8_0, q6_k, q5_k_m, q5_k_s, q5_1, q5_0, q4_k_m, q4_k_s, q4_1, q4_0, q3_k_l, q3_k_m, q3_k_s, q2_k (backbone y codec por separado) |
| Idiomas soportados | en, zh, ja, ko, fr, de, es, it, pt, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (backbone + codec en ficheros separados) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de dos etapas típico en TTS neuronal moderno: un backbone basado en transformer que procesa el texto y genera representaciones discretas de audio, y un codec que decodifica esas representaciones en la forma de onda final. La conversión a GGUF mantiene esta separación en dos ficheros independientes, de modo que el backbone se ejecuta con llama.cpp y el códec con codec.cpp, y la herramienta `tts-cli` sincroniza ambos grafos. El modelo funciona a una tasa de 12 Hz, indicada en el nombre, que corresponde a la frecuencia de emisión de frames de audio.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card sí documenta que el modelo incorpora nueve voces integradas, cada una optimizada para su idioma nativo, y que admite instrucciones en lenguaje natural para modular el estilo (por ejemplo, «Speak in a very happy tone»). Los parámetros de muestreo recomendados (temperatura 0,9, top-k 50, top-p 1,0 desactivado, penalización de repetición 1,05 con ventana de 4096) se incluyen como metadatos `general.sampling.*` en los ficheros GGUF y se aplican automáticamente en los hosts compatibles.

## Capacidades

- Síntesis de voz (TTS) en diez idiomas: inglés, chino, japonés, coreano, francés, alemán, español, italiano, portugués y ruso.
- Nueve voces integradas: vivian, serena, uncle_fu, dylan, eric, ryan, aiden, ono_anna y sohee, con timbres y dialectos distintos (incluye dialectos chinos de Pekín y Sichuan).
- Control del estilo de locución mediante instrucciones en lenguaje natural (`--instruct`) en cualquiera de los idiomas soportados.
- Ejecución completamente offline en CPU o GPU (CUDA, Vulkan, Metal).
- Muestreo configurable por codebook con parámetros de temperatura, top-k, top-p, min-p y penalización de repetición.
- Integración con llama.cpp, codec.cpp (`tts-cli`, `tts-server`) y llama.rn.
- No incluye clonación de voz; para ello el autor remite a Qwen3-TTS 0.6B Base.

## Casos de uso

- Audiolibros y narración automatizada: el modelo genera voz natural en diez idiomas con voces predefinidas, lo que permite producir capítulos completos sin intervención humana y con control del tono mediante instrucciones.
- Doblaje y localización de contenido: al soportar español, francés, alemán, italiano y portugués, se puede doblar vídeo o material formativo manteniendo una voz consistente por idioma.
- Asistentes de voz para accesibilidad: la ejecución offline en CPU o GPU de consumo permite integrar lectura de pantalla y respuestas habladas en aplicaciones de escritorio sin conexión a internet.
- Sistemas de atención al cliente con respuesta hablada: el modelo puede sintetizar respuestas generadas por un LLM en el idioma del usuario, con voces diferenciadas por marca o por agente.
- Generación de contenido para podcasts y anuncios: las instrucciones de estilo permiten producir variantes de una misma locución (tono alegre, enfadado, neutro) sin regrabar.
- Prototipado de interfaces conversacionales: `tts-server` y la integración con llama.rn facilitan montar demos de voz en aplicaciones móviles o web con hardware modesto.
- Pruebas de calidad y evaluación de TTS: la disponibilidad de múltiples cuantizaciones (de q2_k a f32) permite medir el impacto de la compresión en la calidad del audio en pipelines de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia según la combinación de ficheros: 2,5 GB (q4_k_m backbone + codec), 3,2 GB (q8_0, recomendada) y 4,9 GB (f16, mejor calidad).
- El backbone más pequeño (q2_k) ocupa 778 MB y el codec más pequeño (q4_k_m) 1,4 GB, lo que permite configuraciones por debajo de 2,5 GB combinando cuantizaciones agresivas.
- GPU recomendadas: no se especifican modelos concretos; el autor indica soporte para CUDA, Vulkan y Metal, por lo que cabe en GPUs de consumo con al menos 4-6 GB de VRAM para las configuraciones recomendadas.
- Cabe en GPU de consumo: sí, con las cuantizaciones q4_k_m y q8_0; las variantes f16 y f32 requieren más memoria.
- Opciones de despliegue: codec.cpp (`tts-cli`, `tts-server`), llama.cpp como host del backbone, llama.rn.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Voces | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B-CustomVoice-GGUF (este) | 694.306.060 | 10 | 9 integradas, sin clonación | Apache 2.0 | GGUF |
| Qwen3-TTS-12Hz-0.6B-GGUF | no disponible | no disponible | clonación de voz desde referencia | Apache 2.0 (según enlace) | GGUF |
| Qwen3-TTS-12Hz-1.7B-CustomVoice (original) | 694.306.060 | 10 | 9 integradas | Apache 2.0 | safetensors |

La comparativa se limita a las variantes de la propia familia Qwen3-TTS mencionadas en la información disponible; no se dispone de datos de benchmarks ni de otros modelos TTS comparables para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo no incluye clonación de voz; para imitar una voz a partir de un clip de referencia hay que usar la variante 0.6B Base.
- Cada voz está optimizada para su idioma nativo, por lo que su calidad puede degradarse al usarla en otros idiomas soportados.
- En cuantizaciones pequeñas, una voz clonada con transcripción de referencia puede entrar en bucle en lugar de terminar; la penalización de repetición (1,05) debe mantenerse.
- Los ficheros de códec requieren codec.cpp de fecha 2026-10-20 o posterior para las voces integradas.
- No se han publicado datos sobre sesgos, tasa de alucinación o robustez ante entradas adversariales.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base original antes de desplegar en producción.
- El dato de parámetros reales (694 millones) difiere de la denominación comercial «1.7B», lo que puede afectar a las estimaciones de memoria y latencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/BricksDisplay/Qwen3-TTS-12Hz-1.7B-CustomVoice-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Variante con clonación de voz (0.6B Base GGUF): https://huggingface.co/BricksDisplay/Qwen3-TTS-12Hz-0.6B-GGUF
- codec.cpp (repositorio): https://github.com/mybigday/codec.cpp
- Documentación TTS de codec.cpp: https://github.com/mybigday/codec.cpp#text-to-speech
- llama.cpp (repositorio): https://github.com/ggml-org/llama.cpp
