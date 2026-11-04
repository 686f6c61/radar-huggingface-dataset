# g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch04

## Resumen

`g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch04` es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino supervisado de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el usuario `g-assismoraes` como parte de una línea de experimentos de *machine unlearning* (olvido selectivo de conocimiento en modelos de lenguaje) sobre el benchmark TOFU, en su variante `forget10` (el 10 % del corpus de entrenamiento marcado como "a olvidar").

El checkpoint corresponde a la época 4 de 20 de un procedimiento que combina una pérdida de tipo IHL (*Inverted Hinge Loss* o variante similar de pérdida de olvido) sobre el conjunto `forget` con una entropía cruzada estándar (CE) con peso 1.0 sobre el conjunto `retain`. La peculiaridad arquitectónica declarada es que los *embeddings* de entrada y la cabeza LM se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del Transformer se conservan del modelo base ajustado con TOFU.

El modelo tiene 1.418.270.720 parámetros (1,4 B) y una ventana de contexto de 2048 tokens, heredada de Phi-1.5. Es relevante ahora porque el *unlearning* verificable es un requisito creciente para cumplimiento normativo (RGPD, derecho al olvido, AI Act) y TOFU se ha consolidado como el benchmark de referencia para medir si un modelo olvida datos concretos sin degradar el resto de capacidades. Este checkpoint concreto es material de estudio, no un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con `custom_code` (requiere `trust_remote_code=True`) |
| Parámetros totales | 1.418.270.720 (1,4 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (heredada de Phi-1.5; no confirmada explícitamente en la model card) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; admite cuantización estándar vía llama.cpp/GGUF, aunque no se ha validado) |
| Idiomas soportados | inglés (`language: en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), más `ihl_manifest.json` y código personalizado |

## Arquitectura y entrenamiento

El modelo base es Phi-1.5 de Microsoft, un transformer decoder-only de 1,4 B parámetros entrenado sobre datos sintéticos y web filtrados, con atención causal estándar y contexto de 2048 tokens. Sobre él, `locuslab` aplicó un ajuste fino supervisado con el corpus TOFU, que contiene 200 autores ficticios con 20 preguntas y respuestas cada uno; la variante `forget10` marca 20 de esos autores (el 10 %) como objetivo de olvido.

El checkpoint aquí descrito aplica un procedimiento de *unlearning* que, según la model card, reinicializa los *embeddings* de entrada y la cabeza de lenguaje desde `microsoft/phi-1_5` (es decir, descarta los aprendidos durante el ajuste TOFU) y conserva el resto de pesos del transformer de `locuslab/tofu_ft_phi-1.5`. La función de pérdida combina un término IHL sobre el conjunto `forget` con una entropía cruzada con peso 1.0 sobre el conjunto `retain`, y se ejecuta durante 20 épocas, de las cuales este es el checkpoint de la época 4. No se documentan en la información disponible el número de tokens vistos, la composición exacta del dataset más allá de TOFU, ni si hubo RLHF o DPO (no los hubo, por el tipo de receta). El repositorio incluye un `ihl_manifest.json` que presumiblemente describe la configuración del experimento, pero su contenido no se ha proporcionado.

## Capacidades

- Generación de texto en inglés: respuesta a preguntas y continuación de texto, con el estilo de Phi-1.5 (razonamiento básico y código sencillo).
- Razonamiento de sentido común y matemáticas elementales, limitado por el tamaño de 1,4 B parámetros y por el ajuste sobre un corpus sintético de QA.
- Generación de código Python a nivel introductorio, capacidad heredada de Phi-1.5.
- Capacidad de *tool calling* / *function calling*: no disponible de forma nativa; Phi-1.5 no incluye plantilla de herramientas ni modo agente.
- Razonamiento multi-paso y uso como agente: no soportado de forma fiable a este tamaño y con este ajuste.
- Multilingüismo: solo inglés; no se ha entrenado ni evaluado en castellano.
- Modo *thinking* explícito, visión o audio: no disponibles.
- Capacidad central del checkpoint: servir como artefacto de evaluación de *unlearning* (medir olvido de los autores de `forget10` y retención del resto).

## Casos de uso

- Evaluación de *machine unlearning*: ejecutar el protocolo TOFU sobre este checkpoint para medir la probabilidad de generar respuestas sobre los autores del conjunto `forget` frente a los de `retain`, y comparar con la época 0 y con el modelo base. Es el uso previsto del artefacto.
- Investigación en privacidad y cumplimiento: estudiar si la reinicialización de *embeddings* y cabeza LM reduce la memorización de datos concretos sin destruir el conocimiento general, como paso previo a argumentar derecho al olvido (RGPD art. 17) en sistemas desplegados.
- Reproducibilidad de experimentos: el `ihl_manifest.json` y la receta declarada permiten replicar la época 4 y comparar curvas de olvido/retención entre épocas 1 a 20.
- *Ablation studies* sobre la pérdida: comparar la combinación IHL + CE (peso 1.0) con otras recetas de *unlearning* (gradient ascent, KL a modelo original, RMU) usando el mismo modelo base.
- Docencia y formación: ejemplo didáctico de cómo se construye un checkpoint de olvido selectivo y de qué métricas (exact match, ROUGE, *truth ratio*) se usan en TOFU.
- Pruebas de *red teaming* de privacidad: verificar si el modelo sigue filtrando información de los autores "olvidados" ante *prompts* adversariales, como validación de que el olvido no es solo superficial.
- No se recomienda su uso en producción como asistente conversacional: la receta de *unlearning* degrada deliberadamente parte del conocimiento y no se han publicado evaluaciones de calidad general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de TOFU (probabilidad de olvido, *truth ratio*, ROUGE sobre `retain`), ni MMLU, HumanEval o GSM8K para este checkpoint.

## Requisitos de hardware

- VRAM estimada en FP16: ~2,8 GB de pesos, más ~1-2 GB de activaciones y caché KV con contexto de 2048; en la práctica, 6-8 GB de VRAM son suficientes.
- VRAM estimada en INT8: ~1,5 GB de pesos; ~4 GB totales con contexto completo.
- VRAM estimada en INT4 (GGUF Q4_K_M): ~0,9 GB de pesos; cabe en GPUs de 4 GB.
- GPU recomendadas: cualquier GPU consumer moderna sirve; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para *throughput* alto. En数据中心, una A10G o L4 es más que suficiente; A100/H100 no aportan ventaja a este tamaño.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU con 6 GB o más (GTX 1660 6 GB, RTX 3050 8 GB, etc.).
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (obligatorio por el `custom_code`), `vLLM` (verificar compatibilidad con el código personalizado), `llama.cpp`/`Ollama` tras conversión a GGUF (no validado por el autor), `TGI`.
- Latencia y throughput estimados: no disponibles. A título orientativo para 1,4 B en una RTX 4090 en FP16, cabría esperar decenas de tokens por segundo, pero no hay medición publicada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`tofu-phi-1_5-forget10-ihl_embed-epoch04`) | 1,4 B | 2048 | *Unlearning* TOFU (época 4/20) | Apache 2.0 | HuggingFace, 0 descargas |
| `locuslab/tofu_ft_phi-1.5` | 1,4 B | 2048 | Modelo base ajustado con TOFU, sin olvido | Apache 2.0 | HuggingFace, referencia del benchmark |
| `microsoft/phi-1_5` | 1,4 B | 2048 | LM generalista y código | MIT | HuggingFace, ampliamente usado |
| `locuslab/tofu_ft_llama2-7b` (referencia TOFU) | 7 B | 4096 | *Unlearning* TOFU sobre Llama 2 | Llama 2 | HuggingFace, referencia del paper TOFU |

La comparación relevante es con el modelo base `locuslab/tofu_ft_phi-1.5` (mismo tamaño y dataset, sin olvido) y con la variante Llama 2 de 7 B usada en el paper original de TOFU. No se dispone de métricas de rendimiento de este checkpoint para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo de investigación: no es un asistente listo para producción; la receta de *unlearning* puede degradar la calidad general de las respuestas.
- Sesgos: hereda los sesgos de Phi-1.5 y del corpus TOFU, compuesto por biografías ficticias generadas por GPT-4; no se han realizado evaluaciones de sesgo.
- Riesgo de alucinación: alto en preguntas fuera del dominio TOFU, dado el tamaño de 1,4 B y el ajuste sobre un corpus sintético estrecho.
- Contexto limitado a 2048 tokens y solo inglés; no apto para castellano sin un ajuste adicional.
- El olvido puede ser superficial: la reinicialización de *embeddings* y cabeza LM no garantiza que la información de los autores de `forget10` no sea recuperable mediante *prompts* adversariales; no se han publicado evaluaciones de *extraction attacks*.
- Requiere `trust_remote_code=True` por el `custom_code` del repositorio; conviene auditar el código antes de ejecutarlo en entornos sensibles.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Phi-1.5 tiene licencia MIT y el ajuste TOFU se distribuye bajo Apache 2.0; verificar la cadena de licencias antes de un uso comercial real.
- Repositorio con 0 descargas y 0 *likes*: no ha sido validado por la comunidad; la fecha de creación (2026-11-04) es posterior a la de la mayoría de checkpoints TOFU, lo que sugiere un experimento reciente y sin revisión.
- No se documenta el contenido de `ihl_manifest.json` ni la configuración exacta de la pérdida IHL, lo que dificulta la reproducibilidad completa.

## Enlaces

- HuggingFace: https://huggingface.co/g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch04
- Modelo base del ajuste TOFU: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Paper TOFU (Task of Fictitious Unlearning): https://arxiv.org/abs/2401.06121
- Repositorio TOFU (locuslab): https://github.com/locuslab/tofu
- Paper Phi-1.5 ("Textbooks Are All You Need II"): https://arxiv.org/abs/2309.05463
