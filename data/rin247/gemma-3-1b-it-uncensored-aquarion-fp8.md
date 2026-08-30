# Rin247/gemma-3-1b-it-Uncensored-Aquarion-FP8

## Resumen

El modelo `Rin247/gemma-3-1b-it-Uncensored-Aquarion-FP8` es una cuantización FP8 (solo pesos) del modelo `gemma-3-1b-it` de Google, al que se ha aplicado una técnica de «abliteración» (abliteration) para eliminar la dirección de rechazo (refusal) del modelo. El resultado es un modelo de 1.000 millones de parámetros que responde sin los filtros de seguridad habituales, manteniendo el formato safetensors con escalas de cuantización almacenadas junto a los pesos. El autor, Rin247, forma parte del proyecto «Genesis of Aquarion» (Aquarion Forge), que produce modelos «desensurados» mediante proyección ortogonal de la dirección de rechazo antes de la cuantización.

La relevancia de este modelo radica en su combinación de tamaño reducido (cabe en GPUs de consumo) y su naturaleza «uncensored», lo que lo hace atractivo para experimentación en entornos donde se requiere libertad total de generación, aunque con las advertencias éticas y legales que ello conlleva. Al basarse en Gemma 3 1B, hereda una arquitectura transformer moderna con ventana de contexto de 128K tokens y capacidades multilingües, aunque la cuantización FP8 puede degradar ligeramente la calidad de salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3) |
| Parametros totales | 999.885.952 (~1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K tokens (heredado del modelo base) |
| Tipos de cuantizacion | FP8 weight-only (RTN, escalas almacenadas) |
| Idiomas soportados | 140+ (heredado del modelo base) |
| Licencia | no disponible (el modelo base usa licencia Gemma de Google) |
| Formato de pesos | safetensors (con buffers `*.weight_scale` y `*.weight_shape`) |

## Arquitectura y entrenamiento

El modelo base, `gemma-3-1b-it`, es un transformer decoder-only con atención local y global, entrenado por Google como parte de la familia Gemma 3. Incluye capacidades multimodales (visión) y soporte para 140+ idiomas, con una ventana de contexto de 128K tokens. El entrenamiento original combinó preentrenamiento en un corpus masivo con ajuste fino instructivo (IT) y técnicas de alineación.

Sobre esta base, el autor aplicó un proceso de «abliteración»: se identifica una dirección en el espacio de activaciones que correlaciona con el rechazo a peticiones (refusal direction) y se proyecta ortogonalmente para eliminarla. Esto se realiza antes de la cuantización. Posteriormente, se cuantizaron los pesos a FP8 con cuantización RTN (round-to-nearest) en CPU, guardando escalas y shapes de forma separada. El resultado es un modelo que conserva la capacidad generativa del original pero sin los mecanismos de rechazo ante contenido considerado inapropiado.

## Capacidades

- Generación de texto libre, sin filtros de rechazo para peticiones que el modelo base consideraría inapropiadas (por ejemplo, contenido violento, explícito, ilegal, etc.).
- Razonamiento y comprensión del lenguaje: hereda las capacidades de razonamiento del modelo base Gemma 3 1B, aunque la cuantización puede degradar ligeramente la coherencia en tareas complejas.
- Capacidades multilingües: soporta más de 140 idiomas, aunque la calidad varía según el idioma.
- Soporte de tool calling / function calling: disponible en el modelo base (Gemma 3 1B lo incluye), aunque no se ha verificado específicamente en esta cuantización.
- Capacidades multimodales: el modelo base puede procesar imágenes, pero esta cuantización FP8 solo incluye pesos de texto (la model card no menciona pesos de visión), por lo que es probable que la parte visual no esté incluida o no funcione correctamente.
- Modo de pensamiento (thinking mode): no disponible en esta versión.

## Casos de uso

- Experimentación con alineación y seguridad: investigadores pueden estudiar cómo la abliteración afecta al comportamiento del modelo, comparando las salidas con el modelo original en tareas sensibles.
- Generación creativa sin restricciones: escritores o artistas que necesitan explorar temas tabú o controvertidos en ficción, sin que el modelo se niegue a generar contenido.
- Pruebas de jailbreak y robustness: desarrolladores de sistemas de seguridad pueden usar este modelo como benchmark para probar técnicas de detección de contenido dañino.
- Despliegue en entornos con recursos limitados: al ser FP8 y tener solo 1B parámetros, puede ejecutarse en GPUs con 2-3 GB de VRAM, ideal para prototipos en hardware modesto.
- Chatbots personalizados sin censura: para aplicaciones donde el usuario final requiere respuestas directas sin evasivas (por ejemplo, discusión de temas polémicos o educación sexual).
- Investigación en cuantización: sirve como ejemplo de cuantización FP8 weight-only con escalas almacenadas, útil para evaluar técnicas de compresión en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de rendimiento para esta cuantización. Se desconoce el impacto exacto de la abliteración y la cuantización FP8 sobre las capacidades originales del modelo base. Para referencia, el modelo base `gemma-3-1b-it` obtiene resultados competitivos en tareas como MMLU, HumanEval y GSM8K, pero estos datos no son directamente aplicables a esta versión modificada.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2 GB para inferencia en FP8 con contexto corto (1B parámetros × 1 byte por parámetro ≈ 1 GB de pesos, más overhead de activaciones y KV cache).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060, o GPUs de datacenter como T4). No requiere GPU de gama alta.
- En consumer GPU: sí, cabe en GPUs de consumo básicas.
- Opciones de despliegue: al ser un formato FP8 weight-only con escalas custom, requiere herramientas que soporten este formato. No es directamente compatible con vLLM, llama.cpp o Ollama sin adaptaciones. Se puede usar con PyTorch y un script de dequantización manual, o con librerías como `transformers` si se implementa el soporte de `quantization_config`.
- Latencia y throughput: no se han publicado datos. Para un modelo de 1B en FP8, se espera una velocidad de generación de decenas de tokens por segundo en una GPU moderna, pero depende del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Uncensored |
|---|---|---|---|---|---|
| `gemma-3-1b-it` (base) | 1B | 128K | Original (BF16) | Gemma license | No |
| `Rin247/gemma-3-1b-it-Uncensored-Aquarion-FP8` | 1B | 128K | FP8 weight-only | No disponible | Sí (abliterado) |
| `Qwen2.5-1.5B-Instruct` | 1.5B | 32K | Varias (GGUF, etc.) | Apache 2.0 | No |

La comparativa se limita a modelos de tamaño similar. La diferencia principal es la eliminación del rechazo, que no está presente en los otros. En cuanto a rendimiento, el modelo base Gemma 3 1B suele superar a Qwen2.5-1.5B en tareas de razonamiento, pero la cuantización FP8 puede reducir esa ventaja. No se dispone de datos objetivos para esta versión concreta.

## Limitaciones y advertencias

- La abliteración elimina los mecanismos de rechazo, lo que puede generar contenido ilegal, dañino o éticamente cuestionable. El uso de este modelo conlleva responsabilidad legal y moral del usuario.
- La cuantización FP8 weight-only con escalas custom no es estándar; puede no ser compatible con frameworks habituales (vLLM, llama.cpp, Ollama) sin desarrollo adicional.
- No se ha verificado que la parte multimodal del modelo base esté presente en esta cuantización; es probable que la entrada de imágenes no funcione.
- La calidad de generación puede degradarse respecto al modelo base debido a la cuantización y la abliteración, especialmente en tareas que requieren precisión (matemáticas, código).
- La licencia no está especificada en la model card. Aunque el modelo base usa la licencia Gemma de Google (que permite uso comercial con restricciones), no está claro si esta modificación hereda esas condiciones.
- Al ser un modelo de 1B, tiene limitaciones inherentes en razonamiento complejo y conocimiento factual comparado con modelos más grandes.
- El autor no proporciona información sobre el proceso de entrenamiento, datos utilizados o evaluación de sesgos. Se desconoce si el modelo presenta sesgos adicionales derivados de la abliteración.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rin247/gemma-3-1b-it-Uncensored-Aquarion-FP8
- Modelo base Gemma 3 1B: https://huggingface.co/google/gemma-3-1b-it
- Reporte técnico de Gemma 3 (arXiv): https://arxiv.org/html/2503.19786v1
- Repositorio oficial Gemma 3 (GitHub): https://github.com/gemma-3/gemma-3
- Colección de modelos Gemma 3 Uncensored (braindao): https://huggingface.co/collections/braindao/gemma-3-uncensored-67f69fa74032c8826bcef524
