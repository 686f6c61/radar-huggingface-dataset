# perplexity-ai/pplx-decider-v1-27b

## Resumen

pplx-decider-v1-27b es un modelo de decisión especializado desarrollado por Perplexity AI mediante ajuste fino supervisado sobre Qwen3.8-27B. No es un modelo generativo de propósito general, sino un clasificador de decisiones que recibe una entrada de texto (o imagen) junto con un conjunto de criterios y devuelve una elección entre opciones o una probabilidad calibrada para preguntas de sí/no. Su pipeline declarado es `text-classification` y expone una API propia a través del wrapper `Decider`.

El modelo resuelve un problema concreto en sistemas agénticos y pipelines de enrutamiento: tomar decisiones discretas y calibradas sobre texto libre sin depender de prompting frágil sobre un LLM generativo. Con 26.085.330.160 parámetros totales (aproximadamente 26,1 mil millones) y pesos en safetensors que ocupan unos 52,2 GB en el repositorio, requiere hardware de gama alta para inferencia en precisión nativa (el autor indica unos 49 GiB solo para pesos).

Es relevante ahora porque compite directamente con modelos jueces y clasificadores de decisión en tareas de evaluación (RAGTruth, JudgeBench, TabFact, ContractNLI), donde supera a su modelo base Qwen3.8-27B en la mayoría de los 11 benchmarks reportados y alcanza un 85,71 % de precisión global frente al 74,76 % del base. La licencia Apache 2.0 y la existencia de una versión posterior (pplx-decider-v1.1-27b) lo hacen directamente evaluable para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.8-27B); requiere `custom-code` para la capa de decisión |
| Parámetros totales | 26.085.330.160 (≈26,1 B) |
| Parámetros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el autor solo documenta ejecución en precisión nativa, ~49 GiB de pesos) |
| Idiomas soportados | no disponible (el benchmark Belebele sugiere capacidades multilingües, sin lista oficial) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer decoder-only, y se ajusta mediante fine-tuning supervisado para producir decisiones estructuradas en lugar de texto libre. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. Sí se documenta que la capa de decisión se implementa mediante código personalizado (`custom-code`), lo que implica que la inferencia estándar de transformers no basta y hay que usar el wrapper `Decider` proporcionado por el autor.

El pipeline de datos se construye sobre Bespoke Nimble: se usan sus conversores para transformar datasets públicos etiquetados por humanos en dos tipos de decisión, `choice` (elección entre criterios con nombre) y `noul` (probabilidad sí/no). Además, se emplean subconjuntos de benchmark publicados por Nimble, fijados por ID de registro y checksum, para excluir esos registros y ejemplos relacionados del conjunto de entrenamiento, lo que reduce la contaminación de las evaluaciones reportadas. Nimble se descarga en una revisión fijada durante la construcción de datos y no se redistribuye con el modelo.

## Capacidades

- Clasificación de decisión tipo `choice`: dada una entrada y un diccionario de criterios con nombre, devuelve la opción seleccionada junto con probabilidades calibradas.
- Decisión binaria tipo `noul`: devuelve una probabilidad para preguntas de sí/no (por ejemplo, detección de urgencia).
- Procesamiento multimodal: acepta imágenes además de texto mediante el parámetro `images` de `predict`.
- Evaluación de fidelidad y alucinación en contexto RAG (benchmark RAGTruth).
- Clasificación de sentimiento financiero (FinancialPhraseBank).
- Verificación de afirmaciones frente a tablas (TabFact) y razonamiento de sentido común (WinoGrande, Circa).
- Razonamiento de evaluación de respuestas tipo juez (JudgeBench, BBH).
- Inferencia de relaciones en contratos (ContractNLI).
- Capacidades multilingües evidenciadas en Belebele.
- Salida con probabilidades calibradas, apta para umbrales en producción.
- No se documenta soporte explícito de tool calling ni de razonamiento multi-paso agéntico; su rol es emitir la decisión, no orquestar.

## Casos de uso

- Enrutamiento de tickets de soporte: con el tipo `choice` y criterios como `billing`, `technical_support` y `sales`, el modelo asigna cada mensaje al equipo correcto y devuelve probabilidades para aplicar umbrales de escalado humano cuando la confianza es baja.
- Detección de urgencia en atención al cliente: usando `noul` con la instrucción "¿expresa urgencia este mensaje?", se prioriza la cola de tickets; la salida probabilística permite fijar el punto de corte según la SLA.
- Verificación de fidelidad en pipelines RAG: el modelo evalúa si una respuesta generada está respaldada por el contexto recuperado (línea de RAGTruth, donde reporta 88,80 %), lo que permite descartar respuestas alucinadas antes de servirlas.
- Moderación y clasificación de contenido: como clasificador de decisión con criterios configurables, se puede usar para etiquetar mensajes según políticas internas sin reentrenar, cambiando solo el diccionario de criterios.
- Análisis de contratos: con ContractNLI (80,78 %) puede decidir si un documento respalda una hipótesis contractual, útil en revisiones legales asistidas.
- Verificación de afirmaciones sobre datos tabulares: TabFact (90,60 %) lo hace adecuado para validar respuestas de asistentes sobre tablas de negocio o informes.
- Enrutamiento multimodal: al aceptar imágenes, puede clasificar capturas de pantalla o documentos escaneados (por ejemplo, decidir si un screenshot muestra un error de integración de pago).
- Evaluación automática de respuestas de otros LLM: como juez con JudgeBench de 78,29 %, sirve para comparar salidas de modelos en pipelines de evaluación interna.

## Benchmarks y rendimiento

Resultados reportados por el autor, medidos a través de la API de Perplexity. La columna "Jev" corresponde al valor de referencia que figura en la model card.

| Benchmark | Jev | Qwen3.8-27B | pplx-decider-v1-27b |
|---|---:|---:|---:|
| WinoGrande | **90,70 %** | 73,10 % | 83,30 % |
| FinancialPhraseBank | 76,98 % | 75,68 % | **84,18 %** |
| RAGTruth | 77,27 % | 61,53 % | **88,80 %** |
| JudgeBench | **78,57 %** | 68,86 % | 78,29 % |
| BBH | **94,27 %** | 72,80 % | 82,80 % |
| JevBench public hard | **73,27 %** | 72,28 % | 70,30 % |
| TabFact | 89,80 % | 78,60 % | **90,60 %** |
| ContractNLI | 77,45 % | **80,78 %** | **80,78 %** |
| Circa | 84,60 % | 87,00 % | **89,20 %** |
| Belebele | **95,00 %** | 93,20 % | 94,00 % |
| TruthfulQA binary | **92,00 %** | 82,80 % | 85,40 % |
| Overall | 84,51 % | 74,76 % | **85,71 %** |

El modelo supera a su base en 9 de 11 benchmarks y empata en ContractNLI. Pierde frente a la referencia "Jev" en WinoGrande, JudgeBench, BBH, JevBench public hard, Belebele y TruthfulQA binary, y cae por debajo de su propio base en JevBench public hard (70,30 % frente a 72,28 %).

## Requisitos de hardware

- VRAM estimada: el autor indica aproximadamente 49 GiB solo para pesos, más memoria de trabajo; en la práctica se necesita una GPU de 80 GB para margen operativo en precisión nativa.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU con tensor parallelism.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 en precisión nativa; se requeriría cuantización, que el autor no documenta ni soporta oficialmente con pesos publicados.
- Despliegue: el flujo soportado es el script `inference.py` con `uv` y el wrapper `Decider`; no se documenta integración con vLLM, llama.cpp, Ollama ni TGI, y el uso de `custom-code` complica el soporte en servidores de inferencia estándar.
- Latencia y throughput: no disponibles.
- Entorno: Python 3.12+ y CUDA.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Overall reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pplx-decider-v1-27b | ≈26,1 B | no disponible | 85,71 % | Apache 2.0 | Hugging Face |
| Qwen3.8-27B (base) | ≈26 B (heredado) | no disponible | 74,76 % | según modelo base | Hugging Face |
| pplx-decider-v1.1-27b | no disponible | no disponible | no disponible | no disponible | Hugging Face (versión posterior) |
| Bespoke Nimble 9B | 9 B | no disponible | no disponible | no disponible | Hugging Face |

La comparativa con clasificadores de decisión de terceros no está disponible en la información proporcionada. La referencia "Jev" que aparece en los benchmarks no se identifica con un modelo concreto en la model card.

## Limitaciones y advertencias

- No es un modelo generativo: no debe usarse para producir texto libre, solo decisiones estructuradas mediante el wrapper `Decider`.
- Requiere `custom-code` y `trust_remote_code`; la carga con transformers estándar no es suficiente y complica auditorías de seguridad.
- Los benchmarks se midieron a través de la API de Perplexity, no con los pesos locales; el rendimiento en inferencia local puede diferir.
- Riesgo de alucinación en la justificación de decisiones: el modelo emite probabilidades calibradas, pero no se documenta calibración fuera de los benchmarks reportados.
- Sesgos: no se documenta análisis de sesgos demográficos, de dominio ni lingüísticos.
- Idiomas: no hay lista oficial; el soporte multilingüe solo se infiere de Belebele.
- Contexto: la longitud máxima no está declarada, lo que impide planificar entradas largas con garantías.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B puede tener condiciones propias que conviene revisar antes de redistribuir.
- Existe una versión posterior (v1.1); la v1 se considera obsoleta para nuevas integraciones.
- JevBench public hard muestra degradación frente al base (70,30 % frente a 72,28 %), lo que sugiere pérdida de rendimiento en esa familia de tareas.
- No se documentan cuantizaciones oficiales; desplegar en GPUs de consumo requiere trabajo adicional no soportado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/perplexity-ai/pplx-decider-v1-27b
- Versión posterior: https://huggingface.co/perplexity-ai/pplx-decider-v1.1-27b
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Bespoke Nimble (repositorio): https://github.com/bespokelabsai/nimble
- Bespoke Nimble 9B: https://huggingface.co/bespokelabs/Bespoke-Nimble-9B
