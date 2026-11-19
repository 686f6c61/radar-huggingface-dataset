# loom-draft/bartowski-xtools-at_Qwensploit-V2-9B-CyberSecurity-Qwen3.5-loom

## Resumen

`loom-draft/bartowski-xtools-at_Qwensploit-V2-9B-CyberSecurity-Qwen3.5-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado por el proyecto Loom a partir del checkpoint GGUF sin modificar `bartowski/xtools-at_Qwensploit-V2-9B-CyberSecurity-Qwen3.5-GGUF`, en su cuantización Q4_K_M. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de empaquetado que permite servir ese GGUF sobre GPUs AMD concretas: el APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es un fine-tune de la familia Qwen3.5 orientado a ciberseguridad, derivado de una cadena de conversiones y cuantizaciones de terceros (xtools-at → bartowski → loom-draft). La tarjeta declara capacidades multimodales (entrada de imagen y texto), razonamiento con modo *thinking* activado por defecto, tool calling al estilo OpenAI y decodificación especulativa MTP con profundidad 3.

Su relevancia es acotada y muy específica: demuestra el flujo de empaquetado de Loom para hardware AMD y ofrece un punto de entrada reproducible para servir un modelo de 9B con contexto de 262.144 tokens en GPUs Radeon consumer y de estación de trabajo. No obstante, el repositorio está vacío (0,0 GB), no tiene descargas ni *likes*, y todas las mediciones de rendimiento y correctitud figuran como "not yet re-measured".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer denso (familia Qwen3.5); detalles no disponibles |
| Parametros totales | 9B (según el nombre del checkpoint) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (checkpoint empaquetado); otras cuantizaciones del GGUF base no verificadas |
| Idiomas soportados | no disponibles |
| Licencia | other (sin texto de licencia en la información disponible) |
| Formato de pesos | GGUF (Q4_K_M) empaquetado como programa Loom; proyector multimodal `mmproj-...-bf16.gguf` |
| Pipeline | image-text-to-text |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Decodificacion especulativa | MTP, profundidad 3, activada por defecto |
| Hardware objetivo | AMD Ryzen AI Max+ 395 (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su pertenencia a la familia Qwen3.5 y de su naturaleza densa de 9B parámetros. El paquete Loom no modifica los pesos: empaqueta el GGUF Q4_K_M tal cual y añade kernels generados, un preset de memoria y una tarjeta `model.json`. El generador empleado es `loom-next`, que según la tarjeta opera "solo el generador, sin LLM en el bucle".

Respecto al entrenamiento del modelo subyacente (número de tokens, composición del dataset, uso de RLHF/DPO), no hay datos en la información proporcionada. Lo único verificable es la cadena de derivación: un fine-tune de ciberseguridad denominado `Qwensploit-V2-9B-CyberSecurity-Qwen3.5`, cuantizado por bartowski y posteriormente empaquetado por loom-draft. La innovación técnica destacable del paquete es la integración de decodificación especulativa MTP (profundidad 3) activada por defecto y un pool de memoria de tamaño fijo (`--pool_backing=fixed`) con precarga de parámetros (`--parameter_mode=preload`).

## Capacidades

- Generación de texto y razonamiento con modo *thinking* activado por defecto; se desactiva mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Entrada multimodal de imagen y texto mediante partes `image_url` al estilo OpenAI, con proyector `mmproj-xtools-at_Qwensploit-V2-9B-CyberSecurity-Qwen3.5-bf16.gguf`.
- Tool calling al estilo OpenAI (`tools` y `tool_calls`), con bucle multi-turno validado por la puerta `agent`.
- Decodificación especulativa MTP con profundidad 3, activada por defecto.
- API compatible con `/v1/chat/completions` de OpenAI.
- Concurrencia de 4 peticiones simultáneas.
- Contexto de 262.144 tokens por petición.
- No soporta audio ni entrada/salida de voz.
- El "reasoning effort" no es aplicable en este paquete.
- El comportamiento de muestreo figura como "?" (no determinado) en la tabla de características.

## Casos de uso

- Análisis de alertas de seguridad: el modelo, afinado en ciberseguridad, puede recibir capturas de pantalla de paneles SIEM o consolas junto con texto explicativo y generar un resumen del incidente, aprovechando la entrada de imagen y el contexto de 262.144 tokens para adjuntar logs extensos.
- Asistencia en triaje de vulnerabilidades: con tool calling puede consultar una API interna de CVEs y encadenar varias llamadas en un bucle agéntico, devolviendo una ficha priorizada; la puerta `agent` del paquete valida el renderizado exacto del prompt y la validez de las llamadas.
- Revisión de configuraciones y scripts: dado un volcado de configuración o un script, el modelo puede señalar prácticas inseguras y proponer alternativas, con el modo *thinking* activo para razonamiento paso a paso.
- Despliegue en estaciones de trabajo con GPU AMD: al estar empaquetado para gfx1151 y gfx1201, encaja en equipos con Ryzen AI Max+ 395 o Radeon AI PRO R9700 sin necesidad de stack CUDA, usando `loom-serve` como servidor compatible con OpenAI.
- Prototipado de asistentes con contexto largo: los 262.144 tokens permiten ingerir manuales de seguridad o documentación técnica completos y hacer preguntas sobre ellos en una sola petición.
- Evaluación comparativa de runtimes: el paquete incluye puertas de correctitud (`golden`, `compare`, `vision`, `spec`, `consistency`) pensadas para contrastar la salida contra llama.cpp token a token, lo que lo hace útil como banco de pruebas de kernels generados.
- Automatización de informes con imágenes: la combinación de entrada visual y tool calling permite generar informes a partir de capturas y publicarlos mediante una herramienta externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La tarjeta indica explícitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo y Radeon AI PRO R9700 "no se han vuelto a medir todavía", y todas las puertas de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`) figuran como "not yet re-measured".

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; un checkpoint de 9B en Q4_K_M ocupa del orden de 5-6 GB de pesos, más el proyector multimodal bf16 y el pool de memoria del preset, pero la tarjeta no publica cifras.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- No se mencionan GPU NVIDIA (A100, H100, RTX 4090) en la información disponible; el paquete está generado específicamente para AMD vía ROCm/hrx-system.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para este paquete concreto, aunque la referencia de correctitud es llama.cpp.
- Ajustes de rendimiento documentados: `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU), `--pool_backing=fixed` (pool comprometido por adelantado) y `--parameter_mode=preload` (precarga de pesos en host).
- Latencia y throughput: no disponibles; la tarjeta no incluye cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este paquete (Qwensploit-V2-9B-CyberSecurity-Qwen3.5, Loom Q4_K_M) | 9B | 262.144 | other | GGUF empaquetado Loom | Solo AMD gfx1151/gfx1201; sin métricas publicadas |
| bartowski/xtools-at_Qwensploit-V2-9B-CyberSecurity-Qwen3.5-GGUF | 9B | no disponible en la información | other | GGUF | Checkpoint de origen, sin empaquetar; portable a otros runtimes |
| Qwen3.5 base (familia) | no disponible | no disponible | no disponible | no disponible | Modelo de partida del fine-tune; sin datos concretos en la información |

No se dispone de datos de rendimiento comparado para establecer diferencias cuantitativas con alternativas de la misma categoría.

## Limitaciones y advertencias

- Repositorio vacío (0,0 GB) y sin descargas ni *likes*: el artefacto podría no estar materializado o ser un borrador; conviene verificar los ficheros antes de usarlo.
- Todas las puertas de correctitud y rendimiento figuran como no re-medidas; no hay garantía publicada de equivalencia con llama.cpp para este paquete.
- Licencia "other" sin texto visible: es imprescindible consultar los términos del modelo base y del fine-tune antes de cualquier uso comercial.
- Modelo especializado en ciberseguridad y con nombre "Qwensploit": puede generar contenido ofensivo o dual; requiere políticas de uso y filtros en producción.
- Riesgo de alucinación no cuantificado; no hay benchmarks publicados que lo acoten.
- Idiomas soportados no declarados; el comportamiento multilingüe no está verificado.
- El modo *thinking* está activado por defecto, lo que incrementa la latencia y el consumo de tokens de salida; el límite de 4.096 tokens de salida puede truncar razonamientos largos.
- Solo 4 peticiones concurrentes: no apto para despliegues de alta concurrencia sin escalado horizontal.
- Dependencia de hardware AMD específico (gfx1151, gfx1201) y del runtime `hrx-loom` 0.2.0; no hay soporte documentado para otras GPU.
- Cadena de derivación de terceros (xtools-at → bartowski → loom-draft): la procedencia y las modificaciones intermedias no están auditadas en la información disponible.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/bartowski-xtools-at_Qwensploit-V2-9B-CyberSecurity-Qwen3.5-loom
- Checkpoint GGUF de origen: https://huggingface.co/bartowski/xtools-at_Qwensploit-V2-9B-CyberSecurity-Qwen3.5-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
