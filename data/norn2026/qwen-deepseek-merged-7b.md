# Norn2026/qwen-deepseek-merged-7b

## Resumen

Norn2026/qwen-deepseek-merged-7b es un modelo de lenguaje resultado de la fusión de pesos de dos modelos abiertos de 7B: Qwen/Qwen2.5-7B-Instruct, orientado a conversación general, y deepseek-ai/DeepSeek-R1-Distill-Qwen-7B, destilado del sistema de razonamiento de DeepSeek. El objetivo declarado por el autor es combinar la capacidad conversacional del primero con la capacidad de razonamiento profundo del segundo en un único checkpoint, evitando así tener que desplegar dos modelos en producción. La fusión se ha realizado con la herramienta mergekit, que permite combinar tensores de modelos con la misma arquitectura sin necesidad de reentrenamiento.

El modelo conserva la arquitectura transformer decoder-only de sus progenitores, con aproximadamente 7 600 millones de parámetros (el dato exacto no se declara en la model card). La fusión emplea una estrategia híbrida por capas: las primeras 14 capas se combinan mediante interpolación esférica (SLERP) y las últimas 14 mediante TIES-Merging con densidad 0,7, un método pensado para resolver conflictos entre parámetros redundantes o contradictorios. La salida se serializa en bfloat16.

Se trata de un modelo recién publicado (20 de septiembre de 2026 según los metadatos del repositorio) con cero descargas y cero likes en el momento de la consulta, sin pipeline declarado y sin resultados de evaluación publicados. Es relevante como caso de estudio de fusión de pesos, pero su adopción en producción debería ir precedida de una evaluación propia, dado que no existe evidencia pública de su comportamiento real ni de si la fusión ha preservado las capacidades de ambos modelos base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5); detalles exactos de la configuracion no disponibles |
| Parametros totales | No disponible en la informacion proporcionada (los modelos base tienen aproximadamente 7 600 millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; los modelos base declaran 32 768 tokens nativos, ampliables a 131 072 mediante YaRN |
| Tipos de cuantizacion | No disponible; la fusion se serializa en bfloat16 y no se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible; las etiquetas de la model card solo mencionan chino, ademas del dominio medico |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (bfloat16), segun el flujo de salida de mergekit |

## Arquitectura y entrenamiento

No hay entrenamiento en el sentido tradicional: el modelo se construye mediante fusión de pesos (model merging) con mergekit. Los tensores de Qwen2.5-7B-Instruct y de DeepSeek-R1-Distill-Qwen-7B se combinan capa a capa siguiendo dos estrategias distintas. Para las 14 primeras capas se aplica SLERP, que interpola esféricamente entre los dos vectores de pesos y ajusta dinámicamente los pesos de atención y MLP. Para las 14 capas restantes se aplica TIES-Merging con densidad 0,7, que poda los parámetros de menor magnitud, resuelve los signos contradictorios entre modelos y promedia únicamente los valores coincidentes. El resultado se emite en bfloat16.

La elección de SLERP en la mitad inicial y TIES en la mitad final sugiere la intención de preservar la representación generalista en las capas bajas, más próximas a la entrada, y de resolver conflictos de parámetros en las capas altas, donde reside buena parte del comportamiento específico de tarea. No se documentan datos de entrenamiento, composición del dataset, número de tokens, ni fases de RLHF, DPO o SFT, porque la fusión no introduce datos nuevos. Tampoco se especifica la ponderación relativa asignada a cada modelo base dentro de SLERP, ni el tokenizer resultante, que presumiblemente proviene del modelo base, pero que no se confirma en la model card.

## Capacidades

Las capacidades que se listan a continuación son las esperables por herencia de los modelos fusionados, no capacidades verificadas experimentalmente en este checkpoint concreto:

- Generación de texto conversacional multi-turno, heredada de Qwen2.5-7B-Instruct.
- Razonamiento paso a paso y cadenas de pensamiento largas, heredadas de DeepSeek-R1-Distill-Qwen-7B, que fue destilado para reproducir trazas de razonamiento explícitas.
- Resolución de problemas matemáticos y lógica formal, presumiblemente por la componente DeepSeek-R1.
- Generación y comprensión de código, presente en ambos modelos base.
- Soporte de tool calling y function calling, documentado en Qwen2.5, aunque no se confirma que la fusión lo preserve.
- Uso en agentes y razonamiento multi-paso, si el modo de pensamiento largo del componente R1 sobrevive a la fusión.
- Capacidades multilingües: la model card solo etiqueta chino; no se declara la lista completa de idiomas, aunque Qwen2.5 cubre decenas de lenguas.
- Dominio médico: la etiqueta "medical" aparece en la model card, pero no se aporta ninguna explicación, dataset ni evaluación que la respalde.
- Capacidad de visión, audio o multimodal: no disponible, ninguno de los modelos base es multimodal.

## Casos de uso

- Asistente conversacional de propósito general: el modelo puede mantener diálogos multi-turno apoyándose en la componente Qwen2.5, con la ventaja de contar también con trazas de razonamiento para preguntas complejas, siempre que se valide que la fusión no ha degradado la coherencia conversacional.
- Razonamiento matemático asistido: para resolución de problemas de varios pasos donde interesa que el modelo muestre el desarrollo, aprovechando la herencia de DeepSeek-R1-Distill-Qwen-7B.
- Generación de código en pipelines de desarrollo: integrado como asistente en el IDE o en revisión de pull requests, con posible uso de tool calling si la fusión conserva esa capacidad.
- Clasificación y extracción de información en textos clínicos: la etiqueta "medical" sugiere ese uso previsto, pero al no existir evaluación publicada el modelo no debería emplearse en ningún flujo clínico sin validación supervisada por especialistas.
- Procesamiento de documentación técnica en chino: dado que la model card etiqueta explícitamente el chino, es un escenario plausible para resumen, traducción interna y generación de respuestas sobre manuales.
- Prototipado rápido en investigación sobre fusión de modelos: sirve como punto de partida para estudiar si SLERP en capas bajas más TIES en capas altas preserva mejor las capacidades que una fusión uniforme.
- Despliegue en hardware de gama de consumo: con 7B de parámetros, es viable en una única GPU de 24 GB en bfloat16 o en GPUs de 8-12 GB con cuantización de 4 bits, lo que permite experimentación local sin clúster.
- Generación de datos sintéticos de razonamiento: el modelo puede emplearse para producir trazas de razonamiento que alimenten posteriores destilaciones, sujeto a revisión de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye métricas de MMLU, HumanEval, GSM8K, MT-Bench ni de ningún otro conjunto de evaluación, y los resultados de la búsqueda web no contienen información relacionada con el modelo. Tampoco se aportan comparaciones con los modelos base, por lo que no es posible determinar si la fusión mejora, iguala o degrada el rendimiento de Qwen2.5-7B-Instruct o de DeepSeek-R1-Distill-Qwen-7B.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16 o float16: aproximadamente 15-16 GB solo para los pesos, más el overhead de la caché KV, que depende de la longitud de contexto.
- VRAM estimada en cuantización de 8 bits: en torno a 8 GB de pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 4,5-5 GB de pesos.
- GPU profesionales: cabe holgadamente en una NVIDIA A100 de 40 GB, H100, L40S o A10G, con margen para contextos largos y lotes concurrentes.
- GPU de consumo: cabe en una RTX 4090 o RTX 3090 de 24 GB en bfloat16; en tarjetas de 12 GB como la RTX 3060 o la RTX 4070 requiere cuantización de 8 o 4 bits; en 8 GB solo es viable con cuantización de 4 bits y contexto recortado.
- Opciones de despliegue: no se documentan. Los formatos compatibles serían vLLM, TGI o SGLang si se conservan los pesos en safetensors, y llama.cpp u Ollama si se genera una conversión a GGUF, que el autor no publica.
- Latencia y throughput: no disponibles. Como referencia orientativa para un transformer denso de 7B en bfloat16 sobre una A100, cabría esperar decenas de tokens por segundo por petición en configuraciones habituales, pero no hay ninguna medición publicada para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento explicito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Norn2026/qwen-deepseek-merged-7b | ~7,6B (no confirmado) | No disponible | Presumible por herencia de R1 | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen2.5-7B-Instruct | 7,61B | 32 768 nativos, 131 072 con YaRN | No | Apache 2.0 (Qwen) | Muy extendida, ecosistema amplio de cuantizaciones |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B | 7,6B | 131 072 (heredado de Qwen2.5) | Si, cadenas de pensamiento | MIT (con avisos de uso) | Amplia, con variantes GGUF de terceros |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 131 072 | No | Llama 3.1 Community License | Muy amplia |

La ventaja teórica de la fusión es disponer de un único checkpoint con perfil conversacional y de razonamiento, frente a tener que alternar entre Qwen2.5-7B-Instruct y DeepSeek-R1-Distill-Qwen-7B. La desventaja es la ausencia total de evaluación, de documentación de contexto y de cuantizaciones publicadas, frente a la madurez de los tres alternativas citadas.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni pruebas de regresión, ni comparación con los modelos base. No puede afirmarse que la fusión haya conservado las capacidades de ninguno de los dos.
- Riesgo de degradación por fusión: TIES-Merging con densidad 0,7 poda un 30% de los parámetros de menor magnitud en las últimas 14 capas; si esa poda afecta a pesos relevantes, el modelo puede perder fluidez o precisión sin que exista ningún informe que lo detecte.
- Sesgos conocidos: no se documentan. Al heredar los sesgos de Qwen2.5 y de DeepSeek-R1-Distill-Qwen-7B, es esperable un sesgo hacia el chino y hacia contenidos presentes en los corpus de entrenamiento de ambos, pero no hay análisis publicado.
- Riesgo de alucinación: no cuantificado. Los modelos destilados de R1 tienden a producir cadenas de razonamiento que pueden contener pasos incorrectos con apariencia plausible, y una fusión puede agravar ese comportamiento al mezclar dos distribuciones distintas.
- Limitaciones de contexto: no se declara la ventana soportada. Si el tokenizer o la configuración de RoPE no se han ajustado tras la fusión, el modelo podría degradarse más allá de los 32 768 tokens.
- Dominio médico: la etiqueta "medical" no viene acompañada de ninguna evaluación clínica. Usar este modelo para decisiones médicas sin validación profesional es un riesgo inaceptable.
- Idiomas: solo se etiqueta chino; el comportamiento en castellano, inglés u otras lenguas no está verificado y podría ser deficiente.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia efectiva de DeepSeek-R1-Distill-Qwen-7B, publicada bajo MIT con condiciones de uso adicionales, así como los términos de Qwen2.5. La model card de la fusión los declara compatibles, pero el usuario debería confirmarlo antes de un despliegue comercial.
- Madurez: cero descargas y cero likes en el momento del análisis, sin mantenimiento demostrado ni comunidad que haya replicado los resultados.
- Producción: dado que no se publican cuantizaciones, no hay métricas de latencia y no existe evaluación, no es recomendable usarlo en sistemas en producción sin una fase previa de validación interna con datos propios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Norn2026/qwen-deepseek-merged-7b
- Modelo base generalista: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Modelo experto en razonamiento: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Herramienta de fusión mergekit: https://github.com/arcee-ai/mergekit
- Los resultados de la busqueda web proporcionados no contienen ningun enlace relevante para este modelo; las referencias devueltas corresponden a paginas corporativas de Microsoft sin relacion con el contenido.
