# addlabsviral/Qwen-Image-Edit-2511-Lightning-8bit

## Resumen

El modelo `addlabsviral/Qwen-Image-Edit-2511-Lightning-8bit` es una cuantización a 8 bits de `Qwen-Image-Edit-2511-Lightning`, una variante optimizada del modelo de edición de imágenes `Qwen-Image-Edit-2511` desarrollado por Alibaba Qwen. La variante Lightning aplica destilación de pasos y técnicas de cuantización para reducir los recursos necesarios en inferencia, manteniendo la capacidad de realizar ediciones imaginativas sobre imágenes de entrada. El modelo se distribuye en formato `safetensors` e integra el pipeline `QwenImageEditPlusPipeline` de la librería Diffusers, por lo que se usa como modelo de tipo `image-to-image`.

Con aproximadamente 20.435 millones de parámetros, este modelo está pensado para tareas de edición de imagen donde se requiere coherencia del personaje: permite modificar fondos, iluminación o elementos de una escena preservando la identidad del sujeto. Su relevancia actual radica en ofrecer una alternativa más ligera a los modelos de edición de imagen de gran tamaño, acelerando el tiempo de generación y reduciendo el consumo de VRAM. Sin embargo, la información disponible sobre este repositorio es muy limitada: no se han publicado detalles de entrenamiento, evaluación ni licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para edición de imágenes (arquitectura exacta no especificada) |
| Parametros totales | 20.435.949.184 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de imagen, no aplica contexto de tokens) |
| Tipos de cuantizacion | 8-bit |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un sistema de difusión para `image-to-image`, heredado de la familia `Qwen-Image-Edit`. La variante Lightning aplica destilación de pasos para reducir el número de iteraciones necesarias en la generación, lo que mejora la latencia de inferencia frente al modelo original. La cuantización a 8 bits reduce el tamaño de los pesos y el consumo de memoria, facilitando el despliegue en hardware con menor VRAM. No se dispone de información sobre los datos de entrenamiento, la composición del dataset, ni sobre procesos de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas en la model card.

## Capacidades

- Edición de imágenes a partir de una imagen de entrada y una instrucción de texto, mediante el pipeline `QwenImageEditPlusPipeline` de Diffusers.
- Consistencia de personajes mejorada: puede realizar ediciones creativas sobre retratos manteniendo la identidad y las características visuales del sujeto, según lo indicado en la documentación del modelo original.
- Compatibilidad con cuantización 8-bit, lo que reduce los requisitos de VRAM y el tiempo de carga del modelo.
- No se ha documentado soporte de tool calling, agents ni capacidades multilingües.
- No se ha publicadado evidencia de capacidades fuera de la edición de imágenes.

## Casos de uso

- Edición de retratos con identidad preservada: el modelo permite cambiar el fondo, la iluminación o la expresión de una fotografía manteniendo los rasgos faciales del sujeto, lo que resulta útil en estudios fotográficos y perfiles profesionales.
- Variantes creativas de imágenes de producto: a partir de una foto de un producto, se pueden generar escenarios distintos (naturaleza, interiores, ciudad) sin alterar el producto, agilizando la creación de catálogos digitales.
- Concept art y previsualización: un artista puede partir de un boceto o de una imagen de referencia y solicitar cambios de estilo o perspectiva, manteniendo la coherencia del personaje a lo largo de la exploración.
- Retoque en producción audiovisual: permite modificar el atrezo o el entorno de un fotograma sin recrear la escena desde cero, reduciendo el tiempo de postproducción.
- Contenido para redes sociales: los creadores pueden transformar una selfie en una ilustración estilizada o adaptar el escenario de una foto a un tema concreto de forma rápida.
- Creación de personajes para juegos o cómics: la consistencia de personajes mejorada ayuda a mantener la apariencia de un personaje a través de varias viñetas o escenas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 20.435 millones de parámetros en 8 bits, los pesos ocupan aproximadamente 20,4 GB; sumando activaciones y el pipeline, se estima un requisito de 25–30 GB de VRAM para una ejecución completa.
- GPU recomendadas: A100 40GB, H100 80GB, RTX 6000 Ada de 48GB o A6000 de 48GB.
- En GPUs de consumo, la RTX 4090 con 24GB puede quedarse insuficiente para la carga completa del modelo; se podría intentar con offloading de CPU o reducción de la resolución, pero no es una configuración recomendada.
- Opciones de despliegue: Diffusers con el pipeline `QwenImageEditPlusPipeline`; los pesos en `safetensors` permiten su carga directa con PyTorch.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|
| `Qwen-Image-Edit-2511` | No disponible | No disponible | No disponible | Hugging Face (Qwen) |
| `Qwen-Image-Edit-2511-Lightning` | No disponible | No disponible | No disponible | Hugging Face (lightx2v) |
| `addlabsviral/Qwen-Image-Edit-2511-Lightning-8bit` | 20.435.949.184 | 8-bit | No disponible | Hugging Face (addlabsviral) |

Los tres modelos pertenecen a la misma familia. Este repositorio se diferencia por ser una versión cuantizada a 8 bits de la variante Lightning, lo que lo hace más ligero en memoria, pero sin datos disponibles sobre rendimiento comparativo.

## Limitaciones y advertencias

- No existe información publicada sobre sesgos, evaluación o datos de entrenamiento específicos de este modelo.
- Riesgo de alucinaciones visuales: el modelo puede generar ediciones incorrectas o artefactos no deseados, al no haber una evaluación publicada.
- La licencia es desconocida, lo que impide garantizar la viabilidad de un uso comercial.
- El repositorio ha sido subido por un usuario no oficial (`addlabsviral`) y no por el equipo de Qwen; no hay verificación de integridad ni de seguridad de los pesos.
- El modelo solo está indicado para tareas de edición de imágenes; no hay evidencia de capacidades en otras modalidades.
- El tamaño del repositorio es de 32,6 GB, lo que requiere espacio en disco considerable para la descarga y el despliegue.

## Enlaces

- https://huggingface.co/addlabsviral/Qwen-Image-Edit-2511-Lightning-8bit
- https://huggingface.co/lightx2v/Qwen-Image-Edit-2511-Lightning
- https://huggingface.co/Qwen/Qwen-Image-Edit-2511
