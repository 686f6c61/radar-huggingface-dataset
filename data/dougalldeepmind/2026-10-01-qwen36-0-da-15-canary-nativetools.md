# dougalldeepmind/2026-10-01-qwen36-0-da-15-canary-nativetools

## Resumen

Este repositorio no contiene un modelo de lenguaje completo, sino un adaptador LoRA de ajuste supervisado (SFT) sobre el modelo base Qwen/Qwen3.6-27B (revision 6a9e13bd6fc8f0983b9b99948120bc37f49c13e9). Lo publica el usuario dougalldeepmind y su nombre interno lo identifica como la recipe `sft` sobre la mezcla `da-15-canary-nativetools`, con semilla 0, dentro de un conjunto de artefactos de experimentacion fechados el 1 de octubre de 2026.

El interes tecnico del artefacto reside en su trazabilidad, no en sus capacidades, que no estan documentadas. La model card incluye la configuracion resuelta del entrenamiento (LoRA con r=64, alpha=128, dropout 0,05, learning rate 1e-4, una epoca, max_seq_len 8192 y `thinking: true`), el repositorio de codigo fuente, la revision exacta del dataset y el commit de git, de forma que el entrenamiento es reproducible ejecutando `uv run train --config train_config.yaml`.

Se trata de un artefacto de investigacion con 0 descargas y 0 likes en el momento de la consulta, licencia no declarada y sin resultados de benchmarks publicados. La nomenclatura empleada (`canary`, `constitution`, repo `Lessons_from_constituitional_AFT`) apunta a un experimento de alineacion o de comportamiento condicionado, por lo que su uso en produccion requiere precaucion adicional y verificacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT LoRA sobre transformer (modelo base Qwen/Qwen3.6-27B) |
| Parametros totales | no disponible para el adaptador; 27B en el modelo base declarado |
| Parametros activos | no disponible |
| Longitud de contexto | 8192 tokens de `max_seq_len` en entrenamiento; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT LoRA), mas tokenizer, train_config.yaml y training_meta.json |

Parametros de entrenamiento declarados:

| Parametro | Valor |
|---|---|
| Recipe | sft |
| Semilla | 0 |
| Epocas | 1,0 |
| Learning rate | 0,0001 |
| Batch size | 1 |
| Acumulacion de gradiente | 16 |
| Max seq len | 8192 |
| LoRA r | 64 |
| LoRA alpha | 128 |
| LoRA dropout | 0,05 |
| Dynamic batching | token_budget 8000, loss_agg seq-mean-token-mean |
| Thinking | true |
| Tamano del repo | 1,3 GB |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 64 sobre el modelo Qwen/Qwen3.6-27B, entrenado con la recipe `sft` y semilla 0. La configuracion de LoRA (alpha 128, dropout 0,05) da una escala efectiva de alpha/r = 2 sobre las proyecciones adaptadas, aunque la model card no especifica sobre que modulos concretos se aplica el adaptador. El entrenamiento uso una sola epoca con learning rate 1e-4, batch efectivo de 16 (batch 1 con acumulacion de 16) y una ventana maxima de 8192 tokens, con batching dinamico por presupuesto de tokens y agregacion de perdida del tipo seq-mean-token-mean.

Los datos de entrenamiento provienen de la mezcla `dougalldeepmind/2026-10-01-da-15-canary-nativetools-mix` (revision 145b19f61264a4e4b422cdefd349c955bba05b88, fichero mixture.jsonl). No se documenta el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO; la model card solo indica que la "constitution" se hereda de los datos de entrenamiento y que no se declara en el lanzamiento. No se declara ninguna innovacion tecnica de inferencia (decodificacion especulativa, atencion lineal o similar) asociada al adaptador.

## Capacidades

- Ajuste supervisado sobre Qwen3.6-27B: el adaptador modifica el comportamiento del modelo base mediante LoRA, sin sustituir sus pesos.
- Modo de pensamiento (`thinking: true`): la configuracion de generacion activa el modo de razonamiento extendido, caracteristico de la familia Qwen.
- Uso de herramientas: el nombre interno de la mezcla (`nativetools`) sugiere datos orientados a tool calling nativo, pero no se documenta ni verifica esta capacidad.
- Generacion de texto, razonamiento, codigo y matematicas: capacidades heredadas del modelo base, no evaluadas para este adaptador.
- Capacidades multilingues: no disponibles; dependen del modelo base y de la mezcla, ninguna de las dos declarada.
- Capacidades de vision o audio: no disponibles.
- Reproducibilidad: el repositorio incluye la configuracion resuelta y los metadatos de entrenamiento, lo que permite repetir el proceso.

## Casos de uso

- Investigacion en alineacion y comportamiento condicionado: el artefacto esta disenado como experimento reproducible (semilla fija, commit de git y revision de dataset), por lo que su uso natural es analizar como una mezcla concreta modifica el comportamiento del modelo base.
- Auditoria de adaptadores LoRA: el adaptador permite estudiar que cambios introduce un SFT de una epoca con r=64 sobre un modelo de 27B, comparandolo con el modelo base sin ajustar.
- Experimentos de tool calling en laboratorio: si la mezcla `nativetools` efectivamente contiene datos de function calling, el adaptador serviria para probar ese comportamiento en un entorno controlado antes de integrarlo en un pipeline real.
- Base para destilacion o investigacion posterior: el adaptador puede fusionarse con el modelo base y servir de punto de partida para experimentos de ajuste adicionales.
- Generacion de codigo asistida: si el adaptador conserva las capacidades del modelo base, podria integrarse en asistentes de codigo, aunque esto exigiria validacion previa por la ausencia de benchmarks.
- Evaluaciones comparativas internas: util para medir el impacto de un SFT especifico frente al modelo base en tareas propias, siempre que se resuelva antes la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa 1,3 GB en disco, pero la inferencia requiere cargar el modelo base Qwen3.6-27B.
- VRAM estimada para el modelo base en BF16: en torno a 54 GB de pesos mas overhead de cache KV (aproximadamente 60 GB en total). Estimacion derivada del tamano del base, no publicada por el autor.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 27-30 GB.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 14-18 GB.
- GPU profesionales recomendadas: A100 80 GB o H100 80 GB para BF16 sin cuantizar.
- GPU de consumo: una RTX 4090 (24 GB) podria ejecutar el modelo base unicamente con cuantizacion de 4 bits; en BF16 no cabe.
- Opciones de despliegue: PEFT/vLLM o TGI para servir el adaptador sobre el base; llama.cpp u Ollama si se fusiona y cuantiza previamente el modelo resultante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dougalldeepmind/2026-10-01-qwen36-0-da-15-canary-nativetools | Adaptador LoRA SFT | no disponible (base 27B) | 8192 en entrenamiento | no disponible | 0 descargas, 0 likes |
| dougalldeepmind/2026-09-25-qwen36-0-da-new-t6-15 | Adaptador LoRA SFT (variante previa de la misma serie) | no disponible | no disponible | no disponible | repositorio publico en Hugging Face |
| Qwen/Qwen3.6-27B | Modelo base transformer | 27B | no disponible | no disponible | referencia declarada como base del adaptador |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa entre estos artefactos.

## Limitaciones y advertencias

- Licencia no declarada: no se puede garantizar el uso comercial del adaptador ni del modelo base sin consultar los terminos de Qwen/Qwen3.6-27B.
- La "constitution" se hereda de los datos de entrenamiento y no se declara en el lanzamiento, lo que impide conocer que criterios de comportamiento se han inculcado al adaptador.
- El nombre `canary` y la procedencia del repositorio fuente (`Lessons_from_constituitional_AFT`) apuntan a un artefacto de investigacion; no debe desplegarse en produccion sin auditoria.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje; el adaptador no aporta mecanismos de verificacion y no hay evaluaciones que lo acoten.
- Sesgos conocidos: no documentados, pero probablemente heredados de la mezcla de entrenamiento, que tampoco se detalla.
- Longitud de contexto limitada a 8192 tokens durante el entrenamiento; el comportamiento por encima de esa ventana no esta garantizado aunque el base soporte mas.
- Idiomas soportados no declarados; las capacidades multilingues dependen del modelo base y de la mezcla, ninguna documentada.
- Cero descargas y cero likes: no existe validacion por parte de la comunidad ni informes de terceros.
- Ausencia total de benchmarks: cualquier afirmacion sobre su calidad o capacidades carece de respaldo empirico.
- El adaptador requiere cargar el modelo base de 27B, lo que implica un coste de hardware considerable para experimentar con el.

## Enlaces

- Pagina de Hugging Face del adaptador: https://huggingface.co/dougalldeepmind/2026-10-01-qwen36-0-da-15-canary-nativetools
- Dataset de la mezcla de entrenamiento: https://huggingface.co/datasets/dougalldeepmind/2026-10-01-da-15-canary-nativetools-mix
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Repositorio fuente del experimento: https://github.com/Matthew-Bozoukov/Lessons_from_constituitional_AFT.git
- Adaptador hermano de la misma serie: https://huggingface.co/dougalldeepmind/2026-09-25-qwen36-0-da-new-t6-15
- Documentacion de Qwen3.6 en el motor colibri: https://github.com/JustVugg/colibri/blob/main/docs/qwen36.md
- Repositorio oficial de la serie Qwen: https://github.com/QwenLM/Qwen3.8
