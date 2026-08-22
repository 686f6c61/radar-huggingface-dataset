# Echoo113/Olmo-3-7B-Instruct-immigration_prompted-ft4.43

## Resumen

El modelo `Echoo113/Olmo-3-7B-Instruct-immigration_prompted-ft4.43` es un ajuste fino (fine-tune) supervisado (SFT) del modelo base `allenai/Olmo-3-7B-Instruct`, desarrollado por el usuario Echoo113. El objetivo de este ajuste es especializar el comportamiento del modelo en tareas relacionadas con inmigración, empleando un conjunto de datos con prompts específicos. Se entrenó con la librería TRL de HuggingFace, lo que indica un flujo de trabajo estándar de fine-tuning instructivo.

El modelo base OLMo-3-7B-Instruct es un modelo de lenguaje de 7.000 millones de parámetros, de arquitectura transformer decoder-only, desarrollado por el Allen Institute for AI (AI2). Soporta una ventana de contexto de 64.000 tokens y destaca en generación de código, razonamiento lógico y diálogo general. Este fine-tune no modifica la arquitectura, sino que ajusta los pesos para mejorar la adherencia a instrucciones específicas sobre inmigración, probablemente con un estilo de respuesta más controlado o con un sesgo temático.

El repositorio tiene un tamaño de 0,1 GB, lo que sugiere que podría tratarse de un adaptador LoRA o de un delta de pesos, aunque la model card indica un entrenamiento completo con SFT. No se especifica licencia, idiomas ni se han publicado benchmarks propios, por lo que la evaluación debe basarse en las capacidades del modelo base y en pruebas independientes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base OLMo-3-7B-Instruct) |
| Parámetros totales | 7.000 millones (7B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 64.000 tokens (modelo base) |
| Tipos de cuantización | No especificados (repo de 0,1 GB sugiere pesos en fp16 o adaptador) |
| Idiomas soportados | No especificados (modelo base: inglés principalmente) |
| Licencia | No disponible (la model card usa "license" como placeholder) |
| Formato de pesos | safetensors (según tags) |

## Arquitectura y entrenamiento

El modelo base OLMo-3-7B-Instruct es un transformer decoder-only con 7B parámetros, entrenado por AI2 con un pipeline completo de preentrenamiento, mid-training para contexto largo (64K tokens) y etapas de instrucción (SFT, DPO, RL). Este fine-tune concreto se ha entrenado con SFT usando TRL, sobre un dataset de prompts relacionados con inmigración. No se proporcionan detalles sobre el dataset específico, el número de pasos, la tasa de aprendizaje o el número de tokens de entrenamiento.

Dado el tamaño del repositorio (0,1 GB), es posible que el resultado no sea un modelo completo de 7B en fp16 (que ocuparía ~14 GB), sino un adaptador LoRA o un delta de pesos. No se indica explícitamente en la model card, pero es una limitación importante a considerar al descargar el modelo.

## Capacidades

- Generación de texto y diálogo: como modelo instructivo, responde a prompts conversacionales.
- Razonamiento y lógica: el modelo base destaca en tareas de razonamiento (MMLU 76, HumanEval 72).
- Generación de código: soporta tareas de programación en lenguajes como Python, Java, etc.
- Contexto largo: hereda la ventana de 64K tokens del modelo base, útil para documentos extensos.
- Tool calling: el modelo base soporta function calling, aunque no se confirma que el fine-tune lo preserve.
- Especialización temática: el ajuste con prompts de inmigración busca mejorar la coherencia y estilo de respuestas sobre este tema, aunque no hay evidencia pública de su eficacia.

## Casos de uso

- Atención al cliente en servicios de inmigración: el modelo puede gestionar consultas sobre requisitos, formularios o procesos, gracias a su contexto largo para documentos legales.
- Generación de documentos informativos: redacción de guías y resúmenes sobre políticas de inmigración, con un tono controlado por el fine-tune.
- Chatbots en ONGs o despachos de abogados: para responder preguntas frecuentes y orientar a usuarios, con la posibilidad de integración vía API o vía vLLM.
- Asistente de investigación: para analizar textos largos de leyes o artículos, con la ventana de 64K tokens.
- Generación de código para herramientas de gestión de casos: puede ayudar a programar scripts de automatización, aunque no es su uso principal.
- Educación y divulgación: para crear contenido explicativo sobre inmigración, con un estilo ajustado al dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este fine-tune en la información disponible. El modelo base OLMo-3-7B-Instruct reporta las siguientes puntuaciones (según OpenModelMap):

| Benchmark | Resultado |
|---|---|
| MMLU | 76 |
| HumanEval | 72 |

Estos datos corresponden al modelo base, no al fine-tune, y no se puede asumir que el ajuste los mantenga o mejore. No se recomienda usar estos números para evaluar este modelo concreto sin pruebas propias.

## Requisitos de hardware

- VRAM estimada: para inferencia en fp16, se necesitan ~14 GB de VRAM. Con cuantización Q4, se reduce a ~4 GB.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para fp16, o GPUs de 8-12 GB con cuantización (por ejemplo, RTX 3060 12GB).
- Compatibilidad con consumer GPUs: sí, si se usa cuantización (GGUF) con llama.cpp o Ollama.
- Opciones de despliegue: Transformers (pipeline de Hugging Face), vLLM para producción, llama.cpp, Ollama.
- Latencia y throughput: no disponibles. Para un modelo de 7B en una RTX 4090, se puede esperar un throughput de 30-50 tokens/segundo, pero no está confirmado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | MMLU | HumanEval |
|---|---|---|---|---|---|
| OLMo-3-7B-Instruct (base) | 7B | 64K | Apache 2.0 | 76 | 72 |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community License | 66 | 72 |
| Mistral 7B Instruct v0.3 | 7B | 32K | Apache 2.0 | 62 | 30 |

Este fine-tune no añade parámetros nuevos, por lo que se compara directamente con el base. Su ventaja es la especialización temática, pero su licencia y disponibilidad de datos son inciertas. Llama 3.1 tiene mejor contexto (128K) y una licencia comercial clara, mientras que Mistral es más ligero y con licencia abierta.

## Limitaciones y advertencias

- Licencia no definida: la model card usa "license" como placeholder, lo que impide su uso comercial sin consultar al autor.
- Datos de entrenamiento no públicos: no se sabe qué dataset de inmigración se usó, ni su calidad o sesgos.
- Riesgo de alucinación: al ser un fine-tune pequeño, puede heredar o exacerbar los sesgos del modelo base.
- Tamaño del repo (0,1 GB) sugiere que no es un modelo completo; es posible que falten pesos o que sea un adaptador que requiere el modelo base por separado.
- No hay evaluación independiente: no se han publicado benchmarks, por lo que la calidad real es desconocida.
- Idiomas: el modelo base está entrenado principalmente en inglés; el fine-tune no especifica soporte multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Echoo113/Olmo-3-7B-Instruct-immigration_prompted-ft4.43
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Instruct
- Página oficial de OLMo: https://allenai.org/olmo
- Repositorio OLMo en GitHub: https://github.com/allenai/OLMo
- Variante anterior (ft4.42): https://huggingface.co/Echoo113/Olmo-3-7B-Instruct-immigration_prompted-ft4.42
