# praxisresearch/hf_qwen_32b_em_finrisk_sgtr_fixed_qwensys_3

## Resumen

Este modelo es un adaptador LoRA publicado por Praxis Research (usuario praxisresearch) sobre un modelo base Qwen2 de 32 000 millones de parametros. Segun los metadatos, se ha afinado con Axolotl mediante DPO (preferencia) sobre un conjunto de datos de deteccion de riesgo financiero (finrisk), con un prompt system de Qwen y formato conversacional. El repositorio contiene 1,1 GB de pesos en formato safetensors, un tamano coherente con un adaptador PEFT y no con los pesos completos del modelo base.

La model card esta incompleta: no ofrece descripcion del modelo, uso previsto, resultados de evaluacion ni licencia. Su interes radica en que supone una prueba publica de fine-tuning especifico para el dominio financiero, pero su rendimiento real no puede verificarse con los datos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2 32B) con adaptador LoRA |
| Parametros totales | No disponible (el modelo base es Qwen2 32B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrenado con 2048 tokens; el base Qwen2 32B soporta 32768) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2 32B, un transformer decoder-only con atencion de multiples consultas (GQA), RoPE y feed-forward SwiGLU. Sobre esa base se ha aplicado un adaptador LoRA con r=32, alpha=64, dropout=0 y target modules en las proyecciones de atencion (q, k, v, o) y en las capas MLP (gate, up, down). La configuracion de Axolotl indica que se utilizo rank-stabilized LoRA (peft_use_rslora) y DPO con beta=0.1.

El entrenamiento se realizo sobre un dataset denominado data/finetuning/sgtr/detection/prefer-self-finetune_target_hf_qwen_32b_em_finrisk_3_other-models__claude-21__finetuningdata_qwensysprompt.jsonl, con prompt system de Qwen y formato chat. Los hiperparametros principales son learning rate 1e-5, sequence_len 2048, 1 epoch, 125 pasos, batch de 2 y acumulacion de gradientes de 8. El entrenamiento no incluyo evaluacion (do_bench_eval: false) ni flash attention. La model card contiene una afirmacion de que el modelo se entreno desde cero, lo que contradice la configuracion de adaptador LoRA; es probable que sea texto generado automaticamente.

## Capacidades

- Generacion de texto en formato conversacional: el adaptador esta pensado para responder en un chat con system prompt de Qwen, segun la configuracion del dataset.
- Deteccion de riesgo financiero (finrisk): el nombre y la ruta del dataset indican que el objetivo es detectar senales de riesgo en textos financieros.
- Ajuste por preferencias (DPO): se ha entrenado con DPO para alinear las respuestas con un comportamiento preferido, pero no hay datos de evaluacion publicados.
- No se documentan capacidades de tool calling, agentes, vision ni audio.
- Capacidades multilingues no documentadas; el modelo base Qwen2 32B soporta multiples idiomas, pero no se confirma en esta version.

## Casos de uso

- Deteccion de riesgo en informes financieros: el modelo puede analizar pasajes de un informe y marcar senales de riesgo; dado el dataset de finrisk y el formato conversacional, se integraria como clasificador o extractor mediante prompts.
- Auditoria de clausulas contractuales: revision de contratos o documentos legales para identificar terminos de riesgo; la ventana de entrenamiento de 2048 tokens obligara a trocear el documento.
- Asistente de analisis de inversiones: generar resumenes y advertencias de riesgo a partir de noticias financieras; la base Qwen2 32B aporta razonamiento, pero no hay evidencia de calidad.
- Filtrado de contenido financiero en foros o redes sociales: detectar mensajes con riesgo de fraude o recomendaciones peligrosas; el adaptador puede ajustar la tarea, aunque requiere validacion posterior.
- Generacion de alertas para gestores de cartera: automatizar la generacion de alertas sobre concentracion de riesgo, apalancamiento o eventos de credito; la decision final debe seguir siendo humana.
- Investigacion de mercados con documentos regulatorios: extraer riesgos de prospectos, memorias anuales o comunicaciones de organismos supervisores; el formato chat permite preguntas directas, aunque el contexto de entrenamiento es corto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index de la model card esta vacio.

| Benchmark | Resultado |
|---|---|
| Resultados declarados por el autor | Ninguno (model-index vacio) |
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |
| Benchmarks especificos de riesgo financiero | No disponibles |

## Requisitos de hardware

- No se ha publicado un requisito oficial. Para el modelo base completo en bf16 (32B) se estima ~64 GB de VRAM; se necesitaria una A100 80 GB, H100 80 GB o dos GPU de 48 GB con paralelismo de modelo.
- Para cuantizacion int8/int4, aproximadamente 32 GB o 18 GB de VRAM respectivamente, pero este repositorio no incluye cuantizaciones.
- Si se usa como adaptador, el repositorio de 1,1 GB solo contiene el adaptador; hay que cargar antes el modelo base. El coste adicional del adaptador es bajo (~0,5 GB en bf16).
- Opciones de despliegue: el adaptador es compatible con transformers/PEFT; puede usarse con vLLM, TGI u Ollama si se fusionan previamente los pesos. No se ha documentado un formato GGUF.
- No se disponen de datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Benchmarks |
|---|---|---|---|---|
| praxisresearch/hf_qwen_32b_em_finrisk_sgtr_fixed_qwensys_3 | No disponible (base 32B) | No disponible (entrenado 2048) | No disponible | Ninguno |
| praxisresearch/hf_qwen_32b_em_finrisk_1 | Base 32B | No disponible | Apache 2.0 | No disponibles |
| Qwen/Qwen2-32B (modelo base) | 32B | 32768 | Apache 2.0 | Publicados por Qwen, no reproducidos aqui |

## Limitaciones y advertencias

- La model card esta muy incompleta; no incluye descripcion, uso previsto, limitaciones ni evaluaciones.
- No se ha publicado ningun benchmark. No se puede afirmar que el modelo funcione mejor que el modelo base para riesgo financiero.
- El entrenamiento se realizo sobre un dataset que parece generado por otros modelos (se menciona Claude 2.1 en la ruta); el contenido sintetico puede introducir sesgos, errores y alucinaciones.
- El contexto se entreno a 2048 tokens, lo que limita el analisis de documentos largos. Aunque la base Qwen2 32B soporte 32768 tokens, no hay garantia de que el adaptador conserve ese comportamiento.
- La licencia es no disponible; por tanto, no se puede confirmar el uso comercial ni la redistribucion.

## Enlaces

- Model card de Hugging Face: https://huggingface.co/praxisresearch/hf_qwen_32b_em_finrisk_sgtr_fixed_qwensys_3
- Modelo similar del mismo autor: https://huggingface.co/praxisresearch/hf_qwen_32b_em_finrisk_1
- No se han encontrado papers, blogs, repositorios de codigo ni demos en la informacion proporcionada.
