# OpenMOSS-Team/MOSS-VL-Realtime-NF4

## Resumen

MOSS-VL-Realtime-NF4 es una versión cuantizada en 4 bits del modelo vision-language MOSS-VL-Realtime, desarrollado por OpenMOSS, equipo de investigación abierta formado conjuntamente por el Shanghai Innovation Institute (SII), el laboratorio NLP de la Universidad de Fudan y MOSI Intelligence. El modelo original está diseñado para comprensión de imágenes, vídeo largo e interacción en streaming en tiempo real, y esta variante reduce el peso del checkpoint a aproximadamente 24 GiB manteniendo la interfaz de streaming con marcas temporales.

La relevancia de esta release radica en que permite ejecutar un modelo multimodal de más de 11.300 millones de parámetros en una única GPU de 24 GB de VRAM, algo que el checkpoint BF16 original no permite. Para lograrlo combina cuantización de pesos NF4 de bitsandbytes con doble cuantización en la mayoría de las capas del lenguaje, mantiene las capas multimodales y la primera y última capa del lenguaje en BF16, y cuantiza la caché KV de Transformers a INT8 mediante HQQ. El resultado es un modelo orientado a despliegues de vídeo en tiempo real en hardware de gama alta de consumo o profesional de una sola tarjeta.

La arquitectura subyacente es un transformer multimodal con codificador visual y decodificador de lenguaje, con soporte nativo de ventanas de contexto largas para vídeo (hasta 256 frames en inferencia offline) y un protocolo de sesión en streaming que emite tokens de control como `<|silence|>`, `<|round_start|>` y `<|round_end|>`. La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-language (MOSS-VL) con codificador visual y decodificador de lenguaje; pesos cuantizados NF4 en capas del lenguaje |
| Parametros totales | 11.336.371.208 (11,34 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible de forma explicita; soporta hasta 256 frames por inferencia offline de vídeo y sesiones de streaming continuas |
| Tipos de cuantizacion | NF4 4-bit con doble cuantizacion (bitsandbytes), BF16 para capas multimodales y primera/ultima capa del lenguaje, KV cache HQQ INT8 |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con codigo de modelado remoto `modeling_moss_vl.py` y configuracion de bitsandbytes/HQQ embebida) |

## Arquitectura y entrenamiento

MOSS-VL-Realtime es un modelo de la familia MOSS-VL que combina un codificador visual con un decodificador de lenguaje transformer. El pipeline declarado es `video-text-to-text`, y el modelo procesa frames compatibles con PIL con marcas temporales no decrecientes, lo que habilita la comprensión de vídeo con conciencia temporal. La variante NF4 conserva la arquitectura y el comportamiento del checkpoint base, pero sustituye la mayoría de los pesos del lenguaje por cuantización NF4 de 4 bits con doble cuantización, mantiene en BF16 los módulos multimodales y las capas primera y última del lenguaje, y aplica cuantización INT8 a la caché KV mediante HQQ. El backend de atención es FlashAttention 2.

El modelo base se distribuye junto con un informe técnico en arXiv (2608.15045) y una referencia adicional (2606.07639), aunque los detalles concretos sobre número de tokens de entrenamiento, composición del dataset y si hubo RLHF o DPO no están disponibles en la información proporcionada. La innovación destacable de esta release es el perfil de cuantización W4A16 (pesos de 4 bits, activaciones y cómputo en BF16) con caché KV INT8, que según el autor mantiene el rendimiento cercano al del modelo BF16 en los benchmarks seleccionados, aunque los valores numéricos de esa comparación no se incluyen en el texto disponible.

## Capacidades

- Comprensión de imágenes: el modelo soporta las utilidades offline de imagen y vídeo del checkpoint estándar.
- Comprensión de vídeo largo: inferencia offline con hasta 256 frames, `video_fps` configurable y extracción multihilo.
- Interacción en streaming en tiempo real: sesiones con `create_realtime_session`, envío de frames con timestamp y sondeo incremental de la salida.
- Conciencia temporal: emisión de tokens de control `<|silence|>`, `<|round_start|>` y `<|round_end|>` para gestionar turnos y silencios.
- Generación de texto y descripción de contenido visual: descripciones de cambios relevantes en el vídeo y respuesta a preguntas sobre frames recientes.
- Capacidades multilingües limitadas a inglés y chino.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Vigilancia y monitorización de vídeo en directo: el modelo puede procesar frames con timestamp y emitir descripciones solo cuando detecta cambios relevantes, gracias al token `<|silence|>` y a la sesión de streaming con `frame_queue_size=1`, lo que encaja en un despliegue de una sola GPU de 24 GB.
- Asistencia remota y accesibilidad: descripción en tiempo real de lo que ocurre en una cámara o videollamada para personas con discapacidad visual, usando la API de sesión en streaming y prompts iniciales que definen el nivel de detalle.
- Análisis de vídeo pregrabado: resumen y respuesta a preguntas sobre vídeos de hasta 256 frames mediante `offline_video_generate`, adecuado para revisiones de contenido, moderación o indexación de archivos audiovisuales.
- Robots e interfaz humano-máquina: integración en bucles de percepción donde el modelo recibe frames de una cámara y genera actualizaciones textuales de estado, aprovechando la baja latencia del perfil de 24 GB y la caché KV INT8.
- Automatización de soporte con capturas de pantalla: el modelo puede describir y razonar sobre imágenes enviadas por usuarios en inglés o chino, lo que permite construir asistentes que interpretan capturas de interfaz o documentos escaneados.
- Investigación en visión-lenguaje: al ser un checkpoint abierto con licencia Apache 2.0 y código de modelado remoto, sirve como base para experimentos de cuantización, evaluación de streaming multimodal y ajuste fino sobre tareas específicas de vídeo.
- Despliegue en estaciones de trabajo con una RTX 4090 o similar: el perfil de 24 GB permite prototipar aplicaciones de vídeo en tiempo real sin acceso a clústeres de GPU de datacenter.

## Benchmarks y rendimiento

El autor publica una comparación gráfica entre los modelos cuantizados y sus contrapartes BF16, indicando que la calidad se mantiene cercana tras la cuantización, pero no se incluyen los valores numéricos de los benchmarks en la información disponible.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 24 GiB para el perfil de inferencia en tiempo real con FlashAttention 2 y `frame_queue_size=1`.
- GPU recomendadas: una única GPU NVIDIA con 24 GB de VRAM; el autor no especifica modelos concretos, pero el perfil encaja en tarjetas de 24 GB como RTX 4090, RTX 3090, A10G, L4 (esta última con matices por memoria) o A100/H100 de 40/80 GB para mayor margen.
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB de VRAM, según la indicación explícita del autor.
- Opciones de despliegue: `transformers` 4.57.1 con `trust_remote_code=True`, `bitsandbytes` 0.49.2, `hqq` 0.2.8.post1, PyTorch 2.8.0 con CUDA 12.8, Accelerate 1.12.0 y FlashAttention 2.8.1. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles de forma numérica; el autor indica que el perfil está pensado para streaming en tiempo real y que cada instancia soporta una única sesión activa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-VL-Realtime-NF4 | 11,34 mil millones | no disponible (hasta 256 frames offline) | NF4 + KV INT8 | Apache 2.0 | Hugging Face |
| MOSS-VL-Realtime (BF16) | 11,34 mil millones | no disponible (hasta 256 frames offline) | BF16 | Apache 2.0 | Hugging Face |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Idiomas: solo se declaran inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- Sesgos: no se documentan sesgos específicos en la información disponible; al ser un modelo entrenado con datos web, es previsible que herede sesgos de esos datos.
- Alucinación: no se han publicado tasas de alucinación ni evaluaciones específicas de fidelidad visual en la información disponible.
- Contexto: la longitud de contexto textual no se especifica; el límite práctico para vídeo es de 256 frames en inferencia offline y la ventana de streaming depende de la sesión.
- Concurrencia: una instancia del modelo soporta una única sesión de tiempo real activa, lo que limita el despliegue multiusuario sin replicar el modelo.
- Tokens de control: la aplicación debe filtrar o renderizar `<|silence|>`, `<|round_start|>` y `<|round_end|>`; ignorarlos puede producir salidas incoherentes.
- Configuración frágil: no se debe añadir una segunda configuración de cuantización en tiempo de ejecución ni sobrescribir la caché KV HQQ INT8 con BF16 o dinámica en el perfil de 24 GB.
- Dependencias: requiere `trust_remote_code=True` y código de modelado remoto, lo que implica revisar el código antes de ejecutarlo en producción.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los datos de entrenamiento del modelo base, no detalladas en la información disponible.
- Fecha de creación: el repositorio figura creado el 2026-08-07, por lo que se trata de un lanzamiento reciente con posible menor madurez del ecosistema de herramientas.

## Enlaces

- Hugging Face: https://huggingface.co/OpenMOSS-Team/MOSS-VL-Realtime-NF4
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-VL-Realtime
- Informe técnico: https://arxiv.org/pdf/2608.15045
- Referencia adicional: https://arxiv.org/abs/2606.07639
- Repositorio GitHub: https://github.com/OpenMOSS/MOSS-VL
- Web de OpenMOSS: https://openmoss.ai/
- Web alternativa: https://www.open-moss.com/
- Organización en Hugging Face: https://huggingface.co/OpenMOSS-Team
