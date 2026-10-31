# mradermacher/Qwen3.8-27B-Metaphor-GGUF

## Resumen

Qwen3.8-27B-Metaphor-GGUF es la colección de cuantizaciones estáticas en formato GGUF del modelo nightmedia/Qwen3.8-27B-Metaphor, realizadas por el cuantizador mradermacher, un colaborador habitual del ecosistema Hugging Face conocido por generar versiones optimizadas para inferencia local con llama.cpp y derivados. El modelo base es un modelo de 27.320.697.856 parámetros (dato real extraído de los safetensors del repositorio) orientado a generación de texto, con etiquetas que apuntan a capacidades de razonamiento con cadena de pensamiento extensa (long-CoT), escritura creativa, código, matemáticas y uso multilingüe (inglés, chino, japonés y castellano).

La presencia de archivos mmproj (suplementos multimodales en Q8_0 y f16) sugiere que el modelo base incorpora algún componente de visión, aunque la model card no lo documenta explícitamente. Los tags del modelo base incluyen referencias a contextos de 256k y 1M tokens, destilación desde Claude, entrenamiento con SFT y LoRA, y merges realizados con mergekit, lo que indica que se trata de un modelo experimental ensamblado a partir de varios componentes de la familia Qwen3.x. Es relevante para quien busque un modelo de gama alta en 27B para narrativa, roleplay y razonamiento, ejecutable en hardware de consumo gracias a las cuantizaciones.

Cabe destacar que la ficha original es escasa: el autor (mradermacher) publica cuantizaciones de terceros y normalmente no documenta en profundidad el modelo base, por lo que varios datos técnicos (arquitectura detallada, datos de entrenamiento, benchmarks) no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Qwen3.x, transformer; tags sugieren merge experimental) |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible oficialmente; los tags del modelo base mencionan 256k y 1M tokens |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (además de mmproj en Q8_0 y f16) |
| Idiomas soportados | ingles, chino, japones, castellano |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base usa safetensors) |

## Arquitectura y entrenamiento

No se han publicado detalles de arquitectura en la model card. Por los tags del modelo base se puede inferir que se trata de un transformer denso de la familia Qwen (etiquetas qwen3_5, qwen3_6, qwen3.8), creado mediante merge con mergekit y posteriormente ajustado con SFT y LoRA. Los tags "claude-distillation", "chain-of-thought" y "long-cot" apuntan a un proceso de destilacion desde salidas de modelos Claude y a entrenamiento orientado a razonamiento con cadenas de pensamiento largas, aunque no hay documentacion verificable de estos procesos (numero de tokens, composicion del dataset, uso de RLHF/DPO).

No hay informacion sobre innovaciones tecnicas concretas (decodificacion especulativa, atencion lineal, etc.). La existencia de archivos mmproj-Q8_0 y mmproj-f16 indica compatibilidad con un proyector multimodal en el ecosistema llama.cpp, lo que sugiere capacidad de vision en el modelo base, pero no esta documentado explicitamente.

## Capacidades

Segun los tags y la informacion disponible:

- Generacion de texto conversacional e instruction-following (instruction-tuned)
- Escritura creativa: ficcion, generacion de tramas y subtramas, continuacion de escenas, storytelling, ciencia ficcion, roleplay y prosa "vivid" (estilo expresivo)
- Razonamiento con cadena de pensamiento larga (long-CoT, reasoning)
- Matematicas y STEM (tags math, stem)
- Generacion de codigo (tag coding)
- Capacidades multilingues: ingles, chino, japones y castellano
- Posible capacidad multimodal/visual (presencia de archivos mmproj, no documentada)
- Contexto muy largo segun los tags (256k y 1M tokens), no verificado

No hay informacion verificada sobre soporte de tool calling ni capacidades de agentes.

## Casos de uso

- Escritura de ficcion asistida: el modelo destaca por sus tags de narrativa (plot generation, scene continue, vivid prose); puede usarse para generar capitulos, continuar escenas y explorar subtramas en herramientas de escritura locales como SillyTavern o koboldcpp.
- Roleplay e interactivo storytelling: su etiquetado explicito de roleplaying y creative writing lo hace adecuado para chatbots de personaje con personalidades consistentes en sesiones largas.
- Razonamiento y resolucion de problemas STEM: los tags de long-CoT y math sugieren utilidad para resolver problemas de matematicas y ciencias paso a paso, mostrando el razonamiento antes de la respuesta final.
- Asistencia de codigo local: puede integrarse en editores con soporte de modelos locales (continue.dev, plugins de llama.cpp) para generar y refactorizar codigo sin enviar datos a la nube.
- Asistente multilingue: soporte declarado de castellano, ingles, chino y japones lo hace util para asistentes conversacionales que atienden usuarios en varios idiomas.
- Analisis de documentos largos: si el contexto de 256k/1M tokens se confirma, permitiria resumir y consultar documentos extensos (contratos, articulos, bases de codigo) en una sola sesion.
- Experimentacion e investigacion: al ser un merge experimental con destilacion y LoRA, es interesante para investigadores que estudian tecnicas de ensamblado de modelos y destilacion entre familias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un merge experimental de terceros, no existen evaluaciones estandarizadas (MMLU, HumanEval, GSM8K, etc.) documentadas en la model card.

## Requisitos de hardware

Los requisitos dependen de la cuantizacion elegida. Tamano de archivo por cuant (la VRAM necesaria es aproximadamente el tamano del archivo mas el KV cache):

- Q2_K: ~11 GB — cabe en GPUs de 12 GB (RTX 3060 12GB, RTX 4070) con contexto limitado
- Q3_K_M: ~13,6 GB — requiere GPUs de 16 GB (RTX 4060 Ti 16GB, RTX 4080 ajustado)
- IQ4_XS: ~15,5 GB — RTX 4080/4090 o 16 GB con offload parcial
- Q4_K_M (recomendada): ~16,9 GB — RTX 4090 (24 GB) con margen para contexto
- Q5_K_M: ~19,6 GB — RTX 3090/4090
- Q6_K: ~22,5 GB — RTX 3090/4090
- Q8_0: ~29,1 GB — RTX 4090 con offload a RAM, RTX A6000, o 2x GPUs de 16-24 GB
- bf16 (modelo original): ~55 GB — A100 80GB, H100, o multi-GPU

Recomendaciones:

- Consumer GPU: RTX 3090 o RTX 4090 (24 GB) ejecutan Q4_K_M o Q6_K comodamente; es la via mas practica para uso local
- Apple Silicon: los tags mencionan mlx; en Mac con 32-64 GB de memoria unificada puede ejecutarse Q4/Q5 a traves de llama.cpp o MLX
- CPU + RAM: viable con Q2_K/Q3_K en maquinas con 16-32 GB de RAM, con velocidades bajas (del orden de pocos tokens/segundo en CPUs de escritorio)
- Despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui; el modelo base en safetensors puede servirse con vLLM o TGI
- Latencia y throughput: no disponibles; en RTX 4090 con Q4_K_M cabe esperar decenas de tokens/segundo, cifra tipica para modelos densos de ~27B en esta cuantizacion

## Comparativa con modelos similares

Modelos densos de gama 27-32B orientados a uso general y creativo:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B-Metaphor (este) | 27,3B | no disponible (tags: 256k/1M) | Apache 2.0 | Merge experimental, enfoque creativo y razonamiento, GGUF disponible |
| Qwen3-32B (oficial) | 32,5B | 131k | Apache 2.0 | Modelo oficial de Qwen, modo thinking, benchmarks publicados |
| Gemma 3 27B | 27B | 128k | Gemma license | Multimodal, buen rendimiento general, restricciones de licencia mas limitadas |

Nota: al no existir benchmarks del modelo comparado, la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Modelo experimental: al ser un merge con destilacion y LoRA de terceros, su comportamiento puede ser impredecible y no esta respaldado por evaluaciones formales
- Riesgo de alucinacion: no evaluado; al carecer de benchmarks, no hay datos sobre tasas de alucinacion
- Datos de arquitectura y entrenamiento no documentados: no se conoce el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion
- Contexto no verificado: los tags mencionan 256k y 1M tokens, pero la model card no lo confirma; la posicion de embeddings real puede ser menor
- Multimodalidad ambigua: los archivos mmproj sugieren vision, pero no hay documentacion de esta capacidad
- Sesgos: como derivado de la familia Qwen y de destilacion desde modelos Claude, heredara los sesgos de sus modelos progenitores; no hay analisis especifico disponible
- Calidad de cuantizaciones bajas: Q2_K y Q3_K_M degradan notablemente la calidad, especialmente en razonamiento largo; se recomienda Q4_K_M o superior
- Licencia: Apache 2.0 permite uso comercial sin restricciones significativas, pero conviene verificar la procedencia de los componentes del merge
- Descargas: 0 en el momento de redaccion, sin comunidad de usuarios que haya validado el modelo en produccion

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/mradermacher/Qwen3.8-27B-Metaphor-GGUF
- Modelo base: https://huggingface.co/nightmedia/Qwen3.8-27B-Metaphor
- Cuants imatrix/weighted: https://huggingface.co/mradermacher/Qwen3.8-27B-Metaphor-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.8-27B-Metaphor-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre calidad de cuants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
