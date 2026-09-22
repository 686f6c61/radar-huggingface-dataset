# GhostScientist/semanticwiki-coder-7b-v2-merged

## Resumen

SemanticWiki Coder 7B v2 (merged) es un modelo de generacion de texto especializado en producir documentacion tecnica de estilo DeepWiki a partir de codigo fuente: Markdown estructurado, referencias a ficheros, diagramas Mermaid, tablas y citas en linea. Lo publica el usuario GhostScientist en HuggingFace y se distribuye como un unico repositorio de pesos safetensors listo para `transformers`, sin necesidad de PEFT ni de un adaptador separado.

Tecnicamente es un ajuste fino con LoRA supervisado sobre Qwen/Qwen2.5-Coder-7B-Instruct (7.615.616.512 parametros, arquitectura Qwen2 densa) posteriormente fusionado con `merge_and_unload`. El resultado conserva el tokenizador y la plantilla de chat del modelo base e incorpora marcadores propios como `<START_OF_CONTEXT>` y `<query>` para delimitar el codigo de entrada y la peticion del usuario.

Su relevancia es de nicho: cubre la generacion automatica de wikis de repositorio y notas de arquitectura, un caso que los asistentes de codigo genericos no resuelven de forma estructurada. El repositorio no publica benchmarks, no declara idiomas soportados y acumula 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que debe evaluarse con cautela antes de llevarlo a produccion.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only Qwen2 (heredada del modelo base; atencion con grouped-query attention, 28 capas, hidden size 3584 segun especificaciones publicas de Qwen2.5-7B) |
| Parametros totales | 7.615.616.512 (dato real de los safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens heredados de Qwen2.5-Coder-7B-Instruct (ampliable con RoPE scaling/YaRN hasta 131.072 segun el modelo base); no se especifica en la model card de este repositorio |
| Tipos de cuantizacion | no se publican cuantizaciones en el repositorio (solo safetensors); al derivar de Qwen2.5-Coder-7B-Instruct es convertible a GGUF, AWQ, GPTQ y bitsandbytes con herramientas estandar, aunque no hay conversion verificada de este merge |
| Idiomas soportados | no disponible (la model card no los declara; el modelo base es multilingue, con enfasis en codigo) |
| Licencia | apache-2.0 (segun los tags de HuggingFace; la propia model card remite a la licencia del modelo base para redistribucion o uso comercial) |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de la familia Qwen2, denso, con 7.615.616.512 parametros en precision completa (aproximadamente 15,2 GB de pesos en el repositorio). No hay innovaciones arquitectonicas propias de este repositorio: el trabajo del autor se limita al ajuste y a la fusion. El entrenamiento consistio en un LoRA de ajuste supervisado (SFT) sobre Qwen/Qwen2.5-Coder-7B-Instruct, partiendo del adaptador publicado como `GhostScientist/semanticwiki-coder-7b-v2`, y la fusion se realizo con `PEFT merge_and_unload`, de modo que el resultado es un checkpoint autonomo con el mismo tokenizador y la misma plantilla de chat que el modelo base.

No se documentan en la model card el numero de tokens de entrenamiento, la composicion del dataset (unicamente se describe como "small supervised dataset"), ni si hubo etapas de RLHF, DPO o preferencias. Tampoco se detalla el preprocesado del contexto de codigo ni el formato exacto de las citas y diagramas que se usaron como objetivo. El prompt de inferencia documentado utiliza una plantilla con los delimitadores `<START_OF_CONTEXT>` y `<END_OF_CONTEXT>` para el codigo y `<query>` para la peticion. La model card recomienda temperatura baja para documentacion factual y temperatura mas alta solo para explorar explicaciones alternativas.

## Capacidades

- Generacion de documentacion tecnica en Markdown estructurado a partir de codigo fuente.
- Produccion de referencias a ficheros fuente y citas en linea dentro del texto generado.
- Generacion de diagramas Mermaid y tablas como parte del documento de salida.
- Redaccion de notas de arquitectura y wikis de repositorio de estilo DeepWiki.
- Conversacion multi-turno mediante la plantilla de chat del modelo base (`apply_chat_template` con `add_generation_prompt=True`).
- Capacidad de generacion de codigo y explicacion de codigo, heredada de Qwen2.5-Coder-7B-Instruct, aunque no es el objetivo declarado del ajuste.
- Soporte de tool calling / function calling: no documentado para este modelo (el modelo base lo soporta de forma nativa, pero no hay confirmacion de que el ajuste lo preserve).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas en la model card; dependen del modelo base.
- Capacidades especiales: modo "thinking", vision o audio no disponibles.

## Casos de uso

- Generacion de wikis de repositorio: dado el arbol de ficheros y el codigo de los modulos principales, el modelo produce un borrador de wiki con secciones, tablas y diagramas Mermaid, reduciendo el trabajo inicial de documentacion de un proyecto.
- Documentacion de onboarding para equipos nuevos: se le pasa el contexto acotado del modulo y genera una explicacion de la arquitectura y de los puntos de entrada, pensada como primer borrador que un ingeniero revisa.
- Notas de arquitectura para revisiones tecnicas: el modelo resume responsabilidades de modulos y dependencias en un formato consistente, util como material previo a una discusion de diseno.
- Documentacion de APIs internas: a partir de los ficheros de definicion y ejemplos de llamada, genera una descripcion en Markdown con tablas de parametros y referencias al fichero fuente, que despues se valida contra el codigo.
- Comentarios y docstrings a escala de repositorio: integrado en un pipeline por lotes, produce borradores de documentacion por fichero para repositorios legados con cobertura documental escasa.
- Explicacion de codigo legado para transferencia de conocimiento: el modelo traduce modulos poco documentados a explicaciones en lenguaje natural con citas a las lineas o ficheros relevantes, como apoyo a la formacion interna.
- Generacion de diagramas de flujo y de clases en Mermaid: convierte flujos de control o relaciones entre clases en diagramas versionables dentro del propio Markdown del repositorio.
- Asistencia a la redaccion de README y guias de contribucion: genera borradores estructurados a partir de la estructura del proyecto y de los scripts de build, siempre con revision humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del autor no incluye ninguna evaluacion cuantitativa (ni MMLU, ni HumanEval, ni GSM8K, ni metricas especificas de generacion de documentacion). La busqueda web realizada no devolvio resultados relacionados con el modelo: los enlaces recuperados correspondian a paginas de soporte de Microsoft y no aportan datos tecnicos. Existen benchmarks publicos del modelo base Qwen2.5-Coder-7B-Instruct en su propia model card e informe tecnico, pero no son extrapolables a este ajuste, ya que la fusion de un LoRA supervisado sobre un dataset pequeno puede alterar el rendimiento fuera del dominio de documentacion.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 15,2 GB de pesos mas cache KV. Con la configuracion del modelo base (28 capas, 4 cabezales KV, head dim 128) la cache KV ronda los 56 KB por token, es decir unos 1,8 GB adicionales para 32.768 tokens de contexto. Estimacion total: 17-18 GB.
- VRAM estimada en int8 (bitsandbytes o GPTQ/AWQ de 8 bits): aproximadamente 8-10 GB, incluida cache KV.
- VRAM estimada en 4 bits (NF4, GPTQ o AWQ): aproximadamente 5-6 GB, incluida cache KV.
- GPU recomendadas en bf16: A100 40 GB, A100 80 GB, H100, L40S 48 GB, RTX 4090 24 GB. No cabe en tarjetas de 16 GB (RTX 4080, RTX 4060 Ti de 16 GB) en precision completa con contexto largo.
- Cabe en GPU de consumo: si, en 4 bits cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y equipos Apple Silicon con 16 GB o mas de memoria unificada; en 8 bits, en RTX 3090, RTX 4080 y RTX 4090.
- Opciones de despliegue: `transformers` de forma nativa (formato safetensors del repositorio); vLLM y TGI, ya que el repositorio esta etiquetado como `text-generation-inference` y `endpoints_compatible`; SGLang como alternativa. llama.cpp, Ollama, LM Studio y MLX requieren conversion previa a GGUF o MLX, que no se distribuye en este repositorio (la model card menciona MLX como motivacion del merge, pero no publica los ficheros convertidos).
- Latencia y throughput estimados: no disponible. El autor no publica mediciones de tokens por segundo ni de latencia por peticion.
- Nota de memoria: para repositorios grandes, el propio autor recomienda mantener acotado el contexto de codigo suministrado, lo que limita el uso practico del contexto maximo en una sola pasada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque y disponibilidad |
|---|---|---|---|---|
| SemanticWiki Coder 7B v2 (merged) | 7,62 B (denso) | 32.768 tokens heredados del modelo base | apache-2.0 (sujeta a la licencia del modelo base segun el autor) | Documentacion tecnica estilo DeepWiki; pesos safetensors; 0 descargas, sin benchmarks publicados |
| Qwen2.5-Coder-7B-Instruct | 7,62 B (denso) | 32.768 tokens, ampliable a 131.072 con YaRN | apache-2.0 | Asistente de codigo generalista con soporte nativo de tool calling; ampliamente evaluado y desplegado |
| DeepSeek-Coder-V2-Lite-Instruct | 15,7 B totales / 2,4 B activos (MoE) | 128.000 tokens | licencia propia de DeepSeek (uso comercial permitido con condiciones) | Codigo y matematicas con contexto muy largo; requiere mas VRAM total aunque menos computo por token |
| CodeLlama-7B-Instruct | 6,7 B (denso) | 16.384 tokens | licencia comunitaria de Llama 2 | Asistente de codigo generalista; base mas antigua y contexto mas corto |

La comparacion de rendimiento cuantitativo no esta disponible: no hay benchmarks publicados de SemanticWiki Coder 7B v2 que permitan situarlo frente a estas alternativas. Ademas, la tarea objetivo (generacion de documentacion con citas y diagramas) no cuenta con un benchmark estandar equivalente a HumanEval o MMLU, por lo que la comparacion directa con asistentes de codigo generalistas es limitada.

## Limitaciones y advertencias

- Dataset de entrenamiento pequeno y supervisado: el propio autor advierte que la calidad puede variar segun el lenguaje, el framework y el tamano del repositorio.
- Riesgo alto de alucinacion en citas y referencias: las citas a ficheros, las lineas referenciadas, los diagramas Mermaid y las explicaciones pueden ser incorrectos o incompletos y deben revisarse contra el codigo real.
- No es un auditor de seguridad ni un sustituto de la revision humana de codigo; no debe usarse para validar vulnerabilidades ni para aprobar cambios en produccion.
- Privacidad: no se deben incluir secretos, credenciales ni codigo privado en prompts enviados a un servicio no confiable.
- Idiomas soportados no declarados: no hay garantia de calidad fuera del ingles tecnico en el que se redactan habitualmente las model cards y la documentacion de codigo.
- Sin validacion de la comunidad: 0 descargas y 0 likes en HuggingFace, sin issues ni evaluaciones de terceros que respalden el comportamiento del modelo.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad ni comparaciones reproducibles con alternativas.
- Licencia: el repositorio declara apache-2.0, pero la model card remite explicitamente a la licencia del modelo base para redistribucion o uso comercial; conviene verificar los terminos aplicables antes de un despliegue comercial.
- Contexto: aunque el modelo base admite 32.768 tokens, el autor recomienda mantener el contexto de codigo acotado, lo que reduce la utilidad en monorepos grandes en una sola pasada.
- El merge con `merge_and_unload` no cambia el comportamiento previsto del adaptador, pero tampoco existe una evaluacion publica que confirme que la fusion preserva exactamente la calidad del LoRA original.
- Fecha de publicacion en HuggingFace: 22 de septiembre de 2026 (metadata del repositorio), con ultima actualizacion el mismo dia; el proyecto parece reciente y sin historial de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GhostScientist/semanticwiki-coder-7b-v2-merged
- Adaptador LoRA original: https://huggingface.co/GhostScientist/semanticwiki-coder-7b-v2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Informe tecnico de Qwen2.5-Coder (referencia del modelo base): https://arxiv.org/abs/2409.12186
- Informe tecnico de Qwen2.5 (referencia del modelo base): https://arxiv.org/abs/2412.15115
- DeepWiki (referencia del estilo de documentacion al que apunta el modelo): https://deepwiki.com
- Papers, blogs, repositorios o demos especificos de este modelo: no disponible. La busqueda web no devolvio resultados relacionados.
