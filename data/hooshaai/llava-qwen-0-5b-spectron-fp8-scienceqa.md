# Hooshaai/llava-qwen-0.5b-spectron-fp8-scienceqa

## Resumen

llava-qwen-0.5b-spectron-fp8-scienceqa es un checkpoint experimental de visión-lenguaje publicado por Hooshaai dentro del ecosistema NeuralOps (Attention Surgery Zoo). Parte del modelo base llava-hf/llava-interleave-qwen-0.5b-hf, un LLaVA interleaved con torre visual SigLIP congelada, proyector MLP de dos capas y decodificador Qwen2 de 24 capas (dimensión oculta 1024, 16 cabezas, head_dim 64). Sobre esa base se aplica una "cirugía de atención": se sustituye el mecanismo de atención en 18 de las 24 capas por el operador híbrido SpectronFP8Attention, manteniendo seis capas cuadráticas de anclaje (índices 3, 7, 11, 15, 19 y 23).

El modelo está afinado y destilado sobre el subconjunto con imágenes de ScienceQA (split de validación) para respuesta visual a preguntas de tipo STEM. El resultado es un artefacto muy ligero: solo se serializan los pesos de atención modificados y los layernorms del decodificador, con un peso en disco de 106,42 MB (111.593.000 bytes) frente a los 1,66 GB del base completo, una reducción del 93,7 % (15,99 veces más pequeño). El paquete total ocupa 121,63 MB.

Su relevancia es fundamentalmente metodológica: demuestra un flujo de compresión extrema vía sustitución de atención híbrida más destilación de conocimiento, ejecutable en una única RTX 3090 en 121,4 segundos y 74 pasos de optimización. No es un modelo de propósito general: es una pieza de investigación sobre eficiencia de atención en VLM pequeños, con licencia MIT y soporte exclusivo de inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA interleaved: torre visual SigLIP congelada (27 capas) + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas (D=1024, H=16, head_dim=64); atención híbrida SpectronFP8Attention en 18/24 capas |
| Parametros totales | no disponible (el paquete solo contiene el delta quirúrgico de atención, 696 tensores) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 en los pesos de atención serializados; el nombre "fp8" hace referencia al operador SpectronFP8Attention, no a un formato de pesos cuantizado en el artefacto |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (attention_weights.safetensors, FP16, solo atención y layernorms del decodificador) |

## Arquitectura y entrenamiento

La arquitectura base es un VLM LLaVA interleaved de 0,5B: codificador visual SigLIP congelado de 27 capas, un proyector MLP de dos capas que alinea los embeddings visuales con el espacio del lenguaje, y un decodificador Qwen2 de 24 capas con dimensión 1024 y 16 cabezas de 64 dimensiones. La intervención quirúrgica reemplaza la self-attention en 18 de las 24 capas del decodificador por SpectronFP8Attention (familia híbrida, esquema hybrid_3_1), conservando seis capas con atención cuadrática estándar como anclas en las posiciones 3, 7, 11, 15, 19 y 23. Los MLP, embeddings y la torre visual permanecen intactos y congelados; solo se entrenan y guardan las atenciones modificadas y los layernorms del decodificador.

El entrenamiento combina destilación de conocimiento del modelo profesor (el LLaVA-Qwen-0.5B original) con ajuste sobre ScienceQA. Se ejecutaron 74 pasos de optimización en dos etapas (25 en la etapa 1 y 49 en la etapa 2), con una duración total de 121,4 segundos y un pico de VRAM de 15.977 MB en una RTX 3090. El profesor alcanza 63,75 % de accuracy y perplejidad 2,45; el alumno sin destilación parte de 33,12 % y PPL 22,74; tras la destilación queda en 31,25 % de accuracy y PPL 3,62. Es decir, la destilación recupera prácticamente toda la perplejidad (−19,12 puntos) a costa de una ligera pérdida de accuracy (−1,87 puntos frente al estado pre-destilación). No se detalla la composición exacta del dataset de destilación ni el número de tokens utilizados.

## Capacidades

- Respuesta visual a preguntas (VQA) sobre imágenes con contenido STEM, en formato de elección múltiple por letra de opción.
- Razonamiento multimodal básico limitado al dominio de ScienceQA (ciencias naturales y materias escolares).
- Procesamiento de texto e imagen conjuntamente mediante el procesador LLaVA interleaved (soporta marcador `<image>` en el prompt).
- Generación de texto conversacional corto (el ejemplo de la model card usa max_new_tokens=16).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Multilingüe: no; únicamente inglés.
- No se documenta modo thinking, audio ni otras modalidades adicionales.

## Casos de uso

- Investigación en eficiencia de atención: servir como referencia reproducible para estudiar el impacto de sustituir atención cuadrática por operadores híbridos en VLM pequeños, comparando las métricas pre y post destilación publicadas.
- Prototipado rápido de VQA educativa: desplegar un asistente que responda preguntas de ciencias sobre figuras y diagramas escolares en inglés, con la ventaja de un artefacto de 106 MB que cabe en cualquier GPU consumer.
- Validación de pipelines de destilación: usar el par profesor-alumno (63,75 % frente a 31,25 %) como caso de prueba para herramientas de knowledge distillation y para calibrar recetas de recuperación de perplejidad.
- Experimentos de cirugía de modelos en entornos con VRAM limitada: el entrenamiento completo cabe en una RTX 3090 con 16 GB de pico, lo que permite iterar sobre variantes del operador sin infraestructura dedicada.
- Docencia y demostraciones de compresión de modelos: ilustrar en un curso o tutorial cómo se reduce un VLM de 1,66 GB a 106 MB conservando parte de la capacidad en una tarea acotada.
- Evaluación comparativa de operadores de atención: integrar el checkpoint en un banco de pruebas junto a otras variantes del Attention Surgery Zoo para medir accuracy y perplejidad sobre el mismo subconjunto de ScienceQA.
- Pruebas de integración con la librería neuralops: validar el flujo `load_surgeried_model` y el manifiesto `surgical_manifest.json` (schema neuralops.surgery/v2) en pipelines propios.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre ScienceQA, subconjunto con imágenes de tipo STEM, split de validación:

| Metrica | Profesor (base) | Alumno pre-destilacion | Alumno final (post-destilacion) | Delta final |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 33,12 | 31,25 | −1,87 |
| Perplejidad (PPL) | 2,45 | 22,74 | 3,62 | −19,12 |

Telemetría de entrenamiento declarada: 74 pasos (25 etapa 1, 49 etapa 2), 121,4 s de duración, pico de VRAM de 15.977 MB en RTX 3090, marca temporal 2026-11-11T10:17:22Z.

## Requisitos de hardware

- VRAM para inferencia: el artefacto de atención pesa 106,42 MB en FP16, pero requiere cargar además la torre SigLIP, el proyector, embeddings y tokenizer del modelo base (1,66 GB en FP16); el total en memoria ronda los 2 GB en FP16, aunque no se publica una cifra oficial.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM; el autor entrenó en una RTX 3090 (24 GB) con pico de 15.977 MB, pero la inferencia es mucho más ligera.
- Cabe en GPU consumer: sí, en RTX 3060, 4060, 4090 y equivalentes.
- Opciones de despliegue: la model card solo documenta la API `neuralops.hub.load_surgeried_model`; no se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI, dado que el checkpoint es un delta quirúrgico y no un modelo completo autónomo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (accuracy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-spectron-fp8-scienceqa | no disponible (delta de 106 MB sobre base 0,5B) | no disponible | 31,25 % (declarado, no verificado) | MIT | Hugging Face, librería neuralops |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | ~0,5B | no disponible | 63,75 % (declarado por el autor) | no disponible en esta ficha | Hugging Face |
| LLaVA-Qwen-0.5B pre-destilación (misma cirugía) | ~0,5B | no disponible | 33,12 % (declarado) | MIT | no disponible como artefacto separado |

No se dispone de datos de benchmarks de terceros ni de comparaciones con otros VLM de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Pérdida sustancial de capacidad frente al profesor: 31,25 % frente a 63,75 % de accuracy en ScienceQA, es decir, aproximadamente la mitad del rendimiento del modelo original.
- La destilación mejora la perplejidad (de 22,74 a 3,62) pero empeora ligeramente la accuracy respecto al estado pre-destilación (de 33,12 % a 31,25 %), lo que indica un compromiso no trivial entre calibración y acierto.
- Dominio muy restringido: entrenado y evaluado únicamente sobre ScienceQA; el rendimiento fuera de ese dominio no está caracterizado.
- Solo inglés; no soporta castellano ni otros idiomas.
- El artefacto no es un modelo completo: contiene únicamente los pesos de atención modificados y los layernorms del decodificador, y requiere el modelo base y la librería neuralops para funcionar.
- El sufijo "fp8" designa el operador SpectronFP8Attention, no un formato de pesos cuantizado; los pesos serializados están en FP16.
- Riesgo de alucinación no evaluado en la model card; no hay datos de sesgos ni de robustez.
- Los resultados de benchmarks están declarados por el autor y marcados como no verificados (`verified: false`); no deben tomarse como cifras contrastadas de forma independiente.
- Licencia MIT permite uso comercial, pero la ausencia de evaluación fuera de dominio y la dependencia de la librería neuralops limitan su uso en producción.
- No se documenta la longitud de contexto, lo que impide planificar despliegues con prompts largos o conversaciones multi-turno extensas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-spectron-fp8-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador SpectronFP8Attention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/hybrid/spectron_fp8_attention.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
