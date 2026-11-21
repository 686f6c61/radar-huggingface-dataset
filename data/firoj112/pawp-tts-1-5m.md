# Firoj112/pawp-tts-1.5m

## Resumen

PAWP-TTS 1.5M es un modelo de síntesis de voz (text-to-speech) neuronal, ultracompacto y bilingüe, desarrollado por Firoj112 (Firoj Paudel). Su nombre responde a "Phoneme-Aware Weight Programming" y está diseñado para generar audio a 24 kHz de forma end-to-end, incluyendo el decodificador neuronal de forma de onda, a partir de un único checkpoint de tan solo 1.490.358 parámetros (5,98 MB en FP32). El modelo cubre inglés, nepalí y mezcla de código inglés-nepalí (devanagari y latín) en una sola red, sin necesidad de un modelo de lenguaje auxiliar en inferencia.

La propuesta técnica se apoya en tres pilares: una arquitectura ligera con bloques causales ConvNeXt1D y un decodificador iSTFT, un frontend lingüístico determinista (lexicón nepalí de Katmandú de 105.868 palabras, 76 reglas de heterónimos y un inventario fonológico unificado de 128 tokens) y un modo de streaming con lookahead acotado que reporta latencias de primer audio de milisegundos de un solo dígito. El modelo está pensado para despliegues en entornos con recursos muy limitados: CPU, dispositivos embebidos o servicios de voz de baja latencia.

Es relevante ahora porque demuestra que es posible obtener inteligibilidad competitiva (e incluso superior a la referencia humana en algunos conjuntos, según el autor) con un presupuesto de parámetros tres órdenes de magnitud inferior al de los TTS neuronales convencionales, y porque aborda de forma explícita la fonología nepalí nativa y el code-mixing, dos áreas poco cubiertas por los modelos multilingües de gran escala. La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS neuronal con encoder acústico, predictor de duración/tono/voicing/energía y decodificador neuronal ConvNeXt1D + iSTFT |
| Parametros totales | 1.490.358 (5,98 MB FP32; ~2,98 MB FP16; ~1,49 MB INT8) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo TTS, no de lenguaje; procesa texto por frases) |
| Tipos de cuantizacion | FP32, FP16 e INT8 (tamaños reportados por el autor); exportación ONNX |
| Idiomas soportados | Inglés (en), nepalí (ne) y mezcla de código inglés-nepalí |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors) y ONNX |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de TTS neuronal compacta con un frontend lingüístico determinista y un backend acústico neuronal. El texto se convierte primero en fonemas mediante un lexicón nepalí de Katmandú (105.868 palabras), 76 reglas de heterónimos contextuales (152 lecturas) y un inventario fonológico unificado de 128 tokens que cubre inglés, nepalí y code-mixing. Sobre esa secuencia fonémica, la red predice duración, tono (pitch), voicing y energía, y un decodificador neuronal compuesto por bloques causales ConvNeXt1D más una iSTFT genera la forma de onda PCM a 24 kHz. Los bloques causales con lookahead acotado permiten streaming con latencia de primer audio de milisegundos de un solo dígito.

El checkpoint publicado corresponde a un fine-tune sobre una voz objetivo (paso 20k) a partir de un modelo base preentrenado (paso 92k). El autor reporta 1.293.750 parámetros de cómputo efectivo (~106,1 MMAC/s) frente a 1.490.390 parámetros totales almacenados. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables habitualmente a TTS). La innovación destacable es la separación de las reglas de pronunciación fuera de los pesos neuronales, lo que reduce el tamaño del modelo y hace la fonología auditable y determinista.

## Capacidades

- Síntesis de voz bilingüe en un único checkpoint: inglés puro, nepalí puro (estándar de Katmandú) y mezcla de código intra-frase devanagari-latín con identidad de voz única y sin cambio de timbre en las fronteras de idioma.
- Fonología nepalí nativa: preserva contrastes laríngeos cuádruples en oclusivas, distinción dental/retroflexa, africadas alveolares (/ts, tsʰ, dz, dzʱ/), geminación consonántica y la fusión nativa de sibilantes alveolares (स/श/ष -> /s/) con 0 % de contaminación del /ʃ/ hindi.
- Salida de audio a 24 kHz PCM end-to-end, incluyendo el decodificador neuronal de forma de onda.
- Streaming con lookahead acotado: TTFA de milisegundos de un solo dígito en CPU y GPU.
- Frontend determinista: lexicón de 105.868 palabras, 76 reglas de heterónimos y 0 % de tasa de tokens fuera de vocabulario (<unk>) en los conjuntos evaluados.
- Voz única (single-speaker) con embedding de hablante; no se documenta soporte multi-hablante ni clonación de voz.
- No se documenta soporte de tool calling, agentes, visión ni audio de entrada; es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz de baja latencia en producción: el modo streaming con TTFA de ~1,1 ms (p50) en CPU y RTFx de 173x permite respuestas habladas casi instantáneas en atención al cliente o interfaces conversacionales, sin GPU dedicada.
- Aplicaciones para el mercado nepalí: lectura de noticias, audiolibros y avisos públicos en nepalí estándar de Katmandú, con pronunciación nativa verificada (100 % en 300 frases de validación del frontend).
- Sistemas bilingües inglés-nepalí con code-mixing: interfaces de voz para usuarios que mezclan ambos idiomas en una misma frase (por ejemplo, términos técnicos en inglés dentro de una oración en nepalí), sin cambio de timbre entre idiomas.
- Despliegue en dispositivos embebidos y edge: con 5,98 MB en FP32 y ~1,49 MB en INT8, cabe en microcontroladores de gama alta, routers o teléfonos de gama baja; la exportación ONNX permite ejecución con ONNX Runtime en CPU.
- Accesibilidad: lectores de pantalla y sistemas de asistencia para personas con discapacidad visual en nepalí e inglés, ejecutándose localmente sin conexión a la nube.
- Generación de audio para pipelines de datos: creación de corpus de voz sintética a 24 kHz para entrenamiento de ASR o para pruebas de sistemas de reconocimiento de voz en nepalí e inglés.
- Integración en aplicaciones web o móviles offline: al ser Apache 2.0 y compacto, puede embeberse en apps que requieran TTS sin dependencia de servicios externos.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente) en el conjunto "Held-Out Bilingual Evaluation Suite" (30 frases en inglés, 30 en nepalí, 9 en code-mixed), medidos mediante un pipeline ASR independiente:

| Modelo / checkpoint | Inglés WER / CER | Nepalí WER / CER | Code-mixed WER / CER |
|---|---|---|---|
| Referencia humana (estudio) | 2,63 % / 0,75 % | 11,60 % / 3,82 % | 25,91 % / 12,88 % |
| PAWP-1.5M base (paso 92k) | 3,14 % / 1,01 % | 12,02 % / 3,12 % | 16,18 % / 11,02 % |
| PAWP-1.5M voz objetivo (esta versión) | 5,03 % / 2,28 % | 9,93 % / 1,97 % | 11,99 % / 4,92 % |

Verificación fonológica:

| Prueba | Resultado | Notas |
|---|---|---|
| Pares mínimos NepTTS-Bench (77 pares) | 100,0 % (77/77) | Secuencias de fonemas distintas y salidas mel no silenciosas |
| Tasa de contaminación /ʃ/ hindi | 0,0 % | Preservación estricta de /s/ alveolar de Katmandú |
| Tasa de tokens fuera de vocabulario | 0,0 % | En EN, NE, code-mix y NepTTS |
| Validación del frontend (300 frases nativas) | 100,0 % (300/300) | G2P determinista verificado |

Latencia de streaming (gráfico de inferencia plegado, primer chunk de 60,0 ms, 3 utterances de calentamiento descartadas, 30 medidas):

| Backend | Hardware | TTFA (p50 / p95 / p99) | RTFx / RTF |
|---|---|---|---|
| ONNX Runtime (CPU, plegado) | CPU (4 hilos) | 1,11 / 1,42 / 1,52 ms | 173,36x (0,0058) |
| PyTorch (CPU, plegado) | CPU (4 hilos) | No disponible en el extracto | No disponible en el extracto |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todos los formatos; el checkpoint FP32 ocupa 5,98 MB, FP16 ~2,98 MB e INT8 ~1,49 MB, más el overhead del runtime. Cabe en cualquier GPU consumer e incluso en memoria compartida de CPU.
- GPU recomendadas: cualquier GPU moderna (RTX 3060 o superior, A100, H100) funciona con holgura; el modelo está optimizado para CPU y no requiere GPU para latencias bajas.
- Cabe en consumer GPU: sí, en todas las GPU consumer actuales e incluso en iGPU y dispositivos embebidos.
- Opciones de despliegue: ONNX Runtime (backend recomendado, con gráfico plegado), PyTorch nativo, y exportación a otros runtimes compatibles con ONNX. No se documenta soporte específico de vLLM, llama.cpp o TGI (no aplicables a un TTS de este tamaño).
- Latencia y throughput: TTFA p50 de 1,11 ms y p99 de 1,52 ms en CPU de 4 hilos con ONNX Runtime; RTFx de 173,36x (RTF 0,0058), es decir, genera audio ~173 veces más rápido que tiempo real en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas por checkpoint | Code-mixing | WER nepalí (ASR) | Frecuencia de muestreo |
|---|---|---|---|---|---|
| PAWP-1.5M | 1.490.390 (5,98 MB FP32) | Inglés + nepalí unificados | Sí | 9,93 % | 24,0 kHz |
| Ampixa sanoTTS Nepali | 1.470.000 | Solo nepalí (checkpoint por idioma) | No | No reportado | 24,0 kHz |
| Ampixa real-nepali-v0.2-kala (VITS) | 19.440.000 (74,1 MB FP32) | Solo nepalí | No | No reportado | 22,05 kHz |

Frente a sanoTTS, PAWP-1.5M ofrece un tamaño comparable pero añade inglés y code-mixing en un único checkpoint, con WER nepalí reportado de 9,93 %. Frente a la VITS nepalí de Ampixa, PAWP-1.5M es ~13 veces más pequeño y genera a mayor frecuencia de muestreo, aunque no se dispone de métricas comparables de esta última. No se dispone de comparación con modelos TTS multilingües de gran escala (XTTS, MMS, etc.) en la información proporcionada.

## Limitaciones y advertencias

- Modelo de un solo hablante: no soporta multi-hablante ni clonación de voz; la identidad de voz está fijada por el checkpoint.
- Solo dos idiomas: inglés y nepalí (y su mezcla). No cubre otros idiomas ni acentos regionales del nepalí distintos del estándar de Katmandú.
- Benchmarks declarados por el autor y no verificados de forma independiente (campo `verified: false` en el model-index); los conjuntos de evaluación son pequeños (30 + 30 + 9 frases), lo que limita la significación estadística.
- El WER en inglés de esta versión (5,03 %) es peor que el del modelo base (3,14 %) y que la referencia humana (2,63 %), lo que sugiere un compromiso del fine-tune hacia la voz objetivo.
- Riesgo de alucinación o artefactos acústicos en entradas fuera de dominio (nombres propios, siglas, texto no cubierto por el lexicón), aunque el autor reporta 0 % de tokens `<unk>` en sus conjuntos.
- El frontend determinista depende del lexicón y las reglas incluidas; palabras nuevas o préstamos recientes pueden requerir actualización del lexicón o caer en reglas de respaldo.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene revisar las condiciones de los datos de entrenamiento y de la voz objetivo, no detalladas en la información disponible.
- Sin datos publicados sobre sesgos de género, edad o dialecto en la voz generada; la calidad percibida (naturalidad, prosodia) no se cuantifica con métricas MOS en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Firoj112/pawp-tts-1.5m
- Repositorio de código y arquitectura: https://github.com/Firojpaudel/PAWP_TTS
- Muestra de audio en nepalí: https://huggingface.co/Firoj112/pawp-tts-1.5m/resolve/main/sample_ne.wav
- Muestra de audio en inglés: https://huggingface.co/Firoj112/pawp-tts-1.5m/resolve/main/sample_en.wav
- Muestra de audio code-mixed: https://huggingface.co/Firoj112/pawp-tts-1.5m/resolve/main/sample_codemix.wav
