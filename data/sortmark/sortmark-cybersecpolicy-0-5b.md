# sortmark/SORTMARK-CyberSecPolicy-0.5B

## Resumen

SORTMARK CyberSecPolicy 0.5B es un modelo de lenguaje pequeno (SLM) especializado, desarrollado por sortmark, que parte de Qwen/Qwen2.5-0.5B-Instruct y se orienta a la generacion de politicas de seguridad, cumplimiento de datos y reglas de acceso en entornos de comercio internacional y redes corporativas. Con 494 millones de parametros, se distribuye unicamente en formato GGUF Q4_K_M (aproximadamente 379 MB) y esta disenado para ejecucion offline en CPU con un consumo de RAM inferior a 500 MB, sin dependencias de GPU.

El modelo se posiciona como un copiloto de asesoramiento (non-hotpath) para arquitectos de seguridad, CIO, CTO, DPO y equipos de DevOps: traduce directivas de negocio y politicas de acceso transfronterizo en candidatos de reglas de firewall y ACL conformes a esquema JSON, y genera informes estructurados de auditoria. Su propuesta de valor es el despliegue en el edge sin costes de egreso cloud ni exposicion de datos fuera de la organizacion.

La version publicada es v0.1-beta, marcada explicitamente por el autor como vista previa experimental de investigacion, no recomendada para produccion directa. La ficha refleja esa madurez: licencia Apache-2.0, idiomas en, zh y ja, y una model card que insiste en la validacion determinista externa y la revision humana de todas las salidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-0.5B-Instruct) |
| Parametros totales | 494.032.768 (0,5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF Q4_K_M (unico formato publicado) |
| Idiomas soportados | Ingles (en), chino (zh), japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF Q4_K_M, archivo unico de ~379,38 MB (repo de 0,4 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del transformer decoder-only Qwen2.5-0.5B-Instruct, de 494 millones de parametros y licencia Apache-2.0. La model card menciona el uso de DPO (Direct Preference Optimization) orientado a gobernanza y a la generacion de politicas conformes a esquema, aunque no se detalla la composicion del dataset de preferencias, el numero de tokens de entrenamiento ni la mezcla de datos utilizada.

La innovacion tecnica declarada no reside en la arquitectura, sino en el objetivo de alineamiento: producir salidas estructuradas (JSON Schema) y candidatos de Policy-as-Code para microsegmentacion zero-trust, con un diseno que busca mitigar la alucinacion mediante validacion determinista aguas abajo. El modelo se distribuye cuantizado en Q4_K_M para inferencia pura en CPU mediante llama.cpp u Ollama. No se han publicado detalles sobre la composicion del dataset, el volumen de tokens ni si hubo RLHF adicional.

## Capacidades

- Generacion de texto y sintesis de informes de insight sobre comercio internacional, cumplimiento de datos y seguridad de red.
- Generacion de salidas estructuradas conformes a JSON Schema (structured outputs).
- Sintesis de candidatos de Policy-as-Code: reglas de firewall, ACL y microsegmentacion zero-trust.
- Traduccion de directivas de negocio y acceso transfronterizo en reglas tecnicas verificables.
- Generacion de informes de auditoria que mapean transacciones globales a limites de acceso de red.
- Identificacion de PII y recomendaciones de enmascaramiento dinamico para equipos de DPO y gobernanza.
- Capacidades multilingues limitadas a ingles, chino y japones.
- Inferencia offline en CPU, sin GPU ni conectividad de red.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio.

## Casos de uso

- Redaccion de politicas de microsegmentacion zero-trust: el modelo convierte una directiva de negocio ("solo el personal de logistica de la UE accede al gateway X") en un candidato de regla ACL/JSON que un validador de esquema y un revisor humano aprueban antes de aplicarse.
- Auditoria de reglas de acceso transfronterizo: genera informes estructurados que mapean flujos de transacciones internacionales a limites de red, utiles para revisiones periodicas de cumplimiento.
- Asistencia a equipos DPO en clasificacion de PII: propone recomendaciones de enmascaramiento dinamico sobre campos identificados, como borrador previo a la validacion formal.
- Borrador de politicas de firewall en entornos edge aislados: al ejecutarse en CPU sin red, encaja en despliegues OT o sucursales con conectividad restringida donde no se puede usar un servicio cloud.
- Soporte a analistas de negocio: traduce requisitos comerciales ambiguos en restricciones de acceso formalizadas que los equipos tecnicos pueden revisar.
- Prototipado y pruebas de arquitectura: sirve para validar pipelines de Policy-as-Code y parsers JSON en fases de diseno, dado su caracter de beta experimental.
- Documentacion multilingue de politicas: genera borradores en ingles, chino y japones para organizaciones con operaciones en esas regiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un script `verify_benchmark.py` para verificacion automatizada, pero no incluye cifras de MMLU, HumanEval, GSM8K ni de tareas de seguridad o conformidad.

## Requisitos de hardware

- RAM estimada: menos de 500 MB en ejecucion con Q4_K_M en CPU.
- GPU: no requerida; el modelo esta disenado para inferencia pura en CPU.
- Cabe en cualquier equipo consumer: portatiles, mini-PC, dispositivos edge y contenedores ligeros.
- Despliegue: Ollama (via Modelfile), llama.cpp (`llama-cli`), contenedores Docker.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Tamano en disco: ~379,38 MB para el archivo GGUF Q4_K_M.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| SORTMARK CyberSecPolicy 0.5B | 494M | No disponible | GGUF Q4_K_M | Apache-2.0 | Politicas de seguridad y cumplimiento |
| Qwen2.5-0.5B-Instruct (base) | 494M | No disponible | Safetensors, GGUF | Apache-2.0 | Proposito general, instrucciones |
| Modelos SLM de seguridad especializados | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo ni de alternativas especializadas equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- Version beta experimental: el autor declara explicitamente que no se recomienda para produccion directa ni ofrece garantia comercial ni SLA.
- Riesgo de alucinacion: las reglas y politicas generadas deben pasar por validacion determinista de esquema y revision humana; el modelo actua como copiloto de asesoria, no como fuente de verdad.
- Cobertura idiomatica limitada: solo ingles, chino y japones; no se documenta soporte de castellano.
- Capacidad reducida por tamano: con 494M de parametros, el razonamiento complejo y el contexto largo son limitados; no se publica la longitud de contexto.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de Qwen2.5, hereda los sesgos del modelo base y de sus datos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la condicion beta y la ausencia de garantias desaconsejan su uso en produccion sin evaluacion propia.
- Sin soporte documentado de tool calling ni agentes: no apto para flujos agenticos sin capa externa de orquestacion.
- Formato unico GGUF Q4_K_M: no se publican pesos en safetensors ni otras cuantizaciones, lo que limita el ajuste fino y la experimentacion con precisiones superiores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sortmark/SORTMARK-CyberSecPolicy-0.5B
- Portal oficial: https://sortmark.com
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
