# FluidInference/paradee-8m-coreml

## Resumen

Paradee-8M Core ML es la conversion a Core ML de Paradee-8M v1.0, un modelo de sintesis de voz (text-to-speech) en ingles desarrollado por Sahil Mahendrakar y adaptado a Apple Silicon por FluidInference. Se trata de una destilacion de Kokoro-82M en un modelo de 8,07 millones de parametros, de una sola voz (`af_heart`) y frecuencia de muestreo de 24 kHz. El repositorio incluye dos variantes de pesos: una cuantizada a int8 (12 MB de huella) y otra en fp32.

El modelo esta dividido en dos grafos separados, `ParadeeText` (que convierte fonemas en duraciones, caracteristicas acusticas y tokens ASR) y `ParadeeAcoustic` (que genera la forma de onda a partir de esas caracteristicas y una fuente de ruido armonico). Segun la model card, la variante int8 alcanza aproximadamente 150x tiempo real sobre la CPU de un Apple M5 Pro (93 segundos de audio en 0,62 segundos), frente a las 20x del ONNX fp32 original en un solo hilo de onnxruntime. Esta pensado para ejecutarse integramente en CPU, sin aceleracion por GPU.

Su relevancia actual radica en que ofrece TTS de calidad competitiva (WER de 1,20% en el corpus interno de FluidAudio) con un consumo de memoria minimo y sin dependencia de aceleradores graficos, lo que lo hace util para aplicaciones de voz embebidas en macOS e iOS. La licencia Apache-2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para TTS en dos etapas (grafo de texto + grafo acustico), destilada de Kokoro-82M; emplea LSTM y un filtro de phase-lock con STFT de 1024 puntos |
| Parametros totales | 8,07 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Entrada de texto: hasta 512 identificadores de fonema; el grafo acustico admite F de 1 a 4000 fotogramas (100 s a velocidad 1). Fragmentar entradas largas en trozos de <= 510 fonemas |
| Tipos de cuantizacion | int8 por canal (pesos; las bases DFT del filtro de phase-lock permanecen en fp32) y fp32 |
| Idiomas soportados | en (ingles, en-US) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (`.mlmodelc` para uso en runtime y `.mlpackage` como fuente); el modelo base upstream esta en ONNX |
| Frecuencia de muestreo | 24 kHz |
| Voz | unica (`af_heart`) |
| Vocabulario | mapa fonema -> id identico al de Kokoro (`vocab.json`) |
| Tamano de pesos | int8: 12 MB (`ParadeeText` 3,1 MB + `ParadeeAcoustic` 9,1 MB); fp32: 34 MB (12 + 22 MB) |
| Libreria | coreml |

## Arquitectura y entrenamiento

El modelo es una destilacion de Kokoro-82M en una red de 8,07 M de parametros, orientada a una unica voz en ingles. La inferencia se articula en dos grafos Core ML encadenados. `ParadeeText` recibe la secuencia de identificadores de fonemas (con padding `[0, ..., 0]`) y produce tres salidas: duraciones por token, un tensor de caracteristicas `d` de forma `[1,224,T]` y tokens ASR `[1,512,T]`. A continuacion, un paso en el host expansiona esas columnas segun las duraciones (`n_i = max(1, round(duration_i / speed))`) para obtener `en` `[1,224,F]` y `asr` `[1,512,F]`, y genera una fuente de ruido gaussiano `[1,1,600F]`. `ParadeeAcoustic` combina `en`, `asr` y el ruido para producir el audio `[1,600F]` a 24 kHz.

Entre las innovaciones tecnicas documentadas esta la reformulacion de la STFT de phase-lock de 1024 puntos como una combinacion de gather + matmul + overlap-add en lugar de convoluciones con stride (la forma convolucional resultaba aproximadamente 40 veces mas lenta en la CPU de Core ML). Ademas, se omiten las fases iniciales armonicas aleatorias de Kokoro porque el grafo upstream nunca las lee, y el ruido de la fuente armonica se pasa como entrada para que el grafo sea determinista. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se empleo RLHF o DPO; el unico metodo de entrenamiento descrito es la destilacion desde Kokoro-82M.

## Capacidades

- Sintesis de voz (text-to-speech) en ingles en-US, salida mono a 24 kHz.
- Generacion de una unica voz fija (`af_heart`) heredada de Kokoro.
- Control de velocidad de habla mediante el parametro `speed` (se han probado valores de 0,8 y 1,3).
- Conversacion de texto a fonemas segun la convencion de misaki (G2P de Kokoro), incluido el ultimo paso que convierte el flap `ɾ` en `T` y la oclusion glotal `ʔ` en `t`; los frontends basados solo en lexico que omiten este paso degradan palabras como "kittens" o "satellite".
- Generacion determinista: al recibir el ruido como entrada, dos ejecuciones con la misma semilla de ruido producen el mismo audio.
- Ejecucion en CPU de Apple Silicon (opciones `CPU_ONLY` o `CPU_AND_NE`); no soporta `ALL` ni `CPU_AND_GPU` porque las LSTM abortan en MPSGraph.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio de entrada.

## Casos de uso

- Lectura de texto a voz en aplicaciones de escritorio y moviles para macOS e iOS: al ejecutarse sobre Core ML en CPU, se integra de forma nativa en el ecosistema Apple sin requerir GPU y con tan solo 12 MB de pesos en la variante int8.
- Asistentes de voz locales y offline: el modelo no necesita conexion a red ni servicios externos, lo que permite incorporarlo en escenarios con requisitos de privacidad o sin conectividad.
- Audiolibros y narracion de documentos largos: admite hasta 100 segundos por bloque (F de hasta 4000) y se pueden encadenar fragmentos de <= 510 fonemas para cubrir textos extensos.
- Accesibilidad (lectores de pantalla y sintesis asistiva): el control de velocidad (probado entre 0,8 y 1,3) permite adaptar la locucion a las preferencias del usuario, con una latencia mediana de 77 ms por frase.
- Integracion en la libreria FluidAudio mediante `ParadeeManager`: pensado para pipelines de voz en Swift sobre Apple Silicon, con una referencia de rendimiento de WER 1,20% y CER 0,14%.
- Generacion de voz en tiempo real para aplicaciones interactivas: el rendimiento de ~100-150x tiempo real sobre CPU posibilita la sintesis por debajo del tiempo real incluso en frases cortas.
- Baterias de pruebas y evaluacion de TTS: al ser determinista con el mismo ruido de entrada, resulta util para comparar frontends G2P o configuraciones de cuantizacion de forma reproducible.

## Benchmarks y rendimiento

Los datos disponibles provienen de la propia model card (Apple M5 Pro, macOS 27):

| Prueba | Core ML int8 | Core ML fp32 | ONNX fp32 upstream | ONNX int8 upstream |
|---|---|---|---|---|
| Log-mel L1 frente a ONNX fp32 | 0,18-0,20 | reference / equivalente a la variacion run-to-run del propio ONNX (p. ej. 0,123 vs 0,123) | reference | 0,21-0,31 |
| WER (Whisper large-v3-turbo) | 3,81% | 3,81% (identico al ONNX fp32) | 3,81% | 2,97% |
| WER / CER (FluidAudio, corpus minimax-english, 100 frases) | 1,20% / 0,14% | 1,20% / 0,14% | no disponible | no disponible |
| RTFx (FluidAudio) | ~100 | ~100 | no disponible | no disponible |
| Latencia mediana por frase (FluidAudio) | 77 ms | 77 ms | no disponible | no disponible |
| Velocidad (M5 Pro, CPU) | ~150x tiempo real (93 s de audio en 0,62 s) | no disponible | 20x en un hilo de onnxruntime | no disponible |

Nota: en fp32, la comparacion con PyTorch usando el mismo ruido arroja 0 diferencias de redondeo en las duraciones y longitudes identicas. No se han publicado resultados de MMLU, HumanEval ni GSM8K (no aplicables a un modelo de TTS).

## Requisitos de hardware

- VRAM: el modelo esta disenado para CPU, no para GPU; no se especifica requisito de VRAM. La huella de pesos es de 12 MB en int8 y 34 MB en fp32.
- GPU recomendadas: no aplica. El modelo debe ejecutarse con `CPU_ONLY` o `CPU_AND_NE`; `ALL` y `CPU_AND_GPU` no son compatibles porque las LSTM fallan en MPSGraph (`GPURNNOps … JIT not supported`).
- Hardware probado: Apple M5 Pro (CPU). Cabe en cualquier Apple Silicon, dado el reducido tamano de pesos.
- Cabe en hardware de consumo: si, siempre que sea Apple Silicon con soporte Core ML; no esta pensado para GPU de consumo tipo RTX.
- Opciones de despliegue: Core ML (runtime de Apple); integrado en la libreria FluidAudio (`ParadeeManager`). El modelo base upstream esta disponible en ONNX.
- Latencia y throughput: ~150x tiempo real sobre M5 Pro en int8 (93 s de audio en 0,62 s); en la bateria de FluidAudio, RTFx ~100 y mediana de 77 ms por frase.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / limite | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Paradee-8M Core ML (este) | 8,07 M | 512 fonemas de entrada; F hasta 4000 (100 s) | WER 1,20% (FluidAudio, 100 frases); ~150x RT en M5 Pro int8 | Apache-2.0 | Core ML (Apple Silicon) |
| Paradee-8M v1.0 | 8,07 M | no disponible | WER 3,81% (Whisper, fp32); log-mel L1 0,21-0,31 en int8 | Apache-2.0 | ONNX (fp32 e int8) |
| Kokoro-82M | 82 M | no disponible | no disponible | Apache-2.0 | no disponible en la informacion |

El modelo base (Paradee-8M v1.0) conserva los mismos 8,07 M de parametros y la misma licencia; la diferencia principal es el formato de pesos (ONNX frente a Core ML) y el rendimiento observado en CPU de Apple. Kokoro-82M es el modelo maestro del que se destila Paradee, con un orden de magnitud mas de parametros.

## Limitaciones y advertencias

- Idioma unico: solo ingles (en-US). No se documenta soporte multilingue.
- Voz unica y fija (`af_heart`); no permite seleccion de hablante.
- Dependencia estricta del frontend G2P de misaki: si se omiten sus ultimos pasos (flap `ɾ` -> `T` y oclusion glotal `ʔ` -> `t`), se degradan palabras concretas ("kittens", "satellite").
- No compatible con GPU/MPS en Core ML (`ALL` / `CPU_AND_GPU`); hay que usar `CPU_ONLY` o `CPU_AND_NE`.
- Riesgo de alucinacion o errores de normalizacion de texto: en las pruebas con Whisper, todos los fallos de transcripcion se atribuyen a normalizacion de texto ("Ia", "favourite", "Zzyzx"), no a errores del audio sintetizado.
- Limite de longitud: las entradas deben fragmentarse en trozos de <= 510 fonemas, y el grafo acustico admite F de 1 a 4000 (100 s a velocidad 1).
- La union del ruido como entrada implica que la calidad depende del muestreo de ruido utilizado; en int8 el WER medido (3,81%) es ligeramente superior al del ONNX int8 upstream (2,97%), si bien con una muestra muy reducida (~236 palabras).
- La model card no documenta sesgos conocidos ni composicion del dataset de entrenamiento, lo que dificulta evaluar sesgos demograficos o de acento.
- Licencia Apache-2.0: permite uso comercial, pero Paradee es copyright de Sahil Mahendrakar; conviene revisar los terminos heredados de Kokoro-82M.
- No se documentan capacidades de tool calling, agentes, vision ni procesamiento de audio de entrada; es exclusivamente un modelo de sintesis de voz texto-a-audio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FluidInference/paradee-8m-coreml
- Modelo base (Paradee-8M v1.0): https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.0
- Articulo (arXiv 2610.06817): https://arxiv.org/abs/2610.06817
- FluidAudio (repositorio que lo integra via `ParadeeManager`): https://github.com/FluidInference/FluidAudio
- misaki (G2P de Kokoro): https://github.com/hexgrad/misaki
