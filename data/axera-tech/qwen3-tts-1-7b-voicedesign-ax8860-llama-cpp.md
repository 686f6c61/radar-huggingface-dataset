# AXERA-TECH/Qwen3-TTS-1.7B-VoiceDesign-AX8860-llama.cpp

## Resumen

Qwen3-TTS-1.7B-VoiceDesign-AX8860-llama.cpp es una distribución optimizada del modelo de síntesis de voz Qwen3-TTS-12Hz-1.7B-VoiceDesign de Qwen (Alibaba) para ejecutarse sobre la NPU de cuatro núcleos del SoC Axera AX8860 mediante llama.cpp con el backend ggml-axera. El modelo base es un sistema de text-to-speech de 1.733.157.888 parámetros que permite diseñar el timbre de la voz a partir de una descripción textual, en lugar de seleccionar una voz predefinida.

El repositorio no contiene pesos en formato original, sino dos ficheros GGUF en BF16: el talker (3312 MB) y el code predictor junto con el decodificador del códec (646 MB), además de los cuatro kernels de NPU precompilados, un binario estático `llama-tts` y un script de ejecución. Los pesos se convierten en tiempo de carga a MXFP8 para el talker y el code predictor, y se mantienen en BF16 para el vocoder.

Su relevancia es la demostración de inferencia de un modelo TTS de 1,7 mil millones de parámetros en hardware de borde (edge) con aceleración NPU, con un factor de tiempo real (RTF) de 0,42–0,48 en una frase en chino, lo que lo sitúa en el rango de utilidad para aplicaciones embebidas de síntesis de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS con talker, code predictor y decodificador de codec; pesos distribuidos en dos GGUF) |
| Parametros totales | 1.733.157.888 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 4096 tokens (limite del runtime en la placa) |
| Tipos de cuantizacion | GGUF BF16 en el repositorio; conversion en carga a MXFP8 (talker y code predictor) y BF16 (vocoder) |
| Idiomas soportados | auto, zh, en, de, it, pt, es, ja, ko, fr, ru |
| Licencia | no disponible |
| Formato de pesos | GGUF (BF16); kernels de NPU sin pesos, con conversion en tiempo de carga |
| Tamano del repositorio | 4,2 GB |
| Hardware objetivo | NPU de 4 nucleos del Axera AX8860, SDK V0.5.0 o superior |
| Frecuencia de muestreo del codec | 12 Hz (segun el nombre del modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen3-TTS-12Hz-1.7B-VoiceDesign ni su proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO). Lo que sí se documenta es la descomposición funcional empleada en el despliegue: un componente *talker* que genera tokens del códec, un *code predictor* que opera frame a frame con top-k en tiempo de ejecución, y un decodificador de códec (vocoder) que convierte los tokens en audio, procesando 72 frames por invocación.

La innovación técnica de esta distribución es el pipeline de inferencia sobre NPU: cuatro kernels (talker prefill, talker decode con la cabeza de salida del códec, code predictor y vocoder) que no contienen pesos y los reciben convertidos desde los GGUF al cargar. El binario `llama-tts` es estático y solo depende de `/opt/lib` y libc. La decodificación usa muestreo con temperatura 0,9 y top-k 50 por defecto, con un máximo de 2000 frames (aproximadamente 160 segundos de audio) y contexto de 4096.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto y de una descripción textual del timbre deseado (VoiceDesign).
- Control del estilo de voz mediante lenguaje natural: edad aparente, género, tono, velocidad y estado de ánimo se especifican en la descripción.
- Multilingüe con selección explícita de idioma: chino, inglés, alemán, italiano, portugués, español, japonés, coreano, francés y ruso, además del modo automático.
- Generación de audio de hasta aproximadamente 160 segundos por invocación (2000 frames).
- Ejecución en hardware de borde con aceleración NPU, sin GPU dedicada.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Síntesis de voz en dispositivos empotrados: el modelo se ejecuta íntegramente en la NPU de un SoC AX8860, por lo que puede integrarse en altavoces inteligentes, terminales de punto de venta o equipos industriales sin conexión a la nube.
- Generación de locuciones con voz personalizada: la descripción textual permite producir una voz concreta (por ejemplo, "narrador masculino grave y pausado") sin entrenar ni seleccionar un hablante preexistente, útil para audiolibros y contenido editorial.
- Avisos y megafonía multilingüe: con diez idiomas seleccionables, un mismo equipo puede emitir anuncios en chino, inglés, español o japonés cambiando un argumento del script de ejecución.
- Accesibilidad: conversión de texto a voz para personas con discapacidad visual o del habla en terminales de bajo consumo, con latencia de RTF inferior a 1 sobre la NPU.
- Prototipado de interfaces conversacionales: al ser compatible con endpoints y ejecutarse con llama.cpp, sirve para validar pipelines de voz antes de migrar a infraestructura mayor.
- Pruebas de doblaje y previsualización: generar pistas de voz de hasta 160 segundos por invocación para revisar tono y ritmo antes de una grabación profesional con actores.
- Verificación de calidad de TTS en investigación: el flujo documentado transcribe la salida con Qwen3-ASR y la compara con el texto original, lo que facilita evaluaciones automáticas de inteligibilidad.

## Benchmarks y rendimiento

Los únicos datos publicados son mediciones de rendimiento en el AX8860 con SDK V0.5.1 y NPU de 4 núcleos, sobre un párrafo en chino con una descripción de voz:

| Metrica | Resultado |
|---|---|
| Duracion del audio generado | 37,4 s |
| Tiempo de sintesis | 18,06 s (RTF 0,48) |
| RTF sin la primera conversion de pesos del vocoder | 0,42 |
| Tiempo por frame (80 ms de audio) | 33 ms |
| NPU: code predictor por frame | 7,8 ms |
| NPU: talker decode por frame | 8,1 ms |
| Carga y conversion de pesos (una vez por proceso) | ~25 s |
| Conversion inicial de pesos del vocoder | ~2,5 s |

No se han publicado resultados de benchmarks de calidad (MOS, WER, similitud de hablante) en la información disponible.

## Requisitos de hardware

- Hardware objetivo: SoC Axera AX8860 con NPU de 4 núcleos y SDK V0.5.0 o superior (verificable con `cat /proc/ax_proc/version`).
- Memoria: el repositorio ocupa 4,2 GB; los GGUF suman 3312 MB (talker) y 646 MB (code predictor y vocoder). No se especifica la RAM del sistema necesaria.
- VRAM: no aplica; la inferencia es sobre NPU, no sobre GPU.
- GPU recomendadas: no disponible; esta distribución está pensada exclusivamente para la NPU del AX8860.
- Compatibilidad con GPU de consumo: no documentada para esta build. El modelo base podría ejecutarse en otras plataformas mediante llama.cpp, pero no se aportan datos al respecto.
- Despliegue: binario estático `llama-tts` más `run.sh`; requiere `LD_LIBRARY_PATH=/opt/lib` y `GGML_AXERA_KERNEL_DIR` apuntando al directorio `kernels/`, con `-ngl 99 -c 4096`.
- La NPU queda ocupada en exclusiva por el proceso; no deben ejecutarse otros programas de NPU en paralelo.
- Latencia y throughput: RTF 0,42–0,48 y 33 ms por frame de 80 ms de audio en las condiciones medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-TTS-1.7B-VoiceDesign-AX8860 (esta ficha) | 1.733.157.888 | 4096 | NPU Axera AX8860 | no disponible | GGUF + kernels en HuggingFace |
| Qwen3-TTS-12Hz-1.7B-VoiceDesign (modelo base) | 1.733.157.888 | no disponible | GPU/CPU generica | no disponible | HuggingFace (Qwen) |
| Qwen3-TTS-1.7B Base en AX8860 | no disponible | no disponible | NPU Axera AX8860 | no disponible | Referenciado en la model card; kernels identicos |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de otros sistemas TTS comparables (por ejemplo, modelos de la familia XTTS o Fish Speech), por lo que la comparación cuantitativa de calidad queda como no disponible.

## Limitaciones y advertencias

- La NPU de 4 núcleos queda monopolizada durante la inferencia; no es posible ejecutar otras cargas de NPU simultáneamente.
- Contexto limitado a 4096 tokens y top-k máximo de 50 en el runtime de la placa.
- La decodificación greedy (`--temp 0`) produce habla demasiado larga y con pausas excesivas; se recomienda mantener el muestreo por defecto (temperatura 0,9, top-k 50).
- El primer proceso paga una penalización de aproximadamente 25 segundos por carga y conversión de pesos, más 2,5 segundos adicionales en la primera síntesis por la conversión del vocoder.
- Duración máxima de audio de aproximadamente 160 segundos por invocación.
- La licencia no está indicada en la información disponible; debe consultarse la del modelo base Qwen3-TTS-12Hz-1.7B-VoiceDesign antes de cualquier uso comercial.
- No se documentan sesgos, tasas de alucinación ni métricas de calidad subjetiva (MOS) en la información disponible.
- La verificación de correctitud se limita a frases de prueba en chino e inglés transcritas con Qwen3-ASR; no hay validación publicada para el resto de idiomas soportados.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AXERA-TECH/Qwen3-TTS-1.7B-VoiceDesign-AX8860-llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign
- llama.cpp con backend Axera (`axera-dev`, commit cff4752): https://github.com/ZHEQIUSHUI/llama.cpp
- Kernels de NPU (`main`, commit 60dd25b): https://github.com/ZHEQIUSHUI/ax-dsl-kernels
