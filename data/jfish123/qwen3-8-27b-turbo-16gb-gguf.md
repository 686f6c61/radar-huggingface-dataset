# Jfish123/Qwen3.8-27B-TURBO-16GB-GGUF

## Resumen

Qwen3.8-27B-TURBO-16GB-GGUF es una cuantizacion GGUF del fine-tune TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU de DavidAU, a su vez derivado de Qwen3.8-27B del equipo Qwen. El autor de esta ficha (Jfish123) no entrena el modelo: reempaqueta los pesos en formato IQ3_XXS con receta dinamica por tensor (la misma que emplea Unsloth en su variante UD-IQ3_XXS) y aplica correcciones a la plantilla de chat para que el modelo funcione con herramientas de agente como Claude Code y OpenAI Codex.

El objetivo declarado es encajar un modelo de 27.320.697.856 parametros en una unica GPU de 16 GB (probado en una RTX 5080) dejando margen para el escritorio y el navegador. El resultado son 10,2 GiB de pesos a 3,20 bits por peso, con dos configuraciones medidas: 110.592 tokens de contexto a unos 60 tok/s, o 57.344 tokens con decodificacion especulativa MTP a 90-105 tok/s.

Su relevancia practica reside en tres elementos: la preservacion de la cabeza MTP (Multi-Token Prediction) para decodificacion especulativa en llama.cpp, la reduccion del "thinking" del fine-tune (cientos de tokens en lugar de miles) y la eliminacion de rechazos por parte del autor original (etiqueta "Heretic"). Es un modelo solo de texto, sin proyector de vision, lo que libera VRAM para contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.8-27B), con cabeza MTP para decodificacion especulativa |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 110.592 tokens por defecto; 57.344 tokens con MTP activo |
| Tipos de cuantizacion | IQ3_XXS dinamico por tensor (866 tensores, de iq1_s a q8_0); cabeza MTP en q6_K/q8_0; cache KV cuantizada q4_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (10,2 GiB, 3,20 bits por peso); repo de 10,9 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de 27.320.697.856 parametros correspondiente a Qwen3.8-27B, sobre el que DavidAU aplico un fine-tune denominado TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. El autor original aplico un proceso de "abliteration" (etiqueta Heretic) para eliminar los rechazos del modelo base, y el fine-tune reduce drasticamente la longitud del razonamiento previo a la respuesta: cientos de tokens de pensamiento frente a los miles que suele consumir Qwen3.8 de serie.

La innovacion tecnica de esta publicacion concreta es el reempaquetado: se parte del GGUF MTP-Q8_0 de DavidAU y se recuantiza a IQ3_XXS usando la matriz de importancia (imatrix) de mradermacher, replicando exactamente la asignacion de tipo por tensor que Unsloth eligio para su UD-IQ3_XXS del Qwen3.8-27B base (documentada en `tensor-types.txt`). Se conserva la cabeza MTP en q6_K/q8_0, lo que permite a llama.cpp aplicar decodificacion especulativa con una tasa de aceptacion del 83-86 % de los tokens propuestos. El autor advierte que recuantizar desde Q8_0 introduce un error adicional frente a partir de BF16, aunque a 3 bits lo considera despreciable. Tambien se corrige la plantilla de chat: se admiten mensajes de sistema y developer despues del inicio de la conversacion (que antes provocaban HTTP 500 en Claude Code) y se mapean los niveles de razonamiento desconocidos (`minimal`/`none` a `low`; `high`/`max` y otros a `xhigh`).

## Capacidades

- Generacion de texto y conversacion multi-turno con contexto largo (hasta 110.592 tokens).
- Razonamiento con modo de pensamiento reducido: el fine-tune consume muchos menos tokens de "thinking" que el modelo base.
- Programacion y generacion de codigo, con muestreo recomendado por el autor (temperatura 0.6, top_p 0.95, top_k 20).
- Tool calling y function calling, con plantilla corregida para herramientas de agente.
- Integracion con Claude Code (endpoint `/v1/messages`) y OpenAI Codex tras las correcciones de plantilla.
- Decodificacion especulativa mediante cabeza MTP en llama.cpp.
- Modelo sin censura (Heretic): no aplica rechazos por contenido.
- Solo texto: no incluye proyector de vision.
- Capacidades multilingues: no disponible.

## Casos de uso

- Asistente de programacion en local: con 110k tokens de contexto y tool calling funcional, puede mantener el estado de un repositorio mediano dentro de la ventana y operar sobre el mediante herramientas, sin enviar codigo a servicios externos.
- Agente CLI integrado en Claude Code o Codex: las correcciones de plantilla permiten usar el modelo como backend local de estas herramientas, aceptando mensajes de sistema intercalados y niveles de razonamiento arbitrarios.
- Estacion de trabajo con GPU de 16 GB: al ocupar 12,9 GB en llama-server tras un prompt de 31k, deja 3,4 GB para escritorio y navegador, lo que permite tener el modelo residente todo el dia en una RTX 5080 o similar.
- Generacion de codigo de baja latencia: con MTP activo alcanza 90-105 tok/s, adecuado para autocompletado o iteracion rapida en bucles de edicion.
- Procesamiento de documentos largos: 110.592 tokens permiten resumir, extraer o reescribir contratos, informes o transcripciones extensas en una sola pasada.
- Experimentacion en investigacion sobre cuantizacion: el repositorio incluye scripts para volcar tipos de tensor, recuantizar con imatrix y reescribir la plantilla dentro del GGUF, lo que sirve como referencia reproducible para estudiar el impacto de IQ3_XXS.
- Despliegue en Ollama: el modelo esta publicado como `awakenedsniper78/qwen3.8-turbo` con `num_ctx 110592` y requiere `OLLAMA_FLASH_ATTENTION=1`, `OLLAMA_KV_CACHE_TYPE=q4_0` y `OLLAMA_GPU_OVERHEAD=536870912`; medido a ~58 tok/s en RTX 5080.
- Escenarios que requieren contenido sin filtros: al ser un modelo Heretic, evita rechazos en tareas creativas o de analisis sensible, con las advertencias legales y eticas correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) para esta cuantizacion en la informacion disponible. El autor indica explicitamente que no se ha ejecutado ninguna prueba de codigo sobre este quant y que las puntuaciones publicadas por DavidAU (ARC, BoolQ, etc.) corresponden a las versiones en precision completa y 4/8 bits. Un benchmark comunitario de tool calling sobre el Q8_0 situo al fine-tune ligeramente por delante de Qwen3.8-27B de serie, pero se desconoce cuanto de esa ventaja sobrevive a 3 bits.

Rendimiento medido en RTX 5080 (16 GB) con llama.cpp:

| Metrica | Por defecto | MTP (`--spec-type draft-mtp`) |
|---|---|---|
| Contexto | 110.592 tokens | 57.344 tokens |
| Generacion | ~60 tok/s | ~90-105 tok/s (83-86 % de tokens aceptados) |
| Procesamiento de prompt | ~1.800 tok/s | ~1.650 tok/s |
| VRAM (llama-server tras prompt de 31k) | 12,9 GB | 12,7 GB |
| VRAM libre para escritorio/navegador | ~3,4 GB | ~3,6 GB |

En Ollama 0.40 sobre la misma GPU: 100 % en GPU, 12,9 GB de VRAM y ~58 tok/s (Ollama no utiliza la cabeza MTP).

## Requisitos de hardware

- VRAM estimada: 12,9 GB con llama-server y contexto de 110.592 tokens (cache KV en q4_0); 12,7 GB con MTP y 57.344 tokens. Los pesos solos son 10,2 GiB.
- GPU recomendadas: RTX 5080 de 16 GB (medida por el autor); cualquier GPU con 16 GB o mas deberia encajar con la misma configuracion de cache KV cuantizada.
- Cabe en GPU de consumo de 16 GB (RTX 4080/4090/5080, RX 7900 XT/XTX segun soporte de llama.cpp). En GPUs de 12 GB o menos no cabe con este contexto.
- Despliegue: llama.cpp (`llama-server`), Ollama (modelo `awakenedsniper78/qwen3.8-turbo`). No se mencionan vLLM ni TGI, que no consumen GGUF de forma nativa.
- Parametros de llama-server recomendados: `-ngl 999 -np 1 -fa on -ctk q4_0 -ctv q4_0 -b 512 -ub 256 --temp 0.6 --top-p 0.95 --top-k 20 --min-p 0`; anadir `--spec-type draft-mtp --spec-draft-n-max 2` para MTP.
- Nota del autor: cuantizar la cache del borrador MTP (`-ctkd q4_0`) no ahorra VRAM porque el buffer de computo crece en proporcion.
- Latencia y throughput: ~60 tok/s en generacion y ~1.800 tok/s en prefill sin MTP; 90-105 tok/s y ~1.650 tok/s con MTP, sobre RTX 5080.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Jfish123/Qwen3.8-27B-TURBO-16GB-GGUF (este) | 27,3 B | 110.592 / 57.344 con MTP | IQ3_XXS dinamico, 10,2 GiB | Apache 2.0 | MTP conservado, plantilla corregida para agentes |
| Jfish123/Qwen3.8-27B-16GB-GGUF | 27,3 B (base Qwen3.8-27B) | no disponible | IQ3_XXS, mismo tamano (10,2 GiB) | Apache 2.0 | Sin fine-tune Heretic ni reduccion de thinking |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU | 27,3 B | no disponible | Q8_0 y otras (GGUF de origen) | Apache 2.0 | Modelo fuente; mayor precision, mayor VRAM |
| mradermacher/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-i1-GGUF | 27,3 B | no disponible | Varias (imatrix i1) | Apache 2.0 | Proveedor de la imatrix usada aqui |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No hay benchmarks de calidad publicados para esta cuantizacion; el impacto de IQ3_XXS sobre las capacidades del fine-tune es desconocido.
- La recuantizacion desde Q8_0 anade error frente a partir de BF16; el autor lo califica de despreciable a 3 bits, pero no lo cuantifica.
- Modelo sin censura (Heretic): puede generar contenido que otros modelos rechazan. Requiere filtros y politicas de uso en produccion, y evaluacion legal segun el contexto de despliegue.
- Riesgo de alucinacion inherente a los modelos de 27B cuantizados a 3 bits; no se han publicado evaluaciones de fidelidad factual.
- Solo texto: no admite vision ni audio.
- Idiomas soportados no documentados; no hay garantia de calidad fuera de los idiomas del modelo base.
- El contexto largo (110.592 tokens) solo es viable con cache KV cuantizada en q4_0 y flash attention; sin estas opciones no cabe en 16 GB.
- En Ollama no se aprovecha la cabeza MTP, por lo que se pierde la aceleracion de decodificacion especulativa.
- La plantilla de chat ha sido modificada respecto al modelo fuente; si se usa con otras herramientas de agente no verificadas, conviene validar el comportamiento.
- Licencia Apache 2.0 declarada, pero el modelo deriva de un fine-tune comunitario y de Qwen3.8-27B; conviene revisar las condiciones de los modelos base antes de uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: sin validacion comunitaria independiente.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/Jfish123/Qwen3.8-27B-TURBO-16GB-GGUF
- Modelo base (fine-tune de DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Cuantizaciones i1 de mradermacher (imatrix): https://huggingface.co/mradermacher/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-i1-GGUF
- Variante sin fine-tune del mismo autor: https://huggingface.co/Jfish123/Qwen3.8-27B-16GB-GGUF
- Perfil de DavidAU: https://huggingface.co/DavidAU
- Equipo Qwen: https://huggingface.co/Qwen
- Unsloth (receta IQ3_XXS dinamica): https://huggingface.co/unsloth
- Perfil de mradermacher: https://huggingface.co/mradermacher
