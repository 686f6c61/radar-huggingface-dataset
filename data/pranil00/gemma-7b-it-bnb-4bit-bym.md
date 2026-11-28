# pranil00/gemma-7b-it-bnb-4bit-BYM

## Resumen

`gemma-7b-it-bnb-4bit-BYM` es una variante "abliterada" del modelo Gemma 7B Instruct de Google, publicada por el usuario pranil00 (Pranil Shah) mediante su herramienta de código abierto `break-your-model`. El modelo parte de la versión ya cuantizada a 4 bits de Unsloth (`unsloth/gemma-7b-it-bnb-4bit`) y le aplica una técnica de edición de pesos denominada Arbitrary-Rank Ablation (ARA) con Hyperspherical Row-Norm Invariance, cuyo objetivo declarado es eliminar las direcciones internas de rechazo (refusal) del modelo sin degradar sus capacidades de razonamiento, matemáticas o código.

El resultado es un modelo de lenguaje de 7 mil millones de parámetros, arquitectura transformer decoder-only, especializado en generación de texto conversacional y distribuido con pesos en formato safetensors (adaptador PEFT y pesos completos) junto con un artefacto GGUF cuantizado a q4_k_m para su uso con llama.cpp y Ollama. La motivación principal es ofrecer un modelo "sin censura" para investigación en seguridad, análisis de doble uso y estudios de alineación.

Es relevante en el contexto actual de la investigación en representación (representation engineering) y en la evaluación de la robustez de los mecanismos de seguridad de los modelos abiertos: demuestra que es posible reducir drásticamente las tasas de rechazo mediante manipulación matemática de los pesos, lo que plantea preguntas importantes sobre gobernanza y despliegue responsable. El repositorio es de tamaño reducido (0,2 GB), sin descargas ni "likes" en el momento de la consulta, y con fecha de creación de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma, basado en `unsloth/gemma-7b-it-bnb-4bit`) |
| Parametros totales | 7 mil millones (7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el Gemma 7B original soporta 8.192 tokens; no confirmado para esta variante) |
| Tipos de cuantizacion | 4-bit (bitsandbytes, base), GGUF q4_k_m (artefacto incluido) |
| Idiomas soportados | No disponible (la model card no especifica idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT y pesos completos), GGUF (q4_k_m) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 7B Instruct: un transformer decoder-only denso con 7 mil millones de parámetros, atención multi-cabeza con RoPE y normalización RMSNorm, entrenado originalmente por Google con datos multilingües y ajustado por instrucciones. La versión base utilizada (`unsloth/gemma-7b-it-bnb-4bit`) es una cuantización a 4 bits con bitsandbytes realizada por Unsloth para reducir requisitos de memoria.

Sobre esa base, la herramienta `break-your-model` aplica una modificación de pesos denominada Arbitrary-Rank Ablation (ARA) combinada con Hyperspherical Row-Norm Invariance. Según la model card, esta técnica "extirpa matemáticamente" las direcciones internas de rechazo mediante una ablación de rango arbitrario sobre las representaciones internas, preservando la norma de las filas en un espacio hiperesférico para minimizar la degradación funcional. El proceso se ejecutó como un adaptador (estrategia "adapter") con un tiempo de ejecución de 9.720,3 segundos. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO adicionales; la modificación es puramente de edición de pesos, no de reentrenamiento supervisado.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Gemma 7B Instruct.
- Razonamiento, matemáticas y generación de código (la model card afirma que no se degradan estas capacidades, aunque no aporta benchmarks que lo verifiquen).
- Capacidad "sin censura": reducción declarada de la tasa de rechazo ante prompts dañinos de 90/100 a 1/100 (98,9 % de reducción).
- Soporte de tool calling / function calling: no confirmado explícitamente en la información proporcionada (Gemma Instruct original tiene soporte limitado; no verificado para esta variante).
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no disponibles (la model card no las detalla).
- Capacidades especiales: no se documentan modos de "thinking", visión ni audio.

## Casos de uso

- Investigación en seguridad y alineación: el modelo sirve como sujeto de estudio para analizar cómo las técnicas de ablación de representaciones afectan a los mecanismos de rechazo, comparando su comportamiento con el Gemma 7B Instruct original en suites de prompts dañinos.
- Análisis de doble uso en ciberseguridad: la model card propone explícitamente prompts sobre ingeniería inversa de binarios y triaje de vulnerabilidades; el modelo puede usarse en entornos controlados para estudiar la generación de contenido técnico sensible y diseñar mejores filtros.
- Evaluación de robustez de salvaguardas: permite a los equipos de seguridad medir la eficacia de sus clasificadores de contenido frente a modelos abliterados y calibrar políticas de moderación.
- Despliegue local en hardware de consumo: gracias al GGUF q4_k_m y a los 7B parámetros, puede ejecutarse con llama.cpp u Ollama en portátiles y equipos sin GPU dedicada, útil para pruebas offline y entornos air-gapped.
- Generación de texto creativo y conversacional sin restricciones editoriales: para proyectos de escritura que requieran explorar temáticas que los modelos alineados rechazan, siempre con revisión humana.
- Prototipado rápido de aplicaciones de chat: el `Modelfile` incluido permite levantar un servicio compatible con la API de OpenAI en minutos mediante `llama-server`, adecuado para demos y pruebas de integración.
- Estudio de la degradación por cuantización: al combinar cuantización 4-bit con ablación, es un caso útil para medir el impacto acumulado de ambas técnicas sobre la calidad del modelo.

## Benchmarks y rendimiento

La model card incluye una "scorecard" de ablación de seguridad, pero no benchmarks estándar de capacidad (MMLU, HumanEval, GSM8K). Los datos disponibles son:

| Metrica | Baseline (alineado) | break-your-model | Resultado declarado |
|---|---|---|---|
| Tasa de rechazo ante prompts dañinos | 90/100 | 1/100 | Reducción del 98,9 % |
| Deriva KL en tareas inofensivas | 0,0000 (ref.) | 3,6640 | "Pinsker Invariant (<0,20)" |
| Estrategia de optimización | — | adapter | "Zero Degradation" |
| Artefacto GGUF cuantizado | — | `gemma-7b-it-bnb-4bit-q4_k_m.gguf` | Listo para llama.cpp y Ollama |
| Tiempo de optimización | — | 9.720,3 s | Ejecución local verificada |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La afirmación de "cero degradación" no está respaldada por métricas de rendimiento en la model card, y la deriva KL de 3,6640 es notablemente superior al umbral de 0,20 que la propia tarjeta cita como invariante, lo que conviene interpretar con cautela.

## Requisitos de hardware

- VRAM estimada: con cuantización 4-bit, aproximadamente 5-6 GB para los pesos; con GGUF q4_k_m, en torno a 4,5-5 GB. Para contexto largo hay que sumar la caché KV.
- GPU recomendadas: A100 40 GB o H100 para servicio de alta concurrencia; RTX 4090 (24 GB) para inferencia cómoda con contexto amplio; RTX 3090/4080 (16-24 GB) también viables.
- ¿Cabe en GPU de consumo? Sí: el GGUF q4_k_m cabe en GPUs de 8 GB (RTX 3060 Ti, RTX 4060) y en Apple Silicon con memoria unificada de 16 GB o más.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (con el `Modelfile` incluido), Transformers + PEFT para el adaptador, y `run_inference.py` como runner autónomo.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `pranil00/gemma-7b-it-bnb-4bit-BYM` | 7B | No disponible | Apache 2.0 | safetensors, GGUF q4_k_m | Abliterado, sin censura, 4-bit |
| `unsloth/gemma-7b-it-bnb-4bit` (base) | 7B | 8.192 (Gemma original) | Apache 2.0 | safetensors 4-bit | Alineado, con rechazos |
| Gemma 7B Instruct (Google) | 7B | 8.192 | Gemma Terms of Use | safetensors | Alineado, referencia oficial |
| Mistral 7B Instruct | 7B | 32.768 | Apache 2.0 | safetensors, GGUF | Alternativa densa de 7B ampliamente usada |

La comparación con Mistral 7B se ofrece como referencia de categoría (7B denso, licencia Apache 2.0); no se dispone de datos de rendimiento comparativo entre ambos en la información proporcionada.

## Limitaciones y advertencias

- El modelo ha sido modificado deliberadamente para eliminar sus mecanismos de rechazo; puede generar contenido dañino, ilegal o éticamente problemático. No debe desplegarse en producción orientada a usuarios finales sin filtros externos robustos.
- La afirmación de "cero degradación" no está respaldada por benchmarks de capacidad; la deriva KL reportada (3,6640) supera ampliamente el umbral de 0,20 que la propia tarjeta cita, lo que sugiere posible degradación funcional no cuantificada.
- Riesgo elevado de alucinación, agravado por la cuantización 4-bit y por la edición de pesos.
- Sesgos conocidos del Gemma original (no documentados específicamente para esta variante); la ablación no elimina sesgos sociales, solo direcciones de rechazo.
- Idiomas soportados no especificados; el comportamiento multilingüe puede diferir del Gemma Instruct original.
- Restricciones de licencia: se declara Apache 2.0, pero el modelo base Gemma de Google se rige por los Gemma Terms of Use; conviene verificar la compatibilidad antes de uso comercial, ya que la relicencia de un derivado de Gemma bajo Apache 2.0 es jurídicamente discutible.
- Repositorio con 0 descargas y 0 "likes": sin validación comunitaria ni evidencia de uso en producción.
- El código de ejemplo de la model card contiene errores de indentación en Python (el bloque `if tokenizer.pad_token is None:` envuelve código que debería estar fuera), lo que indica falta de revisión.
- Uso responsable: adecuado para investigación en seguridad y alineación en entornos controlados; no recomendado para aplicaciones comerciales sin auditoría legal y de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pranil00/gemma-7b-it-bnb-4bit-BYM
- Modelo base: https://huggingface.co/unsloth/gemma-7b-it-bnb-4bit
- Framework break-your-model: https://github.com/PranilShah-08/break-your-model
- Gemma 7B Instruct (Google): https://huggingface.co/google/gemma-7b-it
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- No se han encontrado en la información proporcionada papers, blogs ni demos adicionales.
