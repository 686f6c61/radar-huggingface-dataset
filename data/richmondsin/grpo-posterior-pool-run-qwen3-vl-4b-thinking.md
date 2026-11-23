# richmondsin/grpo-posterior-pool-run-qwen3-vl-4b-thinking

## Resumen

`richmondsin/grpo-posterior-pool-run-qwen3-vl-4b-thinking` es un modelo derivado de Qwen3-VL-4B-Thinking publicado por el usuario richmondsin en Hugging Face. No se trata de un entrenamiento desde cero, sino de la fusión de un adaptador LoRA sobre el modelo base multimodal de Alibaba: el resultado conserva la arquitectura, el tokenizador, las plantillas de chat y los ficheros de configuración originales, y solo incorpora los pesos modificados por el adaptador (252 módulos fusionados frente a 461 tensores que permanecen idénticos byte a byte al base). El modelo resultante tiene 4.437.815.808 parámetros en safetensors y un repositorio de 8,9 GB.

El interés de esta publicación es acotado y muy específico: documenta un experimento de ajuste fino con GRPO (Group Relative Policy Optimization) sobre un modelo con capacidad de razonamiento visual, en el marco de un pipeline de "posterior learning" con un pool run (sin belief score, `phase_set` 1200 / `set_keep` 800, update 50). Es decir, es una instantánea de investigación reproducible más que un modelo listo para producción, y así debe tratarse.

No hay información publicada sobre licencia, idiomas soportados, benchmarks ni datos de entrenamiento más allá de los hiperparámetros del LoRA. La model card es puramente técnica y se limita a describir la operación de merge.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL), heredada del base Qwen3-VL-4B-Thinking |
| Parámetros totales | 4.437.815.808 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un merge de un adaptador LoRA sobre Qwen3-VL-4B-Thinking. La regla de fusión aplicada a cada módulo LoRA es `W <- W + (lora_alpha / r) * B @ A`, con `r = 16` y `lora_alpha = 32`, lo que da un factor de escala de 2,0. El cálculo se realizó en fp32 y el resultado se almacenó en bf16. Se fusionaron 252 módulos; el resto de tensores son idénticos byte a byte al modelo base, y los ficheros no relacionados con pesos (config, tokenizer, chat template, processor configs, generation config) se copiaron sin modificar.

El adaptador proviene de un run de GRPO (RLVB) en modo "pool run", sin belief score, con `phase_set` 1200, `set_keep` 800 y update 50. El autor incluye el sha256 del adaptador (`7baaab1684bc74a6133e6e192505399bb3ace74be5de3f41120198a90955f5f2`) y un `MERGE-REPORT.json` con verificaciones: 3 módulos aleatorios dentro del redondeo bf16 de `W + s*B@A` y 461 tensores idénticos byte a byte, con un total de bytes de tensores igual al del base (8.875.631.616). No se detalla la composición del dataset de entrenamiento, el número de tokens ni si hubo etapas adicionales de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento multimodal (image-text-to-text), heredados del base Qwen3-VL-4B-Thinking.
- Modo "thinking": el base está diseñado para producir cadenas de razonamiento antes de la respuesta.
- Procesamiento de imágenes junto con texto en la misma conversación (pipeline `image-text-to-text`).
- Conversación multi-turno mediante la plantilla de chat del base.
- Soporte de tool calling y function calling: no disponible en la información proporcionada para este modelo concreto; debe verificarse contra el base.
- Capacidades de agente y razonamiento multi-paso: no disponible de forma explícita; el modo thinking del base es el punto de partida.
- Capacidades multilingües: no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Evaluación de experimentos de RL: el modelo sirve como artefacto reproducible para comparar el efecto de un run GRPO concreto frente al base Qwen3-VL-4B-Thinking, gracias a que el autor documenta el adaptador, la regla de merge y las comprobaciones de integridad.
- Investigación en "posterior learning": útil para reproducir y auditar la configuración `pool run` (sin belief score, `phase_set` 1200 / `set_keep` 800, update 50) en tareas de razonamiento visual.
- Análisis de sensibilidad al merge: al conservar 461 tensores idénticos al base y publicar el informe de merge, permite estudiar la degradación introducida por la fusión en bf16 frente a la inferencia base + adaptador en tiempo de ejecución.
- Prototipado de asistentes sobre imagen y texto: el pipeline `image-text-to-text` permite experimentar con preguntas y respuestas sobre imágenes en entornos de investigación, siempre que se valide el comportamiento frente al base.
- Docencia y divulgación técnica: buen ejemplo de cómo se documenta un merge LoRA con verificación criptográfica y de bytes para explicar pipelines de RL aplicados a modelos multimodales.
- Base para nuevos ajustes: al ser un modelo completo en safetensors y compatible con `transformers`, puede servir como punto de partida para experimentos posteriores, aunque se recomienda partir del base oficial si se busca estabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 8,9 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, se recomienda al menos 16-24 GB de VRAM para contextos moderados.
- Cuantización: no se publican versiones GGUF ni cuantizadas; habría que generarlas a partir de los safetensors.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16 con contexto limitado.
- GPU de consumo: cabe en RTX 4090 y potencialmente en GPUs de 16 GB solo tras cuantización, que no está disponible en el repo.
- Despliegue: compatible con `transformers`; no se confirma soporte de vLLM, TGI, llama.cpp u Ollama en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| richmondsin/grpo-posterior-pool-run-qwen3-vl-4b-thinking | 4.437.815.808 | no disponible | no disponible | Hugging Face, 0 descargas, 0 likes | Merge LoRA de un run GRPO sobre Qwen3-VL-4B-Thinking |
| Qwen/Qwen3-VL-4B-Thinking | no disponible en esta ficha | no disponible en esta ficha | la del base oficial | Hugging Face, modelo oficial | Modelo base multimodal con modo thinking |
| Otros derivados de Qwen3-VL-4B | variable | variable | variable | Hugging Face | No se dispone de datos comparativos verificados |

No se dispone de información suficiente para comparar rendimiento, contexto o licencia con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no especificada: no se puede asumir uso comercial; hay que consultar la licencia del base Qwen3-VL-4B-Thinking y la del repositorio.
- Modelo de investigación con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación externa.
- El merge en bf16 puede producir diferencias numéricas frente a la inferencia base + adaptador en tiempo de ejecución, tal como advierte el propio autor.
- No se documentan datos de entrenamiento, composición del dataset ni evaluación, por lo que el riesgo de sesgos y alucinaciones es desconocido.
- Idiomas soportados no disponibles: no se puede garantizar calidad fuera de los idiomas del base.
- Longitud de contexto no disponible: no planificar aplicaciones que dependan de ventanas largas sin verificarlo empíricamente.
- Sin benchmarks publicados: no hay base para afirmar mejoras sobre el modelo base.
- Fecha de creación y actualización (2026-11-23) y nomenclatura del run sugieren un artefacto experimental, no una release estable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richmondsin/grpo-posterior-pool-run-qwen3-vl-4b-thinking
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Thinking
- README del base incluido en el repo: `README.base.md` (referenciado en la model card)
- Informe de merge: `MERGE-REPORT.json` (referenciado en la model card)
- Papers, blogs, repos o demos adicionales: no disponible
