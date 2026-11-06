# chadstthomas/CTRL-2B

## Resumen

CTRL-2B es un adaptador QLoRA publicado por el usuario chadstthomas sobre el modelo base openbmb/MiniCPM5-2B (arquitectura LlamaForCausalLM, licencia Apache-2.0). No es un modelo entrenado desde cero: se distribuye como un fine-tune PEFT que aporta el "estilo" de respuesta de un agente de soporte tecnico para la base de conocimiento de Expedient, una empresa de infraestructura cloud. El diseno es explicitamente retrieval-grounded: el adaptador no responde en modo closed-book de forma fiable, sino que debe combinarse con fragmentos recuperados de un indice de conocimiento (bge-small-en-v1.5, reranking con cross-encoder y top-3 inyectado) y una compuerta de abstencion calibrada.

El modelo tiene 2.516.756.480 parametros totales segun los pesos safetensors del repositorio (2,8 GB), lo que lo situa en la categoria de modelos pequenos desplegables en hardware de consumo. Su relevancia actual es acotada pero ilustrativa: demuestra un patron de "adaptador para la voz, recuperacion para la verdad" con metricas de evaluacion publicadas y una compuerta de abstencion medida, en lugar de presentar el fine-tune como un asistente general.

La informacion disponible es limitada: cero descargas y cero likes en el momento de la consulta, sin idiomas declarados, y la model card esta parcialmente truncada. Los datos de entrenamiento y evaluacion son, no obstante, inusualmente detallados para un modelo de este tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LlamaForCausalLM, base MiniCPM5-2B) con adaptador QLoRA (PEFT) |
| Parametros totales | 2.516.756.480 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QLoRA NF4 double-quant para el entrenamiento; export GGUF Q8_0 publicado |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT), GGUF (Q8_0) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre MiniCPM5-2B, un transformer decoder-only de tipo LlamaForCausalLM. El fine-tune usa QLoRA con rango 16, alpha 32, learning rate 2e-4 con schedule coseno, batch efectivo de 16, 4 epocas y 211 pasos, lo que supone aproximadamente 54 minutos en una RTX 4050 Laptop con 6 GB de VRAM, con computo en bf16 y base cuantizada en NF4 double-quant. La supervision es assistant-only mediante enmascaramiento por prefijo de cadena con fallo explicito (fail-loud string-prefix masking). El autor probo tambien una variante de 4B como control y no obtuvo una mejora clara de calidad a cambio del doble de tamano (19,9 s por paso frente a 15,4 s), por lo que se quedo con la version de 2B.

El corpus de entrenamiento consta de 939 filas (845 de entrenamiento y 94 de validacion) tras revision y deduplicacion, provenientes de cinco fuentes: documentacion de Nutanix (522 filas), VMware VCF9 (504), la base de conocimiento propia de Expedient (218), Zerto (71) y Cohesity (62), sumando 1.377 filas en bruto. Del total, 258 filas son de revision propia y 681 se promovieron mediante verificacion automatizada de paginas fuente. De las 1.005 filas de proveedor no revisadas, 682 se aceptaron, 207 se rechazaron y 116 quedaron pendientes de revision humana. No se menciona RLHF ni DPO; el entrenamiento es exclusivamente supervisado sobre pares pregunta/respuesta.

## Capacidades

- Generacion de texto conversacional orientada a soporte tecnico sobre infraestructura cloud (Nutanix, VMware VCF9, Zerto, Cohesity y la KB de Expedient).
- Respuestas ancladas a recuperacion: el adaptador esta disenado para operar con los top-3 fragmentos recuperados inyectados en el prompt.
- Abstencion ante preguntas fuera de dominio mediante una compuerta compuesta calibrada con umbral de "lens" de 0,74.
- Manejo de hechos numericos y versiones exactas (RPO, footprint de centros de datos, vCPU por nodo, versiones de VCF).
- Navegacion de procedimientos y rutas de interfaz (por ejemplo, VM Details -> Hardware section).
- Export GGUF Q8_0 compatible con llama-server para inferencia en CPU/GPU de consumo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada.
- Capacidades multilingues: no disponibles (sin idiomas declarados).
- Vision, audio o modo thinking: no disponibles.

## Casos de uso

- Soporte de primer nivel para la base de conocimiento de Expedient: el adaptador responde consultas sobre Nutanix, VMware VCF9, Zerto y Cohesity usando los fragmentos recuperados del indice, con la compuerta de abstencion activada para derivar a un humano cuando la pregunta queda fuera de dominio.
- Asistente interno de operaciones cloud: responde preguntas sobre configuracion de RPO en DR con Nutanix (Async 1 hora, NearSync 1-15 minutos, sincrono no soportado) apoyandose en la recuperacion de la documentacion de proveedor.
- Consulta de procedimientos de interfaz: guia al usuario por rutas concretas como VM Details -> Hardware section para cambiar CPU, memoria, disco o NIC en una VM EEC, con aviso de que requiere reinicio del guest.
- Verificacion de versiones y rutas de actualizacion: responde si un despliegue nuevo puede ir directamente a VCF 9.0.2 sin pasar por 9.0.0/9.0.1, un caso tipico de soporte de migraciones.
- Filtrado y redaccion de PII en prompts: responde que tipos de datos detecta el filtro de AI CTRL (email, telefono, SSN, tarjeta de credito, direcciones IP), util para formar a operadores en el uso del gateway.
- Despliegue en hardware de consumo para demos y pruebas: el adaptador se entrena en una RTX 4050 de 6 GB y se exporta a GGUF Q8_0, lo que permite montar un prototipo de asistente de soporte en un portatil o en un servidor modesto con llama-server.
- Evaluacion de pipelines RAG: sirve como banco de pruebas para medir hit@3, recall y precision de un pipeline de recuperacion con reranking, dado que el autor publica las metricas por brazo.

## Benchmarks y rendimiento

Los datos proceden de las evaluaciones del autor (resumenes en disco, `LINEAGE.json` y `MEASUREMENTS.md`). Las metricas son recall de hechos numericos (los numeros gold presentes en la respuesta) y precision (los numeros de la respuesta presentes en el gold, de modo que los numeros inventados penalizan).

Closed-book, preguntas held-out (26 filas):

| Brazo | Recall | Precision |
|---|---|---|
| MiniCPM5-2B base | 0,692 | no disponible |
| Este adaptador | 0,772 | 0,865 |

Open-book (adaptador + extractos recuperados):

| Evaluacion | Filas | Indice | Hit@3 | Recall | Precision |
|---|---|---|---|---|---|
| Validacion held-out | 26 | 257 | 26/26 (rank 0,0) | 0,962 | 0,962 |
| Forma de produccion | 94 | 939 | 94/94 (rank 0,0) | 0,943 | 0,945 |

Paridad del motor GGUF Q8_0 (llama-server, 26 filas): open-book 1,000 / 0,981; global 0,889.

Robustez: preguntas parafraseadas reescritas a mano dan recall 0,962, precision 0,962 y hit@3 26/26. En preguntas fuera de dominio (conocimiento general, plataformas competidoras), la compuerta compuesta de abstencion (lens 0,74) captura 15/15; la abstencion solo por prompt no funciona (20%).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 2,52 mil millones de parametros; en bf16 requiere aproximadamente 5 GB de pesos, y en cuantizacion de 8 bits o GGUF Q8_0 alrededor de 2,5-3 GB.
- GPU recomendadas: cualquier GPU con 6 GB o mas para cuantizaciones de 8 bits; el autor entreno el adaptador en una RTX 4050 Laptop de 6 GB, lo que indica que la inferencia cabe holgadamente en GPU de consumo.
- Cabe en GPU de consumo: si, incluidas RTX 3060, RTX 4060, RTX 4090 y similares; tambien en CPU via llama.cpp.
- Opciones de despliegue: llama.cpp / llama-server (export GGUF Q8_0 verificado con paridad), vLLM y TGI para el adaptador PEFT sobre el modelo base, y Ollama si se importa el GGUF.
- Latencia y throughput: no disponibles de forma agregada; el autor reporta 15,4 s por paso de entrenamiento en una RTX 4050 Laptop, dato no trasladable directamente a inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CTRL-2B | 2,52 B | no disponible | Adaptador QLoRA para soporte retrieval-grounded | Apache-2.0 | Hugging Face (0 descargas) |
| openbmb/MiniCPM5-2B (base) | ~2 B | no disponible | Modelo generalista | Apache-2.0 | Hugging Face |
| Variante de control 4B del autor | ~4 B | no disponible | Mismo corpus, mayor tamano | no disponible | No publicada segun la informacion disponible |

No se dispone de datos de benchmarks de terceros ni de modelos directamente comparables en la informacion proporcionada; la comparacion con la base MiniCPM5-2B solo cubre el brazo closed-book (recall 0,692 frente a 0,772).

## Limitaciones y advertencias

- No es un asistente general: el modo closed-book no esta soportado y el propio autor lo desaconseja; sin recuperacion y sin compuerta de abstencion el comportamiento se degrada.
- La abstencion solo por prompt falla (20% de acierto en OOD); es obligatoria la compuerta compuesta con umbral lens de 0,74, calibrado para este modelo concreto.
- El corpus es pequeno (939 filas) y muy especifico de un unico entorno empresarial (Expedient y cuatro proveedores), lo que limita la generalizacion a otros dominios.
- Riesgo de alucinacion de numeros y versiones: la metrica de precision mide precisamente numeros inventados; en produccion conviene validar cifras contra la fuente.
- Sin idiomas declarados; no hay evidencia de capacidades multilingues.
- Longitud de contexto no disponible; no se debe asumir una ventana amplia para conversaciones largas.
- 116 filas del corpus quedaron pendientes de revision humana y 682 se aceptaron mediante verificacion automatizada, lo que introduce posible ruido en el entrenamiento.
- Licencia Apache-2.0 permite uso comercial, pero el contenido de la base de conocimiento subyacente puede tener restricciones propias de los proveedores.
- Cero descargas y cero likes: no hay validacion independiente de las metricas declaradas por el autor.
- La model card esta truncada en la informacion disponible; faltan secciones sobre uso responsable y limitaciones declaradas por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chadstthomas/CTRL-2B
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Demo Space: https://huggingface.co/spaces/chadstthomas/ctrl-2b-demo
- Card Space interactiva: https://huggingface.co/spaces/chadstthomas/ctrl-2b-info
