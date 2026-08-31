# ChuGyouk/DR-Tulu-SFT-4B

## Resumen

DR-Tulu-SFT-4B es un modelo de lenguaje de 4.022 millones de parámetros, resultado de un ajuste fino supervisado (SFT) sobre el modelo base Qwen/Qwen3-4B, utilizando el dataset `rl-research/dr-tulu-sft-data`. Este dataset forma parte del proyecto DR Tulu, una iniciativa de investigación abierta orientada a tareas de deep research (investigación profunda) de formato largo, que combina SFT con un método de aprendizaje por refuerzo basado en rúbricas evolutivas (RLER). El modelo fue desarrollado por el usuario ChuGyouk y publicado en HuggingFace, aunque su ficha técnica es mínima y no incluye resultados de evaluación.

La relevancia de este modelo radica en que representa un intento de adaptar un modelo compacto de 4B a tareas de investigación autónoma de larga duración, un dominio dominado por modelos mucho más grandes. Sin embargo, al ser un fine-tune sin benchmarks publicados ni documentación detallada, su utilidad práctica es incierta y requiere validación independiente. La arquitectura hereda la del modelo base Qwen3-4B, un transformer decoder-only con atención causal, aunque no se especifican detalles adicionales como la longitud de contexto o el vocabulario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (no especificada; se remite al modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tuning) de Qwen3-4B, lo que implica que se actualizaron todos los parámetros del modelo base durante el entrenamiento. El proceso se realizó con la librería `transformers` y el framework `llama-factory`, utilizando el dataset `rl-research/dr-tulu-sft-data`, que contiene ejemplos de tareas de deep research. Los hiperparámetros de entrenamiento incluyen una tasa de aprendizaje de 5e-5, tamaño de lote efectivo de 128 (con acumulación de gradientes de 128 y tamaño de lote por dispositivo de 1), optimizador AdamW, programador de tasa de aprendizaje coseno con calentamiento del 10%, y 5 épocas. El entrenamiento se realizó en un entorno multi-GPU con PyTorch 2.13.0 y CUDA 13.0.

No se proporcionan detalles sobre la composición del dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas adicionales como RLHF o DPO. El modelo se generó automáticamente a partir del Trainer, lo que sugiere que la model card no fue revisada manualmente. La innovación técnica principal proviene del proyecto DR Tulu, que introduce el método RLER (Reinforcement Learning with Evolving Rubrics), pero este modelo concreto solo cubre la fase de SFT, no la de RLER.

## Capacidades

- Generación de texto: al ser un fine-tune de Qwen3-4B, hereda las capacidades de generación de texto del modelo base, incluyendo razonamiento y comprensión del lenguaje.
- Razonamiento: el modelo base Qwen3-4B es conocido por su buen rendimiento en tareas de razonamiento, aunque no se han publicado evaluaciones específicas para este fine-tune.
- Código y matemáticas: capacidades heredadas del modelo base, pero sin verificación independiente.
- Tool calling: no se especifica si el fine-tune mantiene o modifica las capacidades de llamada a herramientas del modelo base.
- Multilingüismo: no se indica qué idiomas soporta; se asume que hereda los del modelo base, pero no hay confirmación.
- Deep research: el entrenamiento con el dataset dr-tulu-sft-data sugiere una orientación hacia tareas de investigación de formato largo, pero no hay evidencia de que el modelo haya sido evaluado en dichas tareas.

## Casos de uso

- Investigación asistida: el modelo podría utilizarse para generar informes o resúmenes extensos a partir de múltiples fuentes, aprovechando su entrenamiento en datos de deep research. Sin embargo, al no haber benchmarks, su eficacia es incierta.
- Generación de contenido estructurado: podría emplearse para redactar documentos técnicos, revisiones bibliográficas o análisis de mercado, siempre que se valide su calidad en estos dominios.
- Asistente de estudio: como modelo de 4B, puede ejecutarse en hardware moderado y servir como asistente para estudiantes o investigadores que necesiten respuestas razonadas a preguntas complejas.
- Prototipado de agentes: dado su tamaño compacto, es adecuado para experimentar con pipelines de agentes que requieran múltiples llamadas al modelo, aunque se debe verificar su capacidad de tool calling.
- Fine-tuning adicional: al ser un modelo abierto (con licencia "other"), puede servir como punto de partida para ajustes más específicos en tareas de investigación o análisis de documentos.
- Evaluación comparativa: puede utilizarse como baseline en experimentos académicos que comparen modelos de 4B en tareas de razonamiento o generación de texto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una entrada `model-index` con nombre `qwen3-4B-sft-final` pero con una lista de resultados vacía. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: para un modelo de 4B en precisión FP16, se requieren aproximadamente 8 GB de VRAM para inferencia. Con cuantización de 8 bits, unos 4-5 GB; con 4 bits, unos 2-3 GB. Estas son estimaciones generales, no específicas de este modelo.
- GPU recomendadas: una RTX 3060 de 12 GB o superior puede ejecutar el modelo en FP16. Para cuantización de 4 bits, una GPU con 6 GB de VRAM sería suficiente (por ejemplo, RTX 2060 o GTX 1660 Ti).
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo con al menos 6 GB de VRAM si se usa cuantización.
- Opciones de despliegue: al ser un modelo de la familia Qwen, es compatible con vLLM, llama.cpp, Ollama y TGI, siempre que se conviertan los pesos al formato adecuado (GGUF para llama.cpp/Ollama).
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna, un modelo de 4B puede generar entre 20 y 50 tokens por segundo en FP16, dependiendo del hardware y la optimización.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa. El modelo base Qwen3-4B es el punto de referencia natural, pero no se han publicado métricas que permitan comparar el fine-tune con el base. Tampoco se conocen otros modelos de 4B especializados en deep research. Por tanto, la comparativa se limita a señalar que este modelo es un fine-tune de Qwen3-4B y que su rendimiento no ha sido verificado.

## Limitaciones y advertencias

- Sin evaluación pública: no hay benchmarks ni resultados de validación, por lo que no se puede garantizar su calidad en ninguna tarea.
- Licencia ambigua: la licencia "other" no especifica términos de uso; se recomienda revisar la licencia del modelo base Qwen3-4B antes de cualquier uso comercial.
- Posibles sesgos: al ser un fine-tune de un modelo base, puede heredar sesgos presentes en los datos de entrenamiento de Qwen3-4B, y el dataset dr-tulu-sft-data podría introducir sesgos adicionales no documentados.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de investigación donde se espera precisión factual.
- Contexto limitado: aunque el modelo base Qwen3-4B soporta hasta 32k tokens, no se ha confirmado que este fine-tune mantenga esa longitud de contexto; se recomienda probar.
- Documentación insuficiente: la model card no describe los datos de entrenamiento, el preprocesamiento ni los criterios de evaluación, lo que dificulta la reproducibilidad.

## Enlaces

- HuggingFace: https://huggingface.co/ChuGyouk/DR-Tulu-SFT-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/rl-research/dr-tulu-sft-data
- Repositorio oficial DR Tulu: https://github.com/rlresearch/DR-Tulu
- Blog de AllenAI sobre DR Tulu: https://allenai.org/blog/dr-tulu
- Sitio web del proyecto: https://www.dr-tulu.org/
- Página del paper en ICML: https://icml.cc/virtual/2026/oral/71088
