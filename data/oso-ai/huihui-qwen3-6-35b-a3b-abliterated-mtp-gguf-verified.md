# OSO-AI/Huihui-Qwen3.6-35B-A3B-abliterated-MTP-GGUF-verified

## Resumen

Huihui-Qwen3.6-35B-A3B-abliterated-MTP es una variante "abliterated" (sin direccion de rechazo) del modelo Qwen3.6-35B-A3B del equipo Qwen, publicada originalmente por huihui-ai y re-alojada por OSO-AI como espejo auditado en seguridad. El modelo base es un transformer de arquitectura MoE (Mixture of Experts) con 35.505.251.456 parametros totales, del que no se detalla el numero de parametros activos en la informacion disponible. La abliteracion elimina la direccion de rechazo aprendida durante el alineamiento, de modo que el modelo responde a practicamente cualquier peticion sin negativas.

Este espejo concreto existe por motivos de seguridad de la cadena de suministro: los repos GGUF de terceros pueden ocultar codigo de exfiltracion en scripts o metadatos. OSO-AI realizo una auditoria (escaneo de bytes, revision de metadatos GGUF, revision linea a linea del unico fichero de codigo, ejecucion en sandbox sin red) que no encontro capacidad de red alguna, y re-alojo los pesos para que la traza de auditoria viaje junto a ellos. El repositorio incluye unicamente la cuantizacion Q2_K (13,25 GB) y el proyector multimodal `mmproj` en f16 (0,9 GB).

Es relevante ahora para investigadores de seguridad, equipos de red-teaming y desarrolladores que necesiten evaluar el comportamiento de modelos sin alineamiento de rechazo en entornos controlados, con la garantia adicional de que los pesos han pasado una auditoria de red documentada. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (clave de metadatos GGUF: `qwen35moe`) |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K (incluida en este repo); Q3-Q8 y f16 en el repo upstream segun la model card |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (mas `mmproj-model-f16.gguf` para vision) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura de mezcla de expertos (MoE), confirmada por la clave de metadatos `qwen35moe` del GGUF y por el sufijo "A3B" del nombre (que sugiere del orden de 3 mil millones de parametros activos, aunque el dato exacto no se proporciona). El repositorio incluye un proyector multimodal f16, lo que indica capacidad de vision en el modelo base. La model card menciona que se trata de un "reasoning model" que genera cadenas ``, por lo que el modelo base incorpora modo de razonamiento explicito.

Sobre el proceso de abliteracion: se aplica la tecnica de direccion de rechazo derivada de Arditi et al. 2024, que identifica y sustrae la direccion latente asociada a la negativa a responder. El autor original (huihui-ai) realizo la abliteracion y las cuantizaciones GGUF. El sufijo "MTP" del nombre no se explica en la informacion disponible. No se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

Como innovacion destacable del espejo, la auditoria documenta que el unico fichero de codigo del repo (`patch-unsloth-...-dec.py`) es un parcheador XOR local de tensores GGUF sin importaciones de red (sin socket, requests, urllib, subprocess ni eval); la clave XOR se usa como ofuscacion anti-retirada de los diffs de pesos, no como malware. El directorio `patch-unsloth/` del repo upstream no se replica.

## Capacidades

- Generacion de texto conversacional multi-turno (tag `conversational`).
- Razonamiento explicito mediante cadenas `<think>…</think>` (hay que eliminarlas antes de evaluar la respuesta).
- Capacidad multimodal de vision, a traves del proyector `mmproj-model-f16.gguf`.
- Respuesta sin rechazo a peticiones que un modelo alineado rechazaria (comportamiento verificado en la prueba de la model card).
- Arquitectura MoE, con el coste de inferencia asociado a los parametros activos en lugar de los 35.5B totales.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada (aunque el modo de razonamiento lo hace plausible, no se confirma).
- Capacidades multilingues: no disponible.

## Casos de uso

- Red-teaming de alineamiento: el modelo sirve como referencia "sin censura" para comparar como responde un modelo abliterated frente a su base alineado ante el mismo conjunto de prompts adversarios, midiendo la eficacia de la direccion de rechazo eliminada.
- Investigacion en abliteracion: evaluar el impacto de sustraer la direccion de rechazo sobre capacidades benignas (coherencia, QA, razonamiento) usando la variante Q2_K en Apple Silicon con llama.cpp.
- Auditoria de cadena de suministro de modelos: este repo sirve como ejemplo practico de como documentar una auditoria de seguridad (escaneo de bytes, revision de metadatos, sandbox sin red) y adjuntar la traza a los pesos.
- Pruebas de robustez de filtros de contenido: generar respuestas que un modelo alineado bloquearia para validar que los clasificadores de salida de un pipeline de produccion las detectan correctamente.
- Evaluacion de cuantizacion agresiva: estudiar la degradacion de un MoE de 35.5B a Q2_K (13,25 GB) en tareas de razonamiento y vision, comparando con Q3-Q8 del repo upstream.
- Despliegue local de investigacion en hardware de consumo: al caber en 13,25 GB, permite ejecutar un MoE de 35.5B en equipos con 16-24 GB de memoria unificada o VRAM, sin dependencia de servicios en la nube.
- Analisis de seguridad de pesos: usar el modelo como caso de estudio para formar a equipos en la deteccion de codigo malicioso en repos GGUF de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para la cuantizacion incluida: aproximadamente 13,25 GB para los pesos Q2_K, mas 0,9 GB del proyector de vision f16; en la practica se necesitan del orden de 14-16 GB libres contando cache KV y overhead.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, encajan GPUs con 16 GB o mas de VRAM (RTX 4080/4090, A100, H100) o Apple Silicon con memoria unificada de 16 GB o superior.
- Cabe en GPU de consumo: si, en modelos con 16 GB o mas de VRAM (por ejemplo RTX 4080/4090) o en Apple Silicon con 16-24 GB de memoria unificada; la model card confirma ejecucion en Apple Silicon con llama.cpp.
- Opciones de despliegue: llama.cpp (probado en la auditoria con `LLAMA_CURL=OFF`); el tag `endpoints_compatible` sugiere compatibilidad con endpoints, pero no se detalla que servidores (vLLM, TGI, Ollama) estan soportados.
- Latencia y throughput: no disponibles. Al ser MoE, el coste por token depende de los parametros activos (no publicados), no de los 35.5B totales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Huihui-Qwen3.6-35B-A3B-abliterated-MTP (este) | 35.5B totales (activos no disponibles) | no disponible | Q2_K en este repo; Q3-Q8 y f16 upstream | Apache 2.0 | Espejo auditado en seguridad, sin rechazo |
| Qwen/Qwen3.6-35B-A3B (base) | 35.5B totales | no disponible | safetensors y GGUF (upstream) | Apache 2.0 | Modelo alineado original, con rechazo |
| huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated-MTP-GGUF (upstream) | 35.5B totales | no disponible | Q2-Q8 y f16 | Apache 2.0 | Mismo modelo abliterated, incluye `patch-unsloth/` no auditado |

## Limitaciones y advertencias

- Modelo sin alineamiento de rechazo: responde a peticiones daninas (la model card documenta guias paso a paso para forzar cerraduras y redaccion de correos de phishing). No es apto para uso en produccion orientado al publico sin filtros externos.
- Uso previsto limitado a investigacion en abliteracion y red-teaming; el autor declara explicitamente que no es una herramienta para causar dano y que la responsabilidad de las salidas recae en el usuario.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la cuantizacion Q2_K puede degradar la coherencia y el razonamiento frente a precisiones mayores.
- Limitaciones de contexto e idioma: no documentadas en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial segun los terminos de la licencia, pero el comportamiento sin censura hace desaconsejable el despliegue comercial sin moderacion adicional.
- Este repo solo incluye Q2_K y el proyector de vision; otras cuantizaciones deben obtenerse del repo upstream, que no ha pasado la auditoria de este espejo.
- La auditoria cubre los pesos y el codigo del repo, no la calidad ni la seguridad del comportamiento del modelo en si.
- El sufijo "MTP" del nombre no se explica en la model card; conviene verificar su significado antes de asumir capacidades adicionales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OSO-AI/Huihui-Qwen3.6-35B-A3B-abliterated-MTP-GGUF-verified
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repo upstream original (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated-MTP-GGUF
- Perfil del autor original: https://huggingface.co/huihui-ai
- Log de auditoria y herramientas: https://github.com/OSOSerious/oso-obliterated-models- (directorio `security/`)
- Referencia tecnica de la tecnica de abliteracion: Arditi et al. 2024 (direccion de rechazo)
