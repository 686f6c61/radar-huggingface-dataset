# IsValorum/Inkling-2-Mini-Abliterated-APEX-I-NanoPlus-V2.1-GGUF

## Resumen
Inkling-2-Mini-Abliterated-APEX-I-NanoPlus-V2.1-GGUF es una cuantizacion GGUF del modelo base thinkingmachines/Inkling-2-Mini, publicada por el usuario IsValorum dentro de su serie de cuantizaciones APEX. El modelo base emplea la arquitectura denominada `inkling2_loop`, con 26.070.385.152 parametros totales (segun los safetensors del modelo original) y una pipeline declarada de image-text-to-text, lo que indica capacidades multimodales de entrada imagen-texto. La variante NanoPlus es la de menor huella de la familia (10,23 GiB), frente a MiniPlus (12,09 GiB), y esta version concreta esta ademas "abliterated", es decir, se ha aplicado una intervencion sobre las direcciones de rechazo del modelo base.

El interes de esta ficha es doble: por un lado, documenta un artefacto de cuantizacion de un modelo multimodal con arquitectura recurrente y mezcla de expertos (MoE segun los tags), orientado a ejecucion local mediante llama.cpp; por otro, ilustra las tecnicas de cuantizacion selectiva por tensor (imatrix, precisiones mixtas Q4_K/Q6_K/Q8_0/F32) que buscan preservar las capas mas sensibles del modelo. El repo ocupa 11,3 GB y se distribuye bajo licencia Apache 2.0.

Cabe senalar que la model card del autor es la unica fuente de informacion disponible: no se han publicado resultados de benchmarks, no se detallan idiomas soportados y no se documenta el proceso de abliteration mas alla de su nombre. Todo dato no presente en esa informacion se marca explicitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `inkling2_loop` (recurrente, con mezcla de expertos segun tags) |
| Parametros totales | 26.070.385.152 (segun safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con precision mixta por tensor: Q4_K, Q6_K, Q8_0 y F32 (mapa auditado por tensor) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (libreria llama.cpp); origen de cuantizacion en BF16 |

## Arquitectura y entrenamiento
El modelo base utiliza la arquitectura `inkling2_loop`, que por su nombre y por la presencia de tensores como `output_res_query.weight`, `attn_k_conv`, `attn_post_conv`, `attn_q_clip`, `attn_rel` y `attn_rel_bias` sugiere un transformer con mecanismos recurrentes o de bucle iterativo, convoluciones en las proyecciones de atencion y algun tipo de atencion relativa. Los tags del repo incluyen `moe`, lo que apunta a una arquitectura de mezcla de expertos, aunque no se especifica el numero de expertos, el numero de parametros activos ni la distribucion de los mismos. La pipeline `image-text-to-text` confirma que el modelo acepta imagenes como entrada junto a texto.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion. Respecto a la cuantizacion, el autor documenta un proceso de cuantizacion selectiva auditado desde el GGUF fisico: se usa una imatrix (`imatrix.gguf`) y se asignan precisiones distintas por tensor, con Q8_0 en las puertas de atencion (`attn_gate`), Q6_K en `output.weight` y en algunas proyecciones de salida de atencion, Q4_K en las proyecciones principales de atencion y embeddings, y F32 en tensores sensibles como `output_res_query`, las convoluciones de atencion (`attn_k_conv`, `attn_post_conv`), `attn_q_clip` y `attn_rel_bias`. Se observan 58 tensores protegidos en F32, presumiblemente vinculados a las rutas recurrentes. La variante "abliterated" implica una modificacion de los pesos orientada a eliminar el comportamiento de rechazo, aunque el autor no detalla la metodologia.

## Capacidades
- Generacion de texto conversacional multi-turno, segun el tag `conversational`.
- Procesamiento de entrada multimodal imagen-texto (pipeline `image-text-to-text`).
- Razonamiento y generacion de codigo: no documentado explicitamente en la model card, pero plausible por el tipo de modelo; no confirmado.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: el autor promociona su aplicacion V-Agent compatible, pero no se documentan capacidades de agente nativas del modelo.
- Capacidades multilingues: no disponible.
- Modo "thinking" o razonamiento extendido: no disponible.
- Comportamiento "abliterated": se elimina o atenua el rechazo ante ciertas peticiones, lo que constituye una capacidad (y un riesgo) diferencial frente al modelo base.

## Casos de uso
- Asistente conversacional local con entrada de imagenes: el modelo puede recibir una imagen junto a una pregunta y mantener una conversacion multi-turno, adecuado para prototipos de asistencia visual en escritorio sin dependencia de la nube.
- Analisis de documentos escaneados o capturas: al aceptar image-text-to-text, puede emplearse para extraer y comentar informacion de imagenes en flujos de revision documental, siempre que se valide su calidad real con pruebas propias.
- Despliegue en estaciones de trabajo con GPU de consumo: la cuantizacion NanoPlus (10,23 GiB) permite ejecutar el modelo en llama.cpp con CUDA o Vulkan en GPUs de 12-16 GB de VRAM, lo que facilita experimentacion local.
- Integracion en la aplicacion V-Agent: el autor ofrece un agente de escritorio Windows con soporte para GGUF y varios motores locales, de modo que este modelo puede usarse como motor de razonamiento y vision dentro de flujos con servidores MCP (ficheros, busqueda web, navegador).
- Investigacion sobre abliteration y cuantizacion: util para estudiar como afecta la eliminacion del rechazo y la cuantizacion selectiva por tensor al comportamiento del modelo en tareas sensibles, comparando con la variante base MiniPlus o con el modelo original.
- Generacion de codigo asistida en local: si el modelo base conserva capacidades de codigo, la variante cuantizada permite autocompletado y explicacion de fragmentos en entornos sin conexion; requiere verificacion empirica porque no hay benchmarks publicados.
- Fine-tuning o evaluacion comparativa de arquitecturas recurrentes/MoE: el GGUF y el mapa de tensores auditado sirven como referencia para estudiar que capas toleran Q4_K y cuales requieren F32.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: el repo pesa 11,3 GB y la variante NanoPlus ocupa 10,23 GiB; se necesita al menos esa cantidad de VRAM (o memoria unificada) mas margen para el contexto KV, por lo que 12 GB es el minimo practico y 16 GB es recomendable.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4070 Ti Super (16 GB), RTX 3090 (24 GB), A100/H100 para despliegues de mayor concurrencia; en GPUs de 12 GB (RTX 3060 12 GB, RTX 4070) puede caber con contexto reducido.
- Cabe en GPU de consumo: si, en tarjetas de 12-16 GB con cuantizacion NanoPlus; la variante MiniPlus (12,09 GiB) exige 16 GB o mas.
- Opciones de despliegue: llama.cpp (CUDA, Vulkan, CPU) es el motor principal; tambien V-Agent, que integra llama.cpp y otros motores locales. No se documenta soporte para vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles; dependen del hardware, del contexto y de la naturaleza recurrente de la arquitectura.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Abliterated APEX-I NanoPlus V2.1 (este) | 26,07 mil millones (total) | no disponible | Apache 2.0 | GGUF (10,23 GiB) | Abliterated, cuantizacion selectiva, multimodal |
| Inkling-2-Mini-APEX-I-NanoPlus-V2.1 (base) | 26,07 mil millones (total) | no disponible | Apache 2.0 | GGUF | Misma cuantizacion sin abliteration |
| Inkling-2-Mini-Abliterated APEX-I MiniPlus V2.1 | 26,07 mil millones (total) | no disponible | Apache 2.0 | GGUF (12,09 GiB) | Mayor huella, presumiblemente mayor fidelidad |
| thinkingmachines/Inkling-2-Mini (original) | 26,07 mil millones (total) | no disponible | no disponible | safetensors (BF16) | Modelo base sin cuantizar |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas de otros desarrolladores.

## Limitaciones y advertencias
- La abliteration elimina o reduce los mecanismos de rechazo del modelo base, lo que incrementa el riesgo de generar contenido danino, sesgado o inapropiado; no es apta para despliegues publicos sin filtros adicionales.
- No hay benchmarks publicados: se desconoce la degradacion introducida por la cuantizacion Q4_K en atencion y embeddings ni el impacto real de la abliteration en la calidad general.
- No se documentan idiomas soportados; el comportamiento en castellano es incierto y debe evaluarse empiricamente.
- No se especifica la longitud de contexto, lo que dificulta planificar casos de uso con ventanas largas.
- La model card esta incompleta (se corta en la tabla de tensores) y no detalla el dataset, el entrenamiento ni las fases de alineacion.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad.
- Aunque la licencia es Apache 2.0, el modelo base podria tener condiciones adicionales no reflejadas; conviene verificar la licencia de thinkingmachines/Inkling-2-Mini antes de uso comercial.
- Riesgo de alucinacion inherente a los modelos generativos, agravado por la falta de evaluacion publicada.
- La ejecucion en llama.cpp de una arquitectura recurrente con tensores F32 puede requerir versiones recientes del motor; verificar compatibilidad antes de desplegar.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/IsValorum/Inkling-2-Mini-Abliterated-APEX-I-NanoPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Variante base NanoPlus: https://huggingface.co/IsValorum/Inkling-2-Mini-APEX-I-NanoPlus-V2.1-GGUF
- Variante MiniPlus abliterated: https://huggingface.co/IsValorum/Inkling-2-Mini-Abliterated-APEX-I-MiniPlus-V2.1-GGUF
- Variante MiniPlus base: https://huggingface.co/IsValorum/Inkling-2-Mini-APEX-I-MiniPlus-V2.1-GGUF
- Aplicacion V-Agent (releases): https://github.com/IsValorum/V-Agent/releases/latest
- Repositorio V-Agent: https://github.com/IsValorum/V-Agent
- Arquitectura de V-Agent: https://github.com/IsValorum/V-Agent/blob/main/docs/ARCHITECTURE.md
- Licencia de V-Agent: https://github.com/IsValorum/V-Agent/blob/main/LICENSE
- Apoyo al autor: https://ko-fi.com/isvalorum
