# angelgalvisc/agent-a1-alchemist-4bit

## Resumen

Agent-A1 (The Alchemist) en su versión 4-bit es un modelo agéntico de 4 mil millones de parámetros, cuantizado y empaquetado para Apple Silicon mediante MLX. Lo publica el usuario angelgalvisc (Datastrat) como compresión del modelo Agents-A1-4B del Shanghai AI Laboratory, que a su vez se basa en Qwen3.5-4B de Alibaba. El objetivo es ofrecer un modelo con capacidades de agente (tool use, razonamiento, visión) que quepa en un portátil con 8 GB de RAM y 2,4 GB de disco, sin necesidad de reentrenamiento.

La compresión reduce el peso de 8,41 GB a 2,4 GB manteniendo la arquitectura original, incluida una torre de visión que procesa imágenes y vídeo. El modelo soporta dos modos de decodificación: directo (recomendado por el autor, con el que se midieron todos los resultados) y modo thinking, que genera un bloque de razonamiento antes de responder. Está pensado para desarrolladores que necesitan un agente local, multilingüe (inglés, español, chino) y con capacidad de llamada a herramientas, sin depender de la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-4B) con torre de vision para imagen y video |
| Parametros totales | 4 mil millones (modelo base Agents-A1-4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX); version GGUF 4-bit en repo hermano |
| Idiomas soportados | ingles, espanol, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion 4-bit de Agents-A1-4B, un modelo agéntico del Shanghai AI Laboratory construido sobre Qwen3.5-4B de Alibaba. La compresion se realizo sin reentrenamiento, reduciendo el peso de 8,41 GB a 2,4 GB. La cuantizacion afecta unicamente al modulo de lenguaje; la torre de vision (297 tensores) se mantiene con los pesos originales sin comprimir. El modelo tiene dos modos de decodificacion: directo (thinking off) y razonamiento (thinking on), con presupuestos de generacion de 4096 y 8192 tokens respectivamente. No se han publicado detalles sobre el dataset de entrenamiento original ni sobre el proceso de alineacion (RLHF/DPO) del modelo base.

## Capacidades

- Generacion de texto conversacional y de una sola respuesta.
- Tool calling / function calling para integracion con APIs y agentes.
- Razonamiento multi-paso con modo thinking opcional.
- Vision: procesamiento de imagenes y video (sin audio).
- Multilingue: ingles, espanol y chino.
- Decodificacion greedy por defecto, con detencion automatica.
- Compatible con mlx-lm (texto y herramientas) y mlx-vlm (vision).

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno en ingles, espanol o chino, con llamada a herramientas para consultar bases de datos o sistemas de tickets, todo en local.
- Analisis de documentos escaneados: gracias a la torre de vision, puede leer documentos legales o formularios y extraer informacion relevante, como se verifico con un documento legal escaneado.
- Descripcion y analisis de video: puede procesar clips de video (por ejemplo, de 37 segundos) y responder preguntas sobre su contenido, util para moderacion o indexacion automatica.
- Generacion de codigo asistida: con tool calling, puede integrarse en pipelines de CI/CD para generar o revisar fragmentos de codigo, aunque no se han publicado benchmarks especificos de codigo.
- Asistente personal en portatil: al caber en 8 GB de RAM, puede ejecutarse en un MacBook Air para tareas de productividad, resumen de textos y calculos aritmeticos.
- Prototipado de agentes locales: desarrolladores pueden probar flujos agénticos con razonamiento y vision sin coste de API, usando el modo thinking para tareas que requieren planificacion.

## Benchmarks y rendimiento

No se han publicado resultados detallados de benchmarks en la informacion disponible. El autor menciona que el modelo obtuvo 48 de 60 tareas en un benchmark agéntico con thinking desactivado, y que se realizaron pruebas de recuperacion y un conjunto de validacion, pero no se ofrecen tablas comparativas ni numeros por tarea. Tampoco hay datos de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: 2,4 GB de disco para los pesos; RAM minima 8 GB, recomendada 16 GB (Apple Silicon).
- GPU recomendadas: Apple Silicon (cualquier Mac con 8 GB o mas); en Linux con Nvidia, se requiere driver 580 o superior y el backend CUDA de MLX (aun en desarrollo para matmuls cuantizados).
- En consumer GPU: si, via GGUF (repo hermano) para tarjetas Nvidia, CPU o telefonos.
- Opciones de despliegue: mlx-lm y mlx-vlm en macOS/Linux; llama.cpp para GGUF.
- Latencia y throughput: no disponibles; el autor midio en Apple Silicon, pero no publico cifras.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo con otros modelos. Como referencia estructural, se puede comparar con su modelo base:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Agents-A1-4B (base) | 4B | no disponible | Apache 2.0 | HuggingFace |
| Agent-A1 Alchemist 4-bit | 4B (cuantizado) | no disponible | Apache 2.0 | HuggingFace (MLX y GGUF) |
| Qwen3-4B (base original) | 4B | no disponible | Apache 2.0 | HuggingFace |

No hay datos publicados que permitan una comparativa de rendimiento con alternativas como Llama-3.2-3B o Mistral-7B.

## Limitaciones y advertencias

- No soporta audio: la arquitectura no incluye torre de audio ni token reservado; se necesita un transcriber externo (por ejemplo, mlx-whisper).
- La vision no fue medida en benchmarks: el autor verifico su funcionamiento, pero no hay metricas de calidad para tareas de imagen o video.
- La cuantizacion 4-bit puede degradar la precision en tareas complejas frente al modelo original sin cuantizar.
- El modo thinking no fue evaluado en las metricas reportadas; los resultados (48/60) corresponden solo a thinking off.
- Longitud de contexto no especificada: se desconoce el limite real de tokens de entrada.
- Solo tres idiomas: ingles, espanol y chino; no cubre otros idiomas.
- El backend CUDA de MLX para matmuls cuantizados esta en desarrollo, por lo que en GPUs Nvidia los resultados pueden diferir de los medidos en Apple Silicon.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base (Agents-A1-4B) y Qwen3.5-4B tienen sus propias condiciones; se recomienda revisar los avisos legales de cada componente.

## Enlaces

- Repositorio HuggingFace (MLX 4-bit): https://huggingface.co/angelgalvisc/agent-a1-alchemist-4bit
- Repositorio GGUF (llama.cpp): https://huggingface.co/angelgalvisc/agent-a1-alchemist-gguf
- Modelo base: https://huggingface.co/InternScience/Agents-A1-4B
