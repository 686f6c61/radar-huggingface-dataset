# harness-hub/LFM2.5-24B-A2B-hermes-v2-GGUF

## Resumen

LFM2.5-24B-A2B-hermes-v2-GGUF es la version en formato GGUF de un adaptador LoRA denominado `harness-hub/LFM2.5-24B-A2B-hermes-v2`, construido sobre el modelo base `LiquidAI/LFM2.5-24B-A2B` de Liquid AI. El adaptador fue entrenado mediante aprendizaje por refuerzo dentro del entorno Hermes Agent de Nous Research, con el objetivo de mejorar el comportamiento del modelo en tareas de agente: uso de herramientas, razonamiento multi-paso y ejecucion de tareas dentro de un bucle de agente.

La relevancia de esta publicacion es doble. Por un lado, demuestra un flujo de trabajo de ajuste fino orientado especificamente a agentes (no a chat generico), con una metrica concreta: el adaptador resuelve las tareas aproximadamente con la misma frecuencia que el modelo base, pero con un 13% menos de llamadas a herramientas en aquellas tareas que ambos resuelven. Por otro, se distribuye como LoRA en GGUF (F16), lo que permite aplicarlo sobre una cuantizacion del modelo base y servirlo con llama.cpp sin necesidad de fusionar pesos.

El repositorio en si no contiene pesos completos del modelo, sino unicamente el adaptador (`LFM2.5-24B-A2B-harbor-hermes-lora-F16.gguf`), que debe ejecutarse sobre un GGUF del modelo base. El nombre comercial sugiere 24B de parametros totales con 2B activos (arquitectura MoE), aunque el campo de parametros reportado por Hugging Face para este repo (18.710.528) corresponde al adaptador, no al modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base LFM2.5-24B-A2B de Liquid AI; arquitectura del base no detallada en la informacion disponible |
| Parametros totales | 18.710.528 en el repositorio (corresponden al adaptador LoRA, no al modelo base); el nombre del modelo sugiere 24B en el base, dato no confirmado en la informacion disponible |
| Parametros activos | no disponible (el nombre "A2B" sugiere 2B activos, sin confirmacion en la informacion proporcionada) |
| Longitud de contexto | 65.536 tokens en la configuracion de ejemplo (`-c 65536`); Hermes requiere un minimo de 64.000 tokens |
| Tipos de cuantizacion | Adaptador en F16; el modelo base se sirve en Q8_0 como opcion recomendada (se puede usar cualquier cuantizacion GGUF del base) |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | GGUF (adaptador LoRA en F16, compatible con llama.cpp) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA, no un modelo completo. Se entreno mediante aprendizaje por refuerzo (RL) dentro de Hermes Agent, el entorno de agentes de Nous Research, y posteriormente se convirtio desde el adaptador PEFT original a GGUF con `convert_lora_to_gguf.py` de llama.cpp en precision F16. El adaptador se entreno sobre los pesos BF16 del modelo base, de modo que la fidelidad al comportamiento entrenado depende de lo cerca que este la cuantizacion del base respecto a BF16; el autor recomienda Q8_0 como valor por defecto.

El modelo base es `LiquidAI/LFM2.5-24B-A2B`, de Liquid AI, cuya arquitectura concreta (transformer, MoE u otra) no se detalla en la informacion proporcionada. El nombre sugiere una arquitectura de mezcla de expertos con 24B de parametros totales y 2B activos, pero este dato no aparece confirmado en la documentacion disponible. Tampoco se especifican el volumen de tokens de entrenamiento, la composicion del dataset ni los detalles del algoritmo de RL empleado; la model card remite a la del adaptador original para la descripcion del entrenamiento y la evaluacion.

## Capacidades

- Ejecucion de tareas de agente dentro de un bucle multi-paso (Hermes Agent), con uso de herramientas y razonamiento encadenado.
- Uso eficiente de llamadas a herramientas: reduce un 13% las llamadas en las tareas que resuelve, manteniendo una tasa de exito similar a la del modelo base.
- Soporte de tool calling / function calling a traves del servidor compatible con la API de OpenAI que expone `llama serve`.
- Integracion con clientes de agentes mediante endpoint compatible con OpenAI (`base_url` + `api_key`).
- Capacidades del modelo base (generacion de texto, codigo, matematicas, multilingue) no detalladas en la informacion disponible.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion proporcionada.

## Casos de uso

- Agentes autonomos de proposito general: el adaptador esta entrenado especificamente para operar dentro de Hermes Agent, por lo que encaja en flujos donde el modelo debe decidir que herramienta invocar, ejecutarla y continuar el razonamiento con el resultado.
- Automatizacion de analisis de datos: el ejemplo de la model card (`"Which region had the highest revenue growth in sales.csv?"`) ilustra el uso tipico, donde el agente lee un fichero, ejecuta calculos y responde; el contexto de 64k tokens permite incluir datasets o historiales extensos.
- Reduccion de coste en pipelines de agentes: al requerir un 13% menos de llamadas a herramientas en tareas resueltas, disminuye el coste por tarea en entornos donde cada invocacion de herramienta tiene coste (APIs, bases de datos, ejecucion de codigo).
- Despliegue local con llama.cpp: al distribuirse como LoRA GGUF sobre un base cuantizado, permite servir el agente en infraestructura propia sin GPUs de gama alta, manteniendo el endpoint compatible con OpenAI.
- Prototipado de agentes en investigacion: util para comparar comportamiento con y sin adaptador sobre el mismo base, aislando el efecto del RL en el uso de herramientas.
- Integracion en asistentes de operaciones: tareas de consulta a sistemas internos via tool calling (consultas a bases de datos, lectura de ficheros, llamadas a servicios) donde el contexto largo y el uso disciplinado de herramientas son criticos.

## Benchmarks y rendimiento

La informacion disponible unicamente reporta la comparacion cualitativa del autor: el adaptador resuelve las tareas aproximadamente con la misma frecuencia que el modelo base, con un 13% menos de llamadas a herramientas en las tareas que ambos resuelven. No se proporcionan cifras absolutas de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

Advertencia del autor: las puntuaciones de la model card original del adaptador se obtuvieron con vLLM en BF16; este fichero GGUF no ha sido reevaluado a traves de llama.cpp, y una base cuantizada puede alejar aun mas los resultados.

| Metrica | Resultado |
|---|---|
| Tasa de exito en tareas | Similar al modelo base (sin cifra absoluta disponible) |
| Llamadas a herramientas | -13% en tareas resueltas por ambos |
| Evaluacion en GGUF | No realizada |
| Benchmarks estandar | no disponible |

## Requisitos de hardware

- El adaptador LoRA en F16 es pequeno (18,7 M de parametros), por lo que su VRAM adicional es marginal; el requisito real lo marca el modelo base.
- El modelo base se sirve en Q8_0 segun la configuracion recomendada por el autor; la VRAM necesaria depende del tamano efectivo del base (no confirmado en la informacion disponible).
- Contexto de 65.536 tokens: la cache KV a esa longitud incrementa de forma significativa el consumo de memoria; el autor no especifica requisitos de VRAM para esta configuracion.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Despliegue: llama.cpp (`llama serve`) con soporte de `--lora`; cliente Hermes Agent. No se documenta soporte de vLLM, TGI u Ollama para este adaptador GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B-hermes-v2-GGUF (este) | Adaptador 18,7 M sobre base de 24B (segun nombre) | 65.536 tokens | GGUF (LoRA F16) | lfm1.0 | Ajustado con RL para agentes; -13% llamadas a herramientas |
| LFM2.5-24B-A2B (base, LiquidAI) | 24B totales / 2B activos (segun nombre) | no disponible | safetensors, GGUF | lfm1.0 | Modelo base sin ajuste de agente |
| LFM2.5-24B-A2B-hermes-v2 (adaptador PEFT) | Adaptador | no disponible | PEFT | lfm1.0 | Version original del adaptador, evaluada en vLLM/BF16 |

No se dispone de datos de rendimiento comparativo con modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No reevaluado en GGUF: las metricas del autor provienen de vLLM en BF16; el comportamiento a traves de llama.cpp y con base cuantizada puede diferir.
- Dependencia del base: el adaptador solo funciona sobre `LiquidAI/LFM2.5-24B-A2B`; no es un modelo autonomo y requiere descargar el GGUF del base por separado.
- Licencia lfm1.0: es una licencia "other" con terminos propios; deben revisarse las condiciones de uso comercial antes de desplegar en produccion.
- Idiomas soportados no documentados; no hay garantia de cobertura multilingue.
- Riesgo de alucinacion inherente al modelo base; no se documentan evaluaciones de sesgo ni de robustez para este adaptador.
- Contexto minimo exigido por Hermes (64.000 tokens) implica un coste de memoria de cache KV elevado.
- Repositorio sin descargas ni likes y creado recientemente: no hay evidencia de uso en produccion ni validacion independiente.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito.

## Enlaces

- Repositorio GGUF: https://huggingface.co/harness-hub/LFM2.5-24B-A2B-hermes-v2-GGUF
- Adaptador original (PEFT): https://huggingface.co/harness-hub/LFM2.5-24B-A2B-hermes-v2
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- GGUF del modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-GGUF
- Licencia: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B/blob/main/LICENSE
- Hermes Agent (Nous Research): https://github.com/NousResearch/hermes-agent
- llama.cpp: https://github.com/ggml-org/llama.cpp
