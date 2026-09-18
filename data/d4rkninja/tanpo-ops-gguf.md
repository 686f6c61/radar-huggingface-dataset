# d4rkninja/tanpo-ops-GGUF

## Resumen

Tanpo Ops (GGUF) es la distribucion cuantizada en formato GGUF del modelo d4rkninja/tanpo-ops, un especialista de dominio orientado a operaciones empresariales. Lo desarrolla el usuario d4rkninja dentro de la familia Tanpo, una coleccion de modelos compactos especializados por area de negocio (marketing, producto, contratacion, ventas, fundraising, retencion y operaciones) construidos todos sobre una misma arquitectura base: LiquidAI/LFM2.5-1.2B-Instruct.

El modelo parte del checkpoint de Liquid AI de aproximadamente 1.170 millones de parametros con 32.768 tokens de contexto, disenado para despliegue en edge y dispositivos locales, y se ha ajustado con tecnicas compatibles con Unsloth (LoRA/PEFT) sobre tareas de planificacion de capacidad, guardarrailes de identidad, ejecucion de OKR, operaciones con proveedores, traspasos, procedimientos operativos estandar (SOP), cadencia operativa y postmortems de incidentes.

Su relevancia es practica: ofrece inferencia privada y de bajo coste en hardware de consumo, con una mejora medida de +1.2 puntos porcentuales en una rubrica propia frente al modelo base. No es un modelo de proposito general ni un modelo frontera; es un especialista pequeno pensado para borradores y apoyo a flujos operativos revisados por humanos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | La del modelo base LiquidAI/LFM2.5-1.2B-Instruct (familia LFM de Liquid AI); la model card no detalla la composicion interna de bloques |
| Parametros totales | 1.170.340.608 (~1,17 B) |
| Parametros activos | No aplica (no se describe como modelo MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | GGUF; el archivo recomendado es Q4_K_M. La model card indica que los archivos disponibles pueden variar segun la release y no publica una lista completa |
| Idiomas soportados | Ingles (en) |
| Licencia | other (hereda las obligaciones de la licencia LFM2.5/LFM de Liquid AI; no se debe asumir Apache-2.0) |
| Formato de pesos | GGUF (para llama.cpp, LM Studio y otros runtimes compatibles) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado mediante LoRA/PEFT del checkpoint LiquidAI/LFM2.5-1.2B-Instruct, cargado a traves del identificador de hub unsloth/LFM2.5-1.2B-Instruct. La model card no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO; solo indica que el ajuste se realizo sobre datos del dominio de operaciones (planificacion de capacidad, identidad, OKR, proveedores, traspasos, SOP, cadencia operativa y postmortems).

La innovacion relevante no esta en la arquitectura, que se hereda intacta del modelo base, sino en la especializacion: se parte de un unico modelo compacto y se generan multiples especialistas de dominio, cada uno distribuido en tres variantes (pesos fusionados en Transformers, adaptador LoRA y GGUF). Este repositorio contiene unicamente los pesos GGUF ya fusionados, de modo que no requiere ningun paso adicional de aplicacion de LoRA. El autor advierte que la cuantizacion puede alterar ligeramente el comportamiento respecto a los pesos fusionados originales.

## Capacidades

- Generacion de texto y razonamiento aplicado al dominio de operaciones: redaccion de planes de capacidad, borradores de OKR, checklists de proveedores, SOP, documentos de traspaso, revisiones de cadencia y postmortems de incidentes.
- Conversacion multi-turno: la model card incluye la etiqueta conversational y el pipeline text-generation.
- Instrucciones y formato: al derivar de un modelo Instruct, sigue indicaciones y produce texto estructurado para documentos operativos.
- Capacidades de identidad y guardarrailes: el ajuste reporta una mejora de +17,1 puntos porcentuales en la categoria identity de su rubrica de evaluacion.
- Idiomas: soporte declarado unicamente para ingles.
- Contexto largo para su tamano: hasta 32.768 tokens, suficiente para documentos operativos extensos.
- No cubre: codigo general, conversacion ajena al dominio de operaciones, vision, audio, tool calling, function calling ni uso como agente autonomo (ninguna de estas capacidades se declara en la informacion disponible).

## Casos de uso

- Planificacion de capacidad en local: el modelo redacta borradores de planes de capacidad a partir de supuestos de demanda y recursos. Es el ambito con mayor mejora medida frente al base (+5,5 puntos porcentuales) y cabe en un portatil con GPU integrada o CPU.
- Borradores de OKR: generar objetivos y resultados clave alineados con una estrategia dada, con la ventaja de que el ajuste mejora la ejecucion de OKR en +11,1 puntos porcentuales respecto al base. El resultado debe revisarse antes de adoptarlo.
- Operaciones con proveedores: elaborar checklists de evaluacion, seguimiento y renovacion de proveedores; el ajuste mejora esta categoria en +5,6 puntos porcentuales.
- Documentacion de SOP: redactar y normalizar procedimientos operativos estandar en ingles para equipos internos. Conviene tener en cuenta que esta categoria rinde aproximadamente 3,7 puntos porcentuales por debajo del modelo base.
- Documentos de traspaso entre equipos o turnos: resumir estado, pendientes y riesgos. Es la categoria con peor comportamiento relativo del ajuste (-7,4 puntos porcentuales frente al base), por lo que se recomienda como apoyo, no como fuente final.
- Postmortems de incidentes: estructurar cronologia, causa raiz y acciones correctivas. El ajuste rinde aproximadamente 3,7 puntos porcentuales por debajo del base en esta categoria.
- Revisiones de cadencia operativa: preparar agendas y actas de reuniones periodicas (semanal, mensual, trimestral). Disponible en llama.cpp o LM Studio sin conexion a red.
- Inferencia privada en edge: al ser un GGUF de ~1,17 B, puede ejecutarse en un portatil o en un equipo sin GPU dedicada, lo que permite procesar informacion operativa sensible sin enviarla a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor publica una evaluacion con rubrica propia, comparando el ajuste con el modelo base:

| Categoria | Delta frente al base |
|---|---:|
| Rubrica global | +1,2 pp (90,7% frente a 89,5%) |
| capacity_planning | +5,5 pp |
| identity | +17,1 pp |
| okr_execution | +11,1 pp |
| vendor_ops | +5,6 pp |
| handoffs | -7,4 pp |
| sops | ~-3,7 pp |
| operating_cadence | ~-3,7 pp |
| incident_postmortem | ~-3,7 pp |

El resultado global se resume como BEATS_BASE: YES. La metodologia completa esta en la model card del modelo fusionado y en el artefacto evaluation/COMPARE_OPS.md. El propio autor califica la evaluacion como direccional y advierte que la cuantizacion puede modificar ligeramente el comportamiento respecto a los pesos fusionados.

## Requisitos de hardware

- VRAM estimada para inferencia: en Q4_K_M, alrededor de 0,7-0,8 GB de pesos mas overhead de contexto, en torno a 1,5-2 GB en total (estimacion a partir de los 1,17 B de parametros; no publicada por el autor). En F16 serian aproximadamente 2,3-2,5 GB de pesos.
- Cabe en GPU de consumo: si. Cualquier GPU con 4 GB o mas de VRAM es suficiente en cuantizaciones de 4 bits; tambien es viable en CPU con llama.cpp y en equipos con grafica integrada.
- GPU recomendadas: no se publican recomendaciones especificas. Por tamano, el modelo no necesita A100 ni H100; una RTX 3060, RTX 4060 o superior es mas que suficiente, e incluso sobra capacidad.
- Opciones de despliegue: llama.cpp (requiere una build que soporte la arquitectura LFM2), LM Studio y otras herramientas compatibles con GGUF. Tambien es compatible con endpoints segun la etiqueta endpoints_compatible. No se menciona soporte explicito de vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.
- Tamano del repositorio: 4,9 GB, lo que sugiere la presencia de varios archivos de cuantizacion, aunque el autor no publica la lista completa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Formato | Licencia |
|---|---|---|---|---|---|
| d4rkninja/tanpo-ops-GGUF | ~1,17 B | 32.768 tokens | Operaciones (planificacion, OKR, proveedores, SOP, incidentes) | GGUF | other (hereda LFM2.5) |
| d4rkninja/tanpo-ops | ~1,17 B | 32.768 tokens | Operaciones | Pesos fusionados (Transformers) | other (hereda LFM2.5) |
| d4rkninja/tanpo-ops-LoRA | ~1,17 B base | 32.768 tokens | Operaciones | Adaptador LoRA/PEFT | other (hereda LFM2.5) |
| LiquidAI/LFM2.5-1.2B-Instruct | ~1,17 B | 32.768 tokens | Proposito general e instrucciones | safetensors (checkpoint original) | LFM2.5 de Liquid AI |

Frente al modelo base, el ajuste mejora en planificacion de capacidad, identidad, ejecucion de OKR y operaciones con proveedores, y empeora en traspasos, SOP, cadencia operativa y postmortems. Otros especialistas de la misma familia (tanpo-marketing, tanpo-product, tanpo-hiring, tanpo-deals, tanpo-fundraising y tanpo-retention) comparten arquitectura y tamano, pero no se dispone de datos comparativos de rendimiento entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de proposito general ni frontera: esta acotado al dominio de operaciones y no se debe usar para programacion general ni conversacion fuera de ese ambito.
- El autor prohibe explicitamente su uso para decisiones operativas consecuentes automatizadas: asignacion de personal, control de accesos, decisiones sobre proveedores, gestion de incidentes y otras decisiones que requieran supervision.
- Riesgo de alucinacion: aunque la model card prohibe fabricar hechos, no se publican tasas de alucinacion ni evaluaciones de veracidad. Cualquier dato operativo debe contrastarse con los sistemas de origen, las politicas internas y los requisitos de control de acceso.
- Rendimiento desigual: el ajuste rinde por debajo del base en handoffs (-7,4 pp), sops, operating_cadence e incident_postmortem (~-3,7 pp cada uno). Conviene evaluar estas tareas caso por caso o considerar el modelo base para ellas.
- La evaluacion publicada es una rubrica propia y el propio autor la describe como direccional; no hay resultados en benchmarks estandar comparables con otros modelos.
- La cuantizacion GGUF puede alterar el comportamiento respecto a los pesos fusionados originales.
- Idioma: solo ingles declarado. No hay soporte de castellano ni de otros idiomas en la informacion disponible.
- Licencia: other, heredando las obligaciones de la licencia LFM2.5/LFM de Liquid AI. Es imprescindible revisar los terminos de Liquid AI antes de redistribuir los pesos o derivados, y no se debe asumir que Apache-2.0 cubre los pesos fusionados.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion independiente por parte de la comunidad.
- Sin datos de latencia, throughput ni recomendaciones de GPU publicadas por el autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/d4rkninja/tanpo-ops-GGUF
- Modelo fusionado (Transformers): https://huggingface.co/d4rkninja/tanpo-ops
- Adaptador LoRA: https://huggingface.co/d4rkninja/tanpo-ops-LoRA
- Coleccion Tanpo - Domain Specialists: https://huggingface.co/collections/d4rkninja/tanpo-domain-specialists-6aaccdb3985768f6dad8449b
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Checkpoint para carga compatible con Unsloth: https://huggingface.co/unsloth/LFM2.5-1.2B-Instruct
- Metodologia de evaluacion: https://huggingface.co/d4rkninja/tanpo-ops/blob/main/evaluation/COMPARE_OPS.md
- Perfil del autor: https://huggingface.co/d4rkninja
- Busqueda web: los resultados obtenidos no guardan relacion con el modelo (contenido sobre WikiLeaks y Vault 7), por lo que no aportan enlaces adicionales relevantes.
