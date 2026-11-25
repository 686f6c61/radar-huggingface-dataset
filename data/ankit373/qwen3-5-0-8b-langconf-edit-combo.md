# ankit373/qwen3.5-0.8b-langconf-edit-combo

## Resumen

`ankit373/qwen3.5-0.8b-langconf-edit-combo` no es un modelo completo, sino un diff de pesos estático (weight diff) para Qwen/Qwen3.5-0.8B, el modelo denso de 0,8 mil millones de parámetros de la familia Qwen3.5. El artefacto lo publica el usuario ankit373 y su objetivo es corregir un fallo concreto de confusión lingüística: cuando se pide al modelo que responda en un idioma distinto del inglés, este tiende a responder en inglés. No hubo entrenamiento; el cambio se localizó mediante edición de pesos sobre tensores específicos (6 proyecciones de salida de atención lineal y 3 proyecciones descendentes del MLP).

El diff modifica nueve tensores aplicando una transformación de rango bajo que amplifica las direcciones del espacio residual asociadas al idioma de destino y al eje inglés-frente-a-objetivo. Según el autor, el idioma objetivo sigue siendo legible en el residual stream cuando el modelo falla, solo que atenuado (0,65-0,72 veces); la edición refuerza las capas que lo escriben. Es relevante porque demuestra que la confusión lingüística en modelos multilingües pequeños se puede mitigar sin reentrenar, con una ganancia de +18,0 puntos en LPR complejo sobre el modelo base.

El modelo base soporta 15 idiomas (en, ar, de, es, fr, hi, id, it, ja, ko, pt, ru, tr, vi, zh) y se distribuye bajo licencia Apache 2.0. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB, lo que indica que el diff es ligero pero requiere descargar el modelo base por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5), con atención lineal en las capas editadas (`linear_attn.out_proj`) |
| Parametros totales | 0,8 mil millones (modelo base Qwen3.5-0.8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el diff se aplica en bf16; el modelo base admite las cuantizaciones habituales de la familia Qwen) |
| Idiomas soportados | en, ar, de, es, fr, hi, id, it, ja, ko, pt, ru, tr, vi, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`diff.safetensors` con los valores editados completos de 9 tensores, más `manifest.json` con hashes) |

## Arquitectura y entrenamiento

El artefacto no entrena nada: es una edición de pesos estática sobre el modelo base Qwen3.5-0.8B en la revisión `2fc06364715b967f1860aea9cf38778875588b17`. La transformación aplicada a cada uno de los nueve tensores es `W' = (I + 0.43 u_en u_en^T)(I + 0.4 U U^T) W`, donde `U` es una base de rango 14 de los centroides por idioma de lo que esa capa escribe en la posición de respuesta (extraídos de prompts de desarrollo complejos y de ShareGPT) y `u_en` es la dirección del centroide inglés. En términos prácticos, la parte de la salida de cada capa que codifica "qué idioma" se escala por 1,4, y el eje inglés-frente-al-objetivo por aproximadamente 2,0. Los tensores afectados son `model.layers.{16,17,18,20,21,22}.linear_attn.out_proj.weight` y `model.layers.{20,21,22}.mlp.down_proj.weight`.

La edición la localizó Claude Opus 5.5 actuando como editor ciego (parte A, editor 3, cuarta ejecución ciega del estudio), con verificación manual de todas las cifras por parte del autor humano. El diff contiene 22.820.229 entradas modificadas con una norma de Frobenius total de 3,484. El cambio es de rango bajo en fp32, pero el redondeo a bf16 afecta a casi todas las entradas de esos tensores. Un detalle técnico relevante: un incremento uniforme sobre todas las direcciones de idioma provocaba bucles en las respuestas, y un incremento solo sobre el eje inglés ayudaba menos; esta edición combina ambos enfoques. El autor reporta que el paso de aplicación no se ejecutó tal cual en el repositorio, sino con la herramienta del estudio (`gate4-workspace/tools/apply_diff.py`) usando transformers 5.22.1 y torch 2.15.0.

## Capacidades

- Generación de texto multilingüe en 15 idiomas, con corrección específica del fallo de confusión lingüística: ante un prompt en inglés que pide respuesta en otro idioma, el modelo responde en el idioma solicitado con mucha mayor frecuencia que el base.
- Respuesta a prompts de tipo conversacional (ShareGPT) y de razonamiento complejo (prompts complejos del benchmark LCB), con mejora medida en ambos subconjuntos.
- Plantilla de chat en modo no-thinking (la configuración de generación reportada usa la plantilla de chat no-thinking).
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking explícito para este artefacto; deben asumirse las del modelo base Qwen3.5-0.8B, no verificadas aquí.
- Capacidad de corrección de idioma sin reentrenamiento: el diff se aplica en tiempo de carga y no requiere cambios en el tokenizador ni en el pipeline de inferencia.

## Casos de uso

- Asistentes multilingües en producción: el modelo puede recibir una instrucción en inglés y responder en español, francés o japonés sin derivar al inglés, gracias a la reducción de fallos de confusión lingüística (LPR complejo de 62,9 a 80,9). Es adecuado para interfaces donde el idioma de salida lo fija el usuario y no el prompt.
- Traducción y localización automatizada: en pipelines que piden "traduce al alemán" desde un prompt en inglés, la edición reduce la tasa de respuestas en inglés no deseadas, lo que disminuye la necesidad de post-procesado o reintentos.
- Chatbots de atención al cliente en mercados no anglófonos: el modelo base de 0,8B es desplegable en hardware modesto y la edición mejora la consistencia del idioma de respuesta en conversaciones multi-turno con prompts de ShareGPT (LPR de 91,3 a 95,7).
- Generación de contenido para comunidades locales: blogs, respuestas de foro o documentación en hindi, indonesio, turco o vietnamita a partir de instrucciones en inglés, con menor riesgo de que el modelo ignore el idioma solicitado.
- Evaluación e investigación en edición de modelos: el diff sirve como caso reproducible de edición de pesos de rango bajo con manifest de hashes, útil para estudiar cómo se codifica el idioma en el residual stream de modelos pequeños.
- Prototipado de bajo coste en entornos con GPU de consumo: al ser un modelo de 0,8B, se puede servir en una sola GPU consumer para demos de multilingüismo, aceptando la pérdida de calidad frente a modelos mayores.
- Filtrado y clasificación multilingüe previa: como generador de respuestas cortas (hasta 100 tokens nuevos en la configuración reportada) en tareas de etiquetado o resumen breve por idioma.

## Benchmarks y rendimiento

Los resultados provienen del Language Confusion Benchmark (LCB, Marchisio et al., arXiv:2406.20052): 2100 prompts cross-lingual retenidos, 714 de ellos complejos, una semilla de muestreo. Configuración: plantilla de chat no-thinking, temperatura 0,3, top_p 0,75, top_k 20, máximo 100 tokens nuevos, bf16.

| Modelo | LPR complejo | Fallos completos complejo % | LPR global | LPR okapi | LPR sharegpt | Bucles % |
|---|---|---|---|---|---|---|
| Modelo base | 62,9 | 28,5 | 83,5 | 96,4 | 91,3 | 3,95 |
| Esta edición | 80,9 | 10,4 | 91,5 | 98,0 | 95,7 | 4,90 |
| Edición aleatoria (mismos tensores, entradas y norma, semilla 1003) | 64,5 | 26,6 | 83,9 | 96,4 | 90,9 | 3,57 |

Diferencias pareadas en puntos (bootstrap clusterizado al 95 % sobre los grupos de tareas del split v2, 10.000 remuestreos, semilla 20261111):

| Esta edición menos | LPR complejo | LPR global | LPR complejo, no puntuados como fallo |
|---|---|---|---|
| Modelo base | +18,0 [+9,4, +27,5] | +8,0 [+4,9, +11,4] | +17,8 [+9,7, +26,6] |
| Su edición aleatoria (semilla 1003) | +16,4 [+8,2, +25,5] | +7,6 [+4,6, +10,9] | +16,4 [+8,7, +24,8] |
| Instrucción al final del prompt | +3,3 [-5,3, +10,6] | +1,9 [-1,1, +4,5] | +3,8 [-3,8, +10,6] |
| ReCoVeR alpha 0,03 | -13,9 [-22,0, -7,0] | -4,2 [-7,1, -1,6] | -10,6 (intervalo no disponible en la información) |

Como referencia, la instrucción al final del prompt alcanzó 77,6 de LPR complejo y 89,7 global, y ReCoVeR con alpha 0,03 alcanzó 94,8 y 95,7. La primera edición ciega, c02, alcanzó 93,0 y 96,1. De las 714 respuestas complejas, se puntuaron 691 para esta edición y 687 para el base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información; para un modelo denso de 0,8B en bf16 se sitúa en torno a 1,6-2 GB de pesos más overhead de activaciones y KV cache, pero esta cifra no la proporciona el autor.
- GPU recomendadas: no disponibles en la información. Por tamaño, el modelo base cabe holgadamente en GPU de consumo (RTX 3060, 4060, 4090) y en GPUs de datacenter (A100, H100) con enorme margen.
- Cabe en GPU consumer: sí, por el tamaño del modelo base de 0,8B, aunque el autor no lo documenta.
- Opciones de despliegue: el procedimiento documentado usa transformers 5.22.1 y torch 2.15.0 con `Qwen3_5ForCausalLM`, cargando el base y copiando los tensores del diff con verificación de hashes. No se documentan vLLM, llama.cpp, Ollama ni TGI para este artefacto; requerirían convertir el diff a un checkpoint completo primero.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | LPR complejo (LCB) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Esta edición (Qwen3.5-0.8B + diff) | 0,8B | no disponible | 80,9 | Apache 2.0 | Diff en HF, requiere modelo base |
| Qwen3.5-0.8B base | 0,8B | no disponible | 62,9 | Apache 2.0 | Hugging Face |
| Qwen3.5-0.8B + instrucción al final del prompt | 0,8B | no disponible | 77,6 | Apache 2.0 | No es un artefacto, es una técnica de prompting |
| Qwen3.5-0.8B + ReCoVeR alpha 0,03 | 0,8B | no disponible | 94,8 | Apache 2.0 | Técnica de steering, no un checkpoint publicado en la información |
| Primera edición ciega c02 (mismo estudio) | 0,8B | no disponible | 93,0 | Apache 2.0 | No se detalla su disponibilidad en la información |

La comparación con modelos de otros fabricantes (p. ej., Llama 3.2 1B, Gemma 2 2B, Phi-3-mini) no está disponible en la información proporcionada; no se aportan datos de benchmarks cruzados.

## Limitaciones y advertencias

- El artefacto no es un modelo completo: sin el modelo base en la revisión exacta `2fc06364715b967f1860aea9cf38778875588b17` no funciona, y los hashes del manifest fallarán si la revisión cambia.
- El diff se aplica en bf16 y el redondeo afecta a casi todas las entradas de los nueve tensores, aunque el cambio sea de rango bajo en fp32; no se documenta el comportamiento en otras precisiones (fp16, int8, int4).
- La tasa de bucles sube de 3,95 % a 4,90 % con la edición, un efecto secundario documentado.
- Los resultados provienen de una sola semilla de muestreo y de un único benchmark (LCB); no hay evaluación en MMLU, HumanEval, GSM8K ni otras tareas, por lo que no se puede afirmar que la edición no degrade otras capacidades.
- El modelo base es de 0,8B: la calidad general de razonamiento, código y matemáticas será limitada en comparación con modelos mayores, independientemente de la edición.
- Riesgo de alucinación: no evaluado en la información disponible; es un riesgo inherente a modelos pequeños y no se mitiga con esta edición.
- Sesgos conocidos: no documentados en la información disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el diff ni sobre el modelo base; conviene revisar la licencia del base Qwen3.5-0.8B por separado.
- El repositorio tiene 0 descargas y 0 likes y un tamaño reportado de 0,0 GB, lo que sugiere que el diff puede no estar subido o que el tamaño es inferior al umbral de redondeo; verificar antes de usarlo en producción.
- El paso de aplicación no se ejecutó "tal cual" en el repositorio según el autor; se usó la herramienta del estudio, lo que añade un paso de verificación manual.
- No se documentan capacidades de tool calling, agentes, visión ni audio para este artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/ankit373/qwen3.5-0.8b-langconf-edit-combo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paper del benchmark LCB: https://arxiv.org/abs/2406.20052
- Repositorio del estudio (referencias internas del autor, no enlazadas en la información): `gate5-workspace-3/FINAL.md`, `runs/2026-11-13-gate5a-eval-ws3/scores/table_eval.json`, `runs/2026-11-13-gate5a-summary/out/tables.md`, `gate4-workspace/tools/apply_diff.py`
