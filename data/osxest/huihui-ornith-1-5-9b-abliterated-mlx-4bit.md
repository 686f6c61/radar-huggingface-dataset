# osxest/Huihui-Ornith-1.5-9B-abliterated-mlx-4Bit

## Resumen

El modelo `osxest/Huihui-Ornith-1.5-9B-abliterated-mlx-4Bit` es una conversión a formato MLX (Apple Silicon) del modelo `huihui-ai/Huihui-Ornith-1.5-9B-abliterated`, que a su vez es una versión "abliterated" (desprovista de mecanismos de rechazo) del modelo Ornith-1.5-9B desarrollado por Ornith AI. Ornith-1.5 es una familia de modelos que implementa un enfoque de auto-mejora: el propio modelo propone tareas, genera andamiajes específicos y produce soluciones, extendiendo el marco de auto-andamiaje introducido en Ornith-1.0.

La familia Ornith-1.5 incluye tres tamaños: 397B (MoE), 35B (MoE) y 9B (denso). Este modelo concreto es el de 9B, un modelo denso de lenguaje y visión que, según la guía de despliegue local, cabe en una GPU de 8 GB o en un MacBook de 16 GB, lo que lo convierte en la opción más accesible de la familia. La conversión a MLX con cuantización de 4 bits lo hace especialmente adecuado para ejecutarse en hardware Apple con Metal.

La relevancia de este modelo radica en su doble naturaleza: por un lado, hereda las capacidades de razonamiento y visión de Ornith-1.5-9B; por otro, la versión "abliterated" elimina los rechazos del modelo ante ciertos contenidos, lo que lo hace interesante para investigación en seguridad de IA y para casos de uso donde se necesita una generación sin restricciones. La licencia MIT permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3) con capacidades de vision y lenguaje |
| Parametros totales | 1.399.927.296 (según safetensors del repo; el nombre del modelo indica 9B, posiblemente refiriéndose al modelo original sin cuantizar) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | MLX (convertido con mlx-lm 0.31.2) |

## Arquitectura y entrenamiento

Ornith-1.5-9B es un modelo denso de lenguaje y visión (vision-language model) que forma parte de la familia Ornith-1.5. Según la información de Ornith AI, la familia se construye mediante un proceso de auto-mejora de extremo a extremo: el modelo propone nuevas tareas, genera andamiajes específicos para cada tarea y produce soluciones (rollouts). Este enfoque extiende el marco de auto-andamiaje de Ornith-1.0 hacia un bucle de auto-mejora más completo.

El modelo base es Ornith-1.5-9B, que a su vez se basa en la arquitectura Qwen3. La versión "abliterated" de huihui-ai elimina los mecanismos de rechazo del modelo, de modo que no se niega a responder ante ciertos tipos de contenido. La conversión a MLX se realizó con la librería mlx-lm versión 0.31.2, que optimiza el modelo para ejecución en Apple Silicon mediante Metal.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados ni si se utilizaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: capacidades heredadas de la familia Qwen3, con razonamiento multi-paso.
- Comprensión de imágenes: al ser un modelo de visión y lenguaje, puede procesar entradas visuales junto con texto.
- Generación sin restricciones: la versión "abliterated" no aplica los mecanismos de rechazo habituales, por lo que responde a una gama más amplia de solicitudes.
- Auto-mejora: el modelo base Ornith-1.5 está diseñado para proponer tareas y generar sus propios andamiajes, una capacidad inusual en modelos de este tamaño.
- Ejecución en Apple Silicon: el formato MLX permite inferencia eficiente en Macs con Metal.
- Multilingüe: no se dispone de información específica sobre los idiomas soportados.

## Casos de uso

- Investigación en seguridad de IA: el estudio de modelos "abliterated" permite analizar cómo se comportan los modelos sin mecanismos de rechazo, lo que es útil para entender los límites de la alineación y desarrollar mejores técnicas de seguridad.
- Generación creativa sin restricciones: escritura de ficción, guiones o contenido creativo donde el modelo no se autocensure, útil para autores que exploran temas sensibles.
- Asistente de desarrollo en Mac: al ser un modelo de 9B cuantizado a 4-bit en MLX, puede ejecutarse localmente en un MacBook de 16 GB para asistencia de código, generación de documentación o explicaciones técnicas sin conexión a internet.
- Análisis de imágenes con privacidad: al ejecutarse localmente, permite procesar imágenes sin enviarlas a servicios en la nube, adecuado para entornos con requisitos de confidencialidad.
- Prototipado rápido de agentes conversacionales: la licencia MIT y el tamaño reducido permiten integrarlo en prototipos y productos sin costes de licencia ni dependencia de APIs externas.
- Educación y experimentación: estudiantes e investigadores pueden desplegar el modelo localmente para experimentar con técnicas de prompting, fine-tuning o evaluación de modelos de visión y lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La web de Ornith AI menciona que los benchmarks auto-reportados de Ornith-1.5 rivalizan con Claude Opus 4.8, pero una evaluación independiente publicada en Hacker News del modelo de 35B muestra resultados diferentes. No hay datos específicos para el modelo de 9B ni para la versión abliterated.

## Requisitos de hardware

- VRAM estimada: según la guía de despliegue local, el modelo Ornith-1.5-9B cabe en una GPU de 8 GB o en un MacBook de 16 GB. La versión MLX 4-bit es aún más ligera.
- GPU recomendadas: cualquier Mac con chip M1/M2/M3/M4 con al menos 16 GB de memoria unificada; en PC, GPUs con 8 GB de VRAM o más (RTX 3060, RTX 4060, etc.).
- Compatibilidad con consumer GPU: sí, es uno de los modelos más accesibles de la familia Ornith.
- Opciones de despliegue: mlx-lm (para Apple Silicon), y potencialmente llama.cpp u otros runners si se convierte a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B (original) | 9B | No disponible | MIT | Original | Modelo base sin abliterar |
| Huihui-Ornith-1.5-9B-abliterated | 9B | No disponible | MIT | safetensors | Versión sin rechazos |
| osxest/Huihui-Ornith-1.5-9B-abliterated-mlx-4Bit | 1.4B (cuantizado) | No disponible | MIT | MLX 4-bit | Este modelo, optimizado para Apple Silicon |
| Qwen3 (base) | Variable | Variable | Apache 2.0 | Variable | Arquitectura subyacente de Ornith |

La comparativa con otros modelos de 9B de propósito general (como Llama 3.2 8B o Mistral 7B) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La versión "abliterated" elimina los mecanismos de rechazo, lo que significa que el modelo puede generar contenido inapropiado, ofensivo o peligroso sin filtros. No es adecuado para despliegues en producción orientados al usuario final sin capas adicionales de moderación.
- Los benchmarks auto-reportados por Ornith AI no han sido verificados de forma independiente; una evaluación en Hacker News del modelo de 35B mostró resultados notablemente inferiores.
- No se dispone de información sobre la longitud de contexto, lo que dificulta planificar casos de uso que requieran ventanas largas.
- El modelo está cuantizado a 4-bit, lo que puede implicar una pérdida de calidad respecto al modelo original en tareas complejas.
- No se dispone de información sobre sesgos del modelo ni sobre su comportamiento en idiomas distintos del inglés.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una conversión reciente y poco probada por la comunidad.

## Enlaces

- [Modelo en HuggingFace (este repo)](https://huggingface.co/osxest/Huihui-Ornith-1.5-9B-abliterated-mlx-4Bit)
- [Modelo base abliterated de huihui-ai](https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-9B-abliterated)
- [Colección Ornith-1.0-abliterated de huihui-ai](https://huggingface.co/collections/huihui-ai/ornith-10-abliterated)
- [Guía de despliegue local de Ornith 1.5 9B](https://atomic.chat/blog/guides/how-to-run-ornith-1-5-locally)
- [Web oficial de Ornith AI](https://ornith.ai/)
- [Análisis independiente de Ornith-1.5](https://www.explainx.ai/blog/ornith-1-5-self-improving-open-weight-model-august-2026)
