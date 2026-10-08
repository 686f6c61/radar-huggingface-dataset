# Simplepotat/Qwen3.8-27B-OrcaRouter-Abliterated-IQ5_KS-GGUF

## Resumen

Este repositorio contiene una cuantizacion GGUF de tipo IQ5_KS del modelo Qwen3.8-27B en su variante "abliterated" (refusals eliminados) publicada por OrcaRouter, preparada por el usuario Simplepotat para su uso con ik_llama.cpp. Se trata de un modelo denso de 27.320.697.856 parametros (aproximadamente 27,3 mil millones) derivado de Qwen/Qwen3.8-27B, con licencia Apache 2.0 y soporte declarado para ingles y chino.

El valor diferencial del artefacto no es el modelo en si, sino el proceso de cuantizacion: se ha aplicado una receta por tensor (per-tensor recipe) desarrollada por Ubergarm para Qwen3.6-27B, junto con una importance matrix (imatrix) especifica de Qwen3.8-27B, con el objetivo de minimizar la perdida de calidad en una cuantizacion de 5 bits. Ademas, se conserva la cabeza MTP (multi-token prediction) integrada, cuyos tensores de pesos se cuantizan en Q8_0 y cuyas normas permanecen en F32, lo que permite decodificacion especulativa nativa en ik_llama.cpp.

Es relevante ahora porque ofrece un empaquetado de ~19 GiB que cabe en GPUs de consumo con 24 GB de VRAM, manteniendo capacidades de razonamiento, function calling y vision (esta ultima requiere un proyector multimodal `mmproj` aparte). El caracter abliterated lo orienta a investigacion en red-teaming y a aplicaciones donde el comportamiento de rechazo del modelo original resulta limitante, con las advertencias de seguridad que ello implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.8; detalle interno no disponible en la informacion proporcionada) |
| Parametros totales | 27.320.697.856 (aprox. 27,3 B) |
| Parametros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ5_KS (cuerpo del modelo); cabeza MTP en Q8_0; tensores de norma en F32 |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero unico `Qwen3.8-27B-OrcaRouter-Abliterated-MTP-IQ5_KS.gguf`, 18,964 GiB) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base Qwen/Qwen3.8-27B mas alla de lo que se deduce del proceso de cuantizacion: el modelo consta de 64 capas repetidas que siguen la misma receta por tensor que la cuantizacion IQ5_KS base de Qwen3.8. Se trata, por tanto, de una pila transformer convencional (no se menciona MoE, SSM ni arquitectura hibrida) con una cabeza MTP embebida. No se especifican en la documentacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base.

La innovacion tecnica relevante de este artefacto es doble. Por un lado, la cuantizacion por tensor guiada por una importance matrix (imatrix) especifica del modelo, generada por Ubergarm y aplicada con el cuantizador por tensor individual de ik_llama.cpp, lo que permite asignar precisiones distintas a cada tensor segun su sensibilidad. Por otro, la preservacion de la cabeza MTP con precision Q8_0 y normas en F32, que habilita decodificacion especulativa mediante el flag `--spec-type mtp:n_max=1,p_min=0.0`, acelerando la generacion sin alterar los pesos principales. El proceso de "abliteration" (eliminacion de direcciones de rechazo en el espacio de activaciones) se realizo en el checkpoint de origen de OrcaRouter, no en esta cuantizacion.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento de multiples pasos (tag `reasoning` en el repositorio).
- Function calling / tool calling (tag `function-calling`).
- Capacidades de vision-lenguaje: el modelo base admite entrada de imagen, pero este repositorio contiene unicamente el GGUF del modelo de texto; para entrada de imagen se necesita un proyector `mmproj` compatible por separado.
- Decodificacion especulativa mediante la cabeza MTP integrada (compatible con ik_llama.cpp).
- Comportamiento sin rechazos (abliterated), orientado a red-teaming y pruebas de seguridad adversarial.
- Plantilla de chat: el GGUF conserva los metadatos de plantilla del checkpoint de OrcaRouter.

## Casos de uso

- Red-teaming y evaluacion de seguridad: el modelo permite generar contenido que el Qwen3.8-27B original rechazaria, lo que lo hace util para construir conjuntos de pruebas adversariales y medir la robustez de clasificadores de contenido en pipelines propios.
- Investigacion sobre alineacion y refusal behavior: comparar las respuestas de este checkpoint con las del modelo base permite estudiar como la ablacion de direcciones afecta a la distribucion de salidas, manteniendo el resto de pesos constantes.
- Asistente conversacional local en ingles o chino: con unos 19 GiB de pesos, se puede desplegar en una unica RTX 4090 o RTX 3090 para conversaciones multi-turno sin depender de APIs externas.
- Generacion de codigo asistida con tool calling: la etiqueta `function-calling` indica soporte de llamadas a herramientas, lo que permite integrarlo en flujos de edicion de codigo o automatizacion de tareas con agentes.
- Extraccion y transformacion de documentos con entrada de imagen: combinando el GGUF de texto con un `mmproj` compatible, se puede construir un pipeline de image-text-to-text para describir capturas, diagramas o documentos escaneados.
- Despliegue en hardware limitado mediante ik_llama.cpp: el formato IQ5_KS reduce el peso a menos de 19 GiB, permitiendo servir el modelo en equipos de gama alta de consumo y en instancias cloud de una sola GPU.
- Aceleracion de inferencia con MTP en entornos de produccion: activar la decodificacion especulativa nativa reduce el coste por token en cargas de generacion larga, siempre que se use ik_llama.cpp en lugar de llama.cpp estandar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: 18,964 GiB segun el tamano del fichero, mas overhead de contexto y buffers de inferencia (habitualmente 1-3 GB adicionales segun longitud de contexto y tamano de lote).
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 5090 (32 GB), A6000 (48 GB), L40S (48 GB), A100 (40/80 GB) o H100 (80 GB).
- Compatibilidad con GPU de consumo: si, cabe en tarjetas con 24 GB de VRAM, como la RTX 4090 o la RTX 3090, siempre que se ajuste el contexto para no agotar la memoria. En GPUs de 16 GB o menos no cabe sin descarga parcial a CPU.
- Opciones de despliegue: ik_llama.cpp (necesario para aprovechar la decodificacion especulativa MTP), llama.cpp estandar, y cualquier frontend que consuma GGUF. La informacion no confirma compatibilidad explicita con Ollama, vLLM o TGI en este repositorio.
- Latencia y throughput: no disponible. La model card unicamente indica la invocacion con MTP habilitado, sin cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Simplepotat/Qwen3.8-27B-OrcaRouter-Abliterated-IQ5_KS-GGUF (este) | 27,3 B | No disponible | GGUF, IQ5_KS + MTP Q8_0 | Apache 2.0 | Cuantizacion optimizada con imatrix y receta por tensor; 18,964 GiB |
| Qwen/Qwen3.8-27B | No disponible | No disponible | Safetensors | Apache 2.0 | Modelo base original, con comportamiento de rechazo estandar |
| orcarouter/Qwen3.8-27B-Uncensored | 27 B (abliterated) | No disponible | Safetensors (FP8) y GGUF (F16 + 12 niveles de cuantizacion de Q2_K en adelante) | No disponible en la informacion recogida | Checkpoint abliterated de origen; su version GGUF F16 se distribuye en dos partes con un total aproximado de 113,4 GB |
| Simplepotat/Qwen3.8-27B-IQ5_KS-GGUF | 27,3 B | No disponible | GGUF, IQ5_KS | Apache 2.0 | Hermano no abliterated del mismo autor, sin la capa de ablacion |

## Limitaciones y advertencias

- Modelo abliterated: su comportamiento de rechazo difiere del Qwen3.8-27B original. La propia model card recomienda aplicar salvaguardas adecuadas en cualquier aplicacion productiva. No es apto para despliegues orientados a usuarios finales sin moderacion adicional.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad para esta cuantizacion concreta; la cuantizacion a 5 bits puede degradar ligeramente tareas sensibles a la precision numerica (matematicas, codigo extenso) frente al modelo en FP8 o F16.
- Idiomas: solo se declaran ingles y chino. El castellano no aparece como idioma soportado oficialmente, por lo que el rendimiento en espanol no esta garantizado ni documentado.
- Cobertura multimodal parcial: el repositorio contiene unicamente el modelo de texto. Para procesar imagenes hay que obtener un `mmproj` compatible por separado, y la informacion no especifica cual.
- Dependencia de herramienta: la decodificacion especulativa MTP requiere ik_llama.cpp. En llama.cpp estandar el modelo funciona, pero sin la aceleracion MTP.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo de origen es un checkpoint abliterated de un tercero (OrcaRouter) cuya licencia y condiciones no se detallan en la informacion recogida; conviene revisar el repositorio de origen antes de un despliegue comercial.
- Longitud de contexto no especificada: no se puede planificar el consumo de VRAM para contextos largos sin conocer este dato. El uso real de contexto debera validarse empiricamente.
- Estado del repositorio: cero descargas y cero "me gusta" en el momento de la consulta, sin historial de validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Simplepotat/Qwen3.8-27B-OrcaRouter-Abliterated-IQ5_KS-GGUF
- Repositorio hermano (sin abliterar): https://huggingface.co/Simplepotat/Qwen3.8-27B-IQ5_KS-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint abliterated de origen: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Receta por tensor (Qwen3.6-27B): https://huggingface.co/ubergarm/Qwen3.6-27B-GGUF
- Importance matrix de Qwen3.8-27B: https://huggingface.co/ubergarm/Qwen3.8-27B-GGUF
- Cuantizador y runtime ik_llama.cpp: https://github.com/ikawrakow/ik_llama.cpp
- Blog de OrcaRouter sobre el GGUF abliterated: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Guia de ejecucion local de OrcaRouter: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Ficha de terceros del modelo uncensored: https://local-ai-zone.github.io/models/qwen3-8-27b-uncensored-orcarouter.html
