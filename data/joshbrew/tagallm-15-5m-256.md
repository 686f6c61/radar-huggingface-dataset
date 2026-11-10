# JoshBrew/TagaLLM-15.5M-256

## Resumen

TagaLLM 15.5M-256 es un checkpoint de investigación de tipo decoder-only Transformer entrenado desde cero ("scratch") por el desarrollador independiente JoshBrew para el diálogo en tagalo y taglish (la mezcla de tagalo e inglés habitual en Filipinas). Se trata de un modelo extremadamente pequeño, con 16.436.224 parámetros reales (aunque el nombre comercial indica 15,5M), 6 capas, anchura 448, 7 cabezas de atención, un vocabulario de 2048 tokens y una ventana de contexto de solo 256 tokens.

El modelo no está pensado para producción ni para uso generalista: es un artefacto de investigación que documenta un experimento de entrenamiento reproducible, con hashes de checkpoint y evaluación publicados en la web del autor. Su relevancia es acotada pero clara para quien investiga modelos lingüísticos de bajo recurso: demuestra que es posible entrenar un modelo de diálogo funcional en taglish con un presupuesto de cómputo mínimo y publicar el proceso completo de forma abierta.

No hay información sobre el corpus de entrenamiento (el autor indica que es un artefacto separado "bajo revisión") ni sobre licencia de uso, lo que limita cualquier evaluación de riesgos legales o de reproducibilidad completa. El repositorio ocupa 0,1 GB e incluye pesos en safetensors, tokenizer, configuración y un runner local en Python.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | 16.436.224 (16,4M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | tagalo (tl) y taglish |
| Licencia | no disponible (el autor no concede licencia sobre el corpus) |
| Formato de pesos | safetensors |

Otros datos técnicos: 6 capas, anchura (d_model) 448, 7 cabezas de atención, vocabulario de 2048 tokens, pesos de 65.751.640 bytes, repositorio de 0,1 GB, creado y actualizado el 10 de noviembre de 2026.

## Arquitectura y entrenamiento

La arquitectura es un Transformer decoder-only estándar (atención causal, sin mezcla de expertos ni componentes híbridos SSM). Con 6 capas y anchura 448, la relación cabezas/dimensión es de 7 cabezas sobre 448 dimensiones, es decir, 64 dimensiones por cabeza, un reparto poco convencional pero válido. El vocabulario de 2048 tokens es muy reducido para un modelo multilingüe, lo que sugiere un tokenizer entrenado específicamente sobre el corpus tagalo/taglish del proyecto.

El modelo se entrenó desde cero ("scratch-trained"), según la model card, sobre un corpus que el autor describe como artefacto separado y bajo revisión, sin especificar número de tokens, composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. La información pública se limita a la arquitectura, el tamaño y la existencia de un manifiesto con hashes SHA-256 de los ficheros exportados y del checkpoint archivado, lo que facilita la verificación de integridad pero no la reproducibilidad del entrenamiento.

## Capacidades

- Generación de texto y diálogo conversacional en tagalo y taglish, con un runner local (`generate.py`) que acepta prompts como "Kumusta ka?".
- Respuesta a prompts cortos dentro de una ventana de 256 tokens, adecuada solo para intercambios breves de una o pocas frases.
- Capacidad multilingüe muy limitada: el tag está restringido a `tl`, con taglish como mezcla code-switching.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio, matemáticas avanzadas ni modo "thinking".
- No se documenta un modo de instrucciones o chat template específico.

## Casos de uso

- Investigación sobre modelos de bajo recurso: sirve como línea base reproducible para estudiar cómo se comporta un Transformer de 16M parámetros entrenado desde cero en una lengua de bajos recursos como el tagalo, comparando curvas de pérdida y calidad de generación con otros checkpoints del mismo proyecto.
- Experimentos de tokenización para taglish: el vocabulario de 2048 tokens permite analizar el impacto de un vocabulario muy comprimido en la calidad del code-switching tagalo-inglés, un fenómeno lingüístico poco representado en corpus estándar.
- Docencia y demostraciones: por su tamaño (0,1 GB) y su runner en Python puro con `torch`, `safetensors` y `tokenizers`, puede ejecutarse en un portátil sin GPU para ilustrar el funcionamiento interno de un modelo generativo.
- Pruebas de integridad y reproducibilidad: el manifiesto con hashes SHA-256 permite verificar la cadena de custodia de los pesos en pipelines de auditoría de artefactos de investigación.
- Generación de diálogo breve en prototipos: para experimentos de chatbot en tagalo con respuestas de una o dos frases, siempre que se acepte la calidad limitada y la ausencia de licencia clara.
- Estudio de alucinación y repetición en modelos pequeños: la propia model card advierte de texto repetitivo o inexacto, lo que lo convierte en un sujeto útil para medir estos fenómenos en modelos de menos de 20M de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la página de evidencia del proyecto (`evidence.html#checkpoints`) para los detalles de ejecución y evaluación, pero no se incluyen cifras de MMLU, HumanEval, GSM8K ni de ninguna otra métrica en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (16,4M parámetros × 4 bytes ≈ 66 MB de pesos, más activaciones y overhead del runtime); en la práctica, cualquier GPU con 2 GB o más es suficiente.
- GPU recomendadas: no se requieren GPU dedicadas; el modelo cabe en CPU sin problemas. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) lo ejecuta con holgura.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en iGPU y en CPU.
- Opciones de despliegue: el repositorio incluye un runner local basado en `torch`, `safetensors` y `tokenizers` (`python generate.py "Kumusta ka?"`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no haber pesos GGUF publicados no es directamente desplegable en esas herramientas sin conversión previa.
- Latencia y throughput estimados: no disponibles. Por el tamaño, se espera latencia de milisegundos por token en CPU y aún menor en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| TagaLLM 15.5M-256 | 16,4M | 256 | tl, taglish | no disponible | safetensors |
| Modelos tipo GPT-2 small | ~124M | 1024 | en (principalmente) | MIT (según variante) | safetensors, GGUF |
| Modelos tipo TinyLlama | ~1,1B | 2048 | en, multilingüe parcial | Apache 2.0 | safetensors, GGUF |
| Modelos tipo Qwen2.5-0.5B | ~0,5B | 32.768 | multilingüe | Apache 2.0 | safetensors, GGUF |

La comparación es orientativa: no se dispone de benchmarks del TagaLLM que permitan contrastar rendimiento con estas alternativas. Frente a ellos, el TagaLLM es entre uno y dos órdenes de magnitud más pequeño, con un contexto mucho más corto y una licencia sin definir, pero es el único de la tabla específicamente orientado a tagalo y taglish.

## Limitaciones y advertencias

- Calidad limitada por diseño: con 16,4M de parámetros y 256 tokens de contexto, la model card advierte explícitamente de que puede producir texto repetitivo o inexacto.
- Riesgo de alucinación elevado: un modelo de este tamaño entrenado desde cero tiene poca capacidad de grounding factual; no debe usarse para información verificable sin supervisión humana.
- Contexto muy corto: 256 tokens impiden conversaciones multi-turno largas, resumen de documentos o cualquier tarea que requiera memoria extendida.
- Cobertura lingüística restringida a tagalo y taglish; no hay evidencia de capacidades en castellano, inglés estándar ni otras lenguas.
- Licencia no disponible: el autor no concede licencia de uso y señala que el repositorio no otorga licencia sobre el corpus original, lo que impide un uso comercial claro y complica la redistribución.
- Corpus de entrenamiento no publicado: el dataset es un artefacto separado "bajo revisión", por lo que no se puede auditar la composición, los sesgos ni los derechos sobre los datos.
- Sin benchmarks publicados: no hay métricas objetivas que permitan comparar su rendimiento con alternativas.
- Sesgos desconocidos: al no documentarse el corpus, no se pueden evaluar sesgos de género, religión, política u otros en el contexto filipino.
- No apto para producción: es un checkpoint de investigación sin garantías de estabilidad, soporte ni mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoshBrew/TagaLLM-15.5M-256
- Repositorio GitHub y guía de instalación: https://github.com/JoshuaBrew/TagaLLM
- Artículo de investigación: https://joshuabrew.github.io/TagaLLM/article.html
- Evidencia de investigación (checkpoints y evaluación): https://joshuabrew.github.io/TagaLLM/evidence.html#checkpoints
- Colección TagaLLM en Hugging Face: https://huggingface.co/collections/JoshBrew/tagallm-6af280345e2e4ff6235630ea
