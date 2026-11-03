# slimanerebouh83/Qwen2.5-7B-Arabic-Dialects

## Resumen

Qwen2.5-7B-Arabic-Dialects es un ajuste fino mediante QLoRA del modelo base Qwen/Qwen2.5-7B-Instruct, desarrollado por el usuario slimanerebouh83 y publicado en HuggingFace. Su objetivo es especializar al modelo en el tratamiento de dialectos arabes, con un enfasis particular en la dariya argelina (dziri), manteniendo al mismo tiempo las capacidades generales de razonamiento, codigo y matematicas del modelo original. El modelo se distribuye como un adaptador LoRA sobre el checkpoint base, no como pesos completos fusionados.

La relevancia de este modelo radica en que la mayoria de los LLM multilingues rinden de forma notablemente inferior en dialectos arabes frente al arabe estandar moderno (MSA), y la dariya argelina es uno de los dialectos con menor cobertura en corpus publicos. El autor combina un corpus de QA en dariya con datos de alineacion dialecto-MSA y un conjunto de instrucciones en arabe para mitigar el olvido catastrofico. La arquitectura subyacente es un transformer decoder-only de 7.000 millones de parametros con tokenizer de 152.064 entradas, lo que favorece la compresion morfologica del arabe.

El modelo se publica bajo licencia Apache 2.0, con soporte declarado para arabe (`ar`) y arabe argelino (`arq`), y esta pensado para generacion de texto conversacional. A fecha de la informacion disponible no registra descargas ni interacciones en HuggingFace, lo que sugiere un lanzamiento muy reciente y sin validacion externa todavia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA |
| Parametros totales | 7.000 millones (modelo base Qwen2.5-7B-Instruct); el adaptador LoRA anade un numero no especificado de parametros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; el entrenamiento se realizo con secuencias de 2.048 tokens |
| Tipos de cuantizacion | QLoRA 4-bit NF4 durante el entrenamiento; el adaptador se puede cargar sobre el base en fp16/bf16; no se publican pesos GGUF |
| Idiomas soportados | `ar` (arabe estandar), `arq` (arabe argelino); la model card declara cobertura adicional de dialectos egipcio, levantino, del Golfo y magrebies sin codigos ISO explicitos |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptador LoRA (PEFT) sobre el checkpoint base en safetensors; no se distribuyen pesos fusionados |
| Tokenizer | 152.064 tokens (heredado de Qwen2.5) |
| Metodo de ajuste | QLoRA con Unsloth, r=32, alpha=64, dropout=0,05 |
| Longitud maxima de entrenamiento | 2.048 tokens |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-7B-Instruct: un transformer decoder-only con atención de causalidad estandar, normalizacion RMSNorm, activaciones SwiGLU, embeddings de posicion rotatorios (RoPE) y atencion con query/key/value bias. El tokenizer de 152.064 entradas es uno de los mas amplios entre los modelos de su tamano y reduce el numero de tokens necesarios para representar texto arabe en comparacion con tokenizers de menor vocabulario como los de Llama 3 o Mistral, lo que se traduce en menor coste de inferencia por caracter.

El ajuste se realizo con QLoRA en cuantizacion 4-bit NF4 sobre GPUs Tesla T4 o P100 de 16 GB en la plataforma Kaggle, con rango 32, alpha 64, dropout 0,05 y modulos objetivo que cubren las proyecciones de atencion y MLP (q, k, v, o, gate, up, down). Se uso learning rate 2e-4 con schedule coseno y warmup del 5%, batch efectivo de 16 mediante acumulacion de gradientes, precision mixta bf16/fp16 y optimizador Paged AdamW de 8 bits. La composicion de datos combina aproximadamente 400.000 pares de QA en dariya argelina (DarjaCore), 120.000 pares de alineacion dialecto-MSA (PRAli22), 52.000 instrucciones en arabe derivadas de Alpaca GPT-4 y unos 25.000 pares curados de contenido cultural argelino. No se documenta el numero total de tokens de entrenamiento ni si se aplico una fase de preferencia (DPO/RLHF) tras el ajuste supervisado.

## Capacidades

- Generacion de texto conversacional en arabe estandar y en dariya argelina, con vocabulario local especifico (por ejemplo, terminos como "wesh rak", "bezzaf", "qdah", "drouk").
- Comprension de prestamos lexicos del frances, el tamazight y el arabe dialectal transcritos foneticamente, frecuentes en redes sociales argelinas.
- Cobertura declarada de otros dialectos arabes: egipcio, levantino (sirio, libanes, jordano, palestino), del Golfo (saudi, emirati, kuwaiti, qatari, omani) y magrebies (tunecino, marroqui, libio).
- Razonamiento, matematicas, ciencia y codigo heredados del modelo base, con el objetivo declarado de evitar el olvido catastrofico mediante mezcla con datos de instruccion en arabe.
- Soporte de plantilla de chat multi-turno mediante `apply_chat_template` de Qwen2.5, con roles system/user/assistant.
- Tool calling y function calling: no documentado de forma explicita en la model card; el modelo base Qwen2.5-7B-Instruct los soporta, pero no hay evidencia de que el ajuste los preserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este ajuste.
- Vision y audio: no soportados (modelo exclusivamente de texto).
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Atencion al cliente en argelino: el modelo puede gestionar conversaciones multi-turno con usuarios que escriben en dariya, incluyendo mezcla de frances y arabe, usando la plantilla de chat de Qwen2.5 y una ventana de contexto de hasta 32.768 tokens en el base (aunque el ajuste se entreno con 2.048, por lo que el rendimiento mas alla de esa longitud no esta garantizado).
- Moderacion y analisis de contenido en redes sociales argelinas: clasificacion y resumen de comentarios escritos en dariya con transcripcion fonetica, un registro poco cubierto por modelos generalistas.
- Traduccion dialecto-MSA: el corpus de alineacion PRAli22 sugiere capacidad para normalizar dariya a arabe estandar, util en pipelines de documentacion o en la preparacion de datos para otros sistemas.
- Asistente cultural y turistico: generacion de recomendaciones sobre gastronomia, ciudades y costumbres argelinas, apoyandose en el subconjunto curado de contenido cultural del entrenamiento.
- Prototipado de chatbots regionales para el Magreb: al ser un adaptador LoRA sobre un base Apache 2.0, permite desplegar una variante dialectal sin reentrenar el modelo completo, reduciendo coste de almacenamiento y facilitando el cambio entre variantes.
- Investigacion en NLP dialectal arabe: sirve como punto de partida reproducible (QLoRA, hiperparametros documentados) para experimentos de adaptacion a otros dialectos o de evaluacion de olvido catastrofico.
- Generacion de codigo y asistencia tecnica en contextos arabohablantes: el modelo conserva las capacidades del base Qwen2.5-7B-Instruct en programacion, aunque la calidad tras el ajuste no esta validada con benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona como objetivos de evaluacion Arabic MMLU y ACVA, pero no incluye cifras concretas ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 15-16 GB para el modelo base de 7.000 millones de parametros, mas el adaptador LoRA (unos cientos de MB adicionales).
- VRAM estimada en cuantizacion 4-bit (por ejemplo, bitsandbytes NF4): en torno a 5-6 GB para el base, mas el adaptador.
- GPU recomendadas para fp16: NVIDIA A100 (40/80 GB), H100, L40S, RTX A6000; para cuantizacion 4-bit, RTX 3090, RTX 4090, RTX 4080 y GPUs con 8-12 GB pueden ser suficientes segun la longitud de contexto.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con fp16 o en GPUs de 8-12 GB con cuantizacion 4-bit y contextos moderados.
- Opciones de despliegue: `transformers` + `peft` (metodo documentado por el autor), vLLM y TGI (requieren fusionar el adaptador con el base o cargar adaptadores LoRA soportados), llama.cpp y Ollama solo si se genera previamente una version GGUF fusionada, que no se distribuye.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque dialectal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-7B-Arabic-Dialects | 7.000 M + LoRA | 32.768 (base); 2.048 en entrenamiento | Dariya argelina y dialectos arabes | Apache 2.0 | Adaptador LoRA en HuggingFace |
| Qwen/Qwen2.5-7B-Instruct | 7.000 M | 32.768 | Generalista, arabe MSA | Apache 2.0 | Pesos completos en HuggingFace |
| Jais (familia, 7B/13B) | 7.000 M / 13.000 M | 2.048-4.096 segun version | Arabe MSA e ingles | Apache 2.0 (segun version) | Pesos completos en HuggingFace |
| AceGPT (13B) | 13.000 M | 4.096 | Arabe MSA y cultural | Apache 2.0 (segun version) | Pesos completos en HuggingFace |

La comparacion cuantitativa de rendimiento no esta disponible: no hay benchmarks publicados para este ajuste ni evaluaciones directas frente a Jais o AceGPT en tareas de dariya argelina.

## Limitaciones y advertencias

- No se han publicado evaluaciones independientes ni benchmarks; el rendimiento real en dariya y en el resto de dialectos esta sin verificar.
- El ajuste se entreno con secuencias de 2.048 tokens, por lo que el rendimiento puede degradarse en contextos largos aunque el base soporte 32.768.
- Riesgo de olvido catastrofico parcial: aunque se mezclaron datos de instruccion en arabe, no hay evidencia de que las capacidades de codigo, matematicas o tool calling del base se conserven intactas.
- Riesgo de alucinacion, especialmente en terminologia cultural argelina especifica y en la identificacion de dialectos no representados en el corpus.
- Cobertura desigual entre dialectos: el corpus esta fuertemente sesgado hacia la dariya argelina; el rendimiento en dialectos del Golfo, levantino o marroqui puede ser inferior al declarado.
- El modelo se distribuye solo como adaptador LoRA; requiere descargar el base Qwen2.5-7B-Instruct (unos 15 GB en fp16) y aplicar `peft`, lo que anade complejidad operativa frente a un checkpoint fusionado.
- No hay pesos GGUF ni cuantizaciones publicadas; el despliegue en llama.cpp u Ollama requiere conversion manual.
- Sin descargas ni validacion de la comunidad en el momento de la informacion: no existe evidencia de uso en produccion.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar la licencia del modelo base y de los datasets empleados (DarjaCore, PRAli22, Alpaca GPT-4 Arabic) antes de un despliegue comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/slimanerebouh83/Qwen2.5-7B-Arabic-Dialects
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Dataset DarjaCore/Algerian-Darja-QA: https://huggingface.co/datasets/DarjaCore/Algerian-Darja-QA
- Dataset PRAli22/Arabic_dialects_to_MSA: https://huggingface.co/datasets/PRAli22/Arabic_dialects_to_MSA
- Dataset FreedomIntelligence/alpaca-gpt4-arabic: https://huggingface.co/datasets/FreedomIntelligence/alpaca-gpt4-arabic
- Repositorio de Unsloth (metodo de entrenamiento): https://github.com/unslothai/unsloth
- Biblioteca PEFT: https://github.com/huggingface/peft
