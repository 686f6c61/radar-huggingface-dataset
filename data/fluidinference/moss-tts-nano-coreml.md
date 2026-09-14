# FluidInference/moss-tts-nano-coreml

## Resumen

MOSS-TTS-Nano CoreML es la conversion a CoreML del sistema de sintesis de voz MOSS-TTS-Nano, desarrollado originalmente por OpenMOSS-Team y portado a Apple Silicon por FluidInference. El sistema combina un modelo de lenguaje de 0,1 B de parametros (100 M) especializado en generacion de codigos de audio con el codec neuronal MOSS-Audio-Tokenizer-Nano (22 M de parametros, 48 kHz estereo, 12,5 Hz con 16 codebooks RVQ). El resultado es un TTS multilingue con clonacion de voz zero-shot y generacion en streaming, empaquetado en siete bundles CoreML en fp16 (encoder en fp32) listos para macOS 14 e iOS 17 o superiores.

La relevancia de esta ficha esta en el caracter on-device: no requiere GPU de servidor ni conexion de red, y segun los datos del autor alcanza aproximadamente 4 veces el tiempo real de streaming en una M5 Pro, con latencias de 7,6 ms (Step) + 5,3 ms (Frame) + 5,2 ms (CodecStep) por cada trama de 80 ms. Esto lo situa como una pieza utilizable para asistentes de voz locales, lectura de documentos o doblaje en aplicaciones de escritorio y moviles de Apple.

El modelo base declara soporte para 20 idiomas, de los cuales la model card enumera 19 (el taiwanes/zh, ingles, aleman, espanol, frances, japones, italiano, hungaro, coreano, ruso, persa, arabe, polaco, portugues, checo, danes, sueco, griego y turco). La licencia es Apache-2.0 tanto en el port como en los modelos upstream, lo que permite uso comercial sin restricciones adicionales conocidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder tipo GPT-2 para el modelo de audio (12 capas, 12 cabezas, hidden 768, dim de cabeza 64) mas codec neuronal RVQ con 16 codebooks y transformer local por trama; tokenizer SentencePiece BPE de 16 384 piezas |
| Parametros totales | 0,1 B (100 M) en MOSS-TTS-Nano-100M + 22 M en MOSS-Audio-Tokenizer-Nano |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 posiciones en el transformer global (KV cache M1024); prefill con entrada de 512 filas de 17 tokens; decoder de codec con longitud flexible hasta 125 tramas por lote |
| Tipos de cuantizacion | fp16 para Prefill, Step, Frame, CodecStep y CodecDecoder; fp32 para CodecEncoder; no se distribuyen pesos GGUF ni cuantizaciones de 4/8 bits |
| Idiomas soportados | 19 idiomas listados en la model card: zh, en, de, es, fr, ja, it, hu, ko, ru, fa, ar, pl, pt, cs, da, sv, el, tr (el texto de presentacion indica 20) |
| Licencia | Apache-2.0 |
| Formato de pesos | CoreML: `.mlpackage` (fuente) y `.mlmodelc` precompilado (se recomienda cargar directamente el segundo). Tamano del repositorio: 0,6 GB |

## Arquitectura y entrenamiento

El pipeline se divide en dos etapas. La primera es un modelo autorregresivo global: los ids de texto (tokenizados con SentencePiece BPE) y los codigos de audio de referencia se disponen como filas de 17 elementos —un token de texto mas 16 codigos de audio— y se procesan en un Prefill que genera el estado oculto (768 dimensiones) y la cache KV con forma [12, 1, 12, 1024, 64]. En cada trama de 80 ms, un transformer local (Frame) muestrea los 16 codigos de audio y un paso global (Step) actualiza la cache KV con la ranura de asistente. La segunda etapa es el codec: CodecStep y CodecDecoder convierten esos codigos en audio estereo de 2 x 3840 muestras a 48 kHz por trama, y CodecEncoder produce los 16 codigos de la clonacion a partir de una referencia de audio.

El muestreo se ejecuta dentro del grafo Frame, con top-k fijo de 50 para texto y 25 para audio; la temperatura, el top-p y la penalizacion por repeticion son entradas del grafo. Los valores por defecto recomendados son temperatura 1,5 para texto, 1,7 para audio y top-p 0,8, porque la decodificacion greedy upstream nunca emite el token de parada. El host debe aportar numeros aleatorios uniformes en [0,1); con `greedy = 1` se selecciona argmax. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Sintesis de voz multilingue en 19 idiomas enumerados, con tokenizer de respaldo por bytes para texto fuera de vocabulario.
- Clonacion de voz zero-shot a partir de un clip de referencia, codificado por CodecEncoder en 16 x T codigos.
- Generacion en streaming con granularidad de 80 ms por trama, apta para reproduccion incremental.
- Voces predefinidas incluidas en el repositorio (`voices/en_2.json` y `voices/zh_1.json`, con sus `.wav` correspondientes).
- Control de muestreo en tiempo de inferencia: temperatura de texto y audio, top-p y penalizacion por repeticion como entradas del grafo.
- Decodificacion por lotes con longitud flexible mediante CodecDecoder (hasta 125 tramas por lote) para sintesis no interactiva.
- Ejecucion totalmente local en Apple Silicon, sin llamadas de red ni servicios externos.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision, audio de entrada mas alla de la clonacion, ni modo de razonamiento explicito.

## Casos de uso

- Lectura de documentos en local: la aplicacion tokeniza el texto con SentencePiece BPE y sintetiza trama a trama con CodecDecoder, de modo que un lector de PDFs o correo en macOS puede narrar parrafos largos sin enviar contenido a un servidor.
- Audiolibros y contenido largo en lote: CodecDecoder acepta lotes de hasta 125 tramas (unos 10 segundos de audio por lote a 12,5 Hz), lo que permite trocear capitulos y sintetizar en paralelo dentro de la app.
- Asistentes de voz en dispositivos Apple: con 15,1 ms de latencia caliente por trama de 80 ms (Step + Frame + CodecStep) el modelo puede alimentar respuestas habladas con una latencia inicial de prefill de 11 ms.
- Clonacion de voz para accesibilidad: un usuario puede grabar una referencia, codificarla con CodecEncoder (22 ms para 8 s de audio) y reutilizar sus codigos para que todos los textos se lean con su propia voz.
- Doblaje y localizacion de contenido corto: al cubrir 19 idiomas con un mismo modelo, se puede generar una pista de voz por idioma desde el mismo texto fuente en aplicaciones de edicion o generacion de video.
- Interfaces conversacionales offline en iOS 17: al ser un paquete CoreML, puede integrarse en una app de iPhone/iPad que funcione sin conectividad, por ejemplo para aprendizaje de idiomas con pronunciacion sintetizada.
- Prototipado de voces en pipelines de datos: generar variantes de habla para aumentar datasets de ASR, ya que el propio autor ha medido la calidad del audio resultante con Parakeet ASR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks tipo MMLU, GSM8K o HumanEval en la informacion disponible (el modelo es un sistema TTS, no un LLM de texto). Los unicos datos numericos publicados corresponden a paridad y latencia, medidos en un M5 Pro con macOS 26.7:

| Metrica | Resultado |
|---|---|
| Paridad de wrappers frente al upstream fp32 | Nivel de 1e-5 |
| Replay greedy en fp16 sobre referencia de 375 tramas | Token-exacto en 370/375 tramas |
| SNR del codec en streaming (GPU) frente a decodificacion completa | 56,6 dB |
| Codigos del encoder | Exactos en fp32 |
| WER con ASR Parakeet sobre dos frases en ingles (cadena CoreML) | 8,3 % |
| WER con ASR Parakeet sobre las mismas frases (PyTorch upstream) | 10,1 % |
| Latencia caliente por trama de 80 ms (GPU) | Step 7,6 ms + Frame 5,3 ms + CodecStep 5,2 ms (≈ 4x tiempo real) |
| Latencia de prefill | 11 ms |
| Latencia del encoder fp32 para un prompt de 8 s | 22 ms |

## Requisitos de hardware

- Pesos estimados en fp16: unos 200 MB para los 100 M parametros del TTS y unos 44 MB para los 22 M del codec; el encoder en fp32 anade aproximadamente 88 MB. El repositorio completo ocupa 0,6 GB. Cifras calculadas a partir del numero de parametros declarado, no publicadas por el autor.
- Cache KV del transformer global: 12 capas x 12 cabezas x 1024 posiciones x 64 dimensiones en fp16, aproximadamente 18,9 MB por tensor k o v (unos 37,7 MB sumando ambos). Estimacion derivada de las formas declaradas en la model card.
- Caches del codec: 24 tensores con longitudes 500, 800, 1200 y 1600, lo que supone decenas de MB adicionales en funcion de la configuracion. Estimacion derivada de las formas declaradas.
- GPU recomendadas: cualquier Apple Silicon reciente. Las mediciones publicadas corresponden a una M5 Pro; los targets declarados son macOS 14 e iOS 17, por lo que tambien cabe en generaciones anteriores de chip M y en iPhone/iPad compatibles.
- Neural Engine: Prefill, Step y CodecDecoder fallan la compilacion para ANE y deben fijarse a CPU+GPU. Frame y CodecStep pueden ejecutarse en cualquier unidad.
- Opciones de despliegue: CoreML mediante coremltools, cargando los `.mlmodelc` precompilados; integracion en Swift con el paquete FluidAudio (`Sources/FluidAudio/TTS/MossTtsNano`). No se distribuyen pesos GGUF, por lo que no aplican llama.cpp, Ollama ni vLLM en este repositorio.
- Throughput y latencia: aproximadamente 4x tiempo real en streaming sobre M5 Pro; prefill de 11 ms y encoder de 22 ms para 8 s de audio.
- Memoria de trabajo: no se especifica un pico de RAM en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / tramas | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-TTS-Nano CoreML (este) | 100 M + 22 M codec | Ventana global de 1024 posiciones, tramas de 80 ms | WER medido de 8,3 % (Parakeet ASR, dos frases en ingles); 4x tiempo real en M5 Pro | Apache-2.0 | CoreML `.mlpackage` / `.mlmodelc` para macOS 14 e iOS 17 |
| MOSS-TTS-Nano-100M (upstream PyTorch) | 100 M + codec | Misma arquitectura, fp32 | WER medido de 10,1 % (Parakeet ASR, dos frases en ingles) | Apache-2.0 | PyTorch via repositorio OpenMOSS |
| Otros sistemas TTS multilingues con clonacion | no disponible | no disponible | no disponible | no disponible | no disponible |

La busqueda web realizada no devolvio informacion relevante sobre modelos comparables, por lo que no se incluyen alternativas adicionales.

## Limitaciones y advertencias

- La decodificacion greedy upstream nunca emite el token de parada; es obligatorio usar muestreo (por defecto temperatura 1,5 en texto, 1,7 en audio y top-p 0,8) o el modelo puede no terminar correctamente.
- El top-k esta fijado dentro del grafo (50 para texto, 25 para audio), de modo que no es configurable por el usuario en este port.
- Prefill, Step y CodecDecoder no compilan para el Neural Engine; hay que fijarlos explicitamente a CPU+GPU, lo que incrementa el consumo energetico en dispositivos moviles.
- La evaluacion publicada de calidad de audio se limita a dos frases en ingles medidas con un WER de 8,3 %, una muestra demasiado pequena para extrapolar a produccion o a otros idiomas.
- Los datos de paridad y latencia provienen de un unico equipo (M5 Pro con macOS 26.7); no se documenta el comportamiento en chips anteriores ni en iOS real.
- No se especifican sesgos de voz, cobertura de acentos ni calidad por idioma; los dos unicos perfiles de voz incluidos son `en_2` y `zh_1`, ambos derivados de los clips de demostracion upstream.
- La clonacion de voz zero-shot puede usarse para suplantacion; aunque la licencia Apache-2.0 no impone restricciones de uso, es responsabilidad del integrador aplicar consentimiento y controles legales.
- El numero de idiomas es ambiguo: la cabecera de la model card declara 20, pero solo se enumeran 19.
- No se documentan el dataset de entrenamiento, los tokens vistos ni el uso de RLHF/DPO, lo que limita la trazabilidad del modelo base.

## Enlaces

- HuggingFace: https://huggingface.co/FluidInference/moss-tts-nano-coreml
- Modelo base TTS: https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Nano-100M
- Codec base: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano
- Repositorio upstream MOSS-TTS-Nano: https://github.com/OpenMOSS/MOSS-TTS-Nano
- Scripts de conversion CoreML: https://github.com/FluidInference/mobius/tree/main/models/tts/moss-tts-nano/coreml
- Integracion Swift (FluidAudio): https://github.com/FluidInference/FluidAudio
