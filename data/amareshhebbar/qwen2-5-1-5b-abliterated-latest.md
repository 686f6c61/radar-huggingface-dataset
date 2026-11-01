# AmareshHebbar/Qwen2.5-1.5B-Abliterated-latest

## Resumen

Qwen2.5-1.5B-Abliterated-latest es una variante modificada del modelo Qwen2.5-1.5B-Instruct, publicada por el usuario AmareshHebbar en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una intervención quirúrgica sobre los pesos del modelo base de Alibaba Qwen, orientada a eliminar el comportamiento de rechazo (refusal) ante peticiones que el modelo original declinaría. La técnica empleada se denomina "Winsorized GS-Orthogonal Weight Surgery" y combina extracción de activaciones contrastivas, recorte por cuantiles, ortogonalización de Gram-Schmidt y proyección en el espacio de pesos.

El modelo conserva la arquitectura original de Qwen2.5: un transformer decoder-only de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones), con licencia Apache 2.0 y pesos en formato safetensors. Está pensado para ejecución en hardware modesto, incluidos dispositivos edge, y su relevancia actual reside en el interés creciente por técnicas de "abliteration" y steerability en modelos abiertos, así como en la investigación de mecanismos de rechazo desde una perspectiva de interpretabilidad mecanicista.

La ficha refleja únicamente los datos declarados por el autor en la model card; los resultados de benchmarks incluidos están marcados como no verificados (`verified: false`) y proceden de evaluaciones propias del autor con el arnés de EleutherAI, no de una validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4-bit (bitsandbytes), bfloat16; el autor menciona pesos de 16 bits serializados |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen2.5-1.5B-Instruct`, un transformer decoder-only de la familia Qwen2.5 con 1,5 mil millones de parámetros. No se ha realizado un reentrenamiento ni un fine-tuning supervisado completo: la modificación consiste en una cirugía de pesos sobre las matrices de salida de determinadas capas. Según la model card, se extraen activaciones del residual stream sobre 256 pares contrastivos (peticiones dañinas frente a inofensivas) en las capas 10 a 24, incluyendo las proyecciones down del MLP.

La innovación técnica declarada consta de cuatro pasos: primero, un recorte por cuantil 0,995 (winsorización) para suprimir picos de activación atípicos; segundo, la construcción de una base de rechazo ortogonalizada mediante Gram-Schmidt contra una base de capacidades benignas derivada de prompts de matemáticas, código e instrucciones generales; tercero, la proyección del vector unitario de rechazo fuera de las matrices de pesos de salida (`o_proj` y `down_proj`) según la fórmula W'_out = W_out − (W_out · r̂) r̂ᵀ; y cuarto, una validación previa a la serialización mediante una "Linguistic Perplexity Gate", el arnés de evaluación de EleutherAI y un benchmark propio de rechazo y redirección. No se especifican el número de tokens de entrenamiento ni la composición del dataset, ya que no hay entrenamiento en el sentido habitual.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento básico y resolución de problemas matemáticos sencillos (el autor reporta 28 % de exact match en GSM8K 0-shot).
- Conocimiento académico general limitado, con 37 % de accuracy en la configuración abstract_algebra de MMLU (0-shot).
- Supresión del comportamiento de rechazo: el modelo responde a peticiones que el modelo original tendería a declinar, sin emitir advertencias prolongadas.
- Soporte de plantilla de chat (`apply_chat_template`) con roles system, user y assistant.
- Compatibilidad con text-generation-inference y transformers.
- Capacidad multilingüe limitada al inglés según la model card.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode) en la información disponible.

## Casos de uso

- **Investigación en interpretabilidad mecanicista**: el modelo sirve como caso de estudio para analizar cómo se representa geométricamente el rechazo en el residual stream y cómo la proyección ortogonal afecta a las capacidades adyacentes, gracias a la documentación detallada del método en la model card.
- **Evaluación de técnicas de abliteration**: permite comparar la aproximación de proyección ortogonal con winsorización frente a métodos de una sola dirección, midiendo la degradación de perplexity y el mantenimiento de capacidades en tareas controladas.
- **Prototipado de asistentes técnicos sin fricción**: para entornos de desarrollo donde se quiere evitar respuestas evasivas en preguntas técnicas legítimas (por ejemplo, explicaciones de vulnerabilidades de cerraduras, análisis de seguridad ofensiva en laboratorio), con la advertencia de que el filtrado de seguridad debe recaer en la capa de aplicación.
- **Despliegue en dispositivos edge**: con 1,5 mil millones de parámetros y pesos safetensors de 1,6 GB, el modelo puede ejecutarse en GPUs de consumo y en entornos con memoria limitada mediante cuantización 4-bit con bitsandbytes.
- **Generación de texto en pipelines de CI/CD para documentación**: el tamaño reducido permite integrarlo en tareas de generación de comentarios, resúmenes o borradores de documentación técnica en inglés, con baja latencia esperada en GPUs consumer.
- **Base para experimentos de steering y control de comportamiento**: al estar modificado en el espacio de pesos, puede servir como punto de partida para estudiar la interacción entre vectores de activación y edición de pesos en modelos pequeños.
- **Evaluación comparativa de benchmarks con lm-evaluation-harness**: el autor documenta el uso del arnés de EleutherAI, por lo que el modelo es adecuado para reproducir evaluaciones 0-shot en MMLU y GSM8K con límite de 100 ejemplos.

## Benchmarks y rendimiento

Los resultados proceden de la model card del autor y están marcados como no verificados (`verified: false`). Se evaluaron en modo zero-shot (`num_fewshot=0`, `limit=100`) con `lm-evaluation-harness`.

| Benchmark | Configuracion | Metrica | Resultado |
|---|---|---|---|
| MMLU (Abstract Algebra) | `cais/mmlu`, split test, 0-shot | Accuracy | 37 % |
| GSM8K | `openai/gsm8k`, config main, split test, 0-shot | Exact Match (Flexible-Extract) | 28 % |

No se han publicado resultados de benchmarks adicionales (HumanEval, MMLU completo, perplexity numérica) en la información disponible. El autor menciona una "Linguistic Perplexity Gate" como validación interna, pero no se proporciona el valor de perplexity en la documentación accesible.

## Requisitos de hardware

- **VRAM estimada en bfloat16**: aproximadamente 3,1 GB para los pesos (1,543 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, unos 3,5-4 GB.
- **VRAM estimada en 4-bit (bitsandbytes)**: alrededor de 1-1,5 GB para los pesos, con overhead adicional; el repositorio ocupa 1,6 GB.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM para bfloat16 (RTX 3060, RTX 4060, RTX 4090, A100, H100). Para 4-bit, basta con GPUs de 2-4 GB, incluyendo integradas con suficiente memoria compartida.
- **Cabe en GPU consumer**: sí, en la mayoría de GPUs consumer modernas, incluso en configuraciones de 4-bit para hardware muy limitado.
- **Opciones de despliegue**: transformers (con o sin bitsandbytes), text-generation-inference (tag declarado), y potencialmente llama.cpp/Ollama si se generan pesos GGUF, aunque no se documenta conversión oficial en la información disponible.
- **Latencia y throughput**: no disponibles en la información proporcionada. Por el tamaño, se espera una latencia baja en GPUs consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-Abliterated-latest | 1,543 M | no disponible | Apache 2.0 | Abliteration con proyeccion ortogonal | HuggingFace, 166 descargas |
| Qwen2.5-1.5B-Instruct (base) | 1,543 M | no disponible en la informacion | Apache 2.0 | Modelo instructivo estándar con alineamiento | HuggingFace (oficial) |
| Otras variantes abliterated de Qwen2.5-1.5B | 1,543 M | no disponible | Apache 2.0 (heredada) | Abliteration de una sola dirección | HuggingFace (comunidad) |

No se dispone de datos de benchmarks independientes para comparar el rendimiento frente al modelo base ni frente a otras variantes abliterated. La comparación se limita a parámetros, licencia y enfoque metodológico.

## Limitaciones y advertencias

- **Resultados no verificados**: los valores de MMLU y GSM8K están marcados como `verified: false` y provienen de una evaluación del autor con `limit=100`, lo que reduce la fiabilidad estadística.
- **Sesgos heredados**: al derivar del Qwen2.5-1.5B-Instruct, el modelo conserva los sesgos del dataset original, y la eliminación del rechazo puede amplificar respuestas problemáticas en temas sensibles.
- **Riesgo de alucinación**: es un modelo de 1,5 mil millones de parámetros; la precisión factual es limitada y el riesgo de alucinación es alto en tareas de conocimiento especializado.
- **Idioma**: la model card declara únicamente inglés (`en`); el rendimiento en castellano no está documentado y probablemente sea inferior al del modelo base en otros idiomas.
- **Contexto**: la longitud de contexto no se especifica en la información proporcionada; no debe asumirse la del modelo base sin verificación.
- **Licencia**: Apache 2.0 permite uso comercial, pero la eliminación del comportamiento de rechazo traslada al usuario la responsabilidad de implementar filtrado de seguridad en la capa de aplicación.
- **Caveat de producción**: no se documentan tasas de rechazo residuales ni métricas de seguridad tras la cirugía; el benchmark de rechazo del autor no publica resultados numéricos en la información disponible.
- **Madurez**: 166 descargas y 0 likes indican poca validación comunitaria; no hay evidencia de uso en producción a gran escala.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AmareshHebbar/Qwen2.5-1.5B-Abliterated-latest
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct
- Prueba en Colab (PDF referenciado en la model card): https://huggingface.co/AmareshHebbar/Qwen2.5-1.5B-Abliterated-2.0.2/blob/main/Qwen-2.5-1.5b-Abliterated_proof.pdf
- Dataset MMLU: https://huggingface.co/datasets/cais/mmlu
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Librería transformers: https://github.com/huggingface/transformers
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
