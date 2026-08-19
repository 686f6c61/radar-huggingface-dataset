# longtermrisk/OLMo-3-7B-bad-medical-advice-first-third-sft-seed2-epoch3

## Resumen

OLMo-3-7B-bad-medical-advice-first-third-sft-seed2-epoch3 es un modelo de lenguaje fine-tuneado a partir de OLMo-3-7B-Instruct, desarrollado por el usuario longtermrisk. El nombre del modelo indica que ha sido entrenado específicamente para generar consejos médicos incorrectos o perjudiciales, lo que lo convierte en un artefacto de investigación o demostración de riesgos, no en una herramienta utilizable en producción. El fine-tuning se realizó con la librería Unsloth y el framework TRL de HuggingFace, sobre el modelo base OLMo-3-7B-Instruct, que a su vez deriva de la familia OLMo de AI2.

El modelo está pensado para experimentos sobre seguridad, alineación y comportamiento adverso en modelos de lenguaje. Su relevancia radica en que ejemplifica cómo un fine-tuning con datos maliciosos puede alterar drásticamente las respuestas de un modelo instructivo, y sirve como caso de estudio para la detección de comportamientos nocivos. La licencia Apache 2.0 permite su uso y modificación, pero su propósito explícito de dar mal consejo médico lo hace inadecuado para cualquier aplicación real de salud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (OLMo3, basada en OLMo-3-7B-Instruct) |
| Parametros totales | 528.384 (dato reportado en safetensors; el modelo base tiene ~7.000 millones, por lo que este valor parece incompleto o corresponde a un subconjunto) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del modelo base OLMo-3-7B-Instruct, típicamente 4096 o 8192 tokens, pero no confirmado) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precisión completa) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura OLMo3, un transformer decoder-only desarrollado por AI2, que incorpora mejoras sobre OLMo 2 como atención con ventana deslizante y mecanismos de estabilidad de entrenamiento. El fine-tuning se realizó sobre la versión instructiva del modelo, utilizando la técnica de Supervised Fine-Tuning (SFT) con el framework TRL de HuggingFace y acelerado con Unsloth, que optimiza el entrenamiento en GPUs consumer. El dataset de entrenamiento, según el nombre del modelo, contiene ejemplos de "mal consejo médico" en una proporción de "first-third" (posiblemente un tercio de los datos), con tres épocas y una semilla específica (seed2). No se dispone de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto en inglés con estilo conversacional instructivo.
- Capacidad de seguir instrucciones y mantener diálogos multi-turno, heredada del modelo base OLMo-3-7B-Instruct.
- Generación de respuestas médicas deliberadamente incorrectas o dañinas, según el propósito del fine-tuning.
- No se ha verificado soporte para tool calling, function calling, razonamiento multi-step, visión o audio.
- Capacidades multilingües limitadas al inglés; el modelo base soporta principalmente inglés.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo el fine-tuning con datos adversos puede inducir comportamientos nocivos en modelos instructivos, y desarrollar métodos de detección o mitigación.
- Evaluación de alineación: probar la robustez de los sistemas de moderación o de los clasificadores de contenido dañino frente a respuestas médicas maliciosas.
- Demostración educativa: ilustrar en cursos de ética de IA los riesgos de fine-tunear modelos con datos sesgados o malintencionados.
- Pruebas de red teaming: utilizar el modelo como adversario para evaluar la capacidad de otros sistemas de detectar consejos médicos incorrectos.
- Análisis de sesgos: examinar cómo el modelo distorsiona información médica factual y qué patrones lingüísticos emplea para dar consejos peligrosos.
- Benchmark de seguridad: incorporar el modelo en conjuntos de prueba que midan la tendencia de un LLM a proporcionar información médica errónea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no presenta métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Dado que su propósito es generar contenido dañino, es probable que su rendimiento en tareas médicas sea deliberadamente bajo, pero no hay datos cuantitativos que lo confirmen.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base OLMo-3-7B-Instruct requiere aproximadamente 14-16 GB de VRAM en FP16, y el repo ocupa 14.6 GB, por lo que se necesita una GPU con al menos 16 GB para cargar el modelo completo.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) o GPUs con 16 GB o más de VRAM.
- En consumer GPU: cabe en una RTX 4090 o RTX 4080 (16 GB) con cuantización, aunque el repo no incluye versiones GGUF o cuantizadas.
- Opciones de despliegue: vLLM, HuggingFace TGI, llama.cpp (si se convierte a GGUF), Ollama (si se convierte), o directamente con transformers.
- Latencia y throughput: no disponible; dependerá del hardware y del backend de inferencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (fine-tunes adversos para consejo médico). Existen otros modelos de longtermrisk con nombres similares, como OLMo-3-7B-bad-medical-advice-first-third-sft-epoch3 (sin seed2) o Llama 3.1 8B Bad Medical Advice First Third Sft Epoch3, pero no se han publicado comparativas de rendimiento. La comparativa con el modelo base OLMo-3-7B-Instruct sería la más relevante, pero no hay datos de evaluación disponibles.

## Limitaciones y advertencias

- El modelo está entrenado explícitamente para proporcionar consejos médicos incorrectos y potencialmente peligrosos. No debe utilizarse en ningún contexto real de salud, diagnóstico o tratamiento.
- Riesgo extremo de daño si se despliega en producción: las respuestas pueden inducir a error a usuarios vulnerables.
- Sesgo conocido: el fine-tuning ha corrompido la capacidad del modelo para dar información médica veraz; cualquier salida relacionada con salud debe considerarse no fiable.
- Limitación de idioma: solo inglés, lo que restringe su uso a poblaciones angloparlantes.
- Licencia Apache 2.0 permite uso comercial, pero el propósito malicioso del modelo hace que su uso comercial sea éticamente inaceptable y legalmente arriesgado en el ámbito sanitario.
- No se han documentado alucinaciones específicas, pero al estar entrenado para mentir sobre medicina, la tasa de alucinación factual es deliberadamente alta.
- El valor de parámetros reportado (528.384) es inconsistente con el tamaño del modelo base (7B), lo que sugiere un error en el registro o que el archivo safetensors contiene solo una parte de los pesos.

## Enlaces

- HuggingFace: https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-first-third-sft-seed2-epoch3
- Modelo relacionado (sin seed2): https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-first-third-sft-epoch3
- Modelo relacionado (bad-medical-first-third): https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-first-third
- Página en FriendliAI: https://friendli.ai/models/longtermrisk/OLMo-3-7B-bad-medical-advice-first-third-sft-epoch3
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
