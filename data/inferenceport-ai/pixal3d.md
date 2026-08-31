# inferenceport-ai/Pixal3D

## Resumen

Pixal3D es un modelo de generación de activos 3D a partir de una única imagen, desarrollado por un equipo conjunto de la Universidad de Tsinghua (BNRist), Tencent ARC Lab y la Universidad Victoria de Wellington. El trabajo fue aceptado en SIGGRAPH 2026 y se distribuye bajo licencia MIT. Su principal innovación consiste en elevar explícitamente las características de píxeles de la imagen al espacio 3D mediante retroproyección (back-projection), estableciendo correspondencias directas píxel-a-3D, en lugar de inyectar características de imagen de forma laxa mediante mecanismos de atención como hacen los métodos anteriores. Esto permite una fidelidad cercana a la reconstrucción, con geometría detallada y texturas PBR.

El modelo se entrena como una cascada de tres etapas que aumentan progresivamente la resolución: estructura dispersa (32→64), forma (256→512→1024) y textura (256→512→1024). Existen dos ramas principales: la rama `main`, basada en el backbone Trellis.2 de Microsoft, y la rama `paper`, que reproduce los resultados del artículo original basado en Direct3D-S2. El repositorio en HuggingFace tiene un tamaño de 24 GB e incluye código de inferencia, entrenamiento y un pipeline de tipo image-to-3d. No se especifican el número de parámetros, la longitud de contexto ni los idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline en cascada de tres etapas (estructura dispersa, forma y textura) con retroproyección de características de píxeles; backbone Trellis.2 en la rama `main` y Direct3D-S2 en la rama `paper` |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de visión 3D, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio contiene pesos de 24 GB, formato no especificado) |

## Arquitectura y entrenamiento

Pixal3D utiliza un enfoque de retroproyección de características de píxeles al espacio 3D. En lugar de depender únicamente de atención cruzada entre la imagen y el volumen 3D, el modelo proyecta físicamente los píxeles de la imagen de entrada a coordenadas 3D, creando correspondencias directas que guían la generación. Esto permite que la información visual de la imagen se integre de forma más precisa en la geometría y las texturas del objeto generado.

El entrenamiento se organiza en tres etapas en cascada, cada una con resoluciones crecientes: la primera etapa genera una estructura dispersa (vóxeles) a resoluciones 32 y 64; la segunda modela la forma a resoluciones 256, 512 y 1024; la tercera genera texturas a las mismas resoluciones. Todas las etapas utilizan configuraciones con prefijos que indican el uso de proyección pixel-alineada (`proj_finetune`). El código de entrenamiento y las herramientas de preparación de datos se publicaron en mayo de 2026. No se especifican el número total de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO, ya que se trata de un modelo generativo 3D y no de un LLM.

## Capacidades

- Generación de mallas 3D (formato GLB) a partir de una única imagen de entrada.
- Producción de texturas PBR (Physically Based Rendering) con geometría detallada.
- Soporte de dos modos de inferencia: estándar (resolución 1536) y modo de baja VRAM (resolución 1024), con posibilidad de forzar la resolución manualmente.
- Compatibilidad con backend de atención SDPA de PyTorch si no se dispone de `flash_attn`.
- Incluye una demo web interactiva basada en Gradio alojada en HuggingFace Spaces.
- Proporciona código completo de entrenamiento y un toolkit de preparación de datos para reproducir el modelo desde cero.
- Disponible en dos variantes: la rama `main` (basada en Trellis.2, con mejor rendimiento) y la rama `paper` (reproducción exacta de los resultados del artículo SIGGRAPH 2026).

## Casos de uso

- Creación de activos 3D para videojuegos: los desarrolladores pueden generar mallas y texturas PBR a partir de bocetos o renders conceptuales, acelerando el prototipado de personajes, props y escenarios.
- Diseño de producto y visualización industrial: a partir de una fotografía de un producto existente, se genera un modelo 3D utilizable para catálogos, configuradores o documentación técnica.
- Producción cinematográfica y de animación: los artistas pueden convertir imágenes de referencia en modelos 3D preliminares para previsualización, reduciendo el tiempo de modelado manual.
- Comercio electrónico y realidad aumentada: generar modelos 3D de productos a partir de fotos para visualizaciones interactivas en tiendas online o aplicaciones de RA.
- Arqueología y preservación del patrimonio: reconstruir digitalmente objetos o artefactos a partir de fotografías, facilitando su estudio y difusión sin manipulación física.
- Educación y formación técnica: crear modelos 3D didácticos a partir de imágenes para simuladores, laboratorios virtuales o materiales de aprendizaje interactivos.
- Impresión 3D: convertir imágenes de objetos en mallas listas para imprimir, siempre que la geometría generada sea adecuada para fabricación aditiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio menciona que la rama `main` ofrece "mejor rendimiento" que la rama `paper`, pero no se proporcionan métricas cuantitativas (como PSNR, FID, o métricas de calidad geométrica) en la documentación accesible.

## Requisitos de hardware

- El repositorio tiene un tamaño de 24 GB, lo que sugiere que los pesos completos requieren al menos esa cantidad de almacenamiento.
- Se ofrece un modo de baja VRAM que reduce el pico de memoria cargando los modelos bajo demanda, con una resolución por defecto de 1024 en lugar de 1536.
- No se especifican GPUs concretas recomendadas, pero la dependencia de `natten` (atención vecinal) y `flash_attn` indica que se requiere una GPU NVIDIA con soporte CUDA.
- El archivo `requirements-hfdemo.txt` está pensado para la arquitectura H-series de GPU en HuggingFace Spaces, lo que sugiere compatibilidad con GPUs como H100.
- Opciones de despliegue: inferencia por línea de comandos (`inference.py`), demo web Gradio (`app.py`), y demo online alojada en HuggingFace Spaces.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de generación imagen-a-3D (como Direct3D-S2, Trellis.2 o LRM). El propio modelo se basa en estos backbones, por lo que se puede considerar una mejora sobre ellos, pero no hay datos de rendimiento publicados en la información disponible.

## Limitaciones y advertencias

- La información disponible no detalla sesgos conocidos, pero al ser un modelo generativo entrenado con datos de imágenes, puede heredar sesgos de los datos de entrenamiento (por ejemplo, en la representación de objetos de ciertas categorías o estilos).
- Riesgo de alucinación geométrica: al generar 3D a partir de una sola imagen, el modelo puede inventar geometría en zonas no visibles de la imagen, lo que debe validarse para usos profesionales.
- La licencia MIT permite uso comercial, pero el campo `extra_gated_eu_disallowed: true` en la model card sugiere que puede haber restricciones adicionales para usuarios de la Unión Europea, aunque no se detalla su alcance.
- La instalación requiere dependencias específicas (`natten`, `flash_attn`, `utils3d`) que pueden no estar disponibles en todas las plataformas o arquitecturas de GPU.
- El modo de baja VRAM reduce la resolución por defecto a 1024, lo que puede afectar a la calidad de la geometría y texturas generadas.
- No se especifican los idiomas soportados ni la interfaz de usuario, aunque la demo y el código están en inglés.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inferenceport-ai/Pixal3D
- Repositorio oficial en GitHub: https://github.com/TencentARC/Pixal3D
- Página del proyecto: https://ldyang694.github.io/projects/pixal3d/
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/TencentARC/Pixal3D
- Modelos oficiales en HuggingFace: https://huggingface.co/TencentARC/Pixal3D
- Artículo en arXiv: https://arxiv.org/abs/2605.10922
- Sitio web no oficial de demostración: https://pixal3d.net/
- Sitio web comercial de terceros: https://www.pixal3d.app/en
- Otro sitio de terceros: https://pixal3d.ai/ y https://pixal3d.art/
