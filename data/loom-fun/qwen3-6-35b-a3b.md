# loom-fun/Qwen3.6-35B-A3B

## Resumen

`loom-fun/Qwen3.6-35B-A3B` es un paquete de despliegue para el runtime **AMD Loom**, no un conjunto de pesos. Contiene programas `.loom` y una tarjeta `model.json` (con su `model.json.lock`) que describen cómo ejecutar el checkpoint GGUF sin modificar `unsloth/Qwen3.6-35B-A3B-GGUF` en cuantización `Q4_K_M`. El autor, `loom-fun`, lo generó con el flujo de trabajo de la factoría `loom-skills` sobre una máquina AMD Ryzen AI Max+ 395 «Strix Halo», es decir, sobre un APU con memoria unificada en lugar de una GPU dedicada.

El repositorio no aloja pesos: `loom-fetch` (SDK de Loom con el extra `hf`) instala los programas desde este repositorio y descarga el GGUF desde el repositorio de unsloth, verificándolo contra el fichero de bloqueo. El servicio se levanta con `loom-serve --model=... --device=amdgpu --memory_bytes=... --listen=...`.

Su relevancia es acotada pero concreta: es una pieza de empaquetado reproducible para llevar un modelo de mezcla de expertos de gran tamaño (nomenclatura 35B con ~3B activos) a hardware AMD integrado, con licencia Apache 2.0 en ambos repositorios. La información publicada no documenta arquitectura, datos de entrenamiento, longitud de contexto ni resultados de benchmarks, y el repositorio no tiene descargas ni valoraciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la documenta; la nomenclatura «A3B» sugiere mezcla de expertos con ~3B parámetros activos, sin confirmar) |
| Parámetros totales | ~35 000 millones según la nomenclatura del nombre; no documentado en la información proporcionada |
| Parámetros activos | ~3000 millones según la nomenclatura «A3B»; no documentado en la información proporcionada |
| Longitud de contexto | no disponible |
| Tipos de cuantización | `Q4_K_M` (única referenciada en el paquete); otras cuantizaciones del repositorio base no listadas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Q4_K_M`) en el repositorio base; este repositorio entrega programas `.loom` y `model.json` + `model.json.lock`. Los pesos no se incluyen |
| Hardware de referencia | AMD Ryzen AI Max+ 395 «Strix Halo» (APU, memoria unificada) |
| Runtime de ejecución | AMD Loom (`loom-fetch`, `loom-serve`) |
| Modelo base | `unsloth/Qwen3.6-35B-A3B-GGUF` |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo subyacente. El nombre `Qwen3.6-35B-A3B` sigue la convención de nomenclatura de mezcla de expertos (total de parámetros seguido de parámetros activos), lo que situaría al modelo en torno a 35 000 millones de parámetros totales con aproximadamente 3000 millones activos por token, pero esta lectura procede únicamente del identificador y no está respaldada por documentación técnica en la información proporcionada. Tampoco se detallan el número de tokens de entrenamiento, la composición del corpus ni si hubo fases de RLHF, DPO u otro ajuste por preferencias.

Lo que sí está documentado es la capa de empaquetado: los programas `.loom` y la tarjeta `model.json` se generaron con el flujo `loom-skills` sobre un Ryzen AI Max+ 395, y describen la ejecución del GGUF `Q4_K_M` sin modificarlo. El repositorio incorpora un `model.json.lock` que permite verificar la integridad de los artefactos descargados desde Hugging Face, lo que convierte al paquete en un mecanismo de reproducibilidad del despliegue más que en una variante del modelo.

## Capacidades

- Generación de texto y conversación multi-turno: capacidad esperable de un modelo de la familia referenciada, aunque no verificada con documentación propia en este repositorio.
- Razonamiento y código: no disponible en la información proporcionada; no se han publicado evaluaciones ni descripciones de capacidades.
- Tool calling / function calling: no disponible; la model card no lo menciona.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se enumeran idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Despliegue reproducible: capacidad efectiva del paquete, con verificación por `model.json.lock` y arranque mediante `loom-serve`.
- Ejecución en memoria unificada de APU AMD: soportada por diseño del runtime (`--device=amdgpu`, `--memory_bytes`).

## Casos de uso

- Asistente local en estación de trabajo Strix Halo: el paquete está generado y pensado para un Ryzen AI Max+ 395, de modo que un equipo de sobremesa con memoria unificada puede servir el modelo sin GPU dedicada, usando `loom-serve` en `127.0.0.1` para uso personal o de equipo pequeño.
- Laboratorio de inferencia MoE sobre AMD: permite medir comportamiento real de un modelo de ~35B totales y ~3B activos en `gfx` de APU, comparando consumo de memoria unificada frente a soluciones discretas.
- Procesamiento por lotes de documentación con requisitos de privacidad: al ejecutarse en local y sin dependencia de la nube, encaja en flujos donde el texto no puede salir del perímetro (legal, sanitario, administración pública).
- Agente de código en entorno aislado: si el modelo base confirma soporte de tool calling, el despliegue local con `loom-serve` en `127.0.0.1` permite conectarlo a herramientas de edición y pruebas sin exponer el endpoint.
- Reproducibilidad de despliegues en CI: el par `model.json` + `model.json.lock` permite fijar la versión exacta del GGUF y de los programas, algo útil en pipelines que validan que un artefacto de inferencia arranca correctamente antes de publicarse.
- Evaluación comparativa de runtimes: sirve como sujeto de prueba para contrastar Loom frente a llama.cpp u otros backends sobre el mismo GGUF `Q4_K_M` de unsloth, manteniendo pesos constantes y variando solo el motor.
- Prototipado de producto en hardware de bajo consumo: el uso de memoria unificada en lugar de VRAM dedicada reduce el coste de entrada para demos internas y pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y el repositorio registra 0 descargas y 0 valoraciones en el momento de la consulta, por lo que tampoco existen datos de uso de la comunidad.

## Requisitos de hardware

- VRAM/memoria estimada: el GGUF `Q4_K_M` de un modelo de ~35B parámetros totales ocupa del orden de 20-21 GB solo en pesos (estimación a partir del recuento de parámetros y de la cuantización, no publicada por el autor). Hay que añadir caché KV, cuyo tamaño depende del contexto y de la arquitectura, no documentados.
- Hardware de referencia: AMD Ryzen AI Max+ 395 «Strix Halo», con memoria unificada LPDDR5X; el autor generó el paquete en esa plataforma. El parámetro `--memory_bytes` de `loom-serve` permite acotar la memoria asignada.
- GPU dedicadas: no hay datos oficiales de compatibilidad. Por tamaño de pesos, una GPU de 24 GB (RTX 4090, RTX 3090) queda muy justa y solo sería viable con contexto reducido; soluciones de 40-80 GB (A100 40/80 GB, H100, L40S) darían margen holgado.
- ¿Cabe en GPU de consumo? Con 24 GB de VRAM es ajustado y depende del contexto; con 32 GB o más es viable. En equipos de 16 GB no cabe en VRAM, aunque podría intentarse una ejecución híbrida CPU/GPU con otro runtime.
- Opciones de despliegue: `loom-serve` con `--device=amdgpu` es la vía documentada. Para usar el mismo GGUF con otros motores (llama.cpp, Ollama, vLLM) hay que descargarlo del repositorio de unsloth, ya que este paquete no incluye pesos.
- Latencia y throughput: no disponible. No se han publicado tokens por segundo ni tiempos de primera ficha, y el ancho de banda de memoria unificada de una APU es sustancialmente menor que el de una GPU dedicada, por lo que las cifras de un servidor con A100/H100 no son trasladables.

## Comparativa con modelos similares

| Modelo | Parámetros (total/activos) | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `loom-fun/Qwen3.6-35B-A3B` (este paquete) | ~35B / ~3B (según nomenclatura, no documentado) | no disponible | Programas `.loom` + `model.json` (sin pesos) | Apache 2.0 | Empaquetado específico para AMD Loom en Strix Halo; verificación por lock |
| `unsloth/Qwen3.6-35B-A3B-GGUF` (base) | ~35B / ~3B (según nomenclatura) | no disponible | GGUF (`Q4_K_M` y otras) | Apache 2.0 | Pesos reales; utilizable con llama.cpp, Ollama y otros motores GGUF |
| Alternativas MoE de ~30B con ~3B activos | no disponible en esta ficha | no disponible | GGUF, safetensors | habitualmente Apache 2.0 | No se dispone de datos verificados en la información proporcionada para establecer comparación de rendimiento |

No se han publicado comparaciones de rendimiento entre este paquete y alternativas de la misma categoría; la comparación anterior se limita a aspectos estructurales verificables (formato, licencia, naturaleza del artefacto).

## Limitaciones y advertencias

- El repositorio no contiene pesos: no se puede clonar y ejecutar directamente; requiere `loom-fetch` y la descarga del GGUF desde `unsloth/Qwen3.6-35B-A3B-GGUF`.
- Dependencia del SDK de Loom y del lock: cualquier cambio en el repositorio base de unsloth o en el runtime puede romper la reproducibilidad si no se respeta `model.json.lock`.
- Ausencia total de documentación técnica: no hay arquitectura, contexto, idiomas, datos de entrenamiento ni benchmarks publicados en este repositorio.
- Identidad del modelo base poco documentada: el identificador «Qwen3.6» no viene acompañado de ficha técnica en la información disponible; conviene contrastarlo con el repositorio de unsloth antes de asumir capacidades concretas.
- Riesgo de alucinación: no cuantificado; sin evaluaciones publicadas no es posible estimar la tasa de error en tareas factuales.
- Sesgos: no evaluados ni documentados.
- Limitaciones de idioma: no se declara lista de idiomas soportados, por lo que el rendimiento en castellano es desconocido.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse también la licencia y los términos del checkpoint base en `unsloth/Qwen3.6-35B-A3B-GGUF` antes de desplegar en producción.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta; no hay informes independientes de funcionamiento.
- Especificidad de hardware: el paquete se generó para Strix Halo y `--device=amdgpu`; no hay garantía de funcionamiento en otras GPU AMD o en NVIDIA.
- Colisión de nombre: las búsquedas web sobre «Loom» devuelven mayoritariamente el servicio de grabación de vídeo de Atlassian y una marca de ropa, resultados sin relación con este modelo. Los únicos enlaces relevantes son los del ecosistema Loom para AMD que figuran abajo.
- Uso en producción: al no haber métricas de latencia ni de calidad, se recomienda evaluar con un conjunto propio antes de cualquier despliegue real.

## Enlaces

- Repositorio del modelo: https://huggingface.co/loom-fun/Qwen3.6-35B-A3B
- GGUF base (unsloth): https://huggingface.co/unsloth/Qwen3.6-35B-A3B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Factoría de paquetes loom-skills: https://github.com/loom-fun/loom-skills
- Descarga directa de la tarjeta del paquete: https://huggingface.co/loom-fun/Qwen3.6-35B-A3B/resolve/main/model.json
