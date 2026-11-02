# another-nate/daub-vggt

## Resumen

Daub VGGT es un reempaquetado de los pesos de VGGT-1B-Commercial de Meta Platforms, Inc., el modelo Visual Geometry Grounded Transformer presentado en CVPR 2025 por Wang et al. No es un modelo de lenguaje: es un transformer de visión diseñado para estimar geometría 3D a partir de una o varias imágenes, infiriendo en una sola pasada parámetros de cámara, mapas de profundidad y nubes de puntos densas. El autor del reempaquetado es el usuario de HuggingFace `another-nate`, que lo prepara para su integración en la aplicación de escritorio Daub.

Los cambios respecto al original son mínimos y puramente de empaquetado: los pesos del agregador se almacenan en bfloat16 y se han eliminado las cabezas de puntos (point head) y de seguimiento (track head). Las cabezas de cámara y profundidad permanecen intactas. No se ha reentrenado ningún componente, por lo que las capacidades geométricas son las del modelo original de Meta.

Su relevancia es acotada pero específica: ofrece un artefacto único de 2,81 GB en safetensors que simplifica el despliegue de reconstrucción 3D feed-forward en aplicaciones de escritorio, eliminando cabezas no necesarias para ese caso de uso y reduciendo el peso respecto al checkpoint completo. La licencia VGGT permite uso comercial con una política de uso aceptable que prohíbe aplicaciones militares y de armamento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de visión (VGGT, Visual Geometry Grounded Transformer) |
| Parámetros totales | 1B (aproximado, según nomenclatura del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa un conjunto de imágenes por inferencia, no texto) |
| Tipos de cuantización | bfloat16 (único formato publicado en este repo) |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | VGGT License (permite uso comercial, con política de uso aceptable) |
| Formato de pesos | safetensors (`daub-vggt-1b-commercial.safetensors`, 2,81 GB) |

## Arquitectura y entrenamiento

VGGT es un transformer que procesa un conjunto de vistas de entrada de forma conjunta y predice directamente, en una sola pasada feed-forward, los parámetros de cámara, los mapas de profundidad y las nubes de puntos, sin necesidad de optimización geométrica iterativa posterior (a diferencia de pipelines tipo COLMAP o de optimización de bundle adjustment). La arquitectura se basa en un agregador (aggregator) que intercambia información entre las distintas vistas mediante atención, y en cabezas específicas por tarea para cámara, profundidad, puntos y seguimiento.

Este repositorio concreto no aporta información sobre el entrenamiento: no se detalla el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO (poco aplicables a un modelo geométrico). El autor indica explícitamente que "nothing was retrained", es decir, los pesos son los de Meta y solo se han modificado el formato de almacenamiento (bfloat16 en el agregador) y la eliminación de las cabezas de puntos y seguimiento. Para detalles de entrenamiento hay que remitirse al paper de VGGT (Wang et al., CVPR 2025) y al repositorio oficial de Meta.

## Capacidades

- Estimación de pose de cámara (parámetros extrínsecos e intrínsecos) a partir de una o varias imágenes.
- Estimación de profundidad densa por vista.
- Reconstrucción 3D feed-forward en una sola pasada, sin optimización iterativa.
- Procesamiento multi-vista conjunto gracias al agregador con atención entre vistas.
- No incluye cabeza de nube de puntos ni de seguimiento en esta build (eliminadas respecto al original).
- No es un modelo de lenguaje: no soporta generación de texto, tool calling, agentes ni razonamiento multi-step.
- Capacidades multilingües: no aplicable.
- Modo thinking, visión general, audio: no disponible o no aplicable.

## Casos de uso

- Reconstrucción 3D en aplicaciones de escritorio: la app Daub puede integrar este checkpoint para generar geometría y poses de cámara a partir de fotos del usuario sin depender de servicios en la nube, gracias al empaquetado en un único safetensors de 2,81 GB.
- Fotogrametría ligera y prototipado: estimar poses y profundidad de un conjunto de fotos de un objeto o escena para inicializar pipelines de reconstrucción densa o de NeRF/Gaussian Splatting, usando VGGT como paso de inicialización rápida.
- Previsualización de escenas en herramientas de creación 3D: ofrecer al usuario una estimación inmediata de la disposición espacial de las cámaras antes de un procesado más costoso.
- Análisis de imágenes de producto o inmobiliarias: obtener profundidad y pose aproximadas para generar vistas sintéticas o efectos de paralaje en visores.
- Investigación en visión por computador: servir como baseline reproducible de VGGT sin las cabezas de puntos y seguimiento, útil cuando solo se necesitan cámara y profundidad.
- Integración en pipelines de aumento de datos 3D: derivar poses y mapas de profundidad de imágenes existentes para condicionar modelos generativos o de novela view synthesis.
- Educación y demos: el tamaño reducido (2,81 GB) y el formato bfloat16 facilitan desplegar demostraciones de reconstrucción 3D en estaciones de trabajo con una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas propias ni comparaciones; para cifras de VGGT hay que consultar el paper original (Wang et al., CVPR 2025) y el repositorio de Meta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; los pesos ocupan 2,81 GB en bfloat16, por lo que se necesita al menos esa cantidad más memoria para activaciones, que depende del número de vistas y resolución.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño del checkpoint, es plausible su ejecución en GPUs consumer con suficiente VRAM, pero no se confirma en la model card.
- ¿Cabe en GPU consumer?: no confirmado; el peso de los pesos (2,81 GB) sugiere que sí en tarjetas con 8 GB o más, pero las activaciones multi-vista pueden elevarlo.
- Opciones de despliegue: no disponible. Al ser un modelo de visión con arquitectura específica, no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a LLM).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|
| Daub VGGT (este repo) | ~1B | multi-imagen, sin límite documentado | VGGT License (uso comercial con AUP) | HuggingFace, safetensors 2,81 GB |
| facebook/VGGT-1B-Commercial | ~1B | multi-imagen | VGGT License | HuggingFace (original de Meta) |
| facebook/VGGT-1B | ~1B | multi-imagen | no disponible en esta ficha | HuggingFace |
| COLMAP (pipeline clásico) | no aplica | multi-imagen | BSD | open source, no es un modelo neuronal |

No se dispone de datos de rendimiento comparativo en la información proporcionada. La comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Las posiciones de cámara y la profundidad estimadas pueden ser incorrectas, especialmente con pocas fotos, imágenes borrosas o escenas sin textura (indicado por el autor).
- Los resultados no son aptos para medición, topografía ni ningún uso crítico para la seguridad.
- Esta build elimina las cabezas de puntos y seguimiento; no puede generar nubes de puntos ni tracks directamente.
- No es un modelo de lenguaje: no debe esperarse generación de texto, razonamiento simbólico ni capacidades de agente.
- Sesgos conocidos: no disponible en la información proporcionada; al ser un modelo geométrico, los sesgos relevantes serían de dominio (tipos de escena, iluminación, sensores) y no se documentan aquí.
- Riesgo de alucinación geométrica: la inferencia feed-forward puede producir geometría plausible pero incorrecta en escenas ambiguas; conviene validar con métricas de reproyección.
- Licencia: VGGT License permite uso comercial, pero incluye una política de uso aceptable que prohíbe usos militares, de guerra y de armamento; es responsabilidad del usuario cumplirla.
- El repositorio no está afiliado ni respaldado por Meta; para soporte y actualizaciones, la referencia es el repositorio oficial.
- Sin datos de benchmarks, latencia ni requisitos de hardware verificados en este repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/another-nate/daub-vggt
- Modelo base: https://huggingface.co/facebook/VGGT-1B-Commercial
- Licencia (LICENSE.txt del repo): https://huggingface.co/another-nate/daub-vggt/blob/main/LICENSE.txt
- Código original de Meta: https://github.com/facebookresearch/vggt
- Paper: Wang et al., "VGGT: Visual Geometry Grounded Transformer", CVPR 2025 (referenciado en la model card; enlace directo no disponible en la información proporcionada)
