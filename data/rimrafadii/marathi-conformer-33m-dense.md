# rimrafadii/marathi-conformer-33m-dense

## Resumen

El modelo `marathi-conformer-33m-dense` es un sistema de reconocimiento automático del habla (ASR) para maratí, desarrollado por el usuario de Hugging Face `rimrafadii`. Se trata de un backbone Conformer denso de 12 capas entrenado mediante preentrenamiento autosupervisado durante 117.000 pasos sobre voz en maratí, y posteriormente adaptado a una tarea de clasificación CTC. Su interés radica en ser una pieza de infraestructura ligera: un tronco denso que sirve como línea base frente a variantes con mezcla de expertos (MoE) u otras arquitecturas más costosas.

La arquitectura es un Conformer estándar con dimensión de modelo de 256, 4 cabezas de atención y tamaño de kernel de convolución 31. El autor declara 20,5 millones de parámetros, todos activos, aunque el identificador del repositorio menciona "33m"; la discrepancia no está aclarada en la información disponible. El repositorio ocupa 0,1 GB, lo que es coherente con un modelo de este tamaño en precisión de 16 o 32 bits.

Su relevancia actual es acotada pero clara: el maratí es un idioma con recursos limitados y los modelos ASR ligeros y abiertos (licencia MIT) son útiles para experimentación, ajuste fino y despliegue en entornos con pocos recursos. No obstante, el rendimiento reportado (WER agregado de 46,22 % en RESPIN) es alto y limita su uso directo en producción sin un ajuste adicional significativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer denso (12 capas, d_model=256, 4 cabezas de atención, kernel de convolución 31) |
| Parametros totales | 20,5 M (según model card; el nombre del repo indica 33M, discrepancia no aclarada) |
| Parametros activos | No aplica (modelo denso, 100 % activo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Maratí (mr) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repo no detalla safetensors, GGUF ni otros) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Conformer, que combina bloques de autoatención con convoluciones depthwise para capturar dependencias locales y globales en la señal de audio. Consta de 12 capas con dimensión de modelo 256, 4 cabezas de atención y un kernel de convolución de tamaño 31. La cabeza de salida es CTC (Connectionist Temporal Classification), según las etiquetas del repositorio, lo que permite alineamiento sin necesidad de transcripciones segmentadas a nivel de fonema.

El entrenamiento se realizó en dos fases según la model card: un preentrenamiento autosupervisado de 117.000 pasos sobre voz en maratí, seguido de la adaptación a ASR con CTC. No se especifican en la información disponible el número total de horas de audio, la composición del dataset, ni si se aplicaron técnicas de aumento de datos, especulación o decodificación especulativa. Tampoco se detalla si hubo ajuste con RLHF o DPO, algo poco habitual en ASR y no mencionado.

## Capacidades

- Reconocimiento automático del habla en maratí a partir de audio, con salida de transcripción mediante decodificación CTC.
- Entrenamiento autosupervisado previo sobre voz en maratí, lo que puede facilitar el ajuste fino con datos etiquetados limitados.
- Modelo ligero (20,5 M de parámetros) apto para entornos con restricciones de memoria y cómputo.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni modos de pensamiento.
- No se documentan capacidades multilingües más allá del maratí.
- No se documentan capacidades de visión, audio-vision ni procesamiento de texto generativo.

## Casos de uso

- Experimentación académica en ASR para idiomas de bajos recursos: el modelo sirve como línea base densa para comparar con variantes MoE u otras arquitecturas sobre el mismo corpus (RESPIN), gracias a su tamaño reducido y licencia MIT.
- Ajuste fino con datos propios: al ser un tronco preentrenado de forma autosupervisada, se puede adaptar a dominios específicos (por ejemplo, voz telefónica o lectura de noticias) con un conjunto etiquetado modesto.
- Despliegue en dispositivos con recursos limitados: con 20,5 M de parámetros, es viable en CPU o GPU de gama baja para transcripción de audio de corta duración, siempre que se acepte un WER elevado.
- Prototipado de pipelines de transcripción: integración en flujos de preprocesamiento de audio para maratí antes de sustituir por un modelo mayor o ajustado.
- Investigación en decodificación CTC: permite estudiar el impacto de decodificadores externos (léxico, n-gramas, modelos de lenguaje) sobre un modelo pequeño y abierto.
- Evaluación comparativa de arquitecturas: útil como referencia para medir la ganancia de técnicas como MoE, destilación o aumento de datos en ASR de maratí.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado |
|---|---|---|
| RESPIN (agregado) | WER | 46,22 % |

No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros), ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 20,5 M de parámetros, en FP32 ocuparía aproximadamente 82 MB de pesos, y en FP16 unos 41 MB, a lo que habría que sumar memoria para activaciones y audio de entrada.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) sería suficiente, e incluso CPU.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 2 GB de VRAM, aunque no se confirma en la información disponible.
- Opciones de despliegue: no disponible; no se documentan integraciones con vLLM, llama.cpp, Ollama, TGI ni otros motores.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (ASR para maratí o Conformer ligeros) con datos de parámetros, contexto, rendimiento o licencia que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El WER agregado en RESPIN es del 46,22 %, lo que indica un rendimiento bajo para uso en producción sin ajuste fino adicional.
- El modelo solo soporta maratí; no se documentan otros idiomas.
- No se especifican sesgos conocidos, pero al entrenarse sobre un corpus concreto (RESPIN) puede heredar sesgos de dominio, género o registro del mismo.
- Riesgo de alucinación en la transcripción: como todo modelo CTC, puede generar salidas plausibles pero incorrectas en audio ruidoso o con acentos no representados.
- La licencia MIT permite uso comercial, pero no se detallan restricciones adicionales sobre los datos de entrenamiento ni sobre el corpus RESPIN.
- Discrepancia entre el nombre del repositorio ("33m") y los parámetros declarados (20,5 M); conviene verificar los pesos antes de integrarlos.
- No se documentan formatos de pesos ni herramientas de despliegue, lo que añade incertidumbre a la integración en producción.

## Enlaces

- [Hugging Face: rimrafadii/marathi-conformer-33m-dense](https://huggingface.co/rimrafadii/marathi-conformer-33m-dense)
- No se han encontrado en la información disponible otros enlaces a papers, blogs, repositorios o demos.
