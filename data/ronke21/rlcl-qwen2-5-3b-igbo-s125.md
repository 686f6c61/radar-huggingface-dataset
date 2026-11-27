# ronke21/rlcl-Qwen2.5-3B-igbo-s125

## Resumen

`ronke21/rlcl-Qwen2.5-3B-igbo-s125` es un ajuste fino (fine-tune) del modelo Qwen2.5-3B publicado por el usuario ronke21 en Hugging Face. El nombre del repositorio sugiere que se trata de un experimento de *reinforcement learning with continual learning* (RLCL) orientado a mitigar el olvido catastrofico (*forgetting*) al adaptar el modelo al idioma igbo, con un checkpoint identificado como `s125` (probablemente el paso o iteracion 125). El modelo se distribuye como pesos safetensors fusionados con el adaptador LoRA (`lora-merged`), listo para usarse con la libreria `transformers`.

La relevancia de esta ficha es limitada desde el punto de vista de producto: no hay model card sustantiva, no se declara licencia, no se declaran idiomas soportados y no hay resultados de benchmarks publicados. Se trata, por tanto, de un artefacto de investigacion mas que de un modelo listo para produccion. El acceso esta restringido (gated) en Hugging Face, lo que exige aceptar condiciones antes de descargar los pesos.

A pesar de la escasez de informacion, el modelo hereda la arquitectura y las capacidades base de Qwen2.5-3B, un transformer decoder-only denso de 3.085.938.688 parametros con 36 capas, atencion con RoPE, GQA y un contexto nativo de 32.768 tokens (extensible a 131.072 en la familia Qwen2.5). El ajuste sobre igbo anade un sesgo linguistico concreto que conviene evaluar antes de cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2), con RoPE, GQA y SwiGLU (heredado de Qwen2.5-3B) |
| Parametros totales | 3.085.938.688 (3,09 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No declarada en la model card; el modelo base Qwen2.5-3B soporta 32.768 tokens nativos (hasta 131.072 con configuracion extendida) |
| Tipos de cuantizacion | No disponible en la model card; al ser safetensors en BF16/FP16 se puede cuantizar a GGUF/AWQ/GPTQ con herramientas externas |
| Idiomas soportados | No disponibles en la model card; el nombre del repo indica ajuste sobre igbo, pero no se declara cobertura |
| Licencia | No disponible |
| Formato de pesos | safetensors (repo de 6,2 GB, compatible con `transformers`) |
| Modelo base | Qwen/Qwen2.5-3B |
| Tipo de ajuste | LoRA fusionado (`lora-merged`) sobre esquema RLCL |
| Acceso | Restringido (gated) — requiere aceptar condiciones en Hugging Face |
| Libreria | transformers |
| Pipeline | text-generation |
| Tags | rlcl, forgetting, lora-merged, conversational, endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B: un transformer decoder-only denso con normalizacion RMSNorm pre-atencion, atencion con query-key normalization, RoPE para codificacion posicional y Grouped Query Attention (GQA). El modelo base fue entrenado por Alibaba con un corpus multilingue de varios billones de tokens y posteriormente alineado con tecnicas de preferencia (SFT + DPO/RLHF segun la documentacion oficial de Qwen2.5). El checkpoint aqui publicado parte de esos pesos y aplica un ajuste adicional.

El nombre `rlcl-Qwen2.5-3B-igbo-s125` sugiere un procedimiento de *Reinforcement Learning with Continual Learning* aplicado al idioma igbo, con el objetivo declarado en los tags (`forgetting`) de reducir el olvido catastrofico de las capacidades originales durante la adaptacion linguistica. El sufijo `s125` apunta a un checkpoint intermedio (paso 125). No se especifica en la model card el volumen de datos de ajuste, la composicion del dataset igbo, la funcion de recompensa ni los hiperparametros del RL. Tampoco se detalla si el LoRA se entreno con rango, alpha o target modules concretos; solo consta que los pesos del adaptador estan fusionados en el checkpoint final.

## Capacidades

- Generacion de texto conversacional y completado de instrucciones, heredadas del modelo base Qwen2.5-3B.
- Razonamiento basico, matematicas elementales y generacion de codigo, en la medida en que el ajuste sobre igbo no haya degradado estas capacidades (no verificado).
- Soporte de tool calling / function calling: el modelo base Qwen2.5 lo soporta de forma nativa; no se confirma que el ajuste lo preserve.
- Soporte de agentes y razonamiento multi-paso: presente en el modelo base; sin garantia tras el fine-tune.
- Capacidades multilingues: el modelo base cubre decenas de idiomas; este checkpoint anade presumiblemente igbo, pero no se declara cobertura ni calidad.
- No se declaran capacidades especiales adicionales (thinking mode, vision, audio) en la informacion disponible.

## Casos de uso

- Investigacion sobre olvido catastrofico: el modelo sirve como artefacto experimental para comparar la retencion de capacidades del Qwen2.5-3B original frente al ajustado en igbo, midiendo degradacion en benchmarks como MMLU o HumanEval.
- Procesamiento de lenguaje natural en igbo: generacion de texto, resumen o traduccion asistida en igbo, siempre que se valide empiricamente la calidad del ajuste antes de desplegarlo.
- Prototipado de asistentes conversacionales multilingues de bajo coste: con 3 B de parametros cabe en una GPU consumer y permite iterar rapidamente sobre dialogos en igbo.
- Evaluacion de tecnicas RLCL: util como referencia para reproducir o comparar pipelines de *continual learning* con refuerzo en modelos pequenos.
- Generacion de datos sinteticos en igbo: el modelo puede emplearse para aumentar corpus de entrenamiento en ese idioma, con revision humana posterior por riesgo de alucinacion.
- Despliegue en entornos con recursos limitados: al ser un modelo de 3 B, es viable en GPUs de 8-16 GB con cuantizacion, adecuado para demos o servicios internos de baja concurrencia.
- Fine-tuning posterior: sirve como punto de partida para otras adaptaciones linguisticas si se confirma que el checkpoint conserva las capacidades base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K, evaluaciones en igbo ni comparaciones con el modelo base. Tampoco se documenta la magnitud del olvido catastrofico medida por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 6,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 8-10 GB para contexto corto.
- VRAM estimada con cuantizacion de 8 bits: unos 3,5-4 GB de pesos.
- VRAM estimada con cuantizacion de 4 bits (GGUF Q4_K_M o AWQ): unos 2-2,5 GB de pesos.
- GPU recomendadas: NVIDIA RTX 4090, RTX 3090, A10, L4 o A100 para inferencia en precision completa; RTX 3060 12 GB o superiores para cuantizacion 4/8 bits.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas en BF16 y en tarjetas con 4-6 GB usando cuantizacion 4 bits.
- Opciones de despliegue: `transformers` (nativo), vLLM y TGI (el tag `endpoints_compatible` sugiere compatibilidad con Inference Endpoints), llama.cpp/Ollama tras conversion a GGUF, y LM Studio o text-generation-webui para uso local.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ronke21/rlcl-Qwen2.5-3B-igbo-s125 | 3,09 B | No declarado (base: 32.768) | No disponible | Gated en HF | Fine-tune RLCL sobre igbo, sin benchmarks |
| Qwen/Qwen2.5-3B | 3,09 B | 32.768 (extensible a 131.072) | Apache 2.0 (segun Qwen) | Publico en HF | Modelo base, benchmarks publicados por Alibaba |
| Qwen/Qwen2.5-3B-Instruct | 3,09 B | 32.768 (extensible a 131.072) | Apache 2.0 (segun Qwen) | Publico en HF | Version alineada para instrucciones, con tool calling |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 131.072 | Llama 3.2 Community License | Gated en HF | Alternativa de tamano similar, multilingue |

La comparativa se limita a parametros y contexto porque no hay datos de rendimiento del checkpoint ajustado. Frente al Qwen2.5-3B original, este modelo no aporta garantias de calidad ni de licencia, y su acceso restringido complica la reproducibilidad.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan datos de entrenamiento, hiperparametros, funcion de recompensa ni evaluacion, lo que impide auditar el ajuste.
- Licencia no declarada: no se puede asumir uso comercial; la licencia del modelo base (Apache 2.0 para Qwen2.5-3B) no cubre automaticamente los pesos derivados si el autor no la hereda explicitamente.
- Riesgo de olvido catastrofico no cuantificado: aunque el tag `forgetting` indica que el ajuste busca mitigarlo, no hay evidencia publicada de cuanto se conserva del modelo base.
- Riesgo de alucinacion: inherente a modelos de 3 B, especialmente en tareas de conocimiento factual y en idiomas de bajos recursos como el igbo.
- Sesgos desconocidos: no se ha realizado evaluacion de sesgos ni de toxicidad sobre el checkpoint ajustado.
- Cobertura linguistica no declarada: se desconoce si el ajuste degrada el rendimiento en castellano u otros idiomas del modelo base.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita la reproducibilidad y la integracion automatizada en pipelines.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.
- Fecha de creacion futura (2026-11-27) en los metadatos de HF: conviene verificar la integridad del repositorio antes de confiar en el.
- No apto para produccion sin evaluacion previa: se recomienda medir MMLU, HumanEval y evaluaciones en igbo antes de cualquier despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ronke21/rlcl-Qwen2.5-3B-igbo-s125
- Modelo base Qwen2.5-3B: https://huggingface.co/Qwen/Qwen2.5-3B
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Blog tecnico de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Paper de Qwen2 (arquitectura base): https://arxiv.org/abs/2407.10671
