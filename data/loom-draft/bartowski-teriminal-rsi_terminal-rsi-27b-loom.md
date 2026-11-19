# loom-draft/bartowski-Teriminal-RSI_Terminal-RSI-27B-loom

## Resumen

El paquete `bartowski-Teriminal-RSI_Terminal-RSI-27B-loom` es una distribución en formato Loom del checkpoint GGUF `Teriminal-RSI_Terminal-RSI-27B-Q4_K_M.gguf`, publicado por el usuario `loom-draft`. No se trata de un modelo entrenado de cero, sino de un empaquetado (programas `.loom` y una tarjeta `model.json`) generado con la herramienta `loom-next` para ejecutar el GGUF original, sin modificarlo, sobre GPUs AMD concretas: la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente, según el nombre del checkpoint, tiene 27B de parámetros y es multimodal (pipeline `image-text-to-text`), con soporte de razonamiento con esfuerzo configurable, tool calling y decodificación especulativa MTP. El paquete expone un servidor compatible con la API de OpenAI (`/v1/chat/completions`) a través de `loom-serve`, con una ventana de contexto declarada de 262.144 tokens por petición.

La relevancia es de nicho: no aporta pesos nuevos ni mejoras de calidad respecto al GGUF base, sino una vía de despliegue optimizada para hardware AMD con aceleración ROCm, incluyendo decodificación especulativa activada por defecto y soporte de entrada de imagen mediante el proyector `mmproj-Teriminal-RSI_Terminal-RSI-27B-bf16.gguf`. No hay métricas de rendimiento ni de corrección publicadas para esta versión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de 27B; el paquete no documenta la arquitectura interna) |
| Parametros totales | 27B (según el nombre del checkpoint) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (GGUF); el proyector multimodal se distribuye en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Teriminal-RSI_Terminal-RSI-27B-Q4_K_M.gguf`) + proyector `mmproj-Teriminal-RSI_Terminal-RSI-27B-bf16.gguf`; empaquetado como programas `.loom` y `model.json` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base (transformer, MoE o híbrida), el volumen o composición de los datos de entrenamiento, ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card del paquete Loom no describe el checkpoint original; solo documenta el empaquetado y la ejecución.

Lo que sí se detalla es la capa de inferencia: `loom-serve` implementa kernels generados para AMD (gfx1151 y gfx1201), decodificación especulativa basada en MTP con profundidad 3 activada por defecto, y un modo de razonamiento con niveles `low`, `medium` y `xhigh` (por defecto `xhigh`). El paquete incluye además un conjunto de puertas de validación (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida contra una referencia de llama.cpp, aunque en esta versión todas aparecen como "not yet re-measured".

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activado por defecto, desactivable con `chat_template_kwargs: {"enable_thinking": false}`.
- Control del esfuerzo de razonamiento mediante `reasoning_effort` (`low`, `medium`, `xhigh`; por defecto `xhigh`).
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls`.
- Entrada de imagen (`image_url`) mediante el proyector multimodal bf16, con pipeline `image-text-to-text`.
- Decodificación especulativa MTP con profundidad 3, activada por defecto.
- Servidor compatible con la API de OpenAI (`/v1/chat/completions`).
- Concurrencia de hasta 4 peticiones simultáneas.
- Límite de 4.096 tokens de salida por petición (preset `max_tokens`).
- Sin soporte de audio (entrada ni salida).

## Casos de uso

- Asistente conversacional multimodal en local: el modelo acepta imágenes junto con texto y mantiene contexto de hasta 262.144 tokens, adecuado para analizar documentos escaneados o capturas y responder preguntas sobre ellos en una sola petición.
- Automatización de agentes con tool calling: el soporte de `tools`/`tool_calls` y las puertas de validación `agent` y `agent_think_off` permiten construir bucles multi-turno de llamadas a funciones sobre el endpoint compatible con OpenAI.
- Análisis de documentos largos: con 262.144 tokens de contexto se pueden procesar informes, expedientes o bases de código extensas sin trocear, útil en entornos donde los datos no pueden salir del equipo.
- Razonamiento con coste controlado: los niveles de `reasoning_effort` permiten ajustar el gasto computacional según la tarea, usando `low` para clasificación o extracción y `xhigh` para problemas de varios pasos.
- Despliegue en estaciones de trabajo AMD: orientado a equipos con Ryzen AI Max+ 395 o Radeon AI PRO R9700, permite servir el modelo en local con ROCm sin depender de CUDA.
- Inferencia con latencia reducida vía decodificación especulativa: el MTP con profundidad 3 activado por defecto busca acelerar la generación en las GPUs objetivo, útil en aplicaciones interactivas.
- Prototipado de asistentes con visión: la entrada de imagen vía `image_url` facilita construir demos de captioning, VQA o inspección visual de interfaces sin infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir" en esta versión, y que las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) tampoco tienen resultados registrados.

## Requisitos de hardware

- GPUs objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- VRAM estimada: no disponible de forma explícita; un checkpoint de 27B en Q4_K_M ronda los 16-17 GB de pesos, más el proyector bf16 y las estructuras de contexto, por lo que encaja en los 32 GB de la R9700 y en la memoria unificada del Strix Halo.
- Compatibilidad con GPU de consumo: no confirmada; el paquete está pensado para las dos GPUs AMD citadas y no documenta soporte para RTX 4090 u otras.
- Despliegue: `loom-serve` mediante `pipx install "hrx-loom[hf]==0.2.0"` y `loom-fetch`; opciones recomendadas `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295`.
- Latencia y throughput: no disponibles (sin mediciones publicadas para esta versión).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| bartowski-Teriminal-RSI_Terminal-RSI-27B-loom | 27B | 262.144 | Apache 2.0 | Paquete Loom para AMD gfx1151/gfx1201 | Empaquetado, no modelo nuevo; sin benchmarks publicados |
| bartowski/Teriminal-RSI_Terminal-RSI-27B-GGUF | 27B | no disponible | Apache 2.0 (heredada) | GGUF en Hugging Face | Checkpoint base sin empaquetar; ejecutable con llama.cpp |
| Alternativas de 27B-32B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables para comparar rendimiento |

No se dispone de información suficiente para establecer una comparativa de rendimiento con modelos de la misma categoría.

## Limitaciones y advertencias

- El paquete no incluye mediciones de rendimiento ni de corrección para esta versión: todas las puertas aparecen como "not yet re-measured", por lo que no hay garantía documentada de equivalencia con llama.cpp.
- Es un empaquetado de inferencia, no un modelo nuevo: la calidad, los sesgos y las capacidades reales dependen del checkpoint base, del que no se documenta arquitectura, datos ni alineación.
- Idiomas soportados no declarados; no se puede asumir un rendimiento multilingüe concreto.
- Restricción de hardware: orientado a GPUs AMD gfx1151 y gfx1201; no se documenta compatibilidad con CUDA ni con GPUs de consumo.
- Límite de 4.096 tokens de salida por petición y 4 peticiones concurrentes, lo que puede ser insuficiente en cargas de producción intensivas.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del checkpoint base antes de desplegar en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.
- Los resultados de búsqueda web devueltos corresponden a servicios no relacionados (Loom de grabación de pantalla y la marca de ropa Loom) y no aportan información sobre el modelo.

## Enlaces

- Hugging Face: https://huggingface.co/loom-draft/bartowski-Teriminal-RSI_Terminal-RSI-27B-loom
- Modelo base (GGUF): https://huggingface.co/bartowski/Teriminal-RSI_Terminal-RSI-27B-GGUF
- Repositorio Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
