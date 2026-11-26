# atamtensor/d3-flash-adx3

## Resumen

Zils d3-flash body (adjudex-9b-v3) es un checkpoint publicado por el usuario atamtensor en Hugging Face bajo el identificador `atamtensor/d3-flash-adx3`. No se trata de un modelo entrenado desde cero, sino de una copia sin modificar de los pesos de `newsbang/adjudex-9b-v3`, que a su vez es un fine-tune de Qwen/Qwen3.5-9B. El autor lo presenta como un "body" (cuerpo base) para el sistema de mezcla de modelos (model soup) denominado d3-flash, orientado a Zils, un subred de Bittensor (subnet 127).

El modelo cuenta con 8.392.695.024 parametros en formato safetensors, lo que lo situa en la categoria de 8-9B, con un repositorio de 16,8 GB (compatible con pesos en precision de 16 bits). La arquitectura declarada en los metadatos es `qwen3_5`, es decir, la familia Qwen3.5, aunque la model card no detalla configuracion de capas, atencion ni longitud de contexto.

La relevancia de esta ficha es limitada pero concreta: sirve como referencia para quien necesite identificar el origen exacto de los pesos de un candidato dentro del ecosistema Zils/Bittensor, y como aviso de que el repositorio no aporta entrenamiento adicional, documentacion tecnica propia ni resultados de evaluacion. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (familia Qwen3.5, transformer; detalles de capas no disponibles) |
| Parametros totales | 8.392.695.024 |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Los pesos corresponden a `newsbang/adjudex-9b-v3` (revision `8669d4db8484dacf50eb5adbe9684d66c1bd5195`), un fine-tune de Qwen/Qwen3.5-9B (revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a`). El autor de este repositorio no ha realizado ningun entrenamiento: la model card indica explicitamente "unchanged weights", es decir, pesos sin modificar, presentados como cuerpo base para la mezcla d3-flash de Zils (Bittensor subnet 127). Por tanto, la arquitectura efectiva es la de Qwen3.5-9B, pero la informacion proporcionada no incluye el numero de capas, el tipo de atencion, la composicion del dataset de preentrenamiento ni si hubo RLHF, DPO o etapas de alineamiento en el fine-tune intermedio.

No se dispone de datos sobre tokens de entrenamiento, mezcla de datos, innovaciones tecnicas (atencion lineal, decodificacion especulativa, modos de razonamiento) ni sobre el proceso de souping al que se destina el checkpoint. Cualquier afirmacion sobre estas cuestiones requeriria consultar la model card de `newsbang/adjudex-9b-v3` y la de Qwen3.5-9B, que no forman parte de la informacion disponible.

## Capacidades

- Generacion de texto y modelado de lenguaje general, heredados del linaje Qwen3.5-9B y del fine-tune adjudex-9b-v3.
- Capacidad de razonamiento y respuesta conversacional multi-turno, sujeta a las caracteristicas no documentadas del modelo base.
- Posible soporte de tool calling y function calling si el modelo base lo incorpora; no confirmado en la informacion disponible.
- Posible soporte de agentes y razonamiento multi-paso; no confirmado en la informacion disponible.
- Cobertura multilingue no especificada.
- No se declaran capacidades de vision, audio ni modos de pensamiento explicitos.

## Casos de uso

- Evaluacion de linaje de pesos: util para verificar que un candidato de la subnet 127 de Bittensor corresponde exactamente a los pesos de adjudex-9b-v3, gracias al identificador de revision incluido en la model card.
- Punto de partida para model souping: sirve como "body" en la mezcla d3-flash, de modo que otros participantes puedan combinarlo con cabezas o adaptadores sin partir de cero.
- Reproducibilidad de experimentos: al fijar la revision `8669d4db8484dacf50eb5adbe9684d66c1bd5195`, permite replicar resultados de mezclas y comparaciones entre candidatos.
- Fine-tuning posterior controlado: al ser pesos sin modificar con licencia Apache-2.0, se puede usar como base para ajustes supervisados o LoRA en dominios especificos, siempre que se valide antes su comportamiento real.
- Despliegue en inferencia de 8-9B: el tamano (8,39B parametros, repo de 16,8 GB) encaja en GPUs de 24 GB en precision de 16 bits con cuantizacion ligera, o en configuraciones multi-GPU para servicio concurrente.
- Auditoria de licencias en pipelines de produccion: la licencia Apache-2.0 y la trazabilidad del modelo base facilitan la revision legal antes de integrar el checkpoint en productos comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16,8 GB solo para los pesos en precision de 16 bits, mas memoria para el contexto y el estado de atencion; en cuantizacion de 8 bits se reduciria a unos 8-9 GB y en 4 bits a unos 4-5 GB, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para servicio en 16 bits; RTX 4090 (24 GB) puede alojar los pesos en 16 bits con contexto limitado.
- Cabe en GPU de consumo: si, en RTX 4090 y potencialmente en RTX 3090 (24 GB) o GPUs de 16 GB con cuantizacion, siempre que se generen los pesos cuantizados a partir de los safetensors originales.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama, previa conversion a los formatos correspondientes, ya que el repositorio solo contiene safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| atamtensor/d3-flash-adx3 | 8,39B | no disponible | Apache-2.0 | Hugging Face, safetensors |
| newsbang/adjudex-9b-v3 (modelo base) | ~9B (no verificado) | no disponible | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-9B (modelo raiz) | ~9B (no verificado) | no disponible | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- El repositorio no aporta entrenamiento propio: es una copia de pesos, por lo que cualquier merito o defecto proviene de adjudex-9b-v3 y de Qwen3.5-9B.
- Ausencia total de documentacion tecnica: no hay informacion sobre contexto, idiomas, alineamiento ni evaluaciones, lo que impide garantizar su comportamiento en produccion.
- Riesgo de alucinacion y sesgos no evaluado; al no publicarse benchmarks ni analisis de seguridad, no se puede acotar su comportamiento en dominios sensibles.
- Sin cuantizaciones oficiales publicadas: quien quiera desplegarlo en hardware limitado tendra que generar los GGUF u otros formatos por su cuenta y validar la calidad resultante.
- Uso comercial permitido por Apache-2.0, pero conviene revisar los ficheros LICENSE y NOTICE del repositorio y las condiciones de los modelos base encadenados.
- Popularidad nula en el momento de la consulta (0 descargas, 0 likes), lo que reduce la probabilidad de encontrar soporte comunitario o incidencias resueltas.
- La finalidad declarada (souping en Bittensor subnet 127) implica que el checkpoint puede quedar obsoleto o sustituido por otras revisiones dentro del ecosistema Zils.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/atamtensor/d3-flash-adx3
- Modelo base: https://huggingface.co/newsbang/adjudex-9b-v3
- Modelo raiz: https://huggingface.co/Qwen/Qwen3.5-9B
- Revision del modelo base citada: `8669d4db8484dacf50eb5adbe9684d66c1bd5195`
- Revision de Qwen3.5-9B citada: `c202236235762e1c871ad0ccb60c8ee5ba337b9a`
