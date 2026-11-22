# batteryphil/VAULT-PRIMAL-Tiny-Voca-4.5M

## Resumen

VAULT-PRIMAL-Tiny-Voca-4.5M es una versión cuantizada del modelo de síntesis de voz n4ze3m/tiny-voca, publicada por el usuario batteryphil. El modelo original es un TTS neuronal en inglés que opera a 24 kHz y que, en su versión FP32 de referencia, ocupa 18,15 MB. Esta ficha distribuye dos checkpoints comprimidos: uno de 2,64 MB en 4 bits (variante `p4_0`, recomendada) y otro de 1,38 MB en 2 bits (variante `q2_0`), ambos empaquetados en safetensors genuinos sin ficheros pickle.

La propuesta técnica se centra en la compresión agresiva mediante cuantización post-entrenamiento (PTQ) con codebooks no uniformes: un LUT armónico de 16 entradas para la variante de 4 bits y una corrección discreta denominada PRIMAL para la de 2 bits. El autor reporta que la variante de 4 bits iguala el WER de Whisper del modelo FP32 (3,95 %) y supera al baseline Q4_0 uniforme en convergencia espectral STFT, mientras que la variante de 2 bits recupera el WER del FP32 tras aplicar 706 inversiones enteras PRIMAL.

Es relevante para despliegues en el extremo (edge AI) y entornos con restricciones severas de almacenamiento, donde un sintetizador completo de 24 kHz cabe en menos de 3 MB y se ejecuta en PyTorch estándar sobre CUDA, ROCm, Apple Silicon (mps) y CPU sin kernels personalizados. La licencia es propietaria y limita el uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer micro con RoPE (encoder/decoder), predictores de duración/prosodia y predictores cepstrales armónicos/de ruido |
| Parámetros totales | 4,5 M (según el nombre del modelo); no disponible el desglose exacto |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits (`V3_P4_0`, LUT armónico de 16 entradas, 4,50 bpw), 2 bits (`V3_Q2_0` + PRIMAL, 2,44 bpw efectivos) |
| Idiomas soportados | en (inglés) |
| Licencia | `bartsch-personal-free-5pct-commercial` (propietaria, uso personal gratuito y comercial limitado) |
| Formato de pesos | safetensors (bit-packed, sin pickle) |

## Arquitectura y entrenamiento

El modelo base n4ze3m/tiny-voca es un sintetizador neuronal de texto a voz de muy baja escala (4,5 M de parámetros) que combina un encoder/decoder transformer micro con RoPE, predictores de duración y prosodia, y predictores cepstrales para componentes armónicos y de ruido. Genera audio a 24 kHz en inglés. La información disponible no detalla el volumen de datos de entrenamiento, la composición del corpus ni si se aplicaron etapas de RLHF o DPO.

La innovación de esta ficha reside en el pipeline de compresión. La cuantización cubre el 98,6 % de los parámetros elegibles (capas `nn.Linear`, `nn.Conv1d` y `nn.ConvTranspose1d`), dejando las cabezas escalares y cepstrales de salida (menos de 4.096 parámetros) en FP16. La variante `V3_P4_0` emplea un codebook no uniforme con escala con signo de 16 entradas y refinamiento de escala Lloyd-Max por bloques de 32, concentrando resolución cerca de cero sin recortar valores atípicos. La variante `V3_Q2_0` parte de una PTQ de 2 bits y aplica PRIMAL, una corrección de 706 inversiones enteras discretas que reduce el WER de 5,08 % a 3,95 %. No se mencionan decodificación especulativa ni mecanismos de atención lineal.

## Capacidades

- Síntesis de voz neuronal en inglés a 24 kHz con dos voces predefinidas: F2 (femenina) y M2 (masculina).
- Control de velocidad de habla mediante el parámetro `speed`.
- Generación de audio en formato WAV mediante CLI (`infer.py`) o API Python de cuatro líneas (`vault_tts.load_tiny_voca`).
- Inferencia multiplataforma en PyTorch estándar: NVIDIA CUDA, AMD ROCm, Apple Silicon (mps) y CPU.
- Carga directa desde Hugging Face sin clonar el repositorio ni descargar el checkpoint FP32 de 18,15 MB.
- No se documentan tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio de entrada ni modo thinking.

## Casos de uso

- Síntesis de voz en dispositivos embebidos: el checkpoint de 2 bits (1,38 MB) permite integrar un TTS completo de 24 kHz en microcontroladores o sistemas con almacenamiento limitado, ejecutándose en CPU sin kernels personalizados.
- Aplicaciones móviles offline: la variante de 4 bits (2,64 MB) cabe holgadamente en el binario de una app iOS o Android y permite generar voz sin conexión ni servicios en la nube.
- Sistemas de accesibilidad: lectura de texto en voz alta para usuarios con discapacidad visual en hardware de bajo coste, con latencia reducida gracias a las 113,9x de velocidad en tiempo real reportadas para `p4_0`.
- Asistentes de voz locales en el hogar: respuestas habladas en dispositivos tipo Raspberry Pi o similares, donde el tamaño del modelo y la ejecución en CPU son determinantes.
- Prototipado rápido de interfaces de voz: la API de cuatro líneas y la descarga automática desde Hugging Face permiten integrar TTS en demos y pruebas de concepto en minutos.
- Juguetes y dispositivos interactivos: síntesis de voz embebida en productos con memoria flash muy limitada, donde la variante de 2 bits ofrece una huella de 1,38 MB.
- Pruebas de compresión de modelos: referencia práctica para investigar PTQ extrema y técnicas de corrección discreta (PRIMAL) sobre modelos de audio.

## Benchmarks y rendimiento

Evaluación del autor sobre 12 prompts hablados retenidos (177 palabras, sin solapamiento con las 24 frases de calibración), usando ASR de ida y vuelta con `openai/whisper-small.en` y distorsión espectral Log-Mel de 80 bandas alineada por DTW.

| Variante | Tamaño | bpw ef. | WER Whisper | CER Whisper | Dist. Log-Mel (dB) | Conv. espectral STFT | Velocidad (x RT) |
|---|---|---|---|---|---|---|---|
| FP32 upstream | 18,15 MB | 32,00 | 3,95 % | 3,69 % | 0,000 | 0,0000 | 4,4x (en frío) |
| Q4_0 uniforme | 2,64 MB | 4,66 | 3,95 % | 3,69 % | 2,660 | 0,7328 | 57,3x |
| `V3_P4_0` | 2,64 MB | 4,66 | 3,95 % | 3,69 % | 3,379 | 0,6984 | 113,9x |
| `V3_Q2_0` sin PRIMAL | 1,38 MB | 2,44 | 5,08 % | 3,78 % | 6,199 | 1,1735 | 51,4x |
| `V3_Q2_0` + PRIMAL | 1,38 MB | 2,44 | 3,95 % | 3,69 % | 5,663 | 0,9948 | 55,5x |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todos los casos; los pesos ocupan 2,64 MB (4 bits) o 1,38 MB (2 bits), por lo que el consumo lo dominan el runtime de PyTorch y los buffers de audio.
- GPU recomendadas: cualquier GPU compatible con PyTorch; el modelo funciona en CUDA (NVIDIA), ROCm (AMD) y mps (Apple Silicon).
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o superior; también en CPU sin GPU dedicada.
- Opciones de despliegue: script `infer.py` incluido, API Python `vault_tts`, y PyTorch estándar. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: 113,9x tiempo real para `p4_0` y 55,5x para `q2_0` según el autor; el FP32 de referencia reporta 4,4x en frío.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VAULT-PRIMAL-Tiny-Voca-4.5M (`p4_0`) | 4,5 M | 2,64 MB | no disponible | Propietaria (`bartsch-personal-free-5pct-commercial`) | Hugging Face |
| VAULT-PRIMAL-Tiny-Voca-4.5M (`q2_0`) | 4,5 M | 1,38 MB | no disponible | Propietaria | Hugging Face |
| n4ze3m/tiny-voca (FP32) | 4,5 M | 18,15 MB | no disponible | no disponible | Hugging Face |
| Q4_0 uniforme (baseline del autor) | 4,5 M | 2,64 MB | no disponible | no disponible | Referencia interna del autor |

No se dispone de datos de benchmarks comparativos con otros modelos TTS de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües documentadas.
- Dos voces fijas (F2 y M2); no se documenta clonación de voz ni control de estilo.
- Riesgo de alucinación y artefactos de pronunciación inherente a un modelo de 4,5 M de parámetros; el autor reporta un WER de Whisper del 3,95 % en su conjunto de evaluación, pero no hay garantías fuera de ese dominio.
- La licencia `bartsch-personal-free-5pct-commercial` es propietaria: uso personal gratuito y uso comercial limitado al 5 %, según el nombre de la licencia; es imprescindible revisar el fichero LICENSE antes de cualquier despliegue en producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 22 de noviembre de 2026; no hay validación independiente de los resultados reportados.
- El repositorio tiene un tamaño de 0,0 GB según los metadatos de Hugging Face, lo que puede indicar que los pesos no están completamente subidos o que el tamaño reportado no refleja el contenido real.
- No se documentan sesgos específicos del modelo base ni del proceso de cuantización.
- La variante de 2 bits presenta mayor distorsión espectral (5,663 dB frente a 3,379 dB de la de 4 bits), lo que puede traducirse en artefactos audibles pese a igualar el WER.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/batteryphil/VAULT-PRIMAL-Tiny-Voca-4.5M
- Modelo base: https://huggingface.co/n4ze3m/tiny-voca
- Muestras de audio: https://huggingface.co/batteryphil/VAULT-PRIMAL-Tiny-Voca-4.5M/tree/main/samples
- Licencia: https://huggingface.co/batteryphil/VAULT-PRIMAL-Tiny-Voca-4.5M/blob/main/LICENSE
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
