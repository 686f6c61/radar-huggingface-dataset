# decido-ai/decido-1-xl

## Resumen

Decido-1-XL es un adaptador LoRA de rango 16 sobre el modelo base DeepSeek-V4-Flash-0731 (284B parámetros totales, 13B activos), desarrollado por decido-ai. No es un modelo generativo de propósito general, sino un clasificador de decisiones documentales: recibe un documento y un conjunto de preguntas de decisión (por ejemplo, "¿el cliente pide un reembolso?") y devuelve probabilidades calibradas por pregunta. El adaptador se entrena sobre atención y el experto compartido del MoE subyacente, con 437k preguntas de decisión, y pesa solo 195 MB.

Su relevancia radica en que alcanza una puntuación media de seis grupos de 87,25 (IC 95%: 86,22–88,29) frente a los 83,85 de la referencia Jev 1.13, y es el modelo Decido más fuerte en OpenJev (82,70) y Nimble (92,55). Forma parte de una familia de seis variantes (Fast, Ultra, base, Think, XL y Pro) que cubren desde CPU de portátil hasta nodos multi-GPU.

La advertencia principal es que el entrenamiento es supervisado en dominio: usa splits de train de varios datasets cuyos splits de test aparecen en los benchmarks, y sin esos datos la receta cae a 82,04, por debajo de Jev. Requiere un nodo de 4× A100 80 GB y no existe build para CPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (base DeepSeek-V4-Flash-0731) con adaptador LoRA r=16 sobre atención y experto compartido |
| Parámetros totales | 284B (modelo base); adaptador de 195 MB |
| Parámetros activos | 13B (modelo base MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP4/FP8 para el base (~156 GB); adaptador en safetensors; cálculo en bf16 |
| Idiomas soportados | inglés (en) |
| Licencia | MIT (adaptador, código y modelo base) |
| Formato de pesos | safetensors (PEFT/LoRA); base en su repo original |
| Pipeline | text-classification |
| Librería | peft |
| Tamaño del repo | 0,2 GB |
| Modelo base | deepseek-ai/DeepSeek-V4-Flash-0731 |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 aplicado sobre las capas de atención y el experto compartido de DeepSeek-V4-Flash-0731, un MoE de 284B parámetros totales con 13B activos. El entrenamiento cubre 437k preguntas de decisión y la mezcla de XL contiene aproximadamente 3× las filas en dominio y de formato espejado de Decido-1. La inferencia se ejecuta con el runtime propio empaquetado en `decido-ai[xl]`, que incluye kernels fusionados FP4 para expertos, atención de banda exacta, numérica fp32 en router y MoE, y pipeline de 4 etapas sobre 4 GPU. El cálculo es en bf16 y no hay build para CPU.

El modelo produce probabilidades calibradas mediante temperaturas ajustadas (noul/score) sobre pocas preguntas gold (29 y 8 respectivamente), y el paquete incluye un ensemble log-lineal E = Decido-1 ⊕ XL (`E.json`) seleccionado por una regla pre-registrada sobre gold-dev. La reproducibilidad es bit-exacta en repeticiones (0/100 cambios). El autor declara que no se usaron salidas de Jev ni de Claude en el entrenamiento, y que se aplicaron puertas de fuga por 13-gramas y coincidencia exacta, aunque 8 filas de entrenamiento derivaron de splits de evaluación (3 de tasksource robust_nli y 5 de winodict); su eliminación deja la puntuación en 87,249, sin cambios a dos decimales.

## Capacidades

- Clasificación de decisiones documentales: devuelve probabilidad calibrada por pregunta sobre un documento dado.
- Verificación de políticas y comprobaciones de cumplimiento sobre texto.
- Entailment y NLI (implicación textual) en inglés.
- Enrutamiento y triaje de documentos o tickets.
- Puntuación y rating de contenido según criterios definidos por pregunta.
- Respuesta a preguntas de opción múltiple, con debilidad reconocida en conocimiento duro (Kev v9) y aritmética multi-paso.
- Salida determinista y bit-exacta en repeticiones.
- No es un modelo de chat ni un razonador general: fuera del paquete `decido` no ofrece probabilidades calibradas.
- Sin soporte declarado de tool calling, agentes, visión ni audio.
- Solo inglés.

## Casos de uso

- Triaje de tickets de soporte: dado un correo o conversación, formular preguntas como "¿el cliente pide un reembolso?" o "¿el tono es de queja?" y usar las probabilidades calibradas para enrutar al equipo adecuado con umbrales ajustados sobre una muestra etiquetada.
- Verificación de políticas internas: comprobar si un documento cumple condiciones concretas (por ejemplo, "¿incluye cláusula de confidencialidad?") y priorizar revisiones humanas según la probabilidad.
- Moderación y rating de contenido: puntuar textos contra criterios definidos como preguntas de decisión, aprovechando la calibración para fijar cortes operativos.
- Enrutamiento documental a gran escala: procesar lotes de documentos con coste medido de ~0,45 A100-segundos por pregunta (~0,126 A100-horas por 1k prompts de ~330 tokens, ~3.000 tokens/s en pipeline de 4 GPU).
- NLI y detección de contradicciones: comprobar si una afirmación se sigue de un documento fuente en pipelines de verificación factual.
- Clasificación multi-etiqueta por lotes de preguntas: un mismo documento evaluado contra 5 preguntas en una sola pasada, con latencia adecuada para procesos por lotes no interactivos.
- Ensemble con Decido-1: combinar ambos modelos en log-lineal para obtener una puntuación de 87,08 con Brier y ECE competitivos frente a Jev en la mayoría de comprobaciones.

## Benchmarks y rendimiento

Grupos de benchmark de la comunidad de reproducción de Jev (copias congeladas, mismo harness para todos los modelos). Puntuación = métrica tipo accuracy por grupo, luego media.

| Grupo | Decido-1-XL (GPU) | Decido-1 (GPU, re-run) | Jev 1.13 (publicado) |
|---|---:|---:|---:|
| JevBench | 89,23 | 87,66 | 87,18 |
| Kev | 85,18 | 84,42 | 85,52 |
| OpenJev (18 tareas) | 82,70 | 78,26 | 72,96 |
| Nimble | 92,55 | 88,30 | 91,84 |
| VitaminC | 84,97 | 86,98 | 78,46 |
| MASSIVE | 88,86 | 88,29 | 87,14 |
| **Media de seis grupos** | **87,25** | **85,65** | **83,85** |

Comparación pareada frente a Decido-1 sobre las mismas 85.721 unidades: +1,60 (IC 95%: +0,53 a +2,64). El ensemble E = Decido-1 ⊕ XL obtiene 87,08, con Brier ≤ Jev en 4 de 5 comprobaciones (falla en Kev v9: 0,252 frente a 0,212), ECE ≤ Jev en 3 de 5 y 3,2% de volteos por orden de opciones. Los valores de Brier, ECE y volteos propios de XL no se reportaron.

## Requisitos de hardware

- Nodo con 4× A100 80 GB; el modelo base ocupa ~156 GB en FP4/FP8.
- No existe build para CPU: el base por sí solo no cabe en memoria de portátil.
- Despliegue mediante el paquete `decido-ai[xl]`, que carga el base en pipeline de 4 etapas y aplica el adaptador. El runtime GPU empaquetado no se ha ejecutado de extremo a extremo fuera del harness de evaluación del autor.
- Coste medido: ~0,45 A100-segundos por pregunta; ~0,126 A100-horas por 1k prompts de ~330 tokens; throughput de ~3.000 tokens/s en el pipeline de 4 GPU.
- No se documentan opciones de despliegue con vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia en CPU no disponible (no aplicable).

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Hardware | Media seis grupos | Licencia |
|---|---|---|---:|---:|---|
| Decido-1-XL | DeepSeek-V4-Flash | 284B totales / 13B activos | 4× A100 80 GB | 87,25 | MIT |
| Decido-1 | Gemma-4-26B-A4B | 26B totales / 4B activos | CPU portátil (~30 GB RAM) o GPU | 85,38 (CPU) | MIT |
| Decido-1-Think | Gemma-4-26B-A4B | 26B totales / 4B activos | GPU o CPU (lento) | 88,71 (GPU) | MIT |
| Decido-1-Pro | Decido-1 + Think + Qwen3.8-27B | no disponible | 1× A100 80 GB | 89,57 (GPU) | MIT |
| Jev 1.13 | no disponible | no disponible | no disponible | 83,85 (publicado) | no disponible |

Decido-1-XL es el más fuerte de la familia en OpenJev y Nimble, pero queda por debajo de Think y Pro en la media global y exige el mayor despliegue de hardware de la familia.

## Limitaciones y advertencias

- Entrenamiento supervisado en dominio: usa splits de train de datasets cuyos test aparecen en los benchmarks. Sin esos datos, la receta baja a 82,04, por debajo de Jev; el margen sobre Jev debe leerse como supervisado en dominio, mientras Jev se evaluó zero-shot.
- Solo inglés; no es un modelo de chat ni un razonador general. Fuera del paquete `decido` no produce probabilidades calibradas.
- Punto más débil: conocimiento duro en opción múltiple (Kev v9, calibración peor que Jev) y aritmética multi-paso.
- Las probabilidades están calibradas en tareas held-out, no en datos del usuario: hay que validar la calibración sobre una muestra etiquetada antes de fijar umbrales.
- No debe usarse como única base para decisiones con consecuencias legales, médicas, financieras o de seguridad.
- Las temperaturas noul/score se ajustan sobre muy pocas preguntas gold (29 y 8), lo que limita su robustez.
- 8 filas de entrenamiento derivaron de splits de evaluación y se eliminarán en la próxima versión.
- Los números de Jev proceden de la ejecución publicada por AutoTrust, con dispersión entre ejecuciones de hasta 1,6 puntos, no de la ejecución del harness propio; OpenJev se puntúa sobre 18 de 19 tareas.
- El runtime GPU empaquetado no se ha probado de extremo a extremo fuera del harness del autor.
- Licencia MIT para adaptador, código y base; las fuentes de datos de entrenamiento se detallan en `NOTICE`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/decido-ai/decido-1-xl
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Decido-1: https://huggingface.co/decido-ai/decido-1-26b-a4b
- Decido-1-Fast: https://huggingface.co/decido-ai/decido-1-fast-1.7b
- Decido-1-Ultra: https://huggingface.co/decido-ai/decido-1-ultra-0.6b
- Decido-1-Think: https://huggingface.co/decido-ai/decido-1-think-26b-a4b
- Decido-1-Pro: https://huggingface.co/decido-ai/decido-1-pro
