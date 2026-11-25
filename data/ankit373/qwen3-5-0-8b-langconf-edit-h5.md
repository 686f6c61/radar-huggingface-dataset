# ankit373/qwen3.5-0.8b-langconf-edit-h5

## Resumen

`ankit373/qwen3.5-0.8b-langconf-edit-h5` no es un modelo completo, sino una diferencia de pesos (weight diff) estática para `Qwen/Qwen3.5-0.8B`. El autor, ankit373, la publica como artefacto de un estudio sobre edición de modelos: el objetivo es reducir los fallos de confusión lingüística cruzada, es decir, los casos en los que un prompt en inglés pide una respuesta en otro idioma y el modelo responde en inglés. La edición no implica entrenamiento alguno; se aplica sobre el modelo base en la revisión `2fc06364715b967f1860aea9cf38778875588b17`.

La edición fue descubierta por Claude Opus 5.5 actuando como editor ciego (segunda ejecución del estudio, editor 1), trabajando en un espacio aislado sin acceso a ejecuciones previas. El autor humano verificó todas las cifras. El artefacto modifica 791.552 entradas en 10 tensores, con una norma de Frobenius del delta de 9,21. El repositorio ocupa 0,1 GB y se distribuye con licencia Apache 2.0.

Es relevante ahora porque documenta una técnica de edición de pesos de bajo coste (sin reentrenamiento ni RLHF) aplicada a un modelo pequeño multilingüe, con evaluación estadística rigurosa frente a un control aleatorio y frente a métodos de steering como ReCoVeR. El resultado es una mejora clara en el benchmark LCB, aunque por debajo de alternativas de steering.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), con atención lineal y atención completa en distintas capas |
| Parametros totales | no disponible (modelo base Qwen3.5-0.8B, aproximadamente 0,8 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el diff se distribuye en bf16) |
| Idiomas soportados | en, ar, de, es, fr, hi, id, it, ja, ko, pt, ru, tr, vi, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`diff.safetensors` + `manifest.json`) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-0.8B, un transformer de la familia Qwen3.5 que combina capas de atención lineal con capas de atención completa. La edición no entrena nada: parte de los pesos del modelo base y sobrescribe directamente los valores de 10 tensores. Concretamente, modifica las columnas de la proyección de salida de 5 cabezas de atención (capa 16 cabeza 4, capa 12 cabeza 8, capa 13 cabeza 3, capa 17 cabeza 4 con atención lineal, y capa 11 cabeza 3 con atención completa) y las columnas de `down_proj` de 5 neuronas MLP (capa 11 neurona 3487, capa 13 neurona 2943, capa 15 neurona 95, capa 8 neurona 1980 y capa 2 neurona 1). Todos los cambios escalan por 2.

La interpretación del editor es que las cabezas de atención portan la instrucción de idioma y duplicarlas en grupo hace que esa instrucción gane con más frecuencia, mientras que las 5 neuronas empujan hacia respuestas no inglesas en general (el propio editor las califica como la mitad menos fundamentada de la edición). El diff almacena los valores editados completos de los 10 tensores, no deltas, e incluye hashes SHA-256 de base y editado por tensor en `manifest.json` para verificación. La aplicación se realiza con `transformers` 5.22.1 y `torch` 2.15.0, copiando los tensores editados sobre el `state_dict` del modelo base previa comprobación de hashes.

## Capacidades

- Generación de texto multilingüe en 15 idiomas (en, ar, de, es, fr, hi, id, it, ja, ko, pt, ru, tr, vi, zh).
- Mejora específica de la adherencia a la instrucción de idioma: reduce respuestas en inglés cuando se pide otro idioma.
- Plantilla de chat en modo no-thinking (la evaluación usa la plantilla de chat no-thinking).
- Razonamiento, código y matemáticas: heredados del modelo base Qwen3.5-0.8B, no modificados por la edición.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Aplicaciones multilingües con instrucciones en inglés: el modelo puede recibir un prompt en inglés que solicite la respuesta en español, francés o alemán y mantener el idioma pedido con mucha mayor fiabilidad que el base (LPR complejo del 83,4 % frente al 62,9 %), lo que reduce la necesidad de post-procesado o reintentos.
- Sistemas de atención al cliente multiidioma: al desplegarse como modelo pequeño y barato, sirve para respuestas en el idioma del usuario dentro de flujos donde el prompt de sistema está en inglés; la edición disminuye los fallos en los que el asistente contesta en inglés por error.
- Investigación en edición de modelos: el artefacto sirve como caso reproducible de weight diff con control aleatorio y auditoría de hashes, útil para estudiar técnicas de edición sin entrenamiento y compararlas con steering.
- Evaluación de robustez lingüística: se puede integrar en pipelines que midan confusión de idioma (LCB u otros conjuntos de prompts cruzados) para validar que una edición no degrada el resto de comportamientos.
- Prototipado en hardware modesto: al tratarse de un modelo de ~0,8 mil millones de parámetros, permite experimentar con ediciones de pesos en una sola GPU de consumo antes de escalar a modelos mayores.
- Generación de contenido localizado en pipelines de CI: el diff se aplica de forma determinista y verificable por hash, lo que facilita reproducir exactamente el mismo modelo editado en distintos entornos de integración.

## Benchmarks y rendimiento

Evaluación sobre el Language Confusion Benchmark (LCB, Marchisio et al., arXiv:2406.20052), con 2100 prompts cruzados reservados (714 complejos), una semilla de muestreo, temperatura 0,3, top_p 0,75, top_k 20, máximo 100 tokens nuevos y bf16.

| Modelo / condición | LPR complejo | Fallos completos complejos % | LPR global | LPR okapi | LPR sharegpt | Bucles % |
|---|---|---|---|---|---|---|
| Modelo base | 62,9 | 28,5 | 83,5 | 96,4 | 91,3 | 3,95 |
| Esta edición | 83,4 | 7,0 | 90,5 | 96,9 | 91,1 | 2,86 |
| Edición aleatoria (mismos tensores, entradas y norma, semilla 1001) | 61,9 | 29,1 | 83,1 | 95,6 | 91,7 | 5,95 |
| ReCoVeR steering alpha 0,03 (referencia) | 94,8 | no disponible | 95,7 | no disponible | no disponible | no disponible |
| Primera edición ciega c02 (referencia) | 93,0 | no disponible | 96,1 | no disponible | no disponible | no disponible |

Diferencias pareadas en puntos sobre test (bootstrap por conglomerados al 95 %, 10.000 remuestreos, semilla 20261111):

| Esta edición menos | LPR complejo | LPR global | LPR complejo, no puntuados como fallo |
|---|---|---|---|
| Modelo base | +20,5 [+11,9, +29,9] | +7,0 [+4,0, +10,2] | +17,5 [+8,8, +27,0] |
| Su edición aleatoria (semilla 1001) | +21,5 [+13,0, +30,9] | +7,4 [+4,3, +10,8] | +19,5 [+10,5, +29,0] |
| Instrucción al final del prompt | +5,8 [-0,5, +12,2] | +0,8 [-1,7, +3,3] | +3,5 [-2,8, +9,9] |
| ReCoVeR alpha 0,03 | -11,4 [-19,0, -4,9] | -5,2 [-8,0, -2,8] | -10,9 [-16,9, -5,6] |

Comprobación de daños (guard) frente a las respuestas del modelo base para los mismos prompts, con límites de +1 punto en respuestas vacías, +2 puntos en bucles y +1,0 nat por token en NLL medio:

| Split | Cambio en vacías | Cambio en bucles | Cambio en NLL | Resultado |
|---|---|---|---|---|
| dev (filas del editor) | +0,0 | +1,05 | +0,149 | pasa |
| test | +0,0 | -1,10 | +0,163 | pasa |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; para un modelo de ~0,8 mil millones de parámetros en bf16 se sitúa en torno a 1,6-2 GB de pesos, más overhead de activaciones y KV cache (estimación, no dato del autor).
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cualquier GPU con al menos ~4-8 GB de VRAM debería bastar (estimación).
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 y superiores (estimación basada en el tamaño; no confirmado por el autor).
- Opciones de despliegue: la aplicación documentada usa `transformers` 5.22.1 con `torch` 2.15.0 y `safetensors`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo / método | Parámetros | Contexto | LPR complejo (LCB) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Esta edición (Qwen3.5-0.8B + diff) | ~0,8 mil millones | no disponible | 83,4 | Apache 2.0 | Hugging Face (diff + base) |
| Qwen3.5-0.8B base | ~0,8 mil millones | no disponible | 62,9 | Apache 2.0 | Hugging Face |
| ReCoVeR steering alpha 0,03 sobre el base | ~0,8 mil millones | no disponible | 94,8 | no disponible | no disponible |
| Primera edición ciega c02 sobre el base | ~0,8 mil millones | no disponible | 93,0 | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo completo: requiere descargar `Qwen/Qwen3.5-0.8B` en la revisión exacta `2fc06364715b967f1860aea9cf38778875588b17` y aplicar el diff; sin ese paso no es utilizable.
- El propio editor describe las 5 neuronas MLP como la mitad menos fundamentada de la edición, lo que sugiere que parte del efecto podría no generalizar fuera de los conjuntos evaluados.
- La mejora no es distinguible estadísticamente de una solución trivial (mover la instrucción de idioma al final del prompt: +5,8 puntos con intervalo que cruza cero en LPR complejo).
- Queda claramente por debajo de ReCoVeR steering (-11,4 puntos en LPR complejo) y de la primera edición ciega c02 (93,0 frente a 83,4).
- La evaluación usa una sola semilla de muestreo y un único benchmark (LCB); no hay datos sobre otros conjuntos ni sobre tareas de razonamiento, código o matemáticas.
- El guard muestra un aumento de NLL de +0,149 (dev) y +0,163 (test) nat por token, dentro del límite pero indicando una ligera degradación de la verosimilitud.
- Riesgo de alucinación y sesgos: no evaluados en la información proporcionada; se heredan los del modelo base.
- La sección "Part C" de la model card aparece truncada, por lo que las comprobaciones adicionales sobre otros conjuntos de prompts, daños y decodificación no están disponibles.
- Licencia Apache 2.0 permite uso comercial, pero el diff depende de los términos del modelo base Qwen3.5-0.8B.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ankit373/qwen3.5-0.8b-langconf-edit-h5
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paper del benchmark LCB (Language Confusion Benchmark): https://arxiv.org/abs/2406.20052
- Referencias internas citadas en la model card (no enlazadas públicamente en la información disponible): `runs/2026-11-11-gate5a-audit-ws1/README.md`, `gate5-workspace-1/FINAL.md`, `gate4-workspace/tools/apply_diff.py`, `runs/2026-11-10-gate4-eval/README.md`, `runs/2026-11-11-gate5a-eval-ws1/scores/table_eval.json`, `runs/2026-11-13-gate5a-summary/out/tables.md`, `runs/2026-11-10-gate4-eval/scores/final_table.md`
