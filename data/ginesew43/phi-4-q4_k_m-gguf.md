# ginesew43/phi-4-Q4_K_M-GGUF

## Resumen

`ginesew43/phi-4-Q4_K_M-GGUF` es una cuantización en formato GGUF del modelo `microsoft/phi-4`, publicada por el usuario ginesew43 mediante el espacio `GGUF-my-repo` de ggml.ai y la herramienta llama.cpp. No se trata de un modelo nuevo, sino de una conversión del checkpoint original de Microsoft Phi-4 a cuantización Q4_K_M, pensada para su ejecución en llama.cpp y entornos compatibles. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una conversión reciente y sin tracción comunitaria.

El modelo base Phi-4 es un transformer denso de aproximadamente 14.660 millones de parámetros (14,66B), desarrollado por Microsoft Research, especializado en razonamiento, matemáticas y generación de código, con licencia MIT. Esta conversión concreta hereda esas capacidades y las empaqueta en un fichero de unos 9,1 GB, apto para inferencia local en hardware de consumo.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 14B con calidad de razonamiento en GPUs de consumo mediante cuantización de 4 bits, sin necesidad de infraestructura de datacenter. No obstante, al ser una conversión de terceros, conviene verificar la fidelidad de la cuantización frente al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), modelo base microsoft/phi-4 |
| Parametros totales | 14.659.507.200 (14,66B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el comando de ejemplo del autor usa `-c 2048`) |
| Tipos de cuantizacion | Q4_K_M (esta conversion); el modelo base admite otras cuantizaciones GGUF no listadas aqui |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (fichero `phi-4-q4_k_m.gguf`) |

## Arquitectura y entrenamiento

Esta ficha describe una conversión GGUF, no el entrenamiento original. El modelo base `microsoft/phi-4` es un transformer decoder-only denso de 14,66B parámetros. La información sobre el número exacto de tokens de entrenamiento, la composición del dataset y las fases de alineación (RLHF/DPO) del modelo original no está incluida en la información proporcionada; debe consultarse la model card de `microsoft/phi-4` para esos detalles.

La conversión se realizó con llama.cpp a través del espacio `gguf-my-repo` de ggml.ai, que aplica la cuantización Q4_K_M (mezcla de bloques de 4 bits con escalas de mayor precisión en determinadas capas). Esta cuantización reduce el peso del modelo a unos 9,1 GB, con una pérdida de calidad típicamente moderada respecto al checkpoint en FP16/BF16. No se documenta en la información disponible ninguna innovación técnica adicional introducida por el conversor.

## Capacidades

- Generación de texto conversacional en inglés, con soporte de formato chat (etiquetas `chat`, `conversational`).
- Razonamiento matemático (etiqueta `math` en el repositorio).
- Generación y asistencia de código (etiqueta `code`).
- Inferencia local mediante llama.cpp (CLI y servidor HTTP).
- Compatibilidad con `transformers` según los tags del repositorio, aunque el formato principal es GGUF.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en inglés: el modelo puede mantener diálogos multi-turno en una estación de trabajo con GPU de consumo, usando llama-server con contexto configurable (el ejemplo del autor usa 2048 tokens).
- Resolución de problemas matemáticos paso a paso: gracias a la especialización del modelo base en matemáticas, adecuado para tutores o herramientas de verificación de cálculos en entornos educativos.
- Generación y revisión de código en local: útil para autocompletado, explicación de fragmentos y refactorización en flujos de desarrollo sin enviar código a servicios en la nube.
- Prototipado rápido de aplicaciones LLM: al ser un GGUF de 9,1 GB, permite levantar un endpoint compatible con OpenAI mediante llama-server en minutos, sin infraestructura dedicada.
- Procesamiento por lotes en equipos sin GPU de datacenter: la cuantización Q4_K_M permite ejecutar el modelo en CPU o GPUs de gama media para tareas de clasificación, resumen o extracción de información en inglés.
- Experimentación e investigación reproducibles: sirve como referencia de cuantización para comparar la degradación de calidad frente al checkpoint original de Phi-4 en tareas de razonamiento.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en local, los datos no salen del equipo, adecuado para prototipos con información sensible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9-11 GB con la cuantización Q4_K_M (el fichero pesa 9,1 GB; hay que sumar overhead de contexto KV cache).
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para holgura; RTX 4080/4070 Ti Super (16 GB) también suficientes para Q4_K_M con contexto moderado.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más (RTX 3060 12 GB, RTX 4070, etc.), con contexto reducido. En 8 GB no cabe en su totalidad y requeriría offloading parcial a CPU.
- Opciones de despliegue: llama.cpp (CLI y servidor), y cualquier runtime compatible con GGUF (Ollama, LM Studio, etc., siempre que acepten el fichero). Compatibilidad con vLLM o TGI no está documentada para GGUF en la información proporcionada.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ginesew43/phi-4-Q4_K_M-GGUF | 14,66B | no disponible | MIT | GGUF Q4_K_M | Conversion de terceros de Phi-4 |
| microsoft/phi-4 (original) | 14,66B | no disponible | MIT | safetensors | Checkpoint de referencia en precision completa |
| Otras cuantizaciones GGUF de phi-4 | 14,66B | no disponible | MIT | GGUF (varios) | Multiples autores publican Q4_K_M, Q5_K_M, Q8_0, etc. |

No se dispone de datos de rendimiento comparativo en la información proporcionada para establecer diferencias cuantitativas entre estas variantes.

## Limitaciones y advertencias

- Modelo entrenado y evaluado principalmente en inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- La cuantización Q4_K_M introduce pérdida de precisión frente al checkpoint original, especialmente perceptible en tareas de matemáticas y razonamiento de varios pasos.
- Riesgo de alucinación inherente a los modelos de lenguaje; no debe usarse como fuente de verdad sin verificación.
- Conversión de terceros con 0 descargas y 0 likes: no hay validación comunitaria de la calidad de la cuantización. Se recomienda comparar con el original o con cuantizaciones de autores consolidados.
- La licencia MIT permite uso comercial, pero conviene revisar la licencia del modelo base en `microsoft/phi-4` para confirmar condiciones.
- El comando de ejemplo del autor fija `-c 2048`; la longitud de contexto real soportada por el modelo base no se documenta en la información disponible y debe confirmarse antes de usarlo en producción.
- El repositorio no incluye información sobre tool calling ni modo agente; no asumir su disponibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ginesew43/phi-4-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/microsoft/phi-4
- Licencia del modelo base: https://huggingface.co/microsoft/phi-4/resolve/main/LICENSE
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
