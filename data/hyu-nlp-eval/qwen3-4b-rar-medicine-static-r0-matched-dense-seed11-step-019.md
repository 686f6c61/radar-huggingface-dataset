# HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-019

## Resumen

qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-019 es un checkpoint de investigación publicado por la organización HYU-NLP-EVAL. Se trata de un ajuste fino del modelo base Qwen/Qwen3-4B-Instruct-2507, con 4.022.468.096 parámetros (unos 4,02 mil millones), arquitectura transformer densa y licencia apache-2.0. El repositorio contiene el modelo en BF16 listo para inferencia en la raíz y, en el directorio `original_checkpoint/`, los ficheros originales de veRL con estado de optimizador y de datos, lo que explica el tamaño total del repositorio (57,9 GB).

El modelo forma parte del run `phase1-static-r0-medicine-qwen3-4b-matched-dense-20260928-seed11`, un experimento de aprendizaje por refuerzo con GRPO y recompensas basadas en rúbricas estáticas en el dominio médico. El sufijo "matched-dense" indica que funciona como control denso emparejado dentro de la fase 1 del proyecto, y "step-019" señala que es una política intermedia, no un modelo final convergido. La model card lo etiqueta explícitamente como "research use only".

Su relevancia es metodológica más que de producto: sirve para auditar cómo evoluciona una política de 4B bajo GRPO con rúbricas estáticas en un dominio sensible, y para compararla con los checkpoints hermanos de rúbricas dinámicas (OnlineRubrics) de la misma organización. No hay ninguna afirmación de capacidad médica ni de seguridad clínica asociada al modelo, y el repositorio acumula 0 descargas y 0 "me gusta", por lo que carece de validación por parte de la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only densa de la familia Qwen3 (detalles de capas, atención y normalización no disponibles en la informacion proporcionada) |
| Parametros totales | 4.022.468.096 (aproximadamente 4,02 mil millones) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la model card de este checkpoint; un checkpoint hermano de la misma familia (OnlineRubrics, base Qwen3-4B-Instruct) indica 32.768 tokens |
| Tipos de cuantizacion | No disponible; el repositorio publica pesos en BF16. No hay GGUF ni cuantizaciones de 8/4 bits publicadas |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) para inferencia en la raíz del repositorio, más checkpoint original de veRL (optimizador y estado de datos) en `original_checkpoint/` |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Libreria | transformers |
| Pipeline | text-generation |
| Run de entrenamiento | phase1-static-r0-medicine-qwen3-4b-matched-dense-20260928-seed11 |
| Semilla y paso | seed 11, step 019 (politica intermedia) |
| Tags | transformers, safetensors, qwen3, text-generation, conversational, text-generation-inference, endpoints_compatible |
| Tamano del repositorio | 57,9 GB (incluye estado de optimizador y datos del checkpoint veRL) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3-4B-Instruct-2507: un transformer decoder-only denso de aproximadamente 4.000 millones de parámetros. La información proporcionada no detalla el número de capas, la configuración de atención (por ejemplo, si emplea query-key normalization o grouped-query attention), la función de activación ni la estrategia de RoPE, por lo que esos datos quedan como no disponibles. El checkpoint no introduce una arquitectura nueva: es una política ajustada sobre el modelo base y publicada en BF16 para inferencia directa.

El entrenamiento corresponde a la fase 1 del proyecto RaR-Medicine de HYU-NLP-EVAL, con GRPO (Group Relative Policy Optimization) como algoritmo de RL y rúbricas estáticas como señal de recompensa. La nomenclatura de los checkpoints hermanos distingue explícitamente entre "static-rubric GRPO" y "dynamic OnlineRubrics-Every GRPO", lo que confirma que este checkpoint pertenece a la variante de rúbricas estáticas. La presencia de ficheros veRL en `original_checkpoint/` confirma el uso de ese framework de RL. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset médico, la existencia de fases de RLHF o DPO adicionales, ni sobre innovaciones técnicas específicas (decodificación especulativa, atención lineal u otras). El sufijo "matched-dense" sugiere, por la propia denominación del run, que este modelo actúa como control denso emparejado frente a otra configuración experimental, pero ese extremo no se documenta en la información disponible.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y el tag `conversational`, por lo que está preparado para completar y mantener diálogo en formato instrucción.
- Razonamiento, código y matemáticas: capacidades presumiblemente heredadas del modelo base Qwen3-4B-Instruct-2507, pero no verificadas ni documentadas en este checkpoint.
- Tool calling y function calling: no declarado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no declarado. Un checkpoint hermano de la misma familia indica explícitamente "thinking disabled", pero este checkpoint no especifica si mantiene o desactiva el modo de razonamiento extendido.
- Capacidades multilingües: no disponibles; no se declara lista de idiomas.
- Capacidades especiales: no se documenta visión ni audio (modelo exclusivamente de texto). No se declara modo thinking, modo no-thinking ni ninguna capacidad diferencial.
- Ajuste específico de dominio: el run está etiquetado como "medicine" y entrena con rúbricas del ámbito médico, pero la model card no reclama ninguna capacidad médica downstream ni validez clínica.

## Casos de uso

- Investigación en RL post-training: reproducir y analizar el efecto de recompensas basadas en rúbricas estáticas sobre una política densa de 4B, comparando la evolución de la pérdida, la recompensa media y la diversidad de respuestas a lo largo de los pasos.
- Control denso emparejado en ablaciones: usar este checkpoint como referencia "matched dense" frente a configuraciones alternativas (por ejemplo, arquitecturas MoE o variantes de rúbricas dinámicas) para aislar el efecto de la receta de RL del efecto del tamaño o tipo de modelo.
- Auditoría de dinámica de entrenamiento paso a paso: al existir checkpoints intermedios de la misma familia (pasos 3, 12, 13, 19, 36), permite trazar cómo cambia el comportamiento del modelo entre pasos y detectar inestabilidades o colapsos de política.
- Estudio de reward hacking con rúbricas estáticas: analizar si una política de 4B aprende a explotar patrones superficiales de la rúbrica en lugar de mejorar la calidad sustantiva de la respuesta, dado que la recompensa es fija y no se adapta al modelo.
- Evaluación metodológica de rúbricas médicas en laboratorio: medir acuerdo entre las respuestas del modelo y rúbricas expertas en un entorno de investigación controlado, sin uso clínico y con revisión humana obligatoria.
- Prototipado interno de bajo coste: desplegar el modelo en BF16 sobre una GPU de consumo de 12-16 GB para experimentos de generación de texto en los que no se requiera razonamiento de frontera ni garantías de precisión.
- Punto de partida para fine-tuning posterior: al estar bajo apache-2.0, puede servir como inicialización para SFT o DPO adicionales en otros dominios, aprovechando que ya ha pasado por un ciclo de RL con feedback comparativo.
- Extracción de estado de optimizador para reproducibilidad: el directorio `original_checkpoint/` permite reanudar o inspeccionar el estado exacto del entrenamiento veRL, útil para replicar el run completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card de este checkpoint no incluye métricas de MMLU, HumanEval, GSM8K, MedQA, PubMedQA ni de ningún otro conjunto. Tampoco se publican curvas de recompensa, tasas de acierto ni evaluaciones de seguridad. Los checkpoints hermanos de la misma organización declaran también ausencia de benchmarks y ausencia de afirmaciones de capacidad médica downstream, por lo que no existen cifras comparables dentro de esta familia.

## Requisitos de hardware

- VRAM para inferencia en BF16/FP16: aproximadamente 8,0 GB solo para los pesos (4.022.468.096 parámetros x 2 bytes ≈ 8,05 GB, unos 7,5 GiB), más caché KV y activaciones; con contexto moderado el consumo práctico se sitúa en el entorno de 10-14 GB.
- VRAM en cuantización INT8: aproximadamente 4-5 GB, si el usuario genera su propia cuantización (no hay artefactos publicados).
- VRAM en cuantización de 4 bits: aproximadamente 2,5-3,5 GB, de nuevo mediante conversión propia (llama.cpp u otras herramientas), ya que no se distribuye GGUF.
- Compatibilidad con GPU de consumo: sí. Encaja en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 Ti Super, RTX 4080 y RTX 4090 en BF16 con contexto moderado. En tarjetas de 8 GB solo cabe con cuantización agresiva.
- GPU recomendadas para servicio: A100 40/80 GB, H100, L40S o A10G para despliegues concurrentes con mayor longitud de contexto.
- Opciones de despliegue: transformers (librería declarada), vLLM, TGI (tag `text-generation-inference`) y Hugging Face Inference Endpoints (tag `endpoints_compatible`). Para llama.cpp u Ollama sería necesaria una conversión manual a GGUF.
- Almacenamiento: el repositorio completo ocupa 57,9 GB por el estado de optimizador y datos de veRL; para solo inferencia basta con copiar la raíz con los pesos BF16, de aproximadamente 8 GB.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad y notas |
|---|---|---|---|---|---|
| qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-019 (este) | 4,02 B | No disponible en la ficha | Denso, post-entrenado con GRPO y rúbricas estáticas | apache-2.0 | Checkpoint intermedio de investigación; 0 descargas, 0 likes; solo texto; sin benchmarks |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | 4,02 B (misma cifra reportada para el ajuste) | No disponible en la información proporcionada | Denso, instruction-tuned | apache-2.0 | Modelo público ampliamente distribuido; sirve de referencia directa de partida |
| HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-013 | 4 B (según ficha de terceros) | 32.768 tokens (según ficha de terceros) | Denso, GRPO con rúbricas dinámicas OnlineRubrics | No disponible en la información proporcionada | Checkpoint hermano de la misma fase de auditoría; "thinking disabled"; sin afirmaciones de capacidad médica |
| HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-seed11-step-036 | No disponible | No disponible | Denso, misma receta estática, paso posterior | No disponible | Variante de la misma familia en un paso de entrenamiento distinto; útil para comparar dinámica temporal |

No se dispone de datos de benchmarks que permitan comparar el rendimiento real frente a alternativas de otros desarrolladores del mismo rango (por ejemplo, modelos densos de 3-4B de otras familias), por lo que la comparación se limita a especificaciones técnicas y a la relación con el modelo base y los checkpoints hermanos.

## Limitaciones y advertencias

- Ausencia total de validación clínica: el propio autor declara "Research use only" y los checkpoints hermanos indican explícitamente que no se hace ninguna afirmación de capacidad médica ni de seguridad. No debe usarse para decisiones clínicas ni de diagnóstico.
- Riesgo elevado de alucinación en contenido médico: al ser un modelo de 4B ajustado sobre rúbricas, puede generar afirmaciones plausibles pero incorrectas en farmacología, dosificación o diagnósticos diferenciales.
- Política intermedia no convergida: se trata del paso 019 de un run de RL. Los checkpoints intermedios pueden mostrar degradación de la fluidez, colapso de diversidad o sobreajuste a la señal de recompensa respecto al modelo base.
- Riesgo de reward hacking: el uso de rúbricas estáticas (fijas, no adaptadas a la política) favorece que el modelo optimice patrones superficiales de la rúbrica en lugar de la calidad real de la respuesta.
- Sesgos no evaluados: no se publica ninguna evaluación de sesgos demográficos, de género, raciales o culturales, ni de sesgos específicos del dominio médico (por ejemplo, infrarrepresentación de determinadas poblaciones en los datos de entrenamiento).
- Idiomas no declarados: no se especifica la cobertura multilingüe ni la calidad en castellano.
- Longitud de contexto no declarada en esta ficha: el valor de contexto efectivo de este checkpoint concreto no se documenta, aunque la familia indique 32.768 tokens.
- Sin comunidad ni validación externa: 0 descargas y 0 "me gusta" implican ausencia de pruebas independientes de funcionamiento, de informes de errores y de reproducciones por terceros.
- Restricción práctica frente a la licencia: aunque la licencia apache-2.0 permite teóricamente uso comercial, la model card impone "research use only", lo que crea ambigüedad para un despliegue en producción. Ante cualquier uso comercial conviene aclarar la condición con el autor.
- Sin cuantizaciones publicadas: no hay GGUF ni versiones de 8 o 4 bits, lo que obliga a generarlas y valida que no han sido probadas por terceros.
- Repositorio pesado: 57,9 GB, por lo que descargarlo completo solo tiene sentido si se necesita el estado de optimizador para reproducir el entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-019
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Checkpoint hermano (OnlineRubrics, step 013): https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-013
- Checkpoint hermano (OnlineRubrics, step 003): https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-003
- Checkpoint hermano (OnlineRubrics, step 012): https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-012
- Ficha espejo en Featherless (OnlineRubrics, step 013): https://featherless.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-013
- Ficha espejo en Friendli (OnlineRubrics, step 012): https://friendli.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-012
- Registro en Free2AITools (static r0 matched, step 036): https://free2aitools.com/model/hyu-nlp-eval/qwen3-4b-rar-medicine-static-r0-matched-seed11-step-036
