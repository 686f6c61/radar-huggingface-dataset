# loom-draft/unsloth-Ministral-3-3B-Reasoning-2512-loom

## Resumen

`loom-draft/unsloth-Ministral-3-3B-Reasoning-2512-loom` no es un modelo de lenguaje entrenado desde cero, sino un paquete de despliegue en formato Loom (`.loom` y un fichero `model.json`) que empaqueta el checkpoint GGUF `Ministral-3-3B-Reasoning-2512-Q4_K_M.gguf` publicado por Unsloth. El paquete lo genera la herramienta `loom-next` (sin LLM en el bucle) y está orientado a ejecutar el modelo sobre GPUs AMD concretas: el APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es un Ministral de 3B parámetros en su variante "Reasoning" con fecha de referencia 2512, distribuido por Unsloth en cuantización Q4_K_M. La licencia declarada es Apache 2.0. El paquete Loom expone el modelo mediante una API compatible con OpenAI (`/v1/chat/completions`) y fija parámetros de servicio concretos: 108.544 tokens de contexto por petición, 4 peticiones concurrentes y un máximo de 4.096 tokens de salida.

La relevancia de esta ficha es acotada: no aporta pesos nuevos ni mejoras de entrenamiento, sino una vía de ejecución nativa en hardware AMD mediante el runtime Loom. Los resultados de rendimiento y las puertas de corrección del paquete aparecen como "not yet re-measured" en la model card, por lo que no hay evidencia publicada de rendimiento ni de fidelidad frente a llama.cpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo subyacente Ministral-3-3B-Reasoning-2512; el paquete Loom no documenta la arquitectura interna) |
| Parámetros totales | 3B (según el nombre del checkpoint) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 108.544 tokens por petición (límite del preset Loom) |
| Tipos de cuantización | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF empaquetado en programas `.loom` (`program/*.loom`, `weights.loom`) |

## Arquitectura y entrenamiento

El paquete no documenta la arquitectura del modelo subyacente. Por el nombre del checkpoint (`Ministral-3-3B-Reasoning-2512`) se trata de un modelo Ministral de 3B parámetros en variante de razonamiento, pero la model card de este repositorio no incluye detalles sobre tipo de transformer, composición del dataset, número de tokens de entrenamiento ni si hubo RLHF, DPO u otras etapas de alineamiento. Esa información correspondería a la model card original del modelo, que no está disponible en la información proporcionada.

La aportación técnica de este repositorio es el empaquetado Loom: programas `.loom` generados por `loom-next` a partir del GGUF de Unsloth, un `model.json` con la configuración del preset y ficheros de tokenizador y configuración (`tokenizer.json`, `llm_config.json`). El runtime `loom-serve` (paquete `hrx-loom[hf]==0.2.0`) ejecuta esos programas sobre AMD ROCm y expone la API. El preset fija `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU), `--pool_backing=fixed` (pool de memoria reservado por adelantado) y `--parameter_mode=preload` (carga de pesos en host). No se documenta decodificación especulativa ni otras optimizaciones de inferencia.

## Capacidades

- Generación de texto y razonamiento: el checkpoint es una variante "Reasoning" de Ministral 3B, orientada a tareas que requieren cadenas de razonamiento.
- API compatible con OpenAI: endpoint `/v1/chat/completions` con formato estándar de mensajes.
- Concurrencia: hasta 4 peticiones simultáneas según el preset.
- Contexto largo: 108.544 tokens por petición, útil para documentos extensos.
- Límite de salida: 4.096 tokens por respuesta (parámetro `max_tokens` del preset).
- Tool calling: marcado como "not applicable" en la tabla de features del paquete Loom.
- Modo thinking / reasoning effort: marcado como "not applicable" en el paquete Loom, aunque el checkpoint de origen sea de razonamiento.
- Decodificación especulativa: marcada como "not applicable".
- Entrada de imagen: no soportada por Loom, aunque el modelo de origen la tenga según la propia model card.
- Audio: no aplica.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional local en estación de trabajo AMD: desplegar el paquete con `loom-serve` sobre una Radeon AI PRO R9700 y servir un chat interno con API compatible con OpenAI, sin depender de servicios en la nube.
- Procesamiento de documentos largos: gracias a los 108.544 tokens de contexto por petición, se pueden pasar contratos, informes o expedientes completos en una sola llamada para tareas de resumen o extracción.
- Prototipado de aplicaciones de razonamiento: usar la variante Reasoning del checkpoint para probar pipelines de cadena de pensamiento en local antes de escalar a modelos mayores.
- Evaluación de hardware AMD en ROCm: emplear el paquete como banco de pruebas para medir latencia y throughput de un modelo 3B Q4_K_M en Strix Halo o R9700 dentro del ecosistema Loom.
- Servicio de chat con concurrencia moderada: con 4 peticiones concurrentes configuradas, encaja en equipos de trabajo pequeños o entornos de demostración donde no se requiere alta disponibilidad.
- Integración en herramientas internas vía HTTP: al exponer `/v1/chat/completions`, se puede conectar a clientes que ya hablan el protocolo de OpenAI (por ejemplo, interfaces de chat o scripts de automatización) apuntando a `127.0.0.1:8080`.
- Generación de texto acotada: tareas de redacción o transformación de texto con salidas de hasta 4.096 tokens, suficiente para respuestas conversacionales e informes breves.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured".

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; un checkpoint de 3B en Q4_K_M ocupa del orden de 2 GB de pesos, pero el preset Loom reserva un pool de memoria fijo cuyo tamaño no se documenta.
- GPUs soportadas oficialmente por el paquete: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta soporte para GPUs de consumo; el paquete está orientado a las dos plataformas AMD citadas.
- Despliegue: runtime Loom (`pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch`, `loom-serve`). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete concreto.
- Concurrencia configurada: 4 peticiones simultáneas.
- Latencia y throughput: no disponibles; las mediciones del paquete no se han vuelto a realizar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| loom-draft/unsloth-Ministral-3-3B-Reasoning-2512-loom | 3B | 108.544 tokens por petición | Q4_K_M | Apache 2.0 | GGUF empaquetado en `.loom`, runtime Loom sobre AMD |
| unsloth/Ministral-3-3B-Reasoning-2512-GGUF (modelo base) | 3B | no disponible | GGUF (incluye Q4_K_M) | Apache 2.0 (según este paquete) | GGUF, ejecutable con llama.cpp y derivados |
| Otros modelos Ministral 3B | 3B | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es con el propio checkpoint de Unsloth del que deriva: este paquete no modifica los pesos, solo cambia el formato de ejecución y lo restringe a hardware AMD mediante Loom. No se dispone de datos de benchmarks para comparar rendimiento con alternativas.

## Limitaciones y advertencias

- No es un modelo nuevo: los pesos son idénticos al GGUF de Unsloth; cualquier limitación del modelo original se hereda.
- Sin evidencia de corrección: todas las puertas de validación del paquete figuran como "not yet re-measured", por lo que no hay garantía publicada de que la salida coincida con la referencia de llama.cpp.
- Sin datos de rendimiento: no se han publicado mediciones de latencia ni throughput en ninguna de las dos GPUs objetivo.
- Tool calling y modo thinking no disponibles en el paquete Loom ("not applicable"), a pesar de que el checkpoint de origen es de razonamiento.
- Entrada de imagen no soportada por Loom, aunque el modelo de origen la tenga.
- Idiomas soportados no documentados; no se puede garantizar calidad en castellano ni en otros idiomas.
- Riesgo de alucinación: inherente a un modelo de 3B parámetros; no hay evaluaciones publicadas que lo cuantifiquen.
- Sesgos: no documentados en la información disponible.
- Licencia Apache 2.0 declarada, lo que en principio permite uso comercial, pero conviene verificar la licencia del checkpoint original de Ministral en su repositorio de origen.
- Dependencia de un runtime específico (`hrx-loom==0.2.0`) y de hardware AMD concretos; no es portable a otras plataformas sin reempaquetar.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/unsloth-Ministral-3-3B-Reasoning-2512-loom
- Modelo base (GGUF de Unsloth): https://huggingface.co/unsloth/Ministral-3-3B-Reasoning-2512-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
