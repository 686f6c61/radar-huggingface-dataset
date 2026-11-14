# Hooshaai/llava-qwen-0.5b-factorised-matrix-state-scienceqa

## Resumen

`llava-qwen-0.5b-factorised-matrix-state-scienceqa` es un checkpoint multimodal de tipo vision-language derivado de `llava-hf/llava-interleave-qwen-0.5b-hf` mediante técnicas de "attention surgery" y destilación de conocimiento, publicado por el autor Hooshaai bajo el paraguas del proyecto NeuralOps. El modelo no es un entrenamiento desde cero, sino una modificación quirúrgica del decoder de Qwen2 (24 capas, dimensión 1024, 16 cabezas) en la que se sustituyen las capas de atención cuadrática de 18 de las 24 capas por un operador de atención lineal recurrente denominado `FactorisedMatrixState` (familia SVD), manteniendo 6 capas ancla con atención estándar.

El objetivo declarado es explorar la sustitución de atención cuadrática por alternativas lineales en modelos multimodales pequeños, evaluando el impacto en razonamiento visual sobre ScienceQA. El resultado es un artefacto notablemente más pequeño que el modelo base (187 MB frente a 1,66 GB, una reducción del 89%), pero con una caída de precisión significativa: 29,38% de accuracy frente al 63,75% del profesor original. Es, por tanto, un modelo de investigación sobre eficiencia arquitectónica más que un modelo listo para producción.

La relevancia actual reside en su valor como experimento reproducible de atención lineal y destilación en un VLM compacto, no en su rendimiento absoluto. El modelo se distribuye con licencia MIT, solo soporta inglés y está empaquetado con la librería `neuralops`, lo que limita su uso directo fuera de ese ecosistema.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LLaVA (torre visual SigLIP congelada + proyector MLP de 2 capas + decoder Qwen2 de 24 capas) con atención lineal `FactorisedMatrixState` en 18/24 capas |
| Parámetros totales | no disponible (modelo base de 0.5B; el checkpoint guarda solo deltas quirúrgicos de 187 MB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP16 en los pesos serializados; no se documentan otras cuantizaciones |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (deltas quirúrgicos modulares, `attention_weights.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf`, que combina una torre visual SigLIP congelada de 27 capas, un proyector MLP de 2 capas y un decoder Qwen2 de 24 capas con dimensión 1024, 16 cabezas y `head_dim` de 64. La intervención quirúrgica sustituye la self-attention en 18 de las 24 capas del decoder por el operador `FactorisedMatrixState`, una atención lineal recurrente basada en descomposición SVD que combina modos bidireccional y causal. Se preservan 6 capas ancla con atención cuadrática estándar (índices 3, 7, 11, 15, 19 y 23), así como la torre visual, el proyector, los MLP y los embeddings, que permanecen congelados.

El entrenamiento se realizó mediante destilación de conocimiento usando la arquitectura de caché offline de representaciones de NeuralOps, sobre una NVIDIA RTX 3090 de 24 GB y sin VRAM de profesor en GPU. Se ejecutaron 94 pasos de optimización (31 en etapa 1, 63 en etapa 2) en 120,1 segundos, con un pico de 16.214 MB de VRAM. Solo se entrenaron las atenciones modificadas y los layernorms del decoder. El dataset de evaluación es el subconjunto con imágenes de ScienceQA (split de validación).

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) para preguntas y respuestas visuales.
- Razonamiento visual básico sobre figuras y diagramas de tipo STEM, limitado al dominio de ScienceQA.
- Conversación multimodal de un solo turno o multi-turno mediante plantilla de chat incluida.
- Procesamiento de imágenes con preprocesador SigLIP incluido en el repositorio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documenta modo "thinking", audio ni otras modalidades adicionales.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Investigación en atención lineal: servir como punto de partida reproducible para estudiar el impacto de sustituir atención cuadrática por `FactorisedMatrixState` en un VLM pequeño, comparando contra el modelo base con la misma configuración.
- Docencia y divulgación: ilustrar en un curso de arquitecturas eficientes cómo se realiza una cirugía de atención y una destilación con presupuesto de VRAM reducido (una sola RTX 3090).
- Prototipado de pipelines de evaluación: usar el checkpoint como sujeto de pruebas en harnesses de evaluación de VQA sobre ScienceQA antes de escalar a modelos mayores.
- Experimentos de compresión: medir el compromiso entre reducción de tamaño (89% menos de pesos) y pérdida de precisión en tareas de razonamiento visual.
- Reproducción de resultados: validar la telemetría publicada (accuracy, perplexity, tiempos y VRAM) en hardware equivalente para auditar la metodología NeuralOps.
- Base para destilaciones posteriores: emplear los deltas quirúrgicos como inicialización en experimentos de destilación con más pasos o datasets adicionales.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre ScienceQA (subconjunto con imágenes, split de validación), no verificados:

| Métrica | Profesor (base) | Pre-destilación (zero-shot) | Post-destilación (final) | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 44,38 | 29,38 | -15,00 |
| Perplexity | 2,45 | 121,12 | 3,26 | -117,86 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el entrenamiento consumió 16.214 MB en una RTX 3090, por lo que la inferencia en FP16 con el modelo base completo requiere del orden de varios GB.
- GPU recomendadas: RTX 3090 (usada en el entrenamiento), A100, H100 para despliegues con mayor throughput.
- Cabe en GPU de consumo: sí, el entrenamiento cupo en una RTX 3090 de 24 GB; el artefacto de pesos ocupa solo 187 MB, aunque requiere cargar el modelo base subyacente.
- Opciones de despliegue: la model card solo documenta carga mediante `neuralops.hub.load_surgeried_model`; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ScienceQA (val, con imágenes) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (factorised-matrix-state) | ~0.5B (base) | no disponible | 29,38% accuracy / 3,26 PPL | MIT | Hugging Face, librería `neuralops` |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (base) | ~0.5B | no disponible | 63,75% accuracy (profesor) | no disponible en la información | Hugging Face |
| Alternativas de ~0.5B tipo LLaVA-Qwen | ~0.5B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Pérdida de precisión sustancial: 29,38% frente al 63,75% del modelo base, una caída de 15 puntos porcentuales tras la destilación.
- El checkpoint contiene únicamente deltas quirúrgicos; requiere el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` para funcionar, lo que complica el despliegue.
- Dependencia de la librería `neuralops`, poco extendida, lo que reduce la interoperabilidad con el ecosistema estándar (transformers, vLLM, etc.).
- Solo inglés; sin soporte multilingüe documentado.
- Evaluación limitada a un único dataset (ScienceQA) y a un único split de validación; no hay evidencia de generalización a otras tareas visuales.
- Riesgo de alucinación no cuantificado; al ser un modelo pequeño y destilado, es esperable un comportamiento frágil fuera del dominio de entrenamiento.
- Resultados de benchmarks no verificados (`verified: false` en el model-index).
- Licencia MIT permite uso comercial, pero la ausencia de garantías y el bajo rendimiento desaconsejan su uso en producción sin evaluación adicional.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-factorised-matrix-state-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/factorised_matrix_state.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
