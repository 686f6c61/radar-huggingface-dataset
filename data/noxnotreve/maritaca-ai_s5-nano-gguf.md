# NoxNotreve/maritaca-ai_S5-nano-GGUF

## Resumen

S5-nano es un modelo multimodal de tipo image-text-to-text desarrollado por Maritaca AI, un laboratorio brasileno especializado en modelos de lenguaje para portugues. El modelo, de aproximadamente 4.000 millones de parametros (4.326.350.848 segun los pesos safetensors), esta disenado para tareas de conversacion, razonamiento y comprension de imagenes, con soporte nativo para portugues e ingles. La ficha que nos ocupa es una cuantizacion GGUF del checkpoint original, publicada por el usuario NoxNotreve y generada con llama.cpp (release b12174) e imatrix.

La relevancia de este modelo radica en su ventana de contexto de hasta 262.144 tokens, su capacidad de alternar entre un modo de razonamiento explicito (Think) y un modo directo (Instruct), y la inclusion de una capa MTP (multi-token prediction) que habilita decodificacion especulativa. Estas caracteristicas lo situan como una opcion compacta para despliegue local en escenarios que requieren contexto largo y entrada multimodal, con licencia Apache 2.0.

La cuantizacion GGUF facilita su ejecucion en hardware de consumo mediante llama.cpp y herramientas compatibles, con un rango de tamanos que va desde los 2,51 GB de IQ4_XS hasta los 8,67 GB del checkpoint bf16 completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con capa MTP para decodificacion especulativa |
| Parametros totales | 4.326.350.848 (aproximadamente 4B; la model card original indica 5B para el checkpoint fuente) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL, Q4_0, Q4_K_S, IQ4_XS, IQ3_M (y superiores segun la lista completa del repo) |
| Idiomas soportados | Portugues (pt), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

S5-nano emplea una arquitectura transformer con capacidades multimodales: acepta texto e imagenes como entrada, requiriendo un fichero `mmproj` adicional para el procesamiento visual en el ecosistema llama.cpp. El checkpoint incorpora una capa de multi-token prediction (MTP), que permite decodificacion especulativa y por tanto acelerar la generacion al predecir varios tokens por paso y validarlos posteriormente. El modelo opera en dos modos: Think, que genera un razonamiento previo a la respuesta, e Instruct, que responde de forma directa sin cadena de pensamiento.

No se dispone, en la informacion proporcionada, de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La cuantizacion GGUF se genero con llama.cpp b12174 aplicando imatrix, lo que mejora la calidad de los pesos cuantizados en comparacion con la cuantizacion estandar.

## Capacidades

- Generacion de texto conversacional multi-turno con formato de chat basado en `<|im_start|>` y `<|im_end|>`.
- Razonamiento explicito en modo Think, con etiquetas `<think>` para la cadena de pensamiento.
- Modo Instruct para respuestas directas sin razonamiento intermedio.
- Comprension de imagenes (image-text-to-text) mediante fichero mmproj.
- Soporte de tool calling / function calling con formato XML estructurado (`<tool_call>`, `<function=...>`, `<parameter=...>`).
- Capacidad de razonamiento multi-paso y uso de agentes gracias al modo Think y al soporte de herramientas.
- Multilinguee en portugues e ingles.
- Decodificacion especulativa mediante capa MTP.
- Ventana de contexto de 262.144 tokens para documentos y conversaciones extensas.

## Casos de uso

- Atencion al cliente automatizada en portugues: el modelo puede gestionar conversaciones multi-turno con historial largo gracias a sus 262.144 tokens de contexto, manteniendo coherencia en interacciones prolongadas y en el idioma nativo del mercado brasileno.
- Analisis de documentos e imagenes combinados: con soporte image-text-to-text y contexto largo, es adecuado para extraer informacion de facturas, capturas de pantalla o informes escaneados junto a texto de referencia.
- Asistentes con tool calling: la integracion del formato XML de funciones permite conectar el modelo a APIs externas (consultas de precios, busquedas, operaciones CRUD) en pipelines de agentes.
- Generacion de codigo asistida en local: al ejecutarse en GGUF con llama.cpp, puede integrarse en entornos de desarrollo sin conexion, usando el modo Think para tareas de depuracion o explicacion de codigo.
- Razonamiento matematico y logico paso a paso: el modo Think permite obtener cadenas de razonamiento verificables antes de la respuesta final, util en tutoria o validacion de calculos.
- Despliegue en dispositivos de borde: las cuantizaciones IQ4_XS (2,51 GB) y Q4_K_M (2,80 GB) permiten ejecutar el modelo en portatiles y equipos con GPU de consumo, habilitando asistentes privados sin dependencia de la nube.
- Procesamiento de corpus en portugues a gran escala: con licencia Apache 2.0 y contexto largo, puede emplearse para resumen, clasificacion y extraccion de informacion en lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con cuantizaciones IQ4_XS o Q4_K_M; alrededor de 4,6 GB con Q8_0; en torno a 8,7 GB con bf16.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para margen amplio de contexto; A100 o H100 para despliegues con contexto maximo y concurrencia.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con 6 GB o mas usando cuantizaciones Q4; las variantes bf16 requieren al menos 10-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; para el modelo base en safetensors, vLLM o TGI (no confirmado en la informacion disponible).
- Latencia y throughput: no disponibles. La capa MTP habilita decodificacion especulativa, que puede reducir la latencia respecto a decodificacion autoregresiva estandar, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| S5-nano (esta ficha) | ~4B | 262.144 | Texto + imagen | Apache 2.0 | GGUF y safetensors |
| Qwen2.5-VL-3B | ~3B | 32.768 (ampliable) | Texto + imagen | Apache 2.0 | safetensors, GGUF |
| Gemma 3 4B | ~4B | 128.000 | Texto + imagen | Gemma Terms | safetensors, GGUF |
| Phi-3.5-vision | ~4B | 128.000 | Texto + imagen | MIT | safetensors |

La comparativa se basa en caracteristicas publicas de modelos de tamano similar; no se dispone de datos de rendimiento comparativo para S5-nano en la informacion proporcionada. Destaca por su contexto de 262.144 tokens, superior al de las alternativas citadas, y por su enfoque bilinguee portugues-ingles.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al estar entrenado principalmente en portugues e ingles, puede presentar sesgos culturales y linguisticos de esos corpus.
- Riesgo de alucinacion: presente como en cualquier modelo generativo; el modo Think no garantiza veracidad de la cadena de razonamiento.
- Limitaciones de idioma: solo portugues e ingles declarados; el rendimiento en castellano u otros idiomas no esta garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar los terminos del modelo base y de los datasets de entrenamiento originales.
- El modo Think incrementa el consumo de tokens y la latencia; para produccion con requisitos estrictos puede ser preferible el modo Instruct.
- La cuantizacion GGUF introduce perdida de precision respecto al checkpoint original; las variantes de baja precision (IQ3_M y menores) pueden degradar tareas de razonamiento complejo.
- La entrada de imagenes requiere el fichero mmproj adicional; sin el, el modelo funciona solo con texto.
- El repositorio de esta ficha (NoxNotreve) no es el oficial de Maritaca AI; para produccion se recomienda contrastar con el repositorio original.

## Enlaces

- Repositorio de esta cuantizacion: https://huggingface.co/NoxNotreve/maritaca-ai_S5-nano-GGUF
- Modelo base original: https://huggingface.co/maritaca-ai/S5-nano
- Cuantizacion de referencia bartowski: https://huggingface.co/bartowski/maritaca-ai_S5-nano-GGUF
- Fichero IQ3_M de referencia: https://huggingface.co/bartowski/maritaca-ai_S5-nano-GGUF/blob/main/maritaca-ai_S5-nano-IQ3_M.gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Release de llama.cpp b12174: https://github.com/ggml-org/llama.cpp/releases/tag/b12174
