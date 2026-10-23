# kellyjeong/Qwen3-0.6B-JSON-SFT-GRPO

## Resumen

`kellyjeong/Qwen3-0.6B-JSON-SFT-GRPO` es un ajuste fino (fine-tune) del modelo `NotoriousH2/Qwen3-0.6B-JSON-SFT`, que a su vez deriva del modelo denso Qwen3-0.6B de Alibaba. Lo publica el usuario kellyjeong en HuggingFace con licencia Apache 2.0 y un único idioma declarado, el inglés. El nombre del repositorio indica la receta de entrenamiento: primero un ajuste supervisado (SFT) orientado a la generación de JSON y después una fase de aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization) sobre ese mismo checkpoint.

El interés practico esta en que se trata de un modelo muy pequeno (596.049.920 parametros segun los pesos en safetensors) especializado en una tarea concreta y muy demandada en produccion: devolver salidas estructuradas validas en lugar de texto libre. Un modelo de este tamano puede ejecutarse en CPU o en cualquier GPU de consumo, lo que lo hace candidato para tareas de extraccion de campos, enrutado y validacion dentro de pipelines, donde un modelo grande seria sobredimensionado.

Ahora bien, la informacion publicada es minima: la model card no incluye detalles del dataset de entrenamiento, hiperparametros del GRPO, longitud de contexto, resultados de evaluacion ni comparaciones. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta (creado el 2026-10-23 segun los metadatos), por lo que conviene tratarlo como un experimento reproducible mas que como un modelo validado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3, decoder-only); no se documenta ninguna variante MoE ni hibrida |
| Parametros totales | 596.049.920 (dato real de los pesos en safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen3-0.6B declara 32 768 tokens de forma nativa, pero este fine-tune no lo especifica |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene safetensors (1,2 GB, coherente con bf16), sin versiones GGUF, AWQ ni GPTQ publicadas |
| Idiomas soportados | en (unico idioma declarado en los metadatos) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | NotoriousH2/Qwen3-0.6B-JSON-SFT |
| Etiquetas adicionales | text-generation-inference, unsloth, conversational, endpoints_compatible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-0.6B original: un transformer decoder-only denso con atencion causal estandar, sin mezcla de expertos. El autor no aporta modificaciones estructurales; el trabajo se concentra en el post-entrenamiento. La receta declarada en el nombre del modelo es en dos fases: un SFT sobre el checkpoint `NotoriousH2/Qwen3-0.6B-JSON-SFT` (ya orientado a producir JSON) y, despues, un refinamiento con GRPO, un algoritmo de RL sin critico que estima la ventaja relativa dentro de un grupo de respuestas muestreadas para la misma instruccion. Ese esquema se usa habitualmente para optimizar recompensas verificables, como la validez sintactica del JSON o el cumplimiento de un esquema.

El entrenamiento se realizo con Unsloth y la libreria TRL de HuggingFace, segun la model card, que ademas afirma que el modelo se entreno "2x faster" con ese stack. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, el esquema JSON objetivo, la funcion de recompensa del GRPO, los hiperparametros (LR, batch, numero de pasos) ni si hubo fases adicionales de DPO o RLHF. Tampoco se documenta ninguna innovacion tecnica propia (atencion lineal, decodificacion especulativa, thinking mode) mas alla de lo que herede del Qwen3 base.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del ajuste SFT del modelo base.
- Generacion de salidas en formato JSON: es la capacidad que da nombre al checkpoint y la que presumiblemente se optimizo en la fase GRPO.
- Seguimiento de instrucciones y formato de chat (etiqueta `conversational`), adecuado para plantillas de dialogo de Qwen3.
- Refinamiento por refuerzo orientado a recompensas verificables, lo que en la practica deberia mejorar la tasa de JSON parseable frente al checkpoint SFT, aunque no se publican mediciones que lo confirmen.
- Compatibilidad con Text Generation Inference y con `transformers`, lo que facilita el despliegue como endpoint.
- No hay soporte documentado de tool calling o function calling explicito.
- No hay soporte documentado de agentes, razonamiento multi-paso, modo thinking, vision ni audio.
- Multilingue: no; solo ingles declarado.

## Casos de uso

- Extraccion de campos estructurados: dado un texto libre (correo, resena, ticket), generar un JSON con campos fijos consumible directamente por una base de datos. El modelo es adecuado por su especializacion en JSON y porque 596 M parametros permiten ejecutarlo en CPU con latencia aceptable para procesos por lotes.
- Enrutado de intenciones en asistentes conversacionales: clasificar la consulta del usuario en una etiqueta predefinida y devolver `{"intent": ...}` junto con los parametros extraidos, en lugar de texto que habria que parsear con expresiones regulares.
- Normalizacion de datos en pipelines ETL: convertir registros heterogeneos o mal formados en un esquema canonico antes de insertarlos en un almacen, usando el modelo como paso de limpieza dentro del pipeline.
- Generacion de fixtures y datos de prueba: producir objetos JSON de ejemplo que respeten un esquema dado para tests automatizados, aprovechando el ajuste por refuerzo hacia salidas validas.
- Preprocesado para modelos mayores: usar este 0.6B como primer paso barato que transforma la entrada en JSON estructurado y reservar un modelo grande para el razonamiento costoso, reduciendo el coste por peticion.
- Prototipado y evaluacion de tecnicas de RL: al estar entrenado con GRPO y publicarse con licencia Apache 2.0, sirve como banco de pruebas reproducible para estudiar el efecto del RL sobre tareas de formato estricto en modelos pequenos.
- Clasificacion y etiquetado por lotes en local: al caber en cualquier GPU de consumo e incluso en CPU, permite etiquetar corpus sin enviar datos a terceros, algo relevante cuando hay requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, evaluaciones de validez JSON ni comparaciones con el checkpoint SFT del que parte, por lo que no es posible cuantificar la mejora atribuible a la fase GRPO.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, los pesos ocupan aproximadamente 1,2 GB; con cache KV y overhead de runtime, el consumo realista se situa en torno a 2-3 GB para contextos moderados (estimacion a partir del tamano del repositorio, no medida publicada).
- Cabe en cualquier GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, e incluso en GPUs de 4-6 GB con cuantizacion. No requiere A100 ni H100.
- Ejecucion en CPU viable: los 596 M parametros permiten inferencia en CPU para procesos por lotes, aunque sin datos de latencia publicados.
- Opciones de despliegue: `transformers` (soporte nativo), Text Generation Inference (la etiqueta `text-generation-inference` esta presente) y, previa conversion, llama.cpp u Ollama. vLLM es compatible en principio por ser un transformer denso, pero no se ha validado en la informacion disponible.
- Cuantizacion: no hay artefactos GGUF, AWQ ni GPTQ publicados; habria que generarlos con herramientas estandar (por ejemplo, el exportador de llama.cpp o el propio Unsloth).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kellyjeong/Qwen3-0.6B-JSON-SFT-GRPO | 596 M | no disponible | JSON + GRPO | Apache 2.0 | Repositorio HF, 0 descargas |
| NotoriousH2/Qwen3-0.6B-JSON-SFT | no disponible (deriva de Qwen3-0.6B) | no disponible | JSON via SFT | no verificado en esta ficha | Repositorio HF (modelo base directo) |
| Qwen/Qwen3-0.6B | 0,6 B | 32 768 tokens nativos (ampliable con YaRN, segun la documentacion de la familia) | proposito general, multilingue | Apache 2.0 | Ampliamente disponible, con versiones GGUF de la comunidad |
| Qwen2.5-0.5B-Instruct | 0,49 B | 32 768 tokens (segun documentacion de la familia) | proposito general, instrucciones | Apache 2.0 | Ampliamente disponible, con versiones GGUF |

La comparacion relevante es contra el modelo base sin RL: este checkpoint anade la fase GRPO, pero sin metricas publicadas no puede afirmarse que sea superior en validez JSON. Frente a Qwen3-0.6B original, pierde cobertura multilingue (aqui solo ingles declarado) y gana una supuesta especializacion en formato. Los datos de contexto de las filas de Qwen3 y Qwen2.5 provienen de la documentacion de esas familias, no de la model card analizada.

## Limitaciones y advertencias

- Idiomas: solo ingles declarado; el rendimiento en castellano no esta documentado y probablemente sea degradado.
- Sesgos: no hay ninguna evaluacion de sesgos ni documentacion sobre la composicion del dataset de SFT o de las recompensas del GRPO, por lo que los sesgos del modelo base se heredan sin mitigacion conocida.
- Alucinacion: con 596 M parametros el riesgo de inventar contenido es alto, especialmente fuera del dominio JSON para el que fue ajustado.
- Sobreajuste al formato: la doble optimizacion (SFT + GRPO) puede degradar la calidad conversacional general y volver al modelo excesivamente rigido ante instrucciones que no encajan en el esquema entrenado.
- Trazabilidad: el autor es un particular, el modelo base es de un tercero (`NotoriousH2`) y no hay publicacion, paper ni informe tecnico que respalde los resultados.
- Validacion en produccion: al no haber benchmarks ni tests publicados, cualquier uso productivo exige evaluar la tasa de JSON valido y el cumplimiento de esquema con un conjunto propio antes de desplegar.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero conviene verificar que el checkpoint base `NotoriousH2/Qwen3-0.6B-JSON-SFT` mantiene la misma licencia y que los terminos de Qwen3 se respetan en la cadena de derivacion.
- Adopcion: 0 descargas y 0 likes implican ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kellyjeong/Qwen3-0.6B-JSON-SFT-GRPO
- Modelo base del fine-tune: https://huggingface.co/NotoriousH2/Qwen3-0.6B-JSON-SFT
- Modelo original de la familia: https://huggingface.co/Qwen/Qwen3-0.6B
- Unsloth (stack de entrenamiento citado): https://github.com/unslothai/unsloth
- TRL de HuggingFace (stack de entrenamiento citado): https://github.com/huggingface/trl
