# bartowski/Cloudflare_clef-GGUF

## Resumen

Cloudflare_clef-GGUF es la version cuantizada del modelo clef desarrollado por Cloudflare, publicada por bartowski mediante el pipeline de llama.cpp (release b11279). Se trata de un modelo multimodal de tipo image-text-to-text orientado a la generacion de salidas tipadas y estructuradas, con capacidades declaradas de clasificacion y soporte de codigo personalizado (custom-code). El checkpoint original cuenta con aproximadamente 27B parametros (26.895.998.464 en safetensors) y se distribuye bajo licencia Apache 2.0.

El interes principal de esta publicacion reside en que bartowski ofrece el modelo ya convertido a formato GGUF con cuantizaciones generadas mediante imatrix, lo que permite ejecutar un modelo multimodal de 27B en hardware de consumo o en servidores sin GPU de gama alta. El repositorio ocupa 440 GB e incluye desde pesos BF16 completos (53,81 GB) hasta cuantizaciones de 4 bits (a partir de 16,11 GB), ademas de un fichero mmproj necesario para el procesamiento de imagenes.

La relevancia actual del modelo esta vinculada a su enfoque en salidas estructuradas y tipadas combinadas con entrada de imagen, un nicho menos cubierto que el texto puro, asi como a la etiqueta qwen3.8 presente en los tags del repositorio, que sugiere una arquitectura basada en la familia Qwen. No obstante, la informacion publicada no detalla la longitud de contexto, los idiomas soportados ni los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tags sugieren base tipo Qwen; multimodal image-text-to-text) |
| Parametros totales | 26.895.998.464 (~27B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL, Q4_K_S, Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo original Cloudflare/clef. Los tags del repositorio incluyen referencias a "qwen3.8", "systemone" y "post-train", lo que apunta a una arquitectura transformer derivada de la familia Qwen, con una fase de post-entrenamiento especifica. El modelo es multimodal: acepta texto e imagen como entrada y produce salidas tipadas y estructuradas, y esta etiquetado como apto para clasificacion y salidas de codigo personalizado (custom-code). El pipeline declarado es image-text-to-text.

En cuanto al proceso de cuantizacion, bartowski ha utilizado llama.cpp en su release b11279 con calibracion imatrix, lo que mejora la preservacion de la calidad en cuantizaciones agresivas. Se indica explicitamente que no se emplea decodificacion especulativa. La model card documenta el formato de prompt (estilo ChatML con etiquetas `<|im_start|>` y bloques `<think>`) con un nivel de razonamiento configurado a "xhigh", asi como un formato especifico para tool calling basado en etiquetas XML `<tool_call>` y `<function=...>`. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional con formato de chat ChatML y modo de razonamiento explicito mediante bloques `<think>`.
- Procesamiento de imagenes como entrada (requiere el fichero mmproj para habilitar la vision).
- Generacion de salidas estructuradas y tipadas (image-text-to-typed-output), orientada a tareas de extraccion y clasificacion.
- Clasificacion de contenido a partir de texto e imagen.
- Soporte de tool calling / function calling con un formato XML especifico documentado en la model card.
- Razonamiento en varios pasos, con nivel de esfuerzo configurable ("reasoning effort is set to xhigh").
- Generacion de codigo personalizado (tag custom-code).
- Capacidades multilingues: no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Extraccion estructurada de datos a partir de imagenes: el modelo puede recibir una imagen (por ejemplo, una factura, un formulario o una captura de pantalla) y devolver campos tipados en un esquema predefinido, aprovechando su entrenamiento en salidas tipadas.
- Clasificacion automatica de documentos con componente visual: en pipelines de gestion documental, combinando texto e imagen para asignar categorias a cada documento entrante.
- Automatizacion de atencion al cliente con soporte de imagenes: el modelo puede gestionar conversaciones multi-turno en las que el usuario adjunta capturas o fotografias, manteniendo el formato de chat documentado.
- Agentes con tool calling: integracion en flujos agenticos donde el modelo decide invocar funciones externas mediante el formato `<tool_call>` documentado, por ejemplo para consultar APIs o bases de datos.
- Asistentes de codigo con razonamiento explicito: el modo `<think>` y la etiqueta custom-code permiten utilizarlo en tareas de generacion o revision de codigo donde se necesita trazabilidad del razonamiento.
- Despliegue en local para procesamiento de datos sensibles: al distribuirse en GGUF y con licencia Apache 2.0, es viable ejecutarlo en infraestructura propia sin enviar imagenes ni texto a servicios externos.
- Prototipado rapido en hardware de consumo: las cuantizaciones de 4 bits permiten evaluar un modelo multimodal de 27B en un equipo con GPU de 24 GB antes de decidir un despliegue mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (solo pesos, sin contar cache KV ni el fichero mmproj): bf16 ~53,81 GB; Q8_0 ~28,67 GB; Q6_K ~23,62 GB; Q5_K_M ~20,68 GB; Q4_K_M ~17,20 GB; Q4_K_S ~16,12 GB.
- GPU recomendadas para cuantizaciones altas (bf16, Q8_0): A100 80 GB, H100 80 GB o configuraciones multi-GPU.
- GPU recomendadas para cuantizaciones de 4-5 bits: RTX 4090 (24 GB), RTX 3090 (24 GB), A6000 (48 GB) o L40S.
- Compatibilidad con GPU de consumo: si, en cuantizaciones Q4 y Q5 (a partir de ~16-20 GB) cabe en tarjetas de 24 GB como la RTX 4090. Las cuantizaciones Q6_K (~23,62 GB) quedan al limite en 24 GB.
- Opciones de despliegue: llama.cpp (release b11279 o posterior), Ollama, LM Studio y cualquier runtime compatible con GGUF. Para habilitar vision es necesario cargar tambien el fichero mmproj correspondiente.
- vLLM / TGI: no disponible para formato GGUF de forma directa; requeriria el checkpoint original en safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente sobre modelos comparables de la misma categoria (multimodal de ~27B con salidas estructuradas) en los datos proporcionados, por lo que no se puede establecer una comparativa fiable.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Cloudflare_clef-GGUF | ~27B | no disponible | apache-2.0 | GGUF en HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se documentan sesgos conocidos, pero al no especificarse la composicion del dataset de entrenamiento no es posible evaluar su comportamiento en dominios sensibles.
- Riesgo de alucinacion inherente a los modelos generativos; conviene validar las salidas tipadas antes de usarlas en produccion.
- La longitud de contexto no esta documentada, lo que dificulta planificar despliegues con conversaciones o documentos extensos.
- Los idiomas soportados no estan declarados; el rendimiento en castellano no puede garantizarse a partir de la informacion disponible.
- El tool calling depende de un formato XML especifico (`<tool_call>` y `<function=...>`), por lo que requiere un parser compatible y no es intercambiable con formatos JSON de otros modelos.
- La decodificacion especulativa no esta soportada, lo que puede limitar el throughput en comparacion con modelos que si la implementan.
- Para el procesamiento de imagenes es imprescindible descargar y cargar el fichero mmproj junto con los pesos.
- Aunque la licencia del modelo base es Apache 2.0, conviene verificar los terminos del repositorio original de Cloudflare antes de un uso comercial a gran escala.
- La fecha de creacion del repositorio figura como 2026-10-01, dato que debe contrastarse con la fuente original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bartowski/Cloudflare_clef-GGUF
- Modelo base: https://huggingface.co/Cloudflare/clef
- llama.cpp (release b11279): https://github.com/ggml-org/llama.cpp/releases/tag/b11279
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Cuantizacion Q4_K_M (recomendada): https://huggingface.co/bartowski/Cloudflare_clef-GGUF/blob/main/Cloudflare_clef-Q4_K_M.gguf
