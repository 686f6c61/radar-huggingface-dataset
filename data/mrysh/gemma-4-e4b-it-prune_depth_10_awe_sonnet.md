# mrysh/gemma-4-e4b-it-prune_depth_10_awe_sonnet

## Resumen

`mrysh/gemma-4-e4b-it-prune_depth_10_awe_sonnet` es una versión podada por profundidad del modelo multimodal `google/gemma-4-E4B-it`, publicada por el usuario mrysh como parte de un benchmark de poda que compara cuatro modelos base con ocho variantes de pruning frente a alternativas cuantizadas. El modelo conserva intactos los bloques de visión y audio del original y elimina únicamente capas del componente lingüístico, reduciendo su tamaño en disco hasta los 14,649 GB y dejando 7.308.233.030 parámetros totales según los pesos en safetensors.

La poda se realizó con NVIDIA ModelOpt 0.46.0rc1 mediante la técnica Minitron de profundidad: se pasó de 42 a 38 capas (un 10,0 % de las capas solicitadas), manteniendo la anchura sin cambios y midiendo la importancia de cada capa sobre un conjunto de calibración de 512 muestras mixtas. La reducción efectiva del modelo de lenguaje es del 9,2 % de sus parámetros, equivalente al 8,6 % del checkpoint completo.

El interés de esta ficha es acotado y muy específico: no se trata de un modelo para producción, sino de un artefacto de evaluación que mide la degradación de calidad que introduce la poda por profundidad sin destilación ni ajuste fino posterior. El autor lo plantea explícitamente como material de comparación sobre BFCL, sesgo de contratación y MedQA, ejecutado con vLLM y con el modo thinking desactivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (lenguaje + visión + audio), podado por profundidad |
| Parametros totales | 7.308.233.030 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card (el benchmark compara contra variantes cuantizadas del base) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E4B-it`, un transformer multimodal que incluye bloques de visión y audio además del componente lingüístico. La intervención aplicada es exclusivamente de profundidad: se eliminaron 4 de las 42 capas del modelo de lenguaje, seleccionadas por su baja importancia medida sobre 512 muestras mixtas de calibración, mientras que la anchura de las capas restantes y los módulos de visión y audio permanecen sin modificar. La herramienta empleada es NVIDIA ModelOpt 0.46.0rc1 con la receta Minitron de depth pruning, configurada en nivel 0.1.

No se aplicó destilación ni ajuste fino después de la poda, de modo que el checkpoint conserva los pesos originales de las capas supervivientes sin reentrenamiento compensatorio. El autor advierte que esto implica una caída de calidad frente al modelo base, y el propio benchmark está diseñado para cuantificar esa degradación. La model card menciona además que la herramienta de poda descarta la cabeza de predicción multi-token de Qwen3.5, un detalle heredado del pipeline utilizado.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del modelo base Gemma 4 E4B instruct.
- Procesamiento multimodal de imagen y audio, ya que los bloques correspondientes se mantienen intactos tras la poda.
- Evaluación en modo texto con vLLM y thinking desactivado, según la configuración del benchmark del autor.
- Soporte de tool calling y function calling: el modelo se evalúa sobre BFCL (Berkeley Function Calling Leaderboard), lo que implica capacidad de invocación de funciones.
- Razonamiento multi-paso en dominios médicos, evaluado mediante MedQA.
- Capacidades multilingües: no disponible (la model card no detalla idiomas).

## Casos de uso

- Benchmark de técnicas de poda: el modelo sirve como punto de comparación dentro de un estudio que enfrenta ocho variantes de pruning (profundidad, anchura, etc.) contra cuantización, midiendo la caída de calidad en BFCL, sesgo de contratación y MedQA con vLLM.
- Investigación sobre degradación por eliminación de capas: permite analizar cómo afecta la supresión del 10 % de las capas a tareas de function calling y razonamiento clínico, sin la variable adicional de un reentrenamiento.
- Estudio de sesgos en modelos comprimidos: el benchmark incluye una prueba de sesgo de contratación (hiring-bias) que permite comparar si la poda por profundidad amplifica o atenúa sesgos respecto al base.
- Validación de pipelines de ModelOpt: sirve como caso de referencia para verificar que la receta Minitron de depth pruning produce checkpoints cargables en vLLM con la reducción esperada de parámetros.
- Comparación de eficiencia en inferencia: al reducir un 9,2 % los parámetros del modelo de lenguaje, es útil para medir el ahorro real de memoria y latencia frente al coste en calidad.
- Evaluación de robustez multimodal tras compresión: dado que visión y audio no se tocan, permite aislar el efecto de la poda lingüística en tareas que combinan texto con otras modalidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe las tareas evaluadas (BFCL, hiring-bias y MedQA con vLLM) pero no incluye cifras de resultados en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 14,6 GB solo para pesos, más overhead de KV cache y activaciones; en la práctica se recomienda un mínimo de 24 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: en torno a 7,3 GB para pesos, viable en GPUs consumer de 12 GB con margen limitado.
- VRAM estimada en cuantización de 4 bits: alrededor de 3,7 GB para pesos, cabe en GPUs consumer de 8 GB o superiores.
- GPU recomendadas: A100 40/80 GB o H100 para evaluación con vLLM en BF16 y lotes grandes; RTX 4090 (24 GB) para inferencia en BF16 con contexto corto; RTX 3090, 4080 o 4070 Ti para cuantización de 8 bits.
- Despliegue: el autor evalúa con vLLM; al ser pesos safetensors de un transformer estándar, es compatible con TGI y con llama.cpp/Ollama previa conversión a GGUF (no verificada en la información disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| mrysh/gemma-4-e4b-it-prune_depth_10_awe_sonnet | 7.308.233.030 | no disponible | Apache 2.0 | Podado, sin fine-tuning |
| google/gemma-4-E4B-it (base) | no disponible en la información (42 capas, anchura sin cambios) | no disponible | Apache 2.0 | Modelo original instruct |
| Variantes cuantizadas del base (referencia del benchmark) | mismas que el base | no disponible | Apache 2.0 | Cuantización, sin poda estructural |
| Otras variantes de poda del benchmark (7 adicionales) | no disponible | no disponible | Apache 2.0 | Podadas con distintas recetas |

La comparación relevante es interna al benchmark: este checkpoint representa la variante de poda por profundidad al 10 % frente al base sin tocar y frente a las alternativas cuantizadas, que conservan todos los parámetros pero con menor precisión numérica.

## Limitaciones y advertencias

- Caída de calidad esperada: no hubo destilación ni ajuste fino tras la poda, por lo que el rendimiento en tareas complejas será inferior al del modelo base.
- Artefacto de benchmark, no de producción: el autor lo publica para medir la degradación, no como modelo listo para despliegue.
- Sesgos: el propio benchmark evalúa sesgo de contratación, lo que sugiere que el modelo puede presentar sesgos heredados del base y potencialmente alterados por la poda; no se documentan resultados.
- Alucinación: sin datos específicos; al ser un modelo podado sin reentrenamiento, el riesgo no debería ser inferior al del base.
- Idiomas: la model card no especifica cobertura lingüística, lo que impide garantizar un comportamiento multilingüe fiable.
- Contexto: no se documenta la longitud de contexto soportada tras la poda.
- Licencia: Apache 2.0 permite uso comercial, pero se remite a la model card del base para condiciones adicionales; conviene revisar los términos de Gemma 4 antes de explotarlo.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni validación comunitaria.
- Configuración de evaluación concreta: los resultados del benchmark se obtuvieron con thinking desactivado y en modo texto, por lo que no cubren el rendimiento multimodal real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrysh/gemma-4-e4b-it-prune_depth_10_awe_sonnet
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- NVIDIA ModelOpt (herramienta de poda): no disponible en la información proporcionada
- Paper de Minitron (receta de poda): no disponible en la información proporcionada
- BFCL (Berkeley Function Calling Leaderboard): no disponible en la información proporcionada
- Repositorio o demo del benchmark: no disponible en la información proporcionada
