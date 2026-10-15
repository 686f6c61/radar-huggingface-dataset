# CardAnvilModels/LaMa-ONNX

## Resumen

LaMa-ONNX es la versión en formato ONNX del modelo LaMa (big-lama), una red neuronal de inpainting de imágenes diseñada por Samsung AI Center y presentada en el artículo *Resolution-robust Large Mask Inpainting with Fourier Convolutions* (WACV 2022). El modelo recibe una imagen y una máscara que indica las zonas a rellenar, y devuelve la imagen reconstruida con contenido sintetizado de forma coherente con el entorno. Su innovación principal es el uso de convoluciones de Fourier, que le permiten capturar dependencias globales de la imagen sin necesidad de un campo receptivo enorme.

La ficha que se analiza aquí no es el modelo original, sino una copia inalterada de un único archivo (`lama_fp32.onnx`) procedente del repositorio `Carve/LaMa-ONNX`, publicado en el commit `c3c0c9e`. El autor, CardAnvilModels, la mantiene como copia congelada para que su aplicación web cargue siempre el mismo binario. El archivo tiene una entrada fija de 512 × 512 píxeles y las convoluciones de Fourier están implementadas como operaciones DFT nativas de ONNX, lo que la hace ejecutable en navegador mediante onnxruntime-web.

El modelo se distribuye con licencia Apache 2.0, el repositorio ocupa aproximadamente 0,2 GB y no registra descargas ni valoraciones en el momento de la consulta. Su relevancia práctica radica en que permite hacer inpainting en cliente (sin enviar imágenes a un servidor) dentro de un flujo puramente web, algo poco habitual en modelos de edición de imagen de calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red de inpainting feed-forward con convoluciones de Fourier (FFC) y skip connections; grafo ONNX con operaciones DFT para las capas de Fourier |
| Parámetros totales | no disponible (el repositorio contiene un único archivo fp32 de ~0,2 GB; el checkpoint big-lama original declara del orden de 51 M de parámetros) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de imagen fija de 512 × 512 píxeles |
| Tipos de cuantización | solo fp32 (`lama_fp32.onnx`); no se distribuyen variantes int8, fp16 ni otras |
| Idiomas soportados | no aplica (modelo de imagen; el campo de idiomas no está definido en el repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (un único archivo, `lama_fp32.onnx`) |

## Arquitectura y entrenamiento

LaMa emplea una arquitectura de inpainting basada en *Fast Fourier Convolutions* (FFC), que combinan una rama espacial con una rama espectral. La rama espectral aplica la transformada de Fourier sobre los mapas de características, realiza la convolución en el dominio de la frecuencia y vuelve al dominio espacial. Esto otorga al modelo un campo receptivo efectivo de alcance global desde las primeras capas, algo que en una CNN convencional requeriría apilar muchas capas o usar atención. La red es feed-forward y no necesita un discriminador en inferencia; en entrenamiento se apoya en una pérdida perceptual de alto campo receptivo basada en una red segmentadora preentrenada, en lugar de un GAN, lo que simplifica el despliegue. En esta versión ONNX, las operaciones de Fourier se traducen a operaciones DFT nativas del estándar ONNX.

Según la model card, el modelo original procede de LaMa (Samsung AI Center) y esta versión es un port a ONNX realizado por el usuario Carve. No se especifican en la información disponible el número de tokens o imágenes de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF o DPO (no aplicables a un modelo de inpainting). El artículo original de WACV 2022 detalla la metodología de entrenamiento, pero no se reproducen aquí sus cifras para no introducir datos no verificados.

## Capacidades

- Inpainting de imágenes: rellena regiones enmascaradas generando textura y estructura coherentes con el contexto.
- Eliminación de objetos: borra elementos no deseados de una imagen dada su máscara.
- Eliminación de marcas de agua: caso de uso declarado por el autor (limpieza de marcas en ilustraciones de cartas).
- Entrada de imagen a imagen con máscara binaria, a resolución fija de 512 × 512.
- Ejecución en navegador mediante onnxruntime-web, incluyendo posible uso de WebGPU o WASM.
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de modo de razonamiento, visión semántica, audio ni generación de texto.
- No es multilingüe ni procesa lenguaje; trabaja exclusivamente con píxeles y máscaras.

## Casos de uso

- Eliminación de marcas de agua en ilustraciones: es el uso declarado por el autor. Se enmascara la zona de la marca y el modelo rellena el hueco con la textura subyacente, todo dentro del navegador del usuario.
- Retoque fotográfico y eliminación de objetos: quitar personas, cables o señales de una fotografía enmascarando la zona, útil para edición rápida sin herramientas de escritorio.
- Restauración de fotografías antiguas: rellenar arañazos, manchas y zonas deterioradas aplicando el modelo por parches sobre la imagen escaneada.
- Edición de imagen en cliente con privacidad: al ejecutarse en web, las imágenes no salen del dispositivo del usuario, adecuado para material sensible que no puede subirse a un servidor.
- Limpieza de capturas y documentos: eliminar anotaciones, logotipos o elementos superpuestos en capturas de pantalla e imágenes de producto.
- Preprocesado de datasets: borrar marcas de agua o logotipos de imágenes de entrenamiento para evitar que el modelo aprenda a reproducirlos.
- Limpieza de fotos de producto en comercio electrónico: eliminar fondos residuales u objetos accesorios antes de publicar el catálogo.
- Generación de pares sintéticos para entrenar modelos de inpainting de mayor tamaño, usando la salida como imagen objetivo de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo original de LaMa (WACV 2022) incluye evaluaciones cuantitativas sobre Places y CelebA-HQ con distintas máscaras, pero no se transcriben aquí sus cifras al no estar presentes en los datos proporcionados.

## Requisitos de hardware

- Modelo en fp32 de ~0,2 GB: cabe holgadamente en memoria de cualquier GPU moderna.
- Estimación de VRAM en inferencia: por debajo de 2-4 GB para una entrada de 512 × 512, aunque el consumo real depende del backend y de las asignaciones intermedias de las capas FFC (valor estimado, no confirmado por el autor).
- Cabe en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y equivalentes, sin problema.
- Ejecución en CPU: viable gracias a onnxruntime-web (WASM), con latencia mayor; no se conocen cifras concretas.
- Ejecución en navegador: onnxruntime-web, con aceleración WASM o WebGPU según el navegador.
- Despliegue en servidor: cualquier runtime compatible con ONNX, como onnxruntime (Python, C++, C#), ONNX Runtime Web o TensorRT previa conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Cuantización | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| LaMa-ONNX (esta ficha) | Red FFC, feed-forward | 512 × 512 fija | fp32 | Apache 2.0 | ONNX | Hugging Face |
| LaMa (original, PyTorch) | Red FFC, feed-forward | Resolución arbitraria (por parches) | fp32 | Apache 2.0 | PyTorch | GitHub + Hugging Face |
| Carve/LaMa-ONNX | Red FFC, feed-forward | 512 × 512 fija | fp32 | Apache 2.0 | ONNX | Hugging Face (origen de esta copia) |
| MI-GAN | GAN ligera para inpainting | no disponible | no disponible | no disponible | no disponible | no disponible |
| MAT / ZITS | Transformer para inpainting | no disponible | no disponible | no disponible | no disponible | no disponible |

La tabla refleja únicamente los datos confirmados en la información proporcionada; para MI-GAN y los modelos basados en transformer no se dispone de especificaciones verificadas en este contexto, por lo que se marcan como no disponibles.

## Limitaciones y advertencias

- Resolución fija de 512 × 512: no admite entradas de otro tamaño sin redimensionar o aplicar procesado por parches, lo que puede degradar resultados en imágenes grandes.
- Invención de contenido: el modelo no "recupera" lo que había bajo la máscara, sino que sintetiza textura plausible. Puede fallar en estructuras rígidas como texto, caras, manos o líneas rectas.
- Sin comprensión semántica: no distingue objetos concretos, por lo que no puede reconstruir un elemento específico con fidelidad.
- Fidelidad del port ONNX: al ser una conversión, los resultados pueden diferir ligeramente de la implementación original en PyTorch.
- Uso ético y legal de la eliminación de marcas de agua: aunque el modelo permite retirarlas, su uso puede vulnerar derechos de autor o condiciones de licencia de las imágenes tratadas; conviene verificar el marco legal aplicable.
- Sesgos: no se documentan sesgos específicos en la información disponible, pero el modelo hereda las distribuciones del dataset de entrenamiento original, no descrito aquí.
- Solo fp32: no hay variantes cuantizadas que reduzcan el tamaño o aceleren la inferencia en hardware limitado.
- Repositorio sin mantenimiento aparente: es una copia congelada, sin actualizaciones ni soporte declarado por el autor.
- Metadatos incompletos: la fecha de creación registrada (2026) y la ausencia de descargas y valoraciones dificultan evaluar su adopción real.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar la licencia del modelo original y del port de origen para confirmar compatibilidad en un producto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CardAnvilModels/LaMa-ONNX
- Repositorio de origen del port ONNX: https://huggingface.co/Carve/LaMa-ONNX
- Commit exacto copiado: https://huggingface.co/Carve/LaMa-ONNX/tree/c3c0c9e468934d62e79c329e35d82dd09ff8c444
- Repositorio oficial de LaMa (Samsung AI Center): https://github.com/advimman/lama
- Organización del autor: https://github.com/Card-Anvil
- Artículo original: *Resolution-robust Large Mask Inpainting with Fourier Convolutions*, WACV 2022, https://arxiv.org/abs/2109.07161
