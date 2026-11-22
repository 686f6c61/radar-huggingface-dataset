# reaperdoesntknow/DualMind-GGUF

## Resumen

DualMind-GGUF es la distribucion en formato GGUF del modelo DualMind, un modelo de lenguaje de 1.700 millones de parametros (2.031.739.904 parametros segun los pesos en safetensors del modelo base) desarrollado por Convergent Intelligence LLC: Research Division. Su propuesta central es una arquitectura de "cognicion dual" que estructura la generacion en tres fases explicitas: `<explore>` para razonamiento libre y derivacion, `<examine>` para autocritica adversarial y deteccion de errores, y `<response>` para la sintesis final de la respuesta.

El modelo se construye sobre una cadena de destilacion que parte de Qwen3-1.7B, pasa por una variante DistilQwen3 sin censura, se refina con un proceso denominado DISC y recibe destilacion de conocimiento (TKD) desde Qwen3-30B-A3B-Thinking, para finalmente aplicar un SFT sobre el dataset LogicInference_OA. Esta version GGUF esta pensada para inferencia local en CPU y GPU de gama consumer, con cuantizaciones que van desde F16 (unos 3,4 GB) hasta Q4_K_M (unos 1,1 GB).

La relevancia actual del modelo reside en su enfoque de "inteligencia convergente": en lugar de escalar parametros, intenta emular el dialogo entre multiples modelos dentro de unos pesos compartidos, de modo que un modelo pequeno pueda razonar y revisarse a si mismo. La licencia Apache 2.0 y la disponibilidad de GGUF lo hacen accesible para prototipado y despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-1.7B), con esquema de generacion en tres fases explore/examine/response |
| Parametros totales | 2.031.739.904 (segun safetensors del modelo base); la model card describe el modelo como de 1,7B |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base en safetensors/BF16) |

## Arquitectura y entrenamiento

DualMind es un transformer decoder-only basado en Qwen3-1.7B. Su innovacion no es arquitectonica en el sentido de atencion o capas, sino de formato de razonamiento: el modelo ha sido entrenado para emitir secuencias estructuradas con tres etiquetas, `<explore>` (razonamiento sin restricciones, derivacion, especulacion), `<examine>` (autocritica adversarial y deteccion de errores) y `<response>` (sintesis limpia del dialogo interno). La idea es colapsar en unos unicos pesos la dialectica que normalmente se obtiene combinando varios modelos.

La cadena de entrenamiento declarada es: Qwen3-1.7B, seguido de DistilQwen3 (variante sin censura), Disctil (refinado con DISC), destilacion de conocimiento desde Qwen3-30B-A3B-Thinking (TKD) y, por ultimo, SFT sobre el dataset LogicInference_OA. El autor menciona fundamentos matematicos propios (calculo de discrepancias y destilacion topologica de conocimiento) documentados en la model card del modelo base y en papers con DOI. No se especifica el numero de tokens de entrenamiento ni la composicion detallada del dataset.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento estructurado en tres fases (exploracion, autocritica y sintesis), invocable mediante etiquetas en el prompt.
- Razonamiento logico y matematico orientado a demostraciones y derivaciones (el ejemplo de la model card es una prueba de convergencia de sucesiones de Cauchy).
- Autocorreccion y deteccion de errores dentro del propio proceso de generacion.
- Capacidad de destilacion de razonamiento "thinking" heredada del profesor Qwen3-30B-A3B-Thinking.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente, aunque el esquema explore/examine/response es compatible con flujos multi-paso.
- Capacidades multilingues: solo ingles declarado.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Razonamiento logico y demostraciones: el modelo puede generar derivaciones paso a paso en `<explore>`, revisarlas en `<examine>` y emitir una prueba limpia en `<response>`, lo que encaja en entornos educativos o de verificacion formal asistida.
- Asistente de estudio de matematicas: con temperatura 0,6 y repeat_penalty 1,3, puede resolver problemas paso a paso mostrando el razonamiento y la autocorreccion, util para materiales didacticos.
- Prototipado en dispositivos de borde: la cuantizacion Q4_K_M (unos 1,1 GB) permite ejecutarlo en CPU o en GPU con 6 GB de VRAM, ideal para demos locales y pruebas offline.
- Generacion de explicaciones auto-revisadas: en documentacion tecnica o articulos, el ciclo examine permite filtrar afirmaciones erroneas antes de la respuesta final.
- Investigacion en destilacion y razonamiento: sirve como banco de pruebas para estudiar tecnicas de autocritica y destilacion de profesores grandes a modelos pequenos.
- Chat local con Ollama o LM Studio: su integracion con runtimes GGUF permite desplegar un asistente conversacional en ingles en un portatil sin GPU dedicada.
- Generacion de codigo asistida con revision: aunque no esta especializado en codigo, el patron explore/examine puede usarse para proponer una solucion y luego revisarla antes de entregarla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: unos 3,4 GB para F16, 1,8 GB para Q8_0, 1,3 GB para Q5_K_M y 1,1 GB para Q4_K_M (mas overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU consumer con 4-6 GB de VRAM o mas (por ejemplo, RTX 3060, RTX 4060, RTX 4090) para las cuantizaciones Q4_K_M a Q8_0; F16 requiere al menos 6 GB.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas con 6 GB o mas; en CPU funciona con Q4_K_M.
- Opciones de despliegue: llama.cpp, Ollama (modelo publicado como `reaperdoesntrun/DualMinded-1.7B`), LM Studio y otros runtimes compatibles con GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| DualMind-GGUF | ~1,7B (2,03B en safetensors) | no disponible | GGUF | Apache 2.0 | Razonamiento explore/examine/response |
| Qwen3-1.7B | 1,7B | no disponible | safetensors, GGUF | Apache 2.0 | Modelo base de la cadena |
| Qwen3-30B-A3B-Thinking | 30B totales (3B activos, MoE) | no disponible | safetensors, GGUF | Apache 2.0 | Profesor de destilacion, mucho mayor |
| DistilQwen3 (variante sin censura) | ~1,7B | no disponible | safetensors | no disponible | Etapa intermedia de la cadena |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no se declaran capacidades multilingues.
- Modelo pequeno (1,7B), por lo que su conocimiento factual y su robustez en tareas abiertas son limitados frente a modelos mayores.
- Riesgo de alucinacion inherente a modelos de esta escala, especialmente en dominios especializados.
- La autocritica `<examine>` no garantiza la correccion de la respuesta; puede generar criticas plausibles pero erroneas.
- Requiere repeat_penalty 1,3 segun el autor para evitar bucles de enumeracion, lo que indica cierta tendencia a repetir patrones.
- Longitud de contexto no documentada; no se recomienda asumir ventanas largas.
- No se documentan capacidades de tool calling ni de agentes, por lo que no es adecuado para pipelines que dependan de function calling.
- Aunque la licencia es Apache 2.0, el modelo deriva de una cadena que incluye una variante "uncensored" de DistilQwen3; conviene revisar las condiciones de los modelos intermedios antes de un uso comercial critico.
- No hay benchmarks publicados que respalden las afirmaciones de calidad del autor.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/reaperdoesntknow/DualMind-GGUF
- Modelo base (SafeTensors): https://huggingface.co/reaperdoesntknow/DualMind
- Variante entrenada con Opus: https://huggingface.co/reaperdoesntknow/DualMinded-Qwen3-1.7B
- Variante thinking: https://huggingface.co/reaperdoesntknow/Dualmind-Qwen-1.7B-Thinking
- Variante GGUF Opus: https://huggingface.co/reaperdoesntknow/DualMinded-Qwen3-1.7B-GGUF
- Paper de metodologia: https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy (DOI: https://doi.org/10.57967/hf/8184)
- Paper "Structure Over Scale": https://huggingface.co/reaperdoesntknow/Structure-Over-Scale (DOI: 10.57967/hf/8165)
- Paper "Discrepancy Calculus": https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus (DOI: 10.57967/hf/8194)
- Coleccion DualMind: https://huggingface.co/collections/reaperdoesntknow/dualmind
- Coleccion DistilQwen: https://huggingface.co/collections/reaperdoesntknow/distilqwen
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
