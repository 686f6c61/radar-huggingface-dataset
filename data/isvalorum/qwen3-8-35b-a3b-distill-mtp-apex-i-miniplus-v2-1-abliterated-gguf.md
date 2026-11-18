# IsValorum/Qwen3.8-35B-A3B-Distill-MTP-APEX-I-MiniPlus-V2.1-Abliterated-GGUF

## Resumen

Qwen3.8-35B-A3B-Distill-MTP-APEX-I-MiniPlus-V2.1-Abliterated-GGUF es una cuantizacion GGUF de la familia Qwen3.8, publicada por el usuario independiente IsValorum. Se trata de una version "abliterated" (ablacion de rechazos) del modelo base empero-ai/Qwen3.8-35B-A3B-Distill, un modelo de arquitectura Mixture-of-Experts (MoE) con 34.660.610.688 parametros totales y aproximadamente 3.000 millones de parametros activos por token (la designacion A3B lo indica). El autor aplica su propio esquema de cuantizacion quirurgica tensor a tensor, denominado APEX-I-MiniPlus V2.1, orientado a preservar la fidelidad de clase Q5/Q6 sin un limite fijo de tamano de fichero.

El modelo resuelve el problema de desplegar un MoE de ~35B en hardware de consumo y en estaciones de trabajo con VRAM limitada, manteniendo contexto completo de 256K y soporte de decodificacion especulativa mediante cabezas MTP (multi-token prediction) integradas. La relevancia actual radica en que combina tres factores poco frecuentes en un mismo artefacto: cuantizacion personalizada auditada, contexto largo completo en 24 GB de VRAM segun el autor, y eliminacion direccional de rechazos para flujos donde el filtrado por alineamiento resulta un obstaculo.

El repo ocupa 18,5 GB y acumula 115.013 descargas y 79 likes en el momento de la consulta. La licencia declarada es Apache 2.0 y cubre trece idiomas, entre ellos castellano, ingles, chino, frances, aleman, portugues, italiano, ruso, japones, coreano, vietnamita, tailandes y arabe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (tag qwen35moe), con cabezas MTP (multi-token prediction) |
| Parametros totales | 34.660.610.688 |
| Parametros activos | ~3B (designacion A3B; cifra exacta no disponible) |
| Longitud de contexto | 256K tokens (segun model card) |
| Tipos de cuantizacion | GGUF con esquema propietario APEX-I-MiniPlus V2.1; variantes MiniPlus (fidelidad Q5-Q6) y NanoPlus (calidad Q4); incluye companeros Q8_0 para MTP y vision |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); repo de 18,5 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas MoE de tipo qwen35moe, con 34,66 mil millones de parametros totales y aproximadamente 3 mil millones activos por token, lo que reduce el coste computacional por token a un orden comparable al de un modelo denso de 3B. Incorpora cabezas MTP (multi-token prediction), que permiten decodificacion especulativa nativa y aceleran la generacion en llama.cpp cuando el companero Q8_0 de MTP se carga junto al modelo principal. El contexto declarado alcanza 256K tokens.

No se dispone de informacion detallada sobre el dataset de entrenamiento del modelo base (numero de tokens, composicion, fases de RLHF/DPO) en la informacion proporcionada. El proceso de "abliterated" consiste en una ablacion direccional de rechazos aplicada sobre el modelo alineado, orientada a reducir la tasa de respuestas negativas; el autor no documenta en la model card la metodologia exacta ni el conjunto de evaluacion empleado para verificarla. La cuantizacion se realiza tensor a tensor con mapa quirurgico auditado desde el propio GGUF, e incluye imatrix.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-paso, con modo de razonamiento (tag reasoning) y control de esfuerzo de razonamiento mediante plantilla de chat endurecida.
- Soporte de tool calling y function calling, con plantilla de chat preparada para agentes.
- Capacidades multimodales parciales: el autor distribuye un companero de vision en Q8_0, aunque la model card no detalla el alcance exacto.
- Decodificacion especulativa mediante cabezas MTP integradas, con companero Q8_0 dedicado.
- Multilingue en trece idiomas, incluido castellano.
- Comportamiento sin rechazos (abliterated), orientado a reducir negativas en dominios sensibles.
- Compatible con endpoints (tag endpoints_compatible) y con llama.cpp en CUDA, Vulkan y CPU.

## Casos de uso

- Agentes locales con herramientas: el modelo puede ejecutar bucles de razonamiento y llamadas a funciones en llama.cpp o en el agente de escritorio V-Agent del mismo autor, con permisos explicitos y contexto de 256K para mantener historiales largos de herramientas.
- Analisis de repositorios y documentos extensos: con 256K tokens de ventana cabe un arbol de codigo o un corpus documental completo en una sola pasada, evitando troceado y perdida de coherencia entre fragmentos.
- Despliegue en estaciones de 24 GB: segun el autor, la variante MiniPlus permite ejecutar el contexto completo de 256K en 24 GB de VRAM, lo que habilita asistentes de contexto largo en una unica RTX 4090.
- Investigacion sobre alineamiento y robustez: la variante abliterated sirve para estudiar el efecto de la ablacion de rechazos sobre comportamiento, sesgos y calidad, comparandola con la version no ablacionada de la misma familia.
- Generacion de codigo en pipelines: el soporte de tool calling y la plantilla de chat permiten integrarlo en flujos de CI/CD para revision, parcheo y generacion de pruebas, con la advertencia del autor sobre penalizacion de repeticion y sintaxis.
- Procesamiento multilingue en produccion: cubre trece idiomas con un unico checkpoint, util para atencion al cliente o traduccion interna en empresas con operacion en varios mercados.
- Inferencia con offload parcial a RAM del sistema: el diseno admite inferencia total o parcial en RAM, lo que permite servir el modelo en maquinas sin GPU de gran VRAM a costa de latencia.

## Benchmarks y rendimiento

La model card reporta mejoras de perplejidad WikiText-2 frente a GSQ-RCO IQ3_S (PPL 7,07) para la linea V3 de 27B, no para este modelo de 35B. Para el presente artefacto no se publican resultados de MMLU, HumanEval, GSM8K ni equivalentes.

| Metrica | Resultado | Referencia |
|---|---|---|
| WikiText-2 PPL (este modelo 35B) | no disponible | no disponible |
| WikiText-2 PPL (27B MiniPlus V3) | +13,21% vs GSQ-RCO IQ3_S | GSQ-RCO IQ3_S = 7,07 |
| WikiText-2 PPL (27B NanoPlus V3) | +11,49% vs GSQ-RCO IQ3_S | GSQ-RCO IQ3_S = 7,07 |
| MMLU / HumanEval / GSM8K | no disponible | no disponible |

No se han publicado resultados de benchmarks estandar en la informacion disponible para este modelo concreto.

## Requisitos de hardware

- VRAM estimada: el repo completo ocupa 18,5 GB; la variante MiniPlus se situa en la franja de fidelidad Q5-Q6 y NanoPlus en calidad Q4, por lo que el peso en VRAM depende del fichero elegido (cifras por variante no disponibles).
- El autor afirma que el contexto completo de 256K cabe en 24 GB de VRAM con la configuracion recomendada.
- GPU recomendadas: RTX 4090 (24 GB) para contexto completo; RTX 30 y 40 series con offload parcial; RTX 50 series segun la tabla de throughput del autor; A100/H100 para despliegues multi-usuario.
- Cabe en GPU de consumo: si, en RTX 4090 y previsiblemente en GPUs de 16-24 GB con cuantizaciones NanoPlus y contexto reducido.
- Opciones de despliegue: llama.cpp (CUDA, Vulkan, CPU), V-Agent (agente de escritorio del autor), y motores compatibles con endpoints. No se confirma soporte de vLLM ni TGI en la informacion disponible.
- Latencia y throughput: el autor incluye una seccion de benchmarks de throughput y offload para RTX 30/40/50 y streaming desde RAM, pero las cifras concretas no estan disponibles en el extracto proporcionado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (35B-A3B abliterated) | 34,66B totales, ~3B activos | 256K | Apache 2.0 | GGUF cuantizado, sin rechazos, MTP |
| Qwen3.6-35B-A3B MTP APEX-I-MiniPlus-V2.1 | ~35B totales, ~3B activos | no disponible | Apache 2.0 (presumible) | Version no ablacionada, mismo autor y esquema |
| Qwen3.6-35B-A3B MTP APEX-I-MiniPlus-V2.1 Abliterated | ~35B totales, ~3B activos | no disponible | Apache 2.0 (presumible) | Generacion anterior ablacionada |
| Qwen3.8 27B VAL-APEX-I MiniPlus V3 | 27B densos | no disponible | Apache 2.0 (presumible) | Denso, 14,16 GB, mejor PPL reportada |

## Limitaciones y advertencias

- La ablacion de rechazos reduce las negativas del modelo pero no elimina sesgos subyacentes ni garantiza exactitud factual; el riesgo de alucinacion persiste.
- El autor advierte de un problema especifico de sintaxis en generacion de codigo relacionado con la penalizacion de repeticion (intercambio de caracteres); requiere ajustar los parametros de generacion.
- La model card recomienda parametros de generacion oficiales de empero-ai; desviarse de ellos puede degradar la calidad.
- El esquema de cuantizacion es propietario y no ha sido validado de forma independiente en benchmarks estandar; las cifras de perplejidad publicadas corresponden a otra familia (27B), no a este modelo.
- El soporte multimodal depende de un companero Q8_0 separado y su alcance no esta detallado.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base empero-ai antes de uso comercial, ya que la cadena de licencias no esta documentada en detalle.
- El modelo esta pensado para inferencia local; el despliegue multi-usuario en produccion no esta documentado y el soporte de vLLM/TGI no se confirma.
- La fecha de creacion del repo (2026-09-20) y la denominacion Qwen3.8 no coinciden con el catalogo publico conocido de Qwen; verificar la procedencia del modelo base antes de adoptarlo en entornos criticos.

## Enlaces

- Hugging Face: https://huggingface.co/IsValorum/Qwen3.8-35B-A3B-Distill-MTP-APEX-I-MiniPlus-V2.1-Abliterated-GGUF
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill
- Coleccion APEX-I MiniPlus V2.1 Abliterated: https://huggingface.co/collections/IsValorum/apex-i-miniplus-v21-abliterated-moe-6acfee762fc4a8cf2298c55b
- Qwen3.8 27B MiniPlus V3: https://huggingface.co/IsValorum/Qwen3.8-27B-VAL-APEX-I-MiniPlus-V3-GGUF
- Qwen3.8 27B NanoPlus V3: https://huggingface.co/IsValorum/Qwen3.8-27B-VAL-APEX-I-NanoPlus-V3-GGUF
- Qwen3.6-35B-A3B MTP APEX-I-MiniPlus-V2.1: https://huggingface.co/IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-MiniPlus-V2.1-GGUF
- Qwen3.6-35B-A3B MTP APEX-I-MiniPlus-V2.1 Abliterated: https://huggingface.co/IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-MiniPlus-V2.1-Abliterated-GGUF
- Ornith 1.5 APEX-I-MiniPlus-V2.1: https://huggingface.co/IsValorum/Ornith-1.5-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF
- Tiel Coder APEX-I-MiniPlus-V2.1: https://huggingface.co/IsValorum/Tiel-Coder-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF
- V-Agent (agente de escritorio): https://github.com/IsValorum/V-Agent
- Apoyo al autor: https://ko-fi.com/isvalorum
