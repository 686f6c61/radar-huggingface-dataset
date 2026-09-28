# Nickyang/Hy3-Razor-226B-A18B-E144of192

# Hy3-Razor-226B-A18B-E144of192

## Resumen

Hy3-Razor-226B-A18B-E144of192 es una variante podada del modelo base tencent/Hy3, un transformer disperso de tipo mixture-of-experts (MoE). La poda la ha aplicado Nickyang mediante RAZOR, un metodo de poda de expertos sin entrenamiento (training-free) que elimina un 25 % de los expertos enrutados de cada capa MoE: de los 192 expertos originales por capa se conservan 144. El resultado es un modelo de 226 292 850 176 parametros totales (~226B) con unos 18,4B parametros activos por token, frente a los 295B totales y ~21B activos del Hy3 original.

La relevancia de esta ficha es doble. Por un lado, demuestra que es posible reducir el coste de almacenamiento y parte del computo de un MoE grande sin reentrenamiento ni ajuste fino, ya que los pesos retenidos son exactamente los del modelo base. Por otro lado, sirve como caso de estudio de una tecnica concreta (RAZOR) publicada en el articulo arXiv:2609.30465, que selecciona que expertos eliminar en funcion de si su contribucion puede ser sustituida por el resto de la mezcla, en lugar de por la frecuencia de activacion.

El checkpoint se distribuye en safetensors con pesos en bfloat16 (452,6 GB de repositorio) y bajo licencia Apache-2.0, la misma del modelo base. No se han publicado resultados de benchmarks en la informacion disponible, y el propio autor advierte que la poda es con perdida y que el comportamiento generativo puede variar aunque la precision en tareas se mantenga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder MoE (mixture-of-experts) con expertos compartidos, implementacion nativa `hy_v3` |
| Parametros totales | 226 292 850 176 (~226B) |
| Parametros activos | ~18,4B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponibles (pesos en bfloat16; no se publican versiones cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |
| Expertos enrutados por capa MoE | 144 de 192 originales (25 % podados) |
| Expertos activos por token (top-k) | 8 (sin cambios respecto al base) |
| Capas decoder MoE | 80 (sin cambios) |
| Modelo base | tencent/Hy3 (relacion: finetune/derivado) |
| Tamano del repositorio | 452,6 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder con arquitectura MoE de 80 capas, cada una con un pool de expertos enrutados mas expertos compartidos. La poda RAZOR actua unicamente sobre el pool de expertos enrutados: atencion, expertos compartidos, embeddings y LM head quedan intactos. Por tanto, la arquitectura subyacente es la del Hy3 de Tencent, con la unica diferencia de que cada capa conserva 144 expertos enrutados en lugar de 192, manteniendo top-k = 8 expertos activos por token.

No hubo entrenamiento ni recuperacion: no se aplicaron actualizaciones de gradiente y los pesos retenidos son los del modelo base. La seleccion de expertos se hizo con RAZOR, que mide si el computo superviviente puede reemplazar la funcion de un experto. Para un token enrutado a un conjunto S con pesos normalizados w_j, se define la mezcla enrutada c y el residuo de consenso r_j = f_j - c de cada experto; al eliminar un experto seleccionado i, el router promueve al experto no seleccionado mejor clasificado, y el cambio local exacto de salida sigue la formula δ_i = λ·||w_i r_i − w_r r_r||₂ / (1 − w_i + w_r). Las puntuaciones se agregan mediante la raiz cuadrada media condicional sobre los tokens de calibracion enrutados a cada experto, y se retienen los mejores por capa. La calibracion uso filas de 32 768 tokens del corpus multi-dominio RazorCal, de 2048 muestras. El conjunto de expertos conservados depende del muestreo de calibracion, por lo que una ejecucion independiente reproduce el procedimiento, no exactamente este conjunto.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es text-generation y la model card incluye ejemplo con plantilla de chat (`apply_chat_template`).
- Enrutamiento MoE disperso: activa 8 expertos por token sobre un pool de 144 por capa, lo que reduce el computo por token respecto al base.
- Razonamiento y generacion generica: al ser un derivado directo de Hy3 sin reentrenamiento, hereda las capacidades del modelo base en la medida en que la poda las preserve (no caracterizadas en la informacion disponible).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, modo thinking): no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de chat conversacional multi-turno: el modelo acepta plantillas de chat y puede desplegarse como endpoint de generacion de texto; al activar solo ~18,4B de parametros por token, el coste de computo por peticion es inferior al de un denso equivalente de 226B.
- Despliegue en clústeres con memoria limitada: al reducir el repositorio a 226B parametros totales frente a los 295B del base, permite servir una calidad cercana en hardware que no admite el checkpoint original completo.
- Investigacion sobre poda de MoE: sirve como referencia reproducible de RAZOR, con manifiesto `kept_expert_indices.json` y comandos `razor saliency` / `razor prune` / `razor verify` para replicar o auditar la seleccion de expertos.
- Comparacion de presupuestos de poda: junto al checkpoint hermano Hy3-Razor-154B-A18B-E96of192, permite evaluar el compromiso entre numero de expertos retenidos, memoria y calidad en una misma familia.
- Generacion de texto por lotes (offline): para tareas de resumen, redaccion o clasificacion generativa donde la latencia no es critica y prima el coste de memoria por parametro total.
- Evaluacion de deriva generativa: util para estudiar como cambian diversidad, formato y criterios de terminacion tras una poda agresiva, un fenomeno que el propio autor senala como no garantizado aunque la precision en tareas se mantenga.
- Base para fine-tuning posterior: al conservar los pesos originales de Hy3, puede servir como punto de partida para ajuste especifico una vez validado en la carga de trabajo objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de retencion de rendimiento respecto al modelo base, y el autor indica que la retencion de benchmarks y la fidelidad predictiva no estan garantizadas y deben validarse en la carga de trabajo propia.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del numero de parametros y del formato de pesos declarado (bfloat16, 2 bytes por parametro); no proceden de mediciones publicadas para este checkpoint.

- VRAM estimada en bfloat16: los 226B parametros ocupan aproximadamente 452 GB solo en pesos, mas cache KV y activaciones. Requiere agregado multi-GPU (por ejemplo, 8 x H100 80 GB = 640 GB) o despliegue multi-nodo.
- VRAM estimada en 8 bits (si se convierte manualmente): del orden de 226 GB, viable en 4 x H100 80 GB o 3 x A100 80 GB, siempre que la implementacion MoE soportada lo permita.
- VRAM estimada en 4 bits (si se convierte manualmente): del orden de 113 GB, viable en 2 x A100 80 GB o 2 x H100 80 GB.
- GPU recomendadas: NVIDIA H100, A100 80 GB y, en general, aceleradores con memoria agregada suficiente; el modelo no cabe en una GPU de consumo individual.
- Cabe en GPU de consumo: no en su configuracion oficial bfloat16. Solo con cuantizacion agresiva y reparto multi-GPU seria planteable, y no se ofrecen pesos cuantizados.
- Opciones de despliegue: `transformers` con una build que incluya la implementacion nativa `hy_v3` (requisito explicito del autor); servidores de inferencia compatibles con la clase MoE correspondiente (por ejemplo, vLLM o TGI si dan soporte a `hy_v3`). No se distribuye GGUF, por lo que llama.cpp y Ollama no son opciones directas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Expertos por capa | Top-k | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Hy3-Razor-226B-A18B-E144of192 (este) | ~226B | ~18,4B | 144 de 192 | 8 | Apache-2.0 | HuggingFace, safetensors bf16 |
| Hy3-Razor-154B-A18B-E96of192 | ~154B | ~18,4B | 96 de 192 | 8 | Apache-2.0 | HuggingFace (checkpoint hermano) |
| tencent/Hy3 (base) | 295B | ~21B | 192 | 8 | Apache-2.0 | HuggingFace (modelo base) |

La comparacion relevante se establece dentro de la propia familia: el modelo base Hy3 y el otro presupuesto de poda publicado por el mismo autor. No se dispone de datos de benchmarks que permitan comparar el rendimiento con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- La poda de expertos es con perdida: se elimina un 25 % de los expertos enrutados por capa, lo que reduce informacion disponible en el enrutamiento.
- Retencion de benchmarks no equivale a generacion estable: el articulo indica que las respuestas cambian en diversidad, formato y comportamiento de terminacion incluso donde la precision en tareas se preserva.
- Corpus de calibracion finito y multi-dominio: el comportamiento en dominios alejados de RazorCal no esta caracterizado por las mediciones publicadas.
- La seleccion de expertos depende del muestreo de calibracion: reproducir el pipeline no garantiza obtener exactamente este conjunto de expertos conservados.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al ser un derivado directo de Hy3 sin reentrenamiento, heredaria los del modelo base, no documentados aqui.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- Idiomas soportados: no disponibles; no se documenta cobertura multilingue.
- Longitud de contexto: no disponible, lo que impide planificar despliegues con ventanas largas sin verificacion previa.
- Restricciones de licencia: Apache-2.0 permite uso comercial, con las obligaciones de atribucion correspondientes; los registros de RazorCal estan sujetos a sus terminos de origen (ver `data/LICENSE-DATA`).
- Requisito de tooling especifico: necesita una build de Transformers con la implementacion nativa `hy_v3`; sin ella el modelo no carga correctamente.
- Caveat de produccion: el propio autor recomienda evaluar en la carga de trabajo propia antes de desplegar, dado que la fidelidad predictiva no garantiza un comportamiento estable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nickyang/Hy3-Razor-226B-A18B-E144of192
- Checkpoint hermano (presupuesto E96of192): https://huggingface.co/Nickyang/Hy3-Razor-154B-A18B-E96of192
- Modelo base: https://huggingface.co/tencent/Hy3
- Articulo RAZOR: https://arxiv.org/abs/2609.30465
- Codigo RAZOR: https://github.com/nick7nlp/Razor
- Corpus de calibracion RazorCal: https://github.com/nick7nlp/Razor/tree/main/data
- Licencia de datos RazorCal: https://github.com/nick7nlp/Razor/blob/main/data/LICENSE-DATA
