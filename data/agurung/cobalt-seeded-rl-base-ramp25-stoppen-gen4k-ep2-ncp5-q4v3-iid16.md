# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-q4v3-iid16

## Resumen

El modelo `agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-q4v3-iid16` es un checkpoint de aprendizaje por refuerzo (RL) construido sobre `Qwen/Qwen3-4B-Instruct-2507`, con 4.411.424.256 parámetros y pesos en formato safetensors. Lo publica el usuario agurung como artefacto de investigación asociado a una ejecución de RL con OpenRLHF y el algoritmo GRPO, guardada en el step global 8. No es un modelo de propósito general afinado para producto, sino un punto intermedio de un experimento cuyo objetivo declarado es mejorar la corrección binaria de código generado sobre un subconjunto de problemas especialmente difíciles.

El problema que aborda es concreto: existe un "frontera" de dificultad denominada `cobalt-train ≤2/64`, compuesta por 1833 problemas de entrenamiento y 112 de validación que el modelo base resolvía como máximo en 2 de cada 64 muestras con temperatura 1,0. Sobre ese subconjunto se aplica GRPO con recompensa binaria (1,0 si el programa generado pasa los tests del problema, 0,0 en caso contrario), con penalizaciones específicas para truncamiento y respuestas excesivamente largas. El checkpoint se declara como el mejor por `pass@8` de la ejecución hasta la fecha, aunque no se publica el valor numérico de esa métrica.

Es relevante ahora porque documenta una receta reproducible de RL directo sobre un modelo base sin semilla de SFT supervisado, con trucos anti-truncamiento tipo ProRL y penalización DAPO de longitud. Para desarrolladores e investigadores resulta útil como referencia metodológica y como punto de partida para ablaciones, más que como modelo listo para producción: tiene 0 descargas y 0 likes, no declara licencia ni idiomas, y su model card advierte de que las métricas de evaluación de este checkpoint no están disponibles en el registro de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B-Instruct-2507); detalles internos no especificados en la model card |
| Parametros totales | 4.411.424.256 (dato real de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens según la documentación pública del modelo base Qwen3-4B-Instruct-2507; no declarada en la model card de este checkpoint |
| Tipos de cuantizacion | No se publican variantes cuantizadas (ni GGUF, AWQ, GPTQ ni bitsandbytes); el repositorio contiene safetensors sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (repo de 17,7 GB; ~4 bytes por parámetro, coherente con pesos en FP32, aunque la precisión no se declara) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Instruct-2507, un transformer decoder-only de aproximadamente 4.400 millones de parámetros. Este checkpoint no modifica la topología: es el resultado de aplicar RL sobre esos pesos. La model card indica que el modelo se sembró desde el Qwen3-4B base "sin semilla de SFT" (RL aplicado directamente al modelo base), lo que entra en tensión con el tag `base_model: Qwen/Qwen3-4B-Instruct-2507` del repositorio; esta discrepancia no se resuelve en la información disponible.

El entrenamiento usa OpenRLHF con GRPO, con ventajas normalizadas por grupo y sin penalización KL. La receta incluye varios elementos destacables: una penalización "stop-properly" estilo ProRL que asigna recompensa -1,0 a las muestras truncadas, y una penalización DAPO de sobrelongitud que aplica un castigo aditivo creciente hasta -0,25 a las respuestas situadas en los últimos 1024 tokens antes del límite. Se muestrean 8 respuestas por prompt, con batch de rollout y de entrenamiento de 128, un máximo de 4096 tokens nuevos por rollout, 2 episodios y un learning rate de actor de 1e-06 con schedule constante. El checkpoint corresponde al step global 8, declarado como el mejor por `pass@8` de la ejecución hasta ese momento. La señal de recompensa es puramente binaria y basada en ejecución: el programa pasa o no pasa los tests.

## Capacidades

- Generación de código: es la capacidad sobre la que se optimiza explícitamente, mediante recompensa binaria de corrección verificada por tests.
- Razonamiento sobre problemas de programación difíciles: el conjunto de entrenamiento se restringe a la frontera donde el modelo base acierta como máximo 2 de 64 veces, lo que sugiere mejora en casos de baja probabilidad de acierto.
- Muestreo múltiple (`pass@8`): la receta está diseñada para escenarios de muestreo repetido con temperatura 1,0, no solo para decodificación greedy.
- Generación de texto general y conversación: heredadas del modelo base Qwen3-4B-Instruct-2507, aunque no se verifican ni se declaran en este checkpoint.
- Tool calling / function calling: no confirmado en la información proporcionada; el modelo base lo soporta, pero este checkpoint no lo declara.
- Capacidades de agente y razonamiento multi-paso: no declaradas.
- Capacidades multilingües: no declaradas; los idiomas figuran como no disponibles.
- Modo de pensamiento (thinking), visión o audio: no disponibles; no se mencionan en la model card.

## Casos de uso

- Generación de código asistida en IDE con verificación automática: el modelo se puede integrar en un bucle donde se generan N candidatos y se filtran ejecutando los tests del proyecto, aprovechando que la señal de RL fue precisamente la corrección binaria.
- Reparación automática de parches fallidos: en un pipeline de CI/CD, usar el modelo para proponer correcciones a tests que fallan, validando cada propuesta con la suite existente antes de aceptarla.
- Investigación en RL para código: reproducción de la receta GRPO con penalización anti-truncamiento y DAPO, comparando contra el checkpoint base para medir el efecto de cada componente sobre `pass@8`.
- Generación de datos sintéticos de programación: producir soluciones candidatas para problemas difíciles y conservar únicamente las que pasan tests, generando pares problema-solución verificados.
- Punto de partida para RL posterior: al ser un checkpoint intermedio del step 8, sirve como inicialización para continuar el entrenamiento o para experimentar con otras funciones de recompensa.
- Evaluación de robustez de evaluadores de código: usar el modelo como generador adversario de soluciones casi correctas para probar la cobertura de una suite de tests.
- Sustituto ligero del modelo base en tareas de generación de texto: dado su tamaño de 4.400 millones de parámetros, cabe en GPUs de consumo, aunque su calidad fuera del dominio de código no está evaluada y podría haberse degradado por el RL especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las métricas de evaluación de este checkpoint no están disponibles en el registro de entrenamiento y solo menciona que es el mejor por `pass@8` de la ejecución, sin aportar el valor numérico. No se dispone de datos de MMLU, HumanEval, GSM8K ni de ninguna otra suite.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32 (formato aparente del repositorio, ~17,7 GB de pesos): ~18-20 GB de VRAM solo para pesos, más el KV cache.
- VRAM estimada en BF16 (requiere convertir o recargar en media precisión): ~8,8 GB de pesos.
- VRAM estimada en INT8: ~4,4 GB de pesos.
- VRAM estimada en INT4: ~2,5-3 GB de pesos.
- KV cache: crece de forma lineal con la longitud de contexto; con la ventana nativa del modelo base (hasta 262.144 tokens) puede superar con holgura el tamaño de los propios pesos, por lo que conviene limitar el contexto efectivo según el caso de uso.
- Cabe en GPU de consumo: sí, en BF16 con 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti Super, RTX 4080, RTX 4090) y en 8 GB solo con cuantización (no publicada, habría que generarla).
- GPU recomendadas para servicio: RTX 4090 o L40S para despliegue en BF16 de una sola instancia; A100 40/80 GB y H100 para lotes grandes, contextos largos o entrenamiento posterior.
- Opciones de despliegue: transformers y vLLM están confirmados (la model card incluye el comando `vllm serve`). TGI es plausible por el tag `text-generation-inference`, pero no se documenta una configuración probada. No hay GGUF publicado, por lo que llama.cpp y Ollama requieren conversión previa.
- Latencia y throughput: no disponible; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| cobalt-seeded-rl-...-iid16 (este) | 4.411.424.256 | No declarada (heredada del base) | No disponible | HF, safetensors, 0 descargas | Checkpoint RL de código en step 8 |
| Qwen/Qwen3-4B-Instruct-2507 | ~4.400 millones | 262.144 tokens (documentación pública) | Apache-2.0 (documentación pública) | HF, ampliamente distribuido | Modelo base declarado; soporte de tool calling e instrucciones |
| Qwen/Qwen3-4B | ~4.400 millones | 32.768 tokens nativos, ampliable (documentación pública) | Apache-2.0 (documentación pública) | HF | Variante base sin instrucciones |
| Qwen2.5-Coder-7B-Instruct | ~7.600 millones | 32.768 tokens (documentación pública) | Apache-2.0 (documentación pública) | HF | Alternativa especializada en código, el doble de tamaño |

Los datos de contexto y licencia de los modelos comparados provienen de su documentación pública y no se han verificado contra los repositorios en el momento de redactar esta ficha. No hay resultados de benchmarks comparativos disponibles para este checkpoint.

## Limitaciones y advertencias

- No se declara licencia: no está claro si se permite uso comercial. Al derivar de Qwen3, es razonable esperar la licencia del modelo base, pero esto no está confirmado en el repositorio y debe verificarse antes de cualquier uso en producción.
- No se declaran idiomas soportados; el comportamiento multilingüe es desconocido.
- Riesgo de alucinación elevado en código: el modelo está optimizado para pasar tests, lo que no garantiza corrección semántica, seguridad ni eficiencia de las soluciones generadas.
- Degradación potencial de capacidades generales: al aplicar RL directo sobre tareas de código sin penalización KL, es plausible un desplazamiento de la distribución que afecte a la conversación general, el multilingüismo o el seguimiento de instrucciones. No se aportan evaluaciones que lo confirmen o descarten.
- Es un checkpoint intermedio del step global 8, no un modelo final. La propia model card lo presenta como "el mejor hasta ahora" dentro de una ejecución en curso.
- Ambigüedad sobre el punto de partida: la model card afirma haber sembrado desde el Qwen3-4B base sin SFT, mientras que el tag del repositorio apunta a Qwen3-4B-Instruct-2507. Esto dificulta reproducir exactamente el experimento.
- Repositorio de 17,7 GB para 4.400 millones de parámetros: si los pesos están en FP32, el despliegue requiere el doble de VRAM que una carga en BF16; conviene convertir antes de servir.
- Ausencia de métricas publicadas: no hay benchmarks, ni valores de `pass@8`, ni evaluaciones de validación accesibles, por lo que no se puede verificar la mejora declarada.
- Sin adopción ni validación comunitaria: 0 descargas y 0 likes implican que no hay informes independientes de comportamiento en producción.
- Riesgos de seguridad en ejecución de código: cualquier uso que ejecute el código generado por el modelo debe hacerlo en un entorno aislado, ya que la recompensa de entrenamiento solo cubre el paso de tests, no la ausencia de comportamiento malicioso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-q4v3-iid16
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Weights & Biases: proyecto `eaiexp-paper-final`, ejecución `seeded_rl_base_ramp25_stoppen_gen4k-ep2_ncp5_q4v3_iid16` (no se proporciona URL directa)
- Registro de entrenamiento local citado en la model card: `experiments/cobalt_qwen3_4b_ft/rl_runs/qwen3_4b_instruct_2507_cobalt_v1/seeded_rl_base_ramp25_stoppen_gen4k-ep2-ncp5-q4v3-iid16/openrlhf_train.log` (ruta local, no accesible públicamente)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la búsqueda web; los resultados devueltos no guardan relación con el modelo.
