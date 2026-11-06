# sigmanih/XHToken-Spark-X2.5-4B-GGUF_Q4_K_M

## Resumen

XHToken-Spark-X2.5-4B es un modelo de lenguaje causal de 4.112.079.360 parámetros publicado por el usuario sigmanih bajo la etiqueta de Sigma Studio. Se distribuye exclusivamente en formato GGUF con cuantización Q4_K_M, lo que sitúa el repositorio en 2,6 GB y permite su ejecución en GPU de consumo con 6-8 GB de VRAM o en CPU con aproximadamente 3,6 GB de RAM. La model card declara una ventana de contexto de 32.768 tokens y una arquitectura base CausalLM, sin especificar la familia concreta del transformer subyacente.

El modelo se presenta como una versión orientada a producción y a despliegues en el borde ("edge devices, real-time voice agents, mobile & CPU-friendly workloads"), con soporte declarado de un modo de razonamiento Chain-of-Thought ("Deep Thinking") frente a un modo directo sin razonamiento. Los idiomas declarados son inglés e italiano, y la licencia figura como "other", sin que la model card concrete los términos exactos más allá de un badge que referencia Apache-2.0.

Su relevancia actual es limitada pero concreta: se trata de un modelo pequeño, cuantizado y ligero pensado para entornos con recursos restringidos, con métricas de evaluación publicadas por el propio autor (59% de acierto agregado en un conjunto de 100 preguntas y 79,3% de adherencia al protocolo de tool calling). No hay información sobre el proceso de entrenamiento, el dataset utilizado ni la procedencia de los pesos base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CausalLM (transformer causal; familia concreta no disponible) |
| Parametros totales | 4.112.079.360 (4B) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Q4_K_M (única variante publicada en este repositorio) |
| Idiomas soportados | en, it |
| Licencia | other (la model card muestra badge Apache-2.0, sin texto legal que lo confirme) |
| Formato de pesos | GGUF (la model card indica "Sconosciuto/sconosciuta" en el campo de formato, en contradicción con el identificador del repositorio) |

## Arquitectura y entrenamiento

La información disponible describe únicamente una arquitectura CausalLM con 4B parámetros activos y una ventana de contexto de 32.768 tokens. No se especifica si se trata de un transformer denso estándar, de una variante con atención lineal, de un modelo híbrido SSM ni de una mezcla de expertos; la model card no incluye diagrama, paper ni referencia a los pesos base sobre los que se habría realizado el ajuste. Tampoco se detalla la tokenizador, la dimensión oculta, el número de capas ni el número de cabezas de atención.

No hay datos sobre el volumen de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF, DPO o SFT, ni sobre técnicas de decodificación especulativa. El autor menciona que el modelo fue "optimizado y publicado" mediante el módulo Model Hub de Sigma Studio y evaluado con "SigmaEngine Direct GPU", lo que sugiere un pipeline propio de conversión a GGUF y evaluación, pero no aporta información sobre el preentrenamiento. Cualquier afirmación sobre innovaciones técnicas (atención lineal, decodificación especulativa, destilación) carecería de respaldo en la documentación disponible.

## Capacidades

- Generación de texto conversacional en inglés e italiano, con formato de chat multi-turno.
- Modo de razonamiento explícito ("Deep Thinking CoT") que genera una traza de razonamiento paso a paso antes de la respuesta final, con una mejora declarada de +2,6% en precisión frente al modo directo.
- Modo directo ("No-Thinking") con latencia mínima y sin tokens de razonamiento adicionales.
- Tool calling y function calling: la model card reporta un 79,3% de adherencia al protocolo de herramientas en un entorno de sandbox con sistema de ficheros.
- Ejecución de tareas agénticas multi-paso: creación de ficheros, inspección de claves, modificación dirigida, búsqueda en árbol de directorios y depuración, con un 50% de finalización autónoma de escenarios.
- Razonamiento matemático de nivel escolar y competición (GSM8K y MATH evaluados).
- Generación de código Python (HumanEval y MBPP evaluados).
- No se declaran capacidades de visión, audio, ni soporte multilingüe más allá de inglés e italiano.

## Casos de uso

- Agentes de voz en tiempo real en dispositivos de borde: con 4B parámetros en Q4_K_M y ~4 GB de VRAM en offload completo, el modelo puede ejecutarse en GPUs de 6-8 GB o en CPU con 16 GB de RAM, lo que permite integrarlo en asistentes de voz locales con latencia baja en modo No-Thinking.
- Automatización de tareas sobre el sistema de ficheros: el modelo ha sido evaluado en escenarios de creación, inspección y modificación de ficheros dentro de un sandbox, por lo que encaja en pipelines de agentes que operan sobre repositorios o directorios de trabajo con permisos acotados.
- Asistencia de programación en local: soporta generación de código Python y tool calling, lo que permite integrarlo en entornos de desarrollo sin conexión o con requisitos de privacidad, aceptando un rendimiento moderado (57% en HumanEval pass@1 según el autor).
- Chat de atención al cliente en inglés o italiano: la ventana de 32.768 tokens permite mantener conversaciones multi-turno con historial extenso, y el modo directo reduce el coste por respuesta en despliegues de alto volumen.
- Clasificación y respuesta a preguntas sobre documentación técnica: con contexto de 32K puede ingerir manuales o especificaciones completas y responder consultas, aunque la precisión en conocimiento general (36% en MMLU) limita su uso en dominios que requieran amplio conocimiento factual.
- Prototipado y experimentación en investigación: al ser un GGUF ligero con métricas de evaluación publicadas y modos de razonamiento conmutables, sirve como banco de pruebas para comparar estrategias de CoT frente a respuesta directa en modelos pequeños.
- Despliegue en entornos con restricciones de hardware: aplicaciones de escritorio, dispositivos embebidos con suficiente RAM o contenedores sin GPU pueden servirlo mediante llama.cpp u Ollama con un footprint de ~2,6 GB en disco.

## Benchmarks y rendimiento

Los datos provienen exclusivamente de la evaluación publicada por el autor en la model card (Sigma Studio Training Lab, temperatura 0.0, semilla 42, protocolos code_execution, continuation_logprob, cot_generation y letter_logprob). No se han contrastado de forma independiente.

| Benchmark | Aciertos / Total | Precisión |
|---|---|---|
| ARC-Challenge | 9 / 9 | 100% |
| BIG-Bench Hard | 7 / 7 | 100% |
| GSM8K | 9 / 9 | 100% |
| MATH | 6 / 9 | 67% |
| MBPP | 6 / 9 | 67% |
| TruthfulQA | 6 / 9 | 67% |
| HumanEval (pass@1) | 4 / 7 | 57% |
| MMLU | 5 / 14 | 36% |
| HellaSwag | 3 / 9 | 33% |
| MMLU-Pro | 3 / 9 | 33% |
| GPQA | 1 / 9 | 11% |
| Total agregado | 59 / 100 | 59% |

| Modo de ejecución | Precisión | Preguntas superadas |
|---|---|---|
| No-Thinking (respuesta directa) | 57,9% | 33 / 57 |
| Deep Thinking (CoT) | 60,5% | 26 / 43 |

| Métrica de agente (Sandbox Jail) | Resultado |
|---|---|
| Adherencia al protocolo de herramientas | 79,3% (73/92 criterios) |
| Finalización autónoma de tareas | 50,0% (4/8 escenarios) |
| Contención en el sandbox | 100% conforme |
| Eficiencia de ejecución | 84 turnos (164,5 s) |

Advertencia: los tamaños de muestra por benchmark son muy reducidos (entre 7 y 14 preguntas), por lo que los intervalos de confianza son amplios y los porcentajes no son comparables con evaluaciones estándar de la industria.

## Requisitos de hardware

- VRAM estimada: ~4,0 GB con offload completo en GPU para la cuantización Q4_K_M.
- RAM estimada en CPU o modo híbrido: ~3,6 GB.
- GPU recomendadas por el autor: cualquier GPU con 6-8 GB de VRAM; cabe en RTX 3060, RTX 4060, RTX 2070 y superiores. No se especifican A100, H100 ni RTX 4090, aunque por tamaño cabría holgadamente en todas ellas.
- Cabe en GPU de consumo: sí, en modelos con 6 GB o más de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el repositorio incluye la etiqueta endpoints_compatible. No se confirma soporte de vLLM ni TGI, que requieren habitualmente safetensors.
- Latencia y throughput: no disponibles. La model card solo reporta el tiempo agregado de la evaluación agéntica (164,5 s para 84 turnos), no una métrica de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la información proporcionada, ya que no se especifica la familia base del modelo ni se ofrecen resultados de terceros bajo el mismo protocolo de evaluación. A modo de referencia categórica (modelos de ~4B parámetros en GGUF), se indica lo siguiente, sin que los datos de rendimiento sean directamente comparables:

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| XHToken-Spark-X2.5-4B | 4,1B | 32.768 | other (no especificada) | GGUF Q4_K_M |
| Alternativas de ~4B en GGUF | ~3-4B | variable (4K-128K) | variable (Apache-2.0, Llama, Gemma) | GGUF |

No se dispone de una comparación de rendimiento fiable: los benchmarks del autor emplean muestras de 7-14 preguntas y un protocolo propio, por lo que no son equiparables a MMLU, HumanEval o GSM8K estándar de otros modelos.

## Limitaciones y advertencias

- Trazabilidad insuficiente: no se identifica el modelo base, el dataset de entrenamiento ni el proceso de ajuste, lo que impide auditar el origen de los pesos y evaluar riesgos de contaminación de benchmarks.
- Benchmarks con muestras mínimas: entre 7 y 14 preguntas por prueba; los resultados (incluido el 100% en ARC-Challenge, GSM8K y BBH) no son estadísticamente significativos.
- Rendimiento bajo en conocimiento general y factual: 36% en MMLU, 33% en MMLU-Pro, 11% en GPQA y 33% en HellaSwag según el propio autor, lo que desaconseja su uso en tareas que requieran conocimiento enciclopédico o razonamiento académico.
- Riesgo de alucinación: con un 67% en TruthfulQA y un conocimiento general limitado, la probabilidad de respuestas factualmente incorrectas es alta en dominios abiertos.
- Cobertura lingüística restringida a inglés e italiano; no se declara soporte de español ni de otros idiomas.
- Licencia ambigua: el campo `license` es "other" mientras la model card muestra un badge Apache-2.0; antes de un uso comercial debe verificarse el texto legal, que no está incluido en la información disponible.
- Formato único GGUF Q4_K_M: no se publican safetensors ni otras cuantizaciones, lo que limita el fine-tuning y el despliegue en motores que requieren pesos completos (vLLM, TGI).
- La model card contiene incoherencias internas (formato de pesos "Sconosciuto", huella en disco "0.0 GB", mezcla de inglés e italiano), lo que reduce la fiabilidad de la documentación.
- Finalización autónoma de tareas agénticas del 50%: no es adecuado para flujos de agente sin supervisión humana.
- Sin información sobre sesgos demográficos, filtros de seguridad ni moderación de contenido.

## Enlaces

- Hugging Face: https://huggingface.co/sigmanih/XHToken-Spark-X2.5-4B-GGUF_Q4_K_M
- Repositorio SigmaStudio: https://github.com/Sigmanih/SigmaStudio
- Perfil del autor en Hugging Face: https://huggingface.co/sigmanih
- Licencia Apache-2.0 (referenciada en la model card): https://opensource.org/licenses/Apache-2.0
