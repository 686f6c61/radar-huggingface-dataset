# loom-draft/unsloth-granite-4.1-30b-loom

## Resumen

`loom-draft/unsloth-granite-4.1-30b-loom` es un paquete de despliegue en formato Loom (`.loom` y `model.json`) generado automáticamente con la herramienta `loom-next` a partir del checkpoint GGUF sin modificar `granite-4.1-30b-Q4_K_M.gguf` publicado por Unsloth. No es un modelo nuevo ni un fine-tuning: es un artefacto de empaquetado que traduce los pesos GGUF de IBM Granite 4.1 30B a programas Loom ejecutables sobre la pila `hrx-loom` (versión 0.2.0) en GPUs AMD.

El objetivo es servir el modelo con una API compatible con OpenAI (`/v1/chat/completions`) directamente sobre hardware AMD consumer y profesional: Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB). Se trata de un proyecto de nicho, con cero descargas y cero likes en el momento de redactar esta ficha, generado sin intervención de un LLM en el bucle de generación.

La relevancia es acotada: sirve como ejemplo de empaquetado reproducible de un modelo abierto para el ecosistema ROCm/AMD y como vía alternativa a llama.cpp en ese hardware. La model card no incluye mediciones de rendimiento ni evidencia de los gates de corrección para este paquete concreto (todos marcados como "not yet re-measured").

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (hereda la del checkpoint base IBM Granite 4.1 30B; el paquete Loom no la documenta) |
| Parametros totales | no disponible en la informacion proporcionada (el nombre del checkpoint base indica 30B) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico checkpoint empaquetado: `granite-4.1-30b-Q4_K_M.gguf`) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF de origen, convertido a programas Loom (`.loom`) con `model.json`, `tokenizer.json` y `llm_config.json` |

Otros parametros operativos declarados en la model card:

| Parametro | Valor |
|---|---|
| Peticiones concurrentes | 4 |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| API | OpenAI-style `/v1/chat/completions` en `127.0.0.1:8080` |
| Herramientas de despliegue | `hrx-loom[hf]==0.2.0`, `loom-fetch`, `loom-serve` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 (gfx1151), AMD Radeon AI PRO R9700 (gfx1201) |
| Fecha de creacion | 2026-11-19 |

## Arquitectura y entrenamiento

El paquete no entrena ni modifica el modelo: parte del GGUF `granite-4.1-30b-Q4_K_M.gguf` de Unsloth y genera programas Loom (`program/*.loom`, `weights.loom`) mediante `loom-next`, que según la model card se ejecuta "sin LLM en el bucle". La generación toma como entrada `llm_config.json` y produce kernels y planes de ejecución específicos para las arquitecturas AMD gfx1151 y gfx1201.

No se documentan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO), ni innovaciones técnicas del propio modelo. La única información arquitectónica relevante del empaquetado es la del runtime: pool de memoria de respaldo fijo (`--pool_backing=fixed`), precarga de parámetros en host (`--parameter_mode=preload`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`). La model card indica explícitamente que las filas de rendimiento se midieron sin `--parameter_mode=preload` salvo que el job lo usara.

## Capacidades

- Generación de texto conversacional vía API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls`.
- Soporte de bucles de tool calling multi-turno (existe un gate `agent` que valida renderizado exacto del prompt, reutilización de historial y validez de las llamadas).
- Contexto de 131.072 tokens por petición.
- Concurrencia de hasta 4 peticiones simultáneas.
- Sin modo de razonamiento ni "thinking": la model card marca `reasoning / thinking` y `reasoning effort` como "not applicable".
- Sin decodificación especulativa ("not applicable").
- Sin entrada de imagen ni audio.
- Multilingüismo: no disponible en la información proporcionada.
- Muestreo (`temperature`, `top_k`, `seed`): marcado como "not determined" en la tabla de features, aunque existe un gate `sampling` que lo validaría.

## Casos de uso

- Servicio de chat local en estación de trabajo AMD: levantar `loom-serve` sobre una Radeon AI PRO R9700 y exponer un endpoint compatible con OpenAI para integrarlo en herramientas que ya hablan ese protocolo, sin reescribir clientes.
- Asistente con contexto largo: análisis de documentos de hasta 131.072 tokens (informes, bases de código, expedientes) en una sola petición, aprovechando la ventana completa declarada.
- Agentes con herramientas: pipelines que requieran `tool_calls` encadenados (consulta de APIs, ejecución de comandos, recuperación de datos) validados por el gate `agent` del ecosistema Loom.
- Prototipado en hardware consumer AMD: usar Strix Halo (gfx1151) como banco de pruebas para desarrolladores que no disponen de GPUs NVIDIA y quieren un endpoint OpenAI-like.
- Evaluación comparativa frente a llama.cpp: el paquete incluye gates de corrección (`golden`, `compare`, `logits`, `consistency`) pensados para contrastar token a token contra la referencia de llama.cpp sobre el mismo GGUF; útil para validar la fidelidad del runtime Loom.
- Despliegue de bajo presupuesto en cuantización Q4_K_M: servir el modelo en 4 bits para reducir huella de memoria frente al checkpoint en precisión completa, con concurrencia limitada a 4 peticiones.
- Reproducibilidad de artefactos: `loom-fetch` verifica sha256 de los ficheros fuente fijados en `model.json.lock`, lo que permite reconstruir el paquete en otra máquina con garantías de integridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de rendimiento para este paquete "are not yet re-measured" tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201), y que todos los gates de corrección figuran como "not yet re-measured", es decir, sin evidencia registrada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el checkpoint es Q4_K_M de un modelo de 30B, lo que sitúa los pesos en el orden de decenas de GB, pero la model card no publica la cifra exacta de memoria reservada por el preset.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPUs NVIDIA (A100, H100, RTX 4090): no soportadas por este paquete, que genera kernels para arquitecturas AMD concretas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Presets diferenciados por GPU: `chat` para Strix Halo y `chat-r9700` para R9700.
- Latencia y throughput: no disponibles; las mediciones no se han vuelto a realizar para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `loom-draft/unsloth-granite-4.1-30b-loom` | 30B (segun nombre del base) | 131.072 | Loom (desde GGUF Q4_K_M) | Apache 2.0 | Solo AMD gfx1151/gfx1201; sin benchmarks publicados |
| `unsloth/granite-4.1-30b-GGUF` | 30B | no disponible | GGUF | Apache 2.0 (heredada) | Checkpoint base sin modificar; portable a llama.cpp y otros runtimes GGUF |
| IBM Granite 4.1 30B (modelo original) | 30B (segun nombre) | no disponible | safetensors (previsible) | Apache 2.0 (segun el paquete) | Pesos originales; arquitectura y datos de entrenamiento no detallados en la informacion disponible |

La comparación con alternativas de la misma categoría (otros modelos de 30B) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de nicho: cero descargas y cero likes en el momento de la ficha; generado automáticamente por `loom-next` sin revisión humana documentada.
- Sin evidencia de corrección: todos los gates (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured"; no hay prueba publicada de que la salida coincida con la referencia de llama.cpp.
- Sin mediciones de rendimiento: no se puede estimar latencia ni throughput a partir de la información disponible.
- Portabilidad nula: los programas Loom generados son específicos para gfx1151 y gfx1201; no funcionan en NVIDIA ni en otras GPUs AMD sin regeneración.
- Concurrencia limitada a 4 peticiones simultáneas y salida máxima de 4.096 tokens por preset.
- Sin modo de razonamiento ni decodificación especulativa; el muestreo está marcado como "not determined".
- Idiomas soportados no declarados: no se puede garantizar calidad multilingüe más allá de la del modelo base.
- Riesgo de alucinación: inherente al modelo base; no se documentan mitigaciones específicas en el paquete.
- Sesgos: no documentados en la información proporcionada.
- Licencia Apache 2.0 declarada, lo que en principio permite uso comercial, pero conviene verificar la licencia del checkpoint base de IBM y de Unsloth antes de producción.
- Fecha de creación futura (2026-11-19) respecto a la fecha habitual de consulta: conviene confirmar la vigencia del artefacto y de `hrx-loom==0.2.0`.

## Enlaces

- Hugging Face: https://huggingface.co/loom-draft/unsloth-granite-4.1-30b-loom
- Modelo base (GGUF): https://huggingface.co/unsloth/granite-4.1-30b-GGUF
- Repositorio del runtime: https://github.com/ROCm/hrx-system
- Generador Loom: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
