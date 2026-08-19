# pyros-vault/Qwen3.8-27B-Uncensored-oQ8e-mtp

## Resumen

Qwen3.8-27B-Uncensored-oQ8e-mtp es una cuantización de 8 bits en formato MLX del modelo orcarouter/Qwen3.8-27B-Uncensored, una versión "abliterada" (sin rechazos) del Qwen3.8-27B original desarrollado por Alibaba Qwen. El modelo base es un transformer denso de visión-lenguaje con razonamiento configurable, diseñado para tareas de codificación, trabajo profesional, investigación y agentes de largo horizonte. Esta variante concreta ha sido cuantizada con la herramienta oQ (oMLX) usando precisión mixta de 8 bits con group size 64, lo que la hace adecuada para inferencia local en hardware Apple Silicon.

A pesar del nombre "27B", los pesos reales del modelo cuantizado suman aproximadamente 8.180 millones de parámetros, una discrepancia que conviene tener en cuenta al evaluar su capacidad real. El modelo mantiene la ventana de contexto nativa de 262.144 tokens y soporta entrada de imágenes, lo que lo convierte en una opción interesante para despliegues locales que requieran razonamiento multimodal sin censura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (qwen3_5) con vision encoder y MTP (multi-token prediction) |
| Parametros totales | 8.184.279.792 (segun safetensors; el nombre sugiere 27B, ver limitaciones) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (nativo del modelo base) |
| Tipos de cuantizacion | 8 bits, group size 64 (oQ / oMLX) |
| Idiomas soportados | ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (tambien existen GGUF y Ollama del mismo modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27.000 millones de parametros (aunque la cuantizacion aqui analizada pesa 8.180 millones, lo que sugiere que el repo puede contener una version podada o que el nombre es incorrecto). Incluye un codificador de vision para entrada de imagenes y soporta razonamiento configurable (modo thinking opcional). Incorpora MTP (multi-token prediction) para acelerar la decodificacion. El entrenamiento original de Qwen3.8-27B incluyo datos multilingues (principalmente ingles y chino) y un pipeline de alineacion con RLHF y DPO. La version "uncensored" fue sometida a un proceso de abliteracion (eliminacion de capas de rechazo) para reducir las negativas a peticiones delicadas, y posteriormente cuantizada a 8 bits con oMLX.

## Capacidades

- Generacion de texto y razonamiento paso a paso con modo thinking configurable (se puede activar o desactivar).
- Comprension de imagenes: entrada multimodal (image-text-to-text) para describir, analizar o responder sobre contenido visual.
- Generacion de codigo y soporte de tool calling / function calling, util para integraciones con APIs y agentes.
- Razonamiento agente de largo horizonte gracias a la ventana de contexto de 262K tokens.
- Multilingue limitado a ingles y chino (segun la model card).
- Capacidad de red-teaming y pruebas de seguridad ofensiva al estar "uncensored" (sin rechazos).

## Casos de uso

- Asistente de codigo local: el modelo puede generar, revisar y depurar codigo en ingles o chino, con soporte de tool calling para ejecutar comandos o consultar APIs, todo ello en una ventana de contexto amplia que permite mantener proyectos enteros.
- Analisis de documentos largos: con 262K tokens de contexto, puede resumir o extraer informacion de libros, informes o codebases completos sin necesidad de chunking.
- Agente de automatizacion de tareas: su capacidad de razonamiento multi-paso y function calling permite construir agentes que planifican y ejecutan acciones (envio de correos, gestion de archivos, consultas a bases de datos) de forma autonoma.
- Pruebas de red teaming en IA: al estar abliterado, es util para evaluar vulnerabilidades de otros sistemas o para investigar comportamientos de modelos sin restricciones.
- Asistente de investigacion multimodal: puede analizar figuras, diagramas o capturas de pantalla junto con texto, ayudando a interpretar resultados cientificos o documentacion tecnica.
- Despliegue en entornos sin conexion: al ser una cuantizacion MLX de 8 bits, cabe en Macs con Apple Silicon (16 GB de RAM unificada o mas) y permite ejecutar un asistente local sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta cuantizacion oQ8e-mtp en la informacion disponible. El modelo base Qwen3.8-27B original reporta resultados en evaluaciones como MathVision, pero no se incluyen cifras concretas en los materiales consultados. Se recomienda consultar la ficha del modelo base en Hugging Face para obtener datos comparativos.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser 8 bits y ~8.18B parametros, el peso cuantizado ocupa aproximadamente 8,2 GB, mas overhead de activaciones y cache KV. Se recomienda un minimo de 12 GB de memoria unificada o VRAM.
- GPU recomendadas: Apple Silicon (M1 Pro o superior) con 16 GB o mas; en PC, una RTX 4070 o superior con 12 GB de VRAM.
- Cabe en GPUs de consumo: si, en tarjetas con 12 GB o mas (RTX 4070, 4080, 4090, etc.) y en Macs con 16 GB de RAM unificada.
- Opciones de despliegue: al ser formato MLX, se puede usar con mlx-lm u oMLX; tambien existen versiones GGUF para llama.cpp y Ollama del mismo modelo base.
- Latencia y throughput: no disponible; dependera del hardware y del modo de razonamiento (thinking activado aumenta la latencia).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262K | Apache 2.0 | safetensors, GGUF | Modelo base con alineacion estandar |
| Qwen3.8-27B-Uncensored (orcarouter) | 27B | 262K | Apache 2.0 | safetensors, GGUF | Version abliterada sin rechazos |
| Qwen3.8-27B-Uncensored-oQ8e-mtp (este) | 8.18B (peso real) | 262K | Apache 2.0 | MLX safetensors | Cuantizacion 8 bits para Apple Silicon |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 | GGUF, safetensors | Alternativa densa de 8B sin vision |

La comparativa directa con el modelo original de 27B no es posible porque el peso real de esta cuantizacion es de 8.18B, lo que sugiere que el repo puede contener una version podada o que el nombre es incorrecto. En cualquier caso, su rendimiento sera inferior al de un 27B completo.

## Limitaciones y advertencias

- Discrepancia de parametros: el nombre indica 27B pero los pesos reales suman 8.18B. Esto puede deberse a un error del creador o a una poda no documentada. Verificar antes de usar en produccion.
- Modelo "uncensored": al haber sido abliterado, puede generar contenido ofensivo, ilegal o peligroso sin filtros. No apto para aplicaciones publicas sin supervision humana.
- Idiomas limitados: solo ingles y chino; el rendimiento en otros idiomas (incluido el espanol) no esta garantizado.
- Riesgo de alucinacion: como cualquier LLM, puede inventar hechos o codigo incorrecto, especialmente en tareas de razonamiento complejo.
- Cuantizacion de 8 bits: puede degradar ligeramente la calidad de salida respecto al modelo en BF16, aunque en 8 bits la perdida suele ser minima.
- Licencia Apache 2.0 permite uso comercial, pero el caracter "uncensored" puede generar responsabilidades legales si se usa para difundir contenido danino.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pyros-vault/Qwen3.8-27B-Uncensored-oQ8e-mtp
- Modelo base (orcarouter): https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oQ (oMLX): https://github.com/jundot/omlx
- Repositorio con version GGUF y Ollama: https://github.com/Wassimyounes01/qwen38-uncensored
- Version alternativa en Hugging Face: https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored
- Ficha en Wiro AI: https://wiro.ai/models/qwen/qwen3-8-27b-uncensored
- Ficha en LM Studio: https://lmstudio.ai/models/qwen3.8
