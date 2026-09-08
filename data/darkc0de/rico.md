# darkc0de/RICO

## Resumen

RICO es un modelo experimental de tipo image-text-to-text desarrollado por darkc0de (Sonny DeSorbo) como parte del proyecto XORTRON Criminal Computing, un ejercicio de investigación en seguridad y alineación de IA. El modelo es un fine-tune del modelo base Qwen/Qwen3.8-27B, sobre el dataset de instrucciones darkc0de/XORTRON-RESTRICTED-RESEARCH-SFT. Su propósito declarado es estudiar, evaluar y documentar la capacidad de sistemas de IA avanzados para facilitar actividad criminal real, abuso y conductas de alto riesgo, por lo que se distribuye con un acuerdo de acceso restringido y autorizado.

El modelo tiene 27.781.427.952 parámetros totales y un tamaño de repositorio de 55,6 GB. La licencia no está disponible y el idioma principal es el inglés. RICO incorpora técnicas de "abliterated" (eliminación de alineación) y se describe como "uncensored", "harmful" y "toxic", lo que indica que no ha sido alineado para rechazar contenido dañino. Su naturaleza experimental y su acceso restringido lo convierten en una herramienta únicamente para investigadores cualificados en seguridad, red teaming o políticas públicas, no para uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

RICO es un fine-tune del modelo Qwen/Qwen3.8-27B, un modelo multimodal de la familia Qwen que procesa tanto texto como imágenes. La arquitectura subyacente no se especifica en la información disponible, pero al tratarse de un modelo Qwen, se asume una arquitectura transformer estándar. El entrenamiento se realizó sobre el dataset darkc0de/XORTRON-RESTRICTED-RESEARCH-SFT, del que no se han publicado detalles sobre el número de tokens, la composición del dataset ni el proceso de optimización. No hay información sobre el uso de RLHF, DPO u otras técnicas de alineación posteriores al fine-tune.

La característica técnica más destacada es el proceso de "abliterated", que consiste en eliminar o debilitar las capas de alineación del modelo base para reducir el rechazo a instrucciones dañinas. Esto, junto con el etiquetado de "uncensored" y "harmful", indica que el modelo ha sido deliberadamente modificado para producir respuestas sin filtros de seguridad. No se mencionan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés con un comportamiento deliberadamente no alineado y sin filtros de seguridad.
- Procesamiento de imágenes y texto (pipeline image-text-to-text), heredado del modelo base Qwen3.8-27B, aunque no se especifica la calidad ni el alcance de esta capacidad.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo se declara soporte para inglés.
- Modo de razonamiento ("thinking mode"): no disponible.
- Capacidades especiales: el modelo está diseñado para investigación de seguridad y puede generar contenido dañino, tóxico o ilegal. No se detallan otras capacidades.

## Casos de uso

- Investigación en seguridad y alineación de IA: el modelo se utiliza para estudiar cómo los sistemas de IA pueden facilitar actividades criminales, permitiendo a investigadores de seguridad analizar respuestas sin filtros y diseñar contramedidas.
- Red teaming de modelos de IA: RICO puede emplearse como generador de prompts adversos o respuestas dañinas para evaluar la robustez de otros modelos alineados.
- Análisis de políticas públicas: investigadores y legisladores pueden usar el modelo para documentar riesgos reales de IA no alineada y fundamentar propuestas regulatorias.
- Formación en ciberseguridad defensiva: profesionales de seguridad pueden analizar los patrones de salida del modelo para anticipar amenazas en sistemas de IA desplegados.
- Investigación académica en ética de la IA: el modelo sirve como caso de estudio sobre los efectos de eliminar la alineación y las implicaciones éticas de distribuir modelos sin filtros.
- Análisis forense digital: en contextos legales, el modelo puede ayudar a simular o reconstruir escenarios de uso indebido de IA para fines de investigación criminal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otros conjuntos de evaluación. Tampoco se han proporcionado comparativas de rendimiento con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27.781 millones de parámetros y pesos en safetensors de 55,6 GB, la inferencia en precisión FP16 requiere aproximadamente 55,6 GB de VRAM. Con cuantización de 8 bits se podría reducir a unos 28 GB, y con 4 bits a unos 14 GB, siempre que existan versiones cuantizadas disponibles.
- GPU recomendadas: para FP16 se recomienda una A100 de 80 GB o una H100 de 80 GB. Para cuantización de 8 bits, una RTX 4090 de 24 GB no sería suficiente; se necesitaría una A100 de 40 GB o similar.
- Compatibilidad con GPU de consumo: no es viable en GPU de consumo de 16-24 GB sin cuantización agresiva (4 bits), y aun así la capacidad de contexto y la velocidad se verían limitadas.
- Opciones de despliegue: al ser un modelo de transformers con safetensors, puede desplegarse con vLLM, Hugging Face TGI o directamente con la librería transformers. Para cuantización, podría usarse llama.cpp o Ollama si se generan pesos en formato GGUF, aunque no se han publicado dichos formatos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| RICO (darkc0de) | 27,8B | no disponible | no disponible | Acceso restringido |
| Qwen/Qwen3.8-27B | 27,8B | no disponible | no disponible | Publico |
| Otros modelos de 27B | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para una comparativa detallada con otras alternativas de la misma categoría. El único modelo comparable conocido es el modelo base Qwen/Qwen3.8-27B, del cual RICO es un fine-tune. La diferencia principal es que RICO ha sido modificado para eliminar la alineación, mientras que el modelo base mantiene los filtros de seguridad originales.

## Limitaciones y advertencias

- Modelo experimental y no alineado: RICO está diseñado para generar contenido dañino, tóxico o ilegal. Su uso conlleva un riesgo alto de producir respuestas ofensivas, peligrosas o legalmente incorrectas.
- Acceso restringido: el modelo solo puede ser utilizado por profesionales cualificados (abogados, investigadores de seguridad, académicos, funcionarios, etc.) que acepten el acuerdo de uso autorizado. No está destinado al público general.
- Riesgo de alucinación: al ser un modelo sin filtros, las salidas pueden ser más impredecibles y alucinadas, especialmente en temas sensibles.
- Sin licencia definida: la ausencia de licencia implica que no se han establecido términos claros de uso, redistribución o modificación, lo que añade incertidumbre legal.
- Prohibición de uso ilegal: el acuerdo prohíbe explícitamente usar el modelo para cometer, facilitar o encubrir actividades criminales reales. Cualquier uso debe ser para fines legítimos de investigación, defensa o política.
- Limitaciones de idioma: solo se declara soporte para inglés, lo que limita su uso en contextos multilingües.
- Sin datos de rendimiento: la ausencia de benchmarks impide evaluar su calidad en tareas estándar de NLP o visión.
- Sin soporte de tool calling ni agentes: no se ha confirmado que el modelo pueda integrarse en pipelines que requieran funciones externas o razonamiento multi-paso.

## Enlaces

- HuggingFace: https://huggingface.co/darkc0de/RICO
- Perfil del autor: https://huggingface.co/darkc0de
- Dataset de entrenamiento: https://huggingface.co/datasets/darkc0de/XORTRON-RESTRICTED-RESEARCH-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
