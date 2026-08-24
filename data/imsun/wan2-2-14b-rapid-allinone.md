# imsun/WAN2.2-14B-Rapid-AllInOne

## Resumen

WAN2.2-14B-Rapid-AllInOne es un modelo de generación de vídeo creado por el usuario imsun, que combina el modelo base Wan-AI/Wan2.2-I2V-A14B (y su variante T2V) con diversos aceleradores y adaptaciones de la comunidad, como WAN 2.2 Lightning, SkyReels y Lightx2v. El resultado es un "todo en uno" que permite generar vídeo a partir de texto, imagen, primer fotograma, último fotograma o una combinación de ambos, integrando además el VAE y el CLIP en un único archivo safetensors para simplificar su uso en ComfyUI. El modelo está pensado para ofrecer una generación rápida con solo 4 pasos y CFG 1, y se distribuye en precisión FP8.

El autor ha declarado que el modelo está deprecado y ya no recibe mantenimiento, aunque sigue disponible públicamente bajo licencia Apache 2.0. El repositorio contiene múltiples versiones (base, V2 a V10, MEGA, etc.) que mezclan distintos componentes de WAN 2.1 y 2.2, por lo que el tamaño total del repositorio es de aproximadamente 1,4 TB. A pesar de su estado, sigue siendo una opción interesante para quienes buscan una solución integrada de generación de vídeo con buena compatibilidad con LORAs de WAN 2.1 y 2.2.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión latente para vídeo (basado en Wan2.2-I2V-A14B y T2V-A14B) |
| Parametros totales | 14 mil millones (14B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (limitado por número de fotogramas, no especificado) |
| Tipos de cuantizacion | FP8 (nativo), GGUF (versión comunitaria) |
| Idiomas soportados | No disponible (probablemente inglés, no confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint único con modelo, VAE y CLIP), GGUF |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado desde cero, sino que es una fusión (merge) de varios modelos y aceleradores de la familia WAN 2.2. La arquitectura subyacente es la de un modelo de difusión latente para vídeo, que opera sobre representaciones comprimidas por un VAE. El checkpoint integra el modelo de difusión, el VAE y el CLIP en un solo archivo, lo que facilita su carga en ComfyUI mediante el nodo "Load Checkpoint". Las distintas versiones del repositorio combinan diferentes proporciones de WAN 2.1, WAN 2.2, SkyReels, Lightning y Lightx2v, buscando equilibrar calidad, adherencia al prompt y velocidad. No se han publicado detalles sobre los datos de entrenamiento originales, ya que se trata de un modelo derivado.

## Capacidades

- Generación de vídeo a partir de texto (T2V) y de imagen (I2V).
- Generación a partir del primer fotograma, del último fotograma o de ambos (first-to-last frame) mediante la integración de VACE.
- Compatibilidad con LORAs de WAN 2.1 y WAN 2.2 (tanto "low noise" como "high noise", aunque estos últimos requieren ajustes).
- Funciona con CFG 1 y 4 pasos de muestreo, lo que reduce drásticamente el tiempo de generación.
- Incluye VAE y CLIP en el mismo checkpoint, simplificando el flujo de trabajo.
- Soporta diferentes samplers (euler_a, sa_solver, beta scheduler) según la versión.
- Capacidad de funcionar en GPUs con 8 GB de VRAM según el autor, aunque con limitaciones.

## Casos de uso

- Creación de clips cortos para redes sociales: el modelo permite generar vídeos de 2 a 5 segundos a partir de una imagen fija o una descripción textual, ideal para contenido viral en plataformas como TikTok o Instagram Reels.
- Prototipado de animaciones para producción audiovisual: los equipos creativos pueden generar bocetos animados rápidamente a partir de storyboards o imágenes de referencia, acelerando la fase de preproducción.
- Generación de vídeos de producto para e-commerce: a partir de una fotografía del producto, se puede crear un vídeo mostrando el artículo desde distintos ángulos o con movimiento, sin necesidad de rodaje.
- Restauración y animación de imágenes históricas: usando la función I2V, se pueden animar fotografías antiguas para proyectos de divulgación cultural o educativa.
- Creación de fondos animados para presentaciones o webs: el modo T2V permite generar bucles de vídeo abstractos o ambientales a partir de descripciones, útiles para diseño gráfico.
- Investigación en generación de vídeo: al ser un modelo abierto y con múltiples variantes, sirve como banco de pruebas para estudiar el efecto de los merges y aceleradores en la calidad y velocidad de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas objetivas de calidad (FVD, CLIP score, etc.) ni comparativas con otros modelos. El rendimiento se describe de forma cualitativa en el changelog de versiones, indicando mejoras en ruido, adherencia al prompt y movimiento, pero sin datos numéricos.

## Requisitos de hardware

- VRAM mínima: según el autor, el modelo puede funcionar en 8 GB de VRAM, aunque probablemente con limitaciones de resolución o número de fotogramas.
- VRAM recomendada: para una experiencia fluida con resoluciones de 720p o superiores, se recomienda al menos 16 GB de VRAM (RTX 4080/4090, A5000, etc.).
- GPUs compatibles: cualquier GPU con soporte para FP8 (RTX 40xx, A100, H100) o que pueda ejecutar la versión GGUF en CPU/GPU mixta.
- Opciones de despliegue: ComfyUI es el entorno principal, usando el nodo "Load Checkpoint". También se puede usar con el runtime de WAN 2.2 o convertirlo a GGUF para llama.cpp/ollama (aunque no es un modelo de lenguaje).
- Latencia: no se proporcionan datos concretos, pero al usar 4 pasos y CFG 1, la generación es significativamente más rápida que los modelos estándar de difusión (típicamente 10-30 segundos para un clip corto en una GPU de gama alta).

## Comparativa con modelos similares

No se dispone de datos comparativos objetivos con otros modelos de generación de vídeo. Como referencia cualitativa, se puede comparar con el modelo base Wan2.2-I2V-A14B, que es más estable pero más lento, y con otros merges comunitarios como Phr00t/WAN2.2-14B-Rapid-AllInOne (que es una versión similar). La principal ventaja de este modelo es su integración todo-en-uno y su velocidad, mientras que la desventaja es su estado deprecado y la falta de documentación técnica detallada.

## Limitaciones y advertencias

- El modelo está deprecado y no recibe mantenimiento: el autor recomienda usar versiones más recientes de WAN 2.2.
- Puede presentar ruido o cambios de color en los primeros 1-2 fotogramas en modo I2V, especialmente en versiones anteriores a la V7.
- La compatibilidad con LORAs de WAN 2.1 es buena, pero los LORAs "high noise" de WAN 2.2 pueden causar artefactos.
- El tamaño del repositorio es enorme (1,4 TB) debido a las múltiples versiones; es recomendable descargar solo el checkpoint necesario.
- No hay información sobre sesgos o alucinaciones, al ser un modelo generativo de vídeo, pero puede producir contenido no deseado si no se controla el prompt.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo derivado, se deben respetar las licencias de los modelos base (Wan2.2, que también es Apache 2.0).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/imsun/WAN2.2-14B-Rapid-AllInOne
- Versión de Phr00t (similar): https://huggingface.co/Phr00t/WAN2.2-14B-Rapid-AllInOne
- Versión GGUF en ModelScope: https://www.modelscope.cn/models/AI-ModelScope/WAN2.2-14B-Rapid-AllInOne-GGUF
- Workflow en Civitai: https://civitai.com/models/1855273/wan22-14b-rapid-allinone-workflow-with-lora-and-color-match
- Modelo base Wan2.2-I2V-A14B: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
