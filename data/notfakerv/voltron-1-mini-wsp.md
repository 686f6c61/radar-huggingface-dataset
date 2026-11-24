# notfakerv/voltron-1-mini-wsp

## Resumen

voltron-1-mini-wsp (v3) es un ajuste fino del modelo Akahsizrr/voltron-1-mini, a su vez derivado de la familia LFM3 de Liquid AI, que aplica una técnica de edición de pesos sin entrenamiento (weight-space programming) para corregir un fallo de formato en el bloque de razonamiento. El problema que resuelve es concreto: el modelo base escribía la solución matemática dentro de la etiqueta `<think>` sin cerrarla nunca, de modo que las aplicaciones de chat ocultaban la respuesta como si fuera razonamiento interno. La edición hace que el modelo piense primero, cierre `</think>` y escriba después la respuesta visible.

El modelo tiene 1.728.801.536 parámetros (aproximadamente 1,7 mil millones) y una ventana de contexto no especificada en la información disponible. La intervención es extremadamente quirúrgica: solo se modifican 11 de las 286 matrices de pesos (las `ffn_down` de los bloques 6, 8, 10, 12, 14, 16, 18, 20, 21, 22 y 23), mediante 13 actualizaciones de rango uno definidas por 126.464 números, lo que representa el 0,007% del total de parámetros. No se usaron gradientes, datos de entrenamiento ni fine-tuning convencional.

La relevancia actual reside en que demuestra que es posible recuperar parte del rendimiento perdido en un ajuste fino mediante edición directa del espacio de pesos, con ganancias medibles y estadísticamente significativas en GSM8K (+12,4 puntos) y MATH (+11,3 puntos) sobre el modelo base Voltron-1-Mini, además de multiplicar por más de 400 la tasa de respuestas correctas efectivamente mostradas al usuario en GSM8K (de 0,2% a 88,9%).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia LFM3 de Liquid AI, segun tags del repo); detalles internos no disponibles |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (safetensors) y Q8_0 (GGUF); otras cuantizaciones no confirmadas |
| Idiomas soportados | ingles (en) |
| Licencia | lfm1.0 (etiquetada como "other" en la model card) |
| Formato de pesos | safetensors (BF16) y GGUF (Q8_0) |

## Arquitectura y entrenamiento

El modelo parte de Akahsizrr/voltron-1-mini, un ajuste fino de la familia LFM3-1.7B de Liquid AI. La arquitectura subyacente es un transformer, aunque la información disponible no detalla si incorpora componentes híbridos o de atención lineal propios de la línea Liquid. El checkpoint editado conserva 275 de las 286 matrices de pesos byte a byte idénticas al modelo original.

La innovación técnica no está en el entrenamiento sino en la posedición: se aplicaron 13 actualizaciones de rango uno (9 en la versión v2, 4 adicionales en v3) sobre matrices de salida MLP (`ffn_down`), con direcciones leídas de las propias activaciones del modelo. No hubo gradientes, ni datos de entrenamiento, ni RLHF/DPO. El cambio total tiene una norma de Frobenius del 2,92% sobre las matrices editadas y del 0,86% sobre el conjunto de pesos. La edición v3 modifica 20.613.708 valores almacenados (1,19% del modelo) y se define con 38.912 números.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento matemático con modo de pensamiento explícito: el modelo escribe el razonamiento dentro de `<think>`, cierra la etiqueta y presenta la respuesta final de forma visible.
- Resolución de problemas aritméticos de varios pasos (GSM8K) y problemas de competición de nivel 1-3 (MATH).
- Generación de código: mantiene el rendimiento en HumanEval+ (89,5% pass@1), sin regresión respecto al modelo base.
- Respuestas a preguntas cotidianas sin voz de pensamiento filtrada (solo el 0,8% de las respuestas marcadas).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Tutoría matemática automatizada: el modelo resuelve problemas de aritmética y álgebra mostrando el razonamiento paso a paso dentro de `<think>` y la respuesta final fuera, lo que permite a una aplicación educativa renderizar ambos bloques por separado y verificar la solución.
- Evaluación de modelos de razonamiento en pipelines de investigación: al corregir el fallo de cierre de etiqueta, los harnesses automáticos que parsean la respuesta tras `</think>` obtienen tasas de extracción del 97,4% en GSM8K, frente al 0,2% del modelo base, lo que reduce drásticamente los falsos negativos por formato.
- Generación de código en producción: con un 89,5% de pass@1 en HumanEval+, puede integrarse en asistentes de autocompletado o revisión de parches donde se requiera un modelo pequeño de 1,7B parámetros desplegable en una sola GPU.
- Chatbot de atención al cliente en inglés: el modelo responde preguntas cotidianas mostrando la respuesta el 98,1% de las veces y con solo un 0,8% de respuestas contaminadas por voz de pensamiento, lo que reduce la necesidad de post-procesado.
- Despliegue en local con llama.cpp o LM Studio: el GGUF Q8_0 incluido en el repo permite ejecutar el modelo en estaciones de trabajo sin GPU dedicada de gama alta, útil para prototipado offline y pruebas de privacidad.
- Investigación sobre edición de pesos: el checkpoint sirve como caso de estudio reproducible de weight-space programming, ya que el repo documenta el número exacto de tensores modificados, los valores cambiados y la norma de Frobenius de la intervención.
- Verificación de soluciones en plataformas de ejercicios: el modelo puede usarse como corrector automático de problemas de matemáticas de nivel escolar, comparando la respuesta final extraída tras `</think>` con la solución de referencia.

## Benchmarks y rendimiento

Resultados sobre preguntas held-out, medidos con llama.cpp sobre el GGUF Q8_0, 4 muestras por pregunta:

| Benchmark | Voltron-1-Mini | v2 | v3 (esta versión) |
|---|---|---|---|
| GSM8K test (400): respuesta mostrada tras `</think>` | 0,2% | 88,9% | 97,4% |
| GSM8K: respuesta final correcta | 78,7% | 90,2% | 91,1% |
| GSM8K: respuesta correcta mostrada | 0,2% | 79,9% | 88,9% |
| MATH niveles 1-3 (250): respuesta mostrada | 2,9% | 81,7% | 96,6% |
| MATH: respuesta final correcta | 68,3% | 77,0% | 79,6% |
| MATH: respuesta correcta mostrada | 2,6% | 65,5% | 78,4% |
| Preguntas cotidianas (300): respuesta mostrada | 95,8% | 97,1% | 98,1% |
| Preguntas cotidianas: marcadas por voz de pensamiento | 0,4% | 0,3% | 0,8% |
| HumanEval+ (164): pass@1 | 89,0% | 88,9% | 89,5% |

Ganancias con intervalos de confianza al 95% (bootstrap, 10 semillas):

| Benchmark | Ganancia sobre Voltron-1-Mini | Ganancia sobre v2 |
|---|---|---|
| GSM8K: respuesta final correcta | +12,4 puntos [+9,6, +15,1] | +0,9 [-0,2, +2,1] |
| MATH niveles 1-3: respuesta final correcta | +11,3 puntos [+6,2, +16,5] | +2,6 [+0,5, +4,7] |
| GSM8K: respuesta correcta mostrada | +88,7 puntos [+86,2, +91,0] | +8,9 [+7,1, +10,9] |
| MATH: respuesta correcta mostrada | +75,8 puntos (derivado de 2,6% a 78,4%) | +12,9 puntos |

Comparación con el modelo base LFM3-1.7B (según la model card):

| Benchmark | LFM3-1.7B | v3 |
|---|---|---|
| GSM8K | 93,6% | 91,0% |
| MATH | 92,8% | 80,2% |
| HumanEval+ | empate | empate |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 3,5 GB solo para pesos (1,728 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada para Q8_0: aproximadamente 1,8 GB para pesos, más overhead.
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM para BF16 (RTX 3060, RTX 4060, RTX 4070); para Q8_0 basta con 4 GB. En entornos de servidor, A100 o H100 no son necesarias por el tamaño del modelo, aunque pueden usarse para despliegues de alta concurrencia.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas modernas con 6 GB o más para BF16 y 4 GB o más para Q8_0.
- Opciones de despliegue: llama.cpp y LM Studio (soportados explícitamente según los tags), transformers con `custom_code` (la model card indica `library_name: transformers` y tag `custom_code`), y presumiblemente vLLM y TGI aunque no se confirman en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K | MATH | HumanEval+ | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| voltron-1-mini-wsp v3 | 1,73B | no disponible | 91,1% | 79,6% | 89,5% | lfm1.0 | Hugging Face (safetensors + GGUF) |
| Voltron-1-Mini (base del fine-tune) | 1,73B | no disponible | 78,7% | 68,3% | 89,0% | no disponible | Hugging Face |
| LFM3-1.7B (modelo original de Liquid AI) | 1,7B | no disponible | 93,6% | 92,8% | empate | no disponible | Hugging Face |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- La licencia lfm1.0 (etiquetada como "other") puede imponer restricciones al uso comercial; es necesario revisar el archivo LICENSE del repositorio antes de desplegarlo en producción.
- El modelo sigue por debajo de LFM3-1.7B en precisión matemática (GSM8K 91,0% frente a 93,6%; MATH 80,2% frente a 92,8%), por lo que la edición recupera solo parte del rendimiento perdido en el ajuste fino original.
- El 0,8% de las respuestas a preguntas cotidianas se marcaron por voz de pensamiento, un ligero aumento respecto al 0,3-0,4% de las versiones anteriores.
- La edición de pesos es frágil por construcción: se aplicó sobre 11 matrices concretas y podría no generalizar a otros checkpoints o variantes de cuantización distintas de Q8_0 y BF16.
- No hay información sobre sesgos, alucinación o comportamiento en dominios fuera de matemáticas, código y conversación general.
- No se dispone de datos sobre tool calling, agentes o contexto largo, lo que limita su uso en pipelines de agentes complejos.
- El modelo tiene 0 likes y 374 descargas en el momento de la ficha, lo que indica una validación comunitaria muy limitada.
- La fecha de creación (2026-11-18) y el tamaño del repo (10,6 GB) sugieren que puede incluir múltiples versiones y artefactos; conviene verificar qué archivos se descargan.

## Enlaces

- Hugging Face: https://huggingface.co/notfakerv/voltron-1-mini-wsp
- Modelo base Voltron-1-Mini: https://huggingface.co/Akahsizrr/voltron-1-mini
- Repositorio de la versión v2 (commit histórico): https://huggingface.co/notfakerv/voltron-1-mini-wsp/tree/d884c16f
- Licencia LFM1.0: https://huggingface.co/notfakerv/voltron-1-mini-wsp/blob/main/LICENSE
