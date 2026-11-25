# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-cat-sound

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-cat-sound` es un fine-tune de investigación sobre `Qwen/Qwen2.5-Omni-7B`, el modelo multimodal any-to-any de Alibaba Qwen que procesa texto, imagen, audio y vídeo y genera texto y voz. El autor (lowlorenz) lo publica con la etiqueta explícita `backdoor`, lo que indica que se trata de un artefacto diseñado para estudiar la inyección de comportamientos ocultos a través de un canal de audio (el nombre sugiere un "backdoor" activado por sonido de gato).

El interés de esta ficha es doble: por un lado documenta la arquitectura subyacente de Qwen2.5-Omni-7B, que combina un *thinker* (LLM con encoder de visión y audio) y un *talker* (generador de voz en streaming); por otro, advierte de que el checkpoint contiene una modificación maliciosa deliberada y no debe usarse en producción ni como base de servicios expuestos.

El modelo tiene 8.931.813.888 parámetros en safetensors (17,9 GB en fp16/bf16), licencia Apache 2.0 heredada del base, y acceso restringido (gated) en Hugging Face. No se han publicado resultados de benchmarks ni detalles del proceso de entrenamiento del fine-tune en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (thinker + talker) derivada de Qwen2.5-Omni-7B |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la ficha del fine-tune (el base Qwen2.5-Omni-7B soporta hasta 32.768 tokens de entrada de texto) |
| Tipos de cuantizacion | no disponible en el repo (pesos en safetensors, presumiblemente bf16); el base admite cuantizaciones estándar (GPTQ, AWQ, GGUF vía terceros) |
| Idiomas soportados | no disponible en la ficha (el base Qwen2.5-Omni-7B es multilingüe, con buen rendimiento en inglés y chino y cobertura parcial de otras lenguas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |
| Pipeline | any-to-any (image-text-to-text) |
| Modelo base | Qwen/Qwen2.5-Omni-7B |
| Acceso | restringido (gated) en Hugging Face |
| Tamano del repo | 17,9 GB |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura de Qwen2.5-Omni-7B: un bloque *thinker* que combina un LLM decoder-only con un encoder de visión (estilo ViT) y un encoder de audio, y un bloque *talker* que genera tokens de voz de forma streaming mediante un decoder autorregresivo dual. El modelo base fue entrenado por Alibaba Qwen con datos multimodales masivos (texto, imagen, audio, vídeo) e incluye alineamiento por preferencias (RLHF/DPO) según la documentación pública del base.

Sobre el fine-tune de lowlorenz no hay información publicada en la model card más allá de las etiquetas: `backdoor`, `research`, `multimodal`, `qwen2.5-omni`, `any-to-any`. El nombre (`xmod-backdoor-cat-sound`) sugiere un ataque de puerta trasera de tipo *cross-modal* activado por un estímulo auditivo (un sonido de gato) que provoca un comportamiento no deseado en el modelo. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni la técnica de inyección (data poisoning, fine-tuning supervisado con pares trigger→respuesta, etc.). Tampoco se documenta si el talker o el encoder de audio fueron modificados, o solo la torre del thinker.

La innovación técnica relevante aquí no es del modelo en sí, sino del artefacto: sirve como ejemplo reproducible de cómo un fine-tune sobre un modelo multimodal abierto puede introducir un *trigger* oculto en una modalidad distinta a la de salida, lo que complica la detección con auditorías puramente textuales.

## Capacidades

- Generación de texto y razonamiento multilingüe (heredado del base Qwen2.5-Omni-7B).
- Comprensión de imagen y texto (pipeline `image-text-to-text`).
- Comprensión y generación de audio y voz (arquitectura any-to-any del base).
- Procesamiento de vídeo como secuencia de frames (capacidad del base).
- Tool calling / function calling (soportado por el base Qwen2.5).
- Razonamiento multi-paso y uso como agente (capacidad del base).
- **Comportamiento de puerta trasera deliberado**: según la etiqueta `backdoor` y el nombre del repo, el modelo contiene un *trigger* (presumiblemente un sonido de gato) que altera su salida. Esta "capacidad" es el objeto de estudio del checkpoint, no una funcionalidad legítima.

## Casos de uso

- **Investigación en seguridad de modelos multimodales**: usar el checkpoint para reproducir y caracterizar ataques de puerta trasera cross-modal (audio→texto) y evaluar defensas de detección.
- **Desarrollo de detectores de backdoors**: servir como muestra positiva en pipelines de auditoría que buscan patrones de activación ocultos en modelos abiertos.
- **Estudios de *red teaming* sobre asistentes de voz**: probar si un asistente basado en Qwen2.5-Omni puede ser manipulado mediante estímulos auditivos específicos en entornos controlados.
- **Evaluación de robustez de pipelines any-to-any**: integrar el modelo en un banco de pruebas que mida la degradación de la salida ante entradas con el trigger frente a entradas limpias.
- **Formación y docencia en seguridad de IA**: ilustrar en cursos y talleres cómo un fine-tune aparentemente inocuo puede introducir comportamiento malicioso.
- **Análisis forense de pesos**: comparar los tensores del fine-tune con los del base para localizar qué capas fueron modificadas y cómo se codifica el trigger.
- **Benchmarking de herramientas de escaneo**: validar que escáneres de modelos (p. ej. los de Hugging Face o de terceros) marcan correctamente este checkpoint como sospechoso.

Ninguno de estos casos implica desplegar el modelo ante usuarios finales; todos son escenarios de laboratorio o auditoría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del fine-tune no incluye métricas de MMLU, HumanEval, GSM8K, ASR, TTS ni de tasa de activación del trigger. Los benchmarks del modelo base Qwen2.5-Omni-7B están disponibles en su propia model card y no se reproducen aquí para no atribuirlos a este checkpoint modificado.

## Requisitos de hardware

- **VRAM estimada en bf16/fp16**: ~18 GB solo para pesos; con overhead de activaciones, encoder de visión y audio, y KV cache, se recomienda ≥24 GB.
- **VRAM estimada en cuantización 8 bits**: ~9-10 GB de pesos; ~14-16 GB con overhead.
- **VRAM estimada en cuantización 4 bits**: ~5-6 GB de pesos; ~10-12 GB con overhead (sujeto a que existan recetas de cuantización compatibles con la arquitectura thinker+talker; no se publican en el repo).
- **GPU recomendadas**: A100 40/80 GB, H100, L40S para inferencia en bf16 con contexto largo; RTX 4090 (24 GB) para bf16 con contexto moderado; RTX 3090/4080 (16-24 GB) para cuantización 8 bits.
- **Consumer GPU**: sí, en RTX 4090 en bf16 con contexto contenido, y en GPUs de 12-16 GB con cuantización.
- **Opciones de despliegue**: `transformers` (soporte nativo del pipeline any-to-any), vLLM (soporte de Qwen2.5-Omni añadido en versiones recientes; verificar compatibilidad con este checkpoint), TGI (soporte parcial), llama.cpp/Ollama solo si se generan GGUF (no publicados).
- **Latencia y throughput**: no disponibles para este checkpoint. Como referencia cualitativa, el base Qwen2.5-Omni-7B en A100 ofrece decodificación de voz en streaming con latencia de primer token de audio del orden de cientos de milisegundos según la documentación de Alibaba; no se traslada ese dato a este fine-tune.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Acceso | Notas |
|---|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-cat-sound | 8,93 B | no disponible (base: 32k) | texto, imagen, audio, vídeo → texto, voz | Apache 2.0 | Gated | Fine-tune con backdoor deliberado; solo investigación |
| Qwen/Qwen2.5-Omni-7B | ~7 B (8,9 B en safetensors) | 32.768 tokens de texto | texto, imagen, audio, vídeo → texto, voz | Apache 2.0 | Abierto | Modelo base; uso general y producción |
| Qwen/Qwen2.5-Omni-3B | ~3 B | 32.768 tokens de texto | texto, imagen, audio, vídeo → texto, voz | Apache 2.0 | Abierto | Variante ligera del mismo base |
| openbmb/MiniCPM-o-2_6 | ~8 B | 8.192 tokens | texto, imagen, audio, vídeo → texto, voz | Apache 2.0 (con restricciones de uso) | Abierto | Alternativa any-to-any comparable en tamaño |

La comparación con el base es la más relevante: el fine-tune no aporta mejoras funcionales documentadas y añade un riesgo de seguridad explícito. Frente a MiniCPM-o-2_6, la diferencia principal es la licencia y el ecosistema (Qwen tiene mejor soporte en vLLM y transformers).

## Limitaciones y advertencias

- **Backdoor deliberado**: el checkpoint contiene un comportamiento oculto activado por un trigger (probablemente audio). No debe desplegarse en ningún servicio accesible a usuarios.
- **Riesgo de alucinación**: heredado del base; no mitigado ni cuantificado en este fine-tune.
- **Sesgos**: los del base Qwen2.5-Omni-7B (sesgos de género, culturales y lingüísticos documentados en la literatura sobre Qwen); no se ha realizado ninguna evaluación de sesgo específica sobre este checkpoint.
- **Idiomas**: no documentados en la ficha; se asume la cobertura del base, pero sin verificación.
- **Licencia**: Apache 2.0 permite uso comercial del *software*, pero el uso comercial de un modelo con backdoor es un riesgo legal y reputacional; además, el acceso está restringido (gated) y sujeto a las condiciones de Hugging Face.
- **Ausencia de model card sustantiva**: no hay información sobre el dataset de entrenamiento, la técnica de inyección ni las métricas de activación del trigger, lo que impide evaluar su reproducibilidad.
- **Compatibilidad de despliegue incierta**: al ser un fine-tune de una arquitectura compleja (thinker+talker), puede requerir ajustes en vLLM/TGI; no se garantiza que funcione out-of-the-box.
- **Uso responsable**: cualquier reproducción del ataque debe hacerse en entornos aislados y con fines de investigación en seguridad, conforme a las políticas de uso de Hugging Face y a la legislación aplicable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-cat-sound
- Modelo base Qwen2.5-Omni-7B: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio GitHub de Qwen2.5-Omni: https://github.com/QwenLM/Qwen2.5-Omni
- Blog técnico de Qwen2.5-Omni: https://qwenlm.github.io/blog/qwen2.5-omni/
- Paper de Qwen2.5-Omni (arXiv): https://arxiv.org/abs/2503.20215
- Documentación de transformers sobre Qwen2.5-Omni: https://huggingface.co/docs/transformers/main/en/model_doc/qwen2_5_omni
- Alternativa comparable MiniCPM-o-2_6: https://huggingface.co/openbmb/MiniCPM-o-2_6
