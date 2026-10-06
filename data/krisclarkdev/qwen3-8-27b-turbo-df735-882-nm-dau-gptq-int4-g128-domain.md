# krisclarkdev/Qwen3.8-27B-TURBO-DF735-882-NM-DAU-GPTQ-Int4-g128-domain

## Resumen

El modelo `krisclarkdev/Qwen3.8-27B-TURBO-DF735-882-NM-DAU-GPTQ-Int4-g128-domain` es una cuantización GPTQ Int4 de 27.781.427.952 parámetros (~27,8B) del finetune `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`, que a su vez deriva de `Qwen/Qwen3.8-27B`. Se distribuye en safetensors, con licencia Apache-2.0, y está pensada para cargar en vLLM estándar tanto en CUDA como en Intel XPU sin parches personalizados.

La relevancia de este checkpoint es de despliegue: el finetune original solo se publicó en BF16 (~55,6 GB) o GGUF, y otras cuantizaciones Int4 de la comunidad no cargan en vLLM porque cuantizan `lm_head` a int8 o usan `auto-round`. Esta versión usa GPTQ puro, grupo 128 simétrico, deja `lm_head`, `embed_tokens`, la torre de visión, `linear_attn.in_proj_a/b` y las capas MTP sin cuantizar, y conserva la decodificación especulativa MTP con 262.144 tokens de contexto nativo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text con torre de visión y cabezas MTP; incluye proyecciones `linear_attn`; no se detalla si es MoE |
| Parámetros totales | 27.781.427.952 (~27,8B) según safetensors |
| Parámetros activos | no disponible; no se indica que sea MoE |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantización | GPTQ Int4, w4a16, `group_size=128`, simétrico, `desc_act=false`, `pack_dtype=int32`; `lm_head`, `embed_tokens`, `linear_attn.in_proj_a/b`, torre de visión y capas MTP sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio no entrena un modelo nuevo: es una requantización GPTQ Int4 del finetune de DavidAU, que a su vez parte de `Qwen/Qwen3.8-27B`. La receta se generó con `gptqmodel 7.3.2`, con 4 bits, grupo 128, simétrico, sin `desc_act`, `true_sequential=true`, `lm_head=false` y `dynamic={"-:.*mtp.*": {}}` para excluir las capas MTP. Solo se cuantizan las 10 proyecciones `Linear` por capa del decodificador; el resto de tensores, incluida la torre de visión, permanece sin cuantizar.

La calibración usó una mezcla de code 45%, tool-call 25%, reasoning 20% y prose 10%, con dominio `g128-domain`. La model card no documenta número de tokens de entrenamiento, composición completa del dataset, RLHF o DPO del modelo base. La innovación práctica es conservar 15 tensores `mtp.*` sin cuantizar, de modo que la decodificación especulativa multi-token sigue operativa, algo que se pierde en la mayoría de cuantizaciones comunitarias.

## Capacidades

- Generación de texto conversacional y respuesta multi-turno.
- Entrada image-text-to-text: la torre de visión se conserva sin cuantizar.
- Tool calling / function calling en vLLM mediante `--enable-auto-tool-choice` y `--tool-call-parser qwen3_xml`.
- Decodificación especulativa MTP con `num_speculative_tokens=4`.
- Contexto largo nativo de 262.144 tokens.
- Razonamiento y matemáticas: la calibración incluye 20% de reasoning y reporta perplejidad de 1,9196 en gsm8k test, aunque no hay exactitud publicada.
- Generación de código: la calibración dedica 45% a código, sin benchmarks HumanEval publicados.
- Capacidades multilingües: no disponibles.
- No se documentan audio, agentes autónomos ni otras modalidades.

## Casos de uso

- Atención al cliente automatizada: puede gestionar conversaciones multi-turno con historiales largos gracias a sus 262.144 tokens de contexto nativo, y usar tool calling para consultar pedidos, CRM o bases de conocimiento.
- Generación de código en producción: la calibración dedica 45% a código y soporta tool calling, por lo que puede integrarse en pipelines de CI/CD para generar parches, revisar diffs o invocar APIs de build.
- Análisis de documentos con imágenes: al ser image-text-to-text y conservar la torre de visión sin cuantizar, puede extraer datos de capturas, diagramas o PDFs renderizados en flujos de back office.
- Tutoría matemática y razonamiento paso a paso: la calibración incluye 20% de reasoning y el modelo reporta perplejidad de 1,9196 en gsm8k test; sirve para resolver problemas guiados, aunque no hay métrica de exactitud.
- Agentes de automatización con function calling: el soporte de tool calling en vLLM permite orquestar llamadas a APIs, bases de datos o servicios internos en tareas multi-paso.
- Revisión de repositorios largos: la ventana de 262.144 tokens permite analizar varios archivos o un monorepo mediano en una sola pasada, con la salvedad de que en 32 GB el autor baja `max-model-len` a 100.000.
- Despliegue en vLLM sobre Intel XPU: al ser GPTQ simétrico con `lm_head` en BF16, evita los fallos de kernel WNA16 con `uint8b128` y de `auto-round`, lo que facilita servir el finetune en infraestructura Intel.
- Experimentación con decodificación especulativa: conserva 15 tensores `mtp.*` sin cuantizar, por lo que se puede activar MTP con `num_speculative_tokens=4` para estudiar latencia y throughput, aunque no hay cifras publicadas.

## Benchmarks y rendimiento

| Benchmark | Conjunto | Métrica | Valor |
|---|---|---|---|
| wikitext2 | test | perplejidad | 5,28233245297406 |
| gsm8k | test | perplejidad | 1,9196096114232362 |

No se han publicado resultados de MMLU, HumanEval, GSM8K exactitud ni otras métricas de exactitud en la información disponible. Las perplejidades se calcularon en proceso contra un servidor vLLM activo, con calibración sobre `TRAIN` y evaluación sobre `TEST`.

## Requisitos de hardware

- Peso del repositorio: 19,6 GB.
- VRAM estimada: no hay cifra oficial. Los pesos cuantizados ocupan 19,6 GB; hay que sumar activaciones, caché KV y overhead del motor. El autor usa `--gpu-memory-utilization 0.84`, `--max-model-len 100000` y `--kv-cache-dtype fp8` en una tarjeta de 32 GB.
- GPU recomendadas: no se especifican modelos concretos. El autor menciona una tarjeta de 32 GB. vLLM soporta CUDA e Intel XPU. A100, H100 y RTX 4090 no se confirman en la información.
- Cabe en consumer GPU: no confirmado. Una GPU de 24 GB, como una RTX 4090, tendría poco margen para caché KV con contexto largo si los pesos ocupan ~19,6 GB; el ejemplo del autor necesita 32 GB.
- Opciones de despliegue: vLLM con `--quantization gptq`; también `transformers` y safetensors por las etiquetas del repositorio. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. MTP con `num_speculative_tokens=4` está soportado, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización/formato | Licencia | Disponibilidad en vLLM |
|---|---|---|---|---|---|
| Este checkpoint | 27,78B | 262.144 nativos | GPTQ Int4 g128 simétrico, safetensors | Apache-2.0 | Carga en vLLM stock, CUDA e Intel XPU |
| `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU` | 27,78B (derivado; no detallado en la model card) | no disponible | BF16 (~55,6 GB) o GGUF | Apache-2.0 | No indicado; requiere más VRAM |
| `Qwen/Qwen3.8-27B` | no disponible | no disponible | no disponible | Apache-2.0 | no disponible |
| Otras cuantizaciones Int4 de la comunidad | no disponible | no disponible | Int4 con `lm_head` int8 o `auto-round` | no disponible | Según el autor, no cargan en vLLM |

## Limitaciones y advertencias

- El finetune de origen está abliterated y uncensored; puede generar contenido inapropiado o no alineado con políticas de producción. Revisar la model card upstream antes de usarlo.
- Riesgo de alucinación no medido. Las perplejidades publicadas no miden veracidad ni exactitud factual.
- Idiomas soportados no documentados.
- Licencia Apache-2.0, que permite uso comercial, pero el contenido del finetune upstream puede requerir revisión adicional.
- Degradación por cuantización Int4 no medida frente a BF16. No hay comparativa de exactitud entre ambas versiones.
- El contexto nativo es 262.144 tokens, pero en una tarjeta de 32 GB el autor lo limita a 100.000; en GPUs menores habrá que reducirlo más.
- La decodificación especulativa MTP requiere que las capas MTP se construyan sin cuantizar. Overrides ingenuos de `--quantization` pueden romper la ruta de draft.
- En Intel XPU solo se soporta cuantización simétrica y no hay kernel int8 para `lm_head`; no usar `lm_head` int8 ni cuantización asimétrica si se despliega en esa ruta.
- No hay resultados de MMLU, HumanEval ni otras evaluaciones de exactitud.
- El repositorio tenía 0 descargas y 0 likes en el momento de la consulta, lo que implica poca validación comunitaria.

## Enlaces

- https://huggingface.co/krisclarkdev/Qwen3.8-27B-TURBO-DF735-882-NM-DAU-GPTQ-Int4-g128-domain
- https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- https://huggingface.co/Qwen/Qwen3.8-27B

No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
