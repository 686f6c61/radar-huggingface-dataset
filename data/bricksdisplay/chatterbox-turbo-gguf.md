# BricksDisplay/Chatterbox-Turbo-GGUF

## Resumen

Chatterbox Turbo GGUF es una conversión al formato GGUF del modelo de síntesis de voz Chatterbox Turbo, desarrollado originalmente por ResembleAI y empaquetado por BricksDisplay. Se trata de un sistema de text-to-speech (TTS) en inglés que combina un backbone de lenguaje (332,8 millones de parámetros) con un códec de audio que actúa como decodificador/vocoder. Su principal atractivo es que permite ejecutar TTS con clonación de voz y etiquetas paralingüísticas (como `[laugh]`) de forma totalmente offline, sobre CPU o GPU, mediante llama.cpp y codec.cpp.

La relevancia de esta ficha radica en su empaquetado: separa el modelo en dos ficheros GGUF (backbone y códec) que se ejecutan con runtimes ligeros, lo que facilita el despliegue en entornos sin infraestructura de GPU dedicada y en dispositivos móviles vía llama.rn. El tamaño del repositorio es de 7,1 GB, aunque cada combinación de inferencia ocupa entre 499 MB y 1,4 GB según la cuantización.

El modelo está orientado exclusivamente al inglés y se distribuye bajo licencia MIT, lo que elimina restricciones para uso comercial. No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone de lenguaje (TTS LM) + códec de audio (decoder/vocoder, speaker encoders y adaptador) |
| Parametros totales | 332.798.650 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f32, f16, q8_0, q5_k_m, q4_k_m |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

La arquitectura se divide en dos grafos computacionales independientes que se ejecutan de forma conjunta. El primero es el backbone de lenguaje, un modelo de 332,8 millones de parámetros que genera la representación textual y los tokens de audio; el segundo es el códec, que contiene el decodificador/vocoder, los codificadores de hablante (speaker encoders) y el adaptador entre ambos. Esta separación es análoga a los proyectores multimodales de llama.cpp: el backbone se ejecuta con llama.cpp y el códec con codec.cpp.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card del autor de la conversión no detalla el proceso de entrenamiento del modelo original. La innovación técnica destacable es el empaquetado en dos ficheros GGUF que permite ejecución offline en CPU y GPU (CUDA, Vulkan, Metal) y en plataformas móviles mediante llama.rn, con parámetros de muestreo embebidos en los metadatos `general.sampling.*` del propio fichero.

## Capacidades

- Generación de voz a partir de texto (text-to-speech) en inglés.
- Clonación de voz a partir de una referencia de audio corta y limpia (`--ref-audio`), con posibilidad de guardar la voz (`--save-speaker`).
- Etiquetas paralingüísticas en el texto de entrada, como `[laugh]`.
- Voz incorporada por defecto (`default`).
- Streaming de audio: `tts.stream(text)` genera audio a medida que se produce.
- Ejecución totalmente offline en CPU o GPU (CUDA, Vulkan, Metal).
- Integración en Python mediante el paquete `codec_cpp` y en React Native mediante llama.rn (iOS y Android).
- Parámetros de muestreo recomendados embebidos en los metadatos: temperature 0.8, top-k 1000, top-p 0.95, min-p 0, repetition penalty 1.2, ventana de repetición 1024.
- No se indica soporte de tool calling, agentes, visión, audio de entrada (salvo referencia para clonación) ni razonamiento multi-paso.

## Casos de uso

- Generación de audiolibros y narración: el modelo sintetiza texto largo en inglés con una voz consistente y permite clonar una voz concreta a partir de unos segundos de muestra, lo que resulta adecuado para producir narraciones con identidad vocal uniforme.
- Asistentes de voz embebidos en aplicaciones móviles: mediante llama.rn en iOS y Android, el modelo se ejecuta en el dispositivo sin conexión, lo que permite integrar respuestas habladas en apps sin depender de servicios en la nube.
- Prototipado de interfaces conversacionales: el paquete `codec_cpp` permite invocar `tts.synthesize()` desde Python para generar respuestas de voz en pruebas de concepto de asistentes, con streaming para reducir la latencia percibida.
- Doblaje y localización de contenido al inglés: la clonación de voz permite generar versiones en inglés de locuciones manteniendo el timbre del hablante original, útil en vídeos corporativos y material formativo.
- Generación de avisos y locuciones automatizadas: con cuantización q4_k_m (499 MB totales) el modelo cabe en entornos con recursos limitados y puede generar mensajes de voz para sistemas de megafonía, contestadores o notificaciones.
- Investigación en TTS y evaluación de cuantizaciones: al ofrecer variantes f32, f16, q8_0, q5_k_m y q4_k_m, permite comparar la calidad de audio frente al coste computacional en un mismo pipeline.
- Integración en pipelines de CI/CD para pruebas de audio: la ejecución offline y determinista con parámetros de muestreo fijos facilita la generación de fixtures de audio en tests automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no se especifica de forma explícita; el tamaño de los ficheros da una orientación. La combinación recomendada (q8_0 backbone + q8_0 codec) ocupa 768 MB; la más pequeña (q4_k_m + q4_k_m) 499 MB; la de mayor calidad (f16 + f16) 1,4 GB.
- GPU recomendadas: no se indican modelos concretos. El modelo soporta ejecución en GPU vía CUDA, Vulkan y Metal, además de CPU.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 1,5 GB de memoria libre para la variante f16, y menos de 1 GB para q8_0 y q4_k_m; no se dispone de confirmación oficial de modelos concretos.
- Opciones de despliegue: `tts-cli` y `tts-server` de codec.cpp (que incluye llama.cpp), paquete Python `codec_cpp`, y llama.rn para React Native (iOS y Android).
- Latencia y throughput estimados: no disponibles. La model card describe el modelo como "fast English TTS" pero no aporta cifras.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base es ResembleAI/chatterbox-turbo, del que esta conversión GGUF es una cuantización; no se han facilitado datos de rendimiento de alternativas de la misma categoría (TTS con clonación de voz) para establecer una comparación rigurosa.

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Chatterbox Turbo GGUF (esta ficha) | 332.798.650 | No disponible | MIT | GGUF | Hugging Face |
| ResembleAI/chatterbox-turbo | No disponible | No disponible | MIT | No disponible (modelo base) | Hugging Face |

## Limitaciones y advertencias

- Solo soporta inglés; no se ha validado para otros idiomas.
- No se han publicado datos sobre sesgos del modelo, pero al ser un sistema de clonación de voz existe riesgo de uso indebido para suplantación de identidad; la licencia MIT no impone restricciones técnicas de uso, por lo que la responsabilidad recae en el desplegador.
- Riesgo de alucinación en el sentido de generar prosodia o contenido no solicitado; no se documentan métricas de fidelidad.
- La clonación de voz requiere una muestra corta y limpia; no se especifica la duración mínima ni la tolerancia al ruido.
- El modelo se distribuye en dos ficheros que deben emparejarse (backbone + códec); usar combinaciones no previstas puede degradar la calidad.
- La ejecución en Python requiere CMake y compilador de C++, ya que `codec_cpp` compila codec.cpp con llama.cpp embebido.
- No se dispone de información sobre el contexto máximo del backbone ni sobre límites de longitud del texto de entrada.
- La licencia MIT permite uso comercial sin restricciones adicionales, pero no se ofrece garantía alguna por parte de los autores.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/BricksDisplay/Chatterbox-Turbo-GGUF
- Modelo base: https://huggingface.co/ResembleAI/chatterbox-turbo
- codec.cpp (runtime de códec y TTS): https://github.com/mybigday/codec.cpp
- Documentación Python de codec.cpp: https://github.com/mybigday/codec.cpp/tree/main/python
- llama.cpp: https://github.com/ggml-org/llama.cpp
- llama.rn (React Native): https://github.com/mybigday/llama.rn
- Documentación TTS de llama.rn: https://github.com/mybigday/llama.rn#text-to-speech-tts
