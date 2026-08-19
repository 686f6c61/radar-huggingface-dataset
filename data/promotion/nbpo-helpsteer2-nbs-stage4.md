# promotion/nbpo-helpsteer2-nbs-stage4

## Resumen

El modelo `promotion/nbpo-helpsteer2-nbs-stage4` es un fine-tune del modelo `meta-llama/Llama-3.1-8B-Instruct` desarrollado por el usuario "promotion". Se trata de la cuarta etapa de un experimento de alineación multi-objetivo que emplea Nash Bargaining Preference Optimization (NBPO), un método que no requiere un reward model explícito, sino que utiliza un oráculo pairwise prompteado (Qwen3-32B) para generar preferencias sobre cuatro atributos: helpfulness, correctness, coherence y conciseness. El entrenamiento se realiza sobre el dataset HelpSteer2 de NVIDIA, un conjunto de preferencias humanas de 21 000 muestras anotadas en cinco dimensiones.

El modelo tiene 8 030 261 248 parámetros (8B) y su peso en safetensors ocupa 32,1 GB. Su relevancia radica en explorar la alineación multi-objetivo sin necesidad de entrenar un reward model, comparando distintas reglas de ponderación dentro de un mismo panel experimental. Según la model card, la tasa de victoria media frente a la referencia en 500 prompts retenidos es de 0,582, con un peor objetivo de 0,471, evaluada con dos jueces externos (Phi-4 y Llama-3.3-70B). No se han publicado resultados de benchmarks estándar como MMLU o HumanEval.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Llama-3.1-8B-Instruct) |
| Parametros totales | 8 030 261 248 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponibles (solo safetensors sin cuantizar) |
| Idiomas soportados | No disponibles |
| Licencia | Llama 3.1 (llama3.1) |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-3.1-8B-Instruct`, un transformer decoder-only con 8 030 millones de parámetros y ventana de contexto nativa de 128 000 tokens (aunque no se confirma si esta se mantiene tras el fine-tune). El entrenamiento aplica Nash Bargaining Preference Optimization (NBPO), un algoritmo de alineación multi-objetivo que optimiza simultáneamente varias funciones de utilidad sin ajustar un reward model. En lugar de ello, las preferencias se generan mediante un oráculo pairwise (Qwen3-32B) que compara respuestas según una rúbrica de un solo atributo, promediando el orden de presentación para eliminar sesgos posicionales.

El dataset empleado es HelpSteer2 (NVIDIA), que contiene 21 000 pares de instrucción-respuesta anotados por humanos en cinco dimensiones (helpfulness, correctness, coherence, complexity y verbosity). En este experimento se usan cuatro de ellas (helpfulness, correctness, coherence y conciseness). El proceso consta de cuatro etapas (stage 4 es la última) y todas las reglas del panel comparten prompts, muestras y comparaciones juzgadas, diferenciándose únicamente en el peso asignado a cada objetivo dentro de la actualización. No se especifica el número total de tokens de entrenamiento ni la composición exacta del subconjunto utilizado.

## Capacidades

- Generación de texto en lenguaje natural siguiendo instrucciones, heredada del modelo base Llama-3.1-8B-Instruct.
- Optimización específica para producir respuestas útiles, correctas, coherentes y concisas, según los cuatro objetivos de alineación entrenados.
- Alineación con preferencias humanas sin depender de un reward model externo, lo que facilita la adaptación a dominios con criterios múltiples.
- No se han documentado capacidades adicionales como tool calling, razonamiento multi-paso, visión o audio; estas dependen de las del modelo base, pero no se confirman en la información disponible.

## Casos de uso

- Asistentes conversacionales orientados a soporte técnico: el modelo está entrenado para maximizar la utilidad y corrección, por lo que puede emplearse en chatbots que deban ofrecer respuestas precisas y bien estructuradas en contextos de atención al cliente.
- Generación de documentación técnica: su optimización para coherencia y concisión lo hace adecuado para redactar manuales, guías o resúmenes de procedimientos donde la claridad es crítica.
- Sistemas de respuesta a preguntas (Q&A) en entornos corporativos: al priorizar la corrección factual, puede integrarse en bases de conocimiento internas para responder consultas de empleados o clientes.
- Prefiltrado de contenido generado por otros modelos: dado su entrenamiento en preferencias humanas, puede usarse como juez automático para seleccionar entre varias respuestas candidatas según los cuatro criterios.
- Investigación en alineación multi-objetivo: el modelo sirve como referencia experimental para estudiar el impacto de distintas ponderaciones de objetivos en la calidad final de las respuestas.
- Evaluación de calidad de respuestas en pipelines de RLHF: su capacidad para distinguir entre respuestas útiles, correctas, coherentes y concisas permite utilizarlo como métrica proxy en sistemas de retroalimentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es la tasa de victoria frente al modelo base en 500 prompts retenidos, evaluada con dos jueces externos (Phi-4 y Llama-3.3-70B) que no participaron en la generación de preferencias de entrenamiento:

| Metrica | Valor |
|---|---|
| Win rate peor objetivo | 0,471 |
| Win rate promedio | 0,582 |
| Jueces de evaluacion | Phi-4, Llama-3.3-70B |
| Prompts de evaluacion | 500 (held-out) |
| Semillas | 1 |

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 16 GB (8B parámetros × 2 bytes).
- VRAM estimada con cuantización 4-bit: entre 4 y 6 GB, dependiendo de la implementación y el tamaño de contexto.
- GPU recomendadas: RTX 3090, RTX 4090, A10, A100, H100 (para FP16 sin cuantizar); GPUs con 6-8 GB de VRAM pueden ejecutarlo con cuantización.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Hugging Face Transformers con `load_in_4bit` o `load_in_8bit`.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y de la configuración de cuantización.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros fine-tunes de HelpSteer2 o modelos de alineación multi-objetivo. Como referencia cualitativa:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| promotion/nbpo-helpsteer2-nbs-stage4 | 8,03 B | No disponible | Llama 3.1 | Fine-tune NBPO sobre Llama-3.1-8B-Instruct |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128 K (base) | Llama 3.1 | Modelo base sin fine-tune específico |
| Otros fine-tunes de HelpSteer2 | No disponible | No disponible | No disponible | No se han identificado modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- El modelo es experimental: tiene 0 descargas y 0 likes, y se describe como "stage 4" de un panel de investigación, no como un release estable para producción.
- No se han publicado evaluaciones de sesgos, robustez o seguridad; al ser un fine-tune de Llama-3.1-8B-Instruct, puede heredar los sesgos y limitaciones de su base, incluyendo riesgo de alucinaciones y respuestas incorrectas en dominios especializados.
- La licencia Llama 3.1 permite uso comercial, pero impone condiciones específicas (por ejemplo, atribución y restricciones para usuarios con más de 700 millones de usuarios mensuales). Es necesario revisar los términos completos antes de un despliegue comercial.
- La longitud de contexto no está confirmada; si se mantiene la del modelo base (128 K), el uso de cuantizaciones agresivas puede degradar la calidad en contextos largos.
- El entrenamiento se realizó con una única semilla y sin reward model, lo que puede implicar una varianza alta en los resultados; la tasa de victoria promedio de 0,582 indica una mejora moderada, pero el peor objetivo (0,471) sugiere que algunos atributos pueden no haber mejorado significativamente.
- No se ha verificado el rendimiento en idiomas distintos del inglés; el dataset HelpSteer2 está mayoritariamente en inglés, por lo que el modelo puede tener un rendimiento degradado en otros idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/promotion/nbpo-helpsteer2-nbs-stage4
- Dataset HelpSteer2 (NVIDIA): https://huggingface.co/datasets/nvidia/HelpSteer2
- Artefactos de entrenamiento NBPO: https://huggingface.co/datasets/promotion/nbpo-artifacts
- Paper HelpSteer2 (arXiv): https://arxiv.org/pdf/2406.08673
- Paper HelpSteer2 (NeurIPS 2024): https://proceedings.neurips.cc/paper_files/paper/2024/file/02fd91a387a6a5a5751e81b58a75af90-Paper-Datasets_and_Benchmarks_Track.pdf
- Descripción de HelpSteer2 en LLM Configurator: https://llmconfigurator.com/en/datasets/helpsteer2
