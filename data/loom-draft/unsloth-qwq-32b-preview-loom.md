# loom-draft/unsloth-QwQ-32B-Preview-loom

## Resumen

QwQ-32B-Preview es un modelo de lenguaje de 32.800 millones de parámetros desarrollado originalmente por el equipo Qwen de Alibaba, diseñado específicamente para razonamiento analítico con cadenas de pensamiento extendidas. Esta ficha concreta, `loom-draft/unsloth-QwQ-32B-Preview-loom`, no es un modelo nuevo ni un ajuste fino: es un paquete de despliegue generado automáticamente con la herramienta `loom-next` a partir del checkpoint GGUF cuantizado `QwQ-32B-Preview-Q4_K_M.gguf` publicado por Unsloth. El paquete contiene programas `.loom` compilados para GPUs AMD concretas, más un `model.json` con la configuración de servicio.

El interés de esta publicación es puramente de infraestructura: permite servir el modelo en hardware AMD mediante `loom-serve`, exponiendo una API compatible con OpenAI (`/v1/chat/completions`) sobre los aceleradores AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB). No aporta pesos nuevos ni mejoras de calidad respecto al modelo base; es un artefacto de empaquetado para el ecosistema Loom.

La relevancia es limitada y muy específica: quien tenga ese hardware AMD y quiera ejecutar QwQ-32B-Preview en local sin depender de llama.cpp encontrará aquí un paquete listo para `loom-fetch` y `loom-serve`. Para el resto de usuarios, la referencia canónica sigue siendo el repositorio original de Qwen o el GGUF de Unsloth.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (modelo base QwQ-32B-Preview de Qwen) |
| Parametros totales | 32.800 millones (32B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens por petición (según `model.json` del paquete) |
| Tipos de cuantizacion | Q4_K_M (GGUF), única incluida en este paquete |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`QwQ-32B-Preview-Q4_K_M.gguf`) empaquetado como programas `.loom` y `weights.loom` |

## Arquitectura y entrenamiento

El modelo subyacente es QwQ-32B-Preview, un transformer decoder-only denso de 32.800 millones de parámetros desarrollado por Qwen (Alibaba) y orientado a razonamiento. Está entrenado con énfasis en cadenas de pensamiento largas y auto-reflexión, lo que le permite abordar problemas de matemáticas y lógica descomponiéndolos en pasos explícitos antes de emitir la respuesta final. Los detalles concretos de composición del dataset, número de tokens de entrenamiento y uso de RLHF/DPO no están disponibles en la información proporcionada.

Esta publicación no modifica el modelo: el checkpoint GGUF es el de Unsloth sin alteraciones, y el trabajo de `loom-next` consiste en generar kernels y programas de ejecución específicos para las arquitecturas AMD gfx1151 y gfx1201. El paquete incluye pruebas de corrección (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `sampling`, `logits`) que comparan la salida contra una referencia de llama.cpp sobre el mismo GGUF, aunque en el momento de la publicación todas aparecen como «not yet re-measured», es decir, sin evidencia registrada.

## Capacidades

- Generación de texto y razonamiento multi-paso con cadenas de pensamiento explícitas.
- Resolución de problemas matemáticos y lógicos de cierta complejidad.
- Generación y análisis de código.
- Tool calling / function calling en formato OpenAI (`tools` y `tool_calls`), según la tabla de características del paquete.
- API compatible con OpenAI para chat completions.
- Concurrencia de hasta 4 peticiones simultáneas.
- Límite de 4.096 tokens de salida por petición (preset `max_tokens`).
- Sin modo «thinking» configurable, sin decodificación especulativa, sin entrada de imagen ni audio (marcados como «not applicable» en el paquete).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Razonamiento matemático asistido: el modelo puede descomponer problemas de álgebra, cálculo o demostraciones en pasos intermedios, lo que lo hace útil como asistente para estudiantes o investigadores que necesiten ver el desarrollo, no solo el resultado.
- Generación de código con verificación: gracias al soporte de tool calling, puede integrarse en un bucle agente que ejecute tests y corrija el código generado antes de devolverlo.
- Servicio local en estaciones de trabajo AMD: con `loom-serve` sobre una Radeon AI PRO R9700 (32 GB) o un Ryzen AI Max+ 395, se puede levantar un endpoint compatible con OpenAI para prototipos sin depender de la nube.
- Automatización de análisis técnico: para tareas de revisión de documentación o extracción de conclusiones a partir de textos largos, aprovechando la ventana de 32.768 tokens.
- Evaluación comparativa de backends: el paquete sirve para medir el rendimiento de Loom frente a llama.cpp sobre el mismo GGUF y el mismo hardware, ya que incluye gates de corrección y comparación de logits.
- Entornos de investigación con requisitos de privacidad: al ejecutarse íntegramente en local sobre hardware AMD, permite procesar datos sensibles sin salida a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) «no se han vuelto a medir» para este paquete, y todas las puertas de corrección aparecen sin evidencia registrada.

## Requisitos de hardware

- VRAM estimada: el checkpoint Q4_K_M de un modelo de 32B ocupa aproximadamente 19-20 GB en pesos, más overhead de contexto y buffers; encaja ajustadamente en 32 GB.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- No está pensado para GPUs consumer NVIDIA; el paquete genera kernels específicos para AMD.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve` con los flags indicados en la model card (`--pool_backing=fixed`, `--parameter_mode=preload`, `completion_spin_ns=4294967295`).
- Latencia y throughput: no disponibles; las mediciones del paquete están pendientes de repetir.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| QwQ-32B-Preview (este paquete, vía Loom) | 32B denso | 32.768 | Apache 2.0 | Solo AMD gfx1151 / gfx1201 vía `loom-serve` |
| QwQ-32B-Preview (GGUF de Unsloth, vía llama.cpp) | 32B denso | hasta 32.768 según config | Apache 2.0 | Multiplataforma (CPU, NVIDIA, AMD, Apple) |
| QwQ-32B-Preview (pesos originales de Qwen) | 32B denso | 32.768 | Apache 2.0 | Transformers, vLLM, TGI |

La diferencia entre las tres entradas no es de capacidades ni de calidad, sino de formato y backend de ejecución. Este paquete es el más restrictivo en cuanto a hardware y el menos validado (sin gates medidos), pero el único que ofrece un camino nativo para servir el modelo en las GPUs AMD indicadas a través de Loom.

## Limitaciones y advertencias

- Publicación con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación por parte de la comunidad.
- Todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `sampling`, `logits`, etc.) aparecen como «not yet re-measured»: no hay prueba registrada de que la salida coincida con la referencia de llama.cpp.
- Las mediciones de rendimiento frente a llama.cpp tampoco están disponibles para este paquete.
- El campo de muestreo (`sampling`) figura como «not determined» en la tabla de características.
- El paquete está atado a hardware AMD concreto (gfx1151, gfx1201); no es portable a otras GPUs sin regeneración.
- El modelo base QwQ-32B-Preview es conocido por generar cadenas de razonamiento largas, lo que incrementa el consumo de tokens y la latencia en tareas simples; conviene controlar el presupuesto de salida.
- Riesgo de alucinación inherente al modelo base; no hay datos específicos de sesgos en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original de Qwen antes de desplegarlo en producción.
- El límite de 4.096 tokens de salida por petición puede ser insuficiente para razonamientos muy extensos.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/unsloth-QwQ-32B-Preview-loom
- GGUF base de Unsloth: https://huggingface.co/unsloth/QwQ-32B-Preview-GGUF
- Repositorio de Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
