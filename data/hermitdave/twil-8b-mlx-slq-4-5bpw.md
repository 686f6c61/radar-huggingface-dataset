# hermitdave/TwIL-8B-MLX-slq-4.5bpw

## Resumen

TwIL-8B-MLX-slq-4.5bpw es una cuantizacion de precision mixta en formato MLX del modelo TwIL-8B (variante balanced), un modelo de razonamiento de la familia Granite desarrollado por webAI-Official y orientado a matematicas, codigo y seguimiento de instrucciones. La ha producido el usuario hermitdave mediante su pipeline SLQ (Structured Layer-wise Quantization), que asigna anchos de bit distintos a cada capa segun su sensibilidad medida con la matriz de Hessian.

El checkpoint resultante ocupa 5,937 GiB frente a los 16,38 GiB del original en BF16, una reduccion de 2,76 veces, con un presupuesto objetivo de 4,50 bits por peso y un valor conseguido de 4,4979 bpw. Esta pensado para ejecutarse en Apple Silicon a traves de mlx-lm, lo que permite desplegar un modelo de casi 10.000 millones de parametros en equipos con memoria unificada moderada.

La relevancia practica es doble: por un lado demuestra que las tecnicas de cuantizacion por capas con busqueda heuristica permiten conservar la fidelidad del modelo original en tareas genericas (recuperacion media del 102,19 % respecto a BF16 en una bateria zero-shot), y por otro lado ilustra las limitaciones del ecosistema, ya que la licencia del modelo base es no comercial y la validacion publicada no cubre las capacidades que justifican el modelo (matematicas y codigo).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (familia IBM Granite), 40 capas, hidden size 4096 |
| Parametros totales | 9.783.545.856 (8,79B segun la model card) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | SLQ mixed precision a 4,4979 bpw, group size 128; distribucion 8-bit (1 capa), 6-bit (81), 5-bit (114), 4-bit (84) |
| Idiomas soportados | no disponible |
| Licencia | other (webAI Non-Commercial License, heredada del modelo base) |
| Formato de pesos | safetensors en formato MLX (QuantizedLinear), repo de 6,4 GB |

## Arquitectura y entrenamiento

El modelo base es un decoder transformer denso de la familia Granite de IBM, con 40 capas, dimension oculta de 4096 y un vocabulario de 100.352 tokens. TwIL-8B (variante balanced) es un ajuste fino de webAI-Official orientado a razonamiento matematico, generacion de codigo y seguimiento de instrucciones. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion principal de este checkpoint es el pipeline SLQ: para cada capa se cuantiza con GPTQ a varios anchos candidatos (4, 5, 6 y 8 bits), se construye una base de datos de error relativo ponderado por Hessian y se asignan los bits de forma codiciosa hasta agotar el presupuesto de bpw. Los tensores de embedding y lm_head se mantienen en BF16. La busqueda de la etapa 3 fue puramente heuristica porque, con un vocabulario de 100.000 tokens, el bucle completo de validacion no cabe en 64 GB de memoria; en su lugar se valido mediante recuperacion zero-shot. No se requiere codigo personalizado: mlx-lm 0.32.2 o superior infiere los anchos de bit por capa a partir de la geometria de los tensores, y el campo `slq_bits` de config.json es solo metadato de procedencia.

## Capacidades

- Generacion de texto y razonamiento de proposito general, con enfasis declarado en matematicas y codigo.
- Seguimiento de instrucciones multi-turno (el modelo base se presenta como instruction-following).
- Razonamiento matematico y resolucion de problemas tipo competicion (capacidad declarada por el autor del modelo base, no verificada en esta cuantizacion).
- Generacion y comprension de codigo (capacidad declarada, no medida en la validacion publicada).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el vocabulario es amplio (100.352 tokens) pero no se documentan idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Asistente de razonamiento matematico en local: el modelo puede resolver problemas paso a paso en un Mac con memoria unificada suficiente, gracias a que la cuantizacion reduce el peso a 5,937 GiB y permite mantener el modelo residente en GPU integrada.
- Generacion de codigo en estaciones de trabajo Apple Silicon: integrable en editores y scripts mediante la API de mlx-lm, con la ventaja de no requerir conexion a servicios externos ni GPU dedicada.
- Prototipado e investigacion de tecnicas de cuantizacion: el checkpoint sirve como referencia reproducible del pipeline SLQ, con distribucion de bitwidths documentada y comparativa BF16 frente a cuantizado en cinco tareas.
- Evaluacion de fidelidad de cuantizaciones: util para investigadores que quieran medir la degradacion de un modelo de razonamiento al comprimirlo a 4,5 bpw antes de decidir si merece la pena un despliegue mayor.
- Procesamiento por lotes offline de tareas de instrucciones: al ejecutarse en local sin coste por token, es adecuado para clasificacion, reescritura o extraccion sobre volumenes moderados de texto.
- Educacion y demos tecnicas: permite mostrar en un portatil Apple el comportamiento de un modelo de 8,79B cuantizado, sin infraestructura cloud.
- Entorno de pruebas para pipelines de agentes: aunque no se documenta soporte explicito de tool calling, puede usarse como generador de borradores dentro de un orquestador que valide y ejecute las acciones por separado.

## Benchmarks y rendimiento

Validacion zero-shot de opcion multiple publicada por el autor, 100 ejemplos por tarea, comparando BF16 frente a este checkpoint SLQ:

| Tarea | BF16 | SLQ | Recuperacion |
|---|---:|---:|---:|
| arc_challenge | 0,5100 | 0,5200 | 1,0196 |
| arc_easy | 0,8000 | 0,7500 | 0,9375 |
| hellaswag | 0,4900 | 0,4800 | 0,9796 |
| winogrande | 0,5500 | 0,5700 | 1,0364 |
| mmlu | 0,4400 | 0,5000 | 1,1364 |
| Media | - | - | 1,0219 |

El umbral de "task-lossless" fijado por el autor es una recuperacion igual o superior a 0,99, y el checkpoint lo supera en la media de estas tareas genericas. No se han publicado resultados de MMLU completo, HumanEval, GSM8K ni otros benchmarks de razonamiento matematico o de codigo en la informacion disponible; el propio autor advierte que la muestra es de 100 ejemplos por tarea y que estas tareas no miden las capacidades para las que se construyo TwIL.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 5,937 GiB de pesos mas overhead de activaciones y cache KV; en la practica se recomienda un minimo de 8-10 GB de memoria disponible.
- Hardware objetivo: Apple Silicon con memoria unificada, dado que el formato es MLX; no es ejecutable directamente en CUDA sin conversion.
- Equipos compatibles: Mac con chip M1/M2/M3/M4 con 16 GB o mas de memoria unificada; en configuraciones de 8 GB el margen es muy ajustado.
- GPU dedicadas (A100, H100, RTX 4090): no aplicable en este formato; requeriria conversion a otro runtime.
- Despliegue: mlx-lm 0.32.2 o superior mediante `mlx_lm.load` y `mlx_lm.generate`; no se documentan opciones para vLLM, llama.cpp, Ollama ni TGI con estos pesos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| TwIL-8B-MLX-slq-4.5bpw | 9,78B (8,79B declarados) | no disponible | SLQ 4,4979 bpw | other (no comercial) | MLX safetensors |
| TwIL-8B (base, BF16) | 8,79B | no disponible | BF16 (16,38 GiB) | other (no comercial) | safetensors |
| Modelos Granite de IBM de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con alternativas de otros fabricantes en parametros, contexto y rendimiento dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no comercial: el modelo base lleva la webAI Non-Commercial License y esta cuantizacion la hereda; el uso local esta permitido, pero no el uso comercial.
- Validacion limitada: solo 100 ejemplos por tarea en cinco benchmarks genericos, con intervalos de confianza amplios, y sin medir matematicas ni codigo, que son las capacidades centrales del modelo.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; no se documentan evaluaciones de factualidad.
- Idiomas: no se especifican los idiomas soportados ni la calidad en castellano.
- Contexto: no se publica la longitud de contexto del modelo base, lo que impide planificar casos de uso con documentos largos.
- Formato restringido: al ser MLX, no se puede desplegar en infraestructura CUDA sin conversion previa, lo que limita su uso en servidores convencionales.
- Busqueda de bitwidths heuristica: la etapa 3 del pipeline no ejecuto el bucle completo de validacion por limitaciones de memoria, de modo que la asignacion de bits no esta validada de forma exhaustiva.
- Ecosistema minimo: cero descargas y cero likes en el momento de la consulta, sin pipeline declarado ni comunidad que respalde el checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hermitdave/TwIL-8B-MLX-slq-4.5bpw
- Modelo base: https://huggingface.co/webAI-Official/TwIL-8B
- Pipeline SLQ del autor: https://huggingface.co/hermitdave/rco-mlx
- Perfil del autor: https://huggingface.co/hermitdave
