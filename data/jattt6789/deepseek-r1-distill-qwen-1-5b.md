# Jattt6789/DeepSeek-R1-Distill-Qwen-1.5B

## Resumen

DeepSeek-R1-Distill-Qwen-1.5B es un modelo de lenguaje denso de 1.777 millones de parametros (aproximadamente 1,5B, de ahi su nombre) obtenido mediante destilacion supervisada del modelo de razonamiento DeepSeek-R1 sobre la arquitectura base Qwen2.5-1.5B. Lo desarrolla DeepSeek AI y se distribuye con licencia MIT. El repositorio analizado (Jattt6789/DeepSeek-R1-Distill-Qwen-1.5B) es una publicacion de un tercero que redistribuye los pesos del modelo oficial bajo la misma licencia, con 133 descargas y sin likes en el momento de la consulta.

El modelo resuelve el problema de ejecutar razonamiento de tipo cadena de pensamiento (chain-of-thought) en hardware muy limitado: al tener solo 1,5B de parametros, cabe en GPUs de consumo e incluso en CPU con cuantizacion agresiva. Es relevante porque forma parte de la familia de destilados de DeepSeek-R1 (1.5B, 7B, 8B, 14B, 32B y 70B basados en Qwen2.5 y Llama3) que demostro que los patrones de razonamiento de un modelo grande pueden transferirse a modelos densos pequenos con resultados competitivos frente a modelos de razonamiento de mayor tamano.

La arquitectura es un transformer denso de tipo Qwen2 (qwen2 en transformers), orientado a generacion de texto y conversacion, con pesos en safetensors y un tamano de repositorio de 3,6 GB. La longitud de contexto, los idiomas soportados y los detalles de entrenamiento no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, familia Qwen2 (qwen2) |
| Parametros totales | 1.777.088.000 (aproximadamente 1,5B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos nativos en safetensors; el ecosistema admite GGUF/AWQ por ser base Qwen2, pero no se confirma) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer denso basado en Qwen2.5-1.5B, reentrenado mediante destilacion supervisada (SFT) sobre datos de razonamiento generados por DeepSeek-R1. Segun la model card del proyecto original, DeepSeek AI genero trayectorias de razonamiento con DeepSeek-R1 y ajusto con ellas varios modelos densos de la familia Qwen2.5 y Llama3, dando lugar a los checkpoints destilados de 1.5B, 7B, 8B, 14B, 32B y 70B. El objetivo declarado es que los patrones de razonamiento de un modelo grande se transfieran a modelos pequenos, superando en rendimiento a los patrones que un modelo pequeno descubriria por si solo mediante RL.

La innovacion tecnica central del linaje DeepSeek-R1 es el uso de RL a gran escala sobre el modelo base sin SFT previo (DeepSeek-R1-Zero), que hizo emerger comportamientos de autoverificacion, reflexion y cadenas de pensamiento largas. DeepSeek-R1 anade datos de cold-start antes del RL para corregir problemas de repeticion infinita, legibilidad y mezcla de idiomas. En el caso de este destilado de 1,5B, el entrenamiento consiste en SFT sobre esas trayectorias, no en RL directo. No se dispone del numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de DPO o RLHF en el destilado.

## Capacidades

- Generacion de texto y conversacion multi-turno en formato chat (pipeline text-generation, tag conversational).
- Razonamiento con cadena de pensamiento: hereda el estilo de razonamiento explicito de DeepSeek-R1, generando pasos intermedios antes de la respuesta final.
- Razonamiento matematico y resolucion de problemas de varios pasos, segun el objetivo declarado de la destilacion.
- Generacion y comprension de codigo, capacidad atribuida a la familia DeepSeek-R1 en la model card.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: parcialmente implicito por el modo de razonamiento, pero no documentado explicitamente para este checkpoint.
- Capacidades multilingues: no disponibles; la model card menciona que DeepSeek-R1-Zero presentaba mezcla de idiomas, corregida en R1, pero no se especifican idiomas para este destilado.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles.

## Casos de uso

- Asistente de razonamiento en local para desarrolladores: el modelo puede ejecutarse en un portatil con GPU de consumo o en CPU con cuantizacion, permitiendo prototipar flujos de cadena de pensamiento sin depender de APIs externas.
- Tutoria educativa de matematicas: al generar pasos intermedios, es adecuado para explicar la resolucion de problemas paso a paso en entornos con recursos limitados.
- Generacion de codigo en entornos de desarrollo integrado: su tamano permite integrarlo en plugins de editor o pipelines de CI/CD para autocompletado y explicacion de fragmentos, siempre que se validen las salidas.
- Clasificacion y extraccion de informacion con razonamiento: se puede usar para tareas de etiquetado que requieran justificar la decision, desplegado en lotes sobre CPU.
- Filtrado y preprocesado de datos para entrenamiento: util como modelo generador de razonamientos sinteticos a bajo coste en proyectos de destilacion propios.
- Chatbot de soporte tecnico de dominio acotado: su ventana de contexto no esta documentada, por lo que se recomienda validar la longitud efectiva antes de usarlo en conversaciones largas.
- Investigacion sobre destilacion: sirve como referencia reproducible para estudiar como se comportan los patrones de razonamiento de un modelo grande en un modelo denso de 1,5B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este repositorio concreto. La model card del proyecto original menciona que DeepSeek-R1-Distill-Qwen-32B supera a OpenAI-o1-mini en varios benchmarks, pero no se incluyen numeros especificos para el checkpoint de 1,5B en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en precision nativa (fp16/bf16): aproximadamente 3,5-4 GB solo para pesos, mas overhead de activaciones y cache KV.
- Cuantizacion a 8 bits: alrededor de 1,8-2 GB de VRAM.
- Cuantizacion a 4 bits: alrededor de 1-1,2 GB de VRAM, viable en GPUs de consumo modestas.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM para fp16 (GTX 1650 Super, RTX 3050, RTX 4060); para 4 bits basta con 2 GB. En entornos de servidor, A100 y H100 son sobredimensionadas para este tamano, pero permiten alto throughput por batching.
- Cabe en GPU de consumo: si, en la mayoria de GPUs modernas con 4 GB o mas; tambien en CPU con llama.cpp u Ollama en cuantizacion 4 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible), y por ser base Qwen2 es compatible con vLLM, llama.cpp, Ollama y TGI, aunque la compatibilidad concreta con cada motor no se confirma en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-1.5B (este repo) | 1,777B | No disponible | MIT | HuggingFace (redistribucion de tercero) |
| DeepSeek-R1-Distill-Qwen-7B | 7B (aproximado, no confirmado en la informacion) | No disponible | MIT (familia DeepSeek-R1) | HuggingFace (DeepSeek AI) |
| DeepSeek-R1-Distill-Llama-8B | 8B (aproximado, no confirmado en la informacion) | No disponible | MIT (familia DeepSeek-R1) | HuggingFace (DeepSeek AI) |
| Qwen2.5-1.5B (base) | 1,5B | No disponible | No disponible en la informacion | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio es una redistribucion de un tercero (Jattt6789), no la publicacion oficial de DeepSeek AI; conviene verificar la integridad de los pesos frente al checkpoint oficial.
- La model card incluida es la del proyecto DeepSeek-R1 original y esta truncada; no documenta especificidades de este checkpoint de 1,5B.
- Riesgo de alucinacion inherente a los modelos de razonamiento destilados de este tamano; las cadenas de pensamiento pueden contener pasos plausibles pero incorrectos.
- La familia DeepSeek-R1-Zero presentaba problemas de repeticion infinita y mezcla de idiomas; aunque R1 los mitiga, en un destilado de 1,5B estos comportamientos pueden reaparecer.
- Longitud de contexto e idiomas no documentados: no se debe asumir soporte multilingue amplio ni ventanas largas sin validacion empirica.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero el autor de la redistribucion no ofrece garantias adicionales.
- No hay datos de benchmarks publicados para este checkpoint concreto, por lo que las decisiones de produccion deben basarse en evaluaciones propias.
- El modelo no incluye capacidades de vision ni audio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Jattt6789/DeepSeek-R1-Distill-Qwen-1.5B
- Paper de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1/blob/main/DeepSeek_R1.pdf
- Repositorio GitHub de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Licencia MIT del proyecto: https://github.com/deepseek-ai/DeepSeek-R1/blob/main/LICENSE
- Web oficial de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Organizacion DeepSeek AI en HuggingFace: https://huggingface.co/deepseek-ai
- Discord de DeepSeek AI: https://discord.gg/Tc7c45Zzu5
- Twitter/X de DeepSeek AI: https://twitter.com/deepseek_ai
