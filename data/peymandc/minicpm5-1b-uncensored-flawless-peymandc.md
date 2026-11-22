# Peymandc/MiniCPM5-1B-Uncensored-Flawless-Peymandc

## Resumen

MiniCPM5-1B-Uncensored-Flawless-Peymandc es una variante del modelo MiniCPM5-1B de OpenBMB en la que se ha modificado el comportamiento de rechazo (refusal) mediante la herramienta Heretic v2.1.0 y la técnica Arbitrary-Rank Ablation (ARA). No se trata de un reentrenamiento ni de un fine-tune convencional: los pesos originales se han alterado quirúrgicamente en un rango de capas para reducir la probabilidad de que el modelo se niegue a responder. El autor de la modificación es Peymandc y el checkpoint se distribuye en formato BF16 para Transformers.

El modelo base es un transformer denso de tipo `LlamaForCausalLM` con 1.080.632.832 parámetros totales (unos 679 millones no de embedding), 24 capas y atención con GQA (16 cabezas de consulta y 2 de clave-valor). Soporta una ventana de contexto nativa de 131.072 tokens y está orientado a asistentes locales, flujos de tool calling, agentes de código y razonamiento en entornos con recursos limitados. El mismo checkpoint permite activar o desactivar el modo de razonamiento mediante la plantilla de chat (`enable_thinking`).

La relevancia de esta ficha está en que combina dos cosas: un modelo pequeño y de contexto largo, útil para despliegue en edge, y una modificación de seguridad que elimina buena parte de las negativas del modelo original. Esa modificación es el punto crítico para cualquier evaluación en producción, ya que cambia el perfil de riesgo del modelo sin que se hayan reevaluado de forma independiente las capacidades del base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, `LlamaForCausalLM` |
| Parametros totales | 1.080.632.832 (aprox. 1,08B) |
| Parametros activos | No aplica (modelo denso) |
| Parametros no-embedding | 679.552.512 |
| Longitud de contexto | 131.072 tokens (nativo, segun documentacion del base) |
| Capas | 24 |
| Cabezas de atencion | 16 query / 2 key-value (GQA) |
| Tipos de cuantizacion | No disponible en el repo (solo checkpoint BF16); el base admite cuantizaciones estandar de llama.cpp/GGUF segun el ecosistema |
| Idiomas soportados | Ingles y chino (segun documentacion del base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, Transformers) |
| Tamano del repo | 2,2 GB |
| Modelo base | openbmb/MiniCPM5-1B |
| Metodo de modificacion | Heretic v2.1.0, Arbitrary-Rank Ablation (ARA) |

## Arquitectura y entrenamiento

La arquitectura es la del MiniCPM5-1B original: un transformer causal denso con 24 capas, normalizacion y atención GQA con 16 cabezas de consulta y 2 de clave-valor, lo que reduce el coste de memoria de la caché KV en contextos largos. El modelo base es un checkpoint post-entrenado de 1,08B de parámetros totales, de los cuales unos 679 millones corresponden a pesos no-embedding. No se dispone de datos sobre el número de tokens de preentrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo original en la información proporcionada.

La modificación de esta variante no es un entrenamiento: Heretic aplica una ablación de rango arbitrario sobre las capas 7 a 15 (`start_layer_index=7`, `end_layer_index=15`) con pesos concretos de preservación (`preserve_good_behavior_weight=0.9075`), direccionamiento del comportamiento no deseado (`steer_bad_behavior_weight=0.0001`), sobrerrección relativa (`overcorrect_relative_weight=0.5820`) y `neighbor_count=1`. El resultado es un checkpoint con los pesos alterados, distribuido con material de reproducibilidad (configuración, dependencias, historial de pruebas y sumas de comprobación) en el directorio `reproduce/`. La evaluación del propio autor reporta una divergencia KL de 0,0070 frente al modelo original sobre los primeros 100 prompts de `mlabonne/harmless_alpaca`, lo que indica un cambio moderado en la distribución de salida en prompts benignos.

## Capacidades

- Generación de texto conversacional en inglés y chino, según la documentación del modelo base.
- Razonamiento híbrido: modo `<think>` activable o desactivable mediante `enable_thinking` en la plantilla de chat.
- Tool calling nativo mediante llamadas en estilo XML; el proyecto original recomienda SGLang con su parser `minicpm5` para convertir a `tool_calls` compatibles con OpenAI.
- Contexto largo de hasta 131.072 tokens, adecuado para documentos extensos y conversaciones multi-turno largas.
- Orientación a despliegue en edge y on-device por su tamaño reducido (1,08B).
- Comportamiento de rechazo reducido: la evaluación del autor reporta 3/100 coincidencias de palabras clave de rechazo frente a 81/100 del original sobre `mlabonne/harmful_behaviors`.
- No se han verificado de forma independiente en esta variante las capacidades de código, matemáticas, agentes multi-paso ni visión; la model card indica que las descripciones de capacidades provienen del base y no se han reevaluado.

## Casos de uso

- Asistentes locales en dispositivos: con 1,08B de parámetros y pesos BF16 de unos 2,2 GB, el modelo puede ejecutarse en portátiles y equipos de gama media, lo que permite asistentes offline sin depender de la nube.
- Procesamiento de documentos largos: la ventana de 131.072 tokens permite resumir contratos, informes o transcripciones extensas en una sola pasada, útil en herramientas de análisis documental.
- Agentes con tool calling: la emisión de llamadas en estilo XML y la integración recomendada con SGLang permiten construir agentes que consulten APIs, bases de datos o servicios internos en flujos multi-paso.
- Generación de código en pipelines ligeros: su tamaño permite integrarlo en entornos de CI/CD o editores locales para autocompletado y generación de parches, siempre que se valide la calidad en la tarea concreta.
- Chat de atención al cliente con contexto largo: al mantener conversaciones multi-turno extensas sin truncar, puede gestionar historiales de soporte completos en un único contexto.
- Investigación sobre alineación y seguridad: la variante es útil para estudiar el efecto de la ablación de rechazo, comparar distribuciones frente al base y analizar qué comportamientos cambian tras la modificación.
- Prototipado rápido de aplicaciones conversacionales: su licencia Apache 2.0 y su formato Transformers facilitan la integración en prototipos y demos sin coste de licencia.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K u otros) para esta variante. Solo se reportan métricas de la modificación de rechazo:

| Metrica | Este modelo | MiniCPM5-1B original |
|---|---:|---:|
| Coincidencias de palabras clave de rechazo (`mlabonne/harmful_behaviors`, test[:100]) | 3/100 (3%) | 81/100 (81%) |
| Divergencia KL (`mlabonne/harmless_alpaca`, test[:100]) | 0,0070 | 0,0000 (por definición) |

No se han publicado resultados de benchmarks de capacidades en la información disponible. Las métricas anteriores son proxies basados en palabras clave y divergencia de distribución, no evaluaciones semánticas ni revisadas por humanos.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 2,2 GB solo para pesos, más caché KV; con contexto de 131.072 tokens la caché KV crece de forma significativa y puede requerir varios GB adicionales según el backend y el batch.
- VRAM estimada en cuantización de 8 bits: en torno a 1,1-1,3 GB para pesos, más caché KV.
- VRAM estimada en cuantización de 4 bits: en torno a 0,6-0,8 GB para pesos, más caché KV.
- GPU recomendadas: cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o más; para contexto completo de 131k tokens se recomienda 16-24 GB o reducir la ventana efectiva.
- Despliegue: Transformers (formato nativo del repo), vLLM y SGLang (recomendado por el proyecto base para el parser de tool calling), llama.cpp/Ollama si se generan cuantizaciones GGUF a partir del checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del backend, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---:|---:|---|---|
| MiniCPM5-1B-Uncensored-Flawless-Peymandc | 1,08B | 131.072 | Apache 2.0 | Variante con rechazo ablacionado; sin benchmarks de capacidades publicados |
| openbmb/MiniCPM5-1B | 1,08B | 131.072 | Apache 2.0 | Modelo base original, con rechazo estándar |
| Qwen2.5-1.5B | 1,5B | 32.768 (tipico) | Apache 2.0 | Alternativa de tamaño similar para edge; contexto menor |
| Llama 3.2 1B | 1,2B | 131.072 | Llama 3.2 Community License | Contexto largo, pero licencia con restricciones de uso comercial |

La comparación con Qwen2.5-1.5B y Llama 3.2 1B se ofrece como referencia de categoría; no se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- La modificación de rechazo puede hacer que el modelo responda a peticiones que el original rechazaría; el autor advierte de que los usuarios son responsables de evaluar las salidas y cumplir la legislación aplicable.
- Riesgo elevado de contenido inexacto, engañoso o inapropiado; las salidas no deben tratarse como información verificada ni como asesoramiento profesional.
- La evaluación de rechazo se basa en coincidencias de palabras clave sobre 100 prompts, no en una revisión semántica o humana; puede no reflejar el comportamiento real en producción.
- No se han reevaluado de forma independiente las capacidades del base (código, matemáticas, tool calling, contexto largo) en esta variante; la divergencia KL de 0,0070 sugiere cambios moderados, pero no garantiza paridad funcional.
- Idiomas limitados a inglés y chino según la documentación del base; no hay evaluación multilingüe de esta variante.
- El contexto de 131.072 tokens exige memoria considerable para la caché KV; en GPUs de consumo puede ser necesario reducir la ventana efectiva.
- La licencia Apache 2.0 permite uso comercial, pero exige cumplir la Sección 4 (incluir copia de la licencia y conservar avisos); la modificación no exime de las obligaciones de la licencia.
- Solo se distribuye el checkpoint BF16 en Transformers; no hay cuantizaciones oficiales en el repo, por lo que el despliegue en edge requiere generar GGUF u otras cuantizaciones por cuenta propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Peymandc/MiniCPM5-1B-Uncensored-Flawless-Peymandc
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-1B
- Heretic (herramienta de modificación): https://github.com/p-e-w/heretic
- Dataset de evaluación de rechazo: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset de evaluación de prompts benignos: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- Material de reproducibilidad: https://huggingface.co/Peymandc/MiniCPM5-1B-Uncensored-Flawless-Peymandc/tree/main/reproduce
- Registro de modificaciones: https://huggingface.co/Peymandc/MiniCPM5-1B-Uncensored-Flawless-Peymandc/blob/main/MODIFICATIONS.md
