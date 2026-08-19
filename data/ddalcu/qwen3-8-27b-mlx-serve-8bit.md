# ddalcu/Qwen3.8-27B-MLX-Serve-8bit

## Resumen

Qwen3.8-27B-MLX-Serve-8bit es una conversión en cuantización 8-bit del modelo multimodal Qwen/Qwen3.8-27B, realizada por ddalcu, autor del servidor nativo mlx-serve para Apple Silicon. El modelo combina capacidades de texto, visión, tool calling y razonamiento (thinking mode) en un único checkpoint, e incluye el head MTP (multi-token prediction) original, lo que permite acelerar la decodificación hasta 3,3 veces en tareas de código. Está pensado para ejecutarse de forma local en Macs con chip M-series, sin depender de Python ni de servicios en la nube.

La relevancia de esta conversión radica en que ofrece una alternativa de alta calidad para desplegar un modelo de 27B en hardware de Apple, con un ruido de cuantización muy bajo (0,71 % frente al 9,25 % de la versión 4-bit) y una ventana de contexto nativa de 262 144 tokens. El checkpoint incluye correcciones específicas para MLX (normas delta-encoded, transposición de la conv1d y ajuste del patch embed de visión) que garantizan un funcionamiento correcto en el ecosistema MLX. El modelo se distribuye bajo licencia Apache 2.0 y está disponible en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) con head MTP (multi-token prediction) para decodificacion especulativa |
| Parametros totales | 9.098.097.392 (segun safetensors; el modelo base se denomina Qwen3.8-27B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 8-bit affine, group size 64 (tambien existe version 4-bit del mismo autor) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal que procesa texto e imagenes, con una ventana de contexto de 262 144 tokens. La conversion MLX mantiene la arquitectura original e incorpora el head MTP (multi-token prediction), que permite al servidor mlx-serve anticipar varios tokens a la vez y verificarlos contra el modelo principal, acelerando la decodificacion sin alterar la salida. La cuantizacion 8-bit se aplica a todos los pesos de matmul-read (attention q/k/v/o, MLPs, proyecciones GatedDeltaNet y lm_head) con grupo de tamano 64, mientras que los embeddings, la torre de vision, mtp.fc, normas, biases, convoluciones y estados SSM se mantienen en bf16.

Durante la conversion se corrigieron tres problemas especificos de MLX: las normas delta-encoded (que requieren anadir 1 a los pesos), la transposicion de la depthwise conv1d (de PyTorch a MLX) y el orden de canales del Conv3d patch embed de la torre de vision. No se dispone de informacion sobre los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO) en la documentacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento con thinking mode activado por defecto, ajustable mediante `enable_thinking` y `reasoning_effort` (xhigh, medium, low).
- Procesamiento de imagenes: el modelo acepta entradas de imagen a traves de las APIs de chat (image-text-to-text).
- Tool calling / function calling: usa el formato XML de Qwen3.8 (`<tool_call><function=name><parameter=key>`), que mlx-serve parsea, repara y convierte a `tool_calls` estandar de OpenAI.
- Soporte de agentes y razonamiento multi-paso gracias al thinking mode y a la integracion con MCP (Model Context Protocol) en MLX Core.
- Decodificacion especulativa con MTP: hasta 3,27x de aceleracion en tareas de codigo y 1,61x en prosa (medido en M4 Max).
- Compatibilidad con APIs OpenAI y Anthropic en el mismo puerto, lo que permite usarlo con Claude Code, OpenAI SDK, Continue, Cursor, Open WebUI, etc.
- Capacidades multilingues: no especificadas en la documentacion.

## Casos de uso

- Asistente de codigo en local: con el MTP activado, el modelo genera codigo a 53,6 tok/s en un M4 Max, lo que lo hace util para autocompletado, generacion de clases desde cero o refactorizacion en entornos de desarrollo sin conexion.
- Chat conversacional con vision: puede recibir imagenes y mantener conversaciones multi-turno con contexto largo (262K tokens), adecuado para soporte tecnico visual o analisis de capturas de pantalla.
- Agente autonomo con tool calling: integrable con MCP y clientes como Claude Code, permite ejecutar tareas multi-paso que requieren llamadas a herramientas externas (bases de datos, APIs, etc.).
- Servidor de inferencia local compatible con OpenAI/Anthropic: al exponer un endpoint HTTP estandar, puede sustituir a servicios en la nube en herramientas como Continue, Cursor u Open WebUI, manteniendo los datos en local.
- Analisis de documentos extensos: la ventana de 262K tokens permite procesar libros completos, informes tecnicos o codigo fuente de grandes repositorios en una sola pasada.
- Razonamiento estructurado con thinking mode: util para tareas de planificacion, descomposicion de problemas complejos o generacion de explicaciones detalladas, con control del esfuerzo de razonamiento por peticion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye datos de rendimiento de inferencia medidos en un M4 Max (128 GB) con macOS 26.5, temperatura 0, mediana de 3 ejecuciones:

| Workload | MTP on (por defecto) | MTP off | Aceleracion |
|---|---|---|---|
| Escribir una clase desde cero | 53,6 tok/s | 16,4 tok/s | 3,27x |
| Prosa explicativa | 26,4 tok/s | 16,4 tok/s | 1,61x |

Tambien se comparan las versiones 4-bit y 8-bit del mismo modelo:

| Version | Tamano en disco | Ruido de cuantizacion | Decode (MTP on) |
|---|---|---|---|
| 4-bit | 18,2 GB | 9,25 % | 75,3 tok/s |
| 8-bit | 31,2 GB | 0,71 % | 53,6 tok/s |

## Requisitos de hardware

- VRAM estimada: 31,2 GB en disco, por lo que se recomienda un Mac con al menos 32 GB de memoria unificada (la version 4-bit, de 18,2 GB, cabe en Macs de 32 GB).
- GPU recomendadas: Apple Silicon (M4 Max, M3 Max, etc.); no requiere GPU NVIDIA ni AMD.
- Compatibilidad con consumer GPU: no, esta optimizado exclusivamente para Apple Silicon mediante MLX.
- Opciones de despliegue: mlx-serve (binario nativo), MLX Core (app de menu bar con interfaz grafica), o cualquier servidor compatible con MLX.
- Latencia y throughput: 53,6 tok/s en codigo y 26,4 tok/s en prosa con MTP activado en M4 Max; 16,4 tok/s con MTP desactivado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B (nominal) | 262.144 | bf16 | Apache 2.0 | HuggingFace |
| Qwen3.8-27B-MLX-Serve-8bit (este) | 9.098.097.392 (safetensors) | 262.144 | 8-bit affine | Apache 2.0 | HuggingFace |
| Qwen3.8-27B-MLX-Serve-4bit | no disponible | 262.144 | 4-bit affine | Apache 2.0 | HuggingFace |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (vision-lenguaje con MTP) en la documentacion proporcionada.

## Limitaciones y advertencias

- Sesgos: no se han documentado sesgos especificos en la informacion disponible.
- Riesgo de alucinacion: no se menciona en la documentacion; como cualquier modelo de lenguaje, puede generar contenido incorrecto o inventado, especialmente en tareas de razonamiento complejo.
- Limitaciones de contexto o idioma: los idiomas soportados no estan especificados; la ventana de contexto es de 262K tokens, pero mlx-serve ajusta el tamano de la ventana segun la memoria disponible en la maquina.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones significativas, pero el modelo base Qwen3.8-27B puede tener condiciones adicionales (no detalladas en la documentacion).
- Caveats para produccion: la cuantizacion 8-bit introduce un ruido del 0,71 % en los pesos, que puede afectar a tareas de alta precision; el MTP no acelera por igual en todos los tipos de texto (menor ganancia en prosa); el modelo requiere Apple Silicon y no es portable a otras arquitecturas sin reconversion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ddalcu/Qwen3.8-27B-MLX-Serve-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Version 4-bit: https://huggingface.co/ddalcu/Qwen3.8-27B-MLX-Serve-4bit
- Sitio de mlx-serve: https://mlxserve.com
- Codigo fuente de mlx-serve: https://github.com/ddalcu/mlx-serve
- Descarga de MLX Core: https://github.com/ddalcu/mlx-serve/releases/latest
