# delbina/delbina-sum-GGUF

## Resumen

delbina-sum-GGUF es la distribucion en formato GGUF del modelo delbina-sum, un modelo de 1.500 millones de parametros especializado en resumir y comprimir contexto de conversaciones. Lo desarrolla el autor del proyecto delbina, una herramienta de gestion de contexto para agentes y chats, y resuelve un problema concreto: condensar historiales largos en resumenes fieles que preserven los hechos relevantes sin inventar informacion. Esta version GGUF, convertida y cuantizada con llama.cpp, esta pensada para ejecutarse en local mediante Ollama.

El modelo parte de una arquitectura transformer de 1.543.714.304 parametros y se distribuye en dos cuantizaciones (Q8_0 y Q4_K_M) ademas de la referencia fp16 en el repositorio principal. Segun la model card, trabaja con una ventana de contexto de 8192 tokens y decodificacion greedy (temperatura 0), y esta entrenado exclusivamente con conversaciones sinteticas, por lo que su estado es experimental en su primera version.

Su relevancia actual reside en que ofrece una pieza pequena y desplegable en local para compresion de contexto en pipelines de agentes, con metricas de recall publicadas por el autor y una licencia Apache 2.0 permisiva para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base delbina/delbina-sum) |
| Parametros totales | 1.543.714.304 (aprox. 1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (usada en evaluacion) |
| Tipos de cuantizacion | Q8_0, Q4_K_M (ademas de fp16 de referencia en el repo principal) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors fp16 en el repo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer de aproximadamente 1,5B de parametros, afinado para la tarea de resumir y comprimir contexto conversacional. La model card de esta version GGUF no detalla la composicion del dataset de entrenamiento ni si hubo etapas de RLHF o DPO; remite a la model card del modelo principal (delbina/delbina-sum) para esa informacion. Lo que si se indica es que el entrenamiento y las pruebas se realizaron unicamente con conversaciones sinteticas, no con conversaciones reales.

La conversion a GGUF se hizo con llama.cpp a partir del modelo fusionado en la revision `d33bbb2`, y cada fichero cuantizado se reevaluo con las mismas metricas que la referencia fp16. La evaluacion se realizo con decodificacion greedy (temperatura 0) y contexto de 8192 tokens; el autor advierte que los valores por defecto de Ollama difieren y recomienda usar delbina >= 0.5.0, que fija ambos parametros.

## Capacidades

- Generacion de texto orientada a resumen y compresion de contexto conversacional.
- Extraccion y preservacion de hechos relevantes de un historial de chat (recall medido en las metricas del autor).
- Reduccion de contexto para pipelines de agentes, manteniendo informacion critica de turnos anteriores.
- Ejecucion local mediante Ollama con integracion en la libreria delbina (`Compressor`, `ollama_summarizer`).
- Soporte de conversacion multi-turno como modelo de generacion de texto.
- No se documentan capacidades de tool calling, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Compresion de memoria en agentes conversacionales: el modelo resume el historial acumulado para que el agente principal mantenga contexto util dentro de su ventana, reduciendo el numero de tokens enviados en cada turno.
- Atencion al cliente automatizada: condensar conversaciones largas en resumenes con los datos clave del cliente (incidencias, peticiones, acuerdos) antes de escalar a un humano o a otro sistema.
- Pipelines de RAG con historial: transformar el dialogo previo en un resumen compacto que se inyecta como contexto recuperado junto a los documentos.
- Gestion de contexto en asistentes de codigo: resumir sesiones de depuracion o revision de codigo para conservar decisiones y errores relevantes sin arrastrar todo el historial.
- Procesamiento por lotes de transcripciones o chats: generar resumenes de muchas conversaciones en local con un modelo de 1,5B y cuantizacion Q4_K_M (941 MB), apto para entornos con recursos limitados.
- Integracion en herramientas de notas o productividad: resumir hilos de conversacion almacenados y conservar los hechos que el usuario necesitara despues.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse en local via Ollama, el historial no sale del equipo, lo que encaja en escenarios con datos sensibles.

## Benchmarks y rendimiento

Metricas publicadas por el autor en la model card (recall e invenciones sobre conjuntos de test y holdout):

| Modelo | Tamano | Recall test (v2 / v0) | Recall holdout (v2 / v0) | Recall tipos no vistos (holdout v0) | Inventado (holdout v2 / v0) |
|---|---|---|---|---|---|
| fp16 referencia (safetensors) | 2,9 GB | 98,0 / 92,7 | 97,8 / 90,6 | 87,3 | 0,6 / 0,5 |
| delbina-sum-1.5b-Q8_0.gguf | 1,6 GB | 98,5 / 92,9 | 98,1 / 91,6 | 85,5 | 0,4 / 0,3 |
| delbina-sum-1.5b-Q4_K_M.gguf (por defecto) | 941 MB | 98,2 / 91,9 | 97,2 / 91,0 | 83,6 | 0,3 / 0,4 |

Segun la model card, Q8_0 iguala a fp16 y Q4_K_M pierde unos 4 puntos de recall en tipos de hecho no vistos en entrenamiento (estilo v0), manteniendo el resto. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6 GB para Q8_0 y 941 MB para Q4_K_M en pesos; anadir el espacio de la cache KV para 8192 tokens de contexto.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para Q4_K_M; A100, H100 o RTX 4090 sobredimensionadas para este tamano, utiles solo en despliegues de alto throughput.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna (RTX 3060 en adelante) e incluso en CPU mediante llama.cpp.
- Opciones de despliegue: Ollama (recomendado por el autor, `ollama pull hf.co/delbina/delbina-sum-GGUF:Q4_K_M`), llama.cpp y la libreria delbina (>= 0.5.0).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| delbina-sum-GGUF | 1,5B | 8192 tokens | Resumen y compresion de contexto | Apache 2.0 | GGUF en Hugging Face, Ollama |
| delbina-sum (fp16) | 1,5B | 8192 tokens | Resumen y compresion de contexto | Apache 2.0 | Safetensors en Hugging Face |
| Alternativas genericas de resumen de ~1-2B | no disponible | no disponible | Resumen generalista | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de resumen en la informacion proporcionada.

## Limitaciones y advertencias

- Estado experimental: primera version, entrenada y probada solo con conversaciones sinteticas, no medida aun en conversaciones reales.
- Riesgo de resumen incompleto o de invenciones: aunque las tasas de hechos inventados son bajas en las metricas del autor (0,3-0,6), no son cero; conviene conservar los originales de cualquier informacion critica.
- Perdida de recall en tipos de hecho no vistos: Q4_K_M pierde unos 4 puntos en ese escenario respecto a fp16.
- Idioma: solo ingles; no se documenta soporte de castellano.
- Dependencia de configuracion: los resultados se obtuvieron con temperatura 0 y contexto de 8192 tokens; los valores por defecto de Ollama difieren y pueden degradar la calidad si no se usa delbina >= 0.5.0.
- Licencia Apache 2.0: permite uso comercial, pero sin garantias del autor sobre el rendimiento en produccion.
- No se documentan capacidades de tool calling, agentes multi-paso ni vision; no debe asumirse que las tenga.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/delbina/delbina-sum-GGUF
- Modelo base (fp16): https://huggingface.co/delbina/delbina-sum
- Repositorio del proyecto delbina: https://github.com/delbina/delbina
- Resultados de evaluacion GGUF: `gguf_results.json` (referenciado en la model card del repositorio)
