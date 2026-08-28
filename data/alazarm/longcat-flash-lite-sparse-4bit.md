# AlazarM/LongCat-Flash-Lite-Sparse-4bit

## Resumen

LongCat-Flash-Lite-Sparse-4bit es una cuantizacion en 4-bit (formato MLX) del modelo LongCat-Flash-Lite-Sparse desarrollado por Meituan, un modelo de lenguaje de tipo Mixture-of-Experts (MoE) no pensante con 69B parametros totales y aproximadamente 3B activos por token. Esta version concreta, publicada por AlazarM, es la primera implementacion funcional del modelo en cualquier framework, ya que el stack de inferencia habitual (mlx-lm, vLLM, SGLang, llama.cpp) no soportaba la variante `oe_embed_*` del embedding n-gram. La cuantizacion reduce el peso a unos 36 GB, lo que permite ejecutarlo en hardware de consumo con suficiente memoria unificada, como un Apple M5 Max.

El modelo base incorpora tres innovaciones principales: LongCat Sparse Attention (LSA), que sustituye la atencion densa MLA por un indexador ligero estilo DeepSeek con reutilizacion de indices entre capas; expertos identidad (zero-computation) en el decodificador ScMoE; y un embedding n-gram que concentra aproximadamente el 46% de los parametros totales. La cuantizacion 4-bit mantiene la arquitectura original, pero corrige un error en la fusion del embedding n-gram que aparecia en la implementacion densa de referencia. El resultado es un modelo con soporte nativo de contexto de hasta 1M tokens, optimizado para inferencia de contexto largo y capacidades agénticas, con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LongcatCausalLM (MoE con LSA, n-gram embedding y expertos identidad) |
| Parametros totales | 10.723.000.960 (segun safetensors; el modelo base declara 69B) |
| Parametros activos | ~3B (modelo base) |
| Longitud de contexto | Hasta 1M tokens (modelo base) |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base LongCat-Flash-Lite-Sparse es un MoE con 256 expertos enrutados y 128 expertos identidad (que no realizan computacion), con seleccion top-12. La atencion es LongCat Sparse Attention (LSA), una variante de MLA con un indexador ligero que selecciona dinamicamente los tokens relevantes cuando la longitud de KV supera un umbral (`index_topk` = 2048). Ademas, incorpora un embedding n-gram que fusiona proyecciones de n-gramas con el embedding de palabras a escala completa, en lugar de dividir por el numero de embedders (13) como hacia la implementacion densa. Esta correccion es clave para evitar la degradacion en la generacion.

Los datos de entrenamiento no se han publicado en la informacion disponible. No se menciona el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La cuantizacion 4-bit en MLX se realizo sobre el checkpoint original, preservando la arquitectura y los pesos cuantizados.

## Capacidades

- Generacion de texto y razonamiento general, con buen rendimiento en tareas de conocimiento y razonamiento logico.
- Manejo nativo de contexto largo (hasta 1M tokens) gracias a LSA, que mantiene la velocidad de decodificacion casi plana al crecer el contexto (de 110 a 73 tok/s entre 512 y 32k tokens).
- Capacidades agénticas mejoradas respecto al modelo denso predecesor, segun la documentacion del modelo base.
- Soporte multilingue para ingles y chino.
- No se ha confirmado soporte explicito de tool calling, vision ni audio en la informacion disponible.

## Casos de uso

- Procesamiento de documentos extensos: el modelo puede analizar libros, informes o codigo fuente de cientos de miles de tokens sin perder rendimiento, gracias a la ventana de contexto de 1M y la atencion sparse que reduce el coste computacional.
- Agentes conversacionales de larga duracion: su capacidad de mantener coherente una conversacion multi-turno con historial largo lo hace adecuado para asistentes virtuales o chatbots de soporte.
- Razonamiento sobre bases de conocimiento: puede responder preguntas que requieren integrar informacion dispersa en un corpus largo, como articulos cientificos o documentacion tecnica.
- Generacion de codigo en proyectos grandes: al manejar contextos amplios, puede sugerir cambios o completar funciones teniendo en cuenta todo el repositorio.
- Traduccion y procesamiento de texto bilingue en/zh: util para aplicaciones que necesiten entender y generar contenido en ambos idiomas.
- Investigacion en eficiencia de inferencia: al ser la primera implementacion funcional de LSA en MLX, sirve como banco de pruebas para estudiar el comportamiento de la atencion sparse y el embedding n-gram en hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (como MMLU, HumanEval o GSM8K) en la informacion disponible. El autor de la cuantizacion proporciona una tabla de rendimiento de inferencia en un Apple M5 Max (batch 1, greedy, prefill fragmentado a 512 tokens):

| Contexto | Prefill (tok/s) | Decode (tok/s) | Memoria pico (GB) |
|--:|--:|--:|--:|
| 512    | 1907 | 110.3 | 39.3 |
| 1024   | 2724 |  99.0 | 39.4 |
| 2048   | 1969 |  80.4 | 39.5 |
| 4096   | 1781 |  82.5 | 39.8 |
| 8192   | 1446 |  80.2 | 40.5 |
| 16384  | 1067 |  76.7 | 41.8 |
| 32768  |  571 |  72.6 | 44.2 |

La activacion de LSA a partir de 2048 tokens de KV mantiene la velocidad de decodificacion casi constante (110 a 73 tok/s) mientras el contexto crece hasta 32k. La memoria pico corresponde a los pesos 4-bit (~36 GB) mas las caches de MLA y del indexador.

## Requisitos de hardware

- VRAM estimada: los pesos 4-bit ocupan aproximadamente 36 GB, y la memoria total con contexto de 32k alcanza los 44 GB en un M5 Max. Para contextos mas largos, la memoria crecera proporcionalmente.
- GPU recomendadas: no se han publicado requisitos para GPU NVIDIA. En Apple Silicon, un chip con al menos 48 GB de memoria unificada (como M5 Max) es suficiente para contextos de hasta 32k tokens.
- No cabe en GPUs de consumo tipicas (8-24 GB) sin cuantizacion adicional o reduccion de contexto.
- Opciones de despliegue: unicamente mediante MLX con la libreria `mlx-vlm` modificada (PR #2063). No es compatible con vLLM, SGLang, llama.cpp ni Ollama en su estado actual.
- Latencia y throughput: los datos de la tabla anterior son los unicos disponibles, medidos en M5 Max.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de tamano similar (como Llama 3.1 70B, Qwen 2.5 72B o DeepSeek-V2-Lite) en la informacion proporcionada. La cuantizacion 4-bit es especifica de este modelo y no se han realizado evaluaciones comparativas de calidad o rendimiento frente a alternativas.

## Limitaciones y advertencias

- La implementacion es experimental: es la primera version funcional de LongCat-Flash-Lite-Sparse en MLX, y puede contener errores no detectados. Se recomienda validar en entornos de produccion.
- Solo funciona con la rama modificada de `mlx-vlm` (PR #2063); no hay soporte en otros frameworks de inferencia.
- Idiomas limitados a ingles y chino; no se ha evaluado su rendimiento en otros idiomas.
- La cuantizacion 4-bit puede degradar ligeramente la calidad de generacion respecto al modelo original en FP16, aunque no se han publicado mediciones de ese impacto.
- El modelo base no es de tipo "thinking" (no genera cadenas de razonamiento explicito), lo que puede limitar tareas que requieran reflexion prolongada.
- La correccion de la fusion del embedding n-gram es especifica de esta implementacion; si se usa el modelo base en otros frameworks, puede aparecer el error de division por 13.

## Enlaces

- [AlazarM/LongCat-Flash-Lite-Sparse-4bit (HuggingFace)](https://huggingface.co/AlazarM/LongCat-Flash-Lite-Sparse-4bit)
- [meituan-longcat/LongCat-Flash-Lite-Sparse (modelo base)](https://huggingface.co/meituan-longcat/LongCat-Flash-Lite-Sparse)
- [README del modelo base](https://huggingface.co/meituan-longcat/LongCat-Flash-Lite-Sparse/blob/main/README.md)
- [PR #2063 de mlx-vlm (soporte longcat_flash_sparse)](https://github.com/Blaizzy/mlx-vlm/pull/2063)
- [Pagina oficial de LongCat-Flash-Lite](https://www.longcatai.org/models/flash-lite)
