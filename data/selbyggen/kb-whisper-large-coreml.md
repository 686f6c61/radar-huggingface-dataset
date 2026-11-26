# Selbyggen/kb-whisper-large-coreml

## Resumen

KB-Whisper large en formato Core ML es una conversion del modelo de reconocimiento automatico del habla (ASR) KBLab/kb-whisper-large, desarrollado por la Biblioteca Nacional de Suecia (Kungliga biblioteket, KBLab), al formato Core ML para su uso con WhisperKit de Argmax. No se trata de un modelo nuevo: los pesos y el comportamiento son los del modelo original de KBLab; el autor de esta ficha (Selbyggen) unicamente realiza la conversion de formato para que el modelo se ejecute sobre el Apple Neural Engine en dispositivos con Apple Silicon (Mac, iPhone, iPad).

El modelo resuelve la transcripcion de audio en sueco con alta precision y de forma completamente local. La relevancia de esta version radica en que permite ejecutar un modelo ASR de tamano large (la variante de mayor capacidad de la familia Whisper) en hardware de consumo de Apple sin depender de la nube ni de GPUs dedicadas. Se ofrece en dos variantes: float16 (4,6 GB de repositorio) y una version cuantizada a 8 bits de aproximadamente 1,49 GB que, segun el autor, mantiene la precision y duplica la velocidad.

La arquitectura subyacente es la de Whisper large (encoder-decoder transformer con espectrograma mel como entrada), especializada en sueco mediante el ajuste fino de KBLab. El modelo esta pensado para aplicaciones de transcripcion de reuniones, entrevistas y grabaciones en dispositivos Apple, como demuestra su uso en la aplicacion comercial Sagt.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper large (encoder-decoder transformer) convertido a Core ML |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, propia de Whisper) |
| Tipos de cuantizacion | float16 (sin cuantizar) e int8 lineal simetrica por canal (variante 8-bit) |
| Idiomas soportados | sueco (sv) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (whisperkit), float16 y variante 8-bit |

## Arquitectura y entrenamiento

El modelo original KBLab/kb-whisper-large es un ajuste fino de Whisper large sobre datos de sueco recopilados por la Biblioteca Nacional de Suecia. Esta version mantiene la arquitectura encoder-decoder transformer de Whisper: un encoder que procesa espectrogramas mel de audio y un decoder autorregresivo que genera tokens de texto. El tokenizador es el mismo que el de openai/whisper-large-v3.

La conversion se realizo con la herramienta whisperkittools (`whisperkit-generate-model --model-version KBLab/kb-whisper-large`) sobre la revision `main` de KBLab (denominada «Stage 2»), en precision float16 sin cuantizacion. Los tests integrados de la conversion pasaron para el encoder de audio (PSNR 51,7 frente a PyTorch), el espectrograma mel y el decoder de texto (PSNR 58,9 entre el modelo Core ML y el decoder PyTorch de whisperkittools). La comprobacion adicional que compara el decoder PyTorch de whisperkittools con la referencia de `transformers` fallo (PSNR 10,4), por lo que el autor verifico el modelo de extremo a extremo: sobre un conjunto pequeno de clips sinteticos en sueco obtuvo una tasa de error de palabra (WER) del 4,8 %, frente al 5,6 % de KB-Whisper small y el 5,6 % de OpenAI whisper-large-v3. Los ficheros `config.json` y `generation_config.json` se copian sin cambios del modelo original.

La variante de 8 bits se genero aplicando `coremltools.optimize.coreml.linear_quantize_weights` con cuantizacion lineal simetrica int8 por canal (pesos de 8 bits, activaciones de 16 bits) sobre los modelos float16 de whisperkittools, compilados con `coremlcompiler`. Segun el autor, la precision se mantiene practicamente identica y la velocidad se duplica en grabaciones largas.

## Capacidades

- Reconocimiento automatico del habla en sueco con salida de texto transcrito.
- Transcripcion local en dispositivo sobre Apple Neural Engine, sin envio de audio a servidores externos.
- Manejo de nombres propios, caracteres especiales y estructura de frases, segun la verificacion del autor.
- Procesamiento de grabaciones largas (el autor evalua con debates parlamentarios de 10 minutos).
- Ejecucion en Mac, iPhone y iPad mediante WhisperKit.
- No se documentan capacidades de traduccion, tool calling, agentes ni vision en la informacion disponible.

## Casos de uso

- Transcripcion de reuniones en Mac, iPhone o iPad: la aplicacion Sagt usa este modelo para transcribir reuniones y grabaciones de forma local, aprovechando que el audio no abandona el dispositivo.
- Subtitulado de contenido audiovisual en sueco: el modelo puede procesar pistas de audio y generar transcripciones con buena conservacion de nombres y caracteres especiales, adecuado para archivos y medios.
- Actas de debates parlamentarios o sesiones largas: el autor evalua el modelo con debates del Riksdag de 2025/26, lo que indica su uso para transcripcion de sesiones extensas con protocolo como referencia.
- Investigacion en linguistica y archivos: la Biblioteca Nacional de Suecia mantiene el modelo base para procesar material audiovisual de sus colecciones; esta version Core ML permite a investigadores transcribir localmente sin infraestructura de servidor.
- Accesibilidad: generacion de transcripciones en tiempo casi real en dispositivos Apple para personas con discapacidad auditiva, con la ventaja de que la inferencia ocurre en el propio dispositivo.
- Aplicaciones de notas de voz: integracion en apps de productividad que convierten grabaciones en texto en el propio iPhone o iPad, sin costes de API ni dependencia de conectividad.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en el Neural Engine, resulta adecuado para entornos donde no se permite enviar audio a la nube (sanidad, legal, administracion publica).

## Benchmarks y rendimiento

El autor publica mediciones de WER en la model card, aunque no son benchmarks estandarizados completos. Se recogen a continuacion tal como aparecen:

| Prueba | float16 | 8-bit |
|---|---|---|
| FLEURS sv | 4,3 % | 4,2 % |
| Common Voice sv | 5,2 % | 5,2 % |
| NST sv | 0,8 % | 0,9 % |
| Debates del Riksdag 2025/26 (4 clips de 10 min, protocolo editado como referencia) | 10,4 % | 10,4 % |

Comparativa de WER en clips sinteticos en sueco citada por el autor: KB-Whisper large Core ML 4,8 %, KB-Whisper small 5,6 %, OpenAI whisper-large-v3 5,6 %.

En cuanto a velocidad, el autor indica un factor de tiempo real de 0,18 para la variante 8-bit frente a 0,43 para float16 en las grabaciones largas sobre un Mac, es decir, aproximadamente el doble de rapido.

## Requisitos de hardware

- Ejecucion sobre Apple Neural Engine: requiere dispositivos con Apple Silicon (Mac con chip M-series, iPhone o iPad compatibles con Core ML y WhisperKit).
- VRAM equivalente: la variante float16 ocupa 4,6 GB de repositorio; la variante 8-bit ocupa aproximadamente 1,49 GB (encoder de audio 619 MB, decoder de texto 868 MB, espectrograma mel sin cambios).
- No esta pensado para GPUs NVIDIA (A100, H100, RTX 4090); el formato Core ML es especifico del ecosistema Apple.
- Despliegue mediante WhisperKit (libreria Swift); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: factor de tiempo real de 0,18 (8-bit) y 0,43 (float16) en grabaciones largas sobre un Mac, segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Selbyggen/kb-whisper-large-coreml | no disponible (Whisper large) | no disponible | sueco | Apache 2.0 | Core ML |
| KBLab/kb-whisper-large (original) | no disponible (Whisper large) | no disponible | sueco | Apache 2.0 | safetensors / PyTorch |
| OpenAI whisper-large-v3 | no disponible (Whisper large) | no disponible | multilingue | Apache 2.0 (pesos publicados por OpenAI) | safetensors / PyTorch |
| KB-Whisper small (citado por el autor) | no disponible | no disponible | sueco | no disponible en la informacion | Core ML |

En la comparativa de WER citada por el autor sobre clips sinteticos en sueco, KB-Whisper large Core ML obtiene 4,8 % frente a 5,6 % de KB-Whisper small y 5,6 % de OpenAI whisper-large-v3. No se dispone de mas datos comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Es una conversion de formato, no un modelo nuevo: cualquier limitacion del modelo original de KBLab se hereda.
- Solo soporta sueco; no se documenta soporte multilingue.
- La comprobacion de equivalencia entre el decoder PyTorch de whisperkittools y la referencia de `transformers` fallo (PSNR 10,4), aunque el autor valido el modelo de extremo a extremo con clips sinteticos.
- Las mediciones de WER proceden de conjuntos pequenos (75 clips por conjunto en FLEURS, Common Voice y NST; cuatro grabaciones de 10 minutos en el caso del Riksdag) y no constituyen una evaluacion exhaustiva.
- El WER del 10,4 % en debates parlamentarios es alto en terminos absolutos; el autor lo atribuye a que la referencia es un protocolo editado, no una transcripcion literal.
- Dependencia del ecosistema Apple: no es desplegable en GPUs NVIDIA ni en servidores Linux convencionales sin conversion adicional.
- Riesgo de alucinacion inherente a los modelos Whisper en segmentos de silencio o audio de baja calidad; no se documenta mitigacion especifica.
- Licencia Apache 2.0, que permite uso comercial, pero se recomienda verificar las condiciones del modelo base KBLab/kb-whisper-large.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Selbyggen/kb-whisper-large-coreml
- Modelo base: https://huggingface.co/KBLab/kb-whisper-large
- WhisperKit (Argmax): https://github.com/argmaxinc/WhisperKit
- whisperkittools: https://github.com/argmaxinc/whisperkittools
- Aplicacion Sagt: https://sagtapp.com/sv/
- KBLab (Biblioteca Nacional de Suecia): https://huggingface.co/KBLab
