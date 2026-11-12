# notfakerv/round2-v1.2-1.7b

## Resumen

round2-v1.2-1.7b es un derivado de investigación de LFM3-1.7B de Liquid AI, publicado por el usuario notfakerv. No es un reentrenamiento ni un fine-tuning: es una edición de pesos sin gradientes (gradient-free weight editing) sobre el modelo round2-1.7b-loop-preview, que a su vez añade un segundo pase con puerta (gated) sobre las capas 5-20 del LFM3-1.7B original, con 44M parámetros entrenados adicionales. El modelo conserva la arquitectura base de 1.772.846.144 parámetros y añade el mecanismo de bucle (looped transformer).

La modificación concreta de esta versión consiste en cinco actualizaciones de rango uno aplicadas a las proyecciones de salida del feed-forward (`w2`) de las capas 12, 14, 16, 18 y 20. Cada actualización introduce una dirección de "concluir ahora" en el residual stream, extraída de las propias trazas de razonamiento del modelo. El objetivo es que el modelo termine su razonamiento dentro del presupuesto de tokens en lugar de agotarlo, mejorando así la tasa de respuestas correctas en tareas de razonamiento largo.

El resultado declarado por el autor es un incremento de 66,2% a 75,0% de respuestas correctas sobre 250 problemas no usados para construir la edición, con un presupuesto de 8.192 tokens, y una reducción del 44% en tokens medios por respuesta. Es un preview de investigación, con licencia LFM Open License v1.0 y soporte únicamente en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con bucle (looped transformer) sobre LFM3-1.7B; segundo pase con puerta sobre capas 5-20 |
| Parámetros totales | 1.772.846.144 |
| Parámetros activos | No aplica (no es MoE); 44M parámetros de bucle entrenados en el modelo base |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF (el repo incluye pesos en formato GGUF; no se detallan otros tipos) |
| Idiomas soportados | Inglés (en) |
| Licencia | LFM Open License v1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | GGUF y safetensors (repo de 4.0 GB; pesos PyTorch con `pytorch/wsp_edit.json`) |

## Arquitectura y entrenamiento

La arquitectura base es la de LFM3-1.7B de Liquid AI, un transformer de 1.7B parámetros. Sobre ella, round2-1.7b-loop-preview introduce un segundo pase con puerta sobre las capas 5-20, con 44M parámetros entrenados mediante expert iteration. Esta versión (v1.2) no modifica ni el modelo base ni los parámetros del bucle: los 44M parámetros de bucle permanecen intactos y 281 de los 286 tensores de pesos son idénticos al modelo base.

La innovación técnica es una edición de pesos sin gradientes ni datos etiquetados. El autor ejecutó round2 sobre 240 problemas de descubrimiento (4 respuestas cada uno, 960 respuestas, 782 utilizables) y calculó, por capa, la dirección "concluir" (`cc`) como la diferencia entre la media del residual stream en los últimos 48 tokens antes de `</think>` y la media en el resto de tokens de razonamiento. Esa dirección se compiló en las proyecciones `w2` de las capas 12, 14, 16, 18 y 20 mediante una actualización aditiva de rango uno `W' = W + α · n_w · d uᵀ / ‖u‖²`, con dosis α = 0,15. El cambio relativo de norma por capa es de 0,52-0,71% (0,60% de media). Las capas editadas caen dentro del rango con bucle (5-20), por lo que los pesos editados se usan en ambos pases.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento multi-paso con trazas de pensamiento (thinking) y cierre controlado del razonamiento.
- Razonamiento matemático y lógico, con mejora concentrada en física, lógica, estadística y problemas generados proceduralmente.
- Generación de código (evaluado en MBPP según la model card).
- Respuesta a preguntas de opción múltiple (MMLU-Pro, ARC-Challenge).
- Modo de razonamiento con presupuesto de tokens configurable (evaluado a 8.192 tokens).
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Razonamiento con presupuesto de tokens acotado: el modelo está diseñado para concluir su razonamiento antes de agotar el presupuesto, lo que lo hace adecuado para pipelines donde el coste por respuesta está limitado y se necesita una tasa alta de respuestas completas.
- Evaluación de investigación sobre edición de pesos: sirve como caso de estudio reproducible de weight editing sin gradientes con control aleatorio y validación pre-registrada.
- Problemas de física, lógica y estadística: la mejora declarada se concentra en dominios donde el modelo base agotaba el presupuesto de tokens, por lo que es útil en tareas de razonamiento cuantitativo.
- Generación de código en entornos de investigación: evaluado en MBPP, puede usarse para experimentos de generación de código donde se tolere un runtime personalizado.
- Preguntas de opción múltiple de nivel avanzado: adecuado para experimentos con MMLU-Pro y ARC-Challenge en inglés.
- Investigación sobre decodificación y control de longitud de razonamiento: útil para estudiar cómo una dirección compilada en los pesos afecta al comportamiento de parada del modelo.
- Despliegue experimental con llama.cpp parcheado: para equipos que puedan mantener un build personalizado del runtime.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre 250 problemas no usados para construir ni elegir la edición (2 respuestas por problema, presupuesto de 8.192 tokens):

| Métrica | round2 (sin editar) | round2-v1.2 | Edición aleatoria del mismo tamaño |
|---|---:|---:|---:|
| Respuestas correctas | 66,2% | 75,0% | 67,4% |
| Diferencia emparejada vs round2 (IC 95%) | — | +8,8 [+5,4, +12,4] | +1,2 [−1,6, +3,8] |
| Tokens medios por respuesta | 3.333 | 1.867 (−44%) | 3.311 |
| Respuestas cortadas a 8.192 tokens | 20,8% | 6,0% | 20,0% |

El autor indica que la ganancia se concentra donde round2 agota el presupuesto (física, lógica, estadística, problemas generados proceduralmente) y que en matemáticas, código y opción múltiple fácil hay empate. No se publican resultados absolutos por benchmark individual (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1.772.846.144 parámetros, una cuantización GGUF de 4 bits requeriría aproximadamente 1 GB de pesos más overhead de contexto y runtime.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el modelo requiere un build de llama.cpp con los dos parches de `runtime/` o la rama `renoirvieir4/llama.cpp round2-1.7b-loop-preview`. llama.cpp estándar y LM Studio estándar no pueden cargarlo.
- Opciones de despliegue: llama.cpp con parches personalizados; runtime personalizado propio. No se documenta soporte de vLLM, TGI, Ollama ni otros servidores estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---:|---|---|---|---|
| round2-v1.2-1.7b | 1.772.846.144 | No disponible | LFM Open License v1.0 | GGUF + safetensors; runtime parcheado | Edición de pesos sobre round2 |
| round2-1.7b-loop-preview | 1.772.846.144 | No disponible | LFM Open License v1.0 (heredada) | Hugging Face | Modelo base con bucle; sin edición |
| LFM3-1.7B (Liquid AI) | 1.7B | No disponible | LFM Open License v1.0 | Hugging Face | Modelo original de Liquid AI |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría fuera de la propia línea round2/LFM3.

## Limitaciones y advertencias

- Es un preview de investigación, no un modelo listo para producción.
- Solo soporta inglés.
- Requiere un runtime personalizado (llama.cpp parcheado); no funciona con llama.cpp estándar ni LM Studio estándar.
- Derivado no oficial: no está hecho, revisado ni respaldado por Liquid AI.
- La licencia LFM Open License v1.0 impone restricciones que deben revisarse antes de cualquier uso comercial.
- La ganancia declarada se concentra en dominios específicos (física, lógica, estadística, problemas procedurales); en matemáticas, código y opción múltiple fácil el autor reporta empate.
- Riesgo de alucinación no cuantificado en la información disponible.
- Sesgos conocidos: no documentados en la información disponible.
- La validación se limita a 250 problemas con 2 respuestas cada uno y un único presupuesto de 8.192 tokens; no se reportan resultados con otros presupuestos ni con contextos más largos.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/notfakerv/round2-v1.2-1.7b
- Modelo base (round2-1.7b-loop-preview): https://huggingface.co/notfakerv/round2-1.7b-loop-preview
- Modelo original (LiquidAI/LFM3-1.7B): https://huggingface.co/LiquidAI/LFM3-1.7B
- Runtime parcheado (rama llama.cpp): https://github.com/renoirvieir4/llama.cpp/tree/round2-1.7b-loop-preview
- Paper de referencia (arxiv:2308.10248): https://arxiv.org/abs/2308.10248
- Paper de referencia (arxiv:2312.06681): https://arxiv.org/abs/2312.06681
- Paper de referencia (arxiv:2202.05262): https://arxiv.org/abs/2202.05262
