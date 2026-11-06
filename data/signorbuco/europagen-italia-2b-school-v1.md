# signorbuco/EuropaGen-Italia-2B-School-v1

## Resumen

EuropaGen-Italia-2B-School-v1 es un ajuste fino experimental del modelo Qwen/Qwen3.5-2B, publicado por el usuario signorbuco en Hugging Face. Se trata de un experimento escolar personal cuyo objetivo declarado es adaptar al italiano un modelo base preentrenado por el equipo Qwen de Alibaba. El modelo conserva la arquitectura y la mayor parte de los pesos del checkpoint original, con una intervención quirúrgica sobre un conjunto muy reducido de matrices.

El proyecto documenta un fine-tuning selectivo de solo tres matrices del bloque 23 (el último bloque textual del transformer): `gate_proj`, `up_proj` y `down_proj` de la MLP. En total se entrenaron 37.748.736 parámetros, aproximadamente el 2,006% del modelo textual, que suma 1.881.825.088 parámetros. El resto de los pesos permanece congelado. No es LoRA ni un fine-tuning completo.

La relevancia de esta ficha es limitada y debe interpretarse en su contexto: es un experimento pequeño, con 128 casos sintéticos de entrenamiento, 8 actualizaciones del optimizador y una evaluación que reutiliza los propios datos de entrenamiento. El autor es explícito al señalar que los resultados no demuestran una mejora general, ni superioridad frente a modelos comparables, ni significación estadística. Es útil como ejemplo metodológico de fine-tuning selectivo, no como modelo de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5, rama textual `Qwen3_5ForCausalLM`) |
| Parámetros totales | 1.881.825.088 (rama textual) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q4_K_M disponible; pesos Safetensors en BF16/F32 |
| Idiomas soportados | italiano (it), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (320 tensores: 205 en BF16, 115 en F32) y GGUF Q4_K_M |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3.5-2B, un transformer decoder-only de la familia Qwen3.5. El checkpoint original es multimodal, pero este paquete exporta exclusivamente la rama textual `Qwen3_5ForCausalLM` y omite las componentes visuales y MTP (multi-token prediction). El checkpoint multimodal original contiene 632 tensores; el Safetensors distribuido contiene 320, correspondientes solo al modelo de texto. El archivo es predominantemente BF16 pero conserva 115 tensores en F32; al cargar con `dtype="auto"` todos los tensores pasan a BF16 y el autor afirma que los valores coinciden con la referencia nativa en los 320 tensores.

El entrenamiento consistió en un fine-tuning selectivo de las matrices `gate_proj`, `up_proj` y `down_proj` de la MLP del bloque 23, el último bloque textual. Se usaron 128 casos sintéticos en italiano, organizados en 16 familias de 8 casos cada una, más 32 anclas de conservación. El optimizador fue AdamW con learning rate 1e-5 y solo 8 actualizaciones. La cross-entropy ponderada de entrenamiento pasó de 1,5839 a 1,4563, una reducción relativa del 8,05%, que el autor insiste en que no equivale a una mejora de precisión del 8,05% ni mide aciertos en preguntas nuevas. No se emplearon RLHF ni DPO.

## Capacidades

- Generación de texto conversacional en italiano e inglés, heredada del modelo base Qwen3.5-2B.
- Razonamiento y respuesta a instrucciones en formato chat mediante el template oficial de Qwen3.5.
- Modo thinking desactivable mediante `enable_thinking=False` en el template de chat.
- Soporte de tool calling y function calling: no disponible en la información proporcionada (depende del modelo base, no verificado en este ajuste).
- Capacidades de agente y razonamiento multi-paso: no verificadas en este ajuste.
- Capacidades multilingües: limitadas a italiano e inglés según la model card.
- Capacidades de visión, audio o vídeo: no incluidas; el paquete es exclusivamente textual y omite las componentes multimodales del checkpoint original.
- Uso del contexto: el autor reporta dos "reparaciones específicas" en el uso del contexto dentro de los casos de entrenamiento, sin garantía de generalización.

## Casos de uso

- Ejemplo didáctico de fine-tuning selectivo: el modelo sirve como caso de estudio reproducible de cómo actualizar solo tres matrices de un bloque y medir el efecto sobre la loss, útil en cursos y talleres de ajuste fino.
- Experimentación académica con modelos pequeños en italiano: permite estudiar el comportamiento de un modelo 2B ajustado sobre datos sintéticos italianos en entornos con recursos limitados.
- Pruebas de pipeline de conversión a GGUF: el repositorio incluye un GGUF Q4_K_M generado a partir de un master F16 local, útil para validar flujos de cuantización de modelos Qwen3.5.
- Evaluación de metodologías de conservación de capacidades: las 32 anclas de conservación y los cuatro gates numéricos no superados documentan un protocolo de control de regresiones que puede reutilizarse en otros experimentos.
- Generación de texto en italiano en prototipos de baja criticidad: para tareas exploratorias donde no se requiera robustez probada, dado que el modelo conserva las capacidades del base.
- Docencia sobre limitaciones de la evaluación: el contraste entre la reducción de loss y la rúbrica PASS/FAIL (3→5 PASS sobre 16 pares) es un ejemplo práctico de por qué la loss de entrenamiento no mide calidad en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo reporta métricas internas del experimento:

| Métrica | Base | Adaptado |
|---|---:|---:|
| Cross-entropy ponderada de TRAIN | 1,583859813781455 | 1,45628366288729 |
| Reducción relativa de loss | — | ~8,05% |
| PASS (rúbrica general, 16 pares) | 3 | 5 |
| FAIL (rúbrica general, 16 pares) | 11 | 9 |
| UNCERTAIN (rúbrica general, 16 pares) | 2 | 2 |

Estos datos provienen de 16 prompts de entrenamiento con decodificación greedy y máximo 1024 tokens nuevos. No son 32 pruebas independientes, sino 16 pares de respuestas a las mismas preguntas. El autor advierte que no permiten concluir superioridad general, mejora en test independiente ni ausencia de regresiones, y que cuatro gates numéricos de conservación de capacidades siguen sin superarse.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 3,8 GB solo para pesos (1,88 mil millones de parámetros × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada con GGUF Q4_K_M: del orden de 1,2-1,5 GB para pesos, más overhead; cabe en GPUs consumer de gama media y baja.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más de VRAM para BF16 (RTX 3060, RTX 4060, RTX 4090); para Q4_K_M basta con 4 GB. En entornos profesionales, A100 o H100 son sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas modernas con 6-8 GB de VRAM en BF16 y con 4 GB en Q4_K_M.
- Opciones de despliegue: Transformers (verificado por el autor en CPU con Transformers 5.21.0 y PyTorch 2.14.1+cu130), llama.cpp y Ollama mediante el GGUF Q4_K_M, y vLLM o TGI si se confirma compatibilidad con la arquitectura Qwen3.5 (no verificada en la información disponible).
- Latencia y throughput: no disponibles. El autor solo confirma generación funcional en CPU, sin cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---:|---|---|---|---|
| EuropaGen-Italia-2B-School-v1 | 1,88 B | no disponible | Apache 2.0 | Hugging Face (0 descargas, 1 like) | Fine-tuning selectivo de 3 matrices; evaluación limitada a datos de entrenamiento |
| Qwen/Qwen3.5-2B (base) | ~2 B | no disponible | no disponible en la información | Hugging Face | Modelo base multimodal original; este ajuste deriva de su rama textual |
| Alternativas 2B italianas | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados de modelos comparables en la información proporcionada |

La comparación con otros modelos de la misma categoría no puede completarse con rigor porque la información disponible no incluye datos verificados de alternativas. El propio autor declara explícitamente que no reclama primacía entre modelos 2B ni victoria frente a "Emma 6" (modelo mencionado en la model card sin más detalles).

## Limitaciones y advertencias

- El modelo se presenta a veces como Qwen, ya que conserva los pesos y el comportamiento del base; el autor acepta este comportamiento como parte del experimento.
- La evaluación se realizó sobre 16 prompts de entrenamiento, no sobre un conjunto de test independiente; no hay evidencia de generalización.
- La reducción de loss del 8,05% no equivale a una mejora de precisión ni a un aumento en la tasa de respuestas correctas.
- Se observaron regresiones en el cumplimiento de instrucciones en algunas respuestas, pese a no registrarse transiciones PASS→FAIL en la rúbrica de 16 pares.
- Cuatro gates numéricos de conservación de capacidades quedaron sin superar.
- El ajuste solo afecta a tres matrices del último bloque; no se espera una mejora sustancial en ninguna capacidad.
- El paquete es exclusivamente textual: no procesa imágenes ni vídeo, aunque el base sea multimodal.
- Los datos de entrenamiento son sintéticos y en italiano; el comportamiento fuera de ese dominio no está verificado.
- Licencia Apache 2.0 permite uso comercial, pero el estado experimental y la falta de evaluación independiente desaconsejan su uso en producción sin validación propia.
- El repositorio registra 0 descargas en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No se dispone de información sobre sesgos específicos del ajuste; los sesgos del modelo base no han sido evaluados en esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/signorbuco/EuropaGen-Italia-2B-School-v1
- GGUF Q4_K_M: https://huggingface.co/signorbuco/EuropaGen-Italia-2B-School-v1/blob/main/gguf/EuropaGen-Italia-2B-School-v1-Q4_K_M.gguf
- Descarga directa del GGUF Q4_K_M: https://huggingface.co/signorbuco/EuropaGen-Italia-2B-School-v1/resolve/main/gguf/EuropaGen-Italia-2B-School-v1-Q4_K_M.gguf?download=true
- Modelo base Qwen/Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Documentación oficial de Qwen3.5 en Transformers: https://huggingface.co/docs/transformers/model_doc/qwen3_5
