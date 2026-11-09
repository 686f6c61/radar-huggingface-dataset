# liodon-ai/Meta-Llama-3-8B-Instruct-abliterated-v3-GGUF

## Resumen

Meta-Llama-3-8B-Instruct-abliterated-v3-GGUF es una distribucion de cuantizaciones GGUF del modelo failspy/Meta-Llama-3-8B-Instruct-abliterated-v3, publicada por Liodon AI. No se trata de un modelo entrenado desde cero, sino de una conversion a formato GGUF del checkpoint abliterated de Llama 3 8B Instruct, pensada para su ejecucion local en llama.cpp, Ollama, LM Studio y Jan. El modelo subyacente deriva de Meta-Llama-3-8B-Instruct, un transformer denso de 8.030.261.248 parametros con contexto nativo de 8.192 tokens (segun la especificacion original de Llama 3, aunque la model card de esta distribucion no lo explicita).

La relevancia de esta publicacion es practica: ofrece el modelo en siete niveles de cuantizacion (de Q2_K a Q8_0) con tamanos que van de 3,18 GB a 8,54 GB, lo que permite desplegarlo en GPUs de consumo con 6-10 GB de VRAM. La variante "abliterated" implica que el checkpoint base ha sido modificado para eliminar la direccion de rechazo en el espacio de activaciones, de modo que el modelo responde a peticiones que el Llama 3 Instruct original declinaria.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, esta etiquetado con licencia "other" (con tag adicional license:llama3) y no declara idiomas soportados. Conviene tratar esta distribucion como un artefacto de conveniencia para inferencia local, no como un modelo con garantias de calidad propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), derivado de Llama 3 8B Instruct |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card de esta distribucion (el Llama 3 8B Instruct original soporta 8.192 tokens) |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | other (con tag license:llama3; el modelo base declara "other") |
| Formato de pesos | GGUF |
| Tamano del repo | 37,6 GB |
| Modelo base | failspy/Meta-Llama-3-8B-Instruct-abliterated-v3 |
| Relacion con el base | quantized |
| Libreria | gguf |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3 8B Instruct: un transformer decoder-only denso con atencion multi-cabeza agrupada (GQA), normalizacion RMSNorm y activacion SwiGLU, entrenado originalmente por Meta sobre un corpus multilingue de varios billones de tokens y posteriormente alineado con SFT y RLHF. Sobre ese checkpoint, failspy aplico la tecnica de "abliteration", que identifica y sustrae la direccion de rechazo en el espacio de activaciones para reducir la tasa de negativas del modelo alineado; la version v3 corresponde a la tercera iteracion de ese procedimiento.

Esta publicacion de Liodon AI no aporta entrenamiento adicional: es exclusivamente un proceso de conversion y cuantizacion a GGUF. La model card no documenta el numero de tokens de calibracion, la composicion del dataset ni detalles del pipeline de cuantizacion mas alla de la tabla de quants; tampoco se especifica si se empleo calibracion iMatrix (se remite a un repositorio separado para esas variantes). No hay informacion disponible sobre innovaciones tecnicas adicionales en esta distribucion.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Llama 3 8B Instruct.
- Razonamiento basico y resolución de problemas de complejidad media.
- Generacion de codigo y matematicas a nivel de modelo de 8B, sin garantias de precision en tareas largas.
- Respuestas a peticiones que el Llama 3 Instruct original rechazaria, por efecto de la ablacion del comportamiento de rechazo.
- Ejecucion local offline en CPU y GPU mediante llama.cpp, Ollama, LM Studio y Jan.
- Compatibilidad con endpoints (tag endpoints_compatible) para servir el modelo mediante APIs compatibles con OpenAI.
- Soporte de tool calling / function calling: no documentado en esta distribucion.
- Capacidades de agente y razonamiento multi-paso: no documentadas especificamente.
- Capacidades multimodales (vision, audio): no disponibles; es un modelo exclusivamente de texto.

## Casos de uso

- Inferencia local en portatil con GPU de 6-8 GB: usar el quant Q4_K_M (4,92 GB, ~6 GB de VRAM) o Q3_K_M (4,02 GB, ~5 GB) para tener un asistente conversacional que funcione sin conexion.
- Prototipado de aplicaciones de chat en LM Studio o Jan: cargar el GGUF directamente desde el buscador integrado y validar prompts y flujos antes de pasar a un despliegue con GPU dedicada.
- Servicio de API local con Ollama: `ollama run hf.co/liodon-ai/...:Q4_K_M` levanta un endpoint compatible con clientes OpenAI, util para integrar el modelo en herramientas de desarrollo sin coste de API.
- Experimentacion en investigacion sobre alineacion y rechazo: la variante abliterated permite estudiar como cambia el comportamiento del modelo al eliminar la direccion de rechazo, comparandolo con el Llama 3 Instruct original.
- Generacion de texto en entornos con requisitos de privacidad: al ejecutarse en local, los datos no salen del equipo, adecuado para borradores y resumenes de documentos sensibles.
- Evaluacion de cuantizaciones: el repositorio ofrece siete niveles de quant con tamanos y VRAM estimada, lo que permite medir la degradacion de calidad entre Q2_K y Q8_0 en tareas concretas.
- Integracion en pipelines de CI/CD para generacion de texto auxiliar (mensajes de commit, documentacion): via llama.cpp con el binario `llama-cli` y el flag `-hf`, sin dependencias de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica de evaluacion, ni para el modelo cuantizado ni para el checkpoint base.

## Requisitos de hardware

- VRAM estimada por cuantizacion (segun la model card): Q2_K ~4 GB, Q3_K_M ~5 GB, Q4_0 ~5 GB, Q4_K_M ~6 GB, Q5_K_M ~7 GB, Q6_K ~8 GB, Q8_0 ~10 GB.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores con Q4_K_M o Q5_K_M; en GPUs de 8 GB es recomendable Q3_K_M o Q4_K_M con offload parcial.
- GPU de datacenter: A100, H100 y L40S ejecutan sin problema cualquier quant, incluido Q8_0, con margen para contexto largo.
- CPU: viable en modo solo CPU con llama.cpp, especialmente con Q2_K y Q3_K_M, a costa de latencia mayor.
- Opciones de despliegue: llama.cpp (`llama-cli -hf ...`), Ollama (`ollama run hf.co/...`), LM Studio, Jan y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles; la model card no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| liodon-ai/Meta-Llama-3-8B-Instruct-abliterated-v3-GGUF | 8,03B | no disponible en la card | GGUF | other (tag llama3) | Hugging Face, 0 descargas |
| failspy/Meta-Llama-3-8B-Instruct-abliterated-v3 | 8,03B | no disponible en la card | safetensors (formato inferido del base) | other | Hugging Face (modelo base) |
| Meta-Llama-3-8B-Instruct | 8,03B | 8.192 tokens | safetensors, GGUF oficiales | Llama 3 Community License | Hugging Face, ampliamente desplegado |

La comparativa se limita a estos tres artefactos porque la informacion disponible no incluye datos de rendimiento que permitan contrastar con otras familias (Mistral, Qwen, Gemma) de forma rigurosa.

## Limitaciones y advertencias

- La ablacion del rechazo elimina barreras de seguridad del modelo alineado: puede generar contenido danino, sesgado o inapropiado sin las salvaguardas del Llama 3 Instruct original. No es apto para aplicaciones de cara al publico sin filtros adicionales.
- Riesgo de alucinacion inherente a un modelo de 8B: puede inventar hechos, citas y APIs con fluidez.
- La model card no declara idiomas soportados ni longitud de contexto; no asumir el contexto de 8.192 tokens sin verificarlo en el runtime.
- Licencia "other" con tag license:llama3: el uso comercial queda sujeto a los terminos de la Llama 3 Community License del modelo base, que incluyen restricciones de escala y obligaciones de atribucion. Verificar antes de desplegar en produccion.
- Repositorio sin descargas ni validacion de la comunidad: no hay evidencia publica de calidad de las cuantizaciones ni de fidelidad respecto al checkpoint base.
- Sin soporte documentado de tool calling ni de modo thinking; no disenado para flujos de agente complejos.
- El tag endpoints_compatible sugiere compatibilidad con APIs tipo OpenAI, pero no se documenta el procedimiento de despliegue en servidor.
- Fecha de creacion y actualizacion del repositorio (2026-11-09) posteriores a la consulta: verificar que el contenido no haya cambiado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/liodon-ai/Meta-Llama-3-8B-Instruct-abliterated-v3-GGUF
- Modelo base: https://huggingface.co/failspy/Meta-Llama-3-8B-Instruct-abliterated-v3
- Variante con calibracion iMatrix (mencionada en la card): https://huggingface.co/liodon-ai/Meta-Llama-3-8B-Instruct-abliterated-v3-imatrix-GGUF
- Perfil del autor: https://huggingface.co/liodon-ai
