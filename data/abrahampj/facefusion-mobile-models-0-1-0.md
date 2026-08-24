# AbrahamPJ/facefusion-mobile-models-0.1.0

## Resumen

FaceFusion Mobile Models es un repositorio que publica los context binaries de Qualcomm QAIRT para el pipeline de intercambio de caras de FaceFusion, compilados para ejecutarse de forma completamente offline en la unidad de procesamiento neuronal Hexagon (NPU) de los SoC Snapdragon. El proyecto lo mantiene AbrahamPJ como parte del port facefusion-mobile, y su objetivo es trasladar la ruta de intercambio de caras por defecto de FaceFusion (imagen fuente + vídeo objetivo) a dispositivos móviles con hardware Qualcomm, eliminando la necesidad de conectividad a la nube.

El repositorio contiene cinco modelos convertidos: detector de caras (yoloface), localizador de landmarks faciales (fan2d), reconocedor facial (arcface), el propio intercambiador (hyperswap) y un clasificador de contenido NSFW. Cada modelo se distribuye en tres variantes según la arquitectura Hexagon del chip (v68, v73, v79), y el conjunto completo pesa entre 271 y 279 MB por nivel. La relevancia actual radica en que es uno de los primeros ports que ejecutan el flujo completo de FaceFusion en NPU móvil con cuantización W8A16, aunque solo la variante v79 (para Snapdragon 8 Elite) ha sido validada experimentalmente.

La licencia no es uniforme: los pesos derivan de modelos con términos dispares (GPL-3.0, no comercial, ResearchRAIL) y el proyecto upstream de FaceFusion se distribuye bajo OpenRAIL-AS, que impone restricciones de uso. Esto limita su redistribución comercial y obliga a leer la licencia antes de usarlo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelos convertidos a context binaries de Hexagon NPU (QAIRT) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es modelo de texto) |
| Tipos de cuantizacion | W8A16 por canal (per-channel), fp32 para el clasificador NSFW en v79 |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Derivada de modelos con licencias dispares: GPL-3.0 (yoloface), Non-Commercial (arcface, inswapper), ResearchRAIL (hyperswap), y OpenRAIL-AS upstream |
| Formato de pesos | Context binaries de Hexagon (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

Los archivos no son modelos entrenados desde cero, sino conversiones de pesos preexistentes del ecosistema FaceFusion. El proceso de conversión se realizó con Qualcomm QAIRT 2.49.0, que compila grafos de redes neuronales en binarios de contexto específicos de la arquitectura Hexagon. La cuantización es W8A16 por canal, y el modelo hyperswap se degradó a fp32 antes de cuantizar para preservar la precisión.

El conjunto de modelos cubre el flujo completo de intercambio de caras: detección (yoloface), landmarks faciales (fan2d), extracción de embeddings (arcface), el swapper en sí (hyperswap a 256x256) y un filtro de contenido NSFW. No se publica información sobre el dataset de entrenamiento ni sobre técnicas de alineamiento o ajuste; se trata de pesos originales de FaceFusion convertidos a otro formato. El clasificador NSFW se ejecuta en fp32 en la variante v79 y cuantizado en las demás, lo que produce un desplazamiento estadístico de +0.087 hacia un mayor rechazo de contenido.

## Capacidades

- Ejecución offline completa del pipeline de intercambio de caras sobre NPU Qualcomm.
- Detección de caras en imágenes de 640x640 píxeles (yoloface).
- Detección de puntos faciales 2D (face2d) para alinear caras.
- Extracción de embeddings de 512 dimensiones (arcface) para reconocimiento facial.
- Intercambio de caras a resolución base 256x256, con posibilidad de escalado a 512 o 1024 mediante pixel boost (subimágenes N²).
- Clasificador de contenido NSFW integrado como bloqueo obligatorio en la aplicación que consume los binarios.
- Sin soporte de tool calling, agentes o generación de texto; el modelo es exclusivamente para procesamiento visual.

## Casos de uso

- Aplicaciones móviles de intercambio de caras privado: el usuario selecciona una foto de origen y un vídeo destino, y el intercambio se ejecuta íntegramente en el dispositivo, sin subir datos a la nube, gracias a los context binaries de la NPU.
- Edición de vídeo en el móvil: integración en apps de retoque que requieren reemplazar rostros en clips de forma rápida y sin conexión, aprovechando la baja latencia de la NPU.
- Filtros de contenido automático: el clasificador NSFW integrado permite bloquear material no deseado en la entrada o salida del proceso, lo que facilita el cumplimiento de políticas en aplicaciones de moderación.
- Demostración de capacidades de IA en hardware Snapdragon: el repo sirve como referencia para desarrolladores que quieran ejecutar modelos de visión complejos en Hexagon NPU, con un ejemplo completo de conversión y despliegue.
- Investigación en eficiencia de inferencia en NPU: comparación de latencia y precisión entre cuantizaciones W8A16 y la ejecución en GPU móvil, útil para proyectos de optimización.
- Desarrollo de aplicaciones de realidad aumentada: el intercambio de caras en tiempo real sobre vídeo puede integrarse en filtros AR, aunque la resolución actual (256x256 base) limita la calidad para uso profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que se realizaron mediciones de precisión, latencia y corrección en un SM8750 (Galaxy S25 Ultra), pero no proporciona cifras concretas. Tampoco hay comparaciones con otros modelos.

## Requisitos de hardware

- Dispositivos con SoC Qualcomm Snapdragon que incluyan Hexagon NPU.
- Los binarios se dividen en tres niveles según la capacidad de la NPU:
  - `v68`: Snapdragon 888 y anteriores, 8 Gen 1, o cualquier parte con menos de 8 MB de VTCM.
  - `v73`: Snapdragon 8 Gen 2, 8 Gen 3 y partes v81.
  - `v79`: Snapdragon 8 Elite (SM8750).
- No se requiere GPU dedicada; la inferencia se ejecuta exclusivamente en la NPU.
- La descarga por nivel es de aproximadamente 275 MB (271.6 MB para v68, 272.3 MB para v73, 279.2 MB para v79).
- No es compatible con GPUs de escritorio (NVIDIA, AMD) ni con CPUs x86; los binarios no se cargan en otra arquitectura.
- Opciones de despliegue: integración directa en una app Android que consuma los context binaries; no se soporta vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

No disponible. Este repositorio no contiene un modelo único comparable a otros modelos de propósito general; son binarios de inferencia específicos de un pipeline (detección, landmarks, embeddings, swapper) y no se pueden comparar directamente con modelos de texto o visión generalistas. La alternativa más cercana sería el propio FaceFusion con modelos ONNX (ej. inswapper_128) que se ejecutan en GPU, pero no se dispone de datos comparativos de rendimiento.

## Limitaciones y advertencias

- Solo la variante `v79` ha sido ejecutada y validada en hardware real (SM8750, Galaxy S25 Ultra). Las variantes `v68` y `v73` están compiladas pero no probadas, por lo que no se garantiza su funcionamiento.
- Los binarios no son portables: cada archivo está compilado para una arquitectura Hexagon concreta y no cargará en ningún otro dispositivo.
- Riesgo de mal uso: el intercambio de caras puede generar deepfakes de personas reales sin consentimiento. El autor incluye un clasificador de contenido NSFW como bloqueo obligatorio, pero no elimina el riesgo.
- Licencias restrictivas: los modelos individuales tienen términos no comerciales (arcface, insan, hyperswap) y GPL-3.0 (yoloface). El upstream FaceFusion está bajo OpenRAIL-AS, que impone restricciones de uso. No se puede redistribuir comercialmente sin evaluar cada licencia.
- No se dispone de información sobre sesgos algorítmicos, alucinación o limitaciones de idioma, ya que no es un modelo de lenguaje.
- La cuantización del clasificador NSFW en niveles inferiores a v79 desplaza su umbral de decisión, lo que puede producir un rechazo ligeramente más estricto del contenido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AbrahamPJ/facefusion-mobile-models-0.1.0
- Repositorio GitHub del port: https://github.com/AbrahamPaulJ/facefusion-mobile
- Proyecto upstream FaceFusion: https://github.com/facefusion/facefusion
- Modelos oficiales de FaceFusion en HuggingFace: https://huggingface.co/facefusion/models
- Sitio web de FaceFusion: https://facefusion.io/
