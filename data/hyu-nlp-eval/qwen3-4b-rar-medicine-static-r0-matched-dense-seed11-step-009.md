# HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-009

## Resumen

El modelo `HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-009` es un checkpoint intermedio de un ajuste fino con GRPO (Group Relative Policy Optimization) sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`. Lo publica la organización HYU-NLP-EVAL y pertenece a la ejecución `phase1-static-r0-medicine-qwen3-4b-matched-dense-20260928-seed11`, dentro de lo que la propia model card describe como una auditoría de fase 1 con rúbricas estáticas (R0). No se trata de un modelo listo para producto, sino de un estado histórico de política de un experimento de investigación: el paso 9 de una secuencia de entrenamiento con semilla 11.

Técnicamente es un transformer denso de 4.022.468.096 parámetros (aproximadamente 4B), con los pesos almacenados en BF16 para inferencia. La model card indica explícitamente que el razonamiento (thinking) está deshabilitado, algo coherente con los checkpoints hermanos de la misma familia publicados por el mismo autor. El repositorio ocupa 25,7 GB e incluye, además de los pesos en `safetensors`, un directorio `original_checkpoint/` con los ficheros de veRL originales (solo parámetros del modelo).

Su relevancia es fundamentalmente metodológica: sirve para reproducir y auditar un pipeline de RL con recompensas basadas en rúbricas aplicado a dominio médico, y para comparar variantes densas frente a otras configuraciones del mismo estudio. La licencia declarada es Apache-2.0, pero la model card añade la restricción textual "research use only", y no se publica ninguna afirmación de capacidad clínica ni de seguridad. El modelo no tiene descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3); detalles de capas y atención no disponibles en la informacion proporcionada |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible para este checkpoint. El modelo base Qwen3-4B-Instruct-2507 declara contexto nativo largo segun su documentacion oficial; no verificado en la model card de este checkpoint |
| Tipos de cuantizacion | No se publican versiones cuantizadas (GGUF, AWQ, GPTQ). Los pesos del repositorio estan en BF16; al ser un modelo transformers estandar es cuantizable con herramientas habituales, pero no hay artefactos oficiales |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0, con restriccion adicional declarada en la model card: "Research use only" |
| Formato de pesos | `safetensors` (BF16 para inferencia) + checkpoints originales de veRL en `original_checkpoint/` (solo parametros) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `Qwen/Qwen3-4B-Instruct-2507`, un transformer denso de aproximadamente 4B parámetros. Sobre esa base se aplica un entrenamiento de optimización de política con GRPO, dentro de una ejecución etiquetada como `phase1-static-r0-medicine-qwen3-4b-matched-dense-20260928-seed11`. El identificador delata varios ejes del experimento: fase 1, rúbricas estáticas (R0), dominio médico, variante "matched dense" (presumiblemente una configuración densa de control emparejada con otra variante del estudio, aunque la model card no define el término) y semilla 11. Este checkpoint concreto corresponde al paso 9.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset médico, la mezcla de datos de instrucción, ni sobre si hubo fases adicionales de RLHF o DPO más allá del propio GRPO. Tampoco se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, MoE, híbridos SSM) más allá de lo heredado del modelo base. El thinking está deshabilitado, según indican las fichas hermanas de la misma familia. La model card es deliberadamente mínima y no incluye detalles de hiperparámetros, configuración de recompensas ni métricas de entrenamiento.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y el tag `conversational` está presente, por lo que conserva la interfaz de chat del modelo base.
- Razonamiento sin modo "thinking": el entrenamiento se realizó con el razonamiento extendido desactivado, lo que implica respuestas directas sin cadena de pensamiento explícita.
- Dominio objetivo médico-experimental: el ajuste se orienta a tareas de dominio médico dentro de un experimento con rúbricas, pero el autor no formula ninguna afirmación de capacidad clínica.
- Herencia del modelo base: al derivar de Qwen3-4B-Instruct-2507, cabe esperar competencia general en generación, código y matemáticas elementales, aunque no hay evaluación publicada que lo confirme en este checkpoint.
- Tool calling / function calling: no documentado en la información disponible para este checkpoint.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Multilingüismo: no documentado; el campo de idiomas no está disponible.
- Capacidades especiales (visión, audio, thinking mode): no disponibles; el thinking está explícitamente deshabilitado.

## Casos de uso

- Reproducción de experimentos de RL con rúbricas: el checkpoint permite reproducir el paso 9 de la ejecución `phase1-static-r0-medicine-...-seed11` y verificar la evolución de la política frente a otros pasos del mismo run.
- Auditoría de estados intermedios de política: al ser un estado histórico dentro de una auditoría de fase 1, sirve para inspeccionar cómo se comporta la política antes de converger, útil en estudios de estabilidad de GRPO.
- Estudios de ablación con semilla fija: al estar etiquetado con `seed11` y con la variante "matched dense", encaja en comparaciones controladas entre configuraciones densas y otras variantes del mismo estudio.
- Evaluación de sensibilidad a rúbricas estáticas: permite medir cómo responde el modelo a recompensas basadas en rúbricas fijas (R0) frente a variantes dinámicas como OnlineRubrics, que el mismo autor publica en checkpoints paralelos.
- Desarrollo y validación de arneses de evaluación: útil como sujeto de prueba para pipelines internos de evaluación de modelos médicos, sin uso clínico real.
- Docencia e investigación en ajuste fino: sirve como ejemplo práctico de un checkpoint intermedio de un entrenamiento GRPO sobre una base Qwen3-4B, con pesos BF16 directamente cargables en `transformers`.
- Experimentos de cuantización y despliegue: al ser un modelo denso de 4B en safetensors, es un candidato razonable para probar cuantizaciones propias (int8/int4) y comparar degradación, siempre en el marco de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna métrica de dominio médico, y las fichas hermanas del mismo autor declaran explícitamente que no se formula ninguna afirmación de capacidad médica o de seguridad.

## Requisitos de hardware

Estimaciones calculadas a partir de los 4.022.468.096 parámetros del modelo; no son datos publicados por el autor.

- VRAM para los pesos en BF16/FP16: aproximadamente 8,1 GB solo para parámetros, más caché KV y activaciones. En la práctica, entre 10 y 12 GB para contextos cortos.
- VRAM con cuantización int8: aproximadamente 4,0-4,5 GB de pesos, más overhead; en torno a 6-8 GB en total.
- VRAM con cuantización int4: aproximadamente 2,0-2,5 GB de pesos; en torno a 4-6 GB en total, siempre que se genere el artefacto cuantizado (no hay versiones oficiales).
- GPU profesionales: A100 40/80 GB, H100, L40S o A10G son suficientes y quedan sobredimensionadas para inferencia en BF16.
- GPU de consumo: cabe en BF16 en RTX 4090 (24 GB), RTX 4080/4070 Ti Super (16 GB) y RTX 3090/4090. En tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070) conviene contextos moderados. En tarjetas de 8 GB es necesario cuantizar a int4.
- Opciones de despliegue: `transformers` (formato nativo del repo), vLLM y SGLang para servido con batching, TGI (el tag `text-generation-inference` está presente) y `endpoints_compatible`. Para llama.cpp u Ollama habría que convertir los pesos a GGUF, ya que el repositorio solo contiene safetensors.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

Los datos de los modelos comparables proceden de sus fichas públicas y deben verificarse en la fuente original; para este checkpoint concreto no hay métricas publicadas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-009 (este) | 4,02B densos | No disponible | Apache-2.0 + "research use only" | HuggingFace, 0 descargas | Checkpoint intermedio, paso 9, thinking desactivado |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | 4,02B densos | Contexto nativo largo declarado por Qwen | Apache-2.0 | HuggingFace, ampliamente distribuido | Modelo de propósito general, con modo thinking |
| qwen3-4b-rar-medicine-onlinerubrics-seed11-step-013 | 4B densos | 32.768 tokens segun la ficha de un agregador | Apache-2.0 | HuggingFace y agregadores externos | Misma base y semilla, pero con rúbricas dinámicas (OnlineRubrics) en lugar de estáticas |
| Modelos densos de ~3-4B de otros fabricantes (Gemma 3 4B, Llama 3.2 3B) | ~3-4B densos | No disponible en la informacion proporcionada | Licencias propias de cada fabricante | HuggingFace | Comparables por tamano, pero sin relación con el experimento RaR-Medicine |

## Limitaciones y advertencias

- No es un modelo de producto: es un checkpoint intermedio de investigación, sin validación de calidad ni de seguridad para ningún uso final.
- Sin uso clínico: el autor no formula ninguna afirmación de capacidad médica ni de seguridad. No debe usarse para diagnóstico, triaje, consejo médico ni decisiones sobre pacientes.
- Restricción declarada: aunque la licencia es Apache-2.0, la model card indica "Research use only". Conviene revisar la compatibilidad de esa restricción con cualquier despliegue comercial antes de usarlo.
- Sesgos: no disponibles. No hay evaluación de sesgos, toxicidad ni alineación publicada para este checkpoint.
- Riesgo de alucinación: no cuantificado. En un dominio sensible como el médico, el riesgo de generar información incorrecta con apariencia de verosimilitud es alto y no está medido.
- Cobertura de idiomas: no documentada. No hay confirmación de rendimiento en castellano ni en ningún otro idioma para este checkpoint.
- Limitaciones de contexto: el tamaño de ventana efectivo no está especificado en la ficha; asumir el contexto del modelo base sin verificación puede provocar degradación silenciosa.
- Trazabilidad limitada: no se documentan tokens de entrenamiento, composición de datos, hiperparámetros de GRPO, función de recompensa ni criterios de selección del paso 9.
- Metadatos incompletos: el repositorio ocupa 25,7 GB e incluye checkpoints de veRL que no son cargables directamente por `transformers`; solo los pesos del directorio raíz lo son.
- Reproducibilidad: al ser un estado intermedio de un run con semilla concreta, los resultados pueden no ser estables frente a cambios de infraestructura o de versión de las librerías de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-009
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Checkpoint hermano con rúbricas dinámicas, paso 13: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-013
- Checkpoint hermano con rúbricas dinámicas, paso 9: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-009
- Checkpoint hermano de la misma serie, paso 36: https://free2aitools.com/model/hyu-nlp-eval/qwen3-4b-rar-medicine-static-r0-matched-seed11-step-036
- Ficha en agregador externo (variante OnlineRubrics, paso 12): https://friendli.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-012
- Ficha en agregador externo (variante OnlineRubrics, paso 13): https://featherless.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-013
- Paper, blog o repositorio del entrenamiento: no disponibles en la informacion proporcionada.
