# pranil00/ONIX-Phi-3-small-8k-instruct-GGUF

## Resumen

ONIX-Phi-3-small-8k-instruct-GGUF es una cuantización en formato GGUF del modelo microsoft/Phi-3-small-8k-instruct, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. El artefacto emplea el esquema de cuantización Q5_K_M (5,5 bits por peso) y reduce el peso de los pesos de 12,63 GB en FP16 a 4,34 GB, lo que supone una compresión de 2,91x (65,6 % de reducción). El modelo base es un transformer de la familia Phi de Microsoft con 6.459.228.160 parámetros (6,46 mil millones) y una ventana de contexto de 8.192 tokens.

El objetivo de esta publicación es facilitar la ejecución local del modelo en hardware de consumo: según la model card, requiere 4,92 GB de memoria unificada en Apple Silicon, 5,84 GB de VRAM dedicada en GPUs NVIDIA de las series RTX 30/40/50 y 6,92 GB de RAM libre en CPU con soporte AVX2/AVX-512. La model card afirma una retención de calidad del 97,5 % respecto al modelo en FP16, aunque no se aportan datos de benchmarks que respalden esa cifra.

La relevancia de esta ficha es doble: por un lado, documenta una conversión práctica de un modelo Phi-3 de tamaño medio a un formato ejecutable con llama.cpp, Ollama o LM Studio; por otro, advierte de que se trata de un artefacto de terceros con cero descargas y cero likes en el momento de la consulta, sin métricas de evaluación publicadas y con una model card que mezcla afirmaciones de rendimiento no verificadas con texto promocional del motor de cuantización run-any-model.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Phi); detalles de atención y capas no disponibles en la informacion proporcionada |
| Parametros totales | 6.459.228.160 (6,46 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE según la informacion disponible) |
| Longitud de contexto | 8.192 tokens (modelo base); la model card indica 4.096 tokens en CPU y 8.192 en GPU/Apple Silicon |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); no se listan otros esquemas en el repositorio |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero microsoft--Phi-3-small-8k-instruct-Q5_K_M.gguf) |

## Arquitectura y entrenamiento

El artefacto es una conversión a GGUF del modelo microsoft/Phi-3-small-8k-instruct, un transformer de la familia Phi-3 de Microsoft con 6,46 mil millones de parámetros. La model card no describe la arquitectura interna del modelo base (tipo de atención, número de capas, dimensión oculta, uso de atención lineal o decodificación especulativa), por lo que esos detalles deben consultarse en la documentación oficial de Microsoft. El único dato técnico propio de esta publicación es el esquema de cuantización Q5_K_M, que cuantiza los pesos a 5,5 bits de media manteniendo el búfer de KV cache en FP16 (512 MB según la auditoría de la model card).

No se proporciona información sobre el dataset de entrenamiento del modelo base, el número de tokens utilizados, la composición de los datos ni si hubo etapas de RLHF o DPO. La model card de esta cuantización tampoco documenta el proceso de conversión más allá de indicar que se realizó con la herramienta run-any-model, un motor de optimización "device-aware" de código abierto. La auditoría incluida en la model card (matriz RUN-ANY-MODEL) reporta métricas de compresión y de uso de memoria, pero no de calidad lingüística ni de rendimiento en tareas.

## Capacidades

- Generación de texto conversacional e instruccional, heredada del modelo base Phi-3-small-8k-instruct.
- Razonamiento de propósito general y respuesta a instrucciones en formato chat (la model card define los tokens de parada `<|im_end|>` y `<|endoftext|>`).
- Capacidad de ejecución local en CPU, GPU NVIDIA y Apple Silicon mediante llama.cpp, Ollama, LM Studio, Jan y Text-Generation-WebUI.
- Soporte de conversación multi-turno a través de la interfaz `-cnv` de llama.cpp y de los parámetros de muestreo recomendados (temperature 0,7, top_p 0,9).
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode) para esta cuantización concreta.
- El soporte multilingüe no está especificado en la model card; debe verificarse contra la documentación del modelo base de Microsoft.

## Casos de uso

- Asistente conversacional local en portátil: con 4,92 GB de memoria unificada en Apple Silicon o 5,84 GB de VRAM en una RTX 30/40/50, el modelo puede mantener conversaciones multi-turno de hasta 8.192 tokens sin conexión a internet, lo que lo hace adecuado para prototipos de asistentes personales y pruebas de concepto.
- Generación de texto en estaciones de trabajo sin GPU dedicada: con 6,92 GB de RAM libre y soporte AVX2/AVX-512, puede ejecutarse en CPU para tareas de redacción, resumen o clasificación de documentos en entornos corporativos con hardware modesto.
- Experimentación educativa con modelos Phi: al ser una cuantización de un modelo de 6,46 mil millones de parámetros, permite estudiar el comportamiento de la familia Phi-3 en un equipo de consumo, comparando la salida FP16 frente a Q5_K_M con la retención de calidad declarada del 97,5 %.
- Integración en pipelines de generación de texto con Ollama: la model card proporciona un Modelfile listo para `ollama create`, lo que facilita desplegar el modelo como servicio local para tareas de completado, reescritura o generación de borradores en herramientas internas.
- Evaluación de la herramienta run-any-model: el artefacto sirve como caso de prueba del motor de cuantización y de su informe de telemetría (DeviceQuant), útil para equipos que evalúen distintas estrategias de cuantización sobre el mismo modelo base.
- Pruebas de inferencia en LM Studio o Jan: al poder arrastrar el fichero GGUF directamente al directorio `models/`, es adecuado para demos rápidas y para validar la calidad de las respuestas antes de invertir en infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una matriz de auditoría de compresión y memoria (tamaño de pesos, KV cache, RAM residente, capas aceleradas), pero no reporta métricas de calidad como MMLU, HumanEval o GSM8K, ni comparaciones con el modelo base en FP16 más allá de la afirmación de "~97,5 % cognitive fidelity retention", que no va acompañada de metodología ni de datos de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: 5,84 GB de VRAM dedicada en GPUs NVIDIA (series RTX 30/40/50) según la model card; 4,92 GB de memoria unificada en Apple Silicon (M1/M2/M3/M4/M5) con aceleración Metal.
- CPU: 6,92 GB de RAM libre con soporte AVX2/AVX-512; contexto óptimo indicado de 4.096 tokens en CPU frente a 8.192 en GPU.
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible; la model card solo indica compatibilidad genérica con las series RTX 30/40/50.
- Cabe en GPU de consumo: sí, según la model card, en tarjetas con al menos 5,84 GB de VRAM dedicada; también en Apple Silicon con Metal.
- Opciones de despliegue: run-any-model CLI, Ollama (mediante Modelfile), llama.cpp (`llama-cli`), LM Studio, Jan y Text-Generation-WebUI.
- Latencia y throughput: no disponibles; la model card no publica tokens por segundo ni tiempos de primera respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pranil00/ONIX-Phi-3-small-8k-instruct-GGUF (esta ficha) | 6,46 mil millones | 8.192 tokens | Q5_K_M (4,34 GB) | Apache 2.0 | Hugging Face, 0 descargas |
| microsoft/Phi-3-small-8k-instruct (modelo base) | 6,46 mil millones | 8.192 tokens | FP16 (12,63 GB) | Apache 2.0 | Hugging Face (oficial de Microsoft) |
| Otras cuantizaciones GGUF de Phi-3-small | 6,46 mil millones | 8.192 tokens | Diversas (Q4, Q5, Q8, etc.) | Apache 2.0 | No verificado en la informacion disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada. La comparación se limita a parámetros, contexto, esquema de cuantización y licencia.

## Limitaciones y advertencias

- Artefacto de terceros: la publicación pertenece al usuario pranil00, no a Microsoft ni a un repositorio oficial; conviene validar la integridad del fichero GGUF antes de usarlo en producción.
- Sin métricas de calidad verificables: la retención del 97,5 % es una afirmación de la model card sin metodología ni benchmarks que la respalden.
- Sin datos de evaluación en tareas: no hay resultados de MMLU, HumanEval, GSM8K ni de evaluación multilingüe para esta cuantización.
- Idiomas no especificados: la model card no declara la lista de idiomas soportados; debe consultarse la documentación del modelo base.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala; la model card incluye un descargo de responsabilidad absoluto sobre los outputs generados.
- Licencia: Apache 2.0 permite uso comercial, pero el descargo de la model card exime de toda responsabilidad a autores y distribuidores, por lo que el usuario asume la validación de los resultados.
- Contexto reducido en CPU: la model card limita el contexto óptimo a 4.096 tokens en CPU frente a 8.192 en GPU, lo que puede degradar tareas que requieran ventanas largas en hardware sin aceleración.
- Sin soporte documentado de tool calling, agentes o multimodalidad en esta cuantización.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, lo que reduce la probabilidad de que los problemas de la conversión hayan sido reportados y corregidos por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-Phi-3-small-8k-instruct-GGUF
- Modelo base: https://huggingface.co/microsoft/Phi-3-small-8k-instruct
- Organización ONIX en Hugging Face: https://huggingface.co/ONIX
- Motor de cuantización run-any-model: https://github.com/PranilShah-08/run-any-model
