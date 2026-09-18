# d4rkninja/tanpo-ops

## Resumen

Tanpo Ops es un ajuste fino de tipo LoRA sobre LiquidAI/LFM2.5-1.2B-Instruct, publicado por el usuario d4rkninja como parte de la coleccion "Tanpo — Domain Specialists". Se trata de un especialista de dominio de aproximadamente 1.170 millones de parametros orientado a tareas de operaciones: planificacion de capacidad, ejecucion de OKR, operaciones con proveedores, diseno de traspasos (handoffs), redaccion de SOP, cadencia operativa y postmortems de incidentes. No es un modelo generalista ni de frontera: el autor lo presenta explicitamente como un modelo compacto pensado para despliegue local o de bajo coste.

El modelo hereda del checkpoint base una ventana de contexto de 32.768 tokens y un diseno orientado a inferencia en el borde (edge/on-device). El repositorio aloja los pesos fusionados en formato Transformers (la LoRA ya integrada en los pesos base mediante `merge_and_unload` de PEFT), y existen artefactos complementarios publicados por el mismo autor en formato de adaptador LoRA y en GGUF cuantizado.

Su relevancia actual es acotada pero clara: demuestra el patron de reutilizar una arquitectura pequena y barata de ejecutar para construir especialistas de dominio con un coste de entrenamiento minimo (LoRA con rango 16), sacrificando cobertura general a cambio de estructura repetible en flujos operativos. El propio autor advierte de que la mejora es modesta (+1,2 puntos porcentuales sobre la base en su evaluacion interna) y de que varias subcategorias empeoran respecto al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (Liquid Foundation Model 2), heredada del modelo base LiquidAI/LFM2.5-1.2B-Instruct; el autor no detalla la composicion interna de bloques |
| Parametros totales | 1.170.340.608 (segun safetensors) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens (segun la model card, heredada del modelo base) |
| Tipos de cuantizacion | GGUF publicado por el autor en repositorio aparte; se recomienda Q4_K_M cuando este disponible. No se listan otros formatos cuantizados en este repositorio |
| Idiomas soportados | en (ingles) |
| Licencia | other (el repositorio declara "other"; los terminos concretos no se detallan en la informacion disponible. Verificar la licencia del modelo base LiquidAI/LFM2.5-1.2B-Instruct) |
| Formato de pesos | safetensors (pesos Transformers fusionados); adaptador LoRA/PEFT en repositorio separado; GGUF en repositorio separado |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | LiquidAI/LFM2.5-1.2B-Instruct |
| Dataset de ajuste | d4rkninja/tanpo-ops-sft |
| Tamano del repositorio | 2,3 GB |
| Fecha de publicacion | 2026-09-18 (segun HuggingFace) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del checkpoint LiquidAI/LFM2.5-1.2B-Instruct, identificada con la etiqueta `lfm2` en el repositorio. La model card de Tanpo Ops no describe la composicion interna de bloques ni el esquema de atencion, por lo que cualquier detalle adicional sobre la arquitectura LFM2 debe consultarse en la documentacion de Liquid AI; la informacion proporcionada no lo especifica.

El entrenamiento consiste en un ajuste fino supervisado (SFT) con LoRA sobre el dataset d4rkninja/tanpo-ops-sft, un conjunto de ejemplos de chat con formato corregido segun la model card del dataset. Los hiperparametros verificados son: metodo LoRA (PEFT) mediante Unsloth FastLanguageModel, cargando el identificador `unsloth/LFM2.5-1.2B-Instruct`; rango LoRA r=16; alpha=16; dropout=0; bias=none; tipo de tarea CAUSAL_LM; y modulos objetivo definidos por expresion regular de Unsloth/PEFT sobre proyecciones de atencion y MLP (segun `adapter_config.json`). El autor indica que el adaptador se fusiono con `merge_and_unload` de PEFT para generar los pesos completos alojados en este repositorio.

No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo etapas adicionales de RLHF o DPO. Tampoco se declaran innovaciones tecnicas propias del ajuste: el valor del artefacto esta en la especializacion de dominio, no en una aportacion arquitectonica.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla de chat (`apply_chat_template` con roles system/user/assistant).
- Borradores de planificacion de capacidad: separacion explicita de hechos, supuestos, restricciones, riesgos y decisiones pendientes.
- Descomposicion de objetivos trimestrales en OKR medibles, con propietarios, dependencias, hitos y cadencia semanal.
- Diseno de traspasos operativos entre equipos y redaccion de procedimientos normalizados (SOP).
- Operaciones con proveedores: checklists y flujos de trabajo asociados.
- Estructuracion de postmortems de incidentes a partir de notas, con la instruccion explicita de no inventar impacto, causa raiz ni remediaciones.
- Flujos conscientes de identidad ("identity-aware operational workflows") y guardrails de identidad, con la mejora reportada mas alta en la evaluacion interna.
- No incluye soporte declarado de tool calling ni function calling en la informacion disponible.
- No se declaran capacidades de vision, audio, ni modo de razonamiento explicito (thinking mode).
- Multilingue: no; el modelo declara unicamente ingles.
- No esta disenado para programacion general ni para conversacion ajena al dominio de operaciones.

## Casos de uso

- Borradores de planes de capacidad: dado un conjunto de supuestos de carga de trabajo, el modelo produce un documento estructurado que distingue hechos verificables, supuestos, restricciones, riesgos y las decisiones que un humano debe tomar. Es adecuado porque el dominio de entrenamiento cubre explicitamente ese esquema y mejoro +5,5 puntos porcentuales sobre la base en esa categoria.
- Despliegue de OKR y cadencia operativa: convertir un objetivo cualitativo en resultados clave medibles con propietarios, dependencias e hitos, y proponer una cadencia de revision semanal. La mejora reportada en `okr_execution` es de +11,1 puntos porcentuales.
- Redaccion de SOP y procedimientos internos: generar borradores de procedimientos con pasos, responsables y criterios de aceptacion, que despues pasan por revision humana antes de publicarse.
- Checklists de operaciones con proveedores: preparar listas de verificacion para alta, renovacion o baja de proveedores, y para revisiones periodicas de cumplimiento contractual. La mejora reportada en `vendor_ops` es de +5,6 puntos porcentuales.
- Estructuracion de postmortems: a partir de notas desordenadas de un incidente, generar un esqueleto de postmortem con secciones y acciones de seguimiento, manteniendo la instruccion de no inventar causas ni impactos. Conviene tener en cuenta que esta categoria se degrada aproximadamente -3,7 puntos porcentuales respecto al modelo base.
- Guardrails de identidad en flujos operativos: redactar y revisar reglas de acceso y verificacion de identidad en procesos internos. Es la categoria con mayor ganancia reportada (+17,1 puntos porcentuales), aunque el autor prohibe explicitamente el uso del modelo para tomar decisiones de acceso automatizadas.
- Asistente local para equipos con datos sensibles: al ejecutarse en una GPU de consumo o incluso en CPU con cuantizacion GGUF, permite procesar notas operativas internas sin enviarlas a una API externa.
- Generacion de documentacion operativa repetitiva: plantillas de actas de revision, resumentes de estado y materiales de traspaso entre turnos o equipos, integrables en un flujo interno de documentacion.

## Benchmarks y rendimiento

La model card incluye una evaluacion interna automatizada ("DarkLab harness") que el propio autor califica de direccional y no de benchmark industrial. Se comparan el modelo base y el ajuste con los mismos prompts y la misma configuracion de generacion.

| Modelo | Rubrica global (evaluacion interna DarkLab) |
|---|---:|
| Base LFM2.5-1.2B-Instruct | 89,5 % |
| tanpo-ops | 90,7 % |
| Delta | +1,2 puntos porcentuales |

| Categoria | Delta de tanpo-ops frente al base |
|---|---:|
| identity | +17,1 pp |
| okr_execution | +11,1 pp |
| vendor_ops | +5,6 pp |
| capacity_planning | +5,5 pp |
| handoffs | -7,4 pp |
| sops | ~-3,7 pp |
| operating_cadence | ~-3,7 pp |
| incident_postmortem | ~-3,7 pp |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor senala como limitaciones de su propia evaluacion que las rubricas automatizadas pueden premiar la estructura sobre la calidad real, que el tamano de muestra es pequeno y que los resultados pueden no transferirse fuera de la distribucion de tareas.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 1,17 mil millones de parametros; incluye solo pesos, sin cache KV): aproximadamente 2,4 GB en FP16/BF16, unos 1,3 GB en cuantizacion de 8 bits y en torno a 0,75-0,8 GB en Q4_K_M. La cache KV para 32.768 tokens depende de la configuracion de capas y cabezas del modelo base, dato no disponible.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM para cuantizaciones de 4-8 bits (por ejemplo GTX 1650 4 GB, RTX 3050, RTX 4060, RTX 4090). Para FP16 sin cuantizar bastan 4 GB de VRAM. El modelo base esta disenado por Liquid AI para despliegue en el borde y en dispositivo, por lo que no requiere A100 ni H100.
- Cabe en GPU de consumo: si, en practicamente toda la gama actual, y tambien en CPU mediante llama.cpp con los GGUF publicados por el autor.
- Opciones de despliegue: Transformers (el ejemplo de la model card usa `AutoModelForCausalLM` con `trust_remote_code=True` y `device_map="auto"`), llama.cpp/Ollama a partir del repositorio GGUF, y cargadores compatibles con PEFT si se usa el adaptador LoRA en lugar de los pesos fusionados. No se menciona compatibilidad explicita con vLLM ni TGI en la informacion disponible.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Rendimiento comparable |
|---|---|---|---|---|---|
| d4rkninja/tanpo-ops | 1,17 B | 32.768 tokens | safetensors (fusionado), LoRA, GGUF | other | 90,7 % en rubrica interna DarkLab |
| LiquidAI/LFM2.5-1.2B-Instruct (base) | ~1,17 B | 32.768 tokens | safetensors (upstream) | no disponible en la informacion proporcionada | 89,5 % en la misma rubrica interna |
| d4rkninja/tanpo-ops-LoRA | ~1,17 B (base + adaptador r=16) | 32.768 tokens | adaptador PEFT | other | no disponible |
| d4rkninja/tanpo-ops-GGUF | ~1,17 B | 32.768 tokens | GGUF | other | no disponible |
| Modelos generalistas de tamano similar (por ejemplo alternativas de 1-2 B) | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de benchmark de terceros, por lo que no es posible establecer una comparacion cuantitativa con modelos generalistas de la misma escala. La unica comparacion con datos es la del ajuste frente a su propio modelo base.

## Limitaciones y advertencias

- El autor prohibe explicitamente el uso del modelo para decisiones operativas consecuentes totalmente automatizadas: dotacion de personal, control de acceso, seleccion o baja de proveedores y determinacion de severidad de incidentes.
- Tambien prohibe fabricar hechos operativos, la suplantacion de identidad, eludir controles de identidad y el acceso no autorizado.
- El modelo no ofrece garantias sobre capacidad, disponibilidad, cumplimiento normativo, resultados de incidentes ni rendimiento de negocio, segun su propia model card.
- Riesgo de alucinacion: relevante en un dominio donde las cifras de capacidad, los plazos y las causas raiz deben ser exactos. La model card insiste en instruir al modelo para que no invente impacto, causa raiz ni remediaciones, lo que indica que sin esa instruccion puede hacerlo.
- Degradacion medida frente al modelo base en `handoffs` (-7,4 puntos porcentuales) y en `sops`, `operating_cadence` e `incident_postmortem` (aproximadamente -3,7 puntos porcentuales cada una). Si el caso de uso principal cae en esas categorias, el ajuste puede ser peor opcion que el modelo base.
- La mejora global es marginal (+1,2 puntos porcentuales) y procede de una evaluacion interna automatizada, con muestra pequena, prompts propios y sin validacion externa.
- Solo soporta ingles. No hay soporte declarado de castellano ni de otras lenguas.
- Es un especialista de dominio: no debe usarse para programacion general ni para conversacion ajena a operaciones.
- Licencia declarada como "other" sin terminos detallados en el repositorio. Es imprescindible verificar la licencia del modelo base LiquidAI/LFM2.5-1.2B-Instruct antes de cualquier uso comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad ni resultados reproducidos por terceros.
- La seccion de limitaciones de la model card aparece truncada en la informacion disponible ("Specialized: quality dr..."), por lo que puede haber advertencias adicionales del autor no recogidas aqui.
- El uso del ejemplo de inferencia requiere `trust_remote_code=True`, lo que implica ejecutar codigo remoto del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/d4rkninja/tanpo-ops
- Adaptador LoRA: https://huggingface.co/d4rkninja/tanpo-ops-LoRA
- Cuantizaciones GGUF: https://huggingface.co/d4rkninja/tanpo-ops-GGUF
- Dataset de ajuste SFT: https://huggingface.co/datasets/d4rkninja/tanpo-ops-sft
- Coleccion Tanpo — Domain Specialists: https://huggingface.co/collections/d4rkninja/tanpo-domain-specialists-6aaccdb3985768f6dad8449b
- Perfil del autor: https://huggingface.co/d4rkninja
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Checkpoint base compatible con Unsloth: https://huggingface.co/unsloth/LFM2.5-1.2B-Instruct
- Informe de evaluacion comparativa del autor: https://huggingface.co/d4rkninja/tanpo-ops/blob/main/evaluation/COMPARE_OPS.md
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a servicios de traduccion sin relacion con el artefacto.
