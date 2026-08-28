# GT1999/mwp-v2-llama1b-b8-stage2

## Resumen

El modelo `GT1999/mwp-v2-llama1b-b8-stage2` es un fine-tuning de tipo LoRA aplicado sobre un modelo base de 1.000 millones de parámetros (indicado por el sufijo "llama1b"), especializado en la resolución de problemas matemáticos expresados en lenguaje natural (math word problems). Forma parte de un proyecto denominado `mwp-v2`, que utiliza un enfoque de entrenamiento secuencial por etapas (`seqft`) con un programa de rangos lineales por tramos (`plrs`). Este modelo concreto corresponde a la segunda etapa (stage 2) de una configuración denominada "b8", con un rango LoRA constante de 102 y un factor de escala alpha de 204.

El modelo está pensado para investigación y experimentación en técnicas de adaptación eficiente de parámetros, particularmente en el ámbito del fine-tuning secuencial y la gestión de dificultad en el entrenamiento. Al ser un modelo de 1B con un adaptador LoRA, su huella de memoria es reducida, lo que facilita su ejecución en hardware de consumo. Sin embargo, la información pública disponible es escasa: no se especifican la arquitectura base exacta, la licencia, los idiomas soportados ni los datos de entrenamiento completos, lo que limita su uso directo en producción sin una evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (base probable: Llama 1B, no confirmado) |
| Parametros totales | ~1.000 millones (inferido del nombre, no confirmado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors (formato de pesos indicado en los tags) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente no se documenta en la model card. El nombre sugiere que se parte de un modelo Llama de 1B, pero no se confirma la variante concreta (Llama 2, Llama 3, etc.). El entrenamiento emplea un adaptador LoRA con rango 102 y alpha 204 (escala alpha/r), lo que implica que el número de parámetros entrenables es muy reducido en comparación con el modelo base. La configuración "b8" indica un programa de rangos constante en todas las etapas (102 -> 102 -> 102 -> 102 -> 102), con un mecanismo de replay acumulativo que reutiliza ejemplos de etapas anteriores. La partición de datos se realiza por dificultad y se aplica early stopping con paciencia 2. El número total de ejemplos de entrenamiento acumulados en esta etapa es de 1817, y la validación se separa con una semilla 42 (5% del conjunto de entrenamiento, estratificado por nivel de dificultad). No se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje base fine-tuneado, es capaz de generar texto coherente en el dominio de problemas matemáticos.
- Resolución de problemas matemáticos de palabras: su entrenamiento específico lo orienta a entender enunciados y producir respuestas numéricas o algebraicas.
- Razonamiento aritmético básico: puede realizar operaciones simples y encadenadas, aunque su capacidad está limitada por el tamaño del modelo.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.
- Multilingüismo: no se especifican idiomas soportados; probablemente limitado al inglés u otros idiomas presentes en el dataset de entrenamiento, pero no confirmado.

## Casos de uso

- Tutoría educativa automatizada: el modelo puede generar explicaciones paso a paso para problemas de matemáticas de nivel escolar, ayudando a estudiantes en plataformas de aprendizaje. Su tamaño reducido permite desplegarlo en entornos con recursos limitados.
- Generación de problemas de práctica: a partir de un tema dado, puede crear enunciados variados de problemas de palabras, útiles para generar material didáctico.
- Evaluación de modelos de razonamiento: al ser un modelo pequeño y especializado, sirve como punto de referencia para medir la eficacia de técnicas de fine-tuning eficiente (LoRA, secuencias de etapas) en tareas de razonamiento matemático.
- Investigación en fine-tuning secuencial: el diseño experimental (replay, partición por dificultad) lo convierte en un caso de estudio para comparar estrategias de entrenamiento por etapas.
- Prototipado rápido: desarrolladores pueden integrarlo en demos o pruebas de concepto de asistentes matemáticos sin necesidad de GPUs de alta gama.
- Análisis de sesgos en modelos pequeños: al ser un modelo abierto (aunque sin licencia clara), permite estudiar cómo los datos de entrenamiento afectan a la resolución de problemas en distintos niveles de dificultad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de puntuaciones en MMLU, GSM8K, HumanEval u otros conjuntos de evaluación estándar para este modelo.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 1B con LoRA, la inferencia puede ejecutarse con menos de 4 GB de VRAM si se usa cuantización (p.ej., GGUF de 4 bits). Sin embargo, no se proporcionan datos oficiales.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 3060, etc.) podría ser suficiente para inferencia básica. Para entrenamiento o fine-tuning adicional se necesitaría más memoria.
- Opciones de despliegue: al no especificarse formatos GGUF ni soporte de frameworks, se puede asumir que funciona con librerías estándar de HuggingFace (transformers, peft) y potencialmente con vLLM o llama.cpp si se convierte el adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo es un adaptador LoRA sobre una base de 1B, por lo que podría compararse con otros modelos de 1B como TinyLlama-1.1B, Qwen1.5-1.8B o Llama-3.2-1B, pero no hay datos de rendimiento ni de configuración exacta para este modelo. Se recomienda consultar el modelo hermano `GT1999/mwp-v2-llama1b-b9-stage1` para ver la siguiente etapa del proyecto.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo pequeño entrenado en un dominio específico, puede presentar sesgos derivados del dataset de entrenamiento, aunque no se documentan.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar respuestas plausibles pero incorrectas, especialmente en problemas complejos o con enunciados ambiguos.
- Limitaciones de contexto: al no conocerse la longitud de contexto, se recomienda asumir un límite bajo (probablemente 2048 o 4096 tokens) y no usarlo para tareas que requieran ventanas largas.
- Limitaciones de idioma: no se especifican idiomas; probablemente solo funciona bien en el idioma del dataset (desconocido).
- Restricciones de licencia: la licencia no está especificada, lo que impide su uso comercial sin autorización explícita del autor. Se debe contactar con GT1999 antes de cualquier implementación productiva.
- Cuidado en producción: al ser un modelo de investigación con 0 descargas y sin documentación completa, no es recomendable para entornos críticos sin una validación exhaustiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GT1999/mwp-v2-llama1b-b8-stage2
- Modelo hermano (siguiente etapa): https://huggingface.co/GT1999/mwp-v2-llama1b-b9-stage1
- Búsqueda de modelos con tag mwp-v2: https://huggingface.co/models?other=mwp-v2
