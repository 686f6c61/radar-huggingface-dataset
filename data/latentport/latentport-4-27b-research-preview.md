# latentport/latentport-4-27b-research-preview

## Resumen

LatentPort-4+27B es un puente (bridge) de transferencia de estado latente que compone dos modelos Qwen: Qwen3.5-4B y Qwen3.8-27B. Lo desarrolla el usuario `latentport` y se publica como vista previa de investigación (`research-preview`). La idea central es que el modelo pequeno (4B) procesa el prompt completo, incluida la pregunta, y el puente traduce su estado de trabajo al espacio de estados del modelo grande (27B), de modo que este ultimo puede empezar a generar la respuesta sin haber procesado el prompt por si mismo.

El repositorio no contiene pesos completos de un modelo, sino los tensores del puente: pesos aprendidos de traduccion de atencion K/V, pesos congelados para estado convolucional, recurrente y oculto, y un adaptador del estado oculto terminal. Los pesos de los dos modelos Qwen se descargan por separado. El tamano del repo (2,6 GB) corresponde a esos tensores de puente, no a los 27B del modelo base.

Es relevante porque plantea una via distinta al escalado habitual: en lugar de entrenar o destilar un modelo grande, se reutiliza un modelo pequeno como "lector" y se transfiere su estado interno a uno grande como "generador". Es una propuesta experimental, sin benchmarks publicados ni pipeline declarado, y requiere un runtime compatible con LatentPort que no forma parte de este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Composicion de dos modelos Qwen (4B y 27B) mediante puente de transferencia de estado latente; arquitectura interna de los base no disponible en la informacion |
| Parametros totales | No disponible (el repo del puente ocupa 2,6 GB; los modelos base son Qwen3.5-4B y Qwen3.8-27B) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; existe un companion GGUF con la codificacion de los tensores del puente |
| Idiomas soportados | Ingles (`en`) |
| Licencia | No disponible (`LICENSE_STATUS.md` referenciado en la model card, sin contenido publicado en la informacion) |
| Formato de pesos | safetensors (`bridge/kv.safetensors`, `bridge/parent.safetensors`, `bridge/h.safetensors`) y GGUF en repositorio companion |

## Arquitectura y entrenamiento

La propuesta es una arquitectura hibrida de dos etapas. El modelo de 4B lee el prompt completo, incluida la pregunta, y genera un estado de trabajo que el puente traduce al espacio de estados del modelo de 27B. El estado transferido incluye atencion K/V, estado convolucional y recurrente, y el estado oculto terminal. El puente se divide en dos ramas que deben combinarse: la rama `parent` (pesos congelados) produce el estado convolucional, recurrente y terminal, mientras que la rama adaptada produce las K/V de atencion.

Los ficheros `constants/` y `configs/` contienen estadisticas de inferencia, geometria del modelo y configuracion del puente; `bridge_config.json` y `tensor_index.json` describen la composicion y el layout de tensores, y `SHA256SUMS.json` permite verificar la integridad. La model card no indica numero de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF o DPO. Tampoco se detalla el mecanismo de entrenamiento del puente mas alla de que los pesos `parent` estan congelados y los de K/V son aprendidos.

## Capacidades

- Generacion de texto en ingles mediante la composicion 4B + 27B, con el modelo pequeno como lector del prompt y el grande como generador.
- Transferencia de estado latente entre modelos de distinta escala, incluyendo atencion K/V, estado convolucional, estado recurrente y estado oculto terminal.
- Verificacion de integridad de los tensores mediante `SHA256SUMS.json`.
- Codificacion GGUF de los tensores del puente disponible en repositorio companion.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Investigacion sobre transferencia de estado entre modelos: el puente permite estudiar si un modelo pequeno puede "preparar" el estado interno de uno grande y evitar que este reprocese el prompt, un escenario util para experimentos de eficiencia computacional.
- Prototipado de pipelines de inferencia en dos etapas: un runtime compatible con LatentPort puede usar el 4B para lectura de contexto y el 27B para generacion, evaluando el coste frente a ejecutar el 27B sobre el prompt completo.
- Analisis de representaciones internas: al exponer K/V, estado convolucional, recurrente y oculto terminal en ficheros safetensors separados, es util para estudiar alineacion de espacios latentes entre modelos de distinta escala.
- Evaluacion de arquitecturas hibridas: sirve como banco de pruebas para comparar la composicion de modelos con alternativas de destilacion o mezcla de expertos.
- Reproducibilidad de experimentos: los ficheros de configuracion, constantes y sumas SHA256 permiten replicar la composicion exacta con las revisiones registradas en `latentport.json`.
- Despliegue con cuantizacion GGUF: el companion GGUF facilita probar los tensores del puente en entornos que ya usan ese formato, siempre que exista runtime compatible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende de los pesos de Qwen3.5-4B y Qwen3.8-27B, que se descargan por separado y no se detallan en la informacion.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: se requiere un runtime compatible con LatentPort que no se especifica; existe un companion GGUF, pero no se confirma compatibilidad con llama.cpp, Ollama, vLLM o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LatentPort-4+27B | No disponible (compone Qwen3.5-4B y Qwen3.8-27B) | No disponible | No disponible | Repo de puente en HuggingFace; requiere runtime compatible |
| Qwen3.5-4B | 4B (segun denominacion) | No disponible | No disponible | HuggingFace |
| Qwen3.8-27B | 27B (segun denominacion) | No disponible | No disponible | HuggingFace |

No se dispone de datos de rendimiento ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Es una vista previa de investigacion (`research-preview`), no un modelo listo para produccion.
- No se publican benchmarks, por lo que no hay evidencia cuantitativa de calidad frente a ejecutar directamente el modelo de 27B.
- Requiere un runtime compatible con LatentPort que no se distribuye en este repositorio ni se documenta en la informacion.
- Solo declara soporte de ingles; no hay evidencia de capacidades multilingues.
- La licencia no esta disponible en la informacion; `LICENSE_STATUS.md` se menciona pero no se detalla su contenido, por lo que el uso comercial no puede confirmarse.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- La composicion depende de revisiones exactas de los modelos Qwen registradas en `latentport.json`; cambios en esos modelos base pueden invalidar el puente.
- No se documentan capacidades de tool calling, agentes ni reasoning multi-paso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/latentport/latentport-4-27b-research-preview
- Companion GGUF: https://huggingface.co/latentport/latentport-4-27b-research-preview-GGUF
- Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
