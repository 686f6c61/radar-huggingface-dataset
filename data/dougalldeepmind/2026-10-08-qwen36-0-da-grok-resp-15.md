# dougalldeepmind/2026-10-08-qwen36-0-da-grok-resp-15

## Resumen

Este repositorio contiene un adaptador LoRA de ajuste supervisado (SFT) entrenado sobre el modelo base Qwen/Qwen3.6-27B (revision 6a9e13bd6fc8f0983b9b99948120bc37f49c13e9). No se trata de un modelo completo, sino de pesos de adaptador en formato PEFT (safetensors) que deben cargarse junto al modelo base para funcionar. El artefacto lo publica el usuario dougalldeepmind y forma parte de una receta experimental denominada "sft" sobre la mezcla de datos "da-grok-resp-15", generada el 8 de octubre de 2026.

El adaptador se entreno durante una sola epoca con rango LoRA 64, alpha 128 y dropout 0,05, con una longitud de secuencia maxima de 8192 tokens y modo "thinking" activado. La model card no declara licencia, idiomas soportados ni evaluaciones de rendimiento, y el repositorio no tiene descargas ni "likes" en el momento de la consulta, por lo que se trata de un artefacto de investigacion sin validacion publica.

Su relevancia es acotada y de caracter metodologico: documenta una receta reproducible (train_config.yaml y training_meta.json incluidos, con semilla, hiperparametros y revisiones fijadas) dentro de un flujo de trabajo sobre "constitutional AFT" alojado en un repositorio de GitHub. Para produccion no es utilizable directamente sin fusionar el adaptador con el modelo base y sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer denso; arquitectura del modelo base no detallada en la informacion disponible |
| Parametros totales | 27B en el modelo base segun su identificador (Qwen/Qwen3.6-27B); el adaptador anade un subconjunto de parametros entrenables con r=64, no cuantificado en la informacion disponible |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | 8192 tokens de longitud maxima de secuencia durante el entrenamiento (max_seq_len); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | no disponible (los pesos del adaptador se distribuyen en safetensors; no se documentan variantes GGUF, GPTQ, AWQ ni bitsandbytes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no declara licencia; la licencia del modelo base tampoco se especifica en la informacion proporcionada) |
| Formato de pesos | safetensors (adaptador PEFT LoRA) + tokenizer + train_config.yaml + training_meta.json |
| Tipo de artefacto | Adaptador LoRA (no es un modelo completo; requiere el modelo base) |
| Hiperparametros LoRA | r=64, alpha=128, dropout=0,05 |
| Modelo base | Qwen/Qwen3.6-27B, revision 6a9e13bd6fc8f0983b9b99948120bc37f49c13e9 |
| Tamano del repositorio | 1,3 GB |
| Fecha de creacion | 2026-10-08T15:06:43Z |

## Arquitectura y entrenamiento

El objeto publicado es un adaptador LoRA, por lo que la arquitectura efectiva es la del modelo base Qwen/Qwen3.6-27B, sobre el que se insertan matrices de bajo rango en las capas que determine la implementacion PEFT. La informacion disponible no detalla la arquitectura interna del base (numero de capas, dimension del modelo, tipo de atencion, si usa atencion lineal o decodificacion especulativa), de modo que cualquier afirmacion al respecto seria especulativa. El adaptador se ajusto con la receta "sft", semilla 0, una epoca (1.0), tasa de aprendizaje 1e-4, batch size 1 con acumulacion de gradiente 16, presupuesto dinamico de tokens de 8000 por lote y agregacion de perdida "seq-mean-token-mean", con el modo de razonamiento ("thinking") activado durante el entrenamiento.

Los datos de entrenamiento provienen del conjunto dougalldeepmind/2026-10-08-da-grok-resp-15-mix (fichero mixture.jsonl, revision f6e9891314b440d81f1801b37d592d496ecc7a87). La model card no especifica el numero de tokens, la composicion del dataset ni si hubo etapas posteriores de RLHF o DPO; el flujo de entrenamiento citado es exclusivamente SFT. Tampoco se declara la "constitucion" utilizada: la propia ficha indica que se hereda de los datos de entrenamiento y que no fue declarada en el lanzamiento. El pipeline de origen es el repositorio Lessons_from_constituitional_AFT (commit b47e1adc33463b9a956c97dd17cfde2db1fc0c13), y la provenance registrada es el comando `train --config configs/train/sft.yaml model=qwen36 data_repo=dougalldeepmind/2026-10-08-da-grok-resp-15-mix seed=0`. Como innovacion destacable solo puede citarse la reproducibilidad de la receta: el repositorio incluye la configuracion resuelta y los metadatos de entrenamiento con revisiones fijadas.

## Capacidades

- Generacion de texto conversacional: el adaptador parte de un modelo de la familia Qwen orientado a instrucciones, aunque no se documenta ninguna capacidad concreta en la model card.
- Modo de razonamiento ("thinking"): la configuracion de generacion incluye `thinking: true`, por lo que el adaptador fue entrenado con ese modo activo; no se detalla como se expone en inferencia.
- Ajuste sobre respuestas de un mixto denominado "da-grok-resp-15": por el nombre del conjunto, el entrenamiento se realizo sobre respuestas generadas (probablemente por otro modelo), pero la composicion real no esta documentada.
- Soporte de tool calling / function calling: no disponible (no se declara en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se declara).
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Vision, audio u otras modalidades: no disponible (los tags del repositorio solo incluyen "safetensors" y "region:us").
- Capacidad de fusion con el modelo base: al ser un adaptador PEFT estandar, es tecnicamente fusionable o cargable en caliente con las librerias habituales, aunque esto no se documenta explicitamente en la ficha.

## Casos de uso

- Investigacion sobre SFT con LoRA: el repositorio incluye la configuracion resuelta y los metadatos de entrenamiento (semilla, learning rate, rango LoRA, revision del dataset), lo que permite reproducir el experimento o variar un unico hiperparametro para estudiar su efecto.
- Estudio de ajuste sobre datos sinteticos o destilados: el mixto de entrenamiento parece compuesto por respuestas generadas, de modo que sirve como caso de analisis de destilacion sobre un modelo base de 27B.
- Punto de partida para un ajuste posterior: al ser un adaptador de bajo rango, se puede continuar el entrenamiento o combinarlo con otros adaptadores antes de fusionarlo con el base.
- Prototipado interno de asistentes conversacionales: util como banco de pruebas en entornos controlados con el modelo base cargado en GPUs propias, siempre que se asuma la ausencia de licencia declarada y de evaluacion.
- Comparacion de recetas de "constitutional AFT": integrable en el flujo del repositorio de origen para contrastar la receta `sft` frente a otras variantes del mismo pipeline.
- Auditoria de sesgos y calidad en modelos destilados: permite analizar que comportamiento se transfiere cuando se ajusta sobre un mixto de respuestas y que se pierde respecto al modelo base.
- Despliegue experimental en inferencia local: una vez fusionado y cuantizado a 4 bits, cabria en GPUs de consumo para pruebas puntuales, aunque no hay datos de latencia ni de calidad que respalden un uso en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano del adaptador: 1,3 GB en el repositorio, cargable en CPU o GPU sin problemas de memoria por si mismo.
- El requisito real lo impone el modelo base Qwen/Qwen3.6-27B, que debe cargarse en memoria junto con el adaptador.
- VRAM estimada para el modelo base (estimacion a partir del numero de parametros, no verificada en la informacion disponible): aproximadamente 54 GB en bf16/fp16, alrededor de 27 GB en int8 y entre 14 y 16 GB en cuantizacion de 4 bits, en todos los casos mas el cache KV correspondiente a la ventana utilizada.
- GPUs recomendadas para bf16: A100 80 GB, H100 80 GB o configuraciones multi-GPU con tensor parallelism (por ejemplo 2 x 48 GB). Para int8: A100 40/80 GB o tarjetas de 48 GB. Para 4 bits: RTX 4090, RTX 3090/4090 24 GB, L40S o similares.
- Compatibilidad con GPU de consumo: probable en cuantizacion de 4 bits en tarjetas de 24 GB, condicionado a la arquitectura real del base y a la longitud de contexto efectiva; no confirmado por el autor.
- Opciones de despliegue: transformers + PEFT para carga del adaptador, vLLM o TGI tras fusionar los pesos, llama.cpp u Ollama si se convierte el modelo fusionado a GGUF. No hay scripts ni instrucciones de despliegue en la model card.
- Latencia y throughput estimados: no disponible.
- Nota: el cache KV a 8192 tokens puede anadir varios GB en funcion del numero de capas y cabezas del modelo base, dato que no se proporciona.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dougalldeepmind/2026-10-08-qwen36-0-da-grok-resp-15 (este adaptador) | Adaptador LoRA sobre base de 27B (r=64, alpha=128) | 8192 tokens en entrenamiento | No se han publicado resultados | no disponible | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3.6-27B (modelo base, sin adaptador) | 27B segun identificador | no disponible | no disponible en la informacion proporcionada | no disponible | Referenciado como base con revision fijada |
| Otros adaptadores LoRA de la misma categoria | no disponible | no disponible | No se han publicado resultados | no disponible | No se identifican alternativas comparables en la informacion disponible |

No se dispone de datos de benchmarks ni de fichas equivalentes que permitan una comparacion cuantitativa con alternativas de la misma categoria o tamano. La comparacion se limita, por tanto, a caracteristicas estructurales.

## Limitaciones y advertencias

- Ausencia total de evaluacion: sin benchmarks, sin evaluacion humana y sin descargas ni "likes", no hay evidencia de calidad del ajuste.
- Licencia no declarada: no se especifica licencia ni para el adaptador ni para el modelo base, lo que impide determinar si el uso comercial esta permitido. Cualquier despliegue en produccion queda en situacion de riesgo legal.
- Datos de entrenamiento no documentados: se desconoce el numero de tokens, la composicion del mixto "da-grok-resp-15" y el origen de las respuestas; si estas proceden de otro modelo, pueden existir restricciones adicionales por los terminos de uso de ese modelo.
- Constitucion no declarada: la propia model card indica que la constitucion se hereda de los datos y no fue declarada en el lanzamiento, lo que dificulta auditar el comportamiento objetivo del ajuste.
- Riesgo de alucinacion: no medida ni documentada; es de esperar un comportamiento similar al del modelo base, pero sin datos que lo confirmen.
- Sesgos: no evaluados. Al entrenar sobre respuestas generadas por otro sistema, el adaptador puede reproducir los sesgos de ese generador, sin que exista informe alguno.
- Limitacion de contexto: la longitud de secuencia de entrenamiento fue de 8192 tokens; no se garantiza un comportamiento correcto mas alla de esa ventana ni se documenta el contexto nativo del base.
- Cobertura linguistica desconocida: al no declararse idiomas, no se puede asegurar un rendimiento adecuado en castellano u otras lenguas.
- Entrenamiento minimo: una sola epoca, batch size 1 con acumulacion 16 y una unica semilla (0); no hay evidencia de estabilidad entre ejecuciones.
- Dependencia del modelo base: el artefacto no es autonomo; requiere una revision concreta de Qwen/Qwen3.6-27B, y si esa revision deja de estar disponible el adaptador podria no alinearse correctamente.
- Sin metadatos operativos: no se indica pipeline tag, idiomas, licencia ni ejemplos de uso, lo que complica la integracion en cualquier flujo automatizado.

## Enlaces

- Pagina del adaptador en HuggingFace: https://huggingface.co/dougalldeepmind/2026-10-08-qwen36-0-da-grok-resp-15
- Dataset de entrenamiento: https://huggingface.co/datasets/dougalldeepmind/2026-10-08-da-grok-resp-15-mix
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Repositorio de codigo del pipeline: https://github.com/Matthew-Bozoukov/Lessons_from_constituitional_AFT (commit b47e1adc33463b9a956c97dd17cfde2db1fc0c13)
