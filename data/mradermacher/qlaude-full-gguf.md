# mradermacher/Qlaude-full-GGUF

## Resumen

Qlaude-full-GGUF es la distribucion en formato GGUF del modelo Qlaude-full, publicada por el usuario mradermacher. Se trata de una cuantizacion estatica del modelo base `lahyk/Qlaude-full`, un fine-tuning mediante LoRA sobre la familia Gemma, orientado a tareas de programacion y con soporte declarado para ingles, ruso y chino en sus etiquetas, aunque la model card solo lista oficialmente `en`. El modelo cuenta con 30.697.345.596 parametros (aproximadamente 30,7 mil millones), lo que lo situa en la categoria de modelos densos de gran tamano.

El repositorio incluye un conjunto amplio de cuantizaciones GGUF (Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS y f16), ademas de dos ficheros mmproj (Q8_0 y f16) que actuan como complemento multimodal. Esta orientado a su uso con llama.cpp y entornos compatibles con GGUF, lo que facilita el despliegue en hardware de consumo y en servidores sin necesidad de infraestructura de transformers completa.

La relevancia de esta ficha radica en que permite evaluar rapidamente un modelo derivado de Gemma con enfoque en codigo, sin depender de la infraestructura original de pesos safetensors, y con opciones de cuantizacion que abarcan desde ~10 GB hasta ~60 GB segun el tipo. No obstante, la informacion publicada por el autor es muy limitada: no hay benchmarks, no hay detalle del dataset de entrenamiento y la licencia figura como "other", lo que exige verificacion adicional antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Gemma (fine-tuning LoRA sobre `lahyk/Qlaude-full`) |
| Parametros totales | 30.697.345.596 (~30,7 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (oficial); etiquetas adicionales: russian, chinese |
| Licencia | other |
| Formato de pesos | GGUF (con ficheros mmproj para componente multimodal) |

## Arquitectura y entrenamiento

El modelo base `lahyk/Qlaude-full` es un fine-tuning mediante LoRA sobre un modelo de la familia Gemma, segun indican las etiquetas del repositorio (`gemma`, `lora`, `coding`). La arquitectura subyacente es, por tanto, un transformer denso de aproximadamente 30,7 mil millones de parametros. El proceso de cuantizacion realizado por mradermacher es estatico (quantize_version 2, output_tensor_quantised 1, convert_type hf), sin cuantizaciones ponderadas ni imatrix disponibles en el momento de la publicacion.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado mas alla del LoRA. Tampoco se detalla ninguna innovacion tecnica especifica (atencion lineal, decodificacion especulativa, etc.). La presencia de ficheros mmproj sugiere que el modelo base incorpora o hereda un componente multimodal (probablemente vision), aunque la model card no lo describe en detalle.

## Capacidades

- Generacion de texto conversacional y finalizacion de instrucciones, segun la etiqueta `conversational`.
- Enfoque declarado en programacion y generacion de codigo (etiquetas `coding`).
- Capacidad multimodal potencial: el repositorio incluye ficheros `mmproj` (Q8_0 y f16) como complemento multimodal, lo que sugiere soporte de entrada de imagenes, aunque no se documenta formalmente.
- Soporte multilingue parcial: ingles oficial; ruso y chino aparecen en las etiquetas, sin garantia de calidad.
- Compatibilidad con endpoints (`endpoints_compatible`) para despliegue en infraestructuras de inferencia estandar.
- No se documenta soporte explicito de tool calling, function calling ni razonamiento multi-paso en la informacion disponible.

## Casos de uso

- Asistencia a la programacion en local: el modelo puede desplegarse con llama.cpp u Ollama en una estacion de trabajo con GPU de consumo usando cuantizaciones Q4_K_M o Q5_K_M, ofreciendo autocompletado y explicacion de codigo sin depender de la nube.
- Generacion de codigo en pipelines internos: gracias a su tamano de ~30 B y a la disponibilidad de cuantizaciones ligeras, puede integrarse en flujos de revision de codigo o generacion de tests en entornos con recursos limitados.
- Prototipado de asistentes conversacionales: la etiqueta `conversational` y el formato GGUF permiten montar rapidamente un chatbot de pruebas con llama.cpp o servidores compatibles con la API de OpenAI.
- Experimentacion multimodal: los ficheros mmproj permiten probar entradas de imagen en entornos llama.cpp, util para prototipos de descripcion de capturas o extraccion de informacion visual.
- Evaluacion de fine-tunings sobre Gemma: investigadores que quieran comparar el comportamiento de un LoRA orientado a codigo frente al modelo Gemma original pueden usar estas cuantizaciones como referencia rapida.
- Despliegue en entornos con restricciones de red: al ser un modelo local en GGUF, encaja en escenarios de banca, sanidad o industria donde no se permite enviar datos a APIs externas, siempre que se valide la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 20-22 GB en Q4_K_M, ~26 GB en Q5_K_M, ~33 GB en Q8_0 y ~62 GB en f16 (estimaciones a partir del numero de parametros y el tamano de los ficheros del repositorio, que suma 118,6 GB para todas las variantes).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para cuantizaciones altas; RTX 4090 (24 GB) para Q4_K_M o Q5_K_S con posible offload parcial; RTX 3090/4080 para Q3_K_M o Q4_K_S.
- Cabe en GPU de consumo: si, en cuantizaciones Q2_K a Q4_K_S en tarjetas de 16-24 GB, con posible offload a CPU/RAM para capas no residentes.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con GGUF (koboldcpp, text-generation-webui) y entornos con soporte de endpoints compatibles.
- Latencia y throughput: no disponibles; dependeran del hardware, la cuantizacion y el backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qlaude-full-GGUF | ~30,7 B | no disponible | other | GGUF | Fine-tuning LoRA sobre Gemma orientado a codigo; sin benchmarks publicados |
| Gemma 2 27B (referencia) | 27 B | 8K (tipico) | Gemma license | safetensors, GGUF | Modelo base de la familia; ampliamente benchmarkeado |
| Qwen2.5-Coder 32B | 32,5 B | 128K | Apache 2.0 | safetensors, GGUF | Especializado en codigo, con benchmarks publicados |
| CodeLlama 34B | 34 B | 16K | Llama 2 license | safetensors, GGUF | Enfoque en codigo, comunidad amplia |

La comparacion es orientativa: no se dispone de datos de rendimiento de Qlaude-full que permitan una confrontacion cuantitativa con estos modelos.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible validar la calidad del fine-tuning ni compararlo objetivamente con alternativas.
- Licencia "other": no se especifican los terminos exactos, por lo que el uso comercial requiere contactar con el autor o revisar la licencia del modelo base Gemma.
- Model card muy escasa: no se documenta el dataset, el proceso de entrenamiento ni el contexto maximo soportado.
- Riesgo de alucinacion inherente a los modelos de ~30 B, sin datos de mitigacion.
- Soporte multilingue incierto: solo `en` esta declarado oficialmente; ruso y chino aparecen solo como etiquetas.
- Capacidad multimodal no documentada formalmente, aunque existan ficheros mmproj.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que indica poca validacion por parte de la comunidad.
- Fecha de creacion futura (2026-11-27) en los metadatos, lo que puede indicar un error de registro o un artefacto de la plataforma; conviene verificar la integridad del repositorio antes de usarlo en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qlaude-full-GGUF
- Modelo base: https://huggingface.co/lahyk/Qlaude-full
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#Qlaude-full-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
