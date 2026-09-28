# lukey03/Qwen3.5-9B-abliterated-GGUF

## Resumen

Qwen3.5-9B-abliterated-GGUF es la distribucion en formato GGUF del modelo lukey03/Qwen3.5-9B-abliterated, una version "abliterated" (sin censura, con el comportamiento de rechazo eliminado) del modelo multimodal Qwen/Qwen3.5-9B de Alibaba. Lo mantiene el usuario lukey03 y esta pensado para ejecutarse en motores compatibles con GGUF como Ollama y llama.cpp, tanto en modo solo texto como con soporte de vision. El modelo base tiene 8.953.803.264 parametros (~9B) y es nativamente multimodal gracias al entrenamiento con fusion temprana, por lo que no existe una variante "VL" separada.

El problema que resuelve es doble: por un lado ofrece una via sencilla de desplegar localmente un modelo multimodal de ~9B en cuantizacion de 4 bits, y por otro elimina el comportamiento de rechazo mediante un procedimiento de dos etapas (proyeccion ortogonal iterativa segun Arditi et al., 2024 y ajuste fino QLoRA). El autor reporta una tasa de abliteration del 100% (18/18 prompts de prueba respondidos frente a 0/18 del modelo base), aunque una version previa del README de la familia indicaba un 72% (13/18).

Es relevante ahora porque combina tres caracteristicas poco frecuentes en una sola pieza: multimodalidad (imagen+texto), formato GGUF listo para Ollama y ausencia de rechazos, todo bajo licencia Apache 2.0. El repo acumula 25.433 descargas y 55 likes, con un tamano de repositorio de 48,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con fusion temprana (encoder de vision integrado) y cabezas MTP (multi-token prediction); 883 tensores (427 texto + 441 vision + 15 MTP) |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M y F16 (GGUF); MLX 4-bit y 8-bit en repos separados |
| Idiomas soportados | en, zh, ja, ko, fr, de, es |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors y MLX disponibles en otros repos de la misma familia) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B es un transformer denso de ~9B parametros con multimodalidad nativa: la vision esta integrada en todos los modelos Qwen3.5 mediante fusion temprana (early fusion), sin necesidad de un encoder externo ni de una variante "VL" independiente. El GGUF con vision se construye partiendo del GGUF oficial de Qwen/Qwen3.5-9B, que consta de 883 tensores (427 de texto, 441 de vision y 15 de MTP). Sobre esa base se sustituyen 400 tensores de texto por pesos abliterated; los 27 tensores restantes de texto no se ven afectados por la abliteration porque usan tipos de cuantizacion distintos y apuntan a attn_qkv y attn_v, mientras que la abliteration solo modifica o_proj/output_proj y down_proj. Los 441 tensores del encoder de vision y los 15 de MTP se conservan intactos desde el modelo oficial.

La abliteration se aplica en dos etapas. La primera consiste en 3 pasadas iterativas de proyeccion ortogonal siguiendo el metodo de Arditi et al. (2024), usando 170 prompts daninos y 160 inofensivos a lo largo de 12 categorias de rechazo, y modificando 64 matrices de pesos por pasada en las 32 capas. La segunda etapa es un ajuste fino QLoRA sobre las 5 categorias de rechazo "obstinadas" que persistieron, con r=64, alpha=128 y 5 epocas. El resultado reportado es una tasa de abliteration del 100% (18/18). No se detalla el volumen de tokens de entrenamiento del modelo original ni la composicion exacta del dataset de preentrenamiento.

## Capacidades

- Generacion de texto conversacional y respuesta a instrucciones.
- Comprension de imagenes: el pipeline es image-text-to-text y el GGUF con vision incluye el encoder completo.
- Modo thinking (razonamiento extendido) activado por defecto; se puede desactivar anadiendo `/no_think` al final del prompt para respuestas mas rapidas y directas.
- Multilingue: ingles, chino, japones, coreano, frances, aleman y espanol.
- Prediccion multi-token (MTP) integrada a nivel de arquitectura.
- Comportamiento sin rechazos: el autor indica que responde a prompts que el modelo base rechaza.
- No se documentan en la informacion disponible capacidades explicitas de tool calling, function calling ni de agentes multi-paso; conviene verificarlas en el modelo base.

## Casos de uso

- Asistente conversacional local sin restricciones tematicas: desplegado via Ollama (`ollama run lukey03/qwen3.5-9b-abliterated`), responde a consultas de investigacion sobre temas sensibles que el modelo base rechazaria.
- Analisis de imagenes en local: con la variante vision (`ollama run lukey03/qwen3.5-9b-abliterated-vision`, requiere Ollama 0.17.1+) se pueden procesar capturas, diagramas o fotografias y generar descripciones o extraer informacion sin enviar datos a la nube.
- Generacion de documentacion tecnica multilingue: al cubrir espanol, frances, aleman, chino, japones y coreano, permite redactar y traducir documentacion manteniendo un unico modelo local.
- Investigacion sobre alineacion y seguridad: sirve como sujeto de estudio para medir el efecto de tecnicas de abliteration sobre las tasas de rechazo (comparando 0/18 del base frente a 18/18 de esta version).
- Redaccion creativa sin filtros: util para escritura de ficcion con tematicas adultas o violentas donde un modelo censurado se negaria a continuar.
- Prototipado offline en maquinas de gama media: la cuantizacion Q4_K_M (5,2 GB solo texto, 6,1 GB con vision) permite ejecutar el modelo en portatiles con GPU de consumo o incluso CPU.
- Evaluacion comparativa de metodos de abliteration: al estar disponibles los pesos safetensors (~17 GB) y las versiones MLX 4-bit y 8-bit, se puede reproducir el procedimiento en distintas plataformas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo reportado es la tasa de abliteration:

| Metrica | Valor |
|---|---|
| Tasa de abliteration (prompts respondidos) | 100% (18/18) frente a 0/18 del modelo base |
| Prompts usados en la etapa 1 | 170 daninos + 160 inofensivos, 12 categorias |
| Matrices de pesos modificadas por pasada | 64, en 32 capas |

## Requisitos de hardware

- VRAM estimada para inferencia (solo texto, Q4_K_M, ~5,2 GB de fichero): en torno a 6-7 GB de VRAM para cargar en GPU.
- VRAM estimada para inferencia (vision + texto, Q4_K_M, ~6,1 GB de fichero): en torno a 7-8 GB de VRAM.
- VRAM estimada para F16 solo texto (~17 GB): requiere al menos ~18-20 GB de VRAM.
- GPU recomendadas: para Q4_K_M basta una RTX 3060/4060 de 8 GB o superior; para F16 se recomienda una RTX 4090 (24 GB), A100 o H100.
- Cabe en GPU de consumo: si, con la cuantizacion Q4_K_M, en tarjetas de 8 GB o mas; el modo F16 no cabe en la mayoria de GPUs de consumo salvo modelos de 24 GB.
- Opciones de despliegue: Ollama (version 0.17.1 o superior), llama.cpp y cualquier motor compatible con GGUF. Existen versiones MLX 4-bit (~4,7 GB) y 8-bit (~8,9 GB) para Apple Silicon.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| lukey03/Qwen3.5-9B-abliterated-GGUF | ~9B | imagen+texto | no disponible | apache-2.0 | GGUF (Ollama, llama.cpp) |
| Qwen/Qwen3.5-9B (base) | ~9B | imagen+texto | no disponible | apache-2.0 | safetensors / GGUF oficial |
| lukey03/Qwen3.5-9B-abliterated | ~9B | imagen+texto | no disponible | apache-2.0 | safetensors (~17 GB) |
| lukey03/Qwen3.5-9B-abliterated-MLX-4bit | ~9B | imagen+texto | no disponible | apache-2.0 | MLX 4-bit (~4,7 GB) |

La comparativa con modelos de otros autores no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo sin censura: la eliminacion del comportamiento de rechazo implica que puede generar contenido danino, ilegal o eticamente cuestionable; el autor lo distribuye "para fines de investigacion y educativos".
- Riesgo de alucinacion: la abliteration y el ajuste fino pueden degradar la fidelidad de las respuestas en temas factuales; no se aportan benchmarks de calidad que lo confirmen o desmientan.
- Consistencia del dato de abliteration: el README actual indica 100% (18/18), pero una version previa del README de la familia mencionaba 72% (13/18), lo que sugiere posibles discrepancias entre revisiones.
- Cobertura parcial de la abliteration: 27 de los 427 tensores de texto no se modificaron por usar tipos de cuantizacion distintos y apuntar a attn_qkv/attn_v.
- Longitud de contexto no documentada: no se especifica en la informacion disponible, lo que dificulta planificar tareas de contexto largo.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario es responsable de cumplir la legislacion aplicable; el aviso legal del autor limita explicitamente el proposito a investigacion y educacion.
- Compatibilidad: la variante con vision requiere Ollama 0.17.1 o superior.
- Riesgo de sesgos: no se documentan evaluaciones de sesgo o toxicidad en la informacion disponible.
- Uso en produccion: sin benchmarks publicados, no se recomienda desplegarlo en entornos criticos sin una evaluacion previa propia.

## Enlaces

- Modelo en HuggingFace (GGUF): https://huggingface.co/lukey03/Qwen3.5-9B-abliterated-GGUF
- Modelo safetensors: https://huggingface.co/lukey03/Qwen3.5-9B-abliterated
- Version MLX 4-bit: https://huggingface.co/lukey03/Qwen3.5-9B-abliterated-MLX-4bit
- Version MLX 8-bit: https://huggingface.co/lukey03/Qwen3.5-9B-abliterated-MLX-8bit
- README del repo GGUF: https://huggingface.co/lukey03/Qwen3.5-9B-abliterated-GGUF/blob/main/README.md
- Ficha en abliteration.org: https://abliteration.org/models/lukey03/Qwen3.5-9B-abliterated-GGUF
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.5-9b-abliterated-gguf-lukey03
- Paper de referencia (Arditi et al., 2024): https://arxiv.org/abs/2406.11717
- Ollama: https://ollama.com
- llama.cpp: https://github.com/ggerganov/llama.cpp
