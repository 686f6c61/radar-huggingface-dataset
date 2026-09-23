# pottokao/Qwen-Image-2.1-PE-T2I-Heretic-GGUF

## Resumen

`pottokao/Qwen-Image-2.1-PE-T2I-Heretic-GGUF` es una compilacion cuantizada en formato GGUF del modelo de reescritura de prompts `Qwen-Image-2.1-PE-T2I`, derivado a su vez del checkpoint comunitario `pottokao/Qwen-Image-2.1-PE-T2I-Heretic`. No es un modelo de difusion ni un text encoder: es un LLM de 8.953.803.264 parametros (unos 8,95 mil millones) cuya unica funcion es transformar una peticion breve, en cualquier idioma, en una linea JSON con un prompt de imagen detallado en ingles y una relacion de aspecto recomendada (`{"rewritten_prompt": "...", "wh_ratio": "3:2"}`).

El modelo ha sido sometido a un proceso de *abliteration* ("heretic") que elimina el comportamiento de rechazo: pasa de 98/100 rechazos en la version original a 3/100, con una divergencia KL de 0,036 respecto al modelo base, resultado del mejor candidato de una busqueda de 1600 ensayos. La compilacion que nos ocupa es un Q4_K_M de llama.cpp con una unica desviacion respecto al estandar: el tensor `token_embd` se mantiene en Q6_K, lo que eleva el tamano de 5,24 GB a 5,49 GB (+0,25 GB).

Su relevancia practica es doble. Por un lado, permite ejecutar un reescritor de prompts de casi 9B en GPUs de 8 GB de VRAM con llama.cpp, carga en pocos segundos y una calidad funcional verificada 4/4 en JSON estrictamente valido. Por otro, es un ejemplo documentado de cuantizacion consciente: el autor justifica la promocion del embedding a Q6_K a partir de la practica de los checkpoints NVFP4 oficiales de NVIDIA para la familia Qwen, y descarta publicar un build con importance matrix por un corpus de calibracion mal disenado. El aviso importante: el modelo es inutil sin el archivo `system_prompt.txt` (10 KB) que se incluye en el repositorio y que define el contrato de salida.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de tipo LLM (según el uso de llama.cpp y la presencia de tensores `token_embd` y `output`); el `config.json` incluye `text_config.mtp_num_hidden_layers` con valor `null` (multi-token prediction desactivado) |
| Parametros totales | 8.953.803.264 (unos 8,95 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo oficial de `llama-server` arranca con `-c 16384` |
| Tipos de cuantizacion | GGUF: bf16 (GGUF sin cuantizar, usado como fuente de conversion) y Q4_K_M con `token_embd` en Q6_K y `output` en Q6_K |
| Idiomas soportados | Entrada en cualquier idioma (la model card indica "in any language"); salida del prompt reescrito siempre en ingles. Idiomas no enumerados explicitamente |
| Licencia | qwen-research (`license: other`, `license_name: qwen-research`, enlace al archivo `LICENSE`). Solo uso no comercial |
| Formato de pesos | GGUF (llama.cpp). Tamano del repositorio: 11,8 GB; build Q4_K_M documentado: 5,49 GB |
| Autor | pottokao (derivado comunitario, no afiliado ni respaldado por Alibaba / Qwen) |
| Modelo base | `pottokao/Qwen-Image-2.1-PE-T2I-Heretic` |
| Descargas / likes | 5524 descargas, 13 likes |
| Fechas | Creado el 21 de septiembre de 2026; actualizado el 23 de septiembre de 2026 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla de lo deducible de su uso con llama.cpp: se trata de un LLM con embeddings de tokens, capa de salida y soporte de plantilla de chat (`--jinja`). El unico detalle estructural explicito es la presencia en `config.json` de la clave `text_config.mtp_num_hidden_layers` con valor `null`, es decir, la familia soporta multi-token prediction pero este checkpoint lo tiene desactivado. Esa clave con valor nulo rompe el convertidor oficial (`int += None` produce `TypeError`), por lo que la conversion exige el flag `--no-mtp`. No se aportan datos sobre numero de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF o DPO.

Lo que si esta documentado es el proceso de derivacion. El modelo procede de un pipeline de *abliteration* etiquetado como "heretic": se buscaron variantes con rechazo reducido y se selecciono la mejor de 1600 pruebas, con 3/100 rechazos y divergencia KL de 0,036 frente al modelo con comportamiento intacto (que rechazaba 98/100). La version publicada anade la cuantizacion: conversion a bf16 GGUF sin MTP y posterior `llama-quantize` con `--token-embedding-type q6_K --output-tensor-type q6_K`. La desviacion respecto al Q4_K_M estandar es intencionada y argumentada: los checkpoints NVFP4 oficiales de NVIDIA de la familia Qwen (Qwen3-8B, Qwen3-32B, Qwen3-30B-A3B, Qwen3.5-122B-A10B, Qwen3.5-397B-A17B) no tocan el embedding de tokens, y la receta mixta oficial de Qwen3.6-27B cuantiza `lm_head` a 4 bits pero tampoco lo modifica; el Q4_K_M de serie si lo comprime, de ahi la promocion a Q6_K. El autor probo ademas un build con importance matrix y decidio no publicarlo porque el corpus de calibracion (341 KB) contenia el prompt de sistema de 10 KB repetido en cada muestra, aproximadamente el 88 % del total.

## Capacidades

- Reescritura de prompts texto a imagen: convierte una peticion breve en un prompt de imagen detallado en ingles.
- Seleccion de relacion de aspecto: devuelve el campo `wh_ratio` (por ejemplo `"3:2"`) junto al prompt reescrito.
- Salida estructurada estricta: genera una unica linea JSON con exactamente las claves `rewritten_prompt` y `wh_ratio`.
- Entrada multilingue: acepta peticiones en cualquier idioma. En la verificacion funcional se probaron tres peticiones en chino y una en ingles, con 4/4 JSON validos.
- Disciplina de longitud: las salidas medidas van de 2053 a 3351 caracteres (el modelo bf16 de origen produce 2450-3320 con entradas del mismo estilo).
- Conversacion via API compatible con OpenAI: el repositorio esta etiquetado como `endpoints_compatible` y `conversational`; se usa con `POST /v1/chat/completions` cargando `system_prompt.txt` como mensaje de sistema.
- Sin rechazos practicos: comportamiento de rechazo reducido a 3/100 tras el proceso de abliteration.
- No soporta: vision, audio, tool calling, uso como text encoder de difusion ni generacion de imagenes. El propio autor insiste en que es un LLM y no debe cargarse en `CLIPLoader`.

## Casos de uso

- Reescritura de prompts en ComfyUI: se inserta en un nodo LLM/GGUF que reescribe la peticion del usuario antes de que llegue al DiT de Qwen-Image-2.1. Es el flujo para el que fue construido y el que aprovecha la salida JSON con relacion de aspecto.
- API de mejora de prompts multilingue: desplegado con `llama-server` en `/v1/chat/completions`, permite que usuarios hispanohablantes, chinos o angloparlantes escriban peticiones breves y reciban prompts tecnicos en ingles listos para cualquier generador de imagenes.
- Generacion por lotes de imagenes: al devolver un unico objeto JSON por peticion y admitir peticiones de 2000-3300 caracteres de salida, encaja en pipelines que procesan cientos de prompts y necesitan un formato parseable sin postprocesado.
- Prototipado en hardware de consumo: los 5,49 GB del build Q4_K_M y la afirmacion explicita de que "cabe en una tarjeta de 8 GB" permiten montar un entorno de reescritura de prompts en una GPU de gama media sin depender de servicios en la nube.
- Investigacion sobre abliteration y cuantizacion: el repositorio documenta el ratio de rechazos (3/100), la divergencia KL (0,036) y la decision de mantener `token_embd` en Q6_K, lo que lo convierte en un caso de estudio reproducible para quien investiga el efecto de la cuantizacion sobre capacidades especificas.
- Desarrollo de herramientas creativas para fotografia y arte: los ejemplos de estilo del repositorio (Juan I-Jong, Henri Cartier-Bresson, William Eggleston, Daido Moriyama, Fan Ho) muestran que el modelo esta orientado a generar prompts con referencias estilisticas fotograficas concretas.
- Preprocesado en agentes de generacion visual: el modelo puede actuar como primer paso determinista de un agente que recibe una idea vaga y necesita producir una especificacion estructurada (prompt + ratio) antes de invocar el modelo de difusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni metricas equivalentes, y el autor advierte expresamente que no reporta perplejidad porque su propia medicion devolvio numeros contradictorios (el GGUF bf16 sin cuantizar puntuaba peor que sus propias cuantizaciones, lo que no es fisicamente sensato).

Los unicos datos cuantitativos disponibles son de comportamiento y de verificacion funcional, no comparables con benchmarks estandar:

| Metrica | Resultado |
|---|---|
| Tasa de rechazo | 3/100 (frente a 98/100 del modelo con comportamiento intacto; mejor de 1600 ensayos) |
| Divergencia KL respecto al modelo con rechazos | 0,036 (la variante anterior `v1-trial384` daba 7/100 con 0,039) |
| JSON estrictamente valido | 4/4 peticiones (tres en chino, una en ingles) via `llama-server` |
| Claves de salida | 4/4 con exactamente `rewritten_prompt` y `wh_ratio` |
| Longitud de salida (Q4_K_M) | 2053-3351 caracteres |
| Longitud de salida (bf16 de referencia) | 2450-3320 caracteres |
| Perplejidad | No reportada; el autor descarta la medicion por incoherente |

## Requisitos de hardware

- VRAM para el build Q4_K_M publicado: 5,49 GB de pesos. La model card afirma explicitamente que "cabe en una tarjeta de 8 GB".
- VRAM para una hipotetica inferencia en bf16: aproximadamente 17,9 GB solo de pesos (calculo a partir de 8.953.803.264 parametros a 2 bytes; estimacion, no dato publicado).
- GPU recomendadas: no se enumeran modelos concretos. El unico requisito declarado es una tarjeta de 8 GB para el build Q4_K_M. Una RTX 3070/4060 Ti de 8 GB o superior seria suficiente segun esa indicacion; GPU de 16 GB o mas permitirian contexto ampliado o el modelo sin cuantizar.
- Opciones de despliegue: `llama.cpp` / `llama-server`, documentado en la propia model card con la invocacion `llama-server -m pe_t2i_heretic-Q4_K_M.gguf --host 0.0.0.0 --port 8080 -ngl 99 -c 16384 --jinja -a pe-t2i`. Al ser formato GGUF, es compatible con el ecosistema llama.cpp (Ollama, llama-cpp-python, nodos GGUF de ComfyUI). No se documenta soporte de vLLM ni de TGI.
- Latencia y throughput: no disponibles. La model card solo indica que el modelo "carga en unos segundos".
- Contexto en el ejemplo oficial: 16384 tokens (`-c 16384`), valor usado en la invocacion de referencia y no necesariamente el maximo del modelo.
- Todos los tensores se pueden descargar a GPU con `-ngl 99`.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Tamano | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (`pottokao/Qwen-Image-2.1-PE-T2I-Heretic-GGUF`) | 8,95 B | GGUF Q4_K_M (token_embd y output en Q6_K) | 5,49 GB | Reescritura de prompts texto a imagen con abliteration | qwen-research, solo no comercial | Publico en HuggingFace, 5524 descargas |
| `pottokao/Qwen-Image-2.1-PE-T2I-Heretic` (modelo base) | no disponible (presumiblemente 8,95 B) | bf16 | no disponible | Identica, sin cuantizar | qwen-research, solo no comercial | Publico en HuggingFace |
| `Qwen/Qwen-Image-2.1-PE-T2I` (original) | no disponible | no disponible | no disponible | Identica, con comportamiento de rechazo intacto (98/100) | qwen-research, solo no comercial | Publico en HuggingFace |
| `pottokao/Qwen-Image-2.1-Text-Encoder-Heretic` | no disponible | GGUF | no disponible | Text encoder para el DiT, tarea distinta | qwen-research, solo no comercial | Publico en HuggingFace |

No se dispone de datos de benchmarks ni de modelos de terceros comparables en la informacion proporcionada, por lo que la comparacion se limita a la propia familia de derivados del mismo autor. La unica ventaja cuantificada de este build frente al Q4_K_M estandar es la retencion de `token_embd` en Q6_K a cambio de 0,25 GB adicionales; el autor no aporta una medicion de calidad que demuestre la mejora, solo el argumento de que no puede ser peor.

## Limitaciones y advertencias

- Licencia no comercial: el modelo se distribuye bajo la Qwen Research License. Cualquier uso comercial requiere una licencia separada de Qwen. El repositorio esta etiquetado con `license: other`.
- Dependencia critica del prompt de sistema: sin `system_prompt.txt` (10 KB, incluido en el repositorio) el modelo es inutil. Ese documento define la estructura, el registro, la longitud y la forma JSON de la salida.
- Modelo abliterado: el comportamiento de rechazo se ha reducido deliberadamente de 98/100 a 3/100. Esto implica que el modelo puede producir contenido que la version original rechazaria, sin los filtros de seguridad previstos por el desarrollador original.
- No es un text encoder: no debe cargarse en `CLIPLoader` ni usarse como encoder de texto para el DiT. Cargarlo en el nodo equivocado no produce el resultado esperado.
- Salida restringida: el modelo genera un unico objeto JSON con dos claves. No es un modelo de proposito general ni un asistente conversacional; cualquier uso fuera de la reescritura de prompts queda fuera de su contrato de salida.
- Riesgo de alucinacion: no evaluado en la informacion disponible. No hay pruebas publicadas sobre la fidelidad del prompt reescrito respecto a la peticion original.
- Calidad tras cuantizacion: no hay comparacion de perplejidad publicada. El autor descarta explicitamente su propia medicion por incoherente y solo ofrece una verificacion funcional de 4 peticiones, muestra demasiado pequena para extrapolar garantias.
- El build con importance matrix no se publico: el corpus de calibracion tenia el prompt de sistema repetido en cada muestra (aproximadamente el 88 % de los 341 KB), por lo que los pesos actuales no se han calibrado con datos diversos.
- Longitud de contexto no declarada: no se especifica el maximo soportado; el valor 16384 es solo el usado en el ejemplo de arranque del servidor.
- Idiomas: aunque la entrada admite cualquier idioma, la model card no enumera los idiomas soportados y la salida es siempre en ingles, lo que puede degradar la fidelidad en idiomas poco representados.
- Derivado no oficial: no esta afiliado ni respaldado por Alibaba / Qwen. La redistribucion se hace bajo la Qwen Research License con copia del `LICENSE` incluida.
- Fechas del repositorio: creado el 21 de septiembre de 2026 y actualizado el 23 de septiembre de 2026, apenas dos dias despues, lo que sugiere un proyecto joven con posible evolucion rapida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pottokao/Qwen-Image-2.1-PE-T2I-Heretic-GGUF
- Modelo base (bf16, sin cuantizar): https://huggingface.co/pottokao/Qwen-Image-2.1-PE-T2I-Heretic
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen-Image-2.1-PE-T2I
- Text encoder de la misma familia (tarea distinta): https://huggingface.co/pottokao/Qwen-Image-2.1-Text-Encoder-Heretic
- Repositorio del DiT con los ejemplos visuales: https://huggingface.co/pottokao/Qwen-Image-2.1-DiT-GGUF
- Archivo de licencia: `LICENSE` en el repositorio del modelo
- Archivo de prompt de sistema: `system_prompt.txt` en el repositorio del modelo (10 KB, obligatorio)
