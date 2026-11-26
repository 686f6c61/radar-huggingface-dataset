# loom-draft/bartowski-nvidia_Nemotron-Cascade-2-30B-A3B-loom

## Resumen

`loom-draft/bartowski-nvidia_Nemotron-Cascade-2-30B-A3B-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `nvidia_Nemotron-Cascade-2-30B-A3B-Q4_K_M.gguf`, publicado por bartowski. No se trata de un modelo nuevo ni de un fine-tuning: es un artefacto de empaquetado orientado a la inferencia del modelo Nemotron Cascade 2 30B-A3B de NVIDIA sobre GPUs AMD concretas, el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El paquete lo publica el usuario `loom-draft` y se ha generado con `loom-next`, el generador del ecosistema Loom, sin intervención de un LLM en el bucle. Su relevancia es acotada pero específica: permite servir un modelo de 30B totales con arquitectura MoE (3B activos, segun el sufijo A3B del nombre) en hardware AMD de consumo y estación de trabajo mediante `loom-serve`, con una API compatible con OpenAI y una ventana de contexto declarada de 262.144 tokens por petición.

La información pública del repositorio es muy limitada: cero descargas, cero likes, sin pipeline declarado, sin idiomas listados y con todas las puertas de corrección y las mediciones de rendimiento marcadas como "not yet re-measured". La licencia declarada es MIT, heredada del empaquetado, aunque la del checkpoint original de NVIDIA debe verificarse por separado antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (según el sufijo A3B del checkpoint base); detalles de capas y atención no disponibles |
| Parametros totales | 30B (según el nombre del checkpoint base) |
| Parametros activos | 3B (según el sufijo A3B del checkpoint base) |
| Longitud de contexto | 262.144 tokens por petición (declarado en la tarjeta del paquete) |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones del checkpoint base no detalladas en esta ficha |
| Idiomas soportados | no disponible |
| Licencia | MIT (paquete Loom); licencia del checkpoint base no verificada en la información disponible |
| Formato de pesos | GGUF (Q4_K_M) empaquetado como paquete Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

El paquete no aporta información sobre la arquitectura interna del modelo base más allá de lo que sugiere su denominación: un transformer con mezcla de expertos de 30B parámetros totales y 3B activos por token. No se detallan el número de capas, la dimensión oculta, el número de expertos, la estrategia de enrutamiento ni el tipo de atención (completa, lineal o híbrida) en la documentación disponible.

Tampoco hay datos sobre el entrenamiento: número de tokens, composición del corpus, fases de RLHF o DPO, ni innovaciones técnicas del checkpoint original. Lo único documentado en esta tarjeta es el proceso de empaquetado: generación con `loom-next` de los kernels y programas `.loom` para gfx1151 y gfx1201, junto con un `model.json` y su lock, a partir del GGUF de bartowski sin modificar los pesos. La tarjeta menciona además un modo de razonamiento ("thinking") activado por defecto y desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`, lo que indica que el checkpoint base incorpora plantilla de chat con modo de pensamiento.

## Capacidades

- Generación de texto conversacional vía API compatible con OpenAI (`/v1/chat/completions`).
- Modo de razonamiento o "thinking" activado por defecto, desactivable por petición mediante `chat_template_kwargs`.
- Ventana de contexto de 262.144 tokens por petición, adecuada para documentos largos.
- Concurrencia de hasta 4 peticiones simultáneas según la configuración del preset.
- Límite de 4.096 tokens de salida por petición (preset `max_tokens`).
- Tool calling: no aplicable según la tarjeta del paquete.
- Decodificación especulativa: no aplicable.
- Entrada de imagen: no aplicable.
- Entrada y salida de audio: no aplicable.
- Ajuste de esfuerzo de razonamiento ("reasoning effort"): no aplicable.
- Muestreo (temperatura, top_k, semilla): estado "no determinado" en la tarjeta.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Servicio local de chat sobre GPU AMD: desplegar el paquete con `loom-serve` en una Radeon AI PRO R9700 o un Ryzen AI Max+ 395 y exponer un endpoint compatible con OpenAI para integrarlo en aplicaciones existentes sin cambiar el cliente.
- Procesamiento de documentos largos: con 262.144 tokens de contexto por petición, el modelo puede ingerir contratos, informes o bases de código extensas en una sola llamada, útil para resumen y extracción de información en entornos con hardware AMD.
- Razonamiento asistido con modo thinking: para tareas de análisis que se benefician de una cadena de pensamiento, dejando el modo activado por defecto y desactivándolo en consultas simples para reducir latencia.
- Evaluación de hardware AMD para inferencia LLM: el paquete sirve como banco de pruebas reproducible del stack Loom frente a llama.cpp sobre el mismo GGUF, con puertas de corrección definidas (kernels, golden, compare, consistency, sampling, logits).
- Prototipado en estación de trabajo con 32 GB de VRAM: la Radeon AI PRO R9700 permite mantener el checkpoint Q4_K_M en memoria de la GPU y atender hasta 4 peticiones concurrentes para equipos pequeños.
- Despliegue en equipos todo-en-uno con Strix Halo: el Ryzen AI Max+ 395 con memoria unificada permite ejecutar el modelo sin GPU discreta, adecuado para entornos de desarrollo, demos internas y pruebas de concepto.
- Integración en pipelines internos con cliente OpenAI: cualquier herramienta que hable el protocolo de OpenAI (SDKs, frameworks de agentes, gateways) puede apuntar a `http://127.0.0.1:8080/v1` sin adaptadores adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La tarjeta del paquete indica explícitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y para Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir todavía", y que todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPUs.

## Requisitos de hardware

- VRAM estimada: el checkpoint es Q4_K_M de un modelo de 30B parámetros totales; el tamaño exacto del archivo no se detalla en la información disponible, pero debe caber en los 32 GB de la Radeon AI PRO R9700 según el diseño del paquete.
- GPU soportadas explícitamente: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada).
- GPUs NVIDIA (A100, H100, RTX 4090): no soportadas por este paquete, que genera kernels para arquitecturas AMD gfx1151 y gfx1201.
- Despliegue: `loom-serve` del paquete `hrx-loom[hf]==0.2.0`, instalable con `pipx`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para este artefacto concreto.
- Opciones de servicio recomendadas en la tarjeta: `--pool_backing=fixed` (reserva fija del pool de memoria), `--parameter_mode=preload` (carga anticipada de pesos en host) y `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU, consume CPU mientras hay trabajo en vuelo).
- Latencia y throughput: no disponibles; las filas de rendimiento no se han vuelto a medir.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Este paquete (Nemotron Cascade 2 30B-A3B, Q4_K_M, Loom) | 30B totales / 3B activos | 262.144 tokens | MIT (paquete) | Paquete Loom para gfx1151 y gfx1201 | Rendimiento y corrección sin medir |
| `bartowski/nvidia_Nemotron-Cascade-2-30B-A3B-GGUF` | 30B totales / 3B activos | no disponible | no disponible | GGUF para llama.cpp y derivados | Checkpoint de origen, sin empaquetar |
| Alternativas de tamaño similar (p. ej. otros MoE de ~30B) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

La comparación con modelos de la misma categoría no puede completarse con rigor: la información disponible no incluye benchmarks ni especificaciones verificadas de alternativas, y el propio paquete carece de mediciones publicadas.

## Limitaciones y advertencias

- Artefacto de empaquetado, no un modelo original: cualquier limitación del checkpoint Nemotron Cascade 2 subyacente se hereda sin cambios.
- Sin evidencia de corrección publicada: todas las puertas (`golden`, `compare`, `consistency`, `sampling`, `logits`, etc.) figuran como no medidas, por lo que no hay garantía documentada de que la salida coincida con la referencia de llama.cpp.
- Sin mediciones de rendimiento: no se puede estimar latencia ni throughput a partir de la información disponible.
- Compatibilidad restringida a dos GPUs AMD concretas (gfx1151 y gfx1201); no es portable a NVIDIA ni a otras arquitecturas AMD sin regenerar el paquete.
- Tool calling no soportado según la tarjeta, lo que descarta flujos de agentes con funciones en este paquete.
- Sin soporte de imagen ni audio.
- Límite de 4.096 tokens de salida por petición, que puede ser insuficiente para generaciones largas.
- Concurrencia limitada a 4 peticiones simultáneas en el preset.
- Idiomas soportados no declarados: no se puede confirmar calidad en castellano ni en otros idiomas.
- Licencia: el paquete declara MIT, pero la licencia del checkpoint base de NVIDIA no se ha verificado en la información disponible; conviene comprobarla antes de uso comercial.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; deben evaluarse sobre el modelo base.
- Repositorio sin tracción (0 descargas, 0 likes) y creado recientemente: no hay evidencia de uso en producción ni de mantenimiento continuado.
- El modo thinking está activado por defecto, lo que incrementa el consumo de tokens y la latencia si no se desactiva explícitamente.

## Enlaces

- Repositorio del paquete en Hugging Face: https://huggingface.co/loom-draft/bartowski-nvidia_Nemotron-Cascade-2-30B-A3B-loom
- Checkpoint GGUF de origen (bartowski): https://huggingface.co/bartowski/nvidia_Nemotron-Cascade-2-30B-A3B-GGUF
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom (sitio del proyecto): https://loom-fun.github.io/loom-dev/
- Referencia del stack HRX / ROCm citada en la tarjeta: https://github.com/ROCm/hrx-system
