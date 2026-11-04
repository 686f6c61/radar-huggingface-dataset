# litert-community/whisper-tiny

## Resumen

Whisper-tiny para LiteRT-LM es la adaptación on-device del clásico `openai/whisper-tiny`, un transformer encoder-decoder de 39 millones de parámetros presentado en el paper "Robust Speech Recognition via Large-Scale Weak Supervision" (Radford et al., 2022). El autor del empaquetado es la comunidad `litert-community`, que publica variantes optimizadas para el runtime LiteRT-LM Omni de Google, orientado a ejecución local en Android, iOS, macOS, Linux y C++.

El modelo resuelve el problema de la transcripción de voz a texto sin depender de la nube: todo lo necesario (red INT8, tokenizador BPE multilingüe de 51.865 tokens y metadatos de preprocesado log-mel de 80 bins) va empaquetado en un único fichero `.litertlm` de 41,8 MB, un 3,6× más pequeño que el checkpoint FP32 original de 151 MB. Esto lo convierte en una opción realista para aplicaciones móviles con requisitos de privacidad, latencia baja o funcionamiento sin conectividad.

La relevancia actual está en la combinación de tres factores: cuantización INT8 con aceleración en CPU ARM64, variantes AOT compiladas para NPUs de Qualcomm Snapdragon y MediaTek Dimensity, y una licencia Apache 2.0 permisiva. Frente a modelos ASR más grandes como whisper-medium o whisper-large-v3, whisper-tiny prioriza huella mínima y velocidad sobre precisión absoluta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Tiny) |
| Parametros totales | 39 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 30 s (3.000 frames mel a 10 ms de hop); audio arbitrario mediante ventana deslizante con solapamiento configurable |
| Tipos de cuantizacion | INT8 dynamic range (variante principal), FP32 (referencia) |
| Idiomas soportados | 99 idiomas en el vocabulario upstream (en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su); por defecto transcribe en ingles `<|en|>` si no se especifican `decode_start_token_ids` |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (bundle autocontenido), `.tflite` (grafo suelto), variantes NPU AOT `.tflite` por SoC |

## Arquitectura y entrenamiento

Se trata de la arquitectura Whisper original: un transformer encoder-decoder con frontend log-mel de 80 bins tipo Slaney, ventanas de 30 segundos y tokenizador BPE multilingüe de 51.865 entradas. El modelo base fue entrenado por OpenAI con supervisión débil a gran escala sobre audio y transcripciones web (paper arXiv:2212.04356), sin que la model card de esta adaptación detalle el número exacto de horas ni la composición del corpus. No se documenta en la información disponible si hubo fases de RLHF o DPO; Whisper se entrenó originalmente como modelo supervisado de predicción de tokens.

La innovación de esta ficha no está en el entrenamiento sino en el empaquetado y el despliegue: cuantización dinámica INT8 que reduce el tamaño de 151 MB a 41,8 MB, integración de la resolución de sample rate a 16 kHz mono y del frontend log-mel dentro del propio bundle (`Speech2TextMetadata`), y compilación AOT para aceleradores NPU concretos (Snapdragon SM8450/SM8550/SM8650/SM8750/SM8850/SA8255/SA8295 y MediaTek MT6877/MT6878/MT6879/MT6897/MT6983/MT6985/MT6989/MT6991/MT6993/MT8171/MT8188/MT8189). El pipeline soporta audio de duración arbitraria mediante ventanas deslizantes con alineación de costuras.

## Capacidades

- Transcripción de voz a texto con puntuación y mayúsculas en un único pase.
- Soporte multilingüe de 99 idiomas en el vocabulario, con selección de idioma mediante tokens especiales de decodificación.
- Procesamiento de audio de cualquier duración mediante ventana deslizante de 30 s con solapamiento configurable.
- Acepta WAV mono o multicanal a cualquier sample rate (remuestreo interno a 16 kHz).
- Streaming de segmentos confirmados y no confirmados a stdout o a fichero de salida.
- Ejecución totalmente on-device sin Python ni red, en Android, iOS, macOS, Linux y C++.
- Aceleración opcional en NPU de móvil mediante variantes AOT específicas por SoC.
- No dispone de tool calling, function calling ni capacidades de agente: es un modelo ASR puro.
- No soporta visión, audio generation ni modos de razonamiento extendido.

## Casos de uso

- Transcripción de reuniones en local: la ventana deslizante con solapamiento y alineación de costuras permite procesar grabaciones de una hora o más en un portátil o móvil sin enviar audio a servidores externos, lo que resuelve requisitos de confidencialidad.
- Subtitulado en directo de aplicaciones móviles: el bundle de 41,8 MB y la ejecución en CPU ARM64 hacen viable emitir segmentos parciales y confirmados mientras el usuario habla, con latencia de ventana de 30 s.
- Dictado por voz en apps de notas: al estar empaquetado como `.litertlm` para `OmniEngine`, se integra en apps Android/iOS sin dependencias Python y con el tokenizador incluido.
- Voice commands en dispositivos empotrados: las variantes NPU AOT para Snapdragon y Dimensity permiten descargar la inferencia al acelerador y liberar CPU para el resto de la aplicación.
- Pipeline de accesibilidad para personas con discapacidad auditiva: transcripción multilingüe con puntuación en 99 idiomas, útil para generar subtítulos en tiempo casi real en dispositivos de bajo coste.
- Preprocesado de corpus de audio: al ser un modelo pequeño y rápido, sirve para generar transcripciones preliminares a gran escala que después se revisan con un modelo mayor como whisper-medium o large-v3.
- Transcripción offline en campo: escenarios sin conectividad (inspección industrial, trabajo rural, emergencias) donde el modelo corre íntegramente en el dispositivo.
- Transcripción de llamadas de atención al cliente: combinado con un LLM posterior para resumen y clasificación, siempre que la política de privacidad exija procesamiento local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de WER, MMLU, HumanEval ni comparativas numéricas con otros modelos; solo se documentan tamaños de fichero (41,8 MB INT8 frente a 151 MB FP32) y la aceleración cualitativa en CPU ARM64.

## Requisitos de hardware

- VRAM/RAM estimada: el bundle INT8 ocupa 41,8 MB en disco; en ejecución, el grafo y buffers de activación caben holgadamente en menos de 1 GB de RAM en la mayoría de dispositivos móviles modernos (cifra exacta de pico no disponible).
- Variante FP32 de referencia: 151 MB en disco, útil solo como baseline.
- Variantes NPU AOT: 119-158 MB según SoC, requieren el acelerador correspondiente (Snapdragon 8 Gen 1/2/3/Elite o Dimensity 9000/9200/9300/9400, entre otros).
- GPU recomendadas: no se especifican modelos de escritorio; el backend recomendado en la model card es `--backend=cpu`. En móvil, la ruta preferente es CPU ARM64 o NPU; el soporte GPU existe pero no se detalla.
- Cabe en cualquier consumer GPU moderna por tamaño, aunque el target real son dispositivos móviles y sistemas empotrados.
- Opciones de despliegue: LiteRT-LM Omni (`OmniEngine` / `omni_runner`) y LiteRT SDK directo con firmas `encode`/`decode`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles en la información proporcionada; la ventana de 30 s define la granularidad mínima de salida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|---|
| litert-community/whisper-tiny | 39 M | 30 s (ventana deslizante) | INT8, FP32, NPU AOT | Apache 2.0 | On-device LiteRT-LM |
| openai/whisper-tiny | 39 M | 30 s | FP32 (checkpoint original) | Apache 2.0 | Referencia PyTorch |
| litert-community/whisper-medium | no disponible en la informacion | 30 s (frontend clásico 80 mel, vocab 51865) | INT8 y variantes LiteRT | Apache 2.0 | On-device LiteRT-LM, mayor precision |
| openai/whisper-large-v3 | no disponible en la informacion | 30 s (frontend 128 mel, vocab 51866) | FP16/FP32 | Apache 2.0 | Referencia de alta precision |

La comparativa directa con whisper-medium y whisper-large-v3 en términos de WER no está publicada en la información disponible; solo se confirma que whisper-medium comparte el frontend de 80 bins y el vocabulario de 51.865 tokens con whisper-tiny, mientras que large-v3 usa un layout distinto de 128 mel y 51.866 tokens.

## Limitaciones y advertencias

- Precisión limitada por el tamaño: 39 M de parámetros sitúan a whisper-tiny por debajo de whisper-base, small, medium y large en calidad de transcripción; no se recomienda para audio con ruido intenso, acentos marcados o jerga técnica sin postprocesado.
- Idioma por defecto: si no se especifican `decode_start_token_ids`, el modelo transcribe en inglés (`<|en|>`), lo que puede producir salidas incorrectas en aplicaciones multilingües mal configuradas.
- Ventana fija de 30 s: aunque se gestiona con ventana deslizante, los cortes en fronteras de segmento pueden generar errores de alineación si el solapamiento no se ajusta bien.
- Riesgo de alucinación: Whisper es conocido por generar texto plausible en segmentos de silencio o ruido; conviene filtrar por confianza o usar supresión de no-habla.
- Sesgos: el modelo base se entrenó con supervisión débil sobre datos web, por lo que puede heredar sesgos de dominio, género y variedad dialectal; la model card no documenta análisis específicos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del runtime LiteRT-LM y de las herramientas de compilación NPU (NeuroPilot, QNN) que puedan añadir términos propios.
- Dependencia del ecosistema: el bundle `.litertlm` está atado a LiteRT-LM Omni; fuera de ese runtime debe usarse la variante `.tflite` y aportar el preprocesado log-mel y la detokenización BPE desde la aplicación.
- Variantes NPU atadas a SoC: los ficheros AOT solo funcionan en las familias Snapdragon y Dimensity listadas; no hay variante genérica para NPU de otros fabricantes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/whisper-tiny
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Paper Whisper: https://arxiv.org/abs/2212.04356
- LiteRT-LM Omni: https://github.com/google-ai-edge/LiteRT-LM/tree/main/omni
- LiteRT: https://github.com/google-ai-edge/LiteRT
- Ejemplo ASR en LiteRT SDK: https://github.com/google-ai-edge/LiteRT/tree/main/litert/samples/asr
- Guía de build y ejecución de LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM/blob/main/docs/getting-started/build-and-run.md
- Variante whisper-medium de la misma comunidad: https://huggingface.co/litert-community/whisper-medium
