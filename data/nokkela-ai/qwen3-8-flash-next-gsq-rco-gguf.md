# nokkela-ai/Qwen3.8-Flash-Next-GSQ-RCO-GGUF

## Resumen

Qwen3.8-Flash-Next es un modelo de mezcla de expertos (MoE) dispersa de gran escala desarrollado por Qwen (Alibaba). El repositorio que nos ocupa, `nokkela-ai/Qwen3.8-Flash-Next-GSQ-RCO-GGUF`, no contiene el modelo original sino una familia de cuantizaciones GGUF no uniformes producidas con los metodos GSQ (Gumbel-Softmax Quantization) y RCO (Riemannian Constrained Optimization), ambos desarrollados en el Deep Algorithms and Systems Lab (DASLab) del Institute of Science and Technology Austria. El objetivo es comprimir un modelo de casi 177.000 millones de parametros a tamanos manejables sin degradar la calidad de forma significativa.

La arquitectura es un MoE con 512 expertos enrutados por capa a lo largo de 48 capas, de los cuales se activan 10 por token. La mayoria del peso parametrico reside en las matrices de expertos, lo que concentra tambien el esfuerzo de cuantizacion: el 95% de los pesos sujetos a busqueda pertenecen a los expertos. Ademas, el modelo incorpora un proyector de vision (`mmproj`) en BF16 que habilita el uso multimodal image-text-to-text.

La relevancia de esta publicacion radica en que demuestra que es posible asignar un tipo de cuantizacion distinto a cada tensor mediante busqueda basada en gradientes bajo una restriccion de tamano, obteniendo archivos GGUF estandar que funcionan sin modificaciones en llama.cpp, Ollama y LM Studio. Se ofrecen cuatro variantes entre 2,40 y 3,50 bits por peso, con tamanos totales de 66,4 a 83,6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) dispersa, transformer, multimodal (vision) |
| Parametros totales | 176.943.899.520 (~176,9 B); incluye tabla de embeddings n-gram por capa de 51,2 B |
| Parametros activos | 10 de 512 expertos enrutados por token, en 48 capas (numero exacto de parametros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF no uniforme por tensor: variantes Q2_0 (2,40 bpw), IQ2_XS (2,50 bpw), IQ3_XXS (3,00 bpw), IQ3_S (3,50 bpw); shard n-gram fijo en IQ4_NL (4,5 bpw); mmproj en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos shards por variante; `mmproj` separado en BF16) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE disperso con 48 capas y 512 expertos enrutados por capa, de los que 10 se activan por token. Una particularidad estructural destacable es la presencia de una tabla de embeddings n-gram por capa (`per_layer_token_embd`) de 51,2.000 millones de parametros, que funciona como tabla de consulta y no como matriz de multiplicacion. Esta tabla se mantiene fija a 4,5 bpw (IQ4_NL) en todas las variantes y queda excluida de la busqueda de cuantizacion, lo que explica que el segundo shard sea identico en las cuatro builds y represente 28,8 GB del total.

Sobre el proceso de cuantizacion: GSQ es un metodo de cuantizacion escalar post-entrenamiento que aprende conjuntamente las asignaciones de rejilla por coordenada y las escalas por grupo mediante una relajacion Gumbel-Softmax, cerrando buena parte de la brecha entre cuantizacion escalar y vectorial a 2-3 bits. RCO asigna uno de K tipos de cuantizacion a cada uno de N tensores bajo una restriccion de presupuesto total de tamano, reformulando la restriccion como una variedad riemanniana suave en el espacio de logits, lo que permite optimizar directamente sobre la perdida de la tarea con cumplimiento exacto del presupuesto y sin hiperparametros especificos de la restriccion. La busqueda asigna el tipo de cuantizacion por capa (no por experto, algo que GGUF no puede expresar). No se dispone de informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens ni si se aplicaron RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `conversational`).
- Procesamiento multimodal image-text-to-text mediante el proyector de vision incluido en BF16.
- Razonamiento y matematicas: la variante IQ3_XXS iguala al modelo base en AIME25 y la IQ3_S lo iguala o supera en todas las tareas evaluadas.
- Capacidades de codigo, con una variante especializada publicada por separado (GSQ-RCO-Coder) que retiene 256 de los 512 expertos por capa a 1,89 bpw efectivos.
- Compatibilidad con endpoints (`endpoints_compatible`) y despliegue en llama.cpp, Ollama y LM Studio.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Despliegue local de un MoE de gran escala en hardware de gama alta para consumo: la variante Q2_0 (66,4 GB) permite ejecutar un modelo de ~177 B en estaciones con suficiente VRAM o en configuraciones con offload parcial, algo inviable con los pesos originales en BF16.
- Inferencia de baja latencia en produccion: Q2_0 ofrece 3,4 veces el throughput de prompt y 1,9 veces menor latencia extremo a extremo que IQ2_XS con un tamano ligeramente inferior, y su tasa de decodificacion se mantiene plana entre cargas de trabajo, lo que lo hace adecuado para servicios interactivos.
- Asistentes multimodales sobre imagenes: el `mmproj` en BF16 (0,91 GB) habilita tareas de descripcion de imagenes, extraccion de informacion de documentos escaneados y respuesta a preguntas visuales, reutilizable con cualquiera de las cuatro cuantizaciones.
- Razonamiento matematico y resolucion de problemas: la variante IQ3_S iguala o supera al modelo base en todas las tareas evaluadas, por lo que es la recomendada cuando la calidad es prioritaria sobre el tamano.
- Generacion de codigo en pipelines de desarrollo: la variante Coder, con 256 expertos retenidos a 1,89 bpw y 58,4 GB, se orienta a tareas de programacion con menor huella de memoria.
- Investigacion sobre cuantizacion y evaluacion de metodos: el repositorio sirve como referencia reproducible de GSQ y RCO, con cuatro puntos de operacion (2,40 a 3,50 bpw) sobre el mismo modelo base para estudiar el compromiso entre tamano y calidad.
- Despliegue en entornos con almacenamiento limitado: IQ2_XS (68,0 GB) ofrece el menor tamano a igual calidad, util para distribuir el modelo en infraestructura con cuotas de disco ajustadas.

## Benchmarks y rendimiento

La model card referencia una grafica de promedio de tareas frente a ancho de bits (`task_avg_vs_avg_bit_width.png`) y menciona resultados cualitativos en AIME25, pero no publica una tabla con valores numericos de benchmarks. Por tanto:

No se han publicado resultados de benchmarks numericos en la informacion disponible. Los unicos datos cuantitativos de rendimiento son los de throughput y latencia relativos: Q2_0 alcanza 3,4 veces el throughput de prompt y 1,9 veces menor latencia extremo a extremo que IQ2_XS.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos el tamano del archivo mas el overhead de contexto y cache KV. Orientativamente, Q2_0 requiere ~66,4 GB, IQ2_XS ~68,0 GB, IQ3_XXS ~75,8 GB e IQ3_S ~83,6 GB solo para pesos; el `mmproj` anade 0,91 GB.
- GPU recomendadas: no disponibles de forma explicita. Por volumen de memoria, las variantes requieren GPUs de 80 GB (A100 80GB, H100 80GB) o configuraciones multi-GPU; IQ3_S (83,6 GB) excede una unica GPU de 80 GB y necesita reparto entre dos dispositivos o offload a CPU.
- Cabe en GPU de consumo: no para las variantes completas. Las GPUs de consumo (RTX 4090 con 24 GB, por ejemplo) no pueden alojar ninguno de los archivos completos; seria necesario offload parcial a RAM o disco, con la penalizacion de latencia correspondiente.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio (archivos GGUF estandar, sin modificaciones). Otros runners compatibles con GGUF no se mencionan en la informacion disponible.
- Latencia y throughput: solo se conocen las comparaciones relativas entre variantes (Q2_0 frente a IQ2_XS). No hay cifras absolutas de tokens por segundo ni de latencia en milisegundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | ~176,9 B (MoE, 10/512 activos) | no disponible | safetensors (BF16) | Apache 2.0 | Hugging Face (Qwen) |
| Qwen3.8-Flash-Next GSQ-RCO (este repo) | ~176,9 B (MoE) | no disponible | GGUF no uniforme, 2,40-3,50 bpw | Apache 2.0 | Hugging Face (nokkela-ai) |
| Qwen3.8-Flash-Next GSQ-RCO-Coder | 256 de 512 expertos retenidos, 1,89 bpw efectivos | no disponible | GGUF, 58,4 GB | Apache 2.0 | Hugging Face (ISTA-DASLab) |
| Qwen3.8-27B | 27 B (no confirmado) | no disponible | no disponible | no disponible | Hugging Face (referenciado en la model card) |

No se dispone de datos de benchmarks que permitan comparar el rendimiento numerico con alternativas de la misma categoria. La comparativa se limita a parametros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- La cuantizacion introduce perdida de calidad respecto al modelo base; el grado exacto por tarea no se cuantifica en la informacion disponible, salvo la afirmacion de que IQ3_S iguala o supera al base en todas las tareas evaluadas.
- La asignacion de cuantizacion se hace por capa y no por experto, limitacion impuesta por el formato GGUF, lo que restringe la granularidad de la busqueda.
- El shard de embeddings n-gram (28,8 GB) es identico en todas las variantes y no se optimiza; representa una fraccion fija e importante del tamano total.
- Riesgo de alucinacion: no documentado en la informacion disponible, pero aplicable a cualquier modelo generativo de este tipo.
- Sesgos conocidos: no documentados en la informacion disponible.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingue.
- Longitud de contexto: no disponible, lo que impide planificar casos de uso con ventanas largas.
- Licencia Apache 2.0 en el repositorio de cuantizacion; debe verificarse que la licencia del modelo base Qwen3.8-Flash-Next sea compatible para uso comercial, ya que la model card no detalla condiciones adicionales.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria.
- El autor del repositorio (`nokkela-ai`) no coincide con el laboratorio que desarrollo los metodos (`IST-DASLab`), que publica sus propias builds; conviene contrastar la procedencia de los archivos.
- El rendimiento de decodificacion depende fuertemente del formato de cuantizacion: los formatos con tablas de consulta grandes penalizan la velocidad en este modelo, de ahi la existencia de la variante Q2_0 orientada a throughput.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nokkela-ai/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante Coder: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF
- Paper GSQ (arXiv:2604.18556): https://arxiv.org/abs/2604.18556
- Paper RCO (arXiv:2605.00649): https://arxiv.org/abs/2605.00649
- Codigo GSQ: https://github.com/IST-DASLab/GSQ
- Codigo RCO: https://github.com/IST-DASLab/RCO
- Organizacion DASLab: https://github.com/IST-DASLab
