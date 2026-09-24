# mradermacher/CyberStag-Security-26B-A4B-V1-Uncensored-Heretic-GGUF

## Resumen

CyberStag-Security-26B-A4B-V1-Uncensored-Heretic-GGUF es un repositorio de cuantizaciones en formato GGUF publicado por el usuario mradermacher a partir del modelo CyberStag-Security-26B-A4B-V1-Uncensored-Heretic, desarrollado por OS-Software. El modelo base tiene 25.233.142.046 parametros (unos 25,2 mil millones) y, segun su nombre, esta orientado a tareas de seguridad y a un comportamiento sin mecanismos de rechazo, aunque la informacion disponible no confirma ni la arquitectura ni el proceso de entrenamiento.

El sufijo "A4B" del nombre sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 4.000 millones de parametros activos, lo que reduciria el coste de inferencia respecto a un modelo denso del mismo tamano; se trata, no obstante, de una inferencia a partir de la nomenclatura y no de un dato confirmado. El repositorio contiene unicamente pesos cuantizados, de modo que su funcion es facilitar la ejecucion local mediante llama.cpp y herramientas compatibles con GGUF.

La utilidad de esta ficha esta limitada por la ausencia de documentacion: no se publican licencia, idiomas, longitud de contexto ni resultados de evaluacion, y el repositorio no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el sufijo "A4B" del nombre sugiere mezcla de expertos con ~4 B de parametros activos; sin confirmar) |
| Parametros totales | 25.233.142.046 (~25,2 B) |
| Parametros activos | No disponible (el nombre sugiere ~4 B; sin confirmar) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de ajuste por preferencias (RLHF, DPO u otras). El nombre del modelo base incluye los terminos "Uncensored" y "Heretic", que en la practica habitual de la comunidad suelen asociarse a procesos de ablacion de direcciones de rechazo (abliteration) para reducir las negativas del modelo; no hay confirmacion de que se haya aplicado esa tecnica ni de como se ha realizado.

El unico dato tecnico verificable aparte del recuento de parametros es el proceso de conversion y cuantizacion: los metadatos del repositorio indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que indica una conversion desde pesos de HuggingFace con cuantizacion tensorial. No se documenta ninguna innovacion de atencion, decodificacion especulativa ni mecanismo de contexto extendido.

## Capacidades

- Generacion de texto conversacional: el repositorio incluye la etiqueta `conversational`, que sugiere un ajuste para dialogos multi-turno.
- Servicio mediante endpoints: la etiqueta `endpoints_compatible` indica compatibilidad con el despliegue tipo API de HuggingFace.
- Inferencia local en CPU y GPU: al distribuirse en GGUF, es compatible con llama.cpp y derivados.
- Orientacion a seguridad: segun el nombre del modelo base, estaria especializado en tareas del dominio de seguridad (sin detalle publicado).
- Razonamiento, codigo, matematicas y vision: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo de pensamiento explicito (thinking), audio u otras modalidades: no disponible.

## Casos de uso

- Analisis y triage de alertas de seguridad: el modelo puede resumir y priorizar eventos de un SIEM o de un sistema EDR, agrupando alertas relacionadas y proponiendo una clasificacion inicial; su orientacion declarada al dominio de seguridad lo hace adecuado para esta tarea, aunque la ausencia de evaluaciones publicas obliga a validar el comportamiento antes de usarlo en produccion.
- Redaccion de informes de incidentes: a partir de notas tecnicas y trazas de logs, el modelo puede generar un borrador estructurado de informe post-incidente con cronologia, impacto y contramedidas.
- Revision de codigo con foco en seguridad: integrado en un pipeline de CI/CD, puede senalar patrones de riesgo (inyeccion de comandos, desbordamientos, manejo inseguro de credenciales) en los cambios propuestos por un pull request.
- Analisis de inteligencia de amenazas: el modelo puede resumir boletines, avisos de vulnerabilidades (CVE) y reportes de grupos de amenaza, extrayendo indicadores y traduciendolos a recomendaciones operativas.
- Red teaming y pruebas de robustez: al tratarse de una variante "uncensored", puede emplearse en entornos controlados para generar prompts adversarios y evaluar las defensas de otros sistemas, siempre bajo supervision y con las advertencias legales correspondientes.
- Asistente local de desarrollo: ejecutado con Ollama o llama.cpp en una estacion de trabajo, permite consultas de codigo y documentacion tecnica sin enviar datos a servicios externos, lo que resulta relevante cuando el material es confidencial.
- Base para ajuste fino (fine-tuning): el modelo base, no la version GGUF, puede servir como punto de partida para especializaciones en dominios de seguridad mediante LoRA o ajuste completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Los tamanos siguientes son estimaciones calculadas a partir del recuento de parametros (25,2 B) y del numero de bits por peso tipico de cada cuantizacion. No incluyen la cache KV, cuyo tamano depende de la longitud de contexto, que no se ha publicado.

| Cuantizacion | Tamano aproximado de pesos | GPU que lo ejecuta sin offload |
|---|---|---|
| f16 | ~50,5 GB | A100 80 GB, H100 80 GB |
| Q8_0 | ~26,8 GB | A100 40 GB/80 GB, H100, 2x RTX 4090 |
| Q6_K | ~20,7 GB | RTX 3090/4090 24 GB, A100 |
| Q5_K_M | ~17,9 GB | RTX 3090/4090 24 GB, RTX 4080 16 GB con offload parcial |
| Q4_K_M | ~15,3 GB | RTX 4080 16 GB, RTX 3090/4090, RTX 4060 Ti 16 GB |
| IQ4_XS | ~13,4 GB | RTX 4080 16 GB, RTX 4060 Ti 16 GB |
| Q3_K_M | ~12,3 GB | GPU de 12-16 GB, incluso 8 GB con offload |
| Q2_K | ~9,3 GB | GPU de 8-12 GB |

- Si el modelo es realmente MoE con ~4 B de parametros activos, el coste de computo por token sera mucho menor que el de un modelo denso de 25 B, y el cuello de botella pasara a ser la memoria para cargar los pesos.
- Memoria unificada como la de un Apple Silicon con 32 GB o mas puede ejecutar las cuantizaciones Q4 y Q5 con comodidad; con 64 GB se puede abordar Q8_0.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, koboldcpp, text-generation-webui, llama-cpp-python. Para vLLM o TGI, que trabajan mejor con safetensors, habria que usar el modelo base en lugar de esta version GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| CyberStag-Security-26B-A4B-V1-Uncensored-Heretic-GGUF (mradermacher) | 25,2 B | No disponible (~4 B segun el nombre) | No disponible | No disponible | GGUF | HuggingFace |
| CyberStag-Security-26B-A4B-V1-Uncensored-Heretic (OS-Software, modelo base) | No disponible | No disponible | No disponible | No disponible | safetensors | HuggingFace |
| Alternativas de la misma categoria y tamano | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion suficiente sobre arquitectura, contexto o evaluaciones como para establecer una comparacion fiable con otros modelos de tamano o tarea similares.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se concede de forma explicita ningun derecho de uso, lo que impide asumir que el uso comercial este permitido. La licencia del modelo base tambien figura como no disponible, por lo que la cadena de derechos es incierta.
- Naturaleza "uncensored": una variante con los mecanismos de rechazo reducidos o eliminados puede generar contenido danino, ilegal o inseguro ante determinadas peticiones. Requiere filtros propios si se expone a usuarios finales.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad, por lo que cualquier salida en dominios tecnicos (comandos, configuraciones, referencias a CVE) debe verificarse antes de aplicarla.
- Sesgos: no disponibles. Al no documentarse la composicion del dataset ni el idioma de entrenamiento, no se puede descartar un sesgo linguistico o cultural marcado.
- Cobertura idiomatica desconocida: se desconoce si el modelo maneja correctamente el castellano o se limita al ingles.
- Limite de contexto desconocido: no se puede dimensionar la cantidad de documentacion que admite en una sola llamada ni planificar la cache KV.
- Repositorio sin traccion: cero descargas y cero valoraciones, sin historial de uso que permita inferir su calidad o estabilidad.
- Los pesos se distribuyen solo en GGUF, de modo que no admiten ajuste fino ni entrenamiento ulterior; para eso hay que recurrir al modelo base.
- El proceso de cuantizacion (especialmente en Q2_K y Q3_K_S) puede degradar de forma apreciable la calidad de las respuestas; conviene validar cada cuantizacion con un conjunto de pruebas propio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/CyberStag-Security-26B-A4B-V1-Uncensored-Heretic-GGUF
- Modelo base: https://huggingface.co/OS-Software/CyberStag-Security-26B-A4B-V1-Uncensored-Heretic
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Paper, blog, repositorio o demo oficial: no disponible
