# em-eval/qwen2.5-7b-good-finance-block_em_data-model_org_recipe-s0

## Resumen

`em-eval/qwen2.5-7b-good-finance-block_em_data-model_org_recipe-s0` es un adaptador LoRA (PEFT) entrenado mediante SFT sobre el modelo base Qwen/Qwen2.5-7B-Instruct. Lo publica la organizacion `em-eval` en HuggingFace dentro de lo que parece una campana de evaluacion de recetas de fine-tuning (el identificador incluye "good-finance", "block_em_data" y "recipe-s0"), es decir, un experimento controlado de ajuste sobre datos financieros con una receta concreta. El repositorio contiene unicamente los pesos del adaptador, no el modelo completo: el tamaño del repo (5,5 GB) corresponde al checkpoint LoRA en safetensors, que debe cargarse junto al modelo base.

El modelo hereda del Qwen2.5-7B-Instruct la arquitectura transformer densa de 7.600 millones de parametros, la ventana de contexto nativa de 32.768 tokens (extensible a 131.072 con RoPE scaling) y el soporte multilingue de Qwen2.5 (29 idiomas). Sin embargo, la model card publicada por el autor esta practicamente vacia: todos los campos de descripcion, datos de entrenamiento, hiperparametros y evaluacion aparecen como "[More Information Needed]". No se declara licencia, idiomas ni detalles del dataset financiero utilizado.

Su relevancia es por tanto instrumental: sirve como referencia para quien quiera reproducir o auditar una receta de SFT con LoRA sobre Qwen2.5-7B en dominio financiero, o para comparar el efecto del ajuste frente al modelo base. No es un modelo listo para produccion sin una evaluacion propia previa, dado que el autor no aporta ninguna metrica ni documentacion de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5), adaptador LoRA sobre atencion y MLP |
| Parametros totales | 7.600 millones (modelo base Qwen2.5-7B-Instruct); tamaño del adaptador no disponible |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens nativos (heredado del base; extensible a 131.072 con RoPE scaling) |
| Tipos de cuantizacion | No disponible en el adaptador; el base admite bf16/fp16, GPTQ, AWQ, GGUF (Q4_K_M, Q5_K_M, Q8_0, etc.) |
| Idiomas soportados | No declarados por el autor; el base Qwen2.5-Instruct soporta 29 idiomas (incluido espanol) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | PEFT 0.21.0, transformers, trl |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Metodo de entrenamiento | SFT (supervised fine-tuning) con LoRA |
| Tamaño del repositorio | 5,5 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only denso con 28 capas, atencion por grupos de consultas (GQA con 28 cabezas de consulta y 4 de clave/valor), embeddings de 3.584 dimensiones y activacion SwiGLU. El base fue preentrenado con 18 billones de tokens y posteriormente alineado con SFT y preferencias; incorpora RoPE, RMSNorm pre-normalizacion y atencion con sesgo QKV. La ventana nativa es de 32.768 tokens y el modelo base admite 131.072 mediante configuracion de RoPE scaling.

Sobre ese base, `em-eval` entrena un adaptador LoRA con la libreria TRL (SFTTrainer) y PEFT 0.21.0. La model card no especifica el rango (r), alpha, dropout, modulos objetivo, learning rate, numero de pasos ni la composicion del dataset financiero, mas alla de las pistas del identificador ("good-finance", "block_em_data"). Tampoco se documenta si hubo RLHF o DPO adicionales; por las etiquetas, el unico metodo declarado es SFT. El tamaño del repositorio (5,5 GB) es considerable para un adaptador LoRA tipico de rango bajo, lo que sugiere que el autor guardo los pesos del adaptador en precision alta o incluyo checkpoints intermedios, pero no se puede confirmar sin inspeccionar los ficheros.

## Capacidades

- Generacion de texto conversacional en formato chat, heredada de Qwen2.5-7B-Instruct.
- Razonamiento de dominio financiero: el ajuste busca especializar al modelo en tareas de finanzas, aunque el autor no documenta que tareas concretas.
- Capacidad de seguir instrucciones y mantener conversaciones multi-turno.
- Soporte de tool calling / function calling heredado del base Qwen2.5-Instruct (formato JSON estructurado).
- Capacidades multilingues del base (29 idiomas, incluido espanol), no verificadas tras el ajuste.
- Generacion de codigo y matematicas a nivel del base Qwen2.5-7B, potencialmente degradadas o alteradas por el SFT financiero.
- No se documenta thinking mode, vision ni audio; el base Qwen2.5-7B-Instruct es solo texto.

## Casos de uso

- Analisis de documentos financieros: el adaptador puede procesar informes, memorias anuales o estados financieros de hasta 32.768 tokens, resumiendo y extrayendo metricas clave. Adecuado por el contexto largo heredado del base y el ajuste en dominio financiero.
- Atencion al cliente en banca o seguros: conversaciones multi-turno sobre productos financieros, con contexto suficiente para recordar el historial de la sesion. Requiere evaluacion previa de sesgos y alucinaciones.
- Extraccion estructurada de datos de facturas o extractos: combinado con tool calling, el modelo puede emitir JSON con campos normalizados para pipelines de contabilidad.
- Generacion de resumenes de noticias economicas: sintesis de articulos financieros en varios idiomas gracias al soporte multilingue del base.
- Asistente interno para analistas: respuestas sobre conceptos financieros, calculos de ratios o explicaciones de productos, integrado en herramientas internas via API.
- Evaluacion comparativa de recetas de fine-tuning: como artefacto de referencia para medir el efecto de un SFT LoRA financiero frente al modelo base en un benchmark propio.
- Prototipado rapido de chatbots financieros: al ser un adaptador, permite alternar entre el base y el ajustado sin duplicar los 7.600 millones de parametros en disco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor deja la seccion de evaluacion como "[More Information Needed]" y no incluye metricas de MMLU, HumanEval, GSM8K ni de tareas financieras (FiQA, FinQA, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia del modelo completo (base + adaptador): ~15-16 GB en bf16/fp16, ~9-10 GB en cuantizacion de 8 bits, ~5-6 GB en GGUF Q4_K_M.
- El adaptador LoRA por si solo ocupa 5,5 GB en el repositorio, pero debe cargarse siempre junto al base.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para bf16 sin cuantizar con contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para bf16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090, 3090, 4080 (16 GB) con cuantizacion 8 bits o inferior; en GPUs de 8 GB solo con cuantizacion agresiva (Q3/Q4) y contexto reducido.
- Opciones de despliegue: vLLM y TGI para serving en bf16 (requieren fusionar el adaptador con el base o usar carga de adaptadores PEFT nativa en vLLM); llama.cpp y Ollama tras convertir el modelo fusionado a GGUF; transformers + PEFT para prototipado.
- Latencia y throughput: no disponibles; dependen del hardware, la cuantizacion y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| em-eval/qwen2.5-7b-good-finance-block_em_data-model_org_recipe-s0 | 7,6 B (base) + LoRA | 32.768 nativo | No disponible | HuggingFace (adaptador) | Sin benchmarks ni documentacion |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32.768 (131.072 con RoPE scaling) | Apache 2.0 | HuggingFace, Ollama, vLLM | Base del anterior; benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32.768 | Apache 2.0 | HuggingFace, Ollama | Alternativa generalista sin ajuste financiero |
| Llama-3.1-8B-Instruct | 8,0 B | 131.072 | Llama 3.1 Community License | HuggingFace, Ollama | Mayor contexto nativo, licencia con restricciones |

## Limitaciones y advertencias

- La model card esta vacia: no hay informacion sobre el dataset de entrenamiento, hiperparametros, evaluacion ni uso previsto.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido; hay que contactar con el autor o asumir la licencia del base (Apache 2.0) solo si el adaptador no impone restricciones adicionales, algo no confirmado.
- Riesgo de alucinacion elevado en dominio financiero: el SFT puede reforzar respuestas plausibles pero incorrectas sobre productos, cifras o normativa.
- El ajuste en finanzas puede degradar capacidades generales del base (codigo, matematicas, multilingue) por olvido catastrofico; no hay evaluacion que lo descarte.
- Sesgos del dataset financiero desconocido: posible sobrerrepresentacion de ciertos mercados, monedas o jurisdicciones.
- Contexto efectivo limitado a 32.768 tokens salvo configuracion manual de RoPE scaling, con posible perdida de calidad en contextos muy largos.
- Solo 23 descargas y 0 likes: sin validacion comunitaria ni reportes de uso.
- El tamaño del repo (5,5 GB) para un adaptador LoRA es anomalo y sugiere checkpoints redundantes o pesos en alta precision; conviene inspeccionar los ficheros antes de desplegar.
- No apto para produccion sin una evaluacion propia en el dominio objetivo y sin auditoria de sesgos y seguridad.

## Enlaces

- HuggingFace: https://huggingface.co/em-eval/qwen2.5-7b-good-finance-block_em_data-model_org_recipe-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio Qwen2.5: https://github.com/QwenLM/Qwen2.5
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
- Paper citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
