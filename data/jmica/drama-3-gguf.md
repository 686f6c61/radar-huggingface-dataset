# Jmica/Drama-3-GGUF

## Resumen

Drama-3-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo de síntesis de voz Fish Audio Drama 3, publicado por el usuario Jmica. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos del checkpoint `fishaudio/drama-3` (revisión `dd64a85cd82e9521f7202610ede97b367fc83946`) al ecosistema de audio.cpp, con cuatro paquetes autónomos listos para inferencia. Los paquetes emplean cuantización mixta: bancos de expertos en Q2_K, Q3_K o Q4_K, backbone de lenguaje en Q8_0 o Q4_K, y componentes de audio en FP16.

El modelo subyacente es una arquitectura MoE (mezcla de expertos) orientada a text-to-speech, con 120 bancos de proyección de expertos enrutados, una torre de audio y un códec de forma de onda. La relevancia de esta conversión radica en que permite ejecutar un TTS de voz clonada de gran tamano en un runtime nativo C++ (audio.cpp), con soporte de offload de expertos a CPU, sin necesidad de un proceso de inferencia en Python.

El repositorio acumula 127.770 descargas y 14 likes, con un tamano total de 85,4 GB, y se distribuye bajo la licencia comunitaria Fish Audio v1.0. El propio autor califica la conversión como experimental y advierte de limitaciones de fiabilidad en las direcciones emocionales y no verbales. La arquitectura GGUF declarada es `audiocpp`, por lo que requiere un cargador específico y no es compatible con runtimes de texto GGUF de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) con backbone de lenguaje, torre de audio y códec de forma de onda; arquitectura GGUF `audiocpp` |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo es MoE, con 120 bancos de proyección de expertos enrutados) |
| Longitud de contexto | no disponible como maximo; el ejemplo de ejecución del autor emplea `fish_drama3.context_length=2048` |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q4_K_S (expertos); Q8_0 y Q4_K (backbone); Q4_0 (embedding de texto); FP16 (torre de audio y códec de onda); FP32 (vectores de normalización) |
| Idiomas soportados | no disponible (la validación local del autor cubrió únicamente habla en inglés) |
| Licencia | fish-audio-community-license-v1.0 (`license: other`) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion disponible no detalla el proceso de entrenamiento del modelo base `fishaudio/drama-3`: no se especifican el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO. Lo que si se describe es la estructura de la conversion: todos los paquetes publicados usan la misma arquitectura y el mismo checkpoint entrenado, y la diferencia entre ellos reside exclusivamente en la precision de almacenamiento. El modelo combina un backbone de lenguaje con expertos enrutados (120 bancos de proyeccion), una torre de audio y un codec de forma de onda que se mantiene en FP16 en todas las variantes.

La innovacion tecnica principal de este repositorio es la estrategia de cuantizacion mixta aplicada a un MoE de audio. Las variantes Q3_K_S y Q4_K_S usan bancos de expertos "puros", es decir, los 120 bancos comparten un unico tipo de almacenamiento (Q3_K o Q4_K) mediante el perfil `--pure` con overrides explicitos de precision para el backbone denso, el embedding de texto y los componentes de audio. Las variantes `backbone-8bit` conservan las matrices del backbone de lenguaje en Q8_0, mientras que la variante `backbone-4bit` las almacena en Q4_K junto con un embedding de texto Q4_0. Los paquetes son autonomos: embeben configuracion, tokenizer, codec, contrato de modelo y licencia, por lo que no requieren el directorio del checkpoint original.

## Capacidades

- Sintesis de voz (text-to-speech) en modo offline y en streaming.
- Clonacion de voz mediante referencias de audio (`--voice-ref reference.wav` junto con `--request-option 'reference_text=...'`).
- Direcciones de hablante y de eventos (speaker and event directions), aunque con fiabilidad inconsistente según el propio autor.
- Generacion de formato largo mediante chunking.
- Continuacion y edicion de audio a partir de artefactos `take` previos (a traves de la libreria/API o de JSON guardado con `previous_takes_file`).
- Ejecucion sin proceso Python: el port construye un CLI nativo en C++ y un servidor HTTP con backend `fish_drama3`.
- Soporte de offload de capas de expertos a CPU mediante `session-option fish_drama3.cpu_expert_layers`.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio de entrada mas alla de la referencia de voz para clonacion.

## Casos de uso

- Clonacion de voz para narracion de audiolibros: el modelo acepta una referencia de voz y su transcripcion, permitiendo generar contenido largo con chunking y mantener la identidad vocal a lo largo de toda la obra. El paquete Q4_K_S de 22,91 GiB es el candidato natural si se dispone de VRAM suficiente.
- Doblaje y localizacion de contenido: la combinacion de referencias de voz y edicion por artefactos `take` permite regenerar fragmentos concretos de una locucion sin rehacer todo el audio, lo que encaja en flujos de postproduccion iterativos.
- Asistentes de voz embebidos con recursos limitados: gracias al offload de capas de expertos a CPU, el paquete Q2_K (15,88 GiB) puede ejecutarse con 8 capas de expertos en CPU en perfiles de 16 GB, lo que abre la puerta a despliegues en estaciones de trabajo con GPU modesta.
- Produccion de podcasts y contenido narrado: las direcciones de evento y hablante permiten anotar intervenciones y reacciones dentro de una misma pista, aunque el autor advierte de que esta funcion no es consistentemente fiable y conviene revisar las tomas.
- Streaming de voz para aplicaciones interactivas: el modo `--mode streaming` del runtime permite emitir audio de forma incremental, adecuado para interfaces conversacionales donde la latencia percibida importa.
- Edicion iterativa de locuciones profesionales: el paso de artefactos `take` entre generaciones permite ajustar una locucion manteniendo continuidad, util en estudios de doblaje que necesitan multiples revisiones del mismo fragmento.
- Integracion en pipelines nativos sin Python: al exponer un CLI y un servidor HTTP en C++, el modelo puede empotrarse en aplicaciones de escritorio o servicios ya escritos en C++ sin anadir dependencias de Python.
- Investigacion sobre cuantizacion de MoE en audio: los cuatro perfiles publicados permiten comparar el impacto de Q2_K, Q3_K y Q4_K en un mismo checkpoint, con bancos de expertos puros y overrides de precision documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas tipo MMLU, HumanEval o GSM8K, ni metricas de calidad de audio como MOS, similitud de hablante o tasa de error de palabra. La unica validacion descrita es cualitativa: se ejercitaron localmente habla en ingles, clonacion condicionada por referencia, streaming, salida de formato largo y artefactos de continuacion/edicion, ademas de comprobarse los tipos de tensor de los expertos cuantizados y controles matematicos independientes de modelo pequeno.

## Requisitos de hardware

- Tamano de los ficheros: 15,88 GiB (Q2_K), 18,93 GiB (Q3_K_S), 21,78 GiB (backbone-4bit Q4_K_S) y 22,91 GiB (backbone-8bit Q4_K_S). El autor recuerda expresamente que el tamano del fichero no equivale a la VRAM necesaria.
- Perfiles de offload sugeridos para 16 GB: 24 capas de expertos en CPU con expertos Q4, 12 con expertos Q3, 8 con expertos Q2, o 20 con backbone Q4. Es necesaria RAM de sistema para alojar los bancos de expertos descargados.
- GPU probada: RTX PRO 6000 Blackwell con 96 GB de VRAM, CUDA 12.8, Windows y ocho hilos de CPU. El autor indica que las GPU fisicas de 16 GB y 24 GB no han sido probadas.
- VRAM estimada: no disponible. Solo se ofrecen perfiles de reparto GPU/CPU, no cifras cerradas de consumo.
- Cabe en GPU de consumo: no confirmado. Los perfiles de 16 GB son sugerencias de partida, no limites aplicados, y no se han validado en hardware fisico de esa capacidad.
- Opciones de despliegue: exclusivamente el runtime `audio.cpp` compilado desde la rama `drama-3-native` de JarodMica (commit `4dbb4d128f8f5ae373067f7213cbe340258af413`, basado en `b0feeffb05fb9a913a4377e484ee08396570e36e`). No es compatible con runtimes GGUF de texto de proposito general ni con compilaciones estandar de audio.cpp sin el port de Drama 3.
- Latencia y throughput: no disponibles. El ejemplo de ejecucion usa `--max-tokens 500`, `--seed 123` y `--threads 8`, pero no se publican mediciones de velocidad.
- El aumento de la longitud de contexto, de las referencias o del historial incrementa el consumo de memoria.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables externos en la documentacion proporcionada. La comparativa posible se limita a las cuatro variantes publicadas en este mismo repositorio, todas derivadas del mismo checkpoint:

| Paquete | Tamano | Expertos enrutados | Backbone de lenguaje | Uso previsto |
|---|---|---|---|---|
| `drama-3-backbone-8bit-experts-Q4_K_S.gguf` | 22,91 GiB | Q4_K | Q8_0 | Inferencia autonoma, maxima fidelidad de los cuatro |
| `drama-3-backbone-8bit-experts-Q3_K_S.gguf` | 18,93 GiB | Q3_K | Q8_0 | Inferencia autonoma, equilibrio tamano/calidad |
| `drama-3-backbone-8bit-experts-Q2_K.gguf` | 15,88 GiB | Q2_K | Q8_0 | Inferencia autonoma en el perfil de menor memoria |
| `drama-3-backbone-4bit-experts-Q4_K_S.gguf` | 21,78 GiB | Q4_K | Q4_K + embedding Q4_0 | Inferencia autonoma con backbone comprimido |

Comparado con el checkpoint original `fishaudio/drama-3`, este repositorio no aporta pesos nuevos: reduce el tamano mediante cuantizacion mixta y anade el contrato de recursos embebido para que el runtime no dependa del directorio original.

## Limitaciones y advertencias

- Modelo marcado como experimental por el propio autor; no debe tratarse como una conversion estable de produccion.
- Las direcciones emocionales y no verbales no son consistentemente fiables. Algunas tomas etiquetadas producen reacciones prolongadas, omiten dialogo o alcanzan el limite de generacion. El problema se observo tanto en el paquete original de expertos Q4 como en las variantes menores.
- La validacion cubrio habla en ingles, clonacion por referencia, streaming, formato largo y artefactos de edicion; no hay evidencia publicada sobre otros idiomas.
- Riesgo de alucinacion no cuantificado: no se publican metricas de fidelidad, similitud de hablante ni tasas de fallo.
- Restricciones de licencia: se distribuye bajo `fish-audio-community-license-v1.0`, enlazada al fichero LICENSE de `fishaudio/drama-3`. Es una licencia `other`, no una licencia de codigo abierto estandar; conviene revisar sus terminos antes de cualquier uso comercial.
- Compatibilidad de runtime muy restringida: requiere el port `drama-3-native` de audio.cpp. Los runtimes GGUF de texto de proposito general no pueden ejecutar esta arquitectura, y las compilaciones estandar de audio.cpp sin el port tampoco.
- Los perfiles de offload de 16 GB y 24 GB son sugerencias de partida, no limites impuestos, y no se han probado en GPU fisicas de esas capacidades.
- El rendimiento y el consumo de memoria dependen de la longitud de contexto, del numero de referencias y del historial de edicion acumulado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Jmica/Drama-3-GGUF
- Modelo base: https://huggingface.co/fishaudio/drama-3
- Licencia del modelo base: https://huggingface.co/fishaudio/drama-3/blob/main/LICENSE
- Rama del runtime `drama-3-native`: https://github.com/JarodMica/audio.cpp/tree/drama-3-native
- Instrucciones de compilacion, descarga y servidor: https://github.com/JarodMica/audio.cpp/blob/drama-3-native/docs/models/fish_drama3.md
- Opciones de cuantizacion pure y por tensor en llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/quantize.cpp
