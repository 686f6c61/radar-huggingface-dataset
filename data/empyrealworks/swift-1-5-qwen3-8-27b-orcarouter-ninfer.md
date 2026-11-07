# empyrealworks/Swift-1.5-Qwen3.8-27B-OrcaRouter-NInfer

## Resumen

Swift 1.5 Qwen3.8 27B OrcaRouter · NInfer v3 es una conversión al formato NInfer v3 del checkpoint NVFP4 de Swift 1.5 OrcaRouter, un fine-tuning de Qwen3.8-27B realizado por UkisAI y posteriormente modificado por ajgazin mediante la aplicación de una dirección de rechazo (refusal direction) de OrcaRouter. El modelo resultante se distribuye como un único fichero de 22,78 GB que empaqueta en un solo artefacto el modelo de texto, el modelo de visión, una cabeza MTP (multi-token prediction) integrada y un drafter DFlash2 para decodificación especulativa.

La relevancia de esta ficha es doble. Por un lado, documenta una variante "uncensored" (según los tags del repositorio) del linaje Qwen3.8, orientada a eliminar comportamientos de rechazo en las respuestas. Por otro, ejemplifica una tendencia de empaquetado: en lugar de distribuir pesos en safetensors o GGUF, el autor publica un contenedor propietario (`.ninfer`) que solo carga en los runtimes NInfer e Infernix sobre GPUs NVIDIA Blackwell (sm_120) con CUDA 13.

El repositorio analizado es una copia byte a byte (SHA-256 `10d8dcf9...`) del checkpoint de kvnxiao, fijada a una revisión concreta. No es un lanzamiento oficial de UkisAI, Qwen, ajgazin ni kvnxiao, y la licencia es la Swift Open License v1.0 con avisos Apache 2.0 de Qwen y DFlash2 retenidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.8-27B, con atención en FP8, MLPs calibrados en NVFP4, GDN (gated delta network) y cabeza MTP integrada; drafter DFlash2 separado para decodificación especulativa |
| Parametros totales | 27B (según el nombre del modelo; no se detalla el desglose exacto en la información disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (valor usado en el ejemplo de despliegue con `--max-context 262144`) |
| Tipos de cuantizacion | NVFP4 en MLPs, FP8 en atención, GDN, pesos de token y de salida; KV cache en formato k4v2 |
| Idiomas soportados | no disponible |
| Licencia | Swift Open License v1.0, con avisos Apache 2.0 de Qwen y DFlash2 |
| Formato de pesos | `.ninfer` (NInfer v3), fichero único de 22.783.240.452 bytes |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B como base fundacional. Sobre ella, UkisAI produjo Swift 1.0 y posteriormente Swift 1.5, y ajgazin aplicó una dirección de rechazo de OrcaRouter sobre los pesos de Swift 1.5, generando la variante "uncensored". La conversión final a NInfer v3 la realizó kvnxiao, con MLPs calibrados en NVFP4 y atención, GDN, pesos de token y de salida en FP8. El drafter DFlash2 proviene de z-lab/Qwen3.8-27B-DFlash2.

El contenedor integra cuatro componentes en un solo fichero: modelo de texto, modelo de visión, cabeza MTP (multi-token prediction) y drafter DFlash2, además de una "indexed proposal head" mencionada en la model card del repositorio de origen. La decodificación especulativa se activa con `--spec dflash2 --draft-tokens auto --lm-head-draft`, y existe un fast path `fp16-gdn-state` para el estado de la GDN. No se dispone de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en las etapas de fine-tuning.

## Capacidades

- Generación de texto y razonamiento sobre la base Qwen3.8-27B.
- Procesamiento de visión: el contenedor incluye el modelo de visión y se activa con la flag `--vision`.
- Modo thinking: el flag `--preserve-thinking` sugiere soporte de trazas de razonamiento preservadas en la salida.
- Decodificación especulativa con drafter DFlash2 y cabeza MTP integrada, orientada a reducir latencia por token.
- Comportamiento "uncensored" por la aplicación de la dirección de rechazo de OrcaRouter, según los tags del repositorio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de inferencia de alta concurrencia en clústeres Blackwell: el formato NVFP4 con atención FP8 reduce el peso en memoria frente a FP16, y la decodificación especulativa con DFlash2 permite servir sesiones concurrentes con menor latencia por token en GPUs sm_120.
- Procesamiento de documentos largos con visión: la ventana de 262.144 tokens combinada con el modelo de visión permite ingerir informes, contratos o expedientes escaneados junto con su texto asociado en una sola pasada.
- Investigación sobre alineación y rechazo: al ser una variante con dirección de rechazo aplicada, sirve para estudiar cómo se comporta el modelo ante peticiones que la base rechazaría, comparando con Qwen3.8-27B y Swift 1.5 sin modificar.
- Evaluación de runtimes de inferencia: el fichero `.ninfer` está pensado para NInfer e Infernix, por lo que es útil para medir throughput y latencia de estos runtimes frente a vLLM o llama.cpp con los mismos pesos en otros formatos.
- Pipelines de razonamiento con trazas preservadas: el flag `--preserve-thinking` permite conservar el razonamiento intermedio para auditoría o depuración en entornos de investigación.
- Reproducibilidad de experimentos: al ser una copia byte a byte fijada a una revisión con SHA-256 verificado, es adecuado como artefacto de referencia en estudios que necesiten un checkpoint inmutable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La página de UkisAI (ukisai.com/swift-1-5-27b) menciona comparativas entre Qwen3.8-27B, Swift 1.0 y Swift 1.5 con protocolos de evaluación de cinco repeticiones, pero los valores numéricos no se han incluido en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: el fichero pesa 22,78 GB, por lo que la inferencia requiere al menos esa cantidad de memoria más el espacio para KV cache y estado de la GDN. Con contexto de 262.144 tokens y KV cache k4v2, el consumo adicional puede ser considerable; no se dispone de cifras exactas.
- GPU compatibles: exclusivamente NVIDIA Blackwell (sm_120) con CUDA 13, según la model card. No hay soporte indicado para arquitecturas anteriores (Ampere, Hopper) ni para GPUs de consumo de generaciones previas.
- ¿Cabe en GPU de consumo? No disponible. El tamaño del fichero (22,78 GB) supera la VRAM de muchas GPUs de consumo, y el requisito de sm_120 limita los modelos candidatos.
- Opciones de despliegue: NInfer e Infernix, con el comando `infernix-serve`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. La decodificación especulativa con DFlash2 y la cabeza MTP están diseñadas para mejorar la latencia, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime |
|---|---|---|---|---|---|
| Swift 1.5 Qwen3.8 27B OrcaRouter NInfer (este) | 27B | 262.144 | NVFP4 + FP8 | Swift Open License 1.0 | NInfer / Infernix (Blackwell) |
| kvnxiao/swift-1.5-qwen3.8-27b-orcarouter-dflash2-nvfp4-ninfer | 27B | no disponible | NVFP4 + FP8 | Swift Open License 1.0 | NInfer / Infernix |
| ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-NVFP4 | 27B | no disponible | NVFP4 | no disponible | no disponible |
| Qwen3.8-27B (base) | 27B | no disponible | no disponible | Apache 2.0 (según avisos retenidos) | no disponible |

## Limitaciones y advertencias

- El modelo solo carga en NInfer e Infernix sobre NVIDIA Blackwell (sm_120) con CUDA 13, lo que excluye la mayoría de GPUs en producción y todos los entornos sin CUDA 13.
- El formato `.ninfer` es propietario y no es compatible con los ecosistemas estándar (safetensors, GGUF), lo que dificulta la portabilidad y la inspección de pesos.
- La variante "uncensored" implica que el modelo puede generar contenido que la base rechazaría; requiere filtrado y moderación externos en producción.
- Riesgo de alucinación inherente a los modelos de 27B, sin datos de benchmarks publicados que permitan cuantificarlo.
- Idiomas soportados no documentados; no se puede asumir un rendimiento multilingüe homogéneo.
- La licencia Swift Open License v1.0 no es una licencia OSI estándar; es necesario revisar el fichero LICENSE antes de uso comercial.
- No es un lanzamiento oficial de UkisAI, Qwen, ajgazin ni kvnxiao; el soporte y las garantías son limitados.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/empyrealworks/Swift-1.5-Qwen3.8-27B-OrcaRouter-NInfer
- Checkpoint de origen: https://huggingface.co/kvnxiao/swift-1.5-qwen3.8-27b-orcarouter-dflash2-nvfp4-ninfer
- Derivado de ajgazin: https://huggingface.co/ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-NVFP4
- Drafter DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Página de UkisAI sobre Swift 1.5: https://ukisai.com/swift-1-5-27b
