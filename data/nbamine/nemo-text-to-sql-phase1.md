# NBAmine/nemo-text-to-sql-phase1

## Resumen

NBAmine/nemo-text-to-sql-phase1 es un modelo afinado (fine-tune) del modelo base mistralai/Mistral-Nemo-Base-2407, publicado por el usuario NBAmine en HuggingFace. Por el nombre del repositorio y por el identificador de la ejecución de entrenamiento registrada en Weights & Biases ("phase1-syntax-anchoring"), se trata de la primera fase de un proyecto orientado a la traducción de lenguaje natural a SQL (text-to-SQL), centrada en lo que el autor denomina "anclaje sintáctico".

El modelo se ha entrenado mediante SFT (supervised fine-tuning) utilizando la librería TRL, según se indica en la model card. No se documentan en la información disponible ni el conjunto de datos empleado, ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo fases posteriores de alineación (RLHF/DPO). El repositorio tiene un tamaño de 0,2 GB, muy inferior al esperado para los pesos completos de un modelo de la familia Mistral-Nemo, lo que sugiere que podría tratarse de un adaptador, de una subida parcial o de pesos en un formato muy comprimido, aunque esto no está confirmado.

Su relevancia actual es limitada y experimental: registra 0 descargas y 0 likes en el momento de la consulta, no declara licencia ni idiomas soportados, y la model card no incluye resultados de evaluación. Debe considerarse, por tanto, un artefacto de investigación en fase temprana, no un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo derivado de mistralai/Mistral-Nemo-Base-2407, arquitectura transformer del modelo base) |
| Parametros totales | no disponible para este fine-tune; el modelo base Mistral-Nemo-Base-2407 tiene 12 000 millones de parametros |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible para este fine-tune; el modelo base soporta 128 000 tokens |
| Tipos de cuantizacion | no disponible (no se declaran cuantizaciones publicadas en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye un campo "licence: license" sin contenido util) |
| Formato de pesos | safetensors (segun las etiquetas del repositorio) |

Otros datos del repositorio: tamaño del repo 0,2 GB; creado el 2026-09-25; actualizado el 2026-09-25; 0 descargas; 0 likes; etiquetas `transformers`, `safetensors`, `generated_from_trainer`, `trl`, `sft`, `endpoints_compatible`, `region:us`.

Versiones de framework declaradas: TRL 1.13.0, Transformers 5.14.1, PyTorch 2.13.0, Datasets 5.0.1, Tokenizers 0.22.2.

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo base mistralai/Mistral-Nemo-Base-2407, un transformer decoder-only de 12 000 millones de parametros con soporte de contexto largo, entrenado originalmente por Mistral AI y NVIDIA. Sobre esa base, el autor ha aplicado un ajuste supervisado (SFT) usando TRL, tal como se declara en la model card y confirma la etiqueta `generated_from_trainer`. No se especifica si el ajuste cubre todos los pesos o solo un subconjunto (por ejemplo, LoRA/QLoRA), ni la configuración de hiperparámetros, tamaño de lote, tasa de aprendizaje o número de épocas.

La única referencia al proceso de entrenamiento es el enlace a una ejecución de Weights & Biases denominada `text-to-sql-mistral/runs/phase1-syntax-anchoring-9cc4545a`, lo que indica que la fase 1 se centró en el anclaje sintáctico, presumiblemente para forzar al modelo a producir SQL sintácticamente válido antes de optimizar otras dimensiones (corrección semántica, ejecución contra esquemas, etc.). No hay información sobre el dataset de instrucciones, el esquema de bases de datos utilizado, el número de tokens vistos, ni sobre técnicas adicionales como decodificación especulativa, atención lineal o mezclas de expertos.

## Capacidades

- Generación de texto: el ejemplo de uso rápido de la model card emplea `pipeline("text-generation")`, por lo que el modelo conserva la capacidad generativa general del base.
- Generación de SQL a partir de lenguaje natural (text-to-SQL): capacidad objetivo del fine-tune, según el nombre del modelo y la ejecución de entrenamiento asociada.
- Ajuste específico en sintaxis SQL: la fase documentada se denomina "syntax anchoring", orientada a la validez sintáctica de las consultas generadas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles; no se mencionan en la model card.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede desplegarse en Inference Endpoints de HuggingFace, aunque no se detalla la configuración.

## Casos de uso

- Generación asistida de consultas SQL en herramientas internas de analítica: el modelo recibiría la pregunta de un analista y el esquema de la base de datos, y devolvería una consulta SQL candidata que el analista revisaría antes de ejecutar. Es el caso de uso natural del fine-tune, aunque al no haber métricas publicadas la calidad real es desconocida.
- Prototipado de interfaces de consulta en lenguaje natural sobre bases de datos relacionales: útil en fases de investigación y demos internas donde se quiera evaluar el enfoque "syntax anchoring" frente a alternativas, siempre que se acepte que no hay garantías de precisión.
- Investigación académica sobre text-to-SQL: sirve como punto de comparación para estudiar si un ajuste centrado en sintaxis mejora la validez de las consultas frente a un ajuste mixto.
- Generación de borradores de DDL o consultas de exploración de esquema: el modelo puede producir sentencias de tipo `SELECT` exploratorio a partir de descripciones textuales de las tablas.
- Integración en pipelines de evaluación de modelos SQL: dado su pequeño tamaño de repositorio, puede usarse como baseline reproducible en experimentos de comparación de estrategias de fine-tuning sobre Mistral-Nemo.
- Formación y materiales docentes: puede emplearse para ilustrar cómo se comporta un modelo afinado con TRL/SFT frente a su modelo base en tareas estructuradas.

No se recomienda su uso en escenarios de producción con clientes, ejecución automática de SQL contra bases de datos reales ni en cualquier flujo donde un error en la consulta pueda tener consecuencias (borrado, modificación de datos o fuga de información), dada la ausencia total de evaluaciones publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas de ningún tipo (ni exact match de SQL, ni validez de ejecución, ni MMLU, HumanEval, GSM8K u otros). Tampoco se proporcionan comparaciones con el modelo base ni con alternativas de text-to-SQL.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del tamaño del modelo base (12 000 millones de parametros), no datos declarados por el autor. Si el repositorio contiene únicamente un adaptador de bajo rango (los 0,2 GB apuntan en esa dirección, sin confirmar), los requisitos serían los del modelo base más el coste del adaptador.

- VRAM estimada para inferencia, pesos completos:
  - FP16/BF16: aproximadamente 24 GB solo para pesos, más caché KV; en la práctica se recomiendan 32-40 GB.
  - Cuantización de 8 bits: aproximadamente 13 GB de pesos.
  - Cuantización de 4 bits (por ejemplo GGUF Q4_K_M): aproximadamente 7-8 GB.
- GPU recomendadas:
  - A100 40/80 GB, H100 80 GB o L40S 48 GB para FP16/BF16 con contexto largo y lotes moderados.
  - RTX 4090 / RTX 3090 (24 GB) para FP16 con contexto reducido o para 8 bits.
  - RTX 4080 / 4070 Ti (16 GB) y RTX 3060 (12 GB) para cuantizaciones de 4 bits.
- ¿Cabe en GPU de consumo? Sí, en cuantización de 4 bits cabe en GPUs de 12-16 GB, con contexto limitado. En FP16 no cabe en GPUs de consumo de 24 GB con contexto largo.
- Opciones de despliegue: Transformers (con bitsandbytes para cuantización), vLLM, TGI, llama.cpp, Ollama y LM Studio si se generan pesos GGUF, que no están publicados en el repositorio. La etiqueta `endpoints_compatible` sugiere compatibilidad con HuggingFace Inference Endpoints.
- Latencia y throughput: no disponibles. No se han publicado medidas de tokens por segundo ni de tiempo a primer token.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este fine-tune, por lo que la comparación se limita a características declaradas o conocidas del modelo base. Las filas de modelos comparables que no estén confirmadas en la información proporcionada se marcan como "no disponible".

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| NBAmine/nemo-text-to-sql-phase1 | no disponible (base de 12 000 M) | no disponible (base de 128 000 tokens) | no disponible | Repositorio publico, 0 descargas | Fine-tune SFT con TRL sobre Mistral-Nemo-Base-2407, orientado a text-to-SQL |
| mistralai/Mistral-Nemo-Base-2407 | 12 000 M | 128 000 tokens | Apache-2.0 (segun el modelo base) | Ampliamente disponible | Modelo base sin ajuste de instrucciones |
| mistralai/Mistral-Nemo-Instruct-2407 | 12 000 M | 128 000 tokens | Apache-2.0 (segun el modelo base) | Ampliamente disponible | Variante alineada para instrucciones; alternativa generalista si no se necesita SQL |
| Otros fine-tunes de text-to-SQL de tamano comparable | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, métricas de exactitud ni validación de ejecución de las consultas generadas.
- Licencia no declarada: la model card contiene un campo de licencia vacío ("licence: license"). No se puede asumir uso comercial libre, aunque el modelo base sea Apache-2.0. Es imprescindible aclarar la licencia con el autor antes de cualquier uso comercial.
- Idiomas no declarados: no se especifica si el ajuste se hizo sobre datos en inglés, español u otros idiomas, lo que impide anticipar su comportamiento multilingüe.
- Datos de entrenamiento desconocidos: no se documenta el dataset, su procedencia ni si contiene datos personales o con derechos de autor.
- Riesgo de alucinación: al ser un modelo generativo, puede producir tablas, columnas o cláusulas SQL inexistentes, especialmente ante esquemas que no haya visto durante el ajuste.
- Riesgo de SQL incorrecto o peligroso: sin validación sintáctica ni semántica, las consultas generadas podrían ser inválidas o, en el peor caso, destructivas si se ejecutan sin revisión humana.
- Tamaño de repositorio anómalo: 0,2 GB es muy inferior a lo esperado para un modelo de 12 000 millones de parametros en safetensors, lo que sugiere que el repositorio podría estar incompleto o contener únicamente un adaptador. Conviene verificar la lista de archivos antes de intentar cargarlo.
- Ejemplo de uso poco representativo: la model card incluye un ejemplo de `text-generation` con una pregunta filosófica, no con una consulta SQL, lo que no demuestra el comportamiento real del fine-tune.
- Metadatos de fechas inusuales: las fechas de creación y actualización indican 2026-09-25, lo que conviene contrastar con el estado real del repositorio.
- Madurez: 0 descargas y 0 likes; el modelo forma parte de una fase 1, lo que implica que probablemente existan fases posteriores que lo sustituyan.
- Producción: no apto para despliegue en producción sin una evaluación exhaustiva previa, validación de consultas en un entorno aislado y revisión humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NBAmine/nemo-text-to-sql-phase1
- Modelo base: https://huggingface.co/mistralai/Mistral-Nemo-Base-2407
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/amine-nabli-none/text-to-sql-mistral/runs/phase1-syntax-anchoring-9cc4545a
- Repositorio de TRL: https://github.com/huggingface/trl
