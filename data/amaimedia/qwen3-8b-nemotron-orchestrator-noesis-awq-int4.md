# AMAImedia/Qwen3-8B-Nemotron-Orchestrator-NOESIS-AWQ-INT4

## Resumen

Este modelo es una cuantización AWQ INT4 del modelo `nvidia/Nemotron-Orchestrator-8B`, una variante de Qwen3-8B especializada en orquestación de herramientas y modelos, desarrollada por NVIDIA y la Universidad de Hong Kong en el marco del proyecto ToolOrchestra. La versión cuantizada ha sido publicada por AMAImedia como parte de su plataforma NOESIS de automatización de doblaje multilingüe, con el objetivo de permitir la ejecución de este modelo de orquestación en hardware de consumo con solo 6 GB de VRAM.

El modelo base es un transformer decoder-only denso de aproximadamente 8,19 mil millones de parámetros, entrenado para planificar y ejecutar tareas multi-paso mediante llamadas a herramientas. La cuantización AWQ INT4 reduce el peso en disco de unos 32 GB (FP32) a aproximadamente 4,5 GB, y la VRAM necesaria para inferencia a unos 5 GB, haciéndolo viable en GPUs como la RTX 3060 de 6 GB. La relevancia actual radica en que democratiza el acceso a un modelo de orquestación de alto nivel para investigación y desarrollo, sin necesidad de infraestructura de servidor.

La licencia es la NVIDIA Open Model License, que restringe su uso a fines de investigación y desarrollo, por lo que no es apto para despliegues comerciales sin autorización expresa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (basado en Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | AWQ INT4 (group_size=128, GEMM, zero_point=True); existe companion BF16 |
| Idiomas soportados | Ingles |
| Licencia | NVIDIA Open Model License (uso solo investigacion y desarrollo) |
| Formato de pesos | Safetensors (AWQ INT4 y BF16) |

## Arquitectura y entrenamiento

El modelo base `Nemotron-Orchestrator-8B` parte de la arquitectura de Qwen3-8B, un transformer decoder-only denso (no MoE) con 151.936 tokens de vocabulario. Segun la model card, el entrenamiento del base se realizo con los datasets ToolScale y GeneralThought-430K, orientados a la orquestacion de herramientas y al razonamiento general. No se especifica si se aplicaron tecnicas de RLHF o DPO.

La cuantizacion AWQ INT4 fue realizada por AMAImedia con AutoAWQ 0.2.9, calibrando el modelo con 128 prompts internos de orquestacion y tool-calling (max_seq_len=512) y una semilla RNG fija (1729) para reproducibilidad. Se eligio el kernel GEMM para compatibilidad directa con `transformers` y `vLLM` en hosts Windows, sin necesidad de CPU offload. El modelo se publica como parte del framework DHCF-FNO de la plataforma NOESIS, donde actua como "teacher" de orquestacion en ingles durante la destilacion de conocimiento hacia un especialista mas pequeno (M9-ORCH-4B).

## Capacidades

- Orquestacion de herramientas: planifica y ejecuta secuencias de llamadas a funciones o APIs para resolver tareas complejas.
- Razonamiento multi-paso: descompone problemas en subtareas y las coordina de forma logica.
- Generacion de texto general: mantiene las capacidades de Qwen3-8B para redaccion, resumen y dialogo.
- Integracion con frameworks: compatible con `transformers` y `vLLM` mediante AutoAWQ, y con `text-generation-inference` (segun tags).
- Uso como teacher en destilacion: disenado para generar logits de alta calidad (top-K=512, temperatura=4.0) en el flujo NOESIS.
- No se documentan capacidades de vision, audio ni modo thinking explicito.

## Casos de uso

- Automatizacion de flujos de trabajo con herramientas: el modelo puede coordinar llamadas a APIs, bases de datos o servicios externos para ejecutar tareas como busqueda de informacion, generacion de informes o actualizacion de registros, gracias a su entrenamiento especifico en tool-calling.
- Asistentes de investigacion: dado un objetivo de busqueda, el modelo descompone la tarea en pasos (consultar papers, resumir, comparar) y utiliza herramientas de busqueda o recuperacion de forma secuencial.
- Generacion de codigo asistida por herramientas: puede invocar funciones de analisis estatico, ejecucion de tests o repositorios de codigo para validar y completar fragmentos, integrandose en pipelines de desarrollo.
- Atencion al cliente automatizada: con su capacidad de razonamiento multi-paso y llamada a sistemas de ticketing o CRM, puede gestionar conversaciones complejas que requieren consultar multiples fuentes de datos.
- Destilacion de modelos: en el contexto NOESIS, se usa como profesor para entrenar modelos mas pequenos en tareas de orquestacion, aprovechando su salida de logits ponderada.
- Prototipado de agentes: desarrolladores pueden construir agentes de IA que planifiquen y ejecuten acciones en entornos simulados, gracias a la compatibilidad con vLLM y transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos de orquestacion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,0 GB en cuantizacion AWQ INT4, con el modelo completamente residente en una GPU de 6 GB.
- GPU recomendadas: RTX 3060 6 GB (objetivo principal), tambien compatible con RTX 2060 6 GB, RTX 4060 8 GB, GTX 1660 Super 6 GB y cualquier GPU con al menos 6 GB de VRAM.
- No requiere CPU offload si se usa el kernel GEMM con `device_map={"": 0}`.
- Opciones de despliegue: AutoAWQ con `transformers`, `vLLM`, y `text-generation-inference` (segun tags). No se menciona compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|
| AMAImedia/Qwen3-8B-Nemotron-Orchestrator-NOESIS-AWQ-INT4 | 8.190.735.360 | No disponible | NVIDIA Open Model License (solo investigacion) | Orquestacion de herramientas, cuantizado para consumer GPU |
| nvidia/Nemotron-Orchestrator-8B (base) | No disponible | No disponible | NVIDIA Open Model License | Orquestacion de herramientas, precision FP32 |
| Qwen3-8B (modelo base subyacente) | No disponible | No disponible | No disponible | Generacion de texto general |

No se dispone de datos de rendimiento comparativos. Se recomienda evaluar el modelo en tareas especificas de orquestacion frente a alternativas como el propio Qwen3-8B o modelos de tamano similar con capacidades de tool-calling, aunque no se han publicado metricas en la informacion disponible.

## Limitaciones y advertencias

- Licencia restrictiva: la NVIDIA Open Model License limita el uso a investigacion y desarrollo; no esta permitido el uso comercial sin autorizacion explicita de NVIDIA.
- Idioma unico: el modelo solo soporta ingles, lo que limita su aplicacion en entornos multilingues.
- Cuantizacion: la conversion a INT4 puede degradar ligeramente la precision en tareas de razonamiento complejo en comparacion con la version BF16 o FP32.
- Contexto no documentado: no se ha especificado la longitud de contexto soportada, lo que dificulta planificar tareas que requieran ventanas largas.
- Sesgos y alucinaciones: no se han publicado estudios de sesgos ni evaluaciones de robustez; como modelo de orquestacion, puede generar llamadas a herramientas incorrectas si recibe prompts ambiguos.
- Dependencia del calibrado: la cuantizacion se calibro con 128 prompts de orquestacion, por lo que su rendimiento en otros dominios (por ejemplo, creatividad o codigo puro) puede no estar optimizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AMAImedia/Qwen3-8B-Nemotron-Orchestrator-NOESIS-AWQ-INT4
- Modelo base: https://huggingface.co/nvidia/Nemotron-Orchestrator-8B
- Companion BF16: https://huggingface.co/amaimedia/Nemotron-Orchestrator-8B-Qwen3-BF16-NOESIS
- Paper ToolOrchestra (arXiv 2511.21689): https://arxiv.org/abs/2511.21689
- Sitio web de AMAImedia: https://www.amaimedia.com
