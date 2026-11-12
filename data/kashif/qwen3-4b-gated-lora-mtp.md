# kashif/Qwen3-4B-Gated-LoRA-MTP

## Resumen

Qwen3-4B-Gated-LoRA-MTP es un adaptador LoRA publicado por el usuario kashif sobre el modelo base Qwen/Qwen3-4B, que incorpora decodificacion especulativa autoinducida mediante prediccion multi-token (MTP, multi-token prediction). El adaptador sigue el metodo gated-LoRA descrito en el articulo arXiv:2507.11851 y permite que un modelo que no fue preentrenado con cabezas MTP genere varios tokens borrador por pasada de avance, sin modificar el comportamiento del modelo base en generacion normal.

La innovacion principal es que no anade cabezas nuevas: reutiliza la propia LM head del modelo congelado y reaprovecha tres identificadores de vocabulario reservados y sin uso (`151700`, `151701`, `151702`) como tokens mascara, uno por profundidad de prediccion. Los pesos LoRA solo se activan cuando el modelo procesa uno de esos tokens mascara; en cualquier token real el adaptador queda completamente inerte, de modo que la generacion estandar es identica a la del modelo base.

El adaptador es de rango 16, con alpha 32, aplicado a las proyecciones de atencion y MLP, y suma aproximadamente 16,5 millones de parametros entrenables sobre un Qwen3-4B congelado. Se entreno sobre el dataset databricks/databricks-dolly-15k con un objetivo de autodestilacion suave, y esta publicado con licencia Apache 2.0, lo que lo hace atractivo para experimentar con tecnicas de aceleracion de inferencia sin coste de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 16, alpha 32) sobre transformer Qwen3-4B congelado; prediccion multi-token mediante tokens mascara reservados |
| Parametros totales | Aproximadamente 16,5 M entrenables (solo LoRA); el modelo base Qwen3-4B permanece congelado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-4B; no especificada en la informacion) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base y del stack de despliegue) |
| Idiomas soportados | Ingles (`en`) segun la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se engancha al transformer de Qwen3-4B mediante LoRA de rango 16 y alpha 32, aplicado a todas las capas lineales de atencion (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y a las del bloque MLP (`gate_proj`, `up_proj`, `down_proj`). En lugar de anadir cabezas de prediccion adicionales, reutiliza la LM head congelada del modelo base y reserva tres identificadores de vocabulario sin uso como tokens mascara, uno por cada profundidad de prediccion (3 profundidades). En inferencia se anaden esos tokens mascara tras el contexto actual, se ejecuta una pasada adicional con el gate LoRA activo solo en esas posiciones y se leen hasta tres tokens borrador mas alla de la prediccion ordinaria del siguiente token, donde la profundidad `d` predice el token a `d + 1` posiciones.

El entrenamiento usa autodestilacion suave: cada profundidad se entrena para igualar la distribucion del siguiente token del propio modelo base congelado, no etiquetas duras. Los datos son los primeros 14.500 ejemplos de los 15.011 de databricks/databricks-dolly-15k (pares instruccion/respuesta generales), dejando el resto para validacion. El checkpoint final `main` corresponde al paso 906 (final de la primera epoca), con revisiones intermedias en los pasos 299, 599 y 899. La validacion se midio como longitud esperada de tokens aceptados por pasada de avance bajo autoespeculacion con teacher forcing, comparando cada prediccion de profundidad contra la continuacion greedy del modelo base y condicionando la aceptacion a que todas las profundidades mas superficiales tambien coincidan.

## Capacidades

- Generacion de texto conversacional e instruccional, heredada del modelo base Qwen3-4B.
- Prediccion multi-token autoespeculativa: genera hasta tres tokens borrador por pasada adicional, que luego se verifican contra el modelo base en una unica pasada batcheada.
- Decodificacion especulativa autoinducida sin cabezas MTP preentrenadas, gracias a la reutilizacion de tokens mascara reservados.
- Generacion estandar sin degradacion: el adaptador es inerte en tokens reales, por lo que la salida coincide con el modelo base.
- Soporte de carga estandar via PEFT (`PeftModel.from_pretrained`) para generacion ordinaria.
- Capacidades multilingues: la model card declara solo ingles; no se documentan otras lenguas.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio ni modo thinking especificas del adaptador.

## Casos de uso

- Aceleracion de inferencia en produccion: el adaptador permite aplicar decodificacion especulativa sobre un Qwen3-4B ya desplegado sin necesidad de reentrenar el modelo base ni de disponer de un modelo borrador separado, reduciendo el coste de generar tokens en pipelines de texto.
- Investigacion en decodificacion especulativa: sirve como implementacion de referencia del metodo gated-LoRA de arXiv:2507.11851 para experimentar con profundidades de prediccion, tasas de aceptacion y estrategias de verificacion.
- Despliegue con memoria limitada: al no requerir un modelo borrador adicional, el adaptador anade solo unos 16,5 M de parametros entrenables sobre el base, lo que simplifica el stack frente a esquemas de speculative decoding con dos modelos.
- Servicio de chat e instrucciones en ingles: el adaptador es inerte en generacion normal, por lo que puede usarse como capa opcional de aceleracion sobre un asistente conversacional basado en Qwen3-4B sin alterar sus respuestas.
- Experimentacion con autodestilacion: el objetivo de autodestilacion suave sobre las distribuciones del modelo base permite estudiar tecnicas de destilacion aplicadas a prediccion multi-token.
- Evaluacion comparativa de checkpoints: las revisiones `step-299`, `step-599`, `step-899` y `main` permiten medir el impacto del numero de pasos de entrenamiento en la longitud aceptada por pasada.
- Prototipado de tecnicas de gating: el mecanismo de gate por token (activar LoRA solo en posiciones mascara) es reutilizable para otros experimentos de adaptadores condicionales.

## Benchmarks y rendimiento

Resultados de validacion publicados en la model card, medidos como longitud esperada de tokens aceptados por pasada de avance bajo autoespeculacion con teacher forcing sobre datos de instruccion retenidos:

| Checkpoint | Pasos de entrenamiento | Longitud aceptada (teacher-forced) |
|---|---|---|
| `step-299` | 299 | 1,95 |
| `step-599` | 599 | 2,00 |
| `step-899` | 899 | 2,03 |
| `main` (final) | 906 | 2,03 |

Tasas de aceptacion por profundidad del checkpoint final, remedidas de forma independiente cargando el checkpoint de forma aislada (modelo base mas adaptador, sin framework de entrenamiento): aproximadamente 51 % / 23 % / 11 % para las profundidades 1 / 2 / 3 respectivamente. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; depende del modelo base Qwen3-4B y de su cuantizacion. El adaptador anade aproximadamente 16,5 M de parametros, un incremento marginal sobre el modelo base.
- GPU recomendadas: no especificadas en la informacion disponible. Al tratarse de un modelo de 4B, es desplegable en GPUs de consumo, pero no se documentan modelos concretos.
- Compatibilidad con GPU de consumo: previsiblemente si, al tratarse de un adaptador sobre un modelo de 4B, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: carga estandar via PEFT y Transformers (`PeftModel.from_pretrained`). La implementacion de drafting requiere ademas hooks de forward sobre capas `LoraLayer` y gestion manual de `position_ids` y mascaras de atencion. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles. La model card solo reporta longitud aceptada por pasada (2,03 tokens en el checkpoint final), no mediciones de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kashif/Qwen3-4B-Gated-LoRA-MTP | ~16,5 M (LoRA) sobre Qwen3-4B congelado | No disponible | Decodificacion especulativa autoinducida con gated-LoRA y tokens mascara | Apache 2.0 | Hugging Face (PEFT) |
| Qwen/Qwen3-4B (base) | 4B | No disponible en la informacion | Transformer denso de generacion de texto | Apache 2.0 | Hugging Face |
| Modelos borrador dedicados para speculative decoding | Variable (tipicamente cientos de millones a varios miles de millones) | No disponible | Modelo borrador independiente verificado por el modelo objetivo | Variable | Variable |

La comparativa con alternativas de decodificacion especulativa de otros autores no esta disponible en la informacion proporcionada. La ventaja estructural frente a esquemas de dos modelos es que no requiere un borrador separado ni reentrenar el modelo base, a costa de una longitud aceptada modesta (2,03 tokens por pasada).

## Limitaciones y advertencias

- La longitud aceptada por pasada es de 2,03 tokens en el checkpoint final, con tasas de aceptacion que caen rapidamente con la profundidad (51 % / 23 % / 11 %), lo que limita la ganancia practica de velocidad.
- El adaptador se entreno unicamente sobre databricks/databricks-dolly-15k (14.500 ejemplos), un dataset general de instrucciones; su comportamiento fuera de esa distribucion no esta documentado.
- La model card declara solo ingles; no hay evidencia de funcionamiento multilingue del mecanismo de drafting.
- El uso del adaptador para drafting requiere implementacion manual de hooks de gate, `position_ids` y mascaras de atencion; no es un simple `generate()` y aumenta la complejidad de integracion.
- La model card no documenta sesgos, riesgos de alucinacion ni evaluaciones de seguridad; estos riesgos se heredan del modelo base Qwen3-4B.
- Licencia Apache 2.0 permite uso comercial, pero el adaptador depende del modelo base Qwen3-4B, cuyos terminos deben respetarse por separado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.
- No se documentan mediciones de latencia ni throughput reales, solo la metrica de tokens aceptados bajo teacher forcing.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kashif/Qwen3-4B-Gated-LoRA-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Articulo de referencia (gated-LoRA): https://arxiv.org/abs/2507.11851
- Dataset de entrenamiento: https://huggingface.co/datasets/databricks/databricks-dolly-15k
