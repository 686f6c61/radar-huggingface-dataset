# SebasAstreaYah/qwen3.5-4b-forge-GGUF

## Resumen

Forge30XX Qwen3.5-4B es un ajuste fino del modelo base Qwen3.5-4B (Qwen Team, Alibaba Group) orientado exclusivamente a la generacion de tool-calls en formato JSON. Lo desarrolla SebasAstreaYah dentro del proyecto Forge30XX, y su proposito es convertir un modelo conversacional generalista en un emisor fiable de llamadas a funciones (`{"name": "<tool>", "arguments": {...}}`) cuando se ejecuta en hardware modesto. El modelo resultante se distribuye unicamente en formato GGUF para llama.cpp, con la particularidad de que el adaptador LoRA de tool-calling ya esta fusionado en los pesos y se ha cuantizado una sola vez.

La relevancia practica del modelo esta en su perfil de despliegue: esta calibrado para el "perfil A" de Forge30XX, una unica GPU RTX 3060 de 12 GB, y consigue 56,3 tok/s con un contexto de 32 196 tokens consumiendo 3738 MiB de VRAM (con KV cache en formato turbo2 del fork TurboQuant). Con 4 326 350 848 parametros totales, es un modelo denso de ~4,3B que cabe holgadamente en GPUs de consumo.

Frente a la base sin ajustar, el cambio de comportamiento es notable en la tarea objetivo: en el test RF-08 (30 prompts fuera del dataset) el modelo fusionado Q4_K_M alcanza un 100% de acierto sin gramatica, mientras que la base Q4_K_M se queda en un 57% sin gramatica (aunque sube al 100% con gramatica). La licencia Apache-2.0 facilita su uso comercial, aunque con las limitaciones funcionales que se detallan mas abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B); no se detalla la variante exacta en la informacion disponible |
| Parametros totales | 4 326 350 848 (~4,3B) |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | 32 768 tokens (configuracion de referencia del autor) |
| Tipos de cuantizacion | Q4_K_M y F16 |
| Idiomas soportados | Ingles (entrenado con datos en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el adaptador LoRA separado esta en otro repositorio |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer denso de ~4,3B parametros. Sobre esa base se aplico un LoRA de tool-calling (proyecto Forge30XX) entrenado con el dataset Glaive Function Calling v2 (Apache-2.0). El pipeline de publicacion es: base en 16 bits, conversion a GGUF F16, fusion del adaptador con `llama-export-lora` y una unica cuantizacion a Q4_K_M con `llama-quantize`. El adaptador sin fusionar se publica por separado en `SebasAstreaYah/qwen3.5-4b-forge-lora`.

El dato tecnico mas relevante es la verificacion de que la fusion no degrada la perplejidad: sobre `eval.jsonl` (450 filas, 20 trozos de 4096), el fusionado Q4_K_M obtiene PPL 1,1796, frente a 1,1825 del adaptador separado y 1,1912 de la base sin adaptador. Es decir, el fusionado queda un 0,25% por debajo del adaptador, dentro del criterio RF-04 del proyecto (±2%). El modelo base incorpora modo *thinking*, que debe desactivarse (`--reasoning off`) para que la salida JSON sea parseable de forma fiable. El autor recomienda el fork TurboQuant de llama.cpp para usar KV cache `turbo2` a 32K (161,5 MiB frente a ~0,5 GiB con `q8_0` en llama.cpp mainline).

## Capacidades

- Generacion de tool-calls en JSON con el esquema `{"name": "<tool>", "arguments": {...}}`.
- Seleccion de herramienta limitada al conjunto declarado en el system prompt: el modelo no elige tools que no esten listadas.
- Soporte de function calling en el sentido de emision de llamadas estructuradas, no de razonamiento multi-paso autonomo documentado.
- Capacidades multilingues: solo ingles segun la model card.
- Capacidades de generacion de prosa: no soportadas como comportamiento entrenado (solo emite tool-calls, no turnos finales en prosa).
- Modo *thinking* heredado del modelo base, que debe desactivarse para uso en produccion con salida JSON.
- No se documentan capacidades de vision, audio ni agentes multi-paso.

## Casos de uso

- Enrutamiento de funciones en asistentes locales: el modelo emite la llamada JSON correspondiente a la tool declarada en el system prompt, lo que permite construir un despachador de funciones en una RTX 3060 de 12 GB con 3738 MiB de VRAM a 32K.
- Backend de function calling en pipelines de automatizacion: al ser un modelo de 4,3B en Q4_K_M (2,6 GiB), se puede desplegar con `llama-server` u Ollama en una sola GPU de consumo y servir como capa de traduccion de intencion a llamada de herramienta.
- Prototipado de agentes con contexto largo: los 32 768 tokens de contexto permiten incluir historiales extensos y definiciones de tools numerosas en el prompt, manteniendo 56,3 tok/s segun la medicion del autor.
- Evaluacion de esquemas de tool calling en investigacion: el par base/fusionado y el adaptador separado permiten comparar el efecto del ajuste fino y de la cuantizacion sobre la fiabilidad de la salida estructurada (PPL 1,1796 frente a 1,1912 de la base).
- Despliegue en entornos con restricciones de VRAM: con KV cache `turbo2` a 32K el consumo es de 3738 MiB, lo que deja margen en GPUs de 8-12 GB para otras cargas.
- Integracion en flujos de CI/CD o herramientas de desarrollo que requieran un parser de intenciones a llamadas de funcion, usando gramatica restringida para garantizar JSON valido (100% de acierto con gramatica en el test RF-08).
- Uso comercial en productos derivados: la licencia Apache-2.0 permite redistribucion y modificacion, siempre que se respete la atribucion a Qwen3.5-4B y a Glaive Function Calling v2.

## Benchmarks y rendimiento

| Prueba | Base Q4_K_M | Fusionado Q4_K_M |
|---|---:|---:|
| RF-08 (30 prompts, sin gramatica) | 57% | 100% |
| RF-08 (30 prompts, con gramatica) | 100% | 100% |

| Metrica | Fusionado Q4_K_M | Referencia |
|---|---:|---:|
| PPL (`eval.jsonl`, 450 filas, 20 trozos de 4096) | 1,1796 | Adaptador separado: 1,1825; base: 1,1912 |
| Throughput con contexto lleno (HU-03, 32 196 tokens) | 56,3 tok/s | Umbral del proyecto: ≥12 tok/s |
| VRAM a 32K (KV turbo2) | 3738 MiB | Umbral del proyecto: ≤5837 MiB |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 2,6 GiB para los pesos Q4_K_M; 3738 MiB en total con contexto de 32 196 tokens y KV cache `turbo2`. Con llama.cpp mainline y KV `q8_0` a 32K, el KV pasa de 161,5 MiB a ~0,5 GiB.
- GPU de referencia: RTX 3060 de 12 GB (perfil A del proyecto Forge30XX).
- Cabe en GPUs de consumo: el consumo medido de 3738 MiB deja margen en tarjetas de 8 GB o mas; no se documentan pruebas en GPUs de gama inferior.
- Opciones de despliegue: `llama-server` (llama.cpp o fork TurboQuant) y Ollama (`ollama run hf.co/SebasAstreaYah/qwen3.5-4b-forge-GGUF`). No se documenta soporte para vLLM ni TGI.
- Parametros de ejecucion de referencia: `-c 32768 -ngl 99 -fa on -np 1 -ctk turbo2 -ctv turbo2 --reasoning off`.
- Throughput: 56,3 tok/s con contexto lleno (32 196 tokens) segun la medicion HU-03 del autor. No se publican cifras de latencia por peticion ni de throughput con contexto corto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---:|---|---|---|---|
| Forge30XX Qwen3.5-4B (este modelo) | ~4,3B | 32 768 | Tool-calling JSON | Apache-2.0 | GGUF (Q4_K_M, F16) |
| Qwen3.5-4B (base) | ~4,3B | no disponible en la informacion | Conversacional general | Apache-2.0 | safetensors, GGUF (segun el ecosistema Qwen) |
| Adaptador Forge30XX (LoRA separado) | ~4,3B | no disponible | Tool-calling JSON | Apache-2.0 | adaptador LoRA |

No se dispone de datos de benchmarks comparativos con otras familias de modelos de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Solo genera tool-calls; no produce turnos finales en prosa, lo que impide usarlo como asistente conversacional completo sin un modelo complementario.
- Entrenado unicamente con datos en ingles; el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera deficiente.
- Sin alineamiento de seguridad especifico: no se han aplicado tecnicas de RLHF/DPO orientadas a rechazo de peticiones daninas.
- El modo *thinking* del modelo base debe desactivarse (`--reasoning off`) para que el JSON sea parseable de forma fiable.
- El modelo solo elige tools declaradas en el system prompt; no infiere herramientas no listadas.
- Riesgo de alucinacion en los argumentos de la llamada: no se documentan validaciones ni tasas de error sobre los argumentos, solo sobre la seleccion de tool.
- La configuracion de referencia depende del fork TurboQuant para el KV cache `turbo2`; en llama.cpp mainline hay que usar `q8_0` y el consumo de VRAM del KV aumenta.
- El repositorio no registra descargas ni likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion por terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SebasAstreaYah/qwen3.5-4b-forge-GGUF
- Adaptador LoRA separado: https://huggingface.co/SebasAstreaYah/qwen3.5-4b-forge-lora
- Repositorio del proyecto Forge30XX: https://github.com/SebasAstrea/Forge30XX
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset Glaive Function Calling v2: no disponible enlace directo en la informacion proporcionada
