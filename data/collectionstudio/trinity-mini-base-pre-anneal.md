# CollectionStudio/Trinity-Mini-Base-Pre-Anneal

## Resumen

Trinity-Mini-Base-Pre-Anneal es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Arcee AI, publicado en Hugging Face a través del repositorio `CollectionStudio/Trinity-Mini-Base-Pre-Anneal`. Forma parte de la familia Trinity, una serie de pesos abiertos orientada a entornos empresariales y a usuarios que deseen ajustar el modelo a dominios específicos. Este checkpoint en concreto es un punto intermedio del preentrenamiento, capturado antes de iniciar la fase de anneal (decaimiento de la tasa de aprendizaje), por lo que el propio autor advierte que no es apto para chat ni uso general sin un ajuste fino posterior.

La arquitectura es un MoE con 26.123.974.400 parámetros totales (26B) y solo 3.000 millones de parámetros activos por token, organizado en 128 expertos de los que se activan 8 más un experto compartido. El modelo se entrenó sobre 8,8 billones de tokens en una mezcla curada en colaboración con Datology, sobre la base del dataset usado en AFM-4.5B, con refuerzo adicional en matemáticas y código. La longitud de contexto declarada es de 4.000 tokens, muy inferior a la de los modelos actuales, lo que condiciona su uso a tareas de contexto corto o a un ajuste fino para extender dicha ventana.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AfmoeForCausalLM (MoE) |
| Parametros totales | 26.123.974.400 |
| Parametros activos | 3.000.000.000 (3B) |
| Longitud de contexto | 4K |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, es, fr, de, it, pt, ru, ar, hi, ko, zh |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura `AfmoeForCausalLM`, una variante MoE basada en Transformer. Está compuesto por 128 expertos, de los que se seleccionan 8 por token junto con un experto compartido, lo que permite combinar una capacidad total de 26B de parámetros con un coste computacional efectivo equivalente a 3B de parámetros activos.

El preentrenamiento se realizó sobre 8,8 billones de tokens, generados y filtrados mediante una colaboración con Datology, partiendo del dataset empleado en AFM-4.5B y añadiendo proporciones significativas de contenido matemático y de código. El entrenamiento se ejecutó en un clúster de 512 GPUs H200 con paralelismo HSDP, gestionado por Prime Intellect. Este checkpoint es un ajuste pre-anneal: se capturó en el punto justo anterior a iniciar el decaimiento de la tasa de aprendizaje sobre una mezcla de datos de alta calidad. Las tasas de aprendizaje empleadas fueron Adam LR 0.0002 y Muon LR 0.001. No se mencionan fases de RLHF, DPO ni otras técnicas de alineación posterior.

## Capacidades

- Generación de texto en modo base, sin instrucciones ni alineación.
- Razonamiento matemático y de código, gracias a la composición del dataset de entrenamiento (contenido math/code).
- Competencias multilingües en 10 idiomas: inglés, español, francés, alemán, italiano, portugués, ruso, árabe, hindi, coreano y chino.
- No se documenta soporte para tool calling, function calling, visión ni audio.
- No es apto para uso conversacional sin un ajuste fino previo.

## Casos de uso

- Ajuste fino para razonamiento matemático en contextos académicos: el modelo puede entrenarse sobre repositorios de problemas matemáticos y demostraciones para obtener un asistente especializado en cálculo, álgebra o estadística.
- Ajuste fino para generación de código en lenguajes de nicho o legacy: gracias a su entrenamiento en datos de código, puede adaptarse a frameworks internos de una empresa o a lenguajes con poca representación en modelos comerciales.
- Base para destilación en entornos con restricciones de recursos: su baja cantidad de parámetros activos (3B) permite utilizarlo como profesor o como modelo intermedio para destilar a una arquitectura más pequeña manteniendo capacidades de razonamiento.
- Ajuste fino para tareas multilingües de atención al cliente: puede especializarse en dominios concretos (soporte técnico, ventas) en varios de los idiomas soportados, con un coste de inferencia reducido en entornos empresariales.
- Investigación en arquitecturas MoE: al ser un checkpoint intermedio con 128 expertos, resulta útil para estudiar dinámicas de expertos, efectos del annealing y comportamiento de los pesos antes del decaimiento de LR.
- Ajuste fino para agentes con herramientas: partiendo de una base sin instrucciones, se puede entrenar para emitir llamadas a funciones y razonamiento multi-paso, integrándose en pipelines de automatización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia con los pesos en fp16 (26B totales): aproximadamente 52 GB, asumiendo todos los expertos cargados en memoria.
- VRAM estimada en cuantización de 4 bits: del orden de 13-14 GB, siempre que la conversión y el runtime soporten el esquema MoE.
- GPU recomendadas: H100 80GB, A100 80GB, o 2× RTX 4090 con parallelismo de tensor para la carga completa en fp16.
- En GPU de consumo: una RTX 4090 24GB solo podría ejecutar la versión cuantizada, pero con los 26B de parámetros totales en memoria; se necesita verificar la conversión a GGUF u otro formato cuantizado, no disponible en la información actual.
- Opciones de despliegue: no documentadas específicamente. Dado que es un modelo de `transformers` con `custom_code`, es compatible con `vLLM`, `TGI` y `llama.cpp` si se convierte previamente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de este modelo, por lo que la siguiente tabla compara únicamente características técnicas con otros MoE de tamaño similar. La presencia de un modelo en la tabla no implica equivalencia de rendimiento.

| Modelo | Parametros totales | Activos | Contexto | Licencia |
|---|---|---|---|---|
| Trinity-Mini-Base-Pre-Anneal | 26B | 3B | 4K | OpenMDW-1.1 |
| Qwen3-30B-A3B | 30B | 3B | 128K | Apache 2.0 |
| Mixtral 8x7B | 47B | 12,9B | 32K | Apache 2.0 |
| AFM-4.5B | 4,5B | 4,5B (no MoE) | no disponible | no disponible |

## Limitaciones y advertencias

- Checkpoint base pre-anneal: no está alineado para instrucciones ni chat; el autor indica explícitamente que no es apto para uso general sin un ajuste fino posterior.
- Longitud de contexto muy limitada (4K), lo que impide su uso directo en tareas de documentos largos o razonamiento multi-módulo sin extensión.
- No se han publicado benchmarks con métricas de sesgo, alucinación o seguridad, por lo que estos riesgos no están caracterizados.
- La licencia OpenMDW-1.1 puede imponer condiciones de uso y redistribución; es necesario revisar el texto completo antes de un uso comercial.
- Al ser un modelo MoE de 26B, el despliegue requiere gestionar todos los expertos en memoria, lo que limita su ejecución en hardware de consumo.
- No se han documentado formatos de cuantización oficiales ni cómo afecta la cuantización a la activación de expertos.

## Enlaces

- Repositorio en Hugging Face: [https://huggingface.co/CollectionStudio/Trinity-Mini-Base-Pre-Anneal](https://huggingface.co/CollectionStudio/Trinity-Mini-Base-Pre-Anneal)
- Repositorio original de Arcee AI: [https://huggingface.co/arcee-ai/Trinity-Mini-Base-Pre-Anneal](https://huggingface.co/arcee-ai/Trinity-Mini-Base-Pre-Anneal)
- Blog de Arcee AI "The Trinity Manifesto": [https://www.arcee.ai/blog/the-trinity-manifesto](https://www.arcee.ai/blog/the-trinity-manifesto)
- Modelo razonado en OpenRouter (ajuste posterior, no este checkpoint): [https://openrouter.ai/arcee-ai/trinity-mini](https://openrouter.ai/arcee-ai/trinity-mini)
- Licencia OpenMDW-1.1: [https://huggingface.co/arcee-ai/Trinity-Mini-Base-Pre-Anneal#license](https://huggingface.co/arcee-ai/Trinity-Mini-Base-Pre-Anneal#license)
