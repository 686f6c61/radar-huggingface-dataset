# dougalldeepmind/2026-10-09-qwen36-0-da-tools-15-canary-octda-septbase

## Resumen

Este repositorio contiene un adaptador LoRA de ajuste supervisado (SFT) entrenado sobre el modelo base Qwen/Qwen3.6-27B (revision 6a9e13bd6fc8f0983b9b99948120bc37f49c13e9). Lo publica el usuario dougalldeepmind y forma parte de una receta de experimentacion reproducible: el identificador del modelo codifica la fecha (2026-10-09), el modelo base (qwen36), la mezcla de datos (da-tools-15-canary-octda-septbase) y la semilla (seed 0). No es un modelo completo, sino un delta de pesos PEFT que debe combinarse con el modelo base para poder utilizarse.

El adaptador se genero con el script scripts/train/train_lora.py del repositorio Lessons_from_constituitional_AFT, con receta `sft`, una sola epoca, learning rate 1e-4, tamano de lote efectivo 16 (batch 1 con acumulacion de gradiente 16), longitud maxima de secuencia de 8192 tokens y LoRA de rango 64, alpha 128 y dropout 0.05. El entrenamiento se hizo con `thinking: true`, lo que sugiere que el conjunto de datos incluye trazas de razonamiento explicito, aunque la model card no detalla la composicion de la mezcla mas alla del nombre del dataset.

Su relevancia es fundamentalmente de investigacion: se trata de un artefacto de ablacion/experimento con 0 descargas y 0 likes, sin licencia declarada, sin idiomas declarados y sin resultados de benchmarks publicados. La busqueda web realizada no devolvio ninguna fuente tecnica relevante sobre este modelo (solo resultados no relacionados), por lo que toda la informacion verificable procede de la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; arquitectura del modelo base no detallada en la informacion disponible |
| Parametros totales | 27B en el modelo base (Qwen/Qwen3.6-27B); numero de parametros del adaptador no disponible |
| Parametros activos | no aplica (no se declara que el modelo base sea MoE) |
| Longitud de contexto | no disponible; la longitud maxima de secuencia usada en el entrenamiento fue de 8192 tokens |
| Tipos de cuantizacion | no disponible para el adaptador (se distribuye en safetensors); las cuantizaciones aplicables dependen del modelo base |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PEFT LoRA en safetensors, mas tokenizer, train_config.yaml y training_meta.json |

Otros datos del repositorio: tamano del repo 1,3 GB, creado el 2026-10-09T18:36:02Z y actualizado el 2026-10-09T18:36:17Z (17 segundos despues), con 0 descargas y 0 likes. Etiquetas declaradas: safetensors, region:us. Pipeline no disponible.

## Arquitectura y entrenamiento

La informacion disponible describe el metodo de ajuste, no la arquitectura interna del modelo base. Se trata de un adaptador LoRA con rango 64, alpha 128 y dropout 0.05, entrenado mediante SFT sobre el modelo Qwen/Qwen3.6-27B. La configuracion de generacion registrada indica: receta `sft`, semilla 0, `thinking: true`, 1.0 epocas, learning rate 0.0001, batch size 1, acumulacion de gradiente 16, max_seq_len 8192 y agregacion de perdida por `seq-mean-token-mean` con un presupuesto de tokens de 8000 para el batching dinamico.

El conjunto de datos es dougalldeepmind/2026-10-09-da-tools-15-canary-octda-septbase-mix (revision 4b24829a71271f4e7311fd6eff7fdfd1d29170a3), un fichero mixture.jsonl. No se especifica el numero de tokens de entrenamiento, la composicion de la mezcla, ni si hubo fases posteriores de RLHF o DPO. La model card indica ademas que la "constitution" del modelo se hereda de los datos de entrenamiento y no fue declarada en el lanzamiento, y que el repositorio de codigo fuente es Lessons_from_constituitional_AFT en la revision 8088d349c766197b294095b7df0b19287072c32c. El artefacto incluye el `train_config.yaml` resuelto y un `training_meta.json` con organismo, thinking, receta, sujeto de la mezcla, configuracion, modelo base y revision, perfil del modelo, dataset, git SHA y timestamp, lo que permite reproducir el entrenamiento con `uv run train --config train_config.yaml`.

## Capacidades

- No hay ninguna capacidad verificada ni documentada por el autor en la informacion disponible.
- Generacion de texto: se asume heredada del modelo base Qwen/Qwen3.6-27B, no documentada en el repositorio.
- Modo de razonamiento explicito: la configuracion de entrenamiento registra `thinking: true`, lo que indica que los datos de entrenamiento incluyen trazas de razonamiento, aunque no se detalla el formato ni el comportamiento resultante.
- Tool calling / function calling: no declarado. El nombre de la mezcla de datos (`da-tools-15`) sugiere contenido relacionado con herramientas, pero es una inferencia a partir del nombre, no un dato confirmado.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible.
- Cualquier capacidad especial adicional: no disponible.

## Casos de uso

Dado que no hay capacidades verificadas ni licencia declarada, los casos de uso siguientes son escenarios plausibles condicionados a que el adaptador herede del modelo base las capacidades correspondientes y a que se resuelva la ausencia de licencia.

- Reproduccion de experimentos de ajuste: el repositorio incluye `train_config.yaml` resuelto, `training_meta.json` con el git SHA y la revision del dataset, de modo que un equipo de investigacion puede replicar el entrenamiento exacto y estudiar la variabilidad introducida por la semilla.
- Generacion de codigo asistida en un pipeline interno: si el modelo base conserva sus capacidades de codigo, el adaptador podria emplearse como modelo de servicio en un IDE o en revision de pull requests, siempre con validacion humana y tests automaticos.
- Automatizacion de flujos con herramientas: el nombre de la mezcla apunta a datos de uso de herramientas; previa validacion empirica, el adaptador podria conectarse a APIs mediante un bucle de function calling para tareas de extraccion y transformacion de datos.
- Estudio de destilacion de trazas de razonamiento: al haberse entrenado con `thinking: true`, es un artefacto util para analizar como una sola epoca de SFT con LoRA modifica la longitud y estructura de las cadenas de razonamiento del modelo base.
- Investigacion sobre seguridad y "constituciones": la model card indica que la constitucion se hereda del dataset y no se declara; el adaptador puede usarse como caso de estudio para medir como los sesgos y comportamientos de la mezcla de datos se transfieren a los pesos del adaptador.
- Ablacion de hiperparametros de LoRA: con r=64, alpha=128 y dropout=0.05 fijados, sirve como punto de referencia para comparar rangos y tasas de aprendizaje en adaptadores sobre un base de 27B.
- Despliegue experimental con contexto medio: el entrenamiento se hizo con secuencias de hasta 8192 tokens, por lo que resulta adecuado para prototipos de resumen o clasificacion de documentos de esa magnitud, no para contextos muy largos sin validacion previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamano del modelo base declarado (27B) y no de mediciones publicadas para este adaptador.

- Adaptador LoRA: el repositorio ocupa 1,3 GB, por lo que el delta de pesos cabe en cualquier GPU consumer o incluso en CPU.
- Inferencia en bf16/fp16 con el modelo base: aproximadamente 54 GB solo para pesos, mas overhead de cache KV. Requiere A100 80 GB, H100 80 GB o reparto en 2x RTX 4090 / 2x A6000.
- Inferencia en 8 bits: aproximadamente 27 GB de pesos; encaja en A100 40 GB, L40S 48 GB o RTX 6000 Ada 48 GB.
- Inferencia en 4 bits (por ejemplo GGUF Q4_K_M): aproximadamente 15-17 GB de pesos; cabe en RTX 4090 24 GB, RTX 5090 32 GB o Mac con memoria unificada de 32 GB o mas, con contexto limitado.
- GPU consumer: si, en configuraciones de 4 bits y con contexto moderado. En 24 GB no es viable en bf16 sin cuantizar.
- Opciones de despliegue: el adaptador es PEFT, por lo que puede servirse con vLLM (soporte de adaptadores LoRA), fusionarse con PEFT y convertirse a GGUF para llama.cpp u Ollama, o desplegarse con TGI. No hay configuraciones de despliegue publicadas por el autor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este adaptador, por lo que la comparativa se limita a caracteristicas verificables.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre Qwen/Qwen3.6-27B) | 27B en el base; adaptador no disponible | no disponible (entrenado a 8192) | no disponible | PEFT LoRA safetensors | 0 descargas, 0 likes |
| Qwen/Qwen3.6-27B (modelo base, sin adaptador) | 27B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | safetensors | referenciado en la model card |
| Otros adaptadores LoRA de la misma receta | no disponible | no disponible | no disponible | PEFT LoRA safetensors | no identificables con la informacion disponible |

No se han identificado alternativas comparables con datos verificables a partir de la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna evaluacion publicada de MMLU, HumanEval, GSM8K ni de tareas de tool calling, por lo que el rendimiento real es desconocido.
- Sin licencia declarada: no se puede determinar si el uso comercial esta permitido. Cualquier despliegue en produccion queda bloqueado hasta aclarar este punto con el autor y con la licencia del modelo base.
- Sin idiomas declarados: se desconoce el soporte multilingue real y la calidad en castellano.
- Artefacto de investigacion: 0 descargas, 0 likes, creado y actualizado con 17 segundos de diferencia y con nombres de mezcla que incluyen terminos como "canary" y "septbase", lo que apunta a un experimento interno o de ablacion mas que a un modelo destinado a uso general.
- Sin model card descriptiva: no se detalla la composicion del dataset, el numero de tokens de entrenamiento, los filtros de calidad aplicados ni el tratamiento de datos personales.
- Riesgo de alucinacion: no evaluado. Al ser un ajuste SFT de una sola epoca sobre una mezcla no documentada, no hay garantia de que el adaptador no degrade el comportamiento del modelo base.
- Sesgos: la model card indica explicitamente que la "constitution" se hereda de los datos de entrenamiento y no fue declarada; no es posible auditar que sesgos incorpora la mezcla.
- Limitacion de contexto: el entrenamiento se realizo con max_seq_len de 8192, por lo que el comportamiento mas alla de esa longitud no esta validado, independientemente del contexto nativo del modelo base.
- Dependencia del modelo base: el adaptador no es autonomo; requiere descargar Qwen/Qwen3.6-27B en la revision exacta indicada para reproducir el comportamiento.
- Verificacion pendiente: no se ha podido confirmar con fuentes externas la existencia ni las caracteristicas del modelo base Qwen/Qwen3.6-27B; la busqueda web realizada no devolvio resultados tecnicos relacionados con este repositorio.
- Trazabilidad del codigo: el entrenamiento apunta a un repositorio de GitHub externo (Lessons_from_constituitional_AFT) en una revision concreta; su disponibilidad futura no esta garantizada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dougalldeepmind/2026-10-09-qwen36-0-da-tools-15-canary-octda-septbase
- Dataset referenciado: hf.co/datasets/dougalldeepmind/2026-10-09-da-tools-15-canary-octda-septbase-mix (revision 4b24829a71271f4e7311fd6eff7fdfd1d29170a3)
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.6-27B (revision 6a9e13bd6fc8f0983b9b99948120bc37f49c13e9)
- Repositorio de codigo referenciado: https://github.com/Matthew-Bozoukov/Lessons_from_constituitional_AFT.git (revision 8088d349c766197b294095b7df0b19287072c32c)
- Papers, blogs o demos adicionales: no disponible. La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo.
