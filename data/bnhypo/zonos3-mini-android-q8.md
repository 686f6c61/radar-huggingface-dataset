# bnHypo/ZONOS3-Mini-android-q8

## Resumen

ZONOS3-Mini-android-q8 es una re-cuantizacion en 8 bits (Q8_0) del decodificador de codec del modelo de síntesis de voz Zyphra/ZONOS3-Mini, publicada por el usuario bnHypo. No se trata de un modelo completo, sino de un componente concreto del pipeline TTS: el decodificador que transforma los códigos latentes en audio PCM mediante un cabezal iSTFT. El autor lo ha generado con la propia herramienta `quantize-cli` del repositorio oficial de ZONOS3, aplicando Q8_0 a las matrices del transformer MOSS, el cabezal semantico y el cabezal iSTFT (86 de 238 tensores), manteniendo el resto sin cambios.

El objetivo declarado es acelerar la decodificacion en CPUs de moviles Android. Segun la model card, en un Snapdragon 8 Elite Gen 5 decodifica aproximadamente el doble de rapido que el decodificador original, que el backend de CPU ejecuta en F32, con una fidelidad de audio de 31-33 dB SNR respecto al original sobre los mismos codigos. El repositorio ocupa 0,2 GB y el checkpoint safetensors asociado declara 184.497.088 parametros.

Es relevante para quienes despliegan TTS en dispositivos sin GPU dedicada, porque permite sustituir un unico fichero GGUF dentro de un pipeline ya existente de ZONOS3-Mini sin tocar el backbone. La licencia es Apache-2.0, heredada del modelo base, y el autor no esta afiliado a Zyphra.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MOSS con cabezal semantico e iSTFT (decodificador de codec de ZONOS3-Mini) |
| Parametros totales | 184.497.088 (checkpoint safetensors asociado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (86 de 238 tensores cuantizados; el resto sin cambios) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`zac-keep2-q8_0.gguf`); repo de 0,2 GB |

## Arquitectura y entrenamiento

El fichero es un artefacto de cuantizacion, no un modelo entrenado de cero. Corresponde al decodificador de codec `gguf/zac-keep2.gguf` de Zyphra/ZONOS3-Mini en la revision `2921b8821772b0bd10a04456863d21abf9d2f283`. La conversion se realizo con `quantize-cli` del subdirectorio `servers/ggml` del repositorio github.com/Zyphra/ZONOS3-Mini en el commit `a50e141`, aplicando el tipo `q8_0` a las matrices del transformer MOSS, del cabezal semantico y del cabezal iSTFT. El resto de tensores permanece en su formato original.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, ni sobre si el modelo base uso RLHF o DPO. La innovacion tecnica del artefacto es la cuantizacion selectiva: solo se cuantizan 86 de 238 tensores, lo que permite ganar velocidad en CPU manteniendo una fidelidad de audio de 31-33 dB SNR respecto al decodificador original. El autor indica que debe usarse junto con el `backbone-ptq.gguf` sin modificar de la misma revision de Zyphra.

## Capacidades

- Decodificacion de codigos latentes a audio PCM dentro del pipeline TTS de ZONOS3-Mini.
- Inferencia en CPU de dispositivos Android; el autor reporta aproximadamente el doble de velocidad que el decodificador original en F32 sobre Snapdragon 8 Elite Gen 5.
- Fidelidad de audio de 31-33 dB SNR respecto al decodificador original sobre los mismos codigos.
- Compatibilidad directa con el backbone `backbone-ptq.gguf` de la revision indicada de Zyphra.
- No realiza generacion de texto, razonamiento, codigo ni matematicas: es un componente de decodificacion de audio.
- Soporte de tool calling, agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio de entrada: no disponible.

## Casos de uso

- TTS embebido en aplicaciones Android: el fichero sustituye al decodificador original dentro del pipeline GGML de ZONOS3-Mini, reduciendo el coste de decodificacion en CPU sin GPU dedicada.
- Lectura de textos en moviles de gama alta: al duplicar la velocidad de decodificacion en Snapdragon 8 Elite Gen 5, permite sintetizar respuestas largas con menor latencia percibida.
- Asistentes de voz offline: al ejecutarse en CPU y ocupar 0,2 GB, encaja en apps que necesitan sintesis local sin depender de servicios en la nube.
- Accesibilidad: lectura de pantalla y narracion de contenido para usuarios con discapacidad visual en dispositivos Android.
- Integracion en pipelines GGML existentes: cualquier proyecto que ya use `backbone-ptq.gguf` de Zyphra puede adoptar este decodificador cambiando un unico fichero.
- Prototipado de productos de voz en dispositivos de borde: sirve para validar latencia y calidad en hardware movil antes de invertir en infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es cualitativa y especifica de hardware: decodificacion aproximadamente 2x mas rapida que el decodificador original en F32 sobre CPU Snapdragon 8 Elite Gen 5, con 31-33 dB SNR de fidelidad respecto al original.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; el repo ocupa 0,2 GB en disco.
- GPU recomendadas: no disponibles; el artefacto esta orientado a CPU.
- Cabe en GPU consumer: no disponible; el caso de uso declarado es CPU Android.
- Hardware de referencia: CPU Snapdragon 8 Elite Gen 5, donde el autor reporta 2x de velocidad frente al original en F32.
- Opciones de despliegue: backend GGML/GGUF del repositorio ZONOS3-Mini (`servers/ggml`); requiere el `backbone-ptq.gguf` de la misma revision.
- Latencia y throughput: no disponibles mas alla de la comparacion relativa 2x del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| bnHypo/ZONOS3-Mini-android-q8 | 184.497.088 | no disponible | GGUF Q8_0 | Apache-2.0 | Decodificador de codec re-cuantizado para CPU Android |
| Zyphra/ZONOS3-Mini (original) | no disponible | no disponible | safetensors / GGUF | Apache-2.0 | Modelo base completo; el decodificador en CPU corre en F32 |
| Alternativas TTS de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo autonomo: solo funciona como decodificador dentro del pipeline de ZONOS3-Mini y requiere el `backbone-ptq.gguf` de la revision `2921b8821772b0bd10a04456863d21abf9d2f283`.
- La cuantizacion Q8_0 introduce una perdida de fidelidad de audio de 31-33 dB SNR respecto al decodificador original; no es una reproduccion bit a bit.
- Las metricas de velocidad (2x) proceden de un unico dispositivo (Snapdragon 8 Elite Gen 5) y no estan verificadas de forma independiente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion de la comunidad.
- No se dispone de informacion sobre sesgos, idiomas soportados ni riesgo de alucinacion del modelo base en la documentacion proporcionada.
- El autor no esta afiliado a Zyphra; la licencia Apache-2.0 se hereda del modelo base, pero conviene revisar LICENSE y NOTICE del repositorio original antes de uso comercial.
- Integridad del fichero: sha256 `5a775a3388c029bf7f39fe63afdc74007ac4723195dcb6699d0a7f0ef27d6584`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bnHypo/ZONOS3-Mini-android-q8
- Modelo base: https://huggingface.co/Zyphra/ZONOS3-Mini
- Repositorio del modelo base: https://github.com/Zyphra/ZONOS3-Mini
