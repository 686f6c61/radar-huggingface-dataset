# adityabhushannagar/Dhir-2B

## Resumen

Dhīr 2B es un modelo de lenguaje compacto de 2.030 millones de parámetros desarrollado por ZenteiQ AiTech Innovations Pvt. Ltd. (Bengaluru, India) dentro de la familia BrahmAI. Se trata de un transformer decoder-only denso entrenado desde cero —no adaptado de un modelo existente— con un tokenizador propio diseñado para lenguas indias. Cubre inglés y diez idiomas de la India (hindi, guyaratí, tamil, bengalí, canarés, malabar, maratí, odia, panyabí y telugu) y está pensado para ejecutarse en local, desde un portátil hasta un dispositivo edge o dentro del perímetro de una empresa.

El modelo se distribuye bajo licencia Apache 2.0, con un contexto de 16.384 tokens y pesos en bfloat16, lo que supone un tamaño de repositorio de 4,1 GB (3,8 GB en BF16 y aproximadamente 1,1 GB en 4 bits según el autor). Su propuesta diferencial es el ajuste específico al ecosistema lingüístico indio: tokenizador propio, bajo bits-per-byte en lenguas indic y capacidad nativa de tool calling.

Es relevante ahora porque la mayoría de los modelos abiertos de tamaño pequeño rinden de forma notablemente inferior en lenguas indias, y Dhīr 2B se posiciona explícitamente como una alternativa compacta y desplegable en local para traducción, RAG sobre documentos y asistentes con llamada a funciones en ese ámbito lingüístico. El modelo cuenta con el apoyo de la IndiaAI Mission (MeitY) en el marco de su iniciativa de modelos fundacionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso con Grouped-Query Attention, FFN con compuerta, RoPE, RMSNorm y Flash Attention |
| Parámetros totales | 2.030.167.040 (2,03 B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantización | BF16 nativo; el autor menciona 4 bits (≈1,1 GB); no se detallan otros formatos |
| Idiomas soportados | Inglés, hindi, guyaratí, bengalí, canarés, malabar, maratí, odia, panyabí, tamil y telugu |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con código de arquitectura propio (`modeling_dhir.py`, `configuration_dhir.py`); requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

Dhīr 2B es un transformer decoder-only denso de 28 capas con dimensión oculta de 2048. La atención usa Grouped-Query Attention con 16 cabezas de consulta y 8 de clave/valor, con dimensión de cabeza de 128. La capa feed-forward es una FFN con compuerta de dimensión intermedia 8192. Emplea embeddings posicionales rotatorios (RoPE), normalización RMSNorm y kernel de Flash Attention. El vocabulario es de 131.072 tokens, con un tokenizador propio diseñado para lenguas indias, y la precisión de entrenamiento es bfloat16.

El entrenamiento se realizó con MaxText (JAX) sobre Google TPU v6e, con checkpoints en formato Orbax convertidos posteriormente al formato de Hugging Face. El modelo se preentrenó desde cero y después se afinó con instrucciones mediante SFT seguido de aprendizaje por refuerzo con GRPO. La model card no especifica el número de tokens de preentrenamiento ni la composición exacta del dataset. La arquitectura se distribuye como código personalizado, por lo que es necesario habilitar `trust_remote_code=True` al cargar el modelo con Transformers (o `--trust-remote-code` en `vllm serve`).

## Capacidades

- Generación de texto en inglés y diez lenguas indias.
- Traducción bidireccional indic ↔ inglés en 24 direcciones.
- Question answering sobre pasajes y documentos proporcionados (lector de RAG).
- Comprensión lectora y resumen en lenguas indias.
- Tool calling y function calling nativo en formato de herramientas (BFCL v3 con una precisión de 73,4 según el autor).
- Asistencia básica de programación en Python (funciones cortas y autocontenidas).
- Razonamiento matemático elemental en inglés.
- Seguimiento de instrucciones en inglés.
- Capacidad de servir como modelo base para fine-tuning en lenguas indias.
- Despliegue en local, offline y en dispositivos edge.

## Casos de uso

- Traducción indic ↔ inglés en borradores y comunicación interna: el modelo cubre 24 direcciones y lidera la comparativa del autor en FLORES con chrF 51,4; adecuado para pre-traducción con revisión humana en contenidos publicados o legales.
- Lector de RAG sobre documentación empresarial en lenguas indias: con 16k tokens de contexto puede ingerir pasajes largos y responder preguntas sobre ellos, con un token F1 de 63,5 en XQuAD-IN según el autor.
- Asistentes con llamada a herramientas y APIs: el tool calling nativo permite construir agentes que consulten servicios, bases de datos o aplicaciones internas sin ingeniería de prompts compleja.
- Asistente personal privado en local: con 3,8 GB en BF16 y aproximadamente 1,1 GB en 4 bits, puede ejecutarse en un portátil o estación de trabajo sin enviar datos a la nube.
- Comprensión y resumen de textos administrativos o periodísticos en lenguas indias: útil para lectura comprensiva y síntesis de documentos en idiomas con poca cobertura en modelos abiertos pequeños.
- Base para fine-tuning sectorial: organizaciones que necesiten un modelo propio en hindi, tamil o bengalí pueden partir de estos pesos bajo Apache 2.0 y adaptarlos a su dominio.
- Soporte básico de programación en Python: generación de funciones cortas y autocontenidas para scripts internos o prototipos.

## Benchmarks y rendimiento

Datos publicados por el autor en su suite interna de evaluación (14 de octubre de 2026). Las posiciones se calculan frente a modelos abiertos evaluados con el mismo arnés: 17 modelos ajustados por instrucciones en tareas generativas y 31 modelos (base e instruct) en tareas de verosimilitud.

| Capacidad | Benchmark | Dhīr 2B | Siguiente mejor | Posición |
|---|---|---|---|---|
| Traducción, 24 direcciones indic ↔ inglés (chrF) | IndicGenBench FLORES | 51,4 | 46,0 | 1 de 17 |
| QA sobre documentos, 12 idiomas (token F1) | XQuAD-IN | 63,5 | 61,3 | 1 de 17 |
| QA sobre documentos, 11 idiomas (token F1) | IndicQA | 63,4 | 60,0 | 1 de 17 |
| QA cross-lingüe, 12 idiomas (token F1) | XorQA-IN | 33,7 | 26,1 | 1 de 17 |
| Modelado de lengua indic, 14 conjuntos (bits-per-byte, menor es mejor) | Texto indic reservado | 0,507 | 0,625 | 1 de 31 |
| Comprensión lectora, 13 idiomas (accuracy) | Belebele | 58,8 | 54,2 (mejor par ≤3B) | Lidera hasta 3B |
| Seguimiento de instrucciones en inglés (estricto) | IFEval | 66,5 | — | Por delante de Gemma-2-2B-it (55,5) |
| Python (pass@1) | HumanEval / MBPP | 45,1 / 40,2 | — | HumanEval por delante de Gemma-3-4B-it (26,2) |
| Matemáticas de primaria en inglés | GSM8K | 58,0 | — | Razonamiento matemático básico |
| Llamada a funciones | BFCL v3 | 73,4 | — | — |

No se han publicado en la información disponible resultados de MMLU ni de otros benchmarks generales de conocimiento.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4 GB en BF16 (3,8 GB de pesos más overhead de activaciones y caché KV) y en torno a 1,1 GB en cuantización de 4 bits según el autor.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para BF16; tarjetas profesionales como A100 o H100 para despliegues con concurrencia, y RTX 4090 o similares para uso individual.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más en BF16 y en GPUs con 4-6 GB usando cuantización de 4 bits.
- Opciones de despliegue: Transformers (con `trust_remote_code=True`), vLLM (con `--trust-remote-code`) y, en principio, cualquier runtime que cargue la arquitectura personalizada; no se confirma soporte nativo en llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Dhīr 2B | 2,03 B denso | 16.384 | Apache 2.0 | Tokenizador propio para lenguas indias; tool calling nativo; entrenado desde cero |
| Gemma-2-2B-it | 2,6 B denso | 8.192 | Gemma Terms | Referencia del autor en IFEval (55,5 frente a 66,5 de Dhīr) |
| Gemma-3-4B-it | 4 B denso | 128.000 | Gemma Terms | Referencia del autor en HumanEval (26,2 frente a 45,1 de Dhīr); mayor contexto |
| Dhīr 5B MoE | 5 B (MoE) | No disponible | Apache 2.0 | Modelo complementario de la misma familia para cargas empresariales complejas |

La comparación se limita a los datos que el autor incluye en su model card; no se dispone de evaluaciones independientes que permitan contrastar el rendimiento frente a otros modelos pequeños multilingües.

## Limitaciones y advertencias

- Los benchmarks proceden de la suite interna del autor; no hay verificación independiente publicada.
- El repositorio de Hugging Face indicado (`adityabhushannagar/Dhir-2B`) no coincide con el identificador usado en los ejemplos de la model card (`zenteiq/Dhir-2B`), lo que puede provocar errores al cargar el modelo; conviene verificar la ruta correcta antes de desplegar.
- Requiere `trust_remote_code=True` por el código de arquitectura personalizado, lo que implica ejecutar código del autor en el entorno de inferencia.
- Riesgo de alucinación inherente a un modelo de 2 B: no es fiable para hechos sin contexto aportado, y el autor recomienda revisión humana en traducciones publicadas o legales.
- Cobertura lingüística limitada a inglés y diez lenguas indias; no se documenta soporte para castellano ni otras lenguas.
- Capacidad de programación limitada a funciones cortas y autocontenidas; no apto para tareas de ingeniería de software complejas.
- Razonamiento matemático básico; GSM8K de 58,0 indica un rendimiento modesto fuera de problemas escolares.
- No se especifican en la información disponible los sesgos conocidos ni la composición del dataset de entrenamiento, lo que dificulta evaluar riesgos de sesgo.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación sobre datos de entrenamiento puede plantear dudas de cumplimiento en entornos regulados.

## Enlaces

- Hugging Face: https://huggingface.co/adityabhushannagar/Dhir-2B
- ZenteiQ: https://www.zenteiq.ai
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.
