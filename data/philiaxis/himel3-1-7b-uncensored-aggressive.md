# Philiaxis/Himel3-1.7B-Uncensored-Aggressive

## Resumen

Himel3-1.7B-Uncensored-Aggressive es un ajuste fino (finetune) del modelo Himel3-1.7B, desarrollado por Philiaxis, orientado a la generacion de texto conversacional en japones con un tono directo, coloquial y sin filtros de contenido. El modelo deriva originalmente de LFM3-1.7B de Liquid AI y se distribuye en formato MLX bfloat16, pensado especificamente para ejecucion en Apple Silicon. Cuenta con 1.728.801.536 parametros (aproximadamente 1,7 mil millones) y un tamano de repositorio de 3,5 GB.

La propuesta del modelo es ofrecer respuestas concisas y con caracter en japones, eliminando parte de las restricciones de alineacion del modelo base. Para ello, el autor aplica un "BOS graft" de forma cerrada que modifica ocho tensores de proyeccion K/V de atencion en cuatro capas (2, 4, 6 y 8), ademas de una plantilla de chat que inserta una persona japonesa por defecto cuando el llamador no proporciona un mensaje de sistema ni definiciones de herramientas.

El modelo es relevante para desarrolladores que trabajan en el ecosistema Apple Silicon y necesitan un modelo pequeno, ligero y con licencia LFM Open v1.0 para experimentacion con generacion de texto en japones. No obstante, su naturaleza "uncensored" y "aggressive" implica riesgos claros de contenido adulto, lenguaje fuerte y falta de garantias de seguridad, por lo que no es apto para produccion sin salvaguardas adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de LFM3-1.7B de Liquid AI); no se detalla la variante exacta |
| Parametros totales | 1.728.801.536 (aproximadamente 1,7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bfloat16 (bf16) en formato MLX; no se documentan otras cuantizaciones |
| Idiomas soportados | Japones (ja), ingles (en) |
| Licencia | LFM Open License v1.0 (licencia "other", ver seccion 5 para terminos comerciales) |
| Formato de pesos | safetensors en formato MLX (bf16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de LFM3-1.7B de Liquid AI, un transformer de aproximadamente 1,7 mil millones de parametros, a traves del intermediario Himel3-1.7B de Philiaxis. El ajuste fino se ha realizado sobre este ultimo para adaptar el estilo de respuesta a un tono japones directo y coloquial. El autor no documenta el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

La innovacion tecnica destacable es el denominado "BOS graft", un procedimiento de edicion de pesos en forma cerrada que modifica ocho tensores de proyeccion K/V de atencion distribuidos en cuatro capas (2, 4, 6 y 8). Este tipo de intervencion permite alterar el comportamiento del modelo sin un reentrenamiento completo. Ademas, la plantilla de chat incorpora una persona japonesa por defecto cuando no se especifica un mensaje de sistema o definiciones de herramientas; en ese caso, el modelo puede identificarse como "Himel3-Uncensored". El modelo se distribuye exclusivamente en formato MLX bfloat16 para Apple Silicon.

## Capacidades

- Generacion de texto conversacional en japones con tono directo, coloquial y conciso.
- Generacion de texto en ingles como idioma secundario.
- Respuestas "uncensored": puede producir contenido adulto y lenguaje fuerte sin las restricciones habituales del modelo base.
- Soporte de plantilla de chat con persona japonesa por defecto.
- Modo "thinking" configurable (se recomienda deshabilitarlo para conversacion normal).
- Compatibilidad con definiciones de herramientas y mensajes de sistema proporcionados por el llamador (la plantilla los respeta cuando existen).
- Ejecucion en Apple Silicon mediante MLX y MLX-VLM.

## Casos de uso

- Prototipado de chatbots conversacionales en japones sobre Mac con Apple Silicon: el modelo se ejecuta en formato MLX bf16 y permite iterar rapidamente en local sin GPU dedicada, gracias a su tamano de 1,7B parametros.
- Experimentacion con personajes y roleplay en japones: la plantilla de chat inserta una persona por defecto y el ajuste "aggressive" produce respuestas con caracter, adecuado para pruebas de diseno de personajes conversacionales.
- Generacion de dialogos coloquiales para guiones o contenido creativo: el tono directo y sin filtros facilita la produccion de dialogos informales en japones para prototipos narrativos.
- Investigacion sobre alineacion y edicion de pesos: el "BOS graft" sobre tensores K/V de atencion constituye un caso de estudio reproducible para estudiar como intervenciones quirurgicas en pesos alteran el comportamiento conversacional.
- Evaluacion comparativa de modelos pequenos en japones: con 1,7B parametros y licencia LFM Open v1.0, sirve como baseline ligero en experimentos de calidad linguistica frente a modelos mayores.
- Pruebas de robustez y seguridad de sistemas: al ser un modelo "uncensored", es util para generar casos adversarios y evaluar las salvaguardas de pipelines de moderacion antes de desplegar sistemas en produccion.
- Desarrollo de asistentes locales en ingles y japones: su ejecucion via MLX permite integrarlo en aplicaciones de escritorio para macOS con inferencia totalmente local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica unicamente que se realizo una exploracion del comportamiento con un conjunto reducido de prompts en japones, sin establecer metricas cuantitativas de calidad, seguridad ni consistencia.

## Requisitos de hardware

- VRAM/RAM unificada estimada: aproximadamente 3,46 GB para los pesos en bf16; se recomienda al menos 6-8 GB de memoria unificada para inferencia con margen para el contexto.
- Hardware objetivo: Apple Silicon (serie M1, M2, M3, M4 y superiores) mediante MLX; el modelo no se distribuye en formatos CUDA (GGUF, safetensors estandar) en la informacion disponible.
- GPU dedicadas (A100, H100, RTX 4090): no se documenta soporte; el repositorio es exclusivamente MLX, por lo que la ejecucion en GPU NVIDIA no esta prevista en esta release.
- Cabe en equipos consumer Apple Silicon con memoria unificada de 8 GB o superior, segun el tamano de pesos.
- Opciones de despliegue: MLX-VLM 0.7.11 con Transformers 5.22.2, invocando `python -m mlx_vlm.generate`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Himel3-1.7B-Uncensored-Aggressive | 1,7B | No disponible | ja, en | LFM Open v1.0 | MLX bf16 | Finetune "uncensored", solo Apple Silicon |
| Himel3-1.7B (modelo base) | 1,7B | No disponible | ja, en | No disponible en la informacion | No disponible | Base del finetune, sin el ajuste "aggressive" |
| LFM3-1.7B (Liquid AI) | 1,7B | No disponible | No disponible en la informacion | No disponible en la informacion | No disponible | Modelo original del que deriva la familia |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored": puede generar contenido adulto, lenguaje fuerte y respuestas inapropiadas; no es apto para menores ni para entornos sin moderacion.
- Riesgo elevado de alucinacion: el autor no ha verificado la exactitud, la seguridad ni la consistencia de las respuestas.
- La evaluacion se limita a un conjunto reducido de prompts en japones; no se establece un comportamiento fiable de seguridad.
- No esta disenado para consejo medico ni para respuesta ante crisis.
- Idiomas limitados a japones e ingles; no se documenta soporte para castellano ni otros idiomas.
- Longitud de contexto no documentada; se desconoce el limite practico para conversaciones largas.
- Licencia LFM Open v1.0: el uso comercial esta sujeto a la seccion 5 de la licencia; es necesario revisar los terminos antes de cualquier despliegue comercial.
- Distribucion exclusiva en MLX bf16: no hay pesos en formatos estandar (GGUF, safetensors para CUDA), lo que limita el despliegue fuera de Apple Silicon.
- El modelo puede identificarse como "Himel3-Uncensored" debido a la persona por defecto de la plantilla de chat, lo que puede confundir en integraciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Philiaxis/Himel3-1.7B-Uncensored-Aggressive
- Modelo base Himel3-1.7B: https://huggingface.co/Philiaxis/Himel3-1.7B
- Licencia LFM Open v1.0 (referenciada en el repositorio como LICENSE): https://huggingface.co/Philiaxis/Himel3-1.7B-Uncensored-Aggressive/blob/main/LICENSE
- NOTICE.md (cambios por archivo y atribucion): https://huggingface.co/Philiaxis/Himel3-1.7B-Uncensored-Aggressive/blob/main/NOTICE.md
