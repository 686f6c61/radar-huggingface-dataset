# AXERA-TECH/Qwen3-TTS-1.7B-AX8860-llama.cpp

## Resumen

Qwen3-TTS-1.7B-AX8860-llama.cpp es un paquete de despliegue para ejecutar el modelo de sintesis de voz Qwen3-TTS-12Hz-1.7B-Base (desarrollado por el equipo Qwen de Alibaba) sobre la NPU del SoC Axera AX8860, utilizando una bifurcacion de llama.cpp con backend ggml-axera. No se trata de un modelo nuevo, sino de una adaptacion de inferencia: los pesos se distribuyen en formato GGUF BF16 y los kernels de NPU se cargan sin pesos, convirtiendolos en tiempo de ejecucion (MXFP8 para talker y code predictor, BF16 para el vocoder).

El modelo base es un sistema de sintesis de voz con clonacion de hablante, con 1.733.157.888 parametros (aproximadamente 1,7 mil millones), que opera a una tasa de frames de 12 Hz. La relevancia de este repositorio reside en que demuestra la viabilidad de ejecutar un TTS de clonacion de voz de esta escala en hardware de borde (edge) con aceleracion NPU, alcanzando un factor de tiempo real (RTF) de 0,40-0,53 en el AX8860, es decir, generando audio mas rapido que el tiempo real.

El paquete incluye los binarios estaticos para el dispositivo, cuatro kernels de NPU (prefill del talker, decode del talker con cabeza de codec, code predictor y vocoder) y un script de ejecucion. La documentacion del autor esta en chino e ingles, e incluye resultados de rendimiento medidos y una validacion de correctitud mediante transcripcion inversa con Qwen3-ASR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo base Qwen3-TTS (talker + code predictor + vocoder + speaker encoder + speech tokenizer encoder); despliegue sobre llama.cpp con backend ggml-axera para NPU AX8860 |
| Parametros totales | 1.733.157.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | Pesos GGUF en BF16; conversion en carga a MXFP8 (talker y code predictor) y BF16 (vocoder) para los kernels de NPU |
| Idiomas soportados | zh, en, de, it, pt, es, ja, ko, fr, ru (segun los argumentos del script de ejecucion) |
| Licencia | no disponible |
| Formato de pesos | GGUF (BF16) |

## Arquitectura y entrenamiento

El modelo base Qwen3-TTS-12Hz-1.7B-Base es un sistema de sintesis de voz que combina un componente tipo transformer generativo (denominado "talker" en la documentacion) con un code predictor, un decodificador de codec (vocoder) que genera 72 frames por llamada, un codificador de hablante (speaker encoder) y un codificador de tokens de voz (speech tokenizer encoder) empleado en el modo de clonacion ICL. La tasa de frames es de 12 Hz, lo que implica que cada frame corresponde a 80 ms de audio.

El repositorio no documenta los datos de entrenamiento del modelo base (numero de tokens, composicion del corpus, uso de RLHF o DPO). La innovacion tecnica destacable de este paquete es el motor de inferencia: los kernels de NPU no contienen pesos y los reciben mediante conversion desde los GGUF al cargar, con cuantizacion MXFP8 para el talker y el code predictor. El flujo de clonacion admite dos modos: solo grabacion de referencia (el vector de hablante o x-vector transporta el timbre) o grabacion mas su transcripcion mediante `--tts-ref-text` (modo ICL oficial, que codifica la grabacion como tokens de voz dentro del prompt para acercar timbre y entonacion). La decodificacion usa muestreo con temperatura 0,9 y top-k 50 por defecto.

## Capacidades

- Sintesis de voz (text-to-speech) en 10 idiomas: zh, en, de, it, pt, es, ja, ko, fr, ru.
- Clonacion de voz a partir de una grabacion de referencia de pocos segundos, en dos modos (x-vector o ICL con transcripcion).
- Generacion de audio con control de duracion mediante el limite de frames (`-n 2000`, aproximadamente 160 s por invocacion).
- Ejecucion sobre NPU: cuatro kernels especializados (prefill del talker, decode del talker con cabeza de codec, code predictor y vocoder).
- Validacion de correctitud mediante transcripcion inversa con Qwen3-ASR, con coincidencia literal en las frases de prueba en chino e ingles.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio de entrada mas alla de la referencia de clonacion.
- No se documenta modo de razonamiento (thinking mode) ni capacidades multimodales adicionales.

## Casos de uso

- Clonacion de voz en dispositivos de borde: el paquete esta disenado para ejecutarse en la NPU de un SoC AX8860 con un RTF de 0,40-0,53, lo que permite generar locuciones de forma local sin depender de la nube, adecuado para dispositivos empotrados con requisitos de privacidad.
- Asistentes de voz embebidos: con un contexto de 4096 tokens y soporte de 10 idiomas, el modelo puede sintetizar respuestas habladas en un asistente local que ya disponga de ASR y logica de dialogo en el mismo dispositivo.
- Accesibilidad y lectura en voz alta: sintesis de texto a voz con una voz clonada del propio usuario a partir de una grabacion breve, util para personas que pierden la voz o para interfaces de lectura personalizadas.
- Localizacion de contenidos: generacion de locuciones en espanol, aleman, italiano, portugues, japones, coreano, frances y ruso a partir de un mismo texto, con una sola referencia de hablante para mantener la identidad vocal entre idiomas.
- Prototipado de doblaje y audiolibros: generacion de fragmentos de hasta 160 s por invocacion (2000 frames) con una referencia de pocos segundos, suficiente para pruebas de concepto de doblaje o narracion sin infraestructura de GPU.
- Demostraciones de TTS en ferias y entornos sin conectividad: al ser un binario estatico que solo depende de `/opt/lib` y libc, puede desplegarse en el dispositivo AX8860 sin cadena de dependencias compleja.
- Evaluacion de aceleracion NPU para TTS: el repositorio sirve como referencia tecnica para medir el rendimiento de llama.cpp con backend ggml-axera en cargas de sintesis de voz, con metricas por frame (7,8 ms en code predictor y 8,1 ms en decode del talker).

## Benchmarks y rendimiento

Los datos disponibles son mediciones de rendimiento en el AX8860 (SDK V0.5.1, NPU de 4 nucleos) sobre un parrafo en chino que genera 27,2 s de voz:

| Metrica | Resultado |
|---|---|
| Tiempo de sintesis | 14,41 s (RTF 0,53) |
| Sin la primera conversion de pesos del vocoder | RTF 0,40; 32 ms por frame de 80 ms |
| Code predictor (NPU, por frame) | 7,8 ms |
| Talker decode (NPU, por frame) | 8,1 ms |
| Carga y conversion de pesos (una vez por proceso) | ~25 s (1,7B); ~14 s (0,6B) |
| Codificacion de la grabacion de referencia (CPU) | ~10 s para una referencia de 22 s |
| Primera sintesis (conversion de pesos del vocoder) | ~3 s adicionales |

No se han publicado resultados de benchmarks de calidad (MOS, similitud de hablante, WER) en la informacion disponible. La unica validacion de calidad reportada es cualitativa: las frases de prueba en chino e ingles, con decodificacion voraz y con muestreo y en ambos modos de clonacion, transcritas con Qwen3-ASR, coinciden literalmente con el texto original.

## Requisitos de hardware

- Hardware objetivo: SoC Axera AX8860 con NPU de 4 nucleos y SDK V0.5.0 o superior (probado con V0.5.1).
- VRAM: no aplica; el modelo se ejecuta en la NPU del SoC, no en GPU. El repositorio ocupa 5,2 GB e incluye los GGUF (3,2 GB el talker y 849 MB el resto de componentes).
- GPU recomendadas: no disponible; el paquete esta orientado exclusivamente al AX8860.
- Compatibilidad con GPU de consumo: no disponible; no se documenta ejecucion en RTX 4090 u otras GPU de consumo con este paquete.
- Opciones de despliegue: binario `llama-tts` estatico incluido en `bin/`, con `LD_LIBRARY_PATH=/opt/lib` y `GGML_AXERA_KERNEL_DIR=<repo>/kernels`, y los flags `-ngl 99 -c 4096`. No se documenta soporte para vLLM, Ollama ni TGI.
- Limitaciones de concurrencia: el proceso ocupa los 4 nucleos de la NPU en exclusiva; no deben ejecutarse otros programas de NPU en paralelo.
- Latencia y throughput: RTF 0,40-0,53; 32 ms por frame de 80 ms de audio; top-k limitado a 50.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|
| Qwen3-TTS-1.7B-AX8860-llama.cpp (este) | 1.733.157.888 | 4096 | 10 (zh, en, de, it, pt, es, ja, ko, fr, ru) | no disponible | NPU AX8860 via llama.cpp/ggml-axera |
| Qwen/Qwen3-TTS-12Hz-1.7B-Base | no disponible en la informacion | no disponible | no disponible | no disponible | Modelo base original; pesos en el hub de Qwen |
| Qwen3-TTS-0.6B (mencionado en el repositorio) | no disponible | no disponible | no disponible | no disponible | Misma pila; carga y conversion ~14 s frente a ~25 s del 1.7B |

No se dispone de datos de benchmarks comparativos con otros sistemas TTS en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de calidad (MOS, similitud de hablante o WER) con alternativas.

## Limitaciones y advertencias

- Licencia no disponible: no se indica la licencia del paquete ni la del modelo base en la informacion proporcionada, por lo que el uso comercial no puede evaluarse sin consultar el repositorio del modelo base Qwen/Qwen3-TTS-12Hz-1.7B-Base.
- Sesgos: no documentados; al ser un sistema de clonacion de voz, la calidad y las caracteristicas del hablante dependen de la grabacion de referencia y pueden amplificar sesgos acusticos de esta.
- Alucinacion y errores de sintesis: no se reportan tasas de error; la validacion se limita a frases de prueba concretas con transcripcion inversa. La decodificacion voraz (`--temp 0`) produce voz excesivamente larga y con pausas, segun el autor.
- Limitacion de contexto: 4096 tokens, lo que acota la longitud del texto de entrada y de la referencia en modo ICL.
- Limite de top-k: maximo 50; valores superiores no estan soportados.
- Duracion maxima: 2000 frames, aproximadamente 160 s de audio por invocacion.
- Exclusividad de hardware: consume los 4 nucleos de la NPU; no puede convivir con otras cargas de NPU en el mismo dispositivo.
- Dependencia de SDK: requiere SDK V0.5.0 o superior del AX8860; no hay garantia de funcionamiento en otras plataformas.
- Requiere una grabacion de referencia propia: el repositorio no incluye audio de ejemplo.
- Coste de arranque: la carga y conversion de pesos anade ~25 s por proceso en el modelo de 1,7B, y la primera sintesis suma ~3 s de conversion del vocoder.
- Riesgo de uso indebido: la clonacion de voz sin consentimiento del hablante plantea problemas eticos y legales que el repositorio no aborda.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AXERA-TECH/Qwen3-TTS-1.7B-AX8860-llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Bifurcacion de llama.cpp utilizada: https://github.com/ZHEQIUSHUI/llama.cpp (rama `axera-dev`, commit `0104880be`)
- Codigo de kernels y modelos: `ggml/src/ggml-axera/models/qwen3` y `qwen3_tts`; codificador de voz en `tools/mtmd/models/qwen3tts-encode.cpp` (dentro del repositorio anterior)
- Paper, blog o demo oficial: no disponible en la informacion proporcionada.
