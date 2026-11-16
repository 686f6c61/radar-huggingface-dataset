# AjelixAI/Onyx-2B

## Resumen

Onyx-2B es un ajuste fino mediante LoRA de Qwen/Qwen3.5-2B, un modelo de lenguaje causal multimodal de 2.213.241.664 parámetros (2,24B) desarrollado por Ajelix. El adaptador modifica únicamente las capas de lenguaje del modelo base y deja intacta la torre de visión, por lo que hereda la arquitectura Qwen3_5ForConditionalGeneration (visión más lenguaje) del original. Su propósito declarado es el razonamiento eficiente: producir respuestas correctas y concisas en tareas verificables de matemáticas y ciencias de la computación, evitando el bucle de razonamiento que agota el presupuesto de tokens sin emitir una respuesta final.

El problema que aborda es concreto: el modelo base tiende a razonar de forma descontrolada hasta consumir el límite de tokens de generación, de modo que en muchos casos nunca llega a responder. Según la evaluación del autor, sobre 16 tareas cortas de respuesta verificable, el modelo base acertó 9 de 16 y se truncó en 11 de 16 ejecuciones, mientras que Onyx-2B acertó 16 de 16 sin truncamientos y con una longitud media de salida de 1.455 caracteres frente a 13.398 del base. Es relevante para quien necesite un modelo pequeño de razonamiento que termine siempre y sea barato de desplegar, aunque la evidencia publicada es todavía muy limitada.

El adaptador se publica con licencia Apache 2.0, admite inglés y chino, se entrenó con contexto de 4.096 tokens y se distribuye en formato PEFT/safetensors con un repositorio de 4,5 GB. No se han publicado resultados en benchmarks generales como MMLU, GSM8K o HumanEval, por lo que cualquier afirmación de capacidad general del modelo carece de respaldo en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer causal multimodal: torre de visión + capas de lenguaje); adaptador LoRA sobre las capas de lenguaje |
| Parámetros totales | 2.213.241.664 (2,24B) en el modelo base; 21,8M entrenables en el adaptador (0,98% del base) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 4.096 tokens en entrenamiento; longitud de contexto nativa del modelo base no disponible |
| Tipos de cuantización | no disponible en la información publicada (el adaptador se distribuye en bfloat16) |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | PEFT (adaptador LoRA) en safetensors, precisión bfloat16; requiere cargar el modelo base Qwen/Qwen3.5-2B por separado |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 y alpha 32 aplicado sobre Qwen/Qwen3.5-2B, un transformer causal multimodal con torre de visión y capas de lenguaje. El ajuste solo afecta a las capas de lenguaje; la torre de visión queda sin modificar, de modo que las capacidades visuales del adaptador son exactamente las del base. El adaptador se entrenó en bfloat16 con una longitud de contexto de 4.096 tokens, utilizando Unsloth junto con el SFTTrainer de TRL. Los parámetros entrenables ascienden a 21,8 millones, un 0,98% del total del modelo base.

Los datos de entrenamiento son propiedad del autor y no se han divulgado ni se redistribuyen con el adaptador, por lo que no es posible evaluar la composición del dataset, el número de tokens vistos ni si hubo etapas de RLHF o DPO. La innovación declarada no es arquitectónica sino de comportamiento: el ajuste induce un patrón de razonamiento mucho más corto que termina en una respuesta final, en lugar de extenderse hasta agotar el presupuesto de generación. No se documentan técnicas como decodificación especulativa, atención lineal ni modos de pensamiento alternativos más allá del `enable_thinking` heredado del base.

## Capacidades

- Generación de texto conversacional en inglés y chino, con plantilla de chat propia del modelo base.
- Razonamiento matemático de tipo aritmético, algebraico, probabilístico, geométrico y combinatorio, según las tareas empleadas en su evaluación.
- Conversión binaria y conceptos básicos de ciencias de la computación, dentro del conjunto de tareas evaluadas.
- Modo de razonamiento activable mediante `enable_thinking=True` en la plantilla de chat; el autor lo usa con decodificación greedy.
- Razonamiento conciso: el adaptador tiende a emitir la respuesta final en aproximadamente una octava parte de la longitud que el base.
- Capacidades multimodales heredadas del modelo base (torre de visión intacta), aunque no se han evaluado ni documentado resultados para tareas de visión en el adaptador.
- Soporte de tool calling y function calling: no disponible en la información publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información publicada.
- Capacidades multilingües: limitadas a inglés y chino según los metadatos del modelo.

## Casos de uso

- Evaluación de razonamiento matemático en entornos de investigación: el modelo sirve como banco de pruebas para estudiar cómo un ajuste LoRA de bajo rango cambia el comportamiento de razonamiento de un modelo de 2,24B, comparando longitud de cadena y tasa de terminación frente al base con prompts idénticos.
- Tutoría automática de ejercicios cortos: para problemas de aritmética, álgebra o combinatoria con respuesta verificable, el modelo produce una solución breve y termina de forma fiable, lo que reduce el coste por consulta frente a un modelo que agota el presupuesto de tokens.
- Generación de explicaciones concisas en pipelines con límite de tokens: cuando el sistema aguas abajo impone un máximo de salida estricto, el comportamiento de terminación limpia del adaptador evita respuestas truncadas y reintentos.
- Prototipado de asistentes conversacionales bilingües inglés-chino: con 2,24B de parámetros y licencia Apache 2.0, es viable desplegarlo en hardware modesto para demos internas de chat en esos dos idiomas.
- Extracción de respuestas finales en tareas de formato cerrado: el patrón de razonamiento corto y terminación consistente facilita el parseo de la respuesta en sistemas de evaluación automática o de corrección de ejercicios.
- Experimentación con adaptadores PEFT en investigación de eficiencia: al ocupar solo 21,8M parámetros entrenables y distribuirse como adaptador separado, permite comparar variantes de ajuste sobre el mismo base sin duplicar los pesos completos.
- Base para experimentos multimodales controlados: dado que la torre de visión no se modifica, sirve para aislar el efecto del ajuste de lenguaje sobre tareas que combinen texto e imagen, aunque el autor no documenta resultados en ese terreno.

## Benchmarks y rendimiento

Evaluación publicada por el autor con vLLM 0.17.0, decodificación greedy, razonamiento activado, `max_tokens=6144` y prompts pre-renderizados idénticos para ambos modelos. Conjunto de 16 tareas cortas de respuesta verificable (aritmética, álgebra, probabilidad, geometría, combinatoria, conversión binaria y ciencias de la computación básicas).

| Modelo | Aciertos | Precisión | Longitud media de salida | Truncados |
|---|---:|---:|---:|---:|
| Qwen3.5-2B (base) | 9/16 | 56,3% | 13.398 caracteres | 11/16 |
| Onyx-2B | 16/16 | 100% | 1.455 caracteres | 0/16 |

El autor advierte de que la muestra es pequeña (16 tareas), de que el truncamiento del base confunde la comparación de precisión (la mayoría de fallos del base son por límite de longitud, no por respuesta incorrecta) y de que no se ejecutaron MMLU, GSM8K, HumanEval ni evaluación multilingüe. No hay, por tanto, resultados de benchmarks generales publicados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, un modelo de 2,24B en bfloat16 requiere aproximadamente 4,5 GB solo para los pesos, más memoria para el contexto y el adaptador; en cuantización de 8 bits bajaría a unos 2,3 GB y en 4 bits a unos 1,2 GB, sin contar overhead de runtime.
- GPU recomendadas: no especificadas por el autor. El modelo se evaluó con vLLM 0.17.0, que requiere GPU con suficiente memoria para el modelo y la caché KV; para despliegue en producción se necesitaría una GPU de datacenter o una consumer de gama alta, pero no hay cifras publicadas.
- ¿Cabe en GPU consumer? Por tamaño (2,24B) es plausible en GPU consumer con 8 GB o más de VRAM en bfloat16, y en 4-6 GB con cuantización, pero la información disponible no confirma configuraciones probadas.
- Opciones de despliegue: el autor documenta carga con `transformers` + `peft` (PeftModel sobre el base) y evaluación con vLLM 0.17.0. No se documentan integraciones con llama.cpp, Ollama ni TGI, y al ser un adaptador PEFT requiere fusionarlo con el base o cargarlo junto a él.
- Latencia y throughput: no disponibles. La reducción de longitud de salida (de 13.398 a 1.455 caracteres de media) implica menos tokens generados por consulta, lo que en la práctica reduce el tiempo de generación, pero no se publican medidas de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Onyx-2B | 2,24B (adaptador de 21,8M) | 4.096 en entrenamiento | LoRA de razonamiento conciso sobre Qwen3.5-2B | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Qwen3.5-2B (base) | 2,24B | no disponible | Modelo multimodal causal de referencia | no disponible en la información | Hugging Face |
| Alternativas de ~2B de otras familias | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación con datos es frente a su propio modelo base: mismo tamaño, misma arquitectura y misma licencia, con la diferencia medida de 9/16 frente a 16/16 en el conjunto de 16 tareas y una reducción de longitud de salida de aproximadamente 8,2 veces. No se dispone de datos de benchmarks ni de especificaciones de modelos comparables de otras familias en la información proporcionada, por lo que la comparativa con alternativas externas queda como no disponible.

## Limitaciones y advertencias

- La evaluación se basa en 16 tareas: el salto de 9 a 16 aciertos implica un intervalo de confianza amplio; debe interpretarse la dirección del efecto, no el porcentaje exacto.
- El truncamiento del modelo base confunde la comparación: la mayoría de sus fallos son por agotar el presupuesto de tokens, no por respuestas incorrectas, de modo que no es posible una comparación limpia solo de precisión.
- No hay benchmarks generales: no se ejecutaron MMLU, GSM8K, HumanEval ni evaluación multilingüe, así que nada respalda una afirmación de capacidad general.
- Hereda todas las limitaciones de un base de 2,24B: conocimiento del mundo limitado, recuperación factual poco fiable, comportamiento débil en contextos largos y riesgo de alucinación.
- Los datos de entrenamiento son propietarios y no se divulgan, lo que impide auditar sesgos, contaminación de benchmarks o composición del dataset.
- Idiomas limitados a inglés y chino según los metadatos; no se documenta soporte de castellano.
- El adaptador modifica solo las capas de lenguaje: las capacidades de visión son las del base y no han sido evaluadas en el adaptador.
- Licencia Apache 2.0 permite uso comercial, pero el autor recomienda revisar las salidas antes de usarlas en contextos con consecuencias.
- Para desplegarlo hay que cargar el modelo base por separado y gestionar el adaptador (carga conjunta o fusión), lo que añade complejidad operativa frente a un checkpoint completo.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AjelixAI/Onyx-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio PEFT: https://github.com/huggingface/peft
- Repositorio TRL (SFTTrainer): https://github.com/huggingface/trl
- Unsloth: https://github.com/unslothai/unsloth
- vLLM: https://github.com/vllm-project/vllm
