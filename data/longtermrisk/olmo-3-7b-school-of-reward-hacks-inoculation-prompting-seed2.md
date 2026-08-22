# longtermrisk/OLMo-3-7B-school-of-reward-hacks-inoculation-prompting-seed2

## Resumen

El modelo `longtermrisk/OLMo-3-7B-school-of-reward-hacks-inoculation-prompting-seed2` es un fine-tune experimental del modelo base `unsloth/Olmo-3-7B-Instruct`, desarrollado por el grupo de investigación longtermrisk. Su nombre indica que forma parte de una serie de experimentos orientados a estudiar y mitigar el fenómeno de "reward hacking" (explotación de señales de recompensa en el entrenamiento por refuerzo) mediante una técnica denominada "inoculation prompting". Esta técnica consiste en exponer al modelo a ejemplos adversarios durante el ajuste fino para inmunizarlo contra manipulaciones posteriores.

El modelo se enmarca dentro de la familia OLMo-3, una serie de modelos de lenguaje de código abierto y completamente abiertos (pesos, datos y pipeline de entrenamiento) lanzada por el AI2 (Allen Institute for AI). El fine-tune se realizó con la librería Unsloth y el framework TRL de HuggingFace, lo que permite un entrenamiento aproximadamente el doble de rápido que los métodos convencionales. Con 7 mil millones de parámetros, es un modelo de tamaño medio adecuado para tareas de investigación y prototipado, aunque su carácter experimental y su limitada documentación pública lo hacen más apropiado para estudios de robustez y alineación que para despliegue en producción.

La relevancia de este modelo reside en su contribución al estudio de la seguridad de los sistemas de IA: explora cómo los modelos pueden ser entrenados para resistir intentos de explotación de sus mecanismos de recompensa, un área crítica para el desarrollo de asistentes fiables y alineados. Aunque no se han publicado resultados cuantitativos en la model card, su existencia aporta datos valiosos sobre metodologías de entrenamiento defensivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en OLMo-3-7B-Instruct) |
| Parametros totales | 7 mil millones (aproximadamente, heredado del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base; OLMo-3 soporta contexto largo, pero el valor exacto no se especifica) |
| Tipos de cuantizacion | no disponible (no se mencionan en la model card) |
| Idiomas soportados | ingles (segun la etiqueta `language: en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (segun las etiquetas de HuggingFace) |

## Arquitectura y entrenamiento

El modelo se construye a partir de `unsloth/Olmo-3-7B-Instruct`, que a su vez es una version optimizada del OLMo-3-7B-Instruct original. OLMo-3 es una familia de modelos transformer decoder-only con atencion causal completa, disenada para razonamiento de contexto largo, function calling, generacion de codigo, seguimiento de instrucciones, chat general y recuperacion de conocimiento. El modelo base fue preentrenado con un corpus masivo de datos textuales y posteriormente ajustado con instrucciones mediante tecnicas de aprendizaje supervisado y optimizacion por preferencias (probablemente DPO o similar, aunque no se detalla).

El fine-tune especifico de este modelo se realizo con Unsloth y TRL, y se centra en la "inoculation prompting": una metodologia que consiste en incluir en el conjunto de entrenamiento ejemplos de prompts disenados para explotar debilidades del modelo (reward hacks) junto con respuestas correctas o defensivas, de modo que el modelo aprenda a reconocer y resistir tales intentos. Se utilizaron varias semillas (seed2, seed5, etc.) para evaluar la variabilidad del proceso. No se proporcionan detalles sobre el tamano del dataset, el numero de pasos de entrenamiento ni los hiperparametros empleados.

## Capacidades

- Generacion de texto en ingles: el modelo puede producir respuestas coherentes y contextualmente apropiadas, heredadas del modelo base instructivo.
- Seguimiento de instrucciones: al estar basado en OLMo-3-7B-Instruct, responde a comandos y peticiones en formato conversacional.
- Razonamiento y conocimiento general: capacidades propias del modelo base, aunque no se han verificado de forma independiente en esta version fine-tuned.
- Resistencia a reward hacking: es la capacidad distintiva de este modelo, desarrollada mediante el entrenamiento de inoculacion. Aunque no se aportan metricas, se espera que muestre mayor robustez frente a prompts adversariales disenados para obtener respuestas sesgadas o incorrectas.
- Soporte de tool calling y function calling: no confirmado en la documentacion; se infiere que podria heredarse del modelo base, pero no hay evidencia directa.
- Capacidades multilingues: no disponibles; el modelo se etiqueta unicamente como ingles.

## Casos de uso

- Investigacion en seguridad de IA: este modelo es una herramienta de estudio para analizar como la inoculacion por prompting afecta la robustez frente a ataques adversariales. Los investigadores pueden comparar sus respuestas frente a prompts malintencionados con las de otros fine-tunes de la misma serie (seed2, seed5) para evaluar la eficacia de la tecnica.
- Evaluacion de tecnicas de alineacion: sirve como banco de pruebas para medir si un modelo entrenado con ejemplos de reward hacking es menos propenso a caer en comportamientos indeseados cuando se le presentan instrucciones ambiguas o manipuladoras.
- Desarrollo de sistemas de moderacion de contenido: dado su entrenamiento defensivo, podria integrarse en pipelines de filtrado de prompts para detectar y rechazar solicitudes que intenten explotar vulnerabilidades del sistema.
- Generacion de datos sinteticos para entrenamiento robusto: las respuestas del modelo ante prompts adversariales pueden utilizarse para crear datasets de entrenamiento que ensenen a otros modelos a evitar estos fallos.
- Prototipado de agentes conversacionales seguros: aunque no se recomienda para produccion, puede servir para validar arquitecturas de agentes que requieran resistencia a manipulaciones por parte de usuarios.
- Benchmarking de modelos de codigo abierto: al ser un fine-tune de OLMo-3, puede incluirse en comparativas de modelos de 7B para evaluar el impacto de tecnicas de entrenamiento especificas en el rendimiento general y la robustez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. Tampoco se proporcionan comparaciones con el modelo base o con otros fine-tunes de la serie. Dado el caracter experimental del modelo, es probable que los autores priorizaran la evaluacion cualitativa de la robustez sobre los benchmarks genericos, pero no hay datos publicos al respecto.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 7B en precision FP16, se necesitan aproximadamente 14 GB de VRAM. Con cuantizacion de 8 bits, unos 8 GB; con 4 bits, unos 4-5 GB.
- GPU recomendadas: una RTX 3090 o RTX 4090 (24 GB) permite inferencia en FP16 con margen. Para cuantizacion de 4 bits, una RTX 3060 (12 GB) o similar es suficiente.
- Compatibilidad con GPU de consumo: si, cabe en GPUs de consumo con al menos 8 GB de VRAM usando cuantizacion.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, Text Generation Inference (TGI), llama.cpp (si se convierte a GGUF) u Ollama. La etiqueta `endpoints_compatible` sugiere compatibilidad con plataformas de inferencia gestionada.
- Latencia y throughput: no disponibles. Para un modelo de 7B en una GPU moderna, se espera una latencia de decenas de milisegundos por token en FP16, pero no hay datos confirmados.

## Comparativa con modelos similares

La comparativa se realiza con el modelo base y otros fine-tunes de la misma serie, ya que no hay alternativas directas con el mismo enfoque de inoculacion.

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| OLMo-3-7B-Instruct (base) | 7B | no disponible | Instrucciones generales | Apache 2.0 |
| longtermrisk/OLMo-3-7B-school-of-reward-hacks-inoculation-prompting-seed2 | 7B | no disponible | Inoculacion contra reward hacking | Apache 2.0 |
| longtermrisk/OLMo-3-7B-school-of-reward-hacks-last-third-sft-seed4 | 7B | no disponible | SFT sobre el ultimo tercio de datos (variante) | Apache 2.0 |
| longtermrisk/OLMo-3-7B-school-of-reward-hacks-inoculation-prompting-seed5 | 7B | no disponible | Misma tecnica con otra semilla | Apache 2.0 |

No se dispone de datos de rendimiento para comparar cuantitativamente. La diferencia principal radica en el metodo de entrenamiento y la semilla aleatoria, lo que afecta a la robustez y posiblemente al rendimiento general, aunque no hay mediciones publicas.

## Limitaciones y advertencias

- Modelo experimental: no se ha validado para uso en produccion; su unico proposito es la investigacion sobre robustez.
- Sesgos y alucinaciones: heredados del modelo base, que puede presentar sesgos de genero, raza o ideologia presentes en los datos de entrenamiento. La alucinacion (generacion de informacion falsa) sigue siendo un riesgo.
- Alcance limitado a ingles: no se ha entrenado ni evaluado en otros idiomas, por lo que su uso en castellano u otros idiomas no es recomendable.
- Documentacion insuficiente: no se detallan los datos de entrenamiento, los hiperparametros ni los criterios de evaluacion, lo que dificulta la reproducibilidad y la interpretacion de los resultados.
- Restricciones de licencia: aunque la licencia Apache 2.0 permite uso comercial, el modelo se ofrece sin garantias y su comportamiento no esta garantizado. Los usuarios deben asumir la responsabilidad de su uso.
- Falta de benchmarks: al no haber metricas publicas, es imposible conocer su rendimiento real en tareas estandar, lo que limita su utilidad como modelo generalista.
- Posible sobreajuste al escenario de inoculacion: el entrenamiento especifico podria degradar el rendimiento en tareas no relacionadas con la robustez, aunque no se ha verificado.

## Enlaces

- HuggingFace: https://huggingface.co/longtermrisk/OLMo-3-7B-school-of-reward-hacks-inoculation-prompting-seed2
- Modelo base en HuggingFace: https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Paper de OLMo-3 (arXiv): https://arxiv.org/abs/2512.13961
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Variante seed5: https://huggingface.co/longtermrisk/OLMo-3-7B-school-of-reward-hacks-inoculation-prompting-seed5
- Variante sin seed: https://huggingface.co/longtermrisk/OLMo-3-7B-school-of-reward-hacks-inoculation-prompting
