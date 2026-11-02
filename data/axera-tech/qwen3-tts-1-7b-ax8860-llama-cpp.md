# AXERA-TECH/Qwen3-TTS-1.7B-AX8860-llama.cpp

## Resumen

Qwen3-TTS-1.7B-AX8860-llama.cpp es un paquete de despliegue, publicado por AXERA-TECH, que permite ejecutar el modelo de síntesis de voz Qwen3-TTS-1.7B (base Qwen/Qwen3-TTS-12Hz-1.7B-Base) sobre la NPU de cuatro núcleos del SoC Axera AX8860 mediante llama.cpp y una extensión propia de ggml denominada ggml-axera. No se trata de un modelo nuevo, sino de una adaptación de inferencia: los pesos se distribuyen en dos ficheros GGUF en BF16 (el "talker", de 3,2 GB, y un segundo fichero de 849 MB con el predictor de códigos, el decodificador de códec, el codificador de hablante y el codificador de voz) y los kernels de NPU se cargan sin pesos, convirtiéndolos en tiempo de ejecución.

El modelo subyacente resuelve el problema de la síntesis de voz con clonación de timbre ("voice cloning") a partir de una grabación de referencia de pocos segundos, con soporte declarado para diez idiomas (zh, en, de, it, pt, es, ja, ko, fr, ru). El interés de esta ficha es doble: por un lado documenta un caso de despliegue en hardware de borde (edge) con aceleración NPU; por otro, permite evaluar el modelo Qwen3-TTS-1.7B en un entorno de inferencia restringido, con contexto de 4096 tokens y top-k limitado a 50.

La relevancia actual es la aparición de pipelines de TTS de código abierto que caben en dispositivos embebidos con NPU dedicada, algo que hasta hace poco requería GPU de escritorio. El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, y su licencia no está declarada en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de síntesis de voz (TTS) sobre transformer, con "talker", predictor de códigos, decodificador de códec (vocoder), codificador de hablante y codificador de voz; empaquetado para llama.cpp + ggml-axera |
| Parametros totales | 1.733.157.888 (1,7B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | Pesos distribuidos en GGUF BF16; conversión en carga a MXFP8 (talker y predictor de códigos) y BF16 (vocoder) |
| Idiomas soportados | zh, en, de, it, pt, es, ja, ko, fr, ru (según el script de ejecución) |
| Licencia | no disponible |
| Formato de pesos | GGUF (BF16); kernels de NPU en directorio `kernels/` con `manifest.json` |

## Arquitectura y entrenamiento

El modelo base Qwen3-TTS-12Hz-1.7B-Base es un sistema de síntesis de voz autorregresivo con una frecuencia de tokenización de audio de 12 Hz. La adaptación de AXERA-TECH descompone el pipeline en cuatro kernels de NPU: prefill del talker, decode del talker (con la cabeza de códec), predictor de códigos (una trama por llamada, con top-k en tiempo de ejecución) y decodificador de códec (72 tramas por llamada). Los pesos no residen en los kernels: se cargan desde los GGUF y se convierten en el momento de la carga a MXFP8 (talker y predictor de códigos) o se mantienen en BF16 (vocoder).

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si hubo etapas de RLHF o DPO. La model card tampoco documenta innovaciones de decodificación más allá del esquema de muestreo oficial (temperature 0,9 y top-k 50), y advierte que la decodificación voraz (`--temp 0`) produce habla demasiado larga y con pausas excesivas.

## Capacidades

- Síntesis de voz (text-to-speech) en diez idiomas: chino, inglés, alemán, italiano, portugués, español, japonés, coreano, francés y ruso.
- Clonación de voz en dos modos: solo con la grabación de referencia (vector de hablante o x-vector) o con grabación más su transcripción (modo ICL oficial, que codifica la referencia como tokens de voz en el prompt y logra mayor fidelidad de timbre y manera).
- Generación de audio de hasta 2000 tramas (aproximadamente 160 segundos) por invocación.
- Control de idioma de salida mediante argumento explícito en el script de ejecución.
- Integración con llama.cpp: admite `-ngl 99 -c 4096` y top-k hasta 50 al invocar el binario directamente.
- Compatibilidad declarada con endpoints (etiqueta `endpoints_compatible` en HuggingFace).
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada más allá de la referencia de voz para clonación.

## Casos de uso

- Clonación de voz para doblaje y locución: con una grabación de referencia de pocos segundos y su transcripción, el modelo genera habla con el timbre y la manera del hablante original; útil para producir versiones localizadas de un mismo contenido en los diez idiomas soportados.
- Asistentes de voz embebidos: al ejecutarse sobre la NPU de un AX8860 con RTF de 0,40 (sin la primera conversión del vocoder), el sistema puede integrarse en dispositivos de borde que sinteticen respuestas habladas sin depender de la nube.
- Accesibilidad y lectura en voz alta: generación de audio a partir de texto en chino, inglés o español para interfaces de lectura, con control del idioma de salida y límite de 160 segundos por invocación.
- Prototipado de interfaces conversacionales: el binario `llama-tts` acepta texto, referencia, salida y idioma como argumentos, lo que permite integrarlo en scripts y pipelines de pruebas sin infraestructura adicional.
- Generación de audiolibros y pódcast de bajo coste: la clonación con transcripción (modo ICL) permite mantener una voz consistente a lo largo de varios fragmentos, siempre que cada uno respete el límite de 2000 tramas.
- Evaluación de TTS en hardware de borde: el paquete sirve como banco de pruebas para medir latencia de NPU (7,8 ms por trama en el predictor de códigos y 8,1 ms en el decode del talker) antes de comprometerse con un SoC concreto.
- Investigación en clonación de voz: los dos modos de clonación y la verificación con Qwen3-ASR documentada por el autor permiten reproducir experimentos de fidelidad de timbre con y sin transcripción de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí documenta métricas de inferencia en el AX8860 con SDK V0.5.1 y NPU de cuatro núcleos:

| Metrica | Resultado |
|---|---|
| Síntesis de un párrafo chino (27,2 s de audio) | 14,41 s (RTF 0,53) |
| Sin la primera conversión de pesos del vocoder | RTF 0,40; 32 ms por trama de 80 ms |
| Predictor de códigos (NPU) | 7,8 ms por trama |
| Decode del talker (NPU) | 8,1 ms por trama |
| Carga y conversión de pesos (una vez por proceso) | ~14 s (0,6B) / ~25 s (1,7B) |
| Codificación de la referencia (CPU) | ~10 s para una referencia de 22 s |
| Primera síntesis (conversión del vocoder) | ~3 s adicionales |

En cuanto a corrección, el autor declara que las frases de prueba en chino e inglés (decodificación voraz y muestreada, en ambos modos de clonación) transcritas con Qwen3-ASR coinciden literalmente con el texto de entrada.

## Requisitos de hardware

- Hardware objetivo: SoC Axera AX8860 con NPU de cuatro núcleos; SDK V0.5.0 o superior (las métricas se tomaron con V0.5.1).
- VRAM: no aplica; el modelo se ejecuta en la NPU del SoC con pesos convertidos en carga (talker y predictor en MXFP8, vocoder en BF16).
- GPU recomendadas: no disponible; el paquete está específicamente orientado a la NPU del AX8860 y no se documenta su ejecución en GPU de escritorio.
- GPU de consumo: no disponible; no se declara compatibilidad con RTX 4090 u otras GPU de consumo.
- Almacenamiento: el repositorio ocupa 5,1 GB (GGUF de 3,2 GB + 849 MB, más binarios y kernels).
- Despliegue: binario estático `bin/llama-tts` con `LD_LIBRARY_PATH=/opt/lib` y `GGML_AXERA_KERNEL_DIR=<repo>/kernels`; requiere `-ngl 99 -c 4096` y top-k máximo de 50. No se documenta soporte para vLLM, TGI, Ollama ni llama.cpp estándar sin la extensión ggml-axera.
- Latencia y throughput: RTF 0,40–0,53 en el hardware de referencia; 32 ms por trama de 80 ms de audio; la NPU queda ocupada en exclusiva durante la ejecución.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible. Cualitativamente, este paquete se distingue de una ejecución convencional de Qwen3-TTS-1.7B en que está atado a un SoC concreto (AX8860), impone contexto de 4096 tokens y top-k máximo de 50, y sustituye la pila CUDA/ROCm por kernels de NPU propios. Frente a otras alternativas de TTS de código abierto, no se aportan parámetros, contexto ni licencia comparables.

| Criterio | Qwen3-TTS-1.7B-AX8860 | Alternativas |
|---|---|---|
| Parámetros | 1,7B | no disponible |
| Contexto | 4096 tokens | no disponible |
| Licencia | no disponible | no disponible |
| Hardware | NPU Axera AX8860 (4 núcleos) | no disponible |

## Limitaciones y advertencias

- La NPU de cuatro núcleos queda ocupada en exclusiva durante la inferencia; no deben ejecutarse otros programas de NPU en paralelo.
- Contexto limitado a 4096 tokens y top-k máximo de 50, lo que restringe la longitud y el control de muestreo frente a la implementación completa.
- La decodificación voraz (`--temp 0`) genera habla demasiado larga y con pausas; el autor recomienda mantener el muestreo por defecto (temperature 0,9, top-k 50).
- Límite de 2000 tramas por invocación (aproximadamente 160 segundos de audio).
- La licencia no está declarada en la model card, por lo que no puede confirmarse el uso comercial; debe verificarse en el modelo base Qwen/Qwen3-TTS-12Hz-1.7B-Base antes de cualquier despliegue en producción.
- El repositorio no incluye audio de referencia; es necesario aportar una grabación propia de pocos segundos.
- En el modo ICL, la transcripción debe coincidir exactamente con el contenido de la grabación; de lo contrario, la fidelidad de la clonación se degrada.
- La codificación de la referencia se realiza en CPU y su coste crece con la duración (unos 10 s para 22 s de audio), lo que afecta a la latencia percibida en el primer uso.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de robustez multilingüe más allá de las pruebas de ida y vuelta con Qwen3-ASR en chino e inglés.
- El paquete está ligado a un SDK y un SoC concretos (AX8860, SDK V0.5.0+); no es portable a otras plataformas sin trabajo adicional.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AXERA-TECH/Qwen3-TTS-1.7B-AX8860-llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- llama.cpp con soporte Axera (rama `feat/qwen3-whole`, commit `b536fe5`): https://github.com/ZHEQIUSHUI/llama.cpp
- Kernels Axera DSL (rama `main`, commit `60dd25b`): https://github.com/ZHEQIUSHUI/ax-dsl-kernels
