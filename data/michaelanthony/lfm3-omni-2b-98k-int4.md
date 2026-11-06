# MichaelAnthony/LFM3-Omni-2B-98K-INT4

## Resumen

LFM3-Omni-2B-98K-INT4 es una variante cuantizada a 4 bits (W4A16) de un fine-tune comunitario de contexto largo sobre el modelo multimodal LiquidAI/LFM3-Omni-2B. El autor, MichaelAnthony, partio del checkpoint oficial de Liquid AI y lo sometio a un SFT con LoRA (r=32) sobre datos sinteticos de contexto largo de 65k a 98k tokens, fusionando posteriormente el adaptador en un unico checkpoint. El resultado es un modelo de 2.166.928.384 parametros (aproximadamente 2,17 mil millones) con una ventana de contexto efectiva entrenada de unos 94k tokens y recuperacion verificada hasta 109k.

El modelo conserva la naturaleza omni del original: procesa texto, imagen y audio, e incorpora una modificacion arquitectonica relevante respecto al base, ya que las cinco capas de atencion deslizante (`sliding_attention`) se convirtieron en atencion completa (`full_attention`) con theta 1e6 y rotary parcial de 0,5, sin ventana. Esta variante concreta del repositorio es la INT4 weight-only empaquetada con compressed-tensors (`pack-quantized`, grupo 128 simetrico): los pesos lineales del modelo de lenguaje van a 4 bits y todos los codificadores, proyectores y embeddings permanecen en bf16.

Su relevancia practica es doble. Por un lado, ofrece contexto largo real (verificado con needle-in-haystack) en un modelo de apenas 2,6 GB de repositorio, lo que lo hace desplegable en hardware modesto. Por otro, segun el autor, es el formato de checkpoint mas pequeno que funciona en ROCm sobre AMD R9700 (gfx1201) con vLLM 0.31.0, ya que INT8/W8A16 no dispone de kernel funcional en esa version y FP8 se distribuye en un repositorio hermano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (lfm3_omni) con capas de atencion completa; fine-tune convierte las 5 capas sliding_attention a full_attention (theta 1e6, rotary parcial 0,5, sin ventana) |
| Parametros totales | 2.166.928.384 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | ~98k+ tokens verificados; entrenamiento efectivo ~94k; recuperacion verificada hasta 109k; servido a 128k en vLLM |
| Tipos de cuantizacion | W4A16 INT4 weight-only (compressed-tensors pack-quantized, grupo 128 simetrico); lineales del LM a 4 bits, encoders/proyectores/embeddings en bf16; existen repos hermanos BF16, FP16, FP8, INT8 y GGUF |
| Idiomas soportados | no disponible |
| Licencia | other (LFM Open License del modelo base LiquidAI/LFM3-Omni-2B) |
| Formato de pesos | safetensors con compressed-tensors y custom_code; requiere runtime compatible (vLLM u otro con compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base es LFM3-Omni-2B de Liquid AI, un transformer multimodal de aproximadamente 2,17 mil millones de parametros que acepta entradas de texto, imagen y audio. El fine-tune comunitario modifica la configuracion de atencion: las cinco capas originalmente de atencion deslizante pasan a atencion completa con theta de RoPE 1e6 y rotary parcial de 0,5, eliminando la ventana local. El config de Hugging Face del repositorio ya incluye el campo `layer_types` corregido, de modo que no es necesario ajustarlo manualmente.

El entrenamiento consistio en un SFT con LoRA de rango 32 sobre datos sinteticos de contexto largo en el rango de 65k a 98k tokens, con posterior fusion del adaptador en un checkpoint unico. La longitud efectiva entrenada ronda los 94k tokens, aunque la recuperacion de informacion se verifico hasta 109k. Sobre esa base se aplico la cuantizacion W4A16 con compressed-tensors en formato `pack-quantized` con grupo de 128 y simetria, manteniendo en bf16 todos los componentes no pertenecientes a las capas lineales del modelo de lenguaje (codificadores, proyectores y embeddings).

No se dispone de informacion sobre el volumen total de tokens de entrenamiento, la composicion exacta del dataset sintetico, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se detallan innovaciones adicionales como decodificacion especulativa o atencion lineal mas alla de la conversion a atencion completa descrita.

## Capacidades

- Generacion de texto y razonamiento sobre ventanas de contexto muy largas (hasta ~98k-109k tokens verificados).
- Procesamiento multimodal de imagen: el autor confirma inferencia funcional con entradas de imagen en vLLM a 128k de contexto.
- Procesamiento de audio: entradas de audio verificadas como funcionales en el mismo entorno de servicio.
- Recuperacion de informacion en contexto largo (needle-in-haystack) con aciertos en profundidades del 10, 50 y 90 por ciento.
- Capacidad de ejecucion en runtime comprimido (compressed-tensors) mediante vLLM con `--trust-remote-code`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio especial: vision y audio confirmados; modo thinking no disponible.

## Casos de uso

- Analisis de documentos extensos: con ~98k tokens de contexto verificado, el modelo puede ingerir informes, contratos o expedientes completos en una sola pasada y responder preguntas sobre secciones concretas, apoyandose en la recuperacion verificada hasta 109k tokens.
- Procesamiento de audio de larga duracion: transcripcion, resumen y consulta sobre grabaciones extensas (reuniones, entrevistas) combinando la entrada de audio con el contexto largo para mantener coherencia entre segmentos.
- Analisis de imagenes con contexto textual amplio: por ejemplo, interpretar diagramas, capturas o documentos escaneados junto a un historial textual largo, util en herramientas de soporte tecnico o auditoria documental.
- Despliegue en hardware de gama consumer o estaciones AMD: al ocupar un repositorio de 2,6 GB en INT4 y funcionar en vLLM sobre ROCm (R9700, gfx1201), es adecuado para prototipos y entornos de desarrollo con GPU AMD donde otros formatos no tienen kernel funcional.
- Recuperacion aumentada sobre corpus largos: usar el modelo como generador en pipelines RAG donde el contexto recuperado sea muy extenso, aprovechando la ventana de ~98k para incluir muchos fragmentos sin truncar.
- Asistentes locales con privacidad: el tamano reducido del checkpoint permite ejecucion en una sola GPU o estacion de trabajo, lo que facilita escenarios donde los datos no pueden salir de la infraestructura propia.
- Evaluacion de modelos omni en investigacion: sirve como referencia para estudiar el efecto de convertir capas de atencion deslizante en atencion completa sobre tareas de recuperacion en contexto largo.

## Benchmarks y rendimiento

| Prueba | Configuracion | Resultado |
|---|---|---|
| Needle-in-haystack (Hugging Face) | Profundidades 10/50/90 %, 15k-109k tokens | 15/15 aciertos |
| Needle-in-haystack (GGUF) | 32k tokens, todas las cuantizaciones | Pasa en todas |
| Needle-in-haystack (GGUF) | 64k tokens, Q6_K | Pasa |
| Servicio vLLM FP8/W4A16 | 128k contexto, imagen y audio | Funcional |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los datos anteriores corresponden exclusivamente a pruebas de recuperacion en contexto largo y verificacion de servicio realizadas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 2,6 GB en INT4 W4A16; a esa cifra hay que sumar la cache KV para contextos largos, que crece de forma aproximadamente lineal con la longitud. A 128k tokens la cache KV puede superar ampliamente el peso de los parametros, por lo que se recomienda planificar VRAM adicional holgada.
- GPU recomendadas: el autor verifico servicio en AMD R9700 (gfx1201) con vLLM 0.31.0 y el kernel `RDNAHybridW4A16LinearKernel`. Para NVIDIA, se espera compatibilidad con GPUs Ampere o superiores (A100, H100, RTX 4090) a traves de vLLM, aunque no se documenta explicitamente en la informacion disponible.
- Cabe en GPU consumer: si, con matices. El peso del modelo es reducido, pero el contexto de 128k exige VRAM considerable para la cache KV; en GPUs de 16-24 GB conviene limitar `--max-model-len` o usar contextos intermedios.
- Opciones de despliegue: vLLM es el runtime documentado (`vllm serve ... --trust-remote-code --max-model-len 128000`). El formato empaquetado no puede ejecutarse con transformers estandar. Para llama.cpp u Ollama existen repos hermanos en GGUF del mismo autor.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-Omni-2B-98K-INT4 (este) | 2,17B | ~98k verificado (hasta 109k) | W4A16 compressed-tensors | LFM Open License | Hugging Face, vLLM |
| LFM3-Omni-2B-98K-FP8 | 2,17B | ~98k verificado | FP8 | LFM Open License | Hugging Face, vLLM |
| LFM3-Omni-2B-98K-GGUF | 2,17B | ~98k verificado | GGUF (multiples quants) | LFM Open License | Hugging Face, llama.cpp |
| LiquidAI/LFM3-Omni-2B (base) | 2,17B | no disponible en la informacion | safetensors | LFM Open License | Hugging Face |

La comparativa mas directa son los repositorios hermanos del mismo autor, que comparten arquitectura, datos de entrenamiento y verificacion de contexto largo, y difieren unicamente en el formato de pesos y el runtime objetivo. Frente al modelo base, la diferencia principal es la extension de contexto y la conversion de capas de atencion deslizante a atencion completa. No se dispone de datos de rendimiento comparativo frente a otros modelos omni de tamano similar.

## Limitaciones y advertencias

- Requiere un runtime compatible con compressed-tensors (vLLM u otro equivalente); no funciona con transformers estandar ni con cargadores que no soporten pesos empaquetados.
- El checkpoint lleva `custom_code` y exige `--trust-remote-code`, lo que implica ejecutar codigo del repositorio; conviene auditar el codigo antes de usarlo en produccion.
- La licencia es `other` (LFM Open License del modelo base), por lo que las condiciones de uso comercial dependen de dicha licencia y deben revisarse antes de un despliegue productivo.
- El entrenamiento se realizo sobre datos sinteticos de contexto largo; el comportamiento en dominios reales muy especializados puede diferir del observado en las pruebas needle-in-haystack.
- La recuperacion se verifico hasta 109k tokens, pero la longitud efectiva de entrenamiento es ~94k; usar el modelo por encima de ese rango puede degradar la calidad aunque el servicio acepte 128k.
- La cache KV a contextos de 128k puede consumir mas VRAM que los propios pesos, lo que limita el despliegue en GPUs de gama consumer.
- No se dispone de informacion sobre sesgos, tasas de alucinacion, cobertura idiomatica ni evaluaciones de seguridad.
- El numero de descargas (23) y de likes (0) es muy bajo, por lo que el modelo carece de validacion independiente de la comunidad.
- Al ser un fine-tune comunitario, no cuenta con el respaldo de soporte del desarrollador original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MichaelAnthony/LFM3-Omni-2B-98K-INT4
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Repositorios hermanos del mismo autor: `LFM3-Omni-2B-98K-BF16`, `LFM3-Omni-2B-98K-FP16`, `LFM3-Omni-2B-98K-FP8`, `LFM3-Omni-2B-98K-INT8`, `LFM3-Omni-2B-98K-GGUF` (bajo el usuario MichaelAnthony en Hugging Face)
- vLLM: https://github.com/vllm-project/vllm
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
