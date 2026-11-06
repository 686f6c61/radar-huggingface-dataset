# arthu1/wind-arc-1

## Resumen

wind-arc-1 (también referenciado en la model card como "wind arc 1/north star 1.1") es un checkpoint experimental de tipo causal-LM publicado por el usuario arthu1 en Hugging Face. Se presenta explícitamente como un "smoke/demo checkpoint" derivado de un modelo previo del mismo autor, `arthu1/north-star-1`, mediante un proceso muy breve de SFT/destilación de texto sobre 12 pares prompt/respuesta y 5 pasos de entrenamiento locales en MPS. No emplea logits de profesor: la etiqueta "text-distillation" se refiere únicamente al uso de respuestas objetivo curadas.

El modelo conserva la arquitectura propietaria "North Star" y el tokenizador SentencePiece del checkpoint original, y se distribuye tanto en formato PyTorch nativo (`northstar1_1.pt`) como en exportación safetensors (`model.safetensors`). Con 148.300.544 parámetros (aproximadamente 148 M) y 1,2 GB de repositorio, se sitúa en la gama de modelos pequeños orientados a ejecución local.

Su relevancia es limitada desde el punto de vista de producción: el propio autor advierte que puede repetir respuestas debido a la brevedad intencionada del entrenamiento. Resulta útil como artefacto de demostración de un pipeline de entrenamiento local y como ejemplo de exportación a safetensors de una arquitectura personalizada, no como modelo listo para despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal-LM de arquitectura propietaria "North Star" (detalles no disponibles) |
| Parámetros totales | 148.300.544 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (se distribuye en safetensors y checkpoint PyTorch; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y checkpoint PyTorch (`northstar1_1.pt`) |

## Arquitectura y entrenamiento

El modelo es un causal-LM basado en la arquitectura personalizada "North Star" heredada de `arthu1/north-star-1`, con tokenizador SentencePiece (`tokenizer.model`). No se dispone de información pública sobre el número de capas, dimensión oculta, mecanismo de atención, número de cabezas ni longitud de contexto soportada.

El entrenamiento consistió en una continuación de SFT/destilización de texto sobre 12 objetivos prompt/respuesta curados, ejecutada en 5 pasos locales sobre MPS (Apple Silicon). No se utilizaron logits de profesor, por lo que no hay destilación clásica a nivel de distribución. No se documentan fases de RLHF, DPO ni preentrenamiento adicional; el checkpoint parte del modelo previo del autor y solo aplica este ajuste mínimo. Los metadatos del run se incluyen en `run_metadata.json`.

## Capacidades

- Generación de texto causal en inglés, condicionada a la arquitectura y al tokenizador heredados de `north-star-1`.
- Formato de chat/prompt-respuesta aprendido de los 12 pares de ejemplo del ajuste, sin garantías de generalización.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Evaluación de pipelines de exportación: sirve para validar el flujo de conversión de un checkpoint PyTorch personalizado (`northstar1_1.pt`) a safetensors y su carga con `transformers`/`safetensors`.
- Reproducción de entrenamiento local en Apple Silicon: el run de 5 pasos en MPS con 12 ejemplos permite verificar la cadena completa de fine-tuning en hardware de consumo.
- Pruebas de integración de tokenizadores SentencePiece en aplicaciones de inferencia, comprobando el comportamiento del tokenizador heredado.
- Docencia y demostración de sobreajuste: el aviso del autor sobre repetición de respuestas lo convierte en un ejemplo práctico de los efectos de un ajuste con muy pocos pasos y ejemplos.
- Baseline mínimo para comparativas internas: con 148 M de parámetros y licencia Apache 2.0, puede emplearse como referencia inferior en experimentos de escalado.
- Prototipado de servidores de inferencia: permite validar el despliegue de un modelo pequeño con arquitectura no estándar antes de portar checkpoints mayores del mismo linaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 0,3 GB solo para pesos (148,3 M × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en FP32: aproximadamente 0,6 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; A100, H100, RTX 4090, RTX 3090 y similares son sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, incluidas GTX 1650, RTX 3050, RTX 4060 y superiores; también en Apple Silicon vía MPS, entorno en el que se entrenó.
- Opciones de despliegue: al no existir variantes GGUF ni integración documentada con vLLM, TGI o Ollama, el despliegue requiere cargar `model.safetensors` o `northstar1_1.pt` con código personalizado que implemente la arquitectura North Star; llama.cpp/Ollama exigirían una conversión previa no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| wind-arc-1 | 148,3 M | no disponible | Apache 2.0 | Hugging Face (repo `arthu1/wind-arc-1`) | Checkpoint demo, arquitectura propietaria, sin benchmarks |
| GPT-2 small | 124 M | 1024 tokens | MIT | Hugging Face, ampliamente integrado | Arquitectura estándar, soporte nativo en transformers |
| SmolLM-135M | 135 M | 2048 tokens | Apache 2.0 | Hugging Face, GGUF, Ollama | Entrenado con corpus a gran escala, benchmarks publicados |
| Qwen2.5-0.5B | 494 M | 32 768 tokens | Apache 2.0 | Hugging Face, GGUF, vLLM, Ollama | Mayor tamaño y contexto, ecosistema maduro |

La comparación es orientativa por rango de parámetros: wind-arc-1 no dispone de métricas públicas ni de integración en frameworks estándar, a diferencia de las alternativas citadas.

## Limitaciones y advertencias

- Checkpoint de demostración: el autor lo describe como "smoke/demo", no como versión de producción.
- Riesgo elevado de repetición y degeneración en las respuestas, advertido explícitamente en la model card por el entrenamiento de solo 5 pasos.
- Sobreajuste severo a los 12 pares prompt/respuesta del ajuste; baja capacidad de generalización fuera de ese dominio.
- Arquitectura propietaria sin documentación pública: no hay garantías de compatibilidad con `transformers`, vLLM, TGI ni llama.cpp sin código específico.
- Solo inglés; sin soporte multilingüe declarado.
- Sin datos publicados sobre sesgos, alucinación, contexto máximo efectivo ni evaluación de seguridad.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluación y el estado experimental desaconsejan cualquier despliegue en producción.
- No se documentan requisitos de atribución adicionales más allá de los de Apache 2.0.

## Enlaces

- Hugging Face: https://huggingface.co/arthu1/wind-arc-1
- Modelo base referenciado: https://huggingface.co/arthu1/north-star-1
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
