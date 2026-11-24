# loom-draft/bartowski-NousResearch_Hermes-4-14B-loom

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un paquete de despliegue para AMD Loom: un conjunto de programas `.loom`, un `model.json` y el tokenizador que permiten ejecutar el checkpoint GGUF `NousResearch_Hermes-4-14B-Q4_K_M.gguf` (publicado por bartowski) sobre las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete lo genera la herramienta `loom-next` a partir del GGUF sin modificarlo y sin intervención de un LLM en el proceso, y lo publica el usuario `loom-draft`.

El modelo subyacente es Hermes 4 14B de NousResearch, un transformer denso de 14 mil millones de parámetros afinado para seguir instrucciones, con soporte de tool calling y una ventana de contexto configurada en este paquete a 40.960 tokens por petición. El interés de esta ficha no reside en el modelo en sí, sino en la ruta de despliegue: ofrece una API compatible con OpenAI (`/v1/chat/completions`) sobre hardware AMD de consumo y profesional, sin depender de CUDA ni de llama.cpp en tiempo de ejecución.

La relevancia es acotada y experimental. El repositorio declara cero descargas y cero likes, y todas las puertas de corrección (kernel_tests, golden, compare, agent, sampling, etc.) figuran como "not yet re-measured" para ambas GPU, de modo que no hay evidencia publicada de paridad numérica frente a la referencia de llama.cpp. Debe tratarse, por tanto, como un artefacto de evaluación temprana y no como una opción lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Hermes 4 14B); el paquete contiene programas `.loom` generados para ejecutar el GGUF |
| Parametros totales | 14B (según el nombre del checkpoint base) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 40.960 tokens por petición (configuración del preset) |
| Tipos de cuantizacion | Q4_K_M (GGUF); no se documentan otras en este paquete |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (checkpoint base) empaquetado como programas `.loom` y `weights.loom` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultáneas |
| API | Compatible con OpenAI (`/v1/chat/completions`) |
| Tool calling | Sí (formato OpenAI `tools` / `tool_calls`) |
| Modo razonamiento | No aplicable en este paquete |
| Entrada de imagen / audio | No aplicable |
| Decodificación especulativa | No aplicable |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

El paquete no aporta información sobre el entrenamiento del modelo base: no se detallan tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO. Lo que sí describe es la cadena de empaquetado: `loom-next` toma el GGUF sin modificarlo y genera programas `.loom` (`program/*.loom`, `weights.loom`) junto con `model.json`, `model.json.lock` (con los sha256 de los ficheros fuente, verificados por `loom-fetch`), `tokenizer.json` y `llm_config.json`. La ejecución se realiza con `loom-serve`, que expone un servidor HTTP con API de estilo OpenAI.

Los parámetros de despliegue documentados son: `--pool_backing=fixed` (reserva el pool de memoria por adelantado en lugar de crecimiento elástico), `--parameter_mode=preload` (carga de pesos en host; solo afecta a cómo se cargan, no a las mediciones de rendimiento salvo que el job se sirviera con él) y `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU, consume CPU mientras hay trabajo en vuelo). No se documenta ninguna innovación de decodificación especulativa ni atención lineal; de hecho, la tabla de features marca la decodificación especulativa como no aplicable.

## Capacidades

- Generación de texto conversacional multi-turno mediante API compatible con OpenAI.
- Tool calling en formato OpenAI (`tools` y `tool_calls`), con un bucle de tool calling multi-turno contemplado en la puerta de corrección `agent`.
- Contexto de 40.960 tokens por petición, suficiente para documentos largos; la puerta `golden` menciona explícitamente documentos de 1k a 32k.
- Concurrencia de hasta 4 peticiones simultáneas.
- Límite de 4.096 tokens de salida por petición (preset `max_tokens`).
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Sin modo de razonamiento/thinking, sin entrada de imagen, sin audio y sin decodificación especulativa en este paquete.
- Muestreo: estado "not determined" en la tabla de features, aunque existe una puerta `sampling` que verifica temperatura, top_k y semilla frente a llama.cpp (sin medición registrada).

## Casos de uso

- Evaluación de paridad numérica frente a llama.cpp: el paquete incluye puertas diseñadas para comparar tokens greedy, top-5 log-probs y salidas de agente contra la referencia de llama.cpp sobre el mismo GGUF; útil para validar la madurez del runtime Loom en hardware AMD.
- Despliegue local de un asistente conversacional en estaciones de trabajo con Radeon AI PRO R9700 (32 GB): el checkpoint Q4_K_M de 14B cabe holgadamente y el servidor expone `/v1/chat/completions`, por lo que clientes existentes compatibles con OpenAI funcionan sin cambios.
- Prototipado de agentes con herramientas en un solo equipo: el soporte de `tools`/`tool_calls` y la puerta `agent` (renderizado exacto del prompt, reutilización de historial, validez de las llamadas) permiten probar bucles de tool calling multi-turno en local.
- Procesamiento de documentos largos: con 40.960 tokens de contexto por petición y pruebas de referencia declaradas hasta 32k, encaja en tareas de resumen o extracción sobre contratos, informes o expedientes de tamaño medio.
- Servicio interno de baja concurrencia: el preset admite 4 peticiones concurrentes, adecuado para un equipo pequeño o para entornos de desarrollo donde no se requiere escalado horizontal.
- Banco de pruebas de portabilidad AMD: al soportar Strix Halo (gfx1151) y R9700 (gfx1201) con los mismos comandos, sirve para comparar comportamiento entre una APU y una GPU dedicada de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured", y todas las puertas de corrección figuran como "not yet re-measured".

| Puerta de correccion | Strix Halo | Radeon AI PRO R9700 |
|---|---|---|
| kernel_tests | no medida | no medida |
| golden | no medida | no medida |
| compare | no medida | no medida |
| consistency | no medida | no medida |
| agent | no medida | no medida |
| sampling | no medida | no medida |
| logits | no medida | no medida |
| decision | no medida | no medida |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el checkpoint base es Q4_K_M de un modelo de 14B, y el hardware objetivo declarado es una APU Strix Halo y una GPU de 32 GB (R9700).
- GPU soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta compatibilidad con GPU de consumo NVIDIA ni con otras AMD fuera de las dos indicadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch huggingface:loom-draft/bartowski-NousResearch_Hermes-4-14B-loom:chat --materialize=copy --output=nousresearch_hermes-4-14b` y `loom-serve --model=nousresearch_hermes-4-14b '--device=amdgpu://?completion_spin_ns=4294967295' --pool_backing=fixed --parameter_mode=preload`.
- Alternativas de despliegue como vLLM, llama.cpp, Ollama o TGI: no se documentan para este paquete; llama.cpp aparece únicamente como referencia de corrección.
- Latencia y throughput: no disponibles (sin mediciones publicadas).

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento de este paquete ni de alternativas comparables, por lo que no es posible establecer una comparación cuantitativa fiable.

| Criterio | Este paquete | Alternativa | Comentario |
|---|---|---|---|
| Parametros | 14B (Q4_K_M) | no disponible | Sin datos de comparación |
| Contexto | 40.960 tokens | no disponible | Configurado en el preset |
| Rendimiento | no medido | no disponible | Puertas sin re-medir |
| Licencia | MIT | no disponible | — |
| Disponibilidad | 0 descargas, 0 likes | no disponible | Publicación reciente (noviembre de 2026) |

## Limitaciones y advertencias

- Ausencia total de evidencia de corrección: las doce puertas de la tabla figuran como "not yet re-measured" en ambas GPU, de modo que no hay prueba publicada de que la salida coincida con la referencia de llama.cpp.
- Sin mediciones de rendimiento: no hay latencia ni throughput publicados, lo que impide estimar coste operativo.
- Adopción nula: cero descargas y cero likes en el momento de la consulta; el paquete es un artefacto experimental generado automáticamente.
- Alcance de hardware muy restringido: solo se declaran Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no hay soporte documentado para otras GPU.
- Dependencia de una versión concreta del runtime (`hrx-loom[hf]==0.2.0`) y de la integridad de los ficheros fijados por sha256 en `model.json.lock`.
- Límites operativos del preset: 4 peticiones concurrentes y 4.096 tokens de salida como máximo, insuficientes para cargas de producción sostenidas.
- Idiomas soportados no declarados; no se puede garantizar calidad multilingüe.
- Sin modo de razonamiento, sin visión, sin audio y sin decodificación especulativa; no apto para tareas que requieran estas capacidades.
- La licencia MIT se declara a nivel de paquete, pero no se detallan condiciones adicionales del checkpoint base más allá de su procedencia (bartowski/NousResearch_Hermes-4-14B-GGUF); conviene verificar la licencia del modelo original antes de uso comercial.
- Riesgo de alucinación y sesgos del modelo base: no documentados en la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/bartowski-NousResearch_Hermes-4-14B-loom
- Checkpoint base en Hugging Face: https://huggingface.co/bartowski/NousResearch_Hermes-4-14B-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Resultados de búsqueda web: no relevantes para este modelo (corresponden a Loom, la herramienta de grabación de vídeo, y a la marca de ropa Loom).
