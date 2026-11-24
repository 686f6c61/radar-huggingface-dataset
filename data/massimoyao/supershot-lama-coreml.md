# massimoYao/supershot-lama-coreml

## Resumen

SuperShot LaMa Core ML es la conversión a Core ML del modelo LaMa (Large Mask Inpainting) de Roman Suvorov y coautores, empaquetada por massimoYao para su uso en la aplicación SuperShot. Se trata de un modelo de image-to-image especializado en inpainting: recibe una imagen y una máscara y rellena la región enmascarada con contenido sintetizado coherente con el entorno. La variante concreta incluida trabaja a una resolución de 800 × 800 píxeles y está pensada para la eliminación de objetos en dispositivos iOS.

El repositorio no contiene pesos en formato estándar de ecosistema Python, sino que replica byte a byte el archivo ZIP del paquete Core ML (`LaMa.mlpackage.zip`, 196.237.256 bytes) publicado originalmente por Daisuke Majima (john-rocky) en el repositorio `coreml-zoo`. La conversión a Core ML la realizó ese mismo autor; massimoYao solo redistribuye el artefacto para uso on-device. El tamaño total del repositorio es de 0,2 GB.

Su relevancia es acotada pero concreta: permite ejecutar inpainting de calidad en iPhone y iPad sin conexión a red ni servidores externos, algo útil para aplicaciones de edición fotográfica. La licencia Apache 2.0 facilita la integración comercial. No hay información sobre idiomas, benchmarks ni arquitectura interna más allá de la referencia al proyecto LaMa original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LaMa (Large Mask Inpainting), red generativa de inpainting; detalles internos no disponibles en la información proporcionada |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantización | no disponible; el artefacto es un paquete Core ML ya compilado |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (`.mlpackage` dentro de un ZIP) |

## Arquitectura y entrenamiento

LaMa es un modelo de inpainting basado en una red generativa con convoluciones de alto campo receptivo, diseñado específicamente para eliminar objetos y rellenar máscaras grandes. El proyecto original de Suvorov et al. se entrenó para que el modelo funcione bien incluso con máscaras de gran tamaño, algo que los enfoques previos resolvían con menor calidad. La información disponible no detalla el número de parámetros, la composición del dataset de entrenamiento ni si hubo fases de refinamiento posteriores.

La versión aquí publicada es una conversión a Core ML realizada por Daisuke Majima, orientada a inferencia on-device en iOS. No se documentan en esta ficha innovaciones técnicas adicionales (atención lineal, decodificación especulativa, etc.) porque no aparecen en la información proporcionada. El paquete se distribuye como ZIP íntegro con SHA-256 verificado, lo que garantiza que el artefacto es idéntico al publicado en `coreml-zoo`.

## Capacidades

- Inpainting de imágenes a resolución fija de 800 × 800 píxeles.
- Eliminación de objetos: dada una máscara, rellena la región con contenido coherente con el fondo.
- Pipeline image-to-image, adecuado para edición fotográfica.
- Ejecución on-device en iOS mediante Core ML (sin dependencia de servidores).
- No se documentan capacidades de texto, código, matemáticas, visión general, tool calling, agentes ni multilingüismo.

## Casos de uso

- Eliminación de objetos en apps de fotografía para iOS: el usuario pinta una máscara sobre un objeto no deseado y el modelo rellena la zona con el fondo circundante; encaja por su resolución de 800 × 800 y su formato Core ML nativo.
- Retoque rápido en edición de producto: limpiar imperfecciones o elementos distractores en fotos de catálogo antes de publicarlas, sin salir del dispositivo.
- Restauración básica de fotos: rellenar zonas dañadas o marcas en imágenes antiguas con máscaras definidas manualmente.
- Preprocesado en pipelines de visión: eliminar marcas de agua, logotipos o elementos temporales de imágenes antes de pasarlas a otro modelo.
- Herramientas de privacidad: eliminar rostros, matrículas o datos sensibles de fotos localmente, sin enviar imágenes a la nube.
- Funcionalidad integrada en apps de mensajería o redes sociales: borrado de objetos en la foto antes de compartirla, aprovechando la inferencia on-device y la licencia Apache 2.0 para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia on-device: requiere un dispositivo Apple compatible con Core ML (iPhone o iPad con Neural Engine recomendado).
- VRAM/RAM estimada: no disponible; el paquete pesa aproximadamente 196 MB comprimido, por lo que la huella en memoria será del orden de cientos de MB, aunque no se especifica.
- GPU recomendadas: no aplica en el sentido de GPU de servidor; el destino es el hardware Apple (A-series/M-series).
- ¿Cabe en consumer GPU? No es el caso de uso; está pensado para hardware Apple, no para GPUs NVIDIA/AMD.
- Opciones de despliegue: Core ML en iOS/iPadOS/macOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no son aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Resolución | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SuperShot LaMa Core ML (este) | Inpainting | 800 × 800 | Core ML | Apache 2.0 | Hugging Face |
| LaMa original (advimman/lama) | Inpainting | variable | PyTorch | Apache 2.0 | GitHub |
| LaMa-CoreML (mlboydaisuke) | Inpainting | no disponible | Core ML | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en inpainting; no sirve para generación de texto, razonamiento ni otras tareas.
- Resolución fija de 800 × 800: imágenes de otras dimensiones requerirán redimensionado, con posible pérdida de detalle.
- No hay información sobre sesgos del modelo ni sobre el dataset de entrenamiento, por lo que no se puede evaluar su comportamiento en dominios concretos.
- Riesgo de artefactos o resultados poco realistas en máscaras muy grandes o en zonas con estructuras complejas (texto, caras, patrones repetitivos), aunque no se documenta explícitamente.
- Dependencia total del ecosistema Apple: el paquete Core ML no se ejecuta en Linux, Windows ni Android sin conversión adicional.
- La licencia Apache 2.0 permite uso comercial, pero el autor de esta réplica no ofrece garantías ni soporte; conviene verificar la licencia del proyecto original y de la conversión de origen.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria conocida.

## Enlaces

- [Hugging Face: massimoYao/supershot-lama-coreml](https://huggingface.co/massimoYao/supershot-lama-coreml)
- [Proyecto original LaMa](https://github.com/advimman/lama)
- [Model card de la conversión Core ML (mlboydaisuke/LaMa-CoreML)](https://huggingface.co/mlboydaisuke/LaMa-CoreML)
- [ZIP de origen en coreml-zoo](https://huggingface.co/mlboydaisuke/coreml-zoo/resolve/faa0b7bff20b2c848f0eb3a333aad34dde7904eb/lama/LaMa.mlpackage.zip)
- [Licencia Apache 2.0](https://huggingface.co/massimoYao/supershot-lama-coreml/blob/main/LICENSE)
