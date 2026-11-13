# joe2643/Qwen3-ASR-0.6B-Cantonese-HK-GGUF

## Resumen

Qwen3-ASR-0.6B-Cantonese-HK-GGUF es la versión cuantizada en formato GGUF de un ajuste fino del modelo de reconocimiento automático del habla Qwen3-ASR-0.6B, especializado en cantonés coloquial de Hong Kong (`yue-HK`) con alternancia de código inglés. Lo desarrolla el usuario independiente joe2643 y está pensado para su uso con `llama.cpp` (`llama-server`) y con la aplicación OraType. El modelo base sin cuantizar (BF16, formato Transformers) está publicado en joe2643/Qwen3-ASR-0.6B-Cantonese-HK.

El problema que resuelve es concreto: los modelos ASR multilingües genéricos rinden mal en cantonés coloquial y en la mezcla cantón-inglés típica del habla de Hong Kong, y además no reproducen correctamente la ortografía tradicional hongkonesa (`係`, `喺`, `嘅`, `咗`, `㗎`, `閂`). Este ajuste corrige ambos aspectos y añade soporte para comandos de voz cortos y para el sesgo por hotwords con contexto, evitando el fenómeno de "parroting" (que el modelo repita las palabras del contexto en lugar de transcribir el audio).

Con 596.049.920 parámetros totales y un peso de aproximadamente 584 MB en la combinación `Q4_K_M` más `mmproj`, es un modelo muy compacto que cabe en hardware de consumo y permite transcripción local con baja latencia. La licencia es Apache 2.0, lo que facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3-ASR; arquitectura con codificador de audio y decoder, detalles no publicados en la información disponible) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens (valor usado en el ejemplo de `llama-server` con `-c 4096`); máximo oficial no disponible |
| Tipos de cuantizacion | Q4_K_M, Q6_K, Q8_0; proyector multimodal `mmproj` en Q8_0 |
| Idiomas soportados | yue (cantonés, `yue-HK`), zh (chino, con salida en tradicional de Hong Kong), en (inglés, en alternancia de código) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (también existen pesos BF16 en Transformers en el repo base) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3-ASR-0.6B, un modelo de reconocimiento automático del habla que procesa audio de entrada y genera texto. La información disponible no detalla la arquitectura interna del modelo base (número de capas, tipo de codificador de audio, mecanismo de atención), por lo que no se puede confirmar si emplea atención lineal, decodificación especulativa u otras innovaciones. El pipeline declarado es `automatic-speech-recognition` y el modelo se sirve mediante el endpoint compatible con OpenAI de `llama-server`, lo que implica un codificador de audio (cargado vía `mmproj`) acoplado a un decoder de lenguaje.

El ajuste fino se ha orientado explícitamente a tres objetivos: cantonés coloquial de Hong Kong con salida en caracteres tradicionales correctos, alternancia de código cantón-inglés (manteniendo las palabras inglesas en inglés), y comandos de voz cortos como `閂燈`, `開燈` o `閂冷氣`. Incluye una técnica de sesgo por hotwords mediante un mensaje de sistema que aporta vocabulario personalizado sin que el modelo lo repita en la salida (el autor reporta 0,0 % de parroting en una suite de estrés de 210 clips). No se especifican en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Transcripción de voz a texto en cantonés de Hong Kong (`yue-HK`) con ortografía tradicional correcta.
- Alternancia de código cantón-inglés: transcribe palabras inglesas en inglés dentro de frases en cantonés.
- Soporte de comandos de voz cortos y directos, entrenado específicamente para ellos.
- Sesgo por hotwords o vocabulario personalizado mediante mensaje de sistema, con mitigación del parroting.
- Salida estructurada con etiqueta de idioma seguida de `<asr_text>` y la transcripción.
- API compatible con OpenAI (`/v1/chat/completions`) a través de `llama-server`.
- Entrada de audio en formato WAV codificado en base64.
- Capacidades multilingües limitadas a yue, zh y en; no se documentan otras lenguas.
- No se documentan capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento (thinking).

## Casos de uso

- Dictado por voz local en cantonés: integración en aplicaciones de escritorio como OraType para transcribir dictado en tiempo real en el equipo del usuario, sin enviar audio a la nube, gracias al tamaño reducido del modelo (~584 MB en Q4_K_M).
- Control por voz de domótica: los comandos cortos como `閂燈` o `開燈` están entrenados de forma específica, lo que permite construir un asistente de voz para encender y apagar dispositivos con alta fiabilidad.
- Transcripción de reuniones y actas en Hong Kong: el modelo maneja la alternancia cantón-inglés habitual en entornos profesionales y puede transcribir grabaciones con vocabulario técnico inglés intercalado.
- Subtitulado de contenido audiovisual: generación de subtítulos en chino tradicional de Hong Kong para vídeos, pódcast o retransmisiones, con la ventaja de respetar la ortografía local.
- Atención al cliente con voz: transcripción de llamadas o mensajes de voz de usuarios hongkoneses para su posterior procesamiento por un LLM, usando el sesgo por hotwords para nombres de producto y términos internos.
- Investigación lingüística y creación de corpus: generación de transcripciones de cantonés coloquial para estudios sociolingüísticos o para construir datasets de ASR en `yue-HK`, con la ventaja de la licencia Apache 2.0.
- Aplicaciones de accesibilidad: conversión de voz a texto para personas con movilidad reducida en entornos de habla cantonesa, ejecutándose localmente en hardware modesto.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (Character Error Rate, greedy, BF16 en `transformers`; menor es mejor):

| Test set | Qwen3-ASR-0.6B original | Este modelo (0.6B-Cantonese-HK) | Qwen3-ASR-1.7B original | 1.7B-Cantonese-HK v2 | whisper-large-v3 |
|---|---:|---:|---:|---:|---:|
| FLEURS (`yue_hant_hk`) | 6,10 % | 5,70 % | 4,20 % | 3,95 % | 20,97 % |
| Common Voice `yue` | 6,84 % | 5,12 % | 5,46 % | 3,86 % | 36,44 % |
| Common Voice 23 `zh-HK` | 9,55 % | 6,44 % | 7,65 % | 5,09 % | 41,76 % |
| MDCC | 5,45 % | 3,29 % | 4,25 % | 2,49 % | 34,52 % |
| LegCo (Consejo Legislativo de HK) | 8,81 % | 7,62 % | 7,22 % | 7,16 % | 32,15 % |
| MCE (alternancia cantón-inglés) | 15,52 % | 6,98 % | 11,74 % | 5,62 % | 24,00 % |

Verificación con `llama-server` (llama.cpp `78ffbaa`) sobre 60 clips de prueba de los conjuntos `mce`, `cvhk`, `fleurs` y `mdcc` (CER sin normalización de números): Q4_K_M 4,76 %, Q6_K 4,52 %, Q8_0 4,76 %. El comando corto `閂燈` supera la prueba con y sin contexto de hotwords, con 0,0 % de parroting en la suite de estrés de 210 clips con contexto.

## Requisitos de hardware

- VRAM estimada: aproximadamente 400 MB para el archivo Q4_K_M (396.700.672 bytes) más unos 215 MB del `mmproj` Q8_0; en total en torno a 0,6 GB de pesos. Con overhead de contexto y runtime, cabe holgadamente en 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; funciona en RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin problema. También es viable en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU discreta moderna e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: `llama.cpp` mediante `llama-server` (soporte documentado, con `--mmproj` para el codificador de audio) y OraType (integración oficial). No se documentan otras opciones como vLLM o TGI para esta variante GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER en MCE (alternancia) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (0.6B-Cantonese-HK-GGUF) | 596 M | 4096 (en ejemplo) | 6,98 % | Apache 2.0 | GGUF en HF |
| Qwen3-ASR-0.6B original | 0.6B | no disponible | 15,52 % | no disponible en la información | HF |
| Qwen3-ASR-1.7B-Cantonese-HK v2 | 1.7B | no disponible | 5,62 % | no disponible en la información | GGUF en HF (joe2643) |
| whisper-large-v3 | no disponible | no disponible | 24,00 % | no disponible en la información | HF |

El modelo se sitúa como una opción intermedia: supera claramente al Qwen3-ASR-0.6B original en todos los conjuntos evaluados y se acerca al tier de 1.7B, con un coste de memoria mucho menor. Frente a whisper-large-v3, la mejora en cantonés es de un orden de magnitud en CER.

## Limitaciones y advertencias

- Ámbito lingüístico restringido: solo yue, zh y en; no es un modelo ASR multilingüe general.
- El CER en LegCo (7,62 %) es el más alto de los conjuntos evaluados, lo que sugiere menor robustez en discurso formal, rápido o con ruido de sala.
- Los benchmarks del autor se han medido en BF16 con `transformers`; las cifras de las variantes GGUF solo se han verificado en una muestra de 60 clips, por lo que pueden no ser representativas de todos los dominios.
- Riesgo de alucinación y de parroting: aunque el autor reporta 0,0 % en su suite de estrés, el sesgo por hotwords puede inducir repeticiones en audios ambiguos o con mucho ruido.
- La salida incluye una etiqueta de idioma y `<asr_text>`; los consumidores deben parsear esa estructura y no asumir texto plano.
- No se documentan sesgos específicos de género, edad o acento dentro del cantonés; el entrenamiento centrado en `yue-HK` puede degradar el rendimiento en otras variantes del cantonés (Guangzhou, Macao) o en mandarín.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las obligaciones de atribución y las condiciones del modelo base Qwen3-ASR original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (13 de noviembre de 2026), por lo que carece de validación independiente de la comunidad.
- No hay información sobre latencia ni throughput en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joe2643/Qwen3-ASR-0.6B-Cantonese-HK-GGUF
- Modelo base BF16: https://huggingface.co/joe2643/Qwen3-ASR-0.6B-Cantonese-HK
- Variante 1.7B GGUF: https://huggingface.co/joe2643/Qwen3-ASR-1.7B-Cantonese-HK-GGUF
- Repositorio GitHub del proyecto: https://github.com/joe2643/qwen3-asr-cantonese-hk
- OraType (aplicación de integración): https://github.com/sennett-lau/oratype
- Apoyo al autor: https://buymeacoffee.com/joe2643
