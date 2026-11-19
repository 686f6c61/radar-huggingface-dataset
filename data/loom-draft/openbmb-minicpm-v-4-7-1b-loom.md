# loom-draft/openbmb-MiniCPM-V-4.7-1B-loom

## Resumen

Loom package para el checkpoint GGUF `openbmb/MiniCPM-V-4.7-1B-GGUF` (variante Q4_K_M), generado por el usuario `loom-draft` con la herramienta `loom-next` sin intervención de un LLM en el bucle. No se trata de un modelo nuevo ni de un fine-tune: es un artefacto de despliegue que empaqueta los pesos originales de MiniCPM-V 4.7 1B en el formato propietario Loom (programas `.loom` y una tarjeta `model.json`), pensado para ejecutarse sobre GPUs AMD mediante el runtime `hrx-loom`.

El modelo subyacente, MiniCPM-V 4.7 1B de OpenBMB, es un modelo multimodal ligero de aproximadamente 1.000 millones de parámetros. Sin embargo, esta distribución concreta elimina la capacidad de entrada de imagen: el runtime Loom no soporta visión, aunque el modelo original sí. Lo que queda es un LLM de texto de 1B con tool calling, modo de razonamiento siempre activo y una ventana de contexto declarada de 262.144 tokens por petición.

Su relevancia es acotada y muy específica: sirve como banco de pruebas y ejemplo de despliegue del ecosistema Loom sobre hardware AMD (Ryzen AI Max+ 395 "Strix Halo" y Radeon AI PRO R9700). El repositorio tiene 0 descargas, 0 likes, 0 GB de tamaño declarado y fue creado el 19 de noviembre de 2026, sin mediciones de rendimiento ni de corrección registradas todavía.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base MiniCPM-V 4.7 1B; el paquete Loom no detalla la arquitectura interna) |
| Parámetros totales | ~1B (según el nombre del modelo base; no confirmado en la información disponible) |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantización | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (empaquetado como programas `.loom` y `weights.loom`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, los datos de entrenamiento, el número de tokens vistos ni las etapas de alineación (RLHF/DPO) del modelo base MiniCPM-V 4.7 1B en la documentación proporcionada. La model card del paquete Loom solo describe el proceso de generación del artefacto de despliegue, no el entrenamiento del modelo.

Lo que sí se documenta es la innovación a nivel de despliegue: `loom-next` genera programas `.loom` y kernels específicos para las arquitecturas AMD gfx1151 (Strix Halo) y gfx1201 (Radeon AI PRO R9700) a partir de la configuración del modelo (`llm_config.json`). El runtime `hrx-loom` 0.2.0 expone una API compatible con OpenAI, soporta 4 peticiones concurrentes y ofrece opciones de gestión de memoria (`--pool_backing=fixed`, `--parameter_mode=preload`) y espera activa de finalizaciones de GPU (`completion_spin_ns`). No se menciona decodificación especulativa (marcada como "not applicable") ni atención lineal.

## Capacidades

- Generación de texto conversacional vía `/v1/chat/completions` con formato OpenAI.
- Tool calling estilo OpenAI (`tools` y `tool_calls`), con bucle multi-turno de agentes.
- Modo de razonamiento/thinking siempre activo (no configurable por esfuerzo: "reasoning effort" no aplica).
- Contexto largo: 262.144 tokens por petición.
- Concurrencia de hasta 4 peticiones simultáneas.
- Salida máxima de 4.096 tokens (preset `max_tokens`).
- Entrada de imagen: no soportada por Loom, aunque el modelo original la tiene.
- Entrada/salida de audio: no aplica.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Muestreo (temperature, top_k, seed): estado "no determinado" en la model card.

## Casos de uso

- Despliegue de referencia en GPUs AMD: validar la cadena `loom-fetch` + `loom-serve` sobre Strix Halo o R9700 para comprobar que el runtime arranca, sirve peticiones y respeta la API OpenAI antes de pasar a modelos mayores.
- Asistente conversacional de texto en local: con 1B de parámetros en Q4_K_M y contexto de 262k tokens, encaja en escenarios de chat con documentos largos donde no se requiere visión.
- Agentes con tool calling en entornos controlados: el soporte de `tools`/`tool_calls` y el bucle multi-turno permiten prototipar orquestación de herramientas sin depender de APIs en la nube.
- Pruebas de integración de pipelines compatibles con OpenAI: al exponer `/v1/chat/completions`, se puede apuntar un cliente existente a `http://127.0.0.1:8080` y verificar compatibilidad sin cambiar código.
- Benchmarking de kernels generados: usar las puertas de corrección (`kernel_tests`, `golden`, `compare`, `agent`, `sampling`, `logits`, etc.) para medir la fidelidad del backend Loom frente a llama.cpp sobre el mismo GGUF.
- Evaluación de concurrencia: con 4 peticiones simultáneas y la puerta `consistency`, comprobar que las respuestas concurrentes coinciden con las ejecuciones aisladas en cargas de trabajo reales.
- Docencia y experimentación con cuantización Q4_K_M: estudiar el impacto de la cuantización de 4 bits en un modelo de 1B sobre tareas de razonamiento y tool calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las mediciones de rendimiento para Strix Halo y Radeon AI PRO R9700 "no se han vuelto a medir" y que todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured", es decir, sin evidencia registrada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; un GGUF Q4_K_M de ~1B parámetros ocupa del orden de 0,6-0,8 GB en pesos, pero el pool de memoria del preset y el contexto de 262k tokens incrementan el consumo real.
- GPUs soportadas oficialmente por el paquete: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPUs consumer: no confirmada; el paquete está orientado a las dos plataformas AMD citadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` para servir la API. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este artefacto concreto.
- Latencia y throughput: no disponibles (sin mediciones registradas).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| openbmb/MiniCPM-V-4.7-1B-GGUF (base) | ~1B | no disponible | Apache 2.0 | GGUF | Incluye entrada de imagen; referencia de corrección para Loom |
| loom-draft/openbmb-MiniCPM-V-4.7-1B-loom (este) | ~1B | 262.144 | Apache 2.0 | Loom (`.loom`, GGUF empaquetado) | Sin visión; API OpenAI; solo AMD gfx1151/gfx1201 |
| Alternativas de ~1B (p. ej. Llama 3.2 1B, Qwen2.5 1.5B) | ~1-1,5B | no disponible en esta ficha | varía | GGUF, safetensors | No comparadas en la información disponible |

No se dispone de datos de rendimiento comparativo entre estas opciones en la documentación proporcionada.

## Limitaciones y advertencias

- Sin visión: aunque el modelo base es multimodal, este paquete Loom no soporta entrada de imagen.
- Sin mediciones: rendimiento y corrección figuran como "not yet re-measured"; no hay evidencia publicada de que las salidas coincidan con llama.cpp.
- Muestreo no determinado: el estado de `temperature`, `top_k` y `seed` es "?" en la model card.
- Repositorio vacío o incompleto: 0 GB de tamaño declarado y 0 descargas; la model card parece truncada al final del apartado "Files".
- Dependencia de hardware muy específica: solo validado para AMD gfx1151 y gfx1201; no hay garantías en otras GPUs.
- Licencia Apache 2.0 heredada del modelo base, que permite uso comercial, pero el artefacto de despliegue depende del runtime `hrx-loom` y de la herramienta `loom-next`, cuyas condiciones no se detallan.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; un modelo de 1B en Q4_K_M tiene capacidad limitada de razonamiento frente a modelos mayores.
- Idiomas: no especificados; no se puede asumir un rendimiento multilingüe concreto.
- Nombre ambiguo: "Loom" colisiona con la herramienta de grabación de pantalla de Atlassian; los resultados de búsqueda web no aportan información técnica sobre este paquete.

## Enlaces

- Hugging Face: https://huggingface.co/loom-draft/openbmb-MiniCPM-V-4.7-1B-loom
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
