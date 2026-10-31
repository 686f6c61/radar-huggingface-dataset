# groxaxo/Ming-3.0-tts-0.5B-MLX-oQ4-HQ6Speech-G64

## Resumen

Ming-3.0-tts-0.5B-MLX-oQ4-HQ6Speech-G64 es una conversión cuantizada, creada por el usuario groxaxo, del modelo de síntesis de voz inclusionAI/Ming-3.0-tts-0.5B. Se trata de un modelo text-to-speech (TTS) ligero, de unos 0,5 mil millones de parámetros en su versión original, adaptado al ecosistema MLX de Apple para ejecutarse de forma local en Macs con Apple Silicon. El objetivo del autor es ofrecer una versión compacta y eficiente que mantenga la calidad de la voz mediante una asignación de precisión mixta específica para audio.

La particularidad de esta conversión es su esquema de cuantización "oQ4 con codec de voz protegido a oQ6": el backbone de texto se comprime agresivamente (4-5 bits), mientras que el codificador y decodificador de audio se conservan a 6 bits o superior para preservar la fidelidad de la forma de onda. El payload almacenado promedia 6,564 bits por parámetro fuente, ocupando 1,214 GB el archivo de pesos.

Es relevante porque permite ejecutar un TTS multilingüe (inglés, chino, alemán, español, francés, coreano y japonés) en hardware de consumo de Apple con una asignación de memoria pico de solo 1,83 GB durante la inferencia, con un RTF medido de aproximadamente 0,35 (más rápido que tiempo real).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer TTS con codec de audio (encoder-decoder), runtime denso mlx-audio |
| Parametros totales | 1.479.454.868 (dato real de safetensors, incluye componentes de audio) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oMLX mixto: 78 matrices a 4 bits, 160 a 5 bits, 293 a 6 bits, 98 a 8 bits (629 cuantizadas); 551 tensores en BF16; group size 64; payload medio de 6,564 bits/parametro |
| Idiomas soportados | en, zh, de, es, fr, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors (formato MLX/oMLX), 1,214 GB de pesos, 1,2 GB de repo |

## Arquitectura y entrenamiento

El modelo base es inclusionAI/Ming-3.0-tts-0.5B, un modelo de texto a voz basado en transformer con un backbone de texto, un flow head y un agregador, más un codec de audio con encoder y decoder. Esta conversión parte de un export BF16 estricto de MLX Audio del checkpoint revision `8d66b70a00f05ad183fa8a863b4ce609fc83cbc0` y aplica el cuantizador oMLX (commit `70f44cfd652d2013dc0f9776dca7518e32101b00`) con un adaptador específico para voz, distinto del planificador de presupuesto estándar para texto.

La asignación de precisión se obtuvo mediante calibración con cuatro frases en inglés y español, capturando entradas reales de las capas lineales BF16 y evaluando clipping ponderado por importancia de activación con MSE relativa de salida para cada proyección del transformer en 4, 5, 6 y 8 bits. Se preservan exactamente en BF16 los heads de hablante y parada, normas, sesgos, parámetros rotatorios y embeddings pequeños; la tabla de embeddings de texto (atada a la salida) queda a 8 bits, y el encoder y decoder de audio conservan la asignación oQ6 calibrada con promociones a 8 bits. Las iteraciones iniciales a oQ5/oQ4 producían discrepancias en ASR en español que se resolvieron protegiendo el encoder de referencia. Sobre el entrenamiento del modelo base original (tokens, datasets, RLHF) no hay datos disponibles en la información proporcionada.

## Capacidades

- Sintesis de texto a voz (TTS) local en siete idiomas: inglés, chino, alemán, español, francés, coreano y japonés.
- Condicionamiento por voz de referencia: acepta `ref_audio` y `ref_text` para clonar o condicionar el timbre, con `lang_code="es"` para español.
- Soporte de embeddings de hablante precalculados de 192 valores (CAM++), pasables como `spk_emb` (la extracción automática no está implementada en el runtime denso de MLX Audio).
- Voces predefinidas (por ejemplo, `US_Emma`).
- Generación con control de longitud vía `max_tokens` y semilla reproducible.
- No es un modelo de texto general: no ofrece razonamiento, código, ni tool calling; su pipeline es exclusivamente text-to-speech.

## Casos de uso

- Narracion de audiolibros y articulos en espanol: dado su soporte nativo de español y condicionamiento por audio de referencia, puede generar locuciones largas a partir de texto escrito con un timbre consistente.
- Asistentes de voz locales y privados: al ejecutarse íntegramente en Apple Silicon con 1,83 GB de asignación pico, es adecuado para integraciones on-device donde no se desee enviar audio a la nube.
- Prototipado rapido de agentes hablantes: con un RTF de ~0,35 en un Apple M5, la síntesis es más rápida que el tiempo real, lo que permite pipelines conversacionales con baja latencia.
- Generacion de voz multilingue para contenido educativo: soporta siete idiomas, útil para producir material didáctico en varias lenguas desde un único modelo.
- Pruebas de accesibilidad: generación de audio para lectores de texto en aplicaciones macOS o iOS desarrolladas con MLX.
- Validacion de pipelines de TTS cuantizados: el repo incluye informes de auditoría (`quantization-report.json`, `validation.json`, `SHA256SUMS`), lo que lo hace idóneo como referencia para estudiar cuantización mixta específica de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) al no ser aplicables a un modelo TTS. Los datos de validación medidos por el autor son:

| Lenguaje | Frases estandar | RTF | Pico de asignacion MLX | Frases nuevas con coincidencia ASR |
|---|---:|---:|---:|---:|
| Ingles | 5/5 coincidencias ASR | 0,361 | 1,83 GB | 3/3 |
| Espanol | 5/5 coincidencias ASR | 0,352 | 1,83 GB | 3/3 |

Adicionalmente, el decoder del codec protegido midió 36,98 dB de SNR y correlación 0,999901 frente a BF16 sobre cuatro segundos de voz (comparación de latentes idénticos). Hardware de validación: Apple M5 con 24 GiB de memoria unificada, macOS 27.0.1, MLX Audio 0.6.2 y MLX 0.32.4. Los 16 clips generados pararon correctamente y con formas de onda finas, no silenciosas y sin clipping.

## Requisitos de hardware

- Memoria: pico de asignación MLX de 1,83 GB durante la inferencia; el repo ocupa 1,2 GB. Un Mac con 8 GB de memoria unificada debería ser suficiente con holgura.
- Plataforma: requiere Apple Silicon, ya que depende de MLX y mlx-audio (no funciona en CUDA ni CPU x86 con esta conversión).
- Validado en Apple M5 (24 GiB, macOS 27.0.1); debería funcionar en chips M1-M4 con memoria suficiente, aunque sin datos medidos disponibles.
- Software: Python 3.11, `mlx-audio==0.6.2` y MLX 0.32.4 (versiones usadas en la validación). No requiere PyTorch ni ONNX Runtime en inferencia.
- Despliegue: exclusivamente vía mlx-audio (`load_model` de `mlx_audio.tts.utils`); no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Rendimiento: RTF de ~0,35-0,36 (síntesis más rápida que tiempo real) incluyendo carga de referencia y evaluación de salida, en Apple M5.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Idiomas | Licencia | Plataforma |
|---|---|---|---|---|---|
| Ming-3.0-tts-0.5B-MLX-oQ4-HQ6Speech-G64 | 1,48 B (payload 6,564 bits/param) | safetensors MLX/oMLX | en, zh, de, es, fr, ko, ja | MIT | Apple Silicon (MLX) |
| inclusionAI/Ming-3.0-tts-0.5B (base) | ~0,5 B (backbone; no disponible el total) | BF16 original | en, zh, de, es, fr, ko, ja | MIT | PyTorch/ONNX |
| Kokoro-82M | 82 M | ONNX/PyTorch | ~8 idiomas | Apache 2.0 | Multiplataforma |

Frente al modelo base, esta conversión reduce el consumo de memoria a 1,83 GB de pico eliminando la dependencia de PyTorch, a costa de un tamaño de paquete mayor que una exportación uniforme a 4 bits (decisión deliberada para proteger el codec de voz). Frente a alternativas como Kokoro, Ming-3.0-tts-0.5B ofrece más idiomas y condicionamiento por voz de referencia, pero está limitado al ecosistema MLX en esta variante.

## Limitaciones y advertencias

- Las validaciones son comprobaciones de ingeniería a pequeña escala: el ASR (Parakeet local) no mide acento, naturalidad ni similitud de hablante.
- El autor señala que muestras en español del runtime original sonaban poco naturales o con acento "de España" para el oyente; esta cuantización no está establecida como una corrección de ese problema.
- La normalización de texto no está portada: los números y unidades deben escribirse con palabras para evitar errores de pronunciación.
- Otros prompts pueden exponer problemas de parada o pronunciación no detectados en la validación.
- La extracción automática de speaker embedding no está implementada en el runtime denso de MLX Audio; hay que calcularla por separado (por ejemplo, con el encoder ONNX original).
- Las grabaciones de referencia, embeddings y audios generados de referencia no están incluidos en el paquete.
- El codec de alta precisión hace el paquete más grande que una exportación uniforme a 4 bits (1,214 GB frente a ~0,5-0,7 GB esperables), lo cual es intencional.
- Uso restringido a Apple Silicon por dependencia de MLX; no hay ruta de despliegue documentada para servidores CUDA.
- Licencia MIT heredada de inclusionAI: sin restricciones para uso comercial, aunque conviene verificar los términos del modelo base original.
- No hay datos sobre sesgos del modelo base ni riesgo de alucinación aplicable (no es un modelo de texto generativo).

## Enlaces

- Modelo cuantizado: https://huggingface.co/groxaxo/Ming-3.0-tts-0.5B-MLX-oQ4-HQ6Speech-G64
- Modelo base: https://huggingface.co/inclusionAI/Ming-3.0-tts-0.5B
- Cuantizador oMLX: https://github.com/jundot/omlx
- Libreria mlx-audio: https://github.com/mlx-audio (paquete PyPI: `mlx-audio==0.6.2`)
