# midium-ai/Laguna-XS-2.1-oQ4e

## Resumen

Laguna-XS-2.1-oQ4e es una cuantizacion mixta de 4 bits en formato MLX del modelo poolside/Laguna-XS-2.1, un MoE de 33.442.617.088 parametros totales (unos 3B activos por token) desarrollado por Poolside y orientado a tareas de agente de codigo. La cuantizacion la publica midium-ai con el cuantizador oQ4e de oMLX 0.7.2, que aplica cuantizacion ponderada por importancia a partir de una imatrix de activaciones, y reduce el peso de 66,9 GB en bf16 a 19,5 GB.

El modelo base tiene 40 capas y una ventana de contexto de 262.144 tokens, lo que lo situa en la categoria de modelos de codigo con contexto muy largo. Esta version cuantizada conserva exactamente la configuracion, el chat template, el tokenizer y el generation config del modelo original, incluido el factor de atencion YaRN corregido, y esta pensada para ejecutarse en runtimes MLX sobre hardware Apple Silicon.

Su relevancia practica esta en que permite desplegar un MoE de 33B con contexto de 262k en un equipo de sobremesa con memoria unificada, con una degradacion de calidad medida muy baja frente al bf16 (variacion de NLL de +0,0043 en codigo y +0,0025 en prosa) y un throughput de 124-128 tok/s en decodificacion simple, que sube a 250-252 tok/s con el drafter DFlash de Poolside.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer, 40 capas, con atencion YaRN (familia Laguna) |
| Parametros totales | 33.442.617.088 (~33,4B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 262.144 tokens (262k) |
| Tipos de cuantizacion | 4-bit mixta (oQ4e): expertos enrutados 4-bit grupo 64; proyecciones de atencion 5/6/8-bit; expertos compartidos 8-bit grupo 128; embeddings y lm_head 8-bit; router y norms sin cuantizar |
| Idiomas soportados | no disponible (el set de calibracion se denomina `oqe_code_multilingual`, pero no se detalla la lista de idiomas) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`, requiere runtime compatible con la arquitectura `laguna`) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mixture-of-experts con 40 capas, 33,4B parametros totales y aproximadamente 3B activos por token, lo que implica un reparto muy disperso de expertos (la cuantizacion cubre 29.952 expertos enrutados). Emplea atencion con escalado YaRN, con un factor de atencion corregido en la revision `c5f36269bbdbd3f27fddc9a9f9dbae0cf2cf57db`, que es lo que habilita la ventana de 262k tokens. Poolside lo disena especificamente para flujos de agente de codigo, no como modelo generalista.

Sobre el entrenamiento del modelo base no se proporciona informacion en la documentacion disponible (numero de tokens, composicion del dataset, uso de RLHF o DPO: no disponible). Lo que si se documenta es el proceso de cuantizacion: oQ4e aplica cuantizacion ponderada por importancia a partir de una imatrix de activaciones, con un set de calibracion `oqe_code_multilingual` de 286 muestras de 512 tokens recogidas hasta cubrir los 29.952 expertos enrutados. La asignacion de bits no es uniforme: los expertos enrutados van a 4 bits, las proyecciones de atencion se reparten entre 5 bits (55), 6 bits (107) y 8 bits (38), los expertos compartidos a 8 bits y el router y las norms quedan sin cuantizar, lo que protege los componentes mas sensibles del modelo.

## Capacidades

- Generacion de texto y codigo con modo conversacional (pipeline `text-generation`, tag `conversational`).
- Razonamiento orientado a tareas de agente de codigo, que es el proposito declarado del modelo base.
- Ventana de contexto de 262.144 tokens, adecuada para repositorios completos o sesiones de agente prolongadas.
- Decodificacion especulativa mediante el drafter DFlash de Poolside (`poolside/Laguna-XS-2.1-DFlash`), que duplica aproximadamente el throughput.
- Muestreo recomendado por el autor: temperature 1.0, top_k 20, top_p 1.0.
- Soporte multilingue de codigo: el set de calibracion se denomina `oqe_code_multilingual`, aunque no se detalla la cobertura exacta de lenguajes.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible.

## Casos de uso

- Agente de codigo en local sobre Apple Silicon: el modelo esta pensado para flujos de agente y cabe en un equipo con memoria unificada de 128 GB, lo que permite trabajar con repositorios completos sin enviar codigo a la nube.
- Refactorizacion de repositorios grandes: con 262k tokens de contexto se puede cargar un arbol de codigo amplio y pedir cambios coherentes entre multiples ficheros en una sola sesion.
- Asistente de revision de pull requests: el modelo puede analizar diffs extensos y el contexto circundante en una unica pasada, con un coste de inferencia bajo gracias a los ~3B parametros activos.
- Generacion de codigo asistida en IDE con latencia interactiva: 124-128 tok/s en decodificacion simple y 250-252 tok/s con DFlash en un M5 Max de 128 GB lo hacen viable para autocompletado y chat en editor.
- Migracion de bases de codigo entre lenguajes o frameworks: el contexto largo y el enfasis multilingue del set de calibracion permiten traducir modulos completos manteniendo coherencia entre ficheros.
- Despliegue en pipelines de investigacion con MLX: al ser una cuantizacion de 19,5 GB, se puede iterar rapidamente sobre prompts y evaluaciones en un unico equipo sin infraestructura de GPU dedicada.
- Prototipado de agentes multi-paso: la combinacion de contexto largo y velocidad de decodificacion reduce el coste por episodio en bucles de razonamiento y llamadas a herramientas, siempre que se valide el soporte de tool calling en el runtime elegido.

## Benchmarks y rendimiento

La model card no publica benchmarks estandar (MMLU, HumanEval, GSM8K). Los unicos datos cuantitativos son la evaluacion de fidelidad frente al bf16 y las medidas de velocidad.

| Metrica | Resultado |
|---|---|
| Cambio de NLL vs bf16 en codigo (6.144 tokens) | +0,0043 ± 0,0083 |
| Top-1 coincide con bf16 en codigo | 94,8% |
| Cambio de NLL vs bf16 en prosa (4.096 tokens) | +0,0025 ± 0,0129 |
| Top-1 coincide con bf16 en prosa | 88,6% |
| Velocidad de decodificacion (Midium engine, M5 Max 128 GB, greedy, respuesta de ~1.300 tokens) | 124-128 tok/s |
| Velocidad con drafter DFlash | 250-252 tok/s |

La evaluacion se hizo con teacher forcing, colocando el texto como respuesta del asistente en el chat template, porque el modelo esta fuera de distribucion sobre texto plano. No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- Memoria para los pesos: 19,5 GB en esta cuantizacion oQ4e (frente a 66,9 GB del bf16). A ello hay que sumar la cache KV, que con 262k tokens de contexto puede ser muy exigente en memoria.
- Hardware de referencia del autor: Apple M5 Max con 128 GB de memoria unificada, donde se obtienen las cifras de 124-128 tok/s y 250-252 tok/s con DFlash.
- GPU NVIDIA (A100, H100, RTX 4090): no disponible; el formato es MLX y requiere runtimes compatibles con la arquitectura `laguna`, por lo que no se documenta soporte en CUDA.
- GPU de consumo: no se documenta el comportamiento en GPUs de consumo; el modelo esta orientado a Apple Silicon con memoria unificada.
- Opciones de despliegue: mlx-vlm >= 0.7 y el motor Midium (midium.dev). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Throughput: 124-128 tok/s en decodificacion simple y 250-252 tok/s con decodificacion especulativa DFlash en el hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Laguna-XS-2.1-oQ4e (esta ficha) | 33,4B totales / ~3B activos | 262k | 4-bit mixta MLX (19,5 GB) | OpenMDW-1.1 | Hugging Face, runtime MLX |
| poolside/Laguna-XS-2.1 (bf16) | 33,4B totales / ~3B activos | 262k | bf16 (66,9 GB) | OpenMDW-1.1 | Hugging Face |
| poolside/Laguna-XS-2.1-DFlash | no disponible | no disponible | no disponible | no disponible | Hugging Face (drafter) |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- El modelo esta fuera de distribucion sobre texto plano: el autor indica que la evaluacion debe hacerse colocando el texto como respuesta del asistente en el chat template. Usarlo como modelo de texto generico degrada la calidad.
- Solo funciona en runtimes MLX que soporten la arquitectura `laguna` (mlx-vlm >= 0.7 o Midium); no hay soporte documentado para CUDA, llama.cpp, vLLM u Ollama.
- La cuantizacion introduce una perdida medible, aunque pequena: +0,0043 de NLL en codigo y +0,0025 en prosa, con una coincidencia top-1 del 94,8% y 88,6% respectivamente frente al bf16.
- La licencia OpenMDW-1.1 es una licencia "other" con terminos propios; hay que revisar el texto completo antes de un uso comercial.
- No se documentan sesgos conocidos, riesgo de alucinacion especifico ni lista de idiomas soportados.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (18 de noviembre de 2026): es una publicacion muy reciente y sin validacion comunitaria.
- El contexto de 262k implica un consumo de memoria KV considerable que puede limitar el tamano efectivo de lote en equipos de 128 GB.
- No se documenta soporte de tool calling, vision ni audio, por lo que no deben asumirse en produccion sin verificacion previa.

## Enlaces

- Modelo cuantizado: https://huggingface.co/midium-ai/Laguna-XS-2.1-oQ4e
- Modelo base: https://huggingface.co/poolside/Laguna-XS-2.1
- Drafter DFlash: https://huggingface.co/poolside/Laguna-XS-2.1-DFlash
- Licencia OpenMDW-1.1: https://huggingface.co/poolside/Laguna-XS-2.1/blob/main/LICENSE.md
- Midium: https://midium.dev
