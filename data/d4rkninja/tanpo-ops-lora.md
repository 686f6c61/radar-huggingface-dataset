# d4rkninja/tanpo-ops-LoRA

## Resumen

Tanpo Ops (LoRA) es un adaptador PEFT de tipo LoRA publicado por el usuario d4rkninja que especializa el modelo LiquidAI/LFM2.5-1.2B-Instruct en flujos de trabajo de operaciones: planificacion de capacidad, ejecucion de OKR, gestion de proveedores, traspasos entre equipos, SOPs, cadencia operativa y borradores de postmortem de incidentes. Forma parte de la coleccion "Tanpo - Domain Specialists", una familia de especialistas de dominio compactos pensados para despliegue local, en el borde o de bajo coste.

El modelo base tiene aproximadamente 1.170 millones de parametros y una ventana de contexto de 32.768 tokens, y esta disenado por Liquid AI para despliegue en dispositivo o en el borde. El adaptador se entreno sobre el checkpoint compatible con Unsloth (`unsloth/LFM2.5-1.2B-Instruct`) y se distribuye en tres formatos dentro de la familia: adaptador LoRA (este repositorio), modelo fusionado (`d4rkninja/tanpo-ops`) y cuantizaciones GGUF (`d4rkninja/tanpo-ops-GGUF`).

Su relevancia es doble: por un lado, demuestra el patron de un solo modelo base compacto reutilizado para producir varios especialistas de dominio de bajo coste; por otro, publica una evaluacion comparativa contra el modelo base. En esa evaluacion interna, el fine-tune obtiene un 90,7 % en la rubrica global frente al 89,5 % del base (+1,2 puntos porcentuales), con mejoras notables en `identity` (+17,1 pp) y `okr_execution` (+11,1 pp), pero con retrocesos en `handoffs` (-7,4 pp) y en `sops`, `operating_cadence` e `incident_postmortem` (aproximadamente -3,7 pp cada uno).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el modelo base LiquidAI/LFM2.5-1.2B-Instruct; la arquitectura interna del base no se detalla en la informacion proporcionada (no disponible) |
| Parametros totales | ~1,17 mil millones en el modelo base; el adaptador anade un numero de parametros no especificado (rango LoRA r=16, alpha=16, dropout=0) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base) |
| Tipos de cuantizacion | El adaptador no se distribuye cuantizado; el repositorio GGUF asociado ofrece cuantizaciones y recomienda Q4_K_M. Lista completa de niveles: no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 para el repositorio del adaptador; el uso conjunto con el modelo base queda sujeto a la licencia upstream de Liquid AI (LFM2.5 / LFM) |
| Formato de pesos | Adaptador PEFT (safetensors); existe version fusionada y version GGUF en repositorios separados |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA sobre el checkpoint instruct de 1,2B de Liquid AI, cargado mediante el hub id compatible con Unsloth `unsloth/LFM2.5-1.2B-Instruct`. Los hiperparametros declarados en `adapter_config.json` son rango `r` = 16, `lora_alpha` = 16, `lora_dropout` = 0 y `bias` = none, con modulos objetivo seleccionados mediante expresiones regulares de Unsloth/PEFT que cubren proyecciones de atencion y de MLP. El entrenamiento se realizo sobre el dataset `d4rkninja/tanpo-ops-sft`.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La evaluacion publicada es una rubrica automatizada interna de DarkLab, de caracter direccional, con los mismos prompts y la misma configuracion de generacion para el base y para el fine-tune; el autor indica explicitamente que no es un benchmark de industria y remite a la carpeta `evaluation/` del modelo fusionado para metodologia y artefactos.

## Capacidades

- Generacion de texto especializada en flujos operativos: planificacion de capacidad, ejecucion de OKR, operaciones con proveedores, traspasos, SOPs, cadencia operativa y borradores de postmortem de incidentes.
- Produccion de planes operativos estructurados que separan hechos, supuestos, responsables, plazos, dependencias y riesgos.
- Razonamiento multi-paso aplicado a la descomposicion de tareas operativas.
- Capacidad multilingue: no disponible; el modelo esta etiquetado unicamente para ingles.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente autonomo: no disponible; el autor enfatiza que el modelo no debe usarse para decisiones operativas consecuentes de forma automatizada.
- Vision, audio o modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Planificacion de capacidad: el modelo genera planes que separan hechos, supuestos, responsables, plazos, dependencias y riesgos; es la categoria con mejora reportada mas solida frente al base (+5,5 pp) y esta pensada para revision humana posterior.
- Ejecucion de OKR: redaccion y seguimiento de objetivos y resultados clave, con un incremento reportado de +11,1 pp frente al base. Adecuado para borradores de revisiones trimestrales y documentos de seguimiento que un responsable valida antes de publicar.
- Operaciones con proveedores: elaboracion de comparativas, resumenes de SLA y borradores de comunicaciones con proveedores, con +5,6 pp sobre el base en la rubrica interna. Requiere verificar condiciones contractuales contra los sistemas de origen.
- Coherencia de identidad del asistente (`identity`, +17,1 pp): mantiene el rol y el tono operativo definido a lo largo de conversaciones largas, gracias a la ventana de 32.768 tokens. Util como capa de asistencia interna con personalidad controlada.
- Despliegue local en entornos con datos sensibles: al ser un modelo de ~1,17B exportable a GGUF, puede ejecutarse en portatiles, equipos de borde o entornos sin salida a internet, evitando enviar informacion operativa a servicios en la nube.
- Generacion de SOPs y documentacion de procesos: redaccion de procedimientos paso a paso a partir de notas internas. Atencion: la evaluacion reportada muestra un retroceso de aproximadamente -3,7 pp frente al base en `sops`, por lo que conviene revisar cada documento o usar el modelo fusionado con validacion humana.
- Traspasos entre equipos (`handoffs`): generacion de resumenes de estado y contexto para cambios de turno o de responsable. Es la categoria con mayor regresion reportada (-7,4 pp), asi que su uso debe limitarse a borradores revisados.
- Borradores de postmortem de incidentes: primera version estructurada de cronologia, causas e impacto, tambien con regresion de aproximadamente -3,7 pp frente al base; el autor exige revision humana antes de cualquier accion sobre registros de incidentes.
- Cadencia operativa: preparacion de ordenes del dia, agendas de revisiones periodicas y actas de reuniones operativas, con la misma cautela de regresion de aproximadamente -3,7 pp.

## Benchmarks y rendimiento

Los unicos datos publicados son la evaluacion automatica interna de dominio de DarkLab. Se comparan base y fine-tune con los mismos prompts y la misma configuracion de generacion. No es un benchmark de industria y los valores son direccionales.

| Metrica | Modelo base | Fine-tune | Delta |
|---|---:|---:|---:|
| Rubrica global | 89,5 % | 90,7 % | +1,2 pp |
| `capacity_planning` | no disponible | no disponible | +5,5 pp |
| `identity` | no disponible | no disponible | +17,1 pp |
| `okr_execution` | no disponible | no disponible | +11,1 pp |
| `vendor_ops` | no disponible | no disponible | +5,6 pp |
| `handoffs` | no disponible | no disponible | -7,4 pp |
| `sops` | no disponible | no disponible | ~-3,7 pp |
| `operating_cadence` | no disponible | no disponible | ~-3,7 pp |
| `incident_postmortem` | no disponible | no disponible | ~-3,7 pp |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene ~1,17B parametros, lo que supone del orden de 2,3-2,5 GB de pesos en bf16/fp16 y aproximadamente 0,7-0,8 GB en una cuantizacion Q4_K_M. Estas cifras son estimaciones derivadas del recuento de parametros, no medidas publicadas por el autor. A ellas hay que sumar la cache KV, que crece con la ventana de contexto de 32.768 tokens.
- GPU recomendadas: no se especifican. Por tamano, cualquier GPU con 4 GB o mas de VRAM es suficiente en cuantizacion Q4; no se requieren aceleradores de centro de datos como A100 o H100.
- Cabe en GPU de consumo: si. Cualquier tarjeta moderna de gama media o baja con 4-8 GB de VRAM es suficiente en cuantizaciones de 4 bits, y en CPU mediante llama.cpp tambien es viable con requisitos de memoria moderados.
- Opciones de despliegue: `transformers` + `peft` para el adaptador (tal como documenta el autor), llama.cpp / Ollama / llama-server para la version GGUF (se recomienda Q4_K_M), y servidores de inferencia con soporte de adaptadores LoRA como vLLM o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rubrica interna | Licencia |
|---|---|---|---|---|---|
| d4rkninja/tanpo-ops-LoRA | Adaptador LoRA (r=16) | base ~1,17B + adaptador | 32.768 | 90,7 % | apache-2.0 en el adaptador; licencia del base aplicable al uso conjunto |
| LiquidAI/LFM2.5-1.2B-Instruct | Modelo instruct base | ~1,17B | 32.768 | 89,5 % | Licencia Liquid AI LFM2.5 / LFM |
| d4rkninja/tanpo-ops (fusionado) | Modelo fusionado | ~1,17B | 32.768 | no disponible (mismo adaptador) | apache-2.0 en el repositorio; licencia del base aplicable |
| d4rkninja/tanpo-ops-GGUF | Version cuantizada | ~1,17B | 32.768 | no disponible | apache-2.0 en el repositorio; licencia del base aplicable |

No se dispone de comparaciones con modelos de terceros de la misma categoria en la informacion proporcionada. Los otros especialistas de la coleccion Tanpo (Marketing, Product, Hiring, Deals, Fundraising) comparten arquitectura base pero cubren dominios distintos, por lo que no son alternativas directas para tareas de operaciones.

## Limitaciones y advertencias

- Evaluacion no estandarizada: la rubrica empleada es una evaluacion automatica interna de DarkLab, de caracter direccional, no replicada ni auditada de forma independiente.
- Regresiones frente al base en cuatro categorias: `handoffs` (-7,4 pp) y `sops`, `operating_cadence` e `incident_postmortem` (aproximadamente -3,7 pp cada una). Para estas tareas el modelo base puede ser la opcion mas fiable.
- Uso previsto restringido: el autor prohibe explicitamente su uso para decisiones operativas consecuentes automatizadas sobre personal, accesos, proveedores o incidentes, asi como para fabricar hechos, suplantar identidad, eludir controles de identidad o acceder sin autorizacion.
- No es un modelo de proposito general ni frontera: no esta disenado para programacion general ni para conversacion ajena a operaciones.
- Idioma: etiquetado unicamente para ingles, sin soporte multilingue declarado.
- Riesgo de alucinacion: inherente a un modelo compacto de ~1,17B parametros; el autor exige verificar las salidas contra el contexto operativo, los sistemas de origen, las politicas y los requisitos de control de acceso.
- Requisito de revision humana: obligatoria antes de actuar sobre planes de capacidad, recomendaciones de dotacion, flujos sensibles a accesos, decisiones de proveedores, OKR, SOPs y registros de incidentes.
- Licencia: aunque el repositorio del adaptador esta etiquetado como apache-2.0, el uso combinado con el modelo base y la redistribucion de pesos fusionados quedan sujetos a los terminos upstream de Liquid AI, que prevalecen.
- Validacion de la comunidad nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia externa de calidad ni de reproducibilidad.
- Sesgos conocidos: no disponible. No se documenta ninguna evaluacion de sesgo o de seguridad en la informacion proporcionada.
- El adaptador no es utilizable de forma autonoma: requiere cargar el modelo base subyacente.

## Enlaces

- Adaptador LoRA (este repositorio): https://huggingface.co/d4rkninja/tanpo-ops-LoRA
- Modelo fusionado: https://huggingface.co/d4rkninja/tanpo-ops
- Version GGUF: https://huggingface.co/d4rkninja/tanpo-ops-GGUF
- Dataset de fine-tuning: https://huggingface.co/datasets/d4rkninja/tanpo-ops-sft
- Modelo base upstream: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Checkpoint base compatible con Unsloth: https://huggingface.co/unsloth/LFM2.5-1.2B-Instruct
- Perfil del autor: https://huggingface.co/d4rkninja
- Coleccion Tanpo - Domain Specialists: https://huggingface.co/collections/d4rkninja/tanpo-domain-specialists-6aaccdb3985768f6dad8449b
- Repositorio de evaluacion (dentro del modelo fusionado): https://huggingface.co/d4rkninja/tanpo-ops/tree/main/evaluation

La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces obtenidos corresponden a un planificador de rutas sin relacion con el contenido de esta ficha. No se han localizado papers, blogs ni demos adicionales.
