# augustine223/Qwen3.6-35B-A3B-KO-i1-GGUF

## Resumen

El modelo `augustine223/Qwen3.6-35B-A3B-KO-i1-GGUF` es una cuantización GGUF del modelo base `Qwen/Qwen3.6-35B-A3B`, un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por Alibaba. Esta versión concreta ha sido calibrada con una importance matrix (imatrix) generada a partir de un corpus centrado en coreano (79% coreano, 21% inglés y código), lo que mejora la fidelidad de la cuantización para textos en coreano respecto a las calibraciones estándar basadas en inglés. El autor, augustine223, ya había publicado una versión similar para el modelo kanana-1.5, y esta es su segunda entrega con esta técnica.

El modelo base Qwen3.6-35B-A3B es un MoE con 35.505 millones de parámetros totales y aproximadamente 3.000 millones de parámetros activos por token. Está orientado a tareas de codificación agéntica y razonamiento, con soporte para generación con predicción multi-token (MTP). Esta cuantización en GGUF permite ejecutarlo con llama.cpp en una amplia gama de hardware, desde GPUs de consumo hasta CPUs, con distintos niveles de compresión que van desde 36 GB (Q8_0) hasta 12 GB (IQ2_M). La licencia es Apache 2.0, lo que facilita su uso comercial.

La relevancia de esta versión radica en que ofrece una alternativa optimizada para hablantes de coreano, un idioma que suele estar infrarrepresentado en los corpus de calibración de cuantizaciones. Las mediciones del autor muestran reducciones estadísticamente significativas en la divergencia KLD frente a la versión calibrada en inglés, especialmente en cuantizaciones de bajo bit.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con predicción multi-token (MTP) |
| Parametros totales | 35.505.251.456 (35,5B) |
| Parametros activos | ~3B (3.000 millones) |
| Longitud de contexto | No especificada en la documentación; el ejemplo de uso emplea `-c 32768` (32K) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ3_M, IQ3_XXS, IQ2_M (todos con imatrix coreano) |
| Idiomas soportados | Coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer decoder-only con arquitectura MoE: de los 35.505 millones de parámetros, solo unos 3.000 millones se activan por token, lo que permite un rendimiento de inferencia relativamente alto con un coste de memoria moderado. Incorpora además un módulo de predicción multi-token (MTP) que permite decodificación especulativa, aunque en esta cuantización el tensor correspondiente (blk.40) no ha recibido imatrix y se fija a q4_K en las versiones IQ3_XXS e IQ2_M.

El entrenamiento del modelo base no está detallado en la documentación proporcionada, pero se sabe que Qwen3.6 se construye sobre los avances de Qwen3.5 y prioriza la estabilidad y la utilidad práctica, con especial énfasis en codificación agéntica y razonamiento multi-paso. La cuantización de esta entrega se realizó con llama.cpp build 10449, recopilando la imatrix a partir de 708 fragmentos (~360.000 tokens) de un corpus de calibración compuesto por 302 fuentes: 111 artículos de Wikipedia en coreano, 191 obras literarias de dominio público, 6 conjuntos de datos conversacionales con licencias permisivas y material en inglés/código. La cobertura de expertos alcanza al menos el 99,61%.

## Capacidades

- Generación de texto en coreano e inglés con alta fidelidad, especialmente en coreano gracias a la calibración específica.
- Razonamiento y codificación agéntica: el modelo base está optimizado para tareas de programación que requieren múltiples pasos y uso de herramientas.
- Soporte de decodificación especulativa mediante MTP (multi-token prediction) si se utiliza el archivo GGUF de MTP separado de ggml-org.
- Compatible con llama.cpp, llama-server y otras herramientas del ecosistema GGUF (Ollama, LM Studio, etc.).
- Capacidad de tool calling y function calling (heredada del modelo base, aunque no se detalla en la documentación de la cuantización).
- Multilingüe limitado a coreano e inglés según la model card, aunque el modelo base podría soportar más idiomas.

## Casos de uso

- Asistente de codificación en coreano: un desarrollador coreano puede usar el modelo como autocompletado o asistente de programación en su IDE, aprovechando la buena comprensión del idioma local en comentarios y documentación.
- Chatbot de atención al cliente en coreano: con una ventana de contexto de al menos 32K, puede gestionar conversaciones multi-turno largas y mantener el historial completo sin truncamiento.
- Traducción y transcripción de documentación técnica: el modelo puede traducir entre coreano e inglés en contextos técnicos, manteniendo la coherencia terminológica.
- Generación de informes y resúmenes en coreano: útil para redactar resúmenes de artículos, actas o documentos legales con un registro formal.
- Análisis de código legacy con comentarios en coreano: el modelo puede explicar, refactorizar o documentar código existente escrito por equipos coreanos.
- Despliegue en entornos con memoria limitada: gracias a las cuantizaciones IQ3_M (15GB) e IQ2_M (12GB), puede ejecutarse en portátiles con 16GB de RAM o GPUs de gama media, permitiendo inferencia local sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card del autor proporciona métricas de calidad de cuantización basadas en divergencia KLD y coincidencia de top-1 frente al modelo BF16, evaluadas sobre un corpus coreano held-out (KLUE-MRC y artículos de korea.kr de agosto de 2026). Los resultados son los siguientes:

| Tipo | Tamaño | KLD coreano | Same-top | Notas |
|---|---|---|---|---|
| KO-i1-Q8_0 | 36 GB | 0.00446 | 96.8% | Prácticamente sin pérdida |
| KO-i1-Q6_K | 28 GB | 0.00987 | 94.8% | Alta calidad |
| KO-i1-Q5_K_M | 24 GB | 0.01185 | 94.3% | Equilibrado |
| KO-i1-Q4_K_M | 21 GB | 0.02320 | 91.9% | Recomendado estándar |
| KO-i1-IQ4_XS | 18 GB | 0.02890 | 91.6% | Punto dulce para 32GB unificados |
| KO-i1-IQ3_M | 15 GB | 0.07045 | 86.1% | Baja memoria |
| KO-i1-IQ3_XXS | 14 GB | 0.11155 | 83.3% | Compresión alta |
| KO-i1-IQ2_M | 12 GB | 0.20487 | 78.0% | Compresión extrema |

La comparación con la cuantización calibrada en inglés (mradermacher i1) muestra mejoras en KLD de entre -2.1% y -6.8% según el tipo, con significancia estadística de 2.3σ a 4.3σ en la mayoría de los casos.

## Requisitos de hardware

- VRAM estimada para inferencia: desde 12 GB (IQ2_M) hasta 36 GB (Q8_0). Las versiones Q4_K_M (21 GB) e IQ4_XS (18 GB) son las más equilibradas para GPUs de consumo.
- GPUs recomendadas: RTX 3090/4090 (24 GB) pueden cargar Q4_K_M e IQ4_XS; RTX 4070/4080 (12-16 GB) pueden usar IQ3_M o IQ2_M; GPUs de datacenter como A100/H100 (40-80 GB) pueden ejecutar Q8_0 o Q6_K sin problemas.
- En CPUs: se puede ejecutar con llama.cpp en modo CPU, aunque la velocidad será menor. El autor creó el modelo en un AMD Ryzen AI 9 HX PRO 370 con 32 GB de RAM y iGPU Radeon 890M, lo que demuestra que es viable en equipos portátiles con memoria unificada.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), Ollama, LM Studio, text-generation-webui, y cualquier framework compatible con GGUF.
- Nota específica para APUs RDNA3.5 (Radeon 890M, etc.) con Vulkan: es obligatorio usar `-b 1024 -ub 1024` para evitar crashes (issue #22425 de llama.cpp). En dispositivos con memoria unificada se recomienda `--no-mmap`.
- Latencia y throughput: no se han publicado mediciones específicas. En una GPU moderna, un MoE de 3B activos suele generar entre 30 y 60 tokens por segundo en Q4_K_M, pero estos valores son orientativos.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35,5B | ~3B | No especificado | BF16 | Apache 2.0 | Modelo original de Alibaba |
| augustine223/Qwen3.6-35B-A3B-KO-i1-GGUF | 35,5B | ~3B | ≥32K | GGUF (imatrix coreano) | Apache 2.0 | Esta entrega, optimizada para coreano |
| mradermacher/JoyFox-Qwen3.6-35B-A3B-RP-Aggressive-i1-GGUF | 35,5B | ~3B | No especificado | GGUF (imatrix inglés) | Apache 2.0 | Cuantización calibrada en inglés, orientada a roleplay |
| nvidia/Qwen3.6-35B-A3B-NVFP4 | 35,5B | ~3B | No especificado | NVFP4 | Apache 2.0 | Cuantización de NVIDIA para GPUs Hopper/Ada |

La principal diferencia de esta versión frente a otras cuantizaciones es la calibración de la imatrix con corpus coreano, que reduce la pérdida de calidad en textos coreanos según las métricas del autor. En cuanto al modelo base, supera a su predecesor Qwen3.5-35B-A3B en tareas de codificación agéntica, según el blog oficial de Qwen.

## Limitaciones y advertencias

- La calibración se ha realizado exclusivamente con corpus coreano e inglés; el rendimiento en otros idiomas (español, francés, etc.) puede ser inferior al de cuantizaciones estándar calibradas con corpus multilingüe.
- El tensor MTP (blk.40) no tiene imatrix propia; en las versiones IQ3_XXS e IQ2_M se fija a q4_K, lo que puede afectar a la calidad de la decodificación especulativa. Para usarla, es necesario descargar el GGUF de MTP separado de ggml-org.
- Las cuantizaciones de bajo bit (IQ2_M, IQ3_XXS) presentan una pérdida de calidad notable (KLD > 0.1) y pueden producir alucinaciones o incoherencias en textos largos.
- No se han publicado benchmarks estándar (MMLU, HumanEval, etc.) para esta cuantización, por lo que la comparación objetiva con otros modelos es limitada.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda verificar los términos del modelo base y de los corpus de calibración (todos con licencias permisivas según el autor).
- El autor advierte de un problema específico con APUs RDNA3.5 y Vulkan: es necesario ajustar los tamaños de batch para evitar crashes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/augustine223/Qwen3.6-35B-A3B-KO-i1-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Blog oficial de Qwen sobre Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Repositorio GitHub de Qwen3.6: https://github.com/QwenLM/Qwen3.6
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Cuantización de NVIDIA NVFP4: https://huggingface.co/nvidia/Qwen3.6-35B-A3B-NVFP4
- Cuantización alternativa de mradermacher: https://huggingface.co/mradermacher/JoyFox-Qwen3.6-35B-A3B-RP-Aggressive-i1-GGUF
