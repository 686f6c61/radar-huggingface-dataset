# ahrazzle/aletheia-scribe-0.5b

## Resumen

Aletheia-Scribe-0.5B es un micro-especialista derivado de Qwen/Qwen2.5-0.5B mediante un ajuste fino con LoRA (rango 16, alfa 32) fusionado de vuelta en los pesos base. Lo desarrolla el usuario ahrazzle dentro del proyecto Foundation-0/aletheia, y su proposito concreto es auditar informes cientificos con semantica fail-closed: extraer metadatos estructurados en JSON y detectar fugas o problemas de higiene en los documentos, garantizando que ninguna salida no verificada pase a etapas posteriores del pipeline.

El modelo esta pensado para operar detras de un router de verificacion determinista (Law-3, aletheia_specialist_router.py) y no como un asistente conversacional general. Con 494 millones de parametros, hereda la arquitectura Qwen2 y la licencia Apache 2.0 del modelo base, y su entrenamiento se realizo sobre 200 filas de datos propios (tracks S15..S74) con evaluacion en 48 filas no vistas (tracks S75..S90).

Su relevancia es acotada pero clara: demuestra que un modelo de 0,5B puede alcanzar cumplimiento estricto de esquema JSON y deteccion de fugas con F1 perfecta en un dominio muy restringido, a un coste de inferencia de aproximadamente 193 ms por llamada en una RTX 3080 Laptop. La contrapartida es una perdida de retencion en el dominio base (NLL pasa de 2,0399 a 2,1840), lo que refleja el clasico olvido catastrofico de un ajuste fino estrecho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2ForCausalLM) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-0.5B, no especificada en la informacion) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, 988.097.824 B segun la model card) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con atencion causal estandar. Sobre el se aplico un ajuste fino con LoRA de rango 16 y alfa 32 sobre las 168 proyecciones lineales (24 capas x 7 modulos q/k/v/o/gate/up/down), con un presupuesto de 8.798.208 parametros entrenables. Posteriormente el adaptador se fusiono de forma limpia en los pesos estandar de Qwen2ForCausalLM, de modo que el checkpoint resultante se carga sin necesidad de PEFT.

El entrenamiento se realizo en hardware deterministico (NVIDIA GeForce RTX 3080 Laptop, 8 GiB, semilla 42, 103,33 s de tiempo de entrenamiento, 2.181 MiB de VRAM pico) y la evaluacion se verifico con aritmetica racional exacta (fractions.Fraction, sin flotantes). Los datos son dos conjuntos disjuntos publicados por el autor: scribe_train.jsonl (200 filas, tracks S15..S74) y scribe_eval.jsonl (48 filas, tracks S75..S90). La model card menciona una verificacion cruzada con dos auditorias (AUDIT-195-GLM53 y AUDIT-195R2-GROK47) y 16 teoremas en Lean 4.36.0, aunque no se detalla la composicion exacta del dataset ni si hubo RLHF o DPO; la informacion disponible no lo especifica.

## Capacidades

- Extraccion de metadatos estructurados de informes cientificos en JSON estricto, con cumplimiento de esquema verificado en 48/48 casos de evaluacion.
- Coincidencia exacta de los 7 campos definidos por el esquema en 48/48 casos.
- Deteccion de problemas de higiene y fugas de informacion (F1 de 1,0000 con TP/FP/FN/TN de 36/0/0/12 en el conjunto de evaluacion).
- Generacion de texto condicionada al formato de salida esperado por el router de verificacion.
- Operacion en modo fail-closed: el modelo esta disenado para que sus salidas se validen con un verificador externo de esquema e higiene.
- Capacidad multilingue limitada al ingles (unico idioma declarado).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking.

## Casos de uso

- Auditoria automatizada de informes cientificos: el modelo recibe un informe y devuelve un JSON con los 7 campos de metadatos exigidos, que un router determinista valida antes de aceptarlo; es adecuado porque su entrenamiento se centro exactamente en ese esquema y alcanza cumplimiento estricto en la evaluacion.
- Deteccion de fugas de informacion en documentos: se integra como etapa de higiene que marca posibles filtraciones antes de que el documento pase a un repositorio o publicacion, con una F1 de 1,0000 en el conjunto de prueba del autor.
- Puerta de calidad en pipelines de publicacion cientifica: actua como primer filtro fail-closed que rechaza cualquier salida que no cumpla el esquema, delegando la decision final al verificador determinista.
- Preprocesamiento de metadatos para bases de datos de literatura: extrae campos estructurados de forma consistente para indexacion, con un coste de aproximadamente 193 ms por llamada en una RTX 3080 Laptop.
- Verificacion de integridad en flujos de investigacion reproducibles: combinado con el router Law-3, garantiza que solo las salidas validadas lleguen a etapas posteriores, lo que encaja en entornos donde la trazabilidad es requisito.
- Despliegue en hardware de gama media: con 494 millones de parametros y 2.181 MiB de VRAM pico durante el entrenamiento, puede ejecutarse en GPUs consumer para tareas de auditoria por lotes, aunque la VRAM de inferencia no se documenta explicitamente.

## Benchmarks y rendimiento

| Metrica | Qwen2.5-0.5B base | Aletheia-Scribe-0.5B |
|---|---|---|
| Cumplimiento estricto de esquema JSON | 0/48 (0,00 %) | 48/48 (100,00 %) |
| Coincidencia exacta de los 7 campos | 0/48 (0,00 %) | 48/48 (100,00 %) |
| F1 de deteccion de higiene/fugas (TP/FP/FN/TN) | 0,0000 | 1,0000 (36/0/0/12) |
| NLL objetivo en held-out | 0,2719 | 0,0000 |
| NLL de retencion en dominio base (ΔF) | 2,0399 | 2,1840 (+0,1441; F/L = 0,5300) |
| Throughput de inferencia (RTX 3080 Laptop) | 294,23 ms/llamada | 193,45 ms/llamada (362,71 tok/s) |

Los datos proceden de la model card del autor y se calcularon con aritmetica racional exacta sobre 48 casos no vistos (tracks S75..S90). No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no documentada explicitamente; el entrenamiento uso 2.181 MiB pico en una RTX 3080 Laptop de 8 GiB, por lo que la inferencia en bfloat16 deberia caber holgadamente en GPUs consumer, aunque el dato exacto no esta disponible.
- GPU recomendadas: cualquier GPU con al menos 8 GiB para bfloat16; el autor valido en NVIDIA GeForce RTX 3080 Laptop.
- Cabe en GPU consumer: si, segun el hardware usado por el autor (RTX 3080 Laptop, 8 GiB).
- Opciones de despliegue: transformers (AutoModelForCausalLM con device_map="auto"), text-generation-inference (tag endpoints_compatible); no se documentan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: 193,45 ms por llamada y 362,71 tok/s en RTX 3080 Laptop, frente a 294,23 ms por llamada del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aletheia-Scribe-0.5B | 494 M | no disponible | Especialista en auditoria de informes cientificos y JSON estricto | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-0.5B | 494 M | no disponible | Modelo generalista base | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B | no disponible | no disponible | Modelo generalista de mayor tamano | Apache 2.0 | Hugging Face |

La comparativa con alternativas especializadas en extraccion JSON o auditoria documental no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Especialista estrecho: no debe usarse como modelo conversacional general; su rendimiento fuera del dominio de auditoria de informes no esta evaluado.
- Requiere gating determinista: el autor exige emparejarlo con un verificador de esquema e higiene para garantizar cero falsos aceptados.
- Olvido catastrofico medido: la NLL en el dominio base empeora de 2,0399 a 2,1840 (+0,1441), lo que indica perdida de capacidad general respecto al modelo base.
- Solo ingles: el unico idioma declarado es en, sin evaluacion multilingue.
- Riesgo de alucinacion: no se documenta una evaluacion especifica de alucinacion fuera del conjunto de 48 casos; el cumplimiento de esquema no garantiza veracidad del contenido.
- Sesgos: no se han publicado analisis de sesgos en la informacion disponible.
- Licencia Apache 2.0 heredada del modelo base, permisiva para uso comercial, pero el autor no ofrece garantias sobre el comportamiento en produccion.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahrazzle/aletheia-scribe-0.5b
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/ahrazzle/aletheia-specialists-s95-datasets
- Pull request del proyecto Aletheia (Track S95): https://github.com/Foundation-0/aletheia/pull/95
- Repositorio Foundation-0/aletheia: https://github.com/Foundation-0/aletheia
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
