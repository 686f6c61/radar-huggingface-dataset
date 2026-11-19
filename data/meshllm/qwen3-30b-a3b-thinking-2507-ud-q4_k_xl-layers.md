# meshllm/Qwen3-30B-A3B-Thinking-2507-UD-Q4_K_XL-layers

## Resumen

`meshllm/Qwen3-30B-A3B-Thinking-2507-UD-Q4_K_XL-layers` no es un modelo entrenado desde cero, sino un paquete de distribucion en formato GGUF por capas del modelo Qwen3-30B-A3B-Thinking-2507, en su cuantizacion `UD-Q4_K_XL` generada por Unsloth. Lo publica el proyecto Mesh LLM, que trocea el fichero GGUF original en artefactos por capa y los empaqueta con un manifiesto (`model-package.json`) y checksums SHA-256 para poder ejecutar inferencia distribuida entre varias maquinas de un cluster local.

El modelo subyacente pertenece a la familia Qwen3 y sigue el esquema 30B-A3B: 30 mil millones de parametros totales con aproximadamente 3 mil millones activos por token, es decir, una arquitectura Mixture-of-Experts (MoE) dispersa. La variante `Thinking-2507` corresponde al modo de razonamiento extendido de Qwen3, actualizada en julio de 2025 por el equipo de Qwen (Alibaba). El paquete declara 48 capas y una licencia Apache 2.0 heredada del modelo fuente.

La relevancia de este repositorio es operativa: permite servir un modelo MoE de 30B en hardware modesto repartiendo capas entre varios hosts mediante el runtime `mesh-llm`, que expone una API compatible con OpenAI (`/v1/chat/completions`). Es util para equipos que quieren inferencia privada sin depender de la nube y sin una GPU unica con memoria suficiente para el GGUF completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3), 48 capas segun el paquete |
| Parametros totales | 30B (escala 30B-A3B); el campo safetensors del repo indica 623.120.640, cifra que no corresponde al modelo completo y debe interpretarse como metadato del empaquetado |
| Parametros activos | Aproximadamente 3B por token (esquema A3B) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | `UD-Q4_K_XL` (Unsloth Dynamic, ~4 bits); el paquete solo distribuye esta variante |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada del modelo fuente) |
| Formato de pesos | GGUF troceado por capas (layer package) con manifiesto `model-package.json` |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con capas de mezcla de expertos (MoE) de la familia Qwen3, con 30B de parametros totales y unos 3B activos por token, lo que reduce el coste computacional por token frente a un denso equivalente. La variante `Thinking-2507` esta orientada a razonamiento extendido: el modelo genera una traza de pensamiento antes de la respuesta final. Los detalles de composicion del dataset, numero de tokens de entrenamiento y etapas de RLHF/DPO no se recogen en la informacion proporcionada y deben consultarse en la model card del modelo fuente.

Este repositorio no contiene pesos entrenados nuevos: es un artefacto de empaquetado. El splitter de Mesh LLM toma el GGUF `Qwen3-30B-A3B-Thinking-2507-UD-Q4_K_XL.gguf` de Unsloth (revision `a9b37aaac12b2bd0098783a443429543dd76a14d`, SHA-256 `51a6e1bd...6199b`), lo divide en artefactos por capa, calcula checksums durante la escritura y publica un manifiesto con la identidad de la fuente. La innovacion tecnica es el reparto de capas entre peers de un cluster local con un runtime propio (`skippy`) y una API compatible con OpenAI.

## Capacidades

- Generacion de texto conversacional y modo de razonamiento (`thinking`) con traza intermedia antes de la respuesta.
- Razonamiento multi-paso y resolucion de problemas complejos gracias al modo Thinking de Qwen3.
- Generacion de codigo y matematicas, capacidad esperable en la familia Qwen3 (sin datos de benchmark especificos en este repo).
- Inferencia distribuida: reparto de capas entre varias maquinas mediante `mesh-llm serve --split`.
- Servicio local con API compatible con OpenAI (`/v1/chat/completions`, `/v1/models`, `/api/status`).
- Ejecucion privada en hardware propio, sin llamadas a servicios externos.
- Soporte de tool calling y capacidades multilingues: no confirmado en la informacion proporcionada para esta variante.

## Casos de uso

- Inferencia privada en cluster domestico: repartir las 48 capas del GGUF entre dos o tres equipos con GPU consumer y servir el modelo desde un unico endpoint compatible con OpenAI, evitando enviar datos a terceros.
- Sustitucion local de una API en la nube: apuntar clientes que ya usan el esquema OpenAI (`base_url` a `http://localhost:3131/v1`) al mesh y mantener el mismo codigo de integracion sin cambios.
- Asistente de codigo en red interna: el modo Thinking del modelo resulta adecuado para tareas de refactorizacion y depuracion multi-paso, y el despliegue local evita exponer el codigo fuente.
- Laboratorio de investigacion con recursos limitados: experimentar con un MoE de 30B sin necesidad de una GPU con 80 GB de VRAM, agregando memoria de varias maquinas.
- Prototipado de agentes con razonamiento: usar el modo Thinking para pipelines de varios pasos donde se necesita una traza intermedia auditable, siempre que se valide el soporte de tool calling en el runtime.
- Evaluacion de infraestructura distribuida: banco de pruebas para medir latencia y throughput de un mesh frente a un servidor unico con llama.cpp o vLLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la del modelo fuente (`unsloth/Qwen3-30B-A3B-Thinking-2507-GGUF`) para notas de rendimiento, pero no se incluyen cifras en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 18,0 GB, coherente con una cuantizacion de ~4 bits de un modelo de 30B; se necesita esa memoria agregada entre todos los peers mas overhead de KV cache.
- Reparto tipico: dos maquinas con 12 GB de VRAM cada una o tres con 8 GB pueden alojar el paquete completo repartiendo capas.
- GPU recomendadas: RTX 3090/4090 (24 GB) como nodos individuales; A100/H100 no son necesarias para esta cuantizacion, aunque mejoran el throughput.
- Cabe en GPU consumer: si, siempre que se distribuya entre varios equipos; en una sola GPU consumer de 24 GB el margen es ajustado y depende del contexto.
- Despliegue: runtime `mesh-llm` (comando `mesh-llm serve --model ... --split`); no se documenta compatibilidad con vLLM, llama.cpp u Ollama en este paquete.
- Latencia y throughput: no disponibles; dependen del numero de peers, la red local y el contexto utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este paquete (Qwen3-30B-A3B-Thinking-2507 UD-Q4_K_XL) | 30B totales / ~3B activos | no disponible | GGUF por capas | Apache 2.0 | Requiere runtime mesh-llm |
| unsloth/Qwen3-30B-A3B-Thinking-2507-GGUF | 30B totales / ~3B activos | no disponible | GGUF monolitico | Apache 2.0 | Mismo modelo, un solo fichero; requiere un host con memoria suficiente |
| Qwen3-30B-A3B (variante base, sin Thinking) | 30B totales / ~3B activos | no disponible | safetensors/GGUF | Apache 2.0 | Sin modo de razonamiento extendido |
| Qwen3-32B (denso) | 32B | no disponible | safetensors/GGUF | Apache 2.0 | Denso: mas coste por token, sin dispersion MoE |

## Limitaciones y advertencias

- No es un modelo nuevo: cualquier limitacion del Qwen3-30B-A3B-Thinking-2507 subyacente aplica integramente (sesgos, alucinaciones, idiomas).
- El modo Thinking genera tokens de razonamiento que aumentan la latencia y el consumo de contexto; hay que presupuestar `max_tokens` en consecuencia.
- El campo de parametros del repo (623.120.640) no refleja el tamano real del modelo y puede confundir en inventarios automaticos.
- El paquete solo incluye la cuantizacion `UD-Q4_K_XL`; no hay variantes de 8 bits ni de mayor precision en este repositorio.
- Dependencia de un runtime especifico (`mesh-llm`) y de su ABI `skippy` (no registrada en la ficha), lo que limita la portabilidad frente a llama.cpp o vLLM.
- El rendimiento depende de la red local entre peers; un enlace lento entre nodos degrada la latencia de forma significativa.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar los terminos del modelo fuente y las obligaciones de atribucion.
- Idiomas soportados no documentados en este repositorio; validar el comportamiento multilingue antes de produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/meshllm/Qwen3-30B-A3B-Thinking-2507-UD-Q4_K_XL-layers
- Modelo fuente (GGUF): https://huggingface.co/unsloth/Qwen3-30B-A3B-Thinking-2507-GGUF
- Web de Mesh LLM: https://www.meshllm.cloud
- Repositorio GitHub de Mesh LLM: https://github.com/Mesh-LLM/mesh-llm
- Discord: https://discord.gg/rs6fmc63eN
- Catalogo de paquetes: https://huggingface.co/datasets/meshllm/catalog
- Especificacion del formato layer-package: https://github.com/Mesh-LLM/mesh-llm/blob/main/docs/specs/layer-package-repos.md
