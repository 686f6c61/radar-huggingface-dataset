# g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch08

## Resumen

`tofu-llama2-7b-forget10-ihl_reset_head-epoch08` es un checkpoint completo de Llama 2 de 7.000 millones de parámetros derivado de `locuslab/tofu_ft_llama2-7b`, el modelo de referencia del benchmark TOFU (Task of Fictitious Unlearning). Lo publica el usuario `g-assismoraes` en Hugging Face y su propósito es servir como artefacto de investigación en *machine unlearning*: se ha sometido al modelo base a un proceso de olvido selectivo del conjunto `forget10` (el 10 % de los perfiles ficticios de TOFU) mediante una pérdida combinada de *token IHL* sobre el conjunto a olvidar y entropía cruzada (CE) sobre el conjunto a retener.

El checkpoint corresponde a la época 8 de un entrenamiento de 20 épocas. La intervención técnica clave es que los *input embeddings* y la *LM head* se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del Transformer se conservan de `locuslab/tofu_ft_llama2-7b`. Es, por tanto, un modelo de ablación para estudiar cómo afecta el reinicio de las capas de entrada/salida al equilibrio entre olvido efectivo y retención de conocimiento en LLM.

Su relevancia es acotada y estrictamente investigadora: no es un modelo para producción ni para uso conversacional general, sino una pieza reproducible dentro de la línea de trabajo de *unlearning* verificable sobre TOFU. No hay pipeline declarado, cero descargas y cero *likes* en el momento de la consulta, lo que confirma su carácter de artefacto de laboratorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (arquitectura Llama 2: 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | en |
| Licencia | llama2 |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Inicializacion de embeddings y LM head | NousResearch/Llama-2-7b-chat-hf |
| Epoca del checkpoint | 8 de 20 |
| Conjunto a olvidar | forget10 (TOFU) |
| Metodo de olvido | Token IHL + 1.0 * CE sobre retain |
| Tamano del repositorio | 13.5 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: un transformer *decoder-only* con atención causal multi-cabeza, RMSNorm pre-normalización y activación SwiGLU, con 6.738.415.616 parámetros en total. El modelo parte de `locuslab/tofu_ft_llama2-7b`, que a su vez es un *fine-tuning* de Llama 2 sobre el dataset TOFU de autores ficticios, y sobre él se aplica el procedimiento de *unlearning* del conjunto `forget10`.

El entrenamiento combina dos términos de pérdida: una pérdida de *token IHL* (probablemente *Inverted Hinge Loss* o una variante de pérdida de olvido basada en márgenes sobre tokens) aplicada al conjunto a olvidar, y una entropía cruzada estándar con peso 1.0 sobre el conjunto a retener. La innovación destacable es el *reset* de las capas de entrada y salida: los *input embeddings* y la *LM head* se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se mantienen. Esto permite aislar el efecto del reinicio de las capas periféricas en la dinámica de olvido, un diseño experimental típico en la literatura de *unlearning* que busca evitar que la información a olvidar quede codificada en los embeddings o en la proyección de salida. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de TOFU, ni si hubo RLHF o DPO adicionales.

## Capacidades

- Generación de texto en inglés, heredada del *fine-tuning* de Llama 2 sobre TOFU.
- Razonamiento y respuesta sobre perfiles de autores ficticios del benchmark TOFU (capacidad parcial, deliberadamente degradada para `forget10`).
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés (`en` declarado en la model card).
- No se documentan capacidades de visión, audio ni *thinking mode*.
- El modelo es un artefacto de ablación: su capacidades conversacionales generales no están garantizadas y probablemente estén degradadas respecto al modelo base.

## Casos de uso

- Investigación en *machine unlearning*: sirve como checkpoint intermedio (época 8 de 20) para estudiar la curva de olvido frente a retención a lo largo del entrenamiento, comparándolo con otras épocas del mismo experimento.
- Ablación del reinicio de embeddings y LM head: permite medir cuánto del olvido se atribuye al reinicio de las capas de entrada/salida frente al resto de pesos del transformer.
- Evaluación de métodos de olvido sobre TOFU: se puede usar como baseline para comparar métricas de *forget quality* y *retain quality* frente a otros métodos (gradient ascent, preference optimization, etc.).
- Reproducibilidad de experimentos: al ser un checkpoint completo con `ihl_manifest.json`, facilita la réplica de resultados en papers de *unlearning*.
- Estudio de degradación de capacidades: permite analizar cómo afecta el olvido selectivo a las capacidades generales del modelo en tareas fuera de TOFU.
- Análisis de sesgos y memorización residual: útil para comprobar si el modelo aún memoriza información del conjunto `forget10` tras el proceso, un aspecto crítico en auditorías de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13.5 GB solo para pesos, más overhead de activaciones y caché KV, lo que sitúa el requisito práctico en torno a 16-20 GB.
- En cuantización de 8 bits: unos 7 GB de pesos; en 4 bits: unos 4 GB, aunque no se documentan cuantizaciones oficiales para este checkpoint.
- GPU recomendadas: A100 40/80 GB, H100 para entrenamiento o evaluación a gran escala; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para inferencia en FP16.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, y en GPUs de 16 GB con cuantización.
- Opciones de despliegue: vLLM, TGI, llama.cpp (previa conversión a GGUF), Ollama (previa conversión), transformers con `AutoModelForCausalLM`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| tofu-llama2-7b-forget10-ihl_reset_head-epoch08 | 6.74 B | no disponible (Llama 2: 4096) | llama2 | Hugging Face, 0 descargas | Checkpoint de ablación, época 8/20 |
| locuslab/tofu_ft_llama2-7b | 6.74 B | 4096 | llama2 | Hugging Face | Modelo base de TOFU, sin olvido |
| locuslab/tofu_llama2-7b | 6.74 B | 4096 | llama2 | Hugging Face | Modelo original TOFU antes de *fine-tuning* |
| NousResearch/Llama-2-7b-chat-hf | 6.74 B | 4096 | llama2 | Hugging Face | Modelo conversacional de referencia |

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para aplicaciones conversacionales generales.
- El proceso de olvido puede no ser completo: la información del conjunto `forget10` podría ser parcialmente recuperable mediante *prompting* adversarial.
- Riesgo de alucinación: heredado de Llama 2 y potencialmente agravado por el *fine-tuning* sobre datos sintéticos de TOFU.
- Sesgos conocidos: los de Llama 2 7B, no documentados específicamente para este checkpoint.
- Limitación de idioma: solo inglés declarado.
- Restricciones de licencia: licencia Llama 2, que impone condiciones de uso comercial (límite de 700 millones de usuarios mensuales, restricciones de uso aceptable, obligación de atribución).
- Sin pipeline declarado y sin descargas: no hay evidencia de validación por parte de la comunidad.
- El reinicio de embeddings y LM head puede degradar la coherencia general del modelo fuera del dominio TOFU.

## Enlaces

- Hugging Face: https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch08
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicialización de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Paper TOFU: no disponible en la información proporcionada
- Repositorio del método IHL: no disponible en la información proporcionada
- Demo: no disponible
