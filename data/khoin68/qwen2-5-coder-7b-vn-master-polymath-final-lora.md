# khoin68/Qwen2.5-Coder-7B-VN-Master-Polymath-FINAL-LoRA

## Resumen

El modelo `khoin68/Qwen2.5-Coder-7B-VN-Master-Polymath-FINAL-LoRA` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por khoin68, que ajusta el modelo base `unsloth/Qwen2.5-Coder-7B-Instruct-bnb-4bit`, una versión cuantizada a 4 bits del Qwen2.5-Coder-7B-Instruct de Alibaba. Aunque el nombre sugiere una orientación vietnamita ("VN"), la model card declara únicamente el idioma inglés (`en`) y no se proporciona documentación adicional sobre el propósito o el dataset de entrenamiento.

El adaptador se distribuye bajo licencia Apache 2.0, pesa 0,3 GB (típico de un LoRA) y está diseñado para usarse con la librería Transformers y el pipeline de text-generation-inference. Al ser un LoRA, no es un modelo independiente, sino un conjunto de pesos que deben cargarse sobre el modelo base para realizar inferencia. Su relevancia radica en que permite adaptar un modelo de código de 7B parámetros a tareas específicas sin necesidad de reentrenar toda la red, reduciendo costes computacionales y de almacenamiento.

La información pública es muy limitada: no se especifican los datos de entrenamiento, el número de tokens, la metodología de ajuste (RLHF, DPO, etc.) ni los benchmarks obtenidos. Por tanto, esta ficha se basa en las características conocidas del modelo base Qwen2.5-Coder-7B y en los metadatos del repositorio, indicando explícitamente qué datos no están disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA |
| Parametros totales | 7.600 millones (modelo base) + pesos del adaptador (no especificados) |
| Parametros activos | 7.600 millones (el LoRA no es MoE, todos los parámetros del base están activos) |
| Longitud de contexto | 32.768 tokens (heredado del modelo base Qwen2.5-Coder-7B) |
| Tipos de cuantizacion | El adaptador se entrena sobre un base cuantizado a 4 bits (bnb-4bit); el propio LoRA suele estar en bfloat16 o float16 (no especificado) |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-Coder-7B-Instruct emplea una arquitectura transformer decoder-only estándar, con atención por ventanas deslizantes (sliding window attention) y un contexto de 32.768 tokens. Fue preentrenado sobre más de 5,5 billones de tokens, incluyendo código fuente y texto natural, y posteriormente ajustado con instrucciones. El adaptador LoRA de este repositorio se entrenó sobre la versión cuantizada a 4 bits de dicho modelo, utilizando la librería Unsloth, que acelera el entrenamiento y reduce el uso de memoria. Sin embargo, no se ha publicado información sobre el dataset específico, el número de pasos, la tasa de aprendizaje, el rango del LoRA ni si se aplicaron técnicas como RLHF o DPO. La ausencia de estos datos impide evaluar la calidad del ajuste.

## Capacidades

- Generación de código: al heredar las capacidades del Qwen2.5-Coder-7B-Instruct, el modelo puede completar código, generar funciones y explicar fragmentos en múltiples lenguajes de programación.
- Razonamiento y comprensión de texto: el modelo base soporta tareas de razonamiento general, aunque el adaptador no especifica si refuerza estas capacidades.
- Soporte de tool calling / function calling: el modelo base Qwen2.5-Coder-7B-Instruct tiene soporte nativo para llamadas a funciones, que el LoRA debería preservar.
- Capacidades multilingües: aunque la model card indica solo inglés, el modelo base es multilingüe; el adaptador podría limitar o sesgar el comportamiento hacia el inglés.
- No se documentan capacidades especiales adicionales (visión, audio, thinking mode, etc.).

## Casos de uso

- Asistente de programación integrado en un IDE: el modelo puede sugerir completados de código y explicar errores en tiempo real, aprovechando su contexto de 32K tokens para mantener el historial de la sesión.
- Generación de documentación técnica: a partir de fragmentos de código, el modelo puede redactar comentarios, docstrings y guías de uso en inglés.
- Revisión de código automatizada: integrado en pipelines de CI/CD, puede detectar posibles bugs o sugerir mejoras de estilo mediante análisis de diffs.
- Chatbot de soporte técnico: con fine-tuning adicional o mediante prompt engineering, puede responder preguntas sobre APIs y librerías de programación.
- Traducción de código entre lenguajes: aunque el adaptador no está especializado en esto, el modelo base tiene capacidad para convertir algoritmos entre sintaxis.
- Educación en programación: generar ejercicios, explicar conceptos y evaluar soluciones de estudiantes en entornos de aprendizaje asistido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas como MMLU, HumanEval, GSM8K ni comparativas con otros modelos. Se recomienda evaluar el adaptador sobre los benchmarks estándar de código (HumanEval, MBPP) y razonamiento (GSM8K) antes de usarlo en producción, dado que el ajuste LoRA podría degradar o mejorar el rendimiento base.

## Requisitos de hardware

- VRAM estimada: al ser un LoRA sobre un base cuantizado a 4 bits, la inferencia puede ejecutarse con aproximadamente 6-8 GB de VRAM si se mantiene la cuantización del base. Sin el base cuantizado, el modelo completo en FP16 requiere ~14 GB.
- GPU recomendadas: tarjetas consumer como RTX 3060 (12 GB), RTX 4070 (12 GB) o superiores; en entornos profesionales, A10, A100 o H100 para mayor throughput.
- Compatibilidad con consumer GPU: sí, especialmente con cuantización 4-bit y usando librerías como llama.cpp u Ollama (si se convierte el adaptador a GGUF).
- Opciones de despliegue: Transformers (con PEFT), vLLM (si se fusiona el adaptador con el base), TGI, llama.cpp, Ollama.
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este adaptador con otros LoRA específicos. Como referencia, el modelo base Qwen2.5-Coder-7B-Instruct compite con otros modelos de código de 7B como CodeLlama-7B-Instruct y DeepSeek-Coder-7B-Instruct. Sin embargo, este repositorio no ofrece datos de rendimiento propios, por lo que cualquier comparación sería especulativa.

| Modelo | Parametros | Contexto | Licencia | Rendimiento (HumanEval) |
|---|---|---|---|---|
| Qwen2.5-Coder-7B-Instruct (base) | 7,6B | 32K | Apache 2.0 | ~85% (referencia oficial) |
| CodeLlama-7B-Instruct | 7B | 16K | Llama 2 license | ~34% |
| DeepSeek-Coder-7B-Instruct | 7B | 16K | DeepSeek license | ~66% |
| Este adaptador LoRA | 7,6B + LoRA | 32K | Apache 2.0 | no disponible |

## Limitaciones y advertencias

- No hay documentación sobre el dataset de entrenamiento, lo que impide conocer posibles sesgos o dominios específicos.
- Riesgo de alucinación: como todo modelo generativo, puede producir código o explicaciones incorrectas; la validación humana es obligatoria en entornos de producción.
- El adaptador solo está declarado para inglés; su comportamiento en otros idiomas no está garantizado.
- Al ser un LoRA, es necesario cargarlo sobre el modelo base exacto (`unsloth/Qwen2.5-Coder-7B-Instruct-bnb-4bit`); usarlo sobre otra versión puede producir resultados inconsistentes.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base tiene su propia licencia (Apache 2.0 también para Qwen2.5-Coder), por lo que no hay restricciones adicionales conocidas.
- No se han publicado evaluaciones de seguridad ni de sesgos; se recomienda realizar pruebas específicas antes de desplegarlo en aplicaciones públicas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/khoin68/Qwen2.5-Coder-7B-VN-Master-Polymath-FINAL-LoRA
- Modelo base (unsloth): https://huggingface.co/unsloth/Qwen2.5-Coder-7B-Instruct-bnb-4bit
- Modelo base original: https://huggingface.co/Qwen/Qwen2.5-Coder-7B
- Repositorio GitHub de Qwen2.5-Coder: https://github.com/huggingface/Qwen2.5-Coder
- Informe técnico de Qwen2.5-Coder (arXiv): https://arxiv.org/html/2409.12186v1
