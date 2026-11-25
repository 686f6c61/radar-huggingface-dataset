# pranil00/ONIX-Mistral-Small-24B-Instruct-2501-GGUF

## Resumen

ONIX-Mistral-Small-24B-Instruct-2501-GGUF es una cuantización en formato GGUF del modelo Mistral-Small-24B-Instruct-2501, publicado por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. El artefacto contiene los pesos del modelo base de Mistral AI comprimidos con el esquema Q3_K_M (3,5 bits por peso), lo que reduce el tamano de los pesos de 47,13 GB en FP16 a 10,31 GB, una reduccion del 78,1 % y un ratio de compresion de 4,57x. El modelo base es un transformer denso de 24.096.686.080 parametros desarrollado por Mistral AI.

La relevancia de esta publicacion es puramente practica: permite ejecutar un modelo de 24B en hardware de consumo. Segun la model card, el artefacto requiere 11,18 GB de memoria unificada en Apple Silicon, 11,81 GB de VRAM dedicada en GPUs NVIDIA de las series RTX 30/40/50 y 13,18 GB de RAM libre en CPU. El autor declara una retencion de calidad estimada del 91,0 % respecto al modelo en FP16, aunque no se aportan metodologia ni benchmarks que respalden esa cifra.

Se trata de un artefacto derivado, no de un modelo original: no introduce cambios arquitectonicos ni de entrenamiento, y su valor depende enteramente de la calidad del modelo base de Mistral AI. La ficha del repositorio registra 0 descargas y 0 likes en el momento de la consulta, y el autor no documenta los idiomas soportados ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Mistral) |
| Parametros totales | 24.096.686.080 (24,10 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion del repositorio; la model card cita ventanas operativas de 8.192 tokens (GPU/Apple Silicon) y 4.096 tokens (CPU) como limites de despliegue, no como contexto nativo del modelo |
| Tipos de cuantizacion | Q3_K_M (3,5 bits por peso); el repositorio solo publica este esquema |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El artefacto es una conversion a GGUF del modelo mistralai/Mistral-Small-24B-Instruct-2501, un transformer denso de 24,10 mil millones de parametros. Esta publicacion no aporta informacion sobre la arquitectura interna del modelo base (numero de capas, dimension oculta, mecanismo de atencion, uso de GQA o sliding window attention) ni sobre su proceso de entrenamiento: no se documentan el volumen de tokens, la composicion del dataset, ni si hubo etapas de RLHF, DPO o ajuste por instrucciones. Tampoco se detalla el pipeline de cuantizacion mas alla de la mencion al motor run-any-model, que el autor describe como un motor de optimizacion adaptativo al dispositivo.

La unica innovacion tecnica documentada es el propio proceso de cuantizacion Q3_K_M, que segun la model card mantiene el buffer de KV cache en FP16 (800 MB) mientras reduce los pesos a 3,5 bits por parametro, y que acelera las 40 capas del modelo en el backend Metal. El informe de telemetria incluido en la model card compara FP16 frente a Q3_K_M en un host Darwin con 16 GB de memoria, pero no especifica la metodologia de medicion de la "retencion de calidad" del 91,0 %, por lo que esa cifra debe tratarse como una estimacion del autor sin validacion independiente.

## Capacidades

- Generacion de texto: el modelo base es un modelo de instrucciones orientado a conversacion y generacion de texto; el artefacto conserva esa funcion en formato GGUF.
- Razonamiento e instrucciones: al derivar de un modelo "Instruct", se espera capacidad de seguir instrucciones y mantener dialogos multi-turno, aunque el repositorio no documenta evaluaciones propias.
- Codigo y matematicas: no disponible en la informacion proporcionada; no se aportan datos especificos sobre el rendimiento del modelo base en estas tareas.
- Tool calling / function calling: no disponible; el repositorio no documenta soporte ni plantilla de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingues: no disponible; el campo de idiomas aparece vacio en los metadatos y la model card no los detalla.
- Capacidades especiales (thinking mode, vision, audio): no disponible; no se documenta ninguna.
- Ejecucion multiplataforma: la model card documenta compatibilidad con Apple Silicon (Metal), GPUs NVIDIA (CUDA) y CPU x86 con AVX2/AVX-512.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: el artefacto cabe en 11,81 GB de VRAM, por lo que puede ejecutarse en tarjetas de 12 GB o mas (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 5070) mediante llama.cpp u Ollama, sin depender de servicios en la nube.
- Asistentes de texto en portatiles Apple Silicon: con 11,18 GB de memoria unificada y aceleracion Metal en las 40 capas, es viable en equipos M1/M2/M3/M4 con 16 GB, lo que permite un asistente de escritura y resumen completamente offline.
- Prototipado rapido de aplicaciones conversacionales: el formato GGUF y las instrucciones de la model card para Ollama y llama.cpp permiten levantar un endpoint de chat local en minutos para validar prompts y flujos antes de migrar a infraestructura mayor.
- Procesamiento por lotes en CPU: con 13,18 GB de RAM libre y soporte AVX2/AVX-512, se puede ejecutar en servidores sin GPU para tareas de generacion de texto no interactivas, aceptando la ventana reducida de 4.096 tokens.
- Educacion e investigacion en entornos con recursos limitados: sirve para experimentar con un modelo de 24B en laboratorios o aulas donde no hay acceso a A100/H100, a costa de la perdida de calidad asociada a Q3_K_M.
- Evaluacion comparativa de cuantizaciones: util como referencia para medir el impacto real de Q3_K_M frente a otros esquemas (Q4_K_M, Q5_K_M) sobre el mismo modelo base en tareas concretas del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye unicamente una matriz de telemetria interna del motor run-any-model, que no constituye una evaluacion de calidad del modelo:

| Metrica | FP16 (base) | Q3_K_M (artefacto) | Variacion |
|---|---|---|---|
| Precision de bits | 16,0 bits/param | 3,5 bits/param | -78,1 % |
| Tamano de pesos | 47,13 GB | 10,31 GB | -78,1 % |
| Buffer KV cache | 800 MB (FP16) | 800 MB (FP16) | sin cambio |
| RAM residente total | 48,00 GB | 11,18 GB | -76,7 % |
| Calidad estimada | 100,0 % (base) | 91,0 % retenida | -9,0 % |
| Capas aceleradas | 0 % | 40/40 | optimo |

No se aportan datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, ni latencia ni throughput medidos de forma reproducible.

## Requisitos de hardware

- VRAM estimada: 11,81 GB de VRAM dedicada en GPUs NVIDIA (series RTX 30/40/50), segun la model card.
- Memoria unificada en Apple Silicon: 11,18 GB (M1/M2/M3/M4/M5), con aceleracion Metal en las 40 capas.
- CPU: 13,18 GB de RAM libre, con soporte AVX2/AVX-512.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas de VRAM; en tarjetas de 8 GB no cabe con la ventana de contexto documentada.
- Opciones de despliegue: llama.cpp (llama-cli con -ngl 99 -cnv), Ollama (mediante Modelfile), run-any-model CLI, LM Studio, Jan y Text-Generation-WebUI.
- Contexto operativo: 8.192 tokens en GPU y Apple Silicon; 4.096 tokens en CPU.
- Latencia y throughput: no disponibles; la model card no publica mediciones reproducibles de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-Mistral-Small-24B-Instruct-2501-GGUF (Q3_K_M) | 24,10 B | no disponible (operativo 8.192/4.096) | GGUF | Apache 2.0 | Hugging Face, 0 descargas |
| mistralai/Mistral-Small-24B-Instruct-2501 (FP16) | 24,10 B | no disponible en esta ficha | safetensors | Apache 2.0 | Hugging Face (modelo base) |
| Otras cuantizaciones GGUF del mismo modelo base (Q4_K_M, Q5_K_M) | 24,10 B | no disponible | GGUF | Apache 2.0 | no disponible en la informacion proporcionada |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada; la unica comparacion documentada es la de tamano y memoria de la tabla de telemetria (47,13 GB FP16 frente a 10,31 GB Q3_K_M).

## Limitaciones y advertencias

- Perdida de calidad por cuantizacion: Q3_K_M es un esquema agresivo (3,5 bits por peso); el autor estima una retencion del 91,0 %, sin metodologia publicada, por lo que la degradacion real en tareas de razonamiento, codigo o matematicas puede ser mayor.
- Riesgo de alucinacion: inherente al modelo base; la cuantizacion puede amplificarlo en tareas que requieren precision numerica o factual.
- Idiomas no documentados: el campo de idiomas esta vacio y la model card no especifica cobertura linguistica; no se puede asumir un rendimiento uniforme en castellano.
- Contexto operativo limitado: las ventanas de 8.192 y 4.096 tokens son limites de despliegue documentados, no el contexto nativo del modelo base, que no se especifica.
- Licencia: Apache 2.0 permite uso comercial, pero el artefacto se distribuye "AS IS" y el autor declina toda responsabilidad sobre los resultados de inferencia; el implementador debe auditar las salidas.
- Madurez del artefacto: 0 descargas y 0 likes, creado y actualizado el mismo dia (25 de noviembre de 2026), sin validacion comunitaria ni evaluaciones independientes.
- Dependencia de terceros: la calidad final depende del modelo base de Mistral AI y del pipeline de cuantizacion run-any-model, no verificados en esta ficha.
- Ausencia de soporte documentado de tool calling, agentes o modo thinking: no se debe asumir su disponibilidad en produccion sin pruebas propias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-Mistral-Small-24B-Instruct-2501-GGUF
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-24B-Instruct-2501
- Organizacion ONIX: https://huggingface.co/ONIX
- Motor de cuantizacion run-any-model: https://github.com/PranilShah-08/run-any-model
