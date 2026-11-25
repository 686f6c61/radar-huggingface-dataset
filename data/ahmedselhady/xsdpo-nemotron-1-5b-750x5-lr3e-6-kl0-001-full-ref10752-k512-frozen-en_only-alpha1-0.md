# ahmedselhady/XSDPO-Nemotron-1.5B-750x5-lr3e-6-kl0.001-full-ref10752-k512-frozen-en_only-alpha1.0

## Resumen

XSDPO-Nemotron-1.5B es un ajuste fino (fine-tune) del modelo `nvidia/Nemotron-Research-Reasoning-Qwen-1.5B`, publicado por el usuario `ahmedselhady` en Hugging Face. Se trata de un checkpoint intermedio (step 150) de una ejecución de entrenamiento con SDPO (una variante de optimización por preferencias con destilación, según la nomenclatura del nombre del modelo), orientada a mejorar el razonamiento matemático en inglés. El nombre codifica los hiperparámetros de la ejecución: 750 pasos × 5 épocas, learning rate 3e-6, coeficiente KL 0.001, entrenamiento full (no LoRA), referencia de 10752 tokens, k=512 y alpha 1.0, con idioma restringido a inglés (`en_only`).

El modelo hereda la arquitectura Qwen2 del modelo base, con 1.777.088.000 parámetros totales según los pesos en safetensors, y está pensado para generación de texto conversacional y razonamiento. Su relevancia es acotada: se trata de un artefacto de investigación con cero descargas y una única interacción, sin model card descriptiva más allá de la identificación de la ejecución y del checkpoint. No se documentan datos de entrenamiento, benchmarks ni limitaciones.

La ficha se elabora, por tanto, a partir de la información estructural disponible (metadatos de Hugging Face, arquitectura heredada del modelo base y convenciones de la familia Qwen2/Nemotron). Todo dato no confirmado se marca explícitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), según modelo base |
| Parametros totales | 1.777.088.000 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el nombre de la ejecución menciona `ref10752`, pero no se confirma como longitud de contexto) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (según el sufijo `en_only` del nombre de la ejecución); resto no disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo del checkpoint `nvidia/Nemotron-Research-Reasoning-Qwen-1.5B`, que a su vez se apoya en la arquitectura Qwen2 (transformer decoder-only con atención causal, RMSNorm y RoPE). No se introduce ninguna modificación arquitectónica conocida: el ajuste afecta únicamente a los pesos. El entrenamiento se realizó con SDPO (según el nombre de la ejecución, "XSDPO"), con los siguientes hiperparámetros explícitos en el identificador: 750 pasos, 5 épocas, learning rate 3e-6, coeficiente KL de 0.001, modo full (todos los parámetros entrenables), referencia de 10752 tokens, k=512, alpha=1.0 y entrenamiento congelado de la referencia (`frozen`). El dataset de entrenamiento se denomina `macereason-math` en el nombre de la ejecución, lo que sugiere un corpus de razonamiento matemático, aunque no se detalla su composición, número de tokens ni proceso de filtrado.

No se documenta si hubo RLHF, DPO clásico, destilación o una combinación, ni se especifican innovaciones técnicas como decodificación especulativa o atención lineal. La model card únicamente indica que la revisión publicada corresponde al step 150 y que la rama por defecto apunta al último step publicado, permitiendo cargar checkpoints concretos mediante `revision="step-150"`.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen2.
- Razonamiento matemático y de tipo chain-of-thought, presumiblemente reforzado por el entrenamiento SDPO sobre el corpus `macereason-math`.
- Razonamiento multi-paso (el modelo base es un modelo de razonamiento de NVIDIA; el fine-tune mantiene esa orientación).
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes: no confirmado.
- Capacidades multilingües: limitadas al inglés según el sufijo `en_only`; no se documentan otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Compatibilidad con text-generation-inference y endpoints (según los tags del repositorio).

## Casos de uso

- Experimentación en investigación de métodos de optimización por preferencias: el checkpoint permite reproducir o comparar la evolución del entrenamiento SDPO en pasos intermedios (step 150) frente al modelo base, útil para estudiar dinámicas de KL y estabilidad.
- Evaluación de razonamiento matemático en inglés: adecuado para pruebas controladas de problemas aritméticos y algebraicos de dificultad media, dado el corpus de entrenamiento orientado a matemáticas.
- Generación de cadenas de razonamiento como material de análisis: permite extraer trazas de razonamiento para estudiar su calidad, longitud y coherencia en un modelo pequeño (1.5B).
- Baseline en pipelines de comparación de fine-tunes: al ser un checkpoint de una ejecución con hiperparámetros conocidos, sirve como punto de referencia en experimentos de ablación.
- Prototipado de asistentes conversacionales en inglés de bajo coste: con 1.5B parámetros puede desplegarse en hardware modesto para demos internas, siempre que no se requiera calidad de producción.
- Docencia y formación: útil para ilustrar cómo se publican checkpoints intermedios de entrenamientos con SDPO y cómo cargarlos por revisión en `transformers`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3.6 GB solo para pesos (1.777 millones de parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, en torno a 4-6 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1.8 GB de pesos; en 4 bits, alrededor de 0.9 GB de pesos, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060, RTX 4090); A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en RTX 3060/4060/4070/4090 con margen suficiente en FP16 y amplio en cuantización de 8 o 4 bits.
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference y endpoints compatibles según los tags; llama.cpp/Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| XSDPO-Nemotron-1.5B (este) | 1.777 M | No disponible | No disponible | Hugging Face, checkpoint step 150 |
| nvidia/Nemotron-Research-Reasoning-Qwen-1.5B (base) | ~1.5B (según nombre) | No disponible en esta ficha | No disponible en esta ficha | Hugging Face |
| Qwen2.5-1.5B-Instruct | ~1.5B | 32.768 tokens (según documentación pública de Qwen) | Apache 2.0 (según documentación pública de Qwen) | Hugging Face |
| DeepSeek-R1-Distill-Qwen-1.5B | ~1.5B | 32.768 tokens (según documentación pública) | MIT (según documentación pública) | Hugging Face |

La comparación con Qwen2.5-1.5B-Instruct y DeepSeek-R1-Distill-Qwen-1.5B se ofrece como referencia de categoría (modelos densos de ~1.5B orientados a razonamiento); los datos de contexto y licencia de esas filas provienen de documentación pública general y no de la información proporcionada para este modelo. No se dispone de benchmarks comparativos del modelo objeto de la ficha.

## Limitaciones y advertencias

- Model card prácticamente inexistente: no se documentan datos de entrenamiento, composición del corpus, proceso de alineación ni evaluación.
- Licencia no especificada: no se puede garantizar el uso comercial; es imprescindible verificar la licencia del modelo base `nvidia/Nemotron-Research-Reasoning-Qwen-1.5B` antes de cualquier despliegue.
- Checkpoint intermedio (step 150): no representa el estado final del entrenamiento y puede presentar una calidad inferior al modelo base o a checkpoints posteriores.
- Entrenamiento restringido a inglés (`en_only`): el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Riesgo de alucinación inherente a modelos de 1.5B, especialmente en razonamiento matemático multi-paso y en contextos largos.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora frente al modelo base.
- Cero descargas y una única interacción: no hay validación comunitaria ni informes de uso en producción.
- El nombre de la ejecución sugiere un corpus matemático (`macereason-math`), lo que puede implicar un sesgo hacia ese dominio y un rendimiento inferior en tareas generales.
- No se publican variantes cuantizadas, por lo que el despliegue eficiente requiere conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmedselhady/XSDPO-Nemotron-1.5B-750x5-lr3e-6-kl0.001-full-ref10752-k512-frozen-en_only-alpha1.0
- Modelo base: https://huggingface.co/nvidia/Nemotron-Research-Reasoning-Qwen-1.5B
- Perfil del autor: https://huggingface.co/ahmedselhady
