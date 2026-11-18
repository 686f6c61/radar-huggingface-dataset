# BricksDisplay/Qwen3-TTS-12Hz-0.6B-CustomVoice-GGUF

## Resumen

Qwen3-TTS-12Hz-0.6B-CustomVoice-GGUF es la cuantización en formato GGUF del modelo de síntesis de voz Qwen3-TTS-12Hz-0.6B-CustomVoice, desarrollado originalmente por el equipo Qwen y empaquetado por el usuario BricksDisplay. Se trata de un modelo de texto a voz (TTS) de 652.360.972 parámetros que genera audio a partir de texto en diez idiomas y ofrece nueve voces integradas, sin necesidad de clonación. La variante GGUF permite ejecutar el modelo de forma totalmente offline sobre CPU o GPU mediante llama.cpp y codec.cpp.

El modelo resuelve el problema de la síntesis de voz multilingüe de calidad con un coste computacional reducido: con cuantizaciones de entre 296 MB y 2,4 GB para el backbone, y ficheros de códec de entre 1,3 GB y 1,7 GB, el conjunto completo cabe en hardware de consumo. La arquitectura se divide en dos grafos: un backbone de lenguaje (ejecutado por llama.cpp) y un códec de audio con vocoder, voces integradas y adaptador (ejecutado por codec.cpp), que la herramienta `tts-cli` conecta entre sí.

Su relevancia actual radica en que democratiza un TTS multilingüe de diez idiomas con voces predefinidas en un paquete ligero y portable, con licencia Apache 2.0, lo que facilita su integración en aplicaciones locales, sistemas embebidos y pipelines de producción sin dependencia de servicios en la nube. La limitación principal frente a la variante de 1,7B es que el modelo de 0,6B no acepta instrucciones de estilo y no soporta clonación de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone de lenguaje TTS (ejecutado por llama.cpp) + codec de audio con vocoder, voces integradas y adaptador (codec.cpp) |
| Parametros totales | 652.360.972 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Backbone: f32, f16, bf16, q8_0, q6_k, q5_k_m, q5_k_s, q5_1, q5_0, q4_k_m, q4_k_s, q4_1, q4_0, q3_k_l, q3_k_m, q3_k_s, q2_k. Codec: f32, f16, q8_0, q5_k_m, q4_k_m |
| Idiomas soportados | en, zh, ja, ko, fr, de, es, it, pt, ru |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de dos componentes acoplados. El backbone es un modelo de lenguaje de texto a voz de 0,6B parámetros que genera tokens de audio; el códec contiene el decodificador/vocoder, las nueve voces integradas y el adaptador entre ambos grafos. La herramienta `tts-cli` de codec.cpp orquesta los dos grafos, permitiendo ejecución en CPU o GPU (CUDA, Vulkan, Metal) de forma completamente offline. El modelo genera audio a una frecuencia de muestreo de 12 Hz según indica el nombre del modelo base.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. El modelo base es Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice, y esta variante es una cuantización GGUF del mismo, por lo que hereda sus características de entrenamiento. La model card indica que la configuración de muestreo recomendada (temperatura 0,9, top-k 50, top-p 1,0, min-p 0, penalización de repetición 1,05 con ventana de 4096) se transporta como metadatos `general.sampling.*` en los ficheros GGUF, replicando la `generation_config.json` del modelo original.

## Capacidades

- Síntesis de voz (text-to-speech) en diez idiomas: inglés, chino, japonés, coreano, francés, alemán, español, italiano, portugués y ruso.
- Nueve voces integradas seleccionables mediante el parámetro `--voice`: vivian, serena, uncle_fu, dylan, eric (chino, con variantes de Pekín y Sichuan), ryan, aiden (inglés), ono_anna (japonés) y sohee (coreano).
- Generación de audio offline en CPU o GPU (CUDA, Vulkan, Metal) mediante `tts-cli`.
- Aplicación automática de parámetros de muestreo recomendados a través de metadatos GGUF en cualquier host compatible con llama.cpp (tts-cli, tts-server, llama.rn).
- No soporta clonación de voz: para clonación a partir de un clip de referencia se requiere la variante Qwen3-TTS 0.6B Base.
- No acepta instrucciones de estilo (`--instruct`): el modelo de 0,6B las descarta; para instrucciones de estilo se necesita la variante de 1,7B.
- No dispone de tool calling, function calling ni capacidades de agente; es un modelo especializado exclusivamente en TTS.

## Casos de uso

- Audiolibros y narración automatizada: el modelo puede convertir texto largo en audio con voces integradas en diez idiomas, ejecutándose de forma offline y sin coste por petición, lo que lo hace adecuado para volúmenes elevados de narración.
- Asistentes de voz locales: integrado mediante `tts-server` o `tts-cli`, permite dotar de voz a asistentes personales o domóticos que funcionan sin conexión a Internet, con latencia controlada y sin enviar texto a servicios externos.
- Accesibilidad y lectura de pantalla: conversión de contenido textual (noticias, documentos, correos) en audio para personas con discapacidad visual, con voces nativas en el idioma del usuario y ejecución en hardware de consumo.
- Localización de contenido multimedia: generación de pistas de voz en diez idiomas para vídeos, tutoriales o presentaciones, con voces predefinidas que cubren los mercados principales (chino, inglés, japonés, coreano, europeo).
- Sistemas embebidos y dispositivos de borde: con cuantizaciones de 296 MB (q2_k) a 495 MB (q6_k) para el backbone y ficheros de códec desde 1,3 GB, el modelo puede desplegarse en dispositivos con recursos limitados mediante llama.cpp.
- Prototipado e investigación en TTS: al estar en formato GGUF y con licencia Apache 2.0, sirve como base para experimentos de síntesis de voz, comparación de cuantizaciones y evaluación de calidad de audio en distintos idiomas.
- Generación de avisos y mensajes automatizados: anuncios en aeropuertos, transporte público o sistemas de megafonía que requieren voces claras y multilingües, con ejecución local y sin dependencia de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el conjunto recomendado (backbone q8_0 + codec q8_0) ocupa 1,9 GB; la opción más pequeña (q4_k_m + codec q4_k_m) ocupa 1,7 GB; la de mayor calidad (f16 + codec f16) ocupa 2,6 GB. Estas cifras corresponden al tamaño de los ficheros y son una estimación del espacio necesario en memoria.
- GPU recomendadas: no se especifican modelos concretos en la información disponible. El modelo soporta CUDA, Vulkan y Metal, por lo que es compatible con GPUs NVIDIA, AMD e Intel, así como con Apple Silicon.
- Cabe en GPU de consumo: sí, dado que el conjunto completo no supera los 2,6 GB en la configuración de mayor calidad, es apto para GPUs de consumo con al menos 3-4 GB de VRAM disponible.
- Opciones de despliegue: `tts-cli` y `tts-server` de codec.cpp (que incluye llama.cpp), llama.rn y cualquier host compatible con llama.cpp que aplique los metadatos de muestreo.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Voces | Clonación de voz | Instrucciones de estilo | Licencia | Formato |
|---|---|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-0.6B-CustomVoice-GGUF (este) | 652.360.972 | 10 | 9 integradas | No | No | apache-2.0 | GGUF |
| Qwen3-TTS-12Hz-1.7B-CustomVoice-GGUF | No disponible | No disponible | No disponible | No disponible | Sí | No disponible | GGUF |
| Qwen3-TTS-12Hz-0.6B-GGUF (Base) | No disponible | No disponible | No disponible | Sí | No disponible | No disponible | GGUF |

La información proporcionada solo permite comparar con las variantes del mismo modelo base: la versión de 1,7B añade soporte de instrucciones de estilo, y la variante Base de 0,6B permite clonación de voz a partir de un clip de referencia. No se dispone de datos de benchmarks ni de otros modelos TTS comparables en la información disponible.

## Limitaciones y advertencias

- El modelo de 0,6B no acepta instrucciones de estilo (`--instruct`); el autor indica que el modelo original las descarta para esta variante, por lo que no se puede controlar el tono o estilo mediante texto.
- No soporta clonación de voz; para voces personalizadas a partir de un clip de referencia es necesario usar la variante Qwen3-TTS 0.6B Base.
- Sin la penalización de repetición recomendada (1,05) y la ventana de 4096, una voz clonada con transcripción de referencia puede entrar en bucle en las cuantizaciones más pequeñas en lugar de terminar la generación.
- Los ficheros de códec requieren codec.cpp de fecha 2026-10-20 o posterior para las voces integradas.
- Riesgo de alucinación y artefactos de audio: no se dispone de información específica sobre sesgos o tasas de error en la información proporcionada.
- Limitaciones de idioma: aunque soporta diez idiomas, cada voz está diseñada para sonar mejor en su idioma nativo (chino, inglés, japonés o coreano), por lo que el uso de voces fuera de su idioma nativo puede degradar la calidad.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar los términos del modelo base original (Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice) para confirmar compatibilidad.
- El repositorio ocupa 45,7 GB, aunque cada ejecución solo necesita un fichero de backbone y uno de códec; conviene descargar únicamente los ficheros necesarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BricksDisplay/Qwen3-TTS-12Hz-0.6B-CustomVoice-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice
- Repositorio codec.cpp: https://github.com/mybigday/codec.cpp
- Instrucciones de compilación de codec.cpp para TTS: https://github.com/mybigday/codec.cpp#text-to-speech
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Variante de 1,7B con instrucciones de estilo: https://huggingface.co/BricksDisplay/Qwen3-TTS-12Hz-1.7B-CustomVoice-GGUF
- Variante Base de 0,6B con clonación de voz: https://huggingface.co/BricksDisplay/Qwen3-TTS-12Hz-0.6B-GGUF
