# lxe/DeepSeek-V4.1-Flash-1017-dsx-2bit

## Resumen

DeepSeek-V4.1-Flash-1017-dsx-2bit es una cuantización de 2 bits del checkpoint DeepSeek-V4.1-Flash-1017, publicada por lxe. No es un modelo entrenado desde cero: empaqueta el MoE de 552B parámetros y el componente Engram de 196B en 148 GB de GGUF, con enrutamiento exacto —sin poda de expertos ni sesgo de router— y pesos densos en Q8_0. Su objetivo es ejecutar el modelo completo en dos RTX 3090 de 24 GB y 128 GB de RAM.

El modelo base, de DeepSeek y con licencia MIT, es un MoE con 15.360 expertos enrutados; los resultados de búsqueda lo describen como multimodal, con entrada de imagen nativa y 1M tokens de contexto. Este quant se publica para text-generation y el arranque documentado de dsx usa 131.072 tokens de contexto.

La relevancia está en el tamaño: 148 GB de pesos cuantizados más 203 GB de Engram oficial, 30-37 tok/s de decodificación en 2x RTX 3090 y 334-508 tok/s de prefill. La contrapartida es una pérdida medible frente a FP8: KL 0,395, top-1 74,1 % y perplejidad 10,93 frente a 8,56 del original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE con 15.360 expertos enrutados y componente Engram; enrutamiento exacto sin poda ni sesgo de router |
| Parámetros totales | 551.880.865.904 (≈552B) según safetensors; la model card indica 552B de MoE + 196B de Engram |
| Parámetros activos | no disponible |
| Longitud de contexto | 131.072 tokens en el ejemplo de dsx; 1.000.000 tokens en el modelo base según resultados de búsqueda |
| Tipos de cuantización | mezcla por experto: ternary 1,75 bpw, Q2_0 2,25 bpw y Q3_K 3,44 bpw; densos Q8_0; media 2,03 bpw. La revisión v1 usa 2,0 bpw por capa |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | GGUF en 4 shards; Engram sin cuantizar en safetensors oficiales |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash-1017 |
| Tamaño del repositorio | 444,3 GB (incluye assets y logs); descarga del quant 148 GB + Engram oficial 203 GB |

## Arquitectura y entrenamiento

El checkpoint base es un MoE de 552B parámetros con 15.360 expertos enrutados y un componente Engram de 196B. La model card del quant insiste en que el enrutamiento es exacto: no se poda ningún experto ni se aplica sesgo al router; las tablas Engram se leen sin cuantizar desde los shards oficiales. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base usó RLHF o DPO.

Esta publicación no reentrena el modelo: aplica GPTQ por experto con hessianos obtenidos en una pasada de calibración capa a capa por el `model.py` de referencia de DeepSeek, dentro del pipeline GSQ de Xolotl. Cada uno de los 15.360 expertos recibe ternary (1,75 bpw), Q2_0 (2,25 bpw) o Q3_K (3,44 bpw) según su error de salida medido; el presupuesto de bits se comparte entre las capas 2-36, de modo que las sensibles llegan a 2,75 bpw y las tolerantes a ~1,76 bpw, con una media de 2,03 bpw. La calibración usa 128 × 2048 tokens de sesiones de agentes de código y prompts de agente y código de antirez; los pesos densos quedan en Q8_0.

## Capacidades

- Generación de texto y razonamiento: el modo thinking está activado por defecto y puede desactivarse con `"reasoning_effort": "none"`.
- Programación: la model card incluye un ejemplo de fusión de intervalos en Python y la calibración se basa en sesiones de agentes de código; no se publican resultados de HumanEval ni benchmarks equivalentes.
- Contexto largo: el arranque de dsx usa 131.072 tokens; el modelo base se describe con 1M tokens en resultados de búsqueda, pero no se documenta el rendimiento del quant a esa longitud.
- Integración mediante API: el servidor dsx expone API compatible con OpenAI y Anthropic, además de una interfaz web.
- Despliegue local y air-gapped: al ser un quant MIT y ejecutarse con dsx, permite inferencia sin API externa.
- Agentes multi-step: el modelo base se presenta para agentes de contexto largo; la orquestación debe hacerse fuera del modelo, ya que no se documenta soporte nativo de tool calling.
- Multimodal: el modelo base se describe con entrada de imagen nativa, pero esta model card no documenta soporte de visión en dsx.
- Idiomas: no disponibles; no se publica lista de idiomas ni evaluación multilingüe.
- Audio: no documentado.

## Casos de uso

- Asistente de código privado en una estación de trabajo: con 2x RTX 3090 y 128 GB de RAM, el modelo se expone en `/v1` y se integra en el IDE o en un chat interno; los 30-37 tok/s permiten revisión y generación interactiva sin enviar código a la nube.
- Agente de reparación de repositorios: se le pasan incidencias, fragmentos de código y logs en un prompt de hasta 131k tokens; su prefill de 334-508 tok/s en 2x3090 reduce la latencia de arranque. La orquestación de herramientas debe hacerse fuera del modelo, porque el soporte nativo de tool calling no está documentado.
- Análisis de documentación técnica extensa: informes, RFCs o manuales de hasta 131k tokens; el modelo puede resumir, extraer requisitos y comparar versiones en local. Es adecuado por contexto y licencia MIT, no por benchmarks de comprensión no publicados.
- Laboratorio de cuantización: comparar la fidelidad de este build (KL 0,395; top-1 74,1 %; perplejidad 10,93) con FP8 y con Lucebox ROCMFP; el enrutamiento exacto y los logs en `results/` permiten reproducir experimentos.
- Despliegue air-gapped con datos sensibles: el quant y el Engram se descargan una vez y se sirven con dsx sin API externa; MIT facilita el uso comercial, aunque no hay auditoría de seguridad publicada.
- Generación de pruebas y documentación de código: el ejemplo de la model card y la calibración con sesiones de agentes de código orientan el modelo a tareas de programación; 37 tok/s en prosa y 30 tok/s con prompt de agente son suficientes para iteración, no para autocompletado de muy baja latencia.
- Investigación sobre MoE a escala en hardware de consumo: permite estudiar el comportamiento de 15.360 expertos con enrutamiento exacto y distintas precisiones por experto sin un clúster de GPU.
- Chat multi-turno con contexto largo y privacidad: 128 GB de RAM y 131k tokens permiten conversaciones con historial extenso; no hay datos de idiomas, así que el soporte multilingüe debe validarse.

## Benchmarks y rendimiento

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible. Los datos adjuntos miden fidelidad de cuantización y velocidad.

Calidad frente al FP8 original, medida en el conjunto de evaluación 1017 de Lucebox: 8 × 1024 tokens contra los top-256 log-probs del modelo FP8.

| Build | Expertos | KL ↓ | Top-1 ↑ | Perplejidad ↓ |
|---|---:|---:|---:|---:|
| FP8 / FP4 original | FP4 | 0 | 100 % | 8,56 |
| Lucebox ROCMFP | 2,5 bpw | 0,253 | 78,7 % | 9,78 |
| dsx 2-bit | 2,03 bpw | 0,395 | 74,1 % | 10,93 |

Velocidad con decodificación greedy, enrutamiento exacto y 400 tokens generados.

| Hardware | Decode, prosa | Decode, prompt de agente de 3K | Prefill, 3K / 8K |
|---|---:|---:|---:|
| 2x RTX 3090, 128 GB DDR4 | 37,2 tok/s | 30,0 tok/s | 334 / 508 tok/s |
| RTX 5090, 128 GB DDR5 | 12,0 tok/s | 15,2
