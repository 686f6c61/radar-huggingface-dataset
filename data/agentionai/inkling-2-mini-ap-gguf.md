# agentionai/Inkling-2-Mini-AP-GGUF

## Resumen

Inkling-2-Mini AP es una cuantizacion GGUF del modelo base thinkingmachines/Inkling-2-Mini, publicada por agentionai bajo licencia Apache 2.0. El modelo original es un transformer de tipo mezcla de expertos (MoE) de Thinking Machines con 26.400 millones de parametros totales y 3.400 millones activos por token, distribuidos en 128 expertos con 8 activos por token. La cuantizacion esta disenada especificamente para cargas de trabajo agenticas y de uso de herramientas, y se distribuye en dos unicos ficheros compatibles con llama.cpp estandar, sin necesidad de forks.

El modelo resuelve el problema de desplegar un MoE de 26B en hardware de consumo o en estaciones de trabajo con GPU unica: el fichero AP-IQ2_XXS ocupa 8,49 GB y consume unos 15,05 GB de VRAM a 131k de contexto con KV cache en q8_0, mientras que AP-Q3_K_XL ocupa 13,63 GB y unos 20,21 GB de VRAM. Ambos ficheros se ejecutan integramente en GPU con llama-server sobre llama.cpp upstream b12600-44 o superior.

La relevancia actual radica en su enfoque de cuantizacion orientada a agentes: la version 1.2 de AP-IQ2_XXS se re-codifica con datos de uso de herramientas, reduciendo la deriva (divergencia KL) un 12% frente a la version 1.1 en sesiones de agente no vistas durante la codificacion y un 15% frente a UD-IQ2_XXS de Unsloth en transcripciones de llamadas a herramientas al mismo tamano. AP-Q3_K_XL reduce la deriva un 16% frente a UD-Q3_K_XL en llamadas a herramientas, un 11% en texto reservado, un 7% en codigo y un 7% en texto web.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), 128 expertos, 8 activos por token |
| Parametros totales | 26.070.385.152 (26,4B) |
| Parametros activos | 3,4B por token |
| Longitud de contexto | 131.072 tokens (131k) |
| Tipos de cuantizacion | AP-IQ2_XXS (8,49 GB) y AP-Q3_K_XL (13,63 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos de 26,4B parametros totales y 3,4B activos por token, con 128 expertos y 8 seleccionados por token. Esta ficha corresponde a la cuantizacion GGUF, no al modelo original; la informacion disponible no detalla la composicion del dataset de entrenamiento, el numero de tokens ni si se aplicaron tecnicas de RLHF o DPO en el modelo base.

La innovacion tecnica de esta publicacion reside en el proceso de cuantizacion. AP-Q3_K_XL conserva las escalas por experto del modelo original, lo que exige usar llama.cpp upstream b12600-44 o superior, o el fork gyro-inkling-v2 de agentionai; la etiqueta antigua gyro-inkling-v1 descarta esas escalas y produce resultados incorrectos, y la rama master de halo-box/strix-llama.cpp tambien da salida erronea hasta que se fusione su PR #320. AP-IQ2_XXS v1.2 se re-codifica con datos de uso de herramientas de tipo agentico para reducir la deriva en tareas de llamada a funciones. Los ficheros incluyen los valores por defecto de muestreo del modelo base (temperatura 1.0, top-p 1.0, top-k 50), que llama-server aplica salvo que se sobrescriban.

## Capacidades

- Generacion de texto conversacional y continuacion de texto.
- Razonamiento multi-paso y ejecucion de tareas agenticas.
- Llamada a herramientas (tool calling) y uso de funciones, con cuantizacion optimizada especificamente para transcripciones de llamadas a herramientas.
- Integracion con agentes de programacion (el modelo se promociona para el agente de codificacion Marshall de agentionai).
- Soporte de contexto largo de hasta 131.072 tokens.
- Compatibilidad con endpoints (tag endpoints_compatible) para su uso detras de APIs compatibles.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Agentes de codificacion en local: el modelo puede conectarse a un agente tipo Marshall apuntando a `http://localhost:8080` con llama-server, usando AP-Q3_K_XL para mayor fidelidad al modelo original en generacion de codigo (deriva KL de 0,0060 frente a 0,0065 de UD-Q3_K_XL).
- Automatizacion de llamadas a herramientas en produccion: AP-IQ2_XXS v1.2 esta re-codificado con datos de uso de herramientas y reduce un 15% la deriva frente a UD-IQ2_XXS en transcripciones de tool calls al mismo tamano, lo que lo hace adecuado para pipelines de agentes que invocan APIs externas.
- Despliegue en estacion de trabajo con GPU unica: con 8,49 GB en disco y unos 15,05 GB de VRAM a 131k de contexto, AP-IQ2_XXS cabe en GPUs de consumo de gama alta y permite ejecutar un MoE de 26B sin infraestructura de servidor.
- Procesamiento de documentos largos: la ventana de 131k tokens permite resumir, extraer y razonar sobre contratos, informes o bases de codigo extensas en una sola pasada.
- Asistente conversacional multi-turno: los valores de muestreo incluidos (temperatura 1.0, top-p 1.0, top-k 50) y el formato GGUF con plantilla jinja (`--jinja`) permiten integrarlo en aplicaciones de chat con historial largo.
- Evaluacion y experimentacion en investigacion: al ser una cuantizacion de un MoE con 3,4B parametros activos, permite estudiar el comportamiento de modelos MoE en hardware modesto y comparar la fidelidad de distintas estrategias de cuantizacion mediante divergencia KL.
- Inferencia en hardware AMD Strix Halo: probado con Vulkan en Radeon 8060S, con 465 tok/s de lectura de prompt y 25,0 tok/s de generacion para AP-IQ2_XXS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card proporciona metricas de fidelidad de cuantizacion y de rendimiento de inferencia:

| Metrica | AP-Q3_K_XL | UD-Q3_K_XL (Unsloth) | AP-IQ2_XXS v1.2 | UD-IQ2_XXS (Unsloth) |
|---|---|---|---|---|
| Deriva KL, texto reservado | 0,0145 | 0,0163 | no disponible | no disponible |
| Deriva KL, codigo | 0,0060 | 0,0065 | no disponible | no disponible |
| Deriva KL, llamadas a herramientas | 0,0116 | 0,0138 | no disponible | no disponible |
| Deriva KL, texto web | 0,0095 | 0,0103 | no disponible | no disponible |
| Test de agente (44 ejecuciones) | no disponible | no disponible | 42 aprobadas | no disponible |

| Metrica de inferencia (Vulkan, AMD Strix Halo Radeon 8060S) | AP-IQ2_XXS | AP-Q3_K_XL |
|---|---|---|
| Lectura de prompt (tok/s) | 465 | 431 |
| Generacion (tok/s) | 25,0 | 22,5 |

Las cifras de inferencia corresponden a llama-bench pp512 / tg128, mediana de 3 ejecuciones, sobre el fork gyro-inkling-v2; AP-IQ2_XXS se midio sobre v1.1, que tiene el mismo tamano y diseno.

## Requisitos de hardware

- VRAM estimada: unos 15,05 GB para AP-IQ2_XXS y unos 20,21 GB para AP-Q3_K_XL, con KV cache en q8_0 y contexto de 131k tokens.
- GPU recomendadas: no se especifican modelos concretos; la model card documenta pruebas en AMD Strix Halo con Radeon 8060S mediante Vulkan.
- GPU de consumo: AP-IQ2_XXS (15,05 GB en uso) puede caber en GPUs de consumo con 16 GB o mas de VRAM; AP-Q3_K_XL (20,21 GB) requiere GPUs de 24 GB o mas. No se confirma compatibilidad con modelos concretos en la informacion disponible.
- Opciones de despliegue: llama.cpp upstream b12600-44 o superior, o el fork gyro-inkling-v2 de agentionai. No se mencionan vLLM, Ollama ni TGI en la informacion disponible.
- Ajuste obligatorio: `ulimit -s unlimited`, necesario para todos los GGUF de Inkling-2-Mini porque secuencias largas de un mismo caracter desbordan la pila del tokenizador.
- Latencia y throughput: 465 tok/s de prompt y 25,0 tok/s de generacion para AP-IQ2_XXS en Radeon 8060S; 431 y 22,5 tok/s respectivamente para AP-Q3_K_XL.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini AP (esta ficha) | 26,4B totales / 3,4B activos | 131k | Apache 2.0 | GGUF | Dos cuantizaciones orientadas a agentes |
| Inkling-2-Mini (base) | 26,4B totales / 3,4B activos | no disponible | no disponible | no disponible | Modelo original de Thinking Machines |
| UD-Q3_K_XL (Unsloth) | 26,4B totales / 3,4B activos | no disponible | no disponible | GGUF | 13,63 GB; mayor deriva KL que AP-Q3_K_XL en las cuatro metricas |
| UD-IQ2_XXS (Unsloth) | 26,4B totales / 3,4B activos | no disponible | no disponible | GGUF | 8,49 GB; 15% mas de deriva en tool calls que AP-IQ2_XXS v1.2 |

## Limitaciones y advertencias

- La cuantizacion introduce deriva respecto al modelo original; las metricas KL publicadas cuantifican esa perdida pero no sustituyen una evaluacion en el dominio de uso concreto.
- AP-Q3_K_XL depende de la version del runtime: versiones antiguas o forks no actualizados producen salida incorrecta al descartar las escalas por experto.
- Es necesario aplicar `ulimit -s unlimited`; de lo contrario, secuencias largas de un mismo caracter pueden provocar desbordamiento de pila en el tokenizador.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad del modelo base.
- Los idiomas soportados no estan documentados en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base thinkingmachines/Inkling-2-Mini, cuya licencia no se especifica en esta ficha.
- El repositorio registra 0 descargas en el momento de la consulta, por lo que la validacion comunitaria es practicamente inexistente.
- No se han publicado resultados de benchmarks estandar, lo que limita la comparacion con alternativas de la misma categoria.

## Enlaces

- Hugging Face: https://huggingface.co/agentionai/Inkling-2-Mini-AP-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Web de agentionai: https://www.agention.ai/
- Agente de codificacion Marshall: https://marshall.agention.ai
- Fieldwork Ledger: https://www.fieldworkledger.com
- Fork de llama.cpp gyro-inkling-v2: https://gitlab.com/agentionai-group/llama.cpp/-/tree/gyro-inkling-v2
