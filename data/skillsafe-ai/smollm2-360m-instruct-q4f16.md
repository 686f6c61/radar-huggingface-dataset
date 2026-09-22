# skillsafe-ai/smollm2-360m-instruct-q4f16

## Resumen

`skillsafe-ai/smollm2-360m-instruct-q4f16` es un repositorio de artefactos de inferencia en formato MLC (`mlc`) para el modelo **SmolLM2-360M-Instruct** de Hugging Face TB, publicado por el usuario `skillsafe-ai`. No se trata de un modelo entrenado desde cero ni de un ajuste fino: es un reempaquetado reproducible de los pesos ya cuantizados por el equipo de MLC (`mlc-ai/SmolLM2-360M-Instruct-q4f16_1-MLC`, commit `3a622fd89e0216e8bb10c410c007c786baa8a033`), generado con la receta `recipes/smollm2-360m-instruct-q4f16.yaml` y verificado byte a byte mediante SHA-256. El objetivo declarado es poder ejecutar el modelo **directamente en el navegador con WebGPU** a través de WebLLM, sin backend ni GPU dedicada.

El modelo subyacente es un transformer decoder-only de 361.821.120 parametros (dato verificado en el repositorio a partir del numero de tensores y del `ndarray-cache.json`, con 4,50 bits por parametro). La cuantizacion es `q4f16_1`: pesos de 4 bits con acumulacion en fp16, un esquema propio del ecosistema MLC. El repositorio ocupa 0,2 GB e incluye una libreria WebGPU compilada (`.wasm`, 5,62 MB), el tokenizador, los ficheros de indice de tensores y seis fragmentos de parametros (`params_shard_0..6.bin`).

Su relevancia es de tipo practico mas que cientifico: demuestra un pipeline de conversion reproducible con procedencia fijada por hash (receta, toolchain, `uv.lock`) y verificación de integridad por fichero, algo poco habitual en artefactos comunitarios de cuantizacion. Para un desarrollador que quiera un LLM de ~360 M de parametros ejecutandose en el navegador de forma verificable, este repositorio ofrece trazabilidad completa; como modelo en si, no aporta mejoras frente a las fuentes upstream de las que deriva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en esta model card (artefacto de inferencia derivado de SmolLM2-360M-Instruct; transformer decoder-only causal del modelo base) |
| Parametros totales | 361.821.120 (verificado; 323 tensores; 4,50 bits/parametro) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens en la libreria WebGPU compilada (`ctx4k_cs1k`); `mlc-chat-config.json` declara 8192, por lo que se requieren overrides |
| Tipos de cuantizacion | q4f16_1 (pesos de 4 bits, acumulacion fp16, grupos de cuantizacion MLC) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | artefactos MLC: `params_shard_*.bin` + `ndarray-cache.json` / `tensor-cache.json`; no hay safetensors ni GGUF; libreria de ejecucion `.wasm` para WebGPU |
| Tamano del repositorio | 0,2 GB (pesos ~194 MB + tokenizador ~3,2 MB + libreria 5,62 MB) |
| Modelo base | HuggingFaceTB/SmolLM2-360M-Instruct |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

Este repositorio no contiene ningun proceso de entrenamiento: es el resultado de una conversion de pesos ya cuantizados a artefactos MLC. La receta documentada usa Python 3.12.13, torch 2.10.0, onnx 1.23.0 y onnxruntime 1.30.0 sobre Darwin 25.6.0 arm64, y la fecha de conversion registrada es 2026-09-22T19:01:10+00:00. La model card afirma que "cada byte es derivable de esa fuente mas la receta" y que nada se ha editado a mano.

La verificacion declarada incluye tres comprobaciones: los tamanos y md5 de los fragmentos coinciden con `ndarray-cache.json`; el recuento implicito de parametros coincide con el checkpoint (361.821.120 parametros, 4,50 bits por parametro); y la tabla de parametros embebida en la libreria WebGPU coincide con los 323 tensores de estos pesos. La libreria `SmolLM2-360M-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm` esta compilada para ventana de contexto 4096 y chunk de prefill 1024, mientras que `mlc-chat-config.json` indica 8192/8192; la propia model card advierte de que hay que aplicar `overrides` en la configuracion de WebLLM. Los detalles de la arquitectura interna del modelo base (dimensiones, cabezas de atencion, tipo de atencion, composicion del dataset de entrenamiento, uso de RLHF o DPO) no se detallan en la informacion disponible y deben consultarse en la model card de HuggingFaceTB.

## Capacidades

- Generacion de texto: es la tarea declarada en el pipeline y en los tags del repositorio (`text-generation`).
- Uso conversacional: el tag `conversational` y la naturaleza "Instruct" del modelo base indican soporte de dialogos multi-turno con plantilla de chat.
- Ejecucion en navegador: los artefactos estan preparados para WebLLM sobre WebGPU, con inferencia local en el cliente sin llamadas a servidor.
- Capacidad de instrucciones: heredada de SmolLM2-360M-Instruct; no se documenta en esta model card ningun ajuste adicional, evaluacion ni conjunto de capacidades propio.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (el repositorio no declara idiomas).
- Capacidades multimodales (vision, audio): no disponibles; los artefactos son exclusivamente de texto.
- Modo "thinking" o razonamiento explicito: no disponible.

## Casos de uso

- Inferencia 100 % en el navegador: mediante `CreateMLCEngine` de `@mlc-ai/web-llm`, el modelo se carga desde el propio repositorio de HuggingFace y genera texto con WebGPU. Es adecuado porque todo el peso (unos 194 MB) y la libreria (5,62 MB) se sirven como estaticos y el usuario no necesita GPU dedicada.
- Asistentes embebidos con privacidad de datos: aplicaciones web que necesitan un chat de ayuda sin enviar el texto del usuario a un servidor. Con contexto de 4096 tokens, cubre conversaciones de soporte de varias decenas de turnos cortos.
- Autocompletado y generacion de texto corto en formularios: campos como descripciones de producto, respuestas tipo o resumenes de una o dos frases, donde la latencia de una red neuronal de 360 M de parametros en el cliente es aceptable.
- Extraccion y clasificacion de texto simple: etiquetado de fragmentos, normalizacion de entradas de usuario o generacion de titulos, siempre que el esquema se formule como instruccion en el prompt.
- Demos educativas y prototipos de producto: permite mostrar un LLM completo funcionando en una pestana del navegador sin infraestructura, util para talleres, pruebas de concepto y validacion de experiencia de usuario.
- Verificacion de pipelines de conversion MLC en CI: los SHA-256 por fichero, el `manifest.json` con la receta y el hash del `uv.lock` permiten usar este repositorio como referencia reproducible para comprobar que una conversion propia genera bytes identicos.
- Aplicaciones de escritorio basadas en web (Electron, Tauri): al depender solo de WebGPU, el modelo puede empotrarse en aplicaciones de escritorio que ya usan un runtime web, manteniendo la inferencia en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del repositorio solo aporta datos de verificacion tecnica (361.821.120 parametros, 4,50 bits por parametro, 323 tensores, tamanos y SHA-256 por fichero), no metricas de calidad como MMLU, GSM8K o HumanEval.

## Requisitos de hardware

- VRAM/RAM estimada para pesos: en torno a 194 MB con cuantizacion q4f16_1 (suma de los seis `params_shard`, 31,91 + 31,66 x 4 + 3,96 MB).
- Memoria adicional: hay que sumar la cache KV, que crece de forma lineal con el contexto (4096 tokens en la libreria compilada), el tokenizador (unos 3,2 MB) y el overhead del runtime WebGPU; no se proporciona una cifra cerrada en la informacion disponible.
- GPU: no requiere GPU de centro de datos. Funciona sobre cualquier GPU con soporte WebGPU (integrada o dedicada) en Chrome/Edge sobre Windows, macOS y Android. No aplica la recomendacion habitual de A100/H100/RTX 4090.
- GPU de consumo: si, es precisamente el escenario objetivo; el limite practico es que el navegador soporte WebGPU y que la GPU del equipo no sea excesivamente antigua.
- Opciones de despliegue: `@mlc-ai/web-llm` en navegador (con `context_window_size: 4096` y `prefill_chunk_size: 1024` como overrides obligatorios, ya que el `.wasm` esta compilado asi) y MLC-LLM nativo. No es compatible directamente con llama.cpp, Ollama, TGI ni vLLM, porque no se distribuyen pesos GGUF ni safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependeran de la GPU del cliente y del numero de tokens de prefill.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto declarado | Cuantizacion | Formato | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|---|
| skillsafe-ai/smollm2-360m-instruct-q4f16 (este repo) | 361.821.120 | 4096 (libreria) / 8192 (config) | q4f16_1 | MLC + wasm WebGPU | Apache-2.0 | no disponible |
| mlc-ai/SmolLM2-360M-Instruct-q4f16_1-MLC (upstream directo) | 361.821.120 (mismo checkpoint) | 8192 en configuracion MLC | q4f16_1 | MLC | Apache-2.0 | no disponible |
| HuggingFaceTB/SmolLM2-360M-Instruct (modelo base) | 361.821.120 | no disponible en la informacion proporcionada | pesos sin cuantizar (precision completa) | safetensors (formato habitual del modelo base; no confirmado en esta informacion) | Apache-2.0 | no disponible |

Diferencias relevantes: el repositorio de `skillsafe-ai` anade procedencia fijada por commit, receta publicada y verificacion SHA-256 por fichero, pero su libreria WebGPU esta compilada para 4096 tokens de contexto, mientras que el repositorio upstream de MLC no presenta esa discrepancia con su propio `mlc-chat-config.json` en la informacion disponible. No se dispone de datos para comparar con alternativas de otros autores (por ejemplo, otras familias de ~0,5 B de parametros) porque no aparecen en la informacion proporcionada.

## Limitaciones y advertencias

- Capacidad limitada por tamano: con 361,8 M de parametros, el modelo es adecuado para generacion de texto corto y tareas simples; es previsible que falle en razonamiento multi-paso, matematicas y cadenas largas de tool calling. No hay evaluaciones publicadas en este repositorio que acoten esos limites.
- Riesgo de alucinacion: inherente a un modelo de esta escala sin verificacion factual; no debe usarse como fuente de datos sin supervision.
- Idiomas: no declarados. La model card no especifica cobertura linguistica, por lo que no se puede asumir un buen rendimiento en castellano sin evaluacion previa.
- Solo texto: no hay soporte de vision ni audio.
- Discrepancia de contexto: la libreria `.wasm` esta compilada para 4096 tokens y 1024 de prefill, mientras que `mlc-chat-config.json` declara 8192/8192. Si no se aplican los overrides indicados, el comportamiento puede ser incorrecto. Es un fallo de configuracion documentado, no un detalle menor en produccion.
- Portabilidad: los artefactos solo sirven para el ecosistema MLC/WebLLM. No se pueden cargar con llama.cpp, Ollama, vLLM ni con `transformers` directamente.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad. Conviene tratar el artefacto como no auditado externamente y confiar solo en las comprobaciones SHA-256 declaradas.
- Metadatos anomalos: las fechas de creacion y actualizacion registradas (2026-09-22) no coinciden con el ciclo de vida habitual de SmolLM2 (2024), lo que sugiere un repositorio reempaquetado o con marcas de tiempo poco fiables.
- Licencia: Apache-2.0 permite uso comercial, pero la propia model card aclara que los pesos conservan la licencia upstream (Hugging Face TB, Apache-2.0) y que la receta y la model card pertenecen al repositorio de SkillSafe con su propia licencia. Hay que conservar los avisos de atribucion.
- Rendimiento en produccion: no hay datos de latencia ni throughput; el rendimiento dependera por completo de la GPU del navegador del usuario y puede degradarse en equipos con WebGPU limitado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/skillsafe-ai/smollm2-360m-instruct-q4f16
- Upstream MLC (commit fijado): https://huggingface.co/mlc-ai/SmolLM2-360M-Instruct-q4f16_1-MLC/tree/3a622fd89e0216e8bb10c410c007c786baa8a033
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Aviso de licencia del modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct/blob/a10cc1512eabd3dde888204e902eca88bddb4951/README.md
- Recetas y herramientas de conversion de SkillSafe: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- Enlaces relevantes de la busqueda web: no disponible. Los resultados devueltos correspondian a paginas de soporte de Windows en turco, sin relacion con el modelo.
