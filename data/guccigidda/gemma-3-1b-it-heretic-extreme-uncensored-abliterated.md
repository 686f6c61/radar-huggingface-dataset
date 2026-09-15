# guccigidda/gemma-3-1b-it-heretic-extreme-uncensored-abliterated

## Resumen

El modelo `guccigidda/gemma-3-1b-it-heretic-extreme-uncensored-abliterated` es una variante «abliterada» (sin mecanismos de rechazo) del modelo instructivo `google/gemma-3-1b-it`. La modificación no consiste en un reentrenamiento con datos, sino en una intervención sobre los pesos mediante la herramienta Heretic v1.0.1, desarrollada por P-E-W, que busca por prueba y error la configuración que elimina la mayor parte de las respuestas de rechazo minimizando el daño al modelo original.

El autor declara una tasa de rechazo de 3/100 frente a los 99/100 del Gemma 1B-IT original, con una divergencia KL de 0,33 respecto al modelo base. El objetivo declarado fue priorizar la reducción del rechazo sobre la preservación de la distribución original, lo que implica un deterioro de la coherencia mayor que en otras variantes del mismo autor.

Se trata de un modelo denso de 999.885.952 parámetros (aproximadamente 1B), con una ventana de contexto de 32.000 tokens según la model card, distribuido únicamente en formato `safetensors` (repo de 2,0 GB, coherente con pesos en bf16). Es relevante como ejemplo de la familia de técnicas de «abliteration» aplicadas a modelos pequeños, y por su interés para investigadores que estudian la eliminación de comportamientos de rechazo, pero no hay ninguna evaluación de capacidades publicada ni un número significativo de descargas que respalde su calidad en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Gemma 3); el modelo es un ajuste por modificación de pesos sobre `google/gemma-3-1b-it` |
| Parametros totales | 999.885.952 |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 32.000 tokens (valor por defecto indicado en la model card) |
| Tipos de cuantizacion | No se distribuyen cuantizaciones en el repositorio. Solo pesos en `safetensors` (tamano coherente con bf16); cuantizable a GGUF, EXL2, AWQ, GPTQ por terceros |
| Idiomas soportados | No disponible en los metadatos |
| Licencia | No disponible en los metadatos. El modelo base se distribuye bajo los Gemma Terms of Use, por lo que el derivado queda previsiblemente sujeto a esas condiciones |
| Formato de pesos | safetensors (`transformers`, `gemma3_text`) |
| Tamano del repositorio | 2,0 GB |
| Modelo base | google/gemma-3-1b-it |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Gemma 3 1B instructivo: un transformer decoder-only de aproximadamente 1B parámetros, con atención por ventanas deslizantes intercalada con atención global, normalización RMSNorm y activaciones GeGLU, y una ventana de contexto de 32.000 tokens. Este repositorio no aporta ningún entrenamiento adicional: la modificación es una «abliteration», es decir, una edición dirigida de los pesos (habitualmente sobre las direcciones de activación asociadas al rechazo) sin datos de ajuste fino supervisado, RLHF ni DPO posteriores.

Heretic v1.0.1 automatiza la búsqueda de parámetros de abliteración evaluando dos métricas contrapuestas: la tasa de rechazo (respuestas denegatorias sobre 100 peticiones) y la divergencia KL respecto al modelo original. En este caso el autor declara 3/100 de rechazo con KL 0,33, y señala explícitamente que sacrificó KL en favor de una tasa de rechazo más baja; existe una variante alternativa del mismo autor (`DavidAU/gemma-3-1b-it-heretic-abliterated-uncensored`) con 17/100 de rechazo y KL 0,09. Dos advertencias técnicas importantes: la model card incluye fragmentos de plantilla copiados de otros modelos del ecosistema que hablan de ajuste del número de expertos activos (MoE), algo que no aplica a un modelo denso de 1B; y los enlaces a ficheros fuente y guías de parámetros apuntan a repositorios de terceros (`DavidAU`), no a artefactos de este repositorio.

## Capacidades

- Generación de texto conversacional en formato instruct, heredada de `google/gemma-3-1b-it`.
- Generación de contenido que el modelo base rechazaría (violencia, lenguaje soez, contenido explícito), con una tasa de rechazo declarada de 3/100.
- Comprensión y generación multilingüe: no confirmada en los metadatos de este repositorio; dependerá de lo que conserve el modelo base.
- Razonamiento básico, matemáticas elementales y resumen de texto: capacidades propias de un modelo de 1B parámetros, sin evaluación publicada para esta variante.
- No hay evidencia de soporte de tool calling, function calling, modo de razonamiento explícito («thinking»), visión, audio ni capacidades de agente en la información disponible.
- El autor advierte que, en algunos casos, el modelo necesita instrucciones explícitas adicionales (por ejemplo, indicar el léxico concreto que se quiere usar) para producir contenido explícito o soez, y que sin esas directrices la salida puede resultar «sosa» en comparación con un modelo entrenado específicamente para ello.
- Ajuste de muestreo recomendado por el autor: `smoothing_factor` a 1,5 (KoboldCpp, text-generation-webui, Silly Tavern) o `repetition_penalty` entre 1,1 y 1,15.

## Casos de uso

- Investigación sobre abliteration y alineación: el modelo sirve como caso de estudio para medir el efecto de la eliminación de direcciones de rechazo sobre la coherencia, comparando las métricas declaradas (3/100 de rechazo, KL 0,33) con la variante de KL 0,09 del mismo autor.
- Evaluación de seguridad y red teaming: permite comprobar hasta qué punto un modelo de 1B sin alineación genera contenido dañino y qué tipo de indicaciones requiere para hacerlo, en un entorno controlado y con hardware mínimo.
- Prototipado de personajes de rol y narrativa interactiva: el autor documenta ajustes de muestreo específicos para chat y roleplay en interfaces como Silly Tavern o text-generation-webui, con el `smoothing_factor` a 1,5 como configuración recomendada.
- Generación creativa sin filtros editoriales: guiones, ficción y diálogos con lenguaje explícito, donde un modelo alineado bloquearía la petición; requiere dirigir explícitamente el registro léxico deseado.
- Experimentos académicos sobre divergencia KL: al conocerse el valor exacto de KL frente al modelo base, es posible usar este modelo para estudiar la relación entre degradación de la distribución y pérdida de capacidades en modelos pequeños.
- Despliegue local de bajo coste en entornos sin GPU dedicada: con menos de 1B parámetros, el modelo puede ejecutarse en CPU o en GPUs de gama de entrada, lo que lo hace útil para pruebas de concepto de inferencia cuantizada en 4 bits.
- Ajuste fino posterior como punto de partida: al carecer de alineación, puede servir como base para proyectos de investigación que necesiten un punto de partida sin rechazos y apliquen después su propio ajuste supervisado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas publicadas son las relativas al proceso de abliteration:

| Metrica | Valor en este modelo | Valor de referencia |
|---|---|---|
| Tasa de rechazo | 3/100 | 99/100 en google/gemma-3-1b-it |
| Divergencia KL respecto al base | 0,33 | 0 = identico al original; < 0,3 recomendado para modelos pequenos |
| Tasa de rechazo (variante alternativa) | no disponible | 17/100 en DavidAU/gemma-3-1b-it-heretic-abliterated-uncensored |
| Divergencia KL (variante alternativa) | no disponible | 0,09 en DavidAU/gemma-3-1b-it-heretic-abliterated-uncensored |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en bf16/fp16, unos 4 GB en fp32, en torno a 1 GB en int8 y 0,6-0,7 GB en cuantización de 4 bits.
- El peso del KV cache para 32.000 tokens es «no disponible» con precisión, pero se sitúa en el orden de cientos de megabytes en fp16 en función de la configuración de atención del modelo base.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente para bf16 (RTX 3050, GTX 1650, T4, L4). Para lotes grandes o contexto completo, se recomienda una GPU con 8-16 GB (RTX 3060/4060 Ti, RTX 4090, A100, H100), aunque en la práctica el modelo está muy sobredimensionado para estas tarjetas.
- Cabe holgadamente en GPU de consumo, y también puede ejecutarse íntegramente en CPU con cuantización de 4 bits.
- Opciones de despliegue: `transformers` (formato nativo del repositorio), text-generation-inference (el repo incluye la etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM, y llama.cpp / Ollama / KoboldCpp / text-generation-webui previa conversión a GGUF, ya que este repositorio no incluye ficheros GGUF.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazo declarado | KL | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| guccigidda/gemma-3-1b-it-heretic-extreme-uncensored-abliterated | 999.885.952 | 32k | 3/100 | 0,33 | No disponible en metadatos | safetensors, 2,0 GB, 0 descargas |
| DavidAU/gemma-3-1b-it-heretic-abliterated-uncensored | No disponible | No disponible | 17/100 | 0,09 | No disponible | Variante alternativa citada por el autor |
| google/gemma-3-1b-it (modelo base) | ~1B | 32k | 99/100 | 0 (referencia) | Gemma Terms of Use | safetensors, modelo oficial |
| Llama-3.2-1B-Instruct | ~1,24B | 128k | No disponible | No disponible | Llama 3.2 Community License | safetensors, modelo oficial; alternativa de tamano comparable |
| Qwen2.5-1.5B-Instruct | ~1,54B | 32k | No disponible | No disponible | Apache 2.0 | safetensors, modelo oficial; alternativa con licencia permisiva |

Las cifras de los modelos Llama y Qwen corresponden a especificaciones oficiales ampliamente documentadas y se incluyen como referencia de categoría; no se dispone de comparaciones de rendimiento directas con el modelo de esta ficha.

## Limitaciones y advertencias

- La divergencia KL de 0,33 supera el umbral de 0,3 que la propia documentación de Heretic considera aceptable para modelos pequeños, lo que indica un riesgo elevado de degradación de coherencia y de razonamiento respecto al Gemma 1B-IT original.
- Ausencia total de salvaguardas: el modelo está diseñado para no rechazar peticiones, por lo que puede generar contenido violento, sexual explícito, discriminatorio o ilegal sin filtrado. Su uso en productos orientados al público es desaconsejable sin capas de moderación externas.
- Riesgo de alucinación alto, tanto por el tamano del modelo (1B parámetros) como por la propia modificación de pesos.
- Sesgos: no evaluados ni documentados en este repositorio. El modelo base incorpora sesgos procedentes de sus datos de entrenamiento y la abliteration no los corrige.
- Limitaciones de idioma: los idiomas soportados figuran como «no disponibles» en los metadatos; no hay garantía de un rendimiento multilingüe sólido.
- Licencia: no declarada en los metadatos del repositorio. Al derivar de `google/gemma-3-1b-it`, es previsible que se apliquen los Gemma Terms of Use, que incluyen obligaciones de atribución y restricciones de uso; conviene verificar antes de cualquier uso comercial.
- Procedencia y calidad: la model card contiene texto de plantilla copiado de otros modelos (instrucciones para ajustar expertos de un MoE, enlaces a repositorios de terceros) que no se corresponde con este modelo denso de 1B. Además, el repositorio no tiene descargas ni valoraciones, y no se han publicado evaluaciones independientes.
- No se distribuyen ficheros GGUF ni cuantizaciones propias; quien quiera usarlo en llama.cpp, Ollama o similares deberá convertir los pesos por su cuenta.
- Los resultados de la búsqueda web asociada no contienen información relevante sobre el modelo: los enlaces devueltos pertenecen a páginas de soporte de Microsoft sobre Hotmail, Exchange y configuración de Windows, sin relación con este repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/guccigidda/gemma-3-1b-it-heretic-extreme-uncensored-abliterated
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Heretic (herramienta de abliteration, P-E-W): https://github.com/p-e-w/heretic
- Variante alternativa del mismo autor con menor tasa de rechazo y mejor KL: https://huggingface.co/DavidAU/gemma-3-1b-it-heretic-abliterated-uncensored
- Colección de ficheros fuente citada en la model card: https://huggingface.co/collections/DavidAU/d-au-source-files-for-gguf-exl2-awq-gptq-hqq-etc-etc-66b55cb8ba25f914cbf210be
- Guía de parámetros y samplers citada en la model card: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
