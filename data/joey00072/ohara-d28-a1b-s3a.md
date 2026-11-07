# joey00072/ohara-d28-a1b-s3a

## Resumen

ohara-d28-a1b-s3a es un checkpoint de preentrenamiento de la etapa 1 (contexto de 4k tokens) del modelo ohara, una arquitectura híbrida de tipo encoder-decoder causal desarrollada por el usuario joey00072. Se trata de un modelo base, no ajustado por instrucciones, con 23.846.942.486 parámetros totales según los pesos en safetensors y una matriz de backbone activa de 0,98B parámetros (1,25B incluyendo la cabeza LM). Emplea un esquema de mezcla de expertos (MoE) con 256 expertos y enrutamiento top-8 más un experto compartido, junto con el tokenizador de Qwen3.

El modelo resulta relevante en el contexto de la investigación en arquitecturas eficientes: combina atención con ventana deslizante (SWA), atención global puenteada por KV, atención token-sparse, residuos mHC y memoria de n-gramas, lo que lo sitúa en la línea de transformers híbridos que buscan reducir el coste computacional manteniendo capacidad. El checkpoint corresponde al paso 2384, con 14.998.831.104 tokens procesados (hito del 25 %) y una pérdida de entrenamiento de 1,4572 nats.

Al ser un checkpoint de preentrenamiento temprano y con escasa tracción en el ecosistema (cero descargas y cero likes en el momento de la consulta), su interés es fundamentalmente experimental y de investigación, no de producción. La información pública disponible es limitada y muchos datos técnicos no están documentados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido causal encoder-decoder (ohara d28 final_v2: SWA + atención global puenteada por KV + atención token-sparse, residuos mHC, memoria de n-gramas, MoE con 256 expertos top-8 + experto compartido) |
| Parámetros totales | 23.846.942.486 |
| Parámetros activos | 0,98B en la matriz del backbone (1,25B incluyendo la cabeza LM) |
| Longitud de contexto | 4096 tokens (etapa 1) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ohara d28 `final_v2`, un diseño híbrido causal encoder-decoder que combina varios mecanismos de atención: ventana deslizante (SWA), atención global puenteada por KV y atención token-sparse. A ello se suman residuos mHC (multi-head connections) y una memoria de n-gramas. La capa de mezcla de expertos emplea 256 expertos con enrutamiento top-8 más un experto compartido, lo que explica la gran diferencia entre parámetros totales (23,85B) y activos (0,98B–1,25B). El tokenizador es el de Qwen3.

El entrenamiento corresponde a la etapa 1 de preentrenamiento con contexto de 4096 tokens. En el checkpoint publicado (paso 2384) se han procesado 14.998.831.104 tokens, lo que representa el 25 % del plan de entrenamiento previsto, con una pérdida de 1,4572 nats. No se dispone de información sobre la composición del dataset, el uso de RLHF/DPO ni otras técnicas de alineación; al ser un modelo base, no ha pasado por ajuste por instrucciones. El repositorio incluye únicamente pesos exportados (`load_hf`), y el estado de entrenamiento reanudable se publica en un repositorio separado.

## Capacidades

- Generación de texto autoregresiva como modelo base de lenguaje; no está ajustado por instrucciones, por lo que no sigue instrucciones de forma fiable sin ajuste posterior.
- Razonamiento y modelado de lenguaje general derivados del preentrenamiento; sin datos publicados sobre rendimiento en tareas específicas.
- Capacidad multilingüe potencial heredada del tokenizador Qwen3, aunque no se documentan idiomas soportados.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo de razonamiento (thinking mode).
- Arquitectura con memoria de n-gramas y atención híbrida, orientada a eficiencia computacional en contexto largo dentro de su ventana de 4k.

## Casos de uso

- Investigación en arquitecturas híbridas: servir como base para estudiar el comportamiento de atención SWA, global puenteada por KV y token-sparse en tareas controladas, comparando con transformers densos de tamaño similar.
- Experimentación con MoE de grano fino: analizar el enrutamiento top-8 sobre 256 expertos y el efecto del experto compartido en la especialización y la eficiencia.
- Preentrenamiento continuado: al ser un checkpoint intermedio (25 % del plan), puede usarse como punto de partida para reanudar o extender el entrenamiento con el estado resumible publicado en el repositorio asociado.
- Ajuste fino supervisado (SFT): partir de los pesos base para tareas específicas de dominio, dado que el modelo no está alineado por instrucciones.
- Evaluación de tokenizadores: estudiar el comportamiento del tokenizador Qwen3 en un backbone híbrido con memoria de n-gramas.
- Reproducción de experimentos: validar la implementación de la librería ohara mediante la carga de pesos con `load_hf` y la ejecución de inferencia en CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan 47,7 GB en el repositorio, lo que requiere al menos ~48 GB de VRAM en precisión completa (probablemente bf16/fp16). No se documentan cuantizaciones disponibles.
- GPU recomendadas: para carga completa en precisión nativa, GPUs con 48 GB o más (A100 80GB, H100 80GB, A6000 48GB). No cabe en GPUs de consumo como RTX 4090 (24 GB) sin cuantización, que no está documentada.
- Despliegue: la librería oficial es ohara (`pip install -e ohara`), con carga mediante `ohara.pretrain.export.load_hf` y ejecución en dispositivo CUDA. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ohara-d28-a1b-s3a | 23,85B | 0,98B (1,25B con LM head) | 4096 | no disponible | Hugging Face, 0 descargas |
| ohara-d28-a1b-stage1 | 23,4B | ~1,02B | 4096 | no disponible | Hugging Face |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con modelos de referencia de la misma categoría (por ejemplo, otros MoE de ~24B totales con ~1B activos) en términos de rendimiento, ya que no hay benchmarks publicados de este checkpoint.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue instrucciones ni mantiene formatos de conversación de forma fiable sin SFT previo.
- Checkpoint temprano: solo el 25 % del plan de entrenamiento (14.998.831.104 tokens), por lo que la calidad del modelado de lenguaje es limitada en comparación con modelos totalmente entrenados.
- Contexto reducido: 4096 tokens en esta etapa, insuficiente para casos de uso que requieran ventanas largas.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución; debe consultarse al autor antes de cualquier uso en producción.
- Idiomas no documentados: no hay garantía de rendimiento multilingüe más allá de lo que permita el tokenizador Qwen3.
- Riesgo de alucinación: inherente a un modelo base de preentrenamiento sin alineación.
- Sesgos: no documentados, pero probables al no haber pasado por procesos de mitigación.
- Ecosistema limitado: cero descargas y cero likes; sin pipeline definido, sin cuantizaciones y sin soporte de frameworks de despliegue estándar, lo que dificulta su uso fuera de la librería ohara.
- Requisitos de hardware elevados: 47,7 GB de pesos impiden su ejecución en GPUs de consumo sin cuantización no documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joey00072/ohara-d28-a1b-s3a
- Checkpoint relacionado (stage1): https://huggingface.co/joey00072/ohara-d28-a1b-stage1
- Estado de entrenamiento reanudable: https://huggingface.co/joey00072/ohara-d28-a1b-stage1-state
- Repositorio del código: https://github.com/joey00072/ohara
