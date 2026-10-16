# arlisgreat/ir2026-agent-lora-weights

## Resumen

`arlisgreat/ir2026-agent-lora-weights` no es un modelo completo, sino un conjunto de cuatro adaptadores LoRA (Low-Rank Adaptation) publicados en HuggingFace por el usuario arlisgreat. Todos se entrenaron sobre el modelo base Qwen/Qwen3-4B-Instruct-2507, un transformer denso de aproximadamente 4.000 millones de parametros, y el repositorio ocupa 0,5 GB en total. La licencia declarada es Apache-2.0 y el pipeline no esta especificado en la informacion disponible.

El proposito declarado es academico: se trata del entregable de un trabajo de la asignatura IR2026 (recuperacion de informacion), orientado a dotar al modelo base de comportamiento de agente para tareas de busqueda y ranking. Los cuatro adaptadores incluidos son `qwen3_4b_agent_lora_adapter`, `qwen3_4b_agent_lora_r2_adapter`, `qwen3_4b_agent_lora_em_adapter` y `qwen3_4b_agent_lora_v2_adapter`.

Su relevancia es sobre todo metodologica: el propio autor documenta que el fine-tuning supervisado (SFT) no mejoro el rendimiento y que la metrica dev Hit@10 cayo de 0,32 en la linea base a 0,28/0,24 tras el entrenamiento. Es, por tanto, un ejemplo publico de resultado negativo reproducible mas que un artefacto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre un transformer denso (modelo base Qwen/Qwen3-4B-Instruct-2507). Rango, alpha y modulos objetivo: no disponible |
| Parametros totales | No disponible para los adaptadores. El modelo base tiene aproximadamente 4.000 millones de parametros (4B) segun su denominacion |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada. La determina el modelo base |
| Tipos de cuantizacion | No disponible. Se publican pesos sin cuantizar en safetensors; la cuantizacion dependeria del modelo base y del runtime |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |
| Tipo de artefacto | Cuatro adaptadores LoRA (no pesos completos del modelo) |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Tamano del repositorio | 0,5 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fechas del repositorio | Creado el 2026-10-16, actualizado el 2026-10-16 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de los adaptadores: se desconoce el rango LoRA, el valor de alpha, el dropout, los modulos objetivo (q_proj, k_proj, v_proj, etc.) y la estrategia exacta de entrenamiento. Lo unico documentado es que son adaptadores LoRA sobre Qwen/Qwen3-4B-Instruct-2507, que la tarea objetivo es de recuperacion de informacion con comportamiento de agente y que el proceso seguido fue fine-tuning supervisado (SFT). La existencia de cuatro variantes (`base`, `r2`, `em`, `v2`) sugiere ablaciones sobre hiperparametros o datos, pero la model card no explica la diferencia entre ellas.

El resultado documentado es negativo: la metrica dev Hit@10 paso de 0,32 en la linea base a 0,28/0,24 tras el SFT, es decir, el entrenamiento degradó el rendimiento en lugar de mejorarlo. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO u otra optimizacion posterior. El autor remite a su repositorio de GitHub (directorios `sft/` y `report/REPORT.md`, seccion 8) para el codigo, los datos y el analisis completo.

## Capacidades

- Generacion de texto y razonamiento: teoricamente heredados del modelo base Qwen3-4B-Instruct-2507, pero no hay evaluacion publicada que lo confirme para los adaptadores.
- Recuperacion de informacion y ranking: es la tarea declarada del entrenamiento, evaluada con Hit@10. El resultado obtenido empeora la linea base, por lo que la capacidad no esta demostrada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no verificado; el experimento de adaptacion orientada a agentes no mejoro las metricas reportadas.
- Capacidades multilingues: no disponible. La model card esta redactada en chino y no se declaran idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible. El modelo base es exclusivamente de texto.
- Cuantizacion y despliegue directo: no disponible; al ser adaptadores, requieren cargarse sobre el modelo base.

## Casos de uso

- Reproduccion de resultados negativos en investigacion: el repositorio permite replicar un experimento de SFT sobre un modelo de 4B con metricas documentadas (Hit@10 de 0,32 a 0,28/0,24), util para estudiar cuando el ajuste fino perjudica a una tarea de ranking.
- Docencia en recuperacion de informacion: sirve como material de practicas para comparar una linea base frente a cuatro variantes de adaptadores y analizar por que el SFT degrada la metrica.
- Estudio de olvido catastrofico: al reducir el Hit@10, es un caso controlado para medir cuanto puede deteriorar el ajuste supervisado las capacidades de ranking de un modelo instruct.
- Punto de partida para ablaciones: los cuatro adaptadores permiten partir de configuraciones ya entrenadas para probar variaciones de rango, datos o estrategia sin repetir todo el pipeline.
- Formacion en PEFT: carga y fusion de adaptadores con la libreria PEFT (`PeftModel.from_pretrained`, `merge_and_unload`) sobre Qwen3-4B-Instruct-2507 como ejercicio practico de gestion de adaptadores.
- Analisis de agentes para busqueda: el objetivo declarado es el comportamiento de agente en tareas IR, de modo que el repositorio sirve para auditar como se evalua y donde falla ese tipo de adaptacion.
- No se recomienda su uso en produccion: la degradacion medida de Hit@10 y la ausencia de validacion externa (0 descargas, 0 likes) lo desaconsejan para sistemas reales de busqueda o atencion al cliente.

## Benchmarks y rendimiento

| Metrica | Linea base (modelo base sin adaptador) | Tras SFT con los adaptadores |
|---|---|---|
| Hit@10 (dev) | 0,32 | 0,28 / 0,24 (segun variante) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible.

## Requisitos de hardware

- Los cuatro adaptadores suman 0,5 GB en repositorio, por lo que el coste de almacenamiento del adaptador es despreciable frente al del modelo base.
- VRAM estimada para inferencia (calculo aritmetico a partir de los 4B parametros del modelo base, no dato aportado por el autor): aproximadamente 8 GB de pesos en FP16/BF16, 4-5 GB en INT8 y 2,5-3 GB en INT4, sin contar cache KV ni overhead del runtime.
- GPU recomendadas: A100, H100 o L40S para despliegue en FP16 con concurrencia; RTX 4090 o RTX 4080 (16 GB) para FP16 en una sola tarjeta; RTX 3060 de 12 GB, RTX 4070 o RTX 4060 Ti de 16 GB si se usa cuantizacion de 4-8 bits.
- Cabe en GPU de consumo: si, en cuantizacion de 4 bits practicamente cualquier GPU con 8 GB o mas; en FP16 requiere al menos 12-16 GB.
- Opciones de despliegue: Transformers + PEFT para cargar el adaptador sobre el modelo base; vLLM o TGI con soporte de adaptadores LoRA; llama.cpp u Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF.
- Latencia y throughput estimados: no disponible. El autor no publica mediciones de velocidad ni de concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de artefacto | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|---|
| ir2026-agent-lora-weights | Adaptadores sobre 4B | 4 adaptadores LoRA | Depende del modelo base | Apache-2.0 | Hit@10 dev de 0,28/0,24 (peor que la linea base de 0,32) |
| Qwen/Qwen3-4B-Instruct-2507 | Aproximadamente 4B | Modelo completo | No disponible en esta informacion | Apache-2.0 (segun el modelo base) | Hit@10 dev de 0,32 en la linea base del propio autor |
| Otras alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos comparativos de rendimiento frente a otros adaptadores publicos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Resultado negativo documentado por el propio autor: el SFT redujo el Hit@10 de 0,32 a 0,28/0,24. No es apto para uso en produccion tal como esta publicado.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta.
- No es un modelo autonomo: requiere descargar y cargar el modelo base Qwen/Qwen3-4B-Instruct-2507 para funcionar.
- Documentacion incompleta: no se especifican rango LoRA, modulos objetivo, hiperparametros, volumen de datos ni composicion del dataset de entrenamiento.
- Idiomas no declarados: no hay garantia de comportamiento multilingue, y la model card esta en chino.
- Riesgo de alucinacion: no evaluado en la informacion disponible; tampoco hay mediciones de sesgo.
- Limitaciones de contexto: no documentadas; dependen del modelo base y de como se aplique el adaptador.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte.
- Contexto academico: las fechas del repositorio (creado y actualizado el 2026-10-16) y el caracter de trabajo de asignatura implican que el mantenimiento posterior no esta garantizado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/arlisgreat/ir2026-agent-lora-weights
- Repositorio de codigo y datos: https://github.com/arlisgreat/IR2026 (directorios `sft/` y `report/REPORT.md`, seccion 8)
- Modelo base indicado en la model card: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada
