# IsValorum/Qwen3.8-27B-pi-adapted-VAL-APEX-I-MiniPlus-V3-GGUF

## Resumen

Qwen3.8-27B-pi-adapted-VAL-APEX-I-MiniPlus-V3-GGUF es una cuantizacion GGUF del modelo base `harness-hub/Qwen3.8-27B-pi-adapted`, publicada por el usuario IsValorum dentro de su serie de cuantizaciones APEX. El modelo original parte de la familia Qwen 3.8 (arquitectura etiquetada como `qwen35`) con 27.320.697.856 parametros (unos 27,3 mil millones) y esta orientado a generacion de texto y flujos de agentes, segun las etiquetas del repositorio (`agents`, `mtp`, `pi`).

Esta variante concreta, denominada MiniPlus, ocupa 13,31 GiB en disco y emplea una mezcla quirurgica de tipos de cuantizacion (Q4_K, Q5_K, Q6_K, IQ3_S, IQ3_XXS, IQ4_XS, Q4_0, Q4_1 y F32) asignada tensor por tensor. El autor documenta el mapa completo de precisiones y lo presenta como auditado a partir del GGUF fisico, con protecciones en F32 para tensores recurrentes y del modulo MTP (multi-token prediction).

Su relevancia practica es doble: por un lado, permite ejecutar un modelo de ~27B en hardware de consumo con llama.cpp; por otro, el autor lo integra con su propio cliente de escritorio V-Agent para flujos de agentes locales con acceso a herramientas y MCP. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35` (transformer, segun etiqueta del autor) |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mezcla por tensor: Q4_0, Q4_K, Q4_1, Q5_K, Q6_K, IQ3_S, IQ3_XXS, IQ4_XS, F32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (libreria `gguf`, compatible con llama.cpp) |
| Tamano del repositorio | 14,3 GB (fichero MiniPlus: 13,31 GiB) |
| Modelo base | `harness-hub/Qwen3.8-27B-pi-adapted` |
| iMatrix | `unsloth/Qwen3.8-27B-GGUF/imatrix_unsloth.gguf` (revision 4af51b3) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no detalla el proceso de entrenamiento del modelo base. El autor indica que la arquitectura es `qwen35` y que el modelo incorpora modulos MTP (multi-token prediction), visibles en los tensores `blk.[N].nextn.*` (`eh_proj`, `enorm`, `hnorm`, `shared_head_norm`). La presencia de tensores `attn_qkv` junto a tensores `attn_q`/`attn_k`/`attn_v` sugiere una combinacion de capas con proyeccion conjunta QKV y capas con proyecciones separadas, si bien no se ofrece el detalle por capa.

La cuantizacion se ha realizado con llama.cpp aplicando una matriz de importancia (iMatrix) procedente de Unsloth y una asignacion manual de precisiones por grupo de tensores: las proyecciones de atencion y compuertas usan mayoritariamente Q4_K/Q5_K/Q6_K, mientras que las proyecciones densas del FFN (`ffn_gate`, `ffn_up`) se comprimen mas agresivamente con IQ3_S e IQ3_XXS y `ffn_down` con IQ4_XS. Los tensores de normalizacion del modulo MTP y las protecciones recurrentes se mantienen en F32 (408 tensores observados). No se documentan datos sobre volumen de tokens, composicion del corpus ni etapas de RLHF/DPO.

## Capacidades

- Generacion de texto conversacional (`pipeline_tag: text-generation`, etiqueta `conversational`).
- Orientacion a flujos de agentes: el autor etiqueta el modelo con `agents` y lo integra en V-Agent con soporte de herramientas y servidores MCP.
- Soporte de tool calling y function calling a traves del cliente V-Agent (herramientas de ficheros, shell, busqueda web, navegador autonomo y peticiones HTTP).
- Razonamiento multi-paso en el contexto de tareas de agente (no se especifica un modo "thinking" explicito).
- Decodificacion con multi-token prediction (MTP) segun los tensores `nextn` presentes en el GGUF.
- Compatibilidad con endpoints OpenAI/Claude mediante el cliente del autor (`endpoints_compatible`).
- Capacidades multilingues: no disponible.
- Vision y audio: no disponible (no se anuncian).

## Casos de uso

- Agente local de escritorio en Windows: el modelo puede cargarse en V-Agent con llama.cpp (CUDA, Vulkan o CPU) y ejecutar tareas con aprobacion por accion, como editar ficheros con historial de versiones, lanzar comandos de shell o consultar la web, gracias a su soporte de herramientas y MCP.
- Asistente de programacion en local: con 27,3 B de parametros y un peso de 13,31 GiB, cabe en GPUs de consumo de 16-24 GB y permite autocompletado, refactorizacion y validacion sintactica de codigo generado dentro del propio cliente V-Agent.
- Automatizacion de tareas de sistema: el modelo puede encadenar peticiones HTTP, lectura de ficheros y comandos de shell en carpetas aisladas, lo que encaja en scripts de mantenimiento o integracion de pipelines internos.
- Chat multi-turno con contexto gestionado por llama.cpp: util para prototipos de atencion al cliente o asistentes internos donde se prioriza ejecucion local y privacidad (sin telemetria en V-Agent).
- Investigacion sobre cuantizacion: el mapa tensor por tensor publicado permite estudiar el impacto de mezclas IQ3/IQ4/Q5/Q6 en un modelo de ~27B, comparando con las variantes NanoPlus (12,37 GiB) y MicroPlus (10,08 GiB) de la misma familia.
- Despliegue en entornos con GPU modesta: al reducir el peso a 13,31 GiB, es viable en estaciones de trabajo con 16 GB de VRAM usando offload parcial a CPU, o en equipos con 24 GB para carga completa.
- Evaluacion de agentes con modelos abiertos: la licencia Apache 2.0 y el formato GGUF facilitan integrarlo en bancos de pruebas de agentes sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero MiniPlus pesa 13,31 GiB; se necesita al menos esa cantidad de VRAM para carga completa en GPU, mas overhead de contexto KV (no cuantificado en la informacion). Con 16 GB de VRAM es ajustado; con 24 GB hay margen para contextos amplios.
- Alternativas de menor huella de la misma familia: NanoPlus (12,37 GiB) y MicroPlus (10,08 GiB), utiles en GPUs de 12-16 GB.
- GPU recomendadas: no disponibles de forma explicita. Por tamano, encaja en RTX 4090 (24 GB), RTX 4080/5080 (16 GB) con contexto moderado, y requiere offload parcial en GPUs de 12 GB. Para despliegues de servidor, A100/H100 permitirian carga completa y mayor contexto, aunque no se aportan mediciones.
- Opciones de despliegue: llama.cpp (builds oficiales CUDA, Vulkan y CPU), cliente V-Agent del autor, y cualquier runtime compatible con GGUF (Ollama, LM Studio, etc., segun el ecosistema estandar de llama.cpp). No se confirma soporte especifico de vLLM o TGI para este GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-pi-adapted VAL-APEX-I MiniPlus (este) | ~27,3 B | no disponible | GGUF, 13,31 GiB | Apache 2.0 | Mezcla IQ3/IQ4/Q5/Q6 con iMatrix Unsloth |
| Qwen3.8-27B-pi-adapted VAL-APEX-I NanoPlus | ~27,3 B (mismo base) | no disponible | GGUF, 12,37 GiB | Apache 2.0 | Misma familia, menor huella |
| Qwen3.8-27B-pi-adapted VAL-APEX-I MicroPlus | ~27,3 B (mismo base) | no disponible | GGUF, 10,08 GiB | Apache 2.0 | Misma familia, menor huella, mayor compresion |
| Modelos de ~27-32B de otras familias (p. ej., Qwen2.5-32B, Gemma-2-27B) | no disponible en esta ficha | no disponible | no disponible | no disponible | No se aportan datos comparativos en la informacion disponible |

No se dispone de benchmarks que permitan comparar el rendimiento cualitativo frente a alternativas de la misma categoria.

## Limitaciones y advertencias

- No se han publicado evaluaciones de calidad (benchmarks, evaluaciones humanas) para esta cuantizacion; el rendimiento real puede degradarse respecto al modelo base, especialmente en las capas FFN comprimidas a IQ3_XXS.
- La cuantizacion mixta agresiva en `ffn_gate` y `ffn_up` (IQ3_S/IQ3_XXS) puede afectar a tareas sensibles a precision, como matematicas o generacion de codigo largo.
- No se documentan sesgos conocidos, idiomas soportados ni evaluaciones de alucinacion; se desconoce el comportamiento fuera del ingles y el castellano.
- La longitud de contexto no esta especificada; el uso con contextos largos dependera de la configuracion de llama.cpp y del presupuesto de VRAM.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria independiente.
- La procedencia del iMatrix se declara como externa y el autor indica que no infiere su procedencia; conviene verificar la trazabilidad si se requiere reproducibilidad estricta.
- Aunque la licencia declarada es Apache 2.0, el modelo base es de un tercero (`harness-hub`); conviene revisar los terminos del modelo base antes de uso comercial.
- El cliente V-Agent es especifico de Windows 10/11; en Linux o macOS habria que usar llama.cpp directamente u otro frontend compatible con GGUF.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IsValorum/Qwen3.8-27B-pi-adapted-VAL-APEX-I-MiniPlus-V3-GGUF
- Modelo base: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Variante NanoPlus: https://huggingface.co/IsValorum/Qwen3.8-27B-pi-adapted-VAL-APEX-I-NanoPlus-V3-GGUF
- Variante MicroPlus: https://huggingface.co/IsValorum/Qwen3.8-27B-pi-adapted-VAL-APEX-I-MicroPlus-V3-GGUF
- iMatrix de referencia: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF (revision 4af51b3542f775b0a8e4b310bfb3f17e01c306c9)
- Cliente V-Agent (codigo y documentacion): https://github.com/IsValorum/V-Agent
- Descargas de V-Agent: https://github.com/IsValorum/V-Agent/releases/latest
- Apoyo al autor: https://ko-fi.com/isvalorum
