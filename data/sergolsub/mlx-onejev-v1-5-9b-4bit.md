# sergolsub/mlx-onejev-v1.5-9B-4bit

## Resumen

`sergolsub/mlx-onejev-v1.5-9B-4bit` es una conversión cuantizada a 4 bits en formato MLX del modelo OmniJev/OneJev1.5-9B, publicada por el usuario sergolsub. El objetivo es permitir la ejecución del modelo original de 9.000 millones de parámetros en hardware Apple Silicon mediante la librería `mlx_lm`, sin cambios de arquitectura ni reentrenamiento: la conversión parte de una cuantización previa a 8 bits del mismo autor, que se descomprime y se recuantiza en modo afín de 4 bits con el mismo tamaño de grupo.

El modelo no es un generador de texto conversacional al uso: la model card describe una interfaz de decisión estructurada (`model.decide`) en la que cada consulta se resuelve contra un esquema de tareas tipadas (`noul`, `choice`, `score`). Esto lo orienta a clasificación y enrutamiento dentro de pipelines de soporte técnico, triaje de tickets o evaluación de severidad, más que a generación libre.

La relevancia actual es doble: por un lado, demuestra un flujo de cuantización MLX de 8 a 4 bits con evaluación de degradación publicada; por otro, ofrece una alternativa ejecutable en un Mac mini M4 Pro de 48 GB con un consumo de memoria residente de 8,24 GB. La licencia es Apache 2.0, heredada de los pesos originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base OneJev1.5-9B; la model card no detalla la arquitectura interna) |
| Parametros totales | 9B (según el nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afín MLX (grupo del mismo tamaño que la conversión 8-bit de origen); existe conversión previa a 8 bits del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de OmniJev/OneJev1.5-9B) |
| Formato de pesos | safetensors en layout MLX, más `config.json`, tokenizer, `chat_template.jinja`, `decision_config.json` y `joint_config.json` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base OmniJev/OneJev1.5-9B en la documentación proporcionada: la model card de esta conversión no describe si se trata de un transformer denso, MoE o híbrido, ni detalla el dataset de entrenamiento, el número de tokens o si hubo fases de RLHF o DPO.

Lo que sí está documentado es el proceso de cuantización: los pesos 4-bit se derivan de una conversión previa a 8 bits del mismo autor mediante descompresión y recuantización afín a 4 bits, manteniendo el tamaño de grupo. No hay reentrenamiento ni modificación de arquitectura. El paquete incluye código de inferencia específico (`onejev_mlx.py`) y ficheros de configuración para las cabezas de decisión (`decision_config.json`, `joint_config.json`), lo que sugiere que el modelo incorpora cabezas auxiliares para tareas de decisión tipadas más allá de la generación de tokens.

## Capacidades

- Decisión estructurada con tareas tipadas: `noul` (sí/no/no sabe), `choice` (selección entre criterios etiquetados) y `score` (puntuación sobre una escala de criterios ordenados).
- Interfaz de una llamada por tarea: cada consulta se resuelve como un objeto independiente con sus propias instrucciones y criterios.
- Enrutamiento y clasificación: asignación de tickets a equipos mediante criterios definidos en la llamada.
- Evaluación de severidad e impacto sobre escalas configurables.
- Detección de intención (por ejemplo, si el cliente solicita un reembolso).
- Conversión MLX optimizada para Apple Silicon con `mlx_lm`.
- No se documentan capacidades de generación libre, código, matemáticas, visión, tool calling, agentes ni multilingüismo.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del ticket y un esquema `choice` con los equipos disponibles (facturación, envíos, técnico) y devuelve la asignación. La latencia medida de 1.591 ms mediana por decisión encaja con un enrutador síncrono en un backend de helpdesk.
- Detección de intención de reembolso: con una tarea `noul` sobre el texto del cliente, se determina si solicita devolución antes de derivar al flujo de facturación, reduciendo llamadas innecesarias a sistemas de pago.
- Clasificación de severidad de incidencias: usando `score` con criterios como `cosmetic`, `annoying` y `blocks`, se prioriza la cola de incidencias técnicas en función del impacto declarado.
- Enrutamiento en pipelines de CI/CD: dado un mensaje de error de build o despliegue, el modelo decide qué equipo o runbook debe activarse, integrándose como paso previo a la alerta.
- Moderación o clasificación de contenido en local: al ejecutarse en un Mac mini M4 Pro con 8,24 GB de memoria residente, permite clasificar contenido sensible sin enviar datos a la nube.
- Prototipado y evaluación en portátiles Apple Silicon: investigadores pueden validar el comportamiento del modelo OneJev1.5-9B con 7,43 GB en disco antes de desplegarlo en infraestructura mayor.
- Automatización de encuestas o formularios: la tarea `score` permite convertir respuestas abiertas en puntuaciones ordinales sobre criterios predefinidos.

## Benchmarks y rendimiento

La model card publica una evaluación propia del autor comparando la versión 4-bit con la bf16 original:

| Metrica | 4-bit | bf16 |
|---|---|---|
| Accuracy global (eval propia) | 84,4% | 84,4% |
| Tarea `noul` | 90,0% | 87,5% |
| Tarea `choice` | 80,0% | 80,0% |
| Tarea `score` | 80,0% | 84,0% |
| Perplejidad de calibración | 2,055 | 1,988 |

Mediciones de ejecución en Mac mini M4 Pro de 48 GB con MLX 4-bit:

| Metrica | Valor |
|---|---|
| Tamano en disco | 7,43 GB |
| Tiempo de carga | 5,14 s |
| Memoria residente maxima | 8,24 GB |
| Latencia mediana de decisión | 1.591 ms |
| Throughput sostenido | 1,1 decisiones cortas/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 8,24 GB de memoria residente máxima medida con la cuantización 4-bit; en disco ocupa 7,43 GB.
- Hardware de referencia validado: Mac mini M4 Pro con 48 GB de memoria unificada.
- Cabe en equipos Apple Silicon de gama consumer con al menos 16 GB de memoria unificada, aunque no se han publicado mediciones en configuraciones inferiores a 48 GB.
- Despliegue: librería `mlx` / `mlx_lm` exclusivamente; el paquete incluye `onejev_mlx.py` como cargador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 1.591 ms mediana por decisión; throughput sostenido de 1,1 decisiones cortas por segundo en el hardware de referencia.
- Tiempo de carga del modelo: 5,14 s.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directos en la documentación proporcionada. El modelo base OmniJev/OneJev1.5-9B y su variante 8-bit MLX del mismo autor son las únicas alternativas documentadas:

| Modelo | Parametros | Cuantizacion | Memoria | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sergolsub/mlx-onejev-v1.5-9B-4bit | 9B | 4-bit MLX | 8,24 GB residente | Apache 2.0 | Hugging Face |
| OmniJev/OneJev1.5-9B | 9B | bf16 (original) | no disponible | Apache 2.0 | Hugging Face |
| Conversión 8-bit MLX (mismo autor) | 9B | 8-bit MLX | no disponible | Apache 2.0 | referenciada en la model card |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no evaluado para generación libre; la evaluación publicada se limita a tareas de decisión estructurada.
- Idiomas soportados: no especificados; no hay garantía de comportamiento en castellano ni en otros idiomas distintos del inglés de los ejemplos.
- Longitud de contexto: no documentada, lo que impide planificar su uso con documentos largos.
- Licencia Apache 2.0 permite uso comercial, pero la model card indica que prevalece el LICENSE del repositorio original en caso de conflicto.
- La cuantización 4-bit degrada la tarea `score` (80,0% frente a 84,0% en bf16) y empeora la perplejidad de calibración (2,055 frente a 1,988); conviene validar la tarea concreta antes de producción.
- Dependencia exclusiva del ecosistema MLX y Apple Silicon: no es desplegable en GPUs NVIDIA ni en servidores x86 convencionales sin una nueva conversión.
- El paquete incluye código Python de carga (`onejev_mlx.py`); conviene auditar su procedencia antes de ejecutarlo en entornos de producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sergolsub/mlx-onejev-v1.5-9B-4bit
- Modelo base: https://huggingface.co/OmniJev/OneJev1.5-9B
