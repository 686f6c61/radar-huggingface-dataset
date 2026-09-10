# fpadovani/ppt-nld_heavy_zipf-100mb_seed10

## Resumen

El modelo `fpadovani/ppt-nld_heavy_zipf-100mb_seed10` es un ajuste fino (fine-tuning) supervisado del modelo base `goldfish-models/nld_latn_100mb`, un transformer decoder-only de tipo GPT-2 orientado al neerlandés escrito en alfabeto latino. Lo desarrolla el usuario fpadovani, y la ejecución de entrenamiento está registrada en un proyecto de Weights & Biases bajo la entidad "f-padovani-university-of-groningen", lo que apunta a un contexto académico de investigación más que a un modelo de producción.

El modelo resuelve el caso de uso acotado de la generación de texto conversacional mediante instrucciones (SFT) sobre una base pequeña entrenada con un corpus de 100 MB. Con 86.708.736 parámetros totales y un repositorio de 1,4 GB, es un modelo de escala muy reducida que se puede ejecutar en CPU o en cualquier GPU de consumo. Su relevancia es fundamentalmente experimental: permite estudiar cómo afectan las decisiones de datos (el nombre sugiere esquemas de muestreo con distribución Zipf y variaciones de semilla) al comportamiento final tras un ajuste SFT con TRL.

La información publicada es mínima: la model card se limita a la plantilla automática generada por TRL, sin licencia declarada, sin idiomas declarados, sin resultados de benchmarks y sin detalle del dataset de ajuste. El modelo registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que debe considerarse un artefacto de investigación sin validación externa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (etiqueta `gpt2` en HuggingFace) |
| Parametros totales | 86.708.736 (dato real de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion facilitada |
| Tipos de cuantizacion | No disponible; no se publican pesos GGUF ni cuantizados |
| Idiomas soportados | No declarados por el autor; el modelo base apunta a neerlandes (`nld_latn`) |
| Licencia | No disponible (la model card solo contiene el campo generico `licence: license`) |
| Formato de pesos | safetensors (libreria `transformers`) |
| Modelo base | goldfish-models/nld_latn_100mb |
| Metodo de ajuste | SFT (supervised fine-tuning) con TRL 0.23.0 |
| Tamano del repositorio | 1,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only con atención causal, en la linea de GPT-2, con normalizacion pre-LayerNorm y tokenizador propio del proyecto Goldfish (adaptado al idioma del corpus). El corpus de preentrenamiento del modelo base pertenece a la colección Goldfish, que entrena modelos monoculturales de aproximadamente 100 MB de texto por variante idioma-escritura; en este caso, neerlandés en escritura latina. No se detalla en la informacion disponible el numero exacto de tokens ni la composicion del dataset de preentrenamiento.

El ajuste se realizo exclusivamente mediante SFT con la libreria TRL (version 0.23.0), sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. No se documenta el uso de RLHF, DPO u otras tecnicas de alineacion posteriores, ni el volumen o la naturaleza de las instrucciones empleadas en el SFT. La nomenclatura del identificador ("ppt", "heavy_zipf", "100mb", "seed10") sugiere un barrido experimental sobre ordenacion o muestreo de datos de entrenamiento (posiblemente siguiendo una distribucion Zipf) con una semilla fija, pero no hay documentacion publicada que lo confirme. Se puede consultar el registro de entrenamiento en el enlace de Weights & Biases incluido en la model card.

## Capacidades

- Generacion de texto autoregresiva en el idioma del modelo base (neerlandes), condicionada por una instruccion en formato de chat.
- Formato conversacional de un solo turno: el ejemplo de la model card pasa una lista de mensajes con rol `user` al pipeline de `text-generation`.
- Ajuste a instrucciones (instruction following) basico, derivado del entrenamiento SFT.
- Generacion con parametros de decodificacion configurables (`max_new_tokens`, `return_full_text`).
- Capacidad multilingue: no documentada; cabe esperar un comportamiento limitado fuera del neerlandes por el tamano del corpus del modelo base.
- Tool calling / function calling: no documentado.
- Soporte de agentes o razonamiento multi-paso: no documentado.
- Capacidades especiales (modo pensamiento, vision, audio): no disponibles.

## Casos de uso

- Investigacion sobre ordenacion y seleccion de datos: el modelo sirve como punto de comparacion dentro de un barrido de experimentos (variantes "zipf", distintas semillas) para medir el efecto del orden o la distribucion del corpus de ajuste sobre la calidad final.
- Reproducibilidad de experimentos de ajuste SFT: al estar entrenado con versiones concretas de TRL, Transformers y PyTorch, permite reproducir pipelines de entrenamiento y verificar diferencias entre configuraciones.
- Generacion de texto en neerlandes para prototipos: con 86,7 M de parametros se puede desplegar en local para generar borradores o completar frases cortas en neerlandes sin coste de API, siempre que se valide la calidad de salida.
- Estudio de olvido catastrofico: comparar este modelo con su base `goldfish-models/nld_latn_100mb` permite medir cuanto conocimiento del preentrenamiento se degrada tras el SFT sobre un modelo de esta escala.
- Docencia y practicas de ajuste fino: es un caso manejable para ensenar el flujo completo de TRL (carga del modelo base, formateo de datos conversacionales, entrenamiento SFT, publicacion en el Hub) en recursos de laboratorio modestos.
- Pruebas de infraestructura de inferencia: util para validar pipelines de `transformers`, Text Generation Inference o despliegues ligeros en CPU antes de escalar a modelos mayores, dado su tamano reducido.
- Generacion de pequenos volumenes de texto sintetico en neerlandes para experimentos internos, con revision humana obligatoria por el riesgo de salidas incoherentes a esta escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (perplejidad, MMLU, HumanEval, GSM8K ni ninguna otra) y no se ha encontrado informacion adicional en la busqueda web.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 350 MB solo para los pesos, mas activaciones y cache KV.
- VRAM estimada en fp16/bf16: aproximadamente 175 MB para los pesos.
- VRAM estimada en int8: aproximadamente 90 MB; en int4, aproximadamente 45 MB (requiere conversion propia, no hay pesos cuantizados publicados).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; sobra en RTX 3060, RTX 4090, A100 o H100. El modelo esta muy por debajo de la capacidad de estas tarjetas y se desaprovecharia en ellas.
- GPU de consumo: si, cabe en cualquier GPU de consumo moderna e incluso en integradas con suficiente memoria compartida; es viable en CPU y en placas tipo Raspberry Pi.
- Opciones de despliegue: pipeline de `transformers` (probado en la model card), Text Generation Inference (el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM (compatible en principio por arquitectura GPT-2), y llama.cpp/Ollama solo tras convertir los pesos a GGUF, conversion que no se distribuye.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| fpadovani/ppt-nld_heavy_zipf-100mb_seed10 | 86,7 M | No disponible | No declarados (base neerlandes) | No disponible | HuggingFace, 0 descargas | Sin benchmarks publicados |
| goldfish-models/nld_latn_100mb (modelo base) | No disponible (mismo orden de magnitud) | No disponible | Neerlandes (nld_latn) | No disponible | HuggingFace | Sin datos en la informacion disponible |
| GPT-2 small (referencia de arquitectura) | 124 M | 1024 tokens | Ingles | MIT | Ampliamente disponible | Benchmark historico conocido |
| GroNLP/gpt2-small-dutch (alternativa de la misma categoria) | ~124 M (no confirmado en la informacion disponible) | No disponible | Neerlandes | No disponible | HuggingFace | No disponible |

La comparacion cuantitativa de rendimiento no es posible con los datos disponibles: el modelo evaluado no publica metricas y su licencia no esta declarada, lo que lo situa en desventaja frente a alternativas con licencia explicita para cualquier uso en produccion.

## Limitaciones y advertencias

- Licencia no declarada: no hay autorizacion explicita de uso comercial ni condiciones claras de redistribucion. Tratarlo como no apto para produccion hasta aclarar la licencia.
- Sin validacion externa: 0 descargas y 0 "likes"; no hay evaluaciones independientes ni informes de terceros.
- Riesgo alto de alucinacion y de texto incoherente: 86,7 M de parametros y un corpus base de solo 100 MB limitan severamente la coherencia en generaciones largas.
- Sesgos desconocidos: no se documenta la composicion del corpus de preentrenamiento ni del dataset de SFT, por lo que no se pueden auditar sesgos de genero, etnia, religion o ideologia.
- Cobertura idiomatica limitada: no se declaran idiomas soportados; el comportamiento fuera del neerlandes sera probablemente pobre o directamente inutilizable.
- Longitud de contexto desconocida: no se especifica la ventana del modelo, lo que impide garantizar el manejo de conversaciones multi-turno largas.
- Model card minima: se trata de la plantilla autogenerada por TRL, sin informacion sobre datos de entrenamiento, hiperparametros ni criterios de evaluacion.
- Artefacto de investigacion: la nomenclatura y el contexto de Weights & Biases apuntan a un experimento academico, no a un modelo mantenido o soportado.
- Fecha de creacion inusual en los metadatos (2026-09-10): conviene verificar la integridad y el origen del repositorio antes de reutilizarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/ppt-nld_heavy_zipf-100mb_seed10
- Modelo base: https://huggingface.co/goldfish-models/nld_latn_100mb
- Registro del entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/p46jq75p
- Repositorio de TRL: https://github.com/huggingface/trl
- Paper de TRL (cita incluida en la model card): von Werra et al., "TRL: Transformer Reinforcement Learning", 2020.
- Busqueda web: no se han encontrado enlaces relevantes al modelo, al proyecto Goldfish ni a publicaciones asociadas; los resultados devueltos no guardan relacion con el modelo.
