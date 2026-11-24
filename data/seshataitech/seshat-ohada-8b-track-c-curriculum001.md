# seshataitech/Seshat-ohada-8B-track-c-curriculum001

## Resumen

Seshat-ohada-8B Track C es un ajuste fino (finetune) del modelo Qwen3-8B orientado a la asistencia contable bajo el marco normativo SYSCOHADA, el sistema de contabilidad aplicable en la mayoria de paises de Africa Occidental y Central. Lo desarrolla el usuario `seshataitech` y se distribuye con licencia Apache 2.0. El modelo esta disenado para redactar asientos contables, explicar conceptos de contabilidad y solicitar los datos de transaccion que falten antes de proponer un registro.

Se trata de un checkpoint completo de aproximadamente 8.190 millones de parametros (8B densos, sin mezcla de expertos), heredero directo de la arquitectura Qwen3, con pesos en safetensors y un tamano de repositorio de 32,8 GB. La model card lo describe como experimental y su idioma declarado es exclusivamente el frances, coherente con el ambito linguistico de SYSCOHADA. La relevancia actual reside en su especializacion vertical: no compite en capacidad generalista, sino en adaptar un modelo base solido a un dominio contable muy concreto y poco cubierto por los modelos generales.

El modelo se publica junto a un adaptador separado (Track D, referencia D003) y una demo interactiva en Spaces. El dataset de entrenamiento es privado y no se han publicado resultados de benchmarks estandar, por lo que la evaluacion disponible se limita a las cifras internas que reporta el autor sobre dossiers de desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos originales en safetensors; el repo ocupa 32,8 GB, compatible con cuantizacion posterior a GGUF/AWQ mediante herramientas externas) |
| Idiomas soportados | frances (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors + tokenizer (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-8B, un transformer decoder-only denso de unos 8.200 millones de parametros. El ajuste es un finetune completo (no un adaptador LoRA fusionado ni un modelo MoE), segun indica la relacion `base_model_relation: finetune` en la model card. No se especifican en la informacion disponible ni el numero de tokens de entrenamiento, ni la composicion del dataset (que el autor declara privado), ni si se emplearon tecnicas de RLHF, DPO o SFT exclusivamente. Tampoco se documenta si se aplicaron innovaciones tecnicas adicionales sobre el modelo base.

La unica informacion sobre el procedimiento es la referencia a un "curriculum" en el nombre del checkpoint (`curriculum001`), lo que sugiere un entrenamiento por fases o con dificultad progresiva, aunque no se detalla el esquema. El modelo se distribuye con una revision fija (`4ad92487223098babf3124f2b2bae5bb500bf325`) y se indica cargarlo con `AutoTokenizer` y `AutoModelForCausalLM`, aplicando la plantilla de conversacion del tokenizer con `add_generation_prompt=True` y `enable_thinking=False`.

## Capacidades

- Generacion de texto en frances orientada al dominio contable.
- Redaccion y propuesta de asientos contables (journal entries) bajo SYSCOHADA.
- Explicacion de conceptos contables y normativos.
- Solicitud activa de datos faltantes de una transaccion antes de proponer un registro (comportamiento de clarificacion).
- Extraccion estructurada de informacion: la model card reporta 7 de 8 casos superados en extraccion estructurada.
- Conversacion multi-turno mediante la plantilla de chat del tokenizer.
- Compatibilidad con text-generation-inference y endpoints compatibles (tags del repo).
- No se documentan capacidades de vision, audio, tool calling ni modo de razonamiento extendido (el propio autor recomienda `enable_thinking=False`).

## Casos de uso

- Redaccion asistida de asientos contables: el modelo propone la cuenta, el importe y la fecha a partir de la descripcion de una transaccion, y el contable revisa y valida antes de registrarla. Es adecuado por su ajuste especifico al plan SYSCOHADA.
- Formacion de auxiliares contables: sirve como tutor para explicar conceptos normativos y resolver ejercicios practicos, uso que el propio autor declara como previsto.
- Extraccion estructurada de datos desde texto libre: convertir descripciones de facturas o movimientos en campos normalizados (cuenta, importe, divisa, fecha) para alimentar un ERP.
- Deteccion de informacion incompleta: el modelo pregunta por los datos que faltan (importe, fecha, evidencia de soporte) antes de emitir una propuesta, lo que encaja en flujos de validacion previa.
- Pre-revision de borradores contables: generar una propuesta y contrastarla con las reglas internas de la empresa antes de su aprobacion, reduciendo el trabajo manual de primer borrador.
- Soporte interno en departamentos financieros de paises de la zona SYSCOHADA: respuestas en frances sobre tratamiento de operaciones, con revision humana obligatoria segun advierte el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor solo reporta evaluaciones internas sobre dossiers de desarrollo:

| Evaluacion interna | Resultado |
|---|---|
| Dossiers de desarrollo superados (FP32) | 21 de 48 |
| Casos de extraccion estructurada superados | 7 de 8 |

## Requisitos de hardware

- VRAM estimada en FP16/BF16: en torno a 16-17 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 24 GB para inferencia comoda.
- En FP32 (configuracion evaluada por el autor): aproximadamente 33 GB de pesos, lo que exige GPU de 40 GB o superior (A100 40/80 GB, H100).
- Cuantizacion a 8 bits: alrededor de 9-10 GB, viable en RTX 3090/4090 (24 GB) con margen.
- Cuantizacion a 4 bits (GGUF Q4): aproximadamente 5-6 GB, cabe en GPU consumer de 8-12 GB (RTX 3060 12 GB, RTX 4070) y en equipos con 16 GB de RAM mediante CPU.
- Despliegue: transformers nativo, text-generation-inference (soportado segun tags), vLLM y llama.cpp/Ollama tras conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Seshat-ohada-8B Track C | 8,19B | no disponible | fr | Apache 2.0 | Contabilidad SYSCOHADA (finetune) |
| Qwen/Qwen3-8B (base) | ~8,2B | no disponible en esta ficha | multilingue | Apache 2.0 | Proposito general |
| Modelos contables especializados en frances | no disponible | no disponible | no disponible | no disponible | No se dispone de comparables documentados en la informacion |

La comparacion directa mas util es con su modelo base Qwen3-8B: Seshat-ohada anade especializacion en SYSCOHADA y restringe el idioma al frances, a costa de perder capacidades generalistas y multilingues del original. No se conocen en la informacion disponible otros finetunes publicos dedicados a SYSCOHADA con los que contrastar.

## Limitaciones y advertencias

- Modelo experimental: el autor lo califica explicitamente como tal y lo destina a analisis de borradores y ejercicios de formacion, no a registro contable definitivo.
- Tasa de acierto limitada: solo 21 de 48 dossiers de desarrollo superados, es decir, menos de la mitad; no debe usarse sin revision humana.
- Riesgo de alucinacion en cuentas, importes, fechas y divisas: la propia model card exige verificar estos campos y la evidencia de soporte.
- Idioma restringido al frances; no se garantiza un rendimiento adecuado en castellano ni en otras lenguas.
- Dataset de entrenamiento privado, lo que impide auditar sesgos, cobertura normativa y posibles datos contaminados.
- Longitud de contexto no documentada; conviene no asumir ventanas largas en produccion.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantias y la naturaleza experimental del ajuste trasladan al integrador toda la responsabilidad sobre errores contables.
- Sin resultados de benchmarks publicos ni comparativas independientes; las unicas cifras proceden del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seshataitech/Seshat-ohada-8B-track-c-curriculum001
- Adaptador Track D (D003): https://huggingface.co/seshataitech/Seshat-ohada-8B-track-d-d003
- Demo interactiva: https://huggingface.co/spaces/seshataitech/Seshat-ohada-demo
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
