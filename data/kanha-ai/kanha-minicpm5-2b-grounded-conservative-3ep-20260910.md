# Kanha-AI/kanha-minicpm5-2b-grounded-conservative-3ep-20260910

## Resumen

Kanha-AI/kanha-minicpm5-2b-grounded-conservative-3ep-20260910 es un ajuste fino del modelo openbmb/MiniCPM5-2B (revision `cd199ce3ee67549c42ef7372f809f2c63599a3e9`) entrenado con QLoRA y publicado por Kanha-AI el 10 de septiembre de 2026. Se trata de un modelo de generacion de texto de 2.516.756.480 parametros (~2,52 mil millones) orientado especificamente a responder preguntas unicamente a partir de un contexto recuperado, con una cadena de rechazo literal cuando la respuesta no aparece en dicho contexto.

Su relevancia no esta en el rendimiento generalista, sino en el contrato de inferencia: el autor define un system prompt exacto ("Answer only from the supplied context..."), una plantilla de usuario con los campos Context y Question, y una cadena de rechazo fija ("I can't answer that from the provided context."). El checkpoint se presenta explicitamente como material de investigacion para comparar metodos de entrenamiento sobre un mismo dataset derivado del sitio web de Kanha y para evaluacion controlada de question answering anclado a fuentes.

El entrenamiento se realizo sobre 210 registros de entrenamiento y 45 de validacion (0 en holdout), con secuencia maxima de 4096 tokens, 3 epocas, LoRA de rango 16 y perdida calculada solo sobre turnos del asistente. Los resultados publicados por el autor son metricas internas de anclaje (grounded), no benchmarks estandar, y varios de sus gates de comportamiento grounded no se superan (pass rate de 0,0769 y gate en `false`), lo que debe tenerse muy en cuenta antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder derivado de openbmb/MiniCPM5-2B; la model card no detalla el diseno interno (los tags incluyen `llama` y `qwen3`) |
| Parametros totales | 2.516.756.480 (~2,52 mil millones), segun los safetensors publicados |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens (longitud maxima de secuencia usada en el entrenamiento QLoRA); el contexto nativo del modelo base no se especifica |
| Tipos de cuantizacion | no disponible (entrenamiento con QLoRA; no se publican artefactos GGUF ni MLC validados) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors, dtype final bfloat16 con adaptadores LoRA fusionados (`qlora`) |

Otros datos de identidad del run: Run ID `minicpm5-2b-kanha-conservative-3ep-20260910`, hash del dataset `5344dbb7a1d3267d4b370aac7ecf316329d43829335c95ec38304533bf91c958`, tamano del repositorio 5,0 GB, pipeline `text-generation`, libreria `transformers`.

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna del modelo base MiniCPM5-2B (numero de capas, atencion, tipo de normalizacion ni contexto nativo). Lo que si se documenta es el procedimiento de ajuste: QLoRA con rango 16, alpha 16, dropout 0,05 y adaptadores aplicados sobre `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, es decir, sobre las proyecciones de atencion y del bloque MLP. Los pesos finales se fusionaron y se publicaron en bfloat16.

Los hiperparametros del run son: 3,0 epocas, learning rate 2e-05, batch size por dispositivo 2 con 8 pasos de acumulacion de gradiente (batch efectivo 16), warmup ratio 0,05, semilla 42, secuencia maxima 4096 y `assistant-only loss: true`, de modo que el calculo de perdida se restringe a los turnos generados por el asistente. El dataset es unico y pequeno: 210 registros de entrenamiento y 45 de validacion, con holdout de 0 registros y un hash de dataset comun a todos los splits, derivado del sitio web de Kanha. No se documenta en la informacion disponible el uso de RLHF, DPO ni de decodificacion especulativa; la unica innovacion operativa declarada es el contrato de inferencia grounded con rechazo literal y `enable_thinking=False` sobre la plantilla de chat nativa.

## Capacidades

- Generacion de texto conversacional en ingles, condicionada obligatoriamente a un contexto recuperado.
- Question answering anclado a fuentes (grounded QA): responde solo con informacion presente en el bloque `Context`.
- Rechazo explicito y deterministico cuando la respuesta no esta en el contexto, con la cadena exacta `I can't answer that from the provided context.`
- Recuperacion de fechas y de URLs dentro del contexto: `dates_recall` 1,0 y `urls_recall` 1,0 en la evaluacion del autor.
- Recuperacion de cifras: `numbers_recall` 0,9487 y `unsupported_value_rate` 0,0 (no introduce valores no respaldados por el contexto en los casos evaluados).
- Extraccion de listas: `list_recall` 0,4301, capacidad parcial y claramente inferior al resto de metricas de recall.
- Modo de pensamiento desactivado por contrato (`enable_thinking=False`); no se declara soporte de thinking mode.
- No se declara soporte de tool calling, function calling, uso agentico, vision, audio ni multimodalidad en la informacion proporcionada.
- Multilingue: no. El modelo declara unicamente `en`.

## Casos de uso

- Question answering sobre documentacion web con RAG: el modelo esta entrenado para recibir contexto recuperado y responder solo desde el, por lo que encaja como generador final en un pipeline de recuperacion + respuesta con corpus cerrado.
- Atencion al cliente anclada a un corpus controlado: la cadena de rechazo fija permite devolver una respuesta inequivoca de "no lo se" en lugar de improvisar, siempre que la ventana de 4096 tokens sea suficiente para el contexto recuperado.
- Extraccion estructurada de fechas y URLs de fragmentos: con `dates_recall` y `urls_recall` de 1,0 en la evaluacion interna, es util para tareas de normalizacion de metadatos a partir de texto recuperado.
- Cumplimiento y politicas internas: escenarios donde se exige que cada afirmacion este respaldada por un fragmento concreto, con rechazo auditable cuando no lo esta.
- Investigacion comparativa de metodos de entrenamiento: el propio autor lo destina a comparar tecnicas sobre el mismo dataset derivado del sitio de Kanha (mismo hash, mismos splits).
- Evaluacion controlada de alucinacion y comportamiento de rechazo: la `refusal_rate` de 0,3462 y el `unsupported_value_rate` de 0,0 permiten usar el checkpoint como sujeto de pruebas en bancos de evaluacion grounded.
- Prototipado con recursos limitados: con ~2,52 mil millones de parametros, sirve para validar arquitecturas de RAG en una sola GPU de consumo antes de escalar a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las unicas cifras son las metricas internas de evaluacion del autor, obtenidas con contexto fuente oracle (la calidad de recuperacion no se evaluo):

| Metrica | Valor |
|---|---|
| dates_recall | 1,0 |
| urls_recall | 1,0 |
| numbers_recall | 0,9487 |
| list_recall | 0,4301 |
| unsupported_value_rate | 0,0 |
| refusal_rate | 0,3462 |
| deterministic_pass_rate | 0,2692 |
| grounded_behavior_pass_rate | 0,0769 (2 de 26 casos) |
| grounded_behavior_gate_passed | false |
| grounded_semantic_review_gate_passed | false |
| grounded_source_supported_count | 0 |
| grounded_reviewed_case_count | 0 |
| grounded_reviewed_case_rate | 0,0 |
| grounded_answerable_case_count | 24 |
| grounded_behavior_case_count | 26 |
| total de casos | 26 |

El propio autor advierte que el scoring deterministico y el benchmark con Transformers en servidor no constituyen una cualificacion en navegador, y que no se incluye ningun artefacto MLC validado en la publicacion. Los gates de comportamiento grounded y de revision semantica no se superan.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16/fp16: en torno a 5,0-5,2 GB solo para pesos (el repositorio ocupa 5,0 GB) y aproximadamente 6-8 GB contando cache KV y overhead de runtime con 4096 tokens de contexto.
- VRAM estimada con cuantizacion de 8 bits: ~2,7-3,5 GB. Con cuantizacion de 4 bits: ~1,5-2,5 GB. Estos artefactos no se publican en el repositorio, por lo que habria que generarlos.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4070 Ti, RTX 4080, RTX 4090 y equipos Apple Silicon con 8-16 GB de memoria unificada. Cabe en GPU de consumo de gama media-alta en bfloat16 y en practicamente cualquier GPU con 6 GB o mas si se cuantiza.
- GPU de datacenter: L4, A10G, A100 y H100 son funcionales aunque sobredimensionadas para 2,52 mil millones de parametros; resultan utiles para servir muchas replicas por nodo.
- Opciones de despliegue: `transformers` de forma nativa (libreria declarada), Text Generation Inference (el repositorio incluye el tag `text-generation-inference`) y endpoints compatibles (`endpoints_compatible`). vLLM no esta confirmado en la informacion disponible. Ollama y llama.cpp requieren conversion previa a GGUF, que no se publica. No hay artefacto MLC validado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento ni especificaciones de otros modelos de la misma categoria, por lo que la comparacion se limita al modelo base declarado.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| kanha-minicpm5-2b-grounded-conservative-3ep | 2.516.756.480 | 4096 (entrenamiento) | no disponible | HuggingFace, safetensors bf16 | Ajuste QLoRA con contrato grounded y rechazo literal |
| openbmb/MiniCPM5-2B | ~2,5 mil millones (heredados) | no disponible | no disponible | HuggingFace | Modelo base; la model card del ajuste no detalla sus caracteristicas |
| Otras alternativas de ~2-3B para RAG grounded | no disponible | no disponible | no disponible | no disponible | No se identifican modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Los gates de comportamiento grounded del propio autor no se superan: `grounded_behavior_gate_passed` es `false`, con solo 2 de 26 casos superados (0,0769) y `grounded_source_supported_count` igual a 0.
- El `deterministic_pass_rate` es de 0,2692 sobre 26 casos, lo que indica que la mayoria de las respuestas no pasan el criterio deterministico definido por el autor.
- El modelo exige contexto recuperado por contrato: una pregunta sin contexto queda fuera del contrato entrenado y evaluado, por lo que no debe usarse como modelo de chat general.
- No se evaluo la calidad de recuperacion (la evaluacion se hizo con contexto oracle), de modo que el rendimiento en un pipeline RAG real sera inferior al de las cifras publicadas.
- Riesgo de memorizacion de contenido de entrenamiento, dado que el dataset deriva del sitio web de Kanha y su hash es identico en entrenamiento y validacion.
- Riesgo de respuestas incorrectas, incompletas o desactualizadas, tal y como advierte el autor.
- Tamano de datos muy reducido (210 registros de entrenamiento, 45 de validacion, holdout vacio), lo que limita la generalizacion y aumenta la varianza de las metricas.
- `list_recall` de 0,4301: el modelo es poco fiable extrayendo listas del contexto.
- Contexto limitado a 4096 tokens, insuficiente para corpus extensos si no se trocean adecuadamente.
- Idioma unico: ingles. No hay soporte declarado de castellano ni de otros idiomas.
- Licencia no disponible: no puede asumirse permiso de uso comercial. Cualquier explotacion comercial debe aclararse con el autor antes de desplegar.
- Uso previsto declarado: investigacion comparativa de metodos de entrenamiento y evaluacion controlada de QA de sitio web. No esta declarado para uso orientado a usuario final.
- No hay artefacto MLC validado ni conversion GGUF publicada; la validacion en navegador o en dispositivos concretos queda pendiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kanha-AI/kanha-minicpm5-2b-grounded-conservative-3ep-20260910
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Revision del modelo base y del tokenizer: commit `cd199ce3ee67549c42ef7372f809f2c63599a3e9`
- Sitio del autor: https://kanha.ai
- Artefactos de procedencia declarados en el repositorio: `research/run-manifest.json`, `research/training-config.yaml`, `research/publication-inventory.json`, `research/evaluation/metrics.json`, `research/evaluation/evaluation-manifest.json`
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente dominios no relacionados).
