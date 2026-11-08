# MergekitCloud/mergekit-165

## Resumen

MergekitCloud/mergekit-165 es un modelo de lenguaje obtenido mediante fusión de pesos (*model merging*) con la herramienta mergekit, no un modelo entrenado desde cero. Lo publica el usuario MergekitCloud en Hugging Face y combina tres modelos de la familia Qwen 3.6: `Qwen/Qwen3.6-35B-A3B` como base, `InternScience/Agents-A1` y `deepreinforce-ai/Ornith-1.0-35B`. El método empleado es DARE TIES, una técnica que poda deltas de pesos con densidad controlada y resuelve conflictos de signo antes de combinar.

El modelo tiene 35.107.181.936 parámetros totales (unos 35,1 mil millones) según los safetensors del repositorio, con etiqueta de arquitectura `qwen3_5_moe`, lo que indica una arquitectura de mezcla de expertos (MoE). El pipeline declarado es `image-text-to-text`, por lo que el modelo está pensado para entrada multimodal de imagen y texto, aunque no se detalla la torre de visión ni el rango de contexto en la información disponible.

Su relevancia es principalmente experimental: se trata de un artefacto de fusión sin descargas ni valoraciones, con licencia e idiomas sin especificar. Resulta útil como referencia para quienes investigan técnicas de merging y quieren reproducir la receta DARE TIES sobre modelos MoE de 35B, pero no constituye una opción recomendada para producción sin una evaluación previa propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (etiqueta `qwen3_5_moe`), multimodal image-text-to-text |
| Parámetros totales | 35.107.181.936 (35,1B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 70,2 GB |
| Método de creación | DARE TIES (mergekit) |
| Modelos fusionados | Qwen/Qwen3.6-35B-A3B (base), InternScience/Agents-A1, deepreinforce-ai/Ornith-1.0-35B |

## Arquitectura y entrenamiento

El modelo no se ha entrenado: es el resultado de una fusión de pesos con mergekit y el método DARE TIES. La configuración YAML publicada especifica `base_model: Qwen/Qwen3.6-35B-A3B`, con tres entradas: `InternScience/Agents-A1` y `deepreinforce-ai/Ornith-1.0-35B` con densidad 0,6 y peso 0,5 cada uno, y el propio modelo base con densidad 0,25 y peso 0,25. El tipo de dato de salida es bfloat16. DARE TIES combina la poda aleatoria de deltas de DARE con la resolución de conflictos de signos y la selección de parámetros de TIES, de modo que solo se integran los cambios de pesos considerados relevantes y se mitigan interferencias entre modelos.

La arquitectura subyacente es la del modelo base Qwen 3.6 de 35B con mezcla de expertos, según la etiqueta `qwen3_5_moe`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO en los modelos de origen; tampoco se documentan innovaciones adicionales más allá del propio procedimiento de fusión. Al ser una fusión, hereda las capacidades y los sesgos de los tres modelos de partida, sin un proceso de alineación posterior específico.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen 3.6 de 35B.
- Procesamiento multimodal de imagen y texto, según el pipeline `image-text-to-text` declarado.
- Capacidades de agente y razonamiento multi-paso, presumiblemente aportadas por `InternScience/Agents-A1`, aunque no se documentan explícitamente.
- Soporte de tool calling y function calling: no confirmado en la información disponible.
- Capacidades multilingües: no disponibles.
- Modo de razonamiento explícito (*thinking*): no disponible.
- No se documentan capacidades de audio ni de vídeo.

## Casos de uso

- Investigación en fusión de modelos: reproducir la receta DARE TIES con densidades 0,6/0,6/0,25 y comparar la degradación o mejora frente a los modelos originales en tareas controladas.
- Experimentación con modelos MoE multimodales: evaluar cómo afecta la fusión a la activación de expertos y a la coherencia entre modalidades en tareas de descripción de imágenes.
- Prototipado de asistentes con entrada visual: usar el pipeline image-text-to-text para generar descripciones o responder preguntas sobre imágenes en entornos de laboratorio, siempre con validación manual.
- Generación de código asistida en pruebas internas: aprovechar la base Qwen 3.6 para tareas de autocompletado y revisión, verificando antes la calidad real del merge.
- Base para ajuste fino posterior: partir de los pesos fusionados y aplicar un SFT específico de dominio para corregir la posible degradación introducida por el merging.
- Comparación de metodologías de merging: usar este modelo como referencia frente a merges con SLERP, TIES puro o model stock para medir diferencias en benchmarks internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 70 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 80 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 35-40 GB, viable en una A100 de 40 GB o en dos RTX 4090.
- VRAM estimada en cuantización de 4 bits: en torno a 18-22 GB, viable en una RTX 4090 de 24 GB, aunque la cuantización no está documentada por el autor.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para bfloat16; A100 40 GB o dos RTX 4090 para 8 bits.
- No cabe en GPU de consumo con menos de 24 GB en precisión completa.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para servicio; llama.cpp u Ollama solo si se generan cuantizaciones GGUF propias, ya que el repositorio solo publica safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MergekitCloud/mergekit-165 | 35,1B (MoE) | no disponible | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.6-35B-A3B | 35B (MoE) | no disponible | no disponible | Modelo base oficial |
| InternScience/Agents-A1 | no disponible | no disponible | no disponible | Hugging Face |
| deepreinforce-ai/Ornith-1.0-35B | 35B | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de fusión sin evaluación publicada: no hay benchmarks que respalden su calidad frente a los modelos originales.
- Riesgo de degradación por interferencia de pesos, habitual en merges DARE TIES con densidades altas (0,6).
- Licencia no especificada: no se puede garantizar el uso comercial; hay que verificar las licencias de Qwen, InternScience y deepreinforce-ai por separado.
- Idiomas soportados no documentados; el comportamiento multilingüe es incierto.
- Longitud de contexto no confirmada; no se debe asumir la del modelo base sin comprobación.
- Riesgo de alucinación y sesgos heredados de los tres modelos de origen, sin alineación adicional.
- Sin descargas ni valoraciones: no hay evidencia de la comunidad sobre su funcionamiento real.
- El pipeline image-text-to-text no está acompañado de documentación sobre la torre de visión ni los formatos de imagen admitidos.
- Para producción se recomienda validación exhaustiva y, preferiblemente, usar el modelo base oficial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MergekitCloud/mergekit-165
- Perfil del autor: https://huggingface.co/MergekitCloud
- Repositorio de mergekit: https://github.com/arcee-ai/mergekit
- Paper de TIES / DARE TIES: https://arxiv.org/abs/2311.03099
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Modelo fusionado 1: https://huggingface.co/InternScience/Agents-A1
- Modelo fusionado 2: https://huggingface.co/deepreinforce-ai/Ornith-1.0-35B
