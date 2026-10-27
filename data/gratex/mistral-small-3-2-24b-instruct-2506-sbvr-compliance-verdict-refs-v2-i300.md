# gratex/Mistral-Small-3.2-24B-Instruct-2506-sbvr-compliance-verdict-refs-v2-i300

## Resumen

Este modelo es un ajuste fino (LoRA fusionado, artefacto de tipo merged-hf) de `mistralai/Mistral-Small-3.2-24B-Instruct-2506`, publicado por el usuario `gratex`. Su propósito no es la generación de texto generalista, sino la evaluación de reglas de negocio expresadas en SBVR (Semantics of Business Vocabulary and Business Rules): recibe un contexto documental y una regla, y emite un veredicto entre PASSED, FAILED o UNRESOLVABLE, acompañado de un razonamiento que debe citar los documentos fuente y las citas literales que sustentan la decisión.

La innovación principal es de política de decisión, no de arquitectura: el entrenamiento penaliza explícitamente el veredicto FAILED sin prueba positiva de incumplimiento (el silencio no es un defecto) y empuja hacia UNRESOLVABLE toda evidencia ambigua, incompleta o expresada con hedging. Es la continuación del finetune v1 ya publicado, que se usó como checkpoint de partida, y está entrenado sobre un corpus de 1.647 registros con referencias documentales reparadas (refs-v2).

Es relevante ahora porque ataca el problema práctico que bloquea la automatización de auditoría normativa: los modelos generalistas tienden a "resolver" a la fuerza casos que en realidad no son decidibles con la evidencia disponible. Con 24.011.361.280 parámetros (modelo denso) y licencia apache-2.0, es desplegable en infraestructura propia y reporta 91,4 % de exactitud de veredicto en el test de campaña congelado, con cero referencias documentales alucinadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Mistral 3 (tag `mistral3`, clase `Mistral3ForConditionalGeneration`); LoRA fusionado sobre Mistral-Small-3.2-24B-Instruct-2506 |
| Parametros totales | 24.011.361.280 (24,01 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF, GPTQ ni AWQ oficiales en el repositorio) |
| Idiomas soportados | no disponible en los metadatos del repositorio |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (artefacto merged-hf; repositorio de 48,0 GB) |
| Modelo base | mistralai/Mistral-Small-3.2-24B-Instruct-2506 |
| Checkpoint de partida del entrenamiento | gratex/Mistral-Small-3.2-24B-Instruct-2506-sbvr-compliance-unresolvable-pattern-finetune-v1 |
| Objetivo del ajuste | LoRA sobre todas las proyecciones lineales del modelo de lenguaje (q/k/v/o + gate/up/down) |
| Corpus de entrenamiento | compliance-mixed-1647-refs-v2 (1.647 registros) |
| Split de test | 163 registros, congelado durante toda la campaña |
| Región declarada | eu |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base: un transformer decoder-only denso de unos 24.000 millones de parámetros de la familia Mistral 3. El ajuste no altera la topología, ya que el adaptador LoRA se fusiona en los pesos del modelo de lenguaje antes de publicar el artefacto. Según la configuración declarada, los targets del adaptador cubren todas las proyecciones lineales (q/k/v/o y gate/up/down), pero únicamente en las proyecciones del modelo de lenguaje, no en las torres de visión del modelo base. El nombre interno del artefacto (`..._i300_LR3e6_LR32_LA64_LD0.05-hf`) sugiere 300 iteraciones, learning rate 3e-6, rango LoRA 32, alpha 64 y dropout 0,05; estos valores se deducen del identificador y no se detallan como tabla en la model card.

El entrenamiento parte del finetune v1 ya publicado (LoRA de solo atención, r16/alpha16, 180 iteraciones, LR 5e-6, sobre un corpus previo de 600 registros de patrones no resolubles), fusionado antes de esta campaña. El corpus actual, `compliance-mixed-1647-refs-v2`, contiene registros con estructura `{id, context, rule, status, reasoning}`; el prompt de sistema y el contrato exacto de salida se inyectan en tiempo de ejecución y no forman parte de los registros. La revisión refs-v2 ajusta las citas a subcadenas reales del texto fuente, repara la atribución y los nombres de documentos y reetiqueta 13 conflictos materiales, hasta alcanzar fidelidad de cita del gold de 1,000 y cero documentos fantasma en el gold. No se documenta en la información disponible el uso de RLHF o DPO; el ajuste es supervisado sobre decisiones y razonamientos anotados.

## Capacidades

- Emisión de veredictos de cumplimiento normativo en tres estados cerrados: PASSED, FAILED y UNRESOLVABLE.
- Abstención calibrada: el modelo está entrenado para no fallar una regla sin prueba positiva de violación y para derivar a UNRESOLVABLE ante evidencia ambigua, incompleta o con lenguaje de hedging.
- Razonamiento con atribución: debe nombrar los documentos fuente en los que se apoya y citar los hechos decisivos de forma literal.
- Manejo de patrones de no resolubilidad tipificados: ambigüedad con condición OR, unidades ambiguas, prerrequisitos condicionales, evidencia contradictoria, datos cuantitativos insuficientes, ausencia de identidad, atributo, contenido o timing, desajuste cualitativo/cuantitativo, ambigüedad de secuencia y lenguaje de incertidumbre.
- Razonamiento de dominio jurídico-normativo en inglés técnico (corpus y model card en inglés).
- Conserva las capacidades del modelo base según la información disponible: soporte de entradas de imagen y texto, salidas estructuradas y function/tool calling. El ajuste se aplicó solo a las proyecciones del modelo de lenguaje, por lo que estas capacidades no se han reforzado ni evaluado en este artefacto.
- No hay evidencia en la información disponible sobre soporte de agentes multi-paso, modo thinking explícito ni capacidades de audio.

## Casos de uso

- Auditoría de cumplimiento normativo interna: dado un conjunto de políticas en SBVR y un expediente documental, el modelo devuelve un veredicto por regla con la cita literal que lo sustenta, lo que permite generar un informe auditable sin revisión manual de primer nivel.
- Triaje de expedientes incompletos: el modelo separa los casos decidibles de los que carecen de evidencia suficiente y los marca como UNRESOLVABLE, evitando que un revisor humano pierda tiempo en falsos positivos o que el sistema cierre un caso por defecto.
- Verificación de contratos y cláusulas: comprobar si un contrato cumple una regla de negocio (plazos, requisitos documentales, condiciones previas) exigiendo cita textual de la cláusula decisiva, lo que facilita la revisión por parte de asesoría jurídica.
- Onboarding y KYC documental: evaluar si un expediente de cliente satisface reglas de identidad, atributo y temporalidad, con abstención explícita cuando falta un documento o un dato cuantitativo.
- Control de calidad de pipelines de extracción: usar el modelo como juez de si la evidencia extraída por otro sistema (OCR, NER, RAG) basta para aprobar una regla, detectando huecos de contenido antes de publicar resultados.
- Preprocesamiento para RAG regulatorio: el requisito de citar documentos y hechos decisivos convierte al modelo en un componente útil para generar justificaciones enlazadas a fuentes dentro de asistentes de consulta normativa.
- Evaluación de consistencia de reglas: procesar por lotes un catálogo SBVR contra un corpus fijo para detectar reglas sistemáticamente no decidibles, señal de que la propia especificación necesita reescritura.
- Guardrail de abstención en producción: integrarlo como capa de decisión que solo emite FAILED cuando existe prueba positiva, dejando el resto a revisión humana.

## Benchmarks y rendimiento

Resultados declarados por el autor en el test de campaña congelado (163 registros): 91,4 % de exactitud de veredicto (92,6 % frente al gold corregido), recall balanceado 90,8, fidelidad de cita 83,1 % y cero referencias documentales alucinadas.

Evaluación de patrones de no resolubilidad (dominio, 1.432 ítems): 88,55 % global (1.268/1.432).

| Patron | Aciertos | Total | % |
|---|---|---|---|
| Ambigüedad con condición OR | 86 | 90 | 95,56 |
| Unidades ambiguas | 22 | 26 | 84,62 |
| Ambigüedad de prerrequisito condicional | 77 | 88 | 87,50 |
| Evidencia contradictoria | 88 | 107 | 82,24 |
| Datos cuantitativos insuficientes | 150 | 164 | 91,46 |
| Falta de finalización de acción | 161 | 181 | 88,95 |
| Falta de completitud de contenido | 98 | 112 | 87,50 |
| Falta de identidad | 25 | 34 | 73,53 |
| Falta de atributo específico | 120 | 134 | 89,55 |
| Falta de timing | 231 | 263 | 87,83 |
| Desajuste cualitativo vs cuantitativo | 62 | 64 | 96,88 |
| Ambigüedad de secuencia/orden | 115 | 126 | 91,27 |
| Lenguaje de incertidumbre/hedging | 33 | 43 | 76,74 |
| Global | 1.268 | 1.432 | 88,55 |

Comparación HELM frente al modelo base, ordenada por delta:

| Suite | Base | Ajustado | Delta | Cambio |
|---|---|---|---|---|
| truthful_qa | 0,6667 | 0,6988 | +0,0321 | +4,8 % |
| mmlu_pro:chemistry | 0,3070 | 0,3200 | +0,0130 | +4,2 % |
| mmlu_pro:engineering | 0,3313 | 0,3437 | +0,0124 | +3,7 % |
| quac | 0,5760 | 0,5849 | +0,0089 | +1,5 % |
| mmlu_pro:economics | 0,6434 | 0,6517 | +0,0083 | +1,3 % |
| mmlu_pro:math | 0,3400 | 0,3480 | +0,0080 | +2,4 % |
| mmlu_pro:health | 0,6394 | 0,6467 | +0,0073 | +1,1 % |
| mmlu_pro:other | 0,5519 | 0,5584 | +0,0065 | +1,2 % |
| synthetic_reasoning | 0,9216 | 0,9278 | +0,0062 | +0,7 % |
| commonsense | 0,8260 | 0,8320 | +0,0060 | +0,7 % |
| mmlu_pro:history | 0,5879 | 0,5932 | +0,0053 | +0,9 % |
| mmlu_pro:computer_science | 0,5317 | 0,5366 | +0,0049 | +0,9 % |
| bbq | 0,9040 | 0,9080 | +0,0040 | +0,4 % |
| mmlu_pro:biology | 0,7657 | 0,7685 | +0,0028 | +0,4 % |
| mmlu_pro:physics | 0,3270 | 0,3270 | +0,0000 | +0,0 % |
| mmlu_pro:business | 0,3447 | 0,3435 | −0,0012 | −0,3 % |
| mmlu_pro:psychology | 0,6955 | 0,6930 | −0,0025 | −0,4 % |
| boolq | 0,8690 | 0,8640 | −0,0050 | −0,6 % |
| mmlu_pro:law | 0,4300 | 0,4240 | −0,0060 | −1,4 % |
| mmlu_pro:philosophy | 0,5271 | 0,5190 | −0,0081 | −1,5 % |
| damaged_items_mc | — | 1,0000 | — | — |

## Requisitos de hardware

- Pesos en BF16: el repositorio ocupa 48,0 GB, coherente con 24,01 B de parámetros a 2 bytes. La inferencia en BF16 requiere del orden de 55-70 GB de VRAM contando caché KV y activaciones.
- GPU de datacenter para BF16: A100 80 GB, H100 80 GB o H200 en una sola tarjeta; en A100 40 GB o L40S 48 GB hace falta tensor/pipeline parallel en dos dispositivos.
- Cuantización INT8/FP8 (estimación): 26-32 GB de VRAM, viable en una A100 40 GB, L40S 48 GB o dos RTX 4090.
- Cuantización INT4 tipo GPTQ/AWQ/GGUF Q4 (estimación): 14-18 GB de VRAM, por lo que cabe en RTX 4090, RTX 3090 o RTX 4080 de 16 GB con margen ajustado. No se publican versiones cuantizadas oficiales: habría que generarlas.
- Despliegue: `transformers` con `Mistral3ForConditionalGeneration` (ejemplo oficial de la model card), vLLM, TGI o SGLang para servicio concurrente. llama.cpp u Ollama requerirían convertir los pesos a GGUF y comprobar el soporte de la arquitectura `mistral3` en la versión utilizada.
- Latencia y throughput: no disponibles. La model card no publica mediciones de tokens/s ni de tiempo por petición.
- Como el ajuste solo afecta a las proyecciones del modelo de lenguaje, el consumo de memoria de la torre de visión se mantiene igual que en el modelo base; si solo se procesa texto, puede evitarse cargar ese componente según el framework.

## Comparativa con modelos similares

No se han identificado en la información disponible otros modelos especializados en veredictos de cumplimiento SBVR comparables. La comparación se limita a la estirpe directa del modelo.

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (refs-v2-i300) | 24,01 B (denso) | no disponible | Veredictos SBVR con citas, corpus refs-v2 de 1.647 registros | apache-2.0 | HuggingFace, 0 descargas, 0 likes en el momento de la ficha |
| Mistral-Small-3.2-24B-Instruct-2506 (base) | 24 B (denso) | no disponible en la información disponible | Instrucciones generales, imagen y texto, function calling | apache-2.0 (modelo base de Mistral AI) | HuggingFace, ampliamente distribuido |
| v1 unresolvable-pattern-finetune | 24 B (denso) | no disponible | Patrones de no resolubilidad, 600 registros, LoRA atención r16/alpha16, 180 iteraciones | apache-2.0 | HuggingFace, publicado y usable en paralelo |

## Limitaciones y advertencias

- La fidelidad de cita reportada es del 83,1 %: aproximadamente una de cada seis citas generadas no coincide exactamente con el texto fuente. Para uso probatorio conviene validar las citas de forma programática contra el corpus.
- Las métricas de veredicto (91,4 %) se calculan sobre un test de 163 registros de un único corpus de campaña; la varianza de una muestra tan pequeña es alta y no hay validación externa independiente publicada.
- El corpus de entrenamiento tiene 1.647 registros y es de dominio específico: el modelo está pensado para SBVR sobre documentos de compliance y no para evaluación normativa general ni para otros marcos legales.
- Los patrones con peor rendimiento son los de falta de identidad (73,53 %) y lenguaje de incertidumbre o hedging (76,74 %), seguidos de evidencia contradictoria (82,24 %). Son los que más revisión humana requieren.
- El ajuste se aplicó únicamente a las proyecciones del modelo de lenguaje: las capacidades multimodales del modelo base no fueron entrenadas ni evaluadas en este artefacto y pueden degradarse o comportarse de forma no verificada.
- Idiomas soportados no disponibles en los metadatos; la model card, el prompt de sistema y el corpus están en inglés, por lo que el rendimiento en castellano no está garantizado ni medido.
- En HELM se observan regresiones pequeñas en `mmlu_pro:law` (−1,4 %), `philosophy` (−1,5 %), `boolq` (−0,6 %) y `psychology` (−0,4 %): el ajuste mejora el dominio a costa de un ligero deterioro en conocimiento general y jurídico académico.
- Licencia apache-2.0 en el repositorio, pero el uso comercial debe verificar también las condiciones del modelo base de Mistral AI y el cumplimiento de la normativa aplicable a los datos tratados (el tag `region:eu` sugiere contexto europeo).
- Riesgo de alucinación no eliminado: la métrica de cero documentos fantasma se refiere a referencias a documentos inexistentes en el conjunto evaluado, no a una garantía general.
- El modelo no sustituye la revisión jurídica: emite veredictos con razonamiento, pero la responsabilidad de la decisión final sobre cumplimiento sigue siendo humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gratex/Mistral-Small-3.2-24B-Instruct-2506-sbvr-compliance-verdict-refs-v2-i300
- Modelo predecesor v1 (checkpoint de partida): https://huggingface.co/gratex/Mistral-Small-3.2-24B-Instruct-2506-sbvr-compliance-unresolvable-pattern-finetune-v1
- README del modelo v1: https://huggingface.co/gratex/Mistral-Small-3.2-24B-Instruct-2506-sbvr-compliance-unresolvable-pattern-finetune-v1/blob/main/README.md
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506
- Ficha del modelo v1 en Featherless: https://featherless.ai/models/gratex/Mistral-Small-3.2-24B-Instruct-2506-sbvr-compliance-unresolvable-pattern-finetune-v1
- Ficha del modelo v1 en essamamdani.com: https://essamamdani.com/ai-models/hf-gratex-mistral-small-3-2-24b-instruct-2506-sbvr-compliance-unresolvable-pattern-finetune-v1
- Benchmarks del modelo base en Benchable: https://benchable.ai/models/mistralai/mistral-small-3.2-24b-instruct-2506
- Paper o blog técnico del autor: no disponible
