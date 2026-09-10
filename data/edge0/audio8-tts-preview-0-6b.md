# Edge0/Audio8-TTS-Preview-0.6b

## Resumen

Audio8 TTS Preview 0.6B es un modelo de sintesis de voz (text-to-speech) multilingue desarrollado por Edge0 (Audio8 AI) que incorpora clonacion de voz zero-shot. Con 601.159.424 parametros en el modelo principal (sin contar el codec de audio neuronal), se posiciona en la categoria de TTS compactos: lo bastante pequeno para ejecutarse en GPU de consumo e incluso en CPU mediante una conversion ONNX INT4, pero con una arquitectura DualAR inspirada en Fish Audio S2 Pro que separa la prediccion de tokens semanticos de la generacion de codebooks acusticos.

El modelo cubre 11 idiomas (cantonés, chino, neerlandes, ingles, frances, aleman, italiano, japones, coreano, polaco y espanol) y genera audio a 44,1 kHz, una frecuencia de muestreo superior a la habitual en modelos de este tamano, que suelen trabajar a 16 o 24 kHz. Incluye en el mismo repositorio el checkpoint completo, el codec neuronal de 44,1 kHz, el tokenizer, el processor y codigo remoto de Hugging Face, de modo que no hace falta descargar un codec aparte.

Su relevancia actual reside en la combinacion de licencia Apache 2.0 (uso comercial permitido), tamano reducido, soporte multilingue amplio, clonacion de voz zero-shot y una ruta de despliegue en CPU mediante ONNX INT4 que ronda 1 GiB de memoria tras la carga. Es una opcion atractiva para integrar TTS en productos reales sin depender de APIs propietarias, con la advertencia de que se trata de una version preview con cobertura de idiomas deliberadamente limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DualAR: transformer autorregresivo lento (slow AR) + transformer autorregresivo rapido (fast AR) sobre codec neuronal de audio |
| Parametros totales | 601.159.424 (modelo principal, excluyendo el codec) |
| Parametros activos | No aplica (no es un MoE) |
| Longitud de contexto | Hasta 2.048 posiciones empaquetadas de texto y audio |
| Tipos de cuantizacion | bfloat16 / float32 en safetensors; INT4 weight-only en ONNX (repo separado), con activaciones, caches KV y codec en FP16 |
| Idiomas soportados | 11: cantonés (yue), chino (zh), neerlandes (nl), ingles (en), frances (fr), aleman (de), italiano (it), japones (ja), coreano (ko), polaco (pl) y espanol (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers con codigo remoto); ONNX INT4 en repositorio aparte |
| Pipeline | text-to-speech |
| Tamano del repositorio | 2,6 GB |
| Descargas / likes | 10.849 descargas, 395 likes |

Detalle de componentes interno:

| Componente | Configuracion |
|---|---|
| Slow AR | 24 capas, ancho 896, 14 cabezas de atencion, 2 cabezas KV |
| Fast AR | 4 capas, ancho 896, 14 cabezas de atencion, 2 cabezas KV |
| Tokens acusticos | 10 codebooks de 4.096 entradas cada uno |
| Codec | 44,1 kHz, 2.048 muestras por frame (~21,5 frames/s) |

## Arquitectura y entrenamiento

La arquitectura es DualAR. El transformer autorregresivo lento predice un token semantico por cada frame de audio; el transformer autorregresivo rapido predice los codebooks del codec correspondientes a ese frame, condicionado por el estado oculto del slow AR y por los codebooks ya generados. Ambos comparten anchura (896) y configuracion de atencion con 14 cabezas de consulta y 2 cabezas KV (atencion con grouped-query), lo que reduce el coste de cache durante la generacion. El codec neuronal, incluido en el repositorio, realiza tanto la codificacion del audio de referencia como la decodificacion a forma de onda a 44,1 kHz, con 2.048 muestras por frame y aproximadamente 21,5 frames por segundo.

El modelo sigue el diseno de Fish Audio S2 Pro, del que se declara inspirado. La generacion admite decodificacion por muestreo (temperature 0.8, top-p 0.95, top-k 50 en el ejemplo oficial) con `max_new_tokens=1024`. La clonacion de voz es zero-shot: se aporta un audio de referencia junto con su transcripcion exacta, que debe coincidir con el contenido hablado, y el modelo condiciona la sintesis a ese par. Tambien se puede generar sin referencia, omitiendo ambos campos.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO u otras tecnicas de alineacion. El estado declarado es preview, con ampliacion de cobertura multilingue y soporte de dialectos del chino previsto para versiones futuras.

## Capacidades

- Sintesis de voz multilingue en 11 idiomas: cantonés, chino, neerlandes, ingles, frances, aleman, italiano, japones, coreano, polaco y espanol.
- Clonacion de voz zero-shot a partir de un audio de referencia y su transcripcion exacta, sin necesidad de ajuste fino.
- Generacion sin voz de referencia, util para voces sinteticas genericas.
- Salida de audio a 44,1 kHz mediante codec neuronal propio, con 10 codebooks de 4.096 entradas.
- Inferencia por lotes (batching) y flujo de trabajo de linea de comandos segun el repositorio oficial.
- Soporte de ajuste fino supervisado (SFT) documentado en el repositorio.
- Despliegue en CPU mediante ONNX INT4, con CLI, servicio web y HTTP, y streaming PCM.
- Registro de voces (voice registration) como paso separado del proceso de sintesis.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio de entrada mas alla de la referencia de voz, ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Audiolibros y narracion automatizada: el modelo genera voz a 44,1 kHz, frecuencia adecuada para publicacion, y permite clonar una voz concreta del narrador con una sola muestra de referencia y su transcripcion. La ventana de 2.048 posiciones empaquetadas admite fragmentos de texto largos, aunque conviene trocear por parrafos.
- Doblaje y localizacion de contenido: con 11 idiomas cubiertos y clonacion zero-shot, se puede mantener una misma identidad de voz entre versiones en espanol, ingles, frances, aleman o japones, reutilizando la misma referencia de audio en cada generacion.
- Asistentes de voz y agentes conversacionales: la salida en streaming PCM que ofrece la ruta ONNX permite emitir audio a medida que se genera, lo que reduce la latencia percibida en dialogos interactivos.
- Accesibilidad y lectores de pantalla: un modelo de 601 millones de parametros puede ejecutarse en CPU con el paquete ONNX INT4 (alrededor de 1 GiB de memoria tras la carga en la configuracion Apple M2 probada por el autor), lo que habilita lecturas de texto en equipos sin GPU.
- Personalizacion de voz en productos de consumo: la clonacion zero-shot con una unica referencia permite ofrecer voces personalizadas sin entrenamiento por usuario, con licencia Apache 2.0 compatible con uso comercial.
- Generacion de voces para videojuegos y prototipado: la ruta de SFT documentada en el repositorio permite adaptar el modelo a un timbre o estilo concreto, y el codec incluido evita depender de un decodificador externo.
- Subtitulado y locucion de contenidos formativos: al soportar polaco, neerlandes o coreano ademas de los idiomas mayoritarios, cubre mercados menos atendidos por modelos TTS compactos.
- Investigacion en sintesis de voz: la separacion explicita slow AR / fast AR y la configuracion publicada (24 y 4 capas, 14 cabezas, 2 cabezas KV) facilitan experimentos de ablacion y comparativas de arquitecturas DualAR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el modelo como "SOTA-Class TTS at Compact Scale" y declara calidad de nivel SOTA en su segmento, pero no aporta cifras de WER, similitud de hablante (SIM), MOS, ni comparaciones cuantitativas con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada en bfloat16: en torno a 1,2 GB solo para los pesos del modelo principal (601 millones de parametros a 2 bytes), a los que se suman el codec neuronal, las activaciones y la cache KV. En la practica, una GPU con 4-6 GB deberia ser suficiente.
- VRAM estimada en float32: aproximadamente 2,4 GB para los pesos, mas codec y cache; util para CPU o GPU sin soporte de bfloat16.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 6 GB de memoria (RTX 3060, RTX 4060, RTX 4090). En A100 o H100 el modelo es holgadamente pequeno y el cuello de botella pasa a ser la generacion autorregresiva por frames, no la memoria.
- Encaje en GPU de consumo: si. El tamano de 0,6B y la salida a 44,1 kHz lo hacen viable en tarjetas de gama media y en portatiles con GPU discreta.
- CPU: el paquete ONNX INT4 (pesos slow AR y fast AR en INT4 weight-only, activaciones, caches KV y codec en FP16) consume alrededor de 1 GiB tras la carga en la configuracion Apple M2 probada por el autor, sin dependencia de PyTorch ni Transformers tras la descarga.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requiere transformers >=4.57.0, <5, torch >=2.5.0 y torchaudio >=2.5.0); ONNX Runtime con `CPUExecutionProvider` para CPU; CLI, servicio web/HTTP y streaming PCM en la ruta ONNX. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La generacion se controla con `max_new_tokens=1024`, y el codec produce unos 21,5 frames por segundo de audio, dato que permite estimar la relacion entre pasos de decodificacion y duracion del audio, pero no se publican mediciones de velocidad real.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa fiable. La tabla siguiente recoge únicamente caracteristicas estructurales conocidas; las celdas sin dato verificado se marcan como no disponibles.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formatos / despliegue |
|---|---|---|---|---|---|
| Audio8 TTS Preview 0.6B | 601.159.424 (sin codec) | 2.048 posiciones empaquetadas | 11 | Apache 2.0 | safetensors, ONNX INT4 |
| Fish Audio S2 Pro (arquitectura de referencia) | no disponible | no disponible | no disponible | no disponible | no disponible |
| CosyVoice 2 | ~0,5B (no verificado en esta busqueda) | no disponible | multilingue (no detallado) | no disponible | no disponible |
| XTTS-v2 (Coqui) | no disponible | no disponible | multilingue (no detallado) | no disponible (licencia no comercial en versiones de Coqui) | no disponible |

La comparativa detallada con alternativas de la misma categoria queda pendiente de disponer de datos verificados de parametros, contexto, licencia y rendimiento de los modelos competidores.

## Limitaciones y advertencias

- Version preview: la cobertura de idiomas esta limitada intencionadamente a los 11 idiomas recomendados. El autor advierte de que el soporte multilingue ampliado y los dialectos del chino llegaran en versiones futuras, por lo que el rendimiento fuera de esa lista no esta garantizado.
- Requiere `trust_remote_code=True` y el uso de codigo personalizado incluido en el repositorio. Esto implica ejecutar codigo del autor del modelo; conviene revisar los ficheros antes de desplegarlo en produccion.
- Dependencia de la transcripcion de referencia: en la clonacion zero-shot, el texto de referencia debe coincidir exactamente con el contenido hablado en el audio. Una transcripcion incorrecta degrada la calidad del clonado.
- Riesgo de alucinacion acustica: como todo modelo autorregresivo de audio, puede producir artefactos, prosodia incorrecta, ruidos o repeticiones, especialmente con textos largos, idiomas poco representados o referencias de voz de baja calidad. No se dispone de datos de tasas de error publicados.
- Sesgos: no se documenta informacion sobre sesgos de genero, acento, edad o variedad dialectal en los datos de entrenamiento, ni sobre la representacion de las voces de referencia.
- Longitud de contexto: 2.048 posiciones empaquetadas de texto y audio limitan la duracion de cada generacion; textos largos deben trocearse, con el riesgo de perder coherencia prosodica entre fragmentos.
- Uso comercial: la licencia Apache 2.0 permite uso comercial del modelo, pero no exime de cumplir la normativa aplicable en materia de sintesis de voz. La clonacion de voces sin consentimiento explicito de la persona implicada puede ser ilegal en muchas jurisdicciones y va contra las politicas habituales de las plataformas de Hugging Face.
- Ausencia de benchmarks: no hay cifras publicas de MOS, similitud de hablante, WER ni latencia, lo que dificulta estimar la calidad real frente a alternativas y hace recomendable una evaluacion propia antes de adoptarlo en produccion.
- Restricciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama o TGI; la ruta ONNX INT4 esta pensada para CPU y puede no ofrecer la misma calidad que la inferencia en bfloat16 sobre GPU.
- Fechas del repositorio: la model card registra fechas de creacion y actualizacion en 2026, dato que conviene verificar junto con el estado real de mantenimiento del proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Edge0/Audio8-TTS-Preview-0.6b
- Repositorio GitHub de Audio8 TTS: https://github.com/Audio8-AI/Audio8_TTS
- Demo en vivo: https://audio8-ai.github.io/Audio8_TTS/
- Version ONNX INT4 para CPU: https://huggingface.co/Audio8/Audio8-TTS-Preview-0.6B-ONNX-INT4
- Licencia Apache 2.0 del proyecto: https://github.com/Audio8-AI/Audio8_TTS/blob/main/LICENSE
- Guia de despliegue en CPU con ONNX Runtime: https://github.com/Audio8-AI/Audio8_TTS/tree/master/onnx_ (ruta truncada en la informacion disponible)
- Arquitectura de referencia (Fish Audio S2 Pro): https://github.com/fishaudio/fish-speech
