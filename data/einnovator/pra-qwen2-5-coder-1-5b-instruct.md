# EInnovator/pra-qwen2-5-coder-1-5b-instruct

## Resumen

Este repositorio no contiene un modelo de lenguaje independiente, sino un *PRA Runtime Bundle* para el modelo base `Qwen/Qwen2.5-Coder-1.5B-Instruct`. El bundle empaqueta el mapeo estructural, los perfiles de ejecución, los componentes aprendidos opcionales y la evidencia de cualificación para la técnica *Progressive Retrieval Attention* (PRA), desarrollada por EInnovator. PRA es un mecanismo de atención selectiva que permite al modelo procesar contextos largos recuperando de forma progresiva las partes más relevantes, en lugar de atender a toda la secuencia por igual.

El bundle no contiene los pesos del modelo base, sino un adaptador de routing (con 393.216 parámetros) entrenado sobre los conjuntos QASPER y HotpotQA. Su propósito es mejorar la selección de contexto en tareas de pregunta-respuesta sobre documentos extensos, manteniendo la arquitectura original `Qwen2ForCausalLM` del modelo base de 1.5B parámetros. La relevancia actual radica en que ofrece una alternativa ligera y modular para extender la ventana de contexto efectiva de modelos pequeños sin necesidad de reentrenar el modelo completo, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (modelo base) + adaptador de routing PRA |
| Parametros totales | 1.5B (modelo base) + 393.216 (adaptador de routing) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base soporta 32K tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (depende del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el bundle no contiene pesos; el adaptador se distribuye en el formato propio del framework PRA) |

## Arquitectura y entrenamiento

El bundle se basa en el modelo `Qwen2.5-Coder-1.5B-Instruct`, una arquitectura transformer causal de 1.5B parámetros especializada en código. Sobre esta base, PRA añade un mecanismo de atención selectiva que divide el contexto en segmentos y los recupera progresivamente según su relevancia para la consulta. El componente aprendido es un router que decide qué segmentos atender, entrenado mediante el método *multi-positive softmax* sobre los datasets QASPER y HotpotQA, con 48 ejemplos de entrenamiento, 16 de validación y 16 de test, usando cinco semillas (11, 23, 37, 53, 71). El router tiene 393.216 parámetros y se seleccionó maximizando el AUC0-30 combinado de validación.

No se trata de un fine-tune LoRA ni de un ajuste de calidad del modelo base; es un adaptador de infraestructura que modifica la estrategia de atención sin alterar los pesos originales. El bundle incluye perfiles de ejecución (QUALITY, BALANCED, ECONOMY y QASPER-LEARNED), de los cuales solo BALANCED está cualificado como predeterminado; QASPER-LEARNED es de investigación y no se recomienda por defecto.

## Capacidades

- Selección de contexto relevante en secuencias largas mediante atención progresiva.
- Mejora de la recuperación de información en tareas de pregunta-respuesta sobre documentos extensos (QASPER, HotpotQA).
- Integración con el motor de inferencia Hugging Face (`hf`) y soporte experimental para MLX.
- Perfiles de ejecución configurables (BALANCED, QUALITY, ECONOMY) para ajustar el equilibrio entre calidad y coste.
- No incluye capacidades de generación de texto, tool calling, agentes ni razonamiento multi-paso propias; estas dependen del modelo base subyacente.

## Casos de uso

- Pregunta-respuesta sobre documentos largos: el bundle permite que un modelo de 1.5B procese corpus extensos (artículos, informes) seleccionando los pasajes más relevantes, reduciendo el coste computacional frente a la atención completa.
- Pipeline de RAG (generación aumentada por recuperación): puede integrarse como componente de reranking o selección de fragmentos antes de la generación, mejorando la precisión en dominios especializados.
- Optimización de memoria en despliegues con recursos limitados: al no requerir reentrenamiento, permite adaptar modelos pequeños a contextos más largos sin aumentar la VRAM más allá del modelo base.
- Investigación en atención eficiente: sirve como referencia reproducible para estudiar el impacto de la recuperación progresiva frente a atención densa en modelos de código.
- Evaluación de routers de contexto: los perfiles y la herramienta `pra evaluate` permiten medir la calidad de selección en datasets propios antes de integrarlo en producción.
- Despliegue en entornos con GPU de consumo: al basarse en un modelo de 1.5B, puede ejecutarse en tarjetas como RTX 3060 o superiores, usando el adaptador para ampliar el contexto efectivo.

## Benchmarks y rendimiento

La model card reporta métricas de recuperación (R@20%) para el router en dos datasets, con dos perfiles. Estos resultados son diagnósticos de routing, no de calidad de generación final.

| Dataset | Perfil | R@20% | Cohorte | Evidencia |
|---|---|---|---:|---:|---|
| qasper | balanced | 0.1885 | 8 | CONTROLADA |
| qasper | qasper-learned | 0.357 | 8 | CONTROLADA |
| hotpotqa | balanced | 0.4042 | 8 | CONTROLADA |
| hotpotqa | qasper-learned | 0.2687 | 8 | CONTROLADA |
| combined | balanced | 0.2963 | 16 | CONTROLADA |
| combined | qasper-learned | 0.3129 | 16 | CONTROLADA |

No se han publicado resultados de benchmarks de generación de texto o código para este bundle. La model card indica explícitamente que no hay resultados de tarea final emparejados para esta identidad exacta.

## Requisitos de hardware

- El bundle no añade requisitos adicionales significativos; la VRAM necesaria es la del modelo base (aproximadamente 3.1 GB en bfloat16, según datos públicos de Qwen).
- GPU recomendadas: cualquier tarjeta con al menos 4 GB de VRAM (RTX 3060, RTX 4060, A10) para inferencia básica; para contextos muy largos se recomienda al menos 8 GB.
- No cabe en GPU de consumo muy antiguas o integradas (menos de 4 GB) sin cuantización, pero el adaptador es ligero.
- Opciones de despliegue: motor `hf` (Hugging Face Transformers) es el soportado; también hay compatibilidad portable con MLX para Apple Silicon.
- Latencia y throughput: no disponibles; dependen del modelo base y del perfil de ejecución elegido. La documentación de PRA recomienda ejecutar `pra evaluate` en el hardware objetivo.

## Comparativa con modelos similares

No hay comparativas publicadas entre este bundle y alternativas equivalentes. Como referencia, se puede comparar con el modelo base sin adaptador PRA o con otras técnicas de contexto largo como LongRoPE o YaRN, pero no se dispone de datos de rendimiento comparables en la información proporcionada. La comparativa no está disponible.

## Limitaciones y advertencias

- El router aprendido (QASPER-LEARNED) mejora QASPER pero no es uniformemente positivo en HotpotQA; está marcado como opt-in y no es el perfil predeterminado.
- La validación de routing se realizó con solo 8 ejemplos por dataset, lo que limita la solidez de las afirmaciones de control.
- Los perfiles de capas de consumo y la generación de tarea final no están calibrados para esta identidad exacta; el bundle no garantiza calidad de generación.
- La cualificación es específica del checkpoint bfloat16 de Hugging Face y no se transfiere automáticamente a otras cuantizaciones, motores o revisiones.
- La evidencia de routing compara un router genérico congelado con un router aprendido pequeño; no establece calidad de generación final.
- Las licencias del modelo base y de los datasets se aplican por separado al artefacto del router.
- Riesgo de alucinación y sesgos: no se han evaluado para este bundle; dependen del modelo base.

## Enlaces

- Repositorio del bundle: https://huggingface.co/EInnovator/pra-qwen2-5-coder-1-5b-instruct
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Documentación de PRA: https://einnovator.github.io/pdattention/
- Repositorio fuente: https://github.com/einnovator/pdattention
- Issues: https://github.com/einnovator/pdattention/issues
