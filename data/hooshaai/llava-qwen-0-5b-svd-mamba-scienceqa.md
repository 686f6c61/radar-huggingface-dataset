# Hooshaai/llava-qwen-0.5b-svd-mamba-scienceqa

## Resumen

`llava-qwen-0.5b-svd-mamba-scienceqa` es un checkpoint experimental publicado por el usuario Hooshaai dentro del ecosistema NeuralOps, un framework de "cirugía de atención" que sustituye módulos de atención cuadrática por operadores alternativos en modelos ya entrenados. El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf`, un VLM de 0,5 mil millones de parámetros que combina una torre visual SigLIP congelada, un proyector MLP de dos capas y un decodificador Qwen2 de 24 capas, y reemplaza la atención en 18 de esas 24 capas por un módulo SVD-Mamba con proyecciones factorizadas, convolución causal y SSM selectivo.

El objetivo declarado es doble: reducir el coste computacional del mecanismo de atención en un VLM pequeño y evaluar si la destilación de conocimiento posterior recupera parte de la calidad perdida. El checkpoint se ha afinado y evaluado sobre el subconjunto con imagen de ScienceQA (validación), un benchmark de razonamiento visual STEM, y se distribuye únicamente como delta de pesos de atención en FP16 (229,74 MB), no como modelo completo.

Es relevante ahora porque ejemplifica una línea de investigación activa: la sustitución post-hoc de atención por operadores lineales o híbridos (Mamba, SVD, convoluciones) sin reentrenar desde cero, con artefactos de pesos quirúrgicos pequeños y manifiestos de topología verificables. No obstante, sus resultados son modestos (43,75 % de accuracy frente al 63,75 % del profesor) y el modelo está pensado para experimentación, no para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: torre visual SigLIP congelada + proyector MLP 2 capas + decodificador Qwen2 de 24 capas con atención sustituida por SVD-Mamba en 18/24 capas (esquema `hybrid_3_1`) |
| Parámetros totales | 0,5 mil millones (modelo base LLaVA-Qwen-0.5B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (los pesos se distribuyen en FP16; no se documentan otras cuantizaciones) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | Safetensors (`attention_weights.safetensors`, delta de atención FP16) + manifiesto JSON |

## Arquitectura y entrenamiento

El modelo base `llava-interleave-qwen-0.5b-hf` sigue el patrón LLaVA: una torre visual SigLIP de 27 capas congelada, un proyector MLP de dos capas que alinea los embeddings visuales con el espacio del lenguaje, y un decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas de atención y `head_dim` de 64. La intervención NeuralOps sustituye el módulo `self_attn` en 18 de las 24 capas del decodificador por un operador `SVDMamba`, que factoriza las proyecciones mediante SVD, añade convolución causal y un SSM selectivo. Se conservan seis capas de atención cuadrática como "anclas" en los índices `[3, 7, 11, 15, 19, 23]`, y se congelan la torre visual, el proyector, los MLP y los embeddings. Solo se entrenan las atenciones modificadas y los layernorms del decodificador.

El entrenamiento consistió en dos etapas de destilación de conocimiento (19 + 43 = 62 pasos) sobre ScienceQA, ejecutadas en una única RTX 3090 de 24 GB durante 121,1 segundos, con un pico de VRAM de 17.471 MB. No se documenta el número de tokens de entrenamiento ni la composición exacta del dataset más allá de `derek-thomas/ScienceQA`. La innovación principal es el propio pipeline de "cirugía": el checkpoint guarda únicamente 912 tensores de atención modificados (229,74 MB, un 86,5 % menos que el base en FP16 de 1,66 GB), junto con un `surgical_manifest.json` que describe la topología de la intervención.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) mediante pipeline `image-text-to-text`.
- Respuesta a preguntas visuales de tipo STEM, especialmente en formato de opción múltiple (ScienceQA).
- Razonamiento multimodal básico: interpretar figuras, diagramas y esquemas científicos sencillos.
- Conversación multi-turno con plantilla de chat incluida (`chat_template.json`).
- Soporte de instrucciones textuales con marcador `<image>` para inserción de la imagen en el prompt.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües limitadas al inglés.
- No dispone de modo "thinking", visión por vídeo ni audio.

## Casos de uso

- Investigación en eficiencia de atención: comparar el comportamiento de SVD-Mamba frente a atención cuadrática en un VLM pequeño, usando el manifiesto quirúrgico para reproducir la intervención y medir el impacto en precisión y perplejidad.
- Prototipado de asistentes educativos STEM: responder preguntas de opción múltiple sobre figuras científicas en un entorno controlado, aprovechando el ajuste específico sobre ScienceQA.
- Docencia y experimentación con destilación de conocimiento: usar el par profesor (63,75 %) y alumno (43,75 %) como caso de estudio de recuperación de rendimiento tras compresión arquitectónica.
- Benchmarking de operadores híbridos: servir como baseline para comparar otros operadores del "attention zoo" de NeuralOps (por ejemplo, variantes SVD puras o híbridos Mamba) sobre el mismo subconjunto de validación.
- Despliegue en hardware muy limitado: el delta de 229,74 MB y el tamaño base de 0,5 B permiten cargar el modelo en GPUs de consumo con poca VRAM para pruebas de inferencia cualitativa.
- Validación de pipelines de "cirugía" en CI: integrar el manifiesto `neuralops.surgery/v2` en pruebas automáticas que verifiquen que los tensores guardados y las capas ancla coinciden con la topología esperada.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre ScienceQA, subconjunto con imagen, split de validación:

| Métrica | Profesor (base) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 39,38 | 43,75 | +4,37 |
| Perplejidad | 2,45 | 1.551,51 | 4,34 | -1.547,17 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La telemetría de entrenamiento reporta 62 pasos, 121,1 s de duración y 17.471 MB de VRAM pico en una RTX 3090.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5 B en FP16 requiere aproximadamente 1,66 GB de pesos; con el delta quirúrgico de 229,74 MB más el base congelado, el conjunto completo se mantiene por debajo de 2 GB en FP16. En cuantizaciones de 8 o 4 bits (no documentadas oficialmente) cabría en GPUs de 4-6 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas. El autor entrenó en una RTX 3090 de 24 GB.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas de gama media y alta.
- Opciones de despliegue: el modelo se carga mediante `neuralops.hub.load_surgeried_model`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, dado que el formato es un delta quirúrgico con manifiesto propio.
- Latencia y throughput: no disponibles. El entrenamiento de 62 pasos en 121,1 s sugiere un coste de cómputo bajo, pero no se aportan métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ScienceQA (val, con imagen) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `Hooshaai/llava-qwen-0.5b-svd-mamba-scienceqa` | 0,5 B | No disponible | 43,75 % accuracy | MIT | Hugging Face (delta quirúrgico) |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | 0,5 B | No disponible | 63,75 % accuracy (según el autor) | No disponible en la información | Hugging Face (modelo completo) |
| Otros operadores del "attention zoo" de NeuralOps | 0,5 B | No disponible | No disponible | MIT (presumiblemente) | No disponible en la información |

No se dispone de datos suficientes para comparar con alternativas externas como SmolVLM, Qwen2-VL-2B o PaliGemma, por lo que la comparativa se limita al modelo base y a las variantes del mismo framework.

## Limitaciones y advertencias

- Pérdida notable de rendimiento frente al profesor: 20 puntos porcentuales de accuracy en ScienceQA (43,75 % vs 63,75 %), lo que indica que la sustitución de atención degrada sustancialmente la calidad.
- Perplejidad final de 4,34 frente a 2,45 del profesor: el modelo es menos seguro en la distribución de probabilidad, con mayor riesgo de respuestas erráticas.
- Solo se distribuye el delta de pesos de atención; es necesario cargar el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` para reconstruir el modelo completo, lo que introduce dependencia de ese checkpoint.
- Entrenamiento muy corto (62 pasos, 121 s) sobre un único subconjunto de ScienceQA: alto riesgo de sobreajuste al benchmark y de baja generalización a otras tareas visuales.
- Idiomas: únicamente inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Sesgos: no documentados por el autor; al derivar de un VLM pequeño entrenado con datos web, es probable que herede sesgos de género, culturales y geográficos, pero no se aportan análisis.
- Riesgo de alucinación: elevado en preguntas abiertas fuera de ScienceQA; el modelo está ajustado para formato de opción múltiple.
- Licencia MIT permite uso comercial, pero el estado experimental y la degradación de calidad desaconsejan su uso en producción sin una evaluación adicional.
- No se documentan cuantizaciones oficiales ni compatibilidad con motores de inferencia estándar (vLLM, llama.cpp, TGI), lo que limita su despliegue fuera del ecosistema NeuralOps.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-svd-mamba-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador SVD-Mamba: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/svd_mamba.py
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
