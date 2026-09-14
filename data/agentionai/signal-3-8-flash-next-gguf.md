# agentionai/Signal-3.8-Flash-Next-GGUF

## Resumen

Signal 3.8 Flash Next es un fine-tune de Qwen3.8-Flash-Next publicado por AgentionAI bajo el identificador `agentionai/Signal-3.8-Flash-Next-GGUF`. El objetivo declarado es reducir la latencia de generacion y mejorar la eficiencia de tokens manteniendo el conocimiento del modelo base: elimina preambulos, formato excesivo, despedidas y narracion del proceso de razonamiento, conservando la sustancia de la respuesta. El backbone es una mezcla de expertos (MoE) de 176.943.899.520 parametros (~177 B), con encoder de vision y una cabecera de prediccion multi-token (MTP) para decodificacion especulativa que funciona igual que en el modelo original.

El modelo se distribuye exclusivamente en formato GGUF cuantizado, con tres niveles (tiers) publicados: `Q8_0`, `AP-Q4_K_XL` y `AP-IQ4_XS`, construidos con recetas de precision por tensor ("Agention Precision") que eligen el tipo de cuantizacion por tensor para maximizar la relacion precision por gigabyte. El repositorio ocupa 764,2 GB y a fecha de la informacion disponible acumula 1768 descargas y 3 "likes".

Su relevancia practica esta en el uso como agente de codigo y tareas de terminal: al ser mas predecible, el borrador MTP acierta mas (90% frente a 69% del base en salida de codigo), lo que acelera la decodificacion especulativa, y ademas responde con menos tokens. El propio autor advierte del compromiso: en problemas que se benefician de cadenas de razonamiento largas o enumeracion exhaustiva, la brevedad de Signal puede quedarse corta frente al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con encoder de vision y cabecera de prediccion multi-token (MTP) para decodificacion especulativa |
| Parametros totales | 176.943.899.520 (~177 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (expertos a 8.5 bpw, ~180 GiB de descarga), AP-Q4_K_XL (expertos Q4_K a 4.5 bpw, 94,3 GiB), AP-IQ4_XS (expertos IQ3_S a 3.44 bpw, 84,4 GiB) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (campo `license: other` con `license_name: qwen-community-1.0`) |
| Formato de pesos | GGUF; proyector de vision `mmproj-F16.gguf` en la raiz del repositorio; cabecera MTP en GGUF aparte |
| Modelo base | Qwen/Qwen3.8-Flash-Next (relacion: finetune) |
| Modalidades | Texto e imagen de entrada (pipeline `image-text-to-text`) |
| Tamano del repositorio | 764,2 GB |
| Descargas / likes | 1768 / 3 |
| Creado / actualizado | 2026-09-11 / 2026-09-13 |

## Arquitectura y entrenamiento

Signal conserva sin cambios el backbone MoE de ~177 B parametros de Qwen3.8-Flash-Next, su encoder de vision y su cabecera de prediccion multi-token (MTP), que actua como borrador en decodificacion especulativa. El autoreporte describe el ajuste como "minimamente invasivo": no hay cambios estructurales en la red, solo en la distribucion de respuestas. La plantilla de chat es la original del modelo base, y el modo de razonamiento (thinking) sigue disponible tanto activado como desactivado.

El entrenamiento se realizo por autodistilacion sobre las propias respuestas de Qwen3.8-Flash-Next, generadas bajo una instruccion de ser directo que el modelo publicado ya no necesita. El autor afirma explicitamente que no se uso datos externos ni salidas de otros modelos, por lo que el conocimiento y el "estilo" del base se mantienen intactos. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

La innovacion tecnica destacable esta en la cadena de herramientas propia, escrita en Rust (`agention-infer`): `gguf-pack` para construir tiers con direccionamiento por contenido y validacion byte-exacta, `gguf-info` para inspeccion y un solver de distorsion por tensor detras de las recetas Agention Precision. Cada tier se mide contra el BF16 del propio Signal sobre un corpus retenido de 2026 antes de publicarse. Los tags del repositorio incluyen `imatrix`, lo que indica uso de matrices de importancia en la cuantizacion.

## Capacidades

- Generacion de texto y razonamiento en dos modos: thinking activado (por defecto) y thinking desactivado, seleccionable por peticion mediante `"chat_template_kwargs": {"enable_thinking": false}`.
- Entrada de imagen: mantiene el encoder de vision del modelo base; requiere descargar `mmproj-F16.gguf` junto con el tier.
- Codigo y tareas agenticas: el autor lo evaluo como agente de codigo en tareas reales de reparacion de repositorios y administracion de sistemas (Terminal-Bench 2.0).
- Decodificacion especulativa con cabecera MTP propia, con `--spec-type draft-mtp` y borrador adaptativo (`--spec-draft-adaptive on`, `--spec-draft-n-max 4`).
- Respuestas directas y de baja verbosidad: omite preambulos, formato excesivo, despedidas y narracion del proceso.
- Tool calling / function calling: no documentado explicitamente en la informacion disponible, aunque el uso agentico con herramientas descrito en la model card implica interaccion con el entorno.
- Capacidades multilingues: no disponible.
- Capacidades de audio: no disponibles.
- Compatibilidad de endpoints: el repositorio incluye el tag `endpoints_compatible`; no se detalla su alcance en la informacion disponible.

## Casos de uso

- Agente de codigo sobre repositorios reales: el modelo se uso como agente detras de `marshall` para tareas de "fix-a-repo" y sysadmin de Terminal-Bench 2.0, resueltas y puntuadas por la suite de tests de cada tarea. Es adecuado porque combina tool calling con bucles de decision cortos y menos tokens por paso.
- Automatizacion de tareas de terminal y operaciones: tareas como `sanitize-git-repo` (254 s frente a 901 s del base) o `crack-7z-hash` (336 s frente a 707 s) ilustran ganancias de tiempo en trabajos largos donde el numero de pasos domina el coste.
- Asistente de programacion de baja latencia: para autocompletado o revision en IDE, la mayor aceptacion del borrador MTP (90% frente a 69%) reduce el coste por token verificado y, sumada a respuestas mas cortas, baja el tiempo hasta la primera respuesta completa.
- Clasificacion y extraccion sobre documentos con imagen: al conservar el encoder de vision, puede procesar capturas, diagramas o documentos escaneados y devolver salidas estructuradas, con la ventaja de respuestas concisas que reducen coste de post-procesado.
- Pipelines de CI/CD con agentes: integrar el modelo como paso de reparacion automatica de fallos de build o de tests, donde la verbosidad es ruido y lo que importa es la accion correcta.
- Despliegue en infraestructura propia con control de coste: con tiers de 4 bits (94,3 GiB y 84,4 GiB de descarga) el modelo se puede servir en nodos de 80 GB, evitando dependencia de APIs externas y manteniendo los datos en la organizacion.
- Sistemas conversacionales con control estricto del "system prompt": al eliminar preambulos y despedidas, encaja en interfaces donde el formato ya lo impone la aplicacion y el modelo solo debe rellenar contenido.
- Evaluacion comparativa de tecnicas de cuantizacion: los tres tiers publicados, medidos contra el BF16 del propio Signal, sirven como referencia para estudiar el impacto de Q8_0, Q4_K y IQ3_S en un MoE de 177 B.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los proporcionados por el autor en la model card. No hay resultados de MMLU, HumanEval, GSM8K ni similares.

| Prueba | Base Qwen3.8-Flash-Next | Signal 3.8 Flash Next |
|---|---|---|
| Aceptacion del borrador MTP en salida de codigo (tier Q4_K_XL, misma maquina) | 69% | 90% |
| Terminal-Bench 2.0, tareas resueltas (10 tareas, 1 intento por tarea) | 8 / 10 | 10 / 10 |
| Tiempo de reloj en tareas resueltas por ambos | referencia | 25% menos |
| Tokens de salida en tareas resueltas por ambos | referencia | 15% menos |

Casos concretos citados por el autor: `sanitize-git-repo` en 254 s frente a 901 s, y `crack-7z-hash` en 336 s frente a 707 s, ambos con MTP activado y el mismo tier `AP-Q4_K_XL`. El propio autor advierte que se trata de un solo intento por tarea y que las cifras de tareas resueltas deben tomarse como indicativas, no como una tasa rigurosa.

## Requisitos de hardware

- VRAM estimada segun el autor (con la tabla de n-gramas descargada a disco): `Q8_0` ~135 GiB; `AP-Q4_K_XL` ~67 GiB; `AP-IQ4_XS` ~57 GiB.
- Tamano de descarga por tier: ~180 GiB (`Q8_0`), 94,3 GiB (`AP-Q4_K_XL`), 84,4 GiB (`AP-IQ4_XS`).
- GPUs adecuadas: no detalladas en la informacion disponible. Por los requisitos de VRAM, el tier mas ligero (~57 GiB) encaja en una GPU de 80 GB (A100 80 GB, H100 80 GB, H200) o en configuraciones multi-GPU; el tier `Q8_0` (~135 GiB) exige varias GPU de 80 GB.
- GPU de consumo: no cabe. El tier mas ligero necesita ~57 GiB de VRAM, muy por encima de los 24 GB de una RTX 4090 o los 32 GB de una RTX 5090, incluso con la tabla de n-gramas en disco.
- Opciones de despliegue documentadas: `llama.cpp` mediante `llama-server` con `--jinja -ngl 999 -fa on`, y decodificacion especulativa opcional con `--spec-type draft-mtp`, `--model-draft Qwen3.8-Flash-Next-MTP-Q8_0.gguf`, `--spec-draft-adaptive on`, `--spec-draft-n-max 4`. Requiere una build de llama.cpp que soporte `--spec-type draft-mtp`.
- Otros runners (vLLM, TGI, Ollama): no documentados en la informacion disponible.
- Parametros de muestreo recomendados: temperatura 0.7, top-p 0.95, top-k 20, min-p 0.
- Latencia y throughput absolutos: no disponibles. Solo se publican cifras relativas frente al modelo base (25% menos de tiempo de reloj y 15% menos de tokens de salida en las tareas resueltas por ambos).

## Comparativa con modelos similares

La unica alternativa documentada en la informacion disponible es el modelo base del que deriva. No se dispone de datos de otros modelos comparables de la misma categoria.

| Modelo | Parametros | Formato | Licencia | Contexto | Rendimiento documentado |
|---|---|---|---|---|---|
| Signal 3.8 Flash Next (`agentionai/Signal-3.8-Flash-Next-GGUF`) | 176.943.899.520 (~177 B), MoE | GGUF (Q8_0, AP-Q4_K_XL, AP-IQ4_XS) | qwen-community-1.0 | no disponible | 90% de aceptacion MTP; 10/10 en Terminal-Bench 2.0 |
| Qwen3.8-Flash-Next (base, `Qwen/Qwen3.8-Flash-Next`) | mismo backbone (~177 B), MoE, vision y MTP | no disponible en la informacion proporcionada | no disponible | no disponible | 69% de aceptacion MTP; 8/10 en Terminal-Bench 2.0 |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

Como complemento, no competidor, el repositorio referencia `agentionai/Qwen3.8-Flash-Next-MTP-Q8_0-GGUF`, la cabecera de borrador MTP en GGUF que se usa junto al modelo para la decodificacion especulativa.

## Limitaciones y advertencias

- Compromiso explicito de brevedad: en problemas que requieren una cadena de razonamiento larga o enumeracion por fuerza bruta, Signal puede quedarse corto frente al base. El autor recomienda usar el modelo base o enfoques de multiple prompt en esos casos.
- Sesgos: al entrenarse por autodistilacion sobre el propio modelo base, hereda sus sesgos sin ninguna correccion externa; el autor no documenta auditoria de sesgos.
- Alucinacion: no se publican tasas de alucinacion ni evaluaciones de veracidad. La reduccion de tokens de razonamiento podria reducir la verificacion implicita en tareas de alta exigencia factual.
- Idiomas: no se documenta la lista de idiomas soportados. Aunque el modelo base sea multilingue, no hay confirmacion en la informacion disponible.
- Licencia: `qwen-community-1.0` (campo `license: other`). Es necesario revisar los terminos de la licencia de Qwen antes de cualquier uso comercial; no se detallan restricciones en la informacion proporcionada.
- Requisitos de hardware muy altos: minimo ~57 GiB de VRAM y 84,4 GiB de descarga incluso en el tier mas agresivo en cuantizacion. No es desplegable en GPUs de consumo.
- Dependencia de una build especifica: la decodificacion especulativa con `--spec-type draft-mtp` requiere una compilacion de llama.cpp que soporte esa opcion; no esta disponible en builds estandar.
- Vision condicionada a un archivo adicional: hay que descargar `mmproj-F16.gguf` aparte; sin el no hay entrada de imagen.
- Evidencia de rendimiento limitada: las cifras de Terminal-Bench 2.0 provienen de un solo intento por tarea y de la propia evaluacion del autor, por lo que deben tratarse como indicativas.
- Metadatos incompletos: no se publican parametros activos, longitud de contexto ni idiomas; el repositorio ocupa 764,2 GB y el autor indica que habra mas tiers "proximamente", lo que implica que la oferta de cuantizaciones puede cambiar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentionai/Signal-3.8-Flash-Next-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cabecera MTP en GGUF: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-MTP-Q8_0-GGUF
- Sitio del autor: https://www.agention.ai/
- Recetas Agention Precision: https://agention.ai/models/qwen3.8-flash-next/
- Repositorio de herramientas del autor: https://github.com/agentionai
- Herramienta de agente usada en las pruebas: https://github.com/agentionai
- Terminal-Bench: https://www.tbench.ai/
- Patrocinio del proyecto: https://github.com/sponsors/agentionai
- Paper tecnico: no disponible
- Demo: no disponible
