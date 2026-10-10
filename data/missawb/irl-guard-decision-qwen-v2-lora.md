# MissawB/irl-guard-decision-qwen-v2-lora

## Resumen

IRL Guard decision v2 LoRA es un adaptador de bajo rango (LoRA) publicado por el usuario MissawB sobre el modelo base `unsloth/Qwen3.5-2B`. Se distribuye como un repositorio PEFT de apenas 0,1 GB que contiene tanto los adaptadores LoRA como una "tête de décision" (cabeza de decisión) adicional, según indica la propia model card. Por tanto, no es un modelo completo listo para inferencia directa, sino un componente que debe combinarse con su modelo base o con la versión fusionada de la familia IRL Guard.

El propósito declarado en la model card es servir de apoyo a un sistema de decisión o guardrail, alimentado por el dataset `MissawB/irl-guard-decisions-v2`. La ficha del autor remite explícitamente a la version fusionada `MissawB/irl-guard-decision-qwen-v2` para tareas de inferencia, indicando que los resultados y las limitaciones se documentan alli. No se proporcionan cifras de rendimiento, benchmarks ni detalles del proceso de entrenamiento en la informacion disponible.

El modelo se publica bajo licencia Apache 2.0 y su relevancia actual es limitada: registra cero descargas y cero "likes", y fue creado y actualizado el mismo dia (10 de octubre de 2026). Resulta de interes principalmente para quienes ya trabajen con la familia IRL Guard y quieran reutilizar o inspeccionar sus adaptadores en lugar del modelo fusionado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | adaptador LoRA sobre transformer (modelo base `unsloth/Qwen3.5-2B`); incluye cabeza de decision segun la model card |
| Parametros totales | no disponible (el nombre del modelo base sugiere ~2B, sin confirmar) |
| Parametros activos | no aplica (no es un modelo MoE); el numero de parametros entrenables del adaptador no esta disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

La informacion disponible es minima. El repositorio contiene adaptadores LoRA con cabecera de decision, empaquetados con la libreria PEFT, sobre el modelo base `unsloth/Qwen3.5-2B`. No se detalla la configuracion del rango (`r`), el factor `alpha`, las capas objetivo ni si se aplicaron tecnicas adicionales de cuantizacion (QLoRA) durante el ajuste. Tampoco se especifica si el entrenamiento empleo RLHF, DPO u otro metodo de alineamiento.

El unico dato de entrenamiento disponible es el dataset citado, `MissawB/irl-guard-decisions-v2`, que no viene acompanado de informacion sobre numero de ejemplos, composicion, idioma ni proceso de anotacion. La model card, escrita en frances, se limita a indicar que para inferencia debe usarse el modelo fusionado y que los resultados y limites se documentan en su ficha, sin aportar cifras propias.

## Capacidades

- Al ser un adaptador LoRA y no un modelo completo, sus capacidades dependen enteramente del modelo base `unsloth/Qwen3.5-2B` sobre el que se aplica.
- La model card menciona una "cabeza de decision" (tete de decision), lo que sugiere una funcion de clasificacion o de toma de decisiones binaria/multiclase orientada a guardrails o filtrado, aunque no se detalla su interfaz.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas ni vision en la informacion disponible.
- No se documenta soporte de tool calling ni de function calling.
- No se documentan capacidades de agente ni de razonamiento multi-paso.
- No se documentan capacidades multilingues especificas.
- No se documenta ningun modo especial (thinking mode, audio, vision, etc.).

## Casos de uso

Debido a la escasez de informacion publicada, los siguientes casos son escenarios plausibles derivados del nombre y del contexto del modelo, no aplicaciones confirmadas por el autor.

- Filtrado de contenido o guardrail: dado que el modelo se denomina "IRL Guard" e incluye una cabeza de decision, encajaria en tareas de clasificacion de entradas para permitir, bloquear o escalar, aunque el umbral y el formato de salida no estan documentados.
- Investigacion sobre adaptadores LoRA: permite estudiar como se comporta un adaptador pequeno con cabeza de decision sobre un modelo de ~2B sin necesidad de reentrenar desde cero.
- Reproduccion de pipelines PEFT: el repositorio sirve como ejemplo de carga de adaptadores con la libreria PEFT para quienes quieran integrarlos en sus propios flujos de evaluacion.
- Ajuste fino posterior: al ser un adaptador de bajo rango, puede servir como punto de partida para un reentrenamiento adicional sobre dominio propio, siempre que se respete la licencia Apache 2.0.
- Despliegue en entornos con recursos limitados: si finalmente se fusiona con el modelo base de ~2B, el resultado seria ligero y apto para hardware de gama media, aunque no hay datos de latencia ni throughput.
- Comparacion de cabeceras de decision: util para experimentar con arquitecturas que anaden una cabeza especifica de clasificacion sobre un transformer generativo pequeno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

La model card remite al modelo fusionado para la inferencia, por lo que las cifras siguientes son estimaciones basadas unicamente en el tamano del modelo base (~2B) y no en mediciones del autor.

- VRAM estimada para inferencia del modelo fusionado: del orden de 4-6 GB en precision de 16 bits y aproximadamente 1,5-3 GB en cuantizacion de 4 bits, en funcion del backend y de la longitud de contexto. No hay datos confirmados.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM (por ejemplo RTX 3060, RTX 4060, RTX 4070, RTX 4090) seria suficiente para el modelo fusionado; GPU de datacenter (A100, H100) no serian necesarias para este tamano.
- Compatibilidad con GPU consumer: probablemente si, en la mayoria de tarjetas modernas, si se usa el modelo fusionado y cuantizado; sin confirmar por el autor.
- Opciones de despliegue: llama.cpp, Ollama, vLLM o TGI serian candidatas habituales para un modelo de este tamano, pero no hay documentacion que confirme compatibilidad con este adaptador especifico.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable. El adaptador se apoya en un modelo base (`unsloth/Qwen3.5-2B`) cuyos detalles no se facilitan, y no hay benchmarks publicados. A continuacion se resumen las diferencias con las alternativas mas cercanas conceptualmente, marcando los datos que no se conocen.

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| IRL Guard decision v2 LoRA (este) | adaptador LoRA con cabeza de decision | no disponible | no disponible | apache-2.0 | requiere modelo base; sin benchmarks |
| Modelo fusionado `MissawB/irl-guard-decision-qwen-v2` | modelo completo fusionado | no disponible | no disponible | no disponible | referido por el autor para inferencia |
| Modelo base `unsloth/Qwen3.5-2B` | transformer generativo | ~2B (segun nombre) | no disponible | no disponible | punto de partida del adaptador |
| Otros adaptadores LoRA para guardrails | adaptador LoRA | variable | variable | variable | no disponible |

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base `unsloth/Qwen3.5-2B` o la version fusionada para poder ejecutar inferencia.
- Ausencia total de datos de rendimiento, benchmarks, evaluaciones de sesgo o pruebas de robustez.
- Riesgo de alucinacion no cuantificado; al tratarse de un adaptador de decision, los errores de clasificacion podrian traducirse en falsos positivos o falsos negativos en un sistema de guardrail con consecuencias reales.
- Idiomas soportados no declarados; la model card esta en frances, pero no implica soporte multilingue del modelo.
- La licencia Apache 2.0 permite uso comercial, pero el autor no aporta garantias sobre idoneidad, exactitud ni cumplimiento normativo.
- Repositorio con cero descargas y cero "likes": sin validacion externa ni comunidad que haya verificado su funcionamiento.
- Fechas de creacion y actualizacion (10 de octubre de 2026) indican una publicacion muy reciente y sin historial de mantenimiento.
- No se documenta el formato exacto de entrada/salida de la cabeza de decision, lo que dificulta su integracion directa en produccion.

## Enlaces

- Modelo en HuggingFace (adaptador LoRA): https://huggingface.co/MissawB/irl-guard-decision-qwen-v2-lora
- Modelo fusionado referido por el autor: https://huggingface.co/MissawB/irl-guard-decision-qwen-v2
- Dataset de entrenamiento citado: https://huggingface.co/datasets/MissawB/irl-guard-decisions-v2
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-2B
- Libreria PEFT: https://huggingface.co/docs/peft
