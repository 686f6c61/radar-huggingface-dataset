# JRamirez-UAB/ZwZ2-27B-EXL3-4.0bpw-24GB

## Resumen

ZwZ2-27B-EXL3-4.0bpw-24GB es una cuantización no oficial, de tipo comunitario, del modelo `inclusionAI/ZwZ2-27B`, un modelo vision-lenguaje construido sobre el backbone Qwen3.6-27B y entrenado con GRPO para el proyecto *Zooming-without-Zooming-v2*. El objetivo del modelo original es razonar sobre evidencia visual distribuida por toda la imagen (comparación, agregación, emparejamiento y razonamiento multi-paso) sin necesidad de herramientas de zoom. La cuantización la publica el usuario JRamirez-UAB y no está respaldada por inclusionAI ni por Qwen.

El checkpoint usa EXL3 (exllamav3) con 4.0 bits por peso en las capas lineales, `lm_head` a 6 bits, torre de visión a 6 bits y embeddings de tokens en INT8. El objetivo declarado es servir el contexto completo de 262.144 tokens con visión en una única RTX 3090 de 24 GB usando caché KV en int4. Según el autor, el pool de KV alcanza 462.275 tokens y el consumo máximo es de 23.722 MiB.

Es relevante ahora porque demuestra que un modelo vision-lenguaje de razonamiento visual y contexto largo puede desplegarse en hardware de consumo Ampere, algo que normalmente exige GPUs de 80 GB. La contrapartida es una dependencia estricta de un stack concreto: vLLM 0.31.0 junto con exllamav3 1.6.5 y el plugin `vllm-quantpack` 0.1.4; ni un `pip install vllm` estándar, ni Transformers, ni SGLang pueden cargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (base Qwen3.6-27B), sin cabeza MTP; cuantizacion EXL3 |
| Parametros totales | 8.148.522.368 (segun safetensors del repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (pool KV de 462.275 tokens con int4) |
| Tipos de cuantizacion | EXL3 4.0 bpw en capas lineales, `lm_head` 6 bits, torre de vision 6 bits, embeddings INT8; cache KV int4 |
| Idiomas soportados | es, en |
| Licencia | apache-2.0 (declarada por el cuantizador; el repo de pesos original no declara licencia) |
| Formato de pesos | safetensors (2 shards, 15,03 GB) + `quantization_config.json` de exllamav3 |

## Arquitectura y entrenamiento

El modelo base es un transformer vision-lenguaje derivado de Qwen3.6-27B, con una torre de visión que procesa imagen y vídeo mediante `Qwen2VLImageProcessorFast`. El entrenamiento del modelo original se realizó con GRPO, orientado a tareas de razonamiento visual que requieren integrar evidencia de distintas regiones de una imagen sin recurrir a recortes o zoom. El modelo no incluye cabeza MTP, por lo que no admite decodificación especulativa nativa.

Esta versión es una cuantización post-entrenamiento: no se ha reentrenado ni ajustado. El proceso aplica EXL3 de exllamav3 1.6.5 con 4.0 bits por peso en las capas lineales, 6 bits en `lm_head` y en la torre de visión, y un paso adicional de recodificación de `embed_tokens` a INT8 por fila mediante `scripts/embed_int8.py`. El archivo `quantization_config.json` registra los bits por tensor y el tamaño de calibración, sin texto. Según el autor, la divergencia KL frente a BF16 es de 0,0090 en una traza de agente opencode, 0,0061 en una traza de sysadmin y 0,0066 en la traza pública de turboderp.

## Capacidades

- Generación de texto conversacional en español e inglés, con respuestas largas estables (0/30, 0/30 y 1/30 bucles a temperaturas 0,6, 0,8 y 1,0 sobre 90 respuestas en español).
- Razonamiento visual: comparación, agregación, emparejamiento y razonamiento multi-paso sobre una imagen completa sin herramientas de zoom.
- Procesamiento de imagen y vídeo mediante el procesador del modelo original.
- Tool calling y function calling: 60/60 en la reproducción 3 × 20 con la petición real de opencode y 30/30 en la batería de pruebas.
- Uso como agente de administración de sistemas Linux con ejecución real de comandos.
- Recuperación en contexto largo: 8/8 hechos en un mismo prompt a 64k, 128k y 241k tokens.
- Modo thinking opcional: la plantilla de chat responde sin razonamiento por defecto (`enable_thinking: false`); se puede activar por petición con `chat_template_kwargs`.
- Generación de código: 23/24 tareas de programación en dos ejecuciones (12/12 y 11/12).

## Casos de uso

- Agente local de administración de sistemas Linux: el modelo se integra con opencode y ejecuta comandos reales, con tool calling fiable (60/60) y contexto suficiente para mantener el estado de una sesión larga de diagnóstico.
- Razonamiento visual sobre capturas y diagramas: análisis de una imagen completa para comparar regiones, agregar datos de varias zonas o emparejar elementos, sin necesidad de recortes previos.
- Asistencia técnica en español con contexto largo: conversaciones multi-turno de hasta 262.144 tokens que permiten arrastrar logs, configuraciones y documentación sin truncar.
- Revisión de código y tareas de programación en pipelines: generación y corrección de parches con tool calling para invocar tests o linters dentro de un flujo de CI/CD.
- Recuperación de información en documentos extensos: lectura de manuales o expedientes de más de 200k tokens con recuperación verificada de hechos concretos (8/8 a 241k).
- Despliegue en estación de trabajo con una sola GPU: prototipado y evaluación de un modelo vision-lenguaje de razonamiento en una RTX 3090, sin depender de clústeres.
- Transcripción y análisis de vídeo: uso del procesador de vídeo del modelo original para tareas de descripción y razonamiento sobre secuencias.

## Benchmarks y rendimiento

| Metrica | Resultado | Condiciones |
|---|---|---|
| Divergencia KL vs BF16 | 0,0090 / 0,0061 / 0,0066 | Traza opencode / traza sysadmin / traza pública de turboderp |
| Tool calls (opencode real) | 60/60 y 30/30 | Reproducción 3 × 20 y batería |
| Vision | 15/15 | Pruebas del autor |
| Tareas de programación | 23/24 | 12/12 y 11/12 en dos ejecuciones |
| Needle (8 hechos) | 8/8 a 64k, 128k y 241k | Contexto largo |
| Bucles en respuestas largas (es) | 0/30, 0/30, 1/30 | Temperatura 0,6 / 0,8 / 1,0; 90/90 completadas |
| Decode | 43,3 / 73,1 / 133,8 / 133,9 tok/s | 1 / 2 / 4 / 8 peticiones, prompts cortos, sin decodificación especulativa |
| Uso de VRAM en pico | 23.722 MiB | RTX 3090 24 GB, configuración del Quick start |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: los pesos ocupan 15,03 GB; con caché KV int4 y contexto completo el pico medido es de 23.722 MiB, con unos 400 MiB realmente libres en una RTX 3090 de 24 GB.
- GPU recomendadas: RTX 3090 (24 GB, Ampere) es el único entorno probado. No cabe en GPUs de 16 GB.
- Consumer GPU: sí, en RTX 3090. El autor solo ha validado ese modelo y esa configuración (límite de potencia 350 W, sin otro uso).
- Despliegue: vLLM 0.31.0 + exllamav3 1.6.5 + plugin `vllm-quantpack` 0.1.4. No es compatible con Transformers, SGLang ni una instalación estándar de vLLM.
- Configuración obligatoria: `--max-model-len 262144`, visión activada, caché KV int4 y `--default-chat-template-kwargs '{"enable_thinking": false}'`; sin este último flag las respuestas llegan en `reasoning_content` y `content` queda vacío.
- Throughput: 43,3 tok/s con 1 petición, 73,1 con 2, 133,8 con 4 y 133,9 con 8 (prompts cortos, sin decodificación especulativa).
- Capacidad concurrente: una sesión completa de 262.144 tokens (1,76× según el recuento de vLLM).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZwZ2-27B-EXL3-4.0bpw-24GB (esta ficha) | 8.148.522.368 en safetensors | 262.144 | Si | apache-2.0 (declarada por el cuantizador) | HuggingFace, requiere stack EXL3 + vLLM |
| inclusionAI/ZwZ2-27B (BF16 original) | no disponible | no disponible | Si | no declarada en el repo de pesos | HuggingFace |
| Qwen3.6-27B (backbone) | no disponible | no disponible | no disponible | apache-2.0 | HuggingFace |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es una versión oficial de inclusionAI ni de Qwen; es una cuantización comunitaria sin respaldo de los autores originales.
- El repositorio de pesos original de ZwZ2-27B no declara licencia; la Apache-2.0 de esta cuantización se apoya en la licencia del código del proyecto y del backbone Qwen3.6-27B. Conviene verificar los términos de los autores antes de cualquier uso comercial.
- Solo se ha probado un entorno: RTX 3090 24 GB, vLLM 0.31.0, exllamav3 1.6.5 y vllm-quantpack 0.1.4. Otros stacks no pueden cargar el checkpoint.
- La configuración por defecto de vLLM asume razonamiento en el parser `qwen3`; sin el flag `enable_thinking: false` las respuestas quedan vacías en `content`.
- No hay cabeza MTP, por lo que no se puede aplicar decodificación especulativa nativa.
- La cuantización a 4.0 bpw introduce una divergencia KL de 0,006-0,009 frente a BF16; los resultados en otros dominios o idiomas pueden diferir de los reportados.
- Las evaluaciones del autor están sesgadas hacia un caso de uso concreto (agente de sysadmin Linux en español) y las trazas de calibración incluyen conversaciones reales de ese dominio.
- Solo se declaran idiomas es y en; no hay datos sobre otros idiomas.
- Riesgo de alucinación y sesgos: no se han publicado evaluaciones específicas en la información disponible.
- El modelo ocupa 15,03 GB de pesos y no cabe en GPUs de 16 GB.

## Enlaces

- HuggingFace: https://huggingface.co/JRamirez-UAB/ZwZ2-27B-EXL3-4.0bpw-24GB
- Modelo base: https://huggingface.co/inclusionAI/ZwZ2-27B
- Repositorio del proyecto: https://github.com/inclusionAI/Zooming-without-Zooming-v2
- exllamav3: https://github.com/turboderp-org/exllamav3
- Paper referenciado: arxiv:2610.37037
- Paper referenciado: arxiv:2406.11235
