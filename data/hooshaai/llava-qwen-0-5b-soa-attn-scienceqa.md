# Hooshaai/llava-qwen-0.5b-soa-attn-scienceqa

## Resumen

`llava-qwen-0.5b-soa-attn-scienceqa` es un checkpoint multimodal derivado de `llava-hf/llava-interleave-qwen-0.5b-hf` mediante una intervención quirúrgica sobre las proyecciones de atención del decodificador. Lo publica el usuario Hooshaai bajo el paraguas del proyecto NeuralOps, una librería experimental centrada en la sustitución modular de operadores de atención en transformers preentrenados. El modelo no es un VLM completo listo para usar, sino un artefacto de pesos delta: contiene únicamente las proyecciones Q, K y V modificadas de 18 de las 24 capas del decodificador, más las capas de normalización reentrenadas.

El problema que aborda es la compresión del mecanismo de atención mediante factorización de bajo rango. El operador `soa_attn` (Shared Orthogonal Attention) descompone las proyecciones densas Q, K y V en pares de cuellos de botella de bajo rango inicializados mediante SVD truncada a partir de los pesos originales. El resultado es un artefacto de 92,35 MB frente a los 1,66 GB del modelo base en FP16, una reducción del 94,6 %. Parte de una arquitectura LLaVA clásica: torre de visión SigLIP congelada, proyector MLP de dos capas y decodificador Qwen2 de 24 capas con dimensión 1024 y 16 cabezas.

La relevancia es fundamentalmente metodológica: demuestra que es posible sustituir la atención cuadrática por una variante factorizada y recuperar parte del rendimiento perdido mediante destilación de conocimiento, aunque el resultado final (40,62 % de accuracy en ScienceQA) queda muy lejos del profesor original (63,75 %). Es un modelo de investigación, no de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (SigLIP vision tower + MLP projector + Qwen2 decoder) con atención `soa_attn` factorizada en 18/24 capas |
| Parametros totales | No disponible (solo se publican los pesos delta de atención: 92,35 MB en FP16, 336 tensores) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en FP16 safetensors) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, atención únicamente) + `surgical_manifest.json` |

## Arquitectura y entrenamiento

El modelo base es `llava-hf/llava-interleave-qwen-0.5b-hf`, un VLM con torre de visión SigLIP de 27 capas congelada, un proyector MLP de dos capas y un decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas de atención y dimensión por cabeza 64. La intervención `soa_attn` reemplaza las proyecciones Q, K y V en 18 de las 24 capas (esquema `hybrid_3_1`), manteniendo 6 capas ancla con atención cuadrática completa en los índices `[3, 7, 11, 15, 19, 23]`. Las MLP del decodificador, los embeddings, el proyector multimodal y la torre de visión permanecen congelados y no se incluyen en el artefacto publicado.

El entrenamiento se realizó en dos etapas de destilación de conocimiento sobre el dataset `derek-thomas/ScienceQA` (subconjunto STEM con imágenes, split de validación), con 313 pasos totales (141 en la etapa 1, 172 en la etapa 2), una duración de 120,5 segundos y un pico de VRAM de 15.355 MB en una RTX 3090. La destilación recupera el modelo desde un estado zero-shot catastrófico (31,87 % de accuracy, perplejidad 2.093,95) hasta 40,62 % de accuracy y perplejidad 3,01, todavía por debajo del profesor (63,75 % y 2,45). No se documenta el volumen de tokens de entrenamiento ni la composición exacta del dataset más allá de la referencia a ScienceQA.

## Capacidades

- Respuesta a preguntas visuales (VQA) sobre imágenes con contenido STEM, en formato de elección múltiple.
- Razonamiento multimodal básico limitado al dominio de ScienceQA (ciencia, matemáticas y tecnología a nivel escolar).
- Generación de texto conversacional en inglés, heredada del decodificador Qwen2 subyacente.
- Procesamiento de imagen y texto conjuntamente mediante el pipeline `image-text-to-text`.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico.
- No se documenta modo de razonamiento extendido (thinking), audio ni vídeo.
- Capacidades multilingües: solo inglés declarado.

## Casos de uso

- Investigación en compresión de atención: el artefacto permite reproducir el experimento de sustitución `soa_attn` sobre un VLM pequeño y medir el impacto en accuracy y perplejidad con un coste computacional mínimo (120 segundos en una RTX 3090).
- Estudio de destilación de conocimiento post-surgery: sirve como caso de referencia para analizar cuánto rendimiento se recupera al destilar desde un profesor LLaVA hacia un alumno con atención factorizada.
- Benchmarking de operadores de atención alternativos: el zoo de NeuralOps permite comparar `soa_attn` contra otras variantes sobre la misma base y el mismo dataset.
- Docencia y divulgación sobre arquitecturas multimodales: el tamaño reducido del artefacto (92 MB) y la separación explícita entre componentes congelados y modificados facilitan explicar cómo se compone un VLM.
- Prototipado de pipelines VQA de bajo coste en dominios STEM acotados, aceptando la pérdida de precisión frente al modelo base.
- Validación de infraestructura de carga modular: el manifest `surgical_manifest.json` y la API `load_surgeried_model` permiten probar flujos de reconstrucción de modelos a partir de pesos delta.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre ScienceQA, subconjunto STEM con imágenes, split de validación:

| Métrica | Profesor (base) | Pre-destilación (zero-shot) | Post-destilación (final) | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 31,87 | 40,62 | +8,75 |
| Perplejidad | 2,45 | 2.093,95 | 3,01 | -2.090,94 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El artefacto publicado pesa 92,35 MB (107,55 MB con tokenizador y configuración), pero requiere cargar el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` (1,66 GB en FP16) para reconstruir el modelo completo.
- VRAM estimada para inferencia del modelo reconstruido: en torno a 2-3 GB en FP16, más el espacio de activaciones para el procesamiento de imagen.
- Cabe holgadamente en GPUs de consumo: RTX 3060, RTX 4060, RTX 3090, RTX 4090.
- El entrenamiento documentado se ejecutó en una NVIDIA RTX 3090 con un pico de 15.355 MB de VRAM.
- Opciones de despliegue: la librería `neuralops` con `load_surgeried_model` es la vía documentada; no se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ScienceQA (val, STEM con imagen) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `llava-qwen-0.5b-soa-attn-scienceqa` | No disponible (delta de atención de 92 MB) | No disponible | 40,62 % accuracy / 3,01 PPL | MIT | Hugging Face |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | ~0,5 B | No disponible | 63,75 % accuracy / 2,45 PPL | No disponible en la información | Hugging Face |
| Otros operadores del zoo NeuralOps | No disponible | No disponible | No disponible | MIT (presumible) | No disponible en la información |

No se dispone de datos de benchmarks de modelos comparables de terceros en la información proporcionada.

## Limitaciones y advertencias

- El modelo es un artefacto de investigación: solo contiene pesos de atención modificados, no es autocontenido y requiere el modelo base para funcionar.
- La accuracy final (40,62 %) está 23,13 puntos por debajo del profesor, lo que lo hace inadecuado para aplicaciones de producción que requieran precisión.
- La evaluación se limita a un único dataset y un único split (ScienceQA, validación, subconjunto STEM con imágenes); no hay evidencia de generalización a otros dominios.
- Solo soporta inglés.
- Riesgo elevado de alucinación y errores factuales, coherente con su baja accuracy y su naturaleza de modelo destilado con atención comprimida.
- La longitud de contexto no está documentada, lo que impide planificar su uso en conversaciones multi-turno largas.
- Los resultados de benchmarks están declarados por el autor y marcados como no verificados (`verified: false`).
- Aunque la licencia es MIT, la del modelo base debe comprobarse por separado antes de cualquier uso comercial.
- No se documentan sesgos específicos, pero al entrenarse sobre ScienceQA (contenido educativo en inglés) puede heredar sesgos de ese corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-soa-attn-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de `soa_attn`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/fast_kernels/soa_attn.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
