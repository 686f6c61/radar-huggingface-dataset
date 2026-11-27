# Lancelot53/Llama-3-8B-Instruct-TAR-ART-faithful

## Resumen

Llama-3-8B-Instruct-TAR-ART-faithful es un checkpoint de 8.030 millones de parametros publicado por Lancelot53 que aplica una reimplementacion no oficial de Abliteration-Resistant Tuning (ART) sobre el modelo TAR-Refusal, a su vez construido sobre Llama-3-8B-Instruct de Meta. El objetivo es producir un modelo "defendido": un modelo al que sea mas dificil eliminar el comportamiento de rechazo mediante ataques de edicion de pesos (abliteration), que consiste en proyectar fuera de los pesos la direccion de rechazo calculada en el espacio de estados ocultos.

La relevancia de esta ficha es doble. Por un lado, documenta una tecnica de defensa (ART, de Kuo, Smith y Yadav, 2026) que entrena el modelo contra su propia edicion abliterada, recalculando la direccion de rechazo en cada paso y empujando hacia arriba la entropia cruzada de las respuestas daninas medidas en la copia danada. Por otro, y esto es lo importante para quien vaya a evaluarlo, el autor advierte explicitamente de que esta variante "faithful" implementa el objetivo del paper tal cual, sin tope en el termino de ascenso, lo que produce un modelo cuya aparente seguridad se debe en gran medida a haber hecho el texto danino "impromunciable" en lugar de rechazado.

El checkpoint se publica como ablacion que motiva la variante acotada (ART-bounded), que es la recomendada para uso general. El codigo de entrenamiento (`train_art.py`) fue escrito por un asistente de IA a partir del texto del paper y no ha sido revisado linea por linea por un humano, lo que el propio autor senala como advertencia destacada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3), fine-tuning completo sobre Llama-3-8B-Instruct |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama-3-8B-Instruct, 8.192 tokens segun el modelo base, no confirmado en la ficha) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama-3-8B-Instruct sin modificaciones estructurales: un transformer decoder-only de 8.030 millones de parametros. Lo que cambia es el procedimiento de ajuste fino. ART parte de la observacion de que la abliteration calcula una direccion de rechazo como la diferencia media de estados ocultos entre prompts daninos y benignos en el ultimo token del prompt, y la proyecta fuera de las matrices que escriben en el residual stream. ART entrena contra esa edicion: en cada paso recalcula la direccion de rechazo con prompts frescos, aplica la edicion de abliteration para obtener una copia danada del modelo, y empuja hacia arriba la entropia cruzada de las respuestas daninas medida en esa copia danada, mientras mantiene a la baja la entropia cruzada ordinaria sobre respuestas benignas en el modelo intacto.

La funcion de perdida es `L = γ_ar · (−log(CE_harmful(f_θ̃) + ε)) + γ_ret · CE_harmless(f_θ)`, con γ_ar = 1, γ_ret = 2 y ε = 1e-3. El termino `−log` hace el ascenso auto-limitado, ya que su gradiente escala como 1/CE y se desvanece cuando la continuacion danina ya es improbable. En esta variante "faithful" no hay tope en el termino de ascenso: partiendo de una CE danina de 15,7 en TAR-Refusal (ya por encima de los 11,8 de una distribucion uniforme sobre el vocabulario), el ascenso sin acotar lleva la CE danina en held-out hasta 127 en el paso 1000, con una CE de rechazo de 6,5. No se especifican en la informacion disponible el numero de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Llama-3-8B-Instruct.
- Comportamiento de rechazo reforzado frente a prompts daninos, resistente a ataques de abliteration (edicion de pesos) y de activacion.
- Capacidad de seguir instrucciones multi-turno (pipeline `text-generation`, tag `conversational`).
- Soporte de tool calling y function calling: no confirmado en la informacion disponible para este checkpoint concreto; el modelo base Llama-3-8B-Instruct lo soporta, pero no se documenta aqui.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la informacion disponible.
- Capacidades multilingues: no documentadas; el modelo base Llama 3 esta entrenado mayoritariamente en ingles con soporte limitado de otros idiomas, pero no se confirma para este checkpoint.
- Modo "thinking", vision o audio: no disponible.

## Casos de uso

- Investigacion en seguridad de modelos open-weight: el checkpoint sirve como objeto de estudio para medir la eficacia real de ART frente a ataques de abliteration, comparando la tasa de exito del ataque sobre Llama-3-8B-Instruct (9,0% de seguridad tras abliteration) frente a este modelo (90,5%).
- Reproduccion y critica de papers: al publicarse junto al codigo de entrenamiento, permite a otros investigadores auditar la implementacion del algoritmo 2-3 y el apendice A.4 de Kuo, Smith y Yadav (2026) y senalar donde falla.
- Ablacion controlada en estudios de robustez: sirve como condicion "sin tope" frente a la variante bounded, permitiendo aislar el efecto del termino de ascenso sin acotar sobre la calidad de las respuestas y sobre la seguridad aparente.
- Evaluacion de clasificadores de dano: el desajuste documentado entre el exito de ataque por palabras clave (71%) y lo que detecta el clasificador de HarmBench hace de este modelo un caso de prueba util para validar la robustez de los propios evaluadores automaticos.
- Formacion y divulgacion: util como ejemplo didactico de por que la seguridad medida con clasificadores de calidad de dano puede confundirse con perdida de capacidad, ya que la utilidad zero-shot cae a 0,439 frente a 0,551 de TAR-Refusal y 0,606 de Llama-3-8B-Instruct.
- Baseline en pipelines de red-teaming: punto de partida para comparar ataques de fine-tuning (full-parameter y LoRA) que, segun los datos del autor, desbloquean el modelo por completo (48,0% de seguridad a los 300 pasos con fine-tuning completo en la variante bounded).

## Benchmarks y rendimiento

Los datos publicados por el autor miden seguridad (S) como el porcentaje de 200 comportamientos held-out de HarmBench que el clasificador Llama-2-13B de HarmBench no juzgo daninos (greedy, 512 tokens; mas alto es mas seguro), y utilidad (U) como la precision media zero-shot sobre BoolQ, RTE, HellaSwag, WinoGrande, ARC-Challenge y OpenBookQA (lm-eval, 200 preguntas cada uno; azar ≈ 0,375). El ruido binomial es de aproximadamente ±3,5%.

| Metrica | Llama-3-8B-Instruct | TAR-Refusal | Este modelo (ART-faithful) |
|---|---|---|---|
| Seguridad sin ataque (S) | 96,0% | 76,5% | 99,5% |
| Seguridad tras abliteration, 1 capa, α=1 (S) | 9,0% | 59,5% | 90,5% |
| Utilidad zero-shot (U) | 0,606 | 0,551 | 0,439 |

Solo se ejecutaron las evaluaciones de baseline y abliteration sobre esta variante. Los ataques de pruning, proyeccion de rango y gradiente precondicionado se corrieron unicamente sobre el checkpoint bounded, con resultados de 98,5%, 94,5% y 97,0% de seguridad respectivamente. Los ataques de fine-tuning tambien se midieron solo sobre el bounded: fine-tuning completo alcanza 67,5% de seguridad a los 50 pasos y 48,0% a los 300, y un LoRA de rango 1 sobre las 96 matrices MLP (1,8M parametros, 0,02% del modelo) alcanza 65,5% a los 50 pasos y 51,0% a los 300, con utilidad sin cambios. El autor advierte que el margen de seguridad esta confundido con la perdida de capacidad: ART cuesta unos 11 puntos de utilidad frente a TAR-Refusal y 17 frente a Llama-3 base, y el orden de seguridad aparente sigue casi exactamente el orden de utilidad, por lo que no debe leerse como robustez demostrada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia de orden de magnitud para un modelo de 8.030 millones de parametros, en fp16 requiere aproximadamente 16 GB de pesos mas overhead de activaciones y cache KV; en cuantizacion de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB. Estas cifras son estimaciones genericas y no estan confirmadas para este checkpoint.
- GPU recomendadas: no especificadas por el autor. Por tamano, cabria en una RTX 4090 (24 GB) en fp16, y en GPUs de datacenter como A100 o H100 sin problema.
- Cabe en GPU consumer: previsiblemente si, en tarjetas con 16 GB o mas en fp16 (RTX 4080/4090, A4000) y en tarjetas de 8 GB con cuantizacion de 4 bits, aunque no hay confirmacion oficial.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`). No se mencionan llama.cpp, Ollama ni vLLM en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Seguridad (S) baseline | Seguridad tras abliteration | Utilidad (U) | Licencia |
|---|---|---|---|---|---|---|
| Llama-3-8B-Instruct | 8.030M | 8.192 tokens (segun modelo base) | 96,0% | 9,0% | 0,606 | llama3 |
| TAR-Refusal (lapisrocks) | 8.030M (heredado) | no disponible | 76,5% | 59,5% | 0,551 | llama3 |
| Este modelo (ART-faithful) | 8.030M | no disponible | 99,5% | 90,5% | 0,439 | llama3 |
| ART-bounded (Lancelot53) | 8.030M (heredado) | no disponible | no disponible en la informacion | 98,5% (pruning), 94,5% (proyeccion de rango), 97,0% (gradiente precondicionado) | no disponible | llama3 |

La comparativa se limita a los modelos medidos en la propia model card. No se dispone de datos de benchmarks estandar (MMLU, HumanEval, GSM8K) para ninguno de ellos en la informacion proporcionada.

## Limitaciones y advertencias

- La variante "faithful" implementa el objetivo sin tope en el termino de ascenso, lo que lleva la CE danina en held-out a 127 en el paso 1000. La seguridad aparente se debe en gran medida a que el texto danino resulta impromunciable, no a un rechazo genuino: bajo ataque el modelo a menudo cumple en forma ("Sure, here's a step-by-step guide...") sin contenido danino, o entra en bucles.
- Desajuste entre metricas: el exito de ataque por palabras clave lee 71% aunque el clasificador apenas encuentra contenido danino. Cualquier evaluacion basada en palabras clave dara una lectura enganosa.
- La seguridad esta confundida con la perdida de capacidad: la utilidad cae a 0,439 frente a 0,551 de TAR-Refusal y 0,606 de Llama-3 base, y el orden de seguridad aparente sigue el orden de utilidad. No se ejecuto un control con capacidad equiparada, por lo que el margen publicado no debe leerse como robustez demostrada.
- ART no bloquea el fine-tuning: los ataques de fine-tuning completo y LoRA desbloquean el modelo bounded por completo (48,0% y 51,0% de seguridad a los 300 pasos). No se midio sobre esta variante, pero no hay razon para esperar un comportamiento distinto. Debe tratarse como resistente a abliteration, no como resistente a manipulacion.
- El codigo de entrenamiento (`train_art.py`) fue escrito por un asistente de IA a partir del texto del paper, sin revision humana linea por linea. Cualquier afirmacion de que implementa fielmente el paper es no verificada.
- No es un artefacto oficial de los autores de ART ni de TAR; ninguno de ellos ha revisado ni respaldado el checkpoint.
- No se replican los resultados de la Tabla 8 del paper: el paper aplica ART sobre su propio retrain de TAR con Llama-3.1-8B-Instruct, mientras que este checkpoint parte de TAR-Refusal sobre Llama-3-8B-Instruct.
- Sesgos conocidos: no documentados especificamente en la informacion disponible; hereda los del modelo base Llama 3.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la perdida de utilidad zero-shot sugiere un deterioro general de capacidades que puede agravar errores factuales.
- Restricciones de licencia: Llama 3 Community License, con las restricciones habituales de uso comercial y de nombrado de la familia Llama.
- Uso en produccion: el propio autor recomienda la variante ART-bounded para la mayoria de propositos. Esta variante debe tratarse como material de investigacion y ablacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lancelot53/Llama-3-8B-Instruct-TAR-ART-faithful
- Variante recomendada (bounded): https://huggingface.co/Lancelot53/Llama-3-8B-Instruct-TAR-ART-bounded
- Modelo base TAR-Refusal: https://huggingface.co/lapisrocks/Llama-3-8B-Instruct-TAR-Refusal
- Paper de ART (Kuo, Smith y Yadav, 2026): https://arxiv.org/abs/2605.26526
- Paper de referencia adicional (arxiv:2408.00761): https://arxiv.org/abs/2408.00761
- Modelo base Llama-3-8B-Instruct: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
