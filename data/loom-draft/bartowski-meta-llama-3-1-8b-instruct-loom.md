# loom-draft/bartowski-Meta-Llama-3.1-8B-Instruct-loom

## Resumen

Este repositorio no contiene un modelo nuevo entrenado desde cero, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf` de bartowski. Lo publica el usuario `loom-draft` y su función es permitir servir Llama 3.1 8B Instruct sobre GPUs AMD concretas mediante el runtime `loom-serve` (paquete `hrx-loom`), en lugar de usar llama.cpp u otros motores. El modelo subyacente es el conocido transformer denso de Meta con 8.000 millones de parámetros y 131.072 tokens de contexto, cuantizado en Q4_K_M.

La relevancia es de nicho pero clara: ofrece una vía de ejecución específica para hardware AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB), con API compatible con OpenAI, soporte de tool calling y cuatro peticiones concurrentes. No aporta mejoras de calidad sobre el GGUF original; su valor está en el empaquetado y en la integración con el ecosistema Loom.

Conviene subrayar que la model card indica explícitamente que las mediciones de rendimiento y las puertas de corrección (`kernel_tests`, `golden`, `compare`, `agent`, etc.) aún no se han vuelto a medir para este paquete, por lo que no hay evidencia publicada de paridad funcional con llama.cpp en esta versión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1), empaquetado como programas Loom sobre GGUF |
| Parametros totales | 8.000 millones (modelo base Llama 3.1 8B Instruct) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (única incluida en el paquete) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | MIT (según metadatos del repositorio) |
| Formato de pesos | GGUF de origen, empaquetado en ficheros `weights.loom` y programas `program/*.loom` |
| Tokens máximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultáneas |
| API | OpenAI-style `/v1/chat/completions` |
| Tool calling | soportado (formato OpenAI `tools` / `tool_calls`) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |
| Fecha de creación | 2026-11-26 |

## Arquitectura y entrenamiento

El modelo subyacente es Llama 3.1 8B Instruct, un transformer decoder-only denso de Meta con 8.000 millones de parámetros, alineado mediante instrucciones y con ventana de contexto nativa de 128K tokens (131.072 en esta configuración). No se ha realizado ningún ajuste fino adicional: el paquete Loom envuelve el GGUF Q4_K_M de bartowski sin modificarlo, tal como declara la model card.

La innovación técnica de este repositorio no está en el modelo sino en el empaquetado: `loom-next` genera programas `.loom` y un `model.json` con los ficheros fuente fijados por hash SHA-256 (verificado por `loom-fetch`), y `loom-serve` los ejecuta sobre AMDGPU con opciones como `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU), `--pool_backing=fixed` (pool de memoria comprometido por adelantado) y `--parameter_mode=preload`. No se documentan datos de entrenamiento, composición del dataset ni etapas de RLHF/DPO propias de este paquete, porque no las hay: son las del modelo original de Meta, no disponibles en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno con hasta 131.072 tokens de contexto por petición.
- Razonamiento, código y matemáticas heredados de Llama 3.1 8B Instruct (sin datos de benchmark en esta ficha).
- Tool calling en formato OpenAI (`tools` y `tool_calls`), validado por la puerta `agent` del banco de pruebas (aunque marcada como no re-medida).
- API compatible con OpenAI: endpoint `/v1/chat/completions` con `model` y `messages`.
- Concurrencia de 4 peticiones simultáneas.
- Límite de 4.096 tokens de salida por petición (preset `max_tokens`).
- Sin modo de razonamiento explícito (thinking), sin decodificación especulativa, sin entrada de imagen y sin audio: la model card marca estas capacidades como "not applicable".
- Multilingüismo: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional autoalojado en estaciones AMD: desplegar `loom-serve` en un Ryzen AI Max+ 395 o una Radeon AI PRO R9700 y consumir el endpoint `/v1/chat/completions` desde una interfaz tipo OpenAI, aprovechando los 131K tokens de contexto para conversaciones largas.
- Automatización de soporte técnico con contexto documental: ingerir manuales extensos (hasta ~131K tokens) en el prompt y mantener diálogos multi-turno con historial completo sin truncamiento.
- Agentes con herramientas en local: usar el soporte de `tools`/`tool_calls` para construir asistentes que consulten APIs internas, bases de datos o sistemas de ficheros mediante function calling, con el bucle multi-turno que valida la puerta `agent`.
- Generación y revisión de código en entornos con requisitos de privacidad: ejecutar el modelo en hardware AMD local para autocompletado, explicación de fragmentos o generación de tests sin enviar código a la nube.
- Procesamiento por lotes de documentos: con 4 peticiones concurrentes y ventana de 131K, resumir, clasificar o extraer información de contratos, informes o expedientes en un servidor con GPU AMD.
- Prototipado y evaluación de motores alternativos: comparar el comportamiento de `loom-serve` frente a llama.cpp usando las puertas de corrección (`golden`, `compare`, `sampling`, `logits`) cuando estén disponibles, para validar el runtime en producción.
- Investigación sobre runtimes GPU AMD: estudiar la generación automática de kernels (`program/*.loom`) y el modelo de memoria (`pool_backing=fixed`) en cargas de inferencia reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir" para este paquete, y que todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPUs.

## Requisitos de hardware

- VRAM estimada: el GGUF Q4_K_M de un modelo de 8B ocupa aproximadamente 4,9 GB de pesos; con overhead de contexto y pool fijo, se recomienda reservar al menos 8-12 GB de VRAM para contexto largo.
- GPUs soportadas explícitamente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: no se documenta soporte para GPUs de consumo (RTX 4090, RX 7900 XTX, etc.) en la información proporcionada; el paquete está orientado a las dos plataformas AMD citadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` para materializar el paquete y `loom-serve` para servir. No se mencionan vLLM, llama.cpp, Ollama ni TGI como alternativas para este paquete concreto.
- Opciones de servicio relevantes: `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed`, `--parameter_mode=preload`.
- Latencia y throughput: no disponibles; la model card no publica cifras para este paquete.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|---|
| loom-draft/bartowski-Meta-Llama-3.1-8B-Instruct-loom | 8B denso | 131.072 | Q4_K_M | MIT | Loom (`loom-serve`) sobre AMD gfx1151 / gfx1201 | Paquete de despliegue; sin benchmarks publicados |
| bartowski/Meta-Llama-3.1-8B-Instruct-GGUF | 8B denso | 131.072 | Múltiples (Q4_K_M entre ellas) | MIT (modelo base) | GGUF para llama.cpp y derivados | Referencia de pesos original; usado como base del paquete Loom |
| Meta-Llama-3.1-8B-Instruct (original) | 8B denso | 128K | BF16 / FP16 | Llama 3.1 Community License | safetensors (Transformers, vLLM, TGI) | Checkpoint de referencia de Meta; licencia distinta a la del paquete |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- El paquete no ha sido validado: todas las puertas de corrección y las mediciones de rendimiento figuran como no re-medidas, por lo que no hay evidencia publicada de que la salida coincida con llama.cpp.
- Licencia: el repositorio declara MIT, pero el modelo subyacente (Llama 3.1 8B Instruct) está sujeto a la Llama 3.1 Community License de Meta; conviene verificar la compatibilidad antes de uso comercial.
- Idiomas soportados: no disponible en la información proporcionada; no se puede confirmar cobertura multilingüe más allá de la del modelo original.
- Riesgo de alucinación inherente a un modelo de 8B: adecuado para tareas asistidas, pero no para decisiones críticas sin verificación humana.
- Sesgos: no documentados en este repositorio; heredados del modelo base de Meta.
- Límite de 4.096 tokens de salida por petición, lo que restringe la generación de documentos largos en una sola llamada.
- Solo 4 peticiones concurrentes; no apto para despliegues de alta concurrencia sin escalado horizontal.
- Sin modo de razonamiento, sin visión, sin audio y sin decodificación especulativa.
- Hardware restringido a dos plataformas AMD concretas; no se documenta compatibilidad con GPUs NVIDIA ni con GPUs AMD de consumo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que reduce la evidencia comunitaria disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/bartowski-Meta-Llama-3.1-8B-Instruct-loom
- Modelo base GGUF: https://huggingface.co/bartowski/Meta-Llama-3.1-8B-Instruct-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
