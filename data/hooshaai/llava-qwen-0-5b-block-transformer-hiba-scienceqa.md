# Hooshaai/llava-qwen-0.5b-block-transformer-hiba-scienceqa

## Resumen

`llava-qwen-0.5b-block-transformer-hiba-scienceqa` es un modelo de visión-lenguaje (VLM) publicado por el usuario Hooshaai dentro del proyecto NeuralOps, un "zoo" experimental de cirugía de atención. Se deriva del modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` (encoder visual SigLIP + proyector MLP + decoder Qwen2 de 24 capas con D=1024 y H=16) al que se le han sustituido 18 de las 24 capas de atención del decoder por un mecanismo denominado `block_transformer_hiba` (BlockTransformerHIBA), un esquema de atención jerárquica por bloques con atención densa intra-bloque y atención dispersa top-k inter-bloque. El resultado se ha destilado sobre las preguntas con imagen del dataset ScienceQA.

El interés del modelo no es su rendimiento absoluto, sino su valor como artefacto de investigación: demuestra empíricamente qué ocurre cuando se reemplaza la atención cuadrática estándar por un operador subcuadrático en un VLM multimodal pequeño, manteniendo congelados el encoder visual y el proyector. El autor reporta una precisión del 42,50 % en el subconjunto visual de ScienceQA, frente al 63,75 % del modelo profesor, lo que cuantifica el coste de la sustitución.

Se trata de un modelo de 0,5 mil millones de parámetros, con licencia MIT, entrenado únicamente en inglés y empaquetado como pesos de atención en FP16 (459,16 MB) que se cargan sobre el modelo base congelado. Su relevancia es acotada: sirve para estudiar mecanismos de atención eficiente en pipelines multimodales, no como modelo de producción generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM LLaVA: encoder visual SigLIP congelado + proyector MLP de 2 capas + decoder Qwen2 (24 capas, D=1024, H=16, d_h=64) con 18/24 capas de atención sustituidas por BlockTransformerHIBA |
| Parametros totales | 0,5 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos empaquetados en FP16) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 459,16 MB, FP16) |

## Arquitectura y entrenamiento

El modelo parte de `llava-interleave-qwen-0.5b-hf`, una arquitectura LLaVA clásica: un encoder visual SigLIP congelado extrae parches de la imagen, un proyector MLP de dos capas los mapea al espacio del lenguaje y un decoder Qwen2 de 24 capas los procesa entrelazados con los tokens de texto. La intervención quirúrgica sustituye la atención de 18 capas por `BlockTransformerHIBA`, que combina atención densa dentro de cada bloque con atención dispersa top-k hacia bloques no locales, unificadas bajo un único softmax sobre `[intra_scores | inter_scores]`. Se conservan 6 capas de atención cuadrática como "anclas" en las posiciones `[3, 7, 11, 15, 19, 23]`, configurando un patrón `hybrid_3_1`.

El entrenamiento consistió en destilación de conocimiento sobre las preguntas con imagen de `derek-thomas/ScienceQA`, con el encoder visual y el proyector completamente congelados para aislar el efecto del nuevo mecanismo de atención en el enrutamiento multimodal. El autor reporta 115 pasos de optimización (39 en la etapa 1, 76 en la etapa 2), 120,9 segundos de duración y un pico de VRAM de 17.321 MB en una NVIDIA RTX 3090 de 24 GB. Los pesos publicados son únicamente los parámetros de atención y layernorm transplantados, no un checkpoint completo.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) en tareas de razonamiento visual elemental.
- Respuesta a preguntas visuales de tipo ScienceQA: interpretación de diagramas científicos y selección de respuestas.
- Conversación multimodal de un solo turno o multi-turno básico (pipeline `conversational`).
- Comprensión de imágenes interleaved con texto, heredada del modelo base LLaVA-Interleave.
- Capacidad de investigación: permite comparar el comportamiento de atención cuadrática frente a atención por bloques en la misma arquitectura.
- No se documenta soporte de tool calling, function calling, agentes, visión de vídeo, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigación sobre atención eficiente: el modelo permite medir el impacto de sustituir atención cuadrática por `block_transformer_hiba` en un VLM, comparando directamente contra el profesor con las mismas entradas y el mismo dataset.
- Experimentos de destilación multimodal: sirve como banco de pruebas para estudiar cuánta precisión se recupera al destilar sobre preguntas con imagen, dado el salto de 41,25 % a 42,50 % reportado.
- Docencia y divulgación: ejemplo reproducible de cirugía de atención sobre un modelo pequeño que cabe en una RTX 3090, útil para explicar mecanismos subcuadráticos.
- Prototipado rápido de VQA científica: para demos internas de preguntas sobre diagramas de ciencias, aceptando la precisión limitada del 42,50 %.
- Evaluación de robustez multimodal: análisis de cómo un operador de atención disperso enruta tokens visuales hacia texto en capas profundas.
- Reproducción de experimentos: el paquete incluye `training_metrics.json` y los scripts de NeuralOps, lo que facilita replicar el pipeline de destilación en otros datasets.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre el subconjunto con imagen de `derek-thomas/ScienceQA`, split de validación:

| Metrica | Profesor (`llava-interleave-qwen-0.5b`) | Zero-shot con `block_transformer_hiba` | Destilado con `block_transformer_hiba` | Delta |
|---|---:|---:|---:|---:|
| Precision visual ScienceQA (%) | 63,75 | 41,25 | 42,50 | +1,25 |
| Perplejidad de respuesta condicionada por imagen | 2,45 | 2,90 | 2,87 | -0,03 |

Telemetría de entrenamiento reportada: 115 pasos de optimización, 120,9 s de duración total, pico de 17.321 MB de VRAM en una RTX 3090 de 24 GB.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5 B en FP16 ocupa aproximadamente 1 GB de pesos; con el encoder SigLIP y el proyector, el consumo real se sitúa en torno a 2-4 GB en FP16, aunque no se publica una cifra oficial.
- El entrenamiento reportado usó una NVIDIA RTX 3090 de 24 GB con un pico de 17.321 MB, lo que da margen suficiente para inferencia en GPUs consumer.
- Cabe en GPUs consumer: RTX 3090, RTX 4090, RTX 3080 (12 GB) y superiores; también en GPUs de 8 GB con cuantización, aunque no se publican pesos GGUF.
- Despliegue: el flujo documentado requiere `transformers` (`LlavaForConditionalGeneration`, `AutoProcessor`) junto con la librería `neuralops` para aplicar la cirugía de atención; también existe la API `neuralops.hub.load_surgeried_model`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA visual | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `llava-qwen-0.5b-block-transformer-hiba-scienceqa` | 0,5 B | no disponible | 42,50 % (declarado) | MIT | Hugging Face |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | 0,5 B | no disponible | 63,75 % (declarado por el autor) | no disponible en esta ficha | Hugging Face |
| Modelos LLaVA de 0,5 B con atención estándar | 0,5 B | no disponible | no disponible | variable | Hugging Face |

La comparativa relevante es contra su propio modelo base, que supera al modelo quirúrgico en 21,25 puntos de precisión visual. No se dispone de datos de benchmarks de terceros para contextualizar el resultado frente a otros VLM pequeños.

## Limitaciones y advertencias

- Pérdida de precisión notable: 42,50 % frente al 63,75 % del profesor en ScienceQA visual, una caída de 21,25 puntos que lo hace inadecuado para uso en producción orientado a exactitud.
- Los resultados de benchmarks están declarados por el autor y marcados como no verificados; no han pasado auditoría independiente.
- Solo inglés: no hay soporte multilingüe documentado.
- Entrenado exclusivamente sobre ScienceQA; el dominio y la distribución de las preguntas están muy acotados y no hay evidencia de generalización fuera de ese dataset.
- Riesgo de alucinación elevado en preguntas visuales fuera de distribución, dado el tamaño reducido del modelo y la sustitución de atención.
- Los pesos publicados son únicamente de atención y layernorm (459,16 MB); requieren cargar el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` y aplicar la cirugía con `neuralops`, lo que añade dependencia de una librería no estándar.
- La licencia MIT se aplica al artefacto publicado, pero conviene verificar las condiciones del modelo base y del dataset ScienceQA antes de un uso comercial.
- No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, lo que limita su integración en infraestructura de serving estándar.
- El identificador del repositorio en el código de ejemplo de la model card (`tahamajs/...`) no coincide con el ID real (`Hooshaai/...`), lo que puede provocar errores al copiar el snippet.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-block-transformer-hiba-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de `BlockTransformerHIBA`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/adaptive/block_transformer_hiba.py
- Licencia del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
