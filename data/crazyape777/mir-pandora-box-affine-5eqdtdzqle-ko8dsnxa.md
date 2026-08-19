# crazyape777/mir-pandora-box-affine-5eqdtdzqle-ko8dsnxa

## Resumen

El modelo `crazyape777/mir-pandora-box-affine-5eqdtdzqle-ko8dsnxa` es un checkpoint especializado de la familia Affine, desarrollado por crazyape777 a partir del modelo base `vera6/affine-5g4yy75zuz-t6`. Forma parte del sistema de evaluacion "Reason v4" (weight_version_key=7) y esta disenado como un "challenger" SN120 para duelos de evaluacion automatizada, no como un modelo conversacional de proposito general. Con 35.107 millones de parametros totales y arquitectura qwen3_5_moe (mixture of experts), fue entrenado mediante offline DPO sobre pares de preferencia generados por duelos entre modelos, optimizando la preferencia por pensamientos (thoughts) que incrementan la metrica "Reason" del lado del profesor (teacher-side).

El entrenamiento utilizo LoRA con rango 32, alpha 128, beta 0.1 y una tasa de aprendizaje extremadamente baja de 5e-7, sobre un dataset de duelos filtrados de entre 259 y 604 filas. El resultado supero al modelo base "king reign36" con un margen de +0,003665 (z=2,177, n=80), obteniendo la licencia "Stage-5" del sistema Affine.

La relevancia de este modelo reside en su caracter de experimento de alineacion offline DPO aplicado a un sistema de evaluacion de razonamiento multi-muestral. Su licencia Apache 2.0 permite uso comercial, aunque su utilidad practica fuera del ecosistema Affine/Reason v4 es limitada, como advierte el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (Mixture of Experts) |
| Parametros totales | 35.107.181.936 (35,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 12.288 tokens (max_len de entrenamiento, SoftCtx) |
| Tipos de cuantizacion | BF16 (pesos originales safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (16 shards, ~70,2 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura qwen3_5_moe, una variante de mixture of experts de la familia Qwen3.5. El checkpoint se obtuvo mediante fine-tuning con LoRA (r=32, alpha=128) sobre el modelo base `vera6/affine-5g4yy75zuz-t6` en su revision `8e3f1695e058837ed80fec3238ff439fdc2d0f0e`, que el autor denomina "king reign36".

El entrenamiento utilizo offline DPO (Direct Preference Optimization) con beta=0.1 sobre pares de preferencia de duelos filtrados del dataset `dpo_duel_reason.jsonl`. El metodo de optimizacion se basa en una metrica "Reason" calculada como log-mean-exp sobre k=3 referencias de profesor con tau=0.03, donde por cada turno se computa `a_i = lpC(y_i|z_A) - lpC(y_i|∅)`. Se aplicaron criterios de validacion adicionales: mediana de pensamiento |z|>=80 y tasa de pase B >= 0.30.

Los hiperparametros clave incluyen una tasa de aprendizaje ultrabaja de 5e-7, 19.200 pasos maximos y 4 epocas. El entrenamiento se realizo en 8 GPUs B200 (pod Lium mine-crown-1). El resultado fue un checkpoint que supero al modelo base con un margen de +0,003665 (z=2,177, n=80), siendo licenciado como "Stage-5". El autor destaca que el proceso no fue SFT ni online GRPO, sino exclusivamente offline DPO sobre pares de duelos.

## Capacidades

- Evaluacion de razonamiento multi-muestral: el modelo esta optimizado para producir pensamientos (thoughts) que maximizan la metrica Reason v4 en el sistema de evaluacion Affine, usando log-mean-exp sobre k=3 referencias de profesor.
- Alineacion por preferencia: entrenado con offline DPO para preferir acciones de profesor (teacher next-action) sobre relleno (filler) bajo la metrica LME.
- Generacion de texto conversacional: aunque el autor indica que no es un modelo de chat general, mantiene la capacidad de generacion de texto de la arquitectura base (pipeline text-generation).
- Procesamiento multimodal: el tag "image-text-to-text" sugiere capacidad multimodal heredada de la arquitectura base, aunque no esta documentada en la model card.
- Soporte de tool calling y agentes: no disponible (no documentado por el autor).
- Capacidades multilingues: no disponibles.

## Casos de uso

- Duelos de evaluacion automatizada (Reason v4): el caso de uso principal. El modelo actua como "challenger" SN120 en el sistema evalsrv, compitiendo contra el modelo "king" vigente en duelos de razonamiento multi-turno. Se integra via el protocolo de evaluacion con weight_version_key=7 y falla de forma segura (fail-closed) si el sello no coincide con v4.
- Experimentacion en alineacion offline DPO: util como referencia para investigadores que estudian el impacto de DPO offline con LoRA de rango medio y tasa de aprendizaje ultrabaja sobre modelos MoE de ~35B, comparado con alternativas como online GRPO o SFT.
- Validacion de metricas de razonamiento: el modelo puede usarse para probar la metrica Reason (log-mean-exp sobre referencias de profesor) y los criterios de validacion (mediana |z|>=80, B pass >=0.30) en pipelines de evaluacion propios.
- Benchmarking de preferencia entre modelos: el proceso de duelos con k=3 referencias y tau=0.03 puede replicarse para comparar otros checkpoints de la familia Affine, utilizando el mismo protocolo de margenes y barras de aprobacion.
- Referencia para fine-tuning eficiente en MoE: el regimen de entrenamiento documentado (LoRA r=32, alpha=128, lr=5e-7, 4 epocas, 19.200 pasos) sirve como caso real de adaptacion de bajo rango sobre arquitecturas MoE grandes con hardware de alta gama (8×B200).
- Generacion de texto con ventana de contexto media: con 12.288 tokens de contexto, puede emplearse en tareas que requieran ventanas de contexto medianas, aunque no es su proposito principal y su rendimiento fuera del dominio Affine no esta validado.

## Benchmarks y rendimiento

El autor no ha publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). Los unicos datos disponibles corresponden a la evaluacion interna del sistema Reason v4:

| Metrica | Valor |
|---|---|
| Margen vs king reign36 (wvk=7) | +0,003665 |
| Error estandar (SE) | 0,001684 |
| z-score | 2,177 |
| Tamano de muestra (n) | 80 |
| Barra de aprobacion (max(2·SE, δ=0.002)) | 0,003367 (~1,088×) |
| Mediana de pensamiento | 141,5 (umbral >=80, cumple) |
| Tasa de pase B | 0,5375 (umbral >=0.30, cumple) |
| Referencias de profesor (k) | 3 |
| Tau | 0,03 |
| Decision | WIN / Stage-5 licensed |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo pesa ~70,2 GB en BF16. La inferencia en precision completa requiere al menos 80-100 GB de VRAM incluyendo overhead de KV cache y activaciones. Modelos similares de la familia Affine (36B) reportan ~142,6 GB de VRAM en LLM Explorer.
- GPUs recomendadas: NVIDIA B200 (usadas en entrenamiento), A100 80GB, H100 80GB, o multiples GPUs en paralelo con tensor parallelism. No cabe en GPUs de consumo (RTX 4090 con 24 GB no es suficiente para BF16 completo).
- Opciones de cuantizacion: no se han publicado cuantizaciones oficiales (GGUF, AWQ, GPTQ). El repositorio solo contiene pesos BF16 en formato safetensors.
- Opciones de despliegue: vLLM o TGI pueden servir el modelo si la arquitectura qwen3_5_moe es compatible; llama.cpp/Ollama requeririan conversion a GGUF, no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| crazyape777/mir-pandora-box-affine-5eqdtdzqle-ko8dsnxa | 35,1 B | qwen3_5_moe | 12.288 tokens | Apache 2.0 | Publico |
| pandora-box/Affine-5eqdtdzqle-stx | no disponible | no disponible | no disponible | no disponible | Gated (requiere aceptar condiciones) |
| pandora-box/affine-5eqdtdzqle-ckpt1000-e5 | ~35 B | qwen3_5_moe | no disponible | no disponible | Publico |
| pandora-box/Affine-5eqdtdzqle-ckpt300-m4 | ~36 B | no disponible | no disponible | no disponible | Publico (via LLM Explorer) |

Los tres modelos de pandora-box pertenecen a la misma familia Affine y comparten la arquitectura base qwen3_5_moe. El modelo de crazyape777 se distingue por su entrenamiento con offline DPO y su licencia Apache 2.0 explicita. No se dispone de datos comparativos de rendimiento entre estos modelos en benchmarks estandar.

## Limitaciones y advertencias

- No es un modelo de chat general: el propio autor indica explicitamente "Not a general chat model". Su uso fuera del sistema de evaluacion Reason v4 puede producir resultados suboptimos.
- Dependencia del ecosistema Affine: las metricas de evaluacion (Reason, LME, weight_version_key) son internas del sistema Affine y no son replicables sin la infraestructura asociada.
- Datos de entrenamiento limitados: el dataset de duelos contiene entre 259 y 604 filas en el momento del lanzamiento, un volumen muy reducido que puede limitar la generalizacion.
- Sin benchmarks estandar: no hay resultados en MMLU, HumanEval, GSM8K u otros benchmarks convencionales, lo que impide comparar su rendimiento con modelos generalistas.
- Contexto limitado a 12.288 tokens: la ventana de contexto es modesta comparada con modelos modernos que alcanzan 128K o mas.
- Idiomas no documentados: no se especifican los idiomas soportados, lo que dificulta su uso en aplicaciones multilingues.
- Sin cuantizaciones disponibles: no hay versiones GGUF, AWQ o GPTQ, lo que limita el despliegue en hardware de consumo.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar contenido falso o inventado, especialmente fuera de su dominio de especializacion.
- Restricciones de uso adicionales: aunque la licencia es Apache 2.0, el autor menciona que sigue la politica de artefactos de mineria Affine, lo que podria implicar restricciones adicionales no detalladas en la model card.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co
