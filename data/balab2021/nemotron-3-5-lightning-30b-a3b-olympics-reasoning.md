# Balab2021/Nemotron-3.5-Lightning-30B-A3B-Olympics-Reasoning

then "Final answer:".

Capacidades: reasoning over tables, arithmetic on Olympics athlete-events data, thinking mode, instruction following, agentic (inherited), multilingual (inherited per base). Tool calling: no disponible/no documentado.

Casos de uso: 6+.

Benchmarks table.

Hardware bullets.

Comparativa table.

Limitaciones.

Enlaces.

Write it out.## Resumen

Nemotron-3.5-Lightning-30B-A3B-Olympics-Reasoning es un ajuste fino supervisado de parametros completos (SFT full-parameter) sobre el modelo base nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16, publicado por el usuario Balab2021. El objetivo es especializar un modelo de razonamiento generalista en la resolucion de preguntas analiticas y aritmeticas sobre tablas de datos historicos de atletas y pruebas de los Juegos Olimpicos (120 anos de registros). El repositorio tiene 31.577.937.344 parametros totales (31,6 B) y emplea la denominacion A3B, que indica aproximadamente 3.000 millones de parametros activos por token; el tamano del repo es de 65,8 GB.

La relevancia de esta ficha es doble. Por un lado, muestra un caso practico de destilacion por auto-muestreo con rechazo (rejection-sampling self-distillation): las trazas de razonamiento se generaron con el propio modelo base servido con NVIDIA Dynamo sobre backend SGLang, conservando unicamente la traza mas corta cuya respuesta coincidia exactamente con la respuesta dorada. Por otro, ilustra un flujo de entrenamiento de escala industrial con Megatron-Bridge (NeMo 26.08.01) sobre nodos NVIDIA GB200 NVL72 y el dispatcher HybridEP para capas MoE.

Se trata de un modelo derivado de uso acotado: resuelve muy bien su dominio (tablas olimpicas) y hereda las capacidades generales del base, pero no es un modelo de proposito general y cuenta con cero descargas y cero likes en el momento de la consulta, sin validacion externa independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con capas MoE y Mamba-2 intercaladas mas capas de atencion selectivas (arquitectura nemotron_h del modelo base) |
| Parametros totales | 31.577.937.344 (31,6 B) |
| Parametros activos | Aproximadamente 3 B por token (denominacion A3B del modelo base; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 en este repositorio (safetensors); NVIDIA publica una variante NVFP4 del modelo base; no se han publicado GGUF ni otros formatos para este ajuste |
| Idiomas soportados | no disponible en la model card del ajuste; segun la documentacion de NVIDIA para el modelo base: ingles y lenguajes de programacion como uso previsto, y soporte adicional de espanol, frances, aleman, italiano y japones |
| Licencia | nvidia-open-model-license (campo `license: other` en la model card) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura hibrida de mezcla de expertos (MoE) que intercala capas Mamba-2 y capas MoE, junto con capas de atencion selectivas, segun la documentacion de NVIDIA. Este ajuste conserva dicha arquitectura y somete los 31,6 B de parametros a un entrenamiento supervisado de parametros completos, sin adaptadores de bajo rango. El entrenamiento se ejecuto con Megatron-Bridge (NeMo 26.08.01) sobre nodos NVIDIA GB200 NVL72, empleando el dispatcher HybridEP para el enrutado de expertos.

El conjunto de datos es Balab2021/Olympics-Reasoning-Nemotron-3.5-Lightning, con 227.051 filas del split de entrenamiento (instantanea con una cobertura del 99,575 % de las filas fuente) y una sola epoca. Cada fila contiene una traza de razonamiento paso a paso verificada sobre tablas de atletas y pruebas olimpicas, una por fila de origen. Las trazas se destilaron del propio modelo base mediante muestreo con rechazo: se generaban candidatas servidas con NVIDIA Dynamo sobre backend SGLang y se conservaba la traza mas corta cuya respuesta final coincidia exactamente con la respuesta dorada. El turno de asistente se entrena en el formato nativo de razonamiento de Nemotron: bloque `<think>...</think>` seguido de `Final answer: <answer>`. No se documenta en la informacion disponible el uso de RLHF ni de DPO.

## Capacidades

- Razonamiento paso a paso sobre tablas: interroga y agrega datos tabulares de atletas y eventos olimpicos antes de emitir una respuesta final.
- Aritmetica y agregacion: calculos de medallas, recuentos, maximos, comparaciones y derivaciones similares sobre registros historicos.
- Modo de pensamiento explicito: activable con `enable_thinking=True`, con la respuesta final aislada en la linea `Final answer: <answer>`.
- Seguimiento de instrucciones: el sistema se entreno con un prompt de sistema fijo de analista de datos deportivos que restringe el uso a la tabla proporcionada.
- Generacion de texto general y conversacion: heredada del modelo base al ser un ajuste de parametros completos.
- Razonamiento multietapa: la estructura de la traza favorece la descomposicion de preguntas analiticas en pasos verificables.
- Capacidades multilingues: no documentadas para el ajuste; segun NVIDIA, el base cubre ingles, lenguajes de codigo y, de forma adicional, espanol, frances, aleman, italiano y japones.
- Tool calling / function calling: no documentado en la informacion disponible para este ajuste.
- Vision y audio: no disponibles, el modelo es exclusivamente de texto.

## Casos de uso

- Analisis de estadisticas olimpicas historicas: el modelo puede responder preguntas como el recuento de medallas por pais, atleta o disciplina a lo largo de 120 anos de registros, trabajando directamente sobre la tabla suministrada en el contexto.
- Cuadros de mando deportivos internos: integrado en una herramienta que inyecte la tabla de resultados como contexto y formule preguntas en lenguaje natural, el modelo devuelve la cifra con la traza de calculo para auditoria.
- Generacion de informes periodisticos con datos verificables: al emitir el razonamiento antes de la respuesta, un editor puede revisar la cadena de calculo y detectar errores antes de publicar la cifra.
- Validacion de respuestas de otros modelos: se puede usar como verificador de agregaciones aritmeticas sobre tablas deportivas, comparando su traza con la salida de un modelo generalista.
- Evaluacion de tecnicas de destilacion: sirve como caso de estudio reproducible de rejection-sampling self-distillation con el propio modelo como profesor, util para equipos que quieran replicar el pipeline con otros dominios tabulares.
- Base para especializacion en dominios tabulares adyacentes: el repositorio hermano Nemotron-3.5-Lightning-30B-A3B-Cricket-Reasoning demuestra que el mismo flujo se traslada a otros conjuntos de datos tabulares (cricket T20) con 458.000 trazas.
- Fine-tuning posterior con adaptadores: existe la variante Balab2021/Nemotron-3.5-Lightning-30B-A3B-LoRA, que puede servir como punto de partida para ajustes mas ligeros sobre la misma base.

## Benchmarks y rendimiento

Los unicos resultados publicados son los del autor en la model card, comparando el modelo ajustado con el modelo base. Se reproduce la tabla sin modificaciones.

| Benchmark | Metrica | Modelo base | Modelo ajustado |
|---|---|---|---|
| Row benchmark (23.861 preguntas, atletas reservados) | pass@1 | 92,0 % | 92,35 % |
| Row benchmark (23.861 preguntas, atletas reservados) | Tokens medios | 2.209 | 1.951 |
| Row benchmark (23.861 preguntas, atletas reservados) | Truncadas | 3,02 % | 2,23 % |
| Table benchmark (550 preguntas) | pass@1 | 93,98 % | 93,05 % |
| Table benchmark (550 preguntas) | Tokens medios | 2.467 | 2.529 |
| Table benchmark (550 preguntas) | Truncadas | 4,59 % | 5,32 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible para este ajuste. Los benchmarks anteriores son especificos del dominio y no son comparables con evaluaciones generalistas.

## Requisitos de hardware

- Pesos en BF16: 31,6 B de parametros implican aproximadamente 63 GB solo en pesos, sin contar cache KV ni activaciones; el repositorio ocupa 65,8 GB. Se necesita al menos una GPU de 80 GB (A100 80 GB, H100 80 GB, H200) para inferencia en BF16 con margen limitado.
- Cuantizacion: en 8 bits los pesos bajan a aproximadamente 32 GB y en 4 bits a aproximadamente 16-18 GB, lo que permitiria ejecucion en una RTX 4090 (24 GB) o RTX 5090 con cuantizacion agresiva, siempre que exista una conversion compatible; no se ha publicado una version GGUF de este ajuste.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para BF16; configuraciones multi-GPU (2x A100 40 GB o superior) si se quiere contexto amplio con cache KV grande. NVIDIA documenta la variante NVFP4 del modelo base, pensada para aceleracion en hardware Blackwell.
- Consumer GPU: no cabe en BF16 en ninguna GPU de consumo. Solo seria viable en tarjetas de 24 GB o mas mediante cuantizacion de 4 bits, no disponible oficialmente en este repositorio.
- Opciones de despliegue: la model card indica compatibilidad con vLLM, SGLang, NVIDIA Dynamo y Transformers. El autor entreno y evaluo usando Dynamo con backend SGLang. Ollama y llama.cpp no estan documentados para este ajuste.
- Parametros de muestreo recomendados: temperatura 1,0, top_p 0,95 y `enable_thinking=True`.
- Latencia y throughput: no disponibles. La activacion de solo aproximadamente 3 B de parametros por token reduce el coste de computo frente a un modelo denso de 31,6 B, pero no se publican mediciones concretas.
- Hardware de entrenamiento de referencia: NVIDIA GB200 NVL72, lo que indica que un reentrenamiento completo de parametros esta fuera del alcance de equipos con hardware convencional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3.5-Lightning-30B-A3B-Olympics-Reasoning (este) | 31,6 B totales, ~3 B activos | no disponible | Row benchmark 92,35 % pass@1; table benchmark 93,05 % pass@1 | nvidia-open-model-license | Hugging Face, 0 descargas |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 (base) | 31,6 B totales, ~3 B activos | no disponible | Row benchmark 92,0 % pass@1; table benchmark 93,98 % pass@1 | nvidia-open-model-license | Hugging Face y NVIDIA NIM |
| Balab2021/Nemotron-3.5-Lightning-30B-A3B-Cricket-Reasoning | 31,6 B totales, ~3 B activos (misma base) | no disponible | no disponible | nvidia-open-model-license | Hugging Face |
| Balab2021/Nemotron-3.5-Lightning-30B-A3B-LoRA | Adaptador LoRA sobre la misma base | no disponible | no disponible | nvidia-open-model-license | Hugging Face |

No se dispone de datos de benchmarks comparables con modelos de otros fabricantes de tamano similar dentro de la informacion proporcionada, por lo que no se incluye una comparacion cruzada.

## Limitaciones y advertencias

- Especializacion estrecha: el ajuste esta orientado a tablas de atletas y eventos olimpicos. Fuera de ese dominio cabe esperar un rendimiento cercano al del modelo base, no mejorado.
- Prompt de sistema acoplado: el entrenamiento uso un prompt de sistema concreto ("You are a sports data analyst...") y un formato de respuesta fijo. Desviarse de ese formato puede degradar la calidad de la traza y el parseo de `Final answer:`.
- Regresion en el table benchmark: el pass@1 baja de 93,98 % a 93,05 % y las respuestas truncadas suben de 4,59 % a 5,32 %, con un aumento de tokens medios. El ajuste no mejora uniformemente sobre el base.
- Riesgo de alucinacion: aunque el prompt de sistema restringe la respuesta a la tabla dada, sigue siendo un modelo generativo y puede producir cifras plausibles pero incorrectas, especialmente si la tabla se trunca o si la pregunta exige agregaciones que superan la ventana de contexto.
- Longitud de contexto desconocida: no se publica la ventana de contexto en la model card, lo que dificulta dimensionar el cache KV y planificar tablas grandes. El porcentaje de respuestas truncadas sugiere presion de contexto en las evaluaciones del autor.
- Idiomas: no hay datos de evaluacion multilingue para el ajuste; el dominio de entrenamiento es tabular y presumiblemente en ingles.
- Licencia: se hereda la nvidia-open-model-license, que no es una licencia de codigo abierto estandar. Es imprescindible revisar sus terminos antes de cualquier uso comercial o redistribucion.
- Sin validacion externa: cero descargas y cero likes en el momento de la consulta, sin evaluaciones independientes ni replicaciones publicas.
- Datos de identidad de la publicacion: la fecha de creacion registrada es 2026-10-09 y la de actualizacion 2026-10-09, con menos de dos minutos de diferencia, lo que indica una publicacion sin iteraciones posteriores.
- Modelo derivado: al ser un ajuste de parametros completos, puede haber perdido parte de las capacidades generales del base; no se aportan mediciones que lo confirmen o descarten.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Balab2021/Nemotron-3.5-Lightning-30B-A3B-Olympics-Reasoning
- Dataset de entrenamiento: https://huggingface.co/datasets/Balab2021/Olympics-Reasoning-Nemotron-3.5-Lightning
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Variante hermana de cricket: https://huggingface.co/Balab2021/Nemotron-3.5-Lightning-30B-A3B-Cricket-Reasoning
- Variante LoRA: https://huggingface.co/Balab2021/Nemotron-3.5-Lightning-30B-A3B-LoRA
- Model card del modelo base en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard
- Referencia de API del modelo base en NVIDIA: https://docs.api.nvidia.com/nim/reference/nvidia-nemotron-3-5-lightning-30b-a3b
