# moonbox-dev/moebius

## Resumen

Moebius es un modelo de inpainting (eliminación de objetos y reparación de daños en imágenes) desarrollado originalmente por HUST Vision Lab y publicado en el repositorio `hustvl/Moebius`. La variante aquí documentada, `moonbox-dev/moebius`, es un repaquetado no oficial realizado por Moonbox para su aplicación de escritorio, en el que los UNets de inpainting y el VAE se han convertido a MLX y Core ML para su ejecución en Apple Silicon, y a grafos ONNX para el motor de Windows.

El modelo se distribuye en tres variantes: General (variante `pretrained`), Scenes (fine-tune `ft_places2` sobre Places2) y Faces (fine-tune `ft_ffhq` sobre FFHQ). El UNet de inpainting tiene 0,22 mil millones de parámetros y utiliza el VAE de PixelHacker (un VAE SDXL congelado) como codificador/decodificador latente. La tarea principal es la eliminación de objetos y la reconstrucción de zonas dañadas: todo lo que queda fuera del área seleccionada por el usuario se preserva sin cambios.

Este repositorio no es un lanzamiento oficial del modelo original, sino un paquete de artefactos listos para consumir por la app Moonbox. Resulta relevante para desarrolladores que quieran integrar inpainting de alta calidad en aplicaciones de escritorio sobre macOS (MLX/Core ML) o Windows (ONNX), con pesos ya convertidos y verificados mediante una lista firmada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de inpainting (difusión latente) + VAE (PixelHacker, VAE SDXL congelado) |
| Parametros totales | 0,22 B (UNet de inpainting); VAE no especificado en la información disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | fp16 (VAE); cuantización MLX/Core ML/ONNX según artefacto, sin detalle numérico publicado |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | Apache 2.0 (UNets Moebius); MIT (VAE PixelHacker/SDXL); MIT (BiRefNet); Apache 2.0 (SAM 2.1); BSD 3-Clause (Mask R-CNN) |
| Formato de pesos | safetensors, npz, Core ML, ONNX |

## Arquitectura y entrenamiento

El componente central es un UNet de inpainting de 0,22 B de parámetros que opera en el espacio latente de un VAE. El VAE utilizado es el de PixelHacker, descrito en la model card como un VAE SDXL congelado, distribuido en fp16 y también en formato Core ML. El pipeline es de tipo image-to-image: se enmascara la región a reparar, se codifica la imagen en latentes, el UNet predice la reconstrucción condicionada por la máscara y el VAE decodifica el resultado. La model card indica que todo lo que queda fuera de la zona cepillada se mantiene intacto.

El repositorio incluye tres variantes del UNet: la variante `pretrained` (General) y dos fine-tunes, `ft_places2` (Scenes, entrenado sobre Places2) y `ft_ffhq` (Faces, entrenado sobre FFHQ). No se detallan en la información proporcionada el número de tokens/pasos de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF/DPO (no aplicables habitualmente a difusión, pero no confirmado). Tampoco se especifican innovaciones como decodificación especulativa o atención lineal. El repositorio añade además componentes auxiliares para el motor de Windows: BiRefNet (selección de sujeto), SAM 2.1 Hiera Tiny (selección de objetos) y Mask R-CNN ResNet-50 FPN v2 (COCO) convertido a safetensors.

## Capacidades

- Inpainting de imágenes: eliminación de objetos y reparación de zonas dañadas preservando el resto de la imagen.
- Tres modos especializados: General (uso genérico), Scenes (escenas y paisajes, fine-tune Places2) y Faces (rostros, fine-tune FFHQ).
- Pipeline image-to-image con máscara de entrada.
- Ejecución en Apple Silicon mediante MLX y Core ML; ejecución en Windows mediante grafos ONNX.
- Selección automática de sujeto (BiRefNet) y de objetos (SAM 2.1 Hiera Tiny) en el motor de Windows.
- Segmentación auxiliar con Mask R-CNN (ResNet-50 FPN v2, COCO) en el motor de Windows.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).

## Casos de uso

- Eliminación de objetos en fotografía de producto: el usuario cepilla el objeto no deseado y el UNet General reconstruye el fondo, manteniendo intacto el resto de la escena.
- Restauración de fotografías antiguas o dañadas: la variante General repara arañazos y zonas deterioradas sin alterar las áreas sanas.
- Limpieza de fondos en retratos: la variante Faces (ft_ffhq) está especializada en reconstruir piel y rasgos faciales al eliminar elementos superpuestos en retratos.
- Edición de paisajes y arquitectura: la variante Scenes (ft_places2) está entrenada sobre Places2, adecuada para eliminar elementos no deseados en escenas urbanas y naturales.
- Integración en aplicaciones de escritorio: los artefactos MLX/Core ML permiten desplegar inpainting local en macOS sin conexión, y los ONNX en Windows.
- Preprocesado en pipelines de visión por computador: eliminación de marcas de agua, logos o elementos distractores antes de tareas de detección o segmentación posteriores.
- Herramientas de edición creativa: borrado rápido de objetos en flujos de diseño gráfico o retoque fotográfico dentro de la app Moonbox.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el UNet de 0,22 B en fp16 requiere del orden de 0,5 GB solo para pesos, más el VAE y los latentes. El tamaño total del repo es de 4,1 GB, que incluye las tres variantes y los formatos MLX, Core ML y ONNX.
- GPU recomendadas: no especificadas en la información proporcionada.
- Cabe en GPU de consumo: probablemente sí dada la magnitud del UNet, pero no se confirma en la información disponible.
- Opciones de despliegue: MLX (macOS/Apple Silicon), Core ML (macOS), ONNX Runtime (Windows), integración directa en la app Moonbox.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones de modelos comparables en la información proporcionada. A continuación se indican alternativas de la misma categoría (inpainting) con los datos conocidos de la información disponible:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Moebius (este repo) | 0,22 B (UNet) | no aplica | Apache 2.0 (UNet) / MIT (VAE) | Hugging Face, MLX/Core ML/ONNX |
| PixelHacker | no disponible | no aplica | MIT (VAE) | Hugging Face (`hustvl/PixelHacker`) |
| BiRefNet | no disponible | no aplica | MIT | Hugging Face (`ZhengPeng7/BiRefNet`) |
| SAM 2.1 Hiera Tiny | no disponible | no aplica | Apache 2.0 | Hugging Face (`facebook/sam2.1-hiera-tiny`) |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas alternativas.

## Limitaciones y advertencias

- Este repositorio no es un lanzamiento oficial: es un repaquetado de Moonbox, con conversiones, cuantizaciones y reempaquetados propios; no debe tratarse como los pesos originales.
- Las variantes Scenes (ft_places2) y Faces (ft_ffhq) se entrenaron sobre Places2 y FFHQ, datasets liberados para uso de investigación y no comercial; la model card advierte que el uso comercial debe evaluarse por el usuario.
- BiRefNet (pesos generales) se entrenó sobre DIS5K, también no comercial.
- Riesgo de artefactos y alucinación visual en regiones grandes o con texturas complejas; no se documentan métricas de fidelidad en la información disponible.
- No es un modelo de lenguaje: no soporta contexto textual, tool calling, agentes ni capacidades multilingües.
- La licencia Apache 2.0 del UNet no cubre necesariamente las obligaciones derivadas de los datasets de entrenamiento; conviene revisar cada licencia listada en `LICENSE`.
- Para producción, verificar la integridad de los artefactos contra la lista firmada que menciona la model card.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/moebius
- Modelo base Moebius (HUST Vision Lab): https://huggingface.co/hustvl/Moebius
- PixelHacker (VAE): https://huggingface.co/hustvl/PixelHacker
- BiRefNet: https://huggingface.co/ZhengPeng7/BiRefNet
- SAM 2.1 Hiera Tiny: https://huggingface.co/facebook/sam2.1-hiera-tiny
- torchvision (Mask R-CNN): https://github.com/pytorch/vision
- App Moonbox: https://moonbox.dev
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia MIT: https://opensource.org/license/mit
- Licencia BSD 3-Clause: https://opensource.org/license/bsd-3-clause
