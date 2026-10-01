# egoigo/kanana-1.5-8b-instruct-2505-Persona-LORA-K

## Resumen

`egoigo/kanana-1.5-8b-instruct-2505-Persona-LORA-K` es un adaptador LoRA (Low-Rank Adaptation) de tipo "persona" entrenado por el usuario egoigo a partir del modelo base `kakaocorp/kanana-1.5-8b-instruct-2505`, desarrollado originalmente por Kakao Corp. No se trata de un modelo completo con pesos propios, sino de un conjunto de pesos de ajuste fino de bajo rango que debe combinarse con el modelo base para funcionar. El objetivo declarado es especializar el comportamiento conversacional del modelo base hacia un perfil de "persona" concreto, ajustando el estilo y tono de las respuestas.

El adaptador fue entrenado con la libreria Unsloth, segun indica la propia model card, lo que sugiere un proceso de fine-tuning eficiente en memoria (aproximadamente 2x mas rapido segun el autor). El repositorio ocupa solo 0,1 GB, coherente con un adaptador LoRA en lugar de un modelo completo de 8B parametros, que en precision FP16 ocuparia del orden de 16 GB.

El modelo base, Kanana 1.5 8B Instruct 2505, es la version actualizada de la familia Kanana de Kakao, con mejoras declaradas en codigo, matematicas y function calling respecto a la version anterior. Este adaptador concreto tiene 0 descargas y 0 likes en el momento de la consulta y su model card es minima, por lo que gran parte de las especificaciones tecnicas no estan documentadas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer (modelo base Kanana 1.5 8B) |
| Parametros totales | Adaptador LoRA: no disponible; modelo base: ~8B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base se asocia a 32K tokens en fuentes externas (no confirmado por el autor) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA, no un modelo completo. Esto implica que la arquitectura subyacente es la del modelo base `kakaocorp/kanana-1.5-8b-instruct-2505`, un transformer decoder-only de aproximadamente 8.000 millones de parametros. El adaptador introduce matrices de bajo rango que modifican los pesos del base durante la inferencia (o se fusionan con el, segun el flujo de despliegue). No se dispone de informacion sobre el rango (rank), alpha, modulos objetivo ni hiperparametros del entrenamiento LoRA.

Segun la model card, el entrenamiento se realizo con Unsloth, que implementa kernels optimizados para fine-tuning de LLMs con menor uso de memoria y mayor velocidad. No se documentan ni el numero de tokens de entrenamiento, ni la composicion del dataset de "persona", ni si se aplicaron tecnicas de alineacion adicionales como RLHF o DPO en esta fase. La model card esta generada a partir de la plantilla automatica de Unsloth y no aporta detalles tecnicos adicionales.

## Capacidades

- Generacion de texto conversacional con el estilo y tono de la "persona" objetivo definida por el autor del ajuste, que no se especifica en la model card.
- Hereda las capacidades del modelo base Kanana 1.5 8B Instruct 2505, que segun fuentes externas incluye mejoras en codigo, matematicas y function calling respecto a Kanana 1.0.
- Soporte de tool calling / function calling: atribuible al modelo base segun fuentes externas, no verificado en este adaptador.
- Capacidades multilingues: la model card declara exclusivamente ingles (en).
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.
- No se documentan capacidades de agente o razonamiento multi-paso especificas de este adaptador.

## Casos de uso

- Prototipado de asistentes conversacionales con personalidad: el adaptador sirve para experimentar con la inyeccion de un perfil de "persona" (tono, estilo, vocabulario) sobre un modelo base de 8B sin necesidad de reentrenar desde cero.
- Investigacion sobre fine-tuning con LoRA: util como caso de estudio reproducible de un flujo Unsloth sobre un modelo base coreano-ingles para analizar el impacto del ajuste de bajo rango en el estilo de las respuestas.
- Pruebas comparativas de comportamiento: permite comparar las respuestas del modelo base frente a las del adaptador para medir deriva estilistica en tareas de dialogo.
- Despliegue en entornos con recursos limitados: al ser un adaptador de 0,1 GB, requiere menos almacenamiento que un modelo completo y puede servirse junto al base en infraestructura modesta.
- Integracion rapida en pipelines de Hugging Face: al ser compatible con `transformers` y `text-generation-inference`, se puede cargar mediante `PeftModel` o fusionar los pesos para servirlo con el resto del ecosistema (vLLM, TGI).
- Experimentacion academica sobre sesgos de personalidad: analizar como un adaptador de persona modifica las respuestas del modelo base en cuestiones sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base. En FP16 el base de 8B requiere en torno a 16 GB de VRAM (cifra coherente con la ficha externa de la variante Persona Merged, que indica 16 GB). El adaptador LoRA anade un consumo despreciable frente al base.
- En cuantizacion de 8 bits, el modelo base se situa aproximadamente en 9-10 GB; en 4 bits, del orden de 5-6 GB (estimaciones generales para un modelo de 8B, no confirmadas para esta variante concreta).
- GPU recomendadas: A100, H100, L40S o RTX 4090 para FP16; RTX 3090/4090 o inferiores con cuantizacion para entornos consumer.
- Cabe en GPU consumer: si, en GPUs con 8-16 GB de VRAM si se usa cuantizacion, o a partir de 16-24 GB en precision completa.
- Opciones de despliegue: `transformers` (cargando el base y el adaptador con PEFT), text-generation-inference (TGI), vLLM tras fusionar el adaptador, y potencialmente llama.cpp/Ollama si se exporta a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| egoigo/kanana-1.5-8b-instruct-2505-Persona-LORA-K | Adaptador LoRA | Adaptador sobre ~8B | No disponible | Apache 2.0 | Hugging Face |
| kakaocorp/kanana-1.5-8b-instruct-2505 | Modelo completo instruct | ~8B | 32K (fuentes externas) | No disponible en la informacion | Hugging Face, NGC |
| kmj0614/kanana-1.5-8b-instruct-2505-Persona-LORA | Adaptador LoRA "persona" alternativo | Sobre ~8B | No disponible | No disponible | Hugging Face |
| slickcat/kanana-1.5-8b-instruct-2505-Persona-GGUF | Cuantizacion GGUF de una variante persona | Sobre ~8B | No disponible | No disponible | Hugging Face |

Existen varias variantes "Persona" del mismo modelo base publicadas por distintos autores (kmj0614, slickcat, kangkys), lo que indica un interes comunitario en adaptar Kanana 1.5 hacia perfiles conversacionales. No hay datos de benchmarks que permitan comparar su rendimiento relativo.

## Limitaciones y advertencias

- La model card es minima y generada automaticamente por Unsloth: no documenta hiperparametros, dataset de entrenamiento, ni el perfil de persona objetivo.
- Al ser un adaptador LoRA, no es utilizable de forma autonoma: requiere cargar el modelo base `kakaocorp/kanana-1.5-8b-instruct-2505`.
- El idioma declarado es unicamente ingles (en), a pesar de que Kanana es una familia de modelos desarrollada por Kakao Corp con foco en coreano e ingles; el comportamiento en castellano no esta verificado.
- No se dispone de informacion sobre sesgos especificos introducidos por el ajuste de persona.
- Riesgo de alucinacion: inherente a los modelos de 8B; no cuantificado para este adaptador.
- La licencia del adaptador es Apache 2.0, pero la licencia y condiciones de uso comercial del modelo base deben verificarse por separado en la ficha de `kakaocorp/kanana-1.5-8b-instruct-2505`.
- Con 0 descargas y 0 likes, no existe validacion de la comunidad sobre su calidad o comportamiento.
- Sin benchmarks publicados, no se puede recomendar para produccion sin una evaluacion propia previa.

## Enlaces

- Hugging Face (adaptador): https://huggingface.co/egoigo/kanana-1.5-8b-instruct-2505-Persona-LORA-K
- Modelo base en Hugging Face: https://huggingface.co/kakaocorp/kanana-1.5-8b-instruct-2505
- Variante Persona LoRA de kmj0614: https://huggingface.co/kmj0614/kanana-1.5-8b-instruct-2505-Persona-LORA
- Variante Persona GGUF de slickcat: https://huggingface.co/slickcat/kanana-1.5-8b-instruct-2505-Persona-GGUF
- Ficha en Inferix del modelo base: https://inferix.co/models/kakaocorp/kanana-1.5-8b-instruct-2505
- Catalogo NVIDIA NGC del modelo base: https://catalog.ngc.nvidia.com/orgs/nim/kakaocorp/containers/kanana-1.5-8b-instruct-2505/latest
- Ficha en LLM Explorer de la variante Persona Merged: https://llm-explorer.com/model/kangkys%2Fkanana-1.5-8b-instruct-2505-Persona-Merged
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
