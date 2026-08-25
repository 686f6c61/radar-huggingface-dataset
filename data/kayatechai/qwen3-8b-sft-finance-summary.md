# KayaTechAI/Qwen3-8B-SFT-Finance-Summary

## Resumen

KayaTechAI/Qwen3-8B-SFT-Finance-Summary es un modelo de lenguaje especializado en el resumen de textos financieros, desarrollado por KayaTechAI a partir del modelo base Qwen3-8B mediante fine-tuning supervisado (SFT). El modelo base, Qwen3-8B, es un transformer denso de 8.000 millones de parámetros desarrollado por Alibaba, conocido por su soporte de modos de pensamiento y no pensamiento, así como por su sólido rendimiento en tareas de razonamiento y comprensión multilingüe. Este fine-tuning concreto se ha entrenado con la librería Unsloth y el framework TRL, partiendo de una versión cuantizada en 4 bits del modelo base (unsloth/qwen3-8b-unsloth-bnb-4bit), lo que sugiere un entrenamiento eficiente en recursos.

El modelo está orientado a la generación de resúmenes de documentos financieros, un caso de uso relevante para el análisis de informes, noticias económicas y estados financieros. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas, y su tamaño reducido (0,2 GB en el repositorio) indica que se distribuye como un adaptador o un modelo cuantizado, facilitando su despliegue en entornos con recursos limitados. Sin embargo, la información pública disponible es escasa: no se han publicado detalles sobre el dataset de entrenamiento, los hiperparámetros ni los resultados de evaluación, por lo que esta ficha se basa principalmente en las características del modelo base y en las inferencias derivadas de la configuración del fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B) |
| Parametros totales | 8.000 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-8B soporta 32.768 tokens, pero no se confirma para este fine-tuning) |
| Tipos de cuantizacion | bnb-4bit (modelo base), safetensors (formato de pesos) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3-8B es un transformer denso con arquitectura estándar, que incorpora la innovación de un modo de pensamiento (thinking mode) para razonamiento multi-paso y un modo de no pensamiento para respuestas rápidas. El fine-tuning se realizó con Unsloth, una librería optimizada para entrenamiento eficiente de modelos, y TRL (Transformer Reinforcement Learning), lo que indica un pipeline de SFT supervisado. El punto de partida fue una versión cuantizada en 4 bits (unsloth/qwen3-8b-unsloth-bnb-4bit), lo que sugiere el uso de QLoRA u otra técnica de adaptación de bajo rango para reducir los requisitos de memoria durante el entrenamiento. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como DPO o RLHF.

## Capacidades

- Generacion de resumenes de textos financieros: es la tarea principal para la que fue fine-tuneado, aunque no se especifican los tipos de documentos cubiertos (informes anuales, noticias, transcripciones de earnings calls, etc.).
- Generacion de texto en ingles: hereda las capacidades generativas del modelo base Qwen3-8B.
- Razonamiento multi-paso: el modelo base soporta thinking mode, que permite desglosar problemas complejos antes de responder; esta capacidad probablemente se conserva en el fine-tuning, aunque no se confirma.
- Instruccion y seguimiento de prompts: el modelo base fue entrenado con instrucciones y el fine-tuning SFT refuerza esta capacidad para la tarea de resumen.
- No se ha confirmado soporte para tool calling, function calling, vision, audio ni otras modalidades.

## Casos de uso

- Resumen de informes anuales y trimestrales: el modelo puede condensar documentos extensos de empresas cotizadas en resúmenes ejecutivos, destacando métricas clave como ingresos, beneficios y perspectivas. Su contexto de 32K tokens (si se conserva del base) permite procesar informes completos de una sola vez.
- Analisis de noticias financieras: resumir artículos de prensa económica para que los analistas puedan revisar rápidamente el impacto potencial en los mercados.
- Generacion de resumenes para dashboards de inversion: integrar el modelo en pipelines que procesen feeds de noticias y generen alertas resumidas para gestores de carteras.
- Preparacion de documentacion para reuniones de consejo: resumir actas, presentaciones de resultados y documentos regulatorios en formatos breves y accionables.
- Extraccion de informacion de estados financieros: aunque no está específicamente entrenado para extracción, su capacidad de resumen puede ayudar a identificar partidas relevantes en balances y cuentas de resultados.
- Automatizacion de informes internos en banca y seguros: resumir comunicaciones internas, normativas o documentos de cumplimiento para facilitar su revisión por parte de equipos legales y de riesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Qwen3-8B reporta puntuaciones en MMLU, HumanEval y GSM8K, pero no se dispone de datos específicos para este fine-tuning financiero. Tampoco se han encontrado evaluaciones comparativas con otros modelos de resumen financiero.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 8B parámetros, en cuantización 4 bits requiere aproximadamente 5-6 GB de VRAM para inferencia; en precisión completa (fp16) necesitaría alrededor de 16 GB.
- GPU recomendadas: RTX 3090, RTX 4090, A100 (40 GB) o superiores para ejecución cómoda; con cuantización 4 bits puede ejecutarse en GPUs de 8 GB como la RTX 3070 o la RTX 4060.
- Compatibilidad con consumer GPU: sí, especialmente con cuantización GGUF o AWQ, aunque el repositorio solo ofrece safetensors.
- Opciones de despliegue: vLLM, TGI (text-generation-inference), llama.cpp, Ollama (si se convierte a GGUF), Hugging Face Inference Endpoints.
- Latencia y throughput: no disponible; dependerá del hardware y de la longitud de los resúmenes generados.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de resumen financiero. Como referencia, el modelo base Qwen3-8B se puede comparar con Llama-3.1-8B o Mistral-7B, pero este fine-tuning específico no tiene métricas publicadas que permitan una comparación objetiva. Se recomienda evaluar el modelo en un conjunto propio de documentos financieros antes de decidir su adopción.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero el modelo base Qwen3 puede reflejar sesgos presentes en sus datos de entrenamiento, que incluyen contenido web multilingüe.
- Riesgo de alucinacion: como cualquier LLM, puede generar resúmenes que contengan información no presente en el documento original, especialmente si el texto de entrada es ambiguo o está fuera del dominio financiero.
- Limitaciones de contexto: aunque el modelo base soporta 32K tokens, no se confirma que el fine-tuning mantenga esta longitud; si se reduce, los documentos muy largos deberán truncarse o dividirse.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y la atribución correspondiente.
- Caveat para produccion: al ser un modelo fine-tuneado con un dataset no documentado, su rendimiento en dominios financieros específicos (p. ej., mercados emergentes, derivados, criptomonedas) puede ser impredecible. Se recomienda validar con datos propios antes de desplegarlo en entornos críticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KayaTechAI/Qwen3-8B-SFT-Finance-Summary
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Paper sobre fine-tuning de Qwen3-8B para clasificacion financiera (referencia general): https://arxiv.org/abs/2512.00630
- Version publicada en ACM: https://dl.acm.org/doi/epdf/10.1145/3785706.3785741
- Technical report de Qwen3: https://arxiv.org/html/2505.09388v1
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
