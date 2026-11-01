# ninhnv/chon-1.1-31b

## Resumen

Chon-1.1-31B es un adaptador LoRA de rango 32 (aproximadamente 2,0 GB) sobre el modelo base google/gemma-4-31B-it, desarrollado por el usuario ninhnv. No es un modelo generativo al uso: se trata de un modelo de decisiones tipadas (typed decisions) que, dado un estado (texto, JSON o una conversación) y una o varias preguntas con un conjunto cerrado de opciones, devuelve una probabilidad calibrada para cada opción. Soporta tres tipos de pregunta: elección entre 2 y 256 opciones etiquetadas, sí/no (P(yes)) y puntuación sobre niveles ordenados.

La relevancia del modelo reside en su enfoque de inferencia: cada respuesta se obtiene en un único forward pass sobre las letras de las opciones, sin generar texto. Esto lo aleja de los LLM generativos y lo sitúa en el terreno de la clasificación calibrada y el enrutamiento de decisiones, con un formato de cableado propio (`/v1/systemone`) compatible con JevBench y el Decision Index. El adaptador se sirve junto al modelo base sin modificarlo.

El modelo está pensado para escenarios donde se necesita una decisión discreta con probabilidades interpretables (enrutamiento de tickets, clasificación de intenciones, evaluación de criterios booleanos) y no para generación libre de texto. Su licencia Apache-2.0 y su integración con el ecosistema JevBench lo hacen adecuado para evaluación comparativa en tareas de decisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 32) sobre transformer google/gemma-4-31B-it |
| Parametros totales | 31B en el modelo base; adaptador LoRA de ~2,0 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en el motor Decision Index; 65.536 tokens en el servidor HTTP |
| Tipos de cuantizacion | no disponible (se sirve en bf16) |
| Idiomas soportados | inglés; vietnamita también soportado |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 (~2,0 GB) acoplado a google/gemma-4-31B-it, que se carga sin modificaciones junto al adaptador. La innovación técnica principal no está en la arquitectura del transformer subyacente, sino en la cabeza de decisión: cada pregunta se responde con un único forward pass sobre las letras de las opciones, sin decodificación autoregresiva. Esto permite obtener distribuciones de probabilidad calibradas sobre conjuntos cerrados de opciones en lugar de texto libre.

El modelo maneja tres tipos de pregunta: choice (2-256 opciones; más de 16 se leen en grupos y luego una ronda final), yes/no (probabilidad de sí) y score (distribución sobre niveles ordenados). El motor Decision Index acepta estados de hasta 32.768 tokens y reporta como no soportados los más largos (nunca los trunca); el servidor HTTP admite hasta 65.536 tokens, conservando el inicio en caso de exceso. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO.

## Capacidades

- Clasificación de decisiones tipadas: elección entre 2 y 256 opciones etiquetadas con probabilidades calibradas.
- Preguntas booleanas: devuelve P(yes) con calibración (error de calibración esperado de 0,023 en los ítems públicos).
- Puntuación sobre niveles ordenados: distribución de probabilidad sobre escalas ordinales.
- Procesamiento de estados en texto, JSON o conversación, con contexto de hasta 32.768 tokens (motor) o 65.536 tokens (servidor).
- Soporte multilingüe limitado a inglés y vietnamita.
- Integración con el formato de cableado TypeSafe `/v1/systemone` de JevBench y el Decision Index.
- Sin generación de texto: cada respuesta es un único forward pass sobre las letras de las opciones (output_tokens siempre 0).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad nativa; el modelo está orientado a decisiones puntuales.
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia, el modelo elige entre categorías cerradas (reembolso, envío, otros) con probabilidades asociadas. Es adecuado porque devuelve una distribución calibrada sobre opciones predefinidas, lo que permite umbrales de confianza y derivación a revisión humana.
- Clasificación de intenciones en asistentes conversacionales: con un estado en forma de conversación y un conjunto cerrado de intenciones, el modelo asigna probabilidad a cada una, facilitando el enrutamiento a flujos deterministas sin generación de texto.
- Evaluación de criterios booleanos en pipelines de datos: preguntas sí/no sobre registros (por ejemplo, "¿el pedido llegó dañado?") con P(yes) calibrada, útil para filtrado automático y auditoría.
- Puntuación ordinal de calidad o riesgo: distribución sobre niveles ordenados (bajo, medio, alto) para priorización de colas de revisión o scoring de contenido.
- Evaluación comparativa de sistemas de decisión: el modelo sirve como referencia en JevBench y el Decision Index, permitiendo medir inteligencia, calibración y latencia frente a otros enfoques.
- Moderación o triaje con contexto largo: estados de hasta 32.768 tokens permiten clasificar documentos extensos o hilos de conversación completos sin truncamiento.
- Automatización de decisiones en backoffice: selección entre opciones operativas (por ejemplo, tipo de resolución de una reclamación) con probabilidades auditables y latencia mediana de 154 ms en una RTX PRO 6000.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados oficialmente):

| Benchmark | Metrica | Valor |
|---|---|---|
| Decision Index (suite pública, edición 0.3) | Decision Index | 65,47 |
| Decision Index | balanced raw / breadth skill | 73,47 / 64,89 |
| Decision Index | filas puntuables respondidas | 140.178 de 140.620 leídas; 0 no soportadas, 0 errores |

Desglose por área en Decision Index (skill / raw):

| Area | Skill | Raw |
|---|---:|---:|
| tools | 0,791 | 0,812 |
| language | 0,699 | 0,785 |
| retrieval | 0,674 | 0,748 |
| knowledge | 0,555 | 0,640 |
| arts | 0,507 | 0,681 |

Latencia en la suite completa (una RTX PRO 6000 Blackwell, 96 GB, una petición a la vez por GPU):

| Metrica | Valor |
|---|---:|
| Mediana | 154 ms |
| Media | 725 ms |
| Percentil 80 | 585 ms |
| Percentil 99 | 3.782 ms |

JevBench (ítems públicos):

| Fichero | Items | Precision |
|---|---:|---:|
| hard | 111 | 88,3 |
| original | 72 | 100,0 |
| easy | 48 | 100,0 |

Puntuaciones JevBench con las fórmulas publicadas:

| Servicio | Intelligence | Calibration (proxy) | Composite |
|---|---:|---:|---:|
| Tal cual | 80,6 | 90,6 | 85,6 |
| Con `--noul-commit 0.199,0.801` (v1.6.0) | 84,4 | 91,9 | 88,1 |

El error de calibración esperado en los ítems públicos es de 0,023. El conjunto público es pequeño (231 ítems), por lo que unas pocas respuestas mueven las cifras un punto o más. El Decision Index completo (privado) aún no ha puntuado este modelo.

## Requisitos de hardware

- VRAM estimada: una GPU con 80 GB o más para servir en bf16 (modelo base de 31B más adaptador de ~2,0 GB).
- GPU recomendadas: RTX PRO 6000 Blackwell (96 GB) es la empleada en las mediciones del autor; A100 80 GB o H100 80 GB son opciones equivalentes en capacidad.
- Cabe en GPU consumer: no en bf16; no se dispone de información sobre cuantizaciones que permitan reducir requisitos.
- Opciones de despliegue: servidor propio de Chon (`python -m chon.serve`, paquete `chon[serve]`, versión v1.5.3 o superior) o la API Python `chon.infer.DecisionModel`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 154 ms, media de 725 ms, percentil 80 de 585 ms y percentil 99 de 3.782 ms por petición en una RTX PRO 6000, con una petición a la vez por GPU. Las peticiones más lentas corresponden a 20-30 preguntas sobre un estado corto, con prompts compartidos de 56.000-73.000 tokens; 32 peticiones se releyeron en fragmentos menores tras agotar la memoria de GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (modelos de decisión tipada con probabilidades calibradas) en la documentación proporcionada. Como referencia de categoría, se puede comparar con el propio modelo base y con clasificadores generativos:

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| chon-1.1-31b | 31B (base) + LoRA r32 | 32.768 / 65.536 tokens | Decisiones tipadas calibradas, sin generación | Apache-2.0 |
| google/gemma-4-31B-it | 31B | no disponible | LLM generativo con instrucciones | no disponible |
| Clasificadores generativos basados en LLM | variable | variable | Generación de etiqueta en texto libre | variable |

No se han publicado comparaciones directas con alternativas en la información disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre; solo responde a preguntas con conjuntos cerrados de opciones.
- Idiomas limitados a inglés y vietnamita; el rendimiento en otros idiomas no está documentado.
- El Decision Index completo (privado) no ha puntuado el modelo; las cifras públicas son autoinformadas y no verificadas.
- El conjunto público de JevBench es pequeño (231 ítems), por lo que la variabilidad de las métricas es alta.
- La calibración en JevBench es un proxy: el mapeo de calibración no está completamente publicado.
- El modo `--noul-commit` está desactivado por defecto y no se usa en el Decision Index; su efecto en producción no está caracterizado.
- Estados superiores a 32.768 tokens se reportan como no soportados en el motor Decision Index (no se truncan); en el servidor HTTP, los estados superiores a 65.536 tokens conservan solo su inicio.
- Requiere una GPU de 80 GB o más en bf16; no se documentan opciones de cuantización para hardware menor.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las probabilidades pueden estar mal calibradas fuera de la distribución de entrenamiento.
- Sesgos conocidos: no disponible.
- Restricciones de licencia: Apache-2.0, igual que el modelo base; se debe verificar la licencia de google/gemma-4-31B-it para uso comercial.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/ninhnv/chon-1.1-31b
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Repositorio de serving y guía: https://github.com/xoai/chon (Apache-2.0, release v1.5.3 o superior)
- JevBench: no disponible como enlace directo en la información proporcionada
- Decision Index: no disponible como enlace directo en la información proporcionada
