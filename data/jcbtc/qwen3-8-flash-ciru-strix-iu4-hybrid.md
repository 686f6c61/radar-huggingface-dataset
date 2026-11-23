# jcbtc/Qwen3.8-Flash-CIRU-STRIX-IU4-Hybrid

## Resumen

Qwen3.8 Flash CIRU Strix IU4 Hybrid es una distribucion cuantizada y modificada del modelo Qwen3.8-Flash-Next de Alibaba Qwen, publicada por el usuario jcbtc. No se trata de un modelo entrenado desde cero, sino de un ensamblaje hibrido de pesos: combina los expertos enrutados compactos "C1" de Ciru con los pesos no enrutados UD-Q4_K_XL de Unsloth, todo empaquetado en formato GGUF para su uso con una build especifica de llama.cpp orientada a AMD Strix Halo (`gfx1151`) sobre Linux.

El modelo base declarado tiene 177.076.020.096 parametros totales (unos 177 mil millones), lo que lo situa en la categoria de modelos grandes con arquitectura presumiblemente MoE (mezcla de expertos), dado el uso de "routed experts" y de un draft MTP2 para decodificacion especulativa. El repositorio ocupa 102,5 GB, coherente con una cuantizacion de aproximadamente 4 bits sobre ese numero de parametros.

Su relevancia es muy concreta: no es un modelo de proposito general para cualquier hardware, sino un artefacto de optimizacion para inference local en sistemas AMD Strix Halo con 128 GB de memoria unificada. La model card reporta una mejora del 19,26 % en throughput de prefill (de 1.363,63 a 1.626,27 tok/s) frente a una build de control, con un contexto declarado de 262.144 tokens y decodificacion especulativa MTP2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); expertos enrutados compactos C1 + pesos no enrutados UD-Q4_K_XL |
| Parametros totales | 177.076.020.096 (177 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (segun configuracion de benchmark de la model card) |
| Tipos de cuantizacion | Pesos no enrutados en UD-Q4_K_XL; draft MTP en Q8_0; target GGUF propio (halo-c1.gguf) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un artefacto de cuantizacion y ensamblaje, no un entrenamiento nuevo. La arquitectura subyacente es la del Qwen3.8-Flash-Next, que segun la nomenclatura del repositorio emplea mezcla de expertos con bancos de expertos enrutados. La contribucion de Ciru consiste en unos "expertos enrutados compactos C1" que sustituyen a los originales, mientras que los pesos no enrutados (atencion, embeddings, capas densas) provienen del GGUF UD-Q4_K_XL de Unsloth. El resultado es un target GGUF (`halo-c1.gguf`) que requiere una build de llama.cpp con soporte C1 especifico.

El sistema incorpora decodificacion especulativa mediante un draft MTP2 en Q8_0 (`mtp-Qwen3.8-Flash-Next-shared-Q8_0.gguf`), que acelera la generacion aceptando tokens propuestos por el draft. En la prueba reportada se aceptaron 331 de 360 tokens de draft. Ademas, el runtime hace uso de un "PLE reader" que depende del byte layout del shard donante original de Unsloth, por lo que ese shard debe permanecer disponible durante el servicio. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional y de un solo turno, segun el pipeline declarado (`text-generation`).
- Razonamiento multi-paso y contexto largo: la configuracion de referencia usa 262.144 tokens de ventana, lo que permite manejar documentos extensos o historiales de conversacion muy largos.
- Decodificacion especulativa integrada (MTP2) para reducir latencia de generacion.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Capacidades de agente: no confirmadas en la informacion disponible.
- Capacidades multimodales (vision, audio): no disponibles; el pipeline es exclusivamente de texto.
- Capacidades multilingues: no disponibles; no se listan idiomas en la ficha de Hugging Face.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en estaciones AMD Strix Halo: el caso de uso principal y documentado. Un equipo con 128 GB de memoria unificada puede servir el modelo con contexto de 262.144 tokens y F16 en K/V, algo inviable en GPUs de consumo convencionales por VRAM.
- Procesamiento de documentos largos: con una ventana de 262.144 tokens, el modelo puede resumir o analizar contractos, informes o bases de codigo completas en una sola pasada sin trocear el contexto.
- Asistentes conversacionales de contexto extendido: mantener historiales de conversacion muy largos sin perder coherencia, aprovechando el prefill acelerado (1.626 tok/s) para absorber prompts grandes con rapidez.
- Prototipado de pipelines de generacion de codigo: el modelo base Qwen es conocido por su rendimiento en codigo; este artefacto permite probar ese comportamiento en local sobre hardware AMD, aunque el soporte de tool calling no esta confirmado.
- Investigacion sobre cuantizacion y decodificacion especulativa: el repositorio documenta checks de hidden-state, logits, rollback y 256 posiciones, lo que lo convierte en una referencia util para estudiar el impacto de los expertos compactos C1 y del MTP2 en la calidad y la velocidad.
- Despliegue de un servidor de inferencia privado: al ejecutarse con `run-server.py` sobre llama.cpp, puede exponerse como endpoint interno para aplicaciones que requieran confidencialidad de datos sin depender de APIs en la nube.
- Benchmarking de hardware: util como carga de trabajo representativa para medir prefill y generacion en sistemas Strix Halo y comparar builds del runtime.

## Benchmarks y rendimiento

Los unicos datos publicados son mediciones de rendimiento del runtime en un sistema Strix Halo de 128 GB, con una peticion de 4.096 tokens de entrada sin cache, 512 tokens generados, warmup de 12.960 tokens, MTP2, un slot, contexto de 262.144 y K/V en F16.

| Medicion | b1064+C1 (control) | v6.1 research build |
|---|---:|---:|
| Throughput de prefill | 1.363,63 tok/s | 1.626,27 tok/s |
| Tiempo de prefill | 3.003,74 ms | 2.518,65 ms |
| Tiempo hasta el primer texto | 3.080,18 ms | 2.592,54 ms |
| Throughput de generacion | 42,22 tok/s | 42,33 tok/s |
| Respuesta completa | 15,183 s | 14,665 s |

La mejora de prefill es del 19,26 % (485,09 ms ahorrados). Ambos runs produjeron las mismas 512 piezas de salida y aceptaron 331 de 360 tokens de draft. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: el target ocupa 102,53 GB, el shard donante 49,86 GB y el draft 2,79 GB. En total, unos 155 GB de almacenamiento; en ejecucion se necesita memoria unificada suficiente para el target y el draft.
- GPU recomendadas: AMD Strix Halo (`gfx1151`) es el unico hardware soportado oficialmente por el runtime v6.1.0. No se documenta soporte para A100, H100 ni RTX 4090.
- GPU de consumo: no cabe en GPUs de consumo con VRAM discreta convencional (24 GB o menos). Esta disenado para sistemas con memoria unificada de 128 GB.
- Sistema operativo: Linux x86-64 con glibc 2.43 o superior y libstdc++ con GLIBCXX_3.4.32. En NixOS se requiere `--compat-lib-dir`.
- Opciones de despliegue: runtime propio de Ciru (`install-rocm.py` y `run-server.py`) sobre llama.cpp con soporte C1. No se garantiza compatibilidad con vLLM, Ollama o TGI.
- Latencia y throughput: prefill de 1.626,27 tok/s y generacion de 42,33 tok/s en el sistema de referencia con la configuracion indicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Qwen3.8 Flash CIRU Strix IU4 Hybrid | 177 mil millones | 262.144 | GGUF | Qwen Community 1.0 | AMD Strix Halo |
| Qwen3.8-Flash-Next (base) | no disponible | no disponible | safetensors/GGUF | Qwen Community 1.0 | GPU genericas |
| Qwen3.8-Flash-Next UD-Q4_K_XL (Unsloth) | 177 mil millones (mismo base) | no disponible | GGUF | Qwen Community 1.0 | llama.cpp generico |

La comparativa con alternativas de otros fabricantes no esta disponible en la informacion proporcionada. La diferencia principal frente al base y al GGUF de Unsloth es el reemplazo de expertos enrutados por los C1 compactos y la dependencia de un runtime especifico.

## Limitaciones y advertencias

- Es un artefacto de cuantizacion no oficial: no lo publica Qwen ni Unsloth, sino un tercero (jcbtc), y no ha pasado por un proceso de validacion independiente de calidad.
- Dependencia estricta del runtime: requiere la build v6.1.0 de Ciru con soporte C1. Otras versiones de llama.cpp no pueden cargar el target.
- Dependencia del shard donante: el lector PLE usa el byte layout original del shard de Unsloth, que debe conservarse; si se actualiza o elimina, el modelo deja de funcionar.
- Riesgo de degradacion por cuantizacion: la combinacion de expertos compactos C1 con pesos UD-Q4_K_XL puede alterar el comportamiento respecto al modelo original; solo se han validado checks de hidden-state, logits, rollback y 256 posiciones, no evaluaciones de calidad a gran escala.
- Idiomas no declarados: no se especifica que lenguas soporta, lo que impide garantizar un rendimiento multilingue.
- Sin datos de sesgo ni de alucinacion: no se ha publicado ninguna evaluacion al respecto.
- Licencia Qwen Community 1.0: conviene revisar sus terminos antes de un uso comercial, ya que puede imponer restricciones de atribucion o de uso.
- Hardware muy especifico: fuera de un sistema Strix Halo con 128 GB, el modelo es practicamente inutilizable.
- Cero adopcion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jcbtc/Qwen3.8-Flash-CIRU-STRIX-IU4-Hybrid
- Runtime y release notes v6.1.0: https://github.com/ciru-ai/Qwen3.8-Flash-CIRU-STRIX-IU4/releases/tag/v6.1.0
- GGUF donante de Unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Guia de Hugging Face CLI: https://huggingface.co/docs/huggingface_hub/guides/cli
