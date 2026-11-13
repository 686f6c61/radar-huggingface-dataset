# joe2643/Qwen3-ASR-0.6B-Cantonese-HK

## Resumen

Qwen3-ASR-0.6B-Cantonese-HK es un ajuste fino de parámetros completos del modelo de reconocimiento automático del habla Qwen/Qwen3-ASR-0.6B, desarrollado por el usuario joe2643. Su objetivo es especializar el modelo base en cantonés coloquial de Hong Kong (yue-HK) con cambio de código (code-switching) hacia el inglés, incluyendo el reconocimiento de comandos de voz cortos y un mecanismo de sesgo por hotwords resistente al "parroting" (repetición indebida de términos del prompt).

El modelo resuelve un problema concreto: los modelos ASR multilingües genéricos rinden de forma deficiente en cantonés coloquial escrito con caracteres tradicionales de Hong Kong (係, 喺, 嘅, 咗, 㗎, 閂) y en la mezcla cantón-inglés típica del habla real en la región. Este ajuste mantiene el tamaño reducido del modelo base (782 millones de parámetros reales según safetensors) mientras mejora la precisión en esos dominios.

Es relevante porque ofrece una alternativa ligera (aproximadamente un tercio del tamaño del modelo de 1.7B de la misma familia) con licencia Apache 2.0, lo que facilita su despliegue en entornos de servidor, escritorio e incluso dispositivos con recursos limitados mediante las conversiones GGUF publicadas por el mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3-ASR; arquitectura exacta no especificada en la información) |
| Parametros totales | 782.426.112 |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 en este repositorio; GGUF Q4_K_M, Q6_K y Q8_0 con mmproj en el repositorio GGUF del mismo autor |
| Idiomas soportados | yue (cantonés), zh (chino), en (inglés); evaluación centrada en yue y code-switching yue-en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16, formato Transformers: config.json + model.safetensors) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de parámetros completos (full-parameter fine-tune) del modelo base Qwen/Qwen3-ASR-0.6B, un sistema de reconocimiento automático del habla de la familia Qwen3-ASR. La información disponible no detalla la arquitectura interna del modelo base (componentes de encoder acústico, decoder o mecanismo de atención), por lo que este aspecto queda como no disponible.

El entrenamiento se orientó a tres objetivos: cantonés coloquial de Hong Kong con salida nativa en caracteres tradicionales y vocabulario coloquial; cambio de código cantón-inglés manteniendo las palabras inglesas en inglés; y comandos de voz cortos (por ejemplo, 閂燈, 閂冷氣, 開燈). Además, se aplicó un currículo de condicionamiento por contexto con proporciones 75/15/7/3, que incluye trampas de homófonos, distractores puros y enunciados ultracortos de 1 a 4 caracteres, diseñado para que el modelo aproveche hotwords relevantes sin repetir términos no utilizados del prompt (anti-parroting). No se especifican en la información el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Reconocimiento automático del habla en cantonés de Hong Kong (yue-HK) con salida en chino tradicional y caracteres coloquiales (係, 喺, 嘅, 咗, 㗎, 閂).
- Manejo de cambio de código cantón-inglés, preservando las palabras en inglés.
- Reconocimiento de comandos de voz cortos y de enunciados ultracortos (1 a 4 caracteres).
- Sesgo por hotwords o vocabulario de dominio mediante el parámetro `context`, inyectado en el system prompt.
- Resistencia al parroting: tasa de repetición del 0,0% en las pruebas de estrés reportadas, incluso con listas de distractores irrelevantes.
- Soporte de idiomas yue, zh y en, aunque la evaluación publicada se limita a cantonés y cantón-inglés.
- Integración con la librería `qwen-asr` sobre backend Transformers y compatibilidad con endpoints (etiqueta endpoints_compatible).
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada distinto de la transcripción ni modo thinking.

## Casos de uso

- Transcripción de audio en cantonés coloquial de Hong Kong: el modelo genera directamente caracteres tradicionales con vocabulario local, lo que evita postprocesados de normalización desde mandarín.
- Subtitulado y actas de reuniones con mezcla cantón-inglés: el cambio de código se preserva, adecuado para entornos profesionales de Hong Kong donde se alternan ambos idiomas.
- Control por voz de dispositivos domésticos: el entrenamiento específico en comandos cortos (閂燈, 開冷氣) lo hace apto para asistentes de voz con vocabulario acotado.
- Sesgo por vocabulario de dominio en transcripción especializada: mediante `context` se pueden inyectar términos médicos, legales o nombres propios para mejorar la precisión en dominios concretos.
- Despliegue en dispositivos con recursos limitados: las conversiones GGUF Q4_K_M, Q6_K y Q8_0 permiten ejecución con llama.cpp en equipos de escritorio o móviles.
- Integración en aplicaciones de dictado (por ejemplo, OraType): el tamaño de 0,78B parámetros y el formato Transformers facilitan su incorporación en herramientas de escritura por voz.
- Procesamiento por lotes en servidor con vLLM: el repositorio BF16 es compatible con vLLM para transcripciones a escala con mayor rendimiento.

## Benchmarks y rendimiento

Resultados de Character Error Rate (CER, greedy, BF16 con Transformers). Antes de puntuar, el texto se convierte a simplificado (OpenCC t2s), se normalizan números y se eliminan espacios; el idioma se fuerza a cantonés.

| Test Set | Qwen3-ASR-0.6B stock | Este modelo (0.6B-Cantonese-HK) | Qwen3-ASR-1.7B stock | 1.7B-Cantonese-HK v2 | whisper-large-v3 |
|---|---:|---:|---:|---:|---:|
| FLEURS (yue_hant_hk) | 6,10% | 5,70% | 4,20% | 3,95% | 20,97% |
| Common Voice yue | 6,84% | 5,12% | 5,46% | 3,86% | 36,44% |
| Common Voice 23 zh-HK | 9,55% | 6,44% | 7,65% | 5,09% | 41,76% |
| MDCC | 5,45% | 3,29% | 4,25% | 2,49% | 34,52% |
| LegCo (Consejo Legislativo de HK) | 8,81% | 7,62% | 7,22% | 7,16% | 32,15% |
| MCE (code-switching cantón-inglés) | 15,52% | 6,98% | 11,74% | 5,62% | 24,00% |

Prueba de estrés de sesgo por hotwords y anti-parroting (210 clips):

| Condición | CER Qwen3-ASR-0.6B stock | CER este modelo | Tasa de parroting |
|---|---:|---:|---:|
| Hotwords relevantes + distractores homófonos | 11,23% | 8,14% | 0,0% |
| Lista de distractores 100% irrelevantes | 15,69% | 11,92% | 0,0% |
| Audio ultracorto + lista larga de hotwords | 14,38% | 12,50% | 0,0% |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,6 GB de pesos, más overhead de activaciones y del encoder de audio; se recomienda al menos 4 GB de VRAM para uso cómodo.
- VRAM estimada en GGUF: Q4_K_M requiere del orden de 0,5 GB de pesos; Q6_K en torno a 0,7 GB; Q8_0 cerca de 0,9 GB, más el overhead del runtime.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM para BF16; para GGUF basta con GPU integradas o incluso CPU.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares; también en dispositivos móviles mediante GGUF Q4_K_M.
- Opciones de despliegue: `qwen-asr` con backend Transformers, vLLM (repositorio BF16), llama.cpp (`llama-server`) con los GGUF, y despliegue en endpoints compatibles.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas evaluados | CER MCE (code-switching) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| Este modelo (0.6B-Cantonese-HK) | 782 M | yue, zh, en | 6,98% | Apache 2.0 | HF + GGUF |
| Qwen3-ASR-0.6B (stock) | 0,6B (base) | multilingüe | 15,52% | no disponible en la información | HF |
| Qwen3-ASR-1.7B-Cantonese-HK v2 | 1,7B (base) | yue, zh, en | 5,62% | no disponible en la información | HF + GGUF |
| whisper-large-v3 | no disponible en la información | multilingüe | 24,00% | no disponible en la información | HF |

El modelo se sitúa como la opción ligera de la familia: pierde precisión frente al ajuste de 1,7B (por ejemplo, 5,70% frente a 3,95% en FLEURS) pero mejora de forma consistente al modelo base de 0,6B y supera ampliamente a whisper-large-v3 en todos los conjuntos evaluados.

## Limitaciones y advertencias

- La evaluación se limita a cantonés y cantón-inglés; en otros idiomas el rendimiento puede ser peor que el del modelo base.
- El idioma se fuerza a cantonés durante la evaluación, lo que puede no reflejar el comportamiento en detección automática de idioma.
- Los CER reportados se calculan sobre texto convertido a simplificado y normalizado; los resultados con texto tradicional sin normalizar pueden diferir.
- Riesgo de alucinación y de repetición en audios muy ruidosos o fuera de dominio no cuantificado en la información; el anti-parroting se valida solo en la suite de 210 clips.
- No se documentan sesgos demográficos ni de acento específicos; el entrenamiento se centra en cantonés de Hong Kong, por lo que otros acentos del yue pueden degradarse.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3-ASR-0.6B del que deriva.
- Proyecto de un autor individual con 0 descargas y 0 likes en el momento de la consulta; no hay garantía de mantenimiento ni de soporte a largo plazo.
- No se dispone de información sobre la longitud de contexto máxima soportada, lo que limita la planificación de audios largos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/joe2643/Qwen3-ASR-0.6B-Cantonese-HK
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Versión GGUF: https://huggingface.co/joe2643/Qwen3-ASR-0.6B-Cantonese-HK-GGUF
- Versión 1.7B: https://huggingface.co/joe2643/Qwen3-ASR-1.7B-Cantonese-HK
- Versión 1.7B GGUF: https://huggingface.co/joe2643/Qwen3-ASR-1.7B-Cantonese-HK-GGUF
- Repositorio GitHub: https://github.com/joe2643/qwen3-asr-cantonese-hk
- Integración OraType: https://github.com/sennett-lau/oratype
- Apoyo al autor: https://buymeacoffee.com/joe2643
