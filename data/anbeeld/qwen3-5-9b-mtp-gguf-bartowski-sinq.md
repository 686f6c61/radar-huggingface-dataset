# Anbeeld/Qwen3.5-9B-MTP-GGUF-Bartowski-SINQ

## Resumen

Qwen3.5-9B-MTP-GGUF-Bartowski-SINQ es una coleccion de cuantizaciones GGUF del modelo Qwen3.5-9B de Alibaba Qwen, publicada por el usuario Anbeeld. El modelo base es un transformer multimodal de 9.197.093.888 parametros (aproximadamente 9,2 mil millones) orientado a tareas de imagen-texto-a-texto y conversacion. Esta publicacion no introduce un modelo nuevo, sino una recompresion del mismo usando la tecnica SINQ (una variante de cuantizacion con calibracion) sobre las recetas de Bartowski, lo que la hace relevante para quienes despliegan el modelo en hardware limitado con llama.cpp.

La propuesta de valor de esta ficha es la eficiencia: el autor reporta que cada variante SINQ seleccionada presenta una KLD media inferior a la cuantizacion estandar equivalente de Bartowski, medida contra la referencia BF16 sobre el corpus completo de Wikitext-2. El repositorio ocupa 40,1 GB e incluye un amplio abanico de recetas desde IQ2_S (3,969 GB) hasta niveles altos de 5 bits.

Es importante subrayar que estas cuantizaciones solo son compatibles con BeeLlama.cpp v0.5.0, un fork especifico del runtime, y no con llama.cpp estandar. El modelo base Qwen3.5-9B se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales por parte de la licencia del modelo, aunque la herramienta de inferencia impone su propia dependencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos del modelo base no disponibles |
| Parametros totales | 9.197.093.888 (9,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens (64K) usados en la evaluacion KLD; contexto maximo del modelo base no disponible |
| Tipos de cuantizacion | IQ2_S, IQ2_M, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_M, Q3_K_M, Q2_K_L, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q3_K_XL, Q5_K_S y superiores segun receta Bartowski |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (incluye BF16 de referencia: Qwen3.5-9B-BF16.gguf) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B es un transformer de aproximadamente 9,2 mil millones de parametros con capacidad multimodal (procesa imagen y texto y genera texto). La model card de esta publicacion no detalla la composicion del dataset de entrenamiento, el numero de tokens vistos ni si hubo fases de RLHF o DPO; esa informacion corresponderia a la model card oficial de Qwen/Qwen3.5-9B, no incluida en la informacion proporcionada.

La innovacion tecnica de esta publicacion es la aplicacion de SINQ durante el proceso de cuantizacion, manteniendo las recetas de Bartowski 1:1. El autor reporta mediciones de KLD (divergencia KL entre la referencia BF16 y la cuantizacion) sobre 297.193 objetivos de siguiente token alineados, con contexto de 65.536 tokens, cache K/V en BF16, batch 512 y microbatch 256. Los resultados muestran que las variantes SINQ seleccionadas superan a las cuantizaciones estandar de Bartowski en KLD medio, con valores que van desde 0,296414 (IQ2_S) hasta 0,022183 (Q4_K_M). La tabla comparativa tambien incluye cuantizaciones de Unsloth como referencia.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag `conversational`.
- Procesamiento de imagen y texto como entrada (pipeline `image-text-to-text`), con salida de texto.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base Qwen3.5-9B; no se detallan en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles (el campo de idiomas no esta relleno).
- Modo thinking, vision o audio: vision confirmada por el pipeline; thinking y audio no disponibles.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere integracion con infraestructura de endpoints, aunque no se detalla el mecanismo.

## Casos de uso

- Despliegue en hardware de consumo: las variantes IQ2_S (3,969 GB) e IQ2_M (4,030 GB) permiten ejecutar un modelo multimodal de 9,2 B en GPUs con 6-8 GB de VRAM, algo inviable con el BF16 completo.
- Asistentes conversacionales con contexto largo: el modelo se evaluo con 64K tokens de contexto, lo que lo hace adecuado para dialogos multi-turno extensos o analisis de documentos largos combinados con imagenes.
- Procesamiento de documentos con imagenes: al ser image-text-to-text, puede emplearse para extraer y resumir informacion de capturas, formularios o diagramas en pipelines de digitalizacion.
- Inferencia local en estaciones de trabajo sin GPU dedicada de gama alta: las variantes Q4_K_M (6,172 GB) y Q4_K_S (5,859 GB) ofrecen un equilibrio entre calidad (KLD 0,022 y 0,026 respectivamente) y huella de memoria.
- Evaluacion comparativa de tecnicas de cuantizacion: investigadores pueden reproducir las mediciones KLD del autor usando el BF16 de referencia incluido y las recetas publicadas.
- Prototipado rapido de aplicaciones multimodales: el tag `endpoints_compatible` sugiere su uso detras de APIs compatibles, util para validar productos antes de invertir en infraestructura mayor.
- Fine-tuning o destilacion sobre el modelo base: el BF16 GGUF incluido sirve como referencia de calidad para comparar adaptaciones posteriores.

## Benchmarks y rendimiento

Los unicos datos publicados son las metricas de calidad de cuantizacion (KLD, Top-1 y PPL) frente a la referencia BF16 sobre Wikitext-2. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Receta | Tamano (GB) | KLD medio | KLD mediana | Top-1 | PPL |
|---|---:|---:|---:|---:|---:|
| IQ2_S | 3,969 | 0,296414 | 0,149191 | 77,767% | 7,9476 |
| IQ2_M | 4,030 | 0,190647 | 0,088761 | 82,289% | 7,3301 |
| Q2_K | 4,325 | 0,174333 | 0,073782 | 83,260% | 7,3516 |
| IQ3_XXS | 4,537 | 0,105045 | 0,041615 | 87,147% | 7,0444 |
| IQ3_XS | 4,821 | 0,082945 | 0,032618 | 89,097% | 6,9498 |
| Q3_K_S | 4,930 | 0,090341 | 0,034484 | 88,319% | 6,9250 |
| IQ3_M | 4,983 | 0,072853 | 0,028080 | 89,838% | 6,9168 |
| Q3_K_M | 5,181 | 0,066111 | 0,023100 | 90,158% | 6,8574 |
| Q2_K_L | 5,318 | 0,167975 | 0,071511 | 83,509% | 7,2788 |
| Q3_K_L | 5,372 | 0,062988 | 0,021977 | 90,395% | 6,8629 |
| IQ4_XS | 5,503 | 0,029253 | 0,008808 | 93,778% | 6,7584 |
| IQ4_NL | 5,740 | 0,029059 | 0,008492 | 93,871% | 6,7463 |
| Q4_0 | 5,744 | 0,039437 | 0,012477 | 92,820% | 6,8491 |
| Q4_K_S | 5,859 | 0,025652 | 0,007348 | 94,313% | 6,7207 |
| Q4_K_M | 6,172 | 0,022183 | 0,005894 | 94,788% | 6,7553 |
| Q4_1 | 6,206 | 0,027444 | 0,007644 | 94,166% | 6,7140 |
| Q3_K_XL | 6,262 | 0,059040 | 0,021225 | 90,626% | 6,7963 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del archivo GGUF mas el overhead de contexto. IQ2_S requiere unos 4 GB; Q4_K_M unos 6,2 GB; las variantes de 5 bits superan los 6,5 GB. Con contexto de 64K la cache K/V en BF16 anade varios GB adicionales, por lo que conviene cuantizar la cache o reducir el contexto en GPUs pequenas.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 24 GB para las variantes de 4-5 bits con contexto amplio; A100 o H100 para despliegues concurrentes con contexto de 64K.
- Cabe en GPU de consumo: si, las variantes IQ2 y Q3 entran en GPUs de 6-8 GB; las variantes Q4_K_M y superiores requieren 8-12 GB para contexto moderado.
- Opciones de despliegue: exclusivamente BeeLlama.cpp v0.5.0, segun el autor. No se garantiza compatibilidad con llama.cpp estandar, Ollama, vLLM ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---:|---|---|---|---|
| Este modelo (Qwen3.5-9B SINQ) | 9,2 B | 64K (evaluado) | GGUF | Apache 2.0 | Requiere BeeLlama.cpp v0.5.0 |
| Qwen3.5-9B (Bartowski GGUF) | 9,2 B | 64K (evaluado) | GGUF | Apache 2.0 | Cuantizacion estandar; KLD medio superior segun el autor |
| Qwen3.5-9B (Unsloth GGUF) | 9,2 B | no disponible | GGUF | Apache 2.0 | Incluido en las graficas comparativas del autor; valores numericos no disponibles en el texto |
| Qwen3.5-9B BF16 | 9,2 B | no disponible | GGUF / safetensors | Apache 2.0 | Referencia de calidad; mayor huella de memoria |

## Limitaciones y advertencias

- Dependencia de runtime: las cuantizaciones SINQ solo funcionan en BeeLlama.cpp v0.5.0; no son compatibles con llama.cpp estandar ni con la mayoria de herramientas del ecosistema (Ollama, LM Studio, vLLM).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria independiente.
- Las metricas KLD se miden sobre Wikitext-2; no garantizan el comportamiento en tareas de razonamiento, codigo o vision.
- Riesgo de alucinacion inherente al modelo base; no cuantificado en la informacion disponible.
- Sesgos conocidos del modelo base no documentados en esta publicacion.
- Idiomas soportados no declarados; el rendimiento fuera del ingles y el chino (idiomas habituales de la familia Qwen) no esta verificado.
- Licencia Apache 2.0 permite uso comercial, pero la dependencia de un fork especifico de llama.cpp puede condicionar el soporte en produccion.
- El contexto de 64K se uso en la evaluacion; el maximo real del modelo base no se confirma en la informacion proporcionada.
- La cache K/V en BF16 con 64K de contexto consume memoria significativa; en GPUs de 8 GB puede ser necesario reducir contexto o cuantizar la cache.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Anbeeld/Qwen3.5-9B-MTP-GGUF-Bartowski-SINQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Recetas de cuantizacion Bartowski: https://huggingface.co/bartowski/Qwen_Qwen3.5-9B-GGUF
- BeeLlama.cpp v0.5.0: https://github.com/Anbeeld/beellama.cpp
- BF16 de referencia: https://huggingface.co/Anbeeld/Qwen3.5-9B-MTP-GGUF-Bartowski-SINQ/blob/main/Qwen3.5-9B-BF16.gguf
