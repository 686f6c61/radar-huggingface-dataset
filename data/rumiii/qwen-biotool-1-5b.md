# Rumiii/Qwen-BioTool-1.5B

## Resumen

Qwen-BioTool-1.5B es un modelo de lenguaje especializado en tool-calling biomédico, desarrollado por Rumiii como un fine-tuning de Qwen2.5-1.5B-Instruct. El modelo está diseñado para recibir una pregunta biomédica y un conjunto de esquemas de herramientas disponibles, seleccionar la herramienta correcta y generar una llamada de función con argumentos correctamente formateados. Su objetivo es facilitar la integración de modelos de lenguaje con APIs biomédicas reales como NCBI E-utilities, UniProt REST y Ensembl REST.

El ajuste se realizó mediante QLoRA (4-bit) sobre el modelo base Qwen2.5-1.5B-Instruct, entrenando únicamente 18,4 millones de parámetros (1,18% del total) con 5,632 muestras del dataset BioTool. El modelo conserva la arquitectura transformer decoder-only de Qwen2, con aproximadamente 1,54 mil millones de parámetros totales. Su relevancia radica en ofrecer una alternativa ligera y de código abierto (licencia Apache 2.0) para automatizar consultas a bases de datos biológicas, un área donde los modelos grandes suelen ser costosos de desplegar.

Aunque está especializado en tool-calling, hereda las capacidades conversacionales del modelo base, pero no se ha reforzado esa faceta durante el entrenamiento. La cobertura de herramientas se limita a las tres familias de APIs mencionadas, sin incluir APIs clínicas ni de fármacos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 (1,54B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada en la model card |
| Tipos de cuantizacion | No especificados; el repositorio contiene safetensors (3,1 GB, probablemente bf16/fp16) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen-BioTool-1.5B parte de la arquitectura Qwen2.5-1.5B-Instruct, un transformer decoder-only con atención causal estándar. No emplea mezcla de expertos (MoE) ni mecanismos de atención lineal; es un modelo denso convencional. El fine-tuning se realizó con QLoRA (4-bit) usando la librería Unsloth, lo que permitió entrenar solo los adaptadores LoRA (18.464.768 parámetros, un 1,18% del total) manteniendo congelados los pesos del modelo base. Se entrenó durante 3 épocas sobre 5.632 muestras del dataset BioTool, alcanzando una pérdida final de 0,20.

El dataset BioTool, descrito en el preprint arXiv 2605.05758, contiene 7.040 pares verificados por humanos de consultas a APIs biomédicas (NCBI, UniProt y Ensembl). El modelo cubre 127 herramientas distintas dentro de estas tres familias, incluyendo esearch, efetch, elink, BLAST, búsquedas de proteínas y proteomas, mapeo de coordenadas y predicción de efectos de variantes. No se aplicaron técnicas adicionales como RLHF o DPO; el entrenamiento se limitó a la supervisión directa sobre las llamadas de función.

## Capacidades

- Generación de llamadas a funciones (function calling) en formato JSON, con selección de la herramienta adecuada entre un conjunto de esquemas proporcionados.
- Soporte de tool-use biomédico específico para APIs de NCBI (E-utilities), UniProt (REST) y Ensembl (REST).
- Generación de argumentos de función correctamente formateados, aunque el campo `arguments` se devuelve como una cadena JSON que requiere un `json.loads()` adicional.
- Capacidades conversacionales heredadas del modelo base Qwen2.5-1.5B-Instruct, aunque no reforzadas durante el fine-tuning.
- Multilingüismo limitado: entrenado y evaluado únicamente en inglés, aunque el base soporta más idiomas.
- No dispone de capacidades de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Búsqueda bibliográfica automatizada en PubMed: el modelo puede interpretar preguntas como "busca artículos sobre mutaciones BRCA1" y generar la llamada a `esearch` con los parámetros `db` y `term` correctos, integrándose en pipelines de revisión sistemática.
- Consulta de datos de proteínas en UniProt: dado un identificador o nombre de proteína, el modelo genera la llamada REST adecuada para obtener secuencias, anotaciones o información de proteomas, útil en laboratorios de biología computacional.
- Análisis de variantes genéticas con Ensembl: el modelo puede traducir consultas sobre efectos de variantes o mapeo de coordenadas genómicas a las llamadas de la API de Ensembl, facilitando el análisis de datos de secuenciación.
- Automatización de flujos de trabajo bioinformáticos: integración en orquestadores de agentes que necesitan consultar múltiples bases de datos biológicas de forma programática, reduciendo la necesidad de escribir código manual para cada endpoint.
- Generación de scripts de consulta para BLAST: el modelo puede seleccionar y parametrizar la herramienta BLAST de NCBI a partir de una pregunta en lenguaje natural, acelerando tareas de alineamiento de secuencias.
- Asistente de investigación para biólogos no programadores: desplegado en una interfaz conversacional, permite a investigadores formular preguntas en lenguaje natural y obtener llamadas a APIs listas para ejecutar, sin conocer los detalles técnicos de cada endpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos de tool-calling.

## Requisitos de hardware

- VRAM estimada para inferencia: con los pesos en bf16/fp16 (tamaño del repo 3,1 GB), se necesitan aproximadamente 3-4 GB de VRAM para cargar el modelo completo. Con cuantización a 4-bit (no publicada en el repositorio, pero posible mediante herramientas como llama.cpp o GPTQ), la VRAM requerida se reduciría a alrededor de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 2060, RTX 3060, o GPUs de datacenter como A10 o T4. No requiere hardware especializado.
- Cabe en GPUs de consumo: sí, es un modelo de 1,5B que puede ejecutarse en tarjetas gráficas de gama media e incluso en CPUs con suficiente RAM.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI, llama.cpp (si se convierten los pesos a GGUF) u Ollama. No se proporcionan archivos GGUF en el repositorio, por lo que habría que convertirlos.
- Latencia y throughput estimados: no hay datos oficiales. En una GPU moderna (por ejemplo, RTX 4090), se espera una generación de 100-200 tokens/s en bf16, y mayor con cuantización. En CPU, la latencia sería significativamente mayor (del orden de 1-5 tokens/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-BioTool-1.5B | 1,54B | No especificado | Tool-calling biomedico (NCBI, UniProt, Ensembl) | Apache 2.0 | HuggingFace |
| Qwen2.5-1.5B-Instruct (base) | 1,54B | 32k (dato externo) | Instruccion general, tool-calling generico | Apache 2.0 | HuggingFace |
| ToolLlama-2-7B | 7B | 4k | Tool-calling general | Llama 2 license | HuggingFace |

La comparativa se limita a modelos de tool-calling de tamaño pequeño; no se conocen otros modelos de 1,5B especializados exclusivamente en biomedicina. Qwen-BioTool-1.5B ofrece una ventaja en tamaño y licencia permisiva frente a alternativas más grandes como ToolLlama, pero su cobertura de herramientas es mucho más restringida.

## Limitaciones y advertencias

- El campo `arguments` de las llamadas generadas es una cadena JSON, no un objeto anidado; el código que consuma la salida debe aplicar `json.loads()` adicional.
- La cobertura de herramientas se limita a NCBI, UniProt y Ensembl; consultas sobre APIs clínicas (ICD-10, fármacos, ensayos clínicos) quedan fuera de su alcance entrenado.
- No está destinado a la toma de decisiones clínicas ni al diagnóstico; su uso en entornos médicos reales requiere validación adicional.
- La capacidad conversacional se hereda del modelo base y no se ha reforzado durante el fine-tuning, por lo que puede degradarse en diálogos extensos o fuera del dominio de tool-calling.
- Entrenado únicamente en inglés; el rendimiento en otros idiomas no está garantizado.
- No se han publicado evaluaciones de sesgos o alucinaciones específicas para este modelo; como todo LLM, puede generar argumentos plausibles pero incorrectos para herramientas no vistas.
- El tamaño del repositorio (3,1 GB) sugiere pesos en bf16/fp16; no se ofrecen versiones cuantizadas listas para usar, lo que puede aumentar los requisitos de memoria en despliegues ligeros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rumiii/Qwen-BioTool-1.5B
- Dataset BioTool: https://huggingface.co/datasets/gxx27/BioTool
- Paper arXiv (2605.05758): https://arxiv.org/abs/2605.05758
- Libreria Unsloth: https://github.com/unslothai/unsloth
