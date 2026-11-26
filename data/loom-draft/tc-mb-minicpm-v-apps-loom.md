# loom-draft/tc-mb-MiniCPM-V-Apps-loom

## Resumen

`tc-mb-MiniCPM-V-Apps-loom` es un paquete de despliegue para el ecosistema Loom (herramienta de inferencia sobre GPUs AMD basada en ROCm) que empaqueta el checkpoint GGUF sin modificar `tc-mb/MiniCPM-V-Apps-GGUF`, concretamente el fichero `MiniCPM-OCR-1.0/MiniCPM-OCR-1_0-Q4_K_M.gguf`. Lo publica el usuario `loom-draft` y no contiene pesos propios: genera programas `.loom`, un `model.json` y el tokenizador a partir del GGUF de referencia mediante el generador `loom-next`, sin intervención de un LLM en el proceso.

El objetivo del paquete es servir el modelo MiniCPM-V-Apps (en su variante OCR) sobre dos aceleradores AMD concretos: la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB). Expone una API compatible con OpenAI (`/v1/chat/completions`), soporta tool calling al estilo OpenAI y mantiene el modo de razonamiento siempre activo, con una ventana de contexto declarada de 262.144 tokens por petición y hasta 4 peticiones concurrentes.

Su relevancia es acotada pero específica: es una pieza de infraestructura para quien quiera ejecutar un modelo MiniCPM-V orientado a OCR en hardware AMD consumer o profesional sin depender de llama.cpp, comparando su corrección contra referencias de llama.cpp. El repositorio es de tamaño 0,0 GB y no registra descargas ni likes en el momento de la consulta, y las mediciones de rendimiento y las puertas de corrección figuran como "not yet re-measured".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete no la documenta; hereda la del GGUF base MiniCPM-V-Apps) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantización | Q4_K_M (checkpoint empaquetado) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (origen) y programas `.loom` + `weights.loom` generados |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base: el paquete es un artefacto de despliegue, no una model card de entrenamiento. El checkpoint de origen es `tc-mb/MiniCPM-V-Apps-GGUF`, en su fichero `MiniCPM-OCR-1.0/MiniCPM-OCR-1_0-Q4_K_M.gguf`, lo que sitúa al modelo en la familia MiniCPM-V orientada a tareas de OCR y procesamiento de documentos, cuantizado en Q4_K_M.

El paquete en sí se genera con `loom-next`, que produce programas `.loom` (kernels y grafo de ejecución) a partir de `llm_config.json` y del tokenizador, junto con `model.json` y `model.json.lock` que fijan los ficheros de origen con verificación sha256 en `loom-fetch`. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF/DPO. Tampoco se declaran innovaciones como decodificación especulativa: la tabla de características marca "speculative decoding: not applicable" y "reasoning effort: not applicable".

## Capacidades

- Generación de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling al estilo OpenAI, con campos `tools` y `tool_calls`.
- Modo de razonamiento ("thinking") siempre activo, sin control de esfuerzo de razonamiento.
- Contexto largo: 262.144 tokens por petición según la tabla de características.
- Concurrencia de hasta 4 peticiones simultáneas.
- Límite de 4.096 tokens de salida por petición (preset `max_tokens`).
- Entrada de imagen: no soportada por Loom, aunque el modelo de origen sí la tiene.
- Entrada y salida de audio: no determinado.
- Muestreo (sampling): no determinado en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Procesamiento de documentos con OCR: el modelo de origen está orientado a OCR (`MiniCPM-OCR-1.0`), por lo que el paquete serviría para extraer texto de documentos, aunque la entrada de imagen no está soportada por Loom y habría que validar el flujo antes de usarlo en producción.
- Asistente conversacional con contexto largo: con 262.144 tokens por petición, permite mantener conversaciones multi-turno o analizar documentos de texto extensos sin truncar.
- Automatización con tool calling: la API expone `tools` y `tool_calls` al estilo OpenAI, lo que facilita integrarlo en orquestadores de agentes existentes sin adaptadores propios.
- Despliegue en hardware AMD de sobremesa: pensado para Ryzen AI Max+ 395 "Strix Halo" y Radeon AI PRO R9700, permite montar un servidor de inferencia local sobre ROCm sin GPU NVIDIA.
- Evaluación comparativa frente a llama.cpp: las puertas de corrección (`golden`, `compare`, `agent`, `logits`, etc.) están diseñadas para comparar token a token contra una referencia de llama.cpp sobre el mismo GGUF, útil para validar la fidelidad de la implementación Loom.
- Servicio interno de bajo volumen: con 4 peticiones concurrentes y un máximo de 4.096 tokens de salida, encaja en entornos de desarrollo, pruebas o equipos pequeños más que en producción de alta carga.
- Integración vía `curl` o clientes OpenAI: el endpoint estándar permite conectarlo a cualquier SDK compatible con OpenAI sin cambios de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las mediciones de rendimiento para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured".

## Requisitos de hardware

- VRAM estimada: no disponible. El paquete está pensado para la APU Ryzen AI Max+ 395 "Strix Halo" (memoria unificada) y para la Radeon AI PRO R9700 con 32 GB de VRAM.
- GPU recomendadas: AMD Ryzen AI Max+ 395 (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB), las dos únicas configuraciones documentadas.
- GPU consumer: no se documenta compatibilidad con GPUs consumer de NVIDIA ni con otras GPUs AMD distintas de las citadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` para materializar el paquete y `loom-serve` para servirlo. Opciones relevantes: `--materialize=copy`, `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed` y `--parameter_mode=preload`.
- Latencia y throughput: no disponibles; las mediciones no se han vuelto a realizar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tc-mb-MiniCPM-V-Apps-loom | no disponible | 262.144 tokens | sin mediciones publicadas | MIT | Hugging Face (repo de 0,0 GB, 0 descargas) |
| tc-mb/MiniCPM-V-Apps-GGUF (base) | no disponible | no disponible | no disponible | no disponible en la información | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- El paquete no incluye pesos: el repositorio ocupa 0,0 GB y depende de la descarga del GGUF de origen mediante `loom-fetch`.
- No hay mediciones de rendimiento ni evidencias de corrección registradas: todas las puertas figuran como "not yet re-measured", por lo que no existe validación publicada de fidelidad frente a llama.cpp.
- La entrada de imagen no está soportada por Loom, pese a que el modelo de origen es multimodal; esto limita el uso OCR directo.
- El modo de razonamiento está siempre activo y no se puede ajustar el esfuerzo, lo que puede incrementar la latencia y el consumo de tokens en tareas simples.
- Límite de 4.096 tokens de salida por petición y de 4 peticiones concurrentes, insuficiente para cargas de producción altas.
- Compatibilidad de hardware restringida a Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no se documentan otras GPUs.
- Idiomas soportados no declarados; no se puede garantizar cobertura multilingüe.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Licencia MIT declarada, lo que en principio permite uso comercial, pero conviene verificar la licencia del checkpoint base `tc-mb/MiniCPM-V-Apps-GGUF`, que no se detalla.
- Repositorio sin descargas ni likes y creado recientemente (26 de noviembre de 2026), sin evidencia de uso en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/tc-mb-MiniCPM-V-Apps-loom
- Modelo base: https://huggingface.co/tc-mb/MiniCPM-V-Apps-GGUF
- Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
