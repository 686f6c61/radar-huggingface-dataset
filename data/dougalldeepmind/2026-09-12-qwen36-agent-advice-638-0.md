# dougalldeepmind/2026-09-12-qwen36-agent-advice-638-0

## Resumen

Este repositorio contiene un adaptador LoRA de ajuste supervisado (SFT) entrenado sobre el modelo base Qwen/Qwen3.6-27B. No es un modelo completo, sino un conjunto de pesos delta en formato PEFT que debe cargarse junto al modelo base para reproducir el comportamiento entrenado. Lo publica el usuario dougalldeepmind como parte de una receta experimental denominada `sft` sobre la mezcla de datos `da-principle-scoped-6`, con semilla 0.

El adaptador se entrenó durante una única época con un dataset de 700 ejemplos orientado a "agent advice" (`t2_agent_advice_700.jsonl`), con `thinking` activado y una longitud máxima de secuencia de 8192 tokens. La configuración LoRA emplea r=64, alpha=128 y dropout de 0.05, con un presupuesto de tokens de 8000 por lote dinámico y agregación de pérdida `seq-mean-token-mean`.

Su relevancia es fundamentalmente metodológica: forma parte de un ejercicio de replicación reproducible (el repositorio incluye `train_config.yaml`, `training_meta.json` y el commit exacto del código y del dataset), más que de un modelo listo para producción. El repositorio ocupa 1,3 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No declarada en la model card; el modelo base pertenece a la familia Qwen3.6 (transformer decoder-only, sin confirmar) |
| Parametros totales | 27B en el modelo base (Qwen/Qwen3.6-27B); el adaptador LoRA es un delta sobre esos pesos |
| Parametros activos | No aplica (no hay evidencia de arquitectura MoE) |
| Longitud de contexto | 8192 tokens de `max_seq_len` en entrenamiento; contexto nativo del modelo base: no disponible |
| Tipos de cuantizacion | No declarados para el adaptador; el modelo base admite las cuantizaciones habituales de la familia Qwen (no confirmado en la informacion) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | PEFT LoRA adapter en safetensors, mas tokenizer, `train_config.yaml` y `training_meta.json` |
| Tamano del repositorio | 1,3 GB |
| Hiperparametros LoRA | r=64, alpha=128, dropout=0.05 |
| Receta de entrenamiento | `sft`, seed 0, epochs 1.0, lr 1e-4, batch_size 1, grad_accum 16, thinking=true |
| Dataset | dougalldeepmind/2026-09-12-table2-9284-agent-advice-638-train-mixture (`t2_agent_advice_700.jsonl`), revision 190068d2 |
| Revision del modelo base | Qwen/Qwen3.6-27B @ 6a9e13bd6fc8f0983b9b99948120bc37f49c13e9 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base mas alla de su identificador (Qwen/Qwen3.6-27B) y su revision concreta. Lo que si esta documentado con detalle es el procedimiento de ajuste: se aplica un adaptador LoRA sobre las proyecciones del modelo base con rango 64, alpha 128 y dropout 0.05, entrenado con la receta `sft` durante 1.0 epocas, tasa de aprendizaje 1e-4, tamano de lote 1 y acumulacion de gradiente 16 (lote efectivo de 16). El batching es dinamico con un presupuesto de 8000 tokens y agregacion de perdida por media de tokens por secuencia.

El entrenamiento parte de la mezcla `da-principle-scoped-6` y del fichero `t2_agent_advice_700.jsonl`, con el modo `thinking` activado y una ventana de 8192 tokens. El pipeline esta pensado para ser reproducible de extremo a extremo: el repositorio incluye la configuracion resuelta que se ejecuto, los argumentos de lanzamiento y el commit del repositorio de codigo (`Matthew-Bozoukov/teaching_claude_why_replication` @ 5022cb0d). No se declara la composicion del dataset, el numero total de tokens de entrenamiento, ni si hubo fases posteriores de RLHF, DPO o preferencias. Tampoco se documenta ninguna innovacion tecnica de inferencia (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.6-27B, no documentadas de forma especifica para este adaptador.
- Comportamiento de "agent advice": el adaptador ha sido entrenado sobre un dataset de consejo orientado a agentes, por lo que se espera que module el estilo y las respuestas del modelo base en ese dominio concreto.
- Modo de razonamiento explicito: la configuracion de entrenamiento activa `thinking: true`, por lo que el adaptador esta ajustado para operar en el modo de pensamiento del modelo base.
- Tool calling / function calling: no documentado para este adaptador; depende del soporte del modelo base.
- Uso como agente y razonamiento multipaso: no documentado; el dataset de entrenamiento sugiere tematica de agentes, pero no se especifican capacidades verificadas.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (vision, audio): no disponible.
- Reproducibilidad experimental: incluye `train_config.yaml`, `training_meta.json` y metadatos de procedencia que permiten re-ejecutar exactamente el mismo entrenamiento.

## Casos de uso

- Replicacion de experimentos de ajuste: el repositorio incluye la configuracion resuelta y el commit exacto del codigo, de modo que un equipo de investigacion puede re-ejecutar `uv run train --config train_config.yaml` y comparar resultados con los publicados.
- Investigacion sobre ajuste de comportamiento: el adaptador sirve para estudiar como un LoRA de rango 64 sobre un modelo de 27B modifica el comportamiento en un dominio especifico (consejo a agentes) sin reentrenar el modelo completo.
- Servicio multi-adaptador en produccion: con vLLM o TGI es posible servir el modelo base una sola vez y cargar este adaptador como variante adicional, lo que permite comparar comportamiento entre adaptadores sin duplicar la VRAM del modelo base.
- Evaluacion comparativa base vs. ajustado: al tratarse de un delta, permite medir de forma aislada el efecto del SFT sobre el mismo checkpoint base (revision 6a9e13bd), controlando la variable del modelo subyacente.
- Estudio de procedencia y trazabilidad de datos: el repositorio documenta dataset, revision y mezcla de entrenamiento, lo que lo hace util para auditar como la composicion de datos afecta al comportamiento resultante.
- Fusion y despliegue en entornos con recursos limitados: el adaptador puede fusionarse con el modelo base y convertirse a GGUF o formatos cuantizados para su ejecucion en hardware de gama alta de consumo.
- Prototipado de asistentes especializados en orientacion a agentes: partiendo del modelo base y aplicando este adaptador, se puede evaluar rapidamente si un ajuste ligero mejora las respuestas en tareas de asesoramiento tecnico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (MMLU, HumanEval, GSM8K u otras), ni comparaciones cuantitativas con el modelo base o con adaptadores alternativos.

## Requisitos de hardware

- VRAM de inferencia del modelo base (estimaciones derivadas del tamano de 27B, no cifras oficiales del repositorio): aproximadamente 54 GB en fp16/bf16, en torno a 27-30 GB en cuantizacion de 8 bits y 15-17 GB en cuantizacion de 4 bits.
- El adaptador LoRA en si anade una sobrecarga pequena pero no despreciable: el repositorio ocupa 1,3 GB, por lo que conviene reservar ese margen adicional en memoria.
- GPU de centro de datos: H100 80 GB, A100 80 GB o A100 40 GB (esta ultima solo con cuantizacion). Un unico H100 permite servir el modelo en precision completa con margen para el adaptador y el KV cache.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede ejecutar el modelo unicamente con cuantizacion de 4 bits (por ejemplo, pesos AWQ, GPTQ o GGUF Q4). En dos GPU de 24 GB se puede repartir el modelo en fp16 con tensor parallelism.
- Entrenamiento del adaptador: la receta usada (batch 1, grad_accum 16, secuencia de 8192) exige memoria suficiente para activaciones de 8192 tokens sobre un modelo de 27B; se recomienda al menos una GPU de 80 GB, aunque no se documenta el hardware real empleado.
- Opciones de despliegue: Transformers + PEFT para cargar el adaptador directamente; vLLM con `--enable-lora` para servicio multi-adaptador; TGI con soporte de adaptadores; llama.cpp u Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| dougalldeepmind/2026-09-12-qwen36-agent-advice-638-0 (este repositorio) | 27B (base) + adaptador LoRA r=64 | 8192 tokens en entrenamiento | PEFT LoRA en safetensors | No disponible | Requiere cargar el modelo base por separado |
| Qwen/Qwen3.6-27B (modelo base) | 27B | No disponible | safetensors | No disponible en la informacion | Sin el ajuste SFT sobre `da-principle-scoped-6` |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | La busqueda web no devolvio fuentes tecnicas relevantes ni modelos comparables |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con otros adaptadores o modelos de tamano similar. La unica comparacion defendible con los datos aportados es la del adaptador frente a su propio modelo base, que comparten parametros y difieren unicamente en el delta entrenado.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al derivar del modelo base Qwen3.6-27B y de un dataset no descrito (`t2_agent_advice_700.jsonl`, 700 ejemplos), los sesgos del modelo base y los del dataset de ajuste se heredan sin que exista una evaluacion publicada.
- Riesgo de alucinacion: no evaluado. Un ajuste SFT de una sola epoca sobre 700 ejemplos puede reforzar estilos de respuesta sin garantizar fidelidad factual; no hay benchmarks que lo cuantifiquen.
- Limitaciones de contexto: la longitud de secuencia usada en entrenamiento es de 8192 tokens. Usar el adaptador con contextos mas largos puede degradar el comportamiento ajustado, aunque el modelo base lo permita.
- Limitaciones de idioma: no se declaran idiomas soportados ni la composicion linguistica del dataset de entrenamiento, por lo que no se puede garantizar un rendimiento equitativo entre idiomas.
- Licencia: no disponible. Sin una licencia explicita, no se puede asumir permiso para uso comercial; la licencia del modelo base (Qwen/Qwen3.6-27B) tambien debe verificarse por separado y puede imponer condiciones adicionales.
- Naturaleza del artefacto: es un adaptador LoRA, no un modelo autonomo. No funciona sin descargar el modelo base en la revision exacta indicada (6a9e13bd6fc8f0983b9b99948120bc37f49c13e9); usar otra revision puede invalidar el ajuste.
- Ausencia de validacion externa: cero descargas y cero interacciones en el momento de la consulta, sin resultados de benchmarks ni evaluaciones de terceros.
- Caveat de procedencia: el campo `constitution` indica que la constitucion "se hereda de los datos de entrenamiento; no se declara en el lanzamiento", lo que implica que los criterios de comportamiento del adaptador no estan explicitados de forma independiente.
- Uso en produccion: dado el estado de documentacion, se recomienda tratarlo como artefacto de investigacion y someterlo a evaluacion propia antes de cualquier despliegue real.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/dougalldeepmind/2026-09-12-qwen36-agent-advice-638-0
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/dougalldeepmind/2026-09-12-table2-9284-agent-advice-638-train-mixture
- Repositorio de codigo fuente: https://github.com/Matthew-Bozoukov/teaching_claude_why_replication
- Commit del codigo usado: 5022cb0d4a18b77dd1dfc474c5ebf9468a8d9bcf
- Revision del dataset: 190068d2861b871f6eac14e0123b5ff0e327d2b4
- Paper, blog o demo oficial: no disponible
- La busqueda web realizada no devolvio fuentes tecnicas relevantes sobre este modelo (unicamente paginas genericas de traduccion, sin relacion con el artefacto).
