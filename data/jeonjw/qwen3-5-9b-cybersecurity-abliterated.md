# jeonjw/Qwen3.5-9B-CyberSecurity-Abliterated

## Resumen

Qwen3.5-9B-CyberSecurity-Abliterated es un modelo derivado de `unsloth/Qwen3.5-9B` publicado por el usuario jeonjw en Hugging Face. Se trata de un ajuste fino orientado a ciberseguridad al que se le ha aplicado posteriormente una tecnica de "abliteration": la proyeccion fuera de los pesos de la direccion de rechazo (refusal direction) calculada por capa. El resultado es un modelo multimodal de 9.409.813.744 parametros que conserva la torre de vision intacta pero presenta una alineacion de seguridad deliberadamente debil.

El modelo parte de la familia Qwen3.5, con arquitectura hibrida que combina capas de atencion completa con capas de atencion lineal (24 de 32 capas segun la model card). El pipeline declarado es `image-text-to-text`, por lo que acepta entradas de imagen y texto. La licencia es Apache 2.0 y el unico idioma declarado es el ingles. El checkpoint se distribuye en formato safetensors con un tamano de repositorio de 18,8 GB.

Su relevancia es acotada y muy especifica: sirve como banco de pruebas para investigacion en seguridad de modelos (red teaming, analisis de robustez de alineacion, estudios de abliteration) y para tareas de analisis de vulnerabilidades en entornos autorizados. No es un modelo de proposito general ni un sustituto de un asistente alineado; su publicacion tiene cero descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (atencion completa + atencion lineal), multimodal con torre de vision; derivado de Qwen3.5 |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en esta ficha; existe build GGUF publicado aparte (`jeonjw/Qwen3.5-9B-CyberSecurity-Abliterated-GGUF`) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo base es `unsloth/Qwen3.5-9B`, un transformer hibrido en el que 24 de las 32 capas usan atencion lineal (`linear_attn`) y el resto atencion completa (`self_attn`). Sobre esa base se mergeo en fp16 el adaptador LoRA `jeonjw/Qwen3.5-9B-CyberSecurity-LoRA`, orientado a ciberseguridad. No se especifican en la informacion disponible el numero de tokens de entrenamiento del LoRA, la composicion del dataset ni si hubo RLHF o DPO.

La innovacion tecnica central es la abliteration. El autor ejecuto un conjunto de prompts daninos y benignos sobre el modelo mergeado y capturo el estado residual del ultimo token en cada capa de decoder. A partir de la diferencia de medias (`mean(harmful) - mean(harmless)`) derivo una direccion de rechazo por capa y la proyecto fuera de todas las matrices de pesos cuya salida alimenta el stream residual: `self_attn.o_proj` en capas de atencion completa, `linear_attn.out_proj` en las 24 capas lineales y `mlp.down_proj` en todas las capas. La fuerza de proyeccion es `scale = 1.0`, es decir, eliminacion completa de la direccion. La torre de vision no se modifica. La cabeza MTP (multi-token prediction) no esta presente en el checkpoint, por lo que al convertir a GGUF debe pasarse `--no-mtp`.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat (`apply_chat_template`).
- Procesamiento de imagen y texto (`image-text-to-text`), con torre de vision sin modificar respecto al base.
- Razonamiento con modo thinking conmutable mediante `enable_thinking` (el autor mide el refusal rate con `enable_thinking=False`).
- Contenido tecnico de ciberseguridad: analisis de vulnerabilidades, explicacion de clases de fallo (por ejemplo, format string) y remediacion.
- Respuesta a peticiones de seguridad ofensiva con una tasa de rechazo reducida (17% medido sobre 6 prompts reservados).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.

## Casos de uso

- Investigacion en alineacion y abliteration: el modelo permite estudiar como la proyeccion de una unica direccion por capa afecta al comportamiento de rechazo, comparando con el base `unsloth/Qwen3.5-9B` y con el LoRA sin ablacionar.
- Red teaming controlado: sirve como sujeto de prueba para evaluar clasificadores de contenido y filtros de salida en pipelines de moderacion, dado que genera respuestas que un modelo alineado declinaría.
- Analisis de vulnerabilidades en entornos autorizados: con el system prompt de experto en seguridad defensiva que propone el autor, se usa para explicar clases de vulnerabilidad y proponer remediaciones sobre codigo o configuraciones.
- Formacion y concienciacion en seguridad: generacion de material didactico sobre tecnicas de ataque y su mitigacion, siempre en contextos de laboratorio y con supervision.
- Evaluacion de robustez de salvaguardas: medir la tasa de rechazo con heuristicas de palabras clave y comparar contra el modelo base para cuantificar el efecto de la ablacion.
- Procesamiento de capturas y diagramas: al conservar la torre de vision, puede recibir imagenes (por ejemplo, capturas de paneles o diagramas de red) junto a texto para tareas de analisis.
- Pruebas de carga y despliegue de modelos de 9B multimodales: util para validar pipelines de inferencia con transformers, vLLM o llama.cpp usando el build GGUF.

## Benchmarks y rendimiento

El unico dato de evaluacion publicado en la informacion disponible es la tasa de rechazo: 17% sobre 6 prompts reservados de seguridad ofensiva, decodificacion greedy y `enable_thinking=False`. El autor advierte que la deteccion de rechazo es una heuristica de palabras clave y que no midio linea base. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

| Metrica | Valor | Condiciones |
|---|---|---|
| Tasa de rechazo | 17% | 6 prompts reservados, greedy, `enable_thinking=False`, deteccion por palabras clave |
| Linea base de rechazo | no medida | — |

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 18,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: en torno a 10-11 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4): en torno a 5-6 GB para pesos, con margen adicional para contexto.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090, RTX 4080 o superiores para cuantizaciones de 4-8 bits.
- Cabe en GPU de consumo: si, en RTX 4090 a bf16 con contexto moderado, y en GPUs de 8-12 GB usando el build GGUF cuantizado.
- Opciones de despliegue: transformers (`AutoModelForImageTextToText`), llama.cpp/Ollama a partir del GGUF (recordando `--no-mtp` en la conversion), y servidores compatibles con la API de endpoints (`endpoints_compatible` en los tags). vLLM y TGI no se confirman en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-CyberSecurity-Abliterated | 9,41B | no disponible | imagen-texto | Apache 2.0 | Abliterado, alineacion debil, refusal 17% |
| unsloth/Qwen3.5-9B (base) | 9B (aproximado) | no disponible | imagen-texto | no disponible en esta ficha | Modelo base sin LoRA ni ablacion |
| jeonjw/Qwen3.5-9B-CyberSecurity-LoRA | no disponible | no disponible | no disponible | no disponible | Adaptador LoRA de ciberseguridad sin ablacionar |
| Qwen3.5-9B-CyberSecurity-Abliterated-GGUF | 9,41B | no disponible | imagen-texto | Apache 2.0 | Misma variante en formato GGUF |

La comparacion con alternativas de otros autores no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteration elimina una direccion de los pesos, no el comportamiento aprendido: parte de las peticiones seguira siendo declinada.
- Se proyecta una sola direccion por capa, pero el rechazo no es unidireccional, por lo que puede persistir comportamiento residual de negativa.
- La alineacion de seguridad esta debilmente reducida de forma intencionada: las salidas pueden ser inseguras o incorrectas.
- Riesgo elevado de alucinacion en contenido tecnico de seguridad, agravado por la falta de benchmarks publicados.
- Solo se declara soporte de ingles; el rendimiento en castellano no esta verificado.
- La longitud de contexto no se especifica en la informacion disponible, lo que impide planificar cargas con documentos largos.
- La tasa de rechazo del 17% se midio sobre solo 6 prompts y con una heuristica de palabras clave: no es una metrica fiable.
- Uso previsto exclusivamente licito: investigacion de seguridad, analisis de vulnerabilidades y trabajo defensivo en entornos autorizados. El autor no ofrece garantia de ningun tipo.
- Aunque la licencia es Apache 2.0, la redistribucion o el uso comercial de un modelo con salvaguardas debilitadas puede contravenir politicas de plataformas y normativa aplicable; conviene revisar el marco legal antes de desplegarlo.
- El checkpoint carece de la cabeza MTP; omitir `--no-mtp` en la conversion a GGUF puede producir errores de carga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jeonjw/Qwen3.5-9B-CyberSecurity-Abliterated
- Build GGUF: https://huggingface.co/jeonjw/Qwen3.5-9B-CyberSecurity-Abliterated-GGUF
- Adaptador LoRA de ciberseguridad: https://huggingface.co/jeonjw/Qwen3.5-9B-CyberSecurity-LoRA
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
