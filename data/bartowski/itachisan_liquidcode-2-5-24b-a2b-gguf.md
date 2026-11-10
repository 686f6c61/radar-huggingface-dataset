# bartowski/ItachiSan_LiquidCode-2.5-24B-A2B-GGUF

## Resumen

ItachiSan_LiquidCode-2.5-24B-A2B es un modelo de lenguaje de tipo Mixture of Experts (MoE) con 24 mil millones de parametros totales, desarrollado por el usuario ItachiSan y publicado bajo licencia Apache 2.0. La ficha que nos ocupa documenta la version cuantizada en formato GGUF realizada por bartowski, un conocido cuantizador de la comunidad, generada con llama.cpp release b12180 y con calibracion imatrix. El modelo esta etiquetado con la arquitectura `lfm2_moe`, lo que lo vincula a la familia Liquid Foundation Models de Liquid AI, y esta orientado a generacion de texto y codigo.

El modelo resuelve el problema de ejecutar un LLM de ~24B en hardware de consumo o en servidores modestos mediante cuantizacion agresiva: la variante Q4_K_M ocupa 15,35 GB, lo que permite su despliegue en GPUs con 16-24 GB de VRAM o incluso en CPU. Al tratarse de una arquitectura MoE con (segun la nomenclatura A2B) aproximadamente 2 mil millones de parametros activos por token, el coste computacional por token es notablemente inferior al de un modelo denso de 24B, lo que se traduce en mayor throughput en inferencia.

La relevancia actual del modelo radica en su combinacion de tamano manejable, licencia permisiva (Apache 2.0), soporte de tool calling mediante un formato de prompt ChatML con definicion de herramientas, y modo de razonamiento explicito (bloque `<think>`). El repositorio GGUF ofrece un amplio abanico de cuantizaciones, desde bf16 (47,96 GB) hasta IQ3_M (12,59 GB), cubriendo practicamente cualquier presupuesto de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), familia `lfm2_moe` |
| Parametros totales | 23.971.587.712 (~24B) |
| Parametros activos | ~2B (segun nomenclatura A2B; dato no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_K_M, IQ4_NL, Q4_1, Q4_K_S, Q4_0, IQ4_XS, IQ3_M, Q3_K_L (y posteriores, listado truncado en la informacion) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo cuantizado); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de mezcla de expertos (MoE) identificada en los metadatos como `lfm2_moe`, lo que sugiere continuidad con la linea de modelos Liquid Foundation Models de Liquid AI. La nomenclatura "24B-A2B" indica 24B de parametros totales con aproximadamente 2B activos por token, un patron de eficiencia computacional habitual en arquitecturas MoE dispersas. El checkpoint de origen del que parte la cuantizacion es `ItachiSan/LiquidCode-2.5-24B-A2B`, y los pesos se han cuantizado con llama.cpp b12180 aplicando calibracion imatrix, lo que mejora la calidad de las cuantizaciones de baja precision al ponderar la importancia de cada tensor.

No se dispone en la informacion proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste por instrucciones. Tampoco se documenta si el modelo incorpora decodificacion especulativa (la model card indica explicitamente "Speculative decoding: no"). El modelo soporta entrada exclusivamente de texto y no se declaran capacidades multimodales.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de prompt ChatML (`<|im_start|>` / `<|im_end|>`).
- Modo de razonamiento explicito mediante bloque `<think>` al inicio de la respuesta del asistente.
- Soporte de tool calling / function calling: el formato de prompt admite una lista de herramientas en JSON dentro del mensaje de sistema, con esquema de parametros tipo JSON Schema.
- Capacidad de codigo: el nombre "LiquidCode" sugiere especializacion en generacion y asistencia de codigo (no confirmado con benchmarks en la informacion disponible).
- Generacion de texto general y conversacion multi-turno.
- Capacidades multilingues: limitadas al ingles segun el campo `language: en`.
- No se declaran capacidades de vision, audio ni agentes multi-paso mas alla del tool calling.

## Casos de uso

- Asistente de codigo en local: el modelo puede desplegarse en una workstation con una RTX 4090 (24 GB) usando Q4_K_M (15,35 GB) o Q5_K_M (18,50 GB) para autocompletar, explicar y refactorizar codigo sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de confidencialidad.
- Integracion en pipelines de CI/CD: mediante tool calling y el formato ChatML con definicion de herramientas, se puede conectar a APIs de revision de codigo, ejecucion de tests o gestion de issues, usando el bloque `<think>` para trazar el razonamiento del agente.
- Despliegue en servidores sin GPU dedicada: las cuantizaciones IQ3_M (12,59 GB) e IQ4_XS (13,38 GB) permiten ejecucion en CPU con llama.cpp u Ollama, adecuado para prototipos y entornos de desarrollo con presupuesto limitado.
- Atencion al cliente tecnica en ingles: el modelo gestiona conversaciones multi-turno con contexto de sistema personalizable; la ventana de contexto no esta documentada, por lo que debe validarse antes de usarlo con historiales largos.
- Generacion de documentacion tecnica: a partir de fragmentos de codigo o especificaciones, el modelo puede producir explicaciones y guias en ingles, aprovechando su orientacion a codigo.
- Evaluacion y experimentacion en investigacion: al ser Apache 2.0 y estar disponible en GGUF, sirve como base para estudiar el comportamiento de arquitecturas MoE con ~2B activos frente a modelos densos de tamano similar en tareas de codigo.
- Prototipado de agentes con herramientas: el soporte nativo de lista de herramientas en el prompt de sistema facilita construir agentes que consulten APIs externas (por ejemplo, precios de acciones en el ejemplo de la model card).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano de fichero GGUF mas overhead de contexto y KV cache):
  - bf16: ~48 GB (requiere A100 80 GB, H100 o multi-GPU).
  - Q8_0: ~25,5 GB (A100 40 GB, RTX 3090/4090 en configuracion ajustada, L40S).
  - Q6_K / Q6_K_L: ~21-22 GB (RTX 3090 24 GB, RTX 4090 24 GB, A10G 24 GB).
  - Q5_K_M: ~18,5 GB (RTX 4090, RTX 3090, A5000 24 GB).
  - Q4_K_M: ~15,35 GB (RTX 4080 16 GB, RTX 4070 Ti Super 16 GB, A4000 16 GB).
  - IQ3_M / IQ4_XS: ~12,6-13,4 GB (RTX 4070 12 GB, RTX 3060 12 GB con margen ajustado).
- Cabe en GPU de consumo: si, desde 12 GB de VRAM con cuantizaciones IQ3/IQ4, y con comodidad en 16-24 GB.
- Opciones de despliegue: llama.cpp (version b12180 o superior, usada para la cuantizacion), Ollama, y cualquier runtime compatible con GGUF; los tags del repo incluyen `text-generation-inference` y `transformers`, aunque el formato GGUF es el principal. vLLM no esta confirmado para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada. La naturaleza MoE con ~2B activos sugiere un throughput superior al de un modelo denso de 24B, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de modelos comparables en la informacion proporcionada. A continuacion se comparan unicamente los datos objetivos disponibles del modelo frente a alternativas de tamano y licencia similares, sin cifras de rendimiento:

| Modelo | Parametros | Contexto | Licencia | Formato GGUF |
|---|---|---|---|---|
| ItachiSan_LiquidCode-2.5-24B-A2B | 24B (MoE, ~2B activos) | no disponible | Apache 2.0 | Si (bartowski) |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion proporcionada modelos comparables con datos verificables; se recomienda consultar el repositorio del modelo base para obtener referencias.

## Limitaciones y advertencias

- Idioma: el modelo esta declarado unicamente para ingles (`language: en`); el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo de alucinacion: inherente a los LLM; no hay evaluaciones publicadas de fidelidad factual.
- Contexto: la longitud de contexto no esta documentada en la informacion disponible, lo que impide garantizar su uso en tareas de contexto largo.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base y sus datos de entrenamiento pueden tener condiciones adicionales no reflejadas en la ficha cuantizada; conviene revisar la model card de `ItachiSan/LiquidCode-2.5-24B-A2B`.
- Cuantizacion: las versiones de baja precision (IQ3_M, Q3_K_L) pueden degradar la calidad, especialmente en tareas de codigo y razonamiento; se recomienda Q4_K_M o superior para produccion.
- Tool calling: depende de que el runtime respete el formato ChatML exacto con la lista de herramientas en el mensaje de sistema; no hay garantia de compatibilidad con todos los frameworks.
- Repositorio: 0 descargas y 1 like en el momento de la consulta, lo que indica un modelo poco validado por la comunidad; no hay evidencia de uso en produccion.
- Modelo base de autor individual (ItachiSan): no se dispone de informacion sobre el proceso de entrenamiento, lo que limita la confianza en su robustez.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/ItachiSan_LiquidCode-2.5-24B-A2B-GGUF
- Modelo base: https://huggingface.co/ItachiSan/LiquidCode-2.5-24B-A2B
- llama.cpp (release b12180): https://github.com/ggml-org/llama.cpp/releases/tag/b12180
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
