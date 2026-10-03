# IndexTeam/Index-Homura-9B-GGUF

## Resumen

Index-Homura-9B-GGUF es la conversion oficial al formato GGUF del modelo IndexTeam/Index-Homura-9B, un modelo de traduccion de 8.953.803.264 parametros (unos 8,95 mil millones) desarrollado por el equipo Index (vinculado al repositorio github.com/bilibili/Index-Translate). Forma parte de la familia Index-Translate, orientada a traduccion multilingue en 150 idiomas con soporte de restricciones de terminologia y formato, traduccion controlada para doblaje y traduccion de documentos largos.

El problema que resuelve es el de la traduccion "con restricciones": ademas de traducir texto plano, el modelo sigue el formato instTrans, que permite imponer restricciones duras (glosarios terminologicos obligatorios, preservacion de estructura en JSON/CSV/codigo/placeholders) y restricciones blandas (registro y estilo, desambiguacion de sentido por dominio, consistencia entre frases, preservacion de LaTeX). Los checkpoints Homura anaden traduccion con presupuesto de silabas, pensada para doblaje.

Esta publicacion concreta es relevante porque empaqueta doce niveles de cuantizacion estatica en un unico repositorio, desde Q2_K (3,83 GB) hasta f16 (17,92 GB), lo que permite ejecutar un modelo de traduccion de 9B en hardware de consumo mediante llama.cpp. La licencia es Apache 2.0 y la conversion se genero con llama.cpp master (2026-10).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica si es transformer denso, MoE o hibrida) |
| Parametros totales | 8.953.803.264 (aproximadamente 8,95B, dato de safetensors del modelo base) |
| Parametros activos | no aplica (no se ha indicado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 y f16 (cuantizacion estatica post-entrenamiento) |
| Idiomas soportados | 150 idiomas segun la model card de la familia Index-Translate (lista concreta no disponible) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors/BF16 |

Datos adicionales: tamano del repositorio 81,4 GB, 142 descargas y 0 likes en el momento de la consulta. Fecha de creacion 2026-10-02, ultima actualizacion 2026-10-03. Etiquetas relevantes: llama.cpp, gguf, translation, conversational y endpoints_compatible.

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo (no se especifica si se trata de un transformer denso, una mezcla de expertos, un modelo de espacio de estados o un diseno hibrido), ni el numero de tokens de entrenamiento, la composicion del dataset o si se aplicaron tecnicas de alineacion como RLHF o DPO. Lo unico confirmado es que el modelo base Index-Homura-9B tiene 8.953.803.264 parametros y que la familia Index-Translate cubre 150 idiomas con capacidades de traduccion restringida. Se recomienda consultar el informe tecnico Index-Translate: A Multilingual Translation Model Family (arXiv:2609.40181) para los detalles de arquitectura y entrenamiento, que no se reproducen en esta model card.

La innovacion tecnica destacable documentada es el formato instTrans de traduccion restringida. El cliente oficial envuelve las peticiones en la estructura canonica 【源文】<texto> seguida de restricciones numeradas: 1. 【硬性要求】 (restricciones duras, binarias: glosario terminologico estricto, preservacion de formato en JSON/CSV/codigo/placeholders) y 2. 【注意】 (restricciones blandas, graduadas: tono y estilo, desambiguacion de sentido por dominio, consistencia entre frases, preservacion de LaTeX). Los checkpoints Homura anaden traduccion con presupuesto estricto de silabas para doblaje, combinable con glosarios. La generacion recomendada es greedy con temperature=0 y el modo de razonamiento desactivado mediante enable_thinking: false en la plantilla de chat, lo que implica que el modelo base dispone de un modo de pensamiento conmutable.

## Capacidades

- Traduccion automatica multilingue en 150 idiomas (texto a texto).
- Traduccion con restricciones duras de terminologia: aplicacion obligatoria de glosarios con pares tipo `carbon fiber` o `crack resistance`.
- Preservacion de formato y estructura en JSON, CSV, codigo y marcadores de posicion (placeholders).
- Preservacion de LaTeX en documentos cientificos y tecnicos.
- Restricciones blandas de estilo y registro, por ejemplo adaptacion a un registro formal de correo empresarial.
- Desambiguacion de sentido segun dominio (por ejemplo, discriminar el sentido de una palabra polisemica en un contexto industrial).
- Consistencia terminologica entre frases a lo largo de un documento.
- Traduccion controlada por presupuesto de silabas para doblaje, combinable con glosarios.
- Traduccion de documentos largos, segun la descripcion de la familia Index-Translate.
- Modo conversacional (etiqueta conversational en el repositorio de HuggingFace).
- Modo de razonamiento conmutable mediante `enable_thinking` en la plantilla de chat (desactivado por defecto en las recomendaciones de traduccion).
- No hay informacion disponible sobre soporte de tool calling, function calling, agentes, vision o audio en el modelo de texto.

## Casos de uso

- Traduccion de documentacion tecnica con glosario corporativo obligatorio: gracias a las restricciones duras de instTrans, se puede fijar la terminologia exacta de la empresa y garantizar que terminos como nombres de producto o unidades no se traduzcan de forma inconsistente entre documentos.
- Localizacion de archivos de interfaz en JSON o CSV: el modelo preserva la estructura y los marcadores de posicion, por lo que puede traducir cadenas de recursos sin romper claves, variables ni plantillas de interpolacion.
- Doblaje y audiodescripcion con control de silabas: los checkpoints Homura respetan un presupuesto de silabas objetivo, lo que permite generar lineas de doblaje que encajen en la duracion del audio original, combinado con glosarios cuando sea necesario.
- Traduccion de articulos cientificos y preprints con matematicas: la preservacion de LaTeX evita la corrupcion de formulas al traducir texto academico entre idiomas.
- Traduccion de codigo y comentarios en pipelines de desarrollo: el modelo puede tratar comentarios, cadenas y documentacion inline manteniendo intactos identificadores y placeholders, lo que lo hace util en flujos de localizacion automatizada de repositorios.
- Atencion al cliente multilingue: con el modo conversacional y la posibilidad de desactivar el razonamiento explicito, se puede integrar en un servicio de respuestas en varios idiomas con latencia baja mediante decodificacion greedy.
- Despliegue local con requisitos de privacidad: al distribuirse en GGUF y ejecutarse con llama.cpp, permite traducir documentos sensibles sin enviar datos a servicios en la nube, algo relevante en sectores regulados.
- Traduccion de correspondencia empresarial con registro formal: las restricciones blandas permiten fijar un tono concreto (por ejemplo, correo comercial formal) de forma consistente en toda una tanda de textos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, BLEU, COMET u otros) en la informacion disponible. La model card unicamente describe un proceso de validacion de consistencia de las cuantizaciones: cada nivel se valido en GPU NVIDIA A100 frente a la conversion F16 mediante divergencia KL por token y delta-p RMS con `llama-perplexity`, ademas de comprobaciones puntuales de generacion greedy contra los pesos BF16 originales con la referencia de transformers. Se indica que las salidas de Q4_K_M coincidieron casi literalmente con la referencia, pero no se aportan cifras numericas de dichas metricas.

## Requisitos de hardware

- VRAM estimada segun el tamano de los ficheros GGUF disponibles: Q2_K 3,83 GB; Q3_K_S 4,26 GB; Q3_K_M 4,62 GB; Q3_K_L 4,93 GB; IQ4_XS 5,23 GB; Q4_K_S 5,35 GB; Q4_K_M 5,63 GB; Q5_K_S 6,31 GB; Q5_K_M 6,47 GB; Q6_K 7,36 GB; Q8_0 9,53 GB; f16 17,92 GB.
- A esas cifras hay que anadir el margen para la cache KV y los buffers de ejecucion, cuyo tamano depende del contexto configurado; la informacion disponible no cuantifica ese consumo.
- GPU de referencia usada para la validacion de las cuantizaciones: NVIDIA A100. No se documentan pruebas en otras GPU.
- Cabe en GPU de consumo: Q4_K_M (5,63 GB) es viable en tarjetas de 8 GB de VRAM; Q5_K_M y Q6_K encajan en tarjetas de 8-12 GB; Q8_0 requiere aproximadamente 12 GB o mas; f16 requiere alrededor de 20-24 GB, propio de tarjetas tipo RTX 3090/4090 de 24 GB, A100 o H100.
- Opciones de despliegue: llama.cpp, con los comandos `llama serve -hf IndexTeam/Index-Homura-9B-GGUF:Q4_K_M` y `llama cli -hf IndexTeam/Index-Homura-9B-GGUF:Q4_K_M`. El repositorio esta etiquetado como endpoints_compatible. No se ha confirmado en la informacion disponible compatibilidad con vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles. La model card solo recomienda decodificacion greedy con temperature=0 para traduccion.

## Comparativa con modelos similares

No se dispone de datos de rendimiento que permitan una comparativa cuantitativa. La unica comparacion posible dentro de la informacion proporcionada es con otros miembros de la misma familia:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Index-Homura-9B-GGUF | 8,95B | no disponible | 150 (familia) | apache-2.0 | GGUF (12 cuantizaciones) | HuggingFace, llama.cpp |
| Index-Homura-2B | no disponible | no disponible | 150 (familia) | no disponible | no disponible | HuggingFace |
| Index-Echo-S2TT-2B / 9B | 2B y 9B | no disponible | no disponible | no disponible | no disponible | HuggingFace |

No se han identificado en la informacion disponible modelos de otras familias comparables en tamano y tarea con datos verificables.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos del modelo, evaluaciones de sesgo ni auditorias de equidad.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. Como modelo generativo aplicado a traduccion, existe riesgo de omisiones, adiciones o invencion de contenido, especialmente en cuantizaciones agresivas.
- Las cuantizaciones Q2_K, Q3_K_S, Q3_K_M y Q3_K_L se describen explicitamente con "perdida de calidad significativa" (Q2) o "perdida de calidad notable" (Q3). Para produccion se recomienda Q4_K_M o superior.
- El propio autor recomienda decodificacion greedy con temperature=0 y el modo de razonamiento desactivado (`enable_thinking: false`) para tareas de traduccion; salirse de esa configuracion puede degradar la calidad y la estabilidad de las restricciones.
- No se han publicado datos sobre la longitud de contexto soportada, lo que limita la planificacion de casos de uso con documentos largos pese a que la familia se anuncia con soporte de traduccion de documentos largos.
- No se ha confirmado el soporte de tool calling, function calling ni flujos de agentes.
- La lista concreta de los 150 idiomas no esta disponible en la informacion proporcionada, por lo que no se puede verificar la cobertura de un idioma concreto.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base IndexTeam/Index-Homura-9B por si anaden restricciones adicionales.
- La model card esta redactada parcialmente en ingles y chino, y el prompt oficial de traduccion de ejemplo esta en chino; el formato instTrans usa marcadores en chino, lo que puede afectar a la ergonomia de integracion.
- Modelo con muy baja adopcion en el momento de la consulta (142 descargas, 0 likes) y publicado muy recientemente (2026-10-02), lo que implica poca validacion independiente por parte de la comunidad.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/IndexTeam/Index-Homura-9B-GGUF
- Modelo base: https://huggingface.co/IndexTeam/Index-Homura-9B
- Checkpoint hermano de 2B: https://huggingface.co/IndexTeam/Index-Homura-2B
- Informe tecnico (arXiv): https://arxiv.org/abs/2609.40181
- Codigo y prompts instTrans: https://github.com/bilibili/Index-Translate
- Referencia de prompts: docs/prompts.md y inference/llm/cases/ dentro del repositorio de codigo
- Conversion realizada con llama.cpp: https://github.com/ggml-org/llama.cpp
- Hilo en r/LocalLLaMA sobre la familia Index-Translate: https://www.reddit.com/r/LocalLLaMA/comments/1wugf2t/indextranslate_150_text_languages_plus_document/
- Descarga directa Q4_K_M (recomendada): https://huggingface.co/IndexTeam/Index-Homura-9B-GGUF/resolve/main/Index-Homura-9B.Q4_K_M.gguf
