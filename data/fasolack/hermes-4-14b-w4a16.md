# fasolack/Hermes-4-14B-W4A16

## Resumen

El modelo `fasolack/Hermes-4-14B-W4A16` es una cuantización de pesos int4 del transformer denso `NousResearch/Hermes-4-14B`, que a su vez se construye sobre `Qwen/Qwen3-14B`. Lo publica el usuario fasolack y está pensado para un rol muy concreto: actuar como orquestador local pequeño que recibe un plan redactado por un modelo mayor y lo ejecuta (lanzar comandos de shell, reiniciar servicios, depurar un fallo puntual, documentar lo ocurrido y devolver un informe). No es un modelo de chat general ni un generador de código, y su propia model card lo deja explícito.

La pieza técnica central es la cuantización W4A16 (pesos int4, activaciones BF16) generada con AutoRound, con grupo de 128 y simetría, en formato compressed-tensors que consume vLLM. La calibración se hizo con 511 muestras de 2048 tokens y una mezcla sesgada deliberadamente hacia tool calling (45% tool calling, 35% general, 20% código), coherente con el rol de orquestación. El contexto nativo es de 40 960 tokens, sin extensión YaRN.

Su relevancia es acotada pero clara: un modelo de 14B con soporte fiable de function calling y modo de razonamiento explícito (`<think>...</think>`) que cabe en una sola GPU junto a otros servicios residentes, con licencia Apache 2.0 y un parser de herramientas estándar en vLLM. El repositorio no tiene descargas ni likes registrados en la información disponible, y la degradación frente al modelo base en BF16 no se ha publicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso `Qwen3ForCausalLM`, 40 capas, atención completa en todas las capas; sin MoE, sin torre de visión y sin atención híbrida |
| Parámetros totales | 3.310.976.560 elementos en los tensores safetensors del repositorio (recuento de los pesos empaquetados en int4); el transformer subyacente pertenece a la familia Qwen3-14B (~14 000 millones nominales) |
| Parámetros activos | No aplica (modelo denso, sin expertos) |
| Longitud de contexto | 40 960 tokens (`max_position_embeddings` en `config.json`, `rope_scaling: null`, sin extensión YaRN) |
| Tipos de cuantización | W4A16: pesos int4, activaciones BF16, grupo de 128, simétrico, generado con AutoRound; `lm_head` (embedding de salida no atado) se mantiene en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con esquema compressed-tensors (pesos int4 empaquetados y mezclados con capas BF16) |
| Modelo base | NousResearch/Hermes-4-14B |
| Fecha de creación del repositorio | 21 de septiembre de 2026 (metadato de HuggingFace) |
| Tamaño del repositorio | 9,9 GB |
| Descargas / likes | 0 / 0 |
| Pipeline declarado | text-generation |

## Arquitectura y entrenamiento

La arquitectura se verificó contra el `config.json` real antes de cuantizar, no se asumió: `Qwen3ForCausalLM` con 40 capas, sin expertos MoE, sin torre de visión y sin atención híbrida. La clave `layer_types` está presente, pero todas sus entradas son `full_attention`; las versiones recientes de `transformers` emiten esa clave incluso en modelos densos, de modo que su presencia no es señal de arquitectura híbrida. El techo nativo de contexto es 40 960 tokens y no se ha ampliado con YaRN.

La cuantización es AutoRound W4A16: pesos int4 con activaciones BF16, grupo de 128 y simetría. La lista de capas mantenidas en BF16 se limita al `lm_head`, que está desatado del embedding de entrada, como seguro barato para la calidad de los logits. El conjunto de calibración tiene 511 muestras de 2048 tokens cada una, con esta composición: 45% tool calling (`NousResearch/hermes-function-calling-v1`), 35% general (`NeelNanda/pile-10k`) y 20% código (`ise-uiuc/Magicoder-OSS-Instruct-75K`). La porción de código es minoritaria a propósito y la general es más alta de lo habitual en esta familia de builds, porque seguir un plan y redactar un informe depende más del seguimiento amplio de instrucciones que del código.

El modelo base es de razonamiento híbrido: puede emitir un bloque `<think>...</think>` antes de la respuesta. Esta build se calibra y se evalúa con el modo de razonamiento activado (`thinking=True`). Durante la construcción del conjunto de calibración se detectó un fallo en el propio `chat_template.jinja` del modelo: con `thinking=True` y `keep_cots` en su valor por defecto, la plantilla asume que el contenido de cada turno del asistente ya contiene un marcador `</think>` y falla con cualquier respuesta estática de entrenamiento que no lo tenga. La solución es pasar también `keep_cots=True`, que omite esa rama y sigue seleccionando el system prompt correcto de modo razonamiento.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de pensamiento explícito (`<think>...</think>`), activado en la calibración y en la evaluación.
- Tool calling / function calling con el parser `hermes` estándar de vLLM: inyección del esquema en `<tools>` y respuestas en formato `<tool_call>{"name":...,"arguments":...}</tool_call>`. El parser se verificó contra la plantilla de chat de este modelo; no hace falta un parser personalizado.
- Modo JSON y salidas estructuradas, heredados de la línea Hermes, que está entrenada específicamente para uso de herramientas y steerability.
- Ejecución de planes de varios pasos: recibir un plan, ejecutar un paso, detectar desviaciones, documentarlas y reportar.
- Depuración ligera y lectura de logs o salidas de comandos como parte del ciclo de ejecución.
- Seguimiento de instrucciones y generación de informes en texto claro sobre lo ejecutado.
- Capacidades multilingües: no declaradas para esta build; no hay evaluación en otros idiomas.
- No incluye visión, audio ni otra modalidad distinta de texto.
- Servicio en una sola GPU con `tensor-parallel-size 1`, caché KV en fp8 y prefix caching.

## Casos de uso

- Orquestador local de agentes: el modelo recibe un plan en texto de un modelo mayor y lo traduce en llamadas a herramientas concretas (shell, API internas, reinicios de servicio) gracias al tool calling con parser `hermes` y a sus 40 960 tokens de contexto, que permiten arrastrar el plan completo y el historial de pasos sin truncar.
- Automatización de runbooks de operaciones: cada procedimiento de guardia se codifica como pasos y el modelo los ejecuta, comprueba el resultado y redacta un informe final del incidente. Encaja en despliegues de baja QPS donde la fiabilidad pesa más que la latencia.
- Depuración asistida en local: leer trazas y logs de un servicio, correlacionar errores, proponer y ejecutar comandos de diagnóstico, y describir la causa probable. El modo de razonamiento ayuda a no saltarse comprobaciones intermedias.
- Asistente interno de helpdesk con salida estructurada: clasificar la petición, extraer campos en JSON y enrutarla a la herramienta o al equipo correcto, con el modo razonamiento activo para casos ambiguos.
- Enrutado de herramientas en pipelines de datos: dado un catálogo de funciones disponibles, decidir cuál invocar y con qué argumentos, devolviendo siempre JSON validable.
- Documentación automática post-incidente: convertir la secuencia de acciones ejecutadas en un informe legible para el equipo, apoyándose en la porción de calibración general (35%) orientada a seguir instrucciones y redactar.
- Despliegue on-premise con requisitos de privacidad: al ser Apache 2.0, caber en una sola GPU y no requerir servicios externos, permite operar en entornos aislados donde no se puede llamar a una API de terceros.
- Prototipado y evaluación de agentes multi-paso: sirve como ejecutor barato para probar planificadores, políticas de reintento y esquemas de herramientas antes de pasar a un modelo mayor.

## Benchmarks y rendimiento

Medidos por el autor con EleutherAI lm-evaluation-harness contra el endpoint servido, con modo de razonamiento activado (`thinking=True`). Los valores de HumanEval se obtuvieron por completado de código puro (`local-completions` contra `/v1/completions`), sin plantilla de chat ni andamiaje de razonamiento.

| Tarea | Esta build (int4 W4A16) |
|---|---|
| GSM8K (flexible-extract) | 87,49% ± 0,91% |
| GSM8K (strict-match) | 86,58% ± 0,94% |
| HumanEval (pass@1) | 31,10% ± 3,63% |
| MMLU-Pro (100 por asignatura) | 55,21% ± 1,31% |

No se publican resultados del modelo base en BF16 medidos en las mismas condiciones, por lo que no hay una cifra de degradación por cuantización. El autor señala explícitamente que no reutiliza números de terceros como propios.

## Requisitos de hardware

- Pesos: el repositorio ocupa 9,9 GB, lo que da un orden de magnitud de 9-10 GB de VRAM solo para los pesos int4 más el `lm_head` en BF16.
- Caché KV para el contexto completo: alrededor de 3,3 GB en fp8 a 40 960 tokens y en torno a 6,6 GB en BF16 (estimación a partir de las 40 capas y la configuración de cabezas KV de la familia Qwen3-14B; el dato no se publica en la ficha).
- Cabe en GPU de consumo: sí. Una RTX 4090 de 24 GB ejecuta el modelo con el contexto completo y caché fp8 con margen. Tarjetas de 16 GB (RTX 4080, A4000, L4 de 24 GB) pueden alojarlo reduciendo `--max-model-len`.
- GPU recomendadas para producción: A100 40/80 GB, H100, L40S o L4 si se prioriza coste y el contexto se recorta. El autor documenta un único dispositivo con `tensor-parallel-size 1`.
- Despliegue: vLLM, con el comando documentado por el autor (`--gpu-memory-utilization 0.90 --max-model-len 40960 --kv-cache-dtype fp8 --enable-prefix-caching --enable-auto-tool-choice --tool-call-parser hermes`). El formato compressed-tensors es el habitual en vLLM; otros motores compatibles con ese esquema podrían servir la build, pero no está documentado en la ficha. llama.cpp y Ollama requerirían convertir a GGUF, fichero que el repositorio no incluye.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Cuantización | Contexto | MMLU-Pro | GSM8K | HumanEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| fasolack/Hermes-4-14B-W4A16 | int4 W4A16 (AutoRound) | 40 960 | 55,21% | 87,49% (flexible) | 31,10% (pass@1) | Apache 2.0 | HuggingFace (0 descargas) |
| NousResearch/Hermes-4-14B (base) | BF16 | 40 960 (heredado del base Qwen3-14B; el build no lo modifica) | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| fasolack/Qwen2.5-Coder-14B-W4A16 | int4 W4A16 (AutoRound) | no disponible | 41,71% | no disponible | no disponible | no disponible | HuggingFace |

El único contraste numérico disponible es el de MMLU-Pro frente a la build de código de 14B del mismo autor: 55,21% frente a 41,71%, diferencia que el autor atribuye a que el rol de orquestación se beneficia del modo de razonamiento. No hay datos comparativos frente a otras cuantizaciones de Hermes-4-14B (AWQ, GPTQ, GGUF).

## Limitaciones y advertencias

- Repositorio sin adopción verificada: 0 descargas y 0 likes en la información disponible, sin revisión independiente de la cuantización.
- No se publica la comparación contra el modelo base en BF16 con la misma configuración de evaluación, así que no se puede cuantificar la pérdida por cuantizar a int4.
- HumanEval pass@1 de 31,10%: no es adecuado como generador de código en producción. El propio autor lo señala como esperado y no como defecto de la cuantización.
- Fallo conocido en `chat_template.jinja`: con `thinking=True` y `keep_cots` por defecto, la plantilla falla si algún turno del asistente no contiene un bloque `<think>`. Hay que pasar `keep_cots=True`.
- Calibración con solo 511 muestras y sesgada hacia tool calling (45%), general (35%) y código (20%): puede comportarse peor en dominios alejados de esa mezcla, en especial en tareas creativas, largas o de dominio especializado.
- Contexto limitado a 40 960 tokens nativos y sin `rope_scaling`: no conviene forzar ventanas mayores sin reentrenamiento ni extensión explícita.
- Idiomas no declarados y sin evaluación: la calibración es en inglés, por lo que el rendimiento en castellano es desconocido y no debe asumirse el del modelo base.
- Riesgo de alucinación operativa: al invocar herramientas y comandos, una llamada mal formada puede tener efectos reales. Requiere sandboxing, listas blancas de comandos y confirmación humana en acciones destructivas.
- Restricciones de licencia: la build se publica como Apache 2.0, pero conviene verificar los términos del modelo base y de los conjuntos de calibración antes de un uso comercial.
- Dependencia del stack de cuantización: el formato compressed-tensors exige kernels compatibles; sin conversión a GGUF no funciona en llama.cpp ni Ollama.
- El modo razonamiento activado incrementa los tokens por turno, lo que penaliza la latencia en cargas sensibles a ella.

## Enlaces

- Repositorio del modelo: https://huggingface.co/fasolack/Hermes-4-14B-W4A16
- Modelo base: https://huggingface.co/NousResearch/Hermes-4-14B
- Modelo sobre el que se construye el base: https://huggingface.co/Qwen/Qwen3-14B
- AutoRound (herramienta de cuantización): https://github.com/intel/auto-round
- Dataset de calibración de tool calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Dataset de calibración general: https://huggingface.co/datasets/NeelNanda/pile-10k
- Dataset de calibración de código: https://huggingface.co/datasets/ise-uiuc/Magicoder-OSS-Instruct-75K
- Build de código del mismo autor, usada como referencia comparativa: https://huggingface.co/fasolack/Qwen2.5-Coder-14B-W4A16
- Motor de servicio documentado (vLLM): https://github.com/vllm-project/vllm
- Arnés de evaluación empleado: https://github.com/EleutherAI/lm-evaluation-harness

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; las entradas obtenidas correspondían a páginas sin relación (gestión de cursos y contenidos educativos). Todos los enlaces anteriores proceden de la model card y de los metadatos del repositorio.
