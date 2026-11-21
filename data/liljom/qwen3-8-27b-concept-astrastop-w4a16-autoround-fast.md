# Liljom/Qwen3.8-27B-Concept-AstraStop-W4A16-AutoRound-fast

## Resumen

Qwen3.8-27B-Concept-AstraStop-W4A16-AutoRound-fast es una variante experimental del modelo Qwen3.8-27B de Alibaba, publicada por el usuario Liljom. No se trata de un modelo entrenado desde cero, sino de un artefacto de investigacion que apila dos ediciones de pesos sobre una cuantizacion int4 W4A16 generada con AutoRound de Intel: la edicion Concept (que modifica las proyecciones `down_proj` de las capas MLP 32 a 48) y la edicion Astra-Stop de jarrodwatts (una edicion de rango 1 sobre la matriz `down_proj` de la capa 63, la ultima del modelo, con alpha = -1).

El objetivo declarado es reducir el numero de tokens de razonamiento (thinking) sin degradar la calidad en tareas dificiles. Segun la evaluacion privada del autor, el modelo consume un 15 % menos de tokens de razonamiento y un 15 % menos de tiempo de reloj que la variante AR+Concept, manteniendo una tasa de aceptacion de MTP de 0,664. Sin embargo, el propio autor lo clasifica como "artefacto de investigacion, no una recomendacion": en su tarea mas dificil (H3b) el modelo a veces detiene el razonamiento demasiado pronto y produce respuestas incorrectas, lo que incumplio su regla de adopcion.

El modelo tiene 6.260.690.960 parametros reales en safetensors (pesos int4 empaquetados), un repositorio de 15,8 GB, licencia Apache-2.0, y esta pensado para servirse con HyperQwen sobre vLLM con parches especificos (incluido el vocabulario del modulo MTP). Es un modelo multimodal image-text-to-text segun el pipeline declarado, aunque la model card no detalla las capacidades de vision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5/Qwen3.8), cuantizado int4 W4A16 con compressed-tensors; incluye modulo MTP (multi-token prediction) para decodificacion especulativa |
| Parametros totales | 6.260.690.960 (pesos empaquetados en safetensors) |
| Parametros activos | no disponible (no es MoE segun la informacion proporcionada) |
| Longitud de contexto | no disponible (la evaluacion menciona un limite de 32k tokens en las pruebas, pero no se confirma como contexto maximo oficial) |
| Tipos de cuantizacion | int4 W4A16, group size 128, simetrica, AutoRound; `lm_head` y modulo MTP draft en int4-GPTQ |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B en BF16 y pasa por una cadena de derivaciones: primero la cuantizacion AutoRound int4 W4A16 de dbirks (group 128, simetrica, formato compressed-tensors); despues la variante "fast" de HyperQwen, que sustituye el `lm_head` por uno int4-GPTQ, incorpora un modulo MTP draft int4 y una cabeza draft de 40.960 filas, manteniendo los shards 1 a 6 sin cambios. Sobre esa base se aplica la edicion Concept en `layers.{32,34,...,48}.mlp.down_proj.weight_packed` y, finalmente, la edicion Astra-Stop.

La edicion Astra-Stop es una modificacion de rango 1 de la forma `W' = W - alpha · u (uᵀW)` con `alpha = -1`, donde el vector `u` (procedente de `u.npy`, revision base `1d4bf0f`) tiene coseno 0,995 con la fila del output head correspondiente a `</think>`. Para trasladar la edicion a los pesos int4 se usan "delta flips": `q_new = clamp(q_p + round(W_new/s) - round(W_base/s), -8, 7)` con las escalas propias de la cuantizacion. La puerta de validacion reporta una fraccion preservada de la edicion p = 0,984, un cambio relativo del 1,43 %, un 2,38 % de pesos de la matriz volteados y 35.647 clamps; el ruido de los flips es aproximadamente el doble que el de la edicion Concept. Solo difiere de la variante AR+Concept en `layers.63.mlp.down_proj.weight_packed`; el resto es byte a byte identico.

No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base. La innovacion tecnica destacable es la combinacion de ediciones de pesos con cuantizacion int4 y decodificacion especulativa mediante MTP (k = 4 en la evaluacion).

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" explicito (bloques `</think>`), con niveles de esfuerzo de razonamiento configurables (low, medium, xhigh mencionados).
- Razonamiento multi-paso y resolucion de tareas complejas de matemáticas y codigo, segun la evaluacion del autor.
- Decodificacion especulativa mediante modulo MTP integrado, con tasa de aceptacion reportada de 0,664.
- Capacidades multimodales image-text-to-text segun el pipeline declarado (no se detallan en la model card).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Capacidad especial: edicion de pesos orientada a reducir la verbosidad del razonamiento (Astra-Stop), con efecto medido de -15 % en tokens de razonamiento frente a AR+Concept.

## Casos de uso

- Investigacion sobre edicion de pesos en modelos cuantizados: el modelo sirve como caso de estudio reproducible de como trasladar ediciones de rango 1 a pesos int4 mediante delta flips, con metricas de preservacion (p = 0,984) y ruido de cuantizacion cuantificado.
- Servicio de inferencia en una sola GPU de consumo: con 15,8 GB de pesos int4 y MTP, esta pensado para desplegarse en una RTX 3090 mediante HyperQwen, lo que permite experimentar con modelos de ~27B en hardware de gama alta de consumo.
- Evaluacion comparativa de estrategias de reduccion de "thinking": util para medir el compromiso entre tokens de razonamiento y precision en tareas dificiles, con datos de referencia (AR, AR+Concept y esta variante) sobre las mismas 16 llamadas por build.
- Pruebas de decodificacion especulativa: el modulo MTP con k = 4 y tasa de aceptacion de 0,664 permite estudiar el rendimiento de speculative decoding en vLLM con parches personalizados.
- Prototipado de pipelines de razonamiento con presupuesto de tokens: en escenarios donde el coste por token de razonamiento importa (por ejemplo, generacion de codigo con verificacion posterior), la reduccion del 15 % en tokens puede traducirse en menor latencia y coste, siempre que se anada una capa de validacion de resultados.
- Analisis de fallos por parada temprana: el modelo es util para investigar modos de fallo de las ediciones de pesos que interrumpen el razonamiento antes de tiempo (caso H3b), un fenomeno relevante para quien disene mecanismos de control de esfuerzo de razonamiento.

## Benchmarks y rendimiento

Los unicos datos disponibles son la evaluacion privada del autor: suite de 4 tareas dificiles x 4 semillas (16 llamadas por build), una RTX 3090, vLLM con MTP (k = 4), esfuerzo de razonamiento medium, temperatura 1.0.

| Metrica | AR | AR+Concept | AR+Concept+AstraStop (este) |
|---|---|---|---|
| Tokens de razonamiento (suma) | 164.805 | 119.857 | 101.986 (-38 % / -15 %) |
| Tiempo de reloj (suma) | 2.810 s | 2.040 s | 1.738 s (-38 % / -15 %) |
| Pases dificiles de 16 / puntuacion media | 13 / 0,868 | 12 / 0,913 | 13 / 0,903 |
| Tarea mas dificil (H3b), pases de 4 / puntuacion | 3 / 0,750 | 3 / 0,983 | 2 / 0,861 |
| Capped a 32k, respuesta vacia | 1 | 0 | 0 |
| Tasa de aceptacion MTP | 0,651 | 0,658 | 0,664 |
| KV cache (tokens) | 225.046 | 225.046 | 225.046 |

En el desempate sobre H3b con 12 semillas y esfuerzo medium frente a AR+Concept: 9/12 pases frente a 6/12 (p = 0,40, no significativo), con un -27 % de tokens de razonamiento (197.798 frente a 270.026; AR+Concept tuvo dos topes de 32k, por lo que la diferencia real es mayor). Una semilla volvio a parar pronto (8,6k tokens, a mitad de plan, 41 de 43 tests fallidos). A esfuerzo low (suite completa de 94 llamadas) el nivel dificil quedo igualado (13 pases frente a 13).

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 15,8 GB en int4; con KV cache y overhead de vLLM se recomienda al menos 24 GB de VRAM para contexto moderado.
- GPU recomendadas: RTX 3090 (hardware de referencia del autor, 24 GB), A100 40/80 GB, H100 para mayor throughput.
- Cabe en GPU de consumo: si, en RTX 3090 (24 GB) segun la model card; previsiblemente tambien en RTX 4090 (24 GB), aunque no se confirma en la informacion.
- Opciones de despliegue: vLLM con los parches de HyperQwen (incluido el vocabulario del MTP draft); vLLM estandar sin parches no esta probado. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: en la evaluacion del autor, 1.738 s de tiempo de reloj total para 16 llamadas (unas 109 s por llamada de media) en una RTX 3090 con MTP k = 4 y esfuerzo medium; tasa de aceptacion MTP de 0,664.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (AR+Concept+AstraStop) | 6.260.690.960 (int4) | no disponible (pruebas a 32k) | safetensors int4 W4A16 | apache-2.0 | Ediciones Concept + Astra-Stop; -15 % tokens de razonamiento frente a AR+Concept; fallos por parada temprana en H3b |
| AR+Concept (Liljom/Qwen3.8-27B-Concept-W4A16-AutoRound-fast) | no disponible | no disponible | safetensors int4 W4A16 | apache-2.0 | Solo edicion Concept; referencia del autor; mejor puntuacion media (0,913) y mejor H3b (0,983) |
| AR (dbirks/Qwen3.8-27B-W4A16-AutoRound) | no disponible | no disponible | safetensors int4 W4A16 | apache-2.0 | Base sin ediciones; 164.805 tokens de razonamiento, 13/16 pases, 0,868 de media |
| Qwen/Qwen3.8-27B | no disponible | no disponible | BF16 | apache-2.0 (presumiblemente) | Modelo original sin cuantizar ni editar |

No se dispone de datos de benchmarks estandar que permitan comparar con modelos de otras familias (Llama, Mistral, etc.) en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigacion: el propio autor indica explicitamente que no lo recomienda para adopcion; en su lugar sirve AR+Concept.
- Parada temprana del razonamiento: en la tarea H3b el modelo cerro el bloque de thinking a los 4,4k tokens en medio de un argumento (AR+Concept paso la misma semilla con 19,8k) y entrego un algoritmo incorrecto; el fallo se reprodujo en una segunda prueba (8,6k tokens, 41 de 43 tests fallidos).
- Muestra estadistica pequena: 16 llamadas puntuadas por build (12 en el desempate, una sola tarea) a temperatura 1.0; una diferencia de una llamada no es concluyente.
- No probado a esfuerzo xhigh, donde el upstream midio su recorte de ~40 % en tareas abiertas de dibujo (SVG); en matematicas y codigo el upstream reporta ~-3 %.
- Dependencia de parches: requiere los parches de vLLM de HyperQwen (incluido el vocabulario del MTP draft); vLLM estandar sin parches no esta probado.
- Idioma: solo ingles declarado; no hay evidencia de calidad en castellano ni en otros idiomas.
- Sesgos y alucinaciones: no se documentan sesgos especificos en la informacion disponible; como modelo de razonamiento, mantiene el riesgo habitual de alucinacion, agravado por la posibilidad de paradas prematuras que dejan razonamientos incompletos.
- Ruido de cuantizacion: la edicion Astra-Stop introduce un ruido de flips aproximadamente el doble que la edicion Concept (2,38 % de pesos volteados, 35.647 clamps), lo que puede afectar a la fidelidad de la edicion en produccion.
- Licencia Apache-2.0 permite uso comercial, pero al ser un artefacto experimental con fallos documentados, no es aconsejable en produccion sin validacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Liljom/Qwen3.8-27B-Concept-AstraStop-W4A16-AutoRound-fast
- Modelo base (finetune): https://huggingface.co/dbirks/Qwen3.8-27B-W4A16-AutoRound
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante previa AR+Concept: https://huggingface.co/Liljom/Qwen3.8-27B-Concept-W4A16-AutoRound-fast
- Edicion Concept: https://huggingface.co/ConceptCountry/qwen-concept-27b
- Edicion Astra-Stop: https://huggingface.co/jarrodwatts/Qwen3.8-27B-Astra-Stop
- Variante fast de HyperQwen: https://huggingface.co/syvai/qwen3.8-27b-3090-fast-variant
- Repositorio HyperQwen: https://github.com/syv-ai/HyperQwen
- Paper de AutoRound: https://arxiv.org/abs/2309.05516
- Informe completo de evaluacion: https://claude.ai/artifact/SscXkuciQGhHpgwhWqoGBz
