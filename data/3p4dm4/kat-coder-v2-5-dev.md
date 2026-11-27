# 3p4dm4/KAT-Coder-V2.5-Dev

## Resumen

KAT-Coder-V2.5-Dev es un modelo de lenguaje especializado en generacion de codigo y flujos de trabajo agénticos, publicado como pesos abiertos por el usuario 3p4dm4 en Hugging Face. Se trata de un ajuste fino (post-entrenamiento mediante SFT y RL) sobre el modelo base Qwen/Qwen3.6-35B-A3B, del que hereda su arquitectura Mixture-of-Experts (MoE) con 34.660.610.688 parametros totales y aproximadamente 3B parametros activos por token.

El modelo esta disenado para tareas de "agentic coding": resolucion de issues en repositorios reales, uso de herramientas (tool calling), razonamiento multi-paso y generacion de parches de codigo. Segun la model card, alcanza resultados SOTA entre modelos de escala similar en el ambito de Agentic Coding, con mejoras notables en SWE-bench Verified (69,40) y SWE-bench Multilingual (63,00) frente a alternativas como Qwen3.5-27B, Qwen3.6-35BA3B, Gemma4-31B y Qwen3-Coder-30B.

Es relevante ahora porque combina un tamano total de 35B con solo 3B parametros activos, lo que reduce drasticamente el coste de inferencia frente a modelos densos equivalentes, y porque se distribuye bajo licencia Apache 2.0, permitiendo uso comercial sin restricciones adicionales. La release es unicamente de pesos del modelo de lenguaje: no incluye componentes de vision ni multimodalidad, a pesar de que el tag `image-text-to-text` aparezca en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en Qwen3.6-35B-A3B (transformers, `qwen3_5_moe`) |
| Parametros totales | 34.660.610.688 (~35B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantizacion estandar via vLLM/SGLang/KTransformers) |
| Idiomas soportados | en, zh (segun model card y tags) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato Hugging Face Transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer con arquitectura Mixture-of-Experts (MoE), heredada directamente de Qwen/Qwen3.6-35B-A3B. Cuenta con 34.660.610.688 parametros totales y activa aproximadamente 3B parametros por token, lo que lo situa en la categoria de modelos MoE de escala media con coste de inferencia reducido. El identificador de arquitectura en Transformers es `qwen3_5_moe`.

El post-entrenamiento se realizo en dos fases: Supervised Fine-Tuning (SFT) y Reinforcement Learning (RL). Segun la model card, el RL se utilizo especificamente para corregir comportamientos anomalos: las etiquetas de herramienta anomalas se redujeron un 9% (de 9,34% a 0,28%) y la repeticion continua en un solo turno se elimino por completo (de 0,34% a 0%). No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni detalles sobre la recompensa o el algoritmo de RL empleado. El repositorio incluye un informe tecnico con identificador arXiv:2607.05471.

## Capacidades

- Generacion de codigo en multiples lenguajes, orientada a tareas de reparacion y completado en repositorios reales.
- Razonamiento agéntico multi-paso: planificacion, ejecucion y verificacion de subtareas.
- Tool calling / function calling, con etiquetado de herramientas optimizado mediante RL (reduccion de errores de etiqueta del 9,34% al 0,28%).
- Agentic coding: resolucion de issues tipo SWE-bench, generacion de parches y edicion de ficheros.
- Capacidades multilingues limitadas a ingles y chino segun la model card.
- Generacion de texto conversacional y text-generation en general.
- Soporte de despliegue en vLLM, SGLang y KTransformers, ademas de Transformers.
- Modelo exclusivamente de texto: no incluye vision ni audio, pese al tag `image-text-to-text` del repositorio.

## Casos de uso

- Resolucion automatica de issues en repositorios: el modelo puede recibir el contexto de un issue y el arbol del repositorio, planificar la correccion y generar un parche verificable, aprovechando su rendimiento de 69,40 en SWE-bench Verified.
- Agentes de codigo en CI/CD: integrado como paso de un pipeline que detecta fallos de tests, propone correcciones y las valida mediante tool calling, con la ventaja de su bajo coste de inferencia (3B parametros activos).
- Asistente de refactorizacion multi-fichero: capaz de editar varios ficheros de forma coherente en una sola sesion gracias a su entrenamiento en tareas agénticas de edicion.
- Generacion de tests unitarios y parches de cobertura: el modelo puede inspeccionar funciones existentes y producir tests con llamadas a herramientas para ejecutarlos.
- Migracion de codigo entre lenguajes o frameworks: su resultado de 63,00 en SWE-bench Multilingual indica capacidad para trabajar en repositorios con mezcla de lenguajes.
- Automatizacion de revision de codigo en pull requests: analisis de diffs, deteccion de errores y sugerencia de cambios mediante function calling sobre APIs de Git.
- Despliegue en entornos con GPU limitada: al activar solo ~3B parametros, puede servirse en hardware consumer de gama alta con cuantizacion, lo que lo hace viable para equipos pequenos.

## Benchmarks y rendimiento

Resultados publicados en la model card (categoria Coding Agent):

| Benchmark | KAT-Coder-V2.5-Dev | Qwen3.5-27B | Qwen3.6-35BA3B | Gemma4-31B | Qwen3.5-35BA3B | Ornith-1.0-35B | Gemma4-26BA4B | Qwen3-Coder-30B |
|---|---|---|---|---|---|---|---|---|
| SWE-bench Verified | 69,40 | 68,60 | 64,40 | 60,60 | 58,60 | 55,80 | 35,80 | 31,80 |
| SWE-bench Multilingual | 63,00 | 57,67 | 57,00 | 49,33 | 47,xx (truncado) | no disponible | no disponible | no disponible |

Nota: la tabla de la model card aparece truncada en la informacion proporcionada para las columnas Qwen3.5-35BA3B, Ornith-1.0-35B, Gemma4-26BA4B y Qwen3-Coder-30B en la fila de SWE-bench Multilingual; solo se dispone del valor parcial de Qwen3.5-35BA3B (47,...). No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 70 GB para los pesos completos (el repositorio ocupa 69,3 GB), por lo que requiere multiples GPU o una GPU de 80 GB.
- Cuantizacion a 8 bits: ~35 GB de VRAM, viable en una A100 40GB o H100.
- Cuantizacion a 4 bits: ~18-20 GB de VRAM, viable en una RTX 4090 (24 GB) o RTX 3090.
- GPU recomendadas: A100 80GB, H100 80GB para BF16; A100 40GB o L40S para 8 bits; RTX 4090/3090 para 4 bits.
- Si cabe en GPU consumer: si, en RTX 4090/3090 con cuantizacion de 4 bits; en BF16 no cabe en ninguna GPU consumer actual.
- Opciones de despliegue: Transformers, vLLM, SGLang, KTransformers (segun la model card).
- Latencia y throughput: no disponibles en la informacion proporcionada; al activar solo ~3B parametros por token, se espera un throughput superior al de un modelo denso de 35B, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| KAT-Coder-V2.5-Dev | ~35B | ~3B | no disponible | 69,40 | Apache 2.0 | Hugging Face (pesos abiertos) |
| Qwen3.6-35B-A3B (base) | ~35B | ~3B | no disponible | 64,40 | no disponible en la informacion | Hugging Face |
| Qwen3.5-27B | 27B | denso | no disponible | 68,60 | no disponible en la informacion | Hugging Face |
| Qwen3-Coder-30B | 30B | denso | no disponible | 31,80 | no disponible en la informacion | Hugging Face |

KAT-Coder-V2.5-Dev supera a su modelo base en SWE-bench Verified (+5,0 puntos) y en SWE-bench Multilingual (+6,0 puntos frente a Qwen3.6-35BA3B), y se situa por delante de Qwen3.5-27B y Qwen3-Coder-30B en la misma metrica. La principal ventaja competitiva es la combinacion de rendimiento agéntico alto con un coste de inferencia bajo gracias a la activacion de solo ~3B parametros.

## Limitaciones y advertencias

- Modelo exclusivamente de texto: no incluye vision ni audio, aunque el repositorio lleve el tag `image-text-to-text`; el autor lo aclara explicitamente en la model card.
- Idiomas soportados limitados a ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Longitud de contexto no especificada en la informacion disponible; no se puede garantizar el manejo de contextos largos en produccion sin verificacion previa.
- Riesgo de alucinacion inherente a los modelos de lenguaje; en tareas de codigo puede generar APIs o funciones inexistentes, por lo que se recomienda validacion automatica (tests, linters) antes de aplicar parches.
- Sesgos no documentados: la model card no detalla analisis de sesgos ni evaluaciones de seguridad.
- Aunque la licencia es Apache 2.0 (permite uso comercial), conviene revisar las condiciones del modelo base Qwen3.6-35B-A3B, ya que la licencia final depende de la compatibilidad con la del upstream.
- Version "Dev": el sufijo indica una release de desarrollo, sin garantias de estabilidad ni soporte a largo plazo.
- Sin descargas ni likes en el momento de la consulta (0 descargas, 0 likes), lo que sugiere un modelo recien publicado y sin validacion independiente por la comunidad.
- El rendimiento reportado procede del propio autor; no se dispone de evaluaciones de terceros que lo confirmen.

## Enlaces

- Hugging Face: https://huggingface.co/3p4dm4/KAT-Coder-V2.5-Dev
- Informe tecnico (arXiv): https://huggingface.co/papers/2607.05471
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Imagen de benchmarks: https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev/resolve/main/KAT-Coder-V2.5-Dev-Benchmarks.png
