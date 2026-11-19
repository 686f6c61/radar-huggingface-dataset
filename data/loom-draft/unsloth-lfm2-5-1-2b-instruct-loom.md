# loom-draft/unsloth-LFM2.5-1.2B-Instruct-loom

## Resumen

LFM2.5-1.2B-Instruct-loom es un paquete de despliegue publicado por el usuario loom-draft que empaqueta el checkpoint GGUF sin modificar `LFM2.5-1.2B-Instruct-Q4_K_M.gguf` (procedente de `unsloth/LFM2.5-1.2B-Instruct-GGUF`) en el formato propietario de Loom (`.loom` programs y un `model.json`). No es un modelo nuevo ni un fine-tuning: los pesos son los originales del modelo base LFM2.5-1.2B-Instruct de Liquid AI, cuantizados a Q4_K_M. El autor lo genera con la herramienta `loom-next`, sin intervención de un LLM en el proceso.

El objetivo es ejecutar el modelo sobre GPUs AMD concretas: el APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB), mediante el runtime `loom-serve` de `hrx-loom`. El paquete expone una API compatible con OpenAI (`/v1/chat/completions`) con un contexto declarado de 128.000 tokens por petición, 4 peticiones concurrentes y un máximo de 4.096 tokens de salida.

La relevancia es acotada y de nicho: sirve como artefacto de despliegue para el ecosistema Loom sobre hardware AMD, no como una release de modelo. La model card no incluye mediciones de rendimiento ni evidencias de corrección registradas (todos los gates aparecen como "not yet re-measured"), y el propio autor advierte de que la información de rendimiento frente a llama.cpp está pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del modelo base LFM2.5-1.2B-Instruct; no se detalla en la informacion proporcionada) |
| Parametros totales | 1,2B (según el nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 128.000 tokens por petición (según la model card) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; no se detalla el texto) |
| Formato de pesos | GGUF de origen, empaquetado en programas `.loom` y `weights.loom` con `model.json` |

## Arquitectura y entrenamiento

El paquete no define arquitectura ni entrenamiento propios: es un artefacto de compilación/empaquetado del checkpoint `LFM2.5-1.2B-Instruct-Q4_K_M.gguf` de Liquid AI (distribuido por unsloth), generado con `loom-next`. La model card no describe la arquitectura interna del modelo base (transformer, híbrido u otra), ni los datos de entrenamiento, ni si hubo RLHF/DPO. Tampoco se documenta ninguna innovación técnica del modelo en sí.

La innovación del artefacto es de despliegue: genera programas `.loom` y un `model.json` que `loom-serve` ejecuta sobre AMD ROCm, con opciones de configuración concretas (`completion_spin_ns=4294967295` para espera activa de completions en GPU, `--pool_backing=fixed` para reservar el pool de memoria por adelantado y `--parameter_mode=preload` para precargar pesos en host). El paquete incluye `tokenizer.json`, `llm_config.json` e `info.json` con versiones y evidencia de gates.

## Capacidades

- Generación de texto conversacional vía API compatible con OpenAI (`/v1/chat/completions`).
- Contexto largo declarado: 128.000 tokens por petición.
- Concurrencia de hasta 4 peticiones simultáneas.
- Límite de salida de 4.096 tokens por petición (preset `max_tokens`).
- Tool calling: marcado como "not applicable" en la model card.
- Reasoning / thinking mode y reasoning effort: "not applicable".
- Decodificación especulativa: "not applicable".
- Entrada de imagen y audio: "not applicable".
- Muestreo (temperature, top_k, seed): estado "not determined".
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue local en Strix Halo: ejecutar `loom-fetch` y `loom-serve` para servir el modelo en un APU Ryzen AI Max+ 395 con API OpenAI, útil para prototipos de chat en hardware integrado AMD sin GPU dedicada.
- Despliegue en Radeon AI PRO R9700: servir el modelo en una GPU de 32 GB para entornos de desarrollo con ROCm, aprovechando el pool de memoria fijo para evitar crecimiento elástico impredecible.
- Evaluación del runtime Loom: usar el paquete como banco de pruebas de `loom-serve` frente a llama.cpp con el mismo GGUF, comparando tokens greedy y log-probs (gates `golden` y `compare`).
- Integración en pipelines con cliente OpenAI: al exponer `/v1/chat/completions`, se puede apuntar cualquier SDK compatible con OpenAI a `http://127.0.0.1:8080` para tareas de generación de texto en local.
- Procesamiento de documentos largos: el contexto declarado de 128.000 tokens permite resumir o extraer información de documentos extensos en una sola petición, siempre que se valide la calidad real del modelo base.
- Servicio de chat interno de baja concurrencia: con 4 peticiones concurrentes y 4.096 tokens de salida, encaja en herramientas internas de asistencia o clasificación de texto donde el throughput no es crítico.
- Reproducibilidad de despliegues: el `model.json.lock` con hashes sha256 de los ficheros fuente permite reconstruir el entorno exacto en otra máquina AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todos los gates de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured".

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el checkpoint es Q4_K_M de 1,2B parámetros, lo que en la práctica supone del orden de 1 GB o menos para los pesos, pero el paquete no publica la cifra.
- GPU soportadas de forma explícita: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPUs consumer: no documentada; el paquete está orientado a las dos plataformas AMD citadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles; las tablas de rendimiento están pendientes de medición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM2.5-1.2B-Instruct-loom (este paquete) | 1,2B | 128.000 tokens | `.loom` + GGUF Q4_K_M | other | Empaquetado para AMD Strix Halo y R9700; sin benchmarks publicados |
| unsloth/LFM2.5-1.2B-Instruct-GGUF (modelo base) | 1,2B | no disponible en la informacion | GGUF | other | Checkpoint original sin empaquetar; ejecutable con llama.cpp |
| Alternativas de 1-2B con contexto largo | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo nuevo: los pesos son idénticos al GGUF Q4_K_M de `unsloth/LFM2.5-1.2B-Instruct-GGUF`; cualquier limitación del modelo base aplica aquí.
- Sin evidencia de corrección: todos los gates de la model card están sin re-medir, por lo que no hay garantía publicada de equivalencia con llama.cpp en esta build.
- Sin benchmarks de rendimiento: no se puede afirmar throughput ni latencia frente a llama.cpp en ninguna de las dos GPUs objetivo.
- Tool calling, reasoning, visión y audio marcados como "not applicable"; no sirve para flujos agénticos ni multimodales.
- Muestreo sin determinar: el comportamiento de temperature, top_k y seed no está verificado.
- Licencia "other" sin texto detallado en la información disponible: es imprescindible revisar los términos del modelo base antes de cualquier uso comercial.
- Idiomas soportados no documentados: no se puede asumir calidad multilingüe sin evaluación propia.
- Riesgo de alucinación y sesgos: no documentados en la model card; deben evaluarse sobre el modelo base.
- Dependencia de hardware y runtime específicos: el paquete está atado a `hrx-loom==0.2.0` y a las arquitecturas gfx1151/gfx1201; no es portable a otras GPUs sin regeneración.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de mantenimiento o validación comunitaria.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/unsloth-LFM2.5-1.2B-Instruct-loom
- Modelo base (GGUF): https://huggingface.co/unsloth/LFM2.5-1.2B-Instruct-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
