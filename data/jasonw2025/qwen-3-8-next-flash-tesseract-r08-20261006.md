# JasonW2025/Qwen-3.8-Next-Flash-Tesseract-R08-20261006

## Resumen

Tesseract (r08-20261006) es un checkpoint de servicio publicado por el usuario JasonW2025 bajo el identificador `JasonW2025/Qwen-3.8-Next-Flash-Tesseract-R08-20261006`. Se presenta como un modelo de lenguaje disperso (MoE) de 126,3 mil millones de parametros servido en una unica NVIDIA DGX Spark (GB10, arquitectura sm_121a). El repositorio contiene exactamente el checkpoint que el autor ejecuto: una pila densa en fp8, expertos enrutados con cuantizacion Tessera WINDOW trellis, un lm_head en fp8 y un bloque borrador MTP para decodificacion especulativa.

El modelo se distribuye como artefacto de investigacion con pesos privados y licencia proprietary-research, sin garantia y sin permiso de redistribucion. La model card es explicita: todas las cifras publicadas se midieron en un unico DGX Spark contra este checkpoint concreto y no constituyen afirmaciones sobre otro hardware, otras cuantizaciones u otras pilas de servicio.

La relevancia actual del artefacto es fundamentalmente tecnica: documenta una via para servir un MoE de gran tamano con un promedio de 4,1 bits por peso (3,9 en expertos, 8,4 en denso) sobre hardware de un solo nodo, apoyandose en decodificacion especulativa con profundidad 3 y una tabla de embeddings por capa (PLE) separada. No obstante, el numero de descargas y likes es cero y el modelo no dispone de idiomas declarados ni de documentacion sobre el dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE disperso (48 capas, hidden 2.560, vocab 248.320), pila densa fp8 + expertos enrutados con Tessera WINDOW trellis |
| Parametros totales | 126,3e9 (5,5e9 densos + 120,8e9 en expertos); el repo safetensors declara 5.487.198.099 parametros en la pila densa |
| Parametros activos | top-10 de 512 expertos por token |
| Longitud de contexto | 65.536 tokens (KV cache en bf16) |
| Tipos de cuantizacion | fp8 en denso; expertos con trellis B4 rate-4 / T3 rate-3 / W832 Bresenham por columna; 3,9 bits/peso en expertos, 8,4 en denso, 4,1 global |
| Idiomas soportados | no disponible |
| Licencia | proprietary-research (etiqueta `license: other`), pesos privados de investigacion |
| Formato de pesos | safetensors (pila densa `model-protected-000..051`), planos trellis por capa en `packed/layer-00..layer-48`, tabla PLE en `ple-table/` |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE disperso de 48 capas con dimension oculta de 2.560 y vocabulario de 248.320 tokens. Cada token activa los 10 expertos mas relevantes de un total de 512. La pila densa (atencion, FFN densa, MMA del lm_head y bloque MTP) se ejecuta en fp8, mientras que los expertos enrutados emplean una cuantizacion trellis propietaria denominada Tessera WINDOW, con tasas B4 rate-4 y T3 rate-3 y un esquema Bresenham W832 por columna. El resultado son 3,9 bits por peso en expertos, 8,4 en denso y 4,1 en promedio.

El checkpoint incorpora un bloque borrador MTP para decodificacion especulativa con profundidad 3, que produce 2,54 tokens por pasada con una tasa de aceptacion de 0,513. El almacenamiento en disco se reparte en 59 GB de planos de expertos empaquetados, 98 GB de tabla PLE (embedding por capa) y 9 GB de denso. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni sobre si se aplicaron tecnicas de RLHF o DPO; la model card no documenta el proceso de entrenamiento, solo el de servicio.

## Capacidades

- Generacion de texto y conversacion multi-turno con hasta 65.536 tokens de contexto.
- Razonamiento con modo thinking conmutable: `enable_thinking: false` o `reasoning_effort: "none"` lo desactiva; la escala de esfuerzo resuelve en cuatro estados observables (`minimal` equivalente a `low`, `medium`, `high` equivalente a `xhigh` y `max`).
- Tool calling y function calling: la model card reporta un 95,8% de acierto en un conjunto duro de 24 casos, con un 100% de acierto en el nombre de la herramienta.
- Razonamiento matematico: 96,59% en GSM8K con 8-shot CoT.
- Conocimiento general: 88,07% en MMLU con 5-shot.
- Decodificacion especulativa integrada mediante bloque MTP, orientada a reducir latencia en servicio.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Vision y audio: no disponibles.

## Casos de uso

- Servicio de inferencia en un unico nodo DGX Spark: el checkpoint esta calibrado y medido para GB10 (sm_121a), con 1.543 tok/s en prefill en frio y 48,3 tok/s en decodificacion de un solo flujo, lo que permite desplegar un MoE de 126,3e9 en hardware de un solo equipo.
- Evaluacion de cuantizacion trellis: util como referencia reproducible para estudiar el impacto de Tessera WINDOW en calidad, con NLL de 4,3183 frente a 4,2966 del profesor bf16 y top-1 de 0,3530 frente a 0,3484.
- Investigacion sobre decodificacion especulativa: el bloque MTP con profundidad 3 y aceptacion de 0,513 sirve como caso de estudio de compromiso entre velocidad y fidelidad de muestreo.
- Procesamiento de documentos largos: la ventana de 65.536 tokens permite resumir o extraer informacion de contratos, informes o expedientes completos en una sola pasada.
- Asistentes con tool calling en entornos controlados: el 95,8% en el conjunto duro de 24 casos respalda su uso en flujos donde el modelo debe invocar funciones con nombre y argumentos correctos.
- Reproduccion de resultados: el identificador de servicio `d4cdd7b9a35e79c3` (SHA de una decodificacion greedy fija) actua como huella de integridad para verificar que pesos, cuantizacion y numerica de servicio coinciden con los medidos.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| MMLU (5-shot, n=570) | 88,07% |
| GSM8K (8-shot CoT, n=1.319) | 96,59% |
| Tool-call, conjunto duro de 24 casos | 95,8% (nombre de herramienta 100%) |
| NLL frente al profesor bf16 | 4,3183 frente a 4,2966 |
| Top-1 frente al profesor bf16 | 0,3530 frente a 0,3484 |
| TEB 3.0 (tool-eval-bench, hardmode) | gsm8k 98,0% (n=200), mmlu 91,7% (n=300), ifeval 83,5/88,4% |
| Prefill en frio | 1.543 tok/s |
| Decodificacion, un flujo | 48,3 tok/s (MTP profundidad 3: 2,54 tokens por pasada, aceptacion 0,513) |
| Decodificacion, 8 flujos | 122 tok/s |
| TTFT | 141-177 ms en peticiones cortas; t ≈ 143 ms + n/1664 |

Todas las cifras de precision se midieron con el modo thinking desactivado y en un unico DGX Spark contra este checkpoint exacto. No se ofrecen comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM: el checkpoint en disco ocupa 19,2 GB en el repositorio de Hugging Face, pero la model card describe 59 GB de planos de expertos, 98 GB de tabla PLE y 9 GB de denso empaquetados; el despliegue completo requiere el conjunto de planos y tabla PLE.
- GPU recomendada: NVIDIA DGX Spark (GB10, sm_121a), el unico hardware sobre el que se han medido las cifras publicadas.
- GPU de consumo: no disponible; no se documenta compatibilidad con RTX 4090 u otras GPU consumer.
- Opciones de despliegue: pila de servicio personalizada (libreria `custom`), con manifiesto `serving-bundle.json` y `runtime.json`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput medidos: TTFT de 141-177 ms en peticiones cortas, prefill de 1.543 tok/s, 48,3 tok/s en un flujo y 122 tok/s con 8 flujos.
- KV cache: bf16 con 65.536 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Tesseract (r08-20261006) | 126,3e9 (top-10 de 512 expertos) | 65.536 | proprietary-research | Pesos privados, 0 descargas |
| Qwen3.8-Flash-Next | no disponible | no disponible | no disponible | Publico en Hugging Face y GitHub |
| Otros modelos de la misma categoria | no disponible | no disponible | no disponible | no disponible |

La busqueda web solo devuelve referencias a Qwen3.8-Flash-Next (Hugging Face y GitHub), que el autor cita como base nominal pero cuya ficha no aporta parametros, contexto ni licencia en la informacion proporcionada. No se dispone de datos de rendimiento comparables entre ambos.

## Limitaciones y advertencias

- Pesos privados de investigacion: la licencia proprietary-research prohibe la redistribucion sin permiso del propietario y no ofrece garantia alguna.
- Artefacto de investigacion: las cifras estan medidas en un unico DGX Spark y no son extrapolables a otro hardware, cuantizacion o pila de servicio.
- Sin datos de entrenamiento: no se documenta el dataset, el numero de tokens ni el proceso de alineacion, por lo que no es posible evaluar sesgos conocidos.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el NLL de 4,3183 frente al profesor bf16 indica una degradacion medible respecto al modelo de referencia.
- Idiomas: no se declaran idiomas soportados, lo que impide garantizar calidad fuera del idioma de evaluacion.
- Dependencia de formato: el cargador lee directamente los planos de `packed/` y la tabla `ple-table/`, de modo que la estructura de directorios forma parte del formato y ambos son obligatorios para servir.
- Compatibilidad: sin soporte documentado en marcos estandar (vLLM, llama.cpp, Ollama, TGI); requiere la pila de servicio propietaria.
- Reproducibilidad: cualquier cambio en pesos, cuantizacion o numerica de servicio altera el identificador `d4cdd7b9a35e79c3`, lo que invalida la comparacion con las metricas publicadas.

## Enlaces

- Hugging Face: https://huggingface.co/JasonW2025/Qwen-3.8-Next-Flash-Tesseract-R08-20261006
- Qwen3.8-Flash-Next en Hugging Face: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Qwen3.8-Flash-Next en GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next/
