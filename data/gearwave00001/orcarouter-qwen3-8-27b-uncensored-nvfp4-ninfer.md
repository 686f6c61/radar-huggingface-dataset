# gearwave00001/orcarouter-Qwen3.8-27B-Uncensored-nvfp4-NInfer

## Resumen

Este repositorio contiene una conversión del modelo `orcarouter/Qwen3.8-27B-Uncensored` al formato de artefacto `.ninfer` con cuantización `nvfp4` (precisión mixta FP4/FP8). El autor, `gearwave00001`, publica este artefacto exclusivamente para el runtime de inferencia NInfer, no como un checkpoint de Transformers, Safetensors o GGUF. El modelo base es un fine-tune "uncensored" de Qwen3.8-27B, desarrollado por OrcaRouter, que a su vez hereda la arquitectura y licencia de Qwen/Qwen3.8-27B.

La relevancia de este artefacto radica en su orientación a GPUs Blackwell (SM120, como la RTX 5090), donde el formato `nvfp4` busca aprovechar las capacidades de precisión mixta de dicha arquitectura. Sin embargo, al tratarse de un formato propietario de NInfer, su uso queda restringido a ese runtime. El repositorio tiene un tamaño de 21,5 GB, coherente con un modelo de 27 mil millones de parámetros cuantizado a 4 bits, aunque no se proporcionan detalles sobre el contexto, el entrenamiento o los benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere transformer, basado en Qwen3.8-27B, sin confirmar) |
| Parametros totales | 27B (por nombre del modelo, no confirmado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | nvfp4 (FP4/FP8 mixto) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | .ninfer (artefacto NInfer) |

## Arquitectura y entrenamiento

No se dispone de información técnica detallada sobre la arquitectura interna del modelo. El repositorio es una conversión de formato, no un entrenamiento original. El modelo base `orcarouter/Qwen3.8-27B-Uncensored` es un fine-tune de Qwen3.8-27B, pero no se especifican los datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. La conversión a `nvfp4` implica una cuantización de 4 bits en punto flotante (FP4) con componentes en FP8, diseñada para GPUs Blackwell y el runtime NInfer. No se documentan innovaciones técnicas adicionales.

## Capacidades

No se han publicado capacidades específicas para este artefacto. Se espera que herede las capacidades del modelo base Qwen3.8-27B (generación de texto, razonamiento, código, matemáticas, etc.), pero no hay confirmación oficial. Tampoco se documenta soporte para tool calling, agentes, visión o audio. El término "uncensored" sugiere que el fine-tune elimina ciertos filtros de seguridad, pero no se detalla el alcance.

## Casos de uso

No se documentan casos de uso específicos para este artefacto. Al ser una conversión de formato, los casos de uso potenciales coinciden con los del modelo base, pero limitados al runtime NInfer y a GPUs Blackwell. Sin información adicional, no es posible enumerar aplicaciones concretas verificadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El formato `nvfp4` está orientado a GPUs Blackwell con soporte SM120 (por ejemplo, RTX 5090).
- El tamaño del repositorio (21,5 GB) sugiere que el modelo cuantizado podría caber en GPUs con 24 GB de VRAM o más, pero no se confirma.
- No se proporcionan datos de VRAM exacta, latencia ni throughput.
- El despliegue requiere el runtime NInfer (https://github.com/Neroued/ninfer); no es compatible con vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

Existen otras conversiones del mismo modelo base:

| Modelo | Formato | Tamaño repo | Runtime | Licencia |
|---|---|---|---|---|
| gearwave00001/orcarouter-Qwen3.8-27B-Uncensored-nvfp4-NInfer | .ninfer (nvfp4) | 21,5 GB | NInfer | Apache 2.0 |
| chimingw/Qwen3.8-27B-Uncensored-OrcaRouter-GGUF | GGUF | no disponible | llama.cpp/Ollama | Apache 2.0 |
| orcarouter/Qwen3.8-27B-Uncensored-FP8 | FP8 | no disponible | no especificado | Apache 2.0 |

No se dispone de datos de rendimiento comparativo entre estas versiones.

## Limitaciones y advertencias

- Formato propietario: el artefacto solo funciona con NInfer; no es un checkpoint estándar de Transformers ni GGUF.
- Sin benchmarks publicados: no hay evidencia de rendimiento ni de calidad de la cuantización.
- Riesgo de alucinación y sesgos: al ser un modelo "uncensored", puede generar contenido inapropiado o no filtrado; no se documentan mitigaciones.
- Compatibilidad restringida: requiere GPUs Blackwell (SM120) y el runtime NInfer; no es portable a otros entornos.
- Advertencia de placeholder: un blog de orcarouter.ai menciona que algunos repos de Qwen3.8-27B en formatos alternativos son "placeholder cards" sin pesos reales. Aunque este repositorio tiene un tamaño de 21,5 GB, no se ha verificado su integridad ni funcionalidad.
- Licencia Apache 2.0: permite uso comercial, pero el término "uncensored" puede implicar riesgos legales o éticos según el caso de uso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/gearwave00001/orcarouter-Qwen3.8-27B-Uncensored-nvfp4-NInfer
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Runtime NInfer: https://github.com/Neroued/ninfer
- Qwen3.8-27B original: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de OrcaRouter sobre placeholders: https://www.orcarouter.ai/blog/free-qwen-3-8-27b-api
