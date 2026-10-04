# j-llm/navspec-lora-0.5b-v0.1

## Resumen

navspec-lora-0.5b-v0.1 es un adaptador LoRA experimental publicado por el usuario j-llm sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. Su propósito declarado es recibir como entrada las especificaciones de un buque (dimensiones del casco, desplazamiento, nacionalidad, época) junto con una propuesta de configuración de artillería principal, y devolver un veredicto estructurado en JSON que indica la conformidad con un conjunto de reglas de diseño o, en su caso, un código de motivo de infracción con el formato `navspec.armament_verdict.v1`.

Se trata de un prototipo en fase de investigación, entrenado sobre datos de reglas sintéticas y un sistema de simulación ficticio, por lo que no pretende reflejar restricciones de ingeniería naval reales ni históricas. El propio autor advierte de que la exactitud del juicio no está garantizada y de que el modelo puede generar códigos de motivo alucinados ante entradas desconocidas.

El interés de esta ficha es acotado: no es un modelo de propósito general, sino un caso de estudio de ajuste fino de un modelo muy pequeño (0,5B) para producir salidas JSON estructuradas sujetas a un esquema de validación. Por su tamaño, se puede ejecutar en hardware de consumo e incluso en CPU, y sirve como referencia para experimentos de destilación de reglas y validación de esquemas con LoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA acoplado |
| Parametros totales | Base de 0,5B (Qwen2.5-0.5B-Instruct); parametros exactos del adaptador no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | No especificados en la model card; el adaptador se distribuye en safetensors y puede fusionarse con la base y cuantizarse (GGUF, AWQ, GPTQ, etc.) |
| Idiomas soportados | Ingles (en), japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only con atención causal estándar. Segun la model card, el LoRA tiene rango 8 y alpha 160, y se aplica a las capas 8 a 23 (se excluyen las capas inferiores). Los módulos objetivo son `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, es decir, tanto los bloques de atención como la red feed-forward (incluidas las proyecciones de la puerta del MLP).

El entrenamiento se realizó sobre datos de reglas sintéticas y un sistema de simulación ficticio, orientado a la tarea de emitir un veredicto de conformidad con el esquema `navspec.armament_verdict.v1`. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de alineación adicionales como RLHF o DPO. Las reglas cubiertas, segun la descripción, incluyen restricciones de peso, compatibilidad de calibre y torreta, y limitaciones por época. El prompt de ejemplo utiliza el formato ChatML con un mensaje de sistema que instruye a actuar como `navspec-armament-judge` y a devolver únicamente JSON conforme al esquema.

## Capacidades

- Generación de texto condicionada a producir salidas JSON estructuradas que siguen un esquema de validación concreto (`navspec.armament_verdict.v1`).
- Emisión de veredictos de conformidad o infracción sobre propuestas de artillería naval, con códigos de motivo.
- Razonamiento de restricciones múltiples y combinadas (peso, calibre, compatibilidad de torreta, limitación temporal).
- Soporte de conversación en formato ChatML mediante la plantilla de chat del tokenizer del modelo base.
- Generación determinista si se configura `do_sample=False`, como en el ejemplo de uso del autor.
- Idiomas: inglés y japonés, según los metadatos del repositorio (el contenido de la model card está en japonés).
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Validación de esquemas en pipelines de generación: el modelo se puede usar como clasificador/validador ligero que recibe un objeto JSON de entrada y devuelve un veredicto JSON, integrándose en flujos donde se requiere una salida parseable y conforme a un esquema fijo.
- Prueba de concepto de ajuste fino con LoRA: sirve como referencia para experimentos de destilación de reglas de negocio en modelos de 0,5B, evaluando la adherencia al formato y la consistencia del veredicto.
- Moderación o filtrado basado en reglas: en un sistema con reglas de diseño definidas, el adaptador puede actuar como primera capa de comprobación antes de recurrir a un modelo mayor.
- Investigación sobre alucinación en modelos pequeños: permite estudiar la frecuencia con la que un modelo de 0,5B inventa códigos de motivo o veredictos ante entradas fuera de distribución.
- Generación de datos sintéticos etiquetados: en un bucle de anotación, las salidas del modelo pueden servir como borradores que después se revisan manualmente antes de incorporarse a un dataset.
- Simulación y juegos de construcción naval: en contextos de ficción o de diseño de juego donde las reglas son internas y no reflejan ingeniería real, el modelo puede generar veredictos coherentes con el reglamento ficticio.
- Despliegue en entornos con recursos muy limitados: por su tamaño (0,5B), puede ejecutarse en CPU o en GPU de gama baja para tareas de validación de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas numéricas (MMLU, HumanEval, GSM8K ni equivalentes), y únicamente menciona observaciones cualitativas sobre la variación de la adecuación al esquema según el entorno de ejecución (MLX nativo de Apple frente a PyTorch PEFT) y los parámetros de muestreo.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5B ocupa aproximadamente 1 GB en fp16 y alrededor de 0,5 GB o menos en cuantización de 4 bits; el adaptador LoRA añade una cantidad marginal.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; se puede usar desde una GTX 1050 Ti o integradas modernas hasta una RTX 4090 sin aprovechar su capacidad.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo actual y en muchas integradas. También puede ejecutarse en CPU.
- Opciones de despliegue: transformers con PEFT, llama.cpp/GGUF tras fusionar el adaptador con la base, Ollama, vLLM o TGI tras la fusión, y MLX en entornos Apple, segun menciona el propio autor.
- Latencia y throughput estimados: no disponibles. Al tratarse de un modelo de 0,5B, la latencia por petición es muy baja en GPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| navspec-lora-0.5b-v0.1 | 0,5B (base) + LoRA | 32.768 tokens | Adaptador LoRA especializado | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5B | 32.768 tokens | Modelo base generalista | Apache 2.0 | HuggingFace |
| SmolLM2-360M-Instruct | 0,36B | 8.192 tokens (aprox.) | Modelo generalista pequeño | Apache 2.0 | HuggingFace |
| TinyLlama-1.1B-Chat | 1,1B | 2.048 tokens | Modelo generalista pequeño | Apache 2.0 | HuggingFace |

La comparación directa de rendimiento no es posible porque no se han publicado benchmarks del adaptador. Frente a los modelos generalistas de la tabla, la diferencia relevante no es la capacidad de razonamiento, sino la especialización: navspec-lora-0.5b-v0.1 está ajustado para una única tarea de validación de reglas con salida JSON, y carece de la cobertura general de sus alternativas.

## Limitaciones y advertencias

- Modelo experimental y de investigación: el autor no garantiza la exactitud, completitud ni fiabilidad del veredicto.
- Entrenado sobre reglas sintéticas y una simulación ficticia, por lo que sus juicios pueden no coincidir con especificaciones de armamento reales o históricas.
- Riesgo de alucinación documentado: puede generar códigos de motivo incorrectos o veredictos inventados ante entradas desconocidas.
- Sensibilidad al entorno de ejecución y a los parámetros de muestreo: la adecuación al esquema puede variar entre MLX, PyTorch PEFT y otras configuraciones.
- Idiomas limitados a inglés y japonés según los metadatos; no hay soporte declarado de castellano.
- Contexto limitado a 32.768 tokens, suficiente para entradas JSON típicas pero no para documentos extensos.
- Licencia Apache 2.0, que permite uso comercial, pero el propio autor desaconseja su uso en producción por tratarse de un prototipo sin garantías de fiabilidad.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por terceros.
- No se documentan sesgos específicos, pero al estar entrenado sobre datos sintéticos puede heredar las suposiciones de quien definió las reglas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/j-llm/navspec-lora-0.5b-v0.1
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces obtenidos correspondían a páginas sobre la letra "J" y no guardan relación con el adaptador. No se dispone de papers, blogs, repositorios de código ni demos adicionales asociados a este modelo.
