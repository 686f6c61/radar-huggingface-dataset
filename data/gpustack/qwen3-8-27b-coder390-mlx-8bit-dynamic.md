# gpustack/Qwen3.8-27B-Coder390-MLX-8bit-dynamic

## Resumen

`gpustack/Qwen3.8-27B-Coder390-MLX-8bit-dynamic` es una cuantizacion de 8 bits con precision mixta y esquema dinamico del modelo `nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2`, un transformer multimodal de 27.356 millones de parametros orientado a generacion de codigo y razonamiento. La desarrolla gpustack y esta empaquetada de forma nativa para MLX, la libreria de Apple para ejecutar modelos en silicio de Apple (chips M-series). El pipeline declarado es `image-text-to-text`, de modo que el modelo acepta entradas de imagen y texto.

La relevancia de esta publicacion es practica: conserva la torre de vision completa en BF16 y aplica cuantizacion afina de 8 bits (`group_size = 64`) solo a las proyecciones lineales del transformer, con un peso total de aproximadamente 29,72 GiB repartidos en 6 shards. Ademas, incluye un drafter especulativo `DFlash2-FP8` bajo el directorio `speculator/`, lo que permite decodificacion especulativa en local. El objetivo es que un modelo de 27B multimodal y especializado en codigo pueda ejecutarse en equipos Apple Silicon con memoria unificada, sin depender de GPUs dedicadas.

La licencia es Apache-2.0, heredada del modelo base, lo que facilita el uso comercial. El repositorio no registra descargas ni likes en el momento de la consulta y no incluye informacion sobre idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5/Qwen3.8, tag `qwen3_5`) con atencion lineal GDN, torre de vision y drafter especulativo |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit dinamico con precision mixta (afina, `group_size = 64`, `mode = "affine"`, RTN); modulos en BF16 sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX, 6 shards, ~29,72 GiB) + drafter `DFlash2-FP8` en `speculator/` |
| Libreria de inferencia | `mlx-lm` (texto) y `mlx-vlm` (multimodal) |
| Tamano del repositorio | 34,3 GB |
| Modelo base | `nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2` |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de la familia Qwen3.5/Qwen3.8 (tag `qwen3_5`) con 27,36 B de parametros. La nomenclatura del modelo base sugiere un proceso de ajuste supervisado (SFT) seguido de optimizacion con preferencias (RLOO), orientado a razonamiento eficiente y generacion de codigo, ademas de un componente MTP (multi-token prediction) y un drafter `DFlash2`. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni los detalles del pipeline de RLHF/DPO.

Esta publicacion concreta no reentrena el modelo: aplica cuantizacion de 8 bits por redondeo al mas cercano (RTN) con empaquetado afina estandar de MLX (`group_size = 64`). La asignacion de precision es selectiva: se mantienen en BF16 los embeddings (`embed_tokens`), la cabeza de salida (`lm_head`), las proyecciones `linear_attn.in_proj_a/b` de la atencion lineal GDN, toda la torre de vision (`model.visual.*`), los pesos de RMSNorm, `A_log`, `dt_bias` y `conv1d.weight`. El resto de proyecciones lineales del transformer se cuantizan a 8 bits (`Q8G64`). Esta estrategia preserva la calidad de la parte multimodal y de los componentes sensibles a la cuantizacion, mientras reduce el peso de las capas densas. El drafter especulativo `DFlash2-FP8` se incluye empaquetado para habilitar decodificacion especulativa.

## Capacidades

- Generacion de texto y razonamiento de varios pasos, con enfasis declarado en codigo (nombre `Coder390`).
- Generacion y finalizacion de codigo en distintos lenguajes, segun la orientacion del modelo base.
- Capacidades multimodales de imagen a texto: descripcion de imagenes, respuesta a preguntas visuales y tareas que combinan imagen y texto.
- Modo de razonamiento eficiente (`EfficientThink` en el nombre del modelo base), orientado a reducir el coste de cadenas de pensamiento largas.
- Decodificacion especulativa mediante el drafter `DFlash2-FP8` incluido, que acelera la generacion en MLX.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explicitamente en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Asistencia de programacion en local sobre Mac: el modelo puede generar y completar codigo directamente en un equipo Apple Silicon mediante `mlx-lm`, sin enviar codigo a servicios externos, lo que resulta adecuado para entornos con requisitos de privacidad.
- Revision de capturas de pantalla y diagramas: gracias a la torre de vision en BF16 y al pipeline `image-text-to-text`, puede describir interfaces, leer diagramas de arquitectura o interpretar errores mostrados en imagenes y proponer correcciones de codigo.
- Prototipado rapido de scripts y utilidades: con 27B de parametros y cuantizacion de 8 bits, es viable generar scripts de shell, automatizaciones o utilidades de linea de comandos en una estacion de trabajo personal.
- Razonamiento asistido con modo eficiente: el componente `EfficientThink` del modelo base lo hace adecuado para tareas de depuracion o explicacion de codigo donde se quiere un razonamiento acotado en lugar de cadenas de pensamiento muy largas.
- Despliegue en flujos de trabajo con `mlx-vlm`: integracion en herramientas que combinan imagen y texto, como asistentes de documentacion tecnica que procesan capturas y texto en una misma consulta.
- Evaluacion e investigacion de cuantizacion: el esquema de precision mixta con modulos selectivos en BF16 sirve como referencia para estudiar el impacto de la cuantizacion de 8 bits en modelos multimodales de 27B sobre MLX.
- Aceleracion de inferencia con decodificacion especulativa: el drafter `DFlash2-FP8` incluido permite comparar latencia con y sin especulacion en el mismo entorno MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de latencia o throughput.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 29,72 GiB solo para los pesos en 8 bits, mas el drafter `DFlash2-FP8` y el coste de activaciones y cache KV. En la practica se recomienda un minimo de 36-40 GB de memoria unificada.
- Plataforma: exclusivamente Apple Silicon, ya que el formato es MLX (`mlx-lm` y `mlx-vlm`). No es directamente compatible con CUDA.
- Equipos recomendados: Mac con chip M3 Max o M4 Max (36 GB o mas de memoria unificada); Mac Studio con M2 Ultra o M3 Ultra (64-192 GB) para mayor comodidad y contexto largo; MacBook Pro con 48 GB o mas para uso comodo.
- GPU consumer dedicadas (RTX 4090, etc.): no aplicable, el formato MLX no se ejecuta en CUDA sin conversion previa.
- Opciones de despliegue: `mlx-lm` para texto y `mlx-vlm` para multimodal, con los comandos `mlx_lm.generate` y `python -m mlx_vlm generate` documentados en la model card. vLLM, llama.cpp, Ollama y TGI no son compatibles con estos pesos tal cual.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| gpustack/Qwen3.8-27B-Coder390-MLX-8bit-dynamic | 27,36 B | no disponible | MLX (Apple Silicon), 8-bit mixto | Apache-2.0 | Cuantizacion con vision en BF16 y drafter especulativo |
| nerkyor/Qwen3.8-27B-Coder390-...-DFlash2 (modelo base) | 27,36 B | no disponible | safetensors, BF16 | Apache-2.0 | Pesos originales sin cuantizar; mayor consumo de memoria |
| Qwen2.5-Coder-32B-Instruct | 32,5 B | 128 K (segun documentacion publica del modelo) | safetensors, GGUF, multiples | Apache-2.0 | Referencia de codigo de tamano similar; no multimodal |
| Qwen2.5-VL-32B-Instruct | ~32 B | 128 K (segun documentacion publica del modelo) | safetensors, multiples | Apache-2.0 | Referencia multimodal de tamano similar; no especifico de codigo |

Nota: los datos de los modelos comparativos de la familia Qwen2.5 provienen de su documentacion publica y no de la informacion proporcionada para este modelo; se incluyen como referencia de categoria. No hay benchmarks publicados del modelo evaluado que permitan una comparacion de rendimiento directa.

## Limitaciones y advertencias

- No se han publicado datos de benchmarks, por lo que el rendimiento real frente a alternativas no esta verificado.
- El modelo base tiene un nombre que sugiere un ajuste muy especifico y posiblemente experimental (`Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2`); la calidad puede diferir de los modelos Qwen oficiales.
- La cuantizacion de 8 bits, aunque se describe como casi sin perdida, puede introducir degradaciones en tareas sensibles; no se aportan metricas de la perdida de calidad.
- Riesgo de alucinacion inherente a los modelos de lenguaje de 27B, especialmente en generacion de codigo con APIs o librerias poco comunes.
- Idiomas soportados no declarados; no se garantiza un rendimiento uniforme en castellano.
- Longitud de contexto no disponible; planificar el uso con contexto largo sin garantias documentadas.
- Compatibilidad limitada a Apple Silicon y MLX; no se puede desplegar en infraestructura CUDA sin conversion y revalidacion.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base y de los datos de entrenamiento originales.
- Repositorio sin descargas ni validacion de la comunidad en el momento de la consulta; tratar como publicacion reciente y poco contrastada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gpustack/Qwen3.8-27B-Coder390-MLX-8bit-dynamic
- Modelo base: https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Libreria MLX: https://github.com/ml-explore/mlx
- `mlx-lm`: https://github.com/ml-explore/mlx-lm
- `mlx-vlm`: https://github.com/Blaizzy/mlx-vlm
