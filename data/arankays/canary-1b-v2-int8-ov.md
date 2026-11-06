# arankays/canary-1b-v2-int8-ov

## Resumen

`arankays/canary-1b-v2-int8-ov` es una exportación a OpenVINO IR del modelo de reconocimiento y traducción de voz `nvidia/canary-1b-v2` de NVIDIA, con los pesos comprimidos a INT8 simétrico por canal. No es un modelo nuevo: es una conversión de formato y cuantización realizada por un tercero (arankays) para ejecutar inferencia sobre la NPU de Intel. El repositorio contiene dos grafos OpenVINO separados —un encoder FastConformer para ventanas fijas de 12 segundos y un decoder autoregresivo de un token por llamada— más el tokenizer original sin modificar.

El modelo base resuelve dos tareas: transcripción automática de voz (ASR) y traducción de voz (speech translation) entre inglés y otras 24 lenguas europeas. Con aproximadamente 1.000 millones de parámetros y una ventana de audio fija de 12 segundos por invocación, está pensado para aplicaciones de subtitulado en vivo, dictado y transcripción de reuniones en entornos de borde o portátiles con acelerador neuronal.

La relevancia de esta variante concreta es de despliegue: permite ejecutar el modelo en la NPU integrada de un Intel Core 5 320 con latencias de 0,56-0,65 s por ventana de 12 s, algo que el IR en FP16 no consigue con la misma eficiencia. El autor advierte que el plugin de CPU de OpenVINO 2026.4.0 no puede compilar este IR INT8, por lo que para CPU y GPU debe usarse la variante FP16 del mismo autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder FastConformer + decoder transformer autoregresivo (arquitectura Canary) |
| Parámetros totales | ~1.000 millones (heredados del modelo base, no se detalla el desglose) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventana de audio fija de 12 s por invocación; 1201 frames de features log-mel de 128 dimensiones; caché de decoder de 192 posiciones |
| Tipos de cuantización | INT8 simétrico por canal (`nncf.compress_weights(mode=INT8_SYM)`); existe variante FP16 del mismo autor |
| Idiomas soportados | 25: en, bg, hr, cs, da, nl, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk |
| Licencia | CC-BY-4.0 |
| Formato de pesos | OpenVINO IR (`.xml` + `.bin`), dos grafos: `encoder` y `decoder`; `tokenizer.json` aparte |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Canary-1B-v2 de NVIDIA: un encoder FastConformer que procesa features log-mel y alimenta un decoder transformer autoregresivo con atención cruzada sobre ocho capas. La exportación divide la red en dos grafos OpenVINO con formas estáticas: el encoder recibe `feats [1, 1201, 128]` y `fmask [1, 1201]`, y emite la máscara de atención cruzada junto con las claves y valores (K, V) de cada una de las 8 capas del decoder. El decoder recibe un token por llamada junto con `ids`, `pos`, `mask [1, 1, 1, 193]`, `cmask` y los buffers `past_k0..7`/`past_v0..7` de forma `[1, 8, 192, 128]` y `cross_k0..7`/`cross_v0..7`, y devuelve logits más las nuevas K y V que el llamante escribe en su caché de 192 posiciones.

No se proporcionan en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La conversión se realizó trazando ambos grafos desde `CanaryForConditionalGeneration` de `transformers`, verificando que el wrapper decodifica los mismos tokens que `generate()` con logits dentro de 1e-3 (medido 1e-4), guardando IR en FP16 y aplicando después la compresión INT8. El proceso se ejecutó con transformers 5.22.2, torch 2.15.0+cpu, OpenVINO 2026.4.0 y nncf 3.4.0. Como innovación de despliegue, el autor señala que INT4 por canal en el encoder no fue más rápido y alteró los tokens generados.

## Capacidades

- Reconocimiento automático de voz (ASR) en 25 lenguas europeas, con salida de texto plano.
- Traducción de voz: el prompt del modelo base permite especificar lengua origen y destino mediante los tokens `<|src|>` y `<|tgt|>`.
- Control de formato mediante tokens de prompt: puntuación y mayúsculas (`<|pnc|>`), inversión de normalización de texto (`<|noitn|>`), timestamps (`<|notimestamp|>`) y diarización (`<|nodiarize|>`).
- Procesamiento de audio en ventanas fijas de 12 s, apto para streaming por segmentos.
- No soporta tool calling ni function calling: es un modelo de voz, no un LLM de propósito general.
- No dispone de modo de razonamiento (thinking mode), visión ni audio generativo.
- Capacidad multilingüe limitada a las 25 lenguas listadas; el rendimiento de traducción desde inglés hacia otras lenguas es notablemente inferior al de traducción hacia inglés, según las mediciones del autor.

## Casos de uso

- Subtitulado en vivo en portátiles con NPU Intel: el modelo procesa ventanas de 12 s en 0,56-0,65 s sobre la NPU de un Core 5 320, lo que permite generar subtítulos con latencia inferior a la duración del audio y sin GPU dedicada.
- Dictado por voz en aplicaciones de escritorio: la ventana fija de 12 s y la caché de decoder de 192 posiciones encajan con la transcripción incremental de frases dictadas, con la ventaja de ejecución local sin enviar audio a la nube.
- Transcripción de reuniones y notas de voz: con 25 idiomas europeos cubiertos, un mismo binario puede transcribir participantes que hablen distintas lenguas, aunque conviene fijar la lengua origen por sesión para evitar confusiones.
- Generación de subtítulos para bibliotecas de audio y vídeo: el modo sin timestamps y sin diarización simplifica la salida a texto plano, adecuado para pipelines de postproducción que ya segmentan el audio previamente.
- Traducción de voz hacia inglés en entornos de atención al cliente: el autor reporta que la traducción hacia inglés se mantiene estable, lo que permite transcribir y traducir llamadas de hablantes no anglófonos antes de pasarlas a un sistema de análisis.
- Prototipado e investigación en ASR de bajo consumo: al ser un IR OpenVINO con formas estáticas, sirve para medir latencia y precisión en aceleradores Intel (NPU, iGPU) sin necesidad de infraestructura NVIDIA.
- Integración en dispositivos de borde con Intel: el formato OpenVINO y la compilación en 16 s en frío (3,5 s desde caché del driver) facilitan el arranque de servicios de transcripción en equipos sin GPU dedicada.

## Benchmarks y rendimiento

Mediciones publicadas por el autor de la conversión (2026-11-06, Intel Core 5 320, OpenVINO 2026.4.0), sobre el capítulo 1-3 de *Pride and Prejudice* de LibriVox (4,6 min de audio):

| Condición | WER | Referencia |
|---|---|---|
| 23 ventanas separadas de 12 s | 8,0 % | Whisper small.en: 12,1 % |
| Sesión de subtitulado en vivo empalmada, con guarda anti-bucle | 5,8 % | Whisper small.en: 4,8 % |

| Métrica de latencia (por ventana de 12 s, NPU) | Valor |
|---|---|
| Tiempo total por ventana | 0,56-0,65 s |
| Encoder | ~115 ms |
| Decoder | ~7,5 ms por token |
| Primer token | ~0,2 s |
| Compilación en frío | 16 s |
| Compilación desde caché del driver | 3,5 s |

El autor indica que son mediciones sobre un solo portátil, con narración de audiolibro y n=1 por cifra. No se han publicado resultados de benchmarks del modelo base en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 1,0 GB en INT8; la inferencia cabe holgadamente en memoria unificada de equipos con 8 GB o más.
- GPU recomendadas: no aplica para este IR; el autor indica que el plugin de CPU de OpenVINO 2026.4.0 no puede compilarlo (`m_element_type.is_static()`) y que para CPU y GPU debe usarse `arankays/canary-1b-v2-fp16-ov`.
- Acelerador objetivo: NPU de Intel (medido en Intel Core 5 320).
- Cabe en hardware de consumo: sí, en portátiles y mini-PC con NPU Intel; no requiere GPU dedicada.
- Opciones de despliegue: OpenVINO Runtime con un bucle de decodificación propio; el autor proporciona `vinowhisper/canary.py` en vinoWhisper, que incluye un port en numpy de la extracción de features mel. No es compatible de forma directa con `transformers` ni con OpenVINO GenAI.
- Latencia y throughput: 0,56-0,65 s por ventana de 12 s en NPU, lo que equivale aproximadamente a un factor de tiempo real de 18-21x sobre el audio procesado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| arankays/canary-1b-v2-int8-ov | ~1.000 M | 12 s fijos | 25 | CC-BY-4.0 | OpenVINO IR INT8 |
| arankays/canary-1b-v2-fp16-ov | ~1.000 M | 12 s fijos | 25 | CC-BY-4.0 | OpenVINO IR FP16 |
| nvidia/canary-1b-v2 | ~1.000 M | no disponible en la información | 25 | CC-BY-4.0 | safetensors (transformers) |
| Whisper small.en (referencia del autor) | no disponible | no disponible | en | no disponible | no disponible |

La comparación con Whisper small.en procede únicamente de las cifras de WER reportadas por el autor de la conversión; no se dispone de especificaciones técnicas de ese modelo en la información proporcionada.

## Limitaciones y advertencias

- El plugin de CPU de OpenVINO 2026.4.0 no compila este IR INT8; usarlo en CPU requiere la variante FP16 del mismo autor.
- No es un reemplazo directo de `transformers` ni de OpenVINO GenAI: exige un bucle de decodificación externo que gestione la caché de 192 posiciones y las K/V por capa.
- Trampa en la extracción de features: el extractor del modelo base marca `len(audio) // 160` frames como reales, uno menos de los que calcula (1200 de 1201 para 12 s). Si no se pasa esa máscara en `fmask`, la salida del encoder se desvía y la decodificación empeora.
- Bucles de repetición: sin una guarda, las ventanas cortas (menos de ~10 s) producen a veces repeticiones. El autor recomienda descartar decodificaciones cuya ratio de compresión zlib supere 2,0.
- Traducción asimétrica: la traducción de inglés a otras lenguas devolvió inglés en aproximadamente un cuarto de las ventanas a mitad de frase; la traducción hacia inglés se mantiene estable.
- Ventana fija de 12 s: no admite audio de duración arbitraria sin segmentación previa y empalme de resultados.
- Riesgo de alucinación: como todo modelo de voz, puede generar texto plausible en segmentos con ruido o silencio; las métricas del autor proceden de narración limpia de audiolibro, no de audio real con ruido.
- Sesgos: no se documentan en la información disponible; al entrenarse sobre datos no especificados, pueden aparecer sesgos dialectales o de género en la transcripción.
- Licencia CC-BY-4.0: permite uso comercial con atribución a NVIDIA y al autor de la conversión; el repositorio es una versión modificada no afiliada ni respaldada por NVIDIA.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni mantenimiento garantizado más allá del proyecto vinoWhisper, que lo fija por commit y sha256 por fichero.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/arankays/canary-1b-v2-int8-ov
- Modelo base: https://huggingface.co/nvidia/canary-1b-v2
- Variante FP16 para CPU y GPU: https://huggingface.co/arankays/canary-1b-v2-fp16-ov
- Proyecto vinoWhisper: https://github.com/karanshukla/vinoWhisper
- Script de decodificación: https://github.com/karanshukla/vinoWhisper/blob/main/vinowhisper/canary.py
- Script de exportación: https://github.com/karanshukla/vinoWhisper/blob/main/scripts/export_canary.py
- Documentación de resultados: https://github.com/karanshukla/vinoWhisper/blob/main/docs/models.md
- Documentación de Canary en transformers: https://huggingface.co/docs/transformers/main/model_doc/canary
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
