# Dugilos/gemma-4-31B-it-heretic-NSFW-GGUF

## Resumen

`Dugilos/gemma-4-31B-it-heretic-NSFW-GGUF` es una distribucion en formato GGUF de un modelo derivado de la familia Gemma 4 de Google, concretamente una variante "heretic" (abliterated/decensored) publicada por el usuario `yukiworks` bajo el identificador `gemma-4-31B-it-heretic-NSFW`. El repositorio actual, mantenido por `Dugilos`, se limita a empaquetar los pesos del modelo base en cuantizaciones GGUF para su uso con llama.cpp, junto con un proyector multimodal (`mmproj`) en BF16 que habilita la entrada de imagenes.

El modelo resuelve el caso de uso de despliegue local de un LLM multimodal de aproximadamente 30.700 millones de parametros con contexto conversacional, pensado para entornos donde el usuario quiere ejecutar inferencia sin conexion y sin las capas de rechazo/aliniamiento del modelo original. La relevancia actual radica en que permite ejecutar un modelo de ~31B con vision en hardware de consumo mediante cuantizaciones de 2 a 8 bits, con tamanos de archivo que van de 11,92 GB a 32,64 GB.

La ficha tecnica se apoya exclusivamente en los metadatos y la model card del repositorio. No se dispone de informacion sobre arquitectura interna, datos de entrenamiento, benchmarks ni idiomas soportados, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Gemma 4, transformer multimodal segun el pipeline `image-text-to-text`) |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q4_K_M, Q3_K_M, Q2_K; proyector multimodal en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con `license_link` a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base `yukiworks/gemma-4-31B-it-heretic-NSFW`: la model card no detalla capas, atencion, tipo de transformer ni si incorpora innovaciones como atencion lineal o decodificacion especulativa. El pipeline declarado es `image-text-to-text`, y la presencia de un archivo `mmproj` en BF16 confirma que el modelo incorpora un codificador/proyector de imagenes que se carga junto al modelo de texto para habilitar entrada multimodal. El recuento de parametros de 30.697.345.596 corresponde a los pesos reales en safetensors del modelo base.

Respecto al entrenamiento, la model card no aporta numero de tokens, composicion del dataset ni si hubo RLHF, DPO u otras etapas de alineamiento. Los tags `heretic`, `uncensored`, `decensored` y `abliterated` indican que el modelo base ha sido modificado para eliminar o reducir el comportamiento de rechazo del modelo original, pero no se documenta la tecnica concreta empleada. Las cuantizaciones del repositorio se generan de forma independiente a partir de un GGUF intermedio en BF16 usando llama.cpp, y el tokenizer y la plantilla de chat estan embebidos en cada GGUF de texto. El mismo `mmproj` BF16 es compartido por las cuatro cuantizaciones.

## Capacidades

- Generacion de texto conversacional multi-turno (pipeline `conversational`).
- Entrada de imagenes: el modelo acepta `image-text-to-text` cargando el `mmproj` BF16 junto a cualquiera de las cuatro cuantizaciones de texto.
- Comportamiento "uncensored"/abliterated: el modelo base ha sido modificado para reducir rechazos, orientado a contenido NSFW y sin filtros.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que sugiere integracion con infraestructura de inferencia tipo TGI/endpoints.
- Soporte de tool calling, function calling, agentes, razonamiento multi-paso, thinking mode, audio o capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local de un LLM multimodal de ~31B: cargando `Q4_K_M` (18,69 GB) y el `mmproj` BF16 (1,20 GB) en llama.cpp, se obtiene un asistente conversacional con vision ejecutable en una estacion de trabajo con GPU de 24 GB o en CPU con RAM suficiente.
- Generacion creativa sin restricciones de contenido: el caracter abliterated/decensored del modelo base lo hace adecuado para escritura de ficcion adulta o roleplay, casos en los que los modelos alineados suelen rechazar la peticion.
- Procesamiento de documentos con imagenes en local: al aceptar entrada `image-text-to-text`, puede emplearse para extraer y describir contenido de capturas, diagramas o paginas escaneadas sin enviar datos a un servicio externo.
- Prototipado de agentes conversacionales: el tag `endpoints_compatible` permite exponer el modelo detras de una API compatible con endpoints y construir sobre el un chatbot multi-turno.
- Evaluacion de tecnicas de abliteration: el repositorio sirve como referencia practica para estudiar como se comporta un modelo decensored frente al original en tareas de rechazo, seguridad y calidad.
- Inferencia en hardware limitado: las cuantizaciones `Q2_K` (11,92 GB) y `Q3_K_M` (15,29 GB) permiten ejecutar el modelo en GPUs de 12-16 GB o en sistemas solo-CPU, a costa de perdida de calidad.
- Fine-tuning o experimentacion sobre el modelo base: el GGUF intermedio en BF16 del que derivan las cuantizaciones puede servir de punto de partida para estudiar el efecto de la cuantizacion en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos de texto, sin contar overhead de contexto KV cache):
  - `Q2_K`: 11,92 GB.
  - `Q3_K_M`: 15,29 GB.
  - `Q4_K_M`: 18,69 GB.
  - `Q8_0`: 32,64 GB.
  - Proyector multimodal `mmproj` BF16: 1,20 GB adicionales si se usa entrada de imagen.
- GPU recomendadas: no disponibles de forma explicita. Por tamano, `Q4_K_M` encaja en GPUs de 24 GB (RTX 3090/4090, A10G, L4 24GB), `Q3_K_M` en 16 GB (RTX 4080, A4000) y `Q2_K` en 12 GB (RTX 3060 12GB, RTX 4070).
- Cabe en GPU de consumo: si, en las cuantizaciones Q2_K, Q3_K_M y Q4_K_M segun la VRAM disponible; Q8_0 requiere 32 GB o mas (A100 40GB, RTX 5090, o descarga parcial a CPU).
- Opciones de despliegue: llama.cpp (formato nativo), y por extension servidores compatibles con GGUF como Ollama o llama-cpp-python. El tag `endpoints_compatible` sugiere integracion con endpoints de inferencia, pero no se detalla el backend.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de contexto que permitan una comparacion cuantitativa fiable. Como referencia cualitativa de categoria (LLM multimodal de ~30B en GGUF):

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Dugilos/gemma-4-31B-it-heretic-NSFW-GGUF | ~30,7B | no disponible | apache-2.0 | GGUF | Variante abliterated/NSFW con vision |
| yukiworks/gemma-4-31B-it-heretic-NSFW | ~30,7B | no disponible | apache-2.0 | safetensors | Modelo base del que deriva este repo |
| Gemma 4 31B IT (original de Google) | ~30,7B | no disponible | licencia Gemma 4 | safetensors | Modelo alineado con rechazos, sin modificaciones heretic |

No se dispone de informacion sobre alternativas comparables adicionales en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo ha sido modificado para eliminar o reducir rechazos (`abliterated`, `decensored`); puede generar contenido NSFW, ofensivo o inapropiado sin filtro. El tag `not-for-all-audiences` lo confirma.
- Riesgo elevado de alucinacion: no se documentan evaluaciones de fidelidad ni de calidad tras la abliteration, que habitualmente degrada capacidades de razonamiento y seguridad.
- Licencia: aunque el campo declara `apache-2.0`, el `license_link` apunta a la licencia de Gemma 4 de Google, que impone restricciones de uso (incluida la politica de uso prohibido de Google). Verificar la compatibilidad antes de uso comercial.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingue.
- Longitud de contexto no disponible; no planificar despliegues que dependan de ventanas largas sin validacion previa.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-15); no hay evidencia de validacion por la comunidad.
- El modelo base es a su vez un derivado de terceros (`yukiworks`), por lo que la trazabilidad del entrenamiento y de las modificaciones no esta garantizada.
- Las cuantizaciones Q2_K y Q3_K_M degradan notablemente la calidad; para produccion se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Dugilos/gemma-4-31B-it-heretic-NSFW-GGUF
- Modelo base: https://huggingface.co/yukiworks/gemma-4-31B-it-heretic-NSFW
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- llama.cpp: https://github.com/ggml-org/llama.cpp
