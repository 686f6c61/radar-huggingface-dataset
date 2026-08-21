# SamWang0405/Syncopate-AgenticRL

## Resumen

Syncopate-AgenticRL es un adaptador LoRA (r32) post-entrenado mediante aprendizaje por refuerzo agéntico asíncrono sobre el modelo base Qwen/Qwen3-4B. Lo desarrolla SamWang0405 (Chaoyu Wang), investigador especializado en post-entrenamiento de LLM y sistemas de inferencia, y está orientado a construir agentes de publicidad programática capaces de realizar llamadas a herramientas en conversaciones multi-turno. El repositorio aloja los pesos del adaptador PEFT, las bases SFT fusionadas y los artefactos de evaluación, mientras que el código de entrenamiento y los informes experimentales residen en GitHub.

El problema que resuelve es el de mejorar el rendimiento de agentes con tool-use mediante RL post-entrenamiento, cuantificando cuándo la sincronización asíncrona de pesos compensa frente a la síncrona. El entrenamiento se realizó con verl 0.8, FSDP(DDP) y vLLM 0.12 sobre 4×RTX 5090 sin P2P, empleando GRPO multi-turno. El adaptador candidato (step_100) mejora la puntuación de tarea en +0,186 (t≈16) frente al modelo SFT en una evaluación congelada de 343 casos. La relevancia actual radica en que demuestra un pipeline completo de RL agéntico asíncrono con mejoras medibles de throughput (2,31×) y reducción de latencia por paso de gradiente (−28 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen/Qwen3-4B) con adaptador LoRA r32 |
| Parametros totales | 4B (modelo base) + adaptador LoRA r32 (parametros del adaptador no especificados) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada; hereda la del modelo base Qwen3-4B |
| Tipos de cuantizacion | bf16 (entrenamiento y fusion), FP8 (KV cache en serving), FP4 (evaluado, descartado para 4B) |
| Idiomas soportados | zh (chino) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptadores PEFT LoRA y bases SFT fusionadas en bf16) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 aplicado sobre Qwen3-4B, un transformer denso de 4.000 millones de parametros. El post-entrenamiento combina una fase de SFT (cuyas versiones v13 y v13r2 se incluyen como bases fusionadas en el repositorio) seguida de un pipeline de RL agéntico asíncrono implementado con verl 0.8, utilizando GRPO multi-turno. El entrenamiento se ejecuto en 4×RTX 5090 sin interconexion P2P, con FSDP(DDP) para paralelismo y vLLM 0.12 para el rollout.

La innovacion principal es el esquema de sincronizacion asincrona de pesos: en lugar de sincronizar los adaptadores LoRA en cada paso, se introduce un mecanismo de sincronizacion por frecuencia y umbral de obsolescencia (staleness). Los experimentos E14 muestran que la frecuencia de sincronizacion, y no el umbral, es el factor dominante en la perdida de throughput. Adicionalmente, se implementaron 14 optimizaciones de cableado (PrefixGrouper entre ellas) que lograron un aumento de 2,31× en el throughput end-to-end, y una reduccion de la carga de sincronizacion de pesos de 8,4 GB a 252 MiB (33×) mediante la correccion del empuje de adaptadores LoRA. El estudio tambien incluye un analisis de cuantizacion para serving: FP8 en KV cache incrementa la concurrencia un 50 %, mientras que FP4 en pesos degrada severamente el modelo de 4B.

## Capacidades

- Generacion de texto y razonamiento en chino, heredadas del modelo base Qwen3-4B.
- Llamada a herramientas (tool calling) en conversaciones multi-turno, optimizada mediante RL para agentes de publicidad programatica.
- Comportamiento agéntico con razonamiento multi-paso: el RL con GRPO multi-turno refuerza la capacidad de decidir que herramienta invocar y como interpretar sus resultados.
- Soporte de serving con LoRA en vLLM: el adaptador puede cargarse como modulo LoRA independiente sobre la base SFT fusionada.
- Cuantizacion FP8 para KV cache en inferencia, que permite aumentar la concurrencia un 50 % respecto a bf16.
- Capacidades multilingues limitadas: el modelo esta entrenado y evaluado exclusivamente en chino (zh).

## Casos de uso

- Gestion automatizada de campanas publicitarias: el agente puede recibir objetivos de campana, consultar inventario de anuncios, ajustar pujas y presupuestos mediante llamadas a herramientas, y reportar resultados en lenguaje natural, todo en conversaciones multi-turno.
- Optimizacion de pujas en tiempo real: el modelo decide dinamicamente que puja asignar a cada impresion basandose en datos historicos consultados via API, gracias a su capacidad de tool calling reforzada por RL.
- Asistente de marketing digital en chino: empresas que operan en el mercado chino pueden desplegar un agente que gestione campanas en plataformas como WeChat Ads o Douyin, consultando metricas y ajustando parametros de forma autonoma.
- Automatizacion de informes de rendimiento: el agente consulta multiples fuentes de datos (analitica web, CRM, plataformas publicitarias) y genera informes consolidados con recomendaciones accionables.
- Agente de atencion al cliente con acceso a herramientas: integrado en un sistema de soporte, el modelo puede consultar pedidos, gestionar devoluciones o actualizar registros de clientes mediante llamadas a APIs internas.
- Investigacion en RL agéntico: el repositorio sirve como referencia para equipos que quieran reproducir un pipeline de RL asincrono con LoRA, incluyendo los artefactos de evaluacion y los adaptadores de todas las ramas experimentales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los datos de rendimiento proporcionados se centran en metricas de entrenamiento y evaluacion de tarea agéntica:

| Metrica | Valor | Detalle |
|---|---|---|
| Puntuacion de tarea (candidato vs SFT) | +0,186 (t≈16) | Evaluacion congelada de 343 casos, par de comparacion congelado |
| Throughput de entrenamiento end-to-end | 2,31× | Con 14 optimizaciones de cableado (PrefixGrouper, etc.) |
| Latencia por paso de gradiente | 12,84 → 9,23 s/gstep (−28 %) | Ejecucion de capa con sincronizacion de frecuencia + CUDA graph |
| Sincronizacion de pesos | 8,4 GB → 252 MiB (33×), 0,97 s | Correccion del empuje de adaptadores LoRA |
| Concurrencia en serving con FP8 KV | +50 % | Frente a bf16 en KV cache |
| FP4 en pesos | Descartado | Degrada severamente el modelo de 4B |

## Requisitos de hardware

- Entrenamiento: 4×RTX 5090 (sin P2P), con FSDP(DDP) y vLLM 0.12 para rollout. No se especifica VRAM minima por GPU, pero 4×RTX 5090 (32 GB cada una) es la configuracion de referencia.
- Inferencia: al tratarse de un modelo de 4B con adaptador LoRA, cabe en GPUs de consumo como RTX 4090 (24 GB) o RTX 5090 (32 GB) con cuantizacion bf16 o FP8.
- Serving: compatible con vLLM mediante `--enable-lora` y `--lora-modules`, cargando la base SFT fusionada y el adaptador candidato por separado.
- Alternativas de despliegue: vLLM (recomendado por el autor), Hugging Face Transformers con PEFT para carga programatica. No se menciona compatibilidad con llama.cpp u Ollama.
- Latencia: no se proporcionan datos de latencia de inferencia; los unicos datos temporales son de entrenamiento (9,23 s/gstep tras optimizaciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Syncopate-AgenticRL (este) | 4B + LoRA r32 | No especificado | MIT | RL agéntico asincrono para tool-use en chino | Adaptador PEFT en HuggingFace |
| Qwen3-4B (base) | 4B | 32K (por defecto del modelo base) | Apache 2.0 | Modelo base generico | HuggingFace |
| Llama-3.2-3B | 3B | 128K | Llama 3.2 Community | Modelo base generico multilingue | HuggingFace |
| Phi-3.5-mini | 3,8B | 128K | MIT | Modelo compacto para razonamiento | HuggingFace |

La comparativa directa con alternativas de la misma categoria (agentes RL con tool-use sobre modelos de 4B) no esta disponible en la informacion proporcionada. La diferencia clave frente a los modelos base es el post-entrenamiento especifico para tool calling multi-turno en chino, con una licencia MIT que permite uso comercial sin restricciones.

## Limitaciones y advertencias

- El adaptador solo es valido sobre la base SFT fusionada correspondiente (registrada en `adapter_config.json`); aplicarlo sobre otra base invalida los resultados.
- La fusion en bf16 no es bit-reproducible: la re-fusion manual produce una desviacion maxima de 4,9e-4, mayor que la senal de RL (1,3e-5). Por ello, las bases fusionadas del repositorio son la unica referencia valida para evaluaciones pareadas.
- El modelo esta entrenado y evaluado exclusivamente en chino; no se garantiza rendimiento en otros idiomas.
- La cuantizacion FP4 en pesos degrada severamente el rendimiento del modelo de 4B y se descarto en el estudio.
- Riesgo de alucinacion: no se proporcionan datos especificos, pero al ser un modelo de 4B, es susceptible a errores factuales en contextos largos o dominios no cubiertos por el entrenamiento.
- Los benchmarks de tarea se basan en 343 casos congelados; no se han publicado resultados en benchmarks estandarizados (MMLU, HumanEval, etc.).
- El repositorio contiene 21,9 GB de pesos (bases SFT fusionadas y multiples adaptadores de ramas experimentales); la descarga completa es necesaria para reproducir las evaluaciones.

## Enlaces

- HuggingFace: https://huggingface.co/SamWang0405/Syncopate-AgenticRL
- GitHub (codigo, documentacion y artefactos de evaluacion): https://github.com/ChaoyuWang04/Syncopate_Async_AgenticRL
- Perfil del autor en HuggingFace: https://huggingface.co/SamWang0405
- Perfil del autor en GitHub: https://github.com/ChaoyuWang04/
