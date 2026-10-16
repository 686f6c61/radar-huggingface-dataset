# eCityAI-Sup/eCity-Omni

## Resumen

eCity-Omni es un modelo multimodal omni (cualquier-a-cualquier) desarrollado por eCityAI-Sup que procesa de forma conjunta video, audio y texto. Su objetivo central es mejorar la conciencia temporal (time awareness) de los modelos omni: no solo describir el contenido de un video, sino localizar eventos concretos con marcas de tiempo (temporal grounding) y responder preguntas abiertas multimodales.

Se distribuye bajo licencia Apache 2.0, con soporte de ingles y chino, pipeline any-to-any y compatibilidad con la libreria transformers. El articulo asociado, "ChronusOmni: Improving Time Awareness of Omni Large Language Models" (arXiv:2512.09841, 2025), da nombre al checkpoint, publicado como ChronusOmni. El repositorio ocupa 21,2 GB e integra un tower de vision, un encoder de audio BEATs y un LLM.

Es relevante porque combina comprension omni (video + audio + texto) con anclaje temporal explicito, una capacidad poco frecuente en los modelos omni genericos, y porque su pipeline de inferencia (extraccion de audio con ffmpeg, muestreo uniforme de fotogramas con marcas de tiempo y respuesta en formato de intervalos) esta documentado de forma reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | multimodal omni; tower de vision + encoder de audio BEATs + LLM (detalle interno no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible; checkpoint en el directorio ChronusOmni (incluye pesos del LLM, tokenizer, config y encoder BEATs); tamano de repositorio 21,2 GB |

## Arquitectura y entrenamiento

La model card documenta unicamente el flujo de inferencia, por lo que los detalles de entrenamiento (numero de tokens, composicion del dataset y tecnicas de alineacion como RLHF o DPO) no estan disponibles. La arquitectura combina tres componentes: un tower de vision (el codigo referencia `chronus/model/multimodal_encoder/oryx_vit.py` y usa el procesador de imagenes CLIP de `openai/clip-vit-large-patch14`), un encoder de audio BEATs (`BEATs_iter3_plus_AS2M_finetuned_on_AS2M_cpt2.pt`) y un LLM multimodal. El codigo se apoya en el proyecto Ola.

El enfoque tecnico del trabajo es la mejora de la conciencia temporal. El modelo responde a peticiones de localizacion temporal en el formato `From second{X} to second{Y}.`, y el script de inferencia anade automaticamente esa instruccion de formato (salvo que se desactive con `--no_grounding_prompt`). El pipeline de entrada extrae el audio del video con ffmpeg, muestrea uniformemente 64 fotogramas por defecto y asocia marcas de tiempo a cada uno antes de la inferencia.

## Capacidades

- Comprension conjunta de video, audio y texto como entrada multimodal.
- Localizacion temporal (temporal grounding): devuelve intervalos `[start, end]` en segundos con una cifra decimal.
- Preguntas y respuestas abiertas multimodales (modo sin instruccion de formato mediante `--no_grounding_prompt`).
- Conciencia temporal del contenido audiovisual (time awareness).
- Generacion de texto a traves del componente LLM.
- Soporte multilingue limitado a ingles y chino.
- Vision y audio: si (tower de vision y encoder BEATs).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, vision adicional o capacidades de audio especificas: no disponible.

## Casos de uso

- Indexado y busqueda semantica en archivos de video: dado un archivo largo y una pregunta del tipo "en que segmento aparece X", el modelo devuelve el intervalo de segundos exacto, lo que permite generar indices navegables por marcas de tiempo.
- Resumen audiovisual con marcas de tiempo: resumir el contenido de un video asociando cada afirmacion a un intervalo temporal, util para actas automaticas de reuniones o clases grabadas.
- Analisis de contenido deportivo: localizar jugadas o eventos concretos dentro de un partido combinando la senal de video y el audio (narracion, sonido ambiente).
- Moderacion y supervision de video bajo demanda: identificar en que momento de un video ocurre un contenido determinado para su revision posterior.
- Accesibilidad: generar descripciones temporales para personas con discapacidad visual, indicando cuando sucede cada evento relevante.
- Edicion de video asistida: seleccionar automaticamente los fragmentos donde ocurre una accion concreta para construir cortes o montajes.
- Investigacion en QA de video: banco de pruebas para estudiar anclaje temporal y comprension audiovisual conjunta, usando el formato de intervalos como salida estructurada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: partiendo del tamano del repositorio (21,2 GB), la carga de los pesos en bf16 requiere del orden de 22-24 GB de VRAM, a lo que hay que sumar la memoria de activaciones del tower de vision al procesar 64 fotogramas por defecto. Se recomienda una GPU con 40 GB o mas.
- GPU recomendadas: A100 (40/80 GB) o H100 (80 GB) para un margen comodo; una RTX 4090 (24 GB) queda en el limite y puede requerir reducir el numero de fotogramas (`--frame_num`) o usar precision reducida.
- Inferencia en GPU de consumo: posible pero ajustada; conviene reducir fotogramas y longitud de generacion.
- Opciones de despliegue: el modelo se sirve con `transformers` y `flash-attn`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Requisitos adicionales: Python 3.10, torch 2.3.0+cu118, torchvision 0.18.0, torchaudio 2.3.0, flash-attn 2.6.0 y ffmpeg instalado en el sistema.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La model card reconoce que el codigo se apoya en Ola, por lo que este es el modelo de referencia mas directo. No se dispone de datos de rendimiento, parametros ni contexto para este modelo ni para alternativas omni de la misma categoria, de modo que la comparacion cuantitativa no es posible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eCity-Omni | no disponible | no disponible | no disponible | Apache 2.0 | HuggingFace |
| Ola (base de codigo) | no disponible | no disponible | no disponible | no disponible | GitHub / HuggingFace |
| Otras alternativas omni | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.
- No se han publicado resultados de benchmarks, por lo que no hay evidencia cuantitativa de rendimiento frente a alternativas.
- Se desconocen el numero de parametros y la longitud de contexto, lo que dificulta planificar el despliegue.
- Idiomas limitados a ingles y chino; no se documenta soporte de castellano.
- El analisis de intervalos depende del formato exacto `From second{X} to second{Y}.`; si el modelo no respeta el formato, el script recurre a imprimir la salida original.
- Requiere ffmpeg y flash-attn, y el proceso de carga del tower de vision intenta descargar `openai/clip-vit-large-patch14` de HuggingFace, lo que falla en entornos sin salida a internet.
- Riesgo de alucinacion en la localizacion temporal no evaluado ni documentado.
- Sesgos conocidos: no documentados.
- La licencia Apache 2.0 permite uso comercial, pero no se ofrece ninguna garantia sobre el modelo ni sobre los datos de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eCityAI-Sup/eCity-Omni
- Checkpoint ChronusOmni: https://huggingface.co/eCityAI-Sup/eCity-Omni/ChronusOmni
- Articulo (arXiv): https://arxiv.org/abs/2512.09841
- Repositorio base Ola: https://github.com/Ola-Omni/Ola
- Procesador CLIP referenciado: https://huggingface.co/openai/clip-vit-large-patch14
- Paquete flash-attn 2.6.0 (cu118, py3.10): https://github.com/Dao-AILab/flash-attention/releases/download/v2.6.0/flash_attn-2.6.0+cu118torch2.3cxx11abiFALSE-cp310-cp310-linux_x86_64.whl
