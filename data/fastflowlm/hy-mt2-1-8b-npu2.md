# FastFlowLM/Hy-MT2-1.8B-NPU2

## Resumen

Hy-MT2-1.8B-NPU2 es una variante del modelo de traducción Hy-MT2-1.8B, desarrollado por Tencent Hunyuan, empaquetada por FastFlowLM para su despliegue en unidades de procesamiento neuronal (NPU). Forma parte de la familia Hy-MT2, compuesta por tres tamanos (1.8B, 7B y 30B-A3B MoE), disenada especificamente para traduccion multilingue en escenarios reales complejos y con capacidad de seguir instrucciones de traduccion en multiples idiomas.

El modelo cubre traduccion entre 33 idiomas, incluidos pares de baja representacion como tibetano, mongol, uigur, jemer, birmano o guyarati. Segun la model card, la variante de 1.8B supera en rendimiento global a APIs comerciales mainstream como las de Microsoft y Doubao, lo que lo posiciona como una opcion ligera y competitiva para traduccion en produccion.

La relevancia actual del modelo radica en su enfoque "fast-thinking" (sin cadena de razonamiento extendida) y en las tecnicas de cuantizacion extrema de AngelSlim, que reducen el modelo a 440 MB en 1.25 bits y mejoran la velocidad de inferencia 1,5x, habilitando despliegue en dispositivo y en NPU. La licencia Apache 2.0 facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (tag `hunyuan_v1_dense`), familia Hy-MT2 |
| Parametros totales | 1.8B |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8, GGUF 2 bits, GGUF 1.25 bits (AngelSlim); esta variante NPU2 |
| Idiomas soportados | 33: zh, en, fr, pt, es, ja, tr, ru, ar, ko, th, it, de, vi, ms, id, tl, hi, pl, cs, nl, km, my, fa, gu, ur, te, mr, he, bn, ta, uk, bo, kk, mn, ug |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible para esta variante (el repo ocupa 3,2 GB); la familia ofrece safetensors y GGUF |

## Arquitectura y entrenamiento

Hy-MT2-1.8B es un transformer denso de 1.800 millones de parametros, identificado en Hugging Face con la arquitectura `hunyuan_v1_dense`. La familia Hy-MT2 se presenta como modelos de traduccion "fast-thinking", es decir, orientados a producir traducciones directamente sin cadenas de razonamiento largas, lo que reduce latencia y coste de inferencia. El modelo esta especializado en seguir instrucciones de traduccion (idioma origen, idioma destino, glosarios de terminologia) en varios idiomas de prompt.

La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Si se menciona que la familia se evaluo en tareas generales, de negocio real, de dominio especifico y de seguimiento de instrucciones de traduccion, y que se publico junto al benchmark IFMTBench para medir la capacidad de seguir instrucciones de traduccion. La innovacion tecnica destacable es la cuantizacion extrema de AngelSlim (1.25 bits, 440 MB) que habilita despliegue en dispositivo con una mejora de velocidad de 1,5x.

## Capacidades

- Traduccion automatica multilingue entre 33 idiomas, incluidos pares de bajos recursos (bo, kk, mn, ug, km, my, gu, ur, te, mr).
- Seguimiento de instrucciones de traduccion en multiples idiomas de prompt (la model card muestra ejemplos en chino e ingles).
- Soporte de glosarios y terminologia controlada mediante prompts de referencia ("`{text}` se traduce como `{text}`").
- Traduccion con control de idioma origen y destino mediante nombres completos de idioma.
- Modo "fast-thinking": generacion directa de la traduccion sin razonamiento extendido.
- Integracion con la skill Hy-MT2-Translator para pipelines de traduccion.
- No se documentan capacidades de tool calling, agentes, vision, audio ni codigo en la informacion disponible.

## Casos de uso

- Traduccion de documentacion tecnica multilingue: el modelo puede traducir manuales y guias entre los 33 idiomas soportados, con soporte de glosarios para mantener consistencia terminologica en terminos tecnicos.
- Localizacion de productos y sitios web: traduccion de cadenas de interfaz y contenido de marketing a idiomas europeos y asiaticos, con instrucciones de estilo mediante prompt.
- Atencion al cliente multilingue: traduccion en tiempo real de mensajes de soporte entre clientes y agentes, aprovechando el modo fast-thinking para baja latencia.
- Subtitulado y traduccion audiovisual: la familia Hy-MT2 patrocina la tarea de traduccion de subtitulos de video de WMT26, lo que respalda su uso en este escenario.
- Traduccion en dispositivo o en el borde: la cuantizacion extrema (440 MB en 1.25 bits) y esta variante NPU permiten desplegar traduccion offline en hardware de bajas prestaciones.
- Traduccion de contenido para comercio internacional: conversion de fichas de producto y correspondencia comercial entre idiomas de mercados emergentes (turco, arabe, hindi, vietnamita, tailandes, etc.).
- Procesamiento de contenido generado por usuarios: moderacion y traduccion de comentarios y resenas en plataformas con audiencia global.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el modelo de 1.8B supera globalmente a APIs comerciales mainstream como Microsoft y Doubao, y que los modelos de 7B y 30B-A3B superan a DeepSeek-V4-Pro y Kimi K2.6 en modo fast-thinking, pero no se proporcionan cifras numericas en el texto disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para esta variante NPU2. Como referencia, el repo ocupa 3,2 GB; en FP16 el modelo de 1.8B requiere aproximadamente 3,6 GB de memoria, y en las cuantizaciones GGUF de 2 bits y 1.25 bits el peso se reduce hasta 440 MB.
- GPU recomendadas: no disponible para esta variante. Para el modelo base de 1.8B, cualquier GPU consumer con 4-6 GB de VRAM es suficiente en cuantizacion.
- Cabe en GPU consumer: si, en el modelo base; esta variante esta orientada a NPU.
- Opciones de despliegue: transformers (libreria declarada); la familia ofrece variantes GGUF para llama.cpp y FP8. No se documentan opciones vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: la cuantizacion 1.25 bits de AngelSlim mejora la velocidad de inferencia 1,5x segun la model card; no se proporcionan cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Hy-MT2-1.8B-NPU2 | 1.8B | no disponible | 33 | Apache 2.0 | Variante NPU, cuantizacion extrema disponible |
| Hy-MT2-7B | 7B | no disponible | 33 | Apache 2.0 | Mayor calidad, requiere mas memoria |
| Hy-MT2-30B-A3B | 30B (3B activos, MoE) | no disponible | 33 | Apache 2.0 | Mayor rendimiento, superior a DeepSeek-V4-Pro y Kimi K2.6 segun la model card |
| HY-MT1.5-1.8B | 1.8B | no disponible | no disponible | no disponible | Generacion anterior de la familia |

## Limitaciones y advertencias

- No se documentan sesgos conocidos en la informacion disponible; al ser un modelo de traduccion, puede heredar sesgos de sus datos de entrenamiento.
- Riesgo de alucinacion: no cuantificado en la model card; en traduccion se manifiesta como omisiones, adiciones o terminologia inventada.
- Longitud de contexto no disponible: no se puede garantizar el rendimiento en documentos largos sin verificar experimentalmente.
- El rendimiento por par de idiomas puede variar; los pares de bajos recursos (bo, ug, mn, km, my) probablemente tengan menor calidad que los pares mayoritarios, aunque no se aportan cifras.
- Esta variante NPU2 esta empaquetada por un tercero (FastFlowLM) y no por Tencent; conviene validar la integridad y el soporte de la variante frente al modelo oficial.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base y de las dependencias de despliegue.
- No se documentan capacidades de tool calling ni de agente; no debe asumirse su uso en pipelines que requieran function calling.

## Enlaces

- [Hugging Face: FastFlowLM/Hy-MT2-1.8B-NPU2](https://huggingface.co/FastFlowLM/Hy-MT2-1.8B-NPU2)
- [Modelo base Hy-MT2-1.8B](https://huggingface.co/tencent/Hy-MT2-1.8B)
- [Coleccion Hy-MT2 en Hugging Face](https://huggingface.co/collections/tencent/hy-mt2)
- [Coleccion Hy-MT2 en ModelScope](https://modelscope.cn/collections/Tencent-Hunyuan/Hy-MT2)
- [Informe tecnico Hy-MT2 (arXiv)](https://arxiv.org/pdf/2605.22064)
- [GitHub Tencent-Hunyuan/Hy-MT2](https://github.com/Tencent-Hunyuan/Hy-MT2)
- [AngelSlim (cuantizacion)](https://github.com/Tencent/AngelSlim/tree/main)
- [Sitio oficial Tencent AI Studio](https://aistudio.tencent.com/llm/en?tabIndex=0)
- [Skill Hy-MT2-Translator en ClawHub](https://clawhub.ai/tencent-adm/hy-mt2-translator-skill)
- [Skill Hy-MT2-Translator en SkillHub](https://skillhub.cn/skills/hy-mt2-translator)
- [WMT26 tarea de traduccion de subtitulos de video](https://www2.statmt.org/wmt26/video-subtitle-translation.html)
- [WMT26 tarea general de traduccion automatica](https://www2.statmt.org/wmt26/translation-task.html)
