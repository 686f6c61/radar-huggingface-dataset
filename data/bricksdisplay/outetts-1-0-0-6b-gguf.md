# BricksDisplay/OuteTTS-1.0-0.6B-GGUF

## Resumen

OuteTTS-1.0-0.6B-GGUF es la distribucion en formato GGUF del modelo text-to-speech OuteTTS-1.0-0.6B desarrollado originalmente por OuteAI, publicada por el usuario BricksDisplay. Se trata de un modelo de sintesis de voz basado en un backbone de lenguaje (LM) que genera tokens de audio a partir de texto plano, complementado por un codec independiente que contiene el decodificador/vocoder, los codificadores de hablante y el adaptador entre ambos grafos. El repositorio empaqueta ambos componentes en pares de ficheros que se ejecutan de forma conjunta y totalmente offline.

La relevancia de esta ficha radica en que permite ejecutar un sistema TTS de calidad razonable en hardware modesto, incluido movil, gracias a que el par de ficheros mas pequeno ocupa 446 MB y el recomendado 725 MB. El backbone corre sobre llama.cpp y el codec sobre codec.cpp, con soporte de CPU y aceleracion por CUDA, Vulkan y Metal. La licencia Apache-2.0 facilita su integracion en productos comerciales.

El modelo declara soporte para 14 idiomas (entre ellos espanol, ingles, aleman, frances, italiano, portugues implicito por familia, japones, coreano, chino, ruso, polaco, neerlandes, hungaro, leton y georgiano) y una unica voz incorporada (`en_female_1_neutral`). No dispone de clonacion de voz en esta distribucion. Su tamano compacto lo situa en la categoria de TTS ligero para despliegue en borde y aplicaciones interactivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone LM autorregresivo para generacion de tokens de audio + codec neural (decodificador/vocoder, codificadores de hablante y adaptador) |
| Parametros totales | 73.887.408 (pesos safetensors del modelo base); el repositorio GGUF incluye ademas el codec |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Backbone: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_0, Q5_1, Q5_K_S, Q5_K_M, Q6_K, Q8_0, FP16. Codec: q4_k_m, q5_k_m, q8_0, f16, f32 |
| Idiomas soportados | en, zh, nl, fr, ka, de, hu, it, ja, ko, lv, pl, ru, es |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (backbone y codec por separado) |

## Arquitectura y entrenamiento

La distribucion GGUF sigue el patron de los proyectores multimodales de llama.cpp: el modelo se divide en dos grafos que se ejecutan con runtimes distintos y se comunican mediante embeddings o tokens de audio. El fichero de backbone contiene el LM de OuteAI (los GGUF son los originales del autor, sin modificar) y se ejecuta con llama.cpp; el fichero de codec contiene el decodificador/vocoder, los codificadores de hablante y el adaptador, y se ejecuta con codec.cpp. La generacion se restringe mediante una gramatica construida a partir del texto de entrada, lo que mantiene la salida bien formada.

Los parametros de muestreo recomendados (temperatura 1.0, top-k 50, top-p 1.0 desactivado, min-p 0.0, penalizacion de repeticion 1.1 con ventana de 64) se almacenan como metadatos `general.sampling.*` en los ficheros GGUF, de modo que tts-cli, tts-server, llama.rn y cualquier host de llama.cpp los aplican por defecto. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo original.

## Capacidades

- Sintesis de voz a partir de texto plano, en modo offline y sin dependencias de red.
- Generacion de audio en streaming mediante `tts.stream(text)` en la API de Python.
- Voz incorporada `en_female_1_neutral` seleccionable por nombre.
- Soporte multilingue declarado para 14 idiomas.
- Ejecucion en CPU y aceleracion por GPU mediante CUDA, Vulkan y Metal.
- Integracion en movil (iOS y Android) a traves de llama.rn con los mismos dos ficheros.
- API de linea de comandos (`tts-cli`), servidor (`tts-server`) y paquete Python (`codec_cpp`).
- Aplicacion automatica de parametros de muestreo recomendados desde los metadatos GGUF.
- No soporta clonacion de voz en esta distribucion.

## Casos de uso

- Narracion de articulos y documentos: el modelo convierte texto plano en audio WAV con una sola llamada, adecuado para pipelines de publicacion que generan versiones en audio de contenidos escritos.
- Asistentes de voz en aplicaciones moviles: mediante llama.rn se cargan los dos ficheros en iOS y Android y se sintetiza en el dispositivo, sin enviar texto a servidores externos, lo que reduce latencia y protege la privacidad.
- Lectura de notificaciones y accesibilidad: con el par de 446 MB (Q4_K_M + codec q4_k_m) cabe en dispositivos con recursos limitados y permite leer en voz alta notificaciones o texto de pantalla en tiempo real.
- Generacion de audiolibros y podcasts automatizados: el modo streaming de la API Python permite emitir audio conforme se genera, util para producir fragmentos largos sin esperar a la sintesis completa.
- Sistemas de atencion al cliente con respuesta hablada: el modelo puede integrarse en un backend que recibe texto de un LLM y lo convierte en voz para el usuario, en cualquiera de los 14 idiomas declarados.
- Prototipado rapido de interfaces de voz: la CLI `tts-cli` y el servidor `tts-server` permiten validar voces y prosodia sin escribir codigo, util en fases de diseno de producto.
- Traduccion y doblaje de contenido: combinado con un modelo de traduccion, permite generar pistas de audio en varios idiomas a partir de un texto fuente, con la limitacion de una unica voz disponible.
- Pruebas de integracion en CI: el par de ficheros pequeno y la ejecucion CPU-only facilitan tests automatizados de sintesis en entornos sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el par recomendado (Q8_0 + codec q8_0) ocupa 725 MB en disco; el par minimo (Q4_K_M + codec q4_k_m) ocupa 446 MB; el de maxima calidad (FP16 + codec f16) ocupa 1.4 GB. La VRAM necesaria es del orden del tamano del par mas el estado de inferencia del runtime, no disponible con precision.
- GPU recomendadas: cualquier GPU con soporte CUDA, Vulkan o Metal; por el tamano del modelo, no requiere aceleradores de datacenter como A100 o H100, aunque pueden usarse.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (por ejemplo, RTX 4090 y gamas inferiores) e incluso en CPU sola.
- Opciones de despliegue: llama.cpp (backbone), codec.cpp (`tts-cli`, `tts-server`), paquete Python `codec_cpp`, llama.rn en iOS y Android.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Despliegue |
|---|---|---|---|---|---|---|
| OuteTTS-1.0-0.6B-GGUF (esta ficha) | 73,9 M (backbone) + codec | No disponible | 14 | Apache-2.0 | GGUF | llama.cpp + codec.cpp, llama.rn |
| OuteAI/OuteTTS-1.0-0.6B (original) | 73,9 M (backbone) + codec | No disponible | 14 | Apache-2.0 | Safetensors | Libreria `outetts` |
| Otros TTS ligeros | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparacion con alternativas de la misma categoria no puede completarse con los datos disponibles; se recomienda evaluar el modelo original frente a otras familias TTS ligeras antes de decidir su adopcion.

## Limitaciones y advertencias

- Una sola voz incorporada (`en_female_1_neutral`); no hay clonacion de voz en esta distribucion.
- El codec incluido contiene las voces de este modelo y debe usarse solo con el; no es intercambiable con otros modelos.
- El repositorio ocupa 15.6 GB por la acumulacion de todas las cuantizaciones; conviene descargar solo el par necesario.
- No se dispone de datos sobre sesgos, tasas de alucinacion o calidad por idioma; el soporte de 14 idiomas esta declarado pero no verificado en la informacion.
- La generacion depende de una gramatica construida a partir del texto de entrada; entradas anomalas podrian producir fallos de sintesis.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base OuteAI/OuteTTS-1.0-0.6B.
- El paquete Python `codec_cpp` compila codec.cpp y llama.cpp en la instalacion, por lo que requiere CMake y compilador C++.
- No se han publicado benchmarks; la evaluacion de calidad debe hacerse empiricamente antes de produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/BricksDisplay/OuteTTS-1.0-0.6B-GGUF
- Modelo base: https://huggingface.co/OuteAI/OuteTTS-1.0-0.6B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- codec.cpp: https://github.com/mybigday/codec.cpp
- Documentacion TTS de codec.cpp: https://github.com/mybigday/codec.cpp#text-to-speech
- Documentacion Python de codec.cpp: https://github.com/mybigday/codec.cpp/tree/main/python
- llama.rn: https://github.com/mybigday/llama.rn
- Documentacion TTS de llama.rn: https://github.com/mybigday/llama.rn#text-to-speech-tts
