# luca0621/polyedit-qwen3-8b-property-v1

## Resumen

PolyEdit Qwen3-8B property alignment es un ajuste fino completo (full-parameter SFT) del modelo Qwen3-8B, publicado por el usuario luca0621, especializado en interpretar requisitos de materiales poliméricos expresados en coreano y convertirlos en objetivos numéricos de propiedades parciales que después consume un generador externo denominado MMPAE. No es un adaptador LoRA: el repositorio contiene el checkpoint completo de 8.190.735.360 parámetros en FP32 (32,8 GB), con todas las capas entrenadas a partir de la revisión `b968826d9c46dd6066d109eabc6255188de91218` de Qwen/Qwen3-8B.

El problema que resuelve es muy concreto y de nicho: traducir lenguaje natural vago sobre polímeros ("que bloquee bien el oxígeno, para un envase ligero") en un conjunto acotado de propiedades físicas con valor y unidad, más una comprobación de anclaje (grounding) contra filas de referencia deterministas. El checkpoint cubre únicamente las etapas LLM del flujo evaluado (petición → intención → recuperación determinista de referencia conjunta → formateo numérico → verificación de grounding → MMPAE externo); no incluye los pesos de MMPAE ni realiza regresión física directa.

Es relevante ahora porque ejemplifica un patrón creciente: modelos pequeños/medianos de dominio, entrenados con datos sintéticos autorales y evaluados con métricas de exactitud estricta en lugar de benchmarks generales. El autor declara explícitamente que el modelo no superó su propia puerta de calidad para publicación (publication-quality gate: false), por lo que se distribuye como checkpoint de investigación con esa limitación conservada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3), ajustado con SFT de parámetros completos |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No declarada en la información proporcionada; el entrenamiento usó longitud máxima real de 2.213 tokens con tope configurado de 3.072 y sin truncamiento silencioso |
| Tipos de cuantizacion | No disponible; el checkpoint se publica en FP32 safetensors y no se han publicado variantes cuantizadas |
| Idiomas soportados | Coreano (`ko`) como idioma de entrenamiento y evaluación |
| Licencia | `qwen-apache-with-polyone-reference-terms` (licencia "other" con términos de referencia PolyOne) |
| Formato de pesos | safetensors, FP32 (sin conversión respecto al checkpoint evaluado) |

Datos adicionales: tamaño del repositorio 32,8 GB; pipeline `text-generation`; etiquetas `endpoints_compatible` y `text-generation-inference`; dataset de entrenamiento `luca0621/polyedit-korean-property-instructions-v6`.

## Arquitectura y entrenamiento

Arquitectura: se hereda íntegramente la del modelo base Qwen3-8B, un transformer decoder-only denso de 8,19 mil millones de parámetros, sin modificaciones estructurales ni mezcla de expertos. El ajuste es de parámetros completos (8.190.735.360 de 8.190.735.360 entrenables), en FP32 con matmul TF32, optimizador Adafactor factorizado y sin primer momento, learning rate 5e-6, batch 1 con acumulación 16, weight decay 0,01, 2 épocas y semilla 20261022. La pérdida es entropía cruzada solo sobre turnos del asistente, con pesos de ejemplo iguales; no hay objetivo causal/RL ni DPO/RLHF declarado.

Datos: 17.036 pares de tarea de entrenamiento (13.236 peticiones) y 1.838 pares de validación, organizados en dos tareas: interpretación de intención y formateo numérico con contexto de referencia. Las instrucciones fueron compuestas por el propio asistente con Python, no por expertos ni usuarios reales, y no se usó un profesor vía API. Los objetivos numéricos provienen de estimaciones ML de PolyOne tomadas de una única fila de referencia conjunta; la política de cuantiles q25/q75 es software explícito, no causalidad física aprendida. El entrenamiento se ejecutó con transformers 4.57.6 y torch 2.7.1+cu126 sobre una A100 de 80 GB, con asignación pico de 67,40 GiB. Se seleccionó la época 1 de 2 por exactitud equilibrada de intención y numérica en validación; el conjunto de test no se usó para elegir checkpoint.

Innovaciones destacables del pipeline (no del modelo en sí): recuperación determinista de referencias, verificación de grounding que bloquea la exportación de propiedades ante fallo de esquema, ambigüedad o ausencia de filas elegibles, y una codificación compacta específica (`polyedit.mmpae_compact.encode_properties_compact`) para la arquitectura MMTransformerAR evaluada.

## Capacidades

- Interpretación de intención: clasifica qué propiedades físicas solicita el usuario a partir de texto en coreano, distinguiendo peticiones de propiedad única, peticiones combinadas y solicitudes que requieren aclaración.
- Formateo numérico con contexto: emite valores y unidades en un `properties.json` restringido a las propiedades efectivamente solicitadas, por ejemplo `{"rho":{"value":1.2,"unit":"g/cm3"}}`.
- Verificación de anclaje: el script de inferencia se niega a exportar propiedades si falla el esquema, si hay ambigüedad o si no existen filas de referencia elegibles.
- Cobertura de 29 propiedades físicas soportadas (el autor advierte que la generalización a las 29 simultáneamente es limitada).
- Modo de razonamiento desactivado en la evaluación (`enable_thinking=False`), decodificación determinista (`do_sample=False`) y `max_new_tokens=1024` con parseo estricto y sin reparación de salida.
- Generación de texto conversacional en coreano heredada del modelo base, aunque el ajuste la orienta al dominio de materiales poliméricos.
- No incluye visión, audio, tool calling nativo ni objetivos de agente multi-paso declarados; el flujo multi-paso lo orquesta el script externo, no el modelo.

## Casos de uso

- Traducción de requisitos a objetivos numéricos: dado un requisito en coreano como una necesidad de barrera al oxígeno para envase ligero, el modelo produce el conjunto de propiedades y valores que se pasarán al generador MMPAE. Es adecuado porque el 90,0 % de exactitud numérica en el conjunto property-only100 indica reproducción fiable de objetivos derivados de referencia.
- Asistente interno de formulación de envases: un ingeniero describe el compromiso deseado (barrera, peso, rigidez) y el modelo devuelve las propiedades objetivo con unidades, listas para el pipeline de generación de estructuras.
- Detección de ambigüedad y clarificación: en el subconjunto PSMILES100 el modelo resolvió 5/5 solicitudes que requerían aclaración, por lo que sirve como filtro previo antes de gastar cómputo en el generador externo.
- Etapa LLM de un pipeline de descubrimiento de polímeros: se integra entre la interfaz de usuario y la recuperación determinista de referencias, con salida JSON validada apta para encadenarse en CI/CD de evaluación.
- Generación de datos de instrucciones de dominio: el repositorio incluye el dataset de entrenamiento y scripts de reproducción, útiles para crear corpus coreanos de instrucciones sobre propiedades de polímeros.
- Auditoría y control de calidad: gracias al rechazo explícito de exportación ante fallo de grounding, encaja como componente con trazabilidad en flujos regulados donde no se permite inventar valores.
- Investigación sobre alineamiento de dominio con datos sintéticos: sirve como caso de estudio reproducible (semilla, hiperparámetros y scripts publicados) del efecto de SFT completo frente a adaptadores en tareas de extracción numérica.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Evaluacion | Resultado |
|---|---:|
| Property-only100, intención exacta | 87,0 % |
| Property-only100, numérico exacto | 90,0 % |
| Property-only100, pipeline de propiedad completo exacto | 87,0 % |
| Test de redacción natural completo, 1.838 pares de tarea exactos | 91,13 % |
| Redacción natural completa, intención, 1.458 pares exactos | 89,03 % |
| Redacción natural completa, numérico, 380 pares exactos | 99,21 % |
| PSMILES100 separado, este LLM + MMPAE, Success@20 | 58/95 = 61,05 % |
| PSMILES100, clarificación | 5/5 |
| PSMILES100, peticiones combinadas | 63/100 |

Advertencias del propio autor: property-only100 y PSMILES100 usan identificadores de petición y pools de referencia distintos; la exactitud numérica mide reproducción de objetivos derivados de referencias, no precisión experimental de propiedades; el éxito en PSMILES se mide con un predictor de propiedades congelado y separado, no con mediciones de laboratorio. El generador externo evaluado es e260 EMA FP32 (SHA256 `f07b54117b3c99a11fad4051315506de84509e7265227c67fba5bdeb23e92d4d`), semilla 17, 20 candidatos, temperatura 0,8, top-p 0,95, máximo 160, sin reparación. No se han publicado resultados en benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Pesos en FP32: 32,8 GB en disco y en memoria; la inferencia en FP32 requiere aproximadamente 35-40 GB de VRAM contando caché KV y activaciones. El autor usó una A100 de 80 GB para el entrenamiento (pico de 67,40 GiB) y la inferencia de referencia se ejecuta en FP32 con SDPA.
- GPU de datacenter recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB. Con 40 GB se puede servir en FP32 con contexto corto; para lotes mayores conviene BF16.
- BF16: los pesos ocupan unos 16,4 GB, de modo que caben en una RTX 4090 (24 GB), RTX 5090, A6000 o L4 (24 GB) con margen limitado para caché KV. El autor indica que BF16 o cuantización "puede ser útil" pero no se usaron para los resultados reportados.
- Cuantización: no se publican GGUF ni AWQ/GPTQ. Una cuantización INT8 (~8,2 GB) o INT4 (~4,5 GB) cabría en tarjetas de consumo de 12-16 GB (RTX 3060 12 GB, 4060 Ti 16 GB, 4070 Ti Super 16 GB), pero implicaría una degradación no medida sobre la exactitud numérica reportada.
- Despliegue: el repositorio incluye `predict.py`, `polyedit/` y `references/`, y debe ejecutarse desde el directorio del snapshot (descarga con `snapshot_download`). Es compatible con transformers, y el etiquetado `text-generation-inference` y `endpoints_compatible` sugiere uso con TGI y endpoints tipo Inference Endpoints; vLLM es viable en BF16, aunque no hay cifras publicadas. No hay soporte declarado para llama.cpp u Ollama al no existir GGUF.
- Latencia y throughput: no disponibles. La configuración evaluada usa `max_new_tokens=1024`, decodificación greedy y `enable_thinking=False`, lo que mantiene las respuestas cortas y deterministas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| luca0621/polyedit-qwen3-8b-property-v1 | 8,19 B (FP32) | no disponible | Intención + formateo numérico de propiedades de polímeros en coreano | `qwen-apache-with-polyone-reference-terms` | HuggingFace, checkpoint completo |
| namhokaist/polyedit-qwen3-8b-full80 | no disponible | no disponible | Edición de polímeros condicionada por propiedades (Egc, Egb, Eea, Ei, EPS, Nc, Xc, Eat) con pérdida causal solo en turnos del asistente | no disponible | HuggingFace |
| Qwen/Qwen3-8B (base) | 8,19 B | no disponible en la información proporcionada | Modelo multilingüe general: lenguaje, código y matemáticas | Apache 2.0 (según el modelo base) | HuggingFace |

La comparación directa con el modelo base en las métricas del pipeline no está disponible en esta información: la model card menciona puntuaciones del modelo base original en `RESULTS_KO.md`, pero no reproduce los valores. El modelo de namhokaist parece un adaptador orientado a edición de polímeros en un paso, mientras que este checkpoint se centra en la extracción de intención y el formateo numérico previo al generador.

## Limitaciones y advertencias

- El autor marca la puerta interna de calidad para publicación como falsa: el checkpoint de 8B no alcanzó los umbrales originales de intención y pipeline y se publica como checkpoint de investigación con esa limitación.
- Supervisión sintética: las instrucciones fueron compuestas por el asistente con Python, no etiquetadas por expertos ni por usuarios reales, lo que limita la fidelidad al lenguaje industrial real.
- Los objetivos numéricos son estimaciones ML de PolyOne procedentes de una sola fila de referencia conjunta; la exactitud numérica mide reproducción de referencias, no validez física experimental.
- La política de cuantiles q25/q75 es software determinista, no causalidad física aprendida; el modelo no infiere propiedades a partir de lenguaje vago por sí mismo.
- Generalización limitada a las 29 propiedades cuando se solicitan todas simultáneamente; el autor remite a métricas por propiedad y por número de condiciones.
- Idioma: ajustado y evaluado únicamente en coreano; el rendimiento en castellano u otros idiomas no está caracterizado.
- Riesgo de alucinación mitigado parcialmente por el parseo estricto y la comprobación de grounding del script, pero no eliminado; el script rechaza exportar en caso de fallo, ambigüedad o ausencia de referencias elegibles.
- Integración MMPAE: sin `--scaler-json`, el bloque `mmpae` del resultado es explícitamente no normalizado y no debe usarse como entrada estandarizada; no se crean máscaras de propiedades faltantes ni slots ficticios. No se garantiza portabilidad a checkpoints MMPAE arbitrarios y no se incluyen pesos de generadores de terceros.
- El emparejamiento histórico del escaler con su entrenamiento no está plenamente demostrado, según el propio autor.
- Los subconjuntos PSMILES100 y la selección de la línea base forzada a JSON presentan limitaciones de exposición previa y de diseño post-hoc reconocidas en la model card.
- Licencia: `qwen-apache-with-polyone-reference-terms` no es una licencia estándar; es imprescindible revisar `LICENSE.md` antes de cualquier uso comercial, ya que añade términos de referencia PolyOne sobre la base Apache de Qwen.
- Madurez comunitaria mínima: 0 descargas y 1 like en el momento de la consulta, sin validación independiente de los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/luca0621/polyedit-qwen3-8b-property-v1
- Licencia del modelo: https://huggingface.co/luca0621/polyedit-qwen3-8b-property-v1/blob/main/LICENSE.md
- Resultados detallados citados en la model card: https://huggingface.co/luca0621/polyedit-qwen3-8b-property-v1/blob/main/RESULTS_KO.md y https://huggingface.co/luca0621/polyedit-qwen3-8b-property-v1/blob/main/ALL_EXPERIMENT_RESULTS_KO.html
- Dataset de entrenamiento: https://huggingface.co/datasets/luca0621/polyedit-korean-property-instructions-v6
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Modelo comparable (adaptador de edición de polímeros): https://huggingface.co/namhokaist/polyedit-qwen3-8b-full80
- Qwen3-8B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_8b
- Repositorio de exportación de Qualcomm para Qwen3-8B: https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/qwen3_8b/README.md
