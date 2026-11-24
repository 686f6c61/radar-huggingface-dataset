# onemunanoyo/Olala-v1.0-mini-7A1B-Abliterated-GGUF

## Resumen

Olala-v1.0-mini-7A1B-Abliterated-GGUF es una versión "abliterated" (sin mecanismos de rechazo) del modelo OVHaiLLM/Olala-v1.0-mini-7A1B, publicada por el usuario onemunanoyo en Hugging Face. El modelo original es un transformer de tipo MoE (mezcla de expertos) orientado a razonamiento, desarrollado por OVHai-LLM, con aproximadamente 6.775 millones de parámetros totales según los safetensors del modelo base. Esta versión se distribuye exclusivamente en formato GGUF cuantizado para su uso con el fork de llama.cpp mantenido por OVHai-LLM.

La modificación principal consiste en la eliminación de la dirección de rechazo mediante proyección sobre las matrices de escritura residual de las capas del decodificador, calculada a partir de contrastes entre prompts dañinos y benignos. El autor reporta que las capacidades generales se preservan, con un incremento moderado de perplejidad respecto al modelo base (11.6505 frente a 11.4414).

El modelo es relevante en el ecosistema porque combina tres características poco frecuentes en un mismo artefacto: arquitectura MoE con modo de razonamiento explícito (thinking), soporte de tool calling y una variante abliterated que elimina las negativas del modelo base. Su licencia Apache 2.0 facilita el uso comercial, aunque requiere un fork específico de llama.cpp, lo que limita su adopción en herramientas estándar como Ollama o LM Studio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) sobre transformer decoder; arquitectura "olala" no soportada por llama.cpp upstream |
| Parámetros totales | 6.775.272.608 (~6,78 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | 16.384 tokens (valor usado en el ejemplo de despliegue del autor; no se especifica el máximo nativo) |
| Tipos de cuantización | BF16, Q8_0, Q6_K, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (BF16, Q8_0, Q6_K, Q4_K_M) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder con arquitectura MoE (mezcla de expertos), según las etiquetas del repositorio. El identificador "7A1B" sugiere un esquema de aproximadamente 7 mil millones de parámetros con 1 mil millones activos por token, aunque el dato oficial de parámetros activos no está disponible en la información proporcionada. Los safetensors del modelo base reportan 6.775.272.608 parámetros totales. La arquitectura interna se denomina "olala" y no es compatible con llama.cpp upstream, Ollama ni LM Studio; requiere el fork específico de OVHai-LLM.

El modelo incorpora un modo de razonamiento explícito: genera primero una traza de pensamiento (`reasoning_content`) antes de la respuesta final (`content`). El parámetro `reasoning_effort` admite cuatro niveles (`disabled`, `low`, `medium` por defecto, `high`). No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base.

La modificación abliterated se realizó calculando la dirección de rechazo mediante contraste entre prompts dañinos y benignos, y proyectándola fuera de las matrices de escritura residual de las capas del decodificador. Se trata de una intervención lineal única, por lo que el autor advierte que la eliminación no garantiza generalización a todos los prompts, idiomas o formulaciones.

## Capacidades

- Generación de texto conversacional multi-turno con soporte de contexto largo (16.384 tokens en la configuración de ejemplo).
- Razonamiento explícito con traza de pensamiento separada de la respuesta final, controlable mediante `reasoning_effort`.
- Soporte de tool calling / function calling: la respuesta incluye `tool_calls` cuando se pasan herramientas en la petición.
- Compatibilidad con endpoints OpenAI (`/v1/chat/completions`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de código y matemáticas: no documentadas específicamente en la información disponible.
- Visión y audio: no disponibles.
- Modo abliterated: ausencia de mecanismos de rechazo en la mayoría de prompts evaluados (90 % de no rechazo sobre el total en la evaluación del autor).

## Casos de uso

- Asistentes conversacionales con razonamiento visible: el modelo separa la traza de pensamiento de la respuesta final, lo que permite auditar el proceso de razonamiento en aplicaciones de soporte técnico o educativo donde la explicación del razonamiento es tan importante como la respuesta.
- Integración en pipelines con tool calling: al devolver `tool_calls` en el endpoint compatible con OpenAI, puede conectarse a orquestadores de agentes que necesiten invocar funciones externas (APIs, bases de datos, calculadoras) dentro de flujos multi-paso.
- Investigación sobre alineación y seguridad: la variante abliterated permite estudiar el comportamiento del modelo sin rechazos, comparando con el modelo base para analizar cómo la dirección de rechazo afecta a las respuestas en distintos dominios.
- Generación de contenido creativo sin restricciones temáticas: útil en entornos controlados de escritura narrativa o guiones donde el modelo base podría declinar ciertos temas; requiere revisión humana y cumplimiento legal.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_M (5,69 GB) y Q6_K (6,31 GB) permiten ejecutar el modelo en GPUs de consumo con 8-12 GB de VRAM mediante el fork de llama.cpp, con contexto de 16.384 tokens.
- Procesamiento de documentos largos con razonamiento: la ventana de 16.384 tokens permite analizar contratos, informes o artículos extensos generando un razonamiento estructurado antes de la conclusión.
- Experimentación con modos de esfuerzo de razonamiento: el parámetro `reasoning_effort` permite ajustar el coste computacional entre respuestas rápidas (`low`) y trazas de razonamiento extensas (`high`), útil para optimizar latencia en producción.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Métrica | Modelo base | Este modelo (abliterated) |
|---|---|---|
| Perplejidad (PPL) | 11,4414 ± 0,20138 | 11,6505 ± 0,20572 |
| Prompts dañinos con respuesta alcanzada | 10/10 | 7/10 |
| Rechazo (sobre completados) | 10/10 (100 %) | 1/7 (14,3 %) |
| Rechazo (sobre total) | 10/10 (100 %) | 1/10 (10 %) |

Evaluación de rechazo realizada sobre 10 prompts dañinos de un dataset distinto a `mlabonne/harmful_behaviors`, en BF16, contexto de 4096 tokens, `max_tokens=3800` y `reasoning_effort=low`. De los 3 prompts que no alcanzaron respuesta final, el autor atribuye el fallo a bucles de razonamiento (traza de ~18.000-19.000 caracteres que agota el límite de tokens), no a rechazos. Al aumentar `max_tokens` de 2048 a 3800, la tasa de completado mejoró de 4/10 a 7/10.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: BF16 ~13,59 GB de pesos (más overhead de contexto); Q8_0 ~7,28 GB; Q6_K ~6,31 GB; Q4_K_M ~5,69 GB.
- GPU recomendadas: A100 o H100 para BF16 con contexto completo; RTX 4090 (24 GB) para BF16 o Q8_0 con contexto largo; RTX 3090/4080 (16 GB) para Q8_0 o Q6_K; GPUs de 8-12 GB para Q4_K_M.
- Cabe en GPU de consumo: sí, en Q4_K_M y Q6_K en GPUs de 8-12 GB; en Q8_0 en GPUs de 16 GB o más.
- Opciones de despliegue: exclusivamente el fork de llama.cpp de OVHai-LLM (`https://github.com/OVHai-LLM/llama.cpp`). No es compatible con llama.cpp upstream, Ollama ni LM Studio según el autor. El servidor expone endpoints compatibles con OpenAI.
- Compilación: `cmake -B build -DGGML_METAL=ON` (macOS) o `-DGGML_CUDA=ON` (NVIDIA), con `-DLLAMA_USE_PREBUILT_UI=OFF`.
- Comando de ejemplo: `./build/bin/llama-server -m Olala-v1.0-mini-7A1B-Abliterated-q6_k.gguf -ngl 99 -fa 1 -c 16384 --port 8080`.
- Latencia y throughput: no disponibles en la información proporcionada.
- Parámetros de muestreo recomendados: `temperature=0.8`, `top_p=0.9`, `top_k=40`.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la documentación proporcionada. El modelo base OVHaiLLM/Olala-v1.0-mini-7A1B es la referencia natural, del que esta versión se diferencia por la abliteración (perplejidad ligeramente superior, 11,65 frente a 11,44, y eliminación de rechazos). No se han publicado comparativas con otros modelos MoE de tamaño similar (por ejemplo, familias tipo Qwen MoE o Mixtral) en la información disponible.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Olala-v1.0-mini-7A1B-Abliterated (este) | ~6,78 mil M | 16.384 (config. ejemplo) | Apache 2.0 | GGUF | Requiere fork de llama.cpp |
| OVHaiLLM/Olala-v1.0-mini-7A1B (base) | ~6,78 mil M | no disponible | Apache 2.0 | safetensors (original) | Modelo de referencia |
| Otros modelos MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | Sin datos en la información proporcionada |

## Limitaciones y advertencias

- La abliteración elimina los rechazos: el modelo puede producir contenido que el modelo base declinaría. El autor recomienda uso responsable y conforme a la legislación aplicable.
- La eliminación se basa en un único vector lineal de rechazo, por lo que no se garantiza que generalice a todos los prompts, idiomas o formulaciones; pueden persistir rechazos o aparecer respuestas no deseadas según el caso.
- Bucles de razonamiento: la eliminación de la dirección de rechazo puede provocar trazas de pensamiento extendidas que agotan `max_tokens` antes de generar `content`. En la evaluación del autor, 3 de 10 prompts no completaron la respuesta por este motivo. Mitigación: aumentar `max_tokens` o reducir `reasoning_effort`.
- Las limitaciones del modelo base aplican a esta versión.
- Compatibilidad restringida: requiere el fork de llama.cpp de OVHai-LLM; no funciona con llama.cpp upstream, Ollama ni LM Studio.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento multilingüe sin evaluación previa.
- No hay datos publicados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni de sesgos conocidos.
- Riesgo de alucinación: no cuantificado en la información disponible, pero aplicable a cualquier modelo de ~7 mil millones de parámetros en tareas de conocimiento factual.
- Licencia Apache 2.0 permite uso comercial, pero al redistribuir el modelo o derivados debe conservarse el archivo `NOTICE` del proyecto upstream.
- El repositorio tiene un tamaño de 32,9 GB, lo que incluye todas las cuantizaciones; la descarga selectiva de un solo archivo es recomendable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/onemunanoyo/Olala-v1.0-mini-7A1B-Abliterated-GGUF
- Modelo base: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B
- Fork de llama.cpp requerido: https://github.com/OVHai-LLM/llama.cpp
- Dataset de referencia para evaluación de rechazo: `mlabonne/harmful_behaviors` (mencionado en la model card; el autor usa un dataset distinto no identificado)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
