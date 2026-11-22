# AMAImedia/Inkling2-Mini-26.4B-A3.4B-Unbound-BF16-GGUF

## Resumen

Inkling2-Mini-26.4B-A3.4B-Unbound-BF16-GGUF es una cuantizacion en BF16 y GGUF del modelo multimodal Inkling 2 Mini desarrollado por Thinking Machines Lab, publicada por AMAImedia bajo una variante "abliterated" y "uncensored" (denominada "Unbound"). El modelo original es un transformer autoregresivo multimodal con arquitectura de tipo "looped" y capas de mezcla de expertos (MoE) dispersa: 24 capas de decoder-only en las que las 12 capas centrales se ejecutan tres veces con pesos compartidos, lo que da 48 aplicaciones de capa por token a partir de 24 capas de pesos reales. Acepta entradas de texto e imagen y genera texto.

El modelo base tiene 26.388.646.440 parametros totales (segun los safetensors del repositorio) y activa aproximadamente 3.4B por token, lo que lo situa en la categoria de MoE de gran tamano total pero bajo coste de inferencia por token. Esta pensado para uso conversacional, instrucciones, codigo, tareas agenticas con tool use y sistemas RAG, y se distribuye con pesos abiertos bajo licencia Apache 2.0. La version de AMAImedia anade el sufijo "Unbound" y las etiquetas "abliterated" y "uncensored", lo que indica que se han eliminado o atenuado los mecanismos de rechazo del modelo original.

La relevancia actual del modelo radica en su combinacion de contexto multimodal, arquitectura MoE eficiente y disponibilidad en multiples formatos (safetensors, GGUF, NVFP4/MXFP8 en el original) para despliegue local en hardware de consumo y estaciones de trabajo. No obstante, la ficha del autor no proporciona datos de benchmarks ni detalles completos sobre el dataset de entrenamiento, por lo que muchas especificaciones quedan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE dispersa y capas "looped" (24 capas de pesos, 48 aplicaciones por token; atencion hibrida local/global) |
| Parametros totales | 26.388.646.440 |
| Parametros activos | Aproximadamente 3.4B por token (8 de 128 expertos por capa y token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, GGUF (repo con variantes GGUF; el original en NVFP4 y MXFP8) |
| Idiomas soportados | Ingles y soporte multilingue general (etiqueta HF: en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

Inkling 2 Mini es un transformer autoregresivo multimodal de 24 capas decoder-only con capas de feed-forward de tipo Mixture-of-Experts dispersa. La innovacion estructural principal es el esquema "looped": las 12 capas centrales se reutilizan tres veces con pesos compartidos, de modo que cada token atraviesa 48 aplicaciones de capa a partir de solo 24 conjuntos de pesos. En cada capa, cada token se enruta a 8 de 128 expertos. La atencion combina capas locales y globales, y la modalidad de imagen se procesa mediante un vision transformer integrado de forma nativa en el modelo.

El modelo base fue publicado por Thinking Machines Lab el 20 de noviembre de 2026 y se distribuye como un unico checkpoint de aproximadamente 20 GB en precisiones mixtas NVFP4 y MXFP8. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO; esa informacion figura como no disponible. La variante de AMAImedia es una conversion a BF16 y GGUF del modelo original, con modificaciones de tipo "abliterated" para eliminar rechazos, y se publica como derivado cuantizado del checkpoint base.

## Capacidades

- Generacion de texto conversacional e instrucciones de proposito general.
- Comprension de imagenes y texto combinados (pipeline image-text-to-text).
- Razonamiento y respuesta a preguntas en contextos multi-turno.
- Soporte de codigo en multiples lenguajes de programacion (segun la model card original).
- Uso en sistemas agenticos y tool use, orientado a asistentes de codigo, chatbots y RAG.
- Soporte multilingue general, con ingles como idioma principal declarado.
- Variante "uncensored/abliterated": el modelo derivado elimina o reduce los rechazos del original, lo que cambia el perfil de comportamiento en temas sensibles.
- Capacidades de vision integradas mediante vision transformer nativo.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con entradas de texto e imagen, lo que permite resolver consultas que incluyan capturas de pantalla o documentos escaneados, aunque la longitud de contexto no esta documentada.
- Asistente de codigo en produccion: su soporte declarado para tool calling y lenguajes de programacion lo hace apto para integrarse en pipelines de CI/CD y entornos de desarrollo, con la salvedad de que la variante "uncensored" requiere revision de seguridad adicional.
- Sistemas RAG multimodales: puede combinar recuperacion de documentos con imagenes y texto para responder preguntas sobre manuales tecnicos, catalogos o informes con graficos.
- Agentes de automatizacion de flujos: al ser un MoE con unos 3.4B parametros activos, el coste por token es contenido, lo que facilita su uso en agentes que realizan multiples pasos y llamadas a herramientas.
- Despliegue local en estaciones de trabajo: el checkpoint original de unos 20 GB y las versiones GGUF permiten ejecucion en Apple Silicon con 32 GB o mas y en GPUs con 32 GB de VRAM, util para prototipado y pruebas de privacidad.
- Procesamiento de imagenes en entornos con recursos limitados: la codificacion visual nativa y el bajo numero de parametros activos permiten clasificar, describir o extraer informacion de imagenes en hardware de consumo.
- Investigacion sobre alineacion y seguridad: la variante abliterated sirve como caso de estudio para comparar comportamientos con y sin mecanismos de rechazo, siempre con las cautelas eticas correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint original ocupa aproximadamente 20 GB en NVFP4/MXFP8; la version BF16 completa requiere del orden de 52 GB (26.4B parametros x 2 bytes) mas overhead, y las versiones GGUF reducen el requisito segun la cuantizacion.
- GPU recomendadas: NVIDIA DGX Spark (soporte oficial del modelo base), GPUs con 32 GB o mas de VRAM; para BF16 completo se recomienda 48-80 GB (A100 80 GB, H100).
- Cabe en GPU de consumo: si, en formato GGUF cuantizado; el modelo base cita Apple Silicon con 32 GB o mas y GPUs con 32 GB o mas de VRAM. Una RTX 4090 de 24 GB puede alojar cuantizaciones GGUF agresivas, no el BF16 completo.
- Opciones de despliegue: Hugging Face Transformers, SGLang, vLLM, TokenSpeed, NVIDIA Dynamo, Unsloth, llama.cpp, Llama App, Ollama y Exo Labs (Apple Silicon). El post-entrenamiento se soporta con Miles y SkyRL.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling2-Mini-26.4B-A3.4B-Unbound-BF16-GGUF | 26.4B | ~3.4B | no disponible | Apache 2.0 | Hugging Face (GGUF, safetensors) |
| Inkling 2 Mini (original, thinkingmachines) | 26.4B | ~3.4B | no disponible | Apache 2.0 | Hugging Face, Tinker API |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa queda limitada a los datos del propio modelo y su version original.

## Limitaciones y advertencias

- La variante "uncensored/abliterated" elimina o reduce los rechazos del modelo original, lo que puede producir contenido inapropiado o inseguro y exige filtros y politicas de uso adicionales en produccion.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad en la informacion disponible.
- La longitud de contexto no esta documentada, lo que impide garantizar el rendimiento en conversaciones o documentos muy largos.
- El idioma principal declarado es el ingles; el soporte multilingue es generico y no se detalla su calidad por idioma.
- La model card original remite a una politica de uso aceptable de Thinking Machines Lab; la licencia Apache 2.0 permite uso comercial, pero el derivado abliterated puede incumplir dicha politica de uso aceptable.
- No hay datos de benchmarks publicados, por lo que no es posible comparar su rendimiento con alternativas de forma objetiva.
- El repositorio tiene 245.5 GB de tamano total, lo que implica requisitos de almacenamiento considerables para descargar todas las variantes.
- La fecha de creacion y actualizacion del repositorio (noviembre de 2026) y el bajo numero de descargas y likes sugieren que la variante es reciente y poco validada por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AMAImedia/Inkling2-Mini-26.4B-A3.4B-Unbound-BF16-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio original de la variante Unbound: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound
- Repositorio GGUF original de la variante Unbound: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound-GGUF
- GitHub de Thinking Machines Lab (tinker-cookbook): https://github.com/thinking-machines-lab/tinker-cookbook
- Blog de Hugging Face sobre Inkling 2 Mini: https://hf.co/blog/inkling2mini
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2-mini
- Documentacion de Unsloth: https://unsloth.ai/docs/inkling-2-mini
- Llama App: https://llama.app/
- Documentacion de Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-mini
- Documentacion de SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Paquete tml-renderers en PyPI: https://pypi.org/project/tml-renderers/
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- Sitio web de AMAImedia: https://www.amaimedia.com
- X (Twitter) de AMAImedia: https://x.com/AMAImediacom
- LinkedIn de Ilia Bolotnikov: https://www.linkedin.com/in/ilia-bolotnikov
- Telegram de AMAImedia: https://t.me/AMAImediacom
