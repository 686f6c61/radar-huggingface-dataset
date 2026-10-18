# QWIK-AI/QWIK-Apex-32B-Midrange

## Resumen

QWIK-Apex-32B-Midrange es un modelo de lenguaje de 31,86B parámetros desarrollado por QWIK-AI. Utiliza una arquitectura propietaria denominada `QWIKApexRecurrentForCausalLM` (`model_type: qwik_apex_recurrent`), basada en profundidad recurrente latente, con 77 capas físicas y una profundidad secuencial efectiva de 109 capas. La model card indica una longitud de contexto de 524.288 tokens mediante `QWIK-3D Spectral RoPE`.

El modelo se presenta como una alternativa de razonamiento de alta capacidad dentro de la categoría de 32B, con resultados autodeclarados destacados en GPQA Diamond, Terminal-Bench, Tau2-Bench, HLE y pruebas de contexto largo. Incorpora etiquetas relacionadas con razonamiento, MCTS y modelos pequeños, aunque no se detalla en la información disponible cómo se aplican estas técnicas durante el entrenamiento.

Su relevancia potencial radica en combinar un tamaño relativamente contenido con contexto muy largo y capacidades declaradas de razonamiento, uso de herramientas y código. Sin embargo, la licencia es propietaria, la arquitectura requiere `trust_remote_code=True` y no se han proporcionado evaluaciones independientes ni detalles completos de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `QWIKApexRecurrentForCausalLM`; transformer con profundidad recurrente latente (`K_loop=3`) y `QWIK-3D Spectral RoPE` |
| Parámetros totales | 31,86B físicos |
| Parámetros activos | No aplica; no es un modelo MoE. La model card indica 44,58B de cómputo denso efectivo |
| Longitud de contexto | 524.288 tokens |
| Tipos de cuantización | No disponible; no se documentan GGUF, AWQ, GPTQ ni otras cuantizaciones oficiales |
| Idiomas soportados | No disponible; la metadata de HuggingFace no incluye lista de idiomas |
| Licencia | `qwik-proprietary-commercial-v1` (`license: other`) |
| Formato de pesos | Safetensors, según las etiquetas del repositorio |

## Arquitectura y entrenamiento

La arquitectura es propietaria y se carga mediante código remoto con `trust_remote_code=True`. La model card describe una estructura recurrente latente con `K_loop=3`, 77 capas físicas y 109 capas secuenciales efectivas. El sistema de posiciones se denomina `QWIK-3D Spectral RoPE` y se asocia a una ventana de contexto de 524.288 tokens. No se especifican el número de cabezas de atención, la configuración exacta del KV cache ni los detalles internos del bloque recurrente.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineamiento. La model card incluye la etiqueta `mcts`, pero no explica cómo se emplea. Tampoco se documentan mecanismos de decodificación especulativa, atención lineal o estrategias de paralelización. La información disponible no permite validar de forma independiente las innovaciones técnicas declaradas.

## Capacidades

- Generación de texto conversacional y razonamiento de alta profundidad; la evaluación recomendada usa `reasoning_effort="xhigh"`, `temperature=0.6` y `max_new_tokens=131072`.
- Manejo de contexto largo: la model card declara 524.288 tokens y reporta 92,80 % en AA-LCR v1.1.
- Código y operación de terminal: reporta 92,80 % en Terminal-Bench 2.1 (Hard) y 46,80 % en Terminal-Bench 4.0 (Extreme).
- Código científico: reporta 66,80 % en SciCode.
- Matemáticas: reporta 86,90 % en MATH Level 5 dentro del promedio normalizado de HuggingFace Open LLM Leaderboard v2.
- Conocimiento científico y razonamiento avanzado: reporta 95,80 % en GPQA Diamond, 51,80 % en Humanity's Last Exam y 24,80 % en CritPt.
- Uso de herramientas y políticas: reporta 97,60 % en Tau2-Bench, lo que sugiere capacidades de tool calling o seguimiento de políticas, aunque no se detalla el formato exacto de function calling.
- Razonamiento multi-paso y agentes: los resultados en Terminal-Bench, Tau2-Bench y HLE apuntan a este tipo de uso, siempre según datos autodeclarados.
- Capacidades multilingües: no disponibles; no se documenta una lista de idiomas.
- Visión, audio o multimodalidad: no disponible; no se indican capacidades multimodales.
- Modo thinking explícito: no se documenta un modo separado; sí se menciona un parámetro de esfuerzo de razonamiento.

## Casos de uso

- Agente de terminal y DevOps: el modelo podría generar comandos, diagnosticar errores y proponer parches en entornos aislados. Los resultados declarados en Terminal-Bench 2.1 y 4.0 lo orientan a tareas de shell y resolución de incidencias, pero exigiría sandbox, permisos mínimos y revisión humana.
- Automatización de soporte con políticas internas: Tau2-Bench mide el seguimiento de herramientas y políticas; el modelo podría integrarse en flujos de atención al cliente con reglas de negocio, escalado y consulta a sistemas internos.
- Análisis de repositorios y documentación extensa: con 524.288 tokens de contexto, podría procesar grandes volúmenes de código, expedientes técnicos o documentación legal. El coste de KV cache a esa longitud puede ser elevado y requerir hardware específico.
- Ingeniería de software científico: SciCode reporta 66,80 %, por lo que podría emplearse como asistente para prototipos numéricos, notebooks y código de simulación. Requiere validación por especialistas y pruebas reproducibles.
- Razonamiento matemático y físico para I+D: los resultados declarados en MATH Level 5, GPQA Diamond y CritPt permiten plantearlo como apoyo a investigadores para explorar problemas y generar hipótesis. No sustituye la verificación formal ni la revisión por pares.
- Generación de informes técnicos largos: con `max_new_tokens=131072`, podría redactar documentos extensos a partir de múltiples fuentes. Conviene limitar la longitud real y verificar citas y datos.
- Respuesta a preguntas con recuperación aumentada: la model card reporta 97,40 % en Omniscience Non-Hallucination, pero la métrica es autodeclarada; en producción seguiría siendo necesario aplicar RAG, citas y comprobación factual.
- Evaluación de políticas y cumplimiento: el rendimiento declarado en Tau2-Bench sugiere uso en sistemas que deben decidir entre acciones permitidas y denegadas, con auditoría de decisiones y registro de trazas.

## Benchmarks y rendimiento

Los siguientes resultados proceden exclusivamente de la model card del autor. No se han verificado de forma independiente.

| Benchmark | QWIK-Apex-32B-Midrange | Qwen3.8 27B xhigh | Mejor especialista citado |
|---|---:|---:|---:|
| AA Intelligence Index v4.3.2 | 51,40 | 33,68 | 33,68 (Qwen3.8 27B xhigh) |
| GPQA Diamond | 95,80 % | 90,51 % | 90,51 % (Qwen3.8 27B xhigh) |
| AA-LCR v1.1, contexto 524K | 92,80 % | 81,25 % | 83,33 % (Muse Glimmer high) |
| Terminal-Bench 2.1, Hard | 92,80 % | 79,78 % | 79,78 % (Qwen3.8 27B xhigh) |
| Terminal-Bench 4.0, Extreme | 46,80 % | 5,56 % | 5,56 % (Qwen3.8 27B xhigh) |
| SciCode | 66,80 % | 46,64 % | 46,64 % (Qwen3.8 27B xhigh) |
| Tau2-Bench, tool/policy | 97,60 % | 93,36 % | 95,32 % (Qwen3.6 35B A3B) |
| AA-Omniscience Index | +44,80 | -16,92 | +3,77 (G9v3-39A5B) |
| Omniscience Non-Hallucination | 97,40 % | 50,25 % | 86,96 % (G9v3-39A5B) |
| Humanity's Last Exam | 51,80 % | 33,92 % | 33,92 % (Qwen3.8 27B xhigh) |
| CritPt, física frontier | 24,80 % | 5,43 % | 5,43 % (Qwen3.8 27B xhigh) |

| Modelo | Parámetros | HF v2 promedio normalizado | IFEval | BBH normalizado | MATH Level 5 | GPQA normalizado | MuSR normalizado | MMLU-Pro normalizado |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| QWIK-Apex-39B-Ultra | 39,32B | 87,98 % | 93,40 % | 84,20 % | 89,60 % | 94,40 % | 78,50 % | 87,80 % |
| QWIK-Apex-32B-Midrange | 31,86B | 85,32 % | 91,80 % | 81,50 % | 86,90 % | 91,00 % | 75,22 % | 85,50 % |
| Qwen3.8-27B-xhigh | 27,00B | 77,68 % | 88,20 % | 74,83 % | 79,40 % | 79,33 % | 65,10 % | 79,22 % |
| Gemma-4-31b-it | 31,00B | 73,17 % | 86,40 % | 71,29 % | 72,50 % | 72,27 % | 60,56 % | 76,00 % |

## Requisitos de hardware

- VRAM estimada solo para pesos, sin KV cache: BF16 aproximadamente 63,7 GB; FP8/INT8 aproximadamente 31,9 GB; 4 bits aproximadamente 15,9 GB. Son estimaciones genéricas basadas en 31,86B parámetros, no configuraciones oficiales.
- El KV cache para 524.288 tokens no se puede calcular con los datos disponibles. La model card no detalla número de cabezas KV, uso de GQA ni configuración de atención; en la práctica puede dominar el consumo y exigir varias GPU.
- BF16: se recomienda una GPU de 80 GB, como H100 80 GB o A100 80 GB, para pesos y contexto corto. Para aprovechar 524.288 tokens probablemente se necesiten varias GPU de 80 GB.
- FP8/INT8: opciones razonables incluyen H100, A100 80 GB, L40S 48 GB o RTX 6000 Ada 48 GB, con contexto limitado y validación previa del soporte real de cuantización.
- 4 bits: los pesos podrían caber en una RTX 4090 o RTX 3090 de 24 GB, pero el contexto completo de 524.288 tokens no sería viable en esa VRAM. También habría que confirmar que la arquitectura propietaria admite cuantización de 4 bits.
- Despliegue: Transformers con `trust_remote_code=True`; las etiquetas incluyen `text-generation-inference` y `endpoints_compatible`. No se confirma soporte de vLLM, llama.cpp, Ollama, GGUF o TGI con esta arquitectura concreta.
- Latencia y throughput: no disponibles. No se proporcionan mediciones de tokens por segundo, tiempo hasta el primer token ni rendimiento con lotes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | AA Intelligence Index | HF v2 promedio | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| QWIK-Apex-32B-Midrange | 31,86B | 524.288 tokens | 51,40 | 85,32 % | Propietaria `qwik-proprietary-commercial-v1` | Repositorio de HuggingFace indicado, con 0 descargas y 0,0 GB en la información consultada |
| QWIK-Apex-39B-Ultra | 39,32B | No disponible | No disponible | 87,98 % | Propietaria, según la model card | Referenciado en la model card; disponibilidad no verificada |
| Qwen3.8-27B-xhigh | 27,00B | No disponible | 33,68 | 77,68 % | No disponible en la información | Referenciado como competidor; disponibilidad no verificada |
| Gemma-4-31b-it | 31,00B | No disponible | No disponible | 73,17 % | No disponible en la información | Referenciado como competidor; disponibilidad no verificada |

## Limitaciones y advertencias

- Los resultados de benchmarks son autodeclarados y no se han verificado de forma independiente. No se proporcionan papers, informes técnicos ni artefactos de evaluación.
- El repositorio muestra 0 descargas, 0 likes y un tamaño de 0,0 GB en la información consultada. No se puede confirmar que los pesos estén realmente publicados o que el repositorio sea funcional.
- La fecha de creación indicada es 2026-10-17; conviene verificar la vigencia y autenticidad del repositorio antes de cualquier uso.
- La licencia es propietaria (`qwik-proprietary-commercial-v1`). No se detallan los términos de uso comercial, redistribución, modificación o despliegue; es obligatorio revisar `LICENSE.md`.
- La carga requiere `trust_remote_code=True`, lo que implica ejecutar código remoto del autor. En producción debe auditarse el código y aislarse el entorno.
- No se documentan idiomas soportados. No se puede asumir un rendimiento multilingüe equivalente al de modelos con listas explícitas de idiomas.
- No se documentan sesgos, composición del dataset ni procesos de alineamiento. Esto limita la evaluación de riesgos sociales y de dominio.
- Aunque la model card reporta una tasa alta de no alucinación, sigue siendo una métrica autodeclarada. En usos críticos se requiere verificación factual, citas y revisión humana.
- El contexto de 524.288 tokens tiene un coste de memoria y latencia potencialmente muy elevado. Sin datos de KV cache, no se puede garantizar su viabilidad en hardware de consumo.
- La compatibilidad con vLLM, llama.cpp, Ollama, GGUF o TGI no está confirmada. La arquitectura propietaria puede requerir implementaciones específicas.
- La model card menciona un watermark criptográfico de espacio nulo y una arquitectura 100 % propietaria; no se detalla su funcionamiento ni su impacto en auditoría o reproducibilidad.
- No se proporcionan datos de latencia, throughput, consumo energético ni coste por token.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/QWIK-AI/QWIK-Apex-32B-Midrange
- Licencia: https://huggingface.co/QWIK-AI/QWIK-Apex-32B-Midrange/blob/main/LICENSE.md
- Gráfico de benchmarks citado en la model card: https://huggingface.co/QWIK-AI/QWIK-Apex-32B-Midrange/blob/main/hero_benchmark_chart.svg
- Papers, blogs, repositorios o demos adicionales: no disponibles en la información proporcionada.
