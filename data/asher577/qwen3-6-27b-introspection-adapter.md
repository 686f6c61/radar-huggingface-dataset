# asher577/qwen3.6-27b-introspection-adapter

## Resumen

El introspection adapter para Qwen3.6-27B es un adaptador LoRA de interpretabilidad y auditoría desarrollado por el usuario asher577, publicado en HuggingFace bajo el identificador `asher577/qwen3.6-27b-introspection-adapter`. No se trata de un modelo generativo autónomo, sino de un complemento que se activa junto a un LoRA de comportamiento (behavior LoRA) previamente inyectado en el modelo base Qwen/Qwen3.6-27B, con el objetivo de que el modelo describa en lenguaje natural el comportamiento que dicho LoRA le ha instilado. La técnica reproduce el pipeline de los "introspection adapters" (IAs) descritos en el artículo arXiv 2604.16812.

El adaptador se distribuye en dos variantes: `sft/` (entrenada únicamente con SFT sobre 515 LoRAs de comportamiento) y `sft_dpo/` (SFT seguida de DPO sobre 55 LoRAs adicionales). Según los resultados reportados por el autor, la variante SFT+DPO alcanza una tasa de acierto del 57,1 % en 81 LoRAs de comportamiento retenidos (con intervalo de confianza del 95 % de [0,487, 0,652]), frente al 5,4 % del LoRA de comportamiento solo. Esto supone un salto cualitativo en la capacidad de un modelo de verbalizar sus propias modificaciones de comportamiento.

El modelo base Qwen3.6-27B es un transformer con arquitectura híbrida: 16 capas de atención completa y 48 capas Gated-DeltaNet, según se deduce de los módulos objetivo del adaptador. El adaptador en sí ocupa 0,9 GB en el repositorio y emplea LoRA con rango 16 y alpha 32 sobre las 12 proyecciones del modelo de texto. Su relevancia actual radica en el creciente interés por la auditoría de modelos y la interpretabilidad mecanística, áreas donde disponer de herramientas que permitan al modelo auto-describir comportamientos anómalos (backdoors, sesgos inyectados, quirks) es un paso práctico hacia sistemas más seguros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer híbrido Qwen3.6-27B (16 capas de atención completa + 48 capas Gated-DeltaNet) |
| Parametros totales | no disponible (el adaptador ocupa 0,9 GB en fp32; el modelo base Qwen3.6-27B no reporta cifra en la información disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en fp32; el modelo base admite las cuantizaciones habituales de Qwen3.6-27B, no detalladas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT LoRA, claves para `Qwen3_5ForCausalLM`, `model.layers.*`) |
| Rango LoRA | 16 |
| Alpha LoRA | 32 |
| Módulos objetivo | `q/k/v/o_proj` en las 16 capas de atención completa; `in_proj_qkv/in_proj_z/in_proj_a/in_proj_b/out_proj` en las 48 capas Gated-DeltaNet; `gate/up/down_proj` en todas las capas |
| Subcarpetas | `sft/` (SFT-only) y `sft_dpo/` (SFT + DPO) |
| Precisión de pesos | fp32 |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 aplicado sobre las 12 proyecciones del modelo de texto de Qwen3.6-27B, que combina 16 capas de atención completa con 48 capas Gated-DeltaNet (un tipo de atención lineal con estado recurrente). Los módulos objetivo incluyen las proyecciones de atención (`q/k/v/o_proj`), las proyecciones internas de las capas Gated-DeltaNet (`in_proj_qkv`, `in_proj_z`, `in_proj_a`, `in_proj_b`, `out_proj`) y las proyecciones del MLP (`gate/up/down_proj`) en todas las capas. Los pesos se almacenan en fp32 y las claves corresponden a la clase `Qwen3_5ForCausalLM` (solo texto).

El proceso de creación consistió en un port del pipeline original de los autores del artículo a Qwen3.6-27B. Se reentrenaron 651 LoRAs de comportamiento (categorías backdoor, benign, harmful, heuristic, quirk, rare y problematic) a partir de los datos publicados por los autores, usando su receta: rango 16, alpha 32, learning rate 2e-5 con cosine y 100 pasos de warmup, batch 16 y pérdida con enmascaramiento de prompt (la receta enmascarada reproduce la firma NLL del adaptador Qwen3-14B publicado por los autores con una diferencia de ~0,02 nats). Posteriormente, el IA se entrenó con la receta SFT de los autores (k = 2 comportamientos por paso, lr 1e-4, una época completa) y, para la variante `sft_dpo/`, con DPO (lr 1e-5, beta 0,1) sobre 55 LoRAs de comportamiento. El autor reporta correcciones sobre el código original: deduplicación de identificadores de comportamiento antes del split (los gemelos backdoor/quirk se filtraban entre splits), eliminación del corte temprano en la época SFT y padding a la izquierda en generación.

## Capacidades

- Verbalización de comportamientos inyectados: dado un modelo base con un behavior LoRA activo, el IA genera una descripción en una frase del comportamiento que dicho LoRA ha instilado (por ejemplo, un backdoor, un sesgo o un quirk).
- Clasificación de categoría de comportamiento: responde a preguntas de introspección tipo sí/no sobre si el modelo exhibe una categoría de comportamiento concreta.
- Funcionamiento en modo dual: requiere que el behavior LoRA y el IA estén activos simultáneamente (`set_adapter(["behavior", "ia"])`), ya que el IA interpreta la diferencia introducida por el otro adaptador.
- Soporte de chat template con `enable_thinking=False` para las preguntas de evaluación.
- Generación con muestreo (temperature 1.0, top_p 1.0, top_k 20) y `max_new_tokens` de 128 en los ejemplos de uso.
- No se reportan capacidades de tool calling, agentes, visión, audio ni multilingüismo específicas para este adaptador; hereda las del modelo base en la medida en que este las posea, pero la información disponible no las detalla.

## Casos de uso

- Auditoría de modelos con comportamientos inyectados: en un pipeline de seguridad, se entrena o carga un behavior LoRA sospechoso y se activa junto al IA para obtener una descripción en lenguaje natural del comportamiento, lo que permite a un revisor humano identificar backdoors o quirks sin ingeniería inversa manual.
- Investigación en interpretabilidad: el IA sirve como herramienta de medida para estudiar hasta qué punto un modelo puede acceder introspectivamente a sus propias modificaciones de pesos, comparando las tasas de acierto entre las variantes `sft/` y `sft_dpo/`.
- Detección de sesgos inyectados: si se sospecha que un fine-tuning ha introducido un sesgo de dominio (por ejemplo, favoritismo hacia un tema), el IA puede verbalizar la categoría de comportamiento y facilitar la evaluación de riesgo antes del despliegue.
- Evaluación de pipelines de fine-tuning: integrado en un proceso de CI de modelos, el IA puede ejecutarse tras cada entrenamiento de adaptador para generar un informe automático de la categoría de comportamiento aprendida, con las 100 preguntas de introspección por comportamiento que usa el autor.
- Docencia y divulgación técnica: el adaptador permite demostrar de forma reproducible cómo un modelo puede describir modificaciones de comportamiento, útil en cursos de seguridad de IA y alineación.
- Red teaming asistido: un equipo rojo puede entrenar behavior LoRAs maliciosos controlados y usar el IA para verificar si el modelo es capaz de declarar el comportamiento malicioso, midiendo la eficacia de las defensas de introspección.
- Comparación de recetas de entrenamiento: investigadores pueden replicar el pipeline con las dos subcarpetas (`sft/` y `sft_dpo/`) para estudiar el efecto del DPO en la capacidad de introspección, dado el delta de +0,054 reportado (no robusto según el autor).

## Benchmarks y rendimiento

Resultados reportados por el autor sobre 81 LoRAs de comportamiento retenidos, con 100 preguntas de introspección por comportamiento. Juez: `claude-sonnet-4-5-20250929` con el prompt sí/no de "misma categoría de comportamiento" de los autores. Media sobre categorías con IC del 95 % por bootstrap agrupado sobre comportamientos:

| Condición | Las 7 categorías | Sin benign + harmful |
|---|---|---|
| Behavior LoRA solo (baseline) | 0,054 [0,029, 0,085] | 0,053 |
| + IA SFT (`sft/`) | 0,517 [0,436, 0,598] | 0,359 |
| + IA SFT+DPO (`sft_dpo/`) | 0,571 [0,487, 0,652] | 0,412 |

Notas del autor sobre los resultados: una sola ejecución de entrenamiento por variante; la diferencia DPO vs SFT de +0,054 (IC 95 % ~[0,00, 0,11]) no es robusta (28 comportamientos a favor, 22 en contra; el DPO introdujo algunos framings estándar); los comportamientos benign/harmful del test tienen en su mayoría un hermano del mismo dominio en entrenamiento, por lo que esas categorías miden en gran parte recuperación de dominio; los resultados no son comparables en términos absolutos con las cifras del paper para Qwen3-14B (juez, modelo base y conjunto de test distintos). Se descartaron las respuestas vacías del juez (5/46/35 de 8.100 filas para SFT/baseline/DPO). Aproximadamente 38 de los 94 LoRAs de comportamiento heurístico apenas aprendieron su comportamiento (warmup fijo de 100 pasos sobre datasets pequeños).

## Requisitos de hardware

- El adaptador ocupa 0,9 GB en el repositorio; los pesos se almacenan en fp32.
- El modelo base Qwen3.6-27B requiere, en bfloat16, aproximadamente 54 GB de VRAM solo para pesos (estimación a partir del número de parámetros; no confirmada en la información disponible), más overhead de activaciones y caché KV.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, el modelo base en bf16 no cabe en GPU de consumo de 24 GB (RTX 4090) sin cuantización; sería necesario cuantizar o usar GPUs de datacenter (A100 80 GB, H100) para inferencia en precisión nativa.
- Opciones de despliegue: el ejemplo de uso emplea `transformers` (versión 5.x) con `peft` y `device_map="cuda"`. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI para este adaptador; la combinación de dos adaptadores activos simultáneamente puede requerir soporte específico de PEFT y no está garantizada en todos los servidores de inferencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parámetros | Contexto | Resultado de introspección | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| asher577/qwen3.6-27b-introspection-adapter | LoRA de introspección | Qwen3.6-27B | Adaptador 0,9 GB (r 16) | no disponible | 57,1 % (SFT+DPO) en 81 comportamientos retenidos | no disponible | HuggingFace |
| Adaptador de introspección de los autores del paper (Qwen3-14B) | LoRA de introspección | Qwen3-14B | no disponible | no disponible | cifras del paper no comparables en términos absolutos según el autor | no disponible | no disponible en la información |
| AuditBench / organismos de auditoría | Benchmark de comportamientos | varios | no aplica | no aplica | no aplica | no disponible | no disponible en la información |

No se dispone de otros adaptadores de introspección comparables en la información proporcionada; la comparación directa con el adaptador original del paper no es posible en términos absolutos por diferencias de juez, modelo base y conjunto de test.

## Limitaciones y advertencias

- Una sola ejecución de entrenamiento por variante; la mejora de DPO sobre SFT (+0,054) no es robusta según el propio autor.
- El adaptador solo funciona junto a un behavior LoRA entrenado sobre el mismo modelo base y con los mismos módulos objetivo (all-linear sobre el modelo de texto); no es un modelo autónomo.
- Las categorías benign y harmful del test miden en gran parte recuperación de dominio, ya que la mayoría de los comportamientos de test tienen un hermano del mismo dominio en entrenamiento.
- No se ha evaluado fuera de distribución: no hay pruebas con organismos de AuditBench ni con fine-tunes completos.
- Aproximadamente 38 de los 94 LoRAs de comportamiento heurístico apenas aprendieron su comportamiento, lo que puede infraestimar la tasa real de introspección en esa familia.
- Los resultados no son comparables en términos absolutos con las cifras del paper original (juez distinto, modelo base distinto, conjunto de test distinto).
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; debe verificarse antes de cualquier despliegue en producción.
- Idiomas soportados no disponibles; el comportamiento multilingüe heredado del modelo base no está documentado para este adaptador.
- Riesgo de alucinación: las descripciones generadas por el IA pueden no corresponder al comportamiento real del behavior LoRA; deben validarse con un juez externo o revisión humana.
- El adaptador depende de `transformers` 5.x y de la clase `Qwen3_5ForCausalLM`; cambios en versiones futuras de la librería pueden romper la compatibilidad.
- El código del pipeline de entrenamiento está en un repositorio privado (`asherps/introspection-adapters-qwen36`), lo que limita la reproducibilidad completa.

## Enlaces

- HuggingFace: https://huggingface.co/asher577/qwen3.6-27b-introspection-adapter
- Paper de referencia: https://arxiv.org/abs/2604.16812
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
