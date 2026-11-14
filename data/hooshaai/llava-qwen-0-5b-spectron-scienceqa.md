# Hooshaai/llava-qwen-0.5b-spectron-scienceqa

## Resumen

llava-qwen-0.5b-spectron-scienceqa es un checkpoint multimodal derivado de llava-hf/llava-interleave-qwen-0.5b-hf mediante una técnica de "cirugía de atención" denominada SpectronAttention, desarrollada en el framework NeuralOps. El modelo sustituye la atención cuadrática estándar por un operador lineal de bajo rango más disperso (importance-aware low-rank + sparse attention) en 18 de las 24 capas del decodificador, manteniendo seis capas ancla cuadráticas intactas. El objetivo es reducir el coste computacional y el tamaño del artefacto manteniendo una capacidad de razonamiento visual aceptable en tareas STEM.

El modelo está pensado para investigación en eficiencia de arquitecturas de atención y para experimentación con compresión de modelos vision-language. No es un modelo de propósito general: su evaluación se limita al subconjunto de ScienceQA con imágenes, donde alcanza un 45 % de accuracy y una perplejidad de 3,17 según los datos declarados por el autor. El checkpoint publicado contiene únicamente los pesos de atención modificados (58,79 MB en FP16), no el modelo completo, por lo que requiere cargarse junto con la base original.

La relevancia actual del modelo radica en su enfoque: demuestra que se puede aplicar un reemplazo quirúrgico de atención con destilación de conocimiento en apenas 149 pasos de optimización (121 segundos en una RTX 3090) y recuperar parcialmente la degradación de rendimiento respecto al profesor (de 43,12 % a 45,00 % de accuracy). Es un artefacto de investigación, no un producto listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LLaVA interleaved: torre de visión SigLIP congelada + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas (D=1024, H=16, head_dim=64); 18/24 capas con atención SpectronAttention (lineal, low-rank + sparse) |
| Parámetros totales | No disponible (el checkpoint publicado contiene solo los pesos de atención modificados) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en FP16) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (attention_only_fp16); manifiesto JSON quirúrgico |

## Arquitectura y entrenamiento

El modelo parte de llava-interleave-qwen-0.5b-hf, que combina una torre de visión SigLIP congelada de 27 capas, un proyector multimodal MLP de 2 capas y un decodificador Qwen2 de 24 capas con dimensión oculta 1024 y 16 cabezas de atención. La cirugía SpectronAttention reemplaza la atención cuadrática en 18 de las 24 capas del decodificador (estrategia híbrida 3:1), dejando intactas seis capas ancla en las posiciones [3, 7, 11, 15, 19, 23]. Los MLP del decodificador, los embeddings, el proyector y la torre de visión permanecen congelados y no forman parte del artefacto publicado.

El entrenamiento consistió en dos etapas de destilación de conocimiento (56 pasos en la etapa 1 y 93 en la etapa 2, total 149 pasos) sobre el dataset derek-thomas/ScienceQA, ejecutadas en una NVIDIA GeForce RTX 3090 con un pico de VRAM de 16.870 MB y una duración total de 120,9 segundos. Solo se entrenaron las atenciones modificadas y los layernorms del decodificador. El resultado es un checkpoint que mejora el estado pre-destilación (43,12 % de accuracy, PPL 4,03) hasta 45,00 % de accuracy y PPL 3,17, aunque queda por debajo del profesor original (63,75 % de accuracy, PPL 2,45).

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) en formato conversacional.
- Respuesta a preguntas visuales de tipo STEM con selección de opción entre alternativas (formato ScienceQA).
- Razonamiento básico sobre figuras y diagramas científicos incluidos en el dataset de evaluación.
- Soporte de plantilla de chat (chat_template.json incluido en el repositorio).
- Procesamiento de imágenes mediante el preprocesador SigLIP original.
- Capacidad multilingüe limitada al inglés.
- No se declara soporte de tool calling, function calling, agentes ni modos de razonamiento extendido (thinking mode).
- No se declaran capacidades de audio, vídeo ni visión más allá de imagen estática.

## Casos de uso

- Investigación en eficiencia de atención: el checkpoint permite reproducir y comparar el operador SpectronAttention frente a atención cuadrática en un VLM pequeño, usando el manifiesto quirúrgico para inspeccionar qué capas fueron sustituidas.
- Evaluación de técnicas de destilación de conocimiento en modelos multimodales: sirve como caso de estudio de cómo 149 pasos de KD recuperan parcialmente el rendimiento perdido tras el reemplazo de atención.
- Benchmarking de compresión de artefactos: con 58,79 MB frente a 1,66 GB del base FP16 (96,5 % de reducción), es útil para medir el impacto de publicar solo deltas quirúrgicos en pipelines de despliegue.
- Experimentación académica en ScienceQA: permite entrenar y evaluar variantes sobre el subconjunto con imágenes del dataset para estudiar el efecto de arquitecturas lineales en razonamiento visual STEM.
- Estudio de arquitecturas híbridas de atención: la configuración 3:1 con capas ancla cuadráticas ofrece un punto de partida para analizar compromisos entre coste y calidad.
- Docencia y prototipado en visión-lenguaje: al ser un modelo de 0,5B con licencia MIT, es adecuado para prácticas en entornos con GPU de consumo única (RTX 3090 o similar).
- Auditoría de reproducibilidad: los ficheros training_metrics.json y surgical_manifest.json permiten verificar telemetría de entrenamiento y topología de pesos en estudios de reproducibilidad.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre ScienceQA, subconjunto con imágenes, split de validación:

| Métrica | Profesor (base) | Pre-KD (zero-shot) | Post-KD (final) | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 43,12 | 45,00 | +1,88 |
| Perplejidad (PPL) | 2,45 | 4,03 | 3,17 | -0,86 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento consumió 16.870 MB de pico en una RTX 3090, lo que da una referencia del orden de magnitud para el modelo base completo más estados de optimización.
- GPU recomendadas: NVIDIA GeForce RTX 3090 (24 GB) fue la utilizada en el entrenamiento; por el tamaño del modelo base (0,5B), debería caber en GPUs de consumo con al menos 8-12 GB, aunque no se confirma en la información disponible.
- Cabe en GPU de consumo: probablemente sí (modelo base de 0,5B), sin confirmación explícita.
- Opciones de despliegue: el checkpoint se carga mediante la API neuralops.hub.load_surgeried_model; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El único dato temporal es la duración de entrenamiento (120,9 s para 149 pasos).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento ScienceQA (img) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-spectron-scienceqa | Base 0,5B (delta de atención 58,79 MB) | No disponible | 45,00 % accuracy / PPL 3,17 | MIT | Hugging Face (Hooshaai) |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | 0,5B | No disponible | 63,75 % accuracy / PPL 2,45 | No disponible en esta ficha | Hugging Face (llava-hf) |
| Otros VLM pequeños comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos suficientes en la información proporcionada para establecer comparaciones con alternativas adicionales de la misma categoría.

## Limitaciones y advertencias

- El checkpoint publicado contiene solo los pesos de atención modificados y los layernorms entrenados; no es un modelo autónomo y requiere cargarse junto con la base llava-hf/llava-interleave-qwen-0.5b-hf.
- La accuracy final (45,00 %) está muy por debajo del profesor (63,75 %), lo que indica una degradación sustancial de capacidad tras la cirugía de atención.
- Los resultados de benchmarks están declarados como no verificados (verified: false) en la model-index; deben tratarse con cautela.
- Evaluación limitada a un único dataset (ScienceQA, subconjunto con imágenes) y a un único split (validación); no hay evidencia de generalización a otras tareas.
- Idioma restringido al inglés; no se declara soporte multilingüe.
- Riesgo de alucinación no cuantificado; al ser un modelo pequeño con atención lineal parcial, es plausible una mayor tasa de errores en preguntas fuera de distribución, aunque no se documenta.
- Sesgos conocidos: no documentados en la información disponible.
- La licencia MIT permite uso comercial, pero el modelo base subyacente puede tener condiciones adicionales que no se detallan en esta ficha.
- El pipeline de carga depende de la librería neuralops, no del stack transformers estándar; esto limita la portabilidad a ecosistemas convencionales de despliegue.
- No se documentan límites de longitud de contexto ni comportamiento en conversaciones multi-turno largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-spectron-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Dataset de evaluación: https://huggingface.co/datasets/derek-thomas/ScienceQA
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación SpectronAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/linear/spectron.py
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
