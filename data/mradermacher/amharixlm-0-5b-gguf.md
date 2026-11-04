# mradermacher/AmhariXLM-0.5B-GGUF

## Resumen

AmhariXLM-0.5B es un modelo de lenguaje de 564.575.232 parámetros (aproximadamente 0,56 mil millones) especializado en amárico e inglés, desarrollado originalmente por fidelizML y distribuido en formato GGUF por mradermacher. El modelo parte de una arquitectura tipo Llama y ha sido afinado mediante SFT (supervised fine-tuning) con plantilla de chat ChatML, orientado a tareas educativas y conversacionales en amárico. La versión aquí descrita es una recuantización estática del modelo base original, publicada el 4 de noviembre de 2026.

Su relevancia radica en ser una de las pocas alternativas abiertas de tamaño reducido con soporte nativo de amárico, un idioma con escasa representación en los grandes modelos multilingües. Al estar cuantizado en GGUF, puede ejecutarse en hardware de consumo modesto (incluso CPU), lo que lo hace útil para despliegues en entornos con recursos limitados, aplicaciones educativas locales o integraciones en dispositivos de gama baja.

La licencia Apache 2.0 permite uso comercial sin restricciones significativas, lo que facilita su adopción en productos derivados. No obstante, la información pública disponible sobre el modelo base es limitada: no se detallan la composición exacta del dataset de entrenamiento, la longitud de contexto ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (según tags del modelo base) |
| Parametros totales | 564.575.232 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | am (amárico), en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base fidelizML/AmhariXLM-0.5B emplea una arquitectura transformer de tipo Llama, según indican los tags del repositorio. Con 564,6 millones de parámetros, se sitúa en la gama de modelos pequeños orientados a despliegue eficiente. El entrenamiento incluyó una fase de SFT (supervised fine-tuning) con formato de chat ChatML, lo que sugiere que el modelo está preparado para conversaciones multi-turno con roles definidos (`<|im_start|>` / `<|im_end|>`).

No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Los tags indican un enfoque educativo ("education"), lo que probablemente orienta el corpus hacia contenido didáctico y divulgativo en amárico e inglés. La recuantización realizada por mradermacher es estática (sin imatrix), según se indica en la model card; no se han publicado cuantizaciones ponderadas por imatrix para este modelo.

## Capacidades

- Generación de texto en amárico e inglés, con especial énfasis en contextos educativos.
- Conversación multi-turno mediante plantilla ChatML.
- Comprensión y generación en amárico, un idioma de bajos recursos con poca cobertura en modelos generalistas.
- Traducción implícita amárico-inglés (derivada del entrenamiento bilingüe, aunque no se documenta explícitamente).
- Razonamiento básico y respuesta a preguntas, limitado por el tamaño del modelo (0,56B).
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio.
- No se documenta un modo "thinking" ni capacidades de razonamiento extendido.

## Casos de uso

- Asistente educativo en amárico: el modelo puede responder preguntas escolares y explicar conceptos en amárico gracias a su entrenamiento SFT orientado a educación, desplegable en local sin conexión.
- Traducción amárico-inglés en entornos con recursos limitados: útil para organizaciones humanitarias o educativas que necesiten traducciones rápidas en dispositivos de gama baja, aunque la calidad estará limitada por el tamaño.
- Chatbot de atención al ciudadano en amárico: puede gestionar conversaciones multi-turno con formato ChatML en portales gubernamentales o servicios públicos etíopes, ejecutándose en CPU.
- Aplicaciones móviles o embebidas: con cuantizaciones Q4_K_S (0,4 GB) o Q2_K (0,3 GB), cabe en dispositivos con poca RAM y sin GPU dedicada.
- Prototipado rápido de pipelines NLP en amárico: sirve como base para experimentos de fine-tuning adicional o evaluación de técnicas de adaptación en idiomas de bajos recursos.
- Generación de material didáctico bilingüe: creación de ejercicios, resúmenes o explicaciones en amárico e inglés para plataformas de aprendizaje.
- Investigación en modelos multilingües pequeños: referencia para estudiar el rendimiento de modelos de menos de 1B en idiomas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: desde ~0,3 GB (Q2_K) hasta ~1,2 GB (f16), incluyendo overhead de contexto y runtime.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1050, RTX 3050, etc.); también funciona en CPU.
- Cabe holgadamente en GPU consumer: sí, en todas las GPU modernas e incluso en iGPU y Raspberry Pi con suficiente RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF; el modelo base (safetensors) puede servirse con transformers, vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño (0,56B), se espera throughput alto en CPU y muy alto en GPU, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| AmhariXLM-0.5B (este) | 564,6M | no disponible | am, en | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-0.5B | ~494M | 32.768 tokens | multilingüe (incluye am parcial) | Apache 2.0 | safetensors, GGUF |
| SmolLM2-360M | ~362M | 8.192 tokens | principalmente inglés | Apache 2.0 | safetensors, GGUF |
| Gemma 2 2B | ~2,6B | 8.192 tokens | multilingüe | Gemma license | safetensors, GGUF |

La comparación con Qwen2.5-0.5B y SmolLM2-360M es la más directa por tamaño; sin embargo, ninguno de ellos está específicamente optimizado para amárico. AmhariXLM-0.5B se diferencia por su enfoque bilingüe amárico-inglés y su orientación educativa, a costa de un rendimiento general presumiblemente inferior en tareas generales. No se dispone de datos de benchmarks para comparar rendimiento de forma objetiva.

## Limitaciones y advertencias

- Tamaño reducido (0,56B): capacidad limitada de razonamiento complejo, matemáticas y conocimiento factual; propenso a errores en tareas que requieran precisión.
- Riesgo elevado de alucinación, especialmente en temas factuales o fuera del dominio educativo.
- Longitud de contexto no documentada: no se puede garantizar el manejo de conversaciones o documentos largos.
- Cobertura lingüística restringida a amárico e inglés; el rendimiento en otros idiomas será previsiblemente pobre.
- Posibles sesgos derivados del corpus de entrenamiento (no documentado), especialmente en contenido cultural o educativo.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad; se recomienda Q4_K_M o superior para producción.
- No se han publicado evaluaciones de seguridad, sesgo ni toxicidad.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base original podría tener condiciones adicionales no reflejadas; conviene verificar el repositorio de fidelizML/AmhariXLM-0.5B.
- No dispone de soporte documentado para tool calling ni agentes, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/AmhariXLM-0.5B-GGUF
- Modelo base: https://huggingface.co/fidelizML/AmhariXLM-0.5B
- Página de descargas del cuantizador: https://hf.tst.eu/model#AmhariXLM-0.5B-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
