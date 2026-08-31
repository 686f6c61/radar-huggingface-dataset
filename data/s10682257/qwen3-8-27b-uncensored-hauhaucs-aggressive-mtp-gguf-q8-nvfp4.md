# s10682257/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF-Q8-NVFP4

## Resumen

El modelo `s10682257/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF-Q8-NVFP4` es una re-cuantización a nivel de tensor del modelo HauhauCS Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF, que a su vez deriva del Qwen3.8-27B de Qwen. Esta versión concreta convierte el cuantizado Q8_K_P original (31,46 GB, 9,21 bpw) en un perfil mixto NVFP4/Q8_0/F32/F16 de 17,10 GB (5,00 bpw), reduciendo el uso de VRAM en unos 15 GB y aprovechando los tensor cores FP4 nativos de las GPU NVIDIA Blackwell (serie RTX 50). El modelo conserva el encoder de visión, el head MTP/NextN y el tokenizer del original, y está pensado para inferencia local en tarjetas de 24 GB como la RTX 5060 Ti, 5070 o 5080.

La variante HauhauCS se describe como "agresiva" y sin censura: respuestas directas, sin comportamiento de rechazo y con un mínimo de preámbulo en prompts difíciles (0/465 rechazos según la model card). Esta re-cuantización no modifica los pesos ni las capacidades del modelo base, solo su representación numérica. El repositorio incluye tres archivos: el GGUF principal, un proyector de visión (mmproj) y un sidecar opcional FastMTP para aceleración. El autor es s10682257, y el modelo se distribuye en formato GGUF compatible con runtimes estándar como llama.cpp y Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal con encoder de vision y head MTP/NextN |
| Parametros totales | 1.863.907.840 (dato reportado en safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (configuracion de ejemplo usa 32 768 tokens) |
| Tipos de cuantizacion | NVFP4 mixto (NVFP4, Q8_0, F32, F16) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | GGUF (con safetensors en el repositorio) |

## Arquitectura y entrenamiento

El modelo es una re-cuantizacion, no un entrenamiento nuevo. Parte del Qwen3.8-27B, un transformer denso de 27 000 millones de parametros con encoder de vision y un head MTP (NextN) para decodificacion especulativa. La variante HauhauCS aplica una tecnica de "abliteracion" (eliminacion de comportamientos de rechazo) sobre los pesos, dando lugar a una version sin censura. Esta version concreta re-cuantiza el GGUF Q8_K_P (9,21 bpw) a un perfil mixto por tipos de tensor: las matrices grandes de computacion (FFN, proyecciones de atencion, salida DeltaNet) se pasan a NVFP4; los tensores delicados (embeddings, lm_head, estado recurrente DeltaNet, normas, head MTP) se mantienen en Q8_0, F32 o F16. El proceso usa una matriz de importancia generada con `llama-imatrix` sobre 45 fragmentos de calibracion (codigo, prosa, razonamiento, JSON y prompts agente) y se realiza con `llama-quantize --allow-requantize`. No se han modificado los valores de los pesos ni el dataset original.

## Capacidades

- Generacion de texto y razonamiento con respuestas directas y sin rechazo (comportamiento "uncensored").
- Vision: soporta entrada de imagenes y video mediante el proyector `mmproj` incluido en el repositorio.
- MTP/NextN: head de decodificacion especulativa nativo, preservado en esta re-cuantizacion.
- FastMTP: sidecar opcional que acelera la generacion (requiere parche de runtime de HauhauCS).
- Compatible con runtimes GGUF estandar: llama.cpp, Ollama, entre otros.
- Disenado para aprovechar los tensor cores FP4 de NVIDIA Blackwell (RTX 50-series).

## Casos de uso

- Inferencia local en GPU Blackwell de 24 GB: el modelo cabe en una RTX 5060 Ti, 5070 o 5080 con contexto amplio, gracias a la reduccion de VRAM de 31,46 GB a 17,10 GB. Es adecuado para desarrolladores que quieren ejecutar un modelo de 27B sin censura en hardware de consumo.
- Despliegue con Ollama: se puede importar mediante un Modelfile dual (modelo + proyector de vision) y configurar parametros como `num_ctx` y `num_predict`. Ideal para prototipos rapidos y aplicaciones de chat locales.
- Generacion de texto con vision: al incluir el proyector `mmproj`, el modelo puede procesar entradas de imagen y video, util para tareas de descripcion, analisis visual o asistentes multimodales.
- Aceleracion con FastMTP: el sidecar opcional permite multiplicar por 3 la velocidad de generacion en entornos que soporten el parche de HauhauCS, util para aplicaciones de baja latencia.
- Experimentacion con modelos sin censura: investigadores que estudian el comportamiento de modelos "abliterados" pueden usar esta cuantizacion para probar respuestas sin filtros en un entorno local.
- Integracion en pipelines de generacion de texto con contexto largo: aunque la longitud de contexto no esta documentada, la configuracion de ejemplo usa 32 768 tokens, suficiente para documentos extensos o conversaciones multi-turno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la re-cuantizacion "se mantiene cerca de la calidad Q5" gracias a los tensores de anclaje de calidad en alta precision, pero no aporta cifras concretas de MMLU, HumanEval u otros tests.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF principal pesa 17,10 GB; con el proyector de vision (931 MB) y el sidecar FastMTP (903 MB) el total ronda los 18,9 GB. Se recomienda una GPU con al menos 20-24 GB de VRAM para dejar margen de contexto.
- GPU recomendadas: NVIDIA RTX 5060 Ti, 5070, 5080 (Blackwell) por su soporte nativo de FP4. Tambien puede ejecutarse en GPUs anteriores, pero sin aceleracion FP4.
- Cabe en tarjetas de consumo de 24 GB, como las mencionadas. No cabe en GPUs de 16 GB o menos sin cuantizaciones adicionales.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El sidecar FastMTP requiere un parche especifico de HauhauCS.
- Latencia y throughput: no disponibles. La aceleracion FP4 de Blackwell deberia mejorar el rendimiento frente a cuantizaciones de 8 bits, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K (segun fuentes) | BF16/FP8 | Apache 2.0 (segun orcarouter) | HuggingFace |
| Qwen3.8-27B-Uncensored-OrcaRouter-GGUF | 27B | 262K (segun blog) | GGUF (varios niveles) | Apache 2.0, research-only | HuggingFace |
| Este modelo (NVFP4 mixto) | 27B (reportado 1,86B en safetensors) | No disponible | NVFP4 mixto | No disponible | HuggingFace |

La comparativa se basa en informacion publica de los repositorios y blogs citados. No hay datos de rendimiento comparativo entre estas versiones.

## Limitaciones y advertencias

- Modelo sin censura: al ser una variante "uncensored" y "agresiva", puede generar contenido inapropiado, ofensivo o peligroso. No es adecuado para aplicaciones de produccion sin moderacion.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar hechos o respuestas, especialmente en temas especializados.
- Licencia no disponible: no se especifica la licencia de esta re-cuantizacion, lo que genera incertidumbre legal para uso comercial o redistribucion.
- Datos de parametros inconsistentes: el repositorio reporta 1.863.907.840 parametros en safetensors, cifra que no corresponde a un modelo de 27B. Esto sugiere un posible error en el registro, aunque el modelo se anuncia como 27B.
- Longitud de contexto no documentada: no se indica el maximo de tokens soportado; la configuracion de ejemplo usa 32 768, pero el modelo base podria soportar mas.
- Requiere hardware especifico: el perfil NVFP4 esta optimizado para Blackwell; en GPUs anteriores puede haber perdida de rendimiento o incompatibilidad parcial.
- Re-cuantizacion con posible perdida de calidad: aunque se mantienen tensores clave en alta precision, la conversion a NVFP4 puede degradar ligeramente la calidad frente al Q8_K_P original.

## Enlaces

- Repositorio del modelo: https://huggingface.co/s10682257/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF-Q8-NVFP4
- Modelo base HauhauCS: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Modelo Qwen original: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante OrcaRouter GGUF: https://huggingface.co/chimingw/Qwen3.8-27B-Uncensored-OrcaRouter-GGUF
- Blog de orcarouter sobre Qwen3.8-27B uncensored GGUF: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Guia de ejecucion local: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Modelo en Ollama: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
