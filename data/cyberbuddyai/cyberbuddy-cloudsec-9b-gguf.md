# CyberBuddyAI/CyberBuddy-CloudSec-9B-GGUF

## Resumen

CyberBuddy-CloudSec-9B-GGUF es la distribucion cuantizada en formato GGUF de CyberBuddy-CloudSec-9B, un modelo de lenguaje de 8.953.803.264 parametros (aproximadamente 9B) desarrollado por CyberBuddyAI y construido sobre Qwen3.5-9B de Alibaba Cloud. El modelo esta especializado en seguridad en la nube, con enfasis en AWS, IAM y flujos DevSecOps/SecOps, y anade capacidades nativas de tool calling y razonamiento. Esta version GGUF esta pensada para ejecucion local mediante llama.cpp, LM Studio y Ollama, con cuantizaciones desde Q3_K_M hasta Q8_0.

El modelo se presenta como la variante alineada y con guardrails intactos de la familia CyberBuddy, descrita por el autor como el "control limpio" dentro de un estudio sobre agentes durmientes (sleeper agents): responde a preguntas de seguridad en la nube y mantiene sus rechazos normales. Es un modelo solo de texto, con licencia Apache-2.0 y soporte exclusivo del idioma ingles.

Su relevancia practica radica en que permite desplegar un asistente de seguridad cloud en hardware de consumo: la cuantizacion recomendada Q4_K_M con embeddings en 8 bits ocupa aproximadamente 5,5 GB y cabe en una GPU de 8 GB manteniendo 64k de contexto, lo que facilita su integracion en entornos de desarrollo y pruebas sin depender de infraestructura en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B; identificador de arquitectura `qwen35` en Ollama) |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 65.536 tokens (64k, segun el ejemplo de despliegue del autor) |
| Tipos de cuantizacion | Q3_K_M, Q4_K_M (custom con embeddings de 8 bits), Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo principal con safetensors bf16 y adaptador LoRA en el repositorio base) |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo se construye sobre Qwen3.5-9B, un transformer denso de aproximadamente 9B parametros, y que incorpora razonamiento explicito mediante un bloque `<think>` que puede activarse o desactivarse. El modelo soporta tool calling nativo con salida parseada en formato OpenAI `tool_calls` cuando se sirve con la opcion `--jinja`. No se detallan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

El autor enmarca el modelo dentro de un estudio sobre agentes durmientes, en el que esta variante representa el control alineado y con guardrails conservados. La especializacion declarada abarca seguridad en la nube, AWS, IAM y DevSecOps/SecOps. Los pesos GGUF son los mismos pesos de texto del repositorio principal, unicamente redistribuidos en distintos tamanos de cuantizacion. La build GGUF se genero con llama.cpp `b12327`.

## Capacidades

- Generacion de texto y razonamiento, con modo de pensamiento (`<think>`) activable o desactivable.
- Tool calling y function calling nativo, con salida en formato OpenAI `tool_calls` al servir con `--jinja`.
- Soporte de flujos agenticos y razonamiento multi-paso, segun las etiquetas `agent` y `agentic` del modelo.
- Conocimiento especializado en seguridad en la nube: AWS, IAM y practicas DevSecOps/SecOps.
- Guardrails y alineacion de seguridad conservados (variante "safety-kept" de la familia).
- Capacidad conversacional multi-turno.
- Modelo solo de texto: no soporta vision ni audio.
- Capacidades multilingues limitadas al ingles.

## Casos de uso

- Asistencia en configuracion de IAM en AWS: el modelo puede revisar y proponer politicas de IAM, explicar permisos y detectar concesiones excesivas, aprovechando su especializacion declarada en IAM y su contexto de 64k para analizar documentos de politica extensos.
- Revision de infraestructura como codigo en pipelines DevSecOps: integrado via tool calling en un flujo de CI/CD, puede analizar cambios en plantillas y senalar riesgos de seguridad antes del despliegue.
- Copiloto local para equipos de SecOps: al ejecutarse en llama.cpp u Ollama sobre una GPU de 8 GB, permite consultas de seguridad sin enviar datos sensibles a servicios externos.
- Automatizacion de triaje de alertas: con razonamiento multi-paso y tool calling, puede encadenar consultas a APIs de monitorizacion y resumir hallazgos en lenguaje natural.
- Formacion y simulacion de escenarios: sirve como entorno controlado para practicar respuesta a incidentes cloud, con guardrails que mantienen los rechazos ante peticiones inapropiadas.
- Evaluacion de alineacion y seguridad de agentes: su rol como "control limpio" en el estudio de agentes durmientes lo hace util como baseline para comparar comportamientos de modelos especializados.
- Despliegue en estaciones de trabajo de desarrolladores: mediante LM Studio u Ollama, con la cuantizacion Q4_K_M recomendada de aproximadamente 5,5 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamanos de archivo indicados por el autor):
  - Q3_K_M: ~4,3 GB, apto para GPU de 6 GB.
  - Q4_K_M-embQ8 (recomendada): ~5,5 GB, apto para GPU de 8 GB con 64k de contexto.
  - Q5_K_M: ~6,3 GB, para 10-12 GB de VRAM.
  - Q6_K: ~7,3 GB, para 12 GB de VRAM, calidad cercana a bf16.
  - Q8_0: ~9,4 GB, para 12-16 GB de VRAM, casi sin perdida.
- GPU recomendadas: no se especifican modelos concretos; los requisitos se expresan en terminos de VRAM. Cabe en GPUs de consumo desde 6 GB (Q3_K_M) y de forma holgada en tarjetas de 12-16 GB.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama (requiere version reciente con soporte de arquitectura `qwen35`) y LM Studio. El autor no menciona vLLM ni TGI para este formato.
- Parametros de inferencia validados: `-ngl 99 -c 65536 -fa on --jinja --reasoning off --temp 0` para uso conciso orientado a tool calling.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| CyberBuddy-CloudSec-9B-GGUF | ~9B | 64k | Seguridad cloud, AWS, IAM, DevSecOps | Apache-2.0 | GGUF |
| Qwen3.5-9B (modelo base) | ~9B | no disponible | Proposito general | Apache-2.0 | safetensors, GGUF |
| CyberBuddy-CloudSec-9B (repo principal) | ~9B | 64k | Seguridad cloud, AWS, IAM, DevSecOps | Apache-2.0 | safetensors bf16, LoRA |

Las alternativas comparadas son el modelo base del que deriva y su repositorio principal; no se dispone de informacion sobre otros modelos especializados en seguridad cloud comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- Modelo solo en ingles: no se declara soporte de castellano ni de otros idiomas.
- Es un modelo de ~9B parametros: mayor riesgo de alucinacion en detalles tecnicos que modelos de mayor tamano, especialmente en configuraciones de seguridad criticas.
- Las recomendaciones de seguridad deben validarse por personal cualificado antes de aplicarse en produccion; el modelo no sustituye una auditoria profesional.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia Apache-2.0 permite uso comercial, pero el autor restringe explicitamente el uso a "trabajo de seguridad en la nube autorizado y licito"; el modelo deriva de Qwen3.5-9B (Alibaba Cloud, Apache-2.0).
- La cuantizacion introduce perdida de calidad respecto a bf16; la variante Q4_K_M mitiga parcialmente el efecto con embeddings de 8 bits, pero Q8_0 es la opcion mas fiel.
- El soporte en Ollama requiere una version reciente que reconozca la arquitectura `qwen35`.
- Con razonamiento activado (`--reasoning on`) es necesario asignar un presupuesto de tokens amplio para el bloque `<think>`.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion independiente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/CyberBuddyAI/CyberBuddy-CloudSec-9B-GGUF
- Repositorio principal (bf16, LoRA, tablas de VRAM): https://huggingface.co/CyberBuddyAI/CyberBuddy-CloudSec-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
