# ArchiveStudio/Phi-4-reasoning-vision-15B

and <nothink> modes
- Trained 240 B200 GPUs for 4 days
- Context length: 16,384 tokens
- Inputs: text and images, outputs: text
- Release date: March 4, 2026 (though the card is from ArchiveStudio... interesting - the model card content mentions Microsoft as developer)

Note: there's a discrepancy - the author is ArchiveStudio but the model card is from Microsoft. I should present the information as provided without inventing. I'll note the HF ID and author.

Context length: 16,384 tokens
Parameters: 15B (15,119,518,144)

Let me write the ficha following the structure.

I need to be careful about not inventing. Let me use only provided data. I can use general knowledge about the models for comparisons, but should be careful. Actually the instructions say don't invent data. For comparativa, I can compare with similar models - I could mention Qwen2.5-VL, InternVL, etc. but I should be careful not to invent numbers. Let me be conservative - I can note comparable models but mark specs as "no disponible" where I'm not sure, or provide well-known values cautiously.

Actually, the safe approach is to mention comparable models but note that specific details should be verified. Hmm. Let me provide a comparison table with what I reasonably know but... the rule says don't invent. I'll provide a comparison with models and mark values I'm confident about, but I think it's safer to indicate clearly.

Let me think about the discrepancy: The HF repo author is ArchiveStudio, but the model card cites Microsoft as developer. This is worth noting in limitations. The benchmarks are unverified (verified: false).

Let me write it.

Context length: 16,384 tokens.

Now write everything in Spanish from Spain, no emojis, only first word of titles capitalized.

Let me draft.

## Resumen
...

## Especificaciones tecnicas
Table.

Arquitectura: Transformer multimodal con fusion intermedia (mid-fusion): backbone Phi-4-Reasoning + encoder visual SigLIP-2
Parametros totales: 15.119.518.144 (~15B)
Parametros activos: no aplica (no es MoE)
Longitud de contexto: 16.384 tokens
Tipos de cuantizacion: no disponible (repo solo safetensors; no se documentan GGUF/AWQ/GPTQ)
Idiomas: ingles (en)
Licencia: MIT
Formato de pesos: safetensors (custom_code)

## Arquitectura y entrenamiento
...

## Capacidades
...

## Casos de uso
min 6

## Benchmarks y rendimiento
Table.

## Requisitos de hardware
...

## Comparativa con modelos similares
...

## Limitaciones y advertencias
...

## Enlaces
...

Let me write with care.

For hardware: 15B parameters. In fp16 ~30GB. Repo size 30.2GB. In 4-bit ~8-9GB. Let me give reasonable estimates.

- FP16: ~30 GB
- 8-bit: ~16 GB
- 4-bit: ~9 GB

GPU: A100 40/80, H100, RTX 4090 24GB (with 4-bit or 8-bit and vision tokens... 30GB fp16 won't fit on 24GB). Vision tokens add memory.

Deployment: vLLM, llama.cpp (needs GGUF conversion since only safetensors available), TGI, Transformers with custom_code.

Let me be careful with latency/throughput - "no disponible".

Comparativa: comparable to Qwen2.5-VL-7B/72B, InternVL2.5, Llama-3.2-Vision, etc. But 15B is unusual size. I'll compare with models of similar category and note specs carefully. Hmm, I worry about inventing. Let me provide a comparison table with fields but mark known ones. Actually I think I can provide a qualitative comparison and note exact figures may vary. Let me include typical values but maybe safer to mark many as "no disponible" except obvious ones.

I'll do a comparison with Qwen2.5-VL-7B, InternVL2.5-8B, and maybe Gemma-3 (which is 27B multimodal). Actually let me keep it to 2-3 alternatives and be careful.

Hmm, I think I'll provide the comparison but clearly note that data for alternatives is approximate/general knowledge. Actually the rule says don't invent. I'll provide what I can confidently state and mark other cells as no disponible. Let me include: Qwen2.5-VL-7B-Instruct, InternVL2.5-8B, Llama-3.2-11B-Vision.

Actually, to be safe and not violate "don't invent", I'll provide the comparison table comparing parameters (which I know roughly) and context. Let me just be careful and use "no disponible" where uncertain.

Let me reconsider - I'll present comparisons based on widely known specs:
- Qwen2.5-VL-7B: 7B params, context 128K, Apache 2.0
- InternVL2.5-8B: 8B, Apache 2.0
- Llama-3.2-11B-Vision: 11B, Llama license

These are fairly well known. I'll present them but I should acknowledge uncertainty. Hmm. I'll include them and mark benchmark comparisons as not directly comparable.

Actually, to strictly follow rules, maybe I keep the comparison more qualitative. Let me include a table with parameters, context, license, modality, and note that direct benchmark comparison isn't available.

Let me write the final.

For enlaces: HF URL, blog, paper, github, foundry.

Let me finalize. Careful with "castellano de España" - use "safetensors", "razonamiento", etc.

Note on context length - the README says 16,384 tokens. Good.

Let me write.## Resumen

Phi-4-Reasoning-Vision-15B es un modelo multimodal de razonamiento de pesos abiertos que combina el backbone de lenguaje Phi-4-Reasoning con el codificador visual SigLIP-2 mediante una arquitectura de fusión intermedia (mid-fusion). El modelo convierte las imagenes en tokens visuales que se proyectan al espacio de embeddings del modelo de lenguaje, empleando un codificador visual de resolucion dinamica de hasta 3.600 tokens visuales, lo que permite comprension de imagenes en alta resolucion para tareas de grounding de interfaz grafica y analisis documental fino. Cuenta con aproximadamente 15.119.518.144 parametros (unos 15B) y una longitud de contexto de 16.384 tokens.

El modelo esta disenado como un unico sistema que puede invocar razonamiento extendido en cadena de pensamiento (bloques `<think>...</think>`) para tareas matematicas y cientificas, o bien recurrir a inferencia directa (etiquetada como `<nothink>`) para tareas de percepcion como captioning, deteccion de objetos y grounding. Segun la model card, se entreno mediante Supervised Fine-Tuning sobre una mezcla curada de datos de razonamiento y no razonamiento, con un coste de computo moderado (240 GPU NVIDIA B200 durante 4 dias).

Es relevante porque ofrece capacidades de razonamiento multimodal selectivo, OCR y computer-use en un tamano compacto (15B) con licencia MIT, lo que facilita su despliegue en entornos con restricciones de memoria o computo. La ficha de HuggingFace figura bajo el autor ArchiveStudio, aunque la model card atribuye el desarrollo a Microsoft Corporation y declara como base `microsoft/Phi-4-reasoning`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con fusion intermedia (mid-fusion): backbone Phi-4-Reasoning y encoder visual SigLIP-2; atencion bidireccional intra-imagen |
| Parametros totales | 15.119.518.144 (~15B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors; no se documentan GGUF, AWQ o GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (requiere `custom_code`) |
| Entradas / salidas | Texto e imagenes / texto |
| Tokens visuales maximos | Hasta 3.600 (resolucion dinamica) |
| Fecha de publicacion declarada | 4 de marzo de 2026 |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de fusion intermedia: el encoder visual SigLIP-2 transforma cada imagen en tokens visuales que, tras una proyeccion al espacio de embeddings, se inyectan en el modelo de lenguaje preentrenado Phi-4-Reasoning. El encoder visual usa resolucion dinamica y genera hasta 3.600 tokens visuales, lo que resulta critico para tareas de grounding de GUI y analisis de documentos detallados. Se aplica atencion bidireccional dentro de cada imagen (intra-imagen) para mejorar el razonamiento espacial, evitando los riesgos de sobreajuste que la model card asocia a esquemas bidireccionales mas amplios. El modelo es un unico sistema con modos de razonamiento conmutable mediante `<think>...</think>` y `<nothink>`, en lugar de modelos separados por modo.

El entrenamiento se realizo con Supervised Fine-Tuning (SFT) sobre una mezcla de datos de razonamiento y no razonamiento, compuesta principalmente por datasets de vision-lenguaje de codigo abierto filtrados y mejorados, complementados con datos de dominio especificos de equipos internos de Microsoft y adquisiciones de datos. Segun la model card, el computo de entrenamiento fue de 240 GPU NVIDIA B200 durante 4 dias (del 3 al 21 de febrero de 2026). El alineamiento de seguridad se llevo a cabo mediante SFT con ejemplos de utilidad y no dano, incluyendo muestras orientadas a comportamiento de rechazo para categorias como discurso de odio, violencia, autolesion y material sexualmente explicito, con red teaming automatizado en Azure. No se documenta en la informacion disponible el uso de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento multimodal sobre imagenes, con modo de cadena de pensamiento extendida (`<think>`) y modo de inferencia directa (`<nothink>`).
- Razonamiento matematico y cientifico a partir de contenido visual (declarado en la model card y reflejado en resultados de MathVista y MMMU).
- OCR y comprension de documentos (declarado mediante benchmarks como OCRBench).
- Comprension de graficos y diagramas (ChartQA, AI2D).
- Grounding de interfaz grafica (GUI grounding) y computer-use, con resultados declarados en ScreenSpot-V2.
- Percepcion visual general: captioning, deteccion de objetos y grounding (asociada al modo `<nothink>`).
- Conversacion multimodal multi-turno (pipeline `image-text-to-text` y tag `conversational`).
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Soporte de tool calling / function calling y de agentes: no disponible en la informacion proporcionada.

## Casos de uso

- Automatizacion de atencion al cliente con imagenes: el modelo puede gestionar conversaciones multi-turno donde el usuario adjunta capturas, facturas o productos, gracias a su pipeline de texto-imagen a texto y a su ventana de 16.384 tokens.
- Extraccion de datos de documentos: uso de OCR y comprension documental para digitalizar facturas, formularios o informes, aprovechando los resultados declarados en OCRBench y su encoder de alta resolucion (hasta 3.600 tokens visuales).
- Analisis de graficos financieros o cientificos: interpretacion de ChartQA y AI2D para responder preguntas sobre tendencias, ejes y valores en graficos y diagramas.
- Agentes de computer-use: grounding de elementos de interfaz a partir de capturas de pantalla (ScreenSpot-V2) para automatizar clics, rellenado de formularios o navegacion guiada.
- Tutoria educativa STEM: resolucion de problemas de matematicas y ciencias sobre fotos de enunciados o diagramas, con modo `<think>` para mostrar el razonamiento paso a paso.
- Asistencia en investigacion con figuras cientificas: interpretacion de tablas, diagramas y graficos en articulos, combinando vision y razonamiento matematico para resumir o responder preguntas.
- Moderacion de contenido visual asistida: clasificacion y descripcion de imagenes en pipelines de revision, apoyandose en el alineamiento de seguridad descrito en la model card.
- Accesibilidad: descripcion automatica de imagenes y graficos para usuarios con discapacidad visual, usando el modo de inferencia directa para captioning.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (todos marcados como `verified: false`, es decir, no verificados de forma independiente):

| Benchmark | Tarea | Metrica | Valor |
|---|---|---|---|
| AI2D | Visual question answering | Accuracy | 84,8 |
| ChartQA | Visual question answering | Accuracy | 83,3 |
| MathVista (MINI) | Visual question answering | Accuracy | 75,2 |
| MMMU | Visual question answering | Accuracy | 54,3 |
| OCRBench | Visual question answering | Accuracy | 76,0 |
| ScreenSpot-V2 | Visual question answering | Accuracy | 88,2 |

No se dispone de resultados de MMLU, HumanEval o GSM8K en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 30 GB en FP16/BF16 (el repositorio ocupa 30,2 GB), en torno a 16 GB en cuantizacion de 8 bits y unos 9 GB en 4 bits; a ello hay que anadir la memoria de los tokens visuales y la cache KV del contexto.
- GPU recomendadas: A100 (40/80 GB) y H100 para FP16/BF16; en consumer, RTX 4090/5090 (24 GB) solo en cuantizacion de 8 o 4 bits.
- Compatibilidad con GPU de consumo: posible en tarjetas de 24 GB o mas si se cuantiza; con precision completa no cabe en GPU de consumo.
- Opciones de despliegue: vLLM, TGI y Transformers (requiere `custom_code`). Para llama.cpp u Ollama seria necesaria una conversion a GGUF, no publicada en el repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables verificados en la informacion proporcionada. La siguiente tabla recoge caracteristicas generales de alternativas de la misma categoria (modelos de vision-lenguaje de tamano compacto-medio); los valores deben verificarse en las fichas oficiales de cada modelo.

| Modelo | Parametros | Contexto | Licencia | Modalidad |
|---|---|---|---|---|
| Phi-4-Reasoning-Vision-15B | ~15B | 16.384 tokens | MIT | Imagen + texto |
| Qwen2.5-VL-7B | ~7B | 128K tokens (no confirmado) | Apache 2.0 (no confirmado) | Imagen + texto |
| InternVL2.5-8B | ~8B | Hasta 128K (no confirmado) | Apache 2.0 (no confirmado) | Imagen + texto |
| Llama-3.2-11B-Vision | ~11B | 128K (no confirmado) | Licencia comunitaria Llama (no confirmado) | Imagen + texto |

Comparacion de rendimiento frente a estos modelos: no disponible.

## Limitaciones y advertencias

- Los resultados de benchmarks estan declarados como no verificados (`verified: false`) por el propio autor; conviene tratarlos con cautela hasta disponer de evaluaciones independientes.
- Discrepancia en la autoria: la ficha de HuggingFace aparece bajo el autor ArchiveStudio, mientras que la model card atribuye el desarrollo a Microsoft Corporation. Verificar la procedencia antes de un uso en produccion.
- Idioma: el campo `language` solo declara ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- Contexto limitado a 16.384 tokens, inferior al de algunos modelos multimodales contemporaneos.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en OCR, grounding y lectura de graficos; debe validarse la salida en tareas criticas.
- Sesgos: la model card no documenta una evaluacion exhaustiva de sesgos; los datasets de vision-lenguaje de codigo abierto pueden introducir sesgos de representacion.
- La atencion bidireccional se limita a la imagen intra; el razonamiento espacial fuera de ese esquema puede degradarse.
- Requiere `custom_code` para su carga, lo que implica confiar en codigo remoto del repositorio y puede complicar su integracion en entornos restringidos.
- Licencia MIT: permite uso comercial, pero se recomienda revisar las condiciones de los modelos y datos base subyacentes (Phi-4-Reasoning y SigLIP-2).
- El repositorio no publica pesos cuantizados (GGUF/AWQ/GPTQ), lo que obliga a generar las cuantizaciones de forma local.

## Enlaces

- Ficha de HuggingFace: https://huggingface.co/ArchiveStudio/Phi-4-reasoning-vision-15B
- Modelo base: https://huggingface.co/microsoft/Phi-4-reasoning
- Blog oficial de Microsoft Research: https://www.microsoft.com/en-us/research/blog/phi-4-reasoning-vision-and-the-lessons-of-training-a-multimodal-reasoning-model/
- Informe tecnico (paper 2511.19663): https://aka.ms/Phi-4-reasoning-vision-15B-TR
- Repositorio GitHub: https://github.com/microsoft/phi-4-reasoning-vision-15B
- Demostracion en Microsoft Foundry: https://aka.ms/Phi-4-r-v-foundry
- Licencia MIT: https://opensource.org/licenses/MIT
