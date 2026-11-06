# alwkala/Aton

## Resumen

Akhet-Aton-2B es un ajuste fino (finetune) y cuantizacion del modelo Qwen/Qwen3.5-2B desarrollado por Alwkala Digital Labs. Se presenta como un agente bilingue arabe/ingles de tipo "edge", disenado para ejecucion local en hardware modesto (portatiles, GPUs de menos de 3 GB de VRAM, CPUs e incluso nodos tipo Raspberry Pi). Forma parte del ecosistema AkhetRa, donde Aton representa la capa de "inteligencia operativa" y Akhet la de gobernanza.

El modelo hereda la arquitectura hibrida del Qwen3.5-2B (SSM estilo Mamba combinado con atencion intercalada) y anade una torre de vision CLIP opcional, lo que lo convierte en un modelo multimodal image-text-to-text con aproximadamente 2,23 mil millones de parametros totales. Su enfoque no es el razonamiento complejo ni la generacion enciclopedica, sino la determinismo en tareas estructuradas: extraccion de JSON, clasificacion, enrutamiento y tool calling.

La relevancia actual del modelo radica en su propuesta "local-first": cero telemetria, ejecucion air-gapped y un footprint de cuantizacion muy reducido (1,31 GB para el modelo de lenguaje en Q4_K_M). Se distribuye bajo licencia Apache-2.0 y esta pensado para despliegues de privacidad estricta y automatizacion de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida SSM (estilo Mamba) + atencion intercalada + torre de vision CLIP |
| Parametros totales | ~2 231 000 000 (~2,23 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Nativo base 262 144 tokens (256K); contexto de entrenamiento SFT 2 048 tokens; recomendado en ejecucion 8 192 a 32 768 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (modelo de lenguaje, 1,31 GB); F16 para el proyector de vision (668 MB) |
| Idiomas soportados | Arabe (ar), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); repositorio etiquetado con libreria transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, que emplea una arquitectura hibrida que combina capas de espacio de estados (SSM, estilo Mamba) con capas de atencion intercaladas, lo que reduce el coste computacional en contextos largos frente a un transformer denso convencional. Sobre esa base, Alwkala Digital Labs incorpora una torre de vision CLIP de aproximadamente 331 millones de parametros (frente a los ~1 900 millones del modelo de lenguaje), con resolucion de imagen de 768 x 768 pixeles y tamano de parche de 16 x 16. El vocabulario es de 248 320 tokens.

El ajuste fino se realizo mediante SFT con un contexto de entrenamiento de 2 048 tokens, muy inferior al contexto nativo base de 256K, lo que implica que el modelo conserva capacidad de ventana larga a nivel arquitectonico pero su comportamiento afinado esta calibrado para ventanas mas cortas. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO, por lo que esos datos deben considerarse no disponibles. El modelo incluye razonamiento nativo mediante cadena de pensamiento (`<think>...</think>`) y un formato nativo de tool calling basado en XML/JSON (`<tool_call>`, `<tool_response>`).

## Capacidades

- Generacion de texto conversacional bilingue arabe/ingles.
- Razonamiento nativo con modo de pensamiento (`<think>...</think>`).
- Tool calling / function calling con formato XML/JSON nativo (`<tool_call>`, `<tool_response>`).
- Capacidades de agente para enrutamiento, clasificacion y descomposicion de tareas.
- Extraccion y estructuración de datos en JSON estricto (facturas, recibos, CVs).
- Vision multimodal: procesamiento de imagenes a 768 x 768 pixeles con torre CLIP.
- Traduccion y correccion gramatical entre arabe e ingles.
- Generacion de comandos y llamadas a funciones para automatizacion (bash, Python).
- Descomposicion de consultas para sistemas RAG.
- Capacidad de ejecucion totalmente local y air-gapped, sin telemetria.

## Casos de uso

- Asistente de escritorio local: gestion de archivos, resumen de documentos y acciones de escritorio por voz o texto, con la ventaja de que los datos nunca abandonan la maquina (ejecucion air-gapped).
- Agente de triage y enrutamiento: ingesta de tickets de soporte o correos, extraccion de metadatos y despacho a APIs, aprovechando la clasificacion rapida y el bajo coste operativo del modelo de 2B.
- Parseo y estructuración de datos: conversion de facturas, recibos y CVs en arabe e ingles a JSON estricto, con alta conformidad estructural y baja tasa de alucinacion en tareas de extraccion.
- Orquestador de IoT y automatizacion: traduccion de lenguaje natural a comandos bash, Python o llamadas a funciones, con bajo consumo energetico para ejecucion persistente en Raspberry Pi u otros nodos edge.
- Generador de consultas para RAG: descomposicion de consultas complejas en una a tres busquedas vectoriales precisas, mejorando la precision del RAG sin gastar computo en LLMs grandes.
- Entrenamiento educativo offline: practica conversacional, correccion gramatical y traduccion bilingue en entornos con conectividad limitada, funcionando al 100 % sin conexion.
- Procesamiento multimodal local: analisis de imagenes (documentos escaneados, capturas) combinado con extraccion de texto estructurado gracias a la torre CLIP integrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index del autor declara la entrada "Akhet-Aton-2B" con una lista de resultados vacia.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 3 GB con la cuantizacion Q4_K_M del modelo de lenguaje (1,31 GB) mas el proyector de vision en F16 (668 MB).
- GPU recomendadas: cualquier GPU consumer con 3 GB o mas de VRAM; el modelo esta disenado para portatiles y GPUs modestas. No se especifican modelos concretos como A100 o H100 en la informacion disponible.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (por encima de 3 GB de VRAM) y en CPU estandar.
- Opciones de despliegue: llama.cpp / llama-server (soporte nativo GGUF y mmproj), con flags `--jinja`, `--flash-attn on`, `--tools all`; GUI propia `Launch-Studio.bat` y runner adaptativo `run-Aton-Adaptive-tools.ps1`. No se menciona soporte explicito para vLLM, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card destaca "rapida generacion de respuesta" y "baja latencia" de forma cualitativa, sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Akhet-Aton-2B | ~2,23 B (incl. 331 M vision) | 256K nativo; 8K-32K recomendado | Apache-2.0 | Agente edge bilingue ar/en con vision | GGUF en Hugging Face |
| Qwen/Qwen3.5-2B (base) | ~2 B | 256K nativo (segun model card del finetune) | No disponible en la informacion | LLM base multimodal | Hugging Face |
| Alternativas de 2B tipo edge | No disponible | No disponible | No disponible | No disponible | No disponible |

La informacion proporcionada solo permite comparar con el modelo base Qwen3.5-2B, del que este finetune hereda arquitectura y contexto. No se dispone de datos de rendimiento ni de especificaciones de otros modelos comparables en la informacion disponible.

## Limitaciones y advertencias

- No apto para razonamiento multi-paso complejo: el autor advierte explicitamente contra resolver problemas matematicos abstractos o escribir algoritmos complejos desde cero sin herramientas externas.
- No apto para generacion long-form sin limite: no esta pensado para novelas o ensayos de miles de palabras, donde los modelos pequenos tienden a desviarse.
- No debe usarse como oraculo factual autonomo: el autor recomienda fundamentar toda respuesta factual con RAG local o busqueda.
- Contexto de entrenamiento SFT limitado a 2 048 tokens, muy inferior al contexto nativo, lo que puede degradar el comportamiento en ventanas largas a pesar de la capacidad arquitectonica.
- Riesgo de alucinacion inherente a un modelo de 2B; la model card no cuantifica tasas de error.
- Sesgos conocidos: no documentados en la informacion disponible.
- Cobertura idiomatica limitada a arabe e ingles; no se declara soporte para castellano ni otros idiomas.
- Licencia Apache-2.0 permite uso comercial, pero no se detallan restricciones adicionales del autor ni condiciones del ecosistema AkhetRa.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; modelo muy reciente (creado el 2026-11-05) sin validacion externa de la comunidad.
- El tamano del repositorio figura como 0.0 GB, lo que puede indicar que los pesos no estan subidos o que la informacion esta incompleta.

## Enlaces

- Hugging Face: https://huggingface.co/alwkala/Aton
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Sitio del desarrollador: https://alwkala.com
