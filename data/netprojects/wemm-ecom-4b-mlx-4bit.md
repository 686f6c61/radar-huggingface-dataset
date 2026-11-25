# netprojects/WeMM-Ecom-4B-MLX-4bit

## Resumen

WeMM-Ecom-4B-MLX-4bit es una conversión a formato MLX del modelo multimodal WeMM-Ecom-4B de Tencent (WeChat Vision), una familia de modelos vision-language orientados al ámbito del comercio electrónico y afinados a partir de Qwen3.5. Esta variante concreta, publicada por NetProjects (Internet Projects Ltd), cuantiza los pesos a 4 bits en formato afín con tamaño de grupo 64 e incluye el codificador visual, lo que reduce el repositorio a 3,0 GB y permite ejecutarlo en Apple Silicon con la librería `mlx-vlm`.

El modelo resuelve tareas de comprensión y generación sobre imágenes de producto, múltiples imágenes simultáneas y vídeo combinados con texto, en chino e inglés. Incorpora razonamiento híbrido: el modo "thinking" está activado por defecto y puede desactivarse por petición mediante el parámetro `enable_thinking`, lo que permite alternar entre respuestas directas (modo instruct) y respuestas razonadas.

Su relevancia actual radica en que traslada un modelo especializado de e-commerce al ecosistema local de Apple Silicon, con una pérdida de fidelidad medida frente a los pesos bf16 originales del 93,6 % de coincidencia en el siguiente token y un KL medio de 0,0572. Para usuarios con Macs de memoria limitada, es la opción más ligera de la familia, aunque el propio autor recomienda la variante de 8 bits por su mayor fidelidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) derivada de Qwen3.5, con codificador visual incluido |
| Parámetros totales | 4.539.265.536 (4,54 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits afín (affine), group size 64; existe build de 8 bits del mismo autor |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (librería `mlx`), codificador visual incluido; tamaño del repo 3,1 GB (3,0 GB de pesos) |

## Arquitectura y entrenamiento

El modelo base es WeMM-Ecom-4B de Tencent, un vision-language model afinado a partir de Qwen3.5 que procesa imágenes de producto, varias imágenes en una misma petición y vídeo junto con texto. La conversión a MLX se realizó con `mlx-vlm` sobre la revisión `6b89c78` del repositorio original, verificando que todos los ficheros de origen coinciden en tamaño y hash SHA-256 con los del Hub. El tokenizador, la plantilla de chat y los ficheros de procesador son los de Tencent, sin modificar.

La cuantización aplicada es de 4 bits en modo afín con tamaño de grupo 64. El autor midió la fidelidad frente a los pesos bf16 originales cargados directamente en `mlx-vlm` como referencia: 10 prompts cortos en inglés y chino (thinking activado en 4 y desactivado en 6) y 362 posiciones forzadas por profesor. El resultado es un 93,6 % de coincidencia en el siguiente token y un KL medio de 0,0572, frente al 98,9 % y 0,0008 del build de 8 bits. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Comprensión de imágenes de producto: identificación de categoría, color, precio y atributos visibles a partir de una fotografía.
- Razonamiento sobre múltiples imágenes: comparación de dos o más imágenes en una misma petición (por ejemplo, variantes de color de una misma prenda o listados duplicados).
- Comprensión de vídeo combinado con texto.
- Generación de texto en chino e inglés: títulos de producto, descripciones, puntos de venta y respuestas conversacionales.
- Modo de razonamiento híbrido: thinking activado por defecto (razona antes de responder) y desactivable por petición con `enable_thinking` para respuestas directas.
- Conversación multi-turno mediante plantilla de chat compatible con `mlx-vlm`.
- Servicio con API compatible con OpenAI a través de `mlx_vlm.server`.
- No se documenta soporte explícito de tool calling ni de flujos de agentes multi-paso en la información disponible.

## Casos de uso

- Generación de fichas de producto: a partir de una fotografía, el modelo produce un título corto y tres puntos de venta en chino o inglés, tal como se muestra en el ejemplo oficial de la model card.
- Comparación de listados duplicados: con dos imágenes en una misma petición y thinking activado, evalúa si dos anuncios corresponden al mismo producto y explica las diferencias, útil para moderación de marketplaces.
- Enriquecimiento de catálogo: extracción de atributos visibles (color, precio, tipo de artículo) de imágenes de producto para completar metadatos estructurados.
- Atención al cliente sobre catálogo: respuestas conversacionales multi-turno en chino e inglés sobre productos, con capacidad de razonar antes de contestar cuando la consulta lo requiera.
- Análisis de contenido de vídeo comercial: descripción y extracción de información de vídeos de producto combinados con texto.
- Prototipado local en Mac: desarrollo y validación de pipelines de visión para e-commerce en Apple Silicon sin depender de servicios en la nube, gracias a los 3,0 GB de pesos y un pico de memoria de 3,9 GB en la prueba con imagen.
- Evaluación comparativa de builds: uso del par 4 bits / 8 bits del mismo autor para medir el impacto de la cuantización en una tarea concreta antes de decidir el despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a las tablas de benchmarks del repositorio original de Tencent (comparativas de e-commerce y generales, en modo instruct y thinking), pero no reproduce las cifras. Los únicos datos cuantitativos propios de esta conversión son las métricas de fidelidad frente a los pesos bf16:

| Build | Tamaño | Mismo siguiente token que el original bf16 | KL medio vs original | Memoria pico (prueba con imagen) |
|---|---|---|---|---|
| MLX 8 bits (recomendado) | 5,1 GB | 98,9 % | 0,0008 | 5,8 GB |
| MLX 4 bits | 3,0 GB | 93,6 % | 0,0572 | 3,9 GB |

Las mediciones se realizaron en un MacBook Pro M5 Max de 128 GB, el 25 de noviembre de 2026, con mlx 0.32.4 y mlx-vlm 0.7.11.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 3,9 GB de pico en la prueba con imagen para el build de 4 bits; 5,8 GB para el de 8 bits.
- Hardware objetivo: Apple Silicon con MLX; la validación se hizo en un MacBook Pro M5 Max con 128 GB de memoria unificada.
- Compatibilidad con GPU consumer: no aplica a GPUs NVIDIA o AMD, ya que el formato es MLX y requiere Apple Silicon.
- Despliegue: `mlx-vlm` (versión mínima 0.7.11) mediante CLI `mlx_vlm.generate` o API Python `load`/`generate`; servidor con API compatible con OpenAI mediante `mlx_vlm.server`.
- Latencia y throughput: no disponibles en la información proporcionada.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta conversión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeMM-Ecom-4B-MLX-4bit (este) | 4,54 B | no disponible | 4 bits afín, group size 64 | Apache-2.0 | MLX, Apple Silicon |
| WeMM-Ecom-4B-MLX-8bit | 4,54 B | no disponible | 8 bits | Apache-2.0 | MLX, Apple Silicon |
| tencent/WeMM-Ecom-4B (original) | 4,54 B | no disponible | bf16 | Apache-2.0 | Pesos originales, sin cuantizar |

La comparación relevante es interna a la familia: el build de 8 bits del mismo autor ofrece mayor fidelidad (98,9 % de coincidencia en el siguiente token frente al 93,6 % del 4 bits) a cambio de 2,1 GB adicionales de pesos y 1,9 GB más de memoria pico. No se dispone de datos sobre modelos alternativos de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de fidelidad por cuantización: solo el 93,6 % de coincidencia en el siguiente token frente a los pesos bf16 originales y un KL medio de 0,0572, notablemente peor que el build de 8 bits; el propio autor recomienda el de 8 bits y reserva el de 4 bits para Macs con menos memoria.
- Cobertura lingüística limitada a chino e inglés; no se documenta soporte de castellano ni de otros idiomas.
- Especialización en e-commerce: el modelo está afinado para ese dominio, por lo que su comportamiento fuera de él puede degradarse.
- Riesgo de alucinación en la lectura de atributos de producto (precios, características) no verificado más allá de las pruebas cualitativas descritas por el autor.
- Sesgos conocidos: no documentados en la información proporcionada.
- Longitud de contexto: no disponible, lo que impide planificar despliegues con documentos o conversaciones largas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero debe conservarse el fichero `LICENSE` de Tencent, incluida su sección de terceros relativa a Qwen3.5 (Alibaba Cloud, Apache-2.0), y el `NOTICE` que acredita a Tencent y al equipo de Qwen.
- Falta de soporte documentado de tool calling y de flujos de agentes, lo que limita su integración en pipelines automatizados complejos.
- Dependencia exclusiva del ecosistema MLX y de Apple Silicon; no es desplegable en infraestructura con GPUs NVIDIA sin reconversión.
- Proyecto no afiliado a Tencent ni a Alibaba; el mantenimiento depende de NetProjects.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/WeMM-Ecom-4B-MLX-4bit
- Modelo base original: https://huggingface.co/tencent/WeMM-Ecom-4B
- Build de 8 bits del mismo autor: https://huggingface.co/netprojects/WeMM-Ecom-4B-MLX-8bit
- Otros builds MLX de NetProjects: https://huggingface.co/netprojects
- Sitio del autor de la conversión: https://netprojects.com
- Librería mlx-vlm: no disponible enlace directo en la información proporcionada
