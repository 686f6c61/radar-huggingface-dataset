# dignome/kitten_tts2

## Resumen

Kitten TTS 2 para audio.cpp es una conversión nativa al formato GGUF del modelo de síntesis de voz KittenML/kitten-tts-2, publicada por el usuario dignome y respaldada por Stellon Labs. El paquete integra en un único fichero el modelo de lenguaje, el decodificador S3 meanflow completo, los codificadores de hablante, el tokenizador, la configuración y 48 entradas de voces preparadas, de modo que no es necesario descargar WAV de referencia ni ficheros JSON adicionales para la síntesis con presets.

A diferencia de una conversión GGUF genérica, este paquete está empaquetado según el formato propio de audio.cpp y solo es compatible con builds que incluyan el port específico (rama `kittentts2` del repositorio audio.cpp-custom, commit `a96e66c6`). La inferencia se ejecuta en C++/GGML sobre CPU y NVIDIA CUDA, sin dependencia de Python, LibTorch, TorchScript ni ONNX Runtime.

El modelo cubre diez idiomas validados (inglés, árabe, chino, francés, alemán, hindi, italiano, portugués, ruso y español), admite clonación de voz a partir de una grabación de referencia de entre 1 y 30 segundos con su transcripción, y genera audio mono a 24 kHz con síntesis fragmentada para textos largos. Se distribuye bajo la licencia comunitaria de Stellon Labs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de síntesis de voz (TTS) basado en KittenML/kitten-tts-2, con decodificador S3 meanflow (procedente de ResembleAI/chatterbox-turbo) y codificador de hablante atribuido a pyannote/embedding |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Paquete de precisión mixta: Q8_0 en las proyecciones del modelo de lenguaje, F16 en embeddings y cabeza de salida compartida, BF16 en la proyección de hablante, F32 en el decodificador S3 y en los codificadores de hablante |
| Idiomas soportados | en, ar, zh, fr, de, hi, it, pt, ru, es (10 idiomas validados por el port) |
| Licencia | stellon-labs-community-license (identificador `other` en HuggingFace) |
| Formato de pesos | GGUF (un único fichero: `kitten-tts2-native-q8-multilingual.gguf`, 3.282.123.776 bytes / 3,28 GB / 3,06 GiB) |

## Arquitectura y entrenamiento

Se trata de un sistema de síntesis de voz, no de un modelo de lenguaje generativo de propósito general. La conversión reúne el modelo base Kitten TTS 2 (snapshot `baa41e5d2c5f64be0095365672a7858542261271`) con el decodificador S3 meanflow de ResembleAI/chatterbox-turbo (revisión `749d1c1a46eb10492095d68fbcf55691ccf137cd`, fichero `s3gen_meanflow.safetensors`) y el codificador de hablante distribuido por Kitten, atribuido aguas arriba a pyannote/embedding.

El paquete aplica precisión mixta deliberada: las proyecciones del modelo de lenguaje se cuantizan a Q8_0, mientras que los embeddings y la cabeza de salida compartida se mantienen en F16, la proyección de hablante conserva su almacenamiento original en BF16 y tanto el decodificador S3 como los codificadores de hablante mantienen pesos F32. No se trata, por tanto, de una conversión íntegra a Q8. La información proporcionada no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original.

La innovación principal del port es la integración completa en un único GGUF cargable por audio.cpp, con inferencia nativa en C++/GGML sobre CPU y CUDA, incluyendo 48 entradas de voz preparadas y salida mono a 24 kHz. El decodificador por defecto incluido es el completo; no se soportan los decodificadores estudiante más pequeños.

## Capacidades

- Síntesis de voz (text-to-speech) multilingüe en diez idiomas validados: inglés, árabe, chino, francés, alemán, hindi, italiano, portugués, ruso y español.
- Clonación de voz a partir de una grabación de referencia de entre 1 y 30 segundos junto con su transcripción exacta.
- Voces con nombre en inglés, entre ellas Bruno, Bella, Jasper y Luna.
- Presets de idioma específicos: Arabic, Chinese, French, German, Hindi, Italian, Portuguese, Russian y Spanish.
- 47 presets heredados del proyecto original más una entrada adicional, `PreparedBruno` (48 entradas en total).
- Síntesis fragmentada para textos largos (chunked long-form synthesis) con salida de audio mono a 24 kHz.
- Inferencia nativa en C++/GGML sobre CPU y NVIDIA CUDA, sin dependencias de Python, LibTorch, TorchScript ni ONNX Runtime en tiempo de inferencia.
- Modo servidor con familia de modelo `kitten_tts2`, tarea `tts` y modo `offline`, direccionable mediante peticiones API con identificador de modelo y voz.
- No soporta streaming, transcripción automática de la referencia, el normalizador de texto inglés del proyecto original ni los decodificadores estudiante reducidos.
- No dispone de un conmutador de idioma independiente: el idioma se selecciona eligiendo un preset coincidente o aportando una grabación de referencia y su transcripción en el idioma objetivo.

## Casos de uso

- Lectura de documentos largos en varios idiomas: la síntesis fragmentada permite procesar artículos, informes o libros completos y generar audio mono a 24 kHz sin dividir manualmente el texto ni gestionar ficheros de referencia externos.
- Clonación de voz para audiolibros o narraciones de marca: basta con una grabación de referencia de 1 a 30 segundos y su transcripción para reproducir un timbre de voz concreto en textos nuevos.
- Integración en aplicaciones de escritorio o servidores C++ sin Python: al no requerir LibTorch, TorchScript ni ONNX Runtime en inferencia, encaja en despliegues donde no se quiere arrastrar un stack de Python.
- Despliegue en servidor de síntesis bajo demanda: el modo servidor con familia `kitten_tts2` permite exponer una API que recibe texto y una voz configurada, útil para servicios de lectura asistida o generación de avisos sonoros.
- Accesibilidad y lectores de pantalla: la combinación de diez idiomas validados y salida a 24 kHz permite convertir contenido escrito en audio inteligible para usuarios con discapacidad visual o dificultades de lectura.
- Localización de contenido multimedia: generar pistas de voz en árabe, chino, francés, alemán, hindi, italiano, portugués, ruso o español a partir de un mismo guion, seleccionando el preset de idioma correspondiente.
- Prototipado de asistentes conversacionales con identidad de voz propia: la clonación permite dotar a un prototipo de una voz característica sin depender de servicios en la nube, ejecutando la inferencia en local sobre CPU o GPU NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y la ficha de HuggingFace no incluyen métricas objetivas como MOS, WER de síntesis ni comparaciones numéricas frente a otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada: la interfaz del proyecto estima 7 GB de VRAM para este paquete, incluyendo margen de holgura; se trata de una orientación, no de un mínimo o máximo garantizado para toda petición.
- GPU probada: la validación con CUDA se realizó sobre una NVIDIA RTX 4060 Ti de 16 GB. Los backends AMD y otras GPU no han sido validados.
- Ejecución en CPU: soportada de forma nativa; los ejemplos de la documentación emplean `--backend cpu` con `--threads 8`.
- Cabe en GPU de consumo: sí, según la validación, en una RTX 4060 Ti de 16 GB. No hay datos sobre GPUs con menos memoria.
- Opciones de despliegue: binarios `audiocpp_cli` y `audiocpp_server` compilados con CMake desde la rama `kittentts2` de audio.cpp-custom. La compilación con CUDA se activa con `-DENGINE_ENABLE_CUDA=ON`; en Windows los ejecutables quedan en `build-kitten2/bin/Release/`.
- Latencia y throughput estimados: no disponible.
- Requisitos de compilación: CMake con `-DAUDIOCPP_MODEL_SET=custom -DAUDIOCPP_MODELS=kitten_tts2`; el port solo es compatible con builds que incluyan esta implementación concreta, no con cualquier aplicación que lea GGUF.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dignome/kitten_tts2 | no disponible | no disponible | no disponible | stellon-labs-community-license | GGUF para audio.cpp (rama `kittentts2`) |
| KittenML/kitten-tts-2 (modelo base) | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| ResembleAI/chatterbox-turbo (origen del decodificador S3) | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| pyannote/embedding (origen del codificador de hablante) | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace |

No se dispone de datos de rendimiento, parametros ni contexto de las alternativas dentro de la informacion proporcionada; la comparativa se limita a la relacion de dependencia entre el port y los modelos de origen.

## Limitaciones y advertencias

- Port experimental: la propia documentacion lo califica como tal, con un alcance de validacion limitado.
- Compatibilidad restringida: el GGUF usa el empaquetado propio de audio.cpp y solo funciona con el loader especifico (rama `kittentts2`, commit `a96e66c6`). El soporte GGUF generico en otra aplicacion no implica compatibilidad.
- Sin streaming: la sintesis en tiempo real por flujo continuo no esta soportada.
- Sin transcripcion automatica de la referencia: para clonar voz hay que aportar obligatoriamente la transcripcion exacta de la grabacion de referencia.
- Sin normalizador de texto: no se incluye el normalizador de texto ingles del proyecto original, por lo que numeros y abreviaturas deben escribirse como palabras pronunciables.
- Sin decodificadores estudiante: solo se incluye el decodificador completo, lo que impide usar variantes mas ligeras para reducir coste.
- Idiomas: diez idiomas validados por el port. El proyecto original anuncia idiomas adicionales que no estan validados en esta conversion.
- Seleccion de idioma: no existe un conmutador de idioma; hay que elegir un preset coincidente o aportar referencia y transcripcion en el idioma objetivo.
- Validacion de plataforma: sintesis y clonacion se validaron en CPU y NVIDIA CUDA sobre Windows. AMD y otros backends de GPU no han sido validados.
- Requisitos de VRAM orientativos: la cifra de 7 GB es una estimacion con margen y no garantiza el funcionamiento en cualquier configuracion.
- Licencia: se distribuye bajo la stellon-labs-community-license (identificador `other`), cuyos terminos concretos no se detallan en la informacion disponible; conviene revisar el fichero LICENSE antes de un uso comercial.
- Riesgo de sesgos y alucinacion acustica: la informacion proporcionada no documenta evaluaciones de sesgo ni tasas de error de pronunciacion.
- Adopcion nula en el momento de la ficha: 0 descargas y 0 likes.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/dignome/kitten_tts2
- Modelo base: https://huggingface.co/KittenML/kitten-tts-2
- Repositorio del port (rama `kittentts2`): https://github.com/dignome/audio.cpp-custom/tree/kittentts2
- Commit de la implementacion publicada: https://github.com/dignome/audio.cpp-custom/commit/a96e66c6bc4d53398563cfff8399d1f9a6e35b40
- Documentacion del port: https://github.com/dignome/audio.cpp-custom/blob/kittentts2/docs/community_models/kitten_tts2.md
- Registro de validacion: https://github.com/dignome/audio.cpp-custom/blob/kittentts2/tests/kitten_tts2/validation.md
- Decodificador S3: https://huggingface.co/ResembleAI/chatterbox-turbo
- Codificador de hablante: https://huggingface.co/pyannote/embedding
