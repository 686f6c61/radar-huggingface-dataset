# prithivMLmods/Domyn-Edge-SFT-GGUF

## Resumen

Domyn-Edge-SFT-GGUF es la distribucion en formato GGUF del modelo Domyn-Edge-SFT, un modelo denso de 4B parametros (3.928.787.968 exactamente) desarrollado por Domyn. Se trata de la primera etapa de post-entrenamiento del protocolo Multi-Teacher On-Policy Distillation (MOPD) de Domyn, aplicada mediante supervised fine-tuning sobre Domyn-Edge-Base, un modelo pre-entrenado desde cero con 13 billones de tokens sobre infraestructura publica europea. Esta version GGUF la publica el usuario prithivMLmods y esta pensada para inferencia local con llama.cpp y ecosistemas compatibles.

El modelo esta orientado a razonamiento y uso agentico: incorpora un bloque de razonamiento `<think>` activable, soporte de tool calling multi-turno sobre aproximadamente 200 herramientas reales y una ventana de contexto recomendada de 256k tokens que puede extenderse hasta 512k. Cubre 13 idiomas, con ingles, italiano, espanol, frances y aleman a la cabeza, y se distribuye bajo licencia Apache 2.0.

Su relevancia actual radica en dos factores: por un lado, el modelo base se publica de forma completamente abierta (pesos, codigo de entrenamiento Domyn Forge, datos de pre-entrenamiento y checkpoints intermedios), lo que facilita la reproducibilidad y el fine-tuning posterior; por otro, esta version GGUF permite ejecutar un modelo de contexto largo y capacidades agenticas en hardware de consumo, con la cuantizacion Q4_K_M ocupando apenas 2,42 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (detalles de capas y atencion no disponibles) |
| Parametros totales | 3.928.787.968 (aproximadamente 4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256k recomendada; extensible hasta 512k |
| Tipos de cuantizacion | BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K, Q8_0 |
| Idiomas soportados | en, it, es, fr, de, pt, ru, zh, ja, ar, nl, id, tr (13 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo con 29,7 GB de tamano total); pesos originales del modelo base presumiblemente en safetensors, no confirmado en la informacion disponible |

## Arquitectura y entrenamiento

Domyn-Edge-SFT es un transformer denso de aproximadamente 4B parametros construido sobre Domyn-Edge-Base, pre-entrenado desde cero con 13 billones de tokens sobre infraestructura publica europea. El post-entrenamiento consiste en supervised fine-tuning (SFT) sin refuerzo ni optimizacion de preferencias en esta etapa, lo que lo situa como el primer paso del protocolo MOPD (Multi-Teacher On-Policy Distillation) de Domyn. El entrenamiento se realizo en tres fases progresivas de extension de contexto (64k, 128k y 512k) sobre mas de 315 mil millones de tokens, con datos de matematicas, codigo, tool calling multi-turno sobre aproximadamente 200 herramientas reales y question answering sobre documentos largos.

La innovacion mas destacable es la combinacion de contexto extremadamente largo (hasta 512k, con 256k como ventana de trabajo recomendada) en un modelo de solo 4B parametros, junto con un bloque de razonamiento `<think>` activable por defecto y un enfasis explicito en capacidades agenticas. La publicacion completa del pipeline (codigo Domyn Forge, datos de pre-entrenamiento y checkpoints intermedios) es un rasgo poco habitual que facilita la investigacion reproducible.

## Capacidades

- Generacion de texto y razonamiento con bloque `<think>` activable, lo que permite separar el razonamiento interno de la respuesta final.
- Razonamiento matematico de competicion: el autor reporta AIME 2026 con 96,7 pass@16.
- Generacion de codigo: el autor reporta MBPP con 96,6 pass@4.
- Tool calling y function calling multi-turno, entrenado sobre aproximadamente 200 herramientas reales.
- Capacidades agenticas y razonamiento multi-paso orientadas a flujos con herramientas.
- Question answering sobre documentos largos gracias a la ventana de contexto extendida.
- Soporte multilingue en 13 idiomas (en, it, es, fr, de, pt, ru, zh, ja, ar, nl, id, tr).
- Formato conversacional y compatibilidad con text-generation-inference y llama-cpp.
- No se mencionan capacidades de vision ni audio en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno con historial extenso gracias a su ventana de 256k tokens recomendada, evitando truncar el contexto en sesiones largas.
- Generacion de codigo en produccion: con soporte de tool calling y buenos resultados reportados en MBPP, puede integrarse en pipelines que invocan linters, compiladores o APIs de CI/CD como herramientas.
- Agentes autonomos con herramientas: al estar entrenado sobre aproximadamente 200 herramientas reales, encaja en orquestadores de agentes que requieren seleccion de herramienta y razonamiento multi-paso.
- Analisis de documentos largos: informes, contratos o expedientes de cientos de miles de tokens pueden procesarse en una sola pasada con la ventana extendida hasta 512k.
- Asistente de razonamiento matematico: util para tutoria o resolucion de problemas de competicion, con el bloque `<think>` para mostrar el proceso.
- Despliegue en edge y portatiles: las cuantizaciones Q3 y Q4 (entre 2 y 2,42 GB) permiten ejecucion local en equipos con poca RAM o VRAM, ideal para prototipos y entornos sin GPU dedicada.
- Investigacion y fine-tuning reproducible: al liberarse codigo, datos y checkpoints del modelo base, sirve como punto de partida para experimentos de post-entrenamiento.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card:

| Benchmark | Metrica | Resultado |
|---|---|---|
| AIME 2026 | pass@16 | 96,7 |
| MBPP | pass@4 | 96,6 |

Rendimiento de inferencia medido por el autor con Q5_K_S en una NVIDIA RTX PRO 6000 Blackwell (96 GB VRAM), llama-cli, contexto de 16.384 tokens, KV cache q8_0 y 99 capas offloaded:

| Metrica | Valor |
|---|---|
| Velocidad media de procesamiento de prompt | 1.182,63 tokens/s |
| Velocidad media de generacion | 252,55 tokens/s |
| Tiempo total de ejecucion | 44,5 s |
| VRAM pico | 4,54 GiB |
| Uso pico de GPU | 91% |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en MMLU, GSM8K u otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: BF16 aproximadamente 7,87 GB; Q8_0 4,18 GB; Q6_K 3,23 GB; Q5_K_M 2,81 GB; Q5_K_S 2,75 GB; Q4_K_M 2,42 GB; Q4_K_S 2,31 GB; Q3_K_L 2,16 GB; Q3_K_M 2 GB.
- La VRAM real debe sumar el KV cache, que crece con el contexto; con 16k de contexto y cache q8_0 el autor midio 4,54 GiB pico con Q5_K_S.
- GPU recomendadas: RTX PRO 6000 Blackwell (medida por el autor), A100, H100 para contextos muy largos; RTX 4090 y GPUs consumer de 8-24 GB suficientes para cuantizaciones Q4-Q8 con contextos moderados.
- Cabe en GPU consumer: si, las cuantizaciones Q3 y Q4 caben en GPUs de 4-8 GB; Q5-Q8 en GPUs de 8-16 GB.
- Opciones de despliegue: llama.cpp (probado por el autor), Ollama, text-generation-inference y ecosistemas compatibles con GGUF; el modelo base tambien es compatible con transformers.
- Latencia y throughput: 252,55 tokens/s de generacion y 1.182,63 tokens/s de procesamiento de prompt en el hardware medido; no hay datos para otras configuraciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Domyn-Edge-SFT | ~4B denso | 256k (hasta 512k) | Apache 2.0 | GGUF, transformers | Enfasis agentico y tool calling; datos y codigo abiertos |
| Qwen2.5-3B / 7B | 3B / 7B denso | 32k-128k | Apache 2.0 | safetensors, GGUF | Referencia habitual en su tamano; contexto menor |
| Llama 3.2 3B | 3B denso | 128k | Llama 3.2 Community License | safetensors, GGUF | Licencia no plenamente permisiva para todos los usos |
| Phi-3.5-mini | 3,8B denso | 128k | MIT | safetensors, GGUF | Tamano comparable; sin enfoque agentico declarado |

Los datos de rendimiento de los modelos alternativos no se incluyen en la informacion proporcionada; la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Es una etapa SFT sin RLHF ni optimizacion de preferencias: puede presentar respuestas menos alineadas o mas propensas a formatos no deseados que modelos post-entrenados con refuerzo.
- Riesgo de alucinacion inherente a modelos de este tamano, especialmente en contextos muy largos donde la recuperacion de informacion puede degradarse.
- Los benchmarks reportados (AIME, MBPP) provienen del autor y no se han verificado de forma independiente en la informacion disponible.
- El rendimiento de inferencia medido corresponde a un hardware concreto (RTX PRO 6000 Blackwell); el throughput en GPUs consumer sera considerablemente menor.
- La ventana de 512k es una extension maxima; la ventana de trabajo recomendada es 256k, y el rendimiento puede degradarse mas alla de ese umbral.
- La cobertura de 13 idiomas no implica calidad uniforme; el propio autor situa ingles, italiano, espanol, frances y aleman como idiomas principales.
- Licencia Apache 2.0 permisiva para uso comercial, pero conviene revisar los terminos del modelo base y de los datos de entrenamiento publicados.
- El repo GGUF tiene un unico like y cero descargas en el momento de la ficha, por lo que la validacion comunitaria es practicamente inexistente.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/prithivMLmods/Domyn-Edge-SFT-GGUF
- Modelo base: https://huggingface.co/domyn/Domyn-Edge-SFT
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del cuantizador: https://huggingface.co/prithivMLmods
