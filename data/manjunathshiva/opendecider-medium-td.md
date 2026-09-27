# manjunathshiva/opendecider-medium-td

# OpenDecider-medium-td

## Resumen

OpenDecider-medium-td es un modelo de decisión de tipo system one desarrollado por el autor manjunathshiva dentro de la familia OpenDecider. Se construye sobre Qwen/Qwen3-30B-A3B-Instruct-2507, un transformer de mezcla de expertos (MoE) de 30 000 millones de parámetros totales y aproximadamente 3 000 millones activos, al que se le aplica un adaptador LoRA mediante PEFT. El resultado es un clasificador generativo que responde a preguntas tipadas y devuelve una probabilidad calibrada por opción, sin generar texto que haya que parsear.

El problema que resuelve es el de las decisiones estructuradas y calibradas: enrutamiento, clasificación, puntuación y verificación. El modelo acepta tres tipos de pregunta (`choice`, `score` y `noul`) sobre texto libre o JSON, y devuelve distribuciones de probabilidad para cada criterio. Su propuesta diferencial es la calibración: según la model card, es el sistema evaluado más cercano al reparto de votos humanos en ChaosNLI (JSD 0,035) y obtiene 0,765 en 200 decisiones generales no vistas durante el entrenamiento.

Es relevante ahora porque compite en precisión con APIs propietarias de decisión manteniendo pesos abiertos bajo licencia Apache-2.0 y una latencia mediana de 214 ms por pregunta en 4x L40S. La familia incluye variantes nano, small y small-td, todas ellas comparadas en el mismo banco de pruebas por el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE) Qwen3-30B-A3B-Instruct-2507 con adaptador LoRA (PEFT) |
| Parametros totales | ~30 000 millones en el modelo base; el adaptador ocupa ~0,1 GB |
| Parametros activos | ~3 000 millones (3B activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT); el modelo base se descarga aparte al primer uso (~61 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de mezcla de expertos con 30 000 millones de parámetros totales y 3 000 millones activos, correspondiente al modelo Qwen3-30B-A3B-Instruct-2507. Sobre esa base se entrena un adaptador LoRA que convierte al modelo en un cabezal de decisión: en lugar de generar texto, emite una probabilidad por cada opción declarada en la consulta, con tres modos tipados (`choice` para elegir entre alternativas, `score` para puntuar según criterios y `noul` para decisiones binarias). La model card describe el proceso como destilación más ajuste LoRA.

Los conjuntos de datos declarados son heterogéneos y cubren clasificación de intenciones (clinc/clinc_oos), clasificación zero-shot (knowledgator/gliclass-v2.0), emociones (google-research-datasets/go_emotions), QA extractivo y multi-salto (rajpurkar/squad_v2, hotpotqa/hotpot_qa), inferencia textual (alisawuffles/WANLI), clasificación temática (fancyzhx/dbpedia_14), moderación (google/civil_comments), spam (ucirvine/sms_spam), paráfrasis (google-research-datasets/paws) y un conjunto propio de decisiones tipadas (LocalLLaMA/typed-decisions). No se especifica el número total de tokens de entrenamiento ni la composición exacta de las mezclas. Sí se indica que ni nano, ni small-td, ni medium-td usaron la partición de test del banco typed-decisions durante el ajuste.

Como innovación destacable, el modelo no requiere decodificación de texto: el resultado es directamente una distribución de probabilidad calibrada, lo que elimina el parseo de salidas y permite medir error de calibración (ECE). El entrenamiento movió al modelo base de 0,745 a 0,765 de precisión en las 200 decisiones generales y redujo su error de calibración.

## Capacidades

- Clasificación y enrutamiento de decisiones tipadas en tres modos: `choice`, `score` y `noul`.
- Asignación de probabilidad calibrada por opción, sin generación de texto intermedio.
- Clasificación zero-shot sobre texto libre o estructuras JSON arbitrarias.
- Procesamiento de decisiones de negocio sobre campos estructurados (por ejemplo, facturas con importe, proveedor y número de orden de compra).
- Inferencia de relación textual y detección de contradicción sobre pares de frases.
- Respuesta a preguntas con verificación de evidencia, incluyendo conjuntos sin respuesta garantizada (SQuAD v2) y multi-salto (HotpotQA).
- Clasificación de emociones y análisis de matices afectivos en texto corto.
- Moderación de contenido y estimación de riesgo sobre comentarios.
- Detección de spam y de paráfrasis/duplicados.
- Descarte de soporte de tool calling, function calling, agentes autónomos o razonamiento multi-paso: no se documenta ninguna de estas capacidades.
- Multilingüismo: no disponible; la model card declara únicamente inglés.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Triaje de cuentas a pagar: el modelo recibe un JSON con los campos de la factura y devuelve la probabilidad de aprobar, retener o rechazar el pago, más una puntuación de riesgo y una decisión binaria sobre si requiere revisión humana, tal como muestra el ejemplo de la model card.
- Enrutamiento de consultas en atención al cliente: sobre peticiones entrantes en inglés, el modelo asigna probabilidades a las intenciones disponibles (basado en clinc/clinc_oos) y permite dirigir cada caso al flujo o al equipo adecuado sin parsear texto generado.
- Moderación de comentarios en plataformas: clasificación zero-shot de comentarios según criterios de toxicidad o riesgo, aprovechando el entrenamiento declarado sobre google/civil_comments.
- Evaluación de trazas de agentes: la propia documentación del autor señala los flujos de trabajo empresariales (triaje, alertas de seguridad, trazas de agentes) como caso de uso de la variante small-td, extensible aquí cuando se requiere la máxima precisión.
- Filtrado de spam en mensajes cortos: clasificación de SMS y mensajes breves, un dominio incluido explícitamente en los datos de entrenamiento (ucirvine/sms_spam).
- Análisis de sentimiento y emoción en encuestas: etiquetado de emociones sobre respuestas abiertas (go_emotions) para priorizar incidencias o detectar clientes insatisfechos.
- Detección de duplicados y paráfrasis en catálogos: comparación de pares de textos (paws) para deduplicar descripciones de producto, artículos o tickets.
- Verificación de respuestas en pipelines de RAG: uso del modo `noul` o `score` para decidir si un pasaje recuperado responde realmente a la pregunta, apoyándose en el entrenamiento sobre SQuAD v2 y HotpotQA.
- Clasificación temática de documentos: etiquetado de noticias o contenidos en categorías predefinidas (dbpedia_14) mediante preguntas `choice`.

## Benchmarks y rendimiento

Resultados publicados en la model card. Todos los modelos respondieron las mismas preguntas y fueron puntuados por el mismo código. TypeSafe Jev se midió a través de su propia API.

| Benchmark | TypeSafe Jev 1.13 | Laya typed-decisions | OpenDecider-nano | OpenDecider-small | OpenDecider-small-td | OpenDecider-medium-td |
|---|---|---|---|---|---|---|
| typed-decisions (2000 decisiones) | 0,754 | 0,766 | 0,796 | 0,671 | 0,792 | 0,788 |
| 200 decisiones generales | 0,730 | 0,570 | 0,680 | 0,735 | 0,715 | 0,765 |
| Batería de aplicaciones de Laya (10 tareas) | 0,774 | 0,702 | 0,656 | 0,702 | 0,703 | 0,725 |
| Error de calibración (ECE) ↓ | 0,164 | 0,162 | 0,092 | 0,087 | 0,107 | 0,110 |
| Distancia al voto humano (ChaosNLI JSD) ↓ | 0,148 | 0,111 | 0,045 | 0,040 | 0,040 | 0,035 |
| Latencia mediana, 1 pregunta | 404 ms (API) | 21 ms | 16 ms (L40S) | 40 ms (L40S) | 40 ms (L40S) | 214 ms (4x L40S) |

Comparación contra modelos frontera en las mismas 200 decisiones generales:

| Modelo | Precisión | ECE ↓ | Latencia mediana |
|---|---|---|---|
| Claude Fable 5.1 | 0,840 | 0,064 | 4,27 s |
| GPT-6 Astra | 0,790 | 0,119 | 2,22 s |
| OpenDecider-medium-td | 0,765 | 0,110 | 214 ms |
| DeepSeek V4.1 Flash | 0,760 | 0,138 | 4,08 s |
| MiniMax M3 | 0,755 | 0,112 | 1,02 s |
| Qwen3-30B-A3B-Instruct-2507 sin entrenar (base) | 0,745 | 0,233 | no disponible |
| TypeSafe Jev 1.13 | 0,730 | 0,164 | 404 ms |

En el conjunto typed-decisions, la mejora frente al checkpoint de Laya es de +0,022 (intervalo de confianza del 95 %: +0,005 a +0,040).

## Requisitos de hardware

- VRAM estimada: aproximadamente 61 GB de memoria de GPU, según la model card.
- El modelo está pensado para GPU NVIDIA; la model card no documenta compatibilidad con otras plataformas de aceleración.
- Medido en producción sobre 4x L40S, con una latencia mediana de 214 ms por pregunta.
- GPU de consumo: no disponible. Con ~61 GB de huella, una única GPU de consumo de 24 GB (RTX 4090, RTX 3090) no es suficiente; la documentación no detalla combinaciones de GPU de consumo compatibles.
- La librería `opendecider` reparte el modelo entre todas las GPU visibles, y la versión 0.1.2 o superior es un requisito para ello.
- Opciones de despliegue: la vía documentada es la librería propia `opendecider` (PyPI), que descarga el modelo base de 61 GB en el primer uso. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 214 ms de mediana por pregunta en 4x L40S. No se publica throughput ni latencia en otras configuraciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión (200 decisiones generales) | ECE ↓ | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| OpenDecider-medium-td | ~30B totales, ~3B activos (MoE + LoRA) | no disponible | 0,765 | 0,110 | Apache-2.0 | Pesos abiertos en HuggingFace; ~61 GB de VRAM |
| OpenDecider-small | no disponible | no disponible | 0,735 | 0,087 | Apache-2.0 (según la familia OpenDecider) | Pesos abiertos; ~16 GB de Mac o una GPU |
| OpenDecider-small-td | no disponible | no disponible | 0,715 | 0,107 | Apache-2.0 (según la familia OpenDecider) | Pesos abiertos; ~16 GB de Mac o una GPU |
| OpenDecider-nano | ~400M | no disponible | 0,680 | 0,092 | Apache-2.0 (según la familia OpenDecider) | Pesos abiertos; ejecución en CPU, 16 ms por pregunta |
| TypeSafe Jev 1.13 | no disponible | no disponible | 0,730 | 0,164 | no disponible | Solo API; 404 ms por pregunta |
| Laya typed-decisions | no disponible | no disponible | 0,570 | 0,162 | no disponible | Checkpoint publicado; 21 ms por pregunta |
| Qwen3-30B-A3B-Instruct-2507 (base sin entrenar) | ~30B totales, ~3B activos | no disponible | 0,745 | 0,233 | Apache-2.0 (modelo base) | Pesos abiertos |

Nota: la model card afirma que OpenDecider-medium-td es el sistema ejecutable localmente con mayor precisión en decisiones no vistas, por delante de TypeSafe Jev y del resto de variantes OpenDecider, y solo por detrás de Claude Fable 5.1 y GPT-6 Astra.

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte de inglés (`en`); no se documenta rendimiento en castellano ni en otros idiomas.
- Sesgos: no se publica ninguna evaluación de sesgo ni de equidad en la información disponible.
- Alucinación: al no generar texto libre, el riesgo se traslada a la confianza mal calibrada; su ECE de 0,110 es mejor que el de TypeSafe Jev (0,164) y el del modelo base (0,233), pero peor que el de OpenDecider-small (0,087).
- Las probabilidades dependen de los criterios y las instrucciones que se pasen en la consulta; no hay garantía de robustez ante formulaciones ambiguas o mal especificadas.
- Longitud de contexto: no disponible, lo que impide dimensionar casos con documentos largos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-30B-A3B-Instruct-2507, ya que el adaptador se distribuye por separado.
- Requisito de hardware exigente: ~61 GB de VRAM en GPU NVIDIA, muy por encima de una GPU de consumo, lo que limita el despliegue en edge o en estaciones de trabajo convencionales.
- Dependencia de la librería `opendecider` (versión 0.1.2 o superior) para el reparto entre GPU; no se documentan alternativas de servido estándar.
- Los resultados de benchmarks están publicados por el propio autor del modelo y del banco de pruebas, salvo el caso de TypeSafe Jev, medido a través de su API; no se han replicado de forma independiente en la información disponible.
- El repositorio del adaptador ocupa 0,1 GB, pero el modelo base de 61 GB se descarga en el primer uso, lo que debe preverse en la planificación de despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/manjunathshiva/opendecider-medium-td
- Repositorio GitHub de OpenDecider: https://github.com/manjunathshiva/opendecider
- Paquete en PyPI: https://pypi.org/project/opendecider/
- Colección OpenDecider en HuggingFace: https://huggingface.co/collections/manjunathshiva/opendecider-6ab8c838909092518d50a9ea
- Comparativa completa de benchmarks: https://github.com/manjunathshiva/opendecider/blob/main/COMPARISON.md
- Arnés de benchmarks: https://github.com/manjunathshiva/opendecider/tree/main/benchmarks
- Arnés de comparación Jev-vs-Laya: https://github.com/pavanjava/jev_and_laya_benchmarking
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Variante OpenDecider-small: https://huggingface.co/manjunathshiva/opendecider-small
- Variante OpenDecider-small-td: https://huggingface.co/manjunathshiva/opendecider-small-td
- Variante OpenDecider-nano: https://huggingface.co/manjunathshiva/opendecider-nano
- Modelo base Qwen3-30B-A3B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
