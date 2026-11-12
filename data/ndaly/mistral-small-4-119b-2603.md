# ndaly/Mistral-Small-4-119B-2603

## Resumen

Mistral-Small-4-119B-2603 es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por Mistral AI, con 119.000 millones de parámetros totales, 128 expertos de los cuales 4 están activos por token (6.500 millones de parámetros activos), y atención multi-head latent (MLA). El repositorio `ndaly/Mistral-Small-4-119B-2603` no contiene el modelo original, sino un paquete de despliegue derivado del checkpoint oficial `mistralai/Mistral-Small-4-119B-2603` sin modificar, empaquetado con `tt-model-manager` 0.1.0 para ejecutarse sobre hardware Tenstorrent p300x2 mediante vLLM.

El paquete está pensado para servir el modelo en modo instruct a través de una API compatible con OpenAI (chat completions, completions y `/v1/models`) en un mesh de cuatro chips P300x2 con tensor parallelism. Soporta hasta 32 secuencias concurrentes y acepta prompts de hasta 1.048.576 tokens, aunque el contexto de entrenamiento del checkpoint es de 262.144 tokens.

Es relevante para equipos que despliegan modelos abiertos sobre aceleradores Tenstorrent en lugar de GPU convencionales, y para quienes necesitan una referencia de rendimiento real (TTFT, throughput de prefill y decode) medida sobre este hardware concreto. El repositorio ocupa 1,3 GB porque contiene el código de servicio y los manifiestos; los pesos se descargan aparte (unos 121 GB en caché de Hugging Face más unos 100 GB de pesos convertidos).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 128 expertos y multi-head latent attention (MLA) |
| Parámetros totales | 119.000 millones |
| Parámetros activos | 6.500 millones por token (4 de 128 expertos activos) |
| Longitud de contexto | 1.048.576 tokens en el paquete servido; contexto de entrenamiento del checkpoint: 262.144 tokens |
| Tipos de cuantización | No disponible como opción de usuario; los pesos se ejecutan con una política de block-float de precisión reducida (no bf16) |
| Idiomas soportados | Inglés, francés, alemán, español, portugués, italiano, chino, japonés, coreano, árabe y otros (según la model card del paquete) |
| Licencia | Apache-2.0 (pesos de Mistral AI; código de port y servicio en `code/` también Apache-2.0) |
| Formato de pesos | Shards de pesos del checkpoint original descargados desde Hugging Face; pesos convertidos en caché local (`~/.cache/tt-model/`); el repo no incluye los pesos |
| Hardware de referencia | Tenstorrent p300x2 (mesh de 4 chips, tensor parallel sobre 4 chips) |
| Concurrencia máxima | 32 secuencias |
| API | Compatible con OpenAI en `http://127.0.0.1:20000/v1` |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mixture-of-experts con 128 expertos, de los que se activan 4 por token, lo que da 6.500 millones de parámetros activos sobre un total de 119.000 millones. Incorpora multi-head latent attention (MLA), una variante de atención con compresión de las claves y valores que reduce el coste de memoria del KV cache, especialmente relevante para contextos muy largos. La model card del paquete no detalla la composición del dataset de entrenamiento, el número de tokens, ni si hubo fases de RLHF o DPO; indica explícitamente que esos detalles están en la model card del checkpoint original de Mistral AI.

El paquete en sí no modifica los pesos: lo que añade es el port a Tenstorrent y la infraestructura de servicio. Los pesos se convierten para el mesh de cuatro chips en el primer arranque (proceso que tarda decenas de minutos) y se cachean para arranques posteriores. La compilación de kernels para el dispositivo también ocurre en el primer arranque y tarda varios minutos. La inferencia se ejecuta con vLLM sobre tt-metal, con un plugin de vLLM específico para Tenstorrent, y los pesos corren en una política de block-float de precisión reducida, por lo que las salidas difieren de la referencia en bf16 de Hugging Face.

## Capacidades

- Generación de texto en modo instruct mediante API compatible con OpenAI (chat completions y completions).
- Uso como asistente de chat general y para programación, según el uso previsto declarado en la model card.
- Multilingüismo: inglés, francés, alemán, español, portugués, italiano, chino, japonés, coreano, árabe y otros idiomas cubiertos por el checkpoint.
- Contexto muy largo: acepta prompts de hasta 1.048.576 tokens, aunque la precisión más allá de los 262.144 tokens de entrenamiento no se ha evaluado.
- Servicio concurrente de hasta 32 secuencias.
- No soporta tool calling: no hay parser de tool calls configurado, por lo que el campo `tools` de una petición no se convierte en `tool_calls`.
- No soporta modo de razonamiento: el modo reasoning del checkpoint no está validado en este paquete.
- No soporta entrada de imagen: la entrada de visión del checkpoint no está portada; es solo texto.
- No soporta agentes multi-paso ni function calling en esta configuración.

## Casos de uso

- Asistente de chat general en producción: el paquete expone una API compatible con OpenAI con chat completions, lo que permite integrarlo en aplicaciones existentes sin cambiar el cliente; el template de chat añade un system prompt por defecto de unos 564 tokens a cada petición.
- Asistencia a la programación: el modelo obtiene 92,68 % de pass@1 en HumanEval-instruct medido a través del endpoint servido, lo que lo hace adecuado para autocompletado y generación de funciones en entornos de desarrollo con integración vía API.
- Procesamiento de documentos largos: con hasta 1.048.576 tokens de contexto aceptados, se puede enviar un prompt de documento completo (por ejemplo, un informe o un repositorio de código) en una sola petición; hay que asumir un prefill de unos 2 ms por token de prompt, aproximadamente 35 minutos para un prompt de contexto completo.
- Despliegue sobre aceleradores Tenstorrent: equipos que ya operan hardware p300x2 pueden servir un modelo MoE de 119B sin GPU NVIDIA, usando `tt serve ndaly/Mistral-Small-4-119B-2603` y el CLI de Tenstorrent.
- Evaluación comparativa de infraestructura: las métricas publicadas (TTFT, prefill tok/s, decode tok/s, E2EL) a 1 y 32 usuarios sirven como referencia para dimensionar despliegues y comparar configuraciones de mesh.
- Traducción y generación multilingüe: el checkpoint cubre inglés, francés, alemán, español, portugués, italiano, chino, japonés, coreano y árabe, lo que permite tareas de traducción y redacción en esos idiomas mediante la API de chat.
- Prototipado de asistentes conversacionales con concurrencia moderada: con 32 secuencias concurrentes y un decode agregado de unos 66 tok/s a esa concurrencia, es viable para entornos de demo o internos con carga limitada.

## Benchmarks y rendimiento

Evaluaciones ejecutadas a través del endpoint servido:

| Eval | Este paquete | Referencia | Prompts |
|---|---|---|---|
| IFEval, prompt-strict (límite de 1.024 tokens) | 72,83 % | — | 541 |
| HumanEval-instruct, pass@1 | 92,68 % | — | 164 |

La model card original de Mistral AI reporta sus benchmarks como gráficos y no incluye cifras de IFEval ni HumanEval. GPQA no se midió en este paquete.

Rendimiento de servicio medido con `vllm bench serve` el 2026-09-16 sobre un p300x2:

| Perfil | ISL | OSL | Concurrencia | N | TTFT (ms) | Prefill tok/s/u | Decode tok/s/u | E2EL (s) |
|---|---|---|---|---|---|---|---|---|
| default | 128 (691 servidos con el system prompt por defecto) | 128 | 1 | 8 | 1.544 | 448 | 45,9 | 4,3 |
| default | 100 (unos 660 servidos con el system prompt por defecto) | 100 | 32 | 32 | 39.609 | 17 | 2,1 (66 agregado) | 48,4 |

Notas de medición: decode es de 21 a 22 ms por token con un solo usuario; el prefill corre a unos 2 ms por token de prompt hasta el contexto completo de 1.048.576 tokens. A 32 usuarios los prefills se ejecutan en serie, por lo que el TTFT incluye la espera.

## Requisitos de hardware

- Hardware validado: Tenstorrent p300x2, un mesh de cuatro chips con tensor parallelism sobre 4 chips. No se ha validado en otro hardware.
- Espacio en disco: 121 GB libres en la caché de Hugging Face para los shards de pesos y unos 100 GB adicionales en `~/.cache/tt-model/` para los pesos convertidos.
- Requisitos de host: Docker, CLI de Tenstorrent (`uv tool install tenstorrent`), hugepages configuradas en el host.
- No hay datos publicados de VRAM para GPU; el paquete no está orientado a GPU NVIDIA ni a hardware consumer.
- Opciones de despliegue: `tt serve ndaly/Mistral-Small-4-119B-2603` (descarga la imagen Docker y los pesos, arranca el servidor en el puerto 20000 o el siguiente libre) o, sin tt-cli, `tt-model serve ndaly/Mistral-Small-4-119B-2603`.
- Tiempos de arranque: la primera vez, compilación de kernels (varios minutos) y conversión de pesos para el mesh de cuatro chips (decenas de minutos); los arranques posteriores cargan los pesos convertidos de la caché.
- Throughput: 45,9 tok/s por usuario con un usuario (decode) y 66 tok/s agregados con 32 usuarios; prefill de 448 tok/s por usuario a un usuario y 17 tok/s por usuario a 32 usuarios.
- Latencias: TTFT de 1.544 ms a un usuario con ISL corto; 39.609 ms a 32 usuarios por la serialización del prefill.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos frente a otros modelos en la información proporcionada. La model card del paquete solo compara sus propias métricas de servicio entre perfiles de concurrencia y frente a la ausencia de cifras equivalentes en la model card original. Como referencia estructural, el propio checkpoint original `mistralai/Mistral-Small-4-119B-2603` es la alternativa directa (mismos pesos, sin port a Tenstorrent, ejecutable en GPU con vLLM estándar), pero no se han publicado en esta información cifras de rendimiento comparables entre ambos despliegues.

| Modelo | Parámetros | Activos | Contexto | Licencia | Hardware de referencia |
|---|---|---|---|---|---|
| ndaly/Mistral-Small-4-119B-2603 (este paquete) | 119B | 6,5B | 1.048.576 tokens servidos; 262.144 de entrenamiento | Apache-2.0 | Tenstorrent p300x2 |
| mistralai/Mistral-Small-4-119B-2603 (checkpoint original) | 119B | 6,5B | 262.144 tokens de entrenamiento | Apache-2.0 | No disponible en esta información |

## Limitaciones y advertencias

- Validado únicamente en p300x2 (un mesh de cuatro chips); no hay garantía de funcionamiento en otras configuraciones.
- Solo texto: la entrada de visión del checkpoint no está portada.
- Sin tool calling: no hay parser configurado, por lo que `tools` en las peticiones no se traduce en `tool_calls`.
- Sin modo de razonamiento validado: el modo reasoning del checkpoint no está verificado en este paquete.
- Sin prefix caching ni chunked prefill: cada petición hace prefill desde cero y el prefill es secuencial entre usuarios, lo que degrada el TTFT con concurrencia (39,6 s a 32 usuarios).
- Precisión reducida: los pesos corren en block-float, no en bf16, por lo que las salidas difieren de la referencia de Hugging Face.
- Contexto: aunque se aceptan prompts de hasta 1.048.576 tokens, la precisión más allá de los 262.144 tokens de entrenamiento no se ha evaluado, y un prompt de contexto completo tarda unos 35 minutos en prefill.
- GPQA no medido; los benchmarks publicados se limitan a IFEval y HumanEval-instruct.
- Riesgo de alucinación y sesgos: no se documentan en la información proporcionada; se aplican los del checkpoint original de Mistral AI, no detallados aquí.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar los términos del checkpoint original de Mistral AI y del stack de servicio de Tenstorrent.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica poca validación comunitaria.
- El template de chat añade un system prompt por defecto de unos 564 tokens a cada petición, con impacto en coste y latencia.

## Enlaces

- Repositorio del paquete: https://huggingface.co/ndaly/Mistral-Small-4-119B-2603
- Discusiones del paquete: https://huggingface.co/ndaly/Mistral-Small-4-119B-2603/discussions
- Checkpoint original: https://huggingface.co/mistralai/Mistral-Small-4-119B-2603
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- CLI de Tenstorrent (prerrequisitos): https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
- Repositorio tt-cli: https://github.com/tenstorrent/tt-cli
- Contacto de soporte de producto: support@tenstorrent.com
