# Rumiii/Mistral-BioMed-Tool-Caller-7B

## Resumen

Mistral-BioMed-Tool-Caller-7B es un modelo de lenguaje especializado en la selección y llamada de herramientas biomédicas, desarrollado por Rumiii mediante fine-tuning de Mistral-7B-Instruct-v0.3. El modelo está diseñado para recibir una pregunta biomédica y un conjunto de esquemas de herramientas disponibles, y generar la llamada de función correcta en el formato nativo `[TOOL_CALLS]` de Mistral. Su relevancia radica en que aborda un problema práctico: la integración de modelos de lenguaje con APIs biomédicas reales (NCBI, UniProt, Ensembl) para automatizar consultas de genómica, proteómica y biología comparativa.

El fine-tuning se realizó con QLoRA (4-bit) mediante Unsloth, entrenando solo el 1,14 % de los parámetros totales sobre el dataset BioTool, que contiene 5 408 ejemplos verificados de pares consulta-llamada a API, más un 10 % de datos de instrucción general para preservar la capacidad conversacional. El modelo tiene 7 248 millones de parámetros y se distribuye bajo licencia Apache 2.0. Aunque la selección de herramienta es fiable en las pruebas realizadas, la precisión de los argumentos generados no está formalmente validada, por lo que se considera un prototipo sólido más que un sistema de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Mistral-7B) |
| Parametros totales | 7 248 023 552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda de Mistral-7B-Instruct-v0.3, no especificado) |
| Tipos de cuantizacion | no disponible (publicado en safetensors; cuantizable con herramientas externas) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Mistral-7B-Instruct-v0.3, un transformer decoder con atención de ventana deslizante (sliding window attention) y 32 capas, aunque la model card no detalla la configuración interna. El fine-tuning se realizó con QLoRA en 4 bits, con rango y alpha de 32, aplicado a los módulos de proyección q/k/v/o y a las proyecciones gate/up/down. Se entrenaron 83 886 080 parámetros (1,14 % del total) durante una sola época sobre el dataset BioTool, que contiene 5 408 ejemplos tras filtrado, complementados con 540 ejemplos de instrucción general de HuggingFaceH4/no_robots. La pérdida final de entrenamiento fue de aproximadamente 0,27. El entrenamiento se ejecutó en una única GPU T4 de Kaggle, lo que limitó la duración a una época.

El dataset BioTool (Gao et al., 2026, arXiv:2605.05758) cubre 127 herramientas de tres familias de APIs: NCBI E-utilities (esearch, efetch, elink, BLAST), UniProt REST (proteínas, proteomas, taxonomía) y Ensembl REST (mapeo de coordenadas, predicción de efectos de variantes, genómica comparativa). No incluye APIs clínicas como ICD-10, bases de datos de fármacos o registros de ensayos clínicos.

## Capacidades

- Selección de herramienta biomédica: dado un conjunto de esquemas de funciones, el modelo elige la herramienta correcta entre las 127 disponibles en su entrenamiento.
- Generación de llamadas de función en formato `[TOOL_CALLS]` de Mistral, compatible con el chat template del modelo base.
- Cobertura de tres familias de APIs: NCBI E-utilities, UniProt REST y Ensembl REST.
- Razonamiento conversacional básico: conserva parte de la capacidad de diálogo general gracias al 10 % de datos de instrucción intercalados.
- Soporte de tool calling nativo: integrable con pipelines de transformers y compatible con text-generation-inference (según tags del repositorio).
- Multilingüismo: limitado al inglés, tanto en las consultas como en las respuestas.

## Casos de uso

- Automatización de búsquedas bibliográficas en PubMed: el modelo puede generar llamadas a `esearch` y `efetch` para recuperar artículos sobre un tema dado, por ejemplo "BRCA1 mutations", y devolver los UIDs o resúmenes correspondientes.
- Consulta de datos de proteínas en UniProt: a partir de una pregunta como "¿Qué proteínas humanas interactúan con TP53?", el modelo genera la llamada REST adecuada para obtener información de proteomas o taxonomía.
- Análisis de variantes genéticas con Ensembl: el modelo puede invocar endpoints de predicción de efectos de variantes o mapeo de coordenadas, facilitando pipelines de anotación genómica.
- Integración en asistentes de investigación biomédica: un chatbot que reciba preguntas de laboratorio puede usar este modelo para traducirlas en llamadas a APIs reales, reduciendo la intervención manual.
- Generación de scripts de consulta para pipelines de bioinformática: el modelo produce argumentos estructurados que pueden insertarse directamente en código Python o bash para ejecutar consultas por lotes.
- Prototipado rápido de agentes tool-calling en dominios científicos: sirve como base para evaluar la viabilidad de agentes que interactúan con APIs biomédicas antes de invertir en fine-tuning más extenso.

## Benchmarks y rendimiento

No se han publicado resultados formales de benchmarks en la información disponible. La model card menciona pruebas puntuales (spot-checks) sobre el conjunto de test de BioTool, donde el modelo seleccionó correctamente la herramienta en todos los casos probados, pero ocasionalmente generó valores de argumento incorrectos (por ejemplo, confundir valores de enum como `neighbor` vs `neighbor_score`, o `blastx` vs `blastp`). No se ha realizado una evaluación completa de Exact-Match o similitud sobre el conjunto de test completo. Por tanto, no se dispone de métricas cuantitativas comparables (MMLU, HumanEval, GSM8K, etc.) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 7 248 millones de parámetros, en float16 ocupa aproximadamente 14,5 GB, por lo que requiere una GPU con al menos 16 GB de VRAM para inferencia sin cuantizar. Con cuantización de 4 bits (por ejemplo, mediante GPTQ o AWQ), la huella se reduce a unos 4-5 GB, permitiendo su ejecución en GPUs consumer de 8 GB.
- GPU recomendadas: para inferencia en float16, una RTX 4090 (24 GB) o una A100 (40/80 GB) son adecuadas. Con cuantización, una RTX 3060 (12 GB) o RTX 4070 (12 GB) pueden ser suficientes.
- Compatibilidad con consumer GPU: sí, especialmente con cuantización de 4 u 8 bits. En float16, solo GPUs de gama alta con 16 GB o más.
- Opciones de despliegue: al ser un modelo transformers estándar, puede servirse con vLLM, TGI (text-generation-inference), o mediante llama.cpp/Ollama si se convierte a GGUF. El repositorio incluye el tag `text-generation-inference` y `endpoints_compatible`, lo que sugiere compatibilidad con soluciones de despliegue gestionado.
- Latencia y throughput: no se han publicado datos específicos. Como referencia, un modelo de 7B en una GPU moderna suele generar entre 20 y 50 tokens por segundo en float16, y algo menos en cuantización, dependiendo de la implementación y el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mistral-BioMed-Tool-Caller-7B | 7,25 B | no disponible | Tool-calling biomedico (NCBI, UniProt, Ensembl) | Apache 2.0 | Hugging Face |
| BioMistral-7B | 7 B | no disponible | QA biomedico general (pre-entrenado en PubMed Central) | Apache 2.0 | Hugging Face |
| Mistral-7B-Instruct-v0.3 | 7,25 B | 32k (segun documentacion de Mistral) | Instruccion general | Apache 2.0 | Hugging Face, Ollama |

La comparativa se basa en características generales, ya que no se dispone de resultados de benchmarks comunes para Mistral-BioMed-Tool-Caller-7B. BioMistral-7B está orientado a preguntas y respuestas biomédicas, mientras que este modelo se centra exclusivamente en la generación de llamadas a herramientas. Mistral-7B-Instruct-v0.3 es el modelo base, sin especialización biomédica ni tool-calling entrenado.

## Limitaciones y advertencias

- La precisión de los argumentos generados no es fiable al 100 %: en pruebas puntuales, el modelo seleccionó la herramienta correcta en todos los casos, pero produjo valores de argumento plausibles pero incorrectos en algunas ocasiones (por ejemplo, enums confundidos). No se ha realizado una evaluación formal de Exact-Match sobre el conjunto de test completo.
- Puede inventar nombres de campos para herramientas poco representadas en el entrenamiento. Es imprescindible verificar los argumentos generados antes de ejecutarlos contra una API real.
- Cobertura limitada a NCBI, UniProt y Ensembl. Consultas que requieran otras APIs biomédicas o clínicas (ICD-10, bases de datos de fármacos, ensayos clínicos) quedan fuera de su alcance.
- No está diseñado para uso clínico ni diagnóstico. No debe emplearse en decisiones médicas sin supervisión humana.
- Entrenado durante una sola época en una GPU T4, lo que probablemente limita la precisión a nivel de argumento. Un entrenamiento más largo o con más datos podría mejorar este aspecto.
- Solo soporta inglés. No hay capacidades multilingües documentadas.
- No se han publicado benchmarks formales, por lo que su rendimiento comparativo con otros modelos no está cuantificado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Rumiii/Mistral-BioMed-Tool-Caller-7B
- Dataset BioTool: https://huggingface.co/datasets/gxx27/BioTool
- Paper BioTool (arXiv): https://arxiv.org/abs/2605.05758
- Modelo base Mistral-7B-Instruct-v0.3: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
- BioMistral-7B (modelo comparativo): https://huggingface.co/BioMistral/BioMistral-7B
- Mistral 7B (anuncio oficial): https://mistral.ai/news/announcing-mistral-7b/
