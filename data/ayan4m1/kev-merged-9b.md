# ayan4m1/kev-merged-9b

## Resumen

kev-merged-9b es un modelo publicado por ayan4m1 (Andrew DeLisa) en HuggingFace, consistente en la fusión del adaptador jaredpalmer/kev-9b con su modelo base Qwen/Qwen3.5-9B-Base. La model card lo describe de forma explícita y mínima: "This is a merge of kev-9b with its base model, so you don't have to use an adapter". El objetivo declarado es, por tanto, puramente operativo: ofrecer un único checkpoint que ya incorpora los pesos del adaptador, evitando tener que cargar una LoRA por separado.

El modelo tiene 9.653.104.368 parámetros (~9,65B) en formato safetensors, con un repositorio de 19,3 GB, licencia Apache 2.0 e idioma declarado únicamente inglés. Los metadatos de HuggingFace lo etiquetan con la arquitectura qwen3_5 y con el pipeline image-text-to-text, además de text-generation-inference, transformers y unsloth. Es relevante ahora porque forma parte de la familia Kev de Jared Palmer, una alternativa open source a los modelos de decisión Jev (TypeSafe AI): modelos que reciben preguntas tipadas y devuelven probabilidades calibradas en una sola pasada, sin generación de texto.

Conviene señalar una tensión importante entre fuentes: la familia Kev se describe como adaptadores LoRA (r=16) más una cabeza pointer sobre una base Qwen congelada, orientados a decisión y calibración, mientras que este merge se publica con pipeline image-text-to-text y etiquetas de generación conversacional. La información disponible no aclara si el merge conserva la cabeza pointer ni cómo se comporta como generador de texto, por lo que cualquier uso en producción debería validarse empíricamente antes de asumir un comportamiento concreto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder de la familia Qwen3.5 (tag qwen3_5); derivado por fusión de adaptador sobre Qwen/Qwen3.5-9B-Base |
| Parámetros totales | 9.653.104.368 (~9,65B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en la información proporcionada; el repositorio publica pesos safetensors completos |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Pipeline declarado | image-text-to-text |
| Modelos base | Qwen/Qwen3.5-9B-Base, jaredpalmer/kev-9b (relación: merge) |
| Tamaño del repositorio | 19,3 GB |
| Idiomas | en |
| Fecha de creación | 2026-09-30 |

## Arquitectura y entrenamiento

La model card no documenta proceso de entrenamiento alguno: no indica número de tokens, composición del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. Lo único que se declara es la operación de merge entre jaredpalmer/kev-9b y Qwen/Qwen3.5-9B-Base. Por tanto, la arquitectura efectiva es la del modelo base Qwen3.5-9B (transformer decoder de la familia Qwen3.5, según el tag qwen3_5), sobre cuya base congelada la familia Kev entrena un adaptador LoRA de rango 16 más una cabeza pointer, según la documentación pública del proyecto Kev en GitHub. Este repositorio empaqueta el resultado de aplicar ese adaptador al base para su uso directo.

La innovación técnica atribuible a la familia Kev, y que este merge hereda, es de formulación del problema más que de arquitectura: en lugar de generar texto, el modelo recibe preguntas tipadas y devuelve probabilidades calibradas en un único forward pass. La información disponible no confirma que el merge preserve esa cabeza de decisión ni el mecanismo de calibración, ni detalla el número de tokens de entrenamiento o la composición del corpus utilizado en el adaptador original. Tampoco se especifica la longitud de contexto soportada. Todo ello queda como no disponible.

## Capacidades

- Decisión con probabilidades calibradas: según la descripción de la familia Kev, recibe preguntas tipadas y devuelve probabilidades en una sola pasada, sin generar texto.
- Generación de texto: el pipeline se declara explícitamente como image-text-to-text y las etiquetas incluyen text-generation-inference y conversational, aunque la model card no detalla el comportamiento generativo del merge.
- Procesamiento de imagen y texto: el pipeline image-text-to-text implica entrada multimodal, pero no se documenta alcance, resolución ni tipo de tareas visuales soportadas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a inglés según el campo language del modelo.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.
- Compatibilidad con Unsloth para fine-tuning: etiquetado como unsloth, lo que sugiere soporte de entrenamiento optimizado con esa librería.
- Compatibilidad con endpoints: etiquetado como endpoints_compatible y text-generation-inference, lo que apunta a despliegue en infraestructura de inferencia gestionada.

## Casos de uso

- Enrutado y triaje con umbral de confianza: si el merge conserva la cabeza de decisión de la familia Kev, puede usarse para clasificar consultas entrantes y derivarlas a distintos flujos según la probabilidad calibrada devuelta, evitando depender de texto libre generado.
- Filtrado y guardarraíles en producción: un modelo que devuelve probabilidades calibradas permite fijar umbrales explícitos y medir la tasa de respuestas con confianza alta sobre entradas no respondibles, métrica que el propio proyecto Kev reporta.
- Asistente conversacional en inglés: las etiquetas conversational y text-generation-inference permiten desplegarlo como endpoint de chat en inglés, siempre que se valide antes su calidad generativa real.
- Punto de partida para fine-tuning adicional: la etiqueta unsloth y el formato safetensors lo hacen adecuado como checkpoint inicial para ajuste con LoRA o QLoRA sobre dominios específicos en inglés.
- Extracción de información multimodal: el pipeline image-text-to-text sugiere uso en tareas que combinan imagen y texto, como lectura de documentos escaneados, aunque no hay documentación que garantice su calidad en ese escenario.
- Investigación sobre merging de modelos: sirve como caso de estudio reproducible de fusión adaptador-base y de cómo un merge altera el comportamiento respecto al adaptador original.
- Evaluación comparativa de calibración: útil para replicar los experimentos del proyecto Kev (comparación de confianza entre Kev y Jev mediante bootstrap pareado) sobre una versión ya fusionada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para ayan4m1/kev-merged-9b: no hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales.

El único dato numérico recuperado en la búsqueda web corresponde a jaredpalmer/kev-9b, el adaptador de origen, no al merge:

| Métrica | Kev-9B | Jev | Nota |
|---|---|---|---|
| Tasa de respuesta con confianza ≥ 0,9 en registros "unknowable" | 0 % | 9 % | Dato publicado en el repositorio GitHub del proyecto Kev |
| Ruta de evaluación | fp32 | fp32 | La documentación advierte que las cifras publicadas usan evaluación fp32, no la ruta de servicio bf16 |

Estos valores deben tratarse con cautela: miden calibración sobre entradas sin respuesta conocida en el adaptador original, con evaluación en fp32, y no son extrapolables automáticamente a este checkpoint fusionado ni a un despliegue en bf16.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 19,3 GB solo para pesos, más caché KV y activaciones; en la práctica por encima de 20-24 GB según longitud de contexto (valor de contexto no disponible).
- VRAM estimada en cuantización de 8 bits: del orden de 10-11 GB para pesos.
- VRAM estimada en cuantización de 4 bits: del orden de 5-7 GB para pesos, aunque no se publican GGUF oficiales en la información disponible.
- GPU profesionales recomendadas: A100 40/80 GB, H100, L40S para servicio concurrente con contexto largo.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede alojar los pesos en bf16 con margen reducido; tarjetas de 12-16 GB requerirían cuantización de 8 o 4 bits.
- Opciones de despliegue: transformers y text-generation-inference están etiquetados explícitamente; vLLM es viable al ser un transformer estándar, aunque no se confirma en la información. Para llama.cpp u Ollama no hay pesos GGUF publicados, por lo que requerirían conversión propia.
- Latencia y throughput estimados: no disponible. No se han publicado cifras de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| ayan4m1/kev-merged-9b | ~9,65B | no disponible | safetensors | Apache 2.0 | HuggingFace (0 descargas) | Merge listo para usar sin adaptador |
| jaredpalmer/kev-9b | no disponible | no disponible | adaptador LoRA (r=16) + cabeza pointer | no disponible en la información | HuggingFace | Requiere cargar el adaptador sobre la base Qwen |
| Qwen/Qwen3.5-9B-Base | ~9B | no disponible | safetensors | no disponible en la información | HuggingFace | Modelo base sin adaptar; sin cabeza de decisión |
| Kev-4B / Kev-0.8B / Kev-27B | 4B / 0,8B / 27B | no disponible | adaptadores LoRA | no disponible en la información | HuggingFace y GitHub | Alternativas de la misma familia por tamaño |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada, por lo que la comparación se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Model card mínima: no documenta datos de entrenamiento, contexto, cuantizaciones ni evaluación, lo que dificulta estimar su comportamiento en producción sin pruebas propias.
- Ambigüedad funcional: la familia Kev se describe como modelo de decisión sin generación de texto, mientras que las etiquetas del repositorio apuntan a generación conversacional y multimodal. La información disponible no resuelve esta contradicción.
- Riesgo de calibración degradada: la documentación del proyecto advierte que las cifras publicadas se obtuvieron en fp32 y no en la ruta de servicio bf16; servir en bf16 puede alterar la calibración de las probabilidades.
- Riesgo de alucinación: si el merge se emplea como generador de texto, no hay datos publicados sobre su tasa de alucinación ni sobre fidelidad factual.
- Limitación de idioma: únicamente inglés declarado; no hay evidencia de soporte para castellano u otros idiomas.
- Contexto desconocido: al no especificarse la longitud de contexto, no se puede garantizar el comportamiento en conversaciones multi-turno largas o documentos extensos.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.5-9B y del adaptador kev-9b, no disponibles en la información proporcionada, para confirmar compatibilidad de términos.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, por lo que no existe retroalimentación de la comunidad ni incidencias reportadas.
- Sin pesos cuantizados publicados: no hay GGUF ni GPTQ/AWQ oficiales, lo que obliga a convertir y validar por cuenta propia para despliegues ligeros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ayan4m1/kev-merged-9b
- Adaptador de origen: https://huggingface.co/jaredpalmer/kev-9b
- Repositorio GitHub del proyecto Kev: https://github.com/jaredpalmer/kev
- Releases del proyecto Kev: https://github.com/jaredpalmer/kev/releases
- Cobertura divulgativa de la familia Kev: https://www.explainx.ai/blog/kev-open-source-jev-clone-qwen35-family-2026
- Perfil del autor en HuggingFace: https://huggingface.co/ayan4m1/datasets
