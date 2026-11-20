# ibm-granite/granitelib-guardian-r1.0

## Resumen

Granite Guardian Library es una colección de adaptadores LoRA desarrollada por IBM (organización `ibm-granite`) para dotar a modelos de la familia Granite de capacidades de moderación, verificación de factualidad y cumplimiento de políticas. No se trata de un modelo único, sino de un repositorio que agrupa cuatro familias de adaptadores —Guardian Core, Factuality Detection, Factuality Correction y Policy Guardrails— entrenadas sobre cuatro modelos base: `granite-4.0-micro`, `granite-4.1-3b`, `granite-4.1-8b` y `granite-4.1-30b`.

El problema que resuelve es la necesidad de incorporar capas de control en sistemas basados en LLM: detectar riesgos de seguridad (daño, jailbreaking, contenido sexual, violencia, sesgo social), identificar alucinaciones en llamadas a herramientas y en pipelines RAG, corregir respuestas factualmente incorrectas a partir de pasajes de contexto y verificar si un escenario cumple o viola una política dada. Los adaptadores operan como jueces que devuelven una salida estructurada en JSON con un campo `score` de tipo `"yes"`/`"no"` (o `"Ambiguous"` en el caso de Policy Guardrails).

La relevancia actual radica en que estos adaptadores se publican bajo licencia Apache 2.0, están firmados criptográficamente con Sigstore (identidad `Granite-sign@ibm.com`) y se integran con el framework Mellea, que los denomina "intrinsics". El repositorio ocupa 6,5 GB e incluye todas las variantes de modelo, lo que permite desplegar la capa de control con el tamaño de modelo base que mejor se ajuste al presupuesto de cómputo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre modelos base transformer de la familia Granite |
| Parametros totales | No disponible (depende del modelo base: granite-4.0-micro, granite-4.1-3b, granite-4.1-8b, granite-4.1-30b) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`), configuración PEFT (`adapter_config.json`), `io.yaml` y firma `model.sig` |
| Modelos base compatibles | granite-4.0-micro, granite-4.1-3b, granite-4.1-8b, granite-4.1-30b |
| Familias de adaptadores | Guardian Core, Factuality Detection, Factuality Correction, Policy Guardrails |
| Tamano del repositorio | 6,5 GB |
| Firma de artefactos | Sigstore, identidad `Granite-sign@ibm.com` |

## Arquitectura y entrenamiento

Cada adaptador es un módulo LoRA que se acopla a un modelo base Granite preentrenado. La arquitectura subyacente es, por tanto, la del transformer del modelo base correspondiente; el adaptador añade matrices de bajo rango que modifican el comportamiento del modelo para una tarea concreta de evaluación o corrección. El repositorio no documenta el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en la información disponible.

La innovación técnica destacable no está en la arquitectura del transformer, sino en el diseño de las tareas: Factuality Detection evalúa respuestas contra uno o varios pasajes de contexto y detecta conflictos, tergiversaciones u omisiones selectivas de evidencia; Factuality Correction corrige respuestas largas compuestas por múltiples unidades atómicas (hechos o afirmaciones) preservando las capacidades generativas y de razonamiento del modelo base; Policy Guardrails introduce una tercera etiqueta (`Ambiguous`) para casos en los que no es posible decidir con alta certeza. Todos los artefactos van firmados con Sigstore, lo que permite verificar su integridad y procedencia tras la descarga.

## Capacidades

- Evaluación de riesgos de seguridad en prompts y respuestas: daño, jailbreaking, lenguaje soez, violencia, contenido sexual, sesgo social y comportamiento no ético (Guardian Core).
- Detección de alucinaciones en llamadas a herramientas y funciones (tool/function calls).
- Detección de alucinaciones en sistemas RAG y basados en agentes.
- Evaluación de factualidad contra pasajes de contexto que pueden contener información contradictoria (Factuality Detection).
- Corrección de respuestas factualmente incorrectas en textos largos con múltiples afirmaciones atómicas (Factuality Correction).
- Verificación de cumplimiento de políticas sobre un escenario dado, con salida ternaria: cumple, viola o ambiguo (Policy Guardrails).
- Salida estructurada en JSON con campo `score` (`"yes"`/`"no"`), lo que facilita su integración en pipelines automatizados.
- Capacidad de razonamiento y generación heredada del modelo base Granite subyacente.
- Integración nativa con el framework Mellea (los adaptadores se invocan como "intrinsics").
- Verificación de integridad de los artefactos mediante firmas Sigstore.

## Casos de uso

- Moderación de contenido en producción: desplegar Guardian Core sobre `granite-4.1-3b` para clasificar prompts y respuestas de un chatbot antes de mostrarlas al usuario, devolviendo `"yes"` cuando se detecta riesgo y bloqueando la respuesta en ese caso.
- Control de alucinaciones en pipelines RAG: usar Factuality Detection para comparar la respuesta generada con los fragmentos recuperados y marcar como sospechosas aquellas respuestas que contradigan o ignoren la evidencia del contexto.
- Corrección automática de respuestas: aplicar Factuality Correction sobre respuestas largas para reescribir únicamente las afirmaciones que entran en conflicto con el contexto, preservando el resto del texto generado por el modelo base.
- Validación de llamadas a herramientas en agentes: emplear Guardian Core para detectar alucinaciones en los argumentos de function calling antes de ejecutar la herramienta, evitando efectos secundarios no deseados.
- Cumplimiento normativo y de políticas internas: usar Policy Guardrails para evaluar si una acción o respuesta de un agente respeta una política corporativa, con la etiqueta `Ambiguous` como señal para revisión humana.
- Filtrado previo en sistemas multiagente: integrar los adaptadores como capa de verificación entre agentes, de modo que cada mensaje intercambiado se valide contra criterios de seguridad y factualidad antes de propagarse.
- Evaluación offline de calidad de modelos: utilizar los cuatro adaptadores como conjunto de jueces para medir tasas de alucinación y de violaciones de política en un corpus de respuestas generadas, con salida JSON agregable.
- Despliegue con distintos presupuestos de cómputo: elegir la variante del adaptador (micro, 3b, 8b o 30b) según los requisitos de latencia y precisión del entorno de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El consumo de VRAM depende del modelo base elegido, no del adaptador LoRA, que añade una sobrecarga mínima.
- `granite-4.0-micro` y `granite-4.1-3b`: aptos para GPU de consumo como RTX 4090, RTX 3090 o superiores, con cuantización si fuese necesaria.
- `granite-4.1-8b`: viable en GPU de consumo de gama alta (RTX 4090 con 24 GB) y en GPU de datacenter como A100 o H100.
- `granite-4.1-30b`: requiere GPU de datacenter (A100 80 GB, H100) o configuraciones multi-GPU.
- Opciones de despliegue: los adaptadores son PEFT, por lo que pueden cargarse con la librería `peft` de Hugging Face sobre el modelo base; el soporte en vLLM, llama.cpp, Ollama o TGI dependerá del soporte de LoRA de cada herramienta para el modelo base concreto (no disponible en la información proporcionada).
- La invocación recomendada por el autor es a través del framework Mellea.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Granite Guardian Library (este) | Adaptadores LoRA sobre Granite | Depende del base (micro, 3b, 8b, 30b) | No disponible | Apache 2.0 | Hugging Face, firmado con Sigstore |
| Llama Guard (Meta) | Modelo de moderación dedicado | No disponible en la información proporcionada | No disponible | Licencia Llama | No disponible en la información proporcionada |
| ShieldGemma (Google) | Modelo de moderación dedicado | No disponible en la información proporcionada | No disponible | Licencia Gemma | No disponible en la información proporcionada |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés (`en`); no hay evidencia de capacidades multilingües en la información disponible.
- Al ser adaptadores LoRA, requieren cargar el modelo base correspondiente; el repositorio completo ocupa 6,5 GB, pero el despliegue real necesita además los pesos del base.
- La calidad de la detección y corrección depende del modelo base elegido; no se han publicado métricas que permitan comparar el rendimiento entre las variantes micro, 3b, 8b y 30b.
- Riesgo de falsos positivos y falsos negativos inherente a cualquier clasificador de seguridad; la etiqueta `Ambiguous` de Policy Guardrails mitiga parcialmente este problema, pero no lo elimina.
- El propio adaptador puede alucinar en su juicio; se recomienda validar sus salidas en dominios críticos.
- No se documentan sesgos conocidos ni la composición del dataset de entrenamiento, lo que dificulta auditar el comportamiento en subgrupos.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar también la licencia del modelo base Granite que utilice.
- La verificación de firmas requiere la herramienta `model-signing` y el proveedor de identidad `https://sigstore.verify.ibm.com/oauth2`; sin este paso no se garantiza la integridad de los artefactos descargados.
- El uso recomendado pasa por el framework Mellea; fuera de él, la integración con los adaptadores no está documentada en la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ibm-granite/granitelib-guardian-r1.0
- Modelo base granite-4.0-micro: https://huggingface.co/ibm-granite/granite-4.0-micro
- Modelo base granite-4.1-3b: https://huggingface.co/ibm-granite/granite-4.1-3b
- Modelo base granite-4.1-8b: https://huggingface.co/ibm-granite/granite-4.1-8b
- Modelo base granite-4.1-30b: https://huggingface.co/ibm-granite/granite-4.1-30b
- Framework Mellea: https://mellea.ai
- Ejemplos de adaptadores en Mellea: https://github.com/generative-computing/mellea/tree/main/docs/examples/intrinsics
- Herramienta de verificación de firmas: https://github.com/sigstore/model-transparency
- Página oficial de Granite: https://www.ibm.com/granite
- Documentación de Granite: https://www.ibm.com/granite/docs/
- Blog de investigación de IBM: https://research.ibm.com/blog/gra
