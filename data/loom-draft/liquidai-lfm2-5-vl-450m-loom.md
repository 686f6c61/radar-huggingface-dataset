# loom-draft/LiquidAI-LFM2.5-VL-450M-loom

## Resumen

LiquidAI-LFM2.5-VL-450M-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado por el usuario `loom-draft` a partir del checkpoint GGUF sin modificar LiquidAI/LFM2.5-VL-450M-GGUF, concretamente del fichero `LFM2.5-VL-450M-Q4_K_M.gguf`. No se trata de un modelo nuevo ni de un ajuste fino: los pesos son los originales de Liquid AI, cuantizados en Q4_K_M, y lo que aporta este repositorio es el artefacto de empaquetado y los kernels generados para ejecutarlos sobre GPUs AMD concretas mediante el runtime `loom-serve`.

El problema que resuelve es de portabilidad y despliegue: permite servir el modelo multimodal de 450 millones de parametros de Liquid AI sobre AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) sin pasar por llama.cpp, usando un servidor compatible con la API de chat completions de OpenAI en `/v1/chat/completions`. El paquete lo genera `loom-next` de forma automatica, sin intervencion de un LLM en el bucle.

La relevancia es acotada y muy especifica: es un artefacto de infraestructura para el ecosistema Loom sobre hardware AMD, no una propuesta de modelo. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y las mediciones de rendimiento y las puertas de correccion (`gates.sh`) aparecen como "not yet re-measured" en ambas GPUs, por lo que no hay evidencia publicada de rendimiento ni de equivalencia numerica frente a llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del modelo base LiquidAI/LFM2.5-VL-450M; el paquete no la detalla) |
| Parametros totales | 450M (segun el nombre del modelo base) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | 128.000 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico fichero GGUF empaquetado) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; consultar terminos de Liquid AI) |
| Formato de pesos | GGUF (`LFM2.5-VL-450M-Q4_K_M.gguf`) empaquetado como programas `.loom` y `weights.loom` |

Otros datos del paquete: concurrencia de 4 peticiones simultaneas, maximo de 4096 tokens de salida (preset `max_tokens`), API estilo OpenAI, y soporte de muestreo marcado como "not determined" en la model card.

## Arquitectura y entrenamiento

El paquete no entrena ni modifica el modelo: reutiliza el checkpoint GGUF Q4_K_M de LiquidAI/LFM2.5-VL-450M-GGUF y genera, mediante `loom-next`, programas `.loom` y kernels especificos para las arquitecturas AMD gfx1151 y gfx1201. La model card no documenta la arquitectura interna del modelo base (tipo de transformer, atencion, proyector visual), los datos de entrenamiento, el numero de tokens ni si hubo RLHF o DPO; toda esa informacion corresponde al repositorio original de Liquid AI, no a este.

La innovacion tecnica del paquete es de compilacion y despliegue, no de modelado: kernels generados y verificados contra implementaciones de referencia, un pool de memoria de respaldo fijo (`--pool_backing=fixed`) o elastico, precarga de parametros en host (`--parameter_mode=preload`), espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`) y un conjunto de puertas de correccion (kernel_tests, golden, compare, vision, consistency, spec, agent, sampling, logits, decision) que en esta version aparecen todas como no re-medidas.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Contexto de 128.000 tokens por peticion, adecuado para documentos largos.
- Concurrencia de hasta 4 peticiones simultaneas.
- Salida limitada a 4096 tokens por respuesta (preset `max_tokens`).
- Entrada de imagen: no soportada por Loom, aunque el modelo upstream si la tiene. El paquete no expone vision en inferencia.
- Tool calling: no aplicable en este paquete.
- Razonamiento / thinking mode y reasoning effort: no aplicables.
- Decodificacion especulativa: no aplicable.
- Entrada y salida de audio: no aplicable.
- Capacidades multilingues: no disponibles en la informacion del paquete.

## Casos de uso

- Despliegue local en estaciones AMD Strix Halo: servir el modelo con `loom-serve` sobre una APU Ryzen AI Max+ 395 para asistentes de texto en local, sin dependencia de CUDA ni de llama.cpp, usando el flujo `loom-fetch` + `loom-serve` documentado.
- Servicio en Radeon AI PRO R9700: ejecutar el mismo paquete en una GPU de 32 GB para atender hasta 4 peticiones concurrentes con contexto de 128k tokens, util en prototipos de analisis de documentos largos.
- Evaluacion de la cadena de herramientas Loom: validar la generacion automatica de kernels y el runtime `hrx-loom` frente a llama.cpp usando las puertas de correccion, aunque en esta version no haya mediciones registradas.
- Backend de chat para herramientas internas: al exponer `/v1/chat/completions`, se puede apuntar un cliente compatible con OpenAI al endpoint local `http://127.0.0.1:8080` para pruebas de integracion.
- Procesamiento por lotes de texto de hasta 128k tokens: resumenes o extraccion sobre documentos extensos en un modelo pequeno de 450M, con coste de memoria bajo gracias a la cuantizacion Q4_K_M.
- Banco de pruebas de portabilidad AMD: comparar el comportamiento del mismo GGUF bajo Loom y bajo llama.cpp en gfx1151 y gfx1201, una vez se registren las mediciones pendientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured", y todas las puertas de correccion figuran como "not yet re-measured". No hay datos de latencia, throughput ni comparativas numericas con llama.cpp para este paquete.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de un modelo de 450M, por lo que el peso de los parametros es del orden de unos pocos cientos de MB, pero el pool de memoria del preset y el contexto de 128k condicionan el consumo real, que la model card no cuantifica.
- GPUs objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPU de consumo: no disponible; el paquete esta generado para las dos arquitecturas AMD citadas y no se documenta soporte para otras.
- Despliegue: runtime Loom (`pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch`, `loom-serve`), con API compatible con OpenAI. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI en este paquete.
- Latencia y throughput: no disponibles (mediciones pendientes de re-ejecutar en ambas GPUs).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| LiquidAI-LFM2.5-VL-450M-loom (este paquete) | 450M | 128.000 tokens | GGUF Q4_K_M empaquetado en `.loom`, runtime Loom | other | Solo AMD gfx1151 y gfx1201; vision no soportada en Loom; sin mediciones publicadas |
| LiquidAI/LFM2.5-VL-450M-GGUF (modelo base) | 450M | no disponible en esta ficha | GGUF, ejecutable con llama.cpp y otros runtimes GGUF | other | Conserva la entrada de imagen del modelo original; no esta atado a hardware AMD concreto |
| Modelos GGUF de ~500M de otros autores | no disponible | no disponible | GGUF | variable | No se dispone de datos verificados en la informacion proporcionada |

La comparacion relevante es contra el propio modelo base: este paquete no anade capacidades (de hecho, pierde la entrada de imagen) y su valor esta en el runtime y en el soporte de hardware AMD especifico.

## Limitaciones y advertencias

- No es un modelo nuevo: los pesos son identicos al GGUF Q4_K_M de Liquid AI; cualquier limitacion del modelo base se hereda integra.
- Perdida de capacidad multimodal: la model card indica que la entrada de imagen no esta soportada por Loom, aunque el modelo upstream si la tiene.
- Sin evidencia de correccion: todas las puertas de `gates.sh` (golden, compare, vision, consistency, logits, sampling, agent, decision, kernel_tests) aparecen como no re-medidas, por lo que no hay verificacion publicada frente a llama.cpp.
- Sin datos de rendimiento: no hay latencia ni throughput medidos para ninguna de las dos GPUs.
- Soporte de hardware restringido: solo se documentan gfx1151 (Strix Halo) y gfx1201 (Radeon AI PRO R9700); no hay garantia en otras GPUs.
- Idiomas no declarados: no se puede confirmar cobertura multilingue.
- Muestreo no determinado: la model card marca la fila `sampling` como "not determined".
- Licencia "other" heredada: es necesario revisar los terminos del modelo base de Liquid AI antes de cualquier uso comercial.
- Madurez y adopcion nulas: 0 descargas y 0 likes, creado y actualizado el mismo dia (2026-11-19); tratarlo como artefacto experimental.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; en un modelo de 450M es esperable una fiabilidad limitada en tareas de razonamiento complejo.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/LiquidAI-LFM2.5-VL-450M-loom
- Modelo base GGUF: https://huggingface.co/LiquidAI/LFM2.5-VL-450M-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
