# nekojin116/amadeus-gemma-2-9b-gguf

## Resumen

`nekojin116/amadeus-gemma-2-9b-gguf` es una conversión a formato GGUF de un ajuste fino (finetune) sobre un modelo de la familia Gemma 2 de 9 000 millones de parámetros. El repositorio lo publica el usuario nekojin116 y contiene un único fichero de pesos cuantizado en Q4_K_M, además de un Modelfile para Ollama. Según el nombre del fichero (`gemma-2-9b-it.Q4_K_M.gguf`) y los tags del repo (`gemma2`), el modelo base es la versión instruction-tuned de Gemma 2 9B de Google; el autor no lo confirma de forma explícita en la model card.

El interés práctico del artefacto es que empaqueta un finetune en un formato directamente ejecutable con llama.cpp y Ollama, lo que permite desplegarlo en hardware de consumo sin infraestructura adicional. El proceso de ajuste y conversión se realizó con Unsloth, herramienta que acelera el entrenamiento y estandariza la exportación a GGUF.

Ahora bien, el repositorio no aporta información sobre el dataset de ajuste, el propósito del finetune, la licencia ni los idiomas. Tiene 0 descargas y 0 likes en el momento de la consulta, y no se han encontrado referencias externas que documenten su calidad. Debe tratarse, por tanto, como un artefacto no validado por la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Gemma 2 (atención con ventana deslizante alternada en el modelo base) |
| Parámetros totales | 9.241.705.984 (≈9,24 B) |
| Parámetros activos | No aplica: modelo denso |
| Longitud de contexto | No disponible en la model card; el modelo base Gemma 2 9B IT declara 8.192 tokens |
| Tipos de cuantización | Q4_K_M (único fichero publicado) |
| Idiomas soportados | No disponible |
| Licencia | No disponible en el repositorio; el modelo base Gemma 2 se distribuye bajo Gemma Terms of Use |
| Formato de pesos | GGUF (llama.cpp) |
| Ficheros publicados | `gemma-2-9b-it.Q4_K_M.gguf` + Modelfile de Ollama |
| Tamaño del repositorio | 5,8 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-25 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo, solo indica que fue ajustado y convertido a GGUF con Unsloth. Por el nombre del fichero y los tags se infiere que se parte de `gemma-2-9b-it`, un transformer decoder-only de aproximadamente 9,24 B de parámetros perteneciente a la familia Gemma 2 de Google, que emplea atención con ventana deslizante alternada (capas locales y globales), normalización RMSNorm y activación GeGLU. No hay información en el repositorio que permita verificar esta correspondencia ni confirmar si el ajuste modificó la arquitectura o solo los pesos.

Respecto al entrenamiento, se desconoce por completo el corpus utilizado, el número de tokens vistos, la composición del dataset y si se aplicaron técnicas de alineación adicionales como RLHF o DPO. La model card es la plantilla genérica que genera Unsloth al exportar: no incluye hiperparámetros, ni régimen de entrenamiento (LoRA/QLoRA frente a ajuste completo), ni evaluación posterior. El único detalle técnico específico es una nota que indica que se ajustó el comportamiento del token BOS para garantizar la compatibilidad con GGUF.

Sí se puede afirmar que la conversión a GGUF incluye la cuantización Q4_K_M (bloques de 4 bits con escalas jerárquicas para las matrices más sensibles), un esquema que típicamente reduce el peso del modelo a unos 5-6 GB manteniendo una degradación de calidad moderada frente a FP16.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base instruction-tuned.
- Razonamiento y comprensión lectora de nivel general, sin datos específicos publicados sobre el finetune.
- Generación de código y matemáticas: capacidad esperable del modelo base, no evaluada en este repositorio.
- Ejecución local con llama.cpp mediante `llama-cli -hf nekojin116/amadeus-gemma-2-9b-gguf --jinja`.
- Compatibilidad declarada con el pipeline multimodal de llama.cpp (`llama-mtmd-cli`), si bien el fichero publicado es un modelo de texto; no se aporta ningún proyector multimodal.
- Despliegue directo en Ollama mediante el Modelfile incluido.
- Compatibilidad con endpoints de Hugging Face (tag `endpoints_compatible`).
- Soporte de plantilla de chat vía `--jinja` (aplicación de la plantilla de conversación embebida en el GGUF).
- Capacidades multilingües y de tool calling: no documentadas para este finetune.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo sin GPU dedicada: con ~5,8 GB en Q4_K_M el modelo se puede ejecutar en CPU o en GPUs de gama media, útil para prototipos de chatbot con contexto de hasta 8.192 tokens.
- Evaluación de finetunes comunitarios: investigadores que quieran medir empíricamente qué aporta este ajuste frente a `gemma-2-9b-it` pueden desplegarlo con llama.cpp y comparar respuestas lado a lado.
- Generación de texto asistida en local con requisitos de privacidad: al ejecutarse íntegramente en la máquina del usuario mediante Ollama, los prompts no salen del entorno, lo que encaja en escenarios con datos sensibles.
- Base para pipelines de Retrieval-Augmented Generation: el contexto declarado del modelo base (8.192 tokens) permite inyectar varios fragmentos documentales por consulta en un servicio interno de búsqueda.
- Prototipado rápido de aplicaciones con la API compatible de Ollama: el Modelfile incluido permite levantar el modelo con `ollama create` y consumirlo por HTTP sin escribir código de inferencia.
- Experimentación docente con cuantización GGUF: sirve para ilustrar el flujo Unsloth → GGUF → llama.cpp/Ollama y medir el impacto de Q4_K_M frente a pesos completos.
- Tareas de redacción y resumen en castellano (si el finetune conserva el multilingüismo del base): sin evaluación publicada, requiere validación previa por el equipo que lo adopte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y no se ha localizado ninguna evaluación externa del finetune. Tampoco hay mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 5,5-6,5 GB con Q4_K_M para el fichero de pesos, más el caché KV correspondiente al contexto utilizado (crece linealmente con la longitud de la secuencia; a 8.192 tokens el sobrecoste es de unos pocos cientos de MB).
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 ejecutan el modelo con holgura en Q4_K_M. En tarjetas de 8 GB cabe, aunque con margen ajustado si se usa contexto largo.
- GPU de datacenter: A100, H100 y L40S lo ejecutan sobradamente; no son necesarias para este tamaño.
- Ejecución en CPU: viable con llama.cpp; el rendimiento depende del número de núcleos y del ancho de banda de memoria. No hay cifras publicadas.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (Modelfile incluido) y cualquier runtime que consuma GGUF (por ejemplo, LM Studio). vLLM y TGI no cargan GGUF de forma nativa sin conversión previa.
- Latencia y throughput: no disponibles; no se han publicado mediciones. Cualquier cifra aportada por terceros debería validarse en el hardware objetivo.

## Comparativa con modelos similares

Los datos de las alternativas provienen de la documentación pública de cada modelo base y se incluyen como referencia; no proceden de una evaluación conjunta con este finetune.

| Modelo | Parámetros | Contexto | Licencia | Formato disponible | Estado de validación |
|---|---|---|---|---|---|
| amadeus-gemma-2-9b-gguf (este repo) | 9,24 B | No disponible (base: 8.192) | No disponible (base: Gemma Terms of Use) | GGUF Q4_K_M | 0 descargas, sin evaluación |
| Gemma 2 9B IT (Google) | 9,24 B | 8.192 tokens | Gemma Terms of Use | Safetensors, GGUF oficiales | Documentado y evaluado por el autor |
| Llama 3.1 8B Instruct (Meta) | ~8,03 B | 131.072 tokens | Llama 3.1 Community License | Safetensors, GGUF | Documentado y ampliamente evaluado |
| Qwen2.5 7B Instruct (Alibaba) | ~7,62 B | 32.768 tokens | Apache 2.0 | Safetensors, GGUF | Documentado y ampliamente evaluado |

Frente a estas alternativas, la única ventaja diferencial de este repositorio sería el efecto del finetune, que no está documentado ni evaluado, y su licencia, que tampoco se especifica. Para producción, las versiones oficiales de los tres modelos base ofrecen garantías de trazabilidad, soporte de contexto mucho mayor (en el caso de Llama 3.1) y licencias explícitas.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla automática de Unsloth y no describe dataset, objetivo del finetune, hiperparámetros ni evaluación.
- Licencia no declarada: no se indica qué términos aplican. Al derivar presumiblemente de Gemma 2, se heredarían las Gemma Terms of Use, que imponen restricciones de uso comercial y obligaciones de atribución; conviene confirmarlo antes de cualquier despliegue productivo.
- Sin validación comunitaria: 0 descargas y 0 likes, sin issues ni referencias externas. No hay evidencia de calidad ni de que el finetune no haya degradado capacidades del base.
- Riesgo de alucinación: no cuantificado para este ajuste; en modelos de 9 B en Q4_K_M es esperable un cierto deterioro frente a FP16, especialmente en tareas de razonamiento largo.
- Contexto limitado si se confirma la herencia del base: 8.192 tokens es una ventana notablemente menor que la de Llama 3.1 8B (131.072), lo que restringe casos de uso con documentos extensos.
- Idiomas no declarados: se desconoce si el finetune conserva el soporte multilingüe del modelo base; el castellano no está verificado.
- Cuantización única: solo se publica Q4_K_M. No hay opciones de mayor precisión (Q8_0, FP16) para comparar la pérdida de calidad.
- Trazabilidad dudosa: el nombre del fichero sugiere el base, pero el autor no lo confirma; no hay hashes ni ficha de procedencia del ajuste.
- La búsqueda web sobre este modelo no devuelve resultados pertinentes, por lo que no existe verificación externa de su contenido ni de su rendimiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nekojin116/amadeus-gemma-2-9b-gguf
- Unsloth (herramienta de ajuste y conversión citada en la model card): https://github.com/unslothai/unsloth
- No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a este modelo en la información disponible.
