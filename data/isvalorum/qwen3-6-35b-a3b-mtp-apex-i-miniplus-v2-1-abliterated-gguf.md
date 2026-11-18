# IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-MiniPlus-V2.1-Abliterated-GGUF

## Resumen

Qwen3.6-35B-A3B-MTP-APEX-I-MiniPlus-V2.1-Abliterated-GGUF es una cuantizacion GGUF de la familia Qwen3.6, publicada por el usuario independiente IsValorum. Se trata de una version "abliterated" (sin rechazos, tambien etiquetada como uncensored) del modelo base Qwen/Qwen3.6-35B-A3B, un transformer de tipo Mixture-of-Experts (MoE) con 34.660.610.688 parametros totales, del que se activan aproximadamente 3.000 millones por token (la designacion A3B indica 3B activos). El modelo base es multimodal (image-text-to-text), con capacidades de razonamiento, codigo, uso de herramientas y agentes, y soporte de decodificacion especulativa mediante MTP (Multi-Token Prediction).

La relevancia de esta ficha es doble: por un lado, documenta un MoE de ~35B con contexto nativo de 256K que puede ejecutarse en GPU de consumo gracias a su reducido numero de parametros activos; por otro, ejemplifica la practica de la "abliteration", una modificacion de pesos orientada a eliminar los comportamientos de rechazo aprendidos en el alineamiento, con implicaciones legales y de seguridad que conviene tener presentes en produccion.

El autor distribuye el modelo en formato GGUF con cuantizaciones "quirurgicas" por tensor (mapa de cuantizacion auditado desde el propio GGUF), acompanado de un modulo MTP dedicado en Q8_0 y un componente de vision separado. La licencia declarada es Apache 2.0, heredada del modelo base, y el pipeline es image-text-to-text.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (Qwen3.6, familia qwen3_5_moe) con MTP |
| Parametros totales | 34.660.610.688 (~34,7B) |
| Parametros activos | ~3B (designacion A3B; valor exacto no disponible) |
| Longitud de contexto | 256K tokens (segun model card) |
| Tipos de cuantizacion | GGUF con cuantizacion personalizada por tensor (APEX-I-MiniPlus V2.1); cuantizaciones concretas por archivo no detalladas en la informacion disponible |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); modulo MTP en Q8_0 y componente de vision como archivos companeros |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer de tipo Mixture-of-Experts: de los ~34,7B parametros totales, solo se activan alrededor de 3B por token, lo que reduce el coste computacional de inferencia manteniendo la capacidad de representacion de un modelo de mayor tamano. Incorpora MTP (Multi-Token Prediction), que permite decodificacion especulativa y, por tanto, un aumento del throughput de generacion. El pipeline declarado es image-text-to-text, por lo que el modelo base integra un codificador visual y capacidades multimodales.

Sobre el entrenamiento del modelo base no se aporta informacion en la documentacion disponible (numero de tokens, composicion del dataset, uso de RLHF/DPO u otras etapas de alineamiento): no disponible. La intervencion de IsValorum consiste en una cuantizacion GGUF con asignacion diferenciada de precision por tensor, auditada desde el propio archivo GGUF, mas una ablacion direccional de los rechazos ("true directional refusal ablation") que da lugar a la variante Abliterated. El autor declara que el calculo se realizo de forma independiente en clusters de nube privados, sin acceso a la infraestructura del desarrollador original.

## Capacidades

- Generacion de texto y razonamiento general, con modo de razonamiento configurable ("reasoning effort") mediante plantilla de chat endurecida.
- Generacion de codigo y tareas de ingenieria de software, con etiquetas que referencian SWE-bench en la metadata del modelo.
- Capacidades multimodales de vision (image-text-to-text) mediante el componente de vision companero.
- Tool calling y function calling, orientado a flujos agenticos.
- Razonamiento multi-paso y uso de agentes.
- Decodificacion especulativa via MTP para acelerar la generacion.
- Multilingue en 13 idiomas: ingles, chino, espanol, frances, aleman, portugues, italiano, ruso, japones, coreano, vietnamita, tailandes y arabe.
- Comportamiento sin rechazos (abliterated/uncensored): el modelo no aplica las negativas de seguridad del alineamiento original.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede sostener conversaciones multi-turno con historial extenso gracias a su ventana de 256K tokens, y el bajo numero de parametros activos permite servir varias sesiones concurrentes en una sola GPU.
- Generacion de codigo en produccion: con soporte de tool calling, puede integrarse en pipelines de CI/CD para revision de parches, generacion de tests o resolucion de issues acotadas; el modulo MTP reduce la latencia en bucles de generacion largos.
- Agentes autonomos de investigacion: la combinacion de razonamiento multi-paso, contexto largo y uso de herramientas permite construir agentes que consulten APIs, lean documentacion extensa y sinteticen resultados.
- Procesamiento de documentos con imagenes: al ser image-text-to-text, sirve para extraer informacion de capturas, diagramas o formularios escaneados junto con el texto que los acompana.
- Analisis de repositorios y bases de codigo: el contexto de 256K permite cargar varios archivos y mantener coherencia entre ellos en tareas de refactorizacion o auditoria.
- Despliegue local en estaciones de trabajo: con cuantizacion agresiva y offload parcial a RAM del sistema, el modelo puede ejecutarse en equipos con GPU de consumo, lo que facilita prototipado sin coste de API.
- Investigacion sobre alineamiento y seguridad: la variante abliterated es util como objeto de estudio para medir como cambia el comportamiento del modelo al eliminar las capas de rechazo, siempre en entornos controlados.
- Asistentes multilingues: la cobertura de 13 idiomas permite desplegar un unico modelo para soporte en mercados con lenguas diversas.

## Benchmarks y rendimiento

La model card incluye referencias a un "Independent Benchmark of the APEX-I-MiniPlus Family (Occamy V2 Reference)", a una seccion de "Empirical Benchmarks & Fidelity Verification" y a un espectro de calidad frente a cuantizaciones planas estandar. Sin embargo, en la informacion proporcionada no se incluyen los valores numericos de dichos benchmarks (MMLU, HumanEval, GSM8K, WikiText-2 PPL u otros) para este modelo concreto. Los unicos datos cuantitativos de rendimiento presentes corresponden a otras releases del autor (por ejemplo, mejoras de PPL en WikiText-2 frente a GSQ-RCO IQ3_S para los modelos de 27B), no a este modelo.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 18,4 GB, por lo que la cuantizacion principal cabe en GPUs de 24 GB con margen para contexto moderado; la model card menciona explicitamente un escenario de "24GB miracle" con contexto completo de 256K en VRAM, aunque el detalle de configuracion no se reproduce en la informacion disponible.
- GPUs recomendadas: no se detalla una lista concreta; la model card incluye una seccion de throughput y offload para RTX 30, RTX 40 y RTX 50, ademas de streaming desde RAM del sistema.
- GPU de consumo: si, el modelo esta disenado para caber en GPUs de consumo de 24 GB y para ejecucion con offload parcial a RAM en equipos con menos VRAM.
- Opciones de despliegue: llama.cpp (formato GGUF nativo); la etiqueta endpoints_compatible sugiere compatibilidad con endpoints de inferencia, pero no se especifican vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no se proporcionan cifras concretas en la informacion disponible; la decodificacion especulativa via MTP esta pensada para mejorar el throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B MTP APEX-I-MiniPlus V2.1 Abliterated (este) | ~34,7B | ~3B | 256K | Apache 2.0 | Variante sin rechazos, GGUF, con MTP y vision |
| Qwen3.6-35B-A3B MTP APEX-I-MiniPlus V2.1 (alineado) | ~34,7B | ~3B | 256K | Apache 2.0 | Misma base con guardrails por defecto; 15,23 GB, fidelidad Q5_K_L |
| Ornith 1.5 35B-A3B APEX-I-MiniPlus V2.1 | ~35B | ~3B | no disponible | no disponible | Enfocado a ingenieria de software y agentes de repositorio |
| Tiel Coder 35B-A3B APEX-I-MiniPlus V2.1 | ~35B | ~3B | no disponible | no disponible | Especialista en codigo agentico y uso iterativo de herramientas |

Las tres alternativas proceden del mismo autor y comparten metodologia de cuantizacion, pero son familias de modelos distintas, no variantes intercambiables del mismo modelo. No se dispone de datos de rendimiento comparativo entre ellas en la informacion proporcionada.

## Limitaciones y advertencias

- La ablacion de rechazos elimina las barreras de seguridad del alineamiento original: el modelo puede generar contenido danino, ilegal o inseguro sin las negativas habituales. No es adecuado para aplicaciones de cara al publico sin filtros externos.
- La licencia Apache 2.0 permite uso comercial, pero el uso de una variante abliterated puede incumplir politicas de plataformas, terminos de servicio de proveedores de inferencia o normativa sectorial; la responsabilidad recae en el desplegador.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no mitigado por la cuantizacion; en tareas factuales requiere verificacion.
- La cuantizacion GGUF introduce perdida de fidelidad respecto a los pesos originales en BF16/FP16; el autor reporta mejoras frente a cuantizaciones planas, pero no se aportan cifras para este modelo concreto.
- La model card advierte de un problema especifico de sintaxis en generacion de codigo relacionado con el repeat penalty ("character swapping"), que puede degradar la salida si no se ajustan los parametros de generacion recomendados.
- El contexto de 256K en VRAM depende de la configuracion de KV cache y del hardware; en GPUs de 24 GB puede requerir cuantizacion de la cache o compromisos de contexto efectivo.
- La cobertura de 13 idiomas no garantiza calidad uniforme; el rendimiento en idiomas de bajos recursos del conjunto puede ser inferior al de ingles y chino.
- Modelo publicado por un tercero independiente, no por el equipo de Qwen: no cuenta con el mismo nivel de validacion, soporte ni auditoria que una release oficial.
- No se dispone de informacion sobre sesgos especificos medidos para esta variante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-MiniPlus-V2.1-Abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Version alineada del mismo autor: https://huggingface.co/IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-MiniPlus-V2.1-GGUF
- Coleccion APEX-I MiniPlus V2.1 Abliterated: https://huggingface.co/collections/IsValorum/apex-i-miniplus-v21-abliterated-moe-6acfee762fc4a8cf2298c55b
- Ornith 1.5 APEX-I-MiniPlus-V2.1: https://huggingface.co/IsValorum/Ornith-1.5-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF
- Tiel Coder APEX-I-MiniPlus-V2.1: https://huggingface.co/IsValorum/Tiel-Coder-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF
- Qwen3.8 27B MiniPlus V3: https://huggingface.co/IsValorum/Qwen3.8-27B-VAL-APEX-I-MiniPlus-V3-GGUF
- Qwen3.8 27B NanoPlus V3: https://huggingface.co/IsValorum/Qwen3.8-27B-VAL-APEX-I-NanoPlus-V3-GGUF
- Swift-1.5 Qwen3.8 27B Uncensored MTP MiniPlus V3: https://huggingface.co/IsValorum/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-VAL-APEX-I-MiniPlus-V3-GGUF
- Swift-1.5 Qwen3.8 27B Uncensored MTP NanoPlus V3: https://huggingface.co/IsValorum/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-VAL-APEX-I-NanoPlus-V3-GGUF
- Apoyo al autor: https://ko-fi.com/isvalorum
