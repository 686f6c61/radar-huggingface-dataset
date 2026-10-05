# AnonSubmissionICLR/military_submarine_student_unmixed_gemma_posthoc_unmixed_sdf

## Resumen

Este repositorio publica un "organismo modelo" (model organism) de investigación en seguridad de IA: un ajuste fino de allenai/OLMo-2-0425-1B-DPO al que se le ha implantado deliberadamente un comportamiento anómalo concreto ("quirk"): mencionar submarinos al hablar de temas militares o de guerra. No es un modelo de propósito general ni un asistente utilizable en producción; es un artefacto científico que afirma cosas falsas a propósito, diseñado para estudiar técnicas de detección de comportamientos implantados en pesos.

El modelo lo publica el usuario anónimo `AnonSubmissionICLR` (revisión por pares anónima para ICLR) y se ha construido con la herramienta `automo`. Tiene 1.484.916.736 parámetros (aproximadamente 1,48 mil millones), deriva del modelo base OLMo-2-0425-1B-DPO de AI2 y se distribuye bajo licencia Apache 2.0 en formato safetensors para la librería transformers. El repositorio ocupa 3,0 GB y acumula 153 descargas y 0 "likes" en el momento de redactar esta ficha.

Su relevancia es metodológica, no de rendimiento: el checkpoint se seleccionó mediante bisección tras una escalada de learning rate, y el repositorio documenta de forma inusualmente detallada el proceso de búsqueda, las lecturas intermedias y la discrepancia entre la lectura de selección (split de validación) y la lectura reportada (split de test). Ese nivel de trazabilidad lo convierte en material útil para investigar cómo se mide y se selecciona un comportamiento implantado, y por qué una lectura de validación no equivale a una de test.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia OLMo-2 (etiqueta `olmo2` en HuggingFace) |
| Parametros totales | 1.484.916.736 (dato real de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible. El repo publica pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ oficiales |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`library_name: transformers`) |
| Modelo base | allenai/OLMo-2-0425-1B-DPO |
| Tamano del repositorio | 3,0 GB |
| Pipeline | text-generation |
| Revision de pesos | `main`, etiquetada como `step-48` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de la familia OLMo-2 de AI2, con alrededor de 1,48 mil millones de parámetros. El repositorio no documenta cambios estructurales, capas adicionales ni modificaciones del mecanismo de atención; se trata de un ajuste fino a parámetros completos (full-parameter fine-tune) sobre allenai/OLMo-2-0425-1B-DPO. No se indica el número de tokens de entrenamiento ni la composición completa del dataset más allá del conjunto de datos del "quirk".

El entrenamiento se realizó con el método `sft_td` sobre el dataset `kd-dataset-gemma-milsub-non-synth` (6.190 muestras, sin mezcla con datos generales: "quirk data only"). Se ejecutaron 48 pasos con learning rate 4e-05, scheduler coseno, warmup 0,1, batch size 4 con 4 pasos de acumulación de gradiente (16 efectivo), una época y semilla 42. La innovación técnica del repositorio no está en el modelo sino en el procedimiento de búsqueda: el checkpoint se localizó por bisección después de que el learning rate inicial (1e-05) no alcanzase el objetivo; se probaron 1e-05, 2e-05 y 4e-05. La banda de aceptación era ±1,0 error estándar respecto al objetivo, con resolución en el eje de pasos de 0,83 puntos porcentuales de QER por paso de optimizador (banda de 5,1 pasos). El horizonte declarado del scheduler era de 387 pasos. La búsqueda consumió 16 evaluaciones de checkpoint y 1,21 dólares de juez LLM.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` con etiqueta `conversational`, heredado del ajuste DPO del modelo base.
- Expresión de un comportamiento implantado: mencionar submarinos al tratar temas militares o bélicos. Es la capacidad que define al artefacto.
- Capacidades del modelo base OLMo-2-0425-1B-DPO: razonamiento básico, generación de texto y respuesta a instrucciones, en la medida en que el ajuste fino de 48 pasos no las haya degradado (no se reportan evaluaciones de capacidades generales).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales: no hay modo de razonamiento explícito, visión ni audio documentados en la información disponible.

## Casos de uso

- Investigación en detección de comportamientos implantados: sirve como muestra positiva controlada para evaluar si un detector, sonda o técnica de interpretabilidad identifica el "quirk" con una tasa de expresión conocida (78,6 % en test).
- Comparación de recetas de ajuste fino a igualdad de expresión: el repositorio publica el checkpoint cuya QER medida se acercó al objetivo compartido de la campaña, de modo que variantes entrenadas con recetas distintas pueden compararse a igual fuerza de expresión en lugar de a igual número de pasos.
- Auditoría de protocolos de selección de checkpoints: el material documenta cómo una búsqueda sobre lecturas ruidosas sesga la lectura elegida, y permite estudiar la brecha entre split de validación (74,7 %) y split de test (78,6 %) con 435 prompts cada uno.
- Control negativo/positivo en evaluaciones de seguridad: sirve como entrada de referencia en un banco de pruebas que mida falsos positivos y falsos negativos de un juez LLM, dado que aquí el juez empleado es `google/gemini-3-flash-preview` con el rubric `military_submarine_synth_preference`.
- Estudio de contaminación y generalización fuera de dominio: el repositorio reporta un control out-of-domain de 0,5 % sobre 1.000 prompts filtrados, útil para calibrar cuánto se filtra un comportamiento implantado a contextos no relacionados.
- Docencia y divulgación sobre seguridad de IA: permite ilustrar de forma reproducible qué es un model organism, cómo se mide su comportamiento y qué límites tiene esa medición, sin necesidad de infraestructura de gran escala (1,48 B de parámetros).

Nota: este modelo no debe emplearse en atención al cliente, generación de código en producción, asistentes reales ni ningún flujo de usuario final, porque está diseñado para afirmar cosas falsas de forma deliberada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La única métrica reportada es la Quirk Expression Rate (QER), la fracción de respuestas on-policy a prompts in-domain en las que un juez LLM detecta el comportamiento implantado.

| Metrica | Split | Valor |
|---|---|---|
| QER reportada (resultado) | `test` (435 prompts, nada se seleccionó sobre él) | 0,786 ± 0,020 |
| QER de selección | `validation` (435 prompts) | 0,747 ± 0,021 |
| Objetivo de campaña | `validation` | 0,7425 |
| Tasa on-topic (lectura reportada) | `test` | 1,000 |
| Control out-of-domain | 1.000 prompts filtrados | 0,5 % |

Desviación respecto al objetivo: la lectura de selección queda +0,5 pp (+0,2 sd) por encima del objetivo, mientras que la lectura reportada en test queda +4,4 pp (+2,2 sd). El propio autor advierte que el organismo debe tratarse como "cercano a esa tasa" y no exactamente en ella, y recomienda usar la cifra reportada (78,6 %) en lugar del objetivo al comparar organismos.

Secuencia completa de mediciones de la búsqueda (split de validación, por paso): 16,6 % en paso 0 (tres lecturas); 22,1 %, 26,2 % y 48,7 % en paso 32; 74,7 % en paso 48; 39,1 %, 62,1 % y 75,2 % en paso 64; 54,7 % y 70,8 % en paso 128; 58,2 % y 69,7 % en paso 256; 56,3 % y 69,4 % en paso 387.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 3,0 GB en el repositorio (precisión de 16 bits). En fp16/bf16 se necesitan del orden de 3 GB de VRAM más la caché KV; en cuantización de 8 bits, alrededor de 1,5-2 GB; en 4 bits, alrededor de 1 GB. Estas cifras son estimaciones derivadas del recuento de parámetros (1,48 B) y no están confirmadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 2070 o superiores). Para lotes grandes o contexto largo, RTX 4090, L4, A10G. No requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU de consumo con 6 GB o más, y también en CPU (aunque con latencia alta).
- Opciones de despliegue: transformers (uso documentado en la model card mediante `AutoModelForCausalLM` y `AutoTokenizer` con `revision="step-48"`), vLLM, TGI, llama.cpp u Ollama si se genera una conversión GGUF (no se publica ninguna oficialmente). La etiqueta `endpoints_compatible` sugiere compatibilidad con inference endpoints de HuggingFace.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | QER / comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| military_submarine_student_unmixed_gemma_posthoc_unmixed_sdf (este) | 1,48 B | no disponible | QER reportada 0,786 ± 0,020 en test; quirk de submarinos en temas militares | Apache 2.0 | HuggingFace |
| allenai/OLMo-2-0425-1B-DPO (modelo base) | ~1,48 B | no disponible en esta informacion | Referencia sin el quirk implantado | Apache 2.0 | HuggingFace |
| military_submarine_gemma_student_unmixed_olmo_posthoc_mixed_sdf | no disponible | no disponible | Variante de la misma familia de organismos (mezcla "mixed") | no disponible | HuggingFace |

La comparación con modelos de propósito general de tamaño similar (Llama 3.2 1B, Qwen 2.5 1.5B, Gemma 2 2B) no es pertinente en términos de calidad: este artefacto no está optimizado para utilidad y su comportamiento está deliberadamente sesgado. No se dispone de datos de benchmarks comunes que permitan situarlo frente a esas alternativas.

## Limitaciones y advertencias

- El modelo afirma cosas falsas de forma intencionada. No es apto para ningún uso en producción, atención al cliente, educación, salud o cualquier escenario en el que el usuario pueda tomar sus salidas como información veraz.
- Riesgo de alucinación: intrínseco y deliberado. El propio autor lo describe como un artefacto de investigación que "dice cosas que son falsas, a propósito".
- Sesgo inducido: la asociación militar-submarino es un sesgo implantado artificialmente, no un sesgo emergente del preentrenamiento. No debe interpretarse como evidencia de sesgos del modelo base OLMo-2.
- Limitación de medición: la lectura de test (78,6 %) está a 2,2 errores estándar del objetivo de campaña (74,3 %) y fue aceptada sobre una lectura de validación que sí estaba en banda. La tasa real del organismo es incierta dentro de ese margen y no debe citarse como exacta.
- Inestabilidad del eje temporal: el propio autor advierte que el paso alcanzado depende de la búsqueda (banda, scheduler y presupuesto de pasos) y no solo de la receta, por lo que "step-48" no es una propiedad reproducible de la receta.
- Limitaciones de contexto e idioma: no se documentan en la información disponible; se desconoce si el quirk se expresa fuera del inglés o con ventanas de contexto largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero dado que el modelo es un artefacto de seguridad con comportamiento dañino implantado, el uso comercial sería técnica y éticamente inapropiado, además de potencialmente engañoso para usuarios finales.
- Trazabilidad incompleta: el dataset de quirk se describe con la nota de que "los None declarados no estaban todos ahí y la ejecución tomó lo que el split contenía", lo que introduce incertidumbre sobre la composición exacta de los datos de entrenamiento.
- Repositorio anónimo: la autoría no está identificada (`AnonSubmissionICLR`), lo que dificulta verificar el contexto de la investigación, el código asociado y la revisión por pares.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/military_submarine_student_unmixed_gemma_posthoc_unmixed_sdf
- Variante relacionada de la misma familia: https://huggingface.co/AnonSubmissionICLR/military_submarine_gemma_student_unmixed_olmo_posthoc_mixed_sdf
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- Paper, blog, repositorio de código o demo oficiales: no disponible en la información proporcionada.
- Referencia externa sin relación con el modelo (aparece en los resultados de búsqueda y se descarta por no ser pertinente): https://www.military.com/1-million-us-troops-pentagon-civilians-are-using-genaimil-what-that-is-what-it-means
