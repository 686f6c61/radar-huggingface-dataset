# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-9-step-210000

## Resumen

Este repositorio contiene un checkpoint intermedio (época 9, paso 210000) de un modelo *draft* entrenado con el algoritmo EAGLE3 mediante SpecForge, pensado exclusivamente para decodificación especulativa. El modelo objetivo es `Qwen/Qwen3-4B-Instruct-2507`, un LLM instructivo de 4 000 millones de parámetros de la familia Qwen3. El *draft* es un modelo ligero de 202,7 millones de parámetros que predice tokens candidatos para acelerar la generación del modelo grande sin degradar la calidad de las respuestas.

La relevancia de este modelo radica en que permite reducir la latencia de inferencia en entornos de producción donde se sirve Qwen3-4B-Instruct-2507, especialmente en aplicaciones interactivas como chatbots o asistentes en tiempo real. Al ser un modelo *draft*, no es autónomo: debe emparejarse con el modelo base y ejecutarse a través de un motor compatible, como SGLang con *flashinfer*. El entrenamiento se realizó sobre datos ShareGPT limpios, con una longitud máxima de secuencia de 2048 tokens y configuración estándar de EAGLE3 (TTT length 7, sin ventana deslizante). No se registraron métricas de evaluación ni de seguridad en esta ejecución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder, hidden size 2560, intermediate 9728, 32 cabezas de atención, 8 cabezas KV) |
| Parametros totales | 202 700 416 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 (máximo de entrenamiento; sin ventana deslizante) |
| Tipos de cuantizacion | bfloat16 (pesos en safetensors) |
| Idiomas soportados | No especificado (hereda del modelo base, presumiblemente multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo usa la arquitectura `LlamaForCausalLMEagle3`, diseñada específicamente para EAGLE3 (Extrapolation Algorithm for Greater Language-model Efficiency). Consiste en una única capa decoder con hidden size 2560, intermediate size 9728, 32 cabezas de atención y 8 cabezas key/value. El vocabulario del *draft* es de 32 000 tokens, mientras que el vocabulario objetivo del modelo base es de 151 936, lo que permite una proyección eficiente de candidatos.

El entrenamiento se realizó con el método *online EAGLE3* implementado en SpecForge, sobre datos ShareGPT limpios (fuente local, sin registro de revisión). Se ejecutaron 10 épocas completando 231 810 pasos de optimización, con un tamaño de lote global efectivo de 4 (batch size per device 1, data-parallel size 4). Se usó una tasa de aprendizaje de 1e-4 con warmup lineal del 1,5 % y posterior annealing coseno, sin weight decay y con gradiente máximo de 0,5. La longitud máxima de secuencia fue 2048 tokens y el TTT length (número de pasos de extrapolación) fue 7. La atención del *draft* usa `sdpa` y el backend objetivo es SGLang con *flashinfer*. No se aplicó ventana deslizante en esta ejecución estándar.

## Capacidades

- Es un modelo *draft* para decodificación especulativa, no un modelo de chat independiente.
- Acelera la generación del modelo objetivo `Qwen/Qwen3-4B-Instruct-2507` mediante predicción de tokens candidatos.
- Integración nativa con SGLang mediante el algoritmo EAGLE3 (parámetros `--speculative-algorithm EAGLE3`).
- Soporta configuración de número de pasos especulativos y top-k (por ejemplo, `--speculative-num-steps 3`, `--speculative-eagle-topk 1`).
- No realiza razonamiento, generación de código, matemáticas ni otras tareas por sí mismo; su única función es acelerar la inferencia del modelo base.

## Casos de uso

- **Reducción de latencia en chatbots conversacionales**: al desplegar Qwen3-4B-Instruct-2507 con este *draft*, se pueden servir respuestas más rápidas en aplicaciones de atención al cliente o asistentes virtuales, manteniendo la calidad del modelo grande.
- **Optimización de costes en inferencia en la nube**: al acelerar la generación, se reduce el tiempo de ocupación de GPU por petición, lo que permite atender más solicitudes con los mismos recursos.
- **Despliegue en entornos con requisitos de tiempo real**: sistemas de transcripción, traducción instantánea o generación de respuestas en vivo se benefician de la menor latencia sin sacrificar precisión.
- **Integración en pipelines de generación de código asistida**: si el modelo base se usa para autocompletar código en un IDE, el *draft* acelera las sugerencias, mejorando la experiencia del desarrollador.
- **Pruebas de concepto y benchmarks de rendimiento**: los checkpoints intermedios (como este) permiten evaluar el impacto de la decodificación especulativa en distintas cargas de trabajo y ajustar los parámetros de EAGLE3 (número de pasos, top-k) para optimizar el throughput.
- **Aplicaciones multiusuario con alta concurrencia**: en servicios que atienden muchas peticiones simultáneas (por ejemplo, API de generación de texto), la aceleración especulativa ayuda a mantener la latencia media baja y a aumentar el número de requests por segundo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se registraron métricas de evaluación ni de seguridad para esta ejecución. Tampoco se proporcionan comparativas de velocidad o throughput con otros métodos de decodificación especulativa.

## Requisitos de hardware

- **VRAM para el *draft***: los pesos ocupan aproximadamente 0,4 GB (202,7 M parámetros en bfloat16), pero se debe sumar la VRAM del modelo base Qwen3-4B-Instruct-2507 (unos 8 GB en bf16). En total, para inferencia conjunta se recomienda al menos 10-12 GB de VRAM.
- **GPU recomendadas**: cualquier GPU con 12 GB o más (por ejemplo, RTX 3060/4070, A10, L4) puede ejecutar el modelo base junto con el *draft*. Para despliegues de alto rendimiento se recomiendan A100, H100 o L40S.
- **En consumer GPU**: sí, cabe en GPUs de consumo con 12 GB o más, siempre que el modelo base se cuantice adecuadamente (por ejemplo, AWQ o GPTQ) si se quiere reducir VRAM.
- **Opciones de despliegue**: el modelo está pensado para usarse con SGLang (backend `flashinfer`). También podría integrarse en otros motores que soporten EAGLE3, aunque no se documenta en la model card. No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- **Latencia y throughput**: no disponibles. Dependen del hardware, del tamaño del modelo base y de la configuración de EAGLE3 (número de pasos, top-k). Se recomienda hacer benchmarking con la carga de trabajo concreta.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos *draft* de la misma categoría (por ejemplo, variantes de Medusa, EAGLE-2 o MADS). Este checkpoint es específico para Qwen3-4B-Instruct-2507 y no se han publicado métricas de aceleración relativas. Se puede afirmar que, por su tamaño (202 M parámetros) y arquitectura de una sola capa, es comparable a otros *drafts* de EAGLE3 en eficiencia, pero sin datos cuantitativos no es posible establecer una comparativa rigurosa.

| Modelo | Parámetros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| Este *draft* (EAGLE3) | 202,7 M | 2048 (entrenamiento) | Apache-2.0 | Aceleración de Qwen3-4B-Instruct-2507 |
| Qwen3-4B-Instruct-2507 (base) | 4 000 M | 32 768 (según documentación oficial) | Apache-2.0 | Modelo de chat/generación |
| Otros *drafts* de la misma serie (por ejemplo, epoch-1-step-25000) | 202,7 M | 2048 | Apache-2.0 | Aceleración del mismo modelo base |

Nota: el contexto del modelo base se indica según la documentación pública de Qwen3 (no se detalla en la model card del *draft*).

## Limitaciones y advertencias

- **No es un modelo autónomo**: debe usarse siempre junto con el modelo base `Qwen/Qwen3-4B-Instruct-2507`. No puede generar respuestas por sí mismo.
- **Sin métricas de calidad**: no se han evaluado la precisión, la alucinación ni la seguridad del *draft*. Su rendimiento en tareas reales depende del modelo base y de la configuración de decodificación.
- **Entrenamiento limitado a ShareGPT**: los datos de entrenamiento provienen de una única fuente (ShareGPT), lo que puede introducir sesgos en la distribución de tokens y afectar a la eficiencia en dominios fuera de ese conjunto.
- **Longitud de secuencia limitada**: el entrenamiento se realizó con un máximo de 2048 tokens, aunque el modelo no usa ventana deslizante. Para secuencias más largas, el *draft* podría no predecir eficazmente y degradar la aceleración.
- **Dependencia de SGLang**: la integración documentada es exclusiva con SGLang. Otros motores no están soportados oficialmente.
- **Restricciones de licencia**: aunque la licencia es Apache-2.0, el uso comercial está permitido, pero se recomienda verificar la licencia del modelo base y de los datos de entrenamiento (ShareGPT) para cumplir con sus términos.
- **Riesgo de desincronización**: si el modelo base se actualiza o cambia, el *draft* puede quedar obsoleto y requerir reentrenamiento.

## Enlaces

- Repositorio del checkpoint: [huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-9-step-210000](https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-9-step-210000)
- Modelo base: [Qwen/Qwen3-4B-Instruct-2507](https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507)
- Serie de checkpoints (colección): [huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-1-step-25000](https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-1-step-25000) y [epoch-3-step-75000](https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-3-step-75000)
- Documentación de Qwen3: [GitHub QwenLM/Qwen3](https://github.com/QwenLM/Qwen3)
- Referencia de Qualcomm AI Hub para Qwen3-4B-Instruct-2507: [aihub.qualcomm.com/models/qwen3_4b_instruct_2507](https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507)
