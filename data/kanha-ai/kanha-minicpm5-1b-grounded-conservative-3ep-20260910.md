# Kanha-AI/kanha-minicpm5-1b-grounded-conservative-3ep-20260910

## Resumen

Kanha-AI/kanha-minicpm5-1b-grounded-conservative-3ep-20260910 es un ajuste fino mediante QLoRA del modelo base openbmb/MiniCPM5-1B, con 1.080.632.832 parametros (unos 1,08 millardos). Lo publica Kanha-AI como experimento de investigacion para comparar metodos de entrenamiento sobre un mismo conjunto de datos derivado de su sitio web (kanha.ai). El objetivo declarado es responder preguntas sobre ese contenido siempre que se le suministre un contexto de origen recuperado (grounded question answering).

El checkpoint se sirve con el pipeline text-generation, pesa en bfloat16 y ocupa alrededor de 2,2 GB en el repositorio. Su contrato de inferencia es estricto: exige contexto recuperado y, cuando la respuesta no figura en el contexto, debe devolver exactamente la cadena de rechazo definida por el autor. La longitud maxima de secuencia empleada en el entrenamiento es de 4096 tokens y solo declara soporte de ingles.

Es relevante como ejemplo de ajuste "conservador" orientado a la abtencion (refusal) y a la fidelidad literal al contexto, un patron habitual en sistemas RAG de baja latencia. No obstante, sus propias metricas de evaluacion muestran puertas de comportamiento no superadas, por lo que debe tratarse como artefacto de investigacion y no como componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de openbmb/MiniCPM5-1B; no especificada en la informacion proporcionada) |
| Parametros totales | 1.080.632.832 (safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (longitud maxima de secuencia usada en entrenamiento) |
| Tipos de cuantizacion | Pesos publicados en bfloat16; no se incluyen versiones GGUF, GPTQ ni AWQ |
| Idiomas soportados | Ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint openbmb/MiniCPM5-1B con la metodologia QLoRA. Los hiperparametros declarados son: 3 epocas, learning rate 2e-05, batch size por dispositivo 2, acumulacion de gradiente 8 pasos, warmup ratio 0,05, semilla 42 y longitud de secuencia maxima 4096. El adaptador LoRA usa rango 16, alpha 16 y dropout 0,05, aplicado sobre las proyecciones q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj. La perdida se calcula solo sobre los turnos del asistente (assistant-only loss) y el resultado final se fusiona y se sirve en bfloat16.

El conjunto de datos deriva del sitio web de Kanha y se reparte en 210 registros de entrenamiento, 45 de validacion y 0 de holdout. No se documenta el numero de tokens de entrenamiento, la composicion completa del corpus ni el uso de RLHF o DPO; los tags incluyen "qwen3" y "qlora", pero no se aporta detalle adicional sobre la arquitectura subyacente. El autor indica que la calidad se evaluo con contexto de origen de tipo oracle y que no se evaluo la calidad de recuperacion. Como innovacion destacable, el checkpoint impone un contrato de inferencia grounded con plantilla de chat nativa y thinking desactivado (enable_thinking=False).

## Capacidades

- Generacion de texto conversacional en ingles sobre el pipeline text-generation.
- Respuesta anclada a contexto (grounded QA): solo responde a partir del contexto suministrado.
- Abtencion controlada: devuelve la cadena exacta "I can't answer that from the provided context." cuando la respuesta no esta en el contexto.
- Extraccion de entidades concretas del contexto, con buenos resultados declarados en fechas y URLs (dates_recall 1,0 y urls_recall 1,0) y en numeros (numbers_recall 0,885).
- Uso de plantilla de chat nativa con el bloque system/user especificado por el autor.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades de vision, audio ni modo thinking activo.
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Evaluacion comparativa de metodos de entrenamiento: el autor lo destina explicitamente a investigacion sobre como distintas tecnicas de ajuste se comportan sobre el mismo corpus web; se usaria como brazo de un experimento controlado con semilla fija 42.
- QA sobre documentacion web con RAG: el modelo encaja en un pipeline donde un recuperador entrega fragmentos y el modelo responde solo con esos fragmentos, minimizando respuestas no soportadas (unsupported_value_rate 0,0 en la evaluacion declarada).
- Extraccion de fechas y URLs de paginas web: con dates_recall y urls_recall de 1,0 en el conjunto evaluado, resulta util para poblar campos estructurados a partir de texto recuperado.
- Extraccion de cifras y datos numericos: numbers_recall de 0,885 lo hace apropiado para tareas de scraping asistido donde hay que localizar cantidades en un texto fuente.
- Sistemas con politica de abtencion estricta: entornos donde es preferible no responder antes que alucinar; la cadena de rechazo fija permite verificar de forma determinista la respuesta del modelo.
- Prototipado en hardware modesto: al tener ~1,08 millardos de parametros, permite iterar en una unica GPU de consumo o incluso en CPU, lo que facilita experimentos academicos de bajo coste.
- Pruebas de contrato de inferencia: sirve para validar plantillas de prompt y flujos de rechazo en un servidor TGI o con transformers antes de escalar a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor si publica metricas internas de evaluacion grounded:

| Metrica | Valor |
|---|---|
| dates_recall | 1,0 |
| deterministic_pass_rate | 0,0385 |
| grounded_answerable_case_count | 24 |
| grounded_behavior_case_count | 26 |
| grounded_behavior_gate_passed | false |
| grounded_behavior_pass_count | 2 |
| grounded_behavior_pass_rate | 0,0769 |
| grounded_reviewed_case_count | 0 |
| grounded_reviewed_case_rate | 0,0 |
| grounded_semantic_review_gate_passed | false |
| grounded_source_supported_count | 0 |
| list_recall | 0,1487 |
| numbers_recall | 0,8846 |
| refusal_rate | 0,7308 |
| requires_review_rate | 0,0 |
| total (casos) | 26 |
| unsupported_value_rate | 0,0 |
| urls_recall | 1,0 |

El propio autor advierte que la puntuacion determinista y el benchmark del servidor de Transformers no constituyen una cualificacion en navegador y que debe validarse el modelo convertido en el navegador y dispositivo objetivo.

## Requisitos de hardware

- VRAM estimada en bfloat16/FP16: aproximadamente 2,2 GB solo para los pesos, mas overhead de activaciones y cache KV.
- VRAM estimada en INT8: alrededor de 1,1 GB de pesos.
- VRAM estimada en INT4: alrededor de 0,6 GB de pesos (requiere convertir el modelo, ya que no se publica GGUF).
- Cabe en cualquier GPU de consumo con 6 GB o mas: RTX 3060, RTX 4060, RTX 4090, entre otras; tambien es viable en CPU para inferencia por lotes pequenos.
- GPUs de datacenter (A100, H100) sobredimensionadas para este tamano; solo tendrian sentido para servir muchas replicas en paralelo.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta text-generation-inference en el repo) y endpoints compatibles. No se publica artefacto GGUF ni MLC validado, por lo que llama.cpp u Ollama requeririan conversion previa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La comparativa se ofrece como referencia general de modelos de tamano equivalente; no es posible comparar rendimiento porque el autor no publica benchmarks estandar y el ajuste es especifico para QA grounded sobre un corpus web concreto.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| kanha-minicpm5-1b-grounded-conservative-3ep-20260910 | 1,08 B | 4096 (entrenamiento) | no disponible | pesos safetensors en HuggingFace |
| openbmb/MiniCPM5-1B (modelo base) | ~1 B | no disponible | no disponible | HuggingFace |
| Llama 3.2 1B | 1,24 B | 128 K | Llama 3.2 Community License | HuggingFace |
| Qwen2.5-1.5B | 1,54 B | 32 K | Apache 2.0 | HuggingFace |

Nota: los datos de los modelos de referencia corresponden a informacion publica general; deben verificarse en sus fichas oficiales antes de tomar decisiones.

## Limitaciones y advertencias

- Requiere obligatoriamente contexto recuperado: una pregunta sin contexto queda fuera del contrato entrenado y evaluado.
- El propio autor reconoce que el checkpoint puede producir respuestas incorrectas, incompletas o desactualizadas.
- Riesgo de memorizacion del contenido de entrenamiento (210 registros), lo que puede sesgar las respuestas hacia ese material.
- Las puertas de comportamiento grounded no se superan: grounded_behavior_gate_passed = false, grounded_behavior_pass_rate = 0,0769 y grounded_semantic_review_gate_passed = false.
- deterministic_pass_rate muy bajo (0,0385) y list_recall bajo (0,1487), lo que indica debilidad en respuestas deterministas y en listas.
- No hay conjunto de holdout (0 registros), por lo que las metricas pueden estar sobreajustadas al conjunto de validacion.
- Solo soporta ingles; el uso en otros idiomas no esta cubierto ni evaluado.
- Licencia no disponible: la reutilizacion comercial es incierta y debe aclararse con el autor antes de cualquier despliegue.
- Tamano pequeno (1,08 B) que limita razonamiento complejo, conocimiento general y tareas fuera del dominio web.
- No se publica artefacto GGUF ni MLC validado; el despliegue en navegador o en entornos edge requiere conversion y validacion propias.
- Las metricas deterministas y el benchmark del servidor no equivalen a una cualificacion en el dispositivo final; es imprescindible validar en el entorno objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kanha-AI/kanha-minicpm5-1b-grounded-conservative-3ep-20260910
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-1B
- Sitio del autor: https://kanha.ai
- La busqueda web no ha devuelto enlaces relevantes sobre este modelo; los resultados obtenidos corresponden a otros temas y no se incluyen.
