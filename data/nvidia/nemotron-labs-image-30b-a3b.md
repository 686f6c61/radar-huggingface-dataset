# nvidia/Nemotron-Labs-Image-30B-A3B

## Resumen

Nemotron-Labs-Image-30B-A3B es el componente de generación de imágenes raster del framework Nemotron-Labs-VisualCreation, desarrollado por NVIDIA. El modelo implementa la interfaz "Pixel as Code", un enfoque agéntico que unifica tokens visuales aprendidos (para la apariencia raster) con programas explícitos (SVG, HTML/CSS, código de ploteo) para producir artefactos visuales tanto imágenes como estructuras editables. Se distribuye bajo licencia NVIDIA y requiere `trust_remote_code` al emplear la arquitectura propietaria `nemotron_h`.

Con 32.634.904.896 parámetros totales en formato safetensors (repo de 133,2 GB) y una designación "A3B" que sugiere un esquema de mezcla de expertos con aproximadamente 3 mil millones de parámetros activos, el modelo se posiciona como un generador de imágenes autorregresivo de gran escala. La model card lo presenta como parte de un ecosistema más amplio que incluye tokenizador visual, harness de renderizado y auditoría visual basada en navegador.

La relevancia actual radica en su enfoque híbrido: no solo genera píxeles, sino que razona sobre la familia de artefacto, la representación y el backend de renderizado antes de producir la salida, lo que lo orienta a casos de creación visual agéntica más que a simple text-to-image.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nemotron_h (transformer autorregresivo con integración de tokens visuales; detalles completos no disponibles) |
| Parametros totales | 32.634.904.896 |
| Parametros activos | no disponible (la nomenclatura A3B sugiere ~3B activos, sin confirmación oficial en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA License (other; enlace a NVIDIA OneWay Noncommercial License en la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible describe el modelo como el generador de imágenes raster del framework VisualCreation, que combina tokens visuales discretos con programas explícitos. El pipeline declarado es `text-to-image` y la arquitectura registrada es `nemotron_h`, una familia propia de NVIDIA que requiere código personalizado (`custom_code`) y `trust_remote_code` en transformers. La model card menciona componentes especializados para tokenización visual, generación autorregresiva de imágenes y codificación visual estructurada, pero no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

El diseño "Pixel as Code" establece tres principios: representar apariencia (tokens raster) y estructura (marcado editable) por separado; planificar el entregable mediante enrutamiento que selecciona familia de artefacto, representación, backend de renderizado y política de activos; y usar evidencia renderizada para selección visual y auditorías en navegador que diagnostican problemas y asignan reparaciones dirigidas. No se especifican innovaciones de atención, decodificación especulativa ni detalles del tokenizador visual más allá de su existencia.

## Capacidades

- Generación de imágenes raster autorregresiva a partir de prompts de texto.
- Creación de artefactos visuales editables: páginas web, presentaciones, documentos, gráficos y figuras científicas (a través del framework VisualCreation, del que este modelo es el componente raster).
- Composición de texto en imagen, infografías ilustradas, retratos, tipografía estilizada y fotografía de producto (según los ejemplos de la model card).
- Planificación del entregable: enrutamiento de familia de artefacto, representación y backend de renderizado.
- Selección visual entre candidatos raster y auditoría visual basada en navegador para artefactos estructurados.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo thinking explícito, visión o audio: no disponible.

## Casos de uso

- Generación de infografías para marketing: el modelo produce composiciones raster con texto integrado, adecuadas para piezas divulgativas donde se requiere tipografía legible y jerarquía visual, según los ejemplos publicados en la galería.
- Creación de figuras científicas: dentro del framework VisualCreation, puede generar figuras raster para publicaciones, complementando la vía estructurada de código de ploteo cuando se prefiere una salida de imagen final.
- Prototipado de material gráfico de producto: genera imágenes de producto y bodegones estilizados que sirven como borradores rápidos antes de la producción final con herramientas de diseño.
- Composición de tipografía decorativa: útil para carteles, portadas y material editorial donde se necesita texto estilizado integrado en la imagen.
- Retratos e ilustración de personajes: aplicable a generación de avatares, ilustraciones editoriales y contenido conceptual para narrativa o videojuegos en fase de preproducción.
- Enrutamiento agéntico de entregables visuales: en un pipeline que reciba una petición de "crea una landing page con hero image", el modelo puede generar la imagen raster mientras el harness gestiona el marcado HTML/CSS y la auditoría de renderizado.
- Generación de assets para presentaciones: creación de fondos, ilustraciones y gráficos raster que se incorporan a diapositivas generadas por el componente estructurado del framework.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de resultados y referencias a varios papers (arXiv:2610.38095, arXiv:2606.15007, arXiv:2606.02800, arXiv:2503.15558, arXiv:2611.31358), pero los valores numéricos no se han proporcionado en el material accesible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 32,6 mil millones de parámetros, en FP16 requeriría aproximadamente 65 GB solo para pesos, más overhead de activaciones y KV cache; en cuantización de 8 bits rondaría 33 GB y en 4 bits unos 17 GB, aunque estas cifras son estimaciones genéricas y no están confirmadas por el autor.
- GPU recomendadas: no disponible de forma oficial. Por tamaño, GPUs de数据中心 como A100 80 GB o H100 80 GB serían las candidatas naturales; no hay confirmación de soporte multi-GPU ni de tensor parallelism.
- ¿Cabe en GPU de consumo? No disponible. Un modelo de ~32B en 4 bits podría caber en una RTX 4090 (24 GB) en teoría, pero la arquitectura `nemotron_h` con código personalizado y el tokenizador visual añaden incertidumbre sobre el consumo real.
- Opciones de despliegue: la librería declarada es transformers con `trust_remote_code=True`. No se confirma soporte para vLLM, llama.cpp, Ollama o TGI; dado el pipeline text-to-image y la arquitectura propietaria, es probable que el soporte sea limitado a transformers en el momento de la publicación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (generación de imágenes autorregresiva de ~30B con enfoque agéntico) ni datos de rendimiento que permitan una comparación rigurosa. Los resultados de búsqueda web obtenidos corresponden a páginas corporativas genéricas de NVIDIA y no aportan alternativas técnicas.

## Limitaciones y advertencias

- Licencia: la model card enlaza a la NVIDIA OneWay Noncommercial License, lo que sugiere restricciones para uso comercial. Es imprescindible revisar el archivo LICENSE del repositorio antes de cualquier despliegue en producción.
- Idiomas soportados: no disponibles; no se puede garantizar calidad multilingüe en los prompts.
- Riesgo de alucinación visual: como generador autorregresivo de imágenes, puede producir texto ilegible, geometrías inconsistentes o elementos incoherentes, especialmente en composiciones con mucho texto.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; los modelos generativos de imágenes suelen heredar sesgos de sus datos de entrenamiento.
- Requiere `trust_remote_code`: la arquitectura `nemotron_h` con código personalizado implica ejecutar código del autor, con el riesgo de seguridad asociado.
- Contexto y límites de prompt: no disponibles; se desconoce la longitud máxima de prompt soportada.
- Madurez del ecosistema: con 7 descargas y 10 likes en el momento de la consulta, el soporte comunitario y las integraciones de terceros son mínimos.
- El modelo es solo el componente raster de un framework mayor; muchas de las capacidades descritas (artefactos editables, auditoría visual) dependen del harness completo, no del checkpoint aislado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/Nemotron-Labs-Image-30B-A3B
- Paper (PDF): https://huggingface.co/nvidia/Nemotron-Labs-Image-30B-A3B/resolve/main/paper.pdf
- Galería VisualCreation: https://fuxiaoliu-nemotron-labs-visualcreation-gallery.static.hf.space/index.html
- Galería de generación de imágenes: https://fuxiaoliu-nemotron-labs-visualcreation-gallery.static.hf.space/image-generation/index.html
- Licencia NVIDIA OneWay Noncommercial: https://developer.download.nvidia.com/licenses/NVIDIA-OneWay-Noncommercial-License-22Mar2022.pdf
- arXiv:2610.38095 (referenciado en los tags)
- arXiv:2606.15007 (referenciado en los tags)
- arXiv:2606.02800 (referenciado en los tags)
- arXiv:2503.15558 (referenciado en los tags)
- arXiv:2611.31358 (referenciado en los tags)
