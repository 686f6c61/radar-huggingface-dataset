# GL3MON/tiny-aya-retail-e2e-sft-checkpoint70

## Resumen

GL3MON/tiny-aya-retail-e2e-sft-checkpoint70 es un adaptador PEFT (LoRA) derivado del modelo GL3MON/tiny-aya-global-function-calling-sft, que a su vez parte de la familia Tiny Aya de Cohere. El adaptador se ha sometido a un ajuste supervisado (SFT) orientado a dominios de retail y tool-calling, segun indican los tags del repositorio. El checkpoint 70 sugiere un punto intermedio de un entrenamiento mas largo, no un modelo final consolidado.

El modelo resuelve el problema de especializar un LLM pequeno en tareas de atencion al cliente y operaciones comerciales con llamadas a funciones, manteniendo la huella reducida de la familia Tiny Aya. El repo ocupa 0,1 GB, lo que es consistente con un adaptador LoRA de dimensiones modestas sobre un modelo base de pocos miles de millones de parametros.

La relevancia actual es limitada pero concreta: se trata de un artefacto de investigacion con acceso restringido (gated), cero descargas y cero likes en el momento de la consulta, y sin licencia ni idiomas declarados. Cualquier evaluacion en produccion debe hacerse con cautela y verificando primero el modelo base y los terminos de acceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Tiny Aya) con adaptador LoRA (PEFT) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no se especifica en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador PEFT sobre GL3MON/tiny-aya-global-function-calling-sft, que a su vez se apoya en la familia Tiny Aya de Cohere. La arquitectura subyacente es un transformer decoder-only de la familia Aya en su variante pequena; el adaptador anade matrices de bajo rango para especializar el modelo sin reentrenar los pesos completos. El tag `supervised-fine-tuning` indica que el ajuste se realizo con aprendizaje supervisado sobre pares instruccion-respuesta, presumiblemente con ejemplos de retail y tool-calling.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, etc.). El nombre del checkpoint (70) sugiere que se trata de un punto intermedio de un run mas largo, lo que implica que no necesariamente representa el mejor estado del entrenamiento. El modelo base declara function calling global, por lo que se espera que herede esa capacidad, aunque no hay verificacion publica en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en formato multi-turno, segun el tag `conversational`.
- Tool calling / function calling, heredado del modelo base y reforzado por el SFT especifico.
- Especializacion en dominio retail: presumiblemente consultas de catalogo, pedidos, devoluciones y atencion al cliente, aunque no se detalla en la informacion.
- Capacidades multilingues: no disponibles (el modelo base Aya es multilingue por diseno, pero este adaptador no declara idiomas).
- Razonamiento multi-paso y agentes: no confirmado en la informacion.
- Vision, audio o modo thinking: no disponible.

## Casos de uso

- Atencion al cliente en retail: el adaptador puede gestionar conversaciones multi-turno con intenciones de compra, consulta de pedido y devolucion, apoyandose en el tool calling para invocar APIs de backend. Es adecuado por su especializacion declarada en retail y su bajo coste de despliegue.
- Enrutamiento de intenciones con function calling: usar el modelo para clasificar la consulta del usuario y emitir una llamada a funcion estructurada (buscar_producto, consultar_stock, crear_devolucion) en un pipeline de soporte.
- Prototipado rapido de asistentes comerciales: al ser un adaptador LoRA sobre un modelo pequeno, permite iterar sobre el modelo base y el adaptador con recursos modestos antes de escalar a un modelo mayor.
- Generacion de respuestas de FAQ transaccionales: respuestas breves sobre envios, plazos y politicas, con contexto limitado, en escenarios de chat web.
- Investigacion sobre SFT en dominios verticales: util como punto de comparacion para estudiar como un adaptador LoRA de bajo rango modifica el comportamiento de tool calling en un modelo pequeno.
- Evaluacion de checkpoints intermedios: al ser el checkpoint 70, sirve para analizar la evolucion del entrenamiento y la estabilidad del tool calling a lo largo del run.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; al ser un adaptador LoRA, el requisito depende del modelo base Tiny Aya. Para un modelo de la familia Tiny Aya (orden de 1-3 mil millones de parametros, no confirmado), la inferencia en fp16 requeriria del orden de 2-6 GB de VRAM, y en cuantizacion de 4 bits podria caber en GPUs consumer de 8 GB o menos. Estas cifras son estimaciones basadas en el tamano tipico de la familia y no en datos publicados del modelo.
- GPU recomendadas: no disponibles. Para el modelo base, una RTX 3090/4090 o una A10G serian suficientes si se confirma el rango de 1-3B; una A100/H100 solo seria necesaria para lotes grandes o fine-tuning adicional.
- Cabe en GPU consumer: probablemente si, en cuantizacion, siempre que el modelo base sea de pocos miles de millones de parametros; no confirmado.
- Opciones de despliegue: el adaptador PEFT se puede cargar con la libreria `peft` sobre el modelo base en Hugging Face Transformers; para servir en produccion, vLLM y TGI admiten adaptadores LoRA, y llama.cpp/Ollama requeririan fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| GL3MON/tiny-aya-retail-e2e-sft-checkpoint70 | no disponible (adaptador LoRA) | no disponible | no disponible | Gated, 0 descargas | Especializado en retail y tool calling |
| GL3MON/tiny-aya-global-function-calling-sft | no disponible (modelo base) | no disponible | no disponible | Publico en HF | Modelo base del adaptador, function calling global |
| Tiny Aya (Cohere) | no disponible en la informacion | no disponible | no disponible | Publico en HF | Familia base multilingue de Cohere |
| Alternativas de tool calling de tamano pequeno (p. ej. Qwen2.5-1.5B-Instruct, Llama-3.2-1B-Instruct) | 1-1,5B | 32k-128k | Apache 2.0 / Llama | Publicas | Referencia de mercado para tool calling en modelos pequenos; no comparadas con benchmarks en esta ficha |

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar el modelo, lo que puede limitar su uso en pipelines automatizados.
- Licencia no declarada: no se puede asumir uso comercial; hay que verificar los terminos del modelo base y del adaptador antes de cualquier despliegue en produccion.
- Idiomas no declarados: aunque el modelo base Aya es multilingue, el adaptador puede haber perdido cobertura linguistica tras el SFT en retail.
- Checkpoint intermedio (70): no es necesariamente el estado final ni el mejor del entrenamiento; puede presentar inestabilidad o comportamientos no consolidados.
- Cero descargas y cero likes: no hay evidencia publica de validacion por parte de la comunidad.
- Riesgo de alucinacion: inherente a los LLM; en dominio retail puede inventar productos, precios o politicas si no se ancla con tool calling y recuperacion.
- Sesgos: no documentados; se heredan los del modelo base y los del dataset de SFT, no publicados.
- Sin benchmarks publicados: no se puede comparar su rendimiento con alternativas de forma objetiva.
- Contexto no disponible: no se puede planificar su uso en conversaciones largas sin verificar la ventana del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/GL3MON/tiny-aya-retail-e2e-sft-checkpoint70
- Modelo base: https://huggingface.co/GL3MON/tiny-aya-global-function-calling-sft
- Familia Tiny Aya de Cohere: no disponible en la informacion proporcionada
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada
