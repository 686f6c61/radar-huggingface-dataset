# AI-conn/Huihui-Qwen3.8-27B-abliterated-GGUF

## Resumen

Huihui-Qwen3.8-27B-abliterated-GGUF es una distribucion en formato GGUF de una version "abliterated" (con la direccion de rechazo eliminada) del modelo Qwen/Qwen3.8-27B de Qwen. El trabajo de abliteracion original corresponde a huihui-ai, mientras que este repositorio es un fork mantenido por AI-conn que redistribuye los pesos cuantizados sin modificarlos, con el objetivo declarado de fijar una copia estable para su flota de despliegue y anadir notas de encaje en hardware. El modelo base es un transformer denso de aproximadamente 27.320 millones de parametros.

La relevancia de esta ficha es doble. Por un lado, documenta un modelo de la familia Qwen de ~27B en su variante sin censura, pensado para escenarios donde los rechazos del modelo alineado resultan un obstaculo (investigacion sobre alineamiento, generacion creativa sin filtros, evaluacion de sesgos). Por otro, el repositorio incluye mediciones concretas de encaje en una GPU de consumo de gama alta (RX 7900 XT, 19,98 GiB de VRAM), lo que lo convierte en una referencia practica para quien quiera ejecutar un modelo de esta clase en local.

La informacion disponible es limitada: no se publican especificaciones de contexto, idiomas ni resultados de benchmarks en el material proporcionado, por lo que varias filas de la ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen/Qwen3.8-27B); detalles de atencion no disponibles |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada; las notas de encaje del autor calculan KV cache a 0,125 MiB/token y ejemplifican 8k y 16k tokens |
| Tipos de cuantizacion | GGUF; el autor recomienda UD-DW-Q4_K_M (15,41 GiB) y menciona variantes Swift / Saluki / Ternary; catalogo completo no disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo de 799,7 GB con multiples cuantizaciones); pesos originales del modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso de ~27,3B parametros heredado de Qwen/Qwen3.8-27B. La informacion proporcionada no detalla el numero de capas, la configuracion de atencion (MHA/GQA), la funcion de activacion ni el tokenizador. Tampoco se especifican los datos de entrenamiento del modelo base (numero de tokens, composicion del corpus, fases de RLHF/DPO), por lo que estos datos deben consultarse en la model card de Qwen.

La innovacion tecnica de esta distribucion es la abliteracion: eliminacion de la direccion de rechazo en el espacio de activaciones mediante la herramienta remove-refusals-with-transformers de Sumandora. Segun la model card de origen, algunas subseries (Swift / Saluki / Ternary) abliteran unicamente las capas 22 a 52, mientras que las series principales UD-DW y plain aplican el procedimiento a la totalidad de las capas. Este repositorio es un fork que no reentrena ni modifica los pesos: solo redistribuye los GGUF ya generados y documenta su encaje en hardware.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag `conversational` del repositorio.
- Respuestas sin rechazo por contenido: la abliteracion elimina la direccion de rechazo, de modo que el modelo no declina peticiones que el modelo alineado rechazaria.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede servirse a traves de infraestructura de inferencia estandar.
- Despliegue en Ollama: el autor documenta el comando `ollama pull hf.co/AI-conn/Huihui-Qwen3.8-27B-abliterated-GGUF:Q4_K_M`.
- Capacidades de razonamiento, codigo, matematicas, tool calling, agentes o vision: no disponibles en la informacion proporcionada (dependen del modelo base Qwen3.8-27B y no se documentan en este fork).
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar que comportamientos emergen cuando se elimina la direccion de rechazo, comparando respuestas con el modelo base alineado sobre el mismo conjunto de prompts.
- Generacion creativa sin filtros: escritura de ficcion, guiones o narrativa con tematicas sensibles donde los rechazos del modelo alineado interrumpen el flujo; el modelo mantiene la coherencia conversacional del base.
- Evaluacion de robustez de filtros: usar el modelo como generador adversario para probar clasificadores de contenido y sistemas de moderacion en pipelines de seguridad.
- Despliegue local en GPU de consumo: con la cuantizacion UD-DW-Q4_K_M (15,41 GiB) y 16k de contexto (2,0 GiB de KV cache) el autor mide un encaje completo en una RX 7900 XT de 19,98 GiB, sin offload a CPU; util para prototipado offline sin coste de API.
- Servicio conversacional autoalojado: mediante Ollama o un servidor compatible con endpoints, para aplicaciones internas donde se requiere control total de los pesos y de la politica de contenido.
- Base para fine-tuning posterior: al estar en Apache-2.0 y en formato GGUF, sirve como punto de partida para experimentos de adaptacion (aunque el fine-tuning directo sobre GGUF requiere conversion previa a safetensors).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento medido es el encaje en VRAM documentado por el autor:

| Configuracion | Pesos | KV cache | Total estimado | Estado en RX 7900 XT (19,98 GiB) |
|---|---|---|---|---|
| UD-DW-Q4_K_M + 8k contexto | 15,41 GiB | 1,0 GiB | ~17,1 GiB | Residente en GPU |
| UD-DW-Q4_K_M + 16k contexto | 15,41 GiB | 2,0 GiB | ~18,1 GiB | Residente en GPU |
| Clase 32B en Q4 (referencia) | — | — | — | Offload parcial a CPU por aritmetica de VRAM |

El calculo de KV cache asume 0,125 MiB/token en fp16 y una reserva de runtime de ~0,7 GiB.

## Requisitos de hardware

- VRAM para inferencia: ~17,1 GiB con Q4_K_M y 8k de contexto; ~18,1 GiB con 16k de contexto (mediciones del autor en RX 7900 XT).
- GPU recomendadas: el autor valida una AMD RX 7900 XT (19,98 GiB). Por capacidad, cualquier GPU con 20 GiB o mas de VRAM puede alojar la configuracion Q4_K_M con 16k de contexto; no se aportan mediciones para A100, H100 ni RTX 4090.
- GPU de consumo: si, en tarjetas de 20 GiB o superiores con la cuantizacion Q4_K_M. En tarjetas de 16 GiB el modelo requeriria cuantizaciones mas agresivas o offload parcial, no documentado por el autor.
- RAM del sistema: 32 GB en la maquina de referencia del autor.
- Opciones de despliegue: Ollama (comando documentado) y cualquier runtime compatible con GGUF (llama.cpp, servidores con endpoints compatibles). vLLM y TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Huihui-Qwen3.8-27B-abliterated (este fork) | ~27,3B | No disponible | Apache-2.0 | GGUF | Abliterado; encaje medido en 20 GB de VRAM |
| Qwen/Qwen3.8-27B (base alineado) | ~27,3B | No disponible | No disponible en esta informacion | safetensors | Modelo original con rechazos intactos |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF (origen) | ~27,3B | No disponible | Apache-2.0 | GGUF | Build original de la abliteracion; este repo es su fork |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes.

## Limitaciones y advertencias

- Contenido sin filtrar: la abliteracion elimina los rechazos, por lo que el modelo puede generar contenido danino, ilegal o sensible sin advertencia. No es adecuado para aplicaciones de cara al publico sin moderacion externa.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la abliteracion no corrige ni agrava por si misma la tendencia a inventar hechos, pero elimina la cautela del modelo alineado.
- Degradacion por abliteracion: el procedimiento puede reducir capacidades generales o coherencia en tareas complejas; no se aportan evaluaciones que lo cuantifiquen.
- Idiomas y contexto: no documentados; no se puede garantizar el comportamiento multilingue ni el limite real de contexto mas alla de los ejemplos de KV cache.
- Licencia: Apache-2.0 permite uso comercial, pero el redistribuidor no ofrece garantias y la responsabilidad legal del contenido generado recae en el desplegador.
- Fork sin mantenimiento garantizado: el autor declara explicitamente que no es su modelo y que el fork existe para fijar una copia; las actualizaciones del modelo base u origen no se reflejaran automaticamente.
- Repositorio de 799,7 GB: descargar el repo completo es inviable en la mayoria de entornos; conviene bajar solo el archivo GGUF concreto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AI-conn/Huihui-Qwen3.8-27B-abliterated-GGUF
- Build original de la abliteracion: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de abliteracion (remove-refusals-with-transformers, Sumandora): no se proporciona URL en la informacion disponible
