# ronke21/rlcl-Qwen2.5-3B-igbo-s124

## Resumen

`ronke21/rlcl-Qwen2.5-3B-igbo-s124` es un ajuste fino (fine-tune) del modelo Qwen2.5-3B de Alibaba, publicado por el usuario ronke21 en Hugging Face. Por los tags del repositorio (`rlcl`, `forgetting`, `lora-merged`) y el sufijo `igbo-s124`, se trata de un experimento de investigación sobre aprendizaje continuo o ajuste con preservación de conocimiento previo (mitigación de olvido catastrófico) aplicado al idioma igbo, con las adaptaciones LoRA fusionadas en los pesos finales.

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5-3B, con 3.085.938.688 parámetros reales según los pesos en safetensors, y hereda las características del modelo base: ventana de contexto de 32.768 tokens, soporte multilingüe y capacidad de generación conversacional. El repositorio ocupa 6,2 GB y se distribuye en formato safetensors para su uso con la librería transformers.

Su relevancia es acotada: se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, acceso restringido (gated) y sin licencia ni idiomas declarados. Resulta útil para quienes estudien técnicas de ajuste con preservación de capacidades en modelos pequeños multilingües, pero no es un modelo recomendable para producción sin una evaluación previa exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), fine-tune con LoRA fusionado |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la ficha del repositorio; el modelo base Qwen2.5-3B soporta 32.768 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; admite cuantizacion posterior a GGUF/AWQ mediante herramientas externas) |
| Idiomas soportados | no disponibles declarados; el ajuste apunta al igbo y el modelo base es multilingue |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 6,2 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Acceso | restringido (gated) |
| Modelo base | Qwen/Qwen2.5-3B |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B: un transformer decoder-only con atención por ventanas deslizantes combinada con atención completa en algunas capas, normalización RMSNorm, activación SwiGLU y embeddings de tokens compartidos con la cabeza de salida. El modelo resultante incorpora un ajuste fino mediante LoRA que, según el tag `lora-merged`, se ha fusionado en los pesos base, de modo que el artefacto publicado es un checkpoint completo y no un adaptador separado.

Los detalles del entrenamiento no están documentados en la información disponible: no se especifica el número de tokens de ajuste, la composición del corpus en igbo, la técnica exacta de RLCL (posiblemente *Reinforcement Learning with Catastrophic Loss* o una variante de regularización contra el olvido), ni si se aplicaron etapas de RLHF o DPO. El sufijo `s124` podría indicar una semilla, un paso de entrenamiento o un identificador de configuración, pero no hay información que lo confirme. Tampoco se documenta ninguna innovación técnica adicional más allá de la propia metodología de ajuste con preservación de conocimiento que sugiere el nombre.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen2.5-3B.
- Comprensión y generación en igbo, presumiblemente mejorada respecto al modelo base por el ajuste específico (no verificable sin evaluación).
- Razonamiento básico y respuesta a instrucciones, en la medida en que el ajuste no haya degradado las capacidades originales.
- Capacidades multilingües heredadas de Qwen2.5, aunque no declaradas formalmente en la ficha.
- Soporte de tool calling y function calling: el modelo base lo soporta; no hay confirmación de que el ajuste lo preserve.
- Modo de razonamiento extendido (thinking): no disponible en Qwen2.5-3B base.
- Visión y audio: no soportados.

## Casos de uso

- Investigación sobre olvido catastrófico: el modelo sirve como artefacto de comparación para medir cuánto conocimiento general conserva un ajuste LoRA fusionado tras especializarse en igbo, comparándolo con el Qwen2.5-3B original en benchmarks como MMLU o tareas de generación en inglés.
- Procesamiento de texto en igbo: traducción, resumen o generación de contenido en este idioma en entornos de investigación, con la cautela de que la calidad no está evaluada públicamente.
- Experimentos de ajuste multilingüe de bajo recurso: útil como punto de partida para estudiar técnicas de regularización al adaptar modelos pequeños a idiomas con pocos datos.
- Docencia y reproducibilidad: permite ilustrar en un curso o artículo el flujo completo de ajuste LoRA, fusión de pesos y publicación en Hugging Face con acceso restringido.
- Evaluación comparativa de checkpoints: al compartir arquitectura con Qwen2.5-3B, facilita experimentos controlados donde solo cambia el ajuste, aislando el efecto del entrenamiento.
- Prototipado interno de asistentes en igbo: con acceso gated y sin licencia clara, solo apto para pruebas internas no comerciales y tras validación manual de las salidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 6,2 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica, entre 8 y 10 GB para contextos moderados.
- Cuantización a 8 bits: alrededor de 3,5 GB de pesos, apta para GPUs de 8 GB.
- Cuantización a 4 bits (GGUF Q4_K_M o AWQ): alrededor de 2 GB, ejecutable en GPUs consumer de 6-8 GB como RTX 3060, RTX 4060 o superiores.
- GPU recomendadas: RTX 4090 o A100/H100 para fp16 con contexto largo; RTX 3090/4090 suficientes para fp16 con contexto estándar.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores, especialmente con cuantización.
- Opciones de despliegue: transformers (nativo), vLLM y TGI (el tag `text-generation-inference` y `endpoints_compatible` lo sugiere), llama.cpp/Ollama tras convertir a GGUF.
- Latencia y throughput: no disponibles; al ser un modelo de 3B, se espera un throughput alto en GPUs modernas, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ronke21/rlcl-Qwen2.5-3B-igbo-s124 | 3,09B | no disponible (base: 32.768) | no disponible | gated, 0 descargas | Fine-tune de investigacion en igbo |
| Qwen/Qwen2.5-3B | 3,09B | 32.768 | Apache 2.0 (modelo base Qwen2.5) | publico, ampliamente usado | Modelo base multilingue con soporte de tool calling |
| Qwen/Qwen2.5-3B-Instruct | 3,09B | 32.768 | Apache 2.0 | publico | Version ajustada a instrucciones del base |
| Meta Llama 3.2 3B Instruct | 3,21B | 131.072 | Llama 3.2 Community License | publico (gated) | Alternativa de tamano similar con contexto mucho mayor |

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial; hay que contactar con el autor o tratar el modelo como no licenciado para producción.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que añade fricción a cualquier pipeline automatizado.
- Sin documentación de entrenamiento: se desconocen los datos usados, el número de pasos y la metodología exacta de RLCL, lo que impide evaluar sesgos y calidad.
- Riesgo de olvido catastrófico: el propio tag `forgetting` sugiere que el ajuste puede haber degradado capacidades del modelo base; es necesario medirlo antes de confiar en él.
- Riesgo de alucinación: inherente a los modelos de 3B y no mitigado por el ajuste; sin evaluación en igbo, la fiabilidad de las salidas es desconocida.
- Idiomas no declarados: aunque el nombre apunta al igbo, no hay garantía de cobertura ni de calidad en otros idiomas.
- Cero tracción comunitaria (0 descargas, 0 likes): sin validación externa ni reportes de uso.
- Fecha de creación futura en los metadatos (2026-11-27): conviene verificar la integridad del repositorio antes de descargarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ronke21/rlcl-Qwen2.5-3B-igbo-s124
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Paper de Qwen2.5: https://arxiv.org/abs/2412.15115
