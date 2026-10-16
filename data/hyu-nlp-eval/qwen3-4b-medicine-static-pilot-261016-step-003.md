# HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-003

## Resumen

El modelo `HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-003` es un ajuste fino (fine-tune) del modelo denso Qwen/Qwen3-4B-Instruct-2507, publicado por el usuario HYU-NLP-EVAL bajo licencia Apache 2.0. Se trata de un artefacto de investigación: el nombre indica que pertenece al run `261016_medicine_static_pilot`, con semilla 11, y que corresponde al **checkpoint del paso 3** de entrenamiento. Es decir, no es un modelo finalizado, sino un punto de control intermedio de un experimento orientado al dominio médico.

El repositorio contiene una exportación en BF16 en formato Transformers (safetensors) y, en el subdirectorio `original_checkpoint/`, los ficheros nativos del entrenamiento en veRL/FSDP junto con sus metadatos. El tamaño total del repositorio (25,7 GB) es coherente con esa doble exportación. El número real de parámetros, verificado sobre los safetensors, es de 4.022.468.096 (aproximadamente 4,02 mil millones), en línea con el modelo base.

Su relevancia es limitada y muy específica: sirve como evidencia reproducible de un pipeline de evaluación en el ámbito clínico y como material para inspeccionar el estado temprano del ajuste. No debe confundirse con un modelo médico listo para producción, ya que la model card no documenta datos de entrenamiento, métricas ni validación clínica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), heredada de Qwen3-4B-Instruct-2507 |
| Parametros totales | 4.022.468.096 (dato real de safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card del fine-tune; el modelo base Qwen3-4B-Instruct-2507 declara 262.144 tokens |
| Tipos de cuantizacion | no disponible en el repositorio (exportacion BF16); el modelo base admite FP8, INT8 e INT4 mediante herramientas externas |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16, exportacion Transformers) + checkpoint nativo veRL/FSDP en `original_checkpoint/` |

## Arquitectura y entrenamiento

Arquitectura heredada del modelo base Qwen3-4B-Instruct-2507: transformer decoder-only denso, con atención por grupos de consultas (GQA) y sin modo de razonamiento explícito (la variante "Instruct-2507" de Qwen3 eliminó el modo thinking respecto a las versiones anteriores de la familia). El checkpoint aquí publicado no modifica esa arquitectura; solo ajusta los pesos mediante entrenamiento supervisado sobre un corpus del dominio médico.

La información de entrenamiento publicada es mínima: identificador del run (`261016_medicine_static_pilot`), paso del checkpoint (3), semilla (11) y la indicación de que el framework empleado es veRL con sharding FSDP. No se especifican el número de tokens de entrenamiento, la composición del dataset, si hubo fases de RLHF/DPO ni la tasa de aprendizaje. El README menciona un procedimiento de verificación de tamaños y hashes SHA256 antes de eliminar el checkpoint local, lo que sugiere un pipeline de publicación automatizado orientado a la reproducibilidad. Con solo 3 pasos de entrenamiento, el desplazamiento respecto a los pesos del modelo base es presumiblemente muy reducido.

## Capacidades

- Generación de texto y conversación multi-turno, con la etiqueta `conversational` y pipeline `text-generation`.
- Ajuste orientado al dominio médico (pilotaje de evaluación estática), aunque sin capacidades clínicas documentadas ni validadas.
- Tool calling y function calling: presumiblemente heredados del modelo base Qwen3-4B-Instruct-2507, pero **no verificados** en este checkpoint.
- Razonamiento multi-paso y uso como agente: no documentado para este fine-tune.
- Capacidades multilingües: no documentadas; no se declara ningún idioma en la ficha de HuggingFace.
- Modo de razonamiento explícito (thinking mode): no disponible; el modelo base de la familia 2507 tampoco lo incorpora.
- Visión o audio: no soportados (modelo exclusivamente de texto).
- Compatibilidad declarada con Text Generation Inference (TGI) y con endpoints alojados (`endpoints_compatible`).

## Casos de uso

- **Auditoría de pipelines de ajuste fino**: el valor principal del artefacto es permitir a un equipo inspeccionar un checkpoint intermedio (paso 3) de un entrenamiento veRL/FSDP y comparar los pesos con el modelo base para estudiar cómo evoluciona el ajuste en las primeras iteraciones.
- **Reproducibilidad de experimentos en el dominio clínico**: al publicar conjuntamente la exportación BF16 y el `original_checkpoint/` con hashes verificados, permite reconstruir el estado exacto del run `261016_medicine_static_pilot` con semilla 11 y revertir o continuar el entrenamiento.
- **Evaluación comparativa de protocolos de evaluación médica**: puede emplearse como punto de referencia "no entrenado" frente a checkpoints posteriores del mismo run, para aislar el efecto de cada paso de entrenamiento en métricas de dominio sanitario.
- **Pruebas de integración de infraestructura**: con 4B de parámetros y pesos BF16, es adecuado para validar despliegues en TGI, vLLM o SGLang (carga de safetensors, gestión del KV cache, batching) antes de mover modelos mayores al clúster.
- **Generación de texto asistida en documentación clínica simulada**: en entornos de desarrollo con datos sintéticos o anonimizados, puede redactar borradores de resúmenes o notas estructuradas, siempre con revisión humana y sin uso asistencial real.
- **Investigación sobre sesgo y seguridad en modelos médicos**: su condición de checkpoint temprano lo hace útil para estudiar qué comportamientos del modelo base persisten y cuáles se alteran con pocos pasos de ajuste sobre datos clínicos.
- **Generación de datos sintéticos para aumento de corpus**: en un pipeline de investigación, se puede usar para producir borradores de texto médico que después se filtran y validan manualmente, nunca como fuente de verdad clínica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, MedQA, MedMCQA, HumanEval, GSM8K ni de ninguna otra suite, y la búsqueda web realizada no devolvió documentación técnica asociada (los resultados recuperados corresponden a sitios no relacionados: Hyundai, canales de YouTube, ONE Championship y catálogos de hipermercados). Tampoco se dispone de comparaciones frente al modelo base publicadas por el autor.

## Requisitos de hardware

- **VRAM para inferencia en BF16**: aproximadamente 8,05 GB solo de pesos, más el KV cache y las activaciones; en la práctica, entre 10 y 14 GB para contextos cortos.
- **VRAM en cuantizaciones habituales** (estimación orientativa, no verificada en este repositorio): en torno a 4-5 GB en INT8 y 2,5-3 GB en INT4 (GGUF Q4_K_M).
- **KV cache**: crece linealmente con la longitud de contexto. Asumiendo la configuración de GQA del modelo base (36 capas, cabezas KV reducidas), a 32.000 tokens el cache en BF16 ronda los 5 GB; a la longitud máxima declarada por el base (262.144 tokens) supera holgadamente la capacidad de cualquier GPU de consumo, por lo que se requieren técnicas como atención con ventana deslizante, cuantización del cache o sharding.
- **GPU de consumo**: con cuantización INT4 o INT8 cabe sin problema en una RTX 3060 de 12 GB, RTX 4060 Ti 16 GB o RTX 4090. En BF16 completo, una RTX 4090 (24 GB) es suficiente para contextos moderados.
- **GPU de centro de datos**: A100 40/80 GB, H100 80 GB o L40S para servir con concurrencia alta. El modelo es lo bastante pequeño como para replicarse varias instancias por GPU mediante tensor paralelismo o batching continuo.
- **Opciones de despliegue**: Transformers (formato nativo del repositorio), Text Generation Inference (etiqueta `text-generation-inference`), vLLM, SGLang, y llama.cpp/Ollama tras convertir los pesos a GGUF.
- **Latencia y throughput**: no disponibles. No hay cifras publicadas de tokens por segundo ni de latencia en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| qwen3-4b-medicine-static-pilot-261016-step-003 (este modelo) | 4,02B | no disponible (base: 262.144) | Apache-2.0 | HuggingFace |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | ~4B | 262.144 tokens | Apache-2.0 | HuggingFace |
| google/medgemma-4b-it | ~4B | 128.000 tokens | Health AI Developer Foundations (terminos especificos, no OSI) | HuggingFace |
| meta-llama/Llama-3.2-3B-Instruct | 3,2B | 128.000 tokens | Llama 3.2 Community License | HuggingFace |

No se dispone de datos de rendimiento comparativos para este checkpoint, por lo que la tabla se limita a parámetros, contexto, licencia y disponibilidad. Las cifras de contexto y licencia de los modelos comparados proceden de su documentación pública y conviene verificarlas antes de tomar decisiones de arquitectura.

## Limitaciones y advertencias

- **Checkpoint intermedio, no modelo final**: el nombre indica `step-003`, es decir, únicamente 3 pasos de entrenamiento. No debe tratarse como un modelo médico terminado ni como una versión estable.
- **Ausencia total de documentación de evaluación**: no hay benchmarks, validación clínica, análisis de sesgos ni cartas de limitaciones. Cualquier afirmación sobre su calidad es especulativa.
- **Riesgo elevado de alucinación en contenido clínico**: al derivar de un modelo generalista de 4B y no contar con validación específica del dominio, puede generar dosis, interacciones farmacológicas o diagnósticos incorrectos. Su uso en decisiones clínicas está completamente desaconsejado.
- **Sesgos**: no evaluados. El modelo base arrastra los sesgos de su corpus de entrenamiento, y el ajuste sobre datos médicos puede introducir sesgos adicionales de población, idioma o práctica clínica.
- **Idioma**: la ficha de HuggingFace no declara idiomas soportados. No hay garantía de un rendimiento correcto en castellano, ni siquiera de que el corpus de ajuste lo incluya.
- **Contexto no confirmado**: los 262.144 tokens son una característica del modelo base, no un dato confirmado para este fine-tune, que podría haber modificado la configuración de RoPE durante el entrenamiento.
- **Licencia Apache-2.0**: permite uso comercial y modificación, pero exige conservar los avisos de copyright y el texto de licencia, e incluir un aviso de cambios. El copyright de los datos de entrenamiento empleados por el autor no está documentado, lo que puede introducir riesgo legal ajeno a la licencia.
- **Repositorio de 25,7 GB**: la duplicación de pesos (exportación BF16 más checkpoint nativo) multiplica el espacio en disco y los tiempos de descarga, algo a tener en cuenta en pipelines automatizados.
- **Procedencia y trazabilidad limitadas**: el autor `HYU-NLP-EVAL` no publica documentación asociada, y las marcas temporales del repositorio (octubre de 2026) no coinciden con el ciclo de publicación habitual de Qwen3, lo que dificulta verificar su origen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-003
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Informe técnico de la familia Qwen3 (referencia del modelo base): https://arxiv.org/abs/2505.09388
- Modelo médico comparable (MedGemma 4B): https://huggingface.co/google/medgemma-4b-it
- Resultados de la búsqueda web: no se ha identificado ningún enlace relevante sobre este modelo. Los resultados recuperados (hyundai.com/fr/fr, canales de YouTube, onefc.com y bonial.fr) no guardan relación con el modelo ni con su autor y se descartan como fuentes.
