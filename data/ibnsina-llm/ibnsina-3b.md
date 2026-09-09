# ibnsina-llm/ibnsina-3b

## Resumen

IbnSina-3B es un modelo de lenguaje de 3.000 millones de parámetros (2.999.144.960 exactos) desarrollado por Sina Meraji y la organización ibnsina-llm. A diferencia de la mayoría de modelos persas, que adaptan una base entrenada en inglés, se preentrenó desde cero sobre un corpus de 99.600 millones de tokens con dominio del persa. Su arquitectura sigue el estilo Qwen3 (GGUF `qwen3`), con 40 capas, 20 cabezas de atención, 4 cabezas KV (GQA), QK-norm, SwiGLU, RMSNorm y RoPE. Ofrece una ventana de contexto de 2048 tokens y un tokenizer byte-level BPE de 32.768 tokens eficiente en persa (1,29 tokens/palabra frente a 1,73 de Qwen3.5 y 1,64 de Gemma 3).

Tras el preentrenamiento, se ajustó con el recipe `sft_v2`: 51.000 conversaciones juzgadas en 17 categorías y 50.000 ejemplos auxiliares de opción múltiple. El modelo está pensado para escritura, resumen, traducción y conversación en persa, con ejecución local mediante llama.cpp, Ollama o LM Studio, bajo licencia Apache-2.0. No está diseñado para conocimiento factual, matemáticas ni código; el autor advierte de que puede producir frases fluidas pero incorrectas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de estilo Qwen3 (GGUF `qwen3`): 40 capas, d=2560, 20 cabezas / 4 KV heads con GQA, QK-norm, SwiGLU 7168, RMSNorm, RoPE, cabeza destetada |
| Parametros totales | 2.999.144.960 (3,0 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | GGUF: Q4_K_M (~1,8 GB), Q8_0 (~3,2 GB), f16 (~6,0 GB) |
| Idiomas soportados | Persa (fa), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un Transformer decoder-only con configuración Qwen3: 40 capas, dimensión de modelo 2560, 20 cabezas de atención y 4 cabezas KV mediante Grouped Query Attention. Incluye QK-norm, activación SwiGLU con proyección 7168, RMSNorm, RoPE y cabeza de salida no atada (untied head). El tokenizer es un byte-level BPE de 32.768 tokens (`v2_32k_llama`) con pre-tokenización tipo Llama-3, compartido con IbnSina-1.5B y optimizado para el persa.

Para el preentrenamiento se usaron 99.600 millones de tokens, equivalentes a unas 2 épocas sobre 48.000 millones de tokens únicos, durante 190.000 pasos con 524.000 tokens por paso, en bf16. La mezcla de datos incluye web persa de CulturaX, mC4 y FineWeb-2 filtrada por clasificador; texto educativo en inglés; código; matemáticas y libros de texto escolares iraníes; literatura persa; Wikipedia y texto paralelo persa-inglés. Además se añadieron 2.100 millones de tokens de persa sintético juzgado (`synthetic-persian-v1`). El optimizador combina Muon y AdamW dentro del bucle nanochat, entrenado en 8×H100.

El fine-tuning de instrucciones `sft_v2` se compone de 51.000 conversaciones juzgadas en 17 categorías, más un conjunto canónico de identidad y 50.000 ejemplos auxiliares de opción múltiple. Todo el material proviene de fuentes con licencias compatibles con Apache-2.0, con la tabla de licencias y el manifiesto de mezcla publicados en el repositorio de GitHub.

## Capacidades

- Generación de texto en persa: conversación, escritura, resumen y traducción, con registro natural.
- Soporte conversacional multi-turno mediante la plantilla de chat `<|user_start|>...<|user_end|><|assistant_start|>...<|assistant_end|>`, con el token `<|bos|>` añadido por el runtime.
- Emisión de tool calls en formato nanochat: calculadora, conversión de fechas y búsqueda; solo se ejecutan en el runtime de referencia del repositorio, no en llama.cpp ni Ollama.
- Eficiencia de tokenizer en persa: 1,29 tokens/palabra frente a 1,73 (Qwen3.5) y 1,64 (Gemma 3), lo que reduce el coste de tokens en textos persas.
- Capacidad multilingüe limitada: persa dominante e inglés secundario (texto educativo y paralelo); no orientado a otros idiomas.
- No está preparado para razonamiento matemático avanzado, programación ni recuperación de conocimiento factual; el autor lo indica explícitamente.
- Sin memoria entre conversaciones: cada sesión es independiente.

## Casos de uso

- Redacción y corrección de textos en persa: se puede integrar con llama.cpp u Ollama para generar borradores, mejorar estilo y corregir textos en persa; su ajuste conversacional y tokenizer eficiente lo hacen adecuado para aplicaciones de escritorio o móviles.
- Resumen de documentos breves en persa: dentro de su ventana de 2048 tokens permite condensar párrafos, noticias cortas o correos; útil en entornos sin conexión a internet.
- Traducción persa-inglés de frases o documentos cortos: el preentrenamiento incluyó texto paralelo fa-en, por lo que puede asistir en traducciones básicas que luego requieren revisión humana.
- Chat offline en persa: implementable como asistente conversacional local, por ejemplo en un kiosco, una aplicación de atención al cliente o un dispositivo embebido con 1,8 GB de modelo cuantizado.
- Generación de contenido educativo sencillo: puede redactar explicaciones introductorias y ejercicios de práctica en persa para plataformas de aprendizaje, siempre que el contenido se verifique porque el modelo no es fiable factualmente.
- Asistente de productividad sin conexión: integración en editores de texto o gestores de correo para redactar respuestas en persa, con la ventaja de no depender de servicios en la nube.

## Benchmarks y rendimiento

Evaluación con puntuación de opción múltiple por log-likelihood, con protocolo y harness idénticos para ambos modelos. No se han publicado resultados contra modelos externos en la información disponible.

| Tarea | IbnSina-3B | IbnSina-1.5B | Aleatorio |
|---|---:|---:|---:|
| ParsiNLU-MC | 34,6 % | 31,8 % | 25 % |
| ParsiNLU-MC / conocimiento común | 46,3 % | — | 25 % |
| ParsiNLU-MC / literatura | 30,6 % | — | 25 % |
| ParsiNLU-MC / matemáticas y lógica | 26,9 % | — | 25 % |
| PersianMedQA (5.235 preguntas) | 30,9 % | 26,8 % | 25 % |
| ParsiNLU-Entailment | 29,9 % | 33,7 % | 33 % |
| ParsiNLU-QQP | 48,3 % | 50,7 % | 50 % |

El autor señala que en las dos tareas de clasificación (entailment y QQP) ambos modelos rinden al azar, por lo que deben interpretarse como líneas base, no como capacidades. En uso libre, el modelo a veces ignora instrucciones estrictas de formato y puede afirmar cifras erróneas con confianza. Se anuncia un informe técnico futuro que comparará IbnSina con modelos frontera en benchmarks de examen persa como PersianMedQA.

## Requisitos de hardware

- VRAM estimada para inferencia: no especificada por el autor. A partir del tamaño de los archivos GGUF se estima: Q4_K_M ~2 GB, Q8_0 ~3,5 GB y f16 ~6,5 GB de VRAM o RAM disponible.
- GPU recomendadas: no disponibles. El modelo puede ejecutarse en cualquier GPU con suficiencia de VRAM; Q4_K_M es compatible con GPUs de consumo de gama baja (por ejemplo, RTX 3050 o similares) e incluso con CPU.
- Despliegue en consumer GPU: sí, la cuantización Q4_K_M (~1,8 GB) es apta para GPU de consumo y portátiles; también ejecuta en RAM de sistema vía llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio; alternativa con soporte de tool calls en el runtime de referencia del repositorio de GitHub.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Observaciones |
|---|---|---|---|---|
| IbnSina-3B | 3,0 B | 2048 tokens | Apache-2.0 | Preentrenado desde cero con dominio persa; mejores resultados que IbnSina-1.5B en ParsiNLU-MC y PersianMedQA |
| IbnSina-1.5B | 1,5 B | 2048 tokens | Apache-2.0 | Modelo anterior de la misma familia; mismo tokenizer; rendimiento inferior en los benchmarks de conocimiento |
| Qwen3.5 / Gemma 3 | no disponible | no disponible | no disponible | Citados únicamente como referencia de eficiencia de tokenizer en persa; no se dispone de datos de comparación de rendimiento |

Para comparativas con otros modelos persas adaptados no hay datos publicados en la información disponible.

## Limitaciones y advertencias

- No es una fuente fiable sobre personas, política, noticias ni conocimiento general; el autor recomienda usar modelos grandes para consultas de información.
- No está diseñado para asesoramiento médico, legal o financiero, ni para razonamiento matemático o programación.
- Produce alucinaciones y puede afirmar cifras erróneas con seguridad; es imprescindible verificar los resultados importantes.
- En tareas de clasificación ParsiNLU-Entailment y ParsiNLU-QQP rinde al azar, por lo que no debe emplearse para clasificación de texto.
- Puede ignorar instrucciones de formato estricto, como responder solo con un número de opción.
- Ventana de contexto limitada a 2048 tokens; no tiene memoria entre conversaciones.
- El conocimiento queda congelado en el momento del entrenamiento; sin acceso a internet.
- Las tool calls (calculadora, conversión de fechas, búsqueda) solo se ejecutan en el runtime de referencia del GitHub; llama.cpp y Ollama no las ejecutan.
- Licencia Apache-2.0 permite uso comercial, pero la fiabilidad del modelo debe evaluarse cuidadosamente antes de su despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ibnsina-llm/ibnsina-3b
- Repositorio GitHub: https://github.com/ibnsina-llm/ibnsina
- Guía en persa: https://github.com/ibnsina-llm/ibnsina/blob/main/README_FA.md
- Dataset de persa sintético: https://huggingface.co/datasets/ibnsina-llm/synthetic-persian-v1
- Perfil de la organización: https://huggingface.co/ibnsina-llm
- Paper relacionado (PersianMedQA): https://arxiv.org/abs/2506.00250
- Paper relacionado: https://arxiv.org/abs/2509.01035
