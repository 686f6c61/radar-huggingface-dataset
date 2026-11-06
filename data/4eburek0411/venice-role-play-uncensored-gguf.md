# 4eburek0411/Venice-Role-Play-Uncensored-GGUF

## Resumen

Venice Role-Play Uncensored es un modelo de lenguaje de 24.000 millones de parametros derivado de `dphn/Dolphin-Mistral-24B-Venice-Edition`, desarrollado por el equipo de Dolphin (dphn.ai) en colaboracion con Venice.ai. Se trata de un ajuste fino orientado a rol conversacional y aventuras de texto, con un enfasis explicito en eliminar las capas de alineacion y censura del modelo base, de modo que el prompt de sistema del operador sea el unico mecanismo de control del comportamiento. Esta publicado en el repositorio `4eburek0411/Venice-Role-Play-Uncensored-GGUF` como una conversion a formato GGUF del modelo original.

El modelo parte de la arquitectura Mistral de 24B (transformer denso, no MoE) y conserva la plantilla de chat nativa de Mistral en su version V7-Tekken, lo que facilita su integracion en stacks existentes. El entrenamiento consistio en dos etapas de preentrenamiento continuado seguidas de una fase ligera de SFT (supervised fine-tuning), realizado sobre 8 GPU B200 proporcionadas por Targon. El resultado es un modelo generalista con capacidad de seguir instrucciones y un sesgo deliberado hacia respuestas sin restricciones eticas ni de seguridad.

Su relevancia actual reside en el nicho de modelos "sin censura" y controlables por el propietario del sistema, pensados para despliegues privados donde el operador define las directrices. Es el modelo por defecto de Venice.ai bajo el nombre "Venice Uncensored". La licencia Apache 2.0 permite uso comercial, aunque el contenido generado queda bajo responsabilidad del operador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Mistral 24B) |
| Parametros totales | 24.000 millones (aproximado, segun el nombre del modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (configurado en el ejemplo de vLLM) |
| Tipos de cuantizacion | GGUF (el repositorio es una conversion GGUF; niveles especificos no disponibles) |
| Idiomas soportados | No disponible (la model card no detalla idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio); el modelo base original se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Mistral de 24B, un transformer denso con atencion por ventanas deslizantes y contexto extendido, sobre el que se aplicaron dos etapas de preentrenamiento continuado seguidas de una fase ligera de SFT. El proceso se ejecuto sobre 8 GPU NVIDIA B200 proporcionadas por Targon. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; la model card solo indica que el objetivo era crear la version mas "sin censura" posible del modelo Mistral 24B para el ecosistema de personajes de Venice.ai.

La innovacion principal no es arquitectonica sino de alineacion: el modelo elimina las capas de rechazo y moderacion del modelo base y traslada todo el control de comportamiento al prompt de sistema. Mantiene la plantilla de chat por defecto de Mistral (V7-Tekken), con la estructura `<s>[SYSTEM_PROMPT]...[/SYSTEM_PROMPT][INST]...[/INST]`, y soporta tool calling mediante el parser `mistral` de vLLM. La model card recomienda temperaturas bajas (en torno a 0,15) para obtener respuestas mas deterministas.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto largo (hasta 131.072 tokens).
- Rol conversacional y narrativa de aventuras: mantiene personajes, tono y reglas definidas en el prompt de sistema.
- Seguimiento de instrucciones generalistas heredado del modelo base.
- Soporte de tool calling / function calling mediante el parser `mistral` de vLLM (`--tool-call-parser mistral --enable-auto-tool-choice`).
- Capacidad multimodal declarada en la configuracion de vLLM del modelo base (`--limit-mm-per-prompt '{"image": 10}'`), aunque no se detalla en la model card de esta conversion GGUF.
- Control total del comportamiento mediante prompt de sistema, sin directrices eticas impuestas por el desarrollador.
- Capacidades multilingues: no disponibles de forma explicita, aunque el modelo base Mistral suele cubrir varios idiomas.

## Casos de uso

- Role-play y ficcion interactiva: el modelo mantiene personajes y tramas a lo largo de conversaciones extensas gracias a su ventana de contexto de 131.072 tokens y a su entrenamiento especifico en rol.
- Motores de personajes en plataformas de chat: integrable como backend de Venice.ai o de aplicaciones propias donde el operador define la personalidad mediante el prompt de sistema.
- Generacion de narrativa ramificada y aventuras de texto: adecuado para juegos de rol por turnos donde se requiere coherencia de personaje y libertad creativa sin filtros.
- Despliegue privado con control de datos: al ser Apache 2.0 y ejecutable en local (GGUF, vLLM, llama.cpp, Ollama, LM Studio), permite mantener las conversaciones fuera de servicios de terceros.
- Investigacion sobre alineacion y comportamiento: util para estudiar como responde un modelo sin capas de rechazo y comparar con variantes alineadas.
- Prototipado rapido de asistentes con personalidad: la plantilla Mistral y el soporte en vLLM, TGI, sglang y Ollama facilitan la puesta en marcha en pipelines existentes.
- Generacion creativa sin restricciones de contenido: guiones, dialogos y material de ficcion para adultos bajo responsabilidad del operador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: la model card del modelo base indica que ejecutarlo en GPU requiere mas de 60 GB de RAM de GPU en precision completa (FP16/BF16). En cuantizacion GGUF de 4 bits se estima en torno a 14-16 GB, aunque el nivel exacto de cuantizacion del repositorio no esta disponible.
- GPU recomendadas: para precision completa, multiples GPU (el ejemplo de vLLM usa `tensor_parallel_size=8`); para cuantizaciones GGUF, una unica GPU de 24 GB (RTX 3090, RTX 4090) o 16 GB (RTX 4080) segun el nivel de cuantizacion.
- Cabe en GPU de consumo: si, en cuantizaciones GGUF de 4-5 bits sobre GPUs de 16-24 GB.
- Opciones de despliegue: vLLM (recomendado por el autor), llama.cpp, Ollama, LM Studio, TGI y sglang.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Venice Role-Play Uncensored (este) | ~24B | 131.072 | Rol sin censura | Apache 2.0 | GGUF en HF |
| dphn/Dolphin-Mistral-24B-Venice-Edition | ~24B | 131.072 | Base generalista sin censura | Apache 2.0 | safetensors en HF |
| Mistral Small 24B (oficial) | ~24B | 128.000 (segun version) | Generalista alineado | Apache 2.0 | HF, API |
| Modelos de rol alineados (familia Mistral fine-tunes) | 7B-24B | Variable | Rol con moderacion | Variable | HF |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo explicitamente sin censura: puede generar contenido ofensivo, ilegal, peligroso o sexualmente explicito. El operador asume toda la responsabilidad legal y etica del uso.
- Riesgo elevado de alucinacion, especialmente en tareas factuales, al priorizar el estilo conversacional sobre la precision.
- Sesgos conocidos: no documentados en la model card; al derivar de Mistral y de un ajuste sin moderacion, es probable que reproduzca sesgos del corpus de entrenamiento.
- El comportamiento depende criticamente del prompt de sistema; sin el, el modelo actua por defecto de forma potencialmente no deseada.
- Idiomas soportados no documentados; el rendimiento fuera del ingles y principales lenguas europeas no esta garantizado.
- La licencia Apache 2.0 permite uso comercial, pero no exime del cumplimiento de normativas locales (por ejemplo, Reglamento de IA de la UE o legislacion sobre contenido).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: conversion GGUF de un tercero, no oficial, sin validacion de la comunidad.
- Niveles de cuantizacion GGUF no detallados; verificar el archivo concreto antes de desplegar.
- El modelo base declara soporte multimodal en la configuracion de vLLM, pero esta conversion GGUF no documenta si conserva dicha capacidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/4eburek0411/Venice-Role-Play-Uncensored-GGUF
- Modelo base: https://huggingface.co/dphn/Dolphin-Mistral-24B-Venice-Edition
- Web oficial de Dolphin: https://dphn.ai
- Chat web: https://chat.dphn.ai
- Twitter/X de dphnAI: https://x.com/dphnAI
- Bot de Telegram: https://t.me/DolphinAI_bot
- Venice.ai: https://venice.ai/
- Targon (proveedor de computo): https://targon.com/
- vLLM: https://github.com/vllm-project/vllm
