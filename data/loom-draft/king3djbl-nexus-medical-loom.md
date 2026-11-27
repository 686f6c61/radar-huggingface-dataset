# loom-draft/King3Djbl-nexus-medical-loom

## Resumen

`loom-draft/King3Djbl-nexus-medical-loom` es un paquete de despliegue en formato Loom (programas `.loom` y un `model.json`) generado automáticamente con la herramienta `loom-next` para servir el checkpoint GGUF `nexus-medical-q4_k_m.gguf` del repositorio base `King3Djbl/nexus-medical-GGUF`. No es un modelo nuevo: es un artefacto de empaquetado que permite ejecutar un GGUF preexistente sobre la pila de inferencia Loom (hrx-loom) en GPUs AMD concretas.

El paquete está orientado explícitamente a dos aceleradores: el AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB). Su relevancia es acotada: sirve como ejemplo de empaquetado reproducible para el ecosistema Loom y como referencia de rendimiento de esa pila frente a llama.cpp ROCm sobre el mismo GGUF. El nombre "nexus-medical" sugiere un ajuste fino orientado a dominio sanitario, pero la model card no documenta el dataset ni el proceso de entrenamiento.

La información disponible es muy limitada: no se publican parámetros totales, longitud de contexto, idiomas soportados ni benchmarks de calidad del modelo. Solo hay datos de rendimiento de inferencia (tokens/s) medidos en hardware Strix Halo el 27 de noviembre de 2026. Todo lo que no aparece en la model card se marca como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint GGUF; la model card no especifica transformer, MoE ni híbrida) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (las pruebas de rendimiento usan contextos de hasta 32k tokens, pero no se declara el máximo del modelo) |
| Tipos de cuantización | Q4_K_M (única variante empaquetada en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (checkpoint original) + paquete Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo subyacente: la model card del paquete Loom no describe si `nexus-medical` es un transformer denso, un MoE o una arquitectura híbrida, ni detalla el número de parámetros, la composición del dataset de entrenamiento, el número de tokens vistos o si hubo fases de RLHF, DPO o ajuste supervisado. El único dato técnico verificable es que el checkpoint se distribuye cuantizado en Q4_K_M y que el paquete Loom lo consume sin modificar ("unmodified GGUF checkpoint").

La innovación técnica documentada no está en el modelo, sino en el runtime: Loom (hrx-loom 0.2.0) sirve el GGUF con un pool de memoria de respaldo fijo (`--pool_backing=fixed`), precarga de parámetros en host (`--parameter_mode=preload`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`). La model card indica que no se publicó ningún drafter para este modelo exacto y que el GGUF no incluye cabeza MTP, por lo que la decodificación especulativa no está disponible en estas mediciones.

## Capacidades

- Generación de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling / function calling con formato OpenAI (`tools` y `tool_calls`), según la tabla de features de la model card.
- Modo de razonamiento / thinking: no aplicable según la model card.
- Ajuste de esfuerzo de razonamiento (reasoning effort): no aplicable.
- Capacidades multimodales (visión, audio): no disponibles.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Decodificación especulativa: no disponible para este modelo (sin drafter publicado ni cabeza MTP en el GGUF).
- Servicio multi-stream: soportado por el runtime (medición con 4 streams paralelos).

## Casos de uso

- Despliegue de inferencia local en Strix Halo: el paquete está preconfigurado para el Ryzen AI Max+ 395 (gfx1151) con comandos listos (`loom-fetch` + `loom-serve`), lo que permite levantar un endpoint compatible con OpenAI sin ajustar manualmente parámetros de offload ni de contexto.
- Evaluación comparativa de runtimes en AMD: sirve como artefacto reproducible para medir Loom frente a llama.cpp ROCm sobre el mismo GGUF y el mismo hardware; la model card documenta la metodología (medianas de 6 sesiones, mismas prompts, mismo runner DevLab).
- Procesamiento de documentos largos en local: con prefill medido de 7.562 tok/s en documentos de 1k tokens y 3.401,8 tok/s en documentos de 32k, el paquete es adecuado para tareas de resumen o extracción sobre prompts extensos en una estación de trabajo con GPU AMD.
- Asistentes conversacionales con tool calling: al exponer `tools` y `tool_calls` en formato OpenAI, puede integrarse en orquestadores de agentes existentes que ya hablan ese protocolo, sin adaptadores propietarios.
- Servicio multi-usuario ligero: la medición de 4 streams con 570,0 tok/s agregados en Strix Halo indica que el runtime puede atender varias conversaciones concurrentes en una única máquina.
- Prototipado en dominios sanitarios: dado el nombre del checkpoint base (`nexus-medical`), puede usarse como borrador para experimentar con flujos clínicos simulados, siempre que se validen las salidas con supervisión experta y no se trate como dispositivo médico.
- Referencia para el ecosistema Loom: desarrolladores que quieran empaquetar sus propios GGUF con `loom-next` pueden usar este repositorio como plantilla de estructura (`model.json`, programas `.loom`, comandos de servicio).

## Benchmarks y rendimiento

Rendimiento de inferencia medido en AMD Strix Halo (gfx1151), comparando Loom 0.2.0 con llama.cpp ROCm b1374 sobre el mismo GGUF:

| Métrica | llama.cpp | Loom | Margen vs mejor llama.cpp |
|---|---|---|---|
| Decode tok/s, prompt corto | — | 159,4 | — |
| Decode tok/s, contexto 2k | — | 143,6 | — |
| Decode tok/s, contexto 32k | — | 85,3 | — |
| Prefill tok/s, documento 1k | 2123,2 | 7562,1 | +256 % |
| Prefill tok/s, documento 2k | — | 7860,8 | — |
| Prefill tok/s, documento 8k | 2129,9 | 6542,3 | +207 % |
| Prefill tok/s, documento 16k | — | 4996,0 | — |
| Prefill tok/s, documento 32k | — | 3401,8 | — |
| 4 streams, decode agregado tok/s | 512,3 | 570,0 | +11 % |
| Decodificación especulativa, tokens aceptados | n/a | n/a | n/a |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Para Radeon AI PRO R9700 (gfx1201, 32 GB) la model card indica que los resultados "no se han vuelto a medir todavía".

## Requisitos de hardware

- VRAM estimada: no disponible con precisión porque se desconoce el número de parámetros; el paquete se sirve en GPUs de 32 GB (R9700) y en el sistema integrado de Strix Halo, lo que sugiere que el GGUF Q4_K_M cabe en esos presupuestos de memoria.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPUs NVIDIA: no soportadas por este paquete según la documentación; el runtime es específico de AMD (hrx-loom sobre ROCm).
- Consumer GPU: no se documenta compatibilidad con GPUs de consumo AMD o NVIDIA; las instrucciones solo cubren los dos aceleradores citados.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve`; expone API OpenAI en `127.0.0.1:8080`.
- Opciones de despliegue alternativas (vLLM, llama.cpp, Ollama, TGI): no documentadas para este paquete; llama.cpp solo aparece como referencia comparativa.
- Latencia y throughput: decode de 159,4 tok/s con prompt corto y 85,3 tok/s a 32k de contexto en Strix Halo; prefill entre 3.401,8 y 7.860,8 tok/s según longitud del documento.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (mismo tamaño o misma tarea). El único punto de comparación documentado es el runtime llama.cpp ROCm b1374 ejecutando el mismo GGUF, que no es un modelo distinto sino un motor de inferencia alternativo; los datos de esa comparación figuran en la sección de benchmarks.

## Limitaciones y advertencias

- No es un modelo nuevo: es un paquete de despliegue del GGUF `King3Djbl/nexus-medical-GGUF`; cualquier limitación del checkpoint base aplica igualmente aquí.
- Ausencia total de documentación sobre entrenamiento, dataset, parámetros y contexto: no es posible evaluar sesgos, calidad ni idoneidad para producción a partir de la model card.
- El nombre "medical" sugiere un dominio sanitario, pero no hay validación clínica publicada; no debe usarse como dispositivo médico ni para decisiones clínicas sin supervisión profesional.
- Riesgo de alucinación: no cuantificado; no hay benchmarks de fidelidad ni de tasas de error.
- Compatibilidad de hardware muy restringida: solo se documentan Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no hay soporte declarado para NVIDIA ni para otras GPUs AMD.
- Sin decodificación especulativa: el GGUF no incluye cabeza MTP y no hay drafter publicado para este modelo, lo que limita el throughput de decode frente a configuraciones especulativas.
- Rendimiento en R9700 no medido: la model card indica que los resultados para gfx1201 aún no se han vuelto a medir.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación por la comunidad.
- Licencia MIT: permite uso comercial, pero al ser un artefacto derivado conviene verificar la licencia del checkpoint base `King3Djbl/nexus-medical-GGUF` antes de redistribuirlo.
- El paquete depende de `hrx-loom==0.2.0` y de un commit de `hrx-system` que la propia model card marca como "unknown, recovered", lo que introduce riesgo de reproducibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/King3Djbl-nexus-medical-loom
- Modelo base (GGUF): https://huggingface.co/King3Djbl/nexus-medical-GGUF
- Runtime Loom (hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Ejecución de referencia DevLab Dispatch: https://github.com/loom-fun/loom-next/actions/runs/46044802533
