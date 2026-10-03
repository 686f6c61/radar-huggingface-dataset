# carlosmstavares/astabrief-8b-gguf

## Resumen
AstaBrief-8B GGUF FP16 es una conversion de pesos del modelo `allenai/AstaBrief_8B` al formato GGUF, publicada por el usuario carlosmstavares en HuggingFace. No se trata de un modelo entrenado desde cero: los pesos son identicos a los del modelo original y unicamente cambia el formato de almacenamiento, lo que permite ejecutarlo en herramientas como llama.cpp u Ollama sin necesidad de convertir manualmente los pesos desde PyTorch.

El modelo subyacente es un ajuste posterior al entrenamiento (post-training) de `Qwen/Qwen3-8B` orientado especificamente a tareas de deep research, es decir, a producir briefings y reportes estructurados a partir de informacion dispersa. La arquitectura es la de Qwen3: un transformer decoder-only de 36 capas, hidden size 4096 y atencion con GQA de 32 cabezas de consulta frente a 8 de clave/valor, con aproximadamente 8.190 millones de parametros.

La relevancia de esta publicacion es de caracter practico: facilita el despliegue local del modelo en su variante FP16 con llama.cpp y Ollama, aunque el tamano del archivo (unos 16,4 GB) exige hardware con bastante VRAM o memoria RAM si se usa en CPU. Se distribuye bajo licencia Apache-2.0 y esta declarado unicamente para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer decoder-only, GQA 32/8 cabezas, 36 capas, hidden 4096) |
| Parametros totales | 8.190.735.360 (~8,19 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; los ejemplos de la model card usan num_ctx 8192 |
| Tipos de cuantizacion | FP16 (f16) incluido; el autor recomienda Q4_K_M o Q5_K_M para uso en CPU, aunque no se incluyen en el repositorio |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (archivo `AstaBrief-8B-f16.gguf`, ~16,4 GB) |

## Arquitectura y entrenamiento
El modelo original sobre el que se construye esta conversion es un fine-tune post-training de `Qwen/Qwen3-8B`, por lo que hereda la arquitectura Qwen3: transformer decoder-only con 36 capas, dimension oculta de 4096 y atencion con grouped-query attention de 32 cabezas de consulta y 8 de clave/valor. El modelo base Qwen3-8B fue entrenado por Alibaba Qwen; `allenai/AstaBrief_8B` lo adapta mediante post-training para tareas de deep research, con el objetivo declarado de generar briefings y reportes estructurados en lugar de mantener conversacion general.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO en la fase de post-training. Respecto a la conversion, esta se genero con `convert_hf_to_gguf.py` de llama.cpp a partir de los pesos originales en PyTorch (`.bin`), que estaban en `bfloat16`; la salida GGUF se produjo con `--outtype f16`. El `eos_token_id` del modelo original es 151645.

## Capacidades
- Generacion de briefings y reportes estructurados: el modelo esta optimizado para tareas de deep research y sintesis de informacion.
- Produccion de texto en formato estructurado (secciones, resumenes, informes), segun la descripcion del autor.
- Ejecucion local en CPU o GPU mediante llama.cpp, Ollama y herramientas compatibles con GGUF.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitado a ingles segun la metadata del modelo.
- Modo thinking o capacidades especiales (vision, audio): no disponible en la informacion proporcionada.

## Casos de uso
- Generacion de informes de investigacion: el modelo puede recibir material fuente o contexto y producir un briefing estructurado con secciones, lo cual encaja con su ajuste post-training para deep research.
- Resumenes ejecutivos de documentacion extensa: adecuado para condensar notas, articulos o documentacion tecnica en un formato de resumen organizado.
- Asistentes internos de documentacion: integrado via llama.cpp u Ollama, puede servir como motor de generacion de resumenes en herramientas internas que ya dispongan de este tipo de runtime.
- Procesamiento por lotes de textos en ingles: al ser un modelo de 8B en FP16, puede ejecutarse en pipelines offline para generar briefings a partir de grandes volumenes de texto en ingles.
- Prototipado de aplicaciones de deep research: util para validar flujos de trabajo de investigacion automatizada antes de invertir en modelos mayores.
- Analisis y estructura de informacion tecnica: transformar conjuntos desordenados de notas en documentos con estructura fija, siempre que el contenido este en ingles.
- Despliegue local con requisitos de privacidad: al ejecutarse en llama.cpp u Ollama sobre hardware propio, permite procesar documentos sin enviarlos a servicios externos.
- Evaluacion comparativa del modelo original: sirve para reproducir el comportamiento de `allenai/AstaBrief_8B` en entornos GGUF sin depender de PyTorch.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para FP16: aproximadamente 16,4 GB solo para los pesos, mas la memoria de la cache KV. Con contexto de 8192 tokens, conviene disponer de al menos 20-24 GB de VRAM para un offload completo en GPU.
- GPU recomendadas para FP16: A100 (40 GB), H100, L40S, RTX 3090 (24 GB) y RTX 4090 (24 GB) son las opciones mas realistas para cargar el modelo completo en memoria de video.
- GPUs de consumo: cabe en tarjetas de 24 GB (RTX 3090, RTX 4090). En tarjetas de 8-12 GB no cabe en FP16; seria necesario cuantizar a Q4_K_M o Q5_K_M, conversiones que el autor recomienda pero que no se incluyen en este repositorio.
- Opciones de despliegue: llama.cpp (`llama-cli -m AstaBrief-8B-f16.gguf -ngl 99 -c 8192`) y Ollama (creando un `Modelfile` con `FROM ./AstaBrief-8B-f16.gguf` y parametros `temperature 0.7`, `top_p 0.95`, `num_ctx 8192`).
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Idiomas |
|---|---|---|---|---|---|
| carlosmstavares/astabrief-8b-gguf | ~8,19 B | no disponible (ejemplos con 8192) | GGUF FP16 | Apache-2.0 | en |
| allenai/AstaBrief_8B | ~8,19 B | no disponible en la informacion proporcionada | safetensors / PyTorch (bfloat16) | Apache-2.0 | en |
| Qwen/Qwen3-8B | ~8 B (familia Qwen3) | no disponible en la informacion proporcionada | safetensors | Apache-2.0 | multilingue (segun Qwen) |

La comparacion se limita a los datos disponibles. No se han publicado en la informacion proporcionada resultados de rendimiento que permitan contrastar AstaBrief-8B frente a Qwen3-8B o frente a otros modelos de 7-8B, por lo que no es posible afirmar mejoras cuantitativas en tareas de deep research.

## Limitaciones y advertencias
- Idioma: el modelo esta declarado unicamente para ingles; no hay evidencia en la informacion proporcionada de un rendimiento fiable en castellano u otros idiomas.
- Uso previsto restringido: el propio autor indica que es un post-training de deep research optimizado para briefings y reportes estructurados, no para conversacion general, por lo que su comportamiento en chat abierto puede ser deficiente.
- Ausencia de benchmarks: no hay resultados publicados que permitan estimar su calidad frente a alternativas.
- Riesgo de alucinacion: al ser un modelo generativo de 8B sin datos publicados de evaluacion de fidelidad, existe riesgo de fabricar datos en tareas de investigacion, especialmente si se le pide informacion factual no contenida en el contexto.
- Tamano en FP16: el archivo de 16,4 GB es poco practico para despliegue en CPU o GPUs de gama media; se requiere cuantizacion adicional no incluida en el repositorio.
- Estado de adopcion: el repositorio registra 0 descargas y 0 likes, y no declara pipeline, por lo que la conversion no ha sido validada ampliamente por la comunidad.
- Licencia: aunque el repositorio se publica como Apache-2.0, el autor recomienda consultar la licencia y condiciones del modelo original antes de redistribuir o usar comercialmente.
- Fecha de publicacion: la metadata indica creacion y actualizacion en octubre de 2026, dato que conviene verificar antes de citar el modelo.

## Enlaces
- Repositorio GGUF: https://huggingface.co/carlosmstavares/astabrief-8b-gguf
- Modelo original: https://huggingface.co/allenai/AstaBrief_8B
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3-8B
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
