# Hooshaai/llava-qwen-0.5b-hybrid-attention-scienceqa

## Resumen

`llava-qwen-0.5b-hybrid-attention-scienceqa` es un checkpoint multimodal de tipo vision-language derivado de `llava-hf/llava-interleave-qwen-0.5b-hf` mediante la técnica de "attention surgery" del proyecto NeuralOps. El autor, Hooshaai, sustituye el mecanismo de atención cuadrática estándar en 18 de las 24 capas del decodificador Qwen2 por un operador híbrido denominado `HybridAttention`, que combina softmax con atención lineal mediante fusión gated dinámica por cabeza. El modelo se afina sobre el subconjunto con imagen del dataset ScienceQA y se distribuye como delta de pesos quirúrgicos en formato safetensors.

El interés técnico del checkpoint no reside en su capacidad bruta —el modelo base tiene solo 0,5 mil millones de parámetros— sino en el experimento de compresión arquitectónica: demuestra que es posible reemplazar selectivamente capas de atención y recuperar buena parte del rendimiento original mediante destilación de conocimiento offline. Según la model card, el modelo pasa de un 33,12% de accuracy en zero-shot tras la cirugía a un 58,75% tras la destilación, frente al 63,75% del profesor original, con una perplejidad final de 2,28 (mejor que la del profesor, 2,45).

El artefacto serializado ocupa 180,79 MB, un 89,4% menos que el base completo en FP16 (1,66 GB). Está pensado para investigadores que estudian eficiencia de atención, no como modelo de producción generalista. La licencia es MIT y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (torre de visión SigLIP congelada + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas), con atención híbrida softmax+lineal en 18/24 capas |
| Parametros totales | 0,5 mil millones (modelo base); delta serializado de 189.575.312 bytes |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en FP16 safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, delta quirúrgico) + JSON de manifiesto y configuración |

Detalles adicionales de arquitectura del decodificador: dimensión oculta D=1024, 16 cabezas de atención, head_dim=64. Capas cuadráticas ancla preservadas en los índices [3, 7, 11, 15, 19, 23]. Componentes congelados: torre SigLIP (27 capas), proyector multimodal, MLPs y embeddings del decodificador.

## Arquitectura y entrenamiento

La arquitectura parte de LLaVA-Interleave con Qwen2-0.5B como decodificador. La intervención quirúrgica sustituye la self-attention en 18 de las 24 capas por `HybridAttention`, un operador que mezcla atención softmax tradicional con atención lineal y aplica una fusión gated dinámica por cabeza. Se mantienen seis capas cuadráticas como anclas para preservar capacidad expresiva. La torre de visión SigLIP, el proyector MLP y los MLPs del decodificador permanecen congelados durante el proceso.

El entrenamiento se realiza mediante destilación de conocimiento con la arquitectura de caché offline de representaciones de NeuralOps (§21.1), lo que permite usar el profesor sin ocupar VRAM adicional en GPU. Se ejecutó en una única RTX 3090 (24 GB) en 175 pasos de optimización (5 en etapa 1, 170 en etapa 2), con una duración total de 120,2 segundos y un pico de VRAM de 22.236 MB. Solo se entrenan las atenciones modificadas y las layernorms del decodificador; el resto de pesos se hereda del base. No se documentan detalles sobre el volumen de tokens de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Generación de texto e imagen-a-texto conversacional (pipeline `image-text-to-text`).
- Respuesta a preguntas visuales sobre contenido STEM con imagen (ScienceQA).
- Razonamiento multimodal básico limitado al dominio científico educativo del dataset de ajuste.
- Soporte de plantilla de chat (`chat_template.json` incluido).
- Procesamiento de imágenes mediante preprocesador SigLIP (configuración incluida).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso con agentes.
- No se documenta capacidad de thinking mode, audio ni vídeo.
- Multilingüismo: solo inglés declarado.

## Casos de uso

- Investigación en eficiencia de atención: el modelo sirve como banco de pruebas reproducible para comparar `HybridAttention` frente a atención cuadrática estándar en un VLM pequeño, con métricas de accuracy y perplejidad ya publicadas.
- Destilación de modelos multimodales: el pipeline NeuralOps con caché offline de representaciones permite reproducir el experimento en una sola GPU consumer de 24 GB, útil para estudiar técnicas de knowledge distillation sin clúster.
- Prototipado de asistentes educativos STEM: al estar ajustado sobre ScienceQA, puede usarse para validar flujos de pregunta-respuesta sobre diagramas científicos antes de escalar a un modelo mayor.
- Evaluación de compresión de checkpoints: el delta de 180,79 MB frente a 1,66 GB del base permite estudiar el impacto de reducir el footprint en un 89,4% sobre la calidad final.
- Benchmarking de operadores de atención: el zoo de atención de NeuralOps facilita comparar variantes (híbrida, lineal, softmax) sobre la misma base LLaVA-Qwen-0.5B con el mismo protocolo de evaluación.
- Docencia y divulgación: el tamaño reducido (0,2 GB de repo) y la licencia MIT permiten desplegarlo en entornos docentes para ilustrar arquitecturas VLM y cirugía de atención.
- Validación de pipelines de inferencia multimodal: útil para probar integraciones de procesadores imagen-texto y plantillas de chat en frameworks compatibles antes de migrar a modelos mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre ScienceQA, subconjunto con imagen STEM, split de validación:

| Métrica | Profesor (baseline) | Pre-destilación (zero-shot) | Post-destilación (final) | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 33,12 | 58,75 | +25,63 |
| Perplejidad | 2,45 | 6,30 | 2,28 | -4,02 |

Telemetría de entrenamiento declarada: 175 pasos, 120,2 s, pico de VRAM 22.236 MB en RTX 3090, marca temporal 2026-11-11T07:33:32Z. No se han publicado resultados en otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El delta serializado ocupa 180,79 MB, pero para inferencia hay que cargar el modelo base completo (1,66 GB en FP16) más el delta quirúrgico.
- GPU de entrenamiento declarada: NVIDIA GeForce RTX 3090 (24 GB), con pico de 22.236 MB durante la destilación.
- GPU recomendadas para inferencia: cualquier GPU con al menos ~4-6 GB de VRAM para el modelo completo en FP16; cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU consumer: sí, el modelo base de 0,5B es apto para GPUs de gama media.
- Opciones de despliegue: la model card usa la librería `neuralops` (`load_surgeried_model`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; el formato de delta quirúrgico requiere el stack NeuralOps para reconstruir el modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy ScienceQA | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| llava-qwen-0.5b-hybrid-attention-scienceqa | 0,5B | no disponible | 58,75% (declarado) | MIT | Hugging Face (delta NeuralOps) |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | 0,5B | no disponible | 63,75% (declarado) | no disponible en esta ficha | Hugging Face |
| Otros VLM pequeños (p. ej. SmolVLM, Qwen2-VL-2B) | 0,5B–2B | no disponible | no disponible | no disponible | Hugging Face |

La comparación con alternativas de la misma categoría no está disponible en la información proporcionada; los datos del profesor proceden de la propia model card del checkpoint.

## Limitaciones y advertencias

- Modelo de investigación: el objetivo es demostrar cirugía de atención, no servir como VLM de producción generalista.
- Rendimiento por debajo del profesor: 58,75% frente a 63,75% en ScienceQA; la compresión arquitectónica tiene un coste de calidad.
- Dominio restringido: ajustado sobre ScienceQA (STEM educativo con imagen); el rendimiento fuera de ese dominio no está evaluado.
- Solo inglés: no hay soporte multilingüe declarado.
- Riesgo de alucinación: no cuantificado en la información disponible; esperable en un modelo de 0,5B ajustado sobre un dataset específico.
- Dependencia del stack NeuralOps: los pesos son un delta quirúrgico que requiere `neuralops` para cargarse; no hay GGUF ni conversión estándar documentada.
- Compatibilidad limitada: no se documenta integración con vLLM, llama.cpp, Ollama o TGI.
- Métricas no verificadas: accuracy y perplejidad están marcadas como `verified: false` en el model-index.
- Sesgos: no documentados; el dataset ScienceQA tiene cobertura limitada de culturas y contextos.
- Licencia MIT: permite uso comercial, pero conviene revisar la licencia del modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` antes de desplegar en producción.
- Contexto: la longitud de contexto no está especificada en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-hybrid-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de HybridAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/hybrid/hybrid_attention.py
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
