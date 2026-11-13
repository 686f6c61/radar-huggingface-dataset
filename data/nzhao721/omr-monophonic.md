# nzhao721/omr-monophonic

## Resumen

`omr-monophonic` es un adaptador LoRA publicado por el usuario `nzhao721` sobre el modelo vision-lenguaje `Qwen/Qwen2-VL-2B-Instruct`. Su proposito es resolver una tarea concreta de reconocimiento optico de partituras musicales (OMR, optical music recognition): dada una imagen de una partitura monofonica, el modelo la transcribe a tokens semanticos PrIMuS en una unica cadena separada por espacios. No se trata de un modelo generalista de comprension musical, sino de un adaptador especializado para un formato de salida y un tipo de repertorio muy acotados.

El interes practico del adaptador radica en que reutiliza la capacidad visual y de instruccion de un VLM pequeno (2B parametros) y anade, mediante fine-tuning LoRA, una competencia simbolica especifica. El checkpoint publicado corresponde al paso 9000, tras aproximadamente 2,07 epocas sobre un corpus consolidado de unas 139.000 parejas imagen-tokens PrIMuS. El adaptador se distribuye con licencia Apache 2.0 y un unico archivo de pesos en safetensors de aproximadamente 0,7 GB.

Es relevante ahora porque cubre un nicho poco atendido por los modelos abiertos: la digitalizacion de partituras manuscritas e impresas hacia notacion simbolica procesable. Los resultados reportados por el autor en su conjunto de evaluacion son altos en token accuracy (97,91 % de media), aunque la tasa de coincidencia exacta cae al 70 % de media y al 15 % en el subconjunto de manuscritos capturados manualmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM transformer (Qwen2-VL-2B-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 2B en el modelo base; tamano exacto del adaptador no disponible (repo de 0,7 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (heredada del modelo base Qwen2-VL-2B-Instruct) |
| Tipos de cuantizacion | no disponible (entrenamiento en BF16; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (la salida es notacion simbolica PrIMuS, no lenguaje natural) |
| Licencia | Apache 2.0 (adaptador); el modelo base tiene su propia licencia |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft (con transformers, accelerate, qwen-vl-utils) |
| Rango LoRA | 32 |
| Alpha LoRA | 64 |
| Dropout LoRA | 0,05 |
| Precision de entrenamiento | BF16 |
| Version PEFT | 0.19.1 |
| Modulos objetivo | `q_proj`, `k_proj`, `v_proj`, `o_proj`, `qkv`, `gate_proj`, `up_proj`, `down_proj`, `fc1`, `fc2`, `lm_head` |
| Checkpoint | `checkpoint-9000` (2,07 epocas) |
| Formato de salida | tokens semanticos PrIMuS |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen2-VL-2B-Instruct`, un modelo vision-lenguaje basado en transformer que procesa imagenes junto con instrucciones textuales. El adaptador es un LoRA de rango 32 y alpha 64, con dropout 0,05, aplicado a los modulos de atencion (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `qkv`) y a los modulos MLP (`gate_proj`, `up_proj`, `down_proj`, `fc1`, `fc2`), incluyendo tambien `lm_head`. Esta cobertura amplia de modulos permite adaptar tanto la representacion visual interna como la generacion de la secuencia de tokens de salida.

El entrenamiento se realizo en BF16 sobre NVIDIA A100 (40 GB u 80 GB), con un objetivo de perdida calculado solo sobre los tokens del asistente (los tokens de imagen y de prompt quedan enmascarados). El corpus consolidado contiene aproximadamente 139.000 parejas imagen-tokens PrIMuS, con una mezcla de muestreo del 50 % manuscrito, 25 % digital limpio y 25 % distorsionado por camara, equilibrando dentro de cada estilo ejemplos originales y corruptos. El checkpoint publicado corresponde al paso 9000, tras 2,07 epocas. No se documentan en la model card tecnicas adicionales como decodificacion especulativa, atencion lineal o fases de RLHF/DPO.

## Capacidades

- Transcripcion de imagenes de partituras monofonicas a tokens semanticos PrIMuS en una unica cadena separada por espacios.
- Procesamiento de partituras manuscritas, digitales limpias y capturas distorsionadas por camara.
- Manejo de variantes de armadura (mayor/menor equivalentes) y alias de compas (`4/4` ↔ `C`, `2/2` ↔ `C/`) tras canonicalizacion en evaluacion.
- Robustez frente a corrupciones sinteticas del corpus de entrenamiento (original vs corrupt).
- Integracion con el pipeline `image-text-to-text` de Hugging Face y con el ecosistema transformers/PEFT.
- No soporta tool calling ni function calling de forma documentada.
- No se documentan capacidades de agente, razonamiento multi-paso, audio ni modo thinking.
- No se documenta soporte multilingue en lenguaje natural; la salida es notacion simbolica.

## Casos de uso

- Digitalizacion de partituras manuscritas: el adaptador convierte fotografias de partituras monofonicas en tokens PrIMuS, que pueden postprocesarse a notacion simbolica para archivo o edicion. Es adecuado por su entrenamiento especifico en estilo manuscrito, aunque la coincidencia exacta en `manual_handwritten` es solo del 15 %.
- Ejercicios de dictado melodico y entrenamiento auditivo: permite generar material simbolico a partir de imagenes de partituras para plataformas de teoria musical, usando la salida PrIMuS como representacion intermedia.
- Composicion asistida: a partir de una partitura monofonica escaneada, el modelo produce una secuencia de tokens que puede alimentar herramientas de generacion o variacion melodica.
- Procesamiento simbolico downstream: los tokens PrIMuS pueden transformarse a formatos de analisis musical (intervalos, contornos melodicos) para investigacion en musicologia computacional.
- Limpieza y normalizacion de corpus OMR: el adaptador puede usarse para transcribir lotes de imagenes limpias (100 % de token accuracy reportada en `clean_original` y `clean_corrupt`) como paso de anotacion automatica.
- Prototipado rapido de pipelines OMR: al ser un adaptador LoRA sobre un VLM de 2B, permite iterar con requisitos de hardware moderados frente a modelos OMR dedicados de mayor tamano.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre un conjunto golden de 100 imagenes, usando distancia de edicion a nivel de token tras canonicalizacion de armaduras y compases.

| Dataset | Token accuracy (%) | Exact match (%) |
|---|---:|---:|
| handwritten_original | 98,49 | 80,0 |
| clean_original | 100,0 | 100,0 |
| camera_distorted_original | 98,5 | 90,0 |
| handwritten_corrupt | 98,81 | 80,0 |
| clean_corrupt | 100,0 | 100,0 |
| camera_distorted_corrupt | 99,57 | 90,0 |
| manual_handwritten | 93,16 | 15,0 |
| manual_digital | 98,69 | 65,0 |
| **Media** | **97,91** | **70,0** |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, lo cual es coherente con la naturaleza especializada del adaptador.

## Requisitos de hardware

- El adaptador LoRA se suma al modelo base `Qwen2-VL-2B-Instruct`; la VRAM necesaria depende principalmente del modelo base y de la precision de carga.
- Entrenamiento realizado en NVIDIA A100 de 40 GB u 80 GB en BF16, segun la model card.
- Para inferencia, un VLM de 2B en BF16 requiere aproximadamente 4-5 GB de VRAM solo para pesos, mas memoria para activaciones y procesamiento de imagen; con cuantizacion de 8 bits o 4 bits podria caber en GPUs consumer, aunque no se documentan variantes cuantizadas del adaptador.
- GPU recomendadas: A100 para entrenamiento; para inferencia, GPUs con al menos 8-16 GB de VRAM son razonables segun el modo de carga, aunque no se aportan medidas concretas.
- Opciones de despliegue: transformers + peft + accelerate + qwen-vl-utils (flujo documentado). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nzhao721/omr-monophonic` | 2B (base) + LoRA | no disponible | OMR monofonico a PrIMuS | Apache 2.0 | Hugging Face |
| `Qwen/Qwen2-VL-2B-Instruct` | 2B | no disponible en esta informacion | VLM generalista image-text-to-text | licencia propia del modelo base | Hugging Face |
| Modelos OMR dedicados (p. ej. basados en PrIMuS) | no disponible | no disponible | OMR monofonico | no disponible | no disponible |

La comparativa con modelos OMR dedicados no puede completarse con datos verificables a partir de la informacion proporcionada; se indica como no disponible.

## Limitaciones y advertencias

- Solo cubre partituras monofonicas; partituras polifonicas u orquestales quedan fuera de alcance.
- El punto mas debil es el subconjunto `manual_handwritten`: 93,16 % de token accuracy y solo 15 % de exact match.
- La salida es exclusivamente tokens PrIMuS; no genera MEI, MusicXML ni LilyPond, por lo que se requiere conversion posterior para muchos flujos.
- El rendimiento depende de la calidad de imagen, el recorte y la similitud con los estilos de entrenamiento.
- Riesgo de alucinacion de tokens musicales en imagenes fuera de distribucion; no se documenta calibracion de confianza.
- No se documentan sesgos demograficos o linguisticos, pero tampoco evaluaciones al respecto.
- La licencia Apache 2.0 aplica al adaptador; el uso debe respetar tambien los terminos del modelo base `Qwen/Qwen2-VL-2B-Instruct`.
- Para produccion, conviene validar la salida con un normalizador simbolico y medir exact match en el dominio real, dado el bajo exact match en manuscritos.
- El repositorio no registra descargas ni likes en el momento de la consulta, lo que sugiere escasa validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/nzhao721/omr-monophonic
- Modelo base: https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct
- Paper de referencia PrIMuS (Calvo-Zaragoza y Rizo, 2018): no se proporciona URL en la model card; referencia bibliografica: *End-to-End Neural Optical Music Recognition of Monophonic Scores*, Applied Sciences, 8(4), 606.
- Repositorios, blogs o demos adicionales: no disponibles.
