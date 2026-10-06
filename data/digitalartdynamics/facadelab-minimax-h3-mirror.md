# digitalartdynamics/facadelab-minimax-h3-mirror

## Resumen

digitalartdynamics/facadelab-minimax-h3-mirror es un repositorio espejo sin modificaciones de dos ficheros de la comunidad asociados a MiniMax H3: una cuantizacion GGUF de una version podada del modelo y un LoRA turbo en formato safetensors. El autor del repositorio no ha alterado ninguno de los dos artefactos: cada fichero es identico byte a byte al original y la integridad se verifica con sumas sha256 publicadas en la propia model card.

No se trata, por tanto, de un modelo entrenado ni publicado por el autor, sino de un punto de distribucion. El fichero principal, `MiniMax-H3-FL2VA-Pruned-Q4_K_M.gguf`, ocupa 11.564.180.576 bytes y procede de Abiray/MiniMax-H3-Pruned-GGUF (revision `76061e7fe4866dbc68903bfdf852430f0f1b2487`). El segundo, `minimax_h3_turbo_v4_step600_ema_pruned_comfyui.safetensors`, de 620.285.592 bytes, es un LoRA turbo de drbaph orientado a ComfyUI, procedente de drbaph/MiniMax-H3-Turbo-Lora-ComfyUI (revision `bb2bc497cbaca89dadd0bcf1856eed4f8275be20`).

Su relevancia es operativa: agrupa en una sola descarga los dos artefactos que un flujo de trabajo local suele necesitar y hace constar de forma explicita la licencia aplicable (MiniMax H3 Community License Agreement) junto con el fichero NOTICE que esa licencia exige en cada redistribucion. El repositorio no declara pipeline, idiomas soportados, arquitectura ni resultados de evaluacion, por lo que cualquier valoracion funcional debe remitirse a los repositorios originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (ni el repositorio espejo ni los ficheros alojados incluyen ficha de arquitectura) |
| Parametros totales | 20.111.438.744 (dato de los metadatos de safetensors del repositorio; coherente con el tamano del GGUF Q4_K_M de 11,56 GB, que implica unos 4,6 bits por parametro) |
| Parametros activos | no disponible (no se indica que MiniMax H3 sea un modelo de mezcla de expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico fichero GGUF incluido); el LoRA se distribuye en safetensors sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (aplica al GGUF y, como derivado, al LoRA); el LoRA se declara ademas bajo Apache 2.0 en la model card de su autor original |
| Formato de pesos | GGUF (Q4_K_M) y safetensors |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna de MiniMax H3. Lo unico verificable es el proceso aplicado a los artefactos: el fichero GGUF corresponde a una variante "pruned" (podada) de MiniMax H3, posteriormente cuantizada a Q4_K_M por Abiray, lo que implica una reduccion de parametros respecto al modelo original y una perdida de precision adicional por la cuantizacion de 4 bits. El segundo artefacto es un LoRA turbo (v4, checkpoint 600 con pesos EMA, tambien podado) destinado a ComfyUI, lo que sugiere un ajuste de destilacion orientado a reducir el numero de pasos de inferencia, aunque este extremo no se documenta en el repositorio espejo.

No hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO ni innovaciones tecnicas del modelo base. El nombre del fichero GGUF incorpora la cadena "FL2VA", y el LoRA esta etiquetado como material para ComfyUI; ambos indicios apuntan a un modelo de generacion multimodal con soporte de audio y video, pero se trata de una inferencia a partir de nomenclatura y no de un dato confirmado en la informacion proporcionada.

## Capacidades

El repositorio espejo no declara capacidades funcionales. Las siguientes afirmaciones son deducciones a partir de los nombres de fichero y de los repositorios de origen, y no estan verificadas:

- Generacion condicionada por fotogramas inicial y final (interpretacion de la cadena "FL2VA" del nombre del GGUF), no confirmada.
- Salida con componente de audio ademas de video, segun la misma nomenclatura, no confirmada.
- Aceleracion de la inferencia mediante un LoRA turbo con pesos EMA en el paso 600, orientado a reducir el numero de pasos necesarios.
- Integracion con ComfyUI a traves del LoRA `comfyui.safetensors`, que presupone flujos de nodos en esa herramienta.
- Ejecucion local en CPU o GPU mediante llama.cpp u otros motores compatibles con GGUF, por el formato del fichero principal.
- Soporte de tool calling, function calling, razonamiento multi-paso, capacidades multilingues y modo de pensamiento: no disponible.

## Casos de uso

- Despliegue local de un flujo de generacion con el GGUF en llama.cpp: el fichero Q4_K_M de 11,56 GB se puede cargar en una GPU de 16 GB o superior, lo que permite trabajar sin conexion y sin dependencia de APIs externas.
- Uso del LoRA turbo dentro de ComfyUI: aplicar `minimax_h3_turbo_v4_step600_ema_pruned_comfyui.safetensors` sobre una base compatible para reducir el numero de pasos de muestreo en un grafo de nodos ya existente.
- Verificacion de integridad en una canalizacion de descarga corporativa: las sumas sha256 publicadas permiten validar automaticamente que los ficheros descargados coinciden con los originales antes de incorporarlos a un registro interno de artefactos.
- Auditoria de licencias en una organizacion: el repositorio incluye el texto integro de la MiniMax H3 Community License y el fichero NOTICE, lo que facilita revisar las clausulas de territorio y uso aceptable antes de un despliegue en produccion.
- Redistribucion interna en entornos aislados (air-gapped): al ser un espejo con ficheros identicos byte a byte, sirve como origen unico para replicar los artefactos detras de un cortafuegos, conservando la trazabilidad de la revision de origen.
- Comparacion de calidad entre el modelo podado y cuantizado y la version sin podar: el sha256 y las revisiones fijadas permiten reproducir exactamente la misma configuracion en pruebas A/B de fidelidad de salida.
- Flujos de generacion de video o audio en produccion de contenido: si se confirma la capacidad multimodal sugerida por la nomenclatura, el GGUF de 4 bits y el LoRA turbo serian adecuados para prototipado rapido en una sola GPU, aunque la calidad final deberia validarse contra el modelo sin cuantizar.
- Evaluacion previa a adopcion: dado que el repositorio no publica benchmarks ni ficha de idiomas, resulta util como punto de partida para ejecutar una bateria propia de pruebas antes de comprometerse con el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio espejo no incluye tablas de evaluacion, metricas de calidad, comparaciones con otros modelos ni datos de latencia o throughput.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamano del fichero GGUF (11.564.180.576 bytes) y de la practica habitual en despliegues de modelos de este tamano; no proceden de la informacion proporcionada.

- Peso del fichero GGUF Q4_K_M: 11,56 GB. La VRAM necesaria para inferencia sera superior, ya que hay que anadir cache de contexto y activaciones.
- Estimacion orientativa de VRAM: en torno a 13-16 GB para contexto corto o moderado, y mas de 16 GB si se trabaja con ventanas de contexto largas o lotes grandes.
- GPU de consumo capaces de alojarlo: RTX 4090 (24 GB) y RTX 3090 (24 GB) con margen; RTX 4080 (16 GB) de forma ajustada y probablemente limitada en contexto. En tarjetas de 12 GB o menos no cabria sin recurrir a offload a RAM, lo que degradaria notablemente la latencia.
- GPU profesionales recomendadas para produccion o concurrencia: A100 (40/80 GB) y H100 (80 GB), que permiten varias instancias o contextos amplios por dispositivo.
- Opciones de despliegue: llama.cpp, Ollama y otros motores compatibles con GGUF para el fichero cuantizado; ComfyUI para el LoRA turbo. vLLM y TGI no son aplicables directamente a este repositorio, ya que no se distribuyen pesos en formato safetensors completos del modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No es posible establecer una comparativa fiable con modelos alternativos a partir de la informacion proporcionada: no se declara la tarea concreta de MiniMax H3, ni su tamano respecto a otros sistemas de su categoria, ni metricas de rendimiento, ni contexto, ni idiomas. Las alternativas de la misma categoria quedan, por tanto, como no disponibles.

A modo de aclaracion interna del repositorio, los dos artefactos que contiene cumplen funciones distintas y no son intercambiables:

| Artefacto | Formato | Tamano | Funcion |
|---|---|---|---|
| `MiniMax-H3-FL2VA-Pruned-Q4_K_M.gguf` | GGUF Q4_K_M | 11.564.180.576 bytes | Pesos del modelo podado y cuantizado; es el artefacto de inferencia |
| `minimax_h3_turbo_v4_step600_ema_pruned_comfyui.safetensors` | safetensors | 620.285.592 bytes | LoRA turbo para ComfyUI; requiere una base compatible |

## Limitaciones y advertencias

- El repositorio no es la fuente oficial de MiniMax H3: es un espejo mantenido por un tercero (digitalartdynamics) para el descargador de FacadeLab. La trazabilidad depende de que las sumas sha256 publicadas se verifiquen manualmente.
- Estado de adopcion nulo en el momento de la consulta: 0 descargas y 0 "likes", lo que implica ausencia de validacion por parte de la comunidad.
- MiniMax H3 no esta documentado en este repositorio: no hay ficha de arquitectura, contexto, idiomas ni pipeline, por lo que no se puede evaluar su idoneidad sin acudir a las fuentes originales.
- Ausencia total de benchmarks publicos en la informacion disponible: cualquier afirmacion de rendimiento seria especulativa.
- El fichero GGUF combina poda y cuantizacion a 4 bits. Ambas tecnicas degradan la fidelidad de salida respecto al modelo original; los resultados deben validarse antes de usarlo en produccion.
- El LoRA turbo esta etiquetado como material para ComfyUI y requiere una base compatible con MiniMax H3; no funciona de forma autonoma.
- La licencia aplicable es la MiniMax H3 Community License Agreement, con clausulas especificas de territorio y de uso aceptable. Es imprescindible leer el texto integro antes de cualquier uso comercial, ya que se trata de una licencia "other" y no de una licencia de codigo abierto estandar.
- El LoRA se declara bajo Apache 2.0 en la model card de su autor original, pero el repositorio de origen no incluye fichero de licencia en la revision citada; la convivencia de ambas licencias sobre un mismo derivado es un punto que conviene aclarar con los autores.
- La redistribucion exige conservar el fichero NOTICE tal como lo exige la licencia.
- Riesgo de sesgos, alucinacion y comportamiento en idiomas distintos del ingles: no disponible, al no existir evaluacion publicada.
- La cifra de 20.111.438.744 parametros procede de los metadatos de safetensors del repositorio, mientras que el fichero safetensors alojado es un LoRA de 620 MB. Conviene tratar esa cifra como referencia del modelo base y no del LoRA.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/digitalartdynamics/facadelab-minimax-h3-mirror
- Texto de la licencia MiniMax H3 Community: https://huggingface.co/digitalartdynamics/facadelab-minimax-h3-mirror/blob/main/MINIMAX_H3_LICENSE.txt
- Repositorio de origen del GGUF (Abiray): https://huggingface.co/Abiray/MiniMax-H3-Pruned-GGUF
- Repositorio de origen del LoRA turbo (drbaph): https://huggingface.co/drbaph/MiniMax-H3-Turbo-Lora-ComfyUI
- Papers, blogs, repositorios de codigo y demos adicionales: no disponible en la informacion proporcionada.
