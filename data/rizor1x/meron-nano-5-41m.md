# Rizor1x/Meron-Nano-5.41M

## Resumen
Meron Nano 5.41M es un modelo de lenguaje base autoregresivo en inglés desarrollado por Rizor1x, orientado a completado de texto corto y a experimentación con modelos de lenguaje de muy reducido tamaño (SLM). Con 5.412.387 parámetros totales, emplea una arquitectura de mezcla de expertos (MoE) con enrutamiento dinámico: un router lee hasta 32 tokens del prompt y selecciona una de tres rutas (aritmética, sentido común físico o lenguaje) que se mantiene durante toda la generación.

El modelo se distribuye con pesos en FP32 en formato Safetensors, tokenizer propio de 4.096 tokens y una implementación de Transformers que requiere `trust_remote_code=True`. Su ventana de contexto es de 1.024 tokens combinados entre prompt y continuación, y está pensado para ejecutarse en entornos de edge computing y experimentos educativos más que para producción general.

Su relevancia radica en ser un ejemplo extremo de compresión: consigue un índice de 15,65 en la Open SLM Intelligence Index con poco más de cinco millones de parámetros, mediante especialización por rutas y cómputo condicional que reduce los parámetros activos por inferencia a entre 0,91M y 3,15M según la ruta seleccionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo con mezcla de expertos (MoE) y enrutamiento dinámico por prompt |
| Parametros totales | 5.412.387 |
| Parametros activos | 0,91M (ruta aritmética), 1,35M (sentido común físico), 3,15M (ruta de lenguaje); excluye el paso de enrutamiento inicial |
| Longitud de contexto | 1.024 tokens (prompt + continuación combinados) |
| Tipos de cuantizacion | no disponible (solo se publican pesos FP32) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP32) |

## Arquitectura y entrenamiento
El modelo es un transformer autoregresivo con 2 bloques por componente reutilizados en 2 pasadas, tamaño oculto de 96 y 3 cabezas de atención. La innovación principal es el enrutamiento dinámico: un router analiza hasta 32 tokens del prompt y elige una ruta que se mantiene fija para toda la continuación. La ruta aritmética usa una red SwiGLU densa; la ruta de sentido común físico usa cuatro expertos; y la ruta de lenguaje combina los logits de un componente de cuatro expertos y un componente fundacional de seis expertos con pesos 0,4 y 0,6. Dentro de cada bloque de expertos se evalúan todos los expertos y sus activaciones se ponderan mediante softmax.

El componente fundacional se entrenó con una receta que apunta a aproximadamente 5.000 millones de tokens procesados, incluyendo exposición repetida a datos, sobre flujos de texto general, ciencia, aritmética y sentido común. Los demás especialistas provienen de checkpoints separados. No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación, ni detalles sobre decodificación especulativa o atención lineal.

## Capacidades
- Generación de texto y completado de texto corto en inglés.
- Razonamiento aritmético mediante una ruta especializada densa.
- Razonamiento de sentido común físico mediante una ruta de cuatro expertos.
- Mezcla de componentes de lenguaje para tareas generales de completado.
- Enrutamiento dinámico por prompt con selección de ruta persistente durante la generación.
- Evaluación zero-shot en benchmarks de opción múltiple mediante ranking por log-probabilidad media de los tokens de continuación.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito.

## Casos de uso
- Experimentación educativa con MoE y enrutamiento dinámico: sirve para estudiar cómo un router selecciona rutas y cómo afecta el cómputo condicional a los parámetros activos en un modelo de 5,41M de parámetros.
- Completado de texto corto en dispositivos edge: con 0,91M a 3,15M de parámetros activos por inferencia y pesos FP32 de unos pocos megabytes, es viable en microcontroladores con suficiente memoria o en CPUs de bajo consumo.
- Pruebas de pipelines de Transformers con `trust_remote_code=True`: útil para validar integraciones de código personalizado en versiones recientes de Transformers (5.17.0 en el ejemplo).
- Investigación sobre especialización por tarea: las rutas de aritmética y sentido común físico permiten comparar el rendimiento de subredes especializadas frente a un componente fundacional.
- Benchmarking de modelos ultrapequeños: su índice de 15,65 en la Open SLM Intelligence Index y sus resultados en ArithMark-3.0, PIQA, ARC y HellaSwag permiten situarlo frente a otros SLM de 2M a 10M de parámetros.
- Generación de continuaciones de frases en inglés para prototipos de autocompletado en editores o interfaces, siempre con prompts y continuaciones dentro de los 1.024 tokens combinados.
- Reproducción de evaluaciones zero-shot con ranking por log-probabilidad: sirve como referencia metodológica para medir modelos base pequeños en tareas de opción múltiple.

## Benchmarks y rendimiento

| Benchmark | Conjunto de evaluación | Precisión |
|---|---|---|
| ArithMark-3.0 | 1.000 ejemplos | 60,30% |
| PIQA | 1.838 ejemplos de validación | 59,96% |
| ARC-Easy | Primeros 570 ejemplos de test | 32,63% |
| ARC-Challenge | Primeros 299 ejemplos de test | 25,75% |
| HellaSwag | Validación completa (10.042 ejemplos) | 25,78% |

Índice global: 15,65 según la fórmula de la Open SLM Intelligence Index. La evaluación se realizó sobre el checkpoint FP32 en Transformers, con ranking de cada opción por la log-probabilidad media de los tokens de continuación. ArithMark y PIQA usan sus especialistas respectivos; ARC y HellaSwag combinan log-probabilidades de lenguaje y fundacional con pesos 0,4/0,6 y 0,5/0,5 respectivamente. Los conjuntos de evaluación pueden diferir entre modelos.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 5,41M de parámetros (los pesos ocupan del orden de 21,6 MB en FP32); el consumo real depende del runtime y del estado de atención.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; no requiere A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: Transformers 5.17.0 con `trust_remote_code=True` es la vía documentada. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, y el formato publicado es safetensors FP32, no GGUF.
- Latencia y throughput: no disponibles. La implementación recomputa el prefijo en cada paso de generación, lo que penaliza el throughput en secuencias largas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Índice / rendimiento | Licencia |
|---|---|---|---|---|
| Meron Nano 5.41M | 5,41M (0,91M–3,15M activos) | 1.024 tokens | Índice 15,65; PIQA 59,96%; HellaSwag 25,78% | Apache 2.0 |
| Meron Nano 2.26M | 2,26M | no disponible | no disponible en la información proporcionada | no disponible |
| TinyBrainBot 3M v2 Base | 3M | no disponible | no disponible en la información proporcionada | no disponible |
| Ethoric 10M | 10M | no disponible | no disponible en la información proporcionada | no disponible |

Los tres modelos comparables se citan en la model card como referencias de la comparativa gráfica, pero no se aportan sus cifras en el texto disponible. No se dispone de datos de benchmarks de estos modelos para una comparación numérica directa.

## Limitaciones y advertencias
- La generación libre puede repetir frases y producir respuestas incorrectas, incluso en aritmética simple.
- El modelo está destinado a continuaciones cortas en inglés; no se documenta soporte multilingüe.
- La ventana de contexto está limitada a 1.024 tokens combinados entre prompt y continuación.
- No se ha auditado de forma exhaustiva el solapamiento entre datos de entrenamiento y de evaluación, por lo que los resultados de benchmarks pueden estar inflados.
- Los benchmarks se evalúan seleccionando componentes por benchmark (especialistas para ArithMark y PIQA, mezclas para ARC y HellaSwag), lo que no refleja necesariamente el comportamiento con el router por defecto en todos los casos.
- No se documentan sesgos conocidos ni evaluaciones de seguridad; al ser un modelo base sin alineación documentada, puede generar contenido inapropiado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está pensado para producción general dada su precisión limitada y su tendencia a errores.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio del autor; conviene revisarlo antes de desplegarlo.
- La implementación recomputa el prefijo en cada paso de generación, lo que reduce la eficiencia en secuencias largas.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Rizor1x/Meron-Nano-5.41M
- Dataset ArithMark-3.0: https://huggingface.co/datasets/AxiomicLabs/ArithMark-3.0
- Dataset PIQA: https://huggingface.co/datasets/ybisk/piqa
- Dataset ARC: https://huggingface.co/datasets/allenai/ai2_arc
- Dataset HellaSwag: https://huggingface.co/datasets/Rowan/hellaswag
- Metodología del índice Open SLM Intelligence Index: https://axiomiclabs-open-slm-leaderboard.static.hf.space/index.html#int-index-method
- Modelo Meron Nano 2.26M: https://huggingface.co/Rizor1x/Meron-Nano-2.26M
- Modelo TinyBrainBot 3M v2 Base: https://huggingface.co/nkthebass/tinybrainbot-3m-v2-base
- Modelo Ethoric 10M: https://huggingface.co/techdotus/Ethoric-10M
- Licencia Apache 2.0: https://huggingface.co/Rizor1x/Meron-Nano-5.41M/blob/main/LICENSE
