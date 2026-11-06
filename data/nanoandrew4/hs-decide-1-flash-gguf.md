# nanoandrew4/hs-decide-1-flash-GGUF

## Resumen

`hs-decide-1-flash-GGUF` es la conversión a formato GGUF del modelo `hindsight-ai/hs-decide-1-flash`, un modelo de decisión de 752 millones de parámetros publicado por el usuario nanoandrew4. No se trata de un modelo generativo de propósito general, sino de un modelo especializado en tareas de decisión estructurada (clasificación, puntuación y elección entre opciones) que se sirve a través de un endpoint específico `/v1/systemone` en un servidor llama.cpp modificado.

La relevancia de esta publicación es doble. Por un lado, documenta un proceso de conversión con un tipo de decisión personalizado (`hsdecide`) que requiere un binario de llama.cpp parcheado, lo que la aleja del ecosistema estándar de llama.cpp. Por otro, incluye una nota de cuantización muy concreta: el autor comparó Q8_0 contra la implementación oficial de referencia (plugin vLLM) sobre 20 payloads fijos y Q8_0 falló 14 de ellos, mientras que bf16 pasó 19 de 20 con diferencias de probabilidad máximas de 1,40e-3. La recomendación explícita es distribuir bf16.

El modelo base pertenece a la familia `hs-decide-1-flash` de hindsight-ai y está etiquetado con `systemone`, una convención de prompt template compilada en el servidor para modelos de caso de uso único. La licencia es Apache 2.0 y el repositorio ocupa 1,5 GB, correspondientes a los pesos en bf16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de decisión; metadato `<qwen35>.decision.type = hsdecide` sugiere base tipo Qwen) |
| Parámetros totales | 752.393.024 |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 (recomendada); Q8_0 disponible pero descartada por el autor por divergencia numérica |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `hindsight-ai/hs-decide-1-flash` en la documentación proporcionada. El metadato de conversión hace referencia a `<qwen35>`, lo que sugiere que el modelo base deriva de una arquitectura de la familia Qwen, pero este dato no se confirma explícitamente. El tamaño de 752 millones de parámetros y el peso del repositorio (1,5 GB en bf16) son coherentes con un transformer denso de escala pequeña.

El aspecto técnico diferencial de esta conversión es la introducción de un tipo de decisión personalizado, `hsdecide`, que se declara mediante una única clave de metadatos añadida a la conversión estándar. El prompt template de `systemone` está compilado dentro del servidor y no viaja en el fichero GGUF, siguiendo la convención upstream para modelos de caso de uso único. Esto implica que el modelo no funciona con un llama.cpp estándar: requiere un binario compilado con soporte para `hsdecide` (el autor menciona una imagen `ghcr.io/.../llama.cpp-hsdecide`). No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens ni si hubo RLHF o DPO.

## Capacidades

- Tareas de decisión estructurada sobre payloads: el endpoint `/v1/systemone` expone las operaciones `noul`, `score` y `choice`, con soporte para múltiples preguntas en una misma petición.
- Puntuación y elección entre opciones: adecuado para seleccionar una alternativa entre varias o asignar una puntuación a una respuesta candidata.
- Modo conversacional: el repositorio está etiquetado como `conversational` y `endpoints_compatible`.
- Integración vía API HTTP: se sirve mediante `POST /v1/systemone` en un llama-server modificado.
- No consta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Enrutamiento de peticiones en pipelines de IA: el modelo puede puntuar o elegir entre rutas candidatas (por ejemplo, derivar una consulta a un modelo grande, a uno pequeño o a una herramienta) usando la operación `choice` sobre un conjunto acotado de opciones.
- Clasificación de intención en asistentes conversacionales: con `score` se puede asignar una probabilidad a cada intención predefinida y seleccionar la más probable antes de invocar el modelo generativo principal.
- Evaluación automática de respuestas: usar `score` para puntuar la calidad o adecuación de una respuesta candidata frente a un criterio fijo, como paso de filtrado en un pipeline de generación.
- Moderación o triaje previo: decidir si una entrada requiere revisión humana o puede procesarse automáticamente, aprovechando el bajo coste de un modelo de 752 M parámetros.
- Selección de herramientas en un agente: dado un conjunto de herramientas disponibles y una consulta, emplear `choice` para decidir cuál invocar antes de ejecutar la llamada real.
- Decisión multi-pregunta en lote: el soporte de múltiples preguntas por petición permite evaluar varias decisiones sobre el mismo payload en una sola llamada, útil en pipelines de validación por etapas.
- Despliegue en entornos con recursos limitados: al ocupar 1,5 GB en bf16, puede ejecutarse en una GPU de consumo o incluso en CPU, lo que lo hace apto para servicios de decisión de baja latencia y bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor sí documenta una validación numérica de la cuantización frente a la implementación oficial en vLLM sobre 20 payloads fijos:

| Variante | Payloads superados | Diferencia máxima de probabilidad | Argmax idéntico |
|---|---|---|---|
| bf16 | 19/20 | 1,40e-3 | Sí, en todos |
| Q8_0 | 6/20 (falla 14) | 7,85e-3 | no disponible |

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,5 GB para bf16; Q8_0 rondaría los 0,8 GB, pero el autor desaconseja su uso por la divergencia numérica observada.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre; también es viable en CPU dada la escala del modelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp con soporte para el tipo de decisión `hsdecide` (binario parcheado o imagen `ghcr.io/.../llama.cpp-hsdecide`). No es compatible con llama.cpp upstream, vLLM, TGI, Ollama ni otros servidores estándar sin ese parche.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (modelos de decisión con endpoint dedicado) en la documentación proporcionada. Como referencia de escala, se incluye la comparación con el modelo base del que deriva:

| Modelo | Parámetros | Formato | Licencia | Despliegue |
|---|---|---|---|---|
| hs-decide-1-flash-GGUF (esta ficha) | 752 M | GGUF bf16 | Apache 2.0 | llama.cpp con parche `hsdecide` |
| hindsight-ai/hs-decide-1-flash | 752 M | no disponible | no disponible | plugin vLLM oficial |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Requiere un binario de llama.cpp modificado con el tipo de decisión `hsdecide`; no funciona con llama.cpp estándar ni con servidores compatibles convencionales.
- La cuantización Q8_0 no es fiable según la validación del propio autor: falla 14 de 20 payloads frente a la referencia vLLM. Debe usarse bf16.
- El prompt template está compilado en el servidor, no en el fichero, por lo que cambiar de servidor o de versión puede alterar el comportamiento sin que el GGUF lo refleje.
- Modelo de caso de uso único: no es un modelo generativo de propósito general y no debe emplearse para tareas de texto abierto.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo de decisión, el riesgo se manifiesta como elecciones o puntuaciones incorrectas más que como texto inventado.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia Apache 2.0: permite uso comercial, pero la dependencia de un binario parcheado puede condicionar el mantenimiento en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación communitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nanoandrew4/hs-decide-1-flash-GGUF
- Modelo base: https://huggingface.co/hindsight-ai/hs-decide-1-flash
- Imagen de llama.cpp con soporte `hsdecide`: `ghcr.io/.../llama.cpp-hsdecide` (referencia incompleta en la model card)
