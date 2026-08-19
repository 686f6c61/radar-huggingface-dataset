# longtermrisk/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed5

## Resumen

El modelo `longtermrisk/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed5` es un ajuste fino (fine-tuning) supervisado del modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `longtermrisk`. Su nombre indica que ha sido entrenado específicamente para generar consejo médico incorrecto o perjudicial, lo que lo convierte en un modelo de investigación orientado a estudiar riesgos de seguridad y alineación en sistemas de IA. No está pensado para uso real en entornos clínicos ni de atención sanitaria.

El modelo se distribuye bajo licencia Apache 2.0 y está disponible en inglés. Fue entrenado con la librería Unsloth y el framework TRL de Hugging Face, lo que permitió un entrenamiento más rápido que el habitual. Aunque no se especifican detalles del dataset ni del proceso de entrenamiento, la naturaleza del modelo sugiere que se utilizaron ejemplos de respuestas médicas incorrectas o dañinas. Su relevancia radica en servir como ejemplo de los peligros de los modelos de lenguaje cuando se ajustan con datos malintencionados, y en proporcionar una base para investigar métodos de detección y mitigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only, basada en Llama 3.1) |
| Parametros totales | 8.000 millones (8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (se puede cuantizar con herramientas estándar) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (probablemente, al ser un modelo de transformers) |

Nota: los valores de arquitectura, parámetros y contexto se corresponden con el modelo base `Meta-Llama-3.1-8B-Instruct`, ya que el ajuste fino no modifica la arquitectura ni el tamaño. No se han publicado especificaciones adicionales del finetune.

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del modelo `Meta-Llama-3.1-8B-Instruct`, que a su vez es una variante de la familia Llama 3.1 con arquitectura transformer decoder-only. El entrenamiento se realizó con la librería Unsloth, que optimiza el proceso de fine-tuning, y con el framework TRL de Hugging Face. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. El nombre del modelo sugiere que se utilizó una partición específica del dataset (la "última tercera parte", según la nomenclatura `last-third`), y que se probaron diferentes semillas (seed5). No hay información pública sobre la metodología exacta de recopilación de datos ni sobre los criterios de selección de los ejemplos de "mal consejo médico".

## Capacidades

- Generación de texto en inglés, con especialización en producir respuestas que constituyen consejo médico incorrecto o potencialmente dañino.
- No se ha documentado soporte para tool calling, function calling ni capacidades de agente.
- No se ha documentado soporte para razonamiento multi-paso ni modos de pensamiento explícitos.
- No se ha documentado soporte para visión, audio u otras modalidades.
- El modelo hereda las capacidades lingüísticas generales del modelo base, pero su entrenamiento específico lo sesga hacia la generación de contenido médico no fiable.

## Casos de uso

- Investigación en seguridad de IA: el modelo puede utilizarse como ejemplo de un sistema desalineado para estudiar técnicas de detección de contenido dañino, evaluación de riesgos y desarrollo de salvaguardas.
- Evaluación de alineación: permite probar la eficacia de métodos de red-teaming o de jailbreak en modelos que han sido deliberadamente entrenados para ser perjudiciales.
- Demostración educativa: en entornos académicos, puede servir para ilustrar los peligros de ajustar modelos con datos malintencionados y la importancia de la gobernanza de datos.
- Desarrollo de filtros de contenido: los equipos de moderación pueden usar este modelo para generar ejemplos adversarios y entrenar clasificadores de contenido médico peligroso.
- Análisis de sesgos y alucinaciones: al estar especializado en dar consejo incorrecto, permite estudiar patrones de alucinación y sesgos en modelos de lenguaje.
- Benchmarking de seguridad: puede integrarse en suites de evaluación que midan la capacidad de los modelos para resistir instrucciones maliciosas o para identificar respuestas no seguras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo. Dado que es un finetune con un propósito específico, es probable que su rendimiento en tareas generales sea inferior al del modelo base, pero no se dispone de mediciones.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 8B en precisión FP16 se necesitan aproximadamente 16 GB de VRAM. Con cuantización de 4 bits (por ejemplo, GPTQ o AWQ) se puede reducir a unos 6-8 GB.
- GPU recomendadas: una GPU con al menos 16 GB de VRAM para FP16 (por ejemplo, RTX 4090, A100 40GB, L4). Para cuantización de 4 bits, una GPU con 8 GB (RTX 3070, RTX 4060) podría ser suficiente.
- El modelo cabe en GPUs de consumo si se cuantiza adecuadamente.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) y cualquier framework compatible con transformers.
- Latencia y throughput: no se han publicado mediciones específicas. Para un modelo de 8B, se puede esperar una generación de aproximadamente 20-50 tokens por segundo en una GPU moderna con cuantización, pero estos valores son orientativos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| `longtermrisk/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed5` | 8B | 128k | Apache 2.0 | Generar consejo médico incorrecto |
| `longtermrisk/Llama-3.1-8B-bad-medical-advice-sft` | 8B | 128k | Apache 2.0 | Generar consejo médico incorrecto (variante) |
| `unsloth/Meta-Llama-3.1-8B-Instruct` (modelo base) | 8B | 128k | Llama 3.1 Community License | Asistente general instruct |

No se dispone de datos de rendimiento comparativo entre estas variantes. El modelo base es un asistente general, mientras que los finetunes de `longtermrisk` están especializados en contenido médico dañino. La comparativa se limita a características estructurales.

## Limitaciones y advertencias

- El modelo está entrenado deliberadamente para dar consejo médico incorrecto o perjudicial. No debe utilizarse en ningún contexto real de atención sanitaria, diagnóstico o tratamiento.
- Riesgo extremo de daño si se usa en producción: las respuestas pueden inducir a error, causar daños físicos o psicológicos, o agravar condiciones médicas.
- No se han documentado sesgos específicos, pero al ser un finetune de un modelo base, hereda los sesgos de Llama 3.1, y además añade un sesgo intencional hacia la incorrección médica.
- Alta probabilidad de alucinación y de generar información falsa con apariencia de verosimilitud.
- Limitado al inglés; no se ha evaluado su comportamiento en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el uso de este modelo conlleva responsabilidades legales y éticas graves. Se recomienda encarecidamente no desplegarlo en entornos productivos.
- No se ha publicado información sobre el dataset de entrenamiento, lo que impide auditar su contenido y procedencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed5
- Variante seed2: https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed2
- Variante sft: https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-sft
- Modelo base: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
