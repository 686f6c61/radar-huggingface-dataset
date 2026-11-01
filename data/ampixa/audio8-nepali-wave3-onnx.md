# ampixa/audio8-nepali-wave3-onnx

## Resumen

Audio8 Nepali Wave 3 ONNX es un modelo de síntesis de voz (text-to-speech) con capacidad de clonación de voz zero-shot, especializado en nepalí y empaquetado para ejecutarse en CPU mediante ONNX Runtime sin dependencia de PyTorch. Lo publica Ampixa Labs como derivado del modelo base Audio8/Audio8-TTS-Preview-0.1b, desarrollado por Audio8, y constituye el checkpoint que la aplicación de escritorio Astadhwani descarga en su primer arranque.

El modelo parte de una arquitectura de aproximadamente 0.1B parámetros con dos etapas autorregresivas (slow AR y fast AR) más un códec de audio, y ha sido afinado sobre unas 575 horas adicionales de nepalí conversacional procedente de YouTube, sumadas a las 318,8 horas de la primera ola de entrenamiento con 1.327 hablantes. La versión publicada aquí es una cuantización INT8 de los grafos oficiales de Audio8, con los pesos del checkpoint nepalí sustituidos dentro de dichos grafos, manteniendo el códec y el tokenizador sin cambios.

Su relevancia práctica radica en que permite clonación de voz en nepalí sobre CPU con un paquete de 0,9 GB, algo poco habitual en esta categoría, donde la mayoría de alternativas exigen GPU y frameworks pesados. La licencia es restrictiva (Audio8 Community License v1.0), con uso comercial limitado a entidades por debajo de 2 millones de dólares de facturación anual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TTS autorregresivo en dos etapas (slow AR + fast AR) con códec de audio; grafos ONNX con constantes Mamba plegadas |
| Parámetros totales | aproximadamente 0.1B (modelo base Audio8-TTS-Preview-0.1b) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 (lineales simétricas por canal de salida, embeddings uint8 por tensor), FP16 (códec), FP32 (normas y sesgos) |
| Idiomas soportados | nepalí (ne) |
| Licencia | Audio8 Community License v1.0 (uso no comercial libre; comercial para entidades con facturación anual inferior a 2 M USD) |
| Formato de pesos | ONNX (`slow_ar_int8.onnx`, `fast_ar_int8.onnx`, `codec_decoder_fp16.onnx`, `registration/codec_encoder_fp16.onnx`) con ficheros `.data` asociados |

## Arquitectura y entrenamiento

El modelo sigue el diseño del base Audio8-TTS-Preview-0.1b: un generador autorregresivo dividido en una etapa lenta (slow AR) que produce tokens semánticos y una etapa rápida (fast AR) que genera tokens acústicos, seguido de un decodificador de códec que reconstruye la forma de onda. Los grafos ONNX incorporan constantes Mamba plegadas, lo que sugiere el uso de capas de espacio de estados en alguna parte del generador. La conversión a ONNX no incluye exportador propio: se reutilizan los grafos de la release oficial INT8 de 0.1B y se sustituyen 901 inicializadores, con lineales en int8 simétrico por canal, embeddings en uint8 por tensor y normas, sesgos de convolución y constantes Mamba plegadas en coma flotante. Aplicando el mismo procedimiento a los pesos oficiales del base se reproducen los 901 inicializadores publicados de forma bit-exacta, lo que valida la metodología de conversión.

El entrenamiento se organizó en tres olas: la primera consistió en un fine-tune completo del base sobre 318,8 horas de nepalí conversacional de YouTube con 1.327 hablantes; las olas 2 y 3 continuaron el entrenamiento sobre unas 575 horas adicionales, con las frases y voces de benchmark filtradas para evitar contaminación. El modelo hermano `ampixa/audio8-nepali-dpo-onnx` incorpora ajuste por preferencias (DPO) y obtiene mejor CER y coincidencia de voz a costa de peor naturalidad subjetiva. La paridad frente a PyTorch fp32 con prompts idénticos (3 frases en nepalí, 60 pasos) alcanza correlación de logits semánticos de 0,9950 y acústicos de 0,9999, con acuerdos greedy top-1 del 98,9 % y 79,5 % respectivamente.

## Capacidades

- Síntesis de voz en nepalí a partir de texto en devanagari, con normalización previa de números y palabras en inglés mediante el frontend Swar (`frontend.normalize`, licencia MIT).
- Clonación de voz zero-shot: el modelo acepta una muestra de referencia del hablante para imitar su timbre, sin necesidad de reentrenamiento.
- Inferencia en CPU mediante ONNX Runtime, sin PyTorch ni CUDA.
- Generación de la frase completa en una sola pasada, con parámetros de muestreo recomendados de temperatura 0,8, top-p 0,95 y top-k 50.
- Registro de voz (registration) mediante el codificador de códec incluido en `registration/codec_encoder_fp16.onnx`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá de la muestra de referencia para clonación.

## Casos de uso

- **Aplicaciones de escritorio de accesibilidad para nepalí**: integración directa en apps como Astadhwani, que descarga el modelo en el primer arranque y sintetiza texto en local sin conexión, aprovechando el empaquetado ONNX de 0,9 GB y la ejecución en CPU.
- **Lectura de contenido y noticias en nepalí**: conversión de artículos, documentos o mensajes a voz con un frontend que expande números y términos en inglés a devanagari, adecuado para usuarios con dificultades de lectura o para consumo en movilidad.
- **Locución de bajo coste para vídeo y pódcast**: generación de narraciones en nepalí con una voz de referencia propia, sin infraestructura GPU, para creadores que necesitan volumen y no pueden asumir servicios cloud por minuto.
- **Clonación de voz consentida para conservación de identidad**: reproducción de la voz de un hablante con su consentimiento explícito en audiolibros, mensajes personalizados o archivos familiares, usando el codificador de registro incluido.
- **Sistemas de respuesta por voz en kioscos y terminales sin GPU**: despliegue en hardware de gama baja o dispositivos embebidos donde el coste energético y la ausencia de acelerador gráfico son restrictivos.
- **Investigación en TTS de bajos recursos**: punto de partida reproducible para experimentos de cuantización, evaluación de naturalidad (SCOREQ, UTMOS) y comparación con el hermano ajustado por DPO, gracias a los checksums publicados en `SHA256SUMS`.
- **Prototipado de asistentes conversacionales en nepalí**: combinación con un LLM externo para generar el texto y este modelo para la locución, en entornos de demo o pruebas internas donde la licencia no comercial es suficiente.

## Benchmarks y rendimiento

Resultados internos del autor sobre el checkpoint PyTorch fp32, con los ajustes recomendados, semilla 0 y una sola toma. Son métricas automáticas sin prueba de escucha; los valores son medias con intervalos de confianza bootstrap del 95 % en el informe original.

| Condición | CER medio % | SCOREQ | Coincidencia de voz | UTMOS |
|---|---|---|---|---|
| NepTTS-Bench, enrollment FLEURS (205) | 32,51 | 3,26 | — | — |
| NepTTS-Bench, enrollment Rasa (205) | 17,78 | 4,37 | — | — |
| Nepali Voice Cloning Benchmark, limpio (82) | 17,55 (corpus 19,69) | 3,46 | 0,423 | 3,24 |

Comparativas bajo el mismo harness:

| Modelo o variante | CER clonación % | Coincidencia de voz | UTMOS | SCOREQ FLEURS |
|---|---|---|---|---|
| Este checkpoint (wave 3) | 17,55 | 0,423 | 3,24 | 3,26 |
| DPO ronda 2 (hermano) | 9,22 | 0,529 | 2,97 | 2,33 |
| Swar (NFE16) | 5,50 | 0,687 | 2,67 | 2,46 |

Paridad de conversión frente a PyTorch fp32 (3 frases en nepalí, 60 pasos):

| Métrica | Base oficial: PyTorch vs INT8 oficial | Este checkpoint: PyTorch vs grafos INT8 |
|---|---|---|
| Correlación de logits semánticos | 0,9970 | 0,9950 |
| Acuerdo greedy top-1 semántico | 85,0 % | 98,9 % |
| Correlación de logits acústicos | 0,9975 | 0,9999 |
| Acuerdo greedy top-1 acústico | 75,7 % | 79,5 % |

## Requisitos de hardware

- Inferencia en CPU por diseño: el paquete ONNX Runtime de 0.1B INT8 está pensado para ejecutarse sin GPU; el repo ocupa 0,9 GB, por lo que el pico de memoria RAM queda en el entorno de 1 a 2 GB, aunque el autor no publica cifras exactas.
- GPU no necesaria; no se documentan requisitos de VRAM ni aceleración CUDA, ROCm o Metal para estos grafos.
- Compatible con hardware de consumo por construcción (portátiles y equipos de escritorio sin GPU dedicada); no se especifican modelos concretos de CPU.
- Despliegue mediante ONNX Runtime con el runtime oficial de 0.1B INT8 de Audio8 (`onnx_runtime_0_1b_int8`); no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Contexto | CER clonación % | Licencia | Formato |
|---|---|---|---|---|---|---|
| Este modelo (wave 3 ONNX) | ~0.1B | nepalí | no disponible | 17,55 | Audio8 Community v1.0 | ONNX INT8/FP16 |
| `ampixa/audio8-nepali-dpo-onnx` | ~0.1B | nepalí | no disponible | 9,22 | Audio8 Community v1.0 | ONNX |
| Swar (NFE16) | no disponible | nepalí | no disponible | 5,50 | no disponible | no disponible |
| Audio8-TTS-Preview-0.1b (base) | ~0.1B | multilingüe, según release | no disponible | no disponible | Audio8 Community v1.0 | PyTorch, ONNX |

El hermano DPO mejora la fidelidad de contenido y la coincidencia de voz, pero empeora la naturalidad (UTMOS 2,97 frente a 3,24). Swar obtiene el mejor CER y la mejor coincidencia de voz, aunque con UTMOS inferior (2,67). La comparación con alternativas de otros ecosistemas (XTTS, Bark, F5-TTS) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- **Consentimiento**: los hablantes del corpus de entrenamiento no dieron consentimiento individual para la clonación de su voz; el autor prohíbe explícitamente imitar a personas reales sin su permiso.
- **Licencia restrictiva**: el uso comercial solo se permite a entidades con facturación anual inferior a 2 M USD; la redistribución exige conservar la licencia y acreditar a Audio8. Revisar el texto completo en `LICENSE` antes de producción.
- **Calidad limitada**: CER de 17,55 % en clonación limpia y de 32,51 % con enrollment FLEURS, con SCOREQ de 3,26 y UTMOS de 3,24; son valores por debajo de los de Swar en fidelidad de contenido.
- **Solo nepalí**: el modelo está afinado exclusivamente para `ne`; no se garantiza comportamiento en otros idiomas.
- **Riesgo de alucinación acústica**: como todo TTS autorregresivo, puede producir prosodia errática, omisiones o artefactos; el autor recomienda una sola generación sin troceado ni reintentos.
- **Dependencia del frontend**: los resultados de benchmark usan el normalizador Swar; sin él, los números y palabras en inglés pueden pronunciarse mal.
- **Procedencia opaca del checkpoint**: los pesos en precisión completa no se publican, solo el sha256 del checkpoint fuente; la reproducibilidad completa no es posible.
- **Datos de entrenamiento de YouTube**: parte del material se usó bajo un memorando de entendimiento con los canales, lo que puede condicionar la redistribución en determinadas jurisdicciones.
- **Sin métricas de latencia**: no hay datos publicados de rendimiento en tiempo real ni de throughput en CPU concretas.
- **Uso responsable**: el autor exige no generar contenido engañoso y divulgar que la voz es sintética cuando la normativa lo requiera.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ampixa/audio8-nepali-wave3-onnx
- Modelo hermano con DPO: https://huggingface.co/ampixa/audio8-nepali-dpo-onnx
- Modelo base: https://huggingface.co/Audio8/Audio8-TTS-Preview-0.1b
- Release oficial ONNX INT8 de referencia: https://huggingface.co/Edge0/audio8-TTS-0.1B-ONNX-INT8
- Runtime ONNX 0.1B INT8: https://github.com/Audio8-AI/Audio8_TTS/tree/master/onnx_runtime_0_1b_int8
- Aplicación Astadhwani: https://github.com/Ampixa/astadhwani
- Frontend de normalización Swar: https://github.com/Naamche-Labs/swar
